import Image2D						from "awayjs-core/lib/image/Image2D";

import ContextGLTextureFormat		from "awayjs-stagegl/lib/base/ContextGLTextureFormat";
import GL_ImageBase					from "awayjs-stagegl/lib/image/GL_ImageBase";

/**
 *
 * @class away.pool.GL_ImageBase
 */
class GL_Image2D extends GL_ImageBase
{
	/**
	 *
	 * @param context
	 * @returns {ITexture}
	 */
	public _createTexture()
	{
		this._texture = this._stage.context.createTexture((<Image2D> this._asset).width, (<Image2D> this._asset).height, ContextGLTextureFormat.BGRA, true);
	}
}

export default GL_Image2D;