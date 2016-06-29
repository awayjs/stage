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
 * @class away.pool.GL_ImageCubeBase
 */
var GL_ImageCube = (function (_super) {
    __extends(GL_ImageCube, _super);
    function GL_ImageCube() {
        _super.apply(this, arguments);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    GL_ImageCube.prototype._createTexture = function () {
        this._texture = this._stage.context.createCubeTexture(this._asset.size, ContextGLTextureFormat_1.ContextGLTextureFormat.BGRA, false);
    };
    return GL_ImageCube;
}(GL_ImageBase_1.GL_ImageBase));
exports.GL_ImageCube = GL_ImageCube;
