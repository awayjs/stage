"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventBase_1 = require("@awayjs/core/lib/events/EventBase");
var StageEvent = (function (_super) {
    __extends(StageEvent, _super);
    function StageEvent(type, stage) {
        _super.call(this, type);
        this._stage = stage;
    }
    Object.defineProperty(StageEvent.prototype, "stage", {
        /**
         *
         */
        get: function () {
            return this._stage;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    StageEvent.prototype.clone = function () {
        return new StageEvent(this.type, this._stage);
    };
    /**
     *
     */
    StageEvent.STAGE_ERROR = "stageError";
    /**
     *
     */
    StageEvent.CONTEXT_CREATED = "contextCreated";
    /**
     *
     */
    StageEvent.CONTEXT_DISPOSED = "contextDisposed";
    /**
     *
     */
    StageEvent.CONTEXT_RECREATED = "contextRecreated";
    /**
     *
     */
    StageEvent.VIEWPORT_UPDATED = "viewportUpdated";
    return StageEvent;
}(EventBase_1.EventBase));
exports.StageEvent = StageEvent;
