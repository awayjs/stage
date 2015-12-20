import GL_Image2D					= require("awayjs-stagegl/lib/image/GL_Image2D");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_RenderIimage2D extends GL_Image2D
{

	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		super.activate(index, repeat, smooth, false);

		//TODO: allow automatic mipmap generation
	}
}

export = GL_RenderIimage2D;