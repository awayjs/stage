import { EventBase } from "@awayjs/core/lib/events/EventBase";
import { Stage } from "../base/Stage";
export declare class StageEvent extends EventBase {
    /**
     *
     */
    static STAGE_ERROR: string;
    /**
     *
     */
    static CONTEXT_CREATED: string;
    /**
     *
     */
    static CONTEXT_DISPOSED: string;
    /**
     *
     */
    static CONTEXT_RECREATED: string;
    /**
     *
     */
    static VIEWPORT_UPDATED: string;
    private _stage;
    /**
     *
     */
    readonly stage: Stage;
    constructor(type: string, stage: Stage);
    /**
     *
     */
    clone(): StageEvent;
}
