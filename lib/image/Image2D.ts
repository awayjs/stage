import {Rectangle, AbstractMethodError} from "@awayjs/core";

import {ImageUtils} from "../utils/ImageUtils";

import {ImageBase} from "./ImageBase";

export class Image2D extends ImageBase
{
	public static assetType:string = "[image Image2D]";

	public _rect:Rectangle;

	private _powerOfTwo:boolean = true;

	/**
	 *
	 * @returns {string}
	 */
	public get assetType():string
	{
		return Image2D.assetType;
	}

	/**
	 * The height of the image in pixels.
	 */
	public get height():number
	{
		return this._rect.height;
	}

	public set height(value:number)
	{
		this._setSize(this._rect.width, value);
	}

	/**
	 * The rectangle that defines the size and location of the bitmap image. The
	 * top and left of the rectangle are 0; the width and height are equal to the
	 * width and height in pixels of the BitmapData object.
	 */
	public get rect():Rectangle
	{
		return this._rect;
	}

	/**
	 * The width of the bitmap image in pixels.
	 */
	public get width():number
	{
		return this._rect.width;
	}

	public set width(value:number)
	{
		this._setSize(value, this._rect.height);
	}

	/**
	 *
	 */
	constructor(width:number, height:number, powerOfTwo:boolean = true)
	{
		super();

		this._rect = new Rectangle(0, 0, Math.round(width), Math.round(height));
		this._powerOfTwo = powerOfTwo;
		this._testDimensions();
	}

	/**
	 *
	 * @param width
	 * @param height
	 * @private
	 */
	public _setSize(width:number, height:number):void
	{
		width = Math.round(width);
		height = Math.round(height);

		if (this._rect.width == width && this._rect.height == height)
			return;

		this.clear();

		this._rect.width = width;
		this._rect.height = height;

		this._testDimensions();
	}

	/**
	 *
	 * @private
	 */
	private _testDimensions():void
	{
		if (this._powerOfTwo && (!ImageUtils.isDimensionValid(this._rect.width) || !ImageUtils.isDimensionValid(this._rect.height)))
			throw new Error("Invalid dimension: Width and height must be power of 2 and cannot exceed 2048");
	}

	/**
	 * Enable POT texture size validation
	 * @returns {boolean}
	 */
	public get powerOfTwo():boolean
	{
		return this._powerOfTwo;
	}

	public set powerOfTwo(value:boolean)
	{
		if(this._powerOfTwo == value) return;
		this._powerOfTwo = value;
		this._testDimensions();
	}


	/**
	 *
	 * @returns {ImageData}
	 */
	public getImageData():ImageData
	{
		throw new AbstractMethodError();
	}
}

import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";

import {_Stage_ImageBase} from "./ImageBase";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.ImageStateBase
 */
export class _Stage_Image2D extends _Stage_ImageBase
{

    public getType():string
    {
        return "2d";
    }

    /**
     *
     * @param context
     * @returns {ITexture}
     */
    protected _createTexture():void
    {
        this._texture = this._stage.context.createTexture((<Image2D> this._asset).width, (<Image2D> this._asset).height, ContextGLTextureFormat.BGRA, true);
    }
}

Stage.registerAbstraction(_Stage_Image2D, Image2D);