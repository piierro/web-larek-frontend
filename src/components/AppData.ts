import { Model } from './base/Model';
import {FormErrors, IAppState, IOrder, IOrderForm, IProductItem, IBasketData } from "../types";
import { IContactForm, IDeliveryForm } from './Order';

export type CatalogChangeEvent = {
  catalog: IProductItem[]
};

export class ProductItem extends Model<IProductItem> {
  description: string;
  id: string;
  image: string;
  title: string;
  category: string;
	price: number | null;
  button: HTMLButtonElement;
}

export class AppState extends Model<IAppState> {
  basket: ProductItem[] = [];
  catalog: IProductItem[];
  order: IOrder = {
    email: '',
    phone: '',
    items: [],
    payment: null,
    total: null,
    address: ''
  };
    
  formErrors: FormErrors = {};
    // getTotal() {
    //   return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    // }
  
  getTotal() {
    return this.basket.reduce((total, item) => total + item.price, 0);
  }

  setCatalog(items: IProductItem[]) {
    this.catalog = items.map(item => new ProductItem(item, this.events));
    this.emitChanges('items:changed', { catalog: this.catalog });
  }

  setPreview(item: ProductItem) {
    this.emitChanges('preview:changed', item);
  }
  
  // Валидация контактов(форма ввода почты и телефона)
  setContactField(field: keyof IContactForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}
  validateContacts() {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    } if (!this.order.phone) {
    errors.phone = 'Необходимо указать телефон';
    }
    this.formErrors = errors;
    this.events.emit('formErrorsContact:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
  
  // Валидация заказа(выбор оплаты и адреса)
  setOrderField(field: keyof IDeliveryForm, value: string) {
    // this.order[field] = value;
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }
  validateOrder() {
   const errors: typeof this.formErrors = {};
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
      errors.address = 'Необходимо выбрать способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('formErrorsOrder:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  // Добавление товара в корзину
  addToBasket(item: ProductItem) {
    this.basket.push(item);
    this.emitChanges('basket:changed');
    // this.emitChanges('counter:changed', this.basket);
  }
  removeFromBusket(item: ProductItem) {
    this.basket = this.basket.filter((element) => element != item);
    this.emitChanges('basket:changed');
  }

  // Очистка корзины
	clearBasket() {
		this.basket.forEach((item) => {
			this.basket = [];
			this.emitChanges('basket:changed');
		});
	}
  
  // Очистка заказа
  clearOrder() {
		this.order.total = null;
		this.order.items = [];
	}
}