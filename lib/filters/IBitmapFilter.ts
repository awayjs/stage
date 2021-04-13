import { Rectangle } from '@awayjs/core';
import { FilterBase } from './FilterBase';

export interface IBitmapFilterProps {
	filterName: string;
}
export interface IBitmapFilter <V extends string, T extends IBitmapFilterProps> extends FilterBase {
	applyProps(model: Partial<T> & { filterName?: V }): void;
	meashurePad(input: Rectangle, target?: Rectangle): Rectangle;
}
