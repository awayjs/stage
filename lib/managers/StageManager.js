var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Stage = require("awayjs-stagegl/lib/core/base/Stage");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var StageEvent = require("awayjs-core/lib/events/StageEvent");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
/**
 * The StageManager class provides a multiton object that handles management for Stage objects.
 *
 * @see away.base.Stage
 */
var StageManager = (function (_super) {
    __extends(StageManager, _super);
    /**
     * Creates a new StageManager class.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @private
     */
    function StageManager() {
        var _this = this;
        _super.call(this);
        this._stages = new Array(StageManager.STAGE_MAX_QUANTITY);
        this._onContextCreatedDelegate = function (event) { return _this.onContextCreated(event); };
    }
    /**
     * Gets a StageManager instance for the given Stage object.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @return The StageManager instance for the given Stage object.
     */
    StageManager.getInstance = function () {
        if (this._instance == null)
            this._instance = new StageManager();
        return this._instance;
    };
    /**
     * Requests the Stage for the given index.
     *
     * @param index The index of the requested Stage.
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The Stage for the given index.
     */
    StageManager.prototype.getStageAt = function (index, forceSoftware, profile, mode) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        if (index < 0 || index >= StageManager.STAGE_MAX_QUANTITY)
            throw new ArgumentError("Index is out of bounds [0.." + StageManager.STAGE_MAX_QUANTITY + "]");
        if (!this._stages[index]) {
            StageManager._numStages++;
            var canvas = document.createElement("canvas");
            canvas.id = "stage" + index;
            document.body.appendChild(canvas);
            var stage = this._stages[index] = new Stage(canvas, index, this, forceSoftware, profile);
            stage.addEventListener(StageEvent.CONTEXT_CREATED, this._onContextCreatedDelegate);
            stage.requestContext(forceSoftware, profile, mode);
        }
        return stage;
    };
    /**
     * Removes a Stage from the manager.
     * @param stage
     * @private
     */
    StageManager.prototype.iRemoveStage = function (stage) {
        StageManager._numStages--;
        stage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextCreatedDelegate);
        this._stages[stage.stageIndex] = null;
    };
    /**
     * Get the next available stage. An error is thrown if there are no StageProxies available
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The allocated stage
     */
    StageManager.prototype.getFreeStage = function (forceSoftware, profile, mode) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        var i = 0;
        var len = this._stages.length;
        while (i < len) {
            if (!this._stages[i])
                return this.getStageAt(i, forceSoftware, profile, mode);
            ++i;
        }
        return null;
    };
    Object.defineProperty(StageManager.prototype, "hasFreeStage", {
        /**
         * Checks if a new stage can be created and managed by the class.
         * @return true if there is one slot free for a new stage
         */
        get: function () {
            return StageManager._numStages < StageManager.STAGE_MAX_QUANTITY ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsFree", {
        /**
         * Returns the amount of stage objects that can be created and managed by the class
         * @return the amount of free slots
         */
        get: function () {
            return StageManager.STAGE_MAX_QUANTITY - StageManager._numStages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsUsed", {
        /**
         * Returns the amount of Stage objects currently managed by the class.
         * @return the amount of slots used
         */
        get: function () {
            return StageManager._numStages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsTotal", {
        /**
         * The maximum amount of Stage objects that can be managed by the class
         */
        get: function () {
            return this._stages.length;
        },
        enumerable: true,
        configurable: true
    });
    StageManager.prototype.onContextCreated = function (event) {
        //var stage:Stage = <Stage> e.target;
        //document.body.appendChild(stage.canvas)
    };
    StageManager.STAGE_MAX_QUANTITY = 8;
    StageManager._numStages = 0;
    return StageManager;
})(EventDispatcher);
module.exports = StageManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hbmFnZXJzL3N0YWdlbWFuYWdlci50cyJdLCJuYW1lcyI6WyJTdGFnZU1hbmFnZXIiLCJTdGFnZU1hbmFnZXIuY29uc3RydWN0b3IiLCJTdGFnZU1hbmFnZXIuZ2V0SW5zdGFuY2UiLCJTdGFnZU1hbmFnZXIuZ2V0U3RhZ2VBdCIsIlN0YWdlTWFuYWdlci5pUmVtb3ZlU3RhZ2UiLCJTdGFnZU1hbmFnZXIuZ2V0RnJlZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmhhc0ZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5udW1TbG90c0ZyZWUiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNVc2VkIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVG90YWwiLCJTdGFnZU1hbmFnZXIub25Db250ZXh0Q3JlYXRlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxLQUFLLFdBQWdCLG9DQUFvQyxDQUFDLENBQUM7QUFDbEUsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUM5RSxJQUFPLFVBQVUsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU8sYUFBYSxXQUFjLHNDQUFzQyxDQUFDLENBQUM7QUFFMUUsQUFLQTs7OztHQURHO0lBQ0csWUFBWTtJQUFTQSxVQUFyQkEsWUFBWUEsVUFBd0JBO0lBU3pDQTs7OztPQUlHQTtJQUNIQSxTQWRLQSxZQUFZQTtRQUFsQkMsaUJBMElDQTtRQTFIQ0EsaUJBQU9BLENBQUNBO1FBRVJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLEtBQUtBLENBQVFBLFlBQVlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7UUFFakVBLElBQUlBLENBQUNBLHlCQUF5QkEsR0FBR0EsVUFBQ0EsS0FBV0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUE1QkEsQ0FBNEJBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVERDs7OztPQUlHQTtJQUNXQSx3QkFBV0EsR0FBekJBO1FBRUNFLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLElBQUlBLElBQUlBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxZQUFZQSxFQUFFQSxDQUFDQTtRQUVyQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7SUFDdkJBLENBQUNBO0lBRURGOzs7Ozs7O09BT0dBO0lBQ0lBLGlDQUFVQSxHQUFqQkEsVUFBa0JBLEtBQVlBLEVBQUVBLGFBQTZCQSxFQUFFQSxPQUEyQkEsRUFBRUEsSUFBb0JBO1FBQWhGRyw2QkFBNkJBLEdBQTdCQSxxQkFBNkJBO1FBQUVBLHVCQUEyQkEsR0FBM0JBLG9CQUEyQkE7UUFBRUEsb0JBQW9CQSxHQUFwQkEsYUFBb0JBO1FBRS9HQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBO1lBQ3pEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSw2QkFBNkJBLEdBQUdBLFlBQVlBLENBQUNBLGtCQUFrQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFaEdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxZQUFZQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtZQUUxQkEsSUFBSUEsTUFBTUEsR0FBcUJBLFFBQVFBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1lBQ2hFQSxNQUFNQSxDQUFDQSxFQUFFQSxHQUFHQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUM1QkEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDbENBLElBQUlBLEtBQUtBLEdBQVNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLElBQUlBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1lBQy9GQSxLQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLENBQUNBLGVBQWVBLEVBQUVBLElBQUlBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsQ0FBQ0E7WUFDbkZBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLGFBQWFBLEVBQUVBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BEQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVESDs7OztPQUlHQTtJQUNJQSxtQ0FBWUEsR0FBbkJBLFVBQW9CQSxLQUFXQTtRQUU5QkksWUFBWUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFFMUJBLEtBQUtBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsZUFBZUEsRUFBRUEsSUFBSUEsQ0FBQ0EseUJBQXlCQSxDQUFDQSxDQUFDQTtRQUV0RkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBRURKOzs7OztPQUtHQTtJQUNJQSxtQ0FBWUEsR0FBbkJBLFVBQW9CQSxhQUE2QkEsRUFBRUEsT0FBMkJBLEVBQUVBLElBQW9CQTtRQUFoRkssNkJBQTZCQSxHQUE3QkEscUJBQTZCQTtRQUFFQSx1QkFBMkJBLEdBQTNCQSxvQkFBMkJBO1FBQUVBLG9CQUFvQkEsR0FBcEJBLGFBQW9CQTtRQUVuR0EsSUFBSUEsQ0FBQ0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFDakJBLElBQUlBLEdBQUdBLEdBQVVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBO1FBRXJDQSxPQUFPQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNoQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxFQUFFQSxhQUFhQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUV6REEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDTEEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFNREwsc0JBQVdBLHNDQUFZQTtRQUp2QkE7OztXQUdHQTthQUNIQTtZQUVDTSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxVQUFVQSxHQUFHQSxZQUFZQSxDQUFDQSxrQkFBa0JBLEdBQUVBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2hGQSxDQUFDQTs7O09BQUFOO0lBTURBLHNCQUFXQSxzQ0FBWUE7UUFKdkJBOzs7V0FHR0E7YUFDSEE7WUFFQ08sTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxZQUFZQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUNsRUEsQ0FBQ0E7OztPQUFBUDtJQU1EQSxzQkFBV0Esc0NBQVlBO1FBSnZCQTs7O1dBR0dBO2FBQ0hBO1lBRUNRLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLFVBQVVBLENBQUNBO1FBQ2hDQSxDQUFDQTs7O09BQUFSO0lBS0RBLHNCQUFXQSx1Q0FBYUE7UUFIeEJBOztXQUVHQTthQUNIQTtZQUVDUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7OztPQUFBVDtJQUVPQSx1Q0FBZ0JBLEdBQXhCQSxVQUF5QkEsS0FBV0E7UUFFbkNVLHFDQUFxQ0E7UUFDckNBLHlDQUF5Q0E7SUFDMUNBLENBQUNBO0lBdkljViwrQkFBa0JBLEdBQVVBLENBQUNBLENBQUNBO0lBSTlCQSx1QkFBVUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7SUFvSXRDQSxtQkFBQ0E7QUFBREEsQ0ExSUEsQUEwSUNBLEVBMUkwQixlQUFlLEVBMEl6QztBQUVELEFBQXNCLGlCQUFiLFlBQVksQ0FBQyIsImZpbGUiOiJtYW5hZ2Vycy9TdGFnZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JvYmJhdGVtYW4vV2Vic3Rvcm1Qcm9qZWN0cy9hd2F5anMtc3RhZ2VnbC8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XG5pbXBvcnQgQXJndW1lbnRFcnJvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9Bcmd1bWVudEVycm9yXCIpO1xuXG4vKipcbiAqIFRoZSBTdGFnZU1hbmFnZXIgY2xhc3MgcHJvdmlkZXMgYSBtdWx0aXRvbiBvYmplY3QgdGhhdCBoYW5kbGVzIG1hbmFnZW1lbnQgZm9yIFN0YWdlIG9iamVjdHMuXG4gKlxuICogQHNlZSBhd2F5LmJhc2UuU3RhZ2VcbiAqL1xuY2xhc3MgU3RhZ2VNYW5hZ2VyIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXG57XG5cdHByaXZhdGUgc3RhdGljIFNUQUdFX01BWF9RVUFOVElUWTpudW1iZXIgPSA4O1xuXHRwcml2YXRlIF9zdGFnZXM6QXJyYXk8U3RhZ2U+O1xuXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpTdGFnZU1hbmFnZXI7XG5cdHByaXZhdGUgc3RhdGljIF9udW1TdGFnZXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlOihldmVudDpFdmVudCkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBTdGFnZU1hbmFnZXIgY2xhc3MuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIFN0YWdlIG9iamVjdHMgdG8gYmUgbWFuYWdlZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9zdGFnZXMgPSBuZXcgQXJyYXk8U3RhZ2U+KFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpO1xuXG5cdFx0dGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLm9uQ29udGV4dENyZWF0ZWQoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBTdGFnZU1hbmFnZXIgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBTdGFnZSBvYmplY3QuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIFN0YWdlIG9iamVjdHMgdG8gYmUgbWFuYWdlZC5cblx0ICogQHJldHVybiBUaGUgU3RhZ2VNYW5hZ2VyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gU3RhZ2Ugb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOlN0YWdlTWFuYWdlclxuXHR7XG5cdFx0aWYgKHRoaXMuX2luc3RhbmNlID09IG51bGwpXG5cdFx0XHR0aGlzLl9pbnN0YW5jZSA9IG5ldyBTdGFnZU1hbmFnZXIoKTtcblxuXHRcdHJldHVybiB0aGlzLl9pbnN0YW5jZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cblx0ICpcblx0ICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgcmVxdWVzdGVkIFN0YWdlLlxuXHQgKiBAcGFyYW0gZm9yY2VTb2Z0d2FyZSBXaGV0aGVyIHRvIGZvcmNlIHNvZnR3YXJlIG1vZGUgZXZlbiBpZiBoYXJkd2FyZSBhY2NlbGVyYXRpb24gaXMgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gcHJvZmlsZSBUaGUgY29tcGF0aWJpbGl0eSBwcm9maWxlLCBhbiBlbnVtZXJhdGlvbiBvZiBDb250ZXh0UHJvZmlsZVxuXHQgKiBAcmV0dXJuIFRoZSBTdGFnZSBmb3IgdGhlIGdpdmVuIGluZGV4LlxuXHQgKi9cblx0cHVibGljIGdldFN0YWdlQXQoaW5kZXg6bnVtYmVyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpOlN0YWdlXG5cdHtcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpXG5cdFx0XHR0aHJvdyBuZXcgQXJndW1lbnRFcnJvcihcIkluZGV4IGlzIG91dCBvZiBib3VuZHMgWzAuLlwiICsgU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSArIFwiXVwiKTtcblxuXHRcdGlmICghdGhpcy5fc3RhZ2VzW2luZGV4XSkge1xuXHRcdFx0U3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMrKztcblxuXHRcdFx0dmFyIGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjYW52YXMuaWQgPSBcInN0YWdlXCIgKyBpbmRleDtcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblx0XHRcdHZhciBzdGFnZTpTdGFnZSA9IHRoaXMuX3N0YWdlc1tpbmRleF0gPSBuZXcgU3RhZ2UoY2FudmFzLCBpbmRleCwgdGhpcywgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSk7XG5cdFx0XHRzdGFnZS5hZGRFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVELCB0aGlzLl9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGUpO1xuXHRcdFx0c3RhZ2UucmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0YWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBTdGFnZSBmcm9tIHRoZSBtYW5hZ2VyLlxuXHQgKiBAcGFyYW0gc3RhZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBpUmVtb3ZlU3RhZ2Uoc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHRTdGFnZU1hbmFnZXIuX251bVN0YWdlcy0tO1xuXG5cdFx0c3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcblxuXHRcdHRoaXMuX3N0YWdlc1tzdGFnZS5zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBuZXh0IGF2YWlsYWJsZSBzdGFnZS4gQW4gZXJyb3IgaXMgdGhyb3duIGlmIHRoZXJlIGFyZSBubyBTdGFnZVByb3hpZXMgYXZhaWxhYmxlXG5cdCAqIEBwYXJhbSBmb3JjZVNvZnR3YXJlIFdoZXRoZXIgdG8gZm9yY2Ugc29mdHdhcmUgbW9kZSBldmVuIGlmIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpcyBhdmFpbGFibGUuXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUsIGFuIGVudW1lcmF0aW9uIG9mIENvbnRleHRQcm9maWxlXG5cdCAqIEByZXR1cm4gVGhlIGFsbG9jYXRlZCBzdGFnZVxuXHQgKi9cblx0cHVibGljIGdldEZyZWVTdGFnZShmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpOlN0YWdlXG5cdHtcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fc3RhZ2VzLmxlbmd0aDtcblxuXHRcdHdoaWxlIChpIDwgbGVuKSB7XG5cdFx0XHRpZiAoIXRoaXMuX3N0YWdlc1tpXSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhZ2VBdChpLCBmb3JjZVNvZnR3YXJlLCBwcm9maWxlLCBtb2RlKTtcblxuXHRcdFx0KytpO1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIG5ldyBzdGFnZSBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3MuXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGVyZSBpcyBvbmUgc2xvdCBmcmVlIGZvciBhIG5ldyBzdGFnZVxuXHQgKi9cblx0cHVibGljIGdldCBoYXNGcmVlU3RhZ2UoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMgPCBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZPyB0cnVlIDogZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW1vdW50IG9mIHN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3Ncblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIGZyZWUgc2xvdHNcblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNGcmVlKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSAtIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIGN1cnJlbnRseSBtYW5hZ2VkIGJ5IHRoZSBjbGFzcy5cblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIHNsb3RzIHVzZWRcblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNVc2VkKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1heGltdW0gYW1vdW50IG9mIFN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgbWFuYWdlZCBieSB0aGUgY2xhc3Ncblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNUb3RhbCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlcy5sZW5ndGg7XG5cdH1cblxuXHRwcml2YXRlIG9uQ29udGV4dENyZWF0ZWQoZXZlbnQ6RXZlbnQpOnZvaWRcblx0e1xuXHRcdC8vdmFyIHN0YWdlOlN0YWdlID0gPFN0YWdlPiBlLnRhcmdldDtcblx0XHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhZ2UuY2FudmFzKVxuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlTWFuYWdlcjsiXX0=