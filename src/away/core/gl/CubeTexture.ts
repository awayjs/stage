///<reference path="../../_definitions.ts"/>

module away.gl
{
	export class CubeTexture extends TextureBase
	{

		private _textureSelectorDictionary:Array<number> = new Array<number>(6);

		public textureType:string = "textureCube";
		private _texture:WebGLTexture;
		private _size:number;

		constructor(gl:WebGLRenderingContext, size:number)
		{
			super(gl);
			this._size = size;
			this._texture = this._gl.createTexture();

			this._textureSelectorDictionary[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
			this._textureSelectorDictionary[1] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
			this._textureSelectorDictionary[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
			this._textureSelectorDictionary[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
			this._textureSelectorDictionary[4] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
			this._textureSelectorDictionary[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
		}

		public dispose()
		{
			this._gl.deleteTexture(this._texture);
		}

		public uploadFromData(bitmapData:away.base.BitmapData, side:number, miplevel?:number);
		public uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
		public uploadFromData(data:any, side:number, miplevel:number = 0)
		{
			if (data instanceof away.base.BitmapData)
				data = (<away.base.BitmapData> data).imageData;

			this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._texture);
			this._gl.texImage2D(this._textureSelectorDictionary[side], miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
			this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
		}

		public uploadCompressedTextureFromByteArray(data:away.utils.ByteArray, byteArrayOffset:number /*uint*/, async:boolean = false)
		{

		}

		public get size():number
		{
			return this._size;
		}

		public get glTexture():WebGLTexture
		{
			return this._texture;
		}
	}
}