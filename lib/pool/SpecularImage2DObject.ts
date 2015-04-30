import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import BitmapImage2D				= require("awayjs-core/lib/data/BitmapImage2D");
import SpecularImage2D				= require("awayjs-core/lib/data/SpecularImage2D");
import MipmapGenerator				= require("awayjs-core/lib/utils/MipmapGenerator");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import Image2DObject				= require("awayjs-stagegl/lib/pool/Image2DObject");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class SpecularImage2DObject extends Image2DObject
{
	private _mipmapData:Array<BitmapImage2D>;

	/**
	 *
	 */
	public static assetClass:IAssetClass = SpecularImage2D;

	constructor(pool:ImageObjectPool, image:SpecularImage2D, stage:Stage)
	{
		super(pool, image, stage)
	}

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

				MipmapGenerator._generateMipMaps((<SpecularImage2D> this._image).getCanvas(), mipmapData);
				var len:number = mipmapData.length;
				for (var i:number = 0; i < len; i++)
					(<ITexture> this._texture).uploadFromData(mipmapData[i].getImageData(), i);
			} else {
				(<ITexture> this._texture).uploadFromData((<SpecularImage2D> this._image).getImageData(), 0);
			}
		}
	}

	/**
	 *
	 */
	public dispose()
	{
		super.dispose();

		var len:number = this._mipmapData.length;
		for (var i:number = 0; i < len; i++)
			MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
	}

	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public getTexture(context:IContextGL):ITextureBase
	{
		if (!this._texture) {
			this._invalid = true;
			return super.getTexture(context);
		}

		return this._texture;
	}
}

export = SpecularImage2DObject;