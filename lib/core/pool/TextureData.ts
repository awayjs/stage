import ITextureData					= require("awayjs-core/lib/core/pool/ITextureData");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import TextureDataPool				= require("awayjs-stagegl/lib/core/pool/TextureDataPool");
import ContextGLBase				= require("awayjs-stagegl/lib/core/stagegl/ContextGLBase");
import ITextureBase					= require("awayjs-stagegl/lib/core/stagegl/ITextureBase");

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