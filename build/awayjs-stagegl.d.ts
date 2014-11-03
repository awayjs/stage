declare module "awayjs-stagegl/lib/aglsl/Header" {
	class Header {
	    progid: number;
	    version: number;
	    type: string;
	    constructor();
	}
	export = Header;
	
}
declare module "awayjs-stagegl/lib/aglsl/Destination" {
	class Destination {
	    mask: number;
	    regnum: number;
	    regtype: number;
	    dim: number;
	    constructor();
	}
	export = Destination;
	
}
declare module "awayjs-stagegl/lib/aglsl/Token" {
	import Destination = require("awayjs-stagegl/lib/aglsl/Destination");
	class Token {
	    dest: Destination;
	    opcode: number;
	    a: Destination;
	    b: Destination;
	    constructor();
	}
	export = Token;
	
}
declare module "awayjs-stagegl/lib/aglsl/Description" {
	import Header = require("awayjs-stagegl/lib/aglsl/Header");
	import Token = require("awayjs-stagegl/lib/aglsl/Token");
	class Description {
	    regread: any[];
	    regwrite: any[];
	    hasindirect: boolean;
	    writedepth: boolean;
	    hasmatrix: boolean;
	    samplers: any[];
	    tokens: Token[];
	    header: Header;
	    constructor();
	}
	export = Description;
	
}
declare module "awayjs-stagegl/lib/aglsl/OpLUT" {
	class OpLUT {
	    s: string;
	    flags: number;
	    dest: boolean;
	    a: boolean;
	    b: boolean;
	    matrixwidth: number;
	    matrixheight: number;
	    ndwm: boolean;
	    scalar: boolean;
	    dm: boolean;
	    lod: boolean;
	    constructor(s: string, flags: number, dest: boolean, a: boolean, b: boolean, matrixwidth: number, matrixheight: number, ndwm: boolean, scaler: boolean, dm: boolean, lod: boolean);
	}
	export = OpLUT;
	
}
declare module "awayjs-stagegl/lib/aglsl/Mapping" {
	import OpLUT = require("awayjs-stagegl/lib/aglsl/OpLUT");
	class Mapping {
	    static agal2glsllut: OpLUT[];
	    constructor(include?: OpLUT);
	}
	export = Mapping;
	
}
declare module "awayjs-stagegl/lib/aglsl/AGALTokenizer" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import Description = require("awayjs-stagegl/lib/aglsl/Description");
	class AGALTokenizer {
	    constructor();
	    decribeAGALByteArray(bytes: ByteArray): Description;
	    readReg(s: any, mh: any, desc: any, bytes: any): void;
	}
	export = AGALTokenizer;
	
}
declare module "awayjs-stagegl/lib/aglsl/Sampler" {
	class Sampler {
	    lodbias: number;
	    dim: number;
	    readmode: number;
	    special: number;
	    wrap: number;
	    mipmap: number;
	    filter: number;
	    constructor();
	}
	export = Sampler;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLClearMask" {
	class ContextGLClearMask {
	    static COLOR: number;
	    static DEPTH: number;
	    static STENCIL: number;
	    static ALL: number;
	}
	export = ContextGLClearMask;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLProgramType" {
	class ContextGLProgramType {
	    static FRAGMENT: string;
	    static VERTEX: string;
	}
	export = ContextGLProgramType;
	
}
declare module "awayjs-stagegl/lib/base/ITextureBase" {
	interface ITextureBase {
	    dispose(): any;
	}
	export = ITextureBase;
	
}
declare module "awayjs-stagegl/lib/base/ICubeTexture" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	interface ICubeTexture extends ITextureBase {
	    size: number;
	    uploadFromData(bitmapData: BitmapData, side: number, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, side: number, miplevel?: number): any;
	    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async: boolean): any;
	}
	export = ICubeTexture;
	
}
declare module "awayjs-stagegl/lib/base/OpCodes" {
	class OpCodes {
	    static trueValue: number;
	    static falseValue: number;
	    static intMask: number;
	    static drawTriangles: number;
	    static setProgramConstant: number;
	    static setProgram: number;
	    static present: number;
	    static clear: number;
	    static initProgram: number;
	    static initVertexBuffer: number;
	    static initIndexBuffer: number;
	    static configureBackBuffer: number;
	    static uploadArrayIndexBuffer: number;
	    static uploadArrayVertexBuffer: number;
	    static uploadAGALBytesProgram: number;
	    static setVertexBufferAt: number;
	    static uploadBytesIndexBuffer: number;
	    static uploadBytesVertexBuffer: number;
	    static setColorMask: number;
	    static setDepthTest: number;
	    static disposeProgram: number;
	    static disposeContext: number;
	    static disposeVertexBuffer: number;
	    static disposeIndexBuffer: number;
	    static initTexture: number;
	    static setTextureAt: number;
	    static uploadBytesTexture: number;
	    static disposeTexture: number;
	    static setCulling: number;
	    static setScissorRect: number;
	    static clearScissorRect: number;
	    static setBlendFactors: number;
	    static setRenderToTexture: number;
	    static clearTextureAt: number;
	    static clearVertexBufferAt: number;
	    static setStencilActions: number;
	    static setStencilReferenceValue: number;
	    static initCubeTexture: number;
	    static disposeCubeTexture: number;
	    static uploadBytesCubeTexture: number;
	    static clearRenderToTexture: number;
	    static enableErrorChecking: number;
	}
	export = OpCodes;
	
}
declare module "awayjs-stagegl/lib/base/ResourceBaseFlash" {
	class ResourceBaseFlash {
	    _pId: number;
	    id: number;
	    dispose(): void;
	}
	export = ResourceBaseFlash;
	
}
declare module "awayjs-stagegl/lib/base/CubeTextureFlash" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
	import ICubeTexture = require("awayjs-stagegl/lib/base/ICubeTexture");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	class CubeTextureFlash extends ResourceBaseFlash implements ICubeTexture {
	    private _context;
	    private _size;
	    size: number;
	    constructor(context: ContextStage3D, size: number, format: string, forRTT: boolean, streaming?: boolean);
	    dispose(): void;
	    uploadFromData(bitmapData: BitmapData, side: number, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, side: number, miplevel?: number): any;
	    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
	}
	export = CubeTextureFlash;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLTextureFormat" {
	class ContextGLTextureFormat {
	    static BGRA: string;
	    static BGRA_PACKED: string;
	    static BGR_PACKED: string;
	    static COMPRESSED: string;
	    static COMPRESSED_ALPHA: string;
	}
	export = ContextGLTextureFormat;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLBlendFactor" {
	class ContextGLBlendFactor {
	    static DESTINATION_ALPHA: string;
	    static DESTINATION_COLOR: string;
	    static ONE: string;
	    static ONE_MINUS_DESTINATION_ALPHA: string;
	    static ONE_MINUS_DESTINATION_COLOR: string;
	    static ONE_MINUS_SOURCE_ALPHA: string;
	    static ONE_MINUS_SOURCE_COLOR: string;
	    static SOURCE_ALPHA: string;
	    static SOURCE_COLOR: string;
	    static ZERO: string;
	}
	export = ContextGLBlendFactor;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLCompareMode" {
	class ContextGLCompareMode {
	    static ALWAYS: string;
	    static EQUAL: string;
	    static GREATER: string;
	    static GREATER_EQUAL: string;
	    static LESS: string;
	    static LESS_EQUAL: string;
	    static NEVER: string;
	    static NOT_EQUAL: string;
	}
	export = ContextGLCompareMode;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLMipFilter" {
	class ContextGLMipFilter {
	    static MIPLINEAR: string;
	    static MIPNEAREST: string;
	    static MIPNONE: string;
	}
	export = ContextGLMipFilter;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLTextureFilter" {
	class ContextGLTextureFilter {
	    static LINEAR: string;
	    static NEAREST: string;
	}
	export = ContextGLTextureFilter;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLTriangleFace" {
	class ContextGLTriangleFace {
	    static BACK: string;
	    static FRONT: string;
	    static FRONT_AND_BACK: string;
	    static NONE: string;
	}
	export = ContextGLTriangleFace;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLVertexBufferFormat" {
	class ContextGLVertexBufferFormat {
	    static BYTES_4: string;
	    static FLOAT_1: string;
	    static FLOAT_2: string;
	    static FLOAT_3: string;
	    static FLOAT_4: string;
	}
	export = ContextGLVertexBufferFormat;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLWrapMode" {
	class ContextGLWrapMode {
	    static CLAMP: string;
	    static REPEAT: string;
	}
	export = ContextGLWrapMode;
	
}
declare module "awayjs-stagegl/lib/base/TextureBaseWebGL" {
	class TextureBaseWebGL {
	    textureType: string;
	    _gl: WebGLRenderingContext;
	    constructor(gl: WebGLRenderingContext);
	    dispose(): void;
	    glTexture: WebGLTexture;
	}
	export = TextureBaseWebGL;
	
}
declare module "awayjs-stagegl/lib/base/CubeTextureWebGL" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import ICubeTexture = require("awayjs-stagegl/lib/base/ICubeTexture");
	import TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
	class CubeTextureWebGL extends TextureBaseWebGL implements ICubeTexture {
	    private _textureSelectorDictionary;
	    textureType: string;
	    private _texture;
	    private _size;
	    constructor(gl: WebGLRenderingContext, size: number);
	    dispose(): void;
	    uploadFromData(bitmapData: BitmapData, side: number, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, side: number, miplevel?: number): any;
	    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
	    size: number;
	    glTexture: WebGLTexture;
	}
	export = CubeTextureWebGL;
	
}
declare module "awayjs-stagegl/lib/base/IIndexBuffer" {
	interface IIndexBuffer {
	    numIndices: number;
	    uploadFromArray(data: number[], startOffset: number, count: number): any;
	    dispose(): any;
	}
	export = IIndexBuffer;
	
}
declare module "awayjs-stagegl/lib/base/IndexBufferWebGL" {
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	class IndexBufferWebGL implements IIndexBuffer {
	    private _gl;
	    private _numIndices;
	    private _buffer;
	    constructor(gl: WebGLRenderingContext, numIndices: number);
	    uploadFromArray(data: number[], startOffset: number, count: number): void;
	    dispose(): void;
	    numIndices: number;
	    glBuffer: WebGLBuffer;
	}
	export = IndexBufferWebGL;
	
}
declare module "awayjs-stagegl/lib/base/IProgram" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	interface IProgram {
	    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): any;
	    dispose(): any;
	}
	export = IProgram;
	
}
declare module "awayjs-stagegl/lib/base/ProgramWebGL" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	class ProgramWebGL implements IProgram {
	    private static _tokenizer;
	    private static _aglslParser;
	    private _gl;
	    private _program;
	    private _vertexShader;
	    private _fragmentShader;
	    constructor(gl: WebGLRenderingContext);
	    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): void;
	    dispose(): void;
	    focusProgram(): void;
	    glProgram: WebGLProgram;
	}
	export = ProgramWebGL;
	
}
declare module "awayjs-stagegl/lib/base/ITexture" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	interface ITexture extends ITextureBase {
	    width: number;
	    height: number;
	    uploadFromData(bitmapData: BitmapData, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
	}
	export = ITexture;
	
}
declare module "awayjs-stagegl/lib/base/TextureWebGL" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
	class TextureWebGL extends TextureBaseWebGL implements ITexture {
	    textureType: string;
	    private _width;
	    private _height;
	    private _frameBuffer;
	    private _glTexture;
	    constructor(gl: WebGLRenderingContext, width: number, height: number);
	    dispose(): void;
	    width: number;
	    height: number;
	    frameBuffer: WebGLFramebuffer;
	    uploadFromData(bitmapData: BitmapData, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
	    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
	    glTexture: WebGLTexture;
	    generateMipmaps(): void;
	}
	export = TextureWebGL;
	
}
declare module "awayjs-stagegl/lib/base/SamplerState" {
	class SamplerState {
	    type: number;
	    wrap: number;
	    filter: number;
	    mipfilter: number;
	}
	export = SamplerState;
	
}
declare module "awayjs-stagegl/lib/base/IVertexBuffer" {
	interface IVertexBuffer {
	    numVertices: number;
	    data32PerVertex: number;
	    uploadFromArray(data: number[], startVertex: number, numVertices: number): any;
	    dispose(): any;
	}
	export = IVertexBuffer;
	
}
declare module "awayjs-stagegl/lib/base/VertexBufferWebGL" {
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	class VertexBufferWebGL implements IVertexBuffer {
	    private _gl;
	    private _numVertices;
	    private _data32PerVertex;
	    private _buffer;
	    constructor(gl: WebGLRenderingContext, numVertices: number, data32PerVertex: number);
	    uploadFromArray(vertices: number[], startVertex: number, numVertices: number): void;
	    numVertices: number;
	    data32PerVertex: number;
	    glBuffer: WebGLBuffer;
	    dispose(): void;
	}
	export = VertexBufferWebGL;
	
}
declare module "awayjs-stagegl/lib/base/ContextWebGL" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import CubeTextureWebGL = require("awayjs-stagegl/lib/base/CubeTextureWebGL");
	import IContextGL = require("awayjs-stagegl/lib/base/IContextGL");
	import IndexBufferWebGL = require("awayjs-stagegl/lib/base/IndexBufferWebGL");
	import ProgramWebGL = require("awayjs-stagegl/lib/base/ProgramWebGL");
	import TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
	import TextureWebGL = require("awayjs-stagegl/lib/base/TextureWebGL");
	import VertexBufferWebGL = require("awayjs-stagegl/lib/base/VertexBufferWebGL");
	class ContextWebGL implements IContextGL {
	    private _blendFactorDictionary;
	    private _depthTestDictionary;
	    private _textureIndexDictionary;
	    private _textureTypeDictionary;
	    private _wrapDictionary;
	    private _filterDictionary;
	    private _mipmapFilterDictionary;
	    private _uniformLocationNameDictionary;
	    private _vertexBufferDimensionDictionary;
	    private _container;
	    private _width;
	    private _height;
	    private _drawing;
	    private _blendEnabled;
	    private _blendSourceFactor;
	    private _blendDestinationFactor;
	    private _indexBufferList;
	    private _vertexBufferList;
	    private _textureList;
	    private _programList;
	    private _samplerStates;
	    static MAX_SAMPLERS: number;
	    _gl: WebGLRenderingContext;
	    _currentProgram: ProgramWebGL;
	    private _activeTexture;
	    container: HTMLElement;
	    constructor(canvas: HTMLCanvasElement);
	    gl(): WebGLRenderingContext;
	    clear(red?: number, green?: number, blue?: number, alpha?: number, depth?: number, stencil?: number, mask?: number): void;
	    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean): void;
	    createCubeTexture(size: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): CubeTextureWebGL;
	    createIndexBuffer(numIndices: number): IndexBufferWebGL;
	    createProgram(): ProgramWebGL;
	    createTexture(width: number, height: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): TextureWebGL;
	    createVertexBuffer(numVertices: number, data32PerVertex: number): VertexBufferWebGL;
	    dispose(): void;
	    drawToBitmapData(destination: BitmapData): void;
	    drawTriangles(indexBuffer: IndexBufferWebGL, firstIndex?: number, numTriangles?: number): void;
	    present(): void;
	    setBlendFactors(sourceFactor: string, destinationFactor: string): void;
	    setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void;
	    setCulling(triangleFaceToCull: string, coordinateSystem?: string): void;
	    setDepthTest(depthMask: boolean, passCompareMode: string): void;
	    setProgram(program: ProgramWebGL): void;
	    setProgramConstantsFromMatrix(programType: string, firstRegister: number, matrix: Matrix3D, transposedMatrix?: boolean): void;
	    static modulo: number;
	    setProgramConstantsFromArray(programType: string, firstRegister: number, data: number[], numRegisters?: number): void;
	    setScissorRectangle(rectangle: Rectangle): void;
	    setTextureAt(sampler: number, texture: TextureBaseWebGL): void;
	    setSamplerStateAt(sampler: number, wrap: string, filter: string, mipfilter: string): void;
	    setVertexBufferAt(index: number, buffer: VertexBufferWebGL, bufferOffset?: number, format?: string): void;
	    setRenderToTexture(target: TextureBaseWebGL, enableDepthAndStencil?: boolean, antiAlias?: number, surfaceSelector?: number): void;
	    setRenderToBackBuffer(): void;
	    private updateBlendStatus();
	}
	export = ContextWebGL;
	
}
declare module "awayjs-stagegl/lib/pool/IndexData" {
	import IContextGL = require("awayjs-stagegl/lib/base/IContextGL");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	/**
	 *
	 */
	class IndexData {
	    private static LIMIT_VERTS;
	    private static LIMIT_INDICES;
	    private _dataDirty;
	    invalid: boolean[];
	    contexts: IContextGL[];
	    buffers: IIndexBuffer[];
	    data: number[];
	    indexMappings: number[];
	    originalIndices: number[];
	    offset: number;
	    level: number;
	    constructor(level: number);
	    updateData(offset: number, indices: number[], numVertices: number): void;
	    invalidateData(): void;
	    dispose(): void;
	    /**
	     * @private
	     */
	    private disposeBuffers();
	    /**
	     * @private
	     */
	    private invalidateBuffers();
	    /**
	     *
	     * @param data
	     * @private
	     */
	    private setData(data);
	}
	export = IndexData;
	
}
declare module "awayjs-stagegl/lib/pool/TextureDataPool" {
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import TextureData = require("awayjs-stagegl/lib/pool/TextureData");
	/**
	 * @class away.pool.TextureDataPool
	 */
	class TextureDataPool {
	    private _pool;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor();
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     * @returns ITexture
	     */
	    getItem(textureProxy: TextureProxyBase): TextureData;
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     */
	    disposeItem(textureProxy: TextureProxyBase): void;
	}
	export = TextureDataPool;
	
}
declare module "awayjs-stagegl/lib/pool/TextureData" {
	import ITextureData = require("awayjs-core/lib/pool/ITextureData");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import TextureDataPool = require("awayjs-stagegl/lib/pool/TextureDataPool");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	/**
	 *
	 * @class away.pool.TextureDataBase
	 */
	class TextureData implements ITextureData {
	    private _pool;
	    texture: ITextureBase;
	    textureProxy: TextureProxyBase;
	    invalid: boolean;
	    constructor(pool: TextureDataPool, textureProxy: TextureProxyBase);
	    /**
	     *
	     */
	    dispose(): void;
	    /**
	     *
	     */
	    invalidate(): void;
	}
	export = TextureData;
	
}
declare module "awayjs-stagegl/lib/pool/ProgramDataPool" {
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
	/**
	 * @class away.pool.ProgramDataPool
	 */
	class ProgramDataPool {
	    private _pool;
	    private _stage;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor(stage: Stage);
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     * @returns ITexture
	     */
	    getItem(key: string): ProgramData;
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     */
	    disposeItem(key: string): void;
	}
	export = ProgramDataPool;
	
}
declare module "awayjs-stagegl/lib/pool/ProgramData" {
	import ProgramDataPool = require("awayjs-stagegl/lib/pool/ProgramDataPool");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	/**
	 *
	 * @class away.pool.ProgramDataBase
	 */
	class ProgramData {
	    static PROGRAMDATA_ID_COUNT: number;
	    private _pool;
	    private _key;
	    stage: Stage;
	    usages: number;
	    program: IProgram;
	    id: number;
	    constructor(pool: ProgramDataPool, context: Stage, key: string);
	    /**
	     *
	     */
	    dispose(): void;
	}
	export = ProgramData;
	
}
declare module "awayjs-stagegl/lib/pool/VertexData" {
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import IContextGL = require("awayjs-stagegl/lib/base/IContextGL");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	/**
	 *
	 */
	class VertexData {
	    private _onVerticesUpdatedDelegate;
	    private _subGeometry;
	    private _dataType;
	    private _dataDirty;
	    invalid: boolean[];
	    buffers: IVertexBuffer[];
	    contexts: IContextGL[];
	    data: number[];
	    dataPerVertex: number;
	    constructor(subGeometry: SubGeometryBase, dataType: string);
	    updateData(originalIndices?: number[], indexMappings?: number[]): void;
	    dispose(): void;
	    /**
	     * @private
	     */
	    private disposeBuffers();
	    /**
	     * @private
	     */
	    private invalidateBuffers();
	    /**
	     *
	     * @param data
	     * @param dataPerVertex
	     * @private
	     */
	    private setData(data);
	    /**
	     * //TODO
	     *
	     * @param event
	     * @private
	     */
	    private _onVerticesUpdated(event);
	}
	export = VertexData;
	
}
declare module "awayjs-stagegl/lib/managers/StageManager" {
	import EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	/**
	 * The StageManager class provides a multiton object that handles management for Stage objects.
	 *
	 * @see away.base.Stage
	 */
	class StageManager extends EventDispatcher {
	    private static STAGE_MAX_QUANTITY;
	    private _stages;
	    private static _instance;
	    private static _numStages;
	    private _onContextCreatedDelegate;
	    /**
	     * Creates a new StageManager class.
	     * @param stage The Stage object that contains the Stage objects to be managed.
	     * @private
	     */
	    constructor();
	    /**
	     * Gets a StageManager instance for the given Stage object.
	     * @param stage The Stage object that contains the Stage objects to be managed.
	     * @return The StageManager instance for the given Stage object.
	     */
	    static getInstance(): StageManager;
	    /**
	     * Requests the Stage for the given index.
	     *
	     * @param index The index of the requested Stage.
	     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
	     * @param profile The compatibility profile, an enumeration of ContextProfile
	     * @return The Stage for the given index.
	     */
	    getStageAt(index: number, forceSoftware?: boolean, profile?: string, mode?: string): Stage;
	    /**
	     * Removes a Stage from the manager.
	     * @param stage
	     * @private
	     */
	    iRemoveStage(stage: Stage): void;
	    /**
	     * Get the next available stage. An error is thrown if there are no StageProxies available
	     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
	     * @param profile The compatibility profile, an enumeration of ContextProfile
	     * @return The allocated stage
	     */
	    getFreeStage(forceSoftware?: boolean, profile?: string, mode?: string): Stage;
	    /**
	     * Checks if a new stage can be created and managed by the class.
	     * @return true if there is one slot free for a new stage
	     */
	    hasFreeStage: boolean;
	    /**
	     * Returns the amount of stage objects that can be created and managed by the class
	     * @return the amount of free slots
	     */
	    numSlotsFree: number;
	    /**
	     * Returns the amount of Stage objects currently managed by the class.
	     * @return the amount of slots used
	     */
	    numSlotsUsed: number;
	    /**
	     * The maximum amount of Stage objects that can be managed by the class
	     */
	    numSlotsTotal: number;
	    private onContextCreated(event);
	}
	export = StageManager;
	
}
declare module "awayjs-stagegl/lib/base/Stage" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
	import CubeTextureBase = require("awayjs-core/lib/textures/CubeTextureBase");
	import RenderTexture = require("awayjs-core/lib/textures/RenderTexture");
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import IContextGL = require("awayjs-stagegl/lib/base/IContextGL");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	import ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
	import VertexData = require("awayjs-stagegl/lib/pool/VertexData");
	import StageManager = require("awayjs-stagegl/lib/managers/StageManager");
	/**
	 * Stage provides a proxy class to handle the creation and attachment of the Context
	 * (and in turn the back buffer) it uses. Stage should never be created directly,
	 * but requested through StageManager.
	 *
	 * @see away.managers.StageManager
	 *
	 */
	class Stage extends EventDispatcher {
	    private _programData;
	    private _texturePool;
	    private _programDataPool;
	    private _context;
	    private _container;
	    private _width;
	    private _height;
	    private _x;
	    private _y;
	    private _stageIndex;
	    private _usesSoftwareRendering;
	    private _profile;
	    private _stageManager;
	    private _antiAlias;
	    private _enableDepthAndStencil;
	    private _contextRequested;
	    private _renderTarget;
	    private _renderSurfaceSelector;
	    private _scissorRect;
	    private _color;
	    private _backBufferDirty;
	    private _viewPort;
	    private _enterFrame;
	    private _exitFrame;
	    private _viewportUpdated;
	    private _viewportDirty;
	    private _bufferClear;
	    private _initialised;
	    constructor(container: HTMLCanvasElement, stageIndex: number, stageManager: StageManager, forceSoftware?: boolean, profile?: string);
	    getProgramData(key: string): ProgramData;
	    setRenderTarget(target: TextureProxyBase, enableDepthAndStencil?: boolean, surfaceSelector?: number): void;
	    getRenderTexture(textureProxy: RenderTexture): ITextureBase;
	    /**
	     * Assigns an attribute stream
	     *
	     * @param index The attribute stream index for the vertex shader
	     * @param buffer
	     * @param offset
	     * @param stride
	     * @param format
	     */
	    activateBuffer(index: number, buffer: VertexData, offset: number, format: string): void;
	    disposeVertexData(buffer: VertexData): void;
	    activateRenderTexture(index: number, textureProxy: RenderTexture): void;
	    activateTexture(index: number, textureProxy: Texture2DBase): void;
	    activateCubeTexture(index: number, textureProxy: CubeTextureBase): void;
	    /**
	     * Retrieves the VertexBuffer object that contains triangle indices.
	     * @param context The ContextWeb for which we request the buffer
	     * @return The VertexBuffer object that contains triangle indices.
	     */
	    getIndexBuffer(buffer: IndexData): IIndexBuffer;
	    disposeIndexData(buffer: IndexData): void;
	    /**
	     * Requests a Context object to attach to the managed gl canvas.
	     */
	    requestContext(forceSoftware?: boolean, profile?: string, mode?: string): void;
	    /**
	     * The width of the gl canvas
	     */
	    width: number;
	    /**
	     * The height of the gl canvas
	     */
	    height: number;
	    /**
	     * The x position of the gl canvas
	     */
	    x: number;
	    /**
	     * The y position of the gl canvas
	     */
	    y: number;
	    visible: boolean;
	    container: HTMLElement;
	    /**
	     * The Context object associated with the given stage object.
	     */
	    context: IContextGL;
	    private notifyViewportUpdated();
	    private notifyEnterFrame();
	    private notifyExitFrame();
	    profile: string;
	    /**
	     * Disposes the Stage object, freeing the Context attached to the Stage.
	     */
	    dispose(): void;
	    /**
	     * Configures the back buffer associated with the Stage object.
	     * @param backBufferWidth The width of the backbuffer.
	     * @param backBufferHeight The height of the backbuffer.
	     * @param antiAlias The amount of anti-aliasing to use.
	     * @param enableDepthAndStencil Indicates whether the back buffer contains a depth and stencil buffer.
	     */
	    configureBackBuffer(backBufferWidth: number, backBufferHeight: number, antiAlias: number, enableDepthAndStencil: boolean): void;
	    enableDepthAndStencil: boolean;
	    renderTarget: TextureProxyBase;
	    renderSurfaceSelector: number;
	    clear(): void;
	    /**
	     * Registers an event listener object with an EventDispatcher object so that the listener receives notification of an event. Special case for enterframe and exitframe events - will switch StageProxy into automatic render mode.
	     * You can register event listeners on all nodes in the display list for a specific type of event, phase, and priority.
	     *
	     * @param type The type of event.
	     * @param listener The listener function that processes the event.
	     * @param useCapture Determines whether the listener works in the capture phase or the target and bubbling phases. If useCapture is set to true, the listener processes the event only during the capture phase and not in the target or bubbling phase. If useCapture is false, the listener processes the event only during the target or bubbling phase. To listen for the event in all three phases, call addEventListener twice, once with useCapture set to true, then again with useCapture set to false.
	     * @param priority The priority level of the event listener. The priority is designated by a signed 32-bit integer. The higher the number, the higher the priority. All listeners with priority n are processed before listeners of priority n-1. If two or more listeners share the same priority, they are processed in the order in which they were added. The default priority is 0.
	     * @param useWeakReference Determines whether the reference to the listener is strong or weak. A strong reference (the default) prevents your listener from being garbage-collected. A weak reference does not.
	     */
	    addEventListener(type: string, listener: Function): void;
	    /**
	     * Removes a listener from the EventDispatcher object. Special case for enterframe and exitframe events - will switch StageProxy out of automatic render mode.
	     * If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
	     *
	     * @param type The type of event.
	     * @param listener The listener object to remove.
	     * @param useCapture Specifies whether the listener was registered for the capture phase or the target and bubbling phases. If the listener was registered for both the capture phase and the target and bubbling phases, two calls to removeEventListener() are required to remove both, one call with useCapture() set to true, and another call with useCapture() set to false.
	     */
	    removeEventListener(type: string, listener: Function): void;
	    scissorRect: Rectangle;
	    /**
	     * The index of the Stage which is managed by this instance of StageProxy.
	     */
	    stageIndex: number;
	    /**
	     * Indicates whether the Stage managed by this proxy is running in software mode.
	     * Remember to wait for the CONTEXT_CREATED event before checking this property,
	     * as only then will it be guaranteed to be accurate.
	     */
	    usesSoftwareRendering: boolean;
	    /**
	     * The antiAliasing of the Stage.
	     */
	    antiAlias: number;
	    /**
	     * A viewPort rectangle equivalent of the Stage size and position.
	     */
	    viewPort: Rectangle;
	    /**
	     * The background color of the Stage.
	     */
	    color: number;
	    /**
	     * The freshly cleared state of the backbuffer before any rendering
	     */
	    bufferClear: boolean;
	    registerProgram(programData: ProgramData): void;
	    unRegisterProgram(programData: ProgramData): void;
	    /**
	     * Frees the Context associated with this StageProxy.
	     */
	    private freeContext();
	    /**
	     * The Enter_Frame handler for processing the proxy.ENTER_FRAME and proxy.EXIT_FRAME event handlers.
	     * Typically the proxy.ENTER_FRAME listener would render the layers for this Stage instance.
	     */
	    private onEnterFrame(event);
	    recoverFromDisposal(): boolean;
	    private _callback(context);
	}
	export = Stage;
	
}
declare module "awayjs-stagegl/lib/base/IContextGL" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import ICubeTexture = require("awayjs-stagegl/lib/base/ICubeTexture");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	interface IContextGL {
	    container: HTMLElement;
	    clear(red?: number, green?: number, blue?: number, alpha?: number, depth?: number, stencil?: number, mask?: number): any;
	    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean): any;
	    createCubeTexture(size: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ICubeTexture;
	    createIndexBuffer(numIndices: number): IIndexBuffer;
	    createProgram(): IProgram;
	    createTexture(width: number, height: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ITexture;
	    createVertexBuffer(numVertices: number, data32PerVertex: number): IVertexBuffer;
	    dispose(): any;
	    drawToBitmapData(destination: BitmapData): any;
	    drawTriangles(indexBuffer: IIndexBuffer, firstIndex?: number, numTriangles?: number): any;
	    present(): any;
	    setBlendFactors(sourceFactor: string, destinationFactor: string): any;
	    setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): any;
	    setCulling(triangleFaceToCull: string, coordinateSystem?: string): any;
	    setDepthTest(depthMask: boolean, passCompareMode: string): any;
	    setProgram(program: IProgram): any;
	    setProgramConstantsFromMatrix(programType: string, firstRegister: number, matrix: Matrix3D, transposedMatrix?: boolean): any;
	    setProgramConstantsFromArray(programType: string, firstRegister: number, data: number[], numRegisters?: number): any;
	    setSamplerStateAt(sampler: number, wrap: string, filter: string, mipfilter: string): any;
	    setScissorRectangle(rectangle: Rectangle): any;
	    setTextureAt(sampler: number, texture: ITextureBase): any;
	    setVertexBufferAt(index: number, buffer: IVertexBuffer, bufferOffset?: number, format?: string): any;
	    setRenderToTexture(target: ITextureBase, enableDepthAndStencil?: boolean, antiAlias?: number, surfaceSelector?: number): any;
	    setRenderToBackBuffer(): any;
	}
	export = IContextGL;
	
}
declare module "awayjs-stagegl/lib/base/IndexBufferFlash" {
	import ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer {
	    private _context;
	    private _numIndices;
	    constructor(context: ContextStage3D, numIndices: number);
	    uploadFromArray(data: number[], startOffset: number, count: number): void;
	    dispose(): void;
	    numIndices: number;
	}
	export = IndexBufferFlash;
	
}
declare module "awayjs-stagegl/lib/base/ProgramFlash" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	import ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	class ProgramFlash extends ResourceBaseFlash implements IProgram {
	    private _context;
	    constructor(context: ContextStage3D);
	    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): void;
	    dispose(): void;
	}
	export = ProgramFlash;
	
}
declare module "awayjs-stagegl/lib/base/TextureFlash" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	class TextureFlash extends ResourceBaseFlash implements ITexture {
	    private _context;
	    private _width;
	    private _height;
	    width: number;
	    height: number;
	    constructor(context: ContextStage3D, width: number, height: number, format: string, forRTT: boolean, streaming?: boolean);
	    dispose(): void;
	    uploadFromData(bitmapData: BitmapData, miplevel?: number): any;
	    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
	}
	export = TextureFlash;
	
}
declare module "awayjs-stagegl/lib/base/VertexBufferFlash" {
	import ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	class VertexBufferFlash extends ResourceBaseFlash implements IVertexBuffer {
	    private _context;
	    private _numVertices;
	    private _data32PerVertex;
	    constructor(context: ContextStage3D, numVertices: number, data32PerVertex: number);
	    uploadFromArray(data: number[], startVertex: number, numVertices: number): void;
	    numVertices: number;
	    data32PerVertex: number;
	    dispose(): void;
	}
	export = VertexBufferFlash;
	
}
declare module "awayjs-stagegl/lib/base/ContextStage3D" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import Sampler = require("awayjs-stagegl/lib/aglsl/Sampler");
	import CubeTextureFlash = require("awayjs-stagegl/lib/base/CubeTextureFlash");
	import IContextGL = require("awayjs-stagegl/lib/base/IContextGL");
	import IndexBufferFlash = require("awayjs-stagegl/lib/base/IndexBufferFlash");
	import ProgramFlash = require("awayjs-stagegl/lib/base/ProgramFlash");
	import TextureFlash = require("awayjs-stagegl/lib/base/TextureFlash");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	import VertexBufferFlash = require("awayjs-stagegl/lib/base/VertexBufferFlash");
	class ContextStage3D implements IContextGL {
	    static contexts: Object;
	    static maxvertexconstants: number;
	    static maxfragconstants: number;
	    static maxtemp: number;
	    static maxstreams: number;
	    static maxtextures: number;
	    static defaultsampler: Sampler;
	    _iDriverInfo: any;
	    private _container;
	    private _width;
	    private _height;
	    private _cmdStream;
	    private _errorCheckingEnabled;
	    private _resources;
	    private _oldCanvas;
	    private _oldParent;
	    static debug: boolean;
	    static logStream: boolean;
	    _iCallback: (context: IContextGL) => void;
	    container: HTMLElement;
	    driverInfo: any;
	    errorCheckingEnabled: boolean;
	    constructor(container: HTMLCanvasElement, callback: (context: IContextGL) => void, include?: Sampler);
	    _iAddResource(resource: ResourceBaseFlash): void;
	    _iRemoveResource(resource: ResourceBaseFlash): void;
	    createTexture(width: number, height: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): TextureFlash;
	    createCubeTexture(size: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): CubeTextureFlash;
	    setTextureAt(sampler: number, texture: ResourceBaseFlash): void;
	    setSamplerStateAt(sampler: number, wrap: string, filter: string, mipfilter: string): void;
	    setStencilActions(triangleFace?: string, compareMode?: string, actionOnBothPass?: string, actionOnDepthFail?: string, actionOnDepthPassStencilFail?: string): void;
	    setStencilReferenceValue(referenceValue: number, readMask?: number, writeMask?: number): void;
	    setCulling(triangleFaceToCull: string, coordinateSystem?: string): void;
	    drawTriangles(indexBuffer: IndexBufferFlash, firstIndex?: number, numTriangles?: number): void;
	    setProgramConstantsFromMatrix(programType: string, firstRegister: number, matrix: Matrix3D, transposedMatrix?: boolean): void;
	    setProgramConstantsFromArray(programType: string, firstRegister: number, data: number[], numRegisters?: number): void;
	    setProgram(program: ProgramFlash): void;
	    present(): void;
	    clear(red?: number, green?: number, blue?: number, alpha?: number, depth?: number, stencil?: number, mask?: number): void;
	    createProgram(): ProgramFlash;
	    createVertexBuffer(numVertices: number, data32PerVertex: number): VertexBufferFlash;
	    createIndexBuffer(numIndices: number): IndexBufferFlash;
	    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean): void;
	    drawToBitmapData(destination: BitmapData): void;
	    setVertexBufferAt(index: number, buffer: VertexBufferFlash, bufferOffset?: number, format?: string): void;
	    setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void;
	    setBlendFactors(sourceFactor: string, destinationFactor: string): void;
	    setRenderToTexture(target: ResourceBaseFlash, enableDepthAndStencil?: boolean, antiAlias?: number, surfaceSelector?: number): void;
	    setRenderToBackBuffer(): void;
	    setScissorRectangle(rectangle: Rectangle): void;
	    setDepthTest(depthMask: boolean, passCompareMode: string): void;
	    dispose(): void;
	    addStream(stream: string): void;
	    execute(): number;
	}
	export = ContextStage3D;
	
}
declare module "awayjs-stagegl/lib/aglsl/AGLSLParser" {
	import Description = require("awayjs-stagegl/lib/aglsl/Description");
	class AGLSLParser {
	    parse(desc: Description): string;
	    regtostring(regtype: number, regnum: number, desc: Description, tag: any): string;
	    sourcetostring(s: any, subline: any, dwm: any, isscalar: any, desc: any, tag: any): string;
	}
	export = AGLSLParser;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLProfile" {
	class ContextGLProfile {
	    static BASELINE: string;
	    static BASELINE_CONSTRAINED: string;
	    static BASELINE_EXTENDED: string;
	}
	export = ContextGLProfile;
	
}
declare module "awayjs-stagegl/lib/base/ContextGLStencilAction" {
	class ContextGLStencilAction {
	    static DECREMENT_SATURATE: string;
	    static DECREMENT_WRAP: string;
	    static INCREMENT_SATURATE: string;
	    static INCREMENT_WRAP: string;
	    static INVERT: string;
	    static KEEP: string;
	    static SET: string;
	    static ZERO: string;
	}
	export = ContextGLStencilAction;
	
}
declare module "awayjs-stagegl/lib/pool/IndexDataPool" {
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	/**
	 *
	 */
	class IndexDataPool {
	    private static _pool;
	    constructor();
	    static getItem(subGeometry: SubGeometryBase, level: number, indexOffset: number): IndexData;
	    static disposeItem(id: number, level: number): void;
	    disposeData(id: number): void;
	}
	export = IndexDataPool;
	
}
declare module "awayjs-stagegl/lib/pool/VertexDataPool" {
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	import VertexData = require("awayjs-stagegl/lib/pool/VertexData");
	/**
	 *
	 */
	class VertexDataPool {
	    private static _pool;
	    constructor();
	    static getItem(subGeometry: SubGeometryBase, indexData: IndexData, dataType: string): VertexData;
	    static disposeItem(subGeometry: SubGeometryBase, level: number, dataType: string): void;
	    disposeData(subGeometry: SubGeometryBase): void;
	}
	export = VertexDataPool;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/Sampler" {
	class Sampler {
	    shift: number;
	    mask: number;
	    value: number;
	    constructor(shift: number, mask: number, value: number);
	}
	export = Sampler;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/Flags" {
	class Flags {
	    simple: boolean;
	    horizontal: boolean;
	    fragonly: boolean;
	    matrix: boolean;
	}
	export = Flags;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/FS" {
	class FS {
	    format: string;
	    size: number;
	}
	export = FS;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/Opcode" {
	import Flags = require("awayjs-stagegl/lib/aglsl/assembler/Flags");
	import FS = require("awayjs-stagegl/lib/aglsl/assembler/FS");
	/**
	 *
	 */
	class Opcode {
	    dest: string;
	    a: FS;
	    b: FS;
	    opcode: number;
	    flags: Flags;
	    constructor(dest: string, aformat: string, asize: number, bformat: string, bsize: number, opcode: number, simple: boolean, horizontal: boolean, fragonly: boolean, matrix: boolean);
	}
	export = Opcode;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/OpcodeMap" {
	class OpcodeMap {
	    private static _map;
	    static map: Object[];
	    constructor();
	}
	export = OpcodeMap;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/Part" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	class Part {
	    name: string;
	    version: number;
	    data: ByteArray;
	    constructor(name?: string, version?: number);
	}
	export = Part;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/RegMap" {
	class RegMap {
	    private static _map;
	    static map: any[];
	    constructor();
	}
	export = RegMap;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/SamplerMap" {
	class SamplerMap {
	    private static _map;
	    static map: Object[];
	    constructor();
	}
	export = SamplerMap;
	
}
declare module "awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler" {
	import Part = require("awayjs-stagegl/lib/aglsl/assembler/Part");
	class AGALMiniAssembler {
	    r: Object;
	    cur: Part;
	    constructor();
	    assemble(source: string, ext_part?: any, ext_version?: any): Object;
	    private processLine(line, linenr);
	    emitHeader(pr: Part): void;
	    emitOpcode(pr: Part, opcode: any): void;
	    emitZeroDword(pr: Part): void;
	    emitZeroQword(pr: any): void;
	    emitDest(pr: any, token: any, opdest: any): boolean;
	    stringToMask(s: string): number;
	    stringToSwizzle(s: any): number;
	    emitSampler(pr: Part, token: any, opsrc: any, opts: any): boolean;
	    emitSource(pr: any, token: any, opsrc: any): boolean;
	    addHeader(partname: any, version: any): void;
	}
	export = AGALMiniAssembler;
	
}