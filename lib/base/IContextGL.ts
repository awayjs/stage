import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");
import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");

import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");

interface IContextGL
{
	container:HTMLElement;

	clear(red?:number, green?:number, blue?:number, alpha?:number, depth?:number, stencil?:number, mask?:number);

	configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil?:boolean);

	createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels?:number):ICubeTexture;

	createIndexBuffer(numIndices:number):IIndexBuffer;

	createProgram():IProgram;

	createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels?:number):ITexture;

	createVertexBuffer(numVertices:number, dataPerVertex:number):IVertexBuffer;

	dispose();

	drawToBitmapImage2D(destination:BitmapImage2D);

	drawIndices(mode:string, indexBuffer:IIndexBuffer, firstIndex?:number, numIndices?:number);

	drawVertices(mode:string, firstVertex?:number, numVertices?:number);

	present();

	setBlendFactors(sourceFactor:string, destinationFactor:string);

	setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean);

    setStencilActions(triangleFace?:string, compareMode?:string, actionOnBothPass?:string, actionOnDepthFail?:string, actionOnDepthPassStencilFail?:string, coordinateSystem?:string);

    setStencilReferenceValue(referenceValue:number, readMask?:number, writeMask?:number);

	setCulling(triangleFaceToCull:string, coordinateSystem?:string);

	setDepthTest(depthMask:boolean, passCompareMode:string);

	setProgram(program:IProgram);

	setProgramConstantsFromMatrix(programType:number, firstRegister:number, matrix:Matrix3D, transposedMatrix?:boolean);

	setProgramConstantsFromArray(programType:number, firstRegister:number, data:Float32Array, numRegisters?:number);

	setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string);

	setScissorRectangle(rectangle:Rectangle);

	setTextureAt(sampler:number, texture:ITextureBase);

	setVertexBufferAt(index:number, buffer:IVertexBuffer, bufferOffset?:number, format?:number);

	setRenderToTexture(target:ITextureBase, enableDepthAndStencil?:boolean, antiAlias?:number, surfaceSelector?:number);

	setRenderToBackBuffer();
}

export = IContextGL;