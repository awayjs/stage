var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
var Point = require("awayjs-core/lib/geom/Point");
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
var RenderableMergeSort = require("awayjs-display/lib/sort/RenderableMergeSort");
var RendererEvent = require("awayjs-display/lib/events/RendererEvent");
var StageEvent = require("awayjs-display/lib/events/StageEvent");
var EntityCollector = require("awayjs-display/lib/traverse/EntityCollector");
var BillboardRenderable = require("awayjs-stagegl/lib/core/pool/BillboardRenderable");
var LineSubMeshRenderable = require("awayjs-stagegl/lib/core/pool/LineSubMeshRenderable");
var TriangleSubMeshRenderable = require("awayjs-stagegl/lib/core/pool/TriangleSubMeshRenderable");
var ContextGLCompareMode = require("awayjs-stagegl/lib/core/stagegl/ContextGLCompareMode");
var DefaultMaterialManager = require("awayjs-stagegl/lib/materials/utils/DefaultMaterialManager");
/**
 * RendererBase forms an abstract base class for classes that are used in the rendering pipeline to render the
 * contents of a partition
 *
 * @class away.render.RendererBase
 */
var RendererBase = (function (_super) {
    __extends(RendererBase, _super);
    /**
     * Creates a new RendererBase object.
     */
    function RendererBase() {
        var _this = this;
        _super.call(this);
        this._viewPort = new Rectangle();
        this._pBackBufferInvalid = true;
        this._pDepthTextureInvalid = true;
        this._depthPrepass = false;
        this._backgroundR = 0;
        this._backgroundG = 0;
        this._backgroundB = 0;
        this._backgroundAlpha = 1;
        this._shareContext = false;
        this.textureRatioX = 1;
        this.textureRatioY = 1;
        this._pRttViewProjectionMatrix = new Matrix3D();
        this._localPos = new Point();
        this._globalPos = new Point();
        this._pScissorRect = new Rectangle();
        this._pNumTriangles = 0;
        this._onViewportUpdatedDelegate = function (event) { return _this.onViewportUpdated(event); };
        this._billboardRenderablePool = RenderablePool.getPool(BillboardRenderable);
        this._triangleSubMeshRenderablePool = RenderablePool.getPool(TriangleSubMeshRenderable);
        this._lineSubMeshRenderablePool = RenderablePool.getPool(LineSubMeshRenderable);
        this._onContextUpdateDelegate = function (event) { return _this.onContextUpdate(event); };
        //default sorting algorithm
        this.renderableSorter = new RenderableMergeSort();
    }
    Object.defineProperty(RendererBase.prototype, "numTriangles", {
        /**
         *
         */
        get: function () {
            return this._pNumTriangles;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "viewPort", {
        /**
         * A viewPort rectangle equivalent of the Stage size and position.
         */
        get: function () {
            return this._viewPort;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "scissorRect", {
        /**
         * A scissor rectangle equivalent of the view size and position.
         */
        get: function () {
            return this._pScissorRect;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "x", {
        /**
         *
         */
        get: function () {
            return this._localPos.x;
        },
        set: function (value) {
            if (this.x == value)
                return;
            this._globalPos.x = this._localPos.x = value;
            this.updateGlobalPos();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "y", {
        /**
         *
         */
        get: function () {
            return this._localPos.y;
        },
        set: function (value) {
            if (this.y == value)
                return;
            this._globalPos.y = this._localPos.y = value;
            this.updateGlobalPos();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "width", {
        /**
         *
         */
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width == value)
                return;
            this._width = value;
            this._pScissorRect.width = value;
            if (this._pRttBufferManager)
                this._pRttBufferManager.viewWidth = value;
            this._pBackBufferInvalid = true;
            this._pDepthTextureInvalid = true;
            this.notifyScissorUpdate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "height", {
        /**
         *
         */
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height == value)
                return;
            this._height = value;
            this._pScissorRect.height = value;
            if (this._pRttBufferManager)
                this._pRttBufferManager.viewHeight = value;
            this._pBackBufferInvalid = true;
            this._pDepthTextureInvalid = true;
            this.notifyScissorUpdate();
        },
        enumerable: true,
        configurable: true
    });
    RendererBase.prototype._iCreateEntityCollector = function () {
        return new EntityCollector();
    };
    Object.defineProperty(RendererBase.prototype, "_iBackgroundR", {
        /**
         * The background color's red component, used when clearing.
         *
         * @private
         */
        get: function () {
            return this._backgroundR;
        },
        set: function (value) {
            if (this._backgroundR == value)
                return;
            this._backgroundR = value;
            this._pBackBufferInvalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "_iBackgroundG", {
        /**
         * The background color's green component, used when clearing.
         *
         * @private
         */
        get: function () {
            return this._backgroundG;
        },
        set: function (value) {
            if (this._backgroundG == value)
                return;
            this._backgroundG = value;
            this._pBackBufferInvalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "_iBackgroundB", {
        /**
         * The background color's blue component, used when clearing.
         *
         * @private
         */
        get: function () {
            return this._backgroundB;
        },
        set: function (value) {
            if (this._backgroundB == value)
                return;
            this._backgroundB = value;
            this._pBackBufferInvalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RendererBase.prototype, "stage", {
        /**
         * The Stage that will provide the ContextGL used for rendering.
         */
        get: function () {
            return this._pStage;
        },
        set: function (value) {
            if (value == this._pStage)
                return;
            this.iSetStage(value);
        },
        enumerable: true,
        configurable: true
    });
    RendererBase.prototype.iSetStage = function (value) {
        if (this._pStage) {
            this._pStage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
            this._pStage.removeEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
            this._pStage.removeEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);
        }
        if (!value) {
            this._pStage = null;
            this._pContext = null;
        }
        else {
            this._pStage = value;
            this._pStage.addEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
            this._pStage.addEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
            this._pStage.addEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);
            /*
             if (_backgroundImageRenderer)
             _backgroundImageRenderer.stage = value;
             */
            if (this._pStage.context)
                this._pContext = this._pStage.context;
        }
        this._pBackBufferInvalid = true;
        this.updateGlobalPos();
    };
    Object.defineProperty(RendererBase.prototype, "shareContext", {
        /**
         * Defers control of ContextGL clear() and present() calls to Stage, enabling multiple Stage frameworks
         * to share the same ContextGL object.
         */
        get: function () {
            return this._shareContext;
        },
        set: function (value) {
            if (this._shareContext == value)
                return;
            this._shareContext = value;
            this.updateGlobalPos();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Disposes the resources used by the RendererBase.
     */
    RendererBase.prototype.dispose = function () {
        if (this._pRttBufferManager)
            this._pRttBufferManager.dispose();
        this._pRttBufferManager = null;
        this._pStage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
        this._pStage.removeEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
        this._pStage.removeEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);
        this._pStage = null;
        /*
         if (_backgroundImageRenderer) {
         _backgroundImageRenderer.dispose();
         _backgroundImageRenderer = null;
         }
         */
    };
    RendererBase.prototype.render = function (entityCollector) {
        this._viewportDirty = false;
        this._scissorDirty = false;
    };
    /**
     * Renders the potentially visible geometry to the back buffer or texture.
     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
     * @param target An option target texture to render to.
     * @param surfaceSelector The index of a CubeTexture's face to render to.
     * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
     */
    RendererBase.prototype._iRender = function (entityCollector, target, scissorRect, surfaceSelector) {
        if (target === void 0) { target = null; }
        if (scissorRect === void 0) { scissorRect = null; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        //TODO refactor setTarget so that rendertextures are created before this check
        if (!this._pStage || !this._pContext)
            return;
        this._pRttViewProjectionMatrix.copyFrom(entityCollector.camera.viewProjection);
        this._pRttViewProjectionMatrix.appendScale(this.textureRatioX, this.textureRatioY, 1);
        this.pExecuteRender(entityCollector, target, scissorRect, surfaceSelector);
        for (var i = 0; i < 8; ++i) {
            this._pContext.setVertexBufferAt(i, null);
            this._pContext.setTextureAt(i, null);
        }
    };
    RendererBase.prototype._iRenderCascades = function (entityCollector, target, numCascades, scissorRects, cameras) {
    };
    RendererBase.prototype.pCollectRenderables = function (entityCollector) {
        //reset head values
        this._pBlendedRenderableHead = null;
        this._pOpaqueRenderableHead = null;
        this._pNumTriangles = 0;
        //grab entity head
        var item = entityCollector.entityHead;
        //set temp values for entry point and camera forward vector
        this._pCamera = entityCollector.camera;
        this._iEntryPoint = this._pCamera.scenePosition;
        this._pCameraForward = this._pCamera.transform.forwardVector;
        while (item) {
            item.entity._iCollectRenderables(this);
            item = item.next;
        }
        //sort the resulting renderables
        this._pOpaqueRenderableHead = this.renderableSorter.sortOpaqueRenderables(this._pOpaqueRenderableHead);
        this._pBlendedRenderableHead = this.renderableSorter.sortBlendedRenderables(this._pBlendedRenderableHead);
    };
    /**
     * Renders the potentially visible geometry to the back buffer or texture. Only executed if everything is set up.
     *
     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
     * @param target An option target texture to render to.
     * @param surfaceSelector The index of a CubeTexture's face to render to.
     * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
     */
    RendererBase.prototype.pExecuteRender = function (entityCollector, target, scissorRect, surfaceSelector) {
        if (target === void 0) { target = null; }
        if (scissorRect === void 0) { scissorRect = null; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        this._pContext.setRenderTarget(target, true, surfaceSelector);
        if ((target || !this._shareContext) && !this._depthPrepass)
            this._pContext.clear(this._backgroundR, this._backgroundG, this._backgroundB, this._backgroundAlpha, 1, 0);
        this._pContext.setDepthTest(false, ContextGLCompareMode.ALWAYS);
        this._pStage.scissorRect = scissorRect;
        /*
         if (_backgroundImageRenderer)
         _backgroundImageRenderer.render();
         */
        this.pDraw(entityCollector, target);
        //line required for correct rendering when using away3d with starling. DO NOT REMOVE UNLESS STARLING INTEGRATION IS RETESTED!
        //this._pContext.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL); //oopsie
        if (!this._shareContext) {
            if (this._snapshotRequired && this._snapshotBitmapData) {
                this._pContext.drawToBitmapData(this._snapshotBitmapData);
                this._snapshotRequired = false;
            }
        }
        this._pStage.scissorRect = null;
    };
    /*
     * Will draw the renderer's output on next render to the provided bitmap data.
     * */
    RendererBase.prototype.queueSnapshot = function (bmd) {
        this._snapshotRequired = true;
        this._snapshotBitmapData = bmd;
    };
    /**
     * Performs the actual drawing of geometry to the target.
     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
     */
    RendererBase.prototype.pDraw = function (entityCollector, target) {
        throw new AbstractMethodError();
    };
    /**
     * Assign the context once retrieved
     */
    RendererBase.prototype.onContextUpdate = function (event) {
        this._pContext = this._pStage.context;
    };
    Object.defineProperty(RendererBase.prototype, "_iBackgroundAlpha", {
        get: function () {
            return this._backgroundAlpha;
        },
        set: function (value) {
            if (this._backgroundAlpha == value)
                return;
            this._backgroundAlpha = value;
            this._pBackBufferInvalid = true;
        },
        enumerable: true,
        configurable: true
    });
    /*
     public get iBackground():Texture2DBase
     {
     return this._background;
     }
     */
    /*
     public set iBackground(value:Texture2DBase)
     {
     if (this._backgroundImageRenderer && !value) {
     this._backgroundImageRenderer.dispose();
     this._backgroundImageRenderer = null;
     }

     if (!this._backgroundImageRenderer && value)
     {

     this._backgroundImageRenderer = new BackgroundImageRenderer(this._pStage);

     }


     this._background = value;

     if (this._backgroundImageRenderer)
     this._backgroundImageRenderer.texture = value;
     }
     */
    /*
     public get backgroundImageRenderer():BackgroundImageRenderer
     {
     return _backgroundImageRenderer;
     }
     */
    /**
     * @private
     */
    RendererBase.prototype.notifyScissorUpdate = function () {
        if (this._scissorDirty)
            return;
        this._scissorDirty = true;
        if (!this._scissorUpdated)
            this._scissorUpdated = new RendererEvent(RendererEvent.SCISSOR_UPDATED);
        this.dispatchEvent(this._scissorUpdated);
    };
    /**
     * @private
     */
    RendererBase.prototype.notifyViewportUpdate = function () {
        if (this._viewportDirty)
            return;
        this._viewportDirty = true;
        if (!this._viewPortUpdated)
            this._viewPortUpdated = new RendererEvent(RendererEvent.VIEWPORT_UPDATED);
        this.dispatchEvent(this._viewPortUpdated);
    };
    /**
     *
     */
    RendererBase.prototype.onViewportUpdated = function (event) {
        this._viewPort = this._pStage.viewPort;
        //TODO stop firing viewport updated for every stagegl viewport change
        if (this._shareContext) {
            this._pScissorRect.x = this._globalPos.x - this._pStage.x;
            this._pScissorRect.y = this._globalPos.y - this._pStage.y;
            this.notifyScissorUpdate();
        }
        this.notifyViewportUpdate();
    };
    /**
     *
     */
    RendererBase.prototype.updateGlobalPos = function () {
        if (this._shareContext) {
            this._pScissorRect.x = this._globalPos.x - this._viewPort.x;
            this._pScissorRect.y = this._globalPos.y - this._viewPort.y;
        }
        else {
            this._pScissorRect.x = 0;
            this._pScissorRect.y = 0;
            this._viewPort.x = this._globalPos.x;
            this._viewPort.y = this._globalPos.y;
        }
        this.notifyScissorUpdate();
    };
    /**
     *
     * @param billboard
     * @protected
     */
    RendererBase.prototype.applyBillboard = function (billboard) {
        this._applyRenderable(this._billboardRenderablePool.getItem(billboard));
    };
    /**
     *
     * @param triangleSubMesh
     */
    RendererBase.prototype.applyTriangleSubMesh = function (triangleSubMesh) {
        this._applyRenderable(this._triangleSubMeshRenderablePool.getItem(triangleSubMesh));
    };
    /**
     *
     * @param lineSubMesh
     */
    RendererBase.prototype.applyLineSubMesh = function (lineSubMesh) {
        this._applyRenderable(this._lineSubMeshRenderablePool.getItem(lineSubMesh));
    };
    /**
     *
     * @param renderable
     * @protected
     */
    RendererBase.prototype._applyRenderable = function (renderable) {
        var material = renderable.materialOwner.material;
        var entity = renderable.sourceEntity;
        var position = entity.scenePosition;
        if (!material)
            material = DefaultMaterialManager.getDefaultMaterial(renderable.materialOwner);
        //update material if invalidated
        material._iUpdateMaterial();
        //set ids for faster referencing
        renderable.material = material;
        renderable.materialId = material._iMaterialId;
        renderable.renderOrderId = this._pContext.getMaterial(material, this._pStage.profile).renderOrderId;
        renderable.cascaded = false;
        // project onto camera's z-axis
        position = this._iEntryPoint.subtract(position);
        renderable.zIndex = entity.zOffset + position.dotProduct(this._pCameraForward);
        //store reference to scene transform
        renderable.renderSceneTransform = renderable.sourceEntity.getRenderSceneTransform(this._pCamera);
        if (material.requiresBlending) {
            renderable.next = this._pBlendedRenderableHead;
            this._pBlendedRenderableHead = renderable;
        }
        else {
            renderable.next = this._pOpaqueRenderableHead;
            this._pOpaqueRenderableHead = renderable;
        }
        this._pNumTriangles += renderable.numTriangles;
        //handle any overflow for renderables with data that exceeds GPU limitations
        if (renderable.overflow)
            this._applyRenderable(renderable.overflow);
    };
    return RendererBase;
})(EventDispatcher);
module.exports = RendererBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3JlbmRlci9yZW5kZXJlcmJhc2UudHMiXSwibmFtZXMiOlsiUmVuZGVyZXJCYXNlIiwiUmVuZGVyZXJCYXNlLmNvbnN0cnVjdG9yIiwiUmVuZGVyZXJCYXNlLm51bVRyaWFuZ2xlcyIsIlJlbmRlcmVyQmFzZS52aWV3UG9ydCIsIlJlbmRlcmVyQmFzZS5zY2lzc29yUmVjdCIsIlJlbmRlcmVyQmFzZS54IiwiUmVuZGVyZXJCYXNlLnkiLCJSZW5kZXJlckJhc2Uud2lkdGgiLCJSZW5kZXJlckJhc2UuaGVpZ2h0IiwiUmVuZGVyZXJCYXNlLl9pQ3JlYXRlRW50aXR5Q29sbGVjdG9yIiwiUmVuZGVyZXJCYXNlLl9pQmFja2dyb3VuZFIiLCJSZW5kZXJlckJhc2UuX2lCYWNrZ3JvdW5kRyIsIlJlbmRlcmVyQmFzZS5faUJhY2tncm91bmRCIiwiUmVuZGVyZXJCYXNlLnN0YWdlIiwiUmVuZGVyZXJCYXNlLmlTZXRTdGFnZSIsIlJlbmRlcmVyQmFzZS5zaGFyZUNvbnRleHQiLCJSZW5kZXJlckJhc2UuZGlzcG9zZSIsIlJlbmRlcmVyQmFzZS5yZW5kZXIiLCJSZW5kZXJlckJhc2UuX2lSZW5kZXIiLCJSZW5kZXJlckJhc2UuX2lSZW5kZXJDYXNjYWRlcyIsIlJlbmRlcmVyQmFzZS5wQ29sbGVjdFJlbmRlcmFibGVzIiwiUmVuZGVyZXJCYXNlLnBFeGVjdXRlUmVuZGVyIiwiUmVuZGVyZXJCYXNlLnF1ZXVlU25hcHNob3QiLCJSZW5kZXJlckJhc2UucERyYXciLCJSZW5kZXJlckJhc2Uub25Db250ZXh0VXBkYXRlIiwiUmVuZGVyZXJCYXNlLl9pQmFja2dyb3VuZEFscGhhIiwiUmVuZGVyZXJCYXNlLm5vdGlmeVNjaXNzb3JVcGRhdGUiLCJSZW5kZXJlckJhc2Uubm90aWZ5Vmlld3BvcnRVcGRhdGUiLCJSZW5kZXJlckJhc2Uub25WaWV3cG9ydFVwZGF0ZWQiLCJSZW5kZXJlckJhc2UudXBkYXRlR2xvYmFsUG9zIiwiUmVuZGVyZXJCYXNlLmFwcGx5QmlsbGJvYXJkIiwiUmVuZGVyZXJCYXNlLmFwcGx5VHJpYW5nbGVTdWJNZXNoIiwiUmVuZGVyZXJCYXNlLmFwcGx5TGluZVN1Yk1lc2giLCJSZW5kZXJlckJhc2UuX2FwcGx5UmVuZGVyYWJsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTyxRQUFRLFdBQWdCLCtCQUErQixDQUFDLENBQUM7QUFDaEUsSUFBTyxLQUFLLFdBQWdCLDRCQUE0QixDQUFDLENBQUM7QUFDMUQsSUFBTyxTQUFTLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUVqRSxJQUFPLG1CQUFtQixXQUFhLDRDQUE0QyxDQUFDLENBQUM7QUFDckYsSUFBTyxlQUFlLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQU85RSxJQUFPLGNBQWMsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRTdFLElBQU8sbUJBQW1CLFdBQWEsNkNBQTZDLENBQUMsQ0FBQztBQU90RixJQUFPLGFBQWEsV0FBYyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQzdFLElBQU8sVUFBVSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFHeEUsSUFBTyxlQUFlLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUluRixJQUFPLG1CQUFtQixXQUFhLGtEQUFrRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxxQkFBcUIsV0FBWSxvREFBb0QsQ0FBQyxDQUFDO0FBRTlGLElBQU8seUJBQXlCLFdBQVcsd0RBQXdELENBQUMsQ0FBQztBQUNyRyxJQUFPLG9CQUFvQixXQUFhLHNEQUFzRCxDQUFDLENBQUM7QUFHaEcsSUFBTyxzQkFBc0IsV0FBWSwyREFBMkQsQ0FBQyxDQUFDO0FBRXRHLEFBTUE7Ozs7O0dBREc7SUFDRyxZQUFZO0lBQVNBLFVBQXJCQSxZQUFZQSxVQUF3QkE7SUEwS3pDQTs7T0FFR0E7SUFDSEEsU0E3S0tBLFlBQVlBO1FBQWxCQyxpQkEycEJDQTtRQTVlQ0EsaUJBQU9BLENBQUNBO1FBaktEQSxjQUFTQSxHQUFhQSxJQUFJQSxTQUFTQSxFQUFFQSxDQUFDQTtR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LEVBM3BCMEIsZUFBZSxFQTJwQnpDO0FBRUQsQUFBc0IsaUJBQWIsWUFBWSxDQUFDIiwiZmlsZSI6ImNvcmUvcmVuZGVyL1JlbmRlcmVyQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vTWF0cml4M0RcIik7XG5pbXBvcnQgUG9pbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9Qb2ludFwiKTtcbmltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUmVjdGFuZ2xlXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcbmltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlUHJveHlCYXNlXCIpO1xuXG5pbXBvcnQgTGluZVN1Yk1lc2hcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvTGluZVN1Yk1lc2hcIik7XG5pbXBvcnQgVHJpYW5nbGVTdWJNZXNoXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9UcmlhbmdsZVN1Yk1lc2hcIik7XG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IEVudGl0eUxpc3RJdGVtXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcG9vbC9FbnRpdHlMaXN0SXRlbVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3Bvb2wvUmVuZGVyYWJsZVBvb2xcIik7XG5pbXBvcnQgSUVudGl0eVNvcnRlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3NvcnQvSUVudGl0eVNvcnRlclwiKTtcbmltcG9ydCBSZW5kZXJhYmxlTWVyZ2VTb3J0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3NvcnQvUmVuZGVyYWJsZU1lcmdlU29ydFwiKTtcbmltcG9ydCBJUmVuZGVyZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3JlbmRlci9JUmVuZGVyZXJcIik7XG5pbXBvcnQgQmlsbGJvYXJkXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9CaWxsYm9hcmRcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBJRW50aXR5XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0lFbnRpdHlcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcblxuaW1wb3J0IFJlbmRlcmVyRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvUmVuZGVyZXJFdmVudFwiKTtcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcbmltcG9ydCBNYXRlcmlhbEJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9NYXRlcmlhbEJhc2VcIik7XG5cbmltcG9ydCBFbnRpdHlDb2xsZWN0b3JcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi90cmF2ZXJzZS9FbnRpdHlDb2xsZWN0b3JcIik7XG5pbXBvcnQgSUNvbGxlY3Rvclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdHJhdmVyc2UvSUNvbGxlY3RvclwiKTtcbmltcG9ydCBTaGFkb3dDYXN0ZXJDb2xsZWN0b3JcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3RyYXZlcnNlL1NoYWRvd0Nhc3RlckNvbGxlY3RvclwiKTtcblxuaW1wb3J0IEJpbGxib2FyZFJlbmRlcmFibGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL0JpbGxib2FyZFJlbmRlcmFibGVcIik7XG5pbXBvcnQgTGluZVN1Yk1lc2hSZW5kZXJhYmxlXHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvTGluZVN1Yk1lc2hSZW5kZXJhYmxlXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1JlbmRlcmFibGVCYXNlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGVcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvVHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZVwiKTtcbmltcG9ydCBDb250ZXh0R0xDb21wYXJlTW9kZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvQ29udGV4dEdMQ29tcGFyZU1vZGVcIik7XG5pbXBvcnQgSUNvbnRleHRTdGFnZUdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0lDb250ZXh0U3RhZ2VHTFwiKTtcbmltcG9ydCBSVFRCdWZmZXJNYW5hZ2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWFuYWdlcnMvUlRUQnVmZmVyTWFuYWdlclwiKTtcbmltcG9ydCBEZWZhdWx0TWF0ZXJpYWxNYW5hZ2VyXHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvdXRpbHMvRGVmYXVsdE1hdGVyaWFsTWFuYWdlclwiKTtcblxuLyoqXG4gKiBSZW5kZXJlckJhc2UgZm9ybXMgYW4gYWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgY2xhc3NlcyB0aGF0IGFyZSB1c2VkIGluIHRoZSByZW5kZXJpbmcgcGlwZWxpbmUgdG8gcmVuZGVyIHRoZVxuICogY29udGVudHMgb2YgYSBwYXJ0aXRpb25cbiAqXG4gKiBAY2xhc3MgYXdheS5yZW5kZXIuUmVuZGVyZXJCYXNlXG4gKi9cbmNsYXNzIFJlbmRlcmVyQmFzZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9iaWxsYm9hcmRSZW5kZXJhYmxlUG9vbDpSZW5kZXJhYmxlUG9vbDtcblx0cHJpdmF0ZSBfdHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZVBvb2w6UmVuZGVyYWJsZVBvb2w7XG5cdHByaXZhdGUgX2xpbmVTdWJNZXNoUmVuZGVyYWJsZVBvb2w6UmVuZGVyYWJsZVBvb2w7XG5cblx0cHVibGljIF9wQ29udGV4dDpJQ29udGV4dFN0YWdlR0w7XG5cdHB1YmxpYyBfcFN0YWdlOlN0YWdlO1xuXG5cdHB1YmxpYyBfcENhbWVyYTpDYW1lcmE7XG5cdHB1YmxpYyBfaUVudHJ5UG9pbnQ6VmVjdG9yM0Q7XG5cdHB1YmxpYyBfcENhbWVyYUZvcndhcmQ6VmVjdG9yM0Q7XG5cblx0cHVibGljIF9wUnR0QnVmZmVyTWFuYWdlcjpSVFRCdWZmZXJNYW5hZ2VyO1xuXHRwcml2YXRlIF92aWV3UG9ydDpSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfc2Npc3NvckRpcnR5OmJvb2xlYW47XG5cblx0cHVibGljIF9wQmFja0J1ZmZlckludmFsaWQ6Ym9vbGVhbiA9IHRydWU7XG5cdHB1YmxpYyBfcERlcHRoVGV4dHVyZUludmFsaWQ6Ym9vbGVhbiA9IHRydWU7XG5cdHB1YmxpYyBfZGVwdGhQcmVwYXNzOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfYmFja2dyb3VuZFI6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfYmFja2dyb3VuZEc6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfYmFja2dyb3VuZEI6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfYmFja2dyb3VuZEFscGhhOm51bWJlciA9IDE7XG5cdHB1YmxpYyBfc2hhcmVDb250ZXh0OmJvb2xlYW4gPSBmYWxzZTtcblxuXHQvLyBvbmx5IHVzZWQgYnkgcmVuZGVyZXJzIHRoYXQgbmVlZCB0byByZW5kZXIgZ2VvbWV0cnkgdG8gdGV4dHVyZXNcblx0cHVibGljIF93aWR0aDpudW1iZXI7XG5cdHB1YmxpYyBfaGVpZ2h0Om51bWJlcjtcblxuXHRwdWJsaWMgdGV4dHVyZVJhdGlvWDpudW1iZXIgPSAxO1xuXHRwdWJsaWMgdGV4dHVyZVJhdGlvWTpudW1iZXIgPSAxO1xuXG5cdHByaXZhdGUgX3NuYXBzaG90Qml0bWFwRGF0YTpCaXRtYXBEYXRhO1xuXHRwcml2YXRlIF9zbmFwc2hvdFJlcXVpcmVkOmJvb2xlYW47XG5cblx0cHVibGljIF9wUnR0Vmlld1Byb2plY3Rpb25NYXRyaXg6TWF0cml4M0QgPSBuZXcgTWF0cml4M0QoKTtcblxuXHRwcml2YXRlIF9sb2NhbFBvczpQb2ludCA9IG5ldyBQb2ludCgpO1xuXHRwcml2YXRlIF9nbG9iYWxQb3M6UG9pbnQgPSBuZXcgUG9pbnQoKTtcblx0cHVibGljIF9wU2Npc3NvclJlY3Q6UmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSgpO1xuXG5cdHByaXZhdGUgX3NjaXNzb3JVcGRhdGVkOlJlbmRlcmVyRXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdQb3J0VXBkYXRlZDpSZW5kZXJlckV2ZW50O1xuXG5cdHByaXZhdGUgX29uQ29udGV4dFVwZGF0ZURlbGVnYXRlOkZ1bmN0aW9uO1xuXHRwcml2YXRlIF9vblZpZXdwb3J0VXBkYXRlZERlbGVnYXRlO1xuXG5cdHB1YmxpYyBfcE51bVRyaWFuZ2xlczpudW1iZXIgPSAwO1xuXG5cdHB1YmxpYyBfcE9wYXF1ZVJlbmRlcmFibGVIZWFkOlJlbmRlcmFibGVCYXNlO1xuXHRwdWJsaWMgX3BCbGVuZGVkUmVuZGVyYWJsZUhlYWQ6UmVuZGVyYWJsZUJhc2U7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVRyaWFuZ2xlcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BOdW1UcmlhbmdsZXM7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyByZW5kZXJhYmxlU29ydGVyOklFbnRpdHlTb3J0ZXI7XG5cblxuXHQvKipcblx0ICogQSB2aWV3UG9ydCByZWN0YW5nbGUgZXF1aXZhbGVudCBvZiB0aGUgU3RhZ2Ugc2l6ZSBhbmQgcG9zaXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHZpZXdQb3J0KCk6UmVjdGFuZ2xlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdmlld1BvcnQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzY2lzc29yIHJlY3RhbmdsZSBlcXVpdmFsZW50IG9mIHRoZSB2aWV3IHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BTY2lzc29yUmVjdDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCB4KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbG9jYWxQb3MueDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeCh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy54ID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fZ2xvYmFsUG9zLnggPSB0aGlzLl9sb2NhbFBvcy54ID0gdmFsdWU7XG5cblx0XHR0aGlzLnVwZGF0ZUdsb2JhbFBvcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHkoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9sb2NhbFBvcy55O1xuXHR9XG5cblx0cHVibGljIHNldCB5KHZhbHVlOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLnkgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9nbG9iYWxQb3MueSA9IHRoaXMuX2xvY2FsUG9zLnkgPSB2YWx1ZTtcblxuXHRcdHRoaXMudXBkYXRlR2xvYmFsUG9zKCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgd2lkdGgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgd2lkdGgodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3dpZHRoID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fd2lkdGggPSB2YWx1ZTtcblx0XHR0aGlzLl9wU2Npc3NvclJlY3Qud2lkdGggPSB2YWx1ZTtcblxuXHRcdGlmICh0aGlzLl9wUnR0QnVmZmVyTWFuYWdlcilcblx0XHRcdHRoaXMuX3BSdHRCdWZmZXJNYW5hZ2VyLnZpZXdXaWR0aCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblx0XHR0aGlzLl9wRGVwdGhUZXh0dXJlSW52YWxpZCA9IHRydWU7XG5cblx0XHR0aGlzLm5vdGlmeVNjaXNzb3JVcGRhdGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBoZWlnaHQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGhlaWdodCh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5faGVpZ2h0ID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5faGVpZ2h0ID0gdmFsdWU7XG5cdFx0dGhpcy5fcFNjaXNzb3JSZWN0LmhlaWdodCA9IHZhbHVlO1xuXG5cdFx0aWYgKHRoaXMuX3BSdHRCdWZmZXJNYW5hZ2VyKVxuXHRcdFx0dGhpcy5fcFJ0dEJ1ZmZlck1hbmFnZXIudmlld0hlaWdodCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblx0XHR0aGlzLl9wRGVwdGhUZXh0dXJlSW52YWxpZCA9IHRydWU7XG5cblx0XHR0aGlzLm5vdGlmeVNjaXNzb3JVcGRhdGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFJlbmRlcmVyQmFzZSBvYmplY3QuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fb25WaWV3cG9ydFVwZGF0ZWREZWxlZ2F0ZSA9IChldmVudDpTdGFnZUV2ZW50KSA9PiB0aGlzLm9uVmlld3BvcnRVcGRhdGVkKGV2ZW50KTtcblxuXHRcdHRoaXMuX2JpbGxib2FyZFJlbmRlcmFibGVQb29sID0gUmVuZGVyYWJsZVBvb2wuZ2V0UG9vbChCaWxsYm9hcmRSZW5kZXJhYmxlKTtcblx0XHR0aGlzLl90cmlhbmdsZVN1Yk1lc2hSZW5kZXJhYmxlUG9vbCA9IFJlbmRlcmFibGVQb29sLmdldFBvb2woVHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZSk7XG5cdFx0dGhpcy5fbGluZVN1Yk1lc2hSZW5kZXJhYmxlUG9vbCA9IFJlbmRlcmFibGVQb29sLmdldFBvb2woTGluZVN1Yk1lc2hSZW5kZXJhYmxlKTtcblxuXHRcdHRoaXMuX29uQ29udGV4dFVwZGF0ZURlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLm9uQ29udGV4dFVwZGF0ZShldmVudCk7XG5cblx0XHQvL2RlZmF1bHQgc29ydGluZyBhbGdvcml0aG1cblx0XHR0aGlzLnJlbmRlcmFibGVTb3J0ZXIgPSBuZXcgUmVuZGVyYWJsZU1lcmdlU29ydCgpO1xuXHR9XG5cblx0cHVibGljIF9pQ3JlYXRlRW50aXR5Q29sbGVjdG9yKCk6SUNvbGxlY3RvclxuXHR7XG5cdFx0cmV0dXJuIG5ldyBFbnRpdHlDb2xsZWN0b3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvcidzIHJlZCBjb21wb25lbnQsIHVzZWQgd2hlbiBjbGVhcmluZy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBnZXQgX2lCYWNrZ3JvdW5kUigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2JhY2tncm91bmRSO1xuXHR9XG5cblx0cHVibGljIHNldCBfaUJhY2tncm91bmRSKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9iYWNrZ3JvdW5kUiA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2JhY2tncm91bmRSID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wQmFja0J1ZmZlckludmFsaWQgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yJ3MgZ3JlZW4gY29tcG9uZW50LCB1c2VkIHdoZW4gY2xlYXJpbmcuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IF9pQmFja2dyb3VuZEcoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kRztcblx0fVxuXG5cdHB1YmxpYyBzZXQgX2lCYWNrZ3JvdW5kRyh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fYmFja2dyb3VuZEcgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9iYWNrZ3JvdW5kRyA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvcidzIGJsdWUgY29tcG9uZW50LCB1c2VkIHdoZW4gY2xlYXJpbmcuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IF9pQmFja2dyb3VuZEIoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kQjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgX2lCYWNrZ3JvdW5kQih2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fYmFja2dyb3VuZEIgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9iYWNrZ3JvdW5kQiA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgU3RhZ2UgdGhhdCB3aWxsIHByb3ZpZGUgdGhlIENvbnRleHRHTCB1c2VkIGZvciByZW5kZXJpbmcuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHN0YWdlKCk6U3RhZ2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wU3RhZ2U7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHN0YWdlKHZhbHVlOlN0YWdlKVxuXHR7XG5cdFx0aWYgKHZhbHVlID09IHRoaXMuX3BTdGFnZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuaVNldFN0YWdlKHZhbHVlKTtcblx0fVxuXG5cdHB1YmxpYyBpU2V0U3RhZ2UodmFsdWU6U3RhZ2UpXG5cdHtcblx0XHRpZiAodGhpcy5fcFN0YWdlKSB7XG5cdFx0XHR0aGlzLl9wU3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdFx0dGhpcy5fcFN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdFx0dGhpcy5fcFN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVELCB0aGlzLl9vblZpZXdwb3J0VXBkYXRlZERlbGVnYXRlKTtcblx0XHR9XG5cblx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHR0aGlzLl9wU3RhZ2UgPSBudWxsO1xuXHRcdFx0dGhpcy5fcENvbnRleHQgPSBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9wU3RhZ2UgPSB2YWx1ZTtcblx0XHRcdHRoaXMuX3BTdGFnZS5hZGRFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVELCB0aGlzLl9vbkNvbnRleHRVcGRhdGVEZWxlZ2F0ZSk7XG5cdFx0XHR0aGlzLl9wU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfUkVDUkVBVEVELCB0aGlzLl9vbkNvbnRleHRVcGRhdGVEZWxlZ2F0ZSk7XG5cdFx0XHR0aGlzLl9wU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQsIHRoaXMuX29uVmlld3BvcnRVcGRhdGVkRGVsZWdhdGUpO1xuXG5cdFx0XHQvKlxuXHRcdFx0IGlmIChfYmFja2dyb3VuZEltYWdlUmVuZGVyZXIpXG5cdFx0XHQgX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyLnN0YWdlID0gdmFsdWU7XG5cdFx0XHQgKi9cblx0XHRcdGlmICh0aGlzLl9wU3RhZ2UuY29udGV4dClcblx0XHRcdFx0dGhpcy5fcENvbnRleHQgPSA8SUNvbnRleHRTdGFnZUdMPiB0aGlzLl9wU3RhZ2UuY29udGV4dDtcblx0XHR9XG5cblx0XHR0aGlzLl9wQmFja0J1ZmZlckludmFsaWQgPSB0cnVlO1xuXG5cdFx0dGhpcy51cGRhdGVHbG9iYWxQb3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZlcnMgY29udHJvbCBvZiBDb250ZXh0R0wgY2xlYXIoKSBhbmQgcHJlc2VudCgpIGNhbGxzIHRvIFN0YWdlLCBlbmFibGluZyBtdWx0aXBsZSBTdGFnZSBmcmFtZXdvcmtzXG5cdCAqIHRvIHNoYXJlIHRoZSBzYW1lIENvbnRleHRHTCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNoYXJlQ29udGV4dCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zaGFyZUNvbnRleHQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNoYXJlQ29udGV4dCh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NoYXJlQ29udGV4dCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3NoYXJlQ29udGV4dCA9IHZhbHVlO1xuXG5cdFx0dGhpcy51cGRhdGVHbG9iYWxQb3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlcyB0aGUgcmVzb3VyY2VzIHVzZWQgYnkgdGhlIFJlbmRlcmVyQmFzZS5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdGlmICh0aGlzLl9wUnR0QnVmZmVyTWFuYWdlcilcblx0XHRcdHRoaXMuX3BSdHRCdWZmZXJNYW5hZ2VyLmRpc3Bvc2UoKTtcblxuXHRcdHRoaXMuX3BSdHRCdWZmZXJNYW5hZ2VyID0gbnVsbDtcblxuXHRcdHRoaXMuX3BTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVELCB0aGlzLl9vbkNvbnRleHRVcGRhdGVEZWxlZ2F0ZSk7XG5cdFx0dGhpcy5fcFN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdHRoaXMuX3BTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCwgdGhpcy5fb25WaWV3cG9ydFVwZGF0ZWREZWxlZ2F0ZSk7XG5cblx0XHR0aGlzLl9wU3RhZ2UgPSBudWxsO1xuXG5cdFx0Lypcblx0XHQgaWYgKF9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlcikge1xuXHRcdCBfYmFja2dyb3VuZEltYWdlUmVuZGVyZXIuZGlzcG9zZSgpO1xuXHRcdCBfYmFja2dyb3VuZEltYWdlUmVuZGVyZXIgPSBudWxsO1xuXHRcdCB9XG5cdFx0ICovXG5cdH1cblxuXHRwdWJsaWMgcmVuZGVyKGVudGl0eUNvbGxlY3RvcjpJQ29sbGVjdG9yKVxuXHR7XG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xuXHRcdHRoaXMuX3NjaXNzb3JEaXJ0eSA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgdGhlIHBvdGVudGlhbGx5IHZpc2libGUgZ2VvbWV0cnkgdG8gdGhlIGJhY2sgYnVmZmVyIG9yIHRleHR1cmUuXG5cdCAqIEBwYXJhbSBlbnRpdHlDb2xsZWN0b3IgVGhlIEVudGl0eUNvbGxlY3RvciBvYmplY3QgY29udGFpbmluZyB0aGUgcG90ZW50aWFsbHkgdmlzaWJsZSBnZW9tZXRyeS5cblx0ICogQHBhcmFtIHRhcmdldCBBbiBvcHRpb24gdGFyZ2V0IHRleHR1cmUgdG8gcmVuZGVyIHRvLlxuXHQgKiBAcGFyYW0gc3VyZmFjZVNlbGVjdG9yIFRoZSBpbmRleCBvZiBhIEN1YmVUZXh0dXJlJ3MgZmFjZSB0byByZW5kZXIgdG8uXG5cdCAqIEBwYXJhbSBhZGRpdGlvbmFsQ2xlYXJNYXNrIEFkZGl0aW9uYWwgY2xlYXIgbWFzayBpbmZvcm1hdGlvbiwgaW4gY2FzZSBleHRyYSBjbGVhciBjaGFubmVscyBhcmUgdG8gYmUgb21pdHRlZC5cblx0ICovXG5cdHB1YmxpYyBfaVJlbmRlcihlbnRpdHlDb2xsZWN0b3I6SUNvbGxlY3RvciwgdGFyZ2V0OlRleHR1cmVQcm94eUJhc2UgPSBudWxsLCBzY2lzc29yUmVjdDpSZWN0YW5nbGUgPSBudWxsLCBzdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMClcblx0e1xuXHRcdC8vVE9ETyByZWZhY3RvciBzZXRUYXJnZXQgc28gdGhhdCByZW5kZXJ0ZXh0dXJlcyBhcmUgY3JlYXRlZCBiZWZvcmUgdGhpcyBjaGVja1xuXHRcdGlmICghdGhpcy5fcFN0YWdlIHx8ICF0aGlzLl9wQ29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3BSdHRWaWV3UHJvamVjdGlvbk1hdHJpeC5jb3B5RnJvbShlbnRpdHlDb2xsZWN0b3IuY2FtZXJhLnZpZXdQcm9qZWN0aW9uKTtcblx0XHR0aGlzLl9wUnR0Vmlld1Byb2plY3Rpb25NYXRyaXguYXBwZW5kU2NhbGUodGhpcy50ZXh0dXJlUmF0aW9YLCB0aGlzLnRleHR1cmVSYXRpb1ksIDEpO1xuXG5cdFx0dGhpcy5wRXhlY3V0ZVJlbmRlcihlbnRpdHlDb2xsZWN0b3IsIHRhcmdldCwgc2Npc3NvclJlY3QsIHN1cmZhY2VTZWxlY3Rvcik7XG5cblx0XHQvLyBnZW5lcmF0ZSBtaXAgbWFwcyBvbiB0YXJnZXQgKGlmIHRhcmdldCBleGlzdHMpIC8vVE9ET1xuXHRcdC8vaWYgKHRhcmdldClcblx0XHQvL1x0KDxUZXh0dXJlPnRhcmdldCkuZ2VuZXJhdGVNaXBtYXBzKCk7XG5cblx0XHQvLyBjbGVhciBidWZmZXJzXG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgODsgKytpKSB7XG5cdFx0XHR0aGlzLl9wQ29udGV4dC5zZXRWZXJ0ZXhCdWZmZXJBdChpLCBudWxsKTtcblx0XHRcdHRoaXMuX3BDb250ZXh0LnNldFRleHR1cmVBdChpLCBudWxsKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgX2lSZW5kZXJDYXNjYWRlcyhlbnRpdHlDb2xsZWN0b3I6U2hhZG93Q2FzdGVyQ29sbGVjdG9yLCB0YXJnZXQ6VGV4dHVyZVByb3h5QmFzZSwgbnVtQ2FzY2FkZXM6bnVtYmVyLCBzY2lzc29yUmVjdHM6QXJyYXk8UmVjdGFuZ2xlPiwgY2FtZXJhczpBcnJheTxDYW1lcmE+KVxuXHR7XG5cblx0fVxuXG5cdHB1YmxpYyBwQ29sbGVjdFJlbmRlcmFibGVzKGVudGl0eUNvbGxlY3RvcjpJQ29sbGVjdG9yKVxuXHR7XG5cdFx0Ly9yZXNldCBoZWFkIHZhbHVlc1xuXHRcdHRoaXMuX3BCbGVuZGVkUmVuZGVyYWJsZUhlYWQgPSBudWxsO1xuXHRcdHRoaXMuX3BPcGFxdWVSZW5kZXJhYmxlSGVhZCA9IG51bGw7XG5cdFx0dGhpcy5fcE51bVRyaWFuZ2xlcyA9IDA7XG5cblx0XHQvL2dyYWIgZW50aXR5IGhlYWRcblx0XHR2YXIgaXRlbTpFbnRpdHlMaXN0SXRlbSA9IGVudGl0eUNvbGxlY3Rvci5lbnRpdHlIZWFkO1xuXG5cdFx0Ly9zZXQgdGVtcCB2YWx1ZXMgZm9yIGVudHJ5IHBvaW50IGFuZCBjYW1lcmEgZm9yd2FyZCB2ZWN0b3Jcblx0XHR0aGlzLl9wQ2FtZXJhID0gZW50aXR5Q29sbGVjdG9yLmNhbWVyYTtcblx0XHR0aGlzLl9pRW50cnlQb2ludCA9IHRoaXMuX3BDYW1lcmEuc2NlbmVQb3NpdGlvbjtcblx0XHR0aGlzLl9wQ2FtZXJhRm9yd2FyZCA9IHRoaXMuX3BDYW1lcmEudHJhbnNmb3JtLmZvcndhcmRWZWN0b3I7XG5cblx0XHQvL2l0ZXJhdGUgdGhyb3VnaCBhbGwgZW50aXRpZXNcblx0XHR3aGlsZSAoaXRlbSkge1xuXHRcdFx0aXRlbS5lbnRpdHkuX2lDb2xsZWN0UmVuZGVyYWJsZXModGhpcyk7XG5cdFx0XHRpdGVtID0gaXRlbS5uZXh0O1xuXHRcdH1cblxuXHRcdC8vc29ydCB0aGUgcmVzdWx0aW5nIHJlbmRlcmFibGVzXG5cdFx0dGhpcy5fcE9wYXF1ZVJlbmRlcmFibGVIZWFkID0gPFJlbmRlcmFibGVCYXNlPiB0aGlzLnJlbmRlcmFibGVTb3J0ZXIuc29ydE9wYXF1ZVJlbmRlcmFibGVzKHRoaXMuX3BPcGFxdWVSZW5kZXJhYmxlSGVhZCk7XG5cdFx0dGhpcy5fcEJsZW5kZWRSZW5kZXJhYmxlSGVhZCA9IDxSZW5kZXJhYmxlQmFzZT4gdGhpcy5yZW5kZXJhYmxlU29ydGVyLnNvcnRCbGVuZGVkUmVuZGVyYWJsZXModGhpcy5fcEJsZW5kZWRSZW5kZXJhYmxlSGVhZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVycyB0aGUgcG90ZW50aWFsbHkgdmlzaWJsZSBnZW9tZXRyeSB0byB0aGUgYmFjayBidWZmZXIgb3IgdGV4dHVyZS4gT25seSBleGVjdXRlZCBpZiBldmVyeXRoaW5nIGlzIHNldCB1cC5cblx0ICpcblx0ICogQHBhcmFtIGVudGl0eUNvbGxlY3RvciBUaGUgRW50aXR5Q29sbGVjdG9yIG9iamVjdCBjb250YWluaW5nIHRoZSBwb3RlbnRpYWxseSB2aXNpYmxlIGdlb21ldHJ5LlxuXHQgKiBAcGFyYW0gdGFyZ2V0IEFuIG9wdGlvbiB0YXJnZXQgdGV4dHVyZSB0byByZW5kZXIgdG8uXG5cdCAqIEBwYXJhbSBzdXJmYWNlU2VsZWN0b3IgVGhlIGluZGV4IG9mIGEgQ3ViZVRleHR1cmUncyBmYWNlIHRvIHJlbmRlciB0by5cblx0ICogQHBhcmFtIGFkZGl0aW9uYWxDbGVhck1hc2sgQWRkaXRpb25hbCBjbGVhciBtYXNrIGluZm9ybWF0aW9uLCBpbiBjYXNlIGV4dHJhIGNsZWFyIGNoYW5uZWxzIGFyZSB0byBiZSBvbWl0dGVkLlxuXHQgKi9cblx0cHVibGljIHBFeGVjdXRlUmVuZGVyKGVudGl0eUNvbGxlY3RvcjpJQ29sbGVjdG9yLCB0YXJnZXQ6VGV4dHVyZVByb3h5QmFzZSA9IG51bGwsIHNjaXNzb3JSZWN0OlJlY3RhbmdsZSA9IG51bGwsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0dGhpcy5fcENvbnRleHQuc2V0UmVuZGVyVGFyZ2V0KHRhcmdldCwgdHJ1ZSwgc3VyZmFjZVNlbGVjdG9yKTtcblxuXHRcdGlmICgodGFyZ2V0IHx8ICF0aGlzLl9zaGFyZUNvbnRleHQpICYmICF0aGlzLl9kZXB0aFByZXBhc3MpXG5cdFx0XHR0aGlzLl9wQ29udGV4dC5jbGVhcih0aGlzLl9iYWNrZ3JvdW5kUiwgdGhpcy5fYmFja2dyb3VuZEcsIHRoaXMuX2JhY2tncm91bmRCLCB0aGlzLl9iYWNrZ3JvdW5kQWxwaGEsIDEsIDApO1xuXG5cdFx0dGhpcy5fcENvbnRleHQuc2V0RGVwdGhUZXN0KGZhbHNlLCBDb250ZXh0R0xDb21wYXJlTW9kZS5BTFdBWVMpO1xuXG5cdFx0dGhpcy5fcFN0YWdlLnNjaXNzb3JSZWN0ID0gc2Npc3NvclJlY3Q7XG5cblx0XHQvKlxuXHRcdCBpZiAoX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyKVxuXHRcdCBfYmFja2dyb3VuZEltYWdlUmVuZGVyZXIucmVuZGVyKCk7XG5cdFx0ICovXG5cblx0XHR0aGlzLnBEcmF3KGVudGl0eUNvbGxlY3RvciwgdGFyZ2V0KTtcblxuXHRcdC8vbGluZSByZXF1aXJlZCBmb3IgY29ycmVjdCByZW5kZXJpbmcgd2hlbiB1c2luZyBhd2F5M2Qgd2l0aCBzdGFybGluZy4gRE8gTk9UIFJFTU9WRSBVTkxFU1MgU1RBUkxJTkcgSU5URUdSQVRJT04gSVMgUkVURVNURUQhXG5cdFx0Ly90aGlzLl9wQ29udGV4dC5zZXREZXB0aFRlc3QoZmFsc2UsIENvbnRleHRHTENvbXBhcmVNb2RlLkxFU1NfRVFVQUwpOyAvL29vcHNpZVxuXG5cdFx0aWYgKCF0aGlzLl9zaGFyZUNvbnRleHQpIHtcblx0XHRcdGlmICh0aGlzLl9zbmFwc2hvdFJlcXVpcmVkICYmIHRoaXMuX3NuYXBzaG90Qml0bWFwRGF0YSkge1xuXHRcdFx0XHR0aGlzLl9wQ29udGV4dC5kcmF3VG9CaXRtYXBEYXRhKHRoaXMuX3NuYXBzaG90Qml0bWFwRGF0YSk7XG5cdFx0XHRcdHRoaXMuX3NuYXBzaG90UmVxdWlyZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9wU3RhZ2Uuc2Npc3NvclJlY3QgPSBudWxsO1xuXHR9XG5cblx0Lypcblx0ICogV2lsbCBkcmF3IHRoZSByZW5kZXJlcidzIG91dHB1dCBvbiBuZXh0IHJlbmRlciB0byB0aGUgcHJvdmlkZWQgYml0bWFwIGRhdGEuXG5cdCAqICovXG5cdHB1YmxpYyBxdWV1ZVNuYXBzaG90KGJtZDpCaXRtYXBEYXRhKVxuXHR7XG5cdFx0dGhpcy5fc25hcHNob3RSZXF1aXJlZCA9IHRydWU7XG5cdFx0dGhpcy5fc25hcHNob3RCaXRtYXBEYXRhID0gYm1kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgZHJhd2luZyBvZiBnZW9tZXRyeSB0byB0aGUgdGFyZ2V0LlxuXHQgKiBAcGFyYW0gZW50aXR5Q29sbGVjdG9yIFRoZSBFbnRpdHlDb2xsZWN0b3Igb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBvdGVudGlhbGx5IHZpc2libGUgZ2VvbWV0cnkuXG5cdCAqL1xuXHRwdWJsaWMgcERyYXcoZW50aXR5Q29sbGVjdG9yOklDb2xsZWN0b3IsIHRhcmdldDpUZXh0dXJlUHJveHlCYXNlKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBc3NpZ24gdGhlIGNvbnRleHQgb25jZSByZXRyaWV2ZWRcblx0ICovXG5cdHByaXZhdGUgb25Db250ZXh0VXBkYXRlKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fcENvbnRleHQgPSA8SUNvbnRleHRTdGFnZUdMPiB0aGlzLl9wU3RhZ2UuY29udGV4dDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgX2lCYWNrZ3JvdW5kQWxwaGEoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kQWxwaGE7XG5cdH1cblxuXHRwdWJsaWMgc2V0IF9pQmFja2dyb3VuZEFscGhhKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9iYWNrZ3JvdW5kQWxwaGEgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9iYWNrZ3JvdW5kQWxwaGEgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BCYWNrQnVmZmVySW52YWxpZCA9IHRydWU7XG5cdH1cblxuXHQvKlxuXHQgcHVibGljIGdldCBpQmFja2dyb3VuZCgpOlRleHR1cmUyREJhc2Vcblx0IHtcblx0IHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kO1xuXHQgfVxuXHQgKi9cblxuXHQvKlxuXHQgcHVibGljIHNldCBpQmFja2dyb3VuZCh2YWx1ZTpUZXh0dXJlMkRCYXNlKVxuXHQge1xuXHQgaWYgKHRoaXMuX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyICYmICF2YWx1ZSkge1xuXHQgdGhpcy5fYmFja2dyb3VuZEltYWdlUmVuZGVyZXIuZGlzcG9zZSgpO1xuXHQgdGhpcy5fYmFja2dyb3VuZEltYWdlUmVuZGVyZXIgPSBudWxsO1xuXHQgfVxuXG5cdCBpZiAoIXRoaXMuX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyICYmIHZhbHVlKVxuXHQge1xuXG5cdCB0aGlzLl9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlciA9IG5ldyBCYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlcih0aGlzLl9wU3RhZ2UpO1xuXG5cdCB9XG5cblxuXHQgdGhpcy5fYmFja2dyb3VuZCA9IHZhbHVlO1xuXG5cdCBpZiAodGhpcy5fYmFja2dyb3VuZEltYWdlUmVuZGVyZXIpXG5cdCB0aGlzLl9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlci50ZXh0dXJlID0gdmFsdWU7XG5cdCB9XG5cdCAqL1xuXHQvKlxuXHQgcHVibGljIGdldCBiYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlcigpOkJhY2tncm91bmRJbWFnZVJlbmRlcmVyXG5cdCB7XG5cdCByZXR1cm4gX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyO1xuXHQgfVxuXHQgKi9cblxuXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBub3RpZnlTY2lzc29yVXBkYXRlKClcblx0e1xuXHRcdGlmICh0aGlzLl9zY2lzc29yRGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9zY2lzc29yRGlydHkgPSB0cnVlO1xuXG5cdFx0aWYgKCF0aGlzLl9zY2lzc29yVXBkYXRlZClcblx0XHRcdHRoaXMuX3NjaXNzb3JVcGRhdGVkID0gbmV3IFJlbmRlcmVyRXZlbnQoUmVuZGVyZXJFdmVudC5TQ0lTU09SX1VQREFURUQpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3NjaXNzb3JVcGRhdGVkKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIG5vdGlmeVZpZXdwb3J0VXBkYXRlKClcblx0e1xuXHRcdGlmICh0aGlzLl92aWV3cG9ydERpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IHRydWU7XG5cblx0XHRpZiAoIXRoaXMuX3ZpZXdQb3J0VXBkYXRlZClcblx0XHRcdHRoaXMuX3ZpZXdQb3J0VXBkYXRlZCA9IG5ldyBSZW5kZXJlckV2ZW50KFJlbmRlcmVyRXZlbnQuVklFV1BPUlRfVVBEQVRFRCk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fdmlld1BvcnRVcGRhdGVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIG9uVmlld3BvcnRVcGRhdGVkKGV2ZW50OlN0YWdlRXZlbnQpXG5cdHtcblx0XHR0aGlzLl92aWV3UG9ydCA9IHRoaXMuX3BTdGFnZS52aWV3UG9ydDtcblx0XHQvL1RPRE8gc3RvcCBmaXJpbmcgdmlld3BvcnQgdXBkYXRlZCBmb3IgZXZlcnkgc3RhZ2VnbCB2aWV3cG9ydCBjaGFuZ2VcblxuXHRcdGlmICh0aGlzLl9zaGFyZUNvbnRleHQpIHtcblx0XHRcdHRoaXMuX3BTY2lzc29yUmVjdC54ID0gdGhpcy5fZ2xvYmFsUG9zLnggLSB0aGlzLl9wU3RhZ2UueDtcblx0XHRcdHRoaXMuX3BTY2lzc29yUmVjdC55ID0gdGhpcy5fZ2xvYmFsUG9zLnkgLSB0aGlzLl9wU3RhZ2UueTtcblx0XHRcdHRoaXMubm90aWZ5U2Npc3NvclVwZGF0ZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHVwZGF0ZUdsb2JhbFBvcygpXG5cdHtcblx0XHRpZiAodGhpcy5fc2hhcmVDb250ZXh0KSB7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueCA9IHRoaXMuX2dsb2JhbFBvcy54IC0gdGhpcy5fdmlld1BvcnQueDtcblx0XHRcdHRoaXMuX3BTY2lzc29yUmVjdC55ID0gdGhpcy5fZ2xvYmFsUG9zLnkgLSB0aGlzLl92aWV3UG9ydC55O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueCA9IDA7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueSA9IDA7XG5cdFx0XHR0aGlzLl92aWV3UG9ydC54ID0gdGhpcy5fZ2xvYmFsUG9zLng7XG5cdFx0XHR0aGlzLl92aWV3UG9ydC55ID0gdGhpcy5fZ2xvYmFsUG9zLnk7XG5cdFx0fVxuXG5cdFx0dGhpcy5ub3RpZnlTY2lzc29yVXBkYXRlKCk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYmlsbGJvYXJkXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHB1YmxpYyBhcHBseUJpbGxib2FyZChiaWxsYm9hcmQ6QmlsbGJvYXJkKVxuXHR7XG5cdFx0dGhpcy5fYXBwbHlSZW5kZXJhYmxlKDxSZW5kZXJhYmxlQmFzZT4gdGhpcy5fYmlsbGJvYXJkUmVuZGVyYWJsZVBvb2wuZ2V0SXRlbShiaWxsYm9hcmQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gdHJpYW5nbGVTdWJNZXNoXG5cdCAqL1xuXHRwdWJsaWMgYXBwbHlUcmlhbmdsZVN1Yk1lc2godHJpYW5nbGVTdWJNZXNoOlRyaWFuZ2xlU3ViTWVzaClcblx0e1xuXHRcdHRoaXMuX2FwcGx5UmVuZGVyYWJsZSg8UmVuZGVyYWJsZUJhc2U+IHRoaXMuX3RyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGVQb29sLmdldEl0ZW0odHJpYW5nbGVTdWJNZXNoKSk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGxpbmVTdWJNZXNoXG5cdCAqL1xuXHRwdWJsaWMgYXBwbHlMaW5lU3ViTWVzaChsaW5lU3ViTWVzaDpMaW5lU3ViTWVzaClcblx0e1xuXHRcdHRoaXMuX2FwcGx5UmVuZGVyYWJsZSg8UmVuZGVyYWJsZUJhc2U+IHRoaXMuX2xpbmVTdWJNZXNoUmVuZGVyYWJsZVBvb2wuZ2V0SXRlbShsaW5lU3ViTWVzaCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSByZW5kZXJhYmxlXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHByaXZhdGUgX2FwcGx5UmVuZGVyYWJsZShyZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlKVxuXHR7XG5cdFx0dmFyIG1hdGVyaWFsOk1hdGVyaWFsQmFzZSA9IHJlbmRlcmFibGUubWF0ZXJpYWxPd25lci5tYXRlcmlhbDtcblx0XHR2YXIgZW50aXR5OklFbnRpdHkgPSByZW5kZXJhYmxlLnNvdXJjZUVudGl0eTtcblx0XHR2YXIgcG9zaXRpb246VmVjdG9yM0QgPSBlbnRpdHkuc2NlbmVQb3NpdGlvbjtcblxuXHRcdGlmICghbWF0ZXJpYWwpXG5cdFx0XHRtYXRlcmlhbCA9IERlZmF1bHRNYXRlcmlhbE1hbmFnZXIuZ2V0RGVmYXVsdE1hdGVyaWFsKHJlbmRlcmFibGUubWF0ZXJpYWxPd25lcik7XG5cblx0XHQvL3VwZGF0ZSBtYXRlcmlhbCBpZiBpbnZhbGlkYXRlZFxuXHRcdG1hdGVyaWFsLl9pVXBkYXRlTWF0ZXJpYWwoKTtcblxuXHRcdC8vc2V0IGlkcyBmb3IgZmFzdGVyIHJlZmVyZW5jaW5nXG5cdFx0cmVuZGVyYWJsZS5tYXRlcmlhbCA9IG1hdGVyaWFsO1xuXHRcdHJlbmRlcmFibGUubWF0ZXJpYWxJZCA9IG1hdGVyaWFsLl9pTWF0ZXJpYWxJZDtcblx0XHRyZW5kZXJhYmxlLnJlbmRlck9yZGVySWQgPSB0aGlzLl9wQ29udGV4dC5nZXRNYXRlcmlhbChtYXRlcmlhbCwgdGhpcy5fcFN0YWdlLnByb2ZpbGUpLnJlbmRlck9yZGVySWQ7XG5cdFx0cmVuZGVyYWJsZS5jYXNjYWRlZCA9IGZhbHNlO1xuXG5cdFx0Ly8gcHJvamVjdCBvbnRvIGNhbWVyYSdzIHotYXhpc1xuXHRcdHBvc2l0aW9uID0gdGhpcy5faUVudHJ5UG9pbnQuc3VidHJhY3QocG9zaXRpb24pO1xuXHRcdHJlbmRlcmFibGUuekluZGV4ID0gZW50aXR5LnpPZmZzZXQgKyBwb3NpdGlvbi5kb3RQcm9kdWN0KHRoaXMuX3BDYW1lcmFGb3J3YXJkKTtcblxuXHRcdC8vc3RvcmUgcmVmZXJlbmNlIHRvIHNjZW5lIHRyYW5zZm9ybVxuXHRcdHJlbmRlcmFibGUucmVuZGVyU2NlbmVUcmFuc2Zvcm0gPSByZW5kZXJhYmxlLnNvdXJjZUVudGl0eS5nZXRSZW5kZXJTY2VuZVRyYW5zZm9ybSh0aGlzLl9wQ2FtZXJhKTtcblxuXHRcdGlmIChtYXRlcmlhbC5yZXF1aXJlc0JsZW5kaW5nKSB7XG5cdFx0XHRyZW5kZXJhYmxlLm5leHQgPSB0aGlzLl9wQmxlbmRlZFJlbmRlcmFibGVIZWFkO1xuXHRcdFx0dGhpcy5fcEJsZW5kZWRSZW5kZXJhYmxlSGVhZCA9IHJlbmRlcmFibGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbmRlcmFibGUubmV4dCA9IHRoaXMuX3BPcGFxdWVSZW5kZXJhYmxlSGVhZDtcblx0XHRcdHRoaXMuX3BPcGFxdWVSZW5kZXJhYmxlSGVhZCA9IHJlbmRlcmFibGU7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcE51bVRyaWFuZ2xlcyArPSByZW5kZXJhYmxlLm51bVRyaWFuZ2xlcztcblxuXHRcdC8vaGFuZGxlIGFueSBvdmVyZmxvdyBmb3IgcmVuZGVyYWJsZXMgd2l0aCBkYXRhIHRoYXQgZXhjZWVkcyBHUFUgbGltaXRhdGlvbnNcblx0XHRpZiAocmVuZGVyYWJsZS5vdmVyZmxvdylcblx0XHRcdHRoaXMuX2FwcGx5UmVuZGVyYWJsZShyZW5kZXJhYmxlLm92ZXJmbG93KTtcblx0fVxufVxuXG5leHBvcnQgPSBSZW5kZXJlckJhc2U7Il19