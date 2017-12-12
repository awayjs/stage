import {AssetBase, Rectangle} from "@awayjs/core";

/**
 *
 */
export class ImageSampler extends AssetBase
{
    public static assetType:string = "[asset Sampler]";

    private _repeat:boolean;
	private _smooth:boolean;
	private _mipmap:boolean;

    private _imageRect:Rectangle;
    private _frameRect:Rectangle;

    /**
     *
     * @returns {string}
     */
    public get assetType():string
    {
        return ImageSampler.assetType;
    }


    /**
     *
     */
    public get repeat():boolean
    {
        return this._repeat;
    }
    public set repeat(value:boolean)
    {
        if (this._repeat == value)
            return;

        this._repeat = value;

        //TODO: update dependencies
    }

	/**
	 *
	 */
	public get smooth():boolean
	{
		return this._smooth;
	}
	public set smooth(value:boolean)
	{
		if (this._smooth == value)
			return;

		this._smooth = value;

		//TODO: update dependencies
	}

	/**
	 *
	 */
	public get mipmap():boolean
	{
		return this._mipmap;
	}
	public set mipmap(value:boolean)
	{
		if (this._mipmap == value)
			return;

		this._mipmap = value;

		//TODO: update dependencies
	}

    /**
     *
     */
    public get imageRect():Rectangle
    {
        return this._imageRect;
    }
    public set imageRect(value:Rectangle)
    {
        if (this._imageRect == value)
            return;

        this._imageRect = value;

        this._updateRect();
    }

    /**
     *
     */
    public get frameRect():Rectangle
    {
        return this._frameRect;
    }
    public set frameRect(value:Rectangle)
    {
        if (this._frameRect == value)
            return;

        this._frameRect = value;

        this._updateRect();
    }

	/**
	 *
	 */
	constructor(repeat:boolean = false, smooth:boolean = false, mipmap:boolean = false)
	{
		super();

        this._repeat = repeat;
		this._smooth = smooth;
		this._mipmap = mipmap;
	}

    private _updateRect():void
    {
    }
}