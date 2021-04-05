import { Point, Rectangle } from '@awayjs/core';
import { RenderTargetWebGL } from './RenderTargetWebGL';

export class RenderTargetWebGLMSAA extends RenderTargetWebGL {
	public isMsaaTarget = true;

	protected _color: WebGLRenderbuffer;

	/*internal*/ _drawTarget: RenderTargetWebGL;

	public get isValid() {
		return this._framebuffer && this._drawTarget && this._drawTarget.isValid;
	}

	protected init() {
		const gl = <WebGL2RenderingContext> this._context._gl;
		const tex = this._context._texContext;

		this._framebuffer =  gl.createFramebuffer();
		this._depthStencil = this._colorOnly ? null : gl.createRenderbuffer();
		this._color = gl.createRenderbuffer();

		const stencil = this._depthStencil;
		const color = this._color;
		const width = this.width;
		const height = this.height;

		const GL_MAX_MSAA = gl.getParameter(gl.MAX_SAMPLES);
		const GL_RB = gl.RENDERBUFFER;
		const GL_FB = gl.FRAMEBUFFER;
		const GL_C_ATTACH = gl.COLOR_ATTACHMENT0;
		const GL_DS_ATTACH = gl.DEPTH_STENCIL_ATTACHMENT;
		const GL_RGBA8 = gl.RGBA8;
		const GL_D24_S8 = gl.DEPTH24_STENCIL8;

		const prevRT = tex.bindRenderTarget(this);

		gl.bindRenderbuffer(GL_RB, color);
		gl.framebufferRenderbuffer(GL_FB, GL_C_ATTACH, GL_RB, color);
		gl.renderbufferStorageMultisample(GL_RB, GL_MAX_MSAA, GL_RGBA8, width, height);

		if (stencil) {
			gl.bindRenderbuffer(GL_RB, stencil);
			// eslint-disable-next-line max-len
			gl.framebufferRenderbuffer(GL_FB, GL_DS_ATTACH, GL_RB, stencil);
			gl.renderbufferStorageMultisample(GL_RB, GL_MAX_MSAA, GL_D24_S8, width, height);
		}

		tex.bindRenderTarget(prevRT);
	}

	public linkTarget(target: RenderTargetWebGL | null) {
		if (target === this) {
			throw 'Framebuffer loop, linking to itself';
		}

		this._drawTarget = target;
	}

	public present(
		target: RenderTargetWebGL = this._drawTarget,
		sourceRect?: Rectangle,
		targetPoint?: Point,
	) {
		if (!this._framebuffer) {
			return;
		}

		if (target === this) {
			throw 'Framebuffer loop, presenting to itself';
		}

		if (!target) return;
		if (!target.isValid) return;

		let sx = ~~sourceRect?.x || 0;
		let sy = ~~sourceRect?.y || 0;
		let sw = ~~sourceRect?.width || target.width;
		let sh = ~~sourceRect?.height || target.height;
		let tx = ~~targetPoint?.x || 0;
		let ty = ~~targetPoint?.y || 0;
		let dest = target;

		const needOffset = tx || ty;

		// we can't blit MSAA to noMSAA with offset
		if (needOffset && !target.isMsaaTarget) {
			dest = this._drawTarget;

			sx = sy = tx = ty = 0;
			sw = target.width;
			sh = target.height;
		}

		const gl = <WebGL2RenderingContext> this._context._gl;

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._framebuffer);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dest._framebuffer);
		//so, i think that not needed, because blit should clear all values
		// gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		gl.blitFramebuffer(
			sx, sy, sx + sw, sy + sh,
			tx, ty, tx + sw, ty + sh,
			gl.COLOR_BUFFER_BIT,
			gl.NEAREST
		);

		// target can be MSAA (unpossible, because we have single MSAA render)
		// dest.present();

		if (needOffset && !target.isMsaaTarget) {
			// copy pixel, because we can't blit MSAA with offset
			this._drawTarget.present(target, sourceRect, targetPoint);
		}
	}

	public linkTexture(_texture: WebGLTexture) {
		throw 'Texture can\'t be linked to MSAA render target';
	}

	public dispose() {
		// MSAA not pooled!
		this.unload();
	}

	public unload() {
		this._context._gl.deleteRenderbuffer(this._color);
		this._color = null;
		this._drawTarget = null;

		super.unload();
	}
}