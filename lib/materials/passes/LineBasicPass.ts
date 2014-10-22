import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import MaterialPassBase				= require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");

/**
 * LineBasicPass is a material pass that draws wireframe segments.
 */
class LineBasicPass extends MaterialPassBase
{
	/**
	 * Creates a new SegmentPass object.
	 *
	 * @param material The material to which this pass belongs.
	 */
	constructor()
	{
		super();
	}

	/**
	 * @inheritDoc
	 */
	public _iGetFragmentCode(shaderObject:ShaderObjectBase, regCache:ShaderRegisterCache, sharedReg:ShaderRegisterData):string
	{
		var targetReg:ShaderRegisterElement = sharedReg.shadedTarget;

		return "mov " + targetReg + ", v0\n";
	}
}

export = LineBasicPass;