import {URLRequest} from "@awayjs/core";

import {Image2D} from "@awayjs/graphics";

import {ITexture} from "../base/ITexture";

import {ITextureBaseSoftware} from "./ITextureBaseSoftware";
import {ITextureBaseSoftwareClass} from "./ITextureBaseSoftwareClass";

export class TextureSoftware implements ITexture, ITextureBaseSoftware
{
	public static textureType:string = "texture2d";

	private _width:number;
	private _height:number;
	private _mipLevels:Uint8ClampedArray[] = [];

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
	

	public uploadFromImage(image2D:Image2D, miplevel:number = 0):void
	{
		this._mipLevels[miplevel] = image2D.getImageData().data;
	}

	public uploadFromURL(urlRequest:URLRequest, miplevel:number = 0):void
	{

	}

	public getData(miplevel:number):Uint8ClampedArray
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