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
var GL_SamplerCube = (function (_super) {
    __extends(GL_SamplerCube, _super);
    function GL_SamplerCube(sampler, stage) {
        _super.call(this, sampler, stage);
        this._sampler = sampler;
    }
    GL_SamplerCube.prototype.activate = function (index) {
        this._stage.setSamplerState(index, false, this._sampler.smooth, this._sampler.mipmap);
    };
    return GL_SamplerCube;
}(GL_SamplerBase_1.GL_SamplerBase));
exports.GL_SamplerCube = GL_SamplerCube;
