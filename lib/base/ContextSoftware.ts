import BitmapImage2D                = require("awayjs-core/lib/data/BitmapImage2D");
import Matrix3D                        = require("awayjs-core/lib/geom/Matrix3D");
import Point                        = require("awayjs-core/lib/geom/Point");
import Vector3D                        = require("awayjs-core/lib/geom/Vector3D");
import Rectangle                    = require("awayjs-core/lib/geom/Rectangle");
import ByteArray                    = require("awayjs-core/lib/utils/ByteArray");
import ColorUtils                    = require("awayjs-core/lib/utils/ColorUtils");

import ContextGLBlendFactor            = require("awayjs-stagegl/lib/base/ContextGLBlendFactor");
import ContextGLDrawMode            = require("awayjs-stagegl/lib/base/ContextGLDrawMode");
import ContextGLClearMask            = require("awayjs-stagegl/lib/base/ContextGLClearMask");
import ContextGLCompareMode            = require("awayjs-stagegl/lib/base/ContextGLCompareMode");
import ContextGLMipFilter            = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
import ContextGLProgramType            = require("awayjs-stagegl/lib/base/ContextGLProgramType");
import ContextGLStencilAction        = require("awayjs-stagegl/lib/base/ContextGLStencilAction");
import ContextGLTextureFilter        = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
import ContextGLTriangleFace        = require("awayjs-stagegl/lib/base/ContextGLTriangleFace");
import ContextGLVertexBufferFormat    = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
import ContextGLWrapMode            = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
import CubeTextureWebGL                = require("awayjs-stagegl/lib/base/CubeTextureWebGL");
import IContextGL                    = require("awayjs-stagegl/lib/base/IContextGL");
import IIndexBuffer                    = require("awayjs-stagegl/lib/base/IIndexBuffer");
import ICubeTexture                    = require("awayjs-stagegl/lib/base/ICubeTexture");
import ITexture                        = require("awayjs-stagegl/lib/base/ITexture");
import IVertexBuffer                = require("awayjs-stagegl/lib/base/IVertexBuffer");
import IProgram                        = require("awayjs-stagegl/lib/base/IProgram");
import ITextureBase                    = require("awayjs-stagegl/lib/base/ITextureBase");
import IndexBufferSoftware                    = require("awayjs-stagegl/lib/base/IndexBufferSoftware");
import VertexBufferSoftware                    = require("awayjs-stagegl/lib/base/VertexBufferSoftware");
import TextureSoftware                    = require("awayjs-stagegl/lib/base/TextureSoftware");
import ProgramSoftware                    = require("awayjs-stagegl/lib/base/ProgramSoftware");

class ContextSoftware implements IContextGL {

    private _canvas:HTMLCanvasElement;

    public static MAX_SAMPLERS:number = 8;

    private _backBufferRect:Rectangle = new Rectangle();
    private _backBufferWidth:number = 100;
    private _backBufferHeight:number = 100;
    private _backBufferColor:BitmapImage2D;
    private _zbuffer:number[] = [];
    private _context:CanvasRenderingContext2D;
    private _cullingMode:string = ContextGLTriangleFace.BACK;
    private _blendSource:string = ContextGLBlendFactor.ONE;
    private _blendDestination:string = ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
    private _colorMaskR:boolean = true;
    private _colorMaskG:boolean = true;
    private _colorMaskB:boolean = true;
    private _colorMaskA:boolean = true;
    private _writeDepth:boolean = true;
    private _depthCompareMode:string = ContextGLCompareMode.LESS;

    private _textures:Array<TextureSoftware> = [];
    private _vertexBuffers:Array<VertexBufferSoftware> = [];
    private _vertexBufferOffsets:Array<number> = [];
    private _vertexBufferFormats:Array<string> = [];

    private _positionBufferIndex:number;
    private _uvBufferIndex:number;

    private _projectionMatrix:Matrix3D;

    private _drawRect:Rectangle = new Rectangle();

    constructor(canvas:HTMLCanvasElement) {
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d");
        this._backBufferColor = new BitmapImage2D(this._backBufferWidth, this._backBufferHeight, false, 0, false);

        document.body.appendChild(this._backBufferColor.getCanvas());
    }

    public get container():HTMLElement {
        return this._canvas;
    }

