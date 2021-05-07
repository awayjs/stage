import { Rectangle, CoordinateSystem, Point } from '@awayjs/core';
import { BitmapImage2D } from '../image/BitmapImage2D';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLClearMask } from '../base/ContextGLClearMask';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLProgramType } from '../base/ContextGLProgramType';
import { ContextGLStencilAction } from '../base/ContextGLStencilAction';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLTextureFormat } from '../base/ContextGLTextureFormat';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';
import { IContextGL } from '../base/IContextGL';
import { CubeTextureWebGL } from './CubeTextureWebGL';
import { IndexBufferWebGL } from './IndexBufferWebGL';
import { ProgramWebGL } from './ProgramWebGL';
import { TextureBaseWebGL } from './TextureBaseWebGL';
import { TextureWebGL } from './TextureWebGL';
import { VertexBufferWebGL } from './VertexBufferWebGL';
import { TextureContextWebGL } from './TextureContextWebGL';
import { VaoContextWebGL, VaoWebGL } from './VaoWebGL';
import { State } from './State';
import { Settings } from '../Settings';
import { FenceContextWebGL } from './FenceContextWebGL';
import * as GL_MAP from './ConstantsWebGL';
import { StatsWebGL } from './StatsWebGL';

let _DEBUG_renderMode: '' | 'line' = '';

//@ts-ignore
window._AWAY_DEBUG_ = Object.assign(window._AWAY_DEBUG_ || {}, {
	forceLineMode(lineMode = false) {
		_DEBUG_renderMode = lineMode ? 'line' : '';
	}
});

export class ContextWebGL implements IContextGL {
	public readonly stats = new StatsWebGL()

	private _container: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _drawing: boolean = true;

	private _standardDerivatives: boolean;

	// [x, y, w, h]
	private _viewportState: State<number> = new State(0,0,0,0);
	// [enable, func, src, dst];
	private _blendState: State<number> = new State(0,0,0,0);
	// [r, g, b, a]
	private _colorMapState: State<boolean> = new State(true, true, true, true);
	// [r, g, b, a]
	private _clearColorState: State<number> = new State(0,0,0,0);
	// [stencil, depth], i don't know default a depth value, set -1, to force change it
	private _clearSD: State<number> = new State(0,-1);

	// [enable, mask, func]
	private _depthState: State<number> = new State(0, 0, 0);
	// [enable, mask, func]
	private _stencilState: State<number> = new State(0, 1, 0);
	// [enable, face]
	private _cullState: State<number> = new State(0,0,0);

	//@protected
	public _gl: WebGLRenderingContext | WebGL2RenderingContext;

	//@protected
	public _currentProgram: ProgramWebGL;

	/* internal */ _texContext: TextureContextWebGL;
	/* internal */ _vaoContext: VaoContextWebGL;
	/* internal */ _fenceContext: FenceContextWebGL;

	private _currentArrayBuffer: VertexBufferWebGL;
	private _stencilCompareMode: number;
	private _stencilCompareModeBack: number;
	private _stencilCompareModeFront: number;
	private _stencilReferenceValue: number = 0;
	private _stencilReadMask: number = 0xff;
	private _separateStencil: boolean = false;
	private lastBoundedIndexBuffer: IndexBufferWebGL = null;

	public get hasFence() {
		return !!this._fenceContext;
	}

	private _hasVao = false;
	public get hasVao() {
		return this._hasVao;
	}

	private _glVersion: number;
	public get glVersion(): number {
		return this._glVersion;
	}

	private _pixelRatio: number;
	public get pixelRatio(): number {
		return this._pixelRatio;
	}

	public get container(): HTMLCanvasElement {
		return this._container;
	}

	public set container(value: HTMLCanvasElement) {
		this._container = value;
		this.initWebGL();
	}

	public get standardDerivatives(): boolean {
		return this._standardDerivatives;
	}

	constructor(canvas: HTMLCanvasElement, alpha: boolean = false) {
		this._container = canvas;
		this.initWebGL(alpha);
	}

