import { BitmapImage2D } from "@awayjs/core/lib/image/BitmapImage2D";
import { AssetEvent } from "@awayjs/core/lib/events/AssetEvent";
import { GL_ImageCube } from "../image/GL_ImageCube";
/**
 *
 * @class away.pool.ImageObjectBase
 */
export declare class GL_BitmapImageCube extends GL_ImageCube {
    _mipmapDataArray: Array<Array<BitmapImage2D>>;
    activate(index: number, mipmap: boolean): void;
    /**
     *
     */
    onClear(event: AssetEvent): void;
}
