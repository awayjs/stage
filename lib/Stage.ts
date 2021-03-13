import {
	EventDispatcher,
	Rectangle,
	AbstractionBase,
	IAssetClass,
	IAbstractionPool,
	IAbstractionClass,
	CSS,
	Point,
	ColorTransform,
	IAsset
} from '@awayjs/core';

import { ContextMode } from './base/ContextMode';
import { ContextGLMipFilter } from './base/ContextGLMipFilter';
import { ContextGLTextureFilter } from './base/ContextGLTextureFilter';
import { ContextGLVertexBufferFormat } from './base/ContextGLVertexBufferFormat';
import { ContextGLWrapMode } from './base/ContextGLWrapMode';
import { ContextGLProfile } from './base/ContextGLProfile';
import { IContextGL } from './base/IContextGL';
import { IVertexBuffer } from './base/IVertexBuffer';
import { StageEvent } from './events/StageEvent';
import { ContextGLES } from './gles/ContextGLES';
import { ImageBase } from './image/ImageBase';
import { ImageSampler } from './image/ImageSampler';
import { _Stage_ImageBase } from './image/ImageBase';
import { ProgramData } from './image/ProgramData';
import { ProgramDataPool } from './image/ProgramDataPool';
import { StageManager } from './managers/StageManager';
import { ContextSoftware } from './software/ContextSoftware';
import { ContextWebGL } from './webgl/ContextWebGL';
import { ContextGLClearMask } from './base/ContextGLClearMask';
import { Image2D } from './image/Image2D';
import { UnloadService } from './managers/UnloadManager';
import { ImageUtils } from './utils/ImageUtils';
import { TouchPoint } from './base/TouchPoint';
import { FilterManager } from './managers/FilterManager';

const TMP_POINT = { x: 0, y: 0 };

/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
export class Stage extends EventDispatcher implements IAbstractionPool {
	private static _abstractionClassPool: Record<string, IAbstractionClass> = {};
	private _programData: Array<ProgramData> = new Array<ProgramData>();
	private _programDataPool: ProgramDataPool;
	private _context: IContextGL;
	private _container: HTMLCanvasElement;
	private _width: number;
	private _height: number;
	private _x: number = 0;
	private _y: number = 0;

	public _screenX: number;
	public _screenY: number;
	public _touchPoints: Array<TouchPoint> = new Array<TouchPoint>();

	//private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver/request animation frame

	private _stageIndex: number = -1;

	private _usesSoftwareRendering: boolean;
	private _profile: ContextGLProfile;
	private _stageManager: StageManager;
	private _antiAlias: number = 4;
	private _enableDepthAndStencil: boolean;
	private _contextRequested: boolean;

	//private var _activeVertexBuffers : Vector.<VertexBuffer> = new Vector.<VertexBuffer>(8, true);
	//private var _activeTextures : Vector.<TextureBase> = new Vector.<TextureBase>(8, true);
	private _renderTarget: ImageBase = null;
	private _renderSurfaceSelector: number = 0;
	private _renderMipmapSelector: number = 0;
	private _color: number;
	private _backBufferDirty: boolean;
	private _sizeDirty: boolean;

	private _lastScissorBox: Rectangle;

	private _frameEndCallbackOnce: Array<() => void> = [];

	//private _mouse3DManager:away.managers.Mouse3DManager;
	//private _touch3DManager:Touch3DManager; //TODO: imeplement dependency Touch3DManager

	private _initialised: boolean = false;

	private _bufferFormatDictionary: Array<Array<number>> = new Array<Array<number>>(5);

	public globalDisableMipmap: boolean = false;

	public globalDisableSmooth: boolean = false;

	public numUsedStreams: number = 0;
	public numUsedTextures: number = 0;

	public readonly filterManager: FilterManager;

	public get glVersion(): number {
		return this._context.glVersion;
	}

	public get screenX(): number {
		return this._screenX;
	}

	public get screenY(): number {
		return this._screenY;
	}

	public get touchPoints(): Array<TouchPoint> {
		return this._touchPoints;
	}

	public readonly id: number;

