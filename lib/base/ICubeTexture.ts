import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

interface ICubeTexture extends ITextureBase
{
	size:number;

	uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
	uploadFromData(imageData:ImageData, side:number, miplevel?:number);

	uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean);
}

export = ICubeTexture;