import { ThresholdTask, TThresholdOperator } from './tasks/ThresholdTask';
import { FilterBase } from './FilterBase';
import { proxyTo } from '../utils/FilterUtils';

export class ThresholdFilter extends FilterBase {
	private _thresholdTask: ThresholdTask;

	@proxyTo('_thresholdTask')
	public operation: TThresholdOperator;

	@proxyTo('_thresholdTask')
	public color: number;

	@proxyTo('_thresholdTask')
	public mask: number;

	@proxyTo('_thresholdTask')
	public copySource: boolean;

	@proxyTo('_thresholdTask')
	public threshold: number;

	/**
	 * Creates a new ThresholdFilter3D object
	 * @param blurX The amount of horizontal blur to apply
	 * @param blurY The amount of vertical blur to apply
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor() {
		super();

		this._thresholdTask = new ThresholdTask();

		this.addTask(this._thresholdTask);
	}
}