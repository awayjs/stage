import { AssetBase } from '@awayjs/core';

import { ImageEvent } from '../events/ImageEvent';

export class ImageBase extends AssetBase {
	private _format: string = 'bgra';

	private _isDisposed: boolean = false;

	public get isDisposed() {
		return this._isDisposed;
	}

	/**
	 *
	 * @returns {string}
	 */
	public get format(): string {
		return this._format;
	}

	public getImageType(): string {
		throw new AbstractMethodError();
	}

	/**
	 *
	 */
	constructor() {
		super();
	}

	public dispose() {
		this._isDisposed = true;
		this.clear();
	}

	/**
	 *
	 */
	public invalidateMipmaps(): void {
		this.dispatchEvent(new ImageEvent(ImageEvent.INVALIDATE_MIPMAPS, this));
	}
}

import { AbstractMethodError, AbstractionBase } from '@awayjs/core';

import { ITextureBase } from '../base/ITextureBase';
import { ImageUtils } from '../utils/ImageUtils';

import { ImageSampler } from './ImageSampler';

import { Stage } from '../Stage';

/**
 *
 * @class away.pool.GL_ImageBase
 */
export class _Stage_ImageBase extends AbstractionBase {
	public usages: number = 0;

	public _texture: ITextureBase;

	public _mipmap: boolean;

	public _invalidMipmaps: boolean = true;

	public _invalidMapper: boolean = true;

	private _onInvalidateMipmapsDelegate: (event: ImageEvent) => void;

	public getTexture(): ITextureBase {
		if (!this._texture) {
			this._createTexture();
			this._invalid = true;
		}

		return this._texture;
	}

	public get image(): ImageBase {
		return this._useWeak ? (<WeakRef<ImageBase>> this._asset).deref() : <ImageBase> this._asset;
	}

	public init(image: ImageBase, stage: Stage): void {
		super.init(image, stage, true);

		this._onInvalidateMipmapsDelegate = (event: ImageEvent) => this._onInvalidateMipmaps(event);

		image.addEventListener(ImageEvent.INVALIDATE_MIPMAPS, this._onInvalidateMipmapsDelegate);
	}

	/**
     *
     */
	public onClear(): void {
		if (this._texture) {
			this._texture.dispose();
			this._texture = null;
		}

		this.image?.removeEventListener(ImageEvent.INVALIDATE_MIPMAPS, this._onInvalidateMipmapsDelegate);

		super.onClear();
	}

	public activate(index: number, sampler: ImageSampler = null): void {
		if (!sampler)
			sampler = ImageUtils.getDefaultImageSampler();

		const mipmap: boolean = (sampler.mipmap && !(<Stage> this._pool).globalDisableMipmap) ? sampler.mipmap : false;

		(<Stage> this._pool).setSamplerAt(index, sampler);
		(<Stage> this._pool).context.setTextureAt(index, this.getTexture());

		if (!this._mipmap && mipmap) {
			this._mipmap = true;
			this._invalidMipmaps = true;
		}

		if (this._invalidMipmaps) {
			this._invalidMipmaps = false;

			if (mipmap) //todo: allow for non-generated mipmaps
				this._texture.generateMipmaps();
		}
	}

	protected _createTexture(): void {
		throw new AbstractMethodError();
	}

	/**
     *
     */
	private _onInvalidateMipmaps(event: ImageEvent): void {
		this._invalidMipmaps = true;
	}
}