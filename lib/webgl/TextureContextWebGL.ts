import { ContextWebGL } from './ContextWebGL';

import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';
import { ContextWebGLFlags, ContextWebGLPreference } from './ContextWebGLFlags';
import { SamplerStateWebGL } from './SamplerStateWebGL';
import { TextureBaseWebGL } from './TextureBaseWebGL';
import { TextureWebGL } from './TextureWebGL';
import { RenderTargetWebGL } from './RenderTargetWebGL';
import * as GL_MAP from './ConstantsWebGL';
import { RenderTargetWebGLMSAA } from './RenderTargetWebGLMSAA';

const nPOTAlerts: NumberMap<boolean> = {};

interface IPoint {
	x: number;
	y: number;
}

interface IRectangle extends IPoint {
	width: number;
	height: number;
}

export class TextureContextWebGL {
	public static MAX_SAMPLERS = 8;

	_renderTarget: TextureWebGL;
	_lastBoundedTexture: TextureWebGL;
	_samplerStates: SamplerStateWebGL[] = [];
	_activeTexture: number = -1;
	_currentRT: RenderTargetWebGL = null;

	private _gl: WebGLRenderingContext | WebGL2RenderingContext;

	constructor (private _context: ContextWebGL) {

		const gl = this._gl = _context._gl;

		//defaults
		for (let i = 0; i < TextureContextWebGL.MAX_SAMPLERS; ++i) {
			this._samplerStates[i] = new SamplerStateWebGL(i,null, _context);
			this._samplerStates[i].set(
				_context.glVersion === 2 ? gl.REPEAT : gl.CLAMP_TO_EDGE,
				gl.LINEAR, gl.LINEAR);
		}
	}

	public bindRenderTarget (target: RenderTargetWebGL, check = false): RenderTargetWebGL {
		if (check && this._currentRT === target) return target;

		const prev = this._currentRT;

		this._currentRT = target;
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, target ? target._framebuffer : null);

