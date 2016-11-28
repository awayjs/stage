import {ByteArray} from "@awayjs/core";

import {IProgram} from "../base/IProgram";

import {ContextFlash} from "./ContextFlash";
import {OpCodes} from "./OpCodes";
import {ResourceBaseFlash} from "./ResourceBaseFlash";

export class ProgramFlash extends ResourceBaseFlash implements IProgram
{
	private _context:ContextFlash;

	constructor(context:ContextFlash)
	{
		super();

		this._context = context;
		this._context.addStream(String.fromCharCode(OpCodes.initProgram));
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray):void
	{
		this._context.addStream(String.fromCharCode(OpCodes.uploadAGALBytesProgram, this._pId + OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");

		if (ContextFlash.debug)
			this._context.execute();
	}

	public dispose():void
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeProgram, this._pId + OpCodes.intMask));
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}
}