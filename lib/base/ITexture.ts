import ITextureBase					from "awayjs-stagegl/lib/base/ITextureBase";

interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromData(image:HTMLImageElement, miplevel?:number);
	uploadFromData(imageData:ImageData, miplevel?:number);

}

export default ITexture;