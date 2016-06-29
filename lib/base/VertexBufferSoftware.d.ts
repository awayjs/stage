import { IVertexBuffer } from "../base/IVertexBuffer";
export declare class VertexBufferSoftware implements IVertexBuffer {
    private _numVertices;
    private _dataPerVertex;
    private _floatData;
    private _uintData;
    constructor(numVertices: number, dataPerVertex: number);
    uploadFromArray(vertices: number[], startVertex: number, numVertices: number): void;
    uploadFromByteArray(data: ArrayBuffer, startVertex: number, numVertices: number): void;
    readonly numVertices: number;
    readonly dataPerVertex: number;
    readonly attributesPerVertex: number;
    dispose(): void;
    readonly data: Float32Array;
    readonly uintData: Uint8Array;
}
