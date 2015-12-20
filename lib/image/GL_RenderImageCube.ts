import GL_ImageCube					= require("awayjs-stagegl/lib/image/GL_ImageCube");

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_RenderImageCube extends GL_ImageCube
{
	public activate(index:number, repeat:boolean, smooth:boolean, mipmap:boolean)
	{
		super.activate(index, repeat, smooth, false);

		//TODO: allow automatic mipmap generation

	}
}

export = GL_RenderImageCube;