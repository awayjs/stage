import {ByteArray} from "@awayjs/core";

import {ITextureBase} from "./ITextureBase";

export interface ICubeTexture extends ITextureBase
{
	size:number;

	uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
	uploadFromData(imageData:ImageData, side:number, miplevel?:number);

	uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean);
}