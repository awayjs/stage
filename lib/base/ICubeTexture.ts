import BitmapData					= require("awayjs-core/lib/data/BitmapData");
import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

interface ICubeTexture extends ITextureBase
{
	size:number;

	uploadFromData(bitmapData:BitmapData, side:number, miplevel?:number);
	uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);

	uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean);
}

export = ICubeTexture;