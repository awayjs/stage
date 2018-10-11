import {EventBase} from "@awayjs/core";

import {Viewport} from "../Viewport";

export class ViewportEvent extends EventBase
{
	public static INVALIDATE_VIEW_MATRIX3D:string = "invalidateViewMatrix3D";

	public static INVALIDATE_SIZE:string = "invalidateSize";

	private _viewport:Viewport;

	constructor(type:string, viewport:Viewport)
	{
		super(type);
		
		this._viewport = viewport;
	}

	public get viewport():Viewport
	{
		return this._viewport;
	}
}