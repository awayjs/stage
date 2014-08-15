///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import MaterialBase					= away.materials.MaterialBase;
	import ShaderObjectBase				= away.materials.ShaderObjectBase;
	import ContextGLBase				= away.stagegl.ContextGLBase;

	/**
	 *
	 * @class away.pool.RenderOrderData
	 */
	export class RenderOrderData implements IRenderOrderData
	{
		private _pool:RenderOrderDataPool;

		public context:ContextGLBase;

		public material:MaterialBase;

		public id:number;

		public shaderObjects:Array<ShaderObjectData>;

		public invalid:boolean;

		constructor(pool:RenderOrderDataPool, context:ContextGLBase, material:MaterialBase)
		{
			this._pool = pool;
			this.context = context;
			this.material = material;
		}

		/**
		 *
		 */
		public dispose()
		{
			this._pool.disposeItem(this.material);

			this.shaderObjects = null;
		}

		/**
		 *
		 */
		public reset()
		{
			this.shaderObjects = null;
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
