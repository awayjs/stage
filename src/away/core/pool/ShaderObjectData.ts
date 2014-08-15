///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import MaterialPassVO				= away.materials.MaterialPassVO;
	import ShaderObjectBase				= away.materials.ShaderObjectBase;
	import ContextGLBase				= away.stagegl.ContextGLBase;

	/**
	 *
	 * @class away.pool.ShaderObjectData
	 */
	export class ShaderObjectData
	{
		private _pool:ShaderObjectDataPool;

		public context:ContextGLBase;

		public shaderObject:ShaderObjectBase;

		public materialPassVO:MaterialPassVO;

		public programData:ProgramData;

		public shadedTarget:string;

		public vertexCode:string;

		public postAnimationFragmentCode:string;

		public fragmentCode:string;

		public animationVertexCode:string = "";

		public animationFragmentCode:string = "";

		public key:string;

		public invalid:boolean;

		constructor(pool:ShaderObjectDataPool, context:ContextGLBase, materialPassVO:MaterialPassVO)
		{
			this._pool = pool;
			this.context = context;
			this.materialPassVO = materialPassVO;
		}

		/**
		 *
		 */
		public dispose()
		{
			this._pool.disposeItem(this.materialPassVO);

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
