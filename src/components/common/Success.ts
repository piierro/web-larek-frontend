import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";
import { ISuccessActions } from "../../types";
export class Success extends Component {
    protected _close: HTMLElement;
    protected _total: HTMLParagraphElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLParagraphElement>('.order-success__description',this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }
    set total(total: number) {
		this.setText(this._total, `${total.toString()} синапсов`);
	}
}