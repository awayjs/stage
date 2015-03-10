var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var Stage = require("awayjs-stagegl/lib/base/Stage");
var StageEvent = require("awayjs-stagegl/lib/events/StageEvent");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXIudHMiXSwibmFtZXMiOlsiU3RhZ2VNYW5hZ2VyIiwiU3RhZ2VNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiU3RhZ2VNYW5hZ2VyLmdldEluc3RhbmNlIiwiU3RhZ2VNYW5hZ2VyLmdldFN0YWdlQXQiLCJTdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmdldEZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5oYXNGcmVlU3RhZ2UiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNGcmVlIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVXNlZCIsIlN0YWdlTWFuYWdlci5udW1TbG90c1RvdGFsIiwiU3RhZ2VNYW5hZ2VyLm9uQ29udGV4dENyZWF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sZUFBZSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDOUUsSUFBTyxhQUFhLFdBQWMsc0NBQXNDLENBQUMsQ0FBQztBQUUxRSxJQUFPLEtBQUssV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLEFBS0E7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQVN6Q0E7Ozs7T0FJR0E7SUFDSEEsU0FkS0EsWUFBWUE7UUFBbEJDLGlCQTBJQ0E7UUExSENBLGlCQUFPQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFRQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBNUJBLENBQTRCQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQ7Ozs7T0FJR0E7SUFDV0Es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MElDQSxFQTFJMEIsZUFBZSxFQTBJekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xyXG5pbXBvcnQgQXJndW1lbnRFcnJvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9Bcmd1bWVudEVycm9yXCIpO1xyXG5cclxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XHJcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgU3RhZ2VNYW5hZ2VyIGNsYXNzIHByb3ZpZGVzIGEgbXVsdGl0b24gb2JqZWN0IHRoYXQgaGFuZGxlcyBtYW5hZ2VtZW50IGZvciBTdGFnZSBvYmplY3RzLlxyXG4gKlxyXG4gKiBAc2VlIGF3YXkuYmFzZS5TdGFnZVxyXG4gKi9cclxuY2xhc3MgU3RhZ2VNYW5hZ2VyIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXHJcbntcclxuXHRwcml2YXRlIHN0YXRpYyBTVEFHRV9NQVhfUVVBTlRJVFk6bnVtYmVyID0gODtcclxuXHRwcml2YXRlIF9zdGFnZXM6QXJyYXk8U3RhZ2U+O1xyXG5cclxuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6U3RhZ2VNYW5hZ2VyO1xyXG5cdHByaXZhdGUgc3RhdGljIF9udW1TdGFnZXM6bnVtYmVyID0gMDtcclxuXHRwcml2YXRlIF9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgbmV3IFN0YWdlTWFuYWdlciBjbGFzcy5cclxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBTdGFnZSBvYmplY3RzIHRvIGJlIG1hbmFnZWQuXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcigpXHJcblx0e1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl9zdGFnZXMgPSBuZXcgQXJyYXk8U3RhZ2U+KFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkpO1xyXG5cclxuXHRcdHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSA9IChldmVudDpFdmVudCkgPT4gdGhpcy5vbkNvbnRleHRDcmVhdGVkKGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgYSBTdGFnZU1hbmFnZXIgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBTdGFnZSBvYmplY3QuXHJcblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgU3RhZ2Ugb2JqZWN0cyB0byBiZSBtYW5hZ2VkLlxyXG5cdCAqIEByZXR1cm4gVGhlIFN0YWdlTWFuYWdlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIFN0YWdlIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6U3RhZ2VNYW5hZ2VyXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX2luc3RhbmNlID09IG51bGwpXHJcblx0XHRcdHRoaXMuX2luc3RhbmNlID0gbmV3IFN0YWdlTWFuYWdlcigpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9pbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RzIHRoZSBTdGFnZSBmb3IgdGhlIGdpdmVuIGluZGV4LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgcmVxdWVzdGVkIFN0YWdlLlxyXG5cdCAqIEBwYXJhbSBmb3JjZVNvZnR3YXJlIFdoZXRoZXIgdG8gZm9yY2Ugc29mdHdhcmUgbW9kZSBldmVuIGlmIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpcyBhdmFpbGFibGUuXHJcblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSwgYW4gZW51bWVyYXRpb24gb2YgQ29udGV4dFByb2ZpbGVcclxuXHQgKiBAcmV0dXJuIFRoZSBTdGFnZSBmb3IgdGhlIGdpdmVuIGluZGV4LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRTdGFnZUF0KGluZGV4Om51bWJlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxyXG5cdHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSlcclxuXHRcdFx0dGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoXCJJbmRleCBpcyBvdXQgb2YgYm91bmRzIFswLi5cIiArIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgKyBcIl1cIik7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9zdGFnZXNbaW5kZXhdKSB7XHJcblx0XHRcdFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzKys7XHJcblxyXG5cdFx0XHR2YXIgY2FudmFzOkhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuXHRcdFx0Y2FudmFzLmlkID0gXCJzdGFnZVwiICsgaW5kZXg7XHJcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcclxuXHRcdFx0dmFyIHN0YWdlOlN0YWdlID0gdGhpcy5fc3RhZ2VzW2luZGV4XSA9IG5ldyBTdGFnZShjYW52YXMsIGluZGV4LCB0aGlzLCBmb3JjZVNvZnR3YXJlLCBwcm9maWxlKTtcclxuXHRcdFx0c3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcclxuXHRcdFx0c3RhZ2UucmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHN0YWdlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIFN0YWdlIGZyb20gdGhlIG1hbmFnZXIuXHJcblx0ICogQHBhcmFtIHN0YWdlXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgaVJlbW92ZVN0YWdlKHN0YWdlOlN0YWdlKVxyXG5cdHtcclxuXHRcdFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzLS07XHJcblxyXG5cdFx0c3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcclxuXHJcblx0XHR0aGlzLl9zdGFnZXNbc3RhZ2Uuc3RhZ2VJbmRleF0gPSBudWxsO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBuZXh0IGF2YWlsYWJsZSBzdGFnZS4gQW4gZXJyb3IgaXMgdGhyb3duIGlmIHRoZXJlIGFyZSBubyBTdGFnZVByb3hpZXMgYXZhaWxhYmxlXHJcblx0ICogQHBhcmFtIGZvcmNlU29mdHdhcmUgV2hldGhlciB0byBmb3JjZSBzb2Z0d2FyZSBtb2RlIGV2ZW4gaWYgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIGlzIGF2YWlsYWJsZS5cclxuXHQgKiBAcGFyYW0gcHJvZmlsZSBUaGUgY29tcGF0aWJpbGl0eSBwcm9maWxlLCBhbiBlbnVtZXJhdGlvbiBvZiBDb250ZXh0UHJvZmlsZVxyXG5cdCAqIEByZXR1cm4gVGhlIGFsbG9jYXRlZCBzdGFnZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRGcmVlU3RhZ2UoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxyXG5cdHtcclxuXHRcdHZhciBpOm51bWJlciA9IDA7XHJcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX3N0YWdlcy5sZW5ndGg7XHJcblxyXG5cdFx0d2hpbGUgKGkgPCBsZW4pIHtcclxuXHRcdFx0aWYgKCF0aGlzLl9zdGFnZXNbaV0pXHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0U3RhZ2VBdChpLCBmb3JjZVNvZnR3YXJlLCBwcm9maWxlLCBtb2RlKTtcclxuXHJcblx0XHRcdCsraTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiBhIG5ldyBzdGFnZSBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3MuXHJcblx0ICogQHJldHVybiB0cnVlIGlmIHRoZXJlIGlzIG9uZSBzbG90IGZyZWUgZm9yIGEgbmV3IHN0YWdlXHJcblx0ICovXHJcblx0cHVibGljIGdldCBoYXNGcmVlU3RhZ2UoKTpib29sZWFuXHJcblx0e1xyXG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzIDwgU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWT8gdHJ1ZSA6IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgYW1vdW50IG9mIHN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB0aGUgY2xhc3NcclxuXHQgKiBAcmV0dXJuIHRoZSBhbW91bnQgb2YgZnJlZSBzbG90c1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNGcmVlKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgLSBTdGFnZU1hbmFnZXIuX251bVN0YWdlcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIGN1cnJlbnRseSBtYW5hZ2VkIGJ5IHRoZSBjbGFzcy5cclxuXHQgKiBAcmV0dXJuIHRoZSBhbW91bnQgb2Ygc2xvdHMgdXNlZFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgbnVtU2xvdHNVc2VkKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIG1heGltdW0gYW1vdW50IG9mIFN0YWdlIG9iamVjdHMgdGhhdCBjYW4gYmUgbWFuYWdlZCBieSB0aGUgY2xhc3NcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVG90YWwoKTpudW1iZXJcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VzLmxlbmd0aDtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgb25Db250ZXh0Q3JlYXRlZChldmVudDpFdmVudCk6dm9pZFxyXG5cdHtcclxuXHRcdC8vdmFyIHN0YWdlOlN0YWdlID0gPFN0YWdlPiBlLnRhcmdldDtcclxuXHRcdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGFnZS5jYW52YXMpXHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgPSBTdGFnZU1hbmFnZXI7Il19