import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { ICubeTexture } from "../base/ICubeTexture";
import { TextureBaseWebGL } from "../base/TextureBaseWebGL";
export declare class CubeTextureWebGL extends TextureBaseWebGL implements ICubeTexture {
    private _textureSelectorDictionary;
    textureType: string;
    private _texture;
    private _size;
    constructor(gl: WebGLRenderingContext, size: number);
    dispose(): void;
    uploadFromData(image: HTMLImageElement, side: number, miplevel?: number): any;
    uploadFromData(imageData: ImageData, side: number, miplevel?: number): any;
    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
    readonly size: number;
    readonly glTexture: WebGLTexture;
}
