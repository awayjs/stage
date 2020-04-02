import {URLRequest} from "@awayjs/core";

import {ITextureBase} from "./ITextureBase";

export interface ITexture extends ITextureBase
{
	width:number;

	height:number;

	uploadFromArray(array:Uint8Array | Array<number>, miplevel?:number, premultiplied?:boolean);

	uploadFromURL(urlRequest:URLRequest, miplevel?:number, premultiplied?:boolean);

}