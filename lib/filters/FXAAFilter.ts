import { FXAATask } from './tasks/FXAATask';

import { FilterBase } from './FilterBase';

export class FXAAFilter extends FilterBase {
	private _fxaaTask: FXAATask;

	/**
	 * Creates a new FXAAFilter3D object
	 * @param amount
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor(amount: number, stepSize: number = -1) {
		super();

		this._fxaaTask = new FXAATask(amount, stepSize);

		this.addTask(this._fxaaTask);
	}

	public get amount(): number {
		return this._fxaaTask.amount;
	}

	public set amount(value: number) {
		this._fxaaTask.amount = value;
	}

	public get stepSize(): number {
		return this._fxaaTask.stepSize;
	}

	public set stepSize(value: number) {
		this._fxaaTask.stepSize = value;
	}
}