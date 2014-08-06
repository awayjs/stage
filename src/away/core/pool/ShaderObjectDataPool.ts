///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import MaterialPassVO				= away.materials.MaterialPassVO;

	/**
	 * @class away.pool.ShaderObjectDataPool
	 */
	export class ShaderObjectDataPool
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
		public getItem(materialPass:MaterialPassVO):ShaderObjectData
		{
			return (this._pool[materialPass._iUniqueId] || (this._pool[materialPass._iUniqueId] = materialPass._iAddShaderObjectData(new ShaderObjectData(this, this._context, materialPass))))
		}

		/**
		 * //TODO
		 *
		 * @param materialOwner
		 */
		public disposeItem(materialPass:MaterialPassVO)
		{
			materialPass._iRemoveShaderObjectData(this._pool[materialPass._iUniqueId]);

			this._pool[materialPass._iUniqueId] = null;
		}
	}
}