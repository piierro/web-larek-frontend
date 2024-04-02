export interface IProductItem {
    id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// type PaymentMethod = 'online' | 'offline';

export type IBasketItem = Pick<IProductItem , 'id' | 'title' | 'price'>;

export interface IAppState {
	catalog: IProductItem;
	basket: string[];
	preview: string | null;
	order: IOrder | null;
}
export interface IOrderForm {
    email: string;
	phone: string;
    address: string;
    payment: null;
}

export interface IOrder extends IOrderForm {
	items: string[];
    total: number;
}

export interface IOrderResult {
	id: string;
    total: number;
}
export interface IBasketData {
	basket: IProductItem[];
}
  
export type FormErrors = Partial<Record<keyof IOrder, string>>;
