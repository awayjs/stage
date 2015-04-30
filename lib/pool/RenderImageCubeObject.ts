import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import ImageCube					= require("awayjs-core/lib/data/ImageCube");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ImageCubeObject				= require("awayjs-stagegl/lib/pool/ImageCubeObject");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class RenderImageCubeObject extends ImageCubeObject
{
	/**
	 *
	 */
	public static assetClass:IAssetClass = ImageCube;

	constructor(pool:ImageObjectPool, image:ImageCube, stage:Stage)
	{
		super(pool, image, stage)
	}

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		super.activate(index, repeat, smooth, false);

		//TODO: allow automatic mipmap generation

	}
}

export = RenderImageCubeObject;