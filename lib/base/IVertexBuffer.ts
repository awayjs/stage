export interface IVertexBuffer
{
	numVertices:number;

	dataPerVertex:number;

	uploadFromArray(array:Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array, startVertex:number, numVertices:number);

	uploadFromByteArray(data:ArrayBuffer, startVertex:number, numVertices:number);

	dispose();
}