import { Image2D } from '../image/Image2D';
import { Stage } from '../Stage';
import { BlurFilter3D } from './BlurFilter3D';
import { IUniversalFilter } from './IUniversalFilter';
import { Filter3DBevelTask } from './tasks/webgl/Filter3DBevelTask';

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

export class Filter3DBevel extends BlurFilter3D implements IUniversalFilter<IBevelFilterModel> {
	public readonly filterName = 'bevel';

	protected _bevelTask = new Filter3DBevelTask();

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
	type?: 'inner' | 'outer' = 'inner';

	@proxyTo('_bevelTask')
	knockout?: boolean = false;

	protected _source: Image2D;

	constructor(options?: Partial <IBevelFilterModel>) {
		super();

		this.addTask(this._bevelTask);

		this.applyModel(options);
	}

	public setSource(image: Image2D) {
		this._source = image;

		this.textureHeight = image.height; // Math.pow(2, Math.ceil(Math.log2(image.height)));
		this.textureWidth = image.width; // Math.pow(2, Math.ceil(Math.log2(image.width)));
	}

	public applyModel(model: Partial<IBevelFilterModel>): void {
		// run all model field that changed
		for (const key in model) {
			this[key] = model[key];
		}
	}

	public setRenderTargets(mainTarget: Image2D, stage: Stage): void {
		this._hBlurTask.setMainInputTexture(this._source, stage);
		this._vBlurTask.target = this._bevelTask.getMainInputTexture(stage);

		this._bevelTask.sourceImage = this._source;

		super.setRenderTargets(mainTarget, stage);
	}
}