///<reference path="../../_definitions.ts"/>

module away.materials
{
	import Stage									= away.base.Stage;
	import TriangleSubGeometry						= away.base.TriangleSubGeometry;
	import Camera									= away.entities.Camera;
	import AbstractMethodError						= away.errors.AbstractMethodError;
	import ShadingMethodEvent						= away.events.ShadingMethodEvent;
	import Matrix									= away.geom.Matrix;
	import Matrix3D									= away.geom.Matrix3D;
	import Matrix3DUtils							= away.geom.Matrix3DUtils;
	import RenderableBase							= away.pool.RenderableBase;
	import ContextGLMipFilter						= away.stagegl.ContextGLMipFilter;
	import ContextGLProgramType						= away.stagegl.ContextGLProgramType;
	import ContextGLTextureFilter					= away.stagegl.ContextGLTextureFilter;
	import ContextGLWrapMode						= away.stagegl.ContextGLWrapMode;
	import IContextStageGL							= away.stagegl.IContextStageGL;
	import Texture2DBase							= away.textures.Texture2DBase;

	/**
	 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
	 * using material methods to define their appearance.
	 */
	export class TrianglePassBase extends MaterialPassBase
	{


		public _preserveAlpha:boolean = true;

		/**
		 * Creates a new CompiledPass object.
		 */
		constructor(passMode:number = 0x03)
		{
			super(passMode);
		}


		/**
		 * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
		 */
		public get preserveAlpha():boolean
		{
			return this._preserveAlpha;
		}

		public set preserveAlpha(value:boolean)
		{
			if (this._preserveAlpha == value)
				return;

			this._preserveAlpha = value;

			this.iInvalidateShaderProgram();
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
	}
}