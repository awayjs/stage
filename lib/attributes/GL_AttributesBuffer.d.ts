import { AttributesBuffer } from "@awayjs/core/lib/attributes/AttributesBuffer";
import { AssetEvent } from "@awayjs/core/lib/events/AssetEvent";
import { AbstractionBase } from "@awayjs/core/lib/library/AbstractionBase";
import { Stage } from "../base/Stage";
import { IIndexBuffer } from "../base/IIndexBuffer";
import { IVertexBuffer } from "../base/IVertexBuffer";
/**
 *
 * @class away.pool.GL_AttributesBuffer
 */
export declare class GL_AttributesBuffer extends AbstractionBase {
    _indexBuffer: IIndexBuffer;
    _vertexBuffer: IVertexBuffer;
    _stage: Stage;
    _attributesBuffer: AttributesBuffer;
    _mipmap: boolean;
    _invalid: boolean;
    constructor(attributesBuffer: AttributesBuffer, stage: Stage);
    /**
     *
     */
    onClear(event: AssetEvent): void;
    activate(index: number, size: number, dimensions: number, offset: number, unsigned?: boolean): void;
    draw(mode: string, firstIndex: number, numIndices: number): void;
    _getIndexBuffer(): IIndexBuffer;
    _getVertexBuffer(): IVertexBuffer;
}
