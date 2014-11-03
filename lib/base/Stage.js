var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var Event = require("awayjs-core/lib/events/Event");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var RenderTexture = require("awayjs-core/lib/textures/RenderTexture");
var CSS = require("awayjs-core/lib/utils/CSS");
var ContextMode = require("awayjs-display/lib/display/ContextMode");
var StageEvent = require("awayjs-display/lib/events/StageEvent");
var ContextGLTextureFormat = require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
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
        this._programData = new Array();
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
    Stage.prototype.getProgramData = function (key) {
        return this._programDataPool.getItem(key);
    };
    Stage.prototype.setRenderTarget = function (target, enableDepthAndStencil, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        if (this._renderTarget === target && surfaceSelector == this._renderSurfaceSelector && this._enableDepthAndStencil == enableDepthAndStencil)
            return;
        this._renderTarget = target;
        this._renderSurfaceSelector = surfaceSelector;
        this._enableDepthAndStencil = enableDepthAndStencil;
        if (target instanceof RenderTexture) {
            this._context.setRenderToTexture(this.getRenderTexture(target), enableDepthAndStencil, this._antiAlias, surfaceSelector);
        }
        else {
            this._context.setRenderToBackBuffer();
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        }
    };
    Stage.prototype.getRenderTexture = function (textureProxy) {
        var textureData = this._texturePool.getItem(textureProxy);
        if (!textureData.texture)
            textureData.texture = this._context.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);
        return textureData.texture;
    };
    /**
     * Assigns an attribute stream
     *
     * @param index The attribute stream index for the vertex shader
     * @param buffer
     * @param offset
     * @param stride
     * @param format
     */
    Stage.prototype.activateBuffer = function (index, buffer, offset, format) {
        if (!buffer.contexts[this._stageIndex])
            buffer.contexts[this._stageIndex] = this._context;
        if (!buffer.buffers[this._stageIndex]) {
            buffer.buffers[this._stageIndex] = this._context.createVertexBuffer(buffer.data.length / buffer.dataPerVertex, buffer.dataPerVertex);
            buffer.invalid[this._stageIndex] = true;
        }
        if (buffer.invalid[this._stageIndex]) {
            buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length / buffer.dataPerVertex);
            buffer.invalid[this._stageIndex] = false;
        }
        this._context.setVertexBufferAt(index, buffer.buffers[this._stageIndex], offset, format);
    };
    Stage.prototype.disposeVertexData = function (buffer) {
        buffer.buffers[this._stageIndex].dispose();
        buffer.buffers[this._stageIndex] = null;
    };
    Stage.prototype.activateRenderTexture = function (index, textureProxy) {
        this._context.setTextureAt(index, this.getRenderTexture(textureProxy));
    };
    Stage.prototype.activateTexture = function (index, textureProxy) {
        var textureData = this._texturePool.getItem(textureProxy);
        if (!textureData.texture) {
            textureData.texture = this._context.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);
            textureData.invalid = true;
        }
        if (textureData.invalid) {
            textureData.invalid = false;
            if (textureProxy.generateMipmaps) {
                var mipmapData = textureProxy._iGetMipmapData();
                var len = mipmapData.length;
                for (var i = 0; i < len; i++)
                    textureData.texture.uploadFromData(mipmapData[i], i);
            }
            else {
                textureData.texture.uploadFromData(textureProxy._iGetTextureData(), 0);
            }
        }
        this._context.setTextureAt(index, textureData.texture);
    };
    Stage.prototype.activateCubeTexture = function (index, textureProxy) {
        var textureData = this._texturePool.getItem(textureProxy);
        if (!textureData.texture) {
            textureData.texture = this._context.createCubeTexture(textureProxy.size, ContextGLTextureFormat.BGRA, false);
            textureData.invalid = true;
        }
        if (textureData.invalid) {
            textureData.invalid = false;
            for (var i = 0; i < 6; ++i) {
                if (textureProxy.generateMipmaps) {
                    var mipmapData = textureProxy._iGetMipmapData(i);
                    var len = mipmapData.length;
                    for (var j = 0; j < len; j++)
                        textureData.texture.uploadFromData(mipmapData[j], i, j);
                }
                else {
                    textureData.texture.uploadFromData(textureProxy._iGetTextureData(i), i, 0);
                }
            }
        }
        this._context.setTextureAt(index, textureData.texture);
    };
    /**
     * Retrieves the VertexBuffer object that contains triangle indices.
     * @param context The ContextWeb for which we request the buffer
     * @return The VertexBuffer object that contains triangle indices.
     */
    Stage.prototype.getIndexBuffer = function (buffer) {
        if (!buffer.contexts[this._stageIndex])
            buffer.contexts[this._stageIndex] = this._context;
        if (!buffer.buffers[this._stageIndex]) {
            buffer.buffers[this._stageIndex] = this._context.createIndexBuffer(buffer.data.length);
            buffer.invalid[this._stageIndex] = true;
        }
        if (buffer.invalid[this._stageIndex]) {
            buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length);
            buffer.invalid[this._stageIndex] = false;
        }
        return buffer.buffers[this._stageIndex];
    };
    Stage.prototype.disposeIndexData = function (buffer) {
        buffer.buffers[this._stageIndex].dispose();
        buffer.buffers[this._stageIndex] = null;
    };
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
    Stage.prototype.registerProgram = function (programData) {
        var i = 0;
        while (this._programData[i] != null)
            i++;
        this._programData[i] = programData;
        programData.id = i;
    };
    Stage.prototype.unRegisterProgram = function (programData) {
        this._programData[programData.id] = null;
        programData.id = -1;
    };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL3N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxTQUFTLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNqRSxJQUFPLEtBQUssV0FBZ0IsOEJBQThCLENBQUMsQ0FBQztBQUM1RCxJQUFPLGVBQWUsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRTlFLElBQU8sYUFBYSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFFNUUsSUFBTyxHQUFHLFdBQWlCLDJCQUEyQixDQUFDLENBQUM7QUFFeEQsSUFBTyxXQUFXLFdBQWUsd0NBQXdDLENBQUMsQ0FBQztBQUMzRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLElBQU8sc0JBQXNCLFdBQVksZ0RBQWdELENBQUMsQ0FBQztBQUMzRixJQUFPLGNBQWMsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzdFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFjMUUsQUFRQTs7Ozs7OztHQURHO0lBQ0csS0FBSztJQUFTQSxVQUFkQSxLQUFLQSxVQUF3QkE7SUEwQ2xDQSxTQTFDS0EsS0FBS0EsQ0EwQ0VBLFNBQTJCQSxFQUFFQSxVQUFpQkEsRUFBRUEsWUFBeUJBLEVBQUVBLGFBQTZCQSxFQUFFQSxPQUEyQkE7UUFBMURDLDZCQUE2QkEsR0FBN0JBLHFCQUE2QkE7UUFBRUEsdUJBQTJCQSxHQUEzQkEsb0JBQTJCQTtRQUVoSkEsaUJBQU9BLENBQUNBO1FBMUNEQSxpQkFBWUEsR0FBc0JBLElBQUlBLEtBQUtBLEVBQWVBLENBQUNBO1FBTzNEQSxPQUFFQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUNkQSxPQUFFQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUV0QkEsMkdBQTJHQTtRQUVuR0EsZ0JBQVdBLEdBQVVBLENB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QUNBLENBQUNBLENBQUNBO1FBRWpIQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7SUFDRjVDLFlBQUNBO0FBQURBLENBcnRCQSxBQXF0QkNBLEVBcnRCbUIsZUFBZSxFQXF0QmxDO0FBRUQsQUFBZSxpQkFBTixLQUFLLENBQUMiLCJmaWxlIjoiYmFzZS9TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVjdGFuZ2xlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcbmltcG9ydCBFdmVudFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnRcIik7XG5pbXBvcnQgRXZlbnREaXNwYXRjaGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50RGlzcGF0Y2hlclwiKTtcbmltcG9ydCBDdWJlVGV4dHVyZUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9DdWJlVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgUmVuZGVyVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1JlbmRlclRleHR1cmVcIik7XG5pbXBvcnQgVGV4dHVyZVByb3h5QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmVQcm94eUJhc2VcIik7XG5pbXBvcnQgQ1NTXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xuXG5pbXBvcnQgQ29udGV4dE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Rpc3BsYXkvQ29udGV4dE1vZGVcIik7XG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XG5cbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGb3JtYXRcIik7XG5pbXBvcnQgQ29udGV4dFN0YWdlM0RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNEXCIpO1xuaW1wb3J0IENvbnRleHRXZWJHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XG5pbXBvcnQgSUNvbnRleHRTdGFnZUdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dFN0YWdlR0xcIik7XG5pbXBvcnQgSUN1YmVUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJSW5kZXhCdWZmZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUluZGV4QnVmZmVyXCIpO1xuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgSVRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBJbmRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW5kZXhEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVGV4dHVyZURhdGFQb29sXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFQb29sXCIpO1xuaW1wb3J0IFZlcnRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVmVydGV4RGF0YVwiKTtcbmltcG9ydCBTdGFnZU1hbmFnZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcblxuLyoqXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxuICogYnV0IHJlcXVlc3RlZCB0aHJvdWdoIFN0YWdlTWFuYWdlci5cbiAqXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXG4gKlxuICovXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9wcm9ncmFtRGF0YTpBcnJheTxQcm9ncmFtRGF0YT4gPSBuZXcgQXJyYXk8UHJvZ3JhbURhdGE+KCk7XG5cdHByaXZhdGUgX3RleHR1cmVQb29sOlRleHR1cmVEYXRhUG9vbDtcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGFQb29sOlByb2dyYW1EYXRhUG9vbDtcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dFN0YWdlR0w7XG5cdHByaXZhdGUgX2NvbnRhaW5lcjpIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuXHRwcml2YXRlIF94Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3k6bnVtYmVyID0gMDtcblxuXHQvL3ByaXZhdGUgc3RhdGljIF9mcmFtZUV2ZW50RHJpdmVyOlNoYXBlID0gbmV3IFNoYXBlKCk7IC8vIFRPRE86IGFkZCBmcmFtZSBkcml2ZXIgLyByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxuXG5cdHByaXZhdGUgX3N0YWdlSW5kZXg6bnVtYmVyID0gLTE7XG5cblx0cHJpdmF0ZSBfdXNlc1NvZnR3YXJlUmVuZGVyaW5nOmJvb2xlYW47XG5cdHByaXZhdGUgX3Byb2ZpbGU6c3RyaW5nO1xuXHRwcml2YXRlIF9zdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyO1xuXHRwcml2YXRlIF9hbnRpQWxpYXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW47XG5cdHByaXZhdGUgX2NvbnRleHRSZXF1ZXN0ZWQ6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgdmFyIF9hY3RpdmVWZXJ0ZXhCdWZmZXJzIDogVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+ID0gbmV3IFZlY3Rvci48VmVydGV4QnVmZmVyPig4LCB0cnVlKTtcblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVGV4dHVyZXMgOiBWZWN0b3IuPFRleHR1cmVCYXNlPiA9IG5ldyBWZWN0b3IuPFRleHR1cmVCYXNlPig4LCB0cnVlKTtcblx0cHJpdmF0ZSBfcmVuZGVyVGFyZ2V0OlRleHR1cmVQcm94eUJhc2UgPSBudWxsO1xuXHRwcml2YXRlIF9yZW5kZXJTdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc2Npc3NvclJlY3Q6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9jb2xvcjpudW1iZXI7XG5cdHByaXZhdGUgX2JhY2tCdWZmZXJEaXJ0eTpib29sZWFuO1xuXHRwcml2YXRlIF92aWV3UG9ydDpSZWN0YW5nbGU7XG5cdHByaXZhdGUgX2VudGVyRnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX2V4aXRGcmFtZTpFdmVudDtcblx0cHJpdmF0ZSBfdmlld3BvcnRVcGRhdGVkOlN0YWdlRXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYnVmZmVyQ2xlYXI6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgX21vdXNlM0RNYW5hZ2VyOmF3YXkubWFuYWdlcnMuTW91c2UzRE1hbmFnZXI7XG5cdC8vcHJpdmF0ZSBfdG91Y2gzRE1hbmFnZXI6VG91Y2gzRE1hbmFnZXI7IC8vVE9ETzogaW1lcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cblx0cHJpdmF0ZSBfaW5pdGlhbGlzZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG5cdGNvbnN0cnVjdG9yKGNvbnRhaW5lcjpIVE1MQ2FudmFzRWxlbWVudCwgc3RhZ2VJbmRleDpudW1iZXIsIHN0YWdlTWFuYWdlcjpTdGFnZU1hbmFnZXIsIGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIilcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG5cblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gc3RhZ2VJbmRleDtcblxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcblxuXHRcdHRoaXMuX3ZpZXdQb3J0ID0gbmV3IFJlY3RhbmdsZSgpO1xuXG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gdHJ1ZTtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIDApO1xuXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXRQcm9ncmFtRGF0YShrZXk6c3RyaW5nKTpQcm9ncmFtRGF0YVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Byb2dyYW1EYXRhUG9vbC5nZXRJdGVtKGtleSk7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyVGFyZ2V0KHRhcmdldDpUZXh0dXJlUHJveHlCYXNlLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbiA9IGZhbHNlLCBzdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMClcblx0e1xuXHRcdGlmICh0aGlzLl9yZW5kZXJUYXJnZXQgPT09IHRhcmdldCAmJiBzdXJmYWNlU2VsZWN0b3IgPT0gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yICYmIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9PSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9yZW5kZXJUYXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yID0gc3VyZmFjZVNlbGVjdG9yO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHRpZiAodGFyZ2V0IGluc3RhbmNlb2YgUmVuZGVyVGV4dHVyZSkge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb1RleHR1cmUodGhpcy5nZXRSZW5kZXJUZXh0dXJlKDxSZW5kZXJUZXh0dXJlPiB0YXJnZXQpLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwsIHRoaXMuX2FudGlBbGlhcywgc3VyZmFjZVNlbGVjdG9yKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldFJlbmRlclRleHR1cmUodGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpOklUZXh0dXJlQmFzZVxuXHR7XG5cdFx0dmFyIHRleHR1cmVEYXRhOlRleHR1cmVEYXRhID0gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHkpO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKVxuXHRcdFx0dGV4dHVyZURhdGEudGV4dHVyZSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVGV4dHVyZSh0ZXh0dXJlUHJveHkud2lkdGgsIHRleHR1cmVQcm94eS5oZWlnaHQsIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQkdSQSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gdGV4dHVyZURhdGEudGV4dHVyZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBc3NpZ25zIGFuIGF0dHJpYnV0ZSBzdHJlYW1cblx0ICpcblx0ICogQHBhcmFtIGluZGV4IFRoZSBhdHRyaWJ1dGUgc3RyZWFtIGluZGV4IGZvciB0aGUgdmVydGV4IHNoYWRlclxuXHQgKiBAcGFyYW0gYnVmZmVyXG5cdCAqIEBwYXJhbSBvZmZzZXRcblx0ICogQHBhcmFtIHN0cmlkZVxuXHQgKiBAcGFyYW0gZm9ybWF0XG5cdCAqL1xuXHRwdWJsaWMgYWN0aXZhdGVCdWZmZXIoaW5kZXg6bnVtYmVyLCBidWZmZXI6VmVydGV4RGF0YSwgb2Zmc2V0Om51bWJlciwgZm9ybWF0OnN0cmluZylcblx0e1xuXHRcdGlmICghYnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdKVxuXHRcdFx0YnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dDtcblxuXHRcdGlmICghYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dC5jcmVhdGVWZXJ0ZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoL2J1ZmZlci5kYXRhUGVyVmVydGV4LCBidWZmZXIuZGF0YVBlclZlcnRleCk7XG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS51cGxvYWRGcm9tQXJyYXkoYnVmZmVyLmRhdGEsIDAsIGJ1ZmZlci5kYXRhLmxlbmd0aC9idWZmZXIuZGF0YVBlclZlcnRleCk7XG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VmVydGV4QnVmZmVyQXQoaW5kZXgsIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLCBvZmZzZXQsIGZvcm1hdCk7XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZVZlcnRleERhdGEoYnVmZmVyOlZlcnRleERhdGEpXG5cdHtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS5kaXNwb3NlKCk7XG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSBudWxsO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlUmVuZGVyVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpSZW5kZXJUZXh0dXJlKVxuXHR7XG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRoaXMuZ2V0UmVuZGVyVGV4dHVyZSh0ZXh0dXJlUHJveHkpKTtcblx0fVxuXG5cdHB1YmxpYyBhY3RpdmF0ZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6VGV4dHVyZTJEQmFzZSlcblx0e1xuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHkpO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVUZXh0dXJlKHRleHR1cmVQcm94eS53aWR0aCwgdGV4dHVyZVByb3h5LmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKTtcblx0XHRcdHRleHR1cmVEYXRhLmludmFsaWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0ZXh0dXJlRGF0YS5pbnZhbGlkKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gZmFsc2U7XG5cdFx0XHRpZiAodGV4dHVyZVByb3h5LmdlbmVyYXRlTWlwbWFwcykge1xuXHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoKTtcblx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEobWlwbWFwRGF0YVtpXSwgaSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQoPElUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YSh0ZXh0dXJlUHJveHkuX2lHZXRUZXh0dXJlRGF0YSgpLCAwKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGV4dHVyZURhdGEudGV4dHVyZSk7XG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGVDdWJlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpDdWJlVGV4dHVyZUJhc2UpXG5cdHtcblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSA8VGV4dHVyZURhdGE+IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5KTtcblxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSkge1xuXHRcdFx0dGV4dHVyZURhdGEudGV4dHVyZSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlQ3ViZVRleHR1cmUodGV4dHVyZVByb3h5LnNpemUsIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQkdSQSwgZmFsc2UpO1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcblx0XHRcdHRleHR1cmVEYXRhLmludmFsaWQgPSBmYWxzZTtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IDY7ICsraSkge1xuXHRcdFx0XHRpZiAodGV4dHVyZVByb3h5LmdlbmVyYXRlTWlwbWFwcykge1xuXHRcdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcERhdGE+ID0gdGV4dHVyZVByb3h5Ll9pR2V0TWlwbWFwRGF0YShpKTtcblx0XHRcdFx0XHR2YXIgbGVuOm51bWJlciA9IG1pcG1hcERhdGEubGVuZ3RoO1xuXHRcdFx0XHRcdGZvciAodmFyIGo6bnVtYmVyID0gMDsgaiA8IGxlbjsgaisrKVxuXHRcdFx0XHRcdFx0KDxJQ3ViZVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbal0sIGksIGopO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YSh0ZXh0dXJlUHJveHkuX2lHZXRUZXh0dXJlRGF0YShpKSwgaSwgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGV4dHVyZURhdGEudGV4dHVyZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBWZXJ0ZXhCdWZmZXIgb2JqZWN0IHRoYXQgY29udGFpbnMgdHJpYW5nbGUgaW5kaWNlcy5cblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIENvbnRleHRXZWIgZm9yIHdoaWNoIHdlIHJlcXVlc3QgdGhlIGJ1ZmZlclxuXHQgKiBAcmV0dXJuIFRoZSBWZXJ0ZXhCdWZmZXIgb2JqZWN0IHRoYXQgY29udGFpbnMgdHJpYW5nbGUgaW5kaWNlcy5cblx0ICovXG5cdHB1YmxpYyBnZXRJbmRleEJ1ZmZlcihidWZmZXI6SW5kZXhEYXRhKTpJSW5kZXhCdWZmZXJcblx0e1xuXHRcdGlmICghYnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdKVxuXHRcdFx0YnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dDtcblxuXHRcdGlmICghYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dC5jcmVhdGVJbmRleEJ1ZmZlcihidWZmZXIuZGF0YS5sZW5ndGgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0udXBsb2FkRnJvbUFycmF5KGJ1ZmZlci5kYXRhLCAwLCBidWZmZXIuZGF0YS5sZW5ndGgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF07XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZUluZGV4RGF0YShidWZmZXI6SW5kZXhEYXRhKVxuXHR7XG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0uZGlzcG9zZSgpO1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhIENvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUgbWFuYWdlZCBnbCBjYW52YXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKVxuXHR7XG5cdFx0Ly8gSWYgZm9yY2luZyBzb2Z0d2FyZSwgd2UgY2FuIGJlIGNlcnRhaW4gdGhhdCB0aGVcblx0XHQvLyByZXR1cm5lZCBDb250ZXh0IHdpbGwgYmUgcnVubmluZyBzb2Z0d2FyZSBtb2RlLlxuXHRcdC8vIElmIG5vdCwgd2UgY2FuJ3QgYmUgc3VyZSBhbmQgc2hvdWxkIHN0aWNrIHRvIHRoZVxuXHRcdC8vIG9sZCB2YWx1ZSAod2lsbCBsaWtlbHkgYmUgc2FtZSBpZiByZS1yZXF1ZXN0aW5nLilcblxuXHRcdGlmICh0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgIT0gbnVsbClcblx0XHRcdHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyA9IGZvcmNlU29mdHdhcmU7XG5cblx0XHR0aGlzLl9wcm9maWxlID0gcHJvZmlsZTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5GTEFTSClcblx0XHRcdFx0bmV3IENvbnRleHRTdGFnZTNEKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCB0aGlzLl9zdGFnZUluZGV4LCAoY29udGV4dDpJQ29udGV4dFN0YWdlR0wpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhpcy5fY29udGV4dCA9IG5ldyBDb250ZXh0V2ViR0woPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIHRoaXMuX3N0YWdlSW5kZXgpO1xuXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuQVVUTylcblx0XHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIHRoaXMuX3N0YWdlSW5kZXgsIChjb250ZXh0OklDb250ZXh0U3RhZ2VHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NhbGxiYWNrKHRoaXMuX2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3dpZHRoID0gdGhpcy5fdmlld1BvcnQud2lkdGggPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl94ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB5KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0cHVibGljIHNldCB2aXNpYmxlKHZhbDpib29sZWFuKVxuXHR7XG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXG5cdHtcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29udGV4dCgpOklDb250ZXh0U3RhZ2VHTFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRleHQ7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpXG5cdHtcblx0XHRpZiAodGhpcy5fdmlld3BvcnREaXJ0eSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSB0cnVlO1xuXG5cdFx0Ly9pZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0Ly9pZiAoIV92aWV3cG9ydFVwZGF0ZWQpXG5cdFx0dGhpcy5fdmlld3BvcnRVcGRhdGVkID0gbmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl92aWV3cG9ydFVwZGF0ZWQpO1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFbnRlckZyYW1lKClcblx0e1xuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSlcblx0XHQvL3JldHVybjtcblxuXHRcdGlmICghdGhpcy5fZW50ZXJGcmFtZSlcblx0XHRcdHRoaXMuX2VudGVyRnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRU5URVJfRlJBTUUpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2VudGVyRnJhbWUpO1xuXG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeUV4aXRGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FKSlcblx0XHQvL3JldHVybjtcblxuXHRcdGlmICghdGhpcy5fZXhpdEZyYW1lKVxuXHRcdFx0dGhpcy5fZXhpdEZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVYSVRfRlJBTUUpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2V4aXRGcmFtZSk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHByb2ZpbGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9maWxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc3Bvc2VzIHRoZSBTdGFnZSBvYmplY3QsIGZyZWVpbmcgdGhlIENvbnRleHQgYXR0YWNoZWQgdG8gdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyLmlSZW1vdmVTdGFnZSh0aGlzKTtcblx0XHR0aGlzLmZyZWVDb250ZXh0KCk7XG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gbnVsbDtcblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gLTE7XG5cdH1cblxuXHQvKipcblx0ICogQ29uZmlndXJlcyB0aGUgYmFjayBidWZmZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBTdGFnZSBvYmplY3QuXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVyV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBiYWNrYnVmZmVyLlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlckhlaWdodCBUaGUgaGVpZ2h0IG9mIHRoZSBiYWNrYnVmZmVyLlxuXHQgKiBAcGFyYW0gYW50aUFsaWFzIFRoZSBhbW91bnQgb2YgYW50aS1hbGlhc2luZyB0byB1c2UuXG5cdCAqIEBwYXJhbSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGJhY2sgYnVmZmVyIGNvbnRhaW5zIGEgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyLlxuXHQgKi9cblx0cHVibGljIGNvbmZpZ3VyZUJhY2tCdWZmZXIoYmFja0J1ZmZlcldpZHRoOm51bWJlciwgYmFja0J1ZmZlckhlaWdodDpudW1iZXIsIGFudGlBbGlhczpudW1iZXIsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy53aWR0aCA9IGJhY2tCdWZmZXJXaWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGJhY2tCdWZmZXJIZWlnaHQ7XG5cblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jb250ZXh0LmNvbmZpZ3VyZUJhY2tCdWZmZXIoYmFja0J1ZmZlcldpZHRoLCBiYWNrQnVmZmVySGVpZ2h0LCBhbnRpQWxpYXMsIGVuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdH1cblxuXHQvKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyIGlzIHVzZWRcblx0ICovXG5cdHB1YmxpYyBnZXQgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHJlbmRlclRhcmdldCgpOlRleHR1cmVQcm94eUJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJUYXJnZXQ7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHJlbmRlclN1cmZhY2VTZWxlY3RvcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclN1cmZhY2VTZWxlY3Rvcjtcblx0fVxuXG5cdC8qXG5cdCAqIENsZWFyIGFuZCByZXNldCB0aGUgYmFjayBidWZmZXIgd2hlbiB1c2luZyBhIHNoYXJlZCBjb250ZXh0XG5cdCAqL1xuXHRwdWJsaWMgY2xlYXIoKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSkge1xuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0XHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQuY2xlYXIoKCB0aGlzLl9jb2xvciAmIDB4ZmYwMDAwMDAgKSA+Pj4gMjQsIC8vIDwtLS0tLS0tLS0gWmVyby1maWxsIHJpZ2h0IHNoaWZ0XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMDAwICkgPj4+IDE2LCAvLyA8LS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwICkgPj4+IDgsIC8vIDwtLS0tLS0tLS0tLS0tLS0tfFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2NvbG9yICYgMHhmZik7XG5cblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIG9iamVjdCB3aXRoIGFuIEV2ZW50RGlzcGF0Y2hlciBvYmplY3Qgc28gdGhhdCB0aGUgbGlzdGVuZXIgcmVjZWl2ZXMgbm90aWZpY2F0aW9uIG9mIGFuIGV2ZW50LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IGludG8gYXV0b21hdGljIHJlbmRlciBtb2RlLlxuXHQgKiBZb3UgY2FuIHJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVycyBvbiBhbGwgbm9kZXMgaW4gdGhlIGRpc3BsYXkgbGlzdCBmb3IgYSBzcGVjaWZpYyB0eXBlIG9mIGV2ZW50LCBwaGFzZSwgYW5kIHByaW9yaXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyB0aGUgZXZlbnQuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIERldGVybWluZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd29ya3MgaW4gdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB1c2VDYXB0dXJlIGlzIHNldCB0byB0cnVlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgY2FwdHVyZSBwaGFzZSBhbmQgbm90IGluIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIElmIHVzZUNhcHR1cmUgaXMgZmFsc2UsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIFRvIGxpc3RlbiBmb3IgdGhlIGV2ZW50IGluIGFsbCB0aHJlZSBwaGFzZXMsIGNhbGwgYWRkRXZlbnRMaXN0ZW5lciB0d2ljZSwgb25jZSB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIHRydWUsIHRoZW4gYWdhaW4gd2l0aCB1c2VDYXB0dXJlIHNldCB0byBmYWxzZS5cblx0ICogQHBhcmFtIHByaW9yaXR5IFRoZSBwcmlvcml0eSBsZXZlbCBvZiB0aGUgZXZlbnQgbGlzdGVuZXIuIFRoZSBwcmlvcml0eSBpcyBkZXNpZ25hdGVkIGJ5IGEgc2lnbmVkIDMyLWJpdCBpbnRlZ2VyLiBUaGUgaGlnaGVyIHRoZSBudW1iZXIsIHRoZSBoaWdoZXIgdGhlIHByaW9yaXR5LiBBbGwgbGlzdGVuZXJzIHdpdGggcHJpb3JpdHkgbiBhcmUgcHJvY2Vzc2VkIGJlZm9yZSBsaXN0ZW5lcnMgb2YgcHJpb3JpdHkgbi0xLiBJZiB0d28gb3IgbW9yZSBsaXN0ZW5lcnMgc2hhcmUgdGhlIHNhbWUgcHJpb3JpdHksIHRoZXkgYXJlIHByb2Nlc3NlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkLiBUaGUgZGVmYXVsdCBwcmlvcml0eSBpcyAwLlxuXHQgKiBAcGFyYW0gdXNlV2Vha1JlZmVyZW5jZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHJlZmVyZW5jZSB0byB0aGUgbGlzdGVuZXIgaXMgc3Ryb25nIG9yIHdlYWsuIEEgc3Ryb25nIHJlZmVyZW5jZSAodGhlIGRlZmF1bHQpIHByZXZlbnRzIHlvdXIgbGlzdGVuZXIgZnJvbSBiZWluZyBnYXJiYWdlLWNvbGxlY3RlZC4gQSB3ZWFrIHJlZmVyZW5jZSBkb2VzIG5vdC5cblx0ICovXG5cdHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Ly9hd2F5LkRlYnVnLnRocm93UElSKCAnU3RhZ2VQcm94eScgLCAnYWRkRXZlbnRMaXN0ZW5lcicgLCAgJ0VudGVyRnJhbWUsIEV4aXRGcmFtZScpO1xuXG5cdFx0Ly9pZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSApey8vJiYgISB0aGlzLl9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcblxuXHRcdC8vX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XG5cblx0XHQvL31cblxuXHRcdC8qIE9yaWdpbmFsIGNvZGVcblx0XHQgaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgJiYgISBfZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQgX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XG5cblxuXHRcdCB9XG5cdFx0ICovXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgb3V0IG9mIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2hpbmcgbGlzdGVuZXIgcmVnaXN0ZXJlZCB3aXRoIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LCBhIGNhbGwgdG8gdGhpcyBtZXRob2QgaGFzIG5vIGVmZmVjdC5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgb2JqZWN0IHRvIHJlbW92ZS5cblx0ICogQHBhcmFtIHVzZUNhcHR1cmUgU3BlY2lmaWVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciB0aGUgY2FwdHVyZSBwaGFzZSBvciB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMuIElmIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgYm90aCB0aGUgY2FwdHVyZSBwaGFzZSBhbmQgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLCB0d28gY2FsbHMgdG8gcmVtb3ZlRXZlbnRMaXN0ZW5lcigpIGFyZSByZXF1aXJlZCB0byByZW1vdmUgYm90aCwgb25lIGNhbGwgd2l0aCB1c2VDYXB0dXJlKCkgc2V0IHRvIHRydWUsIGFuZCBhbm90aGVyIGNhbGwgd2l0aCB1c2VDYXB0dXJlKCkgc2V0IHRvIGZhbHNlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxuXHR7XG5cdFx0c3VwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cblx0XHQvKlxuXHRcdCAvLyBSZW1vdmUgdGhlIG1haW4gcmVuZGVyaW5nIGxpc3RlbmVyIGlmIG5vIEVudGVyRnJhbWUgbGlzdGVuZXJzIHJlbWFpblxuXHRcdCBpZiAoICAgICEgdGhpcy5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzIClcblx0XHQgJiYgICEgdGhpcy5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVYSVRfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMpICkgLy8mJiBfZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSlcblx0XHQge1xuXG5cdFx0IC8vX2ZyYW1lRXZlbnREcml2ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgdGhpcy5vbkVudGVyRnJhbWUsIHRoaXMgKTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdH1cblxuXHRwdWJsaWMgZ2V0IHNjaXNzb3JSZWN0KCk6UmVjdGFuZ2xlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2Npc3NvclJlY3Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNjaXNzb3JSZWN0KHZhbHVlOlJlY3RhbmdsZSlcblx0e1xuXHRcdHRoaXMuX3NjaXNzb3JSZWN0ID0gdmFsdWU7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFNjaXNzb3JSZWN0YW5nbGUodGhpcy5fc2Npc3NvclJlY3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbmRleCBvZiB0aGUgU3RhZ2Ugd2hpY2ggaXMgbWFuYWdlZCBieSB0aGlzIGluc3RhbmNlIG9mIFN0YWdlUHJveHkuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHN0YWdlSW5kZXgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zdGFnZUluZGV4O1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBTdGFnZSBtYW5hZ2VkIGJ5IHRoaXMgcHJveHkgaXMgcnVubmluZyBpbiBzb2Z0d2FyZSBtb2RlLlxuXHQgKiBSZW1lbWJlciB0byB3YWl0IGZvciB0aGUgQ09OVEVYVF9DUkVBVEVEIGV2ZW50IGJlZm9yZSBjaGVja2luZyB0aGlzIHByb3BlcnR5LFxuXHQgKiBhcyBvbmx5IHRoZW4gd2lsbCBpdCBiZSBndWFyYW50ZWVkIHRvIGJlIGFjY3VyYXRlLlxuXHQgKi9cblx0cHVibGljIGdldCB1c2VzU29mdHdhcmVSZW5kZXJpbmcoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbnRpQWxpYXNpbmcgb2YgdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGdldCBhbnRpQWxpYXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbnRpQWxpYXM7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFudGlBbGlhcyhhbnRpQWxpYXM6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogQSB2aWV3UG9ydCByZWN0YW5nbGUgZXF1aXZhbGVudCBvZiB0aGUgU3RhZ2Ugc2l6ZSBhbmQgcG9zaXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0KCk6UmVjdGFuZ2xlXG5cdHtcblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gZmFsc2U7XG5cblx0XHRyZXR1cm4gdGhpcy5fdmlld1BvcnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIFN0YWdlLlxuXHQgKi9cblx0cHVibGljIGdldCBjb2xvcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbG9yO1xuXHR9XG5cblx0cHVibGljIHNldCBjb2xvcihjb2xvcjpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9jb2xvciA9IGNvbG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmcmVzaGx5IGNsZWFyZWQgc3RhdGUgb2YgdGhlIGJhY2tidWZmZXIgYmVmb3JlIGFueSByZW5kZXJpbmdcblx0ICovXG5cdHB1YmxpYyBnZXQgYnVmZmVyQ2xlYXIoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYnVmZmVyQ2xlYXI7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGJ1ZmZlckNsZWFyKG5ld0J1ZmZlckNsZWFyOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IG5ld0J1ZmZlckNsZWFyO1xuXHR9XG5cblxuXHRwdWJsaWMgcmVnaXN0ZXJQcm9ncmFtKHByb2dyYW1EYXRhOlByb2dyYW1EYXRhKVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyID0gMDtcblx0XHR3aGlsZSAodGhpcy5fcHJvZ3JhbURhdGFbaV0gIT0gbnVsbClcblx0XHRcdGkrKztcblxuXHRcdHRoaXMuX3Byb2dyYW1EYXRhW2ldID0gcHJvZ3JhbURhdGE7XG5cdFx0cHJvZ3JhbURhdGEuaWQgPSBpO1xuXHR9XG5cblx0cHVibGljIHVuUmVnaXN0ZXJQcm9ncmFtKHByb2dyYW1EYXRhOlByb2dyYW1EYXRhKVxuXHR7XG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFbcHJvZ3JhbURhdGEuaWRdID0gbnVsbDtcblx0XHRwcm9ncmFtRGF0YS5pZCA9IC0xO1xuXHR9XG5cblx0Lypcblx0ICogQWNjZXNzIHRvIGZpcmUgbW91c2VldmVudHMgYWNyb3NzIG11bHRpcGxlIGxheWVyZWQgdmlldzNEIGluc3RhbmNlc1xuXHQgKi9cblx0Ly9cdFx0cHVibGljIGdldCBtb3VzZTNETWFuYWdlcigpOk1vdXNlM0RNYW5hZ2VyXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHRyZXR1cm4gdGhpcy5fbW91c2UzRE1hbmFnZXI7XG5cdC8vXHRcdH1cblx0Ly9cblx0Ly9cdFx0cHVibGljIHNldCBtb3VzZTNETWFuYWdlcih2YWx1ZTpNb3VzZTNETWFuYWdlcilcblx0Ly9cdFx0e1xuXHQvL1x0XHRcdHRoaXMuX21vdXNlM0RNYW5hZ2VyID0gdmFsdWU7XG5cdC8vXHRcdH1cblxuXHQvKiBUT0RPOiBpbXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXHQgcHVibGljIGdldCB0b3VjaDNETWFuYWdlcigpOlRvdWNoM0RNYW5hZ2VyXG5cdCB7XG5cdCByZXR1cm4gX3RvdWNoM0RNYW5hZ2VyO1xuXHQgfVxuXG5cdCBwdWJsaWMgc2V0IHRvdWNoM0RNYW5hZ2VyKHZhbHVlOlRvdWNoM0RNYW5hZ2VyKVxuXHQge1xuXHQgX3RvdWNoM0RNYW5hZ2VyID0gdmFsdWU7XG5cdCB9XG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBGcmVlcyB0aGUgQ29udGV4dCBhc3NvY2lhdGVkIHdpdGggdGhpcyBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHJpdmF0ZSBmcmVlQ29udGV4dCgpXG5cdHtcblx0XHRpZiAodGhpcy5fY29udGV4dCkge1xuXHRcdFx0dGhpcy5fY29udGV4dC5kaXNwb3NlKCk7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0ID0gbnVsbDtcblxuXHRcdHRoaXMuX2luaXRpYWxpc2VkID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIEVudGVyX0ZyYW1lIGhhbmRsZXIgZm9yIHByb2Nlc3NpbmcgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGFuZCBwcm94eS5FWElUX0ZSQU1FIGV2ZW50IGhhbmRsZXJzLlxuXHQgKiBUeXBpY2FsbHkgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGxpc3RlbmVyIHdvdWxkIHJlbmRlciB0aGUgbGF5ZXJzIGZvciB0aGlzIFN0YWdlIGluc3RhbmNlLlxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZXZlbnQ6RXZlbnQpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBDbGVhciB0aGUgc3RhZ2UgaW5zdGFuY2Vcblx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGVudGVyZnJhbWUgbGlzdGVuZXJzXG5cdFx0dGhpcy5ub3RpZnlFbnRlckZyYW1lKCk7XG5cdFx0Ly8gQ2FsbCB0aGUgcHJlc2VudCgpIHRvIHJlbmRlciB0aGUgZnJhbWVcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jb250ZXh0LnByZXNlbnQoKTtcblx0XHQvL25vdGlmeSB0aGUgZXhpdGZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RXhpdEZyYW1lKCk7XG5cdH1cblxuXHRwdWJsaWMgcmVjb3ZlckZyb21EaXNwb3NhbCgpOmJvb2xlYW5cblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ3JlY292ZXJGcm9tRGlzcG9zYWwnICwgJycgKTtcblxuXHRcdC8qXG5cdFx0IGlmICh0aGlzLl9pQ29udGV4dC5kcml2ZXJJbmZvID09IFwiRGlzcG9zZWRcIilcblx0XHQge1xuXHRcdCB0aGlzLl9pQ29udGV4dCA9IG51bGw7XG5cdFx0IHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcblx0XHQgcmV0dXJuIGZhbHNlO1xuXG5cdFx0IH1cblx0XHQgKi9cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9XG5cblx0cHJpdmF0ZSBfY2FsbGJhY2soY29udGV4dDpJQ29udGV4dFN0YWdlR0wpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NvbnRleHQuY29udGFpbmVyO1xuXG5cdFx0Ly8gT25seSBjb25maWd1cmUgYmFjayBidWZmZXIgaWYgd2lkdGggYW5kIGhlaWdodCBoYXZlIGJlZW4gc2V0LFxuXHRcdC8vIHdoaWNoIHRoZXkgbWF5IG5vdCBoYXZlIGJlZW4gaWYgVmlldy5yZW5kZXIoKSBoYXMgeWV0IHRvIGJlXG5cdFx0Ly8gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXG5cdFx0aWYgKHRoaXMuX3dpZHRoICYmIHRoaXMuX2hlaWdodClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cblx0XHQvLyBEaXNwYXRjaCB0aGUgYXBwcm9wcmlhdGUgZXZlbnQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY29udGV4dCB3YXNcblx0XHQvLyBjcmVhdGVkIGZvciB0aGUgZmlyc3QgdGltZSBvciByZWNyZWF0ZWQgYWZ0ZXIgYSBkZXZpY2UgbG9zcy5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQodGhpcy5faW5pdGlhbGlzZWQ/IFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQgOiBTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCkpO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlOyJdfQ==