import { ContextStage3D } from "../base/ContextStage3D";
import { ITexture } from "../base/ITexture";
import { ResourceBaseFlash } from "../base/ResourceBaseFlash";
export declare class TextureFlash extends ResourceBaseFlash implements ITexture {
    private _context;
    private _width;
    private _height;
    readonly width: number;
    readonly height: number;
    constructor(context: ContextStage3D, width: number, height: number, format: string, forRTT: boolean, streaming?: boolean);
    dispose(): void;
    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
    uploadFromData(imageData: ImageData, miplevel?: number): any;
}
