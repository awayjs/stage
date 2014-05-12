///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import ByteArray				= away.utils.ByteArray;

	export interface IProgram
	{
		upload(vertexProgram:ByteArray, fragmentProgram:ByteArray);

		dispose();
	}
}