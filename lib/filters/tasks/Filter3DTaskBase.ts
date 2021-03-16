import { AbstractMethodError, ByteArray, ProjectionBase, Rectangle } from '@awayjs/core';
import { ShaderRegisterCache } from '../../shaders/ShaderRegisterCache';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { Image2D } from '../../image/Image2D';
import { IProgram } from '../../base/IProgram';
import { ContextGLProfile } from '../../base/ContextGLProfile';
import { Stage } from '../../Stage';
import { AGALMiniAssembler } from '../../aglsl/assembler/AGALMiniAssembler';
import { IContextGL } from '../../base/IContextGL';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';

export class Filter3DTaskBase {
	protected _vertexConstantData = new Float32Array([
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0
	]);

	public activateInternaly = false;
	public _registerCache: ShaderRegisterCache;

	public _positionIndex: number;
	public _inputTextureIndex: number;
	public _uvVarying: ShaderRegisterElement;

	protected _program3DInvalid: boolean = true;
	protected _program3D: IProgram;
	protected _target: Image2D;
	protected _source: Image2D;

	private _requireDepthRender: boolean;

	public inputRect: Rectangle = new Rectangle();
	public destRect: Rectangle = new Rectangle();

	constructor(requireDepthRender: boolean = false) {
		this._requireDepthRender = requireDepthRender;

		this._registerCache = new ShaderRegisterCache(ContextGLProfile.BASELINE);
	}

	/**
	 * Used for determine that this pass requrie clear target before render to it
	 */
	public needClear: boolean = false;
	/**
	 * Used for determine that this pass require scissor clip
	 */
	public clipRect: Rectangle;

	public get source(): Image2D {
		return this._source;
	}

	public set source(v: Image2D) {
		this._source = v;
	}

	public get target(): Image2D {
		return this._target;
	}

	public set target(value: Image2D) {
		this._target = value;
	}

	public dispose(): void {
		if (this._program3D)
			this._program3D.dispose();
	}

	public invalidateProgram(): void {
		this._program3DInvalid = true;
	}

	public updateProgram(stage: Stage): void {
		if (this._program3D)
			this._program3D.dispose();

		this._program3D = stage.context.createProgram();

		this._registerCache.reset();

		const vertexByteCode: ByteArray = (new AGALMiniAssembler()
			.assemble('part vertex 1\n' + this.getVertexCode() + 'endpart'))['vertex'].data;
		const fragmentByteCode: ByteArray = (new AGALMiniAssembler()
			.assemble('part fragment 1\n' + this.getFragmentCode() + 'endpart'))['fragment'].data;

		this._program3D.name = (<any> this.constructor).name;
		this._program3D.upload(vertexByteCode, fragmentByteCode);
		this._program3DInvalid = false;
	}

	public getVertexCode(): string {
		const temp1 = this._registerCache.getFreeVertexVectorTemp();
		const posRect = this._registerCache.getFreeVertexConstant();

		const position = this._registerCache.getFreeVertexAttribute();
		this._positionIndex = position.index;

		const uvRect = this._registerCache.getFreeVertexConstant();

		this._uvVarying = this._registerCache.getFreeVarying();

		const code = 'mul ' + temp1 + '.xy, ' + position + ', ' + posRect + '.zw\n' +
			'add ' + temp1 + '.xy, ' + temp1 + ', ' + posRect + '.xy\n' +
			'mov ' + temp1 + '.w, ' + position + '.w\n' +
			'mov op, ' + temp1 + '\n' +
			'mul ' + temp1 + '.xy, ' + position + ', ' + uvRect + '.zw\n' +
			'add ' + this._uvVarying + ', ' + temp1 + ', ' + uvRect + '.xy\n';

		return code;
	}

	public getFragmentCode(): string {
		throw new AbstractMethodError();
	}

	public getProgram<T extends IProgram = IProgram>(stage: Stage): T {
		if (this._program3DInvalid)
			this.updateProgram(stage);

		return <T> this._program3D;
	}

	protected computeVertexData() {
		const data = this._vertexConstantData;
		const dest = this.destRect;
		const input = this.inputRect;
		const target = this._target;
		const source = this._source;

		if (input.width * input.height === 0) {
			input.width = this._source.width;
			input.height = this._source.height;
		}

		if (dest.width * dest.height === 0) {
			dest.width = input.width;
			dest.height = input.height;
		}

		// pos = scale * pos + offset
		// pos in viewport MUST be -1 - 0, for this we multiple at 2 and decrease 1

		// pos offset (-1, 1)
		data[0] = 2. * dest.x / target.width - 1;
		data[1] = 2. * dest.y / target.height - 1;

		// pos scale
		data[2] = 2. * dest.width / target.width;
		data[3] = 2. * dest.height / target.height;

		// uv already from 0,1, not require remap it
		// uv offset
		data[4] = input.x / source.width;
		data[5] = input.y / source.height;

		// uv scale
		data[6] = input.width / source.width;
		data[7] = input.height / source.height;
	}

	public preActivate(_stage: Stage) {}

	public activate(stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		this.computeVertexData();

		const context: IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, this._vertexConstantData);
	}

	public deactivate(stage: Stage): void {
	}

	public get requireDepthRender(): boolean {
		return this._requireDepthRender;
	}

}