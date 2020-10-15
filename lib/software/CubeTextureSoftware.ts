import { ByteArray } from '@awayjs/core';

import { ICubeTexture } from '../base/ICubeTexture';

import { ITextureBaseSoftware } from './ITextureBaseSoftware';
import { ITextureBaseSoftwareClass } from './ITextureBaseSoftwareClass';

export class CubeTextureSoftware implements ICubeTexture, ITextureBaseSoftware {
	private _textureSelectorDictionary: Uint8ClampedArray[][] = [[],[],[],[],[],[]];

	public static textureType: string = 'textureCube';

	private _size: number;

	public get textureType(): string {
		return CubeTextureSoftware.textureType;
	}

	public get size(): number {
		return this._size;
	}

	constructor(size: number) {
		this._size = size;
	}

	public dispose(): void {
		this._textureSelectorDictionary = null;
	}

	public isTexture(textureClass: ITextureBaseSoftwareClass): boolean {
		return this.textureType == textureClass.textureType;
	}

	public uploadFromArray(array: Uint8Array | Array<number>, side: number, miplevel: number = 0, premultiplied: boolean = false): void {
		this._textureSelectorDictionary[side][miplevel] = ((array instanceof Array) ? new Uint8ClampedArray(array) : new Uint8ClampedArray(array.buffer));
	}

	public getData(side: number, miplevel: number = 0): Uint8ClampedArray {
		return this._textureSelectorDictionary[side][miplevel];
	}

	public getMipLevelsCount(): number {
		return 1;
	}

	public generateMipmaps(): void {
		//TODO
	}

	public uploadCompressedTextureFromArray(array: Uint8Array, offset: number, async: boolean) {
		// TODO
	}
}