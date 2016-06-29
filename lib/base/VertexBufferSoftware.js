"use strict";
var VertexBufferSoftware = (function () {
    //private _dataOffset:number;
    function VertexBufferSoftware(numVertices, dataPerVertex) {
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }
    VertexBufferSoftware.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        //this._dataOffset = startVertex * this._dataPerVertex;
        this._floatData = new Float32Array(vertices);
    };
    VertexBufferSoftware.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
        //this._dataOffset = startVertex * this._dataPerVertex;
        this._floatData = new Float32Array(data, startVertex * this._dataPerVertex, numVertices * this._dataPerVertex / 4);
        this._uintData = new Uint8Array(data);
    };
    Object.defineProperty(VertexBufferSoftware.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "attributesPerVertex", {
        get: function () {
            return this._dataPerVertex / 4;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferSoftware.prototype.dispose = function () {
        this._floatData = null;
    };
    Object.defineProperty(VertexBufferSoftware.prototype, "data", {
        get: function () {
            return this._floatData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "uintData", {
        get: function () {
            return this._uintData;
        },
        enumerable: true,
        configurable: true
    });
    return VertexBufferSoftware;
}());
exports.VertexBufferSoftware = VertexBufferSoftware;
