import { Filter3DBase } from './Filter3DBase';

export interface IUniversalFilter <T = any> extends Filter3DBase {
	applyModel(options: Partial<T>): void;
}