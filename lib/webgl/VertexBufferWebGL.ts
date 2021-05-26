import { IVertexBuffer } from '../base/IVertexBuffer';
import { IUnloadable } from '../managers/UnloadManager';
import { Settings } from '../Settings';
import { BufferPool } from './BufferPool';
import { ContextWebGL } from './ContextWebGL';

type TTypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array;

export class VertexBufferWebGL implements IVertexBuffer, IUnloadable {
	private static _pool: BufferPool<VertexBufferWebGL>;

	public static get pool() {
		if (!Settings.ENABLE_BUFFER_POOLING) return null;
		return this._pool || (this._pool = new BufferPool(VertexBufferWebGL));
	}

	public static create(context: ContextWebGL, numVertices: number, dataPerVertex: number) {
		if (!Settings.ENABLE_BUFFER_POOLING) {
			return new VertexBufferWebGL(context, numVertices, dataPerVertex);
		}

		return this.pool.create(context, numVertices, dataPerVertex);
	}

	private _gl: WebGLRenderingContext;
	private _numVertices: number;
	private _dataPerVertex: number;
	private _buffer: WebGLBuffer;
	private _lastMemoryUsage: number = 0;

	public instanced: boolean = false;
	public lastUsedTime: number;
	public canUnload: boolean = true;

	constructor(private _context: ContextWebGL, numVertices: number, dataPerVertex: number) {
		this._gl = _context._gl;
		this._buffer = this._gl.createBuffer();
		this._numVertices = numVertices;
		this._dataPerVertex = dataPerVertex;

		_context.stats.counter.vertex++;
	}

	public uploadFromArray(
		array: TTypedArray, startVertex: number = 0, _numVertices: number = this._numVertices
	): void {
		this.uploadFromByteArray(array.buffer, startVertex, _numVertices);
	}

	public uploadFromByteArray(data: ArrayBuffer, startVertex: number, _numVertices: number): void {
		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);

		this._context.stats.memory.vertex -= this._lastMemoryUsage;
		this._lastMemoryUsage = data.byteLength - startVertex * this._dataPerVertex;
		this._context.stats.memory.vertex += this._lastMemoryUsage;

		if (startVertex)
			this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex * this._dataPerVertex, data);
		else
			this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
	}

	public get numVertices(): number {
		return this._numVertices;
	}

	public get dataPerVertex(): number {
		return this._dataPerVertex;
	}

	public get glBuffer(): WebGLBuffer {
		return this._buffer;
	}

	public dispose(): void {
		if (Settings.ENABLE_BUFFER_POOLING && VertexBufferWebGL.pool.store(this)) {
			return;
		}

		this.unload();
	}

	apply(_gl: WebGLRenderingContext, numVertices: number, dataPerVertex: number) {
		this._numVertices = numVertices;
		this._dataPerVertex = dataPerVertex;
	}

	public unload(): void {
		Settings.ENABLE_BUFFER_POOLING && VertexBufferWebGL.pool.remove(this);

		this._gl.deleteBuffer(this._buffer);
		this._buffer = null;
		this._context.stats.counter.vertex--;
		this._context.stats.memory.vertex -= this._lastMemoryUsage;
	}
}