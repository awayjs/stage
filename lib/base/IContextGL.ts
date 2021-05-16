import { Rectangle, CoordinateSystem, Point } from '@awayjs/core';

import { BitmapImage2D } from '../image/BitmapImage2D';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { ContextGLClearMask } from '../base/ContextGLClearMask';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';
import { ContextGLStencilAction } from '../base/ContextGLStencilAction';
import { ContextGLTextureFormat } from '../base/ContextGLTextureFormat';
import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';

import { ICubeTexture } from './ICubeTexture';
import { IIndexBuffer } from './IIndexBuffer';
import { IProgram } from './IProgram';
import { ITexture } from './ITexture';
import { ITextureBase } from './ITextureBase';
import { IVertexBuffer } from './IVertexBuffer';
import { IVao } from './IVao';

export interface IContextGL
{
	glVersion: number;

	pixelRatio: number;

	container: HTMLCanvasElement;

	hasVao: boolean;

	createVao(): IVao;

	clear(
		red?: number, green?: number, blue?: number, alpha?: number,
		depth?: number, stencil?: number, mask?: ContextGLClearMask);

	configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean);

	createCubeTexture(
		size: number, format: ContextGLTextureFormat,
		optimizeForRenderToTexture: boolean, streamingLevels?: number): ICubeTexture;

	createIndexBuffer(numIndices: number): IIndexBuffer;

	createProgram(): IProgram;

	createTexture(
		width: number, height: number,
		format: ContextGLTextureFormat, optimizeForRenderToTexture: boolean, streamingLevels?: number): ITexture;

	createVertexBuffer(numVertices: number, dataPerVertex: number): IVertexBuffer;

	dispose();

	drawToBitmapImage2D(destination: BitmapImage2D);

	drawIndices(mode: ContextGLDrawMode, indexBuffer: IIndexBuffer, firstIndex?: number, numIndices?: number);

	drawVertices(mode: ContextGLDrawMode, firstVertex?: number, numVertices?: number);

	present();

	setBlendFactors(
		sourceFactor: ContextGLBlendFactor,
		destinationFactor: ContextGLBlendFactor,
		sourceALphaFactor?: ContextGLBlendFactor,
		destinationALphaFactor?: ContextGLBlendFactor
	);

	setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean);

	setStencilActions(
		triangleFace?: ContextGLTriangleFace,
		compareMode?: ContextGLCompareMode,
		actionOnBothPass?: ContextGLStencilAction,
		actionOnDepthFail?: ContextGLStencilAction,
		actionOnDepthPassStencilFail?: ContextGLStencilAction, coordinateSystem?: CoordinateSystem);

	setStencilReferenceValue(referenceValue: number, readMask?: number, writeMask?: number);

	setCulling(triangleFaceToCull: ContextGLTriangleFace, coordinateSystem?: CoordinateSystem)

	setDepthTest(depthMask: boolean, passCompareMode: ContextGLCompareMode);

	setProgram(program: IProgram);

	setProgramConstantsFromArray(programType: number, data: Float32Array);

	setSamplerStateAt(
		sampler: number, wrap: ContextGLWrapMode, filter: ContextGLTextureFilter, mipfilter: ContextGLMipFilter);

	setScissorRectangle(rectangle: Rectangle);

	setTextureAt(sampler: number, texture: ITextureBase);

	setVertexBufferAt(index: number, buffer: IVertexBuffer, bufferOffset?: number, format?: number);

	setRenderToTexture(
		target: ITextureBase,
		enableDepthAndStencil?: boolean,
		antiAlias?: number,
		surfaceSelector?: number,
		mipmapSelector?: number);

	setRenderToBackBuffer();

	copyToTexture(target: ITextureBase, rect: Rectangle, destPoint: Point): void

	enableStencil();

	disableStencil();

	finish();
}