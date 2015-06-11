import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");

class IndexBufferWebGL implements IIndexBuffer
{

	private _gl:WebGLRenderingContext;
	private _numElements:number;
	private _buffer:WebGLBuffer;

	constructor(gl:WebGLRenderingContext, numElements:number)
	{
		this._gl = gl;
		this._buffer = this._gl.createBuffer();
		this._numElements = numElements;
	}

	public uploadFromArray(data:number[], startOffset:number, count:number):void
	{
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);

		if (startOffset)
			this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset*2, new Uint16Array(data));
		else
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._gl.STATIC_DRAW);
	}

	public uploadFromByteArray(data:ArrayBuffer, startOffset:number, count:number)
	{
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);

		if (startOffset)
			this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset*2, data);
		else
			this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
	}

	public dispose():void
	{
		this._gl.deleteBuffer(this._buffer);
	}

	public get numElements():number
	{
		return this._numElements;
	}

	public get glBuffer():WebGLBuffer
	{
		return this._buffer;
	}
}

export = IndexBufferWebGL;