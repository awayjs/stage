import {AssetBase} from "@awayjs/core";

import {ImageEvent} from "../events/ImageEvent";

export class ImageBase extends AssetBase
{
	public _pFormat:string = "bgra";

	/**
	 *
	 */
	constructor()
	{
		super();
	}

	/**
	 *
	 * @returns {string}
	 */
	public get format():string
	{
		return this._pFormat;
	}

	/**
	 *
	 */
	public invalidateMipmaps():void
	{
		this.dispatchEvent(new ImageEvent(ImageEvent.INVALIDATE_MIPMAPS, this));
	}
}