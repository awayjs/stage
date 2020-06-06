import {ProgramData} from "../image/ProgramData";

import {Stage} from "../Stage";

/**
 * @class away.pool.ProgramDataPool
 */
export class ProgramDataPool
{
	private _pool: StringMap<ProgramData> = {};
	
	// Killing pool
	private _disposedPool: StringMap<ProgramData> = {};

	private _stage: Stage;

	/**
	 * Time to alive Program data after disposing, sec
	 */
	public keepAlive: number = 1_000; //1 sec in ms

	/**
	 * //TODO
	 *
	 * @param {Stage} stage
	 */
	constructor(stage:Stage)
	{
		this._stage = stage;
	}

	/**
	 * Collect `disposed` progs and dispose it finaly
	 */
	public collect() {
		const now = Date.now();
	
		for(let key in this._disposedPool) {
			const prog = this._disposedPool[key];
			
			if(!prog.usages && (prog.disposedAt + this.keepAlive < now)  || prog.disposed) {
				delete this._pool[key];
				delete this._disposedPool[key];

				prog.disposeFinaly();
			}
		}
	}
	/**
	 * //TODO
	 *
	 * @param materialOwner
	 * @returns ITexture
	 */
	public getItem(vertexString:string, fragmentString:string):ProgramData
	{
		var key = vertexString + fragmentString;
		var prog = this._pool[key] ||  (this._pool[key] = new ProgramData(this, this._stage, vertexString, fragmentString));
		
		prog.disposedAt = -1;

		delete this._disposedPool[key];

		this.collect();

		return prog;
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 */
	public disposeItem(key:string):void
	{
		const entry = this._pool[key];
		
		if(entry) {
			entry.disposedAt = Date.now();

			this._disposedPool[key] = entry;
		}
	}
}