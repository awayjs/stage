import GL_Image2D					from "../image/GL_Image2D";

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_RenderImage2D extends GL_Image2D
{

	public activate(index:number, mipmap:boolean)
	{
		super.activate(index, false);

		//TODO: allow automatic mipmap generation
	}
}

export default GL_RenderImage2D;