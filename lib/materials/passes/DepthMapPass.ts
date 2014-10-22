import Stage						= require("awayjs-stagegl/lib/core/base/Stage");
import Matrix3D						= require("awayjs-core/lib/core/geom/Matrix3D");
import Matrix3DUtils				= require("awayjs-core/lib/core/geom/Matrix3DUtils");
import Camera						= require("awayjs-core/lib/entities/Camera");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");

import MaterialPassData				= require("awayjs-stagegl/lib/core/pool/MaterialPassData");
import RenderableBase				= require("awayjs-stagegl/lib/core/pool/RenderableBase");
import ContextGLMipFilter			= require("awayjs-stagegl/lib/core/stagegl/ContextGLMipFilter");
import ContextGLTextureFilter		= require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFilter");
import ContextGLWrapMode			= require("awayjs-stagegl/lib/core/stagegl/ContextGLWrapMode");
import ContextGLProgramType			= require("awayjs-stagegl/lib/core/stagegl/ContextGLProgramType");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFormat");
import IContextStageGL				= require("awayjs-stagegl/lib/core/stagegl/IContextStageGL");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import MaterialPassBase				= require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
import ShaderCompilerHelper			= require("awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper");

/**
 * DepthMapPass is a pass that writes depth values to a depth map as a 32-bit value exploded over the 4 texture channels.
 * This is used to render shadow maps, depth maps, etc.
 */
class DepthMapPass extends MaterialPassBase
{
	private _fragmentConstantsIndex:number;
	private _texturesIndex:number;

	/**
	 * Creates a new DepthMapPass object.
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
		data[index] = 1.0;
		data[index + 1] = 255.0;
		data[index + 2] = 65025.0;
		data[index + 3] = 16581375.0;
		data[index + 4] = 1.0/255.0;
		data[index + 5] = 1.0/255.0;
		data[index + 6] = 1.0/255.0;
		data[index + 7] = 0.0;
	}

	public _iIncludeDependencies(shaderObject:ShaderObjectBase)
	{
		shaderObject.projectionDependencies++;

		if (shaderObject.alphaThreshold > 0)
			shaderObject.uvDependencies++;
	}

	/**
	 * @inheritDoc
	 */
	public _iGetFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var code:string = "";
		var targetReg:ShaderRegisterElement = sharedRegisters.shadedTarget;
		var diffuseInputReg:ShaderRegisterElement = registerCache.getFreeTextureReg();
		var dataReg1:ShaderRegisterElement = registerCache.getFreeFragmentConstant();
		var dataReg2:ShaderRegisterElement = registerCache.getFreeFragmentConstant();

		this._fragmentConstantsIndex = dataReg1.index*4;

		var temp1:ShaderRegisterElement = registerCache.getFreeFragmentVectorTemp();
		registerCache.addFragmentTempUsages(temp1, 1);
		var temp2:ShaderRegisterElement = registerCache.getFreeFragmentVectorTemp();
		registerCache.addFragmentTempUsages(temp2, 1);

		code += "div " + temp1 + ", " + sharedRegisters.projectionFragment + ", " + sharedRegisters.projectionFragment + ".w\n" + //"sub ft2.z, fc0.x, ft2.z\n" +    //invert
			"mul " + temp1 + ", " + dataReg1 + ", " + temp1 + ".z\n" +
			"frc " + temp1 + ", " + temp1 + "\n" +
			"mul " + temp2 + ", " + temp1 + ".yzww, " + dataReg2 + "\n";

		//codeF += "mov ft1.w, fc1.w	\n" +
		//    "mov ft0.w, fc0.x	\n";

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

		registerCache.removeFragmentTempUsage(temp1);
		registerCache.removeFragmentTempUsage(temp2);

		return code;
	}

	public _iRender(pass:MaterialPassData, renderable:RenderableBase, stage:Stage, camera:Camera, viewProjection:Matrix3D)
	{
		//this.setRenderState(pass, renderable, stage, camera, viewProjection);
	}

	/**
	 * @inheritDoc
	 */
	public _iActivate(pass:MaterialPassData, stage:Stage, camera:Camera)
	{
		super._iActivate(pass, stage, camera);

		var context:IContextStageGL = <IContextStageGL> stage.context;
		var shaderObject:ShaderObjectBase = pass.shaderObject;

		if (shaderObject.alphaThreshold > 0) {
			context.setSamplerStateAt(this._texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
			context.activateTexture(this._texturesIndex, shaderObject.texture);

			shaderObject.fragmentConstantData[this._fragmentConstantsIndex + 8] = pass.shaderObject.alphaThreshold;
		}
	}
}

export = DepthMapPass;