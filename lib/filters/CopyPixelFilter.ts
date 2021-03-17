import { CopyPixelTask } from './tasks/webgl/CopyPixelTask';

import { FilterBase } from './FilterBase';
import { Image2D } from '../image/Image2D';
import { Rectangle, Point, ColorTransform } from '@awayjs/core';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';

export class CopyPixelFilter extends FilterBase {
	private _copyPixelTask: CopyPixelTask;

	public get blendDst() {
		return ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
	}

	public get requireBlend() {
		return true;
	}

	constructor () {
		super();

		this._copyPixelTask = new CopyPixelTask();
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
}