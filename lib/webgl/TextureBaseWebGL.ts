import { AbstractMethodError } from '@awayjs/core';
import { ContextWebGL } from './ContextWebGL';
import { SamplerStateWebGL } from './SamplerStateWebGL';

export class TextureBaseWebGL {
	public static TEXTURE_ID: number = 0;

	public textureType: string = '';
	/* internal */ _gl: WebGLRenderingContext | WebGL2RenderingContext;
	/* internal */ _glTexture: WebGLTexture;
	/* internal */ readonly _state: SamplerStateWebGL = new SamplerStateWebGL();

	private _id: number;

	protected _context: ContextWebGL;

	get id(): number {
		return this._id;
	}

	constructor(context: ContextWebGL) {
		this._context = context;
		this._gl = context._gl;
		this._id = TextureBaseWebGL.TEXTURE_ID++;
	}

	public dispose(): void {
		this._gl.deleteTexture(this._glTexture);
	}

	public get glTexture(): WebGLTexture {
		return this._glTexture;
	}

	public generateMipmaps(): void {
		throw new AbstractMethodError();
	}
}