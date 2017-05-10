import {Matrix3D, Matrix, Point, Vector3D, Rectangle, ColorUtils, CoordinateSystem} from "@awayjs/core";

import {BitmapImage2D} from "@awayjs/graphics";

import {ContextGLBlendFactor} from "../base/ContextGLBlendFactor";
import {ContextGLClearMask} from "../base/ContextGLClearMask";
import {ContextGLCompareMode} from "../base/ContextGLCompareMode";
import {ContextGLProgramType} from "../base/ContextGLProgramType";
import {ContextGLTriangleFace} from "../base/ContextGLTriangleFace";
import {ContextGLMipFilter} from "../base/ContextGLMipFilter";
import {ContextGLWrapMode} from "../base/ContextGLWrapMode";
import {ContextGLStencilAction} from "../base/ContextGLStencilAction";
import {ContextGLTextureFormat} from "../base/ContextGLTextureFormat";
import {ContextGLDrawMode} from "../base/ContextGLDrawMode";
import {ContextGLTextureFilter} from "../base/ContextGLTextureFilter";
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

	private _yflip:boolean;
	private _backBufferRect:Rectangle = new Rectangle();
	private _backBufferColor:BitmapImage2D;
	private _frontBuffer:BitmapImage2D;
	private _activeBufferColor:BitmapImage2D;
	private _activeBufferZ:Float32Array;
	private _activeTexture:TextureSoftware;

	private _backBufferZ:Float32Array;
	private _backBufferZClear:Float32Array;
	private _cullingMode:ContextGLTriangleFace = ContextGLTriangleFace.BACK;
	private _blendSource:ContextGLBlendFactor = ContextGLBlendFactor.ONE;
	private _blendDestination:ContextGLBlendFactor = ContextGLBlendFactor.ZERO;
	private _colorMaskR:boolean = true;
	private _colorMaskG:boolean = true;
	private _colorMaskB:boolean = true;
	private _colorMaskA:boolean = true;
	private _writeDepth:boolean = true;
	private _depthCompareMode:ContextGLCompareMode = ContextGLCompareMode.LESS;
	private _depthCompareModeSoftware:(fragDepth:number, currentDepth:number) => void[] = (fragDepth:number, currentDepth:number) => void[];
	private _blendModeSoftware:(result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray) => void[] = (result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray) => void[];
	private _program:ProgramSoftware;

	private _screenMatrix:Matrix3D = new Matrix3D();
	private _frontBufferMatrix:Matrix = new Matrix();

	private _bboxMin:Point = new Point();
	private _bboxMax:Point = new Point();
	private _clamp:Point = new Point();

	public _samplerStates:SoftwareSamplerState[] = [];
	public _textures:Array<ITextureBaseSoftware> = [];
	private textureBuffersColor:Array<BitmapImage2D> = [];
	private textureBuffersZ:Array<Float32Array> = [];
	private textureBuffersZClear:Array<Float32Array> = [];
	public _vertexBuffers:Array<VertexBufferSoftware> = [];
	public _vertexBufferOffsets:Array<number> = [];
	public _vertexBufferFormats:Array<number> = [];

	public _fragmentConstants:Float32Array;
	public _vertexConstants:Float32Array;

	private _rgba:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _source:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _dest:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _destComp:Uint8ClampedArray = new Uint8ClampedArray(4);
	private _sourceComp:Uint8ClampedArray = new Uint8ClampedArray(4);

	//public static _drawCallback:Function = null;

	private _antialias:number = 0;

	constructor(canvas:HTMLCanvasElement)
	{

		this._canvas = canvas;

		this._backBufferColor = new BitmapImage2D(100, 100, false, 0, false);
		this._frontBuffer = new BitmapImage2D(100, 100, false, 0, false);
		this._activeBufferColor = this._backBufferColor;

		var len:number = 100 * 100;
		var zbufferBytes:ArrayBuffer = new ArrayBuffer(len*8);
		this._backBufferZ = new Float32Array(zbufferBytes, 0, len);
		this._backBufferZClear = new Float32Array(zbufferBytes, len*4, len);
		for (var i:number = 0; i < len; i++)
			this._backBufferZClear[i] = 10000000;

		this._activeBufferZ = this._backBufferZ;

		if (document && document.body) {
			var frontCanvas = this._frontBuffer.getCanvas();

			// TODO: remove software renderToTexture
			frontCanvas.style.position = "absolute";

			document.body.appendChild(frontCanvas);
		}

		this._depthCompareModeSoftware[ContextGLCompareMode.ALWAYS] = DepthCompareModeSoftware.always;
		this._depthCompareModeSoftware[ContextGLCompareMode.EQUAL] = DepthCompareModeSoftware.equal;
		this._depthCompareModeSoftware[ContextGLCompareMode.GREATER] = DepthCompareModeSoftware.greaterEqual;
		this._depthCompareModeSoftware[ContextGLCompareMode.GREATER_EQUAL] = DepthCompareModeSoftware.greater;
		this._depthCompareModeSoftware[ContextGLCompareMode.LESS] = DepthCompareModeSoftware.less;
		this._depthCompareModeSoftware[ContextGLCompareMode.LESS_EQUAL] = DepthCompareModeSoftware.lessEqual;
		this._depthCompareModeSoftware[ContextGLCompareMode.NEVER] = DepthCompareModeSoftware.never;
		this._depthCompareModeSoftware[ContextGLCompareMode.NOT_EQUAL] = DepthCompareModeSoftware.notEqual;

		this._blendModeSoftware[ContextGLBlendFactor.DESTINATION_ALPHA] = BlendModeSoftware.destinationAlpha;
		this._blendModeSoftware[ContextGLBlendFactor.DESTINATION_COLOR] = BlendModeSoftware.destinationColor;
		this._blendModeSoftware[ContextGLBlendFactor.ONE] = BlendModeSoftware.one;
		this._blendModeSoftware[ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = BlendModeSoftware.oneMinusDestinationAlpha;
		this._blendModeSoftware[ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = BlendModeSoftware.oneMinusDestinationColor;
		this._blendModeSoftware[ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = BlendModeSoftware.oneMinusSourceAlpha;
		this._blendModeSoftware[ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = BlendModeSoftware.oneMinusSourceColor;
		this._blendModeSoftware[ContextGLBlendFactor.SOURCE_ALPHA] = BlendModeSoftware.sourceAlpha;
		this._blendModeSoftware[ContextGLBlendFactor.SOURCE_COLOR] = BlendModeSoftware.sourceColor;
		this._blendModeSoftware[ContextGLBlendFactor.ZERO] = BlendModeSoftware.zero;


	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean):void
	{

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
		this._backBufferZ = new Float32Array(zbufferBytes, 0, len);
		this._backBufferZClear = new Float32Array(zbufferBytes, len*4, len);
		for (var i:number = 0; i < len; i++)
			this._backBufferZClear[i] = 10000000;

		if (this._activeBufferColor == this._backBufferColor)
			this._activeBufferZ = this._backBufferZ;

		this._backBufferRect.width = backBufferWidth;
		this._backBufferRect.height = backBufferHeight;

		this._backBufferColor._setSize(backBufferWidth, backBufferHeight);

		this.activateScreenMatrix(this._backBufferRect.width, this._backBufferRect.height, true);

		this._frontBufferMatrix = new Matrix();
		this._frontBufferMatrix.scale(1/this._antialias, 1/this._antialias);
	}

	private activateScreenMatrix(width:number, height:number, yflip:boolean):void
	{

		var raw:Float32Array = this._screenMatrix._rawData;

		raw[0] = width / 2;
		raw[1] = 0;
		raw[2] = 0;
		raw[3] = 0;

		raw[4] = 0;
		raw[5] = yflip? -height / 2 : height / 2;
		raw[6] = 0;
		raw[7] = 0;

		raw[8] = 0;
		raw[9] = 0;
		raw[10] = 1;
		raw[11] = 0;

		raw[12] = width / 2;
		raw[13] = height / 2;
		raw[14] = 0;
		raw[15] = 0;

		this._yflip = yflip;
	}

	public setRenderToTexture(target:TextureSoftware, enableDepthAndStencil:boolean, antiAlias:number, surfaceSelector:number):void
	{

		// Create texture buffer and screen matrix if needed.
		var textureBufferColor:BitmapImage2D = this.textureBuffersColor[surfaceSelector];
		if (textureBufferColor == null) {

			// TODO: consider transparency prop
			// TODO: consider fill color prop
			// TODO: consider powerOfTwo prop
			textureBufferColor = this.textureBuffersColor[surfaceSelector] = new BitmapImage2D(target.width, target.height, false, 0xFFFFFF, true);

			// TODO: transfer the initial image2D data from the texture to the BitmapImage2D object.
			target.uploadFromImage(textureBufferColor);
		}
		else {
			textureBufferColor.fillRect(textureBufferColor.rect, 0xFFFFFF);
		}

		this._activeBufferColor = textureBufferColor;
		this._activeBufferColor.lock();

		var textureBufferZ:Float32Array = this.textureBuffersZ[surfaceSelector];
		var textureBufferZClear:Float32Array = this.textureBuffersZClear[surfaceSelector];
		if (textureBufferZ == null) {

			//double buffer for fast clearing
			var len:number = target.width * target.height;
			var zbufferBytes:ArrayBuffer = new ArrayBuffer(len*8);
			textureBufferZ = this.textureBuffersZ[surfaceSelector] = new Float32Array(zbufferBytes, 0, len);
			textureBufferZClear = this.textureBuffersZClear[surfaceSelector] = new Float32Array(zbufferBytes, len*4, len);
			for (var i:number = 0; i < len; i++)
				textureBufferZClear[i] = 10000000;
		}

		textureBufferZ.set(textureBufferZClear); //fast memcpy


		this._activeBufferZ = textureBufferZ;

		this.activateScreenMatrix(target.width, target.height, false);
		this._activeTexture = target;
	}

	public setRenderToBackBuffer():void
	{
		this._activeBufferColor = this._backBufferColor;
		this._activeBufferZ = this._backBufferZ;
		this.activateScreenMatrix(this._backBufferColor.width, this._backBufferColor.height, true);
	}

	public drawIndices(mode:ContextGLDrawMode, indexBuffer:IndexBufferSoftware, firstIndex:number, numIndices:number):void
	{

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

		if (this._yflip && this._cullingMode == ContextGLTriangleFace.BACK || !this._yflip && this._cullingMode == ContextGLTriangleFace.FRONT) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
				this._triangle(incomingVertices, outgoingVertices, incomingVaryings, outgoingVaryings);
			}
		} else if (this._yflip && this._cullingMode == ContextGLTriangleFace.FRONT || !this._yflip && this._cullingMode == ContextGLTriangleFace.BACK) {
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
		if (this._activeBufferColor != this._backBufferColor) {
			this._activeBufferColor.unlock();
			this._activeTexture.uploadFromImage(this._activeBufferColor);
		}
	}

	private _triangle(incomingVertices:Array<Float32Array>, outgoingVertices:Array<Float32Array>, incomingVaryings:Array<Float32Array>, outgoingVaryings:Array<Float32Array>):void
	{

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

	private _projectTriangle(position0:Float32Array, position1:Float32Array, position2:Float32Array, varying0:Float32Array, varying1:Float32Array, varying2:Float32Array):void
	{

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
		this._p0.project();
		this._p1.project();
		this._p2.project();

		// Transform into screen space.
		this._project.x = this._p0.w;
		this._project.y = this._p1.w;
		this._project.z = this._p2.w;
		this._p0.w = 1;
		this._p1.w = 1;
		this._p2.w = 1;
		this._p0 = this._screenMatrix.transformVector(this._p0, this._p0);
		this._p1 = this._screenMatrix.transformVector(this._p1, this._p1);
		this._p2 = this._screenMatrix.transformVector(this._p2, this._p2);

		// Prepare rasterization bounds.

		this._bboxMin.x = 1000000;
		this._bboxMin.y = 1000000;
		this._bboxMax.x = -1000000;
		this._bboxMax.y = -1000000;

		this._clamp.x = this._activeBufferColor.width - 1;
		this._clamp.y = this._activeBufferColor.height - 1;

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
					this._barycentricRight.y = this._barycentric.y + w1_dx;
					this._barycentricRight.z = this._barycentric.z + w2_dx;
					this._barycentricRight.x /= this._project.x;
					this._barycentricRight.y /= this._project.y;
					this._barycentricRight.z /= this._project.z;
					this._barycentricRight.scaleBy( 1 / (this._barycentricRight.x + this._barycentricRight.y + this._barycentricRight.z) );
				}
				if (y != this._bboxMax.y) {
					this._barycentricBottom.x = this._barycentric.x + w0_dy;
					this._barycentricBottom.y = this._barycentric.y + w1_dy;
					this._barycentricBottom.z = this._barycentric.z + w2_dy;
					this._barycentricBottom.x /= this._project.x;
					this._barycentricBottom.y /= this._project.y;
					this._barycentricBottom.z /= this._project.z;
					this._barycentricBottom.scaleBy( 1 / (this._barycentricBottom.x + this._barycentricBottom.y + this._barycentricBottom.z) );
				}

				// Interpolate frag depth.
				var index:number = (x % this._activeBufferColor.width) + y * this._activeBufferColor.width;
				var fragDepth:number = (this._barycentric.x * this._p0.z + this._barycentric.y * this._p1.z + this._barycentric.z * this._p2.z)/ (this._barycentric.x + this._barycentric.y + this._barycentric.z);

				this._barycentric.x /= this._project.x;
				this._barycentric.y /= this._project.y;
				this._barycentric.z /= this._project.z;
				this._barycentric.scaleBy( 1 / (this._barycentric.x + this._barycentric.y + this._barycentric.z) );

				// Depth test.
				if (!this._depthCompareModeSoftware[this._depthCompareMode](fragDepth, this._activeBufferZ[index]))
					continue;

				// Write z buffer.
				if (this._writeDepth)
					this._activeBufferZ[index] = fragDepth; // TODO: fragmentVO.outputDepth?

				// Process fragment shader.
				var fragmentVO:ProgramVOSoftware = this._program.fragment(this, this._barycentric, this._barycentricRight, this._barycentricBottom, varying0, varying1, varying2, fragDepth);
				if (fragmentVO.discard)
					continue;

				// Write to source and transform color space.
				this._source[0] = fragmentVO.outputColor[0] * 0xFF;
				this._source[1] = fragmentVO.outputColor[1] * 0xFF;
				this._source[2] = fragmentVO.outputColor[2] * 0xFF;
				this._source[3] = fragmentVO.outputColor[3] * 0xFF;

				// Read dest.
				this._activeBufferColor.getPixelData(x, y, this._dest);

				// Write to color buffer.
				this._putPixel(x, y);
			}

			// Step x.
			cy = 0;
			cx += 1;
		}
	}

	private _putPixel(x:number, y:number):void
	{
		this._blendModeSoftware[this._blendDestination](this._destComp, this._dest, this._dest, this._source);
		this._blendModeSoftware[this._blendSource](this._sourceComp, this._source, this._dest, this._source);

		this._rgba[0] = this._sourceComp[0] + this._destComp[0];
		this._rgba[1] = this._sourceComp[1] + this._destComp[1];
		this._rgba[2] = this._sourceComp[2] + this._destComp[2];
		this._rgba[3] = this._sourceComp[3] + this._destComp[3];

		this._activeBufferColor.setPixelData(x, y, this._rgba);
	}

	public createCubeTexture(size:number, format:ContextGLTextureFormat, optimizeForRenderToTexture:boolean, streamingLevels:number):ICubeTexture
	{
		return new CubeTextureSoftware(size);
	}

	public createIndexBuffer(numIndices:number):IIndexBuffer
	{
		return new IndexBufferSoftware(numIndices);
	}

	public createProgram():ProgramSoftware
	{
		return new ProgramSoftware();
	}

	public createTexture(width:number, height:number, format:ContextGLTextureFormat, optimizeForRenderToTexture:boolean, streamingLevels:number):TextureSoftware
	{
		return new TextureSoftware(width, height);
	}

	public createVertexBuffer(numVertices:number, dataPerVertex:number):VertexBufferSoftware
	{
		return new VertexBufferSoftware(numVertices, dataPerVertex);
	}

	public dispose():void
	{
	}

	public setBlendFactors(sourceFactor:ContextGLBlendFactor, destinationFactor:ContextGLBlendFactor):void
	{
		this._blendSource = sourceFactor;
		this._blendDestination = destinationFactor;
	}

	public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean):void
	{
		this._colorMaskR = red;
		this._colorMaskG = green;
		this._colorMaskB = blue;
		this._colorMaskA = alpha;
	}

	public setStencilActions(triangleFace:ContextGLTriangleFace = ContextGLTriangleFace.FRONT_AND_BACK, compareMode:ContextGLCompareMode = ContextGLCompareMode.ALWAYS, actionOnBothPass:ContextGLStencilAction = ContextGLStencilAction.KEEP, actionOnDepthFail:ContextGLStencilAction = ContextGLStencilAction.KEEP, actionOnDepthPassStencilFail:ContextGLStencilAction = ContextGLStencilAction.KEEP, coordinateSystem:CoordinateSystem = CoordinateSystem.LEFT_HANDED):void
	{
		//TODO:
	}

	public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number):void
	{
		//TODO:
	}

	public setCulling(triangleFaceToCull:ContextGLTriangleFace, coordinateSystem:CoordinateSystem):void
	{
		//TODO: CoordinateSystem.RIGHT_HAND
		this._cullingMode = triangleFaceToCull;
	}

	public setDepthTest(depthMask:boolean, passCompareMode:ContextGLCompareMode):void
	{
		this._writeDepth = depthMask;
		this._depthCompareMode = passCompareMode;
	}

	public setProgram(program:ProgramSoftware):void
	{
		this._program = program;
	}

	public setProgramConstantsFromArray(programType:number, data:Float32Array):void
	{
		var target:Float32Array;
		if (programType == ContextGLProgramType.VERTEX)
			target = this._vertexConstants = new Float32Array(data.length);
		else if (programType == ContextGLProgramType.FRAGMENT)
			target = this._fragmentConstants = new Float32Array(data.length);

		target.set(data);
	}

	public setTextureAt(sampler:number, texture:TextureSoftware):void
	{
		this._textures[sampler] = texture;
	}

	public setVertexBufferAt(index:number, buffer:VertexBufferSoftware, bufferOffset:number, format:number):void
	{
		this._vertexBuffers[index] = buffer;
		this._vertexBufferOffsets[index] = bufferOffset;
		this._vertexBufferFormats[index] = format;
	}

	public present():void
	{
		this._backBufferColor.unlock();
		this._frontBuffer.fillRect(this._frontBuffer.rect, 0);
		this._frontBuffer.draw(this._backBufferColor, this._frontBufferMatrix);
	}

	public drawToBitmapImage2D(destination:BitmapImage2D):void
	{
		destination.setPixels(this._activeBufferColor.rect, this._activeBufferColor.getImageData().data);
	}

	private _interpolateVertexPair(factor:number, v0:Float32Array, v1:Float32Array, result:Float32Array):void
	{

		for (var i:number = 0; i < v0.length; i++) {
			var delta = v0[i] - v1[i];
			result[i] = v1[i] + delta * factor;
		}
	}

	public clamp(value:number, min:number = 0, max:number = 1):number
	{
		return Math.max(min, Math.min(value, max));
	}

	public interpolate(min:number, max:number, gradient:number):number
	{
		return min + (max - min)*this.clamp(gradient);
	}

	public drawVertices(mode:ContextGLDrawMode, firstVertex:number, numVertices:number):void
	{
		//TODO:
	}

	public setScissorRectangle(rectangle:Rectangle):void
	{
		//TODO:
	}

	public setSamplerStateAt(sampler:number, wrap:ContextGLWrapMode, filter:ContextGLTextureFilter, mipfilter:ContextGLMipFilter):void
	{
		var state:SoftwareSamplerState = this._samplerStates[sampler];

		if (!state)
			state = this._samplerStates[sampler] = new SoftwareSamplerState();

		state.wrap = wrap;
		state.filter = filter;
		state.mipfilter = mipfilter;
	}

	public enableStencil():void
	{

	}

	public disableStencil():void
	{

	}

	public get frontBuffer():BitmapImage2D
	{
		return this._frontBuffer;
	}

	public get container():HTMLElement
	{
		return this._canvas;
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL):void
	{
		this._backBufferColor.lock();

		if (mask & ContextGLClearMask.COLOR)
			this._backBufferColor.fillRect(this._backBufferRect, ColorUtils.ARGBtoFloat32(alpha * 0xFF, red *  0xFF, green * 0xFF, blue * 0xFF))

		//TODO: mask & ContextGLClearMask.STENCIL

		if (mask & ContextGLClearMask.DEPTH)
			this._backBufferZ.set(this._backBufferZClear); //fast memcpy
	}
}
