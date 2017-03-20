import {IRenderable} from "@awayjs/graphics";

import {GL_RenderableBase} from "./GL_RenderableBase";
import {RenderablePool} from "./RenderablePool";

/**
 * IMaterialClassGL is an interface for the constructable class definition GL_MaterialBase that is used to
 * create render objects in the rendering pipeline to render the contents of a partition
 *
 * @class away.render.GL_MaterialBase
 */
export interface IRenderableClassGL
{
	/**
	 *
	 */
	new(renderable:IRenderable, pool:RenderablePool):GL_RenderableBase;
}