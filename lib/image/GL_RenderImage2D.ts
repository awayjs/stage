import {GL_Image2D}					from "../image/GL_Image2D";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class GL_RenderImage2D extends GL_Image2D
{

	public activate(index:number, mipmap:boolean):void
	{
		super.activate(index, false);

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalid = true;
		}

		if (this._invalid) {
			this._invalid = false;
			if (mipmap)
				this._texture.generateMipmaps();
		}
	}
}