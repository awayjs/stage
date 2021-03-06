import { Rectangle, EventDispatcher } from '@awayjs/core';

import { IVertexBuffer } from '../base/IVertexBuffer';
import { IIndexBuffer } from '../base/IIndexBuffer';
import { IContextGL } from '../base/IContextGL';
import { RTTEvent } from '../events/RTTEvent';
import ImageUtils from '../utils/ImageUtils';
import { Stage } from '../Stage';

export class RTTBufferManager extends EventDispatcher {
	private static _instances: Array<RTTBufferManagerVO>;

	private _renderToTextureVertexBuffer: IVertexBuffer;
	private _renderToScreenVertexBuffer: IVertexBuffer;

	private _indexBuffer: IIndexBuffer;
	private _stage: Stage;
	private _powerOfTwo: boolean;
	private _viewOffsetX: number = 0;
	private _viewOffsetY: number = 0;
	private _viewWidth: number = -1;
	private _viewHeight: number = -1;
	private _textureWidth: number = -1;
	private _textureHeight: number = -1;
	private _renderToTextureRect: Rectangle;
	private _buffersInvalid: boolean = true;

	private _textureRatioX: number;
	private _textureRatioY: number;

	constructor(stage: Stage, powerOfTwo: boolean = true) {
		super();

		this._renderToTextureRect = new Rectangle();

		this._stage = stage;
		this._powerOfTwo = powerOfTwo;

	}

	public static getInstance(stage: Stage): RTTBufferManager {
		if (!stage)
			throw new Error('stage key cannot be null!');

		if (RTTBufferManager._instances == null)
			RTTBufferManager._instances = new Array<RTTBufferManagerVO>();

		let rttBufferManager: RTTBufferManager = RTTBufferManager.getRTTBufferManagerFromStage(stage);

		if (rttBufferManager == null) {
			rttBufferManager = new RTTBufferManager(stage);

			const vo: RTTBufferManagerVO = new RTTBufferManagerVO();

			vo.stage3d = stage;
			vo.rttbfm = rttBufferManager;

			RTTBufferManager._instances.push(vo);
		}

		return rttBufferManager;

	}

	private static getRTTBufferManagerFromStage(stage: Stage): RTTBufferManager {

		const l: number = RTTBufferManager._instances.length;
		let r: RTTBufferManagerVO;

		for (let c: number = 0; c < l; c++) {
			r = RTTBufferManager._instances[c];

			if (r.stage3d === stage)
				return r.rttbfm;
		}

		return null;
	}

	private static deleteRTTBufferManager(stage: Stage): void {
		const l: number = RTTBufferManager._instances.length;
		let r: RTTBufferManagerVO;

		for (let c: number = 0; c < l; c++) {
			r = RTTBufferManager._instances[c];

			if (r.stage3d === stage) {
				RTTBufferManager._instances.splice(c, 1);
				return;
			}
		}
	}

	public get textureRatioX(): number {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._textureRatioX;
	}

	public get textureRatioY(): number {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._textureRatioY;
	}

	public get viewOffsetX(): number {
		return this._viewOffsetX;
	}

	public set viewOffsetX(value: number) {
		this._viewOffsetX = value;

		this._buffersInvalid = true;
	}

	public get viewOffsetY(): number {
		return this._viewOffsetY;
	}

	public set viewOffsetY(value: number) {
		this._viewOffsetY = value;

		this._buffersInvalid = true;
	}

	public get viewWidth(): number {
		return this._viewWidth;
	}

	public set viewWidth(value: number) {
		if (value == this._viewWidth)
			return;

		this._viewWidth = value;

		this._buffersInvalid = true;

		this._textureWidth = this._powerOfTwo ? ImageUtils.getBestPowerOf2(this._viewWidth) : this._viewWidth;

		if (this._textureWidth > this._viewWidth) {
			this._renderToTextureRect.x = Math.floor((this._textureWidth - this._viewWidth) * .5);
			this._renderToTextureRect.width = this._viewWidth;
		} else {
			this._renderToTextureRect.x = 0;
			this._renderToTextureRect.width = this._textureWidth;
		}

		this.dispatchEvent(new RTTEvent(RTTEvent.RESIZE, this));
	}

