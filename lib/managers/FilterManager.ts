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

export class FilterManager {

	private _filterVertexBuffer: VertexBufferWebGL;
	private _filterIndexBuffer: IndexBufferWebGL;
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

		if (!this._filterVertexBuffer) {
			this._filterVertexBuffer = this.context.createVertexBuffer(4, 20);
			this._filterVertexBuffer.uploadFromArray(
				new Float32Array([
					-1, -1,
					0, 0,
					0, 1,
					-1, 1,
					0, 1,
					1, 1,
					1, 1,
					2, -1,
					1, 0,
					1, 3]), 0, 4);
		}

		if (!this._filterIndexBuffer) {
			this._filterIndexBuffer = this.context.createIndexBuffer(6);
			this._filterIndexBuffer.uploadFromArray(new Uint16Array([
				2, 1, 0,
				3, 2, 0]), 0, 6);
		}

		if (!this._filterSampler)
			this._filterSampler = new ImageSampler(false, true, false);
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

		this.renderFilter(target,<Filter3DBase><any>filter);
	}

	public renderFilter(target: Image2D, filter: Filter3DBase) {

		this._initFilterElements();

		filter.init(this.context);
		filter.setRenderTargets(target, this._stage);

		//render
		const indexBuffer = this._filterIndexBuffer;
		const tasks = filter.tasks;
		const len = tasks.length;
		const hasVao = this.context.hasVao;

		let vertexBuffer: VertexBufferWebGL = this._filterVertexBuffer;
		let needUploadVao = false;

		if (len > 1 || tasks[0].target) {
			this.context.setProgram(tasks[0].getProgram(this._stage));

			if (hasVao && !tasks[0].vao) {
				if (!tasks[0].vao) {
					tasks[0].vao = this.context.createVao();
					needUploadVao = true;
				}
			}

			tasks[0].vao && tasks[0].vao.bind();

			if (needUploadVao || !tasks[0].vao) {

				this.context.setVertexBufferAt(
					tasks[0]._positionIndex, vertexBuffer, 0, ContextGLVertexBufferFormat.FLOAT_2);

				this.context.setVertexBufferAt(
					tasks[0]._uvIndex, vertexBuffer, 8, ContextGLVertexBufferFormat.FLOAT_2);
			}

			// we should bound index buffer to VAO
			if (needUploadVao) {
				(<ContextWebGL> this.context).bindIndexBuffer(indexBuffer);
			}
		}

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

			if (!task.target) {

				if (hasVao && !task.vao) {
					tasks[0].vao = this.context.createVao();
					needUploadVao = true;
				}

				task.vao && task.vao.bind();

				// we should a bind a aatributes ONCE or every call, if not VAO
				if (needUploadVao || !task.vao) {
					vertexBuffer = this._filterVertexBuffer;
					this.context.setVertexBufferAt(
						task._positionIndex, vertexBuffer, 0, ContextGLVertexBufferFormat.FLOAT_2);

					this.context.setVertexBufferAt(
						task._uvIndex, vertexBuffer, 8, ContextGLVertexBufferFormat.FLOAT_2);
				}

				// we should bound index buffer to VAO to
				// but for index buffer draw bound it internally when it no from VAO
				if (needUploadVao) {
					task.vao.attachIndexBuffer(<IndexBufferWebGL>indexBuffer);
				}
			}

			task.activate(this._stage, null, null);

			this.context.drawIndices(ContextGLDrawMode.TRIANGLES, indexBuffer, 0, 6);

			task.deactivate(this._stage);
		}

		if (hasVao) {
			// mark that need unbind VAO if it present
			// because otherwithe we can rewrite a buffers inside it
			(<ContextWebGL> this.context)._vaoContext.bindVertexArray(null);
		}

		// disable vertex pointer because we not use a VAO
		hasVao || this.context.setVertexBufferAt(0, null);
		hasVao || this.context.setVertexBufferAt(1, null);
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