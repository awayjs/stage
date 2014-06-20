///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import TextureProxyBase				= away.textures.TextureProxyBase;

	/**
	 * @class away.pool.TextureDataPool
	 */
	export class TextureDataPool
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
			return (this._pool[textureProxy.id] || (this._pool[textureProxy.id] = textureProxy._iAddTextureData(new TextureData(this._context, textureProxy))))
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
}