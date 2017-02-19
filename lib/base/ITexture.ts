import {URLRequest} from "@awayjs/core";

import {Image2D} from "@awayjs/graphics";

import {ITextureBase} from "./ITextureBase";

export interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromImage(image2D:Image2D, miplevel?:number);

	uploadFromURL(urlRequest:URLRequest, miplevel?:number);

}