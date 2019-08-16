import {ColorTransform, Matrix, Rectangle, Point, ColorUtils} from "@awayjs/core";

import {BitmapImageUtils} from "../utils/BitmapImageUtils";

import {Image2D} from "./Image2D";
import {BlendMode} from "./BlendMode";
import {IImageCanvas} from "./IImageCanvas";
import {ICanvasRenderingContext} from "./ICanvasRenderingContext";
import {CPUCanvas} from "./CPUCanvas";
/**
 * The BitmapImage2D export class lets you work with the data(pixels) of a Bitmap
 * object. You can use the methods of the BitmapImage2D export class to create
 * arbitrarily sized transparent or opaque bitmap images and manipulate them
 * in various ways at runtime. You can also access the BitmapImage2D for a bitmap
 * image that you load with the <code>flash.Assets</code> or
 * <code>flash.display.Loader</code> classes.
 *
 * <p>This export class lets you separate bitmap rendering operations from the
 * internal display updating routines of flash. By manipulating a
 * BitmapImage2D object directly, you can create complex images without incurring
 * the per-frame overhead of constantly redrawing the content from vector
 * data.</p>
 *
 * <p>The methods of the BitmapImage2D export class support effects that are not
 * available through the filters available to non-bitmap display objects.</p>
 *
 * <p>A BitmapImage2D object contains an array of pixel data. This data can
 * represent either a fully opaque bitmap or a transparent bitmap that
 * contains alpha channel data. Either type of BitmapImage2D object is stored as
 * a buffer of 32-bit integers. Each 32-bit integer determines the properties
 * of a single pixel in the bitmap.</p>
 *
 * <p>Each 32-bit integer is a combination of four 8-bit channel values(from
 * 0 to 255) that describe the alpha transparency and the red, green, and blue
 * (ARGB) values of the pixel.(For ARGB values, the most significant byte
 * represents the alpha channel value, followed by red, green, and blue.)</p>
 *
 * <p>The four channels(alpha, red, green, and blue) are represented as
 * numbers when you use them with the <code>BitmapImage2D.copyChannel()</code>
 * method or the <code>DisplacementMapFilter.componentX</code> and
 * <code>DisplacementMapFilter.componentY</code> properties, and these numbers
 * are represented by the following constants in the BitmapImage2DChannel
 * class:</p>
 *
 * <ul>
 *   <li><code>BitmapImage2DChannel.ALPHA</code></li>
 *   <li><code>BitmapImage2DChannel.RED</code></li>
 *   <li><code>BitmapImage2DChannel.GREEN</code></li>
 *   <li><code>BitmapImage2DChannel.BLUE</code></li>
 * </ul>
 *
 * <p>You can attach BitmapImage2D objects to a Bitmap object by using the
 * <code>bitmapData</code> property of the Bitmap object.</p>
 *
 * <p>You can use a BitmapImage2D object to fill a Graphics object by using the
 * <code>Graphics.beginBitmapFill()</code> method.</p>
 *
 * <p>You can also use a BitmapImage2D object to perform batch tile rendering
 * using the <code>flash.display.Tilesheet</code> class.</p>
 *
 * <p>In Flash Player 10, the maximum size for a BitmapImage2D object
 * is 8,191 pixels in width or height, and the total number of pixels cannot
 * exceed 16,777,215 pixels.(So, if a BitmapImage2D object is 8,191 pixels wide,
 * it can only be 2,048 pixels high.) In Flash Player 9 and earlier, the limitation
 * is 2,880 pixels in height and 2,880 in width.</p>
 */
export class BitmapImage2D extends Image2D
{
	public static assetType:string = "[image BitmapImage2D]";

	private _imageCanvas:IImageCanvas;
	private _context:ICanvasRenderingContext;
	private _imageData:ImageData;
	protected _transparent:boolean;
	protected _locked:boolean = false;
	private _customMipLevels:BitmapImage2D[];

	public addMipLevel(newLevel:BitmapImage2D):void
	{
		if(!this._customMipLevels)
			this._customMipLevels=[];
		this._customMipLevels.push(newLevel);
	}
	public get mipLevels():BitmapImage2D[]
	{
		return this._customMipLevels;
	}

	/**
	 *
	 * @returns {string}
	 */
	public get assetType():string
	{
		return BitmapImage2D.assetType;
	}

	/**
	 * Defines whether the bitmap image supports per-pixel transparency. You can
	 * set this value only when you construct a BitmapImage2D object by passing in
	 * <code>true</code> for the <code>transparent</code> parameter of the
	 * constructor. Then, after you create a BitmapImage2D object, you can check
	 * whether it supports per-pixel transparency by determining if the value of
	 * the <code>transparent</code> property is <code>true</code>.
	 */
	public get transparent():boolean
	{
		return this._transparent;
	}

