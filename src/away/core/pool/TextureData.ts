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
		public context:ContextGLBase;

		public texture:ITextureBase;

		public textureProxy:TextureProxyBase;

		public invalid:boolean;

		constructor(context:ContextGLBase, textureProxy:TextureProxyBase)
		{
			this.context = context;
			this.textureProxy = textureProxy;
		}

		/**
		 *
		 */
		public dispose()
		{
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
