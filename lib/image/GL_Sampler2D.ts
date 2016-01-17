import Sampler2D					= require("awayjs-core/lib/image/Sampler2D");

import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import Stage						= require("awayjs-stagegl/lib/base/Stage");
import GL_SamplerBase				= require("awayjs-stagegl/lib/image/GL_SamplerBase");

/**
 *
 * @class away.pool.GL_SamplerBase
 */
class GL_Sampler2D extends GL_SamplerBase
{
	public _sampler:Sampler2D;

	constructor(sampler:Sampler2D, stage:Stage)
	{
		super(sampler, stage);

		this._sampler = sampler;
	}

	public activate(index:number)
	{
		this._stage.setSamplerState(index, this._sampler.repeat, this._sampler.smooth, this._sampler.mipmap);
	}
}

export = GL_Sampler2D;