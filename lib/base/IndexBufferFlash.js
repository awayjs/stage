"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var IndexBufferFlash = (function (_super) {
    __extends(IndexBufferFlash, _super);
    function IndexBufferFlash(context, numIndices) {
        _super.call(this);
        this._context = context;
        this._numIndices = numIndices;
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.initIndexBuffer, numIndices + OpCodes_1.OpCodes.intMask));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    IndexBufferFlash.prototype.uploadFromArray = function (data, startOffset, count) {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.uploadArrayIndexBuffer, this._pId + OpCodes_1.OpCodes.intMask) + data.join() + "#" + startOffset + "," + count + ",");
        this._context.execute();
    };
    IndexBufferFlash.prototype.uploadFromByteArray = function (data, startOffset, count) {
    };
    IndexBufferFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeIndexBuffer, this._pId + OpCodes_1.OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    Object.defineProperty(IndexBufferFlash.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferFlash;
}(ResourceBaseFlash_1.ResourceBaseFlash));
exports.IndexBufferFlash = IndexBufferFlash;
