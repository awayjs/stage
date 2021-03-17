import { Rectangle } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';
import { proxyTo } from '../utils/FilterUtils';
import { BlurFilter, IBlurFilterProps } from './BlurFilter';
import { IBitmapFilter } from './IBitmapFilter';
import { BevelTask } from './tasks/webgl/BevelTask';

export interface IBevelFilterProps extends IBlurFilterProps {
	distance: number;
	angle: number;
	highlightColor: ui32;
	highlightAlpha: ui32;
	shadowColor: ui32;
	shadowAlpha: number;
	strength: number;
	type: 'inner' | 'outer' | 'both';
	knockout?: number;
}

export class BevelFilter extends BlurFilter implements IBitmapFilter<'bevel', IBevelFilterProps> {
	public static readonly filterName: string = 'bevel';

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
	type: 'inner' | 'outer' | 'both' = 'inner';

	@proxyTo('_bevelTask')
	knockout: boolean = false;

	constructor(options?: Partial <IBevelFilterProps>) {
		super(options);

		this.addTask(this._bevelTask);

		this.applyProps(options);
	}

	public applyProps(model: Partial<IBevelFilterProps>): void {
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