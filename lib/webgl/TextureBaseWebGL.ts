import {AbstractMethodError} from "@awayjs/core";

export class TextureBaseWebGL
{
	public textureType:string = "";
	public _gl:WebGLRenderingContext | WebGL2RenderingContext;

	public _glTexture:WebGLTexture;

	constructor(gl:WebGLRenderingContext | WebGL2RenderingContext)
	{
		this._gl = gl;
	}

	public dispose():void
	{
		this._gl.deleteTexture(this._glTexture);
	}

	public get glTexture():WebGLTexture
	{
		return this._glTexture;
	}

	public generateMipmaps():void
	{
		throw new AbstractMethodError();
	}
}