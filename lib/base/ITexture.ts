import BitmapData					= require("awayjs-core/lib/data/BitmapData");

import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromData(bitmapData:BitmapData, miplevel?:number);
	uploadFromData(image:HTMLImageElement, miplevel?:number);

}

export = ITexture;