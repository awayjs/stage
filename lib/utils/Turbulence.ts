/**
 * Implement Turbulence for noise
 * Port from Ruffle/Rust
 * @see https://github.com/ruffle-rs/ruffle/blob/04d80e5e4e5a3023117e0410378fc623a8bfbbf5/core/src/bitmap/turbulence.rs
 */

const RAND_M: i64 = 2147483647; // 2**31 - 1
const RAND_A: i64 = 16807; // 7**5; primitive root of m
const RAND_Q: i64 = 127773; // m / a
const RAND_R: i64 = 2836; // m % a
const B_SIZE: ui16 = 0x100;
const BM: i32 = 0xff;
const PERLIN_N: i32 = 0x1000;

class SeededRandom {
	public seed: number = 0;
	constructor(seed: number) {
		if (seed <= 0) {
			seed = -(seed % (RAND_M - 1)) + 1;
		}

		if (seed > RAND_M - 1) {
			seed = RAND_M - 1;
		}

		this.seed = seed;
	}

	public next (): i16 {
		let result = RAND_A * (this.seed % RAND_Q) - RAND_R * (this.seed / RAND_Q | 0);

		if (result <= 0) {
			result += RAND_M;
		}

		return  result;
	}
}

function curve (t: number): number {
	return t * t * (3. - 2. * t);
}

function lerp (t: number, a: number, b: number): number {
	return a + t * (b - a);
}

export interface StitchInfo {
	width: i32, // How much to subtract to wrap for stitching.
	height: i32,
	wrap_x: i32, // Minimum value to wrap.
	wrap_y: i32,
}

export class Turbulence {
	constructor(
		public gradient: Array<Array<[number, number]>>,
		public lattice_selector: any
	) {}

	public noise2(
		color_channel: ui8,
		vec: [ui16, ui16],
		stitch_info?: StitchInfo
	): number {

		const t = vec[0] + PERLIN_N;
		let bx0 = t | 0;
		let bx1 = bx0 + 1;
		const rx0 = t - (t | 0);
		const rx1 = rx0 - 1.0;

		const t2 = vec[1] + PERLIN_N;
		let by0 = t2 | 0;
		let by1 = by0 + 1;
		const ry0 = t2 - (t2 | 0);
		const ry1 = ry0 - 1.0;

		// If stitching, adjust lattice points accordingly.
		if (stitch_info) {
			if (bx0 >= stitch_info.wrap_x) {
				bx0 -= stitch_info.width;
			}

			if (bx1 >= stitch_info.wrap_x) {
				bx1 -= stitch_info.width;
			}

			if (by0 >= stitch_info.wrap_y) {
				by0 -= stitch_info.height;
			}

			if (by1 >= stitch_info.wrap_y) {
				by1 -= stitch_info.height;
			}
		}

		bx0 &= BM;
		bx1 &= BM;
		by0 &= BM;
		by1 &= BM;

		const i = this.lattice_selector[bx0];
		const j = this.lattice_selector[bx1];
		const b00 = this.lattice_selector[(i + by0)];
		const b10 = this.lattice_selector[(j + by0)];
		const b01 = this.lattice_selector[(i + by1)];
		const b11 = this.lattice_selector[(j + by1)];

		const sx = curve(rx0);
		const sy = curve(ry0);

		const q = this.gradient[color_channel][b00];
		const u = rx0 * q[0] + ry0 * q[1];
		const q2 = this.gradient[color_channel][b10];
		const v = rx1 * q2[0] + ry0 * q2[1];

		const a = lerp(sx, u, v);

		const q3 = this.gradient[color_channel][b01];
		const u2 = rx0 * q3[0] + ry1 * q3[1];
		const q4 = this.gradient[color_channel][b11];
		const v2 = rx1 * q4[0] + ry1 * q4[1];
		const b = lerp(sx, u2, v2);

		return lerp(sy, a, b);
	}

