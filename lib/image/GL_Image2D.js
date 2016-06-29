"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContextGLTextureFormat_1 = require("../base/ContextGLTextureFormat");
var GL_ImageBase_1 = require("../image/GL_ImageBase");
/**
 *
 * @class away.pool.GL_ImageBase
 */
var GL_Image2D = (function (_super) {
    __extends(GL_Image2D, _super);
    function GL_Image2D() {
        _super.apply(this, arguments);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    GL_Image2D.prototype._createTexture = function () {
        this._texture = this._stage.context.createTexture(this._asset.width, this._asset.height, ContextGLTextureFormat_1.ContextGLTextureFormat.BGRA, true);
    };
    return GL_Image2D;
}(GL_ImageBase_1.GL_ImageBase));
exports.GL_Image2D = GL_Image2D;
