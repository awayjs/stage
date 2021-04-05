import { ColorTransform, Point, Rectangle } from '@awayjs/core';

import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';
import { Image2D } from '../image/Image2D';
import { _Stage_ImageBase } from '../image/ImageBase';
import { ImageSampler } from '../image/ImageSampler';
import { Stage } from '../Stage';
import { ContextWebGL } from '../webgl/ContextWebGL';
import { TextureBaseWebGL } from '../webgl/TextureBaseWebGL';
import { VertexBufferWebGL } from '../webgl/VertexBufferWebGL';
import { IVao } from '../base/IVao';
import { ContextGLClearMask } from '../base/ContextGLClearMask';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { FilterUtils } from '../utils/FilterUtils';
import {
	DisplacementFilter,
	BlurFilter,
	BevelFilter,
	ThresholdFilter,
	ColorMatrixFilter,
	FilterBase,
	IBitmapFilter,
	IBitmapFilterProps
} from '../filters';

type TmpImage2D = Image2D & {poolKey: string, antialiasQuality: number};

const tmpRect0 = new Rectangle();

export class FilterManager {
	private static MAX_TMP_TEXTURE = 4096;
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

	private get context(): ContextWebGL {
		return  <ContextWebGL> this._stage.context;
	}

	private readonly _filterCache: Record<string, IBitmapFilter<any, any>> = {};
	private _filterConstructors: Record<string, { new(opt?: any): IBitmapFilter<any, any> }> = {
		[BevelFilter.filterName]: BevelFilter,
		[BlurFilter.filterName]: BlurFilter,
		[DisplacementFilter.filterName]: DisplacementFilter,
		[ColorMatrixFilter.filterName]: ColorMatrixFilter,
	}

	constructor (private _stage: Stage) {
		FilterManager._instance = this;
	}

