///<reference path="../../_definitions.ts"/>
module away.materials
{
	import TriangleSubGeometry						= away.base.TriangleSubGeometry;
	import Stage									= away.base.Stage;
	import Camera									= away.entities.Camera;
	import Matrix3D									= away.geom.Matrix3D;
	import Matrix3DUtils							= away.geom.Matrix3DUtils;
	import Vector3D									= away.geom.Vector3D;
	import RenderableBase							= away.pool.RenderableBase;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import ContextGLProgramType						= away.stagegl.ContextGLProgramType;
	import ContextGLTextureFormat					= away.stagegl.ContextGLTextureFormat;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * DistanceMapPass is a pass that writes distance values to a depth map as a 32-bit value exploded over the 4 texture channels.
	 * This is used to render omnidirectional shadow maps.
	 */
	export class DistanceMapPass extends MaterialPassBase
	{
		private _fragmentConstantsIndex:number;
		private _texturesIndex:number;
		private _alphaMask:Texture2DBase;

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
				code += ShaderCompilerHelper.getTex2DSampleCode(albedo, sharedRegisters, diffuseInputReg, this._alphaMask, shaderObject.useSmoothTextures, shaderObject.repeatTextures, shaderObject.useMipmapping);

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
		public iRender(renderable:RenderableBase, stage:Stage, camera:Camera, viewProjection:Matrix3D)
		{
			super.iRender(renderable, stage, camera, viewProjection);

			var context:IContextStageGL = <IContextStageGL> stage.context;

			context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 0, this._pActiveShaderObject.shaderObject.vertexConstantData, this._pActiveShaderObject.shaderObject.numUsedVertexConstants);
			context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, this._pActiveShaderObject.shaderObject.fragmentConstantData, this._pActiveShaderObject.shaderObject.numUsedFragmentConstants);

			context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
			context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
		}

		/**
		 * @inheritDoc
		 */
		public iActivate(material:MaterialBase, stage:Stage, camera:Camera)
		{
			super.iActivate(material, stage, camera);

			var context:IContextStageGL = <IContextStageGL> stage.context;
			var shaderObject:ShaderObjectBase = this._pActiveShaderObject.shaderObject;

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
				context.activateTexture(this._texturesIndex, this._alphaMask);

				data[index + 8] = this._pActiveShaderObject.shaderObject.alphaThreshold;
			}
		}
	}
}
