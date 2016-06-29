import { IVertexBuffer } from "../base/IVertexBuffer";
export declare class VertexBufferWebGL implements IVertexBuffer {
    private _gl;
    private _numVertices;
    private _dataPerVertex;
    private _buffer;
    constructor(gl: WebGLRenderingContext, numVertices: number, dataPerVertex: number);
    uploadFromArray(vertices: number[], startVertex: number, numVertices: number): void;
    uploadFromByteArray(data: ArrayBuffer, startVertex: number, numVertices: number): void;
    readonly numVertices: number;
    readonly dataPerVertex: number;
    readonly glBuffer: WebGLBuffer;
    dispose(): void;
}
