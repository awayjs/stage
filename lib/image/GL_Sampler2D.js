"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_SamplerBase_1 = require("../image/GL_SamplerBase");
/**
 *
 * @class away.pool.GL_SamplerBase
 */
var GL_Sampler2D = (function (_super) {
    __extends(GL_Sampler2D, _super);
    function GL_Sampler2D(sampler, stage) {
        _super.call(this, sampler, stage);
        this._sampler = sampler;
    }
    GL_Sampler2D.prototype.activate = function (index) {
        this._stage.setSamplerState(index, this._sampler.repeat, this._sampler.smooth, this._sampler.mipmap);
    };
    return GL_Sampler2D;
}(GL_SamplerBase_1.GL_SamplerBase));
exports.GL_Sampler2D = GL_Sampler2D;
