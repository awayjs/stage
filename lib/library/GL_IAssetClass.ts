import IAsset						= require("awayjs-core/lib/library/IAsset");
import AbstractionBase				= require("awayjs-core/lib/library/AbstractionBase");
import IAbstractionPool				= require("awayjs-core/lib/library/IAbstractionPool");

/**
 * IImageObjectClass is an interface for the constructable class definition ITextureObject that is used to
 * create renderable objects in the rendering pipeline to render the contents of a partition
 *
 * @class away.render.IImageObjectClass
 */
interface GL_IAssetClass
{
	/**
	 *
	 */
	new(asset:IAsset, pool:IAbstractionPool):AbstractionBase;
}

export = GL_IAssetClass;