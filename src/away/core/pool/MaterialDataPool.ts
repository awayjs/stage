///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import MaterialBase					= away.materials.MaterialBase;

	/**
	 * @class away.pool.MaterialDataPool
	 */
	export class MaterialDataPool
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
		public getItem(material:MaterialBase):MaterialData
		{
			return (this._pool[material.id] || (this._pool[material.id] = material._iAddMaterialData(new MaterialData(this, this._context, material))))
		}

		/**
		 * //TODO
		 *
		 * @param materialOwner
		 */
		public disposeItem(material:MaterialBase)
		{
			material._iRemoveMaterialData(this._pool[material.id]);

			this._pool[material.id] = null;
		}
	}
}