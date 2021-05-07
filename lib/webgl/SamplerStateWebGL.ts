import { SamplerState } from '../base/SamplerState';
import { ContextWebGL } from './ContextWebGL';
import { TextureWebGL } from './TextureWebGL';

export class SamplerStateWebGL extends SamplerState {
	public boundedTexture: TextureWebGL;

	constructor(id: number, type: number, protected _context: ContextWebGL) {
		super(id, type);
	}

	public commit (textureType: number, texture: TextureWebGL) {
		this.type = textureType;

		if (this.equals(texture._state)) {
			return;
		}

		texture._state.copyFrom(this);

		const gl = this._context._gl;
		const isAllowRepeat = texture.isPOT || this._context.glVersion === 2;

		if (this.wrap ===  gl.REPEAT && !isAllowRepeat) {
			gl.texParameteri(textureType,  gl.TEXTURE_WRAP_S,  gl.CLAMP_TO_EDGE);
			gl.texParameteri(textureType,  gl.TEXTURE_WRAP_T,  gl.CLAMP_TO_EDGE);
		} else {
			gl.texParameteri(textureType,  gl.TEXTURE_WRAP_S, this.wrap);
			gl.texParameteri(textureType,  gl.TEXTURE_WRAP_T, this.wrap);
		}

		let targetMip = this.mipfilter;
		// fallback for texture that not has mip, because invalid mip is black
		if (!texture._isMipmaped) {
			targetMip = this.filter;
		}

		gl.texParameteri(textureType,  gl.TEXTURE_MAG_FILTER, this.filter);
		gl.texParameteri(textureType,  gl.TEXTURE_MIN_FILTER, targetMip);

		this.boundedTexture = texture;
	}
}