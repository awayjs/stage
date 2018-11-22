import {IVertexBuffer} from "../base/IVertexBuffer";

export class VertexBufferSoftware implements IVertexBuffer
{
	private _numVertices:number;
	private _dataPerVertex:number;
	private _floatData:Float32Array;
	private _uintData:Uint8Array;
	//private _dataOffset:number;

	constructor(numVertices:number, dataPerVertex:number)
	{
		this._numVertices = numVertices;
		this._dataPerVertex = dataPerVertex;
	}

	public uploadFromArray(array:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array, startVertex:number, numVertices:number):void
	{
		//this._dataOffset = startVertex * this._dataPerVertex;
		this._floatData = <Float32Array>array;
	}

	public uploadFromByteArray(data:ArrayBuffer, startVertex:number, numVertices:number):void
	{
		//this._dataOffset = startVertex * this._dataPerVertex;
		this._floatData = new Float32Array(data, startVertex*this._dataPerVertex, numVertices*this._dataPerVertex/4);
		this._uintData = new Uint8Array(data);
	}

	public get numVertices():number
	{
		return this._numVertices;
	}

	public get dataPerVertex():number
	{
		return this._dataPerVertex;
	}

	public get attributesPerVertex():number
	{
		return this._dataPerVertex/4;
	}

	public dispose():void
	{
		this._floatData = null;
	}

	public get data():Float32Array
	{
		return this._floatData;
	}

	public get uintData():Uint8Array
	{
		return this._uintData;
	}
}