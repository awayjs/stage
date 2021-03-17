import { BlurTask } from './tasks/BlurTask';
import { FilterBase } from './FilterBase';

export class BlurFilter extends FilterBase {
	protected _hBlurTask: BlurTask;
	protected _vBlurTask: BlurTask;
	/**
	 * Creates a new BlurFilter3D object
	 * @param blurX The amount of horizontal blur to apply
	 * @param blurY The amount of vertical blur to apply
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor(blurX: number = 3, blurY: number = 3, stepSize: number = -1) {
		super();

		this._hBlurTask = new BlurTask(blurX, stepSize, true);
		this._vBlurTask = new BlurTask(blurY, stepSize, false);

		this.addTask(this._hBlurTask);
		this.addTask(this._vBlurTask);
	}

	public get blurX(): number {
		return this._hBlurTask.amount;
	}

	public set blurX(value: number) {
		this._hBlurTask.amount = value;
	}

	public get blurY(): number {
		return this._vBlurTask.amount;
	}

	public set blurY(value: number) {
		this._vBlurTask.amount = value;
	}

	/**
	 * The distance between two blur samples. Set to -1 to autodetect with acceptable quality (default value).
	 * Higher values provide better performance at the cost of reduces quality.
	 */
	public get stepSize(): number {
		return this._hBlurTask.stepSize;
	}

	public set stepSize(value: number) {
		this._hBlurTask.stepSize = value;
		this._vBlurTask.stepSize = value;
	}
}