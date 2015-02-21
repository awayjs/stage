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
var ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
var ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
var ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
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
        var textureData = this._texturePool.getItem(textureProxy, false);
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
        this._setSamplerState(index, false, false, false);
        this._context.setTextureAt(index, this.getRenderTexture(textureProxy));
    };
    Stage.prototype.activateTexture = function (index, textureProxy, repeat, smooth, mipmap) {
        this._setSamplerState(index, repeat, smooth, mipmap);
        var textureData = this._texturePool.getItem(textureProxy, mipmap);
        if (!textureData.texture) {
            textureData.texture = this._context.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);
            textureData.invalid = true;
        }
        if (textureData.invalid) {
            textureData.invalid = false;
            if (mipmap) {
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
    Stage.prototype.activateCubeTexture = function (index, textureProxy, smooth, mipmap) {
        this._setSamplerState(index, false, smooth, mipmap);
        var textureData = this._texturePool.getItem(textureProxy, mipmap);
        if (!textureData.texture) {
            textureData.texture = this._context.createCubeTexture(textureProxy.size, ContextGLTextureFormat.BGRA, false);
            textureData.invalid = true;
        }
        if (textureData.invalid) {
            textureData.invalid = false;
            for (var i = 0; i < 6; ++i) {
                if (mipmap) {
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
    Stage.prototype._setSamplerState = function (index, repeat, smooth, mipmap) {
        var wrap = repeat ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP;
        var filter = smooth ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST;
        var mipfilter = mipmap ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE;
        this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
    };
    return Stage;
})(EventDispatcher);
module.exports = Stage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayIsIlN0YWdlLl9zZXRTYW1wbGVyU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDakUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFDNUQsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRzVFLElBQU8sR0FBRyxXQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXhELElBQU8sV0FBVyxXQUFlLHdDQUF3QyxDQUFDLENBQUM7QUFDM0UsSUFBTyxVQUFVLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUV4RSxJQUFPLHNCQUFzQixXQUFZLGdEQUFnRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxrQkFBa0IsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3BGLElBQU8sc0JBQXNCLFdBQVksZ0RBQWdELENBQUMsQ0FBQztBQUMzRixJQUFPLGlCQUFpQixXQUFhLDJDQUEyQyxDQUFDLENBQUM7QUFDbEYsSUFBTyxjQUFjLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUM3RSxJQUFPLFlBQVksV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBUTFFLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFFL0UsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUkvRSxBQVFBOzs7Ozs7O0dBREc7SUFDRyxLQUFLO0lBQVNBLFVBQWRBLEtBQUtBLFVBQXdCQTtJQTBDbENBLFNBMUNLQSxLQUFLQSxDQTBDRUEsU0FBMkJBLEVBQUVBLFVBQWlCQSxFQUFFQSxZQUF5QkEsRUFBRUEsYUFBNkJBLEVBQUVBLE9BQTJCQTtR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QUE2QkEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFNUZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDN0dBLFdBQVdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQzVCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO2dCQUNuQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ1pBLElBQUlBLFVBQVVBLEdBQXFCQSxZQUFZQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDbkVBLElBQUlBLEdBQUdBLEdBQVVBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBO29CQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsRUFBRUE7d0JBQ2xCQSxXQUFXQSxDQUFDQSxPQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFD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c0JBQXNCQSxDQUFDQSxNQUFNQSxHQUFHQSxzQkFBc0JBLENBQUNBLE9BQU9BLENBQUNBO1FBQzNGQSxJQUFJQSxTQUFTQSxHQUFVQSxNQUFNQSxHQUFFQSxrQkFBa0JBLENBQUNBLFNBQVNBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFFekZBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDakVBLENBQUNBO0lBQ0Y3QyxZQUFDQTtBQUFEQSxDQXZ1QkEsQUF1dUJDQSxFQXZ1Qm1CLGVBQWUsRUF1dUJsQztBQUVELEFBQWUsaUJBQU4sS0FBSyxDQUFDIiwiZmlsZSI6ImJhc2UvU3RhZ2UuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YVwiKTtcbmltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUmVjdGFuZ2xlXCIpO1xuaW1wb3J0IEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcbmltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IEN1YmVUZXh0dXJlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0N1YmVUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBSZW5kZXJUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvUmVuZGVyVGV4dHVyZVwiKTtcbmltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcbmltcG9ydCBUZXh0dXJlUHJveHlCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZVByb3h5QmFzZVwiKTtcbmltcG9ydCBDU1NcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9DU1NcIik7XG5cbmltcG9ydCBDb250ZXh0TW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZGlzcGxheS9Db250ZXh0TW9kZVwiKTtcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcblxuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGb3JtYXRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZvcm1hdFwiKTtcbmltcG9ydCBDb250ZXh0R0xNaXBGaWx0ZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xNaXBGaWx0ZXJcIik7XG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZpbHRlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFdyYXBNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMV3JhcE1vZGVcIik7XG5pbXBvcnQgQ29udGV4dFN0YWdlM0RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNEXCIpO1xuaW1wb3J0IENvbnRleHRXZWJHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XG5pbXBvcnQgSUNvbnRleHRHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dEdMXCIpO1xuaW1wb3J0IElDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcbmltcG9ydCBJVGV4dHVyZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlXCIpO1xuaW1wb3J0IElUZXh0dXJlQmFzZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgSW5kZXhEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0luZGV4RGF0YVwiKTtcbmltcG9ydCBUZXh0dXJlRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9UZXh0dXJlRGF0YVwiKTtcbmltcG9ydCBUZXh0dXJlRGF0YVBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhUG9vbFwiKTtcbmltcG9ydCBQcm9ncmFtRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9Qcm9ncmFtRGF0YVwiKTtcbmltcG9ydCBQcm9ncmFtRGF0YVBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhUG9vbFwiKTtcbmltcG9ydCBWZXJ0ZXhEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1ZlcnRleERhdGFcIik7XG5pbXBvcnQgU3RhZ2VNYW5hZ2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXJcIik7XG5cbi8qKlxuICogU3RhZ2UgcHJvdmlkZXMgYSBwcm94eSBjbGFzcyB0byBoYW5kbGUgdGhlIGNyZWF0aW9uIGFuZCBhdHRhY2htZW50IG9mIHRoZSBDb250ZXh0XG4gKiAoYW5kIGluIHR1cm4gdGhlIGJhY2sgYnVmZmVyKSBpdCB1c2VzLiBTdGFnZSBzaG91bGQgbmV2ZXIgYmUgY3JlYXRlZCBkaXJlY3RseSxcbiAqIGJ1dCByZXF1ZXN0ZWQgdGhyb3VnaCBTdGFnZU1hbmFnZXIuXG4gKlxuICogQHNlZSBhd2F5Lm1hbmFnZXJzLlN0YWdlTWFuYWdlclxuICpcbiAqL1xuY2xhc3MgU3RhZ2UgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXJcbntcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGE6QXJyYXk8UHJvZ3JhbURhdGE+ID0gbmV3IEFycmF5PFByb2dyYW1EYXRhPigpO1xuXHRwcml2YXRlIF90ZXh0dXJlUG9vbDpUZXh0dXJlRGF0YVBvb2w7XG5cdHByaXZhdGUgX3Byb2dyYW1EYXRhUG9vbDpQcm9ncmFtRGF0YVBvb2w7XG5cdHByaXZhdGUgX2NvbnRleHQ6SUNvbnRleHRHTDtcblx0cHJpdmF0ZSBfY29udGFpbmVyOkhUTUxFbGVtZW50O1xuXHRwcml2YXRlIF93aWR0aDpudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDpudW1iZXI7XG5cdHByaXZhdGUgX3g6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfeTpudW1iZXIgPSAwO1xuXG5cdC8vcHJpdmF0ZSBzdGF0aWMgX2ZyYW1lRXZlbnREcml2ZXI6U2hhcGUgPSBuZXcgU2hhcGUoKTsgLy8gVE9ETzogYWRkIGZyYW1lIGRyaXZlciAvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lXG5cblx0cHJpdmF0ZSBfc3RhZ2VJbmRleDpudW1iZXIgPSAtMTtcblxuXHRwcml2YXRlIF91c2VzU29mdHdhcmVSZW5kZXJpbmc6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfcHJvZmlsZTpzdHJpbmc7XG5cdHByaXZhdGUgX3N0YWdlTWFuYWdlcjpTdGFnZU1hbmFnZXI7XG5cdHByaXZhdGUgX2FudGlBbGlhczpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9lbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfY29udGV4dFJlcXVlc3RlZDpib29sZWFuO1xuXG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVZlcnRleEJ1ZmZlcnMgOiBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4gPSBuZXcgVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+KDgsIHRydWUpO1xuXHQvL3ByaXZhdGUgdmFyIF9hY3RpdmVUZXh0dXJlcyA6IFZlY3Rvci48VGV4dHVyZUJhc2U+ID0gbmV3IFZlY3Rvci48VGV4dHVyZUJhc2U+KDgsIHRydWUpO1xuXHRwcml2YXRlIF9yZW5kZXJUYXJnZXQ6VGV4dHVyZVByb3h5QmFzZSA9IG51bGw7XG5cdHByaXZhdGUgX3JlbmRlclN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9zY2lzc29yUmVjdDpSZWN0YW5nbGU7XG5cdHByaXZhdGUgX2NvbG9yOm51bWJlcjtcblx0cHJpdmF0ZSBfYmFja0J1ZmZlckRpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX3ZpZXdQb3J0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfZW50ZXJGcmFtZTpFdmVudDtcblx0cHJpdmF0ZSBfZXhpdEZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydFVwZGF0ZWQ6U3RhZ2VFdmVudDtcblx0cHJpdmF0ZSBfdmlld3BvcnREaXJ0eTpib29sZWFuO1xuXHRwcml2YXRlIF9idWZmZXJDbGVhcjpib29sZWFuO1xuXG5cdC8vcHJpdmF0ZSBfbW91c2UzRE1hbmFnZXI6YXdheS5tYW5hZ2Vycy5Nb3VzZTNETWFuYWdlcjtcblx0Ly9wcml2YXRlIF90b3VjaDNETWFuYWdlcjpUb3VjaDNETWFuYWdlcjsgLy9UT0RPOiBpbWVwbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblxuXHRwcml2YXRlIF9pbml0aWFsaXNlZDpib29sZWFuID0gZmFsc2U7XG5cblx0Y29uc3RydWN0b3IoY29udGFpbmVyOkhUTUxDYW52YXNFbGVtZW50LCBzdGFnZUluZGV4Om51bWJlciwgc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX3RleHR1cmVQb29sID0gbmV3IFRleHR1cmVEYXRhUG9vbCgpO1xuXHRcdHRoaXMuX3Byb2dyYW1EYXRhUG9vbCA9IG5ldyBQcm9ncmFtRGF0YVBvb2wodGhpcyk7XG5cblx0XHR0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG5cblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gc3RhZ2VJbmRleDtcblxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcblxuXHRcdHRoaXMuX3ZpZXdQb3J0ID0gbmV3IFJlY3RhbmdsZSgpO1xuXG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gdHJ1ZTtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIDApO1xuXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXRQcm9ncmFtRGF0YSh2ZXJ0ZXhTdHJpbmc6c3RyaW5nLCBmcmFnbWVudFN0cmluZzpzdHJpbmcpOlByb2dyYW1EYXRhXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZ3JhbURhdGFQb29sLmdldEl0ZW0odmVydGV4U3RyaW5nLCBmcmFnbWVudFN0cmluZyk7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyVGFyZ2V0KHRhcmdldDpUZXh0dXJlUHJveHlCYXNlLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbiA9IGZhbHNlLCBzdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMClcblx0e1xuXHRcdGlmICh0aGlzLl9yZW5kZXJUYXJnZXQgPT09IHRhcmdldCAmJiBzdXJmYWNlU2VsZWN0b3IgPT0gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yICYmIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9PSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9yZW5kZXJUYXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yID0gc3VyZmFjZVNlbGVjdG9yO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHRpZiAodGFyZ2V0IGluc3RhbmNlb2YgUmVuZGVyVGV4dHVyZSkge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb1RleHR1cmUodGhpcy5nZXRSZW5kZXJUZXh0dXJlKDxSZW5kZXJUZXh0dXJlPiB0YXJnZXQpLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwsIHRoaXMuX2FudGlBbGlhcywgc3VyZmFjZVNlbGVjdG9yKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldFJlbmRlclRleHR1cmUodGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpOklUZXh0dXJlQmFzZVxuXHR7XG5cdFx0dmFyIHRleHR1cmVEYXRhOlRleHR1cmVEYXRhID0gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIGZhbHNlKTtcblxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSlcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHRleHR1cmVEYXRhLnRleHR1cmU7XG5cdH1cblxuXHQvKipcblx0ICogQXNzaWducyBhbiBhdHRyaWJ1dGUgc3RyZWFtXG5cdCAqXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgYXR0cmlidXRlIHN0cmVhbSBpbmRleCBmb3IgdGhlIHZlcnRleCBzaGFkZXJcblx0ICogQHBhcmFtIGJ1ZmZlclxuXHQgKiBAcGFyYW0gb2Zmc2V0XG5cdCAqIEBwYXJhbSBzdHJpZGVcblx0ICogQHBhcmFtIGZvcm1hdFxuXHQgKi9cblx0cHVibGljIGFjdGl2YXRlQnVmZmVyKGluZGV4Om51bWJlciwgYnVmZmVyOlZlcnRleERhdGEsIG9mZnNldDpudW1iZXIsIGZvcm1hdDpzdHJpbmcpXG5cdHtcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XG5cblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVmVydGV4QnVmZmVyKGJ1ZmZlci5kYXRhLmxlbmd0aC9idWZmZXIuZGF0YVBlclZlcnRleCwgYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0udXBsb2FkRnJvbUFycmF5KGJ1ZmZlci5kYXRhLCAwLCBidWZmZXIuZGF0YS5sZW5ndGgvYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFZlcnRleEJ1ZmZlckF0KGluZGV4LCBidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSwgb2Zmc2V0LCBmb3JtYXQpO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2VWZXJ0ZXhEYXRhKGJ1ZmZlcjpWZXJ0ZXhEYXRhKVxuXHR7XG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0uZGlzcG9zZSgpO1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBhY3RpdmF0ZVJlbmRlclRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6UmVuZGVyVGV4dHVyZSlcblx0e1xuXHRcdHRoaXMuX3NldFNhbXBsZXJTdGF0ZShpbmRleCwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGhpcy5nZXRSZW5kZXJUZXh0dXJlKHRleHR1cmVQcm94eSkpO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpUZXh0dXJlMkRCYXNlLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fc2V0U2FtcGxlclN0YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIG1pcG1hcCk7XG5cblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpIHtcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcblx0XHRcdHRleHR1cmVEYXRhLmludmFsaWQgPSBmYWxzZTtcblx0XHRcdGlmIChtaXBtYXApIHtcblx0XHRcdFx0dmFyIG1pcG1hcERhdGE6QXJyYXk8Qml0bWFwRGF0YT4gPSB0ZXh0dXJlUHJveHkuX2lHZXRNaXBtYXBEYXRhKCk7XG5cdFx0XHRcdHZhciBsZW46bnVtYmVyID0gbWlwbWFwRGF0YS5sZW5ndGg7XG5cdFx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKVxuXHRcdFx0XHRcdCg8SVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbaV0sIGkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoKSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlQ3ViZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6Q3ViZVRleHR1cmVCYXNlLCBzbW9vdGg6Ym9vbGVhbiwgbWlwbWFwOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIGZhbHNlLCBzbW9vdGgsIG1pcG1hcCk7XG5cblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSA8VGV4dHVyZURhdGE+IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5LCBtaXBtYXApO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVDdWJlVGV4dHVyZSh0ZXh0dXJlUHJveHkuc2l6ZSwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCBmYWxzZSk7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgNjsgKytpKSB7XG5cdFx0XHRcdGlmIChtaXBtYXApIHtcblx0XHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoaSk7XG5cdFx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKHZhciBqOm51bWJlciA9IDA7IGogPCBsZW47IGorKylcblx0XHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2pdLCBpLCBqKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoaSksIGksIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBDb250ZXh0V2ViIGZvciB3aGljaCB3ZSByZXF1ZXN0IHRoZSBidWZmZXJcblx0ICogQHJldHVybiBUaGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0SW5kZXhCdWZmZXIoYnVmZmVyOkluZGV4RGF0YSk6SUluZGV4QnVmZmVyXG5cdHtcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XG5cblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlSW5kZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2VJbmRleERhdGEoYnVmZmVyOkluZGV4RGF0YSlcblx0e1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgYSBDb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIG1hbmFnZWQgZ2wgY2FudmFzLlxuXHQgKi9cblx0cHVibGljIHJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIilcblx0e1xuXHRcdC8vIElmIGZvcmNpbmcgc29mdHdhcmUsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXQgdGhlXG5cdFx0Ly8gcmV0dXJuZWQgQ29udGV4dCB3aWxsIGJlIHJ1bm5pbmcgc29mdHdhcmUgbW9kZS5cblx0XHQvLyBJZiBub3QsIHdlIGNhbid0IGJlIHN1cmUgYW5kIHNob3VsZCBzdGljayB0byB0aGVcblx0XHQvLyBvbGQgdmFsdWUgKHdpbGwgbGlrZWx5IGJlIHNhbWUgaWYgcmUtcmVxdWVzdGluZy4pXG5cblx0XHRpZiAodGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nICE9IG51bGwpXG5cdFx0XHR0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgPSBmb3JjZVNvZnR3YXJlO1xuXG5cdFx0dGhpcy5fcHJvZmlsZSA9IHByb2ZpbGU7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuRkxBU0gpXG5cdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLl9jb250ZXh0ID0gbmV3IENvbnRleHRXZWJHTCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lcik7XG5cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5BVVRPKVxuXHRcdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NhbGxiYWNrKHRoaXMuX2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3dpZHRoID0gdGhpcy5fdmlld1BvcnQud2lkdGggPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl94ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB5KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0cHVibGljIHNldCB2aXNpYmxlKHZhbDpib29sZWFuKVxuXHR7XG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXG5cdHtcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29udGV4dCgpOklDb250ZXh0R0xcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ZpZXdwb3J0RGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gdHJ1ZTtcblxuXHRcdC8vaWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKSlcblx0XHQvL3JldHVybjtcblxuXHRcdC8vaWYgKCFfdmlld3BvcnRVcGRhdGVkKVxuXHRcdHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCA9IG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fdmlld3BvcnRVcGRhdGVkKTtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RW50ZXJGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2VudGVyRnJhbWUpXG5cdFx0XHR0aGlzLl9lbnRlckZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVOVEVSX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9lbnRlckZyYW1lKTtcblxuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFeGl0RnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2V4aXRGcmFtZSlcblx0XHRcdHRoaXMuX2V4aXRGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FWElUX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9leGl0RnJhbWUpO1xuXHR9XG5cblx0cHVibGljIGdldCBwcm9maWxlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZmlsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlcyB0aGUgU3RhZ2Ugb2JqZWN0LCBmcmVlaW5nIHRoZSBDb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlci5pUmVtb3ZlU3RhZ2UodGhpcyk7XG5cdFx0dGhpcy5mcmVlQ29udGV4dCgpO1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IG51bGw7XG5cdFx0dGhpcy5fc3RhZ2VJbmRleCA9IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbmZpZ3VyZXMgdGhlIGJhY2sgYnVmZmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlcldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJIZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGFudGlBbGlhcyBUaGUgYW1vdW50IG9mIGFudGktYWxpYXNpbmcgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBiYWNrIGJ1ZmZlciBjb250YWlucyBhIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlci5cblx0ICovXG5cdHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aDpudW1iZXIsIGJhY2tCdWZmZXJIZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMud2lkdGggPSBiYWNrQnVmZmVyV2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBiYWNrQnVmZmVySGVpZ2h0O1xuXG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aCwgYmFja0J1ZmZlckhlaWdodCwgYW50aUFsaWFzLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHR9XG5cblx0Lypcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlciBpcyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbChlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJUYXJnZXQoKTpUZXh0dXJlUHJveHlCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyVGFyZ2V0O1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJTdXJmYWNlU2VsZWN0b3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3I7XG5cdH1cblxuXHQvKlxuXHQgKiBDbGVhciBhbmQgcmVzZXQgdGhlIGJhY2sgYnVmZmVyIHdoZW4gdXNpbmcgYSBzaGFyZWQgY29udGV4dFxuXHQgKi9cblx0cHVibGljIGNsZWFyKClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9iYWNrQnVmZmVyRGlydHkpIHtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LmNsZWFyKCggdGhpcy5fY29sb3IgJiAweGZmMDAwMDAwICkgPj4+IDI0LCAvLyA8LS0tLS0tLS0tIFplcm8tZmlsbCByaWdodCBzaGlmdFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAwMCApID4+PiAxNiwgLy8gPC0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMCApID4+PiA4LCAvLyA8LS0tLS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9jb2xvciAmIDB4ZmYpO1xuXG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvYmplY3Qgd2l0aCBhbiBFdmVudERpc3BhdGNoZXIgb2JqZWN0IHNvIHRoYXQgdGhlIGxpc3RlbmVyIHJlY2VpdmVzIG5vdGlmaWNhdGlvbiBvZiBhbiBldmVudC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBpbnRvIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogWW91IGNhbiByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgb24gYWxsIG5vZGVzIGluIHRoZSBkaXNwbGF5IGxpc3QgZm9yIGEgc3BlY2lmaWMgdHlwZSBvZiBldmVudCwgcGhhc2UsIGFuZCBwcmlvcml0eS5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgdGhlIGV2ZW50LlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdvcmtzIGluIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdXNlQ2FwdHVyZSBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIGNhcHR1cmUgcGhhc2UgYW5kIG5vdCBpbiB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBJZiB1c2VDYXB0dXJlIGlzIGZhbHNlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBUbyBsaXN0ZW4gZm9yIHRoZSBldmVudCBpbiBhbGwgdGhyZWUgcGhhc2VzLCBjYWxsIGFkZEV2ZW50TGlzdGVuZXIgdHdpY2UsIG9uY2Ugd2l0aCB1c2VDYXB0dXJlIHNldCB0byB0cnVlLCB0aGVuIGFnYWluIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gZmFsc2UuXG5cdCAqIEBwYXJhbSBwcmlvcml0eSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBUaGUgcHJpb3JpdHkgaXMgZGVzaWduYXRlZCBieSBhIHNpZ25lZCAzMi1iaXQgaW50ZWdlci4gVGhlIGhpZ2hlciB0aGUgbnVtYmVyLCB0aGUgaGlnaGVyIHRoZSBwcmlvcml0eS4gQWxsIGxpc3RlbmVycyB3aXRoIHByaW9yaXR5IG4gYXJlIHByb2Nlc3NlZCBiZWZvcmUgbGlzdGVuZXJzIG9mIHByaW9yaXR5IG4tMS4gSWYgdHdvIG9yIG1vcmUgbGlzdGVuZXJzIHNoYXJlIHRoZSBzYW1lIHByaW9yaXR5LCB0aGV5IGFyZSBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC4gVGhlIGRlZmF1bHQgcHJpb3JpdHkgaXMgMC5cblx0ICogQHBhcmFtIHVzZVdlYWtSZWZlcmVuY2UgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGxpc3RlbmVyIGlzIHN0cm9uZyBvciB3ZWFrLiBBIHN0cm9uZyByZWZlcmVuY2UgKHRoZSBkZWZhdWx0KSBwcmV2ZW50cyB5b3VyIGxpc3RlbmVyIGZyb20gYmVpbmcgZ2FyYmFnZS1jb2xsZWN0ZWQuIEEgd2VhayByZWZlcmVuY2UgZG9lcyBub3QuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ2FkZEV2ZW50TGlzdGVuZXInICwgICdFbnRlckZyYW1lLCBFeGl0RnJhbWUnKTtcblxuXHRcdC8vaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgKXsvLyYmICEgdGhpcy5fZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQvL19mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cdFx0Ly99XG5cblx0XHQvKiBPcmlnaW5hbCBjb2RlXG5cdFx0IGlmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICYmICEgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0IF9mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IG91dCBvZiBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIElmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIGxpc3RlbmVyIHJlZ2lzdGVyZWQgd2l0aCB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdCwgYSBjYWxsIHRvIHRoaXMgbWV0aG9kIGhhcyBubyBlZmZlY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIG9iamVjdCB0byByZW1vdmUuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIGJvdGggdGhlIGNhcHR1cmUgcGhhc2UgYW5kIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcywgdHdvIGNhbGxzIHRvIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSBhcmUgcmVxdWlyZWQgdG8gcmVtb3ZlIGJvdGgsIG9uZSBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byB0cnVlLCBhbmQgYW5vdGhlciBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byBmYWxzZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Lypcblx0XHQgLy8gUmVtb3ZlIHRoZSBtYWluIHJlbmRlcmluZyBsaXN0ZW5lciBpZiBubyBFbnRlckZyYW1lIGxpc3RlbmVycyByZW1haW5cblx0XHQgaWYgKCAgICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcyApXG5cdFx0ICYmICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzKSApIC8vJiYgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0IHtcblxuXHRcdCAvL19mcmFtZUV2ZW50RHJpdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIHRoaXMub25FbnRlckZyYW1lLCB0aGlzICk7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NjaXNzb3JSZWN0O1xuXHR9XG5cblx0cHVibGljIHNldCBzY2lzc29yUmVjdCh2YWx1ZTpSZWN0YW5nbGUpXG5cdHtcblx0XHR0aGlzLl9zY2lzc29yUmVjdCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTY2lzc29yUmVjdGFuZ2xlKHRoaXMuX3NjaXNzb3JSZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggb2YgdGhlIFN0YWdlIHdoaWNoIGlzIG1hbmFnZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHVibGljIGdldCBzdGFnZUluZGV4KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgU3RhZ2UgbWFuYWdlZCBieSB0aGlzIHByb3h5IGlzIHJ1bm5pbmcgaW4gc29mdHdhcmUgbW9kZS5cblx0ICogUmVtZW1iZXIgdG8gd2FpdCBmb3IgdGhlIENPTlRFWFRfQ1JFQVRFRCBldmVudCBiZWZvcmUgY2hlY2tpbmcgdGhpcyBwcm9wZXJ0eSxcblx0ICogYXMgb25seSB0aGVuIHdpbGwgaXQgYmUgZ3VhcmFudGVlZCB0byBiZSBhY2N1cmF0ZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgdXNlc1NvZnR3YXJlUmVuZGVyaW5nKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW50aUFsaWFzaW5nIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW50aUFsaWFzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW50aUFsaWFzO1xuXHR9XG5cblx0cHVibGljIHNldCBhbnRpQWxpYXMoYW50aUFsaWFzOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCB2aWV3UG9ydCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3IoY29sb3I6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fY29sb3IgPSBjb2xvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZnJlc2hseSBjbGVhcmVkIHN0YXRlIG9mIHRoZSBiYWNrYnVmZmVyIGJlZm9yZSBhbnkgcmVuZGVyaW5nXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGJ1ZmZlckNsZWFyKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2J1ZmZlckNsZWFyO1xuXHR9XG5cblx0cHVibGljIHNldCBidWZmZXJDbGVhcihuZXdCdWZmZXJDbGVhcjpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSBuZXdCdWZmZXJDbGVhcjtcblx0fVxuXG5cblx0cHVibGljIHJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHZhciBpOm51bWJlciA9IDA7XG5cdFx0d2hpbGUgKHRoaXMuX3Byb2dyYW1EYXRhW2ldICE9IG51bGwpXG5cdFx0XHRpKys7XG5cblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtpXSA9IHByb2dyYW1EYXRhO1xuXHRcdHByb2dyYW1EYXRhLmlkID0gaTtcblx0fVxuXG5cdHB1YmxpYyB1blJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHRoaXMuX3Byb2dyYW1EYXRhW3Byb2dyYW1EYXRhLmlkXSA9IG51bGw7XG5cdFx0cHJvZ3JhbURhdGEuaWQgPSAtMTtcblx0fVxuXG5cdC8qXG5cdCAqIEFjY2VzcyB0byBmaXJlIG1vdXNlZXZlbnRzIGFjcm9zcyBtdWx0aXBsZSBsYXllcmVkIHZpZXczRCBpbnN0YW5jZXNcblx0ICovXG5cdC8vXHRcdHB1YmxpYyBnZXQgbW91c2UzRE1hbmFnZXIoKTpNb3VzZTNETWFuYWdlclxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlM0RNYW5hZ2VyO1xuXHQvL1x0XHR9XG5cdC8vXG5cdC8vXHRcdHB1YmxpYyBzZXQgbW91c2UzRE1hbmFnZXIodmFsdWU6TW91c2UzRE1hbmFnZXIpXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHR0aGlzLl9tb3VzZTNETWFuYWdlciA9IHZhbHVlO1xuXHQvL1x0XHR9XG5cblx0LyogVE9ETzogaW1wbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblx0IHB1YmxpYyBnZXQgdG91Y2gzRE1hbmFnZXIoKTpUb3VjaDNETWFuYWdlclxuXHQge1xuXHQgcmV0dXJuIF90b3VjaDNETWFuYWdlcjtcblx0IH1cblxuXHQgcHVibGljIHNldCB0b3VjaDNETWFuYWdlcih2YWx1ZTpUb3VjaDNETWFuYWdlcilcblx0IHtcblx0IF90b3VjaDNETWFuYWdlciA9IHZhbHVlO1xuXHQgfVxuXHQgKi9cblxuXHQvKipcblx0ICogRnJlZXMgdGhlIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3RhZ2VQcm94eS5cblx0ICovXG5cdHByaXZhdGUgZnJlZUNvbnRleHQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpIHtcblx0XHRcdHRoaXMuX2NvbnRleHQuZGlzcG9zZSgpO1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBFbnRlcl9GcmFtZSBoYW5kbGVyIGZvciBwcm9jZXNzaW5nIHRoZSBwcm94eS5FTlRFUl9GUkFNRSBhbmQgcHJveHkuRVhJVF9GUkFNRSBldmVudCBoYW5kbGVycy5cblx0ICogVHlwaWNhbGx5IHRoZSBwcm94eS5FTlRFUl9GUkFNRSBsaXN0ZW5lciB3b3VsZCByZW5kZXIgdGhlIGxheWVycyBmb3IgdGhpcyBTdGFnZSBpbnN0YW5jZS5cblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWdlIGluc3RhbmNlXG5cdFx0dGhpcy5jbGVhcigpO1xuXHRcdC8vbm90aWZ5IHRoZSBlbnRlcmZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RW50ZXJGcmFtZSgpO1xuXHRcdC8vIENhbGwgdGhlIHByZXNlbnQoKSB0byByZW5kZXIgdGhlIGZyYW1lXG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5wcmVzZW50KCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGV4aXRmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUV4aXRGcmFtZSgpO1xuXHR9XG5cblx0cHVibGljIHJlY292ZXJGcm9tRGlzcG9zYWwoKTpib29sZWFuXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdyZWNvdmVyRnJvbURpc3Bvc2FsJyAsICcnICk7XG5cblx0XHQvKlxuXHRcdCBpZiAodGhpcy5faUNvbnRleHQuZHJpdmVySW5mbyA9PSBcIkRpc3Bvc2VkXCIpXG5cdFx0IHtcblx0XHQgdGhpcy5faUNvbnRleHQgPSBudWxsO1xuXHRcdCB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0IHJldHVybiBmYWxzZTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fVxuXG5cdHByaXZhdGUgX2NhbGxiYWNrKGNvbnRleHQ6SUNvbnRleHRHTClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXG5cdFx0dGhpcy5fY29udGFpbmVyID0gdGhpcy5fY29udGV4dC5jb250YWluZXI7XG5cblx0XHQvLyBPbmx5IGNvbmZpZ3VyZSBiYWNrIGJ1ZmZlciBpZiB3aWR0aCBhbmQgaGVpZ2h0IGhhdmUgYmVlbiBzZXQsXG5cdFx0Ly8gd2hpY2ggdGhleSBtYXkgbm90IGhhdmUgYmVlbiBpZiBWaWV3LnJlbmRlcigpIGhhcyB5ZXQgdG8gYmVcblx0XHQvLyBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZS5cblx0XHRpZiAodGhpcy5fd2lkdGggJiYgdGhpcy5faGVpZ2h0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblxuXHRcdC8vIERpc3BhdGNoIHRoZSBhcHByb3ByaWF0ZSBldmVudCBkZXBlbmRpbmcgb24gd2hldGhlciBjb250ZXh0IHdhc1xuXHRcdC8vIGNyZWF0ZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9yIHJlY3JlYXRlZCBhZnRlciBhIGRldmljZSBsb3NzLlxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudCh0aGlzLl9pbml0aWFsaXNlZD8gU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCA6IFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVEKSk7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cdH1cblxuXHRwcml2YXRlIF9zZXRTYW1wbGVyU3RhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dmFyIHdyYXA6c3RyaW5nID0gcmVwZWF0PyBDb250ZXh0R0xXcmFwTW9kZS5SRVBFQVQ6Q29udGV4dEdMV3JhcE1vZGUuQ0xBTVA7XG5cdFx0dmFyIGZpbHRlcjpzdHJpbmcgPSBzbW9vdGg/IENvbnRleHRHTFRleHR1cmVGaWx0ZXIuTElORUFSIDogQ29udGV4dEdMVGV4dHVyZUZpbHRlci5ORUFSRVNUO1xuXHRcdHZhciBtaXBmaWx0ZXI6c3RyaW5nID0gbWlwbWFwPyBDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTElORUFSIDogQ29udGV4dEdMTWlwRmlsdGVyLk1JUE5PTkU7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFNhbXBsZXJTdGF0ZUF0KGluZGV4LCB3cmFwLCBmaWx0ZXIsIG1pcGZpbHRlcik7XG5cdH1cbn1cblxuZXhwb3J0ID0gU3RhZ2U7Il19