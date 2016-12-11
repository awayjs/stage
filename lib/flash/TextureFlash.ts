import {ByteArrayBase} from "@awayjs/core";

import {Image2D} from "@awayjs/graphics";

import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";
import {ITexture} from "../base/ITexture";

import {ContextFlash} from "./ContextFlash";
import {OpCodes} from "./OpCodes";
import {ResourceBaseFlash} from "./ResourceBaseFlash";

export class TextureFlash extends ResourceBaseFlash implements ITexture
{
	private _context:ContextFlash;
	private _width:number;
	private _height:number;

	public get width():number
	{
		return this._width;
	}

	public get height():number
	{
		return this._height;
	}

	constructor(context:ContextFlash, width:number, height:number, format:ContextGLTextureFormat, forRTT:boolean, streaming:boolean = false)
	{
		super();

		this._context = context;
		this._width = width;
		this._height = height;

		this._context.addStream(String.fromCharCode(OpCodes.initTexture, (forRTT? OpCodes.trueValue : OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public dispose():void
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeTexture) + this._pId.toString() + ",");
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}

	public uploadFromImage(image2D:Image2D, miplevel:number = 0):void
	{
		var data:Uint8ClampedArray = image2D.getImageData().data;

		var pos:number = 0;
		var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
			return data[pos++];
		}, null);

		this._context.addStream(String.fromCharCode(OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
		this._context.execute();
	}
}