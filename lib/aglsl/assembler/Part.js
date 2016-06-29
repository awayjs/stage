"use strict";
var ByteArray_1 = require("@awayjs/core/lib/utils/ByteArray");
var Part = (function () {
    function Part(name, version) {
        if (name === void 0) { name = null; }
        if (version === void 0) { version = null; }
        this.name = "";
        this.version = 0;
        this.name = name;
        this.version = version;
        this.data = new ByteArray_1.ByteArray();
    }
    return Part;
}());
exports.Part = Part;
