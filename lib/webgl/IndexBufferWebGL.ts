import { IIndexBuffer } from '../base/IIndexBuffer';
import { IUnloadable } from '../managers/UnloadManager';
import { Settings } from '../Settings';
import { BufferPool } from './BufferPool';

export class IndexBufferWebGL implements IIndexBuffer, IUnloadable {

	private static _pool: BufferPool<IndexBufferWebGL>;

	public static get pool() {
		if (!Settings.ENABLE_BUFFER_POOLING) return null;
		return this._pool || (this._pool = new BufferPool(IndexBufferWebGL));
	}

	public static create(gl: WebGLRenderingContext, numIndices: number) {
		if (!Settings.ENABLE_BUFFER_POOLING) {
			return new IndexBufferWebGL(gl, numIndices);
		}

		return this.pool.create(gl, numIndices);
	}

	public lastUsedTime: number;
	public canUnload: boolean = true;

	private _gl: WebGLRenderingContext;
	private _numIndices: number;
	private _buffer: WebGLBuffer;

	constructor(gl: WebGLRenderingContext, numIndices: number) {
		this._gl = gl;
		this._buffer = this._gl.createBuffer();
		this._numIndices = numIndices;
	}

	public uploadFromArray(array: Uint16Array, startOffset: number, count: number): void {
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);

		if (startOffset)
			this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, array);
		else
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, array, this._gl.STATIC_DRAW);
	}

	public uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number): void {
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);

		if (startOffset)
			this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, data);
		else
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
	}

	public dispose(): void {
		if (Settings.ENABLE_BUFFER_POOLING && IndexBufferWebGL.pool.store(this)) {
			return;
		}

		this.unload();
	}

	public apply(gl: WebGLRenderingContext, numIndices: number) {
		this._numIndices = numIndices;
	}

	public unload(): void {
		Settings.ENABLE_BUFFER_POOLING && IndexBufferWebGL.pool.remove(this);
		this._gl.deleteBuffer(this._buffer);
	}

	public get numIndices(): number {
		return this._numIndices;
	}

	public get glBuffer(): WebGLBuffer {
		return this._buffer;
	}
}