import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");

class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer
{
	private _context:ContextStage3D;
	private _numElements:number;

	constructor(context:ContextStage3D, numElements:number)
	{
		super();

		this._context = context;
		this._numElements = numElements;
		this._context.addStream(String.fromCharCode(OpCodes.initIndexBuffer, numElements*3 + OpCodes.intMask));
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

	public get numElements():number
	{
		return this._numElements;
	}
}

export = IndexBufferFlash;