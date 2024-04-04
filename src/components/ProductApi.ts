import { Api, ApiListResponse } from './base/api';
import { IProductItem, IOrder, IOrderResult } from '../types';

export interface IProductAPI {
    getCardList: () => Promise<IProductItem []>; 
    orderCards: (order: IOrder) => Promise<IOrderResult>;
}

export class ProductAPI extends Api implements IProductAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }
    
    getCardList(): Promise<IProductItem[]> {
        return this.get('/product').then((data: ApiListResponse<IProductItem >) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    orderCards(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }
} 