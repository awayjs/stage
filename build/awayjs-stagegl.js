require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"awayjs-stagegl/lib/aglsl/AGALTokenizer":[function(require,module,exports){
var Description = require("awayjs-stagegl/lib/aglsl/Description");
var Header = require("awayjs-stagegl/lib/aglsl/Header");
var Mapping = require("awayjs-stagegl/lib/aglsl/Mapping");
var Token = require("awayjs-stagegl/lib/aglsl/Token");
var AGALTokenizer = (function () {
    function AGALTokenizer() {
    }
    AGALTokenizer.prototype.decribeAGALByteArray = function (bytes) {
        var header = new Header();
        if (bytes.readUnsignedByte() != 0xa0) {
            throw "Bad AGAL: Missing 0xa0 magic byte.";
        }
        header.version = bytes.readUnsignedInt();
        if (header.version >= 0x10) {
            bytes.readUnsignedByte();
            header.version >>= 1;
        }
        if (bytes.readUnsignedByte() != 0xa1) {
            throw "Bad AGAL: Missing 0xa1 magic byte.";
        }
        header.progid = bytes.readUnsignedByte();
        switch (header.progid) {
            case 1:
                header.type = "fragment";
                break;
            case 0:
                header.type = "vertex";
                break;
            case 2:
                header.type = "cpu";
                break;
            default:
                header.type = "";
                break;
        }
        var desc = new Description();
        var tokens = [];
        while (bytes.position < bytes.length) {
            var token = new Token();
            token.opcode = bytes.readUnsignedInt();
            var lutentry = Mapping.agal2glsllut[token.opcode];
            if (!lutentry) {
                throw "Opcode not valid or not implemented yet: " + token.opcode;
            }
            if (lutentry.matrixheight) {
                desc.hasmatrix = true;
            }
            if (lutentry.dest) {
                token.dest.regnum = bytes.readUnsignedShort();
                token.dest.mask = bytes.readUnsignedByte();
                token.dest.regtype = bytes.readUnsignedByte();
                desc.regwrite[token.dest.regtype][token.dest.regnum] |= token.dest.mask;
            }
            else {
                token.dest = null;
                bytes.readUnsignedInt();
            }
            if (lutentry.a) {
                this.readReg(token.a, 1, desc, bytes);
            }
            else {
                token.a = null;
                bytes.readUnsignedInt();
                bytes.readUnsignedInt();
            }
            if (lutentry.b) {
                this.readReg(token.b, lutentry.matrixheight | 0, desc, bytes);
            }
            else {
                token.b = null;
                bytes.readUnsignedInt();
                bytes.readUnsignedInt();
            }
            tokens.push(token);
        }
        desc.header = header;
        desc.tokens = tokens;
        return desc;
    };
    AGALTokenizer.prototype.readReg = function (s, mh, desc, bytes) {
        s.regnum = bytes.readUnsignedShort();
        s.indexoffset = bytes.readByte();
        s.swizzle = bytes.readUnsignedByte();
        s.regtype = bytes.readUnsignedByte();
        desc.regread[s.regtype][s.regnum] = 0xf; // sould be swizzle to mask? should be |=                                                 
        if (s.regtype == 0x5) {
            // sampler
            s.lodbiad = s.indexoffset;
            s.indexoffset = undefined;
            s.swizzle = undefined;
            // sampler 
            s.readmode = bytes.readUnsignedByte();
            s.dim = s.readmode >> 4;
            s.readmode &= 0xf;
            s.special = bytes.readUnsignedByte();
            s.wrap = s.special >> 4;
            s.special &= 0xf;
            s.mipmap = bytes.readUnsignedByte();
            s.filter = s.mipmap >> 4;
            s.mipmap &= 0xf;
            desc.samplers[s.regnum] = s;
        }
        else {
            s.indexregtype = bytes.readUnsignedByte();
            s.indexselect = bytes.readUnsignedByte();
            s.indirectflag = bytes.readUnsignedByte();
        }
        if (s.indirectflag) {
            desc.hasindirect = true;
        }
        if (!s.indirectflag && mh) {
            for (var mhi = 0; mhi < mh; mhi++) {
                desc.regread[s.regtype][s.regnum + mhi] = desc.regread[s.regtype][s.regnum];
            }
        }
    };
    return AGALTokenizer;
})();
module.exports = AGALTokenizer;

},{"awayjs-stagegl/lib/aglsl/Description":"awayjs-stagegl/lib/aglsl/Description","awayjs-stagegl/lib/aglsl/Header":"awayjs-stagegl/lib/aglsl/Header","awayjs-stagegl/lib/aglsl/Mapping":"awayjs-stagegl/lib/aglsl/Mapping","awayjs-stagegl/lib/aglsl/Token":"awayjs-stagegl/lib/aglsl/Token"}],"awayjs-stagegl/lib/aglsl/AGLSLParser":[function(require,module,exports){
var Mapping = require("awayjs-stagegl/lib/aglsl/Mapping");
var ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
var AGLSLParser = (function () {
    function AGLSLParser() {
    }
    AGLSLParser.prototype.parse = function (desc) {
        var header = "";
        var body = "";
        header += "precision highp float;\n";
        var tag = desc.header.type[0]; //TODO
        // declare uniforms
        if (desc.header.type == "vertex") {
            header += "uniform float yflip;\n";
        }
        if (!desc.hasindirect) {
            for (var i = 0; i < desc.regread[0x1].length; i++) {
                if (desc.regread[0x1][i]) {
                    header += "uniform vec4 " + tag + "c" + i + ";\n";
                }
            }
        }
        else {
            header += "uniform vec4 " + tag + "carrr[" + ContextStage3D.maxvertexconstants + "];\n"; // use max const count instead
        }
        for (var i = 0; i < desc.regread[0x2].length || i < desc.regwrite[0x2].length; i++) {
            if (desc.regread[0x2][i] || desc.regwrite[0x2][i]) {
                header += "vec4 " + tag + "t" + i + ";\n";
            }
        }
        for (var i = 0; i < desc.regread[0x0].length; i++) {
            if (desc.regread[0x0][i]) {
                header += "attribute vec4 va" + i + ";\n";
            }
        }
        for (var i = 0; i < desc.regread[0x4].length || i < desc.regwrite[0x4].length; i++) {
            if (desc.regread[0x4][i] || desc.regwrite[0x4][i]) {
                header += "varying vec4 vi" + i + ";\n";
            }
        }
        // declare samplers
        var samptype = ["2D", "Cube", "3D", ""];
        for (var i = 0; i < desc.samplers.length; i++) {
            if (desc.samplers[i]) {
                header += "uniform sampler" + samptype[desc.samplers[i].dim & 3] + " fs" + i + ";\n";
            }
        }
        // extra gl fluff: setup position and depth adjust temps
        if (desc.header.type == "vertex") {
            header += "vec4 outpos;\n";
        }
        if (desc.writedepth) {
            header += "vec4 tmp_FragDepth;\n";
        }
        //if ( desc.hasmatrix ) 
        //    header += "vec4 tmp_matrix;\n";
        var derivatives = false;
        // start body of code
        body += "void main() {\n";
        for (var i = 0; i < desc.tokens.length; i++) {
            var lutentry = Mapping.agal2glsllut[desc.tokens[i].opcode];
            if (lutentry.s.indexOf("dFdx") != -1 || lutentry.s.indexOf("dFdy") != -1)
                derivatives = true;
            if (!lutentry) {
                throw "Opcode not valid or not implemented yet: ";
            }
            var sublines = lutentry.matrixheight || 1;
            for (var sl = 0; sl < sublines; sl++) {
                var line = "  " + lutentry.s;
                if (desc.tokens[i].dest) {
                    if (lutentry.matrixheight) {
                        if (((desc.tokens[i].dest.mask >> sl) & 1) != 1) {
                            continue;
                        }
                        var destregstring = this.regtostring(desc.tokens[i].dest.regtype, desc.tokens[i].dest.regnum, desc, tag);
                        var destcaststring = "float";
                        var destmaskstring = ["x", "y", "z", "w"][sl];
                        destregstring += "." + destmaskstring;
                    }
                    else {
                        var destregstring = this.regtostring(desc.tokens[i].dest.regtype, desc.tokens[i].dest.regnum, desc, tag);
                        var destcaststring;
                        var destmaskstring;
                        if (desc.tokens[i].dest.mask != 0xf) {
                            var ndest = 0;
                            destmaskstring = "";
                            if (desc.tokens[i].dest.mask & 1) {
                                ndest++;
                                destmaskstring += "x";
                            }
                            if (desc.tokens[i].dest.mask & 2) {
                                ndest++;
                                destmaskstring += "y";
                            }
                            if (desc.tokens[i].dest.mask & 4) {
                                ndest++;
                                destmaskstring += "z";
                            }
                            if (desc.tokens[i].dest.mask & 8) {
                                ndest++;
                                destmaskstring += "w";
                            }
                            destregstring += "." + destmaskstring;
                            switch (ndest) {
                                case 1:
                                    destcaststring = "float";
                                    break;
                                case 2:
                                    destcaststring = "vec2";
                                    break;
                                case 3:
                                    destcaststring = "vec3";
                                    break;
                                default:
                                    throw "Unexpected destination mask";
                            }
                        }
                        else {
                            destcaststring = "vec4";
                            destmaskstring = "xyzw";
                        }
                    }
                    line = line.replace("%dest", destregstring);
                    line = line.replace("%cast", destcaststring);
                    line = line.replace("%dm", destmaskstring);
                }
                var dwm = 0xf;
                if (!lutentry.ndwm && lutentry.dest && desc.tokens[i].dest) {
                    dwm = desc.tokens[i].dest.mask;
                }
                if (desc.tokens[i].a) {
                    line = line.replace("%a", this.sourcetostring(desc.tokens[i].a, 0, dwm, lutentry.scalar, desc, tag));
                }
                if (desc.tokens[i].b) {
                    line = line.replace("%b", this.sourcetostring(desc.tokens[i].b, sl, dwm, lutentry.scalar, desc, tag));
                    if (desc.tokens[i].b.regtype == 0x5) {
                        // sampler dim
                        var texdim = ["2D", "Cube", "3D"][desc.tokens[i].b.dim];
                        var texsize = ["vec2", "vec3", "vec3"][desc.tokens[i].b.dim];
                        line = line.replace("%texdim", texdim);
                        line = line.replace("%texsize", texsize);
                        var texlod = "";
                        line = line.replace("%lod", texlod);
                    }
                }
                body += line;
            }
        }
        // adjust z from opengl range of -1..1 to 0..1 as in d3d, this also enforces a left handed coordinate system
        if (desc.header.type == "vertex") {
            body += "  gl_Position = vec4(outpos.x, outpos.y, outpos.z*2.0 - outpos.w, outpos.w);\n";
        }
        //flag based switch
        if (derivatives && desc.header.type == "fragment") {
            header = "#extension GL_OES_standard_derivatives : enable\n" + header;
        }
        // clamp fragment depth
        if (desc.writedepth) {
            body += "  gl_FragDepth = clamp(tmp_FragDepth,0.0,1.0);\n";
        }
        // close main
        body += "}\n";
        console.log(header + body);
        return header + body;
    };
    AGLSLParser.prototype.regtostring = function (regtype, regnum, desc, tag) {
        switch (regtype) {
            case 0x0:
                return "va" + regnum;
            case 0x1:
                if (desc.hasindirect && desc.header.type == "vertex") {
                    return "vcarrr[" + regnum + "]";
                }
                else {
                    return tag + "c" + regnum;
                }
            case 0x2:
                return tag + "t" + regnum;
            case 0x3:
                return desc.header.type == "vertex" ? "outpos" : "gl_FragColor";
            case 0x4:
                return "vi" + regnum;
            case 0x5:
                return "fs" + regnum;
            case 0x6:
                return "tmp_FragDepth";
            default:
                throw "Unknown register type";
        }
    };
    AGLSLParser.prototype.sourcetostring = function (s, subline, dwm, isscalar, desc, tag) {
        var swiz = ["x", "y", "z", "w"];
        var r;
        if (s.indirectflag) {
            r = "vcarrr[int(" + this.regtostring(s.indexregtype, s.regnum, desc, tag) + "." + swiz[s.indexselect] + ")";
            var realofs = subline + s.indexoffset;
            if (realofs < 0)
                r += realofs.toString();
            if (realofs > 0)
                r += "+" + realofs.toString();
            r += "]";
        }
        else {
            r = this.regtostring(s.regtype, s.regnum + subline, desc, tag);
        }
        // samplers never add swizzle        
        if (s.regtype == 0x5) {
            return r;
        }
        // scalar, first component only
        if (isscalar) {
            return r + "." + swiz[(s.swizzle >> 0) & 3];
        }
        // identity
        if (s.swizzle == 0xe4 && dwm == 0xf) {
            return r;
        }
        // with destination write mask folded in
        r += ".";
        if (dwm & 1)
            r += swiz[(s.swizzle >> 0) & 3];
        if (dwm & 2)
            r += swiz[(s.swizzle >> 2) & 3];
        if (dwm & 4)
            r += swiz[(s.swizzle >> 4) & 3];
        if (dwm & 8)
            r += swiz[(s.swizzle >> 6) & 3];
        return r;
    };
    return AGLSLParser;
})();
module.exports = AGLSLParser;

},{"awayjs-stagegl/lib/aglsl/Mapping":"awayjs-stagegl/lib/aglsl/Mapping","awayjs-stagegl/lib/base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D"}],"awayjs-stagegl/lib/aglsl/Description":[function(require,module,exports){
var Header = require("awayjs-stagegl/lib/aglsl/Header");
var Description = (function () {
    function Description() {
        this.regread = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        this.regwrite = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        this.hasindirect = false;
        this.writedepth = false;
        this.hasmatrix = false;
        this.samplers = [];
        // added due to dynamic assignment 3*0xFFFFFFuuuu
        this.tokens = [];
        this.header = new Header();
    }
    return Description;
})();
module.exports = Description;

},{"awayjs-stagegl/lib/aglsl/Header":"awayjs-stagegl/lib/aglsl/Header"}],"awayjs-stagegl/lib/aglsl/Destination":[function(require,module,exports){
var Destination = (function () {
    function Destination() {
        this.mask = 0;
        this.regnum = 0;
        this.regtype = 0;
        this.dim = 0;
    }
    return Destination;
})();
module.exports = Destination;

},{}],"awayjs-stagegl/lib/aglsl/Header":[function(require,module,exports){
var Header = (function () {
    function Header() {
        this.progid = 0;
        this.version = 0;
        this.type = "";
    }
    return Header;
})();
module.exports = Header;

},{}],"awayjs-stagegl/lib/aglsl/Mapping":[function(require,module,exports){
var OpLUT = require("awayjs-stagegl/lib/aglsl/OpLUT");
var Mapping = (function () {
    //TODO: get rid of hack that fixes including definition file
    function Mapping(include) {
    }
    Mapping.agal2glsllut = [
        new OpLUT("%dest = %cast(%a);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(%a + %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(%a - %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(%a * %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(%a / %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(1.0) / %a;\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(min(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(max(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(fract(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(sqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(inversesqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(pow(abs(%a),%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(log2(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(exp2(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(normalize(vec3( %a ) ));\n", 0, true, true, false, null, null, true, null, null, null),
        new OpLUT("%dest = %cast(sin(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(cos(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(cross(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT("%dest = %cast(abs(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(%a * -1.0);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(clamp(%a,0.0,1.0));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", null, true, true, true, 3, 3, true, null, null, null),
        new OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 4, true, null, null, null),
        new OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 3, true, null, null, null),
        new OpLUT("%dest = %cast(dFdx(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(dFdy(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("if (float(%a)==float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null),
        new OpLUT("if (float(%a)!=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null),
        new OpLUT("if (float(%a)>=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null),
        new OpLUT("if (float(%a)<float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null),
        new OpLUT("} else {;\n", 0, false, false, false, null, null, null, null, null, null),
        new OpLUT("};\n", 0, false, false, false, null, null, null, null, null, null),
        new OpLUT(null, null, null, null, false, null, null, null, null, null, null),
        new OpLUT(null, null, null, null, false, null, null, null, null, null, null),
        new OpLUT(null, null, null, null, false, null, null, null, null, null, null),
        new OpLUT(null, null, null, null, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(texture%texdimLod(%b,%texsize(%a)).%dm);\n", null, true, true, true, null, null, null, null, true, null),
        new OpLUT("if ( float(%a)<0.0 ) discard;\n", null, false, true, false, null, null, null, true, null, null),
        new OpLUT("%dest = %cast(texture%texdim(%b,%texsize(%a)%lod).%dm);\n", null, true, true, true, null, null, true, null, true, true),
        new OpLUT("%dest = %cast(greaterThanEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null),
        new OpLUT("%dest = %cast(lessThan(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null),
        new OpLUT("%dest = %cast(sign(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT("%dest = %cast(equal(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null),
        new OpLUT("%dest = %cast(notEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null)
    ];
    return Mapping;
})();
module.exports = Mapping;

},{"awayjs-stagegl/lib/aglsl/OpLUT":"awayjs-stagegl/lib/aglsl/OpLUT"}],"awayjs-stagegl/lib/aglsl/OpLUT":[function(require,module,exports){
var OpLUT = (function () {
    function OpLUT(s, flags, dest, a, b, matrixwidth, matrixheight, ndwm, scaler, dm, lod) {
        this.s = s;
        this.flags = flags;
        this.dest = dest;
        this.a = a;
        this.b = b;
        this.matrixwidth = matrixwidth;
        this.matrixheight = matrixheight;
        this.ndwm = ndwm;
        this.scalar = scaler;
        this.dm = dm;
        this.lod = lod;
    }
    return OpLUT;
})();
module.exports = OpLUT;

},{}],"awayjs-stagegl/lib/aglsl/Sampler":[function(require,module,exports){
var Sampler = (function () {
    function Sampler() {
        this.lodbias = 0;
        this.dim = 0;
        this.readmode = 0;
        this.special = 0;
        this.wrap = 0;
        this.mipmap = 0;
        this.filter = 0;
    }
    return Sampler;
})();
module.exports = Sampler;

},{}],"awayjs-stagegl/lib/aglsl/Token":[function(require,module,exports){
var Destination = require("awayjs-stagegl/lib/aglsl/Destination");
var Token = (function () {
    function Token() {
        this.dest = new Destination();
        this.opcode = 0;
        this.a = new Destination();
        this.b = new Destination();
    }
    return Token;
})();
module.exports = Token;

},{"awayjs-stagegl/lib/aglsl/Destination":"awayjs-stagegl/lib/aglsl/Destination"}],"awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler":[function(require,module,exports){
var OpcodeMap = require("awayjs-stagegl/lib/aglsl/assembler/OpcodeMap");
var Part = require("awayjs-stagegl/lib/aglsl/assembler/Part");
var RegMap = require("awayjs-stagegl/lib/aglsl/assembler/RegMap");
var SamplerMap = require("awayjs-stagegl/lib/aglsl/assembler/SamplerMap");
var AGALMiniAssembler = (function () {
    function AGALMiniAssembler() {
        this.r = {};
        this.cur = new Part();
    }
    AGALMiniAssembler.prototype.assemble = function (source, ext_part, ext_version) {
        if (ext_part === void 0) { ext_part = null; }
        if (ext_version === void 0) { ext_version = null; }
        if (!ext_version) {
            ext_version = 1;
        }
        if (ext_part) {
            this.addHeader(ext_part, ext_version);
        }
        var lines = source.replace(/[\f\n\r\v]+/g, "\n").split("\n"); // handle breaks, then split into lines
        for (var i in lines) {
            this.processLine(lines[i], i);
        }
        return this.r;
    };
    AGALMiniAssembler.prototype.processLine = function (line, linenr) {
        var startcomment = line.search("//"); // remove comments
        if (startcomment != -1) {
            line = line.slice(0, startcomment);
        }
        line = line.replace(/^\s+|\s+$/g, ""); // remove outer space
        if (!(line.length > 0)) {
            return;
        }
        var optsi = line.search(/<.*>/g); // split of options part <*> if there
        var opts = null;
        if (optsi != -1) {
            opts = line.slice(optsi).match(/([\w\.\-\+]+)/gi);
            line = line.slice(0, optsi);
        }
        // get opcode/command				            
        var tokens = line.match(/([\w\.\+\[\]]+)/gi); // get tokens in line
        if (!tokens || tokens.length < 1) {
            if (line.length >= 3) {
                console.log("Warning: bad line " + linenr + ": " + line);
            }
            return;
        }
        switch (tokens[0]) {
            case "part":
                this.addHeader(tokens[1], Number(tokens[2]));
                break;
            case "endpart":
                if (!this.cur) {
                    throw "Unexpected endpart";
                }
                this.cur.data.position = 0;
                this.cur = null;
                return;
            default:
                if (!this.cur) {
                    console.log("Warning: bad line " + linenr + ": " + line + " (Outside of any part definition)");
                    return;
                }
                if (this.cur.name == "comment") {
                    return;
                }
                var op = OpcodeMap.map[tokens[0]];
                if (!op) {
                    throw "Bad opcode " + tokens[0] + " " + linenr + ": " + line;
                }
                // console.log( 'AGALMiniAssembler' , 'op' , op );
                this.emitOpcode(this.cur, op.opcode);
                var ti = 1;
                if (op.dest && op.dest != "none") {
                    if (!this.emitDest(this.cur, tokens[ti++], op.dest)) {
                        throw "Bad destination register " + tokens[ti - 1] + " " + linenr + ": " + line;
                    }
                }
                else {
                    this.emitZeroDword(this.cur);
                }
                if (op.a && op.a.format != "none") {
                    if (!this.emitSource(this.cur, tokens[ti++], op.a))
                        throw "Bad source register " + tokens[ti - 1] + " " + linenr + ": " + line;
                }
                else {
                    this.emitZeroQword(this.cur);
                }
                if (op.b && op.b.format != "none") {
                    if (op.b.format == "sampler") {
                        if (!this.emitSampler(this.cur, tokens[ti++], op.b, opts)) {
                            throw "Bad sampler register " + tokens[ti - 1] + " " + linenr + ": " + line;
                        }
                    }
                    else {
                        if (!this.emitSource(this.cur, tokens[ti++], op.b)) {
                            throw "Bad source register " + tokens[ti - 1] + " " + linenr + ": " + line;
                        }
                    }
                }
                else {
                    this.emitZeroQword(this.cur);
                }
                break;
        }
    };
    AGALMiniAssembler.prototype.emitHeader = function (pr) {
        pr.data.writeUnsignedByte(0xa0); // tag version
        pr.data.writeUnsignedInt(pr.version);
        if (pr.version >= 0x10) {
            pr.data.writeUnsignedByte(0); // align, for higher versions
        }
        pr.data.writeUnsignedByte(0xa1); // tag program id
        switch (pr.name) {
            case "fragment":
                pr.data.writeUnsignedByte(1);
                break;
            case "vertex":
                pr.data.writeUnsignedByte(0);
                break;
            case "cpu":
                pr.data.writeUnsignedByte(2);
                break;
            default:
                pr.data.writeUnsignedByte(0xff);
                break;
        }
    };
    AGALMiniAssembler.prototype.emitOpcode = function (pr, opcode) {
        pr.data.writeUnsignedInt(opcode);
        //console.log ( "Emit opcode: ", opcode ); 
    };
    AGALMiniAssembler.prototype.emitZeroDword = function (pr) {
        pr.data.writeUnsignedInt(0);
    };
    AGALMiniAssembler.prototype.emitZeroQword = function (pr) {
        pr.data.writeUnsignedInt(0);
        pr.data.writeUnsignedInt(0);
    };
    AGALMiniAssembler.prototype.emitDest = function (pr, token, opdest) {
        //console.log( 'AGALMiniAssembler' , 'emitDest' , 'RegMap.map' , RegMap.map);
        var reg = token.match(/([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i); // g1: regname, g2:regnum, g3:mask
        // console.log( 'AGALMiniAssembler' , 'emitDest' , 'reg' , reg , reg[1] , RegMap.map[reg[1]] );
        // console.log( 'AGALMiniAssembler' , 'emitDest' , 'RegMap.map[reg[1]]' , RegMap.map[reg[1]] , 'bool' , !RegMap.map[reg[1]] ) ;
        if (!RegMap.map[reg[1]])
            return false;
        var em = { num: reg[2] ? reg[2] : 0, code: RegMap.map[reg[1]].code, mask: this.stringToMask(reg[3]) };
        pr.data.writeUnsignedShort(em.num);
        pr.data.writeUnsignedByte(em.mask);
        pr.data.writeUnsignedByte(em.code);
        //console.log ( "  Emit dest: ", em );
        return true;
    };
    AGALMiniAssembler.prototype.stringToMask = function (s) {
        if (!s)
            return 0xf;
        var r = 0;
        if (s.indexOf("x") != -1)
            r |= 1;
        if (s.indexOf("y") != -1)
            r |= 2;
        if (s.indexOf("z") != -1)
            r |= 4;
        if (s.indexOf("w") != -1)
            r |= 8;
        return r;
    };
    AGALMiniAssembler.prototype.stringToSwizzle = function (s) {
        if (!s) {
            return 0xe4;
        }
        var chartoindex = { x: 0, y: 1, z: 2, w: 3 };
        var sw = 0;
        if (s.charAt(0) != ".") {
            throw "Missing . for swizzle";
        }
        if (s.length > 1) {
            sw |= chartoindex[s.charAt(1)];
        }
        if (s.length > 2) {
            sw |= chartoindex[s.charAt(2)] << 2;
        }
        else {
            sw |= (sw & 3) << 2;
        }
        if (s.length > 3) {
            sw |= chartoindex[s.charAt(3)] << 4;
        }
        else {
            sw |= (sw & (3 << 2)) << 2;
        }
        if (s.length > 4) {
            sw |= chartoindex[s.charAt(4)] << 6;
        }
        else {
            sw |= (sw & (3 << 4)) << 2;
        }
        return sw;
    };
    AGALMiniAssembler.prototype.emitSampler = function (pr, token, opsrc, opts) {
        var reg = token.match(/fs(\d*)/i); // g1:regnum
        if (!reg || !reg[1]) {
            return false;
        }
        pr.data.writeUnsignedShort(parseInt(reg[1]));
        pr.data.writeUnsignedByte(0); // bias
        pr.data.writeUnsignedByte(0);
        /*
         pr.data.writeUnsignedByte ( 0x5 );
         pr.data.writeUnsignedByte ( 0 );   // readmode, dim
         pr.data.writeUnsignedByte ( 0 );   // special, wrap
         pr.data.writeUnsignedByte ( 0 );   // mip, filter
         */
        var samplerbits = 0x5;
        var sampleroptset = 0;
        for (var i = 0; i < opts.length; i++) {
            var o = SamplerMap.map[opts[i].toLowerCase()];
            //console.log( 'AGALMiniAssembler' , 'emitSampler' , 'SampleMap opt:' , o , '<-------- WATCH FOR THIS');
            if (o) {
                if (((sampleroptset >> o.shift) & o.mask) != 0) {
                    console.log("Warning, duplicate sampler option");
                }
                sampleroptset |= o.mask << o.shift;
                samplerbits &= ~(o.mask << o.shift);
                samplerbits |= o.value << o.shift;
            }
            else {
                console.log("Warning, unknown sampler option: ", opts[i]);
            }
        }
        pr.data.writeUnsignedInt(samplerbits);
        return true;
    };
    AGALMiniAssembler.prototype.emitSource = function (pr, token, opsrc) {
        var indexed = token.match(/vc\[(v[tcai])(\d+)\.([xyzw])([\+\-]\d+)?\](\.[xyzw]{1,4})?/i); // g1: indexregname, g2:indexregnum, g3:select, [g4:offset], [g5:swizzle]
        var reg;
        if (indexed) {
            if (!RegMap.map[indexed[1]]) {
                return false;
            }
            var selindex = { x: 0, y: 1, z: 2, w: 3 };
            var em = { num: indexed[2] | 0, code: RegMap.map[indexed[1]].code, swizzle: this.stringToSwizzle(indexed[5]), select: selindex[indexed[3]], offset: indexed[4] | 0 };
            pr.data.writeUnsignedShort(em.num);
            pr.data.writeByte(em.offset);
            pr.data.writeUnsignedByte(em.swizzle);
            pr.data.writeUnsignedByte(0x1); // constant reg
            pr.data.writeUnsignedByte(em.code);
            pr.data.writeUnsignedByte(em.select);
            pr.data.writeUnsignedByte(1 << 7);
        }
        else {
            reg = token.match(/([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i); // g1: regname, g2:regnum, g3:swizzle
            if (!RegMap.map[reg[1]]) {
                return false;
            }
            var em = { num: reg[2] | 0, code: RegMap.map[reg[1]].code, swizzle: this.stringToSwizzle(reg[3]) };
            pr.data.writeUnsignedShort(em.num);
            pr.data.writeUnsignedByte(0);
            pr.data.writeUnsignedByte(em.swizzle);
            pr.data.writeUnsignedByte(em.code);
            pr.data.writeUnsignedByte(0);
            pr.data.writeUnsignedByte(0);
            pr.data.writeUnsignedByte(0);
        }
        return true;
    };
    AGALMiniAssembler.prototype.addHeader = function (partname, version) {
        if (!version) {
            version = 1;
        }
        if (this.r[partname] == undefined) {
            this.r[partname] = new Part(partname, version);
            this.emitHeader(this.r[partname]);
        }
        else if (this.r[partname].version != version) {
            throw "Multiple versions for part " + partname;
        }
        this.cur = this.r[partname];
    };
    return AGALMiniAssembler;
})();
module.exports = AGALMiniAssembler;

},{"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap":"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap","awayjs-stagegl/lib/aglsl/assembler/Part":"awayjs-stagegl/lib/aglsl/assembler/Part","awayjs-stagegl/lib/aglsl/assembler/RegMap":"awayjs-stagegl/lib/aglsl/assembler/RegMap","awayjs-stagegl/lib/aglsl/assembler/SamplerMap":"awayjs-stagegl/lib/aglsl/assembler/SamplerMap"}],"awayjs-stagegl/lib/aglsl/assembler/FS":[function(require,module,exports){
var FS = (function () {
    function FS() {
    }
    return FS;
})();
module.exports = FS;

},{}],"awayjs-stagegl/lib/aglsl/assembler/Flags":[function(require,module,exports){
var Flags = (function () {
    function Flags() {
    }
    return Flags;
})();
module.exports = Flags;

},{}],"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap":[function(require,module,exports){
var Opcode = require("awayjs-stagegl/lib/aglsl/assembler/Opcode");
var OpcodeMap = (function () {
    function OpcodeMap() {
    }
    Object.defineProperty(OpcodeMap, "map", {
        get: function () {
            if (!OpcodeMap._map) {
                OpcodeMap._map = new Array();
                OpcodeMap._map['mov'] = new Opcode("vector", "vector", 4, "none", 0, 0x00, true, null, null, null); //0
                OpcodeMap._map['add'] = new Opcode("vector", "vector", 4, "vector", 4, 0x01, true, null, null, null); //1
                OpcodeMap._map['sub'] = new Opcode("vector", "vector", 4, "vector", 4, 0x02, true, null, null, null); //2
                OpcodeMap._map['mul'] = new Opcode("vector", "vector", 4, "vector", 4, 0x03, true, null, null, null); //3
                OpcodeMap._map['div'] = new Opcode("vector", "vector", 4, "vector", 4, 0x04, true, null, null, null); //4
                OpcodeMap._map['rcp'] = new Opcode("vector", "vector", 4, "none", 0, 0x05, true, null, null, null); //5
                OpcodeMap._map['min'] = new Opcode("vector", "vector", 4, "vector", 4, 0x06, true, null, null, null); //6
                OpcodeMap._map['max'] = new Opcode("vector", "vector", 4, "vector", 4, 0x07, true, null, null, null); //7
                OpcodeMap._map['frc'] = new Opcode("vector", "vector", 4, "none", 0, 0x08, true, null, null, null); //8
                OpcodeMap._map['sqt'] = new Opcode("vector", "vector", 4, "none", 0, 0x09, true, null, null, null); //9
                OpcodeMap._map['rsq'] = new Opcode("vector", "vector", 4, "none", 0, 0x0a, true, null, null, null); //10
                OpcodeMap._map['pow'] = new Opcode("vector", "vector", 4, "vector", 4, 0x0b, true, null, null, null); //11
                OpcodeMap._map['log'] = new Opcode("vector", "vector", 4, "none", 0, 0x0c, true, null, null, null); //12
                OpcodeMap._map['exp'] = new Opcode("vector", "vector", 4, "none", 0, 0x0d, true, null, null, null); //13
                OpcodeMap._map['nrm'] = new Opcode("vector", "vector", 4, "none", 0, 0x0e, true, null, null, null); //14
                OpcodeMap._map['sin'] = new Opcode("vector", "vector", 4, "none", 0, 0x0f, true, null, null, null); //15
                OpcodeMap._map['cos'] = new Opcode("vector", "vector", 4, "none", 0, 0x10, true, null, null, null); //16
                OpcodeMap._map['crs'] = new Opcode("vector", "vector", 4, "vector", 4, 0x11, true, true, null, null); //17
                OpcodeMap._map['dp3'] = new Opcode("vector", "vector", 4, "vector", 4, 0x12, true, true, null, null); //18
                OpcodeMap._map['dp4'] = new Opcode("vector", "vector", 4, "vector", 4, 0x13, true, true, null, null); //19
                OpcodeMap._map['abs'] = new Opcode("vector", "vector", 4, "none", 0, 0x14, true, null, null, null); //20
                OpcodeMap._map['neg'] = new Opcode("vector", "vector", 4, "none", 0, 0x15, true, null, null, null); //21
                OpcodeMap._map['sat'] = new Opcode("vector", "vector", 4, "none", 0, 0x16, true, null, null, null); //22
                OpcodeMap._map['ted'] = new Opcode("vector", "vector", 4, "sampler", 1, 0x26, true, null, true, null); //38
                OpcodeMap._map['kil'] = new Opcode("none", "scalar", 1, "none", 0, 0x27, true, null, true, null); //39
                OpcodeMap._map['tex'] = new Opcode("vector", "vector", 4, "sampler", 1, 0x28, true, null, true, null); //40
                OpcodeMap._map['m33'] = new Opcode("vector", "matrix", 3, "vector", 3, 0x17, true, null, null, true); //23
                OpcodeMap._map['m44'] = new Opcode("vector", "matrix", 4, "vector", 4, 0x18, true, null, null, true); //24
                OpcodeMap._map['m43'] = new Opcode("vector", "matrix", 3, "vector", 4, 0x19, true, null, null, true); //25
                OpcodeMap._map['ddx'] = new Opcode("vector", "vector", 4, "none", 0, 0x1a, true, null, true, null); //26
                OpcodeMap._map['ddy'] = new Opcode("vector", "vector", 4, "none", 0, 0x1b, true, null, true, null); //27
                OpcodeMap._map['sge'] = new Opcode("vector", "vector", 4, "vector", 4, 0x29, true, null, null, null); //41
                OpcodeMap._map['slt'] = new Opcode("vector", "vector", 4, "vector", 4, 0x2a, true, null, null, null); //42
                OpcodeMap._map['sgn'] = new Opcode("vector", "vector", 4, "vector", 4, 0x2b, true, null, null, null); //43
                OpcodeMap._map['seq'] = new Opcode("vector", "vector", 4, "vector", 4, 0x2c, true, null, null, null); //44
                OpcodeMap._map['sne'] = new Opcode("vector", "vector", 4, "vector", 4, 0x2d, true, null, null, null); //45
            }
            return OpcodeMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return OpcodeMap;
})();
module.exports = OpcodeMap;

},{"awayjs-stagegl/lib/aglsl/assembler/Opcode":"awayjs-stagegl/lib/aglsl/assembler/Opcode"}],"awayjs-stagegl/lib/aglsl/assembler/Opcode":[function(require,module,exports){
var Flags = require("awayjs-stagegl/lib/aglsl/assembler/Flags");
var FS = require("awayjs-stagegl/lib/aglsl/assembler/FS");
/**
 *
 */
var Opcode = (function () {
    function Opcode(dest, aformat, asize, bformat, bsize, opcode, simple, horizontal, fragonly, matrix) {
        this.a = new FS();
        this.b = new FS();
        this.flags = new Flags();
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
})();
module.exports = Opcode;

},{"awayjs-stagegl/lib/aglsl/assembler/FS":"awayjs-stagegl/lib/aglsl/assembler/FS","awayjs-stagegl/lib/aglsl/assembler/Flags":"awayjs-stagegl/lib/aglsl/assembler/Flags"}],"awayjs-stagegl/lib/aglsl/assembler/Part":[function(require,module,exports){
var ByteArray = require("awayjs-core/lib/utils/ByteArray");
var Part = (function () {
    function Part(name, version) {
        if (name === void 0) { name = null; }
        if (version === void 0) { version = null; }
        this.name = "";
        this.version = 0;
        this.name = name;
        this.version = version;
        this.data = new ByteArray();
    }
    return Part;
})();
module.exports = Part;

},{"awayjs-core/lib/utils/ByteArray":undefined}],"awayjs-stagegl/lib/aglsl/assembler/RegMap":[function(require,module,exports){
var Reg = (function () {
    function Reg(code, desc) {
        this.code = code;
        this.desc = desc;
    }
    return Reg;
})();
var RegMap = (function () {
    /*
     public static va:Reg = new Reg( 0x00, "vertex attribute" );
     public static fc:Reg = new Reg( 0x01, "fragment constant" );
     public static vc:Reg = new Reg( 0x01, "vertex constant" );
     public static ft:Reg = new Reg( 0x02, "fragment temporary" );
     public static vt:Reg = new Reg( 0x02, "vertex temporary" );
     public static vo:Reg = new Reg( 0x03, "vertex output" );
     public static op:Reg = new Reg( 0x03, "vertex output" );
     public static fd:Reg = new Reg( 0x03, "fragment depth output" );
     public static fo:Reg = new Reg( 0x03, "fragment output" );
     public static oc:Reg = new Reg( 0x03, "fragment output" );
     public static v: Reg = new Reg( 0x04, "varying" );
     public static vi:Reg = new Reg( 0x04, "varying output" );
     public static fi:Reg = new Reg( 0x04, "varying input" );
     public static fs:Reg = new Reg( 0x05, "sampler" );
     */
    function RegMap() {
    }
    Object.defineProperty(RegMap, "map", {
        get: function () {
            if (!RegMap._map) {
                RegMap._map = new Array();
                RegMap._map['va'] = new Reg(0x00, "vertex attribute");
                RegMap._map['fc'] = new Reg(0x01, "fragment constant");
                RegMap._map['vc'] = new Reg(0x01, "vertex constant");
                RegMap._map['ft'] = new Reg(0x02, "fragment temporary");
                RegMap._map['vt'] = new Reg(0x02, "vertex temporary");
                RegMap._map['vo'] = new Reg(0x03, "vertex output");
                RegMap._map['op'] = new Reg(0x03, "vertex output");
                RegMap._map['fd'] = new Reg(0x03, "fragment depth output");
                RegMap._map['fo'] = new Reg(0x03, "fragment output");
                RegMap._map['oc'] = new Reg(0x03, "fragment output");
                RegMap._map['v'] = new Reg(0x04, "varying");
                RegMap._map['vi'] = new Reg(0x04, "varying output");
                RegMap._map['fi'] = new Reg(0x04, "varying input");
                RegMap._map['fs'] = new Reg(0x05, "sampler");
            }
            return RegMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return RegMap;
})();
module.exports = RegMap;

},{}],"awayjs-stagegl/lib/aglsl/assembler/SamplerMap":[function(require,module,exports){
var Sampler = require("awayjs-stagegl/lib/aglsl/assembler/Sampler");
var SamplerMap = (function () {
    /*
     public static map =     [ new Sampler( 8, 0xf, 0 ),
     new Sampler( 8, 0xf, 5 ),
     new Sampler( 8, 0xf, 4 ),
     new Sampler( 8, 0xf, 1 ),
     new Sampler( 8, 0xf, 2 ),
     new Sampler( 8, 0xf, 1 ),
     new Sampler( 8, 0xf, 2 ),

     // dimension
     new Sampler( 12, 0xf, 0 ),
     new Sampler( 12, 0xf, 1 ),
     new Sampler( 12, 0xf, 2 ),

     // special
     new Sampler( 16, 1, 1 ),
     new Sampler( 16, 4, 4 ),

     // repeat
     new Sampler( 20, 0xf, 0 ),
     new Sampler( 20, 0xf, 1 ),
     new Sampler( 20, 0xf, 1 ),

     // mip
     new Sampler( 24, 0xf, 0 ),
     new Sampler( 24, 0xf, 0 ),
     new Sampler( 24, 0xf, 1 ),
     new Sampler( 24, 0xf, 2 ),

     // filter
     new Sampler( 28, 0xf, 0 ),
     new Sampler( 28, 0xf, 1 ) ]
     */
    /*
     public static rgba: Sampler = new Sampler( 8, 0xf, 0 );
     public static rg: Sampler = new Sampler( 8, 0xf, 5 );
     public static r: Sampler = new Sampler( 8, 0xf, 4 );
     public static compressed: Sampler = new Sampler( 8, 0xf, 1 );
     public static compressed_alpha: Sampler = new Sampler( 8, 0xf, 2 );
     public static dxt1: Sampler = new Sampler( 8, 0xf, 1 );
     public static dxt5: Sampler = new Sampler( 8, 0xf, 2 );

     // dimension
     public static sampler2d: Sampler = new Sampler( 12, 0xf, 0 );
     public static cube: Sampler = new Sampler( 12, 0xf, 1 );
     public static sampler3d: Sampler = new Sampler( 12, 0xf, 2 );

     // special
     public static centroid: Sampler = new Sampler( 16, 1, 1 );
     public static ignoresampler: Sampler = new Sampler( 16, 4, 4 );

     // repeat
     public static clamp: Sampler = new Sampler( 20, 0xf, 0 );
     public static repeat: Sampler = new Sampler( 20, 0xf, 1 );
     public static wrap: Sampler = new Sampler( 20, 0xf, 1 );

     // mip
     public static nomip: Sampler = new Sampler( 24, 0xf, 0 );
     public static mipnone: Sampler = new Sampler( 24, 0xf, 0 );
     public static mipnearest: Sampler = new Sampler( 24, 0xf, 1 );
     public static miplinear: Sampler = new Sampler( 24, 0xf, 2 );

     // filter
     public static nearest: Sampler = new Sampler( 28, 0xf, 0 );
     public static linear: Sampler = new Sampler( 28, 0xf, 1 );
     */
    function SamplerMap() {
    }
    Object.defineProperty(SamplerMap, "map", {
        get: function () {
            if (!SamplerMap._map) {
                SamplerMap._map = new Array();
                SamplerMap._map['rgba'] = new Sampler(8, 0xf, 0);
                SamplerMap._map['rg'] = new Sampler(8, 0xf, 5);
                SamplerMap._map['r'] = new Sampler(8, 0xf, 4);
                SamplerMap._map['compressed'] = new Sampler(8, 0xf, 1);
                SamplerMap._map['compressed_alpha'] = new Sampler(8, 0xf, 2);
                SamplerMap._map['dxt1'] = new Sampler(8, 0xf, 1);
                SamplerMap._map['dxt5'] = new Sampler(8, 0xf, 2);
                // dimension
                SamplerMap._map['2d'] = new Sampler(12, 0xf, 0);
                SamplerMap._map['cube'] = new Sampler(12, 0xf, 1);
                SamplerMap._map['3d'] = new Sampler(12, 0xf, 2);
                // special
                SamplerMap._map['centroid'] = new Sampler(16, 1, 1);
                SamplerMap._map['ignoresampler'] = new Sampler(16, 4, 4);
                // repeat
                SamplerMap._map['clamp'] = new Sampler(20, 0xf, 0);
                SamplerMap._map['repeat'] = new Sampler(20, 0xf, 1);
                SamplerMap._map['wrap'] = new Sampler(20, 0xf, 1);
                // mip
                SamplerMap._map['nomip'] = new Sampler(24, 0xf, 0);
                SamplerMap._map['mipnone'] = new Sampler(24, 0xf, 0);
                SamplerMap._map['mipnearest'] = new Sampler(24, 0xf, 1);
                SamplerMap._map['miplinear'] = new Sampler(24, 0xf, 2);
                // filter
                SamplerMap._map['nearest'] = new Sampler(28, 0xf, 0);
                SamplerMap._map['linear'] = new Sampler(28, 0xf, 1);
            }
            return SamplerMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return SamplerMap;
})();
module.exports = SamplerMap;

},{"awayjs-stagegl/lib/aglsl/assembler/Sampler":"awayjs-stagegl/lib/aglsl/assembler/Sampler"}],"awayjs-stagegl/lib/aglsl/assembler/Sampler":[function(require,module,exports){
var Sampler = (function () {
    function Sampler(shift, mask, value) {
        this.shift = shift;
        this.mask = mask;
        this.value = value;
    }
    return Sampler;
})();
module.exports = Sampler;

},{}],"awayjs-stagegl/lib/base/ContextGLBlendFactor":[function(require,module,exports){
var ContextGLBlendFactor = (function () {
    function ContextGLBlendFactor() {
    }
    ContextGLBlendFactor.DESTINATION_ALPHA = "destinationAlpha";
    ContextGLBlendFactor.DESTINATION_COLOR = "destinationColor";
    ContextGLBlendFactor.ONE = "one";
    ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA = "oneMinusDestinationAlpha";
    ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR = "oneMinusDestinationColor";
    ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA = "oneMinusSourceAlpha";
    ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR = "oneMinusSourceColor";
    ContextGLBlendFactor.SOURCE_ALPHA = "sourceAlpha";
    ContextGLBlendFactor.SOURCE_COLOR = "sourceColor";
    ContextGLBlendFactor.ZERO = "zero";
    return ContextGLBlendFactor;
})();
module.exports = ContextGLBlendFactor;

},{}],"awayjs-stagegl/lib/base/ContextGLClearMask":[function(require,module,exports){
var ContextGLClearMask = (function () {
    function ContextGLClearMask() {
    }
    ContextGLClearMask.COLOR = 1;
    ContextGLClearMask.DEPTH = 2;
    ContextGLClearMask.STENCIL = 4;
    ContextGLClearMask.ALL = ContextGLClearMask.COLOR | ContextGLClearMask.DEPTH | ContextGLClearMask.STENCIL;
    return ContextGLClearMask;
})();
module.exports = ContextGLClearMask;

},{}],"awayjs-stagegl/lib/base/ContextGLCompareMode":[function(require,module,exports){
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
})();
module.exports = ContextGLCompareMode;

},{}],"awayjs-stagegl/lib/base/ContextGLDrawMode":[function(require,module,exports){
var ContextGLDrawMode = (function () {
    function ContextGLDrawMode() {
    }
    ContextGLDrawMode.TRIANGLES = "triangles";
    ContextGLDrawMode.LINES = "lines";
    return ContextGLDrawMode;
})();
module.exports = ContextGLDrawMode;

},{}],"awayjs-stagegl/lib/base/ContextGLMipFilter":[function(require,module,exports){
var ContextGLMipFilter = (function () {
    function ContextGLMipFilter() {
    }
    ContextGLMipFilter.MIPLINEAR = "miplinear";
    ContextGLMipFilter.MIPNEAREST = "mipnearest";
    ContextGLMipFilter.MIPNONE = "mipnone";
    return ContextGLMipFilter;
})();
module.exports = ContextGLMipFilter;

},{}],"awayjs-stagegl/lib/base/ContextGLProfile":[function(require,module,exports){
var ContextGLProfile = (function () {
    function ContextGLProfile() {
    }
    ContextGLProfile.BASELINE = "baseline";
    ContextGLProfile.BASELINE_CONSTRAINED = "baselineConstrained";
    ContextGLProfile.BASELINE_EXTENDED = "baselineExtended";
    return ContextGLProfile;
})();
module.exports = ContextGLProfile;

},{}],"awayjs-stagegl/lib/base/ContextGLProgramType":[function(require,module,exports){
var ContextGLProgramType = (function () {
    function ContextGLProgramType() {
    }
    ContextGLProgramType.FRAGMENT = "fragment";
    ContextGLProgramType.VERTEX = "vertex";
    return ContextGLProgramType;
})();
module.exports = ContextGLProgramType;

},{}],"awayjs-stagegl/lib/base/ContextGLStencilAction":[function(require,module,exports){
var ContextGLStencilAction = (function () {
    function ContextGLStencilAction() {
    }
    ContextGLStencilAction.DECREMENT_SATURATE = "decrementSaturate";
    ContextGLStencilAction.DECREMENT_WRAP = "decrementWrap";
    ContextGLStencilAction.INCREMENT_SATURATE = "incrementSaturate";
    ContextGLStencilAction.INCREMENT_WRAP = "incrementWrap";
    ContextGLStencilAction.INVERT = "invert";
    ContextGLStencilAction.KEEP = "keep";
    ContextGLStencilAction.SET = "set";
    ContextGLStencilAction.ZERO = "zero";
    return ContextGLStencilAction;
})();
module.exports = ContextGLStencilAction;

},{}],"awayjs-stagegl/lib/base/ContextGLTextureFilter":[function(require,module,exports){
var ContextGLTextureFilter = (function () {
    function ContextGLTextureFilter() {
    }
    ContextGLTextureFilter.LINEAR = "linear";
    ContextGLTextureFilter.NEAREST = "nearest";
    return ContextGLTextureFilter;
})();
module.exports = ContextGLTextureFilter;

},{}],"awayjs-stagegl/lib/base/ContextGLTextureFormat":[function(require,module,exports){
var ContextGLTextureFormat = (function () {
    function ContextGLTextureFormat() {
    }
    ContextGLTextureFormat.BGRA = "bgra";
    ContextGLTextureFormat.BGRA_PACKED = "bgraPacked4444";
    ContextGLTextureFormat.BGR_PACKED = "bgrPacked565";
    ContextGLTextureFormat.COMPRESSED = "compressed";
    ContextGLTextureFormat.COMPRESSED_ALPHA = "compressedAlpha";
    return ContextGLTextureFormat;
})();
module.exports = ContextGLTextureFormat;

},{}],"awayjs-stagegl/lib/base/ContextGLTriangleFace":[function(require,module,exports){
var ContextGLTriangleFace = (function () {
    function ContextGLTriangleFace() {
    }
    ContextGLTriangleFace.BACK = "back";
    ContextGLTriangleFace.FRONT = "front";
    ContextGLTriangleFace.FRONT_AND_BACK = "frontAndBack";
    ContextGLTriangleFace.NONE = "none";
    return ContextGLTriangleFace;
})();
module.exports = ContextGLTriangleFace;

},{}],"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":[function(require,module,exports){
var ContextGLVertexBufferFormat = (function () {
    function ContextGLVertexBufferFormat() {
    }
    ContextGLVertexBufferFormat.BYTES_4 = "bytes4";
    ContextGLVertexBufferFormat.FLOAT_1 = "float1";
    ContextGLVertexBufferFormat.FLOAT_2 = "float2";
    ContextGLVertexBufferFormat.FLOAT_3 = "float3";
    ContextGLVertexBufferFormat.FLOAT_4 = "float4";
    return ContextGLVertexBufferFormat;
})();
module.exports = ContextGLVertexBufferFormat;

},{}],"awayjs-stagegl/lib/base/ContextGLWrapMode":[function(require,module,exports){
var ContextGLWrapMode = (function () {
    function ContextGLWrapMode() {
    }
    ContextGLWrapMode.CLAMP = "clamp";
    ContextGLWrapMode.REPEAT = "repeat";
    return ContextGLWrapMode;
})();
module.exports = ContextGLWrapMode;

},{}],"awayjs-stagegl/lib/base/ContextMode":[function(require,module,exports){
var ContextMode = (function () {
    function ContextMode() {
    }
    ContextMode.AUTO = "auto";
    ContextMode.WEBGL = "webgl";
    ContextMode.FLASH = "flash";
    ContextMode.NATIVE = "native";
    ContextMode.SOFTWARE = "software";
    return ContextMode;
})();
module.exports = ContextMode;

},{}],"awayjs-stagegl/lib/base/ContextSoftware":[function(require,module,exports){
var BitmapImage2D = require("awayjs-core/lib/data/BitmapImage2D");
var Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
var Point = require("awayjs-core/lib/geom/Point");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var ColorUtils = require("awayjs-core/lib/utils/ColorUtils");
var ContextGLBlendFactor = require("awayjs-stagegl/lib/base/ContextGLBlendFactor");
var ContextGLClearMask = require("awayjs-stagegl/lib/base/ContextGLClearMask");
var ContextGLCompareMode = require("awayjs-stagegl/lib/base/ContextGLCompareMode");
var ContextGLTriangleFace = require("awayjs-stagegl/lib/base/ContextGLTriangleFace");
var ContextGLVertexBufferFormat = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
var IndexBufferSoftware = require("awayjs-stagegl/lib/base/IndexBufferSoftware");
var VertexBufferSoftware = require("awayjs-stagegl/lib/base/VertexBufferSoftware");
var TextureSoftware = require("awayjs-stagegl/lib/base/TextureSoftware");
var ProgramSoftware = require("awayjs-stagegl/lib/base/ProgramSoftware");
var ContextSoftware = (function () {
    function ContextSoftware(canvas) {
        this._backBufferRect = new Rectangle();
        this._backBufferWidth = 100;
        this._backBufferHeight = 100;
        this._zbuffer = [];
        this._cullingMode = ContextGLTriangleFace.BACK;
        this._blendSource = ContextGLBlendFactor.ONE;
        this._blendDestination = ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
        this._colorMaskR = true;
        this._colorMaskG = true;
        this._colorMaskB = true;
        this._colorMaskA = true;
        this._writeDepth = true;
        this._depthCompareMode = ContextGLCompareMode.LESS;
        this._textures = [];
        this._vertexBuffers = [];
        this._vertexBufferOffsets = [];
        this._vertexBufferFormats = [];
        this._drawRect = new Rectangle();
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d");
        this._backBufferColor = new BitmapImage2D(this._backBufferWidth, this._backBufferHeight, false, 0, false);
        document.body.appendChild(this._backBufferColor.getCanvas());
    }
    Object.defineProperty(ContextSoftware.prototype, "container", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    ContextSoftware.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask.ALL; }
        if (mask & ContextGLClearMask.COLOR) {
            this._backBufferColor.fillRect(this._backBufferRect, ColorUtils.ARGBtoFloat32(alpha, red, green, blue));
        }
        //TODO: mask & ContextGLClearMask.STENCIL
        if (mask & ContextGLClearMask.DEPTH) {
            this._zbuffer.length = 0;
            var len = this._backBufferWidth * this._backBufferHeight;
            for (var i = 0; i < len; i++) {
                this._zbuffer[i] = 10000000;
            }
        }
    };
    ContextSoftware.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        console.log("configureBackBuffer");
        this._backBufferWidth = width;
        this._backBufferHeight = height;
        this._backBufferRect.width = width;
        this._backBufferRect.height = height;
        this._backBufferColor._setSize(width, height);
    };
    ContextSoftware.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        //TODO: impl
        return undefined;
    };
    ContextSoftware.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferSoftware(numIndices);
    };
    ContextSoftware.prototype.createProgram = function () {
        return new ProgramSoftware();
    };
    ContextSoftware.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        console.log("createTexture");
        return new TextureSoftware(width, height);
    };
    ContextSoftware.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        console.log("createVertexBuffer");
        return new VertexBufferSoftware(numVertices, dataPerVertex);
    };
    ContextSoftware.prototype.dispose = function () {
    };
    ContextSoftware.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this._blendSource = sourceFactor;
        this._blendDestination = destinationFactor;
    };
    ContextSoftware.prototype.setColorMask = function (red, green, blue, alpha) {
        this._colorMaskR = red;
        this._colorMaskG = green;
        this._colorMaskB = blue;
        this._colorMaskA = alpha;
    };
    ContextSoftware.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        //TODO:
    };
    ContextSoftware.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        //TODO:
    };
    ContextSoftware.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        //TODO: CoordinateSystem.RIGHT_HAND
        this._cullingMode = triangleFaceToCull;
    };
    ContextSoftware.prototype.setDepthTest = function (depthMask, passCompareMode) {
        console.log("setDepthTest: " + depthMask + " compare: " + passCompareMode);
        this._writeDepth = depthMask;
        this._depthCompareMode = passCompareMode;
    };
    ContextSoftware.prototype.setProgram = function (program) {
        console.log("setProgram: " + program);
    };
    ContextSoftware.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
        console.log("setProgramConstantsFromMatrix: programType" + programType + " firstRegister: " + firstRegister + " matrix: " + matrix + " transposedMatrix: " + transposedMatrix);
    };
    ContextSoftware.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
        console.log("setProgramConstantsFromArray: programType" + programType + " firstRegister: " + firstRegister + " data: " + data + " numRegisters: " + numRegisters);
        if (firstRegister == 0 && numRegisters == 4) {
            this._projectionMatrix = new Matrix3D(data);
            this._projectionMatrix.transpose();
        }
    };
    ContextSoftware.prototype.setTextureAt = function (sampler, texture) {
        console.log("setTextureAt sample: " + sampler + " texture: " + texture);
        this._textures[sampler] = texture;
    };
    ContextSoftware.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        console.log("setVertexBufferAt index: " + index + " buffer: " + buffer + " bufferOffset: " + bufferOffset + " format: " + format);
        this._vertexBuffers[index] = buffer;
        this._vertexBufferOffsets[index] = bufferOffset;
        this._vertexBufferFormats[index] = format;
        if (format == ContextGLVertexBufferFormat.FLOAT_3) {
            this._positionBufferIndex = index;
        }
        if (format == ContextGLVertexBufferFormat.FLOAT_2) {
            this._uvBufferIndex = index;
        }
    };
    ContextSoftware.prototype.present = function () {
        console.log("present");
        //this._backBufferColor.fillRect(new Rectangle(0, 0, Math.random() * 300, Math.random() * 500), Math.random() * 100000000);
    };
    ContextSoftware.prototype.drawToBitmapImage2D = function (destination) {
    };
    ContextSoftware.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        console.log("drawIndices mode: " + mode + " firstIndex: " + firstIndex + " numIndices: " + numIndices);
        if (this._projectionMatrix == null) {
            return;
        }
        var positionBuffer = this._vertexBuffers[this._positionBufferIndex];
        var uvBuffer = this._vertexBuffers[this._uvBufferIndex];
        if (uvBuffer == null || positionBuffer == null) {
            return;
        }
        this._backBufferColor.lock();
        for (var i = firstIndex; i < numIndices; i += 3) {
            var index0 = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i] * positionBuffer.attributesPerVertex;
            var index1 = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 1] * positionBuffer.attributesPerVertex;
            var index2 = this._vertexBufferOffsets[this._positionBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 2] * positionBuffer.attributesPerVertex;
            var t0 = new Vector3D(positionBuffer.data[index0], positionBuffer.data[index0 + 1], positionBuffer.data[index0 + 2]);
            var t1 = new Vector3D(positionBuffer.data[index1], positionBuffer.data[index1 + 1], positionBuffer.data[index1 + 2]);
            var t2 = new Vector3D(positionBuffer.data[index2], positionBuffer.data[index2 + 1], positionBuffer.data[index2 + 2]);
            t0 = this._projectionMatrix.transformVector(t0);
            t1 = this._projectionMatrix.transformVector(t1);
            t2 = this._projectionMatrix.transformVector(t2);
            t0.x = t0.x / t0.w;
            t0.y = t0.y / t0.w;
            t1.x = t1.x / t1.w;
            t1.y = t1.y / t1.w;
            t2.x = t2.x / t2.w;
            t2.y = t2.y / t2.w;
            t0.x = t0.x * this._backBufferWidth + this._backBufferWidth / 2;
            t1.x = t1.x * this._backBufferWidth + this._backBufferWidth / 2;
            t2.x = t2.x * this._backBufferWidth + this._backBufferWidth / 2;
            t0.y = -t0.y * this._backBufferHeight + this._backBufferHeight / 2;
            t1.y = -t1.y * this._backBufferHeight + this._backBufferHeight / 2;
            t2.y = -t2.y * this._backBufferHeight + this._backBufferHeight / 2;
            var u0;
            var u1;
            var u2;
            if (uvBuffer) {
                index0 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i] * uvBuffer.attributesPerVertex;
                index1 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 1] * uvBuffer.attributesPerVertex;
                index2 = this._vertexBufferOffsets[this._uvBufferIndex] / 4 + indexBuffer.data[indexBuffer.startOffset + i + 2] * uvBuffer.attributesPerVertex;
                u0 = new Point(uvBuffer.data[index0], uvBuffer.data[index0 + 1]);
                u1 = new Point(uvBuffer.data[index1], uvBuffer.data[index1 + 1]);
                u2 = new Point(uvBuffer.data[index2], uvBuffer.data[index2 + 1]);
            }
            this.triangle(t0, t1, t2, u0, u1, u2);
        }
        this._backBufferColor.unlock();
    };
    ContextSoftware.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        console.log("drawVertices");
    };
    ContextSoftware.prototype.setScissorRectangle = function (rectangle) {
        //TODO:
    };
    ContextSoftware.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        //TODO:
    };
    ContextSoftware.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        //TODO:
    };
    ContextSoftware.prototype.setRenderToBackBuffer = function () {
        //TODO:
    };
    ContextSoftware.prototype.sampleDiffuse = function (uv) {
        if (this._textures[0] != null) {
            var texture = this._textures[0];
            var u = Math.abs(((uv.x * texture.width) % texture.width)) >> 0;
            var v = Math.abs(((uv.y * texture.height) % texture.height)) >> 0;
            var pos = (u + v * texture.width) * 4;
            var r = texture.data[pos];
            var g = texture.data[pos + 1];
            var b = texture.data[pos + 2];
            var a = texture.data[pos + 3];
            return ColorUtils.ARGBtoFloat32(a, r, g, b);
        }
        return ColorUtils.ARGBtoFloat32(255, uv.x * 255, uv.y * 255, 0);
    };
    ContextSoftware.prototype.putPixel = function (x, y, z, color) {
        var index = ((x >> 0) + (y >> 0) * this._backBufferWidth);
        if (this._zbuffer[index] < z) {
            return;
        }
        this._zbuffer[index] = z;
        this._drawRect.x = x;
        this._drawRect.y = y;
        this._drawRect.width = 1;
        this._drawRect.height = 1;
        //this._backBufferColor.fillRect(this._drawRect, color);
        this._backBufferColor.setPixel32(x, y, color);
    };
    ContextSoftware.prototype.drawPoint = function (point, color) {
        if (point.x >= 0 && point.y >= 0 && point.x < this._backBufferWidth && point.y < this._backBufferWidth) {
            this.putPixel(point.x, point.y, point.z, color);
        }
    };
    ContextSoftware.prototype.clamp = function (value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.max(min, Math.min(value, max));
    };
    ContextSoftware.prototype.interpolate = function (min, max, gradient) {
        return min + (max - min) * this.clamp(gradient);
    };
    ContextSoftware.prototype.processScanLine = function (currentY, pa, pb, pc, pd, uva, uvb, uvc, uvd) {
        var gradient1 = pa.y != pb.y ? (currentY - pa.y) / (pb.y - pa.y) : 1;
        var gradient2 = pc.y != pd.y ? (currentY - pc.y) / (pd.y - pc.y) : 1;
        var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
        var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;
        var z1 = this.interpolate(pa.z, pb.z, gradient1);
        var z2 = this.interpolate(pc.z, pd.z, gradient2);
        //var snl:number = this.interpolate(data.ndotla, data.ndotlb, gradient1);
        //var enl:number = this.interpolate(data.ndotlc, data.ndotld, gradient2);
        var su = this.interpolate(uva.x, uvb.x, gradient1);
        var eu = this.interpolate(uvc.x, uvd.x, gradient2);
        var sv = this.interpolate(uva.y, uvb.y, gradient1);
        var ev = this.interpolate(uvc.y, uvd.y, gradient2);
        for (var x = sx; x < ex; x++) {
            var gradient = (x - sx) / (ex - sx);
            var z = this.interpolate(z1, z2, gradient);
            //var ndotl = this.interpolate(snl, enl, gradient);
            var u = this.interpolate(su, eu, gradient);
            var v = this.interpolate(sv, ev, gradient);
            var color = this.sampleDiffuse(new Point(u, v));
            this.drawPoint(new Vector3D(x, currentY, z), color);
        }
    };
    ContextSoftware.prototype.triangle = function (p1, p2, p3, uv1, uv2, uv3) {
        var temp;
        if (p1.y > p2.y) {
            temp = p2;
            p2 = p1;
            p1 = temp;
            temp = uv2;
            uv2 = uv1;
            uv1 = temp;
        }
        if (p2.y > p3.y) {
            temp = p2;
            p2 = p3;
            p3 = temp;
            temp = uv2;
            uv2 = uv3;
            uv3 = temp;
        }
        if (p1.y > p2.y) {
            temp = p2;
            p2 = p1;
            p1 = temp;
            temp = uv2;
            uv2 = uv1;
            uv1 = temp;
        }
        var dP1P2;
        var dP1P3;
        // http://en.wikipedia.org/wiki/Slope
        if (p2.y - p1.y > 0)
            dP1P2 = (p2.x - p1.x) / (p2.y - p1.y);
        else
            dP1P2 = 0;
        if (p3.y - p1.y > 0)
            dP1P3 = (p3.x - p1.x) / (p3.y - p1.y);
        else
            dP1P3 = 0;
        if (dP1P2 > dP1P3) {
            for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                if (y < p2.y) {
                    this.processScanLine(y, p1, p3, p1, p2, uv1, uv3, uv1, uv2);
                }
                else {
                    this.processScanLine(y, p1, p3, p2, p3, uv1, uv3, uv2, uv3);
                }
            }
        }
        else {
            for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                if (y < p2.y) {
                    this.processScanLine(y, p1, p2, p1, p3, uv1, uv2, uv1, uv3);
                }
                else {
                    this.processScanLine(y, p2, p3, p1, p3, uv2, uv3, uv1, uv3);
                }
            }
        }
    };
    ContextSoftware.MAX_SAMPLERS = 8;
    return ContextSoftware;
})();
var VertexBufferProperties = (function () {
    function VertexBufferProperties(size, type, normalized) {
        this.size = size;
        this.type = type;
        this.normalized = normalized;
    }
    return VertexBufferProperties;
})();
module.exports = ContextSoftware;

},{"awayjs-core/lib/data/BitmapImage2D":undefined,"awayjs-core/lib/geom/Matrix3D":undefined,"awayjs-core/lib/geom/Point":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/utils/ColorUtils":undefined,"awayjs-stagegl/lib/base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","awayjs-stagegl/lib/base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","awayjs-stagegl/lib/base/IndexBufferSoftware":"awayjs-stagegl/lib/base/IndexBufferSoftware","awayjs-stagegl/lib/base/ProgramSoftware":"awayjs-stagegl/lib/base/ProgramSoftware","awayjs-stagegl/lib/base/TextureSoftware":"awayjs-stagegl/lib/base/TextureSoftware","awayjs-stagegl/lib/base/VertexBufferSoftware":"awayjs-stagegl/lib/base/VertexBufferSoftware"}],"awayjs-stagegl/lib/base/ContextStage3D":[function(require,module,exports){
//import swfobject					= require("awayjs-stagegl/lib/swfobject");
var Sampler = require("awayjs-stagegl/lib/aglsl/Sampler");
var ContextGLClearMask = require("awayjs-stagegl/lib/base/ContextGLClearMask");
var ContextGLProgramType = require("awayjs-stagegl/lib/base/ContextGLProgramType");
var CubeTextureFlash = require("awayjs-stagegl/lib/base/CubeTextureFlash");
var IndexBufferFlash = require("awayjs-stagegl/lib/base/IndexBufferFlash");
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ProgramFlash = require("awayjs-stagegl/lib/base/ProgramFlash");
var TextureFlash = require("awayjs-stagegl/lib/base/TextureFlash");
var VertexBufferFlash = require("awayjs-stagegl/lib/base/VertexBufferFlash");
var ContextStage3D = (function () {
    //TODO: get rid of hack that fixes including definition file
    function ContextStage3D(container, callback, include) {
        this._cmdStream = "";
        this._resources = new Array();
        var swfVersionStr = "11.0.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var flashvars = {
            id: container.id
        };
        var params = {
            quality: "high",
            bgcolor: "#ffffff",
            allowscriptaccess: "sameDomain",
            allowfullscreen: "true",
            wmode: "direct"
        };
        this._errorCheckingEnabled = false;
        this._iDriverInfo = "Unknown";
        var attributes = {
            salign: "tl",
            id: container.id,
            name: container["name"] //TODO: needed?
        };
        this._oldCanvas = container.cloneNode(); // keep the old one to restore on dispose
        this._oldParent = container.parentNode;
        var context3dObj = this;
        ContextStage3D.contexts[container.id] = this;
        function callbackSWFObject(callbackInfo) {
            if (!callbackInfo.success)
                return;
            context3dObj._container = callbackInfo.ref;
            context3dObj._iCallback = callback;
        }
        //swfobject.embedSWF("libs/molehill_js_flashbridge.swf", container.id, String(container.width), String(container.height), swfVersionStr, "", flashvars, params, attributes, callbackSWFObject);
    }
    Object.defineProperty(ContextStage3D.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextStage3D.prototype, "driverInfo", {
        get: function () {
            return this._iDriverInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextStage3D.prototype, "errorCheckingEnabled", {
        get: function () {
            return this._errorCheckingEnabled;
        },
        set: function (value) {
            if (this._errorCheckingEnabled == value)
                return;
            this._errorCheckingEnabled = value;
            this.addStream(String.fromCharCode(OpCodes.enableErrorChecking, value ? OpCodes.trueValue : OpCodes.falseValue));
            this.execute();
        },
        enumerable: true,
        configurable: true
    });
    ContextStage3D.prototype._iAddResource = function (resource) {
        this._resources.push(resource);
    };
    ContextStage3D.prototype._iRemoveResource = function (resource) {
        this._resources.splice(this._resources.indexOf(resource));
    };
    ContextStage3D.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO:streaming
        return new TextureFlash(this, width, height, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO:streaming
        return new CubeTextureFlash(this, size, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.setTextureAt = function (sampler, texture) {
        if (texture) {
            this.addStream(String.fromCharCode(OpCodes.setTextureAt) + sampler + "," + texture.id + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes.clearTextureAt) + sampler.toString() + ",");
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        //nothing to do here
    };
    ContextStage3D.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        if (triangleFace === void 0) { triangleFace = "frontAndBack"; }
        if (compareMode === void 0) { compareMode = "always"; }
        if (actionOnBothPass === void 0) { actionOnBothPass = "keep"; }
        if (actionOnDepthFail === void 0) { actionOnDepthFail = "keep"; }
        if (actionOnDepthPassStencilFail === void 0) { actionOnDepthPassStencilFail = "keep"; }
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        this.addStream(String.fromCharCode(OpCodes.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        if (readMask === void 0) { readMask = 255; }
        if (writeMask === void 0) { writeMask = 255; }
        this.addStream(String.fromCharCode(OpCodes.setStencilReferenceValue, referenceValue + OpCodes.intMask, readMask + OpCodes.intMask, writeMask + OpCodes.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        //TODO implement coordinateSystem option
        this.addStream(String.fromCharCode(OpCodes.setCulling) + triangleFaceToCull + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (firstIndex === void 0) { firstIndex = 0; }
        if (numIndices === void 0) { numIndices = -1; }
        firstIndex = firstIndex || 0;
        if (!numIndices || numIndices < 0)
            numIndices = indexBuffer.numIndices;
        //assume triangles
        this.addStream(String.fromCharCode(OpCodes.drawTriangles, indexBuffer.id + OpCodes.intMask) + firstIndex + "," + numIndices + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        if (firstVertex === void 0) { firstVertex = 0; }
        if (numVertices === void 0) { numVertices = -1; }
        //can't be done in Stage3D
    };
    ContextStage3D.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
        //this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));
        if (transposedMatrix === void 0) { transposedMatrix = false; }
        //TODO remove special case for WebGL matrix calls?
        var d = matrix.rawData;
        if (transposedMatrix) {
            this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[4], d[8], d[12]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[1], d[5], d[9], d[13]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[2], d[6], d[10], d[14]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[3], d[7], d[11], d[15]], 1);
        }
        else {
            this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[1], d[2], d[3]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[4], d[5], d[6], d[7]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[8], d[9], d[10], d[11]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[12], d[13], d[14], d[15]], 1);
        }
    };
    ContextStage3D.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
        if (numRegisters === void 0) { numRegisters = -1; }
        var startIndex;
        var target = (programType == ContextGLProgramType.VERTEX) ? OpCodes.trueValue : OpCodes.falseValue;
        for (var i = 0; i < numRegisters; i++) {
            startIndex = i * 4;
            this.addStream(String.fromCharCode(OpCodes.setProgramConstant, target, (firstRegister + i) + OpCodes.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");
            if (ContextStage3D.debug)
                this.execute();
        }
    };
    ContextStage3D.prototype.setProgram = function (program) {
        this.addStream(String.fromCharCode(OpCodes.setProgram, program.id + OpCodes.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.present = function () {
        this.addStream(String.fromCharCode(OpCodes.present));
        this.execute();
    };
    ContextStage3D.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask.ALL; }
        this.addStream(String.fromCharCode(OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.createProgram = function () {
        return new ProgramFlash(this);
    };
    ContextStage3D.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
        return new VertexBufferFlash(this, numVertices, data32PerVertex);
    };
    ContextStage3D.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferFlash(this, numIndices);
    };
    ContextStage3D.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = true; }
        this._width = width;
        this._height = height;
        //TODO: add Anitalias setting
        this.addStream(String.fromCharCode(OpCodes.configureBackBuffer) + width + "," + height + ",");
    };
    ContextStage3D.prototype.drawToBitmapImage2D = function (destination) {
        //TODO
    };
    ContextStage3D.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        if (bufferOffset === void 0) { bufferOffset = 0; }
        if (format === void 0) { format = null; }
        if (buffer) {
            this.addStream(String.fromCharCode(OpCodes.setVertexBufferAt, index + OpCodes.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes.clearVertexBufferAt, index + OpCodes.intMask));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setColorMask = function (red, green, blue, alpha) {
        this.addStream(String.fromCharCode(OpCodes.setColorMask, red ? OpCodes.trueValue : OpCodes.falseValue, green ? OpCodes.trueValue : OpCodes.falseValue, blue ? OpCodes.trueValue : OpCodes.falseValue, alpha ? OpCodes.trueValue : OpCodes.falseValue));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this.addStream(String.fromCharCode(OpCodes.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (antiAlias === void 0) { antiAlias = 0; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        if (target === null || target === undefined) {
            this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture));
        }
        else {
            this.addStream(String.fromCharCode(OpCodes.setRenderToTexture, enableDepthAndStencil ? OpCodes.trueValue : OpCodes.falseValue) + target.id + "," + (antiAlias || 0) + ",");
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToBackBuffer = function () {
        this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setScissorRectangle = function (rectangle) {
        if (rectangle) {
            this.addStream(String.fromCharCode(OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes.clearScissorRect));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this.addStream(String.fromCharCode(OpCodes.setDepthTest, depthMask ? OpCodes.trueValue : OpCodes.falseValue) + passCompareMode + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.dispose = function () {
        if (this._container == null)
            return;
        console.log("Context3D dispose, releasing " + this._resources.length + " resources.");
        while (this._resources.length)
            this._resources[0].dispose();
        if (this._container) {
            // encode command
            this.addStream(String.fromCharCode(OpCodes.disposeContext));
            this.execute();
            //swfobject.removeSWF(this._oldCanvas.id);
            if (this._oldCanvas && this._oldParent) {
                this._oldParent.appendChild(this._oldCanvas);
                this._oldParent = null;
            }
            this._container = null;
        }
        this._oldCanvas = null;
    };
    ContextStage3D.prototype.addStream = function (stream) {
        this._cmdStream += stream;
    };
    ContextStage3D.prototype.execute = function () {
        if (ContextStage3D.logStream)
            console.log(this._cmdStream);
        var result = this._container["CallFunction"]("<invoke name=\"execStage3dOpStream\" returntype=\"javascript\"><arguments><string>" + this._cmdStream + "</string></arguments></invoke>");
        if (Number(result) <= -3)
            throw "Exec stream failed";
        this._cmdStream = "";
        return Number(result);
    };
    ContextStage3D.contexts = new Object();
    ContextStage3D.maxvertexconstants = 128;
    ContextStage3D.maxfragconstants = 28;
    ContextStage3D.maxtemp = 8;
    ContextStage3D.maxstreams = 8;
    ContextStage3D.maxtextures = 8;
    ContextStage3D.defaultsampler = new Sampler();
    ContextStage3D.debug = false;
    ContextStage3D.logStream = false;
    return ContextStage3D;
})();
/**
* global function for flash callback
*/
function mountain_js_context_available(id, driverInfo) {
    var ctx = ContextStage3D.contexts[id];
    if (ctx._iCallback) {
        ctx._iDriverInfo = driverInfo;
        // get out of the current JS stack frame and call back from flash player
        var timeOutId = window.setTimeout(function () {
            window.clearTimeout(timeOutId);
            try {
                ctx._iCallback(ctx);
            }
            catch (e) {
                console.log("Callback failed during flash initialization with '" + e.toString() + "'");
            }
        }, 1);
    }
}
module.exports = ContextStage3D;

},{"awayjs-stagegl/lib/aglsl/Sampler":"awayjs-stagegl/lib/aglsl/Sampler","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","awayjs-stagegl/lib/base/CubeTextureFlash":"awayjs-stagegl/lib/base/CubeTextureFlash","awayjs-stagegl/lib/base/IndexBufferFlash":"awayjs-stagegl/lib/base/IndexBufferFlash","awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ProgramFlash":"awayjs-stagegl/lib/base/ProgramFlash","awayjs-stagegl/lib/base/TextureFlash":"awayjs-stagegl/lib/base/TextureFlash","awayjs-stagegl/lib/base/VertexBufferFlash":"awayjs-stagegl/lib/base/VertexBufferFlash"}],"awayjs-stagegl/lib/base/ContextWebGL":[function(require,module,exports){
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var ByteArray = require("awayjs-core/lib/utils/ByteArray");
var ContextGLBlendFactor = require("awayjs-stagegl/lib/base/ContextGLBlendFactor");
var ContextGLDrawMode = require("awayjs-stagegl/lib/base/ContextGLDrawMode");
var ContextGLClearMask = require("awayjs-stagegl/lib/base/ContextGLClearMask");
var ContextGLCompareMode = require("awayjs-stagegl/lib/base/ContextGLCompareMode");
var ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
var ContextGLProgramType = require("awayjs-stagegl/lib/base/ContextGLProgramType");
var ContextGLStencilAction = require("awayjs-stagegl/lib/base/ContextGLStencilAction");
var ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
var ContextGLTriangleFace = require("awayjs-stagegl/lib/base/ContextGLTriangleFace");
var ContextGLVertexBufferFormat = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
var ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
var CubeTextureWebGL = require("awayjs-stagegl/lib/base/CubeTextureWebGL");
var IndexBufferWebGL = require("awayjs-stagegl/lib/base/IndexBufferWebGL");
var ProgramWebGL = require("awayjs-stagegl/lib/base/ProgramWebGL");
var TextureWebGL = require("awayjs-stagegl/lib/base/TextureWebGL");
var SamplerState = require("awayjs-stagegl/lib/base/SamplerState");
var VertexBufferWebGL = require("awayjs-stagegl/lib/base/VertexBufferWebGL");
var ContextWebGL = (function () {
    function ContextWebGL(canvas) {
        this._blendFactorDictionary = new Object();
        this._drawModeDictionary = new Object();
        this._compareModeDictionary = new Object();
        this._stencilActionDictionary = new Object();
        this._textureIndexDictionary = new Array(8);
        this._textureTypeDictionary = new Object();
        this._wrapDictionary = new Object();
        this._filterDictionary = new Object();
        this._mipmapFilterDictionary = new Object();
        this._uniformLocationNameDictionary = new Object();
        this._vertexBufferPropertiesDictionary = new Object();
        this._indexBufferList = new Array();
        this._vertexBufferList = new Array();
        this._textureList = new Array();
        this._programList = new Array();
        this._samplerStates = new Array(8);
        this._stencilReferenceValue = 0;
        this._stencilReadMask = 0xff;
        this._separateStencil = false;
        this._container = canvas;
        try {
            this._gl = canvas.getContext("experimental-webgl", { premultipliedAlpha: false, alpha: false, stencil: true });
            if (!this._gl)
                this._gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: false, stencil: true });
        }
        catch (e) {
        }
        if (this._gl) {
            //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_SUCCESS ) );
            if (this._gl.getExtension("OES_standard_derivatives")) {
                this._standardDerivatives = true;
            }
            else {
                this._standardDerivatives = false;
            }
            //setup shortcut dictionaries
            this._blendFactorDictionary[ContextGLBlendFactor.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_ALPHA] = this._gl.DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_COLOR] = this._gl.DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = this._gl.ONE_MINUS_DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = this._gl.ONE_MINUS_DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = this._gl.ONE_MINUS_SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = this._gl.ONE_MINUS_SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_ALPHA] = this._gl.SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_COLOR] = this._gl.SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor.ZERO] = this._gl.ZERO;
            this._drawModeDictionary[ContextGLDrawMode.LINES] = this._gl.LINES;
            this._drawModeDictionary[ContextGLDrawMode.TRIANGLES] = this._gl.TRIANGLES;
            this._compareModeDictionary[ContextGLCompareMode.ALWAYS] = this._gl.ALWAYS;
            this._compareModeDictionary[ContextGLCompareMode.EQUAL] = this._gl.EQUAL;
            this._compareModeDictionary[ContextGLCompareMode.GREATER] = this._gl.GREATER;
            this._compareModeDictionary[ContextGLCompareMode.GREATER_EQUAL] = this._gl.GEQUAL;
            this._compareModeDictionary[ContextGLCompareMode.LESS] = this._gl.LESS;
            this._compareModeDictionary[ContextGLCompareMode.LESS_EQUAL] = this._gl.LEQUAL;
            this._compareModeDictionary[ContextGLCompareMode.NEVER] = this._gl.NEVER;
            this._compareModeDictionary[ContextGLCompareMode.NOT_EQUAL] = this._gl.NOTEQUAL;
            this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_SATURATE] = this._gl.DECR;
            this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_WRAP] = this._gl.DECR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_SATURATE] = this._gl.INCR;
            this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_WRAP] = this._gl.INCR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction.INVERT] = this._gl.INVERT;
            this._stencilActionDictionary[ContextGLStencilAction.KEEP] = this._gl.KEEP;
            this._stencilActionDictionary[ContextGLStencilAction.SET] = this._gl.REPLACE;
            this._stencilActionDictionary[ContextGLStencilAction.ZERO] = this._gl.ZERO;
            this._textureIndexDictionary[0] = this._gl.TEXTURE0;
            this._textureIndexDictionary[1] = this._gl.TEXTURE1;
            this._textureIndexDictionary[2] = this._gl.TEXTURE2;
            this._textureIndexDictionary[3] = this._gl.TEXTURE3;
            this._textureIndexDictionary[4] = this._gl.TEXTURE4;
            this._textureIndexDictionary[5] = this._gl.TEXTURE5;
            this._textureIndexDictionary[6] = this._gl.TEXTURE6;
            this._textureIndexDictionary[7] = this._gl.TEXTURE7;
            this._textureTypeDictionary["texture2d"] = this._gl.TEXTURE_2D;
            this._textureTypeDictionary["textureCube"] = this._gl.TEXTURE_CUBE_MAP;
            this._wrapDictionary[ContextGLWrapMode.REPEAT] = this._gl.REPEAT;
            this._wrapDictionary[ContextGLWrapMode.CLAMP] = this._gl.CLAMP_TO_EDGE;
            this._filterDictionary[ContextGLTextureFilter.LINEAR] = this._gl.LINEAR;
            this._filterDictionary[ContextGLTextureFilter.NEAREST] = this._gl.NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNEAREST] = this._gl.LINEAR_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPLINEAR] = this._gl.LINEAR_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNONE] = this._gl.LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNEAREST] = this._gl.NEAREST_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPLINEAR] = this._gl.NEAREST_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNONE] = this._gl.NEAREST;
            this._uniformLocationNameDictionary[ContextGLProgramType.VERTEX] = "vc";
            this._uniformLocationNameDictionary[ContextGLProgramType.FRAGMENT] = "fc";
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_1] = new VertexBufferProperties(1, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_2] = new VertexBufferProperties(2, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_3] = new VertexBufferProperties(3, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_4] = new VertexBufferProperties(4, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.BYTES_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_BYTE, true);
            this._stencilCompareMode = this._gl.ALWAYS;
            this._stencilCompareModeBack = this._gl.ALWAYS;
            this._stencilCompareModeFront = this._gl.ALWAYS;
        }
        else {
            //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
            alert("WebGL is not available.");
        }
        for (var i = 0; i < ContextWebGL.MAX_SAMPLERS; ++i) {
            this._samplerStates[i] = new SamplerState();
            this._samplerStates[i].wrap = this._gl.REPEAT;
            this._samplerStates[i].filter = this._gl.LINEAR;
            this._samplerStates[i].mipfilter = this._gl.LINEAR;
        }
    }
    Object.defineProperty(ContextWebGL.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextWebGL.prototype, "standardDerivatives", {
        get: function () {
            return this._standardDerivatives;
        },
        enumerable: true,
        configurable: true
    });
    ContextWebGL.prototype.gl = function () {
        return this._gl;
    };
    ContextWebGL.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask.ALL; }
        if (!this._drawing) {
            this.updateBlendStatus();
            this._drawing = true;
        }
        var glmask = 0;
        if (mask & ContextGLClearMask.COLOR)
            glmask |= this._gl.COLOR_BUFFER_BIT;
        if (mask & ContextGLClearMask.STENCIL)
            glmask |= this._gl.STENCIL_BUFFER_BIT;
        if (mask & ContextGLClearMask.DEPTH)
            glmask |= this._gl.DEPTH_BUFFER_BIT;
        this._gl.clearColor(red, green, blue, alpha);
        this._gl.clearDepth(depth);
        this._gl.clearStencil(stencil);
        this._gl.clear(glmask);
    };
    ContextWebGL.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = true; }
        this._width = width;
        this._height = height;
        if (enableDepthAndStencil) {
            this._gl.enable(this._gl.STENCIL_TEST);
            this._gl.enable(this._gl.DEPTH_TEST);
        }
        this._gl.viewport['width'] = width;
        this._gl.viewport['height'] = height;
        this._gl.viewport(0, 0, width, height);
    };
    ContextWebGL.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        var texture = new CubeTextureWebGL(this._gl, size);
        this._textureList.push(texture);
        return texture;
    };
    ContextWebGL.prototype.createIndexBuffer = function (numIndices) {
        var indexBuffer = new IndexBufferWebGL(this._gl, numIndices);
        this._indexBufferList.push(indexBuffer);
        return indexBuffer;
    };
    ContextWebGL.prototype.createProgram = function () {
        var program = new ProgramWebGL(this._gl);
        this._programList.push(program);
        return program;
    };
    ContextWebGL.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO streaming
        var texture = new TextureWebGL(this._gl, width, height);
        this._textureList.push(texture);
        return texture;
    };
    ContextWebGL.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        var vertexBuffer = new VertexBufferWebGL(this._gl, numVertices, dataPerVertex);
        this._vertexBufferList.push(vertexBuffer);
        return vertexBuffer;
    };
    ContextWebGL.prototype.dispose = function () {
        var i;
        for (i = 0; i < this._indexBufferList.length; ++i)
            this._indexBufferList[i].dispose();
        this._indexBufferList = null;
        for (i = 0; i < this._vertexBufferList.length; ++i)
            this._vertexBufferList[i].dispose();
        this._vertexBufferList = null;
        for (i = 0; i < this._textureList.length; ++i)
            this._textureList[i].dispose();
        this._textureList = null;
        for (i = 0; i < this._programList.length; ++i)
            this._programList[i].dispose();
        for (i = 0; i < this._samplerStates.length; ++i)
            this._samplerStates[i] = null;
        this._programList = null;
    };
    ContextWebGL.prototype.drawToBitmapImage2D = function (destination) {
        var arrayBuffer = new ArrayBuffer(destination.width * destination.height * 4);
        this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array(arrayBuffer));
        var byteArray = new ByteArray();
        byteArray.setArrayBuffer(arrayBuffer);
        destination.setPixels(new Rectangle(0, 0, destination.width, destination.height), byteArray);
    };
    ContextWebGL.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (firstIndex === void 0) { firstIndex = 0; }
        if (numIndices === void 0) { numIndices = -1; }
        if (!this._drawing)
            throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
        this._gl.drawElements(this._drawModeDictionary[mode], (numIndices == -1) ? indexBuffer.numIndices : numIndices, this._gl.UNSIGNED_SHORT, firstIndex * 2);
    };
    ContextWebGL.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        if (firstVertex === void 0) { firstVertex = 0; }
        if (numVertices === void 0) { numVertices = -1; }
        if (!this._drawing)
            throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
        this._gl.drawArrays(this._drawModeDictionary[mode], firstVertex, numVertices);
    };
    ContextWebGL.prototype.present = function () {
        this._drawing = false;
    };
    ContextWebGL.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this._blendEnabled = true;
        this._blendSourceFactor = this._blendFactorDictionary[sourceFactor];
        this._blendDestinationFactor = this._blendFactorDictionary[destinationFactor];
        this.updateBlendStatus();
    };
    ContextWebGL.prototype.setColorMask = function (red, green, blue, alpha) {
        this._gl.colorMask(red, green, blue, alpha);
    };
    ContextWebGL.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        if (triangleFaceToCull == ContextGLTriangleFace.NONE) {
            this._gl.disable(this._gl.CULL_FACE);
        }
        else {
            this._gl.enable(this._gl.CULL_FACE);
            this._gl.cullFace(this.translateTriangleFace(triangleFaceToCull, coordinateSystem));
        }
    };
    // TODO ContextGLCompareMode
    ContextWebGL.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this._gl.depthFunc(this._compareModeDictionary[passCompareMode]);
        this._gl.depthMask(depthMask);
    };
    ContextWebGL.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        if (triangleFace === void 0) { triangleFace = "frontAndBack"; }
        if (compareMode === void 0) { compareMode = "always"; }
        if (actionOnBothPass === void 0) { actionOnBothPass = "keep"; }
        if (actionOnDepthFail === void 0) { actionOnDepthFail = "keep"; }
        if (actionOnDepthPassStencilFail === void 0) { actionOnDepthPassStencilFail = "keep"; }
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        this._separateStencil = triangleFace != "frontAndBack";
        var compareModeGL = this._compareModeDictionary[compareMode];
        var fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
        var zFail = this._stencilActionDictionary[actionOnDepthFail];
        var pass = this._stencilActionDictionary[actionOnBothPass];
        if (!this._separateStencil) {
            this._stencilCompareMode = compareModeGL;
            this._gl.stencilFunc(compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOp(fail, zFail, pass);
        }
        else if (triangleFace == "back") {
            this._stencilCompareModeBack = compareModeGL;
            this._gl.stencilFuncSeparate(this._gl.BACK, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOpSeparate(this._gl.BACK, fail, zFail, pass);
        }
        else if (triangleFace == "front") {
            this._stencilCompareModeFront = compareModeGL;
            this._gl.stencilFuncSeparate(this._gl.FRONT, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
            this._gl.stencilOpSeparate(this._gl.FRONT, fail, zFail, pass);
        }
    };
    ContextWebGL.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        this._stencilReferenceValue = referenceValue;
        this._stencilReadMask = readMask;
        if (this._separateStencil) {
            this._gl.stencilFuncSeparate(this._gl.FRONT, this._stencilCompareModeFront, referenceValue, readMask);
            this._gl.stencilFuncSeparate(this._gl.BACK, this._stencilCompareModeBack, referenceValue, readMask);
        }
        else {
            this._gl.stencilFunc(this._stencilCompareMode, referenceValue, readMask);
        }
        this._gl.stencilMask(writeMask);
    };
    ContextWebGL.prototype.setProgram = function (program) {
        //TODO decide on construction/reference resposibilities
        this._currentProgram = program;
        program.focusProgram();
    };
    ContextWebGL.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
        //this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));
        if (transposedMatrix === void 0) { transposedMatrix = false; }
        //TODO remove special case for WebGL matrix calls?
        var d = matrix.rawData;
        if (transposedMatrix) {
            this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[4], d[8], d[12]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[1], d[5], d[9], d[13]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[2], d[6], d[10], d[14]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[3], d[7], d[11], d[15]], 1);
        }
        else {
            this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[1], d[2], d[3]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[4], d[5], d[6], d[7]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[8], d[9], d[10], d[11]], 1);
            this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[12], d[13], d[14], d[15]], 1);
        }
    };
    ContextWebGL.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
        if (numRegisters === void 0) { numRegisters = -1; }
        var locationName = this._uniformLocationNameDictionary[programType];
        var startIndex;
        for (var i = 0; i < numRegisters; i++) {
            startIndex = i * 4;
            this._gl.uniform4f(this._gl.getUniformLocation(this._currentProgram.glProgram, locationName + (firstRegister + i)), data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]);
        }
    };
    ContextWebGL.prototype.setScissorRectangle = function (rectangle) {
        if (!rectangle) {
            this._gl.disable(this._gl.SCISSOR_TEST);
            return;
        }
        this._gl.enable(this._gl.SCISSOR_TEST);
        this._gl.scissor(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    };
    ContextWebGL.prototype.setTextureAt = function (sampler, texture) {
        var samplerState = this._samplerStates[sampler];
        if (this._activeTexture != sampler && (texture || samplerState.type)) {
            this._activeTexture = sampler;
            this._gl.activeTexture(this._textureIndexDictionary[sampler]);
        }
        if (!texture) {
            if (samplerState.type) {
                this._gl.bindTexture(samplerState.type, null);
                samplerState.type = null;
            }
            return;
        }
        var textureType = this._textureTypeDictionary[texture.textureType];
        samplerState.type = textureType;
        this._gl.bindTexture(textureType, texture.glTexture);
        this._gl.uniform1i(this._gl.getUniformLocation(this._currentProgram.glProgram, "fs" + sampler), sampler);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_S, samplerState.wrap);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_T, samplerState.wrap);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_MAG_FILTER, samplerState.filter);
        this._gl.texParameteri(textureType, this._gl.TEXTURE_MIN_FILTER, samplerState.mipfilter);
    };
    ContextWebGL.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        if (0 <= sampler && sampler < ContextWebGL.MAX_SAMPLERS) {
            this._samplerStates[sampler].wrap = this._wrapDictionary[wrap];
            this._samplerStates[sampler].filter = this._filterDictionary[filter];
            this._samplerStates[sampler].mipfilter = this._mipmapFilterDictionary[filter][mipfilter];
        }
        else {
            throw "Sampler is out of bounds.";
        }
    };
    ContextWebGL.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        if (bufferOffset === void 0) { bufferOffset = 0; }
        if (format === void 0) { format = null; }
        var location = this._currentProgram ? this._gl.getAttribLocation(this._currentProgram.glProgram, "va" + index) : -1;
        if (!buffer) {
            if (location > -1)
                this._gl.disableVertexAttribArray(location);
            return;
        }
        var properties = this._vertexBufferPropertiesDictionary[format];
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer.glBuffer);
        this._gl.enableVertexAttribArray(location);
        this._gl.vertexAttribPointer(location, properties.size, properties.type, properties.normalized, buffer.dataPerVertex, bufferOffset);
    };
    ContextWebGL.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (antiAlias === void 0) { antiAlias = 0; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        var texture = target;
        var frameBuffer = texture.frameBuffer;
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);
        if (enableDepthAndStencil) {
            this._gl.enable(this._gl.STENCIL_TEST);
            this._gl.enable(this._gl.DEPTH_TEST);
        }
        this._gl.viewport(0, 0, texture.width, texture.height);
    };
    ContextWebGL.prototype.setRenderToBackBuffer = function () {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    };
    ContextWebGL.prototype.updateBlendStatus = function () {
        if (this._blendEnabled) {
            this._gl.enable(this._gl.BLEND);
            this._gl.blendEquation(this._gl.FUNC_ADD);
            this._gl.blendFunc(this._blendSourceFactor, this._blendDestinationFactor);
        }
        else {
            this._gl.disable(this._gl.BLEND);
        }
    };
    ContextWebGL.prototype.translateTriangleFace = function (triangleFace, coordinateSystem) {
        switch (triangleFace) {
            case ContextGLTriangleFace.BACK:
                return (coordinateSystem == "leftHanded") ? this._gl.FRONT : this._gl.BACK;
                break;
            case ContextGLTriangleFace.FRONT:
                return (coordinateSystem == "leftHanded") ? this._gl.BACK : this._gl.FRONT;
                break;
            case ContextGLTriangleFace.FRONT_AND_BACK:
                return this._gl.FRONT_AND_BACK;
                break;
            default:
                throw "Unknown ContextGLTriangleFace type.";
        }
    };
    ContextWebGL.MAX_SAMPLERS = 8;
    ContextWebGL.modulo = 0;
    return ContextWebGL;
})();
var VertexBufferProperties = (function () {
    function VertexBufferProperties(size, type, normalized) {
        this.size = size;
        this.type = type;
        this.normalized = normalized;
    }
    return VertexBufferProperties;
})();
module.exports = ContextWebGL;

},{"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/utils/ByteArray":undefined,"awayjs-stagegl/lib/base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","awayjs-stagegl/lib/base/ContextGLDrawMode":"awayjs-stagegl/lib/base/ContextGLDrawMode","awayjs-stagegl/lib/base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","awayjs-stagegl/lib/base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","awayjs-stagegl/lib/base/ContextGLStencilAction":"awayjs-stagegl/lib/base/ContextGLStencilAction","awayjs-stagegl/lib/base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","awayjs-stagegl/lib/base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","awayjs-stagegl/lib/base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","awayjs-stagegl/lib/base/CubeTextureWebGL":"awayjs-stagegl/lib/base/CubeTextureWebGL","awayjs-stagegl/lib/base/IndexBufferWebGL":"awayjs-stagegl/lib/base/IndexBufferWebGL","awayjs-stagegl/lib/base/ProgramWebGL":"awayjs-stagegl/lib/base/ProgramWebGL","awayjs-stagegl/lib/base/SamplerState":"awayjs-stagegl/lib/base/SamplerState","awayjs-stagegl/lib/base/TextureWebGL":"awayjs-stagegl/lib/base/TextureWebGL","awayjs-stagegl/lib/base/VertexBufferWebGL":"awayjs-stagegl/lib/base/VertexBufferWebGL"}],"awayjs-stagegl/lib/base/CubeTextureFlash":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ByteArrayBase = require("awayjs-core/lib/utils/ByteArrayBase");
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
var CubeTextureFlash = (function (_super) {
    __extends(CubeTextureFlash, _super);
    function CubeTextureFlash(context, size, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._size = size;
        this._context.addStream(String.fromCharCode(OpCodes.initCubeTexture, (forRTT ? OpCodes.trueValue : OpCodes.falseValue)) + size + "," + streaming + "," + format + "$");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    Object.defineProperty(CubeTextureFlash.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    CubeTextureFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes.disposeCubeTexture) + this._pId.toString() + ",");
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    CubeTextureFlash.prototype.uploadFromData = function (data, side, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        if (data instanceof HTMLImageElement) {
            var can = document.createElement("canvas");
            var w = data.width;
            var h = data.height;
            can.width = w;
            can.height = h;
            var ctx = can.getContext("2d");
            ctx.drawImage(data, 0, 0);
            data = ctx.getImageData(0, 0, w, h).data;
        }
        var pos = 0;
        var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
            return data[pos++];
        }, null);
        this._context.addStream(String.fromCharCode(OpCodes.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    CubeTextureFlash.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
    };
    return CubeTextureFlash;
})(ResourceBaseFlash);
module.exports = CubeTextureFlash;

},{"awayjs-core/lib/utils/ByteArrayBase":undefined,"awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/CubeTextureWebGL":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
var CubeTextureWebGL = (function (_super) {
    __extends(CubeTextureWebGL, _super);
    function CubeTextureWebGL(gl, size) {
        _super.call(this, gl);
        this._textureSelectorDictionary = new Array(6);
        this.textureType = "textureCube";
        this._size = size;
        this._texture = this._gl.createTexture();
        this._textureSelectorDictionary[0] = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
        this._textureSelectorDictionary[1] = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
        this._textureSelectorDictionary[2] = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
        this._textureSelectorDictionary[3] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
        this._textureSelectorDictionary[4] = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
        this._textureSelectorDictionary[5] = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
    }
    CubeTextureWebGL.prototype.dispose = function () {
        this._gl.deleteTexture(this._texture);
    };
    CubeTextureWebGL.prototype.uploadFromData = function (data, side, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._texture);
        this._gl.texImage2D(this._textureSelectorDictionary[side], miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
        this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
    };
    CubeTextureWebGL.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
    };
    Object.defineProperty(CubeTextureWebGL.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CubeTextureWebGL.prototype, "glTexture", {
        get: function () {
            return this._texture;
        },
        enumerable: true,
        configurable: true
    });
    return CubeTextureWebGL;
})(TextureBaseWebGL);
module.exports = CubeTextureWebGL;

},{"awayjs-stagegl/lib/base/TextureBaseWebGL":"awayjs-stagegl/lib/base/TextureBaseWebGL"}],"awayjs-stagegl/lib/base/IContextGL":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/ICubeTexture":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/IIndexBuffer":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/IProgram":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/ITextureBase":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/ITexture":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/IVertexBuffer":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/base/IndexBufferFlash":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
var IndexBufferFlash = (function (_super) {
    __extends(IndexBufferFlash, _super);
    function IndexBufferFlash(context, numIndices) {
        _super.call(this);
        this._context = context;
        this._numIndices = numIndices;
        this._context.addStream(String.fromCharCode(OpCodes.initIndexBuffer, numIndices + OpCodes.intMask));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    IndexBufferFlash.prototype.uploadFromArray = function (data, startOffset, count) {
        this._context.addStream(String.fromCharCode(OpCodes.uploadArrayIndexBuffer, this._pId + OpCodes.intMask) + data.join() + "#" + startOffset + "," + count + ",");
        this._context.execute();
    };
    IndexBufferFlash.prototype.uploadFromByteArray = function (data, startOffset, count) {
    };
    IndexBufferFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes.disposeIndexBuffer, this._pId + OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    Object.defineProperty(IndexBufferFlash.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferFlash;
})(ResourceBaseFlash);
module.exports = IndexBufferFlash;

},{"awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/IndexBufferSoftware":[function(require,module,exports){
var IndexBufferSoftware = (function () {
    function IndexBufferSoftware(numIndices) {
        this._numIndices = numIndices;
    }
    IndexBufferSoftware.prototype.uploadFromArray = function (data, startOffset, count) {
        this._startOffset = startOffset * 2;
        this._data = new Uint16Array(data);
    };
    IndexBufferSoftware.prototype.uploadFromByteArray = function (data, startOffset, count) {
        this._startOffset = startOffset * 2;
        this._data = new Uint16Array(data);
    };
    IndexBufferSoftware.prototype.dispose = function () {
        this._data.length = 0;
    };
    Object.defineProperty(IndexBufferSoftware.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferSoftware.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferSoftware.prototype, "startOffset", {
        get: function () {
            return this._startOffset;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferSoftware;
})();
module.exports = IndexBufferSoftware;

},{}],"awayjs-stagegl/lib/base/IndexBufferWebGL":[function(require,module,exports){
var IndexBufferWebGL = (function () {
    function IndexBufferWebGL(gl, numIndices) {
        this._gl = gl;
        this._buffer = this._gl.createBuffer();
        this._numIndices = numIndices;
    }
    IndexBufferWebGL.prototype.uploadFromArray = function (data, startOffset, count) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
        if (startOffset)
            this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, new Uint16Array(data));
        else
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._gl.STATIC_DRAW);
    };
    IndexBufferWebGL.prototype.uploadFromByteArray = function (data, startOffset, count) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);
        if (startOffset)
            this._gl.bufferSubData(this._gl.ELEMENT_ARRAY_BUFFER, startOffset * 2, data);
        else
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
    };
    IndexBufferWebGL.prototype.dispose = function () {
        this._gl.deleteBuffer(this._buffer);
    };
    Object.defineProperty(IndexBufferWebGL.prototype, "numIndices", {
        get: function () {
            return this._numIndices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexBufferWebGL.prototype, "glBuffer", {
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    return IndexBufferWebGL;
})();
module.exports = IndexBufferWebGL;

},{}],"awayjs-stagegl/lib/base/OpCodes":[function(require,module,exports){
var OpCodes = (function () {
    function OpCodes() {
    }
    OpCodes.trueValue = 32;
    OpCodes.falseValue = 33;
    OpCodes.intMask = 63;
    OpCodes.drawTriangles = 41;
    OpCodes.setProgramConstant = 42;
    OpCodes.setProgram = 43;
    OpCodes.present = 44;
    OpCodes.clear = 45;
    OpCodes.initProgram = 46;
    OpCodes.initVertexBuffer = 47;
    OpCodes.initIndexBuffer = 48;
    OpCodes.configureBackBuffer = 49;
    OpCodes.uploadArrayIndexBuffer = 50;
    OpCodes.uploadArrayVertexBuffer = 51;
    OpCodes.uploadAGALBytesProgram = 52;
    OpCodes.setVertexBufferAt = 53;
    OpCodes.uploadBytesIndexBuffer = 54;
    OpCodes.uploadBytesVertexBuffer = 55;
    OpCodes.setColorMask = 56;
    OpCodes.setDepthTest = 57;
    OpCodes.disposeProgram = 58;
    OpCodes.disposeContext = 59;
    // must skip 60 '<' as it will invalidate xml being passed over the bridge
    OpCodes.disposeVertexBuffer = 61;
    // must skip 62 '>' as it will invalidate xml being passed over the bridge
    OpCodes.disposeIndexBuffer = 63;
    OpCodes.initTexture = 64;
    OpCodes.setTextureAt = 65;
    OpCodes.uploadBytesTexture = 66;
    OpCodes.disposeTexture = 67;
    OpCodes.setCulling = 68;
    OpCodes.setScissorRect = 69;
    OpCodes.clearScissorRect = 70;
    OpCodes.setBlendFactors = 71;
    OpCodes.setRenderToTexture = 72;
    OpCodes.clearTextureAt = 73;
    OpCodes.clearVertexBufferAt = 74;
    OpCodes.setStencilActions = 75;
    OpCodes.setStencilReferenceValue = 76;
    OpCodes.initCubeTexture = 77;
    OpCodes.disposeCubeTexture = 78;
    OpCodes.uploadBytesCubeTexture = 79;
    OpCodes.clearRenderToTexture = 80;
    OpCodes.enableErrorChecking = 81;
    return OpCodes;
})();
module.exports = OpCodes;

},{}],"awayjs-stagegl/lib/base/ProgramFlash":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
var ProgramFlash = (function (_super) {
    __extends(ProgramFlash, _super);
    function ProgramFlash(context) {
        _super.call(this);
        this._context = context;
        this._context.addStream(String.fromCharCode(OpCodes.initProgram));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    ProgramFlash.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._context.addStream(String.fromCharCode(OpCodes.uploadAGALBytesProgram, this._pId + OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");
        if (ContextStage3D.debug)
            this._context.execute();
    };
    ProgramFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes.disposeProgram, this._pId + OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return ProgramFlash;
})(ResourceBaseFlash);
module.exports = ProgramFlash;

},{"awayjs-stagegl/lib/base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D","awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/ProgramSoftware":[function(require,module,exports){
var ProgramSoftware = (function () {
    function ProgramSoftware() {
    }
    ProgramSoftware.prototype.upload = function (vertexProgram, fragmentProgram) {
    };
    ProgramSoftware.prototype.dispose = function () {
    };
    return ProgramSoftware;
})();
module.exports = ProgramSoftware;

},{}],"awayjs-stagegl/lib/base/ProgramWebGL":[function(require,module,exports){
var AGALTokenizer = require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
var AGLSLParser = require("awayjs-stagegl/lib/aglsl/AGLSLParser");
var ProgramWebGL = (function () {
    function ProgramWebGL(gl) {
        this._gl = gl;
        this._program = this._gl.createProgram();
    }
    ProgramWebGL.prototype.upload = function (vertexProgram, fragmentProgram) {
        var vertexString = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram));
        var fragmentString = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram));
        this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._gl.shaderSource(this._vertexShader, vertexString);
        this._gl.compileShader(this._vertexShader);
        if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS)) {
            throw new Error(this._gl.getShaderInfoLog(this._vertexShader));
            return;
        }
        this._gl.shaderSource(this._fragmentShader, fragmentString);
        this._gl.compileShader(this._fragmentShader);
        if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS)) {
            throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));
            return;
        }
        this._gl.attachShader(this._program, this._vertexShader);
        this._gl.attachShader(this._program, this._fragmentShader);
        this._gl.linkProgram(this._program);
        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
            throw new Error(this._gl.getProgramInfoLog(this._program));
        }
    };
    ProgramWebGL.prototype.dispose = function () {
        this._gl.deleteProgram(this._program);
    };
    ProgramWebGL.prototype.focusProgram = function () {
        this._gl.useProgram(this._program);
    };
    Object.defineProperty(ProgramWebGL.prototype, "glProgram", {
        get: function () {
            return this._program;
        },
        enumerable: true,
        configurable: true
    });
    ProgramWebGL._tokenizer = new AGALTokenizer();
    ProgramWebGL._aglslParser = new AGLSLParser();
    return ProgramWebGL;
})();
module.exports = ProgramWebGL;

},{"awayjs-stagegl/lib/aglsl/AGALTokenizer":"awayjs-stagegl/lib/aglsl/AGALTokenizer","awayjs-stagegl/lib/aglsl/AGLSLParser":"awayjs-stagegl/lib/aglsl/AGLSLParser"}],"awayjs-stagegl/lib/base/ResourceBaseFlash":[function(require,module,exports){
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
})();
module.exports = ResourceBaseFlash;

},{}],"awayjs-stagegl/lib/base/SamplerState":[function(require,module,exports){
var SamplerState = (function () {
    function SamplerState() {
    }
    return SamplerState;
})();
module.exports = SamplerState;

},{}],"awayjs-stagegl/lib/base/Stage":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Rectangle = require("awayjs-core/lib/geom/Rectangle");
var Event = require("awayjs-core/lib/events/Event");
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var CSS = require("awayjs-core/lib/utils/CSS");
var ContextMode = require("awayjs-stagegl/lib/base/ContextMode");
var ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
var ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
var ContextGLVertexBufferFormat = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
var ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
var ContextStage3D = require("awayjs-stagegl/lib/base/ContextStage3D");
var ContextWebGL = require("awayjs-stagegl/lib/base/ContextWebGL");
var ContextSoftware = require("awayjs-stagegl/lib/base/ContextSoftware");
var StageEvent = require("awayjs-stagegl/lib/events/StageEvent");
var ImageObjectPool = require("awayjs-stagegl/lib/pool/ImageObjectPool");
var ProgramDataPool = require("awayjs-stagegl/lib/pool/ProgramDataPool");
var AttributesBufferVOPool = require("awayjs-stagegl/lib/vos/AttributesBufferVOPool");
/**
 * Stage provides a proxy class to handle the creation and attachment of the Context
 * (and in turn the back buffer) it uses. Stage should never be created directly,
 * but requested through StageManager.
 *
 * @see away.managers.StageManager
 *
 */
var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage(container, stageIndex, stageManager, forceSoftware, profile) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        _super.call(this);
        this._programData = new Array();
        this._x = 0;
        this._y = 0;
        //private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame
        this._stageIndex = -1;
        this._antiAlias = 0;
        //private var _activeVertexBuffers : Vector.<VertexBuffer> = new Vector.<VertexBuffer>(8, true);
        //private var _activeTextures : Vector.<TextureBase> = new Vector.<TextureBase>(8, true);
        this._renderTarget = null;
        this._renderSurfaceSelector = 0;
        //private _mouse3DManager:away.managers.Mouse3DManager;
        //private _touch3DManager:Touch3DManager; //TODO: imeplement dependency Touch3DManager
        this._initialised = false;
        this._bufferFormatDictionary = new Array(5);
        this._imageObjectPool = new ImageObjectPool(this);
        this._attributesBufferVOPool = new AttributesBufferVOPool(this);
        this._programDataPool = new ProgramDataPool(this);
        this._container = container;
        this._stageIndex = stageIndex;
        this._stageManager = stageManager;
        this._viewPort = new Rectangle();
        this._enableDepthAndStencil = true;
        CSS.setElementX(this._container, 0);
        CSS.setElementY(this._container, 0);
        this._bufferFormatDictionary[1] = new Array(5);
        this._bufferFormatDictionary[1][4] = ContextGLVertexBufferFormat.BYTES_4;
        this._bufferFormatDictionary[4] = new Array(5);
        this._bufferFormatDictionary[4][1] = ContextGLVertexBufferFormat.FLOAT_1;
        this._bufferFormatDictionary[4][2] = ContextGLVertexBufferFormat.FLOAT_2;
        this._bufferFormatDictionary[4][3] = ContextGLVertexBufferFormat.FLOAT_3;
        this._bufferFormatDictionary[4][4] = ContextGLVertexBufferFormat.FLOAT_4;
        this.visible = true;
    }
    Stage.prototype.getProgramData = function (vertexString, fragmentString) {
        return this._programDataPool.getItem(vertexString, fragmentString);
    };
    Stage.prototype.setRenderTarget = function (target, enableDepthAndStencil, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        if (this._renderTarget === target && surfaceSelector == this._renderSurfaceSelector && this._enableDepthAndStencil == enableDepthAndStencil)
            return;
        this._renderTarget = target;
        this._renderSurfaceSelector = surfaceSelector;
        this._enableDepthAndStencil = enableDepthAndStencil;
        if (target) {
            this._context.setRenderToTexture(this.getImageObject(target).getTexture(this._context), enableDepthAndStencil, this._antiAlias, surfaceSelector);
        }
        else {
            this._context.setRenderToBackBuffer();
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        }
    };
    Stage.prototype.getImageObject = function (image) {
        return this._imageObjectPool.getItem(image);
    };
    Stage.prototype.getAttributesBufferVO = function (attributesBuffer) {
        return this._attributesBufferVOPool.getItem(attributesBuffer);
    };
    /**
     * Requests a Context object to attach to the managed gl canvas.
     */
    Stage.prototype.requestContext = function (forceSoftware, profile, mode) {
        // If forcing software, we can be certain that the
        // returned Context will be running software mode.
        // If not, we can't be sure and should stick to the
        // old value (will likely be same if re-requesting.)
        var _this = this;
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        if (this._usesSoftwareRendering != null)
            this._usesSoftwareRendering = forceSoftware;
        this._profile = profile;
        try {
            if (mode == ContextMode.FLASH)
                new ContextStage3D(this._container, function (context) { return _this._callback(context); });
            else if (mode == ContextMode.SOFTWARE)
                this._context = new ContextSoftware(this._container);
            else
                this._context = new ContextWebGL(this._container);
        }
        catch (e) {
            try {
                if (mode == ContextMode.AUTO)
                    new ContextStage3D(this._container, function (context) { return _this._callback(context); });
                else
                    this.dispatchEvent(new Event(Event.ERROR));
            }
            catch (e) {
                this.dispatchEvent(new Event(Event.ERROR));
            }
        }
        if (this._context)
            this._callback(this._context);
    };
    Object.defineProperty(Stage.prototype, "width", {
        /**
         * The width of the gl canvas
         */
        get: function () {
            return this._width;
        },
        set: function (val) {
            if (this._width == val)
                return;
            CSS.setElementWidth(this._container, val);
            this._width = this._viewPort.width = val;
            this._backBufferDirty = true;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "height", {
        /**
         * The height of the gl canvas
         */
        get: function () {
            return this._height;
        },
        set: function (val) {
            if (this._height == val)
                return;
            CSS.setElementHeight(this._container, val);
            this._height = this._viewPort.height = val;
            this._backBufferDirty = true;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "x", {
        /**
         * The x position of the gl canvas
         */
        get: function () {
            return this._x;
        },
        set: function (val) {
            if (this._x == val)
                return;
            CSS.setElementX(this._container, val);
            this._x = this._viewPort.x = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "y", {
        /**
         * The y position of the gl canvas
         */
        get: function () {
            return this._y;
        },
        set: function (val) {
            if (this._y == val)
                return;
            CSS.setElementY(this._container, val);
            this._y = this._viewPort.y = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "visible", {
        get: function () {
            return CSS.getElementVisibility(this._container);
        },
        set: function (val) {
            CSS.setElementVisibility(this._container, val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "context", {
        /**
         * The Context object associated with the given stage object.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.notifyViewportUpdated = function () {
        if (this._viewportDirty)
            return;
        this._viewportDirty = true;
        //if (!this.hasEventListener(StageEvent.VIEWPORT_UPDATED))
        //return;
        //if (!_viewportUpdated)
        this._viewportUpdated = new StageEvent(StageEvent.VIEWPORT_UPDATED);
        this.dispatchEvent(this._viewportUpdated);
    };
    Stage.prototype.notifyEnterFrame = function () {
        //if (!hasEventListener(Event.ENTER_FRAME))
        //return;
        if (!this._enterFrame)
            this._enterFrame = new Event(Event.ENTER_FRAME);
        this.dispatchEvent(this._enterFrame);
    };
    Stage.prototype.notifyExitFrame = function () {
        //if (!hasEventListener(Event.EXIT_FRAME))
        //return;
        if (!this._exitFrame)
            this._exitFrame = new Event(Event.EXIT_FRAME);
        this.dispatchEvent(this._exitFrame);
    };
    Object.defineProperty(Stage.prototype, "profile", {
        get: function () {
            return this._profile;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Disposes the Stage object, freeing the Context attached to the Stage.
     */
    Stage.prototype.dispose = function () {
        this._stageManager.iRemoveStage(this);
        this.freeContext();
        this._stageManager = null;
        this._stageIndex = -1;
    };
    /**
     * Configures the back buffer associated with the Stage object.
     * @param backBufferWidth The width of the backbuffer.
     * @param backBufferHeight The height of the backbuffer.
     * @param antiAlias The amount of anti-aliasing to use.
     * @param enableDepthAndStencil Indicates whether the back buffer contains a depth and stencil buffer.
     */
    Stage.prototype.configureBackBuffer = function (backBufferWidth, backBufferHeight, antiAlias, enableDepthAndStencil) {
        this.width = backBufferWidth;
        this.height = backBufferHeight;
        this._antiAlias = antiAlias;
        this._enableDepthAndStencil = enableDepthAndStencil;
        if (this._context)
            this._context.configureBackBuffer(backBufferWidth, backBufferHeight, antiAlias, enableDepthAndStencil);
    };
    Object.defineProperty(Stage.prototype, "enableDepthAndStencil", {
        /*
         * Indicates whether the depth and stencil buffer is used
         */
        get: function () {
            return this._enableDepthAndStencil;
        },
        set: function (enableDepthAndStencil) {
            this._enableDepthAndStencil = enableDepthAndStencil;
            this._backBufferDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "renderTarget", {
        get: function () {
            return this._renderTarget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "renderSurfaceSelector", {
        get: function () {
            return this._renderSurfaceSelector;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Clear and reset the back buffer when using a shared context
     */
    Stage.prototype.clear = function () {
        if (!this._context)
            return;
        if (this._backBufferDirty) {
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
            this._backBufferDirty = false;
        }
        this._context.clear((this._color & 0xff000000) >>> 24, (this._color & 0xff0000) >>> 16, (this._color & 0xff00) >>> 8, this._color & 0xff);
        this._bufferClear = true;
    };
    /**
     * Registers an event listener object with an EventDispatcher object so that the listener receives notification of an event. Special case for enterframe and exitframe events - will switch StageProxy into automatic render mode.
     * You can register event listeners on all nodes in the display list for a specific type of event, phase, and priority.
     *
     * @param type The type of event.
     * @param listener The listener function that processes the event.
     * @param useCapture Determines whether the listener works in the capture phase or the target and bubbling phases. If useCapture is set to true, the listener processes the event only during the capture phase and not in the target or bubbling phase. If useCapture is false, the listener processes the event only during the target or bubbling phase. To listen for the event in all three phases, call addEventListener twice, once with useCapture set to true, then again with useCapture set to false.
     * @param priority The priority level of the event listener. The priority is designated by a signed 32-bit integer. The higher the number, the higher the priority. All listeners with priority n are processed before listeners of priority n-1. If two or more listeners share the same priority, they are processed in the order in which they were added. The default priority is 0.
     * @param useWeakReference Determines whether the reference to the listener is strong or weak. A strong reference (the default) prevents your listener from being garbage-collected. A weak reference does not.
     */
    Stage.prototype.addEventListener = function (type, listener) {
        _super.prototype.addEventListener.call(this, type, listener);
        //away.Debug.throwPIR( 'StageProxy' , 'addEventListener' ,  'EnterFrame, ExitFrame');
        //if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) ){//&& ! this._frameEventDriver.hasEventListener(Event.ENTER_FRAME)){
        //_frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);
        //}
        /* Original code
         if ((type == Event.ENTER_FRAME || type == Event.EXIT_FRAME) && ! _frameEventDriver.hasEventListener(Event.ENTER_FRAME)){

         _frameEventDriver.addEventListener(Event.ENTER_FRAME, onEnterFrame, useCapture, priority, useWeakReference);


         }
         */
    };
    /**
     * Removes a listener from the EventDispatcher object. Special case for enterframe and exitframe events - will switch StageProxy out of automatic render mode.
     * If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
     *
     * @param type The type of event.
     * @param listener The listener object to remove.
     * @param useCapture Specifies whether the listener was registered for the capture phase or the target and bubbling phases. If the listener was registered for both the capture phase and the target and bubbling phases, two calls to removeEventListener() are required to remove both, one call with useCapture() set to true, and another call with useCapture() set to false.
     */
    Stage.prototype.removeEventListener = function (type, listener) {
        _super.prototype.removeEventListener.call(this, type, listener);
        /*
         // Remove the main rendering listener if no EnterFrame listeners remain
         if (    ! this.hasEventListener(Event.ENTER_FRAME , this.onEnterFrame , this )
         &&  ! this.hasEventListener(Event.EXIT_FRAME , this.onEnterFrame , this) ) //&& _frameEventDriver.hasEventListener(Event.ENTER_FRAME))
         {

         //_frameEventDriver.removeEventListener(Event.ENTER_FRAME, this.onEnterFrame, this );

         }
         */
    };
    Object.defineProperty(Stage.prototype, "scissorRect", {
        get: function () {
            return this._scissorRect;
        },
        set: function (value) {
            this._scissorRect = value;
            this._context.setScissorRectangle(this._scissorRect);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "stageIndex", {
        /**
         * The index of the Stage which is managed by this instance of StageProxy.
         */
        get: function () {
            return this._stageIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "usesSoftwareRendering", {
        /**
         * Indicates whether the Stage managed by this proxy is running in software mode.
         * Remember to wait for the CONTEXT_CREATED event before checking this property,
         * as only then will it be guaranteed to be accurate.
         */
        get: function () {
            return this._usesSoftwareRendering;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "antiAlias", {
        /**
         * The antiAliasing of the Stage.
         */
        get: function () {
            return this._antiAlias;
        },
        set: function (antiAlias) {
            this._antiAlias = antiAlias;
            this._backBufferDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "viewPort", {
        /**
         * A viewPort rectangle equivalent of the Stage size and position.
         */
        get: function () {
            this._viewportDirty = false;
            return this._viewPort;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "color", {
        /**
         * The background color of the Stage.
         */
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "bufferClear", {
        /**
         * The freshly cleared state of the backbuffer before any rendering
         */
        get: function () {
            return this._bufferClear;
        },
        set: function (newBufferClear) {
            this._bufferClear = newBufferClear;
        },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.registerProgram = function (programData) {
        var i = 0;
        while (this._programData[i] != null)
            i++;
        this._programData[i] = programData;
        programData.id = i;
    };
    Stage.prototype.unRegisterProgram = function (programData) {
        this._programData[programData.id] = null;
        programData.id = -1;
    };
    /*
     * Access to fire mouseevents across multiple layered view3D instances
     */
    //		public get mouse3DManager():Mouse3DManager
    //		{
    //			return this._mouse3DManager;
    //		}
    //
    //		public set mouse3DManager(value:Mouse3DManager)
    //		{
    //			this._mouse3DManager = value;
    //		}
    /* TODO: implement dependency Touch3DManager
     public get touch3DManager():Touch3DManager
     {
     return _touch3DManager;
     }

     public set touch3DManager(value:Touch3DManager)
     {
     _touch3DManager = value;
     }
     */
    /**
     * Frees the Context associated with this StageProxy.
     */
    Stage.prototype.freeContext = function () {
        if (this._context) {
            this._context.dispose();
            this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
        }
        this._context = null;
        this._initialised = false;
    };
    /**
     * The Enter_Frame handler for processing the proxy.ENTER_FRAME and proxy.EXIT_FRAME event handlers.
     * Typically the proxy.ENTER_FRAME listener would render the layers for this Stage instance.
     */
    Stage.prototype.onEnterFrame = function (event) {
        if (!this._context)
            return;
        // Clear the stage instance
        this.clear();
        //notify the enterframe listeners
        this.notifyEnterFrame();
        // Call the present() to render the frame
        if (!this._context)
            this._context.present();
        //notify the exitframe listeners
        this.notifyExitFrame();
    };
    Stage.prototype.recoverFromDisposal = function () {
        if (!this._context)
            return false;
        //away.Debug.throwPIR( 'StageProxy' , 'recoverFromDisposal' , '' );
        /*
         if (this._iContext.driverInfo == "Disposed")
         {
         this._iContext = null;
         this.dispatchEvent(new StageEvent(StageEvent.CONTEXT_DISPOSED));
         return false;

         }
         */
        return true;
    };
    Stage.prototype._callback = function (context) {
        this._context = context;
        this._container = this._context.container;
        // Only configure back buffer if width and height have been set,
        // which they may not have been if View.render() has yet to be
        // invoked for the first time.
        if (this._width && this._height)
            this._context.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        // Dispatch the appropriate event depending on whether context was
        // created for the first time or recreated after a device loss.
        this.dispatchEvent(new StageEvent(this._initialised ? StageEvent.CONTEXT_RECREATED : StageEvent.CONTEXT_CREATED));
        this._initialised = true;
    };
    Stage.prototype.setVertexBuffer = function (index, buffer, size, dimensions, offset) {
        this._context.setVertexBufferAt(index, buffer, offset, this._bufferFormatDictionary[size][dimensions]);
    };
    Stage.prototype.setSamplerState = function (index, repeat, smooth, mipmap) {
        var wrap = repeat ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP;
        var filter = smooth ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST;
        var mipfilter = mipmap ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE;
        this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
    };
    return Stage;
})(EventDispatcher);
module.exports = Stage;

},{"awayjs-core/lib/events/Event":undefined,"awayjs-core/lib/events/EventDispatcher":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/utils/CSS":undefined,"awayjs-stagegl/lib/base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","awayjs-stagegl/lib/base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","awayjs-stagegl/lib/base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","awayjs-stagegl/lib/base/ContextMode":"awayjs-stagegl/lib/base/ContextMode","awayjs-stagegl/lib/base/ContextSoftware":"awayjs-stagegl/lib/base/ContextSoftware","awayjs-stagegl/lib/base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D","awayjs-stagegl/lib/base/ContextWebGL":"awayjs-stagegl/lib/base/ContextWebGL","awayjs-stagegl/lib/events/StageEvent":"awayjs-stagegl/lib/events/StageEvent","awayjs-stagegl/lib/pool/ImageObjectPool":"awayjs-stagegl/lib/pool/ImageObjectPool","awayjs-stagegl/lib/pool/ProgramDataPool":"awayjs-stagegl/lib/pool/ProgramDataPool","awayjs-stagegl/lib/vos/AttributesBufferVOPool":"awayjs-stagegl/lib/vos/AttributesBufferVOPool"}],"awayjs-stagegl/lib/base/TextureBaseWebGL":[function(require,module,exports){
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var TextureBaseWebGL = (function () {
    function TextureBaseWebGL(gl) {
        this.textureType = "";
        this._gl = gl;
    }
    TextureBaseWebGL.prototype.dispose = function () {
        throw "Abstract method must be overridden.";
    };
    Object.defineProperty(TextureBaseWebGL.prototype, "glTexture", {
        get: function () {
            throw new AbstractMethodError();
        },
        enumerable: true,
        configurable: true
    });
    return TextureBaseWebGL;
})();
module.exports = TextureBaseWebGL;

},{"awayjs-core/lib/errors/AbstractMethodError":undefined}],"awayjs-stagegl/lib/base/TextureFlash":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ByteArrayBase = require("awayjs-core/lib/utils/ByteArrayBase");
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
var TextureFlash = (function (_super) {
    __extends(TextureFlash, _super);
    function TextureFlash(context, width, height, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._width = width;
        this._height = height;
        this._context.addStream(String.fromCharCode(OpCodes.initTexture, (forRTT ? OpCodes.trueValue : OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    Object.defineProperty(TextureFlash.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureFlash.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    TextureFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes.disposeTexture) + this._pId.toString() + ",");
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    TextureFlash.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        if (data instanceof HTMLImageElement) {
            var can = document.createElement("canvas");
            var w = data.width;
            var h = data.height;
            can.width = w;
            can.height = h;
            var ctx = can.getContext("2d");
            ctx.drawImage(data, 0, 0);
            data = ctx.getImageData(0, 0, w, h).data;
        }
        var pos = 0;
        var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
            return data[pos++];
        }, null);
        this._context.addStream(String.fromCharCode(OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    return TextureFlash;
})(ResourceBaseFlash);
module.exports = TextureFlash;

},{"awayjs-core/lib/utils/ByteArrayBase":undefined,"awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/TextureSoftware":[function(require,module,exports){
var TextureSoftware = (function () {
    function TextureSoftware(width, height) {
        this.textureType = "texture2d";
        this._width = width;
        this._height = height;
    }
    TextureSoftware.prototype.dispose = function () {
        this._data = null;
    };
    Object.defineProperty(TextureSoftware.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureSoftware.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    TextureSoftware.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        if (miplevel == 0) {
            console.log("uploadFromData: " + data + " miplevel: " + miplevel);
            this._data = new Uint8Array(data.data);
            this._mipLevel = miplevel;
        }
    };
    Object.defineProperty(TextureSoftware.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    return TextureSoftware;
})();
module.exports = TextureSoftware;

},{}],"awayjs-stagegl/lib/base/TextureWebGL":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TextureBaseWebGL = require("awayjs-stagegl/lib/base/TextureBaseWebGL");
var TextureWebGL = (function (_super) {
    __extends(TextureWebGL, _super);
    function TextureWebGL(gl, width, height) {
        _super.call(this, gl);
        this.textureType = "texture2d";
        this._width = width;
        this._height = height;
        this._glTexture = this._gl.createTexture();
    }
    TextureWebGL.prototype.dispose = function () {
        this._gl.deleteTexture(this._glTexture);
    };
    Object.defineProperty(TextureWebGL.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureWebGL.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureWebGL.prototype, "frameBuffer", {
        get: function () {
            if (!this._frameBuffer) {
                this._frameBuffer = this._gl.createFramebuffer();
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
                var renderBuffer = this._gl.createRenderbuffer();
                this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
                this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, this._width, this._height);
                this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
                this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            }
            return this._frameBuffer;
        },
        enumerable: true,
        configurable: true
    });
    TextureWebGL.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
        this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    };
    TextureWebGL.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
        var ext = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        //this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
    };
    Object.defineProperty(TextureWebGL.prototype, "glTexture", {
        get: function () {
            return this._glTexture;
        },
        enumerable: true,
        configurable: true
    });
    TextureWebGL.prototype.generateMipmaps = function () {
        //TODO: implement generating mipmaps
        //this._gl.bindTexture( this._gl.TEXTURE_2D, this._glTexture );
        //this._gl.generateMipmap(this._gl.TEXTURE_2D);
        //this._gl.bindTexture( this._gl.TEXTURE_2D, null );
    };
    return TextureWebGL;
})(TextureBaseWebGL);
module.exports = TextureWebGL;

},{"awayjs-stagegl/lib/base/TextureBaseWebGL":"awayjs-stagegl/lib/base/TextureBaseWebGL"}],"awayjs-stagegl/lib/base/VertexBufferFlash":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OpCodes = require("awayjs-stagegl/lib/base/OpCodes");
var ResourceBaseFlash = require("awayjs-stagegl/lib/base/ResourceBaseFlash");
var VertexBufferFlash = (function (_super) {
    __extends(VertexBufferFlash, _super);
    function VertexBufferFlash(context, numVertices, dataPerVertex) {
        _super.call(this);
        this._context = context;
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
        this._context.addStream(String.fromCharCode(OpCodes.initVertexBuffer, dataPerVertex + OpCodes.intMask) + numVertices.toString() + ",");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    VertexBufferFlash.prototype.uploadFromArray = function (data, startVertex, numVertices) {
        this._context.addStream(String.fromCharCode(OpCodes.uploadArrayVertexBuffer, this._pId + OpCodes.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
        this._context.execute();
    };
    VertexBufferFlash.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
    };
    Object.defineProperty(VertexBufferFlash.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferFlash.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes.disposeVertexBuffer, this._pId + OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return VertexBufferFlash;
})(ResourceBaseFlash);
module.exports = VertexBufferFlash;

},{"awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/VertexBufferSoftware":[function(require,module,exports){
var VertexBufferSoftware = (function () {
    function VertexBufferSoftware(numVertices, dataPerVertex) {
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }
    VertexBufferSoftware.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        this._dataOffset = startVertex * this._dataPerVertex;
        this._data = new Float32Array(vertices);
    };
    VertexBufferSoftware.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
        this._dataOffset = startVertex * this._dataPerVertex;
        this._data = new Float32Array(data);
    };
    Object.defineProperty(VertexBufferSoftware.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "attributesPerVertex", {
        get: function () {
            return this._dataPerVertex / 4;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferSoftware.prototype.dispose = function () {
        this._data.length = 0;
    };
    Object.defineProperty(VertexBufferSoftware.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "dataOffset", {
        get: function () {
            return this._dataOffset;
        },
        enumerable: true,
        configurable: true
    });
    return VertexBufferSoftware;
})();
module.exports = VertexBufferSoftware;

},{}],"awayjs-stagegl/lib/base/VertexBufferWebGL":[function(require,module,exports){
var VertexBufferWebGL = (function () {
    function VertexBufferWebGL(gl, numVertices, dataPerVertex) {
        this._gl = gl;
        this._buffer = this._gl.createBuffer();
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }
    VertexBufferWebGL.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        if (startVertex)
            this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex * this._dataPerVertex, new Float32Array(vertices));
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
    };
    VertexBufferWebGL.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        if (startVertex)
            this._gl.bufferSubData(this._gl.ARRAY_BUFFER, startVertex * this._dataPerVertex, data);
        else
            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
    };
    Object.defineProperty(VertexBufferWebGL.prototype, "numVertices", {
        get: function () {
            return this._numVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferWebGL.prototype, "dataPerVertex", {
        get: function () {
            return this._dataPerVertex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferWebGL.prototype, "glBuffer", {
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    VertexBufferWebGL.prototype.dispose = function () {
        this._gl.deleteBuffer(this._buffer);
    };
    return VertexBufferWebGL;
})();
module.exports = VertexBufferWebGL;

},{}],"awayjs-stagegl/lib/events/StageEvent":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Event = require("awayjs-core/lib/events/Event");
var StageEvent = (function (_super) {
    __extends(StageEvent, _super);
    function StageEvent(type) {
        _super.call(this, type);
    }
    StageEvent.CONTEXT_CREATED = "contextCreated";
    StageEvent.CONTEXT_DISPOSED = "contextDisposed";
    StageEvent.CONTEXT_RECREATED = "contextRecreated";
    StageEvent.VIEWPORT_UPDATED = "viewportUpdated";
    return StageEvent;
})(Event);
module.exports = StageEvent;

},{"awayjs-core/lib/events/Event":undefined}],"awayjs-stagegl/lib/managers/StageManager":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EventDispatcher = require("awayjs-core/lib/events/EventDispatcher");
var ArgumentError = require("awayjs-core/lib/errors/ArgumentError");
var Stage = require("awayjs-stagegl/lib/base/Stage");
var StageEvent = require("awayjs-stagegl/lib/events/StageEvent");
/**
 * The StageManager class provides a multiton object that handles management for Stage objects.
 *
 * @see away.base.Stage
 */
var StageManager = (function (_super) {
    __extends(StageManager, _super);
    /**
     * Creates a new StageManager class.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @private
     */
    function StageManager() {
        var _this = this;
        _super.call(this);
        this._stages = new Array(StageManager.STAGE_MAX_QUANTITY);
        this._onContextCreatedDelegate = function (event) { return _this.onContextCreated(event); };
    }
    /**
     * Gets a StageManager instance for the given Stage object.
     * @param stage The Stage object that contains the Stage objects to be managed.
     * @return The StageManager instance for the given Stage object.
     */
    StageManager.getInstance = function () {
        if (this._instance == null)
            this._instance = new StageManager();
        return this._instance;
    };
    /**
     * Requests the Stage for the given index.
     *
     * @param index The index of the requested Stage.
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The Stage for the given index.
     */
    StageManager.prototype.getStageAt = function (index, forceSoftware, profile, mode) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        if (index < 0 || index >= StageManager.STAGE_MAX_QUANTITY)
            throw new ArgumentError("Index is out of bounds [0.." + StageManager.STAGE_MAX_QUANTITY + "]");
        if (!this._stages[index]) {
            StageManager._numStages++;
            var canvas = document.createElement("canvas");
            canvas.id = "stage" + index;
            document.body.appendChild(canvas);
            var stage = this._stages[index] = new Stage(canvas, index, this, forceSoftware, profile);
            stage.addEventListener(StageEvent.CONTEXT_CREATED, this._onContextCreatedDelegate);
            stage.requestContext(forceSoftware, profile, mode);
        }
        return stage;
    };
    /**
     * Removes a Stage from the manager.
     * @param stage
     * @private
     */
    StageManager.prototype.iRemoveStage = function (stage) {
        StageManager._numStages--;
        stage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextCreatedDelegate);
        this._stages[stage.stageIndex] = null;
    };
    /**
     * Get the next available stage. An error is thrown if there are no StageProxies available
     * @param forceSoftware Whether to force software mode even if hardware acceleration is available.
     * @param profile The compatibility profile, an enumeration of ContextProfile
     * @return The allocated stage
     */
    StageManager.prototype.getFreeStage = function (forceSoftware, profile, mode) {
        if (forceSoftware === void 0) { forceSoftware = false; }
        if (profile === void 0) { profile = "baseline"; }
        if (mode === void 0) { mode = "auto"; }
        var i = 0;
        var len = this._stages.length;
        while (i < len) {
            if (!this._stages[i])
                return this.getStageAt(i, forceSoftware, profile, mode);
            ++i;
        }
        return null;
    };
    Object.defineProperty(StageManager.prototype, "hasFreeStage", {
        /**
         * Checks if a new stage can be created and managed by the class.
         * @return true if there is one slot free for a new stage
         */
        get: function () {
            return StageManager._numStages < StageManager.STAGE_MAX_QUANTITY ? true : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsFree", {
        /**
         * Returns the amount of stage objects that can be created and managed by the class
         * @return the amount of free slots
         */
        get: function () {
            return StageManager.STAGE_MAX_QUANTITY - StageManager._numStages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsUsed", {
        /**
         * Returns the amount of Stage objects currently managed by the class.
         * @return the amount of slots used
         */
        get: function () {
            return StageManager._numStages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StageManager.prototype, "numSlotsTotal", {
        /**
         * The maximum amount of Stage objects that can be managed by the class
         */
        get: function () {
            return this._stages.length;
        },
        enumerable: true,
        configurable: true
    });
    StageManager.prototype.onContextCreated = function (event) {
        //var stage:Stage = <Stage> e.target;
        //document.body.appendChild(stage.canvas)
    };
    StageManager.STAGE_MAX_QUANTITY = 8;
    StageManager._numStages = 0;
    return StageManager;
})(EventDispatcher);
module.exports = StageManager;

},{"awayjs-core/lib/errors/ArgumentError":undefined,"awayjs-core/lib/events/EventDispatcher":undefined,"awayjs-stagegl/lib/base/Stage":"awayjs-stagegl/lib/base/Stage","awayjs-stagegl/lib/events/StageEvent":"awayjs-stagegl/lib/events/StageEvent"}],"awayjs-stagegl/lib/pool/BitmapImage2DObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BitmapImage2D = require("awayjs-core/lib/data/BitmapImage2D");
var MipmapGenerator = require("awayjs-core/lib/utils/MipmapGenerator");
var Image2DObject = require("awayjs-stagegl/lib/pool/Image2DObject");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var BitmapImage2DObject = (function (_super) {
    __extends(BitmapImage2DObject, _super);
    function BitmapImage2DObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    BitmapImage2DObject.prototype.activate = function (index, repeat, smooth, mipmap) {
        _super.prototype.activate.call(this, index, repeat, smooth, mipmap);
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        console.log("activateTexture " + this._invalid);
        if (this._invalid) {
            this._invalid = false;
            if (mipmap) {
                var mipmapData = this._mipmapData || (this._mipmapData = new Array());
                MipmapGenerator._generateMipMaps(this._image.getCanvas(), mipmapData, true);
                var len = mipmapData.length;
                console.log("tryUpload 1");
                for (var i = 0; i < len; i++)
                    this._texture.uploadFromData(mipmapData[i].getImageData(), i);
            }
            else {
                console.log("tryUpload 2");
                this._texture.uploadFromData(this._image.getImageData(), 0);
            }
        }
    };
    /**
     *
     */
    BitmapImage2DObject.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        var len = this._mipmapData.length;
        for (var i = 0; i < len; i++)
            MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
    };
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    BitmapImage2DObject.prototype.getTexture = function (context) {
        if (!this._texture) {
            this._invalid = true;
            return _super.prototype.getTexture.call(this, context);
        }
        return this._texture;
    };
    /**
     *
     */
    BitmapImage2DObject.assetClass = BitmapImage2D;
    return BitmapImage2DObject;
})(Image2DObject);
module.exports = BitmapImage2DObject;

},{"awayjs-core/lib/data/BitmapImage2D":undefined,"awayjs-core/lib/utils/MipmapGenerator":undefined,"awayjs-stagegl/lib/pool/Image2DObject":"awayjs-stagegl/lib/pool/Image2DObject"}],"awayjs-stagegl/lib/pool/BitmapImageCubeObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BitmapImageCube = require("awayjs-core/lib/data/BitmapImageCube");
var MipmapGenerator = require("awayjs-core/lib/utils/MipmapGenerator");
var ImageCubeObject = require("awayjs-stagegl/lib/pool/ImageCubeObject");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var BitmapImageCubeObject = (function (_super) {
    __extends(BitmapImageCubeObject, _super);
    function BitmapImageCubeObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
        this._mipmapDataArray = new Array(6);
    }
    BitmapImageCubeObject.prototype.activate = function (index, repeat, smooth, mipmap) {
        _super.prototype.activate.call(this, index, repeat, smooth, mipmap);
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        if (this._invalid) {
            this._invalid = false;
            for (var i = 0; i < 6; ++i) {
                if (mipmap) {
                    var mipmapData = this._mipmapDataArray[i] || (this._mipmapDataArray[i] = new Array());
                    MipmapGenerator._generateMipMaps(this._image.getCanvas(i), mipmapData, true);
                    var len = mipmapData.length;
                    for (var j = 0; j < len; j++)
                        this._texture.uploadFromData(mipmapData[j].getImageData(), i, j);
                }
                else {
                    this._texture.uploadFromData(this._image.getImageData(i), i, 0);
                }
            }
        }
    };
    /**
     *
     */
    BitmapImageCubeObject.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        for (var i = 0; i < 6; i++) {
            var mipmapData = this._mipmapDataArray[i];
            var len = mipmapData.length;
            for (var j = 0; j < len; i++)
                MipmapGenerator._freeMipMapHolder(mipmapData[j]);
        }
    };
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    BitmapImageCubeObject.prototype.getTexture = function (context) {
        if (!this._texture) {
            this._invalid = true;
            return _super.prototype.getTexture.call(this, context);
        }
        return this._texture;
    };
    /**
     *
     */
    BitmapImageCubeObject.assetClass = BitmapImageCube;
    return BitmapImageCubeObject;
})(ImageCubeObject);
module.exports = BitmapImageCubeObject;

},{"awayjs-core/lib/data/BitmapImageCube":undefined,"awayjs-core/lib/utils/MipmapGenerator":undefined,"awayjs-stagegl/lib/pool/ImageCubeObject":"awayjs-stagegl/lib/pool/ImageCubeObject"}],"awayjs-stagegl/lib/pool/IImageObjectClass":[function(require,module,exports){

},{}],"awayjs-stagegl/lib/pool/Image2DObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ImageObjectBase = require("awayjs-stagegl/lib/pool/ImageObjectBase");
var ContextGLTextureFormat = require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var Image2DObject = (function (_super) {
    __extends(Image2DObject, _super);
    function Image2DObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    Image2DObject.prototype.getTexture = function (context) {
        return this._texture || (this._texture = context.createTexture(this._image.width, this._image.height, ContextGLTextureFormat.BGRA, true));
    };
    return Image2DObject;
})(ImageObjectBase);
module.exports = Image2DObject;

},{"awayjs-stagegl/lib/base/ContextGLTextureFormat":"awayjs-stagegl/lib/base/ContextGLTextureFormat","awayjs-stagegl/lib/pool/ImageObjectBase":"awayjs-stagegl/lib/pool/ImageObjectBase"}],"awayjs-stagegl/lib/pool/ImageCubeObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ImageObjectBase = require("awayjs-stagegl/lib/pool/ImageObjectBase");
var ContextGLTextureFormat = require("awayjs-stagegl/lib/base/ContextGLTextureFormat");
/**
 *
 * @class away.pool.ImageCubeObjectBase
 */
var ImageCubeObject = (function (_super) {
    __extends(ImageCubeObject, _super);
    function ImageCubeObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    ImageCubeObject.prototype.getTexture = function (context) {
        return this._texture || (this._texture = context.createCubeTexture(this._image.size, ContextGLTextureFormat.BGRA, false));
    };
    return ImageCubeObject;
})(ImageObjectBase);
module.exports = ImageCubeObject;

},{"awayjs-stagegl/lib/base/ContextGLTextureFormat":"awayjs-stagegl/lib/base/ContextGLTextureFormat","awayjs-stagegl/lib/pool/ImageObjectBase":"awayjs-stagegl/lib/pool/ImageObjectBase"}],"awayjs-stagegl/lib/pool/ImageObjectBase":[function(require,module,exports){
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var ImageObjectBase = (function () {
    function ImageObjectBase(pool, image, stage) {
        this._pool = pool;
        this._image = image;
        this._stage = stage;
        this.invalidate();
    }
    /**
     *
     */
    ImageObjectBase.prototype.dispose = function () {
        this._pool.disposeItem(this._image);
        this._texture.dispose();
        this._texture = null;
    };
    /**
     *
     */
    ImageObjectBase.prototype.invalidate = function () {
        this._invalid = true;
    };
    ImageObjectBase.prototype.activate = function (index, repeat, smooth, mipmap) {
        this._stage.setSamplerState(index, repeat, smooth, mipmap);
        this._stage.context.setTextureAt(index, this.getTexture(this._stage.context));
    };
    ImageObjectBase.prototype.getTexture = function (context) {
        throw new AbstractMethodError();
    };
    return ImageObjectBase;
})();
module.exports = ImageObjectBase;

},{"awayjs-core/lib/errors/AbstractMethodError":undefined}],"awayjs-stagegl/lib/pool/ImageObjectPool":[function(require,module,exports){
var BitmapImage2DObject = require("awayjs-stagegl/lib/pool/BitmapImage2DObject");
var BitmapImageCubeObject = require("awayjs-stagegl/lib/pool/BitmapImageCubeObject");
var RenderImage2DObject = require("awayjs-stagegl/lib/pool/RenderImage2DObject");
var RenderImageCubeObject = require("awayjs-stagegl/lib/pool/RenderImageCubeObject");
var SpecularImage2DObject = require("awayjs-stagegl/lib/pool/SpecularImage2DObject");
/**
 * @class away.pool.ImageObjectPool
 */
var ImageObjectPool = (function () {
    /**
     *
     */
    function ImageObjectPool(stage) {
        this._pool = new Object();
        this._stage = stage;
    }
    /**
     *
     * @param image
     * @returns {ImageObjectBase}
     */
    ImageObjectPool.prototype.getItem = function (image) {
        var imageObject = (this._pool[image.id] || (this._pool[image.id] = image._iAddImageObject(new (ImageObjectPool.getClass(image))(this, image, this._stage))));
        return imageObject;
    };
    /**
     *
     * @param image
     */
    ImageObjectPool.prototype.disposeItem = function (image) {
        image._iRemoveImageObject(this._pool[image.id]);
        this._pool[image.id] = null;
    };
    /**
     *
     * @param imageObjectClass
     */
    ImageObjectPool.registerClass = function (imageObjectClass) {
        ImageObjectPool.classPool[imageObjectClass.assetClass.assetType] = imageObjectClass;
    };
    /**
     *
     * @param subGeometry
     */
    ImageObjectPool.getClass = function (texture) {
        return ImageObjectPool.classPool[texture.assetType];
    };
    ImageObjectPool.addDefaults = function () {
        ImageObjectPool.registerClass(RenderImage2DObject);
        ImageObjectPool.registerClass(RenderImageCubeObject);
        ImageObjectPool.registerClass(BitmapImage2DObject);
        ImageObjectPool.registerClass(BitmapImageCubeObject);
        ImageObjectPool.registerClass(SpecularImage2DObject);
    };
    ImageObjectPool.classPool = new Object();
    ImageObjectPool.main = ImageObjectPool.addDefaults();
    return ImageObjectPool;
})();
module.exports = ImageObjectPool;

},{"awayjs-stagegl/lib/pool/BitmapImage2DObject":"awayjs-stagegl/lib/pool/BitmapImage2DObject","awayjs-stagegl/lib/pool/BitmapImageCubeObject":"awayjs-stagegl/lib/pool/BitmapImageCubeObject","awayjs-stagegl/lib/pool/RenderImage2DObject":"awayjs-stagegl/lib/pool/RenderImage2DObject","awayjs-stagegl/lib/pool/RenderImageCubeObject":"awayjs-stagegl/lib/pool/RenderImageCubeObject","awayjs-stagegl/lib/pool/SpecularImage2DObject":"awayjs-stagegl/lib/pool/SpecularImage2DObject"}],"awayjs-stagegl/lib/pool/ProgramDataPool":[function(require,module,exports){
var ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
/**
 * @class away.pool.ProgramDataPool
 */
var ProgramDataPool = (function () {
    /**
     * //TODO
     *
     * @param textureDataClass
     */
    function ProgramDataPool(stage) {
        this._pool = new Object();
        this._stage = stage;
    }
    /**
     * //TODO
     *
     * @param materialOwner
     * @returns ITexture
     */
    ProgramDataPool.prototype.getItem = function (vertexString, fragmentString) {
        var key = vertexString + fragmentString;
        return this._pool[key] || (this._pool[key] = new ProgramData(this, this._stage, vertexString, fragmentString));
    };
    /**
     * //TODO
     *
     * @param materialOwner
     */
    ProgramDataPool.prototype.disposeItem = function (key) {
        this._pool[key] = null;
    };
    return ProgramDataPool;
})();
module.exports = ProgramDataPool;

},{"awayjs-stagegl/lib/pool/ProgramData":"awayjs-stagegl/lib/pool/ProgramData"}],"awayjs-stagegl/lib/pool/ProgramData":[function(require,module,exports){
/**
 *
 * @class away.pool.ProgramDataBase
 */
var ProgramData = (function () {
    function ProgramData(pool, context, vertexString, fragmentString) {
        this.usages = 0;
        this._pool = pool;
        this.stage = context;
        this.vertexString = vertexString;
        this.fragmentString = fragmentString;
        this.stage.registerProgram(this);
    }
    /**
     *
     */
    ProgramData.prototype.dispose = function () {
        this.usages--;
        if (!this.usages) {
            this._pool.disposeItem(this.vertexString + this.fragmentString);
            this.stage.unRegisterProgram(this);
            if (this.program)
                this.program.dispose();
        }
        this.program = null;
    };
    ProgramData.PROGRAMDATA_ID_COUNT = 0;
    return ProgramData;
})();
module.exports = ProgramData;

},{}],"awayjs-stagegl/lib/pool/RenderImage2DObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Image2D = require("awayjs-core/lib/data/Image2D");
var Image2DObject = require("awayjs-stagegl/lib/pool/Image2DObject");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var RenderImage2DObject = (function (_super) {
    __extends(RenderImage2DObject, _super);
    function RenderImage2DObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    RenderImage2DObject.prototype.activate = function (index, repeat, smooth, mipmap) {
        _super.prototype.activate.call(this, index, repeat, smooth, false);
        //TODO: allow automatic mipmap generation
    };
    /**
     *
     */
    RenderImage2DObject.assetClass = Image2D;
    return RenderImage2DObject;
})(Image2DObject);
module.exports = RenderImage2DObject;

},{"awayjs-core/lib/data/Image2D":undefined,"awayjs-stagegl/lib/pool/Image2DObject":"awayjs-stagegl/lib/pool/Image2DObject"}],"awayjs-stagegl/lib/pool/RenderImageCubeObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ImageCube = require("awayjs-core/lib/data/ImageCube");
var ImageCubeObject = require("awayjs-stagegl/lib/pool/ImageCubeObject");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var RenderImageCubeObject = (function (_super) {
    __extends(RenderImageCubeObject, _super);
    function RenderImageCubeObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    RenderImageCubeObject.prototype.activate = function (index, repeat, smooth, mipmap) {
        _super.prototype.activate.call(this, index, repeat, smooth, false);
        //TODO: allow automatic mipmap generation
    };
    /**
     *
     */
    RenderImageCubeObject.assetClass = ImageCube;
    return RenderImageCubeObject;
})(ImageCubeObject);
module.exports = RenderImageCubeObject;

},{"awayjs-core/lib/data/ImageCube":undefined,"awayjs-stagegl/lib/pool/ImageCubeObject":"awayjs-stagegl/lib/pool/ImageCubeObject"}],"awayjs-stagegl/lib/pool/SpecularImage2DObject":[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SpecularImage2D = require("awayjs-core/lib/data/SpecularImage2D");
var MipmapGenerator = require("awayjs-core/lib/utils/MipmapGenerator");
var Image2DObject = require("awayjs-stagegl/lib/pool/Image2DObject");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var SpecularImage2DObject = (function (_super) {
    __extends(SpecularImage2DObject, _super);
    function SpecularImage2DObject(pool, image, stage) {
        _super.call(this, pool, image, stage);
    }
    SpecularImage2DObject.prototype.activate = function (index, repeat, smooth, mipmap) {
        _super.prototype.activate.call(this, index, repeat, smooth, mipmap);
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        if (this._invalid) {
            this._invalid = false;
            if (mipmap) {
                var mipmapData = this._mipmapData || (this._mipmapData = new Array());
                MipmapGenerator._generateMipMaps(this._image.getCanvas(), mipmapData);
                var len = mipmapData.length;
                for (var i = 0; i < len; i++)
                    this._texture.uploadFromData(mipmapData[i].getImageData(), i);
            }
            else {
                this._texture.uploadFromData(this._image.getImageData(), 0);
            }
        }
    };
    /**
     *
     */
    SpecularImage2DObject.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        var len = this._mipmapData.length;
        for (var i = 0; i < len; i++)
            MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
    };
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    SpecularImage2DObject.prototype.getTexture = function (context) {
        if (!this._texture) {
            this._invalid = true;
            return _super.prototype.getTexture.call(this, context);
        }
        return this._texture;
    };
    /**
     *
     */
    SpecularImage2DObject.assetClass = SpecularImage2D;
    return SpecularImage2DObject;
})(Image2DObject);
module.exports = SpecularImage2DObject;

},{"awayjs-core/lib/data/SpecularImage2D":undefined,"awayjs-core/lib/utils/MipmapGenerator":undefined,"awayjs-stagegl/lib/pool/Image2DObject":"awayjs-stagegl/lib/pool/Image2DObject"}],"awayjs-stagegl/lib/vos/AttributesBufferVOPool":[function(require,module,exports){
var AttributesBufferVO = require("awayjs-stagegl/lib/vos/AttributesBufferVO");
/**
 * @class away.pool.AttributesBufferVOPool
 */
var AttributesBufferVOPool = (function () {
    /**
     *
     */
    function AttributesBufferVOPool(stage) {
        this._pool = new Object();
        this._stage = stage;
    }
    /**
     *
     * @param attributesBuffer
     * @returns {AttributesBufferVO}
     */
    AttributesBufferVOPool.prototype.getItem = function (attributesBuffer) {
        return this._pool[attributesBuffer.id] || (this._pool[attributesBuffer.id] = attributesBuffer._iAddAttributesBufferVO(new (AttributesBufferVOPool.getClass(attributesBuffer))(this, attributesBuffer, this._stage)));
    };
    /**
     *
     * @param attributesBuffer
     */
    AttributesBufferVOPool.prototype.disposeItem = function (attributesBuffer) {
        attributesBuffer._iRemoveAttributesBufferVO(this._pool[attributesBuffer.id]);
        this._pool[attributesBuffer.id] = null;
    };
    /**
     *
     * @param attributesBufferClass
     */
    AttributesBufferVOPool.registerClass = function (attributesBufferClass) {
        AttributesBufferVOPool.classPool[attributesBufferClass.assetClass.assetType] = attributesBufferClass;
    };
    /**
     *
     * @param subGeometry
     */
    AttributesBufferVOPool.getClass = function (texture) {
        return AttributesBufferVOPool.classPool[texture.assetType];
    };
    AttributesBufferVOPool.addDefaults = function () {
        AttributesBufferVOPool.registerClass(AttributesBufferVO);
    };
    AttributesBufferVOPool.classPool = new Object();
    AttributesBufferVOPool.main = AttributesBufferVOPool.addDefaults();
    return AttributesBufferVOPool;
})();
module.exports = AttributesBufferVOPool;

},{"awayjs-stagegl/lib/vos/AttributesBufferVO":"awayjs-stagegl/lib/vos/AttributesBufferVO"}],"awayjs-stagegl/lib/vos/AttributesBufferVO":[function(require,module,exports){
var AttributesBuffer = require("awayjs-core/lib/attributes/AttributesBuffer");
/**
 *
 * @class away.pool.AttributesBufferVO
 */
var AttributesBufferVO = (function () {
    function AttributesBufferVO(pool, attributesBuffer, stage) {
        this._pool = pool;
        this._attributesBuffer = attributesBuffer;
        this._stage = stage;
    }
    /**
     *
     */
    AttributesBufferVO.prototype.dispose = function () {
        this._pool.disposeItem(this._attributesBuffer);
        if (this._indexBuffer) {
            this._indexBuffer.dispose();
            this._indexBuffer = null;
        }
        if (this._vertexBuffer) {
            this._vertexBuffer.dispose();
            this._vertexBuffer = null;
        }
    };
    /**
     *
     */
    AttributesBufferVO.prototype.invalidate = function () {
        this._invalid = true;
    };
    AttributesBufferVO.prototype.activate = function (index, size, dimensions, offset) {
        this._stage.setVertexBuffer(index, this._getVertexBuffer(), size, dimensions, offset);
    };
    AttributesBufferVO.prototype.draw = function (mode, firstIndex, numIndices) {
        this._stage.context.drawIndices(mode, this._getIndexBuffer(), firstIndex, numIndices);
    };
    AttributesBufferVO.prototype._getIndexBuffer = function () {
        if (!this._indexBuffer) {
            this._invalid = true;
            this._indexBuffer = this._stage.context.createIndexBuffer(this._attributesBuffer.count * this._attributesBuffer.stride / 2); //hardcoded assuming UintArray
        }
        if (this._invalid) {
            this._invalid = false;
            this._indexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.length);
        }
        return this._indexBuffer;
    };
    AttributesBufferVO.prototype._getVertexBuffer = function () {
        if (!this._vertexBuffer) {
            this._invalid = true;
            this._vertexBuffer = this._stage.context.createVertexBuffer(this._attributesBuffer.count, this._attributesBuffer.stride);
        }
        if (this._invalid) {
            this._invalid = false;
            this._vertexBuffer.uploadFromByteArray(this._attributesBuffer.buffer, 0, this._attributesBuffer.count);
        }
        return this._vertexBuffer;
    };
    /**
     *
     */
    AttributesBufferVO.assetClass = AttributesBuffer;
    return AttributesBufferVO;
})();
module.exports = AttributesBufferVO;

},{"awayjs-core/lib/attributes/AttributesBuffer":undefined}],"awayjs-stagegl/lib/vos/IAttributesBufferVOClass":[function(require,module,exports){

},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvQUdBTFRva2VuaXplci50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9BR0xTTFBhcnNlci50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9EZXNjcmlwdGlvbi50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9EZXN0aW5hdGlvbi50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9IZWFkZXIudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvTWFwcGluZy50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9PcExVVC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9TYW1wbGVyLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL1Rva2VuLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9BR0FMTWluaUFzc2VtYmxlci50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvRlMudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvYXNzZW1ibGVyL0ZsYWdzLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9PcGNvZGVNYXAudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvYXNzZW1ibGVyL09wY29kZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvUGFydC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvUmVnTWFwLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9TYW1wbGVyTWFwLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9TYW1wbGVyLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQmxlbmRGYWN0b3IudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xDbGVhck1hc2sudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xDb21wYXJlTW9kZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTERyYXdNb2RlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMUHJvZmlsZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFByb2dyYW1UeXBlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMU3RlbmNpbEFjdGlvbi50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGaWx0ZXIudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0LnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVHJpYW5nbGVGYWNlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMV3JhcE1vZGUudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0TW9kZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTb2Z0d2FyZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNELnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFdlYkdMLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ3ViZVRleHR1cmVGbGFzaC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0N1YmVUZXh0dXJlV2ViR0wudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dEdMLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUN1YmVUZXh0dXJlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUluZGV4QnVmZmVyLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVByb2dyYW0udHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZUJhc2UudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lWZXJ0ZXhCdWZmZXIudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JbmRleEJ1ZmZlckZsYXNoLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSW5kZXhCdWZmZXJTb2Z0d2FyZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0luZGV4QnVmZmVyV2ViR0wudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9PcENvZGVzLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUHJvZ3JhbUZsYXNoLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUHJvZ3JhbVNvZnR3YXJlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUHJvZ3JhbVdlYkdMLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUmVzb3VyY2VCYXNlRmxhc2gudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TYW1wbGVyU3RhdGUudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1RleHR1cmVCYXNlV2ViR0wudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9UZXh0dXJlRmxhc2gudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9UZXh0dXJlU29mdHdhcmUudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9UZXh0dXJlV2ViR0wudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9WZXJ0ZXhCdWZmZXJGbGFzaC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1ZlcnRleEJ1ZmZlclNvZnR3YXJlLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVmVydGV4QnVmZmVyV2ViR0wudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1N0YWdlRXZlbnQudHMiLCJhd2F5anMtc3RhZ2VnbC9saWIvbWFuYWdlcnMvU3RhZ2VNYW5hZ2VyLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvQml0bWFwSW1hZ2UyRE9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0JpdG1hcEltYWdlQ3ViZU9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0lJbWFnZU9iamVjdENsYXNzLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2UyRE9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlQ3ViZU9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0QmFzZS50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0UG9vbC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhUG9vbC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUmVuZGVySW1hZ2UyRE9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1JlbmRlckltYWdlQ3ViZU9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1NwZWN1bGFySW1hZ2UyRE9iamVjdC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi92b3MvQXR0cmlidXRlc0J1ZmZlclZPUG9vbC50cyIsImF3YXlqcy1zdGFnZWdsL2xpYi92b3MvQXR0cmlidXRlc0J1ZmZlclZPLnRzIiwiYXdheWpzLXN0YWdlZ2wvbGliL3Zvcy9J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SUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQ2hILElBQUksS0FBSyxDQUFDLDBDQUEwQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUM5RyxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFDOUcsSUFBSSxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQ2hHLElBQUksS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUNsRyxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFDMUcsSUFBSSxLQUFLLENBQUMsMENBQTBDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQzNHLElBQUksS0FBSyxDQUFDLDBDQUEwQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUMzRyxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFFM0csSUFBSSxLQUFLLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQ2pHLElBQUksS0FBSyxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUNqRyxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFBRSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFBRSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFBRSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFBRSxJQUFJLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQUUsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7UUFHdDNCLElBQUksS0FBSyxDQUFDLDBEQUEwRCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLGlDQUFpQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLDJEQUEyRCxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLCtDQUErQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLHVDQUF1QyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUFFLElBQUksS0FBSyxDQUFDLG9DQUFvQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUks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QUksQ0FBQyxFQUFJLEdBQUc7Z0JBQzNHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksR0FBRztnQkFDM0csU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxHQUFHO2dCQUMzRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFNLEdBQUc7Z0JBQzNHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksR0FBRztnQkFDM0csU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxHQUFHO2dCQUMzRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFNLEdBQUc7Z0JBQzNHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQU0sR0FBRztnQkFDM0csU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBTSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFJLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQU0sSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBTSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFNLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQU0sSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBTSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFJLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFNLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQU0sSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBTSxJQUFJO2dCQUU1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFHLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQVEsSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRyxJQUFJO2dCQUU1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFJLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxJQUFJO2dCQUVuRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFJLElBQUk7Z0JBQzFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksSUFBSTtnQkFFbkgsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFJLElBQUk7Z0JBQzVHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUksSUFBSTtnQkFDNUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBSSxJQUFJO2dCQUM1RyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxH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QUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1RSxJQUFJLFNBQVMsR0FBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTVFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEQsSUFBSSxFQUFFLEdBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEQsSUFBSSxFQUFFLEdBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFeEQsQUFHQSx5RUFIeUU7UUFDekUseUVBQXlFO1lBRXJFLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVuRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDM0IsSUFBSSxRQUFRLEdBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLEFBQ0EsbURBRG1EO2dCQUMvQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUzQyxJQUFJLEtBQUssR0FBVSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0wsQ0FBQztJQUVNLGtDQUFRLEdBQWYsVUFBZ0IsRUFBVyxFQUFFLEVBQVcsRUFBRSxFQUFXLEVBQUUsR0FBUyxFQUFFLEdBQVMsRUFBRSxHQUFTO1FBQ2xGLElBQUksSUFBUSxDQUFDO1FBQ2IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksR0FBRyxFQUFFLENBQUM7WUFDVixFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ1IsRUFBRSxHQUFHLElBQUksQ0FBQztZQUVWLElBQUksR0FBRyxHQUFHLENBQUM7WUFDWCxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ1YsR0FBRyxHQUFHLElBQUksQ0FBQztRQUNmLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNWLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDUixFQUFFLEdBQUcsSUFBSSxDQUFDO1lBRVYsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNYLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDVixHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2YsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1YsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNSLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFVixJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ1gsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNWLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxLQUFZLENBQUM7UUFDakIsSUFBSSxLQUFZLENBQUM7UUFFakIsQUFDQSxxQ0FEcUM7UUFDckMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxD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QUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDM0UsSUFBSSxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQzdFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUVwRixJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDcEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ3BELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNwRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDcEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ3BELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNwRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDcEQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBRXBELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUMvRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUV2RSxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2pFLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7WUFFdkUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ3hFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUUxRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztZQUM1SCxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztZQUMxSCxJQUFJLENBQUMsdUJBQXVCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDMUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7WUFDNUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUM7WUFDOUgsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUM7WUFDNUgsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBRTVHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDeEUsSUFBSSxDQUFDLDhCQUE4QixDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUUxRSxJQUFJLENBQUMsaUNBQWlDLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksc0JBQXNCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLHNCQUFzQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuSSxJQUFJLENBQUMsaUNBQWlDLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksc0JBQXNCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpJLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUMzQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDL0MsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQzFELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLEFBQ0EsZ0dBRGdHO1lBQ2hHLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFHRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUM5QyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUNwRCxDQUFDO0lBQ0YsQ0FBQztJQXBIRCxzQkFBVyxtQ0FBUzthQUFwQjtZQUVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQVcsNkNBQW1CO2FBQTlCO1lBRUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUNsQyxDQUFDOzs7T0FBQTtJQStHTSx5QkFBRSxHQUFUO1FBRUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQUVNLDRCQUFLLEdBQVosVUFBYSxHQUFjLEVBQUUsS0FBZ0IsRUFBRSxJQUFlLEVBQUUsS0FBZ0IsRUFBRSxLQUFnQixFQUFFLE9BQWtCLEVBQUUsSUFBb0M7UUFBL0ksbUJBQWMsR0FBZCxPQUFjO1FBQUUscUJBQWdCLEdBQWhCLFNBQWdCO1FBQUUsb0JBQWUsR0FBZixRQUFlO1FBQUUscUJBQWdCLEdBQWhCLFNBQWdCO1FBQUUscUJBQWdCLEdBQWhCLFNBQWdCO1FBQUUsdUJBQWtCLEdBQWxCLFdBQWtCO1FBQUUsb0JBQW9DLEdBQXBDLE9BQWMsa0JBQWtCLENBQUMsR0FBRztRQUUzSixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLE1BQU0sR0FBVSxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7WUFBQyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztRQUM3RSxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFekUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLDBDQUFtQixHQUExQixVQUEyQixLQUFZLEVBQUUsTUFBYSxFQUFFLFNBQWdCLEVBQUUscUJBQW9DO1FBQXBDLHFDQUFvQyxHQUFwQyw0QkFBb0M7UUFFN0csSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsRUFBRSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUVyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sd0NBQWlCLEdBQXhCLFVBQXlCLElBQVcsRUFBRSxNQUFhLEVBQUUsMEJBQWtDLEVBQUUsZUFBMEI7UUFBMUIsK0JBQTBCLEdBQTFCLG1CQUEwQjtRQUVsSCxJQUFJLE9BQU8sR0FBb0IsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVNLHdDQUFpQixHQUF4QixVQUF5QixVQUFpQjtRQUV6QyxJQUFJLFdBQVcsR0FBb0IsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBRU0sb0NBQWEsR0FBcEI7UUFFQyxJQUFJLE9BQU8sR0FBZ0IsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVNLG9DQUFhLEdBQXBCLFVBQXFCLEtBQVksRUFBRSxNQUFhLEVBQUUsTUFBYSxFQUFFLDBCQUFrQyxFQUFFLGVBQTBCO1FBQTFCLCtCQUEwQixHQUExQixtQkFBMEI7UUFFOUgsQUFDQSxnQkFEZ0I7WUFDWixPQUFPLEdBQWdCLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVNLHlDQUFrQixHQUF6QixVQUEwQixXQUFrQixFQUFFLGFBQW9CO1FBRWpFLElBQUksWUFBWSxHQUFxQixJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNyQixDQUFDO0lBRU0sOEJBQU8sR0FBZDtRQUVDLElBQUksQ0FBUSxDQUFDO1FBQ2IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXBDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFFN0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXJDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFFOUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFTSwwQ0FBbUIsR0FBMUIsVUFBMkIsV0FBeUI7UUFFbkQsSUFBSSxXQUFXLEdBQWUsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBQyxXQUFXLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXRGLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFckksSUFBSSxTQUFTLEdBQWEsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUMxQyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXRDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU0sa0NBQVcsR0FBbEIsVUFBbUIsSUFBVyxFQUFFLFdBQTRCLEVBQUUsVUFBcUIsRUFBRSxVQUFzQjtRQUE3QywwQkFBcUIsR0FBckIsY0FBcUI7UUFBRSwwQkFBc0IsR0FBdEIsY0FBcUIsQ0FBQztRQUUxRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbEIsTUFBTSxnR0FBZ0csQ0FBQztRQUd4RyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxXQUFXLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxVQUFVLEdBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkosQ0FBQztJQUVNLG1DQUFZLEdBQW5CLFVBQW9CLElBQVcsRUFBRSxXQUFzQixFQUFFLFdBQXVCO1FBQS9DLDJCQUFzQixHQUF0QixlQUFzQjtRQUFFLDJCQUF1QixHQUF2QixlQUFzQixDQUFDO1FBRS9FLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNsQixNQUFNLGdHQUFnRyxDQUFDO1FBRXhHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVNLDhCQUFPLEdBQWQ7UUFFQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRU0sc0NBQWUsR0FBdEIsVUFBdUIsWUFBbUIsRUFBRSxpQkFBd0I7UUFFbkUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFOUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVNLG1DQUFZLEdBQW5CLFVBQW9CLEdBQVcsRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLEtBQWE7UUFFMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLGlDQUFVLEdBQWpCLFVBQWtCLGtCQUF5QixFQUFFLGdCQUFzQztRQUF0QyxnQ0FBc0MsR0FBdEMsK0JBQXNDO1FBRWxGLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDOUYsQ0FBQztJQUNGLENBQUM7SUFFRCw0QkFBNEI7SUFDckIsbUNBQVksR0FBbkIsVUFBb0IsU0FBaUIsRUFBRSxlQUFzQjtRQUU1RCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRVMsd0NBQWlCLEdBQXhCLFVBQXlCLFlBQW9DLEVBQUUsV0FBNkIsRUFBRSxnQkFBZ0MsRUFBRSxpQkFBaUMsRUFBRSw0QkFBNEMsRUFBRSxnQkFBc0M7UUFBOU4sNEJBQW9DLEdBQXBDLDZCQUFvQztRQUFFLDJCQUE2QixHQUE3QixzQkFBNkI7UUFBRSxnQ0FBZ0MsR0FBaEMseUJBQWdDO1FBQUUsaUNBQWlDLEdBQWpDLDBCQUFpQztRQUFFLDRDQUE0QyxHQUE1QyxxQ0FBNEM7UUFBRSxnQ0FBc0MsR0FBdEMsK0JBQXNDO1FBRW5QLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLElBQUksY0FBYyxDQUFDO1FBRXZELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUN2RSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUUzRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGFBQWEsQ0FBQztZQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsdUJBQXVCLEdBQUcsYUFBYSxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvRyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO1lBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsQ0FBQztJQUNMLENBQUM7SUFFTSwrQ0FBd0IsR0FBL0IsVUFBZ0MsY0FBcUIsRUFBRSxRQUFlLEVBQUUsU0FBZ0I7UUFFcEYsSUFBSSxDQUFDLHNCQUFzQixHQUFHLGNBQWMsQ0FBQztRQUM3QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBRWpDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUcsaUNBQVUsR0FBakIsVUFBa0IsT0FBb0I7UUFFckMsQUFDQSx1REFEdUQ7UUFDdkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7UUFDL0IsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxvREFBNkIsR0FBcEMsVUFBcUMsV0FBa0IsRUFBRSxhQUFvQixFQUFFLE1BQWUsRUFBRSxnQkFBZ0M7UUFFL0gsZ01BQWdNO1FBRmpHLGdDQUFnQyxHQUFoQyx3QkFBZ0M7UUFJL0gsQUFDQSxrREFEa0Q7WUFDOUMsQ0FBQyxHQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEcsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxFQUFFLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxFQUFFLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxFQUFFLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUMsRUFB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QUFLLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDM0IsQ0FBQztJQTFGRDs7T0FFRztJQUNXLDZCQUFVLEdBQWUsZ0JBQWdCLENBQUM7SUF3RnpELHlCQUFDO0FBQUQsQ0E3RkEsQUE2RkMsSUFBQTtBQUVELEFBQTRCLGlCQUFuQixrQkFBa0IsQ0FBQzs7O0FDekZNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9CeXRlQXJyYXlcIik7XG5cbmltcG9ydCBEZXNjcmlwdGlvblx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL0Rlc2NyaXB0aW9uXCIpO1xuaW1wb3J0IEhlYWRlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvSGVhZGVyXCIpO1xuaW1wb3J0IE1hcHBpbmdcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL01hcHBpbmdcIik7XG5pbXBvcnQgVG9rZW5cdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL1Rva2VuXCIpO1xuXG5jbGFzcyBBR0FMVG9rZW5pemVyXG57XG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG5cblx0cHVibGljIGRlY3JpYmVBR0FMQnl0ZUFycmF5KGJ5dGVzOkJ5dGVBcnJheSlcblx0e1xuXHRcdHZhciBoZWFkZXI6SGVhZGVyID0gbmV3IEhlYWRlcigpO1xuXG5cdFx0aWYgKGJ5dGVzLnJlYWRVbnNpZ25lZEJ5dGUoKSAhPSAweGEwKSB7XG5cdFx0XHR0aHJvdyBcIkJhZCBBR0FMOiBNaXNzaW5nIDB4YTAgbWFnaWMgYnl0ZS5cIjtcblx0XHR9XG5cblx0XHRoZWFkZXIudmVyc2lvbiA9IGJ5dGVzLnJlYWRVbnNpZ25lZEludCgpO1xuXHRcdGlmIChoZWFkZXIudmVyc2lvbiA+PSAweDEwKSB7XG5cdFx0XHRieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0XHRoZWFkZXIudmVyc2lvbiA+Pj0gMTtcblx0XHR9XG5cdFx0aWYgKGJ5dGVzLnJlYWRVbnNpZ25lZEJ5dGUoKSAhPSAweGExKSB7XG5cdFx0XHR0aHJvdyBcIkJhZCBBR0FMOiBNaXNzaW5nIDB4YTEgbWFnaWMgYnl0ZS5cIjtcblx0XHR9XG5cblx0XHRoZWFkZXIucHJvZ2lkID0gYnl0ZXMucmVhZFVuc2lnbmVkQnl0ZSgpO1xuXHRcdHN3aXRjaCAoaGVhZGVyLnByb2dpZCkge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRoZWFkZXIudHlwZSA9IFwiZnJhZ21lbnRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGhlYWRlci50eXBlID0gXCJ2ZXJ0ZXhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGhlYWRlci50eXBlID0gXCJjcHVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRoZWFkZXIudHlwZSA9IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHZhciBkZXNjOkRlc2NyaXB0aW9uID0gbmV3IERlc2NyaXB0aW9uKCk7XG5cdFx0dmFyIHRva2VuczpUb2tlbltdID0gW107XG5cdFx0d2hpbGUgKGJ5dGVzLnBvc2l0aW9uIDwgYnl0ZXMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgdG9rZW46VG9rZW4gPSBuZXcgVG9rZW4oKTtcblxuXHRcdFx0dG9rZW4ub3Bjb2RlID0gYnl0ZXMucmVhZFVuc2lnbmVkSW50KCk7XG5cdFx0XHR2YXIgbHV0ZW50cnkgPSBNYXBwaW5nLmFnYWwyZ2xzbGx1dFt0b2tlbi5vcGNvZGVdO1xuXHRcdFx0aWYgKCFsdXRlbnRyeSkge1xuXHRcdFx0XHR0aHJvdyBcIk9wY29kZSBub3QgdmFsaWQgb3Igbm90IGltcGxlbWVudGVkIHlldDogXCIgKyB0b2tlbi5vcGNvZGU7XG5cdFx0XHR9XG5cdFx0XHRpZiAobHV0ZW50cnkubWF0cml4aGVpZ2h0KSB7XG5cdFx0XHRcdGRlc2MuaGFzbWF0cml4ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChsdXRlbnRyeS5kZXN0KSB7XG5cdFx0XHRcdHRva2VuLmRlc3QucmVnbnVtID0gYnl0ZXMucmVhZFVuc2lnbmVkU2hvcnQoKTtcblx0XHRcdFx0dG9rZW4uZGVzdC5tYXNrID0gYnl0ZXMucmVhZFVuc2lnbmVkQnl0ZSgpO1xuXHRcdFx0XHR0b2tlbi5kZXN0LnJlZ3R5cGUgPSBieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0XHRcdGRlc2MucmVnd3JpdGVbdG9rZW4uZGVzdC5yZWd0eXBlXVt0b2tlbi5kZXN0LnJlZ251bV0gfD0gdG9rZW4uZGVzdC5tYXNrO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dG9rZW4uZGVzdCA9IG51bGw7XG5cdFx0XHRcdGJ5dGVzLnJlYWRVbnNpZ25lZEludCgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGx1dGVudHJ5LmEpIHtcblx0XHRcdFx0dGhpcy5yZWFkUmVnKHRva2VuLmEsIDEsIGRlc2MsIGJ5dGVzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRva2VuLmEgPSBudWxsO1xuXHRcdFx0XHRieXRlcy5yZWFkVW5zaWduZWRJbnQoKTtcblx0XHRcdFx0Ynl0ZXMucmVhZFVuc2lnbmVkSW50KCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobHV0ZW50cnkuYikge1xuXHRcdFx0XHR0aGlzLnJlYWRSZWcodG9rZW4uYiwgbHV0ZW50cnkubWF0cml4aGVpZ2h0IHwgMCwgZGVzYywgYnl0ZXMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dG9rZW4uYiA9IG51bGw7XG5cdFx0XHRcdGJ5dGVzLnJlYWRVbnNpZ25lZEludCgpO1xuXHRcdFx0XHRieXRlcy5yZWFkVW5zaWduZWRJbnQoKTtcblx0XHRcdH1cblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdFx0ZGVzYy5oZWFkZXIgPSBoZWFkZXI7XG5cdFx0ZGVzYy50b2tlbnMgPSB0b2tlbnM7XG5cblx0XHRyZXR1cm4gZGVzYztcblx0fVxuXG5cdHB1YmxpYyByZWFkUmVnKHMsIG1oLCBkZXNjLCBieXRlcylcblx0e1xuXHRcdHMucmVnbnVtID0gYnl0ZXMucmVhZFVuc2lnbmVkU2hvcnQoKTtcblx0XHRzLmluZGV4b2Zmc2V0ID0gYnl0ZXMucmVhZEJ5dGUoKTtcblx0XHRzLnN3aXp6bGUgPSBieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0cy5yZWd0eXBlID0gYnl0ZXMucmVhZFVuc2lnbmVkQnl0ZSgpO1xuXHRcdGRlc2MucmVncmVhZFtzLnJlZ3R5cGVdW3MucmVnbnVtXSA9IDB4ZjsgLy8gc291bGQgYmUgc3dpenpsZSB0byBtYXNrPyBzaG91bGQgYmUgfD0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdFx0aWYgKHMucmVndHlwZSA9PSAweDUpIHtcblx0XHRcdC8vIHNhbXBsZXJcblx0XHRcdHMubG9kYmlhZCA9IHMuaW5kZXhvZmZzZXQ7XG5cdFx0XHRzLmluZGV4b2Zmc2V0ID0gdW5kZWZpbmVkO1xuXHRcdFx0cy5zd2l6emxlID0gdW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBzYW1wbGVyIFxuXHRcdFx0cy5yZWFkbW9kZSA9IGJ5dGVzLnJlYWRVbnNpZ25lZEJ5dGUoKTtcblx0XHRcdHMuZGltID0gcy5yZWFkbW9kZSA+PiA0O1xuXHRcdFx0cy5yZWFkbW9kZSAmPSAweGY7XG5cdFx0XHRzLnNwZWNpYWwgPSBieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0XHRzLndyYXAgPSBzLnNwZWNpYWwgPj4gNDtcblx0XHRcdHMuc3BlY2lhbCAmPSAweGY7XG5cdFx0XHRzLm1pcG1hcCA9IGJ5dGVzLnJlYWRVbnNpZ25lZEJ5dGUoKTtcblx0XHRcdHMuZmlsdGVyID0gcy5taXBtYXAgPj4gNDtcblx0XHRcdHMubWlwbWFwICY9IDB4Zjtcblx0XHRcdGRlc2Muc2FtcGxlcnNbcy5yZWdudW1dID0gcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cy5pbmRleHJlZ3R5cGUgPSBieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0XHRzLmluZGV4c2VsZWN0ID0gYnl0ZXMucmVhZFVuc2lnbmVkQnl0ZSgpO1xuXHRcdFx0cy5pbmRpcmVjdGZsYWcgPSBieXRlcy5yZWFkVW5zaWduZWRCeXRlKCk7XG5cdFx0fVxuXHRcdGlmIChzLmluZGlyZWN0ZmxhZykge1xuXHRcdFx0ZGVzYy5oYXNpbmRpcmVjdCA9IHRydWU7XG5cdFx0fVxuXHRcdGlmICghcy5pbmRpcmVjdGZsYWcgJiYgbWgpIHtcblx0XHRcdGZvciAodmFyIG1oaTpudW1iZXIgPSAwOyBtaGkgPCBtaDsgbWhpKyspIC8vVE9ETyB3cm9uZywgc2hvdWxkIGJlIHw9XG5cdFx0XHR7XG5cdFx0XHRcdGRlc2MucmVncmVhZFtzLnJlZ3R5cGVdW3MucmVnbnVtICsgbWhpXSA9IGRlc2MucmVncmVhZFtzLnJlZ3R5cGVdW3MucmVnbnVtXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0ID0gQUdBTFRva2VuaXplcjsiLCJpbXBvcnQgRGVzY3JpcHRpb25cdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9EZXNjcmlwdGlvblwiKTtcbmltcG9ydCBNYXBwaW5nXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9NYXBwaW5nXCIpO1xuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5cbmNsYXNzIEFHTFNMUGFyc2VyXG57XG5cdHB1YmxpYyBwYXJzZShkZXNjOkRlc2NyaXB0aW9uKVxuXHR7XG5cdFx0dmFyIGhlYWRlcjpzdHJpbmcgPSBcIlwiO1xuXHRcdHZhciBib2R5OnN0cmluZyA9IFwiXCI7XG5cblx0XHRoZWFkZXIgKz0gXCJwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuXCI7XG5cdFx0dmFyIHRhZyA9IGRlc2MuaGVhZGVyLnR5cGVbMF07IC8vVE9ET1xuXG5cdFx0Ly8gZGVjbGFyZSB1bmlmb3Jtc1xuXHRcdGlmIChkZXNjLmhlYWRlci50eXBlID09IFwidmVydGV4XCIpIHtcblx0XHRcdGhlYWRlciArPSBcInVuaWZvcm0gZmxvYXQgeWZsaXA7XFxuXCI7XG5cdFx0fVxuXHRcdGlmICghZGVzYy5oYXNpbmRpcmVjdCkge1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgZGVzYy5yZWdyZWFkWzB4MV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGRlc2MucmVncmVhZFsweDFdW2ldKSB7XG5cdFx0XHRcdFx0aGVhZGVyICs9IFwidW5pZm9ybSB2ZWM0IFwiICsgdGFnICsgXCJjXCIgKyBpICsgXCI7XFxuXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aGVhZGVyICs9IFwidW5pZm9ybSB2ZWM0IFwiICsgdGFnICsgXCJjYXJycltcIiArIENvbnRleHRTdGFnZTNELm1heHZlcnRleGNvbnN0YW50cyArIFwiXTtcXG5cIjsgICAgICAgICAgICAgICAgLy8gdXNlIG1heCBjb25zdCBjb3VudCBpbnN0ZWFkXG5cdFx0fVxuXG5cdFx0Ly8gZGVjbGFyZSB0ZW1wc1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVzYy5yZWdyZWFkWzB4Ml0ubGVuZ3RoIHx8IGkgPCBkZXNjLnJlZ3dyaXRlWzB4Ml0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChkZXNjLnJlZ3JlYWRbMHgyXVtpXSB8fCBkZXNjLnJlZ3dyaXRlWzB4Ml1baV0pIC8vIGR1aCwgaGF2ZSB0byBjaGVjayB3cml0ZSBvbmx5IGFsc28uLi5cblx0XHRcdHtcblx0XHRcdFx0aGVhZGVyICs9IFwidmVjNCBcIiArIHRhZyArIFwidFwiICsgaSArIFwiO1xcblwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGRlY2xhcmUgc3RyZWFtc1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGRlc2MucmVncmVhZFsweDBdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoZGVzYy5yZWdyZWFkWzB4MF1baV0pIHtcblx0XHRcdFx0aGVhZGVyICs9IFwiYXR0cmlidXRlIHZlYzQgdmFcIiArIGkgKyBcIjtcXG5cIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBkZWNsYXJlIGludGVycG9sYXRlZFxuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGRlc2MucmVncmVhZFsweDRdLmxlbmd0aCB8fCBpIDwgZGVzYy5yZWd3cml0ZVsweDRdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoZGVzYy5yZWdyZWFkWzB4NF1baV0gfHwgZGVzYy5yZWd3cml0ZVsweDRdW2ldKSB7XG5cdFx0XHRcdGhlYWRlciArPSBcInZhcnlpbmcgdmVjNCB2aVwiICsgaSArIFwiO1xcblwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGRlY2xhcmUgc2FtcGxlcnNcblx0XHR2YXIgc2FtcHR5cGU6QXJyYXk8c3RyaW5nPiA9IFtcIjJEXCIsIFwiQ3ViZVwiLCBcIjNEXCIsIFwiXCJdO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGRlc2Muc2FtcGxlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChkZXNjLnNhbXBsZXJzW2ldKSB7XG5cdFx0XHRcdGhlYWRlciArPSBcInVuaWZvcm0gc2FtcGxlclwiICsgc2FtcHR5cGVbIGRlc2Muc2FtcGxlcnNbaV0uZGltICYgMyBdICsgXCIgZnNcIiArIGkgKyBcIjtcXG5cIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBleHRyYSBnbCBmbHVmZjogc2V0dXAgcG9zaXRpb24gYW5kIGRlcHRoIGFkanVzdCB0ZW1wc1xuXHRcdGlmIChkZXNjLmhlYWRlci50eXBlID09IFwidmVydGV4XCIpIHtcblx0XHRcdGhlYWRlciArPSBcInZlYzQgb3V0cG9zO1xcblwiO1xuXHRcdH1cblx0XHRpZiAoZGVzYy53cml0ZWRlcHRoKSB7XG5cdFx0XHRoZWFkZXIgKz0gXCJ2ZWM0IHRtcF9GcmFnRGVwdGg7XFxuXCI7XG5cdFx0fVxuXHRcdC8vaWYgKCBkZXNjLmhhc21hdHJpeCApIFxuXHRcdC8vICAgIGhlYWRlciArPSBcInZlYzQgdG1wX21hdHJpeDtcXG5cIjtcblxuXHRcdHZhciBkZXJpdmF0aXZlczpib29sZWFuID0gZmFsc2U7XG5cblx0XHQvLyBzdGFydCBib2R5IG9mIGNvZGVcblx0XHRib2R5ICs9IFwidm9pZCBtYWluKCkge1xcblwiO1xuXG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgZGVzYy50b2tlbnMubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0dmFyIGx1dGVudHJ5ID0gTWFwcGluZy5hZ2FsMmdsc2xsdXRbZGVzYy50b2tlbnNbaV0ub3Bjb2RlXTtcblxuXHRcdFx0aWYobHV0ZW50cnkucy5pbmRleE9mKFwiZEZkeFwiKSAhPSAtMSB8fCBsdXRlbnRyeS5zLmluZGV4T2YoXCJkRmR5XCIpICE9IC0xKSBkZXJpdmF0aXZlcyA9IHRydWU7XG5cdFx0XHRpZiAoIWx1dGVudHJ5KSB7XG5cdFx0XHRcdHRocm93IFwiT3Bjb2RlIG5vdCB2YWxpZCBvciBub3QgaW1wbGVtZW50ZWQgeWV0OiBcIlxuXHRcdFx0XHQvKit0b2tlbi5vcGNvZGU7Ki9cblx0XHRcdH1cblx0XHRcdHZhciBzdWJsaW5lcyA9IGx1dGVudHJ5Lm1hdHJpeGhlaWdodCB8fCAxO1xuXG5cdFx0XHRmb3IgKHZhciBzbDpudW1iZXIgPSAwOyBzbCA8IHN1YmxpbmVzOyBzbCsrKSB7XG5cdFx0XHRcdHZhciBsaW5lOnN0cmluZyA9IFwiICBcIiArIGx1dGVudHJ5LnM7XG5cdFx0XHRcdGlmIChkZXNjLnRva2Vuc1tpXS5kZXN0KSB7XG5cdFx0XHRcdFx0aWYgKGx1dGVudHJ5Lm1hdHJpeGhlaWdodCkge1xuXHRcdFx0XHRcdFx0aWYgKCgoZGVzYy50b2tlbnNbaV0uZGVzdC5tYXNrID4+IHNsKSAmIDEpICE9IDEpIHtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR2YXIgZGVzdHJlZ3N0cmluZzpzdHJpbmcgPSB0aGlzLnJlZ3Rvc3RyaW5nKGRlc2MudG9rZW5zW2ldLmRlc3QucmVndHlwZSwgZGVzYy50b2tlbnNbaV0uZGVzdC5yZWdudW0sIGRlc2MsIHRhZyk7XG5cdFx0XHRcdFx0XHR2YXIgZGVzdGNhc3RzdHJpbmc6c3RyaW5nID0gXCJmbG9hdFwiO1xuXHRcdFx0XHRcdFx0dmFyIGRlc3RtYXNrc3RyaW5nID0gW1wieFwiLCBcInlcIiwgXCJ6XCIsIFwid1wiXVtzbF07XG5cdFx0XHRcdFx0XHRkZXN0cmVnc3RyaW5nICs9IFwiLlwiICsgZGVzdG1hc2tzdHJpbmc7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHZhciBkZXN0cmVnc3RyaW5nOnN0cmluZyA9IHRoaXMucmVndG9zdHJpbmcoZGVzYy50b2tlbnNbaV0uZGVzdC5yZWd0eXBlLCBkZXNjLnRva2Vuc1tpXS5kZXN0LnJlZ251bSwgZGVzYywgdGFnKTtcblx0XHRcdFx0XHRcdHZhciBkZXN0Y2FzdHN0cmluZzpzdHJpbmc7XG5cdFx0XHRcdFx0XHR2YXIgZGVzdG1hc2tzdHJpbmc6c3RyaW5nO1xuXHRcdFx0XHRcdFx0aWYgKGRlc2MudG9rZW5zW2ldLmRlc3QubWFzayAhPSAweGYpIHtcblx0XHRcdFx0XHRcdFx0dmFyIG5kZXN0Om51bWJlciA9IDA7XG5cdFx0XHRcdFx0XHRcdGRlc3RtYXNrc3RyaW5nID0gXCJcIjtcblx0XHRcdFx0XHRcdFx0aWYgKGRlc2MudG9rZW5zW2ldLmRlc3QubWFzayAmIDEpIHtcblx0XHRcdFx0XHRcdFx0XHRuZGVzdCsrO1xuXHRcdFx0XHRcdFx0XHRcdGRlc3RtYXNrc3RyaW5nICs9IFwieFwiO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChkZXNjLnRva2Vuc1tpXS5kZXN0Lm1hc2sgJiAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmRlc3QrKztcblx0XHRcdFx0XHRcdFx0XHRkZXN0bWFza3N0cmluZyArPSBcInlcIjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoZGVzYy50b2tlbnNbaV0uZGVzdC5tYXNrICYgNCkge1xuXHRcdFx0XHRcdFx0XHRcdG5kZXN0Kys7XG5cdFx0XHRcdFx0XHRcdFx0ZGVzdG1hc2tzdHJpbmcgKz0gXCJ6XCI7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKGRlc2MudG9rZW5zW2ldLmRlc3QubWFzayAmIDgpIHtcblx0XHRcdFx0XHRcdFx0XHRuZGVzdCsrO1xuXHRcdFx0XHRcdFx0XHRcdGRlc3RtYXNrc3RyaW5nICs9IFwid1wiO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGRlc3RyZWdzdHJpbmcgKz0gXCIuXCIgKyBkZXN0bWFza3N0cmluZztcblx0XHRcdFx0XHRcdFx0c3dpdGNoIChuZGVzdCkge1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRcdFx0XHRcdGRlc3RjYXN0c3RyaW5nID0gXCJmbG9hdFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVzdGNhc3RzdHJpbmcgPSBcInZlYzJcIjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdFx0XHRcdGRlc3RjYXN0c3RyaW5nID0gXCJ2ZWMzXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgXCJVbmV4cGVjdGVkIGRlc3RpbmF0aW9uIG1hc2tcIjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0ZGVzdGNhc3RzdHJpbmcgPSBcInZlYzRcIjtcblx0XHRcdFx0XHRcdFx0ZGVzdG1hc2tzdHJpbmcgPSBcInh5endcIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGluZSA9IGxpbmUucmVwbGFjZShcIiVkZXN0XCIsIGRlc3RyZWdzdHJpbmcpO1xuXHRcdFx0XHRcdGxpbmUgPSBsaW5lLnJlcGxhY2UoXCIlY2FzdFwiLCBkZXN0Y2FzdHN0cmluZyk7XG5cdFx0XHRcdFx0bGluZSA9IGxpbmUucmVwbGFjZShcIiVkbVwiLCBkZXN0bWFza3N0cmluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGR3bTpudW1iZXIgPSAweGY7XG5cdFx0XHRcdGlmICghbHV0ZW50cnkubmR3bSAmJiBsdXRlbnRyeS5kZXN0ICYmIGRlc2MudG9rZW5zW2ldLmRlc3QpIHtcblx0XHRcdFx0XHRkd20gPSBkZXNjLnRva2Vuc1tpXS5kZXN0Lm1hc2s7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRlc2MudG9rZW5zW2ldLmEpIHtcblx0XHRcdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKFwiJWFcIiwgdGhpcy5zb3VyY2V0b3N0cmluZyhkZXNjLnRva2Vuc1tpXS5hLCAwLCBkd20sIGx1dGVudHJ5LnNjYWxhciwgZGVzYywgdGFnKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRlc2MudG9rZW5zW2ldLmIpIHtcblx0XHRcdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKFwiJWJcIiwgdGhpcy5zb3VyY2V0b3N0cmluZyhkZXNjLnRva2Vuc1tpXS5iLCBzbCwgZHdtLCBsdXRlbnRyeS5zY2FsYXIsIGRlc2MsIHRhZykpO1xuXHRcdFx0XHRcdGlmIChkZXNjLnRva2Vuc1tpXS5iLnJlZ3R5cGUgPT0gMHg1KSB7XG5cdFx0XHRcdFx0XHQvLyBzYW1wbGVyIGRpbVxuXHRcdFx0XHRcdFx0dmFyIHRleGRpbSA9IFtcIjJEXCIsIFwiQ3ViZVwiLCBcIjNEXCJdW2Rlc2MudG9rZW5zW2ldLmIuZGltXTtcblx0XHRcdFx0XHRcdHZhciB0ZXhzaXplID0gW1widmVjMlwiLCBcInZlYzNcIiwgXCJ2ZWMzXCJdW2Rlc2MudG9rZW5zW2ldLmIuZGltXTtcblx0XHRcdFx0XHRcdGxpbmUgPSBsaW5lLnJlcGxhY2UoXCIldGV4ZGltXCIsIHRleGRpbSk7XG5cdFx0XHRcdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKFwiJXRleHNpemVcIiwgdGV4c2l6ZSk7XG5cdFx0XHRcdFx0XHR2YXIgdGV4bG9kOnN0cmluZyA9IFwiXCI7XG5cdFx0XHRcdFx0XHRsaW5lID0gbGluZS5yZXBsYWNlKFwiJWxvZFwiLCB0ZXhsb2QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRib2R5ICs9IGxpbmU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRqdXN0IHogZnJvbSBvcGVuZ2wgcmFuZ2Ugb2YgLTEuLjEgdG8gMC4uMSBhcyBpbiBkM2QsIHRoaXMgYWxzbyBlbmZvcmNlcyBhIGxlZnQgaGFuZGVkIGNvb3JkaW5hdGUgc3lzdGVtXG5cdFx0aWYgKGRlc2MuaGVhZGVyLnR5cGUgPT0gXCJ2ZXJ0ZXhcIikge1xuXHRcdFx0Ym9keSArPSBcIiAgZ2xfUG9zaXRpb24gPSB2ZWM0KG91dHBvcy54LCBvdXRwb3MueSwgb3V0cG9zLnoqMi4wIC0gb3V0cG9zLncsIG91dHBvcy53KTtcXG5cIjtcblx0XHR9XG5cblx0XHQvL2ZsYWcgYmFzZWQgc3dpdGNoXG5cdFx0aWYgKGRlcml2YXRpdmVzICYmIGRlc2MuaGVhZGVyLnR5cGUgPT0gXCJmcmFnbWVudFwiKSB7XG5cdFx0XHRoZWFkZXIgPSBcIiNleHRlbnNpb24gR0xfT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzIDogZW5hYmxlXFxuXCIgKyBoZWFkZXI7XG5cdFx0fVxuXG5cdFx0Ly8gY2xhbXAgZnJhZ21lbnQgZGVwdGhcblx0XHRpZiAoZGVzYy53cml0ZWRlcHRoKSB7XG5cdFx0XHRib2R5ICs9IFwiICBnbF9GcmFnRGVwdGggPSBjbGFtcCh0bXBfRnJhZ0RlcHRoLDAuMCwxLjApO1xcblwiO1xuXHRcdH1cblxuXHRcdC8vIGNsb3NlIG1haW5cblx0XHRib2R5ICs9IFwifVxcblwiO1xuICAgICAgICBjb25zb2xlLmxvZyhoZWFkZXIgKyBib2R5KTtcblx0XHRyZXR1cm4gaGVhZGVyICsgYm9keTtcblx0fVxuXG5cdHB1YmxpYyByZWd0b3N0cmluZyhyZWd0eXBlOm51bWJlciwgcmVnbnVtOm51bWJlciwgZGVzYzpEZXNjcmlwdGlvbiwgdGFnKVxuXHR7XG5cdFx0c3dpdGNoIChyZWd0eXBlKSB7XG5cdFx0XHRjYXNlIDB4MDpcblx0XHRcdFx0cmV0dXJuIFwidmFcIiArIHJlZ251bTtcblx0XHRcdGNhc2UgMHgxOlxuXHRcdFx0XHRpZiAoZGVzYy5oYXNpbmRpcmVjdCAmJiBkZXNjLmhlYWRlci50eXBlID09IFwidmVydGV4XCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJ2Y2FycnJbXCIgKyByZWdudW0gKyBcIl1cIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdGFnICsgXCJjXCIgKyByZWdudW07XG5cdFx0XHRcdH1cblx0XHRcdGNhc2UgMHgyOlxuXHRcdFx0XHRyZXR1cm4gdGFnICsgXCJ0XCIgKyByZWdudW07XG5cdFx0XHRjYXNlIDB4Mzpcblx0XHRcdFx0cmV0dXJuIGRlc2MuaGVhZGVyLnR5cGUgPT0gXCJ2ZXJ0ZXhcIj8gXCJvdXRwb3NcIiA6IFwiZ2xfRnJhZ0NvbG9yXCI7XG5cdFx0XHRjYXNlIDB4NDpcblx0XHRcdFx0cmV0dXJuIFwidmlcIiArIHJlZ251bTtcblx0XHRcdGNhc2UgMHg1OlxuXHRcdFx0XHRyZXR1cm4gXCJmc1wiICsgcmVnbnVtO1xuXHRcdFx0Y2FzZSAweDY6XG5cdFx0XHRcdHJldHVybiBcInRtcF9GcmFnRGVwdGhcIjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IFwiVW5rbm93biByZWdpc3RlciB0eXBlXCI7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHNvdXJjZXRvc3RyaW5nKHMsIHN1YmxpbmUsIGR3bSwgaXNzY2FsYXIsIGRlc2MsIHRhZyk6c3RyaW5nXG5cdHtcblx0XHR2YXIgc3dpeiA9IFsgXCJ4XCIsIFwieVwiLCBcInpcIiwgXCJ3XCIgXTtcblx0XHR2YXIgcjtcblxuXHRcdGlmIChzLmluZGlyZWN0ZmxhZykge1xuXHRcdFx0ciA9IFwidmNhcnJyW2ludChcIiArIHRoaXMucmVndG9zdHJpbmcocy5pbmRleHJlZ3R5cGUsIHMucmVnbnVtLCBkZXNjLCB0YWcpICsgXCIuXCIgKyBzd2l6W3MuaW5kZXhzZWxlY3RdICsgXCIpXCI7XG5cdFx0XHR2YXIgcmVhbG9mcyA9IHN1YmxpbmUgKyBzLmluZGV4b2Zmc2V0O1xuXHRcdFx0aWYgKHJlYWxvZnMgPCAwKSByICs9IHJlYWxvZnMudG9TdHJpbmcoKTtcblx0XHRcdGlmIChyZWFsb2ZzID4gMCkgciArPSBcIitcIiArIHJlYWxvZnMudG9TdHJpbmcoKTtcblx0XHRcdHIgKz0gXCJdXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHIgPSB0aGlzLnJlZ3Rvc3RyaW5nKHMucmVndHlwZSwgcy5yZWdudW0gKyBzdWJsaW5lLCBkZXNjLCB0YWcpO1xuXHRcdH1cblxuXHRcdC8vIHNhbXBsZXJzIG5ldmVyIGFkZCBzd2l6emxlICAgICAgICBcblx0XHRpZiAocy5yZWd0eXBlID09IDB4NSkge1xuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fVxuXG5cdFx0Ly8gc2NhbGFyLCBmaXJzdCBjb21wb25lbnQgb25seVxuXHRcdGlmIChpc3NjYWxhcikge1xuXHRcdFx0cmV0dXJuIHIgKyBcIi5cIiArIHN3aXpbKHMuc3dpenpsZSA+PiAwKSAmIDNdO1xuXHRcdH1cblxuXHRcdC8vIGlkZW50aXR5XG5cdFx0aWYgKHMuc3dpenpsZSA9PSAweGU0ICYmIGR3bSA9PSAweGYpIHtcblx0XHRcdHJldHVybiByO1xuXHRcdH1cblxuXHRcdC8vIHdpdGggZGVzdGluYXRpb24gd3JpdGUgbWFzayBmb2xkZWQgaW5cblx0XHRyICs9IFwiLlwiO1xuXHRcdGlmIChkd20gJiAxKSByICs9IHN3aXpbKHMuc3dpenpsZSA+PiAwKSAmIDNdO1xuXHRcdGlmIChkd20gJiAyKSByICs9IHN3aXpbKHMuc3dpenpsZSA+PiAyKSAmIDNdO1xuXHRcdGlmIChkd20gJiA0KSByICs9IHN3aXpbKHMuc3dpenpsZSA+PiA0KSAmIDNdO1xuXHRcdGlmIChkd20gJiA4KSByICs9IHN3aXpbKHMuc3dpenpsZSA+PiA2KSAmIDNdO1xuXHRcdHJldHVybiByO1xuXHR9XG59XG5cbmV4cG9ydCA9IEFHTFNMUGFyc2VyOyIsImltcG9ydCBIZWFkZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL0hlYWRlclwiKTtcbmltcG9ydCBUb2tlblx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvVG9rZW5cIik7XG5cbmNsYXNzIERlc2NyaXB0aW9uXG57XG5cdHB1YmxpYyByZWdyZWFkOmFueVtdID0gW1xuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdXG5cdF07XG5cdHB1YmxpYyByZWd3cml0ZTphbnlbXSA9IFtcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXVxuXHRdO1xuXHRwdWJsaWMgaGFzaW5kaXJlY3Q6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgd3JpdGVkZXB0aDpib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyBoYXNtYXRyaXg6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgc2FtcGxlcnM6YW55W10gPSBbXTtcblxuXHQvLyBhZGRlZCBkdWUgdG8gZHluYW1pYyBhc3NpZ25tZW50IDMqMHhGRkZGRkZ1dXV1XG5cdHB1YmxpYyB0b2tlbnM6VG9rZW5bXSA9IFtdO1xuXHRwdWJsaWMgaGVhZGVyOkhlYWRlciA9IG5ldyBIZWFkZXIoKTtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBEZXNjcmlwdGlvbjsiLCJjbGFzcyBEZXN0aW5hdGlvblxue1xuXHRwdWJsaWMgbWFzazpudW1iZXIgPSAwO1xuXHRwdWJsaWMgcmVnbnVtOm51bWJlciA9IDA7XG5cdHB1YmxpYyByZWd0eXBlOm51bWJlciA9IDA7XG5cdHB1YmxpYyBkaW06bnVtYmVyID0gMDtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBEZXN0aW5hdGlvbjsiLCJjbGFzcyBIZWFkZXJcbntcblx0cHVibGljIHByb2dpZDpudW1iZXIgPSAwO1xuXHRwdWJsaWMgdmVyc2lvbjpudW1iZXIgPSAwO1xuXHRwdWJsaWMgdHlwZTpzdHJpbmcgPSBcIlwiO1xuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG59XG5cbmV4cG9ydCA9IEhlYWRlcjsiLCJpbXBvcnQgT3BMVVRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL09wTFVUXCIpO1xuXG5jbGFzcyBNYXBwaW5nXG57XG5cdHN0YXRpYyBhZ2FsMmdsc2xsdXQ6QXJyYXk8T3BMVVQ+ID0gW1xuXG5cdFx0Ly8gICAgICAgICBzIFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZsYWdzICAgZGVzdCAgICBhICAgICBiIFx0ICAgIG13IFx0ICBtaCAgICBuZHdtICBzY2FsZSBkbVx0ICBsb2Rcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KCVhKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL21vdiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8wXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdCglYSArICViKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vYWRkICAgICAgICAgICAgICAgICAgICAgIC8vMVxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoJWEgLSAlYik7XFxuXCIsIDAsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL3N1YiAgICAgICAgICAgICAgICAgICAgICAvLzJcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KCVhICogJWIpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9tdWwgICAgICAgICAgICAgICAgICAgICAgLy8zXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdCglYSAvICViKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vZGl2ICAgICAgICAgICAgICAgICAgICAgIC8vNFxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoMS4wKSAvICVhO1xcblwiLCAwLCB0cnVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vcmNwICAgICAgICAgICAgICAgICAgICAvLzVcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KG1pbiglYSwlYikpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9taW4gICAgICAgICAgICAgICAgICAgLy82XG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChtYXgoJWEsJWIpKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vbWF4ICAgICAgICAgICAgICAgICAgIC8vN1xuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoZnJhY3QoJWEpKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL2ZyYyAgICAgICAgICAgICAgICAgICAvLzhcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KHNxcnQoYWJzKCVhKSkpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vc3F0ICAgICAgICAgICAgICAgLy85XG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChpbnZlcnNlc3FydChhYnMoJWEpKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9yc3EgICAgICAgIC8vMTBcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KHBvdyhhYnMoJWEpLCViKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL3BvdyAgICAgICAgICAgICAgLy8xMVxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QobG9nMihhYnMoJWEpKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9sb2cgICAgICAgICAgICAgICAvLzEyXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChleHAyKCVhKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9leHAgICAgICAgICAgICAgICAgICAgIC8vMTNcblxuXHRcdC8vICAgICAgICAgcyBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbGFncyAgXHRkZXN0ICAgIGEgICAgIGIgXHQgICAgbXcgXHQgIG1oICAgIG5kd20gIHNjYWxlIGRtXHQgIGxvZFxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3Qobm9ybWFsaXplKHZlYzMoICVhICkgKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKSwgLy9ucm0gICAgICAvLzE0XG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChzaW4oJWEpKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL3NpbiAgICAgICAgICAgICAgICAgICAgIC8vMTVcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGNvcyglYSkpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vY29zICAgICAgICAgICAgICAgICAgICAgLy8xNlxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoY3Jvc3ModmVjMyglYSksdmVjMyglYikpKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCksIC8vY3JzICAgICAvLzE3XG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChkb3QodmVjMyglYSksdmVjMyglYikpKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCksIC8vZHAzICAgICAgIC8vMThcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGRvdCh2ZWM0KCVhKSx2ZWM0KCViKSkpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKSwgLy9kcDQgICAgICAgLy8xOVxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoYWJzKCVhKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9hYnMgICAgICAgICAgICAgICAgICAgICAvLzIwXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdCglYSAqIC0xLjApO1xcblwiLCAwLCB0cnVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vbmVnICAgICAgICAgICAgICAgICAgIC8vMjFcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGNsYW1wKCVhLDAuMCwxLjApKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCAvL3NhdCAgICAgICAgICAgLy8yMlxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoZG90KHZlYzMoJWEpLHZlYzMoJWIpKSk7XFxuXCIsIG51bGwsIHRydWUsIHRydWUsIHRydWUsIDMsIDMsIHRydWUsIG51bGwsIG51bGwsIG51bGwpLCAvL20zMyAgICAgICAgICAvLzIzXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChkb3QodmVjNCglYSksdmVjNCglYikpKTtcXG5cIiwgbnVsbCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgNCwgNCwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCksIC8vbTQ0ICAgICAgICAgIC8vMjRcblx0XHRuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGRvdCh2ZWM0KCVhKSx2ZWM0KCViKSkpO1xcblwiLCBudWxsLCB0cnVlLCB0cnVlLCB0cnVlLCA0LCAzLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKSwgLy9tNDMgICAgICAgICAgLy8yNVxuXHRcdC8vczpzdHJpbmcsIGZsYWdzOm51bWJlciwgZGVzdDpib29sZWFuLCBhOmJvb2xlYW4sIGI6Ym9vbGVhbiwgbWF0cml4d2lkdGg6bnVtYmVyLCBtYXRyaXhoZWlnaHQ6bnVtYmVyLCBuZHdtOmJvb2xlYW4sIHNjYWxlcjpib29sZWFuLCBkbTpib29sZWFuLCBsb2Q6Ym9vbGVhblxuXHRcdG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3QoZEZkeCglYSkpO1xcblwiLCAwLCB0cnVlLCB0cnVlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIC8vZEZkeCAgICAgICAgICAgICAgICAgICAvLzI2XG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChkRmR5KCVhKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgLy9kRmR5ICAgICAgICAgICAgICAgICAgIC8vMjdcblx0XHRuZXcgT3BMVVQoXCJpZiAoZmxvYXQoJWEpPT1mbG9hdCglYikpIHs7XFxuXCIsIDAsIGZhbHNlLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCBudWxsKSwgbmV3IE9wTFVUKFwiaWYgKGZsb2F0KCVhKSE9ZmxvYXQoJWIpKSB7O1xcblwiLCAwLCBmYWxzZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgbnVsbCksIG5ldyBPcExVVChcImlmIChmbG9hdCglYSk+PWZsb2F0KCViKSkgeztcXG5cIiwgMCwgZmFsc2UsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQoXCJpZiAoZmxvYXQoJWEpPGZsb2F0KCViKSkgeztcXG5cIiwgMCwgZmFsc2UsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQoXCJ9IGVsc2UgeztcXG5cIiwgMCwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIG5ldyBPcExVVChcIn07XFxuXCIsIDAsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLFxuXG5cdFx0Ly8gICAgICAgICBzIFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZsYWdzICBcdGRlc3QgICAgYSAgICAgYiBcdCAgICBtdyBcdCAgbWggICAgbmR3bSAgc2NhbGUgZG1cdCAgbG9kXG5cdFx0bmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdCh0ZXh0dXJlJXRleGRpbUxvZCglYiwldGV4c2l6ZSglYSkpLiVkbSk7XFxuXCIsIG51bGwsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIHRydWUsIG51bGwpLCBuZXcgT3BMVVQoXCJpZiAoIGZsb2F0KCVhKTwwLjAgKSBkaXNjYXJkO1xcblwiLCBudWxsLCBmYWxzZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIG51bGwpLCBuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KHRleHR1cmUldGV4ZGltKCViLCV0ZXhzaXplKCVhKSVsb2QpLiVkbSk7XFxuXCIsIG51bGwsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIHRydWUsIHRydWUpLCBuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGdyZWF0ZXJUaGFuRXF1YWwoJWEsJWIpLiVkbSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIHRydWUsIG51bGwpLCBuZXcgT3BMVVQoXCIlZGVzdCA9ICVjYXN0KGxlc3NUaGFuKCVhLCViKS4lZG0pO1xcblwiLCAwLCB0cnVlLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsLCB0cnVlLCBudWxsLCB0cnVlLCBudWxsKSwgbmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChzaWduKCVhKSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIGZhbHNlLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgbmV3IE9wTFVUKFwiJWRlc3QgPSAlY2FzdChlcXVhbCglYSwlYikuJWRtKTtcXG5cIiwgMCwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgdHJ1ZSwgbnVsbCksIG5ldyBPcExVVChcIiVkZXN0ID0gJWNhc3Qobm90RXF1YWwoJWEsJWIpLiVkbSk7XFxuXCIsIDAsIHRydWUsIHRydWUsIHRydWUsIG51bGwsIG51bGwsIHRydWUsIG51bGwsIHRydWUsIG51bGwpXG5cblx0XTtcblxuXHQvL1RPRE86IGdldCByaWQgb2YgaGFjayB0aGF0IGZpeGVzIGluY2x1ZGluZyBkZWZpbml0aW9uIGZpbGVcblx0Y29uc3RydWN0b3IoaW5jbHVkZT86T3BMVVQpXG5cdHtcblxuXHR9XG59XG5cbmV4cG9ydCA9IE1hcHBpbmc7IiwiY2xhc3MgT3BMVVRcbntcblxuXHRwdWJsaWMgczpzdHJpbmc7XG5cdHB1YmxpYyBmbGFnczpudW1iZXI7XG5cdHB1YmxpYyBkZXN0OmJvb2xlYW47XG5cdHB1YmxpYyBhOmJvb2xlYW47XG5cdHB1YmxpYyBiOmJvb2xlYW47XG5cdHB1YmxpYyBtYXRyaXh3aWR0aDpudW1iZXI7XG5cdHB1YmxpYyBtYXRyaXhoZWlnaHQ6bnVtYmVyO1xuXHRwdWJsaWMgbmR3bTpib29sZWFuO1xuXHRwdWJsaWMgc2NhbGFyOmJvb2xlYW47XG5cdHB1YmxpYyBkbTpib29sZWFuO1xuXHRwdWJsaWMgbG9kOmJvb2xlYW47XG5cblx0Y29uc3RydWN0b3IoczpzdHJpbmcsIGZsYWdzOm51bWJlciwgZGVzdDpib29sZWFuLCBhOmJvb2xlYW4sIGI6Ym9vbGVhbiwgbWF0cml4d2lkdGg6bnVtYmVyLCBtYXRyaXhoZWlnaHQ6bnVtYmVyLCBuZHdtOmJvb2xlYW4sIHNjYWxlcjpib29sZWFuLCBkbTpib29sZWFuLCBsb2Q6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMucyA9IHM7XG5cdFx0dGhpcy5mbGFncyA9IGZsYWdzO1xuXHRcdHRoaXMuZGVzdCA9IGRlc3Q7XG5cdFx0dGhpcy5hID0gYTtcblx0XHR0aGlzLmIgPSBiO1xuXHRcdHRoaXMubWF0cml4d2lkdGggPSBtYXRyaXh3aWR0aDtcblx0XHR0aGlzLm1hdHJpeGhlaWdodCA9IG1hdHJpeGhlaWdodDtcblx0XHR0aGlzLm5kd20gPSBuZHdtO1xuXHRcdHRoaXMuc2NhbGFyID0gc2NhbGVyO1xuXHRcdHRoaXMuZG0gPSBkbTtcblx0XHR0aGlzLmxvZCA9IGxvZDtcblx0fVxufVxuXG5leHBvcnQgPSBPcExVVDsiLCJjbGFzcyBTYW1wbGVyXG57XG5cdHB1YmxpYyBsb2RiaWFzOm51bWJlciA9IDA7XG5cdHB1YmxpYyBkaW06bnVtYmVyID0gMDtcblx0cHVibGljIHJlYWRtb2RlOm51bWJlciA9IDA7XG5cdHB1YmxpYyBzcGVjaWFsOm51bWJlciA9IDA7XG5cdHB1YmxpYyB3cmFwOm51bWJlciA9IDA7XG5cdHB1YmxpYyBtaXBtYXA6bnVtYmVyID0gMDtcblx0cHVibGljIGZpbHRlcjpudW1iZXIgPSAwO1xuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG59XG5cbmV4cG9ydCA9IFNhbXBsZXI7IiwiaW1wb3J0IERlc3RpbmF0aW9uXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvRGVzdGluYXRpb25cIik7XG5cbmNsYXNzIFRva2VuXG57XG5cdHB1YmxpYyBkZXN0OkRlc3RpbmF0aW9uID0gbmV3IERlc3RpbmF0aW9uKCk7XG5cdHB1YmxpYyBvcGNvZGU6bnVtYmVyID0gMDtcblx0cHVibGljIGE6RGVzdGluYXRpb24gPSBuZXcgRGVzdGluYXRpb24oKTtcblx0cHVibGljIGI6RGVzdGluYXRpb24gPSBuZXcgRGVzdGluYXRpb24oKTtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBUb2tlbjsiLCJpbXBvcnQgU2FtcGxlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvYXNzZW1ibGVyL1NhbXBsZXJcIik7XG5pbXBvcnQgT3Bjb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvT3Bjb2RlXCIpO1xuaW1wb3J0IE9wY29kZU1hcFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9PcGNvZGVNYXBcIik7XG5pbXBvcnQgUGFydFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvUGFydFwiKTtcbmltcG9ydCBSZWdNYXBcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9SZWdNYXBcIik7XG5pbXBvcnQgU2FtcGxlck1hcFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9TYW1wbGVyTWFwXCIpO1xuXG5cbmNsYXNzIEFHQUxNaW5pQXNzZW1ibGVyXG57XG5cdHB1YmxpYyByOk9iamVjdDtcblx0cHVibGljIGN1cjpQYXJ0O1xuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuciA9IHt9O1xuXHRcdHRoaXMuY3VyID0gbmV3IFBhcnQoKTtcblx0fVxuXG5cdHB1YmxpYyBhc3NlbWJsZShzb3VyY2U6c3RyaW5nLCBleHRfcGFydCA9IG51bGwsIGV4dF92ZXJzaW9uID0gbnVsbClcblx0e1xuXHRcdGlmICghZXh0X3ZlcnNpb24pIHtcblx0XHRcdGV4dF92ZXJzaW9uID0gMTtcblx0XHR9XG5cblx0XHRpZiAoZXh0X3BhcnQpIHtcblx0XHRcdHRoaXMuYWRkSGVhZGVyKGV4dF9wYXJ0LCBleHRfdmVyc2lvbik7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmVzID0gc291cmNlLnJlcGxhY2UoL1tcXGZcXG5cXHJcXHZdKy9nLCBcIlxcblwiKS5zcGxpdChcIlxcblwiKTsgLy8gaGFuZGxlIGJyZWFrcywgdGhlbiBzcGxpdCBpbnRvIGxpbmVzXG5cblx0XHRmb3IgKHZhciBpIGluIGxpbmVzKSB7XG5cdFx0XHR0aGlzLnByb2Nlc3NMaW5lKGxpbmVzW2ldLCBpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5yO1xuXHR9XG5cblx0cHJpdmF0ZSBwcm9jZXNzTGluZShsaW5lLCBsaW5lbnIpXG5cdHtcblx0XHR2YXIgc3RhcnRjb21tZW50Om51bWJlciA9IGxpbmUuc2VhcmNoKFwiLy9cIik7ICAvLyByZW1vdmUgY29tbWVudHNcblx0XHRpZiAoc3RhcnRjb21tZW50ICE9IC0xKSB7XG5cdFx0XHRsaW5lID0gbGluZS5zbGljZSgwLCBzdGFydGNvbW1lbnQpO1xuXHRcdH1cblx0XHRsaW5lID0gbGluZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTsgLy8gcmVtb3ZlIG91dGVyIHNwYWNlXG5cdFx0aWYgKCEobGluZS5sZW5ndGggPiAwICkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIG9wdHNpOm51bWJlciA9IGxpbmUuc2VhcmNoKC88Lio+L2cpOyAvLyBzcGxpdCBvZiBvcHRpb25zIHBhcnQgPCo+IGlmIHRoZXJlXG5cdFx0dmFyIG9wdHM6c3RyaW5nW10gPSBudWxsO1xuXHRcdGlmIChvcHRzaSAhPSAtMSkge1xuXHRcdFx0b3B0cyA9IGxpbmUuc2xpY2Uob3B0c2kpLm1hdGNoKC8oW1xcd1xcLlxcLVxcK10rKS9naSk7XG5cdFx0XHRsaW5lID0gbGluZS5zbGljZSgwLCBvcHRzaSk7XG5cdFx0fVxuXG5cdFx0Ly8gZ2V0IG9wY29kZS9jb21tYW5kXHRcdFx0XHQgICAgICAgICAgICBcblx0XHR2YXIgdG9rZW5zID0gbGluZS5tYXRjaCgvKFtcXHdcXC5cXCtcXFtcXF1dKykvZ2kpOyAvLyBnZXQgdG9rZW5zIGluIGxpbmVcblx0XHRpZiAoIXRva2VucyB8fCB0b2tlbnMubGVuZ3RoIDwgMSkge1xuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID49IDMpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJXYXJuaW5nOiBiYWQgbGluZSBcIiArIGxpbmVuciArIFwiOiBcIiArIGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2cgKCBsaW5lbnIsIGxpbmUsIGN1ciwgdG9rZW5zICk7IFxuXHRcdHN3aXRjaCAodG9rZW5zWzBdKSB7XG5cdFx0XHRjYXNlIFwicGFydFwiOlxuXHRcdFx0XHR0aGlzLmFkZEhlYWRlcih0b2tlbnNbMV0sIE51bWJlcih0b2tlbnNbMl0pKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiZW5kcGFydFwiOlxuXHRcdFx0XHRpZiAoIXRoaXMuY3VyKSB7XG5cdFx0XHRcdFx0dGhyb3cgXCJVbmV4cGVjdGVkIGVuZHBhcnRcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmN1ci5kYXRhLnBvc2l0aW9uID0gMDtcblx0XHRcdFx0dGhpcy5jdXIgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAoIXRoaXMuY3VyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJXYXJuaW5nOiBiYWQgbGluZSBcIiArIGxpbmVuciArIFwiOiBcIiArIGxpbmUgKyBcIiAoT3V0c2lkZSBvZiBhbnkgcGFydCBkZWZpbml0aW9uKVwiKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuY3VyLm5hbWUgPT0gXCJjb21tZW50XCIpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIG9wOk9wY29kZSA9IDxPcGNvZGU+IE9wY29kZU1hcC5tYXBbdG9rZW5zWzBdXTtcblx0XHRcdFx0aWYgKCFvcCkge1xuXHRcdFx0XHRcdHRocm93IFwiQmFkIG9wY29kZSBcIiArIHRva2Vuc1swXSArIFwiIFwiICsgbGluZW5yICsgXCI6IFwiICsgbGluZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyggJ0FHQUxNaW5pQXNzZW1ibGVyJyAsICdvcCcgLCBvcCApO1xuXG5cdFx0XHRcdHRoaXMuZW1pdE9wY29kZSh0aGlzLmN1ciwgb3Aub3Bjb2RlKTtcblx0XHRcdFx0dmFyIHRpOm51bWJlciA9IDE7XG5cdFx0XHRcdGlmIChvcC5kZXN0ICYmIG9wLmRlc3QgIT0gXCJub25lXCIpIHtcblx0XHRcdFx0XHRpZiAoIXRoaXMuZW1pdERlc3QodGhpcy5jdXIsIHRva2Vuc1t0aSsrXSwgb3AuZGVzdCkpIHtcblx0XHRcdFx0XHRcdHRocm93IFwiQmFkIGRlc3RpbmF0aW9uIHJlZ2lzdGVyIFwiICsgdG9rZW5zW3RpIC0gMV0gKyBcIiBcIiArIGxpbmVuciArIFwiOiBcIiArIGxpbmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuZW1pdFplcm9Ed29yZCh0aGlzLmN1cik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob3AuYSAmJiBvcC5hLmZvcm1hdCAhPSBcIm5vbmVcIikge1xuXHRcdFx0XHRcdGlmICghdGhpcy5lbWl0U291cmNlKHRoaXMuY3VyLCB0b2tlbnNbdGkrK10sIG9wLmEpKSB0aHJvdyBcIkJhZCBzb3VyY2UgcmVnaXN0ZXIgXCIgKyB0b2tlbnNbdGkgLSAxXSArIFwiIFwiICsgbGluZW5yICsgXCI6IFwiICsgbGluZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmVtaXRaZXJvUXdvcmQodGhpcy5jdXIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wLmIgJiYgb3AuYi5mb3JtYXQgIT0gXCJub25lXCIpIHtcblx0XHRcdFx0XHRpZiAob3AuYi5mb3JtYXQgPT0gXCJzYW1wbGVyXCIpIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5lbWl0U2FtcGxlcih0aGlzLmN1ciwgdG9rZW5zW3RpKytdLCBvcC5iLCBvcHRzKSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBcIkJhZCBzYW1wbGVyIHJlZ2lzdGVyIFwiICsgdG9rZW5zW3RpIC0gMV0gKyBcIiBcIiArIGxpbmVuciArIFwiOiBcIiArIGxpbmU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5lbWl0U291cmNlKHRoaXMuY3VyLCB0b2tlbnNbdGkrK10sIG9wLmIpKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IFwiQmFkIHNvdXJjZSByZWdpc3RlciBcIiArIHRva2Vuc1t0aSAtIDFdICsgXCIgXCIgKyBsaW5lbnIgKyBcIjogXCIgKyBsaW5lO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmVtaXRaZXJvUXdvcmQodGhpcy5jdXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBlbWl0SGVhZGVyKHByOlBhcnQpXG5cdHtcblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDB4YTApOyBcdC8vIHRhZyB2ZXJzaW9uXG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkSW50KHByLnZlcnNpb24pO1xuXHRcdGlmIChwci52ZXJzaW9uID49IDB4MTApIHtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMCk7IC8vIGFsaWduLCBmb3IgaGlnaGVyIHZlcnNpb25zXG5cdFx0fVxuXHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMHhhMSk7XHRcdC8vIHRhZyBwcm9ncmFtIGlkXG5cdFx0c3dpdGNoIChwci5uYW1lKSB7XG5cdFx0XHRjYXNlIFwiZnJhZ21lbnRcIiA6XG5cdFx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInZlcnRleFwiIDpcblx0XHRcdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZSgwKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiY3B1XCIgOlxuXHRcdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQgOlxuXHRcdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDB4ZmYpO1xuXHRcdFx0XHRicmVhazsgLy8gdW5rbm93bi9jb21tZW50XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGVtaXRPcGNvZGUocHI6UGFydCwgb3Bjb2RlKVxuXHR7XG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkSW50KG9wY29kZSk7XG5cdFx0Ly9jb25zb2xlLmxvZyAoIFwiRW1pdCBvcGNvZGU6IFwiLCBvcGNvZGUgKTsgXG5cdH1cblxuXHRwdWJsaWMgZW1pdFplcm9Ed29yZChwcjpQYXJ0KVxuXHR7XG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkSW50KDApO1xuXHR9XG5cblx0cHVibGljIGVtaXRaZXJvUXdvcmQocHIpXG5cdHtcblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRJbnQoMCk7XG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkSW50KDApO1xuXHR9XG5cblx0cHVibGljIGVtaXREZXN0KHByLCB0b2tlbiwgb3BkZXN0KVxuXHR7XG5cblx0XHQvL2NvbnNvbGUubG9nKCAnQUdBTE1pbmlBc3NlbWJsZXInICwgJ2VtaXREZXN0JyAsICdSZWdNYXAubWFwJyAsIFJlZ01hcC5tYXApO1xuXHRcdHZhciByZWcgPSB0b2tlbi5tYXRjaCgvKFtmb3ZdP1t0cG9jaWRhdnNdKShcXGQqKShcXC5beHl6d117MSw0fSk/L2kpOyAvLyBnMTogcmVnbmFtZSwgZzI6cmVnbnVtLCBnMzptYXNrXG5cblx0XHQvLyBjb25zb2xlLmxvZyggJ0FHQUxNaW5pQXNzZW1ibGVyJyAsICdlbWl0RGVzdCcgLCAncmVnJyAsIHJlZyAsIHJlZ1sxXSAsIFJlZ01hcC5tYXBbcmVnWzFdXSApO1xuXHRcdC8vIGNvbnNvbGUubG9nKCAnQUdBTE1pbmlBc3NlbWJsZXInICwgJ2VtaXREZXN0JyAsICdSZWdNYXAubWFwW3JlZ1sxXV0nICwgUmVnTWFwLm1hcFtyZWdbMV1dICwgJ2Jvb2wnICwgIVJlZ01hcC5tYXBbcmVnWzFdXSApIDtcblxuXHRcdGlmICghUmVnTWFwLm1hcFtyZWdbMV1dKSByZXR1cm4gZmFsc2U7XG5cdFx0dmFyIGVtID0geyBudW06cmVnWzJdPyByZWdbMl0gOiAwLCBjb2RlOlJlZ01hcC5tYXBbcmVnWzFdXS5jb2RlLCBtYXNrOnRoaXMuc3RyaW5nVG9NYXNrKHJlZ1szXSkgfTtcblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRTaG9ydChlbS5udW0pO1xuXHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoZW0ubWFzayk7XG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZShlbS5jb2RlKTtcblx0XHQvL2NvbnNvbGUubG9nICggXCIgIEVtaXQgZGVzdDogXCIsIGVtICk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRwdWJsaWMgc3RyaW5nVG9NYXNrKHM6c3RyaW5nKTpudW1iZXJcblx0e1xuXHRcdGlmICghcykgcmV0dXJuIDB4Zjtcblx0XHR2YXIgciA9IDA7XG5cdFx0aWYgKHMuaW5kZXhPZihcInhcIikgIT0gLTEpIHIgfD0gMTtcblx0XHRpZiAocy5pbmRleE9mKFwieVwiKSAhPSAtMSkgciB8PSAyO1xuXHRcdGlmIChzLmluZGV4T2YoXCJ6XCIpICE9IC0xKSByIHw9IDQ7XG5cdFx0aWYgKHMuaW5kZXhPZihcIndcIikgIT0gLTEpIHIgfD0gODtcblx0XHRyZXR1cm4gcjtcblx0fVxuXG5cdHB1YmxpYyBzdHJpbmdUb1N3aXp6bGUocylcblx0e1xuXHRcdGlmICghcykge1xuXHRcdFx0cmV0dXJuIDB4ZTQ7XG5cdFx0fVxuXHRcdHZhciBjaGFydG9pbmRleCA9IHsgeDowLCB5OjEsIHo6MiwgdzozIH07XG5cdFx0dmFyIHN3ID0gMDtcblxuXHRcdGlmIChzLmNoYXJBdCgwKSAhPSBcIi5cIikge1xuXHRcdFx0dGhyb3cgXCJNaXNzaW5nIC4gZm9yIHN3aXp6bGVcIjtcblx0XHR9XG5cblx0XHRpZiAocy5sZW5ndGggPiAxKSB7XG5cdFx0XHRzdyB8PSBjaGFydG9pbmRleFtzLmNoYXJBdCgxKV07XG5cdFx0fVxuXG5cdFx0aWYgKHMubGVuZ3RoID4gMikge1xuXHRcdFx0c3cgfD0gY2hhcnRvaW5kZXhbcy5jaGFyQXQoMildIDw8IDI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN3IHw9IChzdyAmIDMpIDw8IDI7XG5cdFx0fVxuXG5cdFx0aWYgKHMubGVuZ3RoID4gMykge1xuXHRcdFx0c3cgfD0gY2hhcnRvaW5kZXhbcy5jaGFyQXQoMyldIDw8IDQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN3IHw9IChzdyAmICgzIDw8IDIpKSA8PCAyO1xuXHRcdH1cblxuXHRcdGlmIChzLmxlbmd0aCA+IDQpIHtcblx0XHRcdHN3IHw9IGNoYXJ0b2luZGV4W3MuY2hhckF0KDQpXSA8PCA2O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdyB8PSAoc3cgJiAoMyA8PCA0KSkgPDwgMjtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3c7XG5cdH1cblxuXHRwdWJsaWMgZW1pdFNhbXBsZXIocHI6UGFydCwgdG9rZW4sIG9wc3JjLCBvcHRzKVxuXHR7XG5cdFx0dmFyIHJlZzpzdHJpbmdbXSA9IHRva2VuLm1hdGNoKC9mcyhcXGQqKS9pKTsgLy8gZzE6cmVnbnVtXG5cdFx0aWYgKCFyZWcgfHwgIXJlZ1sxXSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRTaG9ydChwYXJzZUludChyZWdbMV0pKTtcblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDApOyAgIC8vIGJpYXNcblx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDApO1xuXHRcdC8qXG5cdFx0IHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUgKCAweDUgKTtcblx0XHQgcHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZSAoIDAgKTsgICAvLyByZWFkbW9kZSwgZGltXG5cdFx0IHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUgKCAwICk7ICAgLy8gc3BlY2lhbCwgd3JhcFxuXHRcdCBwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlICggMCApOyAgIC8vIG1pcCwgZmlsdGVyXG5cdFx0ICovXG5cdFx0dmFyIHNhbXBsZXJiaXRzOm51bWJlciA9IDB4NTtcblx0XHR2YXIgc2FtcGxlcm9wdHNldDpudW1iZXIgPSAwO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IG9wdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBvOlNhbXBsZXIgPSA8U2FtcGxlcj4gU2FtcGxlck1hcC5tYXBbIG9wdHNbaV0udG9Mb3dlckNhc2UoKSBdO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKCAnQUdBTE1pbmlBc3NlbWJsZXInICwgJ2VtaXRTYW1wbGVyJyAsICdTYW1wbGVNYXAgb3B0OicgLCBvICwgJzwtLS0tLS0tLSBXQVRDSCBGT1IgVEhJUycpO1xuXG5cdFx0XHRpZiAobykge1xuXHRcdFx0XHRpZiAoKChzYW1wbGVyb3B0c2V0ID4+IG8uc2hpZnQpICYgby5tYXNrKSAhPSAwKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJXYXJuaW5nLCBkdXBsaWNhdGUgc2FtcGxlciBvcHRpb25cIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2FtcGxlcm9wdHNldCB8PSBvLm1hc2sgPDwgby5zaGlmdDtcblx0XHRcdFx0c2FtcGxlcmJpdHMgJj0gfihvLm1hc2sgPDwgby5zaGlmdCk7XG5cdFx0XHRcdHNhbXBsZXJiaXRzIHw9IG8udmFsdWUgPDwgby5zaGlmdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiV2FybmluZywgdW5rbm93biBzYW1wbGVyIG9wdGlvbjogXCIsIG9wdHNbaV0pO1xuXHRcdFx0XHQvLyB0b2RvIGJpYXNcblx0XHRcdH1cblx0XHR9XG5cdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkSW50KHNhbXBsZXJiaXRzKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBlbWl0U291cmNlKHByLCB0b2tlbiwgb3BzcmMpXG5cdHtcblx0XHR2YXIgaW5kZXhlZCA9IHRva2VuLm1hdGNoKC92Y1xcWyh2W3RjYWldKShcXGQrKVxcLihbeHl6d10pKFtcXCtcXC1dXFxkKyk/XFxdKFxcLlt4eXp3XXsxLDR9KT8vaSk7IC8vIGcxOiBpbmRleHJlZ25hbWUsIGcyOmluZGV4cmVnbnVtLCBnMzpzZWxlY3QsIFtnNDpvZmZzZXRdLCBbZzU6c3dpenpsZV1cblx0XHR2YXIgcmVnO1xuXHRcdGlmIChpbmRleGVkKSB7XG5cdFx0XHRpZiAoIVJlZ01hcC5tYXBbaW5kZXhlZFsxXV0pIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGluZGV4ID0geyB4OjAsIHk6MSwgejoyLCB3OjMgfTtcblx0XHRcdHZhciBlbTphbnkgPSB7IG51bTppbmRleGVkWzJdIHwgMCwgY29kZTpSZWdNYXAubWFwW2luZGV4ZWRbMV1dLmNvZGUsIHN3aXp6bGU6dGhpcy5zdHJpbmdUb1N3aXp6bGUoaW5kZXhlZFs1XSksIHNlbGVjdDpzZWxpbmRleFtpbmRleGVkWzNdXSwgb2Zmc2V0OmluZGV4ZWRbNF0gfCAwIH07XG5cdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRTaG9ydChlbS5udW0pO1xuXHRcdFx0cHIuZGF0YS53cml0ZUJ5dGUoZW0ub2Zmc2V0KTtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoZW0uc3dpenpsZSk7XG5cdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDB4MSk7IC8vIGNvbnN0YW50IHJlZ1xuXHRcdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZShlbS5jb2RlKTtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoZW0uc2VsZWN0KTtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMSA8PCA3KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVnID0gdG9rZW4ubWF0Y2goLyhbZm92XT9bdHBvY2lkYXZzXSkoXFxkKikoXFwuW3h5enddezEsNH0pPy9pKTsgLy8gZzE6IHJlZ25hbWUsIGcyOnJlZ251bSwgZzM6c3dpenpsZVxuXHRcdFx0aWYgKCFSZWdNYXAubWFwW3JlZ1sxXV0pIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGVtOmFueSA9IHsgbnVtOnJlZ1syXSB8IDAsIGNvZGU6UmVnTWFwLm1hcFtyZWdbMV1dLmNvZGUsIHN3aXp6bGU6dGhpcy5zdHJpbmdUb1N3aXp6bGUocmVnWzNdKSB9O1xuXHRcdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkU2hvcnQoZW0ubnVtKTtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMCk7XG5cdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKGVtLnN3aXp6bGUpO1xuXHRcdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZShlbS5jb2RlKTtcblx0XHRcdHByLmRhdGEud3JpdGVVbnNpZ25lZEJ5dGUoMCk7XG5cdFx0XHRwci5kYXRhLndyaXRlVW5zaWduZWRCeXRlKDApO1xuXHRcdFx0cHIuZGF0YS53cml0ZVVuc2lnbmVkQnl0ZSgwKTtcblx0XHRcdC8vY29uc29sZS5sb2cgKCBcIiAgRW1pdCBzb3VyY2U6IFwiLCBlbSwgcHIuZGF0YS5sZW5ndGggKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRwdWJsaWMgYWRkSGVhZGVyKHBhcnRuYW1lLCB2ZXJzaW9uKVxuXHR7XG5cdFx0aWYgKCF2ZXJzaW9uKSB7XG5cdFx0XHR2ZXJzaW9uID0gMTtcblx0XHR9XG5cdFx0aWYgKHRoaXMucltwYXJ0bmFtZV0gPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnJbcGFydG5hbWVdID0gbmV3IFBhcnQocGFydG5hbWUsIHZlcnNpb24pO1xuXHRcdFx0dGhpcy5lbWl0SGVhZGVyKHRoaXMuclsgcGFydG5hbWUgXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnJbcGFydG5hbWVdLnZlcnNpb24gIT0gdmVyc2lvbikge1xuXHRcdFx0dGhyb3cgXCJNdWx0aXBsZSB2ZXJzaW9ucyBmb3IgcGFydCBcIiArIHBhcnRuYW1lO1xuXHRcdH1cblx0XHR0aGlzLmN1ciA9IHRoaXMucltwYXJ0bmFtZV07XG5cdH1cbn1cblxuZXhwb3J0ID0gQUdBTE1pbmlBc3NlbWJsZXI7IiwiY2xhc3MgRlNcbntcblx0cHVibGljIGZvcm1hdDpzdHJpbmc7XG5cdHB1YmxpYyBzaXplOm51bWJlcjtcbn1cblxuZXhwb3J0ID0gRlM7XG4iLCJjbGFzcyBGbGFnc1xue1xuXHRwdWJsaWMgc2ltcGxlOmJvb2xlYW47XG5cdHB1YmxpYyBob3Jpem9udGFsOmJvb2xlYW47XG5cdHB1YmxpYyBmcmFnb25seTpib29sZWFuO1xuXHRwdWJsaWMgbWF0cml4OmJvb2xlYW47XG59XG5cbmV4cG9ydCA9IEZsYWdzO1xuIiwiaW1wb3J0IE9wY29kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvYXNzZW1ibGVyL09wY29kZVwiKTtcblxuY2xhc3MgT3Bjb2RlTWFwXG57XG5cdC8vIGRlc3Q6XHRcdFx0XHRcdCAgXHRcdFx0XHRcdCAgIHN0cmluZywgIGFmb3JtYXQsIGFzaXplLCBiZm9ybWF0LCAgIGJzaXplLCBvcGNvZGUsIHNpbXBsZSwgaG9yaXpvbnRhbCwgZnJhZ29ubHkgICBtYXRyaXhcblx0Lypcblx0IHB1YmxpYyBzdGF0aWMgbW92Ok9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwibm9uZVwiLCAgICAwLCAgICAgMHgwMCwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBhZGQ6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJub25lXCIsICAgIDAsICAgICAweDAxLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cblx0IHB1YmxpYyBzdGF0aWMgc3ViOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgwMiwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBtdWw6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDAzLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIGRpdjpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcInZlY3RvclwiLCAgNCwgICAgIDB4MDQsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgcmNwOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwibm9uZVwiLCAgICAwLCAgICAgMHgwNSwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBtaW46T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDA2LCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIG1heDpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcInZlY3RvclwiLCAgNCwgICAgIDB4MDcsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgZnJjOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwibm9uZVwiLCAgICAwLCAgICAgMHgwOCwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBzcXQ6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJub25lXCIsICAgIDAsICAgICAweDA5LCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIHJzcTpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcIm5vbmVcIiwgICAgMCwgICAgIDB4MGEsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgcG93Ok9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgwYiwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBsb2c6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJub25lXCIsICAgIDAsICAgICAweDBjLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIGV4cDpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcIm5vbmVcIiwgICAgMCwgICAgIDB4MGQsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgbnJtOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwibm9uZVwiLCAgICAwLCAgICAgMHgwZSwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBzaW46T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJub25lXCIsICAgIDAsICAgICAweDBmLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIGNvczpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcIm5vbmVcIiwgICAgMCwgICAgIDB4MTAsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgY3JzOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgxMSwgICB0cnVlLCAgIHRydWUsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBkcDM6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDEyLCAgIHRydWUsICAgdHJ1ZSwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIGRwNDpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcInZlY3RvclwiLCAgNCwgICAgIDB4MTMsICAgdHJ1ZSwgICB0cnVlLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgYWJzOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwibm9uZVwiLCAgICAwLCAgICAgMHgxNCwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBuZWc6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJub25lXCIsICAgIDAsICAgICAweDE1LCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIHNhdDpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcIm5vbmVcIiwgICAgMCwgICAgIDB4MTYsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblxuXHQgcHVibGljIHN0YXRpYyB0ZWQ6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJzYW1wbGVyXCIsIDEsICAgICAweDI2LCAgIHRydWUsICAgbnVsbCwgICAgICAgdHJ1ZSwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIGtpbDpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcIm5vbmVcIiwgICBcInNjYWxhclwiLCAxLCAgICBcIm5vbmVcIiwgICAgMCwgICAgIDB4MjcsICAgdHJ1ZSwgICBudWxsLCAgICAgICB0cnVlLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgdGV4Ok9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwic2FtcGxlclwiLCAxLCAgICAgMHgyOCwgICB0cnVlLCAgIG51bGwsICAgICAgIHRydWUsICAgICAgbnVsbCApO1xuXG5cdCBwdWJsaWMgc3RhdGljIG0zMzpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcIm1hdHJpeFwiLCAzLCAgICBcInZlY3RvclwiLCAgMywgICAgIDB4MTcsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIHRydWUgKTtcblx0IHB1YmxpYyBzdGF0aWMgbTQ0Ok9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwibWF0cml4XCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgxOCwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgdHJ1ZSApO1xuXHQgcHVibGljIHN0YXRpYyBtNDM6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJtYXRyaXhcIiwgMywgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDE5LCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICB0cnVlICk7XG5cblx0IHB1YmxpYyBzdGF0aWMgc2dlOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgyOSwgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBzbHQ6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDJhLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCBwdWJsaWMgc3RhdGljIHNnbjpPcGNvZGUgPSBuZXcgT3Bjb2RlKCBcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCAgICBcInZlY3RvclwiLCAgNCwgICAgIDB4MmIsICAgdHJ1ZSwgICBudWxsLCAgICAgICBudWxsLCAgICAgIG51bGwgKTtcblx0IHB1YmxpYyBzdGF0aWMgc2VxOk9wY29kZSA9IG5ldyBPcGNvZGUoIFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsICAgIFwidmVjdG9yXCIsICA0LCAgICAgMHgyYywgICB0cnVlLCAgIG51bGwsICAgICAgIG51bGwsICAgICAgbnVsbCApO1xuXHQgcHVibGljIHN0YXRpYyBzbmU6T3Bjb2RlID0gbmV3IE9wY29kZSggXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgICAgXCJ2ZWN0b3JcIiwgIDQsICAgICAweDJkLCAgIHRydWUsICAgbnVsbCwgICAgICAgbnVsbCwgICAgICBudWxsICk7XG5cdCAqL1xuXG5cblx0cHJpdmF0ZSBzdGF0aWMgX21hcDpPYmplY3RbXTtcblxuXHRwdWJsaWMgc3RhdGljIGdldCBtYXAoKTpPYmplY3RbXVxuXHR7XG5cblx0XHRpZiAoIU9wY29kZU1hcC5fbWFwKSB7XG5cblx0XHRcdE9wY29kZU1hcC5fbWFwID0gbmV3IEFycmF5PE9iamVjdD4oKTtcblx0XHRcdE9wY29kZU1hcC5fbWFwWydtb3YnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MDAsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgICAgLy8wXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnYWRkJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MDEsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgIC8vMVxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3N1YiddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcInZlY3RvclwiLCA0LCAweDAyLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAvLzJcblx0XHRcdE9wY29kZU1hcC5fbWFwWydtdWwnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgwMywgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgLy8zXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnZGl2J10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MDQsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgIC8vNFxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3JjcCddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcIm5vbmVcIiwgMCwgMHgwNSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgICAvLzVcblx0XHRcdE9wY29kZU1hcC5fbWFwWydtaW4nXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgwNiwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgLy82XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnbWF4J10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MDcsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgIC8vN1xuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ2ZyYyddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcIm5vbmVcIiwgMCwgMHgwOCwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgICAvLzhcblx0XHRcdE9wY29kZU1hcC5fbWFwWydzcXQnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MDksIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgICAgLy85XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsncnNxJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwibm9uZVwiLCAwLCAweDBhLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAgIC8vMTBcblx0XHRcdE9wY29kZU1hcC5fbWFwWydwb3cnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgwYiwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgLy8xMVxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ2xvZyddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcIm5vbmVcIiwgMCwgMHgwYywgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgICAvLzEyXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnZXhwJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwibm9uZVwiLCAwLCAweDBkLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAgIC8vMTNcblx0XHRcdE9wY29kZU1hcC5fbWFwWyducm0nXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MGUsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgICAgLy8xNFxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3NpbiddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcIm5vbmVcIiwgMCwgMHgwZiwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgICAvLzE1XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnY29zJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwibm9uZVwiLCAwLCAweDEwLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAgIC8vMTZcblx0XHRcdE9wY29kZU1hcC5fbWFwWydjcnMnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgxMSwgdHJ1ZSwgdHJ1ZSwgbnVsbCwgbnVsbCk7ICAgLy8xN1xuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ2RwMyddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcInZlY3RvclwiLCA0LCAweDEyLCB0cnVlLCB0cnVlLCBudWxsLCBudWxsKTsgICAvLzE4XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnZHA0J10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MTMsIHRydWUsIHRydWUsIG51bGwsIG51bGwpOyAgIC8vMTlcblx0XHRcdE9wY29kZU1hcC5fbWFwWydhYnMnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MTQsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgICAgLy8yMFxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ25lZyddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcIm5vbmVcIiwgMCwgMHgxNSwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgICAvLzIxXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnc2F0J10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwibm9uZVwiLCAwLCAweDE2LCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAgIC8vMjJcblxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3RlZCddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcInNhbXBsZXJcIiwgMSwgMHgyNiwgdHJ1ZSwgbnVsbCwgdHJ1ZSwgbnVsbCk7ICAvLzM4XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsna2lsJ10gPSBuZXcgT3Bjb2RlKFwibm9uZVwiLCBcInNjYWxhclwiLCAxLCBcIm5vbmVcIiwgMCwgMHgyNywgdHJ1ZSwgbnVsbCwgdHJ1ZSwgbnVsbCk7ICAgICAgIC8vMzlcblx0XHRcdE9wY29kZU1hcC5fbWFwWyd0ZXgnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJzYW1wbGVyXCIsIDEsIDB4MjgsIHRydWUsIG51bGwsIHRydWUsIG51bGwpOyAgLy80MFxuXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnbTMzJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwibWF0cml4XCIsIDMsIFwidmVjdG9yXCIsIDMsIDB4MTcsIHRydWUsIG51bGwsIG51bGwsIHRydWUpOyAgIC8vMjNcblx0XHRcdE9wY29kZU1hcC5fbWFwWydtNDQnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJtYXRyaXhcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgxOCwgdHJ1ZSwgbnVsbCwgbnVsbCwgdHJ1ZSk7ICAgLy8yNFxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ200MyddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcIm1hdHJpeFwiLCAzLCBcInZlY3RvclwiLCA0LCAweDE5LCB0cnVlLCBudWxsLCBudWxsLCB0cnVlKTsgICAvLzI1XG5cbiAgICAgICAgICAgIE9wY29kZU1hcC5fbWFwWydkZHgnXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MWEsIHRydWUsIG51bGwsIHRydWUsIG51bGwpOyAgIC8vMjZcbiAgICAgICAgICAgIE9wY29kZU1hcC5fbWFwWydkZHknXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJub25lXCIsIDAsIDB4MWIsIHRydWUsIG51bGwsIHRydWUsIG51bGwpOyAgIC8vMjdcblxuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3NnZSddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcInZlY3RvclwiLCA0LCAweDI5LCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAvLzQxXG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnc2x0J10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MmEsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgIC8vNDJcblx0XHRcdE9wY29kZU1hcC5fbWFwWydzZ24nXSA9IG5ldyBPcGNvZGUoXCJ2ZWN0b3JcIiwgXCJ2ZWN0b3JcIiwgNCwgXCJ2ZWN0b3JcIiwgNCwgMHgyYiwgdHJ1ZSwgbnVsbCwgbnVsbCwgbnVsbCk7ICAgLy80M1xuXHRcdFx0T3Bjb2RlTWFwLl9tYXBbJ3NlcSddID0gbmV3IE9wY29kZShcInZlY3RvclwiLCBcInZlY3RvclwiLCA0LCBcInZlY3RvclwiLCA0LCAweDJjLCB0cnVlLCBudWxsLCBudWxsLCBudWxsKTsgICAvLzQ0XG5cdFx0XHRPcGNvZGVNYXAuX21hcFsnc25lJ10gPSBuZXcgT3Bjb2RlKFwidmVjdG9yXCIsIFwidmVjdG9yXCIsIDQsIFwidmVjdG9yXCIsIDQsIDB4MmQsIHRydWUsIG51bGwsIG51bGwsIG51bGwpOyAgIC8vNDVcblxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIE9wY29kZU1hcC5fbWFwO1xuXG5cdH1cblxuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG59XG5cbmV4cG9ydCA9IE9wY29kZU1hcDsiLCJpbXBvcnQgRmxhZ3NcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvRmxhZ3NcIik7XG5pbXBvcnQgRlNcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL2Fzc2VtYmxlci9GU1wiKTtcblxuLyoqXG4gKlxuICovXG5jbGFzcyBPcGNvZGVcbntcblx0cHVibGljIGRlc3Q6c3RyaW5nO1xuXHRwdWJsaWMgYTpGUztcblx0cHVibGljIGI6RlM7XG5cdHB1YmxpYyBvcGNvZGU6bnVtYmVyO1xuXHRwdWJsaWMgZmxhZ3M6RmxhZ3M7XG5cblx0Y29uc3RydWN0b3IoZGVzdDpzdHJpbmcsIGFmb3JtYXQ6c3RyaW5nLCBhc2l6ZTpudW1iZXIsIGJmb3JtYXQ6c3RyaW5nLCBic2l6ZTpudW1iZXIsIG9wY29kZTpudW1iZXIsIHNpbXBsZTpib29sZWFuLCBob3Jpem9udGFsOmJvb2xlYW4sIGZyYWdvbmx5OmJvb2xlYW4sIG1hdHJpeDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5hID0gbmV3IEZTKCk7XG5cdFx0dGhpcy5iID0gbmV3IEZTKCk7XG5cdFx0dGhpcy5mbGFncyA9IG5ldyBGbGFncygpO1xuXG5cdFx0dGhpcy5kZXN0ID0gZGVzdDtcblx0XHR0aGlzLmEuZm9ybWF0ID0gYWZvcm1hdDtcblx0XHR0aGlzLmEuc2l6ZSA9IGFzaXplO1xuXHRcdHRoaXMuYi5mb3JtYXQgPSBiZm9ybWF0O1xuXHRcdHRoaXMuYi5zaXplID0gYnNpemU7XG5cdFx0dGhpcy5vcGNvZGUgPSBvcGNvZGU7XG5cdFx0dGhpcy5mbGFncy5zaW1wbGUgPSBzaW1wbGU7XG5cdFx0dGhpcy5mbGFncy5ob3Jpem9udGFsID0gaG9yaXpvbnRhbDtcblx0XHR0aGlzLmZsYWdzLmZyYWdvbmx5ID0gZnJhZ29ubHk7XG5cdFx0dGhpcy5mbGFncy5tYXRyaXggPSBtYXRyaXg7XG5cdH1cbn1cblxuZXhwb3J0ID0gT3Bjb2RlO1xuIiwiaW1wb3J0IEJ5dGVBcnJheVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuY2xhc3MgUGFydFxue1xuXHRwdWJsaWMgbmFtZTpzdHJpbmcgPSBcIlwiO1xuXHRwdWJsaWMgdmVyc2lvbjpudW1iZXIgPSAwO1xuXHRwdWJsaWMgZGF0YTpCeXRlQXJyYXk7XG5cblx0Y29uc3RydWN0b3IobmFtZTpzdHJpbmcgPSBudWxsLCB2ZXJzaW9uOm51bWJlciA9IG51bGwpXG5cdHtcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRcdHRoaXMudmVyc2lvbiA9IHZlcnNpb247XG5cdFx0dGhpcy5kYXRhID0gbmV3IEJ5dGVBcnJheSgpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFBhcnQ7IiwiXG5jbGFzcyBSZWdcbntcblxuXHRwdWJsaWMgY29kZTpudW1iZXI7XG5cdHB1YmxpYyBkZXNjOnN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihjb2RlOm51bWJlciwgZGVzYzpzdHJpbmcpXG5cdHtcblx0XHR0aGlzLmNvZGUgPSBjb2RlO1xuXHRcdHRoaXMuZGVzYyA9IGRlc2M7XG5cdH1cbn1cblxuY2xhc3MgUmVnTWFwXG57XG5cblx0Lypcblx0IHB1YmxpYyBzdGF0aWMgbWFwID0gWyBuZXcgUmVnKCAweDAwLCBcInZlcnRleCBhdHRyaWJ1dGVcIiApLFxuXHQgbmV3IFJlZyggMHgwMSwgXCJmcmFnbWVudCBjb25zdGFudFwiICksXG5cdCBuZXcgUmVnKCAweDAxLCBcInZlcnRleCBjb25zdGFudFwiICksXG5cdCBuZXcgUmVnKCAweDAyLCBcImZyYWdtZW50IHRlbXBvcmFyeVwiICksXG5cdCBuZXcgUmVnKCAweDAyLCBcInZlcnRleCB0ZW1wb3JhcnlcIiApLFxuXHQgbmV3IFJlZyggMHgwMywgXCJ2ZXJ0ZXggb3V0cHV0XCIgKSxcblx0IG5ldyBSZWcoIDB4MDMsIFwidmVydGV4IG91dHB1dFwiICksXG5cdCBuZXcgUmVnKCAweDAzLCBcImZyYWdtZW50IGRlcHRoIG91dHB1dFwiICksXG5cdCBuZXcgUmVnKCAweDAzLCBcImZyYWdtZW50IG91dHB1dFwiICksXG5cdCBuZXcgUmVnKCAweDAzLCBcImZyYWdtZW50IG91dHB1dFwiICksXG5cdCBuZXcgUmVnKCAweDA0LCBcInZhcnlpbmdcIiApLFxuXHQgbmV3IFJlZyggMHgwNCwgXCJ2YXJ5aW5nIG91dHB1dFwiICksXG5cdCBuZXcgUmVnKCAweDA0LCBcInZhcnlpbmcgaW5wdXRcIiApLFxuXHQgbmV3IFJlZyggMHgwNSwgXCJzYW1wbGVyXCIgKSBdO1xuXHQgKi9cblxuXHRwcml2YXRlIHN0YXRpYyBfbWFwOmFueVtdO1xuXHRwdWJsaWMgc3RhdGljIGdldCBtYXAoKTphbnlbXVxuXHR7XG5cblx0XHRpZiAoIVJlZ01hcC5fbWFwKSB7XG5cblx0XHRcdFJlZ01hcC5fbWFwID0gbmV3IEFycmF5PE9iamVjdD4oKTtcblx0XHRcdFJlZ01hcC5fbWFwWyd2YSddID0gbmV3IFJlZygweDAwLCBcInZlcnRleCBhdHRyaWJ1dGVcIik7XG5cdFx0XHRSZWdNYXAuX21hcFsnZmMnXSA9IG5ldyBSZWcoMHgwMSwgXCJmcmFnbWVudCBjb25zdGFudFwiKTtcblx0XHRcdFJlZ01hcC5fbWFwWyd2YyddID0gbmV3IFJlZygweDAxLCBcInZlcnRleCBjb25zdGFudFwiKVxuXHRcdFx0UmVnTWFwLl9tYXBbJ2Z0J10gPSBuZXcgUmVnKDB4MDIsIFwiZnJhZ21lbnQgdGVtcG9yYXJ5XCIpO1xuXHRcdFx0UmVnTWFwLl9tYXBbJ3Z0J10gPSBuZXcgUmVnKDB4MDIsIFwidmVydGV4IHRlbXBvcmFyeVwiKTtcblx0XHRcdFJlZ01hcC5fbWFwWyd2byddID0gbmV3IFJlZygweDAzLCBcInZlcnRleCBvdXRwdXRcIik7XG5cdFx0XHRSZWdNYXAuX21hcFsnb3AnXSA9IG5ldyBSZWcoMHgwMywgXCJ2ZXJ0ZXggb3V0cHV0XCIpO1xuXHRcdFx0UmVnTWFwLl9tYXBbJ2ZkJ10gPSBuZXcgUmVnKDB4MDMsIFwiZnJhZ21lbnQgZGVwdGggb3V0cHV0XCIpO1xuXHRcdFx0UmVnTWFwLl9tYXBbJ2ZvJ10gPSBuZXcgUmVnKDB4MDMsIFwiZnJhZ21lbnQgb3V0cHV0XCIpO1xuXHRcdFx0UmVnTWFwLl9tYXBbJ29jJ10gPSBuZXcgUmVnKDB4MDMsIFwiZnJhZ21lbnQgb3V0cHV0XCIpO1xuXHRcdFx0UmVnTWFwLl9tYXBbJ3YnXSA9IG5ldyBSZWcoMHgwNCwgXCJ2YXJ5aW5nXCIpXG5cdFx0XHRSZWdNYXAuX21hcFsndmknXSA9IG5ldyBSZWcoMHgwNCwgXCJ2YXJ5aW5nIG91dHB1dFwiKTtcblx0XHRcdFJlZ01hcC5fbWFwWydmaSddID0gbmV3IFJlZygweDA0LCBcInZhcnlpbmcgaW5wdXRcIik7XG5cdFx0XHRSZWdNYXAuX21hcFsnZnMnXSA9IG5ldyBSZWcoMHgwNSwgXCJzYW1wbGVyXCIpO1xuXG5cblx0XHR9XG5cblx0XHRyZXR1cm4gUmVnTWFwLl9tYXA7XG5cblx0fVxuXG5cdC8qXG5cdCBwdWJsaWMgc3RhdGljIHZhOlJlZyA9IG5ldyBSZWcoIDB4MDAsIFwidmVydGV4IGF0dHJpYnV0ZVwiICk7XG5cdCBwdWJsaWMgc3RhdGljIGZjOlJlZyA9IG5ldyBSZWcoIDB4MDEsIFwiZnJhZ21lbnQgY29uc3RhbnRcIiApO1xuXHQgcHVibGljIHN0YXRpYyB2YzpSZWcgPSBuZXcgUmVnKCAweDAxLCBcInZlcnRleCBjb25zdGFudFwiICk7XG5cdCBwdWJsaWMgc3RhdGljIGZ0OlJlZyA9IG5ldyBSZWcoIDB4MDIsIFwiZnJhZ21lbnQgdGVtcG9yYXJ5XCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgdnQ6UmVnID0gbmV3IFJlZyggMHgwMiwgXCJ2ZXJ0ZXggdGVtcG9yYXJ5XCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgdm86UmVnID0gbmV3IFJlZyggMHgwMywgXCJ2ZXJ0ZXggb3V0cHV0XCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgb3A6UmVnID0gbmV3IFJlZyggMHgwMywgXCJ2ZXJ0ZXggb3V0cHV0XCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgZmQ6UmVnID0gbmV3IFJlZyggMHgwMywgXCJmcmFnbWVudCBkZXB0aCBvdXRwdXRcIiApO1xuXHQgcHVibGljIHN0YXRpYyBmbzpSZWcgPSBuZXcgUmVnKCAweDAzLCBcImZyYWdtZW50IG91dHB1dFwiICk7XG5cdCBwdWJsaWMgc3RhdGljIG9jOlJlZyA9IG5ldyBSZWcoIDB4MDMsIFwiZnJhZ21lbnQgb3V0cHV0XCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgdjogUmVnID0gbmV3IFJlZyggMHgwNCwgXCJ2YXJ5aW5nXCIgKTtcblx0IHB1YmxpYyBzdGF0aWMgdmk6UmVnID0gbmV3IFJlZyggMHgwNCwgXCJ2YXJ5aW5nIG91dHB1dFwiICk7XG5cdCBwdWJsaWMgc3RhdGljIGZpOlJlZyA9IG5ldyBSZWcoIDB4MDQsIFwidmFyeWluZyBpbnB1dFwiICk7XG5cdCBwdWJsaWMgc3RhdGljIGZzOlJlZyA9IG5ldyBSZWcoIDB4MDUsIFwic2FtcGxlclwiICk7XG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBSZWdNYXA7IiwiaW1wb3J0IFNhbXBsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9hc3NlbWJsZXIvU2FtcGxlclwiKTtcblxuY2xhc3MgU2FtcGxlck1hcFxue1xuXG5cdHByaXZhdGUgc3RhdGljIF9tYXA6T2JqZWN0W107XG5cblx0cHVibGljIHN0YXRpYyBnZXQgbWFwKCk6T2JqZWN0W11cblx0e1xuXG5cdFx0aWYgKCFTYW1wbGVyTWFwLl9tYXApIHtcblxuXHRcdFx0U2FtcGxlck1hcC5fbWFwID0gbmV3IEFycmF5PE9iamVjdD4oKTtcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsncmdiYSddID0gbmV3IFNhbXBsZXIoOCwgMHhmLCAwKTtcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsncmcnXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgNSk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ3InXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgNCk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2NvbXByZXNzZWQnXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgMSk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2NvbXByZXNzZWRfYWxwaGEnXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgMik7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2R4dDEnXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgMSk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2R4dDUnXSA9IG5ldyBTYW1wbGVyKDgsIDB4ZiwgMik7XG5cblx0XHRcdC8vIGRpbWVuc2lvblxuXHRcdFx0U2FtcGxlck1hcC5fbWFwWycyZCddID0gbmV3IFNhbXBsZXIoMTIsIDB4ZiwgMCk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2N1YmUnXSA9IG5ldyBTYW1wbGVyKDEyLCAweGYsIDEpO1xuXHRcdFx0U2FtcGxlck1hcC5fbWFwWyczZCddID0gbmV3IFNhbXBsZXIoMTIsIDB4ZiwgMik7XG5cblx0XHRcdC8vIHNwZWNpYWxcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsnY2VudHJvaWQnXSA9IG5ldyBTYW1wbGVyKDE2LCAxLCAxKTtcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsnaWdub3Jlc2FtcGxlciddID0gbmV3IFNhbXBsZXIoMTYsIDQsIDQpO1xuXG5cdFx0XHQvLyByZXBlYXRcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsnY2xhbXAnXSA9IG5ldyBTYW1wbGVyKDIwLCAweGYsIDApO1xuXHRcdFx0U2FtcGxlck1hcC5fbWFwWydyZXBlYXQnXSA9IG5ldyBTYW1wbGVyKDIwLCAweGYsIDEpO1xuXHRcdFx0U2FtcGxlck1hcC5fbWFwWyd3cmFwJ10gPSBuZXcgU2FtcGxlcigyMCwgMHhmLCAxKTtcblxuXHRcdFx0Ly8gbWlwXG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ25vbWlwJ10gPSBuZXcgU2FtcGxlcigyNCwgMHhmLCAwKTtcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsnbWlwbm9uZSddID0gbmV3IFNhbXBsZXIoMjQsIDB4ZiwgMCk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ21pcG5lYXJlc3QnXSA9IG5ldyBTYW1wbGVyKDI0LCAweGYsIDEpO1xuXHRcdFx0U2FtcGxlck1hcC5fbWFwWydtaXBsaW5lYXInXSA9IG5ldyBTYW1wbGVyKDI0LCAweGYsIDIpO1xuXG5cdFx0XHQvLyBmaWx0ZXJcblx0XHRcdFNhbXBsZXJNYXAuX21hcFsnbmVhcmVzdCddID0gbmV3IFNhbXBsZXIoMjgsIDB4ZiwgMCk7XG5cdFx0XHRTYW1wbGVyTWFwLl9tYXBbJ2xpbmVhciddID0gbmV3IFNhbXBsZXIoMjgsIDB4ZiwgMSk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gU2FtcGxlck1hcC5fbWFwO1xuXG5cdH1cblxuXHQvKlxuXHQgcHVibGljIHN0YXRpYyBtYXAgPSAgICAgWyBuZXcgU2FtcGxlciggOCwgMHhmLCAwICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCA1ICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCA0ICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCAxICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCAyICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCAxICksXG5cdCBuZXcgU2FtcGxlciggOCwgMHhmLCAyICksXG5cblx0IC8vIGRpbWVuc2lvblxuXHQgbmV3IFNhbXBsZXIoIDEyLCAweGYsIDAgKSxcblx0IG5ldyBTYW1wbGVyKCAxMiwgMHhmLCAxICksXG5cdCBuZXcgU2FtcGxlciggMTIsIDB4ZiwgMiApLFxuXG5cdCAvLyBzcGVjaWFsXG5cdCBuZXcgU2FtcGxlciggMTYsIDEsIDEgKSxcblx0IG5ldyBTYW1wbGVyKCAxNiwgNCwgNCApLFxuXG5cdCAvLyByZXBlYXRcblx0IG5ldyBTYW1wbGVyKCAyMCwgMHhmLCAwICksXG5cdCBuZXcgU2FtcGxlciggMjAsIDB4ZiwgMSApLFxuXHQgbmV3IFNhbXBsZXIoIDIwLCAweGYsIDEgKSxcblxuXHQgLy8gbWlwXG5cdCBuZXcgU2FtcGxlciggMjQsIDB4ZiwgMCApLFxuXHQgbmV3IFNhbXBsZXIoIDI0LCAweGYsIDAgKSxcblx0IG5ldyBTYW1wbGVyKCAyNCwgMHhmLCAxICksXG5cdCBuZXcgU2FtcGxlciggMjQsIDB4ZiwgMiApLFxuXG5cdCAvLyBmaWx0ZXJcblx0IG5ldyBTYW1wbGVyKCAyOCwgMHhmLCAwICksXG5cdCBuZXcgU2FtcGxlciggMjgsIDB4ZiwgMSApIF1cblx0ICovXG5cdC8qXG5cdCBwdWJsaWMgc3RhdGljIHJnYmE6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggOCwgMHhmLCAwICk7XG5cdCBwdWJsaWMgc3RhdGljIHJnOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgNSApO1xuXHQgcHVibGljIHN0YXRpYyByOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgNCApO1xuXHQgcHVibGljIHN0YXRpYyBjb21wcmVzc2VkOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgMSApO1xuXHQgcHVibGljIHN0YXRpYyBjb21wcmVzc2VkX2FscGhhOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgMiApO1xuXHQgcHVibGljIHN0YXRpYyBkeHQxOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgMSApO1xuXHQgcHVibGljIHN0YXRpYyBkeHQ1OiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDgsIDB4ZiwgMiApO1xuXG5cdCAvLyBkaW1lbnNpb25cblx0IHB1YmxpYyBzdGF0aWMgc2FtcGxlcjJkOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDEyLCAweGYsIDAgKTtcblx0IHB1YmxpYyBzdGF0aWMgY3ViZTogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAxMiwgMHhmLCAxICk7XG5cdCBwdWJsaWMgc3RhdGljIHNhbXBsZXIzZDogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAxMiwgMHhmLCAyICk7XG5cblx0IC8vIHNwZWNpYWxcblx0IHB1YmxpYyBzdGF0aWMgY2VudHJvaWQ6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggMTYsIDEsIDEgKTtcblx0IHB1YmxpYyBzdGF0aWMgaWdub3Jlc2FtcGxlcjogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAxNiwgNCwgNCApO1xuXG5cdCAvLyByZXBlYXRcblx0IHB1YmxpYyBzdGF0aWMgY2xhbXA6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggMjAsIDB4ZiwgMCApO1xuXHQgcHVibGljIHN0YXRpYyByZXBlYXQ6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggMjAsIDB4ZiwgMSApO1xuXHQgcHVibGljIHN0YXRpYyB3cmFwOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDIwLCAweGYsIDEgKTtcblxuXHQgLy8gbWlwXG5cdCBwdWJsaWMgc3RhdGljIG5vbWlwOiBTYW1wbGVyID0gbmV3IFNhbXBsZXIoIDI0LCAweGYsIDAgKTtcblx0IHB1YmxpYyBzdGF0aWMgbWlwbm9uZTogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAyNCwgMHhmLCAwICk7XG5cdCBwdWJsaWMgc3RhdGljIG1pcG5lYXJlc3Q6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggMjQsIDB4ZiwgMSApO1xuXHQgcHVibGljIHN0YXRpYyBtaXBsaW5lYXI6IFNhbXBsZXIgPSBuZXcgU2FtcGxlciggMjQsIDB4ZiwgMiApO1xuXG5cdCAvLyBmaWx0ZXJcblx0IHB1YmxpYyBzdGF0aWMgbmVhcmVzdDogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAyOCwgMHhmLCAwICk7XG5cdCBwdWJsaWMgc3RhdGljIGxpbmVhcjogU2FtcGxlciA9IG5ldyBTYW1wbGVyKCAyOCwgMHhmLCAxICk7XG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBTYW1wbGVyTWFwOyIsImNsYXNzIFNhbXBsZXJcbntcblx0cHVibGljIHNoaWZ0Om51bWJlcjtcblx0cHVibGljIG1hc2s6bnVtYmVyO1xuXHRwdWJsaWMgdmFsdWU6bnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHNoaWZ0Om51bWJlciwgbWFzazpudW1iZXIsIHZhbHVlOm51bWJlcilcblx0e1xuXHRcdHRoaXMuc2hpZnQgPSBzaGlmdDtcblx0XHR0aGlzLm1hc2sgPSBtYXNrO1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxufVxuXG5leHBvcnQgPSBTYW1wbGVyOyIsImNsYXNzIENvbnRleHRHTEJsZW5kRmFjdG9yXG57XG5cdHB1YmxpYyBzdGF0aWMgREVTVElOQVRJT05fQUxQSEE6c3RyaW5nID0gXCJkZXN0aW5hdGlvbkFscGhhXCI7XG5cdHB1YmxpYyBzdGF0aWMgREVTVElOQVRJT05fQ09MT1I6c3RyaW5nID0gXCJkZXN0aW5hdGlvbkNvbG9yXCI7XG5cdHB1YmxpYyBzdGF0aWMgT05FOnN0cmluZyA9IFwib25lXCI7XG5cdHB1YmxpYyBzdGF0aWMgT05FX01JTlVTX0RFU1RJTkFUSU9OX0FMUEhBOnN0cmluZyA9IFwib25lTWludXNEZXN0aW5hdGlvbkFscGhhXCI7XG5cdHB1YmxpYyBzdGF0aWMgT05FX01JTlVTX0RFU1RJTkFUSU9OX0NPTE9SOnN0cmluZyA9IFwib25lTWludXNEZXN0aW5hdGlvbkNvbG9yXCI7XG5cdHB1YmxpYyBzdGF0aWMgT05FX01JTlVTX1NPVVJDRV9BTFBIQTpzdHJpbmcgPSBcIm9uZU1pbnVzU291cmNlQWxwaGFcIjtcblx0cHVibGljIHN0YXRpYyBPTkVfTUlOVVNfU09VUkNFX0NPTE9SOnN0cmluZyA9IFwib25lTWludXNTb3VyY2VDb2xvclwiO1xuXHRwdWJsaWMgc3RhdGljIFNPVVJDRV9BTFBIQTpzdHJpbmcgPSBcInNvdXJjZUFscGhhXCI7XG5cdHB1YmxpYyBzdGF0aWMgU09VUkNFX0NPTE9SOnN0cmluZyA9IFwic291cmNlQ29sb3JcIjtcblx0cHVibGljIHN0YXRpYyBaRVJPOnN0cmluZyA9IFwiemVyb1wiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xCbGVuZEZhY3RvcjsiLCJjbGFzcyBDb250ZXh0R0xDbGVhck1hc2tcbntcblx0c3RhdGljIENPTE9SOm51bWJlciA9IDE7XG5cdHN0YXRpYyBERVBUSDpudW1iZXIgPSAyO1xuXHRzdGF0aWMgU1RFTkNJTDpudW1iZXIgPSA0O1xuXHRzdGF0aWMgQUxMOm51bWJlciA9IENvbnRleHRHTENsZWFyTWFzay5DT0xPUiB8IENvbnRleHRHTENsZWFyTWFzay5ERVBUSCB8IENvbnRleHRHTENsZWFyTWFzay5TVEVOQ0lMO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xDbGVhck1hc2s7IiwiY2xhc3MgQ29udGV4dEdMQ29tcGFyZU1vZGVcbntcblx0cHVibGljIHN0YXRpYyBBTFdBWVM6c3RyaW5nID0gXCJhbHdheXNcIjtcblx0cHVibGljIHN0YXRpYyBFUVVBTDpzdHJpbmcgPSBcImVxdWFsXCI7XG5cdHB1YmxpYyBzdGF0aWMgR1JFQVRFUjpzdHJpbmcgPSBcImdyZWF0ZXJcIjtcblx0cHVibGljIHN0YXRpYyBHUkVBVEVSX0VRVUFMOnN0cmluZyA9IFwiZ3JlYXRlckVxdWFsXCI7XG5cdHB1YmxpYyBzdGF0aWMgTEVTUzpzdHJpbmcgPSBcImxlc3NcIjtcblx0cHVibGljIHN0YXRpYyBMRVNTX0VRVUFMOnN0cmluZyA9IFwibGVzc0VxdWFsXCI7XG5cdHB1YmxpYyBzdGF0aWMgTkVWRVI6c3RyaW5nID0gXCJuZXZlclwiO1xuXHRwdWJsaWMgc3RhdGljIE5PVF9FUVVBTDpzdHJpbmcgPSBcIm5vdEVxdWFsXCI7XG59XG5cbmV4cG9ydCA9IENvbnRleHRHTENvbXBhcmVNb2RlOyIsImNsYXNzIENvbnRleHRHTERyYXdNb2RlXG57XG5cdHB1YmxpYyBzdGF0aWMgVFJJQU5HTEVTOnN0cmluZyA9IFwidHJpYW5nbGVzXCI7XG5cdHB1YmxpYyBzdGF0aWMgTElORVM6c3RyaW5nID0gXCJsaW5lc1wiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xEcmF3TW9kZTsiLCJjbGFzcyBDb250ZXh0R0xNaXBGaWx0ZXJcbntcblx0cHVibGljIHN0YXRpYyBNSVBMSU5FQVI6c3RyaW5nID0gXCJtaXBsaW5lYXJcIjtcblx0cHVibGljIHN0YXRpYyBNSVBORUFSRVNUOnN0cmluZyA9IFwibWlwbmVhcmVzdFwiO1xuXHRwdWJsaWMgc3RhdGljIE1JUE5PTkU6c3RyaW5nID0gXCJtaXBub25lXCI7XG59XG5cbmV4cG9ydCA9IENvbnRleHRHTE1pcEZpbHRlcjsiLCJjbGFzcyBDb250ZXh0R0xQcm9maWxlXG57XG5cdHB1YmxpYyBzdGF0aWMgQkFTRUxJTkU6c3RyaW5nID0gXCJiYXNlbGluZVwiO1xuXHRwdWJsaWMgc3RhdGljIEJBU0VMSU5FX0NPTlNUUkFJTkVEOnN0cmluZyA9IFwiYmFzZWxpbmVDb25zdHJhaW5lZFwiO1xuXHRwdWJsaWMgc3RhdGljIEJBU0VMSU5FX0VYVEVOREVEOnN0cmluZyA9IFwiYmFzZWxpbmVFeHRlbmRlZFwiO1xufVxuZXhwb3J0ID0gQ29udGV4dEdMUHJvZmlsZTsiLCJjbGFzcyBDb250ZXh0R0xQcm9ncmFtVHlwZVxue1xuXHRzdGF0aWMgRlJBR01FTlQ6c3RyaW5nID0gXCJmcmFnbWVudFwiO1xuXHRzdGF0aWMgVkVSVEVYOnN0cmluZyA9IFwidmVydGV4XCI7XG59XG5cbmV4cG9ydCA9IENvbnRleHRHTFByb2dyYW1UeXBlOyIsImNsYXNzIENvbnRleHRHTFN0ZW5jaWxBY3Rpb25cbntcblx0cHVibGljIHN0YXRpYyBERUNSRU1FTlRfU0FUVVJBVEU6c3RyaW5nID0gXCJkZWNyZW1lbnRTYXR1cmF0ZVwiO1xuXHRwdWJsaWMgc3RhdGljIERFQ1JFTUVOVF9XUkFQOnN0cmluZyA9IFwiZGVjcmVtZW50V3JhcFwiO1xuXHRwdWJsaWMgc3RhdGljIElOQ1JFTUVOVF9TQVRVUkFURTpzdHJpbmcgPSBcImluY3JlbWVudFNhdHVyYXRlXCI7XG5cdHB1YmxpYyBzdGF0aWMgSU5DUkVNRU5UX1dSQVA6c3RyaW5nID0gXCJpbmNyZW1lbnRXcmFwXCI7XG5cdHB1YmxpYyBzdGF0aWMgSU5WRVJUOnN0cmluZyA9IFwiaW52ZXJ0XCI7XG5cdHB1YmxpYyBzdGF0aWMgS0VFUDpzdHJpbmcgPSBcImtlZXBcIjtcblx0cHVibGljIHN0YXRpYyBTRVQ6c3RyaW5nID0gXCJzZXRcIjtcblx0cHVibGljIHN0YXRpYyBaRVJPOnN0cmluZyA9IFwiemVyb1wiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xTdGVuY2lsQWN0aW9uOyIsImNsYXNzIENvbnRleHRHTFRleHR1cmVGaWx0ZXJcbntcblx0cHVibGljIHN0YXRpYyBMSU5FQVI6c3RyaW5nID0gXCJsaW5lYXJcIjtcblx0cHVibGljIHN0YXRpYyBORUFSRVNUOnN0cmluZyA9IFwibmVhcmVzdFwiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xUZXh0dXJlRmlsdGVyOyIsImNsYXNzIENvbnRleHRHTFRleHR1cmVGb3JtYXRcbntcblx0c3RhdGljIEJHUkE6c3RyaW5nID0gXCJiZ3JhXCI7XG5cdHN0YXRpYyBCR1JBX1BBQ0tFRDpzdHJpbmcgPSBcImJncmFQYWNrZWQ0NDQ0XCI7XG5cdHN0YXRpYyBCR1JfUEFDS0VEOnN0cmluZyA9IFwiYmdyUGFja2VkNTY1XCI7XG5cdHN0YXRpYyBDT01QUkVTU0VEOnN0cmluZyA9IFwiY29tcHJlc3NlZFwiO1xuXHRzdGF0aWMgQ09NUFJFU1NFRF9BTFBIQTpzdHJpbmcgPSBcImNvbXByZXNzZWRBbHBoYVwiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xUZXh0dXJlRm9ybWF0OyIsImNsYXNzIENvbnRleHRHTFRyaWFuZ2xlRmFjZVxue1xuXHRzdGF0aWMgQkFDSzpzdHJpbmcgPSBcImJhY2tcIjtcblx0c3RhdGljIEZST05UOnN0cmluZyA9IFwiZnJvbnRcIjtcblx0c3RhdGljIEZST05UX0FORF9CQUNLOnN0cmluZyA9IFwiZnJvbnRBbmRCYWNrXCI7XG5cdHN0YXRpYyBOT05FOnN0cmluZyA9IFwibm9uZVwiO1xufVxuXG5leHBvcnQgPSBDb250ZXh0R0xUcmlhbmdsZUZhY2U7IiwiY2xhc3MgQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0XG57XG5cdHN0YXRpYyBCWVRFU180OnN0cmluZyA9IFwiYnl0ZXM0XCI7XG5cdHN0YXRpYyBGTE9BVF8xOnN0cmluZyA9IFwiZmxvYXQxXCI7XG5cdHN0YXRpYyBGTE9BVF8yOnN0cmluZyA9IFwiZmxvYXQyXCI7XG5cdHN0YXRpYyBGTE9BVF8zOnN0cmluZyA9IFwiZmxvYXQzXCI7XG5cdHN0YXRpYyBGTE9BVF80OnN0cmluZyA9IFwiZmxvYXQ0XCI7XG59XG5cbmV4cG9ydCA9IENvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdDsiLCJjbGFzcyBDb250ZXh0R0xXcmFwTW9kZVxue1xuXHRwdWJsaWMgc3RhdGljIENMQU1QOnN0cmluZyA9IFwiY2xhbXBcIjtcblx0cHVibGljIHN0YXRpYyBSRVBFQVQ6c3RyaW5nID0gXCJyZXBlYXRcIjtcbn1cblxuZXhwb3J0ID0gQ29udGV4dEdMV3JhcE1vZGU7IiwiY2xhc3MgQ29udGV4dE1vZGVcbntcblx0c3RhdGljIEFVVE86c3RyaW5nID0gXCJhdXRvXCI7XG5cdHN0YXRpYyBXRUJHTDpzdHJpbmcgPSBcIndlYmdsXCI7XG5cdHN0YXRpYyBGTEFTSDpzdHJpbmcgPSBcImZsYXNoXCI7XG5cdHN0YXRpYyBOQVRJVkU6c3RyaW5nID0gXCJuYXRpdmVcIjtcblx0c3RhdGljIFNPRlRXQVJFOnN0cmluZyA9IFwic29mdHdhcmVcIjtcbn1cblxuZXhwb3J0ID0gQ29udGV4dE1vZGU7IiwiaW1wb3J0IEJpdG1hcEltYWdlMkQgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQml0bWFwSW1hZ2UyRFwiKTtcbmltcG9ydCBNYXRyaXgzRCAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL01hdHJpeDNEXCIpO1xuaW1wb3J0IFBvaW50ICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUG9pbnRcIik7XG5pbXBvcnQgVmVjdG9yM0QgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBSZWN0YW5nbGUgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcbmltcG9ydCBCeXRlQXJyYXkgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9CeXRlQXJyYXlcIik7XG5pbXBvcnQgQ29sb3JVdGlscyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0NvbG9yVXRpbHNcIik7XG5cbmltcG9ydCBDb250ZXh0R0xCbGVuZEZhY3RvciAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTEJsZW5kRmFjdG9yXCIpO1xuaW1wb3J0IENvbnRleHRHTERyYXdNb2RlICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMRHJhd01vZGVcIik7XG5pbXBvcnQgQ29udGV4dEdMQ2xlYXJNYXNrICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQ2xlYXJNYXNrXCIpO1xuaW1wb3J0IENvbnRleHRHTENvbXBhcmVNb2RlICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQ29tcGFyZU1vZGVcIik7XG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFByb2dyYW1UeXBlICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMUHJvZ3JhbVR5cGVcIik7XG5pbXBvcnQgQ29udGV4dEdMU3RlbmNpbEFjdGlvbiAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMU3RlbmNpbEFjdGlvblwiKTtcbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRmlsdGVyICAgICAgICA9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFRyaWFuZ2xlRmFjZSAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVHJpYW5nbGVGYWNlXCIpO1xuaW1wb3J0IENvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdCAgICA9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXRcIik7XG5pbXBvcnQgQ29udGV4dEdMV3JhcE1vZGUgICAgICAgICAgICA9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xXcmFwTW9kZVwiKTtcbmltcG9ydCBDdWJlVGV4dHVyZVdlYkdMICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0N1YmVUZXh0dXJlV2ViR0xcIik7XG5pbXBvcnQgSUNvbnRleHRHTCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJSW5kZXhCdWZmZXIgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcbmltcG9ydCBJQ3ViZVRleHR1cmUgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJVGV4dHVyZSAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlXCIpO1xuaW1wb3J0IElWZXJ0ZXhCdWZmZXIgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVZlcnRleEJ1ZmZlclwiKTtcbmltcG9ydCBJUHJvZ3JhbSAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lQcm9ncmFtXCIpO1xuaW1wb3J0IElUZXh0dXJlQmFzZSAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IEluZGV4QnVmZmVyU29mdHdhcmUgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0luZGV4QnVmZmVyU29mdHdhcmVcIik7XG5pbXBvcnQgVmVydGV4QnVmZmVyU29mdHdhcmUgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1ZlcnRleEJ1ZmZlclNvZnR3YXJlXCIpO1xuaW1wb3J0IFRleHR1cmVTb2Z0d2FyZSAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZVNvZnR3YXJlXCIpO1xuaW1wb3J0IFByb2dyYW1Tb2Z0d2FyZSAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUHJvZ3JhbVNvZnR3YXJlXCIpO1xuXG5jbGFzcyBDb250ZXh0U29mdHdhcmUgaW1wbGVtZW50cyBJQ29udGV4dEdMIHtcblxuICAgIHByaXZhdGUgX2NhbnZhczpIVE1MQ2FudmFzRWxlbWVudDtcblxuICAgIHB1YmxpYyBzdGF0aWMgTUFYX1NBTVBMRVJTOm51bWJlciA9IDg7XG5cbiAgICBwcml2YXRlIF9iYWNrQnVmZmVyUmVjdDpSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCk7XG4gICAgcHJpdmF0ZSBfYmFja0J1ZmZlcldpZHRoOm51bWJlciA9IDEwMDtcbiAgICBwcml2YXRlIF9iYWNrQnVmZmVySGVpZ2h0Om51bWJlciA9IDEwMDtcbiAgICBwcml2YXRlIF9iYWNrQnVmZmVyQ29sb3I6Qml0bWFwSW1hZ2UyRDtcbiAgICBwcml2YXRlIF96YnVmZmVyOm51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSBfY29udGV4dDpDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBfY3VsbGluZ01vZGU6c3RyaW5nID0gQ29udGV4dEdMVHJpYW5nbGVGYWNlLkJBQ0s7XG4gICAgcHJpdmF0ZSBfYmxlbmRTb3VyY2U6c3RyaW5nID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuT05FO1xuICAgIHByaXZhdGUgX2JsZW5kRGVzdGluYXRpb246c3RyaW5nID0gQ29udGV4dEdMQmxlbmRGYWN0b3IuT05FX01JTlVTX1NPVVJDRV9BTFBIQTtcbiAgICBwcml2YXRlIF9jb2xvck1hc2tSOmJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgX2NvbG9yTWFza0c6Ym9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBfY29sb3JNYXNrQjpib29sZWFuID0gdHJ1ZTtcbiAgICBwcml2YXRlIF9jb2xvck1hc2tBOmJvb2xlYW4gPSB0cnVlO1xuICAgIHByaXZhdGUgX3dyaXRlRGVwdGg6Ym9vbGVhbiA9IHRydWU7XG4gICAgcHJpdmF0ZSBfZGVwdGhDb21wYXJlTW9kZTpzdHJpbmcgPSBDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTO1xuXG4gICAgcHJpdmF0ZSBfdGV4dHVyZXM6QXJyYXk8VGV4dHVyZVNvZnR3YXJlPiA9IFtdO1xuICAgIHByaXZhdGUgX3ZlcnRleEJ1ZmZlcnM6QXJyYXk8VmVydGV4QnVmZmVyU29mdHdhcmU+ID0gW107XG4gICAgcHJpdmF0ZSBfdmVydGV4QnVmZmVyT2Zmc2V0czpBcnJheTxudW1iZXI+ID0gW107XG4gICAgcHJpdmF0ZSBfdmVydGV4QnVmZmVyRm9ybWF0czpBcnJheTxzdHJpbmc+ID0gW107XG5cbiAgICBwcml2YXRlIF9wb3NpdGlvbkJ1ZmZlckluZGV4Om51bWJlcjtcbiAgICBwcml2YXRlIF91dkJ1ZmZlckluZGV4Om51bWJlcjtcblxuICAgIHByaXZhdGUgX3Byb2plY3Rpb25NYXRyaXg6TWF0cml4M0Q7XG5cbiAgICBwcml2YXRlIF9kcmF3UmVjdDpSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihjYW52YXM6SFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgdGhpcy5fYmFja0J1ZmZlckNvbG9yID0gbmV3IEJpdG1hcEltYWdlMkQodGhpcy5fYmFja0J1ZmZlcldpZHRoLCB0aGlzLl9iYWNrQnVmZmVySGVpZ2h0LCBmYWxzZSwgMCwgZmFsc2UpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5fYmFja0J1ZmZlckNvbG9yLmdldENhbnZhcygpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXIocmVkOm51bWJlciA9IDAsIGdyZWVuOm51bWJlciA9IDAsIGJsdWU6bnVtYmVyID0gMCwgYWxwaGE6bnVtYmVyID0gMSwgZGVwdGg6bnVtYmVyID0gMSwgc3RlbmNpbDpudW1iZXIgPSAwLCBtYXNrOm51bWJlciA9IENvbnRleHRHTENsZWFyTWFzay5BTEwpIHtcbiAgICAgICAgaWYgKG1hc2sgJiBDb250ZXh0R0xDbGVhck1hc2suQ09MT1IpIHtcbiAgICAgICAgICAgIHRoaXMuX2JhY2tCdWZmZXJDb2xvci5maWxsUmVjdCh0aGlzLl9iYWNrQnVmZmVyUmVjdCwgQ29sb3JVdGlscy5BUkdCdG9GbG9hdDMyKGFscGhhLCByZWQsIGdyZWVuLCBibHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1RPRE86IG1hc2sgJiBDb250ZXh0R0xDbGVhck1hc2suU1RFTkNJTFxuXG4gICAgICAgIGlmIChtYXNrICYgQ29udGV4dEdMQ2xlYXJNYXNrLkRFUFRIKSB7XG4gICAgICAgICAgICB0aGlzLl96YnVmZmVyLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICB2YXIgbGVuOm51bWJlciA9IHRoaXMuX2JhY2tCdWZmZXJXaWR0aCAqIHRoaXMuX2JhY2tCdWZmZXJIZWlnaHQ7XG4gICAgICAgICAgICBmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3pidWZmZXJbaV0gPSAxMDAwMDAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmVCYWNrQnVmZmVyKHdpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlciwgYW50aUFsaWFzOm51bWJlciwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25maWd1cmVCYWNrQnVmZmVyXCIpO1xuICAgICAgICB0aGlzLl9iYWNrQnVmZmVyV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5fYmFja0J1ZmZlckhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLl9iYWNrQnVmZmVyUmVjdC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLl9iYWNrQnVmZmVyUmVjdC5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5fYmFja0J1ZmZlckNvbG9yLl9zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVDdWJlVGV4dHVyZShzaXplOm51bWJlciwgZm9ybWF0OnN0cmluZywgb3B0aW1pemVGb3JSZW5kZXJUb1RleHR1cmU6Ym9vbGVhbiwgc3RyZWFtaW5nTGV2ZWxzOm51bWJlcik6SUN1YmVUZXh0dXJlIHtcbiAgICAgICAgLy9UT0RPOiBpbXBsXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZUluZGV4QnVmZmVyKG51bUluZGljZXM6bnVtYmVyKTpJSW5kZXhCdWZmZXIge1xuICAgICAgICByZXR1cm4gbmV3IEluZGV4QnVmZmVyU29mdHdhcmUobnVtSW5kaWNlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZVByb2dyYW0oKTpQcm9ncmFtU29mdHdhcmUge1xuICAgICAgICByZXR1cm4gbmV3IFByb2dyYW1Tb2Z0d2FyZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVUZXh0dXJlKHdpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlciwgZm9ybWF0OnN0cmluZywgb3B0aW1pemVGb3JSZW5kZXJUb1RleHR1cmU6Ym9vbGVhbiwgc3RyZWFtaW5nTGV2ZWxzOm51bWJlcik6VGV4dHVyZVNvZnR3YXJlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVUZXh0dXJlXCIpO1xuICAgICAgICByZXR1cm4gbmV3IFRleHR1cmVTb2Z0d2FyZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlVmVydGV4QnVmZmVyKG51bVZlcnRpY2VzOm51bWJlciwgZGF0YVBlclZlcnRleDpudW1iZXIpOlZlcnRleEJ1ZmZlclNvZnR3YXJlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVWZXJ0ZXhCdWZmZXJcIik7XG4gICAgICAgIHJldHVybiBuZXcgVmVydGV4QnVmZmVyU29mdHdhcmUobnVtVmVydGljZXMsIGRhdGFQZXJWZXJ0ZXgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRCbGVuZEZhY3RvcnMoc291cmNlRmFjdG9yOnN0cmluZywgZGVzdGluYXRpb25GYWN0b3I6c3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2JsZW5kU291cmNlID0gc291cmNlRmFjdG9yO1xuICAgICAgICB0aGlzLl9ibGVuZERlc3RpbmF0aW9uID0gZGVzdGluYXRpb25GYWN0b3I7XG4gICAgfVxuXG4gICAgcHVibGljIHNldENvbG9yTWFzayhyZWQ6Ym9vbGVhbiwgZ3JlZW46Ym9vbGVhbiwgYmx1ZTpib29sZWFuLCBhbHBoYTpib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2NvbG9yTWFza1IgPSByZWQ7XG4gICAgICAgIHRoaXMuX2NvbG9yTWFza0cgPSBncmVlbjtcbiAgICAgICAgdGhpcy5fY29sb3JNYXNrQiA9IGJsdWU7XG4gICAgICAgIHRoaXMuX2NvbG9yTWFza0EgPSBhbHBoYTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U3RlbmNpbEFjdGlvbnModHJpYW5nbGVGYWNlOnN0cmluZywgY29tcGFyZU1vZGU6c3RyaW5nLCBhY3Rpb25PbkJvdGhQYXNzOnN0cmluZywgYWN0aW9uT25EZXB0aEZhaWw6c3RyaW5nLCBhY3Rpb25PbkRlcHRoUGFzc1N0ZW5jaWxGYWlsOnN0cmluZywgY29vcmRpbmF0ZVN5c3RlbTpzdHJpbmcpIHtcbiAgICAgICAgLy9UT0RPOlxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRTdGVuY2lsUmVmZXJlbmNlVmFsdWUocmVmZXJlbmNlVmFsdWU6bnVtYmVyLCByZWFkTWFzazpudW1iZXIsIHdyaXRlTWFzazpudW1iZXIpIHtcbiAgICAgICAgLy9UT0RPOlxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDdWxsaW5nKHRyaWFuZ2xlRmFjZVRvQ3VsbDpzdHJpbmcsIGNvb3JkaW5hdGVTeXN0ZW06c3RyaW5nKSB7XG4gICAgICAgIC8vVE9ETzogQ29vcmRpbmF0ZVN5c3RlbS5SSUdIVF9IQU5EXG4gICAgICAgIHRoaXMuX2N1bGxpbmdNb2RlID0gdHJpYW5nbGVGYWNlVG9DdWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREZXB0aFRlc3QoZGVwdGhNYXNrOmJvb2xlYW4sIHBhc3NDb21wYXJlTW9kZTpzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZXREZXB0aFRlc3Q6IFwiICsgZGVwdGhNYXNrICsgXCIgY29tcGFyZTogXCIgKyBwYXNzQ29tcGFyZU1vZGUpO1xuICAgICAgICB0aGlzLl93cml0ZURlcHRoID0gZGVwdGhNYXNrO1xuICAgICAgICB0aGlzLl9kZXB0aENvbXBhcmVNb2RlID0gcGFzc0NvbXBhcmVNb2RlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQcm9ncmFtKHByb2dyYW06SVByb2dyYW0pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZXRQcm9ncmFtOiBcIiArIHByb2dyYW0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQcm9ncmFtQ29uc3RhbnRzRnJvbU1hdHJpeChwcm9ncmFtVHlwZTpzdHJpbmcsIGZpcnN0UmVnaXN0ZXI6bnVtYmVyLCBtYXRyaXg6TWF0cml4M0QsIHRyYW5zcG9zZWRNYXRyaXg6Ym9vbGVhbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNldFByb2dyYW1Db25zdGFudHNGcm9tTWF0cml4OiBwcm9ncmFtVHlwZVwiICsgcHJvZ3JhbVR5cGUgKyBcIiBmaXJzdFJlZ2lzdGVyOiBcIiArIGZpcnN0UmVnaXN0ZXIgKyBcIiBtYXRyaXg6IFwiICsgbWF0cml4ICsgXCIgdHJhbnNwb3NlZE1hdHJpeDogXCIgKyB0cmFuc3Bvc2VkTWF0cml4KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShwcm9ncmFtVHlwZTpzdHJpbmcsIGZpcnN0UmVnaXN0ZXI6bnVtYmVyLCBkYXRhOm51bWJlcltdLCBudW1SZWdpc3RlcnM6bnVtYmVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheTogcHJvZ3JhbVR5cGVcIiArIHByb2dyYW1UeXBlICsgXCIgZmlyc3RSZWdpc3RlcjogXCIgKyBmaXJzdFJlZ2lzdGVyICsgXCIgZGF0YTogXCIgKyBkYXRhICsgXCIgbnVtUmVnaXN0ZXJzOiBcIiArIG51bVJlZ2lzdGVycyk7XG4gICAgICAgIGlmIChmaXJzdFJlZ2lzdGVyID09IDAgJiYgbnVtUmVnaXN0ZXJzID09IDQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2plY3Rpb25NYXRyaXggPSBuZXcgTWF0cml4M0QoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9qZWN0aW9uTWF0cml4LnRyYW5zcG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFRleHR1cmVBdChzYW1wbGVyOm51bWJlciwgdGV4dHVyZTpUZXh0dXJlU29mdHdhcmUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZXRUZXh0dXJlQXQgc2FtcGxlOiBcIiArIHNhbXBsZXIgKyBcIiB0ZXh0dXJlOiBcIiArIHRleHR1cmUpO1xuICAgICAgICB0aGlzLl90ZXh0dXJlc1tzYW1wbGVyXSA9IHRleHR1cmU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFZlcnRleEJ1ZmZlckF0KGluZGV4Om51bWJlciwgYnVmZmVyOlZlcnRleEJ1ZmZlclNvZnR3YXJlLCBidWZmZXJPZmZzZXQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2V0VmVydGV4QnVmZmVyQXQgaW5kZXg6IFwiICsgaW5kZXggKyBcIiBidWZmZXI6IFwiICsgYnVmZmVyICsgXCIgYnVmZmVyT2Zmc2V0OiBcIiArIGJ1ZmZlck9mZnNldCArIFwiIGZvcm1hdDogXCIgKyBmb3JtYXQpO1xuICAgICAgICB0aGlzLl92ZXJ0ZXhCdWZmZXJzW2luZGV4XSA9IGJ1ZmZlcjtcbiAgICAgICAgdGhpcy5fdmVydGV4QnVmZmVyT2Zmc2V0c1tpbmRleF0gPSBidWZmZXJPZmZzZXQ7XG4gICAgICAgIHRoaXMuX3ZlcnRleEJ1ZmZlckZvcm1hdHNbaW5kZXhdID0gZm9ybWF0O1xuXG4gICAgICAgIGlmIChmb3JtYXQgPT0gQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LkZMT0FUXzMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uQnVmZmVySW5kZXggPSBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmb3JtYXQgPT0gQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LkZMT0FUXzIpIHtcbiAgICAgICAgICAgIHRoaXMuX3V2QnVmZmVySW5kZXggPSBpbmRleDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBwcmVzZW50KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInByZXNlbnRcIik7XG4gICAgICAgIC8vdGhpcy5fYmFja0J1ZmZlckNvbG9yLmZpbGxSZWN0KG5ldyBSZWN0YW5nbGUoMCwgMCwgTWF0aC5yYW5kb20oKSAqIDMwMCwgTWF0aC5yYW5kb20oKSAqIDUwMCksIE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3VG9CaXRtYXBJbWFnZTJEKGRlc3RpbmF0aW9uOkJpdG1hcEltYWdlMkQpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0luZGljZXMobW9kZTpzdHJpbmcsIGluZGV4QnVmZmVyOkluZGV4QnVmZmVyU29mdHdhcmUsIGZpcnN0SW5kZXg6bnVtYmVyLCBudW1JbmRpY2VzOm51bWJlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcImRyYXdJbmRpY2VzIG1vZGU6IFwiICsgbW9kZSArIFwiIGZpcnN0SW5kZXg6IFwiICsgZmlyc3RJbmRleCArIFwiIG51bUluZGljZXM6IFwiICsgbnVtSW5kaWNlcyk7XG4gICAgICAgIGlmICh0aGlzLl9wcm9qZWN0aW9uTWF0cml4ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwb3NpdGlvbkJ1ZmZlcjpWZXJ0ZXhCdWZmZXJTb2Z0d2FyZSA9IHRoaXMuX3ZlcnRleEJ1ZmZlcnNbdGhpcy5fcG9zaXRpb25CdWZmZXJJbmRleF07XG4gICAgICAgIHZhciB1dkJ1ZmZlcjpWZXJ0ZXhCdWZmZXJTb2Z0d2FyZSA9IHRoaXMuX3ZlcnRleEJ1ZmZlcnNbdGhpcy5fdXZCdWZmZXJJbmRleF07XG4gICAgICAgIGlmICh1dkJ1ZmZlciA9PSBudWxsIHx8IHBvc2l0aW9uQnVmZmVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JhY2tCdWZmZXJDb2xvci5sb2NrKCk7XG5cbiAgICAgICAgZm9yICh2YXIgaTpudW1iZXIgPSBmaXJzdEluZGV4OyBpIDwgbnVtSW5kaWNlczsgaSArPSAzKSB7XG5cbiAgICAgICAgICAgIHZhciBpbmRleDA6bnVtYmVyID0gdGhpcy5fdmVydGV4QnVmZmVyT2Zmc2V0c1t0aGlzLl9wb3NpdGlvbkJ1ZmZlckluZGV4XSAvIDQgKyBpbmRleEJ1ZmZlci5kYXRhW2luZGV4QnVmZmVyLnN0YXJ0T2Zmc2V0ICsgaV0gKiBwb3NpdGlvbkJ1ZmZlci5hdHRyaWJ1dGVzUGVyVmVydGV4O1xuICAgICAgICAgICAgdmFyIGluZGV4MTpudW1iZXIgPSB0aGlzLl92ZXJ0ZXhCdWZmZXJPZmZzZXRzW3RoaXMuX3Bvc2l0aW9uQnVmZmVySW5kZXhdIC8gNCArIGluZGV4QnVmZmVyLmRhdGFbaW5kZXhCdWZmZXIuc3RhcnRPZmZzZXQgKyBpICsgMV0gKiBwb3NpdGlvbkJ1ZmZlci5hdHRyaWJ1dGVzUGVyVmVydGV4O1xuICAgICAgICAgICAgdmFyIGluZGV4MjpudW1iZXIgPSB0aGlzLl92ZXJ0ZXhCdWZmZXJPZmZzZXRzW3RoaXMuX3Bvc2l0aW9uQnVmZmVySW5kZXhdIC8gNCArIGluZGV4QnVmZmVyLmRhdGFbaW5kZXhCdWZmZXIuc3RhcnRPZmZzZXQgKyBpICsgMl0gKiBwb3NpdGlvbkJ1ZmZlci5hdHRyaWJ1dGVzUGVyVmVydGV4O1xuXG4gICAgICAgICAgICB2YXIgdDA6VmVjdG9yM0QgPSBuZXcgVmVjdG9yM0QocG9zaXRpb25CdWZmZXIuZGF0YVtpbmRleDBdLCBwb3NpdGlvbkJ1ZmZlci5kYXRhW2luZGV4MCArIDFdLCBwb3NpdGlvbkJ1ZmZlci5kYXRhW2luZGV4MCArIDJdKTtcbiAgICAgICAgICAgIHZhciB0MTpWZWN0b3IzRCA9IG5ldyBWZWN0b3IzRChwb3NpdGlvbkJ1ZmZlci5kYXRhW2luZGV4MV0sIHBvc2l0aW9uQnVmZmVyLmRhdGFbaW5kZXgxICsgMV0sIHBvc2l0aW9uQnVmZmVyLmRhdGFbaW5kZXgxICsgMl0pO1xuICAgICAgICAgICAgdmFyIHQyOlZlY3RvcjNEID0gbmV3IFZlY3RvcjNEKHBvc2l0aW9uQnVmZmVyLmRhdGFbaW5kZXgyXSwgcG9zaXRpb25CdWZmZXIuZGF0YVtpbmRleDIgKyAxXSwgcG9zaXRpb25CdWZmZXIuZGF0YVtpbmRleDIgKyAyXSk7XG5cbiAgICAgICAgICAgIHQwID0gdGhpcy5fcHJvamVjdGlvbk1hdHJpeC50cmFuc2Zvcm1WZWN0b3IodDApO1xuICAgICAgICAgICAgdDEgPSB0aGlzLl9wcm9qZWN0aW9uTWF0cml4LnRyYW5zZm9ybVZlY3Rvcih0MSk7XG4gICAgICAgICAgICB0MiA9IHRoaXMuX3Byb2plY3Rpb25NYXRyaXgudHJhbnNmb3JtVmVjdG9yKHQyKTtcblxuICAgICAgICAgICAgdDAueCA9IHQwLnggLyB0MC53O1xuICAgICAgICAgICAgdDAueSA9IHQwLnkgLyB0MC53O1xuXG4gICAgICAgICAgICB0MS54ID0gdDEueCAvIHQxLnc7XG4gICAgICAgICAgICB0MS55ID0gdDEueSAvIHQxLnc7XG5cbiAgICAgICAgICAgIHQyLnggPSB0Mi54IC8gdDIudztcbiAgICAgICAgICAgIHQyLnkgPSB0Mi55IC8gdDIudztcblxuICAgICAgICAgICAgdDAueCA9IHQwLnggKiB0aGlzLl9iYWNrQnVmZmVyV2lkdGggKyB0aGlzLl9iYWNrQnVmZmVyV2lkdGggLyAyO1xuICAgICAgICAgICAgdDEueCA9IHQxLnggKiB0aGlzLl9iYWNrQnVmZmVyV2lkdGggKyB0aGlzLl9iYWNrQnVmZmVyV2lkdGggLyAyO1xuICAgICAgICAgICAgdDIueCA9IHQyLnggKiB0aGlzLl9iYWNrQnVmZmVyV2lkdGggKyB0aGlzLl9iYWNrQnVmZmVyV2lkdGggLyAyO1xuXG4gICAgICAgICAgICB0MC55ID0gLXQwLnkgKiB0aGlzLl9iYWNrQnVmZmVySGVpZ2h0ICsgdGhpcy5fYmFja0J1ZmZlckhlaWdodCAvIDI7XG4gICAgICAgICAgICB0MS55ID0gLXQxLnkgKiB0aGlzLl9iYWNrQnVmZmVySGVpZ2h0ICsgdGhpcy5fYmFja0J1ZmZlckhlaWdodCAvIDI7XG4gICAgICAgICAgICB0Mi55ID0gLXQyLnkgKiB0aGlzLl9iYWNrQnVmZmVySGVpZ2h0ICsgdGhpcy5fYmFja0J1ZmZlckhlaWdodCAvIDI7XG5cbiAgICAgICAgICAgIHZhciB1MDpQb2ludDtcbiAgICAgICAgICAgIHZhciB1MTpQb2ludDtcbiAgICAgICAgICAgIHZhciB1MjpQb2ludDtcblxuICAgICAgICAgICAgaWYgKHV2QnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgaW5kZXgwID0gdGhpcy5fdmVydGV4QnVmZmVyT2Zmc2V0c1t0aGlzLl91dkJ1ZmZlckluZGV4XSAvIDQgKyBpbmRleEJ1ZmZlci5kYXRhW2luZGV4QnVmZmVyLnN0YXJ0T2Zmc2V0ICsgaV0gKiB1dkJ1ZmZlci5hdHRyaWJ1dGVzUGVyVmVydGV4O1xuICAgICAgICAgICAgICAgIGluZGV4MSA9IHRoaXMuX3ZlcnRleEJ1ZmZlck9mZnNldHNbdGhpcy5fdXZCdWZmZXJJbmRleF0gLyA0ICsgaW5kZXhCdWZmZXIuZGF0YVtpbmRleEJ1ZmZlci5zdGFydE9mZnNldCArIGkgKyAxXSAqIHV2QnVmZmVyLmF0dHJpYnV0ZXNQZXJWZXJ0ZXg7XG4gICAgICAgICAgICAgICAgaW5kZXgyID0gdGhpcy5fdmVydGV4QnVmZmVyT2Zmc2V0c1t0aGlzLl91dkJ1ZmZlckluZGV4XSAvIDQgKyBpbmRleEJ1ZmZlci5kYXRhW2luZGV4QnVmZmVyLnN0YXJ0T2Zmc2V0ICsgaSArIDJdICogdXZCdWZmZXIuYXR0cmlidXRlc1BlclZlcnRleDtcblxuICAgICAgICAgICAgICAgIHUwID0gbmV3IFBvaW50KHV2QnVmZmVyLmRhdGFbaW5kZXgwXSwgdXZCdWZmZXIuZGF0YVtpbmRleDAgKyAxXSk7XG4gICAgICAgICAgICAgICAgdTEgPSBuZXcgUG9pbnQodXZCdWZmZXIuZGF0YVtpbmRleDFdLCB1dkJ1ZmZlci5kYXRhW2luZGV4MSArIDFdKTtcbiAgICAgICAgICAgICAgICB1MiA9IG5ldyBQb2ludCh1dkJ1ZmZlci5kYXRhW2luZGV4Ml0sIHV2QnVmZmVyLmRhdGFbaW5kZXgyICsgMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRyaWFuZ2xlKHQwLCB0MSwgdDIsIHUwLCB1MSwgdTIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYmFja0J1ZmZlckNvbG9yLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3VmVydGljZXMobW9kZTpzdHJpbmcsIGZpcnN0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZHJhd1ZlcnRpY2VzXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRTY2lzc29yUmVjdGFuZ2xlKHJlY3RhbmdsZTpSZWN0YW5nbGUpIHtcbiAgICAgICAgLy9UT0RPOlxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRTYW1wbGVyU3RhdGVBdChzYW1wbGVyOm51bWJlciwgd3JhcDpzdHJpbmcsIGZpbHRlcjpzdHJpbmcsIG1pcGZpbHRlcjpzdHJpbmcpIHtcbiAgICAgICAgLy9UT0RPOlxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRSZW5kZXJUb1RleHR1cmUodGFyZ2V0OklUZXh0dXJlQmFzZSwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4sIGFudGlBbGlhczpudW1iZXIsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIpIHtcbiAgICAgICAgLy9UT0RPOlxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRSZW5kZXJUb0JhY2tCdWZmZXIoKSB7XG4gICAgICAgIC8vVE9ETzpcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhbXBsZURpZmZ1c2UodXY6UG9pbnQpOm51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl90ZXh0dXJlc1swXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgdGV4dHVyZTpUZXh0dXJlU29mdHdhcmUgPSB0aGlzLl90ZXh0dXJlc1swXTtcblxuICAgICAgICAgICAgdmFyIHU6bnVtYmVyID0gTWF0aC5hYnMoKCh1di54ICogdGV4dHVyZS53aWR0aCkgJSB0ZXh0dXJlLndpZHRoKSkgPj4gMDtcbiAgICAgICAgICAgIHZhciB2Om51bWJlciA9IE1hdGguYWJzKCgodXYueSAqIHRleHR1cmUuaGVpZ2h0KSAlIHRleHR1cmUuaGVpZ2h0KSkgPj4gMDtcblxuICAgICAgICAgICAgdmFyIHBvczpudW1iZXIgPSAodSArIHYgKiB0ZXh0dXJlLndpZHRoKSAqIDQ7XG5cbiAgICAgICAgICAgIHZhciByOm51bWJlciA9IHRleHR1cmUuZGF0YVtwb3NdO1xuICAgICAgICAgICAgdmFyIGc6bnVtYmVyID0gdGV4dHVyZS5kYXRhW3BvcyArIDFdO1xuICAgICAgICAgICAgdmFyIGI6bnVtYmVyID0gdGV4dHVyZS5kYXRhW3BvcyArIDJdO1xuICAgICAgICAgICAgdmFyIGE6bnVtYmVyID0gdGV4dHVyZS5kYXRhW3BvcyArIDNdO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29sb3JVdGlscy5BUkdCdG9GbG9hdDMyKGEscixnLGIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbG9yVXRpbHMuQVJHQnRvRmxvYXQzMigyNTUsIHV2LnggKiAyNTUsIHV2LnkgKiAyNTUsIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBwdXRQaXhlbCh4Om51bWJlciwgeTpudW1iZXIsIHo6bnVtYmVyLCBjb2xvcjpudW1iZXIpOnZvaWQge1xuICAgICAgICB2YXIgaW5kZXg6bnVtYmVyID0gKCh4ID4+IDApICsgKHkgPj4gMCkgKiB0aGlzLl9iYWNrQnVmZmVyV2lkdGgpO1xuXG4gICAgICAgIGlmICh0aGlzLl96YnVmZmVyW2luZGV4XSA8IHopIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pidWZmZXJbaW5kZXhdID0gejtcblxuICAgICAgICB0aGlzLl9kcmF3UmVjdC54ID0geDtcbiAgICAgICAgdGhpcy5fZHJhd1JlY3QueSA9IHk7XG4gICAgICAgIHRoaXMuX2RyYXdSZWN0LndpZHRoID0gMTtcbiAgICAgICAgdGhpcy5fZHJhd1JlY3QuaGVpZ2h0ID0gMTtcbiAgICAgICAgLy90aGlzLl9iYWNrQnVmZmVyQ29sb3IuZmlsbFJlY3QodGhpcy5fZHJhd1JlY3QsIGNvbG9yKTtcbiAgICAgICAgdGhpcy5fYmFja0J1ZmZlckNvbG9yLnNldFBpeGVsMzIoeCwgeSwgY29sb3IpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3UG9pbnQocG9pbnQ6VmVjdG9yM0QsIGNvbG9yOm51bWJlcik6dm9pZCB7XG4gICAgICAgIGlmIChwb2ludC54ID49IDAgJiYgcG9pbnQueSA+PSAwICYmIHBvaW50LnggPCB0aGlzLl9iYWNrQnVmZmVyV2lkdGggJiYgcG9pbnQueSA8IHRoaXMuX2JhY2tCdWZmZXJXaWR0aCkge1xuICAgICAgICAgICAgdGhpcy5wdXRQaXhlbChwb2ludC54LCBwb2ludC55LCBwb2ludC56LCBjb2xvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY2xhbXAodmFsdWU6bnVtYmVyLCBtaW46bnVtYmVyID0gMCwgbWF4Om51bWJlciA9IDEpOm51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChtaW4sIE1hdGgubWluKHZhbHVlLCBtYXgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW50ZXJwb2xhdGUobWluOm51bWJlciwgbWF4Om51bWJlciwgZ3JhZGllbnQ6bnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtaW4gKyAobWF4IC0gbWluKSAqIHRoaXMuY2xhbXAoZ3JhZGllbnQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcm9jZXNzU2NhbkxpbmUoY3VycmVudFk6bnVtYmVyLCBwYTpWZWN0b3IzRCwgcGI6VmVjdG9yM0QsIHBjOlZlY3RvcjNELCBwZDpWZWN0b3IzRCwgdXZhOlBvaW50LCB1dmI6UG9pbnQsIHV2YzpQb2ludCwgdXZkOlBvaW50KTp2b2lkIHtcbiAgICAgICAgdmFyIGdyYWRpZW50MTpudW1iZXIgPSBwYS55ICE9IHBiLnkgPyAoY3VycmVudFkgLSBwYS55KSAvIChwYi55IC0gcGEueSkgOiAxO1xuICAgICAgICB2YXIgZ3JhZGllbnQyOm51bWJlciA9IHBjLnkgIT0gcGQueSA/IChjdXJyZW50WSAtIHBjLnkpIC8gKHBkLnkgLSBwYy55KSA6IDE7XG5cbiAgICAgICAgdmFyIHN4ID0gdGhpcy5pbnRlcnBvbGF0ZShwYS54LCBwYi54LCBncmFkaWVudDEpID4+IDA7XG4gICAgICAgIHZhciBleCA9IHRoaXMuaW50ZXJwb2xhdGUocGMueCwgcGQueCwgZ3JhZGllbnQyKSA+PiAwO1xuXG4gICAgICAgIHZhciB6MTpudW1iZXIgPSB0aGlzLmludGVycG9sYXRlKHBhLnosIHBiLnosIGdyYWRpZW50MSk7XG4gICAgICAgIHZhciB6MjpudW1iZXIgPSB0aGlzLmludGVycG9sYXRlKHBjLnosIHBkLnosIGdyYWRpZW50Mik7XG5cbiAgICAgICAgLy92YXIgc25sOm51bWJlciA9IHRoaXMuaW50ZXJwb2xhdGUoZGF0YS5uZG90bGEsIGRhdGEubmRvdGxiLCBncmFkaWVudDEpO1xuICAgICAgICAvL3ZhciBlbmw6bnVtYmVyID0gdGhpcy5pbnRlcnBvbGF0ZShkYXRhLm5kb3RsYywgZGF0YS5uZG90bGQsIGdyYWRpZW50Mik7XG5cbiAgICAgICAgdmFyIHN1ID0gdGhpcy5pbnRlcnBvbGF0ZSh1dmEueCwgdXZiLngsIGdyYWRpZW50MSk7XG4gICAgICAgIHZhciBldSA9IHRoaXMuaW50ZXJwb2xhdGUodXZjLngsIHV2ZC54LCBncmFkaWVudDIpO1xuICAgICAgICB2YXIgc3YgPSB0aGlzLmludGVycG9sYXRlKHV2YS55LCB1dmIueSwgZ3JhZGllbnQxKTtcbiAgICAgICAgdmFyIGV2ID0gdGhpcy5pbnRlcnBvbGF0ZSh1dmMueSwgdXZkLnksIGdyYWRpZW50Mik7XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IHN4OyB4IDwgZXg7IHgrKykge1xuICAgICAgICAgICAgdmFyIGdyYWRpZW50Om51bWJlciA9ICh4IC0gc3gpIC8gKGV4IC0gc3gpO1xuXG4gICAgICAgICAgICB2YXIgeiA9IHRoaXMuaW50ZXJwb2xhdGUoejEsIHoyLCBncmFkaWVudCk7XG4gICAgICAgICAgICAvL3ZhciBuZG90bCA9IHRoaXMuaW50ZXJwb2xhdGUoc25sLCBlbmwsIGdyYWRpZW50KTtcbiAgICAgICAgICAgIHZhciB1ID0gdGhpcy5pbnRlcnBvbGF0ZShzdSwgZXUsIGdyYWRpZW50KTtcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy5pbnRlcnBvbGF0ZShzdiwgZXYsIGdyYWRpZW50KTtcblxuICAgICAgICAgICAgdmFyIGNvbG9yOm51bWJlciA9IHRoaXMuc2FtcGxlRGlmZnVzZShuZXcgUG9pbnQodSwgdikpO1xuXG4gICAgICAgICAgICB0aGlzLmRyYXdQb2ludChuZXcgVmVjdG9yM0QoeCwgY3VycmVudFksIHopLCBjb2xvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdHJpYW5nbGUocDE6VmVjdG9yM0QsIHAyOlZlY3RvcjNELCBwMzpWZWN0b3IzRCwgdXYxOlBvaW50LCB1djI6UG9pbnQsIHV2MzpQb2ludCk6dm9pZCB7XG4gICAgICAgIHZhciB0ZW1wOmFueTtcbiAgICAgICAgaWYgKHAxLnkgPiBwMi55KSB7XG4gICAgICAgICAgICB0ZW1wID0gcDI7XG4gICAgICAgICAgICBwMiA9IHAxO1xuICAgICAgICAgICAgcDEgPSB0ZW1wO1xuXG4gICAgICAgICAgICB0ZW1wID0gdXYyO1xuICAgICAgICAgICAgdXYyID0gdXYxO1xuICAgICAgICAgICAgdXYxID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwMi55ID4gcDMueSkge1xuICAgICAgICAgICAgdGVtcCA9IHAyO1xuICAgICAgICAgICAgcDIgPSBwMztcbiAgICAgICAgICAgIHAzID0gdGVtcDtcblxuICAgICAgICAgICAgdGVtcCA9IHV2MjtcbiAgICAgICAgICAgIHV2MiA9IHV2MztcbiAgICAgICAgICAgIHV2MyA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocDEueSA+IHAyLnkpIHtcbiAgICAgICAgICAgIHRlbXAgPSBwMjtcbiAgICAgICAgICAgIHAyID0gcDE7XG4gICAgICAgICAgICBwMSA9IHRlbXA7XG5cbiAgICAgICAgICAgIHRlbXAgPSB1djI7XG4gICAgICAgICAgICB1djIgPSB1djE7XG4gICAgICAgICAgICB1djEgPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRQMVAyOm51bWJlcjtcbiAgICAgICAgdmFyIGRQMVAzOm51bWJlcjtcblxuICAgICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Nsb3BlXG4gICAgICAgIGlmIChwMi55IC0gcDEueSA+IDApXG4gICAgICAgICAgICBkUDFQMiA9IChwMi54IC0gcDEueCkgLyAocDIueSAtIHAxLnkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkUDFQMiA9IDA7XG5cbiAgICAgICAgaWYgKHAzLnkgLSBwMS55ID4gMClcbiAgICAgICAgICAgIGRQMVAzID0gKHAzLnggLSBwMS54KSAvIChwMy55IC0gcDEueSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRQMVAzID0gMDtcblxuICAgICAgICBpZiAoZFAxUDIgPiBkUDFQMykge1xuICAgICAgICAgICAgZm9yICh2YXIgeTpudW1iZXIgPSBwMS55ID4+IDA7IHkgPD0gcDMueSA+PiAwOyB5KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeSA8IHAyLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzU2NhbkxpbmUoeSwgcDEsIHAzLCBwMSwgcDIsIHV2MSwgdXYzLCB1djEsIHV2Mik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzU2NhbkxpbmUoeSwgcDEsIHAzLCBwMiwgcDMsIHV2MSwgdXYzLCB1djIsIHV2Myk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgeTpudW1iZXIgPSBwMS55ID4+IDA7IHkgPD0gcDMueSA+PiAwOyB5KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeSA8IHAyLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzU2NhbkxpbmUoeSwgcDEsIHAyLCBwMSwgcDMsIHV2MSwgdXYyLCB1djEsIHV2Myk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzU2NhbkxpbmUoeSwgcDIsIHAzLCBwMSwgcDMsIHV2MiwgdXYzLCB1djEsIHV2Myk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCA9IENvbnRleHRTb2Z0d2FyZTtcblxuXG5jbGFzcyBWZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzIHtcbiAgICBwdWJsaWMgc2l6ZTpudW1iZXI7XG5cbiAgICBwdWJsaWMgdHlwZTpudW1iZXI7XG5cbiAgICBwdWJsaWMgbm9ybWFsaXplZDpib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3Ioc2l6ZTpudW1iZXIsIHR5cGU6bnVtYmVyLCBub3JtYWxpemVkOmJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5ub3JtYWxpemVkID0gbm9ybWFsaXplZDtcbiAgICB9XG59IiwiaW1wb3J0IEJpdG1hcEltYWdlMkRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0JpdG1hcEltYWdlMkRcIik7XG5pbXBvcnQgTWF0cml4M0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9NYXRyaXgzRFwiKTtcbmltcG9ydCBSZWN0YW5nbGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUmVjdGFuZ2xlXCIpO1xuXG4vL2ltcG9ydCBzd2ZvYmplY3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3N3Zm9iamVjdFwiKTtcbmltcG9ydCBTYW1wbGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL1NhbXBsZXJcIik7XG5pbXBvcnQgQ29udGV4dEdMQ2xlYXJNYXNrXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQ2xlYXJNYXNrXCIpO1xuaW1wb3J0IENvbnRleHRHTFByb2dyYW1UeXBlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMUHJvZ3JhbVR5cGVcIik7XG5pbXBvcnQgQ3ViZVRleHR1cmVGbGFzaFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ3ViZVRleHR1cmVGbGFzaFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XG5pbXBvcnQgSW5kZXhCdWZmZXJGbGFzaFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSW5kZXhCdWZmZXJGbGFzaFwiKTtcbmltcG9ydCBPcENvZGVzXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvT3BDb2Rlc1wiKTtcbmltcG9ydCBQcm9ncmFtRmxhc2hcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUHJvZ3JhbUZsYXNoXCIpO1xuaW1wb3J0IFRleHR1cmVGbGFzaFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9UZXh0dXJlRmxhc2hcIik7XG5pbXBvcnQgUmVzb3VyY2VCYXNlRmxhc2hcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9SZXNvdXJjZUJhc2VGbGFzaFwiKTtcbmltcG9ydCBWZXJ0ZXhCdWZmZXJGbGFzaFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1ZlcnRleEJ1ZmZlckZsYXNoXCIpO1xuXG5jbGFzcyBDb250ZXh0U3RhZ2UzRCBpbXBsZW1lbnRzIElDb250ZXh0R0xcbntcblx0cHVibGljIHN0YXRpYyBjb250ZXh0czpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHB1YmxpYyBzdGF0aWMgbWF4dmVydGV4Y29uc3RhbnRzOm51bWJlciA9IDEyODtcblx0cHVibGljIHN0YXRpYyBtYXhmcmFnY29uc3RhbnRzOm51bWJlciA9IDI4O1xuXHRwdWJsaWMgc3RhdGljIG1heHRlbXA6bnVtYmVyID0gODtcblx0cHVibGljIHN0YXRpYyBtYXhzdHJlYW1zOm51bWJlciA9IDg7XG5cdHB1YmxpYyBzdGF0aWMgbWF4dGV4dHVyZXM6bnVtYmVyID0gODtcblx0cHVibGljIHN0YXRpYyBkZWZhdWx0c2FtcGxlciA9IG5ldyBTYW1wbGVyKCk7XG5cblx0cHVibGljIF9pRHJpdmVySW5mbztcblxuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgX3dpZHRoOm51bWJlcjtcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcblx0cHJpdmF0ZSBfY21kU3RyZWFtOnN0cmluZyA9IFwiXCI7XG5cdHByaXZhdGUgX2Vycm9yQ2hlY2tpbmdFbmFibGVkOmJvb2xlYW47XG5cdHByaXZhdGUgX3Jlc291cmNlczpBcnJheTxSZXNvdXJjZUJhc2VGbGFzaD47XG5cdHByaXZhdGUgX29sZENhbnZhczpIVE1MQ2FudmFzRWxlbWVudDtcblx0cHJpdmF0ZSBfb2xkUGFyZW50OkhUTUxFbGVtZW50O1xuXG5cblx0cHVibGljIHN0YXRpYyBkZWJ1Zzpib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyBzdGF0aWMgbG9nU3RyZWFtOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRwdWJsaWMgX2lDYWxsYmFjazooY29udGV4dDpJQ29udGV4dEdMKSA9PiB2b2lkO1xuXG5cdHB1YmxpYyBnZXQgY29udGFpbmVyKCk6SFRNTEVsZW1lbnRcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb250YWluZXI7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGRyaXZlckluZm8oKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2lEcml2ZXJJbmZvO1xuXHR9XG5cblx0cHVibGljIGdldCBlcnJvckNoZWNraW5nRW5hYmxlZCgpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9lcnJvckNoZWNraW5nRW5hYmxlZDtcblx0fVxuXG5cdHB1YmxpYyBzZXQgZXJyb3JDaGVja2luZ0VuYWJsZWQodmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9lcnJvckNoZWNraW5nRW5hYmxlZCA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2Vycm9yQ2hlY2tpbmdFbmFibGVkID0gdmFsdWU7XG5cblx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuZW5hYmxlRXJyb3JDaGVja2luZywgdmFsdWU/IE9wQ29kZXMudHJ1ZVZhbHVlIDogT3BDb2Rlcy5mYWxzZVZhbHVlKSk7XG5cdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHQvL1RPRE86IGdldCByaWQgb2YgaGFjayB0aGF0IGZpeGVzIGluY2x1ZGluZyBkZWZpbml0aW9uIGZpbGVcblx0Y29uc3RydWN0b3IoY29udGFpbmVyOkhUTUxDYW52YXNFbGVtZW50LCBjYWxsYmFjazooY29udGV4dDpJQ29udGV4dEdMKSA9PiB2b2lkLCBpbmNsdWRlPzpTYW1wbGVyKVxuXHR7XG5cdFx0dGhpcy5fcmVzb3VyY2VzID0gbmV3IEFycmF5PFJlc291cmNlQmFzZUZsYXNoPigpO1xuXG5cdFx0dmFyIHN3ZlZlcnNpb25TdHIgPSBcIjExLjAuMFwiO1xuXG5cdFx0Ly8gVG8gdXNlIGV4cHJlc3MgaW5zdGFsbCwgc2V0IHRvIHBsYXllclByb2R1Y3RJbnN0YWxsLnN3Ziwgb3RoZXJ3aXNlIHRoZSBlbXB0eSBzdHJpbmcuXG5cdFx0dmFyIGZsYXNodmFycyA9IHtcblx0XHRcdGlkOmNvbnRhaW5lci5pZFxuXHRcdH07XG5cblx0XHR2YXIgcGFyYW1zID0ge1xuXHRcdFx0cXVhbGl0eTpcImhpZ2hcIixcblx0XHRcdGJnY29sb3I6XCIjZmZmZmZmXCIsXG5cdFx0XHRhbGxvd3NjcmlwdGFjY2VzczpcInNhbWVEb21haW5cIixcblx0XHRcdGFsbG93ZnVsbHNjcmVlbjpcInRydWVcIixcblx0XHRcdHdtb2RlOlwiZGlyZWN0XCJcblx0XHR9O1xuXG5cdFx0dGhpcy5fZXJyb3JDaGVja2luZ0VuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLl9pRHJpdmVySW5mbyA9IFwiVW5rbm93blwiO1xuXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSB7XG5cdFx0XHRzYWxpZ246XCJ0bFwiLFxuXHRcdFx0aWQ6Y29udGFpbmVyLmlkLFxuXHRcdFx0bmFtZTpjb250YWluZXJbXCJuYW1lXCJdIC8vVE9ETzogbmVlZGVkP1xuXHRcdH07XG5cblx0XHR0aGlzLl9vbGRDYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+IGNvbnRhaW5lci5jbG9uZU5vZGUoKTsgLy8ga2VlcCB0aGUgb2xkIG9uZSB0byByZXN0b3JlIG9uIGRpc3Bvc2Vcblx0XHR0aGlzLl9vbGRQYXJlbnQgPSA8SFRNTEVsZW1lbnQ+IGNvbnRhaW5lci5wYXJlbnROb2RlO1xuXG5cdFx0dmFyIGNvbnRleHQzZE9iaiA9IHRoaXM7XG5cdFx0Q29udGV4dFN0YWdlM0QuY29udGV4dHNbY29udGFpbmVyLmlkXSA9IHRoaXM7XG5cblx0XHRmdW5jdGlvbiBjYWxsYmFja1NXRk9iamVjdChjYWxsYmFja0luZm8pXG5cdFx0e1xuXHRcdFx0aWYgKCFjYWxsYmFja0luZm8uc3VjY2Vzcylcblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRjb250ZXh0M2RPYmouX2NvbnRhaW5lciA9IGNhbGxiYWNrSW5mby5yZWY7XG5cdFx0XHRjb250ZXh0M2RPYmouX2lDYWxsYmFjayA9IGNhbGxiYWNrO1xuXHRcdH1cblxuXHRcdC8vc3dmb2JqZWN0LmVtYmVkU1dGKFwibGlicy9tb2xlaGlsbF9qc19mbGFzaGJyaWRnZS5zd2ZcIiwgY29udGFpbmVyLmlkLCBTdHJpbmcoY29udGFpbmVyLndpZHRoKSwgU3RyaW5nKGNvbnRhaW5lci5oZWlnaHQpLCBzd2ZWZXJzaW9uU3RyLCBcIlwiLCBmbGFzaHZhcnMsIHBhcmFtcywgYXR0cmlidXRlcywgY2FsbGJhY2tTV0ZPYmplY3QpO1xuXHR9XG5cblx0cHVibGljIF9pQWRkUmVzb3VyY2UocmVzb3VyY2U6UmVzb3VyY2VCYXNlRmxhc2gpXG5cdHtcblx0XHR0aGlzLl9yZXNvdXJjZXMucHVzaChyZXNvdXJjZSk7XG5cdH1cblxuXHRwdWJsaWMgX2lSZW1vdmVSZXNvdXJjZShyZXNvdXJjZTpSZXNvdXJjZUJhc2VGbGFzaClcblx0e1xuXHRcdHRoaXMuX3Jlc291cmNlcy5zcGxpY2UodGhpcy5fcmVzb3VyY2VzLmluZGV4T2YocmVzb3VyY2UpKTtcblx0fVxuXG5cdHB1YmxpYyBjcmVhdGVUZXh0dXJlKHdpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlciwgZm9ybWF0OnN0cmluZywgb3B0aW1pemVGb3JSZW5kZXJUb1RleHR1cmU6Ym9vbGVhbiwgc3RyZWFtaW5nTGV2ZWxzOm51bWJlciA9IDApOlRleHR1cmVGbGFzaFxuXHR7XG5cdFx0Ly9UT0RPOnN0cmVhbWluZ1xuXHRcdHJldHVybiBuZXcgVGV4dHVyZUZsYXNoKHRoaXMsIHdpZHRoLCBoZWlnaHQsIGZvcm1hdCwgb3B0aW1pemVGb3JSZW5kZXJUb1RleHR1cmUpO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZUN1YmVUZXh0dXJlKHNpemU6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nLCBvcHRpbWl6ZUZvclJlbmRlclRvVGV4dHVyZTpib29sZWFuLCBzdHJlYW1pbmdMZXZlbHM6bnVtYmVyID0gMCk6Q3ViZVRleHR1cmVGbGFzaFxuXHR7XG5cdFx0Ly9UT0RPOnN0cmVhbWluZ1xuXHRcdHJldHVybiBuZXcgQ3ViZVRleHR1cmVGbGFzaCh0aGlzLCBzaXplLCBmb3JtYXQsIG9wdGltaXplRm9yUmVuZGVyVG9UZXh0dXJlKTtcblx0fVxuXG5cblx0cHVibGljIHNldFRleHR1cmVBdChzYW1wbGVyOm51bWJlciwgdGV4dHVyZTpSZXNvdXJjZUJhc2VGbGFzaClcblx0e1xuXHRcdGlmICh0ZXh0dXJlKSB7XG5cdFx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuc2V0VGV4dHVyZUF0KSArIHNhbXBsZXIgKyBcIixcIiArIHRleHR1cmUuaWQgKyBcIixcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5jbGVhclRleHR1cmVBdCkgKyBzYW1wbGVyLnRvU3RyaW5nKCkgKyBcIixcIik7XG5cdFx0fVxuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgc2V0U2FtcGxlclN0YXRlQXQoc2FtcGxlcjpudW1iZXIsIHdyYXA6c3RyaW5nLCBmaWx0ZXI6c3RyaW5nLCBtaXBmaWx0ZXI6c3RyaW5nKTp2b2lkXG5cdHtcblx0XHQvL25vdGhpbmcgdG8gZG8gaGVyZVxuXHR9XG5cblx0cHVibGljIHNldFN0ZW5jaWxBY3Rpb25zKHRyaWFuZ2xlRmFjZTpzdHJpbmcgPSBcImZyb250QW5kQmFja1wiLCBjb21wYXJlTW9kZTpzdHJpbmcgPSBcImFsd2F5c1wiLCBhY3Rpb25PbkJvdGhQYXNzOnN0cmluZyA9IFwia2VlcFwiLCBhY3Rpb25PbkRlcHRoRmFpbDpzdHJpbmcgPSBcImtlZXBcIiwgYWN0aW9uT25EZXB0aFBhc3NTdGVuY2lsRmFpbDpzdHJpbmcgPSBcImtlZXBcIiwgY29vcmRpbmF0ZVN5c3RlbTpzdHJpbmcgPSBcImxlZnRIYW5kZWRcIilcblx0e1xuXHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5zZXRTdGVuY2lsQWN0aW9ucykgKyB0cmlhbmdsZUZhY2UgKyBcIiRcIiArIGNvbXBhcmVNb2RlICsgXCIkXCIgKyBhY3Rpb25PbkJvdGhQYXNzICsgXCIkXCIgKyBhY3Rpb25PbkRlcHRoRmFpbCArIFwiJFwiICsgYWN0aW9uT25EZXB0aFBhc3NTdGVuY2lsRmFpbCArIFwiJFwiKTtcblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIHNldFN0ZW5jaWxSZWZlcmVuY2VWYWx1ZShyZWZlcmVuY2VWYWx1ZTpudW1iZXIsIHJlYWRNYXNrOm51bWJlciA9IDI1NSwgd3JpdGVNYXNrOm51bWJlciA9IDI1NSlcblx0e1xuXHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5zZXRTdGVuY2lsUmVmZXJlbmNlVmFsdWUsIHJlZmVyZW5jZVZhbHVlICsgT3BDb2Rlcy5pbnRNYXNrLCByZWFkTWFzayArIE9wQ29kZXMuaW50TWFzaywgd3JpdGVNYXNrICsgT3BDb2Rlcy5pbnRNYXNrKSk7XG5cblx0XHRpZiAoQ29udGV4dFN0YWdlM0QuZGVidWcpXG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRDdWxsaW5nKHRyaWFuZ2xlRmFjZVRvQ3VsbDpzdHJpbmcsIGNvb3JkaW5hdGVTeXN0ZW06c3RyaW5nID0gXCJsZWZ0SGFuZGVkXCIpXG5cdHtcblx0XHQvL1RPRE8gaW1wbGVtZW50IGNvb3JkaW5hdGVTeXN0ZW0gb3B0aW9uXG5cdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnNldEN1bGxpbmcpICsgdHJpYW5nbGVGYWNlVG9DdWxsICsgXCIkXCIpO1xuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgZHJhd0luZGljZXMobW9kZTpzdHJpbmcsIGluZGV4QnVmZmVyOkluZGV4QnVmZmVyRmxhc2gsIGZpcnN0SW5kZXg6bnVtYmVyID0gMCwgbnVtSW5kaWNlczpudW1iZXIgPSAtMSlcblx0e1xuXHRcdGZpcnN0SW5kZXggPSBmaXJzdEluZGV4IHx8IDA7XG5cdFx0aWYgKCFudW1JbmRpY2VzIHx8IG51bUluZGljZXMgPCAwKVxuXHRcdFx0bnVtSW5kaWNlcyA9IGluZGV4QnVmZmVyLm51bUluZGljZXM7XG5cblx0XHQvL2Fzc3VtZSB0cmlhbmdsZXNcblx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuZHJhd1RyaWFuZ2xlcywgaW5kZXhCdWZmZXIuaWQgKyBPcENvZGVzLmludE1hc2spICsgZmlyc3RJbmRleCArIFwiLFwiICsgbnVtSW5kaWNlcyArIFwiLFwiKTtcblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIGRyYXdWZXJ0aWNlcyhtb2RlOnN0cmluZywgZmlyc3RWZXJ0ZXg6bnVtYmVyID0gMCwgbnVtVmVydGljZXM6bnVtYmVyID0gLTEpXG5cdHtcblx0XHQvL2Nhbid0IGJlIGRvbmUgaW4gU3RhZ2UzRFxuXHR9XG5cblxuXHRwdWJsaWMgc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21NYXRyaXgocHJvZ3JhbVR5cGU6c3RyaW5nLCBmaXJzdFJlZ2lzdGVyOm51bWJlciwgbWF0cml4Ok1hdHJpeDNELCB0cmFuc3Bvc2VkTWF0cml4OmJvb2xlYW4gPSBmYWxzZSlcblx0e1xuXHRcdC8vdGhpcy5fZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLl9nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5fY3VycmVudFByb2dyYW0uZ2xQcm9ncmFtLCB0aGlzLl91bmlmb3JtTG9jYXRpb25OYW1lRGljdGlvbmFyeVtwcm9ncmFtVHlwZV0pLCAhdHJhbnNwb3NlZE1hdHJpeCwgbmV3IEZsb2F0MzJBcnJheShtYXRyaXgucmF3RGF0YSkpO1xuXG5cdFx0Ly9UT0RPIHJlbW92ZSBzcGVjaWFsIGNhc2UgZm9yIFdlYkdMIG1hdHJpeCBjYWxscz9cblx0XHR2YXIgZDpudW1iZXJbXSA9IG1hdHJpeC5yYXdEYXRhO1xuXHRcdGlmICh0cmFuc3Bvc2VkTWF0cml4KSB7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIsIFsgZFswXSwgZFs0XSwgZFs4XSwgZFsxMl0gXSwgMSk7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIgKyAxLCBbIGRbMV0sIGRbNV0sIGRbOV0sIGRbMTNdIF0sIDEpO1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyICsgMiwgWyBkWzJdLCBkWzZdLCBkWzEwXSwgZFsxNF0gXSwgMSk7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIgKyAzLCBbIGRbM10sIGRbN10sIGRbMTFdLCBkWzE1XSBdLCAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyLCBbIGRbMF0sIGRbMV0sIGRbMl0sIGRbM10gXSwgMSk7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIgKyAxLCBbIGRbNF0sIGRbNV0sIGRbNl0sIGRbN10gXSwgMSk7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIgKyAyLCBbIGRbOF0sIGRbOV0sIGRbMTBdLCBkWzExXSBdLCAxKTtcblx0XHRcdHRoaXMuc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShwcm9ncmFtVHlwZSwgZmlyc3RSZWdpc3RlciArIDMsIFsgZFsxMl0sIGRbMTNdLCBkWzE0XSwgZFsxNV0gXSwgMSk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGU6c3RyaW5nLCBmaXJzdFJlZ2lzdGVyOm51bWJlciwgZGF0YTpudW1iZXJbXSwgbnVtUmVnaXN0ZXJzOm51bWJlciA9IC0xKVxuXHR7XG5cdFx0dmFyIHN0YXJ0SW5kZXg6bnVtYmVyO1xuXHRcdHZhciB0YXJnZXQ6bnVtYmVyID0gKHByb2dyYW1UeXBlID09IENvbnRleHRHTFByb2dyYW1UeXBlLlZFUlRFWCk/IE9wQ29kZXMudHJ1ZVZhbHVlIDogT3BDb2Rlcy5mYWxzZVZhbHVlO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IG51bVJlZ2lzdGVyczsgaSsrKSB7XG5cdFx0XHRzdGFydEluZGV4ID0gaSo0O1xuXHRcdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnNldFByb2dyYW1Db25zdGFudCwgdGFyZ2V0LCAoZmlyc3RSZWdpc3RlciArIGkpICsgT3BDb2Rlcy5pbnRNYXNrKSArIGRhdGFbc3RhcnRJbmRleF0gKyBcIixcIiArIGRhdGFbc3RhcnRJbmRleCArIDFdICsgXCIsXCIgKyBkYXRhW3N0YXJ0SW5kZXggKyAyXSArIFwiLFwiICsgZGF0YVtzdGFydEluZGV4ICsgM10gKyBcIixcIik7XG5cblx0XHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHNldFByb2dyYW0ocHJvZ3JhbTpQcm9ncmFtRmxhc2gpXG5cdHtcblx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuc2V0UHJvZ3JhbSwgcHJvZ3JhbS5pZCArIE9wQ29kZXMuaW50TWFzaykpO1xuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgcHJlc2VudCgpXG5cdHtcblx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMucHJlc2VudCkpO1xuXHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIGNsZWFyKHJlZDpudW1iZXIgPSAwLCBncmVlbjpudW1iZXIgPSAwLCBibHVlOm51bWJlciA9IDAsIGFscGhhOm51bWJlciA9IDEsIGRlcHRoOm51bWJlciA9IDEsIHN0ZW5jaWw6bnVtYmVyID0gMCwgbWFzazpudW1iZXIgPSBDb250ZXh0R0xDbGVhck1hc2suQUxMKVxuXHR7XG5cdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmNsZWFyKSArIHJlZCArIFwiLFwiICsgZ3JlZW4gKyBcIixcIiArIGJsdWUgKyBcIixcIiArIGFscGhhICsgXCIsXCIgKyBkZXB0aCArIFwiLFwiICsgc3RlbmNpbCArIFwiLFwiICsgbWFzayArIFwiLFwiKTtcblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZVByb2dyYW0oKTpQcm9ncmFtRmxhc2hcblx0e1xuXHRcdHJldHVybiBuZXcgUHJvZ3JhbUZsYXNoKHRoaXMpO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZVZlcnRleEJ1ZmZlcihudW1WZXJ0aWNlczpudW1iZXIsIGRhdGEzMlBlclZlcnRleDpudW1iZXIpOlZlcnRleEJ1ZmZlckZsYXNoXG5cdHtcblx0XHRyZXR1cm4gbmV3IFZlcnRleEJ1ZmZlckZsYXNoKHRoaXMsIG51bVZlcnRpY2VzLCBkYXRhMzJQZXJWZXJ0ZXgpO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZUluZGV4QnVmZmVyKG51bUluZGljZXM6bnVtYmVyKTpJbmRleEJ1ZmZlckZsYXNoXG5cdHtcblx0XHRyZXR1cm4gbmV3IEluZGV4QnVmZmVyRmxhc2godGhpcywgbnVtSW5kaWNlcyk7XG5cdH1cblxuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcih3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXIsIGFudGlBbGlhczpudW1iZXIsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gdHJ1ZSlcblx0e1xuXHRcdHRoaXMuX3dpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG5cdFx0Ly9UT0RPOiBhZGQgQW5pdGFsaWFzIHNldHRpbmdcblx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuY29uZmlndXJlQmFja0J1ZmZlcikgKyB3aWR0aCArIFwiLFwiICsgaGVpZ2h0ICsgXCIsXCIpO1xuXHR9XG5cblx0cHVibGljIGRyYXdUb0JpdG1hcEltYWdlMkQoZGVzdGluYXRpb246Qml0bWFwSW1hZ2UyRClcblx0e1xuXHRcdC8vVE9ET1xuXHR9XG5cblx0cHVibGljIHNldFZlcnRleEJ1ZmZlckF0KGluZGV4Om51bWJlciwgYnVmZmVyOlZlcnRleEJ1ZmZlckZsYXNoLCBidWZmZXJPZmZzZXQ6bnVtYmVyID0gMCwgZm9ybWF0OnN0cmluZyA9IG51bGwpXG5cdHtcblx0XHRpZiAoYnVmZmVyKSB7XG5cdFx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuc2V0VmVydGV4QnVmZmVyQXQsIGluZGV4ICsgT3BDb2Rlcy5pbnRNYXNrKSArIGJ1ZmZlci5pZCArIFwiLFwiICsgYnVmZmVyT2Zmc2V0ICsgXCIsXCIgKyBmb3JtYXQgKyBcIiRcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5jbGVhclZlcnRleEJ1ZmZlckF0LCBpbmRleCArIE9wQ29kZXMuaW50TWFzaykpO1xuXHRcdH1cblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIHNldENvbG9yTWFzayhyZWQ6Ym9vbGVhbiwgZ3JlZW46Ym9vbGVhbiwgYmx1ZTpib29sZWFuLCBhbHBoYTpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnNldENvbG9yTWFzaywgcmVkPyBPcENvZGVzLnRydWVWYWx1ZSA6IE9wQ29kZXMuZmFsc2VWYWx1ZSwgZ3JlZW4/IE9wQ29kZXMudHJ1ZVZhbHVlIDogT3BDb2Rlcy5mYWxzZVZhbHVlLCBibHVlPyBPcENvZGVzLnRydWVWYWx1ZSA6IE9wQ29kZXMuZmFsc2VWYWx1ZSwgYWxwaGE/IE9wQ29kZXMudHJ1ZVZhbHVlIDogT3BDb2Rlcy5mYWxzZVZhbHVlKSk7XG5cblx0XHRpZiAoQ29udGV4dFN0YWdlM0QuZGVidWcpXG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRCbGVuZEZhY3RvcnMoc291cmNlRmFjdG9yOnN0cmluZywgZGVzdGluYXRpb25GYWN0b3I6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnNldEJsZW5kRmFjdG9ycykgKyBzb3VyY2VGYWN0b3IgKyBcIiRcIiArIGRlc3RpbmF0aW9uRmFjdG9yICsgXCIkXCIpO1xuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyVG9UZXh0dXJlKHRhcmdldDpSZXNvdXJjZUJhc2VGbGFzaCwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4gPSBmYWxzZSwgYW50aUFsaWFzOm51bWJlciA9IDAsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0aWYgKHRhcmdldCA9PT0gbnVsbCB8fCB0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmNsZWFyUmVuZGVyVG9UZXh0dXJlKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5zZXRSZW5kZXJUb1RleHR1cmUsIGVuYWJsZURlcHRoQW5kU3RlbmNpbD8gT3BDb2Rlcy50cnVlVmFsdWUgOiBPcENvZGVzLmZhbHNlVmFsdWUpICsgdGFyZ2V0LmlkICsgXCIsXCIgKyAoYW50aUFsaWFzIHx8IDApICsgXCIsXCIpO1xuXHRcdH1cblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblxuXHRwdWJsaWMgc2V0UmVuZGVyVG9CYWNrQnVmZmVyKClcblx0e1xuXHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5jbGVhclJlbmRlclRvVGV4dHVyZSkpO1xuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgc2V0U2Npc3NvclJlY3RhbmdsZShyZWN0YW5nbGU6UmVjdGFuZ2xlKVxuXHR7XG5cdFx0aWYgKHJlY3RhbmdsZSkge1xuXHRcdFx0dGhpcy5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnNldFNjaXNzb3JSZWN0KSArIHJlY3RhbmdsZS54ICsgXCIsXCIgKyByZWN0YW5nbGUueSArIFwiLFwiICsgcmVjdGFuZ2xlLndpZHRoICsgXCIsXCIgKyByZWN0YW5nbGUuaGVpZ2h0ICsgXCIsXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuY2xlYXJTY2lzc29yUmVjdCkpO1xuXHRcdH1cblxuXHRcdGlmIChDb250ZXh0U3RhZ2UzRC5kZWJ1Zylcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIHNldERlcHRoVGVzdChkZXB0aE1hc2s6Ym9vbGVhbiwgcGFzc0NvbXBhcmVNb2RlOnN0cmluZylcblx0e1xuXHRcdHRoaXMuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5zZXREZXB0aFRlc3QsIGRlcHRoTWFzaz8gT3BDb2Rlcy50cnVlVmFsdWUgOiBPcENvZGVzLmZhbHNlVmFsdWUpICsgcGFzc0NvbXBhcmVNb2RlICsgXCIkXCIpO1xuXG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmRlYnVnKVxuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fY29udGFpbmVyID09IG51bGwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRjb25zb2xlLmxvZyhcIkNvbnRleHQzRCBkaXNwb3NlLCByZWxlYXNpbmcgXCIgKyB0aGlzLl9yZXNvdXJjZXMubGVuZ3RoICsgXCIgcmVzb3VyY2VzLlwiKTtcblxuXHRcdHdoaWxlICh0aGlzLl9yZXNvdXJjZXMubGVuZ3RoKVxuXHRcdFx0dGhpcy5fcmVzb3VyY2VzWzBdLmRpc3Bvc2UoKTtcblxuXHRcdGlmICh0aGlzLl9jb250YWluZXIpIHtcblx0XHRcdC8vIGVuY29kZSBjb21tYW5kXG5cdFx0XHR0aGlzLmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuZGlzcG9zZUNvbnRleHQpKTtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0Ly9zd2ZvYmplY3QucmVtb3ZlU1dGKHRoaXMuX29sZENhbnZhcy5pZCk7XG5cdFx0XHRpZiAodGhpcy5fb2xkQ2FudmFzICYmIHRoaXMuX29sZFBhcmVudCkge1xuXHRcdFx0XHR0aGlzLl9vbGRQYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5fb2xkQ2FudmFzKTtcblx0XHRcdFx0dGhpcy5fb2xkUGFyZW50ID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5fb2xkQ2FudmFzID0gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBhZGRTdHJlYW0oc3RyZWFtOnN0cmluZylcblx0e1xuXHRcdHRoaXMuX2NtZFN0cmVhbSArPSBzdHJlYW07XG5cdH1cblxuXHRwdWJsaWMgZXhlY3V0ZSgpOm51bWJlclxuXHR7XG5cdFx0aWYgKENvbnRleHRTdGFnZTNELmxvZ1N0cmVhbSlcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2NtZFN0cmVhbSk7XG5cblx0XHR2YXIgcmVzdWx0Om51bWJlciA9IHRoaXMuX2NvbnRhaW5lcltcIkNhbGxGdW5jdGlvblwiXShcIjxpbnZva2UgbmFtZT1cXFwiZXhlY1N0YWdlM2RPcFN0cmVhbVxcXCIgcmV0dXJudHlwZT1cXFwiamF2YXNjcmlwdFxcXCI+PGFyZ3VtZW50cz48c3RyaW5nPlwiICsgdGhpcy5fY21kU3RyZWFtICsgXCI8L3N0cmluZz48L2FyZ3VtZW50cz48L2ludm9rZT5cIik7XG5cblx0XHRpZiAoTnVtYmVyKHJlc3VsdCkgPD0gLTMpXG5cdFx0XHR0aHJvdyBcIkV4ZWMgc3RyZWFtIGZhaWxlZFwiO1xuXG5cdFx0dGhpcy5fY21kU3RyZWFtID0gXCJcIjtcblxuXHRcdHJldHVybiBOdW1iZXIocmVzdWx0KTtcblx0fVxufVxuXG5leHBvcnQgPSBDb250ZXh0U3RhZ2UzRDtcblxuLyoqXG4qIGdsb2JhbCBmdW5jdGlvbiBmb3IgZmxhc2ggY2FsbGJhY2tcbiovXG5mdW5jdGlvbiBtb3VudGFpbl9qc19jb250ZXh0X2F2YWlsYWJsZShpZCwgZHJpdmVySW5mbylcbntcblx0dmFyIGN0eDpDb250ZXh0U3RhZ2UzRCA9IENvbnRleHRTdGFnZTNELmNvbnRleHRzW2lkXTtcblx0aWYgKGN0eC5faUNhbGxiYWNrKSB7XG5cdFx0Y3R4Ll9pRHJpdmVySW5mbyA9IGRyaXZlckluZm87XG5cdFx0Ly8gZ2V0IG91dCBvZiB0aGUgY3VycmVudCBKUyBzdGFjayBmcmFtZSBhbmQgY2FsbCBiYWNrIGZyb20gZmxhc2ggcGxheWVyXG5cdFx0dmFyIHRpbWVPdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0d2luZG93LmNsZWFyVGltZW91dCh0aW1lT3V0SWQpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y3R4Ll9pQ2FsbGJhY2soY3R4KTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJDYWxsYmFjayBmYWlsZWQgZHVyaW5nIGZsYXNoIGluaXRpYWxpemF0aW9uIHdpdGggJ1wiICsgZS50b1N0cmluZygpICsgXCInXCIpO1xuXHRcdFx0fVxuXHRcdH0sIDEpO1xuXHR9XG59XG4iLCJpbXBvcnQgQml0bWFwSW1hZ2UyRFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQml0bWFwSW1hZ2UyRFwiKTtcbmltcG9ydCBNYXRyaXgzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL01hdHJpeDNEXCIpO1xuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9SZWN0YW5nbGVcIik7XG5pbXBvcnQgQnl0ZUFycmF5XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9CeXRlQXJyYXlcIik7XG5cbmltcG9ydCBDb250ZXh0R0xCbGVuZEZhY3Rvclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTEJsZW5kRmFjdG9yXCIpO1xuaW1wb3J0IENvbnRleHRHTERyYXdNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMRHJhd01vZGVcIik7XG5pbXBvcnQgQ29udGV4dEdMQ2xlYXJNYXNrXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQ2xlYXJNYXNrXCIpO1xuaW1wb3J0IENvbnRleHRHTENvbXBhcmVNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMQ29tcGFyZU1vZGVcIik7XG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFByb2dyYW1UeXBlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMUHJvZ3JhbVR5cGVcIik7XG5pbXBvcnQgQ29udGV4dEdMU3RlbmNpbEFjdGlvblx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xTdGVuY2lsQWN0aW9uXCIpO1xuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGaWx0ZXJcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZpbHRlclwiKTtcbmltcG9ydCBDb250ZXh0R0xUcmlhbmdsZUZhY2VcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVHJpYW5nbGVGYWNlXCIpO1xuaW1wb3J0IENvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0XCIpO1xuaW1wb3J0IENvbnRleHRHTFdyYXBNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMV3JhcE1vZGVcIik7XG5pbXBvcnQgQ3ViZVRleHR1cmVXZWJHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ3ViZVRleHR1cmVXZWJHTFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHQgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJbmRleEJ1ZmZlcldlYkdMXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JbmRleEJ1ZmZlcldlYkdMXCIpO1xuaW1wb3J0IFByb2dyYW1XZWJHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Qcm9ncmFtV2ViR0xcIik7XG5pbXBvcnQgVGV4dHVyZUJhc2VXZWJHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZUJhc2VXZWJHTFwiKTtcbmltcG9ydCBUZXh0dXJlV2ViR0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZVdlYkdMXCIpO1xuaW1wb3J0IFNhbXBsZXJTdGF0ZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TYW1wbGVyU3RhdGVcIik7XG5pbXBvcnQgVmVydGV4QnVmZmVyV2ViR0xcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9WZXJ0ZXhCdWZmZXJXZWJHTFwiKTtcblxuY2xhc3MgQ29udGV4dFdlYkdMIGltcGxlbWVudHMgSUNvbnRleHRHTFxue1xuXHRwcml2YXRlIF9ibGVuZEZhY3RvckRpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9kcmF3TW9kZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9jb21wYXJlTW9kZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX3RleHR1cmVJbmRleERpY3Rpb25hcnk6QXJyYXk8bnVtYmVyPiA9IG5ldyBBcnJheTxudW1iZXI+KDgpO1xuXHRwcml2YXRlIF90ZXh0dXJlVHlwZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF93cmFwRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX2ZpbHRlckRpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9taXBtYXBGaWx0ZXJEaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfdW5pZm9ybUxvY2F0aW9uTmFtZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF92ZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cblx0cHJpdmF0ZSBfY29udGFpbmVyOkhUTUxFbGVtZW50O1xuXHRwcml2YXRlIF93aWR0aDpudW1iZXI7XG5cdHByaXZhdGUgX2hlaWdodDpudW1iZXI7XG5cdHByaXZhdGUgX2RyYXdpbmc6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYmxlbmRFbmFibGVkOmJvb2xlYW47XG5cdHByaXZhdGUgX2JsZW5kU291cmNlRmFjdG9yOm51bWJlcjtcblx0cHJpdmF0ZSBfYmxlbmREZXN0aW5hdGlvbkZhY3RvcjpudW1iZXI7XG5cblx0cHJpdmF0ZSBfc3RhbmRhcmREZXJpdmF0aXZlczpib29sZWFuO1xuXG5cdHByaXZhdGUgX2luZGV4QnVmZmVyTGlzdDpBcnJheTxJbmRleEJ1ZmZlcldlYkdMPiA9IG5ldyBBcnJheTxJbmRleEJ1ZmZlcldlYkdMPigpO1xuXHRwcml2YXRlIF92ZXJ0ZXhCdWZmZXJMaXN0OkFycmF5PFZlcnRleEJ1ZmZlcldlYkdMPiA9IG5ldyBBcnJheTxWZXJ0ZXhCdWZmZXJXZWJHTD4oKTtcblx0cHJpdmF0ZSBfdGV4dHVyZUxpc3Q6QXJyYXk8VGV4dHVyZUJhc2VXZWJHTD4gPSBuZXcgQXJyYXk8VGV4dHVyZUJhc2VXZWJHTD4oKTtcblx0cHJpdmF0ZSBfcHJvZ3JhbUxpc3Q6QXJyYXk8UHJvZ3JhbVdlYkdMPiA9IG5ldyBBcnJheTxQcm9ncmFtV2ViR0w+KCk7XG5cblx0cHJpdmF0ZSBfc2FtcGxlclN0YXRlczpBcnJheTxTYW1wbGVyU3RhdGU+ID0gbmV3IEFycmF5PFNhbXBsZXJTdGF0ZT4oOCk7XG5cblx0cHVibGljIHN0YXRpYyBNQVhfU0FNUExFUlM6bnVtYmVyID0gODtcblxuXHQvL0Bwcm90ZWN0ZWRcblx0cHVibGljIF9nbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG5cblx0Ly9AcHJvdGVjdGVkXG5cdHB1YmxpYyBfY3VycmVudFByb2dyYW06UHJvZ3JhbVdlYkdMO1xuXHRwcml2YXRlIF9hY3RpdmVUZXh0dXJlOm51bWJlcjtcblxuICAgIHByaXZhdGUgX3N0ZW5jaWxDb21wYXJlTW9kZTpudW1iZXI7XG4gICAgcHJpdmF0ZSBfc3RlbmNpbENvbXBhcmVNb2RlQmFjazpudW1iZXI7XG4gICAgcHJpdmF0ZSBfc3RlbmNpbENvbXBhcmVNb2RlRnJvbnQ6bnVtYmVyO1xuICAgIHByaXZhdGUgX3N0ZW5jaWxSZWZlcmVuY2VWYWx1ZSA6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfc3RlbmNpbFJlYWRNYXNrIDogbnVtYmVyID0gMHhmZjtcbiAgICBwcml2YXRlIF9zZXBhcmF0ZVN0ZW5jaWwgOiBib29sZWFuID0gZmFsc2U7XG5cblxuXHRwdWJsaWMgZ2V0IGNvbnRhaW5lcigpOkhUTUxFbGVtZW50XG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuXHR9XG5cdHB1YmxpYyBnZXQgc3RhbmRhcmREZXJpdmF0aXZlcygpOmJvb2xlYW5cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zdGFuZGFyZERlcml2YXRpdmVzO1xuXHR9XG5cdGNvbnN0cnVjdG9yKGNhbnZhczpIVE1MQ2FudmFzRWxlbWVudClcblx0e1xuXHRcdHRoaXMuX2NvbnRhaW5lciA9IGNhbnZhcztcblxuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLl9nbCA9IDxXZWJHTFJlbmRlcmluZ0NvbnRleHQ+IGNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIsIHsgcHJlbXVsdGlwbGllZEFscGhhOmZhbHNlLCBhbHBoYTpmYWxzZSwgc3RlbmNpbDp0cnVlIH0pO1xuXG5cdFx0XHRpZiAoIXRoaXMuX2dsKVxuXHRcdFx0XHR0aGlzLl9nbCA9IDxXZWJHTFJlbmRlcmluZ0NvbnRleHQ+IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2xcIiwgeyBwcmVtdWx0aXBsaWVkQWxwaGE6ZmFsc2UsIGFscGhhOmZhbHNlLCBzdGVuY2lsOnRydWUgfSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Ly90aGlzLmRpc3BhdGNoRXZlbnQoIG5ldyBhd2F5LmV2ZW50cy5Bd2F5RXZlbnQoIGF3YXkuZXZlbnRzLkF3YXlFdmVudC5JTklUSUFMSVpFX0ZBSUxFRCwgZSApICk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2dsKSB7XG5cdFx0XHQvL3RoaXMuZGlzcGF0Y2hFdmVudCggbmV3IGF3YXkuZXZlbnRzLkF3YXlFdmVudCggYXdheS5ldmVudHMuQXdheUV2ZW50LklOSVRJQUxJWkVfU1VDQ0VTUyApICk7XG5cblx0XHRcdGlmKHRoaXMuX2dsLmdldEV4dGVuc2lvbihcIk9FU19zdGFuZGFyZF9kZXJpdmF0aXZlc1wiKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fc3RhbmRhcmREZXJpdmF0aXZlcyA9IHRydWU7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5fc3RhbmRhcmREZXJpdmF0aXZlcyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NldHVwIHNob3J0Y3V0IGRpY3Rpb25hcmllc1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLk9ORV0gPSB0aGlzLl9nbC5PTkU7XG5cdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRpY3Rpb25hcnlbQ29udGV4dEdMQmxlbmRGYWN0b3IuREVTVElOQVRJT05fQUxQSEFdID0gdGhpcy5fZ2wuRFNUX0FMUEhBO1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLkRFU1RJTkFUSU9OX0NPTE9SXSA9IHRoaXMuX2dsLkRTVF9DT0xPUjtcblx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGljdGlvbmFyeVtDb250ZXh0R0xCbGVuZEZhY3Rvci5PTkVdID0gdGhpcy5fZ2wuT05FO1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLk9ORV9NSU5VU19ERVNUSU5BVElPTl9BTFBIQV0gPSB0aGlzLl9nbC5PTkVfTUlOVVNfRFNUX0FMUEhBO1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLk9ORV9NSU5VU19ERVNUSU5BVElPTl9DT0xPUl0gPSB0aGlzLl9nbC5PTkVfTUlOVVNfRFNUX0NPTE9SO1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLk9ORV9NSU5VU19TT1VSQ0VfQUxQSEFdID0gdGhpcy5fZ2wuT05FX01JTlVTX1NSQ19BTFBIQTtcblx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGljdGlvbmFyeVtDb250ZXh0R0xCbGVuZEZhY3Rvci5PTkVfTUlOVVNfU09VUkNFX0NPTE9SXSA9IHRoaXMuX2dsLk9ORV9NSU5VU19TUkNfQ09MT1I7XG5cdFx0XHR0aGlzLl9ibGVuZEZhY3RvckRpY3Rpb25hcnlbQ29udGV4dEdMQmxlbmRGYWN0b3IuU09VUkNFX0FMUEhBXSA9IHRoaXMuX2dsLlNSQ19BTFBIQTtcblx0XHRcdHRoaXMuX2JsZW5kRmFjdG9yRGljdGlvbmFyeVtDb250ZXh0R0xCbGVuZEZhY3Rvci5TT1VSQ0VfQ09MT1JdID0gdGhpcy5fZ2wuU1JDX0NPTE9SO1xuXHRcdFx0dGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W0NvbnRleHRHTEJsZW5kRmFjdG9yLlpFUk9dID0gdGhpcy5fZ2wuWkVSTztcblxuXHRcdFx0dGhpcy5fZHJhd01vZGVEaWN0aW9uYXJ5W0NvbnRleHRHTERyYXdNb2RlLkxJTkVTXSA9IHRoaXMuX2dsLkxJTkVTO1xuXHRcdFx0dGhpcy5fZHJhd01vZGVEaWN0aW9uYXJ5W0NvbnRleHRHTERyYXdNb2RlLlRSSUFOR0xFU10gPSB0aGlzLl9nbC5UUklBTkdMRVM7XG5cbiAgICAgICAgICAgIHRoaXMuX2NvbXBhcmVNb2RlRGljdGlvbmFyeVtDb250ZXh0R0xDb21wYXJlTW9kZS5BTFdBWVNdID0gdGhpcy5fZ2wuQUxXQVlTO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZU1vZGVEaWN0aW9uYXJ5W0NvbnRleHRHTENvbXBhcmVNb2RlLkVRVUFMXSA9IHRoaXMuX2dsLkVRVUFMO1xuICAgICAgICAgICAgdGhpcy5fY29tcGFyZU1vZGVEaWN0aW9uYXJ5W0NvbnRleHRHTENvbXBhcmVNb2RlLkdSRUFURVJdID0gdGhpcy5fZ2wuR1JFQVRFUjtcblx0XHRcdHRoaXMuX2NvbXBhcmVNb2RlRGljdGlvbmFyeVtDb250ZXh0R0xDb21wYXJlTW9kZS5HUkVBVEVSX0VRVUFMXSA9IHRoaXMuX2dsLkdFUVVBTDtcblx0XHRcdHRoaXMuX2NvbXBhcmVNb2RlRGljdGlvbmFyeVtDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTXSA9IHRoaXMuX2dsLkxFU1M7XG5cdFx0XHR0aGlzLl9jb21wYXJlTW9kZURpY3Rpb25hcnlbQ29udGV4dEdMQ29tcGFyZU1vZGUuTEVTU19FUVVBTF0gPSB0aGlzLl9nbC5MRVFVQUw7XG5cdFx0XHR0aGlzLl9jb21wYXJlTW9kZURpY3Rpb25hcnlbQ29udGV4dEdMQ29tcGFyZU1vZGUuTkVWRVJdID0gdGhpcy5fZ2wuTkVWRVI7XG5cdFx0XHR0aGlzLl9jb21wYXJlTW9kZURpY3Rpb25hcnlbQ29udGV4dEdMQ29tcGFyZU1vZGUuTk9UX0VRVUFMXSA9IHRoaXMuX2dsLk5PVEVRVUFMO1xuXG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVtDb250ZXh0R0xTdGVuY2lsQWN0aW9uLkRFQ1JFTUVOVF9TQVRVUkFURV0gPSB0aGlzLl9nbC5ERUNSO1xuICAgICAgICAgICAgdGhpcy5fc3RlbmNpbEFjdGlvbkRpY3Rpb25hcnlbQ29udGV4dEdMU3RlbmNpbEFjdGlvbi5ERUNSRU1FTlRfV1JBUF0gPSB0aGlzLl9nbC5ERUNSX1dSQVA7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVtDb250ZXh0R0xTdGVuY2lsQWN0aW9uLklOQ1JFTUVOVF9TQVRVUkFURV0gPSB0aGlzLl9nbC5JTkNSO1xuICAgICAgICAgICAgdGhpcy5fc3RlbmNpbEFjdGlvbkRpY3Rpb25hcnlbQ29udGV4dEdMU3RlbmNpbEFjdGlvbi5JTkNSRU1FTlRfV1JBUF0gPSB0aGlzLl9nbC5JTkNSX1dSQVA7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVtDb250ZXh0R0xTdGVuY2lsQWN0aW9uLklOVkVSVF0gPSB0aGlzLl9nbC5JTlZFUlQ7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVtDb250ZXh0R0xTdGVuY2lsQWN0aW9uLktFRVBdID0gdGhpcy5fZ2wuS0VFUDtcbiAgICAgICAgICAgIHRoaXMuX3N0ZW5jaWxBY3Rpb25EaWN0aW9uYXJ5W0NvbnRleHRHTFN0ZW5jaWxBY3Rpb24uU0VUXSA9IHRoaXMuX2dsLlJFUExBQ0U7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVtDb250ZXh0R0xTdGVuY2lsQWN0aW9uLlpFUk9dID0gdGhpcy5fZ2wuWkVSTztcblxuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVswXSA9IHRoaXMuX2dsLlRFWFRVUkUwO1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVsxXSA9IHRoaXMuX2dsLlRFWFRVUkUxO1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVsyXSA9IHRoaXMuX2dsLlRFWFRVUkUyO1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVszXSA9IHRoaXMuX2dsLlRFWFRVUkUzO1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVs0XSA9IHRoaXMuX2dsLlRFWFRVUkU0O1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVs1XSA9IHRoaXMuX2dsLlRFWFRVUkU1O1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVs2XSA9IHRoaXMuX2dsLlRFWFRVUkU2O1xuXHRcdFx0dGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVs3XSA9IHRoaXMuX2dsLlRFWFRVUkU3O1xuXG5cdFx0XHR0aGlzLl90ZXh0dXJlVHlwZURpY3Rpb25hcnlbXCJ0ZXh0dXJlMmRcIl0gPSB0aGlzLl9nbC5URVhUVVJFXzJEO1xuXHRcdFx0dGhpcy5fdGV4dHVyZVR5cGVEaWN0aW9uYXJ5W1widGV4dHVyZUN1YmVcIl0gPSB0aGlzLl9nbC5URVhUVVJFX0NVQkVfTUFQO1xuXG5cdFx0XHR0aGlzLl93cmFwRGljdGlvbmFyeVtDb250ZXh0R0xXcmFwTW9kZS5SRVBFQVRdID0gdGhpcy5fZ2wuUkVQRUFUO1xuXHRcdFx0dGhpcy5fd3JhcERpY3Rpb25hcnlbQ29udGV4dEdMV3JhcE1vZGUuQ0xBTVBdID0gdGhpcy5fZ2wuQ0xBTVBfVE9fRURHRTtcblxuXHRcdFx0dGhpcy5fZmlsdGVyRGljdGlvbmFyeVtDb250ZXh0R0xUZXh0dXJlRmlsdGVyLkxJTkVBUl0gPSB0aGlzLl9nbC5MSU5FQVI7XG5cdFx0XHR0aGlzLl9maWx0ZXJEaWN0aW9uYXJ5W0NvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVF0gPSB0aGlzLl9nbC5ORUFSRVNUO1xuXG5cdFx0XHR0aGlzLl9taXBtYXBGaWx0ZXJEaWN0aW9uYXJ5W0NvbnRleHRHTFRleHR1cmVGaWx0ZXIuTElORUFSXSA9IG5ldyBPYmplY3QoKTtcblx0XHRcdHRoaXMuX21pcG1hcEZpbHRlckRpY3Rpb25hcnlbQ29udGV4dEdMVGV4dHVyZUZpbHRlci5MSU5FQVJdW0NvbnRleHRHTE1pcEZpbHRlci5NSVBORUFSRVNUXSA9IHRoaXMuX2dsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVDtcblx0XHRcdHRoaXMuX21pcG1hcEZpbHRlckRpY3Rpb25hcnlbQ29udGV4dEdMVGV4dHVyZUZpbHRlci5MSU5FQVJdW0NvbnRleHRHTE1pcEZpbHRlci5NSVBMSU5FQVJdID0gdGhpcy5fZ2wuTElORUFSX01JUE1BUF9MSU5FQVI7XG5cdFx0XHR0aGlzLl9taXBtYXBGaWx0ZXJEaWN0aW9uYXJ5W0NvbnRleHRHTFRleHR1cmVGaWx0ZXIuTElORUFSXVtDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTk9ORV0gPSB0aGlzLl9nbC5MSU5FQVI7XG5cdFx0XHR0aGlzLl9taXBtYXBGaWx0ZXJEaWN0aW9uYXJ5W0NvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVF0gPSBuZXcgT2JqZWN0KCk7XG5cdFx0XHR0aGlzLl9taXBtYXBGaWx0ZXJEaWN0aW9uYXJ5W0NvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVF1bQ29udGV4dEdMTWlwRmlsdGVyLk1JUE5FQVJFU1RdID0gdGhpcy5fZ2wuTkVBUkVTVF9NSVBNQVBfTkVBUkVTVDtcblx0XHRcdHRoaXMuX21pcG1hcEZpbHRlckRpY3Rpb25hcnlbQ29udGV4dEdMVGV4dHVyZUZpbHRlci5ORUFSRVNUXVtDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTElORUFSXSA9IHRoaXMuX2dsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUjtcblx0XHRcdHRoaXMuX21pcG1hcEZpbHRlckRpY3Rpb25hcnlbQ29udGV4dEdMVGV4dHVyZUZpbHRlci5ORUFSRVNUXVtDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTk9ORV0gPSB0aGlzLl9nbC5ORUFSRVNUO1xuXG5cdFx0XHR0aGlzLl91bmlmb3JtTG9jYXRpb25OYW1lRGljdGlvbmFyeVtDb250ZXh0R0xQcm9ncmFtVHlwZS5WRVJURVhdID0gXCJ2Y1wiO1xuXHRcdFx0dGhpcy5fdW5pZm9ybUxvY2F0aW9uTmFtZURpY3Rpb25hcnlbQ29udGV4dEdMUHJvZ3JhbVR5cGUuRlJBR01FTlRdID0gXCJmY1wiO1xuXG5cdFx0XHR0aGlzLl92ZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzRGljdGlvbmFyeVtDb250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXQuRkxPQVRfMV0gPSBuZXcgVmVydGV4QnVmZmVyUHJvcGVydGllcygxLCB0aGlzLl9nbC5GTE9BVCwgZmFsc2UpO1xuXHRcdFx0dGhpcy5fdmVydGV4QnVmZmVyUHJvcGVydGllc0RpY3Rpb25hcnlbQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LkZMT0FUXzJdID0gbmV3IFZlcnRleEJ1ZmZlclByb3BlcnRpZXMoMiwgdGhpcy5fZ2wuRkxPQVQsIGZhbHNlKTtcblx0XHRcdHRoaXMuX3ZlcnRleEJ1ZmZlclByb3BlcnRpZXNEaWN0aW9uYXJ5W0NvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdC5GTE9BVF8zXSA9IG5ldyBWZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzKDMsIHRoaXMuX2dsLkZMT0FULCBmYWxzZSk7XG5cdFx0XHR0aGlzLl92ZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzRGljdGlvbmFyeVtDb250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXQuRkxPQVRfNF0gPSBuZXcgVmVydGV4QnVmZmVyUHJvcGVydGllcyg0LCB0aGlzLl9nbC5GTE9BVCwgZmFsc2UpO1xuXHRcdFx0dGhpcy5fdmVydGV4QnVmZmVyUHJvcGVydGllc0RpY3Rpb25hcnlbQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LkJZVEVTXzRdID0gbmV3IFZlcnRleEJ1ZmZlclByb3BlcnRpZXMoNCwgdGhpcy5fZ2wuVU5TSUdORURfQllURSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0ZW5jaWxDb21wYXJlTW9kZSA9IHRoaXMuX2dsLkFMV0FZUztcbiAgICAgICAgICAgIHRoaXMuX3N0ZW5jaWxDb21wYXJlTW9kZUJhY2sgPSB0aGlzLl9nbC5BTFdBWVM7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQ29tcGFyZU1vZGVGcm9udCA9IHRoaXMuX2dsLkFMV0FZUztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly90aGlzLmRpc3BhdGNoRXZlbnQoIG5ldyBhd2F5LmV2ZW50cy5Bd2F5RXZlbnQoIGF3YXkuZXZlbnRzLkF3YXlFdmVudC5JTklUSUFMSVpFX0ZBSUxFRCwgZSApICk7XG5cdFx0XHRhbGVydChcIldlYkdMIGlzIG5vdCBhdmFpbGFibGUuXCIpO1xuXHRcdH1cblxuXHRcdC8vZGVmYXVsdHNcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBDb250ZXh0V2ViR0wuTUFYX1NBTVBMRVJTOyArK2kpIHtcblx0XHRcdHRoaXMuX3NhbXBsZXJTdGF0ZXNbaV0gPSBuZXcgU2FtcGxlclN0YXRlKCk7XG5cdFx0XHR0aGlzLl9zYW1wbGVyU3RhdGVzW2ldLndyYXAgPSB0aGlzLl9nbC5SRVBFQVQ7XG5cdFx0XHR0aGlzLl9zYW1wbGVyU3RhdGVzW2ldLmZpbHRlciA9IHRoaXMuX2dsLkxJTkVBUjtcblx0XHRcdHRoaXMuX3NhbXBsZXJTdGF0ZXNbaV0ubWlwZmlsdGVyID0gdGhpcy5fZ2wuTElORUFSO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnbCgpOldlYkdMUmVuZGVyaW5nQ29udGV4dFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2dsO1xuXHR9XG5cblx0cHVibGljIGNsZWFyKHJlZDpudW1iZXIgPSAwLCBncmVlbjpudW1iZXIgPSAwLCBibHVlOm51bWJlciA9IDAsIGFscGhhOm51bWJlciA9IDEsIGRlcHRoOm51bWJlciA9IDEsIHN0ZW5jaWw6bnVtYmVyID0gMCwgbWFzazpudW1iZXIgPSBDb250ZXh0R0xDbGVhck1hc2suQUxMKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9kcmF3aW5nKSB7XG5cdFx0XHR0aGlzLnVwZGF0ZUJsZW5kU3RhdHVzKCk7XG5cdFx0XHR0aGlzLl9kcmF3aW5nID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR2YXIgZ2xtYXNrOm51bWJlciA9IDA7XG5cdFx0aWYgKG1hc2sgJiBDb250ZXh0R0xDbGVhck1hc2suQ09MT1IpIGdsbWFzayB8PSB0aGlzLl9nbC5DT0xPUl9CVUZGRVJfQklUO1xuXHRcdGlmIChtYXNrICYgQ29udGV4dEdMQ2xlYXJNYXNrLlNURU5DSUwpIGdsbWFzayB8PSB0aGlzLl9nbC5TVEVOQ0lMX0JVRkZFUl9CSVQ7XG5cdFx0aWYgKG1hc2sgJiBDb250ZXh0R0xDbGVhck1hc2suREVQVEgpIGdsbWFzayB8PSB0aGlzLl9nbC5ERVBUSF9CVUZGRVJfQklUO1xuXG5cdFx0dGhpcy5fZ2wuY2xlYXJDb2xvcihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSk7XG5cdFx0dGhpcy5fZ2wuY2xlYXJEZXB0aChkZXB0aCk7XG5cdFx0dGhpcy5fZ2wuY2xlYXJTdGVuY2lsKHN0ZW5jaWwpO1xuXHRcdHRoaXMuX2dsLmNsZWFyKGdsbWFzayk7XG5cdH1cblxuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcih3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXIsIGFudGlBbGlhczpudW1iZXIsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gdHJ1ZSlcblx0e1xuXHRcdHRoaXMuX3dpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG5cdFx0aWYgKGVuYWJsZURlcHRoQW5kU3RlbmNpbCkge1xuXHRcdFx0dGhpcy5fZ2wuZW5hYmxlKHRoaXMuX2dsLlNURU5DSUxfVEVTVCk7XG5cdFx0XHR0aGlzLl9nbC5lbmFibGUodGhpcy5fZ2wuREVQVEhfVEVTVCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fZ2wudmlld3BvcnRbJ3dpZHRoJ10gPSB3aWR0aDtcblx0XHR0aGlzLl9nbC52aWV3cG9ydFsnaGVpZ2h0J10gPSBoZWlnaHQ7XG5cblx0XHR0aGlzLl9nbC52aWV3cG9ydCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblx0fVxuXG5cdHB1YmxpYyBjcmVhdGVDdWJlVGV4dHVyZShzaXplOm51bWJlciwgZm9ybWF0OnN0cmluZywgb3B0aW1pemVGb3JSZW5kZXJUb1RleHR1cmU6Ym9vbGVhbiwgc3RyZWFtaW5nTGV2ZWxzOm51bWJlciA9IDApOkN1YmVUZXh0dXJlV2ViR0xcblx0e1xuXHRcdHZhciB0ZXh0dXJlOkN1YmVUZXh0dXJlV2ViR0wgPSBuZXcgQ3ViZVRleHR1cmVXZWJHTCh0aGlzLl9nbCwgc2l6ZSk7XG5cdFx0dGhpcy5fdGV4dHVyZUxpc3QucHVzaCh0ZXh0dXJlKTtcblx0XHRyZXR1cm4gdGV4dHVyZTtcblx0fVxuXG5cdHB1YmxpYyBjcmVhdGVJbmRleEJ1ZmZlcihudW1JbmRpY2VzOm51bWJlcik6SW5kZXhCdWZmZXJXZWJHTFxuXHR7XG5cdFx0dmFyIGluZGV4QnVmZmVyOkluZGV4QnVmZmVyV2ViR0wgPSBuZXcgSW5kZXhCdWZmZXJXZWJHTCh0aGlzLl9nbCwgbnVtSW5kaWNlcyk7XG5cdFx0dGhpcy5faW5kZXhCdWZmZXJMaXN0LnB1c2goaW5kZXhCdWZmZXIpO1xuXHRcdHJldHVybiBpbmRleEJ1ZmZlcjtcblx0fVxuXG5cdHB1YmxpYyBjcmVhdGVQcm9ncmFtKCk6UHJvZ3JhbVdlYkdMXG5cdHtcblx0XHR2YXIgcHJvZ3JhbTpQcm9ncmFtV2ViR0wgPSBuZXcgUHJvZ3JhbVdlYkdMKHRoaXMuX2dsKTtcblx0XHR0aGlzLl9wcm9ncmFtTGlzdC5wdXNoKHByb2dyYW0pO1xuXHRcdHJldHVybiBwcm9ncmFtO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZVRleHR1cmUod2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nLCBvcHRpbWl6ZUZvclJlbmRlclRvVGV4dHVyZTpib29sZWFuLCBzdHJlYW1pbmdMZXZlbHM6bnVtYmVyID0gMCk6VGV4dHVyZVdlYkdMXG5cdHtcblx0XHQvL1RPRE8gc3RyZWFtaW5nXG5cdFx0dmFyIHRleHR1cmU6VGV4dHVyZVdlYkdMID0gbmV3IFRleHR1cmVXZWJHTCh0aGlzLl9nbCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0dGhpcy5fdGV4dHVyZUxpc3QucHVzaCh0ZXh0dXJlKTtcblx0XHRyZXR1cm4gdGV4dHVyZTtcblx0fVxuXG5cdHB1YmxpYyBjcmVhdGVWZXJ0ZXhCdWZmZXIobnVtVmVydGljZXM6bnVtYmVyLCBkYXRhUGVyVmVydGV4Om51bWJlcik6VmVydGV4QnVmZmVyV2ViR0xcblx0e1xuXHRcdHZhciB2ZXJ0ZXhCdWZmZXI6VmVydGV4QnVmZmVyV2ViR0wgPSBuZXcgVmVydGV4QnVmZmVyV2ViR0wodGhpcy5fZ2wsIG51bVZlcnRpY2VzLCBkYXRhUGVyVmVydGV4KTtcblx0XHR0aGlzLl92ZXJ0ZXhCdWZmZXJMaXN0LnB1c2godmVydGV4QnVmZmVyKTtcblx0XHRyZXR1cm4gdmVydGV4QnVmZmVyO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyO1xuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLl9pbmRleEJ1ZmZlckxpc3QubGVuZ3RoOyArK2kpXG5cdFx0XHR0aGlzLl9pbmRleEJ1ZmZlckxpc3RbaV0uZGlzcG9zZSgpO1xuXG5cdFx0dGhpcy5faW5kZXhCdWZmZXJMaXN0ID0gbnVsbDtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLl92ZXJ0ZXhCdWZmZXJMaXN0Lmxlbmd0aDsgKytpKVxuXHRcdFx0dGhpcy5fdmVydGV4QnVmZmVyTGlzdFtpXS5kaXNwb3NlKCk7XG5cblx0XHR0aGlzLl92ZXJ0ZXhCdWZmZXJMaXN0ID0gbnVsbDtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLl90ZXh0dXJlTGlzdC5sZW5ndGg7ICsraSlcblx0XHRcdHRoaXMuX3RleHR1cmVMaXN0W2ldLmRpc3Bvc2UoKTtcblxuXHRcdHRoaXMuX3RleHR1cmVMaXN0ID0gbnVsbDtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLl9wcm9ncmFtTGlzdC5sZW5ndGg7ICsraSlcblx0XHRcdHRoaXMuX3Byb2dyYW1MaXN0W2ldLmRpc3Bvc2UoKTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLl9zYW1wbGVyU3RhdGVzLmxlbmd0aDsgKytpKVxuXHRcdFx0dGhpcy5fc2FtcGxlclN0YXRlc1tpXSA9IG51bGw7XG5cblx0XHR0aGlzLl9wcm9ncmFtTGlzdCA9IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgZHJhd1RvQml0bWFwSW1hZ2UyRChkZXN0aW5hdGlvbjpCaXRtYXBJbWFnZTJEKVxuXHR7XG5cdFx0dmFyIGFycmF5QnVmZmVyOkFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGRlc3RpbmF0aW9uLndpZHRoKmRlc3RpbmF0aW9uLmhlaWdodCo0KTtcblxuXHRcdHRoaXMuX2dsLnJlYWRQaXhlbHMoMCwgMCwgZGVzdGluYXRpb24ud2lkdGgsIGRlc3RpbmF0aW9uLmhlaWdodCwgdGhpcy5fZ2wuUkdCQSwgdGhpcy5fZ2wuVU5TSUdORURfQllURSwgbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtcblxuXHRcdHZhciBieXRlQXJyYXk6Qnl0ZUFycmF5ID0gbmV3IEJ5dGVBcnJheSgpO1xuXHRcdGJ5dGVBcnJheS5zZXRBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcik7XG5cblx0XHRkZXN0aW5hdGlvbi5zZXRQaXhlbHMobmV3IFJlY3RhbmdsZSgwLCAwLCBkZXN0aW5hdGlvbi53aWR0aCwgZGVzdGluYXRpb24uaGVpZ2h0KSwgYnl0ZUFycmF5KTtcblx0fVxuXG5cdHB1YmxpYyBkcmF3SW5kaWNlcyhtb2RlOnN0cmluZywgaW5kZXhCdWZmZXI6SW5kZXhCdWZmZXJXZWJHTCwgZmlyc3RJbmRleDpudW1iZXIgPSAwLCBudW1JbmRpY2VzOm51bWJlciA9IC0xKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9kcmF3aW5nKVxuXHRcdFx0dGhyb3cgXCJOZWVkIHRvIGNsZWFyIGJlZm9yZSBkcmF3aW5nIGlmIHRoZSBidWZmZXIgaGFzIG5vdCBiZWVuIGNsZWFyZWQgc2luY2UgdGhlIGxhc3QgcHJlc2VudCgpIGNhbGwuXCI7XG5cblxuXHRcdHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyLmdsQnVmZmVyKTtcblx0XHR0aGlzLl9nbC5kcmF3RWxlbWVudHModGhpcy5fZHJhd01vZGVEaWN0aW9uYXJ5W21vZGVdLCAobnVtSW5kaWNlcyA9PSAtMSk/IGluZGV4QnVmZmVyLm51bUluZGljZXMgOiBudW1JbmRpY2VzLCB0aGlzLl9nbC5VTlNJR05FRF9TSE9SVCwgZmlyc3RJbmRleCoyKTtcblx0fVxuXG5cdHB1YmxpYyBkcmF3VmVydGljZXMobW9kZTpzdHJpbmcsIGZpcnN0VmVydGV4Om51bWJlciA9IDAsIG51bVZlcnRpY2VzOm51bWJlciA9IC0xKVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9kcmF3aW5nKVxuXHRcdFx0dGhyb3cgXCJOZWVkIHRvIGNsZWFyIGJlZm9yZSBkcmF3aW5nIGlmIHRoZSBidWZmZXIgaGFzIG5vdCBiZWVuIGNsZWFyZWQgc2luY2UgdGhlIGxhc3QgcHJlc2VudCgpIGNhbGwuXCI7XG5cblx0XHR0aGlzLl9nbC5kcmF3QXJyYXlzKHRoaXMuX2RyYXdNb2RlRGljdGlvbmFyeVttb2RlXSwgZmlyc3RWZXJ0ZXgsIG51bVZlcnRpY2VzKTtcblx0fVxuXG5cdHB1YmxpYyBwcmVzZW50KClcblx0e1xuXHRcdHRoaXMuX2RyYXdpbmcgPSBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBzZXRCbGVuZEZhY3RvcnMoc291cmNlRmFjdG9yOnN0cmluZywgZGVzdGluYXRpb25GYWN0b3I6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fYmxlbmRFbmFibGVkID0gdHJ1ZTtcblxuXHRcdHRoaXMuX2JsZW5kU291cmNlRmFjdG9yID0gdGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W3NvdXJjZUZhY3Rvcl07XG5cblx0XHR0aGlzLl9ibGVuZERlc3RpbmF0aW9uRmFjdG9yID0gdGhpcy5fYmxlbmRGYWN0b3JEaWN0aW9uYXJ5W2Rlc3RpbmF0aW9uRmFjdG9yXTtcblxuXHRcdHRoaXMudXBkYXRlQmxlbmRTdGF0dXMoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRDb2xvck1hc2socmVkOmJvb2xlYW4sIGdyZWVuOmJvb2xlYW4sIGJsdWU6Ym9vbGVhbiwgYWxwaGE6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuX2dsLmNvbG9yTWFzayhyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSk7XG5cdH1cblxuXHRwdWJsaWMgc2V0Q3VsbGluZyh0cmlhbmdsZUZhY2VUb0N1bGw6c3RyaW5nLCBjb29yZGluYXRlU3lzdGVtOnN0cmluZyA9IFwibGVmdEhhbmRlZFwiKVxuXHR7XG5cdFx0aWYgKHRyaWFuZ2xlRmFjZVRvQ3VsbCA9PSBDb250ZXh0R0xUcmlhbmdsZUZhY2UuTk9ORSkge1xuXHRcdFx0dGhpcy5fZ2wuZGlzYWJsZSh0aGlzLl9nbC5DVUxMX0ZBQ0UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9nbC5lbmFibGUodGhpcy5fZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLmN1bGxGYWNlKHRoaXMudHJhbnNsYXRlVHJpYW5nbGVGYWNlKHRyaWFuZ2xlRmFjZVRvQ3VsbCwgY29vcmRpbmF0ZVN5c3RlbSkpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE8gQ29udGV4dEdMQ29tcGFyZU1vZGVcblx0cHVibGljIHNldERlcHRoVGVzdChkZXB0aE1hc2s6Ym9vbGVhbiwgcGFzc0NvbXBhcmVNb2RlOnN0cmluZylcblx0e1xuXHRcdHRoaXMuX2dsLmRlcHRoRnVuYyh0aGlzLl9jb21wYXJlTW9kZURpY3Rpb25hcnlbcGFzc0NvbXBhcmVNb2RlXSk7XG5cblx0XHR0aGlzLl9nbC5kZXB0aE1hc2soZGVwdGhNYXNrKTtcblx0fVxuXG4gICAgcHVibGljIHNldFN0ZW5jaWxBY3Rpb25zKHRyaWFuZ2xlRmFjZTpzdHJpbmcgPSBcImZyb250QW5kQmFja1wiLCBjb21wYXJlTW9kZTpzdHJpbmcgPSBcImFsd2F5c1wiLCBhY3Rpb25PbkJvdGhQYXNzOnN0cmluZyA9IFwia2VlcFwiLCBhY3Rpb25PbkRlcHRoRmFpbDpzdHJpbmcgPSBcImtlZXBcIiwgYWN0aW9uT25EZXB0aFBhc3NTdGVuY2lsRmFpbDpzdHJpbmcgPSBcImtlZXBcIiwgY29vcmRpbmF0ZVN5c3RlbTpzdHJpbmcgPSBcImxlZnRIYW5kZWRcIilcbiAgICB7XG4gICAgICAgIHRoaXMuX3NlcGFyYXRlU3RlbmNpbCA9IHRyaWFuZ2xlRmFjZSAhPSBcImZyb250QW5kQmFja1wiO1xuXG4gICAgICAgIHZhciBjb21wYXJlTW9kZUdMID0gdGhpcy5fY29tcGFyZU1vZGVEaWN0aW9uYXJ5W2NvbXBhcmVNb2RlXTtcblxuICAgICAgICB2YXIgZmFpbCA9IHRoaXMuX3N0ZW5jaWxBY3Rpb25EaWN0aW9uYXJ5W2FjdGlvbk9uRGVwdGhQYXNzU3RlbmNpbEZhaWxdO1xuICAgICAgICB2YXIgekZhaWwgPSB0aGlzLl9zdGVuY2lsQWN0aW9uRGljdGlvbmFyeVthY3Rpb25PbkRlcHRoRmFpbF07XG4gICAgICAgIHZhciBwYXNzID0gdGhpcy5fc3RlbmNpbEFjdGlvbkRpY3Rpb25hcnlbYWN0aW9uT25Cb3RoUGFzc107XG5cbiAgICAgICAgaWYgKCF0aGlzLl9zZXBhcmF0ZVN0ZW5jaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0ZW5jaWxDb21wYXJlTW9kZSA9IGNvbXBhcmVNb2RlR0w7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsRnVuYyhjb21wYXJlTW9kZUdMLCB0aGlzLl9zdGVuY2lsUmVmZXJlbmNlVmFsdWUsIHRoaXMuX3N0ZW5jaWxSZWFkTWFzayk7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsT3AoZmFpbCwgekZhaWwsIHBhc3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRyaWFuZ2xlRmFjZSA9PSBcImJhY2tcIikge1xuICAgICAgICAgICAgdGhpcy5fc3RlbmNpbENvbXBhcmVNb2RlQmFjayA9IGNvbXBhcmVNb2RlR0w7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsRnVuY1NlcGFyYXRlKHRoaXMuX2dsLkJBQ0ssIGNvbXBhcmVNb2RlR0wsIHRoaXMuX3N0ZW5jaWxSZWZlcmVuY2VWYWx1ZSwgdGhpcy5fc3RlbmNpbFJlYWRNYXNrKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLnN0ZW5jaWxPcFNlcGFyYXRlKHRoaXMuX2dsLkJBQ0ssIGZhaWwsIHpGYWlsLCBwYXNzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0cmlhbmdsZUZhY2UgPT0gXCJmcm9udFwiKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGVuY2lsQ29tcGFyZU1vZGVGcm9udCA9IGNvbXBhcmVNb2RlR0w7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsRnVuY1NlcGFyYXRlKHRoaXMuX2dsLkZST05ULCBjb21wYXJlTW9kZUdMLCB0aGlzLl9zdGVuY2lsUmVmZXJlbmNlVmFsdWUsIHRoaXMuX3N0ZW5jaWxSZWFkTWFzayk7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsT3BTZXBhcmF0ZSh0aGlzLl9nbC5GUk9OVCwgZmFpbCwgekZhaWwsIHBhc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFN0ZW5jaWxSZWZlcmVuY2VWYWx1ZShyZWZlcmVuY2VWYWx1ZTpudW1iZXIsIHJlYWRNYXNrOm51bWJlciwgd3JpdGVNYXNrOm51bWJlcilcbiAgICB7XG4gICAgICAgIHRoaXMuX3N0ZW5jaWxSZWZlcmVuY2VWYWx1ZSA9IHJlZmVyZW5jZVZhbHVlO1xuICAgICAgICB0aGlzLl9zdGVuY2lsUmVhZE1hc2sgPSByZWFkTWFzaztcblxuICAgICAgICBpZiAodGhpcy5fc2VwYXJhdGVTdGVuY2lsKSB7XG4gICAgICAgICAgICB0aGlzLl9nbC5zdGVuY2lsRnVuY1NlcGFyYXRlKHRoaXMuX2dsLkZST05ULCB0aGlzLl9zdGVuY2lsQ29tcGFyZU1vZGVGcm9udCwgcmVmZXJlbmNlVmFsdWUsIHJlYWRNYXNrKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLnN0ZW5jaWxGdW5jU2VwYXJhdGUodGhpcy5fZ2wuQkFDSywgdGhpcy5fc3RlbmNpbENvbXBhcmVNb2RlQmFjaywgcmVmZXJlbmNlVmFsdWUsIHJlYWRNYXNrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2dsLnN0ZW5jaWxGdW5jKHRoaXMuX3N0ZW5jaWxDb21wYXJlTW9kZSwgcmVmZXJlbmNlVmFsdWUsIHJlYWRNYXNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dsLnN0ZW5jaWxNYXNrKHdyaXRlTWFzayk7XG4gICAgfVxuXG5cdHB1YmxpYyBzZXRQcm9ncmFtKHByb2dyYW06UHJvZ3JhbVdlYkdMKVxuXHR7XG5cdFx0Ly9UT0RPIGRlY2lkZSBvbiBjb25zdHJ1Y3Rpb24vcmVmZXJlbmNlIHJlc3Bvc2liaWxpdGllc1xuXHRcdHRoaXMuX2N1cnJlbnRQcm9ncmFtID0gcHJvZ3JhbTtcblx0XHRwcm9ncmFtLmZvY3VzUHJvZ3JhbSgpO1xuXHR9XG5cblx0cHVibGljIHNldFByb2dyYW1Db25zdGFudHNGcm9tTWF0cml4KHByb2dyYW1UeXBlOnN0cmluZywgZmlyc3RSZWdpc3RlcjpudW1iZXIsIG1hdHJpeDpNYXRyaXgzRCwgdHJhbnNwb3NlZE1hdHJpeDpib29sZWFuID0gZmFsc2UpXG5cdHtcblx0XHQvL3RoaXMuX2dsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy5fZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuX2N1cnJlbnRQcm9ncmFtLmdsUHJvZ3JhbSwgdGhpcy5fdW5pZm9ybUxvY2F0aW9uTmFtZURpY3Rpb25hcnlbcHJvZ3JhbVR5cGVdKSwgIXRyYW5zcG9zZWRNYXRyaXgsIG5ldyBGbG9hdDMyQXJyYXkobWF0cml4LnJhd0RhdGEpKTtcblxuXHRcdC8vVE9ETyByZW1vdmUgc3BlY2lhbCBjYXNlIGZvciBXZWJHTCBtYXRyaXggY2FsbHM/XG5cdFx0dmFyIGQ6bnVtYmVyW10gPSBtYXRyaXgucmF3RGF0YTtcblx0XHRpZiAodHJhbnNwb3NlZE1hdHJpeCkge1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyLCBbIGRbMF0sIGRbNF0sIGRbOF0sIGRbMTJdIF0sIDEpO1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyICsgMSwgWyBkWzFdLCBkWzVdLCBkWzldLCBkWzEzXSBdLCAxKTtcblx0XHRcdHRoaXMuc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShwcm9ncmFtVHlwZSwgZmlyc3RSZWdpc3RlciArIDIsIFsgZFsyXSwgZFs2XSwgZFsxMF0sIGRbMTRdIF0sIDEpO1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyICsgMywgWyBkWzNdLCBkWzddLCBkWzExXSwgZFsxNV0gXSwgMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShwcm9ncmFtVHlwZSwgZmlyc3RSZWdpc3RlciwgWyBkWzBdLCBkWzFdLCBkWzJdLCBkWzNdIF0sIDEpO1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyICsgMSwgWyBkWzRdLCBkWzVdLCBkWzZdLCBkWzddIF0sIDEpO1xuXHRcdFx0dGhpcy5zZXRQcm9ncmFtQ29uc3RhbnRzRnJvbUFycmF5KHByb2dyYW1UeXBlLCBmaXJzdFJlZ2lzdGVyICsgMiwgWyBkWzhdLCBkWzldLCBkWzEwXSwgZFsxMV0gXSwgMSk7XG5cdFx0XHR0aGlzLnNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGUsIGZpcnN0UmVnaXN0ZXIgKyAzLCBbIGRbMTJdLCBkWzEzXSwgZFsxNF0sIGRbMTVdIF0sIDEpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgbW9kdWxvOm51bWJlciA9IDA7XG5cblx0cHVibGljIHNldFByb2dyYW1Db25zdGFudHNGcm9tQXJyYXkocHJvZ3JhbVR5cGU6c3RyaW5nLCBmaXJzdFJlZ2lzdGVyOm51bWJlciwgZGF0YTpudW1iZXJbXSwgbnVtUmVnaXN0ZXJzOm51bWJlciA9IC0xKVxuXHR7XG5cdFx0dmFyIGxvY2F0aW9uTmFtZTpzdHJpbmcgPSB0aGlzLl91bmlmb3JtTG9jYXRpb25OYW1lRGljdGlvbmFyeVtwcm9ncmFtVHlwZV07XG5cdFx0dmFyIHN0YXJ0SW5kZXg6bnVtYmVyO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IG51bVJlZ2lzdGVyczsgaSsrKSB7XG5cdFx0XHRzdGFydEluZGV4ID0gaSo0O1xuXHRcdFx0dGhpcy5fZ2wudW5pZm9ybTRmKHRoaXMuX2dsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLl9jdXJyZW50UHJvZ3JhbS5nbFByb2dyYW0sIGxvY2F0aW9uTmFtZSArIChmaXJzdFJlZ2lzdGVyICsgaSkpLCBkYXRhW3N0YXJ0SW5kZXhdLCBkYXRhW3N0YXJ0SW5kZXggKyAxXSwgZGF0YVtzdGFydEluZGV4ICsgMl0sIGRhdGFbc3RhcnRJbmRleCArIDNdKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgc2V0U2Npc3NvclJlY3RhbmdsZShyZWN0YW5nbGU6UmVjdGFuZ2xlKVxuXHR7XG5cdFx0aWYgKCFyZWN0YW5nbGUpIHtcblx0XHRcdHRoaXMuX2dsLmRpc2FibGUodGhpcy5fZ2wuU0NJU1NPUl9URVNUKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9nbC5lbmFibGUodGhpcy5fZ2wuU0NJU1NPUl9URVNUKTtcblx0XHR0aGlzLl9nbC5zY2lzc29yKHJlY3RhbmdsZS54LCByZWN0YW5nbGUueSwgcmVjdGFuZ2xlLndpZHRoLCByZWN0YW5nbGUuaGVpZ2h0KTtcblx0fVxuXG5cdHB1YmxpYyBzZXRUZXh0dXJlQXQoc2FtcGxlcjpudW1iZXIsIHRleHR1cmU6VGV4dHVyZUJhc2VXZWJHTClcblx0e1xuXHRcdHZhciBzYW1wbGVyU3RhdGU6U2FtcGxlclN0YXRlID0gdGhpcy5fc2FtcGxlclN0YXRlc1tzYW1wbGVyXTtcblxuXHRcdGlmICh0aGlzLl9hY3RpdmVUZXh0dXJlICE9IHNhbXBsZXIgJiYgKHRleHR1cmUgfHwgc2FtcGxlclN0YXRlLnR5cGUpKSB7XG5cdFx0XHR0aGlzLl9hY3RpdmVUZXh0dXJlID0gc2FtcGxlcjtcblx0XHRcdHRoaXMuX2dsLmFjdGl2ZVRleHR1cmUodGhpcy5fdGV4dHVyZUluZGV4RGljdGlvbmFyeVtzYW1wbGVyXSk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0ZXh0dXJlKSB7XG5cdFx0XHRpZiAoc2FtcGxlclN0YXRlLnR5cGUpIHtcblx0XHRcdFx0dGhpcy5fZ2wuYmluZFRleHR1cmUoc2FtcGxlclN0YXRlLnR5cGUsIG51bGwpO1xuXHRcdFx0XHRzYW1wbGVyU3RhdGUudHlwZSA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdGV4dHVyZVR5cGU6bnVtYmVyID0gdGhpcy5fdGV4dHVyZVR5cGVEaWN0aW9uYXJ5W3RleHR1cmUudGV4dHVyZVR5cGVdO1xuXHRcdHNhbXBsZXJTdGF0ZS50eXBlID0gdGV4dHVyZVR5cGU7XG5cblx0XHR0aGlzLl9nbC5iaW5kVGV4dHVyZSh0ZXh0dXJlVHlwZSwgdGV4dHVyZS5nbFRleHR1cmUpO1xuXG5cdFx0dGhpcy5fZ2wudW5pZm9ybTFpKHRoaXMuX2dsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLl9jdXJyZW50UHJvZ3JhbS5nbFByb2dyYW0sIFwiZnNcIiArIHNhbXBsZXIpLCBzYW1wbGVyKTtcblxuXHRcdHRoaXMuX2dsLnRleFBhcmFtZXRlcmkodGV4dHVyZVR5cGUsIHRoaXMuX2dsLlRFWFRVUkVfV1JBUF9TLCBzYW1wbGVyU3RhdGUud3JhcCk7XG5cdFx0dGhpcy5fZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlVHlwZSwgdGhpcy5fZ2wuVEVYVFVSRV9XUkFQX1QsIHNhbXBsZXJTdGF0ZS53cmFwKTtcblxuXHRcdHRoaXMuX2dsLnRleFBhcmFtZXRlcmkodGV4dHVyZVR5cGUsIHRoaXMuX2dsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgc2FtcGxlclN0YXRlLmZpbHRlcik7XG5cdFx0dGhpcy5fZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlVHlwZSwgdGhpcy5fZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBzYW1wbGVyU3RhdGUubWlwZmlsdGVyKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRTYW1wbGVyU3RhdGVBdChzYW1wbGVyOm51bWJlciwgd3JhcDpzdHJpbmcsIGZpbHRlcjpzdHJpbmcsIG1pcGZpbHRlcjpzdHJpbmcpOnZvaWRcblx0e1xuXHRcdGlmICgwIDw9IHNhbXBsZXIgJiYgc2FtcGxlciA8IENvbnRleHRXZWJHTC5NQVhfU0FNUExFUlMpIHtcblx0XHRcdHRoaXMuX3NhbXBsZXJTdGF0ZXNbc2FtcGxlcl0ud3JhcCA9IHRoaXMuX3dyYXBEaWN0aW9uYXJ5W3dyYXBdO1xuXHRcdFx0dGhpcy5fc2FtcGxlclN0YXRlc1tzYW1wbGVyXS5maWx0ZXIgPSB0aGlzLl9maWx0ZXJEaWN0aW9uYXJ5W2ZpbHRlcl07XG5cdFx0XHR0aGlzLl9zYW1wbGVyU3RhdGVzW3NhbXBsZXJdLm1pcGZpbHRlciA9IHRoaXMuX21pcG1hcEZpbHRlckRpY3Rpb25hcnlbZmlsdGVyXVttaXBmaWx0ZXJdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBcIlNhbXBsZXIgaXMgb3V0IG9mIGJvdW5kcy5cIjtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgc2V0VmVydGV4QnVmZmVyQXQoaW5kZXg6bnVtYmVyLCBidWZmZXI6VmVydGV4QnVmZmVyV2ViR0wsIGJ1ZmZlck9mZnNldDpudW1iZXIgPSAwLCBmb3JtYXQ6c3RyaW5nID0gbnVsbClcblx0e1xuXHRcdHZhciBsb2NhdGlvbjpudW1iZXIgPSB0aGlzLl9jdXJyZW50UHJvZ3JhbT8gdGhpcy5fZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5fY3VycmVudFByb2dyYW0uZ2xQcm9ncmFtLCBcInZhXCIgKyBpbmRleCkgOiAtMTtcblxuXHRcdGlmICghYnVmZmVyKSB7XG5cdFx0XHRpZiAobG9jYXRpb24gPiAtMSlcblx0XHRcdFx0dGhpcy5fZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBwcm9wZXJ0aWVzOlZlcnRleEJ1ZmZlclByb3BlcnRpZXMgPSB0aGlzLl92ZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzRGljdGlvbmFyeVtmb3JtYXRdO1xuXG5cdFx0dGhpcy5fZ2wuYmluZEJ1ZmZlcih0aGlzLl9nbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlci5nbEJ1ZmZlcik7XG5cdFx0dGhpcy5fZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuXHRcdHRoaXMuX2dsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIHByb3BlcnRpZXMuc2l6ZSwgcHJvcGVydGllcy50eXBlLCBwcm9wZXJ0aWVzLm5vcm1hbGl6ZWQsIGJ1ZmZlci5kYXRhUGVyVmVydGV4LCBidWZmZXJPZmZzZXQpO1xuXHR9XG5cblx0cHVibGljIHNldFJlbmRlclRvVGV4dHVyZSh0YXJnZXQ6VGV4dHVyZUJhc2VXZWJHTCwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4gPSBmYWxzZSwgYW50aUFsaWFzOm51bWJlciA9IDAsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0dmFyIHRleHR1cmU6VGV4dHVyZVdlYkdMID0gPFRleHR1cmVXZWJHTD4gdGFyZ2V0O1xuXHRcdHZhciBmcmFtZUJ1ZmZlcjpXZWJHTEZyYW1lYnVmZmVyID0gdGV4dHVyZS5mcmFtZUJ1ZmZlcjtcblx0XHR0aGlzLl9nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5fZ2wuRlJBTUVCVUZGRVIsIGZyYW1lQnVmZmVyKTtcblxuXHRcdGlmIChlbmFibGVEZXB0aEFuZFN0ZW5jaWwpIHtcblx0XHRcdHRoaXMuX2dsLmVuYWJsZSh0aGlzLl9nbC5TVEVOQ0lMX1RFU1QpO1xuXHRcdFx0dGhpcy5fZ2wuZW5hYmxlKHRoaXMuX2dsLkRFUFRIX1RFU1QpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2dsLnZpZXdwb3J0KDAsIDAsIHRleHR1cmUud2lkdGgsIHRleHR1cmUuaGVpZ2h0ICk7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyVG9CYWNrQnVmZmVyKClcblx0e1xuXHRcdHRoaXMuX2dsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLl9nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUJsZW5kU3RhdHVzKClcblx0e1xuXHRcdGlmICh0aGlzLl9ibGVuZEVuYWJsZWQpIHtcblx0XHRcdHRoaXMuX2dsLmVuYWJsZSh0aGlzLl9nbC5CTEVORCk7XG5cdFx0XHR0aGlzLl9nbC5ibGVuZEVxdWF0aW9uKHRoaXMuX2dsLkZVTkNfQUREKTtcblx0XHRcdHRoaXMuX2dsLmJsZW5kRnVuYyh0aGlzLl9ibGVuZFNvdXJjZUZhY3RvciwgdGhpcy5fYmxlbmREZXN0aW5hdGlvbkZhY3Rvcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2dsLmRpc2FibGUodGhpcy5fZ2wuQkxFTkQpO1xuXHRcdH1cblx0fVxuXG4gICAgcHJpdmF0ZSB0cmFuc2xhdGVUcmlhbmdsZUZhY2UodHJpYW5nbGVGYWNlOnN0cmluZywgY29vcmRpbmF0ZVN5c3RlbTpzdHJpbmcpXG4gICAge1xuICAgICAgICBzd2l0Y2ggKHRyaWFuZ2xlRmFjZSkge1xuICAgICAgICAgICAgY2FzZSBDb250ZXh0R0xUcmlhbmdsZUZhY2UuQkFDSzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKGNvb3JkaW5hdGVTeXN0ZW0gPT0gXCJsZWZ0SGFuZGVkXCIpPyB0aGlzLl9nbC5GUk9OVCA6IHRoaXMuX2dsLkJBQ0s7XG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgQ29udGV4dEdMVHJpYW5nbGVGYWNlLkZST05UOlxuICAgICAgICAgICAgICAgIHJldHVybiAoY29vcmRpbmF0ZVN5c3RlbSA9PSBcImxlZnRIYW5kZWRcIik/IHRoaXMuX2dsLkJBQ0sgOiB0aGlzLl9nbC5GUk9OVDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ29udGV4dEdMVHJpYW5nbGVGYWNlLkZST05UX0FORF9CQUNLOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nbC5GUk9OVF9BTkRfQkFDSztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJVbmtub3duIENvbnRleHRHTFRyaWFuZ2xlRmFjZSB0eXBlLlwiOyAvLyBUT0RPIGVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCA9IENvbnRleHRXZWJHTDtcblxuXG5jbGFzcyBWZXJ0ZXhCdWZmZXJQcm9wZXJ0aWVzXG57XG5cdHB1YmxpYyBzaXplOm51bWJlcjtcblxuXHRwdWJsaWMgdHlwZTpudW1iZXI7XG5cblx0cHVibGljIG5vcm1hbGl6ZWQ6Ym9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihzaXplOm51bWJlciwgdHlwZTpudW1iZXIsIG5vcm1hbGl6ZWQ6Ym9vbGVhbilcblx0e1xuXHRcdHRoaXMuc2l6ZSA9IHNpemU7XG5cdFx0dGhpcy50eXBlID0gdHlwZTtcblx0XHR0aGlzLm5vcm1hbGl6ZWQgPSBub3JtYWxpemVkO1xuXHR9XG59IiwiaW1wb3J0IEJ5dGVBcnJheVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQnl0ZUFycmF5XCIpO1xuaW1wb3J0IEJ5dGVBcnJheUJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9CeXRlQXJyYXlCYXNlXCIpO1xuXG5pbXBvcnQgQ29udGV4dFN0YWdlM0RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNEXCIpO1xuaW1wb3J0IElDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgT3BDb2Rlc1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL09wQ29kZXNcIik7XG5pbXBvcnQgUmVzb3VyY2VCYXNlRmxhc2hcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9SZXNvdXJjZUJhc2VGbGFzaFwiKTtcblxuY2xhc3MgQ3ViZVRleHR1cmVGbGFzaCBleHRlbmRzIFJlc291cmNlQmFzZUZsYXNoIGltcGxlbWVudHMgSUN1YmVUZXh0dXJlXG57XG5cdHByaXZhdGUgX2NvbnRleHQ6Q29udGV4dFN0YWdlM0Q7XG5cdHByaXZhdGUgX3NpemU6bnVtYmVyO1xuXG5cdHB1YmxpYyBnZXQgc2l6ZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NpemU7XG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihjb250ZXh0OkNvbnRleHRTdGFnZTNELCBzaXplOm51bWJlciwgZm9ybWF0OnN0cmluZywgZm9yUlRUOmJvb2xlYW4sIHN0cmVhbWluZzpib29sZWFuID0gZmFsc2UpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0dGhpcy5fc2l6ZSA9IHNpemU7XG5cblx0XHR0aGlzLl9jb250ZXh0LmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuaW5pdEN1YmVUZXh0dXJlLCAoZm9yUlRUPyBPcENvZGVzLnRydWVWYWx1ZSA6IE9wQ29kZXMuZmFsc2VWYWx1ZSkpICsgc2l6ZSArIFwiLFwiICsgc3RyZWFtaW5nICsgXCIsXCIgKyBmb3JtYXQgKyBcIiRcIik7XG5cdFx0dGhpcy5fcElkID0gdGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdFx0dGhpcy5fY29udGV4dC5faUFkZFJlc291cmNlKHRoaXMpO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmRpc3Bvc2VDdWJlVGV4dHVyZSkgKyB0aGlzLl9wSWQudG9TdHJpbmcoKSArIFwiLFwiKTtcblx0XHR0aGlzLl9jb250ZXh0LmV4ZWN1dGUoKTtcblx0XHR0aGlzLl9jb250ZXh0Ll9pUmVtb3ZlUmVzb3VyY2UodGhpcyk7XG5cblx0XHR0aGlzLl9jb250ZXh0ID0gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tRGF0YShpbWFnZTpIVE1MSW1hZ2VFbGVtZW50LCBzaWRlOm51bWJlciwgbWlwbGV2ZWw/Om51bWJlcik7XG5cdHB1YmxpYyB1cGxvYWRGcm9tRGF0YShpbWFnZURhdGE6SW1hZ2VEYXRhLCBzaWRlOm51bWJlciwgbWlwbGV2ZWw/Om51bWJlcik7XG5cdHB1YmxpYyB1cGxvYWRGcm9tRGF0YShkYXRhOmFueSwgc2lkZTpudW1iZXIsIG1pcGxldmVsOm51bWJlciA9IDApXG5cdHtcblx0XHRpZiAoZGF0YSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHtcblx0XHRcdHZhciBjYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0dmFyIHcgPSBkYXRhLndpZHRoO1xuXHRcdFx0dmFyIGggPSBkYXRhLmhlaWdodDtcblx0XHRcdGNhbi53aWR0aCA9IHc7XG5cdFx0XHRjYW4uaGVpZ2h0ID0gaDtcblx0XHRcdHZhciBjdHggPSBjYW4uZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShkYXRhLCAwLCAwKTtcblx0XHRcdGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpLmRhdGE7XG5cdFx0fVxuXG5cdFx0dmFyIHBvcyA9IDA7XG5cdFx0dmFyIGJ5dGVzID0gQnl0ZUFycmF5QmFzZS5pbnRlcm5hbEdldEJhc2U2NFN0cmluZyhkYXRhLmxlbmd0aCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGRhdGFbcG9zKytdO1xuXHRcdH0sIG51bGwpO1xuXG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnVwbG9hZEJ5dGVzQ3ViZVRleHR1cmUpICsgdGhpcy5fcElkICsgXCIsXCIgKyBtaXBsZXZlbCArIFwiLFwiICsgc2lkZSArIFwiLFwiICsgKHRoaXMuc2l6ZSA+PiBtaXBsZXZlbCkgKyBcIixcIiArIGJ5dGVzICsgXCIlXCIpO1xuXHRcdHRoaXMuX2NvbnRleHQuZXhlY3V0ZSgpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZENvbXByZXNzZWRUZXh0dXJlRnJvbUJ5dGVBcnJheShkYXRhOkJ5dGVBcnJheSwgYnl0ZUFycmF5T2Zmc2V0Om51bWJlciAvKnVpbnQqLywgYXN5bmM6Ym9vbGVhbiA9IGZhbHNlKVxuXHR7XG5cblx0fVxufVxuXG5leHBvcnQgPSBDdWJlVGV4dHVyZUZsYXNoOyIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuaW1wb3J0IElDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgVGV4dHVyZUJhc2VXZWJHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZUJhc2VXZWJHTFwiKTtcblxuY2xhc3MgQ3ViZVRleHR1cmVXZWJHTCBleHRlbmRzIFRleHR1cmVCYXNlV2ViR0wgaW1wbGVtZW50cyBJQ3ViZVRleHR1cmVcbntcblxuXHRwcml2YXRlIF90ZXh0dXJlU2VsZWN0b3JEaWN0aW9uYXJ5OkFycmF5PG51bWJlcj4gPSBuZXcgQXJyYXk8bnVtYmVyPig2KTtcblxuXHRwdWJsaWMgdGV4dHVyZVR5cGU6c3RyaW5nID0gXCJ0ZXh0dXJlQ3ViZVwiO1xuXHRwcml2YXRlIF90ZXh0dXJlOldlYkdMVGV4dHVyZTtcblx0cHJpdmF0ZSBfc2l6ZTpudW1iZXI7XG5cblx0Y29uc3RydWN0b3IoZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0LCBzaXplOm51bWJlcilcblx0e1xuXHRcdHN1cGVyKGdsKTtcblx0XHR0aGlzLl9zaXplID0gc2l6ZTtcblx0XHR0aGlzLl90ZXh0dXJlID0gdGhpcy5fZ2wuY3JlYXRlVGV4dHVyZSgpO1xuXG5cdFx0dGhpcy5fdGV4dHVyZVNlbGVjdG9yRGljdGlvbmFyeVswXSA9IGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWDtcblx0XHR0aGlzLl90ZXh0dXJlU2VsZWN0b3JEaWN0aW9uYXJ5WzFdID0gZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YO1xuXHRcdHRoaXMuX3RleHR1cmVTZWxlY3RvckRpY3Rpb25hcnlbMl0gPSBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1k7XG5cdFx0dGhpcy5fdGV4dHVyZVNlbGVjdG9yRGljdGlvbmFyeVszXSA9IGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWTtcblx0XHR0aGlzLl90ZXh0dXJlU2VsZWN0b3JEaWN0aW9uYXJ5WzRdID0gZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aO1xuXHRcdHRoaXMuX3RleHR1cmVTZWxlY3RvckRpY3Rpb25hcnlbNV0gPSBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1o7XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9nbC5kZWxldGVUZXh0dXJlKHRoaXMuX3RleHR1cmUpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZEZyb21EYXRhKGltYWdlOkhUTUxJbWFnZUVsZW1lbnQsIHNpZGU6bnVtYmVyLCBtaXBsZXZlbD86bnVtYmVyKTtcblx0cHVibGljIHVwbG9hZEZyb21EYXRhKGltYWdlRGF0YTpJbWFnZURhdGEsIHNpZGU6bnVtYmVyLCBtaXBsZXZlbD86bnVtYmVyKTtcblx0cHVibGljIHVwbG9hZEZyb21EYXRhKGRhdGE6YW55LCBzaWRlOm51bWJlciwgbWlwbGV2ZWw6bnVtYmVyID0gMClcblx0e1xuXHRcdHRoaXMuX2dsLmJpbmRUZXh0dXJlKHRoaXMuX2dsLlRFWFRVUkVfQ1VCRV9NQVAsIHRoaXMuX3RleHR1cmUpO1xuXHRcdHRoaXMuX2dsLnRleEltYWdlMkQodGhpcy5fdGV4dHVyZVNlbGVjdG9yRGljdGlvbmFyeVtzaWRlXSwgbWlwbGV2ZWwsIHRoaXMuX2dsLlJHQkEsIHRoaXMuX2dsLlJHQkEsIHRoaXMuX2dsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuXHRcdHRoaXMuX2dsLmJpbmRUZXh0dXJlKHRoaXMuX2dsLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGwpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZENvbXByZXNzZWRUZXh0dXJlRnJvbUJ5dGVBcnJheShkYXRhOkJ5dGVBcnJheSwgYnl0ZUFycmF5T2Zmc2V0Om51bWJlciAvKnVpbnQqLywgYXN5bmM6Ym9vbGVhbiA9IGZhbHNlKVxuXHR7XG5cblx0fVxuXG5cdHB1YmxpYyBnZXQgc2l6ZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NpemU7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGdsVGV4dHVyZSgpOldlYkdMVGV4dHVyZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3RleHR1cmU7XG5cdH1cbn1cblxuZXhwb3J0ID0gQ3ViZVRleHR1cmVXZWJHTDsiLCJpbXBvcnQgQml0bWFwSW1hZ2UyRFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CaXRtYXBJbWFnZTJEXCIpO1xuaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vTWF0cml4M0RcIik7XG5pbXBvcnQgUmVjdGFuZ2xlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1JlY3RhbmdsZVwiKTtcblxuaW1wb3J0IElDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcbmltcG9ydCBJUHJvZ3JhbVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lQcm9ncmFtXCIpO1xuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgSVRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlQmFzZVwiKTtcbmltcG9ydCBJVmVydGV4QnVmZmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVmVydGV4QnVmZmVyXCIpO1xuXG5pbnRlcmZhY2UgSUNvbnRleHRHTFxue1xuXHRjb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cblx0Y2xlYXIocmVkPzpudW1iZXIsIGdyZWVuPzpudW1iZXIsIGJsdWU/Om51bWJlciwgYWxwaGE/Om51bWJlciwgZGVwdGg/Om51bWJlciwgc3RlbmNpbD86bnVtYmVyLCBtYXNrPzpudW1iZXIpO1xuXG5cdGNvbmZpZ3VyZUJhY2tCdWZmZXIod2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyLCBhbnRpQWxpYXM6bnVtYmVyLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWw/OmJvb2xlYW4pO1xuXG5cdGNyZWF0ZUN1YmVUZXh0dXJlKHNpemU6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nLCBvcHRpbWl6ZUZvclJlbmRlclRvVGV4dHVyZTpib29sZWFuLCBzdHJlYW1pbmdMZXZlbHM/Om51bWJlcik6SUN1YmVUZXh0dXJlO1xuXG5cdGNyZWF0ZUluZGV4QnVmZmVyKG51bUluZGljZXM6bnVtYmVyKTpJSW5kZXhCdWZmZXI7XG5cblx0Y3JlYXRlUHJvZ3JhbSgpOklQcm9ncmFtO1xuXG5cdGNyZWF0ZVRleHR1cmUod2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nLCBvcHRpbWl6ZUZvclJlbmRlclRvVGV4dHVyZTpib29sZWFuLCBzdHJlYW1pbmdMZXZlbHM/Om51bWJlcik6SVRleHR1cmU7XG5cblx0Y3JlYXRlVmVydGV4QnVmZmVyKG51bVZlcnRpY2VzOm51bWJlciwgZGF0YVBlclZlcnRleDpudW1iZXIpOklWZXJ0ZXhCdWZmZXI7XG5cblx0ZGlzcG9zZSgpO1xuXG5cdGRyYXdUb0JpdG1hcEltYWdlMkQoZGVzdGluYXRpb246Qml0bWFwSW1hZ2UyRCk7XG5cblx0ZHJhd0luZGljZXMobW9kZTpzdHJpbmcsIGluZGV4QnVmZmVyOklJbmRleEJ1ZmZlciwgZmlyc3RJbmRleD86bnVtYmVyLCBudW1JbmRpY2VzPzpudW1iZXIpO1xuXG5cdGRyYXdWZXJ0aWNlcyhtb2RlOnN0cmluZywgZmlyc3RWZXJ0ZXg/Om51bWJlciwgbnVtVmVydGljZXM/Om51bWJlcik7XG5cblx0cHJlc2VudCgpO1xuXG5cdHNldEJsZW5kRmFjdG9ycyhzb3VyY2VGYWN0b3I6c3RyaW5nLCBkZXN0aW5hdGlvbkZhY3RvcjpzdHJpbmcpO1xuXG5cdHNldENvbG9yTWFzayhyZWQ6Ym9vbGVhbiwgZ3JlZW46Ym9vbGVhbiwgYmx1ZTpib29sZWFuLCBhbHBoYTpib29sZWFuKTtcblxuICAgIHNldFN0ZW5jaWxBY3Rpb25zKHRyaWFuZ2xlRmFjZT86c3RyaW5nLCBjb21wYXJlTW9kZT86c3RyaW5nLCBhY3Rpb25PbkJvdGhQYXNzPzpzdHJpbmcsIGFjdGlvbk9uRGVwdGhGYWlsPzpzdHJpbmcsIGFjdGlvbk9uRGVwdGhQYXNzU3RlbmNpbEZhaWw/OnN0cmluZywgY29vcmRpbmF0ZVN5c3RlbT86c3RyaW5nKTtcblxuICAgIHNldFN0ZW5jaWxSZWZlcmVuY2VWYWx1ZShyZWZlcmVuY2VWYWx1ZTpudW1iZXIsIHJlYWRNYXNrPzpudW1iZXIsIHdyaXRlTWFzaz86bnVtYmVyKTtcblxuXHRzZXRDdWxsaW5nKHRyaWFuZ2xlRmFjZVRvQ3VsbDpzdHJpbmcsIGNvb3JkaW5hdGVTeXN0ZW0/OnN0cmluZyk7XG5cblx0c2V0RGVwdGhUZXN0KGRlcHRoTWFzazpib29sZWFuLCBwYXNzQ29tcGFyZU1vZGU6c3RyaW5nKTtcblxuXHRzZXRQcm9ncmFtKHByb2dyYW06SVByb2dyYW0pO1xuXG5cdHNldFByb2dyYW1Db25zdGFudHNGcm9tTWF0cml4KHByb2dyYW1UeXBlOnN0cmluZywgZmlyc3RSZWdpc3RlcjpudW1iZXIsIG1hdHJpeDpNYXRyaXgzRCwgdHJhbnNwb3NlZE1hdHJpeD86Ym9vbGVhbik7XG5cblx0c2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShwcm9ncmFtVHlwZTpzdHJpbmcsIGZpcnN0UmVnaXN0ZXI6bnVtYmVyLCBkYXRhOm51bWJlcltdLCBudW1SZWdpc3RlcnM/Om51bWJlcik7XG5cblx0c2V0U2FtcGxlclN0YXRlQXQoc2FtcGxlcjpudW1iZXIsIHdyYXA6c3RyaW5nLCBmaWx0ZXI6c3RyaW5nLCBtaXBmaWx0ZXI6c3RyaW5nKTtcblxuXHRzZXRTY2lzc29yUmVjdGFuZ2xlKHJlY3RhbmdsZTpSZWN0YW5nbGUpO1xuXG5cdHNldFRleHR1cmVBdChzYW1wbGVyOm51bWJlciwgdGV4dHVyZTpJVGV4dHVyZUJhc2UpO1xuXG5cdHNldFZlcnRleEJ1ZmZlckF0KGluZGV4Om51bWJlciwgYnVmZmVyOklWZXJ0ZXhCdWZmZXIsIGJ1ZmZlck9mZnNldD86bnVtYmVyLCBmb3JtYXQ/OnN0cmluZyk7XG5cblx0c2V0UmVuZGVyVG9UZXh0dXJlKHRhcmdldDpJVGV4dHVyZUJhc2UsIGVuYWJsZURlcHRoQW5kU3RlbmNpbD86Ym9vbGVhbiwgYW50aUFsaWFzPzpudW1iZXIsIHN1cmZhY2VTZWxlY3Rvcj86bnVtYmVyKTtcblxuXHRzZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcbn1cblxuZXhwb3J0ID0gSUNvbnRleHRHTDsiLCJpbXBvcnQgQnl0ZUFycmF5XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9CeXRlQXJyYXlcIik7XG5cbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuXG5pbnRlcmZhY2UgSUN1YmVUZXh0dXJlIGV4dGVuZHMgSVRleHR1cmVCYXNlXG57XG5cdHNpemU6bnVtYmVyO1xuXG5cdHVwbG9hZEZyb21EYXRhKGltYWdlOkhUTUxJbWFnZUVsZW1lbnQsIHNpZGU6bnVtYmVyLCBtaXBsZXZlbD86bnVtYmVyKTtcblx0dXBsb2FkRnJvbURhdGEoaW1hZ2VEYXRhOkltYWdlRGF0YSwgc2lkZTpudW1iZXIsIG1pcGxldmVsPzpudW1iZXIpO1xuXG5cdHVwbG9hZENvbXByZXNzZWRUZXh0dXJlRnJvbUJ5dGVBcnJheShkYXRhOkJ5dGVBcnJheSwgYnl0ZUFycmF5T2Zmc2V0Om51bWJlciwgYXN5bmM6Ym9vbGVhbik7XG59XG5cbmV4cG9ydCA9IElDdWJlVGV4dHVyZTsiLCJpbnRlcmZhY2UgSUluZGV4QnVmZmVyXG57XG5cdG51bUluZGljZXM6bnVtYmVyO1xuXG5cdHVwbG9hZEZyb21BcnJheShkYXRhOm51bWJlcltdLCBzdGFydE9mZnNldDpudW1iZXIsIGNvdW50Om51bWJlcik7XG5cblx0dXBsb2FkRnJvbUJ5dGVBcnJheShkYXRhOkFycmF5QnVmZmVyLCBzdGFydE9mZnNldDpudW1iZXIsIGNvdW50Om51bWJlcik7XG5cblx0ZGlzcG9zZSgpO1xufVxuXG5leHBvcnQgPSBJSW5kZXhCdWZmZXI7IiwiaW1wb3J0IEJ5dGVBcnJheVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQnl0ZUFycmF5XCIpO1xuXG5pbnRlcmZhY2UgSVByb2dyYW1cbntcblx0dXBsb2FkKHZlcnRleFByb2dyYW06Qnl0ZUFycmF5LCBmcmFnbWVudFByb2dyYW06Qnl0ZUFycmF5KTtcblxuXHRkaXNwb3NlKCk7XG59XG5cbmV4cG9ydCA9IElQcm9ncmFtOyIsImludGVyZmFjZSBJVGV4dHVyZUJhc2Vcbntcblx0ZGlzcG9zZSgpO1xufVxuXG5leHBvcnQgPSBJVGV4dHVyZUJhc2U7IiwiaW1wb3J0IElUZXh0dXJlQmFzZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZUJhc2VcIik7XG5cbmludGVyZmFjZSBJVGV4dHVyZSBleHRlbmRzIElUZXh0dXJlQmFzZVxue1xuXHR3aWR0aDpudW1iZXI7XG5cblx0aGVpZ2h0Om51bWJlcjtcblxuXHR1cGxvYWRGcm9tRGF0YShpbWFnZTpIVE1MSW1hZ2VFbGVtZW50LCBtaXBsZXZlbD86bnVtYmVyKTtcblx0dXBsb2FkRnJvbURhdGEoaW1hZ2VEYXRhOkltYWdlRGF0YSwgbWlwbGV2ZWw/Om51bWJlcik7XG5cbn1cblxuZXhwb3J0ID0gSVRleHR1cmU7IiwiaW50ZXJmYWNlIElWZXJ0ZXhCdWZmZXJcbntcblx0bnVtVmVydGljZXM6bnVtYmVyO1xuXG5cdGRhdGFQZXJWZXJ0ZXg6bnVtYmVyO1xuXG5cdHVwbG9hZEZyb21BcnJheShkYXRhOm51bWJlcltdLCBzdGFydFZlcnRleDpudW1iZXIsIG51bVZlcnRpY2VzOm51bWJlcik7XG5cblx0dXBsb2FkRnJvbUJ5dGVBcnJheShkYXRhOkFycmF5QnVmZmVyLCBzdGFydFZlcnRleDpudW1iZXIsIG51bVZlcnRpY2VzOm51bWJlcik7XG5cblx0ZGlzcG9zZSgpO1xufVxuXG5leHBvcnQgPSBJVmVydGV4QnVmZmVyOyIsImltcG9ydCBDb250ZXh0U3RhZ2UzRFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFN0YWdlM0RcIik7XG5pbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcbmltcG9ydCBPcENvZGVzXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvT3BDb2Rlc1wiKTtcbmltcG9ydCBSZXNvdXJjZUJhc2VGbGFzaFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1Jlc291cmNlQmFzZUZsYXNoXCIpO1xuXG5jbGFzcyBJbmRleEJ1ZmZlckZsYXNoIGV4dGVuZHMgUmVzb3VyY2VCYXNlRmxhc2ggaW1wbGVtZW50cyBJSW5kZXhCdWZmZXJcbntcblx0cHJpdmF0ZSBfY29udGV4dDpDb250ZXh0U3RhZ2UzRDtcblx0cHJpdmF0ZSBfbnVtSW5kaWNlczpudW1iZXI7XG5cblx0Y29uc3RydWN0b3IoY29udGV4dDpDb250ZXh0U3RhZ2UzRCwgbnVtSW5kaWNlczpudW1iZXIpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0dGhpcy5fbnVtSW5kaWNlcyA9IG51bUluZGljZXM7XG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmluaXRJbmRleEJ1ZmZlciwgbnVtSW5kaWNlcyArIE9wQ29kZXMuaW50TWFzaykpO1xuXHRcdHRoaXMuX3BJZCA9IHRoaXMuX2NvbnRleHQuZXhlY3V0ZSgpO1xuXHRcdHRoaXMuX2NvbnRleHQuX2lBZGRSZXNvdXJjZSh0aGlzKTtcblx0fVxuXHRwdWJsaWMgdXBsb2FkRnJvbUFycmF5KGRhdGE6bnVtYmVyW10sIHN0YXJ0T2Zmc2V0Om51bWJlciwgY291bnQ6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0LmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMudXBsb2FkQXJyYXlJbmRleEJ1ZmZlciwgdGhpcy5fcElkICsgT3BDb2Rlcy5pbnRNYXNrKSArIGRhdGEuam9pbigpICsgXCIjXCIgKyBzdGFydE9mZnNldCArIFwiLFwiICsgY291bnQgKyBcIixcIik7XG5cdFx0dGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdH1cblxuXHRwdWJsaWMgdXBsb2FkRnJvbUJ5dGVBcnJheShkYXRhOkFycmF5QnVmZmVyLCBzdGFydE9mZnNldDpudW1iZXIsIGNvdW50Om51bWJlcilcblx0e1xuXG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5kaXNwb3NlSW5kZXhCdWZmZXIsIHRoaXMuX3BJZCArIE9wQ29kZXMuaW50TWFzaykpO1xuXHRcdHRoaXMuX2NvbnRleHQuZXhlY3V0ZSgpO1xuXHRcdHRoaXMuX2NvbnRleHQuX2lSZW1vdmVSZXNvdXJjZSh0aGlzKTtcblxuXHRcdHRoaXMuX2NvbnRleHQgPSBudWxsO1xuXHR9XG5cblx0cHVibGljIGdldCBudW1JbmRpY2VzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbnVtSW5kaWNlcztcblx0fVxufVxuXG5leHBvcnQgPSBJbmRleEJ1ZmZlckZsYXNoOyIsImltcG9ydCBJSW5kZXhCdWZmZXIgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcblxuY2xhc3MgSW5kZXhCdWZmZXJTb2Z0d2FyZSBpbXBsZW1lbnRzIElJbmRleEJ1ZmZlciB7XG4gICAgcHJpdmF0ZSBfbnVtSW5kaWNlczpudW1iZXI7XG4gICAgcHJpdmF0ZSBfZGF0YTpVaW50MTZBcnJheTtcbiAgICBwcml2YXRlIF9zdGFydE9mZnNldDpudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihudW1JbmRpY2VzOm51bWJlcikge1xuICAgICAgICB0aGlzLl9udW1JbmRpY2VzID0gbnVtSW5kaWNlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBsb2FkRnJvbUFycmF5KGRhdGE6bnVtYmVyW10sIHN0YXJ0T2Zmc2V0Om51bWJlciwgY291bnQ6bnVtYmVyKTp2b2lkIHtcbiAgICAgICAgdGhpcy5fc3RhcnRPZmZzZXQgPSBzdGFydE9mZnNldCAqIDI7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgVWludDE2QXJyYXkoZGF0YSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVwbG9hZEZyb21CeXRlQXJyYXkoZGF0YTpBcnJheUJ1ZmZlciwgc3RhcnRPZmZzZXQ6bnVtYmVyLCBjb3VudDpudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRPZmZzZXQgPSBzdGFydE9mZnNldCAqIDI7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgVWludDE2QXJyYXkoZGF0YSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2UoKTp2b2lkIHtcbiAgICAgICAgdGhpcy5fZGF0YS5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbnVtSW5kaWNlcygpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9udW1JbmRpY2VzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGF0YSgpOlVpbnQxNkFycmF5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzdGFydE9mZnNldCgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGFydE9mZnNldDtcbiAgICB9XG5cbn1cblxuZXhwb3J0ID0gSW5kZXhCdWZmZXJTb2Z0d2FyZTsiLCJpbXBvcnQgSUluZGV4QnVmZmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lJbmRleEJ1ZmZlclwiKTtcblxuY2xhc3MgSW5kZXhCdWZmZXJXZWJHTCBpbXBsZW1lbnRzIElJbmRleEJ1ZmZlclxue1xuXG5cdHByaXZhdGUgX2dsOldlYkdMUmVuZGVyaW5nQ29udGV4dDtcblx0cHJpdmF0ZSBfbnVtSW5kaWNlczpudW1iZXI7XG5cdHByaXZhdGUgX2J1ZmZlcjpXZWJHTEJ1ZmZlcjtcblxuXHRjb25zdHJ1Y3RvcihnbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQsIG51bUluZGljZXM6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fZ2wgPSBnbDtcblx0XHR0aGlzLl9idWZmZXIgPSB0aGlzLl9nbC5jcmVhdGVCdWZmZXIoKTtcblx0XHR0aGlzLl9udW1JbmRpY2VzID0gbnVtSW5kaWNlcztcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tQXJyYXkoZGF0YTpudW1iZXJbXSwgc3RhcnRPZmZzZXQ6bnVtYmVyLCBjb3VudDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuX2J1ZmZlcik7XG5cblx0XHRpZiAoc3RhcnRPZmZzZXQpXG5cdFx0XHR0aGlzLl9nbC5idWZmZXJTdWJEYXRhKHRoaXMuX2dsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBzdGFydE9mZnNldCoyLCBuZXcgVWludDE2QXJyYXkoZGF0YSkpO1xuXHRcdGVsc2Vcblx0XHRcdHRoaXMuX2dsLmJ1ZmZlckRhdGEodGhpcy5fZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShkYXRhKSwgdGhpcy5fZ2wuU1RBVElDX0RSQVcpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZEZyb21CeXRlQXJyYXkoZGF0YTpBcnJheUJ1ZmZlciwgc3RhcnRPZmZzZXQ6bnVtYmVyLCBjb3VudDpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9nbC5iaW5kQnVmZmVyKHRoaXMuX2dsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLl9idWZmZXIpO1xuXG5cdFx0aWYgKHN0YXJ0T2Zmc2V0KVxuXHRcdFx0dGhpcy5fZ2wuYnVmZmVyU3ViRGF0YSh0aGlzLl9nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgc3RhcnRPZmZzZXQqMiwgZGF0YSk7XG5cdFx0ZWxzZVxuXHRcdFx0dGhpcy5fZ2wuYnVmZmVyRGF0YSh0aGlzLl9nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgZGF0YSwgdGhpcy5fZ2wuU1RBVElDX0RSQVcpO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKTp2b2lkXG5cdHtcblx0XHR0aGlzLl9nbC5kZWxldGVCdWZmZXIodGhpcy5fYnVmZmVyKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgbnVtSW5kaWNlcygpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX251bUluZGljZXM7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGdsQnVmZmVyKCk6V2ViR0xCdWZmZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9idWZmZXI7XG5cdH1cbn1cblxuZXhwb3J0ID0gSW5kZXhCdWZmZXJXZWJHTDsiLCJjbGFzcyBPcENvZGVzXG57XG5cdHB1YmxpYyBzdGF0aWMgdHJ1ZVZhbHVlOm51bWJlciA9IDMyO1xuXHRwdWJsaWMgc3RhdGljIGZhbHNlVmFsdWU6bnVtYmVyID0gMzM7XG5cdHB1YmxpYyBzdGF0aWMgaW50TWFzazpudW1iZXIgPSA2Mztcblx0cHVibGljIHN0YXRpYyBkcmF3VHJpYW5nbGVzOm51bWJlciA9IDQxO1xuXHRwdWJsaWMgc3RhdGljIHNldFByb2dyYW1Db25zdGFudDpudW1iZXIgPSA0Mjtcblx0cHVibGljIHN0YXRpYyBzZXRQcm9ncmFtOm51bWJlciA9IDQzO1xuXHRwdWJsaWMgc3RhdGljIHByZXNlbnQ6bnVtYmVyID0gNDQ7XG5cdHB1YmxpYyBzdGF0aWMgY2xlYXI6bnVtYmVyID0gNDU7XG5cdHB1YmxpYyBzdGF0aWMgaW5pdFByb2dyYW06bnVtYmVyID0gNDY7XG5cdHB1YmxpYyBzdGF0aWMgaW5pdFZlcnRleEJ1ZmZlcjpudW1iZXIgPSA0Nztcblx0cHVibGljIHN0YXRpYyBpbml0SW5kZXhCdWZmZXI6bnVtYmVyID0gNDg7XG5cdHB1YmxpYyBzdGF0aWMgY29uZmlndXJlQmFja0J1ZmZlcjpudW1iZXIgPSA0OTtcblx0cHVibGljIHN0YXRpYyB1cGxvYWRBcnJheUluZGV4QnVmZmVyOm51bWJlciA9IDUwO1xuXHRwdWJsaWMgc3RhdGljIHVwbG9hZEFycmF5VmVydGV4QnVmZmVyOm51bWJlciA9IDUxO1xuXHRwdWJsaWMgc3RhdGljIHVwbG9hZEFHQUxCeXRlc1Byb2dyYW06bnVtYmVyID0gNTI7XG5cdHB1YmxpYyBzdGF0aWMgc2V0VmVydGV4QnVmZmVyQXQ6bnVtYmVyID0gNTM7XG5cdHB1YmxpYyBzdGF0aWMgdXBsb2FkQnl0ZXNJbmRleEJ1ZmZlcjpudW1iZXIgPSA1NDtcblx0cHVibGljIHN0YXRpYyB1cGxvYWRCeXRlc1ZlcnRleEJ1ZmZlcjpudW1iZXIgPSA1NTtcblx0cHVibGljIHN0YXRpYyBzZXRDb2xvck1hc2s6bnVtYmVyID0gNTY7XG5cdHB1YmxpYyBzdGF0aWMgc2V0RGVwdGhUZXN0Om51bWJlciA9IDU3O1xuXHRwdWJsaWMgc3RhdGljIGRpc3Bvc2VQcm9ncmFtOm51bWJlciA9IDU4O1xuXHRwdWJsaWMgc3RhdGljIGRpc3Bvc2VDb250ZXh0Om51bWJlciA9IDU5O1xuXHQvLyBtdXN0IHNraXAgNjAgJzwnIGFzIGl0IHdpbGwgaW52YWxpZGF0ZSB4bWwgYmVpbmcgcGFzc2VkIG92ZXIgdGhlIGJyaWRnZVxuXHRwdWJsaWMgc3RhdGljIGRpc3Bvc2VWZXJ0ZXhCdWZmZXI6bnVtYmVyID0gNjE7XG5cdC8vIG11c3Qgc2tpcCA2MiAnPicgYXMgaXQgd2lsbCBpbnZhbGlkYXRlIHhtbCBiZWluZyBwYXNzZWQgb3ZlciB0aGUgYnJpZGdlXG5cdHB1YmxpYyBzdGF0aWMgZGlzcG9zZUluZGV4QnVmZmVyOm51bWJlciA9IDYzO1xuXHRwdWJsaWMgc3RhdGljIGluaXRUZXh0dXJlOm51bWJlciA9IDY0O1xuXHRwdWJsaWMgc3RhdGljIHNldFRleHR1cmVBdDpudW1iZXIgPSA2NTtcblx0cHVibGljIHN0YXRpYyB1cGxvYWRCeXRlc1RleHR1cmU6bnVtYmVyID0gNjY7XG5cdHB1YmxpYyBzdGF0aWMgZGlzcG9zZVRleHR1cmU6bnVtYmVyID0gNjc7XG5cdHB1YmxpYyBzdGF0aWMgc2V0Q3VsbGluZzpudW1iZXIgPSA2ODtcblx0cHVibGljIHN0YXRpYyBzZXRTY2lzc29yUmVjdDpudW1iZXIgPSA2OTtcblx0cHVibGljIHN0YXRpYyBjbGVhclNjaXNzb3JSZWN0Om51bWJlciA9IDcwO1xuXHRwdWJsaWMgc3RhdGljIHNldEJsZW5kRmFjdG9yczpudW1iZXIgPSA3MTtcblx0cHVibGljIHN0YXRpYyBzZXRSZW5kZXJUb1RleHR1cmU6bnVtYmVyID0gNzI7XG5cdHB1YmxpYyBzdGF0aWMgY2xlYXJUZXh0dXJlQXQ6bnVtYmVyID0gNzM7XG5cdHB1YmxpYyBzdGF0aWMgY2xlYXJWZXJ0ZXhCdWZmZXJBdDpudW1iZXIgPSA3NDtcblx0cHVibGljIHN0YXRpYyBzZXRTdGVuY2lsQWN0aW9uczpudW1iZXIgPSA3NTtcblx0cHVibGljIHN0YXRpYyBzZXRTdGVuY2lsUmVmZXJlbmNlVmFsdWU6bnVtYmVyID0gNzY7XG5cdHB1YmxpYyBzdGF0aWMgaW5pdEN1YmVUZXh0dXJlOm51bWJlciA9IDc3O1xuXHRwdWJsaWMgc3RhdGljIGRpc3Bvc2VDdWJlVGV4dHVyZTpudW1iZXIgPSA3ODtcblx0cHVibGljIHN0YXRpYyB1cGxvYWRCeXRlc0N1YmVUZXh0dXJlOm51bWJlciA9IDc5O1xuXHRwdWJsaWMgc3RhdGljIGNsZWFyUmVuZGVyVG9UZXh0dXJlOm51bWJlciA9IDgwO1xuXHRwdWJsaWMgc3RhdGljIGVuYWJsZUVycm9yQ2hlY2tpbmc6bnVtYmVyID0gODE7XG59XG5cbmV4cG9ydCA9IE9wQ29kZXM7IiwiaW1wb3J0IEJ5dGVBcnJheVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQnl0ZUFycmF5XCIpO1xuXG5pbXBvcnQgQ29udGV4dFN0YWdlM0RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNEXCIpO1xuaW1wb3J0IElQcm9ncmFtXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVByb2dyYW1cIik7XG5pbXBvcnQgT3BDb2Rlc1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL09wQ29kZXNcIik7XG5pbXBvcnQgUmVzb3VyY2VCYXNlRmxhc2hcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9SZXNvdXJjZUJhc2VGbGFzaFwiKTtcblxuY2xhc3MgUHJvZ3JhbUZsYXNoIGV4dGVuZHMgUmVzb3VyY2VCYXNlRmxhc2ggaW1wbGVtZW50cyBJUHJvZ3JhbVxue1xuXHRwcml2YXRlIF9jb250ZXh0OkNvbnRleHRTdGFnZTNEO1xuXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQ6Q29udGV4dFN0YWdlM0QpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmluaXRQcm9ncmFtKSk7XG5cdFx0dGhpcy5fcElkID0gdGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdFx0dGhpcy5fY29udGV4dC5faUFkZFJlc291cmNlKHRoaXMpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZCh2ZXJ0ZXhQcm9ncmFtOkJ5dGVBcnJheSwgZnJhZ21lbnRQcm9ncmFtOkJ5dGVBcnJheSlcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy51cGxvYWRBR0FMQnl0ZXNQcm9ncmFtLCB0aGlzLl9wSWQgKyBPcENvZGVzLmludE1hc2spICsgdmVydGV4UHJvZ3JhbS5yZWFkQmFzZTY0U3RyaW5nKHZlcnRleFByb2dyYW0ubGVuZ3RoKSArIFwiJVwiICsgZnJhZ21lbnRQcm9ncmFtLnJlYWRCYXNlNjRTdHJpbmcoZnJhZ21lbnRQcm9ncmFtLmxlbmd0aCkgKyBcIiVcIik7XG5cblx0XHRpZiAoQ29udGV4dFN0YWdlM0QuZGVidWcpXG5cdFx0XHR0aGlzLl9jb250ZXh0LmV4ZWN1dGUoKTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5kaXNwb3NlUHJvZ3JhbSwgdGhpcy5fcElkICsgT3BDb2Rlcy5pbnRNYXNrKSk7XG5cdFx0dGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdFx0dGhpcy5fY29udGV4dC5faVJlbW92ZVJlc291cmNlKHRoaXMpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cdH1cbn1cblxuZXhwb3J0ID0gUHJvZ3JhbUZsYXNoOyIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuaW1wb3J0IEFHQUxUb2tlbml6ZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9BR0FMVG9rZW5pemVyXCIpO1xuaW1wb3J0IEFHTFNMUGFyc2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9BR0xTTFBhcnNlclwiKTtcbmltcG9ydCBJUHJvZ3JhbVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lQcm9ncmFtXCIpO1xuXG5cbmNsYXNzIFByb2dyYW1Tb2Z0d2FyZSBpbXBsZW1lbnRzIElQcm9ncmFtXG57XG4gICAgcHJpdmF0ZSBfdmVydGV4U2hhZGVyOkZ1bmN0aW9uO1xuICAgIHByaXZhdGUgX2ZyYWdtZW50U2hhZGVyOkZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoKVxuICAgIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBsb2FkKHZlcnRleFByb2dyYW06Qnl0ZUFycmF5LCBmcmFnbWVudFByb2dyYW06Qnl0ZUFycmF5KVxuICAgIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGlzcG9zZSgpXG4gICAge1xuICAgIH1cbn1cblxuZXhwb3J0ID0gUHJvZ3JhbVNvZnR3YXJlOyIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuaW1wb3J0IEFHQUxUb2tlbml6ZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9BR0FMVG9rZW5pemVyXCIpO1xuaW1wb3J0IEFHTFNMUGFyc2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9BR0xTTFBhcnNlclwiKTtcbmltcG9ydCBJUHJvZ3JhbVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lQcm9ncmFtXCIpO1xuXG5cbmNsYXNzIFByb2dyYW1XZWJHTCBpbXBsZW1lbnRzIElQcm9ncmFtXG57XG5cdHByaXZhdGUgc3RhdGljIF90b2tlbml6ZXI6QUdBTFRva2VuaXplciA9IG5ldyBBR0FMVG9rZW5pemVyKCk7XG5cdHByaXZhdGUgc3RhdGljIF9hZ2xzbFBhcnNlcjpBR0xTTFBhcnNlciA9IG5ldyBBR0xTTFBhcnNlcigpO1xuXG5cdHByaXZhdGUgX2dsOldlYkdMUmVuZGVyaW5nQ29udGV4dDtcblx0cHJpdmF0ZSBfcHJvZ3JhbTpXZWJHTFByb2dyYW07XG5cdHByaXZhdGUgX3ZlcnRleFNoYWRlcjpXZWJHTFNoYWRlcjtcblx0cHJpdmF0ZSBfZnJhZ21lbnRTaGFkZXI6V2ViR0xTaGFkZXI7XG5cblx0Y29uc3RydWN0b3IoZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0KVxuXHR7XG5cdFx0dGhpcy5fZ2wgPSBnbDtcblx0XHR0aGlzLl9wcm9ncmFtID0gdGhpcy5fZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZCh2ZXJ0ZXhQcm9ncmFtOkJ5dGVBcnJheSwgZnJhZ21lbnRQcm9ncmFtOkJ5dGVBcnJheSlcblx0e1xuXHRcdHZhciB2ZXJ0ZXhTdHJpbmc6c3RyaW5nID0gUHJvZ3JhbVdlYkdMLl9hZ2xzbFBhcnNlci5wYXJzZShQcm9ncmFtV2ViR0wuX3Rva2VuaXplci5kZWNyaWJlQUdBTEJ5dGVBcnJheSh2ZXJ0ZXhQcm9ncmFtKSk7XG5cdFx0dmFyIGZyYWdtZW50U3RyaW5nOnN0cmluZyA9IFByb2dyYW1XZWJHTC5fYWdsc2xQYXJzZXIucGFyc2UoUHJvZ3JhbVdlYkdMLl90b2tlbml6ZXIuZGVjcmliZUFHQUxCeXRlQXJyYXkoZnJhZ21lbnRQcm9ncmFtKSk7XG5cblx0XHR0aGlzLl92ZXJ0ZXhTaGFkZXIgPSB0aGlzLl9nbC5jcmVhdGVTaGFkZXIodGhpcy5fZ2wuVkVSVEVYX1NIQURFUik7XG5cdFx0dGhpcy5fZnJhZ21lbnRTaGFkZXIgPSB0aGlzLl9nbC5jcmVhdGVTaGFkZXIodGhpcy5fZ2wuRlJBR01FTlRfU0hBREVSKTtcblxuXHRcdHRoaXMuX2dsLnNoYWRlclNvdXJjZSh0aGlzLl92ZXJ0ZXhTaGFkZXIsIHZlcnRleFN0cmluZyk7XG5cdFx0dGhpcy5fZ2wuY29tcGlsZVNoYWRlcih0aGlzLl92ZXJ0ZXhTaGFkZXIpO1xuXG5cdFx0aWYgKCF0aGlzLl9nbC5nZXRTaGFkZXJQYXJhbWV0ZXIodGhpcy5fdmVydGV4U2hhZGVyLCB0aGlzLl9nbC5DT01QSUxFX1NUQVRVUykpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLl9nbC5nZXRTaGFkZXJJbmZvTG9nKHRoaXMuX3ZlcnRleFNoYWRlcikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2dsLnNoYWRlclNvdXJjZSh0aGlzLl9mcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTdHJpbmcpO1xuXHRcdHRoaXMuX2dsLmNvbXBpbGVTaGFkZXIodGhpcy5fZnJhZ21lbnRTaGFkZXIpO1xuXG5cdFx0aWYgKCF0aGlzLl9nbC5nZXRTaGFkZXJQYXJhbWV0ZXIodGhpcy5fZnJhZ21lbnRTaGFkZXIsIHRoaXMuX2dsLkNPTVBJTEVfU1RBVFVTKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMuX2dsLmdldFNoYWRlckluZm9Mb2codGhpcy5fZnJhZ21lbnRTaGFkZXIpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9nbC5hdHRhY2hTaGFkZXIodGhpcy5fcHJvZ3JhbSwgdGhpcy5fdmVydGV4U2hhZGVyKTtcblx0XHR0aGlzLl9nbC5hdHRhY2hTaGFkZXIodGhpcy5fcHJvZ3JhbSwgdGhpcy5fZnJhZ21lbnRTaGFkZXIpO1xuXHRcdHRoaXMuX2dsLmxpbmtQcm9ncmFtKHRoaXMuX3Byb2dyYW0pO1xuXG5cdFx0aWYgKCF0aGlzLl9nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMuX3Byb2dyYW0sIHRoaXMuX2dsLkxJTktfU1RBVFVTKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKHRoaXMuX2dsLmdldFByb2dyYW1JbmZvTG9nKHRoaXMuX3Byb2dyYW0pKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9nbC5kZWxldGVQcm9ncmFtKHRoaXMuX3Byb2dyYW0pO1xuXHR9XG5cblx0cHVibGljIGZvY3VzUHJvZ3JhbSgpXG5cdHtcblx0XHR0aGlzLl9nbC51c2VQcm9ncmFtKHRoaXMuX3Byb2dyYW0pO1xuXHR9XG5cblx0cHVibGljIGdldCBnbFByb2dyYW0oKTpXZWJHTFByb2dyYW1cblx0e1xuXHRcdHJldHVybiB0aGlzLl9wcm9ncmFtO1xuXHR9XG59XG5cbmV4cG9ydCA9IFByb2dyYW1XZWJHTDsiLCJjbGFzcyBSZXNvdXJjZUJhc2VGbGFzaFxue1xuXHRwdWJsaWMgX3BJZDpudW1iZXI7XG5cblx0cHVibGljIGdldCBpZCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3BJZDtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXG5cdH1cbn1cblxuZXhwb3J0ID0gUmVzb3VyY2VCYXNlRmxhc2g7IiwiY2xhc3MgU2FtcGxlclN0YXRlXG57XG5cdHB1YmxpYyB0eXBlOm51bWJlcjtcblx0cHVibGljIHdyYXA6bnVtYmVyO1xuXHRwdWJsaWMgZmlsdGVyOm51bWJlcjtcblx0cHVibGljIG1pcGZpbHRlcjpudW1iZXI7XG59XG5cbmV4cG9ydCA9IFNhbXBsZXJTdGF0ZTsiLCJpbXBvcnQgQXR0cmlidXRlc0J1ZmZlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2F0dHJpYnV0ZXMvQXR0cmlidXRlc0J1ZmZlclwiKTtcbmltcG9ydCBJbWFnZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvSW1hZ2VCYXNlXCIpO1xuaW1wb3J0IFJlY3RhbmdsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9SZWN0YW5nbGVcIik7XG5pbXBvcnQgRXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XG5pbXBvcnQgQ1NTXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQ1NTXCIpO1xuXG5pbXBvcnQgQ29udGV4dE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dE1vZGVcIik7XG5pbXBvcnQgQ29udGV4dEdMTWlwRmlsdGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMTWlwRmlsdGVyXCIpO1xuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGaWx0ZXJcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZpbHRlclwiKTtcbmltcG9ydCBDb250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdFwiKTtcbmltcG9ydCBDb250ZXh0R0xXcmFwTW9kZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFdyYXBNb2RlXCIpO1xuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0U3RhZ2UzRFwiKTtcbmltcG9ydCBDb250ZXh0V2ViR0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFdlYkdMXCIpO1xuaW1wb3J0IENvbnRleHRTb2Z0d2FyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dFNvZnR3YXJlXCIpO1xuaW1wb3J0IElDb250ZXh0R0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUN1YmVUZXh0dXJlXCIpO1xuaW1wb3J0IElJbmRleEJ1ZmZlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JSW5kZXhCdWZmZXJcIik7XG5pbXBvcnQgSVZlcnRleEJ1ZmZlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVZlcnRleEJ1ZmZlclwiKTtcbmltcG9ydCBJVGV4dHVyZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlXCIpO1xuaW1wb3J0IElUZXh0dXJlQmFzZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgU3RhZ2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvZXZlbnRzL1N0YWdlRXZlbnRcIik7XG5pbXBvcnQgSW1hZ2UyRE9iamVjdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2UyRE9iamVjdFwiKTtcbmltcG9ydCBJbWFnZUN1YmVPYmplY3RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlQ3ViZU9iamVjdFwiKTtcbmltcG9ydCBJbWFnZU9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0QmFzZVwiKTtcbmltcG9ydCBJbWFnZU9iamVjdFBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0UG9vbFwiKTtcbmltcG9ydCBQcm9ncmFtRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9Qcm9ncmFtRGF0YVwiKTtcbmltcG9ydCBQcm9ncmFtRGF0YVBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhUG9vbFwiKTtcbmltcG9ydCBTdGFnZU1hbmFnZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hbmFnZXJzL1N0YWdlTWFuYWdlclwiKTtcbmltcG9ydCBBdHRyaWJ1dGVzQnVmZmVyVk9cdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvdm9zL0F0dHJpYnV0ZXNCdWZmZXJWT1wiKTtcbmltcG9ydCBBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sXHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi92b3MvQXR0cmlidXRlc0J1ZmZlclZPUG9vbFwiKTtcblxuLyoqXG4gKiBTdGFnZSBwcm92aWRlcyBhIHByb3h5IGNsYXNzIHRvIGhhbmRsZSB0aGUgY3JlYXRpb24gYW5kIGF0dGFjaG1lbnQgb2YgdGhlIENvbnRleHRcbiAqIChhbmQgaW4gdHVybiB0aGUgYmFjayBidWZmZXIpIGl0IHVzZXMuIFN0YWdlIHNob3VsZCBuZXZlciBiZSBjcmVhdGVkIGRpcmVjdGx5LFxuICogYnV0IHJlcXVlc3RlZCB0aHJvdWdoIFN0YWdlTWFuYWdlci5cbiAqXG4gKiBAc2VlIGF3YXkubWFuYWdlcnMuU3RhZ2VNYW5hZ2VyXG4gKlxuICovXG5jbGFzcyBTdGFnZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIF9wcm9ncmFtRGF0YTpBcnJheTxQcm9ncmFtRGF0YT4gPSBuZXcgQXJyYXk8UHJvZ3JhbURhdGE+KCk7XG5cdHByaXZhdGUgX2ltYWdlT2JqZWN0UG9vbDpJbWFnZU9iamVjdFBvb2w7XG5cdHByaXZhdGUgX2F0dHJpYnV0ZXNCdWZmZXJWT1Bvb2w6QXR0cmlidXRlc0J1ZmZlclZPUG9vbDtcblx0cHJpdmF0ZSBfcHJvZ3JhbURhdGFQb29sOlByb2dyYW1EYXRhUG9vbDtcblx0cHJpdmF0ZSBfY29udGV4dDpJQ29udGV4dEdMO1xuXHRwcml2YXRlIF9jb250YWluZXI6SFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgX3dpZHRoOm51bWJlcjtcblx0cHJpdmF0ZSBfaGVpZ2h0Om51bWJlcjtcblx0cHJpdmF0ZSBfeDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF95Om51bWJlciA9IDA7XG5cblx0Ly9wcml2YXRlIHN0YXRpYyBfZnJhbWVFdmVudERyaXZlcjpTaGFwZSA9IG5ldyBTaGFwZSgpOyAvLyBUT0RPOiBhZGQgZnJhbWUgZHJpdmVyIC8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVcblxuXHRwcml2YXRlIF9zdGFnZUluZGV4Om51bWJlciA9IC0xO1xuXG5cdHByaXZhdGUgX3VzZXNTb2Z0d2FyZVJlbmRlcmluZzpib29sZWFuO1xuXHRwcml2YXRlIF9wcm9maWxlOnN0cmluZztcblx0cHJpdmF0ZSBfc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlcjtcblx0cHJpdmF0ZSBfYW50aUFsaWFzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX2VuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuO1xuXHRwcml2YXRlIF9jb250ZXh0UmVxdWVzdGVkOmJvb2xlYW47XG5cblx0Ly9wcml2YXRlIHZhciBfYWN0aXZlVmVydGV4QnVmZmVycyA6IFZlY3Rvci48VmVydGV4QnVmZmVyPiA9IG5ldyBWZWN0b3IuPFZlcnRleEJ1ZmZlcj4oOCwgdHJ1ZSk7XG5cdC8vcHJpdmF0ZSB2YXIgX2FjdGl2ZVRleHR1cmVzIDogVmVjdG9yLjxUZXh0dXJlQmFzZT4gPSBuZXcgVmVjdG9yLjxUZXh0dXJlQmFzZT4oOCwgdHJ1ZSk7XG5cdHByaXZhdGUgX3JlbmRlclRhcmdldDpJbWFnZUJhc2UgPSBudWxsO1xuXHRwcml2YXRlIF9yZW5kZXJTdXJmYWNlU2VsZWN0b3I6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc2Npc3NvclJlY3Q6UmVjdGFuZ2xlO1xuXHRwcml2YXRlIF9jb2xvcjpudW1iZXI7XG5cdHByaXZhdGUgX2JhY2tCdWZmZXJEaXJ0eTpib29sZWFuO1xuXHRwcml2YXRlIF92aWV3UG9ydDpSZWN0YW5nbGU7XG5cdHByaXZhdGUgX2VudGVyRnJhbWU6RXZlbnQ7XG5cdHByaXZhdGUgX2V4aXRGcmFtZTpFdmVudDtcblx0cHJpdmF0ZSBfdmlld3BvcnRVcGRhdGVkOlN0YWdlRXZlbnQ7XG5cdHByaXZhdGUgX3ZpZXdwb3J0RGlydHk6Ym9vbGVhbjtcblx0cHJpdmF0ZSBfYnVmZmVyQ2xlYXI6Ym9vbGVhbjtcblxuXHQvL3ByaXZhdGUgX21vdXNlM0RNYW5hZ2VyOmF3YXkubWFuYWdlcnMuTW91c2UzRE1hbmFnZXI7XG5cdC8vcHJpdmF0ZSBfdG91Y2gzRE1hbmFnZXI6VG91Y2gzRE1hbmFnZXI7IC8vVE9ETzogaW1lcGxlbWVudCBkZXBlbmRlbmN5IFRvdWNoM0RNYW5hZ2VyXG5cblx0cHJpdmF0ZSBfaW5pdGlhbGlzZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuXG5cdHByaXZhdGUgX2J1ZmZlckZvcm1hdERpY3Rpb25hcnk6QXJyYXk8QXJyYXk8c3RyaW5nPj4gPSBuZXcgQXJyYXk8QXJyYXk8c3RyaW5nPj4oNSk7XG5cblx0Y29uc3RydWN0b3IoY29udGFpbmVyOkhUTUxDYW52YXNFbGVtZW50LCBzdGFnZUluZGV4Om51bWJlciwgc3RhZ2VNYW5hZ2VyOlN0YWdlTWFuYWdlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2ltYWdlT2JqZWN0UG9vbCA9IG5ldyBJbWFnZU9iamVjdFBvb2wodGhpcyk7XG5cdFx0dGhpcy5fYXR0cmlidXRlc0J1ZmZlclZPUG9vbCA9IG5ldyBBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sKHRoaXMpO1xuXHRcdHRoaXMuX3Byb2dyYW1EYXRhUG9vbCA9IG5ldyBQcm9ncmFtRGF0YVBvb2wodGhpcyk7XG5cblx0XHR0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG5cblx0XHR0aGlzLl9zdGFnZUluZGV4ID0gc3RhZ2VJbmRleDtcblxuXHRcdHRoaXMuX3N0YWdlTWFuYWdlciA9IHN0YWdlTWFuYWdlcjtcblxuXHRcdHRoaXMuX3ZpZXdQb3J0ID0gbmV3IFJlY3RhbmdsZSgpO1xuXG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gdHJ1ZTtcblxuXHRcdENTUy5zZXRFbGVtZW50WCh0aGlzLl9jb250YWluZXIsIDApO1xuXHRcdENTUy5zZXRFbGVtZW50WSh0aGlzLl9jb250YWluZXIsIDApO1xuXG5cdFx0dGhpcy5fYnVmZmVyRm9ybWF0RGljdGlvbmFyeVsxXSA9IG5ldyBBcnJheTxzdHJpbmc+KDUpO1xuXHRcdHRoaXMuX2J1ZmZlckZvcm1hdERpY3Rpb25hcnlbMV1bNF0gPSBDb250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXQuQllURVNfNDtcblx0XHR0aGlzLl9idWZmZXJGb3JtYXREaWN0aW9uYXJ5WzRdID0gbmV3IEFycmF5PHN0cmluZz4oNSk7XG5cdFx0dGhpcy5fYnVmZmVyRm9ybWF0RGljdGlvbmFyeVs0XVsxXSA9IENvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdC5GTE9BVF8xO1xuXHRcdHRoaXMuX2J1ZmZlckZvcm1hdERpY3Rpb25hcnlbNF1bMl0gPSBDb250ZXh0R0xWZXJ0ZXhCdWZmZXJGb3JtYXQuRkxPQVRfMjtcblx0XHR0aGlzLl9idWZmZXJGb3JtYXREaWN0aW9uYXJ5WzRdWzNdID0gQ29udGV4dEdMVmVydGV4QnVmZmVyRm9ybWF0LkZMT0FUXzM7XG5cdFx0dGhpcy5fYnVmZmVyRm9ybWF0RGljdGlvbmFyeVs0XVs0XSA9IENvbnRleHRHTFZlcnRleEJ1ZmZlckZvcm1hdC5GTE9BVF80O1xuXG5cdFx0dGhpcy52aXNpYmxlID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXRQcm9ncmFtRGF0YSh2ZXJ0ZXhTdHJpbmc6c3RyaW5nLCBmcmFnbWVudFN0cmluZzpzdHJpbmcpOlByb2dyYW1EYXRhXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcHJvZ3JhbURhdGFQb29sLmdldEl0ZW0odmVydGV4U3RyaW5nLCBmcmFnbWVudFN0cmluZyk7XG5cdH1cblxuXHRwdWJsaWMgc2V0UmVuZGVyVGFyZ2V0KHRhcmdldDpJbWFnZUJhc2UsIGVuYWJsZURlcHRoQW5kU3RlbmNpbDpib29sZWFuID0gZmFsc2UsIHN1cmZhY2VTZWxlY3RvcjpudW1iZXIgPSAwKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3JlbmRlclRhcmdldCA9PT0gdGFyZ2V0ICYmIHN1cmZhY2VTZWxlY3RvciA9PSB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgJiYgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID09IGVuYWJsZURlcHRoQW5kU3RlbmNpbClcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX3JlbmRlclRhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3IgPSBzdXJmYWNlU2VsZWN0b3I7XG5cdFx0dGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsID0gZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHRcdGlmICh0YXJnZXQpIHtcblx0XHRcdHRoaXMuX2NvbnRleHQuc2V0UmVuZGVyVG9UZXh0dXJlKHRoaXMuZ2V0SW1hZ2VPYmplY3QodGFyZ2V0KS5nZXRUZXh0dXJlKHRoaXMuX2NvbnRleHQpLCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwsIHRoaXMuX2FudGlBbGlhcywgc3VyZmFjZVNlbGVjdG9yKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY29udGV4dC5zZXRSZW5kZXJUb0JhY2tCdWZmZXIoKTtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldEltYWdlT2JqZWN0KGltYWdlOkltYWdlQmFzZSk6SW1hZ2VPYmplY3RCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faW1hZ2VPYmplY3RQb29sLmdldEl0ZW0oaW1hZ2UpO1xuXHR9XG5cblx0cHVibGljIGdldEF0dHJpYnV0ZXNCdWZmZXJWTyhhdHRyaWJ1dGVzQnVmZmVyOkF0dHJpYnV0ZXNCdWZmZXIpOkF0dHJpYnV0ZXNCdWZmZXJWT1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXJWT1Bvb2wuZ2V0SXRlbShhdHRyaWJ1dGVzQnVmZmVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhIENvbnRleHQgb2JqZWN0IHRvIGF0dGFjaCB0byB0aGUgbWFuYWdlZCBnbCBjYW52YXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVxdWVzdENvbnRleHQoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKVxuXHR7XG5cdFx0Ly8gSWYgZm9yY2luZyBzb2Z0d2FyZSwgd2UgY2FuIGJlIGNlcnRhaW4gdGhhdCB0aGVcblx0XHQvLyByZXR1cm5lZCBDb250ZXh0IHdpbGwgYmUgcnVubmluZyBzb2Z0d2FyZSBtb2RlLlxuXHRcdC8vIElmIG5vdCwgd2UgY2FuJ3QgYmUgc3VyZSBhbmQgc2hvdWxkIHN0aWNrIHRvIHRoZVxuXHRcdC8vIG9sZCB2YWx1ZSAod2lsbCBsaWtlbHkgYmUgc2FtZSBpZiByZS1yZXF1ZXN0aW5nLilcblxuXHRcdGlmICh0aGlzLl91c2VzU29mdHdhcmVSZW5kZXJpbmcgIT0gbnVsbClcblx0XHRcdHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZyA9IGZvcmNlU29mdHdhcmU7XG5cblx0XHR0aGlzLl9wcm9maWxlID0gcHJvZmlsZTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAobW9kZSA9PSBDb250ZXh0TW9kZS5GTEFTSClcblx0XHRcdFx0bmV3IENvbnRleHRTdGFnZTNEKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyLCAoY29udGV4dDpJQ29udGV4dEdMKSA9PiB0aGlzLl9jYWxsYmFjayhjb250ZXh0KSk7XG5cdFx0XHRlbHNlIGlmKG1vZGUgPT0gQ29udGV4dE1vZGUuU09GVFdBUkUpXG5cdFx0XHRcdHRoaXMuX2NvbnRleHQgPSBuZXcgQ29udGV4dFNvZnR3YXJlKDxIVE1MQ2FudmFzRWxlbWVudD4gdGhpcy5fY29udGFpbmVyKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhpcy5fY29udGV4dCA9IG5ldyBDb250ZXh0V2ViR0woPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIpO1xuXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKG1vZGUgPT0gQ29udGV4dE1vZGUuQVVUTylcblx0XHRcdFx0XHRuZXcgQ29udGV4dFN0YWdlM0QoPEhUTUxDYW52YXNFbGVtZW50PiB0aGlzLl9jb250YWluZXIsIChjb250ZXh0OklDb250ZXh0R0wpID0+IHRoaXMuX2NhbGxiYWNrKGNvbnRleHQpKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRXZlbnQuRVJST1IpKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFdmVudC5FUlJPUikpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpXG5cdFx0XHR0aGlzLl9jYWxsYmFjayh0aGlzLl9jb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2lkdGggb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB3aWR0aCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fd2lkdGg7XG5cdH1cblxuXHRwdWJsaWMgc2V0IHdpZHRoKHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fd2lkdGggPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRXaWR0aCh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cblx0XHR0aGlzLl93aWR0aCA9IHRoaXMuX3ZpZXdQb3J0LndpZHRoID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhlaWdodCBvZiB0aGUgZ2wgY2FudmFzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGhlaWdodCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0cHVibGljIHNldCBoZWlnaHQodmFsOm51bWJlcilcblx0e1xuXHRcdGlmICh0aGlzLl9oZWlnaHQgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRIZWlnaHQodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5faGVpZ2h0ID0gdGhpcy5fdmlld1BvcnQuaGVpZ2h0ID0gdmFsO1xuXG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblxuXHRcdHRoaXMubm90aWZ5Vmlld3BvcnRVcGRhdGVkKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHggcG9zaXRpb24gb2YgdGhlIGdsIGNhbnZhc1xuXHQgKi9cblx0cHVibGljIGdldCB4KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl94O1xuXHR9XG5cblx0cHVibGljIHNldCB4KHZhbDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5feCA9PSB2YWwpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRDU1Muc2V0RWxlbWVudFgodGhpcy5fY29udGFpbmVyLCB2YWwpO1xuXG5cdFx0dGhpcy5feCA9IHRoaXMuX3ZpZXdQb3J0LnggPSB2YWw7XG5cblx0XHR0aGlzLm5vdGlmeVZpZXdwb3J0VXBkYXRlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB5IHBvc2l0aW9uIG9mIHRoZSBnbCBjYW52YXNcblx0ICovXG5cdHB1YmxpYyBnZXQgeSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5feTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgeSh2YWw6bnVtYmVyKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3kgPT0gdmFsKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Q1NTLnNldEVsZW1lbnRZKHRoaXMuX2NvbnRhaW5lciwgdmFsKTtcblxuXHRcdHRoaXMuX3kgPSB0aGlzLl92aWV3UG9ydC55ID0gdmFsO1xuXG5cdFx0dGhpcy5ub3RpZnlWaWV3cG9ydFVwZGF0ZWQoKTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgdmlzaWJsZSh2YWw6Ym9vbGVhbilcblx0e1xuXHRcdENTUy5zZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIsIHZhbCk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IHZpc2libGUoKVxuXHR7XG5cdFx0cmV0dXJuIENTUy5nZXRFbGVtZW50VmlzaWJpbGl0eSh0aGlzLl9jb250YWluZXIpO1xuXHR9XG5cblx0cHVibGljIGdldCBjb250YWluZXIoKTpIVE1MRWxlbWVudFxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQ29udGV4dCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBzdGFnZSBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNvbnRleHQoKTpJQ29udGV4dEdMXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY29udGV4dDtcblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5Vmlld3BvcnRVcGRhdGVkKClcblx0e1xuXHRcdGlmICh0aGlzLl92aWV3cG9ydERpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IHRydWU7XG5cblx0XHQvL2lmICghdGhpcy5oYXNFdmVudExpc3RlbmVyKFN0YWdlRXZlbnQuVklFV1BPUlRfVVBEQVRFRCkpXG5cdFx0Ly9yZXR1cm47XG5cblx0XHQvL2lmICghX3ZpZXdwb3J0VXBkYXRlZClcblx0XHR0aGlzLl92aWV3cG9ydFVwZGF0ZWQgPSBuZXcgU3RhZ2VFdmVudChTdGFnZUV2ZW50LlZJRVdQT1JUX1VQREFURUQpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3ZpZXdwb3J0VXBkYXRlZCk7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeUVudGVyRnJhbWUoKVxuXHR7XG5cdFx0Ly9pZiAoIWhhc0V2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9lbnRlckZyYW1lKVxuXHRcdFx0dGhpcy5fZW50ZXJGcmFtZSA9IG5ldyBFdmVudChFdmVudC5FTlRFUl9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZW50ZXJGcmFtZSk7XG5cblx0fVxuXG5cdHByaXZhdGUgbm90aWZ5RXhpdEZyYW1lKClcblx0e1xuXHRcdC8vaWYgKCFoYXNFdmVudExpc3RlbmVyKEV2ZW50LkVYSVRfRlJBTUUpKVxuXHRcdC8vcmV0dXJuO1xuXG5cdFx0aWYgKCF0aGlzLl9leGl0RnJhbWUpXG5cdFx0XHR0aGlzLl9leGl0RnJhbWUgPSBuZXcgRXZlbnQoRXZlbnQuRVhJVF9GUkFNRSk7XG5cblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQodGhpcy5fZXhpdEZyYW1lKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcHJvZmlsZSgpOnN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3Byb2ZpbGU7XG5cdH1cblxuXHQvKipcblx0ICogRGlzcG9zZXMgdGhlIFN0YWdlIG9iamVjdCwgZnJlZWluZyB0aGUgQ29udGV4dCBhdHRhY2hlZCB0byB0aGUgU3RhZ2UuXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIuaVJlbW92ZVN0YWdlKHRoaXMpO1xuXHRcdHRoaXMuZnJlZUNvbnRleHQoKTtcblx0XHR0aGlzLl9zdGFnZU1hbmFnZXIgPSBudWxsO1xuXHRcdHRoaXMuX3N0YWdlSW5kZXggPSAtMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmVzIHRoZSBiYWNrIGJ1ZmZlciBhc3NvY2lhdGVkIHdpdGggdGhlIFN0YWdlIG9iamVjdC5cblx0ICogQHBhcmFtIGJhY2tCdWZmZXJXaWR0aCBUaGUgd2lkdGggb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBiYWNrQnVmZmVySGVpZ2h0IFRoZSBoZWlnaHQgb2YgdGhlIGJhY2tidWZmZXIuXG5cdCAqIEBwYXJhbSBhbnRpQWxpYXMgVGhlIGFtb3VudCBvZiBhbnRpLWFsaWFzaW5nIHRvIHVzZS5cblx0ICogQHBhcmFtIGVuYWJsZURlcHRoQW5kU3RlbmNpbCBJbmRpY2F0ZXMgd2hldGhlciB0aGUgYmFjayBidWZmZXIgY29udGFpbnMgYSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGg6bnVtYmVyLCBiYWNrQnVmZmVySGVpZ2h0Om51bWJlciwgYW50aUFsaWFzOm51bWJlciwgZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLndpZHRoID0gYmFja0J1ZmZlcldpZHRoO1xuXHRcdHRoaXMuaGVpZ2h0ID0gYmFja0J1ZmZlckhlaWdodDtcblxuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cblx0XHRpZiAodGhpcy5fY29udGV4dClcblx0XHRcdHRoaXMuX2NvbnRleHQuY29uZmlndXJlQmFja0J1ZmZlcihiYWNrQnVmZmVyV2lkdGgsIGJhY2tCdWZmZXJIZWlnaHQsIGFudGlBbGlhcywgZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblx0fVxuXG5cdC8qXG5cdCAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkZXB0aCBhbmQgc3RlbmNpbCBidWZmZXIgaXMgdXNlZFxuXHQgKi9cblx0cHVibGljIGdldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsO1xuXHR9XG5cblx0cHVibGljIHNldCBlbmFibGVEZXB0aEFuZFN0ZW5jaWwoZW5hYmxlRGVwdGhBbmRTdGVuY2lsOmJvb2xlYW4pXG5cdHtcblx0XHR0aGlzLl9lbmFibGVEZXB0aEFuZFN0ZW5jaWwgPSBlbmFibGVEZXB0aEFuZFN0ZW5jaWw7XG5cdFx0dGhpcy5fYmFja0J1ZmZlckRpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVuZGVyVGFyZ2V0KCk6SW1hZ2VCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyVGFyZ2V0O1xuXHR9XG5cblx0cHVibGljIGdldCByZW5kZXJTdXJmYWNlU2VsZWN0b3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJTdXJmYWNlU2VsZWN0b3I7XG5cdH1cblxuXHQvKlxuXHQgKiBDbGVhciBhbmQgcmVzZXQgdGhlIGJhY2sgYnVmZmVyIHdoZW4gdXNpbmcgYSBzaGFyZWQgY29udGV4dFxuXHQgKi9cblx0cHVibGljIGNsZWFyKClcblx0e1xuXHRcdGlmICghdGhpcy5fY29udGV4dClcblx0XHRcdHJldHVybjtcblxuXHRcdGlmICh0aGlzLl9iYWNrQnVmZmVyRGlydHkpIHtcblx0XHRcdHRoaXMuY29uZmlndXJlQmFja0J1ZmZlcih0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0LCB0aGlzLl9hbnRpQWxpYXMsIHRoaXMuX2VuYWJsZURlcHRoQW5kU3RlbmNpbCk7XG5cdFx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9jb250ZXh0LmNsZWFyKCggdGhpcy5fY29sb3IgJiAweGZmMDAwMDAwICkgPj4+IDI0LCAvLyA8LS0tLS0tLS0tIFplcm8tZmlsbCByaWdodCBzaGlmdFxuXHRcdFx0XHRcdFx0XHQgICggdGhpcy5fY29sb3IgJiAweGZmMDAwMCApID4+PiAxNiwgLy8gPC0tLS0tLS0tLS0tLS18XG5cdFx0XHRcdFx0XHRcdCAgKCB0aGlzLl9jb2xvciAmIDB4ZmYwMCApID4+PiA4LCAvLyA8LS0tLS0tLS0tLS0tLS0tLXxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9jb2xvciAmIDB4ZmYpO1xuXG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvYmplY3Qgd2l0aCBhbiBFdmVudERpc3BhdGNoZXIgb2JqZWN0IHNvIHRoYXQgdGhlIGxpc3RlbmVyIHJlY2VpdmVzIG5vdGlmaWNhdGlvbiBvZiBhbiBldmVudC4gU3BlY2lhbCBjYXNlIGZvciBlbnRlcmZyYW1lIGFuZCBleGl0ZnJhbWUgZXZlbnRzIC0gd2lsbCBzd2l0Y2ggU3RhZ2VQcm94eSBpbnRvIGF1dG9tYXRpYyByZW5kZXIgbW9kZS5cblx0ICogWW91IGNhbiByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgb24gYWxsIG5vZGVzIGluIHRoZSBkaXNwbGF5IGxpc3QgZm9yIGEgc3BlY2lmaWMgdHlwZSBvZiBldmVudCwgcGhhc2UsIGFuZCBwcmlvcml0eS5cblx0ICpcblx0ICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdGhhdCBwcm9jZXNzZXMgdGhlIGV2ZW50LlxuXHQgKiBAcGFyYW0gdXNlQ2FwdHVyZSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGxpc3RlbmVyIHdvcmtzIGluIHRoZSBjYXB0dXJlIHBoYXNlIG9yIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcy4gSWYgdXNlQ2FwdHVyZSBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGxpc3RlbmVyIHByb2Nlc3NlcyB0aGUgZXZlbnQgb25seSBkdXJpbmcgdGhlIGNhcHR1cmUgcGhhc2UgYW5kIG5vdCBpbiB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBJZiB1c2VDYXB0dXJlIGlzIGZhbHNlLCB0aGUgbGlzdGVuZXIgcHJvY2Vzc2VzIHRoZSBldmVudCBvbmx5IGR1cmluZyB0aGUgdGFyZ2V0IG9yIGJ1YmJsaW5nIHBoYXNlLiBUbyBsaXN0ZW4gZm9yIHRoZSBldmVudCBpbiBhbGwgdGhyZWUgcGhhc2VzLCBjYWxsIGFkZEV2ZW50TGlzdGVuZXIgdHdpY2UsIG9uY2Ugd2l0aCB1c2VDYXB0dXJlIHNldCB0byB0cnVlLCB0aGVuIGFnYWluIHdpdGggdXNlQ2FwdHVyZSBzZXQgdG8gZmFsc2UuXG5cdCAqIEBwYXJhbSBwcmlvcml0eSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBUaGUgcHJpb3JpdHkgaXMgZGVzaWduYXRlZCBieSBhIHNpZ25lZCAzMi1iaXQgaW50ZWdlci4gVGhlIGhpZ2hlciB0aGUgbnVtYmVyLCB0aGUgaGlnaGVyIHRoZSBwcmlvcml0eS4gQWxsIGxpc3RlbmVycyB3aXRoIHByaW9yaXR5IG4gYXJlIHByb2Nlc3NlZCBiZWZvcmUgbGlzdGVuZXJzIG9mIHByaW9yaXR5IG4tMS4gSWYgdHdvIG9yIG1vcmUgbGlzdGVuZXJzIHNoYXJlIHRoZSBzYW1lIHByaW9yaXR5LCB0aGV5IGFyZSBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC4gVGhlIGRlZmF1bHQgcHJpb3JpdHkgaXMgMC5cblx0ICogQHBhcmFtIHVzZVdlYWtSZWZlcmVuY2UgRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGxpc3RlbmVyIGlzIHN0cm9uZyBvciB3ZWFrLiBBIHN0cm9uZyByZWZlcmVuY2UgKHRoZSBkZWZhdWx0KSBwcmV2ZW50cyB5b3VyIGxpc3RlbmVyIGZyb20gYmVpbmcgZ2FyYmFnZS1jb2xsZWN0ZWQuIEEgd2VhayByZWZlcmVuY2UgZG9lcyBub3QuXG5cdCAqL1xuXHRwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOnN0cmluZywgbGlzdGVuZXI6RnVuY3Rpb24pXG5cdHtcblx0XHRzdXBlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcblxuXHRcdC8vYXdheS5EZWJ1Zy50aHJvd1BJUiggJ1N0YWdlUHJveHknICwgJ2FkZEV2ZW50TGlzdGVuZXInICwgICdFbnRlckZyYW1lLCBFeGl0RnJhbWUnKTtcblxuXHRcdC8vaWYgKCh0eXBlID09IEV2ZW50LkVOVEVSX0ZSQU1FIHx8IHR5cGUgPT0gRXZlbnQuRVhJVF9GUkFNRSkgKXsvLyYmICEgdGhpcy5fZnJhbWVFdmVudERyaXZlci5oYXNFdmVudExpc3RlbmVyKEV2ZW50LkVOVEVSX0ZSQU1FKSl7XG5cblx0XHQvL19mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cdFx0Ly99XG5cblx0XHQvKiBPcmlnaW5hbCBjb2RlXG5cdFx0IGlmICgodHlwZSA9PSBFdmVudC5FTlRFUl9GUkFNRSB8fCB0eXBlID09IEV2ZW50LkVYSVRfRlJBTUUpICYmICEgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpe1xuXG5cdFx0IF9mcmFtZUV2ZW50RHJpdmVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIG9uRW50ZXJGcmFtZSwgdXNlQ2FwdHVyZSwgcHJpb3JpdHksIHVzZVdlYWtSZWZlcmVuY2UpO1xuXG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudERpc3BhdGNoZXIgb2JqZWN0LiBTcGVjaWFsIGNhc2UgZm9yIGVudGVyZnJhbWUgYW5kIGV4aXRmcmFtZSBldmVudHMgLSB3aWxsIHN3aXRjaCBTdGFnZVByb3h5IG91dCBvZiBhdXRvbWF0aWMgcmVuZGVyIG1vZGUuXG5cdCAqIElmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIGxpc3RlbmVyIHJlZ2lzdGVyZWQgd2l0aCB0aGUgRXZlbnREaXNwYXRjaGVyIG9iamVjdCwgYSBjYWxsIHRvIHRoaXMgbWV0aG9kIGhhcyBubyBlZmZlY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50LlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIG9iamVjdCB0byByZW1vdmUuXG5cdCAqIEBwYXJhbSB1c2VDYXB0dXJlIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBsaXN0ZW5lciB3YXMgcmVnaXN0ZXJlZCBmb3IgdGhlIGNhcHR1cmUgcGhhc2Ugb3IgdGhlIHRhcmdldCBhbmQgYnViYmxpbmcgcGhhc2VzLiBJZiB0aGUgbGlzdGVuZXIgd2FzIHJlZ2lzdGVyZWQgZm9yIGJvdGggdGhlIGNhcHR1cmUgcGhhc2UgYW5kIHRoZSB0YXJnZXQgYW5kIGJ1YmJsaW5nIHBoYXNlcywgdHdvIGNhbGxzIHRvIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSBhcmUgcmVxdWlyZWQgdG8gcmVtb3ZlIGJvdGgsIG9uZSBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byB0cnVlLCBhbmQgYW5vdGhlciBjYWxsIHdpdGggdXNlQ2FwdHVyZSgpIHNldCB0byBmYWxzZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6c3RyaW5nLCBsaXN0ZW5lcjpGdW5jdGlvbilcblx0e1xuXHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXG5cdFx0Lypcblx0XHQgLy8gUmVtb3ZlIHRoZSBtYWluIHJlbmRlcmluZyBsaXN0ZW5lciBpZiBubyBFbnRlckZyYW1lIGxpc3RlbmVycyByZW1haW5cblx0XHQgaWYgKCAgICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSAsIHRoaXMub25FbnRlckZyYW1lICwgdGhpcyApXG5cdFx0ICYmICAhIHRoaXMuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FWElUX0ZSQU1FICwgdGhpcy5vbkVudGVyRnJhbWUgLCB0aGlzKSApIC8vJiYgX2ZyYW1lRXZlbnREcml2ZXIuaGFzRXZlbnRMaXN0ZW5lcihFdmVudC5FTlRFUl9GUkFNRSkpXG5cdFx0IHtcblxuXHRcdCAvL19mcmFtZUV2ZW50RHJpdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuRU5URVJfRlJBTUUsIHRoaXMub25FbnRlckZyYW1lLCB0aGlzICk7XG5cblx0XHQgfVxuXHRcdCAqL1xuXHR9XG5cblx0cHVibGljIGdldCBzY2lzc29yUmVjdCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NjaXNzb3JSZWN0O1xuXHR9XG5cblx0cHVibGljIHNldCBzY2lzc29yUmVjdCh2YWx1ZTpSZWN0YW5nbGUpXG5cdHtcblx0XHR0aGlzLl9zY2lzc29yUmVjdCA9IHZhbHVlO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTY2lzc29yUmVjdGFuZ2xlKHRoaXMuX3NjaXNzb3JSZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggb2YgdGhlIFN0YWdlIHdoaWNoIGlzIG1hbmFnZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBTdGFnZVByb3h5LlxuXHQgKi9cblx0cHVibGljIGdldCBzdGFnZUluZGV4KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhZ2VJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgU3RhZ2UgbWFuYWdlZCBieSB0aGlzIHByb3h5IGlzIHJ1bm5pbmcgaW4gc29mdHdhcmUgbW9kZS5cblx0ICogUmVtZW1iZXIgdG8gd2FpdCBmb3IgdGhlIENPTlRFWFRfQ1JFQVRFRCBldmVudCBiZWZvcmUgY2hlY2tpbmcgdGhpcyBwcm9wZXJ0eSxcblx0ICogYXMgb25seSB0aGVuIHdpbGwgaXQgYmUgZ3VhcmFudGVlZCB0byBiZSBhY2N1cmF0ZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgdXNlc1NvZnR3YXJlUmVuZGVyaW5nKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZXNTb2Z0d2FyZVJlbmRlcmluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW50aUFsaWFzaW5nIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYW50aUFsaWFzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW50aUFsaWFzO1xuXHR9XG5cblx0cHVibGljIHNldCBhbnRpQWxpYXMoYW50aUFsaWFzOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2FudGlBbGlhcyA9IGFudGlBbGlhcztcblx0XHR0aGlzLl9iYWNrQnVmZmVyRGlydHkgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgdmlld1BvcnQgcmVjdGFuZ2xlIGVxdWl2YWxlbnQgb2YgdGhlIFN0YWdlIHNpemUgYW5kIHBvc2l0aW9uLlxuXHQgKi9cblx0cHVibGljIGdldCB2aWV3UG9ydCgpOlJlY3RhbmdsZVxuXHR7XG5cdFx0dGhpcy5fdmlld3BvcnREaXJ0eSA9IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdQb3J0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBTdGFnZS5cblx0ICovXG5cdHB1YmxpYyBnZXQgY29sb3IoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jb2xvcjtcblx0fVxuXG5cdHB1YmxpYyBzZXQgY29sb3IoY29sb3I6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fY29sb3IgPSBjb2xvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZnJlc2hseSBjbGVhcmVkIHN0YXRlIG9mIHRoZSBiYWNrYnVmZmVyIGJlZm9yZSBhbnkgcmVuZGVyaW5nXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGJ1ZmZlckNsZWFyKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2J1ZmZlckNsZWFyO1xuXHR9XG5cblx0cHVibGljIHNldCBidWZmZXJDbGVhcihuZXdCdWZmZXJDbGVhcjpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fYnVmZmVyQ2xlYXIgPSBuZXdCdWZmZXJDbGVhcjtcblx0fVxuXG5cblx0cHVibGljIHJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHZhciBpOm51bWJlciA9IDA7XG5cdFx0d2hpbGUgKHRoaXMuX3Byb2dyYW1EYXRhW2ldICE9IG51bGwpXG5cdFx0XHRpKys7XG5cblx0XHR0aGlzLl9wcm9ncmFtRGF0YVtpXSA9IHByb2dyYW1EYXRhO1xuXHRcdHByb2dyYW1EYXRhLmlkID0gaTtcblx0fVxuXG5cdHB1YmxpYyB1blJlZ2lzdGVyUHJvZ3JhbShwcm9ncmFtRGF0YTpQcm9ncmFtRGF0YSlcblx0e1xuXHRcdHRoaXMuX3Byb2dyYW1EYXRhW3Byb2dyYW1EYXRhLmlkXSA9IG51bGw7XG5cdFx0cHJvZ3JhbURhdGEuaWQgPSAtMTtcblx0fVxuXG5cdC8qXG5cdCAqIEFjY2VzcyB0byBmaXJlIG1vdXNlZXZlbnRzIGFjcm9zcyBtdWx0aXBsZSBsYXllcmVkIHZpZXczRCBpbnN0YW5jZXNcblx0ICovXG5cdC8vXHRcdHB1YmxpYyBnZXQgbW91c2UzRE1hbmFnZXIoKTpNb3VzZTNETWFuYWdlclxuXHQvL1x0XHR7XG5cdC8vXHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlM0RNYW5hZ2VyO1xuXHQvL1x0XHR9XG5cdC8vXG5cdC8vXHRcdHB1YmxpYyBzZXQgbW91c2UzRE1hbmFnZXIodmFsdWU6TW91c2UzRE1hbmFnZXIpXG5cdC8vXHRcdHtcblx0Ly9cdFx0XHR0aGlzLl9tb3VzZTNETWFuYWdlciA9IHZhbHVlO1xuXHQvL1x0XHR9XG5cblx0LyogVE9ETzogaW1wbGVtZW50IGRlcGVuZGVuY3kgVG91Y2gzRE1hbmFnZXJcblx0IHB1YmxpYyBnZXQgdG91Y2gzRE1hbmFnZXIoKTpUb3VjaDNETWFuYWdlclxuXHQge1xuXHQgcmV0dXJuIF90b3VjaDNETWFuYWdlcjtcblx0IH1cblxuXHQgcHVibGljIHNldCB0b3VjaDNETWFuYWdlcih2YWx1ZTpUb3VjaDNETWFuYWdlcilcblx0IHtcblx0IF90b3VjaDNETWFuYWdlciA9IHZhbHVlO1xuXHQgfVxuXHQgKi9cblxuXHQvKipcblx0ICogRnJlZXMgdGhlIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgU3RhZ2VQcm94eS5cblx0ICovXG5cdHByaXZhdGUgZnJlZUNvbnRleHQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2NvbnRleHQpIHtcblx0XHRcdHRoaXMuX2NvbnRleHQuZGlzcG9zZSgpO1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBFbnRlcl9GcmFtZSBoYW5kbGVyIGZvciBwcm9jZXNzaW5nIHRoZSBwcm94eS5FTlRFUl9GUkFNRSBhbmQgcHJveHkuRVhJVF9GUkFNRSBldmVudCBoYW5kbGVycy5cblx0ICogVHlwaWNhbGx5IHRoZSBwcm94eS5FTlRFUl9GUkFNRSBsaXN0ZW5lciB3b3VsZCByZW5kZXIgdGhlIGxheWVycyBmb3IgdGhpcyBTdGFnZSBpbnN0YW5jZS5cblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWdlIGluc3RhbmNlXG5cdFx0dGhpcy5jbGVhcigpO1xuXHRcdC8vbm90aWZ5IHRoZSBlbnRlcmZyYW1lIGxpc3RlbmVyc1xuXHRcdHRoaXMubm90aWZ5RW50ZXJGcmFtZSgpO1xuXHRcdC8vIENhbGwgdGhlIHByZXNlbnQoKSB0byByZW5kZXIgdGhlIGZyYW1lXG5cdFx0aWYgKCF0aGlzLl9jb250ZXh0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5wcmVzZW50KCk7XG5cdFx0Ly9ub3RpZnkgdGhlIGV4aXRmcmFtZSBsaXN0ZW5lcnNcblx0XHR0aGlzLm5vdGlmeUV4aXRGcmFtZSgpO1xuXHR9XG5cblx0cHVibGljIHJlY292ZXJGcm9tRGlzcG9zYWwoKTpib29sZWFuXG5cdHtcblx0XHRpZiAoIXRoaXMuX2NvbnRleHQpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvL2F3YXkuRGVidWcudGhyb3dQSVIoICdTdGFnZVByb3h5JyAsICdyZWNvdmVyRnJvbURpc3Bvc2FsJyAsICcnICk7XG5cblx0XHQvKlxuXHRcdCBpZiAodGhpcy5faUNvbnRleHQuZHJpdmVySW5mbyA9PSBcIkRpc3Bvc2VkXCIpXG5cdFx0IHtcblx0XHQgdGhpcy5faUNvbnRleHQgPSBudWxsO1xuXHRcdCB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFN0YWdlRXZlbnQoU3RhZ2VFdmVudC5DT05URVhUX0RJU1BPU0VEKSk7XG5cdFx0IHJldHVybiBmYWxzZTtcblxuXHRcdCB9XG5cdFx0ICovXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fVxuXG5cdHByaXZhdGUgX2NhbGxiYWNrKGNvbnRleHQ6SUNvbnRleHRHTClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXG5cdFx0dGhpcy5fY29udGFpbmVyID0gdGhpcy5fY29udGV4dC5jb250YWluZXI7XG5cblx0XHQvLyBPbmx5IGNvbmZpZ3VyZSBiYWNrIGJ1ZmZlciBpZiB3aWR0aCBhbmQgaGVpZ2h0IGhhdmUgYmVlbiBzZXQsXG5cdFx0Ly8gd2hpY2ggdGhleSBtYXkgbm90IGhhdmUgYmVlbiBpZiBWaWV3LnJlbmRlcigpIGhhcyB5ZXQgdG8gYmVcblx0XHQvLyBpbnZva2VkIGZvciB0aGUgZmlyc3QgdGltZS5cblx0XHRpZiAodGhpcy5fd2lkdGggJiYgdGhpcy5faGVpZ2h0KVxuXHRcdFx0dGhpcy5fY29udGV4dC5jb25maWd1cmVCYWNrQnVmZmVyKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX2FudGlBbGlhcywgdGhpcy5fZW5hYmxlRGVwdGhBbmRTdGVuY2lsKTtcblxuXHRcdC8vIERpc3BhdGNoIHRoZSBhcHByb3ByaWF0ZSBldmVudCBkZXBlbmRpbmcgb24gd2hldGhlciBjb250ZXh0IHdhc1xuXHRcdC8vIGNyZWF0ZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9yIHJlY3JlYXRlZCBhZnRlciBhIGRldmljZSBsb3NzLlxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgU3RhZ2VFdmVudCh0aGlzLl9pbml0aWFsaXNlZD8gU3RhZ2VFdmVudC5DT05URVhUX1JFQ1JFQVRFRCA6IFN0YWdlRXZlbnQuQ09OVEVYVF9DUkVBVEVEKSk7XG5cblx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cdH1cblxuXHRwdWJsaWMgc2V0VmVydGV4QnVmZmVyKGluZGV4Om51bWJlciwgYnVmZmVyOklWZXJ0ZXhCdWZmZXIsIHNpemU6bnVtYmVyLCBkaW1lbnNpb25zOm51bWJlciwgb2Zmc2V0Om51bWJlcilcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQuc2V0VmVydGV4QnVmZmVyQXQoaW5kZXgsIGJ1ZmZlciwgb2Zmc2V0LCB0aGlzLl9idWZmZXJGb3JtYXREaWN0aW9uYXJ5W3NpemVdW2RpbWVuc2lvbnNdKTtcblx0fVxuXG5cdHB1YmxpYyBzZXRTYW1wbGVyU3RhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dmFyIHdyYXA6c3RyaW5nID0gcmVwZWF0PyBDb250ZXh0R0xXcmFwTW9kZS5SRVBFQVQgOkNvbnRleHRHTFdyYXBNb2RlLkNMQU1QO1xuXHRcdHZhciBmaWx0ZXI6c3RyaW5nID0gc21vb3RoPyBDb250ZXh0R0xUZXh0dXJlRmlsdGVyLkxJTkVBUiA6IENvbnRleHRHTFRleHR1cmVGaWx0ZXIuTkVBUkVTVDtcblx0XHR2YXIgbWlwZmlsdGVyOnN0cmluZyA9IG1pcG1hcD8gQ29udGV4dEdMTWlwRmlsdGVyLk1JUExJTkVBUiA6IENvbnRleHRHTE1pcEZpbHRlci5NSVBOT05FO1xuXG5cdFx0dGhpcy5fY29udGV4dC5zZXRTYW1wbGVyU3RhdGVBdChpbmRleCwgd3JhcCwgZmlsdGVyLCBtaXBmaWx0ZXIpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlOyIsImltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xuXG5jbGFzcyBUZXh0dXJlQmFzZVdlYkdMXG57XG5cdHB1YmxpYyB0ZXh0dXJlVHlwZTpzdHJpbmcgPSBcIlwiO1xuXHRwdWJsaWMgX2dsOldlYkdMUmVuZGVyaW5nQ29udGV4dDtcblxuXHRjb25zdHJ1Y3RvcihnbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQpXG5cdHtcblx0XHR0aGlzLl9nbCA9IGdsO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKTp2b2lkXG5cdHtcblx0XHR0aHJvdyBcIkFic3RyYWN0IG1ldGhvZCBtdXN0IGJlIG92ZXJyaWRkZW4uXCI7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGdsVGV4dHVyZSgpOldlYkdMVGV4dHVyZVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxufVxuXG5leHBvcnQgPSBUZXh0dXJlQmFzZVdlYkdMOyIsImltcG9ydCBCeXRlQXJyYXlCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvQnl0ZUFycmF5QmFzZVwiKTtcblxuaW1wb3J0IENvbnRleHRTdGFnZTNEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0U3RhZ2UzRFwiKTtcbmltcG9ydCBJVGV4dHVyZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlXCIpO1xuaW1wb3J0IE9wQ29kZXNcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9PcENvZGVzXCIpO1xuaW1wb3J0IFJlc291cmNlQmFzZUZsYXNoXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvUmVzb3VyY2VCYXNlRmxhc2hcIik7XG5cbmNsYXNzIFRleHR1cmVGbGFzaCBleHRlbmRzIFJlc291cmNlQmFzZUZsYXNoIGltcGxlbWVudHMgSVRleHR1cmVcbntcblx0cHJpdmF0ZSBfY29udGV4dDpDb250ZXh0U3RhZ2UzRDtcblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuXG5cdHB1YmxpYyBnZXQgd2lkdGgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0Y29uc3RydWN0b3IoY29udGV4dDpDb250ZXh0U3RhZ2UzRCwgd2lkdGg6bnVtYmVyLCBoZWlnaHQ6bnVtYmVyLCBmb3JtYXQ6c3RyaW5nLCBmb3JSVFQ6Ym9vbGVhbiwgc3RyZWFtaW5nOmJvb2xlYW4gPSBmYWxzZSlcblx0e1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcblx0XHR0aGlzLl93aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuXHRcdHRoaXMuX2NvbnRleHQuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5pbml0VGV4dHVyZSwgKGZvclJUVD8gT3BDb2Rlcy50cnVlVmFsdWUgOiBPcENvZGVzLmZhbHNlVmFsdWUpKSArIHdpZHRoICsgXCIsXCIgKyBoZWlnaHQgKyBcIixcIiArIHN0cmVhbWluZyArIFwiLFwiICsgZm9ybWF0ICsgXCIkXCIpO1xuXHRcdHRoaXMuX3BJZCA9IHRoaXMuX2NvbnRleHQuZXhlY3V0ZSgpO1xuXHRcdHRoaXMuX2NvbnRleHQuX2lBZGRSZXNvdXJjZSh0aGlzKTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX2NvbnRleHQuYWRkU3RyZWFtKFN0cmluZy5mcm9tQ2hhckNvZGUoT3BDb2Rlcy5kaXNwb3NlVGV4dHVyZSkgKyB0aGlzLl9wSWQudG9TdHJpbmcoKSArIFwiLFwiKTtcblx0XHR0aGlzLl9jb250ZXh0LmV4ZWN1dGUoKTtcblx0XHR0aGlzLl9jb250ZXh0Ll9pUmVtb3ZlUmVzb3VyY2UodGhpcyk7XG5cblx0XHR0aGlzLl9jb250ZXh0ID0gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tRGF0YShpbWFnZTpIVE1MSW1hZ2VFbGVtZW50LCBtaXBsZXZlbD86bnVtYmVyKTtcblx0cHVibGljIHVwbG9hZEZyb21EYXRhKGltYWdlRGF0YTpJbWFnZURhdGEsIG1pcGxldmVsPzpudW1iZXIpO1xuXHRwdWJsaWMgdXBsb2FkRnJvbURhdGEoZGF0YTphbnksIG1pcGxldmVsOm51bWJlciA9IDApXG5cdHtcblx0XHRpZiAoZGF0YSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHtcblx0XHRcdHZhciBjYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0dmFyIHcgPSBkYXRhLndpZHRoO1xuXHRcdFx0dmFyIGggPSBkYXRhLmhlaWdodDtcblx0XHRcdGNhbi53aWR0aCA9IHc7XG5cdFx0XHRjYW4uaGVpZ2h0ID0gaDtcblx0XHRcdHZhciBjdHggPSBjYW4uZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0Y3R4LmRyYXdJbWFnZShkYXRhLCAwLCAwKTtcblx0XHRcdGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHcsIGgpLmRhdGE7XG5cdFx0fVxuXG5cdFx0dmFyIHBvcyA9IDA7XG5cdFx0dmFyIGJ5dGVzID0gQnl0ZUFycmF5QmFzZS5pbnRlcm5hbEdldEJhc2U2NFN0cmluZyhkYXRhLmxlbmd0aCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGRhdGFbcG9zKytdO1xuXHRcdH0sIG51bGwpO1xuXG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnVwbG9hZEJ5dGVzVGV4dHVyZSkgKyB0aGlzLl9wSWQgKyBcIixcIiArIG1pcGxldmVsICsgXCIsXCIgKyAodGhpcy5fd2lkdGggPj4gbWlwbGV2ZWwpICsgXCIsXCIgKyAodGhpcy5faGVpZ2h0ID4+IG1pcGxldmVsKSArIFwiLFwiICsgYnl0ZXMgKyBcIiVcIik7XG5cdFx0dGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdH1cbn1cblxuZXhwb3J0ID0gVGV4dHVyZUZsYXNoOyIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgVGV4dHVyZUJhc2VXZWJHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZUJhc2VXZWJHTFwiKTtcblxuY2xhc3MgVGV4dHVyZVNvZnR3YXJlIGltcGxlbWVudHMgSVRleHR1cmVcbntcbiAgICBwdWJsaWMgdGV4dHVyZVR5cGU6c3RyaW5nID0gXCJ0ZXh0dXJlMmRcIjtcblxuICAgIHByaXZhdGUgX3dpZHRoOm51bWJlcjtcbiAgICBwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuICAgIHByaXZhdGUgX2RhdGE6VWludDhBcnJheTtcbiAgICBwcml2YXRlIF9taXBMZXZlbDpudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDpudW1iZXIsIGhlaWdodDpudW1iZXIpXG4gICAge1xuICAgICAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2UoKVxuICAgIHtcbiAgICAgICAgdGhpcy5fZGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB3aWR0aCgpOm51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6bnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGxvYWRGcm9tRGF0YShpbWFnZTpIVE1MSW1hZ2VFbGVtZW50LCBtaXBsZXZlbD86bnVtYmVyKTtcbiAgICBwdWJsaWMgdXBsb2FkRnJvbURhdGEoaW1hZ2VEYXRhOkltYWdlRGF0YSwgbWlwbGV2ZWw/Om51bWJlcik7XG4gICAgcHVibGljIHVwbG9hZEZyb21EYXRhKGRhdGE6YW55LCBtaXBsZXZlbDpudW1iZXIgPSAwKVxuICAgIHtcbiAgICAgICAgaWYobWlwbGV2ZWwgPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1cGxvYWRGcm9tRGF0YTogXCIrZGF0YStcIiBtaXBsZXZlbDogXCIrbWlwbGV2ZWwpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLl9taXBMZXZlbCA9IG1pcGxldmVsO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGRhdGEoKTpVaW50MzJBcnJheSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cbn1cblxuZXhwb3J0ID0gVGV4dHVyZVNvZnR3YXJlOyIsImltcG9ydCBCeXRlQXJyYXlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0J5dGVBcnJheVwiKTtcblxuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgVGV4dHVyZUJhc2VXZWJHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvVGV4dHVyZUJhc2VXZWJHTFwiKTtcblxuY2xhc3MgVGV4dHVyZVdlYkdMIGV4dGVuZHMgVGV4dHVyZUJhc2VXZWJHTCBpbXBsZW1lbnRzIElUZXh0dXJlXG57XG5cblx0cHVibGljIHRleHR1cmVUeXBlOnN0cmluZyA9IFwidGV4dHVyZTJkXCI7XG5cblx0cHJpdmF0ZSBfd2lkdGg6bnVtYmVyO1xuXHRwcml2YXRlIF9oZWlnaHQ6bnVtYmVyO1xuXG5cdHByaXZhdGUgX2ZyYW1lQnVmZmVyOldlYkdMRnJhbWVidWZmZXI7XG5cblx0cHJpdmF0ZSBfZ2xUZXh0dXJlOldlYkdMVGV4dHVyZTtcblxuXHRjb25zdHJ1Y3RvcihnbDpXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHdpZHRoOm51bWJlciwgaGVpZ2h0Om51bWJlcilcblx0e1xuXHRcdHN1cGVyKGdsKTtcblx0XHR0aGlzLl93aWR0aCA9IHdpZHRoO1xuXHRcdHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuXHRcdHRoaXMuX2dsVGV4dHVyZSA9IHRoaXMuX2dsLmNyZWF0ZVRleHR1cmUoKTtcblx0fVxuXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX2dsLmRlbGV0ZVRleHR1cmUodGhpcy5fZ2xUZXh0dXJlKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgd2lkdGgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl93aWR0aDtcblx0fVxuXG5cdHB1YmxpYyBnZXQgaGVpZ2h0KCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5faGVpZ2h0O1xuXHR9XG5cblx0cHVibGljIGdldCBmcmFtZUJ1ZmZlcigpOldlYkdMRnJhbWVidWZmZXJcblx0e1xuXHRcdGlmICghdGhpcy5fZnJhbWVCdWZmZXIpIHtcblx0XHRcdHRoaXMuX2ZyYW1lQnVmZmVyID0gdGhpcy5fZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcblx0XHRcdHRoaXMuX2dsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLl9nbC5GUkFNRUJVRkZFUiwgdGhpcy5fZnJhbWVCdWZmZXIpO1xuXHRcdFx0dGhpcy5fZ2wuYmluZFRleHR1cmUodGhpcy5fZ2wuVEVYVFVSRV8yRCwgdGhpcy5fZ2xUZXh0dXJlKTtcblx0XHRcdHRoaXMuX2dsLnRleEltYWdlMkQodGhpcy5fZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5fZ2wuUkdCQSwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCwgMCwgdGhpcy5fZ2wuUkdCQSwgdGhpcy5fZ2wuVU5TSUdORURfQllURSwgbnVsbCk7XG5cblx0XHRcdHZhciByZW5kZXJCdWZmZXI6V2ViR0xSZW5kZXJidWZmZXIgPSB0aGlzLl9nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcblx0XHRcdHRoaXMuX2dsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5fZ2wuUkVOREVSQlVGRkVSLCByZW5kZXJCdWZmZXIpO1xuXHRcdFx0dGhpcy5fZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLl9nbC5SRU5ERVJCVUZGRVIsIHRoaXMuX2dsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcblxuXHRcdFx0dGhpcy5fZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5fZ2wuRlJBTUVCVUZGRVIsIHRoaXMuX2dsLkNPTE9SX0FUVEFDSE1FTlQwLCB0aGlzLl9nbC5URVhUVVJFXzJELCB0aGlzLl9nbFRleHR1cmUsIDApO1xuXHRcdFx0dGhpcy5fZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy5fZ2wuRlJBTUVCVUZGRVIsIHRoaXMuX2dsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuX2dsLlJFTkRFUkJVRkZFUiwgcmVuZGVyQnVmZmVyKTtcblxuXHRcdFx0dGhpcy5fZ2wuYmluZFRleHR1cmUodGhpcy5fZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG5cdFx0XHR0aGlzLl9nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuX2dsLlJFTkRFUkJVRkZFUiwgbnVsbCk7XG5cdFx0XHR0aGlzLl9nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5fZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9mcmFtZUJ1ZmZlcjtcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tRGF0YShpbWFnZTpIVE1MSW1hZ2VFbGVtZW50LCBtaXBsZXZlbD86bnVtYmVyKTtcblx0cHVibGljIHVwbG9hZEZyb21EYXRhKGltYWdlRGF0YTpJbWFnZURhdGEsIG1pcGxldmVsPzpudW1iZXIpO1xuXHRwdWJsaWMgdXBsb2FkRnJvbURhdGEoZGF0YTphbnksIG1pcGxldmVsOm51bWJlciA9IDApXG5cdHtcblx0XHR0aGlzLl9nbC5iaW5kVGV4dHVyZSh0aGlzLl9nbC5URVhUVVJFXzJELCB0aGlzLl9nbFRleHR1cmUpO1xuXHRcdHRoaXMuX2dsLnRleEltYWdlMkQodGhpcy5fZ2wuVEVYVFVSRV8yRCwgbWlwbGV2ZWwsIHRoaXMuX2dsLlJHQkEsIHRoaXMuX2dsLlJHQkEsIHRoaXMuX2dsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuXHRcdHRoaXMuX2dsLmJpbmRUZXh0dXJlKHRoaXMuX2dsLlRFWFRVUkVfMkQsIG51bGwpO1xuXHR9XG5cblx0cHVibGljIHVwbG9hZENvbXByZXNzZWRUZXh0dXJlRnJvbUJ5dGVBcnJheShkYXRhOkJ5dGVBcnJheSwgYnl0ZUFycmF5T2Zmc2V0Om51bWJlciAvKnVpbnQqLywgYXN5bmM6Ym9vbGVhbiA9IGZhbHNlKVxuXHR7XG5cdFx0dmFyIGV4dDpPYmplY3QgPSB0aGlzLl9nbC5nZXRFeHRlbnNpb24oXCJXRUJLSVRfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGNcIik7XG5cdFx0Ly90aGlzLl9nbC5jb21wcmVzc2VkVGV4SW1hZ2UyRCh0aGlzLl9nbC5URVhUVVJFXzJELCAwLCB0aGlzKVxuXHR9XG5cblx0cHVibGljIGdldCBnbFRleHR1cmUoKTpXZWJHTFRleHR1cmVcblx0e1xuXHRcdHJldHVybiB0aGlzLl9nbFRleHR1cmU7XG5cdH1cblxuXHRwdWJsaWMgZ2VuZXJhdGVNaXBtYXBzKClcblx0e1xuXHRcdC8vVE9ETzogaW1wbGVtZW50IGdlbmVyYXRpbmcgbWlwbWFwc1xuXHRcdC8vdGhpcy5fZ2wuYmluZFRleHR1cmUoIHRoaXMuX2dsLlRFWFRVUkVfMkQsIHRoaXMuX2dsVGV4dHVyZSApO1xuXHRcdC8vdGhpcy5fZ2wuZ2VuZXJhdGVNaXBtYXAodGhpcy5fZ2wuVEVYVFVSRV8yRCk7XG5cdFx0Ly90aGlzLl9nbC5iaW5kVGV4dHVyZSggdGhpcy5fZ2wuVEVYVFVSRV8yRCwgbnVsbCApO1xuXHR9XG59XG5cbmV4cG9ydCA9IFRleHR1cmVXZWJHTDsiLCJpbXBvcnQgQ29udGV4dFN0YWdlM0RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRTdGFnZTNEXCIpO1xuaW1wb3J0IElWZXJ0ZXhCdWZmZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lWZXJ0ZXhCdWZmZXJcIik7XG5pbXBvcnQgT3BDb2Rlc1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL09wQ29kZXNcIik7XG5pbXBvcnQgUmVzb3VyY2VCYXNlRmxhc2hcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9SZXNvdXJjZUJhc2VGbGFzaFwiKTtcblxuY2xhc3MgVmVydGV4QnVmZmVyRmxhc2ggZXh0ZW5kcyBSZXNvdXJjZUJhc2VGbGFzaCBpbXBsZW1lbnRzIElWZXJ0ZXhCdWZmZXJcbntcblx0cHJpdmF0ZSBfY29udGV4dDpDb250ZXh0U3RhZ2UzRDtcblx0cHJpdmF0ZSBfbnVtVmVydGljZXM6bnVtYmVyO1xuXHRwcml2YXRlIF9kYXRhUGVyVmVydGV4Om51bWJlcjtcblxuXHRjb25zdHJ1Y3Rvcihjb250ZXh0OkNvbnRleHRTdGFnZTNELCBudW1WZXJ0aWNlczpudW1iZXIsIGRhdGFQZXJWZXJ0ZXg6bnVtYmVyKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuXHRcdHRoaXMuX251bVZlcnRpY2VzID0gbnVtVmVydGljZXM7XG5cdFx0dGhpcy5fZGF0YVBlclZlcnRleCA9IGRhdGFQZXJWZXJ0ZXg7XG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLmluaXRWZXJ0ZXhCdWZmZXIsIGRhdGFQZXJWZXJ0ZXggKyBPcENvZGVzLmludE1hc2spICsgbnVtVmVydGljZXMudG9TdHJpbmcoKSArIFwiLFwiKTtcblx0XHR0aGlzLl9wSWQgPSB0aGlzLl9jb250ZXh0LmV4ZWN1dGUoKTtcblx0XHR0aGlzLl9jb250ZXh0Ll9pQWRkUmVzb3VyY2UodGhpcyk7XG5cdH1cblxuXHRwdWJsaWMgdXBsb2FkRnJvbUFycmF5KGRhdGE6bnVtYmVyW10sIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fY29udGV4dC5hZGRTdHJlYW0oU3RyaW5nLmZyb21DaGFyQ29kZShPcENvZGVzLnVwbG9hZEFycmF5VmVydGV4QnVmZmVyLCB0aGlzLl9wSWQgKyBPcENvZGVzLmludE1hc2spICsgZGF0YS5qb2luKCkgKyBcIiNcIiArIFtzdGFydFZlcnRleCwgbnVtVmVydGljZXNdLmpvaW4oKSArIFwiLFwiKTtcblx0XHR0aGlzLl9jb250ZXh0LmV4ZWN1dGUoKTtcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tQnl0ZUFycmF5KGRhdGE6QXJyYXlCdWZmZXIsIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKVxuXHR7XG5cblx0fVxuXG5cdHB1YmxpYyBnZXQgbnVtVmVydGljZXMoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9udW1WZXJ0aWNlcztcblx0fVxuXG5cdHB1YmxpYyBnZXQgZGF0YVBlclZlcnRleCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2RhdGFQZXJWZXJ0ZXg7XG5cdH1cblxuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHR0aGlzLl9jb250ZXh0LmFkZFN0cmVhbShTdHJpbmcuZnJvbUNoYXJDb2RlKE9wQ29kZXMuZGlzcG9zZVZlcnRleEJ1ZmZlciwgdGhpcy5fcElkICsgT3BDb2Rlcy5pbnRNYXNrKSk7XG5cdFx0dGhpcy5fY29udGV4dC5leGVjdXRlKCk7XG5cdFx0dGhpcy5fY29udGV4dC5faVJlbW92ZVJlc291cmNlKHRoaXMpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IG51bGw7XG5cdH1cbn1cblxuZXhwb3J0ID0gVmVydGV4QnVmZmVyRmxhc2g7IiwiaW1wb3J0IElWZXJ0ZXhCdWZmZXIgICAgICAgICAgICAgICAgPSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVZlcnRleEJ1ZmZlclwiKTtcblxuY2xhc3MgVmVydGV4QnVmZmVyU29mdHdhcmUgaW1wbGVtZW50cyBJVmVydGV4QnVmZmVyIHtcbiAgICBwcml2YXRlIF9udW1WZXJ0aWNlczpudW1iZXI7XG4gICAgcHJpdmF0ZSBfZGF0YVBlclZlcnRleDpudW1iZXI7XG4gICAgcHJpdmF0ZSBfZGF0YTpGbG9hdDMyQXJyYXk7XG4gICAgcHJpdmF0ZSBfZGF0YU9mZnNldDpudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihudW1WZXJ0aWNlczpudW1iZXIsIGRhdGFQZXJWZXJ0ZXg6bnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX251bVZlcnRpY2VzID0gbnVtVmVydGljZXM7XG4gICAgICAgIHRoaXMuX2RhdGFQZXJWZXJ0ZXggPSBkYXRhUGVyVmVydGV4O1xuICAgIH1cblxuICAgIHB1YmxpYyB1cGxvYWRGcm9tQXJyYXkodmVydGljZXM6bnVtYmVyW10sIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX2RhdGFPZmZzZXQgPSBzdGFydFZlcnRleCAqIHRoaXMuX2RhdGFQZXJWZXJ0ZXg7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB1cGxvYWRGcm9tQnl0ZUFycmF5KGRhdGE6QXJyYXlCdWZmZXIsIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX2RhdGFPZmZzZXQgPSBzdGFydFZlcnRleCAqIHRoaXMuX2RhdGFQZXJWZXJ0ZXg7XG4gICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbnVtVmVydGljZXMoKTpudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbnVtVmVydGljZXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkYXRhUGVyVmVydGV4KCk6bnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFQZXJWZXJ0ZXg7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBhdHRyaWJ1dGVzUGVyVmVydGV4KCk6bnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFQZXJWZXJ0ZXgvNDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5fZGF0YS5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGF0YSgpOkZsb2F0MzJBcnJheSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGF0YU9mZnNldCgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhT2Zmc2V0O1xuICAgIH1cbn1cblxuZXhwb3J0ID0gVmVydGV4QnVmZmVyU29mdHdhcmU7IiwiaW1wb3J0IElWZXJ0ZXhCdWZmZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lWZXJ0ZXhCdWZmZXJcIik7XG5cbmNsYXNzIFZlcnRleEJ1ZmZlcldlYkdMIGltcGxlbWVudHMgSVZlcnRleEJ1ZmZlclxue1xuXG5cdHByaXZhdGUgX2dsOldlYkdMUmVuZGVyaW5nQ29udGV4dDtcblx0cHJpdmF0ZSBfbnVtVmVydGljZXM6bnVtYmVyO1xuXHRwcml2YXRlIF9kYXRhUGVyVmVydGV4Om51bWJlcjtcblx0cHJpdmF0ZSBfYnVmZmVyOldlYkdMQnVmZmVyO1xuXG5cdGNvbnN0cnVjdG9yKGdsOldlYkdMUmVuZGVyaW5nQ29udGV4dCwgbnVtVmVydGljZXM6bnVtYmVyLCBkYXRhUGVyVmVydGV4Om51bWJlcilcblx0e1xuXHRcdHRoaXMuX2dsID0gZ2w7XG5cdFx0dGhpcy5fYnVmZmVyID0gdGhpcy5fZ2wuY3JlYXRlQnVmZmVyKCk7XG5cdFx0dGhpcy5fbnVtVmVydGljZXMgPSBudW1WZXJ0aWNlcztcblx0XHR0aGlzLl9kYXRhUGVyVmVydGV4ID0gZGF0YVBlclZlcnRleDtcblx0fVxuXG5cdHB1YmxpYyB1cGxvYWRGcm9tQXJyYXkodmVydGljZXM6bnVtYmVyW10sIHN0YXJ0VmVydGV4Om51bWJlciwgbnVtVmVydGljZXM6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fZ2wuYmluZEJ1ZmZlcih0aGlzLl9nbC5BUlJBWV9CVUZGRVIsIHRoaXMuX2J1ZmZlcik7XG5cblx0XHRpZiAoc3RhcnRWZXJ0ZXgpXG5cdFx0XHR0aGlzLl9nbC5idWZmZXJTdWJEYXRhKHRoaXMuX2dsLkFSUkFZX0JVRkZFUiwgc3RhcnRWZXJ0ZXgqdGhpcy5fZGF0YVBlclZlcnRleCwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcykpO1xuXHRcdGVsc2Vcblx0XHRcdHRoaXMuX2dsLmJ1ZmZlckRhdGEodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgdGhpcy5fZ2wuU1RBVElDX0RSQVcpO1xuXHR9XG5cblxuXHRwdWJsaWMgdXBsb2FkRnJvbUJ5dGVBcnJheShkYXRhOkFycmF5QnVmZmVyLCBzdGFydFZlcnRleDpudW1iZXIsIG51bVZlcnRpY2VzOm51bWJlcilcblx0e1xuXHRcdHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl9idWZmZXIpO1xuXG5cdFx0aWYgKHN0YXJ0VmVydGV4KVxuXHRcdFx0dGhpcy5fZ2wuYnVmZmVyU3ViRGF0YSh0aGlzLl9nbC5BUlJBWV9CVUZGRVIsIHN0YXJ0VmVydGV4KnRoaXMuX2RhdGFQZXJWZXJ0ZXgsIGRhdGEpO1xuXHRcdGVsc2Vcblx0XHRcdHRoaXMuX2dsLmJ1ZmZlckRhdGEodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCBkYXRhLCB0aGlzLl9nbC5TVEFUSUNfRFJBVyk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IG51bVZlcnRpY2VzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbnVtVmVydGljZXM7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGRhdGFQZXJWZXJ0ZXgoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9kYXRhUGVyVmVydGV4O1xuXHR9XG5cblx0cHVibGljIGdldCBnbEJ1ZmZlcigpOldlYkdMQnVmZmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYnVmZmVyO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fZ2wuZGVsZXRlQnVmZmVyKHRoaXMuX2J1ZmZlcik7XG5cdH1cbn1cblxuZXhwb3J0ID0gVmVydGV4QnVmZmVyV2ViR0w7IiwiaW1wb3J0IEV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnRcIik7XG5cbmNsYXNzIFN0YWdlRXZlbnQgZXh0ZW5kcyBFdmVudFxue1xuXHRwdWJsaWMgc3RhdGljIENPTlRFWFRfQ1JFQVRFRDpzdHJpbmcgPSBcImNvbnRleHRDcmVhdGVkXCI7XG5cdHB1YmxpYyBzdGF0aWMgQ09OVEVYVF9ESVNQT1NFRDpzdHJpbmcgPSBcImNvbnRleHREaXNwb3NlZFwiO1xuXHRwdWJsaWMgc3RhdGljIENPTlRFWFRfUkVDUkVBVEVEOnN0cmluZyA9IFwiY29udGV4dFJlY3JlYXRlZFwiO1xuXHRwdWJsaWMgc3RhdGljIFZJRVdQT1JUX1VQREFURUQ6c3RyaW5nID0gXCJ2aWV3cG9ydFVwZGF0ZWRcIjtcblxuXHRjb25zdHJ1Y3Rvcih0eXBlOnN0cmluZylcblx0e1xuXHRcdHN1cGVyKHR5cGUpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFN0YWdlRXZlbnQ7IiwiaW1wb3J0IEV2ZW50RGlzcGF0Y2hlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudERpc3BhdGNoZXJcIik7XG5pbXBvcnQgQXJndW1lbnRFcnJvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9Bcmd1bWVudEVycm9yXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBTdGFnZUV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9ldmVudHMvU3RhZ2VFdmVudFwiKTtcblxuLyoqXG4gKiBUaGUgU3RhZ2VNYW5hZ2VyIGNsYXNzIHByb3ZpZGVzIGEgbXVsdGl0b24gb2JqZWN0IHRoYXQgaGFuZGxlcyBtYW5hZ2VtZW50IGZvciBTdGFnZSBvYmplY3RzLlxuICpcbiAqIEBzZWUgYXdheS5iYXNlLlN0YWdlXG4gKi9cbmNsYXNzIFN0YWdlTWFuYWdlciBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlclxue1xuXHRwcml2YXRlIHN0YXRpYyBTVEFHRV9NQVhfUVVBTlRJVFk6bnVtYmVyID0gODtcblx0cHJpdmF0ZSBfc3RhZ2VzOkFycmF5PFN0YWdlPjtcblxuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6U3RhZ2VNYW5hZ2VyO1xuXHRwcml2YXRlIHN0YXRpYyBfbnVtU3RhZ2VzOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgU3RhZ2VNYW5hZ2VyIGNsYXNzLlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBTdGFnZSBvYmplY3RzIHRvIGJlIG1hbmFnZWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fc3RhZ2VzID0gbmV3IEFycmF5PFN0YWdlPihTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZKTtcblxuXHRcdHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSA9IChldmVudDpFdmVudCkgPT4gdGhpcy5vbkNvbnRleHRDcmVhdGVkKGV2ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgU3RhZ2VNYW5hZ2VyIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gU3RhZ2Ugb2JqZWN0LlxuXHQgKiBAcGFyYW0gc3RhZ2UgVGhlIFN0YWdlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBTdGFnZSBvYmplY3RzIHRvIGJlIG1hbmFnZWQuXG5cdCAqIEByZXR1cm4gVGhlIFN0YWdlTWFuYWdlciBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIFN0YWdlIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpTdGFnZU1hbmFnZXJcblx0e1xuXHRcdGlmICh0aGlzLl9pbnN0YW5jZSA9PSBudWxsKVxuXHRcdFx0dGhpcy5faW5zdGFuY2UgPSBuZXcgU3RhZ2VNYW5hZ2VyKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5faW5zdGFuY2U7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIFN0YWdlIGZvciB0aGUgZ2l2ZW4gaW5kZXguXG5cdCAqXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIHJlcXVlc3RlZCBTdGFnZS5cblx0ICogQHBhcmFtIGZvcmNlU29mdHdhcmUgV2hldGhlciB0byBmb3JjZSBzb2Z0d2FyZSBtb2RlIGV2ZW4gaWYgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIGlzIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIHByb2ZpbGUgVGhlIGNvbXBhdGliaWxpdHkgcHJvZmlsZSwgYW4gZW51bWVyYXRpb24gb2YgQ29udGV4dFByb2ZpbGVcblx0ICogQHJldHVybiBUaGUgU3RhZ2UgZm9yIHRoZSBnaXZlbiBpbmRleC5cblx0ICovXG5cdHB1YmxpYyBnZXRTdGFnZUF0KGluZGV4Om51bWJlciwgZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxuXHR7XG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBTdGFnZU1hbmFnZXIuU1RBR0VfTUFYX1FVQU5USVRZKVxuXHRcdFx0dGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoXCJJbmRleCBpcyBvdXQgb2YgYm91bmRzIFswLi5cIiArIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgKyBcIl1cIik7XG5cblx0XHRpZiAoIXRoaXMuX3N0YWdlc1tpbmRleF0pIHtcblx0XHRcdFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzKys7XG5cblx0XHRcdHZhciBjYW52YXM6SFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdFx0Y2FudmFzLmlkID0gXCJzdGFnZVwiICsgaW5kZXg7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cdFx0XHR2YXIgc3RhZ2U6U3RhZ2UgPSB0aGlzLl9zdGFnZXNbaW5kZXhdID0gbmV3IFN0YWdlKGNhbnZhcywgaW5kZXgsIHRoaXMsIGZvcmNlU29mdHdhcmUsIHByb2ZpbGUpO1xuXHRcdFx0c3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihTdGFnZUV2ZW50LkNPTlRFWFRfQ1JFQVRFRCwgdGhpcy5fb25Db250ZXh0Q3JlYXRlZERlbGVnYXRlKTtcblx0XHRcdHN0YWdlLnJlcXVlc3RDb250ZXh0KGZvcmNlU29mdHdhcmUsIHByb2ZpbGUsIG1vZGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdGFnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgU3RhZ2UgZnJvbSB0aGUgbWFuYWdlci5cblx0ICogQHBhcmFtIHN0YWdlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgaVJlbW92ZVN0YWdlKHN0YWdlOlN0YWdlKVxuXHR7XG5cdFx0U3RhZ2VNYW5hZ2VyLl9udW1TdGFnZXMtLTtcblxuXHRcdHN0YWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoU3RhZ2VFdmVudC5DT05URVhUX0NSRUFURUQsIHRoaXMuX29uQ29udGV4dENyZWF0ZWREZWxlZ2F0ZSk7XG5cblx0XHR0aGlzLl9zdGFnZXNbc3RhZ2Uuc3RhZ2VJbmRleF0gPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgbmV4dCBhdmFpbGFibGUgc3RhZ2UuIEFuIGVycm9yIGlzIHRocm93biBpZiB0aGVyZSBhcmUgbm8gU3RhZ2VQcm94aWVzIGF2YWlsYWJsZVxuXHQgKiBAcGFyYW0gZm9yY2VTb2Z0d2FyZSBXaGV0aGVyIHRvIGZvcmNlIHNvZnR3YXJlIG1vZGUgZXZlbiBpZiBoYXJkd2FyZSBhY2NlbGVyYXRpb24gaXMgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gcHJvZmlsZSBUaGUgY29tcGF0aWJpbGl0eSBwcm9maWxlLCBhbiBlbnVtZXJhdGlvbiBvZiBDb250ZXh0UHJvZmlsZVxuXHQgKiBAcmV0dXJuIFRoZSBhbGxvY2F0ZWQgc3RhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXRGcmVlU3RhZ2UoZm9yY2VTb2Z0d2FyZTpib29sZWFuID0gZmFsc2UsIHByb2ZpbGU6c3RyaW5nID0gXCJiYXNlbGluZVwiLCBtb2RlOnN0cmluZyA9IFwiYXV0b1wiKTpTdGFnZVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyID0gMDtcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX3N0YWdlcy5sZW5ndGg7XG5cblx0XHR3aGlsZSAoaSA8IGxlbikge1xuXHRcdFx0aWYgKCF0aGlzLl9zdGFnZXNbaV0pXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFN0YWdlQXQoaSwgZm9yY2VTb2Z0d2FyZSwgcHJvZmlsZSwgbW9kZSk7XG5cblx0XHRcdCsraTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBuZXcgc3RhZ2UgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzLlxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlcmUgaXMgb25lIHNsb3QgZnJlZSBmb3IgYSBuZXcgc3RhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXQgaGFzRnJlZVN0YWdlKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzIDwgU3RhZ2VNYW5hZ2VyLlNUQUdFX01BWF9RVUFOVElUWT8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFtb3VudCBvZiBzdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIGNyZWF0ZWQgYW5kIG1hbmFnZWQgYnkgdGhlIGNsYXNzXG5cdCAqIEByZXR1cm4gdGhlIGFtb3VudCBvZiBmcmVlIHNsb3RzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzRnJlZSgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5TVEFHRV9NQVhfUVVBTlRJVFkgLSBTdGFnZU1hbmFnZXIuX251bVN0YWdlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbW91bnQgb2YgU3RhZ2Ugb2JqZWN0cyBjdXJyZW50bHkgbWFuYWdlZCBieSB0aGUgY2xhc3MuXG5cdCAqIEByZXR1cm4gdGhlIGFtb3VudCBvZiBzbG90cyB1c2VkXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVXNlZCgpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIFN0YWdlTWFuYWdlci5fbnVtU3RhZ2VzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtYXhpbXVtIGFtb3VudCBvZiBTdGFnZSBvYmplY3RzIHRoYXQgY2FuIGJlIG1hbmFnZWQgYnkgdGhlIGNsYXNzXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IG51bVNsb3RzVG90YWwoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zdGFnZXMubGVuZ3RoO1xuXHR9XG5cblx0cHJpdmF0ZSBvbkNvbnRleHRDcmVhdGVkKGV2ZW50OkV2ZW50KTp2b2lkXG5cdHtcblx0XHQvL3ZhciBzdGFnZTpTdGFnZSA9IDxTdGFnZT4gZS50YXJnZXQ7XG5cdFx0Ly9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YWdlLmNhbnZhcylcblx0fVxufVxuXG5leHBvcnQgPSBTdGFnZU1hbmFnZXI7IiwiaW1wb3J0IElBc3NldENsYXNzXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lBc3NldENsYXNzXCIpO1xuaW1wb3J0IEJpdG1hcEltYWdlMkRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0JpdG1hcEltYWdlMkRcIik7XG5pbXBvcnQgTWlwbWFwR2VuZXJhdG9yXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvTWlwbWFwR2VuZXJhdG9yXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBJbWFnZTJET2JqZWN0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZTJET2JqZWN0XCIpO1xuaW1wb3J0IEltYWdlT2JqZWN0UG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VPYmplY3RQb29sXCIpO1xuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGb3JtYXRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZvcm1hdFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XG5pbXBvcnQgSVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZVwiKTtcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuXG4vKipcbiAqXG4gKiBAY2xhc3MgYXdheS5wb29sLkltYWdlT2JqZWN0QmFzZVxuICovXG5jbGFzcyBCaXRtYXBJbWFnZTJET2JqZWN0IGV4dGVuZHMgSW1hZ2UyRE9iamVjdFxue1xuXHRwcml2YXRlIF9taXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+O1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3NldENsYXNzOklBc3NldENsYXNzID0gQml0bWFwSW1hZ2UyRDtcblxuXHRjb25zdHJ1Y3Rvcihwb29sOkltYWdlT2JqZWN0UG9vbCwgaW1hZ2U6Qml0bWFwSW1hZ2UyRCwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHRzdXBlcihwb29sLCBpbWFnZSwgc3RhZ2UpXG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0c3VwZXIuYWN0aXZhdGUoaW5kZXgsIHJlcGVhdCwgc21vb3RoLCBtaXBtYXApO1xuXG5cdFx0aWYgKCF0aGlzLl9taXBtYXAgJiYgbWlwbWFwKSB7XG5cdFx0XHR0aGlzLl9taXBtYXAgPSB0cnVlO1xuXHRcdFx0dGhpcy5faW52YWxpZCA9IHRydWU7XG5cdFx0fVxuXHRcdGNvbnNvbGUubG9nKFwiYWN0aXZhdGVUZXh0dXJlIFwiK3RoaXMuX2ludmFsaWQpO1xuXHRcdGlmICh0aGlzLl9pbnZhbGlkKSB7XG5cdFx0XHR0aGlzLl9pbnZhbGlkID0gZmFsc2U7XG5cdFx0XHRpZiAobWlwbWFwKSB7XG5cdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+ID0gdGhpcy5fbWlwbWFwRGF0YSB8fCAodGhpcy5fbWlwbWFwRGF0YSA9IG5ldyBBcnJheTxCaXRtYXBJbWFnZTJEPigpKTtcblxuXHRcdFx0XHRNaXBtYXBHZW5lcmF0b3IuX2dlbmVyYXRlTWlwTWFwcygoPEJpdG1hcEltYWdlMkQ+IHRoaXMuX2ltYWdlKS5nZXRDYW52YXMoKSwgbWlwbWFwRGF0YSwgdHJ1ZSk7XG5cdFx0XHRcdHZhciBsZW46bnVtYmVyID0gbWlwbWFwRGF0YS5sZW5ndGg7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwidHJ5VXBsb2FkIDFcIik7XG5cdFx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKVxuXHRcdFx0XHRcdCg8SVRleHR1cmU+IHRoaXMuX3RleHR1cmUpLnVwbG9hZEZyb21EYXRhKG1pcG1hcERhdGFbaV0uZ2V0SW1hZ2VEYXRhKCksIGkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJ0cnlVcGxvYWQgMlwiKTtcblx0XHRcdFx0KDxJVGV4dHVyZT4gdGhpcy5fdGV4dHVyZSkudXBsb2FkRnJvbURhdGEoKDxCaXRtYXBJbWFnZTJEPiB0aGlzLl9pbWFnZSkuZ2V0SW1hZ2VEYXRhKCksIDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0c3VwZXIuZGlzcG9zZSgpO1xuXG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9taXBtYXBEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdE1pcG1hcEdlbmVyYXRvci5fZnJlZU1pcE1hcEhvbGRlcih0aGlzLl9taXBtYXBEYXRhW2ldKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dFxuXHQgKiBAcmV0dXJucyB7SVRleHR1cmV9XG5cdCAqL1xuXHRwdWJsaWMgZ2V0VGV4dHVyZShjb250ZXh0OklDb250ZXh0R0wpOklUZXh0dXJlQmFzZVxuXHR7XG5cdFx0aWYgKCF0aGlzLl90ZXh0dXJlKSB7XG5cdFx0XHR0aGlzLl9pbnZhbGlkID0gdHJ1ZTtcblx0XHRcdHJldHVybiBzdXBlci5nZXRUZXh0dXJlKGNvbnRleHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl90ZXh0dXJlO1xuXHR9XG59XG5cbmV4cG9ydCA9IEJpdG1hcEltYWdlMkRPYmplY3Q7IiwiaW1wb3J0IElBc3NldENsYXNzXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lBc3NldENsYXNzXCIpO1xuaW1wb3J0IEJpdG1hcEltYWdlQ3ViZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQml0bWFwSW1hZ2VDdWJlXCIpO1xuaW1wb3J0IEJpdG1hcEltYWdlMkRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0JpdG1hcEltYWdlMkRcIik7XG5pbXBvcnQgTWlwbWFwR2VuZXJhdG9yXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvTWlwbWFwR2VuZXJhdG9yXCIpO1xuXG5cbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IEltYWdlQ3ViZU9iamVjdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VDdWJlT2JqZWN0XCIpO1xuaW1wb3J0IEltYWdlT2JqZWN0UG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VPYmplY3RQb29sXCIpO1xuaW1wb3J0IENvbnRleHRHTFRleHR1cmVGb3JtYXRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvQ29udGV4dEdMVGV4dHVyZUZvcm1hdFwiKTtcbmltcG9ydCBJQ29udGV4dEdMXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lDb250ZXh0R0xcIik7XG5pbXBvcnQgSVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZVwiKTtcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuaW1wb3J0IElDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ3ViZVRleHR1cmVcIik7XG5cbi8qKlxuICpcbiAqIEBjbGFzcyBhd2F5LnBvb2wuSW1hZ2VPYmplY3RCYXNlXG4gKi9cbmNsYXNzIEJpdG1hcEltYWdlQ3ViZU9iamVjdCBleHRlbmRzIEltYWdlQ3ViZU9iamVjdFxue1xuXHRwdWJsaWMgX21pcG1hcERhdGFBcnJheTpBcnJheTxBcnJheTxCaXRtYXBJbWFnZTJEPj4gPSBuZXcgQXJyYXk8QXJyYXk8Qml0bWFwSW1hZ2UyRD4+KDYpO1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3NldENsYXNzOklBc3NldENsYXNzID0gQml0bWFwSW1hZ2VDdWJlO1xuXG5cdGNvbnN0cnVjdG9yKHBvb2w6SW1hZ2VPYmplY3RQb29sLCBpbWFnZTpCaXRtYXBJbWFnZUN1YmUsIHN0YWdlOlN0YWdlKVxuXHR7XG5cdFx0c3VwZXIocG9vbCwgaW1hZ2UsIHN0YWdlKVxuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlKGluZGV4Om51bWJlciwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcblx0e1xuXHRcdHN1cGVyLmFjdGl2YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdGlmICghdGhpcy5fbWlwbWFwICYmIG1pcG1hcCkge1xuXHRcdFx0dGhpcy5fbWlwbWFwID0gdHJ1ZTtcblx0XHRcdHRoaXMuX2ludmFsaWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pbnZhbGlkKSB7XG5cdFx0XHR0aGlzLl9pbnZhbGlkID0gZmFsc2U7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCA2OyArK2kpIHtcblx0XHRcdFx0aWYgKG1pcG1hcCkge1xuXHRcdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+ID0gdGhpcy5fbWlwbWFwRGF0YUFycmF5W2ldIHx8ICh0aGlzLl9taXBtYXBEYXRhQXJyYXlbaV0gPSBuZXcgQXJyYXk8Qml0bWFwSW1hZ2UyRD4oKSk7XG5cblx0XHRcdFx0XHRNaXBtYXBHZW5lcmF0b3IuX2dlbmVyYXRlTWlwTWFwcygoPEJpdG1hcEltYWdlQ3ViZT4gdGhpcy5faW1hZ2UpLmdldENhbnZhcyhpKSwgbWlwbWFwRGF0YSwgdHJ1ZSk7XG5cdFx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0XHRmb3IgKHZhciBqOm51bWJlciA9IDA7IGogPCBsZW47IGorKylcblx0XHRcdFx0XHRcdCg8SUN1YmVUZXh0dXJlPiB0aGlzLl90ZXh0dXJlKS51cGxvYWRGcm9tRGF0YShtaXBtYXBEYXRhW2pdLmdldEltYWdlRGF0YSgpLCBpLCBqKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQoPElDdWJlVGV4dHVyZT4gdGhpcy5fdGV4dHVyZSkudXBsb2FkRnJvbURhdGEoKDxCaXRtYXBJbWFnZUN1YmU+IHRoaXMuX2ltYWdlKS5nZXRJbWFnZURhdGEoaSksIGksIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgZGlzcG9zZSgpXG5cdHtcblx0XHRzdXBlci5kaXNwb3NlKCk7XG5cblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCA2OyBpKyspIHtcblx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+ID0gdGhpcy5fbWlwbWFwRGF0YUFycmF5W2ldO1xuXHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblxuXHRcdFx0Zm9yICh2YXIgajpudW1iZXIgPSAwOyBqIDwgbGVuOyBpKyspXG5cdFx0XHRcdE1pcG1hcEdlbmVyYXRvci5fZnJlZU1pcE1hcEhvbGRlcihtaXBtYXBEYXRhW2pdKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRcblx0ICogQHJldHVybnMge0lUZXh0dXJlfVxuXHQgKi9cblx0cHVibGljIGdldFRleHR1cmUoY29udGV4dDpJQ29udGV4dEdMKTpJVGV4dHVyZUJhc2Vcblx0e1xuXHRcdGlmICghdGhpcy5fdGV4dHVyZSkge1xuXHRcdFx0dGhpcy5faW52YWxpZCA9IHRydWU7XG5cdFx0XHRyZXR1cm4gc3VwZXIuZ2V0VGV4dHVyZShjb250ZXh0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fdGV4dHVyZTtcblx0fVxufVxuXG5leHBvcnQgPSBCaXRtYXBJbWFnZUN1YmVPYmplY3Q7IiwiaW1wb3J0IEltYWdlQmFzZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9JbWFnZUJhc2VcIik7XG5pbXBvcnQgSVdyYXBwZXJDbGFzc1x0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvSVdyYXBwZXJDbGFzc1wiKTtcbmltcG9ydCBJSW1hZ2VPYmplY3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3Bvb2wvSUltYWdlT2JqZWN0XCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBJbWFnZU9iamVjdFBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0UG9vbFwiKTtcblxuLyoqXG4gKiBJSW1hZ2VPYmplY3RDbGFzcyBpcyBhbiBpbnRlcmZhY2UgZm9yIHRoZSBjb25zdHJ1Y3RhYmxlIGNsYXNzIGRlZmluaXRpb24gSVRleHR1cmVPYmplY3QgdGhhdCBpcyB1c2VkIHRvXG4gKiBjcmVhdGUgcmVuZGVyYWJsZSBvYmplY3RzIGluIHRoZSByZW5kZXJpbmcgcGlwZWxpbmUgdG8gcmVuZGVyIHRoZSBjb250ZW50cyBvZiBhIHBhcnRpdGlvblxuICpcbiAqIEBjbGFzcyBhd2F5LnJlbmRlci5JSW1hZ2VPYmplY3RDbGFzc1xuICovXG5pbnRlcmZhY2UgSUltYWdlT2JqZWN0Q2xhc3MgZXh0ZW5kcyBJV3JhcHBlckNsYXNzXG57XG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0bmV3KHBvb2w6SW1hZ2VPYmplY3RQb29sLCBpbWFnZTpJbWFnZUJhc2UsIHN0YWdlOlN0YWdlKTpJSW1hZ2VPYmplY3Q7XG59XG5cbmV4cG9ydCA9IElJbWFnZU9iamVjdENsYXNzOyIsImltcG9ydCBJQXNzZXRDbGFzc1x0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9JQXNzZXRDbGFzc1wiKTtcbmltcG9ydCBJbWFnZTJEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvSW1hZ2UyRFwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdEJhc2VcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdFBvb2xcIik7XG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0XCIpO1xuaW1wb3J0IElDb250ZXh0R0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuXG4vKipcbiAqXG4gKiBAY2xhc3MgYXdheS5wb29sLkltYWdlT2JqZWN0QmFzZVxuICovXG5jbGFzcyBJbWFnZTJET2JqZWN0IGV4dGVuZHMgSW1hZ2VPYmplY3RCYXNlXG57XG5cdGNvbnN0cnVjdG9yKHBvb2w6SW1hZ2VPYmplY3RQb29sLCBpbWFnZTpJbWFnZTJELCBzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHN1cGVyKHBvb2wsIGltYWdlLCBzdGFnZSlcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dFxuXHQgKiBAcmV0dXJucyB7SVRleHR1cmV9XG5cdCAqL1xuXHRwdWJsaWMgZ2V0VGV4dHVyZShjb250ZXh0OklDb250ZXh0R0wpOklUZXh0dXJlQmFzZVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3RleHR1cmUgfHwgKHRoaXMuX3RleHR1cmUgPSBjb250ZXh0LmNyZWF0ZVRleHR1cmUoKDxJbWFnZTJEPiB0aGlzLl9pbWFnZSkud2lkdGgsICg8SW1hZ2UyRD4gdGhpcy5faW1hZ2UpLmhlaWdodCwgQ29udGV4dEdMVGV4dHVyZUZvcm1hdC5CR1JBLCB0cnVlKSk7XG5cdH1cbn1cblxuZXhwb3J0ID0gSW1hZ2UyRE9iamVjdDsiLCJpbXBvcnQgSUFzc2V0Q2xhc3NcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvSUFzc2V0Q2xhc3NcIik7XG5pbXBvcnQgSW1hZ2VDdWJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0ltYWdlQ3ViZVwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdEJhc2VcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdFBvb2xcIik7XG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZvcm1hdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9Db250ZXh0R0xUZXh0dXJlRm9ybWF0XCIpO1xuaW1wb3J0IElDb250ZXh0R0xcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSUNvbnRleHRHTFwiKTtcbmltcG9ydCBJVGV4dHVyZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVCYXNlXCIpO1xuXG4vKipcbiAqXG4gKiBAY2xhc3MgYXdheS5wb29sLkltYWdlQ3ViZU9iamVjdEJhc2VcbiAqL1xuY2xhc3MgSW1hZ2VDdWJlT2JqZWN0IGV4dGVuZHMgSW1hZ2VPYmplY3RCYXNlXG57XG5cdGNvbnN0cnVjdG9yKHBvb2w6SW1hZ2VPYmplY3RQb29sLCBpbWFnZTpJbWFnZUN1YmUsIHN0YWdlOlN0YWdlKVxuXHR7XG5cdFx0c3VwZXIocG9vbCwgaW1hZ2UsIHN0YWdlKVxuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIHtJVGV4dHVyZX1cblx0ICovXG5cdHB1YmxpYyBnZXRUZXh0dXJlKGNvbnRleHQ6SUNvbnRleHRHTCk6SVRleHR1cmVCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdGV4dHVyZSB8fCAodGhpcy5fdGV4dHVyZSA9IGNvbnRleHQuY3JlYXRlQ3ViZVRleHR1cmUoKDxJbWFnZUN1YmU+IHRoaXMuX2ltYWdlKS5zaXplLCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0LkJHUkEsIGZhbHNlKSk7XG5cdH1cbn1cblxuZXhwb3J0ID0gSW1hZ2VDdWJlT2JqZWN0OyIsImltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xuaW1wb3J0IElJbWFnZU9iamVjdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvcG9vbC9JSW1hZ2VPYmplY3RcIik7XG5pbXBvcnQgSW1hZ2VCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0ltYWdlQmFzZVwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSUNvbnRleHRHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dEdMXCIpO1xuaW1wb3J0IElUZXh0dXJlQmFzZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JVGV4dHVyZUJhc2VcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdFBvb2xcIik7XG5cbi8qKlxuICpcbiAqIEBjbGFzcyBhd2F5LnBvb2wuSW1hZ2VPYmplY3RCYXNlXG4gKi9cbmNsYXNzIEltYWdlT2JqZWN0QmFzZSBpbXBsZW1lbnRzIElJbWFnZU9iamVjdFxue1xuXHRwcml2YXRlIF9wb29sOkltYWdlT2JqZWN0UG9vbDtcblxuXHRwdWJsaWMgX3N0YWdlOlN0YWdlO1xuXG5cdHB1YmxpYyBfdGV4dHVyZTpJVGV4dHVyZUJhc2U7XG5cblx0cHVibGljIF9pbWFnZTpJbWFnZUJhc2U7XG5cblx0cHVibGljIF9taXBtYXA6Ym9vbGVhbjtcblxuXHRwdWJsaWMgX2ludmFsaWQ6Ym9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihwb29sOkltYWdlT2JqZWN0UG9vbCwgaW1hZ2U6SW1hZ2VCYXNlLCBzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHRoaXMuX3Bvb2wgPSBwb29sO1xuXHRcdHRoaXMuX2ltYWdlID0gaW1hZ2U7XG5cdFx0dGhpcy5fc3RhZ2UgPSBzdGFnZTtcblx0XHR0aGlzLmludmFsaWRhdGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fcG9vbC5kaXNwb3NlSXRlbSh0aGlzLl9pbWFnZSk7XG5cblx0XHR0aGlzLl90ZXh0dXJlLmRpc3Bvc2UoKTtcblx0XHR0aGlzLl90ZXh0dXJlID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGludmFsaWRhdGUoKVxuXHR7XG5cdFx0dGhpcy5faW52YWxpZCA9IHRydWU7XG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0dGhpcy5fc3RhZ2Uuc2V0U2FtcGxlclN0YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdHRoaXMuX3N0YWdlLmNvbnRleHQuc2V0VGV4dHVyZUF0KGluZGV4LCB0aGlzLmdldFRleHR1cmUodGhpcy5fc3RhZ2UuY29udGV4dCkpO1xuXHR9XG5cblx0cHVibGljIGdldFRleHR1cmUoY29udGV4dDpJQ29udGV4dEdMKTpJVGV4dHVyZUJhc2Vcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cbn1cblxuZXhwb3J0ID0gSW1hZ2VPYmplY3RCYXNlOyIsImltcG9ydCBJbWFnZUJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvSW1hZ2VCYXNlXCIpO1xuXG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcbmltcG9ydCBCaXRtYXBJbWFnZTJET2JqZWN0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvQml0bWFwSW1hZ2UyRE9iamVjdFwiKTtcbmltcG9ydCBCaXRtYXBJbWFnZUN1YmVPYmplY3RcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvQml0bWFwSW1hZ2VDdWJlT2JqZWN0XCIpO1xuaW1wb3J0IEltYWdlT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VPYmplY3RCYXNlXCIpO1xuaW1wb3J0IFJlbmRlckltYWdlMkRPYmplY3RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9SZW5kZXJJbWFnZTJET2JqZWN0XCIpO1xuaW1wb3J0IFJlbmRlckltYWdlQ3ViZU9iamVjdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9SZW5kZXJJbWFnZUN1YmVPYmplY3RcIik7XG5pbXBvcnQgSUltYWdlT2JqZWN0Q2xhc3NcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JSW1hZ2VPYmplY3RDbGFzc1wiKTtcbmltcG9ydCBTcGVjdWxhckltYWdlMkRPYmplY3RcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvU3BlY3VsYXJJbWFnZTJET2JqZWN0XCIpO1xuXG4vKipcbiAqIEBjbGFzcyBhd2F5LnBvb2wuSW1hZ2VPYmplY3RQb29sXG4gKi9cbmNsYXNzIEltYWdlT2JqZWN0UG9vbFxue1xuXHRwcml2YXRlIHN0YXRpYyBjbGFzc1Bvb2w6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXG5cdHByaXZhdGUgX3Bvb2w6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXG5cdHB1YmxpYyBfc3RhZ2U6U3RhZ2U7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHRoaXMuX3N0YWdlID0gc3RhZ2U7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGltYWdlXG5cdCAqIEByZXR1cm5zIHtJbWFnZU9iamVjdEJhc2V9XG5cdCAqL1xuXHRwdWJsaWMgZ2V0SXRlbShpbWFnZTpJbWFnZUJhc2UpOkltYWdlT2JqZWN0QmFzZVxuXHR7XG5cdFx0dmFyIGltYWdlT2JqZWN0OkltYWdlT2JqZWN0QmFzZSA9IDxJbWFnZU9iamVjdEJhc2U+ICh0aGlzLl9wb29sW2ltYWdlLmlkXSB8fCAodGhpcy5fcG9vbFtpbWFnZS5pZF0gPSBpbWFnZS5faUFkZEltYWdlT2JqZWN0KG5ldyAoSW1hZ2VPYmplY3RQb29sLmdldENsYXNzKGltYWdlKSkodGhpcywgaW1hZ2UsIHRoaXMuX3N0YWdlKSkpKTtcblxuXHRcdHJldHVybiBpbWFnZU9iamVjdDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gaW1hZ2Vcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlSXRlbShpbWFnZTpJbWFnZUJhc2UpXG5cdHtcblx0XHRpbWFnZS5faVJlbW92ZUltYWdlT2JqZWN0KHRoaXMuX3Bvb2xbaW1hZ2UuaWRdKTtcblxuXHRcdHRoaXMuX3Bvb2xbaW1hZ2UuaWRdID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gaW1hZ2VPYmplY3RDbGFzc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyByZWdpc3RlckNsYXNzKGltYWdlT2JqZWN0Q2xhc3M6SUltYWdlT2JqZWN0Q2xhc3MpXG5cdHtcblx0XHRJbWFnZU9iamVjdFBvb2wuY2xhc3NQb29sW2ltYWdlT2JqZWN0Q2xhc3MuYXNzZXRDbGFzcy5hc3NldFR5cGVdID0gaW1hZ2VPYmplY3RDbGFzcztcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc3ViR2VvbWV0cnlcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0Q2xhc3ModGV4dHVyZTpJbWFnZUJhc2UpOklJbWFnZU9iamVjdENsYXNzXG5cdHtcblx0XHRyZXR1cm4gSW1hZ2VPYmplY3RQb29sLmNsYXNzUG9vbFt0ZXh0dXJlLmFzc2V0VHlwZV07XG5cdH1cblxuXHRwcml2YXRlIHN0YXRpYyBtYWluID0gSW1hZ2VPYmplY3RQb29sLmFkZERlZmF1bHRzKCk7XG5cblx0cHJpdmF0ZSBzdGF0aWMgYWRkRGVmYXVsdHMoKVxuXHR7XG5cdFx0SW1hZ2VPYmplY3RQb29sLnJlZ2lzdGVyQ2xhc3MoUmVuZGVySW1hZ2UyRE9iamVjdCk7XG5cdFx0SW1hZ2VPYmplY3RQb29sLnJlZ2lzdGVyQ2xhc3MoUmVuZGVySW1hZ2VDdWJlT2JqZWN0KTtcblx0XHRJbWFnZU9iamVjdFBvb2wucmVnaXN0ZXJDbGFzcyhCaXRtYXBJbWFnZTJET2JqZWN0KTtcblx0XHRJbWFnZU9iamVjdFBvb2wucmVnaXN0ZXJDbGFzcyhCaXRtYXBJbWFnZUN1YmVPYmplY3QpO1xuXHRcdEltYWdlT2JqZWN0UG9vbC5yZWdpc3RlckNsYXNzKFNwZWN1bGFySW1hZ2UyRE9iamVjdCk7XG5cdH1cbn1cblxuZXhwb3J0ID0gSW1hZ2VPYmplY3RQb29sOyIsImltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xuXG4vKipcbiAqIEBjbGFzcyBhd2F5LnBvb2wuUHJvZ3JhbURhdGFQb29sXG4gKi9cbmNsYXNzIFByb2dyYW1EYXRhUG9vbFxue1xuXHRwcml2YXRlIF9wb29sOk9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfc3RhZ2U6U3RhZ2U7XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gdGV4dHVyZURhdGFDbGFzc1xuXHQgKi9cblx0Y29uc3RydWN0b3Ioc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHR0aGlzLl9zdGFnZSA9IHN0YWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gbWF0ZXJpYWxPd25lclxuXHQgKiBAcmV0dXJucyBJVGV4dHVyZVxuXHQgKi9cblx0cHVibGljIGdldEl0ZW0odmVydGV4U3RyaW5nOnN0cmluZywgZnJhZ21lbnRTdHJpbmc6c3RyaW5nKTpQcm9ncmFtRGF0YVxuXHR7XG5cdFx0dmFyIGtleTpzdHJpbmcgPSB2ZXJ0ZXhTdHJpbmcgKyBmcmFnbWVudFN0cmluZztcblx0XHRyZXR1cm4gdGhpcy5fcG9vbFtrZXldIHx8ICh0aGlzLl9wb29sW2tleV0gPSBuZXcgUHJvZ3JhbURhdGEodGhpcywgdGhpcy5fc3RhZ2UsIHZlcnRleFN0cmluZywgZnJhZ21lbnRTdHJpbmcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIG1hdGVyaWFsT3duZXJcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlSXRlbShrZXk6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fcG9vbFtrZXldID0gbnVsbDtcblx0fVxufVxuXG5leHBvcnQgPSBQcm9ncmFtRGF0YVBvb2w7IiwiaW1wb3J0IFByb2dyYW1EYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvUHJvZ3JhbURhdGFQb29sXCIpO1xuaW1wb3J0IElQcm9ncmFtXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVByb2dyYW1cIik7XG5pbXBvcnQgU3RhZ2VcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9TdGFnZVwiKTtcblxuLyoqXG4gKlxuICogQGNsYXNzIGF3YXkucG9vbC5Qcm9ncmFtRGF0YUJhc2VcbiAqL1xuY2xhc3MgUHJvZ3JhbURhdGFcbntcblx0cHVibGljIHN0YXRpYyBQUk9HUkFNREFUQV9JRF9DT1VOVDpudW1iZXIgPSAwO1xuXG5cdHByaXZhdGUgX3Bvb2w6UHJvZ3JhbURhdGFQb29sO1xuXG5cdHB1YmxpYyB2ZXJ0ZXhTdHJpbmc6c3RyaW5nO1xuXG5cdHB1YmxpYyBmcmFnbWVudFN0cmluZzpzdHJpbmc7XG5cblx0cHVibGljIHN0YWdlOlN0YWdlO1xuXG5cdHB1YmxpYyB1c2FnZXM6bnVtYmVyID0gMDtcblxuXHRwdWJsaWMgcHJvZ3JhbTpJUHJvZ3JhbTtcblxuXHRwdWJsaWMgaWQ6bnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKHBvb2w6UHJvZ3JhbURhdGFQb29sLCBjb250ZXh0OlN0YWdlLCB2ZXJ0ZXhTdHJpbmc6c3RyaW5nLCBmcmFnbWVudFN0cmluZzpzdHJpbmcpXG5cdHtcblx0XHR0aGlzLl9wb29sID0gcG9vbDtcblx0XHR0aGlzLnN0YWdlID0gY29udGV4dDtcblx0XHR0aGlzLnZlcnRleFN0cmluZyA9IHZlcnRleFN0cmluZztcblx0XHR0aGlzLmZyYWdtZW50U3RyaW5nID0gZnJhZ21lbnRTdHJpbmc7XG5cdFx0dGhpcy5zdGFnZS5yZWdpc3RlclByb2dyYW0odGhpcyk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMudXNhZ2VzLS07XG5cblx0XHRpZiAoIXRoaXMudXNhZ2VzKSB7XG5cdFx0XHR0aGlzLl9wb29sLmRpc3Bvc2VJdGVtKHRoaXMudmVydGV4U3RyaW5nICsgdGhpcy5mcmFnbWVudFN0cmluZyk7XG5cblx0XHRcdHRoaXMuc3RhZ2UudW5SZWdpc3RlclByb2dyYW0odGhpcyk7XG5cblx0XHRcdGlmICh0aGlzLnByb2dyYW0pXG5cdFx0XHRcdHRoaXMucHJvZ3JhbS5kaXNwb3NlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9ncmFtID0gbnVsbDtcblx0fVxufVxuXG5leHBvcnQgPSBQcm9ncmFtRGF0YTsiLCJpbXBvcnQgSUFzc2V0Q2xhc3NcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvSUFzc2V0Q2xhc3NcIik7XG5pbXBvcnQgSW1hZ2UyRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0ltYWdlMkRcIik7XG5cbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IEltYWdlMkRPYmplY3RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlMkRPYmplY3RcIik7XG5pbXBvcnQgSW1hZ2VPYmplY3RQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcG9vbC9JbWFnZU9iamVjdFBvb2xcIik7XG5cbi8qKlxuICpcbiAqIEBjbGFzcyBhd2F5LnBvb2wuSW1hZ2VPYmplY3RCYXNlXG4gKi9cbmNsYXNzIFJlbmRlckltYWdlMkRPYmplY3QgZXh0ZW5kcyBJbWFnZTJET2JqZWN0XG57XG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3NldENsYXNzOklBc3NldENsYXNzID0gSW1hZ2UyRDtcblxuXHRjb25zdHJ1Y3Rvcihwb29sOkltYWdlT2JqZWN0UG9vbCwgaW1hZ2U6SW1hZ2UyRCwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHRzdXBlcihwb29sLCBpbWFnZSwgc3RhZ2UpXG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0c3VwZXIuYWN0aXZhdGUoaW5kZXgsIHJlcGVhdCwgc21vb3RoLCBmYWxzZSk7XG5cblx0XHQvL1RPRE86IGFsbG93IGF1dG9tYXRpYyBtaXBtYXAgZ2VuZXJhdGlvblxuXHR9XG59XG5cbmV4cG9ydCA9IFJlbmRlckltYWdlMkRPYmplY3Q7IiwiaW1wb3J0IElBc3NldENsYXNzXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lBc3NldENsYXNzXCIpO1xuaW1wb3J0IEltYWdlQ3ViZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9JbWFnZUN1YmVcIik7XG5cbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IEltYWdlQ3ViZU9iamVjdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VDdWJlT2JqZWN0XCIpO1xuaW1wb3J0IEltYWdlT2JqZWN0UG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2VPYmplY3RQb29sXCIpO1xuXG4vKipcbiAqXG4gKiBAY2xhc3MgYXdheS5wb29sLkltYWdlT2JqZWN0QmFzZVxuICovXG5jbGFzcyBSZW5kZXJJbWFnZUN1YmVPYmplY3QgZXh0ZW5kcyBJbWFnZUN1YmVPYmplY3Rcbntcblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGFzc2V0Q2xhc3M6SUFzc2V0Q2xhc3MgPSBJbWFnZUN1YmU7XG5cblx0Y29uc3RydWN0b3IocG9vbDpJbWFnZU9iamVjdFBvb2wsIGltYWdlOkltYWdlQ3ViZSwgc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHRzdXBlcihwb29sLCBpbWFnZSwgc3RhZ2UpXG5cdH1cblxuXHRwdWJsaWMgYWN0aXZhdGUoaW5kZXg6bnVtYmVyLCByZXBlYXQ6Ym9vbGVhbiwgc21vb3RoOmJvb2xlYW4sIG1pcG1hcDpib29sZWFuKVxuXHR7XG5cdFx0c3VwZXIuYWN0aXZhdGUoaW5kZXgsIHJlcGVhdCwgc21vb3RoLCBmYWxzZSk7XG5cblx0XHQvL1RPRE86IGFsbG93IGF1dG9tYXRpYyBtaXBtYXAgZ2VuZXJhdGlvblxuXG5cdH1cbn1cblxuZXhwb3J0ID0gUmVuZGVySW1hZ2VDdWJlT2JqZWN0OyIsImltcG9ydCBJQXNzZXRDbGFzc1x0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9JQXNzZXRDbGFzc1wiKTtcbmltcG9ydCBCaXRtYXBJbWFnZTJEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CaXRtYXBJbWFnZTJEXCIpO1xuaW1wb3J0IFNwZWN1bGFySW1hZ2UyRFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvU3BlY3VsYXJJbWFnZTJEXCIpO1xuaW1wb3J0IE1pcG1hcEdlbmVyYXRvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL01pcG1hcEdlbmVyYXRvclwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSW1hZ2UyRE9iamVjdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3Bvb2wvSW1hZ2UyRE9iamVjdFwiKTtcbmltcG9ydCBJbWFnZU9iamVjdFBvb2xcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL0ltYWdlT2JqZWN0UG9vbFwiKTtcbmltcG9ydCBDb250ZXh0R0xUZXh0dXJlRm9ybWF0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0NvbnRleHRHTFRleHR1cmVGb3JtYXRcIik7XG5pbXBvcnQgSUNvbnRleHRHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dEdMXCIpO1xuaW1wb3J0IElUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVRleHR1cmVcIik7XG5pbXBvcnQgSVRleHR1cmVCYXNlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL0lUZXh0dXJlQmFzZVwiKTtcblxuLyoqXG4gKlxuICogQGNsYXNzIGF3YXkucG9vbC5JbWFnZU9iamVjdEJhc2VcbiAqL1xuY2xhc3MgU3BlY3VsYXJJbWFnZTJET2JqZWN0IGV4dGVuZHMgSW1hZ2UyRE9iamVjdFxue1xuXHRwcml2YXRlIF9taXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+O1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3NldENsYXNzOklBc3NldENsYXNzID0gU3BlY3VsYXJJbWFnZTJEO1xuXG5cdGNvbnN0cnVjdG9yKHBvb2w6SW1hZ2VPYmplY3RQb29sLCBpbWFnZTpTcGVjdWxhckltYWdlMkQsIHN0YWdlOlN0YWdlKVxuXHR7XG5cdFx0c3VwZXIocG9vbCwgaW1hZ2UsIHN0YWdlKVxuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlKGluZGV4Om51bWJlciwgcmVwZWF0OmJvb2xlYW4sIHNtb290aDpib29sZWFuLCBtaXBtYXA6Ym9vbGVhbilcblx0e1xuXHRcdHN1cGVyLmFjdGl2YXRlKGluZGV4LCByZXBlYXQsIHNtb290aCwgbWlwbWFwKTtcblxuXHRcdGlmICghdGhpcy5fbWlwbWFwICYmIG1pcG1hcCkge1xuXHRcdFx0dGhpcy5fbWlwbWFwID0gdHJ1ZTtcblx0XHRcdHRoaXMuX2ludmFsaWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pbnZhbGlkKSB7XG5cdFx0XHR0aGlzLl9pbnZhbGlkID0gZmFsc2U7XG5cdFx0XHRpZiAobWlwbWFwKSB7XG5cdFx0XHRcdHZhciBtaXBtYXBEYXRhOkFycmF5PEJpdG1hcEltYWdlMkQ+ID0gdGhpcy5fbWlwbWFwRGF0YSB8fCAodGhpcy5fbWlwbWFwRGF0YSA9IG5ldyBBcnJheTxCaXRtYXBJbWFnZTJEPigpKTtcblxuXHRcdFx0XHRNaXBtYXBHZW5lcmF0b3IuX2dlbmVyYXRlTWlwTWFwcygoPFNwZWN1bGFySW1hZ2UyRD4gdGhpcy5faW1hZ2UpLmdldENhbnZhcygpLCBtaXBtYXBEYXRhKTtcblx0XHRcdFx0dmFyIGxlbjpudW1iZXIgPSBtaXBtYXBEYXRhLmxlbmd0aDtcblx0XHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHRcdFx0KDxJVGV4dHVyZT4gdGhpcy5fdGV4dHVyZSkudXBsb2FkRnJvbURhdGEobWlwbWFwRGF0YVtpXS5nZXRJbWFnZURhdGEoKSwgaSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQoPElUZXh0dXJlPiB0aGlzLl90ZXh0dXJlKS51cGxvYWRGcm9tRGF0YSgoPFNwZWN1bGFySW1hZ2UyRD4gdGhpcy5faW1hZ2UpLmdldEltYWdlRGF0YSgpLCAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHN1cGVyLmRpc3Bvc2UoKTtcblxuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fbWlwbWFwRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHRNaXBtYXBHZW5lcmF0b3IuX2ZyZWVNaXBNYXBIb2xkZXIodGhpcy5fbWlwbWFwRGF0YVtpXSk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRcblx0ICogQHJldHVybnMge0lUZXh0dXJlfVxuXHQgKi9cblx0cHVibGljIGdldFRleHR1cmUoY29udGV4dDpJQ29udGV4dEdMKTpJVGV4dHVyZUJhc2Vcblx0e1xuXHRcdGlmICghdGhpcy5fdGV4dHVyZSkge1xuXHRcdFx0dGhpcy5faW52YWxpZCA9IHRydWU7XG5cdFx0XHRyZXR1cm4gc3VwZXIuZ2V0VGV4dHVyZShjb250ZXh0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fdGV4dHVyZTtcblx0fVxufVxuXG5leHBvcnQgPSBTcGVjdWxhckltYWdlMkRPYmplY3Q7IiwiaW1wb3J0IEF0dHJpYnV0ZXNCdWZmZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9hdHRyaWJ1dGVzL0F0dHJpYnV0ZXNCdWZmZXJcIik7XG5cbmltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IElBdHRyaWJ1dGVzQnVmZmVyVk9DbGFzc1x0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvdm9zL0lBdHRyaWJ1dGVzQnVmZmVyVk9DbGFzc1wiKTtcbmltcG9ydCBBdHRyaWJ1dGVzQnVmZmVyVk9cdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvdm9zL0F0dHJpYnV0ZXNCdWZmZXJWT1wiKTtcblxuLyoqXG4gKiBAY2xhc3MgYXdheS5wb29sLkF0dHJpYnV0ZXNCdWZmZXJWT1Bvb2xcbiAqL1xuY2xhc3MgQXR0cmlidXRlc0J1ZmZlclZPUG9vbFxue1xuXHRwcml2YXRlIHN0YXRpYyBjbGFzc1Bvb2w6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXG5cdHByaXZhdGUgX3Bvb2w6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXG5cdHB1YmxpYyBfc3RhZ2U6U3RhZ2U7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHRoaXMuX3N0YWdlID0gc3RhZ2U7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGF0dHJpYnV0ZXNCdWZmZXJcblx0ICogQHJldHVybnMge0F0dHJpYnV0ZXNCdWZmZXJWT31cblx0ICovXG5cdHB1YmxpYyBnZXRJdGVtKGF0dHJpYnV0ZXNCdWZmZXI6QXR0cmlidXRlc0J1ZmZlcik6QXR0cmlidXRlc0J1ZmZlclZPXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcG9vbFthdHRyaWJ1dGVzQnVmZmVyLmlkXSB8fCAodGhpcy5fcG9vbFthdHRyaWJ1dGVzQnVmZmVyLmlkXSA9IGF0dHJpYnV0ZXNCdWZmZXIuX2lBZGRBdHRyaWJ1dGVzQnVmZmVyVk8obmV3IChBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sLmdldENsYXNzKGF0dHJpYnV0ZXNCdWZmZXIpKSh0aGlzLCBhdHRyaWJ1dGVzQnVmZmVyLCB0aGlzLl9zdGFnZSkpKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYXR0cmlidXRlc0J1ZmZlclxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2VJdGVtKGF0dHJpYnV0ZXNCdWZmZXI6QXR0cmlidXRlc0J1ZmZlcilcblx0e1xuXHRcdGF0dHJpYnV0ZXNCdWZmZXIuX2lSZW1vdmVBdHRyaWJ1dGVzQnVmZmVyVk8odGhpcy5fcG9vbFthdHRyaWJ1dGVzQnVmZmVyLmlkXSk7XG5cblx0XHR0aGlzLl9wb29sW2F0dHJpYnV0ZXNCdWZmZXIuaWRdID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYXR0cmlidXRlc0J1ZmZlckNsYXNzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHJlZ2lzdGVyQ2xhc3MoYXR0cmlidXRlc0J1ZmZlckNsYXNzOklBdHRyaWJ1dGVzQnVmZmVyVk9DbGFzcylcblx0e1xuXHRcdEF0dHJpYnV0ZXNCdWZmZXJWT1Bvb2wuY2xhc3NQb29sW2F0dHJpYnV0ZXNCdWZmZXJDbGFzcy5hc3NldENsYXNzLmFzc2V0VHlwZV0gPSBhdHRyaWJ1dGVzQnVmZmVyQ2xhc3M7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHN1Ykdlb21ldHJ5XG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGdldENsYXNzKHRleHR1cmU6QXR0cmlidXRlc0J1ZmZlcik6SUF0dHJpYnV0ZXNCdWZmZXJWT0NsYXNzXG5cdHtcblx0XHRyZXR1cm4gQXR0cmlidXRlc0J1ZmZlclZPUG9vbC5jbGFzc1Bvb2xbdGV4dHVyZS5hc3NldFR5cGVdO1xuXHR9XG5cblx0cHJpdmF0ZSBzdGF0aWMgbWFpbiA9IEF0dHJpYnV0ZXNCdWZmZXJWT1Bvb2wuYWRkRGVmYXVsdHMoKTtcblxuXHRwcml2YXRlIHN0YXRpYyBhZGREZWZhdWx0cygpXG5cdHtcblx0XHRBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sLnJlZ2lzdGVyQ2xhc3MoQXR0cmlidXRlc0J1ZmZlclZPKTtcblx0fVxufVxuXG5leHBvcnQgPSBBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sOyIsImltcG9ydCBJQXNzZXRDbGFzc1x0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9JQXNzZXRDbGFzc1wiKTtcbmltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xuaW1wb3J0IElBdHRyaWJ1dGVzQnVmZmVyVk9cdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdm9zL0lBdHRyaWJ1dGVzQnVmZmVyVk9cIik7XG5pbXBvcnQgQXR0cmlidXRlc0J1ZmZlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2F0dHJpYnV0ZXMvQXR0cmlidXRlc0J1ZmZlclwiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgSUNvbnRleHRHTFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JQ29udGV4dEdMXCIpO1xuaW1wb3J0IElJbmRleEJ1ZmZlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYmFzZS9JSW5kZXhCdWZmZXJcIik7XG5pbXBvcnQgSVZlcnRleEJ1ZmZlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvSVZlcnRleEJ1ZmZlclwiKTtcbmltcG9ydCBBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sXHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi92b3MvQXR0cmlidXRlc0J1ZmZlclZPUG9vbFwiKTtcblxuLyoqXG4gKlxuICogQGNsYXNzIGF3YXkucG9vbC5BdHRyaWJ1dGVzQnVmZmVyVk9cbiAqL1xuY2xhc3MgQXR0cmlidXRlc0J1ZmZlclZPIGltcGxlbWVudHMgSUF0dHJpYnV0ZXNCdWZmZXJWT1xue1xuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgYXNzZXRDbGFzczpJQXNzZXRDbGFzcyA9IEF0dHJpYnV0ZXNCdWZmZXI7XG5cblx0cHJpdmF0ZSBfcG9vbDpBdHRyaWJ1dGVzQnVmZmVyVk9Qb29sO1xuXG5cdHB1YmxpYyBfc3RhZ2U6U3RhZ2U7XG5cblx0cHVibGljIF9pbmRleEJ1ZmZlcjpJSW5kZXhCdWZmZXI7XG5cblx0cHVibGljIF92ZXJ0ZXhCdWZmZXI6SVZlcnRleEJ1ZmZlcjtcblxuXHRwdWJsaWMgX2F0dHJpYnV0ZXNCdWZmZXI6QXR0cmlidXRlc0J1ZmZlcjtcblxuXHRwdWJsaWMgX21pcG1hcDpib29sZWFuO1xuXG5cdHB1YmxpYyBfaW52YWxpZDpib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKHBvb2w6QXR0cmlidXRlc0J1ZmZlclZPUG9vbCwgYXR0cmlidXRlc0J1ZmZlcjpBdHRyaWJ1dGVzQnVmZmVyLCBzdGFnZTpTdGFnZSlcblx0e1xuXHRcdHRoaXMuX3Bvb2wgPSBwb29sO1xuXHRcdHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXIgPSBhdHRyaWJ1dGVzQnVmZmVyO1xuXHRcdHRoaXMuX3N0YWdlID0gc3RhZ2U7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlKClcblx0e1xuXHRcdHRoaXMuX3Bvb2wuZGlzcG9zZUl0ZW0odGhpcy5fYXR0cmlidXRlc0J1ZmZlcik7XG5cblx0XHRpZiAodGhpcy5faW5kZXhCdWZmZXIpIHtcblx0XHRcdHRoaXMuX2luZGV4QnVmZmVyLmRpc3Bvc2UoKTtcblx0XHRcdHRoaXMuX2luZGV4QnVmZmVyID0gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fdmVydGV4QnVmZmVyKSB7XG5cdFx0XHR0aGlzLl92ZXJ0ZXhCdWZmZXIuZGlzcG9zZSgpO1xuXHRcdFx0dGhpcy5fdmVydGV4QnVmZmVyID0gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBpbnZhbGlkYXRlKClcblx0e1xuXHRcdHRoaXMuX2ludmFsaWQgPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIGFjdGl2YXRlKGluZGV4Om51bWJlciwgc2l6ZTpudW1iZXIsIGRpbWVuc2lvbnM6bnVtYmVyLCBvZmZzZXQ6bnVtYmVyKVxuXHR7XG5cdFx0dGhpcy5fc3RhZ2Uuc2V0VmVydGV4QnVmZmVyKGluZGV4LCB0aGlzLl9nZXRWZXJ0ZXhCdWZmZXIoKSwgc2l6ZSwgZGltZW5zaW9ucywgb2Zmc2V0KTtcblx0fVxuXG5cdHB1YmxpYyBkcmF3KG1vZGU6c3RyaW5nLCBmaXJzdEluZGV4Om51bWJlciwgbnVtSW5kaWNlczpudW1iZXIpXG5cdHtcblx0XHR0aGlzLl9zdGFnZS5jb250ZXh0LmRyYXdJbmRpY2VzKG1vZGUsIHRoaXMuX2dldEluZGV4QnVmZmVyKCksIGZpcnN0SW5kZXgsIG51bUluZGljZXMpO1xuXHR9XG5cblx0cHVibGljIF9nZXRJbmRleEJ1ZmZlcigpOklJbmRleEJ1ZmZlclxuXHR7XG5cdFx0aWYgKCF0aGlzLl9pbmRleEJ1ZmZlcikge1xuXHRcdFx0dGhpcy5faW52YWxpZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9pbmRleEJ1ZmZlciA9IHRoaXMuX3N0YWdlLmNvbnRleHQuY3JlYXRlSW5kZXhCdWZmZXIodGhpcy5fYXR0cmlidXRlc0J1ZmZlci5jb3VudCp0aGlzLl9hdHRyaWJ1dGVzQnVmZmVyLnN0cmlkZS8yKTsgLy9oYXJkY29kZWQgYXNzdW1pbmcgVWludEFycmF5XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2ludmFsaWQpIHtcblx0XHRcdHRoaXMuX2ludmFsaWQgPSBmYWxzZTtcblx0XHRcdHRoaXMuX2luZGV4QnVmZmVyLnVwbG9hZEZyb21CeXRlQXJyYXkodGhpcy5fYXR0cmlidXRlc0J1ZmZlci5idWZmZXIsIDAsIHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXIubGVuZ3RoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5faW5kZXhCdWZmZXI7XG5cdH1cblxuXHRwdWJsaWMgX2dldFZlcnRleEJ1ZmZlcigpOklWZXJ0ZXhCdWZmZXJcblx0e1xuXHRcdGlmICghdGhpcy5fdmVydGV4QnVmZmVyKSB7XG5cdFx0XHR0aGlzLl9pbnZhbGlkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3ZlcnRleEJ1ZmZlciA9IHRoaXMuX3N0YWdlLmNvbnRleHQuY3JlYXRlVmVydGV4QnVmZmVyKHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXIuY291bnQsIHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXIuc3RyaWRlKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faW52YWxpZCkge1xuXHRcdFx0dGhpcy5faW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fdmVydGV4QnVmZmVyLnVwbG9hZEZyb21CeXRlQXJyYXkodGhpcy5fYXR0cmlidXRlc0J1ZmZlci5idWZmZXIsIDAsIHRoaXMuX2F0dHJpYnV0ZXNCdWZmZXIuY291bnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl92ZXJ0ZXhCdWZmZXI7XG5cdH1cbn1cblxuZXhwb3J0ID0gQXR0cmlidXRlc0J1ZmZlclZPOyIsImltcG9ydCBBdHRyaWJ1dGVzQnVmZmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYXR0cmlidXRlcy9BdHRyaWJ1dGVzQnVmZmVyXCIpO1xuaW1wb3J0IElXcmFwcGVyQ2xhc3NcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lXcmFwcGVyQ2xhc3NcIik7XG5pbXBvcnQgSUF0dHJpYnV0ZXNCdWZmZXJWT1x0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi92b3MvSUF0dHJpYnV0ZXNCdWZmZXJWT1wiKTtcblxuaW1wb3J0IFN0YWdlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgQXR0cmlidXRlc0J1ZmZlclZPUG9vbFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvdm9zL0F0dHJpYnV0ZXNCdWZmZXJWT1Bvb2xcIik7XG5cbi8qKlxuICogSUF0dHJpYnV0ZXNCdWZmZXJWT0NsYXNzIGlzIGFuIGludGVyZmFjZSBmb3IgdGhlIGNvbnN0cnVjdGFibGUgY2xhc3MgZGVmaW5pdGlvbiBJVGV4dHVyZU9iamVjdCB0aGF0IGlzIHVzZWQgdG9cbiAqIGNyZWF0ZSByZW5kZXJhYmxlIG9iamVjdHMgaW4gdGhlIHJlbmRlcmluZyBwaXBlbGluZSB0byByZW5kZXIgdGhlIGNvbnRlbnRzIG9mIGEgcGFydGl0aW9uXG4gKlxuICogQGNsYXNzIGF3YXkucmVuZGVyLklBdHRyaWJ1dGVzQnVmZmVyVk9DbGFzc1xuICovXG5pbnRlcmZhY2UgSUF0dHJpYnV0ZXNCdWZmZXJWT0NsYXNzIGV4dGVuZHMgSVdyYXBwZXJDbGFzc1xue1xuXHQvKipcblx0ICpcblx0ICovXG5cdG5ldyhwb29sOkF0dHJpYnV0ZXNCdWZmZXJWT1Bvb2wsIGF0dHJpYnV0ZXNCdWZmZXI6QXR0cmlidXRlc0J1ZmZlciwgc3RhZ2U6U3RhZ2UpOklBdHRyaWJ1dGVzQnVmZmVyVk87XG59XG5cbmV4cG9ydCA9IElBdHRyaWJ1dGVzQnVmZmVyVk9DbGFzczsiXX0=
