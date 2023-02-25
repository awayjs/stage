import { IAsset, URLLoaderDataFormat, ParserBase, ByteArray, URLRequest } from '@awayjs/core';

import { Image2D } from '../image/Image2D';
import { ExternalImage2D } from '../image/ExternalImage2D';
import { ImageUtils } from '../utils/ImageUtils';
import { DefaultStageFactory } from '../factories/DefaultStageFactory';
import { IImageFactory } from '../factories/IImageFactory';
import { Settings } from '../Settings';

/**
 * Image2DParser provides a "parser" for natively supported image types (jpg, png). While it simply loads bytes into
 * a loader object, it wraps it in a BitmapDataResource so resource management can happen consistently without
 * exception cases.
 */

type TImage = HTMLImageElement | ImageBitmap;

function getImageFromData (blob: Blob, callback: (arg: TImage) => boolean): TImage {
	// self is window for main ui or self for worker, need use it
	const supportImageBitmap = Settings.ENABLE_PARSER_NATIVE_BITMAP && ('createImageBitmap' in self);

	if (supportImageBitmap) {
		self.createImageBitmap(blob).then(callback);
		return null;
	}

	const url = URL.createObjectURL(blob);
	const image = new Image();
	image.src = url;

	if (!image.naturalWidth) {
		image.onload = (event) => {
			callback(image);
			URL.revokeObjectURL(url);
		};

		return null;
	}

	return image;
}
export class Image2DParser extends ParserBase {
	public static SUPPORTED_TYPES = ['jpg', 'jpeg', 'png', 'gif'];

	private _factory: IImageFactory;
	private _startedParsing: boolean;
	private _doneParsing: boolean;
	private _loadingImage: boolean;
	private _htmlImageElement: HTMLImageElement | ImageBitmap;

	private _alphaChannel: Uint8Array;

	/**
	 * Creates a new Image2DParser object.
	 * @param uri The url or id of the data or file to be parsed.
	 * @param extra The holder for extra contextual data that the parser might need.
	 */
	constructor(factory: IImageFactory = null, alphaChannel: Uint8Array = null) {
		super(URLLoaderDataFormat.BLOB);
		this._factory = factory || new DefaultStageFactory();
		this._alphaChannel = alphaChannel;
	}

	/**
	 * Indicates whether or not a given file extension is supported by the parser.
	 * @param extension The file extension of a potential file to be parsed.
	 * @return Whether or not the given file type is supported.
	 */
	public static supportsType(extension: string): boolean {

		extension = extension.toLowerCase().trim();
		return this.SUPPORTED_TYPES.includes(extension);
	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data: any): boolean {

		if (data  instanceof HTMLImageElement)
			return true;

		if (!(data instanceof ByteArray))
			return false;

		const ba: ByteArray = <ByteArray> data;
		ba.position = 0;

		if (ba.readUnsignedShort() == 0xd8ff)
			return true; // JPEG, maybe check for "JFIF" as well?

		ba.position = 0;
		if (ba.readShort() == 0x424D)
			return true; // BMP

		ba.position = 1;
		if (ba.readUTFBytes(3) == 'PNG')
			return true;

		ba.position = 0;
		if (ba.readUTFBytes(3) == 'GIF' && ba.readShort() == 0x3839 && ba.readByte() == 0x61)
			return true;

		ba.position = 0;
		if (ba.readUTFBytes(3) == 'ATF')
			return true;

		return false;

	}

	public _pFinalizeAsset(asset: IAsset, fileName: string): void {
		if (this._alphaChannel)
			(<Image2D>asset).alphaChannel = this._alphaChannel;

		super._pFinalizeAsset(asset, fileName);
	}

	/**
	 * @inheritDoc
	 */
	public _pProceedParsing(): boolean {

		if (this._loadingImage) {
			return ParserBase.MORE_TO_PARSE;
		}

		let asset: Image2D;

		if (!this._htmlImageElement && this.data instanceof HTMLImageElement) {
			this._htmlImageElement = this.data;
		}

		if (this._htmlImageElement) {
			const asset = ImageUtils.imageToBitmapImage2D(this._htmlImageElement, false, this._factory);

			this._pFinalizeAsset(asset, this._iFileName);
			this._pContent = asset;

			return ParserBase.PARSING_DONE;

		}

		if (this.data instanceof URLRequest) {
			asset = new ExternalImage2D(<URLRequest> this.data);

			this._pFinalizeAsset(<IAsset> asset, this._iFileName);
			this._pContent = asset;

			return ParserBase.PARSING_DONE;
		}

		let blob: Blob;

		if (this.data instanceof ByteArray) { // Parse a ByteArray

			const ba: ByteArray = this.data;
			ba.position = 0;
			blob =  new Blob([this.data.arraybytes]);

		} else if (this.data instanceof ArrayBuffer) {// Parse an ArrayBuffer
			blob = new Blob([this.data]);

		} else if (this.data instanceof Blob) {
			blob = this.data;

		} else {
			throw 'Unknow data';
		}

		const task = getImageFromData(blob, (image) => {
			this._htmlImageElement = image;
			this.onLoadComplete(null);

			return true;
		});

		if (task instanceof HTMLImageElement && task.naturalWidth) {
			this._htmlImageElement = task;

			asset = ImageUtils.imageToBitmapImage2D(this._htmlImageElement, false, this._factory);

			this._pFinalizeAsset(<IAsset> asset, this._iFileName);
			this._pContent = asset;

		}

		this._loadingImage = true;
		return ParserBase.MORE_TO_PARSE;
	}

	public onLoadComplete(event): void {
		this._loadingImage = false;
	}
}