	public get viewHeight(): number {
		return this._viewHeight;
	}

	public set viewHeight(value: number) {
		if (value == this._viewHeight)
			return;

		this._viewHeight = value;

		this._buffersInvalid = true;

		this._textureHeight = this._powerOfTwo ? ImageUtils.getBestPowerOf2(this._viewHeight) : this._viewHeight;

		if (this._textureHeight > this._viewHeight) {
			this._renderToTextureRect.y = Math.floor((this._textureHeight - this._viewHeight) * .5);
			this._renderToTextureRect.height = this._viewHeight;
		} else {
			this._renderToTextureRect.y = 0;
			this._renderToTextureRect.height = this._textureHeight;
		}

		this.dispatchEvent(new RTTEvent(RTTEvent.RESIZE, this));
	}

	public get renderToTextureVertexBuffer(): IVertexBuffer {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._renderToTextureVertexBuffer;
	}

	public get renderToScreenVertexBuffer(): IVertexBuffer {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._renderToScreenVertexBuffer;

	}

	public get indexBuffer(): IIndexBuffer {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._indexBuffer;
	}

	public get renderToTextureRect(): Rectangle {
		if (this._buffersInvalid)
			this.updateRTTBuffers();

		return this._renderToTextureRect;
	}

	public get textureWidth(): number {
		return this._textureWidth;
	}

	public get textureHeight(): number {
		return this._textureHeight;
	}

	public dispose(): void {
		RTTBufferManager.deleteRTTBufferManager(this._stage);

		if (this._indexBuffer) {
			this._indexBuffer.dispose();
			this._renderToScreenVertexBuffer.dispose();
			this._renderToTextureVertexBuffer.dispose();
			this._renderToScreenVertexBuffer = null;
			this._renderToTextureVertexBuffer = null;
			this._indexBuffer = null;
		}
	}

	// todo: place all this in a separate model, since it's used all over the place
	// maybe it even has a place in the core (together with screenRect etc)?
	// needs to be stored per view of course
	private updateRTTBuffers(): void {
		const context: IContextGL = this._stage.context;
		let textureVerts: Float32Array;
		let screenVerts: Float32Array;

		let x: number;
		let y: number;

		if (this._renderToTextureVertexBuffer == null)
			this._renderToTextureVertexBuffer = context.createVertexBuffer(4, 20);

		if (this._renderToScreenVertexBuffer == null)
			this._renderToScreenVertexBuffer = context.createVertexBuffer(4, 20);

		if (!this._indexBuffer) {
			this._indexBuffer = context.createIndexBuffer(6);

			this._indexBuffer.uploadFromArray(new Uint16Array([2, 1, 0, 3, 2, 0]), 0, 6);
		}

		this._textureRatioX = x = Math.min(this._viewWidth / this._textureWidth, 1);
		this._textureRatioY = y = Math.min(this._viewHeight / this._textureHeight, 1);

		const u1: number = (1 - x) * .5;
		const u2: number = (x + 1) * .5;
		const v1: number = (1 - y) * .5;
		const v2: number = (y + 1) * .5;

		// last element contains indices for data per vertex that can be passed to the vertex shader if necessary (ie: frustum corners for deferred rendering)
		textureVerts = new Float32Array([-x, -y, u1, v1, 0, x, -y, u2, v1, 1, x, y, u2, v2, 2, -x, y, u1, v2, 3]);

		screenVerts = new Float32Array([-1, -1, u1, v1, 0, 1, -1, u2, v1, 1, 1, 1, u2, v2, 2, -1, 1, u1, v2, 3]);

		this._renderToTextureVertexBuffer.uploadFromArray(textureVerts, 0, 4);
		this._renderToScreenVertexBuffer.uploadFromArray(screenVerts, 0, 4);

		this._buffersInvalid = false;
	}
}

class RTTBufferManagerVO {
	public stage3d: Stage;

	public rttbfm: RTTBufferManager;
}