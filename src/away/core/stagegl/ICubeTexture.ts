///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	export interface ICubeTexture extends ITextureBase
	{
		size:number;

		uploadFromData(bitmapData:away.base.BitmapData, side:number, miplevel?:number);
		uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);

		uploadCompressedTextureFromByteArray(data:away.utils.ByteArray, byteArrayOffset:number, async:boolean);
	}
}