	public turbulence(
		color_channel: ui8,
		point: [number, number],
		base_freq: [number, number],
		num_octaves: ui8,
		fractal_sum: boolean,
		do_stitching: boolean,
		tile_pos: [number, number],
		tile_size: [number, number],
		octave_offsets: Array<[number, number]> = null,
	): number {
		let stitch_info: StitchInfo = null; // Not stitching when None.
		// Adjust the base frequencies if necessary for stitching.
		if (do_stitching) {
			// When stitching tiled turbulence, the frequencies must be adjusted
			// so that the tile borders will be continuous.
			if (base_freq[0] !== 0.0) {
				const lo_freq = Math.floor(tile_size[0] * base_freq[0]) / tile_size[0];
				const hi_freq = Math.ceil(tile_size[0] * base_freq[0]) / tile_size[0];

				if (base_freq[0] / lo_freq < hi_freq / base_freq[0]) {
					base_freq[0] = lo_freq;
				} else {
					base_freq[0] = hi_freq;
				}
			}

			if (base_freq[1] !== 0.0) {
				const lo_freq = Math.floor(tile_size[1] * base_freq[1]) / tile_size[1];
				const hi_freq = Math.ceil(tile_size[1] * base_freq[1]) / tile_size[1];

				if (base_freq[1] / lo_freq < hi_freq / base_freq[1]) {
					base_freq[1] = lo_freq;
				} else {
					base_freq[1] = hi_freq;
				}
			}
			// Set up initial stitch values.
			const w = (tile_size[0] * base_freq[0] + 0.5) | 0;
			const h = (tile_size[1] * base_freq[1] + 0.5) | 0;

			stitch_info = {
				width: w,
				height: h,
				wrap_x: (tile_pos[0] * base_freq[0]) | 0 + PERLIN_N + w,
				wrap_y: (tile_pos[1] * base_freq[1]) | 0 + PERLIN_N + h,
			};
		}

		let sum = 0.0;
		let ratio = 1.0;
		const nullOffset = [0,0];

		for (let octave = 0; octave < num_octaves; octave++) {
			const offset = octave_offsets ?  octave_offsets[octave] : nullOffset;
			const vec: [number, number] = [
				(point[0] + offset[0]) * base_freq[0] * ratio,
				(point[1] + offset[1]) * base_freq[1] * ratio
			];

			const noise = this.noise2(color_channel, vec, stitch_info);
			sum += (fractal_sum ? noise : Math.abs(noise)) / ratio;
			ratio *= 2.0;

			if (stitch_info) {
				stitch_info.width *= 2;
				stitch_info.wrap_x = 2 * stitch_info.wrap_x - PERLIN_N;
				stitch_info.height *= 2;
				stitch_info.wrap_y = 2 * stitch_info.wrap_y - PERLIN_N;
			}
		}

		return  sum;
	}

	public static fromSeed(seed: i64): Turbulence {
		let s: f64;
		const lattice_selector: Array<i32> = Array.from({ length: B_SIZE * 2 + 2 }, () => 0);
		const gradient: Array<Array<[number, number]>> = [];

		const rnd = new SeededRandom(seed);

		for (let k = 0; k < 4; k++) {
			gradient[k] = Array.from({ length: B_SIZE * 2 + 2 }, () => [0,0]);

			for (let i = 0; i < B_SIZE; i++) {
				lattice_selector[i] = i;

				for (let j = 0; j < 2; j++) {
					seed = rnd.next();
					rnd.seed = seed;

					gradient[k][i][j] = (seed % (B_SIZE + B_SIZE) - B_SIZE) / B_SIZE;
				}

				s = Math.sqrt(
					gradient[k][i][0] * gradient[k][i][0] + gradient[k][i][1] * gradient[k][i][1],
				);

				gradient[k][i][0] /= s;
				gradient[k][i][1] /= s;
			}
		}

		for (let i = B_SIZE - 1; i >= 0; i--) {
			const k = lattice_selector[i];
			seed = rnd.next();
			rnd.seed = seed;

			const j = seed % B_SIZE;
			lattice_selector[i] = lattice_selector[j];
			lattice_selector[j] = k;
		}

		for (let i = 0; i < B_SIZE + 2; i++) {
			lattice_selector[B_SIZE + i] = lattice_selector[i];

			for (let k = 0; k < 4; k++) {
				for (let j = 0; j < 2; j++) {
					gradient[k][B_SIZE + i][j] = gradient[k][i][j];
				}
			}
		}

		return new Turbulence(gradient, lattice_selector);
	}
}