    public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL) {
        if (mask & ContextGLClearMask.COLOR) {
            this._backBufferColor.fillRect(this._backBufferRect, ColorUtils.ARGBtoFloat32(alpha, red, green, blue));
        }

        //TODO: mask & ContextGLClearMask.STENCIL

        if (mask & ContextGLClearMask.DEPTH) {
            this._zbuffer.length = 0;
            var len:number = this._backBufferWidth * this._backBufferHeight;
            for (var i:number = 0; i < len; i++) {
                this._zbuffer[i] = 10000000;
            }
        }
    }

    public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean) {
        console.log("configureBackBuffer");
        this._backBufferWidth = width;
        this._backBufferHeight = height;

        this._backBufferRect.width = width;
        this._backBufferRect.height = height;

        this._backBufferColor._setSize(width, height);
    }

    public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):ICubeTexture {
        //TODO: impl
        return undefined;
    }

    public createIndexBuffer(numIndices:number):IIndexBuffer {
        return new IndexBufferSoftware(numIndices);
    }

    public createProgram():ProgramSoftware {
        return new ProgramSoftware();
    }

    public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):TextureSoftware {
        console.log("createTexture");
        return new TextureSoftware(width, height);
    }

    public createVertexBuffer(numVertices:number, dataPerVertex:number):VertexBufferSoftware {
        console.log("createVertexBuffer");
        return new VertexBufferSoftware(numVertices, dataPerVertex);
    }

    public dispose() {
    }

    public setBlendFactors(sourceFactor:string, destinationFactor:string) {
        this._blendSource = sourceFactor;
        this._blendDestination = destinationFactor;
    }

    public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean) {
        this._colorMaskR = red;
        this._colorMaskG = green;
        this._colorMaskB = blue;
        this._colorMaskA = alpha;
    }

    public setStencilActions(triangleFace:string, compareMode:string, actionOnBothPass:string, actionOnDepthFail:string, actionOnDepthPassStencilFail:string, coordinateSystem:string) {
        //TODO:
    }

    public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number) {
        //TODO:
    }

    public setCulling(triangleFaceToCull:string, coordinateSystem:string) {
        //TODO: CoordinateSystem.RIGHT_HAND
        this._cullingMode = triangleFaceToCull;
    }

    public setDepthTest(depthMask:boolean, passCompareMode:string) {
        console.log("setDepthTest: " + depthMask + " compare: " + passCompareMode);
        this._writeDepth = depthMask;
        this._depthCompareMode = passCompareMode;
    }

    public setProgram(program:IProgram) {
        console.log("setProgram: " + program);
    }

    public setProgramConstantsFromMatrix(programType:string, firstRegister:number, matrix:Matrix3D, transposedMatrix:boolean) {
        console.log("setProgramConstantsFromMatrix: programType" + programType + " firstRegister: " + firstRegister + " matrix: " + matrix + " transposedMatrix: " + transposedMatrix);
    }

    public setProgramConstantsFromArray(programType:string, firstRegister:number, data:number[], numRegisters:number) {
        console.log("setProgramConstantsFromArray: programType" + programType + " firstRegister: " + firstRegister + " data: " + data + " numRegisters: " + numRegisters);
        if (firstRegister == 0 && numRegisters == 4) {
            this._projectionMatrix = new Matrix3D(data);
            this._projectionMatrix.transpose();
        }
    }

    public setTextureAt(sampler:number, texture:TextureSoftware) {
        console.log("setTextureAt sample: " + sampler + " texture: " + texture);
        this._textures[sampler] = texture;
    }

    public setVertexBufferAt(index:number, buffer:VertexBufferSoftware, bufferOffset:number, format:string) {
        console.log("setVertexBufferAt index: " + index + " buffer: " + buffer + " bufferOffset: " + bufferOffset + " format: " + format);
        this._vertexBuffers[index] = buffer;
        this._vertexBufferOffsets[index] = bufferOffset;
        this._vertexBufferFormats[index] = format;

        if (format == ContextGLVertexBufferFormat.FLOAT_3) {
            this._positionBufferIndex = index;
        }

        if (format == ContextGLVertexBufferFormat.FLOAT_2) {
            this._uvBufferIndex = index;
        }
    }

    public present() {
        console.log("present");
        //this._backBufferColor.fillRect(new Rectangle(0, 0, Math.random() * 300, Math.random() * 500), Math.random() * 100000000);
    }

    public drawToBitmapImage2D(destination:BitmapImage2D) {
    }

    public drawIndices(mode:string, indexBuffer:IndexBufferSoftware, firstIndex:number, numIndices:number) {
        console.log("drawIndices mode: " + mode + " firstIndex: " + firstIndex + " numIndices: " + numIndices);
        if (this._projectionMatrix == null) {
            return;
        }

        var positionBuffer:VertexBufferSoftware = this._vertexBuffers[this._positionBufferIndex];
        var uvBuffer:VertexBufferSoftware = this._vertexBuffers[this._uvBufferIndex];
        if (uvBuffer == null || positionBuffer == null) {
            return;
        }

        this._backBufferColor.lock();

        for (var i:number = firstIndex; i < numIndices; i += 3) {

            var index0:number = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i] * positionBuffer.attributesPerVertex;
            var index1:number = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 1] * positionBuffer.attributesPerVertex;
            var index2:number = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 2] * positionBuffer.attributesPerVertex;

            var t0:Vector3D = new Vector3D(positionBuffer.data[index0], positionBuffer.data[index0 + 1], positionBuffer.data[index0 + 2]);
            var t1:Vector3D = new Vector3D(positionBuffer.data[index1], positionBuffer.data[index1 + 1], positionBuffer.data[index1 + 2]);
            var t2:Vector3D = new Vector3D(positionBuffer.data[index2], positionBuffer.data[index2 + 1], positionBuffer.data[index2 + 2]);

            t0 = this._projectionMatrix.transformVector(t0);
            t1 = this._projectionMatrix.transformVector(t1);
            t2 = this._projectionMatrix.transformVector(t2);

            t0.x = t0.x / t0.w;
            t0.y = t0.y / t0.w;

            t1.x = t1.x / t1.w;
            t1.y = t1.y / t1.w;

            t2.x = t2.x / t2.w;
            t2.y = t2.y / t2.w;

            t0.x = t0.x * this._backBufferWidth + this._backBufferWidth / 2;
            t1.x = t1.x * this._backBufferWidth + this._backBufferWidth / 2;
            t2.x = t2.x * this._backBufferWidth + this._backBufferWidth / 2;

            t0.y = -t0.y * this._backBufferHeight + this._backBufferHeight / 2;
            t1.y = -t1.y * this._backBufferHeight + this._backBufferHeight / 2;
            t2.y = -t2.y * this._backBufferHeight + this._backBufferHeight / 2;

            var u0:Point;
            var u1:Point;
            var u2:Point;

            if (uvBuffer) {
                index0 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i] * uvBuffer.attributesPerVertex;
                index1 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 1] * uvBuffer.attributesPerVertex;
                index2 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 2] * uvBuffer.attributesPerVertex;

                u0 = new Point(uvBuffer.data[index0], uvBuffer.data[index0 + 1]);
                u1 = new Point(uvBuffer.data[index1], uvBuffer.data[index1 + 1]);
                u2 = new Point(uvBuffer.data[index2], uvBuffer.data[index2 + 1]);
            }

            this.triangle(t0, t1, t2, u0, u1, u2);
        }

        this._backBufferColor.unlock();
    }

    public drawVertices(mode:string, firstVertex:number, numVertices:number) {
        console.log("drawVertices");
    }

    public setScissorRectangle(rectangle:Rectangle) {
        //TODO:
    }

    public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string) {
        //TODO:
    }

    public setRenderToTexture(target:ITextureBase, enableDepthAndStencil:boolean, antiAlias:number, surfaceSelector:number) {
        //TODO:
    }

    public setRenderToBackBuffer() {
        //TODO:
    }

    private sampleDiffuse(uv:Point):number {
        if (this._textures[0] != null) {
            var texture:TextureSoftware = this._textures[0];

            var u:number = Math.abs(((uv.x * texture.width) % texture.width)) >> 0;
            var v:number = Math.abs(((uv.y * texture.height) % texture.height)) >> 0;

            var pos:number = (u + v * texture.width) * 4;

            var r:number = texture.data[pos];
            var g:number = texture.data[pos + 1];
            var b:number = texture.data[pos + 2];
            var a:number = texture.data[pos + 3];

            return ColorUtils.ARGBtoFloat32(a,r,g,b)
        }
        return ColorUtils.ARGBtoFloat32(255, uv.x * 255, uv.y * 255, 0);
    }

    public putPixel(x:number, y:number, z:number, color:number):void {
        var index:number = ((x >> 0) + (y >> 0) * this._backBufferWidth);

        if (this._zbuffer[index] < z) {
            return;
        }

        this._zbuffer[index] = z;

        this._drawRect.x = x;
        this._drawRect.y = y;
        this._drawRect.width = 1;
        this._drawRect.height = 1;
        //this._backBufferColor.fillRect(this._drawRect, color);
        this._backBufferColor.setPixel32(x, y, color);
    }

    public drawPoint(point:Vector3D, color:number):void {
        if (point.x >= 0 && point.y >= 0 && point.x < this._backBufferWidth && point.y < this._backBufferWidth) {
            this.putPixel(point.x, point.y, point.z, color);
        }
    }

    public clamp(value:number, min:number = 0, max:number = 1):number {
        return Math.max(min, Math.min(value, max));
    }

    public interpolate(min:number, max:number, gradient:number) {
        return min + (max - min) * this.clamp(gradient);
    }

    public processScanLine(currentY:number, pa:Vector3D, pb:Vector3D, pc:Vector3D, pd:Vector3D, uva:Point, uvb:Point, uvc:Point, uvd:Point):void {
        var gradient1:number = pa.y != pb.y ? (currentY - pa.y) / (pb.y - pa.y) : 1;
        var gradient2:number = pc.y != pd.y ? (currentY - pc.y) / (pd.y - pc.y) : 1;

        var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
        var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;

        var z1:number = this.interpolate(pa.z, pb.z, gradient1);
        var z2:number = this.interpolate(pc.z, pd.z, gradient2);

        //var snl:number = this.interpolate(data.ndotla, data.ndotlb, gradient1);
        //var enl:number = this.interpolate(data.ndotlc, data.ndotld, gradient2);

        var su = this.interpolate(uva.x, uvb.x, gradient1);
        var eu = this.interpolate(uvc.x, uvd.x, gradient2);
        var sv = this.interpolate(uva.y, uvb.y, gradient1);
        var ev = this.interpolate(uvc.y, uvd.y, gradient2);

        for (var x = sx; x < ex; x++) {
            var gradient:number = (x - sx) / (ex - sx);

            var z = this.interpolate(z1, z2, gradient);
            //var ndotl = this.interpolate(snl, enl, gradient);
            var u = this.interpolate(su, eu, gradient);
            var v = this.interpolate(sv, ev, gradient);

            var color:number = this.sampleDiffuse(new Point(u, v));

            this.drawPoint(new Vector3D(x, currentY, z), color);
        }
    }

    public triangle(p1:Vector3D, p2:Vector3D, p3:Vector3D, uv1:Point, uv2:Point, uv3:Point):void {
        var temp:any;
        if (p1.y > p2.y) {
            temp = p2;
            p2 = p1;
            p1 = temp;

            temp = uv2;
            uv2 = uv1;
            uv1 = temp;
        }

        if (p2.y > p3.y) {
            temp = p2;
            p2 = p3;
            p3 = temp;

            temp = uv2;
            uv2 = uv3;
            uv3 = temp;
        }

        if (p1.y > p2.y) {
            temp = p2;
            p2 = p1;
            p1 = temp;

            temp = uv2;
            uv2 = uv1;
            uv1 = temp;
        }

        var dP1P2:number;
        var dP1P3:number;

        // http://en.wikipedia.org/wiki/Slope
        if (p2.y - p1.y > 0)
            dP1P2 = (p2.x - p1.x) / (p2.y - p1.y);
        else
            dP1P2 = 0;

        if (p3.y - p1.y > 0)
            dP1P3 = (p3.x - p1.x) / (p3.y - p1.y);
        else
            dP1P3 = 0;

        if (dP1P2 > dP1P3) {
            for (var y:number = p1.y >> 0; y <= p3.y >> 0; y++) {
                if (y < p2.y) {
                    this.processScanLine(y, p1, p3, p1, p2, uv1, uv3, uv1, uv2);
                } else {
                    this.processScanLine(y, p1, p3, p2, p3, uv1, uv3, uv2, uv3);
                }
            }
        }
        else {
            for (var y:number = p1.y >> 0; y <= p3.y >> 0; y++) {
                if (y < p2.y) {
                    this.processScanLine(y, p1, p2, p1, p3, uv1, uv2, uv1, uv3);
                } else {
                    this.processScanLine(y, p2, p3, p1, p3, uv2, uv3, uv1, uv3);
                }
            }
        }
    }

}

export = ContextSoftware;


class VertexBufferProperties {
    public size:number;

    public type:number;

    public normalized:boolean;

    constructor(size:number, type:number, normalized:boolean) {
        this.size = size;
        this.type = type;
        this.normalized = normalized;
    }
}