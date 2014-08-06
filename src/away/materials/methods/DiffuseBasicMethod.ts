///<reference path="../../_definitions.ts"/>

module away.materials
{
	import Stage									= away.base.Stage;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * DiffuseBasicMethod provides the default shading method for Lambert (dot3) diffuse lighting.
	 */
	export class DiffuseBasicMethod extends LightingMethodBase
	{
		private _useAmbientTexture:boolean;

		public _pUseTexture:boolean;
		public _pTotalLightColorReg:ShaderRegisterElement;
		public _pDiffuseInputRegister:ShaderRegisterElement;

		private _texture:Texture2DBase;
		private _diffuseColor:number = 0xffffff;
		private _diffuseR:number = 1;
		private _diffuseG:number = 1;
		private _diffuseB:number = 1;
		private _diffuseA:number = 1;

		public _pIsFirstLight:boolean;

		/**
		 * Creates a new DiffuseBasicMethod object.
		 */
		constructor()
		{
			super();
		}

		/**
		 * Set internally if the ambient method uses a texture.
		 */
		public get iUseAmbientTexture():boolean
		{
			return this._useAmbientTexture;
		}

		public set iUseAmbientTexture(value:boolean)
		{
			if (this._useAmbientTexture == value)
				return;

			this._useAmbientTexture = value;

			this.iInvalidateShaderProgram();

		}

		public iInitVO(shaderObject:ShaderLightingObject, methodVO:MethodVO)
		{

			methodVO.needsUV = this._pUseTexture;
			methodVO.needsNormals = shaderObject.numLights > 0;

		}

		/**
		 * Forces the creation of the texture.
		 * @param stage The Stage used by the renderer
		 */
		public generateMip(stage:Stage)
		{
			if (this._pUseTexture)
				(<IContextStageGL> stage.context).activateTexture(0, this._texture);
		}

		/**
		 * The alpha component of the diffuse reflection.
		 */
		public get diffuseAlpha():number
		{
			return this._diffuseA;
		}

		public set diffuseAlpha(value:number)
		{
			this._diffuseA = value;
		}

		/**
		 * The color of the diffuse reflection when not using a texture.
		 */
		public get diffuseColor():number
		{
			return this._diffuseColor;
		}

		public set diffuseColor(diffuseColor:number)
		{
			this._diffuseColor = diffuseColor;
			this.updateDiffuse();

		}

		/**
		 * The bitmapData to use to define the diffuse reflection color per texel.
		 */
		public get texture():Texture2DBase
		{
			return this._texture;
		}

