///<reference path="../../_definitions.ts"/>

module away.materials
{
	import Stage									= away.base.Stage;
	import Camera									= away.entities.Camera;
	import RenderableBase							= away.pool.RenderableBase;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * AmbientBasicMethod provides the default shading method for uniform ambient lighting.
	 */
	export class AmbientBasicMethod extends ShadingMethodBase
	{
		private _useTexture:boolean = false;
		private _texture:Texture2DBase;

		private _ambientColor:number = 0xffffff;

		private _ambientR:number = 0;
		private _ambientG:number = 0;
		private _ambientB:number = 0;

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
			methodVO.needsUV = this._useTexture;
		}

		/**
		 * @inheritDoc
		 */
		public iInitConstants(shaderObject:ShaderObjectBase, methodVO:MethodVO)
		{
			shaderObject.fragmentConstantData[methodVO.fragmentConstantsIndex + 3] = 1;
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

			this.updateAmbient();
		}

		/**
		 * The colour of the ambient reflection of the surface.
		 */
		public get ambientColor():number
		{
			return this._ambientColor;
		}

		public set ambientColor(value:number)
		{
			if (this._ambientColor == value)
				return;

			this._ambientColor = value;

			this.updateAmbient();
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

			var b:boolean = ( value != null );

			/* // ORIGINAL conditional
			 if (Boolean(value) != _useTexture ||
			 (value && _texture && (value.hasMipmaps != _texture.hasMipmaps || value.format != _texture.format))) {
			 iInvalidateShaderProgram();
			 }
			 */
			if (b != this._useTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format))) {
				this.iInvalidateShaderProgram();
			}
			this._useTexture = b;//Boolean(value);
			this._texture = value;
		}

		/**
		 * @inheritDoc
		 */
		public copyFrom(method:ShadingMethodBase)
		{
			var m:any = method;
			var b:AmbientBasicMethod = <AmbientBasicMethod> m;

			var diff:AmbientBasicMethod = b;//AmbientBasicMethod(method);

			this.ambient = diff.ambient;
			this.ambientColor = diff.ambientColor;
		}

		/**
		 * @inheritDoc
		 */
		public iGetFragmentCode(shaderObject:ShaderObjectBase, methodVO:MethodVO, targetReg:ShaderRegisterElement, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			var code:string = "";
			var ambientInputRegister:ShaderRegisterElement;

			if (this._useTexture) {

				ambientInputRegister = registerCache.getFreeTextureReg();

				methodVO.texturesIndex = ambientInputRegister.index;

				code += ShaderCompilerHelper.getTex2DSampleCode(targetReg, sharedRegisters, ambientInputRegister, this._texture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping) + "div " + targetReg + ".xyz, " + targetReg + ".xyz, " + targetReg + ".w\n"; // apparently, still needs to un-premultiply :s

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
			if (this._useTexture) {

				(<IContextStageGL> stage.context).setSamplerStateAt(methodVO.texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR:ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR:ContextGLMipFilter.MIPNONE);
				(<IContextStageGL> stage.context).activateTexture(methodVO.texturesIndex, this._texture);

			}

		}

		/**
		 * Updates the ambient color data used by the render state.
		 */
		private updateAmbient()
		{
			this._ambientR = ((this._ambientColor >> 16) & 0xff)/0xff*this._ambient;
			this._ambientG = ((this._ambientColor >> 8) & 0xff)/0xff*this._ambient;
			this._ambientB = (this._ambientColor & 0xff)/0xff*this._ambient;
		}

		/**
		 * @inheritDoc
		 */
		public iSetRenderState(shaderObject:ShaderLightingObject, methodVO:MethodVO, renderable:RenderableBase, stage:Stage, camera:Camera)
		{
			if (!this._useTexture) {

				var index:number = methodVO.fragmentConstantsIndex;
				var data:Array<number> = shaderObject.fragmentConstantData;
				data[index] = this._ambientR*shaderObject.ambientLightR;
				data[index + 1] = this._ambientG*shaderObject.ambientLightG;
				data[index + 2] = this._ambientB*shaderObject.ambientLightB;

			}
		}
	}
}
