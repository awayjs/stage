import { ProjectionBase } from '@awayjs/core';

import { TaskBase } from './TaskBase';
import { _Stage_Image2D, Image2D } from '../../image';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { IContextGL } from '../../base/IContextGL';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';
import { Stage } from '../../Stage';

export type TThresholdOperator = '<' | '<=' | '>' | '>=' | '==' | '!=';
export class ThresholdTask extends TaskBase {
	private readonly _fragmentConstantData: Float32Array;

	private _fragmentConstantsIndex: number;

	private _opDecode: Object = {
		'<' : 'slt ',
		'<=' : 'sge ',
		'>' : 'slt ',
		'>=' : 'sge ',
		'==' : 'seq ',
		'!=' : 'sne '
	}

	private _thDecode: Object = {
		'<' : false,
		'<=' : true,
		'>' : true,
		'>=' : false,
		'==' : false,
		'!=' : false
	}

	private _operation: TThresholdOperator = '<';
	private _op: string = 'slt ';
	private _th: boolean = false;

	private _threshold: number = 0;
	private _thresholdRGBA: Float32Array = new Float32Array([0,0,0,0]);

	private _color: number = 0;
	private _colorRGBA: Float32Array;

	private _mask: number = 0;
	private _maskRGBA: Float32Array;

	private _copySource: boolean = false;

	private _decodeVector: Float32Array ;

	public get operation(): TThresholdOperator {
		return this._operation;
	}

	public set operation(value: TThresholdOperator) {
		if (this._operation == value)
			return;

		this._operation = value;
		this._op = this._opDecode[value];
		this._th = this._thDecode[value];

		this.invalidateProgram();
	}

	public get threshold(): number {
		return this._threshold;
	}

	public set threshold(value: number) {
		if (this._threshold == value)
			return;

		this._threshold = value;

		this._thresholdRGBA.set([
			((value >> 16) & 0xff) / 0xff,
			((value >> 8) & 0xff) / 0xff,
			(value & 0xff) / 0xff,
			((value >> 24) & 0xff) / 0xff]
		);
	}

	public get color(): number {
		return this._color;
	}

	public set color(value: number) {
		if (this._color == value)
			return;

		this._color = value;

		//pre-multiply alpha
		const alpha: number = ((value >> 24) & 0xff) / 0xff;
		this._colorRGBA.set([
			alpha * ((value >> 16) & 0xff) / 0xff,
			alpha * ((value >> 8) & 0xff) / 0xff,
			alpha * (value & 0xff) / 0xff,
			alpha
		]);
	}

	public get mask(): number {
		return this._mask;
	}

	public set mask(value: number) {
		if (this._mask == value)
			return;

		this._mask = value;

		this._maskRGBA.set([
			((value >> 16) & 0xff) / 0xff,
			((value >> 8) & 0xff) / 0xff,
			(value & 0xff) / 0xff,
			((value >> 24) & 0xff) / 0xff
		]);
	}

	public get copySource(): boolean {
		return this._copySource;
	}

	public set copySource(value: boolean) {
		if (this._copySource == value)
			return;
		this._copySource = value;

		this.invalidateProgram();
	}

	constructor() {
		super();

		this._fragmentConstantData = new Float32Array([
			0.0, 0.0, 0.0, 0.0, // comparable
			0.0, 0.0, 0.0, 0.0, // color
			0.0, 0.0, 0.0, 0.0, // mask
			65025.0, 255.0, 1.0, 16581375.0 //decode
		]);

		this._colorRGBA = this._fragmentConstantData.subarray(4, 4 * 2);
		this._maskRGBA = this._fragmentConstantData.subarray(4 * 2, 4 * 3);
		this._decodeVector = this._fragmentConstantData.subarray(4 * 3, 4 * 4);
	}

	public getFragmentCode(): string {
		const temp1: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(temp1, 1);

		const inputTexture: ShaderRegisterElement = this._registerCache.getFreeTextureReg();
		this.sourceSamplerIndex = inputTexture.index;

		const threshold: ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();
		this._fragmentConstantsIndex = threshold.index;

		const color: ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();

		const mask: ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();

		const decode: ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();

		let code: string;

		if (this._copySource) {
			const temp2: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
			this._registerCache.addFragmentTempUsages(temp2, 1);
			const temp3: ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
			this._registerCache.addFragmentTempUsages(temp3, 1);

			code = 'tex ' + temp1 + ', ' + this._uvVarying + ', ' + inputTexture + ' <2d,linear,clamp>\n' +
				'mul ' + temp2 + ', ' + temp1 + ', ' + mask + '\n' +
				'dp4 ' + temp2 + ', ' + temp2 + ', ' + decode + '\n' +
				// eslint-disable-next-line max-len
				this._op + temp2 + ', ' + (this._th ? threshold : temp2) + ', ' + (this._th ? temp2 : threshold) + '\n' +
				'sub ' + temp3 + ', ' + decode + '.zzzz, ' + temp2 + '\n' +
				'mul ' + temp2 + ', ' + temp2 + ', ' + color + '\n' +
				'mul ' + temp3 + ', ' + temp3 + ', ' + temp1 + '\n' +
				'add ' + temp1 + ', ' + temp2 + ', ' + temp3 + '\n' +
				'mov oc, ' + temp1 + '\n';

			this._registerCache.removeFragmentTempUsage(temp3);
			this._registerCache.removeFragmentTempUsage(temp2);
		} else {
			code = 'tex ' + temp1 + ', ' + this._uvVarying + ', ' + inputTexture + ' <2d,linear,clamp>\n' +
				'mul ' + temp1 + ', ' + temp1 + ', ' + mask + '\n' +
				'dp4 ' + temp1 + ', ' + temp1 + ', ' + decode + '\n' +
				// eslint-disable-next-line max-len
				this._op + temp1 + ', ' + (this._th ? threshold : temp1) + ', ' + (this._th ? temp1 : threshold) + '\n' +
				'mul ' + temp1 + ', ' + temp1 + ', ' + color + '\n' +
				'mov oc, ' + temp1 + '\n';
		}

		this._registerCache.removeFragmentTempUsage(temp1);

		return code;
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		super.computeVertexData();

		const thRGBA = this._thresholdRGBA;
		const maskRGBA = this._maskRGBA;
		const decRGBA = this._decodeVector;

		// this is equal dot(threshold * mask, decode)
		const tValue = (
			thRGBA[0] * maskRGBA[0] * decRGBA[0] +
			thRGBA[1] * maskRGBA[1] * decRGBA[1] +
			thRGBA[2] * maskRGBA[2] * decRGBA[2] +
			thRGBA[3] * maskRGBA[3] * decRGBA[3]
		);

		const index = this._fragmentConstantsIndex;
		const data = this._fragmentConstantData;

		data[index] = tValue;
		data[index + 1] = tValue;
		data[index + 2] = tValue;
		data[index + 3] = tValue;

		const context: IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, this._vertexConstantData);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, this._fragmentConstantData);

		this._source.getAbstraction<_Stage_Image2D>(stage).activate(this.sourceSamplerIndex);
	}
}