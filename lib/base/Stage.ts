import BitmapData					= require("awayjs-core/lib/base/BitmapData");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");
import Event						= require("awayjs-core/lib/events/Event");
import EventDispatcher				= require("awayjs-core/lib/events/EventDispatcher");
import CubeTextureBase				= require("awayjs-core/lib/textures/CubeTextureBase");
import RenderTexture				= require("awayjs-core/lib/textures/RenderTexture");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");
import CSS							= require("awayjs-core/lib/utils/CSS");

import ContextMode					= require("awayjs-display/lib/display/ContextMode");
import StageEvent					= require("awayjs-display/lib/events/StageEvent");

import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import ContextWebGL					= require("awayjs-stagegl/lib/base/ContextWebGL");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import IndexData					= require("awayjs-stagegl/lib/pool/IndexData");
import TextureData					= require("awayjs-stagegl/lib/pool/TextureData");
import TextureDataPool				= require("awayjs-stagegl/lib/pool/TextureDataPool");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import ProgramDataPool				= require("awayjs-stagegl/lib/pool/ProgramDataPool");
import VertexData					= require("awayjs-stagegl/lib/pool/VertexData");
import StageManager					= require("awayjs-stagegl/lib/managers/StageManager");

/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
class Stage extends EventDispatcher
{
	private _programData:Array<ProgramData> = new Array<ProgramData>();
	private _texturePool:TextureDataPool;
	private _programDataPool:ProgramDataPool;
	private _context:IContextGL;
	private _container:HTMLElement;
	private _width:number;
	private _height:number;
	private _x:number = 0;
	private _y:number = 0;

	//private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame

	private _stageIndex:number = -1;

	private _usesSoftwareRendering:boolean;
	private _profile:string;
	private _stageManager:StageManager;
	private _antiAlias:number = 0;
	private _enableDepthAndStencil:boolean;
	private _contextRequested:boolean;

	//private var _activeVertexBuffers : Vector.<VertexBuffer> = new Vector.<VertexBuffer>(8, true);
	//private var _activeTextures : Vector.<TextureBase> = new Vector.<TextureBase>(8, true);
	private _renderTarget:TextureProxyBase = null;
	private _renderSurfaceSelector:number = 0;
	private _scissorRect:Rectangle;
	private _color:number;
	private _backBufferDirty:boolean;
	private _viewPort:Rectangle;
	private _enterFrame:Event;
	private _exitFrame:Event;
	private _viewportUpdated:StageEvent;
	private _viewportDirty:boolean;
	private _bufferClear:boolean;

	//private _mouse3DManager:away.managers.Mouse3DManager;
	//private _touch3DManager:Touch3DManager; //TODO: imeplement dependency Touch3DManager

	private _initialised:boolean = false;

	constructor(container:HTMLCanvasElement, stageIndex:number, stageManager:StageManager, forceSoftware:boolean = false, profile:string = "baseline")
	{
		super();

		this._texturePool = new TextureDataPool();
		this._programDataPool = new ProgramDataPool(this);

		this._container = container;

		this._stageIndex = stageIndex;

		this._stageManager = stageManager;

		this._viewPort = new Rectangle();

		this._enableDepthAndStencil = true;

		CSS.setElementX(this._container, 0);
		CSS.setElementY(this._container, 0);

		this.visible = true;
	}

	public getProgramData(vertexString:string, fragmentString:string):ProgramData
	{
		return this._programDataPool.getItem(vertexString, fragmentString);
	}

	public setRenderTarget(target:TextureProxyBase, enableDepthAndStencil:boolean = false, surfaceSelector:number = 0)
	{
		if (this._renderTarget === target && surfaceSelector == this._renderSurfaceSelector && this._enableDepthAndStencil == enableDepthAndStencil)
			return;

		this._renderTarget = target;
		this._renderSurfaceSelector = surfaceSelector;
		this._enableDepthAndStencil = enableDepthAndStencil;
		if (target instanceof RenderTexture) {
			this._context.setRenderToTexture(this.getRenderTexture(<RenderTexture> target), enableDepthAndStencil, this._antiAlias, surfaceSelector);
		} else {
			this._context.setRenderToBackBuffer();
			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
		}
	}

