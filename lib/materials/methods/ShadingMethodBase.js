var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NamedAssetBase = require("awayjs-core/lib/core/library/NamedAssetBase");
var ShadingMethodEvent = require("awayjs-stagegl/lib/events/ShadingMethodEvent");
/**
 * ShadingMethodBase provides an abstract base method for shading methods, used by compiled passes to compile
 * the final shading program.
 */
var ShadingMethodBase = (function (_super) {
    __extends(ShadingMethodBase, _super);
    /**
     * Create a new ShadingMethodBase object.
     */
    function ShadingMethodBase() {
        _super.call(this);
    }
    ShadingMethodBase.prototype.iIsUsed = function (shaderObject) {
        return true;
    };
    /**
     * Initializes the properties for a MethodVO, including register and texture indices.
     *
     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iInitVO = function (shaderObject, methodVO) {
    };
    /**
     * Initializes unchanging shader constants using the data from a MethodVO.
     *
     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iInitConstants = function (shaderObject, methodVO) {
    };
    /**
     * Indicates whether or not this method expects normals in tangent space. Override for object-space normals.
     */
    ShadingMethodBase.prototype.iUsesTangentSpace = function () {
        return true;
    };
    Object.defineProperty(ShadingMethodBase.prototype, "passes", {
        /**
         * Any passes required that render to a texture used by this method.
         */
        get: function () {
            return this._passes;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Cleans up any resources used by the current object.
     */
    ShadingMethodBase.prototype.dispose = function () {
    };
    /**
     * Resets the compilation state of the method.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iReset = function () {
        this.iCleanCompilationData();
    };
    /**
     * Resets the method's state for compilation.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iCleanCompilationData = function () {
    };
    /**
     * Get the vertex shader code for this method.
     * @param vo The MethodVO object linking this method with the pass currently being compiled.
     * @param regCache The register cache used during the compilation.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iGetVertexCode = function (shaderObject, methodVO, registerCache, sharedRegisters) {
        return "";
    };
    /**
     * @inheritDoc
     */
    ShadingMethodBase.prototype.iGetFragmentCode = function (shaderObject, methodVO, targetReg, registerCache, sharedRegisters) {
        return null;
    };
    /**
     * Sets the render state for this method.
     *
     * @param methodVO The MethodVO object linking this method with the pass currently being compiled.
     * @param stage The Stage object currently used for rendering.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iActivate = function (shaderObject, methodVO, stage) {
    };
    /**
     * Sets the render state for a single renderable.
     *
     * @param vo The MethodVO object linking this method with the pass currently being compiled.
     * @param renderable The renderable currently being rendered.
     * @param stage The Stage object currently used for rendering.
     * @param camera The camera from which the scene is currently rendered.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iSetRenderState = function (shaderObject, methodVO, renderable, stage, camera) {
    };
    /**
     * Clears the render state for this method.
     * @param vo The MethodVO object linking this method with the pass currently being compiled.
     * @param stage The Stage object currently used for rendering.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iDeactivate = function (shaderObject, methodVO, stage) {
    };
    /**
     * Marks the shader program as invalid, so it will be recompiled before the next render.
     *
     * @internal
     */
    ShadingMethodBase.prototype.iInvalidateShaderProgram = function () {
        this.dispatchEvent(new ShadingMethodEvent(ShadingMethodEvent.SHADER_INVALIDATED));
    };
    /**
     * Copies the state from a ShadingMethodBase object into the current object.
     */
    ShadingMethodBase.prototype.copyFrom = function (method) {
    };
    return ShadingMethodBase;
})(NamedAssetBase);
module.exports = ShadingMethodBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9tZXRob2RzL3NoYWRpbmdtZXRob2RiYXNlLnRzIl0sIm5hbWVzIjpbIlNoYWRpbmdNZXRob2RCYXNlIiwiU2hhZGluZ01ldGhvZEJhc2UuY29uc3RydWN0b3IiLCJTaGFkaW5nTWV0aG9kQmFzZS5pSXNVc2VkIiwiU2hhZGluZ01ldGhvZEJhc2UuaUluaXRWTyIsIlNoYWRpbmdNZXRob2RCYXNlLmlJbml0Q29uc3RhbnRzIiwiU2hhZGluZ01ldGhvZEJhc2UuaVVzZXNUYW5nZW50U3BhY2UiLCJTaGFkaW5nTWV0aG9kQmFzZS5wYXNzZXMiLCJTaGFkaW5nTWV0aG9kQmFzZS5kaXNwb3NlIiwiU2hhZGluZ01ldGhvZEJhc2UuaVJlc2V0IiwiU2hhZGluZ01ldGhvZEJhc2UuaUNsZWFuQ29tcGlsYXRpb25EYXRhIiwiU2hhZGluZ01ldGhvZEJhc2UuaUdldFZlcnRleENvZGUiLCJTaGFkaW5nTWV0aG9kQmFzZS5pR2V0RnJhZ21lbnRDb2RlIiwiU2hhZGluZ01ldGhvZEJhc2UuaUFjdGl2YXRlIiwiU2hhZGluZ01ldGhvZEJhc2UuaVNldFJlbmRlclN0YXRlIiwiU2hhZGluZ01ldGhvZEJhc2UuaURlYWN0aXZhdGUiLCJTaGFkaW5nTWV0aG9kQmFzZS5pSW52YWxpZGF0ZVNoYWRlclByb2dyYW0iLCJTaGFkaW5nTWV0aG9kQmFzZS5jb3B5RnJvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTyxjQUFjLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUlsRixJQUFPLGtCQUFrQixXQUFhLDhDQUE4QyxDQUFDLENBQUM7QUFTdEYsQUFJQTs7O0dBREc7SUFDRyxpQkFBaUI7SUFBU0EsVUFBMUJBLGlCQUFpQkEsVUFBdUJBO0lBSTdDQTs7T0FFR0E7SUFDSEEsU0FQS0EsaUJBQWlCQTtRQVNyQkMsaUJBQU9BLENBQUNBO0lBQ1RBLENBQUNBO0lBRU1ELG1DQUFPQSxHQUFkQSxVQUFlQSxZQUE2QkE7UUFFM0NFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2JBLENBQUNBO0lBRURGOzs7Ozs7T0FNR0E7SUFDSUEsbUNBQU9BLEdBQWRBLFVBQWVBLFlBQTZCQSxFQUFFQSxRQUFpQkE7SUFHL0RHLENBQUNBO0lBRURIOzs7Ozs7T0FNR0E7SUFDSUEsMENBQWNBLEdBQXJCQSxVQUFzQkEsWUFBNkJBLEVBQUVBLFFBQWlCQTtJQUl0RUksQ0FBQ0E7SUFFREo7O09BRUdBO0lBQ0lBLDZDQUFpQkEsR0FBeEJBO1FBRUNLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2JBLENBQUNBO0lBS0RMLHNCQUFXQSxxQ0FBTUE7UUFIakJBOztXQUVHQTthQUNIQTtZQUVDTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7OztPQUFBTjtJQUVEQTs7T0FFR0E7SUFDSUEsbUNBQU9BLEdBQWRBO0lBR0FPLENBQUNBO0lBRURQOzs7O09BSUdBO0lBQ0lBLGtDQUFNQSxHQUFiQTtRQUVDUSxJQUFJQSxDQUFDQSxxQkFBcUJBLEVBQUVBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUVEUjs7OztPQUlHQTtJQUNJQSxpREFBcUJBLEdBQTVCQTtJQUVBUyxDQUFDQTtJQUVEVDs7Ozs7O09BTUdBO0lBQ0lBLDBDQUFjQSxHQUFyQkEsVUFBc0JBLFlBQTZCQSxFQUFFQSxRQUFpQkEsRUFBRUEsYUFBaUNBLEVBQUVBLGVBQWtDQTtRQUU1SVUsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWEEsQ0FBQ0E7SUFFRFY7O09BRUdBO0lBQ0lBLDRDQUFnQkEsR0FBdkJBLFVBQXdCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLFNBQStCQSxFQUFFQSxhQUFpQ0EsRUFBRUEsZUFBa0NBO1FBRS9LVyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVEWDs7Ozs7OztPQU9HQTtJQUNJQSxxQ0FBU0EsR0FBaEJBLFVBQWlCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLEtBQVdBO0lBRzlFWSxDQUFDQTtJQUVEWjs7Ozs7Ozs7O09BU0dBO0lBQ0lBLDJDQUFlQSxHQUF0QkEsVUFBdUJBLFlBQTZCQSxFQUFFQSxRQUFpQkEsRUFBRUEsVUFBeUJBLEVBQUVBLEtBQVdBLEVBQUVBLE1BQWFBO0lBRzlIYSxDQUFDQTtJQUVEYjs7Ozs7O09BTUdBO0lBQ0lBLHVDQUFXQSxHQUFsQkEsVUFBbUJBLFlBQTZCQSxFQUFFQSxRQUFpQkEsRUFBRUEsS0FBV0E7SUFHaEZjLENBQUNBO0lBRURkOzs7O09BSUdBO0lBQ0lBLG9EQUF3QkEsR0FBL0JBO1FBRUNlLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLGtCQUFrQkEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVEZjs7T0FFR0E7SUFDSUEsb0NBQVFBLEdBQWZBLFVBQWdCQSxNQUF3QkE7SUFFeENnQixDQUFDQTtJQUNGaEIsd0JBQUNBO0FBQURBLENBaktBLEFBaUtDQSxFQWpLK0IsY0FBYyxFQWlLN0M7QUFFRCxBQUEyQixpQkFBbEIsaUJBQWlCLENBQUMiLCJmaWxlIjoibWF0ZXJpYWxzL21ldGhvZHMvU2hhZGluZ01ldGhvZEJhc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JvYmJhdGVtYW4vV2Vic3Rvcm1Qcm9qZWN0cy9hd2F5anMtc3RhZ2VnbC8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IE5hbWVkQXNzZXRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L05hbWVkQXNzZXRCYXNlXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5cbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9SZW5kZXJhYmxlQmFzZVwiKTtcbmltcG9ydCBTaGFkaW5nTWV0aG9kRXZlbnRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1NoYWRpbmdNZXRob2RFdmVudFwiKTtcbmltcG9ydCBNZXRob2RWT1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vTWV0aG9kVk9cIik7XG5pbXBvcnQgU2hhZGVyT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJPYmplY3RCYXNlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyQ2FjaGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyQ2FjaGVcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJEYXRhXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuaW1wb3J0IE1hdGVyaWFsUGFzc0Jhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvcGFzc2VzL01hdGVyaWFsUGFzc0Jhc2VcIik7XG5cblxuLyoqXG4gKiBTaGFkaW5nTWV0aG9kQmFzZSBwcm92aWRlcyBhbiBhYnN0cmFjdCBiYXNlIG1ldGhvZCBmb3Igc2hhZGluZyBtZXRob2RzLCB1c2VkIGJ5IGNvbXBpbGVkIHBhc3NlcyB0byBjb21waWxlXG4gKiB0aGUgZmluYWwgc2hhZGluZyBwcm9ncmFtLlxuICovXG5jbGFzcyBTaGFkaW5nTWV0aG9kQmFzZSBleHRlbmRzIE5hbWVkQXNzZXRCYXNlXG57XG5cdHB1YmxpYyBfcGFzc2VzOkFycmF5PE1hdGVyaWFsUGFzc0Jhc2U+OyAvLyBzaG91bGQgYmUgcHJvdGVjdGVkXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyBTaGFkaW5nTWV0aG9kQmFzZSBvYmplY3QuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0cHVibGljIGlJc1VzZWQoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBwcm9wZXJ0aWVzIGZvciBhIE1ldGhvZFZPLCBpbmNsdWRpbmcgcmVnaXN0ZXIgYW5kIHRleHR1cmUgaW5kaWNlcy5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZFZPIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUluaXRWTyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8pXG5cdHtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHVuY2hhbmdpbmcgc2hhZGVyIGNvbnN0YW50cyB1c2luZyB0aGUgZGF0YSBmcm9tIGEgTWV0aG9kVk8uXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2RWTyBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlJbml0Q29uc3RhbnRzKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTylcblx0e1xuXG5cblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdGhpcyBtZXRob2QgZXhwZWN0cyBub3JtYWxzIGluIHRhbmdlbnQgc3BhY2UuIE92ZXJyaWRlIGZvciBvYmplY3Qtc3BhY2Ugbm9ybWFscy5cblx0ICovXG5cdHB1YmxpYyBpVXNlc1RhbmdlbnRTcGFjZSgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFueSBwYXNzZXMgcmVxdWlyZWQgdGhhdCByZW5kZXIgdG8gYSB0ZXh0dXJlIHVzZWQgYnkgdGhpcyBtZXRob2QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHBhc3NlcygpOkFycmF5PE1hdGVyaWFsUGFzc0Jhc2U+XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcGFzc2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFucyB1cCBhbnkgcmVzb3VyY2VzIHVzZWQgYnkgdGhlIGN1cnJlbnQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgdGhlIGNvbXBpbGF0aW9uIHN0YXRlIG9mIHRoZSBtZXRob2QuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlSZXNldCgpXG5cdHtcblx0XHR0aGlzLmlDbGVhbkNvbXBpbGF0aW9uRGF0YSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyB0aGUgbWV0aG9kJ3Mgc3RhdGUgZm9yIGNvbXBpbGF0aW9uLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpQ2xlYW5Db21waWxhdGlvbkRhdGEoKVxuXHR7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSB2ZXJ0ZXggc2hhZGVyIGNvZGUgZm9yIHRoaXMgbWV0aG9kLlxuXHQgKiBAcGFyYW0gdm8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKiBAcGFyYW0gcmVnQ2FjaGUgVGhlIHJlZ2lzdGVyIGNhY2hlIHVzZWQgZHVyaW5nIHRoZSBjb21waWxhdGlvbi5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUdldFZlcnRleENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBpR2V0RnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgdGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHJlbmRlciBzdGF0ZSBmb3IgdGhpcyBtZXRob2QuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2RWTyBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IGN1cnJlbnRseSB1c2VkIGZvciByZW5kZXJpbmcuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlBY3RpdmF0ZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHN0YWdlOlN0YWdlKVxuXHR7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSByZW5kZXIgc3RhdGUgZm9yIGEgc2luZ2xlIHJlbmRlcmFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSByZW5kZXJhYmxlIFRoZSByZW5kZXJhYmxlIGN1cnJlbnRseSBiZWluZyByZW5kZXJlZC5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgY3VycmVudGx5IHVzZWQgZm9yIHJlbmRlcmluZy5cblx0ICogQHBhcmFtIGNhbWVyYSBUaGUgY2FtZXJhIGZyb20gd2hpY2ggdGhlIHNjZW5lIGlzIGN1cnJlbnRseSByZW5kZXJlZC5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaVNldFJlbmRlclN0YXRlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgcmVuZGVyYWJsZTpSZW5kZXJhYmxlQmFzZSwgc3RhZ2U6U3RhZ2UsIGNhbWVyYTpDYW1lcmEpXG5cdHtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFycyB0aGUgcmVuZGVyIHN0YXRlIGZvciB0aGlzIG1ldGhvZC5cblx0ICogQHBhcmFtIHZvIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgY3VycmVudGx5IHVzZWQgZm9yIHJlbmRlcmluZy5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaURlYWN0aXZhdGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCBzdGFnZTpTdGFnZSlcblx0e1xuXG5cdH1cblxuXHQvKipcblx0ICogTWFya3MgdGhlIHNoYWRlciBwcm9ncmFtIGFzIGludmFsaWQsIHNvIGl0IHdpbGwgYmUgcmVjb21waWxlZCBiZWZvcmUgdGhlIG5leHQgcmVuZGVyLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpSW52YWxpZGF0ZVNoYWRlclByb2dyYW0oKVxuXHR7XG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTaGFkaW5nTWV0aG9kRXZlbnQoU2hhZGluZ01ldGhvZEV2ZW50LlNIQURFUl9JTlZBTElEQVRFRCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvcGllcyB0aGUgc3RhdGUgZnJvbSBhIFNoYWRpbmdNZXRob2RCYXNlIG9iamVjdCBpbnRvIHRoZSBjdXJyZW50IG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBjb3B5RnJvbShtZXRob2Q6U2hhZGluZ01ldGhvZEJhc2UpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBTaGFkaW5nTWV0aG9kQmFzZTsiXX0=