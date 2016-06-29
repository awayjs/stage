"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_Image2D_1 = require("../image/GL_Image2D");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_RenderImage2D = (function (_super) {
    __extends(GL_RenderImage2D, _super);
    function GL_RenderImage2D() {
        _super.apply(this, arguments);
    }
    GL_RenderImage2D.prototype.activate = function (index, mipmap) {
        _super.prototype.activate.call(this, index, false);
        //TODO: allow automatic mipmap generation
    };
    return GL_RenderImage2D;
}(GL_Image2D_1.GL_Image2D));
exports.GL_RenderImage2D = GL_RenderImage2D;
