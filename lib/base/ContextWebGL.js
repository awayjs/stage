"use strict";
var Rectangle_1 = require("@awayjs/core/lib/geom/Rectangle");
var ContextGLBlendFactor_1 = require("../base/ContextGLBlendFactor");
var ContextGLDrawMode_1 = require("../base/ContextGLDrawMode");
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLCompareMode_1 = require("../base/ContextGLCompareMode");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var ContextGLStencilAction_1 = require("../base/ContextGLStencilAction");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLTriangleFace_1 = require("../base/ContextGLTriangleFace");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var CubeTextureWebGL_1 = require("../base/CubeTextureWebGL");
var IndexBufferWebGL_1 = require("../base/IndexBufferWebGL");
var ProgramWebGL_1 = require("../base/ProgramWebGL");
var TextureWebGL_1 = require("../base/TextureWebGL");
var SamplerState_1 = require("../base/SamplerState");
var VertexBufferWebGL_1 = require("../base/VertexBufferWebGL");
var ContextWebGL = (function () {
    function ContextWebGL(canvas) {
        this._blendFactorDictionary = new Object();
        this._drawModeDictionary = new Object();
        this._compareModeDictionary = new Object();
        this._stencilActionDictionary = new Object();
        this._textureIndexDictionary = new Array(8);
        this._textureTypeDictionary = new Object();
        this._wrapDictionary = new Object();
        this._filterDictionary = new Object();
        this._mipmapFilterDictionary = new Object();
        this._vertexBufferPropertiesDictionary = [];
        this._samplerStates = new Array(8);
        this._stencilReferenceValue = 0;
        this._stencilReadMask = 0xff;
        this._separateStencil = false;
        this._container = canvas;
        try {
            this._gl = canvas.getContext("experimental-webgl", { premultipliedAlpha: false, alpha: false, stencil: true });
            if (!this._gl)
                this._gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: false, stencil: true });
        }
        catch (e) {
        }
        if (this._gl) {
            //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_SUCCESS ) );
            if (this._gl.getExtension("OES_standard_derivatives")) {
                this._standardDerivatives = true;
            }
            else {
                this._standardDerivatives = false;
            }
            //setup shortcut dictionaries
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.DESTINATION_ALPHA] = this._gl.DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.DESTINATION_COLOR] = this._gl.DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = this._gl.ONE_MINUS_DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = this._gl.ONE_MINUS_DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = this._gl.ONE_MINUS_SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = this._gl.ONE_MINUS_SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.SOURCE_ALPHA] = this._gl.SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.SOURCE_COLOR] = this._gl.SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.ContextGLBlendFactor.ZERO] = this._gl.ZERO;
            this._drawModeDictionary[ContextGLDrawMode_1.ContextGLDrawMode.LINES] = this._gl.LINES;
            this._drawModeDictionary[ContextGLDrawMode_1.ContextGLDrawMode.TRIANGLES] = this._gl.TRIANGLES;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.ALWAYS] = this._gl.ALWAYS;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.EQUAL] = this._gl.EQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.GREATER] = this._gl.GREATER;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.GREATER_EQUAL] = this._gl.GEQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.LESS] = this._gl.LESS;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.LESS_EQUAL] = this._gl.LEQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.NEVER] = this._gl.NEVER;
            this._compareModeDictionary[ContextGLCompareMode_1.ContextGLCompareMode.NOT_EQUAL] = this._gl.NOTEQUAL;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.DECREMENT_SATURATE] = this._gl.DECR;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.DECREMENT_WRAP] = this._gl.DECR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.INCREMENT_SATURATE] = this._gl.INCR;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.INCREMENT_WRAP] = this._gl.INCR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.INVERT] = this._gl.INVERT;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.KEEP] = this._gl.KEEP;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.SET] = this._gl.REPLACE;
            this._stencilActionDictionary[ContextGLStencilAction_1.ContextGLStencilAction.ZERO] = this._gl.ZERO;
            this._textureIndexDictionary[0] = this._gl.TEXTURE0;
            this._textureIndexDictionary[1] = this._gl.TEXTURE1;
            this._textureIndexDictionary[2] = this._gl.TEXTURE2;
            this._textureIndexDictionary[3] = this._gl.TEXTURE3;
            this._textureIndexDictionary[4] = this._gl.TEXTURE4;
            this._textureIndexDictionary[5] = this._gl.TEXTURE5;
            this._textureIndexDictionary[6] = this._gl.TEXTURE6;
            this._textureIndexDictionary[7] = this._gl.TEXTURE7;
            this._textureTypeDictionary["texture2d"] = this._gl.TEXTURE_2D;
            this._textureTypeDictionary["textureCube"] = this._gl.TEXTURE_CUBE_MAP;
            this._wrapDictionary[ContextGLWrapMode_1.ContextGLWrapMode.REPEAT] = this._gl.REPEAT;
            this._wrapDictionary[ContextGLWrapMode_1.ContextGLWrapMode.CLAMP] = this._gl.CLAMP_TO_EDGE;
            this._filterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR] = this._gl.LINEAR;
            this._filterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST] = this._gl.NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR][ContextGLMipFilter_1.ContextGLMipFilter.MIPNEAREST] = this._gl.LINEAR_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR][ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR] = this._gl.LINEAR_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR][ContextGLMipFilter_1.ContextGLMipFilter.MIPNONE] = this._gl.LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST][ContextGLMipFilter_1.ContextGLMipFilter.MIPNEAREST] = this._gl.NEAREST_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST][ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR] = this._gl.NEAREST_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.ContextGLTextureFilter.NEAREST][ContextGLMipFilter_1.ContextGLMipFilter.MIPNONE] = this._gl.NEAREST;
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_1] = new VertexBufferProperties(1, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_2] = new VertexBufferProperties(2, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_3] = new VertexBufferProperties(3, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_4] = new VertexBufferProperties(4, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_1] = new VertexBufferProperties(1, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_2] = new VertexBufferProperties(2, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_3] = new VertexBufferProperties(3, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.BYTE_4] = new VertexBufferProperties(4, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_1] = new VertexBufferProperties(1, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_2] = new VertexBufferProperties(2, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_3] = new VertexBufferProperties(3, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.SHORT_4] = new VertexBufferProperties(4, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_SHORT_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_SHORT, true);
            this._stencilCompareMode = this._gl.ALWAYS;
            this._stencilCompareModeBack = this._gl.ALWAYS;
            this._stencilCompareModeFront = this._gl.ALWAYS;
        }
        else {
            //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
            alert("WebGL is not available.");
        }
        //defaults
        for (var i = 0; i < ContextWebGL.MAX_SAMPLERS; ++i) {
            this._samplerStates[i] = new SamplerState_1.SamplerState();
            this._samplerStates[i].wrap = this._gl.REPEAT;
            this._samplerStates[i].filter = this._gl.LINEAR;
            this._samplerStates[i].mipfilter = this._gl.LINEAR;
        }
    }
    Object.defineProperty(ContextWebGL.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextWebGL.prototype, "standardDerivatives", {
        get: function () {
            return this._standardDerivatives;
        },
        enumerable: true,
        configurable: true
    });
    ContextWebGL.prototype.gl = function () {
        return this._gl;
    };
    ContextWebGL.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask_1.ContextGLClearMask.ALL; }
        if (!this._drawing) {
            this.updateBlendStatus();
            this._drawing = true;
        }
        var glmask = 0;
        if (mask & ContextGLClearMask_1.ContextGLClearMask.COLOR)
            glmask |= this._gl.COLOR_BUFFER_BIT;
        if (mask & ContextGLClearMask_1.ContextGLClearMask.STENCIL)
            glmask |= this._gl.STENCIL_BUFFER_BIT;
        if (mask & ContextGLClearMask_1.ContextGLClearMask.DEPTH)
            glmask |= this._gl.DEPTH_BUFFER_BIT;
        this._gl.clearColor(red, green, blue, alpha);
        this._gl.clearDepth(depth);
        this._gl.clearStencil(stencil);
        this._gl.clear(glmask);
    };
    ContextWebGL.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = true; }
        this._width = width;
        this._height = height;
        if (enableDepthAndStencil) {
            this._gl.enable(this._gl.STENCIL_TEST);
            this._gl.enable(this._gl.DEPTH_TEST);
        }
        this._gl.viewport['width'] = width;
        this._gl.viewport['height'] = height;
        this._gl.viewport(0, 0, width, height);
    };
    ContextWebGL.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        return new CubeTextureWebGL_1.CubeTextureWebGL(this._gl, size);
    };
    ContextWebGL.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferWebGL_1.IndexBufferWebGL(this._gl, numIndices);
    };
    ContextWebGL.prototype.createProgram = function () {
        return new ProgramWebGL_1.ProgramWebGL(this._gl);
    };
    ContextWebGL.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO streaming
        return new TextureWebGL_1.TextureWebGL(this._gl, width, height);
    };
    ContextWebGL.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferWebGL_1.VertexBufferWebGL(this._gl, numVertices, dataPerVertex);
    };
    ContextWebGL.prototype.dispose = function () {
        for (var i = 0; i < this._samplerStates.length; ++i)
            this._samplerStates[i] = null;
    };
    ContextWebGL.prototype.drawToBitmapImage2D = function (destination) {
        var pixels = new Uint8ClampedArray(destination.width * destination.height * 4);
        this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
        destination.setPixels(new Rectangle_1.Rectangle(0, 0, destination.width, destination.height), pixels);
    };
    ContextWebGL.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (firstIndex === void 0) { firstIndex = 0; }
        if (numIndices === void 0) { numIndices = -1; }
        if (!this._drawing)
            throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
        this._gl.drawElements(this._drawModeDictionary[mode], (numIndices == -1) ? indexBuffer.numIndices : numIndices, this._gl.UNSIGNED_SHORT, firstIndex * 2);
    };
    ContextWebGL.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        if (firstVertex === void 0) { firstVertex = 0; }
        if (numVertices === void 0) { numVertices = -1; }
        if (!this._drawing)
            throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
        this._gl.drawArrays(this._drawModeDictionary[mode], firstVertex, numVertices);
    };
    ContextWebGL.prototype.present = function () {
        this._drawing = false;
    };
    ContextWebGL.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this._blendEnabled = true;
        this._blendSourceFactor = this._blendFactorDictionary[sourceFactor];
        this._blendDestinationFactor = this._blendFactorDictionary[destinationFactor];
        this.updateBlendStatus();
    };
    ContextWebGL.prototype.setColorMask = function (red, green, blue, alpha) {
        this._gl.colorMask(red, green, blue, alpha);
    };
    ContextWebGL.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        if (triangleFaceToCull == ContextGLTriangleFace_1.ContextGLTriangleFace.NONE) {
            this._gl.disable(this._gl.CULL_FACE);
        }
        else {
            this._gl.enable(this._gl.CULL_FACE);
            this._gl.cullFace(this.translateTriangleFace(triangleFaceToCull, coordinateSystem));
        }
    };
    // TODO ContextGLCompareMode
    ContextWebGL.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this._gl.depthFunc(this._compareModeDictionary[passCompareMode]);
        this._gl.depthMask(depthMask);
    };
    ContextWebGL.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        if (triangleFace === void 0) { triangleFace = "frontAndBack"; }
        if (compareMode === void 0) { compareMode = "always"; }
        if (actionOnBothPass === void 0) { actionOnBothPass = "keep"; }
        if (actionOnDepthFail === void 0) { actionOnDepthFail = "keep"; }
        if (actionOnDepthPassStencilFail === void 0) { actionOnDepthPassStencilFail = "keep"; }
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        this._separateStencil = triangleFace != "frontAndBack";
        var compareModeGL = this._compareModeDictionary[compareMode];
        var fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
        var zFail = this._stencilActionDictionary[actionOnDepthFail];
        var pass = this._stencilActionDictionary[actionOnBothPass];
        if (!this._separateStencil) {
            this._stencilCompareMode = compareModeGL;
            this._gl.stencilFunc(compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOp(fail, zFail, pass);
        }
        else if (triangleFace == "back") {
            this._stencilCompareModeBack = compareModeGL;
            this._gl.stencilFuncSeparate(this._gl.BACK, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOpSeparate(this._gl.BACK, fail, zFail, pass);
        }
        else if (triangleFace == "front") {
            this._stencilCompareModeFront = compareModeGL;
            this._gl.stencilFuncSeparate(this._gl.FRONT, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOpSeparate(this._gl.FRONT, fail, zFail, pass);
        }
    };
    ContextWebGL.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        this._stencilReferenceValue = referenceValue;
        this._stencilReadMask = readMask;
        if (this._separateStencil) {
            this._gl.stencilFuncSeparate(this._gl.FRONT, this._stencilCompareModeFront, referenceValue, readMask);
            this._gl.stencilFuncSeparate(this._gl.BACK, this._stencilCompareModeBack, referenceValue, readMask);
        }
        else {
            this._gl.stencilFunc(this._stencilCompareMode, referenceValue, readMask);
        }
        this._gl.stencilMask(writeMask);
    };
    ContextWebGL.prototype.setProgram = function (program) {
        //TODO decide on construction/reference resposibilities
        this._currentProgram = program;
        program.focusProgram();
    };
    ContextWebGL.prototype.setProgramConstantsFromArray = function (programType, data) {
        if (data.length)
            this._gl.uniform4fv(this._currentProgram.getUniformLocation(programType), data);
    };
    ContextWebGL.prototype.setScissorRectangle = function (rectangle) {
        if (!rectangle) {
            this._gl.disable(this._gl.SCISSOR_TEST);
            return;
        }
        this._gl.enable(this._gl.SCISSOR_TEST);
        this._gl.scissor(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    };
    ContextWebGL.prototype.setTextureAt = function (sampler, texture) {
        var samplerState = this._samplerStates[sampler];
        if (this._activeTexture != sampler && (texture || samplerState.type)) {
            this._activeTexture = sampler;
            this._gl.activeTexture(this._textureIndexDictionary[sampler]);
        }
        if (!texture) {
            if (samplerState.type) {
                this._gl.bindTexture(samplerState.type, null);
                samplerState.type = null;
            }
            return;
        }
        var textureType = this._textureTypeDictionary[texture.textureType];
        samplerState.type = textureType;
        this._gl.bindTexture(textureType, texture.glTexture);
        this._gl.uniform1i(this._currentProgram.getUniformLocation(ContextGLProgramType_1.ContextGLProgramType.SAMPLER, sampler), sampler);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_S, samplerState.wrap);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_T, samplerState.wrap);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_MAG_FILTER, samplerState.filter);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_MIN_FILTER, samplerState.mipfilter);
    };
    ContextWebGL.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        if (0 <= sampler && sampler < ContextWebGL.MAX_SAMPLERS) {
            this._samplerStates[sampler].wrap = this._wrapDictionary[wrap];
            this._samplerStates[sampler].filter = this._filterDictionary[filter];
            this._samplerStates[sampler].mipfilter = this._mipmapFilterDictionary[filter][mipfilter];
        }
        else {
            throw "Sampler is out of bounds.";
        }
    };
    ContextWebGL.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        if (bufferOffset === void 0) { bufferOffset = 0; }
        if (format === void 0) { format = 4; }
        var location = this._currentProgram ? this._currentProgram.getAttribLocation(index) : -1;
        if (!buffer) {
            if (location > -1)
                this._gl.disableVertexAttribArray(location);
            return;
        }
        //buffer may not have changed if concatenated buffers are being used
        if (this._currentArrayBuffer != buffer) {
            this._currentArrayBuffer = buffer;
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer ? buffer.glBuffer : null);
        }
        var properties = this._vertexBufferPropertiesDictionary[format];
        this._gl.enableVertexAttribArray(location);
        this._gl.vertexAttribPointer(location, properties.size, properties.type, properties.normalized, buffer.dataPerVertex, bufferOffset);
    };
    ContextWebGL.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (antiAlias === void 0) { antiAlias = 0; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        var texture = target;
        var frameBuffer = texture.frameBuffer;
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);
        if (enableDepthAndStencil) {
            this._gl.enable(this._gl.STENCIL_TEST);
            this._gl.enable(this._gl.DEPTH_TEST);
        }
        this._gl.viewport(0, 0, texture.width, texture.height);
    };
    ContextWebGL.prototype.setRenderToBackBuffer = function () {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    };
    ContextWebGL.prototype.updateBlendStatus = function () {
        if (this._blendEnabled) {
            this._gl.enable(this._gl.BLEND);
            this._gl.blendEquation(this._gl.FUNC_ADD);
            this._gl.blendFunc(this._blendSourceFactor, this._blendDestinationFactor);
        }
        else {
            this._gl.disable(this._gl.BLEND);
        }
    };
    ContextWebGL.prototype.translateTriangleFace = function (triangleFace, coordinateSystem) {
        switch (triangleFace) {
            case ContextGLTriangleFace_1.ContextGLTriangleFace.BACK:
                return (coordinateSystem == "leftHanded") ? this._gl.FRONT : this._gl.BACK;
            case ContextGLTriangleFace_1.ContextGLTriangleFace.FRONT:
                return (coordinateSystem == "leftHanded") ? this._gl.BACK : this._gl.FRONT;
            case ContextGLTriangleFace_1.ContextGLTriangleFace.FRONT_AND_BACK:
                return this._gl.FRONT_AND_BACK;
            default:
                throw "Unknown ContextGLTriangleFace type."; // TODO error
        }
    };
    ContextWebGL.MAX_SAMPLERS = 8;
    ContextWebGL.modulo = 0;
    return ContextWebGL;
}());
exports.ContextWebGL = ContextWebGL;
var VertexBufferProperties = (function () {
    function VertexBufferProperties(size, type, normalized) {
        this.size = size;
        this.type = type;
        this.normalized = normalized;
    }
    return VertexBufferProperties;
}());
exports.VertexBufferProperties = VertexBufferProperties;
