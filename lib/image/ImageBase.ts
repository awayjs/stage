import {AssetBase} from "@awayjs/core";

import {ImageEvent} from "../events/ImageEvent";

export class ImageBase extends AssetBase
{
	public _pFormat:string = "bgra";

	/**
	 *
	 */
	constructor()
	{
		super();
	}

	/**
	 *
	 * @returns {string}
	 */
	public get format():string
	{
		return this._pFormat;
	}

	/**
	 *
	 */
	public invalidateMipmaps():void
	{
		this.dispatchEvent(new ImageEvent(ImageEvent.INVALIDATE_MIPMAPS, this));
	}
}

import {AbstractMethodError, AssetEvent, IAsset, AbstractionBase} from "@awayjs/core";

import {ITextureBase} from "../base/ITextureBase";
import {ImageUtils} from "../utils/ImageUtils";

import {ImageSampler} from "./ImageSampler";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class _Stage_ImageBase extends AbstractionBase
{
    public usages:number = 0;

    public _texture:ITextureBase;

    public _mipmap:boolean;

    public _stage:Stage;

    public _invalidMipmaps:boolean = true;

    public _invalidMapper:boolean = true;

    private _onInvalidateMipmapsDelegate:(event:ImageEvent) => void;

    public getTexture():ITextureBase
    {
        if (!this._texture) {
            this._createTexture();
            this._invalid = true;
        }

        return this._texture;
    }

    public getType():string
    {
        throw new AbstractMethodError();
    }

    constructor(asset:IAsset, stage:Stage)
    {
        super(asset, stage);

        this._stage = stage;

        this._onInvalidateMipmapsDelegate = (event:ImageEvent) => this._onInvalidateMipmaps(event);

        this._asset.addEventListener(ImageEvent.INVALIDATE_MIPMAPS, this._onInvalidateMipmapsDelegate);
    }

    /**
     *
     */
    public onClear(event:AssetEvent):void
    {
        super.onClear(event);

        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
    }

    public activate(index:number, sampler:ImageSampler = null):void
    {
        if (!sampler)
            sampler = ImageUtils.getDefaultSampler();

        var mipmap:boolean = (sampler.mipmap && !this._stage.globalDisableMipmap)? sampler.mipmap : false;

        this._stage.setSamplerAt(index, sampler);
        this._stage.context.setTextureAt(index, this.getTexture());

        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalidMipmaps = true;
        }

        if (this._invalidMipmaps) {
            this._invalidMipmaps = false;

            if (mipmap) //todo: allow for non-generated mipmaps
                this._texture.generateMipmaps();
        }
    }

    protected _createTexture():void
    {
        throw new AbstractMethodError();
    }

    /**
     *
     */
    private _onInvalidateMipmaps(event:ImageEvent):void
    {
        this._invalidMipmaps = true;
    }
}