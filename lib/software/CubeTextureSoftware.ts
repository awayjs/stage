import {ICubeTexture}						from "../base/ICubeTexture";
import {ByteArray}							from "@awayjs/core/lib/utils/ByteArray"

export class CubeTextureSoftware implements ICubeTexture
{
	private _textureSelectorDictionary:Array<any> = new Array<any>(6);

	public textureType:string = "textureCube";

	private _size:number;

	constructor(size:number)
	{
		this._size = size;
	}

	public dispose():void
	{
		this._textureSelectorDictionary = null;
	}

	public get size():number
	{
		return this._size;
	}

	public uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
	public uploadFromData(imageData:ImageData, side:number, miplevel?:number);
	public uploadFromData(data:any, side:number, miplevel:number = 0):void
	{
		this._textureSelectorDictionary[side] = data.data;
	}

	public getData(side:number):any
	{
		return this._textureSelectorDictionary[side];
	}

	public getMipLevelsCount():number
	{
		return 1;
	}

	public generateMipmaps():void
	{
		//TODO
	}

	public uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:number, async:boolean) {
		// TODO
	}
}