	public set transparent(value:boolean)
	{
		this._transparent = value;
	}

	/**
	 * Creates a BitmapImage2D object with a specified width and height. If you
	 * specify a value for the <code>fillColor</code> parameter, every pixel in
	 * the bitmap is set to that color.
	 *
	 * <p>By default, the bitmap is created as transparent, unless you pass
	 * the value <code>false</code> for the transparent parameter. After you
	 * create an opaque bitmap, you cannot change it to a transparent bitmap.
	 * Every pixel in an opaque bitmap uses only 24 bits of color channel
	 * information. If you define the bitmap as transparent, every pixel uses 32
	 * bits of color channel information, including an alpha transparency
	 * channel.</p>
	 *
	 * @param width       The width of the bitmap image in pixels.
	 * @param height      The height of the bitmap image in pixels.
	 * @param transparent Specifies whether the bitmap image supports per-pixel
	 *                    transparency. The default value is <code>true</code>
	 *                    (transparent). To create a fully transparent bitmap,
	 *                    set the value of the <code>transparent</code>
	 *                    parameter to <code>true</code> and the value of the
	 *                    <code>fillColor</code> parameter to 0x00000000(or to
	 *                    0). Setting the <code>transparent</code> property to
	 *                    <code>false</code> can result in minor improvements
	 *                    in rendering performance.
	 * @param fillColor   A 32-bit ARGB color value that you use to fill the
	 *                    bitmap image area. The default value is
	 *                    0xFFFFFFFF(solid white).
	 */
	constructor(width:number, height:number, transparent:boolean = true, fillColor:number = null, powerOfTwo:boolean = true)
	{
		super(width, height, powerOfTwo);

		this._transparent = transparent;
		if(typeof document !== "undefined") {
			this._imageCanvas = <IImageCanvas> document.createElement("canvas");
		}else {
			this._imageCanvas = new CPUCanvas();
		}
		this._imageCanvas.width = this._rect.width;
		this._imageCanvas.height = this._rect.height;
		this._context = this._imageCanvas.getContext("2d");

		if (fillColor != null)
			this.fillRect(this._rect, fillColor);
	}

	/**
	 * Returns a new BitmapImage2D object that is a clone of the original instance
	 * with an exact copy of the contained bitmap.
	 *
	 * @return A new BitmapImage2D object that is identical to the original.
	 */
	public clone():BitmapImage2D
	{
		var t:BitmapImage2D = new BitmapImage2D(this.width, this.height, this.transparent, null, this.powerOfTwo);
		t.copyPixels(this, this.rect, new Point());
		return t;
	}

	/**
	 * Adjusts the color values in a specified area of a bitmap image by using a
	 * <code>ColorTransform</code> object. If the rectangle matches the
	 * boundaries of the bitmap image, this method transforms the color values of
	 * the entire image.
	 *
	 * @param rect           A Rectangle object that defines the area of the
	 *                       image in which the ColorTransform object is applied.
	 * @param colorTransform A ColorTransform object that describes the color
	 *                       transformation values to apply.
	 */
	public colorTransform(rect:Rectangle, colorTransform:ColorTransform):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var data:Uint8ClampedArray = this._imageData.data;

