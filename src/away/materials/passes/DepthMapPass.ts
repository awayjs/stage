///<reference path="../../_definitions.ts"/>

module away.materials
{
	import TriangleSubGeometry						= away.base.TriangleSubGeometry;
	import Stage									= away.base.Stage;
	import Camera									= away.entities.Camera;
	import Matrix3D									= away.geom.Matrix3D;
	import Matrix3DUtils							= away.geom.Matrix3DUtils;
	import RenderableBase							= away.pool.RenderableBase;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import ContextGLProgramType						= away.stagegl.ContextGLProgramType;
	import ContextGLTextureFormat					= away.stagegl.ContextGLTextureFormat;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * DepthMapPass is a pass that writes depth values to a depth map as a 32-bit value exploded over the 4 texture channels.
	 * This is used to render shadow maps, depth maps, etc.
	 */
	export class DepthMapPass extends TrianglePassBase
	{
		private _fragmentConstantsIndex:number;
		private _texturesIndex:number;
		private _alphaMask:Texture2DBase;

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

		/**
		 * A texture providing alpha data to be able to prevent semi-transparent pixels to write to the alpha mask.
		 * Usually the diffuse texture when alphaThreshold is used.
		 */
		public get alphaMask():Texture2DBase
		{
			return this._alphaMask;
		}

		public set alphaMask(value:Texture2DBase)
		{
			this._alphaMask = value;
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
				code += ShaderCompilerHelper.getTex2DSampleCode(albedo, sharedRegisters, diffuseInputReg, this._alphaMask, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

				var cutOffReg:ShaderRegisterElement = registerCache.getFreeFragmentConstant();

				code += "sub " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n" +
					"kil " + albedo + ".w\n";
			}

			code += "sub " + targetReg + ", " + temp1 + ", " + temp2 + "\n";

			registerCache.removeFragmentTempUsage(temp1);
			registerCache.removeFragmentTempUsage(temp2);

			return code;
		}

		/**
		 * @inheritDoc
		 */
		public iActivate(material:MaterialBase, stage:Stage, camera:Camera)
		{
			super.iActivate(material, stage, camera);

			var context:IContextStageGL = <IContextStageGL> stage.context;
			var shaderObject:ShaderObjectBase = this._pActiveShaderObject.shaderObject;

			if (shaderObject.alphaThreshold > 0) {
				context.setSamplerStateAt(this._texturesIndex, shaderObject.repeatTextures? ContextGLWrapMode.REPEAT:ContextGLWrapMode.CLAMP, shaderObject.useSmoothTextures? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, shaderObject.useMipmapping? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
				context.activateTexture(this._texturesIndex, this._alphaMask);

				shaderObject.fragmentConstantData[this._fragmentConstantsIndex + 8] = this._pActiveShaderObject.shaderObject.alphaThreshold;
			}
		}
	}
}
