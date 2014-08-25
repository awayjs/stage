///<reference path="../_definitions.ts"/>

module away.materials
{
	export class StageGLMaterialBase extends MaterialBase
	{
		public _iGetVertexCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			return "";
		}

		public _iGetFragmentCode(shaderObject:ShaderObjectBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
		{
			return "";
		}
	}
}