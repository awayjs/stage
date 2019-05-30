import {ColorTransform, Matrix, Rectangle, Point, ColorUtils} from "@awayjs/core";

import {BlendMode} from "../image/BlendMode";
import { ICanvasRenderingContext } from '../image/ICanvasRenderingContext';

export class BitmapImageUtils
{
	public static _fillRect(context:ICanvasRenderingContext, rect:Rectangle, color:number, transparent:boolean):void
	{
		if (( color & 0xff000000 ) >>> 24 != 0xFF && transparent)
			context.clearRect(rect.x, rect.y, rect.width, rect.height);

		var argb:number[] = ColorUtils.float32ColorToARGB(color);

		if (transparent)
			context.fillStyle = 'rgba(' + argb[1] + ',' + argb[2] + ',' + argb[3] + ',' + argb[0]/255 + ')';
		else
			context.fillStyle = 'rgba(' + argb[1] + ',' + argb[2] + ',' + argb[3] + ',1)';

		context.fillRect(rect.x, rect.y, rect.width, rect.height);
	}

	public static _copyPixels(context:ICanvasRenderingContext, bmpd:HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, sourceRect:Rectangle, destPoint:Point):void
	{
		if (sourceRect.width > 0 && sourceRect.height > 0)
			context.drawImage(bmpd, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);
	}

	public static _draw(context:ICanvasRenderingContext, source:any, matrix:Matrix, colorTransform:ColorTransform, blendMode:BlendMode, clipRect:Rectangle, smoothing:boolean):void
	{
		context.save();

		if (matrix != null)
			context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

		if (source instanceof Uint8Array) {
			if (clipRect != null) {
				var imageData:ImageData = context.getImageData(0, 0, clipRect.width, clipRect.height);
				(<any> imageData).data = source;
				context.putImageData(imageData, 0, 0);
			}
			else {
				console.log("  no rect");
			}
		}
		else {
			if (clipRect != null)
				context.drawImage(source, clipRect.x, clipRect.y, clipRect.width, clipRect.height);
			else
				context.drawImage(source, 0, 0);
		}

		context.restore();
	}
}