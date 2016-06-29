import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { ITexture } from "../base/ITexture";
import { TextureBaseWebGL } from "../base/TextureBaseWebGL";
export declare class TextureWebGL extends TextureBaseWebGL implements ITexture {
    textureType: string;
    private _width;
    private _height;
    private _frameBuffer;
    private _glTexture;
    constructor(gl: WebGLRenderingContext, width: number, height: number);
    dispose(): void;
    readonly width: number;
    readonly height: number;
    readonly frameBuffer: WebGLFramebuffer;
    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
    uploadFromData(imageData: ImageData, miplevel?: number): any;
    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
    readonly glTexture: WebGLTexture;
    generateMipmaps(): void;
}
