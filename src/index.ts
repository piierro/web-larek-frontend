import './scss/styles.scss';

import { ProductAPI } from './components/ProductApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { Model } from './components/base/Model';
import { IOrderForm, IProductItem } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { AppState, ProductItem, CatalogChangeEvent } from "./components/AppData";
import { Card } from "./components/Card";
import { Modal } from "./components/common/Modal";
import { Success } from "./components/common/Success";
import { Order, IContactForm, IDeliveryForm } from "./components/Order";
import { Basket } from './components/common/Basket';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

// Модель данных приложения
const appData = new AppState({}, events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketModal = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events)
// const success = new Success(cloneTemplate(successTemplate), events); 
const order = new Order(cloneTemplate(orderTemplate), events);

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
			description: item.description
		});
	});
});

// Открыть карточку
events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});

// превью карточки
events.on('preview:changed', (item: ProductItem) => {
	const showItem = (item: ProductItem) => {
		const card = new Card(cloneTemplate(cardPreviewTemplate), {
			onClick: () => events.emit('card:add', item),
		});

		modal.render({
			content: card.render({
				title: item.title,
				image: item.image,
				price: item.price,
				category: item.category,
				description: item.description
			}),
		});
	};
	if (item) {
		api.getCardItem(item.id)
			.then(() => {showItem(item);})
			.catch((err) => {console.error(err);});
	} else {
		modal.close();
	}
});

events.on('basket:open', () => {
	basket.items = appData.basket.map((item) => {
		const card= new Card(cloneTemplate(cardBasketModal), {
			onClick: () => {
			 appData.removeFromBusket(item);
			 events.emit('card:remove');
			}
		});
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	modal.render({
		content: basket.render({
			total: appData.getTotal(),
		}),
	});
});

// добавить товар в корзину
events.on('card:add', (item: ProductItem) => {
	appData.addToBasket(item);
	page.counter = appData.basket.length;
	modal.close();
});

// удаление товара из корзины
events.on('card:remove', (item: ProductItem) => {
	appData.removeFromBusket(item);
	page.counter = appData.basket.length;
});

events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
	// appData.order.total = appData.getTotal();
	// order.payment = appData.order.payment;
	// // appData.order.items = appData.basket.map((item) => item.id);
});

// валидации второй формы 
events.on('formErrorsContact:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    order.valid = !email && !phone;
    order.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactForm; value: string }) => {
		appData.setContactField(data.field, data.value);
	}
);
//валидация первой формы
events.on('formErrorsOrder:change', (errors: Partial<IOrderForm>) => {
    const { address, payment } = errors;
    order.valid = !address && !payment;
    order.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
});
events.on(
	/^address\..*:change/,
	(data: { field: keyof IDeliveryForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => { page.locked = true;});
// ... и разблокируем
events.on('modal:close', () => {page.locked = false;});

// Получаем данные с сервера
api.getCardList()
	.then(appData.setCatalog.bind(appData))
	.catch(err => { console.error(err);});