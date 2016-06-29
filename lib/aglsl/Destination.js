"use strict";
var Destination = (function () {
    function Destination() {
        this.mask = 0;
        this.regnum = 0;
        this.regtype = 0;
        this.dim = 0;
        this.indexoffset = 0;
        this.swizzle = 0;
        this.lodbiad = 0;
        this.readmode = 0;
        this.special = 0;
        this.wrap = 0;
        this.filter = 0;
        this.indexregtype = 0;
        this.indexselect = 0;
        this.indirectflag = 0;
    }
    return Destination;
}());
exports.Destination = Destination;
