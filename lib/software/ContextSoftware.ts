import {BitmapImage2D}				from "@awayjs/core/lib/image/BitmapImage2D";
import {Matrix3D}						from "@awayjs/core/lib/geom/Matrix3D";
import {Matrix}						from "@awayjs/core/lib/geom/Matrix";
import {Point}						from "@awayjs/core/lib/geom/Point";
import {Vector3D}						from "@awayjs/core/lib/geom/Vector3D";
import {Rectangle}					from "@awayjs/core/lib/geom/Rectangle";
import {ColorUtils}					from "@awayjs/core/lib/utils/ColorUtils";

import {ContextGLBlendFactor}			from "../base/ContextGLBlendFactor";
import {ContextGLClearMask}			from "../base/ContextGLClearMask";
import {ContextGLCompareMode}			from "../base/ContextGLCompareMode";
import {ContextGLProgramType}			from "../base/ContextGLProgramType";
import {ContextGLTriangleFace}		from "../base/ContextGLTriangleFace";
import {IContextGL}					from "../base/IContextGL";
import {IIndexBuffer}					from "../base/IIndexBuffer";
import {ICubeTexture}					from "../base/ICubeTexture";

import {ITextureBaseSoftware}			from "./ITextureBaseSoftware";
import {IndexBufferSoftware}			from "./IndexBufferSoftware";
import {VertexBufferSoftware}			from "./VertexBufferSoftware";
import {TextureSoftware}				from "./TextureSoftware";
import {CubeTextureSoftware}			from "./CubeTextureSoftware";
import {ProgramSoftware}				from "./ProgramSoftware";
import {ProgramVOSoftware}			from "./ProgramVOSoftware";
import {SoftwareSamplerState}			from "./SoftwareSamplerState";

export class ContextSoftware implements IContextGL
{
	private _canvas:HTMLCanvasElement;

	public static MAX_SAMPLERS:number = 8;

	private _backBufferRect:Rectangle = new Rectangle();
	private _backBufferWidth:number = 100;
	private _backBufferHeight:number = 100;
	private _backBufferColor:BitmapImage2D;
	private _frontBuffer:BitmapImage2D;
	private _activeBuffer:BitmapImage2D;

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
	public _vertexBuffers:Array<VertexBufferSoftware> = [];
	public _vertexBufferOffsets:Array<number> = [];
	public _vertexBufferFormats:Array<number> = [];

	public _fragmentConstants:Float32Array;
	public _vertexConstants:Float32Array;

	private _sx:Vector3D = new Vector3D();
	private _sy:Vector3D = new Vector3D();
	private _u:Vector3D = new Vector3D();

	//public static _drawCallback:Function = null;

	private _antialias:number = 0;

	constructor(canvas:HTMLCanvasElement)
	{
		this._canvas = canvas;

		this._backBufferColor = new BitmapImage2D(this._backBufferWidth, this._backBufferHeight, false, 0, false);
		this._frontBuffer = new BitmapImage2D(this._backBufferWidth, this._backBufferHeight, true, 0, false);
		this._activeBuffer = this._backBufferColor;

		if (document && document.body) 
			document.body.appendChild(this._frontBuffer.getCanvas());
	}

	public enableStencil(){

	}
	public disableStencil(){

	}
	public setStencilActionsMasks( compareMode:string = "always", referenceValue:number, writeMask:number, actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded")
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

		if (mask & ContextGLClearMask.COLOR) {
			this._colorClearUint32.fill(((alpha*0xFF << 24) | (red*0xFF << 16) | (green*0xFF << 8) | blue*0xFF));
			this._backBufferColor.setPixels(this._backBufferRect, this._colorClearUint8);
		}

		//TODO: mask & ContextGLClearMask.STENCIL

		if (mask & ContextGLClearMask.DEPTH)
			this._zbuffer.set(this._zbufferClear); //fast memcpy
	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean):void
	{
		this._antialias = antiAlias;

		if (this._antialias % 2 != 0)
			this._antialias = Math.floor(this._antialias - 0.5);

		if (this._antialias == 0)
			this._antialias = 1;

		this._frontBuffer._setSize(width, height);

		this._backBufferWidth = width*this._antialias;
		this._backBufferHeight = height*this._antialias;

		//double buffer for fast clearing
		var len:number = this._backBufferWidth*this._backBufferHeight;
		var zbufferBytes:ArrayBuffer = new ArrayBuffer(len*8);
		this._zbuffer = new Float32Array(zbufferBytes, 0, len);
		this._zbufferClear = new Float32Array(zbufferBytes, len*4, len);
		for (var i:number = 0; i < len; i++)
			this._zbufferClear[i] = 10000000;

		var colorClearBuffer:ArrayBuffer = new ArrayBuffer(len*4);

		this._colorClearUint8 = new Uint8ClampedArray(colorClearBuffer);
		this._colorClearUint32 = new Uint32Array(colorClearBuffer);
		this._backBufferRect.width = this._backBufferWidth;
		this._backBufferRect.height = this._backBufferHeight;

		this._backBufferColor._setSize(this._backBufferWidth, this._backBufferHeight);

		var raw:Float32Array = this._screenMatrix._rawData;

		raw[0] = this._backBufferWidth /2;
		raw[1] = 0;
		raw[2] = 0;
		raw[3] = this._backBufferWidth/2;

		raw[4] = 0;
		raw[5] = -this._backBufferHeight/2;
		raw[6] = 0;
		raw[7] = this._backBufferHeight/2;

		raw[8] = 0;
		raw[9] = 0;
		raw[10] = 1;
		raw[11] = 0;

		raw[12] = 0;
		raw[13] = 0;
		raw[14] = 0;
		raw[15] = 0;

		this._screenMatrix.transpose();

		this._frontBufferMatrix = new Matrix();
		this._frontBufferMatrix.scale(1/this._antialias, 1/this._antialias);
	}

