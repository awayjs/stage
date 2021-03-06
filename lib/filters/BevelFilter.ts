import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';
import { FilterUtils, PROPS_LIST, proxyTo, serialisable } from '../utils/FilterUtils';
import { BlurFilter, IBlurFilterProps } from './BlurFilter';
import { IBitmapFilter } from './IBitmapFilter';
import { BevelTask } from './tasks/webgl/BevelTask';

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

export class BevelFilter extends BlurFilter implements IBitmapFilter<'bevel', IBevelFilterProps> {
	public static readonly filterName: string = 'bevel';

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

	constructor(options?: Partial <IBevelFilterProps>) {
		super(options);

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
		if (this.type !== 'inner' && dist > 0) {
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
		// crop a dest rectanle
		// ovveride blur target
		// we use a copyFrom, because if we will use referece - we can corrupt instance
		this._bevelTask.inputRect.copyFrom(this._vBlurTask.inputRect);
		this._bevelTask.destRect.copyFrom(outRect);

		//reset output size
		this._vBlurTask.inputRect.setTo(0,0,0,0);
		this._vBlurTask.destRect.setTo(0,0,0,0);

		// and reset target
		this._vBlurTask.target = secondPass;

		this._bevelTask.source = secondPass;
		this._bevelTask.sourceImage = source;
		this._bevelTask.target = target;

		this._temp.push(secondPass);

	}
}