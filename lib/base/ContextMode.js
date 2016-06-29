"use strict";
var ContextMode = (function () {
    function ContextMode() {
    }
    ContextMode.AUTO = "auto";
    ContextMode.WEBGL = "webgl";
    ContextMode.FLASH = "flash";
    ContextMode.NATIVE = "native";
    ContextMode.SOFTWARE = "software";
    return ContextMode;
}());
exports.ContextMode = ContextMode;
