import { Rectangle, Byte32Array, CoordinateSystem, Point } from '@awayjs/core';

import { BitmapImage2D } from '../image/BitmapImage2D';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLClearMask } from '../base/ContextGLClearMask';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLStencilAction } from '../base/ContextGLStencilAction';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLTextureFormat } from '../base/ContextGLTextureFormat';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';
import { IContextGL } from '../base/IContextGL';
import { SamplerState } from '../base/SamplerState';

import { OpCodes } from './OpCodes';
import { CubeTextureGLES } from './CubeTextureGLES';
import { IndexBufferGLES } from './IndexBufferGLES';
import { ProgramGLES } from './ProgramGLES';
import { TextureBaseGLES } from './TextureBaseGLES';
import { TextureGLES } from './TextureGLES';
import { VertexBufferGLES } from './VertexBufferGLES';

import { GLESConnector } from './GLESConnector';

export class ContextGLES implements IContextGL {
	private static _uniformLocationNameDictionary: Array<string> = ['fc', 'fs', 'vc'];
	private _blendFactorDictionary: Object = new Object();
	private _drawModeDictionary: Object = new Object();
	private _compareModeDictionary: Object = new Object();
	private stencilTriangleFace: Object = new Object();
	private _stencilActionDictionary: Object = new Object();
	private _textureIndexDictionary: Array<number> = new Array<number>(8);
	private _textureTypeDictionary: Object = new Object();
	private _wrapDictionary: Object = new Object();
	private _filterDictionary: Object = new Object();
	private _mipmapFilterDictionary: Object = new Object();
	private _vertexBufferPropertiesDictionary: Array<VertexBufferProperties> = [];

	public _cmdBytes: Byte32Array;
	public _createBytes: Byte32Array;
	public static _soundBytes: Byte32Array;

	// soundcommands are excuted on @away/player/AS2SoundAdapter, and stored here as binary data
	// when context is executed, they get send to java along woth the oother data

	public static startSound(name: string, id: number, volume: number, loop: boolean): void {
		ContextGLES._soundBytes.writeInt(OpCodes.startSound | ((loop ? 1 : 0) << 8));
		ContextGLES._soundBytes.writeFloat(volume);
		ContextGLES._soundBytes.writeInt(id);
		ContextGLES._soundBytes.writeUTFBytes(name);
	}

	public static stopSound(id: number): void {
		ContextGLES._soundBytes.writeInt(OpCodes.stopSound);
		ContextGLES._soundBytes.writeInt(id);
	}

	public static updateSound(id: number, volume: number, loop: boolean): void {
		ContextGLES._soundBytes.writeInt(OpCodes.updateSound | ((loop ? 1 : 0) << 8));
		ContextGLES._soundBytes.writeFloat(volume);
		ContextGLES._soundBytes.writeInt(id);
	}

	private _container: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _drawing: boolean;
	private _blendEnabled: boolean;
	private _blendSourceFactor: number;
	private _blendDestinationFactor: number;

	private _standardDerivatives: boolean;

	private _samplerStates: Array<SamplerState> = new Array<SamplerState>(8);

	public static MAX_SAMPLERS: number = 8;

	//@protected
	public _gl: WebGLRenderingContext;

	//@protected
	public _currentProgram: ProgramGLES;
	private _currentArrayBuffer: VertexBufferGLES;
	private _activeTexture: number;

	private _stencilCompareMode: number;
	private _stencilCompareModeBack: number;
	private _stencilCompareModeFront: number;
	private _stencilReferenceValue: number = 0;
	private _stencilReadMask: number = 0xff;
	private _separateStencil: boolean = false;
	private _textureCnt: number=0;
	private _programCnt: number=0;
	private _cubeTextureCnt: number=0;
	private _indexBufferCnt: number=0;
	private _vertexBufferCnt: number=0;

	public static modulo: number = 0;

	public get container(): HTMLCanvasElement {
		return this._container;
	}

	public get standardDerivatives(): boolean {
		return this._standardDerivatives;
	}

	public get glVersion(): number {
		return 1;
	}

	public get pixelRatio(): number {
		return 1;
	}

