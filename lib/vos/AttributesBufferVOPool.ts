import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IAttributesBufferVOClass		= require("awayjs-stagegl/lib/vos/IAttributesBufferVOClass");
import AttributesBufferVO			= require("awayjs-stagegl/lib/vos/AttributesBufferVO");

/**
 * @class away.pool.AttributesBufferVOPool
 */
class AttributesBufferVOPool
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
	 * @param attributesBuffer
	 * @returns {AttributesBufferVO}
	 */
	public getItem(attributesBuffer:AttributesBuffer):AttributesBufferVO
	{
		return this._pool[attributesBuffer.id] || (this._pool[attributesBuffer.id] = attributesBuffer._iAddAttributesBufferVO(new (AttributesBufferVOPool.getClass(attributesBuffer))(this, attributesBuffer, this._stage)));
	}

	/**
	 *
	 * @param attributesBuffer
	 */
	public disposeItem(attributesBuffer:AttributesBuffer)
	{
		attributesBuffer._iRemoveAttributesBufferVO(this._pool[attributesBuffer.id]);

		this._pool[attributesBuffer.id] = null;
	}

	/**
	 *
	 * @param attributesBufferClass
	 */
	public static registerClass(attributesBufferClass:IAttributesBufferVOClass)
	{
		AttributesBufferVOPool.classPool[attributesBufferClass.assetClass.assetType] = attributesBufferClass;
	}

	/**
	 *
	 * @param subGeometry
	 */
	public static getClass(texture:AttributesBuffer):IAttributesBufferVOClass
	{
		return AttributesBufferVOPool.classPool[texture.assetType];
	}

	private static main = AttributesBufferVOPool.addDefaults();

	private static addDefaults()
	{
		AttributesBufferVOPool.registerClass(AttributesBufferVO);
	}
}

export = AttributesBufferVOPool;