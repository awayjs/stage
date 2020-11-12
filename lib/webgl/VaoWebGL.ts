
import { IVao } from '../base/IVao';
import { ContextWebGL } from './ContextWebGL';
import { IndexBufferWebGL } from './IndexBufferWebGL';

type TWebGLVao = WebGLVertexArrayObjectOES | WebGLVertexArrayObject;

export class VaoContextWebGL {
	public static isSupported(gl: WebGLRenderingContext | WebGL2RenderingContext) {
		if (window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext) {
			return true;
		}

		if (gl.getSupportedExtensions().indexOf('OES_vertex_array_object') > -1) {
			return true;
		}

		return false;
	}

	public readonly createVertexArray: () => TWebGLVao;
	private readonly _deleteVertexArray: (e: TWebGLVao) => void;
	private readonly _bindVertexArray: (e: TWebGLVao) => void;

	/* internal */ _lastBoundedVao: VaoWebGL;
	/* internal */ _isRequireUnbound: boolean = false;

	constructor (context: ContextWebGL) {
		const gl = context._gl;

		if (!VaoContextWebGL.isSupported(gl)) {
			throw '[VaoContextWebGL] VAO not supported!';
		}

		if (window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext) {
			this.createVertexArray = gl.createVertexArray.bind(gl);
			this._deleteVertexArray = gl.deleteVertexArray.bind(gl);
			this._bindVertexArray = gl.bindVertexArray.bind(gl);
		} else {
			const ext = gl.getExtension('OES_vertex_array_object');

			this.createVertexArray = ext.createVertexArrayOES.bind(ext);
			this._deleteVertexArray = ext.deleteVertexArrayOES.bind(ext);
			this._bindVertexArray = ext.bindVertexArrayOES.bind(ext);
		}
	}

	unbindVertexArrays() {
		this._bindVertexArray(null);
		this._lastBoundedVao = null;
		this._isRequireUnbound = false;
	}

	bindVertexArray (v: VaoWebGL) {
		// not unbound vao, to reduce bound flips
		if (v === this._lastBoundedVao) {
			this._isRequireUnbound = false;
			return;
		}

		if (!v) {
			// mark that we require a unbound VAO as fast as possible
			this._isRequireUnbound = true;
			return;
		}

		this._isRequireUnbound = false;
		this._lastBoundedVao = v;
		this._bindVertexArray(v._vao);
	}

	deleteVertexArray (v: VaoWebGL) {
		if (this._lastBoundedVao === v) {
			this._bindVertexArray(null);
		}

		this._deleteVertexArray(v._vao);
		this._lastBoundedVao = null;
	}
}

export class VaoWebGL implements IVao {
	/* internal */ _vao: TWebGLVao;
	/* internal */ _indexBuffer: IndexBufferWebGL;

	constructor (private _context: ContextWebGL) {
		this._vao = _context._vaoContext.createVertexArray();
	}

	attachIndexBuffer(buffer: IndexBufferWebGL) {
		if (this._indexBuffer) {
			return;
		}

		this.bind();
		this._context.bindIndexBuffer(buffer);

		this._indexBuffer = buffer;
	}

	bind() {
		this._context._vaoContext.bindVertexArray(this);
	}

	unbind(force = false) {
		if (force) {
			this._context._vaoContext.unbindVertexArrays();
			return;
		}

		this._context._vaoContext.bindVertexArray(null);
	}

	dispose() {
		this._context._vaoContext.deleteVertexArray(this);
		this._vao = null;
	}
}