		var i:number, j:number, index:number;
		for (i = 0; i < rect.width; ++i) {
			for (j = 0; j < rect.height; ++j) {
				index = (i + rect.x + (j + rect.y)*this.width)*4;

				data[index] = data[index]*colorTransform.redMultiplier + colorTransform.redOffset;
				data[index + 1] = data[index + 1]*colorTransform.greenMultiplier + colorTransform.greenOffset;
				data[index + 2] = data[index + 2]*colorTransform.blueMultiplier + colorTransform.blueOffset;
				data[index + 3] = data[index + 3]*colorTransform.alphaMultiplier + colorTransform.alphaOffset;
			}
		}

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Transfers data from one channel of another BitmapImage2D object or the
	 * current BitmapImage2D object into a channel of the current BitmapImage2D object.
	 * All of the data in the other channels in the destination BitmapImage2D object
	 * are preserved.
	 *
	 * <p>The source channel value and destination channel value can be one of
	 * following values: </p>
	 *
	 * <ul>
	 *   <li><code>BitmapImage2DChannel.RED</code></li>
	 *   <li><code>BitmapImage2DChannel.GREEN</code></li>
	 *   <li><code>BitmapImage2DChannel.BLUE</code></li>
	 *   <li><code>BitmapImage2DChannel.ALPHA</code></li>
	 * </ul>
	 *
	 * @param sourceBitmapImage2D The input bitmap image to use. The source image
	 *                         can be a different BitmapImage2D object or it can
	 *                         refer to the current BitmapImage2D object.
	 * @param sourceRect       The source Rectangle object. To copy only channel
	 *                         data from a smaller area within the bitmap,
	 *                         specify a source rectangle that is smaller than
	 *                         the overall size of the BitmapImage2D object.
	 * @param destPoint        The destination Point object that represents the
	 *                         upper-left corner of the rectangular area where
	 *                         the new channel data is placed. To copy only
	 *                         channel data from one area to a different area in
	 *                         the destination image, specify a point other than
	 *                        (0,0).
	 * @param sourceChannel    The source channel. Use a value from the
	 *                         BitmapImage2DChannel class
	 *                        (<code>BitmapImage2DChannel.RED</code>,
	 *                         <code>BitmapImage2DChannel.BLUE</code>,
	 *                         <code>BitmapImage2DChannel.GREEN</code>,
	 *                         <code>BitmapImage2DChannel.ALPHA</code>).
	 * @param destChannel      The destination channel. Use a value from the
	 *                         BitmapImage2DChannel class
	 *                        (<code>BitmapImage2DChannel.RED</code>,
	 *                         <code>BitmapImage2DChannel.BLUE</code>,
	 *                         <code>BitmapImage2DChannel.GREEN</code>,
	 *                         <code>BitmapImage2DChannel.ALPHA</code>).
	 * @throws TypeError The sourceBitmapImage2D, sourceRect or destPoint are null.
	 */
	public copyChannel(sourceBitmap:BitmapImage2D, sourceRect:Rectangle, destPoint:Point, sourceChannel:number, destChannel:number):void
	{
		var imageData:ImageData = sourceBitmap.getImageData();

		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var sourceData:Uint8ClampedArray = imageData.data;
		var destData:Uint8ClampedArray = this._imageData.data;

		var sourceOffset:number = Math.round(Math.log(sourceChannel)/Math.log(2));
		var destOffset:number = Math.round(Math.log(destChannel)/Math.log(2));

		var sourceX:number = Math.round(sourceRect.x);
		var sourceY:number = Math.round(sourceRect.y);
		var destX:number = Math.round(destPoint.x);
		var destY:number = Math.round(destPoint.y);

		var i:number, j:number, sourceIndex:number, destIndex:number;
		for (i = 0; i < sourceRect.width; ++i) {
			for (j = 0; j < sourceRect.height; ++j) {
				sourceIndex = (i + sourceX + (j + sourceY)*imageData.width)*4;
				destIndex = (i + destX + (j + destY)*this._rect.width)*4;

				destData[destIndex + destOffset] = sourceData[sourceIndex + sourceOffset];
			}
		}

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Provides a fast routine to perform pixel manipulation between images with
	 * no stretching, rotation, or color effects. This method copies a
	 * rectangular area of a source image to a rectangular area of the same size
	 * at the destination point of the destination BitmapImage2D object.
	 *
	 * <p>If you include the <code>alphaBitmap</code> and <code>alphaPoint</code>
	 * parameters, you can use a secondary image as an alpha source for the
	 * source image. If the source image has alpha data, both sets of alpha data
	 * are used to composite pixels from the source image to the destination
	 * image. The <code>alphaPoint</code> parameter is the point in the alpha
	 * image that corresponds to the upper-left corner of the source rectangle.
	 * Any pixels outside the intersection of the source image and alpha image
	 * are not copied to the destination image.</p>
	 *
	 * <p>The <code>mergeAlpha</code> property controls whether or not the alpha
	 * channel is used when a transparent image is copied onto another
	 * transparent image. To copy pixels with the alpha channel data, set the
	 * <code>mergeAlpha</code> property to <code>true</code>. By default, the
	 * <code>mergeAlpha</code> property is <code>false</code>.</p>
	 *
	 * @param sourceBitmapImage2D The input bitmap image from which to copy pixels.
	 *                         The source image can be a different BitmapImage2D
	 *                         instance, or it can refer to the current
	 *                         BitmapImage2D instance.
	 * @param sourceRect       A rectangle that defines the area of the source
	 *                         image to use as input.
	 * @param destPoint        The destination point that represents the
	 *                         upper-left corner of the rectangular area where
	 *                         the new pixels are placed.
	 * @param alphaBitmapImage2D  A secondary, alpha BitmapImage2D object source.
	 * @param alphaPoint       The point in the alpha BitmapImage2D object source
	 *                         that corresponds to the upper-left corner of the
	 *                         <code>sourceRect</code> parameter.
	 * @param mergeAlpha       To use the alpha channel, set the value to
	 *                         <code>true</code>. To copy pixels with no alpha
	 *                         channel, set the value to <code>false</code>.
	 * @throws TypeError The sourceBitmapImage2D, sourceRect, destPoint are null.
	 */
	public copyPixels(source:BitmapImage2D, sourceRect:Rectangle, destPoint:Point);
	public copyPixels(source:HTMLElement, sourceRect:Rectangle, destPoint:Point);
	public copyPixels(source:any, sourceRect:Rectangle, destPoint:Point):void
	{
		if (source instanceof BitmapImage2D)
			source = source.getCanvas();

		if (this._imageData)
			this._context.putImageData(this._imageData, 0, 0); // at coords 0,0

		BitmapImageUtils._copyPixels(this._context, source, sourceRect, destPoint);

		this._imageData = null;

		if (!this._locked)
			this.invalidate();
	}

	public merge(source:BitmapImage2D, sourceRect:Rectangle, destPoint:Point, redMultiplier:number, greenMultiplier:number, blueMultiplier:number, alphaMultiplier:number)
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var dest:Uint8ClampedArray = this._imageData.data;
		var src:Uint8ClampedArray = source.getImageData().data;

		redMultiplier = ~~redMultiplier;
		greenMultiplier = ~~greenMultiplier;
		blueMultiplier = ~~blueMultiplier;
		alphaMultiplier = ~~alphaMultiplier;

		var i:number, j:number, index:number;
		for (i = 0; i < sourceRect.width; ++i) {
			for (j = 0; j < sourceRect.height; ++j) {
				index = (i + sourceRect.x + (j + sourceRect.y)*this.width)*4;

				dest[index] = ~~((src[index]*redMultiplier + dest[index]*(0x100 - redMultiplier))/0x100);
				dest[index + 1] = ~~((src[index + 1]*greenMultiplier + dest[index + 1]*(0x100 - greenMultiplier))/0x100);
				dest[index + 2] = ~~((src[index + 2]*blueMultiplier + dest[index + 2]*(0x100 - blueMultiplier))/0x100);
				dest[index + 3] = ~~((src[index + 3]*alphaMultiplier + dest[index + 3]*(0x100 - alphaMultiplier))/0x100);
			}
		}

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Frees memory that is used to store the BitmapImage2D object.
	 *
	 * <p>When the <code>dispose()</code> method is called on an image, the width
	 * and height of the image are set to 0. All subsequent calls to methods or
	 * properties of this BitmapImage2D instance fail, and an exception is thrown.
	 * </p>
	 *
	 * <p><code>BitmapImage2D.dispose()</code> releases the memory occupied by the
	 * actual bitmap data, immediately(a bitmap can consume up to 64 MB of
	 * memory). After using <code>BitmapImage2D.dispose()</code>, the BitmapImage2D
	 * object is no longer usable and an exception may be thrown if
	 * you call functions on the BitmapImage2D object. However,
	 * <code>BitmapImage2D.dispose()</code> does not garbage collect the BitmapImage2D
	 * object(approximately 128 bytes); the memory occupied by the actual
	 * BitmapImage2D object is released at the time the BitmapImage2D object is
	 * collected by the garbage collector.</p>
	 *
	 */
	public dispose():void
	{
		this.clear();
		
		this._context = null;
		this._imageCanvas = null;
		this._imageData = null;
		this._rect = null;
		this._transparent = null;
		this._locked = null;
	}

	/**
	 * Draws the <code>source</code> display object onto the bitmap image, using
	 * the NME software renderer. You can specify <code>matrix</code>,
	 * <code>colorTransform</code>, <code>blendMode</code>, and a destination
	 * <code>clipRect</code> parameter to control how the rendering performs.
	 * Optionally, you can specify whether the bitmap should be smoothed when
	 * scaled(this works only if the source object is a BitmapImage2D object).
	 *
	 * <p>The source display object does not use any of its applied
	 * transformations for this call. It is treated as it exists in the library
	 * or file, with no matrix transform, no color transform, and no blend mode.
	 * To draw a display object(such as a movie clip) by using its own transform
	 * properties, you can copy its <code>transform</code> property object to the
	 * <code>transform</code> property of the Bitmap object that uses the
	 * BitmapImage2D object.</p>
	 *
	 * @param source         The display object or BitmapImage2D object to draw to
	 *                       the BitmapImage2D object.(The DisplayObject and
	 *                       BitmapImage2D classes implement the IBitmapDrawable
	 *                       interface.)
	 * @param matrix         A Matrix object used to scale, rotate, or translate
	 *                       the coordinates of the bitmap. If you do not want to
	 *                       apply a matrix transformation to the image, set this
	 *                       parameter to an identity matrix, created with the
	 *                       default <code>new Matrix()</code> constructor, or
	 *                       pass a <code>null</code> value.
	 * @param colorTransform A ColorTransform object that you use to adjust the
	 *                       color values of the bitmap. If no object is
	 *                       supplied, the bitmap image's colors are not
	 *                       transformed. If you must pass this parameter but you
	 *                       do not want to transform the image, set this
	 *                       parameter to a ColorTransform object created with
	 *                       the default <code>new ColorTransform()</code>
	 *                       constructor.
	 * @param blendMode      A string value, from the flash.display.BlendMode
	 *                       class, specifying the blend mode to be applied to
	 *                       the resulting bitmap.
	 * @param clipRect       A Rectangle object that defines the area of the
	 *                       source object to draw. If you do not supply this
	 *                       value, no clipping occurs and the entire source
	 *                       object is drawn.
	 * @param smoothing      A Boolean value that determines whether a BitmapImage2D
	 *                       object is smoothed when scaled or rotated, due to a
	 *                       scaling or rotation in the <code>matrix</code>
	 *                       parameter. The <code>smoothing</code> parameter only
	 *                       applies if the <code>source</code> parameter is a
	 *                       BitmapImage2D object. With <code>smoothing</code> set
	 *                       to <code>false</code>, the rotated or scaled
	 *                       BitmapImage2D image can appear pixelated or jagged. For
	 *                       example, the following two images use the same
	 *                       BitmapImage2D object for the <code>source</code>
	 *                       parameter, but the <code>smoothing</code> parameter
	 *                       is set to <code>true</code> on the left and
	 *                       <code>false</code> on the right:
	 *
	 *                       <p>Drawing a bitmap with <code>smoothing</code> set
	 *                       to <code>true</code> takes longer than doing so with
	 *                       <code>smoothing</code> set to
	 *                       <code>false</code>.</p>
	 * @throws ArgumentError The <code>source</code> parameter is not a
	 *                       BitmapImage2D or DisplayObject object.
	 * @throws ArgumentError The source is null or not a valid IBitmapDrawable
	 *                       object.
	 * @throws SecurityError The <code>source</code> object and(in the case of a
	 *                       Sprite or MovieClip object) all of its child objects
	 *                       do not come from the same domain as the caller, or
	 *                       are not in a content that is accessible to the
	 *                       caller by having called the
	 *                       <code>Security.allowDomain()</code> method. This
	 *                       restriction does not apply to AIR content in the
	 *                       application security sandbox.
	 */
	public draw(source:BitmapImage2D, matrix?:Matrix, colorTransform?:ColorTransform, blendMode?:BlendMode, clipRect?:Rectangle, smoothing?:boolean);
	public draw(source:HTMLElement, matrix?:Matrix, colorTransform?:ColorTransform, blendMode?:BlendMode, clipRect?:Rectangle, smoothing?:boolean);
	public draw(source:Uint8Array, matrix?:Matrix, colorTransform?:ColorTransform, blendMode?:BlendMode, clipRect?:Rectangle, smoothing?:boolean);
	public draw(source:any, matrix?:Matrix, colorTransform?:ColorTransform, blendMode?:BlendMode, clipRect?:Rectangle, smoothing?:boolean):void
	{
		if (source instanceof BitmapImage2D && source.getCanvas())
			source = source.getCanvas();

		if (this._imageData)
			this._context.putImageData(this._imageData, 0, 0); // at coords 0,0

		BitmapImageUtils._draw(this._context, source, matrix, colorTransform, blendMode, clipRect, smoothing);

		this._imageData = null;

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Fills a rectangular area of pixels with a specified ARGB color.
	 *
	 * @param rect  The rectangular area to fill.
	 * @param color The ARGB color value that fills the area. ARGB colors are
	 *              often specified in hexadecimal format; for example,
	 *              0xFF336699.
	 * @throws TypeError The rect is null.
	 */
	public fillRect(rect:Rectangle, color:number):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var data:Uint32Array = new Uint32Array(this._imageData.data.buffer);
		var x:number = ~~rect.x, y:number = ~~rect.y, width:number = ~~rect.width, height:number = ~~rect.height;
		var argb:number = this._transparent? (color & 0xFFFFFFFF) : (color & 0xFFFFFF) + 0xFF000000;
		
		//fast path for complete fill
		if (x == 0 && y == 0 && width == this._rect.width && height == this._rect.height) {
			data.fill(argb);
		} else {
			var j:number;
			var index:number;
			for (j = 0; j < height; ++j) {
			
				index = x + (j + y)*this._rect.width;
	
				data.fill(argb, index, index + width);
			}
		}
	}

	/**
	 * Returns an integer that represents an RGB pixel value from a BitmapImage2D
	 * object at a specific point(<i>x</i>, <i>y</i>). The
	 * <code>getPixel()</code> method returns an unmultiplied pixel value. No
	 * alpha information is returned.
	 *
	 * <p>All pixels in a BitmapImage2D object are stored as premultiplied color
	 * values. A premultiplied image pixel has the red, green, and blue color
	 * channel values already multiplied by the alpha data. For example, if the
	 * alpha value is 0, the values for the RGB channels are also 0, independent
	 * of their unmultiplied values. This loss of data can cause some problems
	 * when you perform operations. All BitmapImage2D methods take and return
	 * unmultiplied values. The internal pixel representation is converted from
	 * premultiplied to unmultiplied before it is returned as a value. During a
	 * set operation, the pixel value is premultiplied before the raw image pixel
	 * is set.</p>
	 *
	 * @param x The <i>x</i> position of the pixel.
	 * @param y The <i>y</i> position of the pixel.
	 * @return A number that represents an RGB pixel value. If the(<i>x</i>,
	 *         <i>y</i>) coordinates are outside the bounds of the image, the
	 *         method returns 0.
	 */
	public getPixel(x, y):number
	{
		var r:number;
		var g:number;
		var b:number;
		var a:number;

		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (~~x + ~~y*this._imageData.width)*4;
		var data:Uint8ClampedArray = this._imageData.data;

		r = data[index + 0];
		g = data[index + 1];
		b = data[index + 2];
		a = data[index + 3];

		//returns black if fully transparent
		if (!a)
			return 0x0;

		return (r << 16) | (g << 8) | b;
	}

	/**
	 * Returns an ARGB color value that contains alpha channel data and RGB data.
	 * This method is similar to the <code>getPixel()</code> method, which
	 * returns an RGB color without alpha channel data.
	 *
	 * <p>All pixels in a BitmapImage2D object are stored as premultiplied color
	 * values. A premultiplied image pixel has the red, green, and blue color
	 * channel values already multiplied by the alpha data. For example, if the
	 * alpha value is 0, the values for the RGB channels are also 0, independent
	 * of their unmultiplied values. This loss of data can cause some problems
	 * when you perform operations. All BitmapImage2D methods take and return
	 * unmultiplied values. The internal pixel representation is converted from
	 * premultiplied to unmultiplied before it is returned as a value. During a
	 * set operation, the pixel value is premultiplied before the raw image pixel
	 * is set.</p>
	 *
	 * @param x The <i>x</i> position of the pixel.
	 * @param y The <i>y</i> position of the pixel.
	 * @return A number representing an ARGB pixel value. If the(<i>x</i>,
	 *         <i>y</i>) coordinates are outside the bounds of the image, 0 is
	 *         returned.
	 */
	public getPixel32(x, y):number
	{
		var r:number;
		var g:number;
		var b:number;
		var a:number;

		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (~~x + ~~y*this._imageData.width)*4;
		var data:Uint8ClampedArray = this._imageData.data;

		r = data[index++];
		g = data[index++];
		b = data[index++];
		a = data[index];

		return (a << 24) | (r << 16) | (g << 8) | b;
	}

	public getPixelData(x, y, imagePixel:Uint8ClampedArray):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (x + y*this._imageData.width)*4;
		var data:Uint8ClampedArray = this._imageData.data;

		imagePixel[0] = data[index++];
		imagePixel[1] = data[index++];
		imagePixel[2] = data[index++];
		imagePixel[3] = data[index];
	}

