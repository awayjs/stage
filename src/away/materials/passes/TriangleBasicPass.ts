///<reference path="../../_definitions.ts"/>

module away.materials
{
	import Stage									= away.base.Stage;
	import SubGeometry								= away.base.TriangleSubGeometry;
	import Camera									= away.entities.Camera;
	import AbstractMethodError						= away.errors.AbstractMethodError;
	import ShadingMethodEvent						= away.events.ShadingMethodEvent;
	import Matrix									= away.geom.Matrix;
	import Matrix3D									= away.geom.Matrix3D;
	import Matrix3DUtils							= away.geom.Matrix3DUtils;
	import MaterialPassData							= away.pool.MaterialPassData;
	import RenderableBase							= away.pool.RenderableBase;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
	 * using material methods to define their appearance.
	 */
	export class TriangleBasicPass extends MaterialPassBase
	{
		public _pUseTexture:boolean;
		public _pTexture:Texture2DBase;

		private _diffuseColor:number = 0xffffff;
		private _diffuseR:number = 1;
		private _diffuseG:number = 1;
		private _diffuseB:number = 1;
		private _diffuseA:number = 1;

		private _fragmentConstantsIndex:number;
		private _texturesIndex:number;

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

			this._diffuseR = ((this._diffuseColor >> 16) & 0xff)/0xff;
			this._diffuseG = ((this._diffuseColor >> 8) & 0xff)/0xff;
			this._diffuseB = (this._diffuseColor & 0xff)/0xff;
		}

		/**
		 * The bitmapData to use to define the diffuse reflection color per texel.
		 */
		public get texture():Texture2DBase
		{
			return this._pTexture;
		}

		public set texture(value:Texture2DBase)
		{
			var b:boolean = (value != null);

			if (b != this._pUseTexture || (value && this._pTexture && (value.hasMipmaps != this._pTexture.hasMipmaps || value.format != this._pTexture.format)))
				this._pInvalidatePass();

			this._pUseTexture = b;
			this._pTexture = value;
		}

		/**
		 * Creates a new CompiledPass object.
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
			var code:string = "";
			var targetReg:ShaderRegisterElement = sharedReg.shadedTarget;
			var diffuseInputReg:ShaderRegisterElement;

			if (this._pUseTexture) {
				diffuseInputReg = regCache.getFreeTextureReg();

				this._texturesIndex = diffuseInputReg.index;

				code += ShaderCompilerHelper.getTex2DSampleCode(targetReg, sharedReg, diffuseInputReg, this._pTexture, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

				if (shaderObject.alphaThreshold > 0) {
					var cutOffReg:ShaderRegisterElement = regCache.getFreeFragmentConstant();
					this._fragmentConstantsIndex = cutOffReg.index*4;

					code += "sub " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n" +
						"kil " + targetReg + ".w\n" +
						"add " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n";
				}

			} else {
				diffuseInputReg = regCache.getFreeFragmentConstant();

				this._fragmentConstantsIndex = diffuseInputReg.index*4;

				code += "mov " + targetReg + ", " + diffuseInputReg + "\n";
			}

			return code;
		}

		public _iIncludeDependencies(dependencyCounter:ShaderObjectBase)
		{
			if (this._pUseTexture)
				dependencyCounter.uvDependencies++;
		}

		/**
		 * @inheritDoc
		 */
		public _iActivate(pass:MaterialPassData, stage:Stage, camera:Camera)
		{
			super._iActivate(pass, stage, camera);

			var shaderObject:ShaderObjectBase = pass.shaderObject;

			if (this._pUseTexture) {
				(<IContextStageGL> stage.context).setSamplerStateAt(this._texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
				(<IContextStageGL> stage.context).activateTexture(this._texturesIndex, this._pTexture);

				if (shaderObject.alphaThreshold > 0)
					shaderObject.fragmentConstantData[this._fragmentConstantsIndex] = shaderObject.alphaThreshold;
			} else {
				var index:number = this._fragmentConstantsIndex;
				var data:Array<number> = shaderObject.fragmentConstantData;
				data[index] = this._diffuseR;
				data[index + 1] = this._diffuseG;
				data[index + 2] = this._diffuseB;
				data[index + 3] = this._diffuseA;
			}
		}
	}
}