	constructor(
		container: HTMLCanvasElement, stageIndex: number,
		stageManager: StageManager, forceSoftware: boolean = false,
		profile: ContextGLProfile = ContextGLProfile.BASELINE) {

		super();

		this.id = AbstractionBase.ID_COUNT++;
		this._programDataPool = new ProgramDataPool(this);

		this._container = container;
		if (this._container) {
			this._container.addEventListener('webglcontextlost', (event) => this.onContextLost(event));
			this._container.addEventListener('webglcontextrestored', (event) => this.onContextRestored(event));
		}

		this._stageIndex = stageIndex;

		this._stageManager = stageManager;

		this._enableDepthAndStencil = true;

		CSS.setElementX(this._container, 0);
		CSS.setElementY(this._container, 0);

		this._bufferFormatDictionary[1] = new Array<number>(5);
		this._bufferFormatDictionary[1][1] = ContextGLVertexBufferFormat.BYTE_1;
		this._bufferFormatDictionary[1][2] = ContextGLVertexBufferFormat.BYTE_2;
		this._bufferFormatDictionary[1][3] = ContextGLVertexBufferFormat.BYTE_3;
		this._bufferFormatDictionary[1][4] = ContextGLVertexBufferFormat.BYTE_4;
		this._bufferFormatDictionary[2] = new Array<number>(5);
		this._bufferFormatDictionary[2][1] = ContextGLVertexBufferFormat.SHORT_1;
		this._bufferFormatDictionary[2][2] = ContextGLVertexBufferFormat.SHORT_2;
		this._bufferFormatDictionary[2][3] = ContextGLVertexBufferFormat.SHORT_3;
		this._bufferFormatDictionary[2][4] = ContextGLVertexBufferFormat.SHORT_4;
		this._bufferFormatDictionary[4] = new Array<number>(5);
		this._bufferFormatDictionary[4][1] = ContextGLVertexBufferFormat.FLOAT_1;
		this._bufferFormatDictionary[4][2] = ContextGLVertexBufferFormat.FLOAT_2;
		this._bufferFormatDictionary[4][3] = ContextGLVertexBufferFormat.FLOAT_3;
		this._bufferFormatDictionary[4][4] = ContextGLVertexBufferFormat.FLOAT_4;
		this._bufferFormatDictionary[5] = new Array<number>(5);
		this._bufferFormatDictionary[5][1] = ContextGLVertexBufferFormat.UNSIGNED_BYTE_1;
		this._bufferFormatDictionary[5][2] = ContextGLVertexBufferFormat.UNSIGNED_BYTE_2;
		this._bufferFormatDictionary[5][3] = ContextGLVertexBufferFormat.UNSIGNED_BYTE_3;
		this._bufferFormatDictionary[5][4] = ContextGLVertexBufferFormat.UNSIGNED_BYTE_4;
		this._bufferFormatDictionary[6] = new Array<number>(5);
		this._bufferFormatDictionary[6][1] = ContextGLVertexBufferFormat.UNSIGNED_SHORT_1;
		this._bufferFormatDictionary[6][2] = ContextGLVertexBufferFormat.UNSIGNED_SHORT_2;
		this._bufferFormatDictionary[6][3] = ContextGLVertexBufferFormat.UNSIGNED_SHORT_3;
		this._bufferFormatDictionary[6][4] = ContextGLVertexBufferFormat.UNSIGNED_SHORT_4;

		this.visible = true;

		this.filterManager = new FilterManager(this);
	}

	// for avoid using a Dispather, because it has big overhead
	public requiestFrameEnd(func: () => void) {
		if (this._frameEndCallbackOnce.indexOf(func) > -1 || typeof func !== 'function') {
			return;
		}

		this._frameEndCallbackOnce.push(func);
	}

	/**
	 * @description Should be executed AFTER rendering process
	 */
	public present() {
		this._context.present();
		UnloadService.executeAll();

		for (const call of this._frameEndCallbackOnce) {
			call();
		}
		this._frameEndCallbackOnce.length = 0;
	}

	public getProgramData(vertexString: string, fragmentString: string): ProgramData {
		return this._programDataPool.getItem(vertexString, fragmentString);
	}

