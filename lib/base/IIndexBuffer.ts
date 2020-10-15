export interface IIndexBuffer
{
	numIndices: number;

	uploadFromArray(array: Uint16Array, startOffset: number, count: number);

	uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number);

	dispose();
}