import { ICanvasRenderingContext } from './ICanvasRenderingContext';

export interface IImageCanvas
{
	width: number;
	
	height: number;
	
	getContext(contextId: "2d"): ICanvasRenderingContext;
}