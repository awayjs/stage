import {AbstractMethodError, IAsset, AbstractionBase} from "@awayjs/core";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.GL_SamplerBase
 */
export class GL_SamplerBase extends AbstractionBase
{
	public _stage:Stage;

	constructor(asset:IAsset, stage:Stage)
	{
		super(asset, stage);

		this._stage = stage;
	}

	public activate(index:number):void
	{
		throw new AbstractMethodError();
	}
}