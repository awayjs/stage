///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import Stage							= away.base.Stage;
	import Camera							= away.entities.Camera;
	import Matrix3D							= away.geom.Matrix3D;
	import Rectangle						= away.geom.Rectangle;
	import IndexData						= away.pool.IndexData;
	import RenderableBase					= away.pool.RenderableBase;
	import ShaderObjectData					= away.pool.ShaderObjectData;
	import VertexData						= away.pool.VertexData;
	import MaterialBase						= away.materials.MaterialBase;
	import MaterialPassVO					= away.materials.MaterialPassVO;
	import CubeTextureBase					= away.textures.CubeTextureBase;
	import RenderTexture					= away.textures.RenderTexture;
	import Texture2DBase					= away.textures.Texture2DBase;
	import TextureProxyBase					= away.textures.TextureProxyBase;


	export interface IContextStageGL extends away.display.IContext
	{
		setRenderTarget(target:TextureProxyBase, enableDepthAndStencil?:boolean, surfaceSelector?:number);

		getRenderTexture(textureProxy:RenderTexture):ITextureBase;

		activateBuffer(index:number, buffer:VertexData, offset:number, format:string);

		disposeVertexData(buffer:VertexData);

		activateShaderObject(shaderObject:ShaderObjectData, stage:Stage, camera:Camera);

		activateRenderTexture(index:number, textureProxy:RenderTexture);

		activateTexture(index:number, textureProxy:Texture2DBase);

		activateCubeTexture(index:number, textureProxy:CubeTextureBase);

		getIndexBuffer(buffer:IndexData):IIndexBuffer;

		getShaderObject(materialPassVO:MaterialPassVO, profile:string):ShaderObjectData;

		getRenderOrderId(material:MaterialBase, profile:string):number;

		disposeIndexData(buffer:IndexData);

		clear(red?:number, green?:number, blue?:number, alpha?:number, depth?:number, stencil?:number, mask?:number);

		configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil?:boolean);

		createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels?:number):ICubeTexture;

		createIndexBuffer(numIndices:number):IIndexBuffer;

		createProgram():IProgram;

		createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels?:number):ITexture;

		createVertexBuffer(numVertices:number, data32PerVertex:number):IVertexBuffer;

		deactivateShaderObject(shaderObject:ShaderObjectData, stage:Stage);

		dispose();

		drawToBitmapData(destination:away.base.BitmapData);

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
}