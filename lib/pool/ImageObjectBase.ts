import AbstractMethodError			= require("awayjs-core/lib/errors/AbstractMethodError");
import IImageObject					= require("awayjs-core/lib/pool/IImageObject");
import ImageBase					= require("awayjs-core/lib/data/ImageBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class ImageObjectBase implements IImageObject
{
	private _pool:ImageObjectPool;

	public _stage:Stage;

	public _texture:ITextureBase;

	public _image:ImageBase;

	public _mipmap:boolean;

	public _invalid:boolean;

	constructor(pool:ImageObjectPool, image:ImageBase, stage:Stage)
	{
		this._pool = pool;
		this._image = image;
		this._stage = stage;
	}

	/**
	 *
	 */
	public dispose()
	{
		this._pool.disposeItem(this._image);

		this._texture.dispose();
		this._texture = null;
	}

	/**
	 *
	 */
	public invalidate()
	{
		this._invalid = true;
	}

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		this._stage.setSamplerState(index, repeat, smooth, mipmap);

		this._stage.context.setTextureAt(index, this.getTexture(this._stage.context));
	}

	public getTexture(context:IContextGL):ITextureBase
	{
		throw new AbstractMethodError();
	}
}

export = ImageObjectBase;