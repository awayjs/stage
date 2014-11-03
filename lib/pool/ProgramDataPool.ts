import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");

/**
 * @class away.pool.ProgramDataPool
 */
class ProgramDataPool
{
	private _pool:Object = new Object();
	private _stage:Stage;

	/**
	 * //TODO
	 *
	 * @param textureDataClass
	 */
	constructor(stage:Stage)
	{
		this._stage = stage;
	}

	/**
	 * //TODO
	 *
	 * @param materialOwner
	 * @returns ITexture
	 */
	public getItem(key:string):ProgramData
	{
		return this._pool[key] || (this._pool[key] = new ProgramData(this, this._stage, key));
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