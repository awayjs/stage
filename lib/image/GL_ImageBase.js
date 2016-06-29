"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractMethodError_1 = require("@awayjs/core/lib/errors/AbstractMethodError");
var AbstractionBase_1 = require("@awayjs/core/lib/library/AbstractionBase");
/**
 *
 * @class away.pool.GL_ImageBase
 */
var GL_ImageBase = (function (_super) {
    __extends(GL_ImageBase, _super);
    function GL_ImageBase(asset, stage) {
        _super.call(this, asset, stage);
        this.usages = 0;
        this._stage = stage;
    }
    Object.defineProperty(GL_ImageBase.prototype, "texture", {
        get: function () {
            if (!this._texture) {
                this._createTexture();
                this._invalid = true;
            }
            return this._texture;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    GL_ImageBase.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
    };
    GL_ImageBase.prototype.activate = function (index, mipmap) {
        this._stage.context.setTextureAt(index, this._texture);
    };
    GL_ImageBase.prototype._createTexture = function () {
        throw new AbstractMethodError_1.AbstractMethodError();
    };
    return GL_ImageBase;
}(AbstractionBase_1.AbstractionBase));
exports.GL_ImageBase = GL_ImageBase;
