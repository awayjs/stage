import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import BitmapImageCube				= require("awayjs-core/lib/data/BitmapImageCube");
import BitmapImage2D				= require("awayjs-core/lib/data/BitmapImage2D");
import MipmapGenerator				= require("awayjs-core/lib/utils/MipmapGenerator");


import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ImageCubeObject				= require("awayjs-stagegl/lib/pool/ImageCubeObject");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class BitmapImageCubeObject extends ImageCubeObject
{
	public _mipmapDataArray:Array<Array<BitmapImage2D>> = new Array<Array<BitmapImage2D>>(6);

	/**
	 *
	 */
	public static assetClass:IAssetClass = BitmapImageCube;

	constructor(pool:ImageObjectPool, image:BitmapImageCube, stage:Stage)
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
			for (var i:number = 0; i < 6; ++i) {
				if (mipmap) {
					var mipmapData:Array<BitmapImage2D> = this._mipmapDataArray[i] = MipmapGenerator._generateMipMaps((<BitmapImageCube> this._image).getCanvas(i));
					var len:number = mipmapData.length;
					for (var j:number = 0; j < len; j++)
						(<ICubeTexture> this._texture).uploadFromData(mipmapData[j].getImageData(), i, j);
				} else {
					(<ICubeTexture> this._texture).uploadFromData((<BitmapImageCube> this._image).getImageData(i), i, 0);
				}
			}
		}
	}

	/**
	 *
	 */
	public dispose()
	{
		super.dispose();

		for (var i:number = 0; i < 6; i++) {
			var mipmapData:Array<BitmapImage2D> = this._mipmapDataArray[i];
			var len:number = mipmapData.length;

			for (var j:number = 0; j < len; i++)
				MipmapGenerator._freeMipMapHolder(mipmapData[j]);
		}
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

export = BitmapImageCubeObject;