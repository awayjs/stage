import { IIndexBuffer } from './IIndexBuffer';

export interface IVao {
	attachIndexBuffer(buffer: IIndexBuffer): void;
	bind(): void;
	unbind(force: boolean): void;
	dispose(): void;
}