import { Stage } from "../base/Stage";
import { ProgramData } from "../image/ProgramData";
/**
 * @class away.pool.ProgramDataPool
 */
export declare class ProgramDataPool {
    private _pool;
    private _stage;
    /**
     * //TODO
     *
     * @param textureDataClass
     */
    constructor(stage: Stage);
    /**
     * //TODO
     *
     * @param materialOwner
     * @returns ITexture
     */
    getItem(vertexString: string, fragmentString: string): ProgramData;
    /**
     * //TODO
     *
     * @param materialOwner
     */
    disposeItem(key: string): void;
}
