import { BitmapImage2D } from '../image/BitmapImage2D';
import { BitmapImageCube } from '../image/BitmapImageCube';
import { Image2D } from '../image/Image2D';

import { ImageSampler } from '../image/ImageSampler';
import { IGraphicsFactory } from '../factories/IGraphicsFactory';

export class ImageUtils {
	private static CANVAS: HTMLCanvasElement;
	public static MAX_SIZE: number = 8192;
	private static _defaultBitmap2DCtor: { new (...args: any[]): BitmapImage2D };
	private static _defaultBitmapCubeCtor: { new (...args: any[]): BitmapImageCube };
	private static _defaultFactoryCtor: { new(): IGraphicsFactory };

	private static _defaultSampler: ImageSampler;
	private static _defaultBitmapImage2D: BitmapImage2D;
	private static _defaultBitmapImageCube: BitmapImageCube;

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
		powerOfTwo: boolean = true, factory: IGraphicsFactory = null): BitmapImage2D {

		if (!factory)
			factory = new this._defaultFactoryCtor();

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

	public static getDefaultImage2D(): BitmapImage2D {
		if (!this._defaultBitmapImage2D)
			this.createDefaultImage2D();

		return this._defaultBitmapImage2D;
	}

	public static getDefaultImageCube(): BitmapImageCube {
		if (!this._defaultBitmapImageCube)
			this.createDefaultImageCube();

		return this._defaultBitmapImageCube;
	}

	public static getDefaultSampler(): ImageSampler {
		if (!this._defaultSampler)
			this.createDefaultSampler();

		return this._defaultSampler;
	}

	private static createDefaultImageCube(): void {
		if (!this._defaultBitmapImage2D)
			this.createDefaultImage2D();

		const b = new this._defaultBitmapCubeCtor(this._defaultBitmapImage2D.width);

		for (let i = 0; i < 6; i++) {
			b.drawBitmap(
				i,
				this._defaultBitmapImage2D.data,
				0, 0,
				this._defaultBitmapImage2D.width,
				this._defaultBitmapImage2D.height);
		}

		this._defaultBitmapImageCube = b;
	}

	private static createDefaultSampler(): void {
		this._defaultSampler = new ImageSampler();
	}

	private static createDefaultImage2D() {
		const b: BitmapImage2D = new this._defaultBitmap2DCtor(8, 8, false, 0x000000);

		//create chekerboard
		let i: number, j: number;
		for (i = 0; i < 8; i++)
			for (j = 0; j < 8; j++)
				if ((j & 1) ^ (i & 1))
					b.setPixel(i, j, 0XFFFFFF);

		return b;
	}

	public static registerDefaults (
		bitmapCtor: {new(...args: any[]): BitmapImage2D},
		cubeCtor: {new(...args: any[]): BitmapImageCube},
		factoryCtor: {new(): IGraphicsFactory}
	) {
		this._defaultBitmap2DCtor = bitmapCtor;
		this._defaultBitmapCubeCtor = cubeCtor;
		this._defaultFactoryCtor = factoryCtor;
	}

}

export default ImageUtils;