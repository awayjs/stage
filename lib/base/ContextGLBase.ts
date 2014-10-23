import BitmapData					= require("awayjs-core/lib/base/BitmapData");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");
import AbstractMethodError			= require("awayjs-core/lib/errors/AbstractMethodError");
import CubeTextureBase				= require("awayjs-core/lib/textures/CubeTextureBase");
import RenderTexture				= require("awayjs-core/lib/textures/RenderTexture");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");
import TextureProxyBase				= require("awayjs-core/lib/textures/TextureProxyBase");
import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import IMaterialOwner				= require("awayjs-display/lib/base/IMaterialOwner");
import IContext						= require("awayjs-display/lib/display/IContext");
import Camera						= require("awayjs-display/lib/entities/Camera");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import AGALMiniAssembler			= require("awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler");
import AnimatorBase					= require("awayjs-stagegl/lib/animators/AnimatorBase");
import AnimationSetBase				= require("awayjs-stagegl/lib/animators/AnimationSetBase");
import IndexData					= require("awayjs-stagegl/lib/pool/IndexData");
import MaterialPassData				= require("awayjs-stagegl/lib/pool/MaterialPassData");
import MaterialPassDataPool			= require("awayjs-stagegl/lib/pool/MaterialPassDataPool");
import TextureData					= require("awayjs-stagegl/lib/pool/TextureData");
import TextureDataPool				= require("awayjs-stagegl/lib/pool/TextureDataPool");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import ProgramDataPool				= require("awayjs-stagegl/lib/pool/ProgramDataPool");
import RenderableBase				= require("awayjs-stagegl/lib/pool/RenderableBase");
import MaterialData					= require("awayjs-stagegl/lib/pool/MaterialData");
import MaterialDataPool				= require("awayjs-stagegl/lib/pool/MaterialDataPool");
import VertexData					= require("awayjs-stagegl/lib/pool/VertexData");
import ContextGLClearMask			= require("awayjs-stagegl/lib/base/ContextGLClearMask");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");
import StageGLMaterialBase			= require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
import ShaderObjectBase				= require("awayjs-stagegl/lib/materials/compilation/ShaderObjectBase");

/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
class ContextGLBase implements IContext
{
	private _programData:Array<ProgramData> = new Array<ProgramData>();
	private _numUsedStreams:number = 0;
	private _numUsedTextures:number = 0;

	public _pContainer:HTMLElement;

	private _texturePool:TextureDataPool;

	private _materialDataPool:MaterialDataPool;

	private _programDataPool:ProgramDataPool;

	private _width:number;
	private _height:number;

	//private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame

	private _stageIndex:number = -1;
	private _antiAlias:number = 0;
	private _enableDepthAndStencil:boolean;
	private _renderTarget:TextureProxyBase = null;
	private _renderSurfaceSelector:number = 0;

	public get container():HTMLElement
	{
		return this._pContainer;
	}

	constructor(stageIndex:number)
	{
		this._stageIndex = stageIndex;
		this._texturePool = new TextureDataPool(this);
		this._materialDataPool = new MaterialDataPool(this);
		this._programDataPool = new ProgramDataPool(this);
	}

	public setRenderTarget(target:TextureProxyBase, enableDepthAndStencil:boolean = false, surfaceSelector:number = 0)
	{
		if (this._renderTarget === target && surfaceSelector == this._renderSurfaceSelector && this._enableDepthAndStencil == enableDepthAndStencil)
			return;

		this._renderTarget = target;
		this._renderSurfaceSelector = surfaceSelector;
		this._enableDepthAndStencil = enableDepthAndStencil;
		if (target instanceof RenderTexture) {
			this.setRenderToTexture(this.getRenderTexture(<RenderTexture> target), enableDepthAndStencil, this._antiAlias, surfaceSelector);
		} else {
			this.setRenderToBackBuffer();
			this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
		}
	}

	public getRenderTexture(textureProxy:RenderTexture):ITextureBase
	{
		var textureData:TextureData = this._texturePool.getItem(textureProxy);

		if (!textureData.texture)
			textureData.texture = this.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);