	public getRenderTexture(textureProxy:RenderTexture):ITextureBase
	{
		var textureData:TextureData = this._texturePool.getItem(textureProxy);

		if (!textureData.texture)
			textureData.texture = this._context.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);

		return textureData.texture;
	}

	/**
	 * Assigns an attribute stream
	 *
	 * @param index The attribute stream index for the vertex shader
	 * @param buffer
	 * @param offset
	 * @param stride
	 * @param format
	 */
	public activateBuffer(index:number, buffer:VertexData, offset:number, format:string)
	{
		if (!buffer.contexts[this._stageIndex])
			buffer.contexts[this._stageIndex] = this._context;

		if (!buffer.buffers[this._stageIndex]) {
			buffer.buffers[this._stageIndex] = this._context.createVertexBuffer(buffer.data.length/buffer.dataPerVertex, buffer.dataPerVertex);
			buffer.invalid[this._stageIndex] = true;
		}

		if (buffer.invalid[this._stageIndex]) {
			buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length/buffer.dataPerVertex);
			buffer.invalid[this._stageIndex] = false;
		}

		this._context.setVertexBufferAt(index, buffer.buffers[this._stageIndex], offset, format);
	}

	public disposeVertexData(buffer:VertexData)
	{
		buffer.buffers[this._stageIndex].dispose();
		buffer.buffers[this._stageIndex] = null;
	}

	public activateRenderTexture(index:number, textureProxy:RenderTexture)
	{
		this._context.setTextureAt(index, this.getRenderTexture(textureProxy));
	}

	public activateTexture(index:number, textureProxy:Texture2DBase)
	{
		var textureData:TextureData = <TextureData> this._texturePool.getItem(textureProxy);

		if (!textureData.texture) {
			textureData.texture = this._context.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);
			textureData.invalid = true;
		}

		if (textureData.invalid) {
			textureData.invalid = false;
			if (textureProxy.generateMipmaps) {
				var mipmapData:Array<BitmapData> = textureProxy._iGetMipmapData();
				var len:number = mipmapData.length;
				for (var i:number = 0; i < len; i++)
					(<ITexture> textureData.texture).uploadFromData(mipmapData[i], i);
			} else {
				(<ITexture> textureData.texture).uploadFromData(textureProxy._iGetTextureData(), 0);
			}
		}

		this._context.setTextureAt(index, textureData.texture);
	}

	public activateCubeTexture(index:number, textureProxy:CubeTextureBase)
	{
		var textureData:TextureData = <TextureData> this._texturePool.getItem(textureProxy);

		if (!textureData.texture) {
			textureData.texture = this._context.createCubeTexture(textureProxy.size, ContextGLTextureFormat.BGRA, false);
			textureData.invalid = true;
		}

		if (textureData.invalid) {
			textureData.invalid = false;
			for (var i:number = 0; i < 6; ++i) {
				if (textureProxy.generateMipmaps) {
					var mipmapData:Array<BitmapData> = textureProxy._iGetMipmapData(i);
					var len:number = mipmapData.length;
					for (var j:number = 0; j < len; j++)
						(<ICubeTexture> textureData.texture).uploadFromData(mipmapData[j], i, j);
				} else {
					(<ICubeTexture> textureData.texture).uploadFromData(textureProxy._iGetTextureData(i), i, 0);
				}
			}
		}

		this._context.setTextureAt(index, textureData.texture);
	}

	/**
	 * Retrieves the VertexBuffer object that contains triangle indices.
	 * @param context The ContextWeb for which we request the buffer
	 * @return The VertexBuffer object that contains triangle indices.
	 */
	public getIndexBuffer(buffer:IndexData):IIndexBuffer
	{
		if (!buffer.contexts[this._stageIndex])
			buffer.contexts[this._stageIndex] = this._context;

		if (!buffer.buffers[this._stageIndex]) {
			buffer.buffers[this._stageIndex] = this._context.createIndexBuffer(buffer.data.length);
			buffer.invalid[this._stageIndex] = true;
		}

		if (buffer.invalid[this._stageIndex]) {
			buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length);
			buffer.invalid[this._stageIndex] = false;
		}

		return buffer.buffers[this._stageIndex];
	}

	public disposeIndexData(buffer:IndexData)
	{
		buffer.buffers[this._stageIndex].dispose();
		buffer.buffers[this._stageIndex] = null;
	}

	/**
	 * Requests a Context object to attach to the managed gl canvas.
	 */
	public requestContext(forceSoftware:boolean = false, profile:string = "baseline", mode:string = "auto")
	{
		// If forcing software, we can be certain that the
		// returned Context will be running software mode.
		// If not, we can't be sure and should stick to the
		// old value (will likely be same if re-requesting.)

		if (this._usesSoftwareRendering != null)
			this._usesSoftwareRendering = forceSoftware;

		this._profile = profile;

		try {
			if (mode == ContextMode.FLASH)
				new ContextStage3D(<HTMLCanvasElement> this._container, (context:IContextGL) => this._callback(context));
			else
				this._context = new ContextWebGL(<HTMLCanvasElement> this._container);

		} catch (e) {
			try {
				if (mode == ContextMode.AUTO)
					new ContextStage3D(<HTMLCanvasElement> this._container, (context:IContextGL) => this._callback(context));
				else
					this.dispatchEvent(new Event(Event.ERROR));
			} catch (e) {
				this.dispatchEvent(new Event(Event.ERROR));
			}

		}

		if (this._context)
			this._callback(this._context);
	}

	/**
	 * The width of the gl canvas
	 */
	public get width()
	{
		return this._width;
	}

	public set width(val:number)
	{
		if (this._width == val)
			return;

		CSS.setElementWidth(this._container, val);

		this._width = this._viewPort.width = val;

		this._backBufferDirty = true;

		this.notifyViewportUpdated();
	}

	/**
	 * The height of the gl canvas
	 */
	public get height()
	{
		return this._height;
	}

	public set height(val:number)
	{
		if (this._height == val)
			return;

		CSS.setElementHeight(this._container, val);

		this._height = this._viewPort.height = val;

		this._backBufferDirty = true;

		this.notifyViewportUpdated();
	}

	/**
	 * The x position of the gl canvas
	 */
	public get x()
	{
		return this._x;
	}

	public set x(val:number)
	{
		if (this._x == val)
			return;

		CSS.setElementX(this._container, val);

		this._x = this._viewPort.x = val;

		this.notifyViewportUpdated();
	}

	/**
	 * The y position of the gl canvas
	 */
	public get y()
	{
		return this._y;
	}

	public set y(val:number)
	{
		if (this._y == val)
			return;

		CSS.setElementY(this._container, val);

		this._y = this._viewPort.y = val;

		this.notifyViewportUpdated();
	}

	public set visible(val:boolean)
	{
		CSS.setElementVisibility(this._container, val);
	}

	public get visible()
	{
		return CSS.getElementVisibility(this._container);
	}

	public get container():HTMLElement
	{
		return this._container;
	}

	/**
	 * The Context object associated with the given stage object.
	 */
	public get context():IContextGL
	{
		return this._context;
	}

	private notifyViewportUpdated()
	{
		if (this._viewportDirty)
			return;

		this._viewportDirty = true;

		//if (!this.hasEventListener(StageEvent.VIEWPORT_UPDATED))
		//return;

		//if (!_viewportUpdated)
		this._viewportUpdated = new StageEvent(StageEvent.VIEWPORT_UPDATED);

		this.dispatchEvent(this._viewportUpdated);
	}

	private notifyEnterFrame()
	{
		//if (!hasEventListener(Event.ENTER_FRAME))
		//return;

		if (!this._enterFrame)
			this._enterFrame = new Event(Event.ENTER_FRAME);

		this.dispatchEvent(this._enterFrame);

	}

	private notifyExitFrame()
	{
		//if (!hasEventListener(Event.EXIT_FRAME))
		//return;

		if (!this._exitFrame)
			this._exitFrame = new Event(Event.EXIT_FRAME);

		this.dispatchEvent(this._exitFrame);
	}

	public get profile():string
	{
		return this._profile;
	}

	/**
	 * Disposes the Stage object, freeing the Context attached to the Stage.
	 */
	public dispose()
	{
		this._stageManager.iRemoveStage(this);
		this.freeContext();
		this._stageManager = null;
		this._stageIndex = -1;
	}

	/**
	 * Configures the back buffer associated with the Stage object.
	 * @param backBufferWidth The width of the backbuffer.
	 * @param backBufferHeight The height of the backbuffer.
	 * @param antiAlias The amount of anti-aliasing to use.
	 * @param enableDepthAndStencil Indicates whether the back buffer contains a depth and stencil buffer.
	 */
	public configureBackBuffer(backBufferWidth:number, backBufferHeight:number, antiAlias:number, enableDepthAndStencil:boolean)
	{
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
	public get enableDepthAndStencil():boolean
	{
		return this._enableDepthAndStencil;
	}

	public set enableDepthAndStencil(enableDepthAndStencil:boolean)
	{
		this._enableDepthAndStencil = enableDepthAndStencil;
		this._backBufferDirty = true;
	}

	public get renderTarget():TextureProxyBase
	{
		return this._renderTarget;
	}

	public get renderSurfaceSelector():number
	{
		return this._renderSurfaceSelector;
	}

	/*
	 * Clear and reset the back buffer when using a shared context
	 */
	public clear()
	{
		if (!this._context)
			return;

		if (this._backBufferDirty) {
			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
			this._backBufferDirty = false;
		}

		this._context.clear(( this._color & 0xff000000 ) >>> 24, // <--------- Zero-fill right shift
							  ( this._color & 0xff0000 ) >>> 16, // <-------------|
							  ( this._color & 0xff00 ) >>> 8, // <----------------|
								this._color & 0xff);

		this._bufferClear = true;
	}

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
	public addEventListener(type:string, listener:Function)
	{
		super.addEventListener(type, listener);

		//away.Debug.throwPIR( 'StageProxy' , 'addEventListener' ,  'EnterFrame, ExitFrame');

		//if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) ){//&& ! this._frameEventDriver.hasEventListener(Event.ENTER_FRAME)){

		//_frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);

		//}

		/* Original code
		 if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) && ! _frameEventDriver.hasEventListener(Event.ENTER_FRAME)){

		 _frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);


		 }
		 */
	}

	/**
	 * Removes a listener from the EventDispatcher object. Special case for enterframe and exitframe events - will switch StageProxy out of automatic render mode.
	 * If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
	 *
	 * @param type The type of event.
	 * @param listener The listener object to remove.
	 * @param useCapture Specifies whether the listener was registered for the capture phase or the target and bubbling phases. If the listener was registered for both the capture phase and the target and bubbling phases, two calls to removeEventListener() are required to remove both, one call with useCapture() set to true, and another call with useCapture() set to false.
	 */
	public removeEventListener(type:string, listener:Function)
	{
		super.removeEventListener(type, listener);

		/*
		 // Remove the main rendering listener if no EnterFrame listeners remain
		 if (    ! this.hasEventListener(Event.ENTER_FRAME , this.onEnterFrame , this )
		 &&  ! this.hasEventListener(Event.EXIT_FRAME , this.onEnterFrame , this) ) //&& _frameEventDriver.hasEventListener(Event.ENTER_FRAME))
		 {

		 //_frameEventDriver.removeEventListener(Event.ENTER_FRAME, this.onEnterFrame, this );

		 }
		 */
	}

	public get scissorRect():Rectangle
	{
		return this._scissorRect;
	}

	public set scissorRect(value:Rectangle)
	{
		this._scissorRect = value;

		this._context.setScissorRectangle(this._scissorRect);
	}

	/**
	 * The index of the Stage which is managed by this instance of StageProxy.
	 */
	public get stageIndex():number
	{
		return this._stageIndex;
	}

	/**
	 * Indicates whether the Stage managed by this proxy is running in software mode.
	 * Remember to wait for the CONTEXT_CREATED event before checking this property,
	 * as only then will it be guaranteed to be accurate.
	 */
	public get usesSoftwareRendering():boolean
	{
		return this._usesSoftwareRendering;
	}

	/**
	 * The antiAliasing of the Stage.
	 */
	public get antiAlias():number
	{
		return this._antiAlias;
	}

	public set antiAlias(antiAlias:number)
	{
		this._antiAlias = antiAlias;
		this._backBufferDirty = true;
	}

	/**
	 * A viewPort rectangle equivalent of the Stage size and position.
	 */
	public get viewPort():Rectangle
	{
		this._viewportDirty = false;

		return this._viewPort;
	}

	/**
	 * The background color of the Stage.
	 */
	public get color():number
	{
		return this._color;
	}

	public set color(color:number)
	{
		this._color = color;
	}

	/**
	 * The freshly cleared state of the backbuffer before any rendering
	 */
	public get bufferClear():boolean
	{
		return this._bufferClear;
	}

	public set bufferClear(newBufferClear:boolean)
	{
		this._bufferClear = newBufferClear;
	}


	public registerProgram(programData:ProgramData)
	{
		var i:number = 0;
		while (this._programData[i] != null)
			i++;

		this._programData[i] = programData;
		programData.id = i;
	}

	public unRegisterProgram(programData:ProgramData)
	{
		this._programData[programData.id] = null;
		programData.id = -1;
	}

	/*
	 * Access to fire mouseevents across multiple layered view3D instances
	 */
	//		public get mouse3DManager():Mouse3DManager
	//		{
	//			return this._mouse3DManager;
	//		}
	//
	//		public set mouse3DManager(value:Mouse3DManager)
	//		{
	//			this._mouse3DManager = value;
	//		}

	/* TODO: implement dependency Touch3DManager
	 public get touch3DManager():Touch3DManager
	 {
	 return _touch3DManager;
	 }

	 public set touch3DManager(value:Touch3DManager)
	 {
	 _touch3DManager = value;
	 }
	 */

	/**
	 * Frees the Context associated with this StageProxy.
	 */
	private freeContext()
	{
		if (this._context) {
			this._context.dispose();

			this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
		}

		this._context = null;

		this._initialised = false;
	}

	/**
	 * The Enter_Frame handler for processing the proxy.ENTER_FRAME and proxy.EXIT_FRAME event handlers.
	 * Typically the proxy.ENTER_FRAME listener would render the layers for this Stage instance.
	 */
	private onEnterFrame(event:Event)
	{
		if (!this._context)
			return;

		// Clear the stage instance
		this.clear();
		//notify the enterframe listeners
		this.notifyEnterFrame();
		// Call the present() to render the frame
		if (!this._context)
			this._context.present();
		//notify the exitframe listeners
		this.notifyExitFrame();
	}

	public recoverFromDisposal():boolean
	{
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

	private _callback(context:IContextGL)
	{
		this._context = context;

		this._container = this._context.container;

		// Only configure back buffer if width and height have been set,
		// which they may not have been if View.render() has yet to be
		// invoked for the first time.
		if (this._width && this._height)
			this._context.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);

		// Dispatch the appropriate event depending on whether context was
		// created for the first time or recreated after a device loss.
		this.dispatchEvent(new StageEvent(this._initialised? StageEvent.CONTEXT_RECREATED : StageEvent.CONTEXT_CREATED));

		this._initialised = true;
	}
}

export = Stage;