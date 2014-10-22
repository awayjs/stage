interface IIndexBuffer
{
	numIndices:number;

	uploadFromArray(data:number[], startOffset:number, count:number);

	dispose();
}

export = IIndexBuffer;