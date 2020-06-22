import {ByteArray, URLRequest, Rectangle, Point} from "@awayjs/core";

import {ITexture} from "../base/ITexture";

import {TextureBaseWebGL} from "./TextureBaseWebGL";
import { ContextWebGL } from './ContextWebGL';
import { ContextWebGLFlags } from "./ContextWebGLFlags";

export class TextureWebGL extends TextureBaseWebGL implements ITexture
{

	public textureType:string = "texture2d";

	/*internal*/ _width:number;
	/*internal*/ _height:number;

	/*internal*/ _frameBuffer:WebGLFramebuffer[] = [];
	/*internal*/ _frameBufferDraw:WebGLFramebuffer[] = [];
	/*internal*/ _renderBuffer:WebGLRenderbuffer = [];
	/*internal*/ _renderBufferDepth:WebGLRenderbuffer = [];
	/*internal*/ _mipmapSelector:number;
	private _texStorageFlag:boolean;
	/*internal*/ _multisampled:boolean = false;

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
		//no Multisample buffers with WebGL1
		if (this._gl instanceof WebGLRenderingContext || !this._multisampled)
			return;

		var width:number = this._width >>> this._mipmapSelector;
		var height:number = this._height >>> this._mipmapSelector;

		/*
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);

		// init texture
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);

		if (!this._texStorageFlag) {
			//texStorage2D creates an immutable texture for all levels
			this._gl.texStorage2D(this._gl.TEXTURE_2D, Math.log(Math.min(this._width, this._height))/Math.LN2 | 0 + 1, this._gl.RGBA8, width, height);
			this._texStorageFlag = true;
		}
		//this._gl.texImage2D(this._gl.TEXTURE_2D, this._mipmapSelector, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, this._mipmapSelector);

		this._gl.bindTexture(this._gl.TEXTURE_2D, null);
		*/

		// bind framebuffer with renderbuffer to READ slot
		this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, this._frameBuffer[this._mipmapSelector]);
		// bind framebuffer with texture to WRITE slot
		this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);
		// ckear
		this._gl.clearBufferfv(this._gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		// copy renderbuffer to texture
		this._gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);
	}

	public presentFrameBufferTo(texture: TextureWebGL, rect: Rectangle, point: Point):void
	{
		var width:number = this._width >>> this._mipmapSelector;
		var height:number = this._height >>> this._mipmapSelector;

		/*
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);

		// init texture
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);

		if (!this._texStorageFlag) {
			//texStorage2D creates an immutable texture for all levels
			this._gl.texStorage2D(this._gl.TEXTURE_2D, Math.log(Math.min(this._width, this._height))/Math.LN2 | 0 + 1, this._gl.RGBA8, width, height);
			this._texStorageFlag = true;
		}
		//this._gl.texImage2D(this._gl.TEXTURE_2D, this._mipmapSelector, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, this._mipmapSelector);

		this._gl.bindTexture(this._gl.TEXTURE_2D, null);
		*/

		const targetFrameBuffer = texture.textureFramebuffer;

		if(!this._multisampled || this._gl instanceof WebGLRenderingContext) {
			// direct copy to target texture.
			// same as call this._context.renderToTexture
			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer[this._mipmapSelector]);
			texture.blitTextureToRenderbuffer();

		} else if(targetFrameBuffer) {
			// bind framebuffer with renderbuffer to READ slot
			this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, this._frameBuffer[this._mipmapSelector]);
			// bind framebuffer with texture to WRITE slot
			this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, targetFrameBuffer);
			// clear
			this._gl.clearBufferfv(this._gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
			// copy renderbuffer to texture
			this._gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);

			texture.blitTextureToRenderbuffer();
		}
	}

	/**
	 * Blit self texture to renderbuffer if a multisampled
	 */
	public blitTextureToRenderbuffer(): void {
		if(!this._multisampled ||  !(this._gl instanceof WebGL2RenderingContext)) {
			return;
		}

		const width = this._width >>> this._mipmapSelector;
		const height = this._height >>> this._mipmapSelector;

		// bind framebuffer with renderbuffer to DRAW slot
		this._gl.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, this._frameBuffer[this._mipmapSelector]);
		// bind framebuffer with texture to READ slot
		this._gl.bindFramebuffer(this._gl.READ_FRAMEBUFFER, this._frameBufferDraw[this._mipmapSelector]);
		// clear
		this._gl.clearBufferfv(this._gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		// copy texture to renderbuffer!
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