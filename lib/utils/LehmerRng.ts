/**
 * Implement LehmerRng for noise
 * Port from Ruffle/Rust
 * @see https://github.com/ruffle-rs/ruffle/blob/bb71b61c9ade6c3f185d7f0cc878423402dc4a7f/core/src/bitmap/bitmap_data.rs#L19
 */
export class LehmerRng {

	private _x: ui32;

	constructor(seed: ui32) {
		this._x = seed;
	}

	/// Generate the next value in the sequence via the following formula
	/// X_(k+1) = a * X_k mod m
	public gen(): ui32 {
		return (this._x = (this._x * 16807) % 2147483647);
	}

	public genRange(start: ui32, end: ui32): ui8 {
		return (start + (this.gen() % (end - start + 1)));
	}
}