"use strict";
var AGALTokenizer_1 = require("../aglsl/AGALTokenizer");
var ProgramVOSoftware_1 = require("../base/ProgramVOSoftware");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var SoftwareSamplerState_1 = require("../base/SoftwareSamplerState");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var ProgramSoftware = (function () {
    function ProgramSoftware() {
        this._numVarying = 0;
    }
    Object.defineProperty(ProgramSoftware.prototype, "numVarying", {
        get: function () {
            return this._numVarying;
        },
        enumerable: true,
        configurable: true
    });
    ProgramSoftware.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._vertexDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(vertexProgram);
        this._vertexVO = new ProgramVOSoftware_1.ProgramVOSoftware();
        this._vertexVO.temp = new Float32Array(this._vertexDescr.regwrite[0x2].length * 4);
        this._vertexVO.attributes = new Float32Array(this._vertexDescr.regread[0x0].length * 4);
        this._numVarying = this._vertexDescr.regwrite[0x4].length;
        this._fragmentDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(fragmentProgram);
        this._fragmentVO = new ProgramVOSoftware_1.ProgramVOSoftware();
        this._fragmentVO.temp = new Float32Array(this._fragmentDescr.regwrite[0x2].length * 4);
        this._fragmentVO.varying = new Float32Array(this._fragmentDescr.regread[0x4].length * 4);
        this._fragmentVO.derivativeX = new Float32Array(this._fragmentVO.varying.length);
        this._fragmentVO.derivativeY = new Float32Array(this._fragmentVO.varying.length);
    };
    ProgramSoftware.prototype.dispose = function () {
        this._vertexDescr = null;
        this._fragmentDescr = null;
    };
    ProgramSoftware.prototype.vertex = function (context, vertexIndex, position, varying) {
        //set attributes
        var i;
        var j = 0;
        var numAttributes = this._vertexDescr.regread[0x0].length;
        var attributes = this._vertexVO.attributes;
        for (i = 0; i < numAttributes; i++) {
            var buffer = context._vertexBuffers[i];
            if (!buffer)
                continue;
            var index = context._vertexBufferOffsets[i] / 4 + vertexIndex * buffer.attributesPerVertex;
            if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.UNSIGNED_BYTE_4) {
                attributes[j++] = buffer.uintData[index * 4];
                attributes[j++] = buffer.uintData[index * 4 + 1];
                attributes[j++] = buffer.uintData[index * 4 + 2];
                attributes[j++] = buffer.uintData[index * 4 + 3];
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_4) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = buffer.data[index + 2];
                attributes[j++] = buffer.data[index + 3];
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_3) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = buffer.data[index + 2];
                attributes[j++] = 1;
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_2) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = 0;
                attributes[j++] = 1;
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.ContextGLVertexBufferFormat.FLOAT_1) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = 0;
                attributes[j++] = 0;
                attributes[j++] = 1;
            }
        }
        //clear temps
        var temp = this._vertexVO.temp;
        var numTemp = temp.length;
        for (var i = 0; i < numTemp; i += 4) {
            temp[i] = 0;
            temp[i + 1] = 0;
            temp[i + 2] = 0;
            temp[i + 3] = 1;
        }
        this._vertexVO.outputPosition = position;
        this._vertexVO.varying = varying;
        var len = this._vertexDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._vertexDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](this._vertexVO, this._vertexDescr, token.dest, token.a, token.b, context);
        }
    };
    ProgramSoftware.prototype.fragment = function (context, clip, clipRight, clipBottom, varying0, varying1, varying2, fragDepth) {
        this._fragmentVO.outputDepth = fragDepth;
        //clear temps
        var temp = this._fragmentVO.temp;
        var numTemp = temp.length;
        for (var i = 0; i < numTemp; i += 4) {
            temp[i] = 0;
            temp[i + 1] = 0;
            temp[i + 2] = 0;
            temp[i + 3] = 1;
        }
        //check for requirement of derivatives
        var varyingDerivatives = [];
        var len = this._fragmentDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._fragmentDescr.tokens[i];
            if (token.opcode == 0x28 && context._samplerStates[token.b.regnum] && context._samplerStates[token.b.regnum].mipfilter == ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR && context._textures[token.b.regnum].getMipLevelsCount() > 1)
                varyingDerivatives.push(token.a.regnum);
        }
        var derivativeX = this._fragmentVO.derivativeX;
        var derivativeY = this._fragmentVO.derivativeY;
        var varying = this._fragmentVO.varying;
        var numVarying = varying.length;
        for (var i = 0; i < numVarying; i += 4) {
            // if (!varying0 || !varying1 || !varying2) continue;
            varying[i] = clip.x * varying0[i] + clip.y * varying1[i] + clip.z * varying2[i];
            varying[i + 1] = clip.x * varying0[i + 1] + clip.y * varying1[i + 1] + clip.z * varying2[i + 1];
            varying[i + 2] = clip.x * varying0[i + 2] + clip.y * varying1[i + 2] + clip.z * varying2[i + 2];
            varying[i + 3] = clip.x * varying0[i + 3] + clip.y * varying1[i + 3] + clip.z * varying2[i + 3];
            if (varyingDerivatives.indexOf(i) == -1)
                continue;
            derivativeX[i] = clipRight.x * varying0[i] + clipRight.y * varying1[i] + clipRight.z * varying2[i];
            derivativeX[i + 1] = clipRight.x * varying0[i + 1] + clipRight.y * varying1[i + 1] + clipRight.z * varying2[i + 1];
            derivativeX[i + 2] = clipRight.x * varying0[i + 2] + clipRight.y * varying1[i + 2] + clipRight.z * varying2[i + 2];
            derivativeX[i + 3] = clipRight.x * varying0[i + 3] + clipRight.y * varying1[i + 3] + clipRight.z * varying2[i + 3];
            derivativeX[i] -= varying[i];
            derivativeX[i + 1] -= varying[i + 1];
            derivativeX[i + 2] -= varying[i + 2];
            derivativeX[i + 3] -= varying[i + 3];
            derivativeY[i] = clipBottom.x * varying0[i] + clipBottom.y * varying1[i] + clipBottom.z * varying2[i];
            derivativeY[i + 1] = clipBottom.x * varying0[i + 1] + clipBottom.y * varying1[i + 1] + clipBottom.z * varying2[i + 1];
            derivativeY[i + 2] = clipBottom.x * varying0[i + 2] + clipBottom.y * varying1[i + 2] + clipBottom.z * varying2[i + 2];
            derivativeY[i + 3] = clipBottom.x * varying0[i + 3] + clipBottom.y * varying1[i + 3] + clipBottom.z * varying2[i + 3];
            derivativeY[i] -= varying[i];
            derivativeY[i + 1] -= varying[i + 1];
            derivativeY[i + 2] -= varying[i + 2];
            derivativeY[i + 3] -= varying[i + 3];
        }
        for (var i = 0; i < len; i++) {
            var token = this._fragmentDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](this._fragmentVO, this._fragmentDescr, token.dest, token.a, token.b, context);
        }
        return this._fragmentVO;
    };
    ProgramSoftware.getDestTarget = function (vo, desc, dest) {
        var target;
        if (dest.regtype == 0x2) {
            target = vo.temp;
        }
        else if (dest.regtype == 0x3) {
            if (desc.header.type == "vertex") {
                target = vo.outputPosition;
            }
            else {
                target = vo.outputColor;
            }
        }
        else if (dest.regtype == 0x4) {
            target = vo.varying;
        }
        return target;
    };
    ProgramSoftware.getSourceTarget = function (vo, desc, dest, context) {
        var target;
        if (dest.regtype == 0x0) {
            target = vo.attributes;
        }
        else if (dest.regtype == 0x1) {
            if (desc.header.type == "vertex") {
                target = context._vertexConstants;
            }
            else {
                target = context._fragmentConstants;
            }
        }
        else if (dest.regtype == 0x2) {
            target = vo.temp;
        }
        else if (dest.regtype == 0x4) {
            target = vo.varying;
        }
        return target;
    };
    ProgramSoftware.mov = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1.swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1.swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1.swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1.swizzle >> 6) & 3)];
    };
    ProgramSoftware.m44 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2] + source2Target[source2Reg + 3];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6] + source2Target[source2Reg + 7];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10] + source2Target[source2Reg + 11];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg] * source2Target[source2Reg + 12] + source1Target[source1Reg + 1] * source2Target[source2Reg + 13] + source1Target[source1Reg + 2] * source2Target[source2Reg + 14] + source2Target[source2Reg + 15];
    };
    ProgramSoftware.sample = function (vo, desc, context, source1, textureIndex) {
        var source1Reg = 4 * source1.regnum;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var u = source1Target[((source1.swizzle >> 0) & 3)];
        var v = source1Target[((source1.swizzle >> 2) & 3)];
        if (textureIndex >= context._textures.length || context._textures[textureIndex] == null)
            return new Float32Array([1, u, v, 0]);
        var texture = context._textures[textureIndex];
        var state = context._samplerStates[textureIndex] || this._defaultSamplerState;
        var repeat = state.wrap == ContextGLWrapMode_1.ContextGLWrapMode.REPEAT;
        var mipmap = state.mipfilter == ContextGLMipFilter_1.ContextGLMipFilter.MIPLINEAR;
        if (mipmap && texture.getMipLevelsCount() > 1) {
            var dux = Math.abs(vo.derivativeX[source1Reg + ((source1.swizzle >> 0) & 3)]);
            var dvx = Math.abs(vo.derivativeX[source1Reg + ((source1.swizzle >> 2) & 3)]);
            var duy = Math.abs(vo.derivativeY[source1Reg + ((source1.swizzle >> 0) & 3)]);
            var dvy = Math.abs(vo.derivativeY[source1Reg + ((source1.swizzle >> 2) & 3)]);
            var lambda = Math.log(Math.max(texture.width * Math.sqrt(dux * dux + dvx * dvx), texture.height * Math.sqrt(duy * duy + dvy * dvy))) / Math.LN2;
            if (lambda > 0) {
                var miplevelLow = Math.floor(lambda);
                var miplevelHigh = Math.ceil(lambda);
                var maxmiplevel = Math.log(Math.min(texture.width, texture.height)) / Math.LN2;
                if (miplevelHigh > maxmiplevel)
                    miplevelHigh = maxmiplevel;
                if (miplevelLow > maxmiplevel)
                    miplevelLow = maxmiplevel;
                var mipblend = lambda - Math.floor(lambda);
                var resultLow;
                var resultHigh;
                var dataLow = texture.getData(miplevelLow);
                var dataLowWidth = texture.width / Math.pow(2, miplevelLow);
                var dataLowHeight = texture.height / Math.pow(2, miplevelLow);
                var dataHigh = texture.getData(miplevelHigh);
                var dataHighWidth = texture.width / Math.pow(2, miplevelHigh);
                var dataHighHeight = texture.height / Math.pow(2, miplevelHigh);
                if (state.filter == ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR) {
                    resultLow = ProgramSoftware.sampleBilinear(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleBilinear(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                }
                else {
                    resultLow = ProgramSoftware.sampleNearest(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleNearest(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                }
                return ProgramSoftware.interpolateColor(resultLow, resultHigh, mipblend);
            }
        }
        var result;
        var data = texture.getData(0);
        if (state.filter == ContextGLTextureFilter_1.ContextGLTextureFilter.LINEAR) {
            result = ProgramSoftware.sampleBilinear(u, v, data, texture.width, texture.height, repeat);
        }
        else {
            result = ProgramSoftware.sampleNearest(u, v, data, texture.width, texture.height, repeat);
        }
        return result;
    };
    ProgramSoftware.sampleNearest = function (u, v, textureData, textureWidth, textureHeight, repeat) {
        u *= textureWidth;
        v *= textureHeight;
        if (repeat) {
            u = Math.abs(u % textureWidth);
            v = Math.abs(v % textureHeight);
        }
        else {
            if (u < 0)
                u = 0;
            else if (u > textureWidth - 1)
                u = textureWidth - 1;
            if (v < 0)
                v = 0;
            else if (v > textureHeight - 1)
                v = textureHeight - 1;
        }
        u = Math.floor(u);
        v = Math.floor(v);
        var pos = (u + v * textureWidth) * 4;
        var r = textureData[pos] / 255;
        var g = textureData[pos + 1] / 255;
        var b = textureData[pos + 2] / 255;
        var a = textureData[pos + 3] / 255;
        return new Float32Array([a, r, g, b]);
    };
    ProgramSoftware.sampleBilinear = function (u, v, textureData, textureWidth, textureHeight, repeat) {
        var texelSizeX = 1 / textureWidth;
        var texelSizeY = 1 / textureHeight;
        u -= texelSizeX / 2;
        v -= texelSizeY / 2;
        var color00 = ProgramSoftware.sampleNearest(u, v, textureData, textureWidth, textureHeight, repeat);
        var color10 = ProgramSoftware.sampleNearest(u + texelSizeX, v, textureData, textureWidth, textureHeight, repeat);
        var color01 = ProgramSoftware.sampleNearest(u, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);
        var color11 = ProgramSoftware.sampleNearest(u + texelSizeX, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);
        var a = u * textureWidth;
        a = a - Math.floor(a);
        var interColor0 = ProgramSoftware.interpolateColor(color00, color10, a);
        var interColor1 = ProgramSoftware.interpolateColor(color01, color11, a);
        var b = v * textureHeight;
        b = b - Math.floor(b);
        return ProgramSoftware.interpolateColor(interColor0, interColor1, b);
    };
    ProgramSoftware.interpolateColor = function (source, target, a) {
        var result = new Float32Array(4);
        result[0] = source[0] + (target[0] - source[0]) * a;
        result[1] = source[1] + (target[1] - source[1]) * a;
        result[2] = source[2] + (target[2] - source[2]) * a;
        result[3] = source[3] + (target[3] - source[3]) * a;
        return result;
    };
    ProgramSoftware.tex = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var color = ProgramSoftware.sample(vo, desc, context, source1, source2.regnum);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = color[1];
        if (mask & 2)
            target[targetReg + 1] = color[2];
        if (mask & 4)
            target[targetReg + 2] = color[3];
        if (mask & 8)
            target[targetReg + 3] = color[0];
    };
    ProgramSoftware.add = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sub = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.mul = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.div = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.rcp = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = 1 / source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = 1 / source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = 1 / source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = 1 / source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.min = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.max = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.frc = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.sqt = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.rsq = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.pow = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.log = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]) / Math.LN2;
        if (mask & 2)
            target[targetReg + 1] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]) / Math.LN2;
        if (mask & 4)
            target[targetReg + 2] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]) / Math.LN2;
        if (mask & 8)
            target[targetReg + 3] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]) / Math.LN2;
    };
    ProgramSoftware.exp = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.nrm = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var x = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var y = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var z = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var len = Math.sqrt(x * x + y * y + z * z);
        x /= len;
        y /= len;
        z /= len;
        if (mask & 1)
            target[targetReg] = x;
        if (mask & 2)
            target[targetReg + 1] = y;
        if (mask & 4)
            target[targetReg + 2] = z;
    };
    ProgramSoftware.sin = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.cos = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.crs = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetY * source2TargetZ - source1TargetZ * source2TargetY;
        if (mask & 2)
            target[targetReg + 1] = source1TargetZ * source2TargetX - source1TargetX * source2TargetZ;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetY - source1TargetY * source2TargetX;
    };
    ProgramSoftware.dp3 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 2)
            target[targetReg + 1] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 8)
            target[targetReg + 3] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
    };
    ProgramSoftware.dp4 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 2)
            target[targetReg + 1] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 8)
            target[targetReg + 3] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
    };
    ProgramSoftware.abs = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.neg = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = -source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = -source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = -source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = -source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sat = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]));
        if (mask & 2)
            target[targetReg + 1] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]));
        if (mask & 4)
            target[targetReg + 2] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]));
        if (mask & 8)
            target[targetReg + 3] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]));
    };
    ProgramSoftware.m33 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10];
    };
    ProgramSoftware.m34 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2] + source2Target[source2Reg + 3];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6] + source2Target[source2Reg + 7];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10] + source2Target[source2Reg + 11];
    };
    ProgramSoftware.ddx = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = vo.derivativeX;
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.ddy = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = vo.derivativeY;
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sge = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX >= source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY >= source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ >= source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW >= source2TargetW ? 1 : 0;
    };
    ProgramSoftware.slt = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX < source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY < source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ < source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW < source2TargetW ? 1 : 0;
    };
    ProgramSoftware.seq = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX == source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY == source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ == source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW == source2TargetW ? 1 : 0;
    };
    ProgramSoftware.sne = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX != source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY != source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ != source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW != source2TargetW ? 1 : 0;
    };
    ProgramSoftware.sgn = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = (source1TargetX < 0) ? -1 : (source1TargetX > 0) ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = (source1TargetY < 0) ? -1 : (source1TargetY > 0) ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = (source1TargetZ < 0) ? -1 : (source1TargetZ > 0) ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = (source1TargetW < 0) ? -1 : (source1TargetW > 0) ? 1 : 0;
    };
    ProgramSoftware.kil = function (vo, desc, dest, source1, source2, context) {
        var source1Reg = 4 * source1.regnum;
        var source1Swizzle = source1.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (source1TargetX < 0)
            vo.discard = true;
    };
    ProgramSoftware._defaultSamplerState = new SoftwareSamplerState_1.SoftwareSamplerState();
    ProgramSoftware._tokenizer = new AGALTokenizer_1.AGALTokenizer();
    ProgramSoftware._opCodeFunc = [
        ProgramSoftware.mov,
        ProgramSoftware.add,
        ProgramSoftware.sub,
        ProgramSoftware.mul,
        ProgramSoftware.div,
        ProgramSoftware.rcp,
        ProgramSoftware.min,
        ProgramSoftware.max,
        ProgramSoftware.frc,
        ProgramSoftware.sqt,
        ProgramSoftware.rsq,
        ProgramSoftware.pow,
        ProgramSoftware.log,
        ProgramSoftware.exp,
        ProgramSoftware.nrm,
        ProgramSoftware.sin,
        ProgramSoftware.cos,
        ProgramSoftware.crs,
        ProgramSoftware.dp3,
        ProgramSoftware.dp4,
        ProgramSoftware.abs,
        ProgramSoftware.neg,
        ProgramSoftware.sat,
        ProgramSoftware.m33,
        ProgramSoftware.m44,
        ProgramSoftware.m34,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        ProgramSoftware.kil,
        ProgramSoftware.tex,
        ProgramSoftware.sge,
        ProgramSoftware.slt,
        ProgramSoftware.sgn,
        ProgramSoftware.seq,
        ProgramSoftware.sne
    ];
    return ProgramSoftware;
}());
exports.ProgramSoftware = ProgramSoftware;