	public assertLost(when: string) {
		if (!Settings.PROFILE_CONTEXT_LOST) {
			return;
		}

		if (this._gl.isContextLost()) {
			throw `[ContextWebGL] Context lost after ${when}, state: ${this.stats.toString()}`;
		}
	}

	private initWebGL(alpha: boolean = false) {

		const props: WebGLContextAttributes = {
			alpha: alpha,
			antialias: Settings.ENABLE_ANTIALIAS,
			stencil: true
		};

		try {
			if (Settings.PREF_WEBGL_VERSION === 2) {
				this._gl = <WebGLRenderingContext> this._container.getContext('webgl2', props);
				this._glVersion = 2;
			}

			if (!this._gl) {
				this._gl = <WebGLRenderingContext> (
						this._container.getContext('webgl', props)
						|| this._container.getContext('experimental-webgl', props));

				this._glVersion = 1;

				if (Settings.PREF_WEBGL_VERSION === 2) {
					console.warn('[CONTEXT] Preferred WebGL2 not supported on you device. WebGL1 will used!');
				}
			}

			console.debug(`[CONTEXT] Preferred WebGL: ${Settings.PREF_WEBGL_VERSION}, used: ${this._glVersion}`);

		} catch (e) {
			//
		}

		if (this._gl) {
			const gl = this._gl;

			this._standardDerivatives = this._glVersion === 2 || !!gl.getExtension('OES_standard_derivatives');
			this._stencilCompareMode = gl.ALWAYS;
			this._stencilCompareModeBack = gl.ALWAYS;
			this._stencilCompareModeFront = gl.ALWAYS;

			this._pixelRatio = self.devicePixelRatio || 1;
		} else {
			alert('WebGL is not available.');
		}

		this._texContext = new TextureContextWebGL(this);

		if (Settings.ENABLE_VAO) {
			if (VaoContextWebGL.isSupported(this._gl)) {
				this._vaoContext = new VaoContextWebGL(this);
				this._hasVao = true;
			} else {
				console.warn('[ContextWebGL] VAO isn\'t supported');
			}
		} else {
			console.debug('[ContextWebGL] Vao disabled by settings \'ENABLE_VAO\'');
		}

		if (Settings.ENABLE_ASYNC_READ) {
			if (FenceContextWebGL.isSupported(this._gl)) {
				this._fenceContext = new FenceContextWebGL(this);
			} else {
				console.warn('[ContextWebGL] FenceSync isn\'t supported');
			}
		} else {
			console.debug('[ContextWebGL] FenceSync disabled by settings \'ENABLE_ASYNC_READ\'');
		}

		// first locked state 0,0,0,0
		this._blendState.lock(true);

		//@ts-ignore
		window._AWAY_CONTEXT_STATS_ = this.stats;
	}

	public gl(): WebGLRenderingContext {
		return this._gl;
	}

	public clear(
		red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1,
		depth: number = 1, stencil: number = 0, mask: ContextGLClearMask = ContextGLClearMask.ALL): void {

		if (!this._drawing) {
			this.updateBlendStatus();
			this._drawing = true;
		}

		let glmask: number = 0;
		if (mask & ContextGLClearMask.COLOR) {
			if (this._clearColorState.set(red, green, blue, alpha)) {
				this._gl.clearColor(red, green, blue, alpha);
			}

			glmask |= this._gl.COLOR_BUFFER_BIT;
		}

		if (mask & ContextGLClearMask.STENCIL) {
			glmask |= this._gl.STENCIL_BUFFER_BIT;
			this._clearSD.setAt(0, stencil) && this._gl.clearStencil(stencil);
		}

		if (mask & ContextGLClearMask.DEPTH) {
			glmask |= this._gl.DEPTH_BUFFER_BIT;
			this._clearSD.setAt(0, depth) && this._gl.clearDepth(depth);
		}

		this._gl.clear(glmask);
	}

