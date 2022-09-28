import { ColorTransform, Point, Rectangle } from '@awayjs/core';

import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';
import { Image2D, ImageSampler, _Stage_ImageBase } from '../image/';
import { Stage } from '../Stage';
import { ContextWebGL } from '../webgl/ContextWebGL';
import { TextureBaseWebGL } from '../webgl/TextureBaseWebGL';
import { VertexBufferWebGL } from '../webgl/VertexBufferWebGL';
import { IVao } from '../base/IVao';
import { FilterUtils } from '../utils/FilterUtils';
import {
	DisplacementFilter,
	BlurFilter,
	BevelFilter,
	ThresholdFilter,
	ColorMatrixFilter,
	FilterBase,
	DropShadowFilter,
	IBitmapFilter,
	IBitmapFilterProps
} from '../filters';
import { TaskBase } from '../filters/tasks/TaskBase';
import ImageUtils from '../utils/ImageUtils';

type TmpImage2D = Image2D & {poolKey: string, antialiasQuality: number};

const tmpInputRectCopy = new Rectangle();
const tmpOutputRectCopy = new Rectangle();
const tmpOutputRectFilter = new Rectangle();
const tmpZERO = Object.freeze(new Point(0,0));

export class FilterManager {
	private static get MAX_TMP_TEXTURE() {
		return ImageUtils.MAX_SIZE;
	}

	private static MIN_TMP_TEXTURE = 64;
	private _texturePool: Record<string, TmpImage2D[]> = {};

	private static _instance: FilterManager;
	public static get instance() {
		return this._instance;
	}

	private _filterVertexBuffer: VertexBufferWebGL;
	private _filterVAO: IVao;

	private _filterSampler: ImageSampler;
	private _copyPixelFilter: ColorMatrixFilter;
	private _thresholdFilter: ThresholdFilter;

	private _activeFilterTask: TaskBase = null;

	private get context(): ContextWebGL {
		return  <ContextWebGL> this._stage.context;
	}

	private readonly _filterCache: Record<string, IBitmapFilter<any, any>> = {};
	private _filterConstructors: Record<string, { new(opt?: any): IBitmapFilter<any, any> }> = {
		[BevelFilter.filterName]: BevelFilter,
		[BlurFilter.filterName]: BlurFilter,
		[DisplacementFilter.filterName]: DisplacementFilter,
		[ColorMatrixFilter.filterName]: ColorMatrixFilter,
		[DropShadowFilter.filterName]: DropShadowFilter,
		// Glow has same implementation, but not has offsets. Drop shadow and glow - same filters
		[DropShadowFilter.filterNameAlt /*glow */] : DropShadowFilter,
	}

	public get stage() {
		return this._stage;
	}

	constructor (private _stage: Stage) {
		FilterManager._instance = this;
	}

	public popTemp (_width: number, _height: number, msaa: boolean = false): TmpImage2D {
		let width = Math.max(FilterManager.MIN_TMP_TEXTURE, 2 << Math.log2(_width - 1));
		let height = Math.max(FilterManager.MIN_TMP_TEXTURE, 2 << Math.log2(_height - 1));

		if (width > FilterManager.MAX_TMP_TEXTURE || height > FilterManager.MAX_TMP_TEXTURE) {

			// eslint-disable-next-line max-len
			console.warn(`[Filter manager] Temporary texture size ${width}x${height} for ${_width}x${_height} is bigger that limit, clamp to ${FilterManager.MAX_TMP_TEXTURE}`);

			width = Math.min(width, FilterManager.MAX_TMP_TEXTURE);
			height = Math.min(height, FilterManager.MAX_TMP_TEXTURE);
		}

		msaa = msaa && this.context.glVersion === 2;

		const key = `${width}_${height}_${~~msaa}`;

		let image: TmpImage2D;

		if (!this._texturePool[key]) {
			this._texturePool[key] = [];
		} else {
			image = this._texturePool[key].pop();
		}

		if (!image) {
			// TODO
			// we have problems with cyclic imports
			// and can't create TmpImage2D class, use a regular Image2D with mixin
			image = <TmpImage2D>(new Image2D(width, height, true));
			image.poolKey = key;
			image.antialiasQuality = msaa ? 8 : 0;
		}

		return image;
	}

