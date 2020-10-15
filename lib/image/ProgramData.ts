import { IProgram } from '../base/IProgram';
import { ProgramDataPool } from '../image/ProgramDataPool';

import { Stage } from '../Stage';

/**
 *
 * @class away.pool.ProgramDataBase
 */
export class ProgramData {
	public static PROGRAMDATA_ID_COUNT: number = 0;

	private _pool: ProgramDataPool;

	public vertexString: string;

	public fragmentString: string;

	public stage: Stage;

	public usages: number = 0;

	/**
	 * Dispose time, used in ProgramDataPool to avoid recreatings
	 */
	public disposedAt: number = -1;

	public program: IProgram;

	public id: number;

	public disposed: boolean = false;

	constructor(pool: ProgramDataPool, context: Stage, vertexString: string, fragmentString: string) {
		this._pool = pool;
		this.stage = context;
		this.vertexString = vertexString;
		this.fragmentString = fragmentString;
		this.stage.registerProgram(this);
	}

	/**
	 * Lighed dispose. Pushs prog to pool for waiting time to die or mercy
	 */
	public dispose(): void {
		this.usages--;

		if (!this.usages) {
			this._pool.disposeItem(this.vertexString + this.fragmentString);
		}
	}

	/**
	 * Dispose prog and internal prog completely
	 */
	public disposeFinaly() {
		if (this.stage) {
			this.stage.unRegisterProgram(this);
		}

		if (this.program) {
			this.program.dispose();
		}

		this.program = null;
		this.usages = 0;
		this.vertexString = undefined;
		this.fragmentString = undefined;
		this.disposedAt = -1;
		this.stage = undefined;

		this.disposed = true;
	}
}