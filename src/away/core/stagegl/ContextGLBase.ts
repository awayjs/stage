///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import AbstractMethodError				= away.errors.AbstractMethodError;
	import Matrix3D							= away.geom.Matrix3D;
	import Rectangle						= away.geom.Rectangle;
	import IndexData						= away.pool.IndexData;
	import TextureData						= away.pool.TextureData;
	import TextureDataPool					= away.pool.TextureDataPool;
	import VertexData						= away.pool.VertexData;
	import CubeTextureBase					= away.textures.CubeTextureBase;
	import RenderTexture					= away.textures.RenderTexture;
	import Texture2DBase					= away.textures.Texture2DBase;
	import TextureProxyBase					= away.textures.TextureProxyBase;

	/**
	 * Stage provides a proxy class to handle the creation and attachment of the Context
	 * (and in turn the back buffer) it uses. Stage should never be created directly,
	 * but requested through StageManager.
	 *
	 * @see away.managers.StageManager
	 *
	 */
	export class ContextGLBase implements away.display.IContext
	{
		public _pContainer:HTMLElement;

		private _texturePool:TextureDataPool;

		private _width:number;
		private _height:number;

		//private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame

		public _iStageIndex:number = -1;
		private _antiAlias:number = 0;
		private _enableDepthAndStencil:boolean;
		private _renderTarget:TextureProxyBase = null;
		private _renderSurfaceSelector:number = 0;

		public get container():HTMLElement
		{
			return this._pContainer;
		}

		constructor()
		{
			this._texturePool = new TextureDataPool(this);
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
			var textureData:TextureData = <TextureData> this._texturePool.getItem(textureProxy);

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
			if (!buffer.contexts[this._iStageIndex])
				buffer.contexts[this._iStageIndex] = this;

			if (!buffer.buffers[this._iStageIndex]) {
				buffer.buffers[this._iStageIndex] = this.createVertexBuffer(buffer.data.length/buffer.dataPerVertex, buffer.dataPerVertex);
				buffer.invalid[this._iStageIndex] = true;
			}

			if (buffer.invalid[this._iStageIndex]) {
				buffer.buffers[this._iStageIndex].uploadFromArray(buffer.data, 0, buffer.data.length/buffer.dataPerVertex);
				buffer.invalid[this._iStageIndex] = false;
			}

			this.setVertexBufferAt(index, buffer.buffers[this._iStageIndex], offset, format);
		}

		public disposeVertexData(buffer:VertexData)
		{
			buffer.buffers[this._iStageIndex].dispose();
			buffer.buffers[this._iStageIndex] = null;
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
					var mipmapData:Array<away.base.BitmapData> = textureProxy._iGetMipmapData();
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
						var mipmapData:Array<away.base.BitmapData> = textureProxy._iGetMipmapData(i);
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
			if (!buffer.contexts[this._iStageIndex])
				buffer.contexts[this._iStageIndex] = this;

			if (!buffer.buffers[this._iStageIndex]) {
				buffer.buffers[this._iStageIndex] = this.createIndexBuffer(buffer.data.length);
				buffer.invalid[this._iStageIndex] = true;
			}

			if (buffer.invalid[this._iStageIndex]) {
				buffer.buffers[this._iStageIndex].uploadFromArray(buffer.data, 0, buffer.data.length);
				buffer.invalid[this._iStageIndex] = false;
			}

			return buffer.buffers[this._iStageIndex];
		}

		public disposeIndexData(buffer:IndexData)
		{
			buffer.buffers[this._iStageIndex].dispose();
			buffer.buffers[this._iStageIndex] = null;
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

		public setScissorRectangle(rectangle:away.geom.Rectangle)
		{

		}

		public setTextureAt(sampler:number, texture:ITextureBase)
		{

		}

		public setVertexBufferAt(index:number, buffer:IVertexBuffer, bufferOffset:number = 0, format:string = null)
		{

		}
	}
}