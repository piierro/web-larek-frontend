import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";

interface ISuccess {
    total: number; 
}

interface ISuccessActions {
    onClick: () => void;
}

export class Success extends Component<ISuccess> {
    protected _close: HTMLElement;
    protected _description: HTMLParagraphElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._description = ensureElement<HTMLParagraphElement>('.order-success__description',this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }
    set description(value: number) {
		this.setText(this._description, `Списано ${value} синапсов`);
	}
}