		return prev;
	}

	public bindTexture (texture: TextureWebGL | null, check = false, target: number = this._gl.TEXTURE_2D) {
		if (check && texture === this._lastBoundedTexture) return texture;

		const prev = this._lastBoundedTexture;

		this._lastBoundedTexture = texture;
		this._gl.bindTexture(target, texture ? texture._glTexture : texture);

		return prev;
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

		// push lastest used texture to stack and bind new
		const prev = this.bindTexture(target, false, gl.TEXTURE_2D);

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

		// restore last texture boundings
		// otherwise we will corrupt state
		this.bindTexture(prev, true, gl.TEXTURE_2D);
	}

	public setTextureAt(sampler: number, texture: TextureWebGL): number {
		const gl = this._context._gl;
		const samplerState = this._samplerStates[sampler];
		const textureType = GL_MAP.TEXTURE[texture.textureType];

		if ((texture || samplerState.type)) {
			gl.activeTexture(gl.TEXTURE0 + sampler);
		}

		if (!texture) {
			if (samplerState.type) {

				// disable link to sampler in bounded texture
				if (samplerState.boundedTexture) {
					samplerState.boundedTexture._state.id = -1;
				}

				this.bindTexture(null, false, samplerState.type);

				samplerState.boundedTexture = null;
				samplerState.type = null;
			}

			return -1;
		}

		texture._state.id = sampler;

		this.bindTexture(texture, false, textureType);

		samplerState.commit(textureType, texture);

		return sampler;
	}

	public setSamplerStateAt(
		sampler: number,
		wrap: ContextGLWrapMode,
		filter: ContextGLTextureFilter,
		mipfilter: ContextGLMipFilter
	): void {

		if (0 <= sampler && sampler < TextureContextWebGL.MAX_SAMPLERS) {
			this._samplerStates[sampler].set(
				GL_MAP.WRAP[wrap],
				GL_MAP.FILTER[filter],
				GL_MAP.MIP_FILTER[filter][mipfilter]
			);
		} else {
			throw 'Sampler is out of bounds.';
		}
	}

	public unsafeCopyToTexture(
		target: TextureWebGL, rect: IRectangle, destPoint: IPoint, scale: boolean = false): void {

		const gl = this._context._gl;

		const prev = this.bindTexture(target, false);

		if (!scale) {
			gl.copyTexSubImage2D(
				gl.TEXTURE_2D,
				0,
				destPoint.x,
				destPoint.y,
				rect.x,
				rect.y,
				rect.width,
				rect.height);
		} else {
			// this method allow scale up/down for texture with it configuration.
			// need set a sampler state to linear for this texture
			gl.copyTexImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				rect.x,
				rect.y,
				rect.width,
				rect.height,
				0
			);
		}

		// restore latest active texture
		this.bindTexture(prev, true);
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

		this.setFrameBuffer(this._renderTarget, enableDepthAndStencil, antiAlias, surfaceSelector, mipmapSelector);
	}

	public setRenderToBackBuffer(): void {
		if (this._renderTarget) {
			this.presentFrameBuffer(this._renderTarget);
			this._renderTarget._isRT = false;
		}

		this._renderTarget = null;

		this.bindRenderTarget(null, true);
	}

	/*internal*/ setFrameBuffer(
		target: TextureWebGL, enableDepthAndStencil: boolean,
		antiAlias: number, _surfaceSelector: number, _mipmapSelector: number) {

		const width = target.width;
		const height = target.height;

		if (!target._renderTarget) {
			this.initFrameBuffer(target, antiAlias, enableDepthAndStencil);
		}

		this.bindRenderTarget(target._renderTarget, false);

		if (enableDepthAndStencil) {
			this._context.enableDepth();
			this._context.enableStencil();
		} else {
			this._context.disableDepth();
			this._context.disableStencil();
		}

		this._context.setViewport(0,0,width,height);
	}

	/*internal*/ initFrameBuffer(target: TextureWebGL, antiAlias: number, depthStencil: boolean) {
		const width = target.width;
		const height = target.height;
		const prev = this.bindTexture(target, false);

		let rt = new RenderTargetWebGL(this._context, width, height, !depthStencil);

		rt.linkTexture(target);

		if (antiAlias > 0 && this._context.glVersion === 2) {
			const msaa = new RenderTargetWebGLMSAA(this._context, width, height, !depthStencil);

			msaa.linkTarget(rt);
			rt = msaa;
		}

		target._renderTarget = rt;
		this.bindTexture(prev, true);
	}

	/*internal*/ presentFrameBuffer(source: TextureWebGL): void {
		source._renderTarget.present();
	}

	/*internal*/ presentFrameBufferTo(
		source: TextureWebGL | null, target: TextureWebGL, rect: IRectangle, point: IPoint): void {

		const gl = this._context._gl;
		const prefRT = this._currentRT;

		if (!target._renderTarget) {
			this.initFrameBuffer(target, 0, false);
		}

		const targetFrameBuffer = target._renderTarget.drawBuffer;

		if (!source || !source._renderTarget.isMsaaTarget || gl instanceof WebGLRenderingContext) {
			// direct copy to target texture.
			// same as call this._context.renderToTexture
			gl.bindFramebuffer(gl.FRAMEBUFFER, source._renderTarget.readBuffer);
			this.unsafeCopyToTexture(target, rect, point);

		} else if (targetFrameBuffer) {
			// bind framebuffer with renderbuffer to READ slot
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source._renderTarget.drawBuffer);
			// bind framebuffer with texture to WRITE slot
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFrameBuffer);
			// clear
			gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
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

				gl.COLOR_BUFFER_BIT,
				gl.LINEAR
			);
		}

		this.blitTextureToRenderbuffer(target);
		this.bindRenderTarget(prefRT, true);
	}

	/**
	 * Blit self texture to renderbuffer if a multisampled
	 */
	/*internal*/ blitTextureToRenderbuffer(target: TextureWebGL): void {
		const gl = this._context._gl;

		if (!target._renderTarget.isMsaaTarget ||  !(gl instanceof WebGL2RenderingContext)) {
			return;
		}

		const width = target._width;
		const height = target._height;

		// bind framebuffer with renderbuffer to DRAW slot
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target._renderTarget.readBuffer);
		// bind framebuffer with texture to READ slot
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, target._renderTarget.drawBuffer);
		// clear
		gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		// copy texture to renderbuffer!
		gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
	}

	/*internal*/ disposeTexture(texture: TextureWebGL) {
		const gl = this._context._gl;

		if (this._renderTarget === texture) {
			console.warn('[Context] Trying to dispose a active tendertarget!');

			this._context.setRenderToBackBuffer();
		}

		if (texture === this._lastBoundedTexture) {
			this._lastBoundedTexture = null;
		}

		const texStat = this._context.stats.textures;

		// delete texture
		texStat.textures--;
		gl.deleteTexture(texture._glTexture);

		if (texture._renderTarget) {
			texture._renderTarget.dispose();
		}
	}

}