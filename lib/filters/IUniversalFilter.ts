import { FilterBase } from './FilterBase';

export interface IUniversalFilter <T = any> extends FilterBase {
	applyProps(options: Partial<T>): void;
}