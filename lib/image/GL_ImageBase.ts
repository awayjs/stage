import {AbstractMethodError, AssetEvent, IAsset, AbstractionBase} from "@awayjs/core";

import {ImageEvent} from "@awayjs/graphics";

import {ITextureBase} from "../base/ITextureBase";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class GL_ImageBase extends AbstractionBase
{
	public usages:number = 0;

	public _texture:ITextureBase;

	public _mipmap:boolean;

	public _stage:Stage;

	public _invalidMipmaps:boolean = true;

	private _onInvalidateMipmapsDelegate:(event:ImageEvent) => void;

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

		this._onInvalidateMipmapsDelegate = (event:ImageEvent) => this.onInvalidateMipmaps(event);

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

	public activate(index:number, mipmap:boolean):void
	{
		this._stage.context.setTextureAt(index, this.getTexture());
	}

	public _createTexture():void
	{
		throw new AbstractMethodError();
	}

	/**
	 *
	 */
	public onInvalidateMipmaps(event:ImageEvent):void
	{
		this._invalidMipmaps = true;
	}
}