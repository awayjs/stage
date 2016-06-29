import { Sampler2D } from "@awayjs/core/lib/image/Sampler2D";
import { Stage } from "../base/Stage";
import { GL_SamplerBase } from "../image/GL_SamplerBase";
/**
 *
 * @class away.pool.GL_SamplerBase
 */
export declare class GL_Sampler2D extends GL_SamplerBase {
    _sampler: Sampler2D;
    constructor(sampler: Sampler2D, stage: Stage);
    activate(index: number): void;
}
