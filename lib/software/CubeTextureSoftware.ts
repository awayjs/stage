import {ByteArray} from "@awayjs/core";

import {ImageCube} from "@awayjs/graphics";

import {ICubeTexture} from "../base/ICubeTexture";

import {ITextureBaseSoftware} from "./ITextureBaseSoftware";
import {ITextureBaseSoftwareClass} from "./ITextureBaseSoftwareClass";

export class CubeTextureSoftware implements ICubeTexture, ITextureBaseSoftware
{
	private _textureSelectorDictionary:Uint8ClampedArray[][] = [[],[],[],[],[],[]];

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
	
	public uploadFromImage(imageCube:ImageCube, side:number, miplevel:number = 0):void
	{
		this._textureSelectorDictionary[side][miplevel] = imageCube.getImageData(side).data;
	}

	public getData(side:number, miplevel:number = 0):Uint8ClampedArray
	{
		return this._textureSelectorDictionary[side][miplevel];
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