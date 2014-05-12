///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	export interface IIndexBuffer
	{
		numIndices:number;

		uploadFromArray(data:number[], startOffset:number, count:number);

		dispose();
	}
}