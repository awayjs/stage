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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayIsIlN0YWdlLl9zZXRTYW1wbGVyU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDakUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFDNUQsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRzVFLElBQU8sR0FBRyxXQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXhELElBQU8sV0FBVyxXQUFlLHdDQUF3QyxDQUFDLENBQUM7QUFDM0UsSUFBTyxVQUFVLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUV4RSxJQUFPLHNCQUFzQixXQUFZLGdEQUFnRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxrQkFBa0IsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3BGLElBQU8sc0JBQXNCLFdBQVksZ0RBQWdELENBQUMsQ0FBQztBQUMzRixJQUFPLGlCQUFpQixXQUFhLDJDQUEyQyxDQUFDLENBQUM7QUFDbEYsSUFBTyxjQUFjLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUM3RSxJQUFPLFlBQVksV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBUTFFLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFFL0UsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUkvRSxBQVFBOzs7Ozs7O0dBREc7SUFDRyxLQUFLO0lBQVNBLFVBQWRBLEtBQUtBLFVBQXdCQTtJQTBDbENBLFNBMUNLQSxLQUFLQSxDQTBDRUEsU0FBMkJBLEVBQUVBLFVBQWlCQSxFQUFFQSxZQUF5QkEsRUFBRUEsYUFBNkJBLEVBQUVBLE9BQTJCQTtR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QUE2QkEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFNUZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDN0dBLFdBQVdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQzVCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO2dCQUNuQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ1pBLElBQUlBLFVBQVVBLEdBQXFCQSxZQUFZQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDbkVBLElBQUlBLEdBQUdBLEdBQVVBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBO29CQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsRUFBRUE7d0JBQ2xCQSxXQUFXQSxDQUFDQSxPQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFD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c0JBQXNCQSxDQUFDQSxNQUFNQSxHQUFHQSxzQkFBc0JBLENBQUNBLE9BQU9BLENBQUNBO1FBQzNGQSxJQUFJQSxTQUFTQSxHQUFVQSxNQUFNQSxHQUFFQSxrQkFBa0JBLENBQUNBLFNBQVNBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFFekZBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDakVBLENBQUNBO0lBQ0Y3QyxZQUFDQTtBQUFEQSxDQXZ1QkEsQUF1dUJDQSxFQXZ1Qm1CLGVBQWUsRUF1dUJsQztBQUVELEFBQWUsaUJBQU4sS0FBSyxDQUFDIiwiZmlsZSI6ImJhc2UvU3RhZ2UuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YVwiKTtcclxuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9SZWN0YW5nbGVcIik7XHJcbmltcG9ydCBFdmVudFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnRcIik7XHJcbmltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xyXG5pbXBvcnQgQ3ViZVRleHR1cmVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQ3ViZVRleHR1cmVCYXNlXCIpO1xyXG5pbXBvcnQgUmVuZGVyVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1JlbmRlclRleHR1cmVcIik7XHJcbmltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcclxuaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlUHJveHlCYXNlXCIpO1xyXG5pbXBvcnQgQ1NTXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xyXG5cclxuaW1wb3J0IENvbnRleHRNb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0NvbnRleHRNb2RlXCIpO1xyXG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XHJcblxyXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0XCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZpbHRlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRmlsdGVyXCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMV3JhcE1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xXcmFwTW9kZVwiKTtcclxuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0U3RhZ2UzRFwiKTtcclxuaW1wb3J0IENvbnRleHRXZWJHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XHJcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XHJcbmltcG9ydCBJQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUN1YmVUZXh0dXJlXCIpO1xyXG5pbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcclxuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XHJcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xyXG5pbXBvcnQgSW5kZXhEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0luZGV4RGF0YVwiKTtcclxuaW1wb3J0IFRleHR1cmVEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhXCIpO1xyXG5pbXBvcnQgVGV4dHVyZURhdGFQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9UZXh0dXJlRGF0YVBvb2xcIik7XHJcbmltcG9ydCBQcm9ncmFtRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9Qcm9ncmFtRGF0YVwiKTtcclxuaW1wb3J0IFByb2dyYW1EYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFQb29sXCIpO1xyXG5pbXBvcnQgVmVydGV4RGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9WZXJ0ZXhEYXRhXCIpO1xyXG5pbXBvcnQgU3RhZ2VNYW5hZ2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYW5hZ2Vycy9TdGFnZU1hbmFnZXJcIik7XHJcblxyXG4vKipcclxuICogU3RhZ2UgcHJvdmlkZXMgYSBwcm94eSBjbGFzcyB0byBoYW5kbGUgdGhlIGNyZWF0aW9uIGFuZCBhdHRhY2htZW50IG9mIHRoZSBDb250ZXh0XHJcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxyXG4gKiBidXQgcmVxdWVzdGVkIHRocm91Z2ggU3RhZ2VNYW5hZ2VyLlxyXG4gKlxyXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXHJcbiAqXHJcbiAqL1xyXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxyXG57XHJcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGE6QXJyYXk8UHJvZ3JhbURhdGE+ID0gbmV3IEFycmF5PFByb2dyYW1EYXRhPigpO1xyXG5cdHByaXZhdGUgX3RleHR1cmVQb29sOlRleHR1cmVEYXRhUG9vbDtcclxuXHRwcml2YXRlIF9wcm9ncmFtRGF0YVBvb2w6UHJvZ3JhbURhdGFQb29sO1xyXG5cdHByaXZhdGUgX2NvbnRleHQ6SUNvbnRleHRHTDtcclxuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XHJcblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xyXG5cdHByaXZhdGUgX2hlaWdodDpudW1iZXI7XHJcblx0cHJpdmF0ZSBfeDpudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX3k6bnVtYmVyID0gMDtcclxuXHJcblx0Ly9wcml2YXRlIHN0YXRpYyBfZnJhbWVFdmVudERyaXZlcjpTaGFwZSA9IG5ldyBTaGFwZSgpOyAvLyBUT0RPOiBhZGQgZnJhbWUgZHJpdmVyIC8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcclxuXHJcblx0cHJpdmF0ZSBfc3RhZ2VJbmRleDpudW1iZXIgPSAtMTtcclxuXHJcblx0cHJpdmF0ZSBfdXNlc1NvZnR3YXJlUmVuZGVyaW5nOmJvb2xlYW47XHJcblx0cHJpdmF0ZSBfcHJvZmlsZTpzdHJpbmc7XHJcblx0cHJpdmF0ZSBfc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlcjtcclxuXHRwcml2YXRlIF9hbnRpQWxpYXM6bnVtYmVyID0gMDtcclxuXHRwcml2YXRlIF9lbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbjtcclxuXHRwcml2YXRlIF9jb250ZXh0UmVxdWVzdGVkOmJvb2xlYW47XHJcblxyXG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVZlcnRleEJ1ZmZlcnMgOiBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4gPSBuZXcgVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+KDgsIHRydWUpO1xyXG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVRleHR1cmVzIDogVmVjdG9yLjxUZXh0dXJlQmFzZT4gPSBuZXcgVmVjdG9yLjxUZXh0dXJlQmFzZT4oOCwgdHJ1ZSk7XHJcblx0cHJpdmF0ZSBfcmVuZGVyVGFyZ2V0OlRleHR1cmVQcm94eUJhc2UgPSBudWxsO1xyXG5cdHByaXZhdGUgX3JlbmRlclN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcclxuXHRwcml2YXRlIF9jb2xvcjpudW1iZXI7XHJcblx0cHJpdmF0ZSBfYmFja0J1ZmZlckRpcnR5OmJvb2xlYW47XHJcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xyXG5cdHByaXZhdGUgX2VudGVyRnJhbWU6RXZlbnQ7XHJcblx0cHJpdmF0ZSBfZXhpdEZyYW1lOkV2ZW50O1xyXG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xyXG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcclxuXHRwcml2YXRlIF9idWZmZXJDbGVhcjpib29sZWFuO1xyXG5cclxuXHQvL3ByaXZhdGUgX21vdXNlM0RNYW5hZ2VyOmF3YXkubWFuYWdlcnMuTW91c2UzRE1hbmFnZXI7XHJcblx0Ly9wcml2YXRlIF90b3VjaDNETWFuYWdlcjpUb3VjaDNETWFuYWdlcjsgLy9UT0RPOiBpbWVwbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcclxuXHJcblx0cHJpdmF0ZSBfaW5pdGlhbGlzZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXHJcblx0e1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl90ZXh0dXJlUG9vbCA9IG5ldyBUZXh0dXJlRGF0YVBvb2woKTtcclxuXHRcdHRoaXMuX3Byb2dyYW1EYXRhUG9vbCA9IG5ldyBQcm9ncmFtRGF0YVBvb2wodGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cclxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xyXG5cclxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcclxuXHJcblx0XHR0aGlzLl92aWV3UG9ydCA9IG5ldyBSZWN0YW5nbGUoKTtcclxuXHJcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xyXG5cclxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xyXG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XHJcblxyXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXRQcm9ncmFtRGF0YSh2ZXJ0ZXhTdHJpbmc6c3RyaW5nLCBmcmFnbWVudFN0cmluZzpzdHJpbmcpOlByb2dyYW1EYXRhXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3Byb2dyYW1EYXRhUG9vbC5nZXRJdGVtKHZlcnRleFN0cmluZywgZnJhZ21lbnRTdHJpbmcpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldFJlbmRlclRhcmdldCh0YXJnZXQ6VGV4dHVyZVByb3h5QmFzZSwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4gPSBmYWxzZSwgc3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDApXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX3JlbmRlclRhcmdldCA9PT0gdGFyZ2V0ICYmIHN1cmZhY2VTZWxlY3RvciA9PSB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgJiYgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID09IGVuYWJsZURlcHRoQW5kU3RlbmNpbClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHRoaXMuX3JlbmRlclRhcmdldCA9IHRhcmdldDtcclxuXHRcdHRoaXMuX3JlbmRlclN1cmZhY2VTZWxlY3RvciA9IHN1cmZhY2VTZWxlY3RvcjtcclxuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcclxuXHRcdGlmICh0YXJnZXQgaW5zdGFuY2VvZiBSZW5kZXJUZXh0dXJlKSB7XHJcblx0XHRcdHRoaXMuX2NvbnRleHQuc2V0UmVuZGVyVG9UZXh0dXJlKHRoaXMuZ2V0UmVuZGVyVGV4dHVyZSg8UmVuZGVyVGV4dHVyZT4gdGFyZ2V0KSwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsLCB0aGlzLl9hbnRpQWxpYXMsIHN1cmZhY2VTZWxlY3Rvcik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvQmFja0J1ZmZlcigpO1xyXG5cdFx0XHR0aGlzLmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGdldFJlbmRlclRleHR1cmUodGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpOklUZXh0dXJlQmFzZVxyXG5cdHtcclxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5LCBmYWxzZSk7XHJcblxyXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKVxyXG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVUZXh0dXJlKHRleHR1cmVQcm94eS53aWR0aCwgdGV4dHVyZVByb3h5LmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKTtcclxuXHJcblx0XHRyZXR1cm4gdGV4dHVyZURhdGEudGV4dHVyZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFzc2lnbnMgYW4gYXR0cmlidXRlIHN0cmVhbVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGluZGV4IFRoZSBhdHRyaWJ1dGUgc3RyZWFtIGluZGV4IGZvciB0aGUgdmVydGV4IHNoYWRlclxyXG5cdCAqIEBwYXJhbSBidWZmZXJcclxuXHQgKiBAcGFyYW0gb2Zmc2V0XHJcblx0ICogQHBhcmFtIHN0cmlkZVxyXG5cdCAqIEBwYXJhbSBmb3JtYXRcclxuXHQgKi9cclxuXHRwdWJsaWMgYWN0aXZhdGVCdWZmZXIoaW5kZXg6bnVtYmVyLCBidWZmZXI6VmVydGV4RGF0YSwgb2Zmc2V0Om51bWJlciwgZm9ybWF0OnN0cmluZylcclxuXHR7XHJcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcclxuXHRcdFx0YnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dDtcclxuXHJcblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XHJcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dC5jcmVhdGVWZXJ0ZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoL2J1ZmZlci5kYXRhUGVyVmVydGV4LCBidWZmZXIuZGF0YVBlclZlcnRleCk7XHJcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcclxuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0udXBsb2FkRnJvbUFycmF5KGJ1ZmZlci5kYXRhLCAwLCBidWZmZXIuZGF0YS5sZW5ndGgvYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xyXG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VmVydGV4QnVmZmVyQXQoaW5kZXgsIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLCBvZmZzZXQsIGZvcm1hdCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcG9zZVZlcnRleERhdGEoYnVmZmVyOlZlcnRleERhdGEpXHJcblx0e1xyXG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0uZGlzcG9zZSgpO1xyXG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSBudWxsO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFjdGl2YXRlUmVuZGVyVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpSZW5kZXJUZXh0dXJlKVxyXG5cdHtcclxuXHRcdHRoaXMuX3NldFNhbXBsZXJTdGF0ZShpbmRleCwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRoaXMuZ2V0UmVuZGVyVGV4dHVyZSh0ZXh0dXJlUHJveHkpKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhY3RpdmF0ZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6VGV4dHVyZTJEQmFzZSwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcclxuXHR7XHJcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIHJlcGVhdCwgc21vb3RoLCBtaXBtYXApO1xyXG5cclxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIG1pcG1hcCk7XHJcblxyXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XHJcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xyXG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xyXG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gZmFsc2U7XHJcblx0XHRcdGlmIChtaXBtYXApIHtcclxuXHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoKTtcclxuXHRcdFx0XHR2YXIgbGVuOm51bWJlciA9IG1pcG1hcERhdGEubGVuZ3RoO1xyXG5cdFx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKVxyXG5cdFx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEobWlwbWFwRGF0YVtpXSwgaSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoKSwgMCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGV4dHVyZURhdGEudGV4dHVyZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWN0aXZhdGVDdWJlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpDdWJlVGV4dHVyZUJhc2UsIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcclxuXHR7XHJcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIGZhbHNlLCBzbW9vdGgsIG1pcG1hcCk7XHJcblxyXG5cdFx0dmFyIHRleHR1cmVEYXRhOlRleHR1cmVEYXRhID0gPFRleHR1cmVEYXRhPiB0aGlzLl90ZXh0dXJlUG9vbC5nZXRJdGVtKHRleHR1cmVQcm94eSwgbWlwbWFwKTtcclxuXHJcblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpIHtcclxuXHRcdFx0dGV4dHVyZURhdGEudGV4dHVyZSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlQ3ViZVRleHR1cmUodGV4dHVyZVByb3h5LnNpemUsIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQkdSQSwgZmFsc2UpO1xyXG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xyXG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gZmFsc2U7XHJcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IDY7ICsraSkge1xyXG5cdFx0XHRcdGlmIChtaXBtYXApIHtcclxuXHRcdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcERhdGE+ID0gdGV4dHVyZVByb3h5Ll9pR2V0TWlwbWFwRGF0YShpKTtcclxuXHRcdFx0XHRcdHZhciBsZW46bnVtYmVyID0gbWlwbWFwRGF0YS5sZW5ndGg7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBqOm51bWJlciA9IDA7IGogPCBsZW47IGorKylcclxuXHRcdFx0XHRcdFx0KDxJQ3ViZVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbal0sIGksIGopO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoaSksIGksIDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VGV4dHVyZUF0KGluZGV4LCB0ZXh0dXJlRGF0YS50ZXh0dXJlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHJpZXZlcyB0aGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXHJcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIENvbnRleHRXZWIgZm9yIHdoaWNoIHdlIHJlcXVlc3QgdGhlIGJ1ZmZlclxyXG5cdCAqIEByZXR1cm4gVGhlIFZlcnRleEJ1ZmZlciBvYmplY3QgdGhhdCBjb250YWlucyB0cmlhbmdsZSBpbmRpY2VzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRJbmRleEJ1ZmZlcihidWZmZXI6SW5kZXhEYXRhKTpJSW5kZXhCdWZmZXJcclxuXHR7XHJcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcclxuXHRcdFx0YnVmZmVyLmNvbnRleHRzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dDtcclxuXHJcblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XHJcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gdGhpcy5fY29udGV4dC5jcmVhdGVJbmRleEJ1ZmZlcihidWZmZXIuZGF0YS5sZW5ndGgpO1xyXG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdKSB7XHJcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoKTtcclxuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF07XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGlzcG9zZUluZGV4RGF0YShidWZmZXI6SW5kZXhEYXRhKVxyXG5cdHtcclxuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcclxuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gbnVsbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlcXVlc3RzIGEgQ29udGV4dCBvYmplY3QgdG8gYXR0YWNoIHRvIHRoZSBtYW5hZ2VkIGdsIGNhbnZhcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKVxyXG5cdHtcclxuXHRcdC8vIElmIGZvcmNpbmcgc29mdHdhcmUsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXQgdGhlXHJcblx0XHQvLyByZXR1cm5lZCBDb250ZXh0IHdpbGwgYmUgcnVubmluZyBzb2Z0d2FyZSBtb2RlLlxyXG5cdFx0Ly8gSWYgbm90LCB3ZSBjYW4ndCBiZSBzdXJlIGFuZCBzaG91bGQgc3RpY2sgdG8gdGhlXHJcblx0XHQvLyBvbGQgdmFsdWUgKHdpbGwgbGlrZWx5IGJlIHNhbWUgaWYgcmUtcmVxdWVzdGluZy4pXHJcblxyXG5cdFx0aWYgKHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyAhPSBudWxsKVxyXG5cdFx0XHR0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgPSBmb3JjZVNvZnR3YXJlO1xyXG5cclxuXHRcdHRoaXMuX3Byb2ZpbGUgPSBwcm9maWxlO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGlmIChtb2RlID09IENvbnRleHRNb2RlLkZMQVNIKVxyXG5cdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5fY29udGV4dCA9IG5ldyBDb250ZXh0V2ViR0woPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIpO1xyXG5cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5BVVRPKVxyXG5cdFx0XHRcdFx0bmV3IENvbnRleHRTdGFnZTNEKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCAoY29udGV4dDpJQ29udGV4dEdMKSA9PiB0aGlzLl9jYWxsYmFjayhjb250ZXh0KSk7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxyXG5cdFx0XHR0aGlzLl9jYWxsYmFjayh0aGlzLl9jb250ZXh0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXHJcblx0ICovXHJcblx0cHVibGljIGdldCB3aWR0aCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3dpZHRoO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCB3aWR0aCh2YWw6bnVtYmVyKVxyXG5cdHtcclxuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcclxuXHJcblx0XHR0aGlzLl93aWR0aCA9IHRoaXMuX3ZpZXdQb3J0LndpZHRoID0gdmFsO1xyXG5cclxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBoZWlnaHQgb2YgdGhlIGdsIGNhbnZhc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBoZWlnaHQodmFsOm51bWJlcilcclxuXHR7XHJcblx0XHRpZiAodGhpcy5faGVpZ2h0ID09IHZhbClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdENTUy5zZXRFbGVtZW50SGVpZ2h0KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcclxuXHJcblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XHJcblxyXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHggcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgeCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3g7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcclxuXHR7XHJcblx0XHRpZiAodGhpcy5feCA9PSB2YWwpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRDU1Muc2V0RWxlbWVudFgodGhpcy5fY29udGFpbmVyLCB2YWwpO1xyXG5cclxuXHRcdHRoaXMuX3ggPSB0aGlzLl92aWV3UG9ydC54ID0gdmFsO1xyXG5cclxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgeSBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXHJcblx0ICovXHJcblx0cHVibGljIGdldCB5KClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5feTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgeSh2YWw6bnVtYmVyKVxyXG5cdHtcclxuXHRcdGlmICh0aGlzLl95ID09IHZhbClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIHZhbCk7XHJcblxyXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XHJcblxyXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgdmlzaWJsZSh2YWw6Ym9vbGVhbilcclxuXHR7XHJcblx0XHRDU1Muc2V0RWxlbWVudFZpc2liaWxpdHkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCB2aXNpYmxlKClcclxuXHR7XHJcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGNvbnRleHQoKTpJQ29udGV4dEdMXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRleHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX3ZpZXdwb3J0RGlydHkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gdHJ1ZTtcclxuXHJcblx0XHQvL2lmICghdGhpcy5oYXNFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCkpXHJcblx0XHQvL3JldHVybjtcclxuXHJcblx0XHQvL2lmICghX3ZpZXdwb3J0VXBkYXRlZClcclxuXHRcdHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCA9IG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XHJcblxyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG5vdGlmeUVudGVyRnJhbWUoKVxyXG5cdHtcclxuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSlcclxuXHRcdC8vcmV0dXJuO1xyXG5cclxuXHRcdGlmICghdGhpcy5fZW50ZXJGcmFtZSlcclxuXHRcdFx0dGhpcy5fZW50ZXJGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FTlRFUl9GUkFNRSk7XHJcblxyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2VudGVyRnJhbWUpO1xyXG5cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgbm90aWZ5RXhpdEZyYW1lKClcclxuXHR7XHJcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FKSlcclxuXHRcdC8vcmV0dXJuO1xyXG5cclxuXHRcdGlmICghdGhpcy5fZXhpdEZyYW1lKVxyXG5cdFx0XHR0aGlzLl9leGl0RnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRVhJVF9GUkFNRSk7XHJcblxyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX2V4aXRGcmFtZSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IHByb2ZpbGUoKTpzdHJpbmdcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fcHJvZmlsZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERpc3Bvc2VzIHRoZSBTdGFnZSBvYmplY3QsIGZyZWVpbmcgdGhlIENvbnRleHQgYXR0YWNoZWQgdG8gdGhlIFN0YWdlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkaXNwb3NlKClcclxuXHR7XHJcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlKHRoaXMpO1xyXG5cdFx0dGhpcy5mcmVlQ29udGV4dCgpO1xyXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gbnVsbDtcclxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSAtMTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbmZpZ3VyZXMgdGhlIGJhY2sgYnVmZmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU3RhZ2Ugb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVyV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBiYWNrYnVmZmVyLlxyXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVySGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGJhY2tidWZmZXIuXHJcblx0ICogQHBhcmFtIGFudGlBbGlhcyBUaGUgYW1vdW50IG9mIGFudGktYWxpYXNpbmcgdG8gdXNlLlxyXG5cdCAqIEBwYXJhbSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGJhY2sgYnVmZmVyIGNvbnRhaW5zIGEgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aDpudW1iZXIsIGJhY2tCdWZmZXJIZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcclxuXHR7XHJcblx0XHR0aGlzLndpZHRoID0gYmFja0J1ZmZlcldpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBiYWNrQnVmZmVySGVpZ2h0O1xyXG5cclxuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcclxuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcclxuXHJcblx0XHRpZiAodGhpcy5fY29udGV4dClcclxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aCwgYmFja0J1ZmZlckhlaWdodCwgYW50aUFsaWFzLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xyXG5cdH1cclxuXHJcblx0LypcclxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGVwdGggYW5kIHN0ZW5jaWwgYnVmZmVyIGlzIHVzZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbCgpOmJvb2xlYW5cclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xyXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgcmVuZGVyVGFyZ2V0KCk6VGV4dHVyZVByb3h5QmFzZVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJUYXJnZXQ7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IHJlbmRlclN1cmZhY2VTZWxlY3RvcigpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3I7XHJcblx0fVxyXG5cclxuXHQvKlxyXG5cdCAqIENsZWFyIGFuZCByZXNldCB0aGUgYmFjayBidWZmZXIgd2hlbiB1c2luZyBhIHNoYXJlZCBjb250ZXh0XHJcblx0ICovXHJcblx0cHVibGljIGNsZWFyKClcclxuXHR7XHJcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodGhpcy5fYmFja0J1ZmZlckRpcnR5KSB7XHJcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XHJcblx0XHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuY2xlYXIoKCB0aGlzLl9jb2xvciAmIDB4ZmYwMDAwMDAgKSA+Pj4gMjQsIC8vIDwtLS0tLS0tLS0gWmVyby1maWxsIHJpZ2h0IHNoaWZ0XHJcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAgKSA+Pj4gMTYsIC8vIDwtLS0tLS0tLS0tLS0tfFxyXG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMCApID4+PiA4LCAvLyA8LS0tLS0tLS0tLS0tLS0tLXxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2NvbG9yICYgMHhmZik7XHJcblxyXG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIG9iamVjdCB3aXRoIGFuIEV2ZW50RGlzcGF0Y2hlciBvYmplY3Qgc28gdGhhdCB0aGUgbGlzdGVuZXIgcmVjZWl2ZXMgbm90aWZpY2F0aW9uIG9mIGFuIGV2ZW50LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IGludG8gYXV0b21hdGljIHJlbmRlciBtb2RlLlxyXG5cdCAqIFlvdSBjYW4gcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIG9uIGFsbCBub2RlcyBpbiB0aGUgZGlzcGxheSBsaXN0IGZvciBhIHNwZWNpZmljIHR5cGUgb2YgZXZlbnQsIHBoYXNlLCBhbmQgcHJpb3JpdHkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cclxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIHRoZSBldmVudC5cclxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdvcmtzIGluIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdXNlQ2FwdHVyZSBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIGNhcHR1cmUgcGhhc2UgYW5kIG5vdCBpbiB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBJZiB1c2VDYXB0dXJlIGlzIGZhbHNlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBUbyBsaXN0ZW4gZm9yIHRoZSBldmVudCBpbiBhbGwgdGhyZWUgcGhhc2VzLCBjYWxsIGFkZEV2ZW50TGlzdGVuZXIgdHdpY2UsIG9uY2Ugd2l0aCB1c2VDYXB0dXJlIHNldCB0byB0cnVlLCB0aGVuIGFnYWluIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gZmFsc2UuXHJcblx0ICogQHBhcmFtIHByaW9yaXR5IFRoZSBwcmlvcml0eSBsZXZlbCBvZiB0aGUgZXZlbnQgbGlzdGVuZXIuIFRoZSBwcmlvcml0eSBpcyBkZXNpZ25hdGVkIGJ5IGEgc2lnbmVkIDMyLWJpdCBpbnRlZ2VyLiBUaGUgaGlnaGVyIHRoZSBudW1iZXIsIHRoZSBoaWdoZXIgdGhlIHByaW9yaXR5LiBBbGwgbGlzdGVuZXJzIHdpdGggcHJpb3JpdHkgbiBhcmUgcHJvY2Vzc2VkIGJlZm9yZSBsaXN0ZW5lcnMgb2YgcHJpb3JpdHkgbi0xLiBJZiB0d28gb3IgbW9yZSBsaXN0ZW5lcnMgc2hhcmUgdGhlIHNhbWUgcHJpb3JpdHksIHRoZXkgYXJlIHByb2Nlc3NlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkLiBUaGUgZGVmYXVsdCBwcmlvcml0eSBpcyAwLlxyXG5cdCAqIEBwYXJhbSB1c2VXZWFrUmVmZXJlbmNlIERldGVybWluZXMgd2hldGhlciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0ZW5lciBpcyBzdHJvbmcgb3Igd2Vhay4gQSBzdHJvbmcgcmVmZXJlbmNlICh0aGUgZGVmYXVsdCkgcHJldmVudHMgeW91ciBsaXN0ZW5lciBmcm9tIGJlaW5nIGdhcmJhZ2UtY29sbGVjdGVkLiBBIHdlYWsgcmVmZXJlbmNlIGRvZXMgbm90LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcclxuXHR7XHJcblx0XHRzdXBlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcclxuXHJcblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdhZGRFdmVudExpc3RlbmVyJyAsICAnRW50ZXJGcmFtZSwgRXhpdEZyYW1lJyk7XHJcblxyXG5cdFx0Ly9pZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSApey8vJiYgISB0aGlzLl9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcclxuXHJcblx0XHQvL19mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xyXG5cclxuXHRcdC8vfVxyXG5cclxuXHRcdC8qIE9yaWdpbmFsIGNvZGVcclxuXHRcdCBpZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSAmJiAhIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcclxuXHJcblx0XHQgX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XHJcblxyXG5cclxuXHRcdCB9XHJcblx0XHQgKi9cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IG91dCBvZiBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXHJcblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2hpbmcgbGlzdGVuZXIgcmVnaXN0ZXJlZCB3aXRoIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LCBhIGNhbGwgdG8gdGhpcyBtZXRob2QgaGFzIG5vIGVmZmVjdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxyXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgb2JqZWN0IHRvIHJlbW92ZS5cclxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBTcGVjaWZpZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciBib3RoIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMsIHR3byBjYWxscyB0byByZW1vdmVFdmVudExpc3RlbmVyKCkgYXJlIHJlcXVpcmVkIHRvIHJlbW92ZSBib3RoLCBvbmUgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gdHJ1ZSwgYW5kIGFub3RoZXIgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gZmFsc2UuXHJcblx0ICovXHJcblx0cHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxyXG5cdHtcclxuXHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuXHRcdC8qXHJcblx0XHQgLy8gUmVtb3ZlIHRoZSBtYWluIHJlbmRlcmluZyBsaXN0ZW5lciBpZiBubyBFbnRlckZyYW1lIGxpc3RlbmVycyByZW1haW5cclxuXHRcdCBpZiAoICAgICEgdGhpcy5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzIClcclxuXHRcdCAmJiAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcykgKSAvLyYmIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxyXG5cdFx0IHtcclxuXHJcblx0XHQgLy9fZnJhbWVFdmVudERyaXZlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCB0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyApO1xyXG5cclxuXHRcdCB9XHJcblx0XHQgKi9cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgc2Npc3NvclJlY3QoKTpSZWN0YW5nbGVcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fc2Npc3NvclJlY3Q7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IHNjaXNzb3JSZWN0KHZhbHVlOlJlY3RhbmdsZSlcclxuXHR7XHJcblx0XHR0aGlzLl9zY2lzc29yUmVjdCA9IHZhbHVlO1xyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuc2V0U2Npc3NvclJlY3RhbmdsZSh0aGlzLl9zY2lzc29yUmVjdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgaW5kZXggb2YgdGhlIFN0YWdlIHdoaWNoIGlzIG1hbmFnZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBTdGFnZVByb3h5LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgc3RhZ2VJbmRleCgpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9zdGFnZUluZGV4O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIFN0YWdlIG1hbmFnZWQgYnkgdGhpcyBwcm94eSBpcyBydW5uaW5nIGluIHNvZnR3YXJlIG1vZGUuXHJcblx0ICogUmVtZW1iZXIgdG8gd2FpdCBmb3IgdGhlIENPTlRFWFRfQ1JFQVRFRCBldmVudCBiZWZvcmUgY2hlY2tpbmcgdGhpcyBwcm9wZXJ0eSxcclxuXHQgKiBhcyBvbmx5IHRoZW4gd2lsbCBpdCBiZSBndWFyYW50ZWVkIHRvIGJlIGFjY3VyYXRlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgdXNlc1NvZnR3YXJlUmVuZGVyaW5nKCk6Ym9vbGVhblxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgYW50aUFsaWFzaW5nIG9mIHRoZSBTdGFnZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGFudGlBbGlhcygpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9hbnRpQWxpYXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IGFudGlBbGlhcyhhbnRpQWxpYXM6bnVtYmVyKVxyXG5cdHtcclxuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcclxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBIHZpZXdQb3J0IHJlY3RhbmdsZSBlcXVpdmFsZW50IG9mIHRoZSBTdGFnZSBzaXplIGFuZCBwb3NpdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0KCk6UmVjdGFuZ2xlXHJcblx0e1xyXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl92aWV3UG9ydDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBTdGFnZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGNvbG9yKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NvbG9yO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBjb2xvcihjb2xvcjpudW1iZXIpXHJcblx0e1xyXG5cdFx0dGhpcy5fY29sb3IgPSBjb2xvcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBmcmVzaGx5IGNsZWFyZWQgc3RhdGUgb2YgdGhlIGJhY2tidWZmZXIgYmVmb3JlIGFueSByZW5kZXJpbmdcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGJ1ZmZlckNsZWFyKCk6Ym9vbGVhblxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9idWZmZXJDbGVhcjtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgYnVmZmVyQ2xlYXIobmV3QnVmZmVyQ2xlYXI6Ym9vbGVhbilcclxuXHR7XHJcblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IG5ld0J1ZmZlckNsZWFyO1xyXG5cdH1cclxuXHJcblxyXG5cdHB1YmxpYyByZWdpc3RlclByb2dyYW0ocHJvZ3JhbURhdGE6UHJvZ3JhbURhdGEpXHJcblx0e1xyXG5cdFx0dmFyIGk6bnVtYmVyID0gMDtcclxuXHRcdHdoaWxlICh0aGlzLl9wcm9ncmFtRGF0YVtpXSAhPSBudWxsKVxyXG5cdFx0XHRpKys7XHJcblxyXG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFbaV0gPSBwcm9ncmFtRGF0YTtcclxuXHRcdHByb2dyYW1EYXRhLmlkID0gaTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1blJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcclxuXHR7XHJcblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtwcm9ncmFtRGF0YS5pZF0gPSBudWxsO1xyXG5cdFx0cHJvZ3JhbURhdGEuaWQgPSAtMTtcclxuXHR9XHJcblxyXG5cdC8qXHJcblx0ICogQWNjZXNzIHRvIGZpcmUgbW91c2VldmVudHMgYWNyb3NzIG11bHRpcGxlIGxheWVyZWQgdmlldzNEIGluc3RhbmNlc1xyXG5cdCAqL1xyXG5cdC8vXHRcdHB1YmxpYyBnZXQgbW91c2UzRE1hbmFnZXIoKTpNb3VzZTNETWFuYWdlclxyXG5cdC8vXHRcdHtcclxuXHQvL1x0XHRcdHJldHVybiB0aGlzLl9tb3VzZTNETWFuYWdlcjtcclxuXHQvL1x0XHR9XHJcblx0Ly9cclxuXHQvL1x0XHRwdWJsaWMgc2V0IG1vdXNlM0RNYW5hZ2VyKHZhbHVlOk1vdXNlM0RNYW5hZ2VyKVxyXG5cdC8vXHRcdHtcclxuXHQvL1x0XHRcdHRoaXMuX21vdXNlM0RNYW5hZ2VyID0gdmFsdWU7XHJcblx0Ly9cdFx0fVxyXG5cclxuXHQvKiBUT0RPOiBpbXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxyXG5cdCBwdWJsaWMgZ2V0IHRvdWNoM0RNYW5hZ2VyKCk6VG91Y2gzRE1hbmFnZXJcclxuXHQge1xyXG5cdCByZXR1cm4gX3RvdWNoM0RNYW5hZ2VyO1xyXG5cdCB9XHJcblxyXG5cdCBwdWJsaWMgc2V0IHRvdWNoM0RNYW5hZ2VyKHZhbHVlOlRvdWNoM0RNYW5hZ2VyKVxyXG5cdCB7XHJcblx0IF90b3VjaDNETWFuYWdlciA9IHZhbHVlO1xyXG5cdCB9XHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqIEZyZWVzIHRoZSBDb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGlzIFN0YWdlUHJveHkuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBmcmVlQ29udGV4dCgpXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpIHtcclxuXHRcdFx0dGhpcy5fY29udGV4dC5kaXNwb3NlKCk7XHJcblxyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XHJcblxyXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBFbnRlcl9GcmFtZSBoYW5kbGVyIGZvciBwcm9jZXNzaW5nIHRoZSBwcm94eS5FTlRFUl9GUkFNRSBhbmQgcHJveHkuRVhJVF9GUkFNRSBldmVudCBoYW5kbGVycy5cclxuXHQgKiBUeXBpY2FsbHkgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGxpc3RlbmVyIHdvdWxkIHJlbmRlciB0aGUgbGF5ZXJzIGZvciB0aGlzIFN0YWdlIGluc3RhbmNlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGV2ZW50OkV2ZW50KVxyXG5cdHtcclxuXHRcdGlmICghdGhpcy5fY29udGV4dClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdC8vIENsZWFyIHRoZSBzdGFnZSBpbnN0YW5jZVxyXG5cdFx0dGhpcy5jbGVhcigpO1xyXG5cdFx0Ly9ub3RpZnkgdGhlIGVudGVyZnJhbWUgbGlzdGVuZXJzXHJcblx0XHR0aGlzLm5vdGlmeUVudGVyRnJhbWUoKTtcclxuXHRcdC8vIENhbGwgdGhlIHByZXNlbnQoKSB0byByZW5kZXIgdGhlIGZyYW1lXHJcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXHJcblx0XHRcdHRoaXMuX2NvbnRleHQucHJlc2VudCgpO1xyXG5cdFx0Ly9ub3RpZnkgdGhlIGV4aXRmcmFtZSBsaXN0ZW5lcnNcclxuXHRcdHRoaXMubm90aWZ5RXhpdEZyYW1lKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVjb3ZlckZyb21EaXNwb3NhbCgpOmJvb2xlYW5cclxuXHR7XHJcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdyZWNvdmVyRnJvbURpc3Bvc2FsJyAsICcnICk7XHJcblxyXG5cdFx0LypcclxuXHRcdCBpZiAodGhpcy5faUNvbnRleHQuZHJpdmVySW5mbyA9PSBcIkRpc3Bvc2VkXCIpXHJcblx0XHQge1xyXG5cdFx0IHRoaXMuX2lDb250ZXh0ID0gbnVsbDtcclxuXHRcdCB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XHJcblx0XHQgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdCB9XHJcblx0XHQgKi9cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2NhbGxiYWNrKGNvbnRleHQ6SUNvbnRleHRHTClcclxuXHR7XHJcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcclxuXHJcblx0XHR0aGlzLl9jb250YWluZXIgPSB0aGlzLl9jb250ZXh0LmNvbnRhaW5lcjtcclxuXHJcblx0XHQvLyBPbmx5IGNvbmZpZ3VyZSBiYWNrIGJ1ZmZlciBpZiB3aWR0aCBhbmQgaGVpZ2h0IGhhdmUgYmVlbiBzZXQsXHJcblx0XHQvLyB3aGljaCB0aGV5IG1heSBub3QgaGF2ZSBiZWVuIGlmIFZpZXcucmVuZGVyKCkgaGFzIHlldCB0byBiZVxyXG5cdFx0Ly8gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXHJcblx0XHRpZiAodGhpcy5fd2lkdGggJiYgdGhpcy5faGVpZ2h0KVxyXG5cdFx0XHR0aGlzLl9jb250ZXh0LmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xyXG5cclxuXHRcdC8vIERpc3BhdGNoIHRoZSBhcHByb3ByaWF0ZSBldmVudCBkZXBlbmRpbmcgb24gd2hldGhlciBjb250ZXh0IHdhc1xyXG5cdFx0Ly8gY3JlYXRlZCBmb3IgdGhlIGZpcnN0IHRpbWUgb3IgcmVjcmVhdGVkIGFmdGVyIGEgZGV2aWNlIGxvc3MuXHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQodGhpcy5faW5pdGlhbGlzZWQ/IFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQgOiBTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCkpO1xyXG5cclxuXHRcdHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3NldFNhbXBsZXJTdGF0ZShpbmRleDpudW1iZXIsIHJlcGVhdDpib29sZWFuLCBzbW9vdGg6Ym9vbGVhbiwgbWlwbWFwOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0dmFyIHdyYXA6c3RyaW5nID0gcmVwZWF0PyBDb250ZXh0R0xXcmFwTW9kZS5SRVBFQVQ6Q29udGV4dEdMV3JhcE1vZGUuQ0xBTVA7XHJcblx0XHR2YXIgZmlsdGVyOnN0cmluZyA9IHNtb290aD8gQ29udGV4dEdMVGV4dHVyZUZpbHRlci5MSU5FQVIgOiBDb250ZXh0R0xUZXh0dXJlRmlsdGVyLk5FQVJFU1Q7XHJcblx0XHR2YXIgbWlwZmlsdGVyOnN0cmluZyA9IG1pcG1hcD8gQ29udGV4dEdMTWlwRmlsdGVyLk1JUExJTkVBUiA6IENvbnRleHRHTE1pcEZpbHRlci5NSVBOT05FO1xyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuc2V0U2FtcGxlclN0YXRlQXQoaW5kZXgsIHdyYXAsIGZpbHRlciwgbWlwZmlsdGVyKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCA9IFN0YWdlOyJdfQ==