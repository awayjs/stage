import { IIndexBuffer } from "../base/IIndexBuffer";
export declare class IndexBufferSoftware implements IIndexBuffer {
    private _numIndices;
    private _data;
    private _startOffset;
    constructor(numIndices: number);
    uploadFromArray(data: number[], startOffset: number, count: number): void;
    uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number): void;
    dispose(): void;
    readonly numIndices: number;
    readonly data: Uint16Array;
    readonly startOffset: number;
}
