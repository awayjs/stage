import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image';
import { FilterManager } from '../managers/FilterManager';
import { FilterUtils, PROPS_LIST, proxyTo, serialisable } from '../utils/FilterUtils';
import { BlurFilter, IBlurFilterProps } from './BlurFilter';
import { IBitmapFilter } from './IBitmapFilter';
import { DropShadowTask } from './tasks/webgl/DropShadowTask';

export interface IDropShadowFilterProps extends IBlurFilterProps {
	distance: number;
	angle: number;
	alpha: number;
	color: number;
	strength: number;
	inner: boolean;
	knockout: boolean;
	hideObject: boolean;
}

export class DropShadowFilter extends BlurFilter implements IBitmapFilter<'dropShadow', IDropShadowFilterProps> {
	public static readonly filterName: string = 'dropShadow';
	public static readonly filterNameAlt: string = 'glow';

	protected _shadowTask = new DropShadowTask();

	@serialisable
	@proxyTo('_shadowTask')
	distance: number = 0;

	@serialisable
	@proxyTo('_shadowTask')
	angle: number = 0;

	@serialisable
	@proxyTo('_shadowTask')
	color: number = 0x0;

	@serialisable
	@proxyTo('_shadowTask')
	alpha: number = 1;

	@serialisable
	@proxyTo('_shadowTask')
	strength: number = 1;

	@serialisable
	quality: number;

	@serialisable
	@proxyTo('_shadowTask')
	inner: boolean = false;

	@serialisable
	@proxyTo('_shadowTask')
	knockout: boolean = false;

	@serialisable
	@proxyTo('_shadowTask')
	hideObject: boolean = false;

	constructor(options?: Partial <IDropShadowFilterProps>) {
		super(options);

		this.addTask(this._shadowTask);

		this.applyProps(options);
	}

	public applyProps(model: Partial<IDropShadowFilterProps>): void {
		if (!model) return;
		// run all model field that changed
		for (const key of this[PROPS_LIST]) {
			if (key in model) {
				this[key] = model[key];
			}
		}

		if (model.filterName === DropShadowFilter.filterNameAlt) {
			this.angle = 0;
			this.distance = 0;
		}
	}

	public meashurePad(input: Rectangle, target: Rectangle = input): Rectangle {
		const pad = FilterUtils.meashureBlurPad(
			this.blurX,
			this.blurY,
			3,
			false
		);

		target.copyFrom(input);

		// for outer or both need render a drop shadow with valid pad
		const dist = this.distance;
		if (!this.inner && dist > 0) {
			const rad = this.angle * Math.PI / 180;

			pad.x += Math.sin(rad) * dist * 2;
			pad.y += Math.sin(rad) * dist * 2;
		}

		target.x -= pad.x;
		target.y -= pad.y;
		target.width += pad.x;
		target.height += pad.y;

		return target;
	}

	public setRenderState (
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		outRect: Rectangle,
		filterManager: FilterManager
	) {

		super.setRenderState(source, target, sourceRect, outRect, filterManager);

		const subtarget = this._hBlurTask.target;
		const secondPass = filterManager.popTemp(
			subtarget.width,
			subtarget.height
		);

		// emit real
		// crop a dest rectangle
		// override blur target
		// we use a copyFrom, because if we will use referece - we can corrupt instance
		this._shadowTask.inputRect.copyFrom(this._vBlurTask.inputRect);
		this._shadowTask.destRect.copyFrom(outRect);

		//reset output size
		this._vBlurTask.inputRect.setTo(0,0,0,0);
		this._vBlurTask.destRect.setTo(0,0,0,0);

		// and reset target
		this._vBlurTask.target = secondPass;

		this._shadowTask.source = secondPass;
		this._shadowTask.sourceImage = source;
		this._shadowTask.target = target;
		this._temp.push(secondPass);

	}
}