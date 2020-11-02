import { ContextWebGL } from './ContextWebGL';

type TWebGLVao = WebGLVertexArrayObjectOES | WebGLVertexArrayObject;

export interface IVao {

}

export class VaoContextWebGL {
	public static isSupported(gl: WebGLRenderingContext | WebGL2RenderingContext) {
		if (gl instanceof WebGL2RenderingContext) {
			return true;
		}

		if (gl.getSupportedExtensions().indexOf('OES_vertex_array_object ') > -1) {
			return true;
		}

		return false;
	}

	public readonly createVertexArray: () => TWebGLVao;
	private readonly _deleteVertexArray: (e: TWebGLVao) => void;
	private readonly _bindVertexArray: (e: TWebGLVao) => void;

	/* internal */ _lastBoundedVao: TWebGLVao;

	constructor (context: ContextWebGL) {
		const gl = context._gl;

		if (!VaoContextWebGL.isSupported(gl)) {
			throw '[VaoContextWebGL] VAO not supported!';
		}

		if (gl instanceof WebGL2RenderingContext) {
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
	}

	bindVertexArray (v: TWebGLVao) {
		// not unbound vao, to reduce bound flips
		if (!v || v === this._lastBoundedVao) {
			return;
		}

		this._lastBoundedVao = v;
		this._bindVertexArray(v);
	}

	deleteVertexArray (v: TWebGLVao) {
		if (this._lastBoundedVao) {
			this._bindVertexArray(null);
		}

		this._deleteVertexArray(v);
		this._lastBoundedVao = null;
	}
}

export class VaoWebGL implements IVao {
	/* internal */ _vao: TWebGLVao;

	constructor (private _context: ContextWebGL) {
		this._vao = _context._vaoContext.createVertexArray();
	}

	bind() {
		this._context._vaoContext.bindVertexArray(this._vao);
	}

	unbind(force = false) {
		if (force) {
			this._context._vaoContext.unbindVertexArrays();
			return;
		}
		// not unbound a VAO, because context cached a last referenced VAO
		// this._context._vaoContext.bindVertexArray(null);
	}

	dispose() {
		this._context._vaoContext.deleteVertexArray(this._vao);
		this._vao = null;
	}
}