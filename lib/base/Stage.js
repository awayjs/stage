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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL3N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5yZXF1ZXN0Q29udGV4dCIsIlN0YWdlLndpZHRoIiwiU3RhZ2UuaGVpZ2h0IiwiU3RhZ2UueCIsIlN0YWdlLnkiLCJTdGFnZS52aXNpYmxlIiwiU3RhZ2UuY29udGFpbmVyIiwiU3RhZ2UuY29udGV4dCIsIlN0YWdlLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCIsIlN0YWdlLm5vdGlmeUVudGVyRnJhbWUiLCJTdGFnZS5ub3RpZnlFeGl0RnJhbWUiLCJTdGFnZS5wcm9maWxlIiwiU3RhZ2UuZGlzcG9zZSIsIlN0YWdlLmNvbmZpZ3VyZUJhY2tCdWZmZXIiLCJTdGFnZS5lbmFibGVEZXB0aEFuZFN0ZW5jaWwiLCJTdGFnZS5yZW5kZXJUYXJnZXQiLCJTdGFnZS5yZW5kZXJTdXJmYWNlU2VsZWN0b3IiLCJTdGFnZS5jbGVhciIsIlN0YWdlLmFkZEV2ZW50TGlzdGVuZXIiLCJTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyIiwiU3RhZ2Uuc2Npc3NvclJlY3QiLCJTdGFnZS5zdGFnZUluZGV4IiwiU3RhZ2UudXNlc1NvZnR3YXJlUmVuZGVyaW5nIiwiU3RhZ2UuYW50aUFsaWFzIiwiU3RhZ2Uudmlld1BvcnQiLCJTdGFnZS5jb2xvciIsIlN0YWdlLmJ1ZmZlckNsZWFyIiwiU3RhZ2UuZnJlZUNvbnRleHQiLCJTdGFnZS5vbkVudGVyRnJhbWUiLCJTdGFnZS5yZWNvdmVyRnJvbURpc3Bvc2FsIiwiU3RhZ2UuX2NhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFPLFNBQVMsV0FBYyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sS0FBSyxXQUFlLDhCQUE4QixDQUFDLENBQUM7QUFDM0QsSUFBTyxlQUFlLFdBQWEsd0NBQXdDLENBQUMsQ0FBQztBQUk3RSxJQUFPLEdBQUcsV0FBZ0IsMkJBQTJCLENBQUMsQ0FB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LEVBNmlCbEM7QUFFRCxBQUFlLGlCQUFOLEtBQUssQ0FBQyIsImZpbGUiOiJiYXNlL1N0YWdlLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcbmltcG9ydCBFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEN1YmVUZXh0dXJlQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9DdWJlVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgUmVuZGVyVGV4dHVyZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9SZW5kZXJUZXh0dXJlXCIpO1xuaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZVByb3h5QmFzZVwiKTtcbmltcG9ydCBDU1NcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xuXG5pbXBvcnQgQ29udGV4dE1vZGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0NvbnRleHRNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0lDb250ZXh0XCIpO1xuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcblxuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgQ29udGV4dFdlYkdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XG5pbXBvcnQgU3RhZ2VNYW5hZ2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWFuYWdlcnMvU3RhZ2VNYW5hZ2VyXCIpO1xuXG4vKipcbiAqIFN0YWdlIHByb3ZpZGVzIGEgcHJveHkgY2xhc3MgdG8gaGFuZGxlIHRoZSBjcmVhdGlvbiBhbmQgYXR0YWNobWVudCBvZiB0aGUgQ29udGV4dFxuICogKGFuZCBpbiB0dXJuIHRoZSBiYWNrIGJ1ZmZlcikgaXQgdXNlcy4gU3RhZ2Ugc2hvdWxkIG5ldmVyIGJlIGNyZWF0ZWQgZGlyZWN0bHksXG4gKiBidXQgcmVxdWVzdGVkIHRocm91Z2ggU3RhZ2VNYW5hZ2VyLlxuICpcbiAqIEBzZWUgYXdheS5tYW5hZ2Vycy5TdGFnZU1hbmFnZXJcbiAqXG4gKi9cbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXG57XG5cdHByaXZhdGUgX2NvbnRleHQ6SUNvbnRleHQ7XG5cdHByaXZhdGUgX2NvbnRhaW5lcjpIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuXHRwcml2YXRlIF94Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3k6bnVtYmVyID0gMDtcblxuXHQvL3ByaXZhdGUgc3RhdGljIF9mcmFtZUV2ZW50RHJpdmVyOlNoYXBlID0gbmV3IFNoYXBlKCk7IC8vIFRPRE86IGFkZCBmcmFtZSBkcml2ZXIgLyByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxuXG5cdHByaXZhdGUgX3N0YWdlSW5kZXg6bnVtYmVyID0gLTE7XG5cblx0cHJpdmF0ZSBfdXNlc1NvZnR3YXJlUmVuZGVyaW5nOmJvb2xlYW47XG5cdHByaXZhdGUgX3Byb2ZpbGU6c3RyaW5nO1xuXHRwcml2YXRlIF9zdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyO1xuXHRwcml2YXRlIF9hbnRpQWxpYXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW47XG5cdHByaXZhdGUgX2NvbnRleHRSZXF1ZXN0ZWQ6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgdmFyIF9hY3RpdmVWZXJ0ZXhCdWZmZXJzIDogVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+ID0gbmV3IFZlY3Rvci48VmVydGV4QnVmZmVyPig4LCB0cnVlKTtcblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVGV4dHVyZXMgOiBWZWN0b3IuPFRleHR1cmVCYXNlPiA9IG5ldyBWZWN0b3IuPFRleHR1cmVCYXNlPig4LCB0cnVlKTtcblx0cHJpdmF0ZSBfcmVuZGVyVGFyZ2V0OlRleHR1cmVQcm94eUJhc2UgPSBudWxsO1xuXHRwcml2YXRlIF9yZW5kZXJTdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc2Npc3NvclJlY3Q6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9jb2xvcjpudW1iZXI7XG5cdHByaXZhdGUgX2JhY2tCdWZmZXJEaXJ0eTpib29sZWFuO1xuXHRwcml2YXRlIF92aWV3UG9ydDpSZWN0YW5nbGU7XG5cdHByaXZhdGUgX2VudGVyRnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX2V4aXRGcmFtZTpFdmVudDtcblx0cHJpdmF0ZSBfdmlld3BvcnRVcGRhdGVkOlN0YWdlRXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYnVmZmVyQ2xlYXI6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgX21vdXNlM0RNYW5hZ2VyOmF3YXkubWFuYWdlcnMuTW91c2UzRE1hbmFnZXI7XG5cdC8vcHJpdmF0ZSBfdG91Y2gzRE1hbmFnZXI6VG91Y2gzRE1hbmFnZXI7IC8vVE9ETzogaW1lcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cblx0cHJpdmF0ZSBfaW5pdGlhbGlzZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lcjpIVE1MQ2FudmFzRWxlbWVudCwgc3RhZ2VJbmRleDpudW1iZXIsIHN0YWdlTWFuYWdlcjpTdGFnZU1hbmFnZXIsIGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIilcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG5cblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gc3RhZ2VJbmRleDtcblxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcblxuXHRcdHRoaXMuX3ZpZXdQb3J0ID0gbmV3IFJlY3RhbmdsZSgpO1xuXG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gdHJ1ZTtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIDApO1xuXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhIENvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUgbWFuYWdlZCBnbCBjYW52YXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKVxuXHR7XG5cdFx0Ly8gSWYgZm9yY2luZyBzb2Z0d2FyZSwgd2UgY2FuIGJlIGNlcnRhaW4gdGhhdCB0aGVcblx0XHQvLyByZXR1cm5lZCBDb250ZXh0IHdpbGwgYmUgcnVubmluZyBzb2Z0d2FyZSBtb2RlLlxuXHRcdC8vIElmIG5vdCwgd2UgY2FuJ3QgYmUgc3VyZSBhbmQgc2hvdWxkIHN0aWNrIHRvIHRoZVxuXHRcdC8vIG9sZCB2YWx1ZSAod2lsbCBsaWtlbHkgYmUgc2FtZSBpZiByZS1yZXF1ZXN0aW5nLilcblxuXHRcdGlmICh0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgIT0gbnVsbClcblx0XHRcdHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyA9IGZvcmNlU29mdHdhcmU7XG5cblx0XHR0aGlzLl9wcm9maWxlID0gcHJvZmlsZTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5GTEFTSClcblx0XHRcdFx0bmV3IENvbnRleHRTdGFnZTNEKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCB0aGlzLl9zdGFnZUluZGV4LCAoY29udGV4dDpJQ29udGV4dCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLl9jb250ZXh0ID0gbmV3IENvbnRleHRXZWJHTCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgdGhpcy5fc3RhZ2VJbmRleCk7XG5cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5BVVRPKVxuXHRcdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgdGhpcy5fc3RhZ2VJbmRleCwgKGNvbnRleHQ6SUNvbnRleHQpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jYWxsYmFjayh0aGlzLl9jb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2lkdGggb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB3aWR0aCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fd2lkdGg7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHdpZHRoKHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fd2lkdGggPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRXaWR0aCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl93aWR0aCA9IHRoaXMuX3ZpZXdQb3J0LndpZHRoID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhlaWdodCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGhlaWdodCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0cHVibGljIHNldCBoZWlnaHQodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9oZWlnaHQgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRIZWlnaHQodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5faGVpZ2h0ID0gdGhpcy5fdmlld1BvcnQuaGVpZ2h0ID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHggcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB4KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl94O1xuXHR9XG5cblx0cHVibGljIHNldCB4KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFgodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feCA9IHRoaXMuX3ZpZXdQb3J0LnggPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB5IHBvc2l0aW9uIG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgeSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5feTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeSh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3kgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3kgPSB0aGlzLl92aWV3UG9ydC55ID0gdmFsO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgdmlzaWJsZSh2YWw6Ym9vbGVhbilcblx0e1xuXHRcdENTUy5zZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHZpc2libGUoKVxuXHR7XG5cdFx0cmV0dXJuIENTUy5nZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIpO1xuXHR9XG5cblx0cHVibGljIGdldCBjb250YWluZXIoKTpIVE1MRWxlbWVudFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQ29udGV4dCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBzdGFnZSBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbnRleHQoKTpJQ29udGV4dFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRleHQ7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpXG5cdHtcblx0XHRpZiAodGhpcy5fdmlld3BvcnREaXJ0eSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSB0cnVlO1xuXG5cdFx0Ly9pZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0Ly9pZiAoIV92aWV3cG9ydFVwZGF0ZWQpXG5cdFx0dGhpcy5fdmlld3BvcnRVcGRhdGVkID0gbmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl92aWV3cG9ydFVwZGF0ZWQpO1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFbnRlckZyYW1lKClcblx0e1xuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSlcblx0XHQvL3JldHVybjtcblxuXHRcdGlmICghdGhpcy5fZW50ZXJGcmFtZSlcblx0XHRcdHRoaXMuX2VudGVyRnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRU5URVJfRlJBTUUpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2VudGVyRnJhbWUpO1xuXG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeUV4aXRGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FKSlcblx0XHQvL3JldHVybjtcblxuXHRcdGlmICghdGhpcy5fZXhpdEZyYW1lKVxuXHRcdFx0dGhpcy5fZXhpdEZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVYSVRfRlJBTUUpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2V4aXRGcmFtZSk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHByb2ZpbGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9maWxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc3Bvc2VzIHRoZSBTdGFnZSBvYmplY3QsIGZyZWVpbmcgdGhlIENvbnRleHQgYXR0YWNoZWQgdG8gdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyLmlSZW1vdmVTdGFnZSh0aGlzKTtcblx0XHR0aGlzLmZyZWVDb250ZXh0KCk7XG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gbnVsbDtcblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gLTE7XG5cdH1cblxuXHQvKipcblx0ICogQ29uZmlndXJlcyB0aGUgYmFjayBidWZmZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBTdGFnZSBvYmplY3QuXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVyV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBiYWNrYnVmZmVyLlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlckhlaWdodCBUaGUgaGVpZ2h0IG9mIHRoZSBiYWNrYnVmZmVyLlxuXHQgKiBAcGFyYW0gYW50aUFsaWFzIFRoZSBhbW91bnQgb2YgYW50aS1hbGlhc2luZyB0byB1c2UuXG5cdCAqIEBwYXJhbSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGJhY2sgYnVmZmVyIGNvbnRhaW5zIGEgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyLlxuXHQgKi9cblx0cHVibGljIGNvbmZpZ3VyZUJhY2tCdWZmZXIoYmFja0J1ZmZlcldpZHRoOm51bWJlciwgYmFja0J1ZmZlckhlaWdodDpudW1iZXIsIGFudGlBbGlhczpudW1iZXIsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy53aWR0aCA9IGJhY2tCdWZmZXJXaWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGJhY2tCdWZmZXJIZWlnaHQ7XG5cblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jb250ZXh0LmNvbmZpZ3VyZUJhY2tCdWZmZXIoYmFja0J1ZmZlcldpZHRoLCBiYWNrQnVmZmVySGVpZ2h0LCBhbnRpQWxpYXMsIGVuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdH1cblxuXHQvKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyIGlzIHVzZWRcblx0ICovXG5cdHB1YmxpYyBnZXQgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHJlbmRlclRhcmdldCgpOlRleHR1cmVQcm94eUJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJUYXJnZXQ7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHJlbmRlclN1cmZhY2VTZWxlY3RvcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclN1cmZhY2VTZWxlY3Rvcjtcblx0fVxuXG5cdC8qXG5cdCAqIENsZWFyIGFuZCByZXNldCB0aGUgYmFjayBidWZmZXIgd2hlbiB1c2luZyBhIHNoYXJlZCBjb250ZXh0XG5cdCAqL1xuXHRwdWJsaWMgY2xlYXIoKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSkge1xuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0XHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQuY2xlYXIoKCB0aGlzLl9jb2xvciAmIDB4ZmYwMDAwMDAgKSA+Pj4gMjQsIC8vIDwtLS0tLS0tLS0gWmVyby1maWxsIHJpZ2h0IHNoaWZ0XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMDAwICkgPj4+IDE2LCAvLyA8LS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwICkgPj4+IDgsIC8vIDwtLS0tLS0tLS0tLS0tLS0tfFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2NvbG9yICYgMHhmZik7XG5cblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIG9iamVjdCB3aXRoIGFuIEV2ZW50RGlzcGF0Y2hlciBvYmplY3Qgc28gdGhhdCB0aGUgbGlzdGVuZXIgcmVjZWl2ZXMgbm90aWZpY2F0aW9uIG9mIGFuIGV2ZW50LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IGludG8gYXV0b21hdGljIHJlbmRlciBtb2RlLlxuXHQgKiBZb3UgY2FuIHJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVycyBvbiBhbGwgbm9kZXMgaW4gdGhlIGRpc3BsYXkgbGlzdCBmb3IgYSBzcGVjaWZpYyB0eXBlIG9mIGV2ZW50LCBwaGFzZSwgYW5kIHByaW9yaXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyB0aGUgZXZlbnQuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIERldGVybWluZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd29ya3MgaW4gdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB1c2VDYXB0dXJlIGlzIHNldCB0byB0cnVlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgY2FwdHVyZSBwaGFzZSBhbmQgbm90IGluIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIElmIHVzZUNhcHR1cmUgaXMgZmFsc2UsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIFRvIGxpc3RlbiBmb3IgdGhlIGV2ZW50IGluIGFsbCB0aHJlZSBwaGFzZXMsIGNhbGwgYWRkRXZlbnRMaXN0ZW5lciB0d2ljZSwgb25jZSB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIHRydWUsIHRoZW4gYWdhaW4gd2l0aCB1c2VDYXB0dXJlIHNldCB0byBmYWxzZS5cblx0ICogQHBhcmFtIHByaW9yaXR5IFRoZSBwcmlvcml0eSBsZXZlbCBvZiB0aGUgZXZlbnQgbGlzdGVuZXIuIFRoZSBwcmlvcml0eSBpcyBkZXNpZ25hdGVkIGJ5IGEgc2lnbmVkIDMyLWJpdCBpbnRlZ2VyLiBUaGUgaGlnaGVyIHRoZSBudW1iZXIsIHRoZSBoaWdoZXIgdGhlIHByaW9yaXR5LiBBbGwgbGlzdGVuZXJzIHdpdGggcHJpb3JpdHkgbiBhcmUgcHJvY2Vzc2VkIGJlZm9yZSBsaXN0ZW5lcnMgb2YgcHJpb3JpdHkgbi0xLiBJZiB0d28gb3IgbW9yZSBsaXN0ZW5lcnMgc2hhcmUgdGhlIHNhbWUgcHJpb3JpdHksIHRoZXkgYXJlIHByb2Nlc3NlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkLiBUaGUgZGVmYXVsdCBwcmlvcml0eSBpcyAwLlxuXHQgKiBAcGFyYW0gdXNlV2Vha1JlZmVyZW5jZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlZmVyZW5jZSB0byB0aGUgbGlzdGVuZXIgaXMgc3Ryb25nIG9yIHdlYWsuIEEgc3Ryb25nIHJlZmVyZW5jZSAodGhlIGRlZmF1bHQpIHByZXZlbnRzIHlvdXIgbGlzdGVuZXIgZnJvbSBiZWluZyBnYXJiYWdlLWNvbGxlY3RlZC4gQSB3ZWFrIHJlZmVyZW5jZSBkb2VzIG5vdC5cblx0ICovXG5cdHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Ly9hd2F5LkRlYnVnLnRocm93UElSKCAnU3RhZ2VQcm94eScgLCAnYWRkRXZlbnRMaXN0ZW5lcicgLCAgJ0VudGVyRnJhbWUsIEV4aXRGcmFtZScpO1xuXG5cdFx0Ly9pZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSApey8vJiYgISB0aGlzLl9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcblxuXHRcdC8vX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XG5cblx0XHQvL31cblxuXHRcdC8qIE9yaWdpbmFsIGNvZGVcblx0XHQgaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgJiYgISBfZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQgX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XG5cblxuXHRcdCB9XG5cdFx0ICovXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgb3V0IG9mIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2hpbmcgbGlzdGVuZXIgcmVnaXN0ZXJlZCB3aXRoIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LCBhIGNhbGwgdG8gdGhpcyBtZXRob2QgaGFzIG5vIGVmZmVjdC5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgb2JqZWN0IHRvIHJlbW92ZS5cblx0ICogQHBhcmFtIHVzZUNhcHR1cmUgU3BlY2lmaWVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciB0aGUgY2FwdHVyZSBwaGFzZSBvciB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMuIElmIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgYm90aCB0aGUgY2FwdHVyZSBwaGFzZSBhbmQgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLCB0d28gY2FsbHMgdG8gcmVtb3ZlRXZlbnRMaXN0ZW5lcigpIGFyZSByZXF1aXJlZCB0byByZW1vdmUgYm90aCwgb25lIGNhbGwgd2l0aCB1c2VDYXB0dXJlKCkgc2V0IHRvIHRydWUsIGFuZCBhbm90aGVyIGNhbGwgd2l0aCB1c2VDYXB0dXJlKCkgc2V0IHRvIGZhbHNlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxuXHR7XG5cdFx0c3VwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cblx0XHQvKlxuXHRcdCAvLyBSZW1vdmUgdGhlIG1haW4gcmVuZGVyaW5nIGxpc3RlbmVyIGlmIG5vIEVudGVyRnJhbWUgbGlzdGVuZXJzIHJlbWFpblxuXHRcdCBpZiAoICAgICEgdGhpcy5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzIClcblx0XHQgJiYgICEgdGhpcy5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVYSVRfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMpICkgLy8mJiBfZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSlcblx0XHQge1xuXG5cdFx0IC8vX2ZyYW1lRXZlbnREcml2ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgdGhpcy5vbkVudGVyRnJhbWUsIHRoaXMgKTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdH1cblxuXHRwdWJsaWMgZ2V0IHNjaXNzb3JSZWN0KCk6UmVjdGFuZ2xlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2Npc3NvclJlY3Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNjaXNzb3JSZWN0KHZhbHVlOlJlY3RhbmdsZSlcblx0e1xuXHRcdHRoaXMuX3NjaXNzb3JSZWN0ID0gdmFsdWU7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFNjaXNzb3JSZWN0YW5nbGUodGhpcy5fc2Npc3NvclJlY3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbmRleCBvZiB0aGUgU3RhZ2Ugd2hpY2ggaXMgbWFuYWdlZCBieSB0aGlzIGluc3RhbmNlIG9mIFN0YWdlUHJveHkuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHN0YWdlSW5kZXgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zdGFnZUluZGV4O1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBTdGFnZSBtYW5hZ2VkIGJ5IHRoaXMgcHJveHkgaXMgcnVubmluZyBpbiBzb2Z0d2FyZSBtb2RlLlxuXHQgKiBSZW1lbWJlciB0byB3YWl0IGZvciB0aGUgQ09OVEVYVF9DUkVBVEVEIGV2ZW50IGJlZm9yZSBjaGVja2luZyB0aGlzIHByb3BlcnR5LFxuXHQgKiBhcyBvbmx5IHRoZW4gd2lsbCBpdCBiZSBndWFyYW50ZWVkIHRvIGJlIGFjY3VyYXRlLlxuXHQgKi9cblx0cHVibGljIGdldCB1c2VzU29mdHdhcmVSZW5kZXJpbmcoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbnRpQWxpYXNpbmcgb2YgdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGdldCBhbnRpQWxpYXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbnRpQWxpYXM7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFudGlBbGlhcyhhbnRpQWxpYXM6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogQSB2aWV3UG9ydCByZWN0YW5nbGUgZXF1aXZhbGVudCBvZiB0aGUgU3RhZ2Ugc2l6ZSBhbmQgcG9zaXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0KCk6UmVjdGFuZ2xlXG5cdHtcblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gZmFsc2U7XG5cblx0XHRyZXR1cm4gdGhpcy5fdmlld1BvcnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGdldCBjb2xvcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbG9yO1xuXHR9XG5cblx0cHVibGljIHNldCBjb2xvcihjb2xvcjpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9jb2xvciA9IGNvbG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmcmVzaGx5IGNsZWFyZWQgc3RhdGUgb2YgdGhlIGJhY2tidWZmZXIgYmVmb3JlIGFueSByZW5kZXJpbmdcblx0ICovXG5cdHB1YmxpYyBnZXQgYnVmZmVyQ2xlYXIoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYnVmZmVyQ2xlYXI7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGJ1ZmZlckNsZWFyKG5ld0J1ZmZlckNsZWFyOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IG5ld0J1ZmZlckNsZWFyO1xuXHR9XG5cblx0Lypcblx0ICogQWNjZXNzIHRvIGZpcmUgbW91c2VldmVudHMgYWNyb3NzIG11bHRpcGxlIGxheWVyZWQgdmlldzNEIGluc3RhbmNlc1xuXHQgKi9cblx0Ly9cdFx0cHVibGljIGdldCBtb3VzZTNETWFuYWdlcigpOk1vdXNlM0RNYW5hZ2VyXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHRyZXR1cm4gdGhpcy5fbW91c2UzRE1hbmFnZXI7XG5cdC8vXHRcdH1cblx0Ly9cblx0Ly9cdFx0cHVibGljIHNldCBtb3VzZTNETWFuYWdlcih2YWx1ZTpNb3VzZTNETWFuYWdlcilcblx0Ly9cdFx0e1xuXHQvL1x0XHRcdHRoaXMuX21vdXNlM0RNYW5hZ2VyID0gdmFsdWU7XG5cdC8vXHRcdH1cblxuXHQvKiBUT0RPOiBpbXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXHQgcHVibGljIGdldCB0b3VjaDNETWFuYWdlcigpOlRvdWNoM0RNYW5hZ2VyXG5cdCB7XG5cdCByZXR1cm4gX3RvdWNoM0RNYW5hZ2VyO1xuXHQgfVxuXG5cdCBwdWJsaWMgc2V0IHRvdWNoM0RNYW5hZ2VyKHZhbHVlOlRvdWNoM0RNYW5hZ2VyKVxuXHQge1xuXHQgX3RvdWNoM0RNYW5hZ2VyID0gdmFsdWU7XG5cdCB9XG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBGcmVlcyB0aGUgQ29udGV4dCBhc3NvY2lhdGVkIHdpdGggdGhpcyBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHJpdmF0ZSBmcmVlQ29udGV4dCgpXG5cdHtcblx0XHRpZiAodGhpcy5fY29udGV4dCkge1xuXHRcdFx0dGhpcy5fY29udGV4dC5kaXNwb3NlKCk7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0ID0gbnVsbDtcblxuXHRcdHRoaXMuX2luaXRpYWxpc2VkID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIEVudGVyX0ZyYW1lIGhhbmRsZXIgZm9yIHByb2Nlc3NpbmcgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGFuZCBwcm94eS5FWElUX0ZSQU1FIGV2ZW50IGhhbmRsZXJzLlxuXHQgKiBUeXBpY2FsbHkgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGxpc3RlbmVyIHdvdWxkIHJlbmRlciB0aGUgbGF5ZXJzIGZvciB0aGlzIFN0YWdlIGluc3RhbmNlLlxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZXZlbnQ6RXZlbnQpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBDbGVhciB0aGUgc3RhZ2UgaW5zdGFuY2Vcblx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGVudGVyZnJhbWUgbGlzdGVuZXJzXG5cdFx0dGhpcy5ub3RpZnlFbnRlckZyYW1lKCk7XG5cdFx0Ly8gQ2FsbCB0aGUgcHJlc2VudCgpIHRvIHJlbmRlciB0aGUgZnJhbWVcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jb250ZXh0LnByZXNlbnQoKTtcblx0XHQvL25vdGlmeSB0aGUgZXhpdGZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RXhpdEZyYW1lKCk7XG5cdH1cblxuXHRwdWJsaWMgcmVjb3ZlckZyb21EaXNwb3NhbCgpOmJvb2xlYW5cblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ3JlY292ZXJGcm9tRGlzcG9zYWwnICwgJycgKTtcblxuXHRcdC8qXG5cdFx0IGlmICh0aGlzLl9pQ29udGV4dC5kcml2ZXJJbmZvID09IFwiRGlzcG9zZWRcIilcblx0XHQge1xuXHRcdCB0aGlzLl9pQ29udGV4dCA9IG51bGw7XG5cdFx0IHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcblx0XHQgcmV0dXJuIGZhbHNlO1xuXG5cdFx0IH1cblx0XHQgKi9cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9XG5cblx0cHJpdmF0ZSBfY2FsbGJhY2soY29udGV4dDpJQ29udGV4dClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXG5cdFx0dGhpcy5fY29udGFpbmVyID0gdGhpcy5fY29udGV4dC5jb250YWluZXI7XG5cblx0XHQvLyBPbmx5IGNvbmZpZ3VyZSBiYWNrIGJ1ZmZlciBpZiB3aWR0aCBhbmQgaGVpZ2h0IGhhdmUgYmVlbiBzZXQsXG5cdFx0Ly8gd2hpY2ggdGhleSBtYXkgbm90IGhhdmUgYmVlbiBpZiBWaWV3LnJlbmRlcigpIGhhcyB5ZXQgdG8gYmVcblx0XHQvLyBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZS5cblx0XHRpZiAodGhpcy5fd2lkdGggJiYgdGhpcy5faGVpZ2h0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblxuXHRcdC8vIERpc3BhdGNoIHRoZSBhcHByb3ByaWF0ZSBldmVudCBkZXBlbmRpbmcgb24gd2hldGhlciBjb250ZXh0IHdhc1xuXHRcdC8vIGNyZWF0ZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9yIHJlY3JlYXRlZCBhZnRlciBhIGRldmljZSBsb3NzLlxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudCh0aGlzLl9pbml0aWFsaXNlZD8gU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCA6IFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVEKSk7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cdH1cbn1cblxuZXhwb3J0ID0gU3RhZ2U7Il19