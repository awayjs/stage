var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssetType = require("awayjs-core/lib/library/AssetType");
var NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9hbmltYXRvcnMvYW5pbWF0b3JiYXNlLnRzIl0sIm5hbWVzIjpbIkFuaW1hdG9yQmFzZSIsIkFuaW1hdG9yQmFzZS5jb25zdHJ1Y3RvciIsIkFuaW1hdG9yQmFzZS5nZXRBbmltYXRpb25TdGF0ZSIsIkFuaW1hdG9yQmFzZS5nZXRBbmltYXRpb25TdGF0ZUJ5TmFtZSIsIkFuaW1hdG9yQmFzZS5hYnNvbHV0ZVRpbWUiLCJBbmltYXRvckJhc2UuYW5pbWF0aW9uU2V0IiwiQW5pbWF0b3JCYXNlLmFjdGl2ZVN0YXRlIiwiQW5pbWF0b3JCYXNlLmFjdGl2ZUFuaW1hdGlvbiIsIkFuaW1hdG9yQmFzZS5hY3RpdmVBbmltYXRpb25OYW1lIiwiQW5pbWF0b3JCYXNlLmF1dG9VcGRhdGUiLCJBbmltYXRvckJhc2UudGltZSIsIkFuaW1hdG9yQmFzZS5waGFzZSIsIkFuaW1hdG9yQmFzZS5wbGF5YmFja1NwZWVkIiwiQW5pbWF0b3JCYXNlLnNldFJlbmRlclN0YXRlIiwiQW5pbWF0b3JCYXNlLnN0YXJ0IiwiQW5pbWF0b3JCYXNlLnN0b3AiLCJBbmltYXRvckJhc2UudXBkYXRlIiwiQW5pbWF0b3JCYXNlLnJlc2V0IiwiQW5pbWF0b3JCYXNlLmFkZE93bmVyIiwiQW5pbWF0b3JCYXNlLnJlbW92ZU93bmVyIiwiQW5pbWF0b3JCYXNlLl9wVXBkYXRlRGVsdGFUaW1lIiwiQW5pbWF0b3JCYXNlLm9uRW50ZXJGcmFtZSIsIkFuaW1hdG9yQmFzZS5hcHBseVBvc2l0aW9uRGVsdGEiLCJBbmltYXRvckJhc2UuZGlzcGF0Y2hDeWNsZUV2ZW50IiwiQW5pbWF0b3JCYXNlLmNsb25lIiwiQW5pbWF0b3JCYXNlLmRpc3Bvc2UiLCJBbmltYXRvckJhc2UudGVzdEdQVUNvbXBhdGliaWxpdHkiLCJBbmltYXRvckJhc2UuYXNzZXRUeXBlIiwiQW5pbWF0b3JCYXNlLmdldFJlbmRlcmFibGVTdWJHZW9tZXRyeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FB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QUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRHZCOztPQUVHQTtJQUNJQSw0QkFBS0EsR0FBWkE7UUFFQ3dCLE1BQU1BLElBQUlBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRUR4Qjs7T0FFR0E7SUFDSUEsOEJBQU9BLEdBQWRBO0lBRUF5QixDQUFDQTtJQUVEekI7O09BRUdBO0lBQ0lBLDJDQUFvQkEsR0FBM0JBLFVBQTRCQSxZQUE2QkE7UUFFeEQwQixNQUFNQSxJQUFJQSxtQkFBbUJBLEVBQUVBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUtEMUIsc0JBQVdBLG1DQUFTQTtRQUhwQkE7O1dBRUdBO2FBQ0hBO1lBRUMyQixNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7OztPQUFBM0I7SUFHTUEsK0NBQXdCQSxHQUEvQkEsVUFBZ0NBLFVBQW9DQSxFQUFFQSxpQkFBcUNBO1FBRTFHNEIsQUFDQUEsb0JBRG9CQTtRQUNwQkEsTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7SUFDRjVCLG1CQUFDQTtBQUFEQSxDQXpWQSxBQXlWQ0EsRUF6VjBCLGNBQWMsRUF5VnhDO0FBRUQsQUFBc0IsaUJBQWIsWUFBWSxDQUFDIiwiZmlsZSI6ImFuaW1hdG9ycy9BbmltYXRvckJhc2UuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0VHlwZVwiKTtcbmltcG9ydCBOYW1lZEFzc2V0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvTmFtZWRBc3NldEJhc2VcIik7XG5pbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcbmltcG9ydCBnZXRUaW1lclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9nZXRUaW1lclwiKTtcblxuaW1wb3J0IElBbmltYXRpb25TZXRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9hbmltYXRvcnMvSUFuaW1hdGlvblNldFwiKTtcbmltcG9ydCBJQW5pbWF0b3JcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2FuaW1hdG9ycy9JQW5pbWF0b3JcIik7XG5pbXBvcnQgQW5pbWF0aW9uTm9kZUJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYW5pbWF0b3JzL25vZGVzL0FuaW1hdGlvbk5vZGVCYXNlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlU3ViR2VvbWV0cnlcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9UcmlhbmdsZVN1Ykdlb21ldHJ5XCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5cbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSUFuaW1hdGlvblN0YXRlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYW5pbWF0b3JzL3N0YXRlcy9JQW5pbWF0aW9uU3RhdGVcIik7XG5pbXBvcnQgUmVuZGVyYWJsZUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvUmVuZGVyYWJsZUJhc2VcIik7XG5pbXBvcnQgVHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZVx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9UcmlhbmdsZVN1Yk1lc2hSZW5kZXJhYmxlXCIpO1xuaW1wb3J0IEFuaW1hdG9yRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9ldmVudHMvQW5pbWF0b3JFdmVudFwiKTtcbmltcG9ydCBTaGFkZXJPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5cbi8qKlxuICogRGlzcGF0Y2hlZCB3aGVuIHBsYXliYWNrIG9mIGFuIGFuaW1hdGlvbiBpbnNpZGUgdGhlIGFuaW1hdG9yIG9iamVjdCBzdGFydHMuXG4gKlxuICogQGV2ZW50VHlwZSBhd2F5M2QuZXZlbnRzLkFuaW1hdG9yRXZlbnRcbiAqL1xuLy9bRXZlbnQobmFtZT1cInN0YXJ0XCIsIHR5cGU9XCJhd2F5M2QuZXZlbnRzLkFuaW1hdG9yRXZlbnRcIildXG5cbi8qKlxuICogRGlzcGF0Y2hlZCB3aGVuIHBsYXliYWNrIG9mIGFuIGFuaW1hdGlvbiBpbnNpZGUgdGhlIGFuaW1hdG9yIG9iamVjdCBzdG9wcy5cbiAqXG4gKiBAZXZlbnRUeXBlIGF3YXkzZC5ldmVudHMuQW5pbWF0b3JFdmVudFxuICovXG4vL1tFdmVudChuYW1lPVwic3RvcFwiLCB0eXBlPVwiYXdheTNkLmV2ZW50cy5BbmltYXRvckV2ZW50XCIpXVxuXG4vKipcbiAqIERpc3BhdGNoZWQgd2hlbiBwbGF5YmFjayBvZiBhbiBhbmltYXRpb24gcmVhY2hlcyB0aGUgZW5kIG9mIGFuIGFuaW1hdGlvbi5cbiAqXG4gKiBAZXZlbnRUeXBlIGF3YXkzZC5ldmVudHMuQW5pbWF0b3JFdmVudFxuICovXG4vL1tFdmVudChuYW1lPVwiY3ljbGVfY29tcGxldGVcIiwgdHlwZT1cImF3YXkzZC5ldmVudHMuQW5pbWF0b3JFdmVudFwiKV1cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBhYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhbmltYXRvciBjbGFzc2VzIHRoYXQgY29udHJvbCBhbmltYXRpb24gb3V0cHV0IGZyb20gYSBkYXRhIHNldCBzdWJ0eXBlIG9mIDxjb2RlPkFuaW1hdGlvblNldEJhc2U8L2NvZGU+LlxuICpcbiAqIEBzZWUgYXdheS5hbmltYXRvcnMuQW5pbWF0aW9uU2V0QmFzZVxuICovXG5jbGFzcyBBbmltYXRvckJhc2UgZXh0ZW5kcyBOYW1lZEFzc2V0QmFzZSBpbXBsZW1lbnRzIElBbmltYXRvclxue1xuXHRwcml2YXRlIF9icm9hZGNhc3RlcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX2lzUGxheWluZzpib29sZWFuO1xuXHRwcml2YXRlIF9hdXRvVXBkYXRlOmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9zdGFydEV2ZW50OkFuaW1hdG9yRXZlbnQ7XG5cdHByaXZhdGUgX3N0b3BFdmVudDpBbmltYXRvckV2ZW50O1xuXHRwcml2YXRlIF9jeWNsZUV2ZW50OkFuaW1hdG9yRXZlbnQ7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyIC8qaW50Ki8gPSAwO1xuXHRwcml2YXRlIF9wbGF5YmFja1NwZWVkOm51bWJlciA9IDE7XG5cblx0cHVibGljIF9wQW5pbWF0aW9uU2V0OklBbmltYXRpb25TZXQ7XG5cdHB1YmxpYyBfcE93bmVyczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwdWJsaWMgX3BBY3RpdmVOb2RlOkFuaW1hdGlvbk5vZGVCYXNlO1xuXHRwdWJsaWMgX3BBY3RpdmVTdGF0ZTpJQW5pbWF0aW9uU3RhdGU7XG5cdHB1YmxpYyBfcEFjdGl2ZUFuaW1hdGlvbk5hbWU6c3RyaW5nO1xuXHRwdWJsaWMgX3BBYnNvbHV0ZVRpbWU6bnVtYmVyID0gMDtcblxuXHRwcml2YXRlIF9hbmltYXRpb25TdGF0ZXM6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRyYW5zbGF0aW9uIG9mIHRoZSBhbmltYXRlZCBtZXNoIGZyb20gZGF0YSByZXR1cm5lZCBwZXIgZnJhbWUgdmlhIHRoZSBwb3NpdGlvbkRlbHRhIHByb3BlcnR5IG9mIHRoZSBhY3RpdmUgYW5pbWF0aW9uIG5vZGUuIERlZmF1bHRzIHRvIHRydWUuXG5cdCAqXG5cdCAqIEBzZWUgYXdheS5hbmltYXRvcnMuSUFuaW1hdGlvblN0YXRlI3Bvc2l0aW9uRGVsdGFcblx0ICovXG5cdHB1YmxpYyB1cGRhdGVQb3NpdGlvbjpib29sZWFuID0gdHJ1ZTtcblxuXHRwdWJsaWMgZ2V0QW5pbWF0aW9uU3RhdGUobm9kZTpBbmltYXRpb25Ob2RlQmFzZSk6SUFuaW1hdGlvblN0YXRlXG5cdHtcblx0XHR2YXIgY2xhc3NOYW1lOmFueSA9IG5vZGUuc3RhdGVDbGFzcztcblx0XHR2YXIgdUlEOm51bWJlciA9IG5vZGUuaWQ7XG5cblx0XHRpZiAodGhpcy5fYW5pbWF0aW9uU3RhdGVzW3VJRF0gPT0gbnVsbClcblx0XHRcdHRoaXMuX2FuaW1hdGlvblN0YXRlc1t1SURdID0gbmV3IGNsYXNzTmFtZSh0aGlzLCBub2RlKTtcblxuXHRcdHJldHVybiB0aGlzLl9hbmltYXRpb25TdGF0ZXNbdUlEXTtcblx0fVxuXG5cdHB1YmxpYyBnZXRBbmltYXRpb25TdGF0ZUJ5TmFtZShuYW1lOnN0cmluZyk6SUFuaW1hdGlvblN0YXRlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBbmltYXRpb25TdGF0ZSh0aGlzLl9wQW5pbWF0aW9uU2V0LmdldEFuaW1hdGlvbihuYW1lKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgaW50ZXJuYWwgYWJzb2x1dGUgdGltZSBvZiB0aGUgYW5pbWF0b3IsIGNhbGN1bGF0ZWQgYnkgdGhlIGN1cnJlbnQgdGltZSBhbmQgdGhlIHBsYXliYWNrIHNwZWVkLlxuXHQgKlxuXHQgKiBAc2VlICN0aW1lXG5cdCAqIEBzZWUgI3BsYXliYWNrU3BlZWRcblx0ICovXG5cdHB1YmxpYyBnZXQgYWJzb2x1dGVUaW1lKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcEFic29sdXRlVGltZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbmltYXRpb24gZGF0YSBzZXQgaW4gdXNlIGJ5IHRoZSBhbmltYXRvci5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW5pbWF0aW9uU2V0KCk6SUFuaW1hdGlvblNldFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BBbmltYXRpb25TZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBhY3RpdmUgYW5pbWF0aW9uIHN0YXRlLlxuXHQgKi9cblx0cHVibGljIGdldCBhY3RpdmVTdGF0ZSgpOklBbmltYXRpb25TdGF0ZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BBY3RpdmVTdGF0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGFjdGl2ZSBhbmltYXRpb24gbm9kZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYWN0aXZlQW5pbWF0aW9uKCk6QW5pbWF0aW9uTm9kZUJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wQW5pbWF0aW9uU2V0LmdldEFuaW1hdGlvbih0aGlzLl9wQWN0aXZlQW5pbWF0aW9uTmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBhY3RpdmUgYW5pbWF0aW9uIG5vZGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFjdGl2ZUFuaW1hdGlvbk5hbWUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wQWN0aXZlQW5pbWF0aW9uTmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGFuaW1hdG9ycyBpbnRlcm5hbCB1cGRhdGUgbWVjaGFuaXNtcyBhcmUgYWN0aXZlLiBVc2VkIGluIGNhc2VzXG5cdCAqIHdoZXJlIG1hbnVhbCB1cGRhdGVzIGFyZSByZXF1aXJlZCBlaXRoZXIgdmlhIHRoZSA8Y29kZT50aW1lPC9jb2RlPiBwcm9wZXJ0eSBvciA8Y29kZT51cGRhdGUoKTwvY29kZT4gbWV0aG9kLlxuXHQgKiBEZWZhdWx0cyB0byB0cnVlLlxuXHQgKlxuXHQgKiBAc2VlICN0aW1lXG5cdCAqIEBzZWUgI3VwZGF0ZSgpXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGF1dG9VcGRhdGUoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYXV0b1VwZGF0ZTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYXV0b1VwZGF0ZSh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2F1dG9VcGRhdGUgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9hdXRvVXBkYXRlID0gdmFsdWU7XG5cblx0XHRpZiAodGhpcy5fYXV0b1VwZGF0ZSlcblx0XHRcdHRoaXMuc3RhcnQoKTsgZWxzZVxuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbmQgc2V0cyB0aGUgaW50ZXJuYWwgdGltZSBjbG9jayBvZiB0aGUgYW5pbWF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHRpbWUoKTpudW1iZXIgLyppbnQqL1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3RpbWU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHRpbWUodmFsdWU6bnVtYmVyIC8qaW50Ki8pXG5cdHtcblx0XHRpZiAodGhpcy5fdGltZSA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMudXBkYXRlKHZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBhbmltYXRpb24gcGhhc2Ugb2YgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlJ3MgYW5pbWF0aW9uIGNsaXAocykuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgcGhhc2UgdmFsdWUgdG8gdXNlLiAwIHJlcHJlc2VudHMgdGhlIGJlZ2lubmluZyBvZiBhbiBhbmltYXRpb24gY2xpcCwgMSByZXByZXNlbnRzIHRoZSBlbmQuXG5cdCAqL1xuXHRwdWJsaWMgcGhhc2UodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fcEFjdGl2ZVN0YXRlLnBoYXNlKHZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IDxjb2RlPkFuaW1hdG9yQmFzZTwvY29kZT4gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5pbWF0aW9uU2V0IFRoZSBhbmltYXRpb24gZGF0YSBzZXQgdG8gYmUgdXNlZCBieSB0aGUgYW5pbWF0b3Igb2JqZWN0LlxuXHQgKi9cblx0Y29uc3RydWN0b3IoYW5pbWF0aW9uU2V0OklBbmltYXRpb25TZXQpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fcEFuaW1hdGlvblNldCA9IGFuaW1hdGlvblNldDtcblxuXHRcdHRoaXMuX2Jyb2FkY2FzdGVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBieSB3aGljaCBwYXNzZWQgdGltZSBzaG91bGQgYmUgc2NhbGVkLiBVc2VkIHRvIHNsb3cgZG93biBvciBzcGVlZCB1cCBhbmltYXRpb25zLiBEZWZhdWx0cyB0byAxLlxuXHQgKi9cblx0cHVibGljIGdldCBwbGF5YmFja1NwZWVkKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcGxheWJhY2tTcGVlZDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgcGxheWJhY2tTcGVlZCh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9wbGF5YmFja1NwZWVkID0gdmFsdWU7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyU3RhdGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlbmRlcmFibGU6UmVuZGVyYWJsZUJhc2UsIHN0YWdlOlN0YWdlLCBjYW1lcmE6Q2FtZXJhLCB2ZXJ0ZXhDb25zdGFudE9mZnNldDpudW1iZXIgLyppbnQqLywgdmVydGV4U3RyZWFtT2Zmc2V0Om51bWJlciAvKmludCovKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXN1bWVzIHRoZSBhdXRvbWF0aWMgcGxheWJhY2sgY2xvY2sgY29udHJvbGluZyB0aGUgYWN0aXZlIHN0YXRlIG9mIHRoZSBhbmltYXRvci5cblx0ICovXG5cdHB1YmxpYyBzdGFydCgpXG5cdHtcblx0XHRpZiAodGhpcy5faXNQbGF5aW5nIHx8ICF0aGlzLl9hdXRvVXBkYXRlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdGltZSA9IHRoaXMuX3BBYnNvbHV0ZVRpbWUgPSBnZXRUaW1lcigpO1xuXG5cdFx0dGhpcy5faXNQbGF5aW5nID0gdHJ1ZTtcblxuXHRcdHRoaXMuX2Jyb2FkY2FzdGVyLnN0YXJ0KCk7XG5cblx0XHRpZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcihBbmltYXRvckV2ZW50LlNUQVJUKSlcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9zdGFydEV2ZW50ID09IG51bGwpXG5cdFx0XHR0aGlzLl9zdGFydEV2ZW50ID0gbmV3IEFuaW1hdG9yRXZlbnQoQW5pbWF0b3JFdmVudC5TVEFSVCwgdGhpcyk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fc3RhcnRFdmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogUGF1c2VzIHRoZSBhdXRvbWF0aWMgcGxheWJhY2sgY2xvY2sgb2YgdGhlIGFuaW1hdG9yLCBpbiBjYXNlIG1hbnVhbCB1cGRhdGVzIGFyZSByZXF1aXJlZCB2aWEgdGhlXG5cdCAqIDxjb2RlPnRpbWU8L2NvZGU+IHByb3BlcnR5IG9yIDxjb2RlPnVwZGF0ZSgpPC9jb2RlPiBtZXRob2QuXG5cdCAqXG5cdCAqIEBzZWUgI3RpbWVcblx0ICogQHNlZSAjdXBkYXRlKClcblx0ICovXG5cdHB1YmxpYyBzdG9wKClcblx0e1xuXHRcdGlmICghdGhpcy5faXNQbGF5aW5nKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5faXNQbGF5aW5nID0gZmFsc2U7XG5cblx0XHR0aGlzLl9icm9hZGNhc3Rlci5zdG9wKCk7XG5cblx0XHRpZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcihBbmltYXRvckV2ZW50LlNUT1ApKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX3N0b3BFdmVudCA9PSBudWxsKVxuXHRcdFx0dGhpcy5fc3RvcEV2ZW50ID0gbmV3IEFuaW1hdG9yRXZlbnQoQW5pbWF0b3JFdmVudC5TVE9QLCB0aGlzKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9zdG9wRXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGEgd2F5IHRvIG1hbnVhbGx5IHVwZGF0ZSB0aGUgYWN0aXZlIHN0YXRlIG9mIHRoZSBhbmltYXRvciB3aGVuIGF1dG9tYXRpY1xuXHQgKiB1cGRhdGVzIGFyZSBkaXNhYmxlZC5cblx0ICpcblx0ICogQHNlZSAjc3RvcCgpXG5cdCAqIEBzZWUgI2F1dG9VcGRhdGVcblx0ICovXG5cdHB1YmxpYyB1cGRhdGUodGltZTpudW1iZXIgLyppbnQqLylcblx0e1xuXHRcdHZhciBkdDpudW1iZXIgPSAodGltZSAtIHRoaXMuX3RpbWUpKnRoaXMucGxheWJhY2tTcGVlZDtcblxuXHRcdHRoaXMuX3BVcGRhdGVEZWx0YVRpbWUoZHQpO1xuXG5cdFx0dGhpcy5fdGltZSA9IHRpbWU7XG5cdH1cblxuXHRwdWJsaWMgcmVzZXQobmFtZTpzdHJpbmcsIG9mZnNldDpudW1iZXIgPSAwKVxuXHR7XG5cdFx0dGhpcy5nZXRBbmltYXRpb25TdGF0ZSh0aGlzLl9wQW5pbWF0aW9uU2V0LmdldEFuaW1hdGlvbihuYW1lKSkub2Zmc2V0KG9mZnNldCArIHRoaXMuX3BBYnNvbHV0ZVRpbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdGhlIG1lc2ggb2JqZWN0IHRvIHdoaWNoIHRoZSBhbmltYXRvciBpcyBhcHBsaWVkLCByZWdpc3RlcnMgdGhlIG93bmVyIGZvciBpbnRlcm5hbCB1c2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgYWRkT3duZXIobWVzaDpNZXNoKVxuXHR7XG5cdFx0dGhpcy5fcE93bmVycy5wdXNoKG1lc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVzZWQgYnkgdGhlIG1lc2ggb2JqZWN0IGZyb20gd2hpY2ggdGhlIGFuaW1hdG9yIGlzIHJlbW92ZWQsIHVucmVnaXN0ZXJzIHRoZSBvd25lciBmb3IgaW50ZXJuYWwgdXNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIHJlbW92ZU93bmVyKG1lc2g6TWVzaClcblx0e1xuXHRcdHRoaXMuX3BPd25lcnMuc3BsaWNlKHRoaXMuX3BPd25lcnMuaW5kZXhPZihtZXNoKSwgMSk7XG5cdH1cblxuXHQvKipcblx0ICogSW50ZXJuYWwgYWJzdHJhY3QgbWV0aG9kIGNhbGxlZCB3aGVuIHRoZSB0aW1lIGRlbHRhIHByb3BlcnR5IG9mIHRoZSBhbmltYXRvcidzIGNvbnRlbnRzIHJlcXVpcmVzIHVwZGF0aW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIF9wVXBkYXRlRGVsdGFUaW1lKGR0Om51bWJlcilcblx0e1xuXHRcdHRoaXMuX3BBYnNvbHV0ZVRpbWUgKz0gZHQ7XG5cblx0XHR0aGlzLl9wQWN0aXZlU3RhdGUudXBkYXRlKHRoaXMuX3BBYnNvbHV0ZVRpbWUpO1xuXG5cdFx0aWYgKHRoaXMudXBkYXRlUG9zaXRpb24pXG5cdFx0XHR0aGlzLmFwcGx5UG9zaXRpb25EZWx0YSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVudGVyIGZyYW1lIGV2ZW50IGhhbmRsZXIgZm9yIGF1dG9tYXRpY2FsbHkgdXBkYXRpbmcgdGhlIGFjdGl2ZSBzdGF0ZSBvZiB0aGUgYW5pbWF0b3IuXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShldmVudDpFdmVudCA9IG51bGwpXG5cdHtcblx0XHR0aGlzLnVwZGF0ZShnZXRUaW1lcigpKTtcblx0fVxuXG5cdHByaXZhdGUgYXBwbHlQb3NpdGlvbkRlbHRhKClcblx0e1xuXHRcdHZhciBkZWx0YTpWZWN0b3IzRCA9IHRoaXMuX3BBY3RpdmVTdGF0ZS5wb3NpdGlvbkRlbHRhO1xuXHRcdHZhciBkaXN0Om51bWJlciA9IGRlbHRhLmxlbmd0aDtcblx0XHR2YXIgbGVuOm51bWJlciAvKnVpbnQqLztcblx0XHRpZiAoZGlzdCA+IDApIHtcblx0XHRcdGxlbiA9IHRoaXMuX3BPd25lcnMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgLyp1aW50Ki8gPSAwOyBpIDwgbGVuOyArK2kpXG5cdFx0XHRcdHRoaXMuX3BPd25lcnNbaV0udHJhbnNsYXRlTG9jYWwoZGVsdGEsIGRpc3QpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiAgZm9yIGludGVybmFsIHVzZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBkaXNwYXRjaEN5Y2xlRXZlbnQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihBbmltYXRvckV2ZW50LkNZQ0xFX0NPTVBMRVRFKSkge1xuXHRcdFx0aWYgKHRoaXMuX2N5Y2xlRXZlbnQgPT0gbnVsbClcblx0XHRcdFx0dGhpcy5fY3ljbGVFdmVudCA9IG5ldyBBbmltYXRvckV2ZW50KEFuaW1hdG9yRXZlbnQuQ1lDTEVfQ09NUExFVEUsIHRoaXMpO1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fY3ljbGVFdmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgY2xvbmUoKTpBbmltYXRvckJhc2Vcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgdGVzdEdQVUNvbXBhdGliaWxpdHkoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFzc2V0VHlwZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIEFzc2V0VHlwZS5BTklNQVRPUjtcblx0fVxuXG5cblx0cHVibGljIGdldFJlbmRlcmFibGVTdWJHZW9tZXRyeShyZW5kZXJhYmxlOlRyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGUsIHNvdXJjZVN1Ykdlb21ldHJ5OlRyaWFuZ2xlU3ViR2VvbWV0cnkpOlRyaWFuZ2xlU3ViR2VvbWV0cnlcblx0e1xuXHRcdC8vbm90aGluZyB0byBkbyBoZXJlXG5cdFx0cmV0dXJuIHNvdXJjZVN1Ykdlb21ldHJ5O1xuXHR9XG59XG5cbmV4cG9ydCA9IEFuaW1hdG9yQmFzZTsiXX0=