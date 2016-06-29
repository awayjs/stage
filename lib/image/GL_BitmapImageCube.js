"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MipmapGenerator_1 = require("@awayjs/core/lib/utils/MipmapGenerator");
var GL_ImageCube_1 = require("../image/GL_ImageCube");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_BitmapImageCube = (function (_super) {
    __extends(GL_BitmapImageCube, _super);
    function GL_BitmapImageCube() {
        _super.apply(this, arguments);
        this._mipmapDataArray = new Array(6);
    }
    GL_BitmapImageCube.prototype.activate = function (index, mipmap) {
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
            for (var i = 0; i < 6; ++i) {
                if (mipmap) {
                    var mipmapData = this._mipmapDataArray[i] || (this._mipmapDataArray[i] = new Array());
                    MipmapGenerator_1.MipmapGenerator._generateMipMaps(this._asset.getCanvas(i), mipmapData, true);
                    var len = mipmapData.length;
                    for (var j = 0; j < len; j++)
                        this._texture.uploadFromData(mipmapData[j].getImageData(), i, j);
                }
                else {
                    this._texture.uploadFromData(this._asset.getImageData(i), i, 0);
                }
            }
        }
        _super.prototype.activate.call(this, index, mipmap);
    };
    /**
     *
     */
    GL_BitmapImageCube.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        for (var i = 0; i < 6; i++) {
            var mipmapData = this._mipmapDataArray[i];
            if (mipmapData) {
                var len = mipmapData.length;
                for (var j = 0; j < len; i++)
                    MipmapGenerator_1.MipmapGenerator._freeMipMapHolder(mipmapData[j]);
            }
        }
    };
    return GL_BitmapImageCube;
}(GL_ImageCube_1.GL_ImageCube));
exports.GL_BitmapImageCube = GL_BitmapImageCube;
