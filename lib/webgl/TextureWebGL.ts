import { ITexture } from "../base/ITexture";
import { TextureBaseWebGL } from "./TextureBaseWebGL";
import { ContextWebGL } from './ContextWebGL';
import { IUnloadable, UnloadManager } from '../managers/UnloadManager';
import { AssetBase } from '@awayjs/core';

export class TextureWebGL extends TextureBaseWebGL implements ITexture, IUnloadable {
	public static readonly SIZE_POOL_LIMIT = 10;

	public static unloadManager = new UnloadManager<TextureWebGL>(20_000);
	private static _pool: NumberMap<Array<TextureWebGL>> = {};
	
	public static store(tex: TextureWebGL) {
		
		const count = this.unloadManager.execute();
		count && console.debug("[TextureWebGL Experimental] Remove textures persistently", count);

		const key = tex._width << 16 | tex._height;
		const array = TextureWebGL._pool[key] || (TextureWebGL._pool[key] = []);

		if(array.indexOf(tex) > -1) {
			tex.lastUsedTime = this.unloadManager.correctedTime;

			return true;
		}

		if(array.length >= this.SIZE_POOL_LIMIT) {
			return false;
		}
		
		tex.lastUsedTime = this.unloadManager.correctedTime;

		this.unloadManager.addTask(tex);
		array.push(tex);

		return true;
	}

	public static remove(tex: TextureWebGL): boolean {
		const key = tex._width << 16 | tex._height;
		const array = TextureWebGL._pool[key];

		if(!array && !array.length) return false;

		const index = array.indexOf(tex);
		
		return index > -1 && !!array.splice(index,1);
	}

	public static create (context: ContextWebGL, width: number, height: number) 
	{
		const count = this.unloadManager.execute();
		count && console.debug("[TextureWebGL Experimental] Remove textures persistently", count);

		const key = width << 16 | (height | 0);
		const tex = TextureWebGL._pool[key]?.pop();
		
		if (tex) {
			this.unloadManager.removeTask(tex);
			return tex;
		}

		return new TextureWebGL(context, width, height);
	}

	public textureType: string = "texture2d";

	/*internal*/ _width: number;
	/*internal*/ _height: number;

	/*internal*/ _frameBuffer: WebGLFramebuffer[] = [];
	/*internal*/ _frameBufferDraw: WebGLFramebuffer[] = [];
	/*internal*/ _renderBuffer: WebGLRenderbuffer = [];
	/*internal*/ _renderBufferDepth: WebGLRenderbuffer = [];
	/*internal*/ _mipmapSelector: number = 0;
	/*internal*/ _texStorageFlag: boolean;
	/*internal*/ _multisampled: boolean = false;
	/*internal*/ _isFilled: boolean = false;
	/*internal*/ _isPMA: boolean = false;
	/*internal*/ _isRT: boolean = false;
	

	//keepAliveTime: number = 30_000;
	lastUsedTime: number = 0;

	get canUnload() {
		return this._glTexture && !this._isRT;
	}

	constructor(context: ContextWebGL, width: number, height: number) {
		super(context);

		if (!width || !height) {
			throw new Error(`Incorrected size of texture { width: ${width}, height: ${height}}`);
		}

		this._width = width;
		this._height = height;


		this._glTexture = this._gl.createTexture();
	}

	public get width(): number {
		return this._width;
	}

	public get height(): number {
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

	public setFrameBuffer(enableDepthAndStencil: boolean = false, antiAlias: number = 0, surfaceSelector: number = 0, mipmapSelector: number = 0): void {
		this._context.setFrameBuffer(this, enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector)
	}

	public presentFrameBuffer(): void {
		// deprecation
		console.warn("[Texture] Framebuffer present internal method of ContextWebGL");
	}

	/**
	 * @inheritdoc
	 */
	public dispose(): void {
		if(TextureWebGL.store(this)) 
			return;

		this.unload();
	}

	unload(): void {
		TextureWebGL.remove(this);

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

	public uploadFromArray(array: Uint8Array | Array<number>, miplevel: number = 0, premultiplied: boolean = false): void {
		const width = this._width >>> miplevel;
		const height = this._height >>> miplevel;

		if (array.length !== width * height * 4) {
			throw new Error(`Array is not the correct length for texture dimensions: expected: ${width * height * 4}, exist: ${array.length}`);
		}

		if (array instanceof Array)
			array = new Uint8Array(array);

		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
		this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, array);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);

		this._isFilled = true;
		this._isPMA = premultiplied;
	}

	public uploadFromURL(urlRequest: unknown, miplevel: number = 0, premultiplied: boolean = false): void {
		//dummy code for testing
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
		this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		this._gl.bindTexture(this._gl.TEXTURE_2D, null);

		this._isFilled = true;
		this._isPMA = premultiplied;
	}

	public uploadCompressedTextureFromArray(array: Uint8Array, offset: number, async: boolean = false): void {
		var ext: Object = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		//this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
	}

	public generateMipmaps(): void {
		this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		this._gl.generateMipmap(this._gl.TEXTURE_2D);
		//this._gl.bindTexture( this._gl.TEXTURE_2D, null );
	}
}