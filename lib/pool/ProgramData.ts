import ProgramDataPool				= require("awayjs-stagegl/lib/pool/ProgramDataPool");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import Stage						= require("awayjs-stagegl/lib/base/Stage");

/**
 *
 * @class away.pool.ProgramDataBase
 */
class ProgramData
{
	public static PROGRAMDATA_ID_COUNT:number = 0;

	private _pool:ProgramDataPool;
	private _key:string;

	public stage:Stage;

	public usages:number = 0;

	public program:IProgram;

	public id:number;

	constructor(pool:ProgramDataPool, context:Stage, key:string)
	{
		this._pool = pool;
		this.stage = context;
		this._key = key;
		this.stage.registerProgram(this);
	}

	/**
	 *
	 */
	public dispose()
	{
		this.usages--;

		if (!this.usages) {
			this._pool.disposeItem(this._key);

			this.stage.unRegisterProgram(this);

			if (this.program)
				this.program.dispose();
		}

		this.program = null;
	}
}

export = ProgramData;