	public pushTemp (image: Image2D) {
		const im = <TmpImage2D> image;

		if (im && im.poolKey) {
			this._texturePool[im.poolKey].push(im);
		}
	}

	private _initFilterElements() {

		if (this._filterVertexBuffer) {
			return;
		}

		this._filterVertexBuffer = this.context.createVertexBuffer(6, 8);
		this._filterVertexBuffer.uploadFromArray(
			new Float32Array([
				0, 0,
				1, 1,
				1, 0,
				0, 0,
				0, 1,
				1, 1
			]), 0, 6);

		this._filterSampler = new ImageSampler(false, false, false);
	}

	private _bindFilterElements() {
		const ctx = this.context;

		if (!this._filterVAO) {
			// if there are not VAO, but support - create it and bind for attach attributes
			const vao = ctx.hasVao ? ctx.createVao() : null;
			vao && vao.bind();

			ctx.setVertexBufferAt(0, this._filterVertexBuffer, 0, ContextGLVertexBufferFormat.FLOAT_2);

			this._filterVAO = vao;

		} else {
			// already init, bind it
			this._filterVAO.bind();
		}
	}

	private _unbindFilterElements() {
		// to be sure that VAO wasn't corrupted by next shader
		this._filterVAO && this._filterVAO.unbind(true);
	}

	public getFilter(name: string, props?: IBitmapFilterProps): IBitmapFilter<any, any> {
		if (!this._filterCache[name] && !this._filterConstructors[name]) {
			console.warn('[FilterManager] Filter not implemented:', name);
			return null;
		}

		const filter = this._filterCache[name];

		if (filter) {
			filter.applyProps(props);
			return filter;
		}

		return this._filterCache[name] = new this._filterConstructors[name](props);
	}

	public applyFilter (
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		destRectOrPoint: Rectangle | Point,
		_filterNameOrProps: string | IBitmapFilterProps, // legacy
		_options?: IBitmapFilterProps,
		_clearOutput: boolean = false
	): boolean {
		const options = typeof _filterNameOrProps === 'string' ? _options : _filterNameOrProps;

		if (!options || !options.filterName) {
			return false;
		}

		const name = options.filterName;
		const filter = this.getFilter(name, options);

		if (!filter || !filter.isValid) {
			return false;
		}

		this.renderFilter(
			source,
			target,
			sourceRect || source.rect,
			destRectOrPoint || source.rect,
			<FilterBase><any>filter
		);

		return true;
	}

	public computeFiltersPadding(
		bounds: Rectangle,
		options: Array<IBitmapFilterProps>,
		target: Rectangle = bounds.clone()
	): Rectangle {

		for (const prop of options) {
			// can be NULL for unimplemented filters
			if (!prop) {
				continue;
			}

			const filter = this.getFilter(prop.filterName, prop);

			if (!filter || !filter.isValid) {
				continue;
			}

			FilterUtils.nonAlocUnion(
				target,
				filter.meashurePad(bounds, tmpInputRectCopy),
				target
			);
		}

		return target;
	}

	public applyFilters(
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		destRectOrPoint: Rectangle | Point,
		options: Array<IBitmapFilterProps>
	): boolean {
		const opts = options.filter((e) => e && this._filterConstructors[e.filterName]);

		if (opts.length === 0)
			return false;

		if (opts.length === 1) {
			const filter = <FilterBase> this.getFilter(opts[0].filterName, opts[0]);

			if (!filter.isValid) {
				return false;
			}

			this.renderFilter(
				source,
				target,
				sourceRect || source.rect,
				destRectOrPoint || source.rect,
				filter,
				true
			);

			return true;
		}

		let flip = this.popTemp(target.width, target.height);
		let flop = this.popTemp(target.width, target.height);

		for (let i = 0; i < opts.length; i++) {
			const filter = <FilterBase> this.getFilter(opts[i].filterName, opts[i]);

			if (!filter.isValid) {
				return false;
			}

			const inputImage = i === 0 ? source : flip;
			const outputImage = (i === opts.length - 1) ? target : flop;

			this.renderFilter(
				inputImage,
				outputImage,
				sourceRect || source.rect,
				destRectOrPoint || source.rect,
				filter,
				i < (opts.length - 1)
			);

			[flip, flop] = [flop, flip];
		}

		this.pushTemp(flip);
		this.pushTemp(flop);

		return true;
	}

