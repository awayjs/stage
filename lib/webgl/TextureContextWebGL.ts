import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';
import { ContextWebGL } from './ContextWebGL';
import { ContextWebGLFlags, ContextWebGLPreference } from './ContextWebGLFlags';
import { SamplerStateWebGL } from './SamplerStateWebGL';
import { TextureBaseWebGL } from './TextureBaseWebGL';
import { TextureWebGL } from './TextureWebGL';

const nPOTAlerts: NumberMap<boolean> = {};

interface IPoint {
	x: number;
	y: number;
}

interface IRectangle extends IPoint {
	width: number;
	height: number;
}

interface IRendertargetEntry {
	texture: TextureWebGL;
	enableDepthAndStencil: boolean;
	antiAlias: number;
	surfaceSelector: number;
	mipmapSelector: number;
}

export class TextureContextWebGL {
	_renderTarget: TextureWebGL;
	_lastBoundedTexture: TextureWebGL;
	_samplerStates: SamplerStateWebGL[] = [];
	_textureTypeDictionary: {texture2d?: number,textureCube?: number} = {};
	_wrapDictionary: NumberMap<number> = {};
	_filterDictionary: NumberMap<number> = {};
	_mipmapFilterMap: NumberMap<NumberMap<number>> = {};
	_activeTexture: number = -1;

	private _renderTargetConfig: IRendertargetEntry = undefined;

	constructor (private _context: ContextWebGL) {

		const gl = _context._gl;

		this._textureTypeDictionary = {
			texture2d: gl.TEXTURE_2D,
			textureCube: gl.TEXTURE_CUBE_MAP
		};

		this._wrapDictionary = {
			[ContextGLWrapMode.REPEAT]: gl.REPEAT,
			[ContextGLWrapMode.CLAMP]: gl.CLAMP_TO_EDGE
		};

		this._filterDictionary = {
			[ContextGLTextureFilter.LINEAR]: gl.LINEAR,
			[ContextGLTextureFilter.NEAREST]: gl.NEAREST
		};

		this._mipmapFilterMap[ContextGLTextureFilter.LINEAR] = {
			[ContextGLMipFilter.MIPNEAREST]: gl.LINEAR_MIPMAP_NEAREST,
			[ContextGLMipFilter.MIPLINEAR]: gl.LINEAR_MIPMAP_LINEAR,
			[ContextGLMipFilter.MIPNONE]: gl.LINEAR
		};

		this._mipmapFilterMap[ContextGLTextureFilter.NEAREST] = {
			[ContextGLMipFilter.MIPNEAREST]: gl.NEAREST_MIPMAP_NEAREST,
			[ContextGLMipFilter.MIPLINEAR]: gl.NEAREST_MIPMAP_LINEAR,
			[ContextGLMipFilter.MIPNONE]: gl.NEAREST
		};

		//defaults
		for (let i = 0; i < ContextWebGL.MAX_SAMPLERS; ++i) {
			this._samplerStates[i] = new SamplerStateWebGL(
				i,
				null,
				_context.glVersion === 2 ? gl.REPEAT : gl.CLAMP_TO_EDGE,
				gl.LINEAR,
				gl.LINEAR
			);
		}
	}

	public bindTexture (target: number, texture: TextureWebGL | null) {

	}

	public uploadFromArray(
		target: TextureWebGL,
		array: Uint8Array | Array<number> | null,
		miplevel: number = 0,
		premultiplied: boolean = false): void {

		const gl = this._context._gl;
		const width = target._width >>> miplevel;
		const height = target._height >>> miplevel;

		if (array && array.length !== width * height * 4) {
			/* eslint-disable-next-line */
			throw new Error(`Array is not the correct length for texture dimensions: expected: ${width * height * 4}, exist: ${array.length}`);
		}

		if (array instanceof Array)
			array = new Uint8Array(array);

		gl.bindTexture(gl.TEXTURE_2D, target._glTexture);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplied);
		gl.texImage2D(
			gl.TEXTURE_2D,
			miplevel,
			gl.RGBA,
			width, height,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			array);

