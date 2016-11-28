import {SamplerCube} from "@awayjs/graphics";

import {GL_SamplerBase} from "../image/GL_SamplerBase";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_SamplerBase
 */
export class GL_SamplerCube extends GL_SamplerBase
{
	public _sampler:SamplerCube;

	constructor(sampler:SamplerCube, stage:Stage)
	{
		super(sampler, stage);

		this._sampler = sampler;
	}

	public activate(index:number):void
	{
		this._stage.setSamplerState(index, false, this._sampler.smooth, this._sampler.mipmap);
	}
}