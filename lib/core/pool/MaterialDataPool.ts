import MaterialData					= require("awayjs-stagegl/lib/core/pool/MaterialData");
import ContextGLBase				= require("awayjs-stagegl/lib/core/stagegl/ContextGLBase");
import StageGLMaterialBase			= require("awayjs-stagegl/lib/materials/StageGLMaterialBase");

/**
 * @class away.pool.MaterialDataPool
 */
class MaterialDataPool
{
	private _pool:Object = new Object();
	private _context:ContextGLBase;

	/**
	 * //TODO
	 *
	 * @param textureDataClass
	 */
	constructor(context:ContextGLBase)
	{
		this._context = context;
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 * @returns ITexture
	 */
	public getItem(material:StageGLMaterialBase):MaterialData
	{
		return (this._pool[material.id] || (this._pool[material.id] = material._iAddMaterialData(new MaterialData(this, this._context, material))))
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 */
	public disposeItem(material:StageGLMaterialBase)
	{
		material._iRemoveMaterialData(this._pool[material.id]);

		this._pool[material.id] = null;
	}
}

export = MaterialDataPool;