	public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):ICubeTexture
	{
		return new CubeTextureSoftware(size);
	}

	public createIndexBuffer(numIndices:number):IIndexBuffer {
		return new IndexBufferSoftware(numIndices);
	}

	public createProgram():ProgramSoftware {
		return new ProgramSoftware();
	}

	public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number):TextureSoftware
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

	public setBlendFactors(sourceFactor:string, destinationFactor:string):void
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

	public setStencilActions(triangleFace:string, compareMode:string, actionOnBothPass:string, actionOnDepthFail:string, actionOnDepthPassStencilFail:string, coordinateSystem:string):void
	{
		//TODO:
	}

	public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number):void
	{
		//TODO:
	}

	public setCulling(triangleFaceToCull:string, coordinateSystem:string):void
	{
		//TODO: CoordinateSystem.RIGHT_HAND
		this._cullingMode = triangleFaceToCull;
	}

	public setDepthTest(depthMask:boolean, passCompareMode:string):void
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

		this._frontBuffer.fillRect(this._frontBuffer.rect, ColorUtils.ARGBtoFloat32(0, 0, 0, 0));
		this._frontBuffer.draw(this._backBufferColor, this._frontBufferMatrix);
	}

	public drawToBitmapImage2D(destination:BitmapImage2D):void
	{
		// TODO:
	}

	public drawIndices(mode:string, indexBuffer:IndexBufferSoftware, firstIndex:number, numIndices:number):void
	{
		if (!this._program)
			return;

		// These are place holders for vertex transformation operations.

		var position0:Float32Array = new Float32Array(4);
		var position1:Float32Array = new Float32Array(4);
		var position2:Float32Array = new Float32Array(4);
		
		var varying0:Float32Array = new Float32Array(this._program.numVarying*4);
		var varying1:Float32Array = new Float32Array(this._program.numVarying*4);
		var varying2:Float32Array = new Float32Array(this._program.numVarying*4);

		// Sweep triangles according to culling mode and process thru vertex shader.

		if (this._cullingMode == ContextGLTriangleFace.BACK) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
				this._triangle(position0, position1, position2, varying0, varying1, varying2);
			}
		} else if (this._cullingMode == ContextGLTriangleFace.FRONT) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
				this._triangle(position0, position1, position2, varying0, varying1, varying2);
			}
		} else if (this._cullingMode == ContextGLTriangleFace.FRONT_AND_BACK || this._cullingMode == ContextGLTriangleFace.NONE) {
			for (var i:number = firstIndex; i < numIndices; i += 3) {
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
				this._triangle(position0, position1, position2, varying0, varying1, varying2);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
				this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
				this._triangle(position0, position1, position2, varying0, varying1, varying2);
			}
		}
	}

	public drawVertices(mode:string, firstVertex:number, numVertices:number):void
	{
		//TODO:
	}

	public setScissorRectangle(rectangle:Rectangle):void
	{
		//TODO:
	}

	public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void
	{
		var state:SoftwareSamplerState = this._samplerStates[sampler];

		if (!state)
			state = this._samplerStates[sampler] = new SoftwareSamplerState();

		state.wrap = wrap;
		state.filter = filter;
		state.mipfilter = mipfilter;
	}

	public setRenderToTexture(target:TextureSoftware, enableDepthAndStencil:boolean, antiAlias:number, surfaceSelector:number)
	{
		// TODO: consider transparency prop
		// TODO: consider fill color prop
		// TODO: consider powerOfTwo prop

		var textureBuffer = new BitmapImage2D(target.width, target.height, false, 0, false);

		// TODO: consider mip levels
		var rect = textureBuffer.rect;
		var data:number[] = target.getData(0);

		textureBuffer.setArray(rect, data);

		this._activeBuffer = textureBuffer;
	}

	public setRenderToBackBuffer():void
	{
		this._activeBuffer = this._backBufferColor;
	}

	private _putPixel(x:number, y:number, source:Uint8ClampedArray, dest:Uint8ClampedArray):void
	{
		argb[0] = 0;
		argb[1] = 0;
		argb[2] = 0;
		argb[3] = 0;

		BlendModeSoftware[this._blendDestination](dest, dest, source);
		BlendModeSoftware[this._blendSource](source, dest, source);

		// TODO: remove
		// if (this._activeBuffer != this._backBufferColor) {
			// argb[3] = (<number>(argb[2]) / 255.0);
			// argb[2] = (<number>(argb[1]) / 255.0);
			// argb[1] = (<number>(argb[0]) / 255.0);
			// argb[3] = 255;
			// argb[0] = 120;
			// argb[1] = 120;
			// argb[2] = 120;
			// argb[3] = 255;
			// console.log("depth: " + x + ", " + y + " - " + argb)
		// }

		this._activeBuffer.setPixelData(x, y, argb);
	}

	public clamp(value:number, min:number = 0, max:number = 1):number
	{
		return Math.max(min, Math.min(value, max));
	}

	public interpolate(min:number, max:number, gradient:number):number
	{
		return min + (max - min)*this.clamp(gradient);
	}

	private _triangle(position0:Float32Array, position1:Float32Array, position2:Float32Array, v0:Float32Array, v1:Float32Array, v2:Float32Array):void
	{
		// Wrap the vertex transformed positions in Vector3D objects.
		var p0:Vector3D = new Vector3D(position0[0], position0[1], position0[2], position0[3]);
		var p1:Vector3D = new Vector3D(position1[0], position1[1], position1[2], position1[3]);
		var p2:Vector3D = new Vector3D(position2[0], position2[1], position2[2], position2[3]);

		// Reject any invalid vertices.
		if (!p0 || !p1 || !p2) { return; }
		if (p0.w == 0 || p1.w == 0 || p2.w == 0) { return; } // w = 0 represent direction vectors and we want positions
		if ( isNaN(p0.x) || isNaN(p0.y) || isNaN(p0.z) || isNaN(p0.w) ) { return; }
		if ( isNaN(p1.x) || isNaN(p1.y) || isNaN(p1.z) || isNaN(p1.w) ) { return; }
		if ( isNaN(p2.x) || isNaN(p2.y) || isNaN(p2.z) || isNaN(p2.w) ) { return; }

		this._clipTriangle(p0, p1, p2, v0, v1, v2);
	}

	private _clipTriangle(p0:Vector3D, p1:Vector3D, p2:Vector3D, v0:Float32Array, v1:Float32Array, v2:Float32Array) {

		// Check if the vertices are behind the near plane and interpolate
		// new vertices whenever one vertex in a side is in front of the camera AND the other is behind it.
		var near = 0; // TODO: use real camera near plane value
		var numOriginalVerticesInside = 0;
		var incomingVertices:Array<Vector3D> = new Array<Vector3D>();
		incomingVertices.push(p1, p2, p0);
		var outgoingVertices:Array<Vector3D> = new Array<Vector3D>(); // may contain from 0 to 4 vertices
		var previousVertex = p0;
		var previousVertexIsInside = previousVertex.z > near;
		if (previousVertexIsInside) { // add the original vertex if its inside
			outgoingVertices.push(previousVertex);
			numOriginalVerticesInside++;
		}
		for (var i:number = 0; i < incomingVertices.length; i++) {
			var currentVertex = incomingVertices[i];
			var currentVertexIsInside = currentVertex.z > near;
			if (currentVertexIsInside != previousVertexIsInside) { // if one and only one is true

				// Interpolate new vertex.
				var side = currentVertex.subtract(previousVertex);
				var d_current = Math.abs(currentVertex.z - near);
				var d_previous = Math.abs(previousVertex.z - near);
				var interpolationFactor = d_previous / (d_previous + d_current);
				var scaledSide = side.clone();
				scaledSide.scaleBy(interpolationFactor);
				scaledSide.w *= interpolationFactor;
				var interpolatedVertex = previousVertex.clone();
				interpolatedVertex = interpolatedVertex.add(scaledSide);
				outgoingVertices.push(interpolatedVertex);
			}
			if (currentVertexIsInside && i != incomingVertices.length - 1) { // add the original vertex if its inside
				outgoingVertices.push(currentVertex);
				numOriginalVerticesInside++;
			}
			previousVertex = currentVertex;
			previousVertexIsInside = currentVertexIsInside;
		}

		// Project the resulting vertices as triangles.
		if (numOriginalVerticesInside == 3) { // no clipping
			this._projectTriangle(p0, p1, p2, v0, v1, v2);
		}
		else if (numOriginalVerticesInside == 2) { // quad clip (triangle is converted into a quad)
			this._projectTriangle(outgoingVertices[0].clone(), outgoingVertices[1].clone(), outgoingVertices[2].clone(), v0, v1, v2);
			this._projectTriangle(outgoingVertices[0], outgoingVertices[2], outgoingVertices[3], v0, v1, v2);
		}
		else if (numOriginalVerticesInside == 1) { // simple clip (triangle is reduced in size)
			this._projectTriangle(outgoingVertices[0], outgoingVertices[1], outgoingVertices[2], v0, v1, v2);
		}
		else if (numOriginalVerticesInside == 0) { // full clipping (do nothing)
		}
	}

	private _projectTriangle(p0:Vector3D, p1:Vector3D, p2:Vector3D, varying0:Float32Array, varying1:Float32Array, varying2:Float32Array) {

		p0.z = p0.z * 2 - p0.w;
		p1.z = p1.z * 2 - p1.w;
		p2.z = p2.z * 2 - p2.w;

		// Apply projection.
		p0.scaleBy(1 / p0.w);
		p1.scaleBy(1 / p1.w);
		p2.scaleBy(1 / p2.w);

		// Transform into screen space.
		var project:Vector3D = new Vector3D(p0.w, p1.w, p2.w);
		p0 = this._screenMatrix.transformVector(p0);
		p1 = this._screenMatrix.transformVector(p1);
		p2 = this._screenMatrix.transformVector(p2);
		var depth:Vector3D = new Vector3D(p0.z, p1.z, p2.z);

		// Prepare rasterization bounds.

		this._bboxMin.x = 1000000;
		this._bboxMin.y = 1000000;
		this._bboxMax.x = -1000000;
		this._bboxMax.y = -1000000;

		this._clamp.x = this._backBufferWidth - 1;
		this._clamp.y = this._backBufferHeight - 1;

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p0.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p0.y));

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p1.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p1.y));

		this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p2.x));
		this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p2.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p0.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p0.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p1.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p1.y));

		this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p2.x));
		this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p2.y));

		this._bboxMin.x = Math.floor(this._bboxMin.x);
		this._bboxMin.y = Math.floor(this._bboxMin.y);
		this._bboxMax.x = Math.floor(this._bboxMax.x);
		this._bboxMax.y = Math.floor(this._bboxMax.y);

		// Rasterize.
		for (var x:number = this._bboxMin.x; x <= this._bboxMax.x; x++) {
			for (var y:number = this._bboxMin.y; y <= this._bboxMax.y; y++) {

				var screen:Vector3D = this._barycentric(p0, p1, p2, x, y);
				if (screen.x < 0 || screen.y < 0 || screen.z < 0)
					continue;

				var screenRight:Vector3D = this._barycentric(p0, p1, p2, x + 1, y);
				var screenBottom:Vector3D = this._barycentric(p0, p1, p2, x, y + 1);

				var clip:Vector3D = new Vector3D(screen.x/project.x, screen.y/project.y, screen.z/project.z);
				clip.scaleBy(1/(clip.x + clip.y + clip.z));

				var clipRight:Vector3D = new Vector3D(screenRight.x/project.x, screenRight.y/project.y, screenRight.z/project.z);
				clipRight.scaleBy(1/(clipRight.x + clipRight.y + clipRight.z));

				var clipBottom:Vector3D = new Vector3D(screenBottom.x/project.x, screenBottom.y/project.y, screenBottom.z/project.z);
				clipBottom.scaleBy(1/(clipBottom.x + clipBottom.y + clipBottom.z));

				var index:number = (x % this._backBufferWidth) + y*this._backBufferWidth;

				var fragDepth:number = depth.x*screen.x + depth.y*screen.y + depth.z*screen.z;

				if (!DepthCompareModeSoftware[this._depthCompareMode](fragDepth, this._zbuffer[index]))
					continue;

				var fragmentVO:ProgramVOSoftware = this._program.fragment(this, clip, clipRight, clipBottom, varying0, varying1, varying2, fragDepth);

				if (fragmentVO.discard)
					continue;

				if (this._writeDepth)
					this._zbuffer[index] = fragDepth;//todo: fragmentVO.outputDepth?

				//set source
				source[0] = fragmentVO.outputColor[0]*255;
				source[1] = fragmentVO.outputColor[1]*255;
				source[2] = fragmentVO.outputColor[2]*255;
				source[3] = fragmentVO.outputColor[3]*255;

				//set dest
				this._backBufferColor.getPixelData(x, y, dest);

				this._putPixel(x, y, source, dest);
			}
		}
	}

	private _barycentric(a:Vector3D, b:Vector3D, c:Vector3D, x:number, y:number):Vector3D
	{
		this._sx.x = c.x - a.x;
		this._sx.y = b.x - a.x;
		this._sx.z = a.x - x;
		
		this._sy.x = c.y - a.y;
		this._sy.y = b.y - a.y;
		this._sy.z = a.y - y;

		this._u = this._sx.crossProduct(this._sy, this._u);
		
		if (this._u.z < 0.01)
			return new Vector3D(1 - (this._u.x + this._u.y)/this._u.z, this._u.y/this._u.z, this._u.x/this._u.z);
		
		return new Vector3D(-1, 1, 1);
	}
}

