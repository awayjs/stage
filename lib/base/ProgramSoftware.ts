import ByteArray                    = require("awayjs-core/lib/utils/ByteArray");

import AGALTokenizer                = require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
import AGLSLParser                    = require("awayjs-stagegl/lib/aglsl/AGLSLParser");
import IProgram                        = require("awayjs-stagegl/lib/base/IProgram");
import ProgramVOSoftware                        = require("awayjs-stagegl/lib/base/ProgramVOSoftware");
import ContextSoftware                        = require("awayjs-stagegl/lib/base/ContextSoftware");
import Description                = require("awayjs-stagegl/lib/aglsl/Description");
import Header                    = require("awayjs-stagegl/lib/aglsl/Header");
import Mapping                    = require("awayjs-stagegl/lib/aglsl/Mapping");
import Token                    = require("awayjs-stagegl/lib/aglsl/Token");
import Matrix3D                        = require("awayjs-core/lib/geom/Matrix3D");
import Point                        = require("awayjs-core/lib/geom/Point");
import Vector3D                        = require("awayjs-core/lib/geom/Vector3D");
import Destination                = require("awayjs-stagegl/lib/aglsl/Destination");
import AGALMiniAssembler            = require("awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler");
import VertexBufferSoftware                    = require("awayjs-stagegl/lib/base/VertexBufferSoftware");
import ContextGLVertexBufferFormat    = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
import TextureSoftware                    = require("awayjs-stagegl/lib/base/TextureSoftware");
import SoftwareSamplerState = require("awayjs-stagegl/lib/base/SoftwareSamplerState");
import SamplerBase = require("awayjs-core/lib/image/SamplerBase");
import Sampler2D = require("awayjs-core/lib/image/Sampler2D");
import SamplerCube = require("awayjs-core/lib/image/SamplerCube");
import ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
import ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
import ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");

class ProgramSoftware implements IProgram {
    private static _defaultSamplerState:SoftwareSamplerState = new SoftwareSamplerState();
    private static _tokenizer:AGALTokenizer = new AGALTokenizer();
    private static _opCodeFunc:{(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void}[] = [
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
        ProgramSoftware.m34,//25
        null,//26
        null,//27
        null,//28
        null,//29
        null,//30
        null,//31
        null,//32
        null,//33
        null,//34
        null,//35
        null,//36
        null,//37
        null,//38
        ProgramSoftware.kil,
        ProgramSoftware.tex,
        ProgramSoftware.sge,
        ProgramSoftware.slt,
        ProgramSoftware.sgn,
        ProgramSoftware.seq,
        ProgramSoftware.sne
    ];

    private _vertexDescr:Description;
    private _fragmentDescr:Description;

    constructor() {

    }

    public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray) {
        this._vertexDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(vertexProgram);
        this._fragmentDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(fragmentProgram);
    }

    public dispose() {
        this._vertexDescr = null;
        this._fragmentDescr = null;
    }

