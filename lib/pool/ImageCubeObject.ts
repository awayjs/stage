import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import ImageCube					= require("awayjs-core/lib/data/ImageCube");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ImageObjectBase				= require("awayjs-stagegl/lib/pool/ImageObjectBase");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.ImageCubeObjectBase
 */
class ImageCubeObject extends ImageObjectBase
{
	constructor(pool:ImageObjectPool, image:ImageCube, stage:Stage)
	{
		super(pool, image, stage)
	}

	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public getTexture(context:IContextGL):ITextureBase
	{
		return this._texture || (this._texture = context.createCubeTexture((<ImageCube> this._image).size, ContextGLTextureFormat.BGRA, false));
	}
}

export = ImageCubeObject;