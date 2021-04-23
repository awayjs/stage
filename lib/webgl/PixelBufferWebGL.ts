import { ContextWebGL } from './ContextWebGL';

export class PixelBufferWebGL {
	static _lastBounded: PixelBufferWebGL;

	public static unboundAll() {
		// if there are bounded, we should unbound it
		if (this._lastBounded) {
			this._lastBounded.unbind();
		}
	}

	public static isSuported(gl: WebGL2RenderingContext | WebGLRenderingContext) {
		return (window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext);
	}

	private _alreadyInit: boolean = false;
	private _gl: WebGL2RenderingContext;
	private _buffer: WebGLBuffer;
	private _size: number = 0;

	get alive() {
		return !!this._buffer;
	}

	constructor (private _contex: ContextWebGL, size = 0) {

		this._gl = <WebGL2RenderingContext> _contex._gl;
		this._buffer = this._gl.createBuffer();
		this._size = size;

		_contex.stats.counter.pbo++;
	}

	/**
	 * sync
	 */
	public read(buffer: Uint8Array) {
		const size = buffer.length;

		if (size <= 0 || size !== this._size) {
			throw 'Buffer length MUST be a same size as buffer on read state!';
		}

		const gl = this._gl;

		if (PixelBufferWebGL._lastBounded !== this) {
			gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._buffer);

			PixelBufferWebGL._lastBounded = this;
		}

		gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buffer);

		//this.unbind();
	}

	/**
	 * bind
	 */
	public bind(size = 0) {
		if (this._size === 0 && size === 0) {
			throw 'Buffer require size for bounding';
		}

		const gl = this._gl;

		if (PixelBufferWebGL._lastBounded !== this)
			gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this._buffer);

		if (!this._alreadyInit || this._size !== size && size > 0) {

			this._contex.stats.memory.pbo -= this._size;

			if (size > 0) {
				this._size = size;
			}

			gl.bufferData(gl.PIXEL_PACK_BUFFER, this._size, gl.DYNAMIC_READ);
			this._alreadyInit = true;
			this._contex.stats.memory.pbo += this._size;
		}

		PixelBufferWebGL._lastBounded = this;
	}

	/**
	 * unbind
	 */
	public unbind() {
		if (PixelBufferWebGL._lastBounded !== this) {
			return;
		}

		this._gl.bindBuffer(this._gl.PIXEL_PACK_BUFFER, null);

		PixelBufferWebGL._lastBounded = null;
	}

	/**
	 * destroy
	 */
	public dispose() {
		this.unbind();
		this._gl.deleteBuffer(this._buffer);
		this._buffer = null;
		this._size = 0;
		this._gl = null;

		this._contex.stats.counter.pbo--;
		this._contex.stats.memory.pbo += this._size;
	}
}