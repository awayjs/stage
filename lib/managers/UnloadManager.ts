
export interface IUnloadable {
	keepAliveTime?: number;
	lastUsedTime: number;
	canUnload: boolean;
	unload(): void;
}

function sortManagersFunct(a: UnloadManager<IUnloadable>, b: UnloadManager<IUnloadable>) {
	return a.priority - b.priority;
}

export interface IManagerOptions {
	name?: string;
	keepAliveTime?: number;
	priority?: number;
}

export class UnloadService {
	public static tick = 0;
	private static managers: Array<UnloadManager<IUnloadable>> = [];
	public static createManager <T extends IUnloadable> (options?: IManagerOptions): UnloadManager<T> {
		options = Object.assign({
			name: UnloadManager.name + ':' + this.managers.length
		}, options || {});

		const manager = new UnloadManager<T>(options);
		this.managers.push(manager);
		this.managers.sort(sortManagersFunct);

		return manager;
	}

	public static executeAll() {
		for (const m of this.managers) {
			const count = m.execute();
			if (count) {
				console.debug(`[UnloadService:${m.name}, tick: ${this.tick}] unloaded:`, count);
			}
		}

		this.tick++;
	}

	public static clearAll() {
		for (const m of this.managers) {
			m.clear();
		}

		this.tick = 0;
		this.managers.length = 0;
	}
}

export class UnloadManager<T extends IUnloadable> {
	_tasks: Set<T> = new Set();

	public name = UnloadManager.name;
	public priority = 0;
	public keepAliveTime = 10_000;
	public exectuionTimeout = 5_000;
	public unloadTaskShift = 1_000;
	public maxUnloadTask = 100;

	constructor(options?: IManagerOptions) {
		if (options) {
			this.name = options.name || this.name;
			this.keepAliveTime = options.keepAliveTime || this.keepAliveTime;
			this.priority = options.priority ?? this.priority;
		}
	}

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
