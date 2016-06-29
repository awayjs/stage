"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var VertexBufferFlash = (function (_super) {
    __extends(VertexBufferFlash, _super);
    function VertexBufferFlash(context, numVertices, dataPerVertex) {
        _super.call(this);
        this._context = context;
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.initVertexBuffer, dataPerVertex + OpCodes_1.OpCodes.intMask) + numVertices.toString() + ",");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    VertexBufferFlash.prototype.uploadFromArray = function (data, startVertex, numVertices) {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.uploadArrayVertexBuffer, this._pId + OpCodes_1.OpCodes.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
        this._context.execute();
    };
    VertexBufferFlash.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
    };
    Object.defineProperty(VertexBufferFlash.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferFlash.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeVertexBuffer, this._pId + OpCodes_1.OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return VertexBufferFlash;
}(ResourceBaseFlash_1.ResourceBaseFlash));
exports.VertexBufferFlash = VertexBufferFlash;
