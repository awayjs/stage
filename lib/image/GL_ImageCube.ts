import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";

import {ImageCube} from "./ImageCube";
import {GL_ImageBase} from "../image/GL_ImageBase";

/**
 *
 * @class away.pool.GL_ImageCubeBase
 */
export class GL_ImageCube extends GL_ImageBase
{
    public getType():string
    {
        return "cube";
    }

    /**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
    protected _createTexture():void
	{
		this._texture = this._stage.context.createCubeTexture((<ImageCube> this._asset).size, ContextGLTextureFormat.BGRA, false);
	}
}