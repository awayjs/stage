import {ColorTransform, Matrix, Rectangle, Point, ColorUtils, URLRequest} from "@awayjs/core";

import {Image2D} from "./Image2D";

/**

 */
export class ExternalImage2D extends Image2D
{
	public static assetType:string = "[image ExternalImage2D]";

	private _urlRequest:URLRequest;

	/**
	 *
	 * @returns {string}
	 */
	public get assetType():string
	{
		return ExternalImage2D.assetType;
	}

	public get urlRequest():URLRequest
	{
		return this._urlRequest;
	}

	public set urlRequest(value:URLRequest)
	{
		this._urlRequest = value;
	}

	/**
	 *
	 */
	constructor(urlRequest:URLRequest)
	{
		super(8, 8, true);

		this._urlRequest = urlRequest;
	}

	/**
	 * Returns a new ExternalImage2D object that is a clone of the original instance
	 * with an exact copy of the contained bitmap.
	 *
	 * @return A new ExternalImage2D object that is identical to the original.
	 */
	public clone():ExternalImage2D
	{
		var t:ExternalImage2D = new ExternalImage2D(this._urlRequest);
		return t;
	}
}