import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");
import AbstractMethodError			= require("awayjs-core/lib/errors/AbstractMethodError");
import IAttributesBufferVO			= require("awayjs-core/lib/vos/IAttributesBufferVO");
import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");
import AttributesBufferVOPool		= require("awayjs-stagegl/lib/vos/AttributesBufferVOPool");

/**
 *
 * @class away.pool.AttributesBufferVO
 */
class AttributesBufferVO implements IAttributesBufferVO
{
	/**
	 *
	 */
	public static assetClass:IAssetClass = AttributesBuffer;

	private _pool:AttributesBufferVOPool;

	public _stage:Stage;

	public _indexBuffer:IIndexBuffer;

	public _vertexBuffer:IVertexBuffer;

	public _attributesBuffer:AttributesBuffer;

	public _mipmap:boolean;

	public _invalid:boolean;

	constructor(pool:AttributesBufferVOPool, attributesBuffer:AttributesBuffer, stage:Stage)
	{
		this._pool = pool;
		this._attributesBuffer = attributesBuffer;
		this._stage = stage;
	}

	/**
	 *
	 */
	public dispose()
	{
		this._pool.disposeItem(this._attributesBuffer);
		this._pool = null;
		this._attributesBuffer = null;
		this._stage = null;

		if (this._indexBuffer) {
			this._indexBuffer.dispose();
			this._indexBuffer = null;
		}

		if (this._vertexBuffer) {
			this._vertexBuffer.dispose();
			this._vertexBuffer = null;
		}
	}

	/**
	 *
	 */
	public invalidate()
	{
		this._invalid = true;
	}

	public activate(index:number, size:number, dimensions:number, offset:number)
	{
		this._stage.setVertexBuffer(index, this._getVertexBuffer(), size, dimensions, offset);
	}

	public draw(mode:string, firstIndex:number, numIndices:number)
	{
		this._stage.context.drawIndices(mode, this._getIndexBuffer(), firstIndex, numIndices);
	}

	public _getIndexBuffer():IIndexBuffer
	{
		if (!this._indexBuffer) {
			this._invalid = true;
			this._indexBuffer = this._stage.context.createIndexBuffer(this._attributesBuffer.count*this._attributesBuffer.stride/2); //hardcoded assuming UintArray
		}

		if (this._invalid) {
			this._invalid = false;
			this._indexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.length);
		}

		return this._indexBuffer;
	}

	public _getVertexBuffer():IVertexBuffer
	{
		if (!this._vertexBuffer) {
			this._invalid = true;
			this._vertexBuffer = this._stage.context.createVertexBuffer(this._attributesBuffer.count, this._attributesBuffer.stride);
		}

		if (this._invalid) {
			this._invalid = false;
			this._vertexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.count);
		}

		return this._vertexBuffer;
	}
}

export = AttributesBufferVO;