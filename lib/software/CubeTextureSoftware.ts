import {ICubeTexture}						from "../base/ICubeTexture";
import {ByteArray}							from "@awayjs/core/lib/utils/ByteArray"

export class CubeTextureSoftware implements ICubeTexture
{
	public textureType:string = "textureCube";

	private _size:number;
	private _mipLevels:number[][] = [];

	constructor(size:number)
	{
		this._size = size;
	}

	public dispose():void
	{
		this._mipLevels = null;
	}

	public get size():number
	{
		return this._size;
	}

	public uploadFromData(image:HTMLImageElement, miplevel?:number);
	public uploadFromData(imageData:ImageData, miplevel?:number);
	public uploadFromData(data:any, miplevel:number = 0):void
	{
		this._mipLevels[miplevel] = data.data;
	}

	public getData(miplevel:number):number[]
	{
		return this._mipLevels[miplevel];
	}

	public getMipLevelsCount():number
	{
		return this._mipLevels.length;
	}

	public generateMipmaps():void
	{
		//TODO
	}

	uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean) {
		// TODO
	}
}