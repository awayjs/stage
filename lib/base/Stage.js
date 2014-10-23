var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var Event = require("awayjs-core/lib/events/Event");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var CSS = require("awayjs-core/lib/utils/CSS");
var ContextMode = require("awayjs-display/lib/display/ContextMode");
var StageEvent = require("awayjs-display/lib/events/StageEvent");
var ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
var ContextWebGL = require("awayjs-stagegl/lib/base/ContextWebGL");
/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage(container, stageIndex, stageManager, forceSoftware, profile) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        _super.call(this);
        this._x = 0;
        this._y = 0;
        //private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame
        this._stageIndex = -1;
        this._antiAlias = 0;
        //private var _activeVertexBuffers : Vector.<VertexBuffer> = new Vector.<VertexBuffer>(8, true);
        //private var _activeTextures : Vector.<TextureBase> = new Vector.<TextureBase>(8, true);
        this._renderTarget = null;
        this._renderSurfaceSelector = 0;
        //private _mouse3DManager:away.managers.Mouse3DManager;
        //private _touch3DManager:Touch3DManager; //TODO: imeplement dependency Touch3DManager
        this._initialised = false;
        this._container = container;
        this._stageIndex = stageIndex;
        this._stageManager = stageManager;
        this._viewPort = new Rectangle();
        this._enableDepthAndStencil = true;
        CSS.setElementX(this._container, 0);
        CSS.setElementY(this._container, 0);
        this.visible = true;
    }
    /**
     * Requests a Context object to attach to the managed gl canvas.
     */
    Stage.prototype.requestContext = function (forceSoftware, profile, mode) {
        // If forcing software, we can be certain that the
        // returned Context will be running software mode.
        // If not, we can't be sure and should stick to the
        // old value (will likely be same if re-requesting.)
        var _this = this;
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        if (this._usesSoftwareRendering != null)
            this._usesSoftwareRendering = forceSoftware;
        this._profile = profile;
        try {
            if (mode == ContextMode.FLASH)
                new ContextStage3D(this._container, this._stageIndex, function (context) { return _this._callback(context); });
            else
                this._context = new ContextWebGL(this._container, this._stageIndex);
        }
        catch (e) {
            try {
                if (mode == ContextMode.AUTO)
                    new ContextStage3D(this._container, this._stageIndex, function (context) { return _this._callback(context); });
                else
                    this.dispatchEvent(new Event(Event.ERROR));
            }
            catch (e) {
                this.dispatchEvent(new Event(Event.ERROR));
            }
        }
        if (this._context)
            this._callback(this._context);
    };
    Object.defineProperty(Stage.prototype, "width", {
        /**
         * The width of the gl canvas
         */
        get: function () {
            return this._width;
        },
        set: function (val) {
            if (this._width == val)
                return;
            CSS.setElementWidth(this._container, val);
            this._width = this._viewPort.width = val;
            this._backBufferDirty = true;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "height", {
        /**
         * The height of the gl canvas
         */
        get: function () {
            return this._height;
        },
        set: function (val) {
            if (this._height == val)
                return;
            CSS.setElementHeight(this._container, val);
            this._height = this._viewPort.height = val;
            this._backBufferDirty = true;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "x", {
        /**
         * The x position of the gl canvas
         */
        get: function () {
            return this._x;
        },
        set: function (val) {
            if (this._x == val)
                return;
            CSS.setElementX(this._container, val);
            this._x = this._viewPort.x = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "y", {
        /**
         * The y position of the gl canvas
         */
        get: function () {
            return this._y;
        },
        set: function (val) {
            if (this._y == val)
                return;
            CSS.setElementY(this._container, val);
            this._y = this._viewPort.y = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "visible", {
        get: function () {
            return CSS.getElementVisibility(this._container);
        },
        set: function (val) {
            CSS.setElementVisibility(this._container, val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "context", {
        /**
         * The Context object associated with the given stage object.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.notifyViewportUpdated = function () {
        if (this._viewportDirty)
            return;
        this._viewportDirty = true;
        //if (!this.hasEventListener(StageEvent.VIEWPORT_UPDATED))
        //return;
        //if (!_viewportUpdated)
        this._viewportUpdated = new StageEvent(StageEvent.VIEWPORT_UPDATED);
        this.dispatchEvent(this._viewportUpdated);
    };
    Stage.prototype.notifyEnterFrame = function () {
        //if (!hasEventListener(Event.ENTER_FRAME))
        //return;
        if (!this._enterFrame)
            this._enterFrame = new Event(Event.ENTER_FRAME);
        this.dispatchEvent(this._enterFrame);
    };
    Stage.prototype.notifyExitFrame = function () {
        //if (!hasEventListener(Event.EXIT_FRAME))
        //return;
        if (!this._exitFrame)
            this._exitFrame = new Event(Event.EXIT_FRAME);
        this.dispatchEvent(this._exitFrame);
    };
    Object.defineProperty(Stage.prototype, "profile", {
        get: function () {
            return this._profile;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Disposes the Stage object, freeing the Context attached to the Stage.
     */
    Stage.prototype.dispose = function () {
        this._stageManager.iRemoveStage(this);
        this.freeContext();
        this._stageManager = null;
        this._stageIndex = -1;
    };
    /**
     * Configures the back buffer associated with the Stage object.
     * @param backBufferWidth The width of the backbuffer.
     * @param backBufferHeight The height of the backbuffer.
     * @param antiAlias The amount of anti-aliasing to use.
     * @param enableDepthAndStencil Indicates whether the back buffer contains a depth and stencil buffer.
     */
    Stage.prototype.configureBackBuffer = function (backBufferWidth, backBufferHeight, antiAlias, enableDepthAndStencil) {
        this.width = backBufferWidth;
        this.height = backBufferHeight;
        this._antiAlias = antiAlias;
        this._enableDepthAndStencil = enableDepthAndStencil;
        if (this._context)
            this._context.configureBackBuffer(backBufferWidth, backBufferHeight, antiAlias, enableDepthAndStencil);
    };
    Object.defineProperty(Stage.prototype, "enableDepthAndStencil", {
        /*
         * Indicates whether the depth and stencil buffer is used
         */
        get: function () {
            return this._enableDepthAndStencil;
        },
        set: function (enableDepthAndStencil) {
            this._enableDepthAndStencil = enableDepthAndStencil;
            this._backBufferDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "renderTarget", {
        get: function () {
            return this._renderTarget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "renderSurfaceSelector", {
        get: function () {
            return this._renderSurfaceSelector;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Clear and reset the back buffer when using a shared context
     */
    Stage.prototype.clear = function () {
        if (!this._context)
            return;
        if (this._backBufferDirty) {
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
            this._backBufferDirty = false;
        }
        this._context.clear((this._color & 0xff000000) >>> 24, (this._color & 0xff0000) >>> 16, (this._color & 0xff00) >>> 8, this._color & 0xff);
        this._bufferClear = true;
    };
    /**
     * Registers an event listener object with an EventDispatcher object so that the listener receives notification of an event. Special case for enterframe and exitframe events - will switch StageProxy into automatic render mode.
     * You can register event listeners on all nodes in the display list for a specific type of event, phase, and priority.
     *
     * @param type The type of event.
     * @param listener The listener function that processes the event.
     * @param useCapture Determines whether the listener works in the capture phase or the target and bubbling phases. If useCapture is set to true, the listener processes the event only during the capture phase and not in the target or bubbling phase. If useCapture is false, the listener processes the event only during the target or bubbling phase. To listen for the event in all three phases, call addEventListener twice, once with useCapture set to true, then again with useCapture set to false.
     * @param priority The priority level of the event listener. The priority is designated by a signed 32-bit integer. The higher the number, the higher the priority. All listeners with priority n are processed before listeners of priority n-1. If two or more listeners share the same priority, they are processed in the order in which they were added. The default priority is 0.
     * @param useWeakReference Determines whether the reference to the listener is strong or weak. A strong reference (the default) prevents your listener from being garbage-collected. A weak reference does not.
     */
    Stage.prototype.addEventListener = function (type, listener) {
        _super.prototype.addEventListener.call(this, type, listener);
        //away.Debug.throwPIR( 'StageProxy' , 'addEventListener' ,  'EnterFrame, ExitFrame');
        //if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) ){//&& ! this._frameEventDriver.hasEventListener(Event.ENTER_FRAME)){
        //_frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);
        //}
        /* Original code
         if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) && ! _frameEventDriver.hasEventListener(Event.ENTER_FRAME)){

         _frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);


         }
         */
    };
    /**
     * Removes a listener from the EventDispatcher object. Special case for enterframe and exitframe events - will switch StageProxy out of automatic render mode.
     * If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
     *
     * @param type The type of event.
     * @param listener The listener object to remove.
     * @param useCapture Specifies whether the listener was registered for the capture phase or the target and bubbling phases. If the listener was registered for both the capture phase and the target and bubbling phases, two calls to removeEventListener() are required to remove both, one call with useCapture() set to true, and another call with useCapture() set to false.
     */
    Stage.prototype.removeEventListener = function (type, listener) {
        _super.prototype.removeEventListener.call(this, type, listener);
        /*
         // Remove the main rendering listener if no EnterFrame listeners remain
         if (    ! this.hasEventListener(Event.ENTER_FRAME , this.onEnterFrame , this )
         &&  ! this.hasEventListener(Event.EXIT_FRAME , this.onEnterFrame , this) ) //&& _frameEventDriver.hasEventListener(Event.ENTER_FRAME))
         {

         //_frameEventDriver.removeEventListener(Event.ENTER_FRAME, this.onEnterFrame, this );

         }
         */
    };
    Object.defineProperty(Stage.prototype, "scissorRect", {
        get: function () {
            return this._scissorRect;
        },
        set: function (value) {
            this._scissorRect = value;
            this._context.setScissorRectangle(this._scissorRect);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "stageIndex", {
        /**
         * The index of the Stage which is managed by this instance of StageProxy.
         */
        get: function () {
            return this._stageIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "usesSoftwareRendering", {
        /**
         * Indicates whether the Stage managed by this proxy is running in software mode.
         * Remember to wait for the CONTEXT_CREATED event before checking this property,
         * as only then will it be guaranteed to be accurate.
         */
        get: function () {
            return this._usesSoftwareRendering;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "antiAlias", {
        /**
         * The antiAliasing of the Stage.
         */
        get: function () {
            return this._antiAlias;
        },
        set: function (antiAlias) {
            this._antiAlias = antiAlias;
            this._backBufferDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "viewPort", {
        /**
         * A viewPort rectangle equivalent of the Stage size and position.
         */
        get: function () {
            this._viewportDirty = false;
            return this._viewPort;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "color", {
        /**
         * The background color of the Stage.
         */
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "bufferClear", {
        /**
         * The freshly cleared state of the backbuffer before any rendering
         */
        get: function () {
            return this._bufferClear;
        },
        set: function (newBufferClear) {
            this._bufferClear = newBufferClear;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Access to fire mouseevents across multiple layered view3D instances
     */
    //		public get mouse3DManager():Mouse3DManager
    //		{
    //			return this._mouse3DManager;
    //		}
    //
    //		public set mouse3DManager(value:Mouse3DManager)
    //		{
    //			this._mouse3DManager = value;
    //		}
    /* TODO: implement dependency Touch3DManager
     public get touch3DManager():Touch3DManager
     {
     return _touch3DManager;
     }

     public set touch3DManager(value:Touch3DManager)
     {
     _touch3DManager = value;
     }
     */
    /**
     * Frees the Context associated with this StageProxy.
     */
    Stage.prototype.freeContext = function () {
        if (this._context) {
            this._context.dispose();
            this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
        }
        this._context = null;
        this._initialised = false;
    };
    /**
     * The Enter_Frame handler for processing the proxy.ENTER_FRAME and proxy.EXIT_FRAME event handlers.
     * Typically the proxy.ENTER_FRAME listener would render the layers for this Stage instance.
     */
    Stage.prototype.onEnterFrame = function (event) {
        if (!this._context)
            return;
        // Clear the stage instance
        this.clear();
        //notify the enterframe listeners
        this.notifyEnterFrame();
        // Call the present() to render the frame
        if (!this._context)
            this._context.present();
        //notify the exitframe listeners
        this.notifyExitFrame();
    };
    Stage.prototype.recoverFromDisposal = function () {
        if (!this._context)
            return false;
        //away.Debug.throwPIR( 'StageProxy' , 'recoverFromDisposal' , '' );
        /*
         if (this._iContext.driverInfo == "Disposed")
         {
         this._iContext = null;
         this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
         return false;

         }
         */
        return true;
    };
    Stage.prototype._callback = function (context) {
        this._context = context;
        this._container = this._context.container;
        // Only configure back buffer if width and height have been set,
        // which they may not have been if View.render() has yet to be
        // invoked for the first time.
        if (this._width && this._height)
            this._context.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        // Dispatch the appropriate event depending on whether context was
        // created for the first time or recreated after a device loss.
        this.dispatchEvent(new StageEvent(this._initialised ? StageEvent.CONTEXT_RECREATED : StageEvent.CONTEXT_CREATED));
        this._initialised = true;
    };
    return Stage;
})(EventDispatcher);
module.exports = Stage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL3N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5yZXF1ZXN0Q29udGV4dCIsIlN0YWdlLndpZHRoIiwiU3RhZ2UuaGVpZ2h0IiwiU3RhZ2UueCIsIlN0YWdlLnkiLCJTdGFnZS52aXNpYmxlIiwiU3RhZ2UuY29udGFpbmVyIiwiU3RhZ2UuY29udGV4dCIsIlN0YWdlLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCIsIlN0YWdlLm5vdGlmeUVudGVyRnJhbWUiLCJTdGFnZS5ub3RpZnlFeGl0RnJhbWUiLCJTdGFnZS5wcm9maWxlIiwiU3RhZ2UuZGlzcG9zZSIsIlN0YWdlLmNvbmZpZ3VyZUJhY2tCdWZmZXIiLCJTdGFnZS5lbmFibGVEZXB0aEFuZFN0ZW5jaWwiLCJTdGFnZS5yZW5kZXJUYXJnZXQiLCJTdGFnZS5yZW5kZXJTdXJmYWNlU2VsZWN0b3IiLCJTdGFnZS5jbGVhciIsIlN0YWdlLmFkZEV2ZW50TGlzdGVuZXIiLCJTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyIiwiU3RhZ2Uuc2Npc3NvclJlY3QiLCJTdGFnZS5zdGFnZUluZGV4IiwiU3RhZ2UudXNlc1NvZnR3YXJlUmVuZGVyaW5nIiwiU3RhZ2UuYW50aUFsaWFzIiwiU3RhZ2Uudmlld1BvcnQiLCJTdGFnZS5jb2xvciIsIlN0YWdlLmJ1ZmZlckNsZWFyIiwiU3RhZ2UuZnJlZUNvbnRleHQiLCJTdGFnZS5vbkVudGVyRnJhbWUiLCJTdGFnZS5yZWNvdmVyRnJvbURpc3Bvc2FsIiwiU3RhZ2UuX2NhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFPLFNBQVMsV0FBYyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sS0FBSyxXQUFlLDhCQUE4QixDQUFDLENBQUM7QUFDM0QsSUFBTyxlQUFlLFdBQWEsd0NBQXdDLENBQUMsQ0FBQztBQUk3RSxJQUFPLEdBQUcsV0FBZ0IsMkJBQTJCLENBQUMsQ0FB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LEVBNmlCbEM7QUFFRCxBQUFlLGlCQUFOLEtBQUssQ0FBQyIsImZpbGUiOiJiYXNlL1N0YWdlLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcbmltcG9ydCBFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEN1YmVUZXh0dXJlQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9DdWJlVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgUmVuZGVyVGV4dHVyZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9SZW5kZXJUZXh0dXJlXCIpO1xuaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZVByb3h5QmFzZVwiKTtcbmltcG9ydCBDU1NcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xuXG5pbXBvcnQgQ29udGV4dE1vZGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0NvbnRleHRNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0lDb250ZXh0XCIpO1xuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcblxuaW1wb3J0IFN0YWdlTWFuYWdlclx0XHRcdFx0PSByZXF1aXJlKFwibWFuYWdlcnMvU3RhZ2VNYW5hZ2VyXCIpO1xuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgQ29udGV4dFdlYkdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XG5cbi8qKlxuICogU3RhZ2UgcHJvdmlkZXMgYSBwcm94eSBjbGFzcyB0byBoYW5kbGUgdGhlIGNyZWF0aW9uIGFuZCBhdHRhY2htZW50IG9mIHRoZSBDb250ZXh0XG4gKiAoYW5kIGluIHR1cm4gdGhlIGJhY2sgYnVmZmVyKSBpdCB1c2VzLiBTdGFnZSBzaG91bGQgbmV2ZXIgYmUgY3JlYXRlZCBkaXJlY3RseSxcbiAqIGJ1dCByZXF1ZXN0ZWQgdGhyb3VnaCBTdGFnZU1hbmFnZXIuXG4gKlxuICogQHNlZSBhd2F5Lm1hbmFnZXJzLlN0YWdlTWFuYWdlclxuICpcbiAqL1xuY2xhc3MgU3RhZ2UgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXJcbntcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dDtcblx0cHJpdmF0ZSBfY29udGFpbmVyOkhUTUxFbGVtZW50O1xuXHRwcml2YXRlIF93aWR0aDpudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDpudW1iZXI7XG5cdHByaXZhdGUgX3g6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfeTpudW1iZXIgPSAwO1xuXG5cdC8vcHJpdmF0ZSBzdGF0aWMgX2ZyYW1lRXZlbnREcml2ZXI6U2hhcGUgPSBuZXcgU2hhcGUoKTsgLy8gVE9ETzogYWRkIGZyYW1lIGRyaXZlciAvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lXG5cblx0cHJpdmF0ZSBfc3RhZ2VJbmRleDpudW1iZXIgPSAtMTtcblxuXHRwcml2YXRlIF91c2VzU29mdHdhcmVSZW5kZXJpbmc6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfcHJvZmlsZTpzdHJpbmc7XG5cdHByaXZhdGUgX3N0YWdlTWFuYWdlcjpTdGFnZU1hbmFnZXI7XG5cdHByaXZhdGUgX2FudGlBbGlhczpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9lbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfY29udGV4dFJlcXVlc3RlZDpib29sZWFuO1xuXG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVZlcnRleEJ1ZmZlcnMgOiBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4gPSBuZXcgVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+KDgsIHRydWUpO1xuXHQvL3ByaXZhdGUgdmFyIF9hY3RpdmVUZXh0dXJlcyA6IFZlY3Rvci48VGV4dHVyZUJhc2U+ID0gbmV3IFZlY3Rvci48VGV4dHVyZUJhc2U+KDgsIHRydWUpO1xuXHRwcml2YXRlIF9yZW5kZXJUYXJnZXQ6VGV4dHVyZVByb3h5QmFzZSA9IG51bGw7XG5cdHByaXZhdGUgX3JlbmRlclN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9zY2lzc29yUmVjdDpSZWN0YW5nbGU7XG5cdHByaXZhdGUgX2NvbG9yOm51bWJlcjtcblx0cHJpdmF0ZSBfYmFja0J1ZmZlckRpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX3ZpZXdQb3J0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfZW50ZXJGcmFtZTpFdmVudDtcblx0cHJpdmF0ZSBfZXhpdEZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydFVwZGF0ZWQ6U3RhZ2VFdmVudDtcblx0cHJpdmF0ZSBfdmlld3BvcnREaXJ0eTpib29sZWFuO1xuXHRwcml2YXRlIF9idWZmZXJDbGVhcjpib29sZWFuO1xuXG5cdC8vcHJpdmF0ZSBfbW91c2UzRE1hbmFnZXI6YXdheS5tYW5hZ2Vycy5Nb3VzZTNETWFuYWdlcjtcblx0Ly9wcml2YXRlIF90b3VjaDNETWFuYWdlcjpUb3VjaDNETWFuYWdlcjsgLy9UT0RPOiBpbWVwbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblxuXHRwcml2YXRlIF9pbml0aWFsaXNlZDpib29sZWFuID0gZmFsc2U7XG5cblx0Y29uc3RydWN0b3IoY29udGFpbmVyOkhUTUxDYW52YXNFbGVtZW50LCBzdGFnZUluZGV4Om51bWJlciwgc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcblxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xuXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gc3RhZ2VNYW5hZ2VyO1xuXG5cdFx0dGhpcy5fdmlld1BvcnQgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cblx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgQ29udGV4dCBvYmplY3QgdG8gYXR0YWNoIHRvIHRoZSBtYW5hZ2VkIGdsIGNhbnZhcy5cblx0ICovXG5cdHB1YmxpYyByZXF1ZXN0Q29udGV4dChmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpXG5cdHtcblx0XHQvLyBJZiBmb3JjaW5nIHNvZnR3YXJlLCB3ZSBjYW4gYmUgY2VydGFpbiB0aGF0IHRoZVxuXHRcdC8vIHJldHVybmVkIENvbnRleHQgd2lsbCBiZSBydW5uaW5nIHNvZnR3YXJlIG1vZGUuXG5cdFx0Ly8gSWYgbm90LCB3ZSBjYW4ndCBiZSBzdXJlIGFuZCBzaG91bGQgc3RpY2sgdG8gdGhlXG5cdFx0Ly8gb2xkIHZhbHVlICh3aWxsIGxpa2VseSBiZSBzYW1lIGlmIHJlLXJlcXVlc3RpbmcuKVxuXG5cdFx0aWYgKHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyAhPSBudWxsKVxuXHRcdFx0dGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nID0gZm9yY2VTb2Z0d2FyZTtcblxuXHRcdHRoaXMuX3Byb2ZpbGUgPSBwcm9maWxlO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChtb2RlID09IENvbnRleHRNb2RlLkZMQVNIKVxuXHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIHRoaXMuX3N0YWdlSW5kZXgsIChjb250ZXh0OklDb250ZXh0KSA9PiB0aGlzLl9jYWxsYmFjayhjb250ZXh0KSk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRoaXMuX2NvbnRleHQgPSBuZXcgQ29udGV4dFdlYkdMKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCB0aGlzLl9zdGFnZUluZGV4KTtcblxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChtb2RlID09IENvbnRleHRNb2RlLkFVVE8pXG5cdFx0XHRcdFx0bmV3IENvbnRleHRTdGFnZTNEKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCB0aGlzLl9zdGFnZUluZGV4LCAoY29udGV4dDpJQ29udGV4dCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NhbGxiYWNrKHRoaXMuX2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3dpZHRoID0gdGhpcy5fdmlld1BvcnQud2lkdGggPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl94ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB5KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0cHVibGljIHNldCB2aXNpYmxlKHZhbDpib29sZWFuKVxuXHR7XG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXG5cdHtcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29udGV4dCgpOklDb250ZXh0XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGV4dDtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5Vmlld3BvcnRVcGRhdGVkKClcblx0e1xuXHRcdGlmICh0aGlzLl92aWV3cG9ydERpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IHRydWU7XG5cblx0XHQvL2lmICghdGhpcy5oYXNFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHQvL2lmICghX3ZpZXdwb3J0VXBkYXRlZClcblx0XHR0aGlzLl92aWV3cG9ydFVwZGF0ZWQgPSBuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCk7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeUVudGVyRnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9lbnRlckZyYW1lKVxuXHRcdFx0dGhpcy5fZW50ZXJGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FTlRFUl9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZW50ZXJGcmFtZSk7XG5cblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RXhpdEZyYW1lKClcblx0e1xuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVYSVRfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9leGl0RnJhbWUpXG5cdFx0XHR0aGlzLl9leGl0RnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRVhJVF9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZXhpdEZyYW1lKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcHJvZmlsZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Byb2ZpbGU7XG5cdH1cblxuXHQvKipcblx0ICogRGlzcG9zZXMgdGhlIFN0YWdlIG9iamVjdCwgZnJlZWluZyB0aGUgQ29udGV4dCBhdHRhY2hlZCB0byB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlKHRoaXMpO1xuXHRcdHRoaXMuZnJlZUNvbnRleHQoKTtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIgPSBudWxsO1xuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSAtMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmVzIHRoZSBiYWNrIGJ1ZmZlciBhc3NvY2lhdGVkIHdpdGggdGhlIFN0YWdlIG9iamVjdC5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJXaWR0aCBUaGUgd2lkdGggb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVySGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBhbnRpQWxpYXMgVGhlIGFtb3VudCBvZiBhbnRpLWFsaWFzaW5nIHRvIHVzZS5cblx0ICogQHBhcmFtIGVuYWJsZURlcHRoQW5kU3RlbmNpbCBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYmFjayBidWZmZXIgY29udGFpbnMgYSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGg6bnVtYmVyLCBiYWNrQnVmZmVySGVpZ2h0Om51bWJlciwgYW50aUFsaWFzOm51bWJlciwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLndpZHRoID0gYmFja0J1ZmZlcldpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gYmFja0J1ZmZlckhlaWdodDtcblxuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGgsIGJhY2tCdWZmZXJIZWlnaHQsIGFudGlBbGlhcywgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0fVxuXG5cdC8qXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIgaXMgdXNlZFxuXHQgKi9cblx0cHVibGljIGdldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHR9XG5cblx0cHVibGljIHNldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyVGFyZ2V0KCk6VGV4dHVyZVByb3h5QmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclRhcmdldDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyU3VyZmFjZVNlbGVjdG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yO1xuXHR9XG5cblx0Lypcblx0ICogQ2xlYXIgYW5kIHJlc2V0IHRoZSBiYWNrIGJ1ZmZlciB3aGVuIHVzaW5nIGEgc2hhcmVkIGNvbnRleHRcblx0ICovXG5cdHB1YmxpYyBjbGVhcigpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodGhpcy5fYmFja0J1ZmZlckRpcnR5KSB7XG5cdFx0XHR0aGlzLmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHRcdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5jbGVhcigoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAwMCApID4+PiAyNCwgLy8gPC0tLS0tLS0tLSBaZXJvLWZpbGwgcmlnaHQgc2hpZnRcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAgKSA+Pj4gMTYsIC8vIDwtLS0tLS0tLS0tLS0tfFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAgKSA+Pj4gOCwgLy8gPC0tLS0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fY29sb3IgJiAweGZmKTtcblxuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgb2JqZWN0IHdpdGggYW4gRXZlbnREaXNwYXRjaGVyIG9iamVjdCBzbyB0aGF0IHRoZSBsaXN0ZW5lciByZWNlaXZlcyBub3RpZmljYXRpb24gb2YgYW4gZXZlbnQuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgaW50byBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIFlvdSBjYW4gcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIG9uIGFsbCBub2RlcyBpbiB0aGUgZGlzcGxheSBsaXN0IGZvciBhIHNwZWNpZmljIHR5cGUgb2YgZXZlbnQsIHBoYXNlLCBhbmQgcHJpb3JpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIHRoZSBldmVudC5cblx0ICogQHBhcmFtIHVzZUNhcHR1cmUgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3b3JrcyBpbiB0aGUgY2FwdHVyZSBwaGFzZSBvciB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMuIElmIHVzZUNhcHR1cmUgaXMgc2V0IHRvIHRydWUsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCBub3QgaW4gdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gSWYgdXNlQ2FwdHVyZSBpcyBmYWxzZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gVG8gbGlzdGVuIGZvciB0aGUgZXZlbnQgaW4gYWxsIHRocmVlIHBoYXNlcywgY2FsbCBhZGRFdmVudExpc3RlbmVyIHR3aWNlLCBvbmNlIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gdHJ1ZSwgdGhlbiBhZ2FpbiB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIGZhbHNlLlxuXHQgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gVGhlIHByaW9yaXR5IGlzIGRlc2lnbmF0ZWQgYnkgYSBzaWduZWQgMzItYml0IGludGVnZXIuIFRoZSBoaWdoZXIgdGhlIG51bWJlciwgdGhlIGhpZ2hlciB0aGUgcHJpb3JpdHkuIEFsbCBsaXN0ZW5lcnMgd2l0aCBwcmlvcml0eSBuIGFyZSBwcm9jZXNzZWQgYmVmb3JlIGxpc3RlbmVycyBvZiBwcmlvcml0eSBuLTEuIElmIHR3byBvciBtb3JlIGxpc3RlbmVycyBzaGFyZSB0aGUgc2FtZSBwcmlvcml0eSwgdGhleSBhcmUgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQuIFRoZSBkZWZhdWx0IHByaW9yaXR5IGlzIDAuXG5cdCAqIEBwYXJhbSB1c2VXZWFrUmVmZXJlbmNlIERldGVybWluZXMgd2hldGhlciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0ZW5lciBpcyBzdHJvbmcgb3Igd2Vhay4gQSBzdHJvbmcgcmVmZXJlbmNlICh0aGUgZGVmYXVsdCkgcHJldmVudHMgeW91ciBsaXN0ZW5lciBmcm9tIGJlaW5nIGdhcmJhZ2UtY29sbGVjdGVkLiBBIHdlYWsgcmVmZXJlbmNlIGRvZXMgbm90LlxuXHQgKi9cblx0cHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxuXHR7XG5cdFx0c3VwZXIuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdhZGRFdmVudExpc3RlbmVyJyAsICAnRW50ZXJGcmFtZSwgRXhpdEZyYW1lJyk7XG5cblx0XHQvL2lmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICl7Ly8mJiAhIHRoaXMuX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0Ly9fZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXHRcdC8vfVxuXG5cdFx0LyogT3JpZ2luYWwgY29kZVxuXHRcdCBpZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSAmJiAhIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcblxuXHRcdCBfZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBvdXQgb2YgYXV0b21hdGljIHJlbmRlciBtb2RlLlxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaGluZyBsaXN0ZW5lciByZWdpc3RlcmVkIHdpdGggdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QsIGEgY2FsbCB0byB0aGlzIG1ldGhvZCBoYXMgbm8gZWZmZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBvYmplY3QgdG8gcmVtb3ZlLlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBTcGVjaWZpZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciBib3RoIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMsIHR3byBjYWxscyB0byByZW1vdmVFdmVudExpc3RlbmVyKCkgYXJlIHJlcXVpcmVkIHRvIHJlbW92ZSBib3RoLCBvbmUgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gdHJ1ZSwgYW5kIGFub3RoZXIgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gZmFsc2UuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8qXG5cdFx0IC8vIFJlbW92ZSB0aGUgbWFpbiByZW5kZXJpbmcgbGlzdGVuZXIgaWYgbm8gRW50ZXJGcmFtZSBsaXN0ZW5lcnMgcmVtYWluXG5cdFx0IGlmICggICAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMgKVxuXHRcdCAmJiAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcykgKSAvLyYmIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdCB7XG5cblx0XHQgLy9fZnJhbWVFdmVudERyaXZlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCB0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyApO1xuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdHB1YmxpYyBnZXQgc2Npc3NvclJlY3QoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY2lzc29yUmVjdDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgc2Npc3NvclJlY3QodmFsdWU6UmVjdGFuZ2xlKVxuXHR7XG5cdFx0dGhpcy5fc2Npc3NvclJlY3QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0U2Npc3NvclJlY3RhbmdsZSh0aGlzLl9zY2lzc29yUmVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGluZGV4IG9mIHRoZSBTdGFnZSB3aGljaCBpcyBtYW5hZ2VkIGJ5IHRoaXMgaW5zdGFuY2Ugb2YgU3RhZ2VQcm94eS5cblx0ICovXG5cdHB1YmxpYyBnZXQgc3RhZ2VJbmRleCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlSW5kZXg7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIFN0YWdlIG1hbmFnZWQgYnkgdGhpcyBwcm94eSBpcyBydW5uaW5nIGluIHNvZnR3YXJlIG1vZGUuXG5cdCAqIFJlbWVtYmVyIHRvIHdhaXQgZm9yIHRoZSBDT05URVhUX0NSRUFURUQgZXZlbnQgYmVmb3JlIGNoZWNraW5nIHRoaXMgcHJvcGVydHksXG5cdCAqIGFzIG9ubHkgdGhlbiB3aWxsIGl0IGJlIGd1YXJhbnRlZWQgdG8gYmUgYWNjdXJhdGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVzZXNTb2Z0d2FyZVJlbmRlcmluZygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmc7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFudGlBbGlhc2luZyBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFudGlBbGlhcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FudGlBbGlhcztcblx0fVxuXG5cdHB1YmxpYyBzZXQgYW50aUFsaWFzKGFudGlBbGlhczpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHZpZXdQb3J0IHJlY3RhbmdsZSBlcXVpdmFsZW50IG9mIHRoZSBTdGFnZSBzaXplIGFuZCBwb3NpdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgdmlld1BvcnQoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSBmYWxzZTtcblxuXHRcdHJldHVybiB0aGlzLl92aWV3UG9ydDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGNvbG9yKGNvbG9yOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2NvbG9yID0gY29sb3I7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZyZXNobHkgY2xlYXJlZCBzdGF0ZSBvZiB0aGUgYmFja2J1ZmZlciBiZWZvcmUgYW55IHJlbmRlcmluZ1xuXHQgKi9cblx0cHVibGljIGdldCBidWZmZXJDbGVhcigpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9idWZmZXJDbGVhcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYnVmZmVyQ2xlYXIobmV3QnVmZmVyQ2xlYXI6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gbmV3QnVmZmVyQ2xlYXI7XG5cdH1cblxuXHQvKlxuXHQgKiBBY2Nlc3MgdG8gZmlyZSBtb3VzZWV2ZW50cyBhY3Jvc3MgbXVsdGlwbGUgbGF5ZXJlZCB2aWV3M0QgaW5zdGFuY2VzXG5cdCAqL1xuXHQvL1x0XHRwdWJsaWMgZ2V0IG1vdXNlM0RNYW5hZ2VyKCk6TW91c2UzRE1hbmFnZXJcblx0Ly9cdFx0e1xuXHQvL1x0XHRcdHJldHVybiB0aGlzLl9tb3VzZTNETWFuYWdlcjtcblx0Ly9cdFx0fVxuXHQvL1xuXHQvL1x0XHRwdWJsaWMgc2V0IG1vdXNlM0RNYW5hZ2VyKHZhbHVlOk1vdXNlM0RNYW5hZ2VyKVxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0dGhpcy5fbW91c2UzRE1hbmFnZXIgPSB2YWx1ZTtcblx0Ly9cdFx0fVxuXG5cdC8qIFRPRE86IGltcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cdCBwdWJsaWMgZ2V0IHRvdWNoM0RNYW5hZ2VyKCk6VG91Y2gzRE1hbmFnZXJcblx0IHtcblx0IHJldHVybiBfdG91Y2gzRE1hbmFnZXI7XG5cdCB9XG5cblx0IHB1YmxpYyBzZXQgdG91Y2gzRE1hbmFnZXIodmFsdWU6VG91Y2gzRE1hbmFnZXIpXG5cdCB7XG5cdCBfdG91Y2gzRE1hbmFnZXIgPSB2YWx1ZTtcblx0IH1cblx0ICovXG5cblx0LyoqXG5cdCAqIEZyZWVzIHRoZSBDb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGlzIFN0YWdlUHJveHkuXG5cdCAqL1xuXHRwcml2YXRlIGZyZWVDb250ZXh0KClcblx0e1xuXHRcdGlmICh0aGlzLl9jb250ZXh0KSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LmRpc3Bvc2UoKTtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQgPSBudWxsO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgRW50ZXJfRnJhbWUgaGFuZGxlciBmb3IgcHJvY2Vzc2luZyB0aGUgcHJveHkuRU5URVJfRlJBTUUgYW5kIHByb3h5LkVYSVRfRlJBTUUgZXZlbnQgaGFuZGxlcnMuXG5cdCAqIFR5cGljYWxseSB0aGUgcHJveHkuRU5URVJfRlJBTUUgbGlzdGVuZXIgd291bGQgcmVuZGVyIHRoZSBsYXllcnMgZm9yIHRoaXMgU3RhZ2UgaW5zdGFuY2UuXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShldmVudDpFdmVudClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIENsZWFyIHRoZSBzdGFnZSBpbnN0YW5jZVxuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHQvL25vdGlmeSB0aGUgZW50ZXJmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUVudGVyRnJhbWUoKTtcblx0XHQvLyBDYWxsIHRoZSBwcmVzZW50KCkgdG8gcmVuZGVyIHRoZSBmcmFtZVxuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQucHJlc2VudCgpO1xuXHRcdC8vbm90aWZ5IHRoZSBleGl0ZnJhbWUgbGlzdGVuZXJzXG5cdFx0dGhpcy5ub3RpZnlFeGl0RnJhbWUoKTtcblx0fVxuXG5cdHB1YmxpYyByZWNvdmVyRnJvbURpc3Bvc2FsKCk6Ym9vbGVhblxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly9hd2F5LkRlYnVnLnRocm93UElSKCAnU3RhZ2VQcm94eScgLCAncmVjb3ZlckZyb21EaXNwb3NhbCcgLCAnJyApO1xuXG5cdFx0Lypcblx0XHQgaWYgKHRoaXMuX2lDb250ZXh0LmRyaXZlckluZm8gPT0gXCJEaXNwb3NlZFwiKVxuXHRcdCB7XG5cdFx0IHRoaXMuX2lDb250ZXh0ID0gbnVsbDtcblx0XHQgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdCByZXR1cm4gZmFsc2U7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRwcml2YXRlIF9jYWxsYmFjayhjb250ZXh0OklDb250ZXh0KVxuXHR7XG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cblx0XHR0aGlzLl9jb250YWluZXIgPSB0aGlzLl9jb250ZXh0LmNvbnRhaW5lcjtcblxuXHRcdC8vIE9ubHkgY29uZmlndXJlIGJhY2sgYnVmZmVyIGlmIHdpZHRoIGFuZCBoZWlnaHQgaGF2ZSBiZWVuIHNldCxcblx0XHQvLyB3aGljaCB0aGV5IG1heSBub3QgaGF2ZSBiZWVuIGlmIFZpZXcucmVuZGVyKCkgaGFzIHlldCB0byBiZVxuXHRcdC8vIGludm9rZWQgZm9yIHRoZSBmaXJzdCB0aW1lLlxuXHRcdGlmICh0aGlzLl93aWR0aCAmJiB0aGlzLl9oZWlnaHQpXG5cdFx0XHR0aGlzLl9jb250ZXh0LmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXG5cdFx0Ly8gRGlzcGF0Y2ggdGhlIGFwcHJvcHJpYXRlIGV2ZW50IGRlcGVuZGluZyBvbiB3aGV0aGVyIGNvbnRleHQgd2FzXG5cdFx0Ly8gY3JlYXRlZCBmb3IgdGhlIGZpcnN0IHRpbWUgb3IgcmVjcmVhdGVkIGFmdGVyIGEgZGV2aWNlIGxvc3MuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KHRoaXMuX2luaXRpYWxpc2VkPyBTdGFnZUV2ZW50LkNPTlRFWFRfUkVDUkVBVEVEIDogU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQpKTtcblxuXHRcdHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblx0fVxufVxuXG5leHBvcnQgPSBTdGFnZTsiXX0=