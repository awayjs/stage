import { Filter3DThresholdTask } from './tasks/Filter3DThresholdTask';

import { Filter3DBase } from './Filter3DBase';
import { Image2D } from '../image/Image2D';
import { Rectangle, Point } from '@awayjs/core';

export class ThresholdFilter3D extends Filter3DBase {
	private _thresholdTask: Filter3DThresholdTask;

	/**
	 * Creates a new ThresholdFilter3D object
	 * @param blurX The amount of horizontal blur to apply
	 * @param blurY The amount of vertical blur to apply
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor() {
		super();

		this._thresholdTask = new Filter3DThresholdTask();

		this.addTask(this._thresholdTask);
	}

	public get rect(): Rectangle {
		return this._thresholdTask.inputRect;
	}

	public set rect(value: Rectangle) {
		this._thresholdTask.inputRect = value;
	}

	public get destPoint(): Point {
		return this._thresholdTask.destRect.topLeft;
	}

	public set destPoint(value: Point) {
		this._thresholdTask.destRect.x = value.x;
		this._thresholdTask.destRect.y = value.y;
	}

	public get operation(): string {
		return this._thresholdTask.operation;
	}

	public set operation(value: string) {
		this._thresholdTask.operation = value;
	}

	public get threshold(): number {
		return this._thresholdTask.threshold;
	}

	public set threshold(value: number) {
		this._thresholdTask.threshold = value;
	}

	public get color(): number {
		return this._thresholdTask.color;
	}

	public set color(value: number) {
		this._thresholdTask.color = value;
	}

	public get mask(): number {
		return this._thresholdTask.mask;
	}

	public set mask(value: number) {
		this._thresholdTask.mask = value;
	}

	public get copySource(): boolean {
		return this._thresholdTask.copySource;
	}

	public set copySource(value: boolean) {
		this._thresholdTask.copySource = value;
	}

	public get sourceTexture(): Image2D {
		return this._thresholdTask.sourceTexture;
	}

	public set sourceTexture(value: Image2D) {
		this._thresholdTask.sourceTexture = value;
	}
}