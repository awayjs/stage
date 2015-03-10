import BitmapData					= require("awayjs-core/lib/data/BitmapData");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");

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

	createVertexBuffer(numVertices:number, data32PerVertex:number):IVertexBuffer;

	dispose();

	drawToBitmapData(destination:BitmapData);

	drawTriangles(indexBuffer:IIndexBuffer, firstIndex?:number, numTriangles?:number);

	present();

	setBlendFactors(sourceFactor:string, destinationFactor:string);

	setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean);

	setCulling(triangleFaceToCull:string, coordinateSystem?:string);

	setDepthTest(depthMask:boolean, passCompareMode:string);

	setProgram(program:IProgram);

	setProgramConstantsFromMatrix(programType:string, firstRegister:number, matrix:Matrix3D, transposedMatrix?:boolean);

	setProgramConstantsFromArray(programType:string, firstRegister:number, data:number[], numRegisters?:number);

	setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string);

	setScissorRectangle(rectangle:Rectangle);

	setTextureAt(sampler:number, texture:ITextureBase);

	setVertexBufferAt(index:number, buffer:IVertexBuffer, bufferOffset?:number, format?:string);

	setRenderToTexture(target:ITextureBase, enableDepthAndStencil?:boolean, antiAlias?:number, surfaceSelector?:number);

	setRenderToBackBuffer();
}

export = IContextGL;