	public setRenderTarget(
		target: ImageBase & {antialiasQuality?: number}, enableDepthAndStencil: boolean = false,
		surfaceSelector: number = 0, mipmapSelector: number = 0): void {

		if (this._renderTarget === target
			&& surfaceSelector === this._renderSurfaceSelector
			&& mipmapSelector === this._renderMipmapSelector
			&& this._enableDepthAndStencil === enableDepthAndStencil)

			return;

		this._renderTarget = target;
		this._renderSurfaceSelector = surfaceSelector;
		this._renderMipmapSelector = mipmapSelector;
		this._enableDepthAndStencil = enableDepthAndStencil;

		if (target) {
			const targetStageElement = target.getAbstraction<_Stage_ImageBase>(this);
			const antiallias = typeof target.antialiasQuality === 'number' // for SceneImage2D MSAA
				? target.antialiasQuality
				: this._antiAlias;
			this._context.setRenderToTexture(
				targetStageElement.getTexture(),
				enableDepthAndStencil,
				antiallias,
				surfaceSelector,
				mipmapSelector);

			if (mipmapSelector != 0 && this._context.glVersion != 1) { //hack to stop auto generated mipmaps
				targetStageElement._invalidMipmaps = false;
				targetStageElement._mipmap = true;
			}
		} else {
			this._context.setRenderToBackBuffer();
			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
		}
	}

	public copyPixels(
		source: Image2D, target: Image2D,
		rect: Rectangle, destPoint: Point,
		alphaBitmapData: Image2D = null, alphaPoint: Point = null,
		mergeAlpha: boolean = false): void {

		// migrated to filter manager
		this.filterManager.copyPixels(source, target, rect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha);
	}

	public threshold(
		source: Image2D, target: Image2D,
		rect: Rectangle, destPoint: Point,
		operation: string, threshold: number,
		color: number, mask: number, copySource: boolean): void {

		// migrated to filter manager
		this.filterManager.threshold(source, target, rect, destPoint, operation, threshold, color, mask, copySource);
	}

	public colorTransform(source: Image2D, target: Image2D, rect: Rectangle, colorTransform: ColorTransform): void {

		// migrated to filter manager
		this.filterManager.colorTransform(source, target, rect, colorTransform);
	}

	public requestAbstraction(asset: IAsset): IAbstractionClass {
		return Stage._abstractionClassPool[asset.assetType];
	}

	/**
	 *
	 * @param imageObjectClass
	 */
	public static registerAbstraction(abstractionClass: IAbstractionClass, assetClass: IAssetClass): void {
		Stage._abstractionClassPool[assetClass.assetType] = abstractionClass;
	}

	/**
	 * Requests a Context object to attach to the managed gl canvas.
	 */
	public requestContext(
		forceSoftware: boolean = false, profile: ContextGLProfile = ContextGLProfile.BASELINE,
		mode: ContextMode = ContextMode.AUTO, alpha: boolean = false): void {

		// If forcing software, we can be certain that the
		// returned Context will be running software mode.
		// If not, we can't be sure and should stick to the
		// old value (will likely be same if re-requesting.)

		if (this._usesSoftwareRendering != null)
			this._usesSoftwareRendering = forceSoftware;

		this._profile = profile;

		try {
			if (mode == ContextMode.SOFTWARE)
				this._context = new ContextSoftware(this._container);
			else if (mode == ContextMode.GLES)
				this._context = new ContextGLES(this._container);
			else
				this._context = new ContextWebGL(this._container, alpha);
		} catch (e) {
			this.dispatchEvent(new StageEvent(StageEvent.STAGE_ERROR, this));
		}

		if (this._context)
			this._callback(this._context);
	}

	/**
	 * The width of the gl canvas
	 */
	public get width(): number {
		this._sizeDirty = false;

		return this._width;
	}

	public set width(val: number) {
		if (this._width == val)
			return;

		this._container.style.width = val + 'px';
		this._container.width = val * this._context.pixelRatio;

		this._width = val;

		this._backBufferDirty = true;

		this._invalidateSize();
	}

	/**
	 * The height of the gl canvas
	 */
	public get height(): number {
		this._sizeDirty = false;

		return this._height;
	}

	public set height(val: number) {
		if (this._height == val)
			return;

		this._container.style.height = val + 'px';
		this._container.height = val * this._context.pixelRatio;

		this._height = val;

		this._backBufferDirty = true;

		this._invalidateSize();
	}

	/**
	 * The x position of the gl canvas
	 */
	public get x(): number {
		return this._x;
	}

	public set x(val: number) {
		if (this._x == val)
			return;

		CSS.setElementX(this._container, val);

		this._x = val;
	}

