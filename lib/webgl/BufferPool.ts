import { IUnloadable, UnloadManager, UnloadService } from '../managers/UnloadManager';
import { Settings } from '../Settings';
import { ContextWebGL } from './ContextWebGL';

export type TCtr<T> = { new(...args: any[]): T };

export class BufferPool<T extends IUnloadable> {
	public static GLOBAL_POOL_ID = 0;
	private _store: Array<T> = [];
	private _manager: UnloadManager<T>;

	constructor (
		private _tCtrl: TCtr<T>,
		public maxStoreSize = Settings.MAX_BUFFER_POOL_SIZE) {

		if (Settings.ENABLE_UNLOAD_BUFFER) {
			this._manager = UnloadService.createManager({
				name: _tCtrl.name,
				keepAliveTime: Settings.MAX_BUFFER_ALIVE_TIME
			});
		}
	}

	public create(context: ContextWebGL, arg1?: any, arg2?: any, arg3?: any): T {
		let el = this._store.pop();

		if (!el) {
			el = new this._tCtrl(context, arg1, arg2, arg3);
			el.id = BufferPool.GLOBAL_POOL_ID++;

			//console.debug('[Buffer Pool], Contstuct new buffer:', this._tCtrl.name, el.id);
		} else if (Settings.ENABLE_UNLOAD_BUFFER) {
			this._manager.removeTask(el);
			el.lastUsedTime = this._manager.correctedTime;
		}

		el.apply && el.apply(context, arg1, arg2, arg3);

		return el;
	}

	public store(el: T): boolean {
		if (!Settings.ENABLE_BUFFER_POOLING || this._store.length === this.maxStoreSize)
			return false;

		this._store.push(el);

		if (Settings.ENABLE_UNLOAD_BUFFER) {
			el.lastUsedTime = this._manager.correctedTime;
			this._manager.addTask(el);

			//console.debug('[Buffer Pool], Store buffer and task to unload:', el.id, this._store.length);
		} else {
			//console.debug('[Buffer Pool], Store buffer without unload:', el.id, this._store.length);
		}

		return true;
	}

	public remove(el: T): boolean {
		const index = this._store.indexOf(el);

		if (index > -1) {
			//console.debug('[Buffer Pool], remove element from pool:', el.id);

			this._store.splice(index, 1);
			return true;
		}

		return false;
	}

	public clear() {
		this._manager && this._manager.clear();
	}
}