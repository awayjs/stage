import { Image2D } from '../image/Image2D';

export interface IGraphicsFactory
{
	createImage2D(width: number, height: number, transparent?: boolean, fillColor?: number, powerOfTwo?: boolean): Image2D;
}