	constructor(canvas: HTMLCanvasElement) {
		this._container = canvas;
		this._cmdBytes = new Byte32Array();
		this._createBytes = new Byte32Array();

		ContextGLES._soundBytes = new Byte32Array();
		ContextGLES._soundBytes.writeUnsignedInt(100);//id for sending sound data

		this._cmdBytes.writeUnsignedInt(0);//id for sending cmd data
		this._createBytes.writeUnsignedInt(1);//id for sending create data

		this._blendFactorDictionary[ContextGLBlendFactor.ONE] = 0;
		this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_ALPHA] = 1;
		this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_COLOR] = 2;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = 3;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = 4;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = 5;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = 6;
		this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_ALPHA] = 7;
		this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_COLOR] = 8;
		this._blendFactorDictionary[ContextGLBlendFactor.ZERO] = 9;

		this._drawModeDictionary[ContextGLDrawMode.LINES] = 0;
		this._drawModeDictionary[ContextGLDrawMode.TRIANGLES] = 1;

		this._compareModeDictionary[ContextGLCompareMode.ALWAYS] = 0;
		this._compareModeDictionary[ContextGLCompareMode.EQUAL] = 1;
		this._compareModeDictionary[ContextGLCompareMode.GREATER] = 2;
		this._compareModeDictionary[ContextGLCompareMode.GREATER_EQUAL] = 3;
		this._compareModeDictionary[ContextGLCompareMode.LESS] = 4;
		this._compareModeDictionary[ContextGLCompareMode.LESS_EQUAL] = 5;
		this._compareModeDictionary[ContextGLCompareMode.NEVER] = 6;
		this._compareModeDictionary[ContextGLCompareMode.NOT_EQUAL] = 7;

		this.stencilTriangleFace[ContextGLTriangleFace.BACK] = 2;
		this.stencilTriangleFace[ContextGLTriangleFace.FRONT] = 1;
		this.stencilTriangleFace[ContextGLTriangleFace.FRONT_AND_BACK] = 0;

		//
		this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_SATURATE] = 0;
		this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_WRAP] = 1;
		this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_SATURATE] = 2;
		this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_WRAP] = 3;
		this._stencilActionDictionary[ContextGLStencilAction.INVERT] = 4;
		this._stencilActionDictionary[ContextGLStencilAction.KEEP] = 5;
		this._stencilActionDictionary[ContextGLStencilAction.SET] = 6;
		this._stencilActionDictionary[ContextGLStencilAction.ZERO] = 7;

		this._textureTypeDictionary['texture2d'] = 0;
		this._textureTypeDictionary['textureCube'] = 1;

		this._wrapDictionary[ContextGLWrapMode.REPEAT] = 0;
		this._wrapDictionary[ContextGLWrapMode.CLAMP] = 1;

		this._filterDictionary[ContextGLTextureFilter.LINEAR] = 0;
		this._filterDictionary[ContextGLTextureFilter.NEAREST] = 1;

		this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR] = new Object();
		this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNEAREST] = 2;
		this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPLINEAR] = 3;
		this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNONE] = 0;
		this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST] = new Object();
		this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNEAREST] = 4;
		this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPLINEAR] = 5;
		this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNONE] = 1;

	}

	public enableStencil() {
		this._cmdBytes.writeInt(OpCodes.enableStencil);
	}

	public disableStencil() {
		this._cmdBytes.writeInt(OpCodes.disableStencil);
	}

	public gl(): WebGLRenderingContext {
		return this._gl;
	}

	public clear(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1, depth: number = 1, stencil: number = 0, mask: ContextGLClearMask = ContextGLClearMask.ALL): void {
		this._cmdBytes.writeInt(OpCodes.clear);
		this._cmdBytes.writeFloat(red);
		this._cmdBytes.writeFloat(green);
		this._cmdBytes.writeFloat(blue);
		this._cmdBytes.writeFloat(alpha);
		this._cmdBytes.writeInt(depth);
		this._cmdBytes.writeInt(stencil);
		this._cmdBytes.writeInt(mask);
	}

	public configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil: boolean = true): void {
		this._width = width;
		this._height = height;
		this._cmdBytes.writeInt(OpCodes.configureBackBuffer | (enableDepthAndStencil ? 1 : 0) << 8);
		this._cmdBytes.writeFloat(width);
		this._cmdBytes.writeFloat(height);
	}

	public createCubeTexture(size: number, format: ContextGLTextureFormat, optimizeForRenderToTexture: boolean, streamingLevels: number = 0): CubeTextureGLES {
		// todo: cubetextures not finished / tested for opengl yet
		return new CubeTextureGLES(this, this._gl, size, this._cubeTextureCnt++);
	}

	public createIndexBuffer(numIndices: number): IndexBufferGLES {
		// todo: indexBuffer not finished / tested for opengl yet
		return new IndexBufferGLES(this, this._gl, numIndices, this._indexBufferCnt++);
	}

	public createProgram(): ProgramGLES {
		return new ProgramGLES(this, this._gl, this._programCnt++);
	}

	public createTexture(width: number, height: number, format: ContextGLTextureFormat, optimizeForRenderToTexture: boolean, streamingLevels: number = 0): TextureGLES {
		//TODO streaming
		return new TextureGLES(this, this._gl, width, height, this._textureCnt++);
	}

	public createVertexBuffer(numVertices: number, dataPerVertex: number): VertexBufferGLES {
		return new VertexBufferGLES(this, this._gl, numVertices, dataPerVertex, this._vertexBufferCnt++);
	}

	public dispose(): void {
		this._cmdBytes.writeInt(OpCodes.disposeContext);
		this.execute();
	}

	public drawToBitmapImage2D(destination: BitmapImage2D): void {
		//todo (not needed for icycle (?) )
		// var pixels:Uint8ClampedArray = new Uint8ClampedArray(destination.width*destination.height*4);
		//
		// this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
		//
		// destination.setPixels(new Rectangle(0, 0, destination.width, destination.height), pixels);
	}

	public drawIndices(mode: ContextGLDrawMode, indexBuffer: IndexBufferGLES, firstIndex: number = 0, numIndices: number = -1): void {
		//todo (not needed for icycle)
		//GLESConnector.gles.drawIndices(mode, indexBuffer.id, firstIndex, numIndices);
		// if (!this._drawing)
		// 	throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
		//
		//
		// this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
		// this._gl.drawElements(this._drawModeDictionary[mode], (numIndices == -1)? indexBuffer.numIndices : numIndices, this._gl.UNSIGNED_SHORT, firstIndex*2);
	}

	public drawVertices(mode: ContextGLDrawMode, firstVertex: number = 0, numVertices: number = -1): void {
		// if (!this._drawing)
		// 	throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
		this._cmdBytes.writeInt(OpCodes.drawVertices | (this._drawModeDictionary[mode] << 8));
		this._cmdBytes.writeInt(firstVertex);
		this._cmdBytes.writeInt(numVertices);
	}

	public present(): void {
		this.execute();
	}

	public setBlendFactors(sourceFactor: ContextGLBlendFactor, destinationFactor: ContextGLBlendFactor): void {
		this._blendEnabled = true;
		this._blendSourceFactor = this._blendFactorDictionary[sourceFactor];
		this._blendDestinationFactor = this._blendFactorDictionary[destinationFactor];
		this.updateBlendStatus();
	}

	public setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {
		this._cmdBytes.writeInt(OpCodes.setColorMask);
		this._cmdBytes.writeInt((red ? 1 : 0) | (green ? 1 : 0) << 8 | (blue ? 1 : 0) << 16 | (alpha ? 1 : 0) << 24);

	}

	public setCulling(triangleFaceToCull: ContextGLTriangleFace, coordinateSystem: CoordinateSystem = CoordinateSystem.LEFT_HANDED): void {
		if (triangleFaceToCull == ContextGLTriangleFace.NONE) {
			//this.addStream(String.fromCharCode(OpCodes.disableCulling) + "#END");
			this._cmdBytes.writeInt(OpCodes.disableCulling);
			return;
		}
		const faceCulling: number  = this.translateTriangleFace(triangleFaceToCull, coordinateSystem);
		this._cmdBytes.writeInt(OpCodes.setCulling | faceCulling << 8);
	}

	public setDepthTest(depthMask: boolean, passCompareMode: ContextGLCompareMode): void {
		this._cmdBytes.writeInt(OpCodes.setDepthTest | (depthMask ? 1 : 0) << 8 | this._compareModeDictionary[passCompareMode] << 16);

	}

	public setStencilActionsMasks(compareMode: string, referenceValue: number, writeMask: number, actionOnBothPass: string = 'keep', actionOnDepthFail: string = 'keep', actionOnDepthPassStencilFail: string = 'keep', coordinateSystem: string = 'leftHanded') {
		const compareModeGL = this._compareModeDictionary[compareMode];
		const fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
		const zFail = this._stencilActionDictionary[actionOnDepthFail];
		const pass = this._stencilActionDictionary[actionOnBothPass];
		this._cmdBytes.writeInt(OpCodes.setStencilActionsMasks | (compareModeGL << 8));
		this._cmdBytes.writeInt(referenceValue);
		this._cmdBytes.writeInt(writeMask | fail << 8 | zFail << 16 | pass << 24);
	}

	public setStencilActions(triangleFace: ContextGLTriangleFace = ContextGLTriangleFace.FRONT_AND_BACK, compareMode: ContextGLCompareMode = ContextGLCompareMode.ALWAYS, actionOnBothPass: ContextGLStencilAction = ContextGLStencilAction.KEEP, actionOnDepthFail: ContextGLStencilAction = ContextGLStencilAction.KEEP, actionOnDepthPassStencilFail: ContextGLStencilAction = ContextGLStencilAction.KEEP, coordinateSystem: CoordinateSystem = CoordinateSystem.LEFT_HANDED): void {
		const compareModeGL = this._compareModeDictionary[compareMode];
		const triangleFaceGL = this.stencilTriangleFace[triangleFace];
		const fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
		const zFail = this._stencilActionDictionary[actionOnDepthFail];
		const pass = this._stencilActionDictionary[actionOnBothPass];
		this._cmdBytes.writeInt(OpCodes.setStencilActions | triangleFaceGL << 8);
		this._cmdBytes.writeInt(compareModeGL | fail << 8 | zFail << 16 | pass << 24);
	}

	public setStencilReferenceValue(referenceValue: number, readMask: number = 0xFF, writeMask: number = 0xFF) {
		this._cmdBytes.writeInt(OpCodes.setStencilReferenceValue);
		this._cmdBytes.writeInt(referenceValue);
		this._cmdBytes.writeInt(readMask);
		this._cmdBytes.writeInt(writeMask);
	}

	public setProgram(program: ProgramGLES): void {
		this._cmdBytes.writeInt(OpCodes.setProgram);
		this._cmdBytes.writeInt(program.id);
	}

	public setProgramConstantsFromArray(programType: number, data: Float32Array): void {
		this._cmdBytes.writeInt(OpCodes.setProgramConstant | programType << 8);
		this._cmdBytes.writeInt(data.length);
		this._cmdBytes.writeFloat32Array(data);

	}

	public setScissorRectangle(rectangle: Rectangle): void {
		if (rectangle) {
			this._cmdBytes.writeInt(OpCodes.setScissorRect);
			this._cmdBytes.writeFloat(rectangle.x);
			this._cmdBytes.writeFloat(rectangle.y);
			this._cmdBytes.writeFloat(rectangle.width);
			this._cmdBytes.writeFloat(rectangle.height);
		} else {
			this._cmdBytes.writeInt(OpCodes.clearScissorRect);
		}
	}

	public setTextureAt(sampler: number, texture: TextureBaseGLES): void {
		if (texture) {
			this._cmdBytes.writeInt(OpCodes.setTextureAt | sampler << 8);
			this._cmdBytes.writeInt(texture.id);
		} else {
			this._cmdBytes.writeInt(OpCodes.clearTextureAt | sampler << 8);
		}
	}

	public setSamplerStateAt(sampler: number, wrap: ContextGLWrapMode, filter: ContextGLTextureFilter, mipfilter: ContextGLMipFilter): void {
		this._cmdBytes.writeInt(OpCodes.setSamplerStateAt | sampler << 8);
		this._cmdBytes.writeInt(this._wrapDictionary[wrap] | this._filterDictionary[filter] << 8 | this._mipmapFilterDictionary[filter][mipfilter] << 16);

	}

	public setVertexBufferAt(index: number, buffer: VertexBufferGLES, bufferOffset: number = 0, format: number = 4): void {
		if (buffer) {
			this._cmdBytes.writeInt(OpCodes.setVertexBufferAt | index << 8 | format << 16 | buffer.dataPerVertex << 24);
			this._cmdBytes.writeInt(buffer.id);
			this._cmdBytes.writeInt(bufferOffset);
		} else {
			this._cmdBytes.writeInt(OpCodes.clearVertexBufferAt | index << 8);
		}
	}

	public setRenderToTexture(target: TextureBaseGLES, enableDepthAndStencil: boolean = false, antiAlias: number = 0, surfaceSelector: number = 0, mipmapSelector: number = 0): void {
		if (target === null || target === undefined) {
			this._cmdBytes.writeInt(OpCodes.clearRenderToTexture);
		} else {
			this._cmdBytes.writeInt(OpCodes.setRenderToTexture | (enableDepthAndStencil ? 1 : 0) << 8);
			this._cmdBytes.writeInt(target.id);
		}
		// var texture:TextureGLES = <TextureGLES> target;
		// var frameBuffer:WebGLFramebuffer = texture.frameBuffer;
		// this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);
		//
		// if (enableDepthAndStencil) {
		// 	this._gl.enable(this._gl.STENCIL_TEST);
		// 	this._gl.enable(this._gl.DEPTH_TEST);
		// }
		//
		// this._gl.viewport(0, 0, texture.width, texture.height );
	}

	public setRenderToBackBuffer(): void {
		this._cmdBytes.writeInt(OpCodes.clearRenderToTexture);
		//todo
		// this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
	}

	public copyToTexture(target: TextureBaseGLES, rect: Rectangle, destPoint: Point): void {

	}

	private updateBlendStatus(): void {
		if (this._blendEnabled) {
			this._cmdBytes.writeInt(OpCodes.setBlendFactors | this._blendSourceFactor << 8 | this._blendDestinationFactor << 16);
		} else {
			this._cmdBytes.writeUnsignedInt(OpCodes.disableBlending);
		}
	}

	private translateTriangleFace(triangleFace: ContextGLTriangleFace, coordinateSystem: CoordinateSystem) {
		switch (triangleFace) {
			case ContextGLTriangleFace.BACK:
				return (coordinateSystem == CoordinateSystem.LEFT_HANDED) ? 2 : 1;
			case ContextGLTriangleFace.FRONT:
				return (coordinateSystem == CoordinateSystem.LEFT_HANDED) ? 1 : 2;
			case ContextGLTriangleFace.FRONT_AND_BACK:
				return 0;
			default:
				throw 'Unknown ContextGLTriangleFace type.'; // TODO error
		}
	}

	public execute(): void {
		if (this._createBytes.bytePosition > 4) {
			this._createBytes.bytePosition = 0;
			const localInt32View1 = new Int32Array(this._createBytes.byteLength / 4);
			this._createBytes.readInt32Array(localInt32View1);
			GLESConnector.gles.sendGLESCommands(localInt32View1.buffer);
			this._createBytes.byteLength = 0;
			this._createBytes.bytePosition = 0;
			this._createBytes.writeUnsignedInt(1); // make sure first int in bytearray is the id (1 for create bytes)
		}

		if (this._cmdBytes.bytePosition > 4) {
			this._cmdBytes.bytePosition = 0;
			const localInt32View = new Int32Array(this._cmdBytes.byteLength / 4);
			this._cmdBytes.readInt32Array(localInt32View);
			GLESConnector.gles.sendGLESCommands(localInt32View.buffer);
			this._cmdBytes.byteLength = 0;
			this._cmdBytes.bytePosition = 0;
			this._cmdBytes.writeUnsignedInt(0); // make sure first int in bytearray is the id (0 for cmd bytes)
		}
		if (ContextGLES._soundBytes.bytePosition > 4) {
			ContextGLES._soundBytes.bytePosition = 0;
			const localInt32View2 = new Int32Array(ContextGLES._soundBytes.byteLength / 4);
			ContextGLES._soundBytes.readInt32Array(localInt32View2);
			GLESConnector.gles.sendGLESCommands(localInt32View2.buffer);
			ContextGLES._soundBytes.byteLength = 0;
			ContextGLES._soundBytes.bytePosition = 0;
			ContextGLES._soundBytes.writeUnsignedInt(100); // make sure first int in bytearray is the id (100 for cmd soundbytes)

		}
	}
}

export class VertexBufferProperties {
	public size: number;

	public type: number;

	public normalized: boolean;

	constructor(size: number, type: number, normalized: boolean) {
		this.size = size;
		this.type = type;
		this.normalized = normalized;
	}
}