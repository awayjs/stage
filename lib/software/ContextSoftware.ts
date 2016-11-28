import {Matrix3D, Matrix, Point, Vector3D, Rectangle, ColorUtils} from "@awayjs/core";

import {BitmapImage2D} from "@awayjs/graphics";

import {ContextGLBlendFactor} from "../base/ContextGLBlendFactor";
import {ContextGLClearMask} from "../base/ContextGLClearMask";
import {ContextGLCompareMode} from "../base/ContextGLCompareMode";
import {ContextGLProgramType} from "../base/ContextGLProgramType";
import {ContextGLTriangleFace} from "../base/ContextGLTriangleFace";
import {IContextGL} from "../base/IContextGL";
import {IIndexBuffer} from "../base/IIndexBuffer";
import {ICubeTexture} from "../base/ICubeTexture";

import {ITextureBaseSoftware} from "./ITextureBaseSoftware";
import {IndexBufferSoftware} from "./IndexBufferSoftware";
import {VertexBufferSoftware} from "./VertexBufferSoftware";
import {TextureSoftware} from "./TextureSoftware";
import {CubeTextureSoftware} from "./CubeTextureSoftware";
import {ProgramSoftware} from "./ProgramSoftware";
import {ProgramVOSoftware} from "./ProgramVOSoftware";
import {SoftwareSamplerState} from "./SoftwareSamplerState";
import {BlendModeSoftware} from "./BlendModeSoftware";
import {DepthCompareModeSoftware} from "./DepthCompareModeSoftware";

export class ContextSoftware implements IContextGL
{
	private _canvas:HTMLCanvasElement;

	public static MAX_SAMPLERS:number = 8;

	private _backBufferRect:Rectangle = new Rectangle();
	private _backBufferColor:BitmapImage2D;
	private _frontBuffer:BitmapImage2D;
	private _activeBuffer:BitmapImage2D;
	private _activeTexture:TextureSoftware;

	private _zbuffer:Float32Array;
	private _zbufferClear:Float32Array;
	private _colorClearUint8:Uint8ClampedArray;
	private _colorClearUint32:Uint32Array;
	private _cullingMode:string = ContextGLTriangleFace.BACK;
	private _blendSource:string = ContextGLBlendFactor.ONE;
	private _blendDestination:string = ContextGLBlendFactor.ZERO;
	private _colorMaskR:boolean = true;
	private _colorMaskG:boolean = true;
	private _colorMaskB:boolean = true;
	private _colorMaskA:boolean = true;
	private _writeDepth:boolean = true;
	private _depthCompareMode:string = ContextGLCompareMode.LESS;
	private _program:ProgramSoftware;

	private _screenMatrix:Matrix3D = new Matrix3D();
	private _frontBufferMatrix:Matrix = new Matrix();

	private _bboxMin:Point = new Point();
	private _bboxMax:Point = new Point();
	private _clamp:Point = new Point();

	public _samplerStates:SoftwareSamplerState[] = [];
	public _textures:Array<ITextureBaseSoftware> = [];
	private _textureBuffers:Array<BitmapImage2D>;
	public _vertexBuffers:Array<VertexBufferSoftware> = [];
	public _vertexBufferOffsets:Array<number> = [];
	public _vertexBufferFormats:Array<number> = [];

	public _fragmentConstants:Float32Array;
	public _vertexConstants:Float32Array;

	private _rgba:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _source:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _dest:Uint8ClampedArray = new Uint8ClampedArray(4);

	//public static _drawCallback:Function = null;

	private _antialias:number = 0;

