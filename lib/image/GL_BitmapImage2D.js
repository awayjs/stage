"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MipmapGenerator_1 = require("@awayjs/core/lib/utils/MipmapGenerator");
var GL_Image2D_1 = require("../image/GL_Image2D");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_BitmapImage2D = (function (_super) {
    __extends(GL_BitmapImage2D, _super);
    function GL_BitmapImage2D() {
        _super.apply(this, arguments);
    }
    GL_BitmapImage2D.prototype.activate = function (index, mipmap) {
        if (mipmap && this._stage.globalDisableMipmap)
            mipmap = false;
        if (!this._texture) {
            this._createTexture();
            this._invalid = true;
        }
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        if (this._invalid) {
            this._invalid = false;
            if (mipmap) {
                var mipmapData = this._mipmapData || (this._mipmapData = new Array());
                MipmapGenerator_1.MipmapGenerator._generateMipMaps(this._asset.getCanvas(), mipmapData, true);
                var len = mipmapData.length;
                for (var i = 0; i < len; i++)
                    this._texture.uploadFromData(mipmapData[i].getImageData(), i);
            }
            else {
                this._texture.uploadFromData(this._asset.getImageData(), 0);
            }
        }
        _super.prototype.activate.call(this, index, mipmap);
    };
    /**
     *
     */
    GL_BitmapImage2D.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        if (this._mipmapData) {
            var len = this._mipmapData.length;
            for (var i = 0; i < len; i++)
                MipmapGenerator_1.MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
        }
    };
    return GL_BitmapImage2D;
}(GL_Image2D_1.GL_Image2D));
exports.GL_BitmapImage2D = GL_BitmapImage2D;