export class BlendModeSoftware
{
	public static destinationAlpha(result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void
	{
		argb[0] += result[0]*dest[0]/0xFF;
		argb[1] += result[1]*dest[0]/0xFF;
		argb[2] += result[2]*dest[0]/0xFF;
		argb[3] += result[3]*dest[0]/0xFF;
	}


	public static destinationColor(result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void
	{
		argb[0] += result[0]*dest[0]/0xFF;
		argb[1] += result[1]*dest[1]/0xFF;
		argb[2] += result[2]*dest[2]/0xFF;
		argb[3] += result[3]*dest[3]/0xFF;
	}

	public static zero(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
	}

	public static one(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0];
		argb[1] += result[1];
		argb[2] += result[2];
		argb[3] += result[3];
	}

	public static oneMinusDestinationAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*(1 - dest[0]/0xFF);
		argb[1] += result[1]*(1 - dest[0]/0xFF);
		argb[2] += result[2]*(1 - dest[0]/0xFF);
		argb[3] += result[3]*(1 - dest[0]/0xFF);
	}

	public static oneMinusDestinationColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*(1 - dest[0]/0xFF);
		argb[1] += result[1]*(1 - dest[1]/0xFF);
		argb[2] += result[2]*(1 - dest[2]/0xFF);
		argb[3] += result[3]*(1 - dest[3]/0xFF);
	}

	public static oneMinusSourceAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*(1 - source[0]/0xFF);
		argb[1] += result[1]*(1 - source[0]/0xFF);
		argb[2] += result[2]*(1 - source[0]/0xFF);
		argb[3] += result[3]*(1 - source[0]/0xFF);
	}

	public static oneMinusSourceColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*(1 - source[0]/0xFF);
		argb[1] += result[1]*(1 - source[1]/0xFF);
		argb[2] += result[2]*(1 - source[2]/0xFF);
		argb[3] += result[3]*(1 - source[3]/0xFF);
	}

	public static sourceAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*source[0]/0xFF;
		argb[1] += result[1]*source[0]/0xFF;
		argb[2] += result[2]*source[0]/0xFF;
		argb[3] += result[3]*source[0]/0xFF;
	}

	public static sourceColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void
	{
		argb[0] += result[0]*source[0]/0xFF;
		argb[1] += result[1]*source[1]/0xFF;
		argb[2] += result[2]*source[2]/0xFF;
		argb[3] += result[3]*source[3]/0xFF;
	}
}


export class DepthCompareModeSoftware
{
	public static always(fragDepth:number, currentDepth:number):boolean
	{
		return true;
	}

	public static equal(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth == currentDepth;
	}

	public static greater(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth > currentDepth;
	}

	public static greaterEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth >= currentDepth;
	}

	public static less(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth < currentDepth;
	}

	public static lessEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth <= currentDepth;
	}

	public static never(fragDepth:number, currentDepth:number):boolean
	{
		return false;
	}

	public static notEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth != currentDepth;
	}
}

var argb:Uint8ClampedArray = new Uint8ClampedArray(4);
var source:Uint8ClampedArray = new Uint8ClampedArray(4);
var dest:Uint8ClampedArray = new Uint8ClampedArray(4);
