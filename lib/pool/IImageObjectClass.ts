import ImageBase					= require("awayjs-core/lib/data/ImageBase");
import IWrapperClass				= require("awayjs-core/lib/library/IWrapperClass");
import IImageObject					= require("awayjs-core/lib/pool/IImageObject");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ImageObjectPool				= require("awayjs-stagegl/lib/pool/ImageObjectPool");

/**
 * IImageObjectClass is an interface for the constructable class definition ITextureObject that is used to
 * create renderable objects in the rendering pipeline to render the contents of a partition
 *
 * @class away.render.IImageObjectClass
 */
interface IImageObjectClass extends IWrapperClass
{
	/**
	 *
	 */
	new(pool:ImageObjectPool, image:ImageBase, stage:Stage):IImageObject;
}

export = IImageObjectClass;