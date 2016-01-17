import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import BitmapImageCube				= require("awayjs-core/lib/image/BitmapImageCube");
import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import MipmapGenerator				= require("awayjs-core/lib/utils/MipmapGenerator");

import GL_ImageCube					= require("awayjs-stagegl/lib/image/GL_ImageCube");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_BitmapImageCube extends GL_ImageCube
{
	public _mipmapDataArray:Array<Array<BitmapImage2D>> = new Array<Array<BitmapImage2D>>(6);

	public activate(index:number, mipmap:boolean)
	{
		super.activate(index, mipmap);

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalid = true;
		}

		if (this._invalid) {
			this._invalid = false;
			for (var i:number = 0; i < 6; ++i) {
				if (mipmap) {
					var mipmapData:Array<BitmapImage2D> = this._mipmapDataArray[i] || (this._mipmapDataArray[i] = new Array<BitmapImage2D>());

					MipmapGenerator._generateMipMaps((<BitmapImageCube> this._asset).getCanvas(i), mipmapData, true);
					var len:number = mipmapData.length;
					for (var j:number = 0; j < len; j++)
						(<ICubeTexture> this._texture).uploadFromData(mipmapData[j].getImageData(), i, j);
				} else {
					(<ICubeTexture> this._texture).uploadFromData((<BitmapImageCube> this._asset).getImageData(i), i, 0);
				}
			}
		}
	}

	/**
	 *
	 */
	public onClear(event:AssetEvent)
	{
		super.onClear(event);

		for (var i:number = 0; i < 6; i++) {
			var mipmapData:Array<BitmapImage2D> = this._mipmapDataArray[i];

			if (mipmapData) {
				var len:number = mipmapData.length;

				for (var j:number = 0; j < len; i++)
					MipmapGenerator._freeMipMapHolder(mipmapData[j]);
			}
		}
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

export = GL_BitmapImageCube;