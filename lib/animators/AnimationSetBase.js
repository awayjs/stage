var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssetType = require("awayjs-core/lib/core/library/AssetType");
var NamedAssetBase = require("awayjs-core/lib/core/library/NamedAssetBase");
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var AnimationSetError = require("awayjs-stagegl/lib/errors/AnimationSetError");
/**
 * Provides an abstract base class for data set classes that hold animation data for use in animator classes.
 *
 * @see away.animators.AnimatorBase
 */
var AnimationSetBase = (function (_super) {
    __extends(AnimationSetBase, _super);
    function AnimationSetBase() {
        _super.call(this);
        this._animations = new Array();
        this._animationNames = new Array();
        this._animationDictionary = new Object();
    }
    /**
     * Retrieves a temporary GPU register that's still free.
     *
     * @param exclude An array of non-free temporary registers.
     * @param excludeAnother An additional register that's not free.
     * @return A temporary register that can be used.
     */
    AnimationSetBase.prototype._pFindTempReg = function (exclude, excludeAnother) {
        if (excludeAnother === void 0) { excludeAnother = null; }
        var i = 0;
        var reg;
        while (true) {
            reg = "vt" + i;
            if (exclude.indexOf(reg) == -1 && excludeAnother != reg)
                return reg;
            ++i;
        }
        // can't be reached
        return null;
    };
    Object.defineProperty(AnimationSetBase.prototype, "usesCPU", {
        /**
         * Indicates whether the properties of the animation data contained within the set combined with
         * the vertex registers already in use on shading materials allows the animation data to utilise
         * GPU calls.
         */
        get: function () {
            return this._usesCPU;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Called by the material to reset the GPU indicator before testing whether register space in the shader
     * is available for running GPU-based animation code.
     *
     * @private
     */
    AnimationSetBase.prototype.resetGPUCompatibility = function () {
        this._usesCPU = false;
    };
    AnimationSetBase.prototype.cancelGPUCompatibility = function () {
        this._usesCPU = true;
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.getAGALVertexCode = function (shaderObject) {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.activate = function (shaderObject, stage) {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.deactivate = function (shaderObject, stage) {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.getAGALFragmentCode = function (shaderObject, shadedTarget) {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.getAGALUVCode = function (shaderObject) {
        throw new AbstractMethodError();
    };
    /**
     * @inheritDoc
     */
    AnimationSetBase.prototype.doneAGALCode = function (shaderObject) {
        throw new AbstractMethodError();
    };
    Object.defineProperty(AnimationSetBase.prototype, "assetType", {
        /**
         * @inheritDoc
         */
        get: function () {
            return AssetType.ANIMATION_SET;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationSetBase.prototype, "animations", {
        /**
         * Returns a vector of animation state objects that make up the contents of the animation data set.
         */
        get: function () {
            return this._animations;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationSetBase.prototype, "animationNames", {
        /**
         * Returns a vector of animation state objects that make up the contents of the animation data set.
         */
        get: function () {
            return this._animationNames;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check to determine whether a state is registered in the animation set under the given name.
     *
     * @param stateName The name of the animation state object to be checked.
     */
    AnimationSetBase.prototype.hasAnimation = function (name) {
        return this._animationDictionary[name] != null;
    };
    /**
     * Retrieves the animation state object registered in the animation data set under the given name.
     *
     * @param stateName The name of the animation state object to be retrieved.
     */
    AnimationSetBase.prototype.getAnimation = function (name) {
        return this._animationDictionary[name];
    };
    /**
     * Adds an animation state object to the aniamtion data set under the given name.
     *
     * @param stateName The name under which the animation state object will be stored.
     * @param animationState The animation state object to be staored in the set.
     */
    AnimationSetBase.prototype.addAnimation = function (node) {
        if (this._animationDictionary[node.name])
            throw new AnimationSetError("root node name '" + node.name + "' already exists in the set");
        this._animationDictionary[node.name] = node;
        this._animations.push(node);
        this._animationNames.push(node.name);
    };
    /**
     * Cleans up any resources used by the current object.
     */
    AnimationSetBase.prototype.dispose = function () {
    };
    return AnimationSetBase;
})(NamedAssetBase);
module.exports = AnimationSetBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdG9ycy9hbmltYXRpb25zZXRiYXNlLnRzIl0sIm5hbWVzIjpbIkFuaW1hdGlvblNldEJhc2UiLCJBbmltYXRpb25TZXRCYXNlLmNvbnN0cnVjdG9yIiwiQW5pbWF0aW9uU2V0QmFzZS5fcEZpbmRUZW1wUmVnIiwiQW5pbWF0aW9uU2V0QmFzZS51c2VzQ1BVIiwiQW5pbWF0aW9uU2V0QmFzZS5yZXNldEdQVUNvbXBhdGliaWxpdHkiLCJBbmltYXRpb25TZXRCYXNlLmNhbmNlbEdQVUNvbXBhdGliaWxpdHkiLCJBbmltYXRpb25TZXRCYXNlLmdldEFHQUxWZXJ0ZXhDb2RlIiwiQW5pbWF0aW9uU2V0QmFzZS5hY3RpdmF0ZSIsIkFuaW1hdGlvblNldEJhc2UuZGVhY3RpdmF0ZSIsIkFuaW1hdGlvblNldEJhc2UuZ2V0QUdBTEZyYWdtZW50Q29kZSIsIkFuaW1hdGlvblNldEJhc2UuZ2V0QUdBTFVWQ29kZSIsIkFuaW1hdGlvblNldEJhc2UuZG9uZUFHQUxDb2RlIiwiQW5pbWF0aW9uU2V0QmFzZS5hc3NldFR5cGUiLCJBbmltYXRpb25TZXRCYXNlLmFuaW1hdGlvbnMiLCJBbmltYXRpb25TZXRCYXNlLmFuaW1hdGlvbk5hbWVzIiwiQW5pbWF0aW9uU2V0QmFzZS5oYXNBbmltYXRpb24iLCJBbmltYXRpb25TZXRCYXNlLmdldEFuaW1hdGlvbiIsIkFuaW1hdGlvblNldEJhc2UuYWRkQW5pbWF0aW9uIiwiQW5pbWF0aW9uU2V0QmFzZS5kaXNwb3NlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSxJQUFPLFNBQVMsV0FBZSx3Q0FBd0MsQ0FBQyxDQUFDO0FBRXpFLElBQU8sY0FBYyxXQUFjLDZDQUE2QyxDQUFDLENBQUM7QUFDbEYsSUFBTyxtQkFBbUIsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBSXJGLElBQU8saUJBQWlCLFdBQWEsNkNBQTZDLENBQUMsQ0FBQztBQUVwRixBQUtBOzs7O0dBREc7SUFDRyxnQkFBZ0I7SUFBU0EsVUFBekJBLGdCQUFnQkEs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LGdCQUFnQixDQUFDIiwiZmlsZSI6ImFuaW1hdG9ycy9BbmltYXRpb25TZXRCYXNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9yb2JiYXRlbWFuL1dlYnN0b3JtUHJvamVjdHMvYXdheWpzLXN0YWdlZ2wvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFuaW1hdGlvbk5vZGVCYXNlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2FuaW1hdG9ycy9ub2Rlcy9BbmltYXRpb25Ob2RlQmFzZVwiKTtcbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IElBc3NldFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2xpYnJhcnkvSUFzc2V0XCIpO1xuaW1wb3J0IE5hbWVkQXNzZXRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L05hbWVkQXNzZXRCYXNlXCIpO1xuaW1wb3J0IEFic3RyYWN0TWV0aG9kRXJyb3JcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXJyb3JzL0Fic3RyYWN0TWV0aG9kRXJyb3JcIik7XG5cbmltcG9ydCBTaGFkZXJPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuaW1wb3J0IEFuaW1hdGlvblNldEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Vycm9ycy9BbmltYXRpb25TZXRFcnJvclwiKTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBhYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBkYXRhIHNldCBjbGFzc2VzIHRoYXQgaG9sZCBhbmltYXRpb24gZGF0YSBmb3IgdXNlIGluIGFuaW1hdG9yIGNsYXNzZXMuXG4gKlxuICogQHNlZSBhd2F5LmFuaW1hdG9ycy5BbmltYXRvckJhc2VcbiAqL1xuY2xhc3MgQW5pbWF0aW9uU2V0QmFzZSBleHRlbmRzIE5hbWVkQXNzZXRCYXNlIGltcGxlbWVudHMgSUFzc2V0XG57XG5cdHByaXZhdGUgX3VzZXNDUFU6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYW5pbWF0aW9uczpBcnJheTxBbmltYXRpb25Ob2RlQmFzZT4gPSBuZXcgQXJyYXk8QW5pbWF0aW9uTm9kZUJhc2U+KCk7XG5cdHByaXZhdGUgX2FuaW1hdGlvbk5hbWVzOkFycmF5PHN0cmluZz4gPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuXHRwcml2YXRlIF9hbmltYXRpb25EaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyBhIHRlbXBvcmFyeSBHUFUgcmVnaXN0ZXIgdGhhdCdzIHN0aWxsIGZyZWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBleGNsdWRlIEFuIGFycmF5IG9mIG5vbi1mcmVlIHRlbXBvcmFyeSByZWdpc3RlcnMuXG5cdCAqIEBwYXJhbSBleGNsdWRlQW5vdGhlciBBbiBhZGRpdGlvbmFsIHJlZ2lzdGVyIHRoYXQncyBub3QgZnJlZS5cblx0ICogQHJldHVybiBBIHRlbXBvcmFyeSByZWdpc3RlciB0aGF0IGNhbiBiZSB1c2VkLlxuXHQgKi9cblx0cHVibGljIF9wRmluZFRlbXBSZWcoZXhjbHVkZTpBcnJheTxzdHJpbmc+LCBleGNsdWRlQW5vdGhlcjpzdHJpbmcgPSBudWxsKTpzdHJpbmdcblx0e1xuXHRcdHZhciBpOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdFx0dmFyIHJlZzpzdHJpbmc7XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0cmVnID0gXCJ2dFwiICsgaTtcblx0XHRcdGlmIChleGNsdWRlLmluZGV4T2YocmVnKSA9PSAtMSAmJiBleGNsdWRlQW5vdGhlciAhPSByZWcpXG5cdFx0XHRcdHJldHVybiByZWc7XG5cdFx0XHQrK2k7XG5cdFx0fVxuXG5cdFx0Ly8gY2FuJ3QgYmUgcmVhY2hlZFxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBhbmltYXRpb24gZGF0YSBjb250YWluZWQgd2l0aGluIHRoZSBzZXQgY29tYmluZWQgd2l0aFxuXHQgKiB0aGUgdmVydGV4IHJlZ2lzdGVycyBhbHJlYWR5IGluIHVzZSBvbiBzaGFkaW5nIG1hdGVyaWFscyBhbGxvd3MgdGhlIGFuaW1hdGlvbiBkYXRhIHRvIHV0aWxpc2Vcblx0ICogR1BVIGNhbGxzLlxuXHQgKi9cblx0cHVibGljIGdldCB1c2VzQ1BVKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNDUFU7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIGJ5IHRoZSBtYXRlcmlhbCB0byByZXNldCB0aGUgR1BVIGluZGljYXRvciBiZWZvcmUgdGVzdGluZyB3aGV0aGVyIHJlZ2lzdGVyIHNwYWNlIGluIHRoZSBzaGFkZXJcblx0ICogaXMgYXZhaWxhYmxlIGZvciBydW5uaW5nIEdQVS1iYXNlZCBhbmltYXRpb24gY29kZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHB1YmxpYyByZXNldEdQVUNvbXBhdGliaWxpdHkoKVxuXHR7XG5cdFx0dGhpcy5fdXNlc0NQVSA9IGZhbHNlO1xuXHR9XG5cblx0cHVibGljIGNhbmNlbEdQVUNvbXBhdGliaWxpdHkoKVxuXHR7XG5cdFx0dGhpcy5fdXNlc0NQVSA9IHRydWU7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGdldEFHQUxWZXJ0ZXhDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKTpzdHJpbmdcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBhY3RpdmF0ZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZGVhY3RpdmF0ZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZ2V0QUdBTEZyYWdtZW50Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgc2hhZGVkVGFyZ2V0OnN0cmluZyk6c3RyaW5nXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZ2V0QUdBTFVWQ29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSk6c3RyaW5nXG5cdHtcblx0XHR0aHJvdyBuZXcgQWJzdHJhY3RNZXRob2RFcnJvcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZG9uZUFHQUxDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIGdldCBhc3NldFR5cGUoKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBBc3NldFR5cGUuQU5JTUFUSU9OX1NFVDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgdmVjdG9yIG9mIGFuaW1hdGlvbiBzdGF0ZSBvYmplY3RzIHRoYXQgbWFrZSB1cCB0aGUgY29udGVudHMgb2YgdGhlIGFuaW1hdGlvbiBkYXRhIHNldC5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW5pbWF0aW9ucygpOkFycmF5PEFuaW1hdGlvbk5vZGVCYXNlPlxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FuaW1hdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHZlY3RvciBvZiBhbmltYXRpb24gc3RhdGUgb2JqZWN0cyB0aGF0IG1ha2UgdXAgdGhlIGNvbnRlbnRzIG9mIHRoZSBhbmltYXRpb24gZGF0YSBzZXQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGFuaW1hdGlvbk5hbWVzKCk6QXJyYXk8c3RyaW5nPlxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FuaW1hdGlvbk5hbWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3RhdGUgaXMgcmVnaXN0ZXJlZCBpbiB0aGUgYW5pbWF0aW9uIHNldCB1bmRlciB0aGUgZ2l2ZW4gbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHN0YXRlTmFtZSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uIHN0YXRlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuXHQgKi9cblx0cHVibGljIGhhc0FuaW1hdGlvbihuYW1lOnN0cmluZyk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2FuaW1hdGlvbkRpY3Rpb25hcnlbbmFtZV0gIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGFuaW1hdGlvbiBzdGF0ZSBvYmplY3QgcmVnaXN0ZXJlZCBpbiB0aGUgYW5pbWF0aW9uIGRhdGEgc2V0IHVuZGVyIHRoZSBnaXZlbiBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RhdGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBhbmltYXRpb24gc3RhdGUgb2JqZWN0IHRvIGJlIHJldHJpZXZlZC5cblx0ICovXG5cdHB1YmxpYyBnZXRBbmltYXRpb24obmFtZTpzdHJpbmcpOkFuaW1hdGlvbk5vZGVCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW5pbWF0aW9uRGljdGlvbmFyeVtuYW1lXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGFuaW1hdGlvbiBzdGF0ZSBvYmplY3QgdG8gdGhlIGFuaWFtdGlvbiBkYXRhIHNldCB1bmRlciB0aGUgZ2l2ZW4gbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHN0YXRlTmFtZSBUaGUgbmFtZSB1bmRlciB3aGljaCB0aGUgYW5pbWF0aW9uIHN0YXRlIG9iamVjdCB3aWxsIGJlIHN0b3JlZC5cblx0ICogQHBhcmFtIGFuaW1hdGlvblN0YXRlIFRoZSBhbmltYXRpb24gc3RhdGUgb2JqZWN0IHRvIGJlIHN0YW9yZWQgaW4gdGhlIHNldC5cblx0ICovXG5cdHB1YmxpYyBhZGRBbmltYXRpb24obm9kZTpBbmltYXRpb25Ob2RlQmFzZSlcblx0e1xuXHRcdGlmICh0aGlzLl9hbmltYXRpb25EaWN0aW9uYXJ5W25vZGUubmFtZV0pXG5cdFx0XHR0aHJvdyBuZXcgQW5pbWF0aW9uU2V0RXJyb3IoXCJyb290IG5vZGUgbmFtZSAnXCIgKyBub2RlLm5hbWUgKyBcIicgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHNldFwiKTtcblxuXHRcdHRoaXMuX2FuaW1hdGlvbkRpY3Rpb25hcnlbbm9kZS5uYW1lXSA9IG5vZGU7XG5cblx0XHR0aGlzLl9hbmltYXRpb25zLnB1c2gobm9kZSk7XG5cblx0XHR0aGlzLl9hbmltYXRpb25OYW1lcy5wdXNoKG5vZGUubmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW5zIHVwIGFueSByZXNvdXJjZXMgdXNlZCBieSB0aGUgY3VycmVudCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBBbmltYXRpb25TZXRCYXNlOyJdfQ==