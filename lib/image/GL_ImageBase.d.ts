import { AssetEvent } from "@awayjs/core/lib/events/AssetEvent";
import { IAsset } from "@awayjs/core/lib/library/IAsset";
import { AbstractionBase } from "@awayjs/core/lib/library/AbstractionBase";
import { Stage } from "../base/Stage";
import { ITextureBase } from "../base/ITextureBase";
/**
 *
 * @class away.pool.GL_ImageBase
 */
export declare class GL_ImageBase extends AbstractionBase {
    usages: number;
    _texture: ITextureBase;
    _mipmap: boolean;
    _stage: Stage;
    readonly texture: ITextureBase;
    constructor(asset: IAsset, stage: Stage);
    /**
     *
     */
    onClear(event: AssetEvent): void;
    activate(index: number, mipmap: boolean): void;
    _createTexture(): void;
}
