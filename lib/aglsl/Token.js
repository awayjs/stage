"use strict";
var Destination_1 = require("../aglsl/Destination");
var Token = (function () {
    function Token() {
        this.dest = new Destination_1.Destination();
        this.opcode = 0;
        this.a = new Destination_1.Destination();
        this.b = new Destination_1.Destination();
    }
    return Token;
}());
exports.Token = Token;
