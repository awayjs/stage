import { BlurTask } from './tasks/BlurTask';
import { FilterBase } from './FilterBase';
import { FilterUtils, serialisable, proxyTo } from '../utils/FilterUtils';
import { Image2D } from '../image/Image2D';
import { Rectangle } from '@awayjs/core';
import { FilterManager } from '../managers/FilterManager';
import { IBitmapFilter, IBitmapFilterProps } from './IBitmapFilter';

export interface IBlurFilterProps extends IBitmapFilterProps {
	blurX: number;
	blurY: number;
	// not supported yet
	quality: number;
	// not falsh prop, passed from cache
	imageScale: number;
}
export class BlurFilter extends FilterBase implements IBitmapFilter<'blur', IBlurFilterProps> {
	public static readonly filterName: string = 'blur';

	protected _hBlurTask: BlurTask;
	protected _vBlurTask: BlurTask;
	public quality: number = 1;

	@serialisable
	public imageScale: number = 1;

	//@serialisable
	//@proxyTo('_hBlurTask', 'amount')
	public blurX: number = 1;

	//@serialisable
	//@proxyTo('_vBlurTask', 'amount')
	public blurY: number = 1;

	constructor(props?: Partial<IBlurFilterProps>) {
		super();

		this._hBlurTask = new BlurTask(3, true);
		this._vBlurTask = new BlurTask(3, false);

		this.addTask(this._hBlurTask);
		this.addTask(this._vBlurTask);

		props && this.applyProps(props);
	}

	public applyProps(props: Partial<IBlurFilterProps>) {

		let kernel: number;
		let blurX = this.blurX = props.blurX;
		let blurY = this.blurY = props.blurY;
		let quality = props.quality || 1;

		blurX = blurX > 1 ? blurX - 1 : 0;
		blurY = blurY > 1 ? blurY - 1 : 0;

		switch (quality) {
			case 1: {
				kernel = 2;
				break;
			}
			case 2: {
				kernel = 3;
				blurX *= 1.05;
				blurY *= 1.05;
				break;
			}
			default: {
				blurX *= 0.65;
				blurY *= 0.65;
				kernel = 5;
			}
		}

		this._hBlurTask.stepSize = blurX;
		this._vBlurTask.stepSize = blurY;
		this._hBlurTask.kernel = this._vBlurTask.kernel = kernel;

		let maxAmount = Math.max(blurX, blurY);

		quality = 1;

		while (maxAmount >= 1.1) {
			maxAmount /= 2;
			quality++;
		}

		this.quality = quality + 1;

	}

	public apply(
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		destRect: Rectangle,
		filterManager: FilterManager,
		clearOutput: boolean = false,
	) {
		const passes = this.quality;
		const stepX = this._vBlurTask.stepSize;
		const stepY = this._hBlurTask.stepSize;

		let n = 1;
		let t = 1;
		for (let i = 1; i < passes; i++) {
			t *= 2;
			n += t;
		}

		this._hBlurTask.stepSize = stepX / n;
		this._vBlurTask.stepSize = stepY / n;

		if (passes === 1) {
			return super.apply(
				source,
				target,
				sourceRect,
				destRect,
				filterManager,
				clearOutput
			);
		} else {
			let tmp1 = filterManager.popTemp(source.width, source.height);
			let tmp2 = passes > 2 ? filterManager.popTemp(source.width, source.height) : null;

			super.apply(
				source,
				tmp1,
				sourceRect,
				tmp1.rect,
				filterManager,
				true
			);

			for (let i = 1; i < passes - 1; i++) {
				this._hBlurTask.stepSize *= 2;
				this._vBlurTask.stepSize *= 2;

				super.apply(
					tmp1,
					tmp2,
					tmp1.rect,
					tmp2.rect,
					filterManager,
					false
				);

				[tmp1, tmp2] = [tmp2, tmp1];
			}

			this._hBlurTask.stepSize *= 2;
			this._vBlurTask.stepSize *= 2;

			super.apply(
				tmp1,
				target,
				tmp1.rect,
				destRect,
				filterManager,
				clearOutput
			);

			filterManager.pushTemp(tmp1);
			filterManager.pushTemp(tmp2);
		}

		this._hBlurTask.stepSize = stepX;
		this._vBlurTask.stepSize = stepY;

	}

	public meashurePad(input: Rectangle, target: Rectangle = input): Rectangle {
		const pad = FilterUtils.meashureBlurPad(
			this.blurX,
			this.blurY,
			this.quality,
			true
		);

		target.copyFrom(input);

		target.x -= pad.x * 2;
		target.y -= pad.y * 2;
		target.width += pad.x * 2;
		target.height += pad.y * 2;

		return target;
	}

	public setRenderState (
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		outRect: Rectangle,
		filterManage: FilterManager
	) {
		const subPassTarget = filterManage.popTemp(
			source.width,
			source.height
		);

		// TEMP target can be dirty, because we use offset, clear it
		this._hBlurTask.needClear = true;

		// we not cut region, because in this case blur will emit invalid data on edge
		this._hBlurTask.inputRect.setTo(
			0,0,
			source.width,
			source.height
		);

		// apply padding
		this._hBlurTask.destRect.setTo(
			0, 0,
			source.width,
			source.height
		);

		// but we can use a clip to kill non-used
		this._vBlurTask.clipRect = new Rectangle(
			0,0,
			source.width,
			source.height
		);
		this._hBlurTask.clipRect = this._vBlurTask.clipRect;

		// emit real
		// crop a dest rectanle
		this._vBlurTask.inputRect.copyFrom(outRect);
		this._vBlurTask.destRect.copyFrom(outRect);

		this._hBlurTask.source = source;
		this._hBlurTask.target = subPassTarget;
		this._vBlurTask.source = subPassTarget;
		this._vBlurTask.target = target;

		this._temp = [subPassTarget];
	}
}