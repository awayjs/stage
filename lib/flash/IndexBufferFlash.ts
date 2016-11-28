import {IIndexBuffer} from "../base/IIndexBuffer";

import {ContextFlash} from "./ContextFlash";
import {OpCodes} from "./OpCodes";
import {ResourceBaseFlash} from "./ResourceBaseFlash";

export class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer
{
	private _context:ContextFlash;
	private _numIndices:number;

	constructor(context:ContextFlash, numIndices:number)
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

	public uploadFromByteArray(data:ArrayBuffer, startOffset:number, count:number):void
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