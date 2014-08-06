///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import ShaderObjectBase				= away.materials.ShaderObjectBase;
	import TextureProxyBase				= away.textures.TextureProxyBase;

	/**
	 * @class away.pool.ProgramDataPool
	 */
	export class ProgramDataPool
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
		public getItem(key:string):ProgramData
		{
			return this._pool[key] || (this._pool[key] = new ProgramData(this, this._context, key));
		}

		/**
		 * //TODO
		 *
		 * @param materialOwner
		 */
		public disposeItem(key:string)
		{
			this._pool[key] = null;
		}
	}
}