import GL_ImageCube					from "../image/GL_ImageCube";

/**
 *
 * @class away.pool.ImageObjectBase
 */
class GL_RenderImageCube extends GL_ImageCube
{
	public activate(index:number, mipmap:boolean)
	{
		super.activate(index, false);

		//TODO: allow automatic mipmap generation

	}
}

export default GL_RenderImageCube;