import { ContextStage3D } from "../base/ContextStage3D";
import { IVertexBuffer } from "../base/IVertexBuffer";
import { ResourceBaseFlash } from "../base/ResourceBaseFlash";
export declare class VertexBufferFlash extends ResourceBaseFlash implements IVertexBuffer {
    private _context;
    private _numVertices;
    private _dataPerVertex;
    constructor(context: ContextStage3D, numVertices: number, dataPerVertex: number);
    uploadFromArray(data: number[], startVertex: number, numVertices: number): void;
    uploadFromByteArray(data: ArrayBuffer, startVertex: number, numVertices: number): void;
    readonly numVertices: number;
    readonly dataPerVertex: number;
    dispose(): void;
}
