import {ByteArray} from "@awayjs/core";

import {ImageCube} from "@awayjs/graphics";

import {ITextureBase} from "./ITextureBase";

export interface ICubeTexture extends ITextureBase
{
	size:number;

	uploadFromImage(imageCube:ImageCube, side:number, miplevel?:number);

	uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean);
}