		return textureData.texture;
	}

	public getProgram(materialPassData:MaterialPassData):ProgramData
	{
		//check key doesn't need re-concatenating
		if (!materialPassData.key.length) {
			materialPassData.key = materialPassData.animationVertexCode +
				materialPassData.vertexCode +
				"---" +
				materialPassData.fragmentCode +
				materialPassData.animationFragmentCode +
				materialPassData.postAnimationFragmentCode;
		} else {
			return materialPassData.programData;
		}

		var programData:ProgramData = this._programDataPool.getItem(materialPassData.key);

		//check program data hasn't changed, keep count of program usages
		if (materialPassData.programData != programData) {
			if (materialPassData.programData)
				materialPassData.programData.dispose();

			materialPassData.programData = programData;

			programData.usages++;
		}

		return programData;
	}

	/**
	 *
	 * @param material
	 */
	public getMaterial(material:StageGLMaterialBase, profile:string):MaterialData
	{
		var materialData:MaterialData = this._materialDataPool.getItem(material);

		if (materialData.invalidAnimation) {
			materialData.invalidAnimation = false;

			var materialDataPasses:Array<MaterialPassData> = materialData.getMaterialPasses(profile);

			var enabledGPUAnimation:boolean = this.getEnabledGPUAnimation(material, materialDataPasses);

			var renderOrderId = 0;
			var mult:number = 1;
			var materialPassData:MaterialPassData;
			var len:number = materialDataPasses.length;
			for (var i:number = 0; i < len; i++) {
				materialPassData = materialDataPasses[i];

				if (materialPassData.usesAnimation != enabledGPUAnimation) {
					materialPassData.usesAnimation = enabledGPUAnimation;
					materialPassData.key == "";
				}

				if (materialPassData.key == "")
					this.calcAnimationCode(material, materialPassData);

				renderOrderId += this.getProgram(materialPassData).id*mult;
				mult *= 1000;
			}

			materialData.renderOrderId = renderOrderId;
		}

		return materialData;
	}

	/**
	 * Assigns an attribute stream
	 *
	 * @param index The attribute stream index for the vertex shader
	 * @param buffer
	 * @param offset
	 * @param stride
	 * @param format
	 */
	public activateBuffer(index:number, buffer:VertexData, offset:number, format:string)
	{
		if (!buffer.contexts[this._stageIndex])
			buffer.contexts[this._stageIndex] = this;

		if (!buffer.buffers[this._stageIndex]) {
			buffer.buffers[this._stageIndex] = this.createVertexBuffer(buffer.data.length/buffer.dataPerVertex, buffer.dataPerVertex);
			buffer.invalid[this._stageIndex] = true;
		}

		if (buffer.invalid[this._stageIndex]) {
			buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length/buffer.dataPerVertex);
			buffer.invalid[this._stageIndex] = false;
		}

		this.setVertexBufferAt(index, buffer.buffers[this._stageIndex], offset, format);
	}

	public disposeVertexData(buffer:VertexData)
	{
		buffer.buffers[this._stageIndex].dispose();
		buffer.buffers[this._stageIndex] = null;
	}

	public activateRenderTexture(index:number, textureProxy:RenderTexture)
	{
		this.setTextureAt(index, this.getRenderTexture(textureProxy));
	}

	public activateMaterialPass(materialPassData:MaterialPassData, stage:Stage, camera:Camera)
	{
		var shaderObject:ShaderObjectBase = materialPassData.shaderObject;

		//clear unused vertex streams
		for (var i = shaderObject.numUsedStreams; i < this._numUsedStreams; i++)
			this.setVertexBufferAt(i, null);

		//clear unused texture streams
		for (var i = shaderObject.numUsedTextures; i < this._numUsedTextures; i++)
			this.setTextureAt(i, null);

		if (materialPassData.usesAnimation)
			(<AnimationSetBase> materialPassData.material.animationSet).activate(shaderObject, stage);

		//activate shader object
		shaderObject.iActivate(stage, camera);

		//check program data is uploaded
		var programData:ProgramData = this.getProgram(materialPassData);

		if (!programData.program) {
			programData.program = this.createProgram();
			var vertexByteCode:ByteArray = (new AGALMiniAssembler().assemble("part vertex 1\n" + materialPassData.animationVertexCode + materialPassData.vertexCode + "endpart"))['vertex'].data;
			var fragmentByteCode:ByteArray = (new AGALMiniAssembler().assemble("part fragment 1\n" + materialPassData.fragmentCode + materialPassData.animationFragmentCode + materialPassData.postAnimationFragmentCode + "endpart"))['fragment'].data;
			programData.program.upload(vertexByteCode, fragmentByteCode);
		}

		//set program data
		this.setProgram(programData.program);
	}

	public deactivateMaterialPass(materialPassData:MaterialPassData, stage:Stage)
	{
		var shaderObject:ShaderObjectBase = materialPassData.shaderObject;

		if (materialPassData.usesAnimation)
			(<AnimationSetBase> materialPassData.material.animationSet).deactivate(shaderObject, stage);

		materialPassData.shaderObject.iDeactivate(stage);

		this._numUsedStreams = shaderObject.numUsedStreams;
		this._numUsedTextures = shaderObject.numUsedTextures;
	}

	public activateTexture(index:number, textureProxy:Texture2DBase)
	{
		var textureData:TextureData = <TextureData> this._texturePool.getItem(textureProxy);

		if (!textureData.texture) {
			textureData.texture = this.createTexture(textureProxy.width, textureProxy.height, ContextGLTextureFormat.BGRA, true);
			textureData.invalid = true;
		}

		if (textureData.invalid) {
			textureData.invalid = false;
			if (textureProxy.generateMipmaps) {
				var mipmapData:Array<BitmapData> = textureProxy._iGetMipmapData();
				var len:number = mipmapData.length;
				for (var i:number = 0; i < len; i++)
					(<ITexture> textureData.texture).uploadFromData(mipmapData[i], i);
			} else {
				(<ITexture> textureData.texture).uploadFromData(textureProxy._iGetTextureData(), 0);
			}
		}

		this.setTextureAt(index, textureData.texture);
	}

	public activateCubeTexture(index:number, textureProxy:CubeTextureBase)
	{
		var textureData:TextureData = <TextureData> this._texturePool.getItem(textureProxy);

		if (!textureData.texture) {
			textureData.texture = this.createCubeTexture(textureProxy.size, ContextGLTextureFormat.BGRA, false);
			textureData.invalid = true;
		}

		if (textureData.invalid) {
			textureData.invalid = false;
			for (var i:number = 0; i < 6; ++i) {
				if (textureProxy.generateMipmaps) {
					var mipmapData:Array<BitmapData> = textureProxy._iGetMipmapData(i);
					var len:number = mipmapData.length;
					for (var j:number = 0; j < len; j++)
						(<ICubeTexture> textureData.texture).uploadFromData(mipmapData[j], i, j);
				} else {
					(<ICubeTexture> textureData.texture).uploadFromData(textureProxy._iGetTextureData(i), i, 0);
				}
			}
		}

		this.setTextureAt(index, textureData.texture);
	}

	/**
	 * Retrieves the VertexBuffer object that contains triangle indices.
	 * @param context The ContextWeb for which we request the buffer
	 * @return The VertexBuffer object that contains triangle indices.
	 */
	public getIndexBuffer(buffer:IndexData):IIndexBuffer
	{
		if (!buffer.contexts[this._stageIndex])
			buffer.contexts[this._stageIndex] = this;

		if (!buffer.buffers[this._stageIndex]) {
			buffer.buffers[this._stageIndex] = this.createIndexBuffer(buffer.data.length);
			buffer.invalid[this._stageIndex] = true;
		}

		if (buffer.invalid[this._stageIndex]) {
			buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length);
			buffer.invalid[this._stageIndex] = false;
		}

		return buffer.buffers[this._stageIndex];
	}

	public disposeIndexData(buffer:IndexData)
	{
		buffer.buffers[this._stageIndex].dispose();
		buffer.buffers[this._stageIndex] = null;
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL)
	{

	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true)
	{
		this._width = width;
		this._height = height;
	}

	public createIndexBuffer(numIndices:number):IIndexBuffer
	{
		throw new AbstractMethodError();
	}

	public createVertexBuffer(numVertices:number, data32PerVertex:number):IVertexBuffer
	{
		throw new AbstractMethodError();
	}

	public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):ITexture
	{
		throw new AbstractMethodError();
	}

	public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):ICubeTexture
	{
		throw new AbstractMethodError();
	}

	public createProgram():IProgram
	{
		throw new AbstractMethodError();
	}

	public dispose()
	{

	}

	public present()
	{

	}

	public setRenderToTexture(target:ITextureBase, enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0)
	{

	}

	public setRenderToBackBuffer()
	{

	}

	public setScissorRectangle(rectangle:Rectangle)
	{

	}

	public setTextureAt(sampler:number, texture:ITextureBase)
	{

	}

	public setVertexBufferAt(index:number, buffer:IVertexBuffer, bufferOffset:number = 0, format:string = null)
	{

	}

	public setProgram(program:IProgram)
	{

	}

	public registerProgram(programData:ProgramData)
	{
		var i:number = 0;
		while (this._programData[i] != null)
			i++;

		this._programData[i] = programData;
		programData.id = i;
	}

	public unRegisterProgram(programData:ProgramData)
	{
		this._programData[programData.id] = null;
		programData.id = -1;
	}


	/**
	 * test if animation will be able to run on gpu BEFORE compiling materials
	 * test if the shader objects supports animating the animation set in the vertex shader
	 * if any object using this material fails to support accelerated animations for any of the shader objects,
	 * we should do everything on cpu (otherwise we have the cost of both gpu + cpu animations)
	 */
	private getEnabledGPUAnimation(material:StageGLMaterialBase, materialDataPasses:Array<MaterialPassData>):boolean
	{
		if (material.animationSet) {
			material.animationSet.resetGPUCompatibility();

			var owners:Array<IMaterialOwner> = material.iOwners;
			var numOwners:number = owners.length;

			var len:number = materialDataPasses.length;
			for (var i:number = 0; i < len; i++)
				for (var j:number = 0; j < numOwners; j++)
					if (owners[j].animator)
						(<AnimatorBase> owners[j].animator).testGPUCompatibility(materialDataPasses[i].shaderObject);

			return !material.animationSet.usesCPU;
		}

		return false;
	}

	public calcAnimationCode(material:StageGLMaterialBase, materialPassData:MaterialPassData)
	{
		//reset key so that the program is re-calculated
		materialPassData.key = "";
		materialPassData.animationVertexCode = "";
		materialPassData.animationFragmentCode = "";

		var shaderObject:ShaderObjectBase = materialPassData.shaderObject;

		//check to see if GPU animation is used
		if (materialPassData.usesAnimation) {

			var animationSet:AnimationSetBase = <AnimationSetBase> material.animationSet;

			materialPassData.animationVertexCode += animationSet.getAGALVertexCode(shaderObject);

			if (shaderObject.uvDependencies > 0 && !shaderObject.usesUVTransform)
				materialPassData.animationVertexCode += animationSet.getAGALUVCode(shaderObject);

			if (shaderObject.usesFragmentAnimation)
				materialPassData.animationFragmentCode += animationSet.getAGALFragmentCode(shaderObject, materialPassData.shadedTarget);

			animationSet.doneAGALCode(shaderObject);

		} else {
			// simply write attributes to targets, do not animate them
			// projection will pick up on targets[0] to do the projection
			var len:number = shaderObject.animatableAttributes.length;
			for (var i:number = 0; i < len; ++i)
				materialPassData.animationVertexCode += "mov " + shaderObject.animationTargetRegisters[i] + ", " + shaderObject.animatableAttributes[i] + "\n";

			if (shaderObject.uvDependencies > 0 && !shaderObject.usesUVTransform)
				materialPassData.animationVertexCode += "mov " + shaderObject.uvTarget + "," + shaderObject.uvSource + "\n";
		}
	}
}

export = ContextGLBase;