"use strict";
var TextureSoftware = (function () {
    function TextureSoftware(width, height) {
        this.textureType = "texture2d";
        this._mipLevels = [];
        this._width = width;
        this._height = height;
    }
    TextureSoftware.prototype.dispose = function () {
        this._mipLevels = null;
    };
    Object.defineProperty(TextureSoftware.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureSoftware.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    TextureSoftware.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        this._mipLevels[miplevel] = data.data;
    };
    TextureSoftware.prototype.getData = function (miplevel) {
        return this._mipLevels[miplevel];
    };
    TextureSoftware.prototype.getMipLevelsCount = function () {
        return this._mipLevels.length;
    };
    return TextureSoftware;
}());
exports.TextureSoftware = TextureSoftware;
