import { BitmapImage2D } from '../image/BitmapImage2D';
import { BitmapImageCube } from '../image/BitmapImageCube';
import { Image2D } from '../image/Image2D';

import { ImageSampler } from '../image/ImageSampler';
import { IImageFactory } from '../factories/IImageFactory';
import { ImageCube } from '../image';

export class ImageUtils {
	private static CANVAS: HTMLCanvasElement;
	public static MAX_SIZE: number = 8192;
	private static _defaultImage2DFactory: () => Image2D;
	private static _defaultImageCubeFactory: () => ImageCube;
	private static _defaultImageSamplerFactory: () => ImageSampler;
	private static _defaultFactory: () => IImageFactory;

	private static _defaultImageSampler: ImageSampler;
	private static _defaultImage2D: Image2D;
	private static _defaultImageCube: ImageCube;

	private static getImageBuffer(img: HTMLImageElement | ImageBitmap): Uint8ClampedArray {

		const canvas = this.CANVAS || (this.CANVAS = document.createElement('canvas'));
		const context = canvas.getContext('2d');

		if (img instanceof HTMLImageElement) {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
		} else {
			canvas.width = img.width;
			canvas.height = img.height;
		}
		context.drawImage(img, 0, 0);

		return context.getImageData(0, 0, canvas.width, canvas.height).data;
	}

	/**
	 *
	 */
	public static imageToBitmapImage2D(
		img: HTMLImageElement | ImageBitmap,
		factory: IImageFactory, powerOfTwo: boolean = true): BitmapImage2D {

		let width: number;
		let height: number;

		if (img instanceof HTMLImageElement) {
			width = img.naturalWidth;
			height = img.naturalHeight;
		} else {
			width = img.width;
			height = img.height;
		}

		const image2D = <BitmapImage2D> factory.createImage2D(
			width,
			height,
			true,
			null,
			powerOfTwo
		);

		image2D.addLazySymbol({
			needParse: true,
			definition: {
				width,
				height,
				isPMA: true,
				data: null
			},
			lazyParser() {
				this.needParse = false;
				this.definition.data = ImageUtils.getImageBuffer(img);
				this.lazyParser = null;
				return this;
			}
		});

		return image2D;
	}

	public static isImage2DValid(image2D: Image2D): boolean {
		if (image2D == null)
			return true;

		return this.isDimensionValid(image2D.width, image2D.powerOfTwo)
			&& this.isDimensionValid(image2D.height, image2D.powerOfTwo);
	}

	public static isHTMLImageElementValid(image: HTMLImageElement): boolean {
		if (image == null)
			return true;

		return this.isDimensionValid(image.width) && this.isDimensionValid(image.height);
	}

	public static isDimensionValid(d: number, powerOfTwo: boolean = true): boolean {
		return d >= 1 && d <= this.MAX_SIZE && (!powerOfTwo || this.isPowerOfTwo(d));
	}

	public static isPowerOfTwo(value: number): boolean {
		return value ? ((value & -value) == value) : false;
	}

	public static getBestPowerOf2(value: number): number {
		let p: number = 1;

		while (p < value)
			p <<= 1;

		if (p > this.MAX_SIZE)
			p = this.MAX_SIZE;

		return p;
	}

	public static getDefaultImage2D(): Image2D {
		return this._defaultImage2D || (this._defaultImage2D = this._defaultImage2DFactory());
	}

	public static getDefaultImageCube(): ImageCube {
		return this._defaultImageCube || (this._defaultImageCube = this._defaultImageCubeFactory());
	}

	public static getDefaultImageSampler(): ImageSampler {
		return this._defaultImageSampler || (this._defaultImageSampler = this._defaultImageSamplerFactory());
	}

	public static registerDefaults (
		defaultImage2DFactory: () => BitmapImage2D = null,
		defaultImageCubeFactory: () => BitmapImageCube = null,
		defaultImageSamplerFactory: () => ImageSampler = null,
		defaultFactory: () => IImageFactory = null
	) {
		if (defaultImage2DFactory) {
			this._defaultImage2DFactory = defaultImage2DFactory;
		}
		if (defaultImageCubeFactory) {
			this._defaultImageCubeFactory = defaultImageCubeFactory;
		}
		if (defaultImageSamplerFactory) {
			this._defaultImageSamplerFactory = defaultImageSamplerFactory;
		}
		if (defaultFactory) {
			this._defaultFactory = defaultFactory;
		}
	}

}

export default ImageUtils;