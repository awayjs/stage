///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import ITextureBase					= away.stagegl.ITextureBase;
	import TextureProxyBase				= away.textures.TextureProxyBase;

	/**
	 *
	 * @class away.pool.TextureDataBase
	 */
	export class TextureData implements ITextureData
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
}
