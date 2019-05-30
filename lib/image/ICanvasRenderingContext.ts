export interface ICanvasRenderingContext
{
	fillStyle: string;

	restore(): void;
    save(): void;

	setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;

	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
	putImageData(imagedata: ImageData, dx: number, dy: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
	
	drawImage(image: any, dstX: number, dstY: number): void;
    drawImage(image: any, dstX: number, dstY: number, dstW: number, dstH: number): void;
    drawImage(image: any, srcX: number, srcY: number, srcW: number, srcH: number, dstX: number, dstY: number, dstW: number, dstH: number): void;
	drawImage(image:HTMLElement, offsetX:number, offsetY:number, width?:number, height?:number, canvasOffsetX?:number, canvasOffsetY?:number, canvasImageWidth?:number, canvasImageHeight?:number):void;

	fillRect(x:number, y:number, w:number, h:number):void;

	clearRect(x:number, y:number, w:number, h:number):void;
}