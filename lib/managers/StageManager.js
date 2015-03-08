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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXIudHMiXSwibmFtZXMiOlsiU3RhZ2VNYW5hZ2VyIiwiU3RhZ2VNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiU3RhZ2VNYW5hZ2VyLmdldEluc3RhbmNlIiwiU3RhZ2VNYW5hZ2VyLmdldFN0YWdlQXQiLCJTdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlIiwiU3RhZ2VNYW5hZ2VyLmdldEZyZWVTdGFnZSIsIlN0YWdlTWFuYWdlci5oYXNGcmVlU3RhZ2UiLCJTdGFnZU1hbmFnZXIubnVtU2xvdHNGcmVlIiwiU3RhZ2VNYW5hZ2VyLm51bVNsb3RzVXNlZCIsIlN0YWdlTWFuYWdlci5udW1TbG90c1RvdGFsIiwiU3RhZ2VNYW5hZ2VyLm9uQ29udGV4dENyZWF0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sZUFBZSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDOUUsSUFBTyxhQUFhLFdBQWMsc0NBQXNDLENBQUMsQ0FBQztBQUUxRSxJQUFPLEtBQUssV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLEFBS0E7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQVN6Q0E7Ozs7T0FJR0E7SUFDSEEsU0FkS0EsWUFBWUE7UUFBbEJDLGlCQTBJQ0E7UUExSENBLGlCQUFPQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFRQSxZQUFZQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBRWpFQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBNUJBLENBQTRCQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFREQ7Ozs7T0FJR0E7SUFDV0Es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MElDQSxFQTFJMEIsZUFBZSxFQTBJekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEFyZ3VtZW50RXJyb3JcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQXJndW1lbnRFcnJvclwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XG5cbi8qKlxuICogVGhlIFN0YWdlTWFuYWdlciBjbGFzcyBwcm92aWRlcyBhIG11bHRpdG9uIG9iamVjdCB0aGF0IGhhbmRsZXMgbWFuYWdlbWVudCBmb3IgU3RhZ2Ugb2JqZWN0cy5cbiAqXG4gKiBAc2VlIGF3YXkuYmFzZS5TdGFnZVxuICovXG5jbGFzcyBTdGFnZU1hbmFnZXIgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXJcbntcblx0cHJpdmF0ZSBzdGF0aWMgU1RBR0VfTUFYX1FVQU5USVRZOm51bWJlciA9IDg7XG5cdHByaXZhdGUgX3N0YWdlczpBcnJheTxTdGFnZT47XG5cblx0cHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOlN0YWdlTWFuYWdlcjtcblx0cHJpdmF0ZSBzdGF0aWMgX251bVN0YWdlczpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFN0YWdlTWFuYWdlciBjbGFzcy5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgU3RhZ2Ugb2JqZWN0cyB0byBiZSBtYW5hZ2VkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX3N0YWdlcyA9IG5ldyBBcnJheTxTdGFnZT4oU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSk7XG5cblx0XHR0aGlzLl9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGUgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMub25Db250ZXh0Q3JlYXRlZChldmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIFN0YWdlTWFuYWdlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIFN0YWdlIG9iamVjdC5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgU3RhZ2Ugb2JqZWN0cyB0byBiZSBtYW5hZ2VkLlxuXHQgKiBAcmV0dXJuIFRoZSBTdGFnZU1hbmFnZXIgaW5zdGFuY2UgZm9yIHRoZSBnaXZlbiBTdGFnZSBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6U3RhZ2VNYW5hZ2VyXG5cdHtcblx0XHRpZiAodGhpcy5faW5zdGFuY2UgPT0gbnVsbClcblx0XHRcdHRoaXMuX2luc3RhbmNlID0gbmV3IFN0YWdlTWFuYWdlcigpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBTdGFnZSBmb3IgdGhlIGdpdmVuIGluZGV4LlxuXHQgKlxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSByZXF1ZXN0ZWQgU3RhZ2UuXG5cdCAqIEBwYXJhbSBmb3JjZVNvZnR3YXJlIFdoZXRoZXIgdG8gZm9yY2Ugc29mdHdhcmUgbW9kZSBldmVuIGlmIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpcyBhdmFpbGFibGUuXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUsIGFuIGVudW1lcmF0aW9uIG9mIENvbnRleHRQcm9maWxlXG5cdCAqIEByZXR1cm4gVGhlIFN0YWdlIGZvciB0aGUgZ2l2ZW4gaW5kZXguXG5cdCAqL1xuXHRwdWJsaWMgZ2V0U3RhZ2VBdChpbmRleDpudW1iZXIsIGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIik6U3RhZ2Vcblx0e1xuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWSlcblx0XHRcdHRocm93IG5ldyBBcmd1bWVudEVycm9yKFwiSW5kZXggaXMgb3V0IG9mIGJvdW5kcyBbMC4uXCIgKyBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZICsgXCJdXCIpO1xuXG5cdFx0aWYgKCF0aGlzLl9zdGFnZXNbaW5kZXhdKSB7XG5cdFx0XHRTdGFnZU1hbmFnZXIuX251bVN0YWdlcysrO1xuXG5cdFx0XHR2YXIgY2FudmFzOkhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdGNhbnZhcy5pZCA9IFwic3RhZ2VcIiArIGluZGV4O1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXHRcdFx0dmFyIHN0YWdlOlN0YWdlID0gdGhpcy5fc3RhZ2VzW2luZGV4XSA9IG5ldyBTdGFnZShjYW52YXMsIGluZGV4LCB0aGlzLCBmb3JjZVNvZnR3YXJlLCBwcm9maWxlKTtcblx0XHRcdHN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSk7XG5cdFx0XHRzdGFnZS5yZXF1ZXN0Q29udGV4dChmb3JjZVNvZnR3YXJlLCBwcm9maWxlLCBtb2RlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIFN0YWdlIGZyb20gdGhlIG1hbmFnZXIuXG5cdCAqIEBwYXJhbSBzdGFnZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGlSZW1vdmVTdGFnZShzdGFnZTpTdGFnZSlcblx0e1xuXHRcdFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzLS07XG5cblx0XHRzdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVELCB0aGlzLl9vbkNvbnRleHRDcmVhdGVkRGVsZWdhdGUpO1xuXG5cdFx0dGhpcy5fc3RhZ2VzW3N0YWdlLnN0YWdlSW5kZXhdID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIG5leHQgYXZhaWxhYmxlIHN0YWdlLiBBbiBlcnJvciBpcyB0aHJvd24gaWYgdGhlcmUgYXJlIG5vIFN0YWdlUHJveGllcyBhdmFpbGFibGVcblx0ICogQHBhcmFtIGZvcmNlU29mdHdhcmUgV2hldGhlciB0byBmb3JjZSBzb2Z0d2FyZSBtb2RlIGV2ZW4gaWYgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIGlzIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSwgYW4gZW51bWVyYXRpb24gb2YgQ29udGV4dFByb2ZpbGVcblx0ICogQHJldHVybiBUaGUgYWxsb2NhdGVkIHN0YWdlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RnJlZVN0YWdlKGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIik6U3RhZ2Vcblx0e1xuXHRcdHZhciBpOm51bWJlciA9IDA7XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9zdGFnZXMubGVuZ3RoO1xuXG5cdFx0d2hpbGUgKGkgPCBsZW4pIHtcblx0XHRcdGlmICghdGhpcy5fc3RhZ2VzW2ldKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRTdGFnZUF0KGksIGZvcmNlU29mdHdhcmUsIHByb2ZpbGUsIG1vZGUpO1xuXG5cdFx0XHQrK2k7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgbmV3IHN0YWdlIGNhbiBiZSBjcmVhdGVkIGFuZCBtYW5hZ2VkIGJ5IHRoZSBjbGFzcy5cblx0ICogQHJldHVybiB0cnVlIGlmIHRoZXJlIGlzIG9uZSBzbG90IGZyZWUgZm9yIGEgbmV3IHN0YWdlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGhhc0ZyZWVTdGFnZSgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuX251bVN0YWdlcyA8IFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFk/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbW91bnQgb2Ygc3RhZ2Ugb2JqZWN0cyB0aGF0IGNhbiBiZSBjcmVhdGVkIGFuZCBtYW5hZ2VkIGJ5IHRoZSBjbGFzc1xuXHQgKiBAcmV0dXJuIHRoZSBhbW91bnQgb2YgZnJlZSBzbG90c1xuXHQgKi9cblx0cHVibGljIGdldCBudW1TbG90c0ZyZWUoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZIC0gU3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW1vdW50IG9mIFN0YWdlIG9iamVjdHMgY3VycmVudGx5IG1hbmFnZWQgYnkgdGhlIGNsYXNzLlxuXHQgKiBAcmV0dXJuIHRoZSBhbW91bnQgb2Ygc2xvdHMgdXNlZFxuXHQgKi9cblx0cHVibGljIGdldCBudW1TbG90c1VzZWQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiBTdGFnZU1hbmFnZXIuX251bVN0YWdlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWF4aW11bSBhbW91bnQgb2YgU3RhZ2Ugb2JqZWN0cyB0aGF0IGNhbiBiZSBtYW5hZ2VkIGJ5IHRoZSBjbGFzc1xuXHQgKi9cblx0cHVibGljIGdldCBudW1TbG90c1RvdGFsKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VzLmxlbmd0aDtcblx0fVxuXG5cdHByaXZhdGUgb25Db250ZXh0Q3JlYXRlZChldmVudDpFdmVudCk6dm9pZFxuXHR7XG5cdFx0Ly92YXIgc3RhZ2U6U3RhZ2UgPSA8U3RhZ2U+IGUudGFyZ2V0O1xuXHRcdC8vZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGFnZS5jYW52YXMpXG5cdH1cbn1cblxuZXhwb3J0ID0gU3RhZ2VNYW5hZ2VyOyJdfQ==