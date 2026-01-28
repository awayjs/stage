import { IAsset } from "@awayjs/core";
import { ImageBase } from "./ImageBase";

export interface IImageOwner extends IAsset {
	onImageInvalidate(image: ImageBase): void;
	onImageClear(image: ImageBase): void;
}
