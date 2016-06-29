import { AssetEvent } from "@awayjs/core/lib/events/AssetEvent";
import { GL_Image2D } from "../image/GL_Image2D";
/**
 *
 * @class away.pool.ImageObjectBase
 */
export declare class GL_BitmapImage2D extends GL_Image2D {
    private _mipmapData;
    activate(index: number, mipmap: boolean): void;
    /**
     *
     */
    onClear(event: AssetEvent): void;
}
