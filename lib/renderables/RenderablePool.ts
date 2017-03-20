import {IAssetClass, IAbstractionPool} from "@awayjs/core";

import {IEntity, IRenderable} from "@awayjs/graphics";

import {MaterialGroupBase} from "../materials/MaterialGroupBase";

import {IRenderableClassGL} from "./IRenderableClassGL";
import {GL_RenderableBase} from "./GL_RenderableBase";

/**
 * @class away.pool.RenderablePool
 */
export class RenderablePool implements IAbstractionPool
{
	private static _abstractionClassPool:Object = new Object();

	private _abstractionPool:Object = new Object();
	private _entity:IEntity;
	private _materialGroup:MaterialGroupBase;

	public get entity():IEntity
	{
		return this._entity;
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
	constructor(entity:IEntity, materialGroup:MaterialGroupBase)
	{
		this._entity = entity;
		this._materialGroup = materialGroup;
	}

	/**
	 * //TODO
	 *
	 * @param renderable
	 * @returns GL_RenderableBase
	 */
	public getAbstraction(renderable:IRenderable):GL_RenderableBase
	{
		return this._abstractionPool[renderable.id] || (this._abstractionPool[renderable.id] = new (<IRenderableClassGL> RenderablePool._abstractionClassPool[renderable.assetType])(renderable, this));
	}
	
	/**
	 *
	 * @param renderable
	 */
	public clearAbstraction(renderable:IRenderable):void
	{
		this._abstractionPool[renderable.id] = null;
	}

	/**
	 *
	 * @param imageObjectClass
	 */
	public static registerAbstraction(renderableClass:IRenderableClassGL, assetClass:IAssetClass):void
	{
		RenderablePool._abstractionClassPool[assetClass.assetType] = renderableClass;
	}
}