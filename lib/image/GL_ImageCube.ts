import ImageCube					from "awayjs-core/lib/image/ImageCube";

import ContextGLTextureFormat		from "../base/ContextGLTextureFormat";
import GL_ImageBase					from "../image/GL_ImageBase";

/**
 *
 * @class away.pool.GL_ImageCubeBase
 */
class GL_ImageCube extends GL_ImageBase
{
	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public _createTexture()
	{
		this._texture = this._stage.context.createCubeTexture((<ImageCube> this._asset).size, ContextGLTextureFormat.BGRA, false);
	}
}

export default GL_ImageCube;