	public popTemp (width: number, height: number, msaa: boolean = false): TmpImage2D {
		width = Math.max(FilterManager.MIN_TMP_TEXTURE, 2 << Math.log2(width - 1));
		height = Math.max(FilterManager.MIN_TMP_TEXTURE, 2 << Math.log2(height - 1));

		if (width > FilterManager.MAX_TMP_TEXTURE || height > FilterManager.MAX_TMP_TEXTURE) {

			// eslint-disable-next-line max-len
			console.warn(`[Filter manager] Temporary texture size ${width}x${height} is bigger that limit, clamp to ${FilterManager.MAX_TMP_TEXTURE}`);

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

		this._filterSampler = new ImageSampler(false, true, false);
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

	private _unbindFilterElemens() {
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
	): boolean {
		const options = typeof _filterNameOrProps === 'string' ? _options : _filterNameOrProps;

		if (!options || !options.filterName) {
			return false;
		}

		const name = options.filterName;
		const filter = this.getFilter(name, options);

		if (!filter) {
			return false;
		}

		this.context.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA);
		this.renderFilter(
			source,
			target,
			sourceRect || source.rect,
			destRectOrPoint || source.rect, <FilterBase><any>filter);

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

			if (!filter) {
				continue;
			}

			FilterUtils.nonAlocUnion(
				target,
				filter.meashurePad(bounds, tmpRect0),
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

		if (opts.length === 1)
			return this.applyFilter(source, target, sourceRect, destRectOrPoint, opts[0]);

		let flip = this.popTemp(target.width, target.height);
		let flop = this.popTemp(target.width, target.height);

		for (let i = 0; i < opts.length; i++) {
			this.applyFilter(
				(i === 0) ? source : flip,
				(i === opts.length - 1) ? target : flop,
				sourceRect,
				destRectOrPoint,
				opts[i]
			);

			[flip, flop] = [flop, flip];
		}

		this.pushTemp(flip);
		this.pushTemp(flop);
	}

	public renderFilter(
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		targetRect: Rectangle | Point,
		filter: FilterBase
	): void {

		this._initFilterElements();

		const outRect = tmpRect0;

		if (targetRect instanceof Point) {
			outRect.setTo(
				targetRect.x,
				targetRect.y,
				sourceRect.width,
				sourceRect.height
			);
		} else {
			outRect.copyFrom(targetRect);
		}

		const renderToSelf = source === target;

		// tmp texture, avoid framebuffer loop
		let output = target;
		if (renderToSelf) {
			// we render to tmp, not require use offset
			output = this.popTemp(outRect.width, outRect.height);
			outRect.x = 0;
			outRect.y = 0;
		}

		filter.setRenderState(
			source, output,
			sourceRect, outRect,
			this
		);

		//render
		const tasks = filter.tasks;

		if (filter.requireBlend) {
			// context will enable blend when it was changed
			this.context.setBlendFactors(filter.blendSrc, filter.blendDst);
		} else {
			this.context.setBlendState(false);
		}

		this.context.setCulling(ContextGLTriangleFace.NONE);

		// vao binds require shader, other shaders MUST use same locations
		this.context.setProgram(tasks[0].getProgram(this._stage));
		this._bindFilterElements();

		const count = tasks.length;
		for (let i = 0; i < count; i++) {
			const task = tasks[i];

			task.preActivate(this._stage);
			this._stage.setRenderTarget(task.target, false);
			this._stage.setScissor(task.clipRect);

			// because we use TMP image, need clear it
			// but this is needed only when a blend composer is required, when a copy filter used
			if (renderToSelf && filter.requireBlend || task.needClear) {
				this._stage.clear(0,0,0,0,0,0, ContextGLClearMask.ALL);
			}

			this.context.setProgram(task.getProgram(this._stage));
			this.context.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL);

			if (!task.activateInternaly) {
				task.source
					.getAbstraction<_Stage_ImageBase>(this._stage)
					.activate(task.sourceSamplerIndex, this._filterSampler);
			}

			task.activate(this._stage, null, null);

			this.context.drawVertices(ContextGLDrawMode.TRIANGLES,0, 6);

			task.deactivate(this._stage);
		}

		if (renderToSelf) {
			// copy output to target texture
			this.copyPixels(output, target, outRect, targetRect as Point, false);
			this.pushTemp(output as TmpImage2D);
		}

		filter.clear(this);
		this._stage.setScissor(null);
		this._unbindFilterElemens();
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

		// target image has MSAA
		const msaa = this.context.glVersion === 2 && (<any>target).antialiasQuality > 0;

		if (mergeAlpha || msaa || blend) {

			if (!this._copyPixelFilter) {
				this._copyPixelFilter = <ColorMatrixFilter> this.getFilter(ColorMatrixFilter.filterName);
			}

			this._copyPixelFilter.blend = blend;
			// because we in MSAA mode, but not has mergeAlpha - kill blending;
			this._copyPixelFilter.requireBlend = mergeAlpha;

			this.renderFilter(source, target, rect, destPoint,  this._copyPixelFilter);

			this._copyPixelFilter.requireBlend = true;
		} else {
			rect = rect.clone();
			destPoint = destPoint.clone();

			if (destPoint.x < 0) {
				rect.x -= destPoint.x;
				rect.width += destPoint.x;
				destPoint.x = 0;
			}

			if (destPoint.y < 0) {
				rect.y -= destPoint.y;
				rect.height += destPoint.y;
				destPoint.y = 0;
			}

			if (rect.width > target.width - destPoint.x)
				rect.width = target.width - destPoint.x;

			if (rect.height > target.height - destPoint.y)
				rect.height = target.height - destPoint.y;

			this._stage.setRenderTarget(source, false);
			this._stage.setScissor(null);

			// TS !== AS3, it use a auto-type inference, not needed to insert it in all places
			const targetImageAbst = target.getAbstraction<_Stage_ImageBase>(this._stage);

			this.context.copyToTexture(<TextureBaseWebGL> targetImageAbst.getTexture(), rect, destPoint);
		}
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
		this._thresholdFilter.copySource = copySource;

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