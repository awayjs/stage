import { Filter3DCopyPixelTaskWebGL } from './tasks/webgl/Filter3DCopyPixelTaskWebgGL';

import { Filter3DBase } from './Filter3DBase';
import { Image2D } from '../image/Image2D';
import { Rectangle, Point, ColorTransform } from '@awayjs/core';

export class CopyPixelFilter3D extends Filter3DBase {
	private _copyPixelTask: Filter3DCopyPixelTaskWebGL;

	constructor () {
		super();

		this._copyPixelTask = new Filter3DCopyPixelTaskWebGL();
		this.addTask(this._copyPixelTask);

	}

	public get colorTransform() {
		return this._copyPixelTask.transform;
	}

	public set colorTransform(value: ColorTransform) {
		this._copyPixelTask.transform = value;
	}

	public get rect(): Rectangle {
		return this._copyPixelTask.inputRect;
	}

	public set rect(value: Rectangle) {
		this._copyPixelTask.inputRect = value;
	}

	public get destPoint(): Point {
		return this._copyPixelTask.destRect.topLeft;
	}

	public set destPoint(value: Point) {
		this._copyPixelTask.destRect.x  = value.x;
		this._copyPixelTask.destRect.y  = value.y;
	}

	public get sourceTexture(): Image2D {
		return this._copyPixelTask.sourceTexture;
	}

	public set sourceTexture(value: Image2D) {
		this._copyPixelTask.sourceTexture = value;
	}

	public setRenderState (source: Image2D, target: Image2D,) {

	}
}