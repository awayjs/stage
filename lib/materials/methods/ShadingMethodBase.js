var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NamedAssetBase = require("awayjs-core/lib/library/NamedAssetBase");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9zaGFkaW5nbWV0aG9kYmFzZS50cyJdLCJuYW1lcyI6WyJTaGFkaW5nTWV0aG9kQmFzZSIsIlNoYWRpbmdNZXRob2RCYXNlLmNvbnN0cnVjdG9yIiwiU2hhZGluZ01ldGhvZEJhc2UuaUlzVXNlZCIsIlNoYWRpbmdNZXRob2RCYXNlLmlJbml0Vk8iLCJTaGFkaW5nTWV0aG9kQmFzZS5pSW5pdENvbnN0YW50cyIsIlNoYWRpbmdNZXRob2RCYXNlLmlVc2VzVGFuZ2VudFNwYWNlIiwiU2hhZGluZ01ldGhvZEJhc2UucGFzc2VzIiwiU2hhZGluZ01ldGhvZEJhc2UuZGlzcG9zZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlSZXNldCIsIlNoYWRpbmdNZXRob2RCYXNlLmlDbGVhbkNvbXBpbGF0aW9uRGF0YSIsIlNoYWRpbmdNZXRob2RCYXNlLmlHZXRWZXJ0ZXhDb2RlIiwiU2hhZGluZ01ldGhvZEJhc2UuaUdldEZyYWdtZW50Q29kZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlBY3RpdmF0ZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlTZXRSZW5kZXJTdGF0ZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlEZWFjdGl2YXRlIiwiU2hhZGluZ01ldGhvZEJhc2UuaUludmFsaWRhdGVTaGFkZXJQcm9ncmFtIiwiU2hhZGluZ01ldGhvZEJhc2UuY29weUZyb20iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sY0FBYyxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFNN0UsSUFBTyxrQkFBa0IsV0FBYSw4Q0FBOEMsQ0FBQyxDQUFDO0FBU3RGLEFBSUE7OztHQURHO0lBQ0csaUJBQWlCO0lBQVNBLFVBQTFCQSxpQkFBaUJBLFVBQXVCQTtJQUk3Q0E7O09BRUdBO0lBQ0hBLFNBUEtBLGlCQUFpQkE7UUFTckJDLGlCQUFPQSxDQUFDQTtJQUNUQSxDQUFDQTtJQUVNRCxtQ0FBT0EsR0FBZEEsVUFBZUEsWUFBNkJBO1FBRTNDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVERjs7Ozs7O09BTUdBO0lBQ0lBLG1DQUFPQSxHQUFkQSxVQUFlQSxZQUE2QkEsRUFBRUEsUUFBaUJBO0lBRy9ERyxDQUFDQTtJQUVESDs7Ozs7O09BTUdBO0lBQ0lBLDBDQUFjQSxHQUFyQkEsVUFBc0JBLFlBQTZCQSxFQUFFQSxRQUFpQkE7SUFJdEVJLENBQUNBO0lBRURKOztPQUVHQTtJQUNJQSw2Q0FBaUJBLEdBQXhCQTtRQUVDSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUtETCxzQkFBV0EscUNBQU1BO1FBSGpCQTs7V0FFR0E7YUFDSEE7WUFFQ00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDckJBLENBQUNBOzs7T0FBQU47SUFFREE7O09BRUdBO0lBQ0lBLG1DQUFPQSxHQUFkQTtJQUdBTyxDQUFDQTtJQUVEUDs7OztPQUlHQTtJQUNJQSxrQ0FBTUEsR0FBYkE7UUFFQ1EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFRFI7Ozs7T0FJR0E7SUFDSUEsaURBQXFCQSxHQUE1QkE7SUFFQVMsQ0FBQ0E7SUFFRFQ7Ozs7OztPQU1HQTtJQUNJQSwwQ0FBY0EsR0FBckJBLFVBQXNCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLGFBQWlDQSxFQUFFQSxlQUFrQ0E7UUFFNUlVLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1hBLENBQUNBO0lBRURWOztPQUVHQTtJQUNJQSw0Q0FBZ0JBLEdBQXZCQSxVQUF3QkEsWUFBNkJBLEVBQUVBLFFBQWlCQSxFQUFFQSxTQUErQkEsRUFBRUEsYUFBaUNBLEVBQUVBLGVBQWtDQTtRQUUvS1csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFFRFg7Ozs7Ozs7T0FPR0E7SUFDSUEscUNBQVNBLEdBQWhCQSxVQUFpQkEsWUFBNkJBLEVBQUVBLFFBQWlCQSxFQUFFQSxLQUFXQTtJQUc5RVksQ0FBQ0E7SUFFRFo7Ozs7Ozs7OztPQVNHQTtJQUNJQSwyQ0FBZUEsR0FBdEJBLFVBQXVCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLFVBQXlCQSxFQUFFQSxLQUFXQSxFQUFFQSxNQUFhQTtJQUc5SGEsQ0FBQ0E7SUFFRGI7Ozs7OztPQU1HQTtJQUNJQSx1Q0FBV0EsR0FBbEJBLFVBQW1CQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLEtBQVdBO0lBR2hGYyxDQUFDQTtJQUVEZDs7OztPQUlHQTtJQUNJQSxvREFBd0JBLEdBQS9CQTtRQUVDZSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxrQkFBa0JBLENBQUNBLGtCQUFrQkEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7SUFFRGY7O09BRUdBO0lBQ0lBLG9DQUFRQSxHQUFmQSxVQUFnQkEsTUFBd0JBO0lBRXhDZ0IsQ0FBQ0E7SUFDRmhCLHdCQUFDQTtBQUFEQSxDQWpLQSxBQWlLQ0EsRUFqSytCLGNBQWMsRUFpSzdDO0FBRUQsQUFBMkIsaUJBQWxCLGlCQUFpQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9tZXRob2RzL1NoYWRpbmdNZXRob2RCYXNlLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOYW1lZEFzc2V0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvTmFtZWRBc3NldEJhc2VcIik7XG5cbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBSZW5kZXJhYmxlQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUmVuZGVyYWJsZUJhc2VcIik7XG5pbXBvcnQgU2hhZGluZ01ldGhvZEV2ZW50XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2V2ZW50cy9TaGFkaW5nTWV0aG9kRXZlbnRcIik7XG5pbXBvcnQgTWV0aG9kVk9cdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL01ldGhvZFZPXCIpO1xuaW1wb3J0IFNoYWRlck9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyT2JqZWN0QmFzZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckNhY2hlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJEYXRhXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRWxlbWVudFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRWxlbWVudFwiKTtcbmltcG9ydCBNYXRlcmlhbFBhc3NCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3Bhc3Nlcy9NYXRlcmlhbFBhc3NCYXNlXCIpO1xuXG5cbi8qKlxuICogU2hhZGluZ01ldGhvZEJhc2UgcHJvdmlkZXMgYW4gYWJzdHJhY3QgYmFzZSBtZXRob2QgZm9yIHNoYWRpbmcgbWV0aG9kcywgdXNlZCBieSBjb21waWxlZCBwYXNzZXMgdG8gY29tcGlsZVxuICogdGhlIGZpbmFsIHNoYWRpbmcgcHJvZ3JhbS5cbiAqL1xuY2xhc3MgU2hhZGluZ01ldGhvZEJhc2UgZXh0ZW5kcyBOYW1lZEFzc2V0QmFzZVxue1xuXHRwdWJsaWMgX3Bhc3NlczpBcnJheTxNYXRlcmlhbFBhc3NCYXNlPjsgLy8gc2hvdWxkIGJlIHByb3RlY3RlZFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgU2hhZGluZ01ldGhvZEJhc2Ugb2JqZWN0LlxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdHB1YmxpYyBpSXNVc2VkKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgcHJvcGVydGllcyBmb3IgYSBNZXRob2RWTywgaW5jbHVkaW5nIHJlZ2lzdGVyIGFuZCB0ZXh0dXJlIGluZGljZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2RWTyBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlJbml0Vk8oc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPKVxuXHR7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB1bmNoYW5naW5nIHNoYWRlciBjb25zdGFudHMgdXNpbmcgdGhlIGRhdGEgZnJvbSBhIE1ldGhvZFZPLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0aG9kVk8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpSW5pdENvbnN0YW50cyhzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8pXG5cdHtcblxuXG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHRoaXMgbWV0aG9kIGV4cGVjdHMgbm9ybWFscyBpbiB0YW5nZW50IHNwYWNlLiBPdmVycmlkZSBmb3Igb2JqZWN0LXNwYWNlIG5vcm1hbHMuXG5cdCAqL1xuXHRwdWJsaWMgaVVzZXNUYW5nZW50U3BhY2UoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBbnkgcGFzc2VzIHJlcXVpcmVkIHRoYXQgcmVuZGVyIHRvIGEgdGV4dHVyZSB1c2VkIGJ5IHRoaXMgbWV0aG9kLlxuXHQgKi9cblx0cHVibGljIGdldCBwYXNzZXMoKTpBcnJheTxNYXRlcmlhbFBhc3NCYXNlPlxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Bhc3Nlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhbnMgdXAgYW55IHJlc291cmNlcyB1c2VkIGJ5IHRoZSBjdXJyZW50IG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIHRoZSBjb21waWxhdGlvbiBzdGF0ZSBvZiB0aGUgbWV0aG9kLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpUmVzZXQoKVxuXHR7XG5cdFx0dGhpcy5pQ2xlYW5Db21waWxhdGlvbkRhdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgdGhlIG1ldGhvZCdzIHN0YXRlIGZvciBjb21waWxhdGlvbi5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUNsZWFuQ29tcGlsYXRpb25EYXRhKClcblx0e1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgdmVydGV4IHNoYWRlciBjb2RlIGZvciB0aGlzIG1ldGhvZC5cblx0ICogQHBhcmFtIHZvIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICogQHBhcmFtIHJlZ0NhY2hlIFRoZSByZWdpc3RlciBjYWNoZSB1c2VkIGR1cmluZyB0aGUgY29tcGlsYXRpb24uXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlHZXRWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgaUdldEZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSByZW5kZXIgc3RhdGUgZm9yIHRoaXMgbWV0aG9kLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0aG9kVk8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCBjdXJyZW50bHkgdXNlZCBmb3IgcmVuZGVyaW5nLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpQWN0aXZhdGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCBzdGFnZTpTdGFnZSlcblx0e1xuXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgcmVuZGVyIHN0YXRlIGZvciBhIHNpbmdsZSByZW5kZXJhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdm8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKiBAcGFyYW0gcmVuZGVyYWJsZSBUaGUgcmVuZGVyYWJsZSBjdXJyZW50bHkgYmVpbmcgcmVuZGVyZWQuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IGN1cnJlbnRseSB1c2VkIGZvciByZW5kZXJpbmcuXG5cdCAqIEBwYXJhbSBjYW1lcmEgVGhlIGNhbWVyYSBmcm9tIHdoaWNoIHRoZSBzY2VuZSBpcyBjdXJyZW50bHkgcmVuZGVyZWQuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlTZXRSZW5kZXJTdGF0ZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHJlbmRlcmFibGU6UmVuZGVyYWJsZUJhc2UsIHN0YWdlOlN0YWdlLCBjYW1lcmE6Q2FtZXJhKVxuXHR7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhcnMgdGhlIHJlbmRlciBzdGF0ZSBmb3IgdGhpcyBtZXRob2QuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSBzdGFnZSBUaGUgU3RhZ2Ugb2JqZWN0IGN1cnJlbnRseSB1c2VkIGZvciByZW5kZXJpbmcuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlEZWFjdGl2YXRlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgc3RhZ2U6U3RhZ2UpXG5cdHtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE1hcmtzIHRoZSBzaGFkZXIgcHJvZ3JhbSBhcyBpbnZhbGlkLCBzbyBpdCB3aWxsIGJlIHJlY29tcGlsZWQgYmVmb3JlIHRoZSBuZXh0IHJlbmRlci5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUludmFsaWRhdGVTaGFkZXJQcm9ncmFtKClcblx0e1xuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU2hhZGluZ01ldGhvZEV2ZW50KFNoYWRpbmdNZXRob2RFdmVudC5TSEFERVJfSU5WQUxJREFURUQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb3BpZXMgdGhlIHN0YXRlIGZyb20gYSBTaGFkaW5nTWV0aG9kQmFzZSBvYmplY3QgaW50byB0aGUgY3VycmVudCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgY29weUZyb20obWV0aG9kOlNoYWRpbmdNZXRob2RCYXNlKVxuXHR7XG5cdH1cbn1cblxuZXhwb3J0ID0gU2hhZGluZ01ldGhvZEJhc2U7Il19