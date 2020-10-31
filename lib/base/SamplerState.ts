export interface ISampleState {
	type: number | null;
	wrap: number;
	filter: number;
	mipfilter: number;
}

export class SamplerState implements ISampleState {

	public get valid () {
		return this.type !== null && this.id >= 0;
	}

	public boundedTexture: any = null;

	constructor (
		public id: number = -1,
		public type: number | null = null,
		public wrap: number = 0,
		public filter: number = 0,
		public mipfilter: number = 0,
	) {}

	equals (s: ISampleState): boolean {
		return (
			this.type === s.type &&
			this.wrap === s.wrap &&
			this.filter === s.filter &&
			this.mipfilter === s.mipfilter);
	}

	copyFrom (s: ISampleState): this {
		this.type = s.type;
		this.wrap = s.wrap;
		this.filter = s.filter;
		this.mipfilter = s.mipfilter;

		return this;
	}

	dispose() {
		this.id = -1;
		this.type = null;
		this.wrap = 0;
		this.filter = 0;
		this.mipfilter = 0;
	}
}