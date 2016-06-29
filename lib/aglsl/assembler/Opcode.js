"use strict";
var Flags_1 = require("../../aglsl/assembler/Flags");
var FS_1 = require("../../aglsl/assembler/FS");
/**
 *
 */
var Opcode = (function () {
    function Opcode(dest, aformat, asize, bformat, bsize, opcode, simple, horizontal, fragonly, matrix) {
        this.a = new FS_1.FS();
        this.b = new FS_1.FS();
        this.flags = new Flags_1.Flags();
        this.dest = dest;
        this.a.format = aformat;
        this.a.size = asize;
        this.b.format = bformat;
        this.b.size = bsize;
        this.opcode = opcode;
        this.flags.simple = simple;
        this.flags.horizontal = horizontal;
        this.flags.fragonly = fragonly;
        this.flags.matrix = matrix;
    }
    return Opcode;
}());
exports.Opcode = Opcode;
