import {IVertexBuffer} from "../base/IVertexBuffer";
import {OpCodes} from "../flash/OpCodes";

import {GLESAssetBase} from "./GLESAssetBase";
import {ContextGLES} from "./ContextGLES";

export class VertexBufferGLES extends GLESAssetBase implements IVertexBuffer
{

	private _gl:WebGLRenderingContext;
	private _numVertices:number;
	private _dataPerVertex:number;
	private _buffer:WebGLBuffer;

	constructor(context:ContextGLES, gl:WebGLRenderingContext, numVertices:number, dataPerVertex:number, id:number)
	{
		super(context, id);
		// this._gl = gl;
		// this._buffer = this._gl.createBuffer();
		this._numVertices = numVertices;
		this._dataPerVertex = dataPerVertex;
	}

	public uploadFromArray(vertices:number[], startVertex:number, numVertices:number):void
	{
		//GLESConnector.gles.uploadVertexDataFromArray(this.id, vertices, startVertex, numVertices);
		// this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
		//
		// if (startVertex)
		// 	this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex*this._dataPerVertex, new Float32Array(vertices));
		// else
		// 	this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
	}


	public uploadFromByteArray(data:ArrayBuffer, startVertex:number, numVertices:number):void
	{
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
			console.log('Execution time for vertexdata base64 encoding: ' + time);
			return base64
		}
		*/
		//this._context.addCreateStream(String.fromCharCode(OpCodes.uploadArrayVertexBuffer) + this.id + "," + startVertex +  "," + numVertices + ","+base64ArrayBuffer(data)+"#END");

		//console.log("upload vertexdata "+this.id);
		this._context._createBytes.writeInt(OpCodes.uploadArrayVertexBuffer);
		this._context._createBytes.writeInt(this.id);
		this._context._createBytes.writeInt(startVertex);
		this._context._createBytes.writeInt(data.byteLength);
		this._context._createBytes.writeInt32Array(new Int32Array(data)); //TODO: cache the view on the attributebuffer
		
		//this._context.execute();
		//GLESConnector.gles.uploadVertexDataFromByteArray(this.id, data, startVertex, numVertices);
		// this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
		//
		// if (startVertex)
		// 	this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex*this._dataPerVertex, data);
		// else
		// 	this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
	}

	public get numVertices():number
	{
		return this._numVertices;
	}

	public get dataPerVertex():number
	{
		return this._dataPerVertex;
	}

	public get glBuffer():WebGLBuffer
	{
		return this._buffer;
	}

	public dispose():void
	{
		//console.log("dispose vertexdata "+this.id);
		//this._context.addCreateStream(String.fromCharCode(OpCodes.disposeVertexBuffer) + this.id+"#END");
		this._context._createBytes.writeInt(OpCodes.disposeVertexBuffer);
		this._context._createBytes.writeInt(this.id);
	}
}