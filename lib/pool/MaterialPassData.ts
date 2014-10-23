import IMaterialPassData			= require("awayjs-display/lib/pool/IMaterialPassData");

import MaterialPassDataPool			= require("awayjs-stagegl/lib/pool/MaterialPassDataPool");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import ContextGLBase				= require("awayjs-stagegl/lib/base/ContextGLBase");
import StageGLMaterialBase			= require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
import MaterialPassBase				= require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");

/**
 *
 * @class away.pool.MaterialPassData
 */
class MaterialPassData implements IMaterialPassData
{
	private _pool:MaterialPassDataPool;

	public material:StageGLMaterialBase;

	public shaderObject:ShaderObjectBase;

	public materialPass:MaterialPassBase;

	public programData:ProgramData;

	public shadedTarget:string;

	public vertexCode:string;

	public postAnimationFragmentCode:string;

	public fragmentCode:string;

	public animationVertexCode:string = "";

	public animationFragmentCode:string = "";

	public key:string;

	public invalid:boolean;

	public usesAnimation:boolean;

	constructor(pool:MaterialPassDataPool, material:StageGLMaterialBase, materialPass:MaterialPassBase)
	{
		this._pool = pool;
		this.material = material;
		this.materialPass = materialPass;
	}

	/**
	 *
	 */
	public dispose()
	{
		this._pool.disposeItem(this.materialPass);

		this.shaderObject.dispose();
		this.shaderObject = null;

		this.programData.dispose();
		this.programData = null;
	}

	/**
	 *
	 */
	public invalidate()
	{
		this.invalid = true;
	}
}

export = MaterialPassData;