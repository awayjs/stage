var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Matrix3D = require("awayjs-core/lib/core/geom/Matrix3D");
var Point = require("awayjs-core/lib/core/geom/Point");
var Rectangle = require("awayjs-core/lib/core/geom/Rectangle");
var RenderablePool = require("awayjs-core/lib/core/pool/RenderablePool");
var RenderableMergeSort = require("awayjs-core/lib/core/sort/RenderableMergeSort");
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var RendererEvent = require("awayjs-core/lib/events/RendererEvent");
var StageEvent = require("awayjs-core/lib/events/StageEvent");
var EntityCollector = require("awayjs-core/lib/core/traverse/EntityCollector");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvcmVuZGVyL3JlbmRlcmVyYmFzZS50cyJdLCJuYW1lcyI6WyJSZW5kZXJlckJhc2UiLCJSZW5kZXJlckJhc2UuY29uc3RydWN0b3IiLCJSZW5kZXJlckJhc2UubnVtVHJpYW5nbGVzIiwiUmVuZGVyZXJCYXNlLnZpZXdQb3J0IiwiUmVuZGVyZXJCYXNlLnNjaXNzb3JSZWN0IiwiUmVuZGVyZXJCYXNlLngiLCJSZW5kZXJlckJhc2UueSIsIlJlbmRlcmVyQmFzZS53aWR0aCIsIlJlbmRlcmVyQmFzZS5oZWlnaHQiLCJSZW5kZXJlckJhc2UuX2lDcmVhdGVFbnRpdHlDb2xsZWN0b3IiLCJSZW5kZXJlckJhc2UuX2lCYWNrZ3JvdW5kUiIsIlJlbmRlcmVyQmFzZS5faUJhY2tncm91bmRHIiwiUmVuZGVyZXJCYXNlLl9pQmFja2dyb3VuZEIiLCJSZW5kZXJlckJhc2Uuc3RhZ2UiLCJSZW5kZXJlckJhc2UuaVNldFN0YWdlIiwiUmVuZGVyZXJCYXNlLnNoYXJlQ29udGV4dCIsIlJlbmRlcmVyQmFzZS5kaXNwb3NlIiwiUmVuZGVyZXJCYXNlLnJlbmRlciIsIlJlbmRlcmVyQmFzZS5faVJlbmRlciIsIlJlbmRlcmVyQmFzZS5faVJlbmRlckNhc2NhZGVzIiwiUmVuZGVyZXJCYXNlLnBDb2xsZWN0UmVuZGVyYWJsZXMiLCJSZW5kZXJlckJhc2UucEV4ZWN1dGVSZW5kZXIiLCJSZW5kZXJlckJhc2UucXVldWVTbmFwc2hvdCIsIlJlbmRlcmVyQmFzZS5wRHJhdyIsIlJlbmRlcmVyQmFzZS5vbkNvbnRleHRVcGRhdGUiLCJSZW5kZXJlckJhc2UuX2lCYWNrZ3JvdW5kQWxwaGEiLCJSZW5kZXJlckJhc2Uubm90aWZ5U2Npc3NvclVwZGF0ZSIsIlJlbmRlcmVyQmFzZS5ub3RpZnlWaWV3cG9ydFVwZGF0ZSIsIlJlbmRlcmVyQmFzZS5vblZpZXdwb3J0VXBkYXRlZCIsIlJlbmRlcmVyQmFzZS51cGRhdGVHbG9iYWxQb3MiLCJSZW5kZXJlckJhc2UuYXBwbHlCaWxsYm9hcmQiLCJSZW5kZXJlckJhc2UuYXBwbHlUcmlhbmdsZVN1Yk1lc2giLCJSZW5kZXJlckJhc2UuYXBwbHlMaW5lU3ViTWVzaCIsIlJlbmRlcmVyQmFzZS5fYXBwbHlSZW5kZXJhYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJQSxJQUFPLFFBQVEsV0FBZ0Isb0NBQW9DLENBQUMsQ0FBQztBQUNyRSxJQUFPLEtBQUssV0FBZ0IsaUNBQWlDLENBQUMsQ0FBQztBQUMvRCxJQUFPLFNBQVMsV0FBZSxxQ0FBcUMsQ0FBQyxDQUFDO0FBR3RFLElBQU8sY0FBYyxXQUFjLDBDQUEwQyxDQUFDLENBQUM7QUFFL0UsSUFBTyxtQkFBbUIsV0FBYSwrQ0FBK0MsQ0FBQyxDQUFDO0FBTXhGLElBQU8sbUJBQW1CLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLGVBQWUsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzlFLElBQU8sYUFBYSxXQUFjLHNDQUFzQyxDQUFDLENBQUM7QUFDMUUsSUFBTyxVQUFVLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUdyRSxJQUFPLGVBQWUsV0FBYywrQ0FBK0MsQ0FBQyxDQUFDO0FBSXJGLElBQU8sbUJBQW1CLFdBQWEsa0RBQWtELENBQUMsQ0FBQztBQUMzRixJQUFPLHFCQUFxQixXQUFZLG9EQUFvRCxDQUFDLENBQUM7QUFFOUYsSUFBTyx5QkFBeUIsV0FBVyx3REFBd0QsQ0FBQyxDQUFDO0FBQ3JHLElBQU8sb0JBQW9CLFdBQWEsc0RBQXNELENBQUMsQ0FBQztBQUdoRyxJQUFPLHNCQUFzQixXQUFZLDJEQUEyRCxDQUFDLENBQUM7QUFFdEcsQUFNQTs7Ozs7R0FERztJQUNHLFlBQVk7SUFBU0EsVUFBckJBLFlBQVlBLFVBQXdCQTtJQTBLekNBOztPQUVHQTtJQUNIQSxTQTdLS0EsWUFBWUE7UUFBbEJDLGlCQTJwQkNBO1FBNWVDQSxpQkFBT0EsQ0FBQ0E7UUFqS0RBLGNBQVNBLEdBQWFBLElBQUlBLFNBQVNBLEVBQUVBLENBQUNBO1FBSXZDQSx3QkFBbUJBLEdBQVdB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ekM7QUFFRCxBQUFzQixpQkFBYixZQUFZLENBQUMiLCJmaWxlIjoiY29yZS9yZW5kZXIvUmVuZGVyZXJCYXNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IExpbmVTdWJNZXNoXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvTGluZVN1Yk1lc2hcIik7XG5pbXBvcnQgVHJpYW5nbGVTdWJNZXNoXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL1RyaWFuZ2xlU3ViTWVzaFwiKTtcbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgTWF0cml4M0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL01hdHJpeDNEXCIpO1xuaW1wb3J0IFBvaW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9Qb2ludFwiKTtcbmltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9SZWN0YW5nbGVcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IEVudGl0eUxpc3RJdGVtXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9wb29sL0VudGl0eUxpc3RJdGVtXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9wb29sL1JlbmRlcmFibGVQb29sXCIpO1xuaW1wb3J0IElFbnRpdHlTb3J0ZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL3NvcnQvSUVudGl0eVNvcnRlclwiKTtcbmltcG9ydCBSZW5kZXJhYmxlTWVyZ2VTb3J0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvc29ydC9SZW5kZXJhYmxlTWVyZ2VTb3J0XCIpO1xuaW1wb3J0IElSZW5kZXJlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9yZW5kZXIvSVJlbmRlcmVyXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZW50aXRpZXMvQmlsbGJvYXJkXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgSUVudGl0eVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9JRW50aXR5XCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcbmltcG9ydCBFdmVudERpc3BhdGNoZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnREaXNwYXRjaGVyXCIpO1xuaW1wb3J0IFJlbmRlcmVyRXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvUmVuZGVyZXJFdmVudFwiKTtcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcbmltcG9ydCBNYXRlcmlhbEJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL21hdGVyaWFscy9NYXRlcmlhbEJhc2VcIik7XG5pbXBvcnQgVGV4dHVyZVByb3h5QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmVQcm94eUJhc2VcIik7XG5pbXBvcnQgRW50aXR5Q29sbGVjdG9yXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS90cmF2ZXJzZS9FbnRpdHlDb2xsZWN0b3JcIik7XG5pbXBvcnQgSUNvbGxlY3Rvclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS90cmF2ZXJzZS9JQ29sbGVjdG9yXCIpO1xuaW1wb3J0IFNoYWRvd0Nhc3RlckNvbGxlY3Rvclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS90cmF2ZXJzZS9TaGFkb3dDYXN0ZXJDb2xsZWN0b3JcIik7XG5cbmltcG9ydCBCaWxsYm9hcmRSZW5kZXJhYmxlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9CaWxsYm9hcmRSZW5kZXJhYmxlXCIpO1xuaW1wb3J0IExpbmVTdWJNZXNoUmVuZGVyYWJsZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL0xpbmVTdWJNZXNoUmVuZGVyYWJsZVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcbmltcG9ydCBUcmlhbmdsZVN1Yk1lc2hSZW5kZXJhYmxlXHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1RyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGVcIik7XG5pbXBvcnQgQ29udGV4dEdMQ29tcGFyZU1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTENvbXBhcmVNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0U3RhZ2VHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvc3RhZ2VnbC9JQ29udGV4dFN0YWdlR0xcIik7XG5pbXBvcnQgUlRUQnVmZmVyTWFuYWdlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1JUVEJ1ZmZlck1hbmFnZXJcIik7XG5pbXBvcnQgRGVmYXVsdE1hdGVyaWFsTWFuYWdlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3V0aWxzL0RlZmF1bHRNYXRlcmlhbE1hbmFnZXJcIik7XG5cbi8qKlxuICogUmVuZGVyZXJCYXNlIGZvcm1zIGFuIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGNsYXNzZXMgdGhhdCBhcmUgdXNlZCBpbiB0aGUgcmVuZGVyaW5nIHBpcGVsaW5lIHRvIHJlbmRlciB0aGVcbiAqIGNvbnRlbnRzIG9mIGEgcGFydGl0aW9uXG4gKlxuICogQGNsYXNzIGF3YXkucmVuZGVyLlJlbmRlcmVyQmFzZVxuICovXG5jbGFzcyBSZW5kZXJlckJhc2UgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXJcbntcblx0cHJpdmF0ZSBfYmlsbGJvYXJkUmVuZGVyYWJsZVBvb2w6UmVuZGVyYWJsZVBvb2w7XG5cdHByaXZhdGUgX3RyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGVQb29sOlJlbmRlcmFibGVQb29sO1xuXHRwcml2YXRlIF9saW5lU3ViTWVzaFJlbmRlcmFibGVQb29sOlJlbmRlcmFibGVQb29sO1xuXG5cdHB1YmxpYyBfcENvbnRleHQ6SUNvbnRleHRTdGFnZUdMO1xuXHRwdWJsaWMgX3BTdGFnZTpTdGFnZTtcblxuXHRwdWJsaWMgX3BDYW1lcmE6Q2FtZXJhO1xuXHRwdWJsaWMgX2lFbnRyeVBvaW50OlZlY3RvcjNEO1xuXHRwdWJsaWMgX3BDYW1lcmFGb3J3YXJkOlZlY3RvcjNEO1xuXG5cdHB1YmxpYyBfcFJ0dEJ1ZmZlck1hbmFnZXI6UlRUQnVmZmVyTWFuYWdlcjtcblx0cHJpdmF0ZSBfdmlld1BvcnQ6UmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSgpO1xuXHRwcml2YXRlIF92aWV3cG9ydERpcnR5OmJvb2xlYW47XG5cdHByaXZhdGUgX3NjaXNzb3JEaXJ0eTpib29sZWFuO1xuXG5cdHB1YmxpYyBfcEJhY2tCdWZmZXJJbnZhbGlkOmJvb2xlYW4gPSB0cnVlO1xuXHRwdWJsaWMgX3BEZXB0aFRleHR1cmVJbnZhbGlkOmJvb2xlYW4gPSB0cnVlO1xuXHRwdWJsaWMgX2RlcHRoUHJlcGFzczpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2JhY2tncm91bmRSOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2JhY2tncm91bmRHOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2JhY2tncm91bmRCOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2JhY2tncm91bmRBbHBoYTpudW1iZXIgPSAxO1xuXHRwdWJsaWMgX3NoYXJlQ29udGV4dDpib29sZWFuID0gZmFsc2U7XG5cblx0Ly8gb25seSB1c2VkIGJ5IHJlbmRlcmVycyB0aGF0IG5lZWQgdG8gcmVuZGVyIGdlb21ldHJ5IHRvIHRleHR1cmVzXG5cdHB1YmxpYyBfd2lkdGg6bnVtYmVyO1xuXHRwdWJsaWMgX2hlaWdodDpudW1iZXI7XG5cblx0cHVibGljIHRleHR1cmVSYXRpb1g6bnVtYmVyID0gMTtcblx0cHVibGljIHRleHR1cmVSYXRpb1k6bnVtYmVyID0gMTtcblxuXHRwcml2YXRlIF9zbmFwc2hvdEJpdG1hcERhdGE6Qml0bWFwRGF0YTtcblx0cHJpdmF0ZSBfc25hcHNob3RSZXF1aXJlZDpib29sZWFuO1xuXG5cdHB1YmxpYyBfcFJ0dFZpZXdQcm9qZWN0aW9uTWF0cml4Ok1hdHJpeDNEID0gbmV3IE1hdHJpeDNEKCk7XG5cblx0cHJpdmF0ZSBfbG9jYWxQb3M6UG9pbnQgPSBuZXcgUG9pbnQoKTtcblx0cHJpdmF0ZSBfZ2xvYmFsUG9zOlBvaW50ID0gbmV3IFBvaW50KCk7XG5cdHB1YmxpYyBfcFNjaXNzb3JSZWN0OlJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoKTtcblxuXHRwcml2YXRlIF9zY2lzc29yVXBkYXRlZDpSZW5kZXJlckV2ZW50O1xuXHRwcml2YXRlIF92aWV3UG9ydFVwZGF0ZWQ6UmVuZGVyZXJFdmVudDtcblxuXHRwcml2YXRlIF9vbkNvbnRleHRVcGRhdGVEZWxlZ2F0ZTpGdW5jdGlvbjtcblx0cHJpdmF0ZSBfb25WaWV3cG9ydFVwZGF0ZWREZWxlZ2F0ZTtcblxuXHRwdWJsaWMgX3BOdW1UcmlhbmdsZXM6bnVtYmVyID0gMDtcblxuXHRwdWJsaWMgX3BPcGFxdWVSZW5kZXJhYmxlSGVhZDpSZW5kZXJhYmxlQmFzZTtcblx0cHVibGljIF9wQmxlbmRlZFJlbmRlcmFibGVIZWFkOlJlbmRlcmFibGVCYXNlO1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBudW1UcmlhbmdsZXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTnVtVHJpYW5nbGVzO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgcmVuZGVyYWJsZVNvcnRlcjpJRW50aXR5U29ydGVyO1xuXG5cblx0LyoqXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCB2aWV3UG9ydCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2Npc3NvciByZWN0YW5nbGUgZXF1aXZhbGVudCBvZiB0aGUgdmlldyBzaXplIGFuZCBwb3NpdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgc2Npc3NvclJlY3QoKTpSZWN0YW5nbGVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wU2Npc3NvclJlY3Q7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgeCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2xvY2FsUG9zLng7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHgodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMueCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2dsb2JhbFBvcy54ID0gdGhpcy5fbG9jYWxQb3MueCA9IHZhbHVlO1xuXG5cdFx0dGhpcy51cGRhdGVHbG9iYWxQb3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCB5KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbG9jYWxQb3MueTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeSh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy55ID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fZ2xvYmFsUG9zLnkgPSB0aGlzLl9sb2NhbFBvcy55ID0gdmFsdWU7XG5cblx0XHR0aGlzLnVwZGF0ZUdsb2JhbFBvcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHdpZHRoKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fd2lkdGg7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHdpZHRoKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl93aWR0aCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3dpZHRoID0gdmFsdWU7XG5cdFx0dGhpcy5fcFNjaXNzb3JSZWN0LndpZHRoID0gdmFsdWU7XG5cblx0XHRpZiAodGhpcy5fcFJ0dEJ1ZmZlck1hbmFnZXIpXG5cdFx0XHR0aGlzLl9wUnR0QnVmZmVyTWFuYWdlci52aWV3V2lkdGggPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BCYWNrQnVmZmVySW52YWxpZCA9IHRydWU7XG5cdFx0dGhpcy5fcERlcHRoVGV4dHVyZUludmFsaWQgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlTY2lzc29yVXBkYXRlKCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0cHVibGljIHNldCBoZWlnaHQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2hlaWdodCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2hlaWdodCA9IHZhbHVlO1xuXHRcdHRoaXMuX3BTY2lzc29yUmVjdC5oZWlnaHQgPSB2YWx1ZTtcblxuXHRcdGlmICh0aGlzLl9wUnR0QnVmZmVyTWFuYWdlcilcblx0XHRcdHRoaXMuX3BSdHRCdWZmZXJNYW5hZ2VyLnZpZXdIZWlnaHQgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BCYWNrQnVmZmVySW52YWxpZCA9IHRydWU7XG5cdFx0dGhpcy5fcERlcHRoVGV4dHVyZUludmFsaWQgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlTY2lzc29yVXBkYXRlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBSZW5kZXJlckJhc2Ugb2JqZWN0LlxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX29uVmlld3BvcnRVcGRhdGVkRGVsZWdhdGUgPSAoZXZlbnQ6U3RhZ2VFdmVudCkgPT4gdGhpcy5vblZpZXdwb3J0VXBkYXRlZChldmVudCk7XG5cblx0XHR0aGlzLl9iaWxsYm9hcmRSZW5kZXJhYmxlUG9vbCA9IFJlbmRlcmFibGVQb29sLmdldFBvb2woQmlsbGJvYXJkUmVuZGVyYWJsZSk7XG5cdFx0dGhpcy5fdHJpYW5nbGVTdWJNZXNoUmVuZGVyYWJsZVBvb2wgPSBSZW5kZXJhYmxlUG9vbC5nZXRQb29sKFRyaWFuZ2xlU3ViTWVzaFJlbmRlcmFibGUpO1xuXHRcdHRoaXMuX2xpbmVTdWJNZXNoUmVuZGVyYWJsZVBvb2wgPSBSZW5kZXJhYmxlUG9vbC5nZXRQb29sKExpbmVTdWJNZXNoUmVuZGVyYWJsZSk7XG5cblx0XHR0aGlzLl9vbkNvbnRleHRVcGRhdGVEZWxlZ2F0ZSA9IChldmVudDpFdmVudCkgPT4gdGhpcy5vbkNvbnRleHRVcGRhdGUoZXZlbnQpO1xuXG5cdFx0Ly9kZWZhdWx0IHNvcnRpbmcgYWxnb3JpdGhtXG5cdFx0dGhpcy5yZW5kZXJhYmxlU29ydGVyID0gbmV3IFJlbmRlcmFibGVNZXJnZVNvcnQoKTtcblx0fVxuXG5cdHB1YmxpYyBfaUNyZWF0ZUVudGl0eUNvbGxlY3RvcigpOklDb2xsZWN0b3Jcblx0e1xuXHRcdHJldHVybiBuZXcgRW50aXR5Q29sbGVjdG9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJhY2tncm91bmQgY29sb3IncyByZWQgY29tcG9uZW50LCB1c2VkIHdoZW4gY2xlYXJpbmcuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IF9pQmFja2dyb3VuZFIoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kUjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgX2lCYWNrZ3JvdW5kUih2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fYmFja2dyb3VuZFIgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9iYWNrZ3JvdW5kUiA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYmFja2dyb3VuZCBjb2xvcidzIGdyZWVuIGNvbXBvbmVudCwgdXNlZCB3aGVuIGNsZWFyaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGdldCBfaUJhY2tncm91bmRHKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYmFja2dyb3VuZEc7XG5cdH1cblxuXHRwdWJsaWMgc2V0IF9pQmFja2dyb3VuZEcodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2JhY2tncm91bmRHID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYmFja2dyb3VuZEcgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BCYWNrQnVmZmVySW52YWxpZCA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJhY2tncm91bmQgY29sb3IncyBibHVlIGNvbXBvbmVudCwgdXNlZCB3aGVuIGNsZWFyaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGdldCBfaUJhY2tncm91bmRCKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYmFja2dyb3VuZEI7XG5cdH1cblxuXHRwdWJsaWMgc2V0IF9pQmFja2dyb3VuZEIodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2JhY2tncm91bmRCID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYmFja2dyb3VuZEIgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BCYWNrQnVmZmVySW52YWxpZCA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIFN0YWdlIHRoYXQgd2lsbCBwcm92aWRlIHRoZSBDb250ZXh0R0wgdXNlZCBmb3IgcmVuZGVyaW5nLlxuXHQgKi9cblx0cHVibGljIGdldCBzdGFnZSgpOlN0YWdlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcFN0YWdlO1xuXHR9XG5cblx0cHVibGljIHNldCBzdGFnZSh2YWx1ZTpTdGFnZSlcblx0e1xuXHRcdGlmICh2YWx1ZSA9PSB0aGlzLl9wU3RhZ2UpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLmlTZXRTdGFnZSh2YWx1ZSk7XG5cdH1cblxuXHRwdWJsaWMgaVNldFN0YWdlKHZhbHVlOlN0YWdlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3BTdGFnZSkge1xuXHRcdFx0dGhpcy5fcFN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dFVwZGF0ZURlbGVnYXRlKTtcblx0XHRcdHRoaXMuX3BTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQsIHRoaXMuX29uQ29udGV4dFVwZGF0ZURlbGVnYXRlKTtcblx0XHRcdHRoaXMuX3BTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCwgdGhpcy5fb25WaWV3cG9ydFVwZGF0ZWREZWxlZ2F0ZSk7XG5cdFx0fVxuXG5cdFx0aWYgKCF2YWx1ZSkge1xuXHRcdFx0dGhpcy5fcFN0YWdlID0gbnVsbDtcblx0XHRcdHRoaXMuX3BDb250ZXh0ID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fcFN0YWdlID0gdmFsdWU7XG5cdFx0XHR0aGlzLl9wU3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdFx0dGhpcy5fcFN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdFx0dGhpcy5fcFN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5WSUVXUE9SVF9VUERBVEVELCB0aGlzLl9vblZpZXdwb3J0VXBkYXRlZERlbGVnYXRlKTtcblxuXHRcdFx0Lypcblx0XHRcdCBpZiAoX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyKVxuXHRcdFx0IF9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlci5zdGFnZSA9IHZhbHVlO1xuXHRcdFx0ICovXG5cdFx0XHRpZiAodGhpcy5fcFN0YWdlLmNvbnRleHQpXG5cdFx0XHRcdHRoaXMuX3BDb250ZXh0ID0gPElDb250ZXh0U3RhZ2VHTD4gdGhpcy5fcFN0YWdlLmNvbnRleHQ7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcEJhY2tCdWZmZXJJbnZhbGlkID0gdHJ1ZTtcblxuXHRcdHRoaXMudXBkYXRlR2xvYmFsUG9zKCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVmZXJzIGNvbnRyb2wgb2YgQ29udGV4dEdMIGNsZWFyKCkgYW5kIHByZXNlbnQoKSBjYWxscyB0byBTdGFnZSwgZW5hYmxpbmcgbXVsdGlwbGUgU3RhZ2UgZnJhbWV3b3Jrc1xuXHQgKiB0byBzaGFyZSB0aGUgc2FtZSBDb250ZXh0R0wgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGdldCBzaGFyZUNvbnRleHQoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2hhcmVDb250ZXh0O1xuXHR9XG5cblx0cHVibGljIHNldCBzaGFyZUNvbnRleHQodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9zaGFyZUNvbnRleHQgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9zaGFyZUNvbnRleHQgPSB2YWx1ZTtcblxuXHRcdHRoaXMudXBkYXRlR2xvYmFsUG9zKCk7XG5cdH1cblxuXHQvKipcblx0ICogRGlzcG9zZXMgdGhlIHJlc291cmNlcyB1c2VkIGJ5IHRoZSBSZW5kZXJlckJhc2UuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fcFJ0dEJ1ZmZlck1hbmFnZXIpXG5cdFx0XHR0aGlzLl9wUnR0QnVmZmVyTWFuYWdlci5kaXNwb3NlKCk7XG5cblx0XHR0aGlzLl9wUnR0QnVmZmVyTWFuYWdlciA9IG51bGw7XG5cblx0XHR0aGlzLl9wU3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0VXBkYXRlRGVsZWdhdGUpO1xuXHRcdHRoaXMuX3BTdGFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuQ09OVEVYVF9SRUNSRUFURUQsIHRoaXMuX29uQ29udGV4dFVwZGF0ZURlbGVnYXRlKTtcblx0XHR0aGlzLl9wU3RhZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQsIHRoaXMuX29uVmlld3BvcnRVcGRhdGVkRGVsZWdhdGUpO1xuXG5cdFx0dGhpcy5fcFN0YWdlID0gbnVsbDtcblxuXHRcdC8qXG5cdFx0IGlmIChfYmFja2dyb3VuZEltYWdlUmVuZGVyZXIpIHtcblx0XHQgX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyLmRpc3Bvc2UoKTtcblx0XHQgX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyID0gbnVsbDtcblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0cHVibGljIHJlbmRlcihlbnRpdHlDb2xsZWN0b3I6SUNvbGxlY3Rvcilcblx0e1xuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSBmYWxzZTtcblx0XHR0aGlzLl9zY2lzc29yRGlydHkgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIHRoZSBwb3RlbnRpYWxseSB2aXNpYmxlIGdlb21ldHJ5IHRvIHRoZSBiYWNrIGJ1ZmZlciBvciB0ZXh0dXJlLlxuXHQgKiBAcGFyYW0gZW50aXR5Q29sbGVjdG9yIFRoZSBFbnRpdHlDb2xsZWN0b3Igb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBvdGVudGlhbGx5IHZpc2libGUgZ2VvbWV0cnkuXG5cdCAqIEBwYXJhbSB0YXJnZXQgQW4gb3B0aW9uIHRhcmdldCB0ZXh0dXJlIHRvIHJlbmRlciB0by5cblx0ICogQHBhcmFtIHN1cmZhY2VTZWxlY3RvciBUaGUgaW5kZXggb2YgYSBDdWJlVGV4dHVyZSdzIGZhY2UgdG8gcmVuZGVyIHRvLlxuXHQgKiBAcGFyYW0gYWRkaXRpb25hbENsZWFyTWFzayBBZGRpdGlvbmFsIGNsZWFyIG1hc2sgaW5mb3JtYXRpb24sIGluIGNhc2UgZXh0cmEgY2xlYXIgY2hhbm5lbHMgYXJlIHRvIGJlIG9taXR0ZWQuXG5cdCAqL1xuXHRwdWJsaWMgX2lSZW5kZXIoZW50aXR5Q29sbGVjdG9yOklDb2xsZWN0b3IsIHRhcmdldDpUZXh0dXJlUHJveHlCYXNlID0gbnVsbCwgc2Npc3NvclJlY3Q6UmVjdGFuZ2xlID0gbnVsbCwgc3VyZmFjZVNlbGVjdG9yOm51bWJlciA9IDApXG5cdHtcblx0XHQvL1RPRE8gcmVmYWN0b3Igc2V0VGFyZ2V0IHNvIHRoYXQgcmVuZGVydGV4dHVyZXMgYXJlIGNyZWF0ZWQgYmVmb3JlIHRoaXMgY2hlY2tcblx0XHRpZiAoIXRoaXMuX3BTdGFnZSB8fCAhdGhpcy5fcENvbnRleHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9wUnR0Vmlld1Byb2plY3Rpb25NYXRyaXguY29weUZyb20oZW50aXR5Q29sbGVjdG9yLmNhbWVyYS52aWV3UHJvamVjdGlvbik7XG5cdFx0dGhpcy5fcFJ0dFZpZXdQcm9qZWN0aW9uTWF0cml4LmFwcGVuZFNjYWxlKHRoaXMudGV4dHVyZVJhdGlvWCwgdGhpcy50ZXh0dXJlUmF0aW9ZLCAxKTtcblxuXHRcdHRoaXMucEV4ZWN1dGVSZW5kZXIoZW50aXR5Q29sbGVjdG9yLCB0YXJnZXQsIHNjaXNzb3JSZWN0LCBzdXJmYWNlU2VsZWN0b3IpO1xuXG5cdFx0Ly8gZ2VuZXJhdGUgbWlwIG1hcHMgb24gdGFyZ2V0IChpZiB0YXJnZXQgZXhpc3RzKSAvL1RPRE9cblx0XHQvL2lmICh0YXJnZXQpXG5cdFx0Ly9cdCg8VGV4dHVyZT50YXJnZXQpLmdlbmVyYXRlTWlwbWFwcygpO1xuXG5cdFx0Ly8gY2xlYXIgYnVmZmVyc1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IDg7ICsraSkge1xuXHRcdFx0dGhpcy5fcENvbnRleHQuc2V0VmVydGV4QnVmZmVyQXQoaSwgbnVsbCk7XG5cdFx0XHR0aGlzLl9wQ29udGV4dC5zZXRUZXh0dXJlQXQoaSwgbnVsbCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIF9pUmVuZGVyQ2FzY2FkZXMoZW50aXR5Q29sbGVjdG9yOlNoYWRvd0Nhc3RlckNvbGxlY3RvciwgdGFyZ2V0OlRleHR1cmVQcm94eUJhc2UsIG51bUNhc2NhZGVzOm51bWJlciwgc2Npc3NvclJlY3RzOkFycmF5PFJlY3RhbmdsZT4sIGNhbWVyYXM6QXJyYXk8Q2FtZXJhPilcblx0e1xuXG5cdH1cblxuXHRwdWJsaWMgcENvbGxlY3RSZW5kZXJhYmxlcyhlbnRpdHlDb2xsZWN0b3I6SUNvbGxlY3Rvcilcblx0e1xuXHRcdC8vcmVzZXQgaGVhZCB2YWx1ZXNcblx0XHR0aGlzLl9wQmxlbmRlZFJlbmRlcmFibGVIZWFkID0gbnVsbDtcblx0XHR0aGlzLl9wT3BhcXVlUmVuZGVyYWJsZUhlYWQgPSBudWxsO1xuXHRcdHRoaXMuX3BOdW1UcmlhbmdsZXMgPSAwO1xuXG5cdFx0Ly9ncmFiIGVudGl0eSBoZWFkXG5cdFx0dmFyIGl0ZW06RW50aXR5TGlzdEl0ZW0gPSBlbnRpdHlDb2xsZWN0b3IuZW50aXR5SGVhZDtcblxuXHRcdC8vc2V0IHRlbXAgdmFsdWVzIGZvciBlbnRyeSBwb2ludCBhbmQgY2FtZXJhIGZvcndhcmQgdmVjdG9yXG5cdFx0dGhpcy5fcENhbWVyYSA9IGVudGl0eUNvbGxlY3Rvci5jYW1lcmE7XG5cdFx0dGhpcy5faUVudHJ5UG9pbnQgPSB0aGlzLl9wQ2FtZXJhLnNjZW5lUG9zaXRpb247XG5cdFx0dGhpcy5fcENhbWVyYUZvcndhcmQgPSB0aGlzLl9wQ2FtZXJhLnRyYW5zZm9ybS5mb3J3YXJkVmVjdG9yO1xuXG5cdFx0Ly9pdGVyYXRlIHRocm91Z2ggYWxsIGVudGl0aWVzXG5cdFx0d2hpbGUgKGl0ZW0pIHtcblx0XHRcdGl0ZW0uZW50aXR5Ll9pQ29sbGVjdFJlbmRlcmFibGVzKHRoaXMpO1xuXHRcdFx0aXRlbSA9IGl0ZW0ubmV4dDtcblx0XHR9XG5cblx0XHQvL3NvcnQgdGhlIHJlc3VsdGluZyByZW5kZXJhYmxlc1xuXHRcdHRoaXMuX3BPcGFxdWVSZW5kZXJhYmxlSGVhZCA9IDxSZW5kZXJhYmxlQmFzZT4gdGhpcy5yZW5kZXJhYmxlU29ydGVyLnNvcnRPcGFxdWVSZW5kZXJhYmxlcyh0aGlzLl9wT3BhcXVlUmVuZGVyYWJsZUhlYWQpO1xuXHRcdHRoaXMuX3BCbGVuZGVkUmVuZGVyYWJsZUhlYWQgPSA8UmVuZGVyYWJsZUJhc2U+IHRoaXMucmVuZGVyYWJsZVNvcnRlci5zb3J0QmxlbmRlZFJlbmRlcmFibGVzKHRoaXMuX3BCbGVuZGVkUmVuZGVyYWJsZUhlYWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgdGhlIHBvdGVudGlhbGx5IHZpc2libGUgZ2VvbWV0cnkgdG8gdGhlIGJhY2sgYnVmZmVyIG9yIHRleHR1cmUuIE9ubHkgZXhlY3V0ZWQgaWYgZXZlcnl0aGluZyBpcyBzZXQgdXAuXG5cdCAqXG5cdCAqIEBwYXJhbSBlbnRpdHlDb2xsZWN0b3IgVGhlIEVudGl0eUNvbGxlY3RvciBvYmplY3QgY29udGFpbmluZyB0aGUgcG90ZW50aWFsbHkgdmlzaWJsZSBnZW9tZXRyeS5cblx0ICogQHBhcmFtIHRhcmdldCBBbiBvcHRpb24gdGFyZ2V0IHRleHR1cmUgdG8gcmVuZGVyIHRvLlxuXHQgKiBAcGFyYW0gc3VyZmFjZVNlbGVjdG9yIFRoZSBpbmRleCBvZiBhIEN1YmVUZXh0dXJlJ3MgZmFjZSB0byByZW5kZXIgdG8uXG5cdCAqIEBwYXJhbSBhZGRpdGlvbmFsQ2xlYXJNYXNrIEFkZGl0aW9uYWwgY2xlYXIgbWFzayBpbmZvcm1hdGlvbiwgaW4gY2FzZSBleHRyYSBjbGVhciBjaGFubmVscyBhcmUgdG8gYmUgb21pdHRlZC5cblx0ICovXG5cdHB1YmxpYyBwRXhlY3V0ZVJlbmRlcihlbnRpdHlDb2xsZWN0b3I6SUNvbGxlY3RvciwgdGFyZ2V0OlRleHR1cmVQcm94eUJhc2UgPSBudWxsLCBzY2lzc29yUmVjdDpSZWN0YW5nbGUgPSBudWxsLCBzdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMClcblx0e1xuXHRcdHRoaXMuX3BDb250ZXh0LnNldFJlbmRlclRhcmdldCh0YXJnZXQsIHRydWUsIHN1cmZhY2VTZWxlY3Rvcik7XG5cblx0XHRpZiAoKHRhcmdldCB8fCAhdGhpcy5fc2hhcmVDb250ZXh0KSAmJiAhdGhpcy5fZGVwdGhQcmVwYXNzKVxuXHRcdFx0dGhpcy5fcENvbnRleHQuY2xlYXIodGhpcy5fYmFja2dyb3VuZFIsIHRoaXMuX2JhY2tncm91bmRHLCB0aGlzLl9iYWNrZ3JvdW5kQiwgdGhpcy5fYmFja2dyb3VuZEFscGhhLCAxLCAwKTtcblxuXHRcdHRoaXMuX3BDb250ZXh0LnNldERlcHRoVGVzdChmYWxzZSwgQ29udGV4dEdMQ29tcGFyZU1vZGUuQUxXQVlTKTtcblxuXHRcdHRoaXMuX3BTdGFnZS5zY2lzc29yUmVjdCA9IHNjaXNzb3JSZWN0O1xuXG5cdFx0Lypcblx0XHQgaWYgKF9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlcilcblx0XHQgX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyLnJlbmRlcigpO1xuXHRcdCAqL1xuXG5cdFx0dGhpcy5wRHJhdyhlbnRpdHlDb2xsZWN0b3IsIHRhcmdldCk7XG5cblx0XHQvL2xpbmUgcmVxdWlyZWQgZm9yIGNvcnJlY3QgcmVuZGVyaW5nIHdoZW4gdXNpbmcgYXdheTNkIHdpdGggc3RhcmxpbmcuIERPIE5PVCBSRU1PVkUgVU5MRVNTIFNUQVJMSU5HIElOVEVHUkFUSU9OIElTIFJFVEVTVEVEIVxuXHRcdC8vdGhpcy5fcENvbnRleHQuc2V0RGVwdGhUZXN0KGZhbHNlLCBDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTX0VRVUFMKTsgLy9vb3BzaWVcblxuXHRcdGlmICghdGhpcy5fc2hhcmVDb250ZXh0KSB7XG5cdFx0XHRpZiAodGhpcy5fc25hcHNob3RSZXF1aXJlZCAmJiB0aGlzLl9zbmFwc2hvdEJpdG1hcERhdGEpIHtcblx0XHRcdFx0dGhpcy5fcENvbnRleHQuZHJhd1RvQml0bWFwRGF0YSh0aGlzLl9zbmFwc2hvdEJpdG1hcERhdGEpO1xuXHRcdFx0XHR0aGlzLl9zbmFwc2hvdFJlcXVpcmVkID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fcFN0YWdlLnNjaXNzb3JSZWN0ID0gbnVsbDtcblx0fVxuXG5cdC8qXG5cdCAqIFdpbGwgZHJhdyB0aGUgcmVuZGVyZXIncyBvdXRwdXQgb24gbmV4dCByZW5kZXIgdG8gdGhlIHByb3ZpZGVkIGJpdG1hcCBkYXRhLlxuXHQgKiAqL1xuXHRwdWJsaWMgcXVldWVTbmFwc2hvdChibWQ6Qml0bWFwRGF0YSlcblx0e1xuXHRcdHRoaXMuX3NuYXBzaG90UmVxdWlyZWQgPSB0cnVlO1xuXHRcdHRoaXMuX3NuYXBzaG90Qml0bWFwRGF0YSA9IGJtZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQZXJmb3JtcyB0aGUgYWN0dWFsIGRyYXdpbmcgb2YgZ2VvbWV0cnkgdG8gdGhlIHRhcmdldC5cblx0ICogQHBhcmFtIGVudGl0eUNvbGxlY3RvciBUaGUgRW50aXR5Q29sbGVjdG9yIG9iamVjdCBjb250YWluaW5nIHRoZSBwb3RlbnRpYWxseSB2aXNpYmxlIGdlb21ldHJ5LlxuXHQgKi9cblx0cHVibGljIHBEcmF3KGVudGl0eUNvbGxlY3RvcjpJQ29sbGVjdG9yLCB0YXJnZXQ6VGV4dHVyZVByb3h5QmFzZSlcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXNzaWduIHRoZSBjb250ZXh0IG9uY2UgcmV0cmlldmVkXG5cdCAqL1xuXHRwcml2YXRlIG9uQ29udGV4dFVwZGF0ZShldmVudDpFdmVudClcblx0e1xuXHRcdHRoaXMuX3BDb250ZXh0ID0gPElDb250ZXh0U3RhZ2VHTD4gdGhpcy5fcFN0YWdlLmNvbnRleHQ7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IF9pQmFja2dyb3VuZEFscGhhKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYmFja2dyb3VuZEFscGhhO1xuXHR9XG5cblx0cHVibGljIHNldCBfaUJhY2tncm91bmRBbHBoYSh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fYmFja2dyb3VuZEFscGhhID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYmFja2dyb3VuZEFscGhhID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wQmFja0J1ZmZlckludmFsaWQgPSB0cnVlO1xuXHR9XG5cblx0Lypcblx0IHB1YmxpYyBnZXQgaUJhY2tncm91bmQoKTpUZXh0dXJlMkRCYXNlXG5cdCB7XG5cdCByZXR1cm4gdGhpcy5fYmFja2dyb3VuZDtcblx0IH1cblx0ICovXG5cblx0Lypcblx0IHB1YmxpYyBzZXQgaUJhY2tncm91bmQodmFsdWU6VGV4dHVyZTJEQmFzZSlcblx0IHtcblx0IGlmICh0aGlzLl9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlciAmJiAhdmFsdWUpIHtcblx0IHRoaXMuX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyLmRpc3Bvc2UoKTtcblx0IHRoaXMuX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyID0gbnVsbDtcblx0IH1cblxuXHQgaWYgKCF0aGlzLl9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlciAmJiB2YWx1ZSlcblx0IHtcblxuXHQgdGhpcy5fYmFja2dyb3VuZEltYWdlUmVuZGVyZXIgPSBuZXcgQmFja2dyb3VuZEltYWdlUmVuZGVyZXIodGhpcy5fcFN0YWdlKTtcblxuXHQgfVxuXG5cblx0IHRoaXMuX2JhY2tncm91bmQgPSB2YWx1ZTtcblxuXHQgaWYgKHRoaXMuX2JhY2tncm91bmRJbWFnZVJlbmRlcmVyKVxuXHQgdGhpcy5fYmFja2dyb3VuZEltYWdlUmVuZGVyZXIudGV4dHVyZSA9IHZhbHVlO1xuXHQgfVxuXHQgKi9cblx0Lypcblx0IHB1YmxpYyBnZXQgYmFja2dyb3VuZEltYWdlUmVuZGVyZXIoKTpCYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlclxuXHQge1xuXHQgcmV0dXJuIF9iYWNrZ3JvdW5kSW1hZ2VSZW5kZXJlcjtcblx0IH1cblx0ICovXG5cblxuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgbm90aWZ5U2Npc3NvclVwZGF0ZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fc2Npc3NvckRpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fc2Npc3NvckRpcnR5ID0gdHJ1ZTtcblxuXHRcdGlmICghdGhpcy5fc2Npc3NvclVwZGF0ZWQpXG5cdFx0XHR0aGlzLl9zY2lzc29yVXBkYXRlZCA9IG5ldyBSZW5kZXJlckV2ZW50KFJlbmRlcmVyRXZlbnQuU0NJU1NPUl9VUERBVEVEKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9zY2lzc29yVXBkYXRlZCk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBub3RpZnlWaWV3cG9ydFVwZGF0ZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fdmlld3BvcnREaXJ0eSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3ZpZXdwb3J0RGlydHkgPSB0cnVlO1xuXG5cdFx0aWYgKCF0aGlzLl92aWV3UG9ydFVwZGF0ZWQpXG5cdFx0XHR0aGlzLl92aWV3UG9ydFVwZGF0ZWQgPSBuZXcgUmVuZGVyZXJFdmVudChSZW5kZXJlckV2ZW50LlZJRVdQT1JUX1VQREFURUQpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3ZpZXdQb3J0VXBkYXRlZCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBvblZpZXdwb3J0VXBkYXRlZChldmVudDpTdGFnZUV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fdmlld1BvcnQgPSB0aGlzLl9wU3RhZ2Uudmlld1BvcnQ7XG5cdFx0Ly9UT0RPIHN0b3AgZmlyaW5nIHZpZXdwb3J0IHVwZGF0ZWQgZm9yIGV2ZXJ5IHN0YWdlZ2wgdmlld3BvcnQgY2hhbmdlXG5cblx0XHRpZiAodGhpcy5fc2hhcmVDb250ZXh0KSB7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueCA9IHRoaXMuX2dsb2JhbFBvcy54IC0gdGhpcy5fcFN0YWdlLng7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueSA9IHRoaXMuX2dsb2JhbFBvcy55IC0gdGhpcy5fcFN0YWdlLnk7XG5cdFx0XHR0aGlzLm5vdGlmeVNjaXNzb3JVcGRhdGUoKTtcblx0XHR9XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlKCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyB1cGRhdGVHbG9iYWxQb3MoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NoYXJlQ29udGV4dCkge1xuXHRcdFx0dGhpcy5fcFNjaXNzb3JSZWN0LnggPSB0aGlzLl9nbG9iYWxQb3MueCAtIHRoaXMuX3ZpZXdQb3J0Lng7XG5cdFx0XHR0aGlzLl9wU2Npc3NvclJlY3QueSA9IHRoaXMuX2dsb2JhbFBvcy55IC0gdGhpcy5fdmlld1BvcnQueTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fcFNjaXNzb3JSZWN0LnggPSAwO1xuXHRcdFx0dGhpcy5fcFNjaXNzb3JSZWN0LnkgPSAwO1xuXHRcdFx0dGhpcy5fdmlld1BvcnQueCA9IHRoaXMuX2dsb2JhbFBvcy54O1xuXHRcdFx0dGhpcy5fdmlld1BvcnQueSA9IHRoaXMuX2dsb2JhbFBvcy55O1xuXHRcdH1cblxuXHRcdHRoaXMubm90aWZ5U2Npc3NvclVwZGF0ZSgpO1xuXHR9XG5cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGJpbGxib2FyZFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRwdWJsaWMgYXBwbHlCaWxsYm9hcmQoYmlsbGJvYXJkOkJpbGxib2FyZClcblx0e1xuXHRcdHRoaXMuX2FwcGx5UmVuZGVyYWJsZSg8UmVuZGVyYWJsZUJhc2U+IHRoaXMuX2JpbGxib2FyZFJlbmRlcmFibGVQb29sLmdldEl0ZW0oYmlsbGJvYXJkKSk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHRyaWFuZ2xlU3ViTWVzaFxuXHQgKi9cblx0cHVibGljIGFwcGx5VHJpYW5nbGVTdWJNZXNoKHRyaWFuZ2xlU3ViTWVzaDpUcmlhbmdsZVN1Yk1lc2gpXG5cdHtcblx0XHR0aGlzLl9hcHBseVJlbmRlcmFibGUoPFJlbmRlcmFibGVCYXNlPiB0aGlzLl90cmlhbmdsZVN1Yk1lc2hSZW5kZXJhYmxlUG9vbC5nZXRJdGVtKHRyaWFuZ2xlU3ViTWVzaCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBsaW5lU3ViTWVzaFxuXHQgKi9cblx0cHVibGljIGFwcGx5TGluZVN1Yk1lc2gobGluZVN1Yk1lc2g6TGluZVN1Yk1lc2gpXG5cdHtcblx0XHR0aGlzLl9hcHBseVJlbmRlcmFibGUoPFJlbmRlcmFibGVCYXNlPiB0aGlzLl9saW5lU3ViTWVzaFJlbmRlcmFibGVQb29sLmdldEl0ZW0obGluZVN1Yk1lc2gpKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVuZGVyYWJsZVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRwcml2YXRlIF9hcHBseVJlbmRlcmFibGUocmVuZGVyYWJsZTpSZW5kZXJhYmxlQmFzZSlcblx0e1xuXHRcdHZhciBtYXRlcmlhbDpNYXRlcmlhbEJhc2UgPSByZW5kZXJhYmxlLm1hdGVyaWFsT3duZXIubWF0ZXJpYWw7XG5cdFx0dmFyIGVudGl0eTpJRW50aXR5ID0gcmVuZGVyYWJsZS5zb3VyY2VFbnRpdHk7XG5cdFx0dmFyIHBvc2l0aW9uOlZlY3RvcjNEID0gZW50aXR5LnNjZW5lUG9zaXRpb247XG5cblx0XHRpZiAoIW1hdGVyaWFsKVxuXHRcdFx0bWF0ZXJpYWwgPSBEZWZhdWx0TWF0ZXJpYWxNYW5hZ2VyLmdldERlZmF1bHRNYXRlcmlhbChyZW5kZXJhYmxlLm1hdGVyaWFsT3duZXIpO1xuXG5cdFx0Ly91cGRhdGUgbWF0ZXJpYWwgaWYgaW52YWxpZGF0ZWRcblx0XHRtYXRlcmlhbC5faVVwZGF0ZU1hdGVyaWFsKCk7XG5cblx0XHQvL3NldCBpZHMgZm9yIGZhc3RlciByZWZlcmVuY2luZ1xuXHRcdHJlbmRlcmFibGUubWF0ZXJpYWwgPSBtYXRlcmlhbDtcblx0XHRyZW5kZXJhYmxlLm1hdGVyaWFsSWQgPSBtYXRlcmlhbC5faU1hdGVyaWFsSWQ7XG5cdFx0cmVuZGVyYWJsZS5yZW5kZXJPcmRlcklkID0gdGhpcy5fcENvbnRleHQuZ2V0TWF0ZXJpYWwobWF0ZXJpYWwsIHRoaXMuX3BTdGFnZS5wcm9maWxlKS5yZW5kZXJPcmRlcklkO1xuXHRcdHJlbmRlcmFibGUuY2FzY2FkZWQgPSBmYWxzZTtcblxuXHRcdC8vIHByb2plY3Qgb250byBjYW1lcmEncyB6LWF4aXNcblx0XHRwb3NpdGlvbiA9IHRoaXMuX2lFbnRyeVBvaW50LnN1YnRyYWN0KHBvc2l0aW9uKTtcblx0XHRyZW5kZXJhYmxlLnpJbmRleCA9IGVudGl0eS56T2Zmc2V0ICsgcG9zaXRpb24uZG90UHJvZHVjdCh0aGlzLl9wQ2FtZXJhRm9yd2FyZCk7XG5cblx0XHQvL3N0b3JlIHJlZmVyZW5jZSB0byBzY2VuZSB0cmFuc2Zvcm1cblx0XHRyZW5kZXJhYmxlLnJlbmRlclNjZW5lVHJhbnNmb3JtID0gcmVuZGVyYWJsZS5zb3VyY2VFbnRpdHkuZ2V0UmVuZGVyU2NlbmVUcmFuc2Zvcm0odGhpcy5fcENhbWVyYSk7XG5cblx0XHRpZiAobWF0ZXJpYWwucmVxdWlyZXNCbGVuZGluZykge1xuXHRcdFx0cmVuZGVyYWJsZS5uZXh0ID0gdGhpcy5fcEJsZW5kZWRSZW5kZXJhYmxlSGVhZDtcblx0XHRcdHRoaXMuX3BCbGVuZGVkUmVuZGVyYWJsZUhlYWQgPSByZW5kZXJhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW5kZXJhYmxlLm5leHQgPSB0aGlzLl9wT3BhcXVlUmVuZGVyYWJsZUhlYWQ7XG5cdFx0XHR0aGlzLl9wT3BhcXVlUmVuZGVyYWJsZUhlYWQgPSByZW5kZXJhYmxlO1xuXHRcdH1cblxuXHRcdHRoaXMuX3BOdW1UcmlhbmdsZXMgKz0gcmVuZGVyYWJsZS5udW1UcmlhbmdsZXM7XG5cblx0XHQvL2hhbmRsZSBhbnkgb3ZlcmZsb3cgZm9yIHJlbmRlcmFibGVzIHdpdGggZGF0YSB0aGF0IGV4Y2VlZHMgR1BVIGxpbWl0YXRpb25zXG5cdFx0aWYgKHJlbmRlcmFibGUub3ZlcmZsb3cpXG5cdFx0XHR0aGlzLl9hcHBseVJlbmRlcmFibGUocmVuZGVyYWJsZS5vdmVyZmxvdyk7XG5cdH1cbn1cblxuZXhwb3J0ID0gUmVuZGVyZXJCYXNlOyJdfQ==