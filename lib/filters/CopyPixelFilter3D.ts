import { Filter3DCopyPixelTask } from './tasks/Filter3DCopyPixelTask';

import { Filter3DBase } from './Filter3DBase';
import { Image2D } from '../image/Image2D';
import { Rectangle, Point, ColorTransform } from '@awayjs/core';

export class CopyPixelFilter3D extends Filter3DBase {
	private _copyPixelTask: Filter3DCopyPixelTask;

	/**
	 * Creates a new CopyPixelFilter3D object
	 * @param blurX The amount of horizontal blur to apply
	 * @param blurY The amount of vertical blur to apply
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor() {
		super();

		this._copyPixelTask = new Filter3DCopyPixelTask();

		this.addTask(this._copyPixelTask);
	}

	public get colorTransform() {
		return this._copyPixelTask.transform;
	}

	public set colorTransform(value: ColorTransform) {
		this._copyPixelTask.transform = value;
	}

	public get rect(): Rectangle {
		return this._copyPixelTask.rect;
	}

	public set rect(value: Rectangle) {
		this._copyPixelTask.rect = value;
	}

	public get destPoint(): Point {
		return this._copyPixelTask.destPoint;
	}

	public set destPoint(value: Point) {
		this._copyPixelTask.destPoint = value;
	}

	public get sourceTexture(): Image2D {
		return this._copyPixelTask.sourceTexture;
	}

	public set sourceTexture(value: Image2D) {
		this._copyPixelTask.sourceTexture = value;
	}
}