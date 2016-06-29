import { ITextureBase } from "../base/ITextureBase";
export interface ITexture extends ITextureBase {
    width: number;
    height: number;
    uploadFromData(image: HTMLImageElement, miplevel?: number): any;
    uploadFromData(imageData: ImageData, miplevel?: number): any;
}
