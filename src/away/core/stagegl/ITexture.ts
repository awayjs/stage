///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	export interface ITexture extends ITextureBase
	{
		width:number;

		height:number;

		uploadFromData(bitmapData:away.base.BitmapData, miplevel?:number);
		uploadFromData(image:HTMLImageElement, miplevel?:number);

	}
}