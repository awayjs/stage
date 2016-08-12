export class TextureBaseWebGL
{
	public textureType:string = "";
	public _gl:WebGLRenderingContext;

	public _glTexture:WebGLTexture;

	constructor(gl:WebGLRenderingContext)
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
		this._gl.bindTexture( this._gl.TEXTURE_2D, this._glTexture );
		this._gl.generateMipmap(this._gl.TEXTURE_2D);
		//this._gl.bindTexture( this._gl.TEXTURE_2D, null );
	}
}