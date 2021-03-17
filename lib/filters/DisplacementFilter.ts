import { Point } from '@awayjs/core';
import { Image2D } from '../image/Image2D';
import { proxyTo } from '../utils/FilterUtils';
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

	@proxyTo('_displacement')
	mapBitmap: Image2D;

	@proxyTo('_displacement')
	mapPoint: Point;

	@proxyTo('_displacement')
	componentX: ui8;

	@proxyTo('_displacement')
	componentY: ui8;

	@proxyTo('_displacement')
	scaleX: number;

	@proxyTo('_displacement')
	scaleY: number;

	@proxyTo('_displacement')
	mode: DisplacementMode;

	@proxyTo('_displacement')
	color: ui32;

	@proxyTo('_displacement')
	alpha: number;

	constructor (props?: Partial<IDisplacementFilter>) {
		super();

		this.addTask(this._displacement);
		this.applyProps(props);
	}

	public applyProps(props: Partial<IDisplacementFilter>): void {
		if (!props) return;

		// run all model field that changed
		for (const key in props) {
			this[key] = props[key];
		}
	}

}