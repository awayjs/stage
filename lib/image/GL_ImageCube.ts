import ImageCube					= require("awayjs-core/lib/image/ImageCube");

import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import GL_ImageBase					= require("awayjs-stagegl/lib/image/GL_ImageBase");

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
	public _getTexture():ITextureBase
	{
		return this._texture || (this._texture = this._stage.context.createCubeTexture((<ImageCube> this._asset).size, ContextGLTextureFormat.BGRA, false));
	}
}

export = GL_ImageCube;