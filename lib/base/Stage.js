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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuYWN0aXZhdGVSZW5kZXJUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVUZXh0dXJlIiwiU3RhZ2UuYWN0aXZhdGVDdWJlVGV4dHVyZSIsIlN0YWdlLmdldEluZGV4QnVmZmVyIiwiU3RhZ2UuZGlzcG9zZUluZGV4RGF0YSIsIlN0YWdlLnJlcXVlc3RDb250ZXh0IiwiU3RhZ2Uud2lkdGgiLCJTdGFnZS5oZWlnaHQiLCJTdGFnZS54IiwiU3RhZ2UueSIsIlN0YWdlLnZpc2libGUiLCJTdGFnZS5jb250YWluZXIiLCJTdGFnZS5jb250ZXh0IiwiU3RhZ2Uubm90aWZ5Vmlld3BvcnRVcGRhdGVkIiwiU3RhZ2Uubm90aWZ5RW50ZXJGcmFtZSIsIlN0YWdlLm5vdGlmeUV4aXRGcmFtZSIsIlN0YWdlLnByb2ZpbGUiLCJTdGFnZS5kaXNwb3NlIiwiU3RhZ2UuY29uZmlndXJlQmFja0J1ZmZlciIsIlN0YWdlLmVuYWJsZURlcHRoQW5kU3RlbmNpbCIsIlN0YWdlLnJlbmRlclRhcmdldCIsIlN0YWdlLnJlbmRlclN1cmZhY2VTZWxlY3RvciIsIlN0YWdlLmNsZWFyIiwiU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lciIsIlN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIiLCJTdGFnZS5zY2lzc29yUmVjdCIsIlN0YWdlLnN0YWdlSW5kZXgiLCJTdGFnZS51c2VzU29mdHdhcmVSZW5kZXJpbmciLCJTdGFnZS5hbnRpQWxpYXMiLCJTdGFnZS52aWV3UG9ydCIsIlN0YWdlLmNvbG9yIiwiU3RhZ2UuYnVmZmVyQ2xlYXIiLCJTdGFnZS5yZWdpc3RlclByb2dyYW0iLCJTdGFnZS51blJlZ2lzdGVyUHJvZ3JhbSIsIlN0YWdlLmZyZWVDb250ZXh0IiwiU3RhZ2Uub25FbnRlckZyYW1lIiwiU3RhZ2UucmVjb3ZlckZyb21EaXNwb3NhbCIsIlN0YWdlLl9jYWxsYmFjayIsIlN0YWdlLl9zZXRTYW1wbGVyU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDakUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFDNUQsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRzVFLElBQU8sR0FBRyxXQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXhELElBQU8sV0FBVyxXQUFlLHFDQUFxQyxDQUFDLENBQUM7QUFDeEUsSUFBTyxzQkFBc0IsV0FBWSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8sa0JBQWtCLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUNwRixJQUFPLHNCQUFzQixXQUFZLGdEQUFnRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxpQkFBaUIsV0FBYSwyQ0FBMkMsQ0FBQyxDQUFDO0FBQ2xGLElBQU8sY0FBYyxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFDN0UsSUFBTyxZQUFZLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQU0xRSxJQUFPLFVBQVUsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBR3hFLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFFL0UsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUkvRSxBQVFBOzs7Ozs7O0dBREc7SUFDRyxLQUFLO0lBQVNBLFVBQWRBLEtBQUtBLFVBQXdCQTtJQTBDbENBLFNBMUNLQSxLQUFLQSxDQTBDRUEsU0FBMkJBLEVBQUVBLFVBQWlCQSxFQUFFQSxZQUF5QkEsRUFBRUEsYUFBNkJBLEVBQUVBLE9BQTJCQTtR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QUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxFQUFFQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUNuSUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekNBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUMxR0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDMUNBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDMUZBLENBQUNBO0lBRU1MLGlDQUFpQkEsR0FBeEJBLFVBQXlCQSxNQUFpQkE7UUFFekNNLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENB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QkFBc0JBLENBQUNBLE1BQU1BLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDM0ZBLElBQUlBLFNBQVNBLEdBQVVBLE1BQU1BLEdBQUVBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUV6RkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFDRjdDLFlBQUNBO0FBQURBLENBdnVCQSxBQXV1QkNBLEVBdnVCbUIsZUFBZSxFQXV1QmxDO0FBRUQsQUFBZSxpQkFBTixLQUFLLENBQUMiLCJmaWxlIjoiYmFzZS9TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9SZWN0YW5nbGVcIik7XG5pbXBvcnQgRXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XG5pbXBvcnQgQ3ViZVRleHR1cmVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQ3ViZVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IFJlbmRlclRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9SZW5kZXJUZXh0dXJlXCIpO1xuaW1wb3J0IFRleHR1cmUyREJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlMkRCYXNlXCIpO1xuaW1wb3J0IFRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBDU1NcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9DU1NcIik7XG5cbmltcG9ydCBDb250ZXh0TW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0TW9kZVwiKTtcbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGb3JtYXRcIik7XG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGaWx0ZXJcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZpbHRlclwiKTtcbmltcG9ydCBDb250ZXh0R0xXcmFwTW9kZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFdyYXBNb2RlXCIpO1xuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0U3RhZ2UzRFwiKTtcbmltcG9ydCBDb250ZXh0V2ViR0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFdlYkdMXCIpO1xuaW1wb3J0IElDb250ZXh0R0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUN1YmVUZXh0dXJlXCIpO1xuaW1wb3J0IElJbmRleEJ1ZmZlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JSW5kZXhCdWZmZXJcIik7XG5pbXBvcnQgSVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZVwiKTtcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2V2ZW50cy9TdGFnZUV2ZW50XCIpO1xuaW1wb3J0IEluZGV4RGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbmRleERhdGFcIik7XG5pbXBvcnQgVGV4dHVyZURhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVGV4dHVyZURhdGFcIik7XG5pbXBvcnQgVGV4dHVyZURhdGFQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9UZXh0dXJlRGF0YVBvb2xcIik7XG5pbXBvcnQgUHJvZ3JhbURhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFcIik7XG5pbXBvcnQgUHJvZ3JhbURhdGFQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9Qcm9ncmFtRGF0YVBvb2xcIik7XG5pbXBvcnQgVmVydGV4RGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9WZXJ0ZXhEYXRhXCIpO1xuaW1wb3J0IFN0YWdlTWFuYWdlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWFuYWdlcnMvU3RhZ2VNYW5hZ2VyXCIpO1xuXG4vKipcbiAqIFN0YWdlIHByb3ZpZGVzIGEgcHJveHkgY2xhc3MgdG8gaGFuZGxlIHRoZSBjcmVhdGlvbiBhbmQgYXR0YWNobWVudCBvZiB0aGUgQ29udGV4dFxuICogKGFuZCBpbiB0dXJuIHRoZSBiYWNrIGJ1ZmZlcikgaXQgdXNlcy4gU3RhZ2Ugc2hvdWxkIG5ldmVyIGJlIGNyZWF0ZWQgZGlyZWN0bHksXG4gKiBidXQgcmVxdWVzdGVkIHRocm91Z2ggU3RhZ2VNYW5hZ2VyLlxuICpcbiAqIEBzZWUgYXdheS5tYW5hZ2Vycy5TdGFnZU1hbmFnZXJcbiAqXG4gKi9cbmNsYXNzIFN0YWdlIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyXG57XG5cdHByaXZhdGUgX3Byb2dyYW1EYXRhOkFycmF5PFByb2dyYW1EYXRhPiA9IG5ldyBBcnJheTxQcm9ncmFtRGF0YT4oKTtcblx0cHJpdmF0ZSBfdGV4dHVyZVBvb2w6VGV4dHVyZURhdGFQb29sO1xuXHRwcml2YXRlIF9wcm9ncmFtRGF0YVBvb2w6UHJvZ3JhbURhdGFQb29sO1xuXHRwcml2YXRlIF9jb250ZXh0OklDb250ZXh0R0w7XG5cdHByaXZhdGUgX2NvbnRhaW5lcjpIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuXHRwcml2YXRlIF94Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3k6bnVtYmVyID0gMDtcblxuXHQvL3ByaXZhdGUgc3RhdGljIF9mcmFtZUV2ZW50RHJpdmVyOlNoYXBlID0gbmV3IFNoYXBlKCk7IC8vIFRPRE86IGFkZCBmcmFtZSBkcml2ZXIgLyByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxuXG5cdHByaXZhdGUgX3N0YWdlSW5kZXg6bnVtYmVyID0gLTE7XG5cblx0cHJpdmF0ZSBfdXNlc1NvZnR3YXJlUmVuZGVyaW5nOmJvb2xlYW47XG5cdHByaXZhdGUgX3Byb2ZpbGU6c3RyaW5nO1xuXHRwcml2YXRlIF9zdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyO1xuXHRwcml2YXRlIF9hbnRpQWxpYXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW47XG5cdHByaXZhdGUgX2NvbnRleHRSZXF1ZXN0ZWQ6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgdmFyIF9hY3RpdmVWZXJ0ZXhCdWZmZXJzIDogVmVjdG9yLjxWZXJ0ZXhCdWZmZXI+ID0gbmV3IFZlY3Rvci48VmVydGV4QnVmZmVyPig4LCB0cnVlKTtcblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVGV4dHVyZXMgOiBWZWN0b3IuPFRleHR1cmVCYXNlPiA9IG5ldyBWZWN0b3IuPFRleHR1cmVCYXNlPig4LCB0cnVlKTtcblx0cHJpdmF0ZSBfcmVuZGVyVGFyZ2V0OlRleHR1cmVCYXNlID0gbnVsbDtcblx0cHJpdmF0ZSBfcmVuZGVyU3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfY29sb3I6bnVtYmVyO1xuXHRwcml2YXRlIF9iYWNrQnVmZmVyRGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9lbnRlckZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF9leGl0RnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydERpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX2J1ZmZlckNsZWFyOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIF9tb3VzZTNETWFuYWdlcjphd2F5Lm1hbmFnZXJzLk1vdXNlM0RNYW5hZ2VyO1xuXHQvL3ByaXZhdGUgX3RvdWNoM0RNYW5hZ2VyOlRvdWNoM0RNYW5hZ2VyOyAvL1RPRE86IGltZXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXG5cdHByaXZhdGUgX2luaXRpYWxpc2VkOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fdGV4dHVyZVBvb2wgPSBuZXcgVGV4dHVyZURhdGFQb29sKCk7XG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFQb29sID0gbmV3IFByb2dyYW1EYXRhUG9vbCh0aGlzKTtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcblxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xuXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gc3RhZ2VNYW5hZ2VyO1xuXG5cdFx0dGhpcy5fdmlld1BvcnQgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cblx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldFByb2dyYW1EYXRhKHZlcnRleFN0cmluZzpzdHJpbmcsIGZyYWdtZW50U3RyaW5nOnN0cmluZyk6UHJvZ3JhbURhdGFcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9ncmFtRGF0YVBvb2wuZ2V0SXRlbSh2ZXJ0ZXhTdHJpbmcsIGZyYWdtZW50U3RyaW5nKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRSZW5kZXJUYXJnZXQodGFyZ2V0OlRleHR1cmVCYXNlLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbiA9IGZhbHNlLCBzdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMClcblx0e1xuXHRcdGlmICh0aGlzLl9yZW5kZXJUYXJnZXQgPT09IHRhcmdldCAmJiBzdXJmYWNlU2VsZWN0b3IgPT0gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yICYmIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9PSBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9yZW5kZXJUYXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yID0gc3VyZmFjZVNlbGVjdG9yO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHRpZiAodGFyZ2V0IGluc3RhbmNlb2YgUmVuZGVyVGV4dHVyZSkge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb1RleHR1cmUodGhpcy5nZXRSZW5kZXJUZXh0dXJlKDxSZW5kZXJUZXh0dXJlPiB0YXJnZXQpLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwsIHRoaXMuX2FudGlBbGlhcywgc3VyZmFjZVNlbGVjdG9yKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldFJlbmRlclRleHR1cmUodGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpOklUZXh0dXJlQmFzZVxuXHR7XG5cdFx0dmFyIHRleHR1cmVEYXRhOlRleHR1cmVEYXRhID0gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIGZhbHNlKTtcblxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSlcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIHRleHR1cmVEYXRhLnRleHR1cmU7XG5cdH1cblxuXHQvKipcblx0ICogQXNzaWducyBhbiBhdHRyaWJ1dGUgc3RyZWFtXG5cdCAqXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgYXR0cmlidXRlIHN0cmVhbSBpbmRleCBmb3IgdGhlIHZlcnRleCBzaGFkZXJcblx0ICogQHBhcmFtIGJ1ZmZlclxuXHQgKiBAcGFyYW0gb2Zmc2V0XG5cdCAqIEBwYXJhbSBzdHJpZGVcblx0ICogQHBhcmFtIGZvcm1hdFxuXHQgKi9cblx0cHVibGljIGFjdGl2YXRlQnVmZmVyKGluZGV4Om51bWJlciwgYnVmZmVyOlZlcnRleERhdGEsIG9mZnNldDpudW1iZXIsIGZvcm1hdDpzdHJpbmcpXG5cdHtcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XG5cblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVmVydGV4QnVmZmVyKGJ1ZmZlci5kYXRhLmxlbmd0aC9idWZmZXIuZGF0YVBlclZlcnRleCwgYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChidWZmZXIuaW52YWxpZFt0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0udXBsb2FkRnJvbUFycmF5KGJ1ZmZlci5kYXRhLCAwLCBidWZmZXIuZGF0YS5sZW5ndGgvYnVmZmVyLmRhdGFQZXJWZXJ0ZXgpO1xuXHRcdFx0YnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFZlcnRleEJ1ZmZlckF0KGluZGV4LCBidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSwgb2Zmc2V0LCBmb3JtYXQpO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2VWZXJ0ZXhEYXRhKGJ1ZmZlcjpWZXJ0ZXhEYXRhKVxuXHR7XG5cdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0uZGlzcG9zZSgpO1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdID0gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBhY3RpdmF0ZVJlbmRlclRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6UmVuZGVyVGV4dHVyZSlcblx0e1xuXHRcdHRoaXMuX3NldFNhbXBsZXJTdGF0ZShpbmRleCwgZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGhpcy5nZXRSZW5kZXJUZXh0dXJlKHRleHR1cmVQcm94eSkpO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpUZXh0dXJlMkRCYXNlLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fc2V0U2FtcGxlclN0YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHksIG1pcG1hcCk7XG5cblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpIHtcblx0XHRcdHRleHR1cmVEYXRhLnRleHR1cmUgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVRleHR1cmUodGV4dHVyZVByb3h5LndpZHRoLCB0ZXh0dXJlUHJveHkuaGVpZ2h0LCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIHRydWUpO1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRleHR1cmVEYXRhLmludmFsaWQpIHtcblx0XHRcdHRleHR1cmVEYXRhLmludmFsaWQgPSBmYWxzZTtcblx0XHRcdGlmIChtaXBtYXApIHtcblx0XHRcdFx0dmFyIG1pcG1hcERhdGE6QXJyYXk8Qml0bWFwRGF0YT4gPSB0ZXh0dXJlUHJveHkuX2lHZXRNaXBtYXBEYXRhKCk7XG5cdFx0XHRcdHZhciBsZW46bnVtYmVyID0gbWlwbWFwRGF0YS5sZW5ndGg7XG5cdFx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKVxuXHRcdFx0XHRcdCg8SVRleHR1cmU+IHRleHR1cmVEYXRhLnRleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbaV0sIGkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoKSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlQ3ViZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6Q3ViZVRleHR1cmVCYXNlLCBzbW9vdGg6Ym9vbGVhbiwgbWlwbWFwOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIGZhbHNlLCBzbW9vdGgsIG1pcG1hcCk7XG5cblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSA8VGV4dHVyZURhdGE+IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5LCBtaXBtYXApO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVDdWJlVGV4dHVyZSh0ZXh0dXJlUHJveHkuc2l6ZSwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCBmYWxzZSk7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgNjsgKytpKSB7XG5cdFx0XHRcdGlmIChtaXBtYXApIHtcblx0XHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoaSk7XG5cdFx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKHZhciBqOm51bWJlciA9IDA7IGogPCBsZW47IGorKylcblx0XHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2pdLCBpLCBqKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoaSksIGksIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBDb250ZXh0V2ViIGZvciB3aGljaCB3ZSByZXF1ZXN0IHRoZSBidWZmZXJcblx0ICogQHJldHVybiBUaGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0SW5kZXhCdWZmZXIoYnVmZmVyOkluZGV4RGF0YSk6SUluZGV4QnVmZmVyXG5cdHtcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XG5cblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlSW5kZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2VJbmRleERhdGEoYnVmZmVyOkluZGV4RGF0YSlcblx0e1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgYSBDb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIG1hbmFnZWQgZ2wgY2FudmFzLlxuXHQgKi9cblx0cHVibGljIHJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIilcblx0e1xuXHRcdC8vIElmIGZvcmNpbmcgc29mdHdhcmUsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXQgdGhlXG5cdFx0Ly8gcmV0dXJuZWQgQ29udGV4dCB3aWxsIGJlIHJ1bm5pbmcgc29mdHdhcmUgbW9kZS5cblx0XHQvLyBJZiBub3QsIHdlIGNhbid0IGJlIHN1cmUgYW5kIHNob3VsZCBzdGljayB0byB0aGVcblx0XHQvLyBvbGQgdmFsdWUgKHdpbGwgbGlrZWx5IGJlIHNhbWUgaWYgcmUtcmVxdWVzdGluZy4pXG5cblx0XHRpZiAodGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nICE9IG51bGwpXG5cdFx0XHR0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgPSBmb3JjZVNvZnR3YXJlO1xuXG5cdFx0dGhpcy5fcHJvZmlsZSA9IHByb2ZpbGU7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuRkxBU0gpXG5cdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLl9jb250ZXh0ID0gbmV3IENvbnRleHRXZWJHTCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lcik7XG5cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5BVVRPKVxuXHRcdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NhbGxiYWNrKHRoaXMuX2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3dpZHRoID0gdGhpcy5fdmlld1BvcnQud2lkdGggPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl94ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB5KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0cHVibGljIHNldCB2aXNpYmxlKHZhbDpib29sZWFuKVxuXHR7XG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXG5cdHtcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29udGV4dCgpOklDb250ZXh0R0xcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ZpZXdwb3J0RGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gdHJ1ZTtcblxuXHRcdC8vaWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKSlcblx0XHQvL3JldHVybjtcblxuXHRcdC8vaWYgKCFfdmlld3BvcnRVcGRhdGVkKVxuXHRcdHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCA9IG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fdmlld3BvcnRVcGRhdGVkKTtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RW50ZXJGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2VudGVyRnJhbWUpXG5cdFx0XHR0aGlzLl9lbnRlckZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVOVEVSX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9lbnRlckZyYW1lKTtcblxuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFeGl0RnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2V4aXRGcmFtZSlcblx0XHRcdHRoaXMuX2V4aXRGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FWElUX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9leGl0RnJhbWUpO1xuXHR9XG5cblx0cHVibGljIGdldCBwcm9maWxlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZmlsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlcyB0aGUgU3RhZ2Ugb2JqZWN0LCBmcmVlaW5nIHRoZSBDb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlci5pUmVtb3ZlU3RhZ2UodGhpcyk7XG5cdFx0dGhpcy5mcmVlQ29udGV4dCgpO1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IG51bGw7XG5cdFx0dGhpcy5fc3RhZ2VJbmRleCA9IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbmZpZ3VyZXMgdGhlIGJhY2sgYnVmZmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlcldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJIZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGFudGlBbGlhcyBUaGUgYW1vdW50IG9mIGFudGktYWxpYXNpbmcgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBiYWNrIGJ1ZmZlciBjb250YWlucyBhIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlci5cblx0ICovXG5cdHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aDpudW1iZXIsIGJhY2tCdWZmZXJIZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMud2lkdGggPSBiYWNrQnVmZmVyV2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBiYWNrQnVmZmVySGVpZ2h0O1xuXG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aCwgYmFja0J1ZmZlckhlaWdodCwgYW50aUFsaWFzLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHR9XG5cblx0Lypcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlciBpcyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbChlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJUYXJnZXQoKTpUZXh0dXJlQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlclRhcmdldDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyU3VyZmFjZVNlbGVjdG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyU3VyZmFjZVNlbGVjdG9yO1xuXHR9XG5cblx0Lypcblx0ICogQ2xlYXIgYW5kIHJlc2V0IHRoZSBiYWNrIGJ1ZmZlciB3aGVuIHVzaW5nIGEgc2hhcmVkIGNvbnRleHRcblx0ICovXG5cdHB1YmxpYyBjbGVhcigpXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodGhpcy5fYmFja0J1ZmZlckRpcnR5KSB7XG5cdFx0XHR0aGlzLmNvbmZpZ3VyZUJhY2tCdWZmZXIodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgdGhpcy5fYW50aUFsaWFzLCB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHRcdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5jbGVhcigoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAwMCApID4+PiAyNCwgLy8gPC0tLS0tLS0tLSBaZXJvLWZpbGwgcmlnaHQgc2hpZnRcblx0XHRcdFx0XHRcdFx0ICAoIHRoaXMuX2NvbG9yICYgMHhmZjAwMDAgKSA+Pj4gMTYsIC8vIDwtLS0tLS0tLS0tLS0tfFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAgKSA+Pj4gOCwgLy8gPC0tLS0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5fY29sb3IgJiAweGZmKTtcblxuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgb2JqZWN0IHdpdGggYW4gRXZlbnREaXNwYXRjaGVyIG9iamVjdCBzbyB0aGF0IHRoZSBsaXN0ZW5lciByZWNlaXZlcyBub3RpZmljYXRpb24gb2YgYW4gZXZlbnQuIFNwZWNpYWwgY2FzZSBmb3IgZW50ZXJmcmFtZSBhbmQgZXhpdGZyYW1lIGV2ZW50cyAtIHdpbGwgc3dpdGNoIFN0YWdlUHJveHkgaW50byBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIFlvdSBjYW4gcmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzIG9uIGFsbCBub2RlcyBpbiB0aGUgZGlzcGxheSBsaXN0IGZvciBhIHNwZWNpZmljIHR5cGUgb2YgZXZlbnQsIHBoYXNlLCBhbmQgcHJpb3JpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIHRoZSBldmVudC5cblx0ICogQHBhcmFtIHVzZUNhcHR1cmUgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3b3JrcyBpbiB0aGUgY2FwdHVyZSBwaGFzZSBvciB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMuIElmIHVzZUNhcHR1cmUgaXMgc2V0IHRvIHRydWUsIHRoZSBsaXN0ZW5lciBwcm9jZXNzZXMgdGhlIGV2ZW50IG9ubHkgZHVyaW5nIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCBub3QgaW4gdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gSWYgdXNlQ2FwdHVyZSBpcyBmYWxzZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIHRhcmdldCBvciBidWJibGluZyBwaGFzZS4gVG8gbGlzdGVuIGZvciB0aGUgZXZlbnQgaW4gYWxsIHRocmVlIHBoYXNlcywgY2FsbCBhZGRFdmVudExpc3RlbmVyIHR3aWNlLCBvbmNlIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gdHJ1ZSwgdGhlbiBhZ2FpbiB3aXRoIHVzZUNhcHR1cmUgc2V0IHRvIGZhbHNlLlxuXHQgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHByaW9yaXR5IGxldmVsIG9mIHRoZSBldmVudCBsaXN0ZW5lci4gVGhlIHByaW9yaXR5IGlzIGRlc2lnbmF0ZWQgYnkgYSBzaWduZWQgMzItYml0IGludGVnZXIuIFRoZSBoaWdoZXIgdGhlIG51bWJlciwgdGhlIGhpZ2hlciB0aGUgcHJpb3JpdHkuIEFsbCBsaXN0ZW5lcnMgd2l0aCBwcmlvcml0eSBuIGFyZSBwcm9jZXNzZWQgYmVmb3JlIGxpc3RlbmVycyBvZiBwcmlvcml0eSBuLTEuIElmIHR3byBvciBtb3JlIGxpc3RlbmVycyBzaGFyZSB0aGUgc2FtZSBwcmlvcml0eSwgdGhleSBhcmUgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQuIFRoZSBkZWZhdWx0IHByaW9yaXR5IGlzIDAuXG5cdCAqIEBwYXJhbSB1c2VXZWFrUmVmZXJlbmNlIERldGVybWluZXMgd2hldGhlciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBsaXN0ZW5lciBpcyBzdHJvbmcgb3Igd2Vhay4gQSBzdHJvbmcgcmVmZXJlbmNlICh0aGUgZGVmYXVsdCkgcHJldmVudHMgeW91ciBsaXN0ZW5lciBmcm9tIGJlaW5nIGdhcmJhZ2UtY29sbGVjdGVkLiBBIHdlYWsgcmVmZXJlbmNlIGRvZXMgbm90LlxuXHQgKi9cblx0cHVibGljIGFkZEV2ZW50TGlzdGVuZXIodHlwZTpzdHJpbmcsIGxpc3RlbmVyOkZ1bmN0aW9uKVxuXHR7XG5cdFx0c3VwZXIuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdhZGRFdmVudExpc3RlbmVyJyAsICAnRW50ZXJGcmFtZSwgRXhpdEZyYW1lJyk7XG5cblx0XHQvL2lmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICl7Ly8mJiAhIHRoaXMuX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0Ly9fZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXHRcdC8vfVxuXG5cdFx0LyogT3JpZ2luYWwgY29kZVxuXHRcdCBpZiAoKHR5cGUgPT0gRXZlbnQuRU5URVJfRlJBTUUgfHwgdHlwZSA9PSBFdmVudC5FWElUX0ZSQU1FKSAmJiAhIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKXtcblxuXHRcdCBfZnJhbWVFdmVudERyaXZlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCBvbkVudGVyRnJhbWUsIHVzZUNhcHR1cmUsIHByaW9yaXR5LCB1c2VXZWFrUmVmZXJlbmNlKTtcblxuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBvdXQgb2YgYXV0b21hdGljIHJlbmRlciBtb2RlLlxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaGluZyBsaXN0ZW5lciByZWdpc3RlcmVkIHdpdGggdGhlIEV2ZW50RGlzcGF0Y2hlciBvYmplY3QsIGEgY2FsbCB0byB0aGlzIG1ldGhvZCBoYXMgbm8gZWZmZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBldmVudC5cblx0ICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBvYmplY3QgdG8gcmVtb3ZlLlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBTcGVjaWZpZXMgd2hldGhlciB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdGhlIGxpc3RlbmVyIHdhcyByZWdpc3RlcmVkIGZvciBib3RoIHRoZSBjYXB0dXJlIHBoYXNlIGFuZCB0aGUgdGFyZ2V0IGFuZCBidWJibGluZyBwaGFzZXMsIHR3byBjYWxscyB0byByZW1vdmVFdmVudExpc3RlbmVyKCkgYXJlIHJlcXVpcmVkIHRvIHJlbW92ZSBib3RoLCBvbmUgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gdHJ1ZSwgYW5kIGFub3RoZXIgY2FsbCB3aXRoIHVzZUNhcHR1cmUoKSBzZXQgdG8gZmFsc2UuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8qXG5cdFx0IC8vIFJlbW92ZSB0aGUgbWFpbiByZW5kZXJpbmcgbGlzdGVuZXIgaWYgbm8gRW50ZXJGcmFtZSBsaXN0ZW5lcnMgcmVtYWluXG5cdFx0IGlmICggICAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUgLCB0aGlzLm9uRW50ZXJGcmFtZSAsIHRoaXMgKVxuXHRcdCAmJiAgISB0aGlzLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcykgKSAvLyYmIF9mcmFtZUV2ZW50RHJpdmVyLmhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdCB7XG5cblx0XHQgLy9fZnJhbWVFdmVudERyaXZlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FLCB0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyApO1xuXG5cdFx0IH1cblx0XHQgKi9cblx0fVxuXG5cdHB1YmxpYyBnZXQgc2Npc3NvclJlY3QoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY2lzc29yUmVjdDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgc2Npc3NvclJlY3QodmFsdWU6UmVjdGFuZ2xlKVxuXHR7XG5cdFx0dGhpcy5fc2Npc3NvclJlY3QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX2NvbnRleHQuc2V0U2Npc3NvclJlY3RhbmdsZSh0aGlzLl9zY2lzc29yUmVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGluZGV4IG9mIHRoZSBTdGFnZSB3aGljaCBpcyBtYW5hZ2VkIGJ5IHRoaXMgaW5zdGFuY2Ugb2YgU3RhZ2VQcm94eS5cblx0ICovXG5cdHB1YmxpYyBnZXQgc3RhZ2VJbmRleCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YWdlSW5kZXg7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIFN0YWdlIG1hbmFnZWQgYnkgdGhpcyBwcm94eSBpcyBydW5uaW5nIGluIHNvZnR3YXJlIG1vZGUuXG5cdCAqIFJlbWVtYmVyIHRvIHdhaXQgZm9yIHRoZSBDT05URVhUX0NSRUFURUQgZXZlbnQgYmVmb3JlIGNoZWNraW5nIHRoaXMgcHJvcGVydHksXG5cdCAqIGFzIG9ubHkgdGhlbiB3aWxsIGl0IGJlIGd1YXJhbnRlZWQgdG8gYmUgYWNjdXJhdGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVzZXNTb2Z0d2FyZVJlbmRlcmluZygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmc7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFudGlBbGlhc2luZyBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFudGlBbGlhcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FudGlBbGlhcztcblx0fVxuXG5cdHB1YmxpYyBzZXQgYW50aUFsaWFzKGFudGlBbGlhczpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9hbnRpQWxpYXMgPSBhbnRpQWxpYXM7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHZpZXdQb3J0IHJlY3RhbmdsZSBlcXVpdmFsZW50IG9mIHRoZSBTdGFnZSBzaXplIGFuZCBwb3NpdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgdmlld1BvcnQoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSBmYWxzZTtcblxuXHRcdHJldHVybiB0aGlzLl92aWV3UG9ydDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGNvbG9yKGNvbG9yOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2NvbG9yID0gY29sb3I7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZyZXNobHkgY2xlYXJlZCBzdGF0ZSBvZiB0aGUgYmFja2J1ZmZlciBiZWZvcmUgYW55IHJlbmRlcmluZ1xuXHQgKi9cblx0cHVibGljIGdldCBidWZmZXJDbGVhcigpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9idWZmZXJDbGVhcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYnVmZmVyQ2xlYXIobmV3QnVmZmVyQ2xlYXI6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2J1ZmZlckNsZWFyID0gbmV3QnVmZmVyQ2xlYXI7XG5cdH1cblxuXG5cdHB1YmxpYyByZWdpc3RlclByb2dyYW0ocHJvZ3JhbURhdGE6UHJvZ3JhbURhdGEpXG5cdHtcblx0XHR2YXIgaTpudW1iZXIgPSAwO1xuXHRcdHdoaWxlICh0aGlzLl9wcm9ncmFtRGF0YVtpXSAhPSBudWxsKVxuXHRcdFx0aSsrO1xuXG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFbaV0gPSBwcm9ncmFtRGF0YTtcblx0XHRwcm9ncmFtRGF0YS5pZCA9IGk7XG5cdH1cblxuXHRwdWJsaWMgdW5SZWdpc3RlclByb2dyYW0ocHJvZ3JhbURhdGE6UHJvZ3JhbURhdGEpXG5cdHtcblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtwcm9ncmFtRGF0YS5pZF0gPSBudWxsO1xuXHRcdHByb2dyYW1EYXRhLmlkID0gLTE7XG5cdH1cblxuXHQvKlxuXHQgKiBBY2Nlc3MgdG8gZmlyZSBtb3VzZWV2ZW50cyBhY3Jvc3MgbXVsdGlwbGUgbGF5ZXJlZCB2aWV3M0QgaW5zdGFuY2VzXG5cdCAqL1xuXHQvL1x0XHRwdWJsaWMgZ2V0IG1vdXNlM0RNYW5hZ2VyKCk6TW91c2UzRE1hbmFnZXJcblx0Ly9cdFx0e1xuXHQvL1x0XHRcdHJldHVybiB0aGlzLl9tb3VzZTNETWFuYWdlcjtcblx0Ly9cdFx0fVxuXHQvL1xuXHQvL1x0XHRwdWJsaWMgc2V0IG1vdXNlM0RNYW5hZ2VyKHZhbHVlOk1vdXNlM0RNYW5hZ2VyKVxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0dGhpcy5fbW91c2UzRE1hbmFnZXIgPSB2YWx1ZTtcblx0Ly9cdFx0fVxuXG5cdC8qIFRPRE86IGltcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cdCBwdWJsaWMgZ2V0IHRvdWNoM0RNYW5hZ2VyKCk6VG91Y2gzRE1hbmFnZXJcblx0IHtcblx0IHJldHVybiBfdG91Y2gzRE1hbmFnZXI7XG5cdCB9XG5cblx0IHB1YmxpYyBzZXQgdG91Y2gzRE1hbmFnZXIodmFsdWU6VG91Y2gzRE1hbmFnZXIpXG5cdCB7XG5cdCBfdG91Y2gzRE1hbmFnZXIgPSB2YWx1ZTtcblx0IH1cblx0ICovXG5cblx0LyoqXG5cdCAqIEZyZWVzIHRoZSBDb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGlzIFN0YWdlUHJveHkuXG5cdCAqL1xuXHRwcml2YXRlIGZyZWVDb250ZXh0KClcblx0e1xuXHRcdGlmICh0aGlzLl9jb250ZXh0KSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LmRpc3Bvc2UoKTtcblxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRleHQgPSBudWxsO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgRW50ZXJfRnJhbWUgaGFuZGxlciBmb3IgcHJvY2Vzc2luZyB0aGUgcHJveHkuRU5URVJfRlJBTUUgYW5kIHByb3h5LkVYSVRfRlJBTUUgZXZlbnQgaGFuZGxlcnMuXG5cdCAqIFR5cGljYWxseSB0aGUgcHJveHkuRU5URVJfRlJBTUUgbGlzdGVuZXIgd291bGQgcmVuZGVyIHRoZSBsYXllcnMgZm9yIHRoaXMgU3RhZ2UgaW5zdGFuY2UuXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShldmVudDpFdmVudClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIENsZWFyIHRoZSBzdGFnZSBpbnN0YW5jZVxuXHRcdHRoaXMuY2xlYXIoKTtcblx0XHQvL25vdGlmeSB0aGUgZW50ZXJmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUVudGVyRnJhbWUoKTtcblx0XHQvLyBDYWxsIHRoZSBwcmVzZW50KCkgdG8gcmVuZGVyIHRoZSBmcmFtZVxuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQucHJlc2VudCgpO1xuXHRcdC8vbm90aWZ5IHRoZSBleGl0ZnJhbWUgbGlzdGVuZXJzXG5cdFx0dGhpcy5ub3RpZnlFeGl0RnJhbWUoKTtcblx0fVxuXG5cdHB1YmxpYyByZWNvdmVyRnJvbURpc3Bvc2FsKCk6Ym9vbGVhblxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly9hd2F5LkRlYnVnLnRocm93UElSKCAnU3RhZ2VQcm94eScgLCAncmVjb3ZlckZyb21EaXNwb3NhbCcgLCAnJyApO1xuXG5cdFx0Lypcblx0XHQgaWYgKHRoaXMuX2lDb250ZXh0LmRyaXZlckluZm8gPT0gXCJEaXNwb3NlZFwiKVxuXHRcdCB7XG5cdFx0IHRoaXMuX2lDb250ZXh0ID0gbnVsbDtcblx0XHQgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuQ09OVEVYVF9ESVNQT1NFRCkpO1xuXHRcdCByZXR1cm4gZmFsc2U7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHRcdHJldHVybiB0cnVlO1xuXG5cdH1cblxuXHRwcml2YXRlIF9jYWxsYmFjayhjb250ZXh0OklDb250ZXh0R0wpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IHRoaXMuX2NvbnRleHQuY29udGFpbmVyO1xuXG5cdFx0Ly8gT25seSBjb25maWd1cmUgYmFjayBidWZmZXIgaWYgd2lkdGggYW5kIGhlaWdodCBoYXZlIGJlZW4gc2V0LFxuXHRcdC8vIHdoaWNoIHRoZXkgbWF5IG5vdCBoYXZlIGJlZW4gaWYgVmlldy5yZW5kZXIoKSBoYXMgeWV0IHRvIGJlXG5cdFx0Ly8gaW52b2tlZCBmb3IgdGhlIGZpcnN0IHRpbWUuXG5cdFx0aWYgKHRoaXMuX3dpZHRoICYmIHRoaXMuX2hlaWdodClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cblx0XHQvLyBEaXNwYXRjaCB0aGUgYXBwcm9wcmlhdGUgZXZlbnQgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY29udGV4dCB3YXNcblx0XHQvLyBjcmVhdGVkIGZvciB0aGUgZmlyc3QgdGltZSBvciByZWNyZWF0ZWQgYWZ0ZXIgYSBkZXZpY2UgbG9zcy5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQodGhpcy5faW5pdGlhbGlzZWQ/IFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQgOiBTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCkpO1xuXG5cdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXHR9XG5cblx0cHJpdmF0ZSBfc2V0U2FtcGxlclN0YXRlKGluZGV4Om51bWJlciwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcblx0e1xuXHRcdHZhciB3cmFwOnN0cmluZyA9IHJlcGVhdD8gQ29udGV4dEdMV3JhcE1vZGUuUkVQRUFUOkNvbnRleHRHTFdyYXBNb2RlLkNMQU1QO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gc21vb3RoPyBDb250ZXh0R0xUZXh0dXJlRmlsdGVyLkxJTkVBUiA6IENvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVDtcblx0XHR2YXIgbWlwZmlsdGVyOnN0cmluZyA9IG1pcG1hcD8gQ29udGV4dEdMTWlwRmlsdGVyLk1JUExJTkVBUiA6IENvbnRleHRHTE1pcEZpbHRlci5NSVBOT05FO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTYW1wbGVyU3RhdGVBdChpbmRleCwgd3JhcCwgZmlsdGVyLCBtaXBmaWx0ZXIpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlOyJdfQ==