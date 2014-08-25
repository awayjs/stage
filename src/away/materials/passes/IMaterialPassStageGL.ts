///<reference path="../../_definitions.ts"/>

module away.materials
{
	export interface IMaterialPassStageGL extends IMaterialPass
	{
		_iGetPreLightingVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		_iGetPreLightingFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		_iGetVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		_iGetFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		_iGetNormalVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		_iGetNormalFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

		forceSeparateMVP:boolean;

		passMode:number;

		_iInitConstantData(shaderObject:ShaderObjectBase);

		_iIncludeDependencies(shaderObject:ShaderObjectBase);

		/**
		 * Factory method to create a concrete shader object for this pass.
		 *
		 * @param profile The compatibility profile used by the renderer.
		 */
		createShaderObject(profile:string):ShaderObjectBase;
	}
}