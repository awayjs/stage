import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import TextureData					= require("awayjs-stagegl/lib/core/pool/TextureData");
import ContextGLBase				= require("awayjs-stagegl/lib/core/stagegl/ContextGLBase");

/**
 * @class away.pool.TextureDataPool
 */
class TextureDataPool
{
	private _pool:Object = new Object();
	private _context:ContextGLBase;

	/**
	 * //TODO
	 *
	 * @param textureDataClass
	 */
	constructor(context:ContextGLBase)
	{
		this._context = context;
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 * @returns ITexture
	 */
	public getItem(textureProxy:TextureProxyBase):TextureData
	{
		return (this._pool[textureProxy.id] || (this._pool[textureProxy.id] = textureProxy._iAddTextureData(new TextureData(this, this._context, textureProxy))))
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 */
	public disposeItem(textureProxy:TextureProxyBase)
	{
		textureProxy._iRemoveTextureData(this._pool[textureProxy.id]);

		this._pool[textureProxy.id] = null;
	}
}

export = TextureDataPool;