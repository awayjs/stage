var ContextGLTextureFormat = require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
var ShaderCompilerHelper = (function () {
    function ShaderCompilerHelper() {
    }
    /**
     * A helper method that generates standard code for sampling from a texture using the normal uv coordinates.
     * @param vo The MethodVO object linking this method with the pass currently being compiled.
     * @param sharedReg The shared register object for the shader.
     * @param inputReg The texture stream register.
     * @param texture The texture which will be assigned to the given slot.
     * @param uvReg An optional uv register if coordinates different from the primary uv coordinates are to be used.
     * @param forceWrap If true, texture wrapping is enabled regardless of the material setting.
     * @return The fragment code that performs the sampling.
     *
     * @protected
     */
    ShaderCompilerHelper.getTex2DSampleCode = function (targetReg, sharedReg, inputReg, texture, smooth, repeat, mipmaps, uvReg, forceWrap) {
        if (uvReg === void 0) { uvReg = null; }
        if (forceWrap === void 0) { forceWrap = null; }
        var wrap = forceWrap || (repeat ? "wrap" : "clamp");
        var format = ShaderCompilerHelper.getFormatStringForTexture(texture);
        var enableMipMaps = mipmaps && texture.hasMipmaps;
        var filter = (smooth) ? (enableMipMaps ? "linear,miplinear" : "linear") : (enableMipMaps ? "nearest,mipnearest" : "nearest");
        if (uvReg == null)
            uvReg = sharedReg.uvVarying;
        return "tex " + targetReg + ", " + uvReg + ", " + inputReg + " <2d," + filter + "," + format + wrap + ">\n";
    };
    /**
     * A helper method that generates standard code for sampling from a cube texture.
     * @param vo The MethodVO object linking this method with the pass currently being compiled.
     * @param targetReg The register in which to store the sampled colour.
     * @param inputReg The texture stream register.
     * @param texture The cube map which will be assigned to the given slot.
     * @param uvReg The direction vector with which to sample the cube map.
     *
     * @protected
     */
    ShaderCompilerHelper.getTexCubeSampleCode = function (targetReg, inputReg, texture, smooth, mipmaps, uvReg) {
        var filter;
        var format = ShaderCompilerHelper.getFormatStringForTexture(texture);
        var enableMipMaps = mipmaps && texture.hasMipmaps;
        var filter = (smooth) ? (enableMipMaps ? "linear,miplinear" : "linear") : (enableMipMaps ? "nearest,mipnearest" : "nearest");
        return "tex " + targetReg + ", " + uvReg + ", " + inputReg + " <cube," + format + filter + ">\n";
    };
    /**
     * Generates a texture format string for the sample instruction.
     * @param texture The texture for which to get the format string.
     * @return
     *
     * @protected
     */
    ShaderCompilerHelper.getFormatStringForTexture = function (texture) {
        switch (texture.format) {
            case ContextGLTextureFormat.COMPRESSED:
                return "dxt1,";
                break;
            case ContextGLTextureFormat.COMPRESSED_ALPHA:
                return "dxt5,";
                break;
            default:
                return "";
        }
    };
    return ShaderCompilerHelper;
})();
module.exports = ShaderCompilerHelper;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvdXRpbHMvc2hhZGVyY29tcGlsZXJoZWxwZXIudHMiXSwibmFtZXMiOlsiU2hhZGVyQ29tcGlsZXJIZWxwZXIiLCJTaGFkZXJDb21waWxlckhlbHBlci5jb25zdHJ1Y3RvciIsIlNoYWRlckNvbXBpbGVySGVscGVyLmdldFRleDJEU2FtcGxlQ29kZSIsIlNoYWRlckNvbXBpbGVySGVscGVyLmdldFRleEN1YmVTYW1wbGVDb2RlIiwiU2hhZGVyQ29tcGlsZXJIZWxwZXIuZ2V0Rm9ybWF0U3RyaW5nRm9yVGV4dHVyZSJdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTyxzQkFBc0IsV0FBWSxnREFBZ0QsQ0FBQyxDQUFDO0FBSTNGLElBQU0sb0JBQW9CO0lBQTFCQSxTQUFNQSxvQkFBb0JBO0lBcUUxQkMsQ0FBQ0E7SUFuRUFEOzs7Ozs7Ozs7OztPQVdHQTtJQUNXQSx1Q0FBa0JBLEdBQWhDQSxVQUFpQ0EsU0FBK0JBLEVBQUVBLFNBQTRCQSxFQUFFQSxRQUE4QkEsRUFBRUEsT0FBd0JBLEVBQUVBLE1BQWNBLEVBQUVBLE1BQWNBLEVBQUVBLE9BQWVBLEVBQUVBLEtBQWtDQSxFQUFFQSxTQUF1QkE7UUFBM0RFLHFCQUFrQ0EsR0FBbENBLFlBQWtDQTtRQUFFQSx5QkFBdUJBLEdBQXZCQSxnQkFBdUJBO1FBRXJRQSxJQUFJQSxJQUFJQSxHQUFVQSxTQUFTQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFFQSxNQUFNQSxHQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUN4REEsSUFBSUEsTUFBTUEsR0FBVUEsb0JBQW9CQSxDQUFDQSx5QkFBeUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQzVFQSxJQUFJQSxhQUFhQSxHQUFXQSxPQUFPQSxJQUFJQSxPQUFPQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUMxREEsSUFBSUEsTUFBTUEsR0FBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBRUEsQ0FBQ0EsYUFBYUEsR0FBRUEsa0JBQWtCQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxhQUFhQSxHQUFFQSxvQkFBb0JBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBO1FBRWpJQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUNqQkEsS0FBS0EsR0FBR0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFFN0JBLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLFNBQVNBLEdBQUdBLElBQUlBLEdBQUdBLEtBQUtBLEdBQUdBLElBQUlBLEdBQUdBLFFBQVFBLEdBQUdBLE9BQU9BLEdBQUdBLE1BQU1BLEdBQUdBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO0lBRTdHQSxDQUFDQTtJQUdERjs7Ozs7Ozs7O09BU0dBO0lBQ1dBLHlDQUFvQkEsR0FBbENBLFVBQW1DQSxTQUErQkEsRUFBRUEsUUFBOEJBLEVBQUVBLE9BQXdCQSxFQUFFQSxNQUFjQSxFQUFFQSxPQUFlQSxFQUFFQSxLQUEyQkE7UUFFekxHLElBQUlBLE1BQWFBLENBQUNBO1FBQ2xCQSxJQUFJQSxNQUFNQSxHQUFVQSxvQkFBb0JBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLElBQUlBLGFBQWFBLEdBQVdBLE9BQU9BLElBQUlBLE9BQU9BLENBQUNBLFVBQVVBLENBQUNBO1FBQzFEQSxJQUFJQSxNQUFNQSxHQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFFQSxDQUFDQSxhQUFhQSxHQUFFQSxrQkFBa0JBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLEdBQUVBLG9CQUFvQkEsR0FBR0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFaklBLE1BQU1BLENBQUNBLE1BQU1BLEdBQUdBLFNBQVNBLEdBQUdBLElBQUlBLEdBQUdBLEtBQUtBLEdBQUdBLElBQUlBLEdBQUdBLFFBQVFBLEdBQUdBLFNBQVNBLEdBQUdBLE1BQU1BLEdBQUdBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xHQSxDQUFDQTtJQUVESDs7Ozs7O09BTUdBO0lBQ1dBLDhDQUF5QkEsR0FBdkNBLFVBQXdDQSxPQUF3QkE7UUFFL0RJLE1BQU1BLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxLQUFLQSxzQkFBc0JBLENBQUNBLFVBQVVBO2dCQUNyQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ2ZBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLHNCQUFzQkEsQ0FBQ0EsZ0JBQWdCQTtnQkFDM0NBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO2dCQUNmQSxLQUFLQSxDQUFDQTtZQUNQQTtnQkFDQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDWkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFDRkosMkJBQUNBO0FBQURBLENBckVBLEFBcUVDQSxJQUFBO0FBRUQsQUFBOEIsaUJBQXJCLG9CQUFvQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy91dGlscy9TaGFkZXJDb21waWxlckhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGV4dHVyZVByb3h5QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL1RleHR1cmVQcm94eUJhc2VcIik7XG5cbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGb3JtYXRcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJEYXRhXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuXG5jbGFzcyBTaGFkZXJDb21waWxlckhlbHBlclxue1xuXHQvKipcblx0ICogQSBoZWxwZXIgbWV0aG9kIHRoYXQgZ2VuZXJhdGVzIHN0YW5kYXJkIGNvZGUgZm9yIHNhbXBsaW5nIGZyb20gYSB0ZXh0dXJlIHVzaW5nIHRoZSBub3JtYWwgdXYgY29vcmRpbmF0ZXMuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSBzaGFyZWRSZWcgVGhlIHNoYXJlZCByZWdpc3RlciBvYmplY3QgZm9yIHRoZSBzaGFkZXIuXG5cdCAqIEBwYXJhbSBpbnB1dFJlZyBUaGUgdGV4dHVyZSBzdHJlYW0gcmVnaXN0ZXIuXG5cdCAqIEBwYXJhbSB0ZXh0dXJlIFRoZSB0ZXh0dXJlIHdoaWNoIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHNsb3QuXG5cdCAqIEBwYXJhbSB1dlJlZyBBbiBvcHRpb25hbCB1diByZWdpc3RlciBpZiBjb29yZGluYXRlcyBkaWZmZXJlbnQgZnJvbSB0aGUgcHJpbWFyeSB1diBjb29yZGluYXRlcyBhcmUgdG8gYmUgdXNlZC5cblx0ICogQHBhcmFtIGZvcmNlV3JhcCBJZiB0cnVlLCB0ZXh0dXJlIHdyYXBwaW5nIGlzIGVuYWJsZWQgcmVnYXJkbGVzcyBvZiB0aGUgbWF0ZXJpYWwgc2V0dGluZy5cblx0ICogQHJldHVybiBUaGUgZnJhZ21lbnQgY29kZSB0aGF0IHBlcmZvcm1zIHRoZSBzYW1wbGluZy5cblx0ICpcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRUZXgyRFNhbXBsZUNvZGUodGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgc2hhcmVkUmVnOlNoYWRlclJlZ2lzdGVyRGF0YSwgaW5wdXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB0ZXh0dXJlOlRleHR1cmVQcm94eUJhc2UsIHNtb290aDpib29sZWFuLCByZXBlYXQ6Ym9vbGVhbiwgbWlwbWFwczpib29sZWFuLCB1dlJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBudWxsLCBmb3JjZVdyYXA6c3RyaW5nID0gbnVsbCk6c3RyaW5nXG5cdHtcblx0XHR2YXIgd3JhcDpzdHJpbmcgPSBmb3JjZVdyYXAgfHwgKHJlcGVhdD8gXCJ3cmFwXCI6XCJjbGFtcFwiKTtcblx0XHR2YXIgZm9ybWF0OnN0cmluZyA9IFNoYWRlckNvbXBpbGVySGVscGVyLmdldEZvcm1hdFN0cmluZ0ZvclRleHR1cmUodGV4dHVyZSk7XG5cdFx0dmFyIGVuYWJsZU1pcE1hcHM6Ym9vbGVhbiA9IG1pcG1hcHMgJiYgdGV4dHVyZS5oYXNNaXBtYXBzO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gKHNtb290aCk/IChlbmFibGVNaXBNYXBzPyBcImxpbmVhcixtaXBsaW5lYXJcIiA6IFwibGluZWFyXCIpIDogKGVuYWJsZU1pcE1hcHM/IFwibmVhcmVzdCxtaXBuZWFyZXN0XCIgOiBcIm5lYXJlc3RcIik7XG5cblx0XHRpZiAodXZSZWcgPT0gbnVsbClcblx0XHRcdHV2UmVnID0gc2hhcmVkUmVnLnV2VmFyeWluZztcblxuXHRcdHJldHVybiBcInRleCBcIiArIHRhcmdldFJlZyArIFwiLCBcIiArIHV2UmVnICsgXCIsIFwiICsgaW5wdXRSZWcgKyBcIiA8MmQsXCIgKyBmaWx0ZXIgKyBcIixcIiArIGZvcm1hdCArIHdyYXAgKyBcIj5cXG5cIjtcblxuXHR9XG5cblxuXHQvKipcblx0ICogQSBoZWxwZXIgbWV0aG9kIHRoYXQgZ2VuZXJhdGVzIHN0YW5kYXJkIGNvZGUgZm9yIHNhbXBsaW5nIGZyb20gYSBjdWJlIHRleHR1cmUuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSB0YXJnZXRSZWcgVGhlIHJlZ2lzdGVyIGluIHdoaWNoIHRvIHN0b3JlIHRoZSBzYW1wbGVkIGNvbG91ci5cblx0ICogQHBhcmFtIGlucHV0UmVnIFRoZSB0ZXh0dXJlIHN0cmVhbSByZWdpc3Rlci5cblx0ICogQHBhcmFtIHRleHR1cmUgVGhlIGN1YmUgbWFwIHdoaWNoIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHNsb3QuXG5cdCAqIEBwYXJhbSB1dlJlZyBUaGUgZGlyZWN0aW9uIHZlY3RvciB3aXRoIHdoaWNoIHRvIHNhbXBsZSB0aGUgY3ViZSBtYXAuXG5cdCAqXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0VGV4Q3ViZVNhbXBsZUNvZGUodGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgaW5wdXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB0ZXh0dXJlOlRleHR1cmVQcm94eUJhc2UsIHNtb290aDpib29sZWFuLCBtaXBtYXBzOmJvb2xlYW4sIHV2UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCk6c3RyaW5nXG5cdHtcblx0XHR2YXIgZmlsdGVyOnN0cmluZztcblx0XHR2YXIgZm9ybWF0OnN0cmluZyA9IFNoYWRlckNvbXBpbGVySGVscGVyLmdldEZvcm1hdFN0cmluZ0ZvclRleHR1cmUodGV4dHVyZSk7XG5cdFx0dmFyIGVuYWJsZU1pcE1hcHM6Ym9vbGVhbiA9IG1pcG1hcHMgJiYgdGV4dHVyZS5oYXNNaXBtYXBzO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gKHNtb290aCk/IChlbmFibGVNaXBNYXBzPyBcImxpbmVhcixtaXBsaW5lYXJcIiA6IFwibGluZWFyXCIpIDogKGVuYWJsZU1pcE1hcHM/IFwibmVhcmVzdCxtaXBuZWFyZXN0XCIgOiBcIm5lYXJlc3RcIik7XG5cblx0XHRyZXR1cm4gXCJ0ZXggXCIgKyB0YXJnZXRSZWcgKyBcIiwgXCIgKyB1dlJlZyArIFwiLCBcIiArIGlucHV0UmVnICsgXCIgPGN1YmUsXCIgKyBmb3JtYXQgKyBmaWx0ZXIgKyBcIj5cXG5cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgYSB0ZXh0dXJlIGZvcm1hdCBzdHJpbmcgZm9yIHRoZSBzYW1wbGUgaW5zdHJ1Y3Rpb24uXG5cdCAqIEBwYXJhbSB0ZXh0dXJlIFRoZSB0ZXh0dXJlIGZvciB3aGljaCB0byBnZXQgdGhlIGZvcm1hdCBzdHJpbmcuXG5cdCAqIEByZXR1cm5cblx0ICpcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRGb3JtYXRTdHJpbmdGb3JUZXh0dXJlKHRleHR1cmU6VGV4dHVyZVByb3h5QmFzZSk6c3RyaW5nXG5cdHtcblx0XHRzd2l0Y2ggKHRleHR1cmUuZm9ybWF0KSB7XG5cdFx0XHRjYXNlIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQ09NUFJFU1NFRDpcblx0XHRcdFx0cmV0dXJuIFwiZHh0MSxcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQ09NUFJFU1NFRF9BTFBIQTpcblx0XHRcdFx0cmV0dXJuIFwiZHh0NSxcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0ID0gU2hhZGVyQ29tcGlsZXJIZWxwZXI7Il19