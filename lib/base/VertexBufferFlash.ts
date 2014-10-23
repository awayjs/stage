import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");

class VertexBufferFlash extends ResourceBaseFlash implements IVertexBuffer
{
	private _context:ContextStage3D;
	private _numVertices:number;
	private _data32PerVertex:number;

	constructor(context:ContextStage3D, numVertices:number, data32PerVertex:number)
	{
		super();

		this._context = context;
		this._numVertices = numVertices;
		this._data32PerVertex = data32PerVertex;
		this._context.addStream(String.fromCharCode(OpCodes.initVertexBuffer, data32PerVertex + OpCodes.intMask) + numVertices.toString() + ",");
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public uploadFromArray(data:number[], startVertex:number, numVertices:number)
	{
		this._context.addStream(String.fromCharCode(OpCodes.uploadArrayVertexBuffer, this._pId + OpCodes.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
		this._context.execute();
	}

	public get numVertices():number
	{
		return this._numVertices;
	}

	public get data32PerVertex():number
	{
		return this._data32PerVertex;
	}

	public dispose()
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeVertexBuffer, this._pId + OpCodes.intMask));
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}
}

export = VertexBufferFlash;