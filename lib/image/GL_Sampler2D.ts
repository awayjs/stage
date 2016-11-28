import {Sampler2D} from "@awayjs/graphics";

import {GL_SamplerBase} from "../image/GL_SamplerBase";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_SamplerBase
 */
export class GL_Sampler2D extends GL_SamplerBase
{
	public _sampler:Sampler2D;

	constructor(sampler:Sampler2D, stage:Stage)
	{
		super(sampler, stage);

		this._sampler = sampler;
	}

	public activate(index:number):void
	{
		this._stage.setSamplerState(index, this._sampler.repeat, this._sampler.smooth, this._sampler.mipmap);
	}
}