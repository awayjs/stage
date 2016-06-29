import { EventDispatcher } from "@awayjs/core/lib/events/EventDispatcher";
import { Rectangle } from "@awayjs/core/lib/geom/Rectangle";
import { ImageBase } from "@awayjs/core/lib/image/ImageBase";
import { AbstractionBase } from "@awayjs/core/lib/library/AbstractionBase";
import { IAsset } from "@awayjs/core/lib/library/IAsset";
import { IAssetClass } from "@awayjs/core/lib/library/IAssetClass";
import { IAbstractionPool } from "@awayjs/core/lib/library/IAbstractionPool";
import { IContextGL } from "../base/IContextGL";
import { IVertexBuffer } from "../base/IVertexBuffer";
import { GL_IAssetClass } from "../library/GL_IAssetClass";
import { ProgramData } from "../image/ProgramData";
import { StageManager } from "../managers/StageManager";
/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
export declare class Stage extends EventDispatcher implements IAbstractionPool {
    private static _abstractionClassPool;
    private _abstractionPool;
    private _programData;
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
    private _viewportUpdated;
    private _viewportDirty;
    private _bufferClear;
    private _initialised;
    private _bufferFormatDictionary;
    globalDisableMipmap: boolean;
    globalDisableSmooth: boolean;
    constructor(container: HTMLCanvasElement, stageIndex: number, stageManager: StageManager, forceSoftware?: boolean, profile?: string);
    getProgramData(vertexString: string, fragmentString: string): ProgramData;
    setRenderTarget(target: ImageBase, enableDepthAndStencil?: boolean, surfaceSelector?: number): void;
    getAbstraction(asset: IAsset): AbstractionBase;
    /**
     *
     * @param image
     */
    clearAbstraction(asset: IAsset): void;
    /**
     *
     * @param imageObjectClass
     */
    static registerAbstraction(gl_assetClass: GL_IAssetClass, assetClass: IAssetClass): void;
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
    readonly container: HTMLElement;
    /**
     * The Context object associated with the given stage object.
     */
    readonly context: IContextGL;
    private notifyViewportUpdated();
    readonly profile: string;
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
    readonly renderTarget: ImageBase;
    readonly renderSurfaceSelector: number;
    clear(): void;
    scissorRect: Rectangle;
    /**
     * The index of the Stage which is managed by this instance of StageProxy.
     */
    readonly stageIndex: number;
    /**
     * Indicates whether the Stage managed by this proxy is running in software mode.
     * Remember to wait for the CONTEXT_CREATED event before checking this property,
     * as only then will it be guaranteed to be accurate.
     */
    readonly usesSoftwareRendering: boolean;
    /**
     * The antiAliasing of the Stage.
     */
    antiAlias: number;
    /**
     * A viewPort rectangle equivalent of the Stage size and position.
     */
    readonly viewPort: Rectangle;
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
    private onContextLost(event);
    private onContextRestored(event);
    recoverFromDisposal(): boolean;
    private _callback(context);
    setVertexBuffer(index: number, buffer: IVertexBuffer, size: number, dimensions: number, offset: number, unsigned?: boolean): void;
    setSamplerState(index: number, repeat: boolean, smooth: boolean, mipmap: boolean): void;
}
