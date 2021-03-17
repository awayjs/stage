import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';
import { FilterUtils } from '../utils/FilterUtils';
import { BlurFilter } from './BlurFilter';
import { IUniversalFilter } from './IUniversalFilter';
import { BevelTask } from './tasks/webgl/BevelTask';

function proxyTo(fieldName: string, subFieldName?: string): any {
	return function (
		target: any,
		propertyKey: string,
		_descriptor: TypedPropertyDescriptor<any>
	) {
		subFieldName = propertyKey;

		Object.defineProperty(target, propertyKey, {
			set: function (v: any) {
				this[fieldName][subFieldName] = v;
			},
			get: function () {
				return this[fieldName][subFieldName];
			}
		});
	};
}
export interface IBevelFilterModel {
	distance: number;
	angle: number;
	highlightColor: ui32;
	highlightAlpha: ui32;
	shadowColor: ui32;
	shadowAlpha: number;
	blurX: ui32;
	blurY: ui32;
	strength: number;
	quality: ui8;
	type?: 'inner';
	knockout?: number;
}

export class BevelFilter extends BlurFilter implements IUniversalFilter<IBevelFilterModel> {
	public readonly filterName = 'bevel';

	protected _bevelTask = new BevelTask();

	@proxyTo('_bevelTask')
	distance: number = 1;

	@proxyTo('_bevelTask')
	angle: number = 45;

	@proxyTo('_bevelTask')
	highlightColor: number = 0xffffff;

	@proxyTo('_bevelTask')
	highlightAlpha: number = 1;

	@proxyTo('_bevelTask')
	shadowColor: number = 1;

	@proxyTo('_bevelTask')
	shadowAlpha: number = 0;

	@proxyTo('_bevelTask')
	strength: number = 1;

	quality: number;

	@proxyTo('_bevelTask')
	type: 'inner' | 'outer' = 'inner';

	@proxyTo('_bevelTask')
	knockout: boolean = false;

	protected _source: Image2D;

	constructor(options?: Partial <IBevelFilterModel>) {
		super();

		this.addTask(this._bevelTask);

		this.applyProps(options);
	}

	public applyProps(model: Partial<IBevelFilterModel>): void {
		// run all model field that changed
		for (const key in model) {
			this[key] = model[key];
		}
	}

	public setRenderState (
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		outRect: Rectangle,
		filterManage: FilterManager
	) {

		const pad = FilterUtils.meashureBlurPad(
			this.blurX,
			this.blurY,
			3,
			false
		);

		const firstPass = filterManage.popTemp(
			source.width + pad.x,
			source.height + pad.y
		);
		const secondPass = filterManage.popTemp(
			source.width + pad.x,
			source.height + pad.y
		);

		// we not cut region, because in this case blur will emit invalid data on edge
		this._hBlurTask.inputRect.setTo(
			0,0,
			source.width,
			source.height
		);

		// apply padding
		this._hBlurTask.destRect.setTo(
			pad.x, pad.y,
			source.width,
			source.height
		);

		// but we can use a clip to kill non-used
		this._hBlurTask.clipRect = new Rectangle(
			0,0,
			source.width + pad.x,
			source.height + pad.y
		);

		this._vBlurTask.clipRect = this._hBlurTask.clipRect;

		// will be as target size
		this._vBlurTask.inputRect.setTo(0,0,0,0);
		this._vBlurTask.destRect.setTo(0,0,0,0);

		// emit real
		// crop a dest rectanle
		this._bevelTask.inputRect.setTo(pad.x, pad.y, outRect.width, outRect.height);
		this._bevelTask.destRect = outRect;

		this._hBlurTask.source = source;
		this._hBlurTask.target = firstPass;
		this._vBlurTask.source = firstPass;
		this._vBlurTask.target = secondPass;
		this._bevelTask.source = secondPass;
		this._bevelTask.sourceImage = source;
		this._bevelTask.target = target;

		this._temp = [firstPass, secondPass];

		this._hBlurTask.needClear = true;
		this._vBlurTask.needClear = true;
		this._bevelTask.needClear = false;
	}
}