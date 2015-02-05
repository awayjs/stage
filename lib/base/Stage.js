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
    Stage.prototype._setSamplerState = function (index, repeat, smooth, mipmap) {
        var wrap = repeat ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP;
        var filter = smooth ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST;
        var mipfilter = mipmap ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE;
        this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
    };
    Stage.prototype.activateRenderTexture = function (index, textureProxy) {
        this._setSamplerState(index, false, false, false);
        this._context.setTextureAt(index, this.getRenderTexture(textureProxy));
    };
    Stage.prototype.activateTexture = function (index, textureProxy, repeat, smooth, mipmap) {
        this._setSamplerState(index, repeat, smooth, mipmap);
        var textureData = this._texturePool.getItem(textureProxy);
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
        var textureData = this._texturePool.getItem(textureProxy);
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
    return Stage;
})(EventDispatcher);
module.exports = Stage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL3N0YWdlLnRzIl0sIm5hbWVzIjpbIlN0YWdlIiwiU3RhZ2UuY29uc3RydWN0b3IiLCJTdGFnZS5nZXRQcm9ncmFtRGF0YSIsIlN0YWdlLnNldFJlbmRlclRhcmdldCIsIlN0YWdlLmdldFJlbmRlclRleHR1cmUiLCJTdGFnZS5hY3RpdmF0ZUJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VWZXJ0ZXhEYXRhIiwiU3RhZ2UuX3NldFNhbXBsZXJTdGF0ZSIsIlN0YWdlLmFjdGl2YXRlUmVuZGVyVGV4dHVyZSIsIlN0YWdlLmFjdGl2YXRlVGV4dHVyZSIsIlN0YWdlLmFjdGl2YXRlQ3ViZVRleHR1cmUiLCJTdGFnZS5nZXRJbmRleEJ1ZmZlciIsIlN0YWdlLmRpc3Bvc2VJbmRleERhdGEiLCJTdGFnZS5yZXF1ZXN0Q29udGV4dCIsIlN0YWdlLndpZHRoIiwiU3RhZ2UuaGVpZ2h0IiwiU3RhZ2UueCIsIlN0YWdlLnkiLCJTdGFnZS52aXNpYmxlIiwiU3RhZ2UuY29udGFpbmVyIiwiU3RhZ2UuY29udGV4dCIsIlN0YWdlLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCIsIlN0YWdlLm5vdGlmeUVudGVyRnJhbWUiLCJTdGFnZS5ub3RpZnlFeGl0RnJhbWUiLCJTdGFnZS5wcm9maWxlIiwiU3RhZ2UuZGlzcG9zZSIsIlN0YWdlLmNvbmZpZ3VyZUJhY2tCdWZmZXIiLCJTdGFnZS5lbmFibGVEZXB0aEFuZFN0ZW5jaWwiLCJTdGFnZS5yZW5kZXJUYXJnZXQiLCJTdGFnZS5yZW5kZXJTdXJmYWNlU2VsZWN0b3IiLCJTdGFnZS5jbGVhciIsIlN0YWdlLmFkZEV2ZW50TGlzdGVuZXIiLCJTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyIiwiU3RhZ2Uuc2Npc3NvclJlY3QiLCJTdGFnZS5zdGFnZUluZGV4IiwiU3RhZ2UudXNlc1NvZnR3YXJlUmVuZGVyaW5nIiwiU3RhZ2UuYW50aUFsaWFzIiwiU3RhZ2Uudmlld1BvcnQiLCJTdGFnZS5jb2xvciIsIlN0YWdlLmJ1ZmZlckNsZWFyIiwiU3RhZ2UucmVnaXN0ZXJQcm9ncmFtIiwiU3RhZ2UudW5SZWdpc3RlclByb2dyYW0iLCJTdGFnZS5mcmVlQ29udGV4dCIsIlN0YWdlLm9uRW50ZXJGcmFtZSIsIlN0YWdlLnJlY292ZXJGcm9tRGlzcG9zYWwiLCJTdGFnZS5fY2FsbGJhY2siXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDakUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFDNUQsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRzVFLElBQU8sR0FBRyxXQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXhELElBQU8sV0FBVyxXQUFlLHdDQUF3QyxDQUFDLENBQUM7QUFDM0UsSUFBTyxVQUFVLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUV4RSxJQUFPLHNCQUFzQixXQUFZLGdEQUFnRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxrQkFBa0IsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3BGLElBQU8sc0JBQXNCLFdBQVksZ0RBQWdELENBQUMsQ0FBQztBQUMzRixJQUFPLGlCQUFpQixXQUFhLDJDQUEyQyxDQUFDLENBQUM7QUFDbEYsSUFBTyxjQUFjLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUM3RSxJQUFPLFlBQVksV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBUTFFLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFFL0UsSUFBTyxlQUFlLFdBQWMseUNBQXlDLENBQUMsQ0FBQztBQUkvRSxBQVFBOzs7Ozs7O0dBREc7SUFDRyxLQUFLO0lBQVNBLFVBQWRBLEtBQUtBLFVBQXdCQTtJQTBDbENBLFNBMUNLQSxLQUFLQSxDQTBDRUEsU0FBMkJBLEVBQUVBLFVBQWlCQSxFQUFFQSxZQUF5QkEsRUFBRUEsYUFBNkJBLEVBQUVBLE9BQTJCQTtRQUExREMsNkJBQTZCQSxHQUE3QkEscUJBQTZCQTtRQUFFQSx1QkFBMkJBLEdBQTNCQSxvQkFBMkJBO1FBRWhKQSxpQkFBT0EsQ0FBQ0E7UUExQ0RBLGlCQUFZQSxHQUFzQkEsSUFBSUEsS0FBS0EsRUFBZUEsQ0FBQ0E7UUFPM0RBLE9BQUVBLEdBQVVBLENBQUNBLENBQUNBO1FBQ2RBLE9BQUVBLEdBQVVBLENBQUNBLENBQUNBO1FBRXRCQSwyR0FBMkdBO1FBRW5HQSxnQkFBV0EsR0FBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFLeEJBLGVBQVVBLEdBQVVBLENBQUNBLENBQUNBO1FBSTlCQSxnR0FBZ0dBO1FBQ2hHQSx5RkFBeUZBO1FBQ2pGQSxrQkFBYUEsR0FBb0JBLElBQUlBLENBQUNBO1FBQ3RDQSwyQkFBc0JBLEdBQVVBLENBQUNBLENBQUNBO1FBVzFDQSx1REFBdURBO1FBQ3ZEQSxzRkFBc0ZBO1FBRTlFQSxpQkFBWUEsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFNcENBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLGVBQWVBLEVBQUVBLENBQUNBO1FBQzFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRWxEQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUU1QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsVUFBVUEsQ0FBQ0E7UUFFOUJBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLFlBQVlBLENBQUNBO1FBRWxDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUVqQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUVuQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBRXBDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7SUFFTUQsOEJBQWNBLEdBQXJCQSxVQUFzQkEsWUFBbUJBLEVBQUVBLGNBQXFCQTtRQUUvREUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUNwRUEsQ0FBQ0E7SUFFTUYsK0JBQWVBLEdBQXRCQSxVQUF1QkEsTUFBdUJBLEVBQUVBLHFCQUFxQ0EsRUFBRUEsZUFBMEJBO1FBQWpFRyxxQ0FBcUNBLEdBQXJDQSw2QkFBcUNBO1FBQUVBLCtCQUEwQkEsR0FBMUJBLG1CQUEwQkE7UUFFaEhBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEtBQUtBLE1BQU1BLElBQUlBLGVBQWVBLElBQUlBLElBQUlBLENBQUNBLHNCQUFzQkEsSUFBSUEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxJQUFJQSxxQkFBcUJBLENBQUNBO1lBQzNJQSxNQUFNQSxDQUFDQTtRQUVSQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUM1QkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxlQUFlQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxxQkFBcUJBLENBQUNBO1FBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxZQUFZQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQWlCQSxNQUFNQSxDQUFDQSxFQUFFQSxxQkFBcUJBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO1FBQzFJQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxxQkFBcUJBLEVBQUVBLENBQUNBO1lBQ3RDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7UUFDbkdBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRU1ILGdDQUFnQkEsR0FBdkJBLFVBQXdCQSxZQUEwQkE7UUFFakRJLElBQUlBLFdBQVdBLEdBQWVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBRXRFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQTtZQUN4QkEsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsc0JBQXNCQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUUvSEEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURKOzs7Ozs7OztPQVFHQTtJQUNJQSw4QkFBY0EsR0FBckJBLFVBQXNCQSxLQUFZQSxFQUFFQSxNQUFpQkEsRUFBRUEsTUFBYUEsRUFBRUEsTUFBYUE7UUFFbEZLLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUVuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsRUFBRUEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7WUFDbklBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7WUFDMUdBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBO1FBQzFDQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQzFGQSxDQUFDQTtJQUVNTCxpQ0FBaUJBLEdBQXhCQSxVQUF5QkEsTUFBaUJBO1FBRXpDTSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUMzQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRU9OLGdDQUFnQkEsR0FBeEJBLFVBQXlCQSxLQUFZQSxFQUFFQSxNQUFjQSxFQUFFQSxNQUFjQSxFQUFFQSxNQUFjQTtRQUVwRk8sSUFBSUEsSUFBSUEsR0FBVUEsTUFBTUEsR0FBRUEsaUJBQWlCQSxDQUFDQSxNQUFNQSxHQUFDQSxpQkFBaUJBLENBQUNBLEtBQUtBLENBQUNBO1FBQzNFQSxJQUFJQSxNQUFNQSxHQUFVQSxNQUFNQSxHQUFFQSxzQkFBc0JBLENBQUNBLE1BQU1BLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDM0ZBLElBQUlBLFNBQVNBLEdBQVVBLE1BQU1BLEdBQUVBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsR0FBR0Esa0JBQWtCQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUV6RkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFFTVAscUNBQXFCQSxHQUE1QkEsVUFBNkJBLEtBQVlBLEVBQUVBLFlBQTBCQTtRQUVwRVEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUVsREEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7SUFFTVIsK0JBQWVBLEdBQXRCQSxVQUF1QkEsS0FBWUEsRUFBRUEsWUFBMEJBLEVBQUVBLE1BQWNBLEVBQUVBLE1BQWNBLEVBQUVBLE1BQWNBO1FBRTlHUyxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBRXJEQSxJQUFJQSxXQUFXQSxHQUE2QkEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFFcEZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxhQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxzQkFBc0JBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQzlIQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM1QkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLFdBQVdBLENBQUNBLE9BQU9BLEdBQUdBLEtBQUtBLENBQUNBO1lBQzVCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDWkEsSUFBSUEsVUFBVUEsR0FBcUJBLFlBQVlBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBO2dCQUNsRUEsSUFBSUEsR0FBR0EsR0FBVUEsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7Z0JBQ25DQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQSxFQUFFQTtvQkFDdEJBLFdBQVdBLENBQUNBLE9BQVFBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BFQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDS0EsV0FBV0EsQ0FBQ0EsT0FBUUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBRU1ULG1DQUFtQkEsR0FBMUJBLFVBQTJCQSxLQUFZQSxFQUFFQSxZQUE0QkEsRUFBRUEsTUFBY0EsRUFBRUEsTUFBY0E7UUFFcEdVLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFcERBLElBQUlBLFdBQVdBLEdBQTZCQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUVwRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLFdBQVdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsc0JBQXNCQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUM3R0EsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUM1QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7Z0JBQ25DQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDWkEsSUFBSUEsVUFBVUEsR0FBcUJBLFlBQVlBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNuRUEsSUFBSUEsR0FBR0EsR0FBVUEsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7b0JBQ25DQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQSxFQUFFQTt3QkFDbEJBLFdBQVdBLENBQUNBLE9BQVFBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzRUEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNTQSxXQUFXQSxDQUFDQSxPQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxZQUFZQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUM3RkEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBRURWOzs7O09BSUdBO0lBQ0lBLDhCQUFjQSxHQUFyQkEsVUFBc0JBLE1BQWdCQTtRQUVyQ1csRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBRW5EQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUN2RkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekNBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNyRkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDMUNBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUVNWCxnQ0FBZ0JBLEdBQXZCQSxVQUF3QkEsTUFBZ0JBO1FBRXZDWSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUMzQ0EsTUFBTUEs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QUVBQSxrRUFGa0VBO1FBQ2xFQSwrREFBK0RBO1FBQy9EQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFFQSxVQUFVQSxDQUFDQSxpQkFBaUJBLEdBQUdBLFVBQVVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1FBRWpIQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7SUFDRjdDLFlBQUNBO0FBQURBLENBdnVCQSxBQXV1QkNBLEVBdnVCbUIsZUFBZSxFQXV1QmxDO0FBRUQsQUFBZSxpQkFBTixLQUFLLENBQUMiLCJmaWxlIjoiYmFzZS9TdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9SZWN0YW5nbGVcIik7XG5pbXBvcnQgRXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XG5pbXBvcnQgQ3ViZVRleHR1cmVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQ3ViZVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IFJlbmRlclRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9SZW5kZXJUZXh0dXJlXCIpO1xuaW1wb3J0IFRleHR1cmUyREJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlMkRCYXNlXCIpO1xuaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlUHJveHlCYXNlXCIpO1xuaW1wb3J0IENTU1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0NTU1wiKTtcblxuaW1wb3J0IENvbnRleHRNb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9kaXNwbGF5L0NvbnRleHRNb2RlXCIpO1xuaW1wb3J0IFN0YWdlRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2V2ZW50cy9TdGFnZUV2ZW50XCIpO1xuXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0XCIpO1xuaW1wb3J0IENvbnRleHRHTE1pcEZpbHRlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTE1pcEZpbHRlclwiKTtcbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRmlsdGVyXHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGaWx0ZXJcIik7XG5pbXBvcnQgQ29udGV4dEdMV3JhcE1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xXcmFwTW9kZVwiKTtcbmltcG9ydCBDb250ZXh0U3RhZ2UzRFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgQ29udGV4dFdlYkdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRXZWJHTFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XG5pbXBvcnQgSUN1YmVUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJSW5kZXhCdWZmZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUluZGV4QnVmZmVyXCIpO1xuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgSVRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBJbmRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW5kZXhEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1RleHR1cmVEYXRhXCIpO1xuaW1wb3J0IFRleHR1cmVEYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVGV4dHVyZURhdGFQb29sXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFQb29sXCIpO1xuaW1wb3J0IFZlcnRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvVmVydGV4RGF0YVwiKTtcbmltcG9ydCBTdGFnZU1hbmFnZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcblxuLyoqXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxuICogYnV0IHJlcXVlc3RlZCB0aHJvdWdoIFN0YWdlTWFuYWdlci5cbiAqXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXG4gKlxuICovXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9wcm9ncmFtRGF0YTpBcnJheTxQcm9ncmFtRGF0YT4gPSBuZXcgQXJyYXk8UHJvZ3JhbURhdGE+KCk7XG5cdHByaXZhdGUgX3RleHR1cmVQb29sOlRleHR1cmVEYXRhUG9vbDtcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGFQb29sOlByb2dyYW1EYXRhUG9vbDtcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dEdMO1xuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgX3dpZHRoOm51bWJlcjtcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcblx0cHJpdmF0ZSBfeDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF95Om51bWJlciA9IDA7XG5cblx0Ly9wcml2YXRlIHN0YXRpYyBfZnJhbWVFdmVudERyaXZlcjpTaGFwZSA9IG5ldyBTaGFwZSgpOyAvLyBUT0RPOiBhZGQgZnJhbWUgZHJpdmVyIC8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcblxuXHRwcml2YXRlIF9zdGFnZUluZGV4Om51bWJlciA9IC0xO1xuXG5cdHByaXZhdGUgX3VzZXNTb2Z0d2FyZVJlbmRlcmluZzpib29sZWFuO1xuXHRwcml2YXRlIF9wcm9maWxlOnN0cmluZztcblx0cHJpdmF0ZSBfc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlcjtcblx0cHJpdmF0ZSBfYW50aUFsaWFzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2VuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuO1xuXHRwcml2YXRlIF9jb250ZXh0UmVxdWVzdGVkOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVmVydGV4QnVmZmVycyA6IFZlY3Rvci48VmVydGV4QnVmZmVyPiA9IG5ldyBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4oOCwgdHJ1ZSk7XG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVRleHR1cmVzIDogVmVjdG9yLjxUZXh0dXJlQmFzZT4gPSBuZXcgVmVjdG9yLjxUZXh0dXJlQmFzZT4oOCwgdHJ1ZSk7XG5cdHByaXZhdGUgX3JlbmRlclRhcmdldDpUZXh0dXJlUHJveHlCYXNlID0gbnVsbDtcblx0cHJpdmF0ZSBfcmVuZGVyU3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3NjaXNzb3JSZWN0OlJlY3RhbmdsZTtcblx0cHJpdmF0ZSBfY29sb3I6bnVtYmVyO1xuXHRwcml2YXRlIF9iYWNrQnVmZmVyRGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9lbnRlckZyYW1lOkV2ZW50O1xuXHRwcml2YXRlIF9leGl0RnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0VXBkYXRlZDpTdGFnZUV2ZW50O1xuXHRwcml2YXRlIF92aWV3cG9ydERpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX2J1ZmZlckNsZWFyOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIF9tb3VzZTNETWFuYWdlcjphd2F5Lm1hbmFnZXJzLk1vdXNlM0RNYW5hZ2VyO1xuXHQvL3ByaXZhdGUgX3RvdWNoM0RNYW5hZ2VyOlRvdWNoM0RNYW5hZ2VyOyAvL1RPRE86IGltZXBsZW1lbnQgZGVwZW5kZW5jeSBUb3VjaDNETWFuYWdlclxuXG5cdHByaXZhdGUgX2luaXRpYWxpc2VkOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihjb250YWluZXI6SFRNTENhbnZhc0VsZW1lbnQsIHN0YWdlSW5kZXg6bnVtYmVyLCBzdGFnZU1hbmFnZXI6U3RhZ2VNYW5hZ2VyLCBmb3JjZVNvZnR3YXJlOmJvb2xlYW4gPSBmYWxzZSwgcHJvZmlsZTpzdHJpbmcgPSBcImJhc2VsaW5lXCIpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fdGV4dHVyZVBvb2wgPSBuZXcgVGV4dHVyZURhdGFQb29sKCk7XG5cdFx0dGhpcy5fcHJvZ3JhbURhdGFQb29sID0gbmV3IFByb2dyYW1EYXRhUG9vbCh0aGlzKTtcblxuXHRcdHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcblxuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSBzdGFnZUluZGV4O1xuXG5cdFx0dGhpcy5fc3RhZ2VNYW5hZ2VyID0gc3RhZ2VNYW5hZ2VyO1xuXG5cdFx0dGhpcy5fdmlld1BvcnQgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSB0cnVlO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRYKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgMCk7XG5cblx0XHR0aGlzLnZpc2libGUgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldFByb2dyYW1EYXRhKHZlcnRleFN0cmluZzpzdHJpbmcsIGZyYWdtZW50U3RyaW5nOnN0cmluZyk6UHJvZ3JhbURhdGFcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9ncmFtRGF0YVBvb2wuZ2V0SXRlbSh2ZXJ0ZXhTdHJpbmcsIGZyYWdtZW50U3RyaW5nKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRSZW5kZXJUYXJnZXQodGFyZ2V0OlRleHR1cmVQcm94eUJhc2UsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gZmFsc2UsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3JlbmRlclRhcmdldCA9PT0gdGFyZ2V0ICYmIHN1cmZhY2VTZWxlY3RvciA9PSB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgJiYgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID09IGVuYWJsZURlcHRoQW5kU3RlbmNpbClcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3JlbmRlclRhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgPSBzdXJmYWNlU2VsZWN0b3I7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHRcdGlmICh0YXJnZXQgaW5zdGFuY2VvZiBSZW5kZXJUZXh0dXJlKSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvVGV4dHVyZSh0aGlzLmdldFJlbmRlclRleHR1cmUoPFJlbmRlclRleHR1cmU+IHRhcmdldCksIGVuYWJsZURlcHRoQW5kU3RlbmNpbCwgdGhpcy5fYW50aUFsaWFzLCBzdXJmYWNlU2VsZWN0b3IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9jb250ZXh0LnNldFJlbmRlclRvQmFja0J1ZmZlcigpO1xuXHRcdFx0dGhpcy5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZ2V0UmVuZGVyVGV4dHVyZSh0ZXh0dXJlUHJveHk6UmVuZGVyVGV4dHVyZSk6SVRleHR1cmVCYXNlXG5cdHtcblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSB0aGlzLl90ZXh0dXJlUG9vbC5nZXRJdGVtKHRleHR1cmVQcm94eSk7XG5cblx0XHRpZiAoIXRleHR1cmVEYXRhLnRleHR1cmUpXG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVUZXh0dXJlKHRleHR1cmVQcm94eS53aWR0aCwgdGV4dHVyZVByb3h5LmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKTtcblxuXHRcdHJldHVybiB0ZXh0dXJlRGF0YS50ZXh0dXJlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFzc2lnbnMgYW4gYXR0cmlidXRlIHN0cmVhbVxuXHQgKlxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGF0dHJpYnV0ZSBzdHJlYW0gaW5kZXggZm9yIHRoZSB2ZXJ0ZXggc2hhZGVyXG5cdCAqIEBwYXJhbSBidWZmZXJcblx0ICogQHBhcmFtIG9mZnNldFxuXHQgKiBAcGFyYW0gc3RyaWRlXG5cdCAqIEBwYXJhbSBmb3JtYXRcblx0ICovXG5cdHB1YmxpYyBhY3RpdmF0ZUJ1ZmZlcihpbmRleDpudW1iZXIsIGJ1ZmZlcjpWZXJ0ZXhEYXRhLCBvZmZzZXQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nKVxuXHR7XG5cdFx0aWYgKCFidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0pXG5cdFx0XHRidWZmZXIuY29udGV4dHNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0O1xuXG5cdFx0aWYgKCFidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSkge1xuXHRcdFx0YnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0gPSB0aGlzLl9jb250ZXh0LmNyZWF0ZVZlcnRleEJ1ZmZlcihidWZmZXIuZGF0YS5sZW5ndGgvYnVmZmVyLmRhdGFQZXJWZXJ0ZXgsIGJ1ZmZlci5kYXRhUGVyVmVydGV4KTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoL2J1ZmZlci5kYXRhUGVyVmVydGV4KTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRWZXJ0ZXhCdWZmZXJBdChpbmRleCwgYnVmZmVyLmJ1ZmZlcnNbdGhpcy5fc3RhZ2VJbmRleF0sIG9mZnNldCwgZm9ybWF0KTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlVmVydGV4RGF0YShidWZmZXI6VmVydGV4RGF0YSlcblx0e1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHRwcml2YXRlIF9zZXRTYW1wbGVyU3RhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dmFyIHdyYXA6c3RyaW5nID0gcmVwZWF0PyBDb250ZXh0R0xXcmFwTW9kZS5SRVBFQVQ6Q29udGV4dEdMV3JhcE1vZGUuQ0xBTVA7XG5cdFx0dmFyIGZpbHRlcjpzdHJpbmcgPSBzbW9vdGg/IENvbnRleHRHTFRleHR1cmVGaWx0ZXIuTElORUFSIDogQ29udGV4dEdMVGV4dHVyZUZpbHRlci5ORUFSRVNUO1xuXHRcdHZhciBtaXBmaWx0ZXI6c3RyaW5nID0gbWlwbWFwPyBDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTElORUFSIDogQ29udGV4dEdMTWlwRmlsdGVyLk1JUE5PTkU7XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFNhbXBsZXJTdGF0ZUF0KGluZGV4LCB3cmFwLCBmaWx0ZXIsIG1pcGZpbHRlcik7XG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGVSZW5kZXJUZXh0dXJlKGluZGV4Om51bWJlciwgdGV4dHVyZVByb3h5OlJlbmRlclRleHR1cmUpXG5cdHtcblx0XHR0aGlzLl9zZXRTYW1wbGVyU3RhdGUoaW5kZXgsIGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRoaXMuZ2V0UmVuZGVyVGV4dHVyZSh0ZXh0dXJlUHJveHkpKTtcblx0fVxuXG5cdHB1YmxpYyBhY3RpdmF0ZVRleHR1cmUoaW5kZXg6bnVtYmVyLCB0ZXh0dXJlUHJveHk6VGV4dHVyZTJEQmFzZSwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX3NldFNhbXBsZXJTdGF0ZShpbmRleCwgcmVwZWF0LCBzbW9vdGgsIG1pcG1hcCk7XG5cblx0XHR2YXIgdGV4dHVyZURhdGE6VGV4dHVyZURhdGEgPSA8VGV4dHVyZURhdGE+IHRoaXMuX3RleHR1cmVQb29sLmdldEl0ZW0odGV4dHVyZVByb3h5KTtcblxuXHRcdGlmICghdGV4dHVyZURhdGEudGV4dHVyZSkge1xuXHRcdFx0dGV4dHVyZURhdGEudGV4dHVyZSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlVGV4dHVyZSh0ZXh0dXJlUHJveHkud2lkdGgsIHRleHR1cmVQcm94eS5oZWlnaHQsIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQkdSQSwgdHJ1ZSk7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0aWYgKG1pcG1hcCkge1xuXHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoKTtcblx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHRcdFx0KDxJVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEobWlwbWFwRGF0YVtpXSwgaSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQoPElUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YSh0ZXh0dXJlUHJveHkuX2lHZXRUZXh0dXJlRGF0YSgpLCAwKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LnNldFRleHR1cmVBdChpbmRleCwgdGV4dHVyZURhdGEudGV4dHVyZSk7XG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGVDdWJlVGV4dHVyZShpbmRleDpudW1iZXIsIHRleHR1cmVQcm94eTpDdWJlVGV4dHVyZUJhc2UsIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX3NldFNhbXBsZXJTdGF0ZShpbmRleCwgZmFsc2UsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdHZhciB0ZXh0dXJlRGF0YTpUZXh0dXJlRGF0YSA9IDxUZXh0dXJlRGF0YT4gdGhpcy5fdGV4dHVyZVBvb2wuZ2V0SXRlbSh0ZXh0dXJlUHJveHkpO1xuXG5cdFx0aWYgKCF0ZXh0dXJlRGF0YS50ZXh0dXJlKSB7XG5cdFx0XHR0ZXh0dXJlRGF0YS50ZXh0dXJlID0gdGhpcy5fY29udGV4dC5jcmVhdGVDdWJlVGV4dHVyZSh0ZXh0dXJlUHJveHkuc2l6ZSwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCBmYWxzZSk7XG5cdFx0XHR0ZXh0dXJlRGF0YS5pbnZhbGlkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGV4dHVyZURhdGEuaW52YWxpZCkge1xuXHRcdFx0dGV4dHVyZURhdGEuaW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgNjsgKytpKSB7XG5cdFx0XHRcdGlmIChtaXBtYXApIHtcblx0XHRcdFx0XHR2YXIgbWlwbWFwRGF0YTpBcnJheTxCaXRtYXBEYXRhPiA9IHRleHR1cmVQcm94eS5faUdldE1pcG1hcERhdGEoaSk7XG5cdFx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKHZhciBqOm51bWJlciA9IDA7IGogPCBsZW47IGorKylcblx0XHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0ZXh0dXJlRGF0YS50ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2pdLCBpLCBqKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGV4dHVyZURhdGEudGV4dHVyZSkudXBsb2FkRnJvbURhdGEodGV4dHVyZVByb3h5Ll9pR2V0VGV4dHVyZURhdGEoaSksIGksIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRUZXh0dXJlQXQoaW5kZXgsIHRleHR1cmVEYXRhLnRleHR1cmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBDb250ZXh0V2ViIGZvciB3aGljaCB3ZSByZXF1ZXN0IHRoZSBidWZmZXJcblx0ICogQHJldHVybiBUaGUgVmVydGV4QnVmZmVyIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRyaWFuZ2xlIGluZGljZXMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0SW5kZXhCdWZmZXIoYnVmZmVyOkluZGV4RGF0YSk6SUluZGV4QnVmZmVyXG5cdHtcblx0XHRpZiAoIWJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSlcblx0XHRcdGJ1ZmZlci5jb250ZXh0c1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQ7XG5cblx0XHRpZiAoIWJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdKSB7XG5cdFx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IHRoaXMuX2NvbnRleHQuY3JlYXRlSW5kZXhCdWZmZXIoYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoYnVmZmVyLmludmFsaWRbdGhpcy5fc3RhZ2VJbmRleF0pIHtcblx0XHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLnVwbG9hZEZyb21BcnJheShidWZmZXIuZGF0YSwgMCwgYnVmZmVyLmRhdGEubGVuZ3RoKTtcblx0XHRcdGJ1ZmZlci5pbnZhbGlkW3RoaXMuX3N0YWdlSW5kZXhdID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2VJbmRleERhdGEoYnVmZmVyOkluZGV4RGF0YSlcblx0e1xuXHRcdGJ1ZmZlci5idWZmZXJzW3RoaXMuX3N0YWdlSW5kZXhdLmRpc3Bvc2UoKTtcblx0XHRidWZmZXIuYnVmZmVyc1t0aGlzLl9zdGFnZUluZGV4XSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgYSBDb250ZXh0IG9iamVjdCB0byBhdHRhY2ggdG8gdGhlIG1hbmFnZWQgZ2wgY2FudmFzLlxuXHQgKi9cblx0cHVibGljIHJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmU6Ym9vbGVhbiA9IGZhbHNlLCBwcm9maWxlOnN0cmluZyA9IFwiYmFzZWxpbmVcIiwgbW9kZTpzdHJpbmcgPSBcImF1dG9cIilcblx0e1xuXHRcdC8vIElmIGZvcmNpbmcgc29mdHdhcmUsIHdlIGNhbiBiZSBjZXJ0YWluIHRoYXQgdGhlXG5cdFx0Ly8gcmV0dXJuZWQgQ29udGV4dCB3aWxsIGJlIHJ1bm5pbmcgc29mdHdhcmUgbW9kZS5cblx0XHQvLyBJZiBub3QsIHdlIGNhbid0IGJlIHN1cmUgYW5kIHNob3VsZCBzdGljayB0byB0aGVcblx0XHQvLyBvbGQgdmFsdWUgKHdpbGwgbGlrZWx5IGJlIHNhbWUgaWYgcmUtcmVxdWVzdGluZy4pXG5cblx0XHRpZiAodGhpcy5fdXNlc1NvZnR3YXJlUmVuZGVyaW5nICE9IG51bGwpXG5cdFx0XHR0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgPSBmb3JjZVNvZnR3YXJlO1xuXG5cdFx0dGhpcy5fcHJvZmlsZSA9IHByb2ZpbGU7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuRkxBU0gpXG5cdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLl9jb250ZXh0ID0gbmV3IENvbnRleHRXZWJHTCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lcik7XG5cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5BVVRPKVxuXHRcdFx0XHRcdG5ldyBDb250ZXh0U3RhZ2UzRCg8SFRNTENhbnZhc0VsZW1lbnQ+IHRoaXMuX2NvbnRhaW5lciwgKGNvbnRleHQ6SUNvbnRleHRHTCkgPT4gdGhpcy5fY2FsbGJhY2soY29udGV4dCkpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEV2ZW50LkVSUk9SKSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NhbGxiYWNrKHRoaXMuX2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFdpZHRoKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3dpZHRoID0gdGhpcy5fdmlld1BvcnQud2lkdGggPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudEhlaWdodCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWV3UG9ydC5oZWlnaHQgPSB2YWw7XG5cblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgeCBwb3NpdGlvbiBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHgoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3g7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl94ID09IHZhbClcblx0XHRcdHJldHVybjtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl94ID0gdGhpcy5fdmlld1BvcnQueCA9IHZhbDtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHkgcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB5KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl95O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feSA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFkodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feSA9IHRoaXMuX3ZpZXdQb3J0LnkgPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0cHVibGljIHNldCB2aXNpYmxlKHZhbDpib29sZWFuKVxuXHR7XG5cdFx0Q1NTLnNldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgdmlzaWJsZSgpXG5cdHtcblx0XHRyZXR1cm4gQ1NTLmdldEVsZW1lbnRWaXNpYmlsaXR5KHRoaXMuX2NvbnRhaW5lcik7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb250ZXh0IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29udGV4dCgpOklDb250ZXh0R0xcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250ZXh0O1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ZpZXdwb3J0RGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl92aWV3cG9ydERpcnR5ID0gdHJ1ZTtcblxuXHRcdC8vaWYgKCF0aGlzLmhhc0V2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVEKSlcblx0XHQvL3JldHVybjtcblxuXHRcdC8vaWYgKCFfdmlld3BvcnRVcGRhdGVkKVxuXHRcdHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCA9IG5ldyBTdGFnZUV2ZW50KFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fdmlld3BvcnRVcGRhdGVkKTtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RW50ZXJGcmFtZSgpXG5cdHtcblx0XHQvL2lmICghaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2VudGVyRnJhbWUpXG5cdFx0XHR0aGlzLl9lbnRlckZyYW1lID0gbmV3IEV2ZW50KEV2ZW50LkVOVEVSX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9lbnRlckZyYW1lKTtcblxuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlFeGl0RnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRVhJVF9GUkFNRSkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHRpZiAoIXRoaXMuX2V4aXRGcmFtZSlcblx0XHRcdHRoaXMuX2V4aXRGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FWElUX0ZSQU1FKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9leGl0RnJhbWUpO1xuXHR9XG5cblx0cHVibGljIGdldCBwcm9maWxlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZmlsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlcyB0aGUgU3RhZ2Ugb2JqZWN0LCBmcmVlaW5nIHRoZSBDb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlci5pUmVtb3ZlU3RhZ2UodGhpcyk7XG5cdFx0dGhpcy5mcmVlQ29udGV4dCgpO1xuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IG51bGw7XG5cdFx0dGhpcy5fc3RhZ2VJbmRleCA9IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbmZpZ3VyZXMgdGhlIGJhY2sgYnVmZmVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gYmFja0J1ZmZlcldpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJIZWlnaHQgVGhlIGhlaWdodCBvZiB0aGUgYmFja2J1ZmZlci5cblx0ICogQHBhcmFtIGFudGlBbGlhcyBUaGUgYW1vdW50IG9mIGFudGktYWxpYXNpbmcgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBiYWNrIGJ1ZmZlciBjb250YWlucyBhIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlci5cblx0ICovXG5cdHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aDpudW1iZXIsIGJhY2tCdWZmZXJIZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMud2lkdGggPSBiYWNrQnVmZmVyV2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBiYWNrQnVmZmVySGVpZ2h0O1xuXG5cdFx0dGhpcy5fYW50aUFsaWFzID0gYW50aUFsaWFzO1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblxuXHRcdGlmICh0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKGJhY2tCdWZmZXJXaWR0aCwgYmFja0J1ZmZlckhlaWdodCwgYW50aUFsaWFzLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwpO1xuXHR9XG5cblx0Lypcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRlcHRoIGFuZCBzdGVuY2lsIGJ1ZmZlciBpcyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGVuYWJsZURlcHRoQW5kU3RlbmNpbChlbmFibGVEZXB0aEFuZFN0ZW5jaWw6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCA9IGVuYWJsZURlcHRoQW5kU3RlbmNpbDtcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJUYXJnZXQoKTpUZXh0dXJlUHJveHlCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyVGFyZ2V0O1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJTdXJmYWNlU2VsZWN0b3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3I7XG5cdH1cblxuXHQvKlxuXHQgKiBDbGVhciBhbmQgcmVzZXQgdGhlIGJhY2sgYnVmZmVyIHdoZW4gdXNpbmcgYSBzaGFyZWQgY29udGV4dFxuXHQgKi9cblx0cHVibGljIGNsZWFyKClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9iYWNrQnVmZmVyRGlydHkpIHtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LmNsZWFyKCggdGhpcy5fY29sb3IgJiAweGZmMDAwMDAwICkgPj4+IDI0LCAvLyA8LS0tLS0tLS0tIFplcm8tZmlsbCByaWdodCBzaGlmdFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAwMCApID4+PiAxNiwgLy8gPC0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMCApID4+PiA4LCAvLyA8LS0tLS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9jb2xvciAmIDB4ZmYpO1xuXG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvYmplY3Qgd2l0aCBhbiBFdmVudERpc3BhdGNoZXIgb2JqZWN0IHNvIHRoYXQgdGhlIGxpc3RlbmVyIHJlY2VpdmVzIG5vdGlmaWNhdGlvbiBvZiBhbiBldmVudC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBpbnRvIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogWW91IGNhbiByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgb24gYWxsIG5vZGVzIGluIHRoZSBkaXNwbGF5IGxpc3QgZm9yIGEgc3BlY2lmaWMgdHlwZSBvZiBldmVudCwgcGhhc2UsIGFuZCBwcmlvcml0eS5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgdGhlIGV2ZW50LlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdvcmtzIGluIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdXNlQ2FwdHVyZSBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIGNhcHR1cmUgcGhhc2UgYW5kIG5vdCBpbiB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBJZiB1c2VDYXB0dXJlIGlzIGZhbHNlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBUbyBsaXN0ZW4gZm9yIHRoZSBldmVudCBpbiBhbGwgdGhyZWUgcGhhc2VzLCBjYWxsIGFkZEV2ZW50TGlzdGVuZXIgdHdpY2UsIG9uY2Ugd2l0aCB1c2VDYXB0dXJlIHNldCB0byB0cnVlLCB0aGVuIGFnYWluIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gZmFsc2UuXG5cdCAqIEBwYXJhbSBwcmlvcml0eSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBUaGUgcHJpb3JpdHkgaXMgZGVzaWduYXRlZCBieSBhIHNpZ25lZCAzMi1iaXQgaW50ZWdlci4gVGhlIGhpZ2hlciB0aGUgbnVtYmVyLCB0aGUgaGlnaGVyIHRoZSBwcmlvcml0eS4gQWxsIGxpc3RlbmVycyB3aXRoIHByaW9yaXR5IG4gYXJlIHByb2Nlc3NlZCBiZWZvcmUgbGlzdGVuZXJzIG9mIHByaW9yaXR5IG4tMS4gSWYgdHdvIG9yIG1vcmUgbGlzdGVuZXJzIHNoYXJlIHRoZSBzYW1lIHByaW9yaXR5LCB0aGV5IGFyZSBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC4gVGhlIGRlZmF1bHQgcHJpb3JpdHkgaXMgMC5cblx0ICogQHBhcmFtIHVzZVdlYWtSZWZlcmVuY2UgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGxpc3RlbmVyIGlzIHN0cm9uZyBvciB3ZWFrLiBBIHN0cm9uZyByZWZlcmVuY2UgKHRoZSBkZWZhdWx0KSBwcmV2ZW50cyB5b3VyIGxpc3RlbmVyIGZyb20gYmVpbmcgZ2FyYmFnZS1jb2xsZWN0ZWQuIEEgd2VhayByZWZlcmVuY2UgZG9lcyBub3QuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ2FkZEV2ZW50TGlzdGVuZXInICwgICdFbnRlckZyYW1lLCBFeGl0RnJhbWUnKTtcblxuXHRcdC8vaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgKXsvLyYmICEgdGhpcy5fZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQvL19mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cdFx0Ly99XG5cblx0XHQvKiBPcmlnaW5hbCBjb2RlXG5cdFx0IGlmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICYmICEgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0IF9mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IG91dCBvZiBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIElmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIGxpc3RlbmVyIHJlZ2lzdGVyZWQgd2l0aCB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdCwgYSBjYWxsIHRvIHRoaXMgbWV0aG9kIGhhcyBubyBlZmZlY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIG9iamVjdCB0byByZW1vdmUuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIGJvdGggdGhlIGNhcHR1cmUgcGhhc2UgYW5kIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcywgdHdvIGNhbGxzIHRvIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSBhcmUgcmVxdWlyZWQgdG8gcmVtb3ZlIGJvdGgsIG9uZSBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byB0cnVlLCBhbmQgYW5vdGhlciBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byBmYWxzZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Lypcblx0XHQgLy8gUmVtb3ZlIHRoZSBtYWluIHJlbmRlcmluZyBsaXN0ZW5lciBpZiBubyBFbnRlckZyYW1lIGxpc3RlbmVycyByZW1haW5cblx0XHQgaWYgKCAgICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcyApXG5cdFx0ICYmICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzKSApIC8vJiYgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0IHtcblxuXHRcdCAvL19mcmFtZUV2ZW50RHJpdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIHRoaXMub25FbnRlckZyYW1lLCB0aGlzICk7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NjaXNzb3JSZWN0O1xuXHR9XG5cblx0cHVibGljIHNldCBzY2lzc29yUmVjdCh2YWx1ZTpSZWN0YW5nbGUpXG5cdHtcblx0XHR0aGlzLl9zY2lzc29yUmVjdCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTY2lzc29yUmVjdGFuZ2xlKHRoaXMuX3NjaXNzb3JSZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggb2YgdGhlIFN0YWdlIHdoaWNoIGlzIG1hbmFnZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHVibGljIGdldCBzdGFnZUluZGV4KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgU3RhZ2UgbWFuYWdlZCBieSB0aGlzIHByb3h5IGlzIHJ1bm5pbmcgaW4gc29mdHdhcmUgbW9kZS5cblx0ICogUmVtZW1iZXIgdG8gd2FpdCBmb3IgdGhlIENPTlRFWFRfQ1JFQVRFRCBldmVudCBiZWZvcmUgY2hlY2tpbmcgdGhpcyBwcm9wZXJ0eSxcblx0ICogYXMgb25seSB0aGVuIHdpbGwgaXQgYmUgZ3VhcmFudGVlZCB0byBiZSBhY2N1cmF0ZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgdXNlc1NvZnR3YXJlUmVuZGVyaW5nKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW50aUFsaWFzaW5nIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW50aUFsaWFzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW50aUFsaWFzO1xuXHR9XG5cblx0cHVibGljIHNldCBhbnRpQWxpYXMoYW50aUFsaWFzOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCB2aWV3UG9ydCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3IoY29sb3I6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fY29sb3IgPSBjb2xvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZnJlc2hseSBjbGVhcmVkIHN0YXRlIG9mIHRoZSBiYWNrYnVmZmVyIGJlZm9yZSBhbnkgcmVuZGVyaW5nXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGJ1ZmZlckNsZWFyKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2J1ZmZlckNsZWFyO1xuXHR9XG5cblx0cHVibGljIHNldCBidWZmZXJDbGVhcihuZXdCdWZmZXJDbGVhcjpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSBuZXdCdWZmZXJDbGVhcjtcblx0fVxuXG5cblx0cHVibGljIHJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHZhciBpOm51bWJlciA9IDA7XG5cdFx0d2hpbGUgKHRoaXMuX3Byb2dyYW1EYXRhW2ldICE9IG51bGwpXG5cdFx0XHRpKys7XG5cblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtpXSA9IHByb2dyYW1EYXRhO1xuXHRcdHByb2dyYW1EYXRhLmlkID0gaTtcblx0fVxuXG5cdHB1YmxpYyB1blJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHRoaXMuX3Byb2dyYW1EYXRhW3Byb2dyYW1EYXRhLmlkXSA9IG51bGw7XG5cdFx0cHJvZ3JhbURhdGEuaWQgPSAtMTtcblx0fVxuXG5cdC8qXG5cdCAqIEFjY2VzcyB0byBmaXJlIG1vdXNlZXZlbnRzIGFjcm9zcyBtdWx0aXBsZSBsYXllcmVkIHZpZXczRCBpbnN0YW5jZXNcblx0ICovXG5cdC8vXHRcdHB1YmxpYyBnZXQgbW91c2UzRE1hbmFnZXIoKTpNb3VzZTNETWFuYWdlclxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlM0RNYW5hZ2VyO1xuXHQvL1x0XHR9XG5cdC8vXG5cdC8vXHRcdHB1YmxpYyBzZXQgbW91c2UzRE1hbmFnZXIodmFsdWU6TW91c2UzRE1hbmFnZXIpXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHR0aGlzLl9tb3VzZTNETWFuYWdlciA9IHZhbHVlO1xuXHQvL1x0XHR9XG5cblx0LyogVE9ETzogaW1wbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblx0IHB1YmxpYyBnZXQgdG91Y2gzRE1hbmFnZXIoKTpUb3VjaDNETWFuYWdlclxuXHQge1xuXHQgcmV0dXJuIF90b3VjaDNETWFuYWdlcjtcblx0IH1cblxuXHQgcHVibGljIHNldCB0b3VjaDNETWFuYWdlcih2YWx1ZTpUb3VjaDNETWFuYWdlcilcblx0IHtcblx0IF90b3VjaDNETWFuYWdlciA9IHZhbHVlO1xuXHQgfVxuXHQgKi9cblxuXHQvKipcblx0ICogRnJlZXMgdGhlIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3RhZ2VQcm94eS5cblx0ICovXG5cdHByaXZhdGUgZnJlZUNvbnRleHQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpIHtcblx0XHRcdHRoaXMuX2NvbnRleHQuZGlzcG9zZSgpO1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBFbnRlcl9GcmFtZSBoYW5kbGVyIGZvciBwcm9jZXNzaW5nIHRoZSBwcm94eS5FTlRFUl9GUkFNRSBhbmQgcHJveHkuRVhJVF9GUkFNRSBldmVudCBoYW5kbGVycy5cblx0ICogVHlwaWNhbGx5IHRoZSBwcm94eS5FTlRFUl9GUkFNRSBsaXN0ZW5lciB3b3VsZCByZW5kZXIgdGhlIGxheWVycyBmb3IgdGhpcyBTdGFnZSBpbnN0YW5jZS5cblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWdlIGluc3RhbmNlXG5cdFx0dGhpcy5jbGVhcigpO1xuXHRcdC8vbm90aWZ5IHRoZSBlbnRlcmZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RW50ZXJGcmFtZSgpO1xuXHRcdC8vIENhbGwgdGhlIHByZXNlbnQoKSB0byByZW5kZXIgdGhlIGZyYW1lXG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5wcmVzZW50KCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGV4aXRmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUV4aXRGcmFtZSgpO1xuXHR9XG5cblx0cHVibGljIHJlY292ZXJGcm9tRGlzcG9zYWwoKTpib29sZWFuXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdyZWNvdmVyRnJvbURpc3Bvc2FsJyAsICcnICk7XG5cblx0XHQvKlxuXHRcdCBpZiAodGhpcy5faUNvbnRleHQuZHJpdmVySW5mbyA9PSBcIkRpc3Bvc2VkXCIpXG5cdFx0IHtcblx0XHQgdGhpcy5faUNvbnRleHQgPSBudWxsO1xuXHRcdCB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0IHJldHVybiBmYWxzZTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fVxuXG5cdHByaXZhdGUgX2NhbGxiYWNrKGNvbnRleHQ6SUNvbnRleHRHTClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXG5cdFx0dGhpcy5fY29udGFpbmVyID0gdGhpcy5fY29udGV4dC5jb250YWluZXI7XG5cblx0XHQvLyBPbmx5IGNvbmZpZ3VyZSBiYWNrIGJ1ZmZlciBpZiB3aWR0aCBhbmQgaGVpZ2h0IGhhdmUgYmVlbiBzZXQsXG5cdFx0Ly8gd2hpY2ggdGhleSBtYXkgbm90IGhhdmUgYmVlbiBpZiBWaWV3LnJlbmRlcigpIGhhcyB5ZXQgdG8gYmVcblx0XHQvLyBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZS5cblx0XHRpZiAodGhpcy5fd2lkdGggJiYgdGhpcy5faGVpZ2h0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblxuXHRcdC8vIERpc3BhdGNoIHRoZSBhcHByb3ByaWF0ZSBldmVudCBkZXBlbmRpbmcgb24gd2hldGhlciBjb250ZXh0IHdhc1xuXHRcdC8vIGNyZWF0ZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9yIHJlY3JlYXRlZCBhZnRlciBhIGRldmljZSBsb3NzLlxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudCh0aGlzLl9pbml0aWFsaXNlZD8gU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCA6IFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVEKSk7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cdH1cbn1cblxuZXhwb3J0ID0gU3RhZ2U7Il19