"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_ImageCube_1 = require("../image/GL_ImageCube");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_RenderImageCube = (function (_super) {
    __extends(GL_RenderImageCube, _super);
    function GL_RenderImageCube() {
        _super.apply(this, arguments);
    }
    GL_RenderImageCube.prototype.activate = function (index, mipmap) {
        _super.prototype.activate.call(this, index, false);
        //TODO: allow automatic mipmap generation
    };
    return GL_RenderImageCube;
}(GL_ImageCube_1.GL_ImageCube));
exports.GL_RenderImageCube = GL_RenderImageCube;
