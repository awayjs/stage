import SamplerCube					= require("awayjs-core/lib/image/SamplerCube");

import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import Stage						= require("awayjs-stagegl/lib/base/Stage");
import GL_SamplerBase				= require("awayjs-stagegl/lib/image/GL_SamplerBase");

/**
 *
 * @class away.pool.GL_SamplerBase
 */
class GL_SamplerCube extends GL_SamplerBase
{
	public _sampler:SamplerCube;

	constructor(sampler:SamplerCube, stage:Stage)
	{
		super(sampler, stage);

		this._sampler = sampler;
	}

	public activate(index:number)
	{
		this._stage.setSamplerState(index, false, this._sampler.smooth, this._sampler.mipmap);
	}
}

export = GL_SamplerCube;