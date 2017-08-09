import {AssetEvent} from "@awayjs/core";

import {MipmapGenerator, ExternalImage2D} from "@awayjs/graphics";

import {ITextureBase} from "../base/ITextureBase";
import {ITexture} from "../base/ITexture";
import {GL_Image2D} from "../image/GL_Image2D";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class GL_ExternalImage2D extends GL_Image2D
{
	public getTexture():ITextureBase
	{
		super.getTexture();

		if (this._invalid) {
			this._invalid = false;

			(<ITexture> this._texture).uploadFromURL((<ExternalImage2D> this._asset).urlRequest, 0);

			this._invalidMipmaps = true;
		}

		return this._texture;
	}
}