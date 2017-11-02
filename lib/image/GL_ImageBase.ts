import {AbstractMethodError, AssetEvent, IAsset, AbstractionBase} from "@awayjs/core";

import {ImageEvent, ImageBase, MapperBase} from "@awayjs/graphics";

import {ITextureBase} from "../base/ITextureBase";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class GL_ImageBase extends AbstractionBase
{
	private _mapper:MapperBase;

	public usages:number = 0;

	public _texture:ITextureBase;

	public _mipmap:boolean;

	public _stage:Stage;

	public _invalidMipmaps:boolean = true;

    public _invalidMapper:boolean = true;

	private _onInvalidateMipmapsDelegate:(event:ImageEvent) => void;
    private _onInvalidateMapperDelegate:(event:ImageEvent) => void;

	public getTexture():ITextureBase
	{
		if (!this._texture) {
			this._createTexture();
			this._invalid = true;
		}

		return this._texture;
	}

	constructor(asset:IAsset, stage:Stage)
	{
		super(asset, stage);

		this._stage = stage;
        this._mapper = (<ImageBase> this._asset).mapper;

        if (this._mapper)
            this._stage._addMapper(this._mapper);

		this._onInvalidateMipmapsDelegate = (event:ImageEvent) => this._onInvalidateMipmaps(event);
        this._onInvalidateMapperDelegate = (event:ImageEvent) => this._onInvalidateMapper(event);

		this._asset.addEventListener(ImageEvent.INVALIDATE_MIPMAPS, this._onInvalidateMipmapsDelegate);
        this._asset.addEventListener(ImageEvent.INVALIDATE_MAPPER, this._onInvalidateMapperDelegate);
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

	public activate(index:number, mipmap:boolean):void
	{
		this._stage.context.setTextureAt(index, this.getTexture());
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

    /**
     *
     */
    private _onInvalidateMapper(event:ImageEvent):void
    {
    	if (this._mapper)
        	this._stage._removeMapper(this._mapper);

        this._mapper = (<ImageBase> this._asset).mapper;

        if (this._mapper)
            this._stage._addMapper(this._mapper);
    }
}