import { Image2D } from '../image/Image2D';
import { Stage } from '../Stage';
import { BlurFilter3D } from './BlurFilter3D';
import { IUniversalFilter } from './IUniversalFilter';

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

export class Filter3DBevel extends BlurFilter3D implements IUniversalFilter<IBevelFilterModel> {
	public readonly filterName = 'bevel';

	distance: number;
	angle: number;
	highlightColor: number;
	highlightAlpha: number;
	shadowColor: number;
	shadowAlpha: number;
	strength: number;
	quality: number;
	type?: 'inner';
	knockout?: number;

	protected _source: Image2D;

	constructor(options?: Partial <IBevelFilterModel>) {
		super();

		this.applyModel(options);
	}

	public setSource(image: Image2D) {
		this._source = image;

		this.textureHeight = Math.pow(2, Math.ceil(Math.log2(image.height)));
		this.textureWidth = Math.pow(2, Math.ceil(Math.log2(image.width)));
	}

	public applyModel(model: Partial<IBevelFilterModel>): void {
		// run all model field that changed
		for (const key in model) {
			this[key] = model[key];
		}
	}

	public setRenderTargets(mainTarget: Image2D, stage: Stage): void {
		//@ts-ignore
		this._hBlurTask.setMainInputTexture(this._source);
		super.setRenderTargets(mainTarget, stage);
	}
}