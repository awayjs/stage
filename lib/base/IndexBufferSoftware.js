"use strict";
var IndexBufferSoftware = (function () {
    function IndexBufferSoftware(numIndices) {
        this._numIndices = numIndices;
    }
    IndexBufferSoftware.prototype.uploadFromArray = function (data, startOffset, count) {
        this._startOffset = startOffset * 2;
        this._data = new Uint16Array(data);
    };
    IndexBufferSoftware.prototype.uploadFromByteArray = function (data, startOffset, count) {
        this._startOffset = startOffset * 2;
        this._data = new Uint16Array(data);
    };
    IndexBufferSoftware.prototype.dispose = function () {
        this._data = null;
    };
    Object.defineProperty(IndexBufferSoftware.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferSoftware.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferSoftware.prototype, "startOffset", {
        get: function () {
            return this._startOffset;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferSoftware;
}());
exports.IndexBufferSoftware = IndexBufferSoftware;
