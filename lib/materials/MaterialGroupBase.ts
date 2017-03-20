import {IMaterial, IEntity} from "@awayjs/graphics";

import {GL_ElementsBase} from "../elements/GL_ElementsBase";
import {RenderablePool} from "../renderables/RenderablePool";
import {Stage} from "../Stage";

import {MaterialPool} from "./MaterialPool";
import {GL_MaterialBase} from "./GL_MaterialBase";

/**
 * @class away.pool.MaterialGroupBase
 */
export class MaterialGroupBase
{
	private _stage:Stage;
	private _abstractionClassPool:Object = new Object();

	private _materialPools:Object = new Object();

	private _renderablePools:Object = new Object();

	public get stage():Stage
	{
		return this._stage;
	}

	public get abstractionClassPool():Object
	{
		return this._abstractionClassPool;
	}

	/**
	 * //TODO
	 *
	 * @param materialClassGL
	 */
	constructor(stage:Stage, abstractionClassPool:Object)
	{
		this._stage = stage;
		this._abstractionClassPool = abstractionClassPool;
	}

	public getMaterialPool(elements:GL_ElementsBase):MaterialPool
	{
		return this._materialPools[elements.elementsType] || (this._materialPools[elements.elementsType] = new MaterialPool(elements.elementsClass, this));
	}

	public getRenderablePool(entity:IEntity):RenderablePool
	{
		return this._renderablePools[entity.id] || (this._renderablePools[entity.id] = new RenderablePool(entity, this));
	}
}