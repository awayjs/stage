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
var TextureDataPool = require("awayjs-stagegl/lib/pool/TextureDataPool");
var ProgramDataPool = require("awayjs-stagegl/lib/pool/ProgramDataPool");
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
        this._texturePool = new TextureDataPool();
        this._programDataPool = new ProgramDataPool(this);
        this._container = container;
        this._stageIndex = stageIndex;
        this._stageManager = stageManager;
        this._viewPort = new Rectangle();
        this._enableDepthAndStencil = true;
        CSS.setElementX(this._container, 0);
        CSS.setElementY(this._container, 0);
        this.visible = true;
    }
    Stage.prototype.getProgramData = function (vertexString, fragmentString) {
        return this._programDataPool.getItem(vertexString, fragmentString);
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
                new ContextStage3D(this._container, function (context) { return _this._callback(context); });
            else
                this._context = new ContextWebGL(this._container);
        }
        catch (e) {
            try {
                if (mode == ContextMode.AUTO)
                    new ContextStage3D(this._container, function (context) { return _this._callback(context); });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL3N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTyxTQUFTLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNqRSxJQUFPLEtBQUssV0FBZ0IsOEJBQThCLENBQUMsQ0FBQztBQUM1RCxJQUFPLGVBQWUsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRTlFLElBQU8sYUFBYSxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFHNUUsSUFBTyxHQUFHLFdBQWlCLDJCQUEyQixDQUFDLENBQUM7QUFFeEQsSUFBTyxXQUFXLFdBQWUsd0NBQXdDLENBQUMsQ0FBQztBQUMzRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBRXhFLElBQU8sc0JBQXNCLFdBQVksZ0RBQWdELENBQUMsQ0FBQztBQUMzRixJQUFPLGNBQWMsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzdFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFRMUUsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUUvRSxJQUFPLGVBQWUsV0FBYyx5Q0FBeUMsQ0FBQyxDQUFDO0FBSS9FLEFBUUE7Ozs7Ozs7R0FERztJQUNHLEtBQUs7SUFBU0EsVUFBZEEsS0FBS0EsVUFBd0JBO0lBMENsQ0EsU0ExQ0tBLEtBQUtBLENBMENFQSxTQUEyQkEsRUFBRUEsVUFBaUJBLEVBQUVBLFlBQXlCQSxFQUFFQSxhQUE2QkEsRUFBRUEsT0FBMkJBO1FBQTFEQyw2QkFBNkJBLEdBQTdCQSxxQkFBNkJBO1FBQUVBLHVCQUEyQkEsR0FBM0JBLG9CQUEyQkE7UUFFaEpBLGlCQUFPQSxDQUFDQTtRQTFDREEsaUJBQVlBLEdBQXNCQSxJQUFJQSxLQUFLQSxFQUFlQSxDQUFDQTtRQU8zREEsT0FBRUEsR0FBVUEsQ0FB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Q0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFFbkRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3ZGQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6Q0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3JGQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQ0EsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRU1WLGdDQUFnQkEsR0FBdkJBLFVBQXdCQSxNQUFnQkE7UUFFdkNXLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FB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QUU1R0EsQUFFQUEsa0VBRmtFQTtRQUNsRUEsK0RBQStEQTtRQUMvREEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBRUEsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxHQUFHQSxVQUFVQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVqSEEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBQ0Y1QyxZQUFDQTtBQUFEQSxDQXh0QkEsQUF3dEJDQSxFQXh0Qm1CLGVBQWUsRUF3dEJsQztBQUVELEFBQWUsaUJBQU4sS0FBSyxDQUFDIiwiZmlsZSI6ImJhc2UvU3RhZ2UuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YVwiKTtcbmltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUmVjdGFuZ2xlXCIpO1xuaW1wb3J0IEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcbmltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEN1YmVUZXh0dXJlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0N1YmVUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBSZW5kZXJUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvUmVuZGVyVGV4dHVyZVwiKTtcbmltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcbmltcG9ydCBUZXh0dXJlUHJveHlCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZVByb3h5QmFzZVwiKTtcbmltcG9ydCBDU1NcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9DU1NcIik7XG5cbmltcG9ydCBDb250ZXh0TW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZGlzcGxheS9Db250ZXh0TW9kZVwiKTtcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcblxuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGb3JtYXRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZvcm1hdFwiKTtcbmltcG9ydCBDb250ZXh0U3RhZ2UzRFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgQ29udGV4dFdlYkdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRXZWJHTFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XG5pbXBvcnQgSUN1YmVUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJSW5kZXhCdWZmZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUluZGV4QnVmZmVyXCIpO1xuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgSVRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBJbmRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW5kZXhEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVGV4dHVyZURhdGFQb29sXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFQb29sXCIpO1xuaW1wb3J0IFZlcnRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVmVydGV4RGF0YVwiKTtcbmltcG9ydCBTdGFnZU1hbmFnZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcblxuLyoqXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxuICogYnV0IHJlcXVlc3RlZCB0aHJvdWdoIFN0YWdlTWFuYWdlci5cbiAqXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXG4gKlxuICovXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9wcm9ncmFtRGF0YTpBcnJheTxQcm9ncmFtRGF0YT4gPSBuZXcgQXJyYXk8UHJvZ3JhbURhdGE+KCk7XG5cdHByaXZhdGUgX3RleHR1cmVQb29sOlRleHR1cmVEYXRhUG9vbDtcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGFQb29sOlByb2dyYW1EYXRhUG9vbDtcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dEdMO1xuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgX3dpZHRoOm51bWJlcjtcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcblx0cHJpdmF0ZSBfeDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF95Om51bWJlciA9IDA7XG5cblx0Ly9wcml2YXRlIHN0YXRpYyBfZnJhbWVFdmVudERyaXZlcjpTaGFwZSA9IG5ldyBTaGFwZSgpOyAvLyBUT0RPOiBhZGQgZnJhbWUgZHJpdmVyIC8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcblxuXHRwcml2YXRlIF9zdGFnZUluZGV4Om51bWJlciA9IC0xO1xuXG5cdHByaXZhdGUgX3VzZXNTb2Z0d2FyZVJlbmRlcmluZzpib29sZWFuO1xuXHRwcml2YXRlIF9wcm9maWxlOnN0cmluZztcblx0cHJpdmF0ZSBfc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlcjtcblx0cHJpdmF0ZSBfYW50aUFsaWFzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2VuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuO1xuXHRwcml2YXRlIF9jb250ZXh0UmVxdWVzdGVkOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVmVydGV4QnVmZmVycyA6IFZlY3Rvci48VmVydGV4QnVmZmVyPiA9IG5ldyBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4oOCwgdHJ1ZSk7XG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVRleHR1cmVzIDogVmVjdG9yLjxUZXh0dXJlQmFzZT4gPSBuZXcgVmVjdG9yLjxUZXh0dXJlQmFzZT4oOCwgdHJ1ZSk7XG5cdHByaXZhdGUgX3JlbmRlclRhcmdldDpUZXh0dXJlUHJveHlCYXNlID0gbnVsbDtcblx0cHJpdmF0ZSBfcmVuZGVyU3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfY29sb3I6bnVtYmVyO1xuXHRwcml2YXRlIF9iYWNrQnVmZmVyRGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9lbnRlckZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF9leGl0RnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydERpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX2J1ZmZlckNsZWFyOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIF9tb3VzZTNETWFuYWdlcjphd2F5Lm1hbmFnZXJzLk1vdXNlM0RNYW5hZ2VyO1xuXHQvL3ByaXZhdGUgX3RvdWNoM0RNYW5hZ2VyOlRvdWNoM0RNYW5hZ2VyOyAvL1RPRE86IGltZXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXG5cdHByaXZhdGUgX2luaXRpYWxpc2VkOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fdGV4dHVyZVBvb2wgPSBuZXcgVGV4dHVyZURhdGFQb29sKCk7XG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFQb29sID0gbmV3IFByb2dyYW1EYXRhUG9vbCh0aGlzKTtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcblxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xuXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gc3RhZ2VNYW5hZ2VyO1xuXG5cdFx0dGhpcy5fdmlld1BvcnQgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cblx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldFByb2dyYW1EYXRhKHZlcnRleFN0cmluZzpzdHJpbmcsIGZyYWdtZW50U3RyaW5nOnN0cmluZyk6UHJvZ3JhbURhdGFcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9ncmFtRGF0YVBvb2wuZ2V0SXRlbSh2ZXJ0ZXhTdHJpbmcsIGZyYWdtZW50U3RyaW5nKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRSZW5kZXJUYXJnZXQodGFyZ2V0OlRleHR1cmVQcm94eUJhc2UsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gZmFsc2UsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3JlbmRlclRhcmdldCA9PT0gdGFyZ2V0ICYmIHN1cmZhY2VTZWxlY3RvciA9PSB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgJiYgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID09IGVuYWJsZURlcHRoQW5kU3RlbmNpbClcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3JlbmRlclRhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgPSBzdXJmYWNlU2VsZWN0b3I7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHRcdGlmICh0YXJnZXQgaW5zdGFuY2VvZiBSZW5kZXJUZXh0dXJlKSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvVGV4dHVyZSh0aGlzLmdldFJlbmRlclRleHR1cmUoPFJlbmRlclRleHR1cmU+IHRhcmdldCksIGVuYWJsZURlcHRoQW5kU3RlbmNpbCwgdGhpcy5fYW50aUFsaWFzLCBzdXJmYWNlU2VsZWN0b3IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvQmFja0J1ZmZlcigpO1xuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZ2V0UmVuZGVyVGV4dHVyZSh0ZXh0dXJlUHJveHk6UmVuZGVyVGV4dHVyZSk6SVRleHR1cmVCYXNlXG5cdHtcblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSB0aGlzLl90ZXh0dXJlUG9vbC5nZXRJdGVtKHRleHR1cmVQcm94eSk7XG5cblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpXG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVUZXh0dXJlKHRleHR1cmVQcm94eS53aWR0aCwgdGV4dHVyZVByb3h5LmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKTtcblxuXHRcdHJldHVybiB0ZXh0dXJlRGF0YS50ZXh0dXJlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFzc2lnbnMgYW4gYXR0cmlidXRlIHN0cmVhbVxuXHQgKlxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGF0dHJpYnV0ZSBzdHJlYW0gaW5kZXggZm9yIHRoZSB2ZXJ0ZXggc2hhZGVyXG5cdCAqIEBwYXJhbSBidWZmZXJcblx0ICogQHBhcmFtIG9mZnNldFxuXHQgKiBAcGFyYW0gc3RyaWRlXG5cdCAqIEBwYXJhbSBmb3JtYXRcblx0ICovXG5cdHB1YmxpYyBhY3RpdmF0ZUJ1ZmZlcihpbmRleDpudW1iZXIsIGJ1ZmZlcjpWZXJ0ZXhEYXRhLCBvZmZzZXQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nKVxuXHR7XG5cdFx0aWYgKCFidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0pXG5cdFx0XHRidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0O1xuXG5cdFx0aWYgKCFidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVZlcnRleEJ1ZmZlcihidWZmZXIuZGF0YS5sZW5ndGgvYnVmZmVyLmRhdGFQZXJWZXJ0ZXgsIGJ1ZmZlci5kYXRhUGVyVmVydGV4KTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoL2J1ZmZlci5kYXRhUGVyVmVydGV4KTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRWZXJ0ZXhCdWZmZXJBdChpbmRleCwgYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0sIG9mZnNldCwgZm9ybWF0KTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlVmVydGV4RGF0YShidWZmZXI6VmVydGV4RGF0YSlcblx0e1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGVSZW5kZXJUZXh0dXJlKGluZGV4Om51bWJlciwgdGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGhpcy5nZXRSZW5kZXJUZXh0dXJlKHRleHR1cmVQcm94eSkpO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpUZXh0dXJlMkRCYXNlKVxuXHR7XG5cdFx0dmFyIHRleHR1cmVEYXRhOlRleHR1cmVEYXRhID0gPFRleHR1cmVEYXRhPiB0aGlzLl90ZXh0dXJlUG9vbC5nZXRJdGVtKHRleHR1cmVQcm94eSk7XG5cblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpIHtcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcblx0XHRcdHRleHR1cmVEYXRhLmludmFsaWQgPSBmYWxzZTtcblx0XHRcdGlmICh0ZXh0dXJlUHJveHkuZ2VuZXJhdGVNaXBtYXBzKSB7XG5cdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcERhdGE+ID0gdGV4dHVyZVByb3h5Ll9pR2V0TWlwbWFwRGF0YSgpO1xuXHRcdFx0XHR2YXIgbGVuOm51bWJlciA9IG1pcG1hcERhdGEubGVuZ3RoO1xuXHRcdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdFx0XHQoPElUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2ldLCBpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCg8SVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKHRleHR1cmVQcm94eS5faUdldFRleHR1cmVEYXRhKCksIDApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VGV4dHVyZUF0KGluZGV4LCB0ZXh0dXJlRGF0YS50ZXh0dXJlKTtcblx0fVxuXG5cdHB1YmxpYyBhY3RpdmF0ZUN1YmVUZXh0dXJlKGluZGV4Om51bWJlciwgdGV4dHVyZVByb3h5OkN1YmVUZXh0dXJlQmFzZSlcblx0e1xuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHkpO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVDdWJlVGV4dHVyZSh0ZXh0dXJlUHJveHkuc2l6ZSwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCBmYWxzZSk7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgNjsgKytpKSB7XG5cdFx0XHRcdGlmICh0ZXh0dXJlUHJveHkuZ2VuZXJhdGVNaXBtYXBzKSB7XG5cdFx0XHRcdFx0dmFyIG1pcG1hcERhdGE6QXJyYXk8Qml0bWFwRGF0YT4gPSB0ZXh0dXJlUHJveHkuX2lHZXRNaXBtYXBEYXRhKGkpO1xuXHRcdFx0XHRcdHZhciBsZW46bnVtYmVyID0gbWlwbWFwRGF0YS5sZW5ndGg7XG5cdFx0XHRcdFx0Zm9yICh2YXIgajpudW1iZXIgPSAwOyBqIDwgbGVuOyBqKyspXG5cdFx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEobWlwbWFwRGF0YVtqXSwgaSwgaik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0KDxJQ3ViZVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKHRleHR1cmVQcm94eS5faUdldFRleHR1cmVEYXRhKGkpLCBpLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VGV4dHVyZUF0KGluZGV4LCB0ZXh0dXJlRGF0YS50ZXh0dXJlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIFZlcnRleEJ1ZmZlciBvYmplY3QgdGhhdCBjb250YWlucyB0cmlhbmdsZSBpbmRpY2VzLlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgQ29udGV4dFdlYiBmb3Igd2hpY2ggd2UgcmVxdWVzdCB0aGUgYnVmZmVyXG5cdCAqIEByZXR1cm4gVGhlIFZlcnRleEJ1ZmZlciBvYmplY3QgdGhhdCBjb250YWlucyB0cmlhbmdsZSBpbmRpY2VzLlxuXHQgKi9cblx0cHVibGljIGdldEluZGV4QnVmZmVyKGJ1ZmZlcjpJbmRleERhdGEpOklJbmRleEJ1ZmZlclxuXHR7XG5cdFx0aWYgKCFidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0pXG5cdFx0XHRidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0O1xuXG5cdFx0aWYgKCFidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0LmNyZWF0ZUluZGV4QnVmZmVyKGJ1ZmZlci5kYXRhLmxlbmd0aCk7XG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS51cGxvYWRGcm9tQXJyYXkoYnVmZmVyLmRhdGEsIDAsIGJ1ZmZlci5kYXRhLmxlbmd0aCk7XG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiBidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlSW5kZXhEYXRhKGJ1ZmZlcjpJbmRleERhdGEpXG5cdHtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS5kaXNwb3NlKCk7XG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgQ29udGV4dCBvYmplY3QgdG8gYXR0YWNoIHRvIHRoZSBtYW5hZ2VkIGdsIGNhbnZhcy5cblx0ICovXG5cdHB1YmxpYyByZXF1ZXN0Q29udGV4dChmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIsIG1vZGU6c3RyaW5nID0gXCJhdXRvXCIpXG5cdHtcblx0XHQvLyBJZiBmb3JjaW5nIHNvZnR3YXJlLCB3ZSBjYW4gYmUgY2VydGFpbiB0aGF0IHRoZVxuXHRcdC8vIHJldHVybmVkIENvbnRleHQgd2lsbCBiZSBydW5uaW5nIHNvZnR3YXJlIG1vZGUuXG5cdFx0Ly8gSWYgbm90LCB3ZSBjYW4ndCBiZSBzdXJlIGFuZCBzaG91bGQgc3RpY2sgdG8gdGhlXG5cdFx0Ly8gb2xkIHZhbHVlICh3aWxsIGxpa2VseSBiZSBzYW1lIGlmIHJlLXJlcXVlc3RpbmcuKVxuXG5cdFx0aWYgKHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyAhPSBudWxsKVxuXHRcdFx0dGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nID0gZm9yY2VTb2Z0d2FyZTtcblxuXHRcdHRoaXMuX3Byb2ZpbGUgPSBwcm9maWxlO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChtb2RlID09IENvbnRleHRNb2RlLkZMQVNIKVxuXHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIChjb250ZXh0OklDb250ZXh0R0wpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhpcy5fY29udGV4dCA9IG5ldyBDb250ZXh0V2ViR0woPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIpO1xuXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuQVVUTylcblx0XHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIChjb250ZXh0OklDb250ZXh0R0wpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jYWxsYmFjayh0aGlzLl9jb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2lkdGggb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB3aWR0aCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fd2lkdGg7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHdpZHRoKHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fd2lkdGggPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRXaWR0aCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl93aWR0aCA9IHRoaXMuX3ZpZXdQb3J0LndpZHRoID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhlaWdodCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGhlaWdodCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0cHVibGljIHNldCBoZWlnaHQodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9oZWlnaHQgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRIZWlnaHQodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5faGVpZ2h0ID0gdGhpcy5fdmlld1BvcnQuaGVpZ2h0ID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHggcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB4KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl94O1xuXHR9XG5cblx0cHVibGljIHNldCB4KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFgodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feCA9IHRoaXMuX3ZpZXdQb3J0LnggPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB5IHBvc2l0aW9uIG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgeSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5feTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeSh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3kgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3kgPSB0aGlzLl92aWV3UG9ydC55ID0gdmFsO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgdmlzaWJsZSh2YWw6Ym9vbGVhbilcblx0e1xuXHRcdENTUy5zZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHZpc2libGUoKVxuXHR7XG5cdFx0cmV0dXJuIENTUy5nZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIpO1xuXHR9XG5cblx0cHVibGljIGdldCBjb250YWluZXIoKTpIVE1MRWxlbWVudFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQ29udGV4dCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBzdGFnZSBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbnRleHQoKTpJQ29udGV4dEdMXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGV4dDtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5Vmlld3BvcnRVcGRhdGVkKClcblx0e1xuXHRcdGlmICh0aGlzLl92aWV3cG9ydERpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IHRydWU7XG5cblx0XHQvL2lmICghdGhpcy5oYXNFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHQvL2lmICghX3ZpZXdwb3J0VXBkYXRlZClcblx0XHR0aGlzLl92aWV3cG9ydFVwZGF0ZWQgPSBuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCk7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeUVudGVyRnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9lbnRlckZyYW1lKVxuXHRcdFx0dGhpcy5fZW50ZXJGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FTlRFUl9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZW50ZXJGcmFtZSk7XG5cblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RXhpdEZyYW1lKClcblx0e1xuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVYSVRfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9leGl0RnJhbWUpXG5cdFx0XHR0aGlzLl9leGl0RnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRVhJVF9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZXhpdEZyYW1lKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcHJvZmlsZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Byb2ZpbGU7XG5cdH1cblxuXHQvKipcblx0ICogRGlzcG9zZXMgdGhlIFN0YWdlIG9iamVjdCwgZnJlZWluZyB0aGUgQ29udGV4dCBhdHRhY2hlZCB0byB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlKHRoaXMpO1xuXHRcdHRoaXMuZnJlZUNvbnRleHQoKTtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIgPSBudWxsO1xuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSAtMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmVzIHRoZSBiYWNrIGJ1ZmZlciBhc3NvY2lhdGVkIHdpdGggdGhlIFN0YWdlIG9iamVjdC5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJXaWR0aCBUaGUgd2lkdGggb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVySGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBhbnRpQWxpYXMgVGhlIGFtb3VudCBvZiBhbnRpLWFsaWFzaW5nIHRvIHVzZS5cblx0ICogQHBhcmFtIGVuYWJsZURlcHRoQW5kU3RlbmNpbCBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYmFjayBidWZmZXIgY29udGFpbnMgYSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGg6bnVtYmVyLCBiYWNrQnVmZmVySGVpZ2h0Om51bWJlciwgYW50aUFsaWFzOm51bWJlciwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLndpZHRoID0gYmFja0J1ZmZlcldpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gYmFja0J1ZmZlckhlaWdodDtcblxuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGgsIGJhY2tCdWZmZXJIZWlnaHQsIGFudGlBbGlhcywgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0fVxuXG5cdC8qXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIgaXMgdXNlZFxuXHQgKi9cblx0cHVibGljIGdldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHR9XG5cblx0cHVibGljIHNldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyVGFyZ2V0KCk6VGV4dHVyZVByb3h5QmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclRhcmdldDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyU3VyZmFjZVNlbGVjdG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yO1xuXHR9XG5cblx0Lypcblx0ICogQ2xlYXIgYW5kIHJlc2V0IHRoZSBiYWNrIGJ1ZmZlciB3aGVuIHVzaW5nIGEgc2hhcmVkIGNvbnRleHRcblx0ICovXG5cdHB1YmxpYyBjbGVhcigpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodGhpcy5fYmFja0J1ZmZlckRpcnR5KSB7XG5cdFx0XHR0aGlzLmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHRcdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5jbGVhcigoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAwMCApID4+PiAyNCwgLy8gPC0tLS0tLS0tLSBaZXJvLWZpbGwgcmlnaHQgc2hpZnRcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAgKSA+Pj4gMTYsIC8vIDwtLS0tLS0tLS0tLS0tfFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAgKSA+Pj4gOCwgLy8gPC0tLS0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fY29sb3IgJiAweGZmKTtcblxuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgb2JqZWN0IHdpdGggYW4gRXZlbnREaXNwYXRjaGVyIG9iamVjdCBzbyB0aGF0IHRoZSBsaXN0ZW5lciByZWNlaXZlcyBub3RpZmljYXRpb24gb2YgYW4gZXZlbnQuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgaW50byBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIFlvdSBjYW4gcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIG9uIGFsbCBub2RlcyBpbiB0aGUgZGlzcGxheSBsaXN0IGZvciBhIHNwZWNpZmljIHR5cGUgb2YgZXZlbnQsIHBoYXNlLCBhbmQgcHJpb3JpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIHRoZSBldmVudC5cblx0ICogQHBhcmFtIHVzZUNhcHR1cmUgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3b3JrcyBpbiB0aGUgY2FwdHVyZSBwaGFzZSBvciB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMuIElmIHVzZUNhcHR1cmUgaXMgc2V0IHRvIHRydWUsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCBub3QgaW4gdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gSWYgdXNlQ2FwdHVyZSBpcyBmYWxzZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gVG8gbGlzdGVuIGZvciB0aGUgZXZlbnQgaW4gYWxsIHRocmVlIHBoYXNlcywgY2FsbCBhZGRFdmVudExpc3RlbmVyIHR3aWNlLCBvbmNlIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gdHJ1ZSwgdGhlbiBhZ2FpbiB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIGZhbHNlLlxuXHQgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gVGhlIHByaW9yaXR5IGlzIGRlc2lnbmF0ZWQgYnkgYSBzaWduZWQgMzItYml0IGludGVnZXIuIFRoZSBoaWdoZXIgdGhlIG51bWJlciwgdGhlIGhpZ2hlciB0aGUgcHJpb3JpdHkuIEFsbCBsaXN0ZW5lcnMgd2l0aCBwcmlvcml0eSBuIGFyZSBwcm9jZXNzZWQgYmVmb3JlIGxpc3RlbmVycyBvZiBwcmlvcml0eSBuLTEuIElmIHR3byBvciBtb3JlIGxpc3RlbmVycyBzaGFyZSB0aGUgc2FtZSBwcmlvcml0eSwgdGhleSBhcmUgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQuIFRoZSBkZWZhdWx0IHByaW9yaXR5IGlzIDAuXG5cdCAqIEBwYXJhbSB1c2VXZWFrUmVmZXJlbmNlIERldGVybWluZXMgd2hldGhlciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0ZW5lciBpcyBzdHJvbmcgb3Igd2Vhay4gQSBzdHJvbmcgcmVmZXJlbmNlICh0aGUgZGVmYXVsdCkgcHJldmVudHMgeW91ciBsaXN0ZW5lciBmcm9tIGJlaW5nIGdhcmJhZ2UtY29sbGVjdGVkLiBBIHdlYWsgcmVmZXJlbmNlIGRvZXMgbm90LlxuXHQgKi9cblx0cHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxuXHR7XG5cdFx0c3VwZXIuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdhZGRFdmVudExpc3RlbmVyJyAsICAnRW50ZXJGcmFtZSwgRXhpdEZyYW1lJyk7XG5cblx0XHQvL2lmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICl7Ly8mJiAhIHRoaXMuX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0Ly9fZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXHRcdC8vfVxuXG5cdFx0LyogT3JpZ2luYWwgY29kZVxuXHRcdCBpZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSAmJiAhIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcblxuXHRcdCBfZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBvdXQgb2YgYXV0b21hdGljIHJlbmRlciBtb2RlLlxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaGluZyBsaXN0ZW5lciByZWdpc3RlcmVkIHdpdGggdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QsIGEgY2FsbCB0byB0aGlzIG1ldGhvZCBoYXMgbm8gZWZmZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBvYmplY3QgdG8gcmVtb3ZlLlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBTcGVjaWZpZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciBib3RoIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMsIHR3byBjYWxscyB0byByZW1vdmVFdmVudExpc3RlbmVyKCkgYXJlIHJlcXVpcmVkIHRvIHJlbW92ZSBib3RoLCBvbmUgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gdHJ1ZSwgYW5kIGFub3RoZXIgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gZmFsc2UuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8qXG5cdFx0IC8vIFJlbW92ZSB0aGUgbWFpbiByZW5kZXJpbmcgbGlzdGVuZXIgaWYgbm8gRW50ZXJGcmFtZSBsaXN0ZW5lcnMgcmVtYWluXG5cdFx0IGlmICggICAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMgKVxuXHRcdCAmJiAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcykgKSAvLyYmIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdCB7XG5cblx0XHQgLy9fZnJhbWVFdmVudERyaXZlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCB0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyApO1xuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdHB1YmxpYyBnZXQgc2Npc3NvclJlY3QoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY2lzc29yUmVjdDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgc2Npc3NvclJlY3QodmFsdWU6UmVjdGFuZ2xlKVxuXHR7XG5cdFx0dGhpcy5fc2Npc3NvclJlY3QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0U2Npc3NvclJlY3RhbmdsZSh0aGlzLl9zY2lzc29yUmVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGluZGV4IG9mIHRoZSBTdGFnZSB3aGljaCBpcyBtYW5hZ2VkIGJ5IHRoaXMgaW5zdGFuY2Ugb2YgU3RhZ2VQcm94eS5cblx0ICovXG5cdHB1YmxpYyBnZXQgc3RhZ2VJbmRleCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlSW5kZXg7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIFN0YWdlIG1hbmFnZWQgYnkgdGhpcyBwcm94eSBpcyBydW5uaW5nIGluIHNvZnR3YXJlIG1vZGUuXG5cdCAqIFJlbWVtYmVyIHRvIHdhaXQgZm9yIHRoZSBDT05URVhUX0NSRUFURUQgZXZlbnQgYmVmb3JlIGNoZWNraW5nIHRoaXMgcHJvcGVydHksXG5cdCAqIGFzIG9ubHkgdGhlbiB3aWxsIGl0IGJlIGd1YXJhbnRlZWQgdG8gYmUgYWNjdXJhdGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVzZXNTb2Z0d2FyZVJlbmRlcmluZygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmc7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFudGlBbGlhc2luZyBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFudGlBbGlhcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FudGlBbGlhcztcblx0fVxuXG5cdHB1YmxpYyBzZXQgYW50aUFsaWFzKGFudGlBbGlhczpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHZpZXdQb3J0IHJlY3RhbmdsZSBlcXVpdmFsZW50IG9mIHRoZSBTdGFnZSBzaXplIGFuZCBwb3NpdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgdmlld1BvcnQoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSBmYWxzZTtcblxuXHRcdHJldHVybiB0aGlzLl92aWV3UG9ydDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGNvbG9yKGNvbG9yOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2NvbG9yID0gY29sb3I7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZyZXNobHkgY2xlYXJlZCBzdGF0ZSBvZiB0aGUgYmFja2J1ZmZlciBiZWZvcmUgYW55IHJlbmRlcmluZ1xuXHQgKi9cblx0cHVibGljIGdldCBidWZmZXJDbGVhcigpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9idWZmZXJDbGVhcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYnVmZmVyQ2xlYXIobmV3QnVmZmVyQ2xlYXI6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gbmV3QnVmZmVyQ2xlYXI7XG5cdH1cblxuXG5cdHB1YmxpYyByZWdpc3RlclByb2dyYW0ocHJvZ3JhbURhdGE6UHJvZ3JhbURhdGEpXG5cdHtcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xuXHRcdHdoaWxlICh0aGlzLl9wcm9ncmFtRGF0YVtpXSAhPSBudWxsKVxuXHRcdFx0aSsrO1xuXG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFbaV0gPSBwcm9ncmFtRGF0YTtcblx0XHRwcm9ncmFtRGF0YS5pZCA9IGk7XG5cdH1cblxuXHRwdWJsaWMgdW5SZWdpc3RlclByb2dyYW0ocHJvZ3JhbURhdGE6UHJvZ3JhbURhdGEpXG5cdHtcblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtwcm9ncmFtRGF0YS5pZF0gPSBudWxsO1xuXHRcdHByb2dyYW1EYXRhLmlkID0gLTE7XG5cdH1cblxuXHQvKlxuXHQgKiBBY2Nlc3MgdG8gZmlyZSBtb3VzZWV2ZW50cyBhY3Jvc3MgbXVsdGlwbGUgbGF5ZXJlZCB2aWV3M0QgaW5zdGFuY2VzXG5cdCAqL1xuXHQvL1x0XHRwdWJsaWMgZ2V0IG1vdXNlM0RNYW5hZ2VyKCk6TW91c2UzRE1hbmFnZXJcblx0Ly9cdFx0e1xuXHQvL1x0XHRcdHJldHVybiB0aGlzLl9tb3VzZTNETWFuYWdlcjtcblx0Ly9cdFx0fVxuXHQvL1xuXHQvL1x0XHRwdWJsaWMgc2V0IG1vdXNlM0RNYW5hZ2VyKHZhbHVlOk1vdXNlM0RNYW5hZ2VyKVxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0dGhpcy5fbW91c2UzRE1hbmFnZXIgPSB2YWx1ZTtcblx0Ly9cdFx0fVxuXG5cdC8qIFRPRE86IGltcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cdCBwdWJsaWMgZ2V0IHRvdWNoM0RNYW5hZ2VyKCk6VG91Y2gzRE1hbmFnZXJcblx0IHtcblx0IHJldHVybiBfdG91Y2gzRE1hbmFnZXI7XG5cdCB9XG5cblx0IHB1YmxpYyBzZXQgdG91Y2gzRE1hbmFnZXIodmFsdWU6VG91Y2gzRE1hbmFnZXIpXG5cdCB7XG5cdCBfdG91Y2gzRE1hbmFnZXIgPSB2YWx1ZTtcblx0IH1cblx0ICovXG5cblx0LyoqXG5cdCAqIEZyZWVzIHRoZSBDb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGlzIFN0YWdlUHJveHkuXG5cdCAqL1xuXHRwcml2YXRlIGZyZWVDb250ZXh0KClcblx0e1xuXHRcdGlmICh0aGlzLl9jb250ZXh0KSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LmRpc3Bvc2UoKTtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQgPSBudWxsO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgRW50ZXJfRnJhbWUgaGFuZGxlciBmb3IgcHJvY2Vzc2luZyB0aGUgcHJveHkuRU5URVJfRlJBTUUgYW5kIHByb3h5LkVYSVRfRlJBTUUgZXZlbnQgaGFuZGxlcnMuXG5cdCAqIFR5cGljYWxseSB0aGUgcHJveHkuRU5URVJfRlJBTUUgbGlzdGVuZXIgd291bGQgcmVuZGVyIHRoZSBsYXllcnMgZm9yIHRoaXMgU3RhZ2UgaW5zdGFuY2UuXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShldmVudDpFdmVudClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIENsZWFyIHRoZSBzdGFnZSBpbnN0YW5jZVxuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHQvL25vdGlmeSB0aGUgZW50ZXJmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUVudGVyRnJhbWUoKTtcblx0XHQvLyBDYWxsIHRoZSBwcmVzZW50KCkgdG8gcmVuZGVyIHRoZSBmcmFtZVxuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQucHJlc2VudCgpO1xuXHRcdC8vbm90aWZ5IHRoZSBleGl0ZnJhbWUgbGlzdGVuZXJzXG5cdFx0dGhpcy5ub3RpZnlFeGl0RnJhbWUoKTtcblx0fVxuXG5cdHB1YmxpYyByZWNvdmVyRnJvbURpc3Bvc2FsKCk6Ym9vbGVhblxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly9hd2F5LkRlYnVnLnRocm93UElSKCAnU3RhZ2VQcm94eScgLCAncmVjb3ZlckZyb21EaXNwb3NhbCcgLCAnJyApO1xuXG5cdFx0Lypcblx0XHQgaWYgKHRoaXMuX2lDb250ZXh0LmRyaXZlckluZm8gPT0gXCJEaXNwb3NlZFwiKVxuXHRcdCB7XG5cdFx0IHRoaXMuX2lDb250ZXh0ID0gbnVsbDtcblx0XHQgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdCByZXR1cm4gZmFsc2U7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRwcml2YXRlIF9jYWxsYmFjayhjb250ZXh0OklDb250ZXh0R0wpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NvbnRleHQuY29udGFpbmVyO1xuXG5cdFx0Ly8gT25seSBjb25maWd1cmUgYmFjayBidWZmZXIgaWYgd2lkdGggYW5kIGhlaWdodCBoYXZlIGJlZW4gc2V0LFxuXHRcdC8vIHdoaWNoIHRoZXkgbWF5IG5vdCBoYXZlIGJlZW4gaWYgVmlldy5yZW5kZXIoKSBoYXMgeWV0IHRvIGJlXG5cdFx0Ly8gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXG5cdFx0aWYgKHRoaXMuX3dpZHRoICYmIHRoaXMuX2hlaWdodClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cblx0XHQvLyBEaXNwYXRjaCB0aGUgYXBwcm9wcmlhdGUgZXZlbnQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY29udGV4dCB3YXNcblx0XHQvLyBjcmVhdGVkIGZvciB0aGUgZmlyc3QgdGltZSBvciByZWNyZWF0ZWQgYWZ0ZXIgYSBkZXZpY2UgbG9zcy5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQodGhpcy5faW5pdGlhbGlzZWQ/IFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQgOiBTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCkpO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlOyJdfQ==