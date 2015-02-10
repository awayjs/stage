import ITextureData					= require("awayjs-core/lib/pool/ITextureData");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import TextureDataPool				= require("awayjs-stagegl/lib/pool/TextureDataPool");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.TextureDataBase
 */
class TextureData implements ITextureData
{
	private _pool:TextureDataPool;

	public texture:ITextureBase;

	public textureProxy:TextureProxyBase;

	public mipmap:boolean;

	public invalid:boolean;

	constructor(pool:TextureDataPool, textureProxy:TextureProxyBase, mipmap:boolean)
	{
		this._pool = pool;
		this.textureProxy = textureProxy;
		this.mipmap = mipmap;
	}

	/**
	 *
	 */
	public dispose()
	{
		this._pool.disposeItem(this.textureProxy);

		this.texture.dispose();
		this.texture = null;
	}

	/**
	 *
	 */
	public invalidate()
	{
		this.invalid = true;
	}
}

export = TextureData;