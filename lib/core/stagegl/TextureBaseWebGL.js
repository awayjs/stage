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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvc3RhZ2VnbC90ZXh0dXJlYmFzZXdlYmdsLnRzIl0sIm5hbWVzIjpbIlRleHR1cmVCYXNlV2ViR0wiLCJUZXh0dXJlQmFzZVdlYkdMLmNvbnN0cnVjdG9yIiwiVGV4dHVyZUJhc2VXZWJHTC5kaXNwb3NlIiwiVGV4dHVyZUJhc2VXZWJHTC5nbFRleHR1cmUiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sbUJBQW1CLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUVyRixJQUFNLGdCQUFnQjtJQUtyQkEsU0FMS0EsZ0JBQWdCQSxDQUtUQSxFQUF3QkE7UUFIN0JDLGdCQUFXQSxHQUFVQSxFQUFFQSxDQUFDQTtRQUs5QkEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFTUQsa0NBQU9BLEdBQWRBO1FBRUNFLE1BQU1BLHFDQUFxQ0EsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBRURGLHNCQUFXQSx1Q0FBU0E7YUFBcEJBO1lBRUNHLE1BQU1BLElBQUlBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7UUFDakNBLENBQUNBOzs7T0FBQUg7SUFDRkEsdUJBQUNBO0FBQURBLENBbkJBLEFBbUJDQSxJQUFBO0FBRUQsQUFBMEIsaUJBQWpCLGdCQUFnQixDQUFDIiwiZmlsZSI6ImNvcmUvc3RhZ2VnbC9UZXh0dXJlQmFzZVdlYkdMLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFic3RyYWN0TWV0aG9kRXJyb3JcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXJyb3JzL0Fic3RyYWN0TWV0aG9kRXJyb3JcIik7XG5cbmNsYXNzIFRleHR1cmVCYXNlV2ViR0xcbntcblx0cHVibGljIHRleHR1cmVUeXBlOnN0cmluZyA9IFwiXCI7XG5cdHB1YmxpYyBfZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0O1xuXG5cdGNvbnN0cnVjdG9yKGdsOldlYkdMUmVuZGVyaW5nQ29udGV4dClcblx0e1xuXHRcdHRoaXMuX2dsID0gZ2w7XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpOnZvaWRcblx0e1xuXHRcdHRocm93IFwiQWJzdHJhY3QgbWV0aG9kIG11c3QgYmUgb3ZlcnJpZGRlbi5cIjtcblx0fVxuXG5cdHB1YmxpYyBnZXQgZ2xUZXh0dXJlKCk6V2ViR0xUZXh0dXJlXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFRleHR1cmVCYXNlV2ViR0w7Il19