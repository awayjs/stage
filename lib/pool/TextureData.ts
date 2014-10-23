import ITextureData					= require("awayjs-core/lib/pool/ITextureData");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import TextureDataPool				= require("awayjs-stagegl/lib/pool/TextureDataPool");
import ContextGLBase				= require("awayjs-stagegl/lib/base/ContextGLBase");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.TextureDataBase
 */
class TextureData implements ITextureData
{
	private _pool:TextureDataPool;

	public context:ContextGLBase;

	public texture:ITextureBase;

	public textureProxy:TextureProxyBase;

	public invalid:boolean;

	constructor(pool:TextureDataPool, context:ContextGLBase, textureProxy:TextureProxyBase)
	{
		this._pool = pool;
		this.context = context;
		this.textureProxy = textureProxy;
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