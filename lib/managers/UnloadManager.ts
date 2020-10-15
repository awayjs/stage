
export interface IUnloadable {
	keepAliveTime?: number;
	lastUsedTime: number;
	canUnload: boolean;
	unload(): void;
}

export class UnloadManager<T extends IUnloadable> {
	_tasks: Set<T> = new Set();

	public exectuionTimeout = 5_000;
	public unloadTaskShift = 1_000;
	public maxUnloadTask = 100;

	constructor(
		public keepAliveTime = 10_000
	) { }

	private _lastExecutionTime = 0;

	public get correctedTime() {
		return performance.now();
	}

	public addTask(task: T): boolean {
		if (!task || this._tasks.has(task)) {
			return false;
		}

		this._tasks.add(task);
		return true;
	}

	public removeTask(task: T): boolean {
		return this._tasks.delete(task);
	}

	public execute(force = false): number {
		if (!this._tasks.size) {
			return;
		}

		const time = this.correctedTime;

		if (!force) {
			if (!this._lastExecutionTime) {
				this._lastExecutionTime = time;
				return;
			}

			if (time - this._lastExecutionTime < this.exectuionTimeout) {
				return;
			}
		}

		this._lastExecutionTime = time;

		const unloaded = [];
		const values = this._tasks.values();

		for (let i = 0, l = this._tasks.size; i < l; i++) {
			const t = values.next().value;

			if (t.canUnload && time - t.lastUsedTime > (t.keepAliveTime || this.keepAliveTime)) {
				t.unload();
				unloaded[unloaded.length] = t;

				if (unloaded.length >= this.maxUnloadTask) {
					this._lastExecutionTime -= (this.exectuionTimeout - this.unloadTaskShift);
					break;
				}
			}
		}

		for (const u of unloaded) {
			this._tasks.delete(u);
		}

		return unloaded.length;
	}

	public clear() {
		this._tasks.clear();
	}
}
