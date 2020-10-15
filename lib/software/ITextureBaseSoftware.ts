import { ITextureBase } from '../base/ITextureBase';

import { ITextureBaseSoftwareClass } from './ITextureBaseSoftwareClass';

export interface ITextureBaseSoftware extends ITextureBase
{
	textureType: string;

	isTexture(textureClass: ITextureBaseSoftwareClass): boolean;

	getMipLevelsCount(): number;
}