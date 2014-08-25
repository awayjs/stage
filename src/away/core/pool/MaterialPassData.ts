///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import StageGLMaterialBase			= away.materials.StageGLMaterialBase;
	import MaterialPassBase				= away.materials.MaterialPassBase;
	import ShaderObjectBase				= away.materials.ShaderObjectBase;

	/**
	 *
	 * @class away.pool.MaterialPassData
	 */
	export class MaterialPassData implements IMaterialPassData
	{
		private _pool:MaterialPassDataPool;

		public material:StageGLMaterialBase;

		public shaderObject:ShaderObjectBase;

		public materialPass:MaterialPassBase;

		public programData:ProgramData;

		public shadedTarget:string;

		public vertexCode:string;

		public postAnimationFragmentCode:string;

		public fragmentCode:string;

		public animationVertexCode:string = "";

		public animationFragmentCode:string = "";

		public key:string;

		public invalid:boolean;

		public usesAnimation:boolean;

		constructor(pool:MaterialPassDataPool, material:StageGLMaterialBase, materialPass:MaterialPassBase)
		{
			this._pool = pool;
			this.material = material;
			this.materialPass = materialPass;
		}

		/**
		 *
		 */
		public dispose()
		{
			this._pool.disposeItem(this.materialPass);

			this.shaderObject.dispose();
			this.shaderObject = null;

			this.programData.dispose();
			this.programData = null;
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
