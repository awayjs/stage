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
var ContextMode = require("awayjs-stagegl/lib/base/ContextMode");
var ContextGLTextureFormat = require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
var ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
var ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
var ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
var ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
var ContextWebGL = require("awayjs-stagegl/lib/base/ContextWebGL");
var StageEvent = require("awayjs-stagegl/lib/events/StageEvent");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayIsIlN0YWdlLl9zZXRTYW1wbGVyU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDakUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFDNUQsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRzVFLElBQU8sR0FBRyxXQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXhELElBQU8sV0FBVyxXQUFlLHFDQUFxQyxDQUFDLENBQUM7QUFDeEUsSUFBTyxzQkFBc0IsV0FBWSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8sa0JBQWtCLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUNwRixJQUFPLHNCQUFzQixXQUFZLGdEQUFnRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxpQkFBaUIsV0FBYSwyQ0FBMkMsQ0FBQyxDQUFDO0FBQ2xGLElBQU8sY0FBYyxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDN0UsSUFBTyxZQUFZLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQU0xRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBR3hFLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFFL0UsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUkvRSxBQVFBOzs7Ozs7O0dBREc7SUFDRyxLQUFLO0lBQVNBLFVBQWRBLEtBQUtBLFVBQXdCQTtJQTBDbENBLFNBMUNLQSxLQUFLQSxDQTBDRUEsU0FBMkJBLEVBQUVBLFVBQWlCQSxFQUFFQSxZQUF5QkEsRUFBRUEsYUFBNkJBLEVBQUVBLE9BQTJCQTtR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QUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxFQUFFQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUNuSUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekNBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUMxR0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDMUNBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDMUZBLENBQUNBO0lBRU1MLGlDQUFpQkEsR0FBeEJBLFVBQXlCQSxNQUFpQkE7UUFFekNNLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENB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QkFBc0JBLENBQUNBLE1BQU1BLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDM0ZBLElBQUlBLFNBQVNBLEdBQVVBLE1BQU1BLEdBQUVBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUV6RkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFDRjdDLFlBQUNBO0FBQURBLENBdnVCQSxBQXV1QkNBLEVBdnVCbUIsZUFBZSxFQXV1QmxDO0FBRUQsQUFBZSxpQkFBTixLQUFLLENBQUMiLCJmaWxlIjoiYmFzZS9TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CaXRtYXBEYXRhXCIpO1xyXG5pbXBvcnQgUmVjdGFuZ2xlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcclxuaW1wb3J0IEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcclxuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XHJcbmltcG9ydCBDdWJlVGV4dHVyZUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9DdWJlVGV4dHVyZUJhc2VcIik7XHJcbmltcG9ydCBSZW5kZXJUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvUmVuZGVyVGV4dHVyZVwiKTtcclxuaW1wb3J0IFRleHR1cmUyREJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlMkRCYXNlXCIpO1xyXG5pbXBvcnQgVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmVCYXNlXCIpO1xyXG5pbXBvcnQgQ1NTXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xyXG5cclxuaW1wb3J0IENvbnRleHRNb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRNb2RlXCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0XCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZpbHRlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRmlsdGVyXCIpO1xyXG5pbXBvcnQgQ29udGV4dEdMV3JhcE1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xXcmFwTW9kZVwiKTtcclxuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0U3RhZ2UzRFwiKTtcclxuaW1wb3J0IENvbnRleHRXZWJHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0V2ViR0xcIik7XHJcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XHJcbmltcG9ydCBJQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUN1YmVUZXh0dXJlXCIpO1xyXG5pbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcclxuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XHJcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xyXG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XHJcbmltcG9ydCBJbmRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW5kZXhEYXRhXCIpO1xyXG5pbXBvcnQgVGV4dHVyZURhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVGV4dHVyZURhdGFcIik7XHJcbmltcG9ydCBUZXh0dXJlRGF0YVBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhUG9vbFwiKTtcclxuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xyXG5pbXBvcnQgUHJvZ3JhbURhdGFQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9Qcm9ncmFtRGF0YVBvb2xcIik7XHJcbmltcG9ydCBWZXJ0ZXhEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1ZlcnRleERhdGFcIik7XHJcbmltcG9ydCBTdGFnZU1hbmFnZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcclxuXHJcbi8qKlxyXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcclxuICogKGFuZCBpbiB0dXJuIHRoZSBiYWNrIGJ1ZmZlcikgaXQgdXNlcy4gU3RhZ2Ugc2hvdWxkIG5ldmVyIGJlIGNyZWF0ZWQgZGlyZWN0bHksXHJcbiAqIGJ1dCByZXF1ZXN0ZWQgdGhyb3VnaCBTdGFnZU1hbmFnZXIuXHJcbiAqXHJcbiAqIEBzZWUgYXdheS5tYW5hZ2Vycy5TdGFnZU1hbmFnZXJcclxuICpcclxuICovXHJcbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXHJcbntcclxuXHRwcml2YXRlIF9wcm9ncmFtRGF0YTpBcnJheTxQcm9ncmFtRGF0YT4gPSBuZXcgQXJyYXk8UHJvZ3JhbURhdGE+KCk7XHJcblx0cHJpdmF0ZSBfdGV4dHVyZVBvb2w6VGV4dHVyZURhdGFQb29sO1xyXG5cdHByaXZhdGUgX3Byb2dyYW1EYXRhUG9vbDpQcm9ncmFtRGF0YVBvb2w7XHJcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dEdMO1xyXG5cdHByaXZhdGUgX2NvbnRhaW5lcjpIVE1MRWxlbWVudDtcclxuXHRwcml2YXRlIF93aWR0aDpudW1iZXI7XHJcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcclxuXHRwcml2YXRlIF94Om51bWJlciA9IDA7XHJcblx0cHJpdmF0ZSBfeTpudW1iZXIgPSAwO1xyXG5cclxuXHQvL3ByaXZhdGUgc3RhdGljIF9mcmFtZUV2ZW50RHJpdmVyOlNoYXBlID0gbmV3IFNoYXBlKCk7IC8vIFRPRE86IGFkZCBmcmFtZSBkcml2ZXIgLyByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxyXG5cclxuXHRwcml2YXRlIF9zdGFnZUluZGV4Om51bWJlciA9IC0xO1xyXG5cclxuXHRwcml2YXRlIF91c2VzU29mdHdhcmVSZW5kZXJpbmc6Ym9vbGVhbjtcclxuXHRwcml2YXRlIF9wcm9maWxlOnN0cmluZztcclxuXHRwcml2YXRlIF9zdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyO1xyXG5cdHByaXZhdGUgX2FudGlBbGlhczpudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX2VuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuO1xyXG5cdHByaXZhdGUgX2NvbnRleHRSZXF1ZXN0ZWQ6Ym9vbGVhbjtcclxuXHJcblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVmVydGV4QnVmZmVycyA6IFZlY3Rvci48VmVydGV4QnVmZmVyPiA9IG5ldyBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4oOCwgdHJ1ZSk7XHJcblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVGV4dHVyZXMgOiBWZWN0b3IuPFRleHR1cmVCYXNlPiA9IG5ldyBWZWN0b3IuPFRleHR1cmVCYXNlPig4LCB0cnVlKTtcclxuXHRwcml2YXRlIF9yZW5kZXJUYXJnZXQ6VGV4dHVyZUJhc2UgPSBudWxsO1xyXG5cdHByaXZhdGUgX3JlbmRlclN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcclxuXHRwcml2YXRlIF9jb2xvcjpudW1iZXI7XHJcblx0cHJpdmF0ZSBfYmFja0J1ZmZlckRpcnR5OmJvb2xlYW47XHJcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xyXG5cdHByaXZhdGUgX2VudGVyRnJhbWU6RXZlbnQ7XHJcblx0cHJpdmF0ZSBfZXhpdEZyYW1lOkV2ZW50O1xyXG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xyXG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcclxuXHRwcml2YXRlIF9idWZmZXJDbGVhcjpib29sZWFuO1xyXG5cclxuXHQvL3ByaXZhdGUgX21vdXNlM0RNYW5hZ2VyOmF3YXkubWFuYWdlcnMuTW91c2UzRE1hbmFnZXI7XHJcblx0Ly9wcml2YXRlIF90b3VjaDNETWFuYWdlcjpUb3VjaDNETWFuYWdlcjsgLy9UT0RPOiBpbWVwbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcclxuXHJcblx0cHJpdmF0ZSBfaW5pdGlhbGlzZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXHJcblx0e1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl90ZXh0dXJlUG9vbCA9IG5ldyBUZXh0dXJlRGF0YVBvb2woKTtcclxuXHRcdHRoaXMuX3Byb2dyYW1EYXRhUG9vbCA9IG5ldyBQcm9ncmFtRGF0YVBvb2wodGhpcyk7XHJcblxyXG5cdFx0dGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cclxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xyXG5cclxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcclxuXHJcblx0XHR0aGlzLl92aWV3UG9ydCA9IG5ldyBSZWN0YW5nbGUoKTtcclxuXHJcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xyXG5cclxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xyXG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XHJcblxyXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXRQcm9ncmFtRGF0YSh2ZXJ0ZXhTdHJpbmc6c3RyaW5nLCBmcmFnbWVudFN0cmluZzpzdHJpbmcpOlByb2dyYW1EYXRhXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3Byb2dyYW1EYXRhUG9vbC5nZXRJdGVtKHZlcnRleFN0cmluZywgZnJhZ21lbnRTdHJpbmcpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldFJlbmRlclRhcmdldCh0YXJnZXQ6VGV4dHVyZUJhc2UsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gZmFsc2UsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxyXG5cdHtcclxuXHRcdGlmICh0aGlzLl9yZW5kZXJUYXJnZXQgPT09IHRhcmdldCAmJiBzdXJmYWNlU2VsZWN0b3IgPT0gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yICYmIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9PSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLl9yZW5kZXJUYXJnZXQgPSB0YXJnZXQ7XHJcblx0XHR0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgPSBzdXJmYWNlU2VsZWN0b3I7XHJcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XHJcblx0XHRpZiAodGFyZ2V0IGluc3RhbmNlb2YgUmVuZGVyVGV4dHVyZSkge1xyXG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvVGV4dHVyZSh0aGlzLmdldFJlbmRlclRleHR1cmUoPFJlbmRlclRleHR1cmU+IHRhcmdldCksIGVuYWJsZURlcHRoQW5kU3RlbmNpbCwgdGhpcy5fYW50aUFsaWFzLCBzdXJmYWNlU2VsZWN0b3IpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcclxuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXRSZW5kZXJUZXh0dXJlKHRleHR1cmVQcm94eTpSZW5kZXJUZXh0dXJlKTpJVGV4dHVyZUJhc2VcclxuXHR7XHJcblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSB0aGlzLl90ZXh0dXJlUG9vbC5nZXRJdGVtKHRleHR1cmVQcm94eSwgZmFsc2UpO1xyXG5cclxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSlcclxuXHRcdFx0dGV4dHVyZURhdGEudGV4dHVyZSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVGV4dHVyZSh0ZXh0dXJlUHJveHkud2lkdGgsIHRleHR1cmVQcm94eS5oZWlnaHQsIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQkdSQSwgdHJ1ZSk7XHJcblxyXG5cdFx0cmV0dXJuIHRleHR1cmVEYXRhLnRleHR1cmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBc3NpZ25zIGFuIGF0dHJpYnV0ZSBzdHJlYW1cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgYXR0cmlidXRlIHN0cmVhbSBpbmRleCBmb3IgdGhlIHZlcnRleCBzaGFkZXJcclxuXHQgKiBAcGFyYW0gYnVmZmVyXHJcblx0ICogQHBhcmFtIG9mZnNldFxyXG5cdCAqIEBwYXJhbSBzdHJpZGVcclxuXHQgKiBAcGFyYW0gZm9ybWF0XHJcblx0ICovXHJcblx0cHVibGljIGFjdGl2YXRlQnVmZmVyKGluZGV4Om51bWJlciwgYnVmZmVyOlZlcnRleERhdGEsIG9mZnNldDpudW1iZXIsIGZvcm1hdDpzdHJpbmcpXHJcblx0e1xyXG5cdFx0aWYgKCFidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0pXHJcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XHJcblxyXG5cdFx0aWYgKCFidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSkge1xyXG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVmVydGV4QnVmZmVyKGJ1ZmZlci5kYXRhLmxlbmd0aC9idWZmZXIuZGF0YVBlclZlcnRleCwgYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xyXG5cdFx0XHRidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdKSB7XHJcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoL2J1ZmZlci5kYXRhUGVyVmVydGV4KTtcclxuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250ZXh0LnNldFZlcnRleEJ1ZmZlckF0KGluZGV4LCBidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSwgb2Zmc2V0LCBmb3JtYXQpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3Bvc2VWZXJ0ZXhEYXRhKGJ1ZmZlcjpWZXJ0ZXhEYXRhKVxyXG5cdHtcclxuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcclxuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gbnVsbDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhY3RpdmF0ZVJlbmRlclRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6UmVuZGVyVGV4dHVyZSlcclxuXHR7XHJcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xyXG5cclxuXHRcdHRoaXMuX2NvbnRleHQuc2V0VGV4dHVyZUF0KGluZGV4LCB0aGlzLmdldFJlbmRlclRleHR1cmUodGV4dHVyZVByb3h5KSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWN0aXZhdGVUZXh0dXJlKGluZGV4Om51bWJlciwgdGV4dHVyZVByb3h5OlRleHR1cmUyREJhc2UsIHJlcGVhdDpib29sZWFuLCBzbW9vdGg6Ym9vbGVhbiwgbWlwbWFwOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0dGhpcy5fc2V0U2FtcGxlclN0YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcclxuXHJcblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSA8VGV4dHVyZURhdGE+IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5LCBtaXBtYXApO1xyXG5cclxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSkge1xyXG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVUZXh0dXJlKHRleHR1cmVQcm94eS53aWR0aCwgdGV4dHVyZVByb3h5LmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKTtcclxuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcclxuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xyXG5cdFx0XHRpZiAobWlwbWFwKSB7XHJcblx0XHRcdFx0dmFyIG1pcG1hcERhdGE6QXJyYXk8Qml0bWFwRGF0YT4gPSB0ZXh0dXJlUHJveHkuX2lHZXRNaXBtYXBEYXRhKCk7XHJcblx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcclxuXHRcdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKylcclxuXHRcdFx0XHRcdCg8SVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbaV0sIGkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCg8SVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKHRleHR1cmVQcm94eS5faUdldFRleHR1cmVEYXRhKCksIDApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFjdGl2YXRlQ3ViZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6Q3ViZVRleHR1cmVCYXNlLCBzbW9vdGg6Ym9vbGVhbiwgbWlwbWFwOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0dGhpcy5fc2V0U2FtcGxlclN0YXRlKGluZGV4LCBmYWxzZSwgc21vb3RoLCBtaXBtYXApO1xyXG5cclxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIG1pcG1hcCk7XHJcblxyXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XHJcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZUN1YmVUZXh0dXJlKHRleHR1cmVQcm94eS5zaXplLCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIGZhbHNlKTtcclxuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcclxuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xyXG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCA2OyArK2kpIHtcclxuXHRcdFx0XHRpZiAobWlwbWFwKSB7XHJcblx0XHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoaSk7XHJcblx0XHRcdFx0XHR2YXIgbGVuOm51bWJlciA9IG1pcG1hcERhdGEubGVuZ3RoO1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgajpudW1iZXIgPSAwOyBqIDwgbGVuOyBqKyspXHJcblx0XHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2pdLCBpLCBqKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0KDxJQ3ViZVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKHRleHR1cmVQcm94eS5faUdldFRleHR1cmVEYXRhKGkpLCBpLCAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGV4dHVyZURhdGEudGV4dHVyZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXRyaWV2ZXMgdGhlIFZlcnRleEJ1ZmZlciBvYmplY3QgdGhhdCBjb250YWlucyB0cmlhbmdsZSBpbmRpY2VzLlxyXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBDb250ZXh0V2ViIGZvciB3aGljaCB3ZSByZXF1ZXN0IHRoZSBidWZmZXJcclxuXHQgKiBAcmV0dXJuIFRoZSBWZXJ0ZXhCdWZmZXIgb2JqZWN0IHRoYXQgY29udGFpbnMgdHJpYW5nbGUgaW5kaWNlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0SW5kZXhCdWZmZXIoYnVmZmVyOkluZGV4RGF0YSk6SUluZGV4QnVmZmVyXHJcblx0e1xyXG5cdFx0aWYgKCFidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0pXHJcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XHJcblxyXG5cdFx0aWYgKCFidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSkge1xyXG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlSW5kZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoKTtcclxuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSkge1xyXG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS51cGxvYWRGcm9tQXJyYXkoYnVmZmVyLmRhdGEsIDAsIGJ1ZmZlci5kYXRhLmxlbmd0aCk7XHJcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3Bvc2VJbmRleERhdGEoYnVmZmVyOkluZGV4RGF0YSlcclxuXHR7XHJcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XS5kaXNwb3NlKCk7XHJcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXF1ZXN0cyBhIENvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUgbWFuYWdlZCBnbCBjYW52YXMuXHJcblx0ICovXHJcblx0cHVibGljIHJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIilcclxuXHR7XHJcblx0XHQvLyBJZiBmb3JjaW5nIHNvZnR3YXJlLCB3ZSBjYW4gYmUgY2VydGFpbiB0aGF0IHRoZVxyXG5cdFx0Ly8gcmV0dXJuZWQgQ29udGV4dCB3aWxsIGJlIHJ1bm5pbmcgc29mdHdhcmUgbW9kZS5cclxuXHRcdC8vIElmIG5vdCwgd2UgY2FuJ3QgYmUgc3VyZSBhbmQgc2hvdWxkIHN0aWNrIHRvIHRoZVxyXG5cdFx0Ly8gb2xkIHZhbHVlICh3aWxsIGxpa2VseSBiZSBzYW1lIGlmIHJlLXJlcXVlc3RpbmcuKVxyXG5cclxuXHRcdGlmICh0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgIT0gbnVsbClcclxuXHRcdFx0dGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nID0gZm9yY2VTb2Z0d2FyZTtcclxuXHJcblx0XHR0aGlzLl9wcm9maWxlID0gcHJvZmlsZTtcclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5GTEFTSClcclxuXHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIChjb250ZXh0OklDb250ZXh0R0wpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMuX2NvbnRleHQgPSBuZXcgQ29udGV4dFdlYkdMKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyKTtcclxuXHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuQVVUTylcclxuXHRcdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5fY29udGV4dClcclxuXHRcdFx0dGhpcy5fY2FsbGJhY2sodGhpcy5fY29udGV4dCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2lkdGggb2YgdGhlIGdsIGNhbnZhc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgd2lkdGgoKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcclxuXHR7XHJcblx0XHRpZiAodGhpcy5fd2lkdGggPT0gdmFsKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Q1NTLnNldEVsZW1lbnRXaWR0aCh0aGlzLl9jb250YWluZXIsIHZhbCk7XHJcblxyXG5cdFx0dGhpcy5fd2lkdGggPSB0aGlzLl92aWV3UG9ydC53aWR0aCA9IHZhbDtcclxuXHJcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IGhlaWdodCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2hlaWdodDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgaGVpZ2h0KHZhbDpudW1iZXIpXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XHJcblxyXG5cdFx0dGhpcy5faGVpZ2h0ID0gdGhpcy5fdmlld1BvcnQuaGVpZ2h0ID0gdmFsO1xyXG5cclxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB4IHBvc2l0aW9uIG9mIHRoZSBnbCBjYW52YXNcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0IHgoKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl94O1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCB4KHZhbDpudW1iZXIpXHJcblx0e1xyXG5cdFx0aWYgKHRoaXMuX3ggPT0gdmFsKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcclxuXHJcblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcclxuXHJcblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgeSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3k7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IHkodmFsOm51bWJlcilcclxuXHR7XHJcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xyXG5cclxuXHRcdHRoaXMuX3kgPSB0aGlzLl92aWV3UG9ydC55ID0gdmFsO1xyXG5cclxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IHZpc2libGUodmFsOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuIENTUy5nZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBjb250YWluZXIoKTpIVE1MRWxlbWVudFxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgQ29udGV4dCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBzdGFnZSBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGdldCBjb250ZXh0KCk6SUNvbnRleHRHTFxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKVxyXG5cdHtcclxuXHRcdGlmICh0aGlzLl92aWV3cG9ydERpcnR5KVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0Ly9pZiAoIXRoaXMuaGFzRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpKVxyXG5cdFx0Ly9yZXR1cm47XHJcblxyXG5cdFx0Ly9pZiAoIV92aWV3cG9ydFVwZGF0ZWQpXHJcblx0XHR0aGlzLl92aWV3cG9ydFVwZGF0ZWQgPSBuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpO1xyXG5cclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl92aWV3cG9ydFVwZGF0ZWQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBub3RpZnlFbnRlckZyYW1lKClcclxuXHR7XHJcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXHJcblx0XHQvL3JldHVybjtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2VudGVyRnJhbWUpXHJcblx0XHRcdHRoaXMuX2VudGVyRnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRU5URVJfRlJBTUUpO1xyXG5cclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9lbnRlckZyYW1lKTtcclxuXHJcblx0fVxyXG5cclxuXHRwcml2YXRlIG5vdGlmeUV4aXRGcmFtZSgpXHJcblx0e1xyXG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSkpXHJcblx0XHQvL3JldHVybjtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2V4aXRGcmFtZSlcclxuXHRcdFx0dGhpcy5fZXhpdEZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVYSVRfRlJBTUUpO1xyXG5cclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9leGl0RnJhbWUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBwcm9maWxlKCk6c3RyaW5nXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3Byb2ZpbGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEaXNwb3NlcyB0aGUgU3RhZ2Ugb2JqZWN0LCBmcmVlaW5nIHRoZSBDb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBTdGFnZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZGlzcG9zZSgpXHJcblx0e1xyXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyLmlSZW1vdmVTdGFnZSh0aGlzKTtcclxuXHRcdHRoaXMuZnJlZUNvbnRleHQoKTtcclxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IG51bGw7XHJcblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gLTE7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25maWd1cmVzIHRoZSBiYWNrIGJ1ZmZlciBhc3NvY2lhdGVkIHdpdGggdGhlIFN0YWdlIG9iamVjdC5cclxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlcldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYmFja2J1ZmZlci5cclxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlckhlaWdodCBUaGUgaGVpZ2h0IG9mIHRoZSBiYWNrYnVmZmVyLlxyXG5cdCAqIEBwYXJhbSBhbnRpQWxpYXMgVGhlIGFtb3VudCBvZiBhbnRpLWFsaWFzaW5nIHRvIHVzZS5cclxuXHQgKiBAcGFyYW0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBiYWNrIGJ1ZmZlciBjb250YWlucyBhIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlci5cclxuXHQgKi9cclxuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGg6bnVtYmVyLCBiYWNrQnVmZmVySGVpZ2h0Om51bWJlciwgYW50aUFsaWFzOm51bWJlciwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXHJcblx0e1xyXG5cdFx0dGhpcy53aWR0aCA9IGJhY2tCdWZmZXJXaWR0aDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gYmFja0J1ZmZlckhlaWdodDtcclxuXHJcblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XHJcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXHJcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGgsIGJhY2tCdWZmZXJIZWlnaHQsIGFudGlBbGlhcywgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcclxuXHR9XHJcblxyXG5cdC8qXHJcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlciBpcyB1c2VkXHJcblx0ICovXHJcblx0cHVibGljIGdldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoKTpib29sZWFuXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuKVxyXG5cdHtcclxuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcclxuXHRcdHRoaXMuX2JhY2tCdWZmZXJEaXJ0eSA9IHRydWU7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IHJlbmRlclRhcmdldCgpOlRleHR1cmVCYXNlXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclRhcmdldDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgcmVuZGVyU3VyZmFjZVNlbGVjdG9yKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclN1cmZhY2VTZWxlY3RvcjtcclxuXHR9XHJcblxyXG5cdC8qXHJcblx0ICogQ2xlYXIgYW5kIHJlc2V0IHRoZSBiYWNrIGJ1ZmZlciB3aGVuIHVzaW5nIGEgc2hhcmVkIGNvbnRleHRcclxuXHQgKi9cclxuXHRwdWJsaWMgY2xlYXIoKVxyXG5cdHtcclxuXHRcdGlmICghdGhpcy5fY29udGV4dClcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh0aGlzLl9iYWNrQnVmZmVyRGlydHkpIHtcclxuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcclxuXHRcdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dC5jbGVhcigoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAwMCApID4+PiAyNCwgLy8gPC0tLS0tLS0tLSBaZXJvLWZpbGwgcmlnaHQgc2hpZnRcclxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAwMCApID4+PiAxNiwgLy8gPC0tLS0tLS0tLS0tLS18XHJcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwICkgPj4+IDgsIC8vIDwtLS0tLS0tLS0tLS0tLS0tfFxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fY29sb3IgJiAweGZmKTtcclxuXHJcblx0XHR0aGlzLl9idWZmZXJDbGVhciA9IHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgb2JqZWN0IHdpdGggYW4gRXZlbnREaXNwYXRjaGVyIG9iamVjdCBzbyB0aGF0IHRoZSBsaXN0ZW5lciByZWNlaXZlcyBub3RpZmljYXRpb24gb2YgYW4gZXZlbnQuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgaW50byBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXHJcblx0ICogWW91IGNhbiByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgb24gYWxsIG5vZGVzIGluIHRoZSBkaXNwbGF5IGxpc3QgZm9yIGEgc3BlY2lmaWMgdHlwZSBvZiBldmVudCwgcGhhc2UsIGFuZCBwcmlvcml0eS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxyXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgdGhlIGV2ZW50LlxyXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIERldGVybWluZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd29ya3MgaW4gdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB1c2VDYXB0dXJlIGlzIHNldCB0byB0cnVlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgY2FwdHVyZSBwaGFzZSBhbmQgbm90IGluIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIElmIHVzZUNhcHR1cmUgaXMgZmFsc2UsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSB0YXJnZXQgb3IgYnViYmxpbmcgcGhhc2UuIFRvIGxpc3RlbiBmb3IgdGhlIGV2ZW50IGluIGFsbCB0aHJlZSBwaGFzZXMsIGNhbGwgYWRkRXZlbnRMaXN0ZW5lciB0d2ljZSwgb25jZSB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIHRydWUsIHRoZW4gYWdhaW4gd2l0aCB1c2VDYXB0dXJlIHNldCB0byBmYWxzZS5cclxuXHQgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gVGhlIHByaW9yaXR5IGlzIGRlc2lnbmF0ZWQgYnkgYSBzaWduZWQgMzItYml0IGludGVnZXIuIFRoZSBoaWdoZXIgdGhlIG51bWJlciwgdGhlIGhpZ2hlciB0aGUgcHJpb3JpdHkuIEFsbCBsaXN0ZW5lcnMgd2l0aCBwcmlvcml0eSBuIGFyZSBwcm9jZXNzZWQgYmVmb3JlIGxpc3RlbmVycyBvZiBwcmlvcml0eSBuLTEuIElmIHR3byBvciBtb3JlIGxpc3RlbmVycyBzaGFyZSB0aGUgc2FtZSBwcmlvcml0eSwgdGhleSBhcmUgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQuIFRoZSBkZWZhdWx0IHByaW9yaXR5IGlzIDAuXHJcblx0ICogQHBhcmFtIHVzZVdlYWtSZWZlcmVuY2UgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGxpc3RlbmVyIGlzIHN0cm9uZyBvciB3ZWFrLiBBIHN0cm9uZyByZWZlcmVuY2UgKHRoZSBkZWZhdWx0KSBwcmV2ZW50cyB5b3VyIGxpc3RlbmVyIGZyb20gYmVpbmcgZ2FyYmFnZS1jb2xsZWN0ZWQuIEEgd2VhayByZWZlcmVuY2UgZG9lcyBub3QuXHJcblx0ICovXHJcblx0cHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxyXG5cdHtcclxuXHRcdHN1cGVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ2FkZEV2ZW50TGlzdGVuZXInICwgICdFbnRlckZyYW1lLCBFeGl0RnJhbWUnKTtcclxuXHJcblx0XHQvL2lmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICl7Ly8mJiAhIHRoaXMuX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xyXG5cclxuXHRcdC8vX2ZyYW1lRXZlbnREcml2ZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSwgb25FbnRlckZyYW1lLCB1c2VDYXB0dXJlLCBwcmlvcml0eSwgdXNlV2Vha1JlZmVyZW5jZSk7XHJcblxyXG5cdFx0Ly99XHJcblxyXG5cdFx0LyogT3JpZ2luYWwgY29kZVxyXG5cdFx0IGlmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICYmICEgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xyXG5cclxuXHRcdCBfZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcclxuXHJcblxyXG5cdFx0IH1cclxuXHRcdCAqL1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgb3V0IG9mIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cclxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaGluZyBsaXN0ZW5lciByZWdpc3RlcmVkIHdpdGggdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QsIGEgY2FsbCB0byB0aGlzIG1ldGhvZCBoYXMgbm8gZWZmZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXHJcblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBvYmplY3QgdG8gcmVtb3ZlLlxyXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIGJvdGggdGhlIGNhcHR1cmUgcGhhc2UgYW5kIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcywgdHdvIGNhbGxzIHRvIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSBhcmUgcmVxdWlyZWQgdG8gcmVtb3ZlIGJvdGgsIG9uZSBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byB0cnVlLCBhbmQgYW5vdGhlciBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byBmYWxzZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXHJcblx0e1xyXG5cdFx0c3VwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XHJcblxyXG5cdFx0LypcclxuXHRcdCAvLyBSZW1vdmUgdGhlIG1haW4gcmVuZGVyaW5nIGxpc3RlbmVyIGlmIG5vIEVudGVyRnJhbWUgbGlzdGVuZXJzIHJlbWFpblxyXG5cdFx0IGlmICggICAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMgKVxyXG5cdFx0ICYmICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzKSApIC8vJiYgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXHJcblx0XHQge1xyXG5cclxuXHRcdCAvL19mcmFtZUV2ZW50RHJpdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIHRoaXMub25FbnRlckZyYW1lLCB0aGlzICk7XHJcblxyXG5cdFx0IH1cclxuXHRcdCAqL1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9zY2lzc29yUmVjdDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgc2Npc3NvclJlY3QodmFsdWU6UmVjdGFuZ2xlKVxyXG5cdHtcclxuXHRcdHRoaXMuX3NjaXNzb3JSZWN0ID0gdmFsdWU7XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTY2lzc29yUmVjdGFuZ2xlKHRoaXMuX3NjaXNzb3JSZWN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBpbmRleCBvZiB0aGUgU3RhZ2Ugd2hpY2ggaXMgbWFuYWdlZCBieSB0aGlzIGluc3RhbmNlIG9mIFN0YWdlUHJveHkuXHJcblx0ICovXHJcblx0cHVibGljIGdldCBzdGFnZUluZGV4KCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlSW5kZXg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgU3RhZ2UgbWFuYWdlZCBieSB0aGlzIHByb3h5IGlzIHJ1bm5pbmcgaW4gc29mdHdhcmUgbW9kZS5cclxuXHQgKiBSZW1lbWJlciB0byB3YWl0IGZvciB0aGUgQ09OVEVYVF9DUkVBVEVEIGV2ZW50IGJlZm9yZSBjaGVja2luZyB0aGlzIHByb3BlcnR5LFxyXG5cdCAqIGFzIG9ubHkgdGhlbiB3aWxsIGl0IGJlIGd1YXJhbnRlZWQgdG8gYmUgYWNjdXJhdGUuXHJcblx0ICovXHJcblx0cHVibGljIGdldCB1c2VzU29mdHdhcmVSZW5kZXJpbmcoKTpib29sZWFuXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBhbnRpQWxpYXNpbmcgb2YgdGhlIFN0YWdlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgYW50aUFsaWFzKCk6bnVtYmVyXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2FudGlBbGlhcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzZXQgYW50aUFsaWFzKGFudGlBbGlhczpudW1iZXIpXHJcblx0e1xyXG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xyXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgdmlld1BvcnQoKTpSZWN0YW5nbGVcclxuXHR7XHJcblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gZmFsc2U7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIFN0YWdlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgY29sb3IoKTpudW1iZXJcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fY29sb3I7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc2V0IGNvbG9yKGNvbG9yOm51bWJlcilcclxuXHR7XHJcblx0XHR0aGlzLl9jb2xvciA9IGNvbG9yO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGZyZXNobHkgY2xlYXJlZCBzdGF0ZSBvZiB0aGUgYmFja2J1ZmZlciBiZWZvcmUgYW55IHJlbmRlcmluZ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXQgYnVmZmVyQ2xlYXIoKTpib29sZWFuXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuX2J1ZmZlckNsZWFyO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHNldCBidWZmZXJDbGVhcihuZXdCdWZmZXJDbGVhcjpib29sZWFuKVxyXG5cdHtcclxuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gbmV3QnVmZmVyQ2xlYXI7XHJcblx0fVxyXG5cclxuXHJcblx0cHVibGljIHJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcclxuXHR7XHJcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xyXG5cdFx0d2hpbGUgKHRoaXMuX3Byb2dyYW1EYXRhW2ldICE9IG51bGwpXHJcblx0XHRcdGkrKztcclxuXHJcblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtpXSA9IHByb2dyYW1EYXRhO1xyXG5cdFx0cHJvZ3JhbURhdGEuaWQgPSBpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHVuUmVnaXN0ZXJQcm9ncmFtKHByb2dyYW1EYXRhOlByb2dyYW1EYXRhKVxyXG5cdHtcclxuXHRcdHRoaXMuX3Byb2dyYW1EYXRhW3Byb2dyYW1EYXRhLmlkXSA9IG51bGw7XHJcblx0XHRwcm9ncmFtRGF0YS5pZCA9IC0xO1xyXG5cdH1cclxuXHJcblx0LypcclxuXHQgKiBBY2Nlc3MgdG8gZmlyZSBtb3VzZWV2ZW50cyBhY3Jvc3MgbXVsdGlwbGUgbGF5ZXJlZCB2aWV3M0QgaW5zdGFuY2VzXHJcblx0ICovXHJcblx0Ly9cdFx0cHVibGljIGdldCBtb3VzZTNETWFuYWdlcigpOk1vdXNlM0RNYW5hZ2VyXHJcblx0Ly9cdFx0e1xyXG5cdC8vXHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlM0RNYW5hZ2VyO1xyXG5cdC8vXHRcdH1cclxuXHQvL1xyXG5cdC8vXHRcdHB1YmxpYyBzZXQgbW91c2UzRE1hbmFnZXIodmFsdWU6TW91c2UzRE1hbmFnZXIpXHJcblx0Ly9cdFx0e1xyXG5cdC8vXHRcdFx0dGhpcy5fbW91c2UzRE1hbmFnZXIgPSB2YWx1ZTtcclxuXHQvL1x0XHR9XHJcblxyXG5cdC8qIFRPRE86IGltcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXHJcblx0IHB1YmxpYyBnZXQgdG91Y2gzRE1hbmFnZXIoKTpUb3VjaDNETWFuYWdlclxyXG5cdCB7XHJcblx0IHJldHVybiBfdG91Y2gzRE1hbmFnZXI7XHJcblx0IH1cclxuXHJcblx0IHB1YmxpYyBzZXQgdG91Y2gzRE1hbmFnZXIodmFsdWU6VG91Y2gzRE1hbmFnZXIpXHJcblx0IHtcclxuXHQgX3RvdWNoM0RNYW5hZ2VyID0gdmFsdWU7XHJcblx0IH1cclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICogRnJlZXMgdGhlIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3RhZ2VQcm94eS5cclxuXHQgKi9cclxuXHRwcml2YXRlIGZyZWVDb250ZXh0KClcclxuXHR7XHJcblx0XHRpZiAodGhpcy5fY29udGV4dCkge1xyXG5cdFx0XHR0aGlzLl9jb250ZXh0LmRpc3Bvc2UoKTtcclxuXHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9jb250ZXh0ID0gbnVsbDtcclxuXHJcblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIEVudGVyX0ZyYW1lIGhhbmRsZXIgZm9yIHByb2Nlc3NpbmcgdGhlIHByb3h5LkVOVEVSX0ZSQU1FIGFuZCBwcm94eS5FWElUX0ZSQU1FIGV2ZW50IGhhbmRsZXJzLlxyXG5cdCAqIFR5cGljYWxseSB0aGUgcHJveHkuRU5URVJfRlJBTUUgbGlzdGVuZXIgd291bGQgcmVuZGVyIHRoZSBsYXllcnMgZm9yIHRoaXMgU3RhZ2UgaW5zdGFuY2UuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZXZlbnQ6RXZlbnQpXHJcblx0e1xyXG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWdlIGluc3RhbmNlXHJcblx0XHR0aGlzLmNsZWFyKCk7XHJcblx0XHQvL25vdGlmeSB0aGUgZW50ZXJmcmFtZSBsaXN0ZW5lcnNcclxuXHRcdHRoaXMubm90aWZ5RW50ZXJGcmFtZSgpO1xyXG5cdFx0Ly8gQ2FsbCB0aGUgcHJlc2VudCgpIHRvIHJlbmRlciB0aGUgZnJhbWVcclxuXHRcdGlmICghdGhpcy5fY29udGV4dClcclxuXHRcdFx0dGhpcy5fY29udGV4dC5wcmVzZW50KCk7XHJcblx0XHQvL25vdGlmeSB0aGUgZXhpdGZyYW1lIGxpc3RlbmVyc1xyXG5cdFx0dGhpcy5ub3RpZnlFeGl0RnJhbWUoKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZWNvdmVyRnJvbURpc3Bvc2FsKCk6Ym9vbGVhblxyXG5cdHtcclxuXHRcdGlmICghdGhpcy5fY29udGV4dClcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ3JlY292ZXJGcm9tRGlzcG9zYWwnICwgJycgKTtcclxuXHJcblx0XHQvKlxyXG5cdFx0IGlmICh0aGlzLl9pQ29udGV4dC5kcml2ZXJJbmZvID09IFwiRGlzcG9zZWRcIilcclxuXHRcdCB7XHJcblx0XHQgdGhpcy5faUNvbnRleHQgPSBudWxsO1xyXG5cdFx0IHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LkNPTlRFWFRfRElTUE9TRUQpKTtcclxuXHRcdCByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0IH1cclxuXHRcdCAqL1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfY2FsbGJhY2soY29udGV4dDpJQ29udGV4dEdMKVxyXG5cdHtcclxuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xyXG5cclxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NvbnRleHQuY29udGFpbmVyO1xyXG5cclxuXHRcdC8vIE9ubHkgY29uZmlndXJlIGJhY2sgYnVmZmVyIGlmIHdpZHRoIGFuZCBoZWlnaHQgaGF2ZSBiZWVuIHNldCxcclxuXHRcdC8vIHdoaWNoIHRoZXkgbWF5IG5vdCBoYXZlIGJlZW4gaWYgVmlldy5yZW5kZXIoKSBoYXMgeWV0IHRvIGJlXHJcblx0XHQvLyBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZS5cclxuXHRcdGlmICh0aGlzLl93aWR0aCAmJiB0aGlzLl9oZWlnaHQpXHJcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XHJcblxyXG5cdFx0Ly8gRGlzcGF0Y2ggdGhlIGFwcHJvcHJpYXRlIGV2ZW50IGRlcGVuZGluZyBvbiB3aGV0aGVyIGNvbnRleHQgd2FzXHJcblx0XHQvLyBjcmVhdGVkIGZvciB0aGUgZmlyc3QgdGltZSBvciByZWNyZWF0ZWQgYWZ0ZXIgYSBkZXZpY2UgbG9zcy5cclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudCh0aGlzLl9pbml0aWFsaXNlZD8gU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCA6IFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVEKSk7XHJcblxyXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfc2V0U2FtcGxlclN0YXRlKGluZGV4Om51bWJlciwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcclxuXHR7XHJcblx0XHR2YXIgd3JhcDpzdHJpbmcgPSByZXBlYXQ/IENvbnRleHRHTFdyYXBNb2RlLlJFUEVBVDpDb250ZXh0R0xXcmFwTW9kZS5DTEFNUDtcclxuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gc21vb3RoPyBDb250ZXh0R0xUZXh0dXJlRmlsdGVyLkxJTkVBUiA6IENvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVDtcclxuXHRcdHZhciBtaXBmaWx0ZXI6c3RyaW5nID0gbWlwbWFwPyBDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTElORUFSIDogQ29udGV4dEdMTWlwRmlsdGVyLk1JUE5PTkU7XHJcblxyXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTYW1wbGVyU3RhdGVBdChpbmRleCwgd3JhcCwgZmlsdGVyLCBtaXBmaWx0ZXIpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0ID0gU3RhZ2U7Il19