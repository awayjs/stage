import { CopyPixelTask } from './tasks/webgl/CopyPixelTask';

import { FilterBase } from './FilterBase';
import { ColorTransform } from '@awayjs/core';
import { ContextGLBlendFactor as BF } from '../base/ContextGLBlendFactor';
import { BlendMode } from '../image/BlendMode';

const DEFAULT_BLEND_MAP = {
	[''] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.NORMAL] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.LAYER] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.ERASE] : [BF.ZERO, BF.ONE_MINUS_SOURCE_ALPHA],
};

export class CopyPixelFilter extends FilterBase {
	private _copyPixelTask: CopyPixelTask;
	private _blendDst: BF = BF.ONE_MINUS_SOURCE_ALPHA;
	private _blendSrc: BF = BF.ONE;

	public get blendDst() {
		return this._blendDst;
	}

	public get blendSrc() {
		return this._blendSrc;
	}

	private _requireBlend = true;
	public get requireBlend() {
		return this._requireBlend;
	}

	public set requireBlend(v: boolean) {
		if (!this._requireBlend && v) {
			this.blend = '';
		}

		this._requireBlend = v;
	}

	protected _blend: string = '';
	public set blend(v: string) {
		const map = DEFAULT_BLEND_MAP[v];

		this._requireBlend = !!map;

		if (map) {
			this._blendDst = map[1];
			this._blendSrc = map[0];
		} else {
			// go composite by shader
		}
	}

	public get blend() {
		return this._blend;
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