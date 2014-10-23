import BitmapData					= require("awayjs-core/lib/base/BitmapData");
import ByteArrayBase				= require("awayjs-core/lib/utils/ByteArrayBase");

import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");

class TextureFlash extends ResourceBaseFlash implements ITexture
{
	private _context:ContextStage3D;
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

	constructor(context:ContextStage3D, width:number, height:number, format:string, forRTT:boolean, streaming:boolean = false)
	{
		super();

		this._context = context;
		this._width = width;
		this._height = height;

		this._context.addStream(String.fromCharCode(OpCodes.initTexture, (forRTT? OpCodes.trueValue : OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public dispose()
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeTexture) + this._pId.toString() + ",");
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}

	public uploadFromData(bitmapData:BitmapData, miplevel?:number);
	public uploadFromData(image:HTMLImageElement, miplevel?:number);
	public uploadFromData(data:any, miplevel:number = 0)
	{
		if (data instanceof BitmapData) {
			data = (<BitmapData> data).imageData.data;
		} else if (data instanceof HTMLImageElement) {
			var can = document.createElement("canvas");
			var w = data.width;
			var h = data.height;
			can.width = w;
			can.height = h;
			var ctx = can.getContext("2d");
			ctx.drawImage(data, 0, 0);
			data = ctx.getImageData(0, 0, w, h).data;
		}

		var pos = 0;
		var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
			return data[pos++];
		}, null);

		this._context.addStream(String.fromCharCode(OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
		this._context.execute();
	}
}

export = TextureFlash;