import { ImageUtils } from '../utils/ImageUtils';

import { ImageBase } from './ImageBase';

export class ImageCube extends ImageBase {
	public static assetType: string = '[image ImageCube]';

	public _size: number;

	/**
	 *
	 * @returns {string}
	 */
	public get assetType(): string {
		return ImageCube.assetType;
	}

	/**
	 * The size of the cube bitmap in pixels.
	 */
	public get size(): number {
		return this._size;
	}

	public set size(value: number) {
		if (this._size == value)
			return;

		this._setSize(this._size);
	}

	/**
	 *
	 */
	constructor(size: number) {
		super();

		this._size = size;

		this._testDimensions();
	}

	/**
	 *
	 * @param width
	 * @param height
	 * @private
	 */
	public _setSize(size: number): void {
		if (this._size != size)
			this.clear();

		this._size = size;

		this._testDimensions();
	}

	/**
	 *
	 * @private
	 */
	private _testDimensions(): void {
		if (!ImageUtils.isDimensionValid(this._size))
			throw new Error('Invalid dimension: Width and height must be power of 2 and cannot exceed 2048');
	}
}

import { ContextGLTextureFormat } from '../base/ContextGLTextureFormat';

import { _Stage_ImageBase } from './ImageBase';

/**
 *
 * @class away.pool.GL_ImageCubeBase
 */
export class _Stage_ImageCube extends _Stage_ImageBase {
	public getType(): string {
		return 'cube';
	}

	/**
     *
     * @param context
     * @returns {ITexture}
     */
	protected _createTexture(): void {
		this._texture = this._stage.context.createCubeTexture((<ImageCube> this._asset).size, ContextGLTextureFormat.BGRA, false);
	}
}
// MOVED TO LIB ROOT
// Stage.registerAbstraction(_Stage_ImageCube, ImageCube);