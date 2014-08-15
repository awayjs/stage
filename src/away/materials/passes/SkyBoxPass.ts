///<reference path="../../_definitions.ts"/>

module away.materials
{
	import TriangleSubGeometry						= away.base.TriangleSubGeometry;
	import Stage									= away.base.Stage;
	import Camera									= away.entities.Camera;
	import Matrix3D									= away.geom.Matrix3D;
	import Vector3D									= away.geom.Vector3D;
	import RenderableBase							= away.pool.RenderableBase;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import ContextGLCompareMode						= away.stagegl.ContextGLCompareMode;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLProgramType						= away.stagegl.ContextGLProgramType;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLTextureFormat					= away.stagegl.ContextGLTextureFormat;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import CubeTextureBase							= away.textures.CubeTextureBase;
	
	/**
	 * SkyboxPass provides a material pass exclusively used to render sky boxes from a cube texture.
	 */
	export class SkyboxPass extends MaterialPassBase
	{
		private _cubeTexture:CubeTextureBase;
		private _texturesIndex:number;
		private _vertexData:Array<number>;

		/**
		 * Creates a new SkyboxPass object.
		 *
		 * @param material The material to which this pass belongs.
		 */
		constructor()
		{
			super();

			//this._pNumUsedTextures = 1;
			this._vertexData = new Array<number>(0, 0, 0, 0, 1, 1, 1, 1);
		}

		/**
		 * The cube texture to use as the skybox.
		 */
		public get cubeTexture():CubeTextureBase
		{
			return this._cubeTexture;
		}

		public set cubeTexture(value:CubeTextureBase)
		{
			this._cubeTexture = value;
		}


		public _iIncludeDependencies(shaderObject:ShaderLightingObject)
		{
			shaderObject.useMipmapping = false;
		}

		/**
		 * @inheritDoc
		 */
		public _iGetPreVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			return "mul vt0, va0, vc5\n" +
				"add vt0, vt0, vc4\n" +
				"m44 op, vt0, vc0\n" +
				"mov v0, va0\n";
		}

		/**
		 * @inheritDoc
		 */
		public _iGetFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			//var cubeMapReg:ShaderRegisterElement = registerCache.getFreeTextureReg();

			//this._texturesIndex = cubeMapReg.index;

			//ShaderCompilerHelper.getTexCubeSampleCode(sharedRegisters.shadedTarget, cubeMapReg, this._cubeTexture, shaderObject.useSmoothTextures, shaderObject.useMipmapping);

			var mip:string = ",mipnone";

			if (this._cubeTexture.hasMipmaps)
				mip = ",miplinear";

			return "tex ft0, v0, fs0 <cube," + ShaderCompilerHelper.getFormatStringForTexture(this._cubeTexture) + "linear,clamp" + mip + ">\n";
		}

		/**
		 * @inheritDoc
		 */
		public iRender(renderable:RenderableBase, stage:Stage, camera:Camera, viewProjection:Matrix3D)
		{
			var context:IContextStageGL = <IContextStageGL> stage.context;
			var pos:Vector3D = camera.scenePosition;
			this._vertexData[0] = pos.x;
			this._vertexData[1] = pos.y;
			this._vertexData[2] = pos.z;
			this._vertexData[4] = this._vertexData[5] = this._vertexData[6] = camera.projection.far/Math.sqrt(3);
			context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, viewProjection, true);
			context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 4, this._vertexData, 2);

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
			context.setSamplerStateAt(0, ContextGLWrapMode.CLAMP, ContextGLTextureFilter.LINEAR, this._cubeTexture.hasMipmaps? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
			context.setDepthTest(false, ContextGLCompareMode.LESS);
			context.activateCubeTexture(0, this._cubeTexture);
		}
	}
}
