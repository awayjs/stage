var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
var Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
var BlendMode = require("awayjs-display/lib/base/BlendMode");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var ContextGLCompareMode = require("awayjs-stagegl/lib/core/stagegl/ContextGLCompareMode");
var AmbientBasicMethod = require("awayjs-stagegl/lib/materials/methods/AmbientBasicMethod");
var DiffuseBasicMethod = require("awayjs-stagegl/lib/materials/methods/DiffuseBasicMethod");
var NormalBasicMethod = require("awayjs-stagegl/lib/materials/methods/NormalBasicMethod");
var SpecularBasicMethod = require("awayjs-stagegl/lib/materials/methods/SpecularBasicMethod");
var MaterialPassMode = require("awayjs-stagegl/lib/materials/passes/MaterialPassMode");
var TriangleMethodPass = require("awayjs-stagegl/lib/materials/passes/TriangleMethodPass");
var TriangleMaterialBase = require("awayjs-stagegl/lib/materials/TriangleMaterialBase");
var TriangleMaterialMode = require("awayjs-stagegl/lib/materials/TriangleMaterialMode");
/**
 * TriangleMethodMaterial forms an abstract base class for the default shaded materials provided by Stage,
 * using material methods to define their appearance.
 */
var TriangleMethodMaterial = (function (_super) {
    __extends(TriangleMethodMaterial, _super);
    function TriangleMethodMaterial(textureColor, smoothAlpha, repeat, mipmap) {
        if (textureColor === void 0) { textureColor = null; }
        if (smoothAlpha === void 0) { smoothAlpha = null; }
        if (repeat === void 0) { repeat = false; }
        if (mipmap === void 0) { mipmap = false; }
        _super.call(this);
        this._alphaBlending = false;
        this._alpha = 1;
        this._ambientMethod = new AmbientBasicMethod();
        this._diffuseMethod = new DiffuseBasicMethod();
        this._normalMethod = new NormalBasicMethod();
        this._specularMethod = new SpecularBasicMethod();
        this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
        this._materialMode = TriangleMaterialMode.SINGLE_PASS;
        if (textureColor instanceof Texture2DBase) {
            this.texture = textureColor;
            this.smooth = (smoothAlpha == null) ? true : false;
            this.repeat = repeat;
            this.mipmap = mipmap;
        }
        else {
            this.color = (textureColor == null) ? 0xFFFFFF : Number(textureColor);
            this.alpha = (smoothAlpha == null) ? 1 : Number(smoothAlpha);
        }
    }
    Object.defineProperty(TriangleMethodMaterial.prototype, "materialMode", {
        get: function () {
            return this._materialMode;
        },
        set: function (value) {
            if (this._materialMode == value)
                return;
            this._materialMode = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "depthCompareMode", {
        /**
         * The depth compare mode used to render the renderables using this material.
         *
         * @see away.stagegl.ContextGLCompareMode
         */
        get: function () {
            return this._depthCompareMode;
        },
        set: function (value) {
            if (this._depthCompareMode == value)
                return;
            this._depthCompareMode = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "alpha", {
        /**
         * The alpha of the surface.
         */
        get: function () {
            return this._alpha;
        },
        set: function (value) {
            if (value > 1)
                value = 1;
            else if (value < 0)
                value = 0;
            if (this._alpha == value)
                return;
            this._alpha = value;
            if (this._colorTransform == null)
                this._colorTransform = new ColorTransform();
            this._colorTransform.alphaMultiplier = value;
            this._pInvalidatePasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "colorTransform", {
        /**
         * The ColorTransform object to transform the colour of the material with. Defaults to null.
         */
        get: function () {
            return this._screenPass.colorTransform;
        },
        set: function (value) {
            this._screenPass.colorTransform = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "diffuseTexture", {
        /**
         * The texture object to use for the ambient colour.
         */
        get: function () {
            return this._diffuseMethod.texture;
        },
        set: function (value) {
            this._diffuseMethod.texture = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "ambientMethod", {
        /**
         * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
         */
        get: function () {
            return this._ambientMethod;
        },
        set: function (value) {
            if (this._ambientMethod == value)
                return;
            if (value && this._ambientMethod)
                value.copyFrom(this._ambientMethod);
            this._ambientMethod = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "shadowMethod", {
        /**
         * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
         */
        get: function () {
            return this._shadowMethod;
        },
        set: function (value) {
            if (this._shadowMethod == value)
                return;
            if (value && this._shadowMethod)
                value.copyFrom(this._shadowMethod);
            this._shadowMethod = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "diffuseMethod", {
        /**
         * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
         */
        get: function () {
            return this._diffuseMethod;
        },
        set: function (value) {
            if (this._diffuseMethod == value)
                return;
            if (value && this._diffuseMethod)
                value.copyFrom(this._diffuseMethod);
            this._diffuseMethod = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "specularMethod", {
        /**
         * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
         */
        get: function () {
            return this._specularMethod;
        },
        set: function (value) {
            if (this._specularMethod == value)
                return;
            if (value && this._specularMethod)
                value.copyFrom(this._specularMethod);
            this._specularMethod = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "normalMethod", {
        /**
         * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
         */
        get: function () {
            return this._normalMethod;
        },
        set: function (value) {
            if (this._normalMethod == value)
                return;
            if (value && this._normalMethod)
                value.copyFrom(this._normalMethod);
            this._normalMethod = value;
            this._pInvalidateScreenPasses();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
     * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
     * methods added prior.
     */
    TriangleMethodMaterial.prototype.addEffectMethod = function (method) {
        if (this._screenPass == null)
            this._screenPass = new TriangleMethodPass();
        this._screenPass.addEffectMethod(method);
        this._pInvalidateScreenPasses();
    };
    Object.defineProperty(TriangleMethodMaterial.prototype, "numEffectMethods", {
        /**
         * The number of "effect" methods added to the material.
         */
        get: function () {
            return this._screenPass ? this._screenPass.numEffectMethods : 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Queries whether a given effect method was added to the material.
     *
     * @param method The method to be queried.
     * @return true if the method was added to the material, false otherwise.
     */
    TriangleMethodMaterial.prototype.hasEffectMethod = function (method) {
        return this._screenPass ? this._screenPass.hasEffectMethod(method) : false;
    };
    /**
     * Returns the method added at the given index.
     * @param index The index of the method to retrieve.
     * @return The method at the given index.
     */
    TriangleMethodMaterial.prototype.getEffectMethodAt = function (index) {
        if (this._screenPass == null)
            return null;
        return this._screenPass.getEffectMethodAt(index);
    };
    /**
     * Adds an effect method at the specified index amongst the methods already added to the material. Effect
     * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
     * etc. The method will be applied to the result of the methods with a lower index.
     */
    TriangleMethodMaterial.prototype.addEffectMethodAt = function (method, index) {
        if (this._screenPass == null)
            this._screenPass = new TriangleMethodPass();
        this._screenPass.addEffectMethodAt(method, index);
        this._pInvalidatePasses();
    };
    /**
     * Removes an effect method from the material.
     * @param method The method to be removed.
     */
    TriangleMethodMaterial.prototype.removeEffectMethod = function (method) {
        if (this._screenPass == null)
            return;
        this._screenPass.removeEffectMethod(method);
        // reconsider
        if (this._screenPass.numEffectMethods == 0)
            this._pInvalidatePasses();
    };
    Object.defineProperty(TriangleMethodMaterial.prototype, "normalMap", {
        /**
         * The normal map to modulate the direction of the surface for each texel. The default normal method expects
         * tangent-space normal maps, but others could expect object-space maps.
         */
        get: function () {
            return this._normalMethod.normalMap;
        },
        set: function (value) {
            this._normalMethod.normalMap = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "specularMap", {
        /**
         * A specular map that defines the strength of specular reflections for each texel in the red channel,
         * and the gloss factor in the green channel. You can use SpecularBitmapTexture if you want to easily set
         * specular and gloss maps from grayscale images, but correctly authored images are preferred.
         */
        get: function () {
            return this._specularMethod.texture;
        },
        set: function (value) {
            this._specularMethod.texture = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "gloss", {
        /**
         * The glossiness of the material (sharpness of the specular highlight).
         */
        get: function () {
            return this._specularMethod.gloss;
        },
        set: function (value) {
            this._specularMethod.gloss = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "ambient", {
        /**
         * The strength of the ambient reflection.
         */
        get: function () {
            return this._ambientMethod.ambient;
        },
        set: function (value) {
            this._ambientMethod.ambient = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "specular", {
        /**
         * The overall strength of the specular reflection.
         */
        get: function () {
            return this._specularMethod.specular;
        },
        set: function (value) {
            this._specularMethod.specular = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "ambientColor", {
        /**
         * The colour of the ambient reflection.
         */
        get: function () {
            return this._diffuseMethod.ambientColor;
        },
        set: function (value) {
            this._diffuseMethod.ambientColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "diffuseColor", {
        /**
         * The colour of the diffuse reflection.
         */
        get: function () {
            return this._diffuseMethod.diffuseColor;
        },
        set: function (value) {
            this._diffuseMethod.diffuseColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "specularColor", {
        /**
         * The colour of the specular reflection.
         */
        get: function () {
            return this._specularMethod.specularColor;
        },
        set: function (value) {
            this._specularMethod.specularColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "alphaBlending", {
        /**
         * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
         * example when using textures of foliage, consider using alphaThreshold instead.
         */
        get: function () {
            return this._alphaBlending;
        },
        set: function (value) {
            if (this._alphaBlending == value)
                return;
            this._alphaBlending = value;
            this._pInvalidatePasses();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritDoc
     */
    TriangleMethodMaterial.prototype._iUpdateMaterial = function () {
        if (this._pScreenPassesInvalid) {
            //Updates screen passes when they were found to be invalid.
            this._pScreenPassesInvalid = false;
            this.initPasses();
            this.setBlendAndCompareModes();
            this._pClearScreenPasses();
            if (this._materialMode == TriangleMaterialMode.MULTI_PASS) {
                if (this._casterLightPass)
                    this._pAddScreenPass(this._casterLightPass);
                if (this._nonCasterLightPasses)
                    for (var i = 0; i < this._nonCasterLightPasses.length; ++i)
                        this._pAddScreenPass(this._nonCasterLightPasses[i]);
            }
            if (this._screenPass)
                this._pAddScreenPass(this._screenPass);
        }
    };
    /**
     * Initializes all the passes and their dependent passes.
     */
    TriangleMethodMaterial.prototype.initPasses = function () {
        // let the effects pass handle everything if there are no lights, when there are effect methods applied
        // after shading, or when the material mode is single pass.
        if (this.numLights == 0 || this.numEffectMethods > 0 || this._materialMode == TriangleMaterialMode.SINGLE_PASS)
            this.initEffectPass();
        else if (this._screenPass)
            this.removeEffectPass();
        // only use a caster light pass if shadows need to be rendered
        if (this._shadowMethod && this._materialMode == TriangleMaterialMode.MULTI_PASS)
            this.initCasterLightPass();
        else if (this._casterLightPass)
            this.removeCasterLightPass();
        // only use non caster light passes if there are lights that don't cast
        if (this.numNonCasters > 0 && this._materialMode == TriangleMaterialMode.MULTI_PASS)
            this.initNonCasterLightPasses();
        else if (this._nonCasterLightPasses)
            this.removeNonCasterLightPasses();
    };
    /**
     * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
     */
    TriangleMethodMaterial.prototype.setBlendAndCompareModes = function () {
        var forceSeparateMVP = Boolean(this._casterLightPass || this._screenPass);
        // caster light pass is always first if it exists, hence it uses normal blending
        if (this._casterLightPass) {
            this._casterLightPass.forceSeparateMVP = forceSeparateMVP;
            this._casterLightPass.setBlendMode(BlendMode.NORMAL);
            this._casterLightPass.depthCompareMode = this._depthCompareMode;
        }
        if (this._nonCasterLightPasses) {
            var firstAdditiveIndex = 0;
            // if there's no caster light pass, the first non caster light pass will be the first
            // and should use normal blending
            if (!this._casterLightPass) {
                this._nonCasterLightPasses[0].forceSeparateMVP = forceSeparateMVP;
                this._nonCasterLightPasses[0].setBlendMode(BlendMode.NORMAL);
                this._nonCasterLightPasses[0].depthCompareMode = this._depthCompareMode;
                firstAdditiveIndex = 1;
            }
            for (var i = firstAdditiveIndex; i < this._nonCasterLightPasses.length; ++i) {
                this._nonCasterLightPasses[i].forceSeparateMVP = forceSeparateMVP;
                this._nonCasterLightPasses[i].setBlendMode(BlendMode.ADD);
                this._nonCasterLightPasses[i].depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
            }
        }
        if (this._casterLightPass || this._nonCasterLightPasses) {
            //cannot be blended by blendmode property if multipass enabled
            this._pRequiresBlending = false;
            // there are light passes, so this should be blended in
            if (this._screenPass) {
                this._screenPass.passMode = MaterialPassMode.EFFECTS;
                this._screenPass.depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
                this._screenPass.setBlendMode(BlendMode.LAYER);
                this._screenPass.forceSeparateMVP = forceSeparateMVP;
            }
        }
        else if (this._screenPass) {
            this._pRequiresBlending = (this._pBlendMode != BlendMode.NORMAL || this._alphaBlending || (this._colorTransform && this._colorTransform.alphaMultiplier < 1));
            // effects pass is the only pass, so it should just blend normally
            this._screenPass.passMode = MaterialPassMode.SUPER_SHADER;
            this._screenPass.depthCompareMode = this._depthCompareMode;
            this._screenPass.preserveAlpha = this._pRequiresBlending;
            this._screenPass.colorTransform = this._colorTransform;
            this._screenPass.setBlendMode((this._pBlendMode == BlendMode.NORMAL && this._pRequiresBlending) ? BlendMode.LAYER : this._pBlendMode);
            this._screenPass.forceSeparateMVP = false;
        }
    };
    TriangleMethodMaterial.prototype.initCasterLightPass = function () {
        if (this._casterLightPass == null)
            this._casterLightPass = new TriangleMethodPass(MaterialPassMode.LIGHTING);
        this._casterLightPass.lightPicker = new StaticLightPicker([this._shadowMethod.castingLight]);
        this._casterLightPass.shadowMethod = this._shadowMethod;
        this._casterLightPass.diffuseMethod = this._diffuseMethod;
        this._casterLightPass.ambientMethod = this._ambientMethod;
        this._casterLightPass.normalMethod = this._normalMethod;
        this._casterLightPass.specularMethod = this._specularMethod;
    };
    TriangleMethodMaterial.prototype.removeCasterLightPass = function () {
        this._casterLightPass.dispose();
        this._pRemoveScreenPass(this._casterLightPass);
        this._casterLightPass = null;
    };
    TriangleMethodMaterial.prototype.initNonCasterLightPasses = function () {
        this.removeNonCasterLightPasses();
        var pass;
        var numDirLights = this._pLightPicker.numDirectionalLights;
        var numPointLights = this._pLightPicker.numPointLights;
        var numLightProbes = this._pLightPicker.numLightProbes;
        var dirLightOffset = 0;
        var pointLightOffset = 0;
        var probeOffset = 0;
        if (!this._casterLightPass) {
            numDirLights += this._pLightPicker.numCastingDirectionalLights;
            numPointLights += this._pLightPicker.numCastingPointLights;
        }
        this._nonCasterLightPasses = new Array();
        while (dirLightOffset < numDirLights || pointLightOffset < numPointLights || probeOffset < numLightProbes) {
            pass = new TriangleMethodPass(MaterialPassMode.LIGHTING);
            pass.includeCasters = this._shadowMethod == null;
            pass.directionalLightsOffset = dirLightOffset;
            pass.pointLightsOffset = pointLightOffset;
            pass.lightProbesOffset = probeOffset;
            pass.lightPicker = this._pLightPicker;
            pass.diffuseMethod = this._diffuseMethod;
            pass.ambientMethod = this._ambientMethod;
            pass.normalMethod = this._normalMethod;
            pass.specularMethod = this._specularMethod;
            this._nonCasterLightPasses.push(pass);
            dirLightOffset += pass.iNumDirectionalLights;
            pointLightOffset += pass.iNumPointLights;
            probeOffset += pass.iNumLightProbes;
        }
    };
    TriangleMethodMaterial.prototype.removeNonCasterLightPasses = function () {
        if (!this._nonCasterLightPasses)
            return;
        for (var i = 0; i < this._nonCasterLightPasses.length; ++i)
            this._pRemoveScreenPass(this._nonCasterLightPasses[i]);
        this._nonCasterLightPasses = null;
    };
    TriangleMethodMaterial.prototype.removeEffectPass = function () {
        if (this._screenPass.ambientMethod != this._ambientMethod)
            this._screenPass.ambientMethod.dispose();
        if (this._screenPass.diffuseMethod != this._diffuseMethod)
            this._screenPass.diffuseMethod.dispose();
        if (this._screenPass.specularMethod != this._specularMethod)
            this._screenPass.specularMethod.dispose();
        if (this._screenPass.normalMethod != this._normalMethod)
            this._screenPass.normalMethod.dispose();
        this._pRemoveScreenPass(this._screenPass);
        this._screenPass = null;
    };
    TriangleMethodMaterial.prototype.initEffectPass = function () {
        if (this._screenPass == null)
            this._screenPass = new TriangleMethodPass();
        if (this._materialMode == TriangleMaterialMode.SINGLE_PASS) {
            this._screenPass.ambientMethod = this._ambientMethod;
            this._screenPass.diffuseMethod = this._diffuseMethod;
            this._screenPass.specularMethod = this._specularMethod;
            this._screenPass.normalMethod = this._normalMethod;
            this._screenPass.shadowMethod = this._shadowMethod;
        }
        else if (this._materialMode == TriangleMaterialMode.MULTI_PASS) {
            if (this.numLights == 0) {
                this._screenPass.ambientMethod = this._ambientMethod;
            }
            else {
                this._screenPass.ambientMethod = null;
            }
            this._screenPass.preserveAlpha = false;
            this._screenPass.normalMethod = this._normalMethod;
        }
    };
    Object.defineProperty(TriangleMethodMaterial.prototype, "numLights", {
        /**
         * The maximum total number of lights provided by the light picker.
         */
        get: function () {
            return this._pLightPicker ? this._pLightPicker.numLightProbes + this._pLightPicker.numDirectionalLights + this._pLightPicker.numPointLights + this._pLightPicker.numCastingDirectionalLights + this._pLightPicker.numCastingPointLights : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodMaterial.prototype, "numNonCasters", {
        /**
         * The amount of lights that don't cast shadows.
         */
        get: function () {
            return this._pLightPicker ? this._pLightPicker.numLightProbes + this._pLightPicker.numDirectionalLights + this._pLightPicker.numPointLights : 0;
        },
        enumerable: true,
        configurable: true
    });
    return TriangleMethodMaterial;
})(TriangleMaterialBase);
module.exports = TriangleMethodMaterial;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvdHJpYW5nbGVtZXRob2RtYXRlcmlhbC50cyJdLCJuYW1lcyI6WyJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5jb25zdHJ1Y3RvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubWF0ZXJpYWxNb2RlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5kZXB0aENvbXBhcmVNb2RlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbHBoYSIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuY29sb3JUcmFuc2Zvcm0iLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbWJpZW50TWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5zaGFkb3dNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5ub3JtYWxNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubnVtRWZmZWN0TWV0aG9kcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaGFzRWZmZWN0TWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5nZXRFZmZlY3RNZXRob2RBdCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kQXQiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnJlbW92ZUVmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubm9ybWFsTWFwIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5zcGVjdWxhck1hcCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuZ2xvc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmFtYmllbnQiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnNwZWN1bGFyIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbWJpZW50Q29sb3IiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VDb2xvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuc3BlY3VsYXJDb2xvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuX2lVcGRhdGVNYXRlcmlhbCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdFBhc3NlcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuc2V0QmxlbmRBbmRDb21wYXJlTW9kZXMiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmluaXRDYXN0ZXJMaWdodFBhc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnJlbW92ZUNhc3RlckxpZ2h0UGFzcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdE5vbkNhc3RlckxpZ2h0UGFzc2VzIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5yZW1vdmVOb25DYXN0ZXJMaWdodFBhc3NlcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwucmVtb3ZlRWZmZWN0UGFzcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdEVmZmVjdFBhc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLm51bUxpZ2h0cyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubnVtTm9uQ2FzdGVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxjQUFjLFdBQWMscUNBQXFDLENBQUMsQ0FBQztBQUMxRSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRTVFLElBQU8sU0FBUyxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFFcEUsSUFBTyxpQkFBaUIsV0FBYSw2REFBNkQsQ0FBQyxDQUFDO0FBR3BHLElBQU8sb0JBQW9CLFdBQWEsc0RBQXNELENBQUMs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QUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNyREEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7UUFDakVBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLGtCQUFrQkEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7WUFFbENBLEFBRUFBLHFGQUZxRkE7WUFDckZBLGlDQUFpQ0E7WUFDakNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGdCQUFnQkEsR0FBR0EsZ0JBQWdCQSxDQUFDQTtnQkFDbEVBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdEQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtnQkFDeEVBLGtCQUFrQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLENBQUNBO1lBR0RBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLGtCQUFrQkEsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtnQkFDcEZBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxnQkFBZ0JBLENBQUNBO2dCQUNsRUEsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFD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QUdBLENBQUNBLENBQUNBO1FBQzVPQSxDQUFDQTs7O09BQUFwQztJQUtEQSxzQkFBWUEsaURBQWFBO1FBSHpCQTs7V0FFR0E7YUFDSEE7WUFFQ3FDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEdBQUVBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDaEpBLENBQUNBOzs7T0FBQXJDO0lBQ0ZBLDZCQUFDQTtBQUFEQSxDQTdxQkEsQUE2cUJDQSxFQTdxQm9DLG9CQUFvQixFQTZxQnhEO0FBRUQsQUFBZ0MsaUJBQXZCLHNCQUFzQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbIu+7v2ltcG9ydCBDb2xvclRyYW5zZm9ybVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vQ29sb3JUcmFuc2Zvcm1cIik7XG5pbXBvcnQgVGV4dHVyZTJEQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmUyREJhc2VcIik7XG5cbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBDb250ZXh0R0xDb21wYXJlTW9kZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvQ29udGV4dEdMQ29tcGFyZU1vZGVcIik7XG5pbXBvcnQgQW1iaWVudEJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL0FtYmllbnRCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBEaWZmdXNlQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvRGlmZnVzZUJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IEVmZmVjdE1ldGhvZEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9FZmZlY3RNZXRob2RCYXNlXCIpO1xuaW1wb3J0IE5vcm1hbEJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL05vcm1hbEJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNoYWRvd01hcE1ldGhvZEJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU2hhZG93TWFwTWV0aG9kQmFzZVwiKTtcbmltcG9ydCBTcGVjdWxhckJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NwZWN1bGFyQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgTWF0ZXJpYWxQYXNzTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvTWF0ZXJpYWxQYXNzTW9kZVwiKTtcbmltcG9ydCBUcmlhbmdsZU1ldGhvZFBhc3NcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9UcmlhbmdsZU1ldGhvZFBhc3NcIik7XG5pbXBvcnQgVHJpYW5nbGVNYXRlcmlhbEJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1RyaWFuZ2xlTWF0ZXJpYWxCYXNlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1hdGVyaWFsTW9kZVwiKTtcblxuLyoqXG4gKiBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsIGZvcm1zIGFuIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIHRoZSBkZWZhdWx0IHNoYWRlZCBtYXRlcmlhbHMgcHJvdmlkZWQgYnkgU3RhZ2UsXG4gKiB1c2luZyBtYXRlcmlhbCBtZXRob2RzIHRvIGRlZmluZSB0aGVpciBhcHBlYXJhbmNlLlxuICovXG5jbGFzcyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsIGV4dGVuZHMgVHJpYW5nbGVNYXRlcmlhbEJhc2Vcbntcblx0cHJpdmF0ZSBfYWxwaGFCbGVuZGluZzpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2FscGhhOm51bWJlciA9IDE7XG5cdHByaXZhdGUgX2NvbG9yVHJhbnNmb3JtOkNvbG9yVHJhbnNmb3JtO1xuXHRwcml2YXRlIF9tYXRlcmlhbE1vZGU6c3RyaW5nO1xuXHRwcml2YXRlIF9jYXN0ZXJMaWdodFBhc3M6VHJpYW5nbGVNZXRob2RQYXNzO1xuXHRwcml2YXRlIF9ub25DYXN0ZXJMaWdodFBhc3NlczpBcnJheTxUcmlhbmdsZU1ldGhvZFBhc3M+O1xuXHRwcml2YXRlIF9zY3JlZW5QYXNzOlRyaWFuZ2xlTWV0aG9kUGFzcztcblxuXHRwcml2YXRlIF9hbWJpZW50TWV0aG9kOkFtYmllbnRCYXNpY01ldGhvZCA9IG5ldyBBbWJpZW50QmFzaWNNZXRob2QoKTtcblx0cHJpdmF0ZSBfc2hhZG93TWV0aG9kOlNoYWRvd01hcE1ldGhvZEJhc2U7XG5cdHByaXZhdGUgX2RpZmZ1c2VNZXRob2Q6RGlmZnVzZUJhc2ljTWV0aG9kID0gbmV3IERpZmZ1c2VCYXNpY01ldGhvZCgpO1xuXHRwcml2YXRlIF9ub3JtYWxNZXRob2Q6Tm9ybWFsQmFzaWNNZXRob2QgPSBuZXcgTm9ybWFsQmFzaWNNZXRob2QoKTtcblx0cHJpdmF0ZSBfc3BlY3VsYXJNZXRob2Q6U3BlY3VsYXJCYXNpY01ldGhvZCA9IG5ldyBTcGVjdWxhckJhc2ljTWV0aG9kKCk7XG5cblxuXHRwcml2YXRlIF9kZXB0aENvbXBhcmVNb2RlOnN0cmluZyA9IENvbnRleHRHTENvbXBhcmVNb2RlLkxFU1NfRVFVQUw7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB0ZXh0dXJlIFRoZSB0ZXh0dXJlIHVzZWQgZm9yIHRoZSBtYXRlcmlhbCdzIGFsYmVkbyBjb2xvci5cblx0ICogQHBhcmFtIHNtb290aCBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdGV4dHVyZSBzaG91bGQgYmUgZmlsdGVyZWQgd2hlbiBzYW1wbGVkLiBEZWZhdWx0cyB0byB0cnVlLlxuXHQgKiBAcGFyYW0gcmVwZWF0IEluZGljYXRlcyB3aGV0aGVyIHRoZSB0ZXh0dXJlIHNob3VsZCBiZSB0aWxlZCB3aGVuIHNhbXBsZWQuIERlZmF1bHRzIHRvIGZhbHNlLlxuXHQgKiBAcGFyYW0gbWlwbWFwIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBhbnkgdXNlZCB0ZXh0dXJlcyBzaG91bGQgdXNlIG1pcG1hcHBpbmcuIERlZmF1bHRzIHRvIGZhbHNlLlxuXHQgKi9cblx0Y29uc3RydWN0b3IodGV4dHVyZT86VGV4dHVyZTJEQmFzZSwgc21vb3RoPzpib29sZWFuLCByZXBlYXQ/OmJvb2xlYW4sIG1pcG1hcD86Ym9vbGVhbik7XG5cdGNvbnN0cnVjdG9yKGNvbG9yPzpudW1iZXIsIGFscGhhPzpudW1iZXIpO1xuXHRjb25zdHJ1Y3Rvcih0ZXh0dXJlQ29sb3I6YW55ID0gbnVsbCwgc21vb3RoQWxwaGE6YW55ID0gbnVsbCwgcmVwZWF0OmJvb2xlYW4gPSBmYWxzZSwgbWlwbWFwOmJvb2xlYW4gPSBmYWxzZSlcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9tYXRlcmlhbE1vZGUgPSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5TSU5HTEVfUEFTUztcblxuXHRcdGlmICh0ZXh0dXJlQ29sb3IgaW5zdGFuY2VvZiBUZXh0dXJlMkRCYXNlKSB7XG5cdFx0XHR0aGlzLnRleHR1cmUgPSA8VGV4dHVyZTJEQmFzZT4gdGV4dHVyZUNvbG9yO1xuXG5cdFx0XHR0aGlzLnNtb290aCA9IChzbW9vdGhBbHBoYSA9PSBudWxsKT8gdHJ1ZSA6IGZhbHNlO1xuXHRcdFx0dGhpcy5yZXBlYXQgPSByZXBlYXQ7XG5cdFx0XHR0aGlzLm1pcG1hcCA9IG1pcG1hcDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb2xvciA9ICh0ZXh0dXJlQ29sb3IgPT0gbnVsbCk/IDB4RkZGRkZGIDogTnVtYmVyKHRleHR1cmVDb2xvcik7XG5cdFx0XHR0aGlzLmFscGhhID0gKHNtb290aEFscGhhID09IG51bGwpPyAxIDogTnVtYmVyKHNtb290aEFscGhhKTtcblx0XHR9XG5cdH1cblxuXG5cdHB1YmxpYyBnZXQgbWF0ZXJpYWxNb2RlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbWF0ZXJpYWxNb2RlO1xuXHR9XG5cblx0cHVibGljIHNldCBtYXRlcmlhbE1vZGUodmFsdWU6c3RyaW5nKVxuXHR7XG5cdFx0aWYgKHRoaXMuX21hdGVyaWFsTW9kZSA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX21hdGVyaWFsTW9kZSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZGVwdGggY29tcGFyZSBtb2RlIHVzZWQgdG8gcmVuZGVyIHRoZSByZW5kZXJhYmxlcyB1c2luZyB0aGlzIG1hdGVyaWFsLlxuXHQgKlxuXHQgKiBAc2VlIGF3YXkuc3RhZ2VnbC5Db250ZXh0R0xDb21wYXJlTW9kZVxuXHQgKi9cblxuXHRwdWJsaWMgZ2V0IGRlcHRoQ29tcGFyZU1vZGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kZXB0aENvbXBhcmVNb2RlO1xuXHR9XG5cblx0cHVibGljIHNldCBkZXB0aENvbXBhcmVNb2RlKHZhbHVlOnN0cmluZylcblx0e1xuXHRcdGlmICh0aGlzLl9kZXB0aENvbXBhcmVNb2RlID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fZGVwdGhDb21wYXJlTW9kZSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYWxwaGEgb2YgdGhlIHN1cmZhY2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFscGhhKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYWxwaGE7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFscGhhKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdGlmICh2YWx1ZSA+IDEpXG5cdFx0XHR2YWx1ZSA9IDE7XG5cdFx0ZWxzZSBpZiAodmFsdWUgPCAwKVxuXHRcdFx0dmFsdWUgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX2FscGhhID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYWxwaGEgPSB2YWx1ZTtcblxuXHRcdGlmICh0aGlzLl9jb2xvclRyYW5zZm9ybSA9PSBudWxsKVxuXHRcdFx0dGhpcy5fY29sb3JUcmFuc2Zvcm0gPSBuZXcgQ29sb3JUcmFuc2Zvcm0oKTtcblxuXHRcdHRoaXMuX2NvbG9yVHJhbnNmb3JtLmFscGhhTXVsdGlwbGllciA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQ29sb3JUcmFuc2Zvcm0gb2JqZWN0IHRvIHRyYW5zZm9ybSB0aGUgY29sb3VyIG9mIHRoZSBtYXRlcmlhbCB3aXRoLiBEZWZhdWx0cyB0byBudWxsLlxuXHQgKi9cblx0cHVibGljIGdldCBjb2xvclRyYW5zZm9ybSgpOkNvbG9yVHJhbnNmb3JtXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2NyZWVuUGFzcy5jb2xvclRyYW5zZm9ybTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3JUcmFuc2Zvcm0odmFsdWU6Q29sb3JUcmFuc2Zvcm0pXG5cdHtcblx0XHR0aGlzLl9zY3JlZW5QYXNzLmNvbG9yVHJhbnNmb3JtID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRleHR1cmUgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIGFtYmllbnQgY29sb3VyLlxuXHQgKi9cblx0cHVibGljIGdldCBkaWZmdXNlVGV4dHVyZSgpOlRleHR1cmUyREJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kaWZmdXNlTWV0aG9kLnRleHR1cmU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRpZmZ1c2VUZXh0dXJlKHZhbHVlOlRleHR1cmUyREJhc2UpXG5cdHtcblx0XHR0aGlzLl9kaWZmdXNlTWV0aG9kLnRleHR1cmUgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgcHJvdmlkZXMgdGhlIGFtYmllbnQgbGlnaHRpbmcgY29udHJpYnV0aW9uLiBEZWZhdWx0cyB0byBBbWJpZW50QmFzaWNNZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFtYmllbnRNZXRob2QoKTpBbWJpZW50QmFzaWNNZXRob2Rcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbWJpZW50TWV0aG9kO1xuXHR9XG5cblx0cHVibGljIHNldCBhbWJpZW50TWV0aG9kKHZhbHVlOkFtYmllbnRCYXNpY01ldGhvZClcblx0e1xuXHRcdGlmICh0aGlzLl9hbWJpZW50TWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHZhbHVlICYmIHRoaXMuX2FtYmllbnRNZXRob2QpXG5cdFx0XHR2YWx1ZS5jb3B5RnJvbSh0aGlzLl9hbWJpZW50TWV0aG9kKTtcblxuXHRcdHRoaXMuX2FtYmllbnRNZXRob2QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlU2NyZWVuUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB1c2VkIHRvIHJlbmRlciBzaGFkb3dzIGNhc3Qgb24gdGhpcyBzdXJmYWNlLCBvciBudWxsIGlmIG5vIHNoYWRvd3MgYXJlIHRvIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byBudWxsLlxuXHQgKi9cblx0cHVibGljIGdldCBzaGFkb3dNZXRob2QoKTpTaGFkb3dNYXBNZXRob2RCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2hhZG93TWV0aG9kO1xuXHR9XG5cblx0cHVibGljIHNldCBzaGFkb3dNZXRob2QodmFsdWU6U2hhZG93TWFwTWV0aG9kQmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9zaGFkb3dNZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodmFsdWUgJiYgdGhpcy5fc2hhZG93TWV0aG9kKVxuXHRcdFx0dmFsdWUuY29weUZyb20odGhpcy5fc2hhZG93TWV0aG9kKTtcblxuXHRcdHRoaXMuX3NoYWRvd01ldGhvZCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgcHJvdmlkZXMgdGhlIGRpZmZ1c2UgbGlnaHRpbmcgY29udHJpYnV0aW9uLiBEZWZhdWx0cyB0byBEaWZmdXNlQmFzaWNNZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGRpZmZ1c2VNZXRob2QoKTpEaWZmdXNlQmFzaWNNZXRob2Rcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kaWZmdXNlTWV0aG9kO1xuXHR9XG5cblx0cHVibGljIHNldCBkaWZmdXNlTWV0aG9kKHZhbHVlOkRpZmZ1c2VCYXNpY01ldGhvZClcblx0e1xuXHRcdGlmICh0aGlzLl9kaWZmdXNlTWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHZhbHVlICYmIHRoaXMuX2RpZmZ1c2VNZXRob2QpXG5cdFx0XHR2YWx1ZS5jb3B5RnJvbSh0aGlzLl9kaWZmdXNlTWV0aG9kKTtcblxuXHRcdHRoaXMuX2RpZmZ1c2VNZXRob2QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlU2NyZWVuUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IHByb3ZpZGVzIHRoZSBzcGVjdWxhciBsaWdodGluZyBjb250cmlidXRpb24uIERlZmF1bHRzIHRvIFNwZWN1bGFyQmFzaWNNZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNwZWN1bGFyTWV0aG9kKCk6U3BlY3VsYXJCYXNpY01ldGhvZFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwZWN1bGFyTWV0aG9kO1xuXHR9XG5cblx0cHVibGljIHNldCBzcGVjdWxhck1ldGhvZCh2YWx1ZTpTcGVjdWxhckJhc2ljTWV0aG9kKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NwZWN1bGFyTWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHZhbHVlICYmIHRoaXMuX3NwZWN1bGFyTWV0aG9kKVxuXHRcdFx0dmFsdWUuY29weUZyb20odGhpcy5fc3BlY3VsYXJNZXRob2QpO1xuXG5cdFx0dGhpcy5fc3BlY3VsYXJNZXRob2QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlU2NyZWVuUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBwZXItcGl4ZWwgbm9ybWFscy4gRGVmYXVsdHMgdG8gTm9ybWFsQmFzaWNNZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG5vcm1hbE1ldGhvZCgpOk5vcm1hbEJhc2ljTWV0aG9kXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbm9ybWFsTWV0aG9kO1xuXHR9XG5cblx0cHVibGljIHNldCBub3JtYWxNZXRob2QodmFsdWU6Tm9ybWFsQmFzaWNNZXRob2QpXG5cdHtcblx0XHRpZiAodGhpcy5fbm9ybWFsTWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHZhbHVlICYmIHRoaXMuX25vcm1hbE1ldGhvZClcblx0XHRcdHZhbHVlLmNvcHlGcm9tKHRoaXMuX25vcm1hbE1ldGhvZCk7XG5cblx0XHR0aGlzLl9ub3JtYWxNZXRob2QgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlU2NyZWVuUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwZW5kcyBhbiBcImVmZmVjdFwiIHNoYWRpbmcgbWV0aG9kIHRvIHRoZSBzaGFkZXIuIEVmZmVjdCBtZXRob2RzIGFyZSB0aG9zZSB0aGF0IGRvIG5vdCBpbmZsdWVuY2UgdGhlIGxpZ2h0aW5nXG5cdCAqIGJ1dCBtb2R1bGF0ZSB0aGUgc2hhZGVkIGNvbG91ciwgdXNlZCBmb3IgZm9nLCBvdXRsaW5lcywgZXRjLiBUaGUgbWV0aG9kIHdpbGwgYmUgYXBwbGllZCB0byB0aGUgcmVzdWx0IG9mIHRoZVxuXHQgKiBtZXRob2RzIGFkZGVkIHByaW9yLlxuXHQgKi9cblx0cHVibGljIGFkZEVmZmVjdE1ldGhvZChtZXRob2Q6RWZmZWN0TWV0aG9kQmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzID09IG51bGwpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzID0gbmV3IFRyaWFuZ2xlTWV0aG9kUGFzcygpO1xuXG5cdFx0dGhpcy5fc2NyZWVuUGFzcy5hZGRFZmZlY3RNZXRob2QobWV0aG9kKTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlU2NyZWVuUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG51bWJlciBvZiBcImVmZmVjdFwiIG1ldGhvZHMgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1FZmZlY3RNZXRob2RzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2NyZWVuUGFzcz8gdGhpcy5fc2NyZWVuUGFzcy5udW1FZmZlY3RNZXRob2RzIDogMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBRdWVyaWVzIHdoZXRoZXIgYSBnaXZlbiBlZmZlY3QgbWV0aG9kIHdhcyBhZGRlZCB0byB0aGUgbWF0ZXJpYWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBiZSBxdWVyaWVkLlxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlIG1ldGhvZCB3YXMgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLCBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRwdWJsaWMgaGFzRWZmZWN0TWV0aG9kKG1ldGhvZDpFZmZlY3RNZXRob2RCYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2NyZWVuUGFzcz8gdGhpcy5fc2NyZWVuUGFzcy5oYXNFZmZlY3RNZXRob2QobWV0aG9kKSA6IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG1ldGhvZCBhZGRlZCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIG1ldGhvZCB0byByZXRyaWV2ZS5cblx0ICogQHJldHVybiBUaGUgbWV0aG9kIGF0IHRoZSBnaXZlbiBpbmRleC5cblx0ICovXG5cdHB1YmxpYyBnZXRFZmZlY3RNZXRob2RBdChpbmRleDpudW1iZXIpOkVmZmVjdE1ldGhvZEJhc2Vcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzID09IG51bGwpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiB0aGlzLl9zY3JlZW5QYXNzLmdldEVmZmVjdE1ldGhvZEF0KGluZGV4KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVmZmVjdCBtZXRob2QgYXQgdGhlIHNwZWNpZmllZCBpbmRleCBhbW9uZ3N0IHRoZSBtZXRob2RzIGFscmVhZHkgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLiBFZmZlY3Rcblx0ICogbWV0aG9kcyBhcmUgdGhvc2UgdGhhdCBkbyBub3QgaW5mbHVlbmNlIHRoZSBsaWdodGluZyBidXQgbW9kdWxhdGUgdGhlIHNoYWRlZCBjb2xvdXIsIHVzZWQgZm9yIGZvZywgb3V0bGluZXMsXG5cdCAqIGV0Yy4gVGhlIG1ldGhvZCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kcyB3aXRoIGEgbG93ZXIgaW5kZXguXG5cdCAqL1xuXHRwdWJsaWMgYWRkRWZmZWN0TWV0aG9kQXQobWV0aG9kOkVmZmVjdE1ldGhvZEJhc2UsIGluZGV4Om51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzID09IG51bGwpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzID0gbmV3IFRyaWFuZ2xlTWV0aG9kUGFzcygpO1xuXG5cdFx0dGhpcy5fc2NyZWVuUGFzcy5hZGRFZmZlY3RNZXRob2RBdChtZXRob2QsIGluZGV4KTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBlZmZlY3QgbWV0aG9kIGZyb20gdGhlIG1hdGVyaWFsLlxuXHQgKiBAcGFyYW0gbWV0aG9kIFRoZSBtZXRob2QgdG8gYmUgcmVtb3ZlZC5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVFZmZlY3RNZXRob2QobWV0aG9kOkVmZmVjdE1ldGhvZEJhc2UpXG5cdHtcblx0XHRpZiAodGhpcy5fc2NyZWVuUGFzcyA9PSBudWxsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fc2NyZWVuUGFzcy5yZW1vdmVFZmZlY3RNZXRob2QobWV0aG9kKTtcblxuXHRcdC8vIHJlY29uc2lkZXJcblx0XHRpZiAodGhpcy5fc2NyZWVuUGFzcy5udW1FZmZlY3RNZXRob2RzID09IDApXG5cdFx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBub3JtYWwgbWFwIHRvIG1vZHVsYXRlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHN1cmZhY2UgZm9yIGVhY2ggdGV4ZWwuIFRoZSBkZWZhdWx0IG5vcm1hbCBtZXRob2QgZXhwZWN0c1xuXHQgKiB0YW5nZW50LXNwYWNlIG5vcm1hbCBtYXBzLCBidXQgb3RoZXJzIGNvdWxkIGV4cGVjdCBvYmplY3Qtc3BhY2UgbWFwcy5cblx0ICovXG5cdHB1YmxpYyBnZXQgbm9ybWFsTWFwKCk6VGV4dHVyZTJEQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX25vcm1hbE1ldGhvZC5ub3JtYWxNYXA7XG5cdH1cblxuXHRwdWJsaWMgc2V0IG5vcm1hbE1hcCh2YWx1ZTpUZXh0dXJlMkRCYXNlKVxuXHR7XG5cdFx0dGhpcy5fbm9ybWFsTWV0aG9kLm5vcm1hbE1hcCA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc3BlY3VsYXIgbWFwIHRoYXQgZGVmaW5lcyB0aGUgc3RyZW5ndGggb2Ygc3BlY3VsYXIgcmVmbGVjdGlvbnMgZm9yIGVhY2ggdGV4ZWwgaW4gdGhlIHJlZCBjaGFubmVsLFxuXHQgKiBhbmQgdGhlIGdsb3NzIGZhY3RvciBpbiB0aGUgZ3JlZW4gY2hhbm5lbC4gWW91IGNhbiB1c2UgU3BlY3VsYXJCaXRtYXBUZXh0dXJlIGlmIHlvdSB3YW50IHRvIGVhc2lseSBzZXRcblx0ICogc3BlY3VsYXIgYW5kIGdsb3NzIG1hcHMgZnJvbSBncmF5c2NhbGUgaW1hZ2VzLCBidXQgY29ycmVjdGx5IGF1dGhvcmVkIGltYWdlcyBhcmUgcHJlZmVycmVkLlxuXHQgKi9cblx0cHVibGljIGdldCBzcGVjdWxhck1hcCgpOlRleHR1cmUyREJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zcGVjdWxhck1ldGhvZC50ZXh0dXJlO1xuXHR9XG5cblx0cHVibGljIHNldCBzcGVjdWxhck1hcCh2YWx1ZTpUZXh0dXJlMkRCYXNlKVxuXHR7XG5cdFx0dGhpcy5fc3BlY3VsYXJNZXRob2QudGV4dHVyZSA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBnbG9zc2luZXNzIG9mIHRoZSBtYXRlcmlhbCAoc2hhcnBuZXNzIG9mIHRoZSBzcGVjdWxhciBoaWdobGlnaHQpLlxuXHQgKi9cblx0cHVibGljIGdldCBnbG9zcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwZWN1bGFyTWV0aG9kLmdsb3NzO1xuXHR9XG5cblx0cHVibGljIHNldCBnbG9zcyh2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9zcGVjdWxhck1ldGhvZC5nbG9zcyA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBzdHJlbmd0aCBvZiB0aGUgYW1iaWVudCByZWZsZWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCBhbWJpZW50KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW1iaWVudE1ldGhvZC5hbWJpZW50O1xuXHR9XG5cblx0cHVibGljIHNldCBhbWJpZW50KHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FtYmllbnRNZXRob2QuYW1iaWVudCA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBvdmVyYWxsIHN0cmVuZ3RoIG9mIHRoZSBzcGVjdWxhciByZWZsZWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCBzcGVjdWxhcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwZWN1bGFyTWV0aG9kLnNwZWN1bGFyO1xuXHR9XG5cblx0cHVibGljIHNldCBzcGVjdWxhcih2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9zcGVjdWxhck1ldGhvZC5zcGVjdWxhciA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb2xvdXIgb2YgdGhlIGFtYmllbnQgcmVmbGVjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW1iaWVudENvbG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZGlmZnVzZU1ldGhvZC5hbWJpZW50Q29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFtYmllbnRDb2xvcih2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9kaWZmdXNlTWV0aG9kLmFtYmllbnRDb2xvciA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb2xvdXIgb2YgdGhlIGRpZmZ1c2UgcmVmbGVjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgZGlmZnVzZUNvbG9yKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZGlmZnVzZU1ldGhvZC5kaWZmdXNlQ29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRpZmZ1c2VDb2xvcih2YWx1ZTpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9kaWZmdXNlTWV0aG9kLmRpZmZ1c2VDb2xvciA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb2xvdXIgb2YgdGhlIHNwZWN1bGFyIHJlZmxlY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNwZWN1bGFyQ29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zcGVjdWxhck1ldGhvZC5zcGVjdWxhckNvbG9yO1xuXHR9XG5cblx0cHVibGljIHNldCBzcGVjdWxhckNvbG9yKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3NwZWN1bGFyTWV0aG9kLnNwZWN1bGFyQ29sb3IgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdGhlIG1hdGVyaWFsIGhhcyB0cmFuc3BhcmVuY3kuIElmIGJpbmFyeSB0cmFuc3BhcmVuY3kgaXMgc3VmZmljaWVudCwgZm9yXG5cdCAqIGV4YW1wbGUgd2hlbiB1c2luZyB0ZXh0dXJlcyBvZiBmb2xpYWdlLCBjb25zaWRlciB1c2luZyBhbHBoYVRocmVzaG9sZCBpbnN0ZWFkLlxuXHQgKi9cblxuXHRwdWJsaWMgZ2V0IGFscGhhQmxlbmRpbmcoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYWxwaGFCbGVuZGluZztcblx0fVxuXG5cdHB1YmxpYyBzZXQgYWxwaGFCbGVuZGluZyh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2FscGhhQmxlbmRpbmcgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9hbHBoYUJsZW5kaW5nID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgX2lVcGRhdGVNYXRlcmlhbCgpXG5cdHtcblx0XHRpZiAodGhpcy5fcFNjcmVlblBhc3Nlc0ludmFsaWQpIHtcblx0XHRcdC8vVXBkYXRlcyBzY3JlZW4gcGFzc2VzIHdoZW4gdGhleSB3ZXJlIGZvdW5kIHRvIGJlIGludmFsaWQuXG5cdFx0XHR0aGlzLl9wU2NyZWVuUGFzc2VzSW52YWxpZCA9IGZhbHNlO1xuXG5cdFx0XHR0aGlzLmluaXRQYXNzZXMoKTtcblxuXHRcdFx0dGhpcy5zZXRCbGVuZEFuZENvbXBhcmVNb2RlcygpO1xuXG5cdFx0XHR0aGlzLl9wQ2xlYXJTY3JlZW5QYXNzZXMoKTtcblxuXHRcdFx0aWYgKHRoaXMuX21hdGVyaWFsTW9kZSA9PSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5NVUxUSV9QQVNTKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9jYXN0ZXJMaWdodFBhc3MpXG5cdFx0XHRcdFx0dGhpcy5fcEFkZFNjcmVlblBhc3ModGhpcy5fY2FzdGVyTGlnaHRQYXNzKTtcblxuXHRcdFx0XHRpZiAodGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMpXG5cdFx0XHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMubGVuZ3RoOyArK2kpXG5cdFx0XHRcdFx0XHR0aGlzLl9wQWRkU2NyZWVuUGFzcyh0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlc1tpXSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzKVxuXHRcdFx0XHR0aGlzLl9wQWRkU2NyZWVuUGFzcyh0aGlzLl9zY3JlZW5QYXNzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgYWxsIHRoZSBwYXNzZXMgYW5kIHRoZWlyIGRlcGVuZGVudCBwYXNzZXMuXG5cdCAqL1xuXHRwcml2YXRlIGluaXRQYXNzZXMoKVxuXHR7XG5cdFx0Ly8gbGV0IHRoZSBlZmZlY3RzIHBhc3MgaGFuZGxlIGV2ZXJ5dGhpbmcgaWYgdGhlcmUgYXJlIG5vIGxpZ2h0cywgd2hlbiB0aGVyZSBhcmUgZWZmZWN0IG1ldGhvZHMgYXBwbGllZFxuXHRcdC8vIGFmdGVyIHNoYWRpbmcsIG9yIHdoZW4gdGhlIG1hdGVyaWFsIG1vZGUgaXMgc2luZ2xlIHBhc3MuXG5cdFx0aWYgKHRoaXMubnVtTGlnaHRzID09IDAgfHwgdGhpcy5udW1FZmZlY3RNZXRob2RzID4gMCB8fCB0aGlzLl9tYXRlcmlhbE1vZGUgPT0gVHJpYW5nbGVNYXRlcmlhbE1vZGUuU0lOR0xFX1BBU1MpXG5cdFx0XHR0aGlzLmluaXRFZmZlY3RQYXNzKCk7XG5cdFx0ZWxzZSBpZiAodGhpcy5fc2NyZWVuUGFzcylcblx0XHRcdHRoaXMucmVtb3ZlRWZmZWN0UGFzcygpO1xuXG5cdFx0Ly8gb25seSB1c2UgYSBjYXN0ZXIgbGlnaHQgcGFzcyBpZiBzaGFkb3dzIG5lZWQgdG8gYmUgcmVuZGVyZWRcblx0XHRpZiAodGhpcy5fc2hhZG93TWV0aG9kICYmIHRoaXMuX21hdGVyaWFsTW9kZSA9PSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5NVUxUSV9QQVNTKVxuXHRcdFx0dGhpcy5pbml0Q2FzdGVyTGlnaHRQYXNzKCk7XG5cdFx0ZWxzZSBpZiAodGhpcy5fY2FzdGVyTGlnaHRQYXNzKVxuXHRcdFx0dGhpcy5yZW1vdmVDYXN0ZXJMaWdodFBhc3MoKTtcblxuXHRcdC8vIG9ubHkgdXNlIG5vbiBjYXN0ZXIgbGlnaHQgcGFzc2VzIGlmIHRoZXJlIGFyZSBsaWdodHMgdGhhdCBkb24ndCBjYXN0XG5cdFx0aWYgKHRoaXMubnVtTm9uQ2FzdGVycyA+IDAgJiYgdGhpcy5fbWF0ZXJpYWxNb2RlID09IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLk1VTFRJX1BBU1MpXG5cdFx0XHR0aGlzLmluaXROb25DYXN0ZXJMaWdodFBhc3NlcygpO1xuXHRcdGVsc2UgaWYgKHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzKVxuXHRcdFx0dGhpcy5yZW1vdmVOb25DYXN0ZXJMaWdodFBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdXAgdGhlIHZhcmlvdXMgYmxlbmRpbmcgbW9kZXMgZm9yIGFsbCBzY3JlZW4gcGFzc2VzLCBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgcHJldmlvdXMgcGFzc2VzLlxuXHQgKi9cblx0cHJpdmF0ZSBzZXRCbGVuZEFuZENvbXBhcmVNb2RlcygpXG5cdHtcblx0XHR2YXIgZm9yY2VTZXBhcmF0ZU1WUDpib29sZWFuID0gQm9vbGVhbih0aGlzLl9jYXN0ZXJMaWdodFBhc3MgfHwgdGhpcy5fc2NyZWVuUGFzcyk7XG5cblx0XHQvLyBjYXN0ZXIgbGlnaHQgcGFzcyBpcyBhbHdheXMgZmlyc3QgaWYgaXQgZXhpc3RzLCBoZW5jZSBpdCB1c2VzIG5vcm1hbCBibGVuZGluZ1xuXHRcdGlmICh0aGlzLl9jYXN0ZXJMaWdodFBhc3MpIHtcblx0XHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5mb3JjZVNlcGFyYXRlTVZQID0gZm9yY2VTZXBhcmF0ZU1WUDtcblx0XHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5zZXRCbGVuZE1vZGUoQmxlbmRNb2RlLk5PUk1BTCk7XG5cdFx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3MuZGVwdGhDb21wYXJlTW9kZSA9IHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzKSB7XG5cdFx0XHR2YXIgZmlyc3RBZGRpdGl2ZUluZGV4Om51bWJlciA9IDA7XG5cblx0XHRcdC8vIGlmIHRoZXJlJ3Mgbm8gY2FzdGVyIGxpZ2h0IHBhc3MsIHRoZSBmaXJzdCBub24gY2FzdGVyIGxpZ2h0IHBhc3Mgd2lsbCBiZSB0aGUgZmlyc3Rcblx0XHRcdC8vIGFuZCBzaG91bGQgdXNlIG5vcm1hbCBibGVuZGluZ1xuXHRcdFx0aWYgKCF0aGlzLl9jYXN0ZXJMaWdodFBhc3MpIHtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbMF0uZm9yY2VTZXBhcmF0ZU1WUCA9IGZvcmNlU2VwYXJhdGVNVlA7XG5cdFx0XHRcdHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzWzBdLnNldEJsZW5kTW9kZShCbGVuZE1vZGUuTk9STUFMKTtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbMF0uZGVwdGhDb21wYXJlTW9kZSA9IHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdFx0XHRcdGZpcnN0QWRkaXRpdmVJbmRleCA9IDE7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGFsbCBsaWdodGluZyBwYXNzZXMgZm9sbG93aW5nIHRoZSBmaXJzdCBsaWdodCBwYXNzIHNob3VsZCB1c2UgYWRkaXRpdmUgYmxlbmRpbmdcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gZmlyc3RBZGRpdGl2ZUluZGV4OyBpIDwgdGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbaV0uZm9yY2VTZXBhcmF0ZU1WUCA9IGZvcmNlU2VwYXJhdGVNVlA7XG5cdFx0XHRcdHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzW2ldLnNldEJsZW5kTW9kZShCbGVuZE1vZGUuQUREKTtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbaV0uZGVwdGhDb21wYXJlTW9kZSA9IENvbnRleHRHTENvbXBhcmVNb2RlLkxFU1NfRVFVQUw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2Nhc3RlckxpZ2h0UGFzcyB8fCB0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcykge1xuXHRcdFx0Ly9jYW5ub3QgYmUgYmxlbmRlZCBieSBibGVuZG1vZGUgcHJvcGVydHkgaWYgbXVsdGlwYXNzIGVuYWJsZWRcblx0XHRcdHRoaXMuX3BSZXF1aXJlc0JsZW5kaW5nID0gZmFsc2U7XG5cblx0XHRcdC8vIHRoZXJlIGFyZSBsaWdodCBwYXNzZXMsIHNvIHRoaXMgc2hvdWxkIGJlIGJsZW5kZWQgaW5cblx0XHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzKSB7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3MucGFzc01vZGUgPSBNYXRlcmlhbFBhc3NNb2RlLkVGRkVDVFM7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3MuZGVwdGhDb21wYXJlTW9kZSA9IENvbnRleHRHTENvbXBhcmVNb2RlLkxFU1NfRVFVQUw7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3Muc2V0QmxlbmRNb2RlKEJsZW5kTW9kZS5MQVlFUik7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3MuZm9yY2VTZXBhcmF0ZU1WUCA9IGZvcmNlU2VwYXJhdGVNVlA7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKHRoaXMuX3NjcmVlblBhc3MpIHtcblx0XHRcdHRoaXMuX3BSZXF1aXJlc0JsZW5kaW5nID0gKHRoaXMuX3BCbGVuZE1vZGUgIT0gQmxlbmRNb2RlLk5PUk1BTCB8fCB0aGlzLl9hbHBoYUJsZW5kaW5nIHx8ICh0aGlzLl9jb2xvclRyYW5zZm9ybSAmJiB0aGlzLl9jb2xvclRyYW5zZm9ybS5hbHBoYU11bHRpcGxpZXIgPCAxKSk7XG5cdFx0XHQvLyBlZmZlY3RzIHBhc3MgaXMgdGhlIG9ubHkgcGFzcywgc28gaXQgc2hvdWxkIGp1c3QgYmxlbmQgbm9ybWFsbHlcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MucGFzc01vZGUgPSBNYXRlcmlhbFBhc3NNb2RlLlNVUEVSX1NIQURFUjtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MuZGVwdGhDb21wYXJlTW9kZSA9IHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLnByZXNlcnZlQWxwaGEgPSB0aGlzLl9wUmVxdWlyZXNCbGVuZGluZztcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MuY29sb3JUcmFuc2Zvcm0gPSB0aGlzLl9jb2xvclRyYW5zZm9ybTtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3Muc2V0QmxlbmRNb2RlKCh0aGlzLl9wQmxlbmRNb2RlID09IEJsZW5kTW9kZS5OT1JNQUwgJiYgdGhpcy5fcFJlcXVpcmVzQmxlbmRpbmcpPyBCbGVuZE1vZGUuTEFZRVIgOiB0aGlzLl9wQmxlbmRNb2RlKTtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MuZm9yY2VTZXBhcmF0ZU1WUCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaW5pdENhc3RlckxpZ2h0UGFzcygpXG5cdHtcblxuXHRcdGlmICh0aGlzLl9jYXN0ZXJMaWdodFBhc3MgPT0gbnVsbClcblx0XHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcyA9IG5ldyBUcmlhbmdsZU1ldGhvZFBhc3MoTWF0ZXJpYWxQYXNzTW9kZS5MSUdIVElORyk7XG5cblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3MubGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMuX3NoYWRvd01ldGhvZC5jYXN0aW5nTGlnaHRdKTtcblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3Muc2hhZG93TWV0aG9kID0gdGhpcy5fc2hhZG93TWV0aG9kO1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5kaWZmdXNlTWV0aG9kID0gdGhpcy5fZGlmZnVzZU1ldGhvZDtcblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3MuYW1iaWVudE1ldGhvZCA9IHRoaXMuX2FtYmllbnRNZXRob2Q7XG5cdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzLm5vcm1hbE1ldGhvZCA9IHRoaXMuX25vcm1hbE1ldGhvZDtcblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3Muc3BlY3VsYXJNZXRob2QgPSB0aGlzLl9zcGVjdWxhck1ldGhvZDtcblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlQ2FzdGVyTGlnaHRQYXNzKClcblx0e1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5kaXNwb3NlKCk7XG5cdFx0dGhpcy5fcFJlbW92ZVNjcmVlblBhc3ModGhpcy5fY2FzdGVyTGlnaHRQYXNzKTtcblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3MgPSBudWxsO1xuXHR9XG5cblx0cHJpdmF0ZSBpbml0Tm9uQ2FzdGVyTGlnaHRQYXNzZXMoKVxuXHR7XG5cdFx0dGhpcy5yZW1vdmVOb25DYXN0ZXJMaWdodFBhc3NlcygpO1xuXHRcdHZhciBwYXNzOlRyaWFuZ2xlTWV0aG9kUGFzcztcblx0XHR2YXIgbnVtRGlyTGlnaHRzOm51bWJlciA9IHRoaXMuX3BMaWdodFBpY2tlci5udW1EaXJlY3Rpb25hbExpZ2h0cztcblx0XHR2YXIgbnVtUG9pbnRMaWdodHM6bnVtYmVyID0gdGhpcy5fcExpZ2h0UGlja2VyLm51bVBvaW50TGlnaHRzO1xuXHRcdHZhciBudW1MaWdodFByb2JlczpudW1iZXIgPSB0aGlzLl9wTGlnaHRQaWNrZXIubnVtTGlnaHRQcm9iZXM7XG5cdFx0dmFyIGRpckxpZ2h0T2Zmc2V0Om51bWJlciA9IDA7XG5cdFx0dmFyIHBvaW50TGlnaHRPZmZzZXQ6bnVtYmVyID0gMDtcblx0XHR2YXIgcHJvYmVPZmZzZXQ6bnVtYmVyID0gMDtcblxuXHRcdGlmICghdGhpcy5fY2FzdGVyTGlnaHRQYXNzKSB7XG5cdFx0XHRudW1EaXJMaWdodHMgKz0gdGhpcy5fcExpZ2h0UGlja2VyLm51bUNhc3RpbmdEaXJlY3Rpb25hbExpZ2h0cztcblx0XHRcdG51bVBvaW50TGlnaHRzICs9IHRoaXMuX3BMaWdodFBpY2tlci5udW1DYXN0aW5nUG9pbnRMaWdodHM7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMgPSBuZXcgQXJyYXk8VHJpYW5nbGVNZXRob2RQYXNzPigpO1xuXG5cdFx0d2hpbGUgKGRpckxpZ2h0T2Zmc2V0IDwgbnVtRGlyTGlnaHRzIHx8IHBvaW50TGlnaHRPZmZzZXQgPCBudW1Qb2ludExpZ2h0cyB8fCBwcm9iZU9mZnNldCA8IG51bUxpZ2h0UHJvYmVzKSB7XG5cdFx0XHRwYXNzID0gbmV3IFRyaWFuZ2xlTWV0aG9kUGFzcyhNYXRlcmlhbFBhc3NNb2RlLkxJR0hUSU5HKTtcblx0XHRcdHBhc3MuaW5jbHVkZUNhc3RlcnMgPSB0aGlzLl9zaGFkb3dNZXRob2QgPT0gbnVsbDtcblx0XHRcdHBhc3MuZGlyZWN0aW9uYWxMaWdodHNPZmZzZXQgPSBkaXJMaWdodE9mZnNldDtcblx0XHRcdHBhc3MucG9pbnRMaWdodHNPZmZzZXQgPSBwb2ludExpZ2h0T2Zmc2V0O1xuXHRcdFx0cGFzcy5saWdodFByb2Jlc09mZnNldCA9IHByb2JlT2Zmc2V0O1xuXHRcdFx0cGFzcy5saWdodFBpY2tlciA9IHRoaXMuX3BMaWdodFBpY2tlcjtcblx0XHRcdHBhc3MuZGlmZnVzZU1ldGhvZCA9IHRoaXMuX2RpZmZ1c2VNZXRob2Q7XG5cdFx0XHRwYXNzLmFtYmllbnRNZXRob2QgPSB0aGlzLl9hbWJpZW50TWV0aG9kO1xuXHRcdFx0cGFzcy5ub3JtYWxNZXRob2QgPSB0aGlzLl9ub3JtYWxNZXRob2Q7XG5cdFx0XHRwYXNzLnNwZWN1bGFyTWV0aG9kID0gdGhpcy5fc3BlY3VsYXJNZXRob2Q7XG5cdFx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcy5wdXNoKHBhc3MpO1xuXG5cdFx0XHRkaXJMaWdodE9mZnNldCArPSBwYXNzLmlOdW1EaXJlY3Rpb25hbExpZ2h0cztcblx0XHRcdHBvaW50TGlnaHRPZmZzZXQgKz0gcGFzcy5pTnVtUG9pbnRMaWdodHM7XG5cdFx0XHRwcm9iZU9mZnNldCArPSBwYXNzLmlOdW1MaWdodFByb2Jlcztcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZU5vbkNhc3RlckxpZ2h0UGFzc2VzKClcblx0e1xuXHRcdGlmICghdGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcy5sZW5ndGg7ICsraSlcblx0XHRcdHRoaXMuX3BSZW1vdmVTY3JlZW5QYXNzKHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzW2ldKTtcblxuXHRcdHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzID0gbnVsbDtcblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlRWZmZWN0UGFzcygpXG5cdHtcblx0XHRpZiAodGhpcy5fc2NyZWVuUGFzcy5hbWJpZW50TWV0aG9kICE9IHRoaXMuX2FtYmllbnRNZXRob2QpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLmFtYmllbnRNZXRob2QuZGlzcG9zZSgpO1xuXG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MuZGlmZnVzZU1ldGhvZCAhPSB0aGlzLl9kaWZmdXNlTWV0aG9kKVxuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5kaWZmdXNlTWV0aG9kLmRpc3Bvc2UoKTtcblxuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzLnNwZWN1bGFyTWV0aG9kICE9IHRoaXMuX3NwZWN1bGFyTWV0aG9kKVxuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5zcGVjdWxhck1ldGhvZC5kaXNwb3NlKCk7XG5cblx0XHRpZiAodGhpcy5fc2NyZWVuUGFzcy5ub3JtYWxNZXRob2QgIT0gdGhpcy5fbm9ybWFsTWV0aG9kKVxuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5ub3JtYWxNZXRob2QuZGlzcG9zZSgpO1xuXG5cdFx0dGhpcy5fcFJlbW92ZVNjcmVlblBhc3ModGhpcy5fc2NyZWVuUGFzcyk7XG5cdFx0dGhpcy5fc2NyZWVuUGFzcyA9IG51bGw7XG5cdH1cblxuXHRwcml2YXRlIGluaXRFZmZlY3RQYXNzKClcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzID09IG51bGwpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzID0gbmV3IFRyaWFuZ2xlTWV0aG9kUGFzcygpO1xuXG5cdFx0aWYgKHRoaXMuX21hdGVyaWFsTW9kZSA9PSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5TSU5HTEVfUEFTUykge1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5hbWJpZW50TWV0aG9kID0gdGhpcy5fYW1iaWVudE1ldGhvZDtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MuZGlmZnVzZU1ldGhvZCA9IHRoaXMuX2RpZmZ1c2VNZXRob2Q7XG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLnNwZWN1bGFyTWV0aG9kID0gdGhpcy5fc3BlY3VsYXJNZXRob2Q7XG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLm5vcm1hbE1ldGhvZCA9IHRoaXMuX25vcm1hbE1ldGhvZDtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3Muc2hhZG93TWV0aG9kID0gdGhpcy5fc2hhZG93TWV0aG9kO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbWF0ZXJpYWxNb2RlID09IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLk1VTFRJX1BBU1MpIHtcblx0XHRcdGlmICh0aGlzLm51bUxpZ2h0cyA9PSAwKSB7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3MuYW1iaWVudE1ldGhvZCA9IHRoaXMuX2FtYmllbnRNZXRob2Q7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9zY3JlZW5QYXNzLmFtYmllbnRNZXRob2QgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLnByZXNlcnZlQWxwaGEgPSBmYWxzZTtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3Mubm9ybWFsTWV0aG9kID0gdGhpcy5fbm9ybWFsTWV0aG9kO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWF4aW11bSB0b3RhbCBudW1iZXIgb2YgbGlnaHRzIHByb3ZpZGVkIGJ5IHRoZSBsaWdodCBwaWNrZXIuXG5cdCAqL1xuXHRwcml2YXRlIGdldCBudW1MaWdodHMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTGlnaHRQaWNrZXI/IHRoaXMuX3BMaWdodFBpY2tlci5udW1MaWdodFByb2JlcyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1EaXJlY3Rpb25hbExpZ2h0cyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1Qb2ludExpZ2h0cyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1DYXN0aW5nRGlyZWN0aW9uYWxMaWdodHMgKyB0aGlzLl9wTGlnaHRQaWNrZXIubnVtQ2FzdGluZ1BvaW50TGlnaHRzIDogMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIGxpZ2h0cyB0aGF0IGRvbid0IGNhc3Qgc2hhZG93cy5cblx0ICovXG5cdHByaXZhdGUgZ2V0IG51bU5vbkNhc3RlcnMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9wTGlnaHRQaWNrZXI/IHRoaXMuX3BMaWdodFBpY2tlci5udW1MaWdodFByb2JlcyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1EaXJlY3Rpb25hbExpZ2h0cyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1Qb2ludExpZ2h0cyA6IDA7XG5cdH1cbn1cblxuZXhwb3J0ID0gVHJpYW5nbGVNZXRob2RNYXRlcmlhbDsiXX0=