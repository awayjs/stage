var ContextGLTextureFormat = require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFormat");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy91dGlscy9zaGFkZXJjb21waWxlcmhlbHBlci50cyJdLCJuYW1lcyI6WyJTaGFkZXJDb21waWxlckhlbHBlciIsIlNoYWRlckNvbXBpbGVySGVscGVyLmNvbnN0cnVjdG9yIiwiU2hhZGVyQ29tcGlsZXJIZWxwZXIuZ2V0VGV4MkRTYW1wbGVDb2RlIiwiU2hhZGVyQ29tcGlsZXJIZWxwZXIuZ2V0VGV4Q3ViZVNhbXBsZUNvZGUiLCJTaGFkZXJDb21waWxlckhlbHBlci5nZXRGb3JtYXRTdHJpbmdGb3JUZXh0dXJlIl0sIm1hcHBpbmdzIjoiQUFFQSxJQUFPLHNCQUFzQixXQUFZLHdEQUF3RCxDQUFDLENBQUM7QUFJbkcsSUFBTSxvQkFBb0I7SUFBMUJBLFNBQU1BLG9CQUFvQkE7SUFxRTFCQyxDQUFDQTtJQW5FQUQ7Ozs7Ozs7Ozs7O09BV0dBO0lBQ1dBLHVDQUFrQkEsR0FBaENBLFVBQWlDQSxTQUErQkEsRUFBRUEsU0FBNEJBLEVBQUVBLFFBQThCQSxFQUFFQSxPQUF3QkEsRUFBRUEsTUFBY0EsRUFBRUEsTUFBY0EsRUFBRUEsT0FBZUEsRUFBRUEsS0FBa0NBLEVBQUVBLFNBQXVCQTtRQUEzREUscUJBQWtDQSxHQUFsQ0EsWUFBa0NBO1FBQUVBLHlCQUF1QkEsR0FBdkJBLGdCQUF1QkE7UUFFclFBLElBQUlBLElBQUlBLEdBQVVBLFNBQVNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUVBLE1BQU1BLEdBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3hEQSxJQUFJQSxNQUFNQSxHQUFVQSxvQkFBb0JBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLElBQUlBLGFBQWFBLEdBQVdBLE9BQU9BLElBQUlBLE9BQU9BLENBQUNBLFVBQVVBLENBQUNBO1FBQzFEQSxJQUFJQSxNQUFNQSxHQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFFQSxDQUFDQSxhQUFhQSxHQUFFQSxrQkFBa0JBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLEdBQUVBLG9CQUFvQkEsR0FBR0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFaklBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO1lBQ2pCQSxLQUFLQSxHQUFHQSxTQUFTQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUU3QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0EsU0FBU0EsR0FBR0EsSUFBSUEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsR0FBR0EsUUFBUUEsR0FBR0EsT0FBT0EsR0FBR0EsTUFBTUEsR0FBR0EsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFFN0dBLENBQUNBO0lBR0RGOzs7Ozs7Ozs7T0FTR0E7SUFDV0EseUNBQW9CQSxHQUFsQ0EsVUFBbUNBLFNBQStCQSxFQUFFQSxRQUE4QkEsRUFBRUEsT0FBd0JBLEVBQUVBLE1BQWNBLEVBQUVBLE9BQWVBLEVBQUVBLEtBQTJCQTtRQUV6TEcsSUFBSUEsTUFBYUEsQ0FBQ0E7UUFDbEJBLElBQUlBLE1BQU1BLEdBQVVBLG9CQUFvQkEsQ0FBQ0EseUJBQXlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1RUEsSUFBSUEsYUFBYUEsR0FBV0EsT0FBT0EsSUFBSUEsT0FBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDMURBLElBQUlBLE1BQU1BLEdBQVVBLENBQUNBLE1BQU1BLENBQUNBLEdBQUVBLENBQUNBLGFBQWFBLEdBQUVBLGtCQUFrQkEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsR0FBRUEsb0JBQW9CQSxHQUFHQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUVqSUEsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0EsU0FBU0EsR0FBR0EsSUFBSUEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsR0FBR0EsUUFBUUEsR0FBR0EsU0FBU0EsR0FBR0EsTUFBTUEsR0FBR0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEdBLENBQUNBO0lBRURIOzs7Ozs7T0FNR0E7SUFDV0EsOENBQXlCQSxHQUF2Q0EsVUFBd0NBLE9BQXdCQTtRQUUvREksTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLEtBQUtBLHNCQUFzQkEsQ0FBQ0EsVUFBVUE7Z0JBQ3JDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtnQkFDZkEsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0Esc0JBQXNCQSxDQUFDQSxnQkFBZ0JBO2dCQUMzQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7Z0JBQ2ZBLEtBQUtBLENBQUNBO1lBQ1BBO2dCQUNDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUNaQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUNGSiwyQkFBQ0E7QUFBREEsQ0FyRUEsQUFxRUNBLElBQUE7QUFFRCxBQUE4QixpQkFBckIsb0JBQW9CLENBQUMiLCJmaWxlIjoibWF0ZXJpYWxzL3V0aWxzL1NoYWRlckNvbXBpbGVySGVscGVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRleHR1cmVQcm94eUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9UZXh0dXJlUHJveHlCYXNlXCIpO1xuXG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTFRleHR1cmVGb3JtYXRcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJEYXRhXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuXG5jbGFzcyBTaGFkZXJDb21waWxlckhlbHBlclxue1xuXHQvKipcblx0ICogQSBoZWxwZXIgbWV0aG9kIHRoYXQgZ2VuZXJhdGVzIHN0YW5kYXJkIGNvZGUgZm9yIHNhbXBsaW5nIGZyb20gYSB0ZXh0dXJlIHVzaW5nIHRoZSBub3JtYWwgdXYgY29vcmRpbmF0ZXMuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSBzaGFyZWRSZWcgVGhlIHNoYXJlZCByZWdpc3RlciBvYmplY3QgZm9yIHRoZSBzaGFkZXIuXG5cdCAqIEBwYXJhbSBpbnB1dFJlZyBUaGUgdGV4dHVyZSBzdHJlYW0gcmVnaXN0ZXIuXG5cdCAqIEBwYXJhbSB0ZXh0dXJlIFRoZSB0ZXh0dXJlIHdoaWNoIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHNsb3QuXG5cdCAqIEBwYXJhbSB1dlJlZyBBbiBvcHRpb25hbCB1diByZWdpc3RlciBpZiBjb29yZGluYXRlcyBkaWZmZXJlbnQgZnJvbSB0aGUgcHJpbWFyeSB1diBjb29yZGluYXRlcyBhcmUgdG8gYmUgdXNlZC5cblx0ICogQHBhcmFtIGZvcmNlV3JhcCBJZiB0cnVlLCB0ZXh0dXJlIHdyYXBwaW5nIGlzIGVuYWJsZWQgcmVnYXJkbGVzcyBvZiB0aGUgbWF0ZXJpYWwgc2V0dGluZy5cblx0ICogQHJldHVybiBUaGUgZnJhZ21lbnQgY29kZSB0aGF0IHBlcmZvcm1zIHRoZSBzYW1wbGluZy5cblx0ICpcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRUZXgyRFNhbXBsZUNvZGUodGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgc2hhcmVkUmVnOlNoYWRlclJlZ2lzdGVyRGF0YSwgaW5wdXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB0ZXh0dXJlOlRleHR1cmVQcm94eUJhc2UsIHNtb290aDpib29sZWFuLCByZXBlYXQ6Ym9vbGVhbiwgbWlwbWFwczpib29sZWFuLCB1dlJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBudWxsLCBmb3JjZVdyYXA6c3RyaW5nID0gbnVsbCk6c3RyaW5nXG5cdHtcblx0XHR2YXIgd3JhcDpzdHJpbmcgPSBmb3JjZVdyYXAgfHwgKHJlcGVhdD8gXCJ3cmFwXCI6XCJjbGFtcFwiKTtcblx0XHR2YXIgZm9ybWF0OnN0cmluZyA9IFNoYWRlckNvbXBpbGVySGVscGVyLmdldEZvcm1hdFN0cmluZ0ZvclRleHR1cmUodGV4dHVyZSk7XG5cdFx0dmFyIGVuYWJsZU1pcE1hcHM6Ym9vbGVhbiA9IG1pcG1hcHMgJiYgdGV4dHVyZS5oYXNNaXBtYXBzO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gKHNtb290aCk/IChlbmFibGVNaXBNYXBzPyBcImxpbmVhcixtaXBsaW5lYXJcIiA6IFwibGluZWFyXCIpIDogKGVuYWJsZU1pcE1hcHM/IFwibmVhcmVzdCxtaXBuZWFyZXN0XCIgOiBcIm5lYXJlc3RcIik7XG5cblx0XHRpZiAodXZSZWcgPT0gbnVsbClcblx0XHRcdHV2UmVnID0gc2hhcmVkUmVnLnV2VmFyeWluZztcblxuXHRcdHJldHVybiBcInRleCBcIiArIHRhcmdldFJlZyArIFwiLCBcIiArIHV2UmVnICsgXCIsIFwiICsgaW5wdXRSZWcgKyBcIiA8MmQsXCIgKyBmaWx0ZXIgKyBcIixcIiArIGZvcm1hdCArIHdyYXAgKyBcIj5cXG5cIjtcblxuXHR9XG5cblxuXHQvKipcblx0ICogQSBoZWxwZXIgbWV0aG9kIHRoYXQgZ2VuZXJhdGVzIHN0YW5kYXJkIGNvZGUgZm9yIHNhbXBsaW5nIGZyb20gYSBjdWJlIHRleHR1cmUuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSB0YXJnZXRSZWcgVGhlIHJlZ2lzdGVyIGluIHdoaWNoIHRvIHN0b3JlIHRoZSBzYW1wbGVkIGNvbG91ci5cblx0ICogQHBhcmFtIGlucHV0UmVnIFRoZSB0ZXh0dXJlIHN0cmVhbSByZWdpc3Rlci5cblx0ICogQHBhcmFtIHRleHR1cmUgVGhlIGN1YmUgbWFwIHdoaWNoIHdpbGwgYmUgYXNzaWduZWQgdG8gdGhlIGdpdmVuIHNsb3QuXG5cdCAqIEBwYXJhbSB1dlJlZyBUaGUgZGlyZWN0aW9uIHZlY3RvciB3aXRoIHdoaWNoIHRvIHNhbXBsZSB0aGUgY3ViZSBtYXAuXG5cdCAqXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0VGV4Q3ViZVNhbXBsZUNvZGUodGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgaW5wdXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCB0ZXh0dXJlOlRleHR1cmVQcm94eUJhc2UsIHNtb290aDpib29sZWFuLCBtaXBtYXBzOmJvb2xlYW4sIHV2UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCk6c3RyaW5nXG5cdHtcblx0XHR2YXIgZmlsdGVyOnN0cmluZztcblx0XHR2YXIgZm9ybWF0OnN0cmluZyA9IFNoYWRlckNvbXBpbGVySGVscGVyLmdldEZvcm1hdFN0cmluZ0ZvclRleHR1cmUodGV4dHVyZSk7XG5cdFx0dmFyIGVuYWJsZU1pcE1hcHM6Ym9vbGVhbiA9IG1pcG1hcHMgJiYgdGV4dHVyZS5oYXNNaXBtYXBzO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gKHNtb290aCk/IChlbmFibGVNaXBNYXBzPyBcImxpbmVhcixtaXBsaW5lYXJcIiA6IFwibGluZWFyXCIpIDogKGVuYWJsZU1pcE1hcHM/IFwibmVhcmVzdCxtaXBuZWFyZXN0XCIgOiBcIm5lYXJlc3RcIik7XG5cblx0XHRyZXR1cm4gXCJ0ZXggXCIgKyB0YXJnZXRSZWcgKyBcIiwgXCIgKyB1dlJlZyArIFwiLCBcIiArIGlucHV0UmVnICsgXCIgPGN1YmUsXCIgKyBmb3JtYXQgKyBmaWx0ZXIgKyBcIj5cXG5cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgYSB0ZXh0dXJlIGZvcm1hdCBzdHJpbmcgZm9yIHRoZSBzYW1wbGUgaW5zdHJ1Y3Rpb24uXG5cdCAqIEBwYXJhbSB0ZXh0dXJlIFRoZSB0ZXh0dXJlIGZvciB3aGljaCB0byBnZXQgdGhlIGZvcm1hdCBzdHJpbmcuXG5cdCAqIEByZXR1cm5cblx0ICpcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRGb3JtYXRTdHJpbmdGb3JUZXh0dXJlKHRleHR1cmU6VGV4dHVyZVByb3h5QmFzZSk6c3RyaW5nXG5cdHtcblx0XHRzd2l0Y2ggKHRleHR1cmUuZm9ybWF0KSB7XG5cdFx0XHRjYXNlIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQ09NUFJFU1NFRDpcblx0XHRcdFx0cmV0dXJuIFwiZHh0MSxcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIENvbnRleHRHTFRleHR1cmVGb3JtYXQuQ09NUFJFU1NFRF9BTFBIQTpcblx0XHRcdFx0cmV0dXJuIFwiZHh0NSxcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0ID0gU2hhZGVyQ29tcGlsZXJIZWxwZXI7Il19