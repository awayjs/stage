import ShaderLightingObject			= require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
import MaterialPassBase				= require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");

/**
 * SkyboxPass provides a material pass exclusively used to render sky boxes from a cube texture.
 */
class SkyboxPass extends MaterialPassBase
{
	/**
	 * Creates a new SkyboxPass object.
	 *
	 * @param material The material to which this pass belongs.
	 */
	constructor()
	{
		super();
	}


	public _iIncludeDependencies(shaderObject:ShaderLightingObject)
	{
		shaderObject.useMipmapping = false;
	}
}

export = SkyboxPass;