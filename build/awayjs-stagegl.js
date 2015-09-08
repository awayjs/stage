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
    ContextGLProgramType.FRAGMENT = 0;
    ContextGLProgramType.SAMPLER = 1;
    ContextGLProgramType.VERTEX = 2;
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
    ContextGLVertexBufferFormat.BYTES_4 = 0;
    ContextGLVertexBufferFormat.FLOAT_1 = 1;
    ContextGLVertexBufferFormat.FLOAT_2 = 2;
    ContextGLVertexBufferFormat.FLOAT_3 = 3;
    ContextGLVertexBufferFormat.FLOAT_4 = 4;
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
var ContextGLProgramType = require("awayjs-stagegl/lib/base/ContextGLProgramType");
var ContextGLTriangleFace = require("awayjs-stagegl/lib/base/ContextGLTriangleFace");
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
        this._blendDestination = ContextGLBlendFactor.ZERO;
        this._colorMaskR = true;
        this._colorMaskG = true;
        this._colorMaskB = true;
        this._colorMaskA = true;
        this._writeDepth = true;
        this._depthCompareMode = ContextGLCompareMode.LESS;
        this._screenMatrix = new Matrix3D();
        this._bboxMin = new Point();
        this._bboxMax = new Point();
        this._clamp = new Point();
        this._drawRect = new Rectangle();
        this._textures = [];
        this._vertexBuffers = [];
        this._vertexBufferOffsets = [];
        this._vertexBufferFormats = [];
        this._fragmentConstants = [];
        this._vertexConstants = [];
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
        var raw = this._screenMatrix.rawData;
        raw[0] = this._backBufferWidth / 2;
        raw[1] = 0;
        raw[2] = 0;
        raw[3] = this._backBufferWidth / 2;
        raw[4] = 0;
        raw[5] = -this._backBufferHeight / 2;
        raw[6] = 0;
        raw[7] = this._backBufferHeight / 2;
        raw[8] = 0;
        raw[9] = 0;
        raw[10] = 1;
        raw[11] = 0;
        raw[12] = 0;
        raw[13] = 0;
        raw[14] = 0;
        raw[15] = 0;
        this._screenMatrix.transpose();
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
        return new TextureSoftware(width, height);
    };
    ContextSoftware.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferSoftware(numVertices, dataPerVertex);
    };
    ContextSoftware.prototype.dispose = function () {
    };
    ContextSoftware.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        console.log("setBlendFactors sourceFactor: " + sourceFactor + " destinationFactor: " + destinationFactor);
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
        this._writeDepth = depthMask;
        this._depthCompareMode = passCompareMode;
    };
    ContextSoftware.prototype.setProgram = function (program) {
        this._program = program;
    };
    ContextSoftware.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
        console.log("setProgramConstantsFromMatrix: programType" + programType + " firstRegister: " + firstRegister + " matrix: " + matrix + " transposedMatrix: " + transposedMatrix);
        if (transposedMatrix) {
            var tempMatrix = matrix.clone();
            tempMatrix.transpose();
            matrix = tempMatrix;
        }
        var target;
        if (programType == ContextGLProgramType.VERTEX) {
            target = this._vertexConstants;
        }
        else if (programType == ContextGLProgramType.FRAGMENT) {
            target = this._fragmentConstants;
        }
        var matrixData = matrix.rawData;
        for (var i = firstRegister; i < firstRegister + 4; i++) {
            target[i] = new Vector3D(matrixData[i * 4], matrixData[i * 4 + 1], matrixData[i * 4 + 2], matrixData[i * 4 + 3]);
        }
    };
    ContextSoftware.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
        console.log("setProgramConstantsFromArray: programType" + programType + " firstRegister: " + firstRegister + " data: " + data + " numRegisters: " + numRegisters);
        var target;
        if (programType == ContextGLProgramType.VERTEX) {
            target = this._vertexConstants;
        }
        else if (programType == ContextGLProgramType.FRAGMENT) {
            target = this._fragmentConstants;
        }
        var k = 0;
        for (var i = firstRegister; i < firstRegister + numRegisters; i++) {
            target[i] = new Vector3D(data[k++], data[k++], data[k++], data[k++]);
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
    };
    ContextSoftware.prototype.present = function () {
    };
    ContextSoftware.prototype.drawToBitmapImage2D = function (destination) {
    };
    ContextSoftware.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        console.log("drawIndices mode: " + mode + " firstIndex: " + firstIndex + " numIndices: " + numIndices);
        if (!this._program) {
            return;
        }
        this._backBufferColor.lock();
        for (var i = firstIndex; i < numIndices; i += 3) {
            var index0 = indexBuffer.data[indexBuffer.startOffset + i];
            var index1 = indexBuffer.data[indexBuffer.startOffset + i + 1];
            var index2 = indexBuffer.data[indexBuffer.startOffset + i + 2];
            var vo0 = this._program.vertex(this, index0);
            var vo1 = this._program.vertex(this, index1);
            var vo2 = this._program.vertex(this, index2);
            this.triangle(vo0, vo1, vo2);
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
    ContextSoftware.prototype.putPixel = function (x, y, color) {
        this._drawRect.x = x;
        this._drawRect.y = y;
        this._drawRect.width = 1;
        this._drawRect.height = 1;
        var dest = ColorUtils.float32ColorToARGB(this._backBufferColor.getPixel32(x, y));
        var source = ColorUtils.float32ColorToARGB(color);
        var destModified = this.applyBlendMode(dest, this._blendDestination, dest, source);
        var sourceModified = this.applyBlendMode(source, this._blendSource, dest, source);
        var a = destModified[0] + sourceModified[0];
        var r = destModified[1] + sourceModified[1];
        var g = destModified[2] + sourceModified[2];
        var b = destModified[3] + sourceModified[3];
        a = Math.max(0, Math.min(a, 255));
        r = Math.max(0, Math.min(r, 255));
        g = Math.max(0, Math.min(g, 255));
        b = Math.max(0, Math.min(b, 255));
        //
        //r*=a/255;
        //g*=a/255;
        //b*=a/255;
        //a = 255;
        this._backBufferColor.setPixel32(x, y, ColorUtils.ARGBtoFloat32(a, r, g, b));
    };
    ContextSoftware.prototype.applyBlendMode = function (argb, blend, dest, source) {
        var result = [];
        result[0] = argb[0];
        result[1] = argb[1];
        result[2] = argb[2];
        result[3] = argb[3];
        if (blend == ContextGLBlendFactor.DESTINATION_ALPHA) {
            result[0] *= dest[0];
            result[1] *= dest[0];
            result[2] *= dest[0];
            result[3] *= dest[0];
        }
        else if (blend == ContextGLBlendFactor.DESTINATION_COLOR) {
            result[0] *= dest[0];
            result[1] *= dest[1];
            result[2] *= dest[2];
            result[3] *= dest[3];
        }
        else if (blend == ContextGLBlendFactor.ZERO) {
            result[0] = 0;
            result[1] = 0;
            result[2] = 0;
            result[3] = 0;
        }
        else if (blend == ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA) {
            result[0] *= 1 - dest[0];
            result[1] *= 1 - dest[0];
            result[2] *= 1 - dest[0];
            result[3] *= 1 - dest[0];
        }
        else if (blend == ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR) {
            result[0] *= 1 - dest[0];
            result[1] *= 1 - dest[1];
            result[2] *= 1 - dest[2];
            result[3] *= 1 - dest[3];
        }
        else if (blend == ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA) {
            result[0] *= 1 - source[0];
            result[1] *= 1 - source[0];
            result[2] *= 1 - source[0];
            result[3] *= 1 - source[0];
        }
        else if (blend == ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR) {
            result[0] *= 1 - source[0];
            result[1] *= 1 - source[1];
            result[2] *= 1 - source[2];
            result[3] *= 1 - source[3];
        }
        else if (blend == ContextGLBlendFactor.SOURCE_ALPHA) {
            result[0] *= source[0];
            result[1] *= source[0];
            result[2] *= source[0];
            result[3] *= source[0];
        }
        else if (blend == ContextGLBlendFactor.SOURCE_COLOR) {
            result[0] *= source[0];
            result[1] *= source[1];
            result[2] *= source[2];
            result[3] *= source[3];
        }
        return result;
    };
    ContextSoftware.prototype.drawRect = function (x, y, color) {
        this._drawRect.x = x;
        this._drawRect.y = y;
        this._drawRect.width = 5;
        this._drawRect.height = 5;
        this._backBufferColor.fillRect(this._drawRect, color);
    };
    ContextSoftware.prototype.clamp = function (value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.max(min, Math.min(value, max));
    };
    ContextSoftware.prototype.interpolate = function (min, max, gradient) {
        return min + (max - min) * this.clamp(gradient);
    };
    ContextSoftware.prototype.triangle = function (vo0, vo1, vo2) {
        var p0 = vo0.outputPosition[0];
        if (!p0 || p0.w == 0 || isNaN(p0.w)) {
            console.error("wrong position");
            return;
        }
        var p1 = vo1.outputPosition[0];
        var p2 = vo2.outputPosition[0];
        p0.z = p0.z * 2 - p0.w;
        p1.z = p1.z * 2 - p1.w;
        p2.z = p2.z * 2 - p2.w;
        p0.scaleBy(1 / p0.w);
        p1.scaleBy(1 / p1.w);
        p2.scaleBy(1 / p2.w);
        var depth = new Vector3D(p0.z, p1.z, p2.z);
        var project = new Vector3D(p0.w, p1.w, p2.w);
        p0 = this._screenMatrix.transformVector(p0);
        p1 = this._screenMatrix.transformVector(p1);
        p2 = this._screenMatrix.transformVector(p2);
        this._bboxMin.x = 1000000;
        this._bboxMin.y = 1000000;
        this._bboxMax.x = -1000000;
        this._bboxMax.y = -1000000;
        this._clamp.x = this._backBufferWidth - 1;
        this._clamp.y = this._backBufferHeight - 1;
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p0.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p0.y));
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p1.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p1.y));
        this._bboxMin.x = Math.max(0, Math.min(this._bboxMin.x, p2.x));
        this._bboxMin.y = Math.max(0, Math.min(this._bboxMin.y, p2.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p0.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p0.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p1.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p1.y));
        this._bboxMax.x = Math.min(this._clamp.x, Math.max(this._bboxMax.x, p2.x));
        this._bboxMax.y = Math.min(this._clamp.y, Math.max(this._bboxMax.y, p2.y));
        this._bboxMin.x = Math.floor(this._bboxMin.x);
        this._bboxMin.y = Math.floor(this._bboxMin.y);
        this._bboxMax.x = Math.floor(this._bboxMax.x);
        this._bboxMax.y = Math.floor(this._bboxMax.y);
        for (var x = this._bboxMin.x; x <= this._bboxMax.x; x++) {
            for (var y = this._bboxMin.y; y <= this._bboxMax.y; y++) {
                var screen = this.barycentric(p0, p1, p2, x, y);
                var clip = new Vector3D(screen.x / project.x, screen.y / project.y, screen.z / project.z);
                var sum = clip.x + clip.y + clip.z;
                clip.scaleBy(1 / sum);
                var index = ((x % this._backBufferWidth) + y * this._backBufferWidth);
                var fragDepth = depth.x * screen.x + depth.y * screen.y + depth.z * screen.z;
                if (screen.x < 0 || screen.y < 0 || screen.z < 0) {
                    continue;
                }
                var currentDepth = this._zbuffer[index];
                //< fragDepth
                var passDepthTest = false;
                switch (this._depthCompareMode) {
                    case ContextGLCompareMode.ALWAYS:
                        passDepthTest = true;
                        break;
                    case ContextGLCompareMode.EQUAL:
                        passDepthTest = fragDepth == currentDepth;
                        break;
                    case ContextGLCompareMode.GREATER:
                        passDepthTest = fragDepth > currentDepth;
                        break;
                    case ContextGLCompareMode.GREATER_EQUAL:
                        passDepthTest = fragDepth >= currentDepth;
                        break;
                    case ContextGLCompareMode.LESS:
                        passDepthTest = fragDepth < currentDepth;
                        break;
                    case ContextGLCompareMode.LESS_EQUAL:
                        passDepthTest = fragDepth <= currentDepth;
                        break;
                    case ContextGLCompareMode.NEVER:
                        passDepthTest = false;
                        break;
                    case ContextGLCompareMode.NOT_EQUAL:
                        passDepthTest = fragDepth != currentDepth;
                        break;
                    default:
                }
                if (!passDepthTest) {
                    continue;
                }
                var fragmentVO = this._program.fragment(this, clip, vo0, vo1, vo2);
                if (fragmentVO.discard) {
                    continue;
                }
                if (this._writeDepth) {
                    this._zbuffer[index] = fragDepth;
                }
                var color = fragmentVO.outputColor[0];
                color.x = Math.max(0, Math.min(color.x, 1));
                color.y = Math.max(0, Math.min(color.y, 1));
                color.z = Math.max(0, Math.min(color.z, 1));
                color.w = Math.max(0, Math.min(color.w, 1));
                color.x *= 255;
                color.y *= 255;
                color.z *= 255;
                color.w *= 255;
                if (color) {
                    this.putPixel(x, y, ColorUtils.ARGBtoFloat32(color.w, color.x, color.y, color.z));
                }
                else {
                    this.putPixel(x, y, 0xffff0000);
                }
            }
        }
    };
    ContextSoftware.prototype.barycentric = function (a, b, c, x, y) {
        var sx = new Vector3D();
        sx.x = c.x - a.x;
        sx.y = b.x - a.x;
        sx.z = a.x - x;
        var sy = new Vector3D();
        sy.x = c.y - a.y;
        sy.y = b.y - a.y;
        sy.z = a.y - y;
        var u = sx.crossProduct(sy);
        if (u.z < 0.01) {
            return new Vector3D(1 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z);
        }
        return new Vector3D(-1, 1, 1);
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

},{"awayjs-core/lib/data/BitmapImage2D":undefined,"awayjs-core/lib/geom/Matrix3D":undefined,"awayjs-core/lib/geom/Point":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/utils/ColorUtils":undefined,"awayjs-stagegl/lib/base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","awayjs-stagegl/lib/base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","awayjs-stagegl/lib/base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","awayjs-stagegl/lib/base/IndexBufferSoftware":"awayjs-stagegl/lib/base/IndexBufferSoftware","awayjs-stagegl/lib/base/ProgramSoftware":"awayjs-stagegl/lib/base/ProgramSoftware","awayjs-stagegl/lib/base/TextureSoftware":"awayjs-stagegl/lib/base/TextureSoftware","awayjs-stagegl/lib/base/VertexBufferSoftware":"awayjs-stagegl/lib/base/VertexBufferSoftware"}],"awayjs-stagegl/lib/base/ContextStage3D":[function(require,module,exports){
var Matrix3DUtils = require("awayjs-core/lib/geom/Matrix3DUtils");
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
            var raw = Matrix3DUtils.RAW_DATA_CONTAINER;
            raw[0] = d[0];
            raw[1] = d[4];
            raw[2] = d[8];
            raw[3] = d[12];
            raw[4] = d[1];
            raw[5] = d[5];
            raw[6] = d[9];
            raw[7] = d[13];
            raw[8] = d[2];
            raw[9] = d[6];
            raw[10] = d[10];
            raw[11] = d[14];
            raw[12] = d[3];
            raw[13] = d[7];
            raw[14] = d[11];
            raw[15] = d[15];
            this.setProgramConstantsFromArray(programType, firstRegister, raw, 4);
        }
        else {
            this.setProgramConstantsFromArray(programType, firstRegister, d, 4);
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

},{"awayjs-core/lib/geom/Matrix3DUtils":undefined,"awayjs-stagegl/lib/aglsl/Sampler":"awayjs-stagegl/lib/aglsl/Sampler","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","awayjs-stagegl/lib/base/CubeTextureFlash":"awayjs-stagegl/lib/base/CubeTextureFlash","awayjs-stagegl/lib/base/IndexBufferFlash":"awayjs-stagegl/lib/base/IndexBufferFlash","awayjs-stagegl/lib/base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","awayjs-stagegl/lib/base/ProgramFlash":"awayjs-stagegl/lib/base/ProgramFlash","awayjs-stagegl/lib/base/TextureFlash":"awayjs-stagegl/lib/base/TextureFlash","awayjs-stagegl/lib/base/VertexBufferFlash":"awayjs-stagegl/lib/base/VertexBufferFlash"}],"awayjs-stagegl/lib/base/ContextWebGL":[function(require,module,exports){
var Matrix3DUtils = require("awayjs-core/lib/geom/Matrix3DUtils");
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
        this._vertexBufferPropertiesDictionary = [];
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
        return new CubeTextureWebGL(this._gl, size);
    };
    ContextWebGL.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferWebGL(this._gl, numIndices);
    };
    ContextWebGL.prototype.createProgram = function () {
        return new ProgramWebGL(this._gl);
    };
    ContextWebGL.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO streaming
        return new TextureWebGL(this._gl, width, height);
    };
    ContextWebGL.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferWebGL(this._gl, numVertices, dataPerVertex);
    };
    ContextWebGL.prototype.dispose = function () {
        for (var i = 0; i < this._samplerStates.length; ++i)
            this._samplerStates[i] = null;
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
            var raw = Matrix3DUtils.RAW_DATA_CONTAINER;
            raw[0] = d[0];
            raw[1] = d[4];
            raw[2] = d[8];
            raw[3] = d[12];
            raw[4] = d[1];
            raw[5] = d[5];
            raw[6] = d[9];
            raw[7] = d[13];
            raw[8] = d[2];
            raw[9] = d[6];
            raw[10] = d[10];
            raw[11] = d[14];
            raw[12] = d[3];
            raw[13] = d[7];
            raw[14] = d[11];
            raw[15] = d[15];
            this.setProgramConstantsFromArray(programType, firstRegister, raw, 4);
        }
        else {
            this.setProgramConstantsFromArray(programType, firstRegister, d, 4);
        }
    };
    ContextWebGL.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
        if (numRegisters === void 0) { numRegisters = -1; }
        var startIndex;
        for (var i = 0; i < numRegisters; i++) {
            startIndex = i * 4;
            this._gl.uniform4f(this._currentProgram.getUniformLocation(programType, (firstRegister + i)), data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]);
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
        this._gl.uniform1i(this._currentProgram.getUniformLocation(ContextGLProgramType.SAMPLER, sampler), sampler);
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
        if (format === void 0) { format = 4; }
        var location = this._currentProgram ? this._currentProgram.getAttribLocation(index) : -1;
        if (!buffer) {
            if (location > -1)
                this._gl.disableVertexAttribArray(location);
            return;
        }
        //buffer may not have changed if concatenated buffers are being used
        if (this._currentArrayBuffer != buffer) {
            this._currentArrayBuffer = buffer;
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer ? buffer.glBuffer : null);
        }
        var properties = this._vertexBufferPropertiesDictionary[format];
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
    ContextWebGL._float4 = new Float32Array(4);
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

},{"awayjs-core/lib/geom/Matrix3DUtils":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/utils/ByteArray":undefined,"awayjs-stagegl/lib/base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","awayjs-stagegl/lib/base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","awayjs-stagegl/lib/base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","awayjs-stagegl/lib/base/ContextGLDrawMode":"awayjs-stagegl/lib/base/ContextGLDrawMode","awayjs-stagegl/lib/base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","awayjs-stagegl/lib/base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","awayjs-stagegl/lib/base/ContextGLStencilAction":"awayjs-stagegl/lib/base/ContextGLStencilAction","awayjs-stagegl/lib/base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","awayjs-stagegl/lib/base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","awayjs-stagegl/lib/base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","awayjs-stagegl/lib/base/CubeTextureWebGL":"awayjs-stagegl/lib/base/CubeTextureWebGL","awayjs-stagegl/lib/base/IndexBufferWebGL":"awayjs-stagegl/lib/base/IndexBufferWebGL","awayjs-stagegl/lib/base/ProgramWebGL":"awayjs-stagegl/lib/base/ProgramWebGL","awayjs-stagegl/lib/base/SamplerState":"awayjs-stagegl/lib/base/SamplerState","awayjs-stagegl/lib/base/TextureWebGL":"awayjs-stagegl/lib/base/TextureWebGL","awayjs-stagegl/lib/base/VertexBufferWebGL":"awayjs-stagegl/lib/base/VertexBufferWebGL"}],"awayjs-stagegl/lib/base/CubeTextureFlash":[function(require,module,exports){
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
var AGALTokenizer = require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
var ProgramVOSoftware = require("awayjs-stagegl/lib/base/ProgramVOSoftware");
var Matrix3D = require("awayjs-core/lib/geom/Matrix3D");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var ContextGLVertexBufferFormat = require("awayjs-stagegl/lib/base/ContextGLVertexBufferFormat");
var ProgramSoftware = (function () {
    function ProgramSoftware() {
    }
    ProgramSoftware.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._vertexDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(vertexProgram);
        this._fragmentDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(fragmentProgram);
    };
    ProgramSoftware.prototype.dispose = function () {
        this._vertexDescr = null;
        this._fragmentDescr = null;
    };
    ProgramSoftware.prototype.vertex = function (contextSoftware, vertexIndex) {
        var vo = new ProgramVOSoftware();
        //parse attributes
        var i;
        for (i = 0; i < contextSoftware._vertexBuffers.length; i++) {
            var buffer = contextSoftware._vertexBuffers[i];
            if (!buffer)
                continue;
            var attribute = new Vector3D(0, 0, 0, 1);
            var index = contextSoftware._vertexBufferOffsets[i] / 4 + vertexIndex * buffer.attributesPerVertex;
            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_1) {
                attribute.x = buffer.data[index];
            }
            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_2) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
            }
            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_3) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
                attribute.z = buffer.data[index + 2];
            }
            if (contextSoftware._vertexBufferFormats[i] == ContextGLVertexBufferFormat.FLOAT_4) {
                attribute.x = buffer.data[index];
                attribute.y = buffer.data[index + 1];
                attribute.z = buffer.data[index + 2];
                attribute.w = buffer.data[index + 3];
            }
            vo.attributes[i] = attribute;
        }
        var len = this._vertexDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._vertexDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](vo, this._vertexDescr, token.dest, token.a, token.b, contextSoftware);
        }
        return vo;
    };
    ProgramSoftware.prototype.fragment = function (context, clip, vo0, vo1, vo2) {
        var vo = new ProgramVOSoftware();
        for (var i = 0; i < vo0.varying.length; i++) {
            var varying0 = vo0.varying[i];
            var varying1 = vo1.varying[i];
            var varying2 = vo2.varying[i];
            if (!varying0 || !varying1 || !varying2)
                continue;
            var result = vo.varying[i] = new Vector3D(0, 0, 0, 1);
            result.x = clip.x * varying0.x + clip.y * varying1.x + clip.z * varying2.x;
            result.y = clip.x * varying0.y + clip.y * varying1.y + clip.z * varying2.y;
            result.z = clip.x * varying0.z + clip.y * varying1.z + clip.z * varying2.z;
            result.w = clip.x * varying0.w + clip.y * varying1.w + clip.z * varying2.w;
        }
        var len = this._fragmentDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._fragmentDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](vo, this._fragmentDescr, token.dest, token.a, token.b, context);
        }
        return vo;
    };
    ProgramSoftware.getDestTarget = function (vo, desc, dest) {
        var targetType;
        if (dest.regtype == 0x2) {
            targetType = vo.temp;
        }
        else if (dest.regtype == 0x3) {
            if (desc.header.type == "vertex") {
                targetType = vo.outputPosition;
            }
            else {
                targetType = vo.outputColor;
            }
        }
        else if (dest.regtype == 0x4) {
            targetType = vo.varying;
        }
        var targetIndex = dest.regnum;
        var target = targetType[targetIndex];
        if (!target) {
            target = targetType[targetIndex] = new Vector3D(0, 0, 0, 1);
        }
        return target;
    };
    ProgramSoftware.getSourceTargetType = function (vo, desc, dest, context) {
        var targetType;
        if (dest.regtype == 0x0) {
            targetType = vo.attributes;
        }
        else if (dest.regtype == 0x1) {
            if (desc.header.type == "vertex") {
                targetType = context._vertexConstants;
            }
            else {
                targetType = context._fragmentConstants;
            }
        }
        else if (dest.regtype == 0x2) {
            targetType = vo.temp;
        }
        else if (dest.regtype == 0x4) {
            targetType = vo.varying;
        }
        return targetType;
    };
    ProgramSoftware.getSourceTargetByIndex = function (targetType, targetIndex) {
        var target = targetType[targetIndex];
        if (!target) {
            target = targetType[targetIndex] = new Vector3D(0, 0, 0, 1);
        }
        return target;
    };
    ProgramSoftware.getSourceTarget = function (vo, desc, dest, context) {
        var targetType = ProgramSoftware.getSourceTargetType(vo, desc, dest, context);
        return ProgramSoftware.getSourceTargetByIndex(targetType, dest.regnum);
    };
    ProgramSoftware.mov = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.m44 = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Type = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);
        var source2Target0 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);
        var source2Target3 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 3);
        var matrix = new Matrix3D(new Float32Array([
            source2Target0.x,
            source2Target1.x,
            source2Target2.x,
            source2Target3.x,
            source2Target0.y,
            source2Target1.y,
            source2Target2.y,
            source2Target3.y,
            source2Target0.z,
            source2Target1.z,
            source2Target2.z,
            source2Target3.z,
            source2Target0.w,
            source2Target1.w,
            source2Target2.w,
            source2Target3.w
        ]));
        var result = matrix.transformVector(source1Target);
        if (dest.mask & 1) {
            target.x = result.x;
        }
        if (dest.mask & 2) {
            target.y = result.y;
        }
        if (dest.mask & 4) {
            target.z = result.z;
        }
        if (dest.mask & 8) {
            target.w = result.w;
        }
    };
    ProgramSoftware.sample = function (context, u, v, textureIndex) {
        if (textureIndex === void 0) { textureIndex = 0; }
        if (textureIndex < context._textures.length && context._textures[textureIndex] != null) {
            var texture = context._textures[textureIndex];
            var repeatU = Math.abs(((u * texture.width) % texture.width)) >> 0;
            var repeatV = Math.abs(((v * texture.height) % texture.height)) >> 0;
            var pos = (repeatU + repeatV * texture.width) * 4;
            var r = texture.data[pos] / 255;
            var g = texture.data[pos + 1] / 255;
            var b = texture.data[pos + 2] / 255;
            var a = texture.data[pos + 3] / 255;
            return [a, r, g, b];
        }
        return [1, u, v, 0];
    };
    ProgramSoftware.tex = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        var u = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var v = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var color = ProgramSoftware.sample(context, u, v, source2.regnum);
        if (dest.mask & 1) {
            target.x = color[1];
        }
        if (dest.mask & 2) {
            target.y = color[2];
        }
        if (dest.mask & 4) {
            target.z = color[3];
        }
        if (dest.mask & 8) {
            target.w = color[0];
        }
    };
    ProgramSoftware.add = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] + source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] + source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] + source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] + source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.sub = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] - source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] - source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] - source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] - source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.mul = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] * source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] * source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] * source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] * source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.div = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] / source2Target[swiz[(source2.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] / source2Target[swiz[(source2.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] / source2Target[swiz[(source2.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] / source2Target[swiz[(source2.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.rcp = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = 1 / source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = 1 / source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = 1 / source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = 1 / source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.min = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.min(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.min(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.min(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.min(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.max = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.max(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.max(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.max(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.max(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.frc = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = source1Target[swiz[(source1.swizzle >> 0) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = source1Target[swiz[(source1.swizzle >> 2) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = source1Target[swiz[(source1.swizzle >> 4) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = source1Target[swiz[(source1.swizzle >> 6) & 3]] - Math.floor(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.sqt = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.sqrt(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.sqrt(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.sqrt(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.sqrt(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.rsq = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = 1 / Math.sqrt(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.pow = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.pow(source1Target[swiz[(source1.swizzle >> 0) & 3]], source2Target[swiz[(source2.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.pow(source1Target[swiz[(source1.swizzle >> 2) & 3]], source2Target[swiz[(source2.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.pow(source1Target[swiz[(source1.swizzle >> 4) & 3]], source2Target[swiz[(source2.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.pow(source1Target[swiz[(source1.swizzle >> 6) & 3]], source2Target[swiz[(source2.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.log = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.log(source1Target[swiz[(source1.swizzle >> 0) & 3]]) / Math.LN2;
        }
        if (dest.mask & 2) {
            target.y = Math.log(source1Target[swiz[(source1.swizzle >> 2) & 3]]) / Math.LN2;
        }
        if (dest.mask & 4) {
            target.z = Math.log(source1Target[swiz[(source1.swizzle >> 4) & 3]]) / Math.LN2;
        }
        if (dest.mask & 8) {
            target.w = Math.log(source1Target[swiz[(source1.swizzle >> 6) & 3]]) / Math.LN2;
        }
    };
    ProgramSoftware.exp = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.exp(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.exp(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.exp(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.exp(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.nrm = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        var x = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var y = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var z = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var len = Math.sqrt(x * x + y * y + z * z);
        x /= len;
        y /= len;
        z /= len;
        if (dest.mask & 1) {
            target.x = x;
        }
        if (dest.mask & 2) {
            target.y = y;
        }
        if (dest.mask & 4) {
            target.z = z;
        }
    };
    ProgramSoftware.sin = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.sin(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.sin(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.sin(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.sin(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.cos = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.cos(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.cos(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.cos(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.cos(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.crs = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetY * source2TargetZ - source1TargetZ * source2TargetY;
        }
        if (dest.mask & 2) {
            target.y = source1TargetZ * source2TargetX - source1TargetX * source2TargetZ;
        }
        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetY - source1TargetY * source2TargetX;
        }
    };
    ProgramSoftware.dp3 = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }
        if (dest.mask & 2) {
            target.y = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }
        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }
        if (dest.mask & 8) {
            target.w = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        }
    };
    ProgramSoftware.dp4 = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW = source2Target[swiz[(source2.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }
        if (dest.mask & 2) {
            target.y = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }
        if (dest.mask & 4) {
            target.z = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }
        if (dest.mask & 8) {
            target.w = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        }
    };
    ProgramSoftware.abs = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.abs(source1Target[swiz[(source1.swizzle >> 0) & 3]]);
        }
        if (dest.mask & 2) {
            target.y = Math.abs(source1Target[swiz[(source1.swizzle >> 2) & 3]]);
        }
        if (dest.mask & 4) {
            target.z = Math.abs(source1Target[swiz[(source1.swizzle >> 4) & 3]]);
        }
        if (dest.mask & 8) {
            target.w = Math.abs(source1Target[swiz[(source1.swizzle >> 6) & 3]]);
        }
    };
    ProgramSoftware.neg = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = -source1Target[swiz[(source1.swizzle >> 0) & 3]];
        }
        if (dest.mask & 2) {
            target.y = -source1Target[swiz[(source1.swizzle >> 2) & 3]];
        }
        if (dest.mask & 4) {
            target.z = -source1Target[swiz[(source1.swizzle >> 4) & 3]];
        }
        if (dest.mask & 8) {
            target.w = -source1Target[swiz[(source1.swizzle >> 6) & 3]];
        }
    };
    ProgramSoftware.sat = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var swiz = ["x", "y", "z", "w"];
        if (dest.mask & 1) {
            target.x = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 0) & 3]]));
        }
        if (dest.mask & 2) {
            target.y = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 2) & 3]]));
        }
        if (dest.mask & 4) {
            target.z = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 4) & 3]]));
        }
        if (dest.mask & 8) {
            target.w = Math.max(0, Math.min(1, source1Target[swiz[(source1.swizzle >> 6) & 3]]));
        }
    };
    ProgramSoftware.m33 = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Type = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);
        var source2Target0 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);
        var matrix = new Matrix3D(new Float32Array([
            source2Target0.x,
            source2Target1.x,
            source2Target2.x,
            0,
            source2Target0.y,
            source2Target1.y,
            source2Target2.y,
            0,
            source2Target0.z,
            source2Target1.z,
            source2Target2.z,
            0,
            0,
            0,
            0,
            0
        ]));
        var result = matrix.transformVector(source1Target);
        if (dest.mask & 1) {
            target.x = result.x;
        }
        if (dest.mask & 2) {
            target.y = result.y;
        }
        if (dest.mask & 4) {
            target.z = result.z;
        }
    };
    ProgramSoftware.m34 = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Type = ProgramSoftware.getSourceTargetType(vo, desc, source2, context);
        var source2Target0 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum);
        var source2Target1 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 1);
        var source2Target2 = ProgramSoftware.getSourceTargetByIndex(source2Type, source2.regnum + 2);
        var matrix = new Matrix3D(new Float32Array([
            source2Target0.x,
            source2Target1.x,
            source2Target2.x,
            0,
            source2Target0.y,
            source2Target1.y,
            source2Target2.y,
            0,
            source2Target0.z,
            source2Target1.z,
            source2Target2.z,
            0,
            source2Target0.w,
            source2Target1.w,
            source2Target2.w,
            1
        ]));
        var result = matrix.transformVector(source1Target);
        if (dest.mask & 1) {
            target.x = result.x;
        }
        if (dest.mask & 2) {
            target.y = result.y;
        }
        if (dest.mask & 4) {
            target.z = result.z;
        }
        if (dest.mask & 8) {
            target.w = result.w;
        }
    };
    ProgramSoftware.sge = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW = source2Target[swiz[(source2.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX >= source2TargetX ? 1 : 0;
        }
        if (dest.mask & 2) {
            target.y = source1TargetY >= source2TargetY ? 1 : 0;
        }
        if (dest.mask & 4) {
            target.z = source1TargetZ >= source2TargetZ ? 1 : 0;
        }
        if (dest.mask & 8) {
            target.w = source1TargetW >= source2TargetW ? 1 : 0;
        }
    };
    ProgramSoftware.slt = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW = source2Target[swiz[(source2.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX < source2TargetX ? 1 : 0;
        }
        if (dest.mask & 2) {
            target.y = source1TargetY < source2TargetY ? 1 : 0;
        }
        if (dest.mask & 4) {
            target.z = source1TargetZ < source2TargetZ ? 1 : 0;
        }
        if (dest.mask & 8) {
            target.w = source1TargetW < source2TargetW ? 1 : 0;
        }
    };
    ProgramSoftware.seq = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW = source2Target[swiz[(source2.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX == source2TargetX ? 1 : 0;
        }
        if (dest.mask & 2) {
            target.y = source1TargetY == source2TargetY ? 1 : 0;
        }
        if (dest.mask & 4) {
            target.z = source1TargetZ == source2TargetZ ? 1 : 0;
        }
        if (dest.mask & 8) {
            target.w = source1TargetW == source2TargetW ? 1 : 0;
        }
    };
    ProgramSoftware.sne = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[swiz[(source2.swizzle >> 0) & 3]];
        var source2TargetY = source2Target[swiz[(source2.swizzle >> 2) & 3]];
        var source2TargetZ = source2Target[swiz[(source2.swizzle >> 4) & 3]];
        var source2TargetW = source2Target[swiz[(source2.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = source1TargetX != source2TargetX ? 1 : 0;
        }
        if (dest.mask & 2) {
            target.y = source1TargetY != source2TargetY ? 1 : 0;
        }
        if (dest.mask & 4) {
            target.z = source1TargetZ != source2TargetZ ? 1 : 0;
        }
        if (dest.mask & 8) {
            target.w = source1TargetW != source2TargetW ? 1 : 0;
        }
    };
    ProgramSoftware.sgn = function (vo, desc, dest, source1, source2, context) {
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var swiz = ["x", "y", "z", "w"];
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[swiz[(source1.swizzle >> 0) & 3]];
        var source1TargetY = source1Target[swiz[(source1.swizzle >> 2) & 3]];
        var source1TargetZ = source1Target[swiz[(source1.swizzle >> 4) & 3]];
        var source1TargetW = source1Target[swiz[(source1.swizzle >> 6) & 3]];
        if (dest.mask & 1) {
            target.x = 1;
            if (source1TargetX < 0) {
                target.x = -1;
            }
            else if (source1TargetX == 0) {
                target.x = 0;
            }
        }
        if (dest.mask & 2) {
            target.y = 1;
            if (source1TargetY < 0) {
                target.y = -1;
            }
            else if (source1TargetY == 0) {
                target.y = 0;
            }
        }
        if (dest.mask & 4) {
            target.z = 1;
            if (source1TargetZ < 0) {
                target.z = -1;
            }
            else if (source1TargetZ == 0) {
                target.z = 0;
            }
        }
        if (dest.mask & 8) {
            target.w = 1;
            if (source1TargetW < 0) {
                target.w = -1;
            }
            else if (source1TargetW == 0) {
                target.w = 0;
            }
        }
    };
    ProgramSoftware.kil = function (vo, desc, dest, source1, source2, context) {
        vo.discard = true;
    };
    ProgramSoftware._tokenizer = new AGALTokenizer();
    ProgramSoftware._opCodeFunc = [
        ProgramSoftware.mov,
        ProgramSoftware.add,
        ProgramSoftware.sub,
        ProgramSoftware.mul,
        ProgramSoftware.div,
        ProgramSoftware.rcp,
        ProgramSoftware.min,
        ProgramSoftware.max,
        ProgramSoftware.frc,
        ProgramSoftware.sqt,
        ProgramSoftware.rsq,
        ProgramSoftware.pow,
        ProgramSoftware.log,
        ProgramSoftware.exp,
        ProgramSoftware.nrm,
        ProgramSoftware.sin,
        ProgramSoftware.cos,
        ProgramSoftware.crs,
        ProgramSoftware.dp3,
        ProgramSoftware.dp4,
        ProgramSoftware.abs,
        ProgramSoftware.neg,
        ProgramSoftware.sat,
        ProgramSoftware.m33,
        ProgramSoftware.m44,
        ProgramSoftware.m34,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        ProgramSoftware.kil,
        ProgramSoftware.tex,
        ProgramSoftware.sge,
        ProgramSoftware.slt,
        ProgramSoftware.sgn,
        ProgramSoftware.seq,
        ProgramSoftware.sne
    ];
    return ProgramSoftware;
})();
module.exports = ProgramSoftware;

},{"awayjs-core/lib/geom/Matrix3D":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-stagegl/lib/aglsl/AGALTokenizer":"awayjs-stagegl/lib/aglsl/AGALTokenizer","awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","awayjs-stagegl/lib/base/ProgramVOSoftware":"awayjs-stagegl/lib/base/ProgramVOSoftware"}],"awayjs-stagegl/lib/base/ProgramVOSoftware":[function(require,module,exports){
var ProgramVOSoftware = (function () {
    function ProgramVOSoftware() {
        this.outputPosition = [];
        this.outputColor = [];
        this.varying = [];
        this.temp = [];
        this.attributes = [];
        this.discard = false;
    }
    return ProgramVOSoftware;
})();
module.exports = ProgramVOSoftware;

},{}],"awayjs-stagegl/lib/base/ProgramWebGL":[function(require,module,exports){
var AGALTokenizer = require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
var AGLSLParser = require("awayjs-stagegl/lib/aglsl/AGLSLParser");
var ProgramWebGL = (function () {
    function ProgramWebGL(gl) {
        this._uniforms = [[], [], []];
        this._attribs = [];
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
        this._uniforms[0].length = 0;
        this._uniforms[1].length = 0;
        this._uniforms[2].length = 0;
        this._attribs.length = 0;
    };
    ProgramWebGL.prototype.getUniformLocation = function (programType, index) {
        if (this._uniforms[programType][index] != null)
            return this._uniforms[programType][index];
        return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, ProgramWebGL._uniformLocationNameDictionary[programType] + index));
    };
    ProgramWebGL.prototype.getAttribLocation = function (index) {
        if (this._attribs[index] != null)
            return this._attribs[index];
        return (this._attribs[index] = this._gl.getAttribLocation(this._program, "va" + index));
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
    ProgramWebGL._uniformLocationNameDictionary = ["fc", "fs", "vc"];
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
        var _this = this;
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
        this._container.addEventListener("webglcontextlost", function (event) { return _this.onContextLost(event); });
        this._container.addEventListener("webglcontextrestored", function (event) { return _this.onContextRestored(event); });
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
    Stage.prototype.onContextLost = function (event) {
    };
    Stage.prototype.onContextRestored = function (event) {
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
                this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, this._width, this._height);
                this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
                this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);
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
        if (this._invalid) {
            this._invalid = false;
            if (mipmap) {
                var mipmapData = this._mipmapData || (this._mipmapData = new Array());
                MipmapGenerator._generateMipMaps(this._image.getCanvas(), mipmapData, true);
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
    BitmapImage2DObject.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._mipmapData) {
            var len = this._mipmapData.length;
            for (var i = 0; i < len; i++)
                MipmapGenerator._freeMipMapHolder(this._mipmapData[i]);
        }
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
            if (mipmapData) {
                var len = mipmapData.length;
                for (var j = 0; j < len; i++)
                    MipmapGenerator._freeMipMapHolder(mipmapData[j]);
            }
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
        this.usages = 0;
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
        this._pool = null;
        this._image = null;
        this._stage = null;
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
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
            if (this.program) {
                this.program.dispose();
                this.program = null;
            }
        }
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
        delete this._pool[attributesBuffer.id];
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
        this._pool = null;
        this._attributesBuffer = null;
        this._stage = null;
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


//# sourceMappingURL=awayjs-stagegl.js.map