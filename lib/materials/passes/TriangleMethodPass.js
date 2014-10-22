var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ShadingMethodEvent = require("awayjs-stagegl/lib/events/ShadingMethodEvent");
var MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
var ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
var ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
var EffectColorTransformMethod = require("awayjs-stagegl/lib/materials/methods/EffectColorTransformMethod");
var MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
var MaterialPassMode = require("awayjs-stagegl/lib/materials/passes/MaterialPassMode");
/**
 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
 * using material methods to define their appearance.
 */
var TriangleMethodPass = (function (_super) {
    __extends(TriangleMethodPass, _super);
    /**
     * Creates a new CompiledPass object.
     *
     * @param material The material to which this pass belongs.
     */
    function TriangleMethodPass(passMode) {
        var _this = this;
        if (passMode === void 0) { passMode = 0x03; }
        _super.call(this, passMode);
        this._iMethodVOs = new Array();
        this._numEffectDependencies = 0;
        this._onShaderInvalidatedDelegate = function (event) { return _this.onShaderInvalidated(event); };
    }
    /**
     * Factory method to create a concrete shader object for this pass.
     *
     * @param profile The compatibility profile used by the renderer.
     */
    TriangleMethodPass.prototype.createShaderObject = function (profile) {
        if (this._pLightPicker && (this.passMode & MaterialPassMode.LIGHTING))
            return new ShaderLightingObject(profile);
        return new ShaderObjectBase(profile);
    };
    /**
     * Initializes the unchanging constant data for this material.
     */
    TriangleMethodPass.prototype._iInitConstantData = function (shaderObject) {
        _super.prototype._iInitConstantData.call(this, shaderObject);
        //Updates method constants if they have changed.
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i)
            this._iMethodVOs[i].method.iInitConstants(shaderObject, this._iMethodVOs[i]);
    };
    Object.defineProperty(TriangleMethodPass.prototype, "colorTransform", {
        /**
         * The ColorTransform object to transform the colour of the material with. Defaults to null.
         */
        get: function () {
            return this.colorTransformMethod ? this.colorTransformMethod.colorTransform : null;
        },
        set: function (value) {
            if (value) {
                if (this.colorTransformMethod == null)
                    this.colorTransformMethod = new EffectColorTransformMethod();
                this.colorTransformMethod.colorTransform = value;
            }
            else if (!value) {
                if (this.colorTransformMethod)
                    this.colorTransformMethod = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodPass.prototype, "colorTransformMethod", {
        /**
         * The EffectColorTransformMethod object to transform the colour of the material with. Defaults to null.
         */
        get: function () {
            return this._iColorTransformMethodVO ? this._iColorTransformMethodVO.method : null;
        },
        set: function (value) {
            if (this._iColorTransformMethodVO && this._iColorTransformMethodVO.method == value)
                return;
            if (this._iColorTransformMethodVO) {
                this._removeDependency(this._iColorTransformMethodVO);
                this._iColorTransformMethodVO = null;
            }
            if (value) {
                this._iColorTransformMethodVO = new MethodVO(value);
                this._addDependency(this._iColorTransformMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    TriangleMethodPass.prototype._removeDependency = function (methodVO, effectsDependency) {
        if (effectsDependency === void 0) { effectsDependency = false; }
        var index = this._iMethodVOs.indexOf(methodVO);
        if (!effectsDependency)
            this._numEffectDependencies--;
        methodVO.method.removeEventListener(ShadingMethodEvent.SHADER_INVALIDATED, this._onShaderInvalidatedDelegate);
        this._iMethodVOs.splice(index, 1);
        this._pInvalidatePass();
    };
    TriangleMethodPass.prototype._addDependency = function (methodVO, effectsDependency, index) {
        if (effectsDependency === void 0) { effectsDependency = false; }
        if (index === void 0) { index = -1; }
        methodVO.method.addEventListener(ShadingMethodEvent.SHADER_INVALIDATED, this._onShaderInvalidatedDelegate);
        if (effectsDependency) {
            if (index != -1)
                this._iMethodVOs.splice(index + this._iMethodVOs.length - this._numEffectDependencies, 0, methodVO);
            else
                this._iMethodVOs.push(methodVO);
            this._numEffectDependencies++;
        }
        else {
            this._iMethodVOs.splice(this._iMethodVOs.length - this._numEffectDependencies, 0, methodVO);
        }
        this._pInvalidatePass();
    };
    /**
     * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
     * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
     * methods added prior.
     */
    TriangleMethodPass.prototype.addEffectMethod = function (method) {
        this._addDependency(new MethodVO(method), true);
    };
    Object.defineProperty(TriangleMethodPass.prototype, "numEffectMethods", {
        /**
         * The number of "effect" methods added to the material.
         */
        get: function () {
            return this._numEffectDependencies;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Queries whether a given effects method was added to the material.
     *
     * @param method The method to be queried.
     * @return true if the method was added to the material, false otherwise.
     */
    TriangleMethodPass.prototype.hasEffectMethod = function (method) {
        return this.getDependencyForMethod(method) != null;
    };
    /**
     * Returns the method added at the given index.
     * @param index The index of the method to retrieve.
     * @return The method at the given index.
     */
    TriangleMethodPass.prototype.getEffectMethodAt = function (index) {
        if (index < 0 || index > this._numEffectDependencies - 1)
            return null;
        return this._iMethodVOs[index + this._iMethodVOs.length - this._numEffectDependencies].method;
    };
    /**
     * Adds an effect method at the specified index amongst the methods already added to the material. Effect
     * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
     * etc. The method will be applied to the result of the methods with a lower index.
     */
    TriangleMethodPass.prototype.addEffectMethodAt = function (method, index) {
        this._addDependency(new MethodVO(method), true, index);
    };
    /**
     * Removes an effect method from the material.
     * @param method The method to be removed.
     */
    TriangleMethodPass.prototype.removeEffectMethod = function (method) {
        var methodVO = this.getDependencyForMethod(method);
        if (methodVO != null)
            this._removeDependency(methodVO, true);
    };
    TriangleMethodPass.prototype.getDependencyForMethod = function (method) {
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i)
            if (this._iMethodVOs[i].method == method)
                return this._iMethodVOs[i];
        return null;
    };
    Object.defineProperty(TriangleMethodPass.prototype, "normalMethod", {
        /**
         * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
         */
        get: function () {
            return this._iNormalMethodVO ? this._iNormalMethodVO.method : null;
        },
        set: function (value) {
            if (this._iNormalMethodVO && this._iNormalMethodVO.method == value)
                return;
            if (this._iNormalMethodVO) {
                this._removeDependency(this._iNormalMethodVO);
                this._iNormalMethodVO = null;
            }
            if (value) {
                this._iNormalMethodVO = new MethodVO(value);
                this._addDependency(this._iNormalMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodPass.prototype, "ambientMethod", {
        /**
         * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
         */
        get: function () {
            return this._iAmbientMethodVO ? this._iAmbientMethodVO.method : null;
        },
        set: function (value) {
            if (this._iAmbientMethodVO && this._iAmbientMethodVO.method == value)
                return;
            if (this._iAmbientMethodVO) {
                this._removeDependency(this._iAmbientMethodVO);
                this._iAmbientMethodVO = null;
            }
            if (value) {
                this._iAmbientMethodVO = new MethodVO(value);
                this._addDependency(this._iAmbientMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodPass.prototype, "shadowMethod", {
        /**
         * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
         */
        get: function () {
            return this._iShadowMethodVO ? this._iShadowMethodVO.method : null;
        },
        set: function (value) {
            if (this._iShadowMethodVO && this._iShadowMethodVO.method == value)
                return;
            if (this._iShadowMethodVO) {
                this._removeDependency(this._iShadowMethodVO);
                this._iShadowMethodVO = null;
            }
            if (value) {
                this._iShadowMethodVO = new MethodVO(value);
                this._addDependency(this._iShadowMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodPass.prototype, "diffuseMethod", {
        /**
         * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
         */
        get: function () {
            return this._iDiffuseMethodVO ? this._iDiffuseMethodVO.method : null;
        },
        set: function (value) {
            if (this._iDiffuseMethodVO && this._iDiffuseMethodVO.method == value)
                return;
            if (this._iDiffuseMethodVO) {
                this._removeDependency(this._iDiffuseMethodVO);
                this._iDiffuseMethodVO = null;
            }
            if (value) {
                this._iDiffuseMethodVO = new MethodVO(value);
                this._addDependency(this._iDiffuseMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleMethodPass.prototype, "specularMethod", {
        /**
         * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
         */
        get: function () {
            return this._iSpecularMethodVO ? this._iSpecularMethodVO.method : null;
        },
        set: function (value) {
            if (this._iSpecularMethodVO && this._iSpecularMethodVO.method == value)
                return;
            if (this._iSpecularMethodVO) {
                this._removeDependency(this._iSpecularMethodVO);
                this._iSpecularMethodVO = null;
            }
            if (value) {
                this._iSpecularMethodVO = new MethodVO(value);
                this._addDependency(this._iSpecularMethodVO);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritDoc
     */
    TriangleMethodPass.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        while (this._iMethodVOs.length)
            this._removeDependency(this._iMethodVOs[0]);
        this._iMethodVOs = null;
    };
    /**
     * Called when any method's shader code is invalidated.
     */
    TriangleMethodPass.prototype.onShaderInvalidated = function (event) {
        this._pInvalidatePass();
    };
    // RENDER LOOP
    /**
     * @inheritDoc
     */
    TriangleMethodPass.prototype._iActivate = function (pass, stage, camera) {
        _super.prototype._iActivate.call(this, pass, stage, camera);
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod)
                methodVO.method.iActivate(pass.shaderObject, methodVO, stage);
        }
    };
    /**
     *
     *
     * @param renderable
     * @param stage
     * @param camera
     */
    TriangleMethodPass.prototype.setRenderState = function (pass, renderable, stage, camera, viewProjection) {
        _super.prototype.setRenderState.call(this, pass, renderable, stage, camera, viewProjection);
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod)
                methodVO.method.iSetRenderState(pass.shaderObject, methodVO, renderable, stage, camera);
        }
    };
    /**
     * @inheritDoc
     */
    TriangleMethodPass.prototype._iDeactivate = function (pass, stage) {
        _super.prototype._iDeactivate.call(this, pass, stage);
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod)
                methodVO.method.iDeactivate(pass.shaderObject, methodVO, stage);
        }
    };
    TriangleMethodPass.prototype._iIncludeDependencies = function (shaderObject) {
        var i;
        var len = this._iMethodVOs.length;
        for (i = 0; i < len; ++i)
            this.setupAndCountDependencies(shaderObject, this._iMethodVOs[i]);
        for (i = 0; i < len; ++i)
            this._iMethodVOs[i].useMethod = this._iMethodVOs[i].method.iIsUsed(shaderObject);
        _super.prototype._iIncludeDependencies.call(this, shaderObject);
    };
    /**
     * Counts the dependencies for a given method.
     * @param method The method to count the dependencies for.
     * @param methodVO The method's data for this material.
     */
    TriangleMethodPass.prototype.setupAndCountDependencies = function (shaderObject, methodVO) {
        methodVO.reset();
        methodVO.method.iInitVO(shaderObject, methodVO);
        if (methodVO.needsProjection)
            shaderObject.projectionDependencies++;
        if (methodVO.needsGlobalVertexPos) {
            shaderObject.globalPosDependencies++;
            if (methodVO.needsGlobalFragmentPos)
                shaderObject.usesGlobalPosFragment = true;
        }
        else if (methodVO.needsGlobalFragmentPos) {
            shaderObject.globalPosDependencies++;
            shaderObject.usesGlobalPosFragment = true;
        }
        if (methodVO.needsNormals)
            shaderObject.normalDependencies++;
        if (methodVO.needsTangents)
            shaderObject.tangentDependencies++;
        if (methodVO.needsView)
            shaderObject.viewDirDependencies++;
        if (methodVO.needsUV)
            shaderObject.uvDependencies++;
        if (methodVO.needsSecondaryUV)
            shaderObject.secondaryUVDependencies++;
    };
    TriangleMethodPass.prototype._iGetPreLightingVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        var code = "";
        if (this._iAmbientMethodVO && this._iAmbientMethodVO.useMethod)
            code += this._iAmbientMethodVO.method.iGetVertexCode(shaderObject, this._iAmbientMethodVO, registerCache, sharedRegisters);
        if (this._iDiffuseMethodVO && this._iDiffuseMethodVO.useMethod)
            code += this._iDiffuseMethodVO.method.iGetVertexCode(shaderObject, this._iDiffuseMethodVO, registerCache, sharedRegisters);
        if (this._iSpecularMethodVO && this._iSpecularMethodVO.useMethod)
            code += this._iSpecularMethodVO.method.iGetVertexCode(shaderObject, this._iSpecularMethodVO, registerCache, sharedRegisters);
        return code;
    };
    TriangleMethodPass.prototype._iGetPreLightingFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        var code = "";
        if (this._iAmbientMethodVO && this._iAmbientMethodVO.useMethod) {
            code += this._iAmbientMethodVO.method.iGetFragmentCode(shaderObject, this._iAmbientMethodVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);
            if (this._iAmbientMethodVO.needsNormals)
                registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);
            if (this._iAmbientMethodVO.needsView)
                registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);
        }
        if (this._iDiffuseMethodVO && this._iDiffuseMethodVO.useMethod)
            code += this._iDiffuseMethodVO.method.iGetFragmentPreLightingCode(shaderObject, this._iDiffuseMethodVO, registerCache, sharedRegisters);
        if (this._iSpecularMethodVO && this._iSpecularMethodVO.useMethod)
            code += this._iSpecularMethodVO.method.iGetFragmentPreLightingCode(shaderObject, this._iSpecularMethodVO, registerCache, sharedRegisters);
        return code;
    };
    TriangleMethodPass.prototype._iGetPerLightDiffuseFragmentCode = function (shaderObject, lightDirReg, diffuseColorReg, registerCache, sharedRegisters) {
        return this._iDiffuseMethodVO.method.iGetFragmentCodePerLight(shaderObject, this._iDiffuseMethodVO, lightDirReg, diffuseColorReg, registerCache, sharedRegisters);
    };
    TriangleMethodPass.prototype._iGetPerLightSpecularFragmentCode = function (shaderObject, lightDirReg, specularColorReg, registerCache, sharedRegisters) {
        return this._iSpecularMethodVO.method.iGetFragmentCodePerLight(shaderObject, this._iSpecularMethodVO, lightDirReg, specularColorReg, registerCache, sharedRegisters);
    };
    TriangleMethodPass.prototype._iGetPerProbeDiffuseFragmentCode = function (shaderObject, texReg, weightReg, registerCache, sharedRegisters) {
        return this._iDiffuseMethodVO.method.iGetFragmentCodePerProbe(shaderObject, this._iDiffuseMethodVO, texReg, weightReg, registerCache, sharedRegisters);
    };
    TriangleMethodPass.prototype._iGetPerProbeSpecularFragmentCode = function (shaderObject, texReg, weightReg, registerCache, sharedRegisters) {
        return this._iSpecularMethodVO.method.iGetFragmentCodePerProbe(shaderObject, this._iSpecularMethodVO, texReg, weightReg, registerCache, sharedRegisters);
    };
    TriangleMethodPass.prototype._iGetPostLightingVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        var code = "";
        if (this._iShadowMethodVO)
            code += this._iShadowMethodVO.method.iGetVertexCode(shaderObject, this._iShadowMethodVO, registerCache, sharedRegisters);
        return code;
    };
    TriangleMethodPass.prototype._iGetPostLightingFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        var code = "";
        if (shaderObject.useAlphaPremultiplied && this._pEnableBlending) {
            code += "add " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.commons + ".z\n" + "div " + sharedRegisters.shadedTarget + ".xyz, " + sharedRegisters.shadedTarget + ", " + sharedRegisters.shadedTarget + ".w\n" + "sub " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.commons + ".z\n" + "sat " + sharedRegisters.shadedTarget + ".xyz, " + sharedRegisters.shadedTarget + "\n";
        }
        if (this._iShadowMethodVO)
            code += this._iShadowMethodVO.method.iGetFragmentCode(shaderObject, this._iShadowMethodVO, sharedRegisters.shadowTarget, registerCache, sharedRegisters);
        if (this._iDiffuseMethodVO && this._iDiffuseMethodVO.useMethod) {
            code += this._iDiffuseMethodVO.method.iGetFragmentPostLightingCode(shaderObject, this._iDiffuseMethodVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);
            // resolve other dependencies as well?
            if (this._iDiffuseMethodVO.needsNormals)
                registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);
            if (this._iDiffuseMethodVO.needsView)
                registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);
        }
        if (this._iSpecularMethodVO && this._iSpecularMethodVO.useMethod) {
            code += this._iSpecularMethodVO.method.iGetFragmentPostLightingCode(shaderObject, this._iSpecularMethodVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);
            if (this._iSpecularMethodVO.needsNormals)
                registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);
            if (this._iSpecularMethodVO.needsView)
                registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);
        }
        if (this._iShadowMethodVO)
            registerCache.removeFragmentTempUsage(sharedRegisters.shadowTarget);
        return code;
    };
    /**
     * Indicates whether or not normals are allowed in tangent space. This is only the case if no object-space
     * dependencies exist.
     */
    TriangleMethodPass.prototype._pUsesTangentSpace = function (shaderObject) {
        if (shaderObject.usesProbes)
            return false;
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = 0; i < len; ++i) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod && !methodVO.method.iUsesTangentSpace())
                return false;
        }
        return true;
    };
    /**
     * Indicates whether or not normals are output in tangent space.
     */
    TriangleMethodPass.prototype._pOutputsTangentNormals = function (shaderObject) {
        return this._iNormalMethodVO.method.iOutputsTangentNormals();
    };
    /**
     * Indicates whether or not normals are output by the pass.
     */
    TriangleMethodPass.prototype._pOutputsNormals = function (shaderObject) {
        return this._iNormalMethodVO && this._iNormalMethodVO.useMethod;
    };
    TriangleMethodPass.prototype._iGetNormalVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        return this._iNormalMethodVO.method.iGetVertexCode(shaderObject, this._iNormalMethodVO, registerCache, sharedRegisters);
    };
    TriangleMethodPass.prototype._iGetNormalFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        var code = this._iNormalMethodVO.method.iGetFragmentCode(shaderObject, this._iNormalMethodVO, sharedRegisters.normalFragment, registerCache, sharedRegisters);
        if (this._iNormalMethodVO.needsView)
            registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);
        if (this._iNormalMethodVO.needsGlobalFragmentPos || this._iNormalMethodVO.needsGlobalVertexPos)
            registerCache.removeVertexTempUsage(sharedRegisters.globalPositionVertex);
        return code;
    };
    /**
     * @inheritDoc
     */
    TriangleMethodPass.prototype._iGetVertexCode = function (shaderObject, regCache, sharedReg) {
        var code = "";
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = len - this._numEffectDependencies; i < len; i++) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod) {
                code += methodVO.method.iGetVertexCode(shaderObject, methodVO, regCache, sharedReg);
                if (methodVO.needsGlobalVertexPos || methodVO.needsGlobalFragmentPos)
                    regCache.removeVertexTempUsage(sharedReg.globalPositionVertex);
            }
        }
        if (this._iColorTransformMethodVO && this._iColorTransformMethodVO.useMethod)
            code += this._iColorTransformMethodVO.method.iGetVertexCode(shaderObject, this._iColorTransformMethodVO, regCache, sharedReg);
        return code;
    };
    /**
     * @inheritDoc
     */
    TriangleMethodPass.prototype._iGetFragmentCode = function (shaderObject, regCache, sharedReg) {
        var code = "";
        var alphaReg;
        if (this.preserveAlpha && this._numEffectDependencies > 0) {
            alphaReg = regCache.getFreeFragmentSingleTemp();
            regCache.addFragmentTempUsages(alphaReg, 1);
            code += "mov " + alphaReg + ", " + sharedReg.shadedTarget + ".w\n";
        }
        var methodVO;
        var len = this._iMethodVOs.length;
        for (var i = len - this._numEffectDependencies; i < len; i++) {
            methodVO = this._iMethodVOs[i];
            if (methodVO.useMethod) {
                code += methodVO.method.iGetFragmentCode(shaderObject, methodVO, sharedReg.shadedTarget, regCache, sharedReg);
                if (methodVO.needsNormals)
                    regCache.removeFragmentTempUsage(sharedReg.normalFragment);
                if (methodVO.needsView)
                    regCache.removeFragmentTempUsage(sharedReg.viewDirFragment);
            }
        }
        if (this.preserveAlpha && this._numEffectDependencies > 0) {
            code += "mov " + sharedReg.shadedTarget + ".w, " + alphaReg + "\n";
            regCache.removeFragmentTempUsage(alphaReg);
        }
        if (this._iColorTransformMethodVO && this._iColorTransformMethodVO.useMethod)
            code += this._iColorTransformMethodVO.method.iGetFragmentCode(shaderObject, this._iColorTransformMethodVO, sharedReg.shadedTarget, regCache, sharedReg);
        return code;
    };
    /**
     * Indicates whether the shader uses any shadows.
     */
    TriangleMethodPass.prototype._iUsesShadows = function () {
        return Boolean(this._iShadowMethodVO || this.lightPicker.castingDirectionalLights.length > 0 || this.lightPicker.castingPointLights.length > 0);
    };
    /**
     * Indicates whether the shader uses any specular component.
     */
    TriangleMethodPass.prototype._iUsesSpecular = function () {
        return Boolean(this._iSpecularMethodVO);
    };
    return TriangleMethodPass;
})(MaterialPassBase);
module.exports = TriangleMethodPass;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9wYXNzZXMvdHJpYW5nbGVtZXRob2RwYXNzLnRzIl0sIm5hbWVzIjpbIlRyaWFuZ2xlTWV0aG9kUGFzcyIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5jb25zdHJ1Y3RvciIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5jcmVhdGVTaGFkZXJPYmplY3QiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lJbml0Q29uc3RhbnREYXRhIiwiVHJpYW5nbGVNZXRob2RQYXNzLmNvbG9yVHJhbnNmb3JtIiwiVHJpYW5nbGVNZXRob2RQYXNzLmNvbG9yVHJhbnNmb3JtTWV0aG9kIiwiVHJpYW5nbGVNZXRob2RQYXNzLl9yZW1vdmVEZXBlbmRlbmN5IiwiVHJpYW5nbGVNZXRob2RQYXNzLl9hZGREZXBlbmRlbmN5IiwiVHJpYW5nbGVNZXRob2RQYXNzLmFkZEVmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5udW1FZmZlY3RNZXRob2RzIiwiVHJpYW5nbGVNZXRob2RQYXNzLmhhc0VmZmVjdE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5nZXRFZmZlY3RNZXRob2RBdCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5hZGRFZmZlY3RNZXRob2RBdCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5yZW1vdmVFZmZlY3RNZXRob2QiLCJUcmlhbmdsZU1ldGhvZFBhc3MuZ2V0RGVwZW5kZW5jeUZvck1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5ub3JtYWxNZXRob2QiLCJUcmlhbmdsZU1ldGhvZFBhc3MuYW1iaWVudE1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5zaGFkb3dNZXRob2QiLCJUcmlhbmdsZU1ldGhvZFBhc3MuZGlmZnVzZU1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5zcGVjdWxhck1ldGhvZCIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5kaXNwb3NlIiwiVHJpYW5nbGVNZXRob2RQYXNzLm9uU2hhZGVySW52YWxpZGF0ZWQiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lBY3RpdmF0ZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5zZXRSZW5kZXJTdGF0ZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5faURlYWN0aXZhdGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lJbmNsdWRlRGVwZW5kZW5jaWVzIiwiVHJpYW5nbGVNZXRob2RQYXNzLnNldHVwQW5kQ291bnREZXBlbmRlbmNpZXMiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXRQcmVMaWdodGluZ1ZlcnRleENvZGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXRQcmVMaWdodGluZ0ZyYWdtZW50Q29kZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5faUdldFBlckxpZ2h0RGlmZnVzZUZyYWdtZW50Q29kZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5faUdldFBlckxpZ2h0U3BlY3VsYXJGcmFnbWVudENvZGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXRQZXJQcm9iZURpZmZ1c2VGcmFnbWVudENvZGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXRQZXJQcm9iZVNwZWN1bGFyRnJhZ21lbnRDb2RlIiwiVHJpYW5nbGVNZXRob2RQYXNzLl9pR2V0UG9zdExpZ2h0aW5nVmVydGV4Q29kZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5faUdldFBvc3RMaWdodGluZ0ZyYWdtZW50Q29kZSIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5fcFVzZXNUYW5nZW50U3BhY2UiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX3BPdXRwdXRzVGFuZ2VudE5vcm1hbHMiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX3BPdXRwdXRzTm9ybWFscyIsIlRyaWFuZ2xlTWV0aG9kUGFzcy5faUdldE5vcm1hbFZlcnRleENvZGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXROb3JtYWxGcmFnbWVudENvZGUiLCJUcmlhbmdsZU1ldGhvZFBhc3MuX2lHZXRWZXJ0ZXhDb2RlIiwiVHJpYW5nbGVNZXRob2RQYXNzLl9pR2V0RnJhZ21lbnRDb2RlIiwiVHJpYW5nbGVNZXRob2RQYXNzLl9pVXNl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Q0FBQ0Esd0JBQXdCQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUM1RUEsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLHdCQUF3QkEsRUFBRUEsU0FBU0EsQ0FBQ0EsWUFBWUEsRUFBRUEsUUFBUUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFekpBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2JBLENBQUNBO0lBQ0R6Qzs7T0FFR0E7SUFDSUEsMENBQWFBLEdBQXBCQTtRQUVDMEMsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSx3QkFBd0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakpBLENBQUNBO0lBRUQxQzs7T0FFR0E7SUFDSUEsMkNBQWNBLEdBQXJCQTtRQUVDMkMsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFDRjNDLHlCQUFDQTtBQUFEQSxDQXhyQkEsQUF3ckJDQSxFQXhyQmdDLGdCQUFnQixFQXdyQmhEO0FBRUQsQUFBNEIsaUJBQW5CLGtCQUFrQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9wYXNzZXMvVHJpYW5nbGVNZXRob2RQYXNzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBUcmlhbmdsZVN1Ykdlb21ldHJ5XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9UcmlhbmdsZVN1Ykdlb21ldHJ5XCIpO1xuaW1wb3J0IENvbG9yVHJhbnNmb3JtXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL0NvbG9yVHJhbnNmb3JtXCIpO1xuaW1wb3J0IE1hdHJpeFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2dlb20vTWF0cml4XCIpO1xuaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9NYXRyaXgzRFwiKTtcbmltcG9ydCBNYXRyaXgzRFV0aWxzXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL01hdHJpeDNEVXRpbHNcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcbmltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcblxuaW1wb3J0IE1hdGVyaWFsUGFzc0RhdGFcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvTWF0ZXJpYWxQYXNzRGF0YVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcbmltcG9ydCBTaGFkaW5nTWV0aG9kRXZlbnRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1NoYWRpbmdNZXRob2RFdmVudFwiKTtcbmltcG9ydCBNZXRob2RWT1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vTWV0aG9kVk9cIik7XG5pbXBvcnQgU2hhZGVyTGlnaHRpbmdPYmplY3RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlckxpZ2h0aW5nT2JqZWN0XCIpO1xuaW1wb3J0IFNoYWRlck9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyT2JqZWN0QmFzZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckNhY2hlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJEYXRhXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRWxlbWVudFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRWxlbWVudFwiKTtcbmltcG9ydCBBbWJpZW50QmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvQW1iaWVudEJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IERpZmZ1c2VCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9EaWZmdXNlQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgRWZmZWN0Q29sb3JUcmFuc2Zvcm1NZXRob2RcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9FZmZlY3RDb2xvclRyYW5zZm9ybU1ldGhvZFwiKTtcbmltcG9ydCBFZmZlY3RNZXRob2RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvRWZmZWN0TWV0aG9kQmFzZVwiKTtcbmltcG9ydCBMaWdodGluZ01ldGhvZEJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvTGlnaHRpbmdNZXRob2RCYXNlXCIpO1xuaW1wb3J0IE5vcm1hbEJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL05vcm1hbEJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNoYWRvd01hcE1ldGhvZEJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU2hhZG93TWFwTWV0aG9kQmFzZVwiKTtcbmltcG9ydCBTcGVjdWxhckJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NwZWN1bGFyQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgSUxpZ2h0aW5nUGFzc1N0YWdlR0xcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9JTGlnaHRpbmdQYXNzU3RhZ2VHTFwiKTtcbmltcG9ydCBNYXRlcmlhbFBhc3NCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9NYXRlcmlhbFBhc3NCYXNlXCIpO1xuaW1wb3J0IE1hdGVyaWFsUGFzc01vZGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvcGFzc2VzL01hdGVyaWFsUGFzc01vZGVcIik7XG5cbi8qKlxuICogQ29tcGlsZWRQYXNzIGZvcm1zIGFuIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIHRoZSBkZWZhdWx0IGNvbXBpbGVkIHBhc3MgbWF0ZXJpYWxzIHByb3ZpZGVkIGJ5IEF3YXkzRCxcbiAqIHVzaW5nIG1hdGVyaWFsIG1ldGhvZHMgdG8gZGVmaW5lIHRoZWlyIGFwcGVhcmFuY2UuXG4gKi9cbmNsYXNzIFRyaWFuZ2xlTWV0aG9kUGFzcyBleHRlbmRzIE1hdGVyaWFsUGFzc0Jhc2UgaW1wbGVtZW50cyBJTGlnaHRpbmdQYXNzU3RhZ2VHTFxue1xuXHRwdWJsaWMgX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPOk1ldGhvZFZPO1xuXHRwdWJsaWMgX2lOb3JtYWxNZXRob2RWTzpNZXRob2RWTztcblx0cHVibGljIF9pQW1iaWVudE1ldGhvZFZPOk1ldGhvZFZPO1xuXHRwdWJsaWMgX2lTaGFkb3dNZXRob2RWTzpNZXRob2RWTztcblx0cHVibGljIF9pRGlmZnVzZU1ldGhvZFZPOk1ldGhvZFZPO1xuXHRwdWJsaWMgX2lTcGVjdWxhck1ldGhvZFZPOk1ldGhvZFZPO1xuXHRwdWJsaWMgX2lNZXRob2RWT3M6QXJyYXk8TWV0aG9kVk8+ID0gbmV3IEFycmF5PE1ldGhvZFZPPigpO1xuXG5cdHB1YmxpYyBfbnVtRWZmZWN0RGVwZW5kZW5jaWVzOm51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBfb25TaGFkZXJJbnZhbGlkYXRlZERlbGVnYXRlOihldmVudDpTaGFkaW5nTWV0aG9kRXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgQ29tcGlsZWRQYXNzIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIG1hdGVyaWFsIFRoZSBtYXRlcmlhbCB0byB3aGljaCB0aGlzIHBhc3MgYmVsb25ncy5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHBhc3NNb2RlOm51bWJlciA9IDB4MDMpXG5cdHtcblx0XHRzdXBlcihwYXNzTW9kZSk7XG5cblx0XHR0aGlzLl9vblNoYWRlckludmFsaWRhdGVkRGVsZWdhdGUgPSAoZXZlbnQ6U2hhZGluZ01ldGhvZEV2ZW50KSA9PiB0aGlzLm9uU2hhZGVySW52YWxpZGF0ZWQoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhIGNvbmNyZXRlIHNoYWRlciBvYmplY3QgZm9yIHRoaXMgcGFzcy5cblx0ICpcblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSB1c2VkIGJ5IHRoZSByZW5kZXJlci5cblx0ICovXG5cdHB1YmxpYyBjcmVhdGVTaGFkZXJPYmplY3QocHJvZmlsZTpzdHJpbmcpOlNoYWRlck9iamVjdEJhc2Vcblx0e1xuXHRcdGlmICh0aGlzLl9wTGlnaHRQaWNrZXIgJiYgKHRoaXMucGFzc01vZGUgJiBNYXRlcmlhbFBhc3NNb2RlLkxJR0hUSU5HKSlcblx0XHRcdHJldHVybiBuZXcgU2hhZGVyTGlnaHRpbmdPYmplY3QocHJvZmlsZSk7XG5cblx0XHRyZXR1cm4gbmV3IFNoYWRlck9iamVjdEJhc2UocHJvZmlsZSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIHVuY2hhbmdpbmcgY29uc3RhbnQgZGF0YSBmb3IgdGhpcyBtYXRlcmlhbC5cblx0ICovXG5cdHB1YmxpYyBfaUluaXRDb25zdGFudERhdGEoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpXG5cdHtcblx0XHRzdXBlci5faUluaXRDb25zdGFudERhdGEoc2hhZGVyT2JqZWN0KTtcblxuXHRcdC8vVXBkYXRlcyBtZXRob2QgY29uc3RhbnRzIGlmIHRoZXkgaGF2ZSBjaGFuZ2VkLlxuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5faU1ldGhvZFZPcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyArK2kpXG5cdFx0XHR0aGlzLl9pTWV0aG9kVk9zW2ldLm1ldGhvZC5pSW5pdENvbnN0YW50cyhzaGFkZXJPYmplY3QsIHRoaXMuX2lNZXRob2RWT3NbaV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBDb2xvclRyYW5zZm9ybSBvYmplY3QgdG8gdHJhbnNmb3JtIHRoZSBjb2xvdXIgb2YgdGhlIG1hdGVyaWFsIHdpdGguIERlZmF1bHRzIHRvIG51bGwuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbG9yVHJhbnNmb3JtKCk6Q29sb3JUcmFuc2Zvcm1cblx0e1xuXHRcdHJldHVybiB0aGlzLmNvbG9yVHJhbnNmb3JtTWV0aG9kPyB0aGlzLmNvbG9yVHJhbnNmb3JtTWV0aG9kLmNvbG9yVHJhbnNmb3JtIDogbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3JUcmFuc2Zvcm0odmFsdWU6Q29sb3JUcmFuc2Zvcm0pXG5cdHtcblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdGlmICh0aGlzLmNvbG9yVHJhbnNmb3JtTWV0aG9kID09IG51bGwpXG5cdFx0XHRcdHRoaXMuY29sb3JUcmFuc2Zvcm1NZXRob2QgPSBuZXcgRWZmZWN0Q29sb3JUcmFuc2Zvcm1NZXRob2QoKTtcblxuXHRcdFx0dGhpcy5jb2xvclRyYW5zZm9ybU1ldGhvZC5jb2xvclRyYW5zZm9ybSA9IHZhbHVlO1xuXG5cdFx0fSBlbHNlIGlmICghdmFsdWUpIHtcblx0XHRcdGlmICh0aGlzLmNvbG9yVHJhbnNmb3JtTWV0aG9kKVxuXHRcdFx0XHR0aGlzLmNvbG9yVHJhbnNmb3JtTWV0aG9kID0gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIEVmZmVjdENvbG9yVHJhbnNmb3JtTWV0aG9kIG9iamVjdCB0byB0cmFuc2Zvcm0gdGhlIGNvbG91ciBvZiB0aGUgbWF0ZXJpYWwgd2l0aC4gRGVmYXVsdHMgdG8gbnVsbC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29sb3JUcmFuc2Zvcm1NZXRob2QoKTpFZmZlY3RDb2xvclRyYW5zZm9ybU1ldGhvZFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPPyA8RWZmZWN0Q29sb3JUcmFuc2Zvcm1NZXRob2Q+IHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPLm1ldGhvZCA6IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGNvbG9yVHJhbnNmb3JtTWV0aG9kKHZhbHVlOkVmZmVjdENvbG9yVHJhbnNmb3JtTWV0aG9kKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPICYmIHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPLm1ldGhvZCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTykge1xuXHRcdFx0dGhpcy5fcmVtb3ZlRGVwZW5kZW5jeSh0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTyk7XG5cdFx0XHR0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHR0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTyA9IG5ldyBNZXRob2RWTyh2YWx1ZSk7XG5cdFx0XHR0aGlzLl9hZGREZXBlbmRlbmN5KHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIF9yZW1vdmVEZXBlbmRlbmN5KG1ldGhvZFZPOk1ldGhvZFZPLCBlZmZlY3RzRGVwZW5kZW5jeTpib29sZWFuID0gZmFsc2UpXG5cdHtcblx0XHR2YXIgaW5kZXg6bnVtYmVyID0gdGhpcy5faU1ldGhvZFZPcy5pbmRleE9mKG1ldGhvZFZPKTtcblxuXHRcdGlmICghZWZmZWN0c0RlcGVuZGVuY3kpXG5cdFx0XHR0aGlzLl9udW1FZmZlY3REZXBlbmRlbmNpZXMtLTtcblxuXHRcdG1ldGhvZFZPLm1ldGhvZC5yZW1vdmVFdmVudExpc3RlbmVyKFNoYWRpbmdNZXRob2RFdmVudC5TSEFERVJfSU5WQUxJREFURUQsIHRoaXMuX29uU2hhZGVySW52YWxpZGF0ZWREZWxlZ2F0ZSk7XG5cdFx0dGhpcy5faU1ldGhvZFZPcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzKCk7XG5cdH1cblxuXHRwcml2YXRlIF9hZGREZXBlbmRlbmN5KG1ldGhvZFZPOk1ldGhvZFZPLCBlZmZlY3RzRGVwZW5kZW5jeTpib29sZWFuID0gZmFsc2UsIGluZGV4Om51bWJlciA9IC0xKVxuXHR7XG5cdFx0bWV0aG9kVk8ubWV0aG9kLmFkZEV2ZW50TGlzdGVuZXIoU2hhZGluZ01ldGhvZEV2ZW50LlNIQURFUl9JTlZBTElEQVRFRCwgdGhpcy5fb25TaGFkZXJJbnZhbGlkYXRlZERlbGVnYXRlKTtcblxuXHRcdGlmIChlZmZlY3RzRGVwZW5kZW5jeSkge1xuXHRcdFx0aWYgKGluZGV4ICE9IC0xKVxuXHRcdFx0XHR0aGlzLl9pTWV0aG9kVk9zLnNwbGljZShpbmRleCArIHRoaXMuX2lNZXRob2RWT3MubGVuZ3RoIC0gdGhpcy5fbnVtRWZmZWN0RGVwZW5kZW5jaWVzLCAwLCBtZXRob2RWTyk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHRoaXMuX2lNZXRob2RWT3MucHVzaChtZXRob2RWTyk7XG5cdFx0XHR0aGlzLl9udW1FZmZlY3REZXBlbmRlbmNpZXMrKztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faU1ldGhvZFZPcy5zcGxpY2UodGhpcy5faU1ldGhvZFZPcy5sZW5ndGggLSB0aGlzLl9udW1FZmZlY3REZXBlbmRlbmNpZXMsIDAsIG1ldGhvZFZPKTtcblx0XHR9XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3MoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBlbmRzIGFuIFwiZWZmZWN0XCIgc2hhZGluZyBtZXRob2QgdG8gdGhlIHNoYWRlci4gRWZmZWN0IG1ldGhvZHMgYXJlIHRob3NlIHRoYXQgZG8gbm90IGluZmx1ZW5jZSB0aGUgbGlnaHRpbmdcblx0ICogYnV0IG1vZHVsYXRlIHRoZSBzaGFkZWQgY29sb3VyLCB1c2VkIGZvciBmb2csIG91dGxpbmVzLCBldGMuIFRoZSBtZXRob2Qgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSByZXN1bHQgb2YgdGhlXG5cdCAqIG1ldGhvZHMgYWRkZWQgcHJpb3IuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRWZmZWN0TWV0aG9kKG1ldGhvZDpFZmZlY3RNZXRob2RCYXNlKVxuXHR7XG5cdFx0dGhpcy5fYWRkRGVwZW5kZW5jeShuZXcgTWV0aG9kVk8obWV0aG9kKSwgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG51bWJlciBvZiBcImVmZmVjdFwiIG1ldGhvZHMgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1FZmZlY3RNZXRob2RzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbnVtRWZmZWN0RGVwZW5kZW5jaWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFF1ZXJpZXMgd2hldGhlciBhIGdpdmVuIGVmZmVjdHMgbWV0aG9kIHdhcyBhZGRlZCB0byB0aGUgbWF0ZXJpYWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBiZSBxdWVyaWVkLlxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlIG1ldGhvZCB3YXMgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLCBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRwdWJsaWMgaGFzRWZmZWN0TWV0aG9kKG1ldGhvZDpFZmZlY3RNZXRob2RCYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5nZXREZXBlbmRlbmN5Rm9yTWV0aG9kKG1ldGhvZCkgIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBtZXRob2QgYWRkZWQgYXQgdGhlIGdpdmVuIGluZGV4LlxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBtZXRob2QgdG8gcmV0cmlldmUuXG5cdCAqIEByZXR1cm4gVGhlIG1ldGhvZCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RWZmZWN0TWV0aG9kQXQoaW5kZXg6bnVtYmVyKTpFZmZlY3RNZXRob2RCYXNlXG5cdHtcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5fbnVtRWZmZWN0RGVwZW5kZW5jaWVzIC0gMSlcblx0XHRcdHJldHVybiBudWxsO1xuXG5cdFx0cmV0dXJuIDxFZmZlY3RNZXRob2RCYXNlPiB0aGlzLl9pTWV0aG9kVk9zW2luZGV4ICsgdGhpcy5faU1ldGhvZFZPcy5sZW5ndGggLSB0aGlzLl9udW1FZmZlY3REZXBlbmRlbmNpZXNdLm1ldGhvZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVmZmVjdCBtZXRob2QgYXQgdGhlIHNwZWNpZmllZCBpbmRleCBhbW9uZ3N0IHRoZSBtZXRob2RzIGFscmVhZHkgYWRkZWQgdG8gdGhlIG1hdGVyaWFsLiBFZmZlY3Rcblx0ICogbWV0aG9kcyBhcmUgdGhvc2UgdGhhdCBkbyBub3QgaW5mbHVlbmNlIHRoZSBsaWdodGluZyBidXQgbW9kdWxhdGUgdGhlIHNoYWRlZCBjb2xvdXIsIHVzZWQgZm9yIGZvZywgb3V0bGluZXMsXG5cdCAqIGV0Yy4gVGhlIG1ldGhvZCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kcyB3aXRoIGEgbG93ZXIgaW5kZXguXG5cdCAqL1xuXHRwdWJsaWMgYWRkRWZmZWN0TWV0aG9kQXQobWV0aG9kOkVmZmVjdE1ldGhvZEJhc2UsIGluZGV4Om51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FkZERlcGVuZGVuY3kobmV3IE1ldGhvZFZPKG1ldGhvZCksIHRydWUsIGluZGV4KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIGVmZmVjdCBtZXRob2QgZnJvbSB0aGUgbWF0ZXJpYWwuXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBiZSByZW1vdmVkLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUVmZmVjdE1ldGhvZChtZXRob2Q6RWZmZWN0TWV0aG9kQmFzZSlcblx0e1xuXHRcdHZhciBtZXRob2RWTzpNZXRob2RWTyA9IHRoaXMuZ2V0RGVwZW5kZW5jeUZvck1ldGhvZChtZXRob2QpO1xuXG5cdFx0aWYgKG1ldGhvZFZPICE9IG51bGwpXG5cdFx0XHR0aGlzLl9yZW1vdmVEZXBlbmRlbmN5KG1ldGhvZFZPLCB0cnVlKTtcblx0fVxuXG5cblx0cHJpdmF0ZSBnZXREZXBlbmRlbmN5Rm9yTWV0aG9kKG1ldGhvZDpFZmZlY3RNZXRob2RCYXNlKTpNZXRob2RWT1xuXHR7XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9pTWV0aG9kVk9zLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47ICsraSlcblx0XHRcdGlmICh0aGlzLl9pTWV0aG9kVk9zW2ldLm1ldGhvZCA9PSBtZXRob2QpXG5cdFx0XHRcdHJldHVybiB0aGlzLl9pTWV0aG9kVk9zW2ldO1xuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBwZXItcGl4ZWwgbm9ybWFscy4gRGVmYXVsdHMgdG8gTm9ybWFsQmFzaWNNZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG5vcm1hbE1ldGhvZCgpOk5vcm1hbEJhc2ljTWV0aG9kXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faU5vcm1hbE1ldGhvZFZPPyA8Tm9ybWFsQmFzaWNNZXRob2Q+IHRoaXMuX2lOb3JtYWxNZXRob2RWTy5tZXRob2QgOiBudWxsO1xuXHR9XG5cblx0cHVibGljIHNldCBub3JtYWxNZXRob2QodmFsdWU6Tm9ybWFsQmFzaWNNZXRob2QpXG5cdHtcblx0XHRpZiAodGhpcy5faU5vcm1hbE1ldGhvZFZPICYmIHRoaXMuX2lOb3JtYWxNZXRob2RWTy5tZXRob2QgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRpZiAodGhpcy5faU5vcm1hbE1ldGhvZFZPKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVEZXBlbmRlbmN5KHRoaXMuX2lOb3JtYWxNZXRob2RWTyk7XG5cdFx0XHR0aGlzLl9pTm9ybWFsTWV0aG9kVk8gPSBudWxsO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0dGhpcy5faU5vcm1hbE1ldGhvZFZPID0gbmV3IE1ldGhvZFZPKHZhbHVlKTtcblx0XHRcdHRoaXMuX2FkZERlcGVuZGVuY3kodGhpcy5faU5vcm1hbE1ldGhvZFZPKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IHByb3ZpZGVzIHRoZSBhbWJpZW50IGxpZ2h0aW5nIGNvbnRyaWJ1dGlvbi4gRGVmYXVsdHMgdG8gQW1iaWVudEJhc2ljTWV0aG9kLlxuXHQgKi9cblx0cHVibGljIGdldCBhbWJpZW50TWV0aG9kKCk6QW1iaWVudEJhc2ljTWV0aG9kXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faUFtYmllbnRNZXRob2RWTz8gPEFtYmllbnRCYXNpY01ldGhvZD4gdGhpcy5faUFtYmllbnRNZXRob2RWTy5tZXRob2QgOiBudWxsO1xuXHR9XG5cblx0cHVibGljIHNldCBhbWJpZW50TWV0aG9kKHZhbHVlOkFtYmllbnRCYXNpY01ldGhvZClcblx0e1xuXHRcdGlmICh0aGlzLl9pQW1iaWVudE1ldGhvZFZPICYmIHRoaXMuX2lBbWJpZW50TWV0aG9kVk8ubWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX2lBbWJpZW50TWV0aG9kVk8pIHtcblx0XHRcdHRoaXMuX3JlbW92ZURlcGVuZGVuY3kodGhpcy5faUFtYmllbnRNZXRob2RWTyk7XG5cdFx0XHR0aGlzLl9pQW1iaWVudE1ldGhvZFZPID0gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuX2lBbWJpZW50TWV0aG9kVk8gPSBuZXcgTWV0aG9kVk8odmFsdWUpO1xuXHRcdFx0dGhpcy5fYWRkRGVwZW5kZW5jeSh0aGlzLl9pQW1iaWVudE1ldGhvZFZPKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB1c2VkIHRvIHJlbmRlciBzaGFkb3dzIGNhc3Qgb24gdGhpcyBzdXJmYWNlLCBvciBudWxsIGlmIG5vIHNoYWRvd3MgYXJlIHRvIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byBudWxsLlxuXHQgKi9cblx0cHVibGljIGdldCBzaGFkb3dNZXRob2QoKTpTaGFkb3dNYXBNZXRob2RCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faVNoYWRvd01ldGhvZFZPPyA8U2hhZG93TWFwTWV0aG9kQmFzZT4gdGhpcy5faVNoYWRvd01ldGhvZFZPLm1ldGhvZCA6IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNoYWRvd01ldGhvZCh2YWx1ZTpTaGFkb3dNYXBNZXRob2RCYXNlKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2lTaGFkb3dNZXRob2RWTyAmJiB0aGlzLl9pU2hhZG93TWV0aG9kVk8ubWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX2lTaGFkb3dNZXRob2RWTykge1xuXHRcdFx0dGhpcy5fcmVtb3ZlRGVwZW5kZW5jeSh0aGlzLl9pU2hhZG93TWV0aG9kVk8pO1xuXHRcdFx0dGhpcy5faVNoYWRvd01ldGhvZFZPID0gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuX2lTaGFkb3dNZXRob2RWTyA9IG5ldyBNZXRob2RWTyh2YWx1ZSk7XG5cdFx0XHR0aGlzLl9hZGREZXBlbmRlbmN5KHRoaXMuX2lTaGFkb3dNZXRob2RWTyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgZGlmZnVzZSBsaWdodGluZyBjb250cmlidXRpb24uIERlZmF1bHRzIHRvIERpZmZ1c2VCYXNpY01ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgZGlmZnVzZU1ldGhvZCgpOkRpZmZ1c2VCYXNpY01ldGhvZFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8/IDxEaWZmdXNlQmFzaWNNZXRob2Q+IHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8ubWV0aG9kIDogbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZGlmZnVzZU1ldGhvZCh2YWx1ZTpEaWZmdXNlQmFzaWNNZXRob2QpXG5cdHtcblx0XHRpZiAodGhpcy5faURpZmZ1c2VNZXRob2RWTyAmJiB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLm1ldGhvZCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9pRGlmZnVzZU1ldGhvZFZPKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVEZXBlbmRlbmN5KHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8pO1xuXHRcdFx0dGhpcy5faURpZmZ1c2VNZXRob2RWTyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHR0aGlzLl9pRGlmZnVzZU1ldGhvZFZPID0gbmV3IE1ldGhvZFZPKHZhbHVlKTtcblx0XHRcdHRoaXMuX2FkZERlcGVuZGVuY3kodGhpcy5faURpZmZ1c2VNZXRob2RWTyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgc3BlY3VsYXIgbGlnaHRpbmcgY29udHJpYnV0aW9uLiBEZWZhdWx0cyB0byBTcGVjdWxhckJhc2ljTWV0aG9kLlxuXHQgKi9cblx0cHVibGljIGdldCBzcGVjdWxhck1ldGhvZCgpOlNwZWN1bGFyQmFzaWNNZXRob2Rcblx0e1xuXHRcdHJldHVybiB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTz8gPFNwZWN1bGFyQmFzaWNNZXRob2Q+IHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLm1ldGhvZCA6IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHNwZWN1bGFyTWV0aG9kKHZhbHVlOlNwZWN1bGFyQmFzaWNNZXRob2QpXG5cdHtcblx0XHRpZiAodGhpcy5faVNwZWN1bGFyTWV0aG9kVk8gJiYgdGhpcy5faVNwZWN1bGFyTWV0aG9kVk8ubWV0aG9kID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYgKHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVEZXBlbmRlbmN5KHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPKTtcblx0XHRcdHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPID0gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPID0gbmV3IE1ldGhvZFZPKHZhbHVlKTtcblx0XHRcdHRoaXMuX2FkZERlcGVuZGVuY3kodGhpcy5faVNwZWN1bGFyTWV0aG9kVk8pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0c3VwZXIuZGlzcG9zZSgpO1xuXG5cdFx0d2hpbGUgKHRoaXMuX2lNZXRob2RWT3MubGVuZ3RoKVxuXHRcdFx0dGhpcy5fcmVtb3ZlRGVwZW5kZW5jeSh0aGlzLl9pTWV0aG9kVk9zWzBdKTtcblxuXHRcdHRoaXMuX2lNZXRob2RWT3MgPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFueSBtZXRob2QncyBzaGFkZXIgY29kZSBpcyBpbnZhbGlkYXRlZC5cblx0ICovXG5cdHByaXZhdGUgb25TaGFkZXJJbnZhbGlkYXRlZChldmVudDpTaGFkaW5nTWV0aG9kRXZlbnQpXG5cdHtcblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3MoKTtcblx0fVxuXG5cdC8vIFJFTkRFUiBMT09QXG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgX2lBY3RpdmF0ZShwYXNzOk1hdGVyaWFsUGFzc0RhdGEsIHN0YWdlOlN0YWdlLCBjYW1lcmE6Q2FtZXJhKVxuXHR7XG5cdFx0c3VwZXIuX2lBY3RpdmF0ZShwYXNzLCBzdGFnZSwgY2FtZXJhKTtcblxuXHRcdHZhciBtZXRob2RWTzpNZXRob2RWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2lNZXRob2RWT3MubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgKytpKSB7XG5cdFx0XHRtZXRob2RWTyA9IHRoaXMuX2lNZXRob2RWT3NbaV07XG5cdFx0XHRpZiAobWV0aG9kVk8udXNlTWV0aG9kKVxuXHRcdFx0XHRtZXRob2RWTy5tZXRob2QuaUFjdGl2YXRlKHBhc3Muc2hhZGVyT2JqZWN0LCBtZXRob2RWTywgc3RhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVuZGVyYWJsZVxuXHQgKiBAcGFyYW0gc3RhZ2Vcblx0ICogQHBhcmFtIGNhbWVyYVxuXHQgKi9cblx0cHVibGljIHNldFJlbmRlclN0YXRlKHBhc3M6TWF0ZXJpYWxQYXNzRGF0YSwgcmVuZGVyYWJsZTpSZW5kZXJhYmxlQmFzZSwgc3RhZ2U6U3RhZ2UsIGNhbWVyYTpDYW1lcmEsIHZpZXdQcm9qZWN0aW9uOk1hdHJpeDNEKVxuXHR7XG5cdFx0c3VwZXIuc2V0UmVuZGVyU3RhdGUocGFzcywgcmVuZGVyYWJsZSwgc3RhZ2UsIGNhbWVyYSwgdmlld1Byb2plY3Rpb24pO1xuXG5cdFx0dmFyIG1ldGhvZFZPOk1ldGhvZFZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5faU1ldGhvZFZPcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyArK2kpIHtcblx0XHRcdG1ldGhvZFZPID0gdGhpcy5faU1ldGhvZFZPc1tpXTtcblx0XHRcdGlmIChtZXRob2RWTy51c2VNZXRob2QpXG5cdFx0XHRcdG1ldGhvZFZPLm1ldGhvZC5pU2V0UmVuZGVyU3RhdGUocGFzcy5zaGFkZXJPYmplY3QsIG1ldGhvZFZPLCByZW5kZXJhYmxlLCBzdGFnZSwgY2FtZXJhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBfaURlYWN0aXZhdGUocGFzczpNYXRlcmlhbFBhc3NEYXRhLCBzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHN1cGVyLl9pRGVhY3RpdmF0ZShwYXNzLCBzdGFnZSk7XG5cblx0XHR2YXIgbWV0aG9kVk86TWV0aG9kVk87XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9pTWV0aG9kVk9zLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47ICsraSkge1xuXHRcdFx0bWV0aG9kVk8gPSB0aGlzLl9pTWV0aG9kVk9zW2ldO1xuXHRcdFx0aWYgKG1ldGhvZFZPLnVzZU1ldGhvZClcblx0XHRcdFx0bWV0aG9kVk8ubWV0aG9kLmlEZWFjdGl2YXRlKHBhc3Muc2hhZGVyT2JqZWN0LCBtZXRob2RWTywgc3RhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBfaUluY2x1ZGVEZXBlbmRlbmNpZXMoc2hhZGVyT2JqZWN0OlNoYWRlckxpZ2h0aW5nT2JqZWN0KVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5faU1ldGhvZFZPcy5sZW5ndGg7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgKytpKVxuXHRcdFx0dGhpcy5zZXR1cEFuZENvdW50RGVwZW5kZW5jaWVzKHNoYWRlck9iamVjdCwgdGhpcy5faU1ldGhvZFZPc1tpXSk7XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpXG5cdFx0XHR0aGlzLl9pTWV0aG9kVk9zW2ldLnVzZU1ldGhvZCA9IHRoaXMuX2lNZXRob2RWT3NbaV0ubWV0aG9kLmlJc1VzZWQoc2hhZGVyT2JqZWN0KTtcblxuXHRcdHN1cGVyLl9pSW5jbHVkZURlcGVuZGVuY2llcyhzaGFkZXJPYmplY3QpO1xuXHR9XG5cblxuXHQvKipcblx0ICogQ291bnRzIHRoZSBkZXBlbmRlbmNpZXMgZm9yIGEgZ2l2ZW4gbWV0aG9kLlxuXHQgKiBAcGFyYW0gbWV0aG9kIFRoZSBtZXRob2QgdG8gY291bnQgdGhlIGRlcGVuZGVuY2llcyBmb3IuXG5cdCAqIEBwYXJhbSBtZXRob2RWTyBUaGUgbWV0aG9kJ3MgZGF0YSBmb3IgdGhpcyBtYXRlcmlhbC5cblx0ICovXG5cdHByaXZhdGUgc2V0dXBBbmRDb3VudERlcGVuZGVuY2llcyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8pXG5cdHtcblx0XHRtZXRob2RWTy5yZXNldCgpO1xuXG5cdFx0bWV0aG9kVk8ubWV0aG9kLmlJbml0Vk8oc2hhZGVyT2JqZWN0LCBtZXRob2RWTyk7XG5cblx0XHRpZiAobWV0aG9kVk8ubmVlZHNQcm9qZWN0aW9uKVxuXHRcdFx0c2hhZGVyT2JqZWN0LnByb2plY3Rpb25EZXBlbmRlbmNpZXMrKztcblxuXHRcdGlmIChtZXRob2RWTy5uZWVkc0dsb2JhbFZlcnRleFBvcykge1xuXG5cdFx0XHRzaGFkZXJPYmplY3QuZ2xvYmFsUG9zRGVwZW5kZW5jaWVzKys7XG5cblx0XHRcdGlmIChtZXRob2RWTy5uZWVkc0dsb2JhbEZyYWdtZW50UG9zKVxuXHRcdFx0XHRzaGFkZXJPYmplY3QudXNlc0dsb2JhbFBvc0ZyYWdtZW50ID0gdHJ1ZTtcblxuXHRcdH0gZWxzZSBpZiAobWV0aG9kVk8ubmVlZHNHbG9iYWxGcmFnbWVudFBvcykge1xuXHRcdFx0c2hhZGVyT2JqZWN0Lmdsb2JhbFBvc0RlcGVuZGVuY2llcysrO1xuXHRcdFx0c2hhZGVyT2JqZWN0LnVzZXNHbG9iYWxQb3NGcmFnbWVudCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKG1ldGhvZFZPLm5lZWRzTm9ybWFscylcblx0XHRcdHNoYWRlck9iamVjdC5ub3JtYWxEZXBlbmRlbmNpZXMrKztcblxuXHRcdGlmIChtZXRob2RWTy5uZWVkc1RhbmdlbnRzKVxuXHRcdFx0c2hhZGVyT2JqZWN0LnRhbmdlbnREZXBlbmRlbmNpZXMrKztcblxuXHRcdGlmIChtZXRob2RWTy5uZWVkc1ZpZXcpXG5cdFx0XHRzaGFkZXJPYmplY3Qudmlld0RpckRlcGVuZGVuY2llcysrO1xuXG5cdFx0aWYgKG1ldGhvZFZPLm5lZWRzVVYpXG5cdFx0XHRzaGFkZXJPYmplY3QudXZEZXBlbmRlbmNpZXMrKztcblxuXHRcdGlmIChtZXRob2RWTy5uZWVkc1NlY29uZGFyeVVWKVxuXHRcdFx0c2hhZGVyT2JqZWN0LnNlY29uZGFyeVVWRGVwZW5kZW5jaWVzKys7XG5cdH1cblxuXHRwdWJsaWMgX2lHZXRQcmVMaWdodGluZ1ZlcnRleENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcIlwiO1xuXG5cdFx0aWYgKHRoaXMuX2lBbWJpZW50TWV0aG9kVk8gJiYgdGhpcy5faUFtYmllbnRNZXRob2RWTy51c2VNZXRob2QpXG5cdFx0XHRjb2RlICs9IHRoaXMuX2lBbWJpZW50TWV0aG9kVk8ubWV0aG9kLmlHZXRWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdCwgdGhpcy5faUFtYmllbnRNZXRob2RWTywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblxuXHRcdGlmICh0aGlzLl9pRGlmZnVzZU1ldGhvZFZPICYmIHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8udXNlTWV0aG9kKVxuXHRcdFx0Y29kZSArPSB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLm1ldGhvZC5pR2V0VmVydGV4Q29kZShzaGFkZXJPYmplY3QsIHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8sIHJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVycyk7XG5cblx0XHRpZiAodGhpcy5faVNwZWN1bGFyTWV0aG9kVk8gJiYgdGhpcy5faVNwZWN1bGFyTWV0aG9kVk8udXNlTWV0aG9kKVxuXHRcdFx0Y29kZSArPSB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTy5tZXRob2QuaUdldFZlcnRleENvZGUoc2hhZGVyT2JqZWN0LCB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0cHVibGljIF9pR2V0UHJlTGlnaHRpbmdGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcIlwiO1xuXG5cdFx0aWYgKHRoaXMuX2lBbWJpZW50TWV0aG9kVk8gJiYgdGhpcy5faUFtYmllbnRNZXRob2RWTy51c2VNZXRob2QpIHtcblx0XHRcdGNvZGUgKz0gdGhpcy5faUFtYmllbnRNZXRob2RWTy5tZXRob2QuaUdldEZyYWdtZW50Q29kZShzaGFkZXJPYmplY3QsIHRoaXMuX2lBbWJpZW50TWV0aG9kVk8sIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQsIHJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVycyk7XG5cblx0XHRcdGlmICh0aGlzLl9pQW1iaWVudE1ldGhvZFZPLm5lZWRzTm9ybWFscylcblx0XHRcdFx0cmVnaXN0ZXJDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQpO1xuXG5cdFx0XHRpZiAodGhpcy5faUFtYmllbnRNZXRob2RWTy5uZWVkc1ZpZXcpXG5cdFx0XHRcdHJlZ2lzdGVyQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2Uoc2hhcmVkUmVnaXN0ZXJzLnZpZXdEaXJGcmFnbWVudCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8gJiYgdGhpcy5faURpZmZ1c2VNZXRob2RWTy51c2VNZXRob2QpXG5cdFx0XHRjb2RlICs9ICg8TGlnaHRpbmdNZXRob2RCYXNlPiB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLm1ldGhvZCkuaUdldEZyYWdtZW50UHJlTGlnaHRpbmdDb2RlKDxTaGFkZXJMaWdodGluZ09iamVjdD4gc2hhZGVyT2JqZWN0LCB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLCByZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnMpO1xuXG5cdFx0aWYgKHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPICYmIHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLnVzZU1ldGhvZClcblx0XHRcdGNvZGUgKz0gKDxMaWdodGluZ01ldGhvZEJhc2U+IHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLm1ldGhvZCkuaUdldEZyYWdtZW50UHJlTGlnaHRpbmdDb2RlKDxTaGFkZXJMaWdodGluZ09iamVjdD4gc2hhZGVyT2JqZWN0LCB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0cHVibGljIF9pR2V0UGVyTGlnaHREaWZmdXNlRnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJMaWdodGluZ09iamVjdCwgbGlnaHREaXJSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCBkaWZmdXNlQ29sb3JSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICg8TGlnaHRpbmdNZXRob2RCYXNlPiB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLm1ldGhvZCkuaUdldEZyYWdtZW50Q29kZVBlckxpZ2h0KHNoYWRlck9iamVjdCwgdGhpcy5faURpZmZ1c2VNZXRob2RWTywgbGlnaHREaXJSZWcsIGRpZmZ1c2VDb2xvclJlZywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFBlckxpZ2h0U3BlY3VsYXJGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlckxpZ2h0aW5nT2JqZWN0LCBsaWdodERpclJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHNwZWN1bGFyQ29sb3JSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICg8TGlnaHRpbmdNZXRob2RCYXNlPiB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTy5tZXRob2QpLmlHZXRGcmFnbWVudENvZGVQZXJMaWdodChzaGFkZXJPYmplY3QsIHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLCBsaWdodERpclJlZywgc3BlY3VsYXJDb2xvclJlZywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFBlclByb2JlRGlmZnVzZUZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyTGlnaHRpbmdPYmplY3QsIHRleFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHdlaWdodFJlZzpzdHJpbmcsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKDxMaWdodGluZ01ldGhvZEJhc2U+IHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8ubWV0aG9kKS5pR2V0RnJhZ21lbnRDb2RlUGVyUHJvYmUoc2hhZGVyT2JqZWN0LCB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLCB0ZXhSZWcsIHdlaWdodFJlZywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFBlclByb2JlU3BlY3VsYXJGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlckxpZ2h0aW5nT2JqZWN0LCB0ZXhSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB3ZWlnaHRSZWc6c3RyaW5nLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuICg8TGlnaHRpbmdNZXRob2RCYXNlPiB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTy5tZXRob2QpLmlHZXRGcmFnbWVudENvZGVQZXJQcm9iZShzaGFkZXJPYmplY3QsIHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLCB0ZXhSZWcsIHdlaWdodFJlZywgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFBvc3RMaWdodGluZ1ZlcnRleENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlckxpZ2h0aW5nT2JqZWN0LCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIGNvZGU6c3RyaW5nID0gXCJcIjtcblxuXHRcdGlmICh0aGlzLl9pU2hhZG93TWV0aG9kVk8pXG5cdFx0XHRjb2RlICs9IHRoaXMuX2lTaGFkb3dNZXRob2RWTy5tZXRob2QuaUdldFZlcnRleENvZGUoc2hhZGVyT2JqZWN0LCB0aGlzLl9pU2hhZG93TWV0aG9kVk8sIHJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVycyk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdHB1YmxpYyBfaUdldFBvc3RMaWdodGluZ0ZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyTGlnaHRpbmdPYmplY3QsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcIlwiO1xuXG5cdFx0aWYgKHNoYWRlck9iamVjdC51c2VBbHBoYVByZW11bHRpcGxpZWQgJiYgdGhpcy5fcEVuYWJsZUJsZW5kaW5nKSB7XG5cdFx0XHRjb2RlICs9IFwiYWRkIFwiICsgc2hhcmVkUmVnaXN0ZXJzLnNoYWRlZFRhcmdldCArIFwiLncsIFwiICsgc2hhcmVkUmVnaXN0ZXJzLnNoYWRlZFRhcmdldCArIFwiLncsIFwiICsgc2hhcmVkUmVnaXN0ZXJzLmNvbW1vbnMgKyBcIi56XFxuXCIgK1xuXHRcdFx0XHRcImRpdiBcIiArIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQgKyBcIi54eXosIFwiICsgc2hhcmVkUmVnaXN0ZXJzLnNoYWRlZFRhcmdldCArIFwiLCBcIiArIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQgKyBcIi53XFxuXCIgK1xuXHRcdFx0XHRcInN1YiBcIiArIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQgKyBcIi53LCBcIiArIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQgKyBcIi53LCBcIiArIHNoYXJlZFJlZ2lzdGVycy5jb21tb25zICsgXCIuelxcblwiICtcblx0XHRcdFx0XCJzYXQgXCIgKyBzaGFyZWRSZWdpc3RlcnMuc2hhZGVkVGFyZ2V0ICsgXCIueHl6LCBcIiArIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQgKyBcIlxcblwiO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pU2hhZG93TWV0aG9kVk8pXG5cdFx0XHRjb2RlICs9IHRoaXMuX2lTaGFkb3dNZXRob2RWTy5tZXRob2QuaUdldEZyYWdtZW50Q29kZShzaGFkZXJPYmplY3QsIHRoaXMuX2lTaGFkb3dNZXRob2RWTywgc2hhcmVkUmVnaXN0ZXJzLnNoYWRvd1RhcmdldCwgcmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzKTtcblxuXHRcdGlmICh0aGlzLl9pRGlmZnVzZU1ldGhvZFZPICYmIHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8udXNlTWV0aG9kKSB7XG5cdFx0XHRjb2RlICs9ICg8TGlnaHRpbmdNZXRob2RCYXNlPiB0aGlzLl9pRGlmZnVzZU1ldGhvZFZPLm1ldGhvZCkuaUdldEZyYWdtZW50UG9zdExpZ2h0aW5nQ29kZShzaGFkZXJPYmplY3QsIHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8sIHNoYXJlZFJlZ2lzdGVycy5zaGFkZWRUYXJnZXQsIHJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVycyk7XG5cblx0XHRcdC8vIHJlc29sdmUgb3RoZXIgZGVwZW5kZW5jaWVzIGFzIHdlbGw/XG5cdFx0XHRpZiAodGhpcy5faURpZmZ1c2VNZXRob2RWTy5uZWVkc05vcm1hbHMpXG5cdFx0XHRcdHJlZ2lzdGVyQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2Uoc2hhcmVkUmVnaXN0ZXJzLm5vcm1hbEZyYWdtZW50KTtcblxuXHRcdFx0aWYgKHRoaXMuX2lEaWZmdXNlTWV0aG9kVk8ubmVlZHNWaWV3KVxuXHRcdFx0XHRyZWdpc3RlckNhY2hlLnJlbW92ZUZyYWdtZW50VGVtcFVzYWdlKHNoYXJlZFJlZ2lzdGVycy52aWV3RGlyRnJhZ21lbnQpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pU3BlY3VsYXJNZXRob2RWTyAmJiB0aGlzLl9pU3BlY3VsYXJNZXRob2RWTy51c2VNZXRob2QpIHtcblx0XHRcdGNvZGUgKz0gKDxMaWdodGluZ01ldGhvZEJhc2U+IHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLm1ldGhvZCkuaUdldEZyYWdtZW50UG9zdExpZ2h0aW5nQ29kZShzaGFkZXJPYmplY3QsIHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLCBzaGFyZWRSZWdpc3RlcnMuc2hhZGVkVGFyZ2V0LCByZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnMpO1xuXHRcdFx0aWYgKHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLm5lZWRzTm9ybWFscylcblx0XHRcdFx0cmVnaXN0ZXJDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQpO1xuXHRcdFx0aWYgKHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPLm5lZWRzVmlldylcblx0XHRcdFx0cmVnaXN0ZXJDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faVNoYWRvd01ldGhvZFZPKVxuXHRcdFx0cmVnaXN0ZXJDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShzaGFyZWRSZWdpc3RlcnMuc2hhZG93VGFyZ2V0KTtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBub3JtYWxzIGFyZSBhbGxvd2VkIGluIHRhbmdlbnQgc3BhY2UuIFRoaXMgaXMgb25seSB0aGUgY2FzZSBpZiBubyBvYmplY3Qtc3BhY2Vcblx0ICogZGVwZW5kZW5jaWVzIGV4aXN0LlxuXHQgKi9cblx0cHVibGljIF9wVXNlc1RhbmdlbnRTcGFjZShzaGFkZXJPYmplY3Q6U2hhZGVyTGlnaHRpbmdPYmplY3QpOmJvb2xlYW5cblx0e1xuXHRcdGlmIChzaGFkZXJPYmplY3QudXNlc1Byb2Jlcylcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBtZXRob2RWTzpNZXRob2RWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2lNZXRob2RWT3MubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgKytpKSB7XG5cdFx0XHRtZXRob2RWTyA9IHRoaXMuX2lNZXRob2RWT3NbaV07XG5cdFx0XHRpZiAobWV0aG9kVk8udXNlTWV0aG9kICYmICFtZXRob2RWTy5tZXRob2QuaVVzZXNUYW5nZW50U3BhY2UoKSlcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCBub3JtYWxzIGFyZSBvdXRwdXQgaW4gdGFuZ2VudCBzcGFjZS5cblx0ICovXG5cdHB1YmxpYyBfcE91dHB1dHNUYW5nZW50Tm9ybWFscyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuICg8Tm9ybWFsQmFzaWNNZXRob2Q+IHRoaXMuX2lOb3JtYWxNZXRob2RWTy5tZXRob2QpLmlPdXRwdXRzVGFuZ2VudE5vcm1hbHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3Qgbm9ybWFscyBhcmUgb3V0cHV0IGJ5IHRoZSBwYXNzLlxuXHQgKi9cblx0cHVibGljIF9wT3V0cHV0c05vcm1hbHMoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9pTm9ybWFsTWV0aG9kVk8gJiYgdGhpcy5faU5vcm1hbE1ldGhvZFZPLnVzZU1ldGhvZDtcblx0fVxuXG5cblx0cHVibGljIF9pR2V0Tm9ybWFsVmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiB0aGlzLl9pTm9ybWFsTWV0aG9kVk8ubWV0aG9kLmlHZXRWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdCwgdGhpcy5faU5vcm1hbE1ldGhvZFZPLCByZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnMpO1xuXHR9XG5cblx0cHVibGljIF9pR2V0Tm9ybWFsRnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIGNvZGU6c3RyaW5nID0gdGhpcy5faU5vcm1hbE1ldGhvZFZPLm1ldGhvZC5pR2V0RnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdCwgdGhpcy5faU5vcm1hbE1ldGhvZFZPLCBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQsIHJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVycyk7XG5cblx0XHRpZiAodGhpcy5faU5vcm1hbE1ldGhvZFZPLm5lZWRzVmlldylcblx0XHRcdHJlZ2lzdGVyQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2Uoc2hhcmVkUmVnaXN0ZXJzLnZpZXdEaXJGcmFnbWVudCk7XG5cblx0XHRpZiAodGhpcy5faU5vcm1hbE1ldGhvZFZPLm5lZWRzR2xvYmFsRnJhZ21lbnRQb3MgfHwgdGhpcy5faU5vcm1hbE1ldGhvZFZPLm5lZWRzR2xvYmFsVmVydGV4UG9zKVxuXHRcdFx0cmVnaXN0ZXJDYWNoZS5yZW1vdmVWZXJ0ZXhUZW1wVXNhZ2Uoc2hhcmVkUmVnaXN0ZXJzLmdsb2JhbFBvc2l0aW9uVmVydGV4KTtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgX2lHZXRWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWc6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiXCI7XG5cdFx0dmFyIG1ldGhvZFZPOk1ldGhvZFZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5faU1ldGhvZFZPcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSBsZW4gLSB0aGlzLl9udW1FZmZlY3REZXBlbmRlbmNpZXM7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0bWV0aG9kVk8gPSB0aGlzLl9pTWV0aG9kVk9zW2ldO1xuXHRcdFx0aWYgKG1ldGhvZFZPLnVzZU1ldGhvZCkge1xuXHRcdFx0XHRjb2RlICs9IG1ldGhvZFZPLm1ldGhvZC5pR2V0VmVydGV4Q29kZShzaGFkZXJPYmplY3QsIG1ldGhvZFZPLCByZWdDYWNoZSwgc2hhcmVkUmVnKTtcblxuXHRcdFx0XHRpZiAobWV0aG9kVk8ubmVlZHNHbG9iYWxWZXJ0ZXhQb3MgfHwgbWV0aG9kVk8ubmVlZHNHbG9iYWxGcmFnbWVudFBvcylcblx0XHRcdFx0XHRyZWdDYWNoZS5yZW1vdmVWZXJ0ZXhUZW1wVXNhZ2Uoc2hhcmVkUmVnLmdsb2JhbFBvc2l0aW9uVmVydGV4KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5faUNvbG9yVHJhbnNmb3JtTWV0aG9kVk8gJiYgdGhpcy5faUNvbG9yVHJhbnNmb3JtTWV0aG9kVk8udXNlTWV0aG9kKVxuXHRcdFx0Y29kZSArPSB0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTy5tZXRob2QuaUdldFZlcnRleENvZGUoc2hhZGVyT2JqZWN0LCB0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTywgcmVnQ2FjaGUsIHNoYXJlZFJlZyk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIF9pR2V0RnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWc6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiXCI7XG5cdFx0dmFyIGFscGhhUmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudDtcblxuXHRcdGlmICh0aGlzLnByZXNlcnZlQWxwaGEgJiYgdGhpcy5fbnVtRWZmZWN0RGVwZW5kZW5jaWVzID4gMCkge1xuXHRcdFx0YWxwaGFSZWcgPSByZWdDYWNoZS5nZXRGcmVlRnJhZ21lbnRTaW5nbGVUZW1wKCk7XG5cdFx0XHRyZWdDYWNoZS5hZGRGcmFnbWVudFRlbXBVc2FnZXMoYWxwaGFSZWcsIDEpO1xuXHRcdFx0Y29kZSArPSBcIm1vdiBcIiArIGFscGhhUmVnICsgXCIsIFwiICsgc2hhcmVkUmVnLnNoYWRlZFRhcmdldCArIFwiLndcXG5cIjtcblx0XHR9XG5cblx0XHR2YXIgbWV0aG9kVk86TWV0aG9kVk87XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9pTWV0aG9kVk9zLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IGxlbiAtIHRoaXMuX251bUVmZmVjdERlcGVuZGVuY2llczsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRtZXRob2RWTyA9IHRoaXMuX2lNZXRob2RWT3NbaV07XG5cdFx0XHRpZiAobWV0aG9kVk8udXNlTWV0aG9kKSB7XG5cdFx0XHRcdGNvZGUgKz0gbWV0aG9kVk8ubWV0aG9kLmlHZXRGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0LCBtZXRob2RWTywgc2hhcmVkUmVnLnNoYWRlZFRhcmdldCwgcmVnQ2FjaGUsIHNoYXJlZFJlZyk7XG5cblx0XHRcdFx0aWYgKG1ldGhvZFZPLm5lZWRzTm9ybWFscylcblx0XHRcdFx0XHRyZWdDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShzaGFyZWRSZWcubm9ybWFsRnJhZ21lbnQpO1xuXG5cdFx0XHRcdGlmIChtZXRob2RWTy5uZWVkc1ZpZXcpXG5cdFx0XHRcdFx0cmVnQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2Uoc2hhcmVkUmVnLnZpZXdEaXJGcmFnbWVudCk7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcmVzZXJ2ZUFscGhhICYmIHRoaXMuX251bUVmZmVjdERlcGVuZGVuY2llcyA+IDApIHtcblx0XHRcdGNvZGUgKz0gXCJtb3YgXCIgKyBzaGFyZWRSZWcuc2hhZGVkVGFyZ2V0ICsgXCIudywgXCIgKyBhbHBoYVJlZyArIFwiXFxuXCI7XG5cdFx0XHRyZWdDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZShhbHBoYVJlZyk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPICYmIHRoaXMuX2lDb2xvclRyYW5zZm9ybU1ldGhvZFZPLnVzZU1ldGhvZClcblx0XHRcdGNvZGUgKz0gdGhpcy5faUNvbG9yVHJhbnNmb3JtTWV0aG9kVk8ubWV0aG9kLmlHZXRGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0LCB0aGlzLl9pQ29sb3JUcmFuc2Zvcm1NZXRob2RWTywgc2hhcmVkUmVnLnNoYWRlZFRhcmdldCwgcmVnQ2FjaGUsIHNoYXJlZFJlZyk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNoYWRlciB1c2VzIGFueSBzaGFkb3dzLlxuXHQgKi9cblx0cHVibGljIF9pVXNlc1NoYWRvd3MoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLl9pU2hhZG93TWV0aG9kVk8gfHwgdGhpcy5saWdodFBpY2tlci5jYXN0aW5nRGlyZWN0aW9uYWxMaWdodHMubGVuZ3RoID4gMCB8fCB0aGlzLmxpZ2h0UGlja2VyLmNhc3RpbmdQb2ludExpZ2h0cy5sZW5ndGggPiAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc2hhZGVyIHVzZXMgYW55IHNwZWN1bGFyIGNvbXBvbmVudC5cblx0ICovXG5cdHB1YmxpYyBfaVVzZXNTcGVjdWxhcigpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMuX2lTcGVjdWxhck1ldGhvZFZPKTtcblx0fVxufVxuXG5leHBvcnQgPSBUcmlhbmdsZU1ldGhvZFBhc3M7Il19