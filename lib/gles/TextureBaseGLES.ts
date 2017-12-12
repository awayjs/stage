import {OpCodes} from "./OpCodes";
import {GLESAssetBase} from "./GLESAssetBase";
import {ContextGLES} from "./ContextGLES";

export class TextureBaseGLES extends GLESAssetBase
{
	public textureType:string = "";
	public _gl:WebGLRenderingContext;

	public _glTexture:WebGLTexture;

	constructor(context:ContextGLES, gl:WebGLRenderingContext, id:number)
	{
		super(context, id);
		// this._gl = gl;
	}

	public dispose():void
	{
		//console.log("dispose texturedata "+this.id);
		///this._context.addStream(String.fromCharCode(OpCodes.disposeTexture) + this.id.toString() + "#END");
		this._context._createBytes.writeInt(OpCodes.disposeTexture);
		this._context._createBytes.writeInt(this.id);
		//this._context.execute();
		//GLESConnector.gles.disposeTexture(this.id);
		// this._gl.deleteTexture(this._glTexture);
	}

	public get glTexture():WebGLTexture
	{
		return this._glTexture;
	}

	public generateMipmaps():void
	{
		//GLESConnector.gles.generateMipmaps(this.id);
		// this._gl.bindTexture( this._gl.TEXTURE_2D, this._glTexture );
		// this._gl.generateMipmap(this._gl.TEXTURE_2D);
		// //this._gl.bindTexture( this._gl.TEXTURE_2D, null );
	}
}