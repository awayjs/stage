import { IUnloadable, UnloadManager, UnloadService } from '../managers/UnloadManager';
import { Settings } from '../Settings';

export type TCtr<T> = { new(...args: any[]): T };

export class BufferPool<T extends IUnloadable> {
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

	public create(gl: WebGLRenderingContext, arg1?: any, arg2?: any, arg3?: any): T {
		let el = this._store.pop();

		if (!el) {
			el = new this._tCtrl(gl, arg1, arg2, arg3);
		} else {
			Settings.ENABLE_UNLOAD_BUFFER && this._manager.removeTask(el);
		}

		Settings.ENABLE_UNLOAD_BUFFER && (el.lastUsedTime = this._manager.correctedTime);

		el.apply && el.apply(gl, arg1, arg2, arg3);

		return el;
	}

	public store(el: T): boolean {
		if (!Settings.ENABLE_BUFFER_POOLING || this._store.length === this.maxStoreSize)
			return false;

		if (Settings.ENABLE_UNLOAD_BUFFER) {
			el.lastUsedTime = this._manager.correctedTime;
			this._manager.addTask(el);
		}

		return !!this._store.push(el);
	}

	public remove(el: T): boolean {
		const index = this._store.indexOf(el);

		if (index > -1) {
			this._store.splice(index, 1);
			return true;
		}

		return false;
	}

	public clear() {
		this._manager && this._manager.clear();
	}
}