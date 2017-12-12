import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";

import {Image2D} from "./Image2D";

import {GL_ImageBase} from "./GL_ImageBase";

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class GL_Image2D extends GL_ImageBase
{

    public getType():string
    {
        return "2d";
    }

	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
    protected _createTexture():void
	{
		this._texture = this._stage.context.createTexture((<Image2D> this._asset).width, (<Image2D> this._asset).height, ContextGLTextureFormat.BGRA, true);
	}
}