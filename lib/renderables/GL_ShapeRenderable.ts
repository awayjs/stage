import {AssetEvent} from "@awayjs/core";

import {Shape, DefaultMaterialManager} from "@awayjs/graphics";

import {AnimatorBase} from "../animators/AnimatorBase";
import {GL_ElementsBase} from "../elements/GL_ElementsBase";
import {GL_MaterialBase} from "../materials/GL_MaterialBase";

import {GL_RenderableBase} from "./GL_RenderableBase";
import {RenderablePool} from "./RenderablePool";

/**
 * @class away.pool.GL_ShapeRenderable
 */
export class GL_ShapeRenderable extends GL_RenderableBase
{
	/**
	 *
	 */
	public shape:Shape;

	/**
	 * //TODO
	 *
	 * @param renderablePool
	 * @param shape
	 * @param level
	 * @param indexOffset
	 */
	constructor(shape:Shape, renderablePool:RenderablePool)
	{
		super(shape, renderablePool);

		this.shape = shape;
	}

	public onClear(event:AssetEvent):void
	{
		super.onClear(event);

		this.shape = null;
	}

	/**
	 *
	 * @returns {ElementsBase}
	 * @protected
	 */
	protected _getElements():GL_ElementsBase
	{
		this._offset = this.shape.offset;
		this._count = this.shape.count;
		
		return <GL_ElementsBase> this._stage.getAbstraction((this.sourceEntity.animator)? (<AnimatorBase> this.sourceEntity.animator).getRenderableElements(this, this.shape.elements) : this.shape.elements);
	}

	protected _getMaterial():GL_MaterialBase
	{
		return this._materialGroup.getMaterialPool(this.elementsGL).getAbstraction(this.shape.material || this.sourceEntity.material || DefaultMaterialManager.getDefaultMaterial(this.renderable));
	}
}