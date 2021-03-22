import { CopyPixelTask } from './tasks/webgl/CopyPixelTask';

import { FilterBase } from './FilterBase';
import { ColorTransform } from '@awayjs/core';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';

export class CopyPixelFilter extends FilterBase {
	private _copyPixelTask: CopyPixelTask;

	public get blendDst() {
		return ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
	}

	private _requireBlend = true;
	public get requireBlend() {
		return this._requireBlend;
	}

	public set requireBlend(v: boolean) {
		this._requireBlend = v;
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
}