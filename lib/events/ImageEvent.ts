import { EventBase } from '@awayjs/core';

import { ImageBase } from '../image/ImageBase';

export class ImageEvent extends EventBase {
	/**
	 *
	 */
	public static INVALIDATE_MIPMAPS: string = 'invalidateMipmaps';

	private _image: ImageBase;

	/**
	 * Create a new ImageEvent
	 * @param type The event type.
	 * @param image The instance of the image being updated.
	 */
	constructor(type: string, image: ImageBase) {
		super(type);

		this._image = image;
	}

	/**
	 * The image of the material.
	 */
	public get image(): ImageBase {
		return this._image;
	}
}