import Stage						= require("awayjs-stagegl/lib/core/base/Stage");
import TriangleSubGeometry			= require("awayjs-core/lib/core/base/TriangleSubGeometry");
import Matrix						= require("awayjs-core/lib/core/geom/Matrix");
import Matrix3D						= require("awayjs-core/lib/core/geom/Matrix3D");
import Matrix3DUtils				= require("awayjs-core/lib/core/geom/Matrix3DUtils");
import Camera						= require("awayjs-core/lib/entities/Camera");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");

import MaterialPassData				= require("awayjs-stagegl/lib/core/pool/MaterialPassData");
import RenderableBase				= require("awayjs-stagegl/lib/core/pool/RenderableBase");
import ContextGLCompareMode			= require("awayjs-stagegl/lib/core/stagegl/ContextGLCompareMode");
import ContextGLProgramType			= require("awayjs-stagegl/lib/core/stagegl/ContextGLProgramType");
import IContextStageGL				= require("awayjs-stagegl/lib/core/stagegl/IContextStageGL");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
import ShaderRegisterCache			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
import ShaderRegisterElement		= require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
import StageGLMaterialBase			= require("awayjs-stagegl/lib/materials/StageGLMaterialBase");

/**
 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
 * using material methods to define their appearance.
 */
class TriangleMaterialBase extends StageGLMaterialBase
{
	public _iGetVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var code:string = "";

		//get the projection coordinates
		var position:ShaderRegisterElement = (shaderObject.globalPosDependencies > 0)? sharedRegisters.globalPositionVertex : sharedRegisters.localPosition;

		//reserving vertex constants for projection matrix
		var viewMatrixReg:ShaderRegisterElement = registerCache.getFreeVertexConstant();
		registerCache.getFreeVertexConstant();
		registerCache.getFreeVertexConstant();
		registerCache.getFreeVertexConstant();
		shaderObject.viewMatrixIndex = viewMatrixReg.index*4;

		if (shaderObject.projectionDependencies > 0) {
			sharedRegisters.projectionFragment = registerCache.getFreeVarying();
			var temp:ShaderRegisterElement = registerCache.getFreeVertexVectorTemp();
			code += "m44 " + temp + ", " + position + ", " + viewMatrixReg + "\n" +
				"mov " + sharedRegisters.projectionFragment + ", " + temp + "\n" +
				"mov op, " + temp + "\n";
		} else {
			code += "m44 op, " + position + ", " + viewMatrixReg + "\n";
		}

		return code;
	}

	/**
	 * @inheritDoc
	 */
	public _iRenderPass(pass:MaterialPassData, renderable:RenderableBase, stage:Stage, camera:Camera, viewProjection:Matrix3D)
	{
		super._iRenderPass(pass, renderable, stage, camera, viewProjection);

		var shaderObject:ShaderObjectBase = pass.shaderObject;

		if (shaderObject.sceneMatrixIndex >= 0) {
			renderable.sourceEntity.getRenderSceneTransform(camera).copyRawDataTo(shaderObject.vertexConstantData, shaderObject.sceneMatrixIndex, true);
			viewProjection.copyRawDataTo(shaderObject.vertexConstantData, shaderObject.viewMatrixIndex, true);
		} else {
			var matrix3D:Matrix3D = Matrix3DUtils.CALCULATION_MATRIX;

			matrix3D.copyFrom(renderable.sourceEntity.getRenderSceneTransform(camera));
			matrix3D.append(viewProjection);

			matrix3D.copyRawDataTo(shaderObject.vertexConstantData, shaderObject.viewMatrixIndex, true);
		}

		var context:IContextStageGL = <IContextStageGL> stage.context;

		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 0, shaderObject.vertexConstantData, shaderObject.numUsedVertexConstants);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, shaderObject.fragmentConstantData, shaderObject.numUsedFragmentConstants);

		context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
		context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
	}
}

export = TriangleMaterialBase;