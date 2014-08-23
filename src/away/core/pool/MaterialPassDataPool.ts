///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import MaterialBase					= away.materials.MaterialBase;
	import MaterialPassBase				= away.materials.MaterialPassBase;

	/**
	 * @class away.pool.MaterialPassDataPool
	 */
	export class MaterialPassDataPool
	{
		private _pool:Object = new Object();
		private _material:MaterialBase;

		/**
		 * //TODO
		 *
		 * @param textureDataClass
		 */
		constructor(material:MaterialBase)
		{
			this._material = material;
		}

		/**
		 * //TODO
		 *
		 * @param materialOwner
		 * @returns ITexture
		 */
		public getItem(materialPass:MaterialPassBase):MaterialPassData
		{
			return (this._pool[materialPass.id] || (this._pool[materialPass.id] = materialPass._iAddMaterialPassData(new MaterialPassData(this, this._material, materialPass))))
		}

		/**
		 * //TODO
		 *
		 * @param materialOwner
		 */
		public disposeItem(materialPass:MaterialPassBase)
		{
			materialPass._iRemoveMaterialPassData(this._pool[materialPass.id]);

			delete this._pool[materialPass.id];
		}

		public disposePool()
		{
			for (var id in this._pool)
				(<MaterialPassData> this._pool[id]).materialPass._iRemoveMaterialPassData(this._pool[id]);

			delete this._pool;
		}
	}
}