	/**
	 * The y position of the gl canvas
	 */
	public get y(): number {
		return this._y;
	}

	public set y(val: number) {
		if (this._y == val)
			return;

		CSS.setElementY(this._container, val);

		this._y = val;
	}

	public set visible(val: boolean) {
		CSS.setElementVisibility(this._container, val);
	}

	public get visible(): boolean {
		return CSS.getElementVisibility(this._container);
	}

	public set container(value: HTMLElement) {
		this._container = <HTMLCanvasElement>value;
		if (this._context) {
			this._context.container = this._container;
		}

	}

	public get container(): HTMLElement {
		return this._container;
	}

	/**
	 * The Context object associated with the given stage object.
	 */
	public get context(): IContextGL {
		return this._context;
	}

	private _invalidateSize(): void {
		if (this._sizeDirty)
			return;

		this._sizeDirty = true;

		this.dispatchEvent(new StageEvent(StageEvent.INVALIDATE_SIZE, this));
	}

	public get profile(): ContextGLProfile {
		return this._profile;
	}

	/**
	 * Disposes the Stage object, freeing the Context attached to the Stage.
	 */
	public dispose(): void {
		/*
		for (var id in this._abstractionPool){
			if(this._abstractionPool[id].clear)
				this._abstractionPool[id].clear();
		}*/

		this._stageManager.iRemoveStage(this);
		this.freeContext();
		this._stageManager = null;
		this._stageIndex = -1;

		UnloadService.clearAll();
	}

	/**
	 * Configures the back buffer associated with the Stage object.
	 * @param backBufferWidth The width of the backbuffer.
	 * @param backBufferHeight The height of the backbuffer.
	 * @param antiAlias The amount of anti-aliasing to use.
	 * @param enableDepthAndStencil Indicates whether the back buffer contains a depth and stencil buffer.
	 */
	public configureBackBuffer(
		backBufferWidth: number, backBufferHeight: number, antiAlias: number, enableDepthAndStencil: boolean): void {

		this.width = backBufferWidth;
		this.height = backBufferHeight;

		this._antiAlias = antiAlias;
		this._enableDepthAndStencil = enableDepthAndStencil;

		if (this._context)
			this._context.configureBackBuffer(backBufferWidth, backBufferHeight, antiAlias, enableDepthAndStencil);
	}

	/*
	 * Indicates whether the depth and stencil buffer is used
	 */
	public get enableDepthAndStencil(): boolean {
		return this._enableDepthAndStencil;
	}

	public set enableDepthAndStencil(enableDepthAndStencil: boolean) {
		if (this._enableDepthAndStencil == enableDepthAndStencil)
			return;

		this._enableDepthAndStencil = enableDepthAndStencil;

		this._backBufferDirty = true;
	}

	public get renderSurfaceSelector(): number {
		return this._renderSurfaceSelector;
	}

	/*
	 * Clear and reset the back buffer when using a shared context
	 */
	public clear(
		red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1,
		depth: number = 1, stencil: number = 0, mask: ContextGLClearMask = ContextGLClearMask.ALL): void {

		if (!this._context)
			return;

		if (this._backBufferDirty && this._renderTarget == null) {
			this._backBufferDirty = false;

			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
		}

		this._context.clear(red, green, blue, alpha, depth, stencil, mask);
	}

	/**
	 * The index of the Stage which is managed by this instance of StageProxy.
	 */
	public get stageIndex(): number {
		return this._stageIndex;
	}

	/**
	 * Indicates whether the Stage managed by this proxy is running in software mode.
	 * Remember to wait for the CONTEXT_CREATED event before checking this property,
	 * as only then will it be guaranteed to be accurate.
	 */
	public get usesSoftwareRendering(): boolean {
		return this._usesSoftwareRendering;
	}

	/**
	 * The antiAliasing of the Stage.
	 */
	public get antiAlias(): number {
		return this._antiAlias;
	}

	public set antiAlias(antiAlias: number) {
		if (this._antiAlias == antiAlias)
			return;

		this._antiAlias = antiAlias;

		this._backBufferDirty = true;
	}

	/**
	 * The background color of the Stage.
	 */
	public get color(): number {
		return this._color;
	}

	public set color(color: number) {
		this._color = color;
	}

