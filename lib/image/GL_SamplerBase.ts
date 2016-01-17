import AbstractMethodError			= require("awayjs-core/lib/errors/AbstractMethodError");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import AbstractionBase				= require("awayjs-core/lib/library/AbstractionBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");

/**
 *
 * @class away.pool.GL_SamplerBase
 */
class GL_SamplerBase extends AbstractionBase
{
	public _stage:Stage;

	constructor(asset:IAsset, stage:Stage)
	{
		super(asset, stage);

		this._stage = stage;
	}

	public activate(index:number)
	{
		throw new AbstractMethodError();
	}
}

export = GL_SamplerBase;