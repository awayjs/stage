import {ByteArray, URLRequest} from "@awayjs/core";

import {Image2D, DefaultMaterialManager} from "@awayjs/graphics";

import {ITexture} from "../base/ITexture";

import {TextureBaseWebGL} from "./TextureBaseWebGL";

export class TextureWebGL extends TextureBaseWebGL implements ITexture
{

	public textureType:string = "texture2d";

	private _width:number;
	private _height:number;

	private _frameBuffer:WebGLFramebuffer;

	constructor(gl:WebGLRenderingContext, width:number, height:number)
	{
		super(gl);
		this._width = width;
		this._height = height;

		this._glTexture = this._gl.createTexture();
	}

	public get width():number
	{
		return this._width;
	}

	public get height():number
	{
		return this._height;
	}

	public get frameBuffer():WebGLFramebuffer
	{
		if (!this._frameBuffer) {
			this._frameBuffer = this._gl.createFramebuffer();
			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
			this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
			this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);

			var renderBuffer:WebGLRenderbuffer = this._gl.createRenderbuffer();
			this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
			this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, this._width, this._height);

			this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
			this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);

			this._gl.bindTexture(this._gl.TEXTURE_2D, null);
			this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
		}

		return this._frameBuffer;
	}

	public uploadFromImage(imageData:Image2D, miplevel:number = 0):void
	{
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, imageData.getImageData());
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);
	}

	public uploadFromURL(urlRequest:URLRequest, miplevel:number = 0):void
	{
		//dummy code for testing
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, DefaultMaterialManager.getDefaultImage2D().getImageData());
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);
	}

	public uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number /*uint*/, async:boolean = false):void
	{
		var ext:Object = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		//this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
	}

	public generateMipmaps():void
	{
		this._gl.bindTexture( this._gl.TEXTURE_2D, this._glTexture );
		this._gl.generateMipmap(this._gl.TEXTURE_2D);
		//this._gl.bindTexture( this._gl.TEXTURE_2D, null );
	}
}