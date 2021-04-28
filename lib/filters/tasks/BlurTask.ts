import { ProjectionBase } from '@awayjs/core';

import { Stage } from '../../Stage';
import { Image2D } from '../../image/Image2D';
import { TaskBaseWebGL } from './webgl/TaskBaseWebgGL';
import { ProgramWebGL } from '../../webgl/ProgramWebGL';

const GAUSSIAN_VALUES = {
	1: [1],
	2: [0.5, 0.5],
	3: [0.5, 0.5],
	5: [0.153388, 0.221461, 0.250301],
	7: [0.071303, 0.131514, 0.189879, 0.214607],
	9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
	11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
	13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
	15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
};
export class BlurTask extends TaskBaseWebGL /*Filter3DTaskBase*/ {
	private static MAX_AUTO_SAMPLES: number = 15;
	public readonly horizontalPass: boolean = true;

	private _amount: number;
	private _data: Float32Array;
	private _stepSize: number = 1;
	private _realStepSize: number;
	private _blurIndex: number;
	private _kernel: number = 5;

	public get name() {
		return `FilterBlurTask:${(this.horizontalPass ? 'hor' : 'vert')}:${this._amount}`;
	}

	/**
	 * @param amount The maximum amount of blur to apply in pixels at the most out-of-focus areas
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 * @param horizonal Pass direction
	 */
	constructor(amount: number, stepSize: number = -1, horizonal = true) {
		super();

		this._amount = amount;
		this._kernel = Math.min(15, amount / 2 | 0 + 1);
		this._data = new Float32Array([0, 0, 0]);
		this.stepSize = stepSize;
		this.horizontalPass = horizonal;
	}

	public get amount(): number {
		return this._amount;
	}

	public set amount(value: number) {
		if (this._amount == value)
			return;

		this._amount = value;
		this._kernel = Math.min(15, value / 2 | 0 + 1);

		this.invalidateProgram();
		this.calculateStepSize();
	}

	public get stepSize(): number {
		return this._stepSize;
	}

	public set stepSize(value: number) {
		if (this._stepSize == value)
			return;

		this._stepSize = value;
		this.calculateStepSize();
		this.invalidateProgram();
	}

	public getFragmentCode() {
		const hor = this.horizontalPass;
		const body = [];

		let count = 1;

		/*
		for (let x = this._realStepSize; x <= this._amount; x += this._realStepSize) {
			body.push(`
						uv.${hor ? 'x' : 'y'} += uBlurData[1];
						color += texture2D(fs0, uv);
			`);

			++count;
		}*/

		const values: number[] = GAUSSIAN_VALUES[this._kernel];
		const dim = values.length;

		let index = 0;
		for (let i = 0; i < this._kernel; i++) {

			index = i >= dim ? this._kernel - i - 1 : i;

			let prep = '';

			if (this.horizontalPass) {
				prep = `${(i - dim + 1).toFixed(1)} * vec2(step, 0.0)`;
			} else {
				prep = `${(i - dim + 1).toFixed(1)} * vec2(0.0, step)`;
			}

			body.push(`
						color += texture2D(fs0, uv + ${prep}) * ${values[index].toFixed(6)};
				`);
		}

		return `
			precision highp float;
			uniform vec3 uBlurData;
			uniform sampler2D fs0;

			varying vec2 vUv;
			
			void main() {
				vec2 uv = vUv.xy;
				vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
				float step =  uBlurData[1];

				${body.join('\n')}

				gl_FragColor = color;
			}
		`;
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();

		(<ProgramWebGL> this._program3D).uploadUniform('uTexMatrix', this._vertexConstantData);
		(<ProgramWebGL> this._program3D).uploadUniform('uBlurData', this._data);
	}

	public preActivate(_stage: Stage) {
		this.updateBlurData();
	}

	private updateBlurData(): void {
		// todo: must be normalized using view size ratio instead of texture
		const size = this.horizontalPass
			? this._source.width
			: this._source.height;

		this._data[0] = this._amount * .5 / size;
		this._data[1] = this._realStepSize / size;
	}

	private calculateStepSize(): void {
		this._realStepSize = this._stepSize > 0
			? this._stepSize
			: this._amount > BlurTask.MAX_AUTO_SAMPLES
				? this._amount / BlurTask.MAX_AUTO_SAMPLES
				: 1;
	}
}