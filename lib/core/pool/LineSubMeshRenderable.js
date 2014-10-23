var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LineSubGeometry = require("awayjs-display/lib/base/LineSubGeometry");
var RenderableBase = require("awayjs-stagegl/lib/core/pool/RenderableBase");
/**
 * @class away.pool.LineSubMeshRenderable
 */
var LineSubMeshRenderable = (function (_super) {
    __extends(LineSubMeshRenderable, _super);
    /**
     * //TODO
     *
     * @param pool
     * @param subMesh
     * @param level
     * @param dataOffset
     */
    function LineSubMeshRenderable(pool, subMesh, level, indexOffset) {
        if (level === void 0) { level = 0; }
        if (indexOffset === void 0) { indexOffset = 0; }
        _super.call(this, pool, subMesh.parentMesh, subMesh, level, indexOffset);
        this.subMesh = subMesh;
    }
    /**
     * //TODO
     *
     * @returns {base.LineSubGeometry}
     * @protected
     */
    LineSubMeshRenderable.prototype._pGetSubGeometry = function () {
        var subGeometry = this.subMesh.subGeometry;
        this._pVertexDataDirty[LineSubGeometry.START_POSITION_DATA] = true;
        this._pVertexDataDirty[LineSubGeometry.END_POSITION_DATA] = true;
        if (subGeometry.thickness)
            this._pVertexDataDirty[LineSubGeometry.THICKNESS_DATA] = true;
        if (subGeometry.startColors)
            this._pVertexDataDirty[LineSubGeometry.COLOR_DATA] = true;
        return subGeometry;
    };
    /**
     * //TODO
     *
     * @param pool
     * @param materialOwner
     * @param level
     * @param indexOffset
     * @returns {away.pool.LineSubMeshRenderable}
     * @private
     */
    LineSubMeshRenderable.prototype._pGetOverflowRenderable = function (pool, materialOwner, level, indexOffset) {
        return new LineSubMeshRenderable(pool, materialOwner, level, indexOffset);
    };
    /**
     *
     */
    LineSubMeshRenderable.id = "linesubmesh";
    return LineSubMeshRenderable;
})(RenderableBase);
module.exports = LineSubMeshRenderable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3Bvb2wvbGluZXN1Ym1lc2hyZW5kZXJhYmxlLnRzIl0sIm5hbWVzIjpbIkxpbmVTdWJNZXNoUmVuZGVyYWJsZSIsIkxpbmVTdWJNZXNoUmVuZGVyYWJsZS5jb25zdHJ1Y3RvciIsIkxpbmVTdWJNZXNoUmVuZGVyYWJsZS5fcEdldFN1Ykdlb21ldHJ5IiwiTGluZVN1Yk1lc2hSZW5kZXJhYmxlLl9wR2V0T3ZlcmZsb3dSZW5kZXJhYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSxJQUFPLGVBQWUsV0FBYyx5Q0FBeUMsQ0FBQyxDQUFDO0FBSS9FLElBQU8sY0FBYyxXQUFjLDZDQUE2QyxDQUFDLENBQUM7QUFFbEYsQUFHQTs7R0FERztJQUNHLHFCQUFxQjtJQUFTQSxVQUE5QkEscUJBQXFCQSxVQUF1QkE7SUFZakRBOzs7Ozs7O09BT0dBO0lBQ0hBLFNBcEJLQSxxQkFBcUJBLENBb0JkQSxJQUFtQkEsRUFBRUEsT0FBbUJBLEVBQUVBLEtBQWdCQSxFQUFFQSxXQUFzQkE7UUFBeENDLHFCQUFnQkEsR0FBaEJBLFNBQWdCQTtRQUFFQSwyQkFBc0JBLEdBQXRCQSxlQUFzQkE7UUFFN0ZBLGtCQUFNQSxJQUFJQSxFQUFFQSxPQUFPQSxDQUFDQSxVQUFVQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUU3REEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRUREOzs7OztPQUtHQTtJQUNJQSxnREFBZ0JBLEdBQXZCQTtRQUVDRSxJQUFJQSxXQUFXQSxHQUFtQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFFM0RBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuRUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxlQUFlQSxDQUFDQSxpQkFBaUJBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBRWpFQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUN6QkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUUvREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFM0RBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUVERjs7Ozs7Ozs7O09BU0dBO0lBQ0lBLHVEQUF1QkEsR0FBOUJBLFVBQStCQSxJQUFtQkEsRUFBRUEsYUFBNEJBLEVBQUVBLEtBQVlBLEVBQUVBLFdBQWtCQTtRQUVqSEcsTUFBTUEsQ0FBQ0EsSUFBSUEscUJBQXFCQSxDQUFDQSxJQUFJQSxFQUFnQkEsYUFBYUEsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDekZBLENBQUNBO0lBNURESDs7T0FFR0E7SUFDV0Esd0JBQUVBLEdBQVVBLGFBQWFBLENBQUNBO0lBMER6Q0EsNEJBQUNBO0FBQURBLENBL0RBLEFBK0RDQSxFQS9EbUMsY0FBYyxFQStEakQ7QUFFRCxBQUErQixpQkFBdEIscUJBQXFCLENBQUMiLCJmaWxlIjoiY29yZS9wb29sL0xpbmVTdWJNZXNoUmVuZGVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSU1hdGVyaWFsT3duZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0lNYXRlcmlhbE93bmVyXCIpO1xuaW1wb3J0IExpbmVTdWJNZXNoXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0xpbmVTdWJNZXNoXCIpO1xuaW1wb3J0IExpbmVTdWJHZW9tZXRyeVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvTGluZVN1Ykdlb21ldHJ5XCIpO1xuaW1wb3J0IFJlbmRlcmFibGVQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcG9vbC9SZW5kZXJhYmxlUG9vbFwiKTtcbmltcG9ydCBTdWJHZW9tZXRyeUV2ZW50XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZXZlbnRzL1N1Ykdlb21ldHJ5RXZlbnRcIik7XG5cbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcblxuLyoqXG4gKiBAY2xhc3MgYXdheS5wb29sLkxpbmVTdWJNZXNoUmVuZGVyYWJsZVxuICovXG5jbGFzcyBMaW5lU3ViTWVzaFJlbmRlcmFibGUgZXh0ZW5kcyBSZW5kZXJhYmxlQmFzZVxue1xuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaWQ6c3RyaW5nID0gXCJsaW5lc3VibWVzaFwiO1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN1Yk1lc2g6TGluZVN1Yk1lc2g7XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gcG9vbFxuXHQgKiBAcGFyYW0gc3ViTWVzaFxuXHQgKiBAcGFyYW0gbGV2ZWxcblx0ICogQHBhcmFtIGRhdGFPZmZzZXRcblx0ICovXG5cdGNvbnN0cnVjdG9yKHBvb2w6UmVuZGVyYWJsZVBvb2wsIHN1Yk1lc2g6TGluZVN1Yk1lc2gsIGxldmVsOm51bWJlciA9IDAsIGluZGV4T2Zmc2V0Om51bWJlciA9IDApXG5cdHtcblx0XHRzdXBlcihwb29sLCBzdWJNZXNoLnBhcmVudE1lc2gsIHN1Yk1lc2gsIGxldmVsLCBpbmRleE9mZnNldCk7XG5cblx0XHR0aGlzLnN1Yk1lc2ggPSBzdWJNZXNoO1xuXHR9XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcmV0dXJucyB7YmFzZS5MaW5lU3ViR2VvbWV0cnl9XG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHB1YmxpYyBfcEdldFN1Ykdlb21ldHJ5KCk6TGluZVN1Ykdlb21ldHJ5XG5cdHtcblx0XHR2YXIgc3ViR2VvbWV0cnk6TGluZVN1Ykdlb21ldHJ5ID0gdGhpcy5zdWJNZXNoLnN1Ykdlb21ldHJ5O1xuXG5cdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtMaW5lU3ViR2VvbWV0cnkuU1RBUlRfUE9TSVRJT05fREFUQV0gPSB0cnVlO1xuXHRcdHRoaXMuX3BWZXJ0ZXhEYXRhRGlydHlbTGluZVN1Ykdlb21ldHJ5LkVORF9QT1NJVElPTl9EQVRBXSA9IHRydWU7XG5cblx0XHRpZiAoc3ViR2VvbWV0cnkudGhpY2tuZXNzKVxuXHRcdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtMaW5lU3ViR2VvbWV0cnkuVEhJQ0tORVNTX0RBVEFdID0gdHJ1ZTtcblxuXHRcdGlmIChzdWJHZW9tZXRyeS5zdGFydENvbG9ycylcblx0XHRcdHRoaXMuX3BWZXJ0ZXhEYXRhRGlydHlbTGluZVN1Ykdlb21ldHJ5LkNPTE9SX0RBVEFdID0gdHJ1ZTtcblxuXHRcdHJldHVybiBzdWJHZW9tZXRyeTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIHBvb2xcblx0ICogQHBhcmFtIG1hdGVyaWFsT3duZXJcblx0ICogQHBhcmFtIGxldmVsXG5cdCAqIEBwYXJhbSBpbmRleE9mZnNldFxuXHQgKiBAcmV0dXJucyB7YXdheS5wb29sLkxpbmVTdWJNZXNoUmVuZGVyYWJsZX1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBfcEdldE92ZXJmbG93UmVuZGVyYWJsZShwb29sOlJlbmRlcmFibGVQb29sLCBtYXRlcmlhbE93bmVyOklNYXRlcmlhbE93bmVyLCBsZXZlbDpudW1iZXIsIGluZGV4T2Zmc2V0Om51bWJlcik6UmVuZGVyYWJsZUJhc2Vcblx0e1xuXHRcdHJldHVybiBuZXcgTGluZVN1Yk1lc2hSZW5kZXJhYmxlKHBvb2wsIDxMaW5lU3ViTWVzaD4gbWF0ZXJpYWxPd25lciwgbGV2ZWwsIGluZGV4T2Zmc2V0KTtcblx0fVxufVxuXG5leHBvcnQgPSBMaW5lU3ViTWVzaFJlbmRlcmFibGU7Il19