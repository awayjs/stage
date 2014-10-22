var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssetType = require("awayjs-core/lib/core/library/AssetType");
var NamedAssetBase = require("awayjs-core/lib/core/library/NamedAssetBase");
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var getTimer = require("awayjs-core/lib/utils/getTimer");
var AnimatorEvent = require("awayjs-stagegl/lib/events/AnimatorEvent");
/**
 * Dispatched when playback of an animation inside the animator object starts.
 *
 * @eventType away3d.events.AnimatorEvent
 */
//[Event(name="start", type="away3d.events.AnimatorEvent")]
/**
 * Dispatched when playback of an animation inside the animator object stops.
 *
 * @eventType away3d.events.AnimatorEvent
 */
//[Event(name="stop", type="away3d.events.AnimatorEvent")]
/**
 * Dispatched when playback of an animation reaches the end of an animation.
 *
 * @eventType away3d.events.AnimatorEvent
 */
//[Event(name="cycle_complete", type="away3d.events.AnimatorEvent")]
/**
 * Provides an abstract base class for animator classes that control animation output from a data set subtype of <code>AnimationSetBase</code>.
 *
 * @see away.animators.AnimationSetBase
 */
var AnimatorBase = (function (_super) {
    __extends(AnimatorBase, _super);
    /**
     * Creates a new <code>AnimatorBase</code> object.
     *
     * @param animationSet The animation data set to be used by the animator object.
     */
    function AnimatorBase(animationSet) {
        _super.call(this);
        this._autoUpdate = true;
        this._time = 0;
        this._playbackSpeed = 1;
        this._pOwners = new Array();
        this._pAbsoluteTime = 0;
        this._animationStates = new Object();
        /**
         * Enables translation of the animated mesh from data returned per frame via the positionDelta property of the active animation node. Defaults to true.
         *
         * @see away.animators.IAnimationState#positionDelta
         */
        this.updatePosition = true;
        this._pAnimationSet = animationSet;
        this._broadcaster = new RequestAnimationFrame(this.onEnterFrame, this);
    }
    AnimatorBase.prototype.getAnimationState = function (node) {
        var className = node.stateClass;
        var uID = node.id;
        if (this._animationStates[uID] == null)
            this._animationStates[uID] = new className(this, node);
        return this._animationStates[uID];
    };
    AnimatorBase.prototype.getAnimationStateByName = function (name) {
        return this.getAnimationState(this._pAnimationSet.getAnimation(name));
    };
    Object.defineProperty(AnimatorBase.prototype, "absoluteTime", {
        /**
         * Returns the internal absolute time of the animator, calculated by the current time and the playback speed.
         *
         * @see #time
         * @see #playbackSpeed
         */
        get: function () {
            return this._pAbsoluteTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "animationSet", {
        /**
         * Returns the animation data set in use by the animator.
         */
        get: function () {
            return this._pAnimationSet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "activeState", {
        /**
         * Returns the current active animation state.
         */
        get: function () {
            return this._pActiveState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "activeAnimation", {
        /**
         * Returns the current active animation node.
         */
        get: function () {
            return this._pAnimationSet.getAnimation(this._pActiveAnimationName);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "activeAnimationName", {
        /**
         * Returns the current active animation node.
         */
        get: function () {
            return this._pActiveAnimationName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "autoUpdate", {
        /**
         * Determines whether the animators internal update mechanisms are active. Used in cases
         * where manual updates are required either via the <code>time</code> property or <code>update()</code> method.
         * Defaults to true.
         *
         * @see #time
         * @see #update()
         */
        get: function () {
            return this._autoUpdate;
        },
        set: function (value) {
            if (this._autoUpdate == value)
                return;
            this._autoUpdate = value;
            if (this._autoUpdate)
                this.start();
            else
                this.stop();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimatorBase.prototype, "time", {
        /**
         * Gets and sets the internal time clock of the animator.
         */
        get: function () {
            return this._time;
        },
        set: function (value /*int*/) {
            if (this._time == value)
                return;
            this.update(value);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the animation phase of the current active state's animation clip(s).
     *
     * @param value The phase value to use. 0 represents the beginning of an animation clip, 1 represents the end.
     */
    AnimatorBase.prototype.phase = function (value) {
        this._pActiveState.phase(value);
    };
    Object.defineProperty(AnimatorBase.prototype, "playbackSpeed", {
        /**
         * The amount by which passed time should be scaled. Used to slow down or speed up animations. Defaults to 1.
         */
        get: function () {
            return this._playbackSpeed;
        },
        set: function (value) {
            this._playbackSpeed = value;
        },
        enumerable: true,
        configurable: true
    });
    AnimatorBase.prototype.setRenderState = function (shaderObject, renderable, stage, camera, vertexConstantOffset /*int*/, vertexStreamOffset /*int*/) {
        throw new AbstractMethodError();
    };
    /**
     * Resumes the automatic playback clock controling the active state of the animator.
     */
    AnimatorBase.prototype.start = function () {
        if (this._isPlaying || !this._autoUpdate)
            return;
        this._time = this._pAbsoluteTime = getTimer();
        this._isPlaying = true;
        this._broadcaster.start();
        if (!this.hasEventListener(AnimatorEvent.START))
            return;
        if (this._startEvent == null)
            this._startEvent = new AnimatorEvent(AnimatorEvent.START, this);
        this.dispatchEvent(this._startEvent);
    };
    /**
     * Pauses the automatic playback clock of the animator, in case manual updates are required via the
     * <code>time</code> property or <code>update()</code> method.
     *
     * @see #time
     * @see #update()
     */
    AnimatorBase.prototype.stop = function () {
        if (!this._isPlaying)
            return;
        this._isPlaying = false;
        this._broadcaster.stop();
        if (!this.hasEventListener(AnimatorEvent.STOP))
            return;
        if (this._stopEvent == null)
            this._stopEvent = new AnimatorEvent(AnimatorEvent.STOP, this);
        this.dispatchEvent(this._stopEvent);
    };
    /**
     * Provides a way to manually update the active state of the animator when automatic
     * updates are disabled.
     *
     * @see #stop()
     * @see #autoUpdate
     */
    AnimatorBase.prototype.update = function (time /*int*/) {
        var dt = (time - this._time) * this.playbackSpeed;
        this._pUpdateDeltaTime(dt);
        this._time = time;
    };
    AnimatorBase.prototype.reset = function (name, offset) {
        if (offset === void 0) { offset = 0; }
        this.getAnimationState(this._pAnimationSet.getAnimation(name)).offset(offset + this._pAbsoluteTime);
    };
    /**
     * Used by the mesh object to which the animator is applied, registers the owner for internal use.
     *
     * @private
     */
    AnimatorBase.prototype.addOwner = function (mesh) {
        this._pOwners.push(mesh);
    };
    /**
     * Used by the mesh object from which the animator is removed, unregisters the owner for internal use.
     *
     * @private
     */
    AnimatorBase.prototype.removeOwner = function (mesh) {
        this._pOwners.splice(this._pOwners.indexOf(mesh), 1);
    };
    /**
     * Internal abstract method called when the time delta property of the animator's contents requires updating.
     *
     * @private
     */
    AnimatorBase.prototype._pUpdateDeltaTime = function (dt) {
        this._pAbsoluteTime += dt;
        this._pActiveState.update(this._pAbsoluteTime);
        if (this.updatePosition)
            this.applyPositionDelta();
    };
    /**
     * Enter frame event handler for automatically updating the active state of the animator.
     */
    AnimatorBase.prototype.onEnterFrame = function (event) {
        if (event === void 0) { event = null; }
        this.update(getTimer());
    };
    AnimatorBase.prototype.applyPositionDelta = function () {
        var delta = this._pActiveState.positionDelta;
        var dist = delta.length;
        var len /*uint*/;
        if (dist > 0) {
            len = this._pOwners.length;
            for (var i = 0; i < len; ++i)
                this._pOwners[i].translateLocal(delta, dist);
        }
    };
    /**
     *  for internal use.
     *
     * @private
     */
    AnimatorBase.prototype.dispatchCycleEvent = function () {
        if (this.hasEventListener(AnimatorEvent.CYCLE_COMPLETE)) {
            if (this._cycleEvent == null)
                this._cycleEvent = new AnimatorEvent(AnimatorEvent.CYCLE_COMPLETE, this);
            this.dispatchEvent(this._cycleEvent);
        }
    };
    /**
     * @inheritDoc
     */
    AnimatorBase.prototype.clone = function () {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimatorBase.prototype.dispose = function () {
    };
    /**
     * @inheritDoc
     */
    AnimatorBase.prototype.testGPUCompatibility = function (shaderObject) {
        throw new AbstractMethodError();
    };
    Object.defineProperty(AnimatorBase.prototype, "assetType", {
        /**
         * @inheritDoc
         */
        get: function () {
            return AssetType.ANIMATOR;
        },
        enumerable: true,
        configurable: true
    });
    AnimatorBase.prototype.getRenderableSubGeometry = function (renderable, sourceSubGeometry) {
        //nothing to do here
        return sourceSubGeometry;
    };
    return AnimatorBase;
})(NamedAssetBase);
module.exports = AnimatorBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdG9ycy9hbmltYXRvcmJhc2UudHMiXSwibmFtZXMiOlsiQW5pbWF0b3JCYXNlIiwiQW5pbWF0b3JCYXNlLmNvbnN0cnVjdG9yIiwiQW5pbWF0b3JCYXNlLmdldEFuaW1hdGlvblN0YXRlIiwiQW5pbWF0b3JCYXNlLmdldEFuaW1hdGlvblN0YXRlQnlOYW1lIiwiQW5pbWF0b3JCYXNlLmFic29sdXRlVGltZSIsIkFuaW1hdG9yQmFzZS5hbmltYXRpb25TZXQiLCJBbmltYXRvckJhc2UuYWN0aXZlU3RhdGUiLCJBbmltYXRvckJhc2UuYWN0aXZlQW5pbWF0aW9uIiwiQW5pbWF0b3JCYXNlLmFjdGl2ZUFuaW1hdGlvbk5hbWUiLCJBbmltYXRvckJhc2UuYXV0b1VwZGF0ZSIsIkFuaW1hdG9yQmFzZS50aW1lIiwiQW5pbWF0b3JCYXNlLnBoYXNlIiwiQW5pbWF0b3JCYXNlLnBsYXliYWNrU3BlZWQiLCJBbmltYXRvckJhc2Uuc2V0UmVuZGVyU3RhdGUiLCJBbmltYXRvckJhc2Uuc3RhcnQiLCJBbmltYXRvckJhc2Uuc3RvcCIsIkFuaW1hdG9yQmFzZS51cGRhdGUiLCJBbmltYXRvckJhc2UucmVzZXQiLCJBbmltYXRvckJhc2UuYWRkT3duZXIiLCJBbmltYXRvckJhc2UucmVtb3ZlT3duZXIiLCJBbmltYXRvckJhc2UuX3BVcGRhdGVEZWx0YVRpbWUiLCJBbmltYXRvckJhc2Uub25FbnRlckZyYW1lIiwiQW5pbWF0b3JCYXNlLmFwcGx5UG9zaXRpb25EZWx0YSIsIkFuaW1hdG9yQmFzZS5kaXNwYXRjaEN5Y2xlRXZlbnQiLCJBbmltYXRvckJhc2UuY2xvbmUiLCJBbmltYXRvckJhc2UuZGlzcG9zZSIsIkFuaW1hdG9yQmFzZS50ZXN0R1BVQ29tcGF0aWJpbGl0eSIsIkFuaW1hdG9yQmFzZS5hc3NldFR5cGUiLCJBbmltYXRvckJhc2UuZ2V0UmVuZGVyYWJsZVN1Ykdlb21ldHJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQSxJQUFPLFNBQVMsV0FBZSx3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QUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3RDQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEdkI7O09BRUdBO0lBQ0lBLDRCQUFLQSxHQUFaQTtRQUVDd0IsTUFBTUEsSUFBSUEsbUJBQW1CQSxFQUFFQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFFRHhCOztPQUVHQTtJQUNJQSw4QkFBT0EsR0FBZEE7SUFFQXlCLENBQUNBO0lBRUR6Qjs7T0FFR0E7SUFDSUEsMkNBQW9CQSxHQUEzQkEsVUFBNEJBLFlBQTZCQTtRQUV4RDBCLE1BQU1BLElBQUlBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7SUFDakNBLENBQUNBO0lBS0QxQixzQkFBV0EsbUNBQVNBO1FBSHBCQTs7V0FFR0E7YUFDSEE7WUFFQzJCLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBO1FBQzNCQSxDQUFDQTs7O09BQUEzQjtJQUdNQSwrQ0FBd0JBLEdBQS9CQSxVQUFnQ0EsVUFBb0NBLEVBQUVBLGlCQUFxQ0E7UUFFMUc0QixBQUNBQSxvQkFEb0JBO1FBQ3BCQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBO0lBQzFCQSxDQUFDQTtJQUNGNUIsbUJBQUNBO0FBQURBLENBelZBLEFBeVZDQSxFQXpWMEIsY0FBYyxFQXlWeEM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoiYW5pbWF0b3JzL0FuaW1hdG9yQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJQW5pbWF0aW9uU2V0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYW5pbWF0b3JzL0lBbmltYXRpb25TZXRcIik7XG5pbXBvcnQgSUFuaW1hdG9yXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9hbmltYXRvcnMvSUFuaW1hdG9yXCIpO1xuaW1wb3J0IEFuaW1hdGlvbk5vZGVCYXNlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2FuaW1hdG9ycy9ub2Rlcy9BbmltYXRpb25Ob2RlQmFzZVwiKTtcbmltcG9ydCBUcmlhbmdsZVN1Ykdlb21ldHJ5XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9UcmlhbmdsZVN1Ykdlb21ldHJ5XCIpO1xuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IE5hbWVkQXNzZXRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L05hbWVkQXNzZXRCYXNlXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcbmltcG9ydCBnZXRUaW1lclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9nZXRUaW1lclwiKTtcblxuaW1wb3J0IElBbmltYXRpb25TdGF0ZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FuaW1hdG9ycy9zdGF0ZXMvSUFuaW1hdGlvblN0YXRlXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1JlbmRlcmFibGVCYXNlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGVcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvVHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZVwiKTtcbmltcG9ydCBBbmltYXRvckV2ZW50XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL0FuaW1hdG9yRXZlbnRcIik7XG5pbXBvcnQgU2hhZGVyT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJPYmplY3RCYXNlXCIpO1xuXG4vKipcbiAqIERpc3BhdGNoZWQgd2hlbiBwbGF5YmFjayBvZiBhbiBhbmltYXRpb24gaW5zaWRlIHRoZSBhbmltYXRvciBvYmplY3Qgc3RhcnRzLlxuICpcbiAqIEBldmVudFR5cGUgYXdheTNkLmV2ZW50cy5BbmltYXRvckV2ZW50XG4gKi9cbi8vW0V2ZW50KG5hbWU9XCJzdGFydFwiLCB0eXBlPVwiYXdheTNkLmV2ZW50cy5BbmltYXRvckV2ZW50XCIpXVxuXG4vKipcbiAqIERpc3BhdGNoZWQgd2hlbiBwbGF5YmFjayBvZiBhbiBhbmltYXRpb24gaW5zaWRlIHRoZSBhbmltYXRvciBvYmplY3Qgc3RvcHMuXG4gKlxuICogQGV2ZW50VHlwZSBhd2F5M2QuZXZlbnRzLkFuaW1hdG9yRXZlbnRcbiAqL1xuLy9bRXZlbnQobmFtZT1cInN0b3BcIiwgdHlwZT1cImF3YXkzZC5ldmVudHMuQW5pbWF0b3JFdmVudFwiKV1cblxuLyoqXG4gKiBEaXNwYXRjaGVkIHdoZW4gcGxheWJhY2sgb2YgYW4gYW5pbWF0aW9uIHJlYWNoZXMgdGhlIGVuZCBvZiBhbiBhbmltYXRpb24uXG4gKlxuICogQGV2ZW50VHlwZSBhd2F5M2QuZXZlbnRzLkFuaW1hdG9yRXZlbnRcbiAqL1xuLy9bRXZlbnQobmFtZT1cImN5Y2xlX2NvbXBsZXRlXCIsIHR5cGU9XCJhd2F5M2QuZXZlbnRzLkFuaW1hdG9yRXZlbnRcIildXG5cbi8qKlxuICogUHJvdmlkZXMgYW4gYWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYW5pbWF0b3IgY2xhc3NlcyB0aGF0IGNvbnRyb2wgYW5pbWF0aW9uIG91dHB1dCBmcm9tIGEgZGF0YSBzZXQgc3VidHlwZSBvZiA8Y29kZT5BbmltYXRpb25TZXRCYXNlPC9jb2RlPi5cbiAqXG4gKiBAc2VlIGF3YXkuYW5pbWF0b3JzLkFuaW1hdGlvblNldEJhc2VcbiAqL1xuY2xhc3MgQW5pbWF0b3JCYXNlIGV4dGVuZHMgTmFtZWRBc3NldEJhc2UgaW1wbGVtZW50cyBJQW5pbWF0b3Jcbntcblx0cHJpdmF0ZSBfYnJvYWRjYXN0ZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF9pc1BsYXlpbmc6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYXV0b1VwZGF0ZTpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfc3RhcnRFdmVudDpBbmltYXRvckV2ZW50O1xuXHRwcml2YXRlIF9zdG9wRXZlbnQ6QW5pbWF0b3JFdmVudDtcblx0cHJpdmF0ZSBfY3ljbGVFdmVudDpBbmltYXRvckV2ZW50O1xuXHRwcml2YXRlIF90aW1lOm51bWJlciAvKmludCovID0gMDtcblx0cHJpdmF0ZSBfcGxheWJhY2tTcGVlZDpudW1iZXIgPSAxO1xuXG5cdHB1YmxpYyBfcEFuaW1hdGlvblNldDpJQW5pbWF0aW9uU2V0O1xuXHRwdWJsaWMgX3BPd25lcnM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHVibGljIF9wQWN0aXZlTm9kZTpBbmltYXRpb25Ob2RlQmFzZTtcblx0cHVibGljIF9wQWN0aXZlU3RhdGU6SUFuaW1hdGlvblN0YXRlO1xuXHRwdWJsaWMgX3BBY3RpdmVBbmltYXRpb25OYW1lOnN0cmluZztcblx0cHVibGljIF9wQWJzb2x1dGVUaW1lOm51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBfYW5pbWF0aW9uU3RhdGVzOk9iamVjdCA9IG5ldyBPYmplY3QoKTtcblxuXHQvKipcblx0ICogRW5hYmxlcyB0cmFuc2xhdGlvbiBvZiB0aGUgYW5pbWF0ZWQgbWVzaCBmcm9tIGRhdGEgcmV0dXJuZWQgcGVyIGZyYW1lIHZpYSB0aGUgcG9zaXRpb25EZWx0YSBwcm9wZXJ0eSBvZiB0aGUgYWN0aXZlIGFuaW1hdGlvbiBub2RlLiBEZWZhdWx0cyB0byB0cnVlLlxuXHQgKlxuXHQgKiBAc2VlIGF3YXkuYW5pbWF0b3JzLklBbmltYXRpb25TdGF0ZSNwb3NpdGlvbkRlbHRhXG5cdCAqL1xuXHRwdWJsaWMgdXBkYXRlUG9zaXRpb246Ym9vbGVhbiA9IHRydWU7XG5cblx0cHVibGljIGdldEFuaW1hdGlvblN0YXRlKG5vZGU6QW5pbWF0aW9uTm9kZUJhc2UpOklBbmltYXRpb25TdGF0ZVxuXHR7XG5cdFx0dmFyIGNsYXNzTmFtZTphbnkgPSBub2RlLnN0YXRlQ2xhc3M7XG5cdFx0dmFyIHVJRDpudW1iZXIgPSBub2RlLmlkO1xuXG5cdFx0aWYgKHRoaXMuX2FuaW1hdGlvblN0YXRlc1t1SURdID09IG51bGwpXG5cdFx0XHR0aGlzLl9hbmltYXRpb25TdGF0ZXNbdUlEXSA9IG5ldyBjbGFzc05hbWUodGhpcywgbm9kZSk7XG5cblx0XHRyZXR1cm4gdGhpcy5fYW5pbWF0aW9uU3RhdGVzW3VJRF07XG5cdH1cblxuXHRwdWJsaWMgZ2V0QW5pbWF0aW9uU3RhdGVCeU5hbWUobmFtZTpzdHJpbmcpOklBbmltYXRpb25TdGF0ZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QW5pbWF0aW9uU3RhdGUodGhpcy5fcEFuaW1hdGlvblNldC5nZXRBbmltYXRpb24obmFtZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGludGVybmFsIGFic29sdXRlIHRpbWUgb2YgdGhlIGFuaW1hdG9yLCBjYWxjdWxhdGVkIGJ5IHRoZSBjdXJyZW50IHRpbWUgYW5kIHRoZSBwbGF5YmFjayBzcGVlZC5cblx0ICpcblx0ICogQHNlZSAjdGltZVxuXHQgKiBAc2VlICNwbGF5YmFja1NwZWVkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFic29sdXRlVGltZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BBYnNvbHV0ZVRpbWU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW5pbWF0aW9uIGRhdGEgc2V0IGluIHVzZSBieSB0aGUgYW5pbWF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFuaW1hdGlvblNldCgpOklBbmltYXRpb25TZXRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wQW5pbWF0aW9uU2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgYWN0aXZlIGFuaW1hdGlvbiBzdGF0ZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYWN0aXZlU3RhdGUoKTpJQW5pbWF0aW9uU3RhdGVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wQWN0aXZlU3RhdGU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBhY3RpdmUgYW5pbWF0aW9uIG5vZGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFjdGl2ZUFuaW1hdGlvbigpOkFuaW1hdGlvbk5vZGVCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcEFuaW1hdGlvblNldC5nZXRBbmltYXRpb24odGhpcy5fcEFjdGl2ZUFuaW1hdGlvbk5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgYWN0aXZlIGFuaW1hdGlvbiBub2RlLlxuXHQgKi9cblx0cHVibGljIGdldCBhY3RpdmVBbmltYXRpb25OYW1lKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcEFjdGl2ZUFuaW1hdGlvbk5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBhbmltYXRvcnMgaW50ZXJuYWwgdXBkYXRlIG1lY2hhbmlzbXMgYXJlIGFjdGl2ZS4gVXNlZCBpbiBjYXNlc1xuXHQgKiB3aGVyZSBtYW51YWwgdXBkYXRlcyBhcmUgcmVxdWlyZWQgZWl0aGVyIHZpYSB0aGUgPGNvZGU+dGltZTwvY29kZT4gcHJvcGVydHkgb3IgPGNvZGU+dXBkYXRlKCk8L2NvZGU+IG1ldGhvZC5cblx0ICogRGVmYXVsdHMgdG8gdHJ1ZS5cblx0ICpcblx0ICogQHNlZSAjdGltZVxuXHQgKiBAc2VlICN1cGRhdGUoKVxuXHQgKi9cblx0cHVibGljIGdldCBhdXRvVXBkYXRlKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2F1dG9VcGRhdGU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGF1dG9VcGRhdGUodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9hdXRvVXBkYXRlID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYXV0b1VwZGF0ZSA9IHZhbHVlO1xuXG5cdFx0aWYgKHRoaXMuX2F1dG9VcGRhdGUpXG5cdFx0XHR0aGlzLnN0YXJ0KCk7IGVsc2Vcblx0XHRcdHRoaXMuc3RvcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYW5kIHNldHMgdGhlIGludGVybmFsIHRpbWUgY2xvY2sgb2YgdGhlIGFuaW1hdG9yLlxuXHQgKi9cblx0cHVibGljIGdldCB0aW1lKCk6bnVtYmVyIC8qaW50Ki9cblx0e1xuXHRcdHJldHVybiB0aGlzLl90aW1lO1xuXHR9XG5cblx0cHVibGljIHNldCB0aW1lKHZhbHVlOm51bWJlciAvKmludCovKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3RpbWUgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLnVwZGF0ZSh2YWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgYW5pbWF0aW9uIHBoYXNlIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZSdzIGFuaW1hdGlvbiBjbGlwKHMpLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHBoYXNlIHZhbHVlIHRvIHVzZS4gMCByZXByZXNlbnRzIHRoZSBiZWdpbm5pbmcgb2YgYW4gYW5pbWF0aW9uIGNsaXAsIDEgcmVwcmVzZW50cyB0aGUgZW5kLlxuXHQgKi9cblx0cHVibGljIHBoYXNlKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3BBY3RpdmVTdGF0ZS5waGFzZSh2YWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyA8Y29kZT5BbmltYXRvckJhc2U8L2NvZGU+IG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIGFuaW1hdGlvblNldCBUaGUgYW5pbWF0aW9uIGRhdGEgc2V0IHRvIGJlIHVzZWQgYnkgdGhlIGFuaW1hdG9yIG9iamVjdC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGFuaW1hdGlvblNldDpJQW5pbWF0aW9uU2V0KVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX3BBbmltYXRpb25TZXQgPSBhbmltYXRpb25TZXQ7XG5cblx0XHR0aGlzLl9icm9hZGNhc3RlciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgYnkgd2hpY2ggcGFzc2VkIHRpbWUgc2hvdWxkIGJlIHNjYWxlZC4gVXNlZCB0byBzbG93IGRvd24gb3Igc3BlZWQgdXAgYW5pbWF0aW9ucy4gRGVmYXVsdHMgdG8gMS5cblx0ICovXG5cdHB1YmxpYyBnZXQgcGxheWJhY2tTcGVlZCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BsYXliYWNrU3BlZWQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHBsYXliYWNrU3BlZWQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fcGxheWJhY2tTcGVlZCA9IHZhbHVlO1xuXHR9XG5cblx0cHVibGljIHNldFJlbmRlclN0YXRlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSwgdmVydGV4Q29uc3RhbnRPZmZzZXQ6bnVtYmVyIC8qaW50Ki8sIHZlcnRleFN0cmVhbU9mZnNldDpudW1iZXIgLyppbnQqLylcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzdW1lcyB0aGUgYXV0b21hdGljIHBsYXliYWNrIGNsb2NrIGNvbnRyb2xpbmcgdGhlIGFjdGl2ZSBzdGF0ZSBvZiB0aGUgYW5pbWF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2lzUGxheWluZyB8fCAhdGhpcy5fYXV0b1VwZGF0ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3RpbWUgPSB0aGlzLl9wQWJzb2x1dGVUaW1lID0gZ2V0VGltZXIoKTtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IHRydWU7XG5cblx0XHR0aGlzLl9icm9hZGNhc3Rlci5zdGFydCgpO1xuXG5cdFx0aWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoQW5pbWF0b3JFdmVudC5TVEFSVCkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodGhpcy5fc3RhcnRFdmVudCA9PSBudWxsKVxuXHRcdFx0dGhpcy5fc3RhcnRFdmVudCA9IG5ldyBBbmltYXRvckV2ZW50KEFuaW1hdG9yRXZlbnQuU1RBUlQsIHRoaXMpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3N0YXJ0RXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhdXNlcyB0aGUgYXV0b21hdGljIHBsYXliYWNrIGNsb2NrIG9mIHRoZSBhbmltYXRvciwgaW4gY2FzZSBtYW51YWwgdXBkYXRlcyBhcmUgcmVxdWlyZWQgdmlhIHRoZVxuXHQgKiA8Y29kZT50aW1lPC9jb2RlPiBwcm9wZXJ0eSBvciA8Y29kZT51cGRhdGUoKTwvY29kZT4gbWV0aG9kLlxuXHQgKlxuXHQgKiBAc2VlICN0aW1lXG5cdCAqIEBzZWUgI3VwZGF0ZSgpXG5cdCAqL1xuXHRwdWJsaWMgc3RvcCgpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2lzUGxheWluZylcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0dGhpcy5fYnJvYWRjYXN0ZXIuc3RvcCgpO1xuXG5cdFx0aWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoQW5pbWF0b3JFdmVudC5TVE9QKSlcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9zdG9wRXZlbnQgPT0gbnVsbClcblx0XHRcdHRoaXMuX3N0b3BFdmVudCA9IG5ldyBBbmltYXRvckV2ZW50KEFuaW1hdG9yRXZlbnQuU1RPUCwgdGhpcyk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fc3RvcEV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhIHdheSB0byBtYW51YWxseSB1cGRhdGUgdGhlIGFjdGl2ZSBzdGF0ZSBvZiB0aGUgYW5pbWF0b3Igd2hlbiBhdXRvbWF0aWNcblx0ICogdXBkYXRlcyBhcmUgZGlzYWJsZWQuXG5cdCAqXG5cdCAqIEBzZWUgI3N0b3AoKVxuXHQgKiBAc2VlICNhdXRvVXBkYXRlXG5cdCAqL1xuXHRwdWJsaWMgdXBkYXRlKHRpbWU6bnVtYmVyIC8qaW50Ki8pXG5cdHtcblx0XHR2YXIgZHQ6bnVtYmVyID0gKHRpbWUgLSB0aGlzLl90aW1lKSp0aGlzLnBsYXliYWNrU3BlZWQ7XG5cblx0XHR0aGlzLl9wVXBkYXRlRGVsdGFUaW1lKGR0KTtcblxuXHRcdHRoaXMuX3RpbWUgPSB0aW1lO1xuXHR9XG5cblx0cHVibGljIHJlc2V0KG5hbWU6c3RyaW5nLCBvZmZzZXQ6bnVtYmVyID0gMClcblx0e1xuXHRcdHRoaXMuZ2V0QW5pbWF0aW9uU3RhdGUodGhpcy5fcEFuaW1hdGlvblNldC5nZXRBbmltYXRpb24obmFtZSkpLm9mZnNldChvZmZzZXQgKyB0aGlzLl9wQWJzb2x1dGVUaW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHRoZSBtZXNoIG9iamVjdCB0byB3aGljaCB0aGUgYW5pbWF0b3IgaXMgYXBwbGllZCwgcmVnaXN0ZXJzIHRoZSBvd25lciBmb3IgaW50ZXJuYWwgdXNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGFkZE93bmVyKG1lc2g6TWVzaClcblx0e1xuXHRcdHRoaXMuX3BPd25lcnMucHVzaChtZXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVc2VkIGJ5IHRoZSBtZXNoIG9iamVjdCBmcm9tIHdoaWNoIHRoZSBhbmltYXRvciBpcyByZW1vdmVkLCB1bnJlZ2lzdGVycyB0aGUgb3duZXIgZm9yIGludGVybmFsIHVzZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyByZW1vdmVPd25lcihtZXNoOk1lc2gpXG5cdHtcblx0XHR0aGlzLl9wT3duZXJzLnNwbGljZSh0aGlzLl9wT3duZXJzLmluZGV4T2YobWVzaCksIDEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEludGVybmFsIGFic3RyYWN0IG1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgdGltZSBkZWx0YSBwcm9wZXJ0eSBvZiB0aGUgYW5pbWF0b3IncyBjb250ZW50cyByZXF1aXJlcyB1cGRhdGluZy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBfcFVwZGF0ZURlbHRhVGltZShkdDpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9wQWJzb2x1dGVUaW1lICs9IGR0O1xuXG5cdFx0dGhpcy5fcEFjdGl2ZVN0YXRlLnVwZGF0ZSh0aGlzLl9wQWJzb2x1dGVUaW1lKTtcblxuXHRcdGlmICh0aGlzLnVwZGF0ZVBvc2l0aW9uKVxuXHRcdFx0dGhpcy5hcHBseVBvc2l0aW9uRGVsdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFbnRlciBmcmFtZSBldmVudCBoYW5kbGVyIGZvciBhdXRvbWF0aWNhbGx5IHVwZGF0aW5nIHRoZSBhY3RpdmUgc3RhdGUgb2YgdGhlIGFuaW1hdG9yLlxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZXZlbnQ6RXZlbnQgPSBudWxsKVxuXHR7XG5cdFx0dGhpcy51cGRhdGUoZ2V0VGltZXIoKSk7XG5cdH1cblxuXHRwcml2YXRlIGFwcGx5UG9zaXRpb25EZWx0YSgpXG5cdHtcblx0XHR2YXIgZGVsdGE6VmVjdG9yM0QgPSB0aGlzLl9wQWN0aXZlU3RhdGUucG9zaXRpb25EZWx0YTtcblx0XHR2YXIgZGlzdDpudW1iZXIgPSBkZWx0YS5sZW5ndGg7XG5cdFx0dmFyIGxlbjpudW1iZXIgLyp1aW50Ki87XG5cdFx0aWYgKGRpc3QgPiAwKSB7XG5cdFx0XHRsZW4gPSB0aGlzLl9wT3duZXJzLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyIC8qdWludCovID0gMDsgaSA8IGxlbjsgKytpKVxuXHRcdFx0XHR0aGlzLl9wT3duZXJzW2ldLnRyYW5zbGF0ZUxvY2FsKGRlbHRhLCBkaXN0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogIGZvciBpbnRlcm5hbCB1c2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZGlzcGF0Y2hDeWNsZUV2ZW50KClcblx0e1xuXHRcdGlmICh0aGlzLmhhc0V2ZW50TGlzdGVuZXIoQW5pbWF0b3JFdmVudC5DWUNMRV9DT01QTEVURSkpIHtcblx0XHRcdGlmICh0aGlzLl9jeWNsZUV2ZW50ID09IG51bGwpXG5cdFx0XHRcdHRoaXMuX2N5Y2xlRXZlbnQgPSBuZXcgQW5pbWF0b3JFdmVudChBbmltYXRvckV2ZW50LkNZQ0xFX0NPTVBMRVRFLCB0aGlzKTtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2N5Y2xlRXZlbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGNsb25lKCk6QW5pbWF0b3JCYXNlXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIHRlc3RHUFVDb21wYXRpYmlsaXR5KHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGdldCBhc3NldFR5cGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBBc3NldFR5cGUuQU5JTUFUT1I7XG5cdH1cblxuXG5cdHB1YmxpYyBnZXRSZW5kZXJhYmxlU3ViR2VvbWV0cnkocmVuZGVyYWJsZTpUcmlhbmdsZVN1Yk1lc2hSZW5kZXJhYmxlLCBzb3VyY2VTdWJHZW9tZXRyeTpUcmlhbmdsZVN1Ykdlb21ldHJ5KTpUcmlhbmdsZVN1Ykdlb21ldHJ5XG5cdHtcblx0XHQvL25vdGhpbmcgdG8gZG8gaGVyZVxuXHRcdHJldHVybiBzb3VyY2VTdWJHZW9tZXRyeTtcblx0fVxufVxuXG5leHBvcnQgPSBBbmltYXRvckJhc2U7Il19