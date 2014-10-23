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
declare module "awayjs-stagegl/lib/base/ContextGLClearMask" {
	class ContextGLClearMask {
	    static COLOR: number;
	    static DEPTH: number;
	    static STENCIL: number;
	    static ALL: number;
	}
	export = ContextGLClearMask;
	
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
declare module "awayjs-stagegl/lib/base/ContextGLProgramType" {
	class ContextGLProgramType {
	    static FRAGMENT: string;
	    static VERTEX: string;
	}
	export = ContextGLProgramType;
	
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
declare module "awayjs-stagegl/lib/pool/IndexData" {
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	/**
	 *
	 */
	class IndexData {
	    private static LIMIT_VERTS;
	    private static LIMIT_INDICES;
	    private _dataDirty;
	    invalid: boolean[];
	    contexts: ContextGLBase[];
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
declare module "awayjs-stagegl/lib/base/IVertexBuffer" {
	interface IVertexBuffer {
	    numVertices: number;
	    data32PerVertex: number;
	    uploadFromArray(data: number[], startVertex: number, numVertices: number): any;
	    dispose(): any;
	}
	export = IVertexBuffer;
	
}
declare module "awayjs-stagegl/lib/pool/VertexData" {
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
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
	    contexts: ContextGLBase[];
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
declare module "awayjs-stagegl/lib/pool/RenderableBase" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import IMaterialOwner = require("awayjs-display/lib/base/IMaterialOwner");
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import IRenderable = require("awayjs-display/lib/pool/IRenderable");
	import RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
	import IEntity = require("awayjs-display/lib/entities/IEntity");
	import MaterialBase = require("awayjs-display/lib/materials/MaterialBase");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	import VertexData = require("awayjs-stagegl/lib/pool/VertexData");
	/**
	 * @class RenderableListItem
	 */
	class RenderableBase implements IRenderable {
	    private _onIndicesUpdatedDelegate;
	    private _onVerticesUpdatedDelegate;
	    private _subGeometry;
	    private _geometryDirty;
	    private _indexData;
	    private _indexDataDirty;
	    private _vertexData;
	    _pVertexDataDirty: Object;
	    private _vertexOffset;
	    private _level;
	    private _indexOffset;
	    private _overflow;
	    private _numTriangles;
	    private _concatenateArrays;
	    JOINT_INDEX_FORMAT: string;
	    JOINT_WEIGHT_FORMAT: string;
	    /**
	     *
	     */
	    _pool: RenderablePool;
	    /**
	     *
	     */
	    overflow: RenderableBase;
	    /**
	     *
	     */
	    numTriangles: number;
	    /**
	     *
	     */
	    next: RenderableBase;
	    /**
	     *
	     */
	    materialId: number;
	    /**
	     *
	     */
	    renderOrderId: number;
	    /**
	     *
	     */
	    zIndex: number;
	    /**
	     *
	     */
	    cascaded: boolean;
	    /**
	     *
	     */
	    renderSceneTransform: Matrix3D;
	    /**
	     *
	     */
	    sourceEntity: IEntity;
	    /**
	     *
	     */
	    materialOwner: IMaterialOwner;
	    /**
	     *
	     */
	    material: MaterialBase;
	    /**
	     *
	     */
	    getIndexData(): IndexData;
	    /**
	     *
	     */
	    getVertexData(dataType: string): VertexData;
	    /**
	     *
	     */
	    getVertexOffset(dataType: string): number;
	    /**
	     *
	     * @param sourceEntity
	     * @param materialOwner
	     * @param subGeometry
	     * @param animationSubGeometry
	     */
	    constructor(pool: RenderablePool, sourceEntity: IEntity, materialOwner: IMaterialOwner, level?: number, indexOffset?: number);
	    dispose(): void;
	    invalidateGeometry(): void;
	    /**
	     *
	     */
	    invalidateIndexData(): void;
	    /**
	     * //TODO
	     *
	     * @param dataType
	     */
	    invalidateVertexData(dataType: string): void;
	    _pGetSubGeometry(): SubGeometryBase;
	    /**
	     * //TODO
	     *
	     * @param subGeometry
	     * @param offset
	     * @internal
	     */
	    _iFillIndexData(indexOffset: number): void;
	    _pGetOverflowRenderable(pool: RenderablePool, materialOwner: IMaterialOwner, level: number, indexOffset: number): RenderableBase;
	    /**
	     * //TODO
	     *
	     * @private
	     */
	    private _updateGeometry();
	    /**
	     * //TODO
	     *
	     * @private
	     */
	    private _updateIndexData();
	    /**
	     * //TODO
	     *
	     * @param dataType
	     * @private
	     */
	    private _updateVertexData(dataType);
	    /**
	     * //TODO
	     *
	     * @param event
	     * @private
	     */
	    private _onIndicesUpdated(event);
	    /**
	     * //TODO
	     *
	     * @param event
	     * @private
	     */
	    private _onVerticesUpdated(event);
	}
	export = RenderableBase;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement" {
	/**
	 * A single register element (an entire register or a single register's component) used by the RegisterPool.
	 */
	class ShaderRegisterElement {
	    private _regName;
	    private _index;
	    private _toStr;
	    private static COMPONENTS;
	    _component: number;
	    /**
	     * Creates a new ShaderRegisterElement object.
	     *
	     * @param regName The name of the register.
	     * @param index The index of the register.
	     * @param component The register's component, if not the entire register is represented.
	     */
	    constructor(regName: string, index: number, component?: number);
	    /**
	     * Converts the register or the components AGAL string representation.
	     */
	    toString(): string;
	    /**
	     * The register's name.
	     */
	    regName: string;
	    /**
	     * The register's index.
	     */
	    index: number;
	}
	export = ShaderRegisterElement;
	
}
declare module "awayjs-stagegl/lib/errors/AnimationSetError" {
	import Error = require("awayjs-core/lib/errors/Error");
	class AnimationSetError extends Error {
	    constructor(message: string);
	}
	export = AnimationSetError;
	
}
declare module "awayjs-stagegl/lib/animators/AnimationSetBase" {
	import IAsset = require("awayjs-core/lib/library/IAsset");
	import NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
	import AnimationNodeBase = require("awayjs-display/lib/animators/nodes/AnimationNodeBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	/**
	 * Provides an abstract base class for data set classes that hold animation data for use in animator classes.
	 *
	 * @see away.animators.AnimatorBase
	 */
	class AnimationSetBase extends NamedAssetBase implements IAsset {
	    private _usesCPU;
	    private _animations;
	    private _animationNames;
	    private _animationDictionary;
	    constructor();
	    /**
	     * Retrieves a temporary GPU register that's still free.
	     *
	     * @param exclude An array of non-free temporary registers.
	     * @param excludeAnother An additional register that's not free.
	     * @return A temporary register that can be used.
	     */
	    _pFindTempReg(exclude: string[], excludeAnother?: string): string;
	    /**
	     * Indicates whether the properties of the animation data contained within the set combined with
	     * the vertex registers already in use on shading materials allows the animation data to utilise
	     * GPU calls.
	     */
	    usesCPU: boolean;
	    /**
	     * Called by the material to reset the GPU indicator before testing whether register space in the shader
	     * is available for running GPU-based animation code.
	     *
	     * @private
	     */
	    resetGPUCompatibility(): void;
	    cancelGPUCompatibility(): void;
	    /**
	     * @inheritDoc
	     */
	    getAGALVertexCode(shaderObject: ShaderObjectBase): string;
	    /**
	     * @inheritDoc
	     */
	    activate(shaderObject: ShaderObjectBase, stage: Stage): void;
	    /**
	     * @inheritDoc
	     */
	    deactivate(shaderObject: ShaderObjectBase, stage: Stage): void;
	    /**
	     * @inheritDoc
	     */
	    getAGALFragmentCode(shaderObject: ShaderObjectBase, shadedTarget: string): string;
	    /**
	     * @inheritDoc
	     */
	    getAGALUVCode(shaderObject: ShaderObjectBase): string;
	    /**
	     * @inheritDoc
	     */
	    doneAGALCode(shaderObject: ShaderObjectBase): void;
	    /**
	     * @inheritDoc
	     */
	    assetType: string;
	    /**
	     * Returns a vector of animation state objects that make up the contents of the animation data set.
	     */
	    animations: AnimationNodeBase[];
	    /**
	     * Returns a vector of animation state objects that make up the contents of the animation data set.
	     */
	    animationNames: string[];
	    /**
	     * Check to determine whether a state is registered in the animation set under the given name.
	     *
	     * @param stateName The name of the animation state object to be checked.
	     */
	    hasAnimation(name: string): boolean;
	    /**
	     * Retrieves the animation state object registered in the animation data set under the given name.
	     *
	     * @param stateName The name of the animation state object to be retrieved.
	     */
	    getAnimation(name: string): AnimationNodeBase;
	    /**
	     * Adds an animation state object to the aniamtion data set under the given name.
	     *
	     * @param stateName The name under which the animation state object will be stored.
	     * @param animationState The animation state object to be staored in the set.
	     */
	    addAnimation(node: AnimationNodeBase): void;
	    /**
	     * Cleans up any resources used by the current object.
	     */
	    dispose(): void;
	}
	export = AnimationSetBase;
	
}
declare module "awayjs-stagegl/lib/animators/states/IAnimationState" {
	import Vector3D = require("awayjs-core/lib/geom/Vector3D");
	interface IAnimationState {
	    positionDelta: Vector3D;
	    offset(startTime: number): any;
	    update(time: number): any;
	    /**
	     * Sets the animation phase of the node.
	     *
	     * @param value The phase value to use. 0 represents the beginning of an animation clip, 1 represents the end.
	     */
	    phase(value: number): any;
	}
	export = IAnimationState;
	
}
declare module "awayjs-stagegl/lib/pool/TriangleSubMeshRenderable" {
	import IMaterialOwner = require("awayjs-display/lib/base/IMaterialOwner");
	import TriangleSubMesh = require("awayjs-display/lib/base/TriangleSubMesh");
	import TriangleSubGeometry = require("awayjs-display/lib/base/TriangleSubGeometry");
	import RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	/**
	 * @class away.pool.TriangleSubMeshRenderable
	 */
	class TriangleSubMeshRenderable extends RenderableBase {
	    /**
	     *
	     */
	    static id: string;
	    /**
	     *
	     */
	    subMesh: TriangleSubMesh;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param subMesh
	     * @param level
	     * @param indexOffset
	     */
	    constructor(pool: RenderablePool, subMesh: TriangleSubMesh, level?: number, indexOffset?: number);
	    /**
	     *
	     * @returns {SubGeometryBase}
	     * @protected
	     */
	    _pGetSubGeometry(): TriangleSubGeometry;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param materialOwner
	     * @param level
	     * @param indexOffset
	     * @returns {away.pool.TriangleSubMeshRenderable}
	     * @protected
	     */
	    _pGetOverflowRenderable(pool: RenderablePool, materialOwner: IMaterialOwner, level: number, indexOffset: number): RenderableBase;
	}
	export = TriangleSubMeshRenderable;
	
}
declare module "awayjs-stagegl/lib/events/AnimatorEvent" {
	import Event = require("awayjs-core/lib/events/Event");
	import AnimatorBase = require("awayjs-stagegl/lib/animators/AnimatorBase");
	/**
	 * Dispatched to notify changes in an animator's state.
	 */
	class AnimatorEvent extends Event {
	    /**
	     * Defines the value of the type property of a start event object.
	     */
	    static START: string;
	    /**
	     * Defines the value of the type property of a stop event object.
	     */
	    static STOP: string;
	    /**
	     * Defines the value of the type property of a cycle complete event object.
	     */
	    static CYCLE_COMPLETE: string;
	    private _animator;
	    /**
	     * Create a new <code>AnimatorEvent</code> object.
	     *
	     * @param type The event type.
	     * @param animator The animator object that is the subject of this event.
	     */
	    constructor(type: string, animator: AnimatorBase);
	    animator: AnimatorBase;
	    /**
	     * Clones the event.
	     *
	     * @return An exact duplicate of the current event object.
	     */
	    clone(): Event;
	}
	export = AnimatorEvent;
	
}
declare module "awayjs-stagegl/lib/animators/AnimatorBase" {
	import NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
	import IAnimationSet = require("awayjs-display/lib/animators/IAnimationSet");
	import IAnimator = require("awayjs-display/lib/animators/IAnimator");
	import AnimationNodeBase = require("awayjs-display/lib/animators/nodes/AnimationNodeBase");
	import TriangleSubGeometry = require("awayjs-display/lib/base/TriangleSubGeometry");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Mesh = require("awayjs-display/lib/entities/Mesh");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IAnimationState = require("awayjs-stagegl/lib/animators/states/IAnimationState");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import TriangleSubMeshRenderable = require("awayjs-stagegl/lib/pool/TriangleSubMeshRenderable");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	/**
	 * Dispatched when playback of an animation inside the animator object starts.
	 *
	 * @eventType away3d.events.AnimatorEvent
	 */
	/**
	 * Dispatched when playback of an animation inside the animator object stops.
	 *
	 * @eventType away3d.events.AnimatorEvent
	 */
	/**
	 * Dispatched when playback of an animation reaches the end of an animation.
	 *
	 * @eventType away3d.events.AnimatorEvent
	 */
	/**
	 * Provides an abstract base class for animator classes that control animation output from a data set subtype of <code>AnimationSetBase</code>.
	 *
	 * @see away.animators.AnimationSetBase
	 */
	class AnimatorBase extends NamedAssetBase implements IAnimator {
	    private _broadcaster;
	    private _isPlaying;
	    private _autoUpdate;
	    private _startEvent;
	    private _stopEvent;
	    private _cycleEvent;
	    private _time;
	    private _playbackSpeed;
	    _pAnimationSet: IAnimationSet;
	    _pOwners: Mesh[];
	    _pActiveNode: AnimationNodeBase;
	    _pActiveState: IAnimationState;
	    _pActiveAnimationName: string;
	    _pAbsoluteTime: number;
	    private _animationStates;
	    /**
	     * Enables translation of the animated mesh from data returned per frame via the positionDelta property of the active animation node. Defaults to true.
	     *
	     * @see away.animators.IAnimationState#positionDelta
	     */
	    updatePosition: boolean;
	    getAnimationState(node: AnimationNodeBase): IAnimationState;
	    getAnimationStateByName(name: string): IAnimationState;
	    /**
	     * Returns the internal absolute time of the animator, calculated by the current time and the playback speed.
	     *
	     * @see #time
	     * @see #playbackSpeed
	     */
	    absoluteTime: number;
	    /**
	     * Returns the animation data set in use by the animator.
	     */
	    animationSet: IAnimationSet;
	    /**
	     * Returns the current active animation state.
	     */
	    activeState: IAnimationState;
	    /**
	     * Returns the current active animation node.
	     */
	    activeAnimation: AnimationNodeBase;
	    /**
	     * Returns the current active animation node.
	     */
	    activeAnimationName: string;
	    /**
	     * Determines whether the animators internal update mechanisms are active. Used in cases
	     * where manual updates are required either via the <code>time</code> property or <code>update()</code> method.
	     * Defaults to true.
	     *
	     * @see #time
	     * @see #update()
	     */
	    autoUpdate: boolean;
	    /**
	     * Gets and sets the internal time clock of the animator.
	     */
	    time: number;
	    /**
	     * Sets the animation phase of the current active state's animation clip(s).
	     *
	     * @param value The phase value to use. 0 represents the beginning of an animation clip, 1 represents the end.
	     */
	    phase(value: number): void;
	    /**
	     * Creates a new <code>AnimatorBase</code> object.
	     *
	     * @param animationSet The animation data set to be used by the animator object.
	     */
	    constructor(animationSet: IAnimationSet);
	    /**
	     * The amount by which passed time should be scaled. Used to slow down or speed up animations. Defaults to 1.
	     */
	    playbackSpeed: number;
	    setRenderState(shaderObject: ShaderObjectBase, renderable: RenderableBase, stage: Stage, camera: Camera, vertexConstantOffset: number, vertexStreamOffset: number): void;
	    /**
	     * Resumes the automatic playback clock controling the active state of the animator.
	     */
	    start(): void;
	    /**
	     * Pauses the automatic playback clock of the animator, in case manual updates are required via the
	     * <code>time</code> property or <code>update()</code> method.
	     *
	     * @see #time
	     * @see #update()
	     */
	    stop(): void;
	    /**
	     * Provides a way to manually update the active state of the animator when automatic
	     * updates are disabled.
	     *
	     * @see #stop()
	     * @see #autoUpdate
	     */
	    update(time: number): void;
	    reset(name: string, offset?: number): void;
	    /**
	     * Used by the mesh object to which the animator is applied, registers the owner for internal use.
	     *
	     * @private
	     */
	    addOwner(mesh: Mesh): void;
	    /**
	     * Used by the mesh object from which the animator is removed, unregisters the owner for internal use.
	     *
	     * @private
	     */
	    removeOwner(mesh: Mesh): void;
	    /**
	     * Internal abstract method called when the time delta property of the animator's contents requires updating.
	     *
	     * @private
	     */
	    _pUpdateDeltaTime(dt: number): void;
	    /**
	     * Enter frame event handler for automatically updating the active state of the animator.
	     */
	    private onEnterFrame(event?);
	    private applyPositionDelta();
	    /**
	     *  for internal use.
	     *
	     * @private
	     */
	    dispatchCycleEvent(): void;
	    /**
	     * @inheritDoc
	     */
	    clone(): AnimatorBase;
	    /**
	     * @inheritDoc
	     */
	    dispose(): void;
	    /**
	     * @inheritDoc
	     */
	    testGPUCompatibility(shaderObject: ShaderObjectBase): void;
	    /**
	     * @inheritDoc
	     */
	    assetType: string;
	    getRenderableSubGeometry(renderable: TriangleSubMeshRenderable, sourceSubGeometry: TriangleSubGeometry): TriangleSubGeometry;
	}
	export = AnimatorBase;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/RegisterPool" {
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	/**
	 * RegisterPool is used by the shader compilation process to keep track of which registers of a certain type are
	 * currently used and should not be allowed to be written to. Either entire registers can be requested and locked,
	 * or single components (x, y, z, w) of a single register.
	 * It is used by ShaderRegisterCache to track usages of individual register types.
	 *
	 * @see away.materials.ShaderRegisterCache
	 */
	class RegisterPool {
	    private static _regPool;
	    private static _regCompsPool;
	    private _vectorRegisters;
	    private _registerComponents;
	    private _regName;
	    private _usedSingleCount;
	    private _usedVectorCount;
	    private _regCount;
	    private _persistent;
	    /**
	     * Creates a new RegisterPool object.
	     * @param regName The base name of the register type ("ft" for fragment temporaries, "vc" for vertex constants, etc)
	     * @param regCount The amount of available registers of this type.
	     * @param persistent Whether or not registers, once reserved, can be freed again. For example, temporaries are not persistent, but constants are.
	     */
	    constructor(regName: string, regCount: number, persistent?: boolean);
	    /**
	     * Retrieve an entire vector register that's still available.
	     */
	    requestFreeVectorReg(): ShaderRegisterElement;
	    /**
	     * Retrieve a single vector component that's still available.
	     */
	    requestFreeRegComponent(): ShaderRegisterElement;
	    /**
	     * Marks a register as used, so it cannot be retrieved. The register won't be able to be used until removeUsage
	     * has been called usageCount times again.
	     * @param register The register to mark as used.
	     * @param usageCount The amount of usages to add.
	     */
	    addUsage(register: ShaderRegisterElement, usageCount: number): void;
	    /**
	     * Removes a usage from a register. When usages reach 0, the register is freed again.
	     * @param register The register for which to remove a usage.
	     */
	    removeUsage(register: ShaderRegisterElement): void;
	    /**
	     * Disposes any resources used by the current RegisterPool object.
	     */
	    dispose(): void;
	    /**
	     * Indicates whether or not any registers are in use.
	     */
	    hasRegisteredRegs(): boolean;
	    /**
	     * Initializes all registers.
	     */
	    private initRegisters(regName, regCount);
	    private static _initPool(regName, regCount);
	    /**
	     * Check if the temp register is either used for single or vector use
	     */
	    private isRegisterUsed(index);
	    private _initArray(a, val);
	}
	export = RegisterPool;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache" {
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	/**
	 * ShaderRegister Cache provides the usage management system for all registers during shading compilation.
	 */
	class ShaderRegisterCache {
	    private _fragmentTempCache;
	    private _vertexTempCache;
	    private _varyingCache;
	    private _fragmentConstantsCache;
	    private _vertexConstantsCache;
	    private _textureCache;
	    private _vertexAttributesCache;
	    private _vertexConstantOffset;
	    private _vertexAttributesOffset;
	    private _varyingsOffset;
	    private _fragmentConstantOffset;
	    private _fragmentOutputRegister;
	    private _vertexOutputRegister;
	    private _numUsedVertexConstants;
	    private _numUsedFragmentConstants;
	    private _numUsedStreams;
	    private _numUsedTextures;
	    private _numUsedVaryings;
	    private _profile;
	    /**
	     * Create a new ShaderRegisterCache object.
	     *
	     * @param profile The compatibility profile used by the renderer.
	     */
	    constructor(profile: string);
	    /**
	     * Resets all registers.
	     */
	    reset(): void;
	    /**
	     * Disposes all resources used.
	     */
	    dispose(): void;
	    /**
	     * Marks a fragment temporary register as used, so it cannot be retrieved. The register won't be able to be used until removeUsage
	     * has been called usageCount times again.
	     * @param register The register to mark as used.
	     * @param usageCount The amount of usages to add.
	     */
	    addFragmentTempUsages(register: ShaderRegisterElement, usageCount: number): void;
	    /**
	     * Removes a usage from a fragment temporary register. When usages reach 0, the register is freed again.
	     * @param register The register for which to remove a usage.
	     */
	    removeFragmentTempUsage(register: ShaderRegisterElement): void;
	    /**
	     * Marks a vertex temporary register as used, so it cannot be retrieved. The register won't be able to be used
	     * until removeUsage has been called usageCount times again.
	     * @param register The register to mark as used.
	     * @param usageCount The amount of usages to add.
	     */
	    addVertexTempUsages(register: ShaderRegisterElement, usageCount: number): void;
	    /**
	     * Removes a usage from a vertex temporary register. When usages reach 0, the register is freed again.
	     * @param register The register for which to remove a usage.
	     */
	    removeVertexTempUsage(register: ShaderRegisterElement): void;
	    /**
	     * Retrieve an entire fragment temporary register that's still available. The register won't be able to be used until removeUsage
	     * has been called usageCount times again.
	     */
	    getFreeFragmentVectorTemp(): ShaderRegisterElement;
	    /**
	     * Retrieve a single component from a fragment temporary register that's still available.
	     */
	    getFreeFragmentSingleTemp(): ShaderRegisterElement;
	    /**
	     * Retrieve an available varying register
	     */
	    getFreeVarying(): ShaderRegisterElement;
	    /**
	     * Retrieve an available fragment constant register
	     */
	    getFreeFragmentConstant(): ShaderRegisterElement;
	    /**
	     * Retrieve an available vertex constant register
	     */
	    getFreeVertexConstant(): ShaderRegisterElement;
	    /**
	     * Retrieve an entire vertex temporary register that's still available.
	     */
	    getFreeVertexVectorTemp(): ShaderRegisterElement;
	    /**
	     * Retrieve a single component from a vertex temporary register that's still available.
	     */
	    getFreeVertexSingleTemp(): ShaderRegisterElement;
	    /**
	     * Retrieve an available vertex attribute register
	     */
	    getFreeVertexAttribute(): ShaderRegisterElement;
	    /**
	     * Retrieve an available texture register
	     */
	    getFreeTextureReg(): ShaderRegisterElement;
	    /**
	     * Indicates the start index from which to retrieve vertex constants.
	     */
	    vertexConstantOffset: number;
	    /**
	     * Indicates the start index from which to retrieve vertex attributes.
	     */
	    vertexAttributesOffset: number;
	    /**
	     * Indicates the start index from which to retrieve varying registers.
	     */
	    varyingsOffset: number;
	    /**
	     * Indicates the start index from which to retrieve fragment constants.
	     */
	    fragmentConstantOffset: number;
	    /**
	     * The fragment output register.
	     */
	    fragmentOutputRegister: ShaderRegisterElement;
	    /**
	     * The amount of used vertex constant registers.
	     */
	    numUsedVertexConstants: number;
	    /**
	     * The amount of used fragment constant registers.
	     */
	    numUsedFragmentConstants: number;
	    /**
	     * The amount of used vertex streams.
	     */
	    numUsedStreams: number;
	    /**
	     * The amount of used texture slots.
	     */
	    numUsedTextures: number;
	    /**
	     * The amount of used varying registers.
	     */
	    numUsedVaryings: number;
	}
	export = ShaderRegisterCache;
	
}
declare module "awayjs-stagegl/lib/animators/data/AnimationRegisterCache" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import AnimationNodeBase = require("awayjs-display/lib/animators/nodes/AnimationNodeBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	/**
	 * ...
	 */
	class AnimationRegisterCache extends ShaderRegisterCache {
	    positionAttribute: ShaderRegisterElement;
	    uvAttribute: ShaderRegisterElement;
	    positionTarget: ShaderRegisterElement;
	    scaleAndRotateTarget: ShaderRegisterElement;
	    velocityTarget: ShaderRegisterElement;
	    vertexTime: ShaderRegisterElement;
	    vertexLife: ShaderRegisterElement;
	    vertexZeroConst: ShaderRegisterElement;
	    vertexOneConst: ShaderRegisterElement;
	    vertexTwoConst: ShaderRegisterElement;
	    uvTarget: ShaderRegisterElement;
	    colorAddTarget: ShaderRegisterElement;
	    colorMulTarget: ShaderRegisterElement;
	    colorAddVary: ShaderRegisterElement;
	    colorMulVary: ShaderRegisterElement;
	    uvVar: ShaderRegisterElement;
	    rotationRegisters: ShaderRegisterElement[];
	    needFragmentAnimation: boolean;
	    needUVAnimation: boolean;
	    sourceRegisters: string[];
	    targetRegisters: string[];
	    private indexDictionary;
	    hasUVNode: boolean;
	    needVelocity: boolean;
	    hasBillboard: boolean;
	    hasColorMulNode: boolean;
	    hasColorAddNode: boolean;
	    constructor(profile: string);
	    reset(): void;
	    setUVSourceAndTarget(UVAttribute: string, UVVaring: string): void;
	    setRegisterIndex(node: AnimationNodeBase, parameterIndex: number, registerIndex: number): void;
	    getRegisterIndex(node: AnimationNodeBase, parameterIndex: number): number;
	    getInitCode(): string;
	    getCombinationCode(): string;
	    initColorRegisters(): string;
	    getColorPassCode(): string;
	    getColorCombinationCode(shadedTarget: string): string;
	    private getRegisterFromString(code);
	    vertexConstantData: number[];
	    fragmentConstantData: number[];
	    private _numVertexConstant;
	    private _numFragmentConstant;
	    numVertexConstant: number;
	    numFragmentConstant: number;
	    setDataLength(): void;
	    setVertexConst(index: number, x?: number, y?: number, z?: number, w?: number): void;
	    setVertexConstFromArray(index: number, data: number[]): void;
	    setVertexConstFromMatrix(index: number, matrix: Matrix3D): void;
	    setFragmentConst(index: number, x?: number, y?: number, z?: number, w?: number): void;
	}
	export = AnimationRegisterCache;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderRegisterData" {
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	/**
	 * ShaderRegisterData contains the "named" registers, generated by the compiler and to be passed on to the methods.
	 */
	class ShaderRegisterData {
	    normalVarying: ShaderRegisterElement;
	    tangentVarying: ShaderRegisterElement;
	    bitangentVarying: ShaderRegisterElement;
	    uvVarying: ShaderRegisterElement;
	    secondaryUVVarying: ShaderRegisterElement;
	    viewDirVarying: ShaderRegisterElement;
	    shadowTarget: ShaderRegisterElement;
	    shadedTarget: ShaderRegisterElement;
	    globalPositionVertex: ShaderRegisterElement;
	    globalPositionVarying: ShaderRegisterElement;
	    localPosition: ShaderRegisterElement;
	    normalInput: ShaderRegisterElement;
	    tangentInput: ShaderRegisterElement;
	    animatedNormal: ShaderRegisterElement;
	    animatedTangent: ShaderRegisterElement;
	    commons: ShaderRegisterElement;
	    projectionFragment: ShaderRegisterElement;
	    normalFragment: ShaderRegisterElement;
	    viewDirFragment: ShaderRegisterElement;
	    bitangent: ShaderRegisterElement;
	    constructor();
	}
	export = ShaderRegisterData;
	
}
declare module "awayjs-stagegl/lib/materials/passes/IMaterialPassStageGL" {
	import IMaterialPass = require("awayjs-display/lib/materials/passes/IMaterialPass");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	interface IMaterialPassStageGL extends IMaterialPass {
	    _iGetPreLightingVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPreLightingFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetNormalVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetNormalFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    forceSeparateMVP: boolean;
	    passMode: number;
	    _iInitConstantData(shaderObject: ShaderObjectBase): any;
	    _iIncludeDependencies(shaderObject: ShaderObjectBase): any;
	    /**
	     * Factory method to create a concrete shader object for this pass.
	     *
	     * @param profile The compatibility profile used by the renderer.
	     */
	    createShaderObject(profile: string): ShaderObjectBase;
	}
	export = IMaterialPassStageGL;
	
}
declare module "awayjs-stagegl/lib/materials/passes/MaterialPassMode" {
	class MaterialPassMode {
	    static EFFECTS: number;
	    /**
	     *
	     */
	    static LIGHTING: number;
	    /**
	     *
	     */
	    static SUPER_SHADER: number;
	}
	export = MaterialPassMode;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderCompilerBase" {
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import IMaterialPassStageGL = require("awayjs-stagegl/lib/materials/passes/IMaterialPassStageGL");
	/**
	 * ShaderCompilerBase is an abstract base class for shader compilers that use modular shader methods to assemble a
	 * material. Concrete subclasses are used by the default materials.
	 *
	 * @see away.materials.ShadingMethodBase
	 */
	class ShaderCompilerBase {
	    _pShaderObject: ShaderObjectBase;
	    _pSharedRegisters: ShaderRegisterData;
	    _pRegisterCache: ShaderRegisterCache;
	    _pMaterialPass: IMaterialPassStageGL;
	    _pMaterial: StageGLMaterialBase;
	    _pVertexCode: string;
	    _pFragmentCode: string;
	    _pPostAnimationFragmentCode: string;
	    _pAnimatableAttributes: string[];
	    _pAnimationTargetRegisters: string[];
	    private _uvTarget;
	    private _uvSource;
	    _pProfile: string;
	    /**
	     * Creates a new ShaderCompilerBase object.
	     * @param profile The compatibility profile of the renderer.
	     */
	    constructor(material: StageGLMaterialBase, materialPass: IMaterialPassStageGL, shaderObject: ShaderObjectBase);
	    /**
	     * Compiles the code after all setup on the compiler has finished.
	     */
	    compile(): void;
	    /**
	     * Compile the code for the methods.
	     */
	    pCompileDependencies(): void;
	    private compileGlobalPositionCode();
	    /**
	     * Calculate the (possibly animated) UV coordinates.
	     */
	    private compileUVCode();
	    /**
	     * Provide the secondary UV coordinates.
	     */
	    private compileSecondaryUVCode();
	    /**
	     * Calculate the view direction.
	     */
	    compileViewDirCode(): void;
	    /**
	     * Calculate the normal.
	     */
	    compileNormalCode(): void;
	    /**
	     * Reset all the indices to "unused".
	     */
	    pInitRegisterIndices(): void;
	    /**
	     * Figure out which named registers are required, and how often.
	     */
	    pCalculateDependencies(): void;
	    /**
	     * Disposes all resources used by the compiler.
	     */
	    dispose(): void;
	    /**
	     * The generated vertex code.
	     */
	    vertexCode: string;
	    /**
	     * The generated fragment code.
	     */
	    fragmentCode: string;
	    /**
	     * The generated fragment code.
	     */
	    postAnimationFragmentCode: string;
	    /**
	     * The register name containing the final shaded colour.
	     */
	    shadedTarget: string;
	}
	export = ShaderCompilerBase;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderObjectBase" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import AnimationRegisterCache = require("awayjs-stagegl/lib/animators/data/AnimationRegisterCache");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderCompilerBase = require("awayjs-stagegl/lib/materials/compilation/ShaderCompilerBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import IMaterialPassStageGL = require("awayjs-stagegl/lib/materials/passes/IMaterialPassStageGL");
	/**
	 * ShaderObjectBase keeps track of the number of dependencies for "named registers" used across a pass.
	 * Named registers are that are not necessarily limited to a single method. They are created by the compiler and
	 * passed on to methods. The compiler uses the results to reserve usages through RegisterPool, which can be removed
	 * each time a method has been compiled into the shader.
	 *
	 * @see RegisterPool.addUsage
	 */
	class ShaderObjectBase {
	    private _defaultCulling;
	    _pInverseSceneMatrix: number[];
	    animationRegisterCache: AnimationRegisterCache;
	    profile: string;
	    /**
	     * The amount of used vertex constants in the vertex code. Used by the animation code generation to know from which index on registers are available.
	     */
	    numUsedVertexConstants: number;
	    /**
	     * The amount of used fragment constants in the fragment code. Used by the animation code generation to know from which index on registers are available.
	     */
	    numUsedFragmentConstants: number;
	    /**
	     * The amount of used vertex streams in the vertex code. Used by the animation code generation to know from which index on streams are available.
	     */
	    numUsedStreams: number;
	    /**
	     *
	     */
	    numUsedTextures: number;
	    /**
	     *
	     */
	    numUsedVaryings: number;
	    animatableAttributes: string[];
	    animationTargetRegisters: string[];
	    uvSource: string;
	    uvTarget: string;
	    useAlphaPremultiplied: boolean;
	    useBothSides: boolean;
	    useMipmapping: boolean;
	    useSmoothTextures: boolean;
	    repeatTextures: boolean;
	    usesUVTransform: boolean;
	    alphaThreshold: number;
	    texture: Texture2DBase;
	    color: number;
	    ambientR: number;
	    ambientG: number;
	    ambientB: number;
	    /**
	     * Indicates whether the pass requires any fragment animation code.
	     */
	    usesFragmentAnimation: boolean;
	    /**
	     * The amount of dependencies on the projected position.
	     */
	    projectionDependencies: number;
	    /**
	     * The amount of dependencies on the normal vector.
	     */
	    normalDependencies: number;
	    /**
	     * The amount of dependencies on the view direction.
	     */
	    viewDirDependencies: number;
	    /**
	     * The amount of dependencies on the primary UV coordinates.
	     */
	    uvDependencies: number;
	    /**
	     * The amount of dependencies on the secondary UV coordinates.
	     */
	    secondaryUVDependencies: number;
	    /**
	     * The amount of dependencies on the local position. This can be 0 while hasGlobalPosDependencies is true when
	     * the global position is used as a temporary value (fe to calculate the view direction)
	     */
	    localPosDependencies: number;
	    /**
	     * The amount of dependencies on the global position. This can be 0 while hasGlobalPosDependencies is true when
	     * the global position is used as a temporary value (fe to calculate the view direction)
	     */
	    globalPosDependencies: number;
	    /**
	     * The amount of tangent vector dependencies (fragment shader).
	     */
	    tangentDependencies: number;
	    /**
	     *
	     */
	    outputsNormals: boolean;
	    /**
	     * Indicates whether or not normal calculations are expected in tangent space. This is only the case if no world-space
	     * dependencies exist.
	     */
	    usesTangentSpace: boolean;
	    /**
	     * Indicates whether or not normal calculations are output in tangent space.
	     */
	    outputsTangentNormals: boolean;
	    /**
	     * Indicates whether there are any dependencies on the world-space position vector.
	     */
	    usesGlobalPosFragment: boolean;
	    vertexConstantData: number[];
	    fragmentConstantData: number[];
	    /**
	     * The index for the common data register.
	     */
	    commonsDataIndex: number;
	    /**
	     * The index for the UV vertex attribute stream.
	     */
	    uvBufferIndex: number;
	    /**
	     * The index for the secondary UV vertex attribute stream.
	     */
	    secondaryUVBufferIndex: number;
	    /**
	     * The index for the vertex normal attribute stream.
	     */
	    normalBufferIndex: number;
	    /**
	     * The index for the vertex tangent attribute stream.
	     */
	    tangentBufferIndex: number;
	    /**
	     * The index of the vertex constant containing the view matrix.
	     */
	    viewMatrixIndex: number;
	    /**
	     * The index of the vertex constant containing the scene matrix.
	     */
	    sceneMatrixIndex: number;
	    /**
	     * The index of the vertex constant containing the uniform scene matrix (the inverse transpose).
	     */
	    sceneNormalMatrixIndex: number;
	    /**
	     * The index of the vertex constant containing the camera position.
	     */
	    cameraPositionIndex: number;
	    /**
	     * The index for the UV transformation matrix vertex constant.
	     */
	    uvTransformIndex: number;
	    /**
	     * Creates a new MethodCompilerVO object.
	     */
	    constructor(profile: any);
	    /**
	     * Factory method to create a concrete compiler object for this object
	     *
	     * @param materialPassVO
	     * @returns {away.materials.ShaderCompilerBase}
	     */
	    createCompiler(material: StageGLMaterialBase, materialPass: IMaterialPassStageGL): ShaderCompilerBase;
	    /**
	     * Clears dependency counts for all registers. Called when recompiling a pass.
	     */
	    reset(): void;
	    /**
	     * Adds any external world space dependencies, used to force world space calculations.
	     */
	    addWorldSpaceDependencies(fragmentLights: boolean): void;
	    pInitRegisterIndices(): void;
	    /**
	     * Initializes the unchanging constant data for this shader object.
	     */
	    initConstantData(registerCache: ShaderRegisterCache, animatableAttributes: string[], animationTargetRegisters: string[], uvSource: string, uvTarget: string): void;
	    /**
	     * @inheritDoc
	     */
	    iActivate(stage: Stage, camera: Camera): void;
	    /**
	     * @inheritDoc
	     */
	    iDeactivate(stage: Stage): void;
	    /**
	     *
	     *
	     * @param renderable
	     * @param stage
	     * @param camera
	     */
	    setRenderState(renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    dispose(): void;
	}
	export = ShaderObjectBase;
	
}
declare module "awayjs-stagegl/lib/materials/StageGLMaterialBase" {
	import MaterialBase = require("awayjs-display/lib/materials/MaterialBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	class StageGLMaterialBase extends MaterialBase {
	    _iGetVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	}
	export = StageGLMaterialBase;
	
}
declare module "awayjs-stagegl/lib/pool/MaterialDataPool" {
	import MaterialData = require("awayjs-stagegl/lib/pool/MaterialData");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import StageGLMaterialBase = require("materials/StageGLMaterialBase");
	/**
	 * @class away.pool.MaterialDataPool
	 */
	class MaterialDataPool {
	    private _pool;
	    private _context;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor(context: ContextGLBase);
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     * @returns ITexture
	     */
	    getItem(material: StageGLMaterialBase): MaterialData;
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     */
	    disposeItem(material: StageGLMaterialBase): void;
	}
	export = MaterialDataPool;
	
}
declare module "awayjs-stagegl/lib/materials/passes/MaterialPassBase" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import LightPickerBase = require("awayjs-display/lib/materials/lightpickers/LightPickerBase");
	import IMaterialPass = require("awayjs-display/lib/materials/passes/IMaterialPass");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import IMaterialPassStageGL = require("awayjs-stagegl/lib/materials/passes/IMaterialPassStageGL");
	/**
	 * MaterialPassBase provides an abstract base class for material shader passes. A material pass constitutes at least
	 * a render call per required renderable.
	 */
	class MaterialPassBase extends NamedAssetBase implements IMaterialPass, IMaterialPassStageGL {
	    private _materialPassData;
	    private _maxLights;
	    private _preserveAlpha;
	    private _includeCasters;
	    private _forceSeparateMVP;
	    private _directionalLightsOffset;
	    private _pointLightsOffset;
	    private _lightProbesOffset;
	    _pNumPointLights: number;
	    _pNumDirectionalLights: number;
	    _pNumLightProbes: number;
	    _pNumLights: number;
	    private _passMode;
	    private _depthCompareMode;
	    private _blendFactorSource;
	    private _blendFactorDest;
	    _pEnableBlending: boolean;
	    _pLightPicker: LightPickerBase;
	    private _writeDepth;
	    private _onLightsChangeDelegate;
	    /**
	     * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
	     */
	    preserveAlpha: boolean;
	    /**
	     * Indicates whether or not shadow casting lights need to be included.
	     */
	    includeCasters: boolean;
	    /**
	     * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
	     * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
	     * projection code.
	     */
	    forceSeparateMVP: boolean;
	    /**
	     * Indicates the offset in the light picker's directional light vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    directionalLightsOffset: number;
	    /**
	     * Indicates the offset in the light picker's point light vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    pointLightsOffset: number;
	    /**
	     * Indicates the offset in the light picker's light probes vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    lightProbesOffset: number;
	    /**
	     *
	     */
	    passMode: number;
	    /**
	     * Creates a new MaterialPassBase object.
	     */
	    constructor(passMode?: number);
	    /**
	     * Factory method to create a concrete shader object for this pass.
	     *
	     * @param profile The compatibility profile used by the renderer.
	     */
	    createShaderObject(profile: string): ShaderObjectBase;
	    /**
	     * Indicate whether this pass should write to the depth buffer or not. Ignored when blending is enabled.
	     */
	    writeDepth: boolean;
	    /**
	     * The depth compare mode used to render the renderables using this material.
	     *
	     * @see away.stagegl.ContextGLCompareMode
	     */
	    depthCompareMode: string;
	    /**
	     * Cleans up any resources used by the current object.
	     * @param deep Indicates whether other resources should be cleaned up, that could potentially be shared across different instances.
	     */
	    dispose(): void;
	    /**
	     * Renders an object to the current render target.
	     *
	     * @private
	     */
	    _iRender(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    /**
	     *
	     *
	     * @param renderable
	     * @param stage
	     * @param camera
	     */
	    setRenderState(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    /**
	     * The blend mode to use when drawing this renderable. The following blend modes are supported:
	     * <ul>
	     * <li>BlendMode.NORMAL: No blending, unless the material inherently needs it</li>
	     * <li>BlendMode.LAYER: Force blending. This will draw the object the same as NORMAL, but without writing depth writes.</li>
	     * <li>BlendMode.MULTIPLY</li>
	     * <li>BlendMode.ADD</li>
	     * <li>BlendMode.ALPHA</li>
	     * </ul>
	     */
	    setBlendMode(value: string): void;
	    /**
	     * Sets the render state for the pass that is independent of the rendered object. This needs to be called before
	     * calling renderPass. Before activating a pass, the previously used pass needs to be deactivated.
	     * @param stage The Stage object which is currently used for rendering.
	     * @param camera The camera from which the scene is viewed.
	     * @private
	     */
	    _iActivate(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	    /**
	     * Clears the render state for the pass. This needs to be called before activating another pass.
	     * @param stage The Stage used for rendering
	     *
	     * @private
	     */
	    _iDeactivate(pass: MaterialPassData, stage: Stage): void;
	    /**
	     * Marks the shader program as invalid, so it will be recompiled before the next render.
	     *
	     * @param updateMaterial Indicates whether the invalidation should be performed on the entire material. Should always pass "true" unless it's called from the material itself.
	     */
	    _pInvalidatePass(): void;
	    /**
	     * The light picker used by the material to provide lights to the material if it supports lighting.
	     *
	     * @see away.materials.LightPickerBase
	     * @see away.materials.StaticLightPicker
	     */
	    lightPicker: LightPickerBase;
	    /**
	     * Called when the light picker's configuration changes.
	     */
	    private onLightsChange(event);
	    /**
	     * Implemented by subclasses if the pass uses lights to update the shader.
	     */
	    pUpdateLights(): void;
	    _iIncludeDependencies(shaderObject: ShaderObjectBase): void;
	    _iInitConstantData(shaderObject: ShaderObjectBase): void;
	    _iGetPreLightingVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPreLightingFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetNormalVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetNormalFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * The amount of point lights that need to be supported.
	     */
	    iNumPointLights: number;
	    /**
	     * The amount of directional lights that need to be supported.
	     */
	    iNumDirectionalLights: number;
	    /**
	     * The amount of light probes that need to be supported.
	     */
	    iNumLightProbes: number;
	    /**
	     * Indicates whether or not normals are calculated at all.
	     */
	    _pOutputsNormals(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * Indicates whether or not normals are calculated in tangent space.
	     */
	    _pOutputsTangentNormals(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * Indicates whether or not normals are allowed in tangent space. This is only the case if no object-space
	     * dependencies exist.
	     */
	    _pUsesTangentSpace(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * Calculates the amount of directional lights this material will support.
	     * @param numDirectionalLights The maximum amount of directional lights to support.
	     * @return The amount of directional lights this material will support, bounded by the amount necessary.
	     */
	    private calculateNumDirectionalLights(numDirectionalLights);
	    /**
	     * Calculates the amount of point lights this material will support.
	     * @param numDirectionalLights The maximum amount of point lights to support.
	     * @return The amount of point lights this material will support, bounded by the amount necessary.
	     */
	    private calculateNumPointLights(numPointLights);
	    /**
	     * Calculates the amount of light probes this material will support.
	     * @param numDirectionalLights The maximum amount of light probes to support.
	     * @return The amount of light probes this material will support, bounded by the amount necessary.
	     */
	    private calculateNumProbes(numLightProbes);
	    _iAddMaterialPassData(materialPassData: MaterialPassData): MaterialPassData;
	    _iRemoveMaterialPassData(materialPassData: MaterialPassData): MaterialPassData;
	}
	export = MaterialPassBase;
	
}
declare module "awayjs-stagegl/lib/pool/MaterialPassDataPool" {
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import StageGLMaterialBase = require("materials/StageGLMaterialBase");
	import MaterialPassBase = require("materials/passes/MaterialPassBase");
	/**
	 * @class away.pool.MaterialPassDataPool
	 */
	class MaterialPassDataPool {
	    private _pool;
	    private _material;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor(material: StageGLMaterialBase);
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     * @returns ITexture
	     */
	    getItem(materialPass: MaterialPassBase): MaterialPassData;
	    /**
	     * //TODO
	     *
	     * @param materialOwner
	     */
	    disposeItem(materialPass: MaterialPassBase): void;
	    disposePool(): void;
	}
	export = MaterialPassDataPool;
	
}
declare module "awayjs-stagegl/lib/pool/ProgramDataPool" {
	import ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	/**
	 * @class away.pool.ProgramDataPool
	 */
	class ProgramDataPool {
	    private _pool;
	    private _context;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor(context: ContextGLBase);
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
declare module "awayjs-stagegl/lib/base/IProgram" {
	import ByteArray = require("awayjs-core/lib/utils/ByteArray");
	interface IProgram {
	    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): any;
	    dispose(): any;
	}
	export = IProgram;
	
}
declare module "awayjs-stagegl/lib/pool/ProgramData" {
	import ProgramDataPool = require("awayjs-stagegl/lib/pool/ProgramDataPool");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	/**
	 *
	 * @class away.pool.ProgramDataBase
	 */
	class ProgramData {
	    static PROGRAMDATA_ID_COUNT: number;
	    private _pool;
	    private _key;
	    context: ContextGLBase;
	    usages: number;
	    program: IProgram;
	    id: number;
	    constructor(pool: ProgramDataPool, context: ContextGLBase, key: string);
	    /**
	     *
	     */
	    dispose(): void;
	}
	export = ProgramData;
	
}
declare module "awayjs-stagegl/lib/pool/MaterialPassData" {
	import IMaterialPassData = require("awayjs-display/lib/pool/IMaterialPassData");
	import MaterialPassDataPool = require("awayjs-stagegl/lib/pool/MaterialPassDataPool");
	import ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
	import StageGLMaterialBase = require("materials/StageGLMaterialBase");
	import MaterialPassBase = require("materials/passes/MaterialPassBase");
	import ShaderObjectBase = require("materials/compilation/ShaderObjectBase");
	/**
	 *
	 * @class away.pool.MaterialPassData
	 */
	class MaterialPassData implements IMaterialPassData {
	    private _pool;
	    material: StageGLMaterialBase;
	    shaderObject: ShaderObjectBase;
	    materialPass: MaterialPassBase;
	    programData: ProgramData;
	    shadedTarget: string;
	    vertexCode: string;
	    postAnimationFragmentCode: string;
	    fragmentCode: string;
	    animationVertexCode: string;
	    animationFragmentCode: string;
	    key: string;
	    invalid: boolean;
	    usesAnimation: boolean;
	    constructor(pool: MaterialPassDataPool, material: StageGLMaterialBase, materialPass: MaterialPassBase);
	    /**
	     *
	     */
	    dispose(): void;
	    /**
	     *
	     */
	    invalidate(): void;
	}
	export = MaterialPassData;
	
}
declare module "awayjs-stagegl/lib/pool/MaterialData" {
	import IMaterialData = require("awayjs-display/lib/pool/IMaterialData");
	import MaterialDataPool = require("awayjs-stagegl/lib/pool/MaterialDataPool");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import StageGLMaterialBase = require("materials/StageGLMaterialBase");
	import MaterialPassBase = require("materials/passes/MaterialPassBase");
	/**
	 *
	 * @class away.pool.MaterialData
	 */
	class MaterialData implements IMaterialData {
	    private _pool;
	    private _materialPassDataPool;
	    private _passes;
	    context: ContextGLBase;
	    material: StageGLMaterialBase;
	    renderOrderId: number;
	    invalidAnimation: boolean;
	    constructor(pool: MaterialDataPool, context: ContextGLBase, material: StageGLMaterialBase);
	    getMaterialPass(materialPass: MaterialPassBase, profile: string): MaterialPassData;
	    getMaterialPasses(profile: string): MaterialPassData[];
	    /**
	     *
	     */
	    dispose(): void;
	    /**
	     *
	     */
	    invalidateMaterial(): void;
	    /**
	     *
	     */
	    invalidateAnimation(): void;
	}
	export = MaterialData;
	
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
declare module "awayjs-stagegl/lib/base/IContextStageGL" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import CubeTextureBase = require("awayjs-core/lib/textures/CubeTextureBase");
	import RenderTexture = require("awayjs-core/lib/textures/RenderTexture");
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import IContext = require("awayjs-display/lib/display/IContext");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import MaterialBase = require("awayjs-display/lib/materials/MaterialBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	import MaterialData = require("awayjs-stagegl/lib/pool/MaterialData");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import VertexData = require("awayjs-stagegl/lib/pool/VertexData");
	import ICubeTexture = require("awayjs-stagegl/lib/base/ICubeTexture");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	interface IContextStageGL extends IContext {
	    setRenderTarget(target: TextureProxyBase, enableDepthAndStencil?: boolean, surfaceSelector?: number): any;
	    getRenderTexture(textureProxy: RenderTexture): ITextureBase;
	    activateBuffer(index: number, buffer: VertexData, offset: number, format: string): any;
	    disposeVertexData(buffer: VertexData): any;
	    activateMaterialPass(materialPassData: MaterialPassData, stage: Stage, camera: Camera): any;
	    activateRenderTexture(index: number, textureProxy: RenderTexture): any;
	    activateTexture(index: number, textureProxy: Texture2DBase): any;
	    activateCubeTexture(index: number, textureProxy: CubeTextureBase): any;
	    getIndexBuffer(buffer: IndexData): IIndexBuffer;
	    getMaterial(material: MaterialBase, profile: string): MaterialData;
	    disposeIndexData(buffer: IndexData): any;
	    clear(red?: number, green?: number, blue?: number, alpha?: number, depth?: number, stencil?: number, mask?: number): any;
	    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean): any;
	    createCubeTexture(size: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ICubeTexture;
	    createIndexBuffer(numIndices: number): IIndexBuffer;
	    createProgram(): IProgram;
	    createTexture(width: number, height: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ITexture;
	    createVertexBuffer(numVertices: number, data32PerVertex: number): IVertexBuffer;
	    deactivateMaterialPass(materialPassData: MaterialPassData, stage: Stage): any;
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
	    calcAnimationCode(material: MaterialBase, materialPassData: MaterialPassData): any;
	}
	export = IContextStageGL;
	
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
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import CubeTextureWebGL = require("awayjs-stagegl/lib/base/CubeTextureWebGL");
	import IContextStageGL = require("awayjs-stagegl/lib/base/IContextStageGL");
	import IndexBufferWebGL = require("awayjs-stagegl/lib/base/IndexBufferWebGL");
	import ProgramWebGL = require("awayjs-stagegl/lib/base/ProgramWebGL");
	import TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
	import TextureWebGL = require("awayjs-stagegl/lib/base/TextureWebGL");
	import VertexBufferWebGL = require("awayjs-stagegl/lib/base/VertexBufferWebGL");
	class ContextWebGL extends ContextGLBase implements IContextStageGL {
	    private _blendFactorDictionary;
	    private _depthTestDictionary;
	    private _textureIndexDictionary;
	    private _textureTypeDictionary;
	    private _wrapDictionary;
	    private _filterDictionary;
	    private _mipmapFilterDictionary;
	    private _uniformLocationNameDictionary;
	    private _vertexBufferDimensionDictionary;
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
	    constructor(canvas: HTMLCanvasElement, stageIndex: number);
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
declare module "awayjs-stagegl/lib/base/Stage" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import IContext = require("awayjs-display/lib/display/IContext");
	import StageManager = require("managers/StageManager");
	/**
	 * Stage provides a proxy class to handle the creation and attachment of the Context
	 * (and in turn the back buffer) it uses. Stage should never be created directly,
	 * but requested through StageManager.
	 *
	 * @see away.managers.StageManager
	 *
	 */
	class Stage extends EventDispatcher {
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
	    context: IContext;
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
declare module "awayjs-stagegl/lib/pool/TextureDataPool" {
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import TextureData = require("awayjs-stagegl/lib/pool/TextureData");
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	/**
	 * @class away.pool.TextureDataPool
	 */
	class TextureDataPool {
	    private _pool;
	    private _context;
	    /**
	     * //TODO
	     *
	     * @param textureDataClass
	     */
	    constructor(context: ContextGLBase);
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
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	/**
	 *
	 * @class away.pool.TextureDataBase
	 */
	class TextureData implements ITextureData {
	    private _pool;
	    context: ContextGLBase;
	    texture: ITextureBase;
	    textureProxy: TextureProxyBase;
	    invalid: boolean;
	    constructor(pool: TextureDataPool, context: ContextGLBase, textureProxy: TextureProxyBase);
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
declare module "awayjs-stagegl/lib/base/ContextGLBase" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import CubeTextureBase = require("awayjs-core/lib/textures/CubeTextureBase");
	import RenderTexture = require("awayjs-core/lib/textures/RenderTexture");
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import IContext = require("awayjs-display/lib/display/IContext");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IndexData = require("awayjs-stagegl/lib/pool/IndexData");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
	import MaterialData = require("awayjs-stagegl/lib/pool/MaterialData");
	import VertexData = require("awayjs-stagegl/lib/pool/VertexData");
	import ICubeTexture = require("awayjs-stagegl/lib/base/ICubeTexture");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import ITextureBase = require("awayjs-stagegl/lib/base/ITextureBase");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	/**
	 * Stage provides a proxy class to handle the creation and attachment of the Context
	 * (and in turn the back buffer) it uses. Stage should never be created directly,
	 * but requested through StageManager.
	 *
	 * @see away.managers.StageManager
	 *
	 */
	class ContextGLBase implements IContext {
	    private _programData;
	    private _numUsedStreams;
	    private _numUsedTextures;
	    _pContainer: HTMLElement;
	    private _texturePool;
	    private _materialDataPool;
	    private _programDataPool;
	    private _width;
	    private _height;
	    private _stageIndex;
	    private _antiAlias;
	    private _enableDepthAndStencil;
	    private _renderTarget;
	    private _renderSurfaceSelector;
	    container: HTMLElement;
	    constructor(stageIndex: number);
	    setRenderTarget(target: TextureProxyBase, enableDepthAndStencil?: boolean, surfaceSelector?: number): void;
	    getRenderTexture(textureProxy: RenderTexture): ITextureBase;
	    getProgram(materialPassData: MaterialPassData): ProgramData;
	    /**
	     *
	     * @param material
	     */
	    getMaterial(material: StageGLMaterialBase, profile: string): MaterialData;
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
	    activateMaterialPass(materialPassData: MaterialPassData, stage: Stage, camera: Camera): void;
	    deactivateMaterialPass(materialPassData: MaterialPassData, stage: Stage): void;
	    activateTexture(index: number, textureProxy: Texture2DBase): void;
	    activateCubeTexture(index: number, textureProxy: CubeTextureBase): void;
	    /**
	     * Retrieves the VertexBuffer object that contains triangle indices.
	     * @param context The ContextWeb for which we request the buffer
	     * @return The VertexBuffer object that contains triangle indices.
	     */
	    getIndexBuffer(buffer: IndexData): IIndexBuffer;
	    disposeIndexData(buffer: IndexData): void;
	    clear(red?: number, green?: number, blue?: number, alpha?: number, depth?: number, stencil?: number, mask?: number): void;
	    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean): void;
	    createIndexBuffer(numIndices: number): IIndexBuffer;
	    createVertexBuffer(numVertices: number, data32PerVertex: number): IVertexBuffer;
	    createTexture(width: number, height: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ITexture;
	    createCubeTexture(size: number, format: string, optimizeForRenderToTexture: boolean, streamingLevels?: number): ICubeTexture;
	    createProgram(): IProgram;
	    dispose(): void;
	    present(): void;
	    setRenderToTexture(target: ITextureBase, enableDepthAndStencil?: boolean, antiAlias?: number, surfaceSelector?: number): void;
	    setRenderToBackBuffer(): void;
	    setScissorRectangle(rectangle: Rectangle): void;
	    setTextureAt(sampler: number, texture: ITextureBase): void;
	    setVertexBufferAt(index: number, buffer: IVertexBuffer, bufferOffset?: number, format?: string): void;
	    setProgram(program: IProgram): void;
	    registerProgram(programData: ProgramData): void;
	    unRegisterProgram(programData: ProgramData): void;
	    /**
	     * test if animation will be able to run on gpu BEFORE compiling materials
	     * test if the shader objects supports animating the animation set in the vertex shader
	     * if any object using this material fails to support accelerated animations for any of the shader objects,
	     * we should do everything on cpu (otherwise we have the cost of both gpu + cpu animations)
	     */
	    private getEnabledGPUAnimation(material, materialDataPasses);
	    calcAnimationCode(material: StageGLMaterialBase, materialPassData: MaterialPassData): void;
	}
	export = ContextGLBase;
	
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
	import ContextGLBase = require("awayjs-stagegl/lib/base/ContextGLBase");
	import CubeTextureFlash = require("awayjs-stagegl/lib/base/CubeTextureFlash");
	import IContextStageGL = require("awayjs-stagegl/lib/base/IContextStageGL");
	import IndexBufferFlash = require("awayjs-stagegl/lib/base/IndexBufferFlash");
	import ProgramFlash = require("awayjs-stagegl/lib/base/ProgramFlash");
	import TextureFlash = require("awayjs-stagegl/lib/base/TextureFlash");
	import ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
	import VertexBufferFlash = require("awayjs-stagegl/lib/base/VertexBufferFlash");
	class ContextStage3D extends ContextGLBase implements IContextStageGL {
	    static contexts: Object;
	    static maxvertexconstants: number;
	    static maxfragconstants: number;
	    static maxtemp: number;
	    static maxstreams: number;
	    static maxtextures: number;
	    static defaultsampler: Sampler;
	    _iDriverInfo: any;
	    private _cmdStream;
	    private _errorCheckingEnabled;
	    private _resources;
	    private _oldCanvas;
	    private _oldParent;
	    static debug: boolean;
	    static logStream: boolean;
	    _iCallback: (context: IContextStageGL) => void;
	    container: HTMLElement;
	    driverInfo: any;
	    errorCheckingEnabled: boolean;
	    constructor(container: HTMLCanvasElement, stageIndex: number, callback: (context: IContextStageGL) => void, include?: Sampler);
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
declare module "awayjs-stagegl/lib/events/ShadingMethodEvent" {
	import Event = require("awayjs-core/lib/events/Event");
	class ShadingMethodEvent extends Event {
	    static SHADER_INVALIDATED: string;
	    constructor(type: string);
	}
	export = ShadingMethodEvent;
	
}
declare module "awayjs-stagegl/lib/filters/tasks/Filter3DTaskBase" {
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IProgram = require("awayjs-stagegl/lib/base/IProgram");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	class Filter3DTaskBase {
	    private _mainInputTexture;
	    private _scaledTextureWidth;
	    private _scaledTextureHeight;
	    private _textureWidth;
	    private _textureHeight;
	    private _textureDimensionsInvalid;
	    private _program3DInvalid;
	    private _program3D;
	    private _target;
	    private _requireDepthRender;
	    private _textureScale;
	    constructor(requireDepthRender?: boolean);
	    /**
	     * The texture scale for the input of this texture. This will define the output of the previous entry in the chain
	     */
	    textureScale: number;
	    target: ITexture;
	    textureWidth: number;
	    textureHeight: number;
	    getMainInputTexture(stage: Stage): ITexture;
	    dispose(): void;
	    pInvalidateProgram(): void;
	    pUpdateProgram(stage: Stage): void;
	    pGetVertexCode(): string;
	    pGetFragmentCode(): string;
	    pUpdateTextures(stage: Stage): void;
	    getProgram(stage: Stage): IProgram;
	    activate(stage: Stage, camera: Camera, depthTexture: ITexture): void;
	    deactivate(stage: Stage): void;
	    requireDepthRender: boolean;
	}
	export = Filter3DTaskBase;
	
}
declare module "awayjs-stagegl/lib/filters/Filter3DBase" {
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import Filter3DTaskBase = require("awayjs-stagegl/lib/filters/tasks/Filter3DTaskBase");
	class Filter3DBase {
	    private _tasks;
	    private _requireDepthRender;
	    private _textureWidth;
	    private _textureHeight;
	    constructor();
	    requireDepthRender: boolean;
	    pAddTask(filter: Filter3DTaskBase): void;
	    tasks: Filter3DTaskBase[];
	    getMainInputTexture(stage: Stage): ITexture;
	    textureWidth: number;
	    textureHeight: number;
	    setRenderTargets(mainTarget: ITexture, stage: Stage): void;
	    dispose(): void;
	    update(stage: Stage, camera: Camera): void;
	}
	export = Filter3DBase;
	
}
declare module "awayjs-stagegl/lib/managers/RTTBufferManager" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IIndexBuffer = require("awayjs-stagegl/lib/base/IIndexBuffer");
	import IVertexBuffer = require("awayjs-stagegl/lib/base/IVertexBuffer");
	class RTTBufferManager extends EventDispatcher {
	    private static _instances;
	    private _renderToTextureVertexBuffer;
	    private _renderToScreenVertexBuffer;
	    private _indexBuffer;
	    private _stage;
	    private _viewWidth;
	    private _viewHeight;
	    private _textureWidth;
	    private _textureHeight;
	    private _renderToTextureRect;
	    private _buffersInvalid;
	    private _textureRatioX;
	    private _textureRatioY;
	    constructor(stage: Stage);
	    static getInstance(stage: Stage): RTTBufferManager;
	    private static getRTTBufferManagerFromStage(stage);
	    private static deleteRTTBufferManager(stage);
	    textureRatioX: number;
	    textureRatioY: number;
	    viewWidth: number;
	    viewHeight: number;
	    renderToTextureVertexBuffer: IVertexBuffer;
	    renderToScreenVertexBuffer: IVertexBuffer;
	    indexBuffer: IIndexBuffer;
	    renderToTextureRect: Rectangle;
	    textureWidth: number;
	    textureHeight: number;
	    dispose(): void;
	    private updateRTTBuffers();
	}
	export = RTTBufferManager;
	
}
declare module "awayjs-stagegl/lib/materials/passes/LineBasicPass" {
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * LineBasicPass is a material pass that draws wireframe segments.
	 */
	class LineBasicPass extends MaterialPassBase {
	    /**
	     * Creates a new SegmentPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor();
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, regCache: ShaderRegisterCache, sharedReg: ShaderRegisterData): string;
	}
	export = LineBasicPass;
	
}
declare module "awayjs-stagegl/lib/materials/LineBasicMaterial" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	/**
	 * LineMaterial is a material exclusively used to render wireframe objects
	 *
	 * @see away.entities.Lines
	 */
	class LineBasicMaterial extends StageGLMaterialBase {
	    static pONE_VECTOR: number[];
	    static pFRONT_VECTOR: number[];
	    private _constants;
	    private _calcMatrix;
	    private _thickness;
	    private _screenPass;
	    /**
	     * Creates a new LineMaterial object.
	     *
	     * @param thickness The thickness of the wireframe lines.
	     */
	    constructor(thickness?: number);
	    /**
	     * @inheritDoc
	     */
	    _iGetVertexCode(shaderObject: ShaderObjectBase, regCache: ShaderRegisterCache, sharedReg: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iActivatePass(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	    /**
	     * @inheritDoc
	     */
	    _iRenderPass(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	}
	export = LineBasicMaterial;
	
}
declare module "awayjs-stagegl/lib/materials/passes/ILightingPassStageGL" {
	import LightPickerBase = require("awayjs-display/lib/materials/lightpickers/LightPickerBase");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import IMaterialPassStageGL = require("awayjs-stagegl/lib/materials/passes/IMaterialPassStageGL");
	interface ILightingPassStageGL extends IMaterialPassStageGL {
	    /**
	     * The amount of point lights that need to be supported.
	     */
	    iNumPointLights: number;
	    /**
	     * The amount of directional lights that need to be supported.
	     */
	    iNumDirectionalLights: number;
	    /**
	     * The amount of light probes that need to be supported.
	     */
	    iNumLightProbes: number;
	    /**
	     * Indicates the offset in the light picker's directional light vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    directionalLightsOffset: number;
	    /**
	     * Indicates the offset in the light picker's point light vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    pointLightsOffset: number;
	    /**
	     * Indicates the offset in the light picker's light probes vector for which to start including lights.
	     * This needs to be set before the light picker is assigned.
	     */
	    lightProbesOffset: number;
	    /**
	     * The light picker used by the material to provide lights to the material if it supports lighting.
	     *
	     * @see away.materials.LightPickerBase
	     * @see away.materials.StaticLightPicker
	     */
	    lightPicker: LightPickerBase;
	    _iUsesSpecular(): any;
	    _iUsesShadows(): any;
	    _iGetPerLightDiffuseFragmentCode(shaderObject: ShaderLightingObject, lightDirReg: ShaderRegisterElement, diffuseColorReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerLightSpecularFragmentCode(shaderObject: ShaderLightingObject, lightDirReg: ShaderRegisterElement, specularColorReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerProbeDiffuseFragmentCode(shaderObject: ShaderLightingObject, texReg: ShaderRegisterElement, weightReg: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerProbeSpecularFragmentCode(shaderObject: ShaderLightingObject, texReg: ShaderRegisterElement, weightReg: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPostLightingVertexCode(shaderObject: ShaderLightingObject, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPostLightingFragmentCode(shaderObject: ShaderLightingObject, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	}
	export = ILightingPassStageGL;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderLightingCompiler" {
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderCompilerBase = require("awayjs-stagegl/lib/materials/compilation/ShaderCompilerBase");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ILightingPassStageGL = require("awayjs-stagegl/lib/materials/passes/ILightingPassStageGL");
	/**
	 * ShaderCompilerBase is an abstract base class for shader compilers that use modular shader methods to assemble a
	 * material. Concrete subclasses are used by the default materials.
	 *
	 * @see away.materials.ShadingMethodBase
	 */
	class ShaderLightingCompiler extends ShaderCompilerBase {
	    private _materialLightingPass;
	    private _shaderLightingObject;
	    _pointLightFragmentConstants: ShaderRegisterElement[];
	    _pointLightVertexConstants: ShaderRegisterElement[];
	    _dirLightFragmentConstants: ShaderRegisterElement[];
	    _dirLightVertexConstants: ShaderRegisterElement[];
	    _pNumProbeRegisters: number;
	    /**
	     * Creates a new ShaderCompilerBase object.
	     * @param profile The compatibility profile of the renderer.
	     */
	    constructor(material: StageGLMaterialBase, materialPass: ILightingPassStageGL, shaderObject: ShaderLightingObject);
	    /**
	     * Compile the code for the methods.
	     */
	    pCompileDependencies(): void;
	    /**
	     * Provides the code to provide shadow mapping.
	     */
	    pCompileShadowCode(): void;
	    /**
	     * Initializes constant registers to contain light data.
	     */
	    private initLightRegisters();
	    /**
	     * Compiles the shading code for directional and point lights.
	     */
	    private compileLightCode();
	    /**
	     * Compiles shading code for light probes.
	     */
	    private compileLightProbeCode();
	    /**
	     * Reset all the indices to "unused".
	     */
	    pInitRegisterIndices(): void;
	    /**
	     * Figure out which named registers are required, and how often.
	     */
	    pCalculateDependencies(): void;
	}
	export = ShaderLightingCompiler;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/ShaderLightingObject" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import LightPickerBase = require("awayjs-display/lib/materials/lightpickers/LightPickerBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderCompilerBase = require("awayjs-stagegl/lib/materials/compilation/ShaderCompilerBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ILightingPassStageGL = require("awayjs-stagegl/lib/materials/passes/ILightingPassStageGL");
	/**
	 * ShaderObjectBase keeps track of the number of dependencies for "named registers" used across a pass.
	 * Named registers are that are not necessarily limited to a single method. They are created by the compiler and
	 * passed on to methods. The compiler uses the results to reserve usages through RegisterPool, which can be removed
	 * each time a method has been compiled into the shader.
	 *
	 * @see RegisterPool.addUsage
	 */
	class ShaderLightingObject extends ShaderObjectBase {
	    /**
	     * The first index for the fragment constants containing the light data.
	     */
	    lightFragmentConstantIndex: number;
	    /**
	     * The starting index if the vertex constant to which light data needs to be uploaded.
	     */
	    lightVertexConstantIndex: number;
	    /**
	     * Indices for the light probe diffuse textures.
	     */
	    lightProbeDiffuseIndices: number[];
	    /**
	     * Indices for the light probe specular textures.
	     */
	    lightProbeSpecularIndices: number[];
	    /**
	     * The index of the fragment constant containing the weights for the light probes.
	     */
	    probeWeightsIndex: number;
	    numLights: number;
	    usesLightFallOff: boolean;
	    usesShadows: boolean;
	    numPointLights: number;
	    numDirectionalLights: number;
	    numLightProbes: number;
	    pointLightsOffset: number;
	    directionalLightsOffset: number;
	    lightProbesOffset: number;
	    lightPicker: LightPickerBase;
	    /**
	     * Indicates whether the shader uses any lights.
	     */
	    usesLights: boolean;
	    /**
	     * Indicates whether the shader uses any light probes.
	     */
	    usesProbes: boolean;
	    /**
	     * Indicates whether the lights uses any specular components.
	     */
	    usesLightsForSpecular: boolean;
	    /**
	     * Indicates whether the probes uses any specular components.
	     */
	    usesProbesForSpecular: boolean;
	    /**
	     * Indicates whether the lights uses any diffuse components.
	     */
	    usesLightsForDiffuse: boolean;
	    /**
	     * Indicates whether the probes uses any diffuse components.
	     */
	    usesProbesForDiffuse: boolean;
	    /**
	     * Creates a new MethodCompilerVO object.
	     */
	    constructor(profile: any);
	    /**
	     * Factory method to create a concrete compiler object for this object
	     *
	     * @param materialPassVO
	     * @returns {away.materials.ShaderLightingCompiler}
	     */
	    createCompiler(material: StageGLMaterialBase, materialPass: ILightingPassStageGL): ShaderCompilerBase;
	    /**
	     * Clears dependency counts for all registers. Called when recompiling a pass.
	     */
	    reset(): void;
	    /**
	     * Adds any external world space dependencies, used to force world space calculations.
	     */
	    addWorldSpaceDependencies(fragmentLights: boolean): void;
	    /**
	     *
	     *
	     * @param renderable
	     * @param stage
	     * @param camera
	     */
	    setRenderState(renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    /**
	     * Updates constant data render state used by the lights. This method is optional for subclasses to implement.
	     */
	    private updateLights();
	    /**
	     * Updates constant data render state used by the light probes. This method is optional for subclasses to implement.
	     */
	    private updateProbes(stage);
	}
	export = ShaderLightingObject;
	
}
declare module "awayjs-stagegl/lib/materials/passes/SkyboxPass" {
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * SkyboxPass provides a material pass exclusively used to render sky boxes from a cube texture.
	 */
	class SkyboxPass extends MaterialPassBase {
	    /**
	     * Creates a new SkyboxPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor();
	    _iIncludeDependencies(shaderObject: ShaderLightingObject): void;
	}
	export = SkyboxPass;
	
}
declare module "awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper" {
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	class ShaderCompilerHelper {
	    /**
	     * A helper method that generates standard code for sampling from a texture using the normal uv coordinates.
	     * @param vo The MethodVO object linking this method with the pass currently being compiled.
	     * @param sharedReg The shared register object for the shader.
	     * @param inputReg The texture stream register.
	     * @param texture The texture which will be assigned to the given slot.
	     * @param uvReg An optional uv register if coordinates different from the primary uv coordinates are to be used.
	     * @param forceWrap If true, texture wrapping is enabled regardless of the material setting.
	     * @return The fragment code that performs the sampling.
	     *
	     * @protected
	     */
	    static getTex2DSampleCode(targetReg: ShaderRegisterElement, sharedReg: ShaderRegisterData, inputReg: ShaderRegisterElement, texture: TextureProxyBase, smooth: boolean, repeat: boolean, mipmaps: boolean, uvReg?: ShaderRegisterElement, forceWrap?: string): string;
	    /**
	     * A helper method that generates standard code for sampling from a cube texture.
	     * @param vo The MethodVO object linking this method with the pass currently being compiled.
	     * @param targetReg The register in which to store the sampled colour.
	     * @param inputReg The texture stream register.
	     * @param texture The cube map which will be assigned to the given slot.
	     * @param uvReg The direction vector with which to sample the cube map.
	     *
	     * @protected
	     */
	    static getTexCubeSampleCode(targetReg: ShaderRegisterElement, inputReg: ShaderRegisterElement, texture: TextureProxyBase, smooth: boolean, mipmaps: boolean, uvReg: ShaderRegisterElement): string;
	    /**
	     * Generates a texture format string for the sample instruction.
	     * @param texture The texture for which to get the format string.
	     * @return
	     *
	     * @protected
	     */
	    static getFormatStringForTexture(texture: TextureProxyBase): string;
	}
	export = ShaderCompilerHelper;
	
}
declare module "awayjs-stagegl/lib/materials/SkyboxMaterial" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import CubeTextureBase = require("awayjs-core/lib/textures/CubeTextureBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	/**
	 * SkyboxMaterial is a material exclusively used to render skyboxes
	 *
	 * @see away3d.primitives.Skybox
	 */
	class SkyboxMaterial extends StageGLMaterialBase {
	    private _vertexData;
	    private _cubeMap;
	    private _skyboxPass;
	    /**
	     * Creates a new SkyboxMaterial object.
	     * @param cubeMap The CubeMap to use as the skybox.
	     */
	    constructor(cubeMap: CubeTextureBase, smooth?: boolean, repeat?: boolean, mipmap?: boolean);
	    /**
	     * The cube texture to use as the skybox.
	     */
	    cubeMap: CubeTextureBase;
	    /**
	     * @inheritDoc
	     */
	    _iGetVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iActivatePass(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	    /**
	     * @inheritDoc
	     */
	    _iRenderPass(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	}
	export = SkyboxMaterial;
	
}
declare module "awayjs-stagegl/lib/materials/passes/TriangleBasicPass" {
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
	 * using material methods to define their appearance.
	 */
	class TriangleBasicPass extends MaterialPassBase {
	    private _diffuseColor;
	    private _diffuseR;
	    private _diffuseG;
	    private _diffuseB;
	    private _diffuseA;
	    private _fragmentConstantsIndex;
	    private _texturesIndex;
	    /**
	     * The alpha component of the diffuse reflection.
	     */
	    diffuseAlpha: number;
	    /**
	     * The color of the diffuse reflection when not using a texture.
	     */
	    diffuseColor: number;
	    /**
	     * Creates a new CompiledPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor();
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, regCache: ShaderRegisterCache, sharedReg: ShaderRegisterData): string;
	    _iIncludeDependencies(dependencyCounter: ShaderObjectBase): void;
	    /**
	     * @inheritDoc
	     */
	    _iActivate(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	}
	export = TriangleBasicPass;
	
}
declare module "awayjs-stagegl/lib/materials/TriangleMaterialBase" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
	/**
	 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
	 * using material methods to define their appearance.
	 */
	class TriangleMaterialBase extends StageGLMaterialBase {
	    _iGetVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iRenderPass(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	}
	export = TriangleMaterialBase;
	
}
declare module "awayjs-stagegl/lib/materials/TriangleBasicMaterial" {
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import TriangleMaterialBase = require("awayjs-stagegl/lib/materials/TriangleMaterialBase");
	/**
	 * TriangleMaterial forms an abstract base class for the default shaded materials provided by Stage,
	 * using material methods to define their appearance.
	 */
	class TriangleBasicMaterial extends TriangleMaterialBase {
	    private _screenPass;
	    private _alphaBlending;
	    private _alpha;
	    private _depthCompareMode;
	    /**
	     * Creates a new TriangleMaterial object.
	     *
	     * @param texture The texture used for the material's albedo color.
	     * @param smooth Indicates whether the texture should be filtered when sampled. Defaults to true.
	     * @param repeat Indicates whether the texture should be tiled when sampled. Defaults to false.
	     * @param mipmap Indicates whether or not any used textures should use mipmapping. Defaults to false.
	     */
	    constructor(texture?: Texture2DBase, smooth?: boolean, repeat?: boolean, mipmap?: boolean);
	    constructor(color?: number, alpha?: number);
	    /**
	     * The depth compare mode used to render the renderables using this material.
	     *
	     * @see away.stagegl.ContextGLCompareMode
	     */
	    depthCompareMode: string;
	    /**
	     * The alpha of the surface.
	     */
	    alpha: number;
	    /**
	     * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
	     * example when using textures of foliage, consider using alphaThreshold instead.
	     */
	    alphaBlending: boolean;
	    /**
	     * @inheritDoc
	     */
	    iUpdateMaterial(): void;
	    /**
	     * Updates screen passes when they were found to be invalid.
	     */
	    pUpdateScreenPasses(): void;
	    /**
	     * Initializes all the passes and their dependent passes.
	     */
	    private initPasses();
	    /**
	     * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
	     */
	    private setBlendAndCompareModes();
	}
	export = TriangleBasicMaterial;
	
}
declare module "awayjs-stagegl/lib/materials/TriangleMaterialMode" {
	class TriangleMaterialMode {
	    /**
	     *
	     */
	    static SINGLE_PASS: string;
	    /**
	     *
	     */
	    static MULTI_PASS: string;
	}
	export = TriangleMaterialMode;
	
}
declare module "awayjs-stagegl/lib/materials/methods/ShadingMethodBase" {
	import NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * ShadingMethodBase provides an abstract base method for shading methods, used by compiled passes to compile
	 * the final shading program.
	 */
	class ShadingMethodBase extends NamedAssetBase {
	    _passes: MaterialPassBase[];
	    /**
	     * Create a new ShadingMethodBase object.
	     */
	    constructor();
	    iIsUsed(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * Initializes the properties for a MethodVO, including register and texture indices.
	     *
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     *
	     * @internal
	     */
	    iInitVO(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * Initializes unchanging shader constants using the data from a MethodVO.
	     *
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     *
	     * @internal
	     */
	    iInitConstants(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * Indicates whether or not this method expects normals in tangent space. Override for object-space normals.
	     */
	    iUsesTangentSpace(): boolean;
	    /**
	     * Any passes required that render to a texture used by this method.
	     */
	    passes: MaterialPassBase[];
	    /**
	     * Cleans up any resources used by the current object.
	     */
	    dispose(): void;
	    /**
	     * Resets the compilation state of the method.
	     *
	     * @internal
	     */
	    iReset(): void;
	    /**
	     * Resets the method's state for compilation.
	     *
	     * @internal
	     */
	    iCleanCompilationData(): void;
	    /**
	     * Get the vertex shader code for this method.
	     * @param vo The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     *
	     * @internal
	     */
	    iGetVertexCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Sets the render state for this method.
	     *
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param stage The Stage object currently used for rendering.
	     *
	     * @internal
	     */
	    iActivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Sets the render state for a single renderable.
	     *
	     * @param vo The MethodVO object linking this method with the pass currently being compiled.
	     * @param renderable The renderable currently being rendered.
	     * @param stage The Stage object currently used for rendering.
	     * @param camera The camera from which the scene is currently rendered.
	     *
	     * @internal
	     */
	    iSetRenderState(shaderObject: ShaderObjectBase, methodVO: MethodVO, renderable: RenderableBase, stage: Stage, camera: Camera): void;
	    /**
	     * Clears the render state for this method.
	     * @param vo The MethodVO object linking this method with the pass currently being compiled.
	     * @param stage The Stage object currently used for rendering.
	     *
	     * @internal
	     */
	    iDeactivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Marks the shader program as invalid, so it will be recompiled before the next render.
	     *
	     * @internal
	     */
	    iInvalidateShaderProgram(): void;
	    /**
	     * Copies the state from a ShadingMethodBase object into the current object.
	     */
	    copyFrom(method: ShadingMethodBase): void;
	}
	export = ShadingMethodBase;
	
}
declare module "awayjs-stagegl/lib/materials/compilation/MethodVO" {
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * MethodVO contains data for a given shader object for the use within a single material.
	 * This allows shader methods to be shared across materials while their non-public state differs.
	 */
	class MethodVO {
	    useMethod: boolean;
	    method: ShadingMethodBase;
	    texturesIndex: number;
	    secondaryTexturesIndex: number;
	    vertexConstantsIndex: number;
	    secondaryVertexConstantsIndex: number;
	    fragmentConstantsIndex: number;
	    secondaryFragmentConstantsIndex: number;
	    needsProjection: boolean;
	    needsView: boolean;
	    needsNormals: boolean;
	    needsTangents: boolean;
	    needsUV: boolean;
	    needsSecondaryUV: boolean;
	    needsGlobalVertexPos: boolean;
	    needsGlobalFragmentPos: boolean;
	    usesTexture: boolean;
	    /**
	     * Creates a new MethodVO object.
	     */
	    constructor(method: ShadingMethodBase);
	    /**
	     * Resets the values of the value object to their "unused" state.
	     */
	    reset(): void;
	}
	export = MethodVO;
	
}
declare module "awayjs-stagegl/lib/materials/methods/AmbientBasicMethod" {
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * AmbientBasicMethod provides the default shading method for uniform ambient lighting.
	 */
	class AmbientBasicMethod extends ShadingMethodBase {
	    private _color;
	    private _alpha;
	    private _colorR;
	    private _colorG;
	    private _colorB;
	    private _ambient;
	    /**
	     * Creates a new AmbientBasicMethod object.
	     */
	    constructor();
	    /**
	     * @inheritDoc
	     */
	    iInitVO(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * @inheritDoc
	     */
	    iInitConstants(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * The strength of the ambient reflection of the surface.
	     */
	    ambient: number;
	    /**
	     * The alpha component of the surface.
	     */
	    alpha: number;
	    /**
	     * @inheritDoc
	     */
	    copyFrom(method: ShadingMethodBase): void;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Updates the ambient color data used by the render state.
	     */
	    private updateColor();
	}
	export = AmbientBasicMethod;
	
}
declare module "awayjs-stagegl/lib/materials/methods/LightingMethodBase" {
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * LightingMethodBase provides an abstract base method for shading methods that uses lights.
	 * Used for diffuse and specular shaders only.
	 */
	class LightingMethodBase extends ShadingMethodBase {
	    /**
	     * A method that is exposed to wrappers in case the strength needs to be controlled
	     */
	    _iModulateMethod: (shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData) => string;
	    /**
	     * Creates a new LightingMethodBase.
	     */
	    constructor();
	    /**
	     * Get the fragment shader code that will be needed before any per-light code is added.
	     * @param methodVO The MethodVO object containing the method data for the currently compiled material pass.
	     * @param regCache The register cache used during the compilation.
	     * @private
	     */
	    iGetFragmentPreLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Get the fragment shader code that will generate the code relevant to a single light.
	     *
	     * @param methodVO The MethodVO object containing the method data for the currently compiled material pass.
	     * @param lightDirReg The register containing the light direction vector.
	     * @param lightColReg The register containing the light colour.
	     * @param regCache The register cache used during the compilation.
	     */
	    iGetFragmentCodePerLight(shaderObject: ShaderLightingObject, methodVO: MethodVO, lightDirReg: ShaderRegisterElement, lightColReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Get the fragment shader code that will generate the code relevant to a single light probe object.
	     *
	     * @param methodVO The MethodVO object containing the method data for the currently compiled material pass.
	     * @param cubeMapReg The register containing the cube map for the current probe
	     * @param weightRegister A string representation of the register + component containing the current weight
	     * @param regCache The register cache providing any necessary registers to the shader
	     */
	    iGetFragmentCodePerProbe(shaderObject: ShaderLightingObject, methodVO: MethodVO, cubeMapReg: ShaderRegisterElement, weightRegister: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Get the fragment shader code that should be added after all per-light code. Usually composits everything to the target register.
	     *
	     * @param methodVO The MethodVO object containing the method data for the currently compiled material pass.
	     * @param regCache The register cache used during the compilation.
	     * @param targetReg The register containing the final shading output.
	     * @private
	     */
	    iGetFragmentPostLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	}
	export = LightingMethodBase;
	
}
declare module "awayjs-stagegl/lib/materials/methods/DiffuseBasicMethod" {
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	import LightingMethodBase = require("awayjs-stagegl/lib/materials/methods/LightingMethodBase");
	/**
	 * DiffuseBasicMethod provides the default shading method for Lambert (dot3) diffuse lighting.
	 */
	class DiffuseBasicMethod extends LightingMethodBase {
	    private _multiply;
	    _pUseTexture: boolean;
	    _pTotalLightColorReg: ShaderRegisterElement;
	    _pDiffuseInputRegister: ShaderRegisterElement;
	    private _texture;
	    private _diffuseColor;
	    private _ambientColor;
	    private _diffuseR;
	    private _diffuseG;
	    private _diffuseB;
	    private _ambientR;
	    private _ambientG;
	    private _ambientB;
	    _pIsFirstLight: boolean;
	    /**
	     * Creates a new DiffuseBasicMethod object.
	     */
	    constructor();
	    iIsUsed(shaderObject: ShaderLightingObject): boolean;
	    /**
	     * Set internally if diffuse color component multiplies or replaces the ambient color
	     */
	    multiply: boolean;
	    iInitVO(shaderObject: ShaderLightingObject, methodVO: MethodVO): void;
	    /**
	     * Forces the creation of the texture.
	     * @param stage The Stage used by the renderer
	     */
	    generateMip(stage: Stage): void;
	    /**
	     * The color of the diffuse reflection when not using a texture.
	     */
	    diffuseColor: number;
	    /**
	     * The color of the ambient reflection
	     */
	    ambientColor: number;
	    /**
	     * The bitmapData to use to define the diffuse reflection color per texel.
	     */
	    texture: Texture2DBase;
	    /**
	     * @inheritDoc
	     */
	    dispose(): void;
	    /**
	     * @inheritDoc
	     */
	    copyFrom(method: ShadingMethodBase): void;
	    /**
	     * @inheritDoc
	     */
	    iCleanCompilationData(): void;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentPreLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCodePerLight(shaderObject: ShaderLightingObject, methodVO: MethodVO, lightDirReg: ShaderRegisterElement, lightColReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCodePerProbe(shaderObject: ShaderLightingObject, methodVO: MethodVO, cubeMapReg: ShaderRegisterElement, weightRegister: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentPostLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Generate the code that applies the calculated shadow to the diffuse light
	     * @param methodVO The MethodVO object for which the compilation is currently happening.
	     * @param regCache The register cache the compiler is currently using for the register management.
	     */
	    pApplyShadow(shaderObject: ShaderLightingObject, methodVO: MethodVO, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderLightingObject, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Updates the diffuse color data used by the render state.
	     */
	    private updateDiffuse();
	    /**
	     * Updates the ambient color data used by the render state.
	     */
	    private updateAmbient();
	    /**
	     * @inheritDoc
	     */
	    iSetRenderState(shaderObject: ShaderLightingObject, methodVO: MethodVO, renderable: RenderableBase, stage: Stage, camera: Camera): void;
	}
	export = DiffuseBasicMethod;
	
}
declare module "awayjs-stagegl/lib/materials/methods/EffectMethodBase" {
	import IAsset = require("awayjs-core/lib/library/IAsset");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * EffectMethodBase forms an abstract base class for shader methods that are not dependent on light sources,
	 * and are in essence post-process effects on the materials.
	 */
	class EffectMethodBase extends ShadingMethodBase implements IAsset {
	    constructor();
	    /**
	     * @inheritDoc
	     */
	    assetType: string;
	    /**
	     * Get the fragment shader code that should be added after all per-light code. Usually composits everything to the target register.
	     * @param methodVO The MethodVO object containing the method data for the currently compiled material pass.
	     * @param regCache The register cache used during the compilation.
	     * @param targetReg The register that will be containing the method's output.
	     * @private
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	}
	export = EffectMethodBase;
	
}
declare module "awayjs-stagegl/lib/materials/methods/NormalBasicMethod" {
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * NormalBasicMethod is the default method for standard tangent-space normal mapping.
	 */
	class NormalBasicMethod extends ShadingMethodBase {
	    private _texture;
	    private _useTexture;
	    _pNormalTextureRegister: ShaderRegisterElement;
	    /**
	     * Creates a new NormalBasicMethod object.
	     */
	    constructor();
	    iIsUsed(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * @inheritDoc
	     */
	    iInitVO(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * Indicates whether or not this method outputs normals in tangent space. Override for object-space normals.
	     */
	    iOutputsTangentNormals(): boolean;
	    /**
	     * @inheritDoc
	     */
	    copyFrom(method: ShadingMethodBase): void;
	    /**
	     * The texture containing the normals per pixel.
	     */
	    normalMap: Texture2DBase;
	    /**
	     * @inheritDoc
	     */
	    iCleanCompilationData(): void;
	    /**
	     * @inheritDoc
	     */
	    dispose(): void;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	}
	export = NormalBasicMethod;
	
}
declare module "awayjs-stagegl/lib/materials/methods/ShadowMapMethodBase" {
	import IAsset = require("awayjs-core/lib/library/IAsset");
	import LightBase = require("awayjs-display/lib/base/LightBase");
	import ShadowMapperBase = require("awayjs-display/lib/materials/shadowmappers/ShadowMapperBase");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * ShadowMapMethodBase provides an abstract base method for shadow map methods.
	 */
	class ShadowMapMethodBase extends ShadingMethodBase implements IAsset {
	    _pCastingLight: LightBase;
	    _pShadowMapper: ShadowMapperBase;
	    _pEpsilon: number;
	    _pAlpha: number;
	    /**
	     * Creates a new ShadowMapMethodBase object.
	     * @param castingLight The light used to cast shadows.
	     */
	    constructor(castingLight: LightBase);
	    /**
	     * @inheritDoc
	     */
	    assetType: string;
	    /**
	     * The "transparency" of the shadows. This allows making shadows less strong.
	     */
	    alpha: number;
	    /**
	     * The light casting the shadows.
	     */
	    castingLight: LightBase;
	    /**
	     * A small value to counter floating point precision errors when comparing values in the shadow map with the
	     * calculated depth value. Increase this if shadow banding occurs, decrease it if the shadow seems to be too detached.
	     */
	    epsilon: number;
	}
	export = ShadowMapMethodBase;
	
}
declare module "awayjs-stagegl/lib/materials/methods/SpecularBasicMethod" {
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import LightingMethodBase = require("awayjs-stagegl/lib/materials/methods/LightingMethodBase");
	import ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
	/**
	 * SpecularBasicMethod provides the default shading method for Blinn-Phong specular highlights (an optimized but approximated
	 * version of Phong specularity).
	 */
	class SpecularBasicMethod extends LightingMethodBase {
	    _pUseTexture: boolean;
	    _pTotalLightColorReg: ShaderRegisterElement;
	    _pSpecularTextureRegister: ShaderRegisterElement;
	    _pSpecularTexData: ShaderRegisterElement;
	    _pSpecularDataRegister: ShaderRegisterElement;
	    private _texture;
	    private _gloss;
	    private _specular;
	    private _specularColor;
	    _iSpecularR: number;
	    _iSpecularG: number;
	    _iSpecularB: number;
	    _pIsFirstLight: boolean;
	    /**
	     * Creates a new SpecularBasicMethod object.
	     */
	    constructor();
	    iIsUsed(shaderObject: ShaderLightingObject): boolean;
	    /**
	     * @inheritDoc
	     */
	    iInitVO(shaderObject: ShaderLightingObject, methodVO: MethodVO): void;
	    /**
	     * The sharpness of the specular highlight.
	     */
	    gloss: number;
	    /**
	     * The overall strength of the specular highlights.
	     */
	    specular: number;
	    /**
	     * The colour of the specular reflection of the surface.
	     */
	    specularColor: number;
	    /**
	     * The bitmapData that encodes the specular highlight strength per texel in the red channel, and the sharpness
	     * in the green channel. You can use SpecularBitmapTexture if you want to easily set specular and gloss maps
	     * from grayscale images, but prepared images are preferred.
	     */
	    texture: Texture2DBase;
	    /**
	     * @inheritDoc
	     */
	    copyFrom(method: ShadingMethodBase): void;
	    /**
	     * @inheritDoc
	     */
	    iCleanCompilationData(): void;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentPreLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCodePerLight(shaderObject: ShaderLightingObject, methodVO: MethodVO, lightDirReg: ShaderRegisterElement, lightColReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCodePerProbe(shaderObject: ShaderLightingObject, methodVO: MethodVO, cubeMapReg: ShaderRegisterElement, weightRegister: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentPostLightingCode(shaderObject: ShaderLightingObject, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderLightingObject, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Updates the specular color data used by the render state.
	     */
	    private updateSpecular();
	}
	export = SpecularBasicMethod;
	
}
declare module "awayjs-stagegl/lib/materials/methods/EffectColorTransformMethod" {
	import ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import EffectMethodBase = require("awayjs-stagegl/lib/materials/methods/EffectMethodBase");
	/**
	 * EffectColorTransformMethod provides a shading method that changes the colour of a material analogous to a
	 * ColorTransform object.
	 */
	class EffectColorTransformMethod extends EffectMethodBase {
	    private _colorTransform;
	    /**
	     * Creates a new EffectColorTransformMethod.
	     */
	    constructor();
	    /**
	     * The ColorTransform object to transform the colour of the material with.
	     */
	    colorTransform: ColorTransform;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	}
	export = EffectColorTransformMethod;
	
}
declare module "awayjs-stagegl/lib/materials/passes/TriangleMethodPass" {
	import ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import AmbientBasicMethod = require("awayjs-stagegl/lib/materials/methods/AmbientBasicMethod");
	import DiffuseBasicMethod = require("awayjs-stagegl/lib/materials/methods/DiffuseBasicMethod");
	import EffectColorTransformMethod = require("awayjs-stagegl/lib/materials/methods/EffectColorTransformMethod");
	import EffectMethodBase = require("awayjs-stagegl/lib/materials/methods/EffectMethodBase");
	import NormalBasicMethod = require("awayjs-stagegl/lib/materials/methods/NormalBasicMethod");
	import ShadowMapMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadowMapMethodBase");
	import SpecularBasicMethod = require("awayjs-stagegl/lib/materials/methods/SpecularBasicMethod");
	import ILightingPassStageGL = require("awayjs-stagegl/lib/materials/passes/ILightingPassStageGL");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
	 * using material methods to define their appearance.
	 */
	class TriangleMethodPass extends MaterialPassBase implements ILightingPassStageGL {
	    _iColorTransformMethodVO: MethodVO;
	    _iNormalMethodVO: MethodVO;
	    _iAmbientMethodVO: MethodVO;
	    _iShadowMethodVO: MethodVO;
	    _iDiffuseMethodVO: MethodVO;
	    _iSpecularMethodVO: MethodVO;
	    _iMethodVOs: MethodVO[];
	    _numEffectDependencies: number;
	    private _onShaderInvalidatedDelegate;
	    /**
	     * Creates a new CompiledPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor(passMode?: number);
	    /**
	     * Factory method to create a concrete shader object for this pass.
	     *
	     * @param profile The compatibility profile used by the renderer.
	     */
	    createShaderObject(profile: string): ShaderObjectBase;
	    /**
	     * Initializes the unchanging constant data for this material.
	     */
	    _iInitConstantData(shaderObject: ShaderObjectBase): void;
	    /**
	     * The ColorTransform object to transform the colour of the material with. Defaults to null.
	     */
	    colorTransform: ColorTransform;
	    /**
	     * The EffectColorTransformMethod object to transform the colour of the material with. Defaults to null.
	     */
	    colorTransformMethod: EffectColorTransformMethod;
	    private _removeDependency(methodVO, effectsDependency?);
	    private _addDependency(methodVO, effectsDependency?, index?);
	    /**
	     * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
	     * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
	     * methods added prior.
	     */
	    addEffectMethod(method: EffectMethodBase): void;
	    /**
	     * The number of "effect" methods added to the material.
	     */
	    numEffectMethods: number;
	    /**
	     * Queries whether a given effects method was added to the material.
	     *
	     * @param method The method to be queried.
	     * @return true if the method was added to the material, false otherwise.
	     */
	    hasEffectMethod(method: EffectMethodBase): boolean;
	    /**
	     * Returns the method added at the given index.
	     * @param index The index of the method to retrieve.
	     * @return The method at the given index.
	     */
	    getEffectMethodAt(index: number): EffectMethodBase;
	    /**
	     * Adds an effect method at the specified index amongst the methods already added to the material. Effect
	     * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
	     * etc. The method will be applied to the result of the methods with a lower index.
	     */
	    addEffectMethodAt(method: EffectMethodBase, index: number): void;
	    /**
	     * Removes an effect method from the material.
	     * @param method The method to be removed.
	     */
	    removeEffectMethod(method: EffectMethodBase): void;
	    private getDependencyForMethod(method);
	    /**
	     * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
	     */
	    normalMethod: NormalBasicMethod;
	    /**
	     * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
	     */
	    ambientMethod: AmbientBasicMethod;
	    /**
	     * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
	     */
	    shadowMethod: ShadowMapMethodBase;
	    /**
	     * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
	     */
	    diffuseMethod: DiffuseBasicMethod;
	    /**
	     * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
	     */
	    specularMethod: SpecularBasicMethod;
	    /**
	     * @inheritDoc
	     */
	    dispose(): void;
	    /**
	     * Called when any method's shader code is invalidated.
	     */
	    private onShaderInvalidated(event);
	    /**
	     * @inheritDoc
	     */
	    _iActivate(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	    /**
	     *
	     *
	     * @param renderable
	     * @param stage
	     * @param camera
	     */
	    setRenderState(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    /**
	     * @inheritDoc
	     */
	    _iDeactivate(pass: MaterialPassData, stage: Stage): void;
	    _iIncludeDependencies(shaderObject: ShaderLightingObject): void;
	    /**
	     * Counts the dependencies for a given method.
	     * @param method The method to count the dependencies for.
	     * @param methodVO The method's data for this material.
	     */
	    private setupAndCountDependencies(shaderObject, methodVO);
	    _iGetPreLightingVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPreLightingFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerLightDiffuseFragmentCode(shaderObject: ShaderLightingObject, lightDirReg: ShaderRegisterElement, diffuseColorReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerLightSpecularFragmentCode(shaderObject: ShaderLightingObject, lightDirReg: ShaderRegisterElement, specularColorReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerProbeDiffuseFragmentCode(shaderObject: ShaderLightingObject, texReg: ShaderRegisterElement, weightReg: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPerProbeSpecularFragmentCode(shaderObject: ShaderLightingObject, texReg: ShaderRegisterElement, weightReg: string, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPostLightingVertexCode(shaderObject: ShaderLightingObject, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetPostLightingFragmentCode(shaderObject: ShaderLightingObject, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Indicates whether or not normals are allowed in tangent space. This is only the case if no object-space
	     * dependencies exist.
	     */
	    _pUsesTangentSpace(shaderObject: ShaderLightingObject): boolean;
	    /**
	     * Indicates whether or not normals are output in tangent space.
	     */
	    _pOutputsTangentNormals(shaderObject: ShaderObjectBase): boolean;
	    /**
	     * Indicates whether or not normals are output by the pass.
	     */
	    _pOutputsNormals(shaderObject: ShaderObjectBase): boolean;
	    _iGetNormalVertexCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iGetNormalFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iGetVertexCode(shaderObject: ShaderObjectBase, regCache: ShaderRegisterCache, sharedReg: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, regCache: ShaderRegisterCache, sharedReg: ShaderRegisterData): string;
	    /**
	     * Indicates whether the shader uses any shadows.
	     */
	    _iUsesShadows(): boolean;
	    /**
	     * Indicates whether the shader uses any specular component.
	     */
	    _iUsesSpecular(): boolean;
	}
	export = TriangleMethodPass;
	
}
declare module "awayjs-stagegl/lib/materials/TriangleMethodMaterial" {
	import ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
	import Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
	import AmbientBasicMethod = require("awayjs-stagegl/lib/materials/methods/AmbientBasicMethod");
	import DiffuseBasicMethod = require("awayjs-stagegl/lib/materials/methods/DiffuseBasicMethod");
	import EffectMethodBase = require("awayjs-stagegl/lib/materials/methods/EffectMethodBase");
	import NormalBasicMethod = require("awayjs-stagegl/lib/materials/methods/NormalBasicMethod");
	import ShadowMapMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadowMapMethodBase");
	import SpecularBasicMethod = require("awayjs-stagegl/lib/materials/methods/SpecularBasicMethod");
	import TriangleMaterialBase = require("awayjs-stagegl/lib/materials/TriangleMaterialBase");
	/**
	 * TriangleMethodMaterial forms an abstract base class for the default shaded materials provided by Stage,
	 * using material methods to define their appearance.
	 */
	class TriangleMethodMaterial extends TriangleMaterialBase {
	    private _alphaBlending;
	    private _alpha;
	    private _colorTransform;
	    private _materialMode;
	    private _casterLightPass;
	    private _nonCasterLightPasses;
	    private _screenPass;
	    private _ambientMethod;
	    private _shadowMethod;
	    private _diffuseMethod;
	    private _normalMethod;
	    private _specularMethod;
	    private _depthCompareMode;
	    /**
	     * Creates a new TriangleMethodMaterial object.
	     *
	     * @param texture The texture used for the material's albedo color.
	     * @param smooth Indicates whether the texture should be filtered when sampled. Defaults to true.
	     * @param repeat Indicates whether the texture should be tiled when sampled. Defaults to false.
	     * @param mipmap Indicates whether or not any used textures should use mipmapping. Defaults to false.
	     */
	    constructor(texture?: Texture2DBase, smooth?: boolean, repeat?: boolean, mipmap?: boolean);
	    constructor(color?: number, alpha?: number);
	    materialMode: string;
	    /**
	     * The depth compare mode used to render the renderables using this material.
	     *
	     * @see away.stagegl.ContextGLCompareMode
	     */
	    depthCompareMode: string;
	    /**
	     * The alpha of the surface.
	     */
	    alpha: number;
	    /**
	     * The ColorTransform object to transform the colour of the material with. Defaults to null.
	     */
	    colorTransform: ColorTransform;
	    /**
	     * The texture object to use for the ambient colour.
	     */
	    diffuseTexture: Texture2DBase;
	    /**
	     * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
	     */
	    ambientMethod: AmbientBasicMethod;
	    /**
	     * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
	     */
	    shadowMethod: ShadowMapMethodBase;
	    /**
	     * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
	     */
	    diffuseMethod: DiffuseBasicMethod;
	    /**
	     * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
	     */
	    specularMethod: SpecularBasicMethod;
	    /**
	     * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
	     */
	    normalMethod: NormalBasicMethod;
	    /**
	     * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
	     * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
	     * methods added prior.
	     */
	    addEffectMethod(method: EffectMethodBase): void;
	    /**
	     * The number of "effect" methods added to the material.
	     */
	    numEffectMethods: number;
	    /**
	     * Queries whether a given effect method was added to the material.
	     *
	     * @param method The method to be queried.
	     * @return true if the method was added to the material, false otherwise.
	     */
	    hasEffectMethod(method: EffectMethodBase): boolean;
	    /**
	     * Returns the method added at the given index.
	     * @param index The index of the method to retrieve.
	     * @return The method at the given index.
	     */
	    getEffectMethodAt(index: number): EffectMethodBase;
	    /**
	     * Adds an effect method at the specified index amongst the methods already added to the material. Effect
	     * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
	     * etc. The method will be applied to the result of the methods with a lower index.
	     */
	    addEffectMethodAt(method: EffectMethodBase, index: number): void;
	    /**
	     * Removes an effect method from the material.
	     * @param method The method to be removed.
	     */
	    removeEffectMethod(method: EffectMethodBase): void;
	    /**
	     * The normal map to modulate the direction of the surface for each texel. The default normal method expects
	     * tangent-space normal maps, but others could expect object-space maps.
	     */
	    normalMap: Texture2DBase;
	    /**
	     * A specular map that defines the strength of specular reflections for each texel in the red channel,
	     * and the gloss factor in the green channel. You can use SpecularBitmapTexture if you want to easily set
	     * specular and gloss maps from grayscale images, but correctly authored images are preferred.
	     */
	    specularMap: Texture2DBase;
	    /**
	     * The glossiness of the material (sharpness of the specular highlight).
	     */
	    gloss: number;
	    /**
	     * The strength of the ambient reflection.
	     */
	    ambient: number;
	    /**
	     * The overall strength of the specular reflection.
	     */
	    specular: number;
	    /**
	     * The colour of the ambient reflection.
	     */
	    ambientColor: number;
	    /**
	     * The colour of the diffuse reflection.
	     */
	    diffuseColor: number;
	    /**
	     * The colour of the specular reflection.
	     */
	    specularColor: number;
	    /**
	     * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
	     * example when using textures of foliage, consider using alphaThreshold instead.
	     */
	    alphaBlending: boolean;
	    /**
	     * @inheritDoc
	     */
	    _iUpdateMaterial(): void;
	    /**
	     * Initializes all the passes and their dependent passes.
	     */
	    private initPasses();
	    /**
	     * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
	     */
	    private setBlendAndCompareModes();
	    private initCasterLightPass();
	    private removeCasterLightPass();
	    private initNonCasterLightPasses();
	    private removeNonCasterLightPasses();
	    private removeEffectPass();
	    private initEffectPass();
	    /**
	     * The maximum total number of lights provided by the light picker.
	     */
	    private numLights;
	    /**
	     * The amount of lights that don't cast shadows.
	     */
	    private numNonCasters;
	}
	export = TriangleMethodMaterial;
	
}
declare module "awayjs-stagegl/lib/pool/BillboardRenderable" {
	import SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
	import RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
	import Billboard = require("awayjs-display/lib/entities/Billboard");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	/**
	 * @class away.pool.RenderableListItem
	 */
	class BillboardRenderable extends RenderableBase {
	    private static _materialGeometry;
	    /**
	     *
	     */
	    static id: string;
	    /**
	     *
	     */
	    private _billboard;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param billboard
	     */
	    constructor(pool: RenderablePool, billboard: Billboard);
	    /**
	     * //TODO
	     *
	     * @returns {away.base.TriangleSubGeometry}
	     */
	    _pGetSubGeometry(): SubGeometryBase;
	}
	export = BillboardRenderable;
	
}
declare module "awayjs-stagegl/lib/pool/LineSubMeshRenderable" {
	import IMaterialOwner = require("awayjs-display/lib/base/IMaterialOwner");
	import LineSubMesh = require("awayjs-display/lib/base/LineSubMesh");
	import LineSubGeometry = require("awayjs-display/lib/base/LineSubGeometry");
	import RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	/**
	 * @class away.pool.LineSubMeshRenderable
	 */
	class LineSubMeshRenderable extends RenderableBase {
	    /**
	     *
	     */
	    static id: string;
	    /**
	     *
	     */
	    subMesh: LineSubMesh;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param subMesh
	     * @param level
	     * @param dataOffset
	     */
	    constructor(pool: RenderablePool, subMesh: LineSubMesh, level?: number, indexOffset?: number);
	    /**
	     * //TODO
	     *
	     * @returns {base.LineSubGeometry}
	     * @protected
	     */
	    _pGetSubGeometry(): LineSubGeometry;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param materialOwner
	     * @param level
	     * @param indexOffset
	     * @returns {away.pool.LineSubMeshRenderable}
	     * @private
	     */
	    _pGetOverflowRenderable(pool: RenderablePool, materialOwner: IMaterialOwner, level: number, indexOffset: number): RenderableBase;
	}
	export = LineSubMeshRenderable;
	
}
declare module "awayjs-stagegl/lib/pool/SkyboxRenderable" {
	import TriangleSubGeometry = require("awayjs-display/lib/base/TriangleSubGeometry");
	import RenderablePool = require("awayjs-display/lib/pool/RenderablePool");
	import Skybox = require("awayjs-display/lib/entities/Skybox");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	/**
	 * @class away.pool.SkyboxRenderable
	 */
	class SkyboxRenderable extends RenderableBase {
	    /**
	     *
	     */
	    static id: string;
	    /**
	     *
	     */
	    private static _geometry;
	    /**
	     * //TODO
	     *
	     * @param pool
	     * @param skybox
	     */
	    constructor(pool: RenderablePool, skybox: Skybox);
	    /**
	     * //TODO
	     *
	     * @returns {away.base.TriangleSubGeometry}
	     * @private
	     */
	    _pGetSubGeometry(): TriangleSubGeometry;
	}
	export = SkyboxRenderable;
	
}
declare module "awayjs-stagegl/lib/materials/utils/DefaultMaterialManager" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import BitmapTexture = require("awayjs-core/lib/textures/BitmapTexture");
	import IMaterialOwner = require("awayjs-display/lib/base/IMaterialOwner");
	import MaterialBase = require("awayjs-display/lib/materials/MaterialBase");
	class DefaultMaterialManager {
	    private static _defaultBitmapData;
	    private static _defaultTriangleMaterial;
	    private static _defaultLineMaterial;
	    private static _defaultTexture;
	    static getDefaultMaterial(materialOwner?: IMaterialOwner): MaterialBase;
	    static getDefaultTexture(materialOwner?: IMaterialOwner): BitmapTexture;
	    private static createDefaultTexture();
	    static createCheckeredBitmapData(): BitmapData;
	    private static createDefaultTriangleMaterial();
	    private static createDefaultLineMaterial();
	}
	export = DefaultMaterialManager;
	
}
declare module "awayjs-stagegl/lib/render/RendererBase" {
	import BitmapData = require("awayjs-core/lib/base/BitmapData");
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import Vector3D = require("awayjs-core/lib/geom/Vector3D");
	import EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import LineSubMesh = require("awayjs-display/lib/base/LineSubMesh");
	import TriangleSubMesh = require("awayjs-display/lib/base/TriangleSubMesh");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import IEntitySorter = require("awayjs-display/lib/sort/IEntitySorter");
	import Billboard = require("awayjs-display/lib/entities/Billboard");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import StageEvent = require("awayjs-display/lib/events/StageEvent");
	import ICollector = require("awayjs-display/lib/traverse/ICollector");
	import ShadowCasterCollector = require("awayjs-display/lib/traverse/ShadowCasterCollector");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import IContextStageGL = require("awayjs-stagegl/lib/base/IContextStageGL");
	import RTTBufferManager = require("awayjs-stagegl/lib/managers/RTTBufferManager");
	/**
	 * RendererBase forms an abstract base class for classes that are used in the rendering pipeline to render the
	 * contents of a partition
	 *
	 * @class away.render.RendererBase
	 */
	class RendererBase extends EventDispatcher {
	    private _billboardRenderablePool;
	    private _triangleSubMeshRenderablePool;
	    private _lineSubMeshRenderablePool;
	    _pContext: IContextStageGL;
	    _pStage: Stage;
	    _pCamera: Camera;
	    _iEntryPoint: Vector3D;
	    _pCameraForward: Vector3D;
	    _pRttBufferManager: RTTBufferManager;
	    private _viewPort;
	    private _viewportDirty;
	    private _scissorDirty;
	    _pBackBufferInvalid: boolean;
	    _pDepthTextureInvalid: boolean;
	    _depthPrepass: boolean;
	    private _backgroundR;
	    private _backgroundG;
	    private _backgroundB;
	    private _backgroundAlpha;
	    _shareContext: boolean;
	    _width: number;
	    _height: number;
	    textureRatioX: number;
	    textureRatioY: number;
	    private _snapshotBitmapData;
	    private _snapshotRequired;
	    _pRttViewProjectionMatrix: Matrix3D;
	    private _localPos;
	    private _globalPos;
	    _pScissorRect: Rectangle;
	    private _scissorUpdated;
	    private _viewPortUpdated;
	    private _onContextUpdateDelegate;
	    private _onViewportUpdatedDelegate;
	    _pNumTriangles: number;
	    _pOpaqueRenderableHead: RenderableBase;
	    _pBlendedRenderableHead: RenderableBase;
	    /**
	     *
	     */
	    numTriangles: number;
	    /**
	     *
	     */
	    renderableSorter: IEntitySorter;
	    /**
	     * A viewPort rectangle equivalent of the Stage size and position.
	     */
	    viewPort: Rectangle;
	    /**
	     * A scissor rectangle equivalent of the view size and position.
	     */
	    scissorRect: Rectangle;
	    /**
	     *
	     */
	    x: number;
	    /**
	     *
	     */
	    y: number;
	    /**
	     *
	     */
	    width: number;
	    /**
	     *
	     */
	    height: number;
	    /**
	     * Creates a new RendererBase object.
	     */
	    constructor();
	    _iCreateEntityCollector(): ICollector;
	    /**
	     * The background color's red component, used when clearing.
	     *
	     * @private
	     */
	    _iBackgroundR: number;
	    /**
	     * The background color's green component, used when clearing.
	     *
	     * @private
	     */
	    _iBackgroundG: number;
	    /**
	     * The background color's blue component, used when clearing.
	     *
	     * @private
	     */
	    _iBackgroundB: number;
	    /**
	     * The Stage that will provide the ContextGL used for rendering.
	     */
	    stage: Stage;
	    iSetStage(value: Stage): void;
	    /**
	     * Defers control of ContextGL clear() and present() calls to Stage, enabling multiple Stage frameworks
	     * to share the same ContextGL object.
	     */
	    shareContext: boolean;
	    /**
	     * Disposes the resources used by the RendererBase.
	     */
	    dispose(): void;
	    render(entityCollector: ICollector): void;
	    /**
	     * Renders the potentially visible geometry to the back buffer or texture.
	     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
	     * @param target An option target texture to render to.
	     * @param surfaceSelector The index of a CubeTexture's face to render to.
	     * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
	     */
	    _iRender(entityCollector: ICollector, target?: TextureProxyBase, scissorRect?: Rectangle, surfaceSelector?: number): void;
	    _iRenderCascades(entityCollector: ShadowCasterCollector, target: TextureProxyBase, numCascades: number, scissorRects: Rectangle[], cameras: Camera[]): void;
	    pCollectRenderables(entityCollector: ICollector): void;
	    /**
	     * Renders the potentially visible geometry to the back buffer or texture. Only executed if everything is set up.
	     *
	     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
	     * @param target An option target texture to render to.
	     * @param surfaceSelector The index of a CubeTexture's face to render to.
	     * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
	     */
	    pExecuteRender(entityCollector: ICollector, target?: TextureProxyBase, scissorRect?: Rectangle, surfaceSelector?: number): void;
	    queueSnapshot(bmd: BitmapData): void;
	    /**
	     * Performs the actual drawing of geometry to the target.
	     * @param entityCollector The EntityCollector object containing the potentially visible geometry.
	     */
	    pDraw(entityCollector: ICollector, target: TextureProxyBase): void;
	    /**
	     * Assign the context once retrieved
	     */
	    private onContextUpdate(event);
	    _iBackgroundAlpha: number;
	    /**
	     * @private
	     */
	    private notifyScissorUpdate();
	    /**
	     * @private
	     */
	    private notifyViewportUpdate();
	    /**
	     *
	     */
	    onViewportUpdated(event: StageEvent): void;
	    /**
	     *
	     */
	    updateGlobalPos(): void;
	    /**
	     *
	     * @param billboard
	     * @protected
	     */
	    applyBillboard(billboard: Billboard): void;
	    /**
	     *
	     * @param triangleSubMesh
	     */
	    applyTriangleSubMesh(triangleSubMesh: TriangleSubMesh): void;
	    /**
	     *
	     * @param lineSubMesh
	     */
	    applyLineSubMesh(lineSubMesh: LineSubMesh): void;
	    /**
	     *
	     * @param renderable
	     * @protected
	     */
	    private _applyRenderable(renderable);
	}
	export = RendererBase;
	
}
declare module "awayjs-stagegl/lib/render/DepthRenderer" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import EntityCollector = require("awayjs-display/lib/traverse/EntityCollector");
	import ShadowCasterCollector = require("awayjs-display/lib/traverse/ShadowCasterCollector");
	import RendererBase = require("awayjs-stagegl/lib/render/RendererBase");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * The DepthRenderer class renders 32-bit depth information encoded as RGBA
	 *
	 * @class away.render.DepthRenderer
	 */
	class DepthRenderer extends RendererBase {
	    private _pass;
	    private _renderBlended;
	    private _disableColor;
	    /**
	     * Creates a new DepthRenderer object.
	     * @param renderBlended Indicates whether semi-transparent objects should be rendered.
	     * @param distanceBased Indicates whether the written depth value is distance-based or projected depth-based
	     */
	    constructor(pass: MaterialPassBase, renderBlended?: boolean);
	    disableColor: boolean;
	    _iRenderCascades(entityCollector: ShadowCasterCollector, target: TextureProxyBase, numCascades: number, scissorRects: Rectangle[], cameras: Camera[]): void;
	    private drawCascadeRenderables(renderable, camera, cullPlanes);
	    /**
	     * @inheritDoc
	     */
	    pDraw(entityCollector: EntityCollector, target: TextureProxyBase): void;
	    /**
	     * Draw a list of renderables.
	     * @param renderables The renderables to draw.
	     * @param entityCollector The EntityCollector containing all potentially visible information.
	     */
	    private drawRenderables(renderable, entityCollector);
	}
	export = DepthRenderer;
	
}
declare module "awayjs-stagegl/lib/render/Filter3DRenderer" {
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import ITexture = require("awayjs-stagegl/lib/base/ITexture");
	import Filter3DBase = require("awayjs-stagegl/lib/filters/Filter3DBase");
	/**
	 * @class away.render.Filter3DRenderer
	 */
	class Filter3DRenderer {
	    private _filters;
	    private _tasks;
	    private _filterTasksInvalid;
	    private _mainInputTexture;
	    private _requireDepthRender;
	    private _rttManager;
	    private _stage;
	    private _filterSizesInvalid;
	    private _onRTTResizeDelegate;
	    constructor(stage: Stage);
	    private onRTTResize(event);
	    requireDepthRender: boolean;
	    getMainInputTexture(stage: Stage): ITexture;
	    filters: Filter3DBase[];
	    private updateFilterTasks(stage);
	    render(stage: Stage, camera: Camera, depthTexture: ITexture): void;
	    private updateFilterSizes();
	    dispose(): void;
	}
	export = Filter3DRenderer;
	
}
declare module "awayjs-stagegl/lib/materials/passes/DepthMapPass" {
	import Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * DepthMapPass is a pass that writes depth values to a depth map as a 32-bit value exploded over the 4 texture channels.
	 * This is used to render shadow maps, depth maps, etc.
	 */
	class DepthMapPass extends MaterialPassBase {
	    private _fragmentConstantsIndex;
	    private _texturesIndex;
	    /**
	     * Creates a new DepthMapPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor();
	    /**
	     * Initializes the unchanging constant data for this material.
	     */
	    _iInitConstantData(shaderObject: ShaderObjectBase): void;
	    _iIncludeDependencies(shaderObject: ShaderObjectBase): void;
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    _iRender(pass: MaterialPassData, renderable: RenderableBase, stage: Stage, camera: Camera, viewProjection: Matrix3D): void;
	    /**
	     * @inheritDoc
	     */
	    _iActivate(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	}
	export = DepthMapPass;
	
}
declare module "awayjs-stagegl/lib/materials/passes/DistanceMapPass" {
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MaterialPassData = require("awayjs-stagegl/lib/pool/MaterialPassData");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
	/**
	 * DistanceMapPass is a pass that writes distance values to a depth map as a 32-bit value exploded over the 4 texture channels.
	 * This is used to render omnidirectional shadow maps.
	 */
	class DistanceMapPass extends MaterialPassBase {
	    private _fragmentConstantsIndex;
	    private _texturesIndex;
	    /**
	     * Creates a new DistanceMapPass object.
	     *
	     * @param material The material to which this pass belongs.
	     */
	    constructor();
	    /**
	     * Initializes the unchanging constant data for this material.
	     */
	    _iInitConstantData(shaderObject: ShaderObjectBase): void;
	    _iIncludeDependencies(shaderObject: ShaderObjectBase): void;
	    /**
	     * @inheritDoc
	     */
	    _iGetFragmentCode(shaderObject: ShaderObjectBase, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iActivate(pass: MaterialPassData, stage: Stage, camera: Camera): void;
	}
	export = DistanceMapPass;
	
}
declare module "awayjs-stagegl/lib/render/DefaultRenderer" {
	import Rectangle = require("awayjs-core/lib/geom/Rectangle");
	import TextureProxyBase = require("awayjs-core/lib/textures/TextureProxyBase");
	import IRenderer = require("awayjs-display/lib/render/IRenderer");
	import EntityCollector = require("awayjs-display/lib/traverse/EntityCollector");
	import ICollector = require("awayjs-display/lib/traverse/ICollector");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import Filter3DRenderer = require("awayjs-stagegl/lib/render/Filter3DRenderer");
	import RendererBase = require("awayjs-stagegl/lib/render/RendererBase");
	import Filter3DBase = require("awayjs-stagegl/lib/filters/Filter3DBase");
	/**
	 * The DefaultRenderer class provides the default rendering method. It renders the scene graph objects using the
	 * materials assigned to them.
	 *
	 * @class away.render.DefaultRenderer
	 */
	class DefaultRenderer extends RendererBase implements IRenderer {
	    _pRequireDepthRender: boolean;
	    private _skyboxRenderablePool;
	    private _pDistanceRenderer;
	    private _pDepthRenderer;
	    private _skyboxProjection;
	    _pFilter3DRenderer: Filter3DRenderer;
	    _pDepthRender: TextureProxyBase;
	    private _antiAlias;
	    antiAlias: number;
	    /**
	     *
	     */
	    depthPrepass: boolean;
	    /**
	     *
	     * @returns {*}
	     */
	    filters3d: Filter3DBase[];
	    /**
	     * Creates a new DefaultRenderer object.
	     *
	     * @param antiAlias The amount of anti-aliasing to use.
	     * @param renderMode The render mode to use.
	     */
	    constructor(forceSoftware?: boolean, profile?: string, mode?: string);
	    render(entityCollector: ICollector): void;
	    pExecuteRender(entityCollector: EntityCollector, target?: TextureProxyBase, scissorRect?: Rectangle, surfaceSelector?: number): void;
	    private updateLights(entityCollector);
	    /**
	     * @inheritDoc
	     */
	    pDraw(entityCollector: EntityCollector, target: TextureProxyBase): void;
	    /**
	     * Draw the skybox if present.
	     *
	     * @param entityCollector The EntityCollector containing all potentially visible information.
	     */
	    private drawSkybox(entityCollector);
	    private updateSkyboxProjection(camera);
	    /**
	     * Draw a list of renderables.
	     *
	     * @param renderables The renderables to draw.
	     * @param entityCollector The EntityCollector containing all potentially visible information.
	     */
	    private drawRenderables(renderable, entityCollector);
	    dispose(): void;
	    /**
	     *
	     */
	    pRenderDepthPrepass(entityCollector: EntityCollector): void;
	    /**
	     *
	     */
	    pRenderSceneDepthToTexture(entityCollector: EntityCollector): void;
	    /**
	     * Updates the backbuffer dimensions.
	     */
	    pUpdateBackBuffer(): void;
	    iSetStage(value: Stage): void;
	    /**
	     *
	     */
	    private initDepthTexture(context);
	}
	export = DefaultRenderer;
	
}
declare module "awayjs-stagegl/lib/materials/methods/ShadowMethodBase" {
	import LightBase = require("awayjs-display/lib/base/LightBase");
	import Camera = require("awayjs-display/lib/entities/Camera");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import RenderableBase = require("awayjs-stagegl/lib/pool/RenderableBase");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderLightingObject = require("awayjs-stagegl/lib/materials/compilation/ShaderLightingObject");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadowMapMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadowMapMethodBase");
	/**
	 * ShadowMethodBase provides an abstract method for simple (non-wrapping) shadow map methods.
	 */
	class ShadowMethodBase extends ShadowMapMethodBase {
	    _pDepthMapCoordReg: ShaderRegisterElement;
	    _pUsePoint: boolean;
	    /**
	     * Creates a new ShadowMethodBase object.
	     * @param castingLight The light used to cast shadows.
	     */
	    constructor(castingLight: LightBase);
	    /**
	     * @inheritDoc
	     */
	    iInitVO(shaderObject: ShaderLightingObject, methodVO: MethodVO): void;
	    /**
	     * @inheritDoc
	     */
	    iInitConstants(shaderObject: ShaderObjectBase, methodVO: MethodVO): void;
	    /**
	     * Wrappers that override the vertex shader need to set this explicitly
	     */
	    _iDepthMapCoordReg: ShaderRegisterElement;
	    /**
	     * @inheritDoc
	     */
	    iCleanCompilationData(): void;
	    /**
	     * @inheritDoc
	     */
	    iGetVertexCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Gets the vertex code for shadow mapping with a point light.
	     *
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     */
	    _pGetPointVertexCode(methodVO: MethodVO, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Gets the vertex code for shadow mapping with a planar shadow map (fe: directional lights).
	     *
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     */
	    pGetPlanarVertexCode(methodVO: MethodVO, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iGetFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Gets the fragment code for shadow mapping with a planar shadow map.
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     * @param targetReg The register to contain the shadow coverage
	     * @return
	     */
	    _pGetPlanarFragmentCode(methodVO: MethodVO, targetReg: ShaderRegisterElement, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * Gets the fragment code for shadow mapping with a point light.
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     * @param targetReg The register to contain the shadow coverage
	     * @return
	     */
	    _pGetPointFragmentCode(methodVO: MethodVO, targetReg: ShaderRegisterElement, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iSetRenderState(shaderObject: ShaderObjectBase, methodVO: MethodVO, renderable: RenderableBase, stage: Stage, camera: Camera): void;
	    /**
	     * Gets the fragment code for combining this method with a cascaded shadow map method.
	     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
	     * @param regCache The register cache used during the compilation.
	     * @param decodeRegister The register containing the data to decode the shadow map depth value.
	     * @param depthTexture The texture containing the shadow map.
	     * @param depthProjection The projection of the fragment relative to the light.
	     * @param targetRegister The register to contain the shadow coverage
	     * @return
	     */
	    _iGetCascadeFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, decodeRegister: ShaderRegisterElement, depthTexture: ShaderRegisterElement, depthProjection: ShaderRegisterElement, targetRegister: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivate(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	    /**
	     * Sets the method state for cascade shadow mapping.
	     */
	    iActivateForCascade(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	}
	export = ShadowMethodBase;
	
}
declare module "awayjs-stagegl/lib/materials/methods/ShadowHardMethod" {
	import LightBase = require("awayjs-display/lib/base/LightBase");
	import Stage = require("awayjs-stagegl/lib/base/Stage");
	import MethodVO = require("awayjs-stagegl/lib/materials/compilation/MethodVO");
	import ShaderObjectBase = require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");
	import ShaderRegisterCache = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterCache");
	import ShaderRegisterData = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterData");
	import ShaderRegisterElement = require("awayjs-stagegl/lib/materials/compilation/ShaderRegisterElement");
	import ShadowMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadowMethodBase");
	/**
	 * ShadowHardMethod provides the cheapest shadow map method by using a single tap without any filtering.
	 */
	class ShadowHardMethod extends ShadowMethodBase {
	    /**
	     * Creates a new ShadowHardMethod object.
	     */
	    constructor(castingLight: LightBase);
	    /**
	     * @inheritDoc
	     */
	    _pGetPlanarFragmentCode(methodVO: MethodVO, targetReg: ShaderRegisterElement, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _pGetPointFragmentCode(methodVO: MethodVO, targetReg: ShaderRegisterElement, regCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    _iGetCascadeFragmentCode(shaderObject: ShaderObjectBase, methodVO: MethodVO, decodeRegister: ShaderRegisterElement, depthTexture: ShaderRegisterElement, depthProjection: ShaderRegisterElement, targetRegister: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData): string;
	    /**
	     * @inheritDoc
	     */
	    iActivateForCascade(shaderObject: ShaderObjectBase, methodVO: MethodVO, stage: Stage): void;
	}
	export = ShadowHardMethod;
	
}