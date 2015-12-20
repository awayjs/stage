import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");
import SpecularImage2D				= require("awayjs-core/lib/image/SpecularImage2D");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import MipmapGenerator				= require("awayjs-core/lib/utils/MipmapGenerator");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import GL_Image2D					= require("awayjs-stagegl/lib/image/GL_Image2D");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_SpecularImage2D extends GL_Image2D
{
	private _mipmapData:Array<BitmapImage2D>;

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		super.activate(index, repeat, smooth, mipmap);

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalid = true;
		}

		if (this._invalid) {
			this._invalid = false;
			if (mipmap) {
				var mipmapData:Array<BitmapImage2D> = this._mipmapData || (this._mipmapData = new Array<BitmapImage2D>());

				MipmapGenerator._generateMipMaps((<SpecularImage2D> this._asset).getCanvas(), mipmapData);
				var len:number = mipmapData.length;
				for (var i:number = 0; i < len; i++)
					(<ITexture> this._texture).uploadFromData(mipmapData[i].getImageData(), i);
			} else {
				(<ITexture> this._texture).uploadFromData((<SpecularImage2D> this._asset).getImageData(), 0);
			}
		}
	}

	/**
	 *
	 */
	public onClear(event:AssetEvent)
	{
		super.onClear(event);

		var len:number = this._mipmapData.length;
		for (var i:number = 0; i < len; i++)
			MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
	}

	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public _getTexture():ITextureBase
	{
		if (!this._texture) {
			this._invalid = true;
			return super._getTexture();
		}

		return this._texture;
	}
}

export = GL_SpecularImage2D;