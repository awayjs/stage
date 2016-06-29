import { ContextStage3D } from "../base/ContextStage3D";
import { IIndexBuffer } from "../base/IIndexBuffer";
import { ResourceBaseFlash } from "../base/ResourceBaseFlash";
export declare class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer {
    private _context;
    private _numIndices;
    constructor(context: ContextStage3D, numIndices: number);
    uploadFromArray(data: number[], startOffset: number, count: number): void;
    uploadFromByteArray(data: ArrayBuffer, startOffset: number, count: number): void;
    dispose(): void;
    readonly numIndices: number;
}
