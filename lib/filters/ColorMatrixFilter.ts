import { ColorMatrixTask } from './tasks/webgl/ColorMatrixTask';

import { FilterBase } from './FilterBase';
import { ColorTransform } from '@awayjs/core';
import { ContextGLBlendFactor as BF } from '../base/ContextGLBlendFactor';
import { BlendMode } from '../image/BlendMode';
import { IBitmapFilter } from './IBitmapFilter';

const DEFAULT_BLEND_MAP = {
	[''] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.NORMAL] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.LAYER] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.ERASE] : [BF.ZERO, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.ALPHA + '_back'] : [BF.DESTINATION_ALPHA, BF.ZERO],
};

export interface IColorMatrix {
	filterName: 'colorMatrix',
	matrix?: number[]
}
export class ColorMatrixFilter extends FilterBase implements IBitmapFilter<'colorMatrix', IColorMatrix> {
	public static readonly filterName = 'colorMatrix';
	private _copyPixelTask: ColorMatrixTask;
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

	public get colorTransform() {
		return this._copyPixelTask.transform;
	}

	public set colorTransform(value: ColorTransform) {
		this._copyPixelTask.transform = value;

		if (!value) {
			this._requireBlend = false;
		}
	}

	public get matrix() {
		return this._copyPixelTask.matrix;
	}

	public set matrix(value: number[]) {
		this._copyPixelTask.matrix = value;

		if (!value) {
			this._requireBlend = false;
		}
	}

	constructor (props?: Partial<IColorMatrix>) {
		super();

		this._copyPixelTask = new ColorMatrixTask();
		this.addTask(this._copyPixelTask);

		if (props) {
			this.applyProps(props);
		}
	}

	public applyProps(props?: Partial<IColorMatrix>) {
		this.matrix = props?.matrix;
	}

}