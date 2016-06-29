"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("@awayjs/core/lib/events/EventDispatcher");
var Rectangle_1 = require("@awayjs/core/lib/geom/Rectangle");
var CSS_1 = require("@awayjs/core/lib/utils/CSS");
var ContextMode_1 = require("../base/ContextMode");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var ContextWebGL_1 = require("../base/ContextWebGL");
var ContextStage3D_1 = require("../base/ContextStage3D");
var ContextSoftware_1 = require("../base/ContextSoftware");
var StageEvent_1 = require("../events/StageEvent");
var ProgramDataPool_1 = require("../image/ProgramDataPool");
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
        var _this = this;
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        _super.call(this);
        this._abstractionPool = new Object();
        this._programData = new Array();
        this._x = 0;
        this._y = 0;
        //private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver/request animation frame
        this._stageIndex = -1;
        this._antiAlias = 0;
        //private var _activeVertexBuffers : Vector.<VertexBuffer> = new Vector.<VertexBuffer>(8, true);
        //private var _activeTextures : Vector.<TextureBase> = new Vector.<TextureBase>(8, true);
        this._renderTarget = null;
        this._renderSurfaceSelector = 0;
        //private _mouse3DManager:away.managers.Mouse3DManager;
        //private _touch3DManager:Touch3DManager; //TODO: imeplement dependency Touch3DManager
        this._initialised = false;
        this._bufferFormatDictionary = new Array(5);
        this.globalDisableMipmap = false;
        this.globalDisableSmooth = false;
        this._programDataPool = new ProgramDataPool_1.ProgramDataPool(this);
        this._container = container;
        if (this._container) {
            this._container.addEventListener("webglcontextlost", function (event) { return _this.onContextLost(event); });
            this._container.addEventListener("webglcontextrestored", function (event) { return _this.onContextRestored(event); });
        }
        this._stageIndex = stageIndex;
        this._stageManager = stageManager;
        this._viewPort = new Rectangle_1.Rectangle();
        this._enableDepthAndStencil = true;
        CSS_1.CSS.setElementX(this._container, 0);
        CSS_1.CSS.setElementY(this._container, 0);
        this._bufferFormatDictionary[1] = new Array(5);
        this._bufferFormatDictionary[1][1] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_1;
        this._bufferFormatDictionary[1][2] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_2;
        this._bufferFormatDictionary[1][3] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_3;
        this._bufferFormatDictionary[1][4] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_4;
        this._bufferFormatDictionary[2] = new Array(5);
        this._bufferFormatDictionary[2][1] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_1;
        this._bufferFormatDictionary[2][2] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_2;
        this._bufferFormatDictionary[2][3] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_3;
        this._bufferFormatDictionary[2][4] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_4;
        this._bufferFormatDictionary[4] = new Array(5);
        this._bufferFormatDictionary[4][1] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_1;
        this._bufferFormatDictionary[4][2] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_2;
        this._bufferFormatDictionary[4][3] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_3;
        this._bufferFormatDictionary[4][4] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_4;
        this._bufferFormatDictionary[5] = new Array(5);
        this._bufferFormatDictionary[5][1] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_1;
        this._bufferFormatDictionary[5][2] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_2;
        this._bufferFormatDictionary[5][3] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_3;
        this._bufferFormatDictionary[5][4] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_4;
        this._bufferFormatDictionary[6] = new Array(5);
        this._bufferFormatDictionary[6][1] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_1;
        this._bufferFormatDictionary[6][2] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_2;
        this._bufferFormatDictionary[6][3] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_3;
        this._bufferFormatDictionary[6][4] = ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_4;
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
        if (target) {
            this._context.setRenderToTexture(this.getAbstraction(target).texture, enableDepthAndStencil, this._antiAlias, surfaceSelector);
        }
        else {
            this._context.setRenderToBackBuffer();
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        }
    };
    Stage.prototype.getAbstraction = function (asset) {
        return (this._abstractionPool[asset.id] || (this._abstractionPool[asset.id] = new Stage._abstractionClassPool[asset.assetType](asset, this)));
    };
    /**
     *
     * @param image
     */
    Stage.prototype.clearAbstraction = function (asset) {
        this._abstractionPool[asset.id] = null;
    };
    /**
     *
     * @param imageObjectClass
     */
    Stage.registerAbstraction = function (gl_assetClass, assetClass) {
        Stage._abstractionClassPool[assetClass.assetType] = gl_assetClass;
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
            if (mode == ContextMode_1.ContextMode.FLASH)
                new ContextStage3D_1.ContextStage3D(this._container, function (context) { return _this._callback(context); });
            else if (mode == ContextMode_1.ContextMode.SOFTWARE)
                this._context = new ContextSoftware_1.ContextSoftware(this._container);
            else
                this._context = new ContextWebGL_1.ContextWebGL(this._container);
        }
        catch (e) {
            try {
                if (mode == ContextMode_1.ContextMode.AUTO)
                    new ContextStage3D_1.ContextStage3D(this._container, function (context) { return _this._callback(context); });
                else
                    this.dispatchEvent(new StageEvent_1.StageEvent(StageEvent_1.StageEvent.STAGE_ERROR, this));
            }
            catch (e) {
                this.dispatchEvent(new StageEvent_1.StageEvent(StageEvent_1.StageEvent.STAGE_ERROR, this));
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
            CSS_1.CSS.setElementWidth(this._container, val);
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
            CSS_1.CSS.setElementHeight(this._container, val);
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
            CSS_1.CSS.setElementX(this._container, val);
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
            CSS_1.CSS.setElementY(this._container, val);
            this._y = this._viewPort.y = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "visible", {
        get: function () {
            return CSS_1.CSS.getElementVisibility(this._container);
        },
        set: function (val) {
            CSS_1.CSS.setElementVisibility(this._container, val);
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
        this.dispatchEvent(new StageEvent_1.StageEvent(StageEvent_1.StageEvent.VIEWPORT_UPDATED, this));
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
        for (var id in this._abstractionPool)
            this._abstractionPool[id].clear();
        this._abstractionPool = null;
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
        this._context.clear((this._color & 0xff000000) >>> 24, // <--------- Zero-fill right shift
        (this._color & 0xff0000) >>> 16, // <-------------|
        (this._color & 0xff00) >>> 8, // <----------------|
        this._color & 0xff);
        this._bufferClear = true;
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
    /**
     * Frees the Context associated with this StageProxy.
     */
    Stage.prototype.freeContext = function () {
        if (this._context) {
            this._context.dispose();
            this.dispatchEvent(new StageEvent_1.StageEvent(StageEvent_1.StageEvent.CONTEXT_DISPOSED, this));
        }
        this._context = null;
        this._initialised = false;
    };
    Stage.prototype.onContextLost = function (event) {
    };
    Stage.prototype.onContextRestored = function (event) {
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
        this.dispatchEvent(new StageEvent_1.StageEvent(this._initialised ? StageEvent_1.StageEvent.CONTEXT_RECREATED : StageEvent_1.StageEvent.CONTEXT_CREATED, this));
        this._initialised = true;
    };
    Stage.prototype.setVertexBuffer = function (index, buffer, size, dimensions, offset, unsigned) {
        if (unsigned === void 0) { unsigned = false; }
        this._context.setVertexBufferAt(index, buffer, offset, this._bufferFormatDictionary[unsigned ? size + 4 : size][dimensions]);
    };
    Stage.prototype.setSamplerState = function (index, repeat, smooth, mipmap) {
        var wrap = repeat ? ContextGLWrapMode_1.ContextGLWrapMode.REPEAT : ContextGLWrapMode_1.ContextGLWrapMode.CLAMP;
        var filter = (smooth && !this.globalDisableSmooth) ? ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR : ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST;
        var mipfilter = (mipmap && !this.globalDisableMipmap) ? ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter_1.ContextGLMipFilter.MIPNONE;
        this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
    };
    Stage._abstractionClassPool = new Object();
    return Stage;
}(EventDispatcher_1.EventDispatcher));
exports.Stage = Stage;
