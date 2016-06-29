import { ITexture } from "../base/ITexture";
export declare class TextureSoftware implements ITexture {
    textureType: string;
    private _width;
    private _height;
    private _mipLevels;
    constructor(width: number, height: number);
    dispose(): void;
    readonly width: number;
    readonly height: number;
    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
    uploadFromData(imageData: ImageData, miplevel?: number): any;
    getData(miplevel: number): number[];
    getMipLevelsCount(): number;
}
