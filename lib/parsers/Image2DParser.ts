import {IAsset, URLLoaderDataFormat, ParserBase, ParserUtils, ByteArray, URLRequest} from "@awayjs/core";

import {Image2D} from "../image/Image2D";
import {ExternalImage2D} from "../image/ExternalImage2D";
import {ImageUtils} from "../utils/ImageUtils";
import {DefaultGraphicsFactory} from "../factories/DefaultGraphicsFactory";
import {IGraphicsFactory} from "../factories/IGraphicsFactory";

/**
 * Image2DParser provides a "parser" for natively supported image types (jpg, png). While it simply loads bytes into
 * a loader object, it wraps it in a BitmapDataResource so resource management can happen consistently without
 * exception cases.
 */
export class Image2DParser extends ParserBase
{
	private _factory:IGraphicsFactory;
	private _startedParsing:boolean;
	private _doneParsing:boolean;
	private _loadingImage:boolean;
	private _htmlImageElement:HTMLImageElement;
	
	private _alphaChannel:Uint8Array;

	/**
	 * Creates a new Image2DParser object.
	 * @param uri The url or id of the data or file to be parsed.
	 * @param extra The holder for extra contextual data that the parser might need.
	 */
	constructor(factory:IGraphicsFactory = null, alphaChannel:Uint8Array=null)
	{
		super(URLLoaderDataFormat.BLOB);
		this._factory = factory || new DefaultGraphicsFactory();
		this._alphaChannel=alphaChannel;
	}

	/**
	 * Indicates whether or not a given file extension is supported by the parser.
	 * @param extension The file extension of a potential file to be parsed.
	 * @return Whether or not the given file type is supported.
	 */
	public static supportsType(extension:string):boolean
	{

		extension = extension.toLowerCase();
		return extension == "jpg" || extension == "jpeg" || extension == "png" || extension == "gif";//|| extension == "bmp";//|| extension == "atf";

	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data:any):boolean
	{

		if (data  instanceof HTMLImageElement)
			return true;

		if (!(data instanceof ByteArray))
			return false;

		var ba:ByteArray = <ByteArray> data;
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

	public _pFinalizeAsset(asset:IAsset, fileName:string):void
	{
		if(this._alphaChannel)
			(<Image2D>asset).alphaChannel = this._alphaChannel;

		super._pFinalizeAsset(asset, fileName)
	}

	/**
	 * @inheritDoc
	 */
	public _pProceedParsing():boolean
	{

		var asset:Image2D;
		var sizeError:boolean = false;

		if (this._loadingImage) {
			return ParserBase.MORE_TO_PARSE;
		} else if (this._htmlImageElement) {
			//if (ImageUtils.isHTMLImageElementValid(this._htmlImageElement)) {
				asset = ImageUtils.imageToBitmapImage2D(this._htmlImageElement, false, this._factory);
				this._pFinalizeAsset(<IAsset> asset, this._iFileName);
			//}
		} else if (this.data instanceof HTMLImageElement) {// Parse HTMLImageElement
			var htmlImageElement:HTMLImageElement = <HTMLImageElement> this.data;
			//if (ImageUtils.isHTMLImageElementValid(htmlImageElement)) {

				asset = ImageUtils.imageToBitmapImage2D(htmlImageElement, false, this._factory);
				this._pFinalizeAsset(<IAsset> asset, this._iFileName);
			//} else {
			//	sizeError = true;
			//}

		} else if (this.data instanceof ByteArray) { // Parse a ByteArray

			var ba:ByteArray = this.data;
			ba.position = 0;
			this._htmlImageElement = ParserUtils.byteArrayToImage(this.data);

			if (!this._htmlImageElement.naturalWidth) {
				this._htmlImageElement.onload = (event) => this.onLoadComplete(event);
				this._loadingImage = true;

				return ParserBase.MORE_TO_PARSE;
			}

			//if (ImageUtils.isHTMLImageElementValid(this._htmlImageElement)) {
				asset = ImageUtils.imageToBitmapImage2D(this._htmlImageElement, false, this._factory);
				this._pFinalizeAsset(<IAsset> asset, this._iFileName);
			//} else {
			//	sizeError = true;
			//
			//}

		} else if (this.data instanceof ArrayBuffer) {// Parse an ArrayBuffer

			this._htmlImageElement = ParserUtils.arrayBufferToImage(this.data);

			asset = ImageUtils.imageToBitmapImage2D(this._htmlImageElement, false, this._factory);
			this._pFinalizeAsset(<IAsset> asset, this._iFileName);

		} else if (this.data instanceof Blob) { // Parse a Blob

			this._htmlImageElement = ParserUtils.blobToImage(this.data);

			this._htmlImageElement.onload = (event) => this.onLoadComplete(event);
			this._loadingImage = true;

			return ParserBase.MORE_TO_PARSE;
		} else if (this.data instanceof URLRequest) { // Parse a URLRequest
			asset = new ExternalImage2D(<URLRequest> this.data);
			this._pFinalizeAsset(<IAsset> asset, this._iFileName);
		}

		if (sizeError) // Generate new Checkerboard texture material
		{
//				asset = new BitmapTexture(DefaultMaterialManager.createCheckeredBitmapData(), false);
//				this._pFinalizeAsset(<IAsset> asset, this._iFileName);
//				this.dispatchEvent(new away.events.AssetEvent(away.events.AssetEvent.TEXTURE_SIZE_ERROR, <IAsset> asset));
		}

		this._pContent = asset;

		return ParserBase.PARSING_DONE;

	}

	public onLoadComplete(event):void
	{
		this._loadingImage = false;
	}
}