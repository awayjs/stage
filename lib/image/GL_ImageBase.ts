import AbstractMethodError			= require("awayjs-core/lib/errors/AbstractMethodError");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import AbstractionBase				= require("awayjs-core/lib/library/AbstractionBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.GL_ImageBase
 */
class GL_ImageBase extends AbstractionBase
{
	public usages:number = 0;

	public _texture:ITextureBase;

	public _mipmap:boolean;

	public _stage:Stage;

	constructor(asset:IAsset, stage:Stage)
	{
		super(asset, stage);

		this._stage = stage;
	}

	/**
	 *
	 */
	public onClear(event:AssetEvent)
	{
		super.onClear(event);

		if (this._texture) {
			this._texture.dispose();
			this._texture = null;
		}
	}

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		this._stage.setSamplerState(index, repeat, smooth, mipmap);

		this._stage.context.setTextureAt(index, this._getTexture());
	}

	public _getTexture():ITextureBase
	{
		throw new AbstractMethodError();
	}
}

export = GL_ImageBase;