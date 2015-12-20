import Image2D						= require("awayjs-core/lib/image/Image2D");

import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import GL_ImageBase					= require("awayjs-stagegl/lib/image/GL_ImageBase");

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
	public _getTexture():ITextureBase
	{
		return this._texture || (this._texture = this._stage.context.createTexture((<Image2D> this._asset).width, (<Image2D> this._asset).height, ContextGLTextureFormat.BGRA, true));
	}
}

export = GL_Image2D;