import { Matrix, Point } from '@awayjs/core';

export class BitmapImageUtils {
	public static drawBitmap(source: Uint8ClampedArray, offsetX: number, offsetY: number, width: number, height: number, canvas: Uint8ClampedArray, canvasOffsetX: number, canvasOffsetY: number, canvasImageWidth: number, canvasImageHeight: number, matrix: Matrix = null): void {
		if (matrix || (canvasImageWidth != width || canvasImageHeight != height)) {
			if (!matrix) {
				matrix = new Matrix();
				matrix.scale(canvasImageWidth / width, canvasImageHeight / height);
			}

			const scaleX: number = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
			const scaleY: number = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);

			var canvasWidth: number = width * scaleX;
			var canvasHeight: number = height * scaleY;

			matrix.tx += canvasOffsetX;
			matrix.ty += canvasOffsetY;

			var canvasOffsetX: number = Math.floor(matrix.tx);
			var canvasOffsetY: number = Math.floor(matrix.ty);

			matrix.invert();

			if (scaleX >= 1 || scaleY >= 1) {
				let p: Point = new Point();
				for (var i: number = canvasOffsetX; i < canvasOffsetX + canvasWidth; i++) {
					for (var j: number = canvasOffsetY; j < canvasOffsetY + canvasHeight; j++) {
						p.x = i;
						p.y = j;
						p = matrix.transformPoint(p);

						var color: number[] = BitmapImageUtils.sampleBilinear(p.x, p.y, source, width, height);
						BitmapImageUtils.applyPixel32(canvas, canvasImageWidth, canvasImageHeight, i, j, color);
					}
				}
			} else {
				//decimate
				let p1: Point = new Point();
				let p2: Point = new Point();
				for (var i: number = canvasOffsetX; i < canvasOffsetX + canvasWidth; i++) {
					for (var j: number = canvasOffsetY; j < canvasOffsetY + canvasHeight; j++) {
						p1.x = i;
						p1.y = j;
						p1 = matrix.transformPoint(p1);

						p2.x = i + 1;
						p2.y = j + 1;
						p2 = matrix.transformPoint(p2);

						var color: number[] = BitmapImageUtils.sampleBox(p1.x + offsetX, p1.y + offsetY, p2.x + offsetX, p2.y + offsetY, source, width, height);
						BitmapImageUtils.applyPixel32(canvas, canvasImageWidth, canvasImageHeight, i, j, color);
					}
				}
			}

			matrix.invert();
		} else {
			for (var i: number = canvasOffsetX; i < canvasOffsetX + canvasWidth; i++) {
				for (var j: number = canvasOffsetY; j < canvasOffsetY + canvasHeight; j++) {
					var color: number[] = BitmapImageUtils.sample(i - canvasOffsetX + offsetX, j - canvasOffsetY + offsetY, source, width, height);
					BitmapImageUtils.applyPixel32(canvas, canvasImageWidth, canvasImageHeight, i, j, color);
				}
			}
		}
	}

	private static applyPixel32(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, color: number[]) {
		//todo: blending support

		x = Math.floor(x);
		y = Math.floor(y);

		if (x < 0 || x >= width || y >= height || y < 0)
			return;

		const index: number = (x + y * width) * 4;
		//var alpha:number = color[3] / 255;
		// target.data[index] += color[0];
		// target.data[index + 1] += color[1];
		// target.data[index + 2] += color[2];
		// target.data[index + 3] += color[3];

		data[index] = color[0];
		data[index + 1] = color[1];
		data[index + 2] = color[2];
		data[index + 3] = color[3];

		data[index] = data[index] & 0xFF;
		data[index + 1] = data[index + 1] & 0xFF;
		data[index + 2] = data[index + 2] & 0xFF;
		data[index + 3] = data[index + 3] & 0xFF;
	}

	public static sampleBilinear(u: number, v: number, data: Uint8ClampedArray, width: number, height: number, texelSizeX: number = 1, texelSizeY: number = 1): number[] {
		const color00: number[] = BitmapImageUtils.sample(u, v, data, width, height);
		const color10: number[] = BitmapImageUtils.sample(u + texelSizeX, v, data, width, height);
		const color01: number[] = BitmapImageUtils.sample(u, v + texelSizeY, data, width, height);
		const color11: number[] = BitmapImageUtils.sample(u + texelSizeX, v + texelSizeY, data, width, height);

		let a: number = u;
		a = a - Math.floor(a);

		const interColor0: number[] = BitmapImageUtils.interpolateColor(color00, color10, a);
		const interColor1: number[] = BitmapImageUtils.interpolateColor(color01, color11, a);

		let b: number = v;
		b = b - Math.floor(b);
		return BitmapImageUtils.interpolateColor(interColor0, interColor1, b);
	}

	public static sample(u: number, v: number, data: Uint8ClampedArray, width: number, height: number): number[] {
		u = Math.floor(u);
		v = Math.floor(v);

		const result: number[] = [0, 0, 0, 0];

		if (u < 0 || u >= width || v < 0 || v >= height) {
			return result;
		}

		const index: number = (u + v * width) * 4;
		result[0] = data[index];
		result[1] = data[index + 1];
		result[2] = data[index + 2];
		result[3] = data[index + 3];
		return result;
	}

	public static sampleBox(x0: number, y0: number, x1: number, y1: number, data: Uint8ClampedArray, width: number, height: number): number[] {
		let area: number = 0;// -- total area accumulated in pixels
		const result: number[] = [0, 0, 0, 0];
		let x: number;
		let y: number;
		let xsize: number;
		let ysize: number;

		let fromY: number = Math.floor(y0);
		let toY: number = Math.ceil(y1);

		fromY = Math.max(Math.min(fromY, height - 1), 0);
		toY = Math.max(Math.min(toY, height - 1), 0);

		for (y = fromY; y < toY; y++) {
			ysize = 1;

			if (y < y0) {
				ysize = ysize * (1.0 - (y0 - y));
			}

			if (y > y1) {
				ysize = ysize * (1.0 - (y - y1));
			}

			let fromX: number = Math.floor(x0);
			let toX: number = Math.ceil(x1);

			fromX = Math.max(Math.min(fromX, width - 1), 0);
			toX = Math.max(Math.min(toX, width - 1), 0);

			for (x = fromX; x < toX; x++) {
				xsize = ysize;

				const color: number[] = BitmapImageUtils.sample(x, y, data, width, height);

				if (x < x0) {
					xsize = xsize * (1.0 - (x0 - x));
				}
				if (x > x1) {
					xsize = xsize * (1.0 - (x - x1));
				}
				result[0] += color[0] * xsize;
				result[1] += color[1] * xsize;
				result[2] += color[2] * xsize;
				result[3] += color[3] * xsize;
				area = area + xsize;
			}
		}

		result[0] /= area;
		result[1] /= area;
		result[2] /= area;
		result[3] /= area;

		result[0] = result[0] & 0xFF;
		result[1] = result[1] & 0xFF;
		result[2] = result[2] & 0xFF;
		result[3] = result[3] & 0xFF;
		return result;
	}

	private static interpolateColor(source: number[], target: number[], a: number): number[] {
		const result: number[] = [];
		result[0] = source[0] + (target[0] - source[0]) * a;
		result[1] = source[1] + (target[1] - source[1]) * a;
		result[2] = source[2] + (target[2] - source[2]) * a;
		result[3] = source[3] + (target[3] - source[3]) * a;
		return result;
	}
}