	constructor(canvas:HTMLCanvasElement)  {

		this._canvas = canvas;

		this._backBufferColor = new BitmapImage2D(100, 100, false, 0, false);
		this._frontBuffer = new BitmapImage2D(100, 100, true, 0, false);
		this._activeBuffer = this._backBufferColor;

		this._textureBuffers = new Array<BitmapImage2D>();

		if (document && document.body) {
			var frontCanvas = this._frontBuffer.getCanvas();

			// TODO: remove software renderToTexture
			frontCanvas.style.position = "absolute";

			document.body.appendChild(frontCanvas);
		}
	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean):void  {

		this._antialias = antiAlias;

		if (this._antialias % 2 != 0)
			this._antialias = Math.floor(this._antialias - 0.5);

		if (this._antialias == 0)
			this._antialias = 1;

		this._frontBuffer._setSize(width, height);

		var backBufferWidth = width*this._antialias;
		var backBufferHeight = height*this._antialias;

		//double buffer for fast clearing
		var len:number = backBufferWidth * backBufferHeight;
		var zbufferBytes:ArrayBuffer = new ArrayBuffer(len*8);
		this._zbuffer = new Float32Array(zbufferBytes, 0, len);
		this._zbufferClear = new Float32Array(zbufferBytes, len*4, len);
		for (var i:number = 0; i < len; i++)
			this._zbufferClear[i] = 10000000;

		var colorClearBuffer:ArrayBuffer = new ArrayBuffer(len*4);

		this._colorClearUint8 = new Uint8ClampedArray(colorClearBuffer);
		this._colorClearUint32 = new Uint32Array(colorClearBuffer);
		this._backBufferRect.width = backBufferWidth;
		this._backBufferRect.height = backBufferHeight;

		this._backBufferColor._setSize(backBufferWidth, backBufferHeight);

		this.activateScreenMatrix(this._backBufferRect.width, this._backBufferRect.height);

		this._frontBufferMatrix = new Matrix();
		this._frontBufferMatrix.scale(1/this._antialias, 1/this._antialias);
	}

	private activateScreenMatrix(width:number, height:number) {

		var raw:Float32Array = this._screenMatrix._rawData;

		raw[0] = width / 2;
		raw[1] = 0;
		raw[2] = 0;
		raw[3] = width / 2;

		raw[4] = 0;
		raw[5] = -height / 2;
		raw[6] = 0;
		raw[7] = height / 2;

		raw[8] = 0;
		raw[9] = 0;
		raw[10] = 1;
		raw[11] = 0;

		raw[12] = 0;
		raw[13] = 0;
		raw[14] = 0;
		raw[15] = 0;

		this._screenMatrix.transpose();
	}

	public setRenderToTexture(target:TextureSoftware, enableDepthAndStencil:boolean, antiAlias:number, surfaceSelector:number)  {

		// Create texture buffer and screen matrix if needed.
		var textureBuffer = this._textureBuffers[surfaceSelector];
		if (textureBuffer == null) {

			// TODO: consider transparency prop
			// TODO: consider fill color prop
			// TODO: consider powerOfTwo prop
			var textureBuffer = new BitmapImage2D(target.width, target.height, false, 0xFFFFFF, true);
			this._textureBuffers[surfaceSelector] = textureBuffer;

			// TODO: transfer the initial image2D data from the texture to the BitmapImage2D object.
			target.uploadFromData(textureBuffer.getImageData());
		}
		else {
			textureBuffer.fillRect(textureBuffer.rect, 0xFFFFFF);
		}

		this.activateScreenMatrix(target.width, target.height);
		this._activeTexture = target;

		this._activeBuffer = textureBuffer;
		this._activeBuffer.lock();
	}

	public setRenderToBackBuffer():void  {
		this._activeBuffer = this._backBufferColor;
		this.activateScreenMatrix(this._backBufferColor.width, this._backBufferColor.height);
	}

