var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var StageEvent = require("awayjs-display/lib/events/StageEvent");
var Stage = require("awayjs-stagegl/lib/core/base/Stage");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9zdGFnZW1hbmFnZXIudHMiXSwibmFtZXMiOlsiU3RhZ2VNYW5hZ2VyIiwiU3RhZ2VNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiU3RhZ2VNYW5hZ2VyLmdldEluc3RhbmNlIiwiU3RhZ2VNYW5hZ2VyLmdldFN0YWdlQXQiLCJTdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmdldEZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5oYXNGcmVlU3RhZ2UiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNGcmVlIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVXNlZCIsIlN0YWdlTWFuYWdlci5udW1TbG90c1RvdGFsIiwiU3RhZ2VNYW5hZ2VyLm9uQ29udGV4dENyZWF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sZUFBZSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDOUUsSUFBTyxhQUFhLFdBQWMsc0NBQXNDLENBQUMsQ0FBQztBQUUxRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLElBQU8sS0FBSyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBRWxFLEFBS0E7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQVN6Q0E7Ozs7T0FJR0E7SUFDSEEsU0FkS0EsWUFBWUE7UUFBbEJDLGlCQTBJQ0E7UUExSENBLGlCQUFPQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFRQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBNUJBLENBQTRCQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQ7Ozs7T0FJR0E7SUFDV0Esd0JBQVdBLEdBQXpCQTtRQUVDRSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFFckNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO0lBQ3ZCQSxDQUFDQTtJQUVERjs7Ozs7OztPQU9HQTtJQUNJQSxpQ0FBVUEsR0FBakJBLFVBQWtCQSxLQUFZQSxFQUFFQSxhQUE2QkEsRUFBRUEsT0FBMkJBLEVBQUVBLElBQW9CQTtRQUFoRkcsNkJBQTZCQSxHQUE3QkEscUJBQTZCQTtRQUFFQSx1QkFBMkJBLEdBQTNCQSxvQkFBMkJBO1FBQUVBLG9CQUFvQkEsR0FBcEJBLGFBQW9CQTtRQUUvR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsWUFBWUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQTtZQUN6REEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EsNkJBQTZCQSxHQUFHQSxZQUFZQSxDQUFDQSxrQkFBa0JBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO1FBRWhHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsWUFBWUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFFMUJBLElBQUlBLE1BQU1BLEdBQXFCQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUNoRUEsTUFBTUEsQ0FBQ0EsRUFBRUEsR0FBR0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ2xDQSxJQUFJQSxLQUFLQSxHQUFTQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxhQUFhQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUMvRkEsS0FBS0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLENBQUNBLENBQUNBO1lBQ25GQSxLQUFLQSxDQUFDQSxjQUFjQSxDQUFDQSxhQUFhQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREg7Ozs7T0FJR0E7SUFDSUEsbUNBQVlBLEdBQW5CQSxVQUFvQkEsS0FBV0E7UUFFOUJJLFlBQVlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBRTFCQSxLQUFLQSxDQUFDQSxtQkFBbUJBLENBQUNBLFVBQVVBLENBQUNBLGVBQWVBLEVBQUVBLElBQUlBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsQ0FBQ0E7UUFFdEZBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3ZDQSxDQUFDQTtJQUVESjs7Ozs7T0FLR0E7SUFDSUEsbUNBQVlBLEdBQW5CQSxVQUFvQkEsYUFBNkJBLEVBQUVBLE9BQTJCQSxFQUFFQSxJQUFvQkE7UUFBaEZLLDZCQUE2QkEsR0FBN0JBLHFCQUE2QkE7UUFBRUEsdUJBQTJCQSxHQUEzQkEsb0JBQTJCQTtRQUFFQSxvQkFBb0JBLEdBQXBCQSxhQUFvQkE7UUFFbkdBLElBQUlBLENBQUNBLEdBQVVBLENBQUNBLENBQUNBO1FBQ2pCQSxJQUFJQSxHQUFHQSxHQUFVQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUVyQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDaEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFFekRBLEVBQUVBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2JBLENBQUNBO0lBTURMLHNCQUFXQSxzQ0FBWUE7UUFKdkJBOzs7V0FHR0E7YUFDSEE7WUFFQ00sTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsVUFBVUEsR0FBR0EsWUFBWUEsQ0FBQ0Esa0JBQWtCQSxHQUFFQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNoRkEsQ0FBQ0E7OztPQUFBTjtJQU1EQSxzQkFBV0Esc0NBQVlBO1FBSnZCQTs7O1dBR0dBO2FBQ0hBO1lBRUNPLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLGtCQUFrQkEsR0FBR0EsWUFBWUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDbEVBLENBQUNBOzs7T0FBQVA7SUFNREEsc0JBQVdBLHNDQUFZQTtRQUp2QkE7OztXQUdHQTthQUNIQTtZQUVDUSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUNoQ0EsQ0FBQ0E7OztPQUFBUjtJQUtEQSxzQkFBV0EsdUNBQWFBO1FBSHhCQTs7V0FFR0E7YUFDSEE7WUFFQ1MsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDNUJBLENBQUNBOzs7T0FBQVQ7SUFFT0EsdUNBQWdCQSxHQUF4QkEsVUFBeUJBLEtBQVdBO1FBRW5DVSxxQ0FBcUNBO1FBQ3JDQSx5Q0FBeUNBO0lBQzFDQSxDQUFDQTtJQXZJY1YsK0JBQWtCQSxHQUFVQSxDQUFDQSxDQUFDQTtJQUk5QkEsdUJBQVVBLEdBQVVBLENBQUNBLENBQUNBO0lBb0l0Q0EsbUJBQUNBO0FBQURBLENBMUlBLEFBMElDQSxFQTFJMEIsZUFBZSxFQTBJekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEFyZ3VtZW50RXJyb3JcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQXJndW1lbnRFcnJvclwiKTtcblxuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9TdGFnZUV2ZW50XCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuXG4vKipcbiAqIFRoZSBTdGFnZU1hbmFnZXIgY2xhc3MgcHJvdmlkZXMgYSBtdWx0aXRvbiBvYmplY3QgdGhhdCBoYW5kbGVzIG1hbmFnZW1lbnQgZm9yIFN0YWdlIG9iamVjdHMuXG4gKlxuICogQHNlZSBhd2F5LmJhc2UuU3RhZ2VcbiAqL1xuY2xhc3MgU3RhZ2VNYW5hZ2VyIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXG57XG5cdHByaXZhdGUgc3RhdGljIFNUQUdFX01BWF9RVUFOVElUWTpudW1iZXIgPSA4O1xuXHRwcml2YXRlIF9zdGFnZXM6QXJyYXk8U3RhZ2U+O1xuXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpTdGFnZU1hbmFnZXI7XG5cdHByaXZhdGUgc3RhdGljIF9udW1TdGFnZXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlOihldmVudDpFdmVudCkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBTdGFnZU1hbmFnZXIgY2xhc3MuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIFN0YWdlIG9iamVjdHMgdG8gYmUgbWFuYWdlZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9zdGFnZXMgPSBuZXcgQXJyYXk8U3RhZ2U+KFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpO1xuXG5cdFx0dGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLm9uQ29udGV4dENyZWF0ZWQoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBTdGFnZU1hbmFnZXIgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBTdGFnZSBvYmplY3QuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIFN0YWdlIG9iamVjdHMgdG8gYmUgbWFuYWdlZC5cblx0ICogQHJldHVybiBUaGUgU3RhZ2VNYW5hZ2VyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gU3RhZ2Ugb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOlN0YWdlTWFuYWdlclxuXHR7XG5cdFx0aWYgKHRoaXMuX2luc3RhbmNlID09IG51bGwpXG5cdFx0XHR0aGlzLl9pbnN0YW5jZSA9IG5ldyBTdGFnZU1hbmFnZXIoKTtcblxuXHRcdHJldHVybiB0aGlzLl9pbnN0YW5jZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cblx0ICpcblx0ICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgcmVxdWVzdGVkIFN0YWdlLlxuXHQgKiBAcGFyYW0gZm9yY2VTb2Z0d2FyZSBXaGV0aGVyIHRvIGZvcmNlIHNvZnR3YXJlIG1vZGUgZXZlbiBpZiBoYXJkd2FyZSBhY2NlbGVyYXRpb24gaXMgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gcHJvZmlsZSBUaGUgY29tcGF0aWJpbGl0eSBwcm9maWxlLCBhbiBlbnVtZXJhdGlvbiBvZiBDb250ZXh0UHJvZmlsZVxuXHQgKiBAcmV0dXJuIFRoZSBTdGFnZSBmb3IgdGhlIGdpdmVuIGluZGV4LlxuXHQgKi9cblx0cHVibGljIGdldFN0YWdlQXQoaW5kZXg6bnVtYmVyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpOlN0YWdlXG5cdHtcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpXG5cdFx0XHR0aHJvdyBuZXcgQXJndW1lbnRFcnJvcihcIkluZGV4IGlzIG91dCBvZiBib3VuZHMgWzAuLlwiICsgU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSArIFwiXVwiKTtcblxuXHRcdGlmICghdGhpcy5fc3RhZ2VzW2luZGV4XSkge1xuXHRcdFx0U3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMrKztcblxuXHRcdFx0dmFyIGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHRjYW52YXMuaWQgPSBcInN0YWdlXCIgKyBpbmRleDtcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblx0XHRcdHZhciBzdGFnZTpTdGFnZSA9IHRoaXMuX3N0YWdlc1tpbmRleF0gPSBuZXcgU3RhZ2UoY2FudmFzLCBpbmRleCwgdGhpcywgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSk7XG5cdFx0XHRzdGFnZS5hZGRFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVELCB0aGlzLl9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGUpO1xuXHRcdFx0c3RhZ2UucmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0YWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBTdGFnZSBmcm9tIHRoZSBtYW5hZ2VyLlxuXHQgKiBAcGFyYW0gc3RhZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBpUmVtb3ZlU3RhZ2Uoc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHRTdGFnZU1hbmFnZXIuX251bVN0YWdlcy0tO1xuXG5cdFx0c3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcblxuXHRcdHRoaXMuX3N0YWdlc1tzdGFnZS5zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBuZXh0IGF2YWlsYWJsZSBzdGFnZS4gQW4gZXJyb3IgaXMgdGhyb3duIGlmIHRoZXJlIGFyZSBubyBTdGFnZVByb3hpZXMgYXZhaWxhYmxlXG5cdCAqIEBwYXJhbSBmb3JjZVNvZnR3YXJlIFdoZXRoZXIgdG8gZm9yY2Ugc29mdHdhcmUgbW9kZSBldmVuIGlmIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpcyBhdmFpbGFibGUuXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUsIGFuIGVudW1lcmF0aW9uIG9mIENvbnRleHRQcm9maWxlXG5cdCAqIEByZXR1cm4gVGhlIGFsbG9jYXRlZCBzdGFnZVxuXHQgKi9cblx0cHVibGljIGdldEZyZWVTdGFnZShmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpOlN0YWdlXG5cdHtcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fc3RhZ2VzLmxlbmd0aDtcblxuXHRcdHdoaWxlIChpIDwgbGVuKSB7XG5cdFx0XHRpZiAoIXRoaXMuX3N0YWdlc1tpXSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhZ2VBdChpLCBmb3JjZVNvZnR3YXJlLCBwcm9maWxlLCBtb2RlKTtcblxuXHRcdFx0KytpO1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIG5ldyBzdGFnZSBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3MuXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGVyZSBpcyBvbmUgc2xvdCBmcmVlIGZvciBhIG5ldyBzdGFnZVxuXHQgKi9cblx0cHVibGljIGdldCBoYXNGcmVlU3RhZ2UoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMgPCBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZPyB0cnVlIDogZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW1vdW50IG9mIHN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3Ncblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIGZyZWUgc2xvdHNcblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNGcmVlKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSAtIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIGN1cnJlbnRseSBtYW5hZ2VkIGJ5IHRoZSBjbGFzcy5cblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIHNsb3RzIHVzZWRcblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNVc2VkKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1heGltdW0gYW1vdW50IG9mIFN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgbWFuYWdlZCBieSB0aGUgY2xhc3Ncblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNUb3RhbCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlcy5sZW5ndGg7XG5cdH1cblxuXHRwcml2YXRlIG9uQ29udGV4dENyZWF0ZWQoZXZlbnQ6RXZlbnQpOnZvaWRcblx0e1xuXHRcdC8vdmFyIHN0YWdlOlN0YWdlID0gPFN0YWdlPiBlLnRhcmdldDtcblx0XHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhZ2UuY2FudmFzKVxuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlTWFuYWdlcjsiXX0=