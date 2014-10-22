var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MaterialPassBase = require("awayjs-stagegl/lib/materials/passes/MaterialPassBase");
/**
 * SkyboxPass provides a material pass exclusively used to render sky boxes from a cube texture.
 */
var SkyboxPass = (function (_super) {
    __extends(SkyboxPass, _super);
    /**
     * Creates a new SkyboxPass object.
     *
     * @param material The material to which this pass belongs.
     */
    function SkyboxPass() {
        _super.call(this);
    }
    SkyboxPass.prototype._iIncludeDependencies = function (shaderObject) {
        shaderObject.useMipmapping = false;
    };
    return SkyboxPass;
})(MaterialPassBase);
module.exports = SkyboxPass;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9wYXNzZXMvc2t5Ym94cGFzcy50cyJdLCJuYW1lcyI6WyJTa3lib3hQYXNzIiwiU2t5Ym94UGFzcy5jb25zdHJ1Y3RvciIsIlNreWJveFBhc3MuX2lJbmNsdWRlRGVwZW5kZW5jaWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFPLGdCQUFnQixXQUFjLHNEQUFzRCxDQUFDLENBQUM7QUFFN0YsQUFHQTs7R0FERztJQUNHLFVBQVU7SUFBU0EsVUFBbkJBLFVBQVVBLFVBQXlCQTtJQUV4Q0E7Ozs7T0FJR0E7SUFDSEEsU0FQS0EsVUFBVUE7UUFTZEMsaUJBQU9BLENBQUNBO0lBQ1RBLENBQUNBO0lBR01ELDBDQUFxQkEsR0FBNUJBLFVBQTZCQSxZQUFpQ0E7UUFFN0RFLFlBQVlBLENBQUNBLGFBQWFBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUNGRixpQkFBQ0E7QUFBREEsQ0FqQkEsQUFpQkNBLEVBakJ3QixnQkFBZ0IsRUFpQnhDO0FBRUQsQUFBb0IsaUJBQVgsVUFBVSxDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9wYXNzZXMvU2t5Ym94UGFzcy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTaGFkZXJMaWdodGluZ09iamVjdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyTGlnaHRpbmdPYmplY3RcIik7XG5pbXBvcnQgTWF0ZXJpYWxQYXNzQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvTWF0ZXJpYWxQYXNzQmFzZVwiKTtcblxuLyoqXG4gKiBTa3lib3hQYXNzIHByb3ZpZGVzIGEgbWF0ZXJpYWwgcGFzcyBleGNsdXNpdmVseSB1c2VkIHRvIHJlbmRlciBza3kgYm94ZXMgZnJvbSBhIGN1YmUgdGV4dHVyZS5cbiAqL1xuY2xhc3MgU2t5Ym94UGFzcyBleHRlbmRzIE1hdGVyaWFsUGFzc0Jhc2Vcbntcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgU2t5Ym94UGFzcyBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBtYXRlcmlhbCBUaGUgbWF0ZXJpYWwgdG8gd2hpY2ggdGhpcyBwYXNzIGJlbG9uZ3MuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblxuXHRwdWJsaWMgX2lJbmNsdWRlRGVwZW5kZW5jaWVzKHNoYWRlck9iamVjdDpTaGFkZXJMaWdodGluZ09iamVjdClcblx0e1xuXHRcdHNoYWRlck9iamVjdC51c2VNaXBtYXBwaW5nID0gZmFsc2U7XG5cdH1cbn1cblxuZXhwb3J0ID0gU2t5Ym94UGFzczsiXX0=