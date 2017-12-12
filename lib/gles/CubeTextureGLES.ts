import {ByteArray} from "@awayjs/core";

import {ICubeTexture} from "../base/ICubeTexture";

import {TextureBaseGLES} from "./TextureBaseGLES";
import {ContextGLES} from "./ContextGLES";

export class CubeTextureGLES extends TextureBaseGLES implements ICubeTexture
{

	private _textureSelectorDictionary:Array<number> = new Array<number>(6);

	public textureType:string = "textureCube";
	private _size:number;

	constructor(context:ContextGLES, gl:WebGLRenderingContext, size:number, id:number)
	{
		super(context, gl, id);
		this._size = size;
		//todo
		// this._glTexture = this._gl.createTexture();
		//
		// this._textureSelectorDictionary[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
		// this._textureSelectorDictionary[1] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
		// this._textureSelectorDictionary[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
		// this._textureSelectorDictionary[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
		// this._textureSelectorDictionary[4] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
		// this._textureSelectorDictionary[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
	}

	public uploadFromArray(array:Uint8Array | Array<number>, side:number, miplevel:number = 0):void
	{
        if (array.length != this._size*this._size*4)
            throw new Error("Array is not the correct length for texture dimensions");

        if (array instanceof Array)
            array = new Uint8Array(array);

		//todo
		// this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._glTexture);
		// this._gl.texImage2D(this._textureSelectorDictionary[side], miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
		// this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
	}

	public uploadCompressedTextureFromArray(array:Uint8Array, offset:number /*uint*/, async:boolean = false):void
	{
		//todo

	}

	public get size():number
	{
		return this._size;
	}
}