import './scss/styles.scss';

import { ProductAPI } from './components/ProductApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { Model } from './components/base/Model';
import { IOrderForm } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { AppState, ProductItem, CatalogChangeEvent } from "./components/AppData";
import { Card } from "./components/Card";
import { Modal } from "./components/common/Modal";
import { Success } from "./components/common/Success";
import { Contacts, Order } from "./components/Order";
import { Basket } from './components/common/Basket';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

const appData = new AppState({}, events);

events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketModal = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events)
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactTemplate), events);

// РАБОТА С КАРТОЧКАМИ
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
	});
});
});

events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});

events.on('preview:changed', (item: ProductItem) => {
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
});

// РАБОТА С КОРЗИНОЙ
events.on('basket:open', () => {
	basket.selected = appData.order.items;
	modal.render({
		content: basket.render({
			total: appData.getTotal()
		}),
	});
});

events.on('basket:changed', () => {
	basket.items = appData.basket.map((item) => {
	const card = new Card(cloneTemplate(cardBasketModal), {
	 onClick: () => {
		appData.removeFromBusket(item);
		basket.selected = appData.order.items;
		basket.total = appData.getTotal();
    }
}); return card.render({
		title: item.title,
		price: item.price,
	});
});
	page.counter = appData.basket.length;
    basket.total = appData.getTotal();
});

events.on('card:add', (item: ProductItem) => {
	appData.addToBasket(item);
	modal.close();
});

events.on('card:remove', (item: ProductItem) => {
	appData.removeFromBusket(item);
	events.emit('basket:open');
});

// РАБОТА С ВАЛИДАЦИЕЙ ФОРМ
events.on('formErrorsContact:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setContactField(data.field, data.value);
	}
);

events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('formErrorsOrder:change', (errors: Partial<IOrderForm>) => {
    const { address, payment } = errors;
    order.valid = !address && !payment;
    order.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('payment:change', (target: HTMLButtonElement) => {
	appData.order.payment = target.name;
});

events.on('contacts:submit', () => {
    api.orderCards(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
					appData.clearOrder();
					page.counter = appData.basket.length;
                }
            });

            modal.render({
                content: success.render({
					total: appData.getTotal()
				})
            });
        })
        .catch(err => {
            console.error(err);
        });
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => { page.locked = true;});
// ... и разблокируем
events.on('modal:close', () => {page.locked = false;});

// Получаем данные с сервера
api.getCardList()
	.then(appData.setCatalog.bind(appData))
	.catch(err => { console.error(err);});