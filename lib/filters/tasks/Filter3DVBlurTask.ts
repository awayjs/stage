import { ProjectionBase } from '@awayjs/core';

import { Filter3DTaskBase } from './Filter3DTaskBase';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { Stage } from '../../Stage';
import { Image2D } from '../../image/Image2D';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';

export class Filter3DVBlurTask extends Filter3DTaskBase {
	private static MAX_AUTO_SAMPLES: number = 15;
	private _amount: number;
	private _data: Float32Array;
	private _stepSize: number = 1;
	private _realStepSize: number;
	private _blurIndex: number;

	/**
	 *
	 * @param amount
	 * @param stepSize The distance between samples. Set to -1 to autodetect with acceptable quality.
	 */
	constructor(amount: number, stepSize: number = -1) {
		super();
		this._amount = amount;
		this._data =  new Float32Array([0, 0, 0, 1]);
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
		const temp1: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(temp1, 1);
		const temp2: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(temp2, 1);
		const temp3: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(temp3, 1);

		const inputTexture: ShaderRegisterElement = this._registerCache.getFreeTextureReg();
		this._inputTextureIndex = inputTexture.index;

		const blur: ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();
		this._blurIndex = blur.index * 4;

		let code: string;
		let numSamples: number = 1;

		code = 'mov ' + temp1 + ', ' + this._uvVarying + '\n' +
			'sub ' + temp1 + '.y, ' + this._uvVarying + '.y, ' + blur + '.x\n';

		code += 'tex ' + temp2 + ', ' + temp1 + ', ' + inputTexture + ' <2d,linear,clamp>\n';

		for (let x: number = this._realStepSize; x <= this._amount; x += this._realStepSize) {
			code += 'add ' + temp1 + '.y, ' + temp1 + '.y, ' + blur + '.y\n';
			code += 'tex ' + temp3 + ', ' + temp1 + ', ' + inputTexture + ' <2d,linear,clamp>\n' +
				'add ' + temp2 + ', ' + temp2 + ', ' + temp3 + '\n';
			++numSamples;
		}

		code += 'mul oc, ' + temp2 + ', ' + blur + '.z\n';

		this._data[2] = 1 / numSamples;

		return code;
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
		const invH: number = 1 / this._textureHeight;

		this._data[0] = this._amount * .5 * invH;
		this._data[1] = this._realStepSize * invH;
	}

	private calculateStepSize(): void {
		this._realStepSize = this._stepSize > 0 ? this._stepSize : this._amount > Filter3DVBlurTask.MAX_AUTO_SAMPLES ? this._amount / Filter3DVBlurTask.MAX_AUTO_SAMPLES : 1;
	}
}