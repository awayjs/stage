import { AbstractMethodError, ByteArray, ProjectionBase } from '@awayjs/core';
import { ShaderRegisterCache } from '../../shaders/ShaderRegisterCache';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { Image2D } from '../../image/Image2D';
import { RTTBufferManager } from '../../managers/RTTBufferManager';
import { IProgram } from '../../base/IProgram';
import { ContextGLProfile } from '../../base/ContextGLProfile';
import { Stage } from '../../Stage';
import { AGALMiniAssembler } from '../../aglsl/assembler/AGALMiniAssembler';
import { IVao } from './../../base/IVao';
import { IIndexBuffer } from '../../base/IIndexBuffer';
import { IVertexBuffer } from '../../base/IVertexBuffer';
import { IContextGL } from '../../base/IContextGL';
import { ContextGLVertexBufferFormat } from '../../base/ContextGLVertexBufferFormat';
import { ContextGLDrawMode } from '../../base/ContextGLDrawMode';
import { ContextWebGL } from '../../webgl/ContextWebGL';
import { ImageSampler } from '../../image/ImageSampler';
import { _Stage_ImageBase } from '../../image/ImageBase';

export class Filter3DTaskBase {
	public _registerCache: ShaderRegisterCache;

	public _positionIndex: number;
	public _uvIndex: number;
	public _inputTextureIndex: number;
	public _uvVarying: ShaderRegisterElement;

	protected readonly _defaultSample: ImageSampler = new ImageSampler();
	protected _mainInputTexture: Image2D;

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

	public context: IContextGL;
	public vao: IVao;
	public supportInstancing = false;

	protected _indexBuffer: IIndexBuffer;
	protected _vertexBuffer: IVertexBuffer;

	protected _instancedFrame: number = -1;
	protected _isInstancedRender: boolean = false;

	constructor(requireDepthRender: boolean = false) {
		this._requireDepthRender = requireDepthRender;

		this._registerCache = new ShaderRegisterCache(ContextGLProfile.BASELINE);
	}

	public invalidateVao() {
		this.vao && this.vao.dispose();
		this.vao = null;
	}

	public attachBuffers(index: IIndexBuffer, vertex: IVertexBuffer) {
		const needUpdate = (
			!this.context.hasVao
			|| !this.vao
			|| this._indexBuffer !== index
			|| this._vertexBuffer !== vertex);

		this.vao = this.vao || this.context.createVao();
		this.vao && this.vao.bind();

		if (needUpdate) {

			this.context.setVertexBufferAt(
				this._positionIndex, vertex, 0, ContextGLVertexBufferFormat.FLOAT_2);

			this.context.setVertexBufferAt(
				this._uvIndex, vertex, 8, ContextGLVertexBufferFormat.FLOAT_2);

			// we should bound index buffer to VAO
			if (this.vao && index) {
				this.vao.attachIndexBuffer(index);
			}
		}

		this._indexBuffer = index;
		this._vertexBuffer = vertex;
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
		this._scaledTextureHeight = this._textureHeight / this._textureScale;
		this._textureDimensionsInvalid = true;
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
		const position: ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._positionIndex = position.index;

		const uv: ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._uvIndex = uv.index;

		this._uvVarying = this._registerCache.getFreeVarying();

		const code = 'mov op, ' + position + '\n' +
			'mov ' + this._uvVarying + ', ' + uv + '\n';

		return code;
	}

	public getFragmentCode(): string {
		throw new AbstractMethodError();
	}

	public updateTextures(stage: Stage): void {
		if (this._mainInputTexture)
			this._mainInputTexture.dispose();

		this._mainInputTexture = new Image2D(this._scaledTextureWidth, this._scaledTextureHeight);

		this._textureDimensionsInvalid = false;
	}

	public getProgram(stage: Stage): IProgram {
		if (this._program3DInvalid) {
			this.updateProgram(stage);
			this.invalidateVao();
		}

		return this._program3D;
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		const imgAbstr = <_Stage_ImageBase>stage.getAbstraction(this.getMainInputTexture(stage));
		imgAbstr.activate(this._inputTextureIndex, this._defaultSample);
	}

	public deactivate(stage: Stage): void {
	}

	public get requireDepthRender(): boolean {
		return this._requireDepthRender;
	}

	public beginInstanceFrame(): number {
		this._isInstancedRender = true;
		return this._instancedFrame++;
	}

	public killInstanced(): void {
		this._instancedFrame = -1;
		this._isInstancedRender = false;
	}

	public flush(count = 1): void {
		if (this._isInstancedRender) {
			(<ContextWebGL> this.context).beginInstancing(count);
		}

		if (this._indexBuffer) {
			this.context.drawIndices(
				ContextGLDrawMode.TRIANGLES, this._indexBuffer, 0, 6);
		} else {
			this.context.drawVertices(
				ContextGLDrawMode.TRIANGLES, 0, 6);
		}
		this.killInstanced();
	}
}