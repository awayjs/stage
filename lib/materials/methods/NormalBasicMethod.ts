import Stage						= require("awayjs-stagegl/lib/core/base/Stage");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");

import ContextGLMipFilter			= require("awayjs-stagegl/lib/core/stagegl/ContextGLMipFilter");
import ContextGLTextureFilter		= require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFilter");
import ContextGLWrapMode			= require("awayjs-stagegl/lib/core/stagegl/ContextGLWrapMode");
import IContextStageGL				= require("awayjs-stagegl/lib/core/stagegl/IContextStageGL");
import MethodVO						= require("awayjs-stagegl/lib/materials/compilation/MethodVO");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import ShadingMethodBase			= require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
import ShaderCompilerHelper			= require("awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper");

/**
 * NormalBasicMethod is the default method for standard tangent-space normal mapping.
 */
class NormalBasicMethod extends ShadingMethodBase
{
	private _texture:Texture2DBase;
	private _useTexture:boolean;
	public _pNormalTextureRegister:ShaderRegisterElement;

	/**
	 * Creates a new NormalBasicMethod object.
	 */
	constructor()
	{
		super();
	}

	public iIsUsed(shaderObject:ShaderObjectBase):boolean
	{
		if (!this._useTexture || !shaderObject.normalDependencies)
			return false;

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public iInitVO(shaderObject:ShaderObjectBase, methodVO:MethodVO)
	{
		methodVO.needsUV = this._useTexture;
	}

	/**
	 * Indicates whether or not this method outputs normals in tangent space. Override for object-space normals.
	 */
	public iOutputsTangentNormals():boolean
	{
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public copyFrom(method:ShadingMethodBase)
	{
		var s:any = method;
		var bnm:NormalBasicMethod = <NormalBasicMethod> method;

		if (bnm.normalMap != null)
			this.normalMap = bnm.normalMap;
	}

	/**
	 * The texture containing the normals per pixel.
	 */
	public get normalMap():Texture2DBase
	{
		return this._texture;
	}

	public set normalMap(value:Texture2DBase)
	{
		var b:boolean = (value != null);

		if (b != this._useTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
			this.iInvalidateShaderProgram();

		this._useTexture = b;
		this._texture = value;

	}

	/**
	 * @inheritDoc
	 */
	public iCleanCompilationData()
	{
		super.iCleanCompilationData();
		this._pNormalTextureRegister = null;
	}

	/**
	 * @inheritDoc
	 */
	public dispose()
	{
		if (this._texture)
			this._texture = null;
	}

	/**
	 * @inheritDoc
	 */
	public iActivate(shaderObject:ShaderObjectBase, methodVO:MethodVO, stage:Stage)
	{
		if (methodVO.texturesIndex >= 0) {
			(<IContextStageGL> stage.context).setSamplerStateAt(methodVO.texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
			(<IContextStageGL> stage.context).activateTexture(methodVO.texturesIndex, this._texture);
		}
	}

	/**
	 * @inheritDoc
	 */
	public iGetFragmentCode(shaderObject:ShaderObjectBase, methodVO:MethodVO, targetReg:ShaderRegisterElement, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		this._pNormalTextureRegister = registerCache.getFreeTextureReg();

		methodVO.texturesIndex = this._pNormalTextureRegister.index;

		return ShaderCompilerHelper.getTex2DSampleCode(targetReg, sharedRegisters, this._pNormalTextureRegister, this._texture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping) +
			"sub " + targetReg + ".xyz, " + targetReg + ".xyz, " + sharedRegisters.commons + ".xxx\n" +
			"nrm " + targetReg + ".xyz, " + targetReg + "\n";
	}
}

export = NormalBasicMethod;