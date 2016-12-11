import {ITextureBase} from "./ITextureBase";

import {Image2D} from "@awayjs/graphics";

export interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromImage(image2D:Image2D, miplevel?:number);

}