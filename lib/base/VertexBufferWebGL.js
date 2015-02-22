var VertexBufferWebGL = (function () {
    function VertexBufferWebGL(gl, numVertices, data32PerVertex) {
        this._gl = gl;
        this._buffer = this._gl.createBuffer();
        this._numVertices = numVertices;
        this._data32PerVertex = data32PerVertex;
    }
    VertexBufferWebGL.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        //console.log( "** WARNING upload not fully implemented, startVertex & numVertices not considered." );
        // TODO add offsets , startVertex, numVertices * this._data32PerVertex
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
    };
    Object.defineProperty(VertexBufferWebGL.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferWebGL.prototype, "data32PerVertex", {
        get: function () {
            return this._data32PerVertex;
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
})();
module.exports = VertexBufferWebGL;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1ZlcnRleEJ1ZmZlcldlYkdMLnRzIl0sIm5hbWVzIjpbIlZlcnRleEJ1ZmZlcldlYkdMIiwiVmVydGV4QnVmZmVyV2ViR0wuY29uc3RydWN0b3IiLCJWZXJ0ZXhCdWZmZXJXZWJHTC51cGxvYWRGcm9tQXJyYXkiLCJWZXJ0ZXhCdWZmZXJXZWJHTC5udW1WZXJ0aWNlcyIsIlZlcnRleEJ1ZmZlcldlYkdMLmRhdGEzMlBlclZlcnRleCIsIlZlcnRleEJ1ZmZlcldlYkdMLmdsQnVmZmVyIiwiVmVydGV4QnVmZmVyV2ViR0wuZGlzcG9zZSJdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxpQkFBaUI7SUFRdEJBLFNBUktBLGlCQUFpQkEsQ0FRVkEsRUFBd0JBLEVBQUVBLFdBQWtCQSxFQUFFQSxlQUFzQkE7UUFFL0VDLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2RBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBQ3ZDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxXQUFXQSxDQUFDQTtRQUNoQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxlQUFlQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFTUQsMkNBQWVBLEdBQXRCQSxVQUF1QkEsUUFBaUJBLEVBQUVBLFdBQWtCQSxFQUFFQSxXQUFrQkE7UUFFL0VFLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBRXpEQSxBQUVBQSxzR0FGc0dBO1FBQ3RHQSxzRUFBc0VBO1FBQ3RFQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxZQUFZQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM5RkEsQ0FBQ0E7SUFFREYsc0JBQVdBLDBDQUFXQTthQUF0QkE7WUFFQ0csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDMUJBLENBQUNBOzs7T0FBQUg7SUFFREEsc0JBQVdBLDhDQUFlQTthQUExQkE7WUFFQ0ksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7OztPQUFBSjtJQUVEQSxzQkFBV0EsdUNBQVFBO2FBQW5CQTtZQUVDSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7OztPQUFBTDtJQUVNQSxtQ0FBT0EsR0FBZEE7UUFFQ00sSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDckNBLENBQUNBO0lBQ0ZOLHdCQUFDQTtBQUFEQSxDQTVDQSxBQTRDQ0EsSUFBQTtBQUVELEFBQTJCLGlCQUFsQixpQkFBaUIsQ0FBQyIsImZpbGUiOiJiYXNlL1ZlcnRleEJ1ZmZlcldlYkdMLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJVmVydGV4QnVmZmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVmVydGV4QnVmZmVyXCIpO1xyXG5cclxuY2xhc3MgVmVydGV4QnVmZmVyV2ViR0wgaW1wbGVtZW50cyBJVmVydGV4QnVmZmVyXHJcbntcclxuXHJcblx0cHJpdmF0ZSBfZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0O1xyXG5cdHByaXZhdGUgX251bVZlcnRpY2VzOm51bWJlcjtcclxuXHRwcml2YXRlIF9kYXRhMzJQZXJWZXJ0ZXg6bnVtYmVyO1xyXG5cdHByaXZhdGUgX2J1ZmZlcjpXZWJHTEJ1ZmZlcjtcclxuXHJcblx0Y29uc3RydWN0b3IoZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0LCBudW1WZXJ0aWNlczpudW1iZXIsIGRhdGEzMlBlclZlcnRleDpudW1iZXIpXHJcblx0e1xyXG5cdFx0dGhpcy5fZ2wgPSBnbDtcclxuXHRcdHRoaXMuX2J1ZmZlciA9IHRoaXMuX2dsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cdFx0dGhpcy5fbnVtVmVydGljZXMgPSBudW1WZXJ0aWNlcztcclxuXHRcdHRoaXMuX2RhdGEzMlBlclZlcnRleCA9IGRhdGEzMlBlclZlcnRleDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB1cGxvYWRGcm9tQXJyYXkodmVydGljZXM6bnVtYmVyW10sIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKVxyXG5cdHtcclxuXHRcdHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl9idWZmZXIpO1xyXG5cclxuXHRcdC8vY29uc29sZS5sb2coIFwiKiogV0FSTklORyB1cGxvYWQgbm90IGZ1bGx5IGltcGxlbWVudGVkLCBzdGFydFZlcnRleCAmIG51bVZlcnRpY2VzIG5vdCBjb25zaWRlcmVkLlwiICk7XHJcblx0XHQvLyBUT0RPIGFkZCBvZmZzZXRzICwgc3RhcnRWZXJ0ZXgsIG51bVZlcnRpY2VzICogdGhpcy5fZGF0YTMyUGVyVmVydGV4XHJcblx0XHR0aGlzLl9nbC5idWZmZXJEYXRhKHRoaXMuX2dsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksIHRoaXMuX2dsLlNUQVRJQ19EUkFXKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnZXQgbnVtVmVydGljZXMoKTpudW1iZXJcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fbnVtVmVydGljZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IGRhdGEzMlBlclZlcnRleCgpOm51bWJlclxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9kYXRhMzJQZXJWZXJ0ZXg7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0IGdsQnVmZmVyKCk6V2ViR0xCdWZmZXJcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5fYnVmZmVyO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3Bvc2UoKVxyXG5cdHtcclxuXHRcdHRoaXMuX2dsLmRlbGV0ZUJ1ZmZlcih0aGlzLl9idWZmZXIpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0ID0gVmVydGV4QnVmZmVyV2ViR0w7Il19