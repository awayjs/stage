import {ITexture} from "../base/ITexture";

import {ITextureBaseSoftware} from "./ITextureBaseSoftware";
import {ITextureBaseSoftwareClass} from "./ITextureBaseSoftwareClass";

export class TextureSoftware implements ITexture, ITextureBaseSoftware
{
	public static textureType:string = "texture2d";

	private _width:number;
	private _height:number;
	private _mipLevels:number[][] = [];

	public get textureType():string
	{
		return TextureSoftware.textureType;
	}

	public get width():number
	{
		return this._width;
	}

	public get height():number
	{
		return this._height;
	}
	
	constructor(width:number, height:number)
	{
		this._width = width;
		this._height = height;
	}
	
	public dispose():void
	{
		this._mipLevels = null;
	}

	public isTexture(textureClass:ITextureBaseSoftwareClass):boolean
	{
		return this.textureType == textureClass.textureType;
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
}