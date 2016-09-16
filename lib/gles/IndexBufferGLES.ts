import {IIndexBuffer}					from "../base/IIndexBuffer";
import {GLESAssetBase}					from "./GLESAssetBase";
import {GLESConnector}					from "./GLESConnector";
import {ContextGLES}					from "./ContextGLES";
export class IndexBufferGLES extends GLESAssetBase implements IIndexBuffer
{

	private _gl:WebGLRenderingContext;
	private _numIndices:number;
	private _buffer:WebGLBuffer;

	constructor(context:ContextGLES, gl:WebGLRenderingContext, numIndices:number, id:number)
	{
		super(context, id);
		this._gl = gl;
		// this._buffer = this._gl.createBuffer();
		this._numIndices = numIndices;
	}

	public uploadFromArray(data:number[], startOffset:number, count:number):void
	{
		//GLESConnector.gles.uploadIndexDataFromArray(this.id, data, startOffset, count);
		// this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		//
		// if (startOffset)
		// 	this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset*2, new Uint16Array(data));
		// else
		// 	this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._gl.STATIC_DRAW);
	}

	public uploadFromByteArray(data:ArrayBuffer, startOffset:number, count:number):void
	{
		//GLESConnector.gles.uploadIndexDataFromByteArray(this.id, data, startOffset, count);
		// this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		//
		// if (startOffset)
		// 	this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset*2, data);
		// else
		// 	this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
	}

	public dispose():void
	{
		//GLESConnector.gles.disposeIndexBuffer(this.id);
		// this._gl.deleteBuffer(this._buffer);
	}

	public get numIndices():number
	{
		return this._numIndices;
	}

	public get glBuffer():WebGLBuffer
	{
		return this._buffer;
	}
}