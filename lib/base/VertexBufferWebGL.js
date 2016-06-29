"use strict";
var VertexBufferWebGL = (function () {
    function VertexBufferWebGL(gl, numVertices, dataPerVertex) {
        this._gl = gl;
        this._buffer = this._gl.createBuffer();
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }
    VertexBufferWebGL.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        if (startVertex)
            this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex * this._dataPerVertex, new Float32Array(vertices));
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
    };
    VertexBufferWebGL.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        if (startVertex)
            this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex * this._dataPerVertex, data);
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
    };
    Object.defineProperty(VertexBufferWebGL.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferWebGL.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferWebGL.prototype, "glBuffer", {
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferWebGL.prototype.dispose = function () {
        this._gl.deleteBuffer(this._buffer);
    };
    return VertexBufferWebGL;
}());
exports.VertexBufferWebGL = VertexBufferWebGL;
