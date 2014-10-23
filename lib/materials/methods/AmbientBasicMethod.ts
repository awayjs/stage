import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");

import Stage						= require("awayjs-stagegl/lib/core/base/Stage");
import IContextStageGL				= require("awayjs-stagegl/lib/core/stagegl/IContextStageGL");
import ContextGLMipFilter			= require("awayjs-stagegl/lib/core/stagegl/ContextGLMipFilter");
import ContextGLTextureFilter		= require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFilter");
import ContextGLWrapMode			= require("awayjs-stagegl/lib/core/stagegl/ContextGLWrapMode");
import MethodVO						= require("awayjs-stagegl/lib/materials/compilation/MethodVO");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import ShadingMethodBase			= require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
import ShaderCompilerHelper			= require("awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper");

/**
 * AmbientBasicMethod provides the default shading method for uniform ambient lighting.
 */
class AmbientBasicMethod extends ShadingMethodBase
{
	private _color:number = 0xffffff;
	private _alpha:number = 1;

	private _colorR:number = 1;
	private _colorG:number = 1;
	private _colorB:number = 1;

	private _ambient:number = 1;

	/**
	 * Creates a new AmbientBasicMethod object.
	 */
	constructor()
	{
		super();
	}

	/**
	 * @inheritDoc
	 */
	public iInitVO(shaderObject:ShaderObjectBase, methodVO:MethodVO)
	{
		methodVO.needsUV = Boolean(shaderObject.texture != null);
	}

	/**
	 * @inheritDoc
	 */
	public iInitConstants(shaderObject:ShaderObjectBase, methodVO:MethodVO)
	{
		if (!methodVO.needsUV) {
			this._color = shaderObject.color;
			this.updateColor();
		}
	}

	/**
	 * The strength of the ambient reflection of the surface.
	 */
	public get ambient():number
	{
		return this._ambient;
	}

	public set ambient(value:number)
	{
		if (this._ambient == value)
			return;

		this._ambient = value;

		this.updateColor();
	}

	/**
	 * The alpha component of the surface.
	 */
	public get alpha():number
	{
		return this._alpha;
	}

	public set alpha(value:number)
	{
		if (this._alpha == value)
			return;

		this._alpha = value;

		this.updateColor();
	}

	/**
	 * @inheritDoc
	 */
	public copyFrom(method:ShadingMethodBase)
	{
		var m:any = method;
		var b:AmbientBasicMethod = <AmbientBasicMethod> m;
	}

	/**
	 * @inheritDoc
	 */
	public iGetFragmentCode(shaderObject:ShaderObjectBase, methodVO:MethodVO, targetReg:ShaderRegisterElement, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var code:string = "";
		var ambientInputRegister:ShaderRegisterElement;

		if (methodVO.needsUV) {
			ambientInputRegister = registerCache.getFreeTextureReg();

			methodVO.texturesIndex = ambientInputRegister.index;

			code += ShaderCompilerHelper.getTex2DSampleCode(targetReg, sharedRegisters, ambientInputRegister, shaderObject.texture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

			if (shaderObject.alphaThreshold > 0) {
				var cutOffReg:ShaderRegisterElement = registerCache.getFreeFragmentConstant();
				methodVO.fragmentConstantsIndex = cutOffReg.index*4;

				code += "sub " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n" +
					"kil " + targetReg + ".w\n" +
					"add " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n";
			}

		} else {
			ambientInputRegister = registerCache.getFreeFragmentConstant();
			methodVO.fragmentConstantsIndex = ambientInputRegister.index*4;

			code += "mov " + targetReg + ", " + ambientInputRegister + "\n";
		}

		return code;
	}

	/**
	 * @inheritDoc
	 */
	public iActivate(shaderObject:ShaderObjectBase, methodVO:MethodVO, stage:Stage)
	{
		if (methodVO.needsUV) {
			(<IContextStageGL> stage.context).setSamplerStateAt(methodVO.texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR:ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR:ContextGLMipFilter.MIPNONE);
			(<IContextStageGL> stage.context).activateTexture(methodVO.texturesIndex, shaderObject.texture);

			if (shaderObject.alphaThreshold > 0)
				shaderObject.fragmentConstantData[methodVO.fragmentConstantsIndex] = shaderObject.alphaThreshold;
		} else {
			var index:number = methodVO.fragmentConstantsIndex;
			var data:Array<number> = shaderObject.fragmentConstantData;
			data[index] = this._colorR;
			data[index + 1] = this._colorG;
			data[index + 2] = this._colorB;
			data[index + 3] = this._alpha;
		}
	}

	/**
	 * Updates the ambient color data used by the render state.
	 */
	private updateColor()
	{
		this._colorR = ((this._color >> 16) & 0xff)/0xff*this._ambient;
		this._colorG = ((this._color >> 8) & 0xff)/0xff*this._ambient;
		this._colorB = (this._color & 0xff)/0xff*this._ambient;
	}
}

export = AmbientBasicMethod;