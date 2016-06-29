"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractionBase_1 = require("@awayjs/core/lib/library/AbstractionBase");
/**
 *
 * @class away.pool.GL_AttributesBuffer
 */
var GL_AttributesBuffer = (function (_super) {
    __extends(GL_AttributesBuffer, _super);
    function GL_AttributesBuffer(attributesBuffer, stage) {
        _super.call(this, attributesBuffer, stage);
        this._stage = stage;
        this._attributesBuffer = attributesBuffer;
    }
    /**
     *
     */
    GL_AttributesBuffer.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        this._attributesBuffer = null;
        if (this._indexBuffer) {
            this._indexBuffer.dispose();
            this._indexBuffer = null;
        }
        if (this._vertexBuffer) {
            this._vertexBuffer.dispose();
            this._vertexBuffer = null;
        }
    };
    GL_AttributesBuffer.prototype.activate = function (index, size, dimensions, offset, unsigned) {
        if (unsigned === void 0) { unsigned = false; }
        this._stage.setVertexBuffer(index, this._getVertexBuffer(), size, dimensions, offset, unsigned);
    };
    GL_AttributesBuffer.prototype.draw = function (mode, firstIndex, numIndices) {
        this._stage.context.drawIndices(mode, this._getIndexBuffer(), firstIndex, numIndices);
    };
    GL_AttributesBuffer.prototype._getIndexBuffer = function () {
        if (!this._indexBuffer) {
            this._invalid = true;
            this._indexBuffer = this._stage.context.createIndexBuffer(this._attributesBuffer.count * this._attributesBuffer.stride / 2); //hardcoded assuming UintArray
        }
        if (this._invalid) {
            this._invalid = false;
            this._indexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.length);
        }
        return this._indexBuffer;
    };
    GL_AttributesBuffer.prototype._getVertexBuffer = function () {
        if (!this._vertexBuffer) {
            this._invalid = true;
            this._vertexBuffer = this._stage.context.createVertexBuffer(this._attributesBuffer.count, this._attributesBuffer.stride);
        }
        if (this._invalid) {
            this._invalid = false;
            this._vertexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.count);
        }
        return this._vertexBuffer;
    };
    return GL_AttributesBuffer;
}(AbstractionBase_1.AbstractionBase));
exports.GL_AttributesBuffer = GL_AttributesBuffer;
