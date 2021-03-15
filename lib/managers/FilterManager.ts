import { ColorTransform, Point, Rectangle } from '@awayjs/core';

import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';
import { CopyPixelFilter3D } from '../filters/CopyPixelFilter3D';
import { Filter3DBase } from '../filters/Filter3DBase';
import { Filter3DBevel } from '../filters/Filter3DBevel';
import { IUniversalFilter } from '../filters/IUniversalFilter';
import { ThresholdFilter3D } from '../filters/ThresholdFilter3D';
import { Image2D } from '../image/Image2D';
import { _Stage_ImageBase } from '../image/ImageBase';
import { ImageSampler } from '../image/ImageSampler';
import { Stage } from '../Stage';
import { ContextWebGL } from '../webgl/ContextWebGL';
import { IndexBufferWebGL } from '../webgl/IndexBufferWebGL';
import { TextureBaseWebGL } from '../webgl/TextureBaseWebGL';
import { VertexBufferWebGL } from '../webgl/VertexBufferWebGL';
import { IVao } from '../base/IVao';

export class FilterManager {

	private _filterVertexBuffer: VertexBufferWebGL;
	private _filterIndexBuffer: IndexBufferWebGL;
	private _filterVAO: IVao;

	private _filterSampler: ImageSampler;
	private _copyPixelFilter: CopyPixelFilter3D;
	private _thresholdFilter: ThresholdFilter3D;

	private get context(): ContextWebGL {
		return  <ContextWebGL> this._stage.context;
	}

	private readonly _filterCache: Record<string, IUniversalFilter> = {};
	private _filterConstructors: Record<string, { new(opt?: any): IUniversalFilter }> = {
		//@ts-ignore
		'bevel': Filter3DBevel
	}

	constructor (private _stage: Stage) {
	}

	private _initFilterElements() {

		if (this._filterVertexBuffer) {
			return;
		}

		this._filterVertexBuffer = this.context.createVertexBuffer(4, 20);
		this._filterVertexBuffer.uploadFromArray(
			new Float32Array([
				-1, -1, 0, 0, 0,
				1, -1, 1, 0, 1,
				1, 1, 1, 1, 2,
				-1, 1, 0, 1, 3
			]), 0, 4);

		this._filterIndexBuffer = this.context.createIndexBuffer(6);
		this._filterIndexBuffer.uploadFromArray(new Uint16Array([
			2, 1, 0,
			3, 2, 0]), 0, 6);

		this._filterSampler = new ImageSampler(false, true, false);
	}

	private _bindFilterElements() {
		const ctx = this.context;

		if (!this._filterVAO) {
			// if there are not VAO, but support - create it and bind for attach attributes
			const vao = ctx.hasVao ? ctx.createVao() : null;
			vao && vao.bind();

			ctx.setVertexBufferAt(0, this._filterVertexBuffer, 0, ContextGLVertexBufferFormat.FLOAT_2);
			ctx.setVertexBufferAt(1, this._filterVertexBuffer, 8, ContextGLVertexBufferFormat.FLOAT_2);

			// we can bound index buffer directly, but to track index rebound state should attach it to vao
			vao
				? vao.attachIndexBuffer(this._filterIndexBuffer)
				: ctx.bindIndexBuffer(this._filterIndexBuffer);

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

	public applyFilter (source: Image2D, target: Image2D, filterName: string, options: any): boolean {
		if (!this._filterCache[filterName] && !this._filterConstructors[filterName]) {
			console.warn('[FilterManager] Filter not implemented:', filterName);
			return false;
		}

		let filter = this._filterCache[filterName];

		if (filter) {
			filter.applyModel(options);
		} else {
			filter = this._filterCache[filterName] = new this._filterConstructors[filterName](options);
		}

		(<Filter3DBase><any>filter).setSource(source);

		this.renderFilter(target, <Filter3DBase><any>filter);

		return true;
	}

	public renderFilter(target: Image2D, filter: Filter3DBase) {

		this._initFilterElements();

		filter.init(this.context);
		filter.setRenderTargets(target, this._stage);

		//render
		const indexBuffer = this._filterIndexBuffer;
		const tasks = filter.tasks;

		// bound a require shader, other shader MUST use same locations
		this.context.setProgram(tasks[0].getProgram(this._stage));
		this._bindFilterElements();

		for (const task of tasks) {
			this._stage.setRenderTarget(task.target, false);
			this._stage.setScissor(null);

			this.context.setProgram(task.getProgram(this._stage));
			this.context.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL);

			if (!task.activateInternaly) {
				task.getMainInputTexture(this._stage)
					.getAbstraction<_Stage_ImageBase>(this._stage)
					.activate(task._inputTextureIndex, this._filterSampler);
			}

			task.activate(this._stage, null, null);

			this.context.drawIndices(ContextGLDrawMode.TRIANGLES, indexBuffer, 0, 6);

			task.deactivate(this._stage);
		}

		this._unbindFilterElemens();
	}

	public copyPixels(
		source: Image2D, target: Image2D,
		rect: Rectangle, destPoint: Point,
		alphaBitmapData: Image2D = null, alphaPoint: Point = null,
		mergeAlpha: boolean = false): void {

		//early out for values that won't produce any visual update
		if (destPoint.x < -rect.width
			|| destPoint.x > target.width
			|| destPoint.y < -rect.height
			|| destPoint.y > target.height) {
			return;
		}

		if (mergeAlpha) {

			if (!this._copyPixelFilter) {
				this._copyPixelFilter = new CopyPixelFilter3D();
				this._copyPixelFilter.init(this.context);
			}

			this._copyPixelFilter.sourceTexture = source;
			this._copyPixelFilter.rect = rect;
			this._copyPixelFilter.destPoint = destPoint;

			this.renderFilter(target, this._copyPixelFilter);
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
			this._thresholdFilter = new ThresholdFilter3D();

		this._thresholdFilter.sourceTexture = source;
		this._thresholdFilter.rect = rect;
		this._thresholdFilter.destPoint = destPoint;
		this._thresholdFilter.operation = operation;
		this._thresholdFilter.threshold = threshold;
		this._thresholdFilter.color = color;
		this._thresholdFilter.mask = mask;
		this._thresholdFilter.copySource = copySource;

		this.renderFilter(target, this._thresholdFilter);
	}

	public colorTransform(source: Image2D, target: Image2D, rect: Rectangle, colorTransform: ColorTransform): void {
		if (!this._copyPixelFilter) {
			this._copyPixelFilter = new CopyPixelFilter3D();
			this._copyPixelFilter.init(this.context);
		}

		this._copyPixelFilter.sourceTexture = source;
		this._copyPixelFilter.rect = rect;
		this._copyPixelFilter.destPoint = new Point(0,0);
		this._copyPixelFilter.colorTransform = colorTransform;

		this.renderFilter(target, this._copyPixelFilter);

		this._copyPixelFilter.colorTransform = null;
	}

}