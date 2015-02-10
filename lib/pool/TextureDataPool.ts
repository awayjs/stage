import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import TextureData					= require("awayjs-stagegl/lib/pool/TextureData");

/**
 * @class away.pool.TextureDataPool
 */
class TextureDataPool
{
	private _pool:Object = new Object();

	/**
	 * //TODO
	 *
	 * @param textureDataClass
	 */
	constructor()
	{
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 * @returns ITexture
	 */
	public getItem(textureProxy:TextureProxyBase, mipmap:boolean):TextureData
	{
		var textureData:TextureData = <TextureData> (this._pool[textureProxy.id] || (this._pool[textureProxy.id] = textureProxy._iAddTextureData(new TextureData(this, textureProxy, mipmap))));

		if (!textureData.mipmap && mipmap) {
			textureData.mipmap = true;
			textureData.invalidate();
		}

		return textureData;
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