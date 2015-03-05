var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var TextureBaseWebGL = (function () {
    function TextureBaseWebGL(gl) {
        this.textureType = "";
        this._gl = gl;
    }
    TextureBaseWebGL.prototype.dispose = function () {
        throw "Abstract method must be overridden.";
    };
    Object.defineProperty(TextureBaseWebGL.prototype, "glTexture", {
        get: function () {
            throw new AbstractMethodError();
        },
        enumerable: true,
        configurable: true
    });
    return TextureBaseWebGL;
})();
module.exports = TextureBaseWebGL;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1RleHR1cmVCYXNlV2ViR0wudHMiXSwibmFtZXMiOlsiVGV4dHVyZUJhc2VXZWJHTCIsIlRleHR1cmVCYXNlV2ViR0wuY29uc3RydWN0b3IiLCJUZXh0dXJlQmFzZVdlYkdMLmRpc3Bvc2UiLCJUZXh0dXJlQmFzZVdlYkdMLmdsVGV4dHVyZSJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxtQkFBbUIsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBRXJGLElBQU0sZ0JBQWdCO0lBS3JCQSxTQUxLQSxnQkFBZ0JBLENBS1RBLEVBQXdCQTtRQUg3QkMsZ0JBQVdBLEdBQVVBLEVBQUVBLENBQUNBO1FBSzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVNRCxrQ0FBT0EsR0FBZEE7UUFFQ0UsTUFBTUEscUNBQXFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREYsc0JBQVdBLHVDQUFTQTthQUFwQkE7WUFFQ0csTUFBTUEsSUFBSUEsbUJBQW1CQSxFQUFFQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7OztPQUFBSDtJQUNGQSx1QkFBQ0E7QUFBREEsQ0FuQkEsQUFtQkNBLElBQUE7QUFFRCxBQUEwQixpQkFBakIsZ0JBQWdCLENBQUMiLCJmaWxlIjoiYmFzZS9UZXh0dXJlQmFzZVdlYkdMLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xuXG5jbGFzcyBUZXh0dXJlQmFzZVdlYkdMXG57XG5cdHB1YmxpYyB0ZXh0dXJlVHlwZTpzdHJpbmcgPSBcIlwiO1xuXHRwdWJsaWMgX2dsOldlYkdMUmVuZGVyaW5nQ29udGV4dDtcblxuXHRjb25zdHJ1Y3RvcihnbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQpXG5cdHtcblx0XHR0aGlzLl9nbCA9IGdsO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKTp2b2lkXG5cdHtcblx0XHR0aHJvdyBcIkFic3RyYWN0IG1ldGhvZCBtdXN0IGJlIG92ZXJyaWRkZW4uXCI7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGdsVGV4dHVyZSgpOldlYkdMVGV4dHVyZVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxufVxuXG5leHBvcnQgPSBUZXh0dXJlQmFzZVdlYkdMOyJdfQ==