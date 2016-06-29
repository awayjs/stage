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
 * @class away.pool.GL_SamplerBase
 */
var GL_SamplerBase = (function (_super) {
    __extends(GL_SamplerBase, _super);
    function GL_SamplerBase(asset, stage) {
        _super.call(this, asset, stage);
        this._stage = stage;
    }
    GL_SamplerBase.prototype.activate = function (index) {
        throw new AbstractMethodError_1.AbstractMethodError();
    };
    return GL_SamplerBase;
}(AbstractionBase_1.AbstractionBase));
exports.GL_SamplerBase = GL_SamplerBase;
