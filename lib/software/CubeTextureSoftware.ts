import {ByteArray} from "@awayjs/core";

import {ICubeTexture} from "../base/ICubeTexture";

import {ITextureBaseSoftware} from "./ITextureBaseSoftware";
import {ITextureBaseSoftwareClass} from "./ITextureBaseSoftwareClass";

export class CubeTextureSoftware implements ICubeTexture, ITextureBaseSoftware
{
	private _textureSelectorDictionary:number[][] = [];

	public static textureType:string = "textureCube";

	private _size:number;

	public get textureType():string
	{
		return CubeTextureSoftware.textureType;
	}
	
	public get size():number
	{
		return this._size;
	}
	
	constructor(size:number)
	{
		this._size = size;
	}

	public dispose():void
	{
		this._textureSelectorDictionary = null;
	}

	public isTexture(textureClass:ITextureBaseSoftwareClass):boolean
	{
		return this.textureType == textureClass.textureType;
	}
	
	public uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
	public uploadFromData(imageData:ImageData, side:number, miplevel?:number);
	public uploadFromData(data:any, side:number, miplevel:number = 0):void
	{
		this._textureSelectorDictionary[side] = data.data;
	}

	public getData(side:number):number[]
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