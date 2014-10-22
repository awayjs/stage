var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LineSubGeometry = require("awayjs-core/lib/core/base/LineSubGeometry");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvcG9vbC9saW5lc3VibWVzaHJlbmRlcmFibGUudHMiXSwibmFtZXMiOlsiTGluZVN1Yk1lc2hSZW5kZXJhYmxlIiwiTGluZVN1Yk1lc2hSZW5kZXJhYmxlLmNvbnN0cnVjdG9yIiwiTGluZVN1Yk1lc2hSZW5kZXJhYmxlLl9wR2V0U3ViR2VvbWV0cnkiLCJMaW5lU3ViTWVzaFJlbmRlcmFibGUuX3BHZXRPdmVyZmxvd1JlbmRlcmFibGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLElBQU8sZUFBZSxXQUFjLDJDQUEyQyxDQUFDLENBQUM7QUFJakYsSUFBTyxjQUFjLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUVsRixBQUdBOztHQURHO0lBQ0cscUJBQXFCO0lBQVNBLFVBQTlCQSxxQkFBcUJBLFVBQXVCQTtJQVlqREE7Ozs7Ozs7T0FPR0E7SUFDSEEsU0FwQktBLHFCQUFxQkEsQ0FvQmRBLElBQW1CQSxFQUFFQSxPQUFtQkEsRUFBRUEsS0FBZ0JBLEVBQUVBLFdBQXNCQTtRQUF4Q0MscUJBQWdCQSxHQUFoQkEsU0FBZ0JBO1FBQUVBLDJCQUFzQkEsR0FBdEJBLGVBQXNCQTtRQUU3RkEsa0JBQU1BLElBQUlBLEVBQUVBLE9BQU9BLENBQUNBLFVBQVVBLEVBQUVBLE9BQU9BLEVBQUVBLEtBQUtBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBRTdEQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREQ7Ozs7O09BS0dBO0lBQ0lBLGdEQUFnQkEsR0FBdkJBO1FBRUNFLElBQUlBLFdBQVdBLEdBQW1CQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUUzREEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxlQUFlQSxDQUFDQSxtQkFBbUJBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25FQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGVBQWVBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFakVBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBO1lBQ3pCQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBRS9EQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUMzQkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxlQUFlQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUUzREEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBRURGOzs7Ozs7Ozs7T0FTR0E7SUFDSUEsdURBQXVCQSxHQUE5QkEsVUFBK0JBLElBQW1CQSxFQUFFQSxhQUE0QkEsRUFBRUEsS0FBWUEsRUFBRUEsV0FBa0JBO1FBRWpIRyxNQUFNQSxDQUFDQSxJQUFJQSxxQkFBcUJBLENBQUNBLElBQUlBLEVBQWdCQSxhQUFhQSxFQUFFQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUN6RkEsQ0FBQ0E7SUE1RERIOztPQUVHQTtJQUNXQSx3QkFBRUEsR0FBVUEsYUFBYUEsQ0FBQ0E7SUEwRHpDQSw0QkFBQ0E7QUFBREEsQ0EvREEsQUErRENBLEVBL0RtQyxjQUFjLEVBK0RqRDtBQUVELEFBQStCLGlCQUF0QixxQkFBcUIsQ0FBQyIsImZpbGUiOiJjb3JlL3Bvb2wvTGluZVN1Yk1lc2hSZW5kZXJhYmxlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IElNYXRlcmlhbE93bmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL0lNYXRlcmlhbE93bmVyXCIpO1xuaW1wb3J0IExpbmVTdWJNZXNoXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvTGluZVN1Yk1lc2hcIik7XG5pbXBvcnQgTGluZVN1Ykdlb21ldHJ5XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL0xpbmVTdWJHZW9tZXRyeVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlUG9vbFwiKTtcbmltcG9ydCBTdWJHZW9tZXRyeUV2ZW50XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL1N1Ykdlb21ldHJ5RXZlbnRcIik7XG5cbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcblxuLyoqXG4gKiBAY2xhc3MgYXdheS5wb29sLkxpbmVTdWJNZXNoUmVuZGVyYWJsZVxuICovXG5jbGFzcyBMaW5lU3ViTWVzaFJlbmRlcmFibGUgZXh0ZW5kcyBSZW5kZXJhYmxlQmFzZVxue1xuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaWQ6c3RyaW5nID0gXCJsaW5lc3VibWVzaFwiO1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN1Yk1lc2g6TGluZVN1Yk1lc2g7XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gcG9vbFxuXHQgKiBAcGFyYW0gc3ViTWVzaFxuXHQgKiBAcGFyYW0gbGV2ZWxcblx0ICogQHBhcmFtIGRhdGFPZmZzZXRcblx0ICovXG5cdGNvbnN0cnVjdG9yKHBvb2w6UmVuZGVyYWJsZVBvb2wsIHN1Yk1lc2g6TGluZVN1Yk1lc2gsIGxldmVsOm51bWJlciA9IDAsIGluZGV4T2Zmc2V0Om51bWJlciA9IDApXG5cdHtcblx0XHRzdXBlcihwb29sLCBzdWJNZXNoLnBhcmVudE1lc2gsIHN1Yk1lc2gsIGxldmVsLCBpbmRleE9mZnNldCk7XG5cblx0XHR0aGlzLnN1Yk1lc2ggPSBzdWJNZXNoO1xuXHR9XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcmV0dXJucyB7YmFzZS5MaW5lU3ViR2VvbWV0cnl9XG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdHB1YmxpYyBfcEdldFN1Ykdlb21ldHJ5KCk6TGluZVN1Ykdlb21ldHJ5XG5cdHtcblx0XHR2YXIgc3ViR2VvbWV0cnk6TGluZVN1Ykdlb21ldHJ5ID0gdGhpcy5zdWJNZXNoLnN1Ykdlb21ldHJ5O1xuXG5cdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtMaW5lU3ViR2VvbWV0cnkuU1RBUlRfUE9TSVRJT05fREFUQV0gPSB0cnVlO1xuXHRcdHRoaXMuX3BWZXJ0ZXhEYXRhRGlydHlbTGluZVN1Ykdlb21ldHJ5LkVORF9QT1NJVElPTl9EQVRBXSA9IHRydWU7XG5cblx0XHRpZiAoc3ViR2VvbWV0cnkudGhpY2tuZXNzKVxuXHRcdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtMaW5lU3ViR2VvbWV0cnkuVEhJQ0tORVNTX0RBVEFdID0gdHJ1ZTtcblxuXHRcdGlmIChzdWJHZW9tZXRyeS5zdGFydENvbG9ycylcblx0XHRcdHRoaXMuX3BWZXJ0ZXhEYXRhRGlydHlbTGluZVN1Ykdlb21ldHJ5LkNPTE9SX0RBVEFdID0gdHJ1ZTtcblxuXHRcdHJldHVybiBzdWJHZW9tZXRyeTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIHBvb2xcblx0ICogQHBhcmFtIG1hdGVyaWFsT3duZXJcblx0ICogQHBhcmFtIGxldmVsXG5cdCAqIEBwYXJhbSBpbmRleE9mZnNldFxuXHQgKiBAcmV0dXJucyB7YXdheS5wb29sLkxpbmVTdWJNZXNoUmVuZGVyYWJsZX1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyBfcEdldE92ZXJmbG93UmVuZGVyYWJsZShwb29sOlJlbmRlcmFibGVQb29sLCBtYXRlcmlhbE93bmVyOklNYXRlcmlhbE93bmVyLCBsZXZlbDpudW1iZXIsIGluZGV4T2Zmc2V0Om51bWJlcik6UmVuZGVyYWJsZUJhc2Vcblx0e1xuXHRcdHJldHVybiBuZXcgTGluZVN1Yk1lc2hSZW5kZXJhYmxlKHBvb2wsIDxMaW5lU3ViTWVzaD4gbWF0ZXJpYWxPd25lciwgbGV2ZWwsIGluZGV4T2Zmc2V0KTtcblx0fVxufVxuXG5leHBvcnQgPSBMaW5lU3ViTWVzaFJlbmRlcmFibGU7Il19