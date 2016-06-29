"use strict";
var ContextGLClearMask = (function () {
    function ContextGLClearMask() {
    }
    ContextGLClearMask.COLOR = 1;
    ContextGLClearMask.DEPTH = 2;
    ContextGLClearMask.STENCIL = 4;
    ContextGLClearMask.ALL = ContextGLClearMask.COLOR | ContextGLClearMask.DEPTH | ContextGLClearMask.STENCIL;
    return ContextGLClearMask;
}());
exports.ContextGLClearMask = ContextGLClearMask;
