import {IAssetClass, IAbstractionPool} from "@awayjs/core";

import {IMaterial} from "@awayjs/graphics";

import {IElementsClassGL} from "../elements/IElementsClassGL";
import {Stage} from "../Stage";

import {IMaterialClassGL} from "./IMaterialClassGL";
import {MaterialGroupBase} from "./MaterialGroupBase";
import {GL_MaterialBase} from "./GL_MaterialBase";

/**
 * @class away.pool.MaterialPool
 */
export class MaterialPool implements IAbstractionPool
{
	private _abstractionPool:Object = new Object();
	private _elementsClass:IElementsClassGL;
	private _materialGroup:MaterialGroupBase
	private _abstractionClassPool:Object;

	public get elementsClass():IElementsClassGL
	{
		return this._elementsClass;
	}

	public get materialGroup():MaterialGroupBase
	{
		return this._materialGroup;
	}

	/**
	 * //TODO
	 *
	 * @param materialClassGL
	 */
	constructor(elementsClass:IElementsClassGL, materialGroup:MaterialGroupBase)
	{
		this._elementsClass = elementsClass;
		this._materialGroup = materialGroup;
		this._abstractionClassPool = materialGroup.abstractionClassPool;
	}

	/**
	 * //TODO
	 *
	 * @param elementsOwner
	 * @returns IElements
	 */
	public getAbstraction(material:IMaterial):GL_MaterialBase
	{
		return (this._abstractionPool[material.id] || (this._abstractionPool[material.id] = new (<IMaterialClassGL> this._abstractionClassPool[material.assetType])(material, this)));
	}

	/**
	 * //TODO
	 *
	 * @param elementsOwner
	 */
	public clearAbstraction(material:IMaterial):void
	{
		delete this._abstractionPool[material.id];
	}
}