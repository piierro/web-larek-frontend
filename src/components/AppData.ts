import { Model } from './base/Model';
import {FormErrors, IAppState, IOrder, IProductItem, IOrderForm } from "../types";

export type CatalogChangeEvent = {
  catalog: IProductItem[]
};

export class AppState extends Model<IAppState> {
  basket: IProductItem[] = [];
  catalog: IProductItem[];
  order: IOrder = {
    email: '',
    phone: '',
    items: [],
    payment: '',
    total: 0,
    address: ''
  };
    
  formErrors: FormErrors = {};

  getTotal() {
    return this.basket.reduce((total, item) => total + item.price, 0);
  }

  setCatalog(items: IProductItem[]) {
    this.catalog = items;
    this.emitChanges('items:changed', { catalog: this.catalog });
  }

  setPreview(item: IProductItem) {
    this.emitChanges('preview:changed', item);
  }

  addToBasket(item: IProductItem ) {
    if (!this.checkProduct(item.id)) {
      this.basket.push(item);
      this.order.items.push(item.id);
      this.order.total = this.order.total + item.price;
      this.emitChanges('basket:changed');
    }
  }
  removeFromBusket(item: IProductItem) {
    this.basket = this.basket.filter((element) => element != item);
    this.order.items = this.order.items.filter((id: string) => item.id !== id);
    this.order.total = this.order.total - item.price;
    this.emitChanges('basket:changed');
  }

  clearBasket() {
		this.basket = [];
    this.order.items = [];
		this.emitChanges('basket:changed');
	}

  clearOrder() {
    this.order.address = '';
    this.order.email = '';
    this.order.payment = '';
    this.order.phone = '';
    this.order.total = 0;
  }

  checkProduct(id: string) {
		return !!this.basket.find((item) => item.id === id);
	}
  
  setContactField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}
  
  validateContacts() {
    const errors: typeof this.formErrors = {};

    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    } 
    if (!this.order.phone) {
    errors.phone = 'Необходимо указать телефон';
    }

    this.formErrors = errors;
    this.events.emit('formErrorsContact:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  setOrderField(field: keyof IOrderForm, value: string) {
    this.order[field] = value;
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }

  validateOrder() {
   const errors: typeof this.formErrors = {};

   if (!this.order.payment) {
    errors.payment= 'Необходимо выбрать способ оплаты';
  }
  if (!this.order.address) {
    errors.address = 'Необходимо указать адрес';
  }

    this.formErrors = errors;
    this.events.emit('formErrorsOrder:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}