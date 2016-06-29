"use strict";
var BitmapImage2D_1 = require("@awayjs/core/lib/image/BitmapImage2D");
var Matrix3D_1 = require("@awayjs/core/lib/geom/Matrix3D");
var Matrix_1 = require("@awayjs/core/lib/geom/Matrix");
var Point_1 = require("@awayjs/core/lib/geom/Point");
var Vector3D_1 = require("@awayjs/core/lib/geom/Vector3D");
var Rectangle_1 = require("@awayjs/core/lib/geom/Rectangle");
var ColorUtils_1 = require("@awayjs/core/lib/utils/ColorUtils");
var ContextGLBlendFactor_1 = require("../base/ContextGLBlendFactor");
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLCompareMode_1 = require("../base/ContextGLCompareMode");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var ContextGLTriangleFace_1 = require("../base/ContextGLTriangleFace");
var IndexBufferSoftware_1 = require("../base/IndexBufferSoftware");
var VertexBufferSoftware_1 = require("../base/VertexBufferSoftware");
var TextureSoftware_1 = require("../base/TextureSoftware");
var ProgramSoftware_1 = require("../base/ProgramSoftware");
var SoftwareSamplerState_1 = require("../base/SoftwareSamplerState");
var ContextSoftware = (function () {
    function ContextSoftware(canvas) {
        this._backBufferRect = new Rectangle_1.Rectangle();
        this._backBufferWidth = 100;
        this._backBufferHeight = 100;
        this._cullingMode = ContextGLTriangleFace_1.ContextGLTriangleFace.BACK;
        this._blendSource = ContextGLBlendFactor_1.ContextGLBlendFactor.ONE;
        this._blendDestination = ContextGLBlendFactor_1.ContextGLBlendFactor.ZERO;
        this._colorMaskR = true;
        this._colorMaskG = true;
        this._colorMaskB = true;
        this._colorMaskA = true;
        this._writeDepth = true;
        this._depthCompareMode = ContextGLCompareMode_1.ContextGLCompareMode.LESS;
        this._screenMatrix = new Matrix3D_1.Matrix3D();
        this._frontBufferMatrix = new Matrix_1.Matrix();
        this._bboxMin = new Point_1.Point();
        this._bboxMax = new Point_1.Point();
        this._clamp = new Point_1.Point();
        this._samplerStates = [];
        this._textures = [];
        this._vertexBuffers = [];
        this._vertexBufferOffsets = [];
        this._vertexBufferFormats = [];
        //public static _drawCallback:Function = null;
        this._antialias = 0;
        this._sx = new Vector3D_1.Vector3D();
        this._sy = new Vector3D_1.Vector3D();
        this._u = new Vector3D_1.Vector3D();
        this._canvas = canvas;
        this._backBufferColor = new BitmapImage2D_1.BitmapImage2D(this._backBufferWidth, this._backBufferHeight, false, 0, false);
        this._frontBuffer = new BitmapImage2D_1.BitmapImage2D(this._backBufferWidth, this._backBufferHeight, true, 0, false);
        if (document && document.body)
            document.body.appendChild(this._frontBuffer.getCanvas());
    }
    Object.defineProperty(ContextSoftware.prototype, "frontBuffer", {
        get: function () {
            return this._frontBuffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextSoftware.prototype, "container", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    ContextSoftware.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask_1.ContextGLClearMask.ALL; }
        this._backBufferColor.lock();
        if (mask & ContextGLClearMask_1.ContextGLClearMask.COLOR) {
            this._colorClearUint32.fill(((alpha * 0xFF << 24) | (red * 0xFF << 16) | (green * 0xFF << 8) | blue * 0xFF));
            this._backBufferColor.setPixels(this._backBufferRect, this._colorClearUint8);
        }
        //TODO: mask & ContextGLClearMask.STENCIL
        if (mask & ContextGLClearMask_1.ContextGLClearMask.DEPTH)
            this._zbuffer.set(this._zbufferClear); //fast memcpy
    };
    ContextSoftware.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        this._antialias = antiAlias;
        if (this._antialias % 2 != 0)
            this._antialias = Math.floor(this._antialias - 0.5);
        if (this._antialias == 0)
            this._antialias = 1;
        this._frontBuffer._setSize(width, height);
        this._backBufferWidth = width * this._antialias;
        this._backBufferHeight = height * this._antialias;
        //double buffer for fast clearing
        var len = this._backBufferWidth * this._backBufferHeight;
        var zbufferBytes = new ArrayBuffer(len * 8);
        this._zbuffer = new Float32Array(zbufferBytes, 0, len);
        this._zbufferClear = new Float32Array(zbufferBytes, len * 4, len);
        for (var i = 0; i < len; i++)
            this._zbufferClear[i] = 10000000;
        var colorClearBuffer = new ArrayBuffer(len * 4);
        this._colorClearUint8 = new Uint8ClampedArray(colorClearBuffer);
        this._colorClearUint32 = new Uint32Array(colorClearBuffer);
        this._backBufferRect.width = this._backBufferWidth;
        this._backBufferRect.height = this._backBufferHeight;
        this._backBufferColor._setSize(this._backBufferWidth, this._backBufferHeight);
        var raw = this._screenMatrix.rawData;
        raw[0] = this._backBufferWidth / 2;
        raw[1] = 0;
        raw[2] = 0;
        raw[3] = this._backBufferWidth / 2;
        raw[4] = 0;
        raw[5] = -this._backBufferHeight / 2;
        raw[6] = 0;
        raw[7] = this._backBufferHeight / 2;
        raw[8] = 0;
        raw[9] = 0;
        raw[10] = 1;
        raw[11] = 0;
        raw[12] = 0;
        raw[13] = 0;
        raw[14] = 0;
        raw[15] = 0;
        this._screenMatrix.transpose();
        this._frontBufferMatrix = new Matrix_1.Matrix();
        this._frontBufferMatrix.scale(1 / this._antialias, 1 / this._antialias);
    };
    ContextSoftware.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        //TODO: impl
        return undefined;
    };
    ContextSoftware.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferSoftware_1.IndexBufferSoftware(numIndices);
    };
    ContextSoftware.prototype.createProgram = function () {
        return new ProgramSoftware_1.ProgramSoftware();
    };
    ContextSoftware.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        return new TextureSoftware_1.TextureSoftware(width, height);
    };
    ContextSoftware.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferSoftware_1.VertexBufferSoftware(numVertices, dataPerVertex);
    };
    ContextSoftware.prototype.dispose = function () {
    };
    ContextSoftware.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this._blendSource = sourceFactor;
        this._blendDestination = destinationFactor;
    };
    ContextSoftware.prototype.setColorMask = function (red, green, blue, alpha) {
        this._colorMaskR = red;
        this._colorMaskG = green;
        this._colorMaskB = blue;
        this._colorMaskA = alpha;
    };
    ContextSoftware.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        //TODO:
    };
    ContextSoftware.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        //TODO:
    };
    ContextSoftware.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        //TODO: CoordinateSystem.RIGHT_HAND
        this._cullingMode = triangleFaceToCull;
    };
    ContextSoftware.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this._writeDepth = depthMask;
        this._depthCompareMode = passCompareMode;
    };
    ContextSoftware.prototype.setProgram = function (program) {
        this._program = program;
    };
    ContextSoftware.prototype.setProgramConstantsFromArray = function (programType, data) {
        var target;
        if (programType == ContextGLProgramType_1.ContextGLProgramType.VERTEX)
            target = this._vertexConstants = new Float32Array(data.length);
        else if (programType == ContextGLProgramType_1.ContextGLProgramType.FRAGMENT)
            target = this._fragmentConstants = new Float32Array(data.length);
        target.set(data);
    };
    ContextSoftware.prototype.setTextureAt = function (sampler, texture) {
        this._textures[sampler] = texture;
    };
    ContextSoftware.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        this._vertexBuffers[index] = buffer;
        this._vertexBufferOffsets[index] = bufferOffset;
        this._vertexBufferFormats[index] = format;
    };
    ContextSoftware.prototype.present = function () {
        this._backBufferColor.unlock();
        this._frontBuffer.fillRect(this._frontBuffer.rect, ColorUtils_1.ColorUtils.ARGBtoFloat32(0, 0, 0, 0));
        this._frontBuffer.draw(this._backBufferColor, this._frontBufferMatrix);
    };
    ContextSoftware.prototype.drawToBitmapImage2D = function (destination) {
    };
    ContextSoftware.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (!this._program)
            return;
        var position0 = new Float32Array(4);
        var position1 = new Float32Array(4);
        var position2 = new Float32Array(4);
        var varying0 = new Float32Array(this._program.numVarying * 4);
        var varying1 = new Float32Array(this._program.numVarying * 4);
        var varying2 = new Float32Array(this._program.numVarying * 4);
        if (this._cullingMode == ContextGLTriangleFace_1.ContextGLTriangleFace.BACK) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
        else if (this._cullingMode == ContextGLTriangleFace_1.ContextGLTriangleFace.FRONT) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
        else if (this._cullingMode == ContextGLTriangleFace_1.ContextGLTriangleFace.FRONT_AND_BACK || this._cullingMode == ContextGLTriangleFace_1.ContextGLTriangleFace.NONE) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
    };
    ContextSoftware.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        //TODO:
    };
    ContextSoftware.prototype.setScissorRectangle = function (rectangle) {
        //TODO:
    };
    ContextSoftware.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        var state = this._samplerStates[sampler];
        if (!state)
            state = this._samplerStates[sampler] = new SoftwareSamplerState_1.SoftwareSamplerState();
        state.wrap = wrap;
        state.filter = filter;
        state.mipfilter = mipfilter;
    };
    ContextSoftware.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        //TODO:
    };
    ContextSoftware.prototype.setRenderToBackBuffer = function () {
        //TODO:
    };
    ContextSoftware.prototype._putPixel = function (x, y, source, dest) {
        argb[0] = 0;
        argb[1] = 0;
        argb[2] = 0;
        argb[3] = 0;
        BlendModeSoftware[this._blendDestination](dest, dest, source);
        BlendModeSoftware[this._blendSource](source, dest, source);
        this._backBufferColor.setPixelData(x, y, argb);
    };
    ContextSoftware.prototype.clamp = function (value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.max(min, Math.min(value, max));
    };
    ContextSoftware.prototype.interpolate = function (min, max, gradient) {
        return min + (max - min) * this.clamp(gradient);
    };
    ContextSoftware.prototype._triangle = function (position0, position1, position2, varying0, varying1, varying2) {
        var p0 = new Vector3D_1.Vector3D(position0[0], position0[1], position0[2], position0[3]);
        if (!p0 || p0.w == 0 || isNaN(p0.w)) {
            console.error("wrong position: " + position0);
            return;
        }
        var p1 = new Vector3D_1.Vector3D(position1[0], position1[1], position1[2], position1[3]);
        var p2 = new Vector3D_1.Vector3D(position2[0], position2[1], position2[2], position2[3]);
        p0.z = p0.z * 2 - p0.w;
        p1.z = p1.z * 2 - p1.w;
        p2.z = p2.z * 2 - p2.w;
        p0.scaleBy(1 / p0.w);
        p1.scaleBy(1 / p1.w);
        p2.scaleBy(1 / p2.w);
        var project = new Vector3D_1.Vector3D(p0.w, p1.w, p2.w);
        p0 = this._screenMatrix.transformVector(p0);
        p1 = this._screenMatrix.transformVector(p1);
        p2 = this._screenMatrix.transformVector(p2);
        var depth = new Vector3D_1.Vector3D(p0.z, p1.z, p2.z);
        this._bboxMin.x = 1000000;
        this._bboxMin.y = 1000000;
        this._bboxMax.x = -1000000;
        this._bboxMax.y = -1000000;
        this._clamp.x = this._backBufferWidth - 1;
        this._clamp.y = this._backBufferHeight - 1;
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p0.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p0.y));
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p1.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p1.y));
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p2.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p2.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p0.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p0.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p1.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p1.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p2.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p2.y));
        this._bboxMin.x = Math.floor(this._bboxMin.x);
        this._bboxMin.y = Math.floor(this._bboxMin.y);
        this._bboxMax.x = Math.floor(this._bboxMax.x);
        this._bboxMax.y = Math.floor(this._bboxMax.y);
        for (var x = this._bboxMin.x; x <= this._bboxMax.x; x++)
            for (var y = this._bboxMin.y; y <= this._bboxMax.y; y++) {
                var screen = this._barycentric(p0, p1, p2, x, y);
                if (screen.x < 0 || screen.y < 0 || screen.z < 0)
                    continue;
                var screenRight = this._barycentric(p0, p1, p2, x + 1, y);
                var screenBottom = this._barycentric(p0, p1, p2, x, y + 1);
                var clip = new Vector3D_1.Vector3D(screen.x / project.x, screen.y / project.y, screen.z / project.z);
                clip.scaleBy(1 / (clip.x + clip.y + clip.z));
                var clipRight = new Vector3D_1.Vector3D(screenRight.x / project.x, screenRight.y / project.y, screenRight.z / project.z);
                clipRight.scaleBy(1 / (clipRight.x + clipRight.y + clipRight.z));
                var clipBottom = new Vector3D_1.Vector3D(screenBottom.x / project.x, screenBottom.y / project.y, screenBottom.z / project.z);
                clipBottom.scaleBy(1 / (clipBottom.x + clipBottom.y + clipBottom.z));
                var index = (x % this._backBufferWidth) + y * this._backBufferWidth;
                var fragDepth = depth.x * screen.x + depth.y * screen.y + depth.z * screen.z;
                if (!DepthCompareModeSoftware[this._depthCompareMode](fragDepth, this._zbuffer[index]))
                    continue;
                var fragmentVO = this._program.fragment(this, clip, clipRight, clipBottom, varying0, varying1, varying2, fragDepth);
                if (fragmentVO.discard)
                    continue;
                if (this._writeDepth)
                    this._zbuffer[index] = fragDepth; //todo: fragmentVO.outputDepth?
                //set source
                source[0] = fragmentVO.outputColor[0] * 255;
                source[1] = fragmentVO.outputColor[1] * 255;
                source[2] = fragmentVO.outputColor[2] * 255;
                source[3] = fragmentVO.outputColor[3] * 255;
                //set dest
                this._backBufferColor.getPixelData(x, y, dest);
                this._putPixel(x, y, source, dest);
            }
    };
    ContextSoftware.prototype._barycentric = function (a, b, c, x, y) {
        this._sx.x = c.x - a.x;
        this._sx.y = b.x - a.x;
        this._sx.z = a.x - x;
        this._sy.x = c.y - a.y;
        this._sy.y = b.y - a.y;
        this._sy.z = a.y - y;
        this._u = this._sx.crossProduct(this._sy, this._u);
        if (this._u.z < 0.01)
            return new Vector3D_1.Vector3D(1 - (this._u.x + this._u.y) / this._u.z, this._u.y / this._u.z, this._u.x / this._u.z);
        return new Vector3D_1.Vector3D(-1, 1, 1);
    };
    ContextSoftware.MAX_SAMPLERS = 8;
    return ContextSoftware;
}());
exports.ContextSoftware = ContextSoftware;
var BlendModeSoftware = (function () {
    function BlendModeSoftware() {
    }
    BlendModeSoftware.destinationAlpha = function (result, dest, source) {
        argb[0] += result[0] * dest[0] / 0xFF;
        argb[1] += result[1] * dest[0] / 0xFF;
        argb[2] += result[2] * dest[0] / 0xFF;
        argb[3] += result[3] * dest[0] / 0xFF;
    };
    BlendModeSoftware.destinationColor = function (result, dest, source) {
        argb[0] += result[0] * dest[0] / 0xFF;
        argb[1] += result[1] * dest[1] / 0xFF;
        argb[2] += result[2] * dest[2] / 0xFF;
        argb[3] += result[3] * dest[3] / 0xFF;
    };
    BlendModeSoftware.zero = function (result, dest, source) {
    };
    BlendModeSoftware.one = function (result, dest, source) {
        argb[0] += result[0];
        argb[1] += result[1];
        argb[2] += result[2];
        argb[3] += result[3];
    };
    BlendModeSoftware.oneMinusDestinationAlpha = function (result, dest, source) {
        argb[0] += result[0] * (1 - dest[0] / 0xFF);
        argb[1] += result[1] * (1 - dest[0] / 0xFF);
        argb[2] += result[2] * (1 - dest[0] / 0xFF);
        argb[3] += result[3] * (1 - dest[0] / 0xFF);
    };
    BlendModeSoftware.oneMinusDestinationColor = function (result, dest, source) {
        argb[0] += result[0] * (1 - dest[0] / 0xFF);
        argb[1] += result[1] * (1 - dest[1] / 0xFF);
        argb[2] += result[2] * (1 - dest[2] / 0xFF);
        argb[3] += result[3] * (1 - dest[3] / 0xFF);
    };
    BlendModeSoftware.oneMinusSourceAlpha = function (result, dest, source) {
        argb[0] += result[0] * (1 - source[0] / 0xFF);
        argb[1] += result[1] * (1 - source[0] / 0xFF);
        argb[2] += result[2] * (1 - source[0] / 0xFF);
        argb[3] += result[3] * (1 - source[0] / 0xFF);
    };
    BlendModeSoftware.oneMinusSourceColor = function (result, dest, source) {
        argb[0] += result[0] * (1 - source[0] / 0xFF);
        argb[1] += result[1] * (1 - source[1] / 0xFF);
        argb[2] += result[2] * (1 - source[2] / 0xFF);
        argb[3] += result[3] * (1 - source[3] / 0xFF);
    };
    BlendModeSoftware.sourceAlpha = function (result, dest, source) {
        argb[0] += result[0] * source[0] / 0xFF;
        argb[1] += result[1] * source[0] / 0xFF;
        argb[2] += result[2] * source[0] / 0xFF;
        argb[3] += result[3] * source[0] / 0xFF;
    };
    BlendModeSoftware.sourceColor = function (result, dest, source) {
        argb[0] += result[0] * source[0] / 0xFF;
        argb[1] += result[1] * source[1] / 0xFF;
        argb[2] += result[2] * source[2] / 0xFF;
        argb[3] += result[3] * source[3] / 0xFF;
    };
    return BlendModeSoftware;
}());
exports.BlendModeSoftware = BlendModeSoftware;
var DepthCompareModeSoftware = (function () {
    function DepthCompareModeSoftware() {
    }
    DepthCompareModeSoftware.always = function (fragDepth, currentDepth) {
        return true;
    };
    DepthCompareModeSoftware.equal = function (fragDepth, currentDepth) {
        return fragDepth == currentDepth;
    };
    DepthCompareModeSoftware.greater = function (fragDepth, currentDepth) {
        return fragDepth > currentDepth;
    };
    DepthCompareModeSoftware.greaterEqual = function (fragDepth, currentDepth) {
        return fragDepth >= currentDepth;
    };
    DepthCompareModeSoftware.less = function (fragDepth, currentDepth) {
        return fragDepth < currentDepth;
    };
    DepthCompareModeSoftware.lessEqual = function (fragDepth, currentDepth) {
        return fragDepth <= currentDepth;
    };
    DepthCompareModeSoftware.never = function (fragDepth, currentDepth) {
        return false;
    };
    DepthCompareModeSoftware.notEqual = function (fragDepth, currentDepth) {
        return fragDepth != currentDepth;
    };
    return DepthCompareModeSoftware;
}());
exports.DepthCompareModeSoftware = DepthCompareModeSoftware;
var argb = new Uint8ClampedArray(4);
var source = new Uint8ClampedArray(4);
var dest = new Uint8ClampedArray(4);
