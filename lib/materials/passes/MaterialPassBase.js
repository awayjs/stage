var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BlendMode = require("awayjs-core/lib/core/base/BlendMode");
var NamedAssetBase = require("awayjs-core/lib/core/library/NamedAssetBase");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var Event = require("awayjs-core/lib/events/Event");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9wYXNzZXMvbWF0ZXJpYWxwYXNzYmFzZS50cyJdLCJuYW1lcyI6WyJNYXRlcmlhbFBhc3NCYXNlIiwiTWF0ZXJpYWxQYXNzQmFzZS5jb25zdHJ1Y3RvciIsIk1hdGVyaWFsUGFzc0Jhc2UucHJlc2VydmVBbHBoYSIsIk1hdGVyaWFsUGFzc0Jhc2UuaW5jbHVkZUNhc3RlcnMiLCJNYXRlcmlhbFBhc3NCYXNlLmZvcmNlU2VwYXJhdGVNVlAiLCJNYXRlcmlhbFBhc3NCYXNlLmRpcmVjdGlvbmFsTGlnaHRzT2Zmc2V0IiwiTWF0ZXJpYWxQYXNzQmFzZS5wb2ludExpZ2h0c09mZnNldCIsIk1hdGVyaWFsUGFzc0Jhc2UubGlnaHRQcm9iZXNPZmZzZXQiLCJNYXRlcmlhbFBhc3NCYXNlLnBhc3NNb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5jcmVhdGVTaGFkZXJPYmplY3QiLCJNYXRlcmlhbFBhc3NCYXNlLndyaXRlRGVwdGgiLCJNYXRlcmlhbFBhc3NCYXNlLmRlcHRoQ29tcGFyZU1vZGUiLCJNYXRlcmlhbFBhc3NCYXNlLmRpc3Bvc2UiLCJNYXRlcmlhbFBhc3NCYXNlLl9pUmVuZGVyIiwiTWF0ZXJpYWxQYXNzQmFzZS5zZXRSZW5kZXJTdGF0ZSIsIk1hdGVyaWFsUGFzc0Jhc2Uuc2V0QmxlbmRNb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUFjdGl2YXRlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faURlYWN0aXZhdGUiLCJNYXRlcmlhbFBhc3NCYXNlLl9wSW52YWxpZGF0ZVBhc3MiLCJNYXRlcmlhbFBhc3NCYXNlLmxpZ2h0UGlja2VyIiwiTWF0ZXJpYWxQYXNzQmFzZS5vbkxpZ2h0c0NoYW5nZSIsIk1hdGVyaWFsUGFzc0Jhc2UucFVwZGF0ZUxpZ2h0cyIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lJbmNsdWRlRGVwZW5kZW5jaWVzIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUluaXRDb25zdGFudERhdGEiLCJNYXRlcmlhbFBhc3NCYXNlLl9pR2V0UHJlTGlnaHRpbmdWZXJ0ZXhDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldFByZUxpZ2h0aW5nRnJhZ21lbnRDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldFZlcnRleENvZGUiLCJNYXRlcmlhbFBhc3NCYXNlLl9pR2V0RnJhZ21lbnRDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5faUdldE5vcm1hbFZlcnRleENvZGUiLCJNYXRlcmlhbFBhc3NCYXNlLl9pR2V0Tm9ybWFsRnJhZ21lbnRDb2RlIiwiTWF0ZXJpYWxQYXNzQmFzZS5pTnVtUG9pbnRMaWdodHMiLCJNYXRlcmlhbFBhc3NCYXNlLmlOdW1EaXJlY3Rpb25hbExpZ2h0cyIsIk1hdGVyaWFsUGFzc0Jhc2UuaU51bUxpZ2h0UHJvYmVzIiwiTWF0ZXJpYWxQYXNzQmFzZS5fcE91dHB1dHNOb3JtYWxzIiwiTWF0ZXJpYWxQYXNzQmFzZS5fcE91dHB1dHNUYW5nZW50Tm9ybWFscyIsIk1hdGVyaWFsUGFzc0Jhc2UuX3BVc2VzVGFuZ2VudFNwYWNlIiwiTWF0ZXJpYWxQYXNzQmFzZS5jYWxjdWxhdGVOdW1EaXJlY3Rpb25hbExpZ2h0cyIsIk1hdGVyaWFsUGFzc0Jhc2UuY2FsY3VsYXRlTnVtUG9pbnRMaWdodHMiLCJNYXRlcmlhbFBhc3NCYXNlLmNhbGN1bGF0ZU51bVByb2JlcyIsIk1hdGVyaWFsUGFzc0Jhc2UuX2lBZGRNYXRlcmlhbFBhc3NEYXRhIiwiTWF0ZXJpYWxQYXNzQmFzZS5faVJlbW92ZU1hdGVyaWFsUGFzc0RhdGEiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sU0FBUyxXQUFlLHFDQUFxQyxDQUFDLENBQUM7QUFHdEUsSUFBTyxjQUFjLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUVsRixJQUFPLGFBQWEsV0FBYyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzFFLElBQU8sS0FBSyxXQUFnQiw4QkFBOEIsQ0FBQyxDQUFDO0FBTTVELElBQU8sb0JBQW9CLFdBQWEsc0RBQXNELENBQUMsQ0FBQztBQUNoRyxJQUFPLG9CQUFvQixXQUFhLHNE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QSxDQUFDQSxrQkFBa0JBLEVBQUVBLENBQUNBLENBQUNBLEdBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVNdEMsZ0RBQXFCQSxHQUE1QkEsVUFBNkJBLGdCQUFpQ0E7UUFFN0R1QyxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFFOUNBLE1BQU1BLENBQUNBLGdCQUFnQkEsQ0FBQ0E7SUFDekJBLENBQUNBO0lBRU12QyxtREFBd0JBLEdBQS9CQSxVQUFnQ0EsZ0JBQWlDQTtRQUVoRXdDLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBRW5GQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUNGeEMsdUJBQUNBO0FBQURBLENBdGlCQSxBQXNpQkNBLEVBdGlCOEIsY0FBYyxFQXNpQjVDO0FBRUQsQUFBMEIsaUJBQWpCLGdCQUFnQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9wYXNzZXMvTWF0ZXJpYWxQYXNzQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgQmxlbmRNb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9NYXRyaXgzRFwiKTtcbmltcG9ydCBNYXRyaXgzRFV0aWxzXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL01hdHJpeDNEVXRpbHNcIik7XG5pbXBvcnQgTmFtZWRBc3NldEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2xpYnJhcnkvTmFtZWRBc3NldEJhc2VcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBBcmd1bWVudEVycm9yXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXJyb3JzL0FyZ3VtZW50RXJyb3JcIik7XG5pbXBvcnQgRXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IExpZ2h0UGlja2VyQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvTGlnaHRQaWNrZXJCYXNlXCIpO1xuaW1wb3J0IElNYXRlcmlhbFBhc3NcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9tYXRlcmlhbHMvcGFzc2VzL0lNYXRlcmlhbFBhc3NcIik7XG5cbmltcG9ydCBNYXRlcmlhbFBhc3NEYXRhXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL01hdGVyaWFsUGFzc0RhdGFcIik7XG5pbXBvcnQgUmVuZGVyYWJsZUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvUmVuZGVyYWJsZUJhc2VcIik7XG5pbXBvcnQgQ29udGV4dEdMQmxlbmRGYWN0b3JcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTEJsZW5kRmFjdG9yXCIpO1xuaW1wb3J0IENvbnRleHRHTENvbXBhcmVNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvc3RhZ2VnbC9Db250ZXh0R0xDb21wYXJlTW9kZVwiKTtcbmltcG9ydCBJQ29udGV4dFN0YWdlR0xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvSUNvbnRleHRTdGFnZUdMXCIpO1xuaW1wb3J0IFNoYWRlck9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyT2JqZWN0QmFzZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckNhY2hlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJEYXRhXCIpO1xuaW1wb3J0IElNYXRlcmlhbFBhc3NTdGFnZUdMXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvSU1hdGVyaWFsUGFzc1N0YWdlR0xcIik7XG5pbXBvcnQgTWF0ZXJpYWxQYXNzTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvTWF0ZXJpYWxQYXNzTW9kZVwiKTtcblxuLyoqXG4gKiBNYXRlcmlhbFBhc3NCYXNlIHByb3ZpZGVzIGFuIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIG1hdGVyaWFsIHNoYWRlciBwYXNzZXMuIEEgbWF0ZXJpYWwgcGFzcyBjb25zdGl0dXRlcyBhdCBsZWFzdFxuICogYSByZW5kZXIgY2FsbCBwZXIgcmVxdWlyZWQgcmVuZGVyYWJsZS5cbiAqL1xuY2xhc3MgTWF0ZXJpYWxQYXNzQmFzZSBleHRlbmRzIE5hbWVkQXNzZXRCYXNlIGltcGxlbWVudHMgSU1hdGVyaWFsUGFzcywgSU1hdGVyaWFsUGFzc1N0YWdlR0xcbntcblx0cHJpdmF0ZSBfbWF0ZXJpYWxQYXNzRGF0YTpBcnJheTxNYXRlcmlhbFBhc3NEYXRhPiA9IG5ldyBBcnJheTxNYXRlcmlhbFBhc3NEYXRhPigpO1xuXHRwcml2YXRlIF9tYXhMaWdodHM6bnVtYmVyID0gMztcblx0cHJpdmF0ZSBfcHJlc2VydmVBbHBoYTpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfaW5jbHVkZUNhc3RlcnM6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2ZvcmNlU2VwYXJhdGVNVlA6Ym9vbGVhbiA9IGZhbHNlO1xuXG5cdHByaXZhdGUgX2RpcmVjdGlvbmFsTGlnaHRzT2Zmc2V0Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX3BvaW50TGlnaHRzT2Zmc2V0Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX2xpZ2h0UHJvYmVzT2Zmc2V0Om51bWJlciA9IDA7XG5cblx0cHVibGljIF9wTnVtUG9pbnRMaWdodHM6bnVtYmVyID0gMDtcblx0cHVibGljIF9wTnVtRGlyZWN0aW9uYWxMaWdodHM6bnVtYmVyID0gMDtcblx0cHVibGljIF9wTnVtTGlnaHRQcm9iZXM6bnVtYmVyID0gMDtcblx0cHVibGljIF9wTnVtTGlnaHRzOm51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBfcGFzc01vZGU6bnVtYmVyO1xuXG5cdHByaXZhdGUgX2RlcHRoQ29tcGFyZU1vZGU6c3RyaW5nID0gQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTDtcblxuXHRwcml2YXRlIF9ibGVuZEZhY3RvclNvdXJjZTpzdHJpbmcgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5PTkU7XG5cdHByaXZhdGUgX2JsZW5kRmFjdG9yRGVzdDpzdHJpbmcgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5aRVJPO1xuXG5cdHB1YmxpYyBfcEVuYWJsZUJsZW5kaW5nOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRwdWJsaWMgIF9wTGlnaHRQaWNrZXI6TGlnaHRQaWNrZXJCYXNlO1xuXG5cdHByaXZhdGUgX3dyaXRlRGVwdGg6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX29uTGlnaHRzQ2hhbmdlRGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgb3V0cHV0IGFscGhhIHZhbHVlIHNob3VsZCByZW1haW4gdW5jaGFuZ2VkIGNvbXBhcmVkIHRvIHRoZSBtYXRlcmlhbCdzIG9yaWdpbmFsIGFscGhhLlxuXHQgKi9cblx0cHVibGljIGdldCBwcmVzZXJ2ZUFscGhhKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXNlcnZlQWxwaGE7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHByZXNlcnZlQWxwaGEodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9wcmVzZXJ2ZUFscGhhID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fcHJlc2VydmVBbHBoYSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHNoYWRvdyBjYXN0aW5nIGxpZ2h0cyBuZWVkIHRvIGJlIGluY2x1ZGVkLlxuXHQgKi9cblx0cHVibGljIGdldCBpbmNsdWRlQ2FzdGVycygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9pbmNsdWRlQ2FzdGVycztcblx0fVxuXG5cdHB1YmxpYyBzZXQgaW5jbHVkZUNhc3RlcnModmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9pbmNsdWRlQ2FzdGVycyA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2luY2x1ZGVDYXN0ZXJzID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc2NyZWVuIHByb2plY3Rpb24gc2hvdWxkIGJlIGNhbGN1bGF0ZWQgYnkgZm9yY2luZyBhIHNlcGFyYXRlIHNjZW5lIG1hdHJpeCBhbmRcblx0ICogdmlldy1wcm9qZWN0aW9uIG1hdHJpeC4gVGhpcyBpcyB1c2VkIHRvIHByZXZlbnQgcm91bmRpbmcgZXJyb3JzIHdoZW4gdXNpbmcgbXVsdGlwbGUgcGFzc2VzIHdpdGggZGlmZmVyZW50XG5cdCAqIHByb2plY3Rpb24gY29kZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgZm9yY2VTZXBhcmF0ZU1WUCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9mb3JjZVNlcGFyYXRlTVZQO1xuXHR9XG5cblx0cHVibGljIHNldCBmb3JjZVNlcGFyYXRlTVZQKHZhbHVlOmJvb2xlYW4pXG5cdHtcblx0XHRpZiAodGhpcy5fZm9yY2VTZXBhcmF0ZU1WUCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2ZvcmNlU2VwYXJhdGVNVlAgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzcygpO1xuXHR9XG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIG9mZnNldCBpbiB0aGUgbGlnaHQgcGlja2VyJ3MgZGlyZWN0aW9uYWwgbGlnaHQgdmVjdG9yIGZvciB3aGljaCB0byBzdGFydCBpbmNsdWRpbmcgbGlnaHRzLlxuXHQgKiBUaGlzIG5lZWRzIHRvIGJlIHNldCBiZWZvcmUgdGhlIGxpZ2h0IHBpY2tlciBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kaXJlY3Rpb25hbExpZ2h0c09mZnNldDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIG9mZnNldCBpbiB0aGUgbGlnaHQgcGlja2VyJ3MgcG9pbnQgbGlnaHQgdmVjdG9yIGZvciB3aGljaCB0byBzdGFydCBpbmNsdWRpbmcgbGlnaHRzLlxuXHQgKiBUaGlzIG5lZWRzIHRvIGJlIHNldCBiZWZvcmUgdGhlIGxpZ2h0IHBpY2tlciBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgcG9pbnRMaWdodHNPZmZzZXQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wb2ludExpZ2h0c09mZnNldDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgcG9pbnRMaWdodHNPZmZzZXQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fcG9pbnRMaWdodHNPZmZzZXQgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIG9mZnNldCBpbiB0aGUgbGlnaHQgcGlja2VyJ3MgbGlnaHQgcHJvYmVzIHZlY3RvciBmb3Igd2hpY2ggdG8gc3RhcnQgaW5jbHVkaW5nIGxpZ2h0cy5cblx0ICogVGhpcyBuZWVkcyB0byBiZSBzZXQgYmVmb3JlIHRoZSBsaWdodCBwaWNrZXIgaXMgYXNzaWduZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGxpZ2h0UHJvYmVzT2Zmc2V0KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbGlnaHRQcm9iZXNPZmZzZXQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGxpZ2h0UHJvYmVzT2Zmc2V0KHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2xpZ2h0UHJvYmVzT2Zmc2V0ID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgcGFzc01vZGUoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wYXNzTW9kZTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgcGFzc01vZGUodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fcGFzc01vZGUgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgTWF0ZXJpYWxQYXNzQmFzZSBvYmplY3QuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihwYXNzTW9kZTpudW1iZXIgPSAweDAzKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX3Bhc3NNb2RlID0gcGFzc01vZGU7XG5cblx0XHR0aGlzLl9vbkxpZ2h0c0NoYW5nZURlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLm9uTGlnaHRzQ2hhbmdlKGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYSBjb25jcmV0ZSBzaGFkZXIgb2JqZWN0IGZvciB0aGlzIHBhc3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUgdXNlZCBieSB0aGUgcmVuZGVyZXIuXG5cdCAqL1xuXHRwdWJsaWMgY3JlYXRlU2hhZGVyT2JqZWN0KHByb2ZpbGU6c3RyaW5nKTpTaGFkZXJPYmplY3RCYXNlXG5cdHtcblx0XHRyZXR1cm4gbmV3IFNoYWRlck9iamVjdEJhc2UocHJvZmlsZSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGUgd2hldGhlciB0aGlzIHBhc3Mgc2hvdWxkIHdyaXRlIHRvIHRoZSBkZXB0aCBidWZmZXIgb3Igbm90LiBJZ25vcmVkIHdoZW4gYmxlbmRpbmcgaXMgZW5hYmxlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgd3JpdGVEZXB0aCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl93cml0ZURlcHRoO1xuXHR9XG5cblx0cHVibGljIHNldCB3cml0ZURlcHRoKHZhbHVlOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl93cml0ZURlcHRoID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGRlcHRoIGNvbXBhcmUgbW9kZSB1c2VkIHRvIHJlbmRlciB0aGUgcmVuZGVyYWJsZXMgdXNpbmcgdGhpcyBtYXRlcmlhbC5cblx0ICpcblx0ICogQHNlZSBhd2F5LnN0YWdlZ2wuQ29udGV4dEdMQ29tcGFyZU1vZGVcblx0ICovXG5cdHB1YmxpYyBnZXQgZGVwdGhDb21wYXJlTW9kZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRlcHRoQ29tcGFyZU1vZGUodmFsdWU6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fZGVwdGhDb21wYXJlTW9kZSA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFucyB1cCBhbnkgcmVzb3VyY2VzIHVzZWQgYnkgdGhlIGN1cnJlbnQgb2JqZWN0LlxuXHQgKiBAcGFyYW0gZGVlcCBJbmRpY2F0ZXMgd2hldGhlciBvdGhlciByZXNvdXJjZXMgc2hvdWxkIGJlIGNsZWFuZWQgdXAsIHRoYXQgY291bGQgcG90ZW50aWFsbHkgYmUgc2hhcmVkIGFjcm9zcyBkaWZmZXJlbnQgaW5zdGFuY2VzLlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3BMaWdodFBpY2tlcilcblx0XHRcdHRoaXMuX3BMaWdodFBpY2tlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkNIQU5HRSwgdGhpcy5fb25MaWdodHNDaGFuZ2VEZWxlZ2F0ZSk7XG5cblx0XHR3aGlsZSAodGhpcy5fbWF0ZXJpYWxQYXNzRGF0YS5sZW5ndGgpXG5cdFx0XHR0aGlzLl9tYXRlcmlhbFBhc3NEYXRhWzBdLmRpc3Bvc2UoKTtcblxuXHRcdHRoaXMuX21hdGVyaWFsUGFzc0RhdGEgPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbmRlcnMgYW4gb2JqZWN0IHRvIHRoZSBjdXJyZW50IHJlbmRlciB0YXJnZXQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgX2lSZW5kZXIocGFzczpNYXRlcmlhbFBhc3NEYXRhLCByZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSwgdmlld1Byb2plY3Rpb246TWF0cml4M0QpXG5cdHtcblx0XHR0aGlzLnNldFJlbmRlclN0YXRlKHBhc3MsIHJlbmRlcmFibGUsIHN0YWdlLCBjYW1lcmEsIHZpZXdQcm9qZWN0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVuZGVyYWJsZVxuXHQgKiBAcGFyYW0gc3RhZ2Vcblx0ICogQHBhcmFtIGNhbWVyYVxuXHQgKi9cblx0cHVibGljIHNldFJlbmRlclN0YXRlKHBhc3M6TWF0ZXJpYWxQYXNzRGF0YSwgcmVuZGVyYWJsZTpSZW5kZXJhYmxlQmFzZSwgc3RhZ2U6U3RhZ2UsIGNhbWVyYTpDYW1lcmEsIHZpZXdQcm9qZWN0aW9uOk1hdHJpeDNEKVxuXHR7XG5cdFx0cGFzcy5zaGFkZXJPYmplY3Quc2V0UmVuZGVyU3RhdGUocmVuZGVyYWJsZSwgc3RhZ2UsIGNhbWVyYSwgdmlld1Byb2plY3Rpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBibGVuZCBtb2RlIHRvIHVzZSB3aGVuIGRyYXdpbmcgdGhpcyByZW5kZXJhYmxlLiBUaGUgZm9sbG93aW5nIGJsZW5kIG1vZGVzIGFyZSBzdXBwb3J0ZWQ6XG5cdCAqIDx1bD5cblx0ICogPGxpPkJsZW5kTW9kZS5OT1JNQUw6IE5vIGJsZW5kaW5nLCB1bmxlc3MgdGhlIG1hdGVyaWFsIGluaGVyZW50bHkgbmVlZHMgaXQ8L2xpPlxuXHQgKiA8bGk+QmxlbmRNb2RlLkxBWUVSOiBGb3JjZSBibGVuZGluZy4gVGhpcyB3aWxsIGRyYXcgdGhlIG9iamVjdCB0aGUgc2FtZSBhcyBOT1JNQUwsIGJ1dCB3aXRob3V0IHdyaXRpbmcgZGVwdGggd3JpdGVzLjwvbGk+XG5cdCAqIDxsaT5CbGVuZE1vZGUuTVVMVElQTFk8L2xpPlxuXHQgKiA8bGk+QmxlbmRNb2RlLkFERDwvbGk+XG5cdCAqIDxsaT5CbGVuZE1vZGUuQUxQSEE8L2xpPlxuXHQgKiA8L3VsPlxuXHQgKi9cblx0cHVibGljIHNldEJsZW5kTW9kZSh2YWx1ZTpzdHJpbmcpXG5cdHtcblx0XHRzd2l0Y2ggKHZhbHVlKSB7XG5cblx0XHRcdGNhc2UgQmxlbmRNb2RlLk5PUk1BTDpcblxuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvclNvdXJjZSA9IENvbnRleHRHTEJsZW5kRmFjdG9yLk9ORTtcblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEZXN0ID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuWkVSTztcblx0XHRcdFx0dGhpcy5fcEVuYWJsZUJsZW5kaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQmxlbmRNb2RlLkxBWUVSOlxuXG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yU291cmNlID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuU09VUkNFX0FMUEhBO1xuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRlc3QgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5PTkVfTUlOVVNfU09VUkNFX0FMUEhBO1xuXHRcdFx0XHR0aGlzLl9wRW5hYmxlQmxlbmRpbmcgPSB0cnVlO1xuXG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIEJsZW5kTW9kZS5NVUxUSVBMWTpcblxuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvclNvdXJjZSA9IENvbnRleHRHTEJsZW5kRmFjdG9yLlpFUk87XG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGVzdCA9IENvbnRleHRHTEJsZW5kRmFjdG9yLlNPVVJDRV9DT0xPUjtcblx0XHRcdFx0dGhpcy5fcEVuYWJsZUJsZW5kaW5nID0gdHJ1ZTtcblxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBCbGVuZE1vZGUuQUREOlxuXG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yU291cmNlID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuU09VUkNFX0FMUEhBO1xuXHRcdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRlc3QgPSBDb250ZXh0R0xCbGVuZEZhY3Rvci5PTkU7XG5cdFx0XHRcdHRoaXMuX3BFbmFibGVCbGVuZGluZyA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQmxlbmRNb2RlLkFMUEhBOlxuXG5cdFx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yU291cmNlID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuWkVSTztcblx0XHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEZXN0ID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuU09VUkNFX0FMUEhBO1xuXHRcdFx0XHR0aGlzLl9wRW5hYmxlQmxlbmRpbmcgPSB0cnVlO1xuXG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXG5cdFx0XHRcdHRocm93IG5ldyBBcmd1bWVudEVycm9yKFwiVW5zdXBwb3J0ZWQgYmxlbmQgbW9kZSFcIik7XG5cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgcmVuZGVyIHN0YXRlIGZvciB0aGUgcGFzcyB0aGF0IGlzIGluZGVwZW5kZW50IG9mIHRoZSByZW5kZXJlZCBvYmplY3QuIFRoaXMgbmVlZHMgdG8gYmUgY2FsbGVkIGJlZm9yZVxuXHQgKiBjYWxsaW5nIHJlbmRlclBhc3MuIEJlZm9yZSBhY3RpdmF0aW5nIGEgcGFzcywgdGhlIHByZXZpb3VzbHkgdXNlZCBwYXNzIG5lZWRzIHRvIGJlIGRlYWN0aXZhdGVkLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB3aGljaCBpcyBjdXJyZW50bHkgdXNlZCBmb3IgcmVuZGVyaW5nLlxuXHQgKiBAcGFyYW0gY2FtZXJhIFRoZSBjYW1lcmEgZnJvbSB3aGljaCB0aGUgc2NlbmUgaXMgdmlld2VkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIF9pQWN0aXZhdGUocGFzczpNYXRlcmlhbFBhc3NEYXRhLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSlcblx0e1xuXHRcdHZhciBjb250ZXh0OklDb250ZXh0U3RhZ2VHTCA9IDxJQ29udGV4dFN0YWdlR0w+IHN0YWdlLmNvbnRleHQ7XG5cblx0XHRjb250ZXh0LnNldERlcHRoVGVzdCgoIHRoaXMuX3dyaXRlRGVwdGggJiYgIXRoaXMuX3BFbmFibGVCbGVuZGluZyApLCB0aGlzLl9kZXB0aENvbXBhcmVNb2RlKTtcblxuXHRcdGlmICh0aGlzLl9wRW5hYmxlQmxlbmRpbmcpXG5cdFx0XHRjb250ZXh0LnNldEJsZW5kRmFjdG9ycyh0aGlzLl9ibGVuZEZhY3RvclNvdXJjZSwgdGhpcy5fYmxlbmRGYWN0b3JEZXN0KTtcblxuXHRcdGNvbnRleHQuYWN0aXZhdGVNYXRlcmlhbFBhc3MocGFzcywgc3RhZ2UsIGNhbWVyYSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXJzIHRoZSByZW5kZXIgc3RhdGUgZm9yIHRoZSBwYXNzLiBUaGlzIG5lZWRzIHRvIGJlIGNhbGxlZCBiZWZvcmUgYWN0aXZhdGluZyBhbm90aGVyIHBhc3MuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2UgdXNlZCBmb3IgcmVuZGVyaW5nXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgX2lEZWFjdGl2YXRlKHBhc3M6TWF0ZXJpYWxQYXNzRGF0YSwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHQoPElDb250ZXh0U3RhZ2VHTD4gc3RhZ2UuY29udGV4dCkuZGVhY3RpdmF0ZU1hdGVyaWFsUGFzcyhwYXNzLCBzdGFnZSk7XG5cblx0XHQoPElDb250ZXh0U3RhZ2VHTD4gc3RhZ2UuY29udGV4dCkuc2V0RGVwdGhUZXN0KHRydWUsIENvbnRleHRHTENvbXBhcmVNb2RlLkxFU1NfRVFVQUwpOyAvLyBUT0RPIDogaW1lcGxlbWVudFxuXHR9XG5cblx0LyoqXG5cdCAqIE1hcmtzIHRoZSBzaGFkZXIgcHJvZ3JhbSBhcyBpbnZhbGlkLCBzbyBpdCB3aWxsIGJlIHJlY29tcGlsZWQgYmVmb3JlIHRoZSBuZXh0IHJlbmRlci5cblx0ICpcblx0ICogQHBhcmFtIHVwZGF0ZU1hdGVyaWFsIEluZGljYXRlcyB3aGV0aGVyIHRoZSBpbnZhbGlkYXRpb24gc2hvdWxkIGJlIHBlcmZvcm1lZCBvbiB0aGUgZW50aXJlIG1hdGVyaWFsLiBTaG91bGQgYWx3YXlzIHBhc3MgXCJ0cnVlXCIgdW5sZXNzIGl0J3MgY2FsbGVkIGZyb20gdGhlIG1hdGVyaWFsIGl0c2VsZi5cblx0ICovXG5cdHB1YmxpYyBfcEludmFsaWRhdGVQYXNzKClcblx0e1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxQYXNzRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHR0aGlzLl9tYXRlcmlhbFBhc3NEYXRhW2ldLmludmFsaWRhdGUoKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuQ0hBTkdFKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGxpZ2h0IHBpY2tlciB1c2VkIGJ5IHRoZSBtYXRlcmlhbCB0byBwcm92aWRlIGxpZ2h0cyB0byB0aGUgbWF0ZXJpYWwgaWYgaXQgc3VwcG9ydHMgbGlnaHRpbmcuXG5cdCAqXG5cdCAqIEBzZWUgYXdheS5tYXRlcmlhbHMuTGlnaHRQaWNrZXJCYXNlXG5cdCAqIEBzZWUgYXdheS5tYXRlcmlhbHMuU3RhdGljTGlnaHRQaWNrZXJcblx0ICovXG5cdHB1YmxpYyBnZXQgbGlnaHRQaWNrZXIoKTpMaWdodFBpY2tlckJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTGlnaHRQaWNrZXI7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGxpZ2h0UGlja2VyKHZhbHVlOkxpZ2h0UGlja2VyQmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9wTGlnaHRQaWNrZXIpXG5cdFx0XHR0aGlzLl9wTGlnaHRQaWNrZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DSEFOR0UsIHRoaXMuX29uTGlnaHRzQ2hhbmdlRGVsZWdhdGUpO1xuXG5cdFx0dGhpcy5fcExpZ2h0UGlja2VyID0gdmFsdWU7XG5cblx0XHRpZiAodGhpcy5fcExpZ2h0UGlja2VyKVxuXHRcdFx0dGhpcy5fcExpZ2h0UGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ0hBTkdFLCB0aGlzLl9vbkxpZ2h0c0NoYW5nZURlbGVnYXRlKTtcblxuXHRcdHRoaXMucFVwZGF0ZUxpZ2h0cygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBsaWdodCBwaWNrZXIncyBjb25maWd1cmF0aW9uIGNoYW5nZXMuXG5cdCAqL1xuXHRwcml2YXRlIG9uTGlnaHRzQ2hhbmdlKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0dGhpcy5wVXBkYXRlTGlnaHRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW1wbGVtZW50ZWQgYnkgc3ViY2xhc3NlcyBpZiB0aGUgcGFzcyB1c2VzIGxpZ2h0cyB0byB1cGRhdGUgdGhlIHNoYWRlci5cblx0ICovXG5cdHB1YmxpYyBwVXBkYXRlTGlnaHRzKClcblx0e1xuXHRcdHZhciBudW1EaXJlY3Rpb25hbExpZ2h0c09sZDpudW1iZXIgPSB0aGlzLl9wTnVtRGlyZWN0aW9uYWxMaWdodHM7XG5cdFx0dmFyIG51bVBvaW50TGlnaHRzT2xkOm51bWJlciA9IHRoaXMuX3BOdW1Qb2ludExpZ2h0cztcblx0XHR2YXIgbnVtTGlnaHRQcm9iZXNPbGQ6bnVtYmVyID0gdGhpcy5fcE51bUxpZ2h0UHJvYmVzO1xuXG5cdFx0aWYgKHRoaXMuX3BMaWdodFBpY2tlciAmJiAodGhpcy5fcGFzc01vZGUgJiBNYXRlcmlhbFBhc3NNb2RlLkxJR0hUSU5HKSkge1xuXHRcdFx0dGhpcy5fcE51bURpcmVjdGlvbmFsTGlnaHRzID0gdGhpcy5jYWxjdWxhdGVOdW1EaXJlY3Rpb25hbExpZ2h0cyh0aGlzLl9wTGlnaHRQaWNrZXIubnVtRGlyZWN0aW9uYWxMaWdodHMpO1xuXHRcdFx0dGhpcy5fcE51bVBvaW50TGlnaHRzID0gdGhpcy5jYWxjdWxhdGVOdW1Qb2ludExpZ2h0cyh0aGlzLl9wTGlnaHRQaWNrZXIubnVtUG9pbnRMaWdodHMpO1xuXHRcdFx0dGhpcy5fcE51bUxpZ2h0UHJvYmVzID0gdGhpcy5jYWxjdWxhdGVOdW1Qcm9iZXModGhpcy5fcExpZ2h0UGlja2VyLm51bUxpZ2h0UHJvYmVzKTtcblxuXHRcdFx0aWYgKHRoaXMuX2luY2x1ZGVDYXN0ZXJzKSB7XG5cdFx0XHRcdHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cyArPSB0aGlzLl9wTGlnaHRQaWNrZXIubnVtQ2FzdGluZ0RpcmVjdGlvbmFsTGlnaHRzO1xuXHRcdFx0XHR0aGlzLl9wTnVtUG9pbnRMaWdodHMgKz0gdGhpcy5fcExpZ2h0UGlja2VyLm51bUNhc3RpbmdQb2ludExpZ2h0cztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9wTnVtRGlyZWN0aW9uYWxMaWdodHMgPSAwO1xuXHRcdFx0dGhpcy5fcE51bVBvaW50TGlnaHRzID0gMDtcblx0XHRcdHRoaXMuX3BOdW1MaWdodFByb2JlcyA9IDA7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcE51bUxpZ2h0cyA9IHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cyArIHRoaXMuX3BOdW1Qb2ludExpZ2h0cztcblxuXHRcdGlmIChudW1EaXJlY3Rpb25hbExpZ2h0c09sZCAhPSB0aGlzLl9wTnVtRGlyZWN0aW9uYWxMaWdodHMgfHwgbnVtUG9pbnRMaWdodHNPbGQgIT0gdGhpcy5fcE51bVBvaW50TGlnaHRzIHx8IG51bUxpZ2h0UHJvYmVzT2xkICE9IHRoaXMuX3BOdW1MaWdodFByb2Jlcylcblx0XHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzcygpO1xuXHR9XG5cblx0cHVibGljIF9pSW5jbHVkZURlcGVuZGVuY2llcyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9mb3JjZVNlcGFyYXRlTVZQKVxuXHRcdFx0c2hhZGVyT2JqZWN0Lmdsb2JhbFBvc0RlcGVuZGVuY2llcysrO1xuXG5cdFx0c2hhZGVyT2JqZWN0Lm91dHB1dHNOb3JtYWxzID0gdGhpcy5fcE91dHB1dHNOb3JtYWxzKHNoYWRlck9iamVjdCk7XG5cdFx0c2hhZGVyT2JqZWN0Lm91dHB1dHNUYW5nZW50Tm9ybWFscyA9IHNoYWRlck9iamVjdC5vdXRwdXRzTm9ybWFscyAmJiB0aGlzLl9wT3V0cHV0c1RhbmdlbnROb3JtYWxzKHNoYWRlck9iamVjdCk7XG5cdFx0c2hhZGVyT2JqZWN0LnVzZXNUYW5nZW50U3BhY2UgPSBzaGFkZXJPYmplY3Qub3V0cHV0c1RhbmdlbnROb3JtYWxzICYmIHRoaXMuX3BVc2VzVGFuZ2VudFNwYWNlKHNoYWRlck9iamVjdCk7XG5cblx0XHRpZiAoIXNoYWRlck9iamVjdC51c2VzVGFuZ2VudFNwYWNlKVxuXHRcdFx0c2hhZGVyT2JqZWN0LmFkZFdvcmxkU3BhY2VEZXBlbmRlbmNpZXMoQm9vbGVhbih0aGlzLl9wYXNzTW9kZSAmIE1hdGVyaWFsUGFzc01vZGUuRUZGRUNUUykpO1xuXHR9XG5cblxuXHRwdWJsaWMgX2lJbml0Q29uc3RhbnREYXRhKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKVxuXHR7XG5cblx0fVxuXG5cdHB1YmxpYyBfaUdldFByZUxpZ2h0aW5nVmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0cHVibGljIF9pR2V0UHJlTGlnaHRpbmdGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFZlcnRleENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdHB1YmxpYyBfaUdldEZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0cHVibGljIF9pR2V0Tm9ybWFsVmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0cHVibGljIF9pR2V0Tm9ybWFsRnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiBwb2ludCBsaWdodHMgdGhhdCBuZWVkIHRvIGJlIHN1cHBvcnRlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgaU51bVBvaW50TGlnaHRzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcE51bVBvaW50TGlnaHRzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgZGlyZWN0aW9uYWwgbGlnaHRzIHRoYXQgbmVlZCB0byBiZSBzdXBwb3J0ZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGlOdW1EaXJlY3Rpb25hbExpZ2h0cygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BOdW1EaXJlY3Rpb25hbExpZ2h0cztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIGxpZ2h0IHByb2JlcyB0aGF0IG5lZWQgdG8gYmUgc3VwcG9ydGVkLlxuXHQgKi9cblx0cHVibGljIGdldCBpTnVtTGlnaHRQcm9iZXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTnVtTGlnaHRQcm9iZXM7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IG5vcm1hbHMgYXJlIGNhbGN1bGF0ZWQgYXQgYWxsLlxuXHQgKi9cblx0cHVibGljIF9wT3V0cHV0c05vcm1hbHMoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgbm9ybWFscyBhcmUgY2FsY3VsYXRlZCBpbiB0YW5nZW50IHNwYWNlLlxuXHQgKi9cblx0cHVibGljIF9wT3V0cHV0c1RhbmdlbnROb3JtYWxzKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IG5vcm1hbHMgYXJlIGFsbG93ZWQgaW4gdGFuZ2VudCBzcGFjZS4gVGhpcyBpcyBvbmx5IHRoZSBjYXNlIGlmIG5vIG9iamVjdC1zcGFjZVxuXHQgKiBkZXBlbmRlbmNpZXMgZXhpc3QuXG5cdCAqL1xuXHRwdWJsaWMgX3BVc2VzVGFuZ2VudFNwYWNlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgYW1vdW50IG9mIGRpcmVjdGlvbmFsIGxpZ2h0cyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydC5cblx0ICogQHBhcmFtIG51bURpcmVjdGlvbmFsTGlnaHRzIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBkaXJlY3Rpb25hbCBsaWdodHMgdG8gc3VwcG9ydC5cblx0ICogQHJldHVybiBUaGUgYW1vdW50IG9mIGRpcmVjdGlvbmFsIGxpZ2h0cyB0aGlzIG1hdGVyaWFsIHdpbGwgc3VwcG9ydCwgYm91bmRlZCBieSB0aGUgYW1vdW50IG5lY2Vzc2FyeS5cblx0ICovXG5cdHByaXZhdGUgY2FsY3VsYXRlTnVtRGlyZWN0aW9uYWxMaWdodHMobnVtRGlyZWN0aW9uYWxMaWdodHM6bnVtYmVyKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiBNYXRoLm1pbihudW1EaXJlY3Rpb25hbExpZ2h0cyAtIHRoaXMuX2RpcmVjdGlvbmFsTGlnaHRzT2Zmc2V0LCB0aGlzLl9tYXhMaWdodHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFtb3VudCBvZiBwb2ludCBsaWdodHMgdGhpcyBtYXRlcmlhbCB3aWxsIHN1cHBvcnQuXG5cdCAqIEBwYXJhbSBudW1EaXJlY3Rpb25hbExpZ2h0cyBUaGUgbWF4aW11bSBhbW91bnQgb2YgcG9pbnQgbGlnaHRzIHRvIHN1cHBvcnQuXG5cdCAqIEByZXR1cm4gVGhlIGFtb3VudCBvZiBwb2ludCBsaWdodHMgdGhpcyBtYXRlcmlhbCB3aWxsIHN1cHBvcnQsIGJvdW5kZWQgYnkgdGhlIGFtb3VudCBuZWNlc3NhcnkuXG5cdCAqL1xuXHRwcml2YXRlIGNhbGN1bGF0ZU51bVBvaW50TGlnaHRzKG51bVBvaW50TGlnaHRzOm51bWJlcik6bnVtYmVyXG5cdHtcblx0XHR2YXIgbnVtRnJlZTpudW1iZXIgPSB0aGlzLl9tYXhMaWdodHMgLSB0aGlzLl9wTnVtRGlyZWN0aW9uYWxMaWdodHM7XG5cdFx0cmV0dXJuIE1hdGgubWluKG51bVBvaW50TGlnaHRzIC0gdGhpcy5fcG9pbnRMaWdodHNPZmZzZXQsIG51bUZyZWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGFtb3VudCBvZiBsaWdodCBwcm9iZXMgdGhpcyBtYXRlcmlhbCB3aWxsIHN1cHBvcnQuXG5cdCAqIEBwYXJhbSBudW1EaXJlY3Rpb25hbExpZ2h0cyBUaGUgbWF4aW11bSBhbW91bnQgb2YgbGlnaHQgcHJvYmVzIHRvIHN1cHBvcnQuXG5cdCAqIEByZXR1cm4gVGhlIGFtb3VudCBvZiBsaWdodCBwcm9iZXMgdGhpcyBtYXRlcmlhbCB3aWxsIHN1cHBvcnQsIGJvdW5kZWQgYnkgdGhlIGFtb3VudCBuZWNlc3NhcnkuXG5cdCAqL1xuXHRwcml2YXRlIGNhbGN1bGF0ZU51bVByb2JlcyhudW1MaWdodFByb2JlczpudW1iZXIpOm51bWJlclxuXHR7XG5cdFx0dmFyIG51bUNoYW5uZWxzOm51bWJlciA9IDA7XG5cdFx0Ly9cdFx0XHRpZiAoKHRoaXMuX3BTcGVjdWxhckxpZ2h0U291cmNlcyAmIExpZ2h0U291cmNlcy5QUk9CRVMpICE9IDApXG5cdFx0Ly9cdFx0XHRcdCsrbnVtQ2hhbm5lbHM7XG5cdFx0Ly9cblx0XHQvL1x0XHRcdGlmICgodGhpcy5fcERpZmZ1c2VMaWdodFNvdXJjZXMgJiBMaWdodFNvdXJjZXMuUFJPQkVTKSAhPSAwKVxuXHRcdC8vXHRcdFx0XHQrK251bUNoYW5uZWxzO1xuXG5cdFx0Ly8gNCBjaGFubmVscyBhdmFpbGFibGVcblx0XHRyZXR1cm4gTWF0aC5taW4obnVtTGlnaHRQcm9iZXMgLSB0aGlzLl9saWdodFByb2Jlc09mZnNldCwgKDQvbnVtQ2hhbm5lbHMpIHwgMCk7XG5cdH1cblxuXHRwdWJsaWMgX2lBZGRNYXRlcmlhbFBhc3NEYXRhKG1hdGVyaWFsUGFzc0RhdGE6TWF0ZXJpYWxQYXNzRGF0YSk6TWF0ZXJpYWxQYXNzRGF0YVxuXHR7XG5cdFx0dGhpcy5fbWF0ZXJpYWxQYXNzRGF0YS5wdXNoKG1hdGVyaWFsUGFzc0RhdGEpO1xuXG5cdFx0cmV0dXJuIG1hdGVyaWFsUGFzc0RhdGE7XG5cdH1cblxuXHRwdWJsaWMgX2lSZW1vdmVNYXRlcmlhbFBhc3NEYXRhKG1hdGVyaWFsUGFzc0RhdGE6TWF0ZXJpYWxQYXNzRGF0YSk6TWF0ZXJpYWxQYXNzRGF0YVxuXHR7XG5cdFx0dGhpcy5fbWF0ZXJpYWxQYXNzRGF0YS5zcGxpY2UodGhpcy5fbWF0ZXJpYWxQYXNzRGF0YS5pbmRleE9mKG1hdGVyaWFsUGFzc0RhdGEpLCAxKTtcblxuXHRcdHJldHVybiBtYXRlcmlhbFBhc3NEYXRhO1xuXHR9XG59XG5cbmV4cG9ydCA9IE1hdGVyaWFsUGFzc0Jhc2U7Il19