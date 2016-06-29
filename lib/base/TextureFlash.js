"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ByteArrayBase_1 = require("@awayjs/core/lib/utils/ByteArrayBase");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var TextureFlash = (function (_super) {
    __extends(TextureFlash, _super);
    function TextureFlash(context, width, height, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._width = width;
        this._height = height;
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.initTexture, (forRTT ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    Object.defineProperty(TextureFlash.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureFlash.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    TextureFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeTexture) + this._pId.toString() + ",");
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    TextureFlash.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        if (data instanceof HTMLImageElement) {
            var can = document.createElement("canvas");
            var w = data.width;
            var h = data.height;
            can.width = w;
            can.height = h;
            var ctx = can.getContext("2d");
            ctx.drawImage(data, 0, 0);
            data = ctx.getImageData(0, 0, w, h).data;
        }
        var pos = 0;
        var bytes = ByteArrayBase_1.ByteArrayBase.internalGetBase64String(data.length, function () {
            return data[pos++];
        }, null);
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    return TextureFlash;
}(ResourceBaseFlash_1.ResourceBaseFlash));
exports.TextureFlash = TextureFlash;
