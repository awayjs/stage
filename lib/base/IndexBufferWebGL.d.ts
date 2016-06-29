import { IIndexBuffer } from "../base/IIndexBuffer";
export declare class IndexBufferWebGL implements IIndexBuffer {
    private _gl;
    private _numIndices;
    private _buffer;
    constructor(gl: WebGLRenderingContext, numIndices: number);
    uploadFromArray(data: number[], startOffset: number, count: number): void;
    uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number): void;
    dispose(): void;
    readonly numIndices: number;
    readonly glBuffer: WebGLBuffer;
}
