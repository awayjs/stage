import { FilterBase } from './FilterBase';

export interface IBitmapFilterProps {}
export interface IBitmapFilter <V extends string, T extends IBitmapFilterProps> extends FilterBase {
	applyProps(model: Partial<T> & { filterName?: V }): void;
}
