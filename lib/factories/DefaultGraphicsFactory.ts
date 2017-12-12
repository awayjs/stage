import {BitmapImage2D} from "../image/BitmapImage2D";
import {Image2D} from "../image/Image2D";

import {IGraphicsFactory} from "./IGraphicsFactory";

export class DefaultGraphicsFactory implements IGraphicsFactory
{
	public createImage2D(width:number, height:number, transparent:boolean = true, fillColor:number = null, powerOfTwo:boolean = true):Image2D
	{
		return new BitmapImage2D(width, height, transparent, fillColor, powerOfTwo)
	}
}