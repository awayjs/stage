var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var Event = require("awayjs-core/lib/events/Event");
var BlendMode = require("awayjs-display/lib/base/BlendMode");
var ContextGLBlendFactor = require("awayjs-stagegl/lib/core/stagegl/ContextGLBlendFactor");
var ContextGLCompareMode = require("awayjs-stagegl/lib/core/stagegl/ContextGLCompareMode");
var ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
var MaterialPassMode = require("awayjs-stagegl/lib/materials/passes/MaterialPassMode");
/**
 * MaterialPassBase provides an abstract base class for material shader passes. A material pass constitutes at least
 * a render call per required renderable.
 */
var MaterialPassBase = (function (_super) {
    __extends(MaterialPassBase, _super);
    /**
     * Creates a new MaterialPassBase object.
     */
    function MaterialPassBase(passMode) {
        var _this = this;
        if (passMode === void 0) { passMode = 0x03; }
        _super.call(this);
        this._materialPassData = new Array();
        this._maxLights = 3;
        this._preserveAlpha = true;
        this._includeCasters = true;
        this._forceSeparateMVP = false;
        this._directionalLightsOffset = 0;
        this._pointLightsOffset = 0;
        this._lightProbesOffset = 0;
        this._pNumPointLights = 0;
        this._pNumDirectionalLights = 0;
        this._pNumLightProbes = 0;
        this._pNumLights = 0;
        this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
        this._blendFactorSource = ContextGLBlendFactor.ONE;
        this._blendFactorDest = ContextGLBlendFactor.ZERO;
        this._pEnableBlending = false;
        this._writeDepth = true;
        this._passMode = passMode;
        this._onLightsChangeDelegate = function (event) { return _this.onLightsChange(event); };
    }
    Object.defineProperty(MaterialPassBase.prototype, "preserveAlpha", {
        /**
         * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
         */
        get: function () {
            return this._preserveAlpha;
        },
        set: function (value) {
            if (this._preserveAlpha == value)
                return;
            this._preserveAlpha = value;
            this._pInvalidatePass();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "includeCasters", {
        /**
         * Indicates whether or not shadow casting lights need to be included.
         */
        get: function () {
            return this._includeCasters;
        },
        set: function (value) {
            if (this._includeCasters == value)
                return;
            this._includeCasters = value;
            this._pInvalidatePass();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "forceSeparateMVP", {
        /**
         * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
         * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
         * projection code.
         */
        get: function () {
            return this._forceSeparateMVP;
        },
        set: function (value) {
            if (this._forceSeparateMVP == value)
                return;
            this._forceSeparateMVP = value;
            this._pInvalidatePass();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "directionalLightsOffset", {
        /**
         * Indicates the offset in the light picker's directional light vector for which to start including lights.
         * This needs to be set before the light picker is assigned.
         */
        get: function () {
            return this._directionalLightsOffset;
        },
        set: function (value) {
            this._directionalLightsOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "pointLightsOffset", {
        /**
         * Indicates the offset in the light picker's point light vector for which to start including lights.
         * This needs to be set before the light picker is assigned.
         */
        get: function () {
            return this._pointLightsOffset;
        },
        set: function (value) {
            this._pointLightsOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "lightProbesOffset", {
        /**
         * Indicates the offset in the light picker's light probes vector for which to start including lights.
         * This needs to be set before the light picker is assigned.
         */
        get: function () {
            return this._lightProbesOffset;
        },
        set: function (value) {
            this._lightProbesOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "passMode", {
        /**
         *
         */
        get: function () {
            return this._passMode;
        },
        set: function (value) {
            this._passMode = value;
            this._pInvalidatePass();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Factory method to create a concrete shader object for this pass.
     *
     * @param profile The compatibility profile used by the renderer.
     */
    MaterialPassBase.prototype.createShaderObject = function (profile) {
        return new ShaderObjectBase(profile);
    };
    Object.defineProperty(MaterialPassBase.prototype, "writeDepth", {
        /**
         * Indicate whether this pass should write to the depth buffer or not. Ignored when blending is enabled.
         */
        get: function () {
            return this._writeDepth;
        },
        set: function (value) {
            this._writeDepth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "depthCompareMode", {
        /**
         * The depth compare mode used to render the renderables using this material.
         *
         * @see away.stagegl.ContextGLCompareMode
         */
        get: function () {
            return this._depthCompareMode;
        },
        set: function (value) {
            this._depthCompareMode = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Cleans up any resources used by the current object.
     * @param deep Indicates whether other resources should be cleaned up, that could potentially be shared across different instances.
     */
    MaterialPassBase.prototype.dispose = function () {
        if (this._pLightPicker)
            this._pLightPicker.removeEventListener(Event.CHANGE, this._onLightsChangeDelegate);
        while (this._materialPassData.length)
            this._materialPassData[0].dispose();
        this._materialPassData = null;
    };
    /**
     * Renders an object to the current render target.
     *
     * @private
     */
    MaterialPassBase.prototype._iRender = function (pass, renderable, stage, camera, viewProjection) {
        this.setRenderState(pass, renderable, stage, camera, viewProjection);
    };
    /**
     *
     *
     * @param renderable
     * @param stage
     * @param camera
     */
    MaterialPassBase.prototype.setRenderState = function (pass, renderable, stage, camera, viewProjection) {
        pass.shaderObject.setRenderState(renderable, stage, camera, viewProjection);
    };
    /**
     * The blend mode to use when drawing this renderable. The following blend modes are supported:
     * <ul>
     * <li>BlendMode.NORMAL: No blending, unless the material inherently needs it</li>
     * <li>BlendMode.LAYER: Force blending. This will draw the object the same as NORMAL, but without writing depth writes.</li>
     * <li>BlendMode.MULTIPLY</li>
     * <li>BlendMode.ADD</li>
     * <li>BlendMode.ALPHA</li>
     * </ul>
     */
    MaterialPassBase.prototype.setBlendMode = function (value) {
        switch (value) {
            case BlendMode.NORMAL:
                this._blendFactorSource = ContextGLBlendFactor.ONE;
                this._blendFactorDest = ContextGLBlendFactor.ZERO;
                this._pEnableBlending = false;
                break;
            case BlendMode.LAYER:
                this._blendFactorSource = ContextGLBlendFactor.SOURCE_ALPHA;
                this._blendFactorDest = ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
                this._pEnableBlending = true;
                break;
            case BlendMode.MULTIPLY:
                this._blendFactorSource = ContextGLBlendFactor.ZERO;
                this._blendFactorDest = ContextGLBlendFactor.SOURCE_COLOR;
                this._pEnableBlending = true;
                break;
            case BlendMode.ADD:
                this._blendFactorSource = ContextGLBlendFactor.SOURCE_ALPHA;
                this._blendFactorDest = ContextGLBlendFactor.ONE;
                this._pEnableBlending = true;
                break;
            case BlendMode.ALPHA:
                this._blendFactorSource = ContextGLBlendFactor.ZERO;
                this._blendFactorDest = ContextGLBlendFactor.SOURCE_ALPHA;
                this._pEnableBlending = true;
                break;
            default:
                throw new ArgumentError("Unsupported blend mode!");
        }
    };
    /**
     * Sets the render state for the pass that is independent of the rendered object. This needs to be called before
     * calling renderPass. Before activating a pass, the previously used pass needs to be deactivated.
     * @param stage The Stage object which is currently used for rendering.
     * @param camera The camera from which the scene is viewed.
     * @private
     */
    MaterialPassBase.prototype._iActivate = function (pass, stage, camera) {
        var context = stage.context;
        context.setDepthTest((this._writeDepth && !this._pEnableBlending), this._depthCompareMode);
        if (this._pEnableBlending)
            context.setBlendFactors(this._blendFactorSource, this._blendFactorDest);
        context.activateMaterialPass(pass, stage, camera);
    };
    /**
     * Clears the render state for the pass. This needs to be called before activating another pass.
     * @param stage The Stage used for rendering
     *
     * @private
     */
    MaterialPassBase.prototype._iDeactivate = function (pass, stage) {
        stage.context.deactivateMaterialPass(pass, stage);
        stage.context.setDepthTest(true, ContextGLCompareMode.LESS_EQUAL); // TODO : imeplement
    };
    /**
     * Marks the shader program as invalid, so it will be recompiled before the next render.
     *
     * @param updateMaterial Indicates whether the invalidation should be performed on the entire material. Should always pass "true" unless it's called from the material itself.
     */
    MaterialPassBase.prototype._pInvalidatePass = function () {
        var len = this._materialPassData.length;
        for (var i = 0; i < len; i++)
            this._materialPassData[i].invalidate();
        this.dispatchEvent(new Event(Event.CHANGE));
    };
    Object.defineProperty(MaterialPassBase.prototype, "lightPicker", {
        /**
         * The light picker used by the material to provide lights to the material if it supports lighting.
         *
         * @see away.materials.LightPickerBase
         * @see away.materials.StaticLightPicker
         */
        get: function () {
            return this._pLightPicker;
        },
        set: function (value) {
            if (this._pLightPicker)
                this._pLightPicker.removeEventListener(Event.CHANGE, this._onLightsChangeDelegate);
            this._pLightPicker = value;
            if (this._pLightPicker)
                this._pLightPicker.addEventListener(Event.CHANGE, this._onLightsChangeDelegate);
            this.pUpdateLights();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Called when the light picker's configuration changes.
     */
    MaterialPassBase.prototype.onLightsChange = function (event) {
        this.pUpdateLights();
    };
    /**
     * Implemented by subclasses if the pass uses lights to update the shader.
     */
    MaterialPassBase.prototype.pUpdateLights = function () {
        var numDirectionalLightsOld = this._pNumDirectionalLights;
        var numPointLightsOld = this._pNumPointLights;
        var numLightProbesOld = this._pNumLightProbes;
        if (this._pLightPicker && (this._passMode & MaterialPassMode.LIGHTING)) {
            this._pNumDirectionalLights = this.calculateNumDirectionalLights(this._pLightPicker.numDirectionalLights);
            this._pNumPointLights = this.calculateNumPointLights(this._pLightPicker.numPointLights);
            this._pNumLightProbes = this.calculateNumProbes(this._pLightPicker.numLightProbes);
            if (this._includeCasters) {
                this._pNumDirectionalLights += this._pLightPicker.numCastingDirectionalLights;
                this._pNumPointLights += this._pLightPicker.numCastingPointLights;
            }
        }
        else {
            this._pNumDirectionalLights = 0;
            this._pNumPointLights = 0;
            this._pNumLightProbes = 0;
        }
        this._pNumLights = this._pNumDirectionalLights + this._pNumPointLights;
        if (numDirectionalLightsOld != this._pNumDirectionalLights || numPointLightsOld != this._pNumPointLights || numLightProbesOld != this._pNumLightProbes)
            this._pInvalidatePass();
    };
    MaterialPassBase.prototype._iIncludeDependencies = function (shaderObject) {
        if (this._forceSeparateMVP)
            shaderObject.globalPosDependencies++;
        shaderObject.outputsNormals = this._pOutputsNormals(shaderObject);
        shaderObject.outputsTangentNormals = shaderObject.outputsNormals && this._pOutputsTangentNormals(shaderObject);
        shaderObject.usesTangentSpace = shaderObject.outputsTangentNormals && this._pUsesTangentSpace(shaderObject);
        if (!shaderObject.usesTangentSpace)
            shaderObject.addWorldSpaceDependencies(Boolean(this._passMode & MaterialPassMode.EFFECTS));
    };
    MaterialPassBase.prototype._iInitConstantData = function (shaderObject) {
    };
    MaterialPassBase.prototype._iGetPreLightingVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    MaterialPassBase.prototype._iGetPreLightingFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    MaterialPassBase.prototype._iGetVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    MaterialPassBase.prototype._iGetFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    MaterialPassBase.prototype._iGetNormalVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    MaterialPassBase.prototype._iGetNormalFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        return "";
    };
    Object.defineProperty(MaterialPassBase.prototype, "iNumPointLights", {
        /**
         * The amount of point lights that need to be supported.
         */
        get: function () {
            return this._pNumPointLights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "iNumDirectionalLights", {
        /**
         * The amount of directional lights that need to be supported.
         */
        get: function () {
            return this._pNumDirectionalLights;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaterialPassBase.prototype, "iNumLightProbes", {
        /**
         * The amount of light probes that need to be supported.
         */
        get: function () {
            return this._pNumLightProbes;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Indicates whether or not normals are calculated at all.
     */
    MaterialPassBase.prototype._pOutputsNormals = function (shaderObject) {
        return false;
    };
    /**
     * Indicates whether or not normals are calculated in tangent space.
     */
    MaterialPassBase.prototype._pOutputsTangentNormals = function (shaderObject) {
        return false;
    };
    /**
     * Indicates whether or not normals are allowed in tangent space. This is only the case if no object-space
     * dependencies exist.
     */
    MaterialPassBase.prototype._pUsesTangentSpace = function (shaderObject) {
        return false;
    };
    /**
     * Calculates the amount of directional lights this material will support.
     * @param numDirectionalLights The maximum amount of directional lights to support.
     * @return The amount of directional lights this material will support, bounded by the amount necessary.
     */
    MaterialPassBase.prototype.calculateNumDirectionalLights = function (numDirectionalLights) {
        return Math.min(numDirectionalLights - this._directionalLightsOffset, this._maxLights);
    };
    /**
     * Calculates the amount of point lights this material will support.
     * @param numDirectionalLights The maximum amount of point lights to support.
     * @return The amount of point lights this material will support, bounded by the amount necessary.
     */
    MaterialPassBase.prototype.calculateNumPointLights = function (numPointLights) {
        var numFree = this._maxLights - this._pNumDirectionalLights;
        return Math.min(numPointLights - this._pointLightsOffset, numFree);
    };
    /**
     * Calculates the amount of light probes this material will support.
     * @param numDirectionalLights The maximum amount of light probes to support.
     * @return The amount of light probes this material will support, bounded by the amount necessary.
     */
    MaterialPassBase.prototype.calculateNumProbes = function (numLightProbes) {
        var numChannels = 0;
        //			if ((this._pSpecularLightSources & LightSources.PROBES) != 0)
        //				++numChannels;
        //
        //			if ((this._pDiffuseLightSources & LightSources.PROBES) != 0)
        //				++numChannels;
        // 4 channels available
        return Math.min(numLightProbes - this._lightProbesOffset, (4 / numChannels) | 0);
    };
    MaterialPassBase.prototype._iAddMaterialPassData = function (materialPassData) {
        this._materialPassData.push(materialPassData);
        return materialPassData;
    };
    MaterialPassBase.prototype._iRemoveMaterialPassData = function (materialPassData) {
        this._materialPassData.splice(this._materialPassData.indexOf(materialPassData), 1);
        return materialPassData;
    };
    return MaterialPassBase;
})(NamedAssetBase);
module.exports = MaterialPassBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvcGFzc2VzL21hdGVyaWFscGFzc2Jhc2UudHMiXSwibmFtZXMiOlsiTWF0ZXJpYWxQYXNzQmFzZSIsIk1hdGVyaWFsUGFzc0Jhc2UuY29uc3RydWN0b3IiLCJNYXRlcmlhbFBhc3NCYXNlLnByZXNlcnZlQWxwaGEiLCJNYXRlcmlhbFBhc3NCYXNlLmluY2x1ZGVDYXN0ZXJzIiwiTWF0ZXJpYWxQYXNzQmFzZS5mb3JjZVNlcGFyYXRlTVZQIiwiTWF0ZXJpYWxQYXNzQmFzZS5kaXJlY3Rpb25hbExpZ2h0c09mZnNldCIsIk1hdGVyaWFsUGFzc0Jhc2UucG9pbnRMaWdodHNPZmZzZXQiLCJNYXRlcmlhbFBhc3NCYXNlLmxpZ2h0UHJvYmVzT2Zmc2V0IiwiTWF0ZXJpYWxQYXNzQmFzZS5wYXNzTW9kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuY3JlYXRlU2hhZGVyT2JqZWN0IiwiTWF0ZXJpYWxQYXNzQmFzZS53cml0ZURlcHRoIiwiTWF0ZXJpYWxQYXNzQmFzZS5kZXB0aENvbXBhcmVNb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5kaXNwb3NlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faVJlbmRlciIsIk1hdGVyaWFsUGFzc0Jhc2Uuc2V0UmVuZGVyU3RhdGUiLCJNYXRlcmlhbFBhc3NCYXNlLnNldEJsZW5kTW9kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lBY3RpdmF0ZSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lEZWFjdGl2YXRlIiwiTWF0ZXJpYWxQYXNzQmFzZS5fcEludmFsaWRhdGVQYXNzIiwiTWF0ZXJpYWxQYXNzQmFzZS5saWdodFBpY2tlciIsIk1hdGVyaWFsUGFzc0Jhc2Uub25MaWdodHNDaGFuZ2UiLCJNYXRlcmlhbFBhc3NCYXNlLnBVcGRhdGVMaWdodHMiLCJNYXRlcmlhbFBhc3NCYXNlLl9pSW5jbHVkZURlcGVuZGVuY2llcyIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lJbml0Q29uc3RhbnREYXRhIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldFByZUxpZ2h0aW5nVmVydGV4Q29kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lHZXRQcmVMaWdodGluZ0ZyYWdtZW50Q29kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lHZXRWZXJ0ZXhDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldEZyYWdtZW50Q29kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lHZXROb3JtYWxWZXJ0ZXhDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldE5vcm1hbEZyYWdtZW50Q29kZSIsIk1hdGVyaWFsUGFzc0Jhc2UuaU51bVBvaW50TGlnaHRzIiwiTWF0ZXJpYWxQYXNzQmFzZS5pTnVtRGlyZWN0aW9uYWxMaWdodHMiLCJNYXRlcmlhbFBhc3NCYXNlLmlOdW1MaWdodFByb2JlcyIsIk1hdGVyaWFsUGFzc0Jhc2UuX3BPdXRwdXRzTm9ybWFscyIsIk1hdGVyaWFsUGFzc0Jhc2UuX3BPdXRwdXRzVGFuZ2VudE5vcm1hbHMiLCJNYXRlcmlhbFBhc3NCYXNlLl9wVXNlc1RhbmdlbnRTcGFjZSIsIk1hdGVyaWFsUGFzc0Jhc2UuY2FsY3VsYXRlTnVtRGlyZWN0aW9uYWxMaWdodHMiLCJNYXRlcmlhbFBhc3NCYXNlLmNhbGN1bGF0ZU51bVBvaW50TGlnaHRzIiwiTWF0ZXJpYWxQYXNzQmFzZS5jYWxjdWxhdGVOdW1Qcm9iZXMiLCJNYXRlcmlhbFBhc3NCYXNlLl9pQWRkTWF0ZXJpYWxQYXNzRGF0YSIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lSZW1vdmVNYXRlcmlhbFBhc3NEYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSxJQUFPLGNBQWMsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzdFLElBQU8sYUFBYSxXQUFjLHNDQUFzQyxDQUFDLENBQUM7QUFDMUUsSUFBTyxLQUFLLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFFNUQsSUFBTyxTQUFTLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQVFwRSxJQUFPLG9CQUFvQixXQUFhLHNEQUFzRCxDQUFDLENBQUM7QUFDaEcsSUFBTyxvQkFBb0IsV0FBYSxzREFBc0QsQ0FBQyxDQUFDO0FBRWhHLElBQU8sZ0JBQWdCLFdBQWMsMkRBQTJELENBQUMsQ0FBQztBQUlsRyxJQUFPLGdCQUFnQixXQUFjLHNEQUFzRCxDQUFDLENBQUM7QUFFN0YsQUFJQTs7O0dBREc7SUFDRyxnQkFBZ0I7SUFBU0EsVUFBekJBLGdCQUFnQkEsVUFBdUJBO0lBK0k1Q0E7O09BRUdBO0lBQ0hBLFNBbEpLQSxnQkFBZ0JBLENBa0pUQSxRQUFzQkE7UUFsSm5DQyxpQkFzaUJDQTtRQXBaWUEsd0JBQXNCQSxHQUF0QkEsZUFBc0JBO1FBRWpDQSxpQkFBT0EsQ0FBQ0E7UUFsSkRBLHNCQUFpQkEsR0FBMkJBLElBQUlBLEtBQUtBLEVBQW9CQSxDQUFDQTtRQUMxRUEsZUFBVUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdEJBLG1CQUFjQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUM5QkEsb0JBQWVBLEdBQVdBLElBQUlBLENBQUNBO1FBQy9CQSxzQkFBaUJBLEdBQVdBLEtBQUtBLENBQUNBO1FBRWxDQSw2QkFBd0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQ3BDQSx1QkFBa0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQzlCQSx1QkFBa0JBLEdBQVVBLENBQUNBLENBQUNBO1FBRS9CQSxxQkFBZ0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQzVCQSwyQkFBc0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQ2xDQSxxQkFBZ0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQzVCQSxnQkFBV0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFJdEJBLHNCQUFpQkEsR0FBVUEsb0JBQW9CQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUUzREEsdUJBQWtCQSxHQUFVQSxvQkFBb0JBLENBQUNBLEdBQUdBLENBQUNBO1FBQ3JEQSxxQkFBZ0JBLEdBQVVBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFFckRBLHFCQUFnQkEsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFJaENBLGdCQUFXQSxHQUFXQSxJQUFJQSxDQUFDQTtRQTBIbENBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBO1FBRTFCQSxJQUFJQSxDQUFDQSx1QkFBdUJBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGNBQWNBLENBQUNBLEtBQUtBLENBQUNBLEVBQTFCQSxDQUEwQkEsQ0FBQ0E7SUFDNUVBLENBQUNBO0lBdkhERCxzQkFBV0EsMkNBQWFBO1FBSHhCQTs7V0FFR0E7YUFDSEE7WUFFQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDNUJBLENBQUNBO2FBRURGLFVBQXlCQSxLQUFhQTtZQUVyQ0UsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsSUFBSUEsS0FBS0EsQ0FBQ0E7Z0JBQ2hDQSxNQUFNQSxDQUFDQTtZQUVSQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUU1QkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7OztPQVZBRjtJQWVEQSxzQkFBV0EsNENBQWNBO1FBSHpCQTs7V0FFR0E7YUFDSEE7WUFFQ0csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7UUFDN0JBLENBQUNBO2FBRURILFVBQTBCQSxLQUFhQTtZQUV0Q0csRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsSUFBSUEsS0FBS0EsQ0FBQ0E7Z0JBQ2pDQSxNQUFNQSxDQUFDQTtZQUVSQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUU3QkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7OztPQVZBSDtJQWlCREEsc0JBQVdBLDhDQUFnQkE7UUFMM0JBOzs7O1dBSUdBO2FBQ0hBO1lBRUNJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7UUFDL0JBLENBQUNBO2FBRURKLFVBQTRCQSxLQUFhQTtZQUV4Q0ksRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxJQUFJQSxLQUFLQSxDQUFDQTtnQkFDbkNBLE1BQU1BLENBQUNBO1lBRVJBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFFL0JBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7UUFDekJBLENBQUNBOzs7T0FWQUo7SUFlREEsc0JBQVdBLHFEQUF1QkE7UUFKbENBOzs7V0FHR0E7YUFDSEE7WUFFQ0ssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7YUFFREwsVUFBbUNBLEtBQVlBO1lBRTlDSyxJQUFJQSxDQUFDQSx3QkFBd0JBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3ZDQSxDQUFDQTs7O09BTEFMO0lBV0RBLHNCQUFXQSwrQ0FBaUJBO1FBSjVCQTs7O1dBR0dBO2FBQ0hBO1lBRUNNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFDaENBLENBQUNBO2FBRUROLFVBQTZCQSxLQUFZQTtZQUV4Q00sSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7OztPQUxBTjtJQVdEQSxzQkFBV0EsK0NBQWlCQTtRQUo1QkE7OztXQUdHQTthQUNIQTtZQUVDTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBO1FBQ2hDQSxDQUFDQTthQUVEUCxVQUE2QkEsS0FBWUE7WUFFeENPLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDakNBLENBQUNBOzs7T0FMQVA7SUFVREEsc0JBQVdBLHNDQUFRQTtRQUhuQkE7O1dBRUdBO2FBQ0hBO1lBRUNRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3ZCQSxDQUFDQTthQUVEUixVQUFvQkEsS0FBWUE7WUFFL0JRLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBO1lBRXZCQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBO1FBQ3pCQSxDQUFDQTs7O09BUEFSO0lBcUJEQTs7OztPQUlHQTtJQUNJQSw2Q0FBa0JBLEdBQXpCQSxVQUEwQkEsT0FBY0E7UUFFdkNTLE1BQU1BLENBQUNBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBS0RULHNCQUFXQSx3Q0FBVUE7UUFIckJBOztXQUVHQTthQUNIQTtZQUVDVSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7YUFFRFYsVUFBc0JBLEtBQWFBO1lBRWxDVSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7OztPQUxBVjtJQVlEQSxzQkFBV0EsOENBQWdCQTtRQUwzQkE7Ozs7V0FJR0E7YUFDSEE7WUFFQ1csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7YUFFRFgsVUFBNEJBLEtBQVlBO1lBRXZDVyxJQUFJQSxDQUFDQSxpQkFBaUJBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2hDQSxDQUFDQTs7O09BTEFYO0lBT0RBOzs7T0FHR0E7SUFDSUEsa0NBQU9BLEdBQWRBO1FBRUNZLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBO1lBQ3RCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0E7UUFFcEZBLE9BQU9BLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUE7WUFDbkNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFFckNBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDL0JBLENBQUNBO0lBRURaOzs7O09BSUdBO0lBQ0lBLG1DQUFRQSxHQUFmQSxVQUFnQkEsSUFBcUJBLEVBQUVBLFVBQXlCQSxFQUFFQSxLQUFXQSxFQUFFQSxNQUFhQSxFQUFFQSxjQUF1QkE7UUFFcEhhLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLFVBQVVBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLGNBQWNBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVEYjs7Ozs7O09BTUdBO0lBQ0lBLHlDQUFjQSxHQUFyQkEsVUFBc0JBLElBQXFCQSxFQUFFQSxVQUF5QkEsRUFBRUEsS0FBV0EsRUFBRUEsTUFBYUEsRUFBRUEsY0FBdUJBO1FBRTFIYyxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUM3RUEsQ0FBQ0E7SUFFRGQ7Ozs7Ozs7OztPQVNHQTtJQUNJQSx1Q0FBWUEsR0FBbkJBLFVBQW9CQSxLQUFZQTtRQUUvQmUsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFZkEsS0FBS0EsU0FBU0EsQ0FBQ0EsTUFBTUE7Z0JBRXBCQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQ25EQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ2xEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLEtBQUtBLENBQUNBO2dCQUU5QkEsS0FBS0EsQ0FBQ0E7WUFFUEEsS0FBS0EsU0FBU0EsQ0FBQ0EsS0FBS0E7Z0JBRW5CQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7Z0JBQzVEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtnQkFDcEVBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBRTdCQSxLQUFLQSxDQUFDQTtZQUVQQSxLQUFLQSxTQUFTQSxDQUFDQSxRQUFRQTtnQkFFdEJBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDcERBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDMURBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBRTdCQSxLQUFLQSxDQUFDQTtZQUVQQSxLQUFLQSxTQUFTQSxDQUFDQSxHQUFHQTtnQkFFakJBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDNURBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxHQUFHQSxDQUFDQTtnQkFDakRBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBRTdCQSxLQUFLQSxDQUFDQTtZQUVQQSxLQUFLQSxTQUFTQSxDQUFDQSxLQUFLQTtnQkFFbkJBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDcERBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxZQUFZQSxDQUFDQTtnQkFDMURBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBRTdCQSxLQUFLQSxDQUFDQTtZQUVQQTtnQkFFQ0EsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EseUJBQXlCQSxDQUFDQSxDQUFDQTtRQUVyREEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRGY7Ozs7OztPQU1HQTtJQUNJQSxxQ0FBVUEsR0FBakJBLFVBQWtCQSxJQUFxQkEsRUFBRUEsS0FBV0EsRUFBRUEsTUFBYUE7UUFFbEVnQixJQUFJQSxPQUFPQSxHQUFxQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFFOURBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBLENBQUVBLElBQUlBLENBQUNBLFdBQVdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUU3RkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUN6QkEsT0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBRXpFQSxPQUFPQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVEaEI7Ozs7O09BS0dBO0lBQ0lBLHVDQUFZQSxHQUFuQkEsVUFBb0JBLElBQXFCQSxFQUFFQSxLQUFXQTtRQUVsQ2lCLEtBQUtBLENBQUNBLE9BQVFBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFFbkRBLEtBQUtBLENBQUNBLE9BQVFBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsb0JBQW9CQTtJQUM1R0EsQ0FBQ0EsR0FEc0ZBO0lBR3ZGakI7Ozs7T0FJR0E7SUFDSUEsMkNBQWdCQSxHQUF2QkE7UUFFQ2tCLElBQUlBLEdBQUdBLEdBQVVBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDL0NBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBO1lBQ2xDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBRXhDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFRRGxCLHNCQUFXQSx5Q0FBV0E7UUFOdEJBOzs7OztXQUtHQTthQUNIQTtZQUVDbUIsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFDM0JBLENBQUNBO2FBRURuQixVQUF1QkEsS0FBcUJBO1lBRTNDbUIsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0E7WUFFcEZBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLEtBQUtBLENBQUNBO1lBRTNCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtnQkFDdEJBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQTtZQUVqRkEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7UUFDdEJBLENBQUNBOzs7T0FiQW5CO0lBZURBOztPQUVHQTtJQUNLQSx5Q0FBY0EsR0FBdEJBLFVBQXVCQSxLQUFXQTtRQUVqQ29CLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO0lBQ3RCQSxDQUFDQTtJQUVEcEI7O09BRUdBO0lBQ0lBLHdDQUFhQSxHQUFwQkE7UUFFQ3FCLElBQUlBLHVCQUF1QkEsR0FBVUEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtRQUNqRUEsSUFBSUEsaUJBQWlCQSxHQUFVQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQ3JEQSxJQUFJQSxpQkFBaUJBLEdBQVVBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFFckRBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1lBQzFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7WUFDeEZBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtZQUVuRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxJQUFJQSxDQUFDQSxzQkFBc0JBLElBQUlBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLDJCQUEyQkEsQ0FBQ0E7Z0JBQzlFQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLElBQUlBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLHFCQUFxQkEsQ0FBQ0E7WUFDbkVBLENBQUNBO1FBRUZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUV2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsdUJBQXVCQSxJQUFJQSxJQUFJQSxDQUFDQSxzQkFBc0JBLElBQUlBLGlCQUFpQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxpQkFBaUJBLElBQUlBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7WUFDdEpBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBRU1yQixnREFBcUJBLEdBQTVCQSxVQUE2QkEsWUFBNkJBO1FBRXpEc0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtZQUMxQkEsWUFBWUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtRQUV0Q0EsWUFBWUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUNsRUEsWUFBWUEsQ0FBQ0EscUJBQXFCQSxHQUFHQSxZQUFZQSxDQUFDQSxjQUFjQSxJQUFJQSxJQUFJQSxDQUFDQSx1QkFBdUJBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQy9HQSxZQUFZQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLFlBQVlBLENBQUNBLHFCQUFxQkEsSUFBSUEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUU1R0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUNsQ0EsWUFBWUEsQ0FBQ0EseUJBQXlCQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQzdGQSxDQUFDQTtJQUdNdEIsNkNBQWtCQSxHQUF6QkEsVUFBMEJBLFlBQTZCQTtJQUd2RHVCLENBQUNBO0lBRU12QixxREFBMEJBLEdBQWpDQSxVQUFrQ0EsWUFBNkJBLEVBQUVBLGFBQWlDQSxFQUFFQSxlQUFrQ0E7UUFFckl3QixNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtJQUNYQSxDQUFDQTtJQUVNeEIsdURBQTRCQSxHQUFuQ0EsVUFBb0NBLFlBQTZCQSxFQUFFQSxhQUFpQ0EsRUFBRUEsZUFBa0NBO1FBRXZJeUIsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWEEsQ0FBQ0E7SUFFTXpCLDBDQUFlQSxHQUF0QkEsVUFBdUJBLFlBQTZCQSxFQUFFQSxhQUFpQ0EsRUFBRUEsZUFBa0NBO1FBRTFIMEIsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWEEsQ0FBQ0E7SUFFTTFCLDRDQUFpQkEsR0FBeEJBLFVBQXlCQSxZQUE2QkEsRUFBRUEsYUFBaUNBLEVBQUVBLGVBQWtDQTtRQUU1SDJCLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1hBLENBQUNBO0lBRU0zQixnREFBcUJBLEdBQTVCQSxVQUE2QkEsWUFBNkJBLEVBQUVBLGFBQWlDQSxFQUFFQSxlQUFrQ0E7UUFFaEk0QixNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtJQUNYQSxDQUFDQTtJQUVNNUIsa0RBQXVCQSxHQUE5QkEsVUFBK0JBLFlBQTZCQSxFQUFFQSxhQUFpQ0EsRUFBRUEsZUFBa0NBO1FBRWxJNkIsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWEEsQ0FBQ0E7SUFLRDdCLHNCQUFXQSw2Q0FBZUE7UUFIMUJBOztXQUVHQTthQUNIQTtZQUVDOEIsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7OztPQUFBOUI7SUFLREEsc0JBQVdBLG1EQUFxQkE7UUFIaENBOztXQUVHQTthQUNIQTtZQUVDK0IsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7OztPQUFBL0I7SUFLREEsc0JBQVdBLDZDQUFlQTtRQUgxQkE7O1dBRUdBO2FBQ0hBO1lBRUNnQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxDQUFDQTs7O09BQUFoQztJQUVEQTs7T0FFR0E7SUFDSUEsMkNBQWdCQSxHQUF2QkEsVUFBd0JBLFlBQTZCQTtRQUVwRGlDLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURqQzs7T0FFR0E7SUFDSUEsa0RBQXVCQSxHQUE5QkEsVUFBK0JBLFlBQTZCQTtRQUUzRGtDLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURsQzs7O09BR0dBO0lBQ0lBLDZDQUFrQkEsR0FBekJBLFVBQTBCQSxZQUE2QkE7UUFFdERtQyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVEbkM7Ozs7T0FJR0E7SUFDS0Esd0RBQTZCQSxHQUFyQ0EsVUFBc0NBLG9CQUEyQkE7UUFFaEVvQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBLHdCQUF3QkEsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDeEZBLENBQUNBO0lBRURwQzs7OztPQUlHQTtJQUNLQSxrREFBdUJBLEdBQS9CQSxVQUFnQ0EsY0FBcUJBO1FBRXBEcUMsSUFBSUEsT0FBT0EsR0FBVUEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtRQUNuRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNwRUEsQ0FBQ0E7SUFFRHJDOzs7O09BSUdBO0lBQ0tBLDZDQUFrQkEsR0FBMUJBLFVBQTJCQSxjQUFxQkE7UUFFL0NzQyxJQUFJQSxXQUFXQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUMzQkEsQUFPQUEsa0VBUGtFQTtRQUNsRUEsb0JBQW9CQTtRQUNwQkEsRUFBRUE7UUFDRkEsaUVBQWlFQTtRQUNqRUEsb0JBQW9CQTtRQUVwQkEsdUJBQXVCQTtRQUN2QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsQ0FBQ0E7SUFFTXRDLGdEQUFxQkEsR0FBNUJBLFVBQTZCQSxnQkFBaUNBO1FBRTdEdUMsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBRTlDQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUVNdkMsbURBQXdCQSxHQUEvQkEsVUFBZ0NBLGdCQUFpQ0E7UUFFaEV3QyxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVuRkEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFDRnhDLHVCQUFDQTtBQUFEQSxDQXRpQkEsQUFzaUJDQSxFQXRpQjhCLGNBQWMsRUFzaUI1QztBQUVELEFBQTBCLGlCQUFqQixnQkFBZ0IsQ0FBQyIsImZpbGUiOiJtYXRlcmlhbHMvcGFzc2VzL01hdGVyaWFsUGFzc0Jhc2UuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vTWF0cml4M0RcIik7XG5pbXBvcnQgTWF0cml4M0RVdGlsc1x0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vTWF0cml4M0RVdGlsc1wiKTtcbmltcG9ydCBOYW1lZEFzc2V0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvTmFtZWRBc3NldEJhc2VcIik7XG5pbXBvcnQgQXJndW1lbnRFcnJvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9Bcmd1bWVudEVycm9yXCIpO1xuaW1wb3J0IEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcblxuaW1wb3J0IEJsZW5kTW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBMaWdodFBpY2tlckJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL0xpZ2h0UGlja2VyQmFzZVwiKTtcbmltcG9ydCBJTWF0ZXJpYWxQYXNzXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9JTWF0ZXJpYWxQYXNzXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IE1hdGVyaWFsUGFzc0RhdGFcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvTWF0ZXJpYWxQYXNzRGF0YVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcbmltcG9ydCBDb250ZXh0R0xCbGVuZEZhY3Rvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvQ29udGV4dEdMQmxlbmRGYWN0b3JcIik7XG5pbXBvcnQgQ29udGV4dEdMQ29tcGFyZU1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTENvbXBhcmVNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0U3RhZ2VHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvc3RhZ2VnbC9JQ29udGV4dFN0YWdlR0xcIik7XG5pbXBvcnQgU2hhZGVyT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJPYmplY3RCYXNlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyQ2FjaGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyQ2FjaGVcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJEYXRhXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5pbXBvcnQgSU1hdGVyaWFsUGFzc1N0YWdlR0xcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9JTWF0ZXJpYWxQYXNzU3RhZ2VHTFwiKTtcbmltcG9ydCBNYXRlcmlhbFBhc3NNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9NYXRlcmlhbFBhc3NNb2RlXCIpO1xuXG4vKipcbiAqIE1hdGVyaWFsUGFzc0Jhc2UgcHJvdmlkZXMgYW4gYWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgbWF0ZXJpYWwgc2hhZGVyIHBhc3Nlcy4gQSBtYXRlcmlhbCBwYXNzIGNvbnN0aXR1dGVzIGF0IGxlYXN0XG4gKiBhIHJlbmRlciBjYWxsIHBlciByZXF1aXJlZCByZW5kZXJhYmxlLlxuICovXG5jbGFzcyBNYXRlcmlhbFBhc3NCYXNlIGV4dGVuZHMgTmFtZWRBc3NldEJhc2UgaW1wbGVtZW50cyBJTWF0ZXJpYWxQYXNzLCBJTWF0ZXJpYWxQYXNzU3RhZ2VHTFxue1xuXHRwcml2YXRlIF9tYXRlcmlhbFBhc3NEYXRhOkFycmF5PE1hdGVyaWFsUGFzc0RhdGE+ID0gbmV3IEFycmF5PE1hdGVyaWFsUGFzc0RhdGE+KCk7XG5cdHByaXZhdGUgX21heExpZ2h0czpudW1iZXIgPSAzO1xuXHRwcml2YXRlIF9wcmVzZXJ2ZUFscGhhOmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9pbmNsdWRlQ2FzdGVyczpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfZm9yY2VTZXBhcmF0ZU1WUDpib29sZWFuID0gZmFsc2U7XG5cblx0cHJpdmF0ZSBfZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQ6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfcG9pbnRMaWdodHNPZmZzZXQ6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfbGlnaHRQcm9iZXNPZmZzZXQ6bnVtYmVyID0gMDtcblxuXHRwdWJsaWMgX3BOdW1Qb2ludExpZ2h0czpudW1iZXIgPSAwO1xuXHRwdWJsaWMgX3BOdW1EaXJlY3Rpb25hbExpZ2h0czpudW1iZXIgPSAwO1xuXHRwdWJsaWMgX3BOdW1MaWdodFByb2JlczpudW1iZXIgPSAwO1xuXHRwdWJsaWMgX3BOdW1MaWdodHM6bnVtYmVyID0gMDtcblxuXHRwcml2YXRlIF9wYXNzTW9kZTpudW1iZXI7XG5cblx0cHJpdmF0ZSBfZGVwdGhDb21wYXJlTW9kZTpzdHJpbmcgPSBDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTX0VRVUFMO1xuXG5cdHByaXZhdGUgX2JsZW5kRmFjdG9yU291cmNlOnN0cmluZyA9IENvbnRleHRHTEJsZW5kRmFjdG9yLk9ORTtcblx0cHJpdmF0ZSBfYmxlbmRGYWN0b3JEZXN0OnN0cmluZyA9IENvbnRleHRHTEJsZW5kRmFjdG9yLlpFUk87XG5cblx0cHVibGljIF9wRW5hYmxlQmxlbmRpbmc6Ym9vbGVhbiA9IGZhbHNlO1xuXG5cdHB1YmxpYyAgX3BMaWdodFBpY2tlcjpMaWdodFBpY2tlckJhc2U7XG5cblx0cHJpdmF0ZSBfd3JpdGVEZXB0aDpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfb25MaWdodHNDaGFuZ2VEZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBvdXRwdXQgYWxwaGEgdmFsdWUgc2hvdWxkIHJlbWFpbiB1bmNoYW5nZWQgY29tcGFyZWQgdG8gdGhlIG1hdGVyaWFsJ3Mgb3JpZ2luYWwgYWxwaGEuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHByZXNlcnZlQWxwaGEoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJlc2VydmVBbHBoYTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgcHJlc2VydmVBbHBoYSh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3ByZXNlcnZlQWxwaGEgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9wcmVzZXJ2ZUFscGhhID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgc2hhZG93IGNhc3RpbmcgbGlnaHRzIG5lZWQgdG8gYmUgaW5jbHVkZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGluY2x1ZGVDYXN0ZXJzKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2luY2x1ZGVDYXN0ZXJzO1xuXHR9XG5cblx0cHVibGljIHNldCBpbmNsdWRlQ2FzdGVycyh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2luY2x1ZGVDYXN0ZXJzID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5faW5jbHVkZUNhc3RlcnMgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzY3JlZW4gcHJvamVjdGlvbiBzaG91bGQgYmUgY2FsY3VsYXRlZCBieSBmb3JjaW5nIGEgc2VwYXJhdGUgc2NlbmUgbWF0cml4IGFuZFxuXHQgKiB2aWV3LXByb2plY3Rpb24gbWF0cml4LiBUaGlzIGlzIHVzZWQgdG8gcHJldmVudCByb3VuZGluZyBlcnJvcnMgd2hlbiB1c2luZyBtdWx0aXBsZSBwYXNzZXMgd2l0aCBkaWZmZXJlbnRcblx0ICogcHJvamVjdGlvbiBjb2RlLlxuXHQgKi9cblx0cHVibGljIGdldCBmb3JjZVNlcGFyYXRlTVZQKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2ZvcmNlU2VwYXJhdGVNVlA7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGZvcmNlU2VwYXJhdGVNVlAodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9mb3JjZVNlcGFyYXRlTVZQID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fZm9yY2VTZXBhcmF0ZU1WUCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzKCk7XG5cdH1cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGUgb2Zmc2V0IGluIHRoZSBsaWdodCBwaWNrZXIncyBkaXJlY3Rpb25hbCBsaWdodCB2ZWN0b3IgZm9yIHdoaWNoIHRvIHN0YXJ0IGluY2x1ZGluZyBsaWdodHMuXG5cdCAqIFRoaXMgbmVlZHMgdG8gYmUgc2V0IGJlZm9yZSB0aGUgbGlnaHQgcGlja2VyIGlzIGFzc2lnbmVkLlxuXHQgKi9cblx0cHVibGljIGdldCBkaXJlY3Rpb25hbExpZ2h0c09mZnNldCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RpcmVjdGlvbmFsTGlnaHRzT2Zmc2V0O1xuXHR9XG5cblx0cHVibGljIHNldCBkaXJlY3Rpb25hbExpZ2h0c09mZnNldCh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0c09mZnNldCA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGUgb2Zmc2V0IGluIHRoZSBsaWdodCBwaWNrZXIncyBwb2ludCBsaWdodCB2ZWN0b3IgZm9yIHdoaWNoIHRvIHN0YXJ0IGluY2x1ZGluZyBsaWdodHMuXG5cdCAqIFRoaXMgbmVlZHMgdG8gYmUgc2V0IGJlZm9yZSB0aGUgbGlnaHQgcGlja2VyIGlzIGFzc2lnbmVkLlxuXHQgKi9cblx0cHVibGljIGdldCBwb2ludExpZ2h0c09mZnNldCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BvaW50TGlnaHRzT2Zmc2V0O1xuXHR9XG5cblx0cHVibGljIHNldCBwb2ludExpZ2h0c09mZnNldCh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9wb2ludExpZ2h0c09mZnNldCA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGUgb2Zmc2V0IGluIHRoZSBsaWdodCBwaWNrZXIncyBsaWdodCBwcm9iZXMgdmVjdG9yIGZvciB3aGljaCB0byBzdGFydCBpbmNsdWRpbmcgbGlnaHRzLlxuXHQgKiBUaGlzIG5lZWRzIHRvIGJlIHNldCBiZWZvcmUgdGhlIGxpZ2h0IHBpY2tlciBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgbGlnaHRQcm9iZXNPZmZzZXQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9saWdodFByb2Jlc09mZnNldDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgbGlnaHRQcm9iZXNPZmZzZXQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fbGlnaHRQcm9iZXNPZmZzZXQgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBwYXNzTW9kZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Bhc3NNb2RlO1xuXHR9XG5cblx0cHVibGljIHNldCBwYXNzTW9kZSh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9wYXNzTW9kZSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBNYXRlcmlhbFBhc3NCYXNlIG9iamVjdC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHBhc3NNb2RlOm51bWJlciA9IDB4MDMpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fcGFzc01vZGUgPSBwYXNzTW9kZTtcblxuXHRcdHRoaXMuX29uTGlnaHRzQ2hhbmdlRGVsZWdhdGUgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMub25MaWdodHNDaGFuZ2UoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhIGNvbmNyZXRlIHNoYWRlciBvYmplY3QgZm9yIHRoaXMgcGFzcy5cblx0ICpcblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSB1c2VkIGJ5IHRoZSByZW5kZXJlci5cblx0ICovXG5cdHB1YmxpYyBjcmVhdGVTaGFkZXJPYmplY3QocHJvZmlsZTpzdHJpbmcpOlNoYWRlck9iamVjdEJhc2Vcblx0e1xuXHRcdHJldHVybiBuZXcgU2hhZGVyT2JqZWN0QmFzZShwcm9maWxlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZSB3aGV0aGVyIHRoaXMgcGFzcyBzaG91bGQgd3JpdGUgdG8gdGhlIGRlcHRoIGJ1ZmZlciBvciBub3QuIElnbm9yZWQgd2hlbiBibGVuZGluZyBpcyBlbmFibGVkLlxuXHQgKi9cblx0cHVibGljIGdldCB3cml0ZURlcHRoKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3dyaXRlRGVwdGg7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHdyaXRlRGVwdGgodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX3dyaXRlRGVwdGggPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZGVwdGggY29tcGFyZSBtb2RlIHVzZWQgdG8gcmVuZGVyIHRoZSByZW5kZXJhYmxlcyB1c2luZyB0aGlzIG1hdGVyaWFsLlxuXHQgKlxuXHQgKiBAc2VlIGF3YXkuc3RhZ2VnbC5Db250ZXh0R0xDb21wYXJlTW9kZVxuXHQgKi9cblx0cHVibGljIGdldCBkZXB0aENvbXBhcmVNb2RlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZGVwdGhDb21wYXJlTW9kZTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZGVwdGhDb21wYXJlTW9kZSh2YWx1ZTpzdHJpbmcpXG5cdHtcblx0XHR0aGlzLl9kZXB0aENvbXBhcmVNb2RlID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW5zIHVwIGFueSByZXNvdXJjZXMgdXNlZCBieSB0aGUgY3VycmVudCBvYmplY3QuXG5cdCAqIEBwYXJhbSBkZWVwIEluZGljYXRlcyB3aGV0aGVyIG90aGVyIHJlc291cmNlcyBzaG91bGQgYmUgY2xlYW5lZCB1cCwgdGhhdCBjb3VsZCBwb3RlbnRpYWxseSBiZSBzaGFyZWQgYWNyb3NzIGRpZmZlcmVudCBpbnN0YW5jZXMuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fcExpZ2h0UGlja2VyKVxuXHRcdFx0dGhpcy5fcExpZ2h0UGlja2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ0hBTkdFLCB0aGlzLl9vbkxpZ2h0c0NoYW5nZURlbGVnYXRlKTtcblxuXHRcdHdoaWxlICh0aGlzLl9tYXRlcmlhbFBhc3NEYXRhLmxlbmd0aClcblx0XHRcdHRoaXMuX21hdGVyaWFsUGFzc0RhdGFbMF0uZGlzcG9zZSgpO1xuXG5cdFx0dGhpcy5fbWF0ZXJpYWxQYXNzRGF0YSA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVycyBhbiBvYmplY3QgdG8gdGhlIGN1cnJlbnQgcmVuZGVyIHRhcmdldC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBfaVJlbmRlcihwYXNzOk1hdGVyaWFsUGFzc0RhdGEsIHJlbmRlcmFibGU6UmVuZGVyYWJsZUJhc2UsIHN0YWdlOlN0YWdlLCBjYW1lcmE6Q2FtZXJhLCB2aWV3UHJvamVjdGlvbjpNYXRyaXgzRClcblx0e1xuXHRcdHRoaXMuc2V0UmVuZGVyU3RhdGUocGFzcywgcmVuZGVyYWJsZSwgc3RhZ2UsIGNhbWVyYSwgdmlld1Byb2plY3Rpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqXG5cdCAqIEBwYXJhbSByZW5kZXJhYmxlXG5cdCAqIEBwYXJhbSBzdGFnZVxuXHQgKiBAcGFyYW0gY2FtZXJhXG5cdCAqL1xuXHRwdWJsaWMgc2V0UmVuZGVyU3RhdGUocGFzczpNYXRlcmlhbFBhc3NEYXRhLCByZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSwgdmlld1Byb2plY3Rpb246TWF0cml4M0QpXG5cdHtcblx0XHRwYXNzLnNoYWRlck9iamVjdC5zZXRSZW5kZXJTdGF0ZShyZW5kZXJhYmxlLCBzdGFnZSwgY2FtZXJhLCB2aWV3UHJvamVjdGlvbik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJsZW5kIG1vZGUgdG8gdXNlIHdoZW4gZHJhd2luZyB0aGlzIHJlbmRlcmFibGUuIFRoZSBmb2xsb3dpbmcgYmxlbmQgbW9kZXMgYXJlIHN1cHBvcnRlZDpcblx0ICogPHVsPlxuXHQgKiA8bGk+QmxlbmRNb2RlLk5PUk1BTDogTm8gYmxlbmRpbmcsIHVubGVzcyB0aGUgbWF0ZXJpYWwgaW5oZXJlbnRseSBuZWVkcyBpdDwvbGk+XG5cdCAqIDxsaT5CbGVuZE1vZGUuTEFZRVI6IEZvcmNlIGJsZW5kaW5nLiBUaGlzIHdpbGwgZHJhdyB0aGUgb2JqZWN0IHRoZSBzYW1lIGFzIE5PUk1BTCwgYnV0IHdpdGhvdXQgd3JpdGluZyBkZXB0aCB3cml0ZXMuPC9saT5cblx0ICogPGxpPkJsZW5kTW9kZS5NVUxUSVBMWTwvbGk+XG5cdCAqIDxsaT5CbGVuZE1vZGUuQUREPC9saT5cblx0ICogPGxpPkJsZW5kTW9kZS5BTFBIQTwvbGk+XG5cdCAqIDwvdWw+XG5cdCAqL1xuXHRwdWJsaWMgc2V0QmxlbmRNb2RlKHZhbHVlOnN0cmluZylcblx0e1xuXHRcdHN3aXRjaCAodmFsdWUpIHtcblxuXHRcdFx0Y2FzZSBCbGVuZE1vZGUuTk9STUFMOlxuXG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yU291cmNlID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuT05FO1xuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRlc3QgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5aRVJPO1xuXHRcdFx0XHR0aGlzLl9wRW5hYmxlQmxlbmRpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBCbGVuZE1vZGUuTEFZRVI6XG5cblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JTb3VyY2UgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5TT1VSQ0VfQUxQSEE7XG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGVzdCA9IENvbnRleHRHTEJsZW5kRmFjdG9yLk9ORV9NSU5VU19TT1VSQ0VfQUxQSEE7XG5cdFx0XHRcdHRoaXMuX3BFbmFibGVCbGVuZGluZyA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQmxlbmRNb2RlLk1VTFRJUExZOlxuXG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yU291cmNlID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuWkVSTztcblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEZXN0ID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuU09VUkNFX0NPTE9SO1xuXHRcdFx0XHR0aGlzLl9wRW5hYmxlQmxlbmRpbmcgPSB0cnVlO1xuXG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIEJsZW5kTW9kZS5BREQ6XG5cblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JTb3VyY2UgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5TT1VSQ0VfQUxQSEE7XG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGVzdCA9IENvbnRleHRHTEJsZW5kRmFjdG9yLk9ORTtcblx0XHRcdFx0dGhpcy5fcEVuYWJsZUJsZW5kaW5nID0gdHJ1ZTtcblxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBCbGVuZE1vZGUuQUxQSEE6XG5cblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JTb3VyY2UgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5aRVJPO1xuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRlc3QgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5TT1VSQ0VfQUxQSEE7XG5cdFx0XHRcdHRoaXMuX3BFbmFibGVCbGVuZGluZyA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cblx0XHRcdFx0dGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoXCJVbnN1cHBvcnRlZCBibGVuZCBtb2RlIVwiKTtcblxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSByZW5kZXIgc3RhdGUgZm9yIHRoZSBwYXNzIHRoYXQgaXMgaW5kZXBlbmRlbnQgb2YgdGhlIHJlbmRlcmVkIG9iamVjdC4gVGhpcyBuZWVkcyB0byBiZSBjYWxsZWQgYmVmb3JlXG5cdCAqIGNhbGxpbmcgcmVuZGVyUGFzcy4gQmVmb3JlIGFjdGl2YXRpbmcgYSBwYXNzLCB0aGUgcHJldmlvdXNseSB1c2VkIHBhc3MgbmVlZHMgdG8gYmUgZGVhY3RpdmF0ZWQuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IHdoaWNoIGlzIGN1cnJlbnRseSB1c2VkIGZvciByZW5kZXJpbmcuXG5cdCAqIEBwYXJhbSBjYW1lcmEgVGhlIGNhbWVyYSBmcm9tIHdoaWNoIHRoZSBzY2VuZSBpcyB2aWV3ZWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgX2lBY3RpdmF0ZShwYXNzOk1hdGVyaWFsUGFzc0RhdGEsIHN0YWdlOlN0YWdlLCBjYW1lcmE6Q2FtZXJhKVxuXHR7XG5cdFx0dmFyIGNvbnRleHQ6SUNvbnRleHRTdGFnZUdMID0gPElDb250ZXh0U3RhZ2VHTD4gc3RhZ2UuY29udGV4dDtcblxuXHRcdGNvbnRleHQuc2V0RGVwdGhUZXN0KCggdGhpcy5fd3JpdGVEZXB0aCAmJiAhdGhpcy5fcEVuYWJsZUJsZW5kaW5nICksIHRoaXMuX2RlcHRoQ29tcGFyZU1vZGUpO1xuXG5cdFx0aWYgKHRoaXMuX3BFbmFibGVCbGVuZGluZylcblx0XHRcdGNvbnRleHQuc2V0QmxlbmRGYWN0b3JzKHRoaXMuX2JsZW5kRmFjdG9yU291cmNlLCB0aGlzLl9ibGVuZEZhY3RvckRlc3QpO1xuXG5cdFx0Y29udGV4dC5hY3RpdmF0ZU1hdGVyaWFsUGFzcyhwYXNzLCBzdGFnZSwgY2FtZXJhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhcnMgdGhlIHJlbmRlciBzdGF0ZSBmb3IgdGhlIHBhc3MuIFRoaXMgbmVlZHMgdG8gYmUgY2FsbGVkIGJlZm9yZSBhY3RpdmF0aW5nIGFub3RoZXIgcGFzcy5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSB1c2VkIGZvciByZW5kZXJpbmdcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBfaURlYWN0aXZhdGUocGFzczpNYXRlcmlhbFBhc3NEYXRhLCBzdGFnZTpTdGFnZSlcblx0e1xuXHRcdCg8SUNvbnRleHRTdGFnZUdMPiBzdGFnZS5jb250ZXh0KS5kZWFjdGl2YXRlTWF0ZXJpYWxQYXNzKHBhc3MsIHN0YWdlKTtcblxuXHRcdCg8SUNvbnRleHRTdGFnZUdMPiBzdGFnZS5jb250ZXh0KS5zZXREZXB0aFRlc3QodHJ1ZSwgQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTCk7IC8vIFRPRE8gOiBpbWVwbGVtZW50XG5cdH1cblxuXHQvKipcblx0ICogTWFya3MgdGhlIHNoYWRlciBwcm9ncmFtIGFzIGludmFsaWQsIHNvIGl0IHdpbGwgYmUgcmVjb21waWxlZCBiZWZvcmUgdGhlIG5leHQgcmVuZGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXBkYXRlTWF0ZXJpYWwgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGludmFsaWRhdGlvbiBzaG91bGQgYmUgcGVyZm9ybWVkIG9uIHRoZSBlbnRpcmUgbWF0ZXJpYWwuIFNob3VsZCBhbHdheXMgcGFzcyBcInRydWVcIiB1bmxlc3MgaXQncyBjYWxsZWQgZnJvbSB0aGUgbWF0ZXJpYWwgaXRzZWxmLlxuXHQgKi9cblx0cHVibGljIF9wSW52YWxpZGF0ZVBhc3MoKVxuXHR7XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9tYXRlcmlhbFBhc3NEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdHRoaXMuX21hdGVyaWFsUGFzc0RhdGFbaV0uaW52YWxpZGF0ZSgpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5DSEFOR0UpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbGlnaHQgcGlja2VyIHVzZWQgYnkgdGhlIG1hdGVyaWFsIHRvIHByb3ZpZGUgbGlnaHRzIHRvIHRoZSBtYXRlcmlhbCBpZiBpdCBzdXBwb3J0cyBsaWdodGluZy5cblx0ICpcblx0ICogQHNlZSBhd2F5Lm1hdGVyaWFscy5MaWdodFBpY2tlckJhc2Vcblx0ICogQHNlZSBhd2F5Lm1hdGVyaWFscy5TdGF0aWNMaWdodFBpY2tlclxuXHQgKi9cblx0cHVibGljIGdldCBsaWdodFBpY2tlcigpOkxpZ2h0UGlja2VyQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BMaWdodFBpY2tlcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgbGlnaHRQaWNrZXIodmFsdWU6TGlnaHRQaWNrZXJCYXNlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3BMaWdodFBpY2tlcilcblx0XHRcdHRoaXMuX3BMaWdodFBpY2tlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkNIQU5HRSwgdGhpcy5fb25MaWdodHNDaGFuZ2VEZWxlZ2F0ZSk7XG5cblx0XHR0aGlzLl9wTGlnaHRQaWNrZXIgPSB2YWx1ZTtcblxuXHRcdGlmICh0aGlzLl9wTGlnaHRQaWNrZXIpXG5cdFx0XHR0aGlzLl9wTGlnaHRQaWNrZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5DSEFOR0UsIHRoaXMuX29uTGlnaHRzQ2hhbmdlRGVsZWdhdGUpO1xuXG5cdFx0dGhpcy5wVXBkYXRlTGlnaHRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gdGhlIGxpZ2h0IHBpY2tlcidzIGNvbmZpZ3VyYXRpb24gY2hhbmdlcy5cblx0ICovXG5cdHByaXZhdGUgb25MaWdodHNDaGFuZ2UoZXZlbnQ6RXZlbnQpXG5cdHtcblx0XHR0aGlzLnBVcGRhdGVMaWdodHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbXBsZW1lbnRlZCBieSBzdWJjbGFzc2VzIGlmIHRoZSBwYXNzIHVzZXMgbGlnaHRzIHRvIHVwZGF0ZSB0aGUgc2hhZGVyLlxuXHQgKi9cblx0cHVibGljIHBVcGRhdGVMaWdodHMoKVxuXHR7XG5cdFx0dmFyIG51bURpcmVjdGlvbmFsTGlnaHRzT2xkOm51bWJlciA9IHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cztcblx0XHR2YXIgbnVtUG9pbnRMaWdodHNPbGQ6bnVtYmVyID0gdGhpcy5fcE51bVBvaW50TGlnaHRzO1xuXHRcdHZhciBudW1MaWdodFByb2Jlc09sZDpudW1iZXIgPSB0aGlzLl9wTnVtTGlnaHRQcm9iZXM7XG5cblx0XHRpZiAodGhpcy5fcExpZ2h0UGlja2VyICYmICh0aGlzLl9wYXNzTW9kZSAmIE1hdGVyaWFsUGFzc01vZGUuTElHSFRJTkcpKSB7XG5cdFx0XHR0aGlzLl9wTnVtRGlyZWN0aW9uYWxMaWdodHMgPSB0aGlzLmNhbGN1bGF0ZU51bURpcmVjdGlvbmFsTGlnaHRzKHRoaXMuX3BMaWdodFBpY2tlci5udW1EaXJlY3Rpb25hbExpZ2h0cyk7XG5cdFx0XHR0aGlzLl9wTnVtUG9pbnRMaWdodHMgPSB0aGlzLmNhbGN1bGF0ZU51bVBvaW50TGlnaHRzKHRoaXMuX3BMaWdodFBpY2tlci5udW1Qb2ludExpZ2h0cyk7XG5cdFx0XHR0aGlzLl9wTnVtTGlnaHRQcm9iZXMgPSB0aGlzLmNhbGN1bGF0ZU51bVByb2Jlcyh0aGlzLl9wTGlnaHRQaWNrZXIubnVtTGlnaHRQcm9iZXMpO1xuXG5cdFx0XHRpZiAodGhpcy5faW5jbHVkZUNhc3RlcnMpIHtcblx0XHRcdFx0dGhpcy5fcE51bURpcmVjdGlvbmFsTGlnaHRzICs9IHRoaXMuX3BMaWdodFBpY2tlci5udW1DYXN0aW5nRGlyZWN0aW9uYWxMaWdodHM7XG5cdFx0XHRcdHRoaXMuX3BOdW1Qb2ludExpZ2h0cyArPSB0aGlzLl9wTGlnaHRQaWNrZXIubnVtQ2FzdGluZ1BvaW50TGlnaHRzO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cyA9IDA7XG5cdFx0XHR0aGlzLl9wTnVtUG9pbnRMaWdodHMgPSAwO1xuXHRcdFx0dGhpcy5fcE51bUxpZ2h0UHJvYmVzID0gMDtcblx0XHR9XG5cblx0XHR0aGlzLl9wTnVtTGlnaHRzID0gdGhpcy5fcE51bURpcmVjdGlvbmFsTGlnaHRzICsgdGhpcy5fcE51bVBvaW50TGlnaHRzO1xuXG5cdFx0aWYgKG51bURpcmVjdGlvbmFsTGlnaHRzT2xkICE9IHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cyB8fCBudW1Qb2ludExpZ2h0c09sZCAhPSB0aGlzLl9wTnVtUG9pbnRMaWdodHMgfHwgbnVtTGlnaHRQcm9iZXNPbGQgIT0gdGhpcy5fcE51bUxpZ2h0UHJvYmVzKVxuXHRcdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzKCk7XG5cdH1cblxuXHRwdWJsaWMgX2lJbmNsdWRlRGVwZW5kZW5jaWVzKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2ZvcmNlU2VwYXJhdGVNVlApXG5cdFx0XHRzaGFkZXJPYmplY3QuZ2xvYmFsUG9zRGVwZW5kZW5jaWVzKys7XG5cblx0XHRzaGFkZXJPYmplY3Qub3V0cHV0c05vcm1hbHMgPSB0aGlzLl9wT3V0cHV0c05vcm1hbHMoc2hhZGVyT2JqZWN0KTtcblx0XHRzaGFkZXJPYmplY3Qub3V0cHV0c1RhbmdlbnROb3JtYWxzID0gc2hhZGVyT2JqZWN0Lm91dHB1dHNOb3JtYWxzICYmIHRoaXMuX3BPdXRwdXRzVGFuZ2VudE5vcm1hbHMoc2hhZGVyT2JqZWN0KTtcblx0XHRzaGFkZXJPYmplY3QudXNlc1RhbmdlbnRTcGFjZSA9IHNoYWRlck9iamVjdC5vdXRwdXRzVGFuZ2VudE5vcm1hbHMgJiYgdGhpcy5fcFVzZXNUYW5nZW50U3BhY2Uoc2hhZGVyT2JqZWN0KTtcblxuXHRcdGlmICghc2hhZGVyT2JqZWN0LnVzZXNUYW5nZW50U3BhY2UpXG5cdFx0XHRzaGFkZXJPYmplY3QuYWRkV29ybGRTcGFjZURlcGVuZGVuY2llcyhCb29sZWFuKHRoaXMuX3Bhc3NNb2RlICYgTWF0ZXJpYWxQYXNzTW9kZS5FRkZFQ1RTKSk7XG5cdH1cblxuXG5cdHB1YmxpYyBfaUluaXRDb25zdGFudERhdGEoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpXG5cdHtcblxuXHR9XG5cblx0cHVibGljIF9pR2V0UHJlTGlnaHRpbmdWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRwdWJsaWMgX2lHZXRQcmVMaWdodGluZ0ZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0cHVibGljIF9pR2V0VmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0cHVibGljIF9pR2V0RnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRwdWJsaWMgX2lHZXROb3JtYWxWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRwdWJsaWMgX2lHZXROb3JtYWxGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHBvaW50IGxpZ2h0cyB0aGF0IG5lZWQgdG8gYmUgc3VwcG9ydGVkLlxuXHQgKi9cblx0cHVibGljIGdldCBpTnVtUG9pbnRMaWdodHMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTnVtUG9pbnRMaWdodHM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiBkaXJlY3Rpb25hbCBsaWdodHMgdGhhdCBuZWVkIHRvIGJlIHN1cHBvcnRlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgaU51bURpcmVjdGlvbmFsTGlnaHRzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcE51bURpcmVjdGlvbmFsTGlnaHRzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgbGlnaHQgcHJvYmVzIHRoYXQgbmVlZCB0byBiZSBzdXBwb3J0ZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGlOdW1MaWdodFByb2JlcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BOdW1MaWdodFByb2Jlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgbm9ybWFscyBhcmUgY2FsY3VsYXRlZCBhdCBhbGwuXG5cdCAqL1xuXHRwdWJsaWMgX3BPdXRwdXRzTm9ybWFscyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBub3JtYWxzIGFyZSBjYWxjdWxhdGVkIGluIHRhbmdlbnQgc3BhY2UuXG5cdCAqL1xuXHRwdWJsaWMgX3BPdXRwdXRzVGFuZ2VudE5vcm1hbHMoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgbm9ybWFscyBhcmUgYWxsb3dlZCBpbiB0YW5nZW50IHNwYWNlLiBUaGlzIGlzIG9ubHkgdGhlIGNhc2UgaWYgbm8gb2JqZWN0LXNwYWNlXG5cdCAqIGRlcGVuZGVuY2llcyBleGlzdC5cblx0ICovXG5cdHB1YmxpYyBfcFVzZXNUYW5nZW50U3BhY2Uoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIHRoZSBhbW91bnQgb2YgZGlyZWN0aW9uYWwgbGlnaHRzIHRoaXMgbWF0ZXJpYWwgd2lsbCBzdXBwb3J0LlxuXHQgKiBAcGFyYW0gbnVtRGlyZWN0aW9uYWxMaWdodHMgVGhlIG1heGltdW0gYW1vdW50IG9mIGRpcmVjdGlvbmFsIGxpZ2h0cyB0byBzdXBwb3J0LlxuXHQgKiBAcmV0dXJuIFRoZSBhbW91bnQgb2YgZGlyZWN0aW9uYWwgbGlnaHRzIHRoaXMgbWF0ZXJpYWwgd2lsbCBzdXBwb3J0LCBib3VuZGVkIGJ5IHRoZSBhbW91bnQgbmVjZXNzYXJ5LlxuXHQgKi9cblx0cHJpdmF0ZSBjYWxjdWxhdGVOdW1EaXJlY3Rpb25hbExpZ2h0cyhudW1EaXJlY3Rpb25hbExpZ2h0czpudW1iZXIpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIE1hdGgubWluKG51bURpcmVjdGlvbmFsTGlnaHRzIC0gdGhpcy5fZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQsIHRoaXMuX21heExpZ2h0cyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgYW1vdW50IG9mIHBvaW50IGxpZ2h0cyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydC5cblx0ICogQHBhcmFtIG51bURpcmVjdGlvbmFsTGlnaHRzIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBwb2ludCBsaWdodHMgdG8gc3VwcG9ydC5cblx0ICogQHJldHVybiBUaGUgYW1vdW50IG9mIHBvaW50IGxpZ2h0cyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydCwgYm91bmRlZCBieSB0aGUgYW1vdW50IG5lY2Vzc2FyeS5cblx0ICovXG5cdHByaXZhdGUgY2FsY3VsYXRlTnVtUG9pbnRMaWdodHMobnVtUG9pbnRMaWdodHM6bnVtYmVyKTpudW1iZXJcblx0e1xuXHRcdHZhciBudW1GcmVlOm51bWJlciA9IHRoaXMuX21heExpZ2h0cyAtIHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cztcblx0XHRyZXR1cm4gTWF0aC5taW4obnVtUG9pbnRMaWdodHMgLSB0aGlzLl9wb2ludExpZ2h0c09mZnNldCwgbnVtRnJlZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgYW1vdW50IG9mIGxpZ2h0IHByb2JlcyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydC5cblx0ICogQHBhcmFtIG51bURpcmVjdGlvbmFsTGlnaHRzIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBsaWdodCBwcm9iZXMgdG8gc3VwcG9ydC5cblx0ICogQHJldHVybiBUaGUgYW1vdW50IG9mIGxpZ2h0IHByb2JlcyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydCwgYm91bmRlZCBieSB0aGUgYW1vdW50IG5lY2Vzc2FyeS5cblx0ICovXG5cdHByaXZhdGUgY2FsY3VsYXRlTnVtUHJvYmVzKG51bUxpZ2h0UHJvYmVzOm51bWJlcik6bnVtYmVyXG5cdHtcblx0XHR2YXIgbnVtQ2hhbm5lbHM6bnVtYmVyID0gMDtcblx0XHQvL1x0XHRcdGlmICgodGhpcy5fcFNwZWN1bGFyTGlnaHRTb3VyY2VzICYgTGlnaHRTb3VyY2VzLlBST0JFUykgIT0gMClcblx0XHQvL1x0XHRcdFx0KytudW1DaGFubmVscztcblx0XHQvL1xuXHRcdC8vXHRcdFx0aWYgKCh0aGlzLl9wRGlmZnVzZUxpZ2h0U291cmNlcyAmIExpZ2h0U291cmNlcy5QUk9CRVMpICE9IDApXG5cdFx0Ly9cdFx0XHRcdCsrbnVtQ2hhbm5lbHM7XG5cblx0XHQvLyA0IGNoYW5uZWxzIGF2YWlsYWJsZVxuXHRcdHJldHVybiBNYXRoLm1pbihudW1MaWdodFByb2JlcyAtIHRoaXMuX2xpZ2h0UHJvYmVzT2Zmc2V0LCAoNC9udW1DaGFubmVscykgfCAwKTtcblx0fVxuXG5cdHB1YmxpYyBfaUFkZE1hdGVyaWFsUGFzc0RhdGEobWF0ZXJpYWxQYXNzRGF0YTpNYXRlcmlhbFBhc3NEYXRhKTpNYXRlcmlhbFBhc3NEYXRhXG5cdHtcblx0XHR0aGlzLl9tYXRlcmlhbFBhc3NEYXRhLnB1c2gobWF0ZXJpYWxQYXNzRGF0YSk7XG5cblx0XHRyZXR1cm4gbWF0ZXJpYWxQYXNzRGF0YTtcblx0fVxuXG5cdHB1YmxpYyBfaVJlbW92ZU1hdGVyaWFsUGFzc0RhdGEobWF0ZXJpYWxQYXNzRGF0YTpNYXRlcmlhbFBhc3NEYXRhKTpNYXRlcmlhbFBhc3NEYXRhXG5cdHtcblx0XHR0aGlzLl9tYXRlcmlhbFBhc3NEYXRhLnNwbGljZSh0aGlzLl9tYXRlcmlhbFBhc3NEYXRhLmluZGV4T2YobWF0ZXJpYWxQYXNzRGF0YSksIDEpO1xuXG5cdFx0cmV0dXJuIG1hdGVyaWFsUGFzc0RhdGE7XG5cdH1cbn1cblxuZXhwb3J0ID0gTWF0ZXJpYWxQYXNzQmFzZTsiXX0=