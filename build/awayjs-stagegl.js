require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var aglsl = require("./lib/aglsl");
exports.aglsl = aglsl;
var attributes = require("./lib/attributes");
exports.attributes = attributes;
var base = require("./lib/base");
exports.base = base;
var events = require("./lib/events");
exports.events = events;
var image = require("./lib/image");
exports.image = image;
var library = require("./lib/library");
exports.library = library;
var managers = require("./lib/managers");
exports.managers = managers;
var AttributesBuffer_1 = require("awayjs-core/lib/attributes/AttributesBuffer");
var BitmapImage2D_1 = require("awayjs-core/lib/image/BitmapImage2D");
var BitmapImageCube_1 = require("awayjs-core/lib/image/BitmapImageCube");
var Image2D_1 = require("awayjs-core/lib/image/Image2D");
var ImageCube_1 = require("awayjs-core/lib/image/ImageCube");
var SpecularImage2D_1 = require("awayjs-core/lib/image/SpecularImage2D");
var Sampler2D_1 = require("awayjs-core/lib/image/Sampler2D");
var SamplerCube_1 = require("awayjs-core/lib/image/SamplerCube");
base.Stage.registerAbstraction(attributes.GL_AttributesBuffer, AttributesBuffer_1.default);
base.Stage.registerAbstraction(image.GL_RenderImage2D, Image2D_1.default);
base.Stage.registerAbstraction(image.GL_RenderImageCube, ImageCube_1.default);
base.Stage.registerAbstraction(image.GL_BitmapImage2D, BitmapImage2D_1.default);
base.Stage.registerAbstraction(image.GL_BitmapImageCube, BitmapImageCube_1.default);
base.Stage.registerAbstraction(image.GL_BitmapImage2D, SpecularImage2D_1.default);
base.Stage.registerAbstraction(image.GL_Sampler2D, Sampler2D_1.default);
base.Stage.registerAbstraction(image.GL_SamplerCube, SamplerCube_1.default);

},{"./lib/aglsl":"awayjs-stagegl/lib/aglsl","./lib/attributes":"awayjs-stagegl/lib/attributes","./lib/base":"awayjs-stagegl/lib/base","./lib/events":"awayjs-stagegl/lib/events","./lib/image":"awayjs-stagegl/lib/image","./lib/library":"awayjs-stagegl/lib/library","./lib/managers":"awayjs-stagegl/lib/managers","awayjs-core/lib/attributes/AttributesBuffer":undefined,"awayjs-core/lib/image/BitmapImage2D":undefined,"awayjs-core/lib/image/BitmapImageCube":undefined,"awayjs-core/lib/image/Image2D":undefined,"awayjs-core/lib/image/ImageCube":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/image/SamplerCube":undefined,"awayjs-core/lib/image/SpecularImage2D":undefined}],"awayjs-stagegl/lib/aglsl/AGALTokenizer":[function(require,module,exports){
"use strict";
var Description_1 = require("../aglsl/Description");
var Header_1 = require("../aglsl/Header");
var Mapping_1 = require("../aglsl/Mapping");
var Token_1 = require("../aglsl/Token");
var AGALTokenizer = (function () {
    function AGALTokenizer() {
    }
    AGALTokenizer.prototype.decribeAGALByteArray = function (bytes) {
        var header = new Header_1.default();
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
        var desc = new Description_1.default();
        var tokens = [];
        while (bytes.position < bytes.length) {
            var token = new Token_1.default();
            token.opcode = bytes.readUnsignedInt();
            var lutentry = Mapping_1.default.agal2glsllut[token.opcode];
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AGALTokenizer;

},{"../aglsl/Description":"awayjs-stagegl/lib/aglsl/Description","../aglsl/Header":"awayjs-stagegl/lib/aglsl/Header","../aglsl/Mapping":"awayjs-stagegl/lib/aglsl/Mapping","../aglsl/Token":"awayjs-stagegl/lib/aglsl/Token"}],"awayjs-stagegl/lib/aglsl/AGLSLParser":[function(require,module,exports){
"use strict";
var Mapping_1 = require("../aglsl/Mapping");
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
        // if (!desc.hasindirect) {
        // 	for (var i:number = 0; i < desc.regread[0x1].length; i++) {
        // 		if (desc.regread[0x1][i]) {
        // 			header += "uniform vec4 " + tag + "c" + i + ";\n";
        // 		}
        // 	}
        // } else {
        // 	header += "uniform vec4 " + tag + "carrr[" + AGLSLParser.maxvertexconstants + "];\n";                // use max const count instead
        // }
        var constcount = desc.regread[0x1].length;
        if (constcount > 0)
            header += "uniform vec4 " + tag + "c[" + constcount + "];\n";
        // declare temps
        for (var i = 0; i < desc.regread[0x2].length || i < desc.regwrite[0x2].length; i++) {
            if (desc.regread[0x2][i] || desc.regwrite[0x2][i]) {
                header += "vec4 " + tag + "t" + i + ";\n";
            }
        }
        // declare streams
        for (var i = 0; i < desc.regread[0x0].length; i++) {
            if (desc.regread[0x0][i]) {
                header += "attribute vec4 va" + i + ";\n";
            }
        }
        // declare interpolated
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
            var lutentry = Mapping_1.default.agal2glsllut[desc.tokens[i].opcode];
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
                return desc.header.type[0] + "c[" + regnum + "]";
            // case 0x1:
            // 	if (desc.hasindirect && desc.header.type == "vertex") {
            // 		return "vcarrr[" + regnum + "]";
            // 	} else {
            // 		return tag + "c" + regnum;
            // 	}
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
    AGLSLParser.maxvertexconstants = 128;
    AGLSLParser.maxfragconstants = 28;
    AGLSLParser.maxtemp = 8;
    AGLSLParser.maxstreams = 8;
    AGLSLParser.maxtextures = 8;
    return AGLSLParser;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AGLSLParser;

},{"../aglsl/Mapping":"awayjs-stagegl/lib/aglsl/Mapping"}],"awayjs-stagegl/lib/aglsl/Description":[function(require,module,exports){
"use strict";
var Header_1 = require("../aglsl/Header");
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
        this.header = new Header_1.default();
    }
    return Description;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Description;

},{"../aglsl/Header":"awayjs-stagegl/lib/aglsl/Header"}],"awayjs-stagegl/lib/aglsl/Destination":[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Destination;

},{}],"awayjs-stagegl/lib/aglsl/Header":[function(require,module,exports){
"use strict";
var Header = (function () {
    function Header() {
        this.progid = 0;
        this.version = 0;
        this.type = "";
    }
    return Header;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;

},{}],"awayjs-stagegl/lib/aglsl/Mapping":[function(require,module,exports){
"use strict";
var OpLUT_1 = require("../aglsl/OpLUT");
var Mapping = (function () {
    //TODO: get rid of hack that fixes including definition file
    function Mapping(include) {
    }
    Mapping.agal2glsllut = [
        //         s 												flags   dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.default("%dest = %cast(%a);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(%a + %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(%a - %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(%a * %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(%a / %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(1.0) / %a;\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(min(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(max(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(fract(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(sqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(inversesqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(pow(abs(%a),%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(log2(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(exp2(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        //         s 												flags  	dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.default("%dest = %cast(normalize(vec3( %a ) ));\n", 0, true, true, false, null, null, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(sin(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(cos(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(cross(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(abs(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(%a * -1.0);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(clamp(%a,0.0,1.0));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", null, true, true, true, 3, 3, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 4, true, null, null, null),
        new OpLUT_1.default("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 3, true, null, null, null),
        //s:string, flags:number, dest:boolean, a:boolean, b:boolean, matrixwidth:number, matrixheight:number, ndwm:boolean, scaler:boolean, dm:boolean, lod:boolean
        new OpLUT_1.default("%dest = %cast(dFdx(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("%dest = %cast(dFdy(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.default("if (float(%a)==float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.default("if (float(%a)!=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.default("if (float(%a)>=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.default("if (float(%a)<float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.default("} else {;\n", 0, false, false, false, null, null, null, null, null, null), new OpLUT_1.default("};\n", 0, false, false, false, null, null, null, null, null, null), new OpLUT_1.default(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.default(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.default(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.default(null, null, null, null, false, null, null, null, null, null, null),
        //         s 															flags  	dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.default("%dest = %cast(texture%texdimLod(%b,%texsize(%a)).%dm);\n", null, true, true, true, null, null, null, null, true, null), new OpLUT_1.default("if ( float(%a)<0.0 ) discard;\n", null, false, true, false, null, null, null, true, null, null), new OpLUT_1.default("%dest = %cast(texture%texdim(%b,%texsize(%a)%lod).%dm);\n", null, true, true, true, null, null, true, null, true, true), new OpLUT_1.default("%dest = %cast(greaterThanEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.default("%dest = %cast(lessThan(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.default("%dest = %cast(sign(%a));\n", 0, true, true, false, null, null, null, null, null, null), new OpLUT_1.default("%dest = %cast(equal(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.default("%dest = %cast(notEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null)
    ];
    return Mapping;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Mapping;

},{"../aglsl/OpLUT":"awayjs-stagegl/lib/aglsl/OpLUT"}],"awayjs-stagegl/lib/aglsl/OpLUT":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpLUT;

},{}],"awayjs-stagegl/lib/aglsl/Token":[function(require,module,exports){
"use strict";
var Destination_1 = require("../aglsl/Destination");
var Token = (function () {
    function Token() {
        this.dest = new Destination_1.default();
        this.opcode = 0;
        this.a = new Destination_1.default();
        this.b = new Destination_1.default();
    }
    return Token;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Token;

},{"../aglsl/Destination":"awayjs-stagegl/lib/aglsl/Destination"}],"awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler":[function(require,module,exports){
"use strict";
var OpcodeMap_1 = require("../../aglsl/assembler/OpcodeMap");
var Part_1 = require("../../aglsl/assembler/Part");
var RegMap_1 = require("../../aglsl/assembler/RegMap");
var SamplerMap_1 = require("../../aglsl/assembler/SamplerMap");
var AGALMiniAssembler = (function () {
    function AGALMiniAssembler() {
        this.r = {};
        this.cur = new Part_1.default();
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
        //console.log ( linenr, line, cur, tokens ); 
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
                var op = OpcodeMap_1.default.map[tokens[0]];
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
                break; // unknown/comment
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
        if (!RegMap_1.default.map[reg[1]])
            return false;
        var em = { num: reg[2] ? reg[2] : 0, code: RegMap_1.default.map[reg[1]].code, mask: this.stringToMask(reg[3]) };
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
            var o = SamplerMap_1.default.map[opts[i].toLowerCase()];
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
            if (!RegMap_1.default.map[indexed[1]]) {
                return false;
            }
            var selindex = { x: 0, y: 1, z: 2, w: 3 };
            var em = { num: indexed[2] | 0, code: RegMap_1.default.map[indexed[1]].code, swizzle: this.stringToSwizzle(indexed[5]), select: selindex[indexed[3]], offset: indexed[4] | 0 };
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
            if (!RegMap_1.default.map[reg[1]]) {
                return false;
            }
            var em = { num: reg[2] | 0, code: RegMap_1.default.map[reg[1]].code, swizzle: this.stringToSwizzle(reg[3]) };
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
            this.r[partname] = new Part_1.default(partname, version);
            this.emitHeader(this.r[partname]);
        }
        else if (this.r[partname].version != version) {
            throw "Multiple versions for part " + partname;
        }
        this.cur = this.r[partname];
    };
    return AGALMiniAssembler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AGALMiniAssembler;

},{"../../aglsl/assembler/OpcodeMap":"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap","../../aglsl/assembler/Part":"awayjs-stagegl/lib/aglsl/assembler/Part","../../aglsl/assembler/RegMap":"awayjs-stagegl/lib/aglsl/assembler/RegMap","../../aglsl/assembler/SamplerMap":"awayjs-stagegl/lib/aglsl/assembler/SamplerMap"}],"awayjs-stagegl/lib/aglsl/assembler/FS":[function(require,module,exports){
"use strict";
var FS = (function () {
    function FS() {
    }
    return FS;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FS;

},{}],"awayjs-stagegl/lib/aglsl/assembler/Flags":[function(require,module,exports){
"use strict";
var Flags = (function () {
    function Flags() {
    }
    return Flags;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Flags;

},{}],"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap":[function(require,module,exports){
"use strict";
var Opcode_1 = require("../../aglsl/assembler/Opcode");
var OpcodeMap = (function () {
    function OpcodeMap() {
    }
    Object.defineProperty(OpcodeMap, "map", {
        get: function () {
            if (!OpcodeMap._map) {
                OpcodeMap._map = new Array();
                OpcodeMap._map['mov'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x00, true, null, null, null); //0
                OpcodeMap._map['add'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x01, true, null, null, null); //1
                OpcodeMap._map['sub'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x02, true, null, null, null); //2
                OpcodeMap._map['mul'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x03, true, null, null, null); //3
                OpcodeMap._map['div'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x04, true, null, null, null); //4
                OpcodeMap._map['rcp'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x05, true, null, null, null); //5
                OpcodeMap._map['min'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x06, true, null, null, null); //6
                OpcodeMap._map['max'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x07, true, null, null, null); //7
                OpcodeMap._map['frc'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x08, true, null, null, null); //8
                OpcodeMap._map['sqt'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x09, true, null, null, null); //9
                OpcodeMap._map['rsq'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x0a, true, null, null, null); //10
                OpcodeMap._map['pow'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x0b, true, null, null, null); //11
                OpcodeMap._map['log'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x0c, true, null, null, null); //12
                OpcodeMap._map['exp'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x0d, true, null, null, null); //13
                OpcodeMap._map['nrm'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x0e, true, null, null, null); //14
                OpcodeMap._map['sin'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x0f, true, null, null, null); //15
                OpcodeMap._map['cos'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x10, true, null, null, null); //16
                OpcodeMap._map['crs'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x11, true, true, null, null); //17
                OpcodeMap._map['dp3'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x12, true, true, null, null); //18
                OpcodeMap._map['dp4'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x13, true, true, null, null); //19
                OpcodeMap._map['abs'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x14, true, null, null, null); //20
                OpcodeMap._map['neg'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x15, true, null, null, null); //21
                OpcodeMap._map['sat'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x16, true, null, null, null); //22
                OpcodeMap._map['ted'] = new Opcode_1.default("vector", "vector", 4, "sampler", 1, 0x26, true, null, true, null); //38
                OpcodeMap._map['kil'] = new Opcode_1.default("none", "scalar", 1, "none", 0, 0x27, true, null, true, null); //39
                OpcodeMap._map['tex'] = new Opcode_1.default("vector", "vector", 4, "sampler", 1, 0x28, true, null, true, null); //40
                OpcodeMap._map['m33'] = new Opcode_1.default("vector", "matrix", 3, "vector", 3, 0x17, true, null, null, true); //23
                OpcodeMap._map['m44'] = new Opcode_1.default("vector", "matrix", 4, "vector", 4, 0x18, true, null, null, true); //24
                OpcodeMap._map['m43'] = new Opcode_1.default("vector", "matrix", 3, "vector", 4, 0x19, true, null, null, true); //25
                OpcodeMap._map['ddx'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x1a, true, null, true, null); //26
                OpcodeMap._map['ddy'] = new Opcode_1.default("vector", "vector", 4, "none", 0, 0x1b, true, null, true, null); //27
                OpcodeMap._map['sge'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x29, true, null, null, null); //41
                OpcodeMap._map['slt'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x2a, true, null, null, null); //42
                OpcodeMap._map['sgn'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x2b, true, null, null, null); //43
                OpcodeMap._map['seq'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x2c, true, null, null, null); //44
                OpcodeMap._map['sne'] = new Opcode_1.default("vector", "vector", 4, "vector", 4, 0x2d, true, null, null, null); //45
            }
            return OpcodeMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return OpcodeMap;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpcodeMap;

},{"../../aglsl/assembler/Opcode":"awayjs-stagegl/lib/aglsl/assembler/Opcode"}],"awayjs-stagegl/lib/aglsl/assembler/Opcode":[function(require,module,exports){
"use strict";
var Flags_1 = require("../../aglsl/assembler/Flags");
var FS_1 = require("../../aglsl/assembler/FS");
/**
 *
 */
var Opcode = (function () {
    function Opcode(dest, aformat, asize, bformat, bsize, opcode, simple, horizontal, fragonly, matrix) {
        this.a = new FS_1.default();
        this.b = new FS_1.default();
        this.flags = new Flags_1.default();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Opcode;

},{"../../aglsl/assembler/FS":"awayjs-stagegl/lib/aglsl/assembler/FS","../../aglsl/assembler/Flags":"awayjs-stagegl/lib/aglsl/assembler/Flags"}],"awayjs-stagegl/lib/aglsl/assembler/Part":[function(require,module,exports){
"use strict";
var ByteArray_1 = require("awayjs-core/lib/utils/ByteArray");
var Part = (function () {
    function Part(name, version) {
        if (name === void 0) { name = null; }
        if (version === void 0) { version = null; }
        this.name = "";
        this.version = 0;
        this.name = name;
        this.version = version;
        this.data = new ByteArray_1.default();
    }
    return Part;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Part;

},{"awayjs-core/lib/utils/ByteArray":undefined}],"awayjs-stagegl/lib/aglsl/assembler/RegMap":[function(require,module,exports){
"use strict";
var Reg = (function () {
    function Reg(code, desc) {
        this.code = code;
        this.desc = desc;
    }
    return Reg;
}());
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegMap;

},{}],"awayjs-stagegl/lib/aglsl/assembler/SamplerMap":[function(require,module,exports){
"use strict";
var Sampler_1 = require("../../aglsl/assembler/Sampler");
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
                SamplerMap._map['rgba'] = new Sampler_1.default(8, 0xf, 0);
                SamplerMap._map['rg'] = new Sampler_1.default(8, 0xf, 5);
                SamplerMap._map['r'] = new Sampler_1.default(8, 0xf, 4);
                SamplerMap._map['compressed'] = new Sampler_1.default(8, 0xf, 1);
                SamplerMap._map['compressed_alpha'] = new Sampler_1.default(8, 0xf, 2);
                SamplerMap._map['dxt1'] = new Sampler_1.default(8, 0xf, 1);
                SamplerMap._map['dxt5'] = new Sampler_1.default(8, 0xf, 2);
                // dimension
                SamplerMap._map['2d'] = new Sampler_1.default(12, 0xf, 0);
                SamplerMap._map['cube'] = new Sampler_1.default(12, 0xf, 1);
                SamplerMap._map['3d'] = new Sampler_1.default(12, 0xf, 2);
                // special
                SamplerMap._map['centroid'] = new Sampler_1.default(16, 1, 1);
                SamplerMap._map['ignoresampler'] = new Sampler_1.default(16, 4, 4);
                // repeat
                SamplerMap._map['clamp'] = new Sampler_1.default(20, 0xf, 0);
                SamplerMap._map['repeat'] = new Sampler_1.default(20, 0xf, 1);
                SamplerMap._map['wrap'] = new Sampler_1.default(20, 0xf, 1);
                // mip
                SamplerMap._map['nomip'] = new Sampler_1.default(24, 0xf, 0);
                SamplerMap._map['mipnone'] = new Sampler_1.default(24, 0xf, 0);
                SamplerMap._map['mipnearest'] = new Sampler_1.default(24, 0xf, 1);
                SamplerMap._map['miplinear'] = new Sampler_1.default(24, 0xf, 2);
                // filter
                SamplerMap._map['nearest'] = new Sampler_1.default(28, 0xf, 0);
                SamplerMap._map['linear'] = new Sampler_1.default(28, 0xf, 1);
            }
            return SamplerMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return SamplerMap;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SamplerMap;

},{"../../aglsl/assembler/Sampler":"awayjs-stagegl/lib/aglsl/assembler/Sampler"}],"awayjs-stagegl/lib/aglsl/assembler/Sampler":[function(require,module,exports){
"use strict";
var Sampler = (function () {
    function Sampler(shift, mask, value) {
        this.shift = shift;
        this.mask = mask;
        this.value = value;
    }
    return Sampler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Sampler;

},{}],"awayjs-stagegl/lib/aglsl":[function(require,module,exports){
"use strict";
var AGALMiniAssembler_1 = require("./aglsl/assembler/AGALMiniAssembler");
exports.AGALMiniAssembler = AGALMiniAssembler_1.default;
var Flags_1 = require("./aglsl/assembler/Flags");
exports.Flags = Flags_1.default;
var FS_1 = require("./aglsl/assembler/FS");
exports.FS = FS_1.default;
var Opcode_1 = require("./aglsl/assembler/Opcode");
exports.Opcode = Opcode_1.default;
var OpcodeMap_1 = require("./aglsl/assembler/OpcodeMap");
exports.OpcodeMap = OpcodeMap_1.default;
var Part_1 = require("./aglsl/assembler/Part");
exports.Part = Part_1.default;
var RegMap_1 = require("./aglsl/assembler/RegMap");
exports.RegMap = RegMap_1.default;
var Sampler_1 = require("./aglsl/assembler/Sampler");
exports.Sampler = Sampler_1.default;
var SamplerMap_1 = require("./aglsl/assembler/SamplerMap");
exports.SamplerMap = SamplerMap_1.default;
var AGALTokenizer_1 = require("./aglsl/AGALTokenizer");
exports.AGALTokenizer = AGALTokenizer_1.default;
var AGLSLParser_1 = require("./aglsl/AGLSLParser");
exports.AGLSLParser = AGLSLParser_1.default;
var Description_1 = require("./aglsl/Description");
exports.Description = Description_1.default;
var Destination_1 = require("./aglsl/Destination");
exports.Destination = Destination_1.default;
var Header_1 = require("./aglsl/Header");
exports.Header = Header_1.default;
var Mapping_1 = require("./aglsl/Mapping");
exports.Mapping = Mapping_1.default;
var OpLUT_1 = require("./aglsl/OpLUT");
exports.OpLUT = OpLUT_1.default;
var Token_1 = require("./aglsl/Token");
exports.Token = Token_1.default;

},{"./aglsl/AGALTokenizer":"awayjs-stagegl/lib/aglsl/AGALTokenizer","./aglsl/AGLSLParser":"awayjs-stagegl/lib/aglsl/AGLSLParser","./aglsl/Description":"awayjs-stagegl/lib/aglsl/Description","./aglsl/Destination":"awayjs-stagegl/lib/aglsl/Destination","./aglsl/Header":"awayjs-stagegl/lib/aglsl/Header","./aglsl/Mapping":"awayjs-stagegl/lib/aglsl/Mapping","./aglsl/OpLUT":"awayjs-stagegl/lib/aglsl/OpLUT","./aglsl/Token":"awayjs-stagegl/lib/aglsl/Token","./aglsl/assembler/AGALMiniAssembler":"awayjs-stagegl/lib/aglsl/assembler/AGALMiniAssembler","./aglsl/assembler/FS":"awayjs-stagegl/lib/aglsl/assembler/FS","./aglsl/assembler/Flags":"awayjs-stagegl/lib/aglsl/assembler/Flags","./aglsl/assembler/Opcode":"awayjs-stagegl/lib/aglsl/assembler/Opcode","./aglsl/assembler/OpcodeMap":"awayjs-stagegl/lib/aglsl/assembler/OpcodeMap","./aglsl/assembler/Part":"awayjs-stagegl/lib/aglsl/assembler/Part","./aglsl/assembler/RegMap":"awayjs-stagegl/lib/aglsl/assembler/RegMap","./aglsl/assembler/Sampler":"awayjs-stagegl/lib/aglsl/assembler/Sampler","./aglsl/assembler/SamplerMap":"awayjs-stagegl/lib/aglsl/assembler/SamplerMap"}],"awayjs-stagegl/lib/attributes/GL_AttributesBuffer":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractionBase_1 = require("awayjs-core/lib/library/AbstractionBase");
/**
 *
 * @class away.pool.GL_AttributesBuffer
 */
var GL_AttributesBuffer = (function (_super) {
    __extends(GL_AttributesBuffer, _super);
    function GL_AttributesBuffer(attributesBuffer, stage) {
        _super.call(this, attributesBuffer, stage);
        this._stage = stage;
        this._attributesBuffer = attributesBuffer;
    }
    /**
     *
     */
    GL_AttributesBuffer.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        this._attributesBuffer = null;
        if (this._indexBuffer) {
            this._indexBuffer.dispose();
            this._indexBuffer = null;
        }
        if (this._vertexBuffer) {
            this._vertexBuffer.dispose();
            this._vertexBuffer = null;
        }
    };
    GL_AttributesBuffer.prototype.activate = function (index, size, dimensions, offset, unsigned) {
        if (unsigned === void 0) { unsigned = false; }
        this._stage.setVertexBuffer(index, this._getVertexBuffer(), size, dimensions, offset, unsigned);
    };
    GL_AttributesBuffer.prototype.draw = function (mode, firstIndex, numIndices) {
        this._stage.context.drawIndices(mode, this._getIndexBuffer(), firstIndex, numIndices);
    };
    GL_AttributesBuffer.prototype._getIndexBuffer = function () {
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
    GL_AttributesBuffer.prototype._getVertexBuffer = function () {
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
    return GL_AttributesBuffer;
}(AbstractionBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_AttributesBuffer;

},{"awayjs-core/lib/library/AbstractionBase":undefined}],"awayjs-stagegl/lib/attributes":[function(require,module,exports){
"use strict";
var GL_AttributesBuffer_1 = require("./attributes/GL_AttributesBuffer");
exports.GL_AttributesBuffer = GL_AttributesBuffer_1.default;

},{"./attributes/GL_AttributesBuffer":"awayjs-stagegl/lib/attributes/GL_AttributesBuffer"}],"awayjs-stagegl/lib/base/ContextGLBlendFactor":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLBlendFactor;

},{}],"awayjs-stagegl/lib/base/ContextGLClearMask":[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLClearMask;

},{}],"awayjs-stagegl/lib/base/ContextGLCompareMode":[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLCompareMode;

},{}],"awayjs-stagegl/lib/base/ContextGLDrawMode":[function(require,module,exports){
"use strict";
var ContextGLDrawMode = (function () {
    function ContextGLDrawMode() {
    }
    ContextGLDrawMode.TRIANGLES = "triangles";
    ContextGLDrawMode.LINES = "lines";
    return ContextGLDrawMode;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLDrawMode;

},{}],"awayjs-stagegl/lib/base/ContextGLMipFilter":[function(require,module,exports){
"use strict";
var ContextGLMipFilter = (function () {
    function ContextGLMipFilter() {
    }
    ContextGLMipFilter.MIPLINEAR = "miplinear";
    ContextGLMipFilter.MIPNEAREST = "mipnearest";
    ContextGLMipFilter.MIPNONE = "mipnone";
    return ContextGLMipFilter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLMipFilter;

},{}],"awayjs-stagegl/lib/base/ContextGLProfile":[function(require,module,exports){
"use strict";
var ContextGLProfile = (function () {
    function ContextGLProfile() {
    }
    ContextGLProfile.BASELINE = "baseline";
    ContextGLProfile.BASELINE_CONSTRAINED = "baselineConstrained";
    ContextGLProfile.BASELINE_EXTENDED = "baselineExtended";
    return ContextGLProfile;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLProfile;

},{}],"awayjs-stagegl/lib/base/ContextGLProgramType":[function(require,module,exports){
"use strict";
var ContextGLProgramType = (function () {
    function ContextGLProgramType() {
    }
    ContextGLProgramType.FRAGMENT = 0;
    ContextGLProgramType.SAMPLER = 1;
    ContextGLProgramType.VERTEX = 2;
    return ContextGLProgramType;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLProgramType;

},{}],"awayjs-stagegl/lib/base/ContextGLStencilAction":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLStencilAction;

},{}],"awayjs-stagegl/lib/base/ContextGLTextureFilter":[function(require,module,exports){
"use strict";
var ContextGLTextureFilter = (function () {
    function ContextGLTextureFilter() {
    }
    ContextGLTextureFilter.LINEAR = "linear";
    ContextGLTextureFilter.NEAREST = "nearest";
    return ContextGLTextureFilter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLTextureFilter;

},{}],"awayjs-stagegl/lib/base/ContextGLTextureFormat":[function(require,module,exports){
"use strict";
var ContextGLTextureFormat = (function () {
    function ContextGLTextureFormat() {
    }
    ContextGLTextureFormat.BGRA = "bgra";
    ContextGLTextureFormat.BGRA_PACKED = "bgraPacked4444";
    ContextGLTextureFormat.BGR_PACKED = "bgrPacked565";
    ContextGLTextureFormat.COMPRESSED = "compressed";
    ContextGLTextureFormat.COMPRESSED_ALPHA = "compressedAlpha";
    return ContextGLTextureFormat;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLTextureFormat;

},{}],"awayjs-stagegl/lib/base/ContextGLTriangleFace":[function(require,module,exports){
"use strict";
var ContextGLTriangleFace = (function () {
    function ContextGLTriangleFace() {
    }
    ContextGLTriangleFace.BACK = "back";
    ContextGLTriangleFace.FRONT = "front";
    ContextGLTriangleFace.FRONT_AND_BACK = "frontAndBack";
    ContextGLTriangleFace.NONE = "none";
    return ContextGLTriangleFace;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLTriangleFace;

},{}],"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat":[function(require,module,exports){
"use strict";
var ContextGLVertexBufferFormat = (function () {
    function ContextGLVertexBufferFormat() {
    }
    ContextGLVertexBufferFormat.FLOAT_1 = 0;
    ContextGLVertexBufferFormat.FLOAT_2 = 1;
    ContextGLVertexBufferFormat.FLOAT_3 = 2;
    ContextGLVertexBufferFormat.FLOAT_4 = 3;
    ContextGLVertexBufferFormat.BYTE_1 = 4;
    ContextGLVertexBufferFormat.BYTE_2 = 5;
    ContextGLVertexBufferFormat.BYTE_3 = 6;
    ContextGLVertexBufferFormat.BYTE_4 = 7;
    ContextGLVertexBufferFormat.UNSIGNED_BYTE_1 = 8;
    ContextGLVertexBufferFormat.UNSIGNED_BYTE_2 = 9;
    ContextGLVertexBufferFormat.UNSIGNED_BYTE_3 = 10;
    ContextGLVertexBufferFormat.UNSIGNED_BYTE_4 = 11;
    ContextGLVertexBufferFormat.SHORT_1 = 12;
    ContextGLVertexBufferFormat.SHORT_2 = 13;
    ContextGLVertexBufferFormat.SHORT_3 = 14;
    ContextGLVertexBufferFormat.SHORT_4 = 15;
    ContextGLVertexBufferFormat.UNSIGNED_SHORT_1 = 16;
    ContextGLVertexBufferFormat.UNSIGNED_SHORT_2 = 17;
    ContextGLVertexBufferFormat.UNSIGNED_SHORT_3 = 18;
    ContextGLVertexBufferFormat.UNSIGNED_SHORT_4 = 19;
    return ContextGLVertexBufferFormat;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLVertexBufferFormat;

},{}],"awayjs-stagegl/lib/base/ContextGLWrapMode":[function(require,module,exports){
"use strict";
var ContextGLWrapMode = (function () {
    function ContextGLWrapMode() {
    }
    ContextGLWrapMode.CLAMP = "clamp";
    ContextGLWrapMode.REPEAT = "repeat";
    return ContextGLWrapMode;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextGLWrapMode;

},{}],"awayjs-stagegl/lib/base/ContextMode":[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextMode;

},{}],"awayjs-stagegl/lib/base/ContextSoftware":[function(require,module,exports){
"use strict";
var BitmapImage2D_1 = require("awayjs-core/lib/image/BitmapImage2D");
var Matrix3D_1 = require("awayjs-core/lib/geom/Matrix3D");
var Matrix_1 = require("awayjs-core/lib/geom/Matrix");
var Point_1 = require("awayjs-core/lib/geom/Point");
var Vector3D_1 = require("awayjs-core/lib/geom/Vector3D");
var Rectangle_1 = require("awayjs-core/lib/geom/Rectangle");
var ColorUtils_1 = require("awayjs-core/lib/utils/ColorUtils");
var ContextGLBlendFactor_1 = require("../base/ContextGLBlendFactor");
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLCompareMode_1 = require("../base/ContextGLCompareMode");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var ContextGLTriangleFace_1 = require("../base/ContextGLTriangleFace");
var IndexBufferSoftware_1 = require("../base/IndexBufferSoftware");
var VertexBufferSoftware_1 = require("../base/VertexBufferSoftware");
var TextureSoftware_1 = require("../base/TextureSoftware");
var ProgramSoftware_1 = require("../base/ProgramSoftware");
var SoftwareSamplerState_1 = require("../base/SoftwareSamplerState");
var ContextSoftware = (function () {
    function ContextSoftware(canvas) {
        this._backBufferRect = new Rectangle_1.default();
        this._backBufferWidth = 100;
        this._backBufferHeight = 100;
        this._cullingMode = ContextGLTriangleFace_1.default.BACK;
        this._blendSource = ContextGLBlendFactor_1.default.ONE;
        this._blendDestination = ContextGLBlendFactor_1.default.ZERO;
        this._colorMaskR = true;
        this._colorMaskG = true;
        this._colorMaskB = true;
        this._colorMaskA = true;
        this._writeDepth = true;
        this._depthCompareMode = ContextGLCompareMode_1.default.LESS;
        this._screenMatrix = new Matrix3D_1.default();
        this._frontBufferMatrix = new Matrix_1.default();
        this._bboxMin = new Point_1.default();
        this._bboxMax = new Point_1.default();
        this._clamp = new Point_1.default();
        this._samplerStates = [];
        this._textures = [];
        this._vertexBuffers = [];
        this._vertexBufferOffsets = [];
        this._vertexBufferFormats = [];
        //public static _drawCallback:Function = null;
        this._antialias = 0;
        this._sx = new Vector3D_1.default();
        this._sy = new Vector3D_1.default();
        this._u = new Vector3D_1.default();
        this._canvas = canvas;
        this._backBufferColor = new BitmapImage2D_1.default(this._backBufferWidth, this._backBufferHeight, false, 0, false);
        this._frontBuffer = new BitmapImage2D_1.default(this._backBufferWidth, this._backBufferHeight, true, 0, false);
        if (document && document.body)
            document.body.appendChild(this._frontBuffer.getCanvas());
    }
    Object.defineProperty(ContextSoftware.prototype, "frontBuffer", {
        get: function () {
            return this._frontBuffer;
        },
        enumerable: true,
        configurable: true
    });
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
        if (mask === void 0) { mask = ContextGLClearMask_1.default.ALL; }
        this._backBufferColor.lock();
        if (mask & ContextGLClearMask_1.default.COLOR) {
            this._colorClearUint32.fill(((alpha * 0xFF << 24) | (red * 0xFF << 16) | (green * 0xFF << 8) | blue * 0xFF));
            this._backBufferColor.setPixels(this._backBufferRect, this._colorClearUint8);
        }
        //TODO: mask & ContextGLClearMask.STENCIL
        if (mask & ContextGLClearMask_1.default.DEPTH)
            this._zbuffer.set(this._zbufferClear); //fast memcpy
    };
    ContextSoftware.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        this._antialias = antiAlias;
        if (this._antialias % 2 != 0)
            this._antialias = Math.floor(this._antialias - 0.5);
        if (this._antialias == 0)
            this._antialias = 1;
        this._frontBuffer._setSize(width, height);
        this._backBufferWidth = width * this._antialias;
        this._backBufferHeight = height * this._antialias;
        //double buffer for fast clearing
        var len = this._backBufferWidth * this._backBufferHeight;
        var zbufferBytes = new ArrayBuffer(len * 8);
        this._zbuffer = new Float32Array(zbufferBytes, 0, len);
        this._zbufferClear = new Float32Array(zbufferBytes, len * 4, len);
        for (var i = 0; i < len; i++)
            this._zbufferClear[i] = 10000000;
        var colorClearBuffer = new ArrayBuffer(len * 4);
        this._colorClearUint8 = new Uint8ClampedArray(colorClearBuffer);
        this._colorClearUint32 = new Uint32Array(colorClearBuffer);
        this._backBufferRect.width = this._backBufferWidth;
        this._backBufferRect.height = this._backBufferHeight;
        this._backBufferColor._setSize(this._backBufferWidth, this._backBufferHeight);
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
        this._frontBufferMatrix = new Matrix_1.default();
        this._frontBufferMatrix.scale(1 / this._antialias, 1 / this._antialias);
    };
    ContextSoftware.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        //TODO: impl
        return undefined;
    };
    ContextSoftware.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferSoftware_1.default(numIndices);
    };
    ContextSoftware.prototype.createProgram = function () {
        return new ProgramSoftware_1.default();
    };
    ContextSoftware.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        return new TextureSoftware_1.default(width, height);
    };
    ContextSoftware.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferSoftware_1.default(numVertices, dataPerVertex);
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
        this._writeDepth = depthMask;
        this._depthCompareMode = passCompareMode;
    };
    ContextSoftware.prototype.setProgram = function (program) {
        this._program = program;
    };
    ContextSoftware.prototype.setProgramConstantsFromArray = function (programType, data) {
        var target;
        if (programType == ContextGLProgramType_1.default.VERTEX)
            target = this._vertexConstants = new Float32Array(data.length);
        else if (programType == ContextGLProgramType_1.default.FRAGMENT)
            target = this._fragmentConstants = new Float32Array(data.length);
        target.set(data);
    };
    ContextSoftware.prototype.setTextureAt = function (sampler, texture) {
        this._textures[sampler] = texture;
    };
    ContextSoftware.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        this._vertexBuffers[index] = buffer;
        this._vertexBufferOffsets[index] = bufferOffset;
        this._vertexBufferFormats[index] = format;
    };
    ContextSoftware.prototype.present = function () {
        this._backBufferColor.unlock();
        this._frontBuffer.fillRect(this._frontBuffer.rect, ColorUtils_1.default.ARGBtoFloat32(0, 0, 0, 0));
        this._frontBuffer.draw(this._backBufferColor, this._frontBufferMatrix);
    };
    ContextSoftware.prototype.drawToBitmapImage2D = function (destination) {
    };
    ContextSoftware.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (!this._program)
            return;
        var position0 = new Float32Array(4);
        var position1 = new Float32Array(4);
        var position2 = new Float32Array(4);
        var varying0 = new Float32Array(this._program.numVarying * 4);
        var varying1 = new Float32Array(this._program.numVarying * 4);
        var varying2 = new Float32Array(this._program.numVarying * 4);
        if (this._cullingMode == ContextGLTriangleFace_1.default.BACK) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
        else if (this._cullingMode == ContextGLTriangleFace_1.default.FRONT) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
        else if (this._cullingMode == ContextGLTriangleFace_1.default.FRONT_AND_BACK || this._cullingMode == ContextGLTriangleFace_1.default.NONE) {
            for (var i = firstIndex; i < numIndices; i += 3) {
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i], position0, varying0);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 1], position1, varying1);
                this._program.vertex(this, indexBuffer.data[indexBuffer.startOffset + i + 2], position2, varying2);
                this._triangle(position0, position1, position2, varying0, varying1, varying2);
            }
        }
    };
    ContextSoftware.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        //TODO:
    };
    ContextSoftware.prototype.setScissorRectangle = function (rectangle) {
        //TODO:
    };
    ContextSoftware.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        var state = this._samplerStates[sampler];
        if (!state)
            state = this._samplerStates[sampler] = new SoftwareSamplerState_1.default();
        state.wrap = wrap;
        state.filter = filter;
        state.mipfilter = mipfilter;
    };
    ContextSoftware.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        //TODO:
    };
    ContextSoftware.prototype.setRenderToBackBuffer = function () {
        //TODO:
    };
    ContextSoftware.prototype._putPixel = function (x, y, source, dest) {
        argb[0] = 0;
        argb[1] = 0;
        argb[2] = 0;
        argb[3] = 0;
        BlendModeSoftware[this._blendDestination](dest, dest, source);
        BlendModeSoftware[this._blendSource](source, dest, source);
        this._backBufferColor.setPixelData(x, y, argb);
    };
    ContextSoftware.prototype.clamp = function (value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.max(min, Math.min(value, max));
    };
    ContextSoftware.prototype.interpolate = function (min, max, gradient) {
        return min + (max - min) * this.clamp(gradient);
    };
    ContextSoftware.prototype._triangle = function (position0, position1, position2, varying0, varying1, varying2) {
        var p0 = new Vector3D_1.default(position0[0], position0[1], position0[2], position0[3]);
        if (!p0 || p0.w == 0 || isNaN(p0.w)) {
            console.error("wrong position: " + position0);
            return;
        }
        var p1 = new Vector3D_1.default(position1[0], position1[1], position1[2], position1[3]);
        var p2 = new Vector3D_1.default(position2[0], position2[1], position2[2], position2[3]);
        p0.z = p0.z * 2 - p0.w;
        p1.z = p1.z * 2 - p1.w;
        p2.z = p2.z * 2 - p2.w;
        p0.scaleBy(1 / p0.w);
        p1.scaleBy(1 / p1.w);
        p2.scaleBy(1 / p2.w);
        var project = new Vector3D_1.default(p0.w, p1.w, p2.w);
        p0 = this._screenMatrix.transformVector(p0);
        p1 = this._screenMatrix.transformVector(p1);
        p2 = this._screenMatrix.transformVector(p2);
        var depth = new Vector3D_1.default(p0.z, p1.z, p2.z);
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
        for (var x = this._bboxMin.x; x <= this._bboxMax.x; x++)
            for (var y = this._bboxMin.y; y <= this._bboxMax.y; y++) {
                var screen = this._barycentric(p0, p1, p2, x, y);
                if (screen.x < 0 || screen.y < 0 || screen.z < 0)
                    continue;
                var screenRight = this._barycentric(p0, p1, p2, x + 1, y);
                var screenBottom = this._barycentric(p0, p1, p2, x, y + 1);
                var clip = new Vector3D_1.default(screen.x / project.x, screen.y / project.y, screen.z / project.z);
                clip.scaleBy(1 / (clip.x + clip.y + clip.z));
                var clipRight = new Vector3D_1.default(screenRight.x / project.x, screenRight.y / project.y, screenRight.z / project.z);
                clipRight.scaleBy(1 / (clipRight.x + clipRight.y + clipRight.z));
                var clipBottom = new Vector3D_1.default(screenBottom.x / project.x, screenBottom.y / project.y, screenBottom.z / project.z);
                clipBottom.scaleBy(1 / (clipBottom.x + clipBottom.y + clipBottom.z));
                var index = (x % this._backBufferWidth) + y * this._backBufferWidth;
                var fragDepth = depth.x * screen.x + depth.y * screen.y + depth.z * screen.z;
                if (!DepthCompareModeSoftware[this._depthCompareMode](fragDepth, this._zbuffer[index]))
                    continue;
                var fragmentVO = this._program.fragment(this, clip, clipRight, clipBottom, varying0, varying1, varying2, fragDepth);
                if (fragmentVO.discard)
                    continue;
                if (this._writeDepth)
                    this._zbuffer[index] = fragDepth; //todo: fragmentVO.outputDepth?
                //set source
                source[0] = fragmentVO.outputColor[0] * 255;
                source[1] = fragmentVO.outputColor[1] * 255;
                source[2] = fragmentVO.outputColor[2] * 255;
                source[3] = fragmentVO.outputColor[3] * 255;
                //set dest
                this._backBufferColor.getPixelData(x, y, dest);
                this._putPixel(x, y, source, dest);
            }
    };
    ContextSoftware.prototype._barycentric = function (a, b, c, x, y) {
        this._sx.x = c.x - a.x;
        this._sx.y = b.x - a.x;
        this._sx.z = a.x - x;
        this._sy.x = c.y - a.y;
        this._sy.y = b.y - a.y;
        this._sy.z = a.y - y;
        this._u = this._sx.crossProduct(this._sy, this._u);
        if (this._u.z < 0.01)
            return new Vector3D_1.default(1 - (this._u.x + this._u.y) / this._u.z, this._u.y / this._u.z, this._u.x / this._u.z);
        return new Vector3D_1.default(-1, 1, 1);
    };
    ContextSoftware.MAX_SAMPLERS = 8;
    return ContextSoftware;
}());
var BlendModeSoftware = (function () {
    function BlendModeSoftware() {
    }
    BlendModeSoftware.destinationAlpha = function (result, dest, source) {
        argb[0] += result[0] * dest[0] / 0xFF;
        argb[1] += result[1] * dest[0] / 0xFF;
        argb[2] += result[2] * dest[0] / 0xFF;
        argb[3] += result[3] * dest[0] / 0xFF;
    };
    BlendModeSoftware.destinationColor = function (result, dest, source) {
        argb[0] += result[0] * dest[0] / 0xFF;
        argb[1] += result[1] * dest[1] / 0xFF;
        argb[2] += result[2] * dest[2] / 0xFF;
        argb[3] += result[3] * dest[3] / 0xFF;
    };
    BlendModeSoftware.zero = function (result, dest, source) {
    };
    BlendModeSoftware.one = function (result, dest, source) {
        argb[0] += result[0];
        argb[1] += result[1];
        argb[2] += result[2];
        argb[3] += result[3];
    };
    BlendModeSoftware.oneMinusDestinationAlpha = function (result, dest, source) {
        argb[0] += result[0] * (1 - dest[0] / 0xFF);
        argb[1] += result[1] * (1 - dest[0] / 0xFF);
        argb[2] += result[2] * (1 - dest[0] / 0xFF);
        argb[3] += result[3] * (1 - dest[0] / 0xFF);
    };
    BlendModeSoftware.oneMinusDestinationColor = function (result, dest, source) {
        argb[0] += result[0] * (1 - dest[0] / 0xFF);
        argb[1] += result[1] * (1 - dest[1] / 0xFF);
        argb[2] += result[2] * (1 - dest[2] / 0xFF);
        argb[3] += result[3] * (1 - dest[3] / 0xFF);
    };
    BlendModeSoftware.oneMinusSourceAlpha = function (result, dest, source) {
        argb[0] += result[0] * (1 - source[0] / 0xFF);
        argb[1] += result[1] * (1 - source[0] / 0xFF);
        argb[2] += result[2] * (1 - source[0] / 0xFF);
        argb[3] += result[3] * (1 - source[0] / 0xFF);
    };
    BlendModeSoftware.oneMinusSourceColor = function (result, dest, source) {
        argb[0] += result[0] * (1 - source[0] / 0xFF);
        argb[1] += result[1] * (1 - source[1] / 0xFF);
        argb[2] += result[2] * (1 - source[2] / 0xFF);
        argb[3] += result[3] * (1 - source[3] / 0xFF);
    };
    BlendModeSoftware.sourceAlpha = function (result, dest, source) {
        argb[0] += result[0] * source[0] / 0xFF;
        argb[1] += result[1] * source[0] / 0xFF;
        argb[2] += result[2] * source[0] / 0xFF;
        argb[3] += result[3] * source[0] / 0xFF;
    };
    BlendModeSoftware.sourceColor = function (result, dest, source) {
        argb[0] += result[0] * source[0] / 0xFF;
        argb[1] += result[1] * source[1] / 0xFF;
        argb[2] += result[2] * source[2] / 0xFF;
        argb[3] += result[3] * source[3] / 0xFF;
    };
    return BlendModeSoftware;
}());
var DepthCompareModeSoftware = (function () {
    function DepthCompareModeSoftware() {
    }
    DepthCompareModeSoftware.always = function (fragDepth, currentDepth) {
        return true;
    };
    DepthCompareModeSoftware.equal = function (fragDepth, currentDepth) {
        return fragDepth == currentDepth;
    };
    DepthCompareModeSoftware.greater = function (fragDepth, currentDepth) {
        return fragDepth > currentDepth;
    };
    DepthCompareModeSoftware.greaterEqual = function (fragDepth, currentDepth) {
        return fragDepth >= currentDepth;
    };
    DepthCompareModeSoftware.less = function (fragDepth, currentDepth) {
        return fragDepth < currentDepth;
    };
    DepthCompareModeSoftware.lessEqual = function (fragDepth, currentDepth) {
        return fragDepth <= currentDepth;
    };
    DepthCompareModeSoftware.never = function (fragDepth, currentDepth) {
        return false;
    };
    DepthCompareModeSoftware.notEqual = function (fragDepth, currentDepth) {
        return fragDepth != currentDepth;
    };
    return DepthCompareModeSoftware;
}());
var argb = new Uint8ClampedArray(4);
var source = new Uint8ClampedArray(4);
var dest = new Uint8ClampedArray(4);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextSoftware;

},{"../base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","../base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","../base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","../base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","../base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","../base/IndexBufferSoftware":"awayjs-stagegl/lib/base/IndexBufferSoftware","../base/ProgramSoftware":"awayjs-stagegl/lib/base/ProgramSoftware","../base/SoftwareSamplerState":"awayjs-stagegl/lib/base/SoftwareSamplerState","../base/TextureSoftware":"awayjs-stagegl/lib/base/TextureSoftware","../base/VertexBufferSoftware":"awayjs-stagegl/lib/base/VertexBufferSoftware","awayjs-core/lib/geom/Matrix":undefined,"awayjs-core/lib/geom/Matrix3D":undefined,"awayjs-core/lib/geom/Point":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/BitmapImage2D":undefined,"awayjs-core/lib/utils/ColorUtils":undefined}],"awayjs-stagegl/lib/base/ContextStage3D":[function(require,module,exports){
"use strict";
//import swfobject					from "../swfobject";
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var CubeTextureFlash_1 = require("../base/CubeTextureFlash");
var IndexBufferFlash_1 = require("../base/IndexBufferFlash");
var OpCodes_1 = require("../base/OpCodes");
var ProgramFlash_1 = require("../base/ProgramFlash");
var TextureFlash_1 = require("../base/TextureFlash");
var VertexBufferFlash_1 = require("../base/VertexBufferFlash");
var ContextStage3D = (function () {
    //TODO: get rid of hack that fixes including definition file
    function ContextStage3D(container, callback) {
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
            this.addStream(String.fromCharCode(OpCodes_1.default.enableErrorChecking, value ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue));
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
        return new TextureFlash_1.default(this, width, height, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO:streaming
        return new CubeTextureFlash_1.default(this, size, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.setTextureAt = function (sampler, texture) {
        if (texture) {
            this.addStream(String.fromCharCode(OpCodes_1.default.setTextureAt) + sampler + "," + texture.id + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.default.clearTextureAt) + sampler.toString() + ",");
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
        this.addStream(String.fromCharCode(OpCodes_1.default.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        if (readMask === void 0) { readMask = 255; }
        if (writeMask === void 0) { writeMask = 255; }
        this.addStream(String.fromCharCode(OpCodes_1.default.setStencilReferenceValue, referenceValue + OpCodes_1.default.intMask, readMask + OpCodes_1.default.intMask, writeMask + OpCodes_1.default.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        //TODO implement coordinateSystem option
        this.addStream(String.fromCharCode(OpCodes_1.default.setCulling) + triangleFaceToCull + "$");
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
        this.addStream(String.fromCharCode(OpCodes_1.default.drawTriangles, indexBuffer.id + OpCodes_1.default.intMask) + firstIndex + "," + numIndices + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        if (firstVertex === void 0) { firstVertex = 0; }
        if (numVertices === void 0) { numVertices = -1; }
        //can't be done in Stage3D
    };
    ContextStage3D.prototype.setProgramConstantsFromArray = function (programType, data) {
        var startIndex;
        var numRegisters = data.length / 4;
        var target = (programType == ContextGLProgramType_1.default.VERTEX) ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue;
        for (var i = 0; i < numRegisters; i++) {
            startIndex = i * 4;
            this.addStream(String.fromCharCode(OpCodes_1.default.setProgramConstant, target, i + OpCodes_1.default.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");
            if (ContextStage3D.debug)
                this.execute();
        }
    };
    ContextStage3D.prototype.setProgram = function (program) {
        this.addStream(String.fromCharCode(OpCodes_1.default.setProgram, program.id + OpCodes_1.default.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.present = function () {
        this.addStream(String.fromCharCode(OpCodes_1.default.present));
        this.execute();
    };
    ContextStage3D.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask_1.default.ALL; }
        this.addStream(String.fromCharCode(OpCodes_1.default.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.createProgram = function () {
        return new ProgramFlash_1.default(this);
    };
    ContextStage3D.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
        return new VertexBufferFlash_1.default(this, numVertices, data32PerVertex);
    };
    ContextStage3D.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferFlash_1.default(this, numIndices);
    };
    ContextStage3D.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = true; }
        this._width = width;
        this._height = height;
        //TODO: add Anitalias setting
        this.addStream(String.fromCharCode(OpCodes_1.default.configureBackBuffer) + width + "," + height + ",");
    };
    ContextStage3D.prototype.drawToBitmapImage2D = function (destination) {
        //TODO
    };
    ContextStage3D.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        if (bufferOffset === void 0) { bufferOffset = 0; }
        if (format === void 0) { format = null; }
        if (buffer) {
            this.addStream(String.fromCharCode(OpCodes_1.default.setVertexBufferAt, index + OpCodes_1.default.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.default.clearVertexBufferAt, index + OpCodes_1.default.intMask));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setColorMask = function (red, green, blue, alpha) {
        this.addStream(String.fromCharCode(OpCodes_1.default.setColorMask, red ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue, green ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue, blue ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue, alpha ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this.addStream(String.fromCharCode(OpCodes_1.default.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (antiAlias === void 0) { antiAlias = 0; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        if (target === null || target === undefined) {
            this.addStream(String.fromCharCode(OpCodes_1.default.clearRenderToTexture));
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.default.setRenderToTexture, enableDepthAndStencil ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue) + target.id + "," + (antiAlias || 0) + ",");
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToBackBuffer = function () {
        this.addStream(String.fromCharCode(OpCodes_1.default.clearRenderToTexture));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setScissorRectangle = function (rectangle) {
        if (rectangle) {
            this.addStream(String.fromCharCode(OpCodes_1.default.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.default.clearScissorRect));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this.addStream(String.fromCharCode(OpCodes_1.default.setDepthTest, depthMask ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue) + passCompareMode + "$");
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
            this.addStream(String.fromCharCode(OpCodes_1.default.disposeContext));
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
    ContextStage3D.debug = false;
    ContextStage3D.logStream = false;
    return ContextStage3D;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextStage3D;
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

},{"../base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","../base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","../base/CubeTextureFlash":"awayjs-stagegl/lib/base/CubeTextureFlash","../base/IndexBufferFlash":"awayjs-stagegl/lib/base/IndexBufferFlash","../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ProgramFlash":"awayjs-stagegl/lib/base/ProgramFlash","../base/TextureFlash":"awayjs-stagegl/lib/base/TextureFlash","../base/VertexBufferFlash":"awayjs-stagegl/lib/base/VertexBufferFlash"}],"awayjs-stagegl/lib/base/ContextWebGL":[function(require,module,exports){
"use strict";
var Rectangle_1 = require("awayjs-core/lib/geom/Rectangle");
var ContextGLBlendFactor_1 = require("../base/ContextGLBlendFactor");
var ContextGLDrawMode_1 = require("../base/ContextGLDrawMode");
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLCompareMode_1 = require("../base/ContextGLCompareMode");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var ContextGLStencilAction_1 = require("../base/ContextGLStencilAction");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLTriangleFace_1 = require("../base/ContextGLTriangleFace");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var CubeTextureWebGL_1 = require("../base/CubeTextureWebGL");
var IndexBufferWebGL_1 = require("../base/IndexBufferWebGL");
var ProgramWebGL_1 = require("../base/ProgramWebGL");
var TextureWebGL_1 = require("../base/TextureWebGL");
var SamplerState_1 = require("../base/SamplerState");
var VertexBufferWebGL_1 = require("../base/VertexBufferWebGL");
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
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.DESTINATION_ALPHA] = this._gl.DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.DESTINATION_COLOR] = this._gl.DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE] = this._gl.ONE;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE_MINUS_DESTINATION_ALPHA] = this._gl.ONE_MINUS_DST_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE_MINUS_DESTINATION_COLOR] = this._gl.ONE_MINUS_DST_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE_MINUS_SOURCE_ALPHA] = this._gl.ONE_MINUS_SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ONE_MINUS_SOURCE_COLOR] = this._gl.ONE_MINUS_SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.SOURCE_ALPHA] = this._gl.SRC_ALPHA;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.SOURCE_COLOR] = this._gl.SRC_COLOR;
            this._blendFactorDictionary[ContextGLBlendFactor_1.default.ZERO] = this._gl.ZERO;
            this._drawModeDictionary[ContextGLDrawMode_1.default.LINES] = this._gl.LINES;
            this._drawModeDictionary[ContextGLDrawMode_1.default.TRIANGLES] = this._gl.TRIANGLES;
            this._compareModeDictionary[ContextGLCompareMode_1.default.ALWAYS] = this._gl.ALWAYS;
            this._compareModeDictionary[ContextGLCompareMode_1.default.EQUAL] = this._gl.EQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.default.GREATER] = this._gl.GREATER;
            this._compareModeDictionary[ContextGLCompareMode_1.default.GREATER_EQUAL] = this._gl.GEQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.default.LESS] = this._gl.LESS;
            this._compareModeDictionary[ContextGLCompareMode_1.default.LESS_EQUAL] = this._gl.LEQUAL;
            this._compareModeDictionary[ContextGLCompareMode_1.default.NEVER] = this._gl.NEVER;
            this._compareModeDictionary[ContextGLCompareMode_1.default.NOT_EQUAL] = this._gl.NOTEQUAL;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.DECREMENT_SATURATE] = this._gl.DECR;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.DECREMENT_WRAP] = this._gl.DECR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.INCREMENT_SATURATE] = this._gl.INCR;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.INCREMENT_WRAP] = this._gl.INCR_WRAP;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.INVERT] = this._gl.INVERT;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.KEEP] = this._gl.KEEP;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.SET] = this._gl.REPLACE;
            this._stencilActionDictionary[ContextGLStencilAction_1.default.ZERO] = this._gl.ZERO;
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
            this._wrapDictionary[ContextGLWrapMode_1.default.REPEAT] = this._gl.REPEAT;
            this._wrapDictionary[ContextGLWrapMode_1.default.CLAMP] = this._gl.CLAMP_TO_EDGE;
            this._filterDictionary[ContextGLTextureFilter_1.default.LINEAR] = this._gl.LINEAR;
            this._filterDictionary[ContextGLTextureFilter_1.default.NEAREST] = this._gl.NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.LINEAR] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.LINEAR][ContextGLMipFilter_1.default.MIPNEAREST] = this._gl.LINEAR_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.LINEAR][ContextGLMipFilter_1.default.MIPLINEAR] = this._gl.LINEAR_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.LINEAR][ContextGLMipFilter_1.default.MIPNONE] = this._gl.LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.NEAREST] = new Object();
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.NEAREST][ContextGLMipFilter_1.default.MIPNEAREST] = this._gl.NEAREST_MIPMAP_NEAREST;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.NEAREST][ContextGLMipFilter_1.default.MIPLINEAR] = this._gl.NEAREST_MIPMAP_LINEAR;
            this._mipmapFilterDictionary[ContextGLTextureFilter_1.default.NEAREST][ContextGLMipFilter_1.default.MIPNONE] = this._gl.NEAREST;
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.FLOAT_1] = new VertexBufferProperties(1, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.FLOAT_2] = new VertexBufferProperties(2, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.FLOAT_3] = new VertexBufferProperties(3, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.FLOAT_4] = new VertexBufferProperties(4, this._gl.FLOAT, false);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.BYTE_1] = new VertexBufferProperties(1, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.BYTE_2] = new VertexBufferProperties(2, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.BYTE_3] = new VertexBufferProperties(3, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.BYTE_4] = new VertexBufferProperties(4, this._gl.BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_BYTE, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.SHORT_1] = new VertexBufferProperties(1, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.SHORT_2] = new VertexBufferProperties(2, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.SHORT_3] = new VertexBufferProperties(3, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.SHORT_4] = new VertexBufferProperties(4, this._gl.SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_SHORT, true);
            this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_SHORT, true);
            this._stencilCompareMode = this._gl.ALWAYS;
            this._stencilCompareModeBack = this._gl.ALWAYS;
            this._stencilCompareModeFront = this._gl.ALWAYS;
        }
        else {
            //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
            alert("WebGL is not available.");
        }
        //defaults
        for (var i = 0; i < ContextWebGL.MAX_SAMPLERS; ++i) {
            this._samplerStates[i] = new SamplerState_1.default();
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
        if (mask === void 0) { mask = ContextGLClearMask_1.default.ALL; }
        if (!this._drawing) {
            this.updateBlendStatus();
            this._drawing = true;
        }
        var glmask = 0;
        if (mask & ContextGLClearMask_1.default.COLOR)
            glmask |= this._gl.COLOR_BUFFER_BIT;
        if (mask & ContextGLClearMask_1.default.STENCIL)
            glmask |= this._gl.STENCIL_BUFFER_BIT;
        if (mask & ContextGLClearMask_1.default.DEPTH)
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
        return new CubeTextureWebGL_1.default(this._gl, size);
    };
    ContextWebGL.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferWebGL_1.default(this._gl, numIndices);
    };
    ContextWebGL.prototype.createProgram = function () {
        return new ProgramWebGL_1.default(this._gl);
    };
    ContextWebGL.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO streaming
        return new TextureWebGL_1.default(this._gl, width, height);
    };
    ContextWebGL.prototype.createVertexBuffer = function (numVertices, dataPerVertex) {
        return new VertexBufferWebGL_1.default(this._gl, numVertices, dataPerVertex);
    };
    ContextWebGL.prototype.dispose = function () {
        for (var i = 0; i < this._samplerStates.length; ++i)
            this._samplerStates[i] = null;
    };
    ContextWebGL.prototype.drawToBitmapImage2D = function (destination) {
        var pixels = new Uint8ClampedArray(destination.width * destination.height * 4);
        this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
        destination.setPixels(new Rectangle_1.default(0, 0, destination.width, destination.height), pixels);
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
        if (triangleFaceToCull == ContextGLTriangleFace_1.default.NONE) {
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
    ContextWebGL.prototype.setProgramConstantsFromArray = function (programType, data) {
        if (data.length)
            this._gl.uniform4fv(this._currentProgram.getUniformLocation(programType), data);
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
        this._gl.uniform1i(this._currentProgram.getUniformLocation(ContextGLProgramType_1.default.SAMPLER, sampler), sampler);
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
            case ContextGLTriangleFace_1.default.BACK:
                return (coordinateSystem == "leftHanded") ? this._gl.FRONT : this._gl.BACK;
            case ContextGLTriangleFace_1.default.FRONT:
                return (coordinateSystem == "leftHanded") ? this._gl.BACK : this._gl.FRONT;
            case ContextGLTriangleFace_1.default.FRONT_AND_BACK:
                return this._gl.FRONT_AND_BACK;
            default:
                throw "Unknown ContextGLTriangleFace type."; // TODO error
        }
    };
    ContextWebGL.MAX_SAMPLERS = 8;
    ContextWebGL.modulo = 0;
    return ContextWebGL;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextWebGL;
var VertexBufferProperties = (function () {
    function VertexBufferProperties(size, type, normalized) {
        this.size = size;
        this.type = type;
        this.normalized = normalized;
    }
    return VertexBufferProperties;
}());

},{"../base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","../base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","../base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","../base/ContextGLDrawMode":"awayjs-stagegl/lib/base/ContextGLDrawMode","../base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","../base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","../base/ContextGLStencilAction":"awayjs-stagegl/lib/base/ContextGLStencilAction","../base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","../base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","../base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","../base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","../base/CubeTextureWebGL":"awayjs-stagegl/lib/base/CubeTextureWebGL","../base/IndexBufferWebGL":"awayjs-stagegl/lib/base/IndexBufferWebGL","../base/ProgramWebGL":"awayjs-stagegl/lib/base/ProgramWebGL","../base/SamplerState":"awayjs-stagegl/lib/base/SamplerState","../base/TextureWebGL":"awayjs-stagegl/lib/base/TextureWebGL","../base/VertexBufferWebGL":"awayjs-stagegl/lib/base/VertexBufferWebGL","awayjs-core/lib/geom/Rectangle":undefined}],"awayjs-stagegl/lib/base/CubeTextureFlash":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ByteArrayBase_1 = require("awayjs-core/lib/utils/ByteArrayBase");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var CubeTextureFlash = (function (_super) {
    __extends(CubeTextureFlash, _super);
    function CubeTextureFlash(context, size, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._size = size;
        this._context.addStream(String.fromCharCode(OpCodes_1.default.initCubeTexture, (forRTT ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue)) + size + "," + streaming + "," + format + "$");
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
        this._context.addStream(String.fromCharCode(OpCodes_1.default.disposeCubeTexture) + this._pId.toString() + ",");
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
        var bytes = ByteArrayBase_1.default.internalGetBase64String(data.length, function () {
            return data[pos++];
        }, null);
        this._context.addStream(String.fromCharCode(OpCodes_1.default.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    CubeTextureFlash.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
    };
    return CubeTextureFlash;
}(ResourceBaseFlash_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CubeTextureFlash;

},{"../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash","awayjs-core/lib/utils/ByteArrayBase":undefined}],"awayjs-stagegl/lib/base/CubeTextureWebGL":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TextureBaseWebGL_1 = require("../base/TextureBaseWebGL");
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
}(TextureBaseWebGL_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CubeTextureWebGL;

},{"../base/TextureBaseWebGL":"awayjs-stagegl/lib/base/TextureBaseWebGL"}],"awayjs-stagegl/lib/base/IContextGL":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/ICubeTexture":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/IIndexBuffer":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/IProgram":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/ITextureBase":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/ITexture":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/IVertexBuffer":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/base/IndexBufferFlash":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var IndexBufferFlash = (function (_super) {
    __extends(IndexBufferFlash, _super);
    function IndexBufferFlash(context, numIndices) {
        _super.call(this);
        this._context = context;
        this._numIndices = numIndices;
        this._context.addStream(String.fromCharCode(OpCodes_1.default.initIndexBuffer, numIndices + OpCodes_1.default.intMask));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    IndexBufferFlash.prototype.uploadFromArray = function (data, startOffset, count) {
        this._context.addStream(String.fromCharCode(OpCodes_1.default.uploadArrayIndexBuffer, this._pId + OpCodes_1.default.intMask) + data.join() + "#" + startOffset + "," + count + ",");
        this._context.execute();
    };
    IndexBufferFlash.prototype.uploadFromByteArray = function (data, startOffset, count) {
    };
    IndexBufferFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.default.disposeIndexBuffer, this._pId + OpCodes_1.default.intMask));
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
}(ResourceBaseFlash_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexBufferFlash;

},{"../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/IndexBufferSoftware":[function(require,module,exports){
"use strict";
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
        this._data = null;
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexBufferSoftware;

},{}],"awayjs-stagegl/lib/base/IndexBufferWebGL":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IndexBufferWebGL;

},{}],"awayjs-stagegl/lib/base/OpCodes":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpCodes;

},{}],"awayjs-stagegl/lib/base/ProgramFlash":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContextStage3D_1 = require("../base/ContextStage3D");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var ProgramFlash = (function (_super) {
    __extends(ProgramFlash, _super);
    function ProgramFlash(context) {
        _super.call(this);
        this._context = context;
        this._context.addStream(String.fromCharCode(OpCodes_1.default.initProgram));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    ProgramFlash.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._context.addStream(String.fromCharCode(OpCodes_1.default.uploadAGALBytesProgram, this._pId + OpCodes_1.default.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");
        if (ContextStage3D_1.default.debug)
            this._context.execute();
    };
    ProgramFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.default.disposeProgram, this._pId + OpCodes_1.default.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return ProgramFlash;
}(ResourceBaseFlash_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramFlash;

},{"../base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D","../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/ProgramSoftware":[function(require,module,exports){
"use strict";
var AGALTokenizer_1 = require("../aglsl/AGALTokenizer");
var ProgramVOSoftware_1 = require("../base/ProgramVOSoftware");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var SoftwareSamplerState_1 = require("../base/SoftwareSamplerState");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var ProgramSoftware = (function () {
    function ProgramSoftware() {
        this._numVarying = 0;
    }
    Object.defineProperty(ProgramSoftware.prototype, "numVarying", {
        get: function () {
            return this._numVarying;
        },
        enumerable: true,
        configurable: true
    });
    ProgramSoftware.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._vertexDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(vertexProgram);
        this._vertexVO = new ProgramVOSoftware_1.default();
        this._vertexVO.temp = new Float32Array(this._vertexDescr.regwrite[0x2].length * 4);
        this._vertexVO.attributes = new Float32Array(this._vertexDescr.regread[0x0].length * 4);
        this._numVarying = this._vertexDescr.regwrite[0x4].length;
        this._fragmentDescr = ProgramSoftware._tokenizer.decribeAGALByteArray(fragmentProgram);
        this._fragmentVO = new ProgramVOSoftware_1.default();
        this._fragmentVO.temp = new Float32Array(this._fragmentDescr.regwrite[0x2].length * 4);
        this._fragmentVO.varying = new Float32Array(this._fragmentDescr.regread[0x4].length * 4);
        this._fragmentVO.derivativeX = new Float32Array(this._fragmentVO.varying.length);
        this._fragmentVO.derivativeY = new Float32Array(this._fragmentVO.varying.length);
    };
    ProgramSoftware.prototype.dispose = function () {
        this._vertexDescr = null;
        this._fragmentDescr = null;
    };
    ProgramSoftware.prototype.vertex = function (context, vertexIndex, position, varying) {
        //set attributes
        var i;
        var j = 0;
        var numAttributes = this._vertexDescr.regread[0x0].length;
        var attributes = this._vertexVO.attributes;
        for (i = 0; i < numAttributes; i++) {
            var buffer = context._vertexBuffers[i];
            if (!buffer)
                continue;
            var index = context._vertexBufferOffsets[i] / 4 + vertexIndex * buffer.attributesPerVertex;
            if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_4) {
                attributes[j++] = buffer.uintData[index * 4];
                attributes[j++] = buffer.uintData[index * 4 + 1];
                attributes[j++] = buffer.uintData[index * 4 + 2];
                attributes[j++] = buffer.uintData[index * 4 + 3];
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.default.FLOAT_4) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = buffer.data[index + 2];
                attributes[j++] = buffer.data[index + 3];
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.default.FLOAT_3) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = buffer.data[index + 2];
                attributes[j++] = 1;
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.default.FLOAT_2) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = buffer.data[index + 1];
                attributes[j++] = 0;
                attributes[j++] = 1;
            }
            else if (context._vertexBufferFormats[i] == ContextGLVertexBufferFormat_1.default.FLOAT_1) {
                attributes[j++] = buffer.data[index];
                attributes[j++] = 0;
                attributes[j++] = 0;
                attributes[j++] = 1;
            }
        }
        //clear temps
        var temp = this._vertexVO.temp;
        var numTemp = temp.length;
        for (var i = 0; i < numTemp; i += 4) {
            temp[i] = 0;
            temp[i + 1] = 0;
            temp[i + 2] = 0;
            temp[i + 3] = 1;
        }
        this._vertexVO.outputPosition = position;
        this._vertexVO.varying = varying;
        var len = this._vertexDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._vertexDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](this._vertexVO, this._vertexDescr, token.dest, token.a, token.b, context);
        }
    };
    ProgramSoftware.prototype.fragment = function (context, clip, clipRight, clipBottom, varying0, varying1, varying2, fragDepth) {
        this._fragmentVO.outputDepth = fragDepth;
        //clear temps
        var temp = this._fragmentVO.temp;
        var numTemp = temp.length;
        for (var i = 0; i < numTemp; i += 4) {
            temp[i] = 0;
            temp[i + 1] = 0;
            temp[i + 2] = 0;
            temp[i + 3] = 1;
        }
        //check for requirement of derivatives
        var varyingDerivatives = [];
        var len = this._fragmentDescr.tokens.length;
        for (var i = 0; i < len; i++) {
            var token = this._fragmentDescr.tokens[i];
            if (token.opcode == 0x28 && context._samplerStates[token.b.regnum] && context._samplerStates[token.b.regnum].mipfilter == ContextGLMipFilter_1.default.MIPLINEAR && context._textures[token.b.regnum].getMipLevelsCount() > 1)
                varyingDerivatives.push(token.a.regnum);
        }
        var derivativeX = this._fragmentVO.derivativeX;
        var derivativeY = this._fragmentVO.derivativeY;
        var varying = this._fragmentVO.varying;
        var numVarying = varying.length;
        for (var i = 0; i < numVarying; i += 4) {
            // if (!varying0 || !varying1 || !varying2) continue;
            varying[i] = clip.x * varying0[i] + clip.y * varying1[i] + clip.z * varying2[i];
            varying[i + 1] = clip.x * varying0[i + 1] + clip.y * varying1[i + 1] + clip.z * varying2[i + 1];
            varying[i + 2] = clip.x * varying0[i + 2] + clip.y * varying1[i + 2] + clip.z * varying2[i + 2];
            varying[i + 3] = clip.x * varying0[i + 3] + clip.y * varying1[i + 3] + clip.z * varying2[i + 3];
            if (varyingDerivatives.indexOf(i) == -1)
                continue;
            derivativeX[i] = clipRight.x * varying0[i] + clipRight.y * varying1[i] + clipRight.z * varying2[i];
            derivativeX[i + 1] = clipRight.x * varying0[i + 1] + clipRight.y * varying1[i + 1] + clipRight.z * varying2[i + 1];
            derivativeX[i + 2] = clipRight.x * varying0[i + 2] + clipRight.y * varying1[i + 2] + clipRight.z * varying2[i + 2];
            derivativeX[i + 3] = clipRight.x * varying0[i + 3] + clipRight.y * varying1[i + 3] + clipRight.z * varying2[i + 3];
            derivativeX[i] -= varying[i];
            derivativeX[i + 1] -= varying[i + 1];
            derivativeX[i + 2] -= varying[i + 2];
            derivativeX[i + 3] -= varying[i + 3];
            derivativeY[i] = clipBottom.x * varying0[i] + clipBottom.y * varying1[i] + clipBottom.z * varying2[i];
            derivativeY[i + 1] = clipBottom.x * varying0[i + 1] + clipBottom.y * varying1[i + 1] + clipBottom.z * varying2[i + 1];
            derivativeY[i + 2] = clipBottom.x * varying0[i + 2] + clipBottom.y * varying1[i + 2] + clipBottom.z * varying2[i + 2];
            derivativeY[i + 3] = clipBottom.x * varying0[i + 3] + clipBottom.y * varying1[i + 3] + clipBottom.z * varying2[i + 3];
            derivativeY[i] -= varying[i];
            derivativeY[i + 1] -= varying[i + 1];
            derivativeY[i + 2] -= varying[i + 2];
            derivativeY[i + 3] -= varying[i + 3];
        }
        for (var i = 0; i < len; i++) {
            var token = this._fragmentDescr.tokens[i];
            ProgramSoftware._opCodeFunc[token.opcode](this._fragmentVO, this._fragmentDescr, token.dest, token.a, token.b, context);
        }
        return this._fragmentVO;
    };
    ProgramSoftware.getDestTarget = function (vo, desc, dest) {
        var target;
        if (dest.regtype == 0x2) {
            target = vo.temp;
        }
        else if (dest.regtype == 0x3) {
            if (desc.header.type == "vertex") {
                target = vo.outputPosition;
            }
            else {
                target = vo.outputColor;
            }
        }
        else if (dest.regtype == 0x4) {
            target = vo.varying;
        }
        return target;
    };
    ProgramSoftware.getSourceTarget = function (vo, desc, dest, context) {
        var target;
        if (dest.regtype == 0x0) {
            target = vo.attributes;
        }
        else if (dest.regtype == 0x1) {
            if (desc.header.type == "vertex") {
                target = context._vertexConstants;
            }
            else {
                target = context._fragmentConstants;
            }
        }
        else if (dest.regtype == 0x2) {
            target = vo.temp;
        }
        else if (dest.regtype == 0x4) {
            target = vo.varying;
        }
        return target;
    };
    ProgramSoftware.mov = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1.swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1.swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1.swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1.swizzle >> 6) & 3)];
    };
    ProgramSoftware.m44 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2] + source2Target[source2Reg + 3];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6] + source2Target[source2Reg + 7];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10] + source2Target[source2Reg + 11];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg] * source2Target[source2Reg + 12] + source1Target[source1Reg + 1] * source2Target[source2Reg + 13] + source1Target[source1Reg + 2] * source2Target[source2Reg + 14] + source2Target[source2Reg + 15];
    };
    ProgramSoftware.sample = function (vo, desc, context, source1, textureIndex) {
        var source1Reg = 4 * source1.regnum;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var u = source1Target[((source1.swizzle >> 0) & 3)];
        var v = source1Target[((source1.swizzle >> 2) & 3)];
        if (textureIndex >= context._textures.length || context._textures[textureIndex] == null)
            return new Float32Array([1, u, v, 0]);
        var texture = context._textures[textureIndex];
        var state = context._samplerStates[textureIndex] || this._defaultSamplerState;
        var repeat = state.wrap == ContextGLWrapMode_1.default.REPEAT;
        var mipmap = state.mipfilter == ContextGLMipFilter_1.default.MIPLINEAR;
        if (mipmap && texture.getMipLevelsCount() > 1) {
            var dux = Math.abs(vo.derivativeX[source1Reg + ((source1.swizzle >> 0) & 3)]);
            var dvx = Math.abs(vo.derivativeX[source1Reg + ((source1.swizzle >> 2) & 3)]);
            var duy = Math.abs(vo.derivativeY[source1Reg + ((source1.swizzle >> 0) & 3)]);
            var dvy = Math.abs(vo.derivativeY[source1Reg + ((source1.swizzle >> 2) & 3)]);
            var lambda = Math.log(Math.max(texture.width * Math.sqrt(dux * dux + dvx * dvx), texture.height * Math.sqrt(duy * duy + dvy * dvy))) / Math.LN2;
            if (lambda > 0) {
                var miplevelLow = Math.floor(lambda);
                var miplevelHigh = Math.ceil(lambda);
                var maxmiplevel = Math.log(Math.min(texture.width, texture.height)) / Math.LN2;
                if (miplevelHigh > maxmiplevel)
                    miplevelHigh = maxmiplevel;
                if (miplevelLow > maxmiplevel)
                    miplevelLow = maxmiplevel;
                var mipblend = lambda - Math.floor(lambda);
                var resultLow;
                var resultHigh;
                var dataLow = texture.getData(miplevelLow);
                var dataLowWidth = texture.width / Math.pow(2, miplevelLow);
                var dataLowHeight = texture.height / Math.pow(2, miplevelLow);
                var dataHigh = texture.getData(miplevelHigh);
                var dataHighWidth = texture.width / Math.pow(2, miplevelHigh);
                var dataHighHeight = texture.height / Math.pow(2, miplevelHigh);
                if (state.filter == ContextGLTextureFilter_1.default.LINEAR) {
                    resultLow = ProgramSoftware.sampleBilinear(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleBilinear(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                }
                else {
                    resultLow = ProgramSoftware.sampleNearest(u, v, dataLow, dataLowWidth, dataLowHeight, repeat);
                    resultHigh = ProgramSoftware.sampleNearest(u, v, dataHigh, dataHighWidth, dataHighHeight, repeat);
                }
                return ProgramSoftware.interpolateColor(resultLow, resultHigh, mipblend);
            }
        }
        var result;
        var data = texture.getData(0);
        if (state.filter == ContextGLTextureFilter_1.default.LINEAR) {
            result = ProgramSoftware.sampleBilinear(u, v, data, texture.width, texture.height, repeat);
        }
        else {
            result = ProgramSoftware.sampleNearest(u, v, data, texture.width, texture.height, repeat);
        }
        return result;
    };
    ProgramSoftware.sampleNearest = function (u, v, textureData, textureWidth, textureHeight, repeat) {
        u *= textureWidth;
        v *= textureHeight;
        if (repeat) {
            u = Math.abs(u % textureWidth);
            v = Math.abs(v % textureHeight);
        }
        else {
            if (u < 0)
                u = 0;
            else if (u > textureWidth - 1)
                u = textureWidth - 1;
            if (v < 0)
                v = 0;
            else if (v > textureHeight - 1)
                v = textureHeight - 1;
        }
        u = Math.floor(u);
        v = Math.floor(v);
        var pos = (u + v * textureWidth) * 4;
        var r = textureData[pos] / 255;
        var g = textureData[pos + 1] / 255;
        var b = textureData[pos + 2] / 255;
        var a = textureData[pos + 3] / 255;
        return new Float32Array([a, r, g, b]);
    };
    ProgramSoftware.sampleBilinear = function (u, v, textureData, textureWidth, textureHeight, repeat) {
        var texelSizeX = 1 / textureWidth;
        var texelSizeY = 1 / textureHeight;
        u -= texelSizeX / 2;
        v -= texelSizeY / 2;
        var color00 = ProgramSoftware.sampleNearest(u, v, textureData, textureWidth, textureHeight, repeat);
        var color10 = ProgramSoftware.sampleNearest(u + texelSizeX, v, textureData, textureWidth, textureHeight, repeat);
        var color01 = ProgramSoftware.sampleNearest(u, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);
        var color11 = ProgramSoftware.sampleNearest(u + texelSizeX, v + texelSizeY, textureData, textureWidth, textureHeight, repeat);
        var a = u * textureWidth;
        a = a - Math.floor(a);
        var interColor0 = ProgramSoftware.interpolateColor(color00, color10, a);
        var interColor1 = ProgramSoftware.interpolateColor(color01, color11, a);
        var b = v * textureHeight;
        b = b - Math.floor(b);
        return ProgramSoftware.interpolateColor(interColor0, interColor1, b);
    };
    ProgramSoftware.interpolateColor = function (source, target, a) {
        var result = new Float32Array(4);
        result[0] = source[0] + (target[0] - source[0]) * a;
        result[1] = source[1] + (target[1] - source[1]) * a;
        result[2] = source[2] + (target[2] - source[2]) * a;
        result[3] = source[3] + (target[3] - source[3]) * a;
        return result;
    };
    ProgramSoftware.tex = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var color = ProgramSoftware.sample(vo, desc, context, source1, source2.regnum);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = color[1];
        if (mask & 2)
            target[targetReg + 1] = color[2];
        if (mask & 4)
            target[targetReg + 2] = color[3];
        if (mask & 8)
            target[targetReg + 3] = color[0];
    };
    ProgramSoftware.add = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] + source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sub = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] - source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.mul = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] * source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.div = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] / source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
    };
    ProgramSoftware.rcp = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = 1 / source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = 1 / source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = 1 / source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = 1 / source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.min = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.min(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.max = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.max(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.frc = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)] - Math.floor(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.sqt = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.rsq = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = 1 / Math.sqrt(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.pow = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        if (mask & 1)
            target[targetReg] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)], source2Target[source2Reg + ((source2Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)], source2Target[source2Reg + ((source2Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)], source2Target[source2Reg + ((source2Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.pow(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)], source2Target[source2Reg + ((source2Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.log = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]) / Math.LN2;
        if (mask & 2)
            target[targetReg + 1] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]) / Math.LN2;
        if (mask & 4)
            target[targetReg + 2] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]) / Math.LN2;
        if (mask & 8)
            target[targetReg + 3] = Math.log(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]) / Math.LN2;
    };
    ProgramSoftware.exp = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.exp(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.nrm = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var x = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var y = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var z = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var len = Math.sqrt(x * x + y * y + z * z);
        x /= len;
        y /= len;
        z /= len;
        if (mask & 1)
            target[targetReg] = x;
        if (mask & 2)
            target[targetReg + 1] = y;
        if (mask & 4)
            target[targetReg + 2] = z;
    };
    ProgramSoftware.sin = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.sin(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.cos = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.cos(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.crs = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetY * source2TargetZ - source1TargetZ * source2TargetY;
        if (mask & 2)
            target[targetReg + 1] = source1TargetZ * source2TargetX - source1TargetX * source2TargetZ;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetY - source1TargetY * source2TargetX;
    };
    ProgramSoftware.dp3 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 2)
            target[targetReg + 1] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
        if (mask & 8)
            target[targetReg + 3] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ;
    };
    ProgramSoftware.dp4 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 2)
            target[targetReg + 1] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 4)
            target[targetReg + 2] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
        if (mask & 8)
            target[targetReg + 3] = source1TargetX * source2TargetX + source1TargetY * source2TargetY + source1TargetZ * source2TargetZ + source1TargetW * source2TargetW;
    };
    ProgramSoftware.abs = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]);
        if (mask & 2)
            target[targetReg + 1] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]);
        if (mask & 4)
            target[targetReg + 2] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]);
        if (mask & 8)
            target[targetReg + 3] = Math.abs(source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]);
    };
    ProgramSoftware.neg = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = -source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = -source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = -source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = -source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sat = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 0) & 3)]));
        if (mask & 2)
            target[targetReg + 1] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 2) & 3)]));
        if (mask & 4)
            target[targetReg + 2] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 4) & 3)]));
        if (mask & 8)
            target[targetReg + 3] = Math.max(0, Math.min(1, source1Target[source1Reg + ((source1Swizzle >> 6) & 3)]));
    };
    ProgramSoftware.m33 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10];
    };
    ProgramSoftware.m34 = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source2.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var mask = dest.mask;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg] * source2Target[source2Reg] + source1Target[source1Reg + 1] * source2Target[source2Reg + 1] + source1Target[source1Reg + 2] * source2Target[source2Reg + 2] + source2Target[source2Reg + 3];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg] * source2Target[source2Reg + 4] + source1Target[source1Reg + 1] * source2Target[source2Reg + 5] + source1Target[source1Reg + 2] * source2Target[source2Reg + 6] + source2Target[source2Reg + 7];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg] * source2Target[source2Reg + 8] + source1Target[source1Reg + 1] * source2Target[source2Reg + 9] + source1Target[source1Reg + 2] * source2Target[source2Reg + 10] + source2Target[source2Reg + 11];
    };
    ProgramSoftware.ddx = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = vo.derivativeX;
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.ddy = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var source1Target = vo.derivativeY;
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        if (mask & 1)
            target[targetReg] = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (mask & 2)
            target[targetReg + 1] = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        if (mask & 4)
            target[targetReg + 2] = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        if (mask & 8)
            target[targetReg + 3] = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
    };
    ProgramSoftware.sge = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX >= source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY >= source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ >= source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW >= source2TargetW ? 1 : 0;
    };
    ProgramSoftware.slt = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX < source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY < source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ < source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW < source2TargetW ? 1 : 0;
    };
    ProgramSoftware.seq = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX == source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY == source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ == source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW == source2TargetW ? 1 : 0;
    };
    ProgramSoftware.sne = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var source2Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source2Swizzle = source2.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        var source2Target = ProgramSoftware.getSourceTarget(vo, desc, source2, context);
        var source2TargetX = source2Target[source2Reg + ((source2Swizzle >> 0) & 3)];
        var source2TargetY = source2Target[source2Reg + ((source2Swizzle >> 2) & 3)];
        var source2TargetZ = source2Target[source2Reg + ((source2Swizzle >> 4) & 3)];
        var source2TargetW = source2Target[source2Reg + ((source2Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = source1TargetX != source2TargetX ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = source1TargetY != source2TargetY ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = source1TargetZ != source2TargetZ ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = source1TargetW != source2TargetW ? 1 : 0;
    };
    ProgramSoftware.sgn = function (vo, desc, dest, source1, source2, context) {
        var targetReg = 4 * dest.regnum;
        var source1Reg = 4 * source1.regnum;
        var target = ProgramSoftware.getDestTarget(vo, desc, dest);
        var mask = dest.mask;
        var source1Swizzle = source1.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        var source1TargetY = source1Target[source1Reg + ((source1Swizzle >> 2) & 3)];
        var source1TargetZ = source1Target[source1Reg + ((source1Swizzle >> 4) & 3)];
        var source1TargetW = source1Target[source1Reg + ((source1Swizzle >> 6) & 3)];
        if (mask & 1)
            target[targetReg] = (source1TargetX < 0) ? -1 : (source1TargetX > 0) ? 1 : 0;
        if (mask & 2)
            target[targetReg + 1] = (source1TargetY < 0) ? -1 : (source1TargetY > 0) ? 1 : 0;
        if (mask & 4)
            target[targetReg + 2] = (source1TargetZ < 0) ? -1 : (source1TargetZ > 0) ? 1 : 0;
        if (mask & 8)
            target[targetReg + 3] = (source1TargetW < 0) ? -1 : (source1TargetW > 0) ? 1 : 0;
    };
    ProgramSoftware.kil = function (vo, desc, dest, source1, source2, context) {
        var source1Reg = 4 * source1.regnum;
        var source1Swizzle = source1.swizzle;
        var source1Target = ProgramSoftware.getSourceTarget(vo, desc, source1, context);
        var source1TargetX = source1Target[source1Reg + ((source1Swizzle >> 0) & 3)];
        if (source1TargetX < 0)
            vo.discard = true;
    };
    ProgramSoftware._defaultSamplerState = new SoftwareSamplerState_1.default();
    ProgramSoftware._tokenizer = new AGALTokenizer_1.default();
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramSoftware;

},{"../aglsl/AGALTokenizer":"awayjs-stagegl/lib/aglsl/AGALTokenizer","../base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","../base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","../base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","../base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","../base/ProgramVOSoftware":"awayjs-stagegl/lib/base/ProgramVOSoftware","../base/SoftwareSamplerState":"awayjs-stagegl/lib/base/SoftwareSamplerState"}],"awayjs-stagegl/lib/base/ProgramVOSoftware":[function(require,module,exports){
"use strict";
var ProgramVOSoftware = (function () {
    function ProgramVOSoftware() {
        this.outputColor = new Float32Array([0, 0, 0, 1]);
        this.discard = false;
    }
    return ProgramVOSoftware;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramVOSoftware;

},{}],"awayjs-stagegl/lib/base/ProgramWebGL":[function(require,module,exports){
"use strict";
var AGALTokenizer_1 = require("../aglsl/AGALTokenizer");
var AGLSLParser_1 = require("../aglsl/AGLSLParser");
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
        if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS))
            throw new Error(this._gl.getShaderInfoLog(this._vertexShader));
        this._gl.shaderSource(this._fragmentShader, fragmentString);
        this._gl.compileShader(this._fragmentShader);
        if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS))
            throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));
        this._gl.attachShader(this._program, this._vertexShader);
        this._gl.attachShader(this._program, this._fragmentShader);
        this._gl.linkProgram(this._program);
        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS))
            throw new Error(this._gl.getProgramInfoLog(this._program));
        this._uniforms[0].length = 0;
        this._uniforms[1].length = 0;
        this._uniforms[2].length = 0;
        this._attribs.length = 0;
    };
    ProgramWebGL.prototype.getUniformLocation = function (programType, index) {
        if (index === void 0) { index = -1; }
        if (this._uniforms[programType][index] != null)
            return this._uniforms[programType][index];
        var name = (index == -1) ? ProgramWebGL._uniformLocationNameDictionary[programType] : ProgramWebGL._uniformLocationNameDictionary[programType] + index;
        return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, name));
    };
    //
    // public getUniformLocation(programType:number, index:number):WebGLUniformLocation
    // {
    // 	if (this._uniforms[programType][index] != null)
    // 		return this._uniforms[programType][index];
    //
    // 	return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, ProgramWebGL._uniformLocationNameDictionary[programType] + index));
    // }
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
    ProgramWebGL._tokenizer = new AGALTokenizer_1.default();
    ProgramWebGL._aglslParser = new AGLSLParser_1.default();
    ProgramWebGL._uniformLocationNameDictionary = ["fc", "fs", "vc"];
    return ProgramWebGL;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramWebGL;

},{"../aglsl/AGALTokenizer":"awayjs-stagegl/lib/aglsl/AGALTokenizer","../aglsl/AGLSLParser":"awayjs-stagegl/lib/aglsl/AGLSLParser"}],"awayjs-stagegl/lib/base/ResourceBaseFlash":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResourceBaseFlash;

},{}],"awayjs-stagegl/lib/base/SamplerState":[function(require,module,exports){
"use strict";
var SamplerState = (function () {
    function SamplerState() {
    }
    return SamplerState;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SamplerState;

},{}],"awayjs-stagegl/lib/base/SoftwareSamplerState":[function(require,module,exports){
"use strict";
var ContextGLTextureFilter_1 = require("./ContextGLTextureFilter");
var ContextGLMipFilter_1 = require("./ContextGLMipFilter");
var ContextGLWrapMode_1 = require("./ContextGLWrapMode");
/**
 * The same as SamplerState, but with strings
 * TODO: replace two similar classes with one
 */
var SoftwareSamplerState = (function () {
    function SoftwareSamplerState() {
        this.wrap = ContextGLWrapMode_1.default.REPEAT;
        this.filter = ContextGLTextureFilter_1.default.LINEAR;
        this.mipfilter = ContextGLMipFilter_1.default.MIPLINEAR;
    }
    return SoftwareSamplerState;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SoftwareSamplerState;

},{"./ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","./ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","./ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode"}],"awayjs-stagegl/lib/base/Stage":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("awayjs-core/lib/events/EventDispatcher");
var Rectangle_1 = require("awayjs-core/lib/geom/Rectangle");
var CSS_1 = require("awayjs-core/lib/utils/CSS");
var ContextMode_1 = require("../base/ContextMode");
var ContextGLMipFilter_1 = require("../base/ContextGLMipFilter");
var ContextGLTextureFilter_1 = require("../base/ContextGLTextureFilter");
var ContextGLVertexBufferFormat_1 = require("../base/ContextGLVertexBufferFormat");
var ContextGLWrapMode_1 = require("../base/ContextGLWrapMode");
var ContextWebGL_1 = require("../base/ContextWebGL");
var ContextStage3D_1 = require("../base/ContextStage3D");
var ContextSoftware_1 = require("../base/ContextSoftware");
var StageEvent_1 = require("../events/StageEvent");
var ProgramDataPool_1 = require("../image/ProgramDataPool");
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
        this._abstractionPool = new Object();
        this._programData = new Array();
        this._x = 0;
        this._y = 0;
        //private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver/request animation frame
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
        this.globalDisableMipmap = false;
        this.globalDisableSmooth = false;
        this._programDataPool = new ProgramDataPool_1.default(this);
        this._container = container;
        if (this._container) {
            this._container.addEventListener("webglcontextlost", function (event) { return _this.onContextLost(event); });
            this._container.addEventListener("webglcontextrestored", function (event) { return _this.onContextRestored(event); });
        }
        this._stageIndex = stageIndex;
        this._stageManager = stageManager;
        this._viewPort = new Rectangle_1.default();
        this._enableDepthAndStencil = true;
        CSS_1.default.setElementX(this._container, 0);
        CSS_1.default.setElementY(this._container, 0);
        this._bufferFormatDictionary[1] = new Array(5);
        this._bufferFormatDictionary[1][1] = ContextGLVertexBufferFormat_1.default.BYTE_1;
        this._bufferFormatDictionary[1][2] = ContextGLVertexBufferFormat_1.default.BYTE_2;
        this._bufferFormatDictionary[1][3] = ContextGLVertexBufferFormat_1.default.BYTE_3;
        this._bufferFormatDictionary[1][4] = ContextGLVertexBufferFormat_1.default.BYTE_4;
        this._bufferFormatDictionary[2] = new Array(5);
        this._bufferFormatDictionary[2][1] = ContextGLVertexBufferFormat_1.default.SHORT_1;
        this._bufferFormatDictionary[2][2] = ContextGLVertexBufferFormat_1.default.SHORT_2;
        this._bufferFormatDictionary[2][3] = ContextGLVertexBufferFormat_1.default.SHORT_3;
        this._bufferFormatDictionary[2][4] = ContextGLVertexBufferFormat_1.default.SHORT_4;
        this._bufferFormatDictionary[4] = new Array(5);
        this._bufferFormatDictionary[4][1] = ContextGLVertexBufferFormat_1.default.FLOAT_1;
        this._bufferFormatDictionary[4][2] = ContextGLVertexBufferFormat_1.default.FLOAT_2;
        this._bufferFormatDictionary[4][3] = ContextGLVertexBufferFormat_1.default.FLOAT_3;
        this._bufferFormatDictionary[4][4] = ContextGLVertexBufferFormat_1.default.FLOAT_4;
        this._bufferFormatDictionary[5] = new Array(5);
        this._bufferFormatDictionary[5][1] = ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_1;
        this._bufferFormatDictionary[5][2] = ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_2;
        this._bufferFormatDictionary[5][3] = ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_3;
        this._bufferFormatDictionary[5][4] = ContextGLVertexBufferFormat_1.default.UNSIGNED_BYTE_4;
        this._bufferFormatDictionary[6] = new Array(5);
        this._bufferFormatDictionary[6][1] = ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_1;
        this._bufferFormatDictionary[6][2] = ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_2;
        this._bufferFormatDictionary[6][3] = ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_3;
        this._bufferFormatDictionary[6][4] = ContextGLVertexBufferFormat_1.default.UNSIGNED_SHORT_4;
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
            this._context.setRenderToTexture(this.getAbstraction(target).texture, enableDepthAndStencil, this._antiAlias, surfaceSelector);
        }
        else {
            this._context.setRenderToBackBuffer();
            this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
        }
    };
    Stage.prototype.getAbstraction = function (asset) {
        return (this._abstractionPool[asset.id] || (this._abstractionPool[asset.id] = new Stage._abstractionClassPool[asset.assetType](asset, this)));
    };
    /**
     *
     * @param image
     */
    Stage.prototype.clearAbstraction = function (asset) {
        this._abstractionPool[asset.id] = null;
    };
    /**
     *
     * @param imageObjectClass
     */
    Stage.registerAbstraction = function (gl_assetClass, assetClass) {
        Stage._abstractionClassPool[assetClass.assetType] = gl_assetClass;
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
            if (mode == ContextMode_1.default.FLASH)
                new ContextStage3D_1.default(this._container, function (context) { return _this._callback(context); });
            else if (mode == ContextMode_1.default.SOFTWARE)
                this._context = new ContextSoftware_1.default(this._container);
            else
                this._context = new ContextWebGL_1.default(this._container);
        }
        catch (e) {
            try {
                if (mode == ContextMode_1.default.AUTO)
                    new ContextStage3D_1.default(this._container, function (context) { return _this._callback(context); });
                else
                    this.dispatchEvent(new StageEvent_1.default(StageEvent_1.default.STAGE_ERROR, this));
            }
            catch (e) {
                this.dispatchEvent(new StageEvent_1.default(StageEvent_1.default.STAGE_ERROR, this));
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
            CSS_1.default.setElementWidth(this._container, val);
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
            CSS_1.default.setElementHeight(this._container, val);
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
            CSS_1.default.setElementX(this._container, val);
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
            CSS_1.default.setElementY(this._container, val);
            this._y = this._viewPort.y = val;
            this.notifyViewportUpdated();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stage.prototype, "visible", {
        get: function () {
            return CSS_1.default.getElementVisibility(this._container);
        },
        set: function (val) {
            CSS_1.default.setElementVisibility(this._container, val);
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
        this.dispatchEvent(new StageEvent_1.default(StageEvent_1.default.VIEWPORT_UPDATED, this));
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
        for (var id in this._abstractionPool)
            this._abstractionPool[id].clear();
        this._abstractionPool = null;
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
        this._context.clear((this._color & 0xff000000) >>> 24, // <--------- Zero-fill right shift
        (this._color & 0xff0000) >>> 16, // <-------------|
        (this._color & 0xff00) >>> 8, // <----------------|
        this._color & 0xff);
        this._bufferClear = true;
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
    /**
     * Frees the Context associated with this StageProxy.
     */
    Stage.prototype.freeContext = function () {
        if (this._context) {
            this._context.dispose();
            this.dispatchEvent(new StageEvent_1.default(StageEvent_1.default.CONTEXT_DISPOSED, this));
        }
        this._context = null;
        this._initialised = false;
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
        this.dispatchEvent(new StageEvent_1.default(this._initialised ? StageEvent_1.default.CONTEXT_RECREATED : StageEvent_1.default.CONTEXT_CREATED, this));
        this._initialised = true;
    };
    Stage.prototype.setVertexBuffer = function (index, buffer, size, dimensions, offset, unsigned) {
        if (unsigned === void 0) { unsigned = false; }
        this._context.setVertexBufferAt(index, buffer, offset, this._bufferFormatDictionary[unsigned ? size + 4 : size][dimensions]);
    };
    Stage.prototype.setSamplerState = function (index, repeat, smooth, mipmap) {
        var wrap = repeat ? ContextGLWrapMode_1.default.REPEAT : ContextGLWrapMode_1.default.CLAMP;
        var filter = (smooth && !this.globalDisableSmooth) ? ContextGLTextureFilter_1.default.LINEAR : ContextGLTextureFilter_1.default.NEAREST;
        var mipfilter = (mipmap && !this.globalDisableMipmap) ? ContextGLMipFilter_1.default.MIPLINEAR : ContextGLMipFilter_1.default.MIPNONE;
        this._context.setSamplerStateAt(index, wrap, filter, mipfilter);
    };
    Stage._abstractionClassPool = new Object();
    return Stage;
}(EventDispatcher_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Stage;

},{"../base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","../base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","../base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","../base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","../base/ContextMode":"awayjs-stagegl/lib/base/ContextMode","../base/ContextSoftware":"awayjs-stagegl/lib/base/ContextSoftware","../base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D","../base/ContextWebGL":"awayjs-stagegl/lib/base/ContextWebGL","../events/StageEvent":"awayjs-stagegl/lib/events/StageEvent","../image/ProgramDataPool":"awayjs-stagegl/lib/image/ProgramDataPool","awayjs-core/lib/events/EventDispatcher":undefined,"awayjs-core/lib/geom/Rectangle":undefined,"awayjs-core/lib/utils/CSS":undefined}],"awayjs-stagegl/lib/base/TextureBaseWebGL":[function(require,module,exports){
"use strict";
var AbstractMethodError_1 = require("awayjs-core/lib/errors/AbstractMethodError");
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
            throw new AbstractMethodError_1.default();
        },
        enumerable: true,
        configurable: true
    });
    return TextureBaseWebGL;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextureBaseWebGL;

},{"awayjs-core/lib/errors/AbstractMethodError":undefined}],"awayjs-stagegl/lib/base/TextureFlash":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ByteArrayBase_1 = require("awayjs-core/lib/utils/ByteArrayBase");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var TextureFlash = (function (_super) {
    __extends(TextureFlash, _super);
    function TextureFlash(context, width, height, format, forRTT, streaming) {
        if (streaming === void 0) { streaming = false; }
        _super.call(this);
        this._context = context;
        this._width = width;
        this._height = height;
        this._context.addStream(String.fromCharCode(OpCodes_1.default.initTexture, (forRTT ? OpCodes_1.default.trueValue : OpCodes_1.default.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
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
        this._context.addStream(String.fromCharCode(OpCodes_1.default.disposeTexture) + this._pId.toString() + ",");
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
        var bytes = ByteArrayBase_1.default.internalGetBase64String(data.length, function () {
            return data[pos++];
        }, null);
        this._context.addStream(String.fromCharCode(OpCodes_1.default.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
        this._context.execute();
    };
    return TextureFlash;
}(ResourceBaseFlash_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextureFlash;

},{"../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash","awayjs-core/lib/utils/ByteArrayBase":undefined}],"awayjs-stagegl/lib/base/TextureSoftware":[function(require,module,exports){
"use strict";
var TextureSoftware = (function () {
    function TextureSoftware(width, height) {
        this.textureType = "texture2d";
        this._mipLevels = [];
        this._width = width;
        this._height = height;
    }
    TextureSoftware.prototype.dispose = function () {
        this._mipLevels = null;
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
        this._mipLevels[miplevel] = data.data;
    };
    TextureSoftware.prototype.getData = function (miplevel) {
        return this._mipLevels[miplevel];
    };
    TextureSoftware.prototype.getMipLevelsCount = function () {
        return this._mipLevels.length;
    };
    return TextureSoftware;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextureSoftware;

},{}],"awayjs-stagegl/lib/base/TextureWebGL":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TextureBaseWebGL_1 = require("../base/TextureBaseWebGL");
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
}(TextureBaseWebGL_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextureWebGL;

},{"../base/TextureBaseWebGL":"awayjs-stagegl/lib/base/TextureBaseWebGL"}],"awayjs-stagegl/lib/base/VertexBufferFlash":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var VertexBufferFlash = (function (_super) {
    __extends(VertexBufferFlash, _super);
    function VertexBufferFlash(context, numVertices, dataPerVertex) {
        _super.call(this);
        this._context = context;
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
        this._context.addStream(String.fromCharCode(OpCodes_1.default.initVertexBuffer, dataPerVertex + OpCodes_1.default.intMask) + numVertices.toString() + ",");
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    VertexBufferFlash.prototype.uploadFromArray = function (data, startVertex, numVertices) {
        this._context.addStream(String.fromCharCode(OpCodes_1.default.uploadArrayVertexBuffer, this._pId + OpCodes_1.default.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
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
        this._context.addStream(String.fromCharCode(OpCodes_1.default.disposeVertexBuffer, this._pId + OpCodes_1.default.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return VertexBufferFlash;
}(ResourceBaseFlash_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VertexBufferFlash;

},{"../base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","../base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash"}],"awayjs-stagegl/lib/base/VertexBufferSoftware":[function(require,module,exports){
"use strict";
var VertexBufferSoftware = (function () {
    //private _dataOffset:number;
    function VertexBufferSoftware(numVertices, dataPerVertex) {
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }
    VertexBufferSoftware.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
        //this._dataOffset = startVertex * this._dataPerVertex;
        this._floatData = new Float32Array(vertices);
    };
    VertexBufferSoftware.prototype.uploadFromByteArray = function (data, startVertex, numVertices) {
        //this._dataOffset = startVertex * this._dataPerVertex;
        this._floatData = new Float32Array(data, startVertex * this._dataPerVertex, numVertices * this._dataPerVertex / 4);
        this._uintData = new Uint8Array(data);
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
        this._floatData = null;
    };
    Object.defineProperty(VertexBufferSoftware.prototype, "data", {
        get: function () {
            return this._floatData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexBufferSoftware.prototype, "uintData", {
        get: function () {
            return this._uintData;
        },
        enumerable: true,
        configurable: true
    });
    return VertexBufferSoftware;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VertexBufferSoftware;

},{}],"awayjs-stagegl/lib/base/VertexBufferWebGL":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VertexBufferWebGL;

},{}],"awayjs-stagegl/lib/base":[function(require,module,exports){
"use strict";
var ContextGLBlendFactor_1 = require("./base/ContextGLBlendFactor");
exports.ContextGLBlendFactor = ContextGLBlendFactor_1.default;
var ContextGLClearMask_1 = require("./base/ContextGLClearMask");
exports.ContextGLClearMask = ContextGLClearMask_1.default;
var ContextGLCompareMode_1 = require("./base/ContextGLCompareMode");
exports.ContextGLCompareMode = ContextGLCompareMode_1.default;
var ContextGLDrawMode_1 = require("./base/ContextGLDrawMode");
exports.ContextGLDrawMode = ContextGLDrawMode_1.default;
var ContextGLMipFilter_1 = require("./base/ContextGLMipFilter");
exports.ContextGLMipFilter = ContextGLMipFilter_1.default;
var ContextGLProfile_1 = require("./base/ContextGLProfile");
exports.ContextGLProfile = ContextGLProfile_1.default;
var ContextGLProgramType_1 = require("./base/ContextGLProgramType");
exports.ContextGLProgramType = ContextGLProgramType_1.default;
var ContextGLStencilAction_1 = require("./base/ContextGLStencilAction");
exports.ContextGLStencilAction = ContextGLStencilAction_1.default;
var ContextGLTextureFilter_1 = require("./base/ContextGLTextureFilter");
exports.ContextGLTextureFilter = ContextGLTextureFilter_1.default;
var ContextGLTextureFormat_1 = require("./base/ContextGLTextureFormat");
exports.ContextGLTextureFormat = ContextGLTextureFormat_1.default;
var ContextGLTriangleFace_1 = require("./base/ContextGLTriangleFace");
exports.ContextGLTriangleFace = ContextGLTriangleFace_1.default;
var ContextGLVertexBufferFormat_1 = require("./base/ContextGLVertexBufferFormat");
exports.ContextGLVertexBufferFormat = ContextGLVertexBufferFormat_1.default;
var ContextGLWrapMode_1 = require("./base/ContextGLWrapMode");
exports.ContextGLWrapMode = ContextGLWrapMode_1.default;
var ContextMode_1 = require("./base/ContextMode");
exports.ContextMode = ContextMode_1.default;
var ContextSoftware_1 = require("./base/ContextSoftware");
exports.ContextSoftware = ContextSoftware_1.default;
var ContextStage3D_1 = require("./base/ContextStage3D");
exports.ContextStage3D = ContextStage3D_1.default;
var ContextWebGL_1 = require("./base/ContextWebGL");
exports.ContextWebGL = ContextWebGL_1.default;
var CubeTextureFlash_1 = require("./base/CubeTextureFlash");
exports.CubeTextureFlash = CubeTextureFlash_1.default;
var CubeTextureWebGL_1 = require("./base/CubeTextureWebGL");
exports.CubeTextureWebGL = CubeTextureWebGL_1.default;
var IndexBufferFlash_1 = require("./base/IndexBufferFlash");
exports.IndexBufferFlash = IndexBufferFlash_1.default;
var IndexBufferSoftware_1 = require("./base/IndexBufferSoftware");
exports.IndexBufferSoftware = IndexBufferSoftware_1.default;
var IndexBufferWebGL_1 = require("./base/IndexBufferWebGL");
exports.IndexBufferWebGL = IndexBufferWebGL_1.default;
var OpCodes_1 = require("./base/OpCodes");
exports.OpCodes = OpCodes_1.default;
var ProgramFlash_1 = require("./base/ProgramFlash");
exports.ProgramFlash = ProgramFlash_1.default;
var ProgramSoftware_1 = require("./base/ProgramSoftware");
exports.ProgramSoftware = ProgramSoftware_1.default;
var ProgramVOSoftware_1 = require("./base/ProgramVOSoftware");
exports.ProgramVOSoftware = ProgramVOSoftware_1.default;
var ProgramWebGL_1 = require("./base/ProgramWebGL");
exports.ProgramWebGL = ProgramWebGL_1.default;
var ResourceBaseFlash_1 = require("./base/ResourceBaseFlash");
exports.ResourceBaseFlash = ResourceBaseFlash_1.default;
var SamplerState_1 = require("./base/SamplerState");
exports.SamplerState = SamplerState_1.default;
var SoftwareSamplerState_1 = require("./base/SoftwareSamplerState");
exports.SoftwareSamplerState = SoftwareSamplerState_1.default;
var Stage_1 = require("./base/Stage");
exports.Stage = Stage_1.default;
var TextureBaseWebGL_1 = require("./base/TextureBaseWebGL");
exports.TextureBaseWebGL = TextureBaseWebGL_1.default;
var TextureFlash_1 = require("./base/TextureFlash");
exports.TextureFlash = TextureFlash_1.default;
var TextureSoftware_1 = require("./base/TextureSoftware");
exports.TextureSoftware = TextureSoftware_1.default;
var TextureWebGL_1 = require("./base/TextureWebGL");
exports.TextureWebGL = TextureWebGL_1.default;
var VertexBufferFlash_1 = require("./base/VertexBufferFlash");
exports.VertexBufferFlash = VertexBufferFlash_1.default;
var VertexBufferSoftware_1 = require("./base/VertexBufferSoftware");
exports.VertexBufferSoftware = VertexBufferSoftware_1.default;
var VertexBufferWebGL_1 = require("./base/VertexBufferWebGL");
exports.VertexBufferWebGL = VertexBufferWebGL_1.default;

},{"./base/ContextGLBlendFactor":"awayjs-stagegl/lib/base/ContextGLBlendFactor","./base/ContextGLClearMask":"awayjs-stagegl/lib/base/ContextGLClearMask","./base/ContextGLCompareMode":"awayjs-stagegl/lib/base/ContextGLCompareMode","./base/ContextGLDrawMode":"awayjs-stagegl/lib/base/ContextGLDrawMode","./base/ContextGLMipFilter":"awayjs-stagegl/lib/base/ContextGLMipFilter","./base/ContextGLProfile":"awayjs-stagegl/lib/base/ContextGLProfile","./base/ContextGLProgramType":"awayjs-stagegl/lib/base/ContextGLProgramType","./base/ContextGLStencilAction":"awayjs-stagegl/lib/base/ContextGLStencilAction","./base/ContextGLTextureFilter":"awayjs-stagegl/lib/base/ContextGLTextureFilter","./base/ContextGLTextureFormat":"awayjs-stagegl/lib/base/ContextGLTextureFormat","./base/ContextGLTriangleFace":"awayjs-stagegl/lib/base/ContextGLTriangleFace","./base/ContextGLVertexBufferFormat":"awayjs-stagegl/lib/base/ContextGLVertexBufferFormat","./base/ContextGLWrapMode":"awayjs-stagegl/lib/base/ContextGLWrapMode","./base/ContextMode":"awayjs-stagegl/lib/base/ContextMode","./base/ContextSoftware":"awayjs-stagegl/lib/base/ContextSoftware","./base/ContextStage3D":"awayjs-stagegl/lib/base/ContextStage3D","./base/ContextWebGL":"awayjs-stagegl/lib/base/ContextWebGL","./base/CubeTextureFlash":"awayjs-stagegl/lib/base/CubeTextureFlash","./base/CubeTextureWebGL":"awayjs-stagegl/lib/base/CubeTextureWebGL","./base/IndexBufferFlash":"awayjs-stagegl/lib/base/IndexBufferFlash","./base/IndexBufferSoftware":"awayjs-stagegl/lib/base/IndexBufferSoftware","./base/IndexBufferWebGL":"awayjs-stagegl/lib/base/IndexBufferWebGL","./base/OpCodes":"awayjs-stagegl/lib/base/OpCodes","./base/ProgramFlash":"awayjs-stagegl/lib/base/ProgramFlash","./base/ProgramSoftware":"awayjs-stagegl/lib/base/ProgramSoftware","./base/ProgramVOSoftware":"awayjs-stagegl/lib/base/ProgramVOSoftware","./base/ProgramWebGL":"awayjs-stagegl/lib/base/ProgramWebGL","./base/ResourceBaseFlash":"awayjs-stagegl/lib/base/ResourceBaseFlash","./base/SamplerState":"awayjs-stagegl/lib/base/SamplerState","./base/SoftwareSamplerState":"awayjs-stagegl/lib/base/SoftwareSamplerState","./base/Stage":"awayjs-stagegl/lib/base/Stage","./base/TextureBaseWebGL":"awayjs-stagegl/lib/base/TextureBaseWebGL","./base/TextureFlash":"awayjs-stagegl/lib/base/TextureFlash","./base/TextureSoftware":"awayjs-stagegl/lib/base/TextureSoftware","./base/TextureWebGL":"awayjs-stagegl/lib/base/TextureWebGL","./base/VertexBufferFlash":"awayjs-stagegl/lib/base/VertexBufferFlash","./base/VertexBufferSoftware":"awayjs-stagegl/lib/base/VertexBufferSoftware","./base/VertexBufferWebGL":"awayjs-stagegl/lib/base/VertexBufferWebGL"}],"awayjs-stagegl/lib/events/StageEvent":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventBase_1 = require("awayjs-core/lib/events/EventBase");
var StageEvent = (function (_super) {
    __extends(StageEvent, _super);
    function StageEvent(type, stage) {
        _super.call(this, type);
        this._stage = stage;
    }
    Object.defineProperty(StageEvent.prototype, "stage", {
        /**
         *
         */
        get: function () {
            return this._stage;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    StageEvent.prototype.clone = function () {
        return new StageEvent(this.type, this._stage);
    };
    /**
     *
     */
    StageEvent.STAGE_ERROR = "stageError";
    /**
     *
     */
    StageEvent.CONTEXT_CREATED = "contextCreated";
    /**
     *
     */
    StageEvent.CONTEXT_DISPOSED = "contextDisposed";
    /**
     *
     */
    StageEvent.CONTEXT_RECREATED = "contextRecreated";
    /**
     *
     */
    StageEvent.VIEWPORT_UPDATED = "viewportUpdated";
    return StageEvent;
}(EventBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StageEvent;

},{"awayjs-core/lib/events/EventBase":undefined}],"awayjs-stagegl/lib/events":[function(require,module,exports){
"use strict";
var StageEvent_1 = require("./events/StageEvent");
exports.StageEvent = StageEvent_1.default;

},{"./events/StageEvent":"awayjs-stagegl/lib/events/StageEvent"}],"awayjs-stagegl/lib/image/GL_BitmapImage2D":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MipmapGenerator_1 = require("awayjs-core/lib/utils/MipmapGenerator");
var GL_Image2D_1 = require("../image/GL_Image2D");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_BitmapImage2D = (function (_super) {
    __extends(GL_BitmapImage2D, _super);
    function GL_BitmapImage2D() {
        _super.apply(this, arguments);
    }
    GL_BitmapImage2D.prototype.activate = function (index, mipmap) {
        if (mipmap && this._stage.globalDisableMipmap)
            mipmap = false;
        if (!this._texture) {
            this._createTexture();
            this._invalid = true;
        }
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        if (this._invalid) {
            this._invalid = false;
            if (mipmap) {
                var mipmapData = this._mipmapData || (this._mipmapData = new Array());
                MipmapGenerator_1.default._generateMipMaps(this._asset.getCanvas(), mipmapData, true);
                var len = mipmapData.length;
                for (var i = 0; i < len; i++)
                    this._texture.uploadFromData(mipmapData[i].getImageData(), i);
            }
            else {
                this._texture.uploadFromData(this._asset.getImageData(), 0);
            }
        }
        _super.prototype.activate.call(this, index, mipmap);
    };
    /**
     *
     */
    GL_BitmapImage2D.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        if (this._mipmapData) {
            var len = this._mipmapData.length;
            for (var i = 0; i < len; i++)
                MipmapGenerator_1.default._freeMipMapHolder(this._mipmapData[i]);
        }
    };
    return GL_BitmapImage2D;
}(GL_Image2D_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_BitmapImage2D;

},{"../image/GL_Image2D":"awayjs-stagegl/lib/image/GL_Image2D","awayjs-core/lib/utils/MipmapGenerator":undefined}],"awayjs-stagegl/lib/image/GL_BitmapImageCube":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MipmapGenerator_1 = require("awayjs-core/lib/utils/MipmapGenerator");
var GL_ImageCube_1 = require("../image/GL_ImageCube");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_BitmapImageCube = (function (_super) {
    __extends(GL_BitmapImageCube, _super);
    function GL_BitmapImageCube() {
        _super.apply(this, arguments);
        this._mipmapDataArray = new Array(6);
    }
    GL_BitmapImageCube.prototype.activate = function (index, mipmap) {
        if (mipmap && this._stage.globalDisableMipmap)
            mipmap = false;
        if (!this._texture) {
            this._createTexture();
            this._invalid = true;
        }
        if (!this._mipmap && mipmap) {
            this._mipmap = true;
            this._invalid = true;
        }
        if (this._invalid) {
            this._invalid = false;
            for (var i = 0; i < 6; ++i) {
                if (mipmap) {
                    var mipmapData = this._mipmapDataArray[i] || (this._mipmapDataArray[i] = new Array());
                    MipmapGenerator_1.default._generateMipMaps(this._asset.getCanvas(i), mipmapData, true);
                    var len = mipmapData.length;
                    for (var j = 0; j < len; j++)
                        this._texture.uploadFromData(mipmapData[j].getImageData(), i, j);
                }
                else {
                    this._texture.uploadFromData(this._asset.getImageData(i), i, 0);
                }
            }
        }
        _super.prototype.activate.call(this, index, mipmap);
    };
    /**
     *
     */
    GL_BitmapImageCube.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        for (var i = 0; i < 6; i++) {
            var mipmapData = this._mipmapDataArray[i];
            if (mipmapData) {
                var len = mipmapData.length;
                for (var j = 0; j < len; i++)
                    MipmapGenerator_1.default._freeMipMapHolder(mipmapData[j]);
            }
        }
    };
    return GL_BitmapImageCube;
}(GL_ImageCube_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_BitmapImageCube;

},{"../image/GL_ImageCube":"awayjs-stagegl/lib/image/GL_ImageCube","awayjs-core/lib/utils/MipmapGenerator":undefined}],"awayjs-stagegl/lib/image/GL_Image2D":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContextGLTextureFormat_1 = require("../base/ContextGLTextureFormat");
var GL_ImageBase_1 = require("../image/GL_ImageBase");
/**
 *
 * @class away.pool.GL_ImageBase
 */
var GL_Image2D = (function (_super) {
    __extends(GL_Image2D, _super);
    function GL_Image2D() {
        _super.apply(this, arguments);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    GL_Image2D.prototype._createTexture = function () {
        this._texture = this._stage.context.createTexture(this._asset.width, this._asset.height, ContextGLTextureFormat_1.default.BGRA, true);
    };
    return GL_Image2D;
}(GL_ImageBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_Image2D;

},{"../base/ContextGLTextureFormat":"awayjs-stagegl/lib/base/ContextGLTextureFormat","../image/GL_ImageBase":"awayjs-stagegl/lib/image/GL_ImageBase"}],"awayjs-stagegl/lib/image/GL_ImageBase":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractMethodError_1 = require("awayjs-core/lib/errors/AbstractMethodError");
var AbstractionBase_1 = require("awayjs-core/lib/library/AbstractionBase");
/**
 *
 * @class away.pool.GL_ImageBase
 */
var GL_ImageBase = (function (_super) {
    __extends(GL_ImageBase, _super);
    function GL_ImageBase(asset, stage) {
        _super.call(this, asset, stage);
        this.usages = 0;
        this._stage = stage;
    }
    Object.defineProperty(GL_ImageBase.prototype, "texture", {
        get: function () {
            if (!this._texture) {
                this._createTexture();
                this._invalid = true;
            }
            return this._texture;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    GL_ImageBase.prototype.onClear = function (event) {
        _super.prototype.onClear.call(this, event);
        if (this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
    };
    GL_ImageBase.prototype.activate = function (index, mipmap) {
        this._stage.context.setTextureAt(index, this._texture);
    };
    GL_ImageBase.prototype._createTexture = function () {
        throw new AbstractMethodError_1.default();
    };
    return GL_ImageBase;
}(AbstractionBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_ImageBase;

},{"awayjs-core/lib/errors/AbstractMethodError":undefined,"awayjs-core/lib/library/AbstractionBase":undefined}],"awayjs-stagegl/lib/image/GL_ImageCube":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContextGLTextureFormat_1 = require("../base/ContextGLTextureFormat");
var GL_ImageBase_1 = require("../image/GL_ImageBase");
/**
 *
 * @class away.pool.GL_ImageCubeBase
 */
var GL_ImageCube = (function (_super) {
    __extends(GL_ImageCube, _super);
    function GL_ImageCube() {
        _super.apply(this, arguments);
    }
    /**
     *
     * @param context
     * @returns {ITexture}
     */
    GL_ImageCube.prototype._createTexture = function () {
        this._texture = this._stage.context.createCubeTexture(this._asset.size, ContextGLTextureFormat_1.default.BGRA, false);
    };
    return GL_ImageCube;
}(GL_ImageBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_ImageCube;

},{"../base/ContextGLTextureFormat":"awayjs-stagegl/lib/base/ContextGLTextureFormat","../image/GL_ImageBase":"awayjs-stagegl/lib/image/GL_ImageBase"}],"awayjs-stagegl/lib/image/GL_RenderImage2D":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_Image2D_1 = require("../image/GL_Image2D");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_RenderImage2D = (function (_super) {
    __extends(GL_RenderImage2D, _super);
    function GL_RenderImage2D() {
        _super.apply(this, arguments);
    }
    GL_RenderImage2D.prototype.activate = function (index, mipmap) {
        _super.prototype.activate.call(this, index, false);
        //TODO: allow automatic mipmap generation
    };
    return GL_RenderImage2D;
}(GL_Image2D_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_RenderImage2D;

},{"../image/GL_Image2D":"awayjs-stagegl/lib/image/GL_Image2D"}],"awayjs-stagegl/lib/image/GL_RenderImageCube":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_ImageCube_1 = require("../image/GL_ImageCube");
/**
 *
 * @class away.pool.ImageObjectBase
 */
var GL_RenderImageCube = (function (_super) {
    __extends(GL_RenderImageCube, _super);
    function GL_RenderImageCube() {
        _super.apply(this, arguments);
    }
    GL_RenderImageCube.prototype.activate = function (index, mipmap) {
        _super.prototype.activate.call(this, index, false);
        //TODO: allow automatic mipmap generation
    };
    return GL_RenderImageCube;
}(GL_ImageCube_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_RenderImageCube;

},{"../image/GL_ImageCube":"awayjs-stagegl/lib/image/GL_ImageCube"}],"awayjs-stagegl/lib/image/GL_Sampler2D":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_SamplerBase_1 = require("../image/GL_SamplerBase");
/**
 *
 * @class away.pool.GL_SamplerBase
 */
var GL_Sampler2D = (function (_super) {
    __extends(GL_Sampler2D, _super);
    function GL_Sampler2D(sampler, stage) {
        _super.call(this, sampler, stage);
        this._sampler = sampler;
    }
    GL_Sampler2D.prototype.activate = function (index) {
        this._stage.setSamplerState(index, this._sampler.repeat, this._sampler.smooth, this._sampler.mipmap);
    };
    return GL_Sampler2D;
}(GL_SamplerBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_Sampler2D;

},{"../image/GL_SamplerBase":"awayjs-stagegl/lib/image/GL_SamplerBase"}],"awayjs-stagegl/lib/image/GL_SamplerBase":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractMethodError_1 = require("awayjs-core/lib/errors/AbstractMethodError");
var AbstractionBase_1 = require("awayjs-core/lib/library/AbstractionBase");
/**
 *
 * @class away.pool.GL_SamplerBase
 */
var GL_SamplerBase = (function (_super) {
    __extends(GL_SamplerBase, _super);
    function GL_SamplerBase(asset, stage) {
        _super.call(this, asset, stage);
        this._stage = stage;
    }
    GL_SamplerBase.prototype.activate = function (index) {
        throw new AbstractMethodError_1.default();
    };
    return GL_SamplerBase;
}(AbstractionBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_SamplerBase;

},{"awayjs-core/lib/errors/AbstractMethodError":undefined,"awayjs-core/lib/library/AbstractionBase":undefined}],"awayjs-stagegl/lib/image/GL_SamplerCube":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GL_SamplerBase_1 = require("../image/GL_SamplerBase");
/**
 *
 * @class away.pool.GL_SamplerBase
 */
var GL_SamplerCube = (function (_super) {
    __extends(GL_SamplerCube, _super);
    function GL_SamplerCube(sampler, stage) {
        _super.call(this, sampler, stage);
        this._sampler = sampler;
    }
    GL_SamplerCube.prototype.activate = function (index) {
        this._stage.setSamplerState(index, false, this._sampler.smooth, this._sampler.mipmap);
    };
    return GL_SamplerCube;
}(GL_SamplerBase_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GL_SamplerCube;

},{"../image/GL_SamplerBase":"awayjs-stagegl/lib/image/GL_SamplerBase"}],"awayjs-stagegl/lib/image/ProgramDataPool":[function(require,module,exports){
"use strict";
var ProgramData_1 = require("../image/ProgramData");
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
        return this._pool[key] || (this._pool[key] = new ProgramData_1.default(this, this._stage, vertexString, fragmentString));
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramDataPool;

},{"../image/ProgramData":"awayjs-stagegl/lib/image/ProgramData"}],"awayjs-stagegl/lib/image/ProgramData":[function(require,module,exports){
"use strict";
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
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgramData;

},{}],"awayjs-stagegl/lib/image":[function(require,module,exports){
"use strict";
var GL_BitmapImage2D_1 = require("./image/GL_BitmapImage2D");
exports.GL_BitmapImage2D = GL_BitmapImage2D_1.default;
var GL_BitmapImageCube_1 = require("./image/GL_BitmapImageCube");
exports.GL_BitmapImageCube = GL_BitmapImageCube_1.default;
var GL_Image2D_1 = require("./image/GL_Image2D");
exports.GL_Image2D = GL_Image2D_1.default;
var GL_ImageBase_1 = require("./image/GL_ImageBase");
exports.GL_ImageBase = GL_ImageBase_1.default;
var GL_ImageCube_1 = require("./image/GL_ImageCube");
exports.GL_ImageCube = GL_ImageCube_1.default;
var GL_RenderImage2D_1 = require("./image/GL_RenderImage2D");
exports.GL_RenderImage2D = GL_RenderImage2D_1.default;
var GL_RenderImageCube_1 = require("./image/GL_RenderImageCube");
exports.GL_RenderImageCube = GL_RenderImageCube_1.default;
var GL_Sampler2D_1 = require("./image/GL_Sampler2D");
exports.GL_Sampler2D = GL_Sampler2D_1.default;
var GL_SamplerBase_1 = require("./image/GL_SamplerBase");
exports.GL_SamplerBase = GL_SamplerBase_1.default;
var GL_SamplerCube_1 = require("./image/GL_SamplerCube");
exports.GL_SamplerCube = GL_SamplerCube_1.default;
var ProgramData_1 = require("./image/ProgramData");
exports.ProgramData = ProgramData_1.default;
var ProgramDataPool_1 = require("./image/ProgramDataPool");
exports.ProgramDataPool = ProgramDataPool_1.default;

},{"./image/GL_BitmapImage2D":"awayjs-stagegl/lib/image/GL_BitmapImage2D","./image/GL_BitmapImageCube":"awayjs-stagegl/lib/image/GL_BitmapImageCube","./image/GL_Image2D":"awayjs-stagegl/lib/image/GL_Image2D","./image/GL_ImageBase":"awayjs-stagegl/lib/image/GL_ImageBase","./image/GL_ImageCube":"awayjs-stagegl/lib/image/GL_ImageCube","./image/GL_RenderImage2D":"awayjs-stagegl/lib/image/GL_RenderImage2D","./image/GL_RenderImageCube":"awayjs-stagegl/lib/image/GL_RenderImageCube","./image/GL_Sampler2D":"awayjs-stagegl/lib/image/GL_Sampler2D","./image/GL_SamplerBase":"awayjs-stagegl/lib/image/GL_SamplerBase","./image/GL_SamplerCube":"awayjs-stagegl/lib/image/GL_SamplerCube","./image/ProgramData":"awayjs-stagegl/lib/image/ProgramData","./image/ProgramDataPool":"awayjs-stagegl/lib/image/ProgramDataPool"}],"awayjs-stagegl/lib/library/GL_IAssetClass":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/library":[function(require,module,exports){
"use strict";

},{}],"awayjs-stagegl/lib/managers/StageManager":[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("awayjs-core/lib/events/EventDispatcher");
var ArgumentError_1 = require("awayjs-core/lib/errors/ArgumentError");
var Stage_1 = require("../base/Stage");
var StageEvent_1 = require("../events/StageEvent");
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
            throw new ArgumentError_1.default("Index is out of bounds [0.." + StageManager.STAGE_MAX_QUANTITY + "]");
        if (!this._stages[index]) {
            StageManager._numStages++;
            if (document) {
                var canvas = document.createElement("canvas");
                canvas.id = "stage" + index;
                document.body.appendChild(canvas);
            }
            var stage = this._stages[index] = new Stage_1.default(canvas, index, this, forceSoftware, profile);
            stage.addEventListener(StageEvent_1.default.CONTEXT_CREATED, this._onContextCreatedDelegate);
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
        stage.removeEventListener(StageEvent_1.default.CONTEXT_CREATED, this._onContextCreatedDelegate);
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
}(EventDispatcher_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StageManager;

},{"../base/Stage":"awayjs-stagegl/lib/base/Stage","../events/StageEvent":"awayjs-stagegl/lib/events/StageEvent","awayjs-core/lib/errors/ArgumentError":undefined,"awayjs-core/lib/events/EventDispatcher":undefined}],"awayjs-stagegl/lib/managers":[function(require,module,exports){
"use strict";
var StageManager_1 = require("./managers/StageManager");
exports.StageManager = StageManager_1.default;

},{"./managers/StageManager":"awayjs-stagegl/lib/managers/StageManager"}]},{},[1])
//# sourceMappingURL=awayjs-stagegl.js.map
