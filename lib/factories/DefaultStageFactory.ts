import { BitmapImage2D } from '../image/BitmapImage2D';
import { BitmapImageCube } from '../image/BitmapImageCube';
import { Image2D } from '../image/Image2D';
import { ImageCube } from '../image/ImageCube';

import { IImageFactory } from './IImageFactory';

export class DefaultStageFactory implements IImageFactory {
	public createImage2D(
		width: number,
		height: number,
		transparent: boolean = true,
		fillColor: number = null,
		powerOfTwo: boolean = true
	): Image2D {
		return new BitmapImage2D(width, height, transparent, fillColor, powerOfTwo);
	}

	public createImageCube(
		size: number,
		transparent: boolean = true,
		fillColor: number = null,
	): ImageCube {
		return new BitmapImageCube(size, transparent, fillColor);
	}
}