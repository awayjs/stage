import {ITextureBase}						from "../base/ITextureBase";
import {ITextureBaseSoftwareClass}				from "../software/ITextureBaseSoftwareClass";

export interface ITextureBaseSoftware extends ITextureBase
{
	textureType:string;
	
	isTexture(textureClass:ITextureBaseSoftwareClass):boolean;

	getMipLevelsCount():number;
}