export interface IProductItem {
    id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	button: HTMLButtonElement;
}

export type IBasketItem = Pick<IProductItem , 'id' | 'title' | 'price'>;

export interface IAppState {
	catalog: IProductItem[];
	basket: string[];
	order: IOrder | null;
}
export interface IOrderForm {
    email: string;
	phone: string;
    address: string;
    payment: string;
}

export interface IOrder extends IOrderForm {
	items: string[];
    total: number;
}

export interface IOrderResult {
	id: string;
    total: number;
}
// export interface IBasketData {
// 	basket: IProductItem[];
// }
  
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IModalData {
    content: HTMLElement;
}

export interface IFormState {
    valid: boolean;
    errors: string[];
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
    onClick: () => void;
}

