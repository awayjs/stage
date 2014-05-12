///<reference path="../../_definitions.ts"/>

module away.stagegl
{

	export interface IVertexBuffer
	{
		numVertices:number;

		data32PerVertex:number;

		uploadFromArray(data:number[], startVertex:number, numVertices:number);

		dispose();
	}
}