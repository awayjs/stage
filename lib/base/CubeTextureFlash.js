"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ByteArrayBase_1 = require("@awayjs/core/lib/utils/ByteArrayBase");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var CubeTextureFlash = (function (_super) {
    __extends(CubeTextureFlash, _super);
    function CubeTextureFlash(context, size, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._size = size;
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.initCubeTexture, (forRTT ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue)) + size + "," + streaming + "," + format + "$");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    Object.defineProperty(CubeTextureFlash.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    CubeTextureFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeCubeTexture) + this._pId.toString() + ",");
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    CubeTextureFlash.prototype.uploadFromData = function (data, side, miplevel) {
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
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    CubeTextureFlash.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
    };
    return CubeTextureFlash;
}(ResourceBaseFlash_1.ResourceBaseFlash));
exports.CubeTextureFlash = CubeTextureFlash;
