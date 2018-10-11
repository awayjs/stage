import { EventDispatcher, ProjectionBase, Vector3D, ProjectionEvent, Matrix3D, Plane3D, Rectangle, AssetEvent, PerspectiveProjection, ErrorBase } from "@awayjs/core";

import { StageEvent } from './events/StageEvent';
import { ViewportEvent } from './events/ViewportEvent';

import { Stage } from "./Stage";
import { ImageBase } from './image/ImageBase';
import { Image2D } from './image/Image2D';
import { ImageCube } from './image/ImageCube';
import { ContextGLClearMask } from './base/ContextGLClearMask';
import { ContextGLProfile } from './base/ContextGLProfile';
import { ContextMode } from './base/ContextMode';
import { StageManager } from './managers/StageManager';

export class Viewport extends EventDispatcher
{
    private _shareContext:boolean;
    private _rect:Rectangle = new Rectangle();
    private _backgroundColor:number;
    private _backgroundRed:number = 0;
    private _backgroundGreen:number = 0;
    private _backgroundBlue:number = 0;
    private _projection:ProjectionBase;
    private _stage:Stage;
    private _target:ImageBase;
    private _targetWidth:number;
    private _targetHeight:number;
    private _focalLength:number = 1000;
    private _pixelRatio:number = 1;
    private _frustumMatrix3D:Matrix3D = new Matrix3D();
    private _viewMatrix3D:Matrix3D = new Matrix3D();
    private _inverseViewMatrix3D:Matrix3D = new Matrix3D();
    private _components:Array<Vector3D> = new Array<Vector3D>(4);
    private _offset:Vector3D = new Vector3D();
    private _scale:Vector3D = new Vector3D(1, 1, 1);

    private _frustumMatrix3DDirty:boolean = true;
    private _viewMatrix3DDirty:boolean = true;
	private _inverseViewMatrix3DDirty:boolean = true;
    private _onInvalidateSizeDelegate:(event:StageEvent | AssetEvent) => void;
    private _onInvalidateViewMatrix3DDelegate:(event:ProjectionEvent) => void;

    /**
     * 
     */
    public backgroundAlpha:number = 1;

    /**
     * 
     */
    public backgroundDepth:number = 1;

    /**
     * 
     */
    public backgroundStencil:number = 0;

    public backgroundClearMask:ContextGLClearMask = ContextGLClearMask.ALL
    
    /**
     * 
     */
    public preservePixelRatio:boolean = true;

    /**
     * 
     */
    public preserveFocalLength:boolean = false;

    /**
     * 
     */
    public preserveDimensions:boolean = false;

    /**
     * 
     */
    public get shareContext():boolean
    {
        return this._shareContext;
    }
    
    /**
     * 
     */
    public get x():number
    {
        if (this._shareContext || this._target)
            return this._rect.x;
        
        return this._stage.x;
    }

    public set x(value:number)
    {
        if (this._shareContext || this._target) {
            if (this._rect.x == value)
                return;

            this._offset.x = (this._rect.x = value)/this._targetWidth;

            this._invalidateViewMatrix3D();
        } else {
            this._stage.x = value;
        }
    }
    
    /**
     * 
     */
    public get y():number
    {
        if (this._shareContext || this._target)
            return this._rect.y;
        
        return this._stage.y;
    }

    public set y(value:number)
    {
        if (this._shareContext || this._target) {
            if (this._rect.y == value)
                return;

            this._offset.y = (this._rect.y = value)/this._targetHeight;

            this._invalidateViewMatrix3D();
        } else {
            this._stage.y = value;
        }
    }

    /**
     * 
     */
    public get width():number
    {
        return this._rect.width;
    }

    public set width(value:number)
    {
        if (this._rect.width == value)
            return;

        this._rect.width = value;

        if (this._shareContext || this._target) {
            this._scale.x = value/this._targetWidth;

            this._updatePixelRatio();

            this._invalidateViewMatrix3D();
        } else {
            this._stage.width = value;
        }

        this._invalidateSize();
    }

    /**
     * 
     */
    public get height():number
    {
        return this._scale.y*this._targetHeight;
    }

    public set height(value:number)
    {
        if (this._rect.height == value)
            return;

        this._rect.height = value;

        if (this._shareContext || this._target) {
            this._scale.y = value/this._targetHeight;

            this._updateFocalLength();
            this._updatePixelRatio();

            this._invalidateViewMatrix3D();
        } else {
            this._stage.height = value;
        }

        this._invalidateSize();
    }

    
	/**
	 *
	 */
	public get backgroundColor():number
	{
		return this._backgroundColor;
	}

