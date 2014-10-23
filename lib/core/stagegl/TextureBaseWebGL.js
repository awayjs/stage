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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvdGV4dHVyZWJhc2V3ZWJnbC50cyJdLCJuYW1lcyI6WyJUZXh0dXJlQmFzZVdlYkdMIiwiVGV4dHVyZUJhc2VXZWJHTC5jb25zdHJ1Y3RvciIsIlRleHR1cmVCYXNlV2ViR0wuZGlzcG9zZSIsIlRleHR1cmVCYXNlV2ViR0wuZ2xUZXh0dXJlIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLG1CQUFtQixXQUFhLDRDQUE0QyxDQUFDLENBQUM7QUFFckYsSUFBTSxnQkFBZ0I7SUFLckJBLFNBTEtBLGdCQUFnQkEsQ0FLVEEsRUFBd0JBO1FBSDdCQyxnQkFBV0EsR0FBVUEsRUFBRUEsQ0FBQ0E7UUFLOUJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRU1ELGtDQUFPQSxHQUFkQTtRQUVDRSxNQUFNQSxxQ0FBcUNBLENBQUNBO0lBQzdDQSxDQUFDQTtJQUVERixzQkFBV0EsdUNBQVNBO2FBQXBCQTtZQUVDRyxNQUFNQSxJQUFJQSxtQkFBbUJBLEVBQUVBLENBQUNBO1FBQ2pDQSxDQUFDQTs7O09BQUFIO0lBQ0ZBLHVCQUFDQTtBQUFEQSxDQW5CQSxBQW1CQ0EsSUFBQTtBQUVELEFBQTBCLGlCQUFqQixnQkFBZ0IsQ0FBQyIsImZpbGUiOiJjb3JlL3N0YWdlZ2wvVGV4dHVyZUJhc2VXZWJHTC5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWJzdHJhY3RNZXRob2RFcnJvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lcnJvcnMvQWJzdHJhY3RNZXRob2RFcnJvclwiKTtcblxuY2xhc3MgVGV4dHVyZUJhc2VXZWJHTFxue1xuXHRwdWJsaWMgdGV4dHVyZVR5cGU6c3RyaW5nID0gXCJcIjtcblx0cHVibGljIF9nbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG5cblx0Y29uc3RydWN0b3IoZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0KVxuXHR7XG5cdFx0dGhpcy5fZ2wgPSBnbDtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlKCk6dm9pZFxuXHR7XG5cdFx0dGhyb3cgXCJBYnN0cmFjdCBtZXRob2QgbXVzdCBiZSBvdmVycmlkZGVuLlwiO1xuXHR9XG5cblx0cHVibGljIGdldCBnbFRleHR1cmUoKTpXZWJHTFRleHR1cmVcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cbn1cblxuZXhwb3J0ID0gVGV4dHVyZUJhc2VXZWJHTDsiXX0=