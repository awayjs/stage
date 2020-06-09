import {ByteArray, URLRequest} from "@awayjs/core";

import {ITexture} from "../base/ITexture";

import {TextureBaseWebGL} from "./TextureBaseWebGL";
import { ContextWebGL } from './ContextWebGL';

export class TextureWebGL extends TextureBaseWebGL implements ITexture
{

	public textureType:string = "texture2d";

	private _width:number;
	private _height:number;

	private _frameBuffer:WebGLFramebuffer[] = [];
	private _frameBufferDraw:WebGLFramebuffer[] = [];
	private _renderBuffer:WebGLRenderbuffer = [];
	private _renderBufferDepth:WebGLRenderbuffer = [];
	private _mipmapSelector:number;
	private _texStorageFlag:boolean;

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

	public setFrameBuffer(enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0, mipmapSelector:number = 0):void
	{
		//only top level mipmap is allowed for WebGL1
		if (this._gl instanceof WebGLRenderingContext)
			mipmapSelector = 0; 

		var width:number = this._width >>> mipmapSelector;
		var height:number = this._height >>> mipmapSelector;

		this._mipmapSelector = mipmapSelector;
	
		if (!this._frameBuffer[mipmapSelector]) {

			//create framebuffer
			var frameBuffer:WebGLFramebuffer = this._frameBuffer[mipmapSelector] = this._gl.createFramebuffer();

			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);

			//create renderbufferdepth
			var renderBufferDepth:WebGLRenderbuffer = this._renderBufferDepth[mipmapSelector] = this._gl.createRenderbuffer();

			this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBufferDepth);

			//no Multisample buffers with WebGL1
			if (this._gl instanceof WebGLRenderingContext) {
				this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
				this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);

				this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBufferDepth);
				this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, this._width, this._height);

				this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
				this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBufferDepth);

				this._gl.bindTexture(this._gl.TEXTURE_2D, null);
			} else {
				this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, antiAlias, this._gl.DEPTH24_STENCIL8, width, height);
				this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBufferDepth);

				//get renderbuffer
				var renderBuffer:WebGLRenderbuffer = this._renderBuffer[mipmapSelector] = this._gl.createRenderbuffer();

				this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
				this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, antiAlias, this._gl.RGBA8, width, height);
				this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.RENDERBUFFER, renderBuffer);
			}

			this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
		} else {
			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer[mipmapSelector]);
		}

		if (enableDepthAndStencil) {
			this._gl.enable(this._gl.STENCIL_TEST);
			this._gl.enable(this._gl.DEPTH_TEST);
		} else {
			this._gl.disable(this._gl.STENCIL_TEST);
			this._gl.disable(this._gl.DEPTH_TEST);
		}

		this._gl.viewport(0, 0, width, height);
	}
	
	public presentFrameBuffer():void
	{
		//no Multisample buffers with WebGL1
		if (this._gl instanceof WebGLRenderingContext)
			return;

		var width:number = this._width >>> this._mipmapSelector;
		var height:number = this._height >>> this._mipmapSelector;

		//init framebuffer
		if (!this._frameBufferDraw[this._mipmapSelector])
			this._frameBufferDraw[this._mipmapSelector] = this._gl.createFramebuffer();

		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);

		//init texture
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);

		if (!this._texStorageFlag) {
			//texStorage2D creates an immutable texture for all levels
			this._gl.texStorage2D(this._gl.TEXTURE_2D, Math.log(Math.min(this._width, this._height))/Math.LN2 + 1, this._gl.RGBA8, width, height);
			this._texStorageFlag = true;
		}
		//this._gl.texImage2D(this._gl.TEXTURE_2D, mipmapSelector, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, this._mipmapSelector);

		this._gl.bindTexture(this._gl.TEXTURE_2D, null);

		//write frameBuffer to frameBufferDraw
		this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, this._frameBuffer[this._mipmapSelector]);
		this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);
		this._gl.clearBufferfv(this._gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		this._gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);
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
	}

	public uploadFromURL(urlRequest:URLRequest, miplevel:number = 0, premultiplied:boolean = false):void
	{
		//dummy code for testing
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);
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