	public set backgroundColor(value:number)
	{
		if (this._backgroundColor == value)
			return;

		this._backgroundColor = value;

		this._backgroundRed = ((value >> 16) & 0xff)/0xff;
		this._backgroundGreen = ((value >> 8) & 0xff)/0xff;
		this._backgroundBlue = (value & 0xff)/0xff;
	}
    
    /**
     * 
     */
    public get focalLength():number
    {
        return this._focalLength;
    }

    public set focalLength(value:number)
    {
        if (this._focalLength == value)
            return;

        this._focalLength = value;

        this._updateFocalLength();
    }
    
    /**
     * 
     */
    public get pixelRatio():number
    {
        return this._pixelRatio;
    }

    public set pixelRatio(value:number)
    {
        if (this._pixelRatio == value)
            return;

        this._pixelRatio = value;

        this._updatePixelRatio();
    }
    
    public get projection():ProjectionBase
    {
        return this._projection;
    }
    public set projection(value:ProjectionBase)
	{
        if (value == null)
            throw new ErrorBase("projection cannot be null");
            
		if (this._projection == value)
			return;

		this._projection.removeEventListener(ProjectionEvent.INVALIDATE_VIEW_MATRIX3D, this._onInvalidateViewMatrix3DDelegate);
		
		this._projection = value;

		this._projection.addEventListener(ProjectionEvent.INVALIDATE_VIEW_MATRIX3D, this._onInvalidateViewMatrix3DDelegate);
		
		this._invalidateViewMatrix3D();
    }

    public get target():ImageBase
    {
        return this._target;
    }

    public set target(value:ImageBase)
    {
        if (this._target == value)
            return;

        this._updateTarget(value);
    }

    public get stage():Stage
    {
        return this._stage;
    }

    public get frustumMatrix3D():Matrix3D
	{
		if (this._frustumMatrix3DDirty) {
			this._frustumMatrix3DDirty = false;
            this._frustumMatrix3D.recompose(this._components);
            this._frustumMatrix3D.prepend(this._projection.frustumMatrix3D);
		}

		return this._frustumMatrix3D;
    }
    
    public get viewMatrix3D():Matrix3D
	{
		if (this._viewMatrix3DDirty) {
			this._viewMatrix3DDirty = false;
            this._viewMatrix3D.recompose(this._components);
            this._viewMatrix3D.prepend(this._projection.viewMatrix3D);
		}

		return this._viewMatrix3D;
	}
	
	public get inverseViewMatrix3D():Matrix3D
	{
		if (this._inverseViewMatrix3DDirty) {
			this._inverseViewMatrix3DDirty = false;
			this._inverseViewMatrix3D.copyFrom(this.viewMatrix3D);
			this._inverseViewMatrix3D.invert();
		}
		
		return this._inverseViewMatrix3D;
    }
    
    constructor(projection:ProjectionBase = null, stage:Stage = null, forceSoftware:boolean = false, profile:ContextGLProfile = ContextGLProfile.BASELINE, mode:ContextMode = ContextMode.AUTO)
    {
        super();

        this._components[0] = this._offset;
        this._components[3] = this._scale;

        this._onInvalidateSizeDelegate = (event:StageEvent | AssetEvent) => this._onInvalidateSize(event);
        this._onInvalidateViewMatrix3DDelegate = (event:ProjectionEvent) => this._onInvalidateViewMatrix3D(event);
        
        this._projection = projection || new PerspectiveProjection();

        this._projection.addEventListener(ProjectionEvent.INVALIDATE_VIEW_MATRIX3D, this._onInvalidateViewMatrix3DDelegate);

        if (stage)
            this._shareContext = true;

        this._stage = stage || StageManager.getInstance().getFreeStage(forceSoftware, profile, mode);

        this._stage.addEventListener(StageEvent.INVALIDATE_SIZE, this._onInvalidateSizeDelegate);

        this._targetWidth = this._stage.width;
        this._targetHeight = this._stage.height;
        
        this._updateFocalLength();
        this._updatePixelRatio();
    }

    public clear(enableBackground:boolean = true, enableDepthAndStencil:boolean = true, surfaceSelector:number = 0):void
    {
        this._stage.setRenderTarget(this._target, enableDepthAndStencil, surfaceSelector);

        //TODO: make scissor compatible with image targets
        this._stage.context.setScissorRectangle((this._target == null)? this._rect : null);

        if (enableBackground)
            this._stage.clear(this._backgroundRed, this._backgroundGreen, this._backgroundBlue, this.backgroundAlpha, this.backgroundDepth, this.backgroundStencil, this.backgroundClearMask);
    }

