var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssetType = require("awayjs-core/lib/core/library/AssetType");
var ShadingMethodBase = require("awayjs-stagegl/lib/materials/methods/ShadingMethodBase");
/**
 * ShadowMapMethodBase provides an abstract base method for shadow map methods.
 */
var ShadowMapMethodBase = (function (_super) {
    __extends(ShadowMapMethodBase, _super);
    /**
     * Creates a new ShadowMapMethodBase object.
     * @param castingLight The light used to cast shadows.
     */
    function ShadowMapMethodBase(castingLight) {
        _super.call(this);
        this._pEpsilon = .02;
        this._pAlpha = 1;
        this._pCastingLight = castingLight;
        castingLight.castsShadows = true;
        this._pShadowMapper = castingLight.shadowMapper;
    }
    Object.defineProperty(ShadowMapMethodBase.prototype, "assetType", {
        /**
         * @inheritDoc
         */
        get: function () {
            return AssetType.SHADOW_MAP_METHOD;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShadowMapMethodBase.prototype, "alpha", {
        /**
         * The "transparency" of the shadows. This allows making shadows less strong.
         */
        get: function () {
            return this._pAlpha;
        },
        set: function (value) {
            this._pAlpha = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShadowMapMethodBase.prototype, "castingLight", {
        /**
         * The light casting the shadows.
         */
        get: function () {
            return this._pCastingLight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShadowMapMethodBase.prototype, "epsilon", {
        /**
         * A small value to counter floating point precision errors when comparing values in the shadow map with the
         * calculated depth value. Increase this if shadow banding occurs, decrease it if the shadow seems to be too detached.
         */
        get: function () {
            return this._pEpsilon;
        },
        set: function (value) {
            this._pEpsilon = value;
        },
        enumerable: true,
        configurable: true
    });
    return ShadowMapMethodBase;
})(ShadingMethodBase);
module.exports = ShadowMapMethodBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9tZXRob2RzL3NoYWRvd21hcG1ldGhvZGJhc2UudHMiXSwibmFtZXMiOlsiU2hhZG93TWFwTWV0aG9kQmFzZSIsIlNoYWRvd01hcE1ldGhvZEJhc2UuY29uc3RydWN0b3IiLCJTaGFkb3dNYXBNZXRob2RCYXNlLmFzc2V0VHlwZSIsIlNoYWRvd01hcE1ldGhvZEJhc2UuYWxwaGEiLCJTaGFkb3dNYXBNZXRob2RCYXNlLmNhc3RpbmdMaWdodCIsIlNoYWRvd01hcE1ldGhvZEJhc2UuZXBzaWxvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTyxTQUFTLFdBQWUsd0NBQXdDLENBQUMsQ0FBQztBQUl6RSxJQUFPLGlCQUFpQixXQUFhLHdEQUF3RCxDQUFDLENBQUM7QUFFL0YsQUFHQTs7R0FERztJQUNHLG1CQUFtQjtJQUFTQSxVQUE1QkEsbUJBQW1CQSxVQUEwQkE7SUFRbERBOzs7T0FHR0E7SUFDSEEsU0FaS0EsbUJBQW1CQSxDQVlaQSxZQUFzQkE7UUFFakNDLGlCQUFPQSxDQUFDQTtRQVRGQSxjQUFTQSxHQUFVQSxHQUFHQSxDQUFDQTtRQUN2QkEsWUFBT0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFTekJBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLFlBQVlBLENBQUNBO1FBQ25DQSxZQUFZQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsWUFBWUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7SUFFakRBLENBQUNBO0lBS0RELHNCQUFXQSwwQ0FBU0E7UUFIcEJBOztXQUVHQTthQUNIQTtZQUVDRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxpQkFBaUJBLENBQUNBO1FBQ3BDQSxDQUFDQTs7O09BQUFGO0lBS0RBLHNCQUFXQSxzQ0FBS0E7UUFIaEJBOztXQUVHQTthQUNIQTtZQUVDRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7YUFFREgsVUFBaUJBLEtBQVlBO1lBRTVCRyxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7OztPQUxBSDtJQVVEQSxzQkFBV0EsNkNBQVlBO1FBSHZCQTs7V0FFR0E7YUFDSEE7WUFFQ0ksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDNUJBLENBQUNBOzs7T0FBQUo7SUFNREEsc0JBQVdBLHdDQUFPQTtRQUpsQkE7OztXQUdHQTthQUNIQTtZQUVDSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7YUFFREwsVUFBbUJBLEtBQVlBO1lBRTlCSyxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7OztPQUxBTDtJQU1GQSwwQkFBQ0E7QUFBREEsQ0EvREEsQUErRENBLEVBL0RpQyxpQkFBaUIsRUErRGxEO0FBRUQsQUFBNkIsaUJBQXBCLG1CQUFtQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9tZXRob2RzL1NoYWRvd01hcE1ldGhvZEJhc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JvYmJhdGVtYW4vV2Vic3Rvcm1Qcm9qZWN0cy9hd2F5anMtc3RhZ2VnbC8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTGlnaHRCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvTGlnaHRCYXNlXCIpO1xuaW1wb3J0IEFzc2V0VHlwZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L0Fzc2V0VHlwZVwiKTtcbmltcG9ydCBJQXNzZXRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L0lBc3NldFwiKTtcbmltcG9ydCBTaGFkb3dNYXBwZXJCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbWF0ZXJpYWxzL3NoYWRvd21hcHBlcnMvU2hhZG93TWFwcGVyQmFzZVwiKTtcblxuaW1wb3J0IFNoYWRpbmdNZXRob2RCYXNlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NoYWRpbmdNZXRob2RCYXNlXCIpO1xuXG4vKipcbiAqIFNoYWRvd01hcE1ldGhvZEJhc2UgcHJvdmlkZXMgYW4gYWJzdHJhY3QgYmFzZSBtZXRob2QgZm9yIHNoYWRvdyBtYXAgbWV0aG9kcy5cbiAqL1xuY2xhc3MgU2hhZG93TWFwTWV0aG9kQmFzZSBleHRlbmRzIFNoYWRpbmdNZXRob2RCYXNlIGltcGxlbWVudHMgSUFzc2V0XG57XG5cdHB1YmxpYyBfcENhc3RpbmdMaWdodDpMaWdodEJhc2U7XG5cdHB1YmxpYyBfcFNoYWRvd01hcHBlcjpTaGFkb3dNYXBwZXJCYXNlO1xuXG5cdHB1YmxpYyBfcEVwc2lsb246bnVtYmVyID0gLjAyO1xuXHRwdWJsaWMgX3BBbHBoYTpudW1iZXIgPSAxO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFNoYWRvd01hcE1ldGhvZEJhc2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gY2FzdGluZ0xpZ2h0IFRoZSBsaWdodCB1c2VkIHRvIGNhc3Qgc2hhZG93cy5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGNhc3RpbmdMaWdodDpMaWdodEJhc2UpXG5cdHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX3BDYXN0aW5nTGlnaHQgPSBjYXN0aW5nTGlnaHQ7XG5cdFx0Y2FzdGluZ0xpZ2h0LmNhc3RzU2hhZG93cyA9IHRydWU7XG5cdFx0dGhpcy5fcFNoYWRvd01hcHBlciA9IGNhc3RpbmdMaWdodC5zaGFkb3dNYXBwZXI7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGdldCBhc3NldFR5cGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBBc3NldFR5cGUuU0hBRE9XX01BUF9NRVRIT0Q7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIFwidHJhbnNwYXJlbmN5XCIgb2YgdGhlIHNoYWRvd3MuIFRoaXMgYWxsb3dzIG1ha2luZyBzaGFkb3dzIGxlc3Mgc3Ryb25nLlxuXHQgKi9cblx0cHVibGljIGdldCBhbHBoYSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BBbHBoYTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYWxwaGEodmFsdWU6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fcEFscGhhID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGxpZ2h0IGNhc3RpbmcgdGhlIHNoYWRvd3MuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNhc3RpbmdMaWdodCgpOkxpZ2h0QmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BDYXN0aW5nTGlnaHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzbWFsbCB2YWx1ZSB0byBjb3VudGVyIGZsb2F0aW5nIHBvaW50IHByZWNpc2lvbiBlcnJvcnMgd2hlbiBjb21wYXJpbmcgdmFsdWVzIGluIHRoZSBzaGFkb3cgbWFwIHdpdGggdGhlXG5cdCAqIGNhbGN1bGF0ZWQgZGVwdGggdmFsdWUuIEluY3JlYXNlIHRoaXMgaWYgc2hhZG93IGJhbmRpbmcgb2NjdXJzLCBkZWNyZWFzZSBpdCBpZiB0aGUgc2hhZG93IHNlZW1zIHRvIGJlIHRvbyBkZXRhY2hlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgZXBzaWxvbigpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BFcHNpbG9uO1xuXHR9XG5cblx0cHVibGljIHNldCBlcHNpbG9uKHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX3BFcHNpbG9uID0gdmFsdWU7XG5cdH1cbn1cblxuZXhwb3J0ID0gU2hhZG93TWFwTWV0aG9kQmFzZTsiXX0=