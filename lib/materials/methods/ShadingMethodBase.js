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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9zaGFkaW5nbWV0aG9kYmFzZS50cyJdLCJuYW1lcyI6WyJTaGFkaW5nTWV0aG9kQmFzZSIsIlNoYWRpbmdNZXRob2RCYXNlLmNvbnN0cnVjdG9yIiwiU2hhZGluZ01ldGhvZEJhc2UuaUlzVXNlZCIsIlNoYWRpbmdNZXRob2RCYXNlLmlJbml0Vk8iLCJTaGFkaW5nTWV0aG9kQmFzZS5pSW5pdENvbnN0YW50cyIsIlNoYWRpbmdNZXRob2RCYXNlLmlVc2VzVGFuZ2VudFNwYWNlIiwiU2hhZGluZ01ldGhvZEJhc2UucGFzc2VzIiwiU2hhZGluZ01ldGhvZEJhc2UuZGlzcG9zZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlSZXNldCIsIlNoYWRpbmdNZXRob2RCYXNlLmlDbGVhbkNvbXBpbGF0aW9uRGF0YSIsIlNoYWRpbmdNZXRob2RCYXNlLmlHZXRWZXJ0ZXhDb2RlIiwiU2hhZGluZ01ldGhvZEJhc2UuaUdldEZyYWdtZW50Q29kZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlBY3RpdmF0ZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlTZXRSZW5kZXJTdGF0ZSIsIlNoYWRpbmdNZXRob2RCYXNlLmlEZWFjdGl2YXRlIiwiU2hhZGluZ01ldGhvZEJhc2UuaUludmFsaWRhdGVTaGFkZXJQcm9ncmFtIiwiU2hhZGluZ01ldGhvZEJhc2UuY29weUZyb20iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sY0FBYyxXQUFjLHdDQUF3QyxDQUFDLENBQUM7QUFNN0UsSUFBTyxrQkFBa0IsV0FBYSw4Q0FBOEMsQ0FBQyxDQUFDO0FBU3RGLEFBSUE7OztHQURHO0lBQ0csaUJBQWlCO0lBQVNBLFVBQTFCQSxpQkFBaUJBLFVBQXVCQTtJQUk3Q0E7O09BRUdBO0lBQ0hBLFNBUEtBLGlCQUFpQkE7UUFTckJDLGlCQUFPQSxDQUFDQTtJQUNUQSxDQUFDQTtJQUVNRCxtQ0FBT0EsR0FBZEEsVUFBZUEsWUFBNkJBO1FBRTNDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVERjs7Ozs7O09BTUdBO0lBQ0lBLG1DQUFPQSxHQUFkQSxVQUFlQSxZQUE2QkEsRUFBRUEsUUFBaUJBO0lBRy9ERyxDQUFDQTtJQUVESDs7Ozs7O09BTUdBO0lBQ0lBLDBDQUFjQSxHQUFyQkEsVUFBc0JBLFlBQTZCQSxFQUFFQSxRQUFpQkE7SUFJdEVJLENBQUNBO0lBRURKOztPQUVHQTtJQUNJQSw2Q0FBaUJBLEdBQXhCQTtRQUVDSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUtETCxzQkFBV0EscUNBQU1BO1FBSGpCQTs7V0FFR0E7YUFDSEE7WUFFQ00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDckJBLENBQUNBOzs7T0FBQU47SUFFREE7O09BRUdBO0lBQ0lBLG1DQUFPQSxHQUFkQTtJQUdBTyxDQUFDQTtJQUVEUDs7OztPQUlHQTtJQUNJQSxrQ0FBTUEsR0FBYkE7UUFFQ1EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFRFI7Ozs7T0FJR0E7SUFDSUEsaURBQXFCQSxHQUE1QkE7SUFFQVMsQ0FBQ0E7SUFFRFQ7Ozs7OztPQU1HQTtJQUNJQSwwQ0FBY0EsR0FBckJBLFVBQXNCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLGFBQWlDQSxFQUFFQSxlQUFrQ0E7UUFFNUlVLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1hBLENBQUNBO0lBRURWOztPQUVHQTtJQUNJQSw0Q0FBZ0JBLEdBQXZCQSxVQUF3QkEsWUFBNkJBLEVBQUVBLFFBQWlCQSxFQUFFQSxTQUErQkEsRUFBRUEsYUFBaUNBLEVBQUVBLGVBQWtDQTtRQUUvS1csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFFRFg7Ozs7Ozs7T0FPR0E7SUFDSUEscUNBQVNBLEdBQWhCQSxVQUFpQkEsWUFBNkJBLEVBQUVBLFFBQWlCQSxFQUFFQSxLQUFXQTtJQUc5RVksQ0FBQ0E7SUFFRFo7Ozs7Ozs7OztPQVNHQTtJQUNJQSwyQ0FBZUEsR0FBdEJBLFVBQXVCQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLFVBQXlCQSxFQUFFQSxLQUFXQSxFQUFFQSxNQUFhQTtJQUc5SGEsQ0FBQ0E7SUFFRGI7Ozs7OztPQU1HQTtJQUNJQSx1Q0FBV0EsR0FBbEJBLFVBQW1CQSxZQUE2QkEsRUFBRUEsUUFBaUJBLEVBQUVBLEtBQVdBO0lBR2hGYyxDQUFDQTtJQUVEZDs7OztPQUlHQTtJQUNJQSxvREFBd0JBLEdBQS9CQTtRQUVDZSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxrQkFBa0JBLENBQUNBLGtCQUFrQkEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7SUFFRGY7O09BRUdBO0lBQ0lBLG9DQUFRQSxHQUFmQSxVQUFnQkEsTUFBd0JBO0lBRXhDZ0IsQ0FBQ0E7SUFDRmhCLHdCQUFDQTtBQUFEQSxDQWpLQSxBQWlLQ0EsRUFqSytCLGNBQWMsRUFpSzdDO0FBRUQsQUFBMkIsaUJBQWxCLGlCQUFpQixDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9tZXRob2RzL1NoYWRpbmdNZXRob2RCYXNlLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOYW1lZEFzc2V0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvTmFtZWRBc3NldEJhc2VcIik7XG5cbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1JlbmRlcmFibGVCYXNlXCIpO1xuaW1wb3J0IFNoYWRpbmdNZXRob2RFdmVudFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9ldmVudHMvU2hhZGluZ01ldGhvZEV2ZW50XCIpO1xuaW1wb3J0IE1ldGhvZFZPXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9NZXRob2RWT1wiKTtcbmltcG9ydCBTaGFkZXJPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJDYWNoZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJDYWNoZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckRhdGFcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRGF0YVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckVsZW1lbnRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckVsZW1lbnRcIik7XG5pbXBvcnQgTWF0ZXJpYWxQYXNzQmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9wYXNzZXMvTWF0ZXJpYWxQYXNzQmFzZVwiKTtcblxuXG4vKipcbiAqIFNoYWRpbmdNZXRob2RCYXNlIHByb3ZpZGVzIGFuIGFic3RyYWN0IGJhc2UgbWV0aG9kIGZvciBzaGFkaW5nIG1ldGhvZHMsIHVzZWQgYnkgY29tcGlsZWQgcGFzc2VzIHRvIGNvbXBpbGVcbiAqIHRoZSBmaW5hbCBzaGFkaW5nIHByb2dyYW0uXG4gKi9cbmNsYXNzIFNoYWRpbmdNZXRob2RCYXNlIGV4dGVuZHMgTmFtZWRBc3NldEJhc2Vcbntcblx0cHVibGljIF9wYXNzZXM6QXJyYXk8TWF0ZXJpYWxQYXNzQmFzZT47IC8vIHNob3VsZCBiZSBwcm90ZWN0ZWRcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbmV3IFNoYWRpbmdNZXRob2RCYXNlIG9iamVjdC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHN1cGVyKCk7XG5cdH1cblxuXHRwdWJsaWMgaUlzVXNlZChzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIHByb3BlcnRpZXMgZm9yIGEgTWV0aG9kVk8sIGluY2x1ZGluZyByZWdpc3RlciBhbmQgdGV4dHVyZSBpbmRpY2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0aG9kVk8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpSW5pdFZPKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTylcblx0e1xuXG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdW5jaGFuZ2luZyBzaGFkZXIgY29uc3RhbnRzIHVzaW5nIHRoZSBkYXRhIGZyb20gYSBNZXRob2RWTy5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZFZPIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUluaXRDb25zdGFudHMoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPKVxuXHR7XG5cblxuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB0aGlzIG1ldGhvZCBleHBlY3RzIG5vcm1hbHMgaW4gdGFuZ2VudCBzcGFjZS4gT3ZlcnJpZGUgZm9yIG9iamVjdC1zcGFjZSBub3JtYWxzLlxuXHQgKi9cblx0cHVibGljIGlVc2VzVGFuZ2VudFNwYWNlKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogQW55IHBhc3NlcyByZXF1aXJlZCB0aGF0IHJlbmRlciB0byBhIHRleHR1cmUgdXNlZCBieSB0aGlzIG1ldGhvZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgcGFzc2VzKCk6QXJyYXk8TWF0ZXJpYWxQYXNzQmFzZT5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9wYXNzZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW5zIHVwIGFueSByZXNvdXJjZXMgdXNlZCBieSB0aGUgY3VycmVudCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyB0aGUgY29tcGlsYXRpb24gc3RhdGUgb2YgdGhlIG1ldGhvZC5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaVJlc2V0KClcblx0e1xuXHRcdHRoaXMuaUNsZWFuQ29tcGlsYXRpb25EYXRhKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIHRoZSBtZXRob2QncyBzdGF0ZSBmb3IgY29tcGlsYXRpb24uXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlDbGVhbkNvbXBpbGF0aW9uRGF0YSgpXG5cdHtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHZlcnRleCBzaGFkZXIgY29kZSBmb3IgdGhpcyBtZXRob2QuXG5cdCAqIEBwYXJhbSB2byBUaGUgTWV0aG9kVk8gb2JqZWN0IGxpbmtpbmcgdGhpcyBtZXRob2Qgd2l0aCB0aGUgcGFzcyBjdXJyZW50bHkgYmVpbmcgY29tcGlsZWQuXG5cdCAqIEBwYXJhbSByZWdDYWNoZSBUaGUgcmVnaXN0ZXIgY2FjaGUgdXNlZCBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpR2V0VmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHJlZ2lzdGVyQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGlHZXRGcmFnbWVudENvZGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCB0YXJnZXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgcmVuZGVyIHN0YXRlIGZvciB0aGlzIG1ldGhvZC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZFZPIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICogQHBhcmFtIHN0YWdlIFRoZSBTdGFnZSBvYmplY3QgY3VycmVudGx5IHVzZWQgZm9yIHJlbmRlcmluZy5cblx0ICpcblx0ICogQGludGVybmFsXG5cdCAqL1xuXHRwdWJsaWMgaUFjdGl2YXRlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgc3RhZ2U6U3RhZ2UpXG5cdHtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHJlbmRlciBzdGF0ZSBmb3IgYSBzaW5nbGUgcmVuZGVyYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHZvIFRoZSBNZXRob2RWTyBvYmplY3QgbGlua2luZyB0aGlzIG1ldGhvZCB3aXRoIHRoZSBwYXNzIGN1cnJlbnRseSBiZWluZyBjb21waWxlZC5cblx0ICogQHBhcmFtIHJlbmRlcmFibGUgVGhlIHJlbmRlcmFibGUgY3VycmVudGx5IGJlaW5nIHJlbmRlcmVkLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCBjdXJyZW50bHkgdXNlZCBmb3IgcmVuZGVyaW5nLlxuXHQgKiBAcGFyYW0gY2FtZXJhIFRoZSBjYW1lcmEgZnJvbSB3aGljaCB0aGUgc2NlbmUgaXMgY3VycmVudGx5IHJlbmRlcmVkLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpU2V0UmVuZGVyU3RhdGUoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCByZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSlcblx0e1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXJzIHRoZSByZW5kZXIgc3RhdGUgZm9yIHRoaXMgbWV0aG9kLlxuXHQgKiBAcGFyYW0gdm8gVGhlIE1ldGhvZFZPIG9iamVjdCBsaW5raW5nIHRoaXMgbWV0aG9kIHdpdGggdGhlIHBhc3MgY3VycmVudGx5IGJlaW5nIGNvbXBpbGVkLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCBjdXJyZW50bHkgdXNlZCBmb3IgcmVuZGVyaW5nLlxuXHQgKlxuXHQgKiBAaW50ZXJuYWxcblx0ICovXG5cdHB1YmxpYyBpRGVhY3RpdmF0ZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHN0YWdlOlN0YWdlKVxuXHR7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBNYXJrcyB0aGUgc2hhZGVyIHByb2dyYW0gYXMgaW52YWxpZCwgc28gaXQgd2lsbCBiZSByZWNvbXBpbGVkIGJlZm9yZSB0aGUgbmV4dCByZW5kZXIuXG5cdCAqXG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIGlJbnZhbGlkYXRlU2hhZGVyUHJvZ3JhbSgpXG5cdHtcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFNoYWRpbmdNZXRob2RFdmVudChTaGFkaW5nTWV0aG9kRXZlbnQuU0hBREVSX0lOVkFMSURBVEVEKSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29waWVzIHRoZSBzdGF0ZSBmcm9tIGEgU2hhZGluZ01ldGhvZEJhc2Ugb2JqZWN0IGludG8gdGhlIGN1cnJlbnQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGNvcHlGcm9tKG1ldGhvZDpTaGFkaW5nTWV0aG9kQmFzZSlcblx0e1xuXHR9XG59XG5cbmV4cG9ydCA9IFNoYWRpbmdNZXRob2RCYXNlOyJdfQ==