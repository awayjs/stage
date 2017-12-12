import {ICubeTexture} from "../base/ICubeTexture";

import {TextureBaseWebGL} from "./TextureBaseWebGL";

export class CubeTextureWebGL extends TextureBaseWebGL implements ICubeTexture
{

	private _textureSelectorDictionary:Array<number> = new Array<number>(6);

	public textureType:string = "textureCube";
	private _size:number;

	constructor(gl:WebGLRenderingContext, size:number)
	{
		super(gl);
		this._size = size;
		this._glTexture = this._gl.createTexture();

		this._textureSelectorDictionary[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		this._textureSelectorDictionary[1] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
		this._textureSelectorDictionary[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
		this._textureSelectorDictionary[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
		this._textureSelectorDictionary[4] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
		this._textureSelectorDictionary[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
	}

	public uploadFromArray(array:Uint8Array | Array<number>, side:number, miplevel:number = 0):void
	{
        if (array.length != this._size*this._size*4)
            throw new Error("Array is not the correct length for texture dimensions");

        if (array instanceof Array)
            array = new Uint8Array(array);

		this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._glTexture);
        this._gl.texImage2D(this._textureSelectorDictionary[side], miplevel, this._gl.RGBA, this._size, this._size, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, array);
		this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
	}

	public uploadCompressedTextureFromArray(array:Uint8Array, offset:number /*uint*/, async:boolean = false):void
	{

	}

	public get size():number
	{
		return this._size;
	}

	public generateMipmaps():void
	{
		this._gl.bindTexture( this._gl.TEXTURE_CUBE_MAP, this._glTexture );
		this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
		//this._gl.bindTexture( this._gl.TEXTURE_CUBE_MAP, null );
	}
}