    public vertex(contextSoftware:ContextSoftware, vertexIndex:number):ProgramVOSoftware {
        var vo:ProgramVOSoftware = new ProgramVOSoftware();
        //parse attributes
        var i:number;
        for (i = 0; i < contextSoftware._vertexBuffers.length; i++) {
            var buffer:VertexBufferSoftware = contextSoftware._vertexBuffers[i];
            if (!buffer) continue;

            var attribute:Vector3D = new Vector3D(0, 0, 0, 1);

            var index:number = contextSoftware._vertexBufferOffsets[i] / 4 + vertexIndex * buffer.attributesPerVertex;
            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.UNSIGNED_BYTE_4) {
                attribute.x = buffer.uintData[index*4];
                attribute.y = buffer.uintData[index*4+1];
                attribute.z = buffer.uintData[index*4+2];
                attribute.w = buffer.uintData[index*4+3];
            }

            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_1) {
                attribute.x = buffer.data[index];
            }

            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_2) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
            }

            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_3) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
                attribute.z = buffer.data[index + 2];
            }

            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_4) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
                attribute.z = buffer.data[index + 2];
                attribute.w = buffer.data[index + 3];
            }
            vo.attributes[i] = attribute;
        }

        var len:number = this._vertexDescr.tokens.length;
        for (var i:number = 0; i < len; i++) {
            var token:Token = this._vertexDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](vo, this._vertexDescr, token.dest, token.a, token.b, contextSoftware);
        }

        return vo;
    }

    public fragment(context:ContextSoftware, clip:Vector3D, clipRight:Vector3D, clipBottom:Vector3D, vo0:ProgramVOSoftware, vo1:ProgramVOSoftware, vo2:ProgramVOSoftware, fragDepth:number):ProgramVOSoftware {
        var vo:ProgramVOSoftware = new ProgramVOSoftware();
        vo.outputDepth = fragDepth;

        for (var i:number = 0; i < vo0.varying.length; i++) {
            var varying0:Vector3D = vo0.varying[i];
            var varying1:Vector3D = vo1.varying[i];
            var varying2:Vector3D = vo2.varying[i];
            if (!varying0 || !varying1 || !varying2) continue;

            var result:Vector3D = vo.varying[i] = new Vector3D(0, 0, 0, 1);
            result.x = clip.x * varying0.x + clip.y * varying1.x + clip.z * varying2.x;
            result.y = clip.x * varying0.y + clip.y * varying1.y + clip.z * varying2.y;
            result.z = clip.x * varying0.z + clip.y * varying1.z + clip.z * varying2.z;
            result.w = clip.x * varying0.w + clip.y * varying1.w + clip.z * varying2.w;

            var derivativeX:Vector3D = vo.derivativeX[i] = new Vector3D();
            derivativeX.x = clipRight.x * varying0.x + clipRight.y * varying1.x + clipRight.z * varying2.x;
            derivativeX.y = clipRight.x * varying0.y + clipRight.y * varying1.y + clipRight.z * varying2.y;
            derivativeX.z = clipRight.x * varying0.z + clipRight.y * varying1.z + clipRight.z * varying2.z;
            derivativeX.w = clipRight.x * varying0.w + clipRight.y * varying1.w + clipRight.z * varying2.w;
            derivativeX.x -= result.x;
            derivativeX.y -= result.y;
            derivativeX.z -= result.z;
            derivativeX.w -= result.w;

            var derivativeY:Vector3D = vo.derivativeY[i] = new Vector3D();
            derivativeY.x = clipBottom.x * varying0.x + clipBottom.y * varying1.x + clipBottom.z * varying2.x;
            derivativeY.y = clipBottom.x * varying0.y + clipBottom.y * varying1.y + clipBottom.z * varying2.y;
            derivativeY.z = clipBottom.x * varying0.z + clipBottom.y * varying1.z + clipBottom.z * varying2.z;
            derivativeY.w = clipBottom.x * varying0.w + clipBottom.y * varying1.w + clipBottom.z * varying2.w;
            derivativeY.x -= result.x;
            derivativeY.y -= result.y;
            derivativeY.z -= result.z;
            derivativeY.w -= result.w;
        }

        var len:number = this._fragmentDescr.tokens.length;
        for (var i:number = 0; i < len; i++) {
            var token:Token = this._fragmentDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](vo, this._fragmentDescr, token.dest, token.a, token.b, context);
        }

        return vo;
    }

    private static getDestTarget(vo:ProgramVOSoftware, desc:Description, dest:Destination):Vector3D {
        var targetType:Vector3D[];

        if (dest.regtype == 0x2) {
            targetType = vo.temp;
        } else if (dest.regtype == 0x3) {

            if (desc.header.type == "vertex") {
                targetType = vo.outputPosition;
            } else {
                targetType = vo.outputColor;
            }
        } else if (dest.regtype == 0x4) {
            targetType = vo.varying;
        }
        var targetIndex:number = dest.regnum;
        var target:Vector3D = targetType[targetIndex];
        if (!target) {
            target = targetType[targetIndex] = new Vector3D(0, 0, 0, 1);
        }
        return target;
    }

    private static getSourceTargetType(vo:ProgramVOSoftware, desc:Description, dest:Destination, context:ContextSoftware):Vector3D[] {
        var targetType:Vector3D[];

        if (dest.regtype == 0x0) {
            targetType = vo.attributes;
        } else if (dest.regtype == 0x1) {
            if (desc.header.type == "vertex") {
                targetType = context._vertexConstants;
            } else {
                targetType = context._fragmentConstants;
            }
        } else if (dest.regtype == 0x2) {
            targetType = vo.temp;
        } else if (dest.regtype == 0x4) {
            targetType = vo.varying;
        }
        return targetType;
    }

    private static getSourceTargetByIndex(targetType:Vector3D[], targetIndex:number):Vector3D {
        var target:Vector3D = targetType[targetIndex];
        if (!target) {
            target = targetType[targetIndex] = new Vector3D(0, 0, 0, 1);
        }
        return target;
    }

    private static getSourceTarget(vo:ProgramVOSoftware, desc:Description, dest:Destination, context:ContextSoftware):Vector3D {
        var targetType:Vector3D[] = ProgramSoftware.getSourceTargetType(vo, desc, dest, context);
        return ProgramSoftware.getSourceTargetByIndex(targetType, dest.regnum);
    }

    public static mov(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    }

    public static m44(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var source2Type:Vector3D[] = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);

        var source2Target0:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);
        var source2Target3:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 3);

        var matrix:Matrix3D = new Matrix3D(new Float32Array([
            source2Target0.x, source2Target1.x, source2Target2.x, source2Target3.x,
            source2Target0.y, source2Target1.y, source2Target2.y, source2Target3.y,
            source2Target0.z, source2Target1.z, source2Target2.z, source2Target3.z,
            source2Target0.w, source2Target1.w, source2Target2.w, source2Target3.w
        ]));

        var result:Vector3D = matrix.transformVector(source1Target);

        if (dest.mask & 1) {
            target.x = result.x;
        }

        if (dest.mask & 2) {
            target.y = result.y;
        }

        if (dest.mask & 4) {
            target.z = result.z;
        }

        if (dest.mask & 8) {
            target.w = result.w;
        }
    }

    private static sample(vo:ProgramVOSoftware, context:ContextSoftware, u:number, v:number, textureIndex:number, dux:number, dvx:number, duy:number, dvy:number):number[] {
        if (textureIndex >= context._textures.length || context._textures[textureIndex] == null) {
            return [1, u, v, 0];
        }

        var texture:TextureSoftware = context._textures[textureIndex];
        var state:SoftwareSamplerState = context._samplerStates[textureIndex];
        if (!state) {
            state = this._defaultSamplerState;
        }
        var repeat:boolean = state.wrap == ContextGLWrapMode.REPEAT;
        var mipmap:boolean = state.mipfilter == ContextGLMipFilter.MIPLINEAR;
        if (mipmap && texture.getMipLevelsCount() > 1) {
            dux = Math.abs(dux);
            dvx = Math.abs(dvx);
            duy = Math.abs(duy);
            dvy = Math.abs(dvy);

            var lambda:number = Math.log(Math.max(texture.width * Math.sqrt(dux * dux + dvx * dvx), texture.height * Math.sqrt(duy * duy + dvy * dvy))) / Math.LN2;
            if (lambda > 0) {

                var miplevelLow:number = Math.floor(lambda);
                var miplevelHigh:number = Math.ceil(lambda);

                var maxmiplevel:number = Math.log(Math.min(texture.width, texture.height)) / Math.LN2;

                if (miplevelHigh > maxmiplevel) {
                    miplevelHigh = maxmiplevel;
                }
                if (miplevelLow > maxmiplevel) {
                    miplevelLow = maxmiplevel;
                }

                var mipblend:number = lambda - Math.floor(lambda);

                var resultLow:number[] = [];
                var resultHigh:number[] = [];


                var dataLow:number[] = texture.getData(miplevelLow);
                var dataLowWidth:number = texture.width / Math.pow(2, miplevelLow);
                var dataLowHeight:number = texture.height / Math.pow(2, miplevelLow);
                var dataHigh:number[] = texture.getData(miplevelHigh);
                var dataHighWidth:number = texture.width / Math.pow(2, miplevelHigh);
                var dataHighHeight:number = texture.height / Math.pow(2, miplevelHigh);

                if (state.filter == ContextGLTextureFilter.LINEAR) {
                    resultLow = ProgramSoftware.sampleBilinear(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleBilinear(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                } else {
                    resultLow = ProgramSoftware.sampleNearest(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleNearest(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                }

                return ProgramSoftware.interpolateColor(resultLow, resultHigh, mipblend);
            }
        }

        var result:number[];
        var data:number[] = texture.getData(0);
        if (state.filter == ContextGLTextureFilter.LINEAR) {
            result = ProgramSoftware.sampleBilinear(u, v, data, texture.width, texture.height, repeat);
        } else {
            result = ProgramSoftware.sampleNearest(u, v, data, texture.width, texture.height, repeat);
        }
        return result;
    }

    private static sampleNearest(u:number, v:number, textureData:number[], textureWidth:number, textureHeight:number, repeat:boolean):number[] {
        u *= textureWidth;
        v *= textureHeight;

        if (repeat) {
            u = Math.abs(u % textureWidth);
            v = Math.abs(v % textureHeight);
        } else {
            if (u < 0) {
                u = 0;
            } else if (u > textureWidth - 1) {
                u = textureWidth - 1;
            }

            if (v < 0) {
                v = 0;
            } else if (v > textureHeight - 1) {
                v = textureHeight - 1;
            }
        }

        u = Math.floor(u);
        v = Math.floor(v);

        var pos:number = (u + v * textureWidth) * 4;
        var r:number = textureData[pos] / 255;
        var g:number = textureData[pos + 1] / 255;
        var b:number = textureData[pos + 2] / 255;
        var a:number = textureData[pos + 3] / 255;

        return [a, r, g, b];
    }

    private static sampleBilinear(u:number, v:number, textureData:number[], textureWidth:number, textureHeight:number, repeat:boolean):number[] {
        var texelSizeX:number = 1 / textureWidth;
        var texelSizeY:number = 1 / textureHeight;
        u -= texelSizeX / 2;
        v -= texelSizeY / 2;

        var color00:number[] = ProgramSoftware.sampleNearest(u, v, textureData, textureWidth, textureHeight, repeat);
        var color10:number[] = ProgramSoftware.sampleNearest(u + texelSizeX, v, textureData, textureWidth, textureHeight, repeat);

        var color01:number[] = ProgramSoftware.sampleNearest(u, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);
        var color11:number[] = ProgramSoftware.sampleNearest(u + texelSizeX, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);

        var a:number = u * textureWidth;
        a = a - Math.floor(a);

        var interColor0:number[] = ProgramSoftware.interpolateColor(color00, color10, a);
        var interColor1:number[] = ProgramSoftware.interpolateColor(color01, color11, a);

        var b:number = v * textureHeight;
        b = b - Math.floor(b);
        return ProgramSoftware.interpolateColor(interColor0, interColor1, b);
    }


    private static interpolateColor(source:number[], target:number[], a:number):number[] {
        var result:number[] = [];
        result[0] = source[0] + (target[0] - source[0]) * a;
        result[1] = source[1] + (target[1] - source[1]) * a;
        result[2] = source[2] + (target[2] - source[2]) * a;
        result[3] = source[3] + (target[3] - source[3]) * a;
        return result;
    }

    public static tex(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        var u:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var v:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];

        var dux:number = vo.derivativeX[source1.regnum][swiz[(source1.swizzle >> 0) & 3]];
        var dvx:number = vo.derivativeX[source1.regnum][swiz[(source1.swizzle >> 2) & 3]];
        var duy:number = vo.derivativeY[source1.regnum][swiz[(source1.swizzle >> 0) & 3]];
        var dvy:number = vo.derivativeY[source1.regnum][swiz[(source1.swizzle >> 2) & 3]];

        var color:number[] = ProgramSoftware.sample(vo, context, u, v, source2.regnum, dux, dvx, duy, dvy);

        if (dest.mask & 1) {
            target.x = color[1];
        }

        if (dest.mask & 2) {
            target.y = color[2];
        }

        if (dest.mask & 4) {
            target.z = color[3];
        }

        if (dest.mask & 8) {
            target.w = color[0];
        }
    }

    public static add(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] + source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] + source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] + source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] + source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    }

    public static sub(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] - source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] - source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] - source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] - source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    }

    public static mul(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] * source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] * source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] * source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] * source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    }

    public static div(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] / source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] / source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] / source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] / source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    }

    public static rcp(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = 1 / source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = 1 / source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = 1 / source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = 1 / source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    }

    public static min(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.min(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.min(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.min(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.min(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    }

    public static max(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.max(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.max(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.max(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.max(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    }

    public static frc(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static sqt(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.sqrt(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.sqrt(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.sqrt(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.sqrt(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static rsq(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static pow(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.pow(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.pow(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.pow(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.pow(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    }

    public static log(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.log(source1Target[swiz[(source1.swizzle >> 0) & 3]]) / Math.LN2;
        }

        if (dest.mask & 2) {
            target.y = Math.log(source1Target[swiz[(source1.swizzle >> 2) & 3]]) / Math.LN2;
        }

        if (dest.mask & 4) {
            target.z = Math.log(source1Target[swiz[(source1.swizzle >> 4) & 3]]) / Math.LN2;
        }

        if (dest.mask & 8) {
            target.w = Math.log(source1Target[swiz[(source1.swizzle >> 6) & 3]]) / Math.LN2;
        }
    }

    public static exp(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.exp(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.exp(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.exp(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.exp(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static nrm(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        var x:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var y:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var z:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];

        var len:number = Math.sqrt(x * x + y * y + z * z);
        x /= len;
        y /= len;
        z /= len;

        if (dest.mask & 1) {
            target.x = x;
        }

        if (dest.mask & 2) {
            target.y = y;
        }

        if (dest.mask & 4) {
            target.z = z;
        }
    }

    public static sin(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.sin(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.sin(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.sin(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.sin(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static cos(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.cos(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.cos(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.cos(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.cos(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static crs(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetY * source2TargetZ - source1TargetZ * source2TargetY;
        }

        if (dest.mask & 2) {
            target.y = source1TargetZ * source2TargetX - source1TargetX * source2TargetZ;
        }

        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetY - source1TargetY * source2TargetX;
        }
    }

    public static dp3(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }

        if (dest.mask & 2) {
            target.y = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }

        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }

        if (dest.mask & 8) {
            target.w = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }
    }

    public static dp4(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW:number = source2Target[swiz[(source2.swizzle >> 6) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }

        if (dest.mask & 2) {
            target.y = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }

        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }

        if (dest.mask & 8) {
            target.w = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }
    }

    public static abs(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.abs(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }

        if (dest.mask & 2) {
            target.y = Math.abs(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }

        if (dest.mask & 4) {
            target.z = Math.abs(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }

        if (dest.mask & 8) {
            target.w = Math.abs(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    }

    public static neg(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = -source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y = -source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z = -source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w = -source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    }

    public static sat(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 0) & 3]]));
        }

        if (dest.mask & 2) {
            target.y = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 2) & 3]]));
        }

        if (dest.mask & 4) {
            target.z = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 4) & 3]]));
        }

        if (dest.mask & 8) {
            target.w = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 6) & 3]]));
        }
    }

    public static m33(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var source2Type:Vector3D[] = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);

        var source2Target0:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);

        var matrix:Matrix3D = new Matrix3D(new Float32Array([
            source2Target0.x, source2Target1.x, source2Target2.x, 0,
            source2Target0.y, source2Target1.y, source2Target2.y, 0,
            source2Target0.z, source2Target1.z, source2Target2.z, 0,
            0, 0, 0, 0
        ]));

        var result:Vector3D = matrix.transformVector(source1Target);

        if (dest.mask & 1) {
            target.x = result.x;
        }

        if (dest.mask & 2) {
            target.y = result.y;
        }

        if (dest.mask & 4) {
            target.z = result.z;
        }
    }

    public static m34(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);

        var source2Type:Vector3D[] = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);

        var source2Target0:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2:Vector3D = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);

        var matrix:Matrix3D = new Matrix3D(new Float32Array([
            source2Target0.x, source2Target1.x, source2Target2.x, 0,
            source2Target0.y, source2Target1.y, source2Target2.y, 0,
            source2Target0.z, source2Target1.z, source2Target2.z, 0,
            source2Target0.w, source2Target1.w, source2Target2.w, 1
        ]));

        var result:Vector3D = matrix.transformVector(source1Target);

        if (dest.mask & 1) {
            target.x = result.x;
        }

        if (dest.mask & 2) {
            target.y = result.y;
        }

        if (dest.mask & 4) {
            target.z = result.z;
        }

        if (dest.mask & 8) {
            target.w = result.w;
        }
    }

    public static ddx(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = vo.derivativeX[source1.regnum];

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y =source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z =source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w =source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    }

    public static ddy(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var source1Target:Vector3D = vo.derivativeY[source1.regnum];

        var swiz:string[] = ["x", "y", "z", "w"];

        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }

        if (dest.mask & 2) {
            target.y =source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }

        if (dest.mask & 4) {
            target.z =source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }

        if (dest.mask & 8) {
            target.w =source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    }

    public static sge(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW:number = source2Target[swiz[(source2.swizzle >> 6) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX >= source2TargetX ? 1 : 0;
        }

        if (dest.mask & 2) {
            target.y = source1TargetY >= source2TargetY ? 1 : 0;
        }

        if (dest.mask & 4) {
            target.z = source1TargetZ >= source2TargetZ ? 1 : 0;
        }

        if (dest.mask & 8) {
            target.w = source1TargetW >= source2TargetW ? 1 : 0;
        }
    }

    public static slt(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW:number = source2Target[swiz[(source2.swizzle >> 6) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX < source2TargetX ? 1 : 0;
        }

        if (dest.mask & 2) {
            target.y = source1TargetY < source2TargetY ? 1 : 0;
        }

        if (dest.mask & 4) {
            target.z = source1TargetZ < source2TargetZ ? 1 : 0;
        }

        if (dest.mask & 8) {
            target.w = source1TargetW < source2TargetW ? 1 : 0;
        }
    }

    public static seq(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW:number = source2Target[swiz[(source2.swizzle >> 6) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX == source2TargetX ? 1 : 0;
        }

        if (dest.mask & 2) {
            target.y = source1TargetY == source2TargetY ? 1 : 0;
        }

        if (dest.mask & 4) {
            target.z = source1TargetZ == source2TargetZ ? 1 : 0;
        }

        if (dest.mask & 8) {
            target.w = source1TargetW == source2TargetW ? 1 : 0;
        }
    }

    public static sne(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        var source2Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX:number = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY:number = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ:number = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW:number = source2Target[swiz[(source2.swizzle >> 6) & 3]];

        if (dest.mask & 1) {
            target.x = source1TargetX != source2TargetX ? 1 : 0;
        }

        if (dest.mask & 2) {
            target.y = source1TargetY != source2TargetY ? 1 : 0;
        }

        if (dest.mask & 4) {
            target.z = source1TargetZ != source2TargetZ ? 1 : 0;
        }

        if (dest.mask & 8) {
            target.w = source1TargetW != source2TargetW ? 1 : 0;
        }
    }

    public static sgn(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var target:Vector3D = ProgramSoftware.getDestTarget(vo, desc, dest);

        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY:number = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ:number = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW:number = source1Target[swiz[(source1.swizzle >> 6) & 3]];

        if (dest.mask & 1) {

            target.x = 1
            if (source1TargetX < 0) {
                target.x = -1;
            } else if (source1TargetX == 0) {
                target.x = 0;
            }
        }

        if (dest.mask & 2) {
            target.y = 1
            if (source1TargetY < 0) {
                target.y = -1;
            } else if (source1TargetY == 0) {
                target.y = 0;
            }
        }

        if (dest.mask & 4) {
            target.z = 1
            if (source1TargetZ < 0) {
                target.z = -1;
            } else if (source1TargetZ == 0) {
                target.z = 0;
            }
        }

        if (dest.mask & 8) {
            target.w = 1
            if (source1TargetW < 0) {
                target.w = -1;
            } else if (source1TargetW == 0) {
                target.w = 0;
            }
        }
    }

    public static kil(vo:ProgramVOSoftware, desc:Description, dest:Destination, source1:Destination, source2:Destination, context:ContextSoftware):void {
        var swiz:string[] = ["x", "y", "z", "w"];

        var source1Target:Vector3D = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX:number = source1Target[swiz[(source1.swizzle >> 0) & 3]];

        if(source1TargetX<0) {
            vo.discard = true;
        }
    }
}

export = ProgramSoftware;
