import {ByteArray, URLRequest} from "@awayjs/core";

import {ITexture} from "../base/ITexture";

import {OpCodes} from "./OpCodes";
import {TextureBaseGLES} from "./TextureBaseGLES";
import {ContextGLES} from "./ContextGLES";

import {GLESConnector} from "./GLESConnector";
import {Byte32Array} from "@awayjs/core";
export class TextureGLES extends TextureBaseGLES implements ITexture
{

	public textureType:string = "texture2d";

	private _width:number;
	private _height:number;

	private _frameBuffer:WebGLFramebuffer;

	constructor(context:ContextGLES, gl:WebGLRenderingContext, width:number, height:number, id:number)
	{
		super(context, gl, id);
		this._width = width;
		this._height = height;
		//
		// this._glTexture = this._gl.createTexture();
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
		//this._context.addStream(String.fromCharCode(OpCodes.getFrameBufferForTexture) + this.id.toString() + "#END");
/*
		this._context._createBytes.ensureSpace(2);//the space for the text is ensured during writeUTFBytes
		this._context._createBytes.writeUnsignedByte(OpCodes.disposeVertexBuffer);
		this._context._createBytes.writeByte(this.id);
		*/
		//this._context.execute();
		// if (!this._frameBuffer) {
		// 	this._frameBuffer = this._gl.createFramebuffer();
		// 	this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
		// 	this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		// 	this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
		//
		// 	var renderBuffer:GLESRenderbuffer = this._gl.createRenderbuffer();
		// 	this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
		// 	this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, this._width, this._height);
		//
		// 	this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
		// 	this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);
		//
		// 	this._gl.bindTexture(this._gl.TEXTURE_2D, null);
		// 	this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
		// 	this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
		// }

		return this._frameBuffer;
	}

	public uploadFromArray(array:Uint8Array | Array<number>, miplevel:number = 0, premultiplied:boolean = false):void
	{
        if (array.length != this._width*this._height*4)
            throw new Error("Array is not the correct length for texture dimensions");

        if (array instanceof Array)
            array = new Uint8Array(array);

		var newSendbytes=new Byte32Array();
		newSendbytes.writeInt(1);//tells cpp that this is a create-bytes chunk
		newSendbytes.writeInt(OpCodes.uploadBytesTexture | miplevel<<8);
		newSendbytes.writeInt(this.id);
		newSendbytes.writeFloat(this._width);
		newSendbytes.writeFloat(this._height);
		newSendbytes.writeInt(array.buffer.byteLength);
		newSendbytes.writeInt32Array(new Int32Array(array.buffer));
		newSendbytes.bytePosition = 0;
		var localInt32View = new Int32Array(newSendbytes.byteLength/4);
		newSendbytes.readInt32Array(localInt32View);
		GLESConnector.gles.sendGLESCommands(localInt32View.buffer);
	}

	public uploadFromURL(urlRequest:URLRequest, miplevel:number = 0, premultiplied:boolean = false):void
	{
		var newSendbytes=new Byte32Array();
		newSendbytes.writeInt(1);//tells cpp that this is a create-bytes chunk
		newSendbytes.writeInt(OpCodes.uploadTextureFromURL | miplevel<<8);
		newSendbytes.writeInt(this.id);
		var myURLString= urlRequest.url.replace(/[^a-zA-Z0-9]/g, '');
		console.log("urlRequest.url "+myURLString);
		newSendbytes.writeUTFBytes(myURLString);
		newSendbytes.bytePosition = 0;
		var localInt32View = new Int32Array(newSendbytes.byteLength/4);
		newSendbytes.readInt32Array(localInt32View);
		GLESConnector.gles.sendGLESCommands(localInt32View.buffer);
	}

	public uploadCompressedTextureFromArray(array:Uint8Array, offset:number /*uint*/, async:boolean = false):void
	{
		//GLESConnector.gles.uploadCompressedTextureFromByteArray(this.id, data, offset, async);
		// var ext:Object = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		// //this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
	}
}