import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import ITexture						= require("awayjs-stagegl/lib/base/ITexture");
import TextureBaseWebGL				= require("awayjs-stagegl/lib/base/TextureBaseWebGL");

class TextureSoftware implements ITexture
{
    public textureType:string = "texture2d";

    private _width:number;
    private _height:number;
    private _data:Uint8Array;
    private _mipLevel:number;

    constructor(width:number, height:number)
    {
        this._width = width;
        this._height = height;
    }

    public dispose()
    {
        this._data = null;
    }

    public get width():number
    {
        return this._width;
    }

    public get height():number
    {
        return this._height;
    }

    public uploadFromData(image:HTMLImageElement, miplevel?:number);
    public uploadFromData(imageData:ImageData, miplevel?:number);
    public uploadFromData(data:any, miplevel:number = 0)
    {
        if(miplevel == 0) {
            console.log("uploadFromData: "+data+" miplevel: "+miplevel);
            this._data = new Uint8Array(data.data);
            this._mipLevel = miplevel;
        }
    }


    public get data():Uint32Array {
        return this._data;
    }
}

export = TextureSoftware;