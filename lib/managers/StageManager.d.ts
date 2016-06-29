import { EventDispatcher } from "@awayjs/core/lib/events/EventDispatcher";
import { Stage } from "../base/Stage";
/**
 * The StageManager class provides a multiton object that handles management for Stage objects.
 *
 * @see away.base.Stage
 */
export declare class StageManager extends EventDispatcher {
    private static STAGE_MAX_QUANTITY;
    private _stages;
    private static _instance;
    private static _numStages;
    private _onContextCreatedDelegate;
    /**
     * Creates a new StageManager class.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @private
     */
    constructor();
    /**
     * Gets a StageManager instance for the given Stage object.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @return The StageManager instance for the given Stage object.
     */
    static getInstance(): StageManager;
    /**
     * Requests the Stage for the given index.
     *
     * @param index The index of the requested Stage.
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The Stage for the given index.
     */
    getStageAt(index: number, forceSoftware?: boolean, profile?: string, mode?: string): Stage;
    /**
     * Removes a Stage from the manager.
     * @param stage
     * @private
     */
    iRemoveStage(stage: Stage): void;
    /**
     * Get the next available stage. An error is thrown if there are no StageProxies available
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The allocated stage
     */
    getFreeStage(forceSoftware?: boolean, profile?: string, mode?: string): Stage;
    /**
     * Checks if a new stage can be created and managed by the class.
     * @return true if there is one slot free for a new stage
     */
    readonly hasFreeStage: boolean;
    /**
     * Returns the amount of stage objects that can be created and managed by the class
     * @return the amount of free slots
     */
    readonly numSlotsFree: number;
    /**
     * Returns the amount of Stage objects currently managed by the class.
     * @return the amount of slots used
     */
    readonly numSlotsUsed: number;
    /**
     * The maximum amount of Stage objects that can be managed by the class
     */
    readonly numSlotsTotal: number;
    private onContextCreated(event);
}
