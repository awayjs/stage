import { Rectangle, URLLoaderDataFormat, URLRequest, ParserBase, ParserUtils, ResourceDependency, XmlUtils } from '@awayjs/core';

import { ImageSampler } from '../image/ImageSampler';
import { BitmapImage2D } from '../image/BitmapImage2D';

/**
 * TextureAtlasParser provides a "parser" for natively supported image types (jpg, png). While it simply loads bytes into
 * a loader object, it wraps it in a BitmapImage2DResource so resource management can happen consistently without
 * exception cases.
 */
export class TextureAtlasParser extends ParserBase {
	private _doc: Node;
	private _imagePath: string;
	private _imageData: BitmapImage2D;
	private _subTextureNodes: NodeList;
	private _parseState: TextureAtlasParserState = TextureAtlasParserState.PARSE_XML;

	/**
	 * Creates a new TextureAtlasParser object.
	 * @param uri The url or id of the data or file to be parsed.
	 * @param extra The holder for extra contextual data that the parser might need.
	 */
	constructor() {
		super(URLLoaderDataFormat.TEXT);
	}

	/**
	 * Indicates whether or not a given file extension is supported by the parser.
	 * @param extension The file extension of a potential file to be parsed.
	 * @return Whether or not the given file type is supported.
	 */

	public static supportsType(extension: string): boolean {
		extension = extension.toLowerCase();
		return extension == 'xml';
	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data: any): boolean {
		try {
			const content: string = ParserUtils.toString(data);
			if (content.indexOf('TextureAtlas') != -1 || content.indexOf('textureatlas') != -1)
				return true;

			return false;
		} catch (e) {
			return false;
		}
	}

	/**
	 * @inheritDoc
	 */
	public resolveDependency(resourceDependency: ResourceDependency): void {
		if (resourceDependency.assets.length) {
			this._imageData = <BitmapImage2D> resourceDependency.assets[0];
			this.finalizeAsset(this._imageData);
			this._parseState = TextureAtlasParserState.PARSE_SUBTEXTURES;
		} else {
			this._parseState = TextureAtlasParserState.PARSE_COMPLETE;
		}
	}

	/**
	 * @inheritDoc
	 */
	public resolveDependencyFailure(resourceDependency: ResourceDependency): void {
		this._parseState = TextureAtlasParserState.PARSE_COMPLETE;
	}

	/**
	 * @inheritDoc
	 */
	protected proceedParsing(): void {
		let nodes: NodeList;

		switch (this._parseState) {
			case TextureAtlasParserState.PARSE_XML:
				try {
					this._doc = XmlUtils.getChildrenWithTag(XmlUtils.strToXml(this.getTextData()), 'TextureAtlas')[0];

					this._imagePath = XmlUtils.readAttributeValue(this._doc, 'imagePath');

					this._subTextureNodes = XmlUtils.getChildrenWithTag(this._doc, 'SubTexture');

					this._parseState = TextureAtlasParserState.PARSE_IMAGE;

					if (this.hasTime())
						this.proceedParsing();

				} catch (Error) {
					this.dieWithError('TextureAtlasParser Error parsing XML');
				}
				break;

			case TextureAtlasParserState.PARSE_IMAGE:
				if (this._imagePath) {
					this.addDependency(this._imagePath, new URLRequest(this._imagePath));
					this.pauseAndRetrieveDependencies();
				} else {
					this.dieWithError('TextureAtlasParser Missing imagePath attribute in XML');
				}

				break;

			case TextureAtlasParserState.PARSE_SUBTEXTURES:
				var sampler: ImageSampler;
				var element: Node;
				var x: string;
				var y: string;
				var width: string;
				var height: string;
				var len: number = this._subTextureNodes.length;
				for (let i: number = 0; i < len; i++) {
					element = this._subTextureNodes[i];
					sampler = new ImageSampler();

					//setup subtexture rect
					x = XmlUtils.readAttributeValue(element, 'x');
					y = XmlUtils.readAttributeValue(element, 'y');
					width = XmlUtils.readAttributeValue(element, 'width');
					height = XmlUtils.readAttributeValue(element, 'height');
					if (x || y || width || height)
						sampler.imageRect = new Rectangle(parseInt(x) / this._imageData.width, parseInt(y) / this._imageData.height, parseInt(width) / this._imageData.width, parseInt(height) / this._imageData.height);

					//setup frame rect
					x = XmlUtils.readAttributeValue(element, 'frameX');
					y = XmlUtils.readAttributeValue(element, 'frameY');
					width = XmlUtils.readAttributeValue(element, 'frameWidth');
					height = XmlUtils.readAttributeValue(element, 'frameHeight');
					if (x || y || width || height)
						sampler.frameRect = new Rectangle(parseInt(x), parseInt(y), parseInt(width), parseInt(height));

					this.finalizeAsset(sampler, XmlUtils.readAttributeValue(element, 'name'));
				}

				this._parseState = TextureAtlasParserState.PARSE_COMPLETE;

				break;

			case TextureAtlasParserState.PARSE_COMPLETE:
				return this.finishParsing();
		}
	}
}

enum TextureAtlasParserState {
	PARSE_XML,
	PARSE_IMAGE,
	PARSE_SUBTEXTURES,
	PARSE_COMPLETE,
}