"use strict";
var Opcode_1 = require("../../aglsl/assembler/Opcode");
var OpcodeMap = (function () {
    function OpcodeMap() {
    }
    Object.defineProperty(OpcodeMap, "map", {
        get: function () {
            if (!OpcodeMap._map) {
                OpcodeMap._map = new Array();
                OpcodeMap._map['mov'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x00, true, null, null, null); //0
                OpcodeMap._map['add'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x01, true, null, null, null); //1
                OpcodeMap._map['sub'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x02, true, null, null, null); //2
                OpcodeMap._map['mul'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x03, true, null, null, null); //3
                OpcodeMap._map['div'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x04, true, null, null, null); //4
                OpcodeMap._map['rcp'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x05, true, null, null, null); //5
                OpcodeMap._map['min'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x06, true, null, null, null); //6
                OpcodeMap._map['max'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x07, true, null, null, null); //7
                OpcodeMap._map['frc'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x08, true, null, null, null); //8
                OpcodeMap._map['sqt'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x09, true, null, null, null); //9
                OpcodeMap._map['rsq'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x0a, true, null, null, null); //10
                OpcodeMap._map['pow'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x0b, true, null, null, null); //11
                OpcodeMap._map['log'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x0c, true, null, null, null); //12
                OpcodeMap._map['exp'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x0d, true, null, null, null); //13
                OpcodeMap._map['nrm'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x0e, true, null, null, null); //14
                OpcodeMap._map['sin'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x0f, true, null, null, null); //15
                OpcodeMap._map['cos'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x10, true, null, null, null); //16
                OpcodeMap._map['crs'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x11, true, true, null, null); //17
                OpcodeMap._map['dp3'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x12, true, true, null, null); //18
                OpcodeMap._map['dp4'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x13, true, true, null, null); //19
                OpcodeMap._map['abs'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x14, true, null, null, null); //20
                OpcodeMap._map['neg'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x15, true, null, null, null); //21
                OpcodeMap._map['sat'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x16, true, null, null, null); //22
                OpcodeMap._map['ted'] = new Opcode_1.Opcode("vector", "vector", 4, "sampler", 1, 0x26, true, null, true, null); //38
                OpcodeMap._map['kil'] = new Opcode_1.Opcode("none", "scalar", 1, "none", 0, 0x27, true, null, true, null); //39
                OpcodeMap._map['tex'] = new Opcode_1.Opcode("vector", "vector", 4, "sampler", 1, 0x28, true, null, true, null); //40
                OpcodeMap._map['m33'] = new Opcode_1.Opcode("vector", "matrix", 3, "vector", 3, 0x17, true, null, null, true); //23
                OpcodeMap._map['m44'] = new Opcode_1.Opcode("vector", "matrix", 4, "vector", 4, 0x18, true, null, null, true); //24
                OpcodeMap._map['m43'] = new Opcode_1.Opcode("vector", "matrix", 3, "vector", 4, 0x19, true, null, null, true); //25
                OpcodeMap._map['ddx'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x1a, true, null, true, null); //26
                OpcodeMap._map['ddy'] = new Opcode_1.Opcode("vector", "vector", 4, "none", 0, 0x1b, true, null, true, null); //27
                OpcodeMap._map['sge'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x29, true, null, null, null); //41
                OpcodeMap._map['slt'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x2a, true, null, null, null); //42
                OpcodeMap._map['sgn'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x2b, true, null, null, null); //43
                OpcodeMap._map['seq'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x2c, true, null, null, null); //44
                OpcodeMap._map['sne'] = new Opcode_1.Opcode("vector", "vector", 4, "vector", 4, 0x2d, true, null, null, null); //45
            }
            return OpcodeMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return OpcodeMap;
}());
exports.OpcodeMap = OpcodeMap;
