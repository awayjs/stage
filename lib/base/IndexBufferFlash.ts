import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");

class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer
{
	private _context:ContextStage3D;
	private _numIndices:number;

	constructor(context:ContextStage3D, numIndices:number)
	{
		super();

		this._context = context;
		this._numIndices = numIndices;
		this._context.addStream(String.fromCharCode(OpCodes.initIndexBuffer, numIndices + OpCodes.intMask));
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}
	public uploadFromArray(data:number[], startOffset:number, count:number):void
	{
		this._context.addStream(String.fromCharCode(OpCodes.uploadArrayIndexBuffer, this._pId + OpCodes.intMask) + data.join() + "#" + startOffset + "," + count + ",");
		this._context.execute();
	}

	public uploadFromByteArray(data:ArrayBuffer, startOffset:number, count:number)
	{

	}

	public dispose():void
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeIndexBuffer, this._pId + OpCodes.intMask));
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}

	public get numIndices():number
	{
		return this._numIndices;
	}
}

export = IndexBufferFlash;