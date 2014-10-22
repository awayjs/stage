import BitmapData					= require("awayjs-core/lib/core/base/BitmapData");

import ITextureBase					= require("awayjs-stagegl/lib/core/stagegl/ITextureBase");

interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromData(bitmapData:BitmapData, miplevel?:number);
	uploadFromData(image:HTMLImageElement, miplevel?:number);

}

export = ITexture;