	public configureBackBuffer(
		width: number, height: number, antiAlias: number, enableDepthAndStencil: boolean = true): void {

		this._width = width * this._pixelRatio;
		this._height = height * this._pixelRatio;

		if (enableDepthAndStencil) {
			this.enableStencil();
			this.enableDepth();
		} else {
			this.disableStencil();
			this.disableDepth();
		}

		if (this._viewportState.set(0,0,this._width, this._height)) {
			this._gl.viewport(0, 0, this._width, this._height);
		}
	}

	public createCubeTexture(
		size: number, _format: ContextGLTextureFormat,
		_optimizeForRenderToTexture: boolean, _streamingLevels: number = 0): CubeTextureWebGL {

		return new CubeTextureWebGL(this, size);
	}

	public createIndexBuffer(numIndices: number): IndexBufferWebGL {
		return IndexBufferWebGL.create(this, numIndices);
	}

	public createProgram(): ProgramWebGL {
		return new ProgramWebGL(this);
	}

	public createTexture(
		width: number, height: number, _format: ContextGLTextureFormat,
		_optimizeForRenderToTexture: boolean, _streamingLevels: number = 0): TextureWebGL {

		//TODO streaming -- not supported on WebGL
		return TextureWebGL.create(this, width, height);
	}

	public createVertexBuffer(numVertices: number, dataPerVertex: number): VertexBufferWebGL {
		return VertexBufferWebGL.create(this, numVertices, dataPerVertex);
	}

	public createVao(): VaoWebGL {
		if (!this._hasVao) throw 'VAO isn\'n supported';

		return new VaoWebGL(this);
	}

	public dispose(): void {
		//
	}

	public drawToBitmapImage2D(
		destination: BitmapImage2D, invalidate = true, async: boolean = false): undefined | Promise<boolean> {

		const pixels = new Uint8Array(destination.getDataInternal().buffer);
		const rt = this._texContext._currentRT;
		const fence = this._fenceContext;
		const { width, height } = destination;

		let promise: Promise<boolean>;

		if (async && !fence) {
			promise = Promise.resolve(false);
		}

		const currentRT = this._texContext._currentRT;

		if (rt.isMsaaTarget) {
			// because RT is MSAA, we should blit it to no-MSAA and use noMSAA framebufer for reading
			rt.present();
			this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, rt.readBuffer);
		}

		if (async && fence) {
			// tasking a PBO read async
			// http://www.songho.ca/opengl/gl_pbo.html
			promise = fence
				.readPixels(0,0, width, height)
				.then((pbo) => {
					pbo.read(pixels);

					if (invalidate) {
						destination.invalidateGPU();
					}

					// restore PBO to fence pool
					// but we can destroy it too
					fence.release(pbo);

					return true;
				});

		} else {

			// we MUST unbound all bounded PIXEL_PACK buffer to avoid warnings
			if (fence) {
				fence.unboundAll();
			}

			// no support or not required as async, use sync operation
			this._gl.readPixels(
				0, 0, width, height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);

			if (invalidate) {
				destination.invalidateGPU();
			}
		}

