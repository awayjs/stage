import {AssetEvent} from "@awayjs/core";

import {ITextureBase} from "../base/ITextureBase"
import {ITexture} from "../base/ITexture";

import {BitmapImage2D} from "../image/BitmapImage2D";
import {MipmapGenerator} from "../utils/MipmapGenerator";

import {GL_Image2D} from "./GL_Image2D";

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

			(<ITexture> this._texture).uploadFromArray(new Uint8Array((<BitmapImage2D> this._asset).getImageData().data.buffer), 0);

			this._invalidMipmaps = true;
		}

		return this._texture;
	}
}