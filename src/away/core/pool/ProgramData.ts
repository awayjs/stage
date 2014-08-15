///<reference path="../../_definitions.ts"/>

/**
 * @module away.pool
 */
module away.pool
{
	import ContextGLBase				= away.stagegl.ContextGLBase;
	import IProgram						= away.stagegl.IProgram;

	/**
	 *
	 * @class away.pool.ProgramDataBase
	 */
	export class ProgramData
	{
		public static PROGRAMDATA_ID_COUNT:number = 0;

		private _pool:ProgramDataPool;
		private _key:string;

		public context:ContextGLBase;

		public usages:number = 0;

		public program:IProgram;

		public id:number;

		constructor(pool:ProgramDataPool, context:ContextGLBase, key:string)
		{
			this._pool = pool;
			this.context = context;
			this._key = key;
			this.context.registerProgram(this);
		}

		/**
		 *
		 */
		public dispose()
		{
			this.usages--;

			if (!this.usages) {
				this._pool.disposeItem(this._key);

				this.context.unRegisterProgram(this);

				if (this.program)
					this.program.dispose();
			}

			this.program = null;
		}
	}
}
