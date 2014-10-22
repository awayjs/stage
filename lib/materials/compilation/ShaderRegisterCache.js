var RegisterPool = require("awayjs-stagegl/lib/materials/compilation/RegisterPool");
var ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
/**
 * ShaderRegister Cache provides the usage management system for all registers during shading compilation.
 */
var ShaderRegisterCache = (function () {
    /**
     * Create a new ShaderRegisterCache object.
     *
     * @param profile The compatibility profile used by the renderer.
     */
    function ShaderRegisterCache(profile) {
        this._numUsedVertexConstants = 0;
        this._numUsedFragmentConstants = 0;
        this._numUsedStreams = 0;
        this._numUsedTextures = 0;
        this._numUsedVaryings = 0;
        this._profile = profile;
    }
    /**
     * Resets all registers.
     */
    ShaderRegisterCache.prototype.reset = function () {
        this._fragmentTempCache = new RegisterPool("ft", 8, false);
        this._vertexTempCache = new RegisterPool("vt", 8, false);
        this._varyingCache = new RegisterPool("v", 8);
        this._textureCache = new RegisterPool("fs", 8);
        this._vertexAttributesCache = new RegisterPool("va", 8);
        this._fragmentConstantsCache = new RegisterPool("fc", 28);
        this._vertexConstantsCache = new RegisterPool("vc", 128);
        this._fragmentOutputRegister = new ShaderRegisterElement("oc", -1);
        this._vertexOutputRegister = new ShaderRegisterElement("op", -1);
        this._numUsedVertexConstants = 0;
        this._numUsedStreams = 0;
        this._numUsedTextures = 0;
        this._numUsedVaryings = 0;
        this._numUsedFragmentConstants = 0;
        var i;
        for (i = 0; i < this._vertexAttributesOffset; ++i)
            this.getFreeVertexAttribute();
        for (i = 0; i < this._vertexConstantOffset; ++i)
            this.getFreeVertexConstant();
        for (i = 0; i < this._varyingsOffset; ++i)
            this.getFreeVarying();
        for (i = 0; i < this._fragmentConstantOffset; ++i)
            this.getFreeFragmentConstant();
    };
    /**
     * Disposes all resources used.
     */
    ShaderRegisterCache.prototype.dispose = function () {
        this._fragmentTempCache.dispose();
        this._vertexTempCache.dispose();
        this._varyingCache.dispose();
        this._fragmentConstantsCache.dispose();
        this._vertexAttributesCache.dispose();
        this._fragmentTempCache = null;
        this._vertexTempCache = null;
        this._varyingCache = null;
        this._fragmentConstantsCache = null;
        this._vertexAttributesCache = null;
        this._fragmentOutputRegister = null;
        this._vertexOutputRegister = null;
    };
    /**
     * Marks a fragment temporary register as used, so it cannot be retrieved. The register won't be able to be used until removeUsage
     * has been called usageCount times again.
     * @param register The register to mark as used.
     * @param usageCount The amount of usages to add.
     */
    ShaderRegisterCache.prototype.addFragmentTempUsages = function (register, usageCount) {
        this._fragmentTempCache.addUsage(register, usageCount);
    };
    /**
     * Removes a usage from a fragment temporary register. When usages reach 0, the register is freed again.
     * @param register The register for which to remove a usage.
     */
    ShaderRegisterCache.prototype.removeFragmentTempUsage = function (register) {
        this._fragmentTempCache.removeUsage(register);
    };
    /**
     * Marks a vertex temporary register as used, so it cannot be retrieved. The register won't be able to be used
     * until removeUsage has been called usageCount times again.
     * @param register The register to mark as used.
     * @param usageCount The amount of usages to add.
     */
    ShaderRegisterCache.prototype.addVertexTempUsages = function (register, usageCount) {
        this._vertexTempCache.addUsage(register, usageCount);
    };
    /**
     * Removes a usage from a vertex temporary register. When usages reach 0, the register is freed again.
     * @param register The register for which to remove a usage.
     */
    ShaderRegisterCache.prototype.removeVertexTempUsage = function (register) {
        this._vertexTempCache.removeUsage(register);
    };
    /**
     * Retrieve an entire fragment temporary register that's still available. The register won't be able to be used until removeUsage
     * has been called usageCount times again.
     */
    ShaderRegisterCache.prototype.getFreeFragmentVectorTemp = function () {
        return this._fragmentTempCache.requestFreeVectorReg();
    };
    /**
     * Retrieve a single component from a fragment temporary register that's still available.
     */
    ShaderRegisterCache.prototype.getFreeFragmentSingleTemp = function () {
        return this._fragmentTempCache.requestFreeRegComponent();
    };
    /**
     * Retrieve an available varying register
     */
    ShaderRegisterCache.prototype.getFreeVarying = function () {
        ++this._numUsedVaryings;
        return this._varyingCache.requestFreeVectorReg();
    };
    /**
     * Retrieve an available fragment constant register
     */
    ShaderRegisterCache.prototype.getFreeFragmentConstant = function () {
        ++this._numUsedFragmentConstants;
        return this._fragmentConstantsCache.requestFreeVectorReg();
    };
    /**
     * Retrieve an available vertex constant register
     */
    ShaderRegisterCache.prototype.getFreeVertexConstant = function () {
        ++this._numUsedVertexConstants;
        return this._vertexConstantsCache.requestFreeVectorReg();
    };
    /**
     * Retrieve an entire vertex temporary register that's still available.
     */
    ShaderRegisterCache.prototype.getFreeVertexVectorTemp = function () {
        return this._vertexTempCache.requestFreeVectorReg();
    };
    /**
     * Retrieve a single component from a vertex temporary register that's still available.
     */
    ShaderRegisterCache.prototype.getFreeVertexSingleTemp = function () {
        return this._vertexTempCache.requestFreeRegComponent();
    };
    /**
     * Retrieve an available vertex attribute register
     */
    ShaderRegisterCache.prototype.getFreeVertexAttribute = function () {
        ++this._numUsedStreams;
        return this._vertexAttributesCache.requestFreeVectorReg();
    };
    /**
     * Retrieve an available texture register
     */
    ShaderRegisterCache.prototype.getFreeTextureReg = function () {
        ++this._numUsedTextures;
        return this._textureCache.requestFreeVectorReg();
    };
    Object.defineProperty(ShaderRegisterCache.prototype, "vertexConstantOffset", {
        /**
         * Indicates the start index from which to retrieve vertex constants.
         */
        get: function () {
            return this._vertexConstantOffset;
        },
        set: function (vertexConstantOffset) {
            this._vertexConstantOffset = vertexConstantOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "vertexAttributesOffset", {
        /**
         * Indicates the start index from which to retrieve vertex attributes.
         */
        get: function () {
            return this._vertexAttributesOffset;
        },
        set: function (value) {
            this._vertexAttributesOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "varyingsOffset", {
        /**
         * Indicates the start index from which to retrieve varying registers.
         */
        get: function () {
            return this._varyingsOffset;
        },
        set: function (value) {
            this._varyingsOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "fragmentConstantOffset", {
        /**
         * Indicates the start index from which to retrieve fragment constants.
         */
        get: function () {
            return this._fragmentConstantOffset;
        },
        set: function (value) {
            this._fragmentConstantOffset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "fragmentOutputRegister", {
        /**
         * The fragment output register.
         */
        get: function () {
            return this._fragmentOutputRegister;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "numUsedVertexConstants", {
        /**
         * The amount of used vertex constant registers.
         */
        get: function () {
            return this._numUsedVertexConstants;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "numUsedFragmentConstants", {
        /**
         * The amount of used fragment constant registers.
         */
        get: function () {
            return this._numUsedFragmentConstants;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "numUsedStreams", {
        /**
         * The amount of used vertex streams.
         */
        get: function () {
            return this._numUsedStreams;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "numUsedTextures", {
        /**
         * The amount of used texture slots.
         */
        get: function () {
            return this._numUsedTextures;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderRegisterCache.prototype, "numUsedVaryings", {
        /**
         * The amount of used varying registers.
         */
        get: function () {
            return this._numUsedVaryings;
        },
        enumerable: true,
        configurable: true
    });
    return ShaderRegisterCache;
})();
module.exports = ShaderRegisterCache;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9jb21waWxhdGlvbi9zaGFkZXJyZWdpc3RlcmNhY2hlLnRzIl0sIm5hbWVzIjpbIlNoYWRlclJlZ2lzdGVyQ2FjaGUiLCJTaGFkZXJSZWdpc3RlckNhY2hlLmNvbnN0cnVjdG9yIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5yZXNldCIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUuZGlzcG9zZSIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUuYWRkRnJhZ21lbnRUZW1wVXNhZ2VzIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZSIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUuYWRkVmVydGV4VGVtcFVzYWdlcyIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUucmVtb3ZlVmVydGV4VGVtcFVzYWdlIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5nZXRGcmVlRnJhZ21lbnRWZWN0b3JUZW1wIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5nZXRGcmVlRnJhZ21lbnRTaW5nbGVUZW1wIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5nZXRGcmVlVmFyeWluZyIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUuZ2V0RnJlZUZyYWdtZW50Q29uc3RhbnQiLCJTaGFkZXJSZWdpc3RlckNhY2hlLmdldEZyZWVWZXJ0ZXhDb25zdGFudCIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUuZ2V0RnJlZVZlcnRleFZlY3RvclRlbXAiLCJTaGFkZXJSZWdpc3RlckNhY2hlLmdldEZyZWVWZXJ0ZXhTaW5nbGVUZW1wIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5nZXRGcmVlVmVydGV4QXR0cmlidXRlIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5nZXRGcmVlVGV4dHVyZVJlZyIsIlNoYWRlclJlZ2lzdGVyQ2FjaGUudmVydGV4Q29uc3RhbnRPZmZzZXQiLCJTaGFkZXJSZWdpc3RlckNhY2hlLnZlcnRleEF0dHJpYnV0ZXNPZmZzZXQiLCJTaGFkZXJSZWdpc3RlckNhY2hlLnZhcnlpbmdzT2Zmc2V0IiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5mcmFnbWVudENvbnN0YW50T2Zmc2V0IiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5mcmFnbWVudE91dHB1dFJlZ2lzdGVyIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5udW1Vc2VkVmVydGV4Q29uc3RhbnRzIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5udW1Vc2VkRnJhZ21lbnRDb25zdGFudHMiLCJTaGFkZXJSZWdpc3RlckNhY2hlLm51bVVzZWRTdHJlYW1zIiwiU2hhZGVyUmVnaXN0ZXJDYWNoZS5udW1Vc2VkVGV4dHVyZXMiLCJTaGFkZXJSZWdpc3RlckNhY2hlLm51bVVzZWRWYXJ5aW5ncyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxZQUFZLFdBQWUsdURBQXVELENBQUMsQ0FBQztBQUMzRixJQUFPLHFCQUFxQixXQUFZLGdFQUFnRSxDQUFDLENBQUM7QUFFMUcsQUFHQTs7R0FERztJQUNHLG1CQUFtQjtJQXVCeEJBOzs7O09BSUdBO0lBQ0hBLFNBNUJLQSxtQkFBbUJBLENBNEJaQSxPQUFjQTtRQVpsQkMsNEJBQXVCQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUNuQ0EsOEJBQXlCQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUNyQ0Esb0JBQWVBLEdBQVVBLENBQUNBLENBQUNBO1FBQzNCQSxxQkFBZ0JBLEdBQVVBLENBQUNBLENBQUNBO1FBQzVCQSxxQkFBZ0JBLEdBQVVBLENBQUNBLENBQUNBO1FBVW5DQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFFREQ7O09BRUdBO0lBQ0lBLG1DQUFLQSxHQUFaQTtRQUVDRSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLElBQUlBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzNEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FB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REFBc0JBO1FBSGpDQTs7V0FFR0E7YUFDSEE7WUFFQ3FCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7UUFDckNBLENBQUNBOzs7T0FBQXJCO0lBS0RBLHNCQUFXQSx1REFBc0JBO1FBSGpDQTs7V0FFR0E7YUFDSEE7WUFFQ3NCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7UUFDckNBLENBQUNBOzs7T0FBQXRCO0lBS0RBLHNCQUFXQSx5REFBd0JBO1FBSG5DQTs7V0FFR0E7YUFDSEE7WUFFQ3VCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHlCQUF5QkEsQ0FBQ0E7UUFDdkNBLENBQUNBOzs7T0FBQXZCO0lBS0RBLHNCQUFXQSwrQ0FBY0E7UUFIekJBOztXQUVHQTthQUNIQTtZQUVDd0IsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7UUFDN0JBLENBQUNBOzs7T0FBQXhCO0lBS0RBLHNCQUFXQSxnREFBZUE7UUFIMUJBOztXQUVHQTthQUNIQTtZQUVDeUIsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7OztPQUFBekI7SUFLREEsc0JBQVdBLGdEQUFlQTtRQUgxQkE7O1dBRUdBO2FBQ0hBO1lBRUMwQixNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxDQUFDQTs7O09BQUExQjtJQUNGQSwwQkFBQ0E7QUFBREEsQ0FqVEEsQUFpVENBLElBQUE7QUFFRCxBQUE2QixpQkFBcEIsbUJBQW1CLENBQUMiLCJmaWxlIjoibWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JvYmJhdGVtYW4vV2Vic3Rvcm1Qcm9qZWN0cy9hd2F5anMtc3RhZ2VnbC8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVnaXN0ZXJQb29sXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vUmVnaXN0ZXJQb29sXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRWxlbWVudFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRWxlbWVudFwiKTtcblxuLyoqXG4gKiBTaGFkZXJSZWdpc3RlciBDYWNoZSBwcm92aWRlcyB0aGUgdXNhZ2UgbWFuYWdlbWVudCBzeXN0ZW0gZm9yIGFsbCByZWdpc3RlcnMgZHVyaW5nIHNoYWRpbmcgY29tcGlsYXRpb24uXG4gKi9cbmNsYXNzIFNoYWRlclJlZ2lzdGVyQ2FjaGVcbntcblx0cHJpdmF0ZSBfZnJhZ21lbnRUZW1wQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF92ZXJ0ZXhUZW1wQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF92YXJ5aW5nQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF9mcmFnbWVudENvbnN0YW50c0NhY2hlOlJlZ2lzdGVyUG9vbDtcblx0cHJpdmF0ZSBfdmVydGV4Q29uc3RhbnRzQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF90ZXh0dXJlQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF92ZXJ0ZXhBdHRyaWJ1dGVzQ2FjaGU6UmVnaXN0ZXJQb29sO1xuXHRwcml2YXRlIF92ZXJ0ZXhDb25zdGFudE9mZnNldDpudW1iZXI7IC8vVE9ETzogY2hlY2sgaWYgdGhpcyBzaG91bGQgYmUgaW5pdGlhbGlzZWQgdG8gMFxuXHRwcml2YXRlIF92ZXJ0ZXhBdHRyaWJ1dGVzT2Zmc2V0Om51bWJlcjsvL1RPRE86IGNoZWNrIGlmIHRoaXMgc2hvdWxkIGJlIGluaXRpYWxpc2VkIHRvIDBcblx0cHJpdmF0ZSBfdmFyeWluZ3NPZmZzZXQ6bnVtYmVyOy8vVE9ETzogY2hlY2sgaWYgdGhpcyBzaG91bGQgYmUgaW5pdGlhbGlzZWQgdG8gMFxuXHRwcml2YXRlIF9mcmFnbWVudENvbnN0YW50T2Zmc2V0Om51bWJlcjsvL1RPRE86IGNoZWNrIGlmIHRoaXMgc2hvdWxkIGJlIGluaXRpYWxpc2VkIHRvIDBcblxuXHRwcml2YXRlIF9mcmFnbWVudE91dHB1dFJlZ2lzdGVyOlNoYWRlclJlZ2lzdGVyRWxlbWVudDtcblx0cHJpdmF0ZSBfdmVydGV4T3V0cHV0UmVnaXN0ZXI6U2hhZGVyUmVnaXN0ZXJFbGVtZW50O1xuXHRwcml2YXRlIF9udW1Vc2VkVmVydGV4Q29uc3RhbnRzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX251bVVzZWRGcmFnbWVudENvbnN0YW50czpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9udW1Vc2VkU3RyZWFtczpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9udW1Vc2VkVGV4dHVyZXM6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfbnVtVXNlZFZhcnlpbmdzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3Byb2ZpbGU6c3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgU2hhZGVyUmVnaXN0ZXJDYWNoZSBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9maWxlIFRoZSBjb21wYXRpYmlsaXR5IHByb2ZpbGUgdXNlZCBieSB0aGUgcmVuZGVyZXIuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcm9maWxlOnN0cmluZylcblx0e1xuXHRcdHRoaXMuX3Byb2ZpbGUgPSBwcm9maWxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyBhbGwgcmVnaXN0ZXJzLlxuXHQgKi9cblx0cHVibGljIHJlc2V0KClcblx0e1xuXHRcdHRoaXMuX2ZyYWdtZW50VGVtcENhY2hlID0gbmV3IFJlZ2lzdGVyUG9vbChcImZ0XCIsIDgsIGZhbHNlKTtcblx0XHR0aGlzLl92ZXJ0ZXhUZW1wQ2FjaGUgPSBuZXcgUmVnaXN0ZXJQb29sKFwidnRcIiwgOCwgZmFsc2UpO1xuXHRcdHRoaXMuX3ZhcnlpbmdDYWNoZSA9IG5ldyBSZWdpc3RlclBvb2woXCJ2XCIsIDgpO1xuXHRcdHRoaXMuX3RleHR1cmVDYWNoZSA9IG5ldyBSZWdpc3RlclBvb2woXCJmc1wiLCA4KTtcblx0XHR0aGlzLl92ZXJ0ZXhBdHRyaWJ1dGVzQ2FjaGUgPSBuZXcgUmVnaXN0ZXJQb29sKFwidmFcIiwgOCk7XG5cdFx0dGhpcy5fZnJhZ21lbnRDb25zdGFudHNDYWNoZSA9IG5ldyBSZWdpc3RlclBvb2woXCJmY1wiLCAyOCk7XG5cdFx0dGhpcy5fdmVydGV4Q29uc3RhbnRzQ2FjaGUgPSBuZXcgUmVnaXN0ZXJQb29sKFwidmNcIiwgMTI4KTtcblx0XHR0aGlzLl9mcmFnbWVudE91dHB1dFJlZ2lzdGVyID0gbmV3IFNoYWRlclJlZ2lzdGVyRWxlbWVudChcIm9jXCIsIC0xKTtcblx0XHR0aGlzLl92ZXJ0ZXhPdXRwdXRSZWdpc3RlciA9IG5ldyBTaGFkZXJSZWdpc3RlckVsZW1lbnQoXCJvcFwiLCAtMSk7XG5cdFx0dGhpcy5fbnVtVXNlZFZlcnRleENvbnN0YW50cyA9IDA7XG5cdFx0dGhpcy5fbnVtVXNlZFN0cmVhbXMgPSAwO1xuXHRcdHRoaXMuX251bVVzZWRUZXh0dXJlcyA9IDA7XG5cdFx0dGhpcy5fbnVtVXNlZFZhcnlpbmdzID0gMDtcblx0XHR0aGlzLl9udW1Vc2VkRnJhZ21lbnRDb25zdGFudHMgPSAwO1xuXG5cdFx0dmFyIGk6bnVtYmVyO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuX3ZlcnRleEF0dHJpYnV0ZXNPZmZzZXQ7ICsraSlcblx0XHRcdHRoaXMuZ2V0RnJlZVZlcnRleEF0dHJpYnV0ZSgpO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuX3ZlcnRleENvbnN0YW50T2Zmc2V0OyArK2kpXG5cdFx0XHR0aGlzLmdldEZyZWVWZXJ0ZXhDb25zdGFudCgpO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuX3ZhcnlpbmdzT2Zmc2V0OyArK2kpXG5cdFx0XHR0aGlzLmdldEZyZWVWYXJ5aW5nKCk7XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgdGhpcy5fZnJhZ21lbnRDb25zdGFudE9mZnNldDsgKytpKVxuXHRcdFx0dGhpcy5nZXRGcmVlRnJhZ21lbnRDb25zdGFudCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc3Bvc2VzIGFsbCByZXNvdXJjZXMgdXNlZC5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX2ZyYWdtZW50VGVtcENhY2hlLmRpc3Bvc2UoKTtcblx0XHR0aGlzLl92ZXJ0ZXhUZW1wQ2FjaGUuZGlzcG9zZSgpO1xuXHRcdHRoaXMuX3ZhcnlpbmdDYWNoZS5kaXNwb3NlKCk7XG5cdFx0dGhpcy5fZnJhZ21lbnRDb25zdGFudHNDYWNoZS5kaXNwb3NlKCk7XG5cdFx0dGhpcy5fdmVydGV4QXR0cmlidXRlc0NhY2hlLmRpc3Bvc2UoKTtcblxuXHRcdHRoaXMuX2ZyYWdtZW50VGVtcENhY2hlID0gbnVsbDtcblx0XHR0aGlzLl92ZXJ0ZXhUZW1wQ2FjaGUgPSBudWxsO1xuXHRcdHRoaXMuX3ZhcnlpbmdDYWNoZSA9IG51bGw7XG5cdFx0dGhpcy5fZnJhZ21lbnRDb25zdGFudHNDYWNoZSA9IG51bGw7XG5cdFx0dGhpcy5fdmVydGV4QXR0cmlidXRlc0NhY2hlID0gbnVsbDtcblx0XHR0aGlzLl9mcmFnbWVudE91dHB1dFJlZ2lzdGVyID0gbnVsbDtcblx0XHR0aGlzLl92ZXJ0ZXhPdXRwdXRSZWdpc3RlciA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogTWFya3MgYSBmcmFnbWVudCB0ZW1wb3JhcnkgcmVnaXN0ZXIgYXMgdXNlZCwgc28gaXQgY2Fubm90IGJlIHJldHJpZXZlZC4gVGhlIHJlZ2lzdGVyIHdvbid0IGJlIGFibGUgdG8gYmUgdXNlZCB1bnRpbCByZW1vdmVVc2FnZVxuXHQgKiBoYXMgYmVlbiBjYWxsZWQgdXNhZ2VDb3VudCB0aW1lcyBhZ2Fpbi5cblx0ICogQHBhcmFtIHJlZ2lzdGVyIFRoZSByZWdpc3RlciB0byBtYXJrIGFzIHVzZWQuXG5cdCAqIEBwYXJhbSB1c2FnZUNvdW50IFRoZSBhbW91bnQgb2YgdXNhZ2VzIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRGcmFnbWVudFRlbXBVc2FnZXMocmVnaXN0ZXI6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB1c2FnZUNvdW50Om51bWJlcilcblx0e1xuXHRcdHRoaXMuX2ZyYWdtZW50VGVtcENhY2hlLmFkZFVzYWdlKHJlZ2lzdGVyLCB1c2FnZUNvdW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgdXNhZ2UgZnJvbSBhIGZyYWdtZW50IHRlbXBvcmFyeSByZWdpc3Rlci4gV2hlbiB1c2FnZXMgcmVhY2ggMCwgdGhlIHJlZ2lzdGVyIGlzIGZyZWVkIGFnYWluLlxuXHQgKiBAcGFyYW0gcmVnaXN0ZXIgVGhlIHJlZ2lzdGVyIGZvciB3aGljaCB0byByZW1vdmUgYSB1c2FnZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVGcmFnbWVudFRlbXBVc2FnZShyZWdpc3RlcjpTaGFkZXJSZWdpc3RlckVsZW1lbnQpXG5cdHtcblx0XHR0aGlzLl9mcmFnbWVudFRlbXBDYWNoZS5yZW1vdmVVc2FnZShyZWdpc3Rlcik7XG5cdH1cblxuXHQvKipcblx0ICogTWFya3MgYSB2ZXJ0ZXggdGVtcG9yYXJ5IHJlZ2lzdGVyIGFzIHVzZWQsIHNvIGl0IGNhbm5vdCBiZSByZXRyaWV2ZWQuIFRoZSByZWdpc3RlciB3b24ndCBiZSBhYmxlIHRvIGJlIHVzZWRcblx0ICogdW50aWwgcmVtb3ZlVXNhZ2UgaGFzIGJlZW4gY2FsbGVkIHVzYWdlQ291bnQgdGltZXMgYWdhaW4uXG5cdCAqIEBwYXJhbSByZWdpc3RlciBUaGUgcmVnaXN0ZXIgdG8gbWFyayBhcyB1c2VkLlxuXHQgKiBAcGFyYW0gdXNhZ2VDb3VudCBUaGUgYW1vdW50IG9mIHVzYWdlcyB0byBhZGQuXG5cdCAqL1xuXHRwdWJsaWMgYWRkVmVydGV4VGVtcFVzYWdlcyhyZWdpc3RlcjpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHVzYWdlQ291bnQ6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fdmVydGV4VGVtcENhY2hlLmFkZFVzYWdlKHJlZ2lzdGVyLCB1c2FnZUNvdW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgdXNhZ2UgZnJvbSBhIHZlcnRleCB0ZW1wb3JhcnkgcmVnaXN0ZXIuIFdoZW4gdXNhZ2VzIHJlYWNoIDAsIHRoZSByZWdpc3RlciBpcyBmcmVlZCBhZ2Fpbi5cblx0ICogQHBhcmFtIHJlZ2lzdGVyIFRoZSByZWdpc3RlciBmb3Igd2hpY2ggdG8gcmVtb3ZlIGEgdXNhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlVmVydGV4VGVtcFVzYWdlKHJlZ2lzdGVyOlNoYWRlclJlZ2lzdGVyRWxlbWVudClcblx0e1xuXHRcdHRoaXMuX3ZlcnRleFRlbXBDYWNoZS5yZW1vdmVVc2FnZShyZWdpc3Rlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgYW4gZW50aXJlIGZyYWdtZW50IHRlbXBvcmFyeSByZWdpc3RlciB0aGF0J3Mgc3RpbGwgYXZhaWxhYmxlLiBUaGUgcmVnaXN0ZXIgd29uJ3QgYmUgYWJsZSB0byBiZSB1c2VkIHVudGlsIHJlbW92ZVVzYWdlXG5cdCAqIGhhcyBiZWVuIGNhbGxlZCB1c2FnZUNvdW50IHRpbWVzIGFnYWluLlxuXHQgKi9cblx0cHVibGljIGdldEZyZWVGcmFnbWVudFZlY3RvclRlbXAoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9mcmFnbWVudFRlbXBDYWNoZS5yZXF1ZXN0RnJlZVZlY3RvclJlZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGEgc2luZ2xlIGNvbXBvbmVudCBmcm9tIGEgZnJhZ21lbnQgdGVtcG9yYXJ5IHJlZ2lzdGVyIHRoYXQncyBzdGlsbCBhdmFpbGFibGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RnJlZUZyYWdtZW50U2luZ2xlVGVtcCgpOlNoYWRlclJlZ2lzdGVyRWxlbWVudFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2ZyYWdtZW50VGVtcENhY2hlLnJlcXVlc3RGcmVlUmVnQ29tcG9uZW50KCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgYW4gYXZhaWxhYmxlIHZhcnlpbmcgcmVnaXN0ZXJcblx0ICovXG5cdHB1YmxpYyBnZXRGcmVlVmFyeWluZygpOlNoYWRlclJlZ2lzdGVyRWxlbWVudFxuXHR7XG5cdFx0Kyt0aGlzLl9udW1Vc2VkVmFyeWluZ3M7XG5cdFx0cmV0dXJuIHRoaXMuX3ZhcnlpbmdDYWNoZS5yZXF1ZXN0RnJlZVZlY3RvclJlZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGFuIGF2YWlsYWJsZSBmcmFnbWVudCBjb25zdGFudCByZWdpc3RlclxuXHQgKi9cblx0cHVibGljIGdldEZyZWVGcmFnbWVudENvbnN0YW50KCk6U2hhZGVyUmVnaXN0ZXJFbGVtZW50XG5cdHtcblx0XHQrK3RoaXMuX251bVVzZWRGcmFnbWVudENvbnN0YW50cztcblx0XHRyZXR1cm4gdGhpcy5fZnJhZ21lbnRDb25zdGFudHNDYWNoZS5yZXF1ZXN0RnJlZVZlY3RvclJlZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGFuIGF2YWlsYWJsZSB2ZXJ0ZXggY29uc3RhbnQgcmVnaXN0ZXJcblx0ICovXG5cdHB1YmxpYyBnZXRGcmVlVmVydGV4Q29uc3RhbnQoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdCsrdGhpcy5fbnVtVXNlZFZlcnRleENvbnN0YW50cztcblx0XHRyZXR1cm4gdGhpcy5fdmVydGV4Q29uc3RhbnRzQ2FjaGUucmVxdWVzdEZyZWVWZWN0b3JSZWcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSBhbiBlbnRpcmUgdmVydGV4IHRlbXBvcmFyeSByZWdpc3RlciB0aGF0J3Mgc3RpbGwgYXZhaWxhYmxlLlxuXHQgKi9cblx0cHVibGljIGdldEZyZWVWZXJ0ZXhWZWN0b3JUZW1wKCk6U2hhZGVyUmVnaXN0ZXJFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdmVydGV4VGVtcENhY2hlLnJlcXVlc3RGcmVlVmVjdG9yUmVnKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgYSBzaW5nbGUgY29tcG9uZW50IGZyb20gYSB2ZXJ0ZXggdGVtcG9yYXJ5IHJlZ2lzdGVyIHRoYXQncyBzdGlsbCBhdmFpbGFibGUuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RnJlZVZlcnRleFNpbmdsZVRlbXAoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdHJldHVybiB0aGlzLl92ZXJ0ZXhUZW1wQ2FjaGUucmVxdWVzdEZyZWVSZWdDb21wb25lbnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSBhbiBhdmFpbGFibGUgdmVydGV4IGF0dHJpYnV0ZSByZWdpc3RlclxuXHQgKi9cblx0cHVibGljIGdldEZyZWVWZXJ0ZXhBdHRyaWJ1dGUoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdCsrdGhpcy5fbnVtVXNlZFN0cmVhbXM7XG5cdFx0cmV0dXJuIHRoaXMuX3ZlcnRleEF0dHJpYnV0ZXNDYWNoZS5yZXF1ZXN0RnJlZVZlY3RvclJlZygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGFuIGF2YWlsYWJsZSB0ZXh0dXJlIHJlZ2lzdGVyXG5cdCAqL1xuXHRwdWJsaWMgZ2V0RnJlZVRleHR1cmVSZWcoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdCsrdGhpcy5fbnVtVXNlZFRleHR1cmVzO1xuXHRcdHJldHVybiB0aGlzLl90ZXh0dXJlQ2FjaGUucmVxdWVzdEZyZWVWZWN0b3JSZWcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIHN0YXJ0IGluZGV4IGZyb20gd2hpY2ggdG8gcmV0cmlldmUgdmVydGV4IGNvbnN0YW50cy5cblx0ICovXG5cdHB1YmxpYyBnZXQgdmVydGV4Q29uc3RhbnRPZmZzZXQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl92ZXJ0ZXhDb25zdGFudE9mZnNldDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgdmVydGV4Q29uc3RhbnRPZmZzZXQodmVydGV4Q29uc3RhbnRPZmZzZXQ6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fdmVydGV4Q29uc3RhbnRPZmZzZXQgPSB2ZXJ0ZXhDb25zdGFudE9mZnNldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIHN0YXJ0IGluZGV4IGZyb20gd2hpY2ggdG8gcmV0cmlldmUgdmVydGV4IGF0dHJpYnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHZlcnRleEF0dHJpYnV0ZXNPZmZzZXQoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl92ZXJ0ZXhBdHRyaWJ1dGVzT2Zmc2V0O1xuXHR9XG5cblx0cHVibGljIHNldCB2ZXJ0ZXhBdHRyaWJ1dGVzT2Zmc2V0KHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3ZlcnRleEF0dHJpYnV0ZXNPZmZzZXQgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIHN0YXJ0IGluZGV4IGZyb20gd2hpY2ggdG8gcmV0cmlldmUgdmFyeWluZyByZWdpc3RlcnMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHZhcnlpbmdzT2Zmc2V0KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdmFyeWluZ3NPZmZzZXQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHZhcnlpbmdzT2Zmc2V0KHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3ZhcnlpbmdzT2Zmc2V0ID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHRoZSBzdGFydCBpbmRleCBmcm9tIHdoaWNoIHRvIHJldHJpZXZlIGZyYWdtZW50IGNvbnN0YW50cy5cblx0ICovXG5cdHB1YmxpYyBnZXQgZnJhZ21lbnRDb25zdGFudE9mZnNldCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2ZyYWdtZW50Q29uc3RhbnRPZmZzZXQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGZyYWdtZW50Q29uc3RhbnRPZmZzZXQodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fZnJhZ21lbnRDb25zdGFudE9mZnNldCA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmcmFnbWVudCBvdXRwdXQgcmVnaXN0ZXIuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGZyYWdtZW50T3V0cHV0UmVnaXN0ZXIoKTpTaGFkZXJSZWdpc3RlckVsZW1lbnRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9mcmFnbWVudE91dHB1dFJlZ2lzdGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgdXNlZCB2ZXJ0ZXggY29uc3RhbnQgcmVnaXN0ZXJzLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1Vc2VkVmVydGV4Q29uc3RhbnRzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbnVtVXNlZFZlcnRleENvbnN0YW50cztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHVzZWQgZnJhZ21lbnQgY29uc3RhbnQgcmVnaXN0ZXJzLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1Vc2VkRnJhZ21lbnRDb25zdGFudHMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9udW1Vc2VkRnJhZ21lbnRDb25zdGFudHM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiB1c2VkIHZlcnRleCBzdHJlYW1zLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1Vc2VkU3RyZWFtcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX251bVVzZWRTdHJlYW1zO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgdXNlZCB0ZXh0dXJlIHNsb3RzLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1Vc2VkVGV4dHVyZXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9udW1Vc2VkVGV4dHVyZXM7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiB1c2VkIHZhcnlpbmcgcmVnaXN0ZXJzLlxuXHQgKi9cblx0cHVibGljIGdldCBudW1Vc2VkVmFyeWluZ3MoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9udW1Vc2VkVmFyeWluZ3M7XG5cdH1cbn1cblxuZXhwb3J0ID0gU2hhZGVyUmVnaXN0ZXJDYWNoZTsiXX0=