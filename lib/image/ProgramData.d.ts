import { ProgramDataPool } from "../image/ProgramDataPool";
import { IProgram } from "../base/IProgram";
import { Stage } from "../base/Stage";
/**
 *
 * @class away.pool.ProgramDataBase
 */
export declare class ProgramData {
    static PROGRAMDATA_ID_COUNT: number;
    private _pool;
    vertexString: string;
    fragmentString: string;
    stage: Stage;
    usages: number;
    program: IProgram;
    id: number;
    constructor(pool: ProgramDataPool, context: Stage, vertexString: string, fragmentString: string);
    /**
     *
     */
    dispose(): void;
}
