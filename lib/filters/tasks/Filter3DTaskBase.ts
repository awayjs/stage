import { AbstractMethodError, ByteArray, ProjectionBase, Rectangle } from '@awayjs/core';
import { ShaderRegisterCache } from '../../shaders/ShaderRegisterCache';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { Image2D } from '../../image/Image2D';
import { RTTBufferManager } from '../../managers/RTTBufferManager';
import { IProgram } from '../../base/IProgram';
import { ContextGLProfile } from '../../base/ContextGLProfile';
import { Stage } from '../../Stage';
import { AGALMiniAssembler } from '../../aglsl/assembler/AGALMiniAssembler';
import { IVao } from './../../base/IVao';
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
	public _uvIndex: number;
	public _inputTextureIndex: number;
	public _uvVarying: ShaderRegisterElement;

	protected _mainInputTexture: Image2D;
	protected _externalInput: boolean = false;

	public _scaledTextureWidth: number = -1;
	public _scaledTextureHeight: number = -1;
	public _rttManager: RTTBufferManager;
	public _textureWidth: number = -1;
	public _textureHeight: number = -1;
	private _textureDimensionsInvalid: boolean = true;
	protected _program3DInvalid: boolean = true;
	protected _program3D: IProgram;
	protected _target: Image2D;
	private _requireDepthRender: boolean;
	private _textureScale: number = 1;

	public inputRect: Rectangle = new Rectangle();
	public destRect: Rectangle = new Rectangle();

	public vao: IVao;

	constructor(requireDepthRender: boolean = false) {
		this._requireDepthRender = requireDepthRender;

		this._registerCache = new ShaderRegisterCache(ContextGLProfile.BASELINE);
	}

	/**
	 * The texture scale for the input of this texture. This will define the output of the previous entry in the chain
	 */
	public get textureScale(): number {
		return this._textureScale;
	}

	public set textureScale(value: number) {
		if (this._textureScale == value)
			return;

		this._textureScale = value;
		this._scaledTextureWidth = this._textureWidth / this._textureScale;
		this._scaledTextureHeight = this._textureHeight / this._textureScale;
		this._textureDimensionsInvalid = true;
	}

	public get target(): Image2D {
		return this._target;
	}

	public set target(value: Image2D) {
		this._target = value;
	}

	public get rttManager(): RTTBufferManager {
		return this._rttManager;
	}

	public set rttManager(value: RTTBufferManager) {
		if (this._rttManager == value)
			return;

		this._rttManager = value;
		this._textureDimensionsInvalid = true;
	}

	public get textureWidth(): number {
		return this._textureWidth;
	}

	public set textureWidth(value: number) {
		if (this._textureWidth == value)
			return;

		this._textureWidth = value;
		this._scaledTextureWidth = this._textureWidth / this._textureScale;
		this._textureDimensionsInvalid = true;
	}

	public get textureHeight(): number {
		return this._textureHeight;
	}

	public set textureHeight(value: number) {
		if (this._textureHeight == value)
			return;

		this._textureHeight = value;
		this._scaledTextureHeight = (this._textureHeight) / this._textureScale;
		this._textureDimensionsInvalid = true;
	}

	public setMainInputTexture (image: Image2D, stage: Stage) {
		this._mainInputTexture = image;
		this._externalInput = !!image;

		if (this._externalInput) {
			this.textureWidth = image.width;
			this.textureHeight = image.height;
		}

		this.updateTextures(stage);
	}

	public getMainInputTexture(stage: Stage): Image2D {
		if (this._textureDimensionsInvalid)
			this.updateTextures(stage);

		return this._mainInputTexture;
	}

	public dispose(): void {
		if (this._mainInputTexture)
			this._mainInputTexture.dispose();

		if (this._program3D)
			this._program3D.dispose();

		if (this.vao) {
			this.vao.dispose();
			this.vao = null;
		}
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

	public updateTextures(stage: Stage): void {

		if (!this._externalInput) {
			if (this._mainInputTexture)
				this._mainInputTexture.dispose();

			this._mainInputTexture = new Image2D(this._scaledTextureWidth, this._scaledTextureHeight, false);
		}

		this._textureDimensionsInvalid = false;
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
		const source = this._mainInputTexture;

		if (input.width * input.height === 0) {
			input.width = this._scaledTextureWidth;
			input.height = this._scaledTextureHeight;
		}

		if (dest.width * dest.height === 0) {
			dest.width = input.width;
			dest.height = input.height;
		}

		// pos = scale * pos + offset
		// pos in viewport MUST be -1 - 0, for this we multiple at 2 and decrease 1

		// pos offset (-1, 1)
		data[0] = dest.x / this._target.width - 1;
		data[1] = dest.y / this._target.height - 1;

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