	public setPixelData(x, y, imagePixel:Uint8ClampedArray):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (x + y*this._imageData.width)*4;

		this._imageData.data[index + 0] = imagePixel[0];
		this._imageData.data[index + 1] = imagePixel[1];
		this._imageData.data[index + 2] = imagePixel[2];
		this._imageData.data[index + 3] = this._transparent? imagePixel[3] : 0xFF;

		if (!this._locked)
			this.invalidate();
	}
	
	/**
	 * Locks an image so that any objects that reference the BitmapImage2D object,
	 * such as Bitmap objects, are not updated when this BitmapImage2D object
	 * changes. To improve performance, use this method along with the
	 * <code>unlock()</code> method before and after numerous calls to the
	 * <code>setPixel()</code> or <code>setPixel32()</code> method.
	 *
	 */
	public lock():void
	{
		if (this._locked)
			return;

		this._locked = true;
	}

	/**
	 * Converts an Array into a rectangular region of pixel data. For each pixel,
	 * an Array element is read and written into the BitmapImage2D pixel. The data
	 * in the Array is expected to be 32-bit ARGB pixel values.
	 *
	 * @param rect        Specifies the rectangular region of the BitmapImage2D
	 *                    object.
	 * @param inputArray  An Array that consists of 32-bit unmultiplied pixel
	 *                    values to be used in the rectangular region.
	 * @throws RangeError The vector array is not large enough to read all the
	 *                    pixel data.
	 */
	public setArray(rect:Rectangle, inputArray:Array<number>):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var i:number, j:number, index:number, argb:number[];
		for (i = 0; i < rect.width; ++i) {
			for (j = 0; j < rect.height; ++j) {
				argb = ColorUtils.float32ColorToARGB(inputArray[i + j*rect.width]);
				index = (i + rect.x + (j + rect.y)*this._imageData.width)*4;

				this._imageData.data[index + 0] = argb[1];
				this._imageData.data[index + 1] = argb[2];
				this._imageData.data[index + 2] = argb[3];
				this._imageData.data[index + 3] = this._transparent? argb[0] : 0xFF;
			}
		}

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Sets a single pixel of a BitmapImage2D object. The current alpha channel
	 * value of the image pixel is preserved during this operation. The value of
	 * the RGB color parameter is treated as an unmultiplied color value.
	 *
	 * <p><b>Note:</b> To increase performance, when you use the
	 * <code>setPixel()</code> or <code>setPixel32()</code> method repeatedly,
	 * call the <code>lock()</code> method before you call the
	 * <code>setPixel()</code> or <code>setPixel32()</code> method, and then call
	 * the <code>unlock()</code> method when you have made all pixel changes.
	 * This process prevents objects that reference this BitmapImage2D instance from
	 * updating until you finish making the pixel changes.</p>
	 *
	 * @param x     The <i>x</i> position of the pixel whose value changes.
	 * @param y     The <i>y</i> position of the pixel whose value changes.
	 * @param color The resulting RGB color for the pixel.
	 */
	public setPixel(x:number, y:number, color:number):void
	{
		var argb:number[] = ColorUtils.float32ColorToARGB(color);

		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (~~x + ~~y*this._imageData.width)*4;

		this._imageData.data[index + 0] = argb[1];
		this._imageData.data[index + 1] = argb[2];
		this._imageData.data[index + 2] = argb[3];
		this._imageData.data[index + 3] = 0xff;

		if (!this._locked)
			this.invalidate();
	}
	public setPixelFromArray(x:number, y:number, colors:number[]):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (x + y*this._imageData.width)*4;

		this._imageData.data[index + 0] = colors[1];
		this._imageData.data[index + 1] = colors[2];
		this._imageData.data[index + 2] = colors[3];
		this._imageData.data[index + 3] = colors[0]*0xff;

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Sets the color and alpha transparency values of a single pixel of a
	 * BitmapImage2D object. This method is similar to the <code>setPixel()</code>
	 * method; the main difference is that the <code>setPixel32()</code> method
	 * takes an ARGB color value that contains alpha channel information.
	 *
	 * <p>All pixels in a BitmapImage2D object are stored as premultiplied color
	 * values. A premultiplied image pixel has the red, green, and blue color
	 * channel values already multiplied by the alpha data. For example, if the
	 * alpha value is 0, the values for the RGB channels are also 0, independent
	 * of their unmultiplied values. This loss of data can cause some problems
	 * when you perform operations. All BitmapImage2D methods take and return
	 * unmultiplied values. The internal pixel representation is converted from
	 * premultiplied to unmultiplied before it is returned as a value. During a
	 * set operation, the pixel value is premultiplied before the raw image pixel
	 * is set.</p>
	 *
	 * <p><b>Note:</b> To increase performance, when you use the
	 * <code>setPixel()</code> or <code>setPixel32()</code> method repeatedly,
	 * call the <code>lock()</code> method before you call the
	 * <code>setPixel()</code> or <code>setPixel32()</code> method, and then call
	 * the <code>unlock()</code> method when you have made all pixel changes.
	 * This process prevents objects that reference this BitmapImage2D instance from
	 * updating until you finish making the pixel changes.</p>
	 *
	 * @param x     The <i>x</i> position of the pixel whose value changes.
	 * @param y     The <i>y</i> position of the pixel whose value changes.
	 * @param color The resulting ARGB color for the pixel. If the bitmap is
	 *              opaque(not transparent), the alpha transparency portion of
	 *              this color value is ignored.
	 */
	public setPixel32(x, y, color:number):void
	{
		var argb:number[] = ColorUtils.float32ColorToARGB(color);

		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		var index:number = (~~x + ~~y*this._imageData.width)*4;

		this._imageData.data[index + 0] = argb[1];
		this._imageData.data[index + 1] = argb[2];
		this._imageData.data[index + 2] = argb[3];
		this._imageData.data[index + 3] = this._transparent? argb[0] : 0xFF;

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Converts a byte array into a rectangular region of pixel data. For each
	 * pixel, the <code>ByteArray.readUnsignedInt()</code> method is called and
	 * the return value is written into the pixel. If the byte array ends before
	 * the full rectangle is written, the function returns. The data in the byte
	 * array is expected to be 32-bit ARGB pixel values. No seeking is performed
	 * on the byte array before or after the pixels are read.
	 *
	 * @param rect           Specifies the rectangular region of the BitmapImage2D
	 *                       object.
	 * @param inputByteArray A ByteArray object that consists of 32-bit
	 *                       unmultiplied pixel values to be used in the
	 *                       rectangular region.
	 * @throws EOFError  The <code>inputByteArray</code> object does not include
	 *                   enough data to fill the area of the <code>rect</code>
	 *                   rectangle. The method fills as many pixels as possible
	 *                   before throwing the exception.
	 * @throws TypeError The rect or inputByteArray are null.
	 */
	public setPixels(rect:Rectangle, input:Uint8ClampedArray):void
	{
		if (!this._imageData)
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);

		//fast path for full imageData
		if (rect.equals(this._rect)) {
			this._imageData.data.set(input);
		} else {
			var i:number;
			var imageWidth:number = this._rect.width;
			var inputWidth:number = rect.width;
			for (i = 0; i < rect.height; ++i)
				this._imageData.data.set(input.subarray(i*inputWidth*4, (i + 1)*inputWidth*4), (rect.x + (i + rect.y)*imageWidth)*4);
		}

		if (!this._locked)
			this.invalidate();
	}

	/**
	 * Unlocks an image so that any objects that reference the BitmapImage2D object,
	 * such as Bitmap objects, are updated when this BitmapImage2D object changes.
	 * To improve performance, use this method along with the <code>lock()</code>
	 * method before and after numerous calls to the <code>setPixel()</code> or
	 * <code>setPixel32()</code> method.
	 *
	 * @param changeRect The area of the BitmapImage2D object that has changed. If
	 *                   you do not specify a value for this parameter, the
	 *                   entire area of the BitmapImage2D object is considered
	 *                   changed.
	 */
	public unlock():void
	{
		if (!this._locked)
			return;

		this._locked = false;

		this.invalidate();
	}

	/**
	 *
	 * @returns {ImageData}
	 */
	public getImageData():ImageData
	{
		if (!this._imageData){
			this._imageData = this._context.getImageData(0, 0, this._rect.width, this._rect.height);
			if(this._alphaChannel){
				if(this._imageData.data.length!=this._alphaChannel.length*4)
					throw("error when trying to merge the alpha channel into the image. the length of the alpha channel should be 1/4 of the length of the imageData");
				for(var i:number=0; i<this._alphaChannel.length; i++){
					this._imageData.data[(i*4)+3]=this._alphaChannel[i];
				}
			}
		}
		return this._imageData;
	}

	/**
	 *
	 * @returns {HTMLCanvasElement}
	 */
	public getCanvas():HTMLCanvasElement
	{
		if (this._imageData)
			this._context.putImageData(this._imageData, 0, 0);

		this._imageData = null;

		return <HTMLCanvasElement> this._imageCanvas;
	}

	/**
	 *
	 * @param width
	 * @param height
	 * @private
	 */
	public _setSize(width:number, height:number):void
	{
		if (this._imageData)
			this._context.putImageData(this._imageData, 0, 0);

		if(this._imageCanvas) {
			this._imageCanvas.width = width;
			this._imageCanvas.height = height;
		}
		
		super._setSize(width, height);

		this._imageData = null;
	}
}

import {ITextureBase} from "../base/ITextureBase"
import {ITexture} from "../base/ITexture";

import {_Stage_Image2D} from "./Image2D";

import {Stage} from "../Stage";

/**
 *
 * @class away.pool.ImageObjectBase
 */
export class _Stage_BitmapImage2D extends _Stage_Image2D
{
    public getTexture():ITextureBase
    {
        super.getTexture();

        if (this._invalid) {
            this._invalid = false;

            (<ITexture> this._texture).uploadFromArray(new Uint8Array((<BitmapImage2D> this._asset).getImageData().data.buffer), 0);

			var mipLevels:BitmapImage2D[]=(<BitmapImage2D> this._asset).mipLevels;
			if(mipLevels && mipLevels.length>0){
				for(var i=0; i<mipLevels.length; i++){
					(<ITexture> this._texture).uploadFromArray(new Uint8Array(mipLevels[i].getImageData().data.buffer), i+1);
				}
				this._mipmap=true;
				this._invalidMipmaps = false;
			}
			else{
				this._invalidMipmaps = true;

			}

			
        }

        return this._texture;
    }
}

Stage.registerAbstraction(_Stage_BitmapImage2D, BitmapImage2D);