import { ProjectionBase } from '@awayjs/core';

import { Stage } from '../../Stage';
import { Image2D } from '../../image/Image2D';
import { TaskBaseWebGL } from './webgl/TaskBaseWebgGL';
import { _Stage_ImageBase } from '../../image';

export class BlurTask extends TaskBaseWebGL /*Filter3DTaskBase*/ {
	private static KERNEL_GAUSIAN: Record<number, number[]> = {
		1: [0.5],
		2: [0.5],
		3: [0.25, 0.5],
		4: [0.25, 0.25],
		5: [0.153388, 0.221461, 0.250301],
		6: [0.071303, 0.131514, 0.189879, 0.214607],
		7: [0.071303, 0.131514, 0.189879, 0.214607],
		8: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
		9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
		10: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
		11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
		12: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
		13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
		14: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
		15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
	};

	private static MAX_AUTO_SAMPLES: number = 15;
	public readonly horizontalPass: boolean = true;

	private _clampedKernel: number = 0;
	private _kernel: number = 0;
	private _data: Float32Array;
	private _realStepSize: number =1;
	private _stepSize: number = -1;

	public get name() {
		return `FilterBlurTask:${(this.horizontalPass ? 'hor' : 'vert')}:${this._kernel}`;
	}

	/**
	 * @param kernel The maximum amount of blur to apply in pixels at the most out-of-focus areas
	 * @param horizonal Pass direction
	 */
	constructor(kernel: number, horizonal = true) {
		super();

		this.kernel = kernel;
		this._data = new Float32Array([0, 0, 0]);
		this.horizontalPass = horizonal;
	}

	public get stepSize(): number {
		return this._stepSize;
	}

	public set stepSize(value: number) {
		if (this._kernel == this._stepSize)
			return;

		this._stepSize = value;
		this.calculateStepSize();
	}

	public get kernel(): number {
		return this._kernel;
	}

	public set kernel(value: number) {
		if (this._kernel == Math.round(value))
			return;

		this._kernel = Math.round(value);
		this._clampedKernel = this._kernel > 2
			? Math.min(BlurTask.MAX_AUTO_SAMPLES, this._kernel)
			: 2;

		this.calculateStepSize();
		this.invalidateProgram();
	}

	public getFragmentCode() {
		const kernel = this._clampedKernel;
		const hor = this.horizontalPass;
		const body = [];
		const gaus = BlurTask.KERNEL_GAUSIAN[kernel];
		const len = gaus.length;

		//let count = 1;

		for (let i = 0; i < kernel; i++) {
			const kernelValueIndex = i >= len ? kernel - i - 1 : i;
			const value = gaus[kernelValueIndex].toFixed(6);
			const offsetValue = ((2 * i + 1 - kernel)).toFixed(6);
			const offset = hor ? `vec2(${offsetValue}, 0.0)` : `vec2(0.0, ${offsetValue})`;

			body.push(`
				color += texture2D(fs0, uv + uBlurData[1] * ${offset}) * ${value};
			`);
		}

		return `
			precision highp float;
			uniform vec3 uBlurData;
			uniform sampler2D fs0;

			varying vec2 vUv;
			
			void main() {
				vec2 uv = vUv.xy;
				vec4 color = vec4(0.0);

				${body.join('\n')}

				gl_FragColor = color;
			}
		`;
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();
		const program = this._program3D;

		this._source.getAbstraction<_Stage_ImageBase>(_stage).activate(0);

		program.uploadUniform('uTexMatrix', this._vertexConstantData);
		program.uploadUniform('uBlurData', this._data);
	}

	public preActivate(_stage: Stage) {
		this.updateBlurData();
	}

	private updateBlurData(): void {
		const size = this.horizontalPass
			? this._source.width
			: this._source.height;

		this._data[0] = this._kernel * .5 / size;
		this._data[1] = this._realStepSize / size;
	}

	private calculateStepSize(): void {
		if (this._stepSize > 0) {
			this._realStepSize = this._stepSize;
			return;
		}

		this._realStepSize = this._kernel > BlurTask.MAX_AUTO_SAMPLES
			? this._kernel / BlurTask.MAX_AUTO_SAMPLES
			: 1;
	}
}