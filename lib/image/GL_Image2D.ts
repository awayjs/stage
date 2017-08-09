import {Image2D} from "@awayjs/graphics";

import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";
import {GL_ImageBase} from "../image/GL_ImageBase";

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class GL_Image2D extends GL_ImageBase
{

	public activate(index:number, mipmap:boolean):void
	{
		super.activate(index, mipmap);

		if (mipmap && this._stage.globalDisableMipmap)
			mipmap = false;

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalidMipmaps = true;
		}

		if (this._invalidMipmaps) {
			this._invalidMipmaps = false;

			if (mipmap) //todo: allow for non-generated mipmaps
				this._texture.generateMipmaps();
		}
	}

	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public _createTexture():void
	{
		this._texture = this._stage.context.createTexture((<Image2D> this._asset).width, (<Image2D> this._asset).height, ContextGLTextureFormat.BGRA, true);
	}
}