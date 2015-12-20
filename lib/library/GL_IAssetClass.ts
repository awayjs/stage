import IAsset						= require("awayjs-core/lib/library/IAsset");
import AbstractionBase				= require("awayjs-core/lib/library/AbstractionBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");

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
	new(asset:IAsset, stage:Stage):AbstractionBase;
}

export = GL_IAssetClass;