	public registerProgram(programData: ProgramData): void {
		let i: number = 0;
		while (this._programData[i] != null)
			i++;

		this._programData[i] = programData;
		programData.id = i;
	}

	public unRegisterProgram(programData: ProgramData): void {
		this._programData[programData.id] = null;
		programData.id = -1;
	}

	public interactionHandler(event) {

		const screenX: number = (event.clientX != null) ? event.clientX : event.changedTouches[0].clientX;
		const screenY: number = (event.clientY != null) ? event.clientY : event.changedTouches[0].clientY;

		let point = this._mapWindowToStage(screenX, screenY, TMP_POINT);
		this._screenX = point.x;
		this._screenY = point.y;

		this._touchPoints.length = 0;

		if (event.touches) {
			let touch;
			const len_touches: number = event.touches.length;
			for (let t: number = 0; t < len_touches; t++) {
				touch = event.touches[t];

				point = this._mapWindowToStage(touch.clientX, touch.clientY, TMP_POINT);

				this._touchPoints.push(new TouchPoint(point.x, point.y, touch.identifier));
			}
		}

	}

	private _mapWindowToStage(x: number, y: number, out: {x: number, y: number} = { x: 0, y: 0 }) {
		const container = this.container;
		// IE 11 fix
		const rect = (!container.parentElement)
			? { x: 0, y: 0, width: 0, height: 0 }
			: container.getBoundingClientRect();

		out.x = (x - rect.x) * container.clientWidth / rect.width;
		out.y = (y - rect.y) * container.clientHeight / rect.height;

		return out;
	}

	/**
	 * Frees the Context associated with this StageProxy.
	 */
	private freeContext(): void {
		if (this._context) {
			this._context.dispose();

			this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED, this));
		}

		this._context = null;

		this._initialised = false;
	}

	private onContextLost(event): void {

	}

	private onContextRestored(event): void {

	}

	public recoverFromDisposal(): boolean {
		if (!this._context)
			return false;

		//away.Debug.throwPIR( 'StageProxy' , 'recoverFromDisposal' , '' );

		/*
		 if (this._iContext.driverInfo == "Disposed")
		 {
		 this._iContext = null;
		 this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
		 return false;

		 }
		 */
		return true;

	}

	private _callback(context: IContextGL): void {
		const gl = (<ContextWebGL>context)._gl;
		ImageUtils.MAX_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);

		this._context = context;

		this._container = this._context.container;

		// Only configure back buffer if width and height have been set,
		// which they may not have been if View.render() has yet to be
		// invoked for the first time.
		if (this._width && this._height)
			this._context.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);

		// Dispatch the appropriate event depending on whether context was
		// created for the first time or recreated after a device loss.
		this.dispatchEvent(
			new StageEvent(this._initialised ? StageEvent.CONTEXT_RECREATED : StageEvent.CONTEXT_CREATED, this));

		this._initialised = true;
	}

	public setVertexBuffer(
		index: number, buffer: IVertexBuffer,
		size: number, dimensions: number,
		offset: number, unsigned: boolean = false): void {

		this._context.setVertexBufferAt(
			index, buffer,
			offset, this._bufferFormatDictionary[unsigned ? size + 4 : size][dimensions]);
	}

	public setScissor(rectangle: Rectangle): void {
		if (this._backBufferDirty && this._renderTarget == null) {
			this._backBufferDirty = false;

			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
		}

		if (!this._lastScissorBox && !rectangle) {
			return;
		}

		if (rectangle && this._lastScissorBox && this._lastScissorBox.equals(rectangle)) {
			return;
		}

		if (!rectangle) {
			this._lastScissorBox = null;
		} else {
			if (!this._lastScissorBox) {
				this._lastScissorBox = new Rectangle();
			}

			this._lastScissorBox.copyFrom(rectangle);
		}

		this._context.setScissorRectangle(rectangle);
	}

	public setSamplerAt(index: number, sampler: ImageSampler): void {
		const wrap = sampler.repeat ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP;
		const filter = (sampler.smooth && !this.globalDisableSmooth)
			? ContextGLTextureFilter.LINEAR
			: ContextGLTextureFilter.NEAREST;
		const mipfilter = (sampler.mipmap && !this.globalDisableMipmap)
			? ContextGLMipFilter.MIPLINEAR
			: ContextGLMipFilter.MIPNONE;

		this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
	}
}