var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var StageEvent = require("awayjs-display/lib/events/StageEvent");
var Stage = require("awayjs-stagegl/lib/base/Stage");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXIudHMiXSwibmFtZXMiOlsiU3RhZ2VNYW5hZ2VyIiwiU3RhZ2VNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiU3RhZ2VNYW5hZ2VyLmdldEluc3RhbmNlIiwiU3RhZ2VNYW5hZ2VyLmdldFN0YWdlQXQiLCJTdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmdldEZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5oYXNGcmVlU3RhZ2UiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNGcmVlIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVXNlZCIsIlN0YWdlTWFuYWdlci5udW1TbG90c1RvdGFsIiwiU3RhZ2VNYW5hZ2VyLm9uQ29udGV4dENyZWF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sZUFBZSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDOUUsSUFBTyxhQUFhLFdBQWMsc0NBQXNDLENBQUMsQ0FBQztBQUUxRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLElBQU8sS0FBSyxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBRTdELEFBS0E7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQVN6Q0E7Ozs7T0FJR0E7SUFDSEEsU0FkS0EsWUFBWUE7UUFBbEJDLGlCQTBJQ0E7UUExSENBLGlCQUFPQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFRQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBNUJBLENBQTRCQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQ7Ozs7T0FJR0E7SUFDV0Es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MElDQSxFQTFJMEIsZUFBZSxFQTBJekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xyXG5pbXBvcnQgQXJndW1lbnRFcnJvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9Bcmd1bWVudEVycm9yXCIpO1xyXG5cclxuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9TdGFnZUV2ZW50XCIpO1xyXG5cclxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XHJcblxyXG4vKipcclxuICogVGhlIFN0YWdlTWFuYWdlciBjbGFzcyBwcm92aWRlcyBhIG11bHRpdG9uIG9iamVjdCB0aGF0IGhhbmRsZXMgbWFuYWdlbWVudCBmb3IgU3RhZ2Ugb2JqZWN0cy5cclxuICpcclxuICogQHNlZSBhd2F5LmJhc2UuU3RhZ2VcclxuICovXHJcbmNsYXNzIFN0YWdlTWFuYWdlciBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxyXG57XHJcblx0cHJpdmF0ZSBzdGF0aWMgU1RBR0VfTUFYX1FVQU5USVRZOm51bWJlciA9IDg7XHJcblx0cHJpdmF0ZSBfc3RhZ2VzOkFycmF5PFN0YWdlPjtcclxuXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOlN0YWdlTWFuYWdlcjtcclxuXHRwcml2YXRlIHN0YXRpYyBfbnVtU3RhZ2VzOm51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlOihldmVudDpFdmVudCkgPT4gdm9pZDtcclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyBTdGFnZU1hbmFnZXIgY2xhc3MuXHJcblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgU3RhZ2Ugb2JqZWN0cyB0byBiZSBtYW5hZ2VkLlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKVxyXG5cdHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5fc3RhZ2VzID0gbmV3IEFycmF5PFN0YWdlPihTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZKTtcclxuXHJcblx0XHR0aGlzLl9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGUgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMub25Db250ZXh0Q3JlYXRlZChldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXRzIGEgU3RhZ2VNYW5hZ2VyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gU3RhZ2Ugb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIFN0YWdlIG9iamVjdHMgdG8gYmUgbWFuYWdlZC5cclxuXHQgKiBAcmV0dXJuIFRoZSBTdGFnZU1hbmFnZXIgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBTdGFnZSBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOlN0YWdlTWFuYWdlclxyXG5cdHtcclxuXHRcdGlmICh0aGlzLl9pbnN0YW5jZSA9PSBudWxsKVxyXG5cdFx0XHR0aGlzLl9pbnN0YW5jZSA9IG5ldyBTdGFnZU1hbmFnZXIoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXF1ZXN0cyB0aGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIHJlcXVlc3RlZCBTdGFnZS5cclxuXHQgKiBAcGFyYW0gZm9yY2VTb2Z0d2FyZSBXaGV0aGVyIHRvIGZvcmNlIHNvZnR3YXJlIG1vZGUgZXZlbiBpZiBoYXJkd2FyZSBhY2NlbGVyYXRpb24gaXMgYXZhaWxhYmxlLlxyXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUsIGFuIGVudW1lcmF0aW9uIG9mIENvbnRleHRQcm9maWxlXHJcblx0ICogQHJldHVybiBUaGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0U3RhZ2VBdChpbmRleDpudW1iZXIsIGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIik6U3RhZ2VcclxuXHR7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpXHJcblx0XHRcdHRocm93IG5ldyBBcmd1bWVudEVycm9yKFwiSW5kZXggaXMgb3V0IG9mIGJvdW5kcyBbMC4uXCIgKyBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZICsgXCJdXCIpO1xyXG5cclxuXHRcdGlmICghdGhpcy5fc3RhZ2VzW2luZGV4XSkge1xyXG5cdFx0XHRTdGFnZU1hbmFnZXIuX251bVN0YWdlcysrO1xyXG5cclxuXHRcdFx0dmFyIGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0XHRcdGNhbnZhcy5pZCA9IFwic3RhZ2VcIiArIGluZGV4O1xyXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XHJcblx0XHRcdHZhciBzdGFnZTpTdGFnZSA9IHRoaXMuX3N0YWdlc1tpbmRleF0gPSBuZXcgU3RhZ2UoY2FudmFzLCBpbmRleCwgdGhpcywgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSk7XHJcblx0XHRcdHN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSk7XHJcblx0XHRcdHN0YWdlLnJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmUsIHByb2ZpbGUsIG1vZGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBzdGFnZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgYSBTdGFnZSBmcm9tIHRoZSBtYW5hZ2VyLlxyXG5cdCAqIEBwYXJhbSBzdGFnZVxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHVibGljIGlSZW1vdmVTdGFnZShzdGFnZTpTdGFnZSlcclxuXHR7XHJcblx0XHRTdGFnZU1hbmFnZXIuX251bVN0YWdlcy0tO1xyXG5cclxuXHRcdHN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSk7XHJcblxyXG5cdFx0dGhpcy5fc3RhZ2VzW3N0YWdlLnN0YWdlSW5kZXhdID0gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgbmV4dCBhdmFpbGFibGUgc3RhZ2UuIEFuIGVycm9yIGlzIHRocm93biBpZiB0aGVyZSBhcmUgbm8gU3RhZ2VQcm94aWVzIGF2YWlsYWJsZVxyXG5cdCAqIEBwYXJhbSBmb3JjZVNvZnR3YXJlIFdoZXRoZXIgdG8gZm9yY2Ugc29mdHdhcmUgbW9kZSBldmVuIGlmIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpcyBhdmFpbGFibGUuXHJcblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSwgYW4gZW51bWVyYXRpb24gb2YgQ29udGV4dFByb2ZpbGVcclxuXHQgKiBAcmV0dXJuIFRoZSBhbGxvY2F0ZWQgc3RhZ2VcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0RnJlZVN0YWdlKGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIik6U3RhZ2VcclxuXHR7XHJcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xyXG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9zdGFnZXMubGVuZ3RoO1xyXG5cclxuXHRcdHdoaWxlIChpIDwgbGVuKSB7XHJcblx0XHRcdGlmICghdGhpcy5fc3RhZ2VzW2ldKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFN0YWdlQXQoaSwgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XHJcblxyXG5cdFx0XHQrK2k7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgYSBuZXcgc3RhZ2UgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzLlxyXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGVyZSBpcyBvbmUgc2xvdCBmcmVlIGZvciBhIG5ldyBzdGFnZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgaGFzRnJlZVN0YWdlKCk6Ym9vbGVhblxyXG5cdHtcclxuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuX251bVN0YWdlcyA8IFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFk/IHRydWUgOiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBzdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzXHJcblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIGZyZWUgc2xvdHNcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IG51bVNsb3RzRnJlZSgpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZIC0gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBhbW91bnQgb2YgU3RhZ2Ugb2JqZWN0cyBjdXJyZW50bHkgbWFuYWdlZCBieSB0aGUgY2xhc3MuXHJcblx0ICogQHJldHVybiB0aGUgYW1vdW50IG9mIHNsb3RzIHVzZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVXNlZCgpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuX251bVN0YWdlcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIG1hbmFnZWQgYnkgdGhlIGNsYXNzXHJcblx0ICovXHJcblx0cHVibGljIGdldCBudW1TbG90c1RvdGFsKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlcy5sZW5ndGg7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG9uQ29udGV4dENyZWF0ZWQoZXZlbnQ6RXZlbnQpOnZvaWRcclxuXHR7XHJcblx0XHQvL3ZhciBzdGFnZTpTdGFnZSA9IDxTdGFnZT4gZS50YXJnZXQ7XHJcblx0XHQvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhZ2UuY2FudmFzKVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0ID0gU3RhZ2VNYW5hZ2VyOyJdfQ==