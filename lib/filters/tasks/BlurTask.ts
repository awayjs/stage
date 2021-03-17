import { ProjectionBase } from '@awayjs/core';

import { Stage } from '../../Stage';
import { Image2D } from '../../image/Image2D';
import { TaskBaseWebGL } from './webgl/TaskBaseWebgGL';
import { ProgramWebGL } from '../../webgl/ProgramWebGL';

export class BlurTask extends TaskBaseWebGL /*Filter3DTaskBase*/ {
	private static MAX_AUTO_SAMPLES: number = 15;
	public readonly horizontalPass: boolean = true;

	private _amount: number;
	private _data: Float32Array;
	private _stepSize: number = 1;
	private _realStepSize: number;
	private _blurIndex: number;

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

		for (let x = this._realStepSize; x <= this._amount; x += this._realStepSize) {
			body.push(`
						uv.${hor ? 'x' : 'y'} += uBlurData[1];
						color += texture2D(fs0, uv);
			`);

			++count;
		}

		return `
			precision highp float;
			uniform vec3 uBlurData;
			uniform sampler2D fs0;

			varying vec2 vUv;
			
			void main() {
				vec2 uv = vUv.xy;
				uv.${hor ? 'x' : 'y'} -= uBlurData[0];

				vec4 color = texture2D(fs0, uv);

				${body.join('\n')}

				gl_FragColor = color * 1.0 / ${count.toFixed(1)};
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