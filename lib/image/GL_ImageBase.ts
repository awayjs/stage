import {AbstractMethodError, AssetEvent, IAsset, AbstractionBase} from "@awayjs/core";

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

	public get texture():ITextureBase
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
		this._stage.context.setTextureAt(index, this._texture);
	}

	public _createTexture():void
	{
		throw new AbstractMethodError();
	}
}