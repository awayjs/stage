var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ContextMode = require("awayjs-core/lib/core/display/ContextMode");
var Rectangle = require("awayjs-core/lib/core/geom/Rectangle");
var Event = require("awayjs-core/lib/events/Event");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var StageEvent = require("awayjs-core/lib/events/StageEvent");
var CSS = require("awayjs-core/lib/utils/CSS");
var ContextStage3D = require("awayjs-stagegl/lib/core/stagegl/ContextStage3D");
var ContextWebGL = require("awayjs-stagegl/lib/core/stagegl/ContextWebGL");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvYmFzZS9zdGFnZS50cyJdLCJuYW1lcyI6WyJTdGFnZSIsIlN0YWdlLmNvbnN0cnVjdG9yIiwiU3RhZ2UucmVxdWVzdENvbnRleHQiLCJTdGFnZS53aWR0aCIsIlN0YWdlLmhlaWdodCIsIlN0YWdlLngiLCJTdGFnZS55IiwiU3RhZ2UudmlzaWJsZSIsIlN0YWdlLmNvbnRhaW5lciIsIlN0YWdlLmNvbnRleHQiLCJTdGFnZS5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQiLCJTdGFnZS5ub3RpZnlFbnRlckZyYW1lIiwiU3RhZ2Uubm90aWZ5RXhpdEZyYW1lIiwiU3RhZ2UucHJvZmlsZSIsIlN0YWdlLmRpc3Bvc2UiLCJTdGFnZS5jb25maWd1cmVCYWNrQnVmZmVyIiwiU3RhZ2UuZW5hYmxlRGVwdGhBbmRTdGVuY2lsIiwiU3RhZ2UucmVuZGVyVGFyZ2V0IiwiU3RhZ2UucmVuZGVyU3VyZmFjZVNlbGVjdG9yIiwiU3RhZ2UuY2xlYXIiLCJTdGFnZS5hZGRFdmVudExpc3RlbmVyIiwiU3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnNjaXNzb3JSZWN0IiwiU3RhZ2Uuc3RhZ2VJbmRleCIsIlN0YWdlLnVzZXNTb2Z0d2FyZVJlbmRlcmluZyIsIlN0YWdlLmFudGlBbGlhcyIsIlN0YWdlLnZpZXdQb3J0IiwiU3RhZ2UuY29sb3IiLCJTdGFnZS5idWZmZXJDbGVhciIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxXQUFXLFdBQWMsMENBQTBDLENBQUMsQ0FBQztBQUU1RSxJQUFPLFNBQVMsV0FBYyxxQ0FBcUMsQ0FBQyxDQUFDO0FBQ3JFLElBQU8sS0FBSyxXQUFlLDhCQUE4QixDQUFDLENBQUM7QUFDM0QsSUFBTyxlQUFlLFdBQWEsd0NBQXdDLENBQUMsQ0FBQztBQUM3RSxJQUFPLFVB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QUFBZSxpQkFBTixLQUFLLENBQUMiLCJmaWxlIjoiY29yZS9iYXNlL1N0YWdlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbnRleHRNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9kaXNwbGF5L0NvbnRleHRNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Rpc3BsYXkvSUNvbnRleHRcIik7XG5pbXBvcnQgUmVjdGFuZ2xlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL1JlY3RhbmdsZVwiKTtcbmltcG9ydCBFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcbmltcG9ydCBDdWJlVGV4dHVyZUJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQ3ViZVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IFJlbmRlclRleHR1cmVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvUmVuZGVyVGV4dHVyZVwiKTtcbmltcG9ydCBUZXh0dXJlUHJveHlCYXNlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmVQcm94eUJhc2VcIik7XG5pbXBvcnQgQ1NTXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0NTU1wiKTtcblxuaW1wb3J0IFN0YWdlTWFuYWdlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcbmltcG9ydCBDb250ZXh0U3RhZ2UzRFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgQ29udGV4dFdlYkdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRXZWJHTFwiKTtcblxuLyoqXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxuICogYnV0IHJlcXVlc3RlZCB0aHJvdWdoIFN0YWdlTWFuYWdlci5cbiAqXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXG4gKlxuICovXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9jb250ZXh0OklDb250ZXh0O1xuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgX3dpZHRoOm51bWJlcjtcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcblx0cHJpdmF0ZSBfeDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF95Om51bWJlciA9IDA7XG5cblx0Ly9wcml2YXRlIHN0YXRpYyBfZnJhbWVFdmVudERyaXZlcjpTaGFwZSA9IG5ldyBTaGFwZSgpOyAvLyBUT0RPOiBhZGQgZnJhbWUgZHJpdmVyIC8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcblxuXHRwcml2YXRlIF9zdGFnZUluZGV4Om51bWJlciA9IC0xO1xuXG5cdHByaXZhdGUgX3VzZXNTb2Z0d2FyZVJlbmRlcmluZzpib29sZWFuO1xuXHRwcml2YXRlIF9wcm9maWxlOnN0cmluZztcblx0cHJpdmF0ZSBfc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlcjtcblx0cHJpdmF0ZSBfYW50aUFsaWFzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2VuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuO1xuXHRwcml2YXRlIF9jb250ZXh0UmVxdWVzdGVkOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVmVydGV4QnVmZmVycyA6IFZlY3Rvci48VmVydGV4QnVmZmVyPiA9IG5ldyBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4oOCwgdHJ1ZSk7XG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVRleHR1cmVzIDogVmVjdG9yLjxUZXh0dXJlQmFzZT4gPSBuZXcgVmVjdG9yLjxUZXh0dXJlQmFzZT4oOCwgdHJ1ZSk7XG5cdHByaXZhdGUgX3JlbmRlclRhcmdldDpUZXh0dXJlUHJveHlCYXNlID0gbnVsbDtcblx0cHJpdmF0ZSBfcmVuZGVyU3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfY29sb3I6bnVtYmVyO1xuXHRwcml2YXRlIF9iYWNrQnVmZmVyRGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9lbnRlckZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF9leGl0RnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydERpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX2J1ZmZlckNsZWFyOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIF9tb3VzZTNETWFuYWdlcjphd2F5Lm1hbmFnZXJzLk1vdXNlM0RNYW5hZ2VyO1xuXHQvL3ByaXZhdGUgX3RvdWNoM0RNYW5hZ2VyOlRvdWNoM0RNYW5hZ2VyOyAvL1RPRE86IGltZXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXG5cdHByaXZhdGUgX2luaXRpYWxpc2VkOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXG5cdFx0dGhpcy5fc3RhZ2VJbmRleCA9IHN0YWdlSW5kZXg7XG5cblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIgPSBzdGFnZU1hbmFnZXI7XG5cblx0XHR0aGlzLl92aWV3UG9ydCA9IG5ldyBSZWN0YW5nbGUoKTtcblxuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IHRydWU7XG5cblx0XHRDU1Muc2V0RWxlbWVudFgodGhpcy5fY29udGFpbmVyLCAwKTtcblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCAwKTtcblxuXHRcdHRoaXMudmlzaWJsZSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgYSBDb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIG1hbmFnZWQgZ2wgY2FudmFzLlxuXHQgKi9cblx0cHVibGljIHJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIilcblx0e1xuXHRcdC8vIElmIGZvcmNpbmcgc29mdHdhcmUsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXQgdGhlXG5cdFx0Ly8gcmV0dXJuZWQgQ29udGV4dCB3aWxsIGJlIHJ1bm5pbmcgc29mdHdhcmUgbW9kZS5cblx0XHQvLyBJZiBub3QsIHdlIGNhbid0IGJlIHN1cmUgYW5kIHNob3VsZCBzdGljayB0byB0aGVcblx0XHQvLyBvbGQgdmFsdWUgKHdpbGwgbGlrZWx5IGJlIHNhbWUgaWYgcmUtcmVxdWVzdGluZy4pXG5cblx0XHRpZiAodGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nICE9IG51bGwpXG5cdFx0XHR0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgPSBmb3JjZVNvZnR3YXJlO1xuXG5cdFx0dGhpcy5fcHJvZmlsZSA9IHByb2ZpbGU7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuRkxBU0gpXG5cdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgdGhpcy5fc3RhZ2VJbmRleCwgKGNvbnRleHQ6SUNvbnRleHQpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhpcy5fY29udGV4dCA9IG5ldyBDb250ZXh0V2ViR0woPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIHRoaXMuX3N0YWdlSW5kZXgpO1xuXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuQVVUTylcblx0XHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIHRoaXMuX3N0YWdlSW5kZXgsIChjb250ZXh0OklDb250ZXh0KSA9PiB0aGlzLl9jYWxsYmFjayhjb250ZXh0KSk7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY2FsbGJhY2sodGhpcy5fY29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHdpZHRoIG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgd2lkdGgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3dpZHRoO1xuXHR9XG5cblx0cHVibGljIHNldCB3aWR0aCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3dpZHRoID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50V2lkdGgodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5fd2lkdGggPSB0aGlzLl92aWV3UG9ydC53aWR0aCA9IHZhbDtcblxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBoZWlnaHQgb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCBoZWlnaHQoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2hlaWdodDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgaGVpZ2h0KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5faGVpZ2h0ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50SGVpZ2h0KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX2hlaWdodCA9IHRoaXMuX3ZpZXdQb3J0LmhlaWdodCA9IHZhbDtcblxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB4IHBvc2l0aW9uIG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgeCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5feDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ggPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3ggPSB0aGlzLl92aWV3UG9ydC54ID0gdmFsO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeSBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHkoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3k7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHkodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl95ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl95ID0gdGhpcy5fdmlld1BvcnQueSA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHZpc2libGUodmFsOmJvb2xlYW4pXG5cdHtcblx0XHRDU1Muc2V0RWxlbWVudFZpc2liaWxpdHkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXHR9XG5cblx0cHVibGljIGdldCB2aXNpYmxlKClcblx0e1xuXHRcdHJldHVybiBDU1MuZ2V0RWxlbWVudFZpc2liaWxpdHkodGhpcy5fY29udGFpbmVyKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgY29udGFpbmVyKCk6SFRNTEVsZW1lbnRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIENvbnRleHQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gc3RhZ2Ugb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGdldCBjb250ZXh0KCk6SUNvbnRleHRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ZpZXdwb3J0RGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gdHJ1ZTtcblxuXHRcdC8vaWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKSlcblx0XHQvL3JldHVybjtcblxuXHRcdC8vaWYgKCFfdmlld3BvcnRVcGRhdGVkKVxuXHRcdHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCA9IG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fdmlld3BvcnRVcGRhdGVkKTtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RW50ZXJGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2VudGVyRnJhbWUpXG5cdFx0XHR0aGlzLl9lbnRlckZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVOVEVSX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9lbnRlckZyYW1lKTtcblxuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFeGl0RnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2V4aXRGcmFtZSlcblx0XHRcdHRoaXMuX2V4aXRGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FWElUX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9leGl0RnJhbWUpO1xuXHR9XG5cblx0cHVibGljIGdldCBwcm9maWxlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZmlsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlcyB0aGUgU3RhZ2Ugb2JqZWN0LCBmcmVlaW5nIHRoZSBDb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlci5pUmVtb3ZlU3RhZ2UodGhpcyk7XG5cdFx0dGhpcy5mcmVlQ29udGV4dCgpO1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IG51bGw7XG5cdFx0dGhpcy5fc3RhZ2VJbmRleCA9IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbmZpZ3VyZXMgdGhlIGJhY2sgYnVmZmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlcldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJIZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGFudGlBbGlhcyBUaGUgYW1vdW50IG9mIGFudGktYWxpYXNpbmcgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBiYWNrIGJ1ZmZlciBjb250YWlucyBhIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlci5cblx0ICovXG5cdHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aDpudW1iZXIsIGJhY2tCdWZmZXJIZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMud2lkdGggPSBiYWNrQnVmZmVyV2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBiYWNrQnVmZmVySGVpZ2h0O1xuXG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aCwgYmFja0J1ZmZlckhlaWdodCwgYW50aUFsaWFzLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHR9XG5cblx0Lypcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlciBpcyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbChlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJUYXJnZXQoKTpUZXh0dXJlUHJveHlCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyVGFyZ2V0O1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJTdXJmYWNlU2VsZWN0b3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3I7XG5cdH1cblxuXHQvKlxuXHQgKiBDbGVhciBhbmQgcmVzZXQgdGhlIGJhY2sgYnVmZmVyIHdoZW4gdXNpbmcgYSBzaGFyZWQgY29udGV4dFxuXHQgKi9cblx0cHVibGljIGNsZWFyKClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9iYWNrQnVmZmVyRGlydHkpIHtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LmNsZWFyKCggdGhpcy5fY29sb3IgJiAweGZmMDAwMDAwICkgPj4+IDI0LCAvLyA8LS0tLS0tLS0tIFplcm8tZmlsbCByaWdodCBzaGlmdFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAwMCApID4+PiAxNiwgLy8gPC0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMCApID4+PiA4LCAvLyA8LS0tLS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9jb2xvciAmIDB4ZmYpO1xuXG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvYmplY3Qgd2l0aCBhbiBFdmVudERpc3BhdGNoZXIgb2JqZWN0IHNvIHRoYXQgdGhlIGxpc3RlbmVyIHJlY2VpdmVzIG5vdGlmaWNhdGlvbiBvZiBhbiBldmVudC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBpbnRvIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogWW91IGNhbiByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgb24gYWxsIG5vZGVzIGluIHRoZSBkaXNwbGF5IGxpc3QgZm9yIGEgc3BlY2lmaWMgdHlwZSBvZiBldmVudCwgcGhhc2UsIGFuZCBwcmlvcml0eS5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgdGhlIGV2ZW50LlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdvcmtzIGluIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdXNlQ2FwdHVyZSBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIGNhcHR1cmUgcGhhc2UgYW5kIG5vdCBpbiB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBJZiB1c2VDYXB0dXJlIGlzIGZhbHNlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBUbyBsaXN0ZW4gZm9yIHRoZSBldmVudCBpbiBhbGwgdGhyZWUgcGhhc2VzLCBjYWxsIGFkZEV2ZW50TGlzdGVuZXIgdHdpY2UsIG9uY2Ugd2l0aCB1c2VDYXB0dXJlIHNldCB0byB0cnVlLCB0aGVuIGFnYWluIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gZmFsc2UuXG5cdCAqIEBwYXJhbSBwcmlvcml0eSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBUaGUgcHJpb3JpdHkgaXMgZGVzaWduYXRlZCBieSBhIHNpZ25lZCAzMi1iaXQgaW50ZWdlci4gVGhlIGhpZ2hlciB0aGUgbnVtYmVyLCB0aGUgaGlnaGVyIHRoZSBwcmlvcml0eS4gQWxsIGxpc3RlbmVycyB3aXRoIHByaW9yaXR5IG4gYXJlIHByb2Nlc3NlZCBiZWZvcmUgbGlzdGVuZXJzIG9mIHByaW9yaXR5IG4tMS4gSWYgdHdvIG9yIG1vcmUgbGlzdGVuZXJzIHNoYXJlIHRoZSBzYW1lIHByaW9yaXR5LCB0aGV5IGFyZSBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC4gVGhlIGRlZmF1bHQgcHJpb3JpdHkgaXMgMC5cblx0ICogQHBhcmFtIHVzZVdlYWtSZWZlcmVuY2UgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGxpc3RlbmVyIGlzIHN0cm9uZyBvciB3ZWFrLiBBIHN0cm9uZyByZWZlcmVuY2UgKHRoZSBkZWZhdWx0KSBwcmV2ZW50cyB5b3VyIGxpc3RlbmVyIGZyb20gYmVpbmcgZ2FyYmFnZS1jb2xsZWN0ZWQuIEEgd2VhayByZWZlcmVuY2UgZG9lcyBub3QuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ2FkZEV2ZW50TGlzdGVuZXInICwgICdFbnRlckZyYW1lLCBFeGl0RnJhbWUnKTtcblxuXHRcdC8vaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgKXsvLyYmICEgdGhpcy5fZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQvL19mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cdFx0Ly99XG5cblx0XHQvKiBPcmlnaW5hbCBjb2RlXG5cdFx0IGlmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICYmICEgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0IF9mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IG91dCBvZiBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIElmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIGxpc3RlbmVyIHJlZ2lzdGVyZWQgd2l0aCB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdCwgYSBjYWxsIHRvIHRoaXMgbWV0aG9kIGhhcyBubyBlZmZlY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIG9iamVjdCB0byByZW1vdmUuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIGJvdGggdGhlIGNhcHR1cmUgcGhhc2UgYW5kIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcywgdHdvIGNhbGxzIHRvIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSBhcmUgcmVxdWlyZWQgdG8gcmVtb3ZlIGJvdGgsIG9uZSBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byB0cnVlLCBhbmQgYW5vdGhlciBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byBmYWxzZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Lypcblx0XHQgLy8gUmVtb3ZlIHRoZSBtYWluIHJlbmRlcmluZyBsaXN0ZW5lciBpZiBubyBFbnRlckZyYW1lIGxpc3RlbmVycyByZW1haW5cblx0XHQgaWYgKCAgICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcyApXG5cdFx0ICYmICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzKSApIC8vJiYgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0IHtcblxuXHRcdCAvL19mcmFtZUV2ZW50RHJpdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIHRoaXMub25FbnRlckZyYW1lLCB0aGlzICk7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NjaXNzb3JSZWN0O1xuXHR9XG5cblx0cHVibGljIHNldCBzY2lzc29yUmVjdCh2YWx1ZTpSZWN0YW5nbGUpXG5cdHtcblx0XHR0aGlzLl9zY2lzc29yUmVjdCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTY2lzc29yUmVjdGFuZ2xlKHRoaXMuX3NjaXNzb3JSZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggb2YgdGhlIFN0YWdlIHdoaWNoIGlzIG1hbmFnZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHVibGljIGdldCBzdGFnZUluZGV4KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgU3RhZ2UgbWFuYWdlZCBieSB0aGlzIHByb3h5IGlzIHJ1bm5pbmcgaW4gc29mdHdhcmUgbW9kZS5cblx0ICogUmVtZW1iZXIgdG8gd2FpdCBmb3IgdGhlIENPTlRFWFRfQ1JFQVRFRCBldmVudCBiZWZvcmUgY2hlY2tpbmcgdGhpcyBwcm9wZXJ0eSxcblx0ICogYXMgb25seSB0aGVuIHdpbGwgaXQgYmUgZ3VhcmFudGVlZCB0byBiZSBhY2N1cmF0ZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgdXNlc1NvZnR3YXJlUmVuZGVyaW5nKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW50aUFsaWFzaW5nIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW50aUFsaWFzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW50aUFsaWFzO1xuXHR9XG5cblx0cHVibGljIHNldCBhbnRpQWxpYXMoYW50aUFsaWFzOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCB2aWV3UG9ydCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3IoY29sb3I6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fY29sb3IgPSBjb2xvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZnJlc2hseSBjbGVhcmVkIHN0YXRlIG9mIHRoZSBiYWNrYnVmZmVyIGJlZm9yZSBhbnkgcmVuZGVyaW5nXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGJ1ZmZlckNsZWFyKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2J1ZmZlckNsZWFyO1xuXHR9XG5cblx0cHVibGljIHNldCBidWZmZXJDbGVhcihuZXdCdWZmZXJDbGVhcjpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSBuZXdCdWZmZXJDbGVhcjtcblx0fVxuXG5cdC8qXG5cdCAqIEFjY2VzcyB0byBmaXJlIG1vdXNlZXZlbnRzIGFjcm9zcyBtdWx0aXBsZSBsYXllcmVkIHZpZXczRCBpbnN0YW5jZXNcblx0ICovXG5cdC8vXHRcdHB1YmxpYyBnZXQgbW91c2UzRE1hbmFnZXIoKTpNb3VzZTNETWFuYWdlclxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlM0RNYW5hZ2VyO1xuXHQvL1x0XHR9XG5cdC8vXG5cdC8vXHRcdHB1YmxpYyBzZXQgbW91c2UzRE1hbmFnZXIodmFsdWU6TW91c2UzRE1hbmFnZXIpXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHR0aGlzLl9tb3VzZTNETWFuYWdlciA9IHZhbHVlO1xuXHQvL1x0XHR9XG5cblx0LyogVE9ETzogaW1wbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblx0IHB1YmxpYyBnZXQgdG91Y2gzRE1hbmFnZXIoKTpUb3VjaDNETWFuYWdlclxuXHQge1xuXHQgcmV0dXJuIF90b3VjaDNETWFuYWdlcjtcblx0IH1cblxuXHQgcHVibGljIHNldCB0b3VjaDNETWFuYWdlcih2YWx1ZTpUb3VjaDNETWFuYWdlcilcblx0IHtcblx0IF90b3VjaDNETWFuYWdlciA9IHZhbHVlO1xuXHQgfVxuXHQgKi9cblxuXHQvKipcblx0ICogRnJlZXMgdGhlIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3RhZ2VQcm94eS5cblx0ICovXG5cdHByaXZhdGUgZnJlZUNvbnRleHQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpIHtcblx0XHRcdHRoaXMuX2NvbnRleHQuZGlzcG9zZSgpO1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBFbnRlcl9GcmFtZSBoYW5kbGVyIGZvciBwcm9jZXNzaW5nIHRoZSBwcm94eS5FTlRFUl9GUkFNRSBhbmQgcHJveHkuRVhJVF9GUkFNRSBldmVudCBoYW5kbGVycy5cblx0ICogVHlwaWNhbGx5IHRoZSBwcm94eS5FTlRFUl9GUkFNRSBsaXN0ZW5lciB3b3VsZCByZW5kZXIgdGhlIGxheWVycyBmb3IgdGhpcyBTdGFnZSBpbnN0YW5jZS5cblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWdlIGluc3RhbmNlXG5cdFx0dGhpcy5jbGVhcigpO1xuXHRcdC8vbm90aWZ5IHRoZSBlbnRlcmZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RW50ZXJGcmFtZSgpO1xuXHRcdC8vIENhbGwgdGhlIHByZXNlbnQoKSB0byByZW5kZXIgdGhlIGZyYW1lXG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5wcmVzZW50KCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGV4aXRmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUV4aXRGcmFtZSgpO1xuXHR9XG5cblx0cHVibGljIHJlY292ZXJGcm9tRGlzcG9zYWwoKTpib29sZWFuXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdyZWNvdmVyRnJvbURpc3Bvc2FsJyAsICcnICk7XG5cblx0XHQvKlxuXHRcdCBpZiAodGhpcy5faUNvbnRleHQuZHJpdmVySW5mbyA9PSBcIkRpc3Bvc2VkXCIpXG5cdFx0IHtcblx0XHQgdGhpcy5faUNvbnRleHQgPSBudWxsO1xuXHRcdCB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0IHJldHVybiBmYWxzZTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fVxuXG5cdHByaXZhdGUgX2NhbGxiYWNrKGNvbnRleHQ6SUNvbnRleHQpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NvbnRleHQuY29udGFpbmVyO1xuXG5cdFx0Ly8gT25seSBjb25maWd1cmUgYmFjayBidWZmZXIgaWYgd2lkdGggYW5kIGhlaWdodCBoYXZlIGJlZW4gc2V0LFxuXHRcdC8vIHdoaWNoIHRoZXkgbWF5IG5vdCBoYXZlIGJlZW4gaWYgVmlldy5yZW5kZXIoKSBoYXMgeWV0IHRvIGJlXG5cdFx0Ly8gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXG5cdFx0aWYgKHRoaXMuX3dpZHRoICYmIHRoaXMuX2hlaWdodClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cblx0XHQvLyBEaXNwYXRjaCB0aGUgYXBwcm9wcmlhdGUgZXZlbnQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY29udGV4dCB3YXNcblx0XHQvLyBjcmVhdGVkIGZvciB0aGUgZmlyc3QgdGltZSBvciByZWNyZWF0ZWQgYWZ0ZXIgYSBkZXZpY2UgbG9zcy5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQodGhpcy5faW5pdGlhbGlzZWQ/IFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQgOiBTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCkpO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlOyJdfQ==