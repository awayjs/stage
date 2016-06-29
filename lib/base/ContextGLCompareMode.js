"use strict";
var ContextGLCompareMode = (function () {
    function ContextGLCompareMode() {
    }
    ContextGLCompareMode.ALWAYS = "always";
    ContextGLCompareMode.EQUAL = "equal";
    ContextGLCompareMode.GREATER = "greater";
    ContextGLCompareMode.GREATER_EQUAL = "greaterEqual";
    ContextGLCompareMode.LESS = "less";
    ContextGLCompareMode.LESS_EQUAL = "lessEqual";
    ContextGLCompareMode.NEVER = "never";
    ContextGLCompareMode.NOT_EQUAL = "notEqual";
    return ContextGLCompareMode;
}());
exports.ContextGLCompareMode = ContextGLCompareMode;
