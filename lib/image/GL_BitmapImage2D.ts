import {AssetEvent} from "@awayjs/core";

import {MipmapGenerator, BitmapImage2D} from "@awayjs/graphics";

import {ITextureBase} from "../base/ITextureBase";
import {ITexture} from "../base/ITexture";
import {GL_Image2D} from "../image/GL_Image2D";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class GL_BitmapImage2D extends GL_Image2D
{
	public getTexture():ITextureBase
	{
		super.getTexture();

		if (this._invalid) {
			this._invalid = false;

			(<ITexture> this._texture).uploadFromImage(<BitmapImage2D> this._asset, 0);

			this._invalidMipmaps = true;
		}

		return this._texture;
	}
}