		gl.bindTexture(gl.TEXTURE_2D, null);

	}

	public setTextureAt(sampler: number, texture: TextureWebGL): number {
		const gl = this._context._gl;
		const samplerState: SamplerStateWebGL = this._samplerStates[sampler];

		if (this._activeTexture !== sampler && (texture || samplerState.type)) {
			this._activeTexture = sampler;
			gl.activeTexture(gl.TEXTURE0 + sampler);
		}

		if (!texture) {
			if (samplerState.type) {

				// disable link to sampler in bounded texture
				if (samplerState.boundedTexture) {
					samplerState.boundedTexture._state.id = -1;
				}
				gl.bindTexture(samplerState.type, null);

				samplerState.boundedTexture = null;
				samplerState.type = null;
			}

			return -1;
		}

		const powerOfTwo = texture.isPOT;
		const isAllowRepeat = (this._context.glVersion === 2 || powerOfTwo)
			&& ContextWebGLFlags.PREF_REPEAT_WRAP !== ContextWebGLPreference.NONE;

		const textureType = this._textureTypeDictionary[texture.textureType];
		samplerState.type = textureType;

		// bind texture only when sampler is not same (texture is not bounded)
		// but there are a bug, and texture can be unbounded
		// if (texture._state.id !== sampler) {
		gl.bindTexture(textureType, texture.glTexture);
		texture._state.id = sampler;
		// }

		// apply state of texture only WHEN IT NOT EQUAL
		if (!texture._state.equals(samplerState)) {

			texture._state.copyFrom(samplerState);

			if (samplerState.wrap ===  gl.REPEAT && !isAllowRepeat) {

				if (!nPOTAlerts[texture.id]
					&& ContextWebGLFlags.PREF_REPEAT_WRAP === ContextWebGLPreference.ALL_TEXTURES) {

					nPOTAlerts[<number>texture.id] = true;
					console.warn(
						'[Texture] REPEAT wrap not allowed for nPOT textures in WebGL1,' +
						'set ContextWebGLFlags.PREF_REPEAT_WRAP ' +
						'= (ContextWebGLPreference.POT_TEXTURES | ContextWebGLPreference.NONE)' +
						'to supress warnings!',
						texture);
				}

				gl.texParameteri(textureType,  gl.TEXTURE_WRAP_S,  gl.CLAMP_TO_EDGE);
				gl.texParameteri(textureType,  gl.TEXTURE_WRAP_T,  gl.CLAMP_TO_EDGE);
			} else {
				gl.texParameteri(textureType,  gl.TEXTURE_WRAP_S, samplerState.wrap);
				gl.texParameteri(textureType,  gl.TEXTURE_WRAP_T, samplerState.wrap);
			}

			gl.texParameteri(textureType,  gl.TEXTURE_MAG_FILTER, samplerState.filter);
			gl.texParameteri(textureType,  gl.TEXTURE_MIN_FILTER, samplerState.mipfilter);
		}

		return sampler;
		//gl.uniform1i(this._currentProgram.getUniformLocation(ContextGLProgramType.SAMPLER, sampler), sampler);
	}

	public setSamplerStateAt(
		sampler: number,
		wrap: ContextGLWrapMode,
		filter: ContextGLTextureFilter,
		mipfilter: ContextGLMipFilter): void {

		if (0 <= sampler && sampler < ContextWebGL.MAX_SAMPLERS) {
			this._samplerStates[sampler].wrap = this._wrapDictionary[wrap];
			this._samplerStates[sampler].filter = this._filterDictionary[filter];
			this._samplerStates[sampler].mipfilter = this._mipmapFilterMap[filter][mipfilter];
		} else {
			throw 'Sampler is out of bounds.';
		}
	}

	public unsafeCopyToTexture(target: TextureWebGL, rect: IRectangle, destPoint: IPoint): void {
		const gl = this._context._gl;

		gl.bindTexture(gl.TEXTURE_2D, target.glTexture);
		gl.copyTexSubImage2D(
			gl.TEXTURE_2D,
			0,
			destPoint.x,
			destPoint.y,
			rect.x,
			rect.y,
			rect.width,
			rect.height);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	public restoreRenderTarget() {
		if (!this._renderTargetConfig) {
			this.setRenderToBackBuffer();
			return;
		}

		const {
			/*texture,*/ enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector
		} = this._renderTargetConfig;

		this.setFrameBuffer(this._renderTarget, enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector);
	}

	public setRenderToTexture(
		target: TextureBaseWebGL, enableDepthAndStencil: boolean = false, antiAlias: number = 0,
		surfaceSelector: number = 0, mipmapSelector: number = 0): void {

		if (this._renderTarget) {
			this.presentFrameBuffer(this._renderTarget);
			this._renderTarget._isRT = false;
		}

		this._renderTarget = <TextureWebGL> target;
		this._renderTarget._isRT = true;
		this._renderTargetConfig = {
			texture: this._renderTarget,
			enableDepthAndStencil,
			antiAlias,
			surfaceSelector,
			mipmapSelector
		};

		this.setFrameBuffer(this._renderTarget, enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector);
	}

	public setRenderToBackBuffer(): void {
		if (this._renderTarget) {
			this.presentFrameBuffer(this._renderTarget);
			this._renderTarget._isRT = false;
			this._renderTarget = null;
		}

		const gl = this._context._gl;
		this._renderTargetConfig = null;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	/*internal*/ setFrameBuffer(
		target: TextureWebGL, enableDepthAndStencil: boolean,
		antiAlias: number, surfaceSelector: number, mipmapSelector: number) {

		const gl = this._context._gl;

		if (gl instanceof WebGLRenderingContext)
			mipmapSelector = 0;

		const width: number = target.width >>> mipmapSelector;
		const height: number = target.height >>> mipmapSelector;

		target._mipmapSelector = mipmapSelector;

		if (!target._frameBuffer[mipmapSelector]) {
			this.initFrameBuffer(target, antiAlias,  mipmapSelector);
		} else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, target._frameBuffer[mipmapSelector]);
		}

		if (enableDepthAndStencil) {
			this._context.enableDepth();
			this._context.enableStencil();
		} else {
			this._context.disableDepth();
			this._context.disableStencil();
		}

		this._context.setViewport(0,0,width,height);
	}

	/*internal*/ initFrameBuffer(target: TextureWebGL, antiAlias: number, mipmapSelector: number) {
		const gl = this._context._gl;
		const width: number = target._width >>> mipmapSelector;
		const height: number = target._height >>> mipmapSelector;

		//create main framebuffer
		const frameBuffer = target._frameBuffer[mipmapSelector] = gl.createFramebuffer();
		//create renderbufferdepth
		const renderBufferDepth = target._renderBufferDepth[mipmapSelector] = gl.createRenderbuffer();

		target._mipmapSelector = mipmapSelector;
		// bind texture
		gl.bindTexture(gl.TEXTURE_2D, target._glTexture);

		// apply texture with empty data
		if (!target._isFilled) {
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

			//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

			target._isFilled = true;
			target._isPMA = true;
		}

		//no Multisample buffers with WebGL1
		if (gl instanceof WebGLRenderingContext || !ContextWebGLFlags.PREF_MULTISAMPLE || antiAlias < 1) {

			// activate framebuffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
			// activate renderbuffer
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferDepth);
			// set renderbuffer configuration
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, target._width, target._height);
			// attach texture to framebuffer
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target._glTexture, 0);
			// attach depth to framebuffer
			gl.framebufferRenderbuffer(
				gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderBufferDepth);

			target._multisampled = false;
		} else {

			// create framebuffer for DRAW
			const drawFrameBuffer = target._frameBufferDraw[mipmapSelector] = gl.createFramebuffer();
			// compute levels for texture
			const levels = Math.log(Math.min(target._width, target._height)) / Math.LN2 | 0 + 1;
			// bind DRAW framebuffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, drawFrameBuffer);
			// apply storage for texture
			if (!target._texStorageFlag) {
				gl.texStorage2D(gl.TEXTURE_2D, levels , gl.RGBA8, width, height);
				target._texStorageFlag = true;
			}
			// attach texture to framebuffer to current mipmap level
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,
				target._glTexture,
				target._mipmapSelector
			);

			gl.bindTexture(gl.TEXTURE_2D, null);

			// bind READ framebuffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

			gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferDepth);
			// attach depth renderbuffer multisampled
			gl.renderbufferStorageMultisample(
				gl.RENDERBUFFER, antiAlias, gl.DEPTH24_STENCIL8, width, height);
			// set renderbuffer configuration
			gl.framebufferRenderbuffer(
				gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderBufferDepth);

			// create READ color renderbuffer for multismapling
			const renderBuffer: WebGLRenderbuffer
				= target._renderBuffer[mipmapSelector] = gl.createRenderbuffer();

			// bind it
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
			// set config
			gl.renderbufferStorageMultisample(gl.RENDERBUFFER, antiAlias, gl.RGBA8, width, height);
			// attach READ framebuffer
			gl.framebufferRenderbuffer(
				gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderBuffer);

			target._multisampled = true;
		}

		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}

	/*internal*/ presentFrameBuffer(source: TextureWebGL): void {
		const gl = this._context._gl;

		//no Multisample buffers with WebGL1
		if (gl instanceof WebGLRenderingContext || !source._multisampled)
			return;

		const width: number = source._width >>> source._mipmapSelector;
		const height: number = source._height >>> source._mipmapSelector;

		if (source._frameBuffer[source._mipmapSelector] === source._frameBufferDraw[source._mipmapSelector]) {
			console.error('Framebuffer loop `presentFrameBuffer`');
			return;
		}

		// bind framebuffer with renderbuffer to READ slot
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source._frameBuffer[source._mipmapSelector]);
		// bind framebuffer with texture to WRITE slot
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, source._frameBufferDraw[source._mipmapSelector]);
		// ckear
		gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		// copy renderbuffer to texture
		gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
	}

	/*internal*/ presentFrameBufferTo(
		source: TextureWebGL | null, target: TextureWebGL, rect: IRectangle, point: IPoint): void {

		const gl = this._context._gl;

		let targetFrameBuffer = target.textureFramebuffer;

		if (!targetFrameBuffer) {
			this.initFrameBuffer(target, 0, 0,);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			targetFrameBuffer = target.textureFramebuffer;
		}

		if (source._frameBuffer[0] === targetFrameBuffer) {
			console.error('Framebuffer loop `presentFrameBufferTo`');
			return;
		}

		if (!source || !source._multisampled || gl instanceof WebGLRenderingContext) {
			// direct copy to target texture.
			// same as call this._context.renderToTexture
			gl.bindFramebuffer(gl.FRAMEBUFFER, source._frameBuffer[0]);
			this.unsafeCopyToTexture(target, rect, point);

		} else if (targetFrameBuffer) {
			// bind framebuffer with renderbuffer to READ slot
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source._frameBuffer[0]);
			// bind framebuffer with texture to WRITE slot
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFrameBuffer);
			// clear
			// gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
			// copy renderbuffer to texture
			gl.blitFramebuffer(
				rect.x | 0,
				rect.y | 0,
				(rect.width + rect.x) | 0,
				(rect.height + rect.y) | 0,

				point.x | 0,
				point.y | 0,
				(point.x + rect.width) | 0,
				(point.y + rect.height) | 0 ,

				gl.COLOR_BUFFER_BIT, gl.NEAREST);
		}

		this.blitTextureToRenderbuffer(target);

		// needs, because we rebound buffers to copy
		// otherwith Stage not restore rebounds an we will draw to other framebuffer
		this.restoreRenderTarget();
	}

	/**
	 * Blit self texture to renderbuffer if a multisampled
	 */
	/*internal*/ blitTextureToRenderbuffer(target: TextureWebGL): void {
		const gl = this._context._gl;

		if (!target._multisampled ||  !(gl instanceof WebGL2RenderingContext)) {
			return;
		}

		if (target._frameBuffer[target._mipmapSelector] === target._frameBufferDraw[target._mipmapSelector]) {
			console.error('Framebuffer loop `blitTextureToRenderbuffer`');
			return;
		}

		const width = target._width >>> target._mipmapSelector;
		const height = target._height >>> target._mipmapSelector;

		// bind framebuffer with renderbuffer to DRAW slot
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target._frameBuffer[target._mipmapSelector]);
		// bind framebuffer with texture to READ slot
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, target._frameBufferDraw[target._mipmapSelector]);
		// clear
		gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		// copy texture to renderbuffer!
		gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
	}

	/*internal*/ disposeTexture(texture: TextureWebGL) {
		const gl = this._context._gl;

		if (this._renderTarget === texture) {
			console.warn('[Context] Trying to dispose a active tendertarget!');

			this._context.setRenderToBackBuffer();
		}

		// delete texture
		gl.deleteTexture(texture._glTexture);

		// delete all framebuffers
		Object.keys(texture._frameBuffer)
			.forEach((key) => gl.deleteFramebuffer(texture._frameBuffer[key]));
		Object.keys(texture._frameBufferDraw)
			.forEach((key) => gl.deleteFramebuffer(texture._frameBufferDraw[key]));

		// delete all renderbuffers
		Object.keys(texture._renderBuffer)
			.forEach((key) => gl.deleteRenderbuffer(texture._renderBuffer[key]));

		Object.keys(texture._renderBufferDepth)
			.forEach((key) => gl.deleteRenderbuffer(texture._renderBufferDepth[key]));
	}

}