		// restore back buffer bounding to draw framebufer, but only for sync opps
		// if (rt.isMsaaTarget && !async) {
		this._texContext.bindRenderTarget(currentRT, false);
		// }
		// for any case return a promise, nut for sync it will be undef;
		return promise;
	}

	public drawIndices(
		mode: ContextGLDrawMode, indexBuffer: IndexBufferWebGL, firstIndex: number = 0, numIndices: number = -1): void {

		if (!this._drawing)
			throw 'Need to clear before drawing if the buffer has not been cleared since the last present() call.';

		// updata blend before draw, because blend state can mutated a more times
		// reduce a state changes
		this.updateBlendStatus();

		// so, if we delete the buffer, and then try to compare last bounded buffer - it will valid, because
		// because reverence is same
		// reset buffer when it not a buffer
		if (this.lastBoundedIndexBuffer && !this.lastBoundedIndexBuffer.glBuffer) {
			this.lastBoundedIndexBuffer = null;
		}

		// check, that VAO not bounded
		// VAO store index buffer inself
		if (!this._hasVao || !this._vaoContext._lastBoundedVao) {

			if (this.lastBoundedIndexBuffer !== indexBuffer) {
				this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
			}

			this.lastBoundedIndexBuffer = indexBuffer;
		}

		mode = _DEBUG_renderMode === 'line' ? ContextGLDrawMode.LINES : mode;

		this._gl.drawElements(
			GL_MAP.DRAW_MODE[mode],
			(numIndices == -1) ? indexBuffer.numIndices : numIndices,
			this._gl.UNSIGNED_SHORT,
			firstIndex * 2);

		this.assertLost('drawElements');
	}

	public bindIndexBuffer(indexBuffer: IndexBufferWebGL) {
		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
		this.lastBoundedIndexBuffer = indexBuffer;
	}

	public drawVertices(mode: ContextGLDrawMode, firstVertex: number = 0, numVertices: number = -1): void {
		if (!this._drawing)
			throw 'Need to clear before drawing if the buffer has not been cleared since the last present() call.';

		if (numVertices == 0)
			return;

		// updata blend before draw, because blend state can mutated a more times
		// reduce a state changes
		this.updateBlendStatus();

		mode = _DEBUG_renderMode === 'line' ? ContextGLDrawMode.LINES : mode;

		this._gl.drawArrays(GL_MAP.DRAW_MODE[mode], firstVertex, numVertices);

		this.assertLost('drawArrays');
	}

	public present(): void {
		//this._drawing = false;

		this._fenceContext && this._fenceContext.tick();
	}

	public setBlendState(enable: boolean) {
		this._blendState.setAt(0, +enable);
	}

	public setBlendFactors(sourceFactor: ContextGLBlendFactor, destinationFactor: ContextGLBlendFactor): void {
		const src = GL_MAP.BLEND_OP[sourceFactor];
		const dst = GL_MAP.BLEND_OP[destinationFactor];
		const gl = this._gl;

		this._blendState.set(+true, gl.FUNC_ADD, src, dst);
	}

	public setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {

		if (this._colorMapState.set(red, green, blue, alpha)) {
			this._gl.colorMask(red, green, blue, alpha);
		}
	}

	public setCulling(
		triangleFaceToCull: ContextGLTriangleFace,
		coordinateSystem: CoordinateSystem = CoordinateSystem.LEFT_HANDED): void {

		if (triangleFaceToCull === ContextGLTriangleFace.NONE) {
			this._cullState.setAt(0, +false) && this._gl.disable(this._gl.CULL_FACE);
		} else {
			this._cullState.setAt(0, +true) && this._gl.enable(this._gl.CULL_FACE);
			const face = this.translateTriangleFace(triangleFaceToCull, coordinateSystem);
			this._cullState.setAt(1, face) && this._gl.cullFace(face);
		}
	}

	// TODO ContextGLCompareMode
	public setDepthTest(depthMask: boolean, passCompareMode: ContextGLCompareMode): void {
		const mode = GL_MAP.COMPARE_OP[passCompareMode];

		this._depthState.setAt(1, +depthMask) && this._gl.depthMask(depthMask);
		this._depthState.setAt(2, mode) && this._gl.depthFunc(mode);
	}

	public setViewport(x: number, y: number, width: number, height: number) {

		if (this._viewportState.set(x,y,width, height)) {
			this._gl.viewport(x,y,width,height);
		}
	}

	public enableDepth() {
		this._depthState.setAt(0, +true) && this._gl.enable(this._gl.DEPTH_TEST);
	}

	public disableDepth() {
		this._depthState.setAt(0, +false) && this._gl.disable(this._gl.DEPTH_TEST);
	}

	public enableStencil() {
		this._stencilState.setAt(0, +true) && this._gl.enable(this._gl.STENCIL_TEST);
	}

	public disableStencil() {
		this._stencilState.setAt(0, +false) && this._gl.disable(this._gl.STENCIL_TEST);
	}

	public setStencilActions(
		triangleFace: ContextGLTriangleFace = ContextGLTriangleFace.FRONT_AND_BACK,
		compareMode: ContextGLCompareMode = ContextGLCompareMode.ALWAYS,
		actionOnBothPass: ContextGLStencilAction = ContextGLStencilAction.KEEP,
		actionOnDepthFail: ContextGLStencilAction = ContextGLStencilAction.KEEP,
		actionOnDepthPassStencilFail: ContextGLStencilAction = ContextGLStencilAction.KEEP,
		coordinateSystem: CoordinateSystem = CoordinateSystem.LEFT_HANDED): void
	{	/* eslint-disable-line */

		this._separateStencil = triangleFace != ContextGLTriangleFace.FRONT_AND_BACK;

		const compareModeGL = GL_MAP.COMPARE_OP[compareMode];
		const fail = GL_MAP.STENCIL_ACTION[actionOnDepthPassStencilFail];
		const zFail = GL_MAP.STENCIL_ACTION[actionOnDepthFail];
		const pass = GL_MAP.STENCIL_ACTION[actionOnBothPass];

		if (!this._separateStencil) {

			this._stencilCompareMode = compareModeGL;
			this._gl.stencilFunc(compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
			this._gl.stencilOp(fail, zFail, pass);

		} else if (triangleFace == ContextGLTriangleFace.BACK) {

			this._stencilCompareModeBack = compareModeGL;
			this._gl.stencilFuncSeparate(
				this._gl.BACK, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);

			this._gl.stencilOpSeparate(this._gl.BACK, fail, zFail, pass);

		} else if (triangleFace == ContextGLTriangleFace.FRONT) {

			this._stencilCompareModeFront = compareModeGL;
			this._gl.stencilFuncSeparate(
				this._gl.FRONT, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
			this._gl.stencilOpSeparate(this._gl.FRONT, fail, zFail, pass);
		}

		this.assertLost('setStencilActions');
	}

	public setStencilReferenceValue(referenceValue: number, readMask: number = 0xFF, writeMask: number = 0xFF): void {
		this._stencilReferenceValue = referenceValue;
		this._stencilReadMask = readMask;

		if (this._separateStencil) {
			this._gl.stencilFuncSeparate(this._gl.FRONT, this._stencilCompareModeFront, referenceValue, readMask);
			this._gl.stencilFuncSeparate(this._gl.BACK, this._stencilCompareModeBack, referenceValue, readMask);
		} else {
			this._gl.stencilFunc(this._stencilCompareMode, referenceValue, readMask);
		}

		this._gl.stencilMask(writeMask);

		this.assertLost('setStencilReferenceValue');
	}

	public setProgram(program: ProgramWebGL): void {
		// kill focus when program is same
		if (this._currentProgram === program) {
			return;
		}

		//TODO decide on construction/reference resposibilities
		this._currentProgram = program;
		program.focusProgram();

		this.assertLost('setProgram');
	}

	public static modulo: number = 0;

	public setProgramConstantsFromArray(programType: number, data: Float32Array): void {
		if (data.length) {
			this._currentProgram.uniform4fv(programType, data);
		}
	}

	public setScissorRectangle(rect: Rectangle): void {
		if (!rect) {
			this._gl.disable(this._gl.SCISSOR_TEST);
			return;
		}

		const isRT = !!this._texContext._currentRT;

		// for framebuffer we use framebuffer size without internal scale
		const pr = isRT ? 1 : this._pixelRatio;

		// not require flip when renderer to RT, because already flipped
		const targetY = isRT
			? rect.y
			: this._height - (rect.y + rect.height) * pr;

		this._gl.enable(this._gl.SCISSOR_TEST);
		this._gl.scissor(
			rect.x * pr, targetY,
			rect.width * pr, rect.height * pr);

		this.assertLost('scissor');
	}

	public setTextureAt(sampler: number, texture: TextureBaseWebGL): void {
		const id = this._texContext.setTextureAt(sampler, <TextureWebGL>texture);

		// id - is real sampler id, because texture context can change id of sasmpler
		// or return -1 when texture unbounded
		if (id >= 0) {
			this._currentProgram.uniform1i(ContextGLProgramType.SAMPLER, sampler, id);
		}
	}

	public setSamplerStateAt(
		sampler: number,
		wrap: ContextGLWrapMode,
		filter: ContextGLTextureFilter,
		mipfilter: ContextGLMipFilter): void {

		// proxy
		this._texContext.setSamplerStateAt(sampler, wrap, filter, mipfilter);

		this.assertLost('setSamplerStateAt');
	}

	public setVertexBufferAt(
		index: number, buffer: VertexBufferWebGL, bufferOffset: number = 0, format: number = 4): void {

		const location: number = this._currentProgram ? this._currentProgram.getAttribLocation(index) : -1;

		// when we try bind any buffers without VAO we should unbound VAO
		// othwerwithe we bind a buffer to vao instead main contex
		if (this.hasVao && this._vaoContext._isRequireUnbound) {
			this._vaoContext.unbindVertexArrays();
		}

		// disable location, OS will fire error when loadings invalid buffer to it
		// location - is index of buffer location inside shader
		// index - attrib location for binding.
		// FOR OSx - IT CAN BE DIFFERENT

		if (!buffer) {
			if (location > -1) {
				this._gl.disableVertexAttribArray(index);
			}
			return;
		}

		//buffer may not have changed if concatenated buffers are being used
		if (this._currentArrayBuffer != buffer || (this.hasVao && this._vaoContext._lastBoundedVao)) {
			this._currentArrayBuffer = buffer;
			this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer ? buffer.glBuffer : null);
		}

		const properties = GL_MAP.VERTEX_BUF_PROPS[format];

		this._gl.enableVertexAttribArray(location);

		this._gl.vertexAttribPointer(
			location, properties.size, properties.type, properties.normalized, buffer.dataPerVertex, bufferOffset);

		this.assertLost('setVertexBufferAt');
	}

	public setRenderToTexture(
		target: TextureBaseWebGL, enableDepthAndStencil: boolean = false, antiAlias: number = 0,
		_surfaceSelector: number = 0, _mipmapSelector: number = 0): void {

		// proxy
		this._texContext.setRenderToTexture(
			target,
			enableDepthAndStencil,
			antiAlias > 1,
		);

		this.assertLost('setRenderToTexture');
	}

	public setRenderToBackBuffer(): void {
		this._texContext.setRenderToBackBuffer();
		this.assertLost('setRenderToBackBuffer');
	}

	public copyToTexture(target: TextureBaseWebGL, rect: Rectangle, destPoint: Point): void {
		if (!this._texContext._currentRT) {
			throw '[ContextWebGL] Try to copy from invalid frambuffer';
		}

		this._texContext.presentFrameBufferTo(this._texContext._currentRT, <TextureWebGL>target, rect, destPoint);
		this.assertLost('copyToTexture');

	}

	private updateBlendStatus(): void {
		const bs = this._blendState;

		if (!bs.dirty) {
			return;
		}

		const v = bs.values;
		const delta = bs.deltaDirty();

		// now fixedValues = values;
		bs.lock(true);

		if (v[0]) {
			delta[0] && this._gl.enable(this._gl.BLEND);
			// always ADD
			(delta[1] || delta[0]) && this._gl.blendEquation(v[1]);
			(delta[2] || delta[3] || delta[0]) && this._gl.blendFunc(v[2], v[3]);
		} else {
			delta[0] && this._gl.disable(this._gl.BLEND);
		}
	}

	public finish() {
		this._gl.flush();
		this._gl.finish();

		this._fenceContext && this._fenceContext.tick();
		this.assertLost('finish');
	}

	private translateTriangleFace(triangleFace: ContextGLTriangleFace, coordinateSystem: CoordinateSystem) {
		switch (triangleFace) {
			case ContextGLTriangleFace.BACK:
				return (coordinateSystem == CoordinateSystem.LEFT_HANDED) ? this._gl.FRONT : this._gl.BACK;
			case ContextGLTriangleFace.FRONT:
				return (coordinateSystem == CoordinateSystem.LEFT_HANDED) ? this._gl.BACK : this._gl.FRONT;
			case ContextGLTriangleFace.FRONT_AND_BACK:
				return this._gl.FRONT_AND_BACK;
			default:
				throw 'Unknown ContextGLTriangleFace type.'; // TODO error
		}
	}
}
