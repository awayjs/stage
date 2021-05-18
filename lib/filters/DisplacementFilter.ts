import { Point, Rectangle } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { PROPS_LIST as PROPS_LIST, proxyTo, serialisable } from '../utils/FilterUtils';
import { FilterBase } from './FilterBase';
import { IBitmapFilter } from './IBitmapFilter';
import { DisplacementTask } from './tasks/DisplacementTask';

type DisplacementMode = 'clamp' | 'wrap' | 'ignore' | 'color';

export interface IDisplacementFilter {
	filterName: 'displacement';
	mapBitmap: Image2D;
	mapPoint: Point;
	componentX: ui8;
	componentY: ui8;
	scaleX: number;
	scaleY: number;
	mode: DisplacementMode;
	color: ui32;
	alpha: number;
}

export class DisplacementFilter extends FilterBase implements IBitmapFilter<'displacement', IDisplacementFilter> {
	public static readonly filterName = 'displacement';

	private _displacement: DisplacementTask = new DisplacementTask();

	@serialisable
	@proxyTo('_displacement')
	mapBitmap: Image2D;

	@serialisable
	@proxyTo('_displacement')
	mapPoint: Point;

	@serialisable
	@proxyTo('_displacement')
	componentX: ui8;

	@serialisable
	@proxyTo('_displacement')
	componentY: ui8;

	@serialisable
	@proxyTo('_displacement')
	scaleX: number;

	@serialisable
	@proxyTo('_displacement')
	scaleY: number;

	@serialisable
	@proxyTo('_displacement')
	mode: DisplacementMode;

	@serialisable
	@proxyTo('_displacement')
	color: ui32;

	@serialisable
	@proxyTo('_displacement')
	alpha: number;

	constructor (props?: Partial<IDisplacementFilter>) {
		super();

		this.addTask(this._displacement);
		this.applyProps(props);
	}

	public applyProps(model: Partial<IDisplacementFilter>): void {
		if (!model) return;

		// run all model field that changed
		for (const key of this[PROPS_LIST]) {
			if (key in model) {
				this[key] = model[key];
			}
		}
	}

	meashurePad(input: Rectangle, target: Rectangle): Rectangle {
		target = super.meashurePad(input, target);

		// because by dock scaleX is half range how we can move left/right
		// minX is -(scaleX / 2), maxX is (scaleX / 2)
		const SCALE = 4;

		target.x = Math.max(0, target.x - this.scaleX / SCALE | 0);
		target.y = Math.max(0, target.y - this.scaleY / SCALE | 0);

		target.width += Math.ceil(this.scaleX / SCALE);
		target.height += Math.ceil(this.scaleY / SCALE);

		return  target;
	}
}