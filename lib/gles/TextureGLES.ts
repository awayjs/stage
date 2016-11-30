import {ByteArray} from "@awayjs/core";

import {ITexture} from "../base/ITexture";
import {OpCodes} from "../flash/OpCodes";

import {TextureBaseGLES} from "./TextureBaseGLES";
import {ContextGLES} from "./ContextGLES";

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

	public uploadFromData(image:HTMLImageElement, miplevel?:number);
	public uploadFromData(imageData:ImageData, miplevel?:number);
	public uploadFromData(data:any, miplevel:number = 0):void
	{
		/*
		var pos = 0;
		var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
			return data[pos++];
		}, null);
*/

		/*function base64ArrayBuffer(arrayBuffer) {
			var start = new Date().getTime();
			var base64    = ''
			var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

			var bytes         = new Uint8Array(arrayBuffer)
			var byteLength    = bytes.byteLength
			var byteRemainder = byteLength % 3
			var mainLength    = byteLength - byteRemainder

			var a, b, c, d
			var chunk

			// Main loop deals with bytes in chunks of 3
			for (var i = 0; i < mainLength; i = i + 3) {
				// Combine the three bytes into a single integer
				chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

				// Use bitmasks to extract 6-bit segments from the triplet
				a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
				b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
				c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
				d = chunk & 63               // 63       = 2^6 - 1

				// Convert the raw binary segments to the appropriate ASCII encoding
				base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
			}

			// Deal with the remaining bytes and padding
			if (byteRemainder == 1) {
				chunk = bytes[mainLength]

				a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

				// Set the 4 least significant bits to zero
				b = (chunk & 3)   << 4 // 3   = 2^2 - 1

				base64 += encodings[a] + encodings[b] + '=='
			} else if (byteRemainder == 2) {
				chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

				a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
				b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

				// Set the 2 least significant bits to zero
				c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

				base64 += encodings[a] + encodings[b] + encodings[c] + '='
			}

			var end = new Date().getTime();
			var time = end - start;
			console.log('Execution time for texture base64 encoding: ' + time);
			return base64
		}*/
		//this._context.addCreateStream(String.fromCharCode(OpCodes.uploadBytesTexture) + this.id.toString() + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," +base64ArrayBuffer(data.data.buffer)+"#END");

		//console.log("upload texturedata "+this.id);
		this._context._createBytes.writeInt(OpCodes.uploadBytesTexture | miplevel<<8);
		this._context._createBytes.writeInt(this.id);
		this._context._createBytes.writeFloat(this._width);
		this._context._createBytes.writeFloat(this._height);
		this._context._createBytes.writeInt(data.data.buffer.byteLength);
		this._context._createBytes.writeInt32Array(new Int32Array(data.data.buffer));

		//GLESConnector.gles.uploadTextureFromData(this.id, data, miplevel);
		// this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
		// this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
		// this._gl.bindTexture(this._gl.TEXTURE_2D, null);
	}

	public uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number /*uint*/, async:boolean = false):void
	{
		//GLESConnector.gles.uploadCompressedTextureFromByteArray(this.id, data, byteArrayOffset, async);
		// var ext:Object = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		// //this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
	}
}