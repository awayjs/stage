import {ByteArray, ByteArrayBase} from "@awayjs/core";

import {ImageCube} from "@awayjs/graphics";

import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";
import {ICubeTexture} from "../base/ICubeTexture";

import {ContextFlash} from "./ContextFlash";
import {OpCodes} from "./OpCodes";
import {ResourceBaseFlash} from "./ResourceBaseFlash";

export class CubeTextureFlash extends ResourceBaseFlash implements ICubeTexture
{
	private _context:ContextFlash;
	private _size:number;

	public get size():number
	{
		return this._size;
	}

	constructor(context:ContextFlash, size:number, format:ContextGLTextureFormat, forRTT:boolean, streaming:boolean = false)
	{
		super();

		this._context = context;
		this._size = size;

		this._context.addStream(String.fromCharCode(OpCodes.initCubeTexture, (forRTT? OpCodes.trueValue : OpCodes.falseValue)) + size + "," + streaming + "," + format + "$");
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public dispose():void
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeCubeTexture) + this._pId.toString() + ",");
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}

	public uploadFromImage(imageCube:ImageCube, side:number, miplevel:number = 0):void
	{
		var data:Uint8ClampedArray = imageCube.getImageData(side).data;

		var pos:number = 0;
		var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
			return data[pos++];
		}, null);

		this._context.addStream(String.fromCharCode(OpCodes.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
		this._context.execute();
	}

	public uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number /*uint*/, async:boolean = false):void
	{

	}
}