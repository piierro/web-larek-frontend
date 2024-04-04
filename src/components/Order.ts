import { IEvents, EventEmitter } from './base/events';
import { Form } from './common/Form';
import { ensureAllElements } from '../utils/utils';
import { IOrderForm } from '../types';

export class Contacts extends Form<IOrderForm > {
  constructor(container: HTMLFormElement, events: EventEmitter) {
      super(container, events);
  }

  set phone(value: string) {
      (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }

  set email(value: string) {
      (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
  }
}

export class Order extends Form<IOrderForm> {
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
			this.payment = button.name;
			events.emit('payment:change', button);
		});
		});
	}

	set payment(name: string) {
		this._buttons.forEach((button) => {
			if (button.name === name) {
				button.classList.add('button_alt-active');
			} else {
				button.classList.remove('button_alt-active');
			}
		});
		
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}