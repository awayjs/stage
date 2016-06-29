export interface IVertexBuffer {
    numVertices: number;
    dataPerVertex: number;
    uploadFromArray(data: number[], startVertex: number, numVertices: number): any;
    uploadFromByteArray(data: ArrayBuffer, startVertex: number, numVertices: number): any;
    dispose(): any;
}
