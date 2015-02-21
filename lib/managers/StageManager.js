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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXIudHMiXSwibmFtZXMiOlsiU3RhZ2VNYW5hZ2VyIiwiU3RhZ2VNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiU3RhZ2VNYW5hZ2VyLmdldEluc3RhbmNlIiwiU3RhZ2VNYW5hZ2VyLmdldFN0YWdlQXQiLCJTdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmdldEZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5oYXNGcmVlU3RhZ2UiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNGcmVlIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVXNlZCIsIlN0YWdlTWFuYWdlci5udW1TbG90c1RvdGFsIiwiU3RhZ2VNYW5hZ2VyLm9uQ29udGV4dENyZWF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sZUFBZSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDOUUsSUFBTyxhQUFhLFdBQWMsc0NBQXNDLENBQUMsQ0FBQztBQUUxRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLElBQU8sS0FBSyxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBRTdELEFBS0E7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQVN6Q0E7Ozs7T0FJR0E7SUFDSEEsU0FkS0EsWUFBWUE7UUFBbEJDLGlCQTBJQ0E7UUExSENBLGlCQUFPQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFRQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBNUJBLENBQTRCQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQ7Ozs7T0FJR0E7SUFDV0Es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MElDQSxFQTFJMEIsZUFBZSxFQTBJekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEFyZ3VtZW50RXJyb3JcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQXJndW1lbnRFcnJvclwiKTtcblxuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9TdGFnZUV2ZW50XCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcblxuLyoqXG4gKiBUaGUgU3RhZ2VNYW5hZ2VyIGNsYXNzIHByb3ZpZGVzIGEgbXVsdGl0b24gb2JqZWN0IHRoYXQgaGFuZGxlcyBtYW5hZ2VtZW50IGZvciBTdGFnZSBvYmplY3RzLlxuICpcbiAqIEBzZWUgYXdheS5iYXNlLlN0YWdlXG4gKi9cbmNsYXNzIFN0YWdlTWFuYWdlciBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIHN0YXRpYyBTVEFHRV9NQVhfUVVBTlRJVFk6bnVtYmVyID0gODtcblx0cHJpdmF0ZSBfc3RhZ2VzOkFycmF5PFN0YWdlPjtcblxuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6U3RhZ2VNYW5hZ2VyO1xuXHRwcml2YXRlIHN0YXRpYyBfbnVtU3RhZ2VzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgU3RhZ2VNYW5hZ2VyIGNsYXNzLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBTdGFnZSBvYmplY3RzIHRvIGJlIG1hbmFnZWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fc3RhZ2VzID0gbmV3IEFycmF5PFN0YWdlPihTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZKTtcblxuXHRcdHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSA9IChldmVudDpFdmVudCkgPT4gdGhpcy5vbkNvbnRleHRDcmVhdGVkKGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgU3RhZ2VNYW5hZ2VyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBTdGFnZSBvYmplY3RzIHRvIGJlIG1hbmFnZWQuXG5cdCAqIEByZXR1cm4gVGhlIFN0YWdlTWFuYWdlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIFN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpTdGFnZU1hbmFnZXJcblx0e1xuXHRcdGlmICh0aGlzLl9pbnN0YW5jZSA9PSBudWxsKVxuXHRcdFx0dGhpcy5faW5zdGFuY2UgPSBuZXcgU3RhZ2VNYW5hZ2VyKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5faW5zdGFuY2U7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFN0YWdlIGZvciB0aGUgZ2l2ZW4gaW5kZXguXG5cdCAqXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIHJlcXVlc3RlZCBTdGFnZS5cblx0ICogQHBhcmFtIGZvcmNlU29mdHdhcmUgV2hldGhlciB0byBmb3JjZSBzb2Z0d2FyZSBtb2RlIGV2ZW4gaWYgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIGlzIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSwgYW4gZW51bWVyYXRpb24gb2YgQ29udGV4dFByb2ZpbGVcblx0ICogQHJldHVybiBUaGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cblx0ICovXG5cdHB1YmxpYyBnZXRTdGFnZUF0KGluZGV4Om51bWJlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxuXHR7XG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZKVxuXHRcdFx0dGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoXCJJbmRleCBpcyBvdXQgb2YgYm91bmRzIFswLi5cIiArIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgKyBcIl1cIik7XG5cblx0XHRpZiAoIXRoaXMuX3N0YWdlc1tpbmRleF0pIHtcblx0XHRcdFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzKys7XG5cblx0XHRcdHZhciBjYW52YXM6SFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Y2FudmFzLmlkID0gXCJzdGFnZVwiICsgaW5kZXg7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cdFx0XHR2YXIgc3RhZ2U6U3RhZ2UgPSB0aGlzLl9zdGFnZXNbaW5kZXhdID0gbmV3IFN0YWdlKGNhbnZhcywgaW5kZXgsIHRoaXMsIGZvcmNlU29mdHdhcmUsIHByb2ZpbGUpO1xuXHRcdFx0c3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcblx0XHRcdHN0YWdlLnJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmUsIHByb2ZpbGUsIG1vZGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdGFnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgU3RhZ2UgZnJvbSB0aGUgbWFuYWdlci5cblx0ICogQHBhcmFtIHN0YWdlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgaVJlbW92ZVN0YWdlKHN0YWdlOlN0YWdlKVxuXHR7XG5cdFx0U3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMtLTtcblxuXHRcdHN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSk7XG5cblx0XHR0aGlzLl9zdGFnZXNbc3RhZ2Uuc3RhZ2VJbmRleF0gPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgbmV4dCBhdmFpbGFibGUgc3RhZ2UuIEFuIGVycm9yIGlzIHRocm93biBpZiB0aGVyZSBhcmUgbm8gU3RhZ2VQcm94aWVzIGF2YWlsYWJsZVxuXHQgKiBAcGFyYW0gZm9yY2VTb2Z0d2FyZSBXaGV0aGVyIHRvIGZvcmNlIHNvZnR3YXJlIG1vZGUgZXZlbiBpZiBoYXJkd2FyZSBhY2NlbGVyYXRpb24gaXMgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gcHJvZmlsZSBUaGUgY29tcGF0aWJpbGl0eSBwcm9maWxlLCBhbiBlbnVtZXJhdGlvbiBvZiBDb250ZXh0UHJvZmlsZVxuXHQgKiBAcmV0dXJuIFRoZSBhbGxvY2F0ZWQgc3RhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXRGcmVlU3RhZ2UoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyID0gMDtcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX3N0YWdlcy5sZW5ndGg7XG5cblx0XHR3aGlsZSAoaSA8IGxlbikge1xuXHRcdFx0aWYgKCF0aGlzLl9zdGFnZXNbaV0pXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFN0YWdlQXQoaSwgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XG5cblx0XHRcdCsraTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBuZXcgc3RhZ2UgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzLlxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlcmUgaXMgb25lIHNsb3QgZnJlZSBmb3IgYSBuZXcgc3RhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXQgaGFzRnJlZVN0YWdlKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzIDwgU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWT8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBzdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzXG5cdCAqIEByZXR1cm4gdGhlIGFtb3VudCBvZiBmcmVlIHNsb3RzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzRnJlZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgLSBTdGFnZU1hbmFnZXIuX251bVN0YWdlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbW91bnQgb2YgU3RhZ2Ugb2JqZWN0cyBjdXJyZW50bHkgbWFuYWdlZCBieSB0aGUgY2xhc3MuXG5cdCAqIEByZXR1cm4gdGhlIGFtb3VudCBvZiBzbG90cyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVXNlZCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIG1hbmFnZWQgYnkgdGhlIGNsYXNzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVG90YWwoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zdGFnZXMubGVuZ3RoO1xuXHR9XG5cblx0cHJpdmF0ZSBvbkNvbnRleHRDcmVhdGVkKGV2ZW50OkV2ZW50KTp2b2lkXG5cdHtcblx0XHQvL3ZhciBzdGFnZTpTdGFnZSA9IDxTdGFnZT4gZS50YXJnZXQ7XG5cdFx0Ly9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YWdlLmNhbnZhcylcblx0fVxufVxuXG5leHBvcnQgPSBTdGFnZU1hbmFnZXI7Il19