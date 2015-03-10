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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1RleHR1cmVCYXNlV2ViR0wudHMiXSwibmFtZXMiOlsiVGV4dHVyZUJhc2VXZWJHTCIsIlRleHR1cmVCYXNlV2ViR0wuY29uc3RydWN0b3IiLCJUZXh0dXJlQmFzZVdlYkdMLmRpc3Bvc2UiLCJUZXh0dXJlQmFzZVdlYkdMLmdsVGV4dHVyZSJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTyxtQkFBbUIsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBRXJGLElBQU0sZ0JBQWdCO0lBS3JCQSxTQUxLQSxnQkFBZ0JBLENBS1RBLEVBQXdCQTtRQUg3QkMsZ0JBQVdBLEdBQVVBLEVBQUVBLENBQUNBO1FBSzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVNRCxrQ0FBT0EsR0FBZEE7UUFFQ0UsTUFBTUEscUNBQXFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREYsc0JBQVdBLHVDQUFTQTthQUFwQkE7WUFFQ0csTUFBTUEsSUFBSUEsbUJBQW1CQSxFQUFFQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7OztPQUFBSDtJQUNGQSx1QkFBQ0E7QUFBREEsQ0FuQkEsQUFtQkNBLElBQUE7QUFFRCxBQUEwQixpQkFBakIsZ0JBQWdCLENBQUMiLCJmaWxlIjoiYmFzZS9UZXh0dXJlQmFzZVdlYkdMLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xyXG5cclxuY2xhc3MgVGV4dHVyZUJhc2VXZWJHTFxyXG57XHJcblx0cHVibGljIHRleHR1cmVUeXBlOnN0cmluZyA9IFwiXCI7XHJcblx0cHVibGljIF9nbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdsOldlYkdMUmVuZGVyaW5nQ29udGV4dClcclxuXHR7XHJcblx0XHR0aGlzLl9nbCA9IGdsO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRpc3Bvc2UoKTp2b2lkXHJcblx0e1xyXG5cdFx0dGhyb3cgXCJBYnN0cmFjdCBtZXRob2QgbXVzdCBiZSBvdmVycmlkZGVuLlwiO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdldCBnbFRleHR1cmUoKTpXZWJHTFRleHR1cmVcclxuXHR7XHJcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0ID0gVGV4dHVyZUJhc2VXZWJHTDsiXX0=