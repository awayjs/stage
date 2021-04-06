import { AbstractMethodError } from '@awayjs/core';
import { SamplerState } from '../base/SamplerState';
import { ContextWebGL } from './ContextWebGL';

export class TextureBaseWebGL {
	public static TEXTURE_ID: number = 0;

	public textureType: string = '';
	/* internal */ _gl: WebGLRenderingContext | WebGL2RenderingContext;
	/* internal */ _glTexture: WebGLTexture;
	/* internal */ readonly _state: SamplerState = new SamplerState();

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