		public set texture(value:Texture2DBase)
		{
			var b:boolean = (value != null);

			if (b != this._pUseTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
				this.iInvalidateShaderProgram();

			this._pUseTexture = b;
			this._texture = value;
		}

		/**
		 * @inheritDoc
		 */
		public dispose()
		{
			this._texture = null;
		}

		/**
		 * @inheritDoc
		 */
		public copyFrom(method:ShadingMethodBase)
		{
			var diff:DiffuseBasicMethod = <DiffuseBasicMethod> method;

			this.texture = diff.texture;
			this.iUseAmbientTexture = diff.iUseAmbientTexture;
			this.diffuseAlpha = diff.diffuseAlpha;
			this.diffuseColor = diff.diffuseColor;
		}

		/**
		 * @inheritDoc
		 */
		public iCleanCompilationData()
		{
			super.iCleanCompilationData();

			this._pTotalLightColorReg = null;
			this._pDiffuseInputRegister = null;
		}

		/**
		 * @inheritDoc
		 */
		public iGetFragmentPreLightingCode(shaderObject:ShaderLightingObject, methodVO:MethodVO, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			var code:string = "";

			this._pIsFirstLight = true;

			if (shaderObject.numLights > 0) {
				this._pTotalLightColorReg = registerCache.getFreeFragmentVectorTemp();
				registerCache.addFragmentTempUsages(this._pTotalLightColorReg, 1);
			}

			return code;
		}

		/**
		 * @inheritDoc
		 */
		public iGetFragmentCodePerLight(shaderObject:ShaderLightingObject, methodVO:MethodVO, lightDirReg:ShaderRegisterElement, lightColReg:ShaderRegisterElement, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			var code:string = "";
			var t:ShaderRegisterElement;

			// write in temporary if not first light, so we can add to total diffuse colour
			if (this._pIsFirstLight) {
				t = this._pTotalLightColorReg;
			} else {
				t = registerCache.getFreeFragmentVectorTemp();
				registerCache.addFragmentTempUsages(t, 1);
			}

			code += "dp3 " + t + ".x, " + lightDirReg + ", " + sharedRegisters.normalFragment + "\n" +
					"max " + t + ".w, " + t + ".x, " + sharedRegisters.commons + ".y\n";

			if (shaderObject.usesLightFallOff)
				code += "mul " + t + ".w, " + t + ".w, " + lightDirReg + ".w\n";

			if (this._iModulateMethod != null)
				code += this._iModulateMethod(shaderObject, methodVO, t);

			code += "mul " + t + ", " + t + ".w, " + lightColReg + "\n";

			if (!this._pIsFirstLight) {
				code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
				registerCache.removeFragmentTempUsage(t);
			}

			this._pIsFirstLight = false;

			return code;
		}

		/**
		 * @inheritDoc
		 */
		public iGetFragmentCodePerProbe(shaderObject:ShaderLightingObject, methodVO:MethodVO, cubeMapReg:ShaderRegisterElement, weightRegister:string, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			var code:string = "";
			var t:ShaderRegisterElement;

			// write in temporary if not first light, so we can add to total diffuse colour
			if (this._pIsFirstLight) {
				t = this._pTotalLightColorReg;
			} else {
				t = registerCache.getFreeFragmentVectorTemp();
				registerCache.addFragmentTempUsages(t, 1);
			}

			code += "tex " + t + ", " + sharedRegisters.normalFragment + ", " + cubeMapReg + " <cube,linear,miplinear>\n" +
					"mul " + t + ".xyz, " + t + ".xyz, " + weightRegister + "\n";

			if (this._iModulateMethod != null)
				code += this._iModulateMethod(shaderObject, methodVO, t);

			if (!this._pIsFirstLight) {
				code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
				registerCache.removeFragmentTempUsage(t);
			}

			this._pIsFirstLight = false;

			return code;
		}

		/**
		 * @inheritDoc
		 */
		public iGetFragmentPostLightingCode(shaderObject:ShaderLightingObject, methodVO:MethodVO, targetReg:ShaderRegisterElement, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			var code:string = "";
			var albedo:ShaderRegisterElement;
			var cutOffReg:ShaderRegisterElement;

			// incorporate input from ambient
			if (shaderObject.numLights > 0) {
				if (sharedRegisters.shadowTarget)
					code += this.pApplyShadow(methodVO, registerCache, sharedRegisters);

				albedo = registerCache.getFreeFragmentVectorTemp();
				registerCache.addFragmentTempUsages(albedo, 1);
			} else {
				albedo = targetReg;
			}

			if (this._pUseTexture) {
				this._pDiffuseInputRegister = registerCache.getFreeTextureReg();

				methodVO.texturesIndex = this._pDiffuseInputRegister.index;

				code += ShaderCompilerHelper.getTex2DSampleCode(albedo, sharedRegisters, this._pDiffuseInputRegister, this._texture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

				if (shaderObject.alphaThreshold > 0) {
					cutOffReg = registerCache.getFreeFragmentConstant();
					methodVO.fragmentConstantsIndex = cutOffReg.index*4;

					code += "sub " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n" +
							"kil " + albedo + ".w\n" +
							"add " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n";
				}

			} else {
				this._pDiffuseInputRegister = registerCache.getFreeFragmentConstant();

				methodVO.fragmentConstantsIndex = this._pDiffuseInputRegister.index*4;

				code += "mov " + albedo + ", " + this._pDiffuseInputRegister + "\n";
			}

			if (shaderObject.numLights == 0)
				return code;

			//TODO: AGAL <> GLSL
			code += "sat " + this._pTotalLightColorReg + ", " + this._pTotalLightColorReg + "\n";

			if (this._useAmbientTexture) {
				code += "mul " + albedo + ".xyz, " + albedo + ", " + this._pTotalLightColorReg + "\n" +
						"mul " + this._pTotalLightColorReg + ".xyz, " + targetReg + ", " + this._pTotalLightColorReg + "\n" +
						"sub " + targetReg + ".xyz, " + targetReg + ", " + this._pTotalLightColorReg + "\n" +
						"add " + targetReg + ".xyz, " + albedo + ", " + targetReg + "\n";
			} else {
				code += "add " + targetReg + ".xyz, " + this._pTotalLightColorReg + ", " + targetReg + "\n";

				if (this._pUseTexture) {
					code += "mul " + targetReg + ".xyz, " + albedo + ", " + targetReg + "\n" +
							"mov " + targetReg + ".w, " + albedo + ".w\n";
				} else {

					code += "mul " + targetReg + ".xyz, " + this._pDiffuseInputRegister + ", " + targetReg + "\n" +
							"mov " + targetReg + ".w, " + this._pDiffuseInputRegister + ".w\n";
				}
			}

			registerCache.removeFragmentTempUsage(this._pTotalLightColorReg);
			registerCache.removeFragmentTempUsage(albedo);

			return code;
		}

		/**
		 * Generate the code that applies the calculated shadow to the diffuse light
		 * @param methodVO The MethodVO object for which the compilation is currently happening.
		 * @param regCache The register cache the compiler is currently using for the register management.
		 */
		public pApplyShadow(methodVO:MethodVO, regCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			return "mul " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + sharedRegisters.shadowTarget + ".w\n";
		}

		/**
		 * @inheritDoc
		 */
		public iActivate(shaderObject:ShaderLightingObject, methodVO:MethodVO, stage:Stage)
		{
			if (this._pUseTexture) {
				(<IContextStageGL> stage.context).setSamplerStateAt(methodVO.texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
				(<IContextStageGL> stage.context).activateTexture(methodVO.texturesIndex, this._texture);

				if (shaderObject.alphaThreshold > 0)
					shaderObject.fragmentConstantData[methodVO.fragmentConstantsIndex] = shaderObject.alphaThreshold;
			} else {
				var index:number = methodVO.fragmentConstantsIndex;
				var data:Array<number> = shaderObject.fragmentConstantData;
				data[index] = this._diffuseR;
				data[index + 1] = this._diffuseG;
				data[index + 2] = this._diffuseB;
				data[index + 3] = this._diffuseA;
			}
		}

		/**
		 * Updates the diffuse color data used by the render state.
		 */
		private updateDiffuse()
		{
			this._diffuseR = ((this._diffuseColor >> 16) & 0xff)/0xff;
			this._diffuseG = ((this._diffuseColor >> 8) & 0xff)/0xff;
			this._diffuseB = (this._diffuseColor & 0xff)/0xff;
		}
	}
}