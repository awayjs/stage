import { Rectangle } from '@awayjs/core';

export class FilterUtils {
	private static blurFilterStepWidths: number[] = [
		0.5, 1.05, 1.35, 1.55, 1.75, 1.9, 2, 2.1, 2.2, 2.3, 2.5, 3, 3, 3.5, 3.5
	];

	public static meashureBlurBounds (
		bounds: Rectangle,
		blurX: number,
		blurY: number,
		quality: ui8,
		isBlurFilter: boolean = false,
		target?: Rectangle
	): Rectangle {
		const stepWidth = this.blurFilterStepWidths[quality - 1];

		if (isBlurFilter) {
			// BlurFilter behaves slightly different from other blur based filters:
			// Given ascending blurX/blurY values, generateFilterRect with BlurFilter
			// expands the source rect later than with i.e. GlowFilter. The difference
			// appears to be stepWidth / 4 for all quality values.
			const stepWidth4 = stepWidth / 4;
			blurX -= stepWidth4;
			blurY -= stepWidth4;
		}

		// Calculate horizontal and vertical borders:
		// blurX/blurY values <= 1 are always rounded up to 1,
		// which means that generateFilterRect always expands the source rect,
		// even when blurX/blurY is 0.
		const bh = Math.ceil((blurX < 1 ? 1 : blurX) * stepWidth);
		const bv = Math.ceil((blurY < 1 ? 1 : blurY) * stepWidth);

		target = target || new Rectangle();
		target.copyFrom(bounds);

		target.x -= bh;
		target.y -= bv;
		target.width += 2 * bh;
		target.height += 2 * bv;

		return target;
	}
}