export interface IIndexBuffer {
    numIndices: number;
    uploadFromArray(data: number[], startOffset: number, count: number): any;
    uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number): any;
    dispose(): any;
}
