import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";
import { createElement, ensureElement } from '../../utils/utils';

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

 //класс хранящий всю корзину
export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
        this.items = [];
    }

    // Обновляет список товаров в корзине
    set items(items: HTMLElement[]) {
        this._list.innerHTML = '';
        if (items.length > 0) {
            this._list.append(...items);
        } else {
            this._list.append(createElement('p', 'Корзина пуста'));
        }
    }

    set total(total: number) {
        this.setText(this._total, `${total} синапсов`);
    }
}