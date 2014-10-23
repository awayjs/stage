var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Texture2DBase = require("awayjs-core/lib/textures/Texture2DBase");
var BlendMode = require("awayjs-display/lib/base/BlendMode");
var ContextGLCompareMode = require("awayjs-stagegl/lib/base/ContextGLCompareMode");
var TriangleBasicPass = require("awayjs-stagegl/lib/materials/passes/TriangleBasicPass");
var TriangleMaterialBase = require("awayjs-stagegl/lib/materials/TriangleMaterialBase");
/**
 * TriangleMaterial forms an abstract base class for the default shaded materials provided by Stage,
 * using material methods to define their appearance.
 */
var TriangleBasicMaterial = (function (_super) {
    __extends(TriangleBasicMaterial, _super);
    function TriangleBasicMaterial(textureColor, smoothAlpha, repeat, mipmap) {
        if (textureColor === void 0) { textureColor = null; }
        if (smoothAlpha === void 0) { smoothAlpha = null; }
        if (repeat === void 0) { repeat = false; }
        if (mipmap === void 0) { mipmap = false; }
        _super.call(this);
        this._alphaBlending = false;
        this._alpha = 1;
        this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
        this._screenPass = new TriangleBasicPass();
        if (textureColor instanceof Texture2DBase) {
            this.texture = textureColor;
            this.smooth = (smoothAlpha == null) ? true : false;
            this.repeat = repeat;
            this.mipmap = mipmap;
        }
        else {
            this.color = textureColor ? Number(textureColor) : 0xCCCCCC;
            this.alpha = (smoothAlpha == null) ? 1 : Number(smoothAlpha);
        }
    }
    Object.defineProperty(TriangleBasicMaterial.prototype, "depthCompareMode", {
        /**
         * The depth compare mode used to render the renderables using this material.
         *
         * @see away.stagegl.ContextGLCompareMode
         */
        get: function () {
            return this._depthCompareMode;
        },
        set: function (value) {
            if (this._depthCompareMode == value)
                return;
            this._depthCompareMode = value;
            this._pInvalidatePasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleBasicMaterial.prototype, "alpha", {
        /**
         * The alpha of the surface.
         */
        get: function () {
            return this._alpha;
        },
        set: function (value) {
            if (value > 1)
                value = 1;
            else if (value < 0)
                value = 0;
            if (this._alpha == value)
                return;
            this._alpha = value;
            this._pInvalidatePasses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TriangleBasicMaterial.prototype, "alphaBlending", {
        /**
         * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
         * example when using textures of foliage, consider using alphaThreshold instead.
         */
        get: function () {
            return this._alphaBlending;
        },
        set: function (value) {
            if (this._alphaBlending == value)
                return;
            this._alphaBlending = value;
            this._pInvalidatePasses();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritDoc
     */
    TriangleBasicMaterial.prototype.iUpdateMaterial = function () {
        var passesInvalid;
        if (this._pScreenPassesInvalid) {
            this.pUpdateScreenPasses();
            passesInvalid = true;
        }
        if (passesInvalid) {
            this._pClearScreenPasses();
            this._pAddScreenPass(this._screenPass);
        }
    };
    /**
     * Updates screen passes when they were found to be invalid.
     */
    TriangleBasicMaterial.prototype.pUpdateScreenPasses = function () {
        this.initPasses();
        this.setBlendAndCompareModes();
        this._pScreenPassesInvalid = false;
    };
    /**
     * Initializes all the passes and their dependent passes.
     */
    TriangleBasicMaterial.prototype.initPasses = function () {
        //
    };
    /**
     * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
     */
    TriangleBasicMaterial.prototype.setBlendAndCompareModes = function () {
        this._pRequiresBlending = (this._pBlendMode != BlendMode.NORMAL || this._alphaBlending || this._alpha < 1);
        this._screenPass.depthCompareMode = this._depthCompareMode;
        this._screenPass.preserveAlpha = this._pRequiresBlending;
        this._screenPass.setBlendMode((this._pBlendMode == BlendMode.NORMAL && this._pRequiresBlending) ? BlendMode.LAYER : this._pBlendMode);
        this._screenPass.forceSeparateMVP = false;
    };
    return TriangleBasicMaterial;
})(TriangleMaterialBase);
module.exports = TriangleBasicMaterial;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvdHJpYW5nbGViYXNpY21hdGVyaWFsLnRzIl0sIm5hbWVzIjpbIlRyaWFuZ2xlQmFzaWNNYXRlcmlhbCIsIlRyaWFuZ2xlQmFzaWNNYXRlcmlhbC5jb25zdHJ1Y3RvciIsIlRyaWFuZ2xlQmFzaWNNYXRlcmlhbC5kZXB0aENvbXBhcmVNb2RlIiwiVHJpYW5nbGVCYXNpY01hdGVyaWFsLmFscGhhIiwiVHJpYW5nbGVCYXNpY01hdGVyaWFsLmFscGhhQmxlbmRpbmciLCJUcmlhbmdsZUJhc2ljTWF0ZXJpYWwuaVVwZGF0ZU1hdGVyaWFsIiwiVHJpYW5nbGVCYXNpY01hdGVyaWFsLnBVcGRhdGVTY3JlZW5QYXNzZXMiLCJUcmlhbmdsZUJhc2ljTWF0ZXJpYWwuaW5pdFBhc3NlcyIsIlRyaWFuZ2xlQmFzaWNNYXRlcmlhbC5zZXRCbGVuZEFuZENvbXBhcmVNb2RlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxhQUFhLFdBQWMsd0NBQXdDLENBQUMsQ0FBQztBQUU1RSxJQUFPLFNBQVMsV0FBZSxtQ0FBbUMsQ0FBQyxDQUFDO0FBRXBFLElBQU8sb0JBQW9CLFdBQWEsOENBQThDLENBQUMsQ0FBQztBQUN4RixJQUFPLGlCQUFpQixXQUFhLHVEQUF1RCxDQUFDLENBQUM7QUFDOUYsSUFBTyxvQkFBb0IsV0FBYSxtREFBbUQsQ0FBQyxDQUFDO0FBRTdGLEFBSUE7OztHQURHO0lBQ0cscUJBQXFCO0lBQVNBLFVBQTlCQSxxQkFBcUJBLFVBQTZCQTtJQW1CdkRBLFNBbkJLQSxxQkFBcUJBLENBbUJkQSxZQUF1QkEsRUFBRUEsV0FBc0JBLEVBQUVBLE1BQXNCQSxFQUFFQSxNQUFzQkE7UUFBL0ZDLDRCQUF1QkEsR0FBdkJBLG1CQUF1QkE7UUFBRUEsMkJBQXNCQSxHQUF0QkEsa0JBQXNCQTtRQUFFQSxzQkFBc0JBLEdBQXRCQSxjQUFzQkE7UUFBRUEsc0JBQXNCQSxHQUF0QkEsY0FBc0JBO1FBRTFHQSxpQkFB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a0JBQWtCQSxDQUFDQTtRQUN6REEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsSUFBSUEsU0FBU0EsQ0FBQ0EsTUFBTUEsSUFBSUEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFFQSxTQUFTQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNySUEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRlIsNEJBQUNBO0FBQURBLENBdEpBLEFBc0pDQSxFQXRKbUMsb0JBQW9CLEVBc0p2RDtBQUVELEFBQStCLGlCQUF0QixxQkFBcUIsQ0FBQyIsImZpbGUiOiJtYXRlcmlhbHMvVHJpYW5nbGVCYXNpY01hdGVyaWFsLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcblxuaW1wb3J0IEJsZW5kTW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5cbmltcG9ydCBDb250ZXh0R0xDb21wYXJlTW9kZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTENvbXBhcmVNb2RlXCIpO1xuaW1wb3J0IFRyaWFuZ2xlQmFzaWNQYXNzXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvVHJpYW5nbGVCYXNpY1Bhc3NcIik7XG5pbXBvcnQgVHJpYW5nbGVNYXRlcmlhbEJhc2VcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1RyaWFuZ2xlTWF0ZXJpYWxCYXNlXCIpO1xuXG4vKipcbiAqIFRyaWFuZ2xlTWF0ZXJpYWwgZm9ybXMgYW4gYWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgdGhlIGRlZmF1bHQgc2hhZGVkIG1hdGVyaWFscyBwcm92aWRlZCBieSBTdGFnZSxcbiAqIHVzaW5nIG1hdGVyaWFsIG1ldGhvZHMgdG8gZGVmaW5lIHRoZWlyIGFwcGVhcmFuY2UuXG4gKi9cbmNsYXNzIFRyaWFuZ2xlQmFzaWNNYXRlcmlhbCBleHRlbmRzIFRyaWFuZ2xlTWF0ZXJpYWxCYXNlXG57XG5cdHByaXZhdGUgX3NjcmVlblBhc3M6VHJpYW5nbGVCYXNpY1Bhc3M7XG5cblx0cHJpdmF0ZSBfYWxwaGFCbGVuZGluZzpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2FscGhhOm51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSBfZGVwdGhDb21wYXJlTW9kZTpzdHJpbmcgPSBDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTX0VRVUFMO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFRyaWFuZ2xlTWF0ZXJpYWwgb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdGV4dHVyZSBUaGUgdGV4dHVyZSB1c2VkIGZvciB0aGUgbWF0ZXJpYWwncyBhbGJlZG8gY29sb3IuXG5cdCAqIEBwYXJhbSBzbW9vdGggSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHRleHR1cmUgc2hvdWxkIGJlIGZpbHRlcmVkIHdoZW4gc2FtcGxlZC4gRGVmYXVsdHMgdG8gdHJ1ZS5cblx0ICogQHBhcmFtIHJlcGVhdCBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdGV4dHVyZSBzaG91bGQgYmUgdGlsZWQgd2hlbiBzYW1wbGVkLiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICogQHBhcmFtIG1pcG1hcCBJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgYW55IHVzZWQgdGV4dHVyZXMgc2hvdWxkIHVzZSBtaXBtYXBwaW5nLiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHRleHR1cmU/OlRleHR1cmUyREJhc2UsIHNtb290aD86Ym9vbGVhbiwgcmVwZWF0Pzpib29sZWFuLCBtaXBtYXA/OmJvb2xlYW4pO1xuXHRjb25zdHJ1Y3Rvcihjb2xvcj86bnVtYmVyLCBhbHBoYT86bnVtYmVyKTtcblx0Y29uc3RydWN0b3IodGV4dHVyZUNvbG9yOmFueSA9IG51bGwsIHNtb290aEFscGhhOmFueSA9IG51bGwsIHJlcGVhdDpib29sZWFuID0gZmFsc2UsIG1pcG1hcDpib29sZWFuID0gZmFsc2UpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fc2NyZWVuUGFzcyA9IG5ldyBUcmlhbmdsZUJhc2ljUGFzcygpO1xuXG5cdFx0aWYgKHRleHR1cmVDb2xvciBpbnN0YW5jZW9mIFRleHR1cmUyREJhc2UpIHtcblx0XHRcdHRoaXMudGV4dHVyZSA9IDxUZXh0dXJlMkRCYXNlPiB0ZXh0dXJlQ29sb3I7XG5cblx0XHRcdHRoaXMuc21vb3RoID0gKHNtb290aEFscGhhID09IG51bGwpPyB0cnVlIDogZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGVhdCA9IHJlcGVhdDtcblx0XHRcdHRoaXMubWlwbWFwID0gbWlwbWFwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbG9yID0gdGV4dHVyZUNvbG9yPyBOdW1iZXIodGV4dHVyZUNvbG9yKSA6IDB4Q0NDQ0NDO1xuXHRcdFx0dGhpcy5hbHBoYSA9IChzbW9vdGhBbHBoYSA9PSBudWxsKT8gMSA6IE51bWJlcihzbW9vdGhBbHBoYSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkZXB0aCBjb21wYXJlIG1vZGUgdXNlZCB0byByZW5kZXIgdGhlIHJlbmRlcmFibGVzIHVzaW5nIHRoaXMgbWF0ZXJpYWwuXG5cdCAqXG5cdCAqIEBzZWUgYXdheS5zdGFnZWdsLkNvbnRleHRHTENvbXBhcmVNb2RlXG5cdCAqL1xuXG5cdHB1YmxpYyBnZXQgZGVwdGhDb21wYXJlTW9kZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RlcHRoQ29tcGFyZU1vZGU7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGRlcHRoQ29tcGFyZU1vZGUodmFsdWU6c3RyaW5nKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2RlcHRoQ29tcGFyZU1vZGUgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9kZXB0aENvbXBhcmVNb2RlID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wSW52YWxpZGF0ZVBhc3NlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhbHBoYSBvZiB0aGUgc3VyZmFjZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYWxwaGEoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9hbHBoYTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYWxwaGEodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHZhbHVlID4gMSlcblx0XHRcdHZhbHVlID0gMTtcblx0XHRlbHNlIGlmICh2YWx1ZSA8IDApXG5cdFx0XHR2YWx1ZSA9IDA7XG5cblx0XHRpZiAodGhpcy5fYWxwaGEgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9hbHBoYSA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdGhlIG1hdGVyaWFsIGhhcyB0cmFuc3BhcmVuY3kuIElmIGJpbmFyeSB0cmFuc3BhcmVuY3kgaXMgc3VmZmljaWVudCwgZm9yXG5cdCAqIGV4YW1wbGUgd2hlbiB1c2luZyB0ZXh0dXJlcyBvZiBmb2xpYWdlLCBjb25zaWRlciB1c2luZyBhbHBoYVRocmVzaG9sZCBpbnN0ZWFkLlxuXHQgKi9cblx0cHVibGljIGdldCBhbHBoYUJsZW5kaW5nKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FscGhhQmxlbmRpbmc7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGFscGhhQmxlbmRpbmcodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9hbHBoYUJsZW5kaW5nID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fYWxwaGFCbGVuZGluZyA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGlVcGRhdGVNYXRlcmlhbCgpXG5cdHtcblx0XHR2YXIgcGFzc2VzSW52YWxpZDpib29sZWFuO1xuXG5cdFx0aWYgKHRoaXMuX3BTY3JlZW5QYXNzZXNJbnZhbGlkKSB7XG5cdFx0XHR0aGlzLnBVcGRhdGVTY3JlZW5QYXNzZXMoKTtcblx0XHRcdHBhc3Nlc0ludmFsaWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChwYXNzZXNJbnZhbGlkKSB7XG5cdFx0XHR0aGlzLl9wQ2xlYXJTY3JlZW5QYXNzZXMoKTtcblxuXHRcdFx0dGhpcy5fcEFkZFNjcmVlblBhc3ModGhpcy5fc2NyZWVuUGFzcyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgc2NyZWVuIHBhc3NlcyB3aGVuIHRoZXkgd2VyZSBmb3VuZCB0byBiZSBpbnZhbGlkLlxuXHQgKi9cblx0cHVibGljIHBVcGRhdGVTY3JlZW5QYXNzZXMoKVxuXHR7XG5cdFx0dGhpcy5pbml0UGFzc2VzKCk7XG5cblx0XHR0aGlzLnNldEJsZW5kQW5kQ29tcGFyZU1vZGVzKCk7XG5cblx0XHR0aGlzLl9wU2NyZWVuUGFzc2VzSW52YWxpZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGFsbCB0aGUgcGFzc2VzIGFuZCB0aGVpciBkZXBlbmRlbnQgcGFzc2VzLlxuXHQgKi9cblx0cHJpdmF0ZSBpbml0UGFzc2VzKClcblx0e1xuXHRcdC8vXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB1cCB0aGUgdmFyaW91cyBibGVuZGluZyBtb2RlcyBmb3IgYWxsIHNjcmVlbiBwYXNzZXMsIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IHRoZXJlIGFyZSBwcmV2aW91cyBwYXNzZXMuXG5cdCAqL1xuXHRwcml2YXRlIHNldEJsZW5kQW5kQ29tcGFyZU1vZGVzKClcblx0e1xuXHRcdHRoaXMuX3BSZXF1aXJlc0JsZW5kaW5nID0gKHRoaXMuX3BCbGVuZE1vZGUgIT0gQmxlbmRNb2RlLk5PUk1BTCB8fCB0aGlzLl9hbHBoYUJsZW5kaW5nIHx8IHRoaXMuX2FscGhhIDwgMSk7XG5cdFx0dGhpcy5fc2NyZWVuUGFzcy5kZXB0aENvbXBhcmVNb2RlID0gdGhpcy5fZGVwdGhDb21wYXJlTW9kZTtcblx0XHR0aGlzLl9zY3JlZW5QYXNzLnByZXNlcnZlQWxwaGEgPSB0aGlzLl9wUmVxdWlyZXNCbGVuZGluZztcblx0XHR0aGlzLl9zY3JlZW5QYXNzLnNldEJsZW5kTW9kZSgodGhpcy5fcEJsZW5kTW9kZSA9PSBCbGVuZE1vZGUuTk9STUFMICYmIHRoaXMuX3BSZXF1aXJlc0JsZW5kaW5nKT8gQmxlbmRNb2RlLkxBWUVSIDogdGhpcy5fcEJsZW5kTW9kZSk7XG5cdFx0dGhpcy5fc2NyZWVuUGFzcy5mb3JjZVNlcGFyYXRlTVZQID0gZmFsc2U7XG5cdH1cbn1cblxuZXhwb3J0ID0gVHJpYW5nbGVCYXNpY01hdGVyaWFsOyJdfQ==