    public present():void
    {
        if (!this._shareContext && this._target == null)
            this._stage.context.present();
    }
    
	/*
	
	 */
	public project(position:Vector3D, target:Vector3D = null):Vector3D
	{
        target = this._projection.project(position, target);

		target.x = (target.x + 1)*this.width/2;
        target.y = (target.y + 1)*this.height/2;
        
        return target;
	}

	public unproject(sX:number, sY:number, sZ:number, target:Vector3D = null):Vector3D
	{
        return this._projection.unproject(2*sX/this.width - 1, 2*sY/this.height - 1, sZ, target);
    }

    public dispose()
    {
        if (this._target) {
            this._target.removeEventListener(AssetEvent.INVALIDATE, this._onInvalidateSizeDelegate);
            this._target = null;
        } else {
            this._stage.removeEventListener(StageEvent.INVALIDATE_SIZE, this._onInvalidateSizeDelegate);

            if (!this._shareContext && this._target == null)
                this._stage.dispose();
            
            this._stage = null;
        }

        if (this._projection) {
            this._projection.removeEventListener(ProjectionEvent.INVALIDATE_VIEW_MATRIX3D, this._onInvalidateViewMatrix3DDelegate);
            this._projection = null;
        }
    }
    
    private _onInvalidateSize(event:StageEvent | AssetEvent):void
    {
        this._updateDimensions();
        this._updateFocalLength();
        this._updatePixelRatio();
    }
        
    private _onInvalidateViewMatrix3D(event:ProjectionEvent):void
	{
		this._invalidateViewMatrix3D();
    }

    private _updateTarget(value:ImageBase):void
    {
        if (this._target)
            this._target.removeEventListener(AssetEvent.INVALIDATE, this._onInvalidateSizeDelegate);
        else
            this._stage.removeEventListener(StageEvent.INVALIDATE_SIZE, this._onInvalidateSizeDelegate);

        this._target = value;

        if (this._target)
            this._target.addEventListener(AssetEvent.INVALIDATE, this._onInvalidateSizeDelegate);
        else
            this._stage.addEventListener(StageEvent.INVALIDATE_SIZE, this._onInvalidateSizeDelegate);
        
        this._updateDimensions();
        this._updateFocalLength();
        this._updatePixelRatio();
    }

    private _updateDimensions():void
    {
        if (this._target) {
            if (this._target instanceof Image2D) {
                this._targetWidth = (<Image2D> this._target).width;
                this._targetHeight = (<Image2D> this._target).height;
            } else if (this._target instanceof ImageCube) {
                this._targetWidth = (<ImageCube> this._target).size;
                this._targetHeight = (<ImageCube> this._target).size;
            }
        } else {
            this._targetWidth = this._stage.width;
            this._targetHeight = this._stage.height;
        }
        
        if (this.preserveDimensions && (this._shareContext || this._target)) {
            this._offset.x = this._rect.x/this._targetWidth;
            this._offset.y = this._rect.y/this._targetHeight;
            this._scale.x = this._rect.width/this._targetWidth;
            this._scale.y = this._rect.height/this._targetHeight;
        } else {
            this._rect.x = this._offset.x*this._targetWidth;
            this._rect.y = this._offset.y*this._targetHeight;
            this._rect.width = this._scale.x*this._targetWidth;
            this._rect.height = this._scale.y*this._targetHeight;

            this._invalidateSize();
        }
    }
    
    private _updateFocalLength():void
    {
        if (this.preserveFocalLength)
            this.projection.scale = this._focalLength/this._rect.height;
        else
            this._focalLength = this._projection.scale*this._rect.height;
    }

    private _updatePixelRatio():void
    {
        if (this.preservePixelRatio)
            this._projection.ratio = this._pixelRatio*this._rect.width/this._rect.height;
        else
            this._pixelRatio = this._projection.ratio*this._rect.height/this._rect.width;
    }

	private _invalidateViewMatrix3D():void
	{
        this._frustumMatrix3DDirty = true;
		this._viewMatrix3DDirty = true;
		this._inverseViewMatrix3DDirty = true;

		this.dispatchEvent(new ViewportEvent(ViewportEvent.INVALIDATE_VIEW_MATRIX3D, this));
    }

    private _invalidateSize():void
	{
		this.dispatchEvent(new ViewportEvent(ViewportEvent.INVALIDATE_SIZE, this));
    }
}