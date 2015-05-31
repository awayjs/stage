import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");
import IWrapperClass				= require("awayjs-core/lib/library/IWrapperClass");
import IAttributesBufferVO			= require("awayjs-core/lib/vos/IAttributesBufferVO");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import AttributesBufferVOPool		= require("awayjs-stagegl/lib/vos/AttributesBufferVOPool");

/**
 * IAttributesBufferVOClass is an interface for the constructable class definition ITextureObject that is used to
 * create renderable objects in the rendering pipeline to render the contents of a partition
 *
 * @class away.render.IAttributesBufferVOClass
 */
interface IAttributesBufferVOClass extends IWrapperClass
{
	/**
	 *
	 */
	new(pool:AttributesBufferVOPool, attributesBuffer:AttributesBuffer, stage:Stage):IAttributesBufferVO;
}

export = IAttributesBufferVOClass;