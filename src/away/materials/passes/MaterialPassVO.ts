///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.materials
{
	import AbstractMethodError				= away.errors.AbstractMethodError;
	import ShaderObjectData					= away.pool.ShaderObjectData;

	/**
	 *
	 * @class away.pool.MaterialPassDataBase
	 */
	export class MaterialPassVO
	{
		public _iRenderOrderId:number;

		private _shaderObjectData:Array<ShaderObjectData> = new Array<ShaderObjectData>();

		public static MATERIALPASS_ID_COUNT:number = 0;

		/**
		 * An id for this material pass, used to identify material passes when using animation sets.
		 *
		 * @private
		 */
		public _iUniqueId:number;

		public material:MaterialBase;

		public materialPass:IMaterialPassStageGL;

		constructor(material:MaterialBase, materialPass:IMaterialPassStageGL)
		{
			this.material = material;

			this.materialPass = materialPass;

			this._iUniqueId = MaterialPassVO.MATERIALPASS_ID_COUNT++;
		}

		/**
		 *
		 */
		public invalidate():void
		{
			var len:number = this._shaderObjectData.length;
			for (var i:number = 0; i < len; i++)
				this._shaderObjectData[i].invalidate();
		}

		/**
		 *
		 */
		public dispose()
		{
			while (this._shaderObjectData.length)
				this._shaderObjectData[0].dispose();

			this.material = null;
			this.materialPass = null;
		}

		public _iAddShaderObjectData(shaderObjectData:ShaderObjectData):ShaderObjectData
		{
			this._shaderObjectData.push(shaderObjectData);

			return shaderObjectData;
		}

		public _iRemoveShaderObjectData(shaderObjectData:ShaderObjectData):ShaderObjectData
		{
			this._shaderObjectData.splice(this._shaderObjectData.indexOf(shaderObjectData), 1);

			return shaderObjectData;
		}

		private calculateID()
		{
			this._iRenderOrderId = 0;
			var len:number = this._shaderObjectData.length
			for (var i:number = 0; i < len; i++)
				this._iRenderOrderId += this._shaderObjectData[i].programData.id;
		}
	}
}
