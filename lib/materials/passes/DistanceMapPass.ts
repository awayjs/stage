import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Matrix3DUtils				= require("awayjs-core/lib/geom/Matrix3DUtils");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");

import Camera						= require("awayjs-display/lib/entities/Camera");

import Stage						= require("awayjs-stagegl/lib/core/base/Stage");
import MaterialPassData				= require("awayjs-stagegl/lib/core/pool/MaterialPassData");
import RenderableBase				= require("awayjs-stagegl/lib/core/pool/RenderableBase");
import ContextGLMipFilter			= require("awayjs-stagegl/lib/core/stagegl/ContextGLMipFilter");
import ContextGLTextureFilter		= require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFilter");
import ContextGLWrapMode			= require("awayjs-stagegl/lib/core/stagegl/ContextGLWrapMode");
import IContextStageGL				= require("awayjs-stagegl/lib/core/stagegl/IContextStageGL");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import MaterialPassBase				= require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
import ShaderCompilerHelper			= require("awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper");

/**
 * DistanceMapPass is a pass that writes distance values to a depth map as a 32-bit value exploded over the 4 texture channels.
 * This is used to render omnidirectional shadow maps.
 */
class DistanceMapPass extends MaterialPassBase
{
	private _fragmentConstantsIndex:number;
	private _texturesIndex:number;

	/**
	 * Creates a new DistanceMapPass object.
	 *
	 * @param material The material to which this pass belongs.
	 */
	constructor()
	{
		super();
	}

	/**
	 * Initializes the unchanging constant data for this material.
	 */
	public _iInitConstantData(shaderObject:ShaderObjectBase)
	{
		super._iInitConstantData(shaderObject);

		var index:number = this._fragmentConstantsIndex;
		var data:Array<number> = shaderObject.fragmentConstantData;
		data[index + 4] = 1.0/255.0;
		data[index + 5] = 1.0/255.0;
		data[index + 6] = 1.0/255.0;
		data[index + 7] = 0.0;
	}

	public _iIncludeDependencies(shaderObject:ShaderObjectBase)
	{
		shaderObject.projectionDependencies++;
		shaderObject.viewDirDependencies++;

		if (shaderObject.alphaThreshold > 0)
			shaderObject.uvDependencies++;

		shaderObject.addWorldSpaceDependencies(false);
	}

	/**
	 * @inheritDoc
	 */
	public _iGetFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var code:string;
		var targetReg:ShaderRegisterElement = sharedRegisters.shadedTarget;
		var diffuseInputReg:ShaderRegisterElement = registerCache.getFreeTextureReg();
		var dataReg1:ShaderRegisterElement = registerCache.getFreeFragmentConstant();
		var dataReg2:ShaderRegisterElement = registerCache.getFreeFragmentConstant()

		this._fragmentConstantsIndex = dataReg1.index*4;

		var temp1:ShaderRegisterElement = registerCache.getFreeFragmentVectorTemp();
		registerCache.addFragmentTempUsages(temp1, 1);
		var temp2:ShaderRegisterElement = registerCache.getFreeFragmentVectorTemp();
		registerCache.addFragmentTempUsages(temp2, 1);

		// squared distance to view
		code = "dp3 " + temp1 + ".z, " + sharedRegisters.viewDirVarying + ".xyz, " + sharedRegisters.viewDirVarying + ".xyz\n" +
			   "mul " + temp1 + ", " + dataReg1 + ", " + temp1 + ".z\n" +
			   "frc " + temp1 + ", " + temp1 + "\n" +
			   "mul " + temp2 + ", " + temp1 + ".yzww, " + dataReg2 + "\n";

		if (shaderObject.alphaThreshold > 0) {
			diffuseInputReg = registerCache.getFreeTextureReg();

			this._texturesIndex = diffuseInputReg.index;

			var albedo:ShaderRegisterElement = registerCache.getFreeFragmentVectorTemp();
			code += ShaderCompilerHelper.getTex2DSampleCode(albedo, sharedRegisters, diffuseInputReg, shaderObject.texture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

			var cutOffReg:ShaderRegisterElement = registerCache.getFreeFragmentConstant();

			code += "sub " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n" +
				"kil " + albedo + ".w\n";
		}

		code += "sub " + targetReg + ", " + temp1 + ", " + temp2 + "\n";

		return code;
	}

	/**
	 * @inheritDoc
	 */
	public _iActivate(pass:MaterialPassData, stage:Stage, camera:Camera)
	{
		super._iActivate(pass, stage, camera);

		var context:IContextStageGL = <IContextStageGL> stage.context;
		var shaderObject:ShaderObjectBase = pass.shaderObject;

		var f:number = camera.projection.far;

		f = 1/(2*f*f);
		// sqrt(f*f+f*f) is largest possible distance for any frustum, so we need to divide by it. Rarely a tight fit, but with 32 bits precision, it's enough.
		var index:number = this._fragmentConstantsIndex;
		var data:Array<number> = shaderObject.fragmentConstantData;
		data[index] = 1.0*f;
		data[index + 1] = 255.0*f;
		data[index + 2] = 65025.0*f;
		data[index + 3] = 16581375.0*f;

		if (shaderObject.alphaThreshold > 0) {
			context.setSamplerStateAt(this._texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
			context.activateTexture(this._texturesIndex, shaderObject.texture);

			data[index + 8] = pass.shaderObject.alphaThreshold;
		}
	}
}

export = DistanceMapPass;