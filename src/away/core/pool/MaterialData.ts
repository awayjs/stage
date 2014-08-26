///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import StageGLMaterialBase				= away.materials.StageGLMaterialBase;
	import MaterialPassBase					= away.materials.MaterialPassBase;
	import ShaderCompilerBase				= away.materials.ShaderCompilerBase;
	import ShaderObjectBase					= away.materials.ShaderObjectBase;
	import ContextGLBase					= away.stagegl.ContextGLBase;

	/**
	 *
	 * @class away.pool.MaterialData
	 */
	export class MaterialData implements IMaterialData
	{
		private _pool:MaterialDataPool;

		private _materialPassDataPool:MaterialPassDataPool;

		private _passes:Array<MaterialPassData>;

		public context:ContextGLBase;

		public material:StageGLMaterialBase;

		public renderOrderId:number;

		public invalidAnimation:boolean = true;

		constructor(pool:MaterialDataPool, context:ContextGLBase, material:StageGLMaterialBase)
		{
			this._pool = pool;
			this.context = context;
			this.material = material;

			this._materialPassDataPool = new MaterialPassDataPool(material);
		}

		public getMaterialPass(materialPass:MaterialPassBase, profile:string):MaterialPassData
		{
			var materialPassData:MaterialPassData = this._materialPassDataPool.getItem(materialPass);

			if (!materialPassData.shaderObject) {
				materialPassData.shaderObject = materialPass.createShaderObject(profile);
				materialPassData.invalid = true;
			}

			if (materialPassData.invalid) {
				materialPassData.invalid = false;
				var compiler:ShaderCompilerBase = materialPassData.shaderObject.createCompiler(this.material, materialPass);
				compiler.compile();

				materialPassData.shadedTarget = compiler.shadedTarget;
				materialPassData.vertexCode = compiler.vertexCode;
				materialPassData.fragmentCode = compiler.fragmentCode;
				materialPassData.postAnimationFragmentCode = compiler.postAnimationFragmentCode;
				materialPassData.key = "";
			}

			return materialPassData;
		}

		public getMaterialPasses(profile:string):Array<MaterialPassData>
		{
			if (this._passes == null) {
				var passes:Array<MaterialPassBase> = <Array<MaterialPassBase>> this.material._iScreenPasses;
				var numPasses:number = passes.length;

				//reset the material passes in MaterialData
				this._passes = new Array<MaterialPassData>(numPasses);

				//get the shader object for each screen pass and store
				for (var i:number = 0; i < numPasses; i++)
					this._passes[i] = this.getMaterialPass(passes[i], profile);
			}

			return this._passes;
		}

		/**
		 *
		 */
		public dispose()
		{
			this._materialPassDataPool.disposePool();

			this._materialPassDataPool = null;

			this._pool.disposeItem(this.material);

			this._passes = null;
		}

		/**
		 *
		 */
		public invalidateMaterial()
		{
			this._passes = null;

			this.invalidateAnimation();
		}

		/**
		 *
		 */
		public invalidatePasses()
		{
			if (this._passes != null) {
				var len:number = this._passes.length;
				for (var i:number = 0; i < len; i++)
					this._passes[i].invalidate();
			}

			this.invalidateMaterial();
		}

		/**
		 *
		 */
		public invalidateAnimation()
		{
			this.invalidAnimation = true;
		}
	}
}
