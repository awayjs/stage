import { IAsset } from "@awayjs/core/lib/library/IAsset";
import { AbstractionBase } from "@awayjs/core/lib/library/AbstractionBase";
import { Stage } from "../base/Stage";
/**
 *
 * @class away.pool.GL_SamplerBase
 */
export declare class GL_SamplerBase extends AbstractionBase {
    _stage: Stage;
    constructor(asset: IAsset, stage: Stage);
    activate(index: number): void;
}
