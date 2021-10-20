import { ITexture } from '../base/ITexture';
import { Image2D, _Stage_Image2D } from '../image/Image2D';
import { FilterUtils } from './FilterUtils';

interface IAtlasEntry {
	hash: string;
	index: number;
}

export class GradientAtlas extends Image2D {
	public static assetType = '[image GradientAtlas]';

	/* internal*/ _data: Uint8Array = new Uint8Array(4 * 256 * 256);
	private _gradMap: Record<string, IAtlasEntry> = {};
	private _count: number = 0;

	public static gradientAtlases: GradientAtlas[] = [];

	public get assetType(): string {
		return GradientAtlas.assetType;
	}

	public static getAtlassForHash(hash: string, findEmpty = true): GradientAtlas {
		let atlass: GradientAtlas;

		for (const at of this.gradientAtlases) {
			if (at.hasGradient(hash)) {
				atlass = at;
				break;
			}
		}

		if (atlass) {
			return atlass;
		}

		if (!findEmpty) {
			return null;
		}

		for (const at of this.gradientAtlases) {
			if (!at.full) {
				return at;
			}
		}

		atlass = new GradientAtlas();
		this.gradientAtlases.push(atlass);

		return atlass;
	}

	public static computeHash(colors: number[], alphas: number[], ratios: number[]) {
		return colors.join('') + alphas.map(e => e * 0xff | 0) + ratios.join('');
	}

	constructor () {
		super(256, 256, true);
	}

	public get full() {
		return this._count === 256;
	}

	public get length() {
		return this._count;
	}

	public hasGradient(hash: string) {
		return (hash in this._gradMap);
	}

	public getGradient(hash: string) {
		return this._gradMap[hash];
	}

	public setGradient (colors: number[], alphas: number[], ratios: number[]): IAtlasEntry | null {
		if (!colors || !alphas || !ratios) {
			return null;
		}

		// simple validation for invalid ratios
		if (ratios.length === 0) {
			return;
		}

		const hash = GradientAtlas.computeHash(colors, alphas, ratios);

		if (hash in this._gradMap) {
			return this._gradMap[hash];
		}

		if (this._count === 256) {
			// overflow
			return null;
		}

		const index = this._count;

		this._count++;

		this.fillRow(colors, alphas, ratios, index);

		return this._gradMap[hash] = {
			index,
			hash
		};
	}

	private fillRow(colors: number[], alphas: number[], ratios: number[], index: number) {
		if (ratios[0] !== 0 || ratios[ratios.length] !== 255) {
			colors = colors.slice();
			ratios = ratios.slice();
			alphas = alphas.slice();

			if (ratios[0] !== 0) {
				ratios.unshift(0);
				colors.unshift(colors[0]);
				alphas.unshift(alphas[0]);
			}

			if (ratios[ratios.length - 1] !== 255) {
				ratios.push(255);
				colors.push(colors[colors.length - 1]);
				alphas.push(alphas[alphas.length - 1]);
			}
		}

		const len = ratios.length;
		const colorA = [0,0,0,0];
		const colorB = [0,0,0,0];
		const buff = new Uint8Array(this._data.buffer, 256 * 4 * index, 256 * 4);

		buff.fill(0);

		for (let i = 0; i < len; i++) {
			// we should end pallete, because ratios can not end with 255
			FilterUtils.colorToU8(colors[i + 0], alphas[i + 0], colorA);
			FilterUtils.colorToU8(colors[i + 1], alphas[i + 1], colorB);

			const from = ratios[i + 0];
			const to   = ratios[i + 1];

			for (let j = from; j <= to; j++) {
				const factor = (j - from) / (to - from);
				const k = j * 4;
				// interpolate each color

				buff[k + 0] = colorA[0] + (colorB[0] - colorA[0]) * factor | 0;
				buff[k + 1] = colorA[1] + (colorB[1] - colorA[1]) * factor | 0;
				buff[k + 2] = colorA[2] + (colorB[2] - colorA[2]) * factor | 0;
				buff[k + 3] = colorA[3] + (colorB[3] - colorA[3]) * factor | 0;

				const a = buff[k + 3] / 0xff;

				// PMA
				buff[k + 0] = buff[k + 0] * a | 0;
				buff[k + 1] = buff[k + 1] * a | 0;
				buff[k + 2] = buff[k + 2] * a | 0;
			}
		}

		this.invalidate();
	}
}

export class _Stage_GradientAtlass extends _Stage_Image2D {
	public getTexture() {
		super.getTexture();

		if (this._invalid) {
			(<ITexture> this._texture).uploadFromArray((<GradientAtlas> this._asset)._data, 0, false);
		}

		this._invalid = false;
		return this._texture;
	}
}
// MOVED TO LIB INDEX
// Stage.registerAbstraction(_Stage_GradientAtlass, GradientAtlass);