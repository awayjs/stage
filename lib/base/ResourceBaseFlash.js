"use strict";
var ResourceBaseFlash = (function () {
    function ResourceBaseFlash() {
    }
    Object.defineProperty(ResourceBaseFlash.prototype, "id", {
        get: function () {
            return this._pId;
        },
        enumerable: true,
        configurable: true
    });
    ResourceBaseFlash.prototype.dispose = function () {
    };
    return ResourceBaseFlash;
}());
exports.ResourceBaseFlash = ResourceBaseFlash;
