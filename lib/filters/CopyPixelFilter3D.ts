import { Filter3DCopyPixelTaskWebGL } from './tasks/webgl/Filter3DCopyPixelTaskWebgGL';

import { Filter3DBase } from './Filter3DBase';
import { Image2D } from '../image/Image2D';
import { Rectangle, Point, ColorTransform } from '@awayjs/core';
import { IContextGL } from '../base/IContextGL';

export class CopyPixelFilter3D extends Filter3DBase {
	private _copyPixelTask: Filter3DCopyPixelTaskWebGL;

	/**
	 * Creates a new CopyPixelFilter3D object
	 */

	public init (context: IContextGL) {
		if (this._context === context) {
			return;
		}
		super.init(context);

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