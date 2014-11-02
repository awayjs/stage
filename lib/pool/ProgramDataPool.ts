import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import ContextGLBase				= require("awayjs-stagegl/lib/base/ContextGLBase");

/**
 * @class away.pool.ProgramDataPool
 */
class ProgramDataPool
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
	public getItem(key:string):ProgramData
	{
		return this._pool[key] || (this._pool[key] = new ProgramData(this, this._context, key));
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 */
	public disposeItem(key:string)
	{
		this._pool[key] = null;
	}
}

export = ProgramDataPool;