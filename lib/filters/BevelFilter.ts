import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';
import { PROPS_LIST, proxyTo, serialisable } from '../utils/FilterUtils';
import { BlurFilter, IBlurFilterProps } from './BlurFilter';
import { IBitmapFilter } from './IBitmapFilter';
import { BevelTask } from './tasks/webgl/BevelTask';
import { FilterBase } from './FilterBase';

export interface IBevelFilterProps extends IBlurFilterProps {
	distance: number;
	angle: number;
	highlightColor?: ui32;
	highlightAlpha?: number;
	shadowColor?: ui32;
	shadowAlpha: number;
	colors?: ui32[];
	ratios?: ui8[];
	alphas?: number[];
	strength: number;
	type: 'inner' | 'outer' | 'both';
	knockout?: number;
}

export class BevelFilter extends FilterBase implements IBitmapFilter<'bevel', IBevelFilterProps> {
	public static readonly filterName: string = 'bevel';

	protected _blurFilter = new BlurFilter();
	protected _bevelTask = new BevelTask();

	@serialisable
	@proxyTo('_bevelTask')
	distance: number = 1;

	@serialisable
	@proxyTo('_bevelTask')
	angle: number = 45;

	@serialisable
	@proxyTo('_bevelTask')
	highlightColor: number = 0xffffff;

	@serialisable
	@proxyTo('_bevelTask')
	highlightAlpha: number = 1;

	@serialisable
	@proxyTo('_bevelTask')
	shadowColor: number = 1;

	@serialisable
	@proxyTo('_bevelTask')
	shadowAlpha: number = 0;

	@serialisable
	@proxyTo('_bevelTask')
	alphas: number[] = [];

	@serialisable
	@proxyTo('_bevelTask')
	colors: number[] = [];

	@serialisable
	@proxyTo('_bevelTask')
	ratios: number[] = []

	@serialisable
	@proxyTo('_bevelTask')
	strength: number = 1;

	@serialisable
	quality: number;

	@serialisable
	@proxyTo('_bevelTask')
	type: 'inner' | 'outer' | 'both' = 'inner';

	@serialisable
	@proxyTo('_bevelTask')
	knockout: boolean = false;

	@serialisable
	@proxyTo('_bevelTask')
	imageScale: number = 1;

	constructor(options?: Partial <IBevelFilterProps>) {
		super();

		this.addTask(this._bevelTask);
		this.applyProps(options);
	}

	public applyProps(model: Partial<IBevelFilterProps>): void {
		// run all model field that changed
		for (const key of this[PROPS_LIST]) {
			if (key in model) {
				this[key] = model[key];
			}
		}

		this._blurFilter.applyProps(model);
	}

	public meashurePad(input: Rectangle, target: Rectangle = input): Rectangle {
		target = this._blurFilter.meashurePad(input, target);

		let offsetX = 0;
		let offsetY = 0;

		// for outer or both need render a drop shadow with valid pad
		const dist = Math.abs(this.distance);
		if (this.type !== 'inner' && dist > 0) {
			const rad = this.angle * Math.PI / 180;

			offsetX += Math.cos(rad) * dist * this.imageScale * 2;
			offsetY += Math.sin(rad) * dist * this.imageScale * 2;
		}

		target.x -= offsetX;
		target.y -= offsetY;
		target.width += offsetX;
		target.height += offsetY;

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
		this._bevelTask.sourceImage = source;

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

		this._bevelTask.inputRect.copyFrom(sourceRect);
		this._bevelTask.destRect.copyFrom(outRect);

		this._bevelTask.source = source;
		this._bevelTask.target = target;
	}
}