import { SamplerCube } from "@awayjs/core/lib/image/SamplerCube";
import { Stage } from "../base/Stage";
import { GL_SamplerBase } from "../image/GL_SamplerBase";
/**
 *
 * @class away.pool.GL_SamplerBase
 */
export declare class GL_SamplerCube extends GL_SamplerBase {
    _sampler: SamplerCube;
    constructor(sampler: SamplerCube, stage: Stage);
    activate(index: number): void;
}
