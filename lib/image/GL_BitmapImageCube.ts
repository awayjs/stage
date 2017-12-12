import {AssetEvent} from "@awayjs/core";

import {ITextureBase} from "../base/ITextureBase"
import {ICubeTexture} from "../base/ICubeTexture";

import {BitmapImageCube} from "../image/BitmapImageCube";

import {GL_ImageCube} from "./GL_ImageCube";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class GL_BitmapImageCube extends GL_ImageCube
{
    public getTexture():ITextureBase
    {
        super.getTexture();

		if (this._invalid) {
			this._invalid = false;

			for (var i:number = 0; i < 6; ++i)
				(<ICubeTexture> this._texture).uploadFromArray(new Uint8Array((<BitmapImageCube> this._asset).getImageData(i).data.buffer), i, 0);

            this._invalidMipmaps = true;
		}

        return this._texture;
	}
}