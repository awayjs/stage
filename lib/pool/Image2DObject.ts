import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import Image2D						= require("awayjs-core/lib/data/Image2D");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ImageObjectBase				= require("awayjs-stagegl/lib/pool/ImageObjectBase");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class Image2DObject extends ImageObjectBase
{
	constructor(pool:ImageObjectPool, image:Image2D, stage:Stage)
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
		return this._texture || (this._texture = context.createTexture((<Image2D> this._image).width, (<Image2D> this._image).height, ContextGLTextureFormat.BGRA, true));
	}
}

export = Image2DObject;