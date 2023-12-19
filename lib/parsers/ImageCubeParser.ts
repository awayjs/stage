import { IAsset, URLLoaderDataFormat, URLRequest, ParserBase, ResourceDependency, Rectangle } from '@awayjs/core';

import { BitmapImage2D } from '../image/BitmapImage2D';
import { BitmapImageCube } from '../image/BitmapImageCube';

/**
 * ImageCubeParser provides a "parser" for natively supported image types (jpg, png). While it simply loads bytes into
 * a loader object, it wraps it in a BitmapImage2DResource so resource management can happen consistently without
 * exception cases.
 */
export class ImageCubeParser extends ParserBase {
	private static posX: string = 'posX';
	private static negX: string = 'negX';
	private static posY: string = 'posY';
	private static negY: string = 'negY';
	private static posZ: string = 'posZ';
	private static negZ: string = 'negZ';

	private _imgDependencyDictionary: Object;

	/**
	 * Creates a new ImageCubeParser object.
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
		return extension == 'cube';
	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data: any): boolean {
		try {
			const obj = JSON.parse(data);

			if (obj)
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

	}

	/**
	 * @inheritDoc
	 */
	public resolveDependencyFailure(resourceDependency: ResourceDependency): void {

	}

	/**
	 * @inheritDoc
	 */
	protected proceedParsing(): void {
		if (this._imgDependencyDictionary != null) { //all images loaded
			const asset: BitmapImageCube = new BitmapImageCube(this._getBitmapImage2D(ImageCubeParser.posX).width);
			const rect: Rectangle = new Rectangle(0, 0, asset.size, asset.size);

			asset.setPixels(BitmapImageCube.posX, rect, this._getBitmapImage2D(ImageCubeParser.posX).data);
			asset.setPixels(BitmapImageCube.negX, rect, this._getBitmapImage2D(ImageCubeParser.negX).data);
			asset.setPixels(BitmapImageCube.posY, rect, this._getBitmapImage2D(ImageCubeParser.posY).data);
			asset.setPixels(BitmapImageCube.negY, rect, this._getBitmapImage2D(ImageCubeParser.negY).data);
			asset.setPixels(BitmapImageCube.posZ, rect, this._getBitmapImage2D(ImageCubeParser.posZ).data);
			asset.setPixels(BitmapImageCube.negZ, rect, this._getBitmapImage2D(ImageCubeParser.negZ).data);

			//clear dictionary
			this._imgDependencyDictionary = null;

			asset.name = this.fileName;

			this.finalizeAsset(<IAsset> asset, this.fileName);

			return this.finishParsing();
		}

		try {
			const json: any = JSON.parse(this.data);

			if (!json || !json.data || json.data.length != 6)
				return this.dieWithError('ImageCubeParser: Error - cube texture should have exactly 6 images');

			let rec: any;
			const data: Array<Object> = <Array<Object>> json.data;

			this._imgDependencyDictionary = new Object();

			for (let c: number = 0; c < data.length; c++) {
				rec = data[c];
				this._imgDependencyDictionary[rec.id] = this.addDependency(rec.id, new URLRequest(rec.image.toString()));
			}

			if (!this._validateCubeData())
				return this.dieWithError('ImageCubeParser: JSON data error - cubes require id of:   \n' + ImageCubeParser.posX + ', ' + ImageCubeParser.negX + ',  \n' + ImageCubeParser.posY + ', ' + ImageCubeParser.negY + ',  \n' + ImageCubeParser.posZ + ', ' + ImageCubeParser.negZ);

			this.pauseAndRetrieveDependencies();
		} catch (e) {
			this.dieWithError('CubeTexturePaser Error parsing JSON');
		}
	}

	private _validateCubeData(): boolean {
		return (this._imgDependencyDictionary[ ImageCubeParser.posX ] != null
			&& this._imgDependencyDictionary[ ImageCubeParser.negX ] != null
			&& this._imgDependencyDictionary[ ImageCubeParser.posY ] != null
			&& this._imgDependencyDictionary[ ImageCubeParser.negY ] != null
			&& this._imgDependencyDictionary[ ImageCubeParser.posZ ] != null
			&& this._imgDependencyDictionary[ ImageCubeParser.negZ ] != null);
	}

	private _getBitmapImage2D(name: string): BitmapImage2D {
		const dependency: ResourceDependency = <ResourceDependency> this._imgDependencyDictionary[ name ];

		if (dependency)
			return <BitmapImage2D> dependency.assets[0];

		return null;
	}

}