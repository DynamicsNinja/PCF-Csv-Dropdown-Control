import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class CsvDropdownControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _container: HTMLDivElement;
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;

	private _value: string;
	private _dropdown: HTMLSelectElement;
	private _firstOption: HTMLOptionElement;
	private _isRequiedField: boolean;
	private _isLockedField: boolean;

	private _refreshData: EventListenerOrEventListenerObject;
	private _changeFirstOptionText: EventListenerOrEventListenerObject;
	private _resetFirstOptionText: EventListenerOrEventListenerObject;


	constructor() {

	}

	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this._container = container;
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		
		this._refreshData = this.refreshData.bind(this);
		this._changeFirstOptionText = this.changeFirstOptionText.bind(this);
		this._resetFirstOptionText = this.resetFirstOptionText.bind(this);
		
		this._isRequiedField = (<any>context.parameters.fieldValue).attributes.RequiredLevel == 2;
		this._isLockedField = context.mode.isControlDisabled;

		let csvValues = context.parameters.csvValues.raw;
		let dropdown = document.createElement("select");
		dropdown.addEventListener("change", this._refreshData);
		dropdown.addEventListener("mouseover", this._changeFirstOptionText);
		dropdown.addEventListener("focus", this._changeFirstOptionText);
		dropdown.addEventListener("mouseout", this._resetFirstOptionText);
		dropdown.addEventListener("blur", this._resetFirstOptionText);

		this._dropdown = dropdown;

		if (!this._isRequiedField) {
			let option = document.createElement("option");
			option.value = "";
			option.text = "---";
			dropdown.appendChild(option);

			this._firstOption = option;
		}

		let valuesList = csvValues.split(";");

		valuesList.forEach(value => {
			let option = document.createElement("option");
			option.value = value;
			option.text = value;
			dropdown.appendChild(option);
		});

		container.appendChild(dropdown);

		this._value = context.parameters.fieldValue.raw;

		if (this._value != null) { 
			dropdown.value = this._value; 
		}
	}

	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this._isLockedField = context.mode.isControlDisabled;
		this._dropdown.disabled = this._isLockedField;
	}

	public getOutputs(): IOutputs {
		return {
			fieldValue: this._value
		};
	}

	public destroy(): void {
		this._dropdown.removeEventListener("change", this.refreshData);
	}

	public refreshData(): void {
		this._value = this._dropdown.value;
		this._notifyOutputChanged();
	}

	public changeFirstOptionText(): void {
		this._firstOption.text = "--Select--";
	}

	public resetFirstOptionText(): void {
		if (document.activeElement == this._dropdown) return;
		this._firstOption.text = "---";
	}
}