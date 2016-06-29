"use strict";
var ContextGLTextureFilter_1 = require("./ContextGLTextureFilter");
var ContextGLMipFilter_1 = require("./ContextGLMipFilter");
var ContextGLWrapMode_1 = require("./ContextGLWrapMode");
/**
 * The same as SamplerState, but with strings
 * TODO: replace two similar classes with one
 */
var SoftwareSamplerState = (function () {
    function SoftwareSamplerState() {
        this.wrap = ContextGLWrapMode_1.ContextGLWrapMode.REPEAT;
        this.filter = ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR;
        this.mipfilter = ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR;
    }
    return SoftwareSamplerState;
}());
exports.SoftwareSamplerState = SoftwareSamplerState;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SoftwareSamplerState;
