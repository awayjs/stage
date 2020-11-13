
export interface IState <T> {
	dirty: boolean;
	values: T[];
	lock(v: boolean): void;
	set (...args: T[]): boolean;
	setAt(index: number, value: T): boolean;
	reset();
}

export class State<T> implements IState<T> {
	values: T[] = [];
	fixedValues: T[] = [];
	dirty: boolean = true;

	private _deltaDirty: boolean[] = [];
	private _locked: boolean = false;

	lock(lock: boolean) {
		this._locked = lock;

		if (!lock)
			return;

		const v = this.values;

		for (let i = 0, l = v.length; i < l; i++) {
			this.fixedValues[i] = v[i];
		}

		this.fixedValues.length = v.length;
		this.dirty = false;
	}

	constructor (...args: T[]) {
		// eslint-disable-next-line prefer-rest-params
		this.values = Array.prototype.slice.call(arguments);
	}

	set(...args: T[]): boolean {
		const ref = this._locked ? this.fixedValues : this.values;
		const values = this.values;

		let dirty = false;

		for (let i = 0; i < args.length; i++) {
			dirty = dirty || ref[i] !== args[i];
			values[i] = args[i];
		}

		return this.dirty = dirty;
	}

	setAt(index: number, value: T): boolean {
		const v = this._locked ? this.fixedValues : this.values;
		const dirty = v[index] !== value;

		this.values[index] = value;
		this.dirty = this.dirty || dirty;

		return dirty;
	}

	deltaDirty (): boolean[]  {
		const delta = this._deltaDirty;
		const v = this.values;
		const f = this.fixedValues;

		delta.length = v.length;

		for (let i = 0; i < v.length; i++) {
			delta[i] = v[i] !== f[i];
		}

		return delta;
	}

	reset() {
		this.set();
	}
}
