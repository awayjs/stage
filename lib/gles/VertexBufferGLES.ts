import {IVertexBuffer} from "../base/IVertexBuffer";
import {OpCodes} from "./OpCodes";
import {GLESAssetBase} from "./GLESAssetBase";
import {ContextGLES} from "./ContextGLES";
import {GLESConnector} from "./GLESConnector";
import {Byte32Array} from "@awayjs/core";

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

	public uploadFromArray(array:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array, startVertex:number, numVertices:number):void
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
		var newSendbytes=new Byte32Array();
		newSendbytes.writeInt(1);//send create bytes
		newSendbytes.writeInt(OpCodes.uploadArrayVertexBuffer);
		newSendbytes.writeInt(this.id);
		newSendbytes.writeInt(startVertex);
		newSendbytes.writeInt(data.byteLength);
		newSendbytes.writeInt32Array(new Int32Array(data)); //TODO: cache the view on the attributebuffer
		newSendbytes.bytePosition = 0;
		var localInt32View = new Int32Array(newSendbytes.byteLength/4);
		newSendbytes.readInt32Array(localInt32View);
		GLESConnector.gles.sendGLESCommands(localInt32View.buffer);
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