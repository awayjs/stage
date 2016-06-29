import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { ContextStage3D } from "../base/ContextStage3D";
import { ICubeTexture } from "../base/ICubeTexture";
import { ResourceBaseFlash } from "../base/ResourceBaseFlash";
export declare class CubeTextureFlash extends ResourceBaseFlash implements ICubeTexture {
    private _context;
    private _size;
    readonly size: number;
    constructor(context: ContextStage3D, size: number, format: string, forRTT: boolean, streaming?: boolean);
    dispose(): void;
    uploadFromData(image: HTMLImageElement, side: number, miplevel?: number): any;
    uploadFromData(imageData: ImageData, side: number, miplevel?: number): any;
    uploadCompressedTextureFromByteArray(data: ByteArray, byteArrayOffset: number, async?: boolean): void;
}
