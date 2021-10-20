import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image';
import { FilterManager } from '../managers/FilterManager';
import { FilterUtils, PROPS_LIST, proxyTo, serialisable } from '../utils/FilterUtils';
import { BlurFilter, IBlurFilterProps } from './BlurFilter';
import { IBitmapFilter } from './IBitmapFilter';
import { DropShadowTask } from './tasks/webgl/DropShadowTask';
import { FilterBase } from './FilterBase';

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

export class DropShadowFilter extends FilterBase implements IBitmapFilter<'dropShadow', IDropShadowFilterProps> {
	public static readonly filterName: string = 'dropShadow';
	public static readonly filterNameAlt: string = 'glow';

	protected _blurFilter: BlurFilter;
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

	@serialisable
	@proxyTo('_shadowTask')
	imageScale: number = 1;

	constructor(options?: Partial <IDropShadowFilterProps>) {
		super();

		this._blurFilter = new BlurFilter(options);

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

		this._blurFilter.applyProps(model);
	}

	public meashurePad(input: Rectangle, target: Rectangle = input): Rectangle {
		target = this._blurFilter.meashurePad(input, target);

		let offsetX = 0;
		let offsetY = 0;

		// for outer or both need render a drop shadow with valid pad
		const dist = Math.abs(this.distance);
		if (!this.inner && dist > 0) {
			const rad = this.angle * Math.PI / 180;

			offsetX += Math.cos(rad) * dist * 2;
			offsetY += Math.sin(rad) * dist * 2;
		}

		target.x -= offsetX;
		target.y -= offsetY;
		target.width += offsetX * 2;
		target.height += offsetY * 2;

		return target;
	}

	public apply(
		source: Image2D,
		target: Image2D,
		sourceRect,
		destRect,
		filterManager: FilterManager,
		clearOutput: boolean = false
	) {
		const tmp = filterManager.popTemp(source.width, source.height);

		this._blurFilter.apply(source, tmp, sourceRect, tmp.rect, filterManager, true);
		this._shadowTask.sourceImage = source;

		super.apply(
			tmp,
			target,
			sourceRect,
			destRect,
			filterManager,
			clearOutput
		);

		filterManager.pushTemp(tmp);
	}

	public setRenderState (
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		outRect: Rectangle,
		filterManager: FilterManager
	) {

		super.setRenderState(source, target, sourceRect, outRect, filterManager);

		this._shadowTask.inputRect.copyFrom(sourceRect);
		this._shadowTask.destRect.copyFrom(outRect);

		this._shadowTask.source = source;
		this._shadowTask.target = target;
	}
}