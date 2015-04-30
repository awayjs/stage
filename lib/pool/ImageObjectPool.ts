import ImageBase					= require("awayjs-core/lib/data/ImageBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import BitmapImage2DObject			= require("awayjs-stagegl/lib/pool/BitmapImage2DObject");
import BitmapImageCubeObject		= require("awayjs-stagegl/lib/pool/BitmapImageCubeObject");
import ImageObjectBase				= require("awayjs-stagegl/lib/pool/ImageObjectBase");
import RenderImage2DObject			= require("awayjs-stagegl/lib/pool/RenderImage2DObject");
import RenderImageCubeObject		= require("awayjs-stagegl/lib/pool/RenderImageCubeObject");
import IImageObjectClass			= require("awayjs-stagegl/lib/pool/IImageObjectClass");
import SpecularImage2DObject		= require("awayjs-stagegl/lib/pool/SpecularImage2DObject");

/**
 * @class away.pool.ImageObjectPool
 */
class ImageObjectPool
{
	private static classPool:Object = new Object();

	private _pool:Object = new Object();

	public _stage:Stage;

	/**
	 *
	 */
	constructor(stage:Stage)
	{
		this._stage = stage;
	}

	/**
	 *
	 * @param image
	 * @returns {ImageObjectBase}
	 */
	public getItem(image:ImageBase):ImageObjectBase
	{
		var imageObject:ImageObjectBase = <ImageObjectBase> (this._pool[image.id] || (this._pool[image.id] = image._iAddImageObject(new (ImageObjectPool.getClass(image))(this, image, this._stage))));

		return imageObject;
	}

	/**
	 *
	 * @param image
	 */
	public disposeItem(image:ImageBase)
	{
		image._iRemoveImageObject(this._pool[image.id]);

		this._pool[image.id] = null;
	}

	/**
	 *
	 * @param imageObjectClass
	 */
	public static registerClass(imageObjectClass:IImageObjectClass)
	{
		ImageObjectPool.classPool[imageObjectClass.assetClass.assetType] = imageObjectClass;
	}

	/**
	 *
	 * @param subGeometry
	 */
	public static getClass(texture:ImageBase):IImageObjectClass
	{
		return ImageObjectPool.classPool[texture.assetType];
	}

	private static main = ImageObjectPool.addDefaults();

	private static addDefaults()
	{
		ImageObjectPool.registerClass(RenderImage2DObject);
		ImageObjectPool.registerClass(RenderImageCubeObject);
		ImageObjectPool.registerClass(BitmapImage2DObject);
		ImageObjectPool.registerClass(BitmapImageCubeObject);
		ImageObjectPool.registerClass(SpecularImage2DObject);
	}
}

export = ImageObjectPool;