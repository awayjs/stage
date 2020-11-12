import { ProjectionBase } from '@awayjs/core';

import { Filter3DTaskBase } from './Filter3DTaskBase';
import { Stage } from '../../Stage';
import { Image2D } from '../../image/Image2D';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';

export class Filter3DFXAATask extends Filter3DTaskBase {
	private _data: Float32Array;
	//TODO - remove blur variables and create setters/getters for FXAA
	private static MAX_AUTO_SAMPLES: number = 15;
	private _amount: number;
	private _stepSize: number = 1;
	private _realStepSize: number;

	/**
	 *
	 * @param amount
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor(amount: number = 1, stepSize: number = -1) {
		super();

		this._data =  new Float32Array(20);
		//luma
		this._data.set([0.299, 0.587, 0.114, 0],0);//0.212, 0.716, 0.072
		//helpers
		this._data.set([0.25, 0.5, 0.75, 1], 4);
		//settings (screen x, screen y, ...)
		this._data.set([1 / 1024, 1 / 1024, -1, 1], 8);
		//deltas
		this._data.set([1 / 128, 1 / 8, 8, 0], 12);
		//deltas
		this._data.set([1.0 / 3.0 - 0.5, 2.0 / 3.0 - 0.5, 0.0 / 3.0 - 0.5, 3.0 / 3.0 - 0.5], 16);

		this.amount = amount;
		this.stepSize = stepSize;
	}

	public get amount(): number {
		return this._amount;
	}

	public set amount(value: number) {
		if (this._amount == value)
			return;

		this._amount = value;

		this.invalidateProgram();
		this.updateBlurData();
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
		this.updateBlurData();
	}

	public getFragmentCode(): string {
		const lum: string = 'fc0';		//	0.299, 0.587, 0.114
		const _0: string = 'fc0.w';

		const _025: string = 'fc1.x';
		const _05: string = 'fc1.y';
		const _075: string = 'fc1.z';
		const _1: string = 'fc1.w';

		const pix: string = 'fc2.xy';
		const dx: string = 'fc2.x'; // 1/1024
		const dy: string = 'fc2.y'; // 1/1024

		const mOne: string = 'fc2.z'; // -1.0
		const mul: string = 'fc2.w'; // 1.0  -- one for now

		const fxaaReduceMin: string = 'fc3.x';	//1/128
		const fxaaReduceMul: string = 'fc3.y';	//1/8
		const fxaaSpanMax: string = 'fc3.z';		//8

		const delta1: string = 'fc4.x';	//1.0/3.0 - 0.5
		const delta2: string = 'fc4.y';	//2.0/3.0 - 0.5
		const delta3: string = 'fc4.z';	//0.0/3.0 - 0.5
		const delta4: string = 'fc4.w';	//3.0/3.0 - 0.5

		const uv_in: string = 'v0';

		const uv: string = 'ft0.xy';
		const uvx: string = 'ft0.x';
		const uvy: string = 'ft0.y';

		const TL: string = 'ft2.x';
		const TR: string = 'ft2.y';
		const BL: string = 'ft2.z';
		const BR: string = 'ft2.w';
		const M: string = 'ft3.x';

		const tempf1: string = 'ft3.y';
		const tempf2: string = 'ft3.z';
		const tempf3: string = 'ft3.w';

		const tex: string = 'ft1';

		const dir: string = 'ft4';
		const dirx: string = 'ft4.x';
		const diry: string = 'ft4.y';
		const dirxy: string = 'ft4.xy';

		const dirReduce: string = 'ft5.x';
		const inverseDirAdjustment: string = 'ft5.y';

		const result1: string = 'ft6';
		const result2: string = 'ft7';

		const lumaMin: string = 'ft5.x';
		const lumaMax: string = 'ft5.y';

		const sample: string = 'fs0';

		const temp: string = tex;
		const tempxy: string = temp + '.xy';

		const code: Array<string> =  new Array<string>();

		//lumas
		code.push('tex', tex, uv_in, sample, '<2d wrap linear>', '\n');
		code.push('dp3', M, tex, lum, '\n');
		code.push('mov', uv, uv_in, '\n');
		code.push('sub', uv, uv, pix, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('dp3', TL, tex, lum, '\n');
		code.push('mov', uv, uv_in, '\n');
		code.push('add', uv, uv, pix, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('dp3',  BR, tex, lum, '\n');
		code.push('mov', uv, uv_in, '\n');
		code.push('sub', uvy, uvy, dy, '\n');
		code.push('add', uvx, uvx, dx, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('dp3', TR, tex, lum, '\n');
		code.push('mov', uv, uv_in, '\n');
		code.push('add', uvy, uvy, dy, '\n');
		code.push('sub', uvx, uvx, dx, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('dp3', BL, tex, lum, '\n');

		//dir
		code.push('add', tempf1, TL, TR, '\n');
		code.push('add', tempf2, BL, BR, '\n');
		code.push('sub', dirx, tempf1, tempf2, '\n');
		code.push('neg', dirx, dirx, '\n');

		code.push('add', tempf1, TL, BL, '\n');
		code.push('add', tempf2, TR, BR, '\n');
		code.push('sub', diry, tempf1, tempf2, '\n');

		code.push('add', tempf1, tempf1, tempf2, '\n');
		code.push('mul', tempf1, tempf1, fxaaReduceMul, '\n');
		code.push('mul', tempf1, tempf1, _025, '\n');
		code.push('max', dirReduce, tempf1, fxaaReduceMin, '\n');

		code.push('abs', tempf1, dirx, '\n');
		code.push('abs', tempf2, diry, '\n');
		code.push('min', tempf1, tempf1, tempf2, '\n');
		code.push('add', tempf1, tempf1, dirReduce, '\n');
		code.push('rcp', inverseDirAdjustment, tempf1, '\n');

		code.push('mul', tempf1, dirx, inverseDirAdjustment, '\n');
		code.push('mov', tempf2, fxaaSpanMax, '\n');
		code.push('neg', tempf2, tempf2, '\n');
		code.push('max', tempf1, tempf1, tempf2, '\n');
		code.push('min', tempf1, fxaaSpanMax, tempf1, '\n');
		code.push('mul', dirx, tempf1, dx, '\n');

		code.push('mul', tempf1, diry, inverseDirAdjustment, '\n');
		code.push('mov', tempf2, fxaaSpanMax, '\n');
		code.push('neg', tempf2, tempf2, '\n');
		code.push('max', tempf1, tempf1, tempf2, '\n');
		code.push('min', tempf1, fxaaSpanMax, tempf1, '\n');
		code.push('mul', diry, tempf1, dy, '\n');

		code.push('mul', tempxy, dirxy, delta1, '\n');
		code.push('add', uv, uv_in, tempxy, '\n');
		code.push('tex', result1, uv, sample, '<2d wrap linear>', '\n');
		code.push('mul', tempxy, dirxy, delta2, '\n');
		code.push('add', uv, uv_in, tempxy, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('add', result1, result1, tex, '\n');
		code.push('mul', result1, result1, _05, '\n');

		code.push('mul', tempxy, dirxy, delta3, '\n');
		code.push('add', uv, uv_in, tempxy, '\n');
		code.push('tex', result2, uv, sample, '<2d wrap linear>', '\n');
		code.push('mul', tempxy, dirxy, delta4, '\n');
		code.push('add', uv, uv_in, tempxy, '\n');
		code.push('tex', tex, uv, sample, '<2d wrap linear>', '\n');
		code.push('add', result2, result2, tex, '\n');
		code.push('mul', result2, result2, _025, '\n');
		code.push('mul', tex, result1, _05, '\n');
		code.push('add', result2, result2, tex, '\n');

		code.push('min', tempf1, BL, BR, '\n');
		code.push('min', tempf2, TL, TR, '\n');
		code.push('min', tempf1, tempf1, tempf2, '\n');
		code.push('min', lumaMin, tempf1, M, '\n');

		code.push('max', tempf1, BL, BR, '\n');
		code.push('max', tempf2, TL, TR, '\n');
		code.push('max', tempf1, tempf1, tempf2, '\n');
		code.push('max', lumaMax, tempf1, M, '\n');

		code.push('dp3', tempf1, lum, result2, '\n');

		code.push('slt', tempf2, tempf1, lumaMin, '\n');
		code.push('sge', tempf3, tempf1, lumaMax, '\n');
		code.push('mul', tempf2, tempf2, tempf3, '\n');

		code.push('mul', result1, result1, tempf2, '\n');
		code.push('sub', tempf2, _1, tempf2, '\n');
		code.push('mul', result2, result2, tempf2, '\n');

		code.push('add', 'oc', result1, result2, '\n');

		//this._data[2] = 1/numSamples;

		return code.join(' ');
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		super.activate(stage, projection, depthTexture);

		stage.context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, this._data);
	}

	public updateTextures(stage: Stage): void {
		super.updateTextures(stage);

		this.updateBlurData();
	}

	private updateBlurData(): void {
		// todo: must be normalized using view size ratio instead of texture
		if (this._rttManager) {
			this._data[8] = 1 / this._textureWidth;
			this._data[9] = 1 / this._textureHeight;
			//this._data[8] = 1/this._rttManager.viewWidth;
			//this._data[9] = 1/this._rttManager.viewHeight;
		}
	}

	private calculateStepSize(): void {
		this._realStepSize = 1;//this._stepSize > 0? this._stepSize : this._amount > Filter3DVBlurTask.MAX_AUTO_SAMPLES? this._amount/Filter3DVBlurTask.MAX_AUTO_SAMPLES : 1;
	}
}