import BitmapData					= require("awayjs-core/lib/base/BitmapData");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");
import CubeTextureBase				= require("awayjs-core/lib/textures/CubeTextureBase");
import RenderTexture				= require("awayjs-core/lib/textures/RenderTexture");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");

import Camera						= require("awayjs-display/lib/entities/Camera");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IndexData					= require("awayjs-stagegl/lib/pool/IndexData");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import VertexData					= require("awayjs-stagegl/lib/pool/VertexData");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");

interface IContextStageGL
{
	getProgramData(key:string):ProgramData;

	setRenderTarget(target:TextureProxyBase, enableDepthAndStencil?:boolean, surfaceSelector?:number);

	getRenderTexture(textureProxy:RenderTexture):ITextureBase;

	activateBuffer(index:number, buffer:VertexData, offset:number, format:string);

	disposeVertexData(buffer:VertexData);

	activateRenderTexture(index:number, textureProxy:RenderTexture);

	activateTexture(index:number, textureProxy:Texture2DBase);

	activateCubeTexture(index:number, textureProxy:CubeTextureBase);

	getIndexBuffer(buffer:IndexData):IIndexBuffer;

	disposeIndexData(buffer:IndexData);

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

export = IContextStageGL;