	public drawIndices(mode:string, indexBuffer:IndexBufferSoftware, firstIndex:number, numIndices:number):void  {

		if (!this._program)
			return;

		// These are place holders for vertex transformation operations.
		// Additional placeholders are for potentially interpolated values generated by near clipping
		// used to avoid trying to draw behind the camera

		var position0:Float32Array = new Float32Array(4);
		var position1:Float32Array = new Float32Array(4);
		var position2:Float32Array = new Float32Array(4);
		var position3:Float32Array = new Float32Array(4); // potentially interpolated
		var position4:Float32Array = new Float32Array(4); // potentially interpolated

		var varying0:Float32Array = new Float32Array(this._program.numVarying*4);
		var varying1:Float32Array = new Float32Array(this._program.numVarying*4);
		var varying2:Float32Array = new Float32Array(this._program.numVarying*4);
		var varying3:Float32Array = new Float32Array(this._program.numVarying*4); // potentially interpolated
		var varying4:Float32Array = new Float32Array(this._program.numVarying*4); // potentially interpolated

		var incomingVertices:Array<Float32Array> = new Array<Float32Array>(5);
		var outgoingVertices:Array<Float32Array> = new Array<Float32Array>(4);
		incomingVertices[0] = position1;
		incomingVertices[1] = position2;
		incomingVertices[2] = position0; // notice position0 in index 2
		incomingVertices[3] = position3;
		incomingVertices[4] = position4;

		var incomingVaryings:Array<Float32Array> = new Array<Float32Array>(5);
		var outgoingVaryings:Array<Float32Array> = new Array<Float32Array>(4);
		incomingVaryings[0] = varying1;
		incomingVaryings[1] = varying2;
		incomingVaryings[2] = varying0;
		incomingVaryings[3] = varying3;
		incomingVaryings[4] = varying4;

		// Sweep triangles according to culling mode and process thru vertex shader.

		if (this._cullingMode == ContextGLTriangleFace.BACK) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
				this._triangle(incomingVertices, outgoingVertices, incomingVaryings, outgoingVaryings);
			}
		} else if (this._cullingMode == ContextGLTriangleFace.FRONT) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
				this._triangle(incomingVertices, outgoingVertices, incomingVaryings, outgoingVaryings);
			}
		} else if (this._cullingMode == ContextGLTriangleFace.FRONT_AND_BACK || this._cullingMode == ContextGLTriangleFace.NONE) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
				this._triangle(incomingVertices, outgoingVertices, incomingVaryings, outgoingVaryings);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
				this._triangle(incomingVertices, outgoingVertices, incomingVaryings, outgoingVaryings);
			}
		}

		// Transfer buffer data to texture.
		if (this._activeBuffer != this._backBufferColor) {
			this._activeBuffer.unlock();
			this._activeTexture.uploadFromData(this._activeBuffer.getImageData());
		}
	}

	private _triangle(incomingVertices:Array<Float32Array>, outgoingVertices:Array<Float32Array>, incomingVaryings:Array<Float32Array>, outgoingVaryings:Array<Float32Array>):void  {

		var numOriginalVerticesInside:number = 0;
		var numInterpolations:number = 0;
		var numOutgoingVertices:number = 0;

		// Check if the vertices are behind the near plane and interpolate
		// new vertices whenever one vertex in a side is in front of the camera AND the other is behind it.
		// Start by considering p0 as the previous vertex.
		var previousVertex:Float32Array = incomingVertices[2]; // p0
		var previousVarying:Float32Array = incomingVaryings[2]; // v0
		var previousVertexIsInside:boolean = previousVertex[2] > 0; // z > 0
		if (previousVertexIsInside) { // add the original vertex if its inside
			outgoingVertices[0] = previousVertex;
			outgoingVaryings[0] = previousVarying;
			numOutgoingVertices++;
			numOriginalVerticesInside++;
		}
		for (var i:number = 0; i < 3; i++) {

			var currentVertex:Float32Array = incomingVertices[i];
			var currentVarying:Float32Array = incomingVaryings[i];

			// Need interpolation?
			var currentVertexIsInside = currentVertex[2] > 0; // z > 0
			if (currentVertexIsInside != previousVertexIsInside) { // if one and only one is true

				// Interpolate vertex pair and create a new vertex.

				// z factor
				var dz_current:number = Math.abs(currentVertex[2]);
				var dz_previous:number = Math.abs(previousVertex[2]);
				var factorZ:number = dz_previous / (dz_previous + dz_current);

				this._interpolateVertexPair(factorZ, currentVertex, previousVertex, incomingVertices[3 + numInterpolations]);
				outgoingVertices[numOutgoingVertices] = incomingVertices[3 + numInterpolations];

				this._interpolateVertexPair(factorZ, currentVarying, previousVarying, incomingVaryings[3 + numInterpolations]);
				outgoingVaryings[numOutgoingVertices] = incomingVaryings[3 + numInterpolations];

				numOutgoingVertices++;
				numInterpolations++;
			}

			if (currentVertexIsInside && i != 2) { // add the original vertex if its inside
				outgoingVertices[numOutgoingVertices] = currentVertex;
				outgoingVaryings[numOutgoingVertices] = currentVarying;
				numOutgoingVertices++;
				numOriginalVerticesInside++;
			}

			previousVertex = currentVertex;
			previousVarying = currentVarying;

			previousVertexIsInside = currentVertexIsInside;
		}

		// Project the resulting vertices as triangles.
		if (numOriginalVerticesInside == 3) { // no clipping
			this._projectTriangle(incomingVertices[0], incomingVertices[1], incomingVertices[2], incomingVaryings[0], incomingVaryings[1], incomingVaryings[2]);
		}
		else if (numOriginalVerticesInside == 2) { // quad clip (triangle is converted into a quad)
			this._projectTriangle(outgoingVertices[0], outgoingVertices[1], outgoingVertices[2], outgoingVaryings[0], outgoingVaryings[1], outgoingVaryings[2]);
			this._projectTriangle(outgoingVertices[0], outgoingVertices[2], outgoingVertices[3], outgoingVaryings[0], outgoingVaryings[2], outgoingVaryings[3]);
		}
		else if (numOriginalVerticesInside == 1) { // simple clip (triangle is reduced in size)
			this._projectTriangle(outgoingVertices[0], outgoingVertices[1], outgoingVertices[2], outgoingVaryings[0], outgoingVaryings[1], outgoingVaryings[2]);
		}
		// else if (numOriginalVerticesInside == 0) { // full clipping (do nothing)
		// }
	}

	private _p0:Vector3D = new Vector3D();
	private _p1:Vector3D = new Vector3D();
	private _p2:Vector3D = new Vector3D();

	private _project:Vector3D = new Vector3D();

	private _barycentric:Vector3D = new Vector3D();
	private _barycentricRight:Vector3D = new Vector3D();
	private _barycentricBottom:Vector3D = new Vector3D();

	private _projectTriangle(position0:Float32Array, position1:Float32Array, position2:Float32Array, varying0:Float32Array, varying1:Float32Array, varying2:Float32Array) {

		// Wrap the vertex transformed positions in Vector3D objects.

		this._p0.x = position0[0];
		this._p0.y = position0[1];
		this._p0.z = position0[2];
		this._p0.w = position0[3];

		this._p1.x = position1[0];
		this._p1.y = position1[1];
		this._p1.z = position1[2];
		this._p1.w = position1[3];

		this._p2.x = position2[0];
		this._p2.y = position2[1];
		this._p2.z = position2[2];
		this._p2.w = position2[3];

		// Reject any invalid vertices.
		if (this._p0.w == 0 || this._p1.w == 0 || this._p2.w == 0) { return; } // w = 0 represent direction vectors and we want positions
		if ( isNaN(this._p0.x) || isNaN(this._p0.y) || isNaN(this._p0.z) || isNaN(this._p0.w) ) { return; }
		if ( isNaN(this._p1.x) || isNaN(this._p1.y) || isNaN(this._p1.z) || isNaN(this._p1.w) ) { return; }
		if ( isNaN(this._p2.x) || isNaN(this._p2.y) || isNaN(this._p2.z) || isNaN(this._p2.w) ) { return; }

		// Clip space.
		this._p0.z = this._p0.z * 2 - this._p0.w;
		this._p1.z = this._p1.z * 2 - this._p1.w;
		this._p2.z = this._p2.z * 2 - this._p2.w;

		// Perspective divide.
		this._p0.scaleBy(1 / this._p0.w);
		this._p1.scaleBy(1 / this._p1.w);
		this._p2.scaleBy(1 / this._p2.w);

		// Transform into screen space.
		this._project.x = this._p0.w;
		this._project.y = this._p1.w;
		this._project.z = this._p2.w;
		this._p0 = this._screenMatrix.transformVector(this._p0);
		this._p1 = this._screenMatrix.transformVector(this._p1);
		this._p2 = this._screenMatrix.transformVector(this._p2);

		// Prepare rasterization bounds.

		this._bboxMin.x = 1000000;
		this._bboxMin.y = 1000000;
		this._bboxMax.x = -1000000;
		this._bboxMax.y = -1000000;

		this._clamp.x = this._activeBuffer.width - 1;
		this._clamp.y = this._activeBuffer.height - 1;

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, this._p0.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, this._p0.y));

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, this._p1.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, this._p1.y));

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, this._p2.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, this._p2.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, this._p0.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, this._p0.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, this._p1.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, this._p1.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, this._p2.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, this._p2.y));

		this._bboxMin.x = Math.floor(this._bboxMin.x);
		this._bboxMin.y = Math.floor(this._bboxMin.y);
		this._bboxMax.x = Math.floor(this._bboxMax.x);
		this._bboxMax.y = Math.floor(this._bboxMax.y);

		/*
			NOTE:
			'simplified cross' product calculations below are inlined cross product calculations that ignore the z value and just use the output z value.
		 */

		// Skip invalid bounds.
		var w:number = this._bboxMax.x - this._bboxMin.x;
		var h:number = this._bboxMax.y - this._bboxMin.y;
		if (w <= 0 || h <= 0) { return; }

		// Calculate the area division for all barycentric coordinates.
		var area:number = (this._p1.x - this._p0.x) * (this._p2.y - this._p0.y) - (this._p1.y - this._p0.y) * (this._p2.x - this._p0.x); // simplified cross
		if (area < 0) { return; } // skip null areas.

		// Pre-calculate barycentric x and y derivatives (steps).
		var w0_dx:number = -(this._p2.y - this._p1.y) / area;
		var w1_dx:number = -(this._p0.y - this._p2.y) / area;
		var w2_dx:number = -(this._p1.y - this._p0.y) / area;
		var w0_dy:number = (this._p2.x - this._p1.x) / area;
		var w1_dy:number = (this._p0.x - this._p2.x) / area;
		var w2_dy:number = (this._p1.x - this._p0.x) / area;

		// Calculate top left barycentric coordinate.
		var w0:number = ((this._p2.x - this._p1.x) * (this._bboxMin.y - this._p1.y) - (this._p2.y - this._p1.y) * (this._bboxMin.x - this._p1.x)) / area; // simplified cross
		var w1:number = ((this._p0.x - this._p2.x) * (this._bboxMin.y - this._p2.y) - (this._p0.y - this._p2.y) * (this._bboxMin.x - this._p2.x)) / area; // simplified cross
		var w2:number = ((this._p1.x - this._p0.x) * (this._bboxMin.y - this._p0.y) - (this._p1.y - this._p0.y) * (this._bboxMin.x - this._p0.x)) / area; // simplified cross

		// Rasterize.
		var cx:number = 0;
		var cy:number = 0;
		for (var x:number = this._bboxMin.x; x <= this._bboxMax.x; x++) {
			for (var y:number = this._bboxMin.y; y <= this._bboxMax.y; y++) {

				// Calculate the barycentric weights of the pixel.
				this._barycentric.x = w0 + w0_dx * cx + w0_dy * cy;
				this._barycentric.y = w1 + w1_dx * cx + w1_dy * cy;
				this._barycentric.z = w2 + w2_dx * cx + w2_dy * cy;

				// Step y.
				cy += 1;

				// Skip pixel if its not inside the triangle.
				if (this._barycentric.x < 0 || this._barycentric.y < 0 || this._barycentric.z < 0)
					continue;

				// Calculate derivative (neighbor) weights.
				if (x != this._bboxMax.x) {
					this._barycentricRight.x = this._barycentric.x + w0_dx;
					this._barycentricRight.y = this._barycentric.x + w1_dx;
					this._barycentricRight.z = this._barycentric.x + w2_dx;
				}
				if (y != this._bboxMax.y) {
					this._barycentricBottom.x = this._barycentric.x + w0_dy;
					this._barycentricBottom.y = this._barycentric.x + w1_dy;
					this._barycentricBottom.z = this._barycentric.x + w2_dy;
				}

				// Interpolate frag depth.
				var index:number = (x % this._activeBuffer.width) + y * this._activeBuffer.width;
				var fragDepth:number = this._barycentric.x * this._p0.z + this._barycentric.y * this._p1.z + this._barycentric.z * this._p2.z;

				// Depth test.
				if (this._activeBuffer == this._backBufferColor && !DepthCompareModeSoftware[this._depthCompareMode](fragDepth, this._zbuffer[index]))
					continue;

				// Write z buffer.
				if (this._writeDepth)
					this._zbuffer[index] = fragDepth; // TODO: fragmentVO.outputDepth?

				// Process fragment shader.
				var fragmentVO:ProgramVOSoftware = this._program.fragment(this, this._barycentric, this._barycentricRight, this._barycentricBottom, varying0, varying1, varying2, fragDepth);
				if (fragmentVO.discard)
					continue;

				// Write to source and transform color space.
				this._source[0] = fragmentVO.outputColor[0] * 255;
				this._source[1] = fragmentVO.outputColor[1] * 255;
				this._source[2] = fragmentVO.outputColor[2] * 255;
				this._source[3] = fragmentVO.outputColor[3] * 255;

				// Read dest.
				this._activeBuffer.getPixelData(x, y, this._dest);

				// Write to color buffer.
				this._putPixel(x, y, this._source, this._dest);
			}

			// Step x.
			cy = 0;
			cx += 1;
		}
	}

	private _putPixel(x:number, y:number, source:Uint8ClampedArray, dest:Uint8ClampedArray):void  {
		this._rgba[0] = 0;
		this._rgba[1] = 0;
		this._rgba[2] = 0;
		this._rgba[3] = 0;

		BlendModeSoftware[this._blendDestination](dest, dest, source);
		BlendModeSoftware[this._blendSource](this._rgba, dest, source);

		this._activeBuffer.setPixelData(x, y, this._rgba);
	}

	public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):ICubeTexture  {
		return new CubeTextureSoftware(size);
	}

	public createIndexBuffer(numIndices:number):IIndexBuffer {
		return new IndexBufferSoftware(numIndices);
	}

	public createProgram():ProgramSoftware {
		return new ProgramSoftware();
	}

	public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):TextureSoftware {
		return new TextureSoftware(width, height);
	}

	public createVertexBuffer(numVertices:number, dataPerVertex:number):VertexBufferSoftware  {
		return new VertexBufferSoftware(numVertices, dataPerVertex);
	}

	public dispose():void {
	}

	public setBlendFactors(sourceFactor:string, destinationFactor:string):void  {
		this._blendSource = sourceFactor;
		this._blendDestination = destinationFactor;
	}

	public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean):void  {
		this._colorMaskR = red;
		this._colorMaskG = green;
		this._colorMaskB = blue;
		this._colorMaskA = alpha;
	}

	public setStencilActions(triangleFace:string, compareMode:string, actionOnBothPass:string, actionOnDepthFail:string, actionOnDepthPassStencilFail:string, coordinateSystem:string):void  {
		//TODO:
	}

	public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number):void {
		//TODO:
	}

	public setCulling(triangleFaceToCull:string, coordinateSystem:string):void  {
		//TODO: CoordinateSystem.RIGHT_HAND
		this._cullingMode = triangleFaceToCull;
	}

	public setDepthTest(depthMask:boolean, passCompareMode:string):void  {
		this._writeDepth = depthMask;
		this._depthCompareMode = passCompareMode;
	}

	public setProgram(program:ProgramSoftware):void  {
		this._program = program;
	}

	public setProgramConstantsFromArray(programType:number, data:Float32Array):void  {
		var target:Float32Array;
		if (programType == ContextGLProgramType.VERTEX)
			target = this._vertexConstants = new Float32Array(data.length);
		else if (programType == ContextGLProgramType.FRAGMENT)
			target = this._fragmentConstants = new Float32Array(data.length);

		target.set(data);
	}

	public setTextureAt(sampler:number, texture:TextureSoftware):void  {
		this._textures[sampler] = texture;
	}

	public setVertexBufferAt(index:number, buffer:VertexBufferSoftware, bufferOffset:number, format:number):void  {
		this._vertexBuffers[index] = buffer;
		this._vertexBufferOffsets[index] = bufferOffset;
		this._vertexBufferFormats[index] = format;
	}

	public present():void  {
		this._backBufferColor.unlock();

		this._frontBuffer.fillRect(this._frontBuffer.rect, ColorUtils.ARGBtoFloat32(0, 0, 0, 0));
		this._frontBuffer.draw(this._backBufferColor, this._frontBufferMatrix);
	}

	public drawToBitmapImage2D(destination:BitmapImage2D):void  {

		// TODO: remove software renderToTexture
		// This is just a hack used to debug depth maps.
		if (this._activeBuffer != this._backBufferColor) {

			destination.setPixels(destination.rect, this._activeBuffer.getImageData().data);
		}
	}

	private _interpolateVertexPair(factor:number, v0:Float32Array, v1:Float32Array, result:Float32Array) {

		for (var i:number = 0; i < v0.length; i++) {
			var delta = v0[i] - v1[i];
			result[i] = v1[i] + delta * factor;
		}
	}

	public clamp(value:number, min:number = 0, max:number = 1):number  {
		return Math.max(min, Math.min(value, max));
	}

	public interpolate(min:number, max:number, gradient:number):number  {
		return min + (max - min)*this.clamp(gradient);
	}

	public drawVertices(mode:string, firstVertex:number, numVertices:number):void  {
		//TODO:
	}

	public setScissorRectangle(rectangle:Rectangle):void  {
		//TODO:
	}

	public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void  {
		var state:SoftwareSamplerState = this._samplerStates[sampler];

		if (!state)
			state = this._samplerStates[sampler] = new SoftwareSamplerState();

		state.wrap = wrap;
		state.filter = filter;
		state.mipfilter = mipfilter;
	}

	public enableStencil() {

	}

	public disableStencil() {

	}

	public setStencilActionsMasks( compareMode:string = "always", referenceValue:number, writeMask:number, actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded") {

	}

	public get frontBuffer():BitmapImage2D {
		return this._frontBuffer;
	}

	public get container():HTMLElement {
		return this._canvas;
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL):void {
		this._backBufferColor.lock();

		if (mask & ContextGLClearMask.COLOR) {
			this._colorClearUint32.fill(((alpha*0xFF << 24) | (red*0xFF << 16) | (green*0xFF << 8) | blue*0xFF));
			this._backBufferColor.setPixels(this._backBufferRect, this._colorClearUint8);
		}

		//TODO: mask & ContextGLClearMask.STENCIL

		if (mask & ContextGLClearMask.DEPTH)
			this._zbuffer.set(this._zbufferClear); //fast memcpy
	}
}
