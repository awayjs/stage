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
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import IndexData					= require("awayjs-stagegl/lib/pool/IndexData");
import TextureData					= require("awayjs-stagegl/lib/pool/TextureData");
import TextureDataPool				= require("awayjs-stagegl/lib/pool/TextureDataPool");
import ProgramData					= require("awayjs-stagegl/lib/pool/ProgramData");
import ProgramDataPool				= require("awayjs-stagegl/lib/pool/ProgramDataPool");
import VertexData					= require("awayjs-stagegl/lib/pool/VertexData");
import ContextGLClearMask			= require("awayjs-stagegl/lib/base/ContextGLClearMask");
import ContextGLTextureFormat		= require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
import ICubeTexture					= require("awayjs-stagegl/lib/base/ICubeTexture");
import IIndexBuffer					= require("awayjs-stagegl/lib/base/IIndexBuffer");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import ITextureBase					= require("awayjs-stagegl/lib/base/ITextureBase");
import IVertexBuffer				= require("awayjs-stagegl/lib/base/IVertexBuffer");

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

	public _pContainer:HTMLElement;

	private _texturePool:TextureDataPool;

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
		this._programDataPool = new ProgramDataPool(this);
	}

	public getProgramData(key:string):ProgramData
	{
		return this._programDataPool.getItem(key);
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
}

export = ContextGLBase;