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
var ContextGLCompareMode = require("awayjs-stagegl/lib/base/ContextGLCompareMode");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvdHJpYW5nbGVtZXRob2RtYXRlcmlhbC50cyJdLCJuYW1lcyI6WyJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5jb25zdHJ1Y3RvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubWF0ZXJpYWxNb2RlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5kZXB0aENvbXBhcmVNb2RlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbHBoYSIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuY29sb3JUcmFuc2Zvcm0iLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbWJpZW50TWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5zaGFkb3dNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5ub3JtYWxNZXRob2QiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubnVtRWZmZWN0TWV0aG9kcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaGFzRWZmZWN0TWV0aG9kIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5nZXRFZmZlY3RNZXRob2RBdCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kQXQiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnJlbW92ZUVmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubm9ybWFsTWFwIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5zcGVjdWxhck1hcCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuZ2xvc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmFtYmllbnQiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnNwZWN1bGFyIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5hbWJpZW50Q29sb3IiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmRpZmZ1c2VDb2xvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuc3BlY3VsYXJDb2xvciIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuX2lVcGRhdGVNYXRlcmlhbCIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdFBhc3NlcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuc2V0QmxlbmRBbmRDb21wYXJlTW9kZXMiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmluaXRDYXN0ZXJMaWdodFBhc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLnJlbW92ZUNhc3RlckxpZ2h0UGFzcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdE5vbkNhc3RlckxpZ2h0UGFzc2VzIiwiVHJpYW5nbGVNZXRob2RNYXRlcmlhbC5yZW1vdmVOb25DYXN0ZXJMaWdodFBhc3NlcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwucmVtb3ZlRWZmZWN0UGFzcyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwuaW5pdEVmZmVjdFBhc3MiLCJUcmlhbmdsZU1ldGhvZE1hdGVyaWFsLm51bUxpZ2h0cyIsIlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwubnVtTm9uQ2FzdGVycyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxjQUFjLFdBQWMscUNBQXFDLENBQUMsQ0FBQztBQUMxRSxJQUFPLGFBQWEsV0FBYyx3Q0FBd0MsQ0FBQyxDQUFDO0FBRTVFLElBQU8sU0FBUyxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFFcEUsSUFBTyxpQkFBaUIsV0FBYSw2REFBNkQsQ0FBQyxDQUFDO0FBR3BHLElBQU8sb0JBQW9CLFdBQWEsOENBQThDLENBQUMs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QUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNyREEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7UUFDakVBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLGtCQUFrQkEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7WUFFbENBLEFBRUFBLHFGQUZxRkE7WUFDckZBLGlDQUFpQ0E7WUFDakNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGdCQUFnQkEsR0FBR0EsZ0JBQWdCQSxDQUFDQTtnQkFDbEVBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdEQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtnQkFDeEVBLGtCQUFrQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLENBQUNBO1lBR0RBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLGtCQUFrQkEsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtnQkFDcEZBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxnQkFBZ0JBLENBQUNBO2dCQUNsRUEsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFD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QUdBLENBQUNBLENBQUNBO1FBQzVPQSxDQUFDQTs7O09BQUFwQztJQUtEQSxzQkFBWUEsaURBQWFBO1FBSHpCQTs7V0FFR0E7YUFDSEE7WUFFQ3FDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEdBQUVBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDaEpBLENBQUNBOzs7T0FBQXJDO0lBQ0ZBLDZCQUFDQTtBQUFEQSxDQTdxQkEsQUE2cUJDQSxFQTdxQm9DLG9CQUFvQixFQTZxQnhEO0FBRUQsQUFBZ0MsaUJBQXZCLHNCQUFzQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbIu+7v2ltcG9ydCBDb2xvclRyYW5zZm9ybVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vQ29sb3JUcmFuc2Zvcm1cIik7XG5pbXBvcnQgVGV4dHVyZTJEQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmUyREJhc2VcIik7XG5cbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgQ29udGV4dEdMQ29tcGFyZU1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xDb21wYXJlTW9kZVwiKTtcbmltcG9ydCBBbWJpZW50QmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvQW1iaWVudEJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IERpZmZ1c2VCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9EaWZmdXNlQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgRWZmZWN0TWV0aG9kQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL0VmZmVjdE1ldGhvZEJhc2VcIik7XG5pbXBvcnQgTm9ybWFsQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvTm9ybWFsQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgU2hhZG93TWFwTWV0aG9kQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TaGFkb3dNYXBNZXRob2RCYXNlXCIpO1xuaW1wb3J0IFNwZWN1bGFyQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBNYXRlcmlhbFBhc3NNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9NYXRlcmlhbFBhc3NNb2RlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kUGFzc1x0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvcGFzc2VzL1RyaWFuZ2xlTWV0aG9kUGFzc1wiKTtcbmltcG9ydCBUcmlhbmdsZU1hdGVyaWFsQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvVHJpYW5nbGVNYXRlcmlhbEJhc2VcIik7XG5pbXBvcnQgVHJpYW5nbGVNYXRlcmlhbE1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1RyaWFuZ2xlTWF0ZXJpYWxNb2RlXCIpO1xuXG4vKipcbiAqIFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwgZm9ybXMgYW4gYWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgdGhlIGRlZmF1bHQgc2hhZGVkIG1hdGVyaWFscyBwcm92aWRlZCBieSBTdGFnZSxcbiAqIHVzaW5nIG1hdGVyaWFsIG1ldGhvZHMgdG8gZGVmaW5lIHRoZWlyIGFwcGVhcmFuY2UuXG4gKi9cbmNsYXNzIFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwgZXh0ZW5kcyBUcmlhbmdsZU1hdGVyaWFsQmFzZVxue1xuXHRwcml2YXRlIF9hbHBoYUJsZW5kaW5nOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfYWxwaGE6bnVtYmVyID0gMTtcblx0cHJpdmF0ZSBfY29sb3JUcmFuc2Zvcm06Q29sb3JUcmFuc2Zvcm07XG5cdHByaXZhdGUgX21hdGVyaWFsTW9kZTpzdHJpbmc7XG5cdHByaXZhdGUgX2Nhc3RlckxpZ2h0UGFzczpUcmlhbmdsZU1ldGhvZFBhc3M7XG5cdHByaXZhdGUgX25vbkNhc3RlckxpZ2h0UGFzc2VzOkFycmF5PFRyaWFuZ2xlTWV0aG9kUGFzcz47XG5cdHByaXZhdGUgX3NjcmVlblBhc3M6VHJpYW5nbGVNZXRob2RQYXNzO1xuXG5cdHByaXZhdGUgX2FtYmllbnRNZXRob2Q6QW1iaWVudEJhc2ljTWV0aG9kID0gbmV3IEFtYmllbnRCYXNpY01ldGhvZCgpO1xuXHRwcml2YXRlIF9zaGFkb3dNZXRob2Q6U2hhZG93TWFwTWV0aG9kQmFzZTtcblx0cHJpdmF0ZSBfZGlmZnVzZU1ldGhvZDpEaWZmdXNlQmFzaWNNZXRob2QgPSBuZXcgRGlmZnVzZUJhc2ljTWV0aG9kKCk7XG5cdHByaXZhdGUgX25vcm1hbE1ldGhvZDpOb3JtYWxCYXNpY01ldGhvZCA9IG5ldyBOb3JtYWxCYXNpY01ldGhvZCgpO1xuXHRwcml2YXRlIF9zcGVjdWxhck1ldGhvZDpTcGVjdWxhckJhc2ljTWV0aG9kID0gbmV3IFNwZWN1bGFyQmFzaWNNZXRob2QoKTtcblxuXG5cdHByaXZhdGUgX2RlcHRoQ29tcGFyZU1vZGU6c3RyaW5nID0gQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTDtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHRleHR1cmUgVGhlIHRleHR1cmUgdXNlZCBmb3IgdGhlIG1hdGVyaWFsJ3MgYWxiZWRvIGNvbG9yLlxuXHQgKiBAcGFyYW0gc21vb3RoIEluZGljYXRlcyB3aGV0aGVyIHRoZSB0ZXh0dXJlIHNob3VsZCBiZSBmaWx0ZXJlZCB3aGVuIHNhbXBsZWQuIERlZmF1bHRzIHRvIHRydWUuXG5cdCAqIEBwYXJhbSByZXBlYXQgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHRleHR1cmUgc2hvdWxkIGJlIHRpbGVkIHdoZW4gc2FtcGxlZC4gRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqIEBwYXJhbSBtaXBtYXAgSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IGFueSB1c2VkIHRleHR1cmVzIHNob3VsZCB1c2UgbWlwbWFwcGluZy4gRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih0ZXh0dXJlPzpUZXh0dXJlMkRCYXNlLCBzbW9vdGg/OmJvb2xlYW4sIHJlcGVhdD86Ym9vbGVhbiwgbWlwbWFwPzpib29sZWFuKTtcblx0Y29uc3RydWN0b3IoY29sb3I/Om51bWJlciwgYWxwaGE/Om51bWJlcik7XG5cdGNvbnN0cnVjdG9yKHRleHR1cmVDb2xvcjphbnkgPSBudWxsLCBzbW9vdGhBbHBoYTphbnkgPSBudWxsLCByZXBlYXQ6Ym9vbGVhbiA9IGZhbHNlLCBtaXBtYXA6Ym9vbGVhbiA9IGZhbHNlKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX21hdGVyaWFsTW9kZSA9IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLlNJTkdMRV9QQVNTO1xuXG5cdFx0aWYgKHRleHR1cmVDb2xvciBpbnN0YW5jZW9mIFRleHR1cmUyREJhc2UpIHtcblx0XHRcdHRoaXMudGV4dHVyZSA9IDxUZXh0dXJlMkRCYXNlPiB0ZXh0dXJlQ29sb3I7XG5cblx0XHRcdHRoaXMuc21vb3RoID0gKHNtb290aEFscGhhID09IG51bGwpPyB0cnVlIDogZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGVhdCA9IHJlcGVhdDtcblx0XHRcdHRoaXMubWlwbWFwID0gbWlwbWFwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbG9yID0gKHRleHR1cmVDb2xvciA9PSBudWxsKT8gMHhGRkZGRkYgOiBOdW1iZXIodGV4dHVyZUNvbG9yKTtcblx0XHRcdHRoaXMuYWxwaGEgPSAoc21vb3RoQWxwaGEgPT0gbnVsbCk/IDEgOiBOdW1iZXIoc21vb3RoQWxwaGEpO1xuXHRcdH1cblx0fVxuXG5cblx0cHVibGljIGdldCBtYXRlcmlhbE1vZGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9tYXRlcmlhbE1vZGU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IG1hdGVyaWFsTW9kZSh2YWx1ZTpzdHJpbmcpXG5cdHtcblx0XHRpZiAodGhpcy5fbWF0ZXJpYWxNb2RlID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fbWF0ZXJpYWxNb2RlID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVNjcmVlblBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkZXB0aCBjb21wYXJlIG1vZGUgdXNlZCB0byByZW5kZXIgdGhlIHJlbmRlcmFibGVzIHVzaW5nIHRoaXMgbWF0ZXJpYWwuXG5cdCAqXG5cdCAqIEBzZWUgYXdheS5zdGFnZWdsLkNvbnRleHRHTENvbXBhcmVNb2RlXG5cdCAqL1xuXG5cdHB1YmxpYyBnZXQgZGVwdGhDb21wYXJlTW9kZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRlcHRoQ29tcGFyZU1vZGUodmFsdWU6c3RyaW5nKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2RlcHRoQ29tcGFyZU1vZGUgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9kZXB0aENvbXBhcmVNb2RlID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVNjcmVlblBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbHBoYSBvZiB0aGUgc3VyZmFjZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYWxwaGEoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbHBoYTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYWxwaGEodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHZhbHVlID4gMSlcblx0XHRcdHZhbHVlID0gMTtcblx0XHRlbHNlIGlmICh2YWx1ZSA8IDApXG5cdFx0XHR2YWx1ZSA9IDA7XG5cblx0XHRpZiAodGhpcy5fYWxwaGEgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9hbHBoYSA9IHZhbHVlO1xuXG5cdFx0aWYgKHRoaXMuX2NvbG9yVHJhbnNmb3JtID09IG51bGwpXG5cdFx0XHR0aGlzLl9jb2xvclRyYW5zZm9ybSA9IG5ldyBDb2xvclRyYW5zZm9ybSgpO1xuXG5cdFx0dGhpcy5fY29sb3JUcmFuc2Zvcm0uYWxwaGFNdWx0aXBsaWVyID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb2xvclRyYW5zZm9ybSBvYmplY3QgdG8gdHJhbnNmb3JtIHRoZSBjb2xvdXIgb2YgdGhlIG1hdGVyaWFsIHdpdGguIERlZmF1bHRzIHRvIG51bGwuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbG9yVHJhbnNmb3JtKCk6Q29sb3JUcmFuc2Zvcm1cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY3JlZW5QYXNzLmNvbG9yVHJhbnNmb3JtO1xuXHR9XG5cblx0cHVibGljIHNldCBjb2xvclRyYW5zZm9ybSh2YWx1ZTpDb2xvclRyYW5zZm9ybSlcblx0e1xuXHRcdHRoaXMuX3NjcmVlblBhc3MuY29sb3JUcmFuc2Zvcm0gPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGV4dHVyZSBvYmplY3QgdG8gdXNlIGZvciB0aGUgYW1iaWVudCBjb2xvdXIuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGRpZmZ1c2VUZXh0dXJlKCk6VGV4dHVyZTJEQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RpZmZ1c2VNZXRob2QudGV4dHVyZTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZGlmZnVzZVRleHR1cmUodmFsdWU6VGV4dHVyZTJEQmFzZSlcblx0e1xuXHRcdHRoaXMuX2RpZmZ1c2VNZXRob2QudGV4dHVyZSA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgYW1iaWVudCBsaWdodGluZyBjb250cmlidXRpb24uIERlZmF1bHRzIHRvIEFtYmllbnRCYXNpY01ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW1iaWVudE1ldGhvZCgpOkFtYmllbnRCYXNpY01ldGhvZFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FtYmllbnRNZXRob2Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFtYmllbnRNZXRob2QodmFsdWU6QW1iaWVudEJhc2ljTWV0aG9kKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2FtYmllbnRNZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodmFsdWUgJiYgdGhpcy5fYW1iaWVudE1ldGhvZClcblx0XHRcdHZhbHVlLmNvcHlGcm9tKHRoaXMuX2FtYmllbnRNZXRob2QpO1xuXG5cdFx0dGhpcy5fYW1iaWVudE1ldGhvZCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHVzZWQgdG8gcmVuZGVyIHNoYWRvd3MgY2FzdCBvbiB0aGlzIHN1cmZhY2UsIG9yIG51bGwgaWYgbm8gc2hhZG93cyBhcmUgdG8gYmUgcmVuZGVyZWQuIERlZmF1bHRzIHRvIG51bGwuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNoYWRvd01ldGhvZCgpOlNoYWRvd01hcE1ldGhvZEJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zaGFkb3dNZXRob2Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNoYWRvd01ldGhvZCh2YWx1ZTpTaGFkb3dNYXBNZXRob2RCYXNlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NoYWRvd01ldGhvZCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh2YWx1ZSAmJiB0aGlzLl9zaGFkb3dNZXRob2QpXG5cdFx0XHR2YWx1ZS5jb3B5RnJvbSh0aGlzLl9zaGFkb3dNZXRob2QpO1xuXG5cdFx0dGhpcy5fc2hhZG93TWV0aG9kID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVNjcmVlblBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgZGlmZnVzZSBsaWdodGluZyBjb250cmlidXRpb24uIERlZmF1bHRzIHRvIERpZmZ1c2VCYXNpY01ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgZGlmZnVzZU1ldGhvZCgpOkRpZmZ1c2VCYXNpY01ldGhvZFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RpZmZ1c2VNZXRob2Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRpZmZ1c2VNZXRob2QodmFsdWU6RGlmZnVzZUJhc2ljTWV0aG9kKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2RpZmZ1c2VNZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodmFsdWUgJiYgdGhpcy5fZGlmZnVzZU1ldGhvZClcblx0XHRcdHZhbHVlLmNvcHlGcm9tKHRoaXMuX2RpZmZ1c2VNZXRob2QpO1xuXG5cdFx0dGhpcy5fZGlmZnVzZU1ldGhvZCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgcHJvdmlkZXMgdGhlIHNwZWN1bGFyIGxpZ2h0aW5nIGNvbnRyaWJ1dGlvbi4gRGVmYXVsdHMgdG8gU3BlY3VsYXJCYXNpY01ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgc3BlY3VsYXJNZXRob2QoKTpTcGVjdWxhckJhc2ljTWV0aG9kXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BlY3VsYXJNZXRob2Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNwZWN1bGFyTWV0aG9kKHZhbHVlOlNwZWN1bGFyQmFzaWNNZXRob2QpXG5cdHtcblx0XHRpZiAodGhpcy5fc3BlY3VsYXJNZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodmFsdWUgJiYgdGhpcy5fc3BlY3VsYXJNZXRob2QpXG5cdFx0XHR2YWx1ZS5jb3B5RnJvbSh0aGlzLl9zcGVjdWxhck1ldGhvZCk7XG5cblx0XHR0aGlzLl9zcGVjdWxhck1ldGhvZCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHBlci1waXhlbCBub3JtYWxzLiBEZWZhdWx0cyB0byBOb3JtYWxCYXNpY01ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgbm9ybWFsTWV0aG9kKCk6Tm9ybWFsQmFzaWNNZXRob2Rcblx0e1xuXHRcdHJldHVybiB0aGlzLl9ub3JtYWxNZXRob2Q7XG5cdH1cblxuXHRwdWJsaWMgc2V0IG5vcm1hbE1ldGhvZCh2YWx1ZTpOb3JtYWxCYXNpY01ldGhvZClcblx0e1xuXHRcdGlmICh0aGlzLl9ub3JtYWxNZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodmFsdWUgJiYgdGhpcy5fbm9ybWFsTWV0aG9kKVxuXHRcdFx0dmFsdWUuY29weUZyb20odGhpcy5fbm9ybWFsTWV0aG9kKTtcblxuXHRcdHRoaXMuX25vcm1hbE1ldGhvZCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBlbmRzIGFuIFwiZWZmZWN0XCIgc2hhZGluZyBtZXRob2QgdG8gdGhlIHNoYWRlci4gRWZmZWN0IG1ldGhvZHMgYXJlIHRob3NlIHRoYXQgZG8gbm90IGluZmx1ZW5jZSB0aGUgbGlnaHRpbmdcblx0ICogYnV0IG1vZHVsYXRlIHRoZSBzaGFkZWQgY29sb3VyLCB1c2VkIGZvciBmb2csIG91dGxpbmVzLCBldGMuIFRoZSBtZXRob2Qgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSByZXN1bHQgb2YgdGhlXG5cdCAqIG1ldGhvZHMgYWRkZWQgcHJpb3IuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRWZmZWN0TWV0aG9kKG1ldGhvZDpFZmZlY3RNZXRob2RCYXNlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MgPT0gbnVsbClcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MgPSBuZXcgVHJpYW5nbGVNZXRob2RQYXNzKCk7XG5cblx0XHR0aGlzLl9zY3JlZW5QYXNzLmFkZEVmZmVjdE1ldGhvZChtZXRob2QpO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVTY3JlZW5QYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbnVtYmVyIG9mIFwiZWZmZWN0XCIgbWV0aG9kcyBhZGRlZCB0byB0aGUgbWF0ZXJpYWwuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bUVmZmVjdE1ldGhvZHMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY3JlZW5QYXNzPyB0aGlzLl9zY3JlZW5QYXNzLm51bUVmZmVjdE1ldGhvZHMgOiAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFF1ZXJpZXMgd2hldGhlciBhIGdpdmVuIGVmZmVjdCBtZXRob2Qgd2FzIGFkZGVkIHRvIHRoZSBtYXRlcmlhbC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZCBUaGUgbWV0aG9kIHRvIGJlIHF1ZXJpZWQuXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgbWV0aG9kIHdhcyBhZGRlZCB0byB0aGUgbWF0ZXJpYWwsIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdHB1YmxpYyBoYXNFZmZlY3RNZXRob2QobWV0aG9kOkVmZmVjdE1ldGhvZEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY3JlZW5QYXNzPyB0aGlzLl9zY3JlZW5QYXNzLmhhc0VmZmVjdE1ldGhvZChtZXRob2QpIDogZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0aG9kIGFkZGVkIGF0IHRoZSBnaXZlbiBpbmRleC5cblx0ICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgbWV0aG9kIHRvIHJldHJpZXZlLlxuXHQgKiBAcmV0dXJuIFRoZSBtZXRob2QgYXQgdGhlIGdpdmVuIGluZGV4LlxuXHQgKi9cblx0cHVibGljIGdldEVmZmVjdE1ldGhvZEF0KGluZGV4Om51bWJlcik6RWZmZWN0TWV0aG9kQmFzZVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MgPT0gbnVsbClcblx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3NjcmVlblBhc3MuZ2V0RWZmZWN0TWV0aG9kQXQoaW5kZXgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gZWZmZWN0IG1ldGhvZCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IGFtb25nc3QgdGhlIG1ldGhvZHMgYWxyZWFkeSBhZGRlZCB0byB0aGUgbWF0ZXJpYWwuIEVmZmVjdFxuXHQgKiBtZXRob2RzIGFyZSB0aG9zZSB0aGF0IGRvIG5vdCBpbmZsdWVuY2UgdGhlIGxpZ2h0aW5nIGJ1dCBtb2R1bGF0ZSB0aGUgc2hhZGVkIGNvbG91ciwgdXNlZCBmb3IgZm9nLCBvdXRsaW5lcyxcblx0ICogZXRjLiBUaGUgbWV0aG9kIHdpbGwgYmUgYXBwbGllZCB0byB0aGUgcmVzdWx0IG9mIHRoZSBtZXRob2RzIHdpdGggYSBsb3dlciBpbmRleC5cblx0ICovXG5cdHB1YmxpYyBhZGRFZmZlY3RNZXRob2RBdChtZXRob2Q6RWZmZWN0TWV0aG9kQmFzZSwgaW5kZXg6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MgPT0gbnVsbClcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MgPSBuZXcgVHJpYW5nbGVNZXRob2RQYXNzKCk7XG5cblx0XHR0aGlzLl9zY3JlZW5QYXNzLmFkZEVmZmVjdE1ldGhvZEF0KG1ldGhvZCwgaW5kZXgpO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIGVmZmVjdCBtZXRob2QgZnJvbSB0aGUgbWF0ZXJpYWwuXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBiZSByZW1vdmVkLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUVmZmVjdE1ldGhvZChtZXRob2Q6RWZmZWN0TWV0aG9kQmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzID09IG51bGwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9zY3JlZW5QYXNzLnJlbW92ZUVmZmVjdE1ldGhvZChtZXRob2QpO1xuXG5cdFx0Ly8gcmVjb25zaWRlclxuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzLm51bUVmZmVjdE1ldGhvZHMgPT0gMClcblx0XHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5vcm1hbCBtYXAgdG8gbW9kdWxhdGUgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3VyZmFjZSBmb3IgZWFjaCB0ZXhlbC4gVGhlIGRlZmF1bHQgbm9ybWFsIG1ldGhvZCBleHBlY3RzXG5cdCAqIHRhbmdlbnQtc3BhY2Ugbm9ybWFsIG1hcHMsIGJ1dCBvdGhlcnMgY291bGQgZXhwZWN0IG9iamVjdC1zcGFjZSBtYXBzLlxuXHQgKi9cblx0cHVibGljIGdldCBub3JtYWxNYXAoKTpUZXh0dXJlMkRCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbm9ybWFsTWV0aG9kLm5vcm1hbE1hcDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgbm9ybWFsTWFwKHZhbHVlOlRleHR1cmUyREJhc2UpXG5cdHtcblx0XHR0aGlzLl9ub3JtYWxNZXRob2Qubm9ybWFsTWFwID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogQSBzcGVjdWxhciBtYXAgdGhhdCBkZWZpbmVzIHRoZSBzdHJlbmd0aCBvZiBzcGVjdWxhciByZWZsZWN0aW9ucyBmb3IgZWFjaCB0ZXhlbCBpbiB0aGUgcmVkIGNoYW5uZWwsXG5cdCAqIGFuZCB0aGUgZ2xvc3MgZmFjdG9yIGluIHRoZSBncmVlbiBjaGFubmVsLiBZb3UgY2FuIHVzZSBTcGVjdWxhckJpdG1hcFRleHR1cmUgaWYgeW91IHdhbnQgdG8gZWFzaWx5IHNldFxuXHQgKiBzcGVjdWxhciBhbmQgZ2xvc3MgbWFwcyBmcm9tIGdyYXlzY2FsZSBpbWFnZXMsIGJ1dCBjb3JyZWN0bHkgYXV0aG9yZWQgaW1hZ2VzIGFyZSBwcmVmZXJyZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNwZWN1bGFyTWFwKCk6VGV4dHVyZTJEQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwZWN1bGFyTWV0aG9kLnRleHR1cmU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNwZWN1bGFyTWFwKHZhbHVlOlRleHR1cmUyREJhc2UpXG5cdHtcblx0XHR0aGlzLl9zcGVjdWxhck1ldGhvZC50ZXh0dXJlID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGdsb3NzaW5lc3Mgb2YgdGhlIG1hdGVyaWFsIChzaGFycG5lc3Mgb2YgdGhlIHNwZWN1bGFyIGhpZ2hsaWdodCkuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGdsb3NzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BlY3VsYXJNZXRob2QuZ2xvc3M7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGdsb3NzKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3NwZWN1bGFyTWV0aG9kLmdsb3NzID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHN0cmVuZ3RoIG9mIHRoZSBhbWJpZW50IHJlZmxlY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFtYmllbnQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbWJpZW50TWV0aG9kLmFtYmllbnQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFtYmllbnQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fYW1iaWVudE1ldGhvZC5hbWJpZW50ID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG92ZXJhbGwgc3RyZW5ndGggb2YgdGhlIHNwZWN1bGFyIHJlZmxlY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHNwZWN1bGFyKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BlY3VsYXJNZXRob2Quc3BlY3VsYXI7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNwZWN1bGFyKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3NwZWN1bGFyTWV0aG9kLnNwZWN1bGFyID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbG91ciBvZiB0aGUgYW1iaWVudCByZWZsZWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCBhbWJpZW50Q29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kaWZmdXNlTWV0aG9kLmFtYmllbnRDb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYW1iaWVudENvbG9yKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2RpZmZ1c2VNZXRob2QuYW1iaWVudENvbG9yID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbG91ciBvZiB0aGUgZGlmZnVzZSByZWZsZWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCBkaWZmdXNlQ29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kaWZmdXNlTWV0aG9kLmRpZmZ1c2VDb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZGlmZnVzZUNvbG9yKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2RpZmZ1c2VNZXRob2QuZGlmZnVzZUNvbG9yID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbG91ciBvZiB0aGUgc3BlY3VsYXIgcmVmbGVjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgc3BlY3VsYXJDb2xvcigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwZWN1bGFyTWV0aG9kLnNwZWN1bGFyQ29sb3I7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNwZWN1bGFyQ29sb3IodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fc3BlY3VsYXJNZXRob2Quc3BlY3VsYXJDb2xvciA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0ZXJpYWwgaGFzIHRyYW5zcGFyZW5jeS4gSWYgYmluYXJ5IHRyYW5zcGFyZW5jeSBpcyBzdWZmaWNpZW50LCBmb3Jcblx0ICogZXhhbXBsZSB3aGVuIHVzaW5nIHRleHR1cmVzIG9mIGZvbGlhZ2UsIGNvbnNpZGVyIHVzaW5nIGFscGhhVGhyZXNob2xkIGluc3RlYWQuXG5cdCAqL1xuXG5cdHB1YmxpYyBnZXQgYWxwaGFCbGVuZGluZygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbHBoYUJsZW5kaW5nO1xuXHR9XG5cblx0cHVibGljIHNldCBhbHBoYUJsZW5kaW5nKHZhbHVlOmJvb2xlYW4pXG5cdHtcblx0XHRpZiAodGhpcy5fYWxwaGFCbGVuZGluZyA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2FscGhhQmxlbmRpbmcgPSB2YWx1ZTtcblxuXHRcdHRoaXMuX3BJbnZhbGlkYXRlUGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBfaVVwZGF0ZU1hdGVyaWFsKClcblx0e1xuXHRcdGlmICh0aGlzLl9wU2NyZWVuUGFzc2VzSW52YWxpZCkge1xuXHRcdFx0Ly9VcGRhdGVzIHNjcmVlbiBwYXNzZXMgd2hlbiB0aGV5IHdlcmUgZm91bmQgdG8gYmUgaW52YWxpZC5cblx0XHRcdHRoaXMuX3BTY3JlZW5QYXNzZXNJbnZhbGlkID0gZmFsc2U7XG5cblx0XHRcdHRoaXMuaW5pdFBhc3NlcygpO1xuXG5cdFx0XHR0aGlzLnNldEJsZW5kQW5kQ29tcGFyZU1vZGVzKCk7XG5cblx0XHRcdHRoaXMuX3BDbGVhclNjcmVlblBhc3NlcygpO1xuXG5cdFx0XHRpZiAodGhpcy5fbWF0ZXJpYWxNb2RlID09IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLk1VTFRJX1BBU1MpIHtcblx0XHRcdFx0aWYgKHRoaXMuX2Nhc3RlckxpZ2h0UGFzcylcblx0XHRcdFx0XHR0aGlzLl9wQWRkU2NyZWVuUGFzcyh0aGlzLl9jYXN0ZXJMaWdodFBhc3MpO1xuXG5cdFx0XHRcdGlmICh0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcylcblx0XHRcdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcy5sZW5ndGg7ICsraSlcblx0XHRcdFx0XHRcdHRoaXMuX3BBZGRTY3JlZW5QYXNzKHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzW2ldKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MpXG5cdFx0XHRcdHRoaXMuX3BBZGRTY3JlZW5QYXNzKHRoaXMuX3NjcmVlblBhc3MpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyBhbGwgdGhlIHBhc3NlcyBhbmQgdGhlaXIgZGVwZW5kZW50IHBhc3Nlcy5cblx0ICovXG5cdHByaXZhdGUgaW5pdFBhc3NlcygpXG5cdHtcblx0XHQvLyBsZXQgdGhlIGVmZmVjdHMgcGFzcyBoYW5kbGUgZXZlcnl0aGluZyBpZiB0aGVyZSBhcmUgbm8gbGlnaHRzLCB3aGVuIHRoZXJlIGFyZSBlZmZlY3QgbWV0aG9kcyBhcHBsaWVkXG5cdFx0Ly8gYWZ0ZXIgc2hhZGluZywgb3Igd2hlbiB0aGUgbWF0ZXJpYWwgbW9kZSBpcyBzaW5nbGUgcGFzcy5cblx0XHRpZiAodGhpcy5udW1MaWdodHMgPT0gMCB8fCB0aGlzLm51bUVmZmVjdE1ldGhvZHMgPiAwIHx8IHRoaXMuX21hdGVyaWFsTW9kZSA9PSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5TSU5HTEVfUEFTUylcblx0XHRcdHRoaXMuaW5pdEVmZmVjdFBhc3MoKTtcblx0XHRlbHNlIGlmICh0aGlzLl9zY3JlZW5QYXNzKVxuXHRcdFx0dGhpcy5yZW1vdmVFZmZlY3RQYXNzKCk7XG5cblx0XHQvLyBvbmx5IHVzZSBhIGNhc3RlciBsaWdodCBwYXNzIGlmIHNoYWRvd3MgbmVlZCB0byBiZSByZW5kZXJlZFxuXHRcdGlmICh0aGlzLl9zaGFkb3dNZXRob2QgJiYgdGhpcy5fbWF0ZXJpYWxNb2RlID09IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLk1VTFRJX1BBU1MpXG5cdFx0XHR0aGlzLmluaXRDYXN0ZXJMaWdodFBhc3MoKTtcblx0XHRlbHNlIGlmICh0aGlzLl9jYXN0ZXJMaWdodFBhc3MpXG5cdFx0XHR0aGlzLnJlbW92ZUNhc3RlckxpZ2h0UGFzcygpO1xuXG5cdFx0Ly8gb25seSB1c2Ugbm9uIGNhc3RlciBsaWdodCBwYXNzZXMgaWYgdGhlcmUgYXJlIGxpZ2h0cyB0aGF0IGRvbid0IGNhc3Rcblx0XHRpZiAodGhpcy5udW1Ob25DYXN0ZXJzID4gMCAmJiB0aGlzLl9tYXRlcmlhbE1vZGUgPT0gVHJpYW5nbGVNYXRlcmlhbE1vZGUuTVVMVElfUEFTUylcblx0XHRcdHRoaXMuaW5pdE5vbkNhc3RlckxpZ2h0UGFzc2VzKCk7XG5cdFx0ZWxzZSBpZiAodGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMpXG5cdFx0XHR0aGlzLnJlbW92ZU5vbkNhc3RlckxpZ2h0UGFzc2VzKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB1cCB0aGUgdmFyaW91cyBibGVuZGluZyBtb2RlcyBmb3IgYWxsIHNjcmVlbiBwYXNzZXMsIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IHRoZXJlIGFyZSBwcmV2aW91cyBwYXNzZXMuXG5cdCAqL1xuXHRwcml2YXRlIHNldEJsZW5kQW5kQ29tcGFyZU1vZGVzKClcblx0e1xuXHRcdHZhciBmb3JjZVNlcGFyYXRlTVZQOmJvb2xlYW4gPSBCb29sZWFuKHRoaXMuX2Nhc3RlckxpZ2h0UGFzcyB8fCB0aGlzLl9zY3JlZW5QYXNzKTtcblxuXHRcdC8vIGNhc3RlciBsaWdodCBwYXNzIGlzIGFsd2F5cyBmaXJzdCBpZiBpdCBleGlzdHMsIGhlbmNlIGl0IHVzZXMgbm9ybWFsIGJsZW5kaW5nXG5cdFx0aWYgKHRoaXMuX2Nhc3RlckxpZ2h0UGFzcykge1xuXHRcdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzLmZvcmNlU2VwYXJhdGVNVlAgPSBmb3JjZVNlcGFyYXRlTVZQO1xuXHRcdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzLnNldEJsZW5kTW9kZShCbGVuZE1vZGUuTk9STUFMKTtcblx0XHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5kZXB0aENvbXBhcmVNb2RlID0gdGhpcy5fZGVwdGhDb21wYXJlTW9kZTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMpIHtcblx0XHRcdHZhciBmaXJzdEFkZGl0aXZlSW5kZXg6bnVtYmVyID0gMDtcblxuXHRcdFx0Ly8gaWYgdGhlcmUncyBubyBjYXN0ZXIgbGlnaHQgcGFzcywgdGhlIGZpcnN0IG5vbiBjYXN0ZXIgbGlnaHQgcGFzcyB3aWxsIGJlIHRoZSBmaXJzdFxuXHRcdFx0Ly8gYW5kIHNob3VsZCB1c2Ugbm9ybWFsIGJsZW5kaW5nXG5cdFx0XHRpZiAoIXRoaXMuX2Nhc3RlckxpZ2h0UGFzcykge1xuXHRcdFx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlc1swXS5mb3JjZVNlcGFyYXRlTVZQID0gZm9yY2VTZXBhcmF0ZU1WUDtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbMF0uc2V0QmxlbmRNb2RlKEJsZW5kTW9kZS5OT1JNQUwpO1xuXHRcdFx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlc1swXS5kZXB0aENvbXBhcmVNb2RlID0gdGhpcy5fZGVwdGhDb21wYXJlTW9kZTtcblx0XHRcdFx0Zmlyc3RBZGRpdGl2ZUluZGV4ID0gMTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gYWxsIGxpZ2h0aW5nIHBhc3NlcyBmb2xsb3dpbmcgdGhlIGZpcnN0IGxpZ2h0IHBhc3Mgc2hvdWxkIHVzZSBhZGRpdGl2ZSBibGVuZGluZ1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSBmaXJzdEFkZGl0aXZlSW5kZXg7IGkgPCB0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcy5sZW5ndGg7ICsraSkge1xuXHRcdFx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlc1tpXS5mb3JjZVNlcGFyYXRlTVZQID0gZm9yY2VTZXBhcmF0ZU1WUDtcblx0XHRcdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbaV0uc2V0QmxlbmRNb2RlKEJsZW5kTW9kZS5BREQpO1xuXHRcdFx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlc1tpXS5kZXB0aENvbXBhcmVNb2RlID0gQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY2FzdGVyTGlnaHRQYXNzIHx8IHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzKSB7XG5cdFx0XHQvL2Nhbm5vdCBiZSBibGVuZGVkIGJ5IGJsZW5kbW9kZSBwcm9wZXJ0eSBpZiBtdWx0aXBhc3MgZW5hYmxlZFxuXHRcdFx0dGhpcy5fcFJlcXVpcmVzQmxlbmRpbmcgPSBmYWxzZTtcblxuXHRcdFx0Ly8gdGhlcmUgYXJlIGxpZ2h0IHBhc3Nlcywgc28gdGhpcyBzaG91bGQgYmUgYmxlbmRlZCBpblxuXHRcdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MpIHtcblx0XHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5wYXNzTW9kZSA9IE1hdGVyaWFsUGFzc01vZGUuRUZGRUNUUztcblx0XHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5kZXB0aENvbXBhcmVNb2RlID0gQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTDtcblx0XHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5zZXRCbGVuZE1vZGUoQmxlbmRNb2RlLkxBWUVSKTtcblx0XHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5mb3JjZVNlcGFyYXRlTVZQID0gZm9yY2VTZXBhcmF0ZU1WUDtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAodGhpcy5fc2NyZWVuUGFzcykge1xuXHRcdFx0dGhpcy5fcFJlcXVpcmVzQmxlbmRpbmcgPSAodGhpcy5fcEJsZW5kTW9kZSAhPSBCbGVuZE1vZGUuTk9STUFMIHx8IHRoaXMuX2FscGhhQmxlbmRpbmcgfHwgKHRoaXMuX2NvbG9yVHJhbnNmb3JtICYmIHRoaXMuX2NvbG9yVHJhbnNmb3JtLmFscGhhTXVsdGlwbGllciA8IDEpKTtcblx0XHRcdC8vIGVmZmVjdHMgcGFzcyBpcyB0aGUgb25seSBwYXNzLCBzbyBpdCBzaG91bGQganVzdCBibGVuZCBub3JtYWxseVxuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5wYXNzTW9kZSA9IE1hdGVyaWFsUGFzc01vZGUuU1VQRVJfU0hBREVSO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5kZXB0aENvbXBhcmVNb2RlID0gdGhpcy5fZGVwdGhDb21wYXJlTW9kZTtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MucHJlc2VydmVBbHBoYSA9IHRoaXMuX3BSZXF1aXJlc0JsZW5kaW5nO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5jb2xvclRyYW5zZm9ybSA9IHRoaXMuX2NvbG9yVHJhbnNmb3JtO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5zZXRCbGVuZE1vZGUoKHRoaXMuX3BCbGVuZE1vZGUgPT0gQmxlbmRNb2RlLk5PUk1BTCAmJiB0aGlzLl9wUmVxdWlyZXNCbGVuZGluZyk/IEJsZW5kTW9kZS5MQVlFUiA6IHRoaXMuX3BCbGVuZE1vZGUpO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5mb3JjZVNlcGFyYXRlTVZQID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBpbml0Q2FzdGVyTGlnaHRQYXNzKClcblx0e1xuXG5cdFx0aWYgKHRoaXMuX2Nhc3RlckxpZ2h0UGFzcyA9PSBudWxsKVxuXHRcdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzID0gbmV3IFRyaWFuZ2xlTWV0aG9kUGFzcyhNYXRlcmlhbFBhc3NNb2RlLkxJR0hUSU5HKTtcblxuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5fc2hhZG93TWV0aG9kLmNhc3RpbmdMaWdodF0pO1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5zaGFkb3dNZXRob2QgPSB0aGlzLl9zaGFkb3dNZXRob2Q7XG5cdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzLmRpZmZ1c2VNZXRob2QgPSB0aGlzLl9kaWZmdXNlTWV0aG9kO1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5hbWJpZW50TWV0aG9kID0gdGhpcy5fYW1iaWVudE1ldGhvZDtcblx0XHR0aGlzLl9jYXN0ZXJMaWdodFBhc3Mubm9ybWFsTWV0aG9kID0gdGhpcy5fbm9ybWFsTWV0aG9kO1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcy5zcGVjdWxhck1ldGhvZCA9IHRoaXMuX3NwZWN1bGFyTWV0aG9kO1xuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVDYXN0ZXJMaWdodFBhc3MoKVxuXHR7XG5cdFx0dGhpcy5fY2FzdGVyTGlnaHRQYXNzLmRpc3Bvc2UoKTtcblx0XHR0aGlzLl9wUmVtb3ZlU2NyZWVuUGFzcyh0aGlzLl9jYXN0ZXJMaWdodFBhc3MpO1xuXHRcdHRoaXMuX2Nhc3RlckxpZ2h0UGFzcyA9IG51bGw7XG5cdH1cblxuXHRwcml2YXRlIGluaXROb25DYXN0ZXJMaWdodFBhc3NlcygpXG5cdHtcblx0XHR0aGlzLnJlbW92ZU5vbkNhc3RlckxpZ2h0UGFzc2VzKCk7XG5cdFx0dmFyIHBhc3M6VHJpYW5nbGVNZXRob2RQYXNzO1xuXHRcdHZhciBudW1EaXJMaWdodHM6bnVtYmVyID0gdGhpcy5fcExpZ2h0UGlja2VyLm51bURpcmVjdGlvbmFsTGlnaHRzO1xuXHRcdHZhciBudW1Qb2ludExpZ2h0czpudW1iZXIgPSB0aGlzLl9wTGlnaHRQaWNrZXIubnVtUG9pbnRMaWdodHM7XG5cdFx0dmFyIG51bUxpZ2h0UHJvYmVzOm51bWJlciA9IHRoaXMuX3BMaWdodFBpY2tlci5udW1MaWdodFByb2Jlcztcblx0XHR2YXIgZGlyTGlnaHRPZmZzZXQ6bnVtYmVyID0gMDtcblx0XHR2YXIgcG9pbnRMaWdodE9mZnNldDpudW1iZXIgPSAwO1xuXHRcdHZhciBwcm9iZU9mZnNldDpudW1iZXIgPSAwO1xuXG5cdFx0aWYgKCF0aGlzLl9jYXN0ZXJMaWdodFBhc3MpIHtcblx0XHRcdG51bURpckxpZ2h0cyArPSB0aGlzLl9wTGlnaHRQaWNrZXIubnVtQ2FzdGluZ0RpcmVjdGlvbmFsTGlnaHRzO1xuXHRcdFx0bnVtUG9pbnRMaWdodHMgKz0gdGhpcy5fcExpZ2h0UGlja2VyLm51bUNhc3RpbmdQb2ludExpZ2h0cztcblx0XHR9XG5cblx0XHR0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3NlcyA9IG5ldyBBcnJheTxUcmlhbmdsZU1ldGhvZFBhc3M+KCk7XG5cblx0XHR3aGlsZSAoZGlyTGlnaHRPZmZzZXQgPCBudW1EaXJMaWdodHMgfHwgcG9pbnRMaWdodE9mZnNldCA8IG51bVBvaW50TGlnaHRzIHx8IHByb2JlT2Zmc2V0IDwgbnVtTGlnaHRQcm9iZXMpIHtcblx0XHRcdHBhc3MgPSBuZXcgVHJpYW5nbGVNZXRob2RQYXNzKE1hdGVyaWFsUGFzc01vZGUuTElHSFRJTkcpO1xuXHRcdFx0cGFzcy5pbmNsdWRlQ2FzdGVycyA9IHRoaXMuX3NoYWRvd01ldGhvZCA9PSBudWxsO1xuXHRcdFx0cGFzcy5kaXJlY3Rpb25hbExpZ2h0c09mZnNldCA9IGRpckxpZ2h0T2Zmc2V0O1xuXHRcdFx0cGFzcy5wb2ludExpZ2h0c09mZnNldCA9IHBvaW50TGlnaHRPZmZzZXQ7XG5cdFx0XHRwYXNzLmxpZ2h0UHJvYmVzT2Zmc2V0ID0gcHJvYmVPZmZzZXQ7XG5cdFx0XHRwYXNzLmxpZ2h0UGlja2VyID0gdGhpcy5fcExpZ2h0UGlja2VyO1xuXHRcdFx0cGFzcy5kaWZmdXNlTWV0aG9kID0gdGhpcy5fZGlmZnVzZU1ldGhvZDtcblx0XHRcdHBhc3MuYW1iaWVudE1ldGhvZCA9IHRoaXMuX2FtYmllbnRNZXRob2Q7XG5cdFx0XHRwYXNzLm5vcm1hbE1ldGhvZCA9IHRoaXMuX25vcm1hbE1ldGhvZDtcblx0XHRcdHBhc3Muc3BlY3VsYXJNZXRob2QgPSB0aGlzLl9zcGVjdWxhck1ldGhvZDtcblx0XHRcdHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzLnB1c2gocGFzcyk7XG5cblx0XHRcdGRpckxpZ2h0T2Zmc2V0ICs9IHBhc3MuaU51bURpcmVjdGlvbmFsTGlnaHRzO1xuXHRcdFx0cG9pbnRMaWdodE9mZnNldCArPSBwYXNzLmlOdW1Qb2ludExpZ2h0cztcblx0XHRcdHByb2JlT2Zmc2V0ICs9IHBhc3MuaU51bUxpZ2h0UHJvYmVzO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlTm9uQ2FzdGVyTGlnaHRQYXNzZXMoKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9ub25DYXN0ZXJMaWdodFBhc3Nlcylcblx0XHRcdHJldHVybjtcblxuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IHRoaXMuX25vbkNhc3RlckxpZ2h0UGFzc2VzLmxlbmd0aDsgKytpKVxuXHRcdFx0dGhpcy5fcFJlbW92ZVNjcmVlblBhc3ModGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXNbaV0pO1xuXG5cdFx0dGhpcy5fbm9uQ2FzdGVyTGlnaHRQYXNzZXMgPSBudWxsO1xuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVFZmZlY3RQYXNzKClcblx0e1xuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzLmFtYmllbnRNZXRob2QgIT0gdGhpcy5fYW1iaWVudE1ldGhvZClcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MuYW1iaWVudE1ldGhvZC5kaXNwb3NlKCk7XG5cblx0XHRpZiAodGhpcy5fc2NyZWVuUGFzcy5kaWZmdXNlTWV0aG9kICE9IHRoaXMuX2RpZmZ1c2VNZXRob2QpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLmRpZmZ1c2VNZXRob2QuZGlzcG9zZSgpO1xuXG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3Muc3BlY3VsYXJNZXRob2QgIT0gdGhpcy5fc3BlY3VsYXJNZXRob2QpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLnNwZWN1bGFyTWV0aG9kLmRpc3Bvc2UoKTtcblxuXHRcdGlmICh0aGlzLl9zY3JlZW5QYXNzLm5vcm1hbE1ldGhvZCAhPSB0aGlzLl9ub3JtYWxNZXRob2QpXG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLm5vcm1hbE1ldGhvZC5kaXNwb3NlKCk7XG5cblx0XHR0aGlzLl9wUmVtb3ZlU2NyZWVuUGFzcyh0aGlzLl9zY3JlZW5QYXNzKTtcblx0XHR0aGlzLl9zY3JlZW5QYXNzID0gbnVsbDtcblx0fVxuXG5cdHByaXZhdGUgaW5pdEVmZmVjdFBhc3MoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3NjcmVlblBhc3MgPT0gbnVsbClcblx0XHRcdHRoaXMuX3NjcmVlblBhc3MgPSBuZXcgVHJpYW5nbGVNZXRob2RQYXNzKCk7XG5cblx0XHRpZiAodGhpcy5fbWF0ZXJpYWxNb2RlID09IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLlNJTkdMRV9QQVNTKSB7XG5cdFx0XHR0aGlzLl9zY3JlZW5QYXNzLmFtYmllbnRNZXRob2QgPSB0aGlzLl9hbWJpZW50TWV0aG9kO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5kaWZmdXNlTWV0aG9kID0gdGhpcy5fZGlmZnVzZU1ldGhvZDtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3Muc3BlY3VsYXJNZXRob2QgPSB0aGlzLl9zcGVjdWxhck1ldGhvZDtcblx0XHRcdHRoaXMuX3NjcmVlblBhc3Mubm9ybWFsTWV0aG9kID0gdGhpcy5fbm9ybWFsTWV0aG9kO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5zaGFkb3dNZXRob2QgPSB0aGlzLl9zaGFkb3dNZXRob2Q7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9tYXRlcmlhbE1vZGUgPT0gVHJpYW5nbGVNYXRlcmlhbE1vZGUuTVVMVElfUEFTUykge1xuXHRcdFx0aWYgKHRoaXMubnVtTGlnaHRzID09IDApIHtcblx0XHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5hbWJpZW50TWV0aG9kID0gdGhpcy5fYW1iaWVudE1ldGhvZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3NjcmVlblBhc3MuYW1iaWVudE1ldGhvZCA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX3NjcmVlblBhc3MucHJlc2VydmVBbHBoYSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fc2NyZWVuUGFzcy5ub3JtYWxNZXRob2QgPSB0aGlzLl9ub3JtYWxNZXRob2Q7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtYXhpbXVtIHRvdGFsIG51bWJlciBvZiBsaWdodHMgcHJvdmlkZWQgYnkgdGhlIGxpZ2h0IHBpY2tlci5cblx0ICovXG5cdHByaXZhdGUgZ2V0IG51bUxpZ2h0cygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BMaWdodFBpY2tlcj8gdGhpcy5fcExpZ2h0UGlja2VyLm51bUxpZ2h0UHJvYmVzICsgdGhpcy5fcExpZ2h0UGlja2VyLm51bURpcmVjdGlvbmFsTGlnaHRzICsgdGhpcy5fcExpZ2h0UGlja2VyLm51bVBvaW50TGlnaHRzICsgdGhpcy5fcExpZ2h0UGlja2VyLm51bUNhc3RpbmdEaXJlY3Rpb25hbExpZ2h0cyArIHRoaXMuX3BMaWdodFBpY2tlci5udW1DYXN0aW5nUG9pbnRMaWdodHMgOiAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgbGlnaHRzIHRoYXQgZG9uJ3QgY2FzdCBzaGFkb3dzLlxuXHQgKi9cblx0cHJpdmF0ZSBnZXQgbnVtTm9uQ2FzdGVycygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BMaWdodFBpY2tlcj8gdGhpcy5fcExpZ2h0UGlja2VyLm51bUxpZ2h0UHJvYmVzICsgdGhpcy5fcExpZ2h0UGlja2VyLm51bURpcmVjdGlvbmFsTGlnaHRzICsgdGhpcy5fcExpZ2h0UGlja2VyLm51bVBvaW50TGlnaHRzIDogMDtcblx0fVxufVxuXG5leHBvcnQgPSBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsOyJdfQ==