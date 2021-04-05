import { Point, Rectangle } from '@awayjs/core';
import { IUnloadable } from '../managers/UnloadManager';
import { ContextWebGL } from './ContextWebGL';
import { TextureWebGL } from './TextureWebGL';

export class RenderTargetPool {
	private static _pool: Record<string, RenderTargetWebGL[]> = {};

	public static store(target: RenderTargetWebGL): boolean {
		const key = `${target.width}_${target.height}_${target.isMsaaTarget}`;

		if (!this._pool[key]) {
			this._pool[key] = [];
		}

		this._pool[key].push(target);

		return true;
	}

	public static get (context: ContextWebGL, width: number, height: number, colorOnly = false): RenderTargetWebGL {
		const key = `${width}_${height}_${false}`;

		if (this._pool[key] && this._pool[key].length) {
			return this._pool[key].pop();
		}

		return new RenderTargetWebGL(context, width, height, colorOnly);
	}
}

export class RenderTargetWebGL implements IUnloadable {
	public isMsaaTarget = false;
	public readonly id: number;
	/*internal*/ lastUsedTime: number;
	/*internal*/ canUnload: boolean;

	/*internal*/ _framebuffer: WebGLFramebuffer;
	protected _depthStencil: WebGLRenderbuffer;
	protected _linkedTexture: TextureWebGL;

	public get isValid() {
		return this._framebuffer && this._linkedTexture;
	}

	constructor (
		protected _context: ContextWebGL,
		public readonly width: number,
		public readonly height: number,
		protected _colorOnly = false
	) {
		this.init();
	}

	protected init() {
		const gl = this._context._gl;
		const fb = this._framebuffer =  gl.createFramebuffer();
		const rb = this._depthStencil = this._colorOnly ? null : gl.createRenderbuffer();

		this._context.stats.textures.framebuffers++;

		// we not have RB, not require init it
		if (!rb) {
			return;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);

		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	public linkTexture(texture: TextureWebGL) {
		if (this._linkedTexture === texture) {
			return;
		}

		const gl = this._context._gl;
		const tex = this._context._texContext;
		const link = texture?.glTexture;

		if (texture) {
			if (texture.height !== this.height || texture.width !== this.width) {
				throw (
					'Texture size and render target is different' +
					`expected ${this.width}x${this.height}, actual ${texture.width}x${texture.height}`
				);
			}

			// should be bound safe
			texture.uploadFromArray(null, 0, false);
		}

		const prevTarget = tex.bindRenderTarget(this);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, link, 0);

		tex.bindRenderTarget(prevTarget);

		this._linkedTexture = texture;
	}

	public present(
		target?: RenderTargetWebGL,
		sourceRect?: Rectangle,
		targetPoint?: Point,
		_intoThis = false
	) {
		if (!target) {
			return;
		}

		if (target.isMsaaTarget) {
			throw 'Invalid opration, try copy noMSAA to MSAA';
		}

		if (!target.isValid) {
			throw 'Target RT MUST be valid and have texture link';
		}

		if (!this.isValid) {
			throw 'Source RT MUST be valid and have texture link';
		}

		const gl = this._context._gl;
		const tex = this._context._texContext;

		const { x, y, width, height } = sourceRect;
		const tx = targetPoint?.x || 0;
		const ty = targetPoint?.y || 0;

		const prevTarget = tex.bindRenderTarget(this);
		const prevTex = tex.bindTexture(target._linkedTexture);

		gl.copyTexSubImage2D (gl.TEXTURE_2D, 0, tx, ty, x, y, width, height);

		tex.bindTexture(prevTex);
		tex.bindRenderTarget(prevTarget);
	}

	public dispose(): void {
		if (RenderTargetPool.store(this)) {
			return;
		}

		this.unload();
	}

	public unload(): void {
		const gl = this._context._gl;
		const fb = this._framebuffer;
		const rb = this._depthStencil;

		gl.deleteFramebuffer(fb);
		gl.deleteRenderbuffer(rb);

		this._linkedTexture = null;
		this._framebuffer = null;
		this._depthStencil = null;

		this._context.stats.textures.framebuffers--;
	}
}