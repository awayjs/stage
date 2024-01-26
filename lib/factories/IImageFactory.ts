import { ImageCube } from '../image/ImageCube';
import { Image2D } from '../image/Image2D';

export interface IImageFactory
{
	createImage2D(width: number, height: number, transparent?: boolean, fillColor?: number, powerOfTwo?: boolean): Image2D;

	createImageCube(size: number, transparent?: boolean, fillColor?: number): ImageCube;
}