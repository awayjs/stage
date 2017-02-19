import {AssetEvent} from "@awayjs/core";

import {MipmapGenerator, ExternalImage2D} from "@awayjs/graphics";

import {ITexture} from "../base/ITexture";
import {GL_Image2D} from "../image/GL_Image2D";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class GL_ExternalImage2D extends GL_Image2D
{
	public activate(index:number, mipmap:boolean):void
	{
		if (mipmap && this._stage.globalDisableMipmap)
			mipmap = false;
		
		if (!this._texture) {
			this._createTexture();
			this._invalid = true;
		}

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalid = true;
		}

		if (this._invalid) {
			this._invalid = false;

			(<ITexture> this._texture).uploadFromURL((<ExternalImage2D> this._asset).urlRequest, 0);

			// if (mipmap) //todo: allow for non-generated mipmaps
			// 	this._texture.generateMipmaps();
		}

		super.activate(index, mipmap);
	}

	/**
	 *
	 */
	public onClear(event:AssetEvent):void
	{
		super.onClear(event);

	}
}