	/*internal*/ drawTask (task: TaskBase) {
		const stage = this._stage;
		const context = this.context;

		context.setProgram(task.getProgram(stage));
		//context.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL); 

		// bind filter elements for first pass after set program
		if (!this._activeFilterTask) {
			this._bindFilterElements();
		}

		this._activeFilterTask = task;

		task.activate(stage, null, null);

		context.drawVertices(ContextGLDrawMode.TRIANGLES,0, 6);

		// maybe MSAA, present is required
		context._texContext._currentRT.present();

		task.deactivate(stage);
	}

	public renderFilter(
		source: Image2D,
		target: Image2D,
		inputRect: Rectangle,
		outputRect: Rectangle | Point,
		filter: FilterBase,
		clearOutput = false
	): void {

		if (source.width * source.height === 0) {
			return;
		}

		if ((inputRect.width * inputRect.height | 0)  === 0) {
			return;
		}

		this._initFilterElements();

		const outRect = tmpOutputRectFilter;

		if (outputRect instanceof Point) {
			outRect.setTo(
				outputRect.x,
				outputRect.y,
				inputRect.width,
				inputRect.height
			);

		} else {
			outRect.copyFrom(outputRect);
		}

		if ((outRect.width * outRect.height | 0) === 0) {
			return;
		}

		// tmp texture, avoid framebuffer loop
		let output = target;
		if (source === target) {
			// we render to tmp, not require use offset
			output = this.popTemp(outRect.width, outRect.height);
			outRect.x = 0;
			outRect.y = 0;
		}

		filter.apply(source, output, inputRect, outRect, this, source === target);

		if (source === target) {
			// copy output to target texture
			this.copyPixels(output, target, outRect, outputRect as Point, false);
			this.pushTemp(output as TmpImage2D);
		}

		filter.clear(this);

		this.stage.setScissor(null);
		this._unbindFilterElements();
		this._activeFilterTask = null;
	}

	public copyPixels(
		source: Image2D, target: Image2D,
		rect: Rectangle, destPoint: Point,
		mergeAlpha: boolean = false,
		blend: string = '',
	): void {

		//early out for values that won't produce any visual update
		if (destPoint.x < -rect.width
			|| destPoint.x > target.width
			|| destPoint.y < -rect.height
			|| destPoint.y > target.height) {
			return;
		}

		// copy empty is redundant
		if ((rect.width * rect.height | 0) === 0) {
			return;
		}

		const inputRect = tmpInputRectCopy;
		inputRect.copyFrom(rect);

		const outputRect = tmpOutputRectCopy;
		outputRect.setTo(
			destPoint.x,
			destPoint.y,
			rect.width,
			rect.height
		);

		// clamp input rect above source size
		// we can't use data outside
		if (inputRect.x < 0) {
			inputRect.width -= -inputRect.x;
			outputRect.x += -inputRect.x;
			inputRect.x = 0;
		}

		if (inputRect.y < 0) {
			inputRect.height -= -inputRect.y;
			outputRect.y += -inputRect.y;
			inputRect.y = 0;
		}

		if (inputRect.right > source.width) {
			const delta = source.width - inputRect.right;
			inputRect.width -= delta;
		}

		if (inputRect.bottom > source.height) {
			const delta = source.height - inputRect.bottom;
			inputRect.height -= delta;
		}

		if (outputRect.x < 0) {
			inputRect.x += -outputRect.x;
			inputRect.width -= -outputRect.x;
			outputRect.x = 0;
		}

		if (outputRect.y < 0) {
			inputRect.y += -outputRect.y;
			inputRect.height -= -outputRect.y;
			outputRect.y = 0;
		}

		if (inputRect.width > target.width - outputRect.x)
			inputRect.width = target.width - outputRect.x;

		if (inputRect.height > target.height - outputRect.y)
			inputRect.height = target.height - outputRect.y;

		// we should use same size of output, because we should not change rectangle dimension, only offset
		outputRect.width = inputRect.width;
		outputRect.height = inputRect.height;

		// we should be sure that output rect is not zero, otherwise will be wrong output
		if (Math.floor(outputRect.width * outputRect.height) === 0) {
			return;
		}

		// target image has MSAA
		const msaa = this.context.glVersion === 2 && (<any>target).antialiasQuality > 0;
		const needFilter = mergeAlpha || msaa || blend;

		let tmp: Image2D;
		// copy to TMP, because we can't copy pixels from itself
		if (target === source) {
			tmp = this.popTemp(source.width, source.height);

			this._stage.setRenderTarget(source, false, 0, 0, true);
			this._stage.setScissor(null);

			// TS !== AS3, it use a auto-type inference, not needed to insert it in all places
			const tmpImageAbst = tmp.getAbstraction<_Stage_ImageBase>(this._stage);
			this.context.copyToTexture(<TextureBaseWebGL>tmpImageAbst.getTexture(), source.rect, tmpZERO);

			this._stage.setRenderTarget(tmp, false, 0, 0, true);
		}

		if (needFilter) {
			const copy = this._copyPixelFilter = <ColorMatrixFilter> this.getFilter(ColorMatrixFilter.filterName);

			copy.blend = blend;
			copy.requireBlend = mergeAlpha;

			this.renderFilter(source, target, inputRect, outputRect,  copy);
			copy.requireBlend = true;

		} else {
			if (!tmp) {
				this._stage.setRenderTarget(source, false, 0, 0, true);
				this._stage.setScissor(null);
			}

			// TS !== AS3, it use a auto-type inference, not needed to insert it in all places
			const targetImageAbst = target.getAbstraction<_Stage_ImageBase>(this._stage);

			this.context.copyToTexture(<TextureBaseWebGL>targetImageAbst.getTexture(), inputRect, outputRect.topLeft);
		}

		if (tmp) {
			this.pushTemp(tmp);
		}

		// reset target
		this._stage.setRenderTarget(null);
	}

	public threshold(
		source: Image2D, target: Image2D,
		rect: Rectangle, destPoint: Point,
		operation: string, threshold: number,
		color: number, mask: number, copySource: boolean): void {

		//early out for values that won't produce any visual update
		if (destPoint.x < -rect.width
			|| destPoint.x > target.width
			|| destPoint.y < -rect.height
			|| destPoint.y > target.height) {
			return;
		}

		if (!this._thresholdFilter)
			this._thresholdFilter = new ThresholdFilter();

		this._thresholdFilter.operation = <any>operation;
		this._thresholdFilter.threshold = threshold;
		this._thresholdFilter.color = color;
		this._thresholdFilter.mask = mask;
		// if we copy self to self with same location - this means that anyways source pixel will used
		// without this hack need use a more complex implementation
		// eslint-disable-next-line max-len
		this._thresholdFilter.copySource = copySource || (source === target && rect.x === destPoint.x && rect.y === destPoint.y);

		this.renderFilter(source, target, rect, destPoint, this._thresholdFilter);
	}

	public colorTransform(source: Image2D, target: Image2D, rect: Rectangle, colorTransform: ColorTransform): void {
		if (!this._copyPixelFilter) {
			this._copyPixelFilter = <ColorMatrixFilter> this.getFilter(ColorMatrixFilter.filterName);
		}

		this._copyPixelFilter.blend = '';
		this._copyPixelFilter.requireBlend = false;
		this._copyPixelFilter.colorTransform = colorTransform;

		this.renderFilter(source, target, rect, rect, this._copyPixelFilter);

		this._copyPixelFilter.colorTransform = null;
	}

}