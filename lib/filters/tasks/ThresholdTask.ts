import { ProjectionBase, Vector3D } from '@awayjs/core';

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
	private _thresholdRGBA: Vector3D = new Vector3D(0,0,0,0);

	private _color: number = 0;
	private _colorRGBA: Vector3D = new Vector3D(0,0,0,0);

	private _mask: number = 0;
	private _maskRGBA: Vector3D = new Vector3D(1,1,1,1);

	private _copySource: boolean = false;

	private _decodeVector: Vector3D = new Vector3D(65025.0, 255.0, 1.0, 16581375.0);

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

		this._thresholdRGBA.x = ((value >> 16) & 0xff) / 0xff;
		this._thresholdRGBA.y = ((value >> 8) & 0xff) / 0xff;
		this._thresholdRGBA.z = (value & 0xff) / 0xff;
		this._thresholdRGBA.w = ((value >> 24) & 0xff) / 0xff;
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
		this._colorRGBA.x = alpha * ((value >> 16) & 0xff) / 0xff;
		this._colorRGBA.y = alpha * ((value >> 8) & 0xff) / 0xff;
		this._colorRGBA.z = alpha * (value & 0xff) / 0xff;
		this._colorRGBA.w = alpha;
	}

	public get mask(): number {
		return this._mask;
	}

	public set mask(value: number) {
		if (this._mask == value)
			return;

		this._mask = value;

		this._maskRGBA.x = ((value >> 16) & 0xff) / 0xff;
		this._maskRGBA.y = ((value >> 8) & 0xff) / 0xff;
		this._maskRGBA.z = (value & 0xff) / 0xff;
		this._maskRGBA.w = ((value >> 24) & 0xff) / 0xff;
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

		const tVector: Vector3D = new Vector3D(
			this._thresholdRGBA.x * this._maskRGBA.x,
			this._thresholdRGBA.y * this._maskRGBA.y,
			this._thresholdRGBA.z * this._maskRGBA.z,
			this._thresholdRGBA.w * this._maskRGBA.w);
		const tValue: number = tVector.dotProduct(this._decodeVector);

		const index = this._fragmentConstantsIndex;
		const data = this._fragmentConstantData;

		data[index] = tValue;
		data[index + 1] = tValue;
		data[index + 2] = tValue;
		data[index + 3] = tValue;

		data[index + 4] = this._colorRGBA.x;
		data[index + 5] = this._colorRGBA.y;
		data[index + 6] = this._colorRGBA.z;
		data[index + 7] = this._colorRGBA.w;

		data[index + 8] = this._maskRGBA.x;
		data[index + 9] = this._maskRGBA.y;
		data[index + 10] = this._maskRGBA.z;
		data[index + 11] = this._maskRGBA.w;

		const context: IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, this._vertexConstantData);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, this._fragmentConstantData);

		this._source.getAbstraction<_Stage_Image2D>(stage).activate(this.sourceSamplerIndex);
	}
}