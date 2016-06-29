"use strict";
var IndexBufferWebGL = (function () {
    function IndexBufferWebGL(gl, numIndices) {
        this._gl = gl;
        this._buffer = this._gl.createBuffer();
        this._numIndices = numIndices;
    }
    IndexBufferWebGL.prototype.uploadFromArray = function (data, startOffset, count) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
        if (startOffset)
            this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, new Uint16Array(data));
        else
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._gl.STATIC_DRAW);
    };
    IndexBufferWebGL.prototype.uploadFromByteArray = function (data, startOffset, count) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
        if (startOffset)
            this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, data);
        else
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
    };
    IndexBufferWebGL.prototype.dispose = function () {
        this._gl.deleteBuffer(this._buffer);
    };
    Object.defineProperty(IndexBufferWebGL.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferWebGL.prototype, "glBuffer", {
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferWebGL;
}());
exports.IndexBufferWebGL = IndexBufferWebGL;
