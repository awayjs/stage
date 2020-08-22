import { URLRequest} from "@awayjs/core";

import {ITexture} from "../base/ITexture";

import {TextureBaseWebGL} from "./TextureBaseWebGL";
import { ContextWebGL } from './ContextWebGL';

export class TextureWebGL extends TextureBaseWebGL implements ITexture
{

	public textureType:string = "texture2d";

	/*internal*/ _width:number;
	/*internal*/ _height:number;

	/*internal*/ _frameBuffer:WebGLFramebuffer[] = [];
	/*internal*/ _frameBufferDraw:WebGLFramebuffer[] = [];
	/*internal*/ _renderBuffer:WebGLRenderbuffer = [];
	/*internal*/ _renderBufferDepth:WebGLRenderbuffer = [];
	/*internal*/ _mipmapSelector:number = 0;
	/*internal*/ _texStorageFlag:boolean;
	/*internal*/ _multisampled:boolean = false;
	/*internal*/ _isFilled:boolean = false;
	

	constructor(context: ContextWebGL, width:number, height:number)
	{
		super(context);
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

	public get multisampled(): boolean {
		return this._multisampled;
	}

	public get framebuffer(): WebGLFramebuffer {
		return this._frameBuffer[this._mipmapSelector];
	}

	public get textureFramebuffer(): WebGLFramebuffer {
		return this.multisampled ? this._frameBufferDraw[this._mipmapSelector] : this._frameBuffer[this._mipmapSelector];
	}

	public setFrameBuffer(enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0, mipmapSelector:number = 0):void
	{
		this._context.setFrameBuffer(this, enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector)
	}
	
	public presentFrameBuffer():void
	{
		// deprecation
		console.warn("[Texture] Framebuffer present internal method of ContextWebGL");
	}

	/**
	 * @inheritdoc
	 */
	public dispose() {
		this._context.disposeTexture(this);

		this._glTexture = null;
		this._renderBuffer = null;
		this._renderBufferDepth = null;
		this._frameBuffer = null;
		this._frameBufferDraw = null;
		this._mipmapSelector = 0;
		this._width = this._height = 0;
		this._multisampled = false;
	}

	public uploadFromArray(array:Uint8Array | Array<number>, miplevel:number = 0, premultiplied:boolean = false):void
	{

		var width:number=this._width;
		var height:number=this._height;

		for(var i=0; i<miplevel; i++){
			width=width*0.5;
			height=height*0.5;
		}
        if (array.length != Math.floor(width)*Math.floor(height)*4)
            throw new Error("Array is not the correct length for texture dimensions");

		if (array instanceof Array)
            array = new Uint8Array(array);

		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
        this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, array);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);

		this._isFilled = true;
	}

	public uploadFromURL(urlRequest:URLRequest, miplevel:number = 0, premultiplied:boolean = false):void
	{
		//dummy code for testing
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);

		this._isFilled = true;
	}

	public uploadCompressedTextureFromArray(array:Uint8Array, offset:number, async:boolean = false):void
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