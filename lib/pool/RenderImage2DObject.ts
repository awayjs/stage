import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import Image2D						= require("awayjs-core/lib/data/Image2D");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import Image2DObject				= require("awayjs-stagegl/lib/pool/Image2DObject");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class RenderImage2DObject extends Image2DObject
{
	/**
	 *
	 */
	public static assetClass:IAssetClass = Image2D;

	constructor(pool:ImageObjectPool, image:Image2D, stage:Stage)
	{
		super(pool, image, stage)
	}

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		super.activate(index, repeat, smooth, false);

		//TODO: allow automatic mipmap generation
	}
}

export = RenderImage2DObject;