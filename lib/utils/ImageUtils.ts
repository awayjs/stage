import {BitmapImage2D} from "../image/BitmapImage2D";
import {BitmapImageCube} from "../image/BitmapImageCube";
import {ImageSampler} from "../image/ImageSampler";
import {DefaultGraphicsFactory} from "../factories/DefaultGraphicsFactory";
import {Image2D} from "../image/Image2D";
import {IGraphicsFactory} from "../factories/IGraphicsFactory";

export class ImageUtils
{
	private static MAX_SIZE:number = 8192;
    private static _defaultSampler:ImageSampler;
    private static _defaultBitmapImage2D:BitmapImage2D;
    private static _defaultBitmapImageCube:BitmapImageCube;

	/**
	 *
	 */
	public static imageToBitmapImage2D(img:HTMLImageElement, powerOfTwo:boolean = true, factory:IGraphicsFactory = null):BitmapImage2D
	{
		if (!factory)
			factory = new DefaultGraphicsFactory();
        var image2D:BitmapImage2D = <BitmapImage2D> factory.createImage2D(img.naturalWidth, img.naturalHeight, true, null, powerOfTwo);
        
        var context:CanvasRenderingContext2D = document.createElement("canvas").getContext("2d");
        context.drawImage(img, 0, 0);
		image2D.setPixels(image2D.rect, context.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data);

		return image2D;
	}
	
	public static isImage2DValid(image2D:Image2D):boolean
	{
		if (image2D == null)
			return true;

		return this.isDimensionValid(image2D.width, image2D.powerOfTwo) && this.isDimensionValid(image2D.height, image2D.powerOfTwo);
	}

	public static isHTMLImageElementValid(image:HTMLImageElement):boolean
	{
		if (image == null)
			return true;

		return this.isDimensionValid(image.width) && this.isDimensionValid(image.height);
	}

	public static isDimensionValid(d:number, powerOfTwo:boolean = true):boolean
	{
		return d >= 1 && d <= this.MAX_SIZE && (!powerOfTwo || this.isPowerOfTwo(d));
	}

	public static isPowerOfTwo(value:number):boolean
	{
		return value? ((value & -value) == value) : false;
	}

	public static getBestPowerOf2(value:number):number
	{
		var p:number = 1;

		while (p < value)
			p <<= 1;

		if (p > this.MAX_SIZE)
			p = this.MAX_SIZE;

		return p;
	}

    public static getDefaultImage2D():BitmapImage2D
    {
        if (!this._defaultBitmapImage2D)
            this.createDefaultImage2D();

        return this._defaultBitmapImage2D;
    }


    public static getDefaultImageCube():BitmapImageCube
    {
        if (!this._defaultBitmapImageCube)
            this.createDefaultImageCube();

        return this._defaultBitmapImageCube;
    }

    public static getDefaultSampler():ImageSampler
    {
        if (!this._defaultSampler)
            this.createDefaultSampler();

        return this._defaultSampler;
    }

    private static createDefaultImageCube():void
    {
        if (!this._defaultBitmapImage2D)
            this.createDefaultImage2D();

        var b = new BitmapImageCube(this._defaultBitmapImage2D.width);

        for (var i:number = 0; i < 6; i++)
            b.drawBitmap(i, this._defaultBitmapImage2D.data, 0, 0, this._defaultBitmapImage2D.width, this._defaultBitmapImage2D.height);

        this._defaultBitmapImageCube = b;
    }


    private static createDefaultImage2D():void
    {
        var b:BitmapImage2D = new BitmapImage2D(8, 8, false, 0x000000);

        //create chekerboard
        var i:number, j:number;
        for (i = 0; i < 8; i++)
            for (j = 0; j < 8; j++)
                if ((j & 1) ^ (i & 1))
                    b.setPixel(i, j, 0XFFFFFF);

        this._defaultBitmapImage2D = b;
    }

    private static createDefaultSampler():void
    {
        this._defaultSampler = new ImageSampler();
    }
}

export default ImageUtils