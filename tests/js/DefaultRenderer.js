///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
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
    aglsl.Sampler = Sampler;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var Token = (function () {
        function Token() {
            this.dest = new aglsl.Destination();
            this.opcode = 0;
            this.a = new aglsl.Destination();
            this.b = new aglsl.Destination();
        }
        return Token;
    })();
    aglsl.Token = Token;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var Header = (function () {
        function Header() {
            this.progid = 0;
            this.version = 0;
            this.type = "";
        }
        return Header;
    })();
    aglsl.Header = Header;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
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
    aglsl.OpLUT = OpLUT;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
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
            this.header = new aglsl.Header();
        }
        return Description;
    })();
    aglsl.Description = Description;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var Destination = (function () {
        function Destination() {
            this.mask = 0;
            this.regnum = 0;
            this.regtype = 0;
            this.dim = 0;
        }
        return Destination;
    })();
    aglsl.Destination = Destination;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var Mapping = (function () {
        function Mapping() {
        }
        Mapping.agal2glsllut = [
            new aglsl.OpLUT("%dest = %cast(%a);\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(%a + %b);\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(%a - %b);\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(%a * %b);\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(%a / %b);\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(1.0) / %a;\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(min(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(max(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(fract(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(sqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(inversesqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(pow(abs(%a),%b));\n", 0, true, true, true, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(log2(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(exp2(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(normalize(vec3( %a ) ));\n", 0, true, true, false, null, null, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(sin(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(cos(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(cross(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(abs(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(%a * -1.0);\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(clamp(%a,0.0,1.0));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", null, true, true, true, 3, 3, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 4, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 3, true, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dFdx(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(dFdx(%a));\n", 0, true, true, false, null, null, null, null, null, null),
            new aglsl.OpLUT("if (float(%a)==float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new aglsl.OpLUT("if (float(%a)!=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new aglsl.OpLUT("if (float(%a)>=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new aglsl.OpLUT("if (float(%a)<float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new aglsl.OpLUT("} else {;\n", 0, false, false, false, null, null, null, null, null, null), new aglsl.OpLUT("};\n", 0, false, false, false, null, null, null, null, null, null), new aglsl.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new aglsl.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new aglsl.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new aglsl.OpLUT(null, null, null, null, false, null, null, null, null, null, null),
            new aglsl.OpLUT("%dest = %cast(texture%texdimLod(%b,%texsize(%a)).%dm);\n", null, true, true, true, null, null, null, null, true, null), new aglsl.OpLUT("if ( float(%a)<0.0 ) discard;\n", null, false, true, false, null, null, null, true, null, null), new aglsl.OpLUT("%dest = %cast(texture%texdim(%b,%texsize(%a)%lod).%dm);\n", null, true, true, true, null, null, true, null, true, true), new aglsl.OpLUT("%dest = %cast(greaterThanEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new aglsl.OpLUT("%dest = %cast(lessThan(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new aglsl.OpLUT("%dest = %cast(sign(%a));\n", 0, true, true, false, null, null, null, null, null, null), new aglsl.OpLUT("%dest = %cast(equal(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new aglsl.OpLUT("%dest = %cast(notEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null)
        ];
        return Mapping;
    })();
    aglsl.Mapping = Mapping;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var Opcode = (function () {
            function Opcode(dest, aformat, asize, bformat, bsize, opcode, simple, horizontal, fragonly, matrix) {
                this.a = new aglsl.assembler.FS();
                this.b = new aglsl.assembler.FS();
                this.flags = new aglsl.assembler.Flags();

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
        assembler.Opcode = Opcode;

        var FS = (function () {
            function FS() {
            }
            return FS;
        })();
        assembler.FS = FS;

        var Flags = (function () {
            function Flags() {
            }
            return Flags;
        })();
        assembler.Flags = Flags;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var OpcodeMap = (function () {
            function OpcodeMap() {
            }
            Object.defineProperty(OpcodeMap, "map", {
                get: function () {
                    if (!OpcodeMap._map) {
                        OpcodeMap._map = new Array();
                        OpcodeMap._map['mov'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x00, true, null, null, null);
                        OpcodeMap._map['add'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x01, true, null, null, null);
                        OpcodeMap._map['sub'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x02, true, null, null, null);
                        OpcodeMap._map['mul'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x03, true, null, null, null);
                        OpcodeMap._map['div'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x04, true, null, null, null);
                        OpcodeMap._map['rcp'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x05, true, null, null, null);
                        OpcodeMap._map['min'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x06, true, null, null, null);
                        OpcodeMap._map['max'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x07, true, null, null, null);
                        OpcodeMap._map['frc'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x08, true, null, null, null);
                        OpcodeMap._map['sqt'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x09, true, null, null, null);
                        OpcodeMap._map['rsq'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x0a, true, null, null, null);
                        OpcodeMap._map['pow'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x0b, true, null, null, null);
                        OpcodeMap._map['log'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x0c, true, null, null, null);
                        OpcodeMap._map['exp'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x0d, true, null, null, null);
                        OpcodeMap._map['nrm'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x0e, true, null, null, null);
                        OpcodeMap._map['sin'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x0f, true, null, null, null);
                        OpcodeMap._map['cos'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x10, true, null, null, null);
                        OpcodeMap._map['crs'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x11, true, true, null, null);
                        OpcodeMap._map['dp3'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x12, true, true, null, null);
                        OpcodeMap._map['dp4'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x13, true, true, null, null);
                        OpcodeMap._map['abs'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x14, true, null, null, null);
                        OpcodeMap._map['neg'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x15, true, null, null, null);
                        OpcodeMap._map['sat'] = new aglsl.assembler.Opcode("vector", "vector", 4, "none", 0, 0x16, true, null, null, null);

                        OpcodeMap._map['ted'] = new aglsl.assembler.Opcode("vector", "vector", 4, "sampler", 1, 0x26, true, null, true, null);
                        OpcodeMap._map['kil'] = new aglsl.assembler.Opcode("none", "scalar", 1, "none", 0, 0x27, true, null, true, null);
                        OpcodeMap._map['tex'] = new aglsl.assembler.Opcode("vector", "vector", 4, "sampler", 1, 0x28, true, null, true, null);

                        OpcodeMap._map['m33'] = new aglsl.assembler.Opcode("vector", "matrix", 3, "vector", 3, 0x17, true, null, null, true);
                        OpcodeMap._map['m44'] = new aglsl.assembler.Opcode("vector", "matrix", 4, "vector", 4, 0x18, true, null, null, true);
                        OpcodeMap._map['m43'] = new aglsl.assembler.Opcode("vector", "matrix", 3, "vector", 4, 0x19, true, null, null, true);

                        OpcodeMap._map['sge'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x29, true, null, null, null);
                        OpcodeMap._map['slt'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x2a, true, null, null, null);
                        OpcodeMap._map['sgn'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x2b, true, null, null, null);
                        OpcodeMap._map['seq'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x2c, true, null, null, null);
                        OpcodeMap._map['sne'] = new aglsl.assembler.Opcode("vector", "vector", 4, "vector", 4, 0x2d, true, null, null, null);
                    }

                    return OpcodeMap._map;
                },
                enumerable: true,
                configurable: true
            });
            return OpcodeMap;
        })();
        assembler.OpcodeMap = OpcodeMap;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var Part = (function () {
            function Part(name, version) {
                if (typeof name === "undefined") { name = null; }
                if (typeof version === "undefined") { version = null; }
                this.name = "";
                this.version = 0;
                this.name = name;
                this.version = version;
                this.data = new away.utils.ByteArray();
            }
            return Part;
        })();
        assembler.Part = Part;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var Reg = (function () {
            function Reg(code, desc) {
                this.code = code;
                this.desc = desc;
            }
            return Reg;
        })();
        assembler.Reg = Reg;

        var RegMap = (function () {
            /*
            public static va:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x00, "vertex attribute" );
            public static fc:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x01, "fragment constant" );
            public static vc:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x01, "vertex constant" );
            public static ft:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x02, "fragment temporary" );
            public static vt:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x02, "vertex temporary" );
            public static vo:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x03, "vertex output" );
            public static op:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x03, "vertex output" );
            public static fd:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x03, "fragment depth output" );
            public static fo:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x03, "fragment output" );
            public static oc:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x03, "fragment output" );
            public static v: aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x04, "varying" );
            public static vi:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x04, "varying output" );
            public static fi:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x04, "varying input" );
            public static fs:aglsl.assembler.Reg = new aglsl.assembler.Reg( 0x05, "sampler" );
            */
            function RegMap() {
            }
            Object.defineProperty(RegMap, "map", {
                get: function () {
                    if (!RegMap._map) {
                        RegMap._map = new Array();
                        RegMap._map['va'] = new aglsl.assembler.Reg(0x00, "vertex attribute");
                        RegMap._map['fc'] = new aglsl.assembler.Reg(0x01, "fragment constant");
                        RegMap._map['vc'] = new aglsl.assembler.Reg(0x01, "vertex constant");
                        RegMap._map['ft'] = new aglsl.assembler.Reg(0x02, "fragment temporary");
                        RegMap._map['vt'] = new aglsl.assembler.Reg(0x02, "vertex temporary");
                        RegMap._map['vo'] = new aglsl.assembler.Reg(0x03, "vertex output");
                        RegMap._map['op'] = new aglsl.assembler.Reg(0x03, "vertex output");
                        RegMap._map['fd'] = new aglsl.assembler.Reg(0x03, "fragment depth output");
                        RegMap._map['fo'] = new aglsl.assembler.Reg(0x03, "fragment output");
                        RegMap._map['oc'] = new aglsl.assembler.Reg(0x03, "fragment output");
                        RegMap._map['v'] = new aglsl.assembler.Reg(0x04, "varying");
                        RegMap._map['vi'] = new aglsl.assembler.Reg(0x04, "varying output");
                        RegMap._map['fi'] = new aglsl.assembler.Reg(0x04, "varying input");
                        RegMap._map['fs'] = new aglsl.assembler.Reg(0x05, "sampler");
                    }

                    return RegMap._map;
                },
                enumerable: true,
                configurable: true
            });
            return RegMap;
        })();
        assembler.RegMap = RegMap;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var Sampler = (function () {
            function Sampler(shift, mask, value) {
                this.shift = shift;
                this.mask = mask;
                this.value = value;
            }
            return Sampler;
        })();
        assembler.Sampler = Sampler;

        var SamplerMap = (function () {
            /*
            public static map =     [ new aglsl.assembler.Sampler( 8, 0xf, 0 ),
            new aglsl.assembler.Sampler( 8, 0xf, 5 ),
            new aglsl.assembler.Sampler( 8, 0xf, 4 ),
            new aglsl.assembler.Sampler( 8, 0xf, 1 ),
            new aglsl.assembler.Sampler( 8, 0xf, 2 ),
            new aglsl.assembler.Sampler( 8, 0xf, 1 ),
            new aglsl.assembler.Sampler( 8, 0xf, 2 ),
            
            // dimension
            new aglsl.assembler.Sampler( 12, 0xf, 0 ),
            new aglsl.assembler.Sampler( 12, 0xf, 1 ),
            new aglsl.assembler.Sampler( 12, 0xf, 2 ),
            
            // special
            new aglsl.assembler.Sampler( 16, 1, 1 ),
            new aglsl.assembler.Sampler( 16, 4, 4 ),
            
            // repeat
            new aglsl.assembler.Sampler( 20, 0xf, 0 ),
            new aglsl.assembler.Sampler( 20, 0xf, 1 ),
            new aglsl.assembler.Sampler( 20, 0xf, 1 ),
            
            // mip
            new aglsl.assembler.Sampler( 24, 0xf, 0 ),
            new aglsl.assembler.Sampler( 24, 0xf, 0 ),
            new aglsl.assembler.Sampler( 24, 0xf, 1 ),
            new aglsl.assembler.Sampler( 24, 0xf, 2 ),
            
            // filter
            new aglsl.assembler.Sampler( 28, 0xf, 0 ),
            new aglsl.assembler.Sampler( 28, 0xf, 1 ) ]
            */
            /*
            public static rgba: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 0 );
            public static rg: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 5 );
            public static r: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 4 );
            public static compressed: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 1 );
            public static compressed_alpha: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 2 );
            public static dxt1: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 1 );
            public static dxt5: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 8, 0xf, 2 );
            
            // dimension
            public static sampler2d: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 12, 0xf, 0 );
            public static cube: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 12, 0xf, 1 );
            public static sampler3d: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 12, 0xf, 2 );
            
            // special
            public static centroid: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 16, 1, 1 );
            public static ignoresampler: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 16, 4, 4 );
            
            // repeat
            public static clamp: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 20, 0xf, 0 );
            public static repeat: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 20, 0xf, 1 );
            public static wrap: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 20, 0xf, 1 );
            
            // mip
            public static nomip: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 24, 0xf, 0 );
            public static mipnone: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 24, 0xf, 0 );
            public static mipnearest: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 24, 0xf, 1 );
            public static miplinear: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 24, 0xf, 2 );
            
            // filter
            public static nearest: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 28, 0xf, 0 );
            public static linear: aglsl.assembler.Sampler = new aglsl.assembler.Sampler( 28, 0xf, 1 );
            */
            function SamplerMap() {
            }
            Object.defineProperty(SamplerMap, "map", {
                get: function () {
                    if (!SamplerMap._map) {
                        SamplerMap._map = new Array();
                        SamplerMap._map['rgba'] = new aglsl.assembler.Sampler(8, 0xf, 0);
                        SamplerMap._map['rg'] = new aglsl.assembler.Sampler(8, 0xf, 5);
                        SamplerMap._map['r'] = new aglsl.assembler.Sampler(8, 0xf, 4);
                        SamplerMap._map['compressed'] = new aglsl.assembler.Sampler(8, 0xf, 1);
                        SamplerMap._map['compressed_alpha'] = new aglsl.assembler.Sampler(8, 0xf, 2);
                        SamplerMap._map['dxt1'] = new aglsl.assembler.Sampler(8, 0xf, 1);
                        SamplerMap._map['dxt5'] = new aglsl.assembler.Sampler(8, 0xf, 2);

                        // dimension
                        SamplerMap._map['2d'] = new aglsl.assembler.Sampler(12, 0xf, 0);
                        SamplerMap._map['cube'] = new aglsl.assembler.Sampler(12, 0xf, 1);
                        SamplerMap._map['3d'] = new aglsl.assembler.Sampler(12, 0xf, 2);

                        // special
                        SamplerMap._map['centroid'] = new aglsl.assembler.Sampler(16, 1, 1);
                        SamplerMap._map['ignoresampler'] = new aglsl.assembler.Sampler(16, 4, 4);

                        // repeat
                        SamplerMap._map['clamp'] = new aglsl.assembler.Sampler(20, 0xf, 0);
                        SamplerMap._map['repeat'] = new aglsl.assembler.Sampler(20, 0xf, 1);
                        SamplerMap._map['wrap'] = new aglsl.assembler.Sampler(20, 0xf, 1);

                        // mip
                        SamplerMap._map['nomip'] = new aglsl.assembler.Sampler(24, 0xf, 0);
                        SamplerMap._map['mipnone'] = new aglsl.assembler.Sampler(24, 0xf, 0);
                        SamplerMap._map['mipnearest'] = new aglsl.assembler.Sampler(24, 0xf, 1);
                        SamplerMap._map['miplinear'] = new aglsl.assembler.Sampler(24, 0xf, 2);

                        // filter
                        SamplerMap._map['nearest'] = new aglsl.assembler.Sampler(28, 0xf, 0);
                        SamplerMap._map['linear'] = new aglsl.assembler.Sampler(28, 0xf, 1);
                    }

                    return SamplerMap._map;
                },
                enumerable: true,
                configurable: true
            });
            return SamplerMap;
        })();
        assembler.SamplerMap = SamplerMap;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    (function (assembler) {
        var AGALMiniAssembler = (function () {
            function AGALMiniAssembler() {
                this.r = {};
                this.cur = new aglsl.assembler.Part();
            }
            AGALMiniAssembler.prototype.assemble = function (source, ext_part, ext_version) {
                if (typeof ext_part === "undefined") { ext_part = null; }
                if (typeof ext_version === "undefined") { ext_version = null; }
                if (!ext_version) {
                    ext_version = 1;
                }

                if (ext_part) {
                    this.addHeader(ext_part, ext_version);
                }

                var lines = source.replace(/[\f\n\r\v]+/g, "\n").split("\n");

                for (var i in lines) {
                    this.processLine(lines[i], i);
                }

                return this.r;
            };

            AGALMiniAssembler.prototype.processLine = function (line, linenr) {
                var startcomment = line.search("//");
                if (startcomment != -1) {
                    line = line.slice(0, startcomment);
                }
                line = line.replace(/^\s+|\s+$/g, ""); // remove outer space
                if (!(line.length > 0)) {
                    return;
                }
                var optsi = line.search(/<.*>/g);
                var opts = null;
                if (optsi != -1) {
                    opts = line.slice(optsi).match(/([\w\.\-\+]+)/gi);
                    line = line.slice(0, optsi);
                }

                // get opcode/command
                var tokens = line.match(/([\w\.\+\[\]]+)/gi);
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
                        var op = assembler.OpcodeMap.map[tokens[0]];
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
                        } else {
                            this.emitZeroDword(this.cur);
                        }

                        if (op.a && op.a.format != "none") {
                            if (!this.emitSource(this.cur, tokens[ti++], op.a))
                                throw "Bad source register " + tokens[ti - 1] + " " + linenr + ": " + line;
                        } else {
                            this.emitZeroQword(this.cur);
                        }

                        if (op.b && op.b.format != "none") {
                            if (op.b.format == "sampler") {
                                if (!this.emitSampler(this.cur, tokens[ti++], op.b, opts)) {
                                    throw "Bad sampler register " + tokens[ti - 1] + " " + linenr + ": " + line;
                                }
                            } else {
                                if (!this.emitSource(this.cur, tokens[ti++], op.b)) {
                                    throw "Bad source register " + tokens[ti - 1] + " " + linenr + ": " + line;
                                }
                            }
                        } else {
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
                //console.log( 'aglsl.assembler.AGALMiniAssembler' , 'emitDest' , 'RegMap.map' , RegMap.map);
                var reg = token.match(/([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i);

                // console.log( 'aglsl.assembler.AGALMiniAssembler' , 'emitDest' , 'reg' , reg , reg[1] , RegMap.map[reg[1]] );
                // console.log( 'aglsl.assembler.AGALMiniAssembler' , 'emitDest' , 'RegMap.map[reg[1]]' , RegMap.map[reg[1]] , 'bool' , !RegMap.map[reg[1]] ) ;
                if (!assembler.RegMap.map[reg[1]])
                    return false;
                var em = { num: reg[2] ? reg[2] : 0, code: assembler.RegMap.map[reg[1]].code, mask: this.stringToMask(reg[3]) };
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
                } else {
                    sw |= (sw & 3) << 2;
                }

                if (s.length > 3) {
                    sw |= chartoindex[s.charAt(3)] << 4;
                } else {
                    sw |= (sw & (3 << 2)) << 2;
                }

                if (s.length > 4) {
                    sw |= chartoindex[s.charAt(4)] << 6;
                } else {
                    sw |= (sw & (3 << 4)) << 2;
                }

                return sw;
            };

            AGALMiniAssembler.prototype.emitSampler = function (pr, token, opsrc, opts) {
                var reg = token.match(/fs(\d*)/i);
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
                    var o = assembler.SamplerMap.map[opts[i].toLowerCase()];

                    //console.log( 'AGALMiniAssembler' , 'emitSampler' , 'SampleMap opt:' , o , '<-------- WATCH FOR THIS');
                    if (o) {
                        if (((sampleroptset >> o.shift) & o.mask) != 0) {
                            console.log("Warning, duplicate sampler option");
                        }
                        sampleroptset |= o.mask << o.shift;
                        samplerbits &= ~(o.mask << o.shift);
                        samplerbits |= o.value << o.shift;
                    } else {
                        console.log("Warning, unknown sampler option: ", opts[i]);
                        // todo bias
                    }
                }
                pr.data.writeUnsignedInt(samplerbits);
                return true;
            };

            AGALMiniAssembler.prototype.emitSource = function (pr, token, opsrc) {
                var indexed = token.match(/vc\[(v[tcai])(\d+)\.([xyzw])([\+\-]\d+)?\](\.[xyzw]{1,4})?/i);
                var reg;
                if (indexed) {
                    if (!assembler.RegMap.map[indexed[1]]) {
                        return false;
                    }
                    var selindex = { x: 0, y: 1, z: 2, w: 3 };
                    var em = { num: indexed[2] | 0, code: assembler.RegMap.map[indexed[1]].code, swizzle: this.stringToSwizzle(indexed[5]), select: selindex[indexed[3]], offset: indexed[4] | 0 };
                    pr.data.writeUnsignedShort(em.num);
                    pr.data.writeByte(em.offset);
                    pr.data.writeUnsignedByte(em.swizzle);
                    pr.data.writeUnsignedByte(0x1); // constant reg
                    pr.data.writeUnsignedByte(em.code);
                    pr.data.writeUnsignedByte(em.select);
                    pr.data.writeUnsignedByte(1 << 7);
                } else {
                    reg = token.match(/([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i); // g1: regname, g2:regnum, g3:swizzle
                    if (!assembler.RegMap.map[reg[1]]) {
                        return false;
                    }
                    var em = { num: reg[2] | 0, code: assembler.RegMap.map[reg[1]].code, swizzle: this.stringToSwizzle(reg[3]) };
                    pr.data.writeUnsignedShort(em.num);
                    pr.data.writeUnsignedByte(0);
                    pr.data.writeUnsignedByte(em.swizzle);
                    pr.data.writeUnsignedByte(em.code);
                    pr.data.writeUnsignedByte(0);
                    pr.data.writeUnsignedByte(0);
                    pr.data.writeUnsignedByte(0);
                    //console.log ( "  Emit source: ", em, pr.data.length );
                }
                return true;
            };

            AGALMiniAssembler.prototype.addHeader = function (partname, version) {
                if (!version) {
                    version = 1;
                }
                if (this.r[partname] == undefined) {
                    this.r[partname] = new aglsl.assembler.Part(partname, version);
                    this.emitHeader(this.r[partname]);
                } else if (this.r[partname].version != version) {
                    throw "Multiple versions for part " + partname;
                }
                this.cur = this.r[partname];
            };
            return AGALMiniAssembler;
        })();
        assembler.AGALMiniAssembler = AGALMiniAssembler;
    })(aglsl.assembler || (aglsl.assembler = {}));
    var assembler = aglsl.assembler;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var AGALTokenizer = (function () {
        function AGALTokenizer() {
        }
        AGALTokenizer.prototype.decribeAGALByteArray = function (bytes) {
            var header = new aglsl.Header();

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

            var desc = new aglsl.Description();
            var tokens = [];
            while (bytes.position < bytes.length) {
                var token = new aglsl.Token();

                token.opcode = bytes.readUnsignedInt();
                var lutentry = aglsl.Mapping.agal2glsllut[token.opcode];
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
                } else {
                    token.dest = null;
                    bytes.readUnsignedInt();
                }
                if (lutentry.a) {
                    this.readReg(token.a, 1, desc, bytes);
                } else {
                    token.a = null;
                    bytes.readUnsignedInt();
                    bytes.readUnsignedInt();
                }
                if (lutentry.b) {
                    this.readReg(token.b, lutentry.matrixheight | 0, desc, bytes);
                } else {
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
            } else {
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
    aglsl.AGALTokenizer = AGALTokenizer;
})(aglsl || (aglsl = {}));
///<reference path="../away/_definitions.ts" />
var aglsl;
(function (aglsl) {
    var AGLSLParser = (function () {
        function AGLSLParser() {
        }
        AGLSLParser.prototype.parse = function (desc) {
            var header = "";
            var body = "";

            header += "precision highp float;\n";
            var tag = desc.header.type[0];

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
            } else {
                header += "uniform vec4 " + tag + "carrr[" + away.stagegl.ContextStage3D.maxvertexconstants + "];\n"; // use max const count instead
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
            // start body of code
            body += "void main() {\n";

            for (var i = 0; i < desc.tokens.length; i++) {
                var lutentry = aglsl.Mapping.agal2glsllut[desc.tokens[i].opcode];
                if (!lutentry) {
                    throw "Opcode not valid or not implemented yet: ";
                    /*+token.opcode;*/
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
                        } else {
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
                            } else {
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
                    } else {
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
            } else {
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
    aglsl.AGLSLParser = AGLSLParser;
})(aglsl || (aglsl = {}));
///<reference path="../_definitions.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var away;
(function (away) {
    (function (events) {
        /**
        * Dispatched to notify changes in an animator's state.
        */
        var AnimatorEvent = (function (_super) {
            __extends(AnimatorEvent, _super);
            /**
            * Create a new <code>AnimatorEvent</code> object.
            *
            * @param type The event type.
            * @param animator The animator object that is the subject of this event.
            */
            function AnimatorEvent(type, animator) {
                _super.call(this, type);
                this._animator = animator;
            }
            Object.defineProperty(AnimatorEvent.prototype, "animator", {
                get: function () {
                    return this._animator;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Clones the event.
            *
            * @return An exact duplicate of the current event object.
            */
            AnimatorEvent.prototype.clone = function () {
                return new AnimatorEvent(this.type, this._animator);
            };
            AnimatorEvent.START = "start";

            AnimatorEvent.STOP = "stop";

            AnimatorEvent.CYCLE_COMPLETE = "cycle_complete";
            return AnimatorEvent;
        })(events.Event);
        events.AnimatorEvent = AnimatorEvent;
    })(away.events || (away.events = {}));
    var events = away.events;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../_definitions.ts"/>
    /**
    * @module away.events
    */
    (function (events) {
        //import flash.events.Event;
        var ShadingMethodEvent = (function (_super) {
            __extends(ShadingMethodEvent, _super);
            function ShadingMethodEvent(type) {
                _super.call(this, type);
            }
            ShadingMethodEvent.SHADER_INVALIDATED = "ShaderInvalidated";
            return ShadingMethodEvent;
        })(away.events.Event);
        events.ShadingMethodEvent = ShadingMethodEvent;
    })(away.events || (away.events = {}));
    var events = away.events;
})(away || (away = {}));
var away;
(function (away) {
    (function (errors) {
        var AnimationSetError = (function (_super) {
            __extends(AnimationSetError, _super);
            function AnimationSetError(message) {
                _super.call(this, message);
            }
            return AnimationSetError;
        })(errors.Error);
        errors.AnimationSetError = AnimationSetError;
    })(away.errors || (away.errors = {}));
    var errors = away.errors;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (_pool) {
        var SubGeometryEvent = away.events.SubGeometryEvent;

        /**
        * @class away.pool.RenderableListItem
        */
        var RenderableBase = (function () {
            /**
            *
            * @param sourceEntity
            * @param materialOwner
            * @param subGeometry
            * @param animationSubGeometry
            */
            function RenderableBase(pool, sourceEntity, materialOwner, level, indexOffset) {
                if (typeof level === "undefined") { level = 0; }
                if (typeof indexOffset === "undefined") { indexOffset = 0; }
                var _this = this;
                this._geometryDirty = true;
                this._indexDataDirty = true;
                this._vertexData = new Object();
                this._pVertexDataDirty = new Object();
                this._vertexOffset = new Object();
                this._onIndicesUpdatedDelegate = function (event) {
                    return _this._onIndicesUpdated(event);
                };
                this._onVerticesUpdatedDelegate = function (event) {
                    return _this._onVerticesUpdated(event);
                };

                //store a reference to the pool for later disposal
                this._pool = pool;

                //reference to level of overflow
                this._level = level;

                //reference to the offset on indices (if this is an overflow renderable)
                this._indexOffset = indexOffset;

                this.sourceEntity = sourceEntity;
                this.materialOwner = materialOwner;
            }
            Object.defineProperty(RenderableBase.prototype, "overflow", {
                /**
                *
                */
                get: function () {
                    if (this._indexDataDirty)
                        this._updateIndexData();

                    return this._overflow;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RenderableBase.prototype, "numTriangles", {
                /**
                *
                */
                get: function () {
                    return this._numTriangles;
                },
                enumerable: true,
                configurable: true
            });

            /**
            *
            */
            RenderableBase.prototype.getIndexData = function () {
                if (this._indexDataDirty)
                    this._updateIndexData();

                return this._indexData;
            };

            /**
            *
            */
            RenderableBase.prototype.getVertexData = function (dataType) {
                if (this._indexDataDirty)
                    this._updateIndexData();

                if (this._pVertexDataDirty[dataType])
                    this._updateVertexData(dataType);

                return this._vertexData[this._concatenateArrays ? away.base.TriangleSubGeometry.VERTEX_DATA : dataType];
            };

            /**
            *
            */
            RenderableBase.prototype.getVertexOffset = function (dataType) {
                if (this._indexDataDirty)
                    this._updateIndexData();

                if (this._pVertexDataDirty[dataType])
                    this._updateVertexData(dataType);

                return this._vertexOffset[dataType];
            };

            RenderableBase.prototype.dispose = function () {
                this._pool.disposeItem(this.materialOwner);

                this._indexData.dispose();
                this._indexData = null;

                for (var dataType in this._vertexData) {
                    this._vertexData[dataType].dispose();
                    this._vertexData[dataType] = null;
                }

                if (this._overflow) {
                    this._overflow.dispose();
                    this._overflow = null;
                }
            };

            RenderableBase.prototype.invalidateGeometry = function () {
                this._geometryDirty = true;

                //invalidate indices
                if (this._level == 0)
                    this._indexDataDirty = true;

                if (this._overflow)
                    this._overflow.invalidateGeometry();
            };

            /**
            *
            */
            RenderableBase.prototype.invalidateIndexData = function () {
                this._indexDataDirty = true;
            };

            /**
            * //TODO
            *
            * @param dataType
            */
            RenderableBase.prototype.invalidateVertexData = function (dataType) {
                this._pVertexDataDirty[dataType] = true;
            };

            RenderableBase.prototype._pGetSubGeometry = function () {
                throw new away.errors.AbstractMethodError();
            };

            /**
            * //TODO
            *
            * @param subGeometry
            * @param offset
            * @internal
            */
            RenderableBase.prototype._iFillIndexData = function (indexOffset) {
                if (this._geometryDirty)
                    this._updateGeometry();

                this._indexData = away.pool.IndexDataPool.getItem(this._subGeometry, this._level, indexOffset);

                this._numTriangles = this._indexData.data.length / 3;

                indexOffset = this._indexData.offset;

                //check if there is more to split
                if (indexOffset < this._subGeometry.indices.length) {
                    if (!this._overflow)
                        this._overflow = this._pGetOverflowRenderable(this._pool, this.materialOwner, indexOffset, this._level + 1);

                    this._overflow._iFillIndexData(indexOffset);
                } else if (this._overflow) {
                    this._overflow.dispose();
                    this._overflow = null;
                }
            };

            RenderableBase.prototype._pGetOverflowRenderable = function (pool, materialOwner, level, indexOffset) {
                throw new away.errors.AbstractMethodError();
            };

            /**
            * //TODO
            *
            * @private
            */
            RenderableBase.prototype._updateGeometry = function () {
                if (this._subGeometry) {
                    if (this._level == 0)
                        this._subGeometry.removeEventListener(SubGeometryEvent.INDICES_UPDATED, this._onIndicesUpdatedDelegate);
                    this._subGeometry.removeEventListener(SubGeometryEvent.VERTICES_UPDATED, this._onVerticesUpdatedDelegate);
                }

                this._subGeometry = this._pGetSubGeometry();

                this._concatenateArrays = this._subGeometry.concatenateArrays;

                if (this._subGeometry) {
                    if (this._level == 0)
                        this._subGeometry.addEventListener(SubGeometryEvent.INDICES_UPDATED, this._onIndicesUpdatedDelegate);
                    this._subGeometry.addEventListener(SubGeometryEvent.VERTICES_UPDATED, this._onVerticesUpdatedDelegate);
                }

                //dispose
                //			if (this._indexData) {
                //				this._indexData.dispose(); //TODO where is a good place to dispose?
                //				this._indexData = null;
                //			}
                //			for (var dataType in this._vertexData) {
                //				(<away.pool.VertexData> this._vertexData[dataType]).dispose(); //TODO where is a good place to dispose?
                //				this._vertexData[dataType] = null;
                //			}
                this._geometryDirty = false;
                //specific vertex data types have to be invalidated in the specific renderable
            };

            /**
            * //TODO
            *
            * @private
            */
            RenderableBase.prototype._updateIndexData = function () {
                this._iFillIndexData(this._indexOffset);

                this._indexDataDirty = false;
            };

            /**
            * //TODO
            *
            * @param dataType
            * @private
            */
            RenderableBase.prototype._updateVertexData = function (dataType) {
                this._vertexOffset[dataType] = this._subGeometry.getOffset(dataType);

                if (this._subGeometry.concatenateArrays)
                    dataType = away.base.SubGeometryBase.VERTEX_DATA;

                this._vertexData[dataType] = away.pool.VertexDataPool.getItem(this._subGeometry, this.getIndexData(), dataType);

                this._pVertexDataDirty[dataType] = false;
            };

            /**
            * //TODO
            *
            * @param event
            * @private
            */
            RenderableBase.prototype._onIndicesUpdated = function (event) {
                this.invalidateIndexData();
            };

            /**
            * //TODO
            *
            * @param event
            * @private
            */
            RenderableBase.prototype._onVerticesUpdated = function (event) {
                this._concatenateArrays = event.target.concatenateArrays;

                this.invalidateVertexData(event.dataType);
            };
            return RenderableBase;
        })();
        _pool.RenderableBase = RenderableBase;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (_pool) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        /**
        * @class away.pool.RenderableListItem
        */
        var BillboardRenderable = (function (_super) {
            __extends(BillboardRenderable, _super);
            /**
            * //TODO
            *
            * @param pool
            * @param billboard
            */
            function BillboardRenderable(pool, billboard) {
                _super.call(this, pool, billboard, billboard);

                this._billboard = billboard;
            }
            /**
            * //TODO
            *
            * @returns {away.base.TriangleSubGeometry}
            */
            BillboardRenderable.prototype._pGetSubGeometry = function () {
                var material = this._billboard.material;

                var geometry = BillboardRenderable._materialGeometry[material.id];

                if (!geometry) {
                    geometry = BillboardRenderable._materialGeometry[material.id] = new TriangleSubGeometry(true);
                    geometry.autoDeriveNormals = false;
                    geometry.autoDeriveTangents = false;
                    geometry.updateIndices(Array(0, 1, 2, 0, 2, 3));
                    geometry.updatePositions(Array(0, material.height, 0, material.width, material.height, 0, material.width, 0, 0, 0, 0, 0));
                    geometry.updateVertexNormals(Array(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0));
                    geometry.updateVertexTangents(Array(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1));
                    geometry.updateUVs(Array(0, 0, 1, 0, 1, 1, 0, 1));
                } else {
                    geometry.updatePositions(Array(0, material.height, 0, material.width, material.height, 0, material.width, 0, 0, 0, 0, 0));
                }

                this._pVertexDataDirty[TriangleSubGeometry.POSITION_DATA] = true;
                this._pVertexDataDirty[TriangleSubGeometry.NORMAL_DATA] = true;
                this._pVertexDataDirty[TriangleSubGeometry.TANGENT_DATA] = true;
                this._pVertexDataDirty[TriangleSubGeometry.UV_DATA] = true;

                return geometry;
            };
            BillboardRenderable._materialGeometry = new Object();

            BillboardRenderable.id = "billboard";
            return BillboardRenderable;
        })(_pool.RenderableBase);
        _pool.BillboardRenderable = BillboardRenderable;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.base
    */
    (function (pool) {
        /**
        *
        */
        var IndexData = (function () {
            function IndexData(level) {
                this._dataDirty = true;
                this.invalid = new Array(8);
                this.contexts = new Array(8);
                this.buffers = new Array(8);
                this.level = level;
            }
            IndexData.prototype.updateData = function (offset, indices, numVertices) {
                if (this._dataDirty) {
                    this._dataDirty = false;

                    if (indices.length < IndexData.LIMIT_INDICES && numVertices < IndexData.LIMIT_VERTS) {
                        //shortcut for those buffers that fit into the maximum buffer sizes
                        this.indexMappings = null;
                        this.originalIndices = null;
                        this.setData(indices);
                        this.offset = indices.length;
                    } else {
                        var i;
                        var len;
                        var outIndex;
                        var j;
                        var k;
                        var splitIndices = new Array();

                        this.indexMappings = new Array(indices.length);
                        this.originalIndices = new Array();

                        i = this.indexMappings.length;

                        while (i--)
                            this.indexMappings[i] = -1;

                        var originalIndex;
                        var splitIndex;

                        // Loop over all triangles
                        outIndex = 0;
                        len = indices.length;
                        i = offset;
                        k = 0;
                        while (i < len && outIndex + 3 < IndexData.LIMIT_INDICES && k + 3 < IndexData.LIMIT_VERTS) {
                            for (j = 0; j < 3; j++) {
                                originalIndex = indices[i + j];

                                if (this.indexMappings[originalIndex] >= 0) {
                                    splitIndex = this.indexMappings[originalIndex];
                                } else {
                                    // This vertex does not yet exist in the split list and
                                    // needs to be copied from the long list.
                                    splitIndex = k++;
                                    this.indexMappings[originalIndex] = splitIndex;
                                    this.originalIndices.push(originalIndex);
                                }

                                // Store new index, which may have come from the mapping look-up,
                                // or from copying a new set of vertex data from the original vector
                                splitIndices[outIndex + j] = splitIndex;
                            }

                            outIndex += 3;
                            i += 3;
                        }

                        this.setData(splitIndices);
                        this.offset = i;
                    }
                }
            };

            IndexData.prototype.invalidateData = function () {
                this._dataDirty = true;
            };

            IndexData.prototype.dispose = function () {
                for (var i = 0; i < 8; ++i) {
                    if (this.contexts[i]) {
                        this.contexts[i].disposeIndexData(this);
                        this.contexts[i] = null;
                    }
                }
            };

            /**
            * @private
            */
            IndexData.prototype.disposeBuffers = function () {
                for (var i = 0; i < 8; ++i) {
                    if (this.buffers[i]) {
                        this.buffers[i].dispose();
                        this.buffers[i] = null;
                    }
                }
            };

            /**
            * @private
            */
            IndexData.prototype.invalidateBuffers = function () {
                for (var i = 0; i < 8; ++i)
                    this.invalid[i] = true;
            };

            /**
            *
            * @param data
            * @private
            */
            IndexData.prototype.setData = function (data) {
                if (this.data && this.data.length != data.length)
                    this.disposeBuffers();
                else
                    this.invalidateBuffers();

                this.data = data;
            };
            IndexData.LIMIT_VERTS = 0xffff;

            IndexData.LIMIT_INDICES = 0xffffff;
            return IndexData;
        })();
        pool.IndexData = IndexData;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.base
    */
    (function (pool) {
        /**
        *
        */
        var IndexDataPool = (function () {
            function IndexDataPool() {
            }
            IndexDataPool.getItem = function (subGeometry, level, indexOffset) {
                var subGeometryData = (IndexDataPool._pool[subGeometry.id] || (IndexDataPool._pool[subGeometry.id] = new Array()));

                var indexData = subGeometryData[level] || (subGeometryData[level] = new pool.IndexData(level));
                indexData.updateData(indexOffset, subGeometry.indices, subGeometry.numVertices);

                return indexData;
            };

            IndexDataPool.disposeItem = function (id, level) {
                var subGeometryData = this._pool[id];

                subGeometryData[level].dispose();
                subGeometryData[level] = null;
            };

            IndexDataPool.prototype.disposeData = function (id) {
                var subGeometryData = IndexDataPool._pool[id];

                var len = subGeometryData.length;
                for (var i = 0; i < len; i++) {
                    subGeometryData[i].dispose();
                    subGeometryData[i] = null;
                }

                IndexDataPool._pool[id] = null;
            };
            IndexDataPool._pool = new Object();
            return IndexDataPool;
        })();
        pool.IndexDataPool = IndexDataPool;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (_pool) {
        var LineSubGeometry = away.base.LineSubGeometry;

        /**
        * @class away.pool.LineSubMeshRenderable
        */
        var LineSubMeshRenderable = (function (_super) {
            __extends(LineSubMeshRenderable, _super);
            /**
            * //TODO
            *
            * @param pool
            * @param subMesh
            * @param level
            * @param dataOffset
            */
            function LineSubMeshRenderable(pool, subMesh, level, indexOffset) {
                if (typeof level === "undefined") { level = 0; }
                if (typeof indexOffset === "undefined") { indexOffset = 0; }
                _super.call(this, pool, subMesh.parentMesh, subMesh, level, indexOffset);

                this.subMesh = subMesh;
            }
            /**
            * //TODO
            *
            * @returns {base.LineSubGeometry}
            * @protected
            */
            LineSubMeshRenderable.prototype._pGetSubGeometry = function () {
                var subGeometry = this.subMesh.subGeometry;

                this._pVertexDataDirty[LineSubGeometry.START_POSITION_DATA] = true;
                this._pVertexDataDirty[LineSubGeometry.END_POSITION_DATA] = true;

                if (subGeometry.thickness)
                    this._pVertexDataDirty[LineSubGeometry.THICKNESS_DATA] = true;

                if (subGeometry.startColors)
                    this._pVertexDataDirty[LineSubGeometry.COLOR_DATA] = true;

                return subGeometry;
            };

            /**
            * //TODO
            *
            * @param pool
            * @param materialOwner
            * @param level
            * @param indexOffset
            * @returns {away.pool.LineSubMeshRenderable}
            * @private
            */
            LineSubMeshRenderable.prototype._pGetOverflowRenderable = function (pool, materialOwner, level, indexOffset) {
                return new LineSubMeshRenderable(pool, materialOwner, level, indexOffset);
            };
            LineSubMeshRenderable.id = "linesubmesh";
            return LineSubMeshRenderable;
        })(_pool.RenderableBase);
        _pool.LineSubMeshRenderable = LineSubMeshRenderable;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (_pool) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        /**
        * @class away.pool.SkyboxRenderable
        */
        var SkyboxRenderable = (function (_super) {
            __extends(SkyboxRenderable, _super);
            /**
            * //TODO
            *
            * @param pool
            * @param skybox
            */
            function SkyboxRenderable(pool, skybox) {
                _super.call(this, pool, skybox, skybox);
            }
            /**
            * //TODO
            *
            * @returns {away.base.TriangleSubGeometry}
            * @private
            */
            SkyboxRenderable.prototype._pGetSubGeometry = function () {
                var geometry = SkyboxRenderable._geometry;

                if (!geometry) {
                    geometry = SkyboxRenderable._geometry = new TriangleSubGeometry(true);
                    geometry.autoDeriveNormals = false;
                    geometry.autoDeriveTangents = false;
                    geometry.updateIndices(Array(0, 1, 2, 2, 3, 0, 6, 5, 4, 4, 7, 6, 2, 6, 7, 7, 3, 2, 4, 5, 1, 1, 0, 4, 4, 0, 3, 3, 7, 4, 2, 1, 5, 5, 6, 2));
                    geometry.updatePositions(Array(-1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1));
                }

                this._pVertexDataDirty[TriangleSubGeometry.POSITION_DATA] = true;

                return geometry;
            };
            SkyboxRenderable.id = "skybox";
            return SkyboxRenderable;
        })(_pool.RenderableBase);
        _pool.SkyboxRenderable = SkyboxRenderable;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (pool) {
        /**
        *
        * @class away.pool.TextureDataBase
        */
        var TextureData = (function () {
            function TextureData(context, textureProxy) {
                this.context = context;
                this.textureProxy = textureProxy;
            }
            /**
            *
            */
            TextureData.prototype.dispose = function () {
                this.texture.dispose();
                this.texture = null;
            };

            /**
            *
            */
            TextureData.prototype.invalidate = function () {
                this.invalid = true;
            };
            return TextureData;
        })();
        pool.TextureData = TextureData;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (pool) {
        /**
        * @class away.pool.TextureDataPool
        */
        var TextureDataPool = (function () {
            /**
            * //TODO
            *
            * @param textureDataClass
            */
            function TextureDataPool(context) {
                this._pool = new Object();
                this._context = context;
            }
            /**
            * //TODO
            *
            * @param materialOwner
            * @returns ITexture
            */
            TextureDataPool.prototype.getItem = function (textureProxy) {
                return (this._pool[textureProxy.id] || (this._pool[textureProxy.id] = textureProxy._iAddTextureData(new pool.TextureData(this._context, textureProxy))));
            };

            /**
            * //TODO
            *
            * @param materialOwner
            */
            TextureDataPool.prototype.disposeItem = function (textureProxy) {
                textureProxy._iRemoveTextureData(this._pool[textureProxy.id]);

                this._pool[textureProxy.id] = null;
            };
            return TextureDataPool;
        })();
        pool.TextureDataPool = TextureDataPool;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.pool
    */
    (function (_pool) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        /**
        * @class away.pool.TriangleSubMeshRenderable
        */
        var TriangleSubMeshRenderable = (function (_super) {
            __extends(TriangleSubMeshRenderable, _super);
            /**
            * //TODO
            *
            * @param pool
            * @param subMesh
            * @param level
            * @param indexOffset
            */
            function TriangleSubMeshRenderable(pool, subMesh, level, indexOffset) {
                if (typeof level === "undefined") { level = 0; }
                if (typeof indexOffset === "undefined") { indexOffset = 0; }
                _super.call(this, pool, subMesh.parentMesh, subMesh, level, indexOffset);

                this.subMesh = subMesh;
            }
            /**
            *
            * @returns {away.base.SubGeometryBase}
            * @protected
            */
            TriangleSubMeshRenderable.prototype._pGetSubGeometry = function () {
                var subGeometry;

                if (this.subMesh.animator)
                    subGeometry = this.subMesh.animator.getRenderableSubGeometry(this, this.subMesh.subGeometry);
                else
                    subGeometry = this.subMesh.subGeometry;

                this._pVertexDataDirty[TriangleSubGeometry.POSITION_DATA] = true;

                if (subGeometry.vertexNormals)
                    this._pVertexDataDirty[TriangleSubGeometry.NORMAL_DATA] = true;

                if (subGeometry.vertexTangents)
                    this._pVertexDataDirty[TriangleSubGeometry.TANGENT_DATA] = true;

                if (subGeometry.uvs)
                    this._pVertexDataDirty[TriangleSubGeometry.UV_DATA] = true;

                if (subGeometry.secondaryUVs)
                    this._pVertexDataDirty[TriangleSubGeometry.SECONDARY_UV_DATA] = true;

                if (subGeometry.jointIndices)
                    this._pVertexDataDirty[TriangleSubGeometry.JOINT_INDEX_DATA] = true;

                if (subGeometry.jointWeights)
                    this._pVertexDataDirty[TriangleSubGeometry.JOINT_WEIGHT_DATA] = true;

                switch (subGeometry.jointsPerVertex) {
                    case 1:
                        this.JOINT_INDEX_FORMAT = this.JOINT_WEIGHT_FORMAT = away.stagegl.ContextGLVertexBufferFormat.FLOAT_1;
                        break;
                    case 2:
                        this.JOINT_INDEX_FORMAT = this.JOINT_WEIGHT_FORMAT = away.stagegl.ContextGLVertexBufferFormat.FLOAT_2;
                        break;
                    case 3:
                        this.JOINT_INDEX_FORMAT = this.JOINT_WEIGHT_FORMAT = away.stagegl.ContextGLVertexBufferFormat.FLOAT_3;
                        break;
                    case 4:
                        this.JOINT_INDEX_FORMAT = this.JOINT_WEIGHT_FORMAT = away.stagegl.ContextGLVertexBufferFormat.FLOAT_4;
                        break;
                    default:
                }

                return subGeometry;
            };

            /**
            * //TODO
            *
            * @param pool
            * @param materialOwner
            * @param level
            * @param indexOffset
            * @returns {away.pool.TriangleSubMeshRenderable}
            * @protected
            */
            TriangleSubMeshRenderable.prototype._pGetOverflowRenderable = function (pool, materialOwner, level, indexOffset) {
                return new TriangleSubMeshRenderable(pool, materialOwner, level, indexOffset);
            };
            TriangleSubMeshRenderable.id = "trianglesubmesh";
            return TriangleSubMeshRenderable;
        })(_pool.RenderableBase);
        _pool.TriangleSubMeshRenderable = TriangleSubMeshRenderable;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.base
    */
    (function (pool) {
        var SubGeometryBase = away.base.SubGeometryBase;
        var SubGeometryEvent = away.events.SubGeometryEvent;

        /**
        *
        */
        var VertexData = (function () {
            function VertexData(subGeometry, dataType) {
                var _this = this;
                this._dataDirty = true;
                this.invalid = new Array(8);
                this.buffers = new Array(8);
                this.contexts = new Array(8);
                this._subGeometry = subGeometry;
                this._dataType = dataType;

                this._onVerticesUpdatedDelegate = function (event) {
                    return _this._onVerticesUpdated(event);
                };
                this._subGeometry.addEventListener(SubGeometryEvent.VERTICES_UPDATED, this._onVerticesUpdatedDelegate);
            }
            VertexData.prototype.updateData = function (originalIndices, indexMappings) {
                if (typeof originalIndices === "undefined") { originalIndices = null; }
                if (typeof indexMappings === "undefined") { indexMappings = null; }
                if (this._dataDirty) {
                    this._dataDirty = false;

                    this.dataPerVertex = this._subGeometry.getStride(this._dataType);

                    var vertices = this._subGeometry[this._dataType];

                    if (indexMappings == null) {
                        this.setData(vertices);
                    } else {
                        var splitVerts = new Array(originalIndices.length * this.dataPerVertex);
                        var originalIndex;
                        var splitIndex;
                        var i = 0;
                        var j = 0;
                        while (i < originalIndices.length) {
                            originalIndex = originalIndices[i];

                            splitIndex = indexMappings[originalIndex] * this.dataPerVertex;
                            originalIndex *= this.dataPerVertex;

                            for (j = 0; j < this.dataPerVertex; j++)
                                splitVerts[splitIndex + j] = vertices[originalIndex + j];

                            i++;
                        }

                        this.setData(splitVerts);
                    }
                }
            };

            VertexData.prototype.dispose = function () {
                for (var i = 0; i < 8; ++i) {
                    if (this.contexts[i]) {
                        this.contexts[i].disposeVertexData(this);
                        this.contexts[i] = null;
                    }
                }
            };

            /**
            * @private
            */
            VertexData.prototype.disposeBuffers = function () {
                for (var i = 0; i < 8; ++i) {
                    if (this.buffers[i]) {
                        this.buffers[i].dispose();
                        this.buffers[i] = null;
                    }
                }
            };

            /**
            * @private
            */
            VertexData.prototype.invalidateBuffers = function () {
                for (var i = 0; i < 8; ++i)
                    this.invalid[i] = true;
            };

            /**
            *
            * @param data
            * @param dataPerVertex
            * @private
            */
            VertexData.prototype.setData = function (data) {
                if (this.data && this.data.length != data.length)
                    this.disposeBuffers();
                else
                    this.invalidateBuffers();

                this.data = data;
            };

            /**
            * //TODO
            *
            * @param event
            * @private
            */
            VertexData.prototype._onVerticesUpdated = function (event) {
                var dataType = this._subGeometry.concatenateArrays ? SubGeometryBase.VERTEX_DATA : event.dataType;

                if (dataType == this._dataType)
                    this._dataDirty = true;
            };
            return VertexData;
        })();
        pool.VertexData = VertexData;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.base
    */
    (function (pool) {
        var SubGeometryBase = away.base.SubGeometryBase;

        /**
        *
        */
        var VertexDataPool = (function () {
            function VertexDataPool() {
            }
            VertexDataPool.getItem = function (subGeometry, indexData, dataType) {
                if (subGeometry.concatenateArrays)
                    dataType = SubGeometryBase.VERTEX_DATA;

                var subGeometryDictionary = (VertexDataPool._pool[subGeometry.id] || (VertexDataPool._pool[subGeometry.id] = new Object()));
                var subGeometryData = (subGeometryDictionary[dataType] || (subGeometryDictionary[dataType] = new Array()));

                var vertexData = subGeometryData[indexData.level] || (subGeometryData[indexData.level] = new pool.VertexData(subGeometry, dataType));
                vertexData.updateData(indexData.originalIndices, indexData.indexMappings);

                return vertexData;
            };

            VertexDataPool.disposeItem = function (subGeometry, level, dataType) {
                var subGeometryDictionary = VertexDataPool._pool[subGeometry.id];
                var subGeometryData = subGeometryDictionary[dataType];

                subGeometryData[level].dispose();
                subGeometryData[level] = null;
            };

            VertexDataPool.prototype.disposeData = function (subGeometry) {
                var subGeometryDictionary = VertexDataPool._pool[subGeometry.id];

                for (var key in subGeometryDictionary) {
                    var subGeometryData = subGeometryDictionary[key];

                    var len = subGeometryData.length;
                    for (var i = 0; i < len; i++) {
                        subGeometryData[i].dispose();
                        subGeometryData[i] = null;
                    }
                }

                VertexDataPool._pool[subGeometry.id] = null;
            };
            VertexDataPool._pool = new Object();
            return VertexDataPool;
        })();
        pool.VertexDataPool = VertexDataPool;
    })(away.pool || (away.pool = {}));
    var pool = away.pool;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var AbstractMethodError = away.errors.AbstractMethodError;

        var TextureDataPool = away.pool.TextureDataPool;

        var RenderTexture = away.textures.RenderTexture;

        /**
        * Stage provides a proxy class to handle the creation and attachment of the Context
        * (and in turn the back buffer) it uses. Stage should never be created directly,
        * but requested through StageManager.
        *
        * @see away.managers.StageManager
        *
        */
        var ContextGLBase = (function () {
            function ContextGLBase(stageIndex) {
                //private static _frameEventDriver:Shape = new Shape(); // TODO: add frame driver / request animation frame
                this._stageIndex = -1;
                this._antiAlias = 0;
                this._renderTarget = null;
                this._renderSurfaceSelector = 0;
                this._stageIndex = stageIndex;
                this._texturePool = new TextureDataPool(this);
            }
            Object.defineProperty(ContextGLBase.prototype, "container", {
                get: function () {
                    return this._pContainer;
                },
                enumerable: true,
                configurable: true
            });

            ContextGLBase.prototype.setRenderTarget = function (target, enableDepthAndStencil, surfaceSelector) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = false; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
                if (this._renderTarget === target && surfaceSelector == this._renderSurfaceSelector && this._enableDepthAndStencil == enableDepthAndStencil)
                    return;

                this._renderTarget = target;
                this._renderSurfaceSelector = surfaceSelector;
                this._enableDepthAndStencil = enableDepthAndStencil;
                if (target instanceof RenderTexture) {
                    this.setRenderToTexture(this.getRenderTexture(target), enableDepthAndStencil, this._antiAlias, surfaceSelector);
                } else {
                    this.setRenderToBackBuffer();
                    this.configureBackBuffer(this._width, this._height, this._antiAlias, this._enableDepthAndStencil);
                }
            };

            ContextGLBase.prototype.getRenderTexture = function (textureProxy) {
                var textureData = this._texturePool.getItem(textureProxy);

                if (!textureData.texture)
                    textureData.texture = this.createTexture(textureProxy.width, textureProxy.height, stagegl.ContextGLTextureFormat.BGRA, true);

                return textureData.texture;
            };

            /**
            * Assigns an attribute stream
            *
            * @param index The attribute stream index for the vertex shader
            * @param buffer
            * @param offset
            * @param stride
            * @param format
            */
            ContextGLBase.prototype.activateBuffer = function (index, buffer, offset, format) {
                if (!buffer.contexts[this._stageIndex])
                    buffer.contexts[this._stageIndex] = this;

                if (!buffer.buffers[this._stageIndex]) {
                    buffer.buffers[this._stageIndex] = this.createVertexBuffer(buffer.data.length / buffer.dataPerVertex, buffer.dataPerVertex);
                    buffer.invalid[this._stageIndex] = true;
                }

                if (buffer.invalid[this._stageIndex]) {
                    buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length / buffer.dataPerVertex);
                    buffer.invalid[this._stageIndex] = false;
                }

                this.setVertexBufferAt(index, buffer.buffers[this._stageIndex], offset, format);
            };

            ContextGLBase.prototype.disposeVertexData = function (buffer) {
                buffer.buffers[this._stageIndex].dispose();
                buffer.buffers[this._stageIndex] = null;
            };

            ContextGLBase.prototype.activateRenderTexture = function (index, textureProxy) {
                this.setTextureAt(index, this.getRenderTexture(textureProxy));
            };

            ContextGLBase.prototype.activateTexture = function (index, textureProxy) {
                var textureData = this._texturePool.getItem(textureProxy);

                if (!textureData.texture) {
                    textureData.texture = this.createTexture(textureProxy.width, textureProxy.height, stagegl.ContextGLTextureFormat.BGRA, true);
                    textureData.invalid = true;
                }

                if (textureData.invalid) {
                    textureData.invalid = false;
                    if (textureProxy.generateMipmaps) {
                        var mipmapData = textureProxy._iGetMipmapData();
                        var len = mipmapData.length;
                        for (var i = 0; i < len; i++)
                            textureData.texture.uploadFromData(mipmapData[i], i);
                    } else {
                        textureData.texture.uploadFromData(textureProxy._iGetTextureData(), 0);
                    }
                }

                this.setTextureAt(index, textureData.texture);
            };

            ContextGLBase.prototype.activateCubeTexture = function (index, textureProxy) {
                var textureData = this._texturePool.getItem(textureProxy);

                if (!textureData.texture) {
                    textureData.texture = this.createCubeTexture(textureProxy.size, stagegl.ContextGLTextureFormat.BGRA, false);
                    textureData.invalid = true;
                }

                if (textureData.invalid) {
                    textureData.invalid = false;
                    for (var i = 0; i < 6; ++i) {
                        if (textureProxy.generateMipmaps) {
                            var mipmapData = textureProxy._iGetMipmapData(i);
                            var len = mipmapData.length;
                            for (var j = 0; j < len; j++)
                                textureData.texture.uploadFromData(mipmapData[j], i, j);
                        } else {
                            textureData.texture.uploadFromData(textureProxy._iGetTextureData(i), i, 0);
                        }
                    }
                }

                this.setTextureAt(index, textureData.texture);
            };

            /**
            * Retrieves the VertexBuffer object that contains triangle indices.
            * @param context The ContextWeb for which we request the buffer
            * @return The VertexBuffer object that contains triangle indices.
            */
            ContextGLBase.prototype.getIndexBuffer = function (buffer) {
                if (!buffer.contexts[this._stageIndex])
                    buffer.contexts[this._stageIndex] = this;

                if (!buffer.buffers[this._stageIndex]) {
                    buffer.buffers[this._stageIndex] = this.createIndexBuffer(buffer.data.length);
                    buffer.invalid[this._stageIndex] = true;
                }

                if (buffer.invalid[this._stageIndex]) {
                    buffer.buffers[this._stageIndex].uploadFromArray(buffer.data, 0, buffer.data.length);
                    buffer.invalid[this._stageIndex] = false;
                }

                return buffer.buffers[this._stageIndex];
            };

            ContextGLBase.prototype.disposeIndexData = function (buffer) {
                buffer.buffers[this._stageIndex].dispose();
                buffer.buffers[this._stageIndex] = null;
            };

            ContextGLBase.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
                if (typeof red === "undefined") { red = 0; }
                if (typeof green === "undefined") { green = 0; }
                if (typeof blue === "undefined") { blue = 0; }
                if (typeof alpha === "undefined") { alpha = 1; }
                if (typeof depth === "undefined") { depth = 1; }
                if (typeof stencil === "undefined") { stencil = 0; }
                if (typeof mask === "undefined") { mask = stagegl.ContextGLClearMask.ALL; }
            };

            ContextGLBase.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = true; }
                this._width = width;
                this._height = height;
            };

            ContextGLBase.prototype.createIndexBuffer = function (numIndices) {
                throw new AbstractMethodError();
            };

            ContextGLBase.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
                throw new AbstractMethodError();
            };

            ContextGLBase.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                throw new AbstractMethodError();
            };

            ContextGLBase.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                throw new AbstractMethodError();
            };

            ContextGLBase.prototype.dispose = function () {
            };

            ContextGLBase.prototype.present = function () {
            };

            ContextGLBase.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = false; }
                if (typeof antiAlias === "undefined") { antiAlias = 0; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
            };

            ContextGLBase.prototype.setRenderToBackBuffer = function () {
            };

            ContextGLBase.prototype.setScissorRectangle = function (rectangle) {
            };

            ContextGLBase.prototype.setTextureAt = function (sampler, texture) {
            };

            ContextGLBase.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
                if (typeof bufferOffset === "undefined") { bufferOffset = 0; }
                if (typeof format === "undefined") { format = null; }
            };
            return ContextGLBase;
        })();
        stagegl.ContextGLBase = ContextGLBase;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ContextGLClearMask = (function () {
            function ContextGLClearMask() {
            }
            ContextGLClearMask.COLOR = 1;
            ContextGLClearMask.DEPTH = 2;
            ContextGLClearMask.STENCIL = 4;
            ContextGLClearMask.ALL = ContextGLClearMask.COLOR | ContextGLClearMask.DEPTH | ContextGLClearMask.STENCIL;
            return ContextGLClearMask;
        })();
        stagegl.ContextGLClearMask = ContextGLClearMask;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
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
        stagegl.ContextGLTextureFormat = ContextGLTextureFormat;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
        var ContextGLTriangleFace = (function () {
            function ContextGLTriangleFace() {
            }
            ContextGLTriangleFace.BACK = "back";
            ContextGLTriangleFace.FRONT = "front";
            ContextGLTriangleFace.FRONT_AND_BACK = "frontAndBack";
            ContextGLTriangleFace.NONE = "none";
            return ContextGLTriangleFace;
        })();
        stagegl.ContextGLTriangleFace = ContextGLTriangleFace;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
        stagegl.ContextGLVertexBufferFormat = ContextGLVertexBufferFormat;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ContextGLProgramType = (function () {
            function ContextGLProgramType() {
            }
            ContextGLProgramType.FRAGMENT = "fragment";
            ContextGLProgramType.VERTEX = "vertex";
            return ContextGLProgramType;
        })();
        stagegl.ContextGLProgramType = ContextGLProgramType;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
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
        stagegl.ContextGLBlendFactor = ContextGLBlendFactor;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
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
        stagegl.ContextGLCompareMode = ContextGLCompareMode;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
        var ContextGLMipFilter = (function () {
            function ContextGLMipFilter() {
            }
            ContextGLMipFilter.MIPLINEAR = "miplinear";
            ContextGLMipFilter.MIPNEAREST = "mipnearest";
            ContextGLMipFilter.MIPNONE = "mipnone";
            return ContextGLMipFilter;
        })();
        stagegl.ContextGLMipFilter = ContextGLMipFilter;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
        var ContextGLProfile = (function () {
            function ContextGLProfile() {
            }
            ContextGLProfile.BASELINE = "baseline";
            ContextGLProfile.BASELINE_CONSTRAINED = "baselineConstrained";
            ContextGLProfile.BASELINE_EXTENDED = "baselineExtended";
            return ContextGLProfile;
        })();
        stagegl.ContextGLProfile = ContextGLProfile;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
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
        stagegl.ContextGLStencilAction = ContextGLStencilAction;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (stagegl) {
        var ContextGLTextureFilter = (function () {
            function ContextGLTextureFilter() {
            }
            ContextGLTextureFilter.LINEAR = "linear";
            ContextGLTextureFilter.NEAREST = "nearest";
            return ContextGLTextureFilter;
        })();
        stagegl.ContextGLTextureFilter = ContextGLTextureFilter;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ContextGLWrapMode = (function () {
            function ContextGLWrapMode() {
            }
            ContextGLWrapMode.CLAMP = "clamp";
            ContextGLWrapMode.REPEAT = "repeat";
            return ContextGLWrapMode;
        })();
        stagegl.ContextGLWrapMode = ContextGLWrapMode;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ContextStage3D = (function (_super) {
            __extends(ContextStage3D, _super);
            function ContextStage3D(container, stageIndex, callback) {
                _super.call(this, stageIndex);
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
                    name: container["name"]
                };

                this._oldCanvas = container.cloneNode(); // keep the old one to restore on dispose
                this._oldParent = container.parentNode;

                var context3dObj = this;
                ContextStage3D.contexts[container.id] = this;

                function callbackSWFObject(callbackInfo) {
                    if (!callbackInfo.success)
                        return;

                    context3dObj._pContainer = callbackInfo.ref;
                    context3dObj._iCallback = callback;
                }

                swfobject.embedSWF("../libs/molehill_js_flashbridge.swf", container.id, String(container.width), String(container.height), swfVersionStr, "", flashvars, params, attributes, callbackSWFObject);
            }
            Object.defineProperty(ContextStage3D.prototype, "container", {
                get: function () {
                    return this._pContainer;
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

                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.enableErrorChecking, value ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue));
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
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                //TODO:streaming
                return new stagegl.TextureFlash(this, width, height, format, optimizeForRenderToTexture);
            };

            ContextStage3D.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                //TODO:streaming
                return new stagegl.CubeTextureFlash(this, size, format, optimizeForRenderToTexture);
            };

            ContextStage3D.prototype.setTextureAt = function (sampler, texture) {
                if (texture) {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.setTextureAt) + sampler + "," + texture.id + ",");
                } else {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearTextureAt) + sampler.toString() + ",");
                }

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
                //nothing to do here
            };

            ContextStage3D.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail) {
                if (typeof triangleFace === "undefined") { triangleFace = "frontAndBack"; }
                if (typeof compareMode === "undefined") { compareMode = "always"; }
                if (typeof actionOnBothPass === "undefined") { actionOnBothPass = "keep"; }
                if (typeof actionOnDepthFail === "undefined") { actionOnDepthFail = "keep"; }
                if (typeof actionOnDepthPassStencilFail === "undefined") { actionOnDepthPassStencilFail = "keep"; }
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
                if (typeof readMask === "undefined") { readMask = 255; }
                if (typeof writeMask === "undefined") { writeMask = 255; }
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setStencilReferenceValue, referenceValue + away.stagegl.OpCodes.intMask, readMask + away.stagegl.OpCodes.intMask, writeMask + away.stagegl.OpCodes.intMask));

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
                if (typeof coordinateSystem === "undefined") { coordinateSystem = "leftHanded"; }
                //TODO implement coordinateSystem option
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setCulling) + triangleFaceToCull + "$");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.drawTriangles = function (indexBuffer, firstIndex, numTriangles) {
                if (typeof firstIndex === "undefined") { firstIndex = 0; }
                if (typeof numTriangles === "undefined") { numTriangles = -1; }
                firstIndex = firstIndex || 0;
                if (!numTriangles || numTriangles < 0)
                    numTriangles = indexBuffer.numIndices / 3;

                this.addStream(String.fromCharCode(away.stagegl.OpCodes.drawTriangles, indexBuffer.id + away.stagegl.OpCodes.intMask) + firstIndex + "," + numTriangles + ",");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
                //this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));
                if (typeof transposedMatrix === "undefined") { transposedMatrix = false; }
                //TODO remove special case for WebGL matrix calls?
                var d = matrix.rawData;
                if (transposedMatrix) {
                    this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[4], d[8], d[12]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[1], d[5], d[9], d[13]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[2], d[6], d[10], d[14]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[3], d[7], d[11], d[15]], 1);
                } else {
                    this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[1], d[2], d[3]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[4], d[5], d[6], d[7]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[8], d[9], d[10], d[11]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[12], d[13], d[14], d[15]], 1);
                }
            };

            ContextStage3D.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
                if (typeof numRegisters === "undefined") { numRegisters = -1; }
                var startIndex;
                var target = (programType == stagegl.ContextGLProgramType.VERTEX) ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue;
                for (var i = 0; i < numRegisters; i++) {
                    startIndex = i * 4;
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.setProgramConstant, target, (firstRegister + i) + away.stagegl.OpCodes.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");

                    if (ContextStage3D.debug)
                        this.execute();
                }
            };

            ContextStage3D.prototype.setProgram = function (program) {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setProgram, program.id + away.stagegl.OpCodes.intMask));

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.present = function () {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.present));
                this.execute();
            };

            ContextStage3D.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
                if (typeof red === "undefined") { red = 0; }
                if (typeof green === "undefined") { green = 0; }
                if (typeof blue === "undefined") { blue = 0; }
                if (typeof alpha === "undefined") { alpha = 1; }
                if (typeof depth === "undefined") { depth = 1; }
                if (typeof stencil === "undefined") { stencil = 0; }
                if (typeof mask === "undefined") { mask = stagegl.ContextGLClearMask.ALL; }
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.createProgram = function () {
                return new stagegl.ProgramFlash(this);
            };

            ContextStage3D.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
                return new stagegl.VertexBufferFlash(this, numVertices, data32PerVertex);
            };

            ContextStage3D.prototype.createIndexBuffer = function (numIndices) {
                return new stagegl.IndexBufferFlash(this, numIndices);
            };

            ContextStage3D.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = true; }
                _super.prototype.configureBackBuffer.call(this, width, height, antiAlias, enableDepthAndStencil);

                //TODO: add Anitalias setting
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.configureBackBuffer) + width + "," + height + ",");
            };

            ContextStage3D.prototype.drawToBitmapData = function (destination) {
                //TODO
            };

            ContextStage3D.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
                if (typeof bufferOffset === "undefined") { bufferOffset = 0; }
                if (typeof format === "undefined") { format = null; }
                if (buffer) {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.setVertexBufferAt, index + away.stagegl.OpCodes.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
                } else {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearVertexBufferAt, index + away.stagegl.OpCodes.intMask));
                }

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setColorMask = function (red, green, blue, alpha) {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setColorMask, red ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, green ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, blue ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, alpha ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue));

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = false; }
                if (typeof antiAlias === "undefined") { antiAlias = 0; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
                if (target === null || target === undefined) {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearRenderToTexture));
                } else {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.setRenderToTexture, enableDepthAndStencil ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue) + target.id + "," + (antiAlias || 0) + ",");
                }

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setRenderToBackBuffer = function () {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearRenderToTexture));

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setScissorRectangle = function (rectangle) {
                if (rectangle) {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
                } else {
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearScissorRect));
                }

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.setDepthTest = function (depthMask, passCompareMode) {
                this.addStream(String.fromCharCode(away.stagegl.OpCodes.setDepthTest, depthMask ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue) + passCompareMode + "$");

                if (ContextStage3D.debug)
                    this.execute();
            };

            ContextStage3D.prototype.dispose = function () {
                if (this._pContainer == null)
                    return;

                console.log("Context3D dispose, releasing " + this._resources.length + " resources.");

                while (this._resources.length)
                    this._resources[0].dispose();

                if (this._pContainer) {
                    // encode command
                    this.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeContext));
                    this.execute();
                    swfobject.removeSWF(this._oldCanvas.id);
                    if (this._oldCanvas && this._oldParent) {
                        this._oldParent.appendChild(this._oldCanvas);
                        this._oldParent = null;
                    }
                    this._pContainer = null;
                }

                this._oldCanvas = null;
            };

            ContextStage3D.prototype.addStream = function (stream) {
                this._cmdStream += stream;
            };

            ContextStage3D.prototype.execute = function () {
                if (ContextStage3D.logStream)
                    console.log(this._cmdStream);

                var result = this._pContainer["CallFunction"]("<invoke name=\"execStage3dOpStream\" returntype=\"javascript\"><arguments><string>" + this._cmdStream + "</string></arguments></invoke>");

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
            ContextStage3D.defaultsampler = new aglsl.Sampler();

            ContextStage3D.debug = false;
            ContextStage3D.logStream = false;
            return ContextStage3D;
        })(stagegl.ContextGLBase);
        stagegl.ContextStage3D = ContextStage3D;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));

/**
* global function for flash callback
*/
function mountain_js_context_available(id, driverInfo) {
    var ctx = away.stagegl.ContextStage3D.contexts[id];
    if (ctx._iCallback) {
        ctx._iDriverInfo = driverInfo;

        // get out of the current JS stack frame and call back from flash player
        var timeOutId = window.setTimeout(function () {
            window.clearTimeout(timeOutId);
            try  {
                ctx._iCallback(ctx);
            } catch (e) {
                console.log("Callback failed during flash initialization with '" + e.toString() + "'");
            }
        }, 1);
    }
}
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ContextWebGL = (function (_super) {
            __extends(ContextWebGL, _super);
            function ContextWebGL(canvas, stageIndex) {
                _super.call(this, stageIndex);
                this._blendFactorDictionary = new Object();
                this._depthTestDictionary = new Object();
                this._textureIndexDictionary = new Array(8);
                this._textureTypeDictionary = new Object();
                this._wrapDictionary = new Object();
                this._filterDictionary = new Object();
                this._mipmapFilterDictionary = new Object();
                this._uniformLocationNameDictionary = new Object();
                this._vertexBufferDimensionDictionary = new Object();
                this._indexBufferList = new Array();
                this._vertexBufferList = new Array();
                this._textureList = new Array();
                this._programList = new Array();
                this._samplerStates = new Array(8);

                this._pContainer = canvas;

                try  {
                    this._gl = canvas.getContext("experimental-webgl", { premultipliedAlpha: false, alpha: false });

                    if (!this._gl)
                        this._gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: false });
                } catch (e) {
                    //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
                }

                if (this._gl) {
                    //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_SUCCESS ) );
                    //setup shortcut dictionaries
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE] = this._gl.ONE;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.DESTINATION_ALPHA] = this._gl.DST_ALPHA;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.DESTINATION_COLOR] = this._gl.DST_COLOR;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE] = this._gl.ONE;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = this._gl.ONE_MINUS_DST_ALPHA;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = this._gl.ONE_MINUS_DST_COLOR;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = this._gl.ONE_MINUS_SRC_ALPHA;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = this._gl.ONE_MINUS_SRC_COLOR;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.SOURCE_ALPHA] = this._gl.SRC_ALPHA;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.SOURCE_COLOR] = this._gl.SRC_COLOR;
                    this._blendFactorDictionary[stagegl.ContextGLBlendFactor.ZERO] = this._gl.ZERO;

                    this._depthTestDictionary[stagegl.ContextGLCompareMode.ALWAYS] = this._gl.ALWAYS;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.EQUAL] = this._gl.EQUAL;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.GREATER] = this._gl.GREATER;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.GREATER_EQUAL] = this._gl.GEQUAL;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.LESS] = this._gl.LESS;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.LESS_EQUAL] = this._gl.LEQUAL;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.NEVER] = this._gl.NEVER;
                    this._depthTestDictionary[stagegl.ContextGLCompareMode.NOT_EQUAL] = this._gl.NOTEQUAL;

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

                    this._wrapDictionary[stagegl.ContextGLWrapMode.REPEAT] = this._gl.REPEAT;
                    this._wrapDictionary[stagegl.ContextGLWrapMode.CLAMP] = this._gl.CLAMP_TO_EDGE;

                    this._filterDictionary[stagegl.ContextGLTextureFilter.LINEAR] = this._gl.LINEAR;
                    this._filterDictionary[stagegl.ContextGLTextureFilter.NEAREST] = this._gl.NEAREST;

                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.LINEAR] = new Object();
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.LINEAR][stagegl.ContextGLMipFilter.MIPNEAREST] = this._gl.LINEAR_MIPMAP_NEAREST;
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.LINEAR][stagegl.ContextGLMipFilter.MIPLINEAR] = this._gl.LINEAR_MIPMAP_LINEAR;
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.LINEAR][stagegl.ContextGLMipFilter.MIPNONE] = this._gl.LINEAR;
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.NEAREST] = new Object();
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.NEAREST][stagegl.ContextGLMipFilter.MIPNEAREST] = this._gl.NEAREST_MIPMAP_NEAREST;
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.NEAREST][stagegl.ContextGLMipFilter.MIPLINEAR] = this._gl.NEAREST_MIPMAP_LINEAR;
                    this._mipmapFilterDictionary[stagegl.ContextGLTextureFilter.NEAREST][stagegl.ContextGLMipFilter.MIPNONE] = this._gl.NEAREST;

                    this._uniformLocationNameDictionary[stagegl.ContextGLProgramType.VERTEX] = "vc";
                    this._uniformLocationNameDictionary[stagegl.ContextGLProgramType.FRAGMENT] = "fc";

                    this._vertexBufferDimensionDictionary[stagegl.ContextGLVertexBufferFormat.FLOAT_1] = 1;
                    this._vertexBufferDimensionDictionary[stagegl.ContextGLVertexBufferFormat.FLOAT_2] = 2;
                    this._vertexBufferDimensionDictionary[stagegl.ContextGLVertexBufferFormat.FLOAT_3] = 3;
                    this._vertexBufferDimensionDictionary[stagegl.ContextGLVertexBufferFormat.FLOAT_4] = 4;
                    this._vertexBufferDimensionDictionary[stagegl.ContextGLVertexBufferFormat.BYTES_4] = 4;
                } else {
                    //this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
                    alert("WebGL is not available.");
                }

                for (var i = 0; i < ContextWebGL.MAX_SAMPLERS; ++i) {
                    this._samplerStates[i] = new stagegl.SamplerState();
                    this._samplerStates[i].wrap = this._gl.REPEAT;
                    this._samplerStates[i].filter = this._gl.LINEAR;
                    this._samplerStates[i].mipfilter = this._gl.LINEAR;
                }
            }
            Object.defineProperty(ContextWebGL.prototype, "container", {
                get: function () {
                    return this._pContainer;
                },
                enumerable: true,
                configurable: true
            });

            ContextWebGL.prototype.gl = function () {
                return this._gl;
            };

            ContextWebGL.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
                if (typeof red === "undefined") { red = 0; }
                if (typeof green === "undefined") { green = 0; }
                if (typeof blue === "undefined") { blue = 0; }
                if (typeof alpha === "undefined") { alpha = 1; }
                if (typeof depth === "undefined") { depth = 1; }
                if (typeof stencil === "undefined") { stencil = 0; }
                if (typeof mask === "undefined") { mask = stagegl.ContextGLClearMask.ALL; }
                if (!this._drawing) {
                    this.updateBlendStatus();
                    this._drawing = true;
                }

                var glmask = 0;
                if (mask & stagegl.ContextGLClearMask.COLOR)
                    glmask |= this._gl.COLOR_BUFFER_BIT;
                if (mask & stagegl.ContextGLClearMask.STENCIL)
                    glmask |= this._gl.STENCIL_BUFFER_BIT;
                if (mask & stagegl.ContextGLClearMask.DEPTH)
                    glmask |= this._gl.DEPTH_BUFFER_BIT;

                this._gl.clearColor(red, green, blue, alpha);
                this._gl.clearDepth(depth);
                this._gl.clearStencil(stencil);
                this._gl.clear(glmask);
            };

            ContextWebGL.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = true; }
                _super.prototype.configureBackBuffer.call(this, width, height, antiAlias, enableDepthAndStencil);

                if (enableDepthAndStencil) {
                    this._gl.enable(this._gl.STENCIL_TEST);
                    this._gl.enable(this._gl.DEPTH_TEST);
                }

                this._gl.viewport['width'] = width;
                this._gl.viewport['height'] = height;

                this._gl.viewport(0, 0, width, height);
            };

            ContextWebGL.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                var texture = new stagegl.CubeTextureWebGL(this._gl, size);
                this._textureList.push(texture);
                return texture;
            };

            ContextWebGL.prototype.createIndexBuffer = function (numIndices) {
                var indexBuffer = new stagegl.IndexBufferWebGL(this._gl, numIndices);
                this._indexBufferList.push(indexBuffer);
                return indexBuffer;
            };

            ContextWebGL.prototype.createProgram = function () {
                var program = new stagegl.ProgramWebGL(this._gl);
                this._programList.push(program);
                return program;
            };

            ContextWebGL.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
                if (typeof streamingLevels === "undefined") { streamingLevels = 0; }
                //TODO streaming
                var texture = new stagegl.TextureWebGL(this._gl, width, height);
                this._textureList.push(texture);
                return texture;
            };

            ContextWebGL.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
                var vertexBuffer = new stagegl.VertexBufferWebGL(this._gl, numVertices, data32PerVertex);
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

            ContextWebGL.prototype.drawToBitmapData = function (destination) {
                var arrayBuffer = new ArrayBuffer(destination.width * destination.height * 4);

                this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array(arrayBuffer));

                var byteArray = new away.utils.ByteArray();
                byteArray.setArrayBuffer(arrayBuffer);

                destination.setPixels(new away.geom.Rectangle(0, 0, destination.width, destination.height), byteArray);
            };

            ContextWebGL.prototype.drawTriangles = function (indexBuffer, firstIndex, numTriangles) {
                if (typeof firstIndex === "undefined") { firstIndex = 0; }
                if (typeof numTriangles === "undefined") { numTriangles = -1; }
                if (!this._drawing)
                    throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";

                this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
                this._gl.drawElements(this._gl.TRIANGLES, (numTriangles == -1) ? indexBuffer.numIndices : numTriangles * 3, this._gl.UNSIGNED_SHORT, firstIndex);
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
                if (typeof coordinateSystem === "undefined") { coordinateSystem = "leftHanded"; }
                if (triangleFaceToCull == stagegl.ContextGLTriangleFace.NONE) {
                    this._gl.disable(this._gl.CULL_FACE);
                } else {
                    this._gl.enable(this._gl.CULL_FACE);
                    switch (triangleFaceToCull) {
                        case stagegl.ContextGLTriangleFace.BACK:
                            this._gl.cullFace((coordinateSystem == "leftHanded") ? this._gl.FRONT : this._gl.BACK);
                            break;
                        case stagegl.ContextGLTriangleFace.FRONT:
                            this._gl.cullFace((coordinateSystem == "leftHanded") ? this._gl.BACK : this._gl.FRONT);
                            break;
                        case stagegl.ContextGLTriangleFace.FRONT_AND_BACK:
                            this._gl.cullFace(this._gl.FRONT_AND_BACK);
                            break;
                        default:
                            throw "Unknown ContextGLTriangleFace type.";
                    }
                }
            };

            // TODO ContextGLCompareMode
            ContextWebGL.prototype.setDepthTest = function (depthMask, passCompareMode) {
                this._gl.depthFunc(this._depthTestDictionary[passCompareMode]);

                this._gl.depthMask(depthMask);
            };

            ContextWebGL.prototype.setProgram = function (program) {
                //TODO decide on construction/reference resposibilities
                this._currentProgram = program;
                program.focusProgram();
            };

            ContextWebGL.prototype.setProgramConstantsFromMatrix = function (programType, firstRegister, matrix, transposedMatrix) {
                //this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));
                if (typeof transposedMatrix === "undefined") { transposedMatrix = false; }
                //TODO remove special case for WebGL matrix calls?
                var d = matrix.rawData;
                if (transposedMatrix) {
                    this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[4], d[8], d[12]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[1], d[5], d[9], d[13]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[2], d[6], d[10], d[14]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[3], d[7], d[11], d[15]], 1);
                } else {
                    this.setProgramConstantsFromArray(programType, firstRegister, [d[0], d[1], d[2], d[3]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 1, [d[4], d[5], d[6], d[7]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 2, [d[8], d[9], d[10], d[11]], 1);
                    this.setProgramConstantsFromArray(programType, firstRegister + 3, [d[12], d[13], d[14], d[15]], 1);
                }
            };

            ContextWebGL.prototype.setProgramConstantsFromArray = function (programType, firstRegister, data, numRegisters) {
                if (typeof numRegisters === "undefined") { numRegisters = -1; }
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
                } else {
                    throw "Sampler is out of bounds.";
                }
            };

            ContextWebGL.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
                if (typeof bufferOffset === "undefined") { bufferOffset = 0; }
                if (typeof format === "undefined") { format = null; }
                var location = this._currentProgram ? this._gl.getAttribLocation(this._currentProgram.glProgram, "va" + index) : -1;

                if (!buffer) {
                    if (location > -1)
                        this._gl.disableVertexAttribArray(location);

                    return;
                }

                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer.glBuffer);
                this._gl.enableVertexAttribArray(location);
                this._gl.vertexAttribPointer(location, this._vertexBufferDimensionDictionary[format], this._gl.FLOAT, false, buffer.data32PerVertex * 4, bufferOffset * 4);
            };

            ContextWebGL.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
                if (typeof enableDepthAndStencil === "undefined") { enableDepthAndStencil = false; }
                if (typeof antiAlias === "undefined") { antiAlias = 0; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
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
                } else {
                    this._gl.disable(this._gl.BLEND);
                }
            };
            ContextWebGL.MAX_SAMPLERS = 8;

            ContextWebGL.modulo = 0;
            return ContextWebGL;
        })(stagegl.ContextGLBase);
        stagegl.ContextWebGL = ContextWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
        stagegl.ResourceBaseFlash = ResourceBaseFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
                    throw new away.errors.AbstractMethodError();
                },
                enumerable: true,
                configurable: true
            });
            return TextureBaseWebGL;
        })();
        stagegl.TextureBaseWebGL = TextureBaseWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ByteArrayBase = away.utils.ByteArrayBase;

        var CubeTextureFlash = (function (_super) {
            __extends(CubeTextureFlash, _super);
            function CubeTextureFlash(context, size, format, forRTT, streaming) {
                if (typeof streaming === "undefined") { streaming = false; }
                _super.call(this);

                this._context = context;
                this._size = size;

                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initCubeTexture, (forRTT ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue)) + size + "," + streaming + "," + format + "$");
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
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeCubeTexture) + this._pId.toString() + ",");
                this._context.execute();
                this._context._iRemoveResource(this);

                this._context = null;
            };

            CubeTextureFlash.prototype.uploadFromData = function (data, side, miplevel) {
                if (typeof miplevel === "undefined") { miplevel = 0; }
                if (data instanceof away.base.BitmapData) {
                    data = data.imageData.data;
                } else if (data instanceof HTMLImageElement) {
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

                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
                this._context.execute();
            };

            CubeTextureFlash.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/ , async) {
                if (typeof async === "undefined") { async = false; }
            };
            return CubeTextureFlash;
        })(stagegl.ResourceBaseFlash);
        stagegl.CubeTextureFlash = CubeTextureFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
                if (typeof miplevel === "undefined") { miplevel = 0; }
                if (data instanceof away.base.BitmapData)
                    data = data.imageData;

                this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._texture);
                this._gl.texImage2D(this._textureSelectorDictionary[side], miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
                this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
            };

            CubeTextureWebGL.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/ , async) {
                if (typeof async === "undefined") { async = false; }
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
        })(stagegl.TextureBaseWebGL);
        stagegl.CubeTextureWebGL = CubeTextureWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
///<reference path="../../_definitions.ts"/>
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var IndexBufferFlash = (function (_super) {
            __extends(IndexBufferFlash, _super);
            function IndexBufferFlash(context, numIndices) {
                _super.call(this);

                this._context = context;
                this._numIndices = numIndices;
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initIndexBuffer, numIndices + away.stagegl.OpCodes.intMask));
                this._pId = this._context.execute();
                this._context._iAddResource(this);
            }
            IndexBufferFlash.prototype.uploadFromArray = function (data, startOffset, count) {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadArrayIndexBuffer, this._pId + away.stagegl.OpCodes.intMask) + data.join() + "#" + startOffset + "," + count + ",");
                this._context.execute();
            };

            IndexBufferFlash.prototype.dispose = function () {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeIndexBuffer, this._pId + away.stagegl.OpCodes.intMask));
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
        })(stagegl.ResourceBaseFlash);
        stagegl.IndexBufferFlash = IndexBufferFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var IndexBufferWebGL = (function () {
            function IndexBufferWebGL(gl, numIndices) {
                this._gl = gl;
                this._buffer = this._gl.createBuffer();
                this._numIndices = numIndices;
            }
            IndexBufferWebGL.prototype.uploadFromArray = function (data, startOffset, count) {
                this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._buffer);

                // TODO add index offsets
                this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this._gl.STATIC_DRAW);
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
        stagegl.IndexBufferWebGL = IndexBufferWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
///<reference path="../../_definitions.ts"/>
///<reference path="../../_definitions.ts"/>
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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

            OpCodes.disposeVertexBuffer = 61;

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
        stagegl.OpCodes = OpCodes;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ProgramFlash = (function (_super) {
            __extends(ProgramFlash, _super);
            function ProgramFlash(context) {
                _super.call(this);

                this._context = context;
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initProgram));
                this._pId = this._context.execute();
                this._context._iAddResource(this);
            }
            ProgramFlash.prototype.upload = function (vertexProgram, fragmentProgram) {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadAGALBytesProgram, this._pId + away.stagegl.OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");

                if (stagegl.ContextStage3D.debug)
                    this._context.execute();
            };

            ProgramFlash.prototype.dispose = function () {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeProgram, this._pId + away.stagegl.OpCodes.intMask));
                this._context.execute();
                this._context._iRemoveResource(this);

                this._context = null;
            };
            return ProgramFlash;
        })(stagegl.ResourceBaseFlash);
        stagegl.ProgramFlash = ProgramFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
                    alert(this._gl.getShaderInfoLog(this._vertexShader));
                    return null;
                }

                this._gl.shaderSource(this._fragmentShader, fragmentString);
                this._gl.compileShader(this._fragmentShader);

                if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS)) {
                    alert(this._gl.getShaderInfoLog(this._fragmentShader));
                    return null;
                }

                this._gl.attachShader(this._program, this._vertexShader);
                this._gl.attachShader(this._program, this._fragmentShader);
                this._gl.linkProgram(this._program);

                if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
                    alert("Could not link the program."); //TODO throw errors
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
            ProgramWebGL._tokenizer = new aglsl.AGALTokenizer();
            ProgramWebGL._aglslParser = new aglsl.AGLSLParser();
            return ProgramWebGL;
        })();
        stagegl.ProgramWebGL = ProgramWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var SamplerState = (function () {
            function SamplerState() {
            }
            return SamplerState;
        })();
        stagegl.SamplerState = SamplerState;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var ByteArrayBase = away.utils.ByteArrayBase;

        var TextureFlash = (function (_super) {
            __extends(TextureFlash, _super);
            function TextureFlash(context, width, height, format, forRTT, streaming) {
                if (typeof streaming === "undefined") { streaming = false; }
                _super.call(this);

                this._context = context;
                this._width = width;
                this._height = height;

                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initTexture, (forRTT ? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
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
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeTexture) + this._pId.toString() + ",");
                this._context.execute();
                this._context._iRemoveResource(this);

                this._context = null;
            };

            TextureFlash.prototype.uploadFromData = function (data, miplevel) {
                if (typeof miplevel === "undefined") { miplevel = 0; }
                if (data instanceof away.base.BitmapData) {
                    data = data.imageData.data;
                } else if (data instanceof HTMLImageElement) {
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

                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
                this._context.execute();
            };
            return TextureFlash;
        })(stagegl.ResourceBaseFlash);
        stagegl.TextureFlash = TextureFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
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
                if (typeof miplevel === "undefined") { miplevel = 0; }
                if (data instanceof away.base.BitmapData)
                    data = data.imageData;

                this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
                this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            };

            TextureWebGL.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/ , async) {
                if (typeof async === "undefined") { async = false; }
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
        })(stagegl.TextureBaseWebGL);
        stagegl.TextureWebGL = TextureWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var VertexBufferFlash = (function (_super) {
            __extends(VertexBufferFlash, _super);
            function VertexBufferFlash(context, numVertices, data32PerVertex) {
                _super.call(this);

                this._context = context;
                this._numVertices = numVertices;
                this._data32PerVertex = data32PerVertex;
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initVertexBuffer, data32PerVertex + away.stagegl.OpCodes.intMask) + numVertices.toString() + ",");
                this._pId = this._context.execute();
                this._context._iAddResource(this);
            }
            VertexBufferFlash.prototype.uploadFromArray = function (data, startVertex, numVertices) {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadArrayVertexBuffer, this._pId + away.stagegl.OpCodes.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
                this._context.execute();
            };

            Object.defineProperty(VertexBufferFlash.prototype, "numVertices", {
                get: function () {
                    return this._numVertices;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VertexBufferFlash.prototype, "data32PerVertex", {
                get: function () {
                    return this._data32PerVertex;
                },
                enumerable: true,
                configurable: true
            });

            VertexBufferFlash.prototype.dispose = function () {
                this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeVertexBuffer, this._pId + away.stagegl.OpCodes.intMask));
                this._context.execute();
                this._context._iRemoveResource(this);

                this._context = null;
            };
            return VertexBufferFlash;
        })(stagegl.ResourceBaseFlash);
        stagegl.VertexBufferFlash = VertexBufferFlash;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (stagegl) {
        var VertexBufferWebGL = (function () {
            function VertexBufferWebGL(gl, numVertices, data32PerVertex) {
                this._gl = gl;
                this._buffer = this._gl.createBuffer();
                this._numVertices = numVertices;
                this._data32PerVertex = data32PerVertex;
            }
            VertexBufferWebGL.prototype.uploadFromArray = function (vertices, startVertex, numVertices) {
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);

                //console.log( "** WARNING upload not fully implemented, startVertex & numVertices not considered." );
                // TODO add offsets , startVertex, numVertices * this._data32PerVertex
                this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
            };

            Object.defineProperty(VertexBufferWebGL.prototype, "numVertices", {
                get: function () {
                    return this._numVertices;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VertexBufferWebGL.prototype, "data32PerVertex", {
                get: function () {
                    return this._data32PerVertex;
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
        stagegl.VertexBufferWebGL = VertexBufferWebGL;
    })(away.stagegl || (away.stagegl = {}));
    var stagegl = away.stagegl;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (managers) {
        var StageEvent = away.events.StageEvent;

        var AGALProgramCache = (function () {
            function AGALProgramCache(stage, agalProgramCacheSingletonEnforcer) {
                if (!agalProgramCacheSingletonEnforcer)
                    throw new Error("This class is a multiton and cannot be instantiated manually. Use StageManager.getInstance instead.");

                this._stage = stage;

                this._program3Ds = new Object();
                this._ids = new Object();
                this._usages = new Object();
                this._keys = new Object();
            }
            AGALProgramCache.getInstance = function (stage) {
                var index = stage.stageIndex;

                if (AGALProgramCache._instances == null)
                    AGALProgramCache._instances = new Array(8);

                if (!AGALProgramCache._instances[index]) {
                    AGALProgramCache._instances[index] = new AGALProgramCache(stage, new AGALProgramCacheSingletonEnforcer());

                    stage.addEventListener(StageEvent.CONTEXT_DISPOSED, AGALProgramCache.onContextGLDisposed);
                    stage.addEventListener(StageEvent.CONTEXT_CREATED, AGALProgramCache.onContextGLDisposed);
                    stage.addEventListener(StageEvent.CONTEXT_RECREATED, AGALProgramCache.onContextGLDisposed);
                }

                return AGALProgramCache._instances[index];
            };

            AGALProgramCache.getInstanceFromIndex = function (index) {
                if (!AGALProgramCache._instances[index])
                    throw new Error("Instance not created yet!");

                return AGALProgramCache._instances[index];
            };

            AGALProgramCache.onContextGLDisposed = function (event) {
                var stage = event.target;

                var index = stage.stageIndex;

                AGALProgramCache._instances[index].dispose();
                AGALProgramCache._instances[index] = null;

                stage.removeEventListener(StageEvent.CONTEXT_DISPOSED, AGALProgramCache.onContextGLDisposed);
                stage.removeEventListener(StageEvent.CONTEXT_CREATED, AGALProgramCache.onContextGLDisposed);
                stage.removeEventListener(StageEvent.CONTEXT_RECREATED, AGALProgramCache.onContextGLDisposed);
            };

            AGALProgramCache.prototype.dispose = function () {
                for (var key in this._program3Ds)
                    this.destroyProgram(key);

                this._keys = null;
                this._program3Ds = null;
                this._usages = null;
            };

            AGALProgramCache.prototype.setProgram = function (programIds, programs, vertexCode, fragmentCode) {
                //TODO move program id arrays into stagegl
                var stageIndex = this._stage.stageIndex;
                var program;
                var key = this.getKey(vertexCode, fragmentCode);

                if (this._program3Ds[key] == null) {
                    this._keys[AGALProgramCache._currentId] = key;
                    this._usages[AGALProgramCache._currentId] = 0;
                    this._ids[key] = AGALProgramCache._currentId;
                    ++AGALProgramCache._currentId;

                    program = this._stage.context.createProgram();

                    var vertexByteCode = (new aglsl.assembler.AGALMiniAssembler().assemble("part vertex 1\n" + vertexCode + "endpart"))['vertex'].data;
                    var fragmentByteCode = (new aglsl.assembler.AGALMiniAssembler().assemble("part fragment 1\n" + fragmentCode + "endpart"))['fragment'].data;
                    program.upload(vertexByteCode, fragmentByteCode);

                    this._program3Ds[key] = program;
                }

                var oldId = programIds[stageIndex];
                var newId = this._ids[key];

                if (oldId != newId) {
                    if (oldId >= 0)
                        this.freeProgram(oldId);

                    this._usages[newId]++;
                }

                programIds[stageIndex] = newId;
                programs[stageIndex] = this._program3Ds[key];
            };

            AGALProgramCache.prototype.freeProgram = function (programId) {
                this._usages[programId]--;

                if (this._usages[programId] == 0)
                    this.destroyProgram(this._keys[programId]);
            };

            AGALProgramCache.prototype.destroyProgram = function (key) {
                this._program3Ds[key].dispose();
                this._program3Ds[key] = null;

                delete this._program3Ds[key];

                this._ids[key] = -1;
            };

            AGALProgramCache.prototype.getKey = function (vertexCode, fragmentCode) {
                return vertexCode + "---" + fragmentCode;
            };
            AGALProgramCache._currentId = 0;
            return AGALProgramCache;
        })();
        managers.AGALProgramCache = AGALProgramCache;
    })(away.managers || (away.managers = {}));
    var managers = away.managers;
})(away || (away = {}));

var AGALProgramCacheSingletonEnforcer = (function () {
    function AGALProgramCacheSingletonEnforcer() {
    }
    return AGALProgramCacheSingletonEnforcer;
})();
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (managers) {
        var RTTBufferManager = (function (_super) {
            __extends(RTTBufferManager, _super);
            function RTTBufferManager(se, stage) {
                _super.call(this);
                this._viewWidth = -1;
                this._viewHeight = -1;
                this._textureWidth = -1;
                this._textureHeight = -1;
                this._buffersInvalid = true;

                if (!se)
                    throw new Error("No cheating the multiton!");

                this._renderToTextureRect = new away.geom.Rectangle();

                this._stage = stage;
            }
            RTTBufferManager.getInstance = function (stage) {
                if (!stage)
                    throw new Error("stage key cannot be null!");

                if (RTTBufferManager._instances == null)
                    RTTBufferManager._instances = new Array();

                var rttBufferManager = RTTBufferManager.getRTTBufferManagerFromStage(stage);

                if (rttBufferManager == null) {
                    rttBufferManager = new RTTBufferManager(new SingletonEnforcer(), stage);

                    var vo = new RTTBufferManagerVO();

                    vo.stage3d = stage;
                    vo.rttbfm = rttBufferManager;

                    RTTBufferManager._instances.push(vo);
                }

                return rttBufferManager;
            };

            RTTBufferManager.getRTTBufferManagerFromStage = function (stage) {
                var l = RTTBufferManager._instances.length;
                var r;

                for (var c = 0; c < l; c++) {
                    r = RTTBufferManager._instances[c];

                    if (r.stage3d === stage)
                        return r.rttbfm;
                }

                return null;
            };

            RTTBufferManager.deleteRTTBufferManager = function (stage) {
                var l = RTTBufferManager._instances.length;
                var r;

                for (var c = 0; c < l; c++) {
                    r = RTTBufferManager._instances[c];

                    if (r.stage3d === stage) {
                        RTTBufferManager._instances.splice(c, 1);
                        return;
                    }
                }
            };

            Object.defineProperty(RTTBufferManager.prototype, "textureRatioX", {
                get: function () {
                    if (this._buffersInvalid)
                        this.updateRTTBuffers();

                    return this._textureRatioX;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "textureRatioY", {
                get: function () {
                    if (this._buffersInvalid)
                        this.updateRTTBuffers();

                    return this._textureRatioY;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "viewWidth", {
                get: function () {
                    return this._viewWidth;
                },
                set: function (value) {
                    if (value == this._viewWidth)
                        return;

                    this._viewWidth = value;

                    this._buffersInvalid = true;

                    this._textureWidth = away.utils.TextureUtils.getBestPowerOf2(this._viewWidth);

                    if (this._textureWidth > this._viewWidth) {
                        this._renderToTextureRect.x = Math.floor((this._textureWidth - this._viewWidth) * .5);
                        this._renderToTextureRect.width = this._viewWidth;
                    } else {
                        this._renderToTextureRect.x = 0;
                        this._renderToTextureRect.width = this._textureWidth;
                    }

                    this.dispatchEvent(new away.events.Event(away.events.Event.RESIZE));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RTTBufferManager.prototype, "viewHeight", {
                get: function () {
                    return this._viewHeight;
                },
                set: function (value) {
                    if (value == this._viewHeight)
                        return;

                    this._viewHeight = value;

                    this._buffersInvalid = true;

                    this._textureHeight = away.utils.TextureUtils.getBestPowerOf2(this._viewHeight);

                    if (this._textureHeight > this._viewHeight) {
                        this._renderToTextureRect.y = Math.floor((this._textureHeight - this._viewHeight) * .5);
                        this._renderToTextureRect.height = this._viewHeight;
                    } else {
                        this._renderToTextureRect.y = 0;
                        this._renderToTextureRect.height = this._textureHeight;
                    }

                    this.dispatchEvent(new away.events.Event(away.events.Event.RESIZE));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RTTBufferManager.prototype, "renderToTextureVertexBuffer", {
                get: function () {
                    if (this._buffersInvalid)
                        this.updateRTTBuffers();

                    return this._renderToTextureVertexBuffer;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "renderToScreenVertexBuffer", {
                get: function () {
                    if (this._buffersInvalid)
                        this.updateRTTBuffers();

                    return this._renderToScreenVertexBuffer;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "indexBuffer", {
                get: function () {
                    return this._indexBuffer;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "renderToTextureRect", {
                get: function () {
                    if (this._buffersInvalid)
                        this.updateRTTBuffers();

                    return this._renderToTextureRect;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "textureWidth", {
                get: function () {
                    return this._textureWidth;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RTTBufferManager.prototype, "textureHeight", {
                get: function () {
                    return this._textureHeight;
                },
                enumerable: true,
                configurable: true
            });

            RTTBufferManager.prototype.dispose = function () {
                RTTBufferManager.deleteRTTBufferManager(this._stage);

                if (this._indexBuffer) {
                    this._indexBuffer.dispose();
                    this._renderToScreenVertexBuffer.dispose();
                    this._renderToTextureVertexBuffer.dispose();
                    this._renderToScreenVertexBuffer = null;
                    this._renderToTextureVertexBuffer = null;
                    this._indexBuffer = null;
                }
            };

            // todo: place all this in a separate model, since it's used all over the place
            // maybe it even has a place in the core (together with screenRect etc)?
            // needs to be stored per view of course
            RTTBufferManager.prototype.updateRTTBuffers = function () {
                var context = this._stage.context;
                var textureVerts;
                var screenVerts;

                var x;
                var y;

                if (this._renderToTextureVertexBuffer == null)
                    this._renderToTextureVertexBuffer = context.createVertexBuffer(4, 5);

                if (this._renderToScreenVertexBuffer == null)
                    this._renderToScreenVertexBuffer = context.createVertexBuffer(4, 5);

                if (!this._indexBuffer) {
                    this._indexBuffer = context.createIndexBuffer(6);

                    this._indexBuffer.uploadFromArray([2, 1, 0, 3, 2, 0], 0, 6);
                }

                this._textureRatioX = x = Math.min(this._viewWidth / this._textureWidth, 1);
                this._textureRatioY = y = Math.min(this._viewHeight / this._textureHeight, 1);

                var u1 = (1 - x) * .5;
                var u2 = (x + 1) * .5;
                var v1 = (y + 1) * .5;
                var v2 = (1 - y) * .5;

                // last element contains indices for data per vertex that can be passed to the vertex shader if necessary (ie: frustum corners for deferred rendering)
                textureVerts = [-x, -y, u1, v1, 0, x, -y, u2, v1, 1, x, y, u2, v2, 2, -x, y, u1, v2, 3];

                screenVerts = [-1, -1, u1, v1, 0, 1, -1, u2, v1, 1, 1, 1, u2, v2, 2, -1, 1, u1, v2, 3];

                this._renderToTextureVertexBuffer.uploadFromArray(textureVerts, 0, 4);
                this._renderToScreenVertexBuffer.uploadFromArray(screenVerts, 0, 4);

                this._buffersInvalid = false;
            };
            return RTTBufferManager;
        })(away.events.EventDispatcher);
        managers.RTTBufferManager = RTTBufferManager;

        var RTTBufferManagerVO = (function () {
            function RTTBufferManagerVO() {
            }
            return RTTBufferManagerVO;
        })();
    })(away.managers || (away.managers = {}));
    var managers = away.managers;
})(away || (away = {}));

var SingletonEnforcer = (function () {
    function SingletonEnforcer() {
    }
    return SingletonEnforcer;
})();
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.render
    */
    (function (render) {
        var RendererEvent = away.events.RendererEvent;
        var StageEvent = away.events.StageEvent;
        var Matrix3D = away.geom.Matrix3D;
        var Point = away.geom.Point;
        var Rectangle = away.geom.Rectangle;

        var DefaultMaterialManager = away.materials.DefaultMaterialManager;

        var BillboardRenderable = away.pool.BillboardRenderable;

        var LineSubMeshRenderable = away.pool.LineSubMeshRenderable;
        var RenderablePool = away.pool.RenderablePool;

        var TriangleSubMeshRenderable = away.pool.TriangleSubMeshRenderable;

        var RenderableMergeSort = away.sort.RenderableMergeSort;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;

        var EntityCollector = away.traverse.EntityCollector;

        /**
        * RendererBase forms an abstract base class for classes that are used in the rendering pipeline to render the
        * contents of a partition
        *
        * @class away.render.RendererBase
        */
        var RendererBase = (function (_super) {
            __extends(RendererBase, _super);
            /**
            * Creates a new RendererBase object.
            */
            function RendererBase() {
                var _this = this;
                _super.call(this);
                this._viewPort = new Rectangle();
                this._pBackBufferInvalid = true;
                this._pDepthTextureInvalid = true;
                this._depthPrepass = false;
                this._backgroundR = 0;
                this._backgroundG = 0;
                this._backgroundB = 0;
                this._backgroundAlpha = 1;
                this._shareContext = false;
                this.textureRatioX = 1;
                this.textureRatioY = 1;
                this._pRttViewProjectionMatrix = new Matrix3D();
                this._localPos = new Point();
                this._globalPos = new Point();
                this._pScissorRect = new Rectangle();
                this._pNumTriangles = 0;

                this._onViewportUpdatedDelegate = function (event) {
                    return _this.onViewportUpdated(event);
                };

                this._billboardRenderablePool = RenderablePool.getPool(BillboardRenderable);
                this._triangleSubMeshRenderablePool = RenderablePool.getPool(TriangleSubMeshRenderable);
                this._lineSubMeshRenderablePool = RenderablePool.getPool(LineSubMeshRenderable);

                this._onContextUpdateDelegate = function (event) {
                    return _this.onContextUpdate(event);
                };

                //default sorting algorithm
                this.renderableSorter = new RenderableMergeSort();
            }
            Object.defineProperty(RendererBase.prototype, "numTriangles", {
                /**
                *
                */
                get: function () {
                    return this._pNumTriangles;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RendererBase.prototype, "viewPort", {
                /**
                * A viewPort rectangle equivalent of the Stage size and position.
                */
                get: function () {
                    return this._viewPort;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RendererBase.prototype, "scissorRect", {
                /**
                * A scissor rectangle equivalent of the view size and position.
                */
                get: function () {
                    return this._pScissorRect;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RendererBase.prototype, "x", {
                /**
                *
                */
                get: function () {
                    return this._localPos.x;
                },
                set: function (value) {
                    if (this.x == value)
                        return;

                    this._globalPos.x = this._localPos.x = value;

                    this.updateGlobalPos();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "y", {
                /**
                *
                */
                get: function () {
                    return this._localPos.y;
                },
                set: function (value) {
                    if (this.y == value)
                        return;

                    this._globalPos.y = this._localPos.y = value;

                    this.updateGlobalPos();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "width", {
                /**
                *
                */
                get: function () {
                    return this._width;
                },
                set: function (value) {
                    if (this._width == value)
                        return;

                    this._width = value;
                    this._pScissorRect.width = value;

                    if (this._pRttBufferManager)
                        this._pRttBufferManager.viewWidth = value;

                    this._pBackBufferInvalid = true;
                    this._pDepthTextureInvalid = true;

                    this.notifyScissorUpdate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "height", {
                /**
                *
                */
                get: function () {
                    return this._height;
                },
                set: function (value) {
                    if (this._height == value)
                        return;

                    this._height = value;
                    this._pScissorRect.height = value;

                    if (this._pRttBufferManager)
                        this._pRttBufferManager.viewHeight = value;

                    this._pBackBufferInvalid = true;
                    this._pDepthTextureInvalid = true;

                    this.notifyScissorUpdate();
                },
                enumerable: true,
                configurable: true
            });


            RendererBase.prototype._iCreateEntityCollector = function () {
                return new EntityCollector();
            };

            Object.defineProperty(RendererBase.prototype, "_iBackgroundR", {
                /**
                * The background color's red component, used when clearing.
                *
                * @private
                */
                get: function () {
                    return this._backgroundR;
                },
                set: function (value) {
                    if (this._backgroundR == value)
                        return;

                    this._backgroundR = value;

                    this._pBackBufferInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "_iBackgroundG", {
                /**
                * The background color's green component, used when clearing.
                *
                * @private
                */
                get: function () {
                    return this._backgroundG;
                },
                set: function (value) {
                    if (this._backgroundG == value)
                        return;

                    this._backgroundG = value;

                    this._pBackBufferInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "_iBackgroundB", {
                /**
                * The background color's blue component, used when clearing.
                *
                * @private
                */
                get: function () {
                    return this._backgroundB;
                },
                set: function (value) {
                    if (this._backgroundB == value)
                        return;

                    this._backgroundB = value;

                    this._pBackBufferInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RendererBase.prototype, "stage", {
                /**
                * The Stage that will provide the ContextGL used for rendering.
                */
                get: function () {
                    return this._pStage;
                },
                set: function (value) {
                    if (value == this._pStage)
                        return;

                    this.iSetStage(value);
                },
                enumerable: true,
                configurable: true
            });


            RendererBase.prototype.iSetStage = function (value) {
                if (this._pStage) {
                    this._pStage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
                    this._pStage.removeEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
                    this._pStage.removeEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);
                }

                if (!value) {
                    this._pStage = null;
                    this._pContext = null;
                } else {
                    this._pStage = value;
                    this._pStage.addEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
                    this._pStage.addEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
                    this._pStage.addEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);

                    /*
                    if (_backgroundImageRenderer)
                    _backgroundImageRenderer.stage = value;
                    */
                    if (this._pStage.context)
                        this._pContext = this._pStage.context;
                }

                this._pBackBufferInvalid = true;

                this.updateGlobalPos();
            };

            Object.defineProperty(RendererBase.prototype, "shareContext", {
                /**
                * Defers control of ContextGL clear() and present() calls to Stage, enabling multiple Stage frameworks
                * to share the same ContextGL object.
                */
                get: function () {
                    return this._shareContext;
                },
                set: function (value) {
                    if (this._shareContext == value)
                        return;

                    this._shareContext = value;

                    this.updateGlobalPos();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Disposes the resources used by the RendererBase.
            */
            RendererBase.prototype.dispose = function () {
                if (this._pRttBufferManager)
                    this._pRttBufferManager.dispose();

                this._pRttBufferManager = null;

                this._pStage.removeEventListener(StageEvent.CONTEXT_CREATED, this._onContextUpdateDelegate);
                this._pStage.removeEventListener(StageEvent.CONTEXT_RECREATED, this._onContextUpdateDelegate);
                this._pStage.removeEventListener(StageEvent.VIEWPORT_UPDATED, this._onViewportUpdatedDelegate);

                this._pStage = null;
                /*
                if (_backgroundImageRenderer) {
                _backgroundImageRenderer.dispose();
                _backgroundImageRenderer = null;
                }
                */
            };

            RendererBase.prototype.render = function (entityCollector) {
                this._viewportDirty = false;
                this._scissorDirty = false;
            };

            /**
            * Renders the potentially visible geometry to the back buffer or texture.
            * @param entityCollector The EntityCollector object containing the potentially visible geometry.
            * @param target An option target texture to render to.
            * @param surfaceSelector The index of a CubeTexture's face to render to.
            * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
            */
            RendererBase.prototype._iRender = function (entityCollector, target, scissorRect, surfaceSelector) {
                if (typeof target === "undefined") { target = null; }
                if (typeof scissorRect === "undefined") { scissorRect = null; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
                if (!this._pStage || !this._pContext || !entityCollector.entityHead)
                    return;

                this._pRttViewProjectionMatrix.copyFrom(entityCollector.camera.viewProjection);
                this._pRttViewProjectionMatrix.appendScale(this.textureRatioX, this.textureRatioY, 1);

                this.pExecuteRender(entityCollector, target, scissorRect, surfaceSelector);

                for (var i = 0; i < 8; ++i) {
                    this._pContext.setVertexBufferAt(i, null);
                    this._pContext.setTextureAt(i, null);
                }
            };

            RendererBase.prototype._iRenderCascades = function (entityCollector, target, numCascades, scissorRects, cameras) {
            };

            RendererBase.prototype.pCollectRenderables = function (entityCollector) {
                //reset head values
                this._pBlendedRenderableHead = null;
                this._pOpaqueRenderableHead = null;
                this._pNumTriangles = 0;

                //grab entity head
                var item = entityCollector.entityHead;

                //set temp values for entry point and camera forward vector
                this._pCamera = entityCollector.camera;
                this._iEntryPoint = this._pCamera.scenePosition;
                this._pCameraForward = this._pCamera.transform.forwardVector;

                while (item) {
                    item.entity._iCollectRenderables(this);
                    item = item.next;
                }

                //sort the resulting renderables
                this._pOpaqueRenderableHead = this.renderableSorter.sortOpaqueRenderables(this._pOpaqueRenderableHead);
                this._pBlendedRenderableHead = this.renderableSorter.sortBlendedRenderables(this._pBlendedRenderableHead);
            };

            /**
            * Renders the potentially visible geometry to the back buffer or texture. Only executed if everything is set up.
            *
            * @param entityCollector The EntityCollector object containing the potentially visible geometry.
            * @param target An option target texture to render to.
            * @param surfaceSelector The index of a CubeTexture's face to render to.
            * @param additionalClearMask Additional clear mask information, in case extra clear channels are to be omitted.
            */
            RendererBase.prototype.pExecuteRender = function (entityCollector, target, scissorRect, surfaceSelector) {
                if (typeof target === "undefined") { target = null; }
                if (typeof scissorRect === "undefined") { scissorRect = null; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
                this._pContext.setRenderTarget(target, true, surfaceSelector);

                if ((target || !this._shareContext) && !this._depthPrepass)
                    this._pContext.clear(this._backgroundR, this._backgroundG, this._backgroundB, this._backgroundAlpha, 1, 0);

                this._pContext.setDepthTest(false, ContextGLCompareMode.ALWAYS);

                this._pStage.scissorRect = scissorRect;

                /*
                if (_backgroundImageRenderer)
                _backgroundImageRenderer.render();
                */
                this.pDraw(entityCollector, target);

                //line required for correct rendering when using away3d with starling. DO NOT REMOVE UNLESS STARLING INTEGRATION IS RETESTED!
                //this._pContext.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL); //oopsie
                if (!this._shareContext) {
                    if (this._snapshotRequired && this._snapshotBitmapData) {
                        this._pContext.drawToBitmapData(this._snapshotBitmapData);
                        this._snapshotRequired = false;
                    }
                }

                this._pStage.scissorRect = null;
            };

            /*
            * Will draw the renderer's output on next render to the provided bitmap data.
            * */
            RendererBase.prototype.queueSnapshot = function (bmd) {
                this._snapshotRequired = true;
                this._snapshotBitmapData = bmd;
            };

            /**
            * Performs the actual drawing of geometry to the target.
            * @param entityCollector The EntityCollector object containing the potentially visible geometry.
            */
            RendererBase.prototype.pDraw = function (entityCollector, target) {
                throw new away.errors.AbstractMethodError();
            };

            /**
            * Assign the context once retrieved
            */
            RendererBase.prototype.onContextUpdate = function (event) {
                this._pContext = this._pStage.context;
            };

            Object.defineProperty(RendererBase.prototype, "_iBackgroundAlpha", {
                get: function () {
                    return this._backgroundAlpha;
                },
                set: function (value) {
                    if (this._backgroundAlpha == value)
                        return;

                    this._backgroundAlpha = value;

                    this._pBackBufferInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            /*
            public get iBackground():Texture2DBase
            {
            return this._background;
            }
            */
            /*
            public set iBackground(value:Texture2DBase)
            {
            if (this._backgroundImageRenderer && !value) {
            this._backgroundImageRenderer.dispose();
            this._backgroundImageRenderer = null;
            }
            
            if (!this._backgroundImageRenderer && value)
            {
            
            this._backgroundImageRenderer = new BackgroundImageRenderer(this._pStage);
            
            }
            
            
            this._background = value;
            
            if (this._backgroundImageRenderer)
            this._backgroundImageRenderer.texture = value;
            }
            */
            /*
            public get backgroundImageRenderer():BackgroundImageRenderer
            {
            return _backgroundImageRenderer;
            }
            */
            /**
            * @private
            */
            RendererBase.prototype.notifyScissorUpdate = function () {
                if (this._scissorDirty)
                    return;

                this._scissorDirty = true;

                if (!this._scissorUpdated)
                    this._scissorUpdated = new RendererEvent(RendererEvent.SCISSOR_UPDATED);

                this.dispatchEvent(this._scissorUpdated);
            };

            /**
            * @private
            */
            RendererBase.prototype.notifyViewportUpdate = function () {
                if (this._viewportDirty)
                    return;

                this._viewportDirty = true;

                if (!this._viewPortUpdated)
                    this._viewPortUpdated = new RendererEvent(RendererEvent.VIEWPORT_UPDATED);

                this.dispatchEvent(this._viewPortUpdated);
            };

            /**
            *
            */
            RendererBase.prototype.onViewportUpdated = function (event) {
                this._viewPort = this._pStage.viewPort;

                //TODO stop firing viewport updated for every stagegl viewport change
                if (this._shareContext) {
                    this._pScissorRect.x = this._globalPos.x - this._pStage.x;
                    this._pScissorRect.y = this._globalPos.y - this._pStage.y;
                    this.notifyScissorUpdate();
                }

                this.notifyViewportUpdate();
            };

            /**
            *
            */
            RendererBase.prototype.updateGlobalPos = function () {
                if (this._shareContext) {
                    this._pScissorRect.x = this._globalPos.x - this._viewPort.x;
                    this._pScissorRect.y = this._globalPos.y - this._viewPort.y;
                } else {
                    this._pScissorRect.x = 0;
                    this._pScissorRect.y = 0;
                    this._viewPort.x = this._globalPos.x;
                    this._viewPort.y = this._globalPos.y;
                }

                this.notifyScissorUpdate();
            };

            /**
            *
            * @param billboard
            * @protected
            */
            RendererBase.prototype.applyBillboard = function (billboard) {
                this._applyRenderable(this._billboardRenderablePool.getItem(billboard));
            };

            /**
            *
            * @param triangleSubMesh
            */
            RendererBase.prototype.applyTriangleSubMesh = function (triangleSubMesh) {
                this._applyRenderable(this._triangleSubMeshRenderablePool.getItem(triangleSubMesh));
            };

            /**
            *
            * @param lineSubMesh
            */
            RendererBase.prototype.applyLineSubMesh = function (lineSubMesh) {
                this._applyRenderable(this._lineSubMeshRenderablePool.getItem(lineSubMesh));
            };

            /**
            *
            * @param renderable
            * @protected
            */
            RendererBase.prototype._applyRenderable = function (renderable) {
                var material = renderable.materialOwner.material;
                var entity = renderable.sourceEntity;
                var position = entity.scenePosition;

                if (!material)
                    material = DefaultMaterialManager.getDefaultMaterial(renderable.materialOwner);

                //update material if invalidated
                material.iUpdateMaterial();

                //set ids for faster referencing
                renderable.material = material;
                renderable.materialId = material._iMaterialId;
                renderable.renderOrderId = material._iRenderOrderId;
                renderable.cascaded = false;

                // project onto camera's z-axis
                position = this._iEntryPoint.subtract(position);
                renderable.zIndex = entity.zOffset + position.dotProduct(this._pCameraForward);

                //store reference to scene transform
                renderable.renderSceneTransform = renderable.sourceEntity.getRenderSceneTransform(this._pCamera);

                if (material.requiresBlending) {
                    renderable.next = this._pBlendedRenderableHead;
                    this._pBlendedRenderableHead = renderable;
                } else {
                    renderable.next = this._pOpaqueRenderableHead;
                    this._pOpaqueRenderableHead = renderable;
                }

                this._pNumTriangles += renderable.numTriangles;

                //handle any overflow for renderables with data that exceeds GPU limitations
                if (renderable.overflow)
                    this._applyRenderable(renderable.overflow);
            };
            return RendererBase;
        })(away.events.EventDispatcher);
        render.RendererBase = RendererBase;
    })(away.render || (away.render = {}));
    var render = away.render;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.render
    */
    (function (render) {
        var ContextGLBlendFactor = away.stagegl.ContextGLBlendFactor;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;

        /**
        * The DepthRenderer class renders 32-bit depth information encoded as RGBA
        *
        * @class away.render.DepthRenderer
        */
        var DepthRenderer = (function (_super) {
            __extends(DepthRenderer, _super);
            /**
            * Creates a new DepthRenderer object.
            * @param renderBlended Indicates whether semi-transparent objects should be rendered.
            * @param distanceBased Indicates whether the written depth value is distance-based or projected depth-based
            */
            function DepthRenderer(renderBlended, distanceBased) {
                if (typeof renderBlended === "undefined") { renderBlended = false; }
                if (typeof distanceBased === "undefined") { distanceBased = false; }
                _super.call(this);

                this._renderBlended = renderBlended;
                this._distanceBased = distanceBased;
                this._iBackgroundR = 1;
                this._iBackgroundG = 1;
                this._iBackgroundB = 1;
            }
            Object.defineProperty(DepthRenderer.prototype, "disableColor", {
                get: function () {
                    return this._disableColor;
                },
                set: function (value) {
                    this._disableColor = value;
                },
                enumerable: true,
                configurable: true
            });


            DepthRenderer.prototype._iRenderCascades = function (entityCollector, target, numCascades, scissorRects, cameras) {
                this.pCollectRenderables(entityCollector);

                this._pContext.setRenderTarget(target, true, 0);
                this._pContext.clear(1, 1, 1, 1, 1, 0);

                this._pContext.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);
                this._pContext.setDepthTest(true, ContextGLCompareMode.LESS);

                var head = this._pOpaqueRenderableHead;

                var first = true;

                for (var i = numCascades - 1; i >= 0; --i) {
                    this._pStage.scissorRect = scissorRects[i];
                    this.drawCascadeRenderables(head, cameras[i], first ? null : cameras[i].frustumPlanes);
                    first = false;
                }

                if (this._activeMaterial)
                    this._activeMaterial.iDeactivateForDepth(this._pStage);

                this._activeMaterial = null;

                //line required for correct rendering when using away3d with starling. DO NOT REMOVE UNLESS STARLING INTEGRATION IS RETESTED!
                this._pContext.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL);

                this._pStage.scissorRect = null;
            };

            DepthRenderer.prototype.drawCascadeRenderables = function (renderable, camera, cullPlanes) {
                var material;

                while (renderable) {
                    if (renderable.cascaded) {
                        renderable = renderable.next;
                        continue;
                    }

                    var entity = renderable.sourceEntity;

                    // if completely in front, it will fall in a different cascade
                    // do not use near and far planes
                    if (!cullPlanes || entity.worldBounds.isInFrustum(cullPlanes, 4)) {
                        material = renderable.materialOwner.material;

                        if (this._activeMaterial != material) {
                            if (this._activeMaterial)
                                this._activeMaterial.iDeactivateForDepth(this._pStage);

                            this._activeMaterial = material;
                            this._activeMaterial.iActivateForDepth(this._pStage, camera, false);
                        }

                        this._activeMaterial.iRenderDepth(renderable, this._pStage, camera, camera.viewProjection);
                    } else {
                        renderable.cascaded = true;
                    }

                    renderable = renderable.next;
                }
            };

            /**
            * @inheritDoc
            */
            DepthRenderer.prototype.pDraw = function (entityCollector, target) {
                this.pCollectRenderables(entityCollector);

                this._pContext.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);

                this._pContext.setDepthTest(true, ContextGLCompareMode.LESS);

                this.drawRenderables(this._pOpaqueRenderableHead, entityCollector);

                if (this._disableColor)
                    this._pContext.setColorMask(false, false, false, false);

                if (this._renderBlended)
                    this.drawRenderables(this._pBlendedRenderableHead, entityCollector);

                if (this._activeMaterial)
                    this._activeMaterial.iDeactivateForDepth(this._pStage);

                if (this._disableColor)
                    this._pContext.setColorMask(true, true, true, true);

                this._activeMaterial = null;
            };

            /**
            * Draw a list of renderables.
            * @param renderables The renderables to draw.
            * @param entityCollector The EntityCollector containing all potentially visible information.
            */
            DepthRenderer.prototype.drawRenderables = function (renderable, entityCollector) {
                var camera = entityCollector.camera;
                var renderable2;

                while (renderable) {
                    this._activeMaterial = renderable.materialOwner.material;

                    // otherwise this would result in depth rendered anyway because fragment shader kil is ignored
                    if (this._disableColor && this._activeMaterial.iHasDepthAlphaThreshold()) {
                        renderable2 = renderable;

                        do {
                            renderable2 = renderable2.next;
                        } while(renderable2 && renderable2.materialOwner.material == this._activeMaterial);
                    } else {
                        this._activeMaterial.iActivateForDepth(this._pStage, camera, this._distanceBased);
                        renderable2 = renderable;
                        do {
                            this._activeMaterial.iRenderDepth(renderable2, this._pStage, camera, this._pRttViewProjectionMatrix);
                            renderable2 = renderable2.next;
                        } while(renderable2 && renderable2.materialOwner.material == this._activeMaterial);

                        this._activeMaterial.iDeactivateForDepth(this._pStage);
                    }

                    renderable = renderable2;
                }
            };
            return DepthRenderer;
        })(render.RendererBase);
        render.DepthRenderer = DepthRenderer;
    })(away.render || (away.render = {}));
    var render = away.render;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.render
    */
    (function (render) {
        /**
        * @class away.render.Filter3DRenderer
        */
        var Filter3DRenderer = (function () {
            function Filter3DRenderer(stage) {
                this._filterSizesInvalid = true;
                this._onRTTResizeDelegate = away.utils.Delegate.create(this, this.onRTTResize);

                this._stage = stage;
                this._rttManager = away.managers.RTTBufferManager.getInstance(stage);
                this._rttManager.addEventListener(away.events.Event.RESIZE, this._onRTTResizeDelegate);
            }
            Filter3DRenderer.prototype.onRTTResize = function (event) {
                this._filterSizesInvalid = true;
            };

            Object.defineProperty(Filter3DRenderer.prototype, "requireDepthRender", {
                get: function () {
                    return this._requireDepthRender;
                },
                enumerable: true,
                configurable: true
            });

            Filter3DRenderer.prototype.getMainInputTexture = function (stage) {
                if (this._filterTasksInvalid) {
                    this.updateFilterTasks(stage);
                }

                return this._mainInputTexture;
            };

            Object.defineProperty(Filter3DRenderer.prototype, "filters", {
                get: function () {
                    return this._filters;
                },
                set: function (value) {
                    this._filters = value;

                    this._filterTasksInvalid = true;

                    this._requireDepthRender = false;

                    if (!this._filters) {
                        return;
                    }

                    for (var i = 0; i < this._filters.length; ++i) {
                        // TODO: check logic:
                        // this._requireDepthRender ||=  Boolean ( this._filters[i].requireDepthRender )
                        var s = this._filters[i];
                        var b = (s.requireDepthRender == null) ? false : s.requireDepthRender;

                        this._requireDepthRender = this._requireDepthRender || b;
                    }

                    this._filterSizesInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Filter3DRenderer.prototype.updateFilterTasks = function (stage) {
                var len;

                if (this._filterSizesInvalid) {
                    this.updateFilterSizes();
                }

                if (!this._filters) {
                    this._tasks = null;
                    return;
                }

                this._tasks = new Array();

                len = this._filters.length - 1;

                var filter;

                for (var i = 0; i <= len; ++i) {
                    // make sure all internal tasks are linked together
                    filter = this._filters[i];

                    // TODO: check logic
                    // filter.setRenderTargets(i == len? null : Filter3DBase(_filters[i + 1]).getMainInputTexture(stage), stage);
                    filter.setRenderTargets(i == len ? null : this._filters[i + 1].getMainInputTexture(stage), stage);

                    this._tasks = this._tasks.concat(filter.tasks);
                }

                this._mainInputTexture = this._filters[0].getMainInputTexture(stage);
            };

            Filter3DRenderer.prototype.render = function (stage, camera, depthTexture) {
                var len;
                var i;
                var task;
                var context = stage.context;

                var indexBuffer = this._rttManager.indexBuffer;

                var vertexBuffer = this._rttManager.renderToTextureVertexBuffer;

                if (!this._filters) {
                    return;
                }

                if (this._filterSizesInvalid) {
                    this.updateFilterSizes();
                }

                if (this._filterTasksInvalid) {
                    this.updateFilterTasks(stage);
                }

                len = this._filters.length;

                for (i = 0; i < len; ++i) {
                    this._filters[i].update(stage, camera);
                }

                len = this._tasks.length;

                if (len > 1) {
                    context.setVertexBufferAt(0, vertexBuffer, 0, away.stagegl.ContextGLVertexBufferFormat.FLOAT_2);
                    context.setVertexBufferAt(1, vertexBuffer, 2, away.stagegl.ContextGLVertexBufferFormat.FLOAT_2);
                }

                for (i = 0; i < len; ++i) {
                    task = this._tasks[i];

                    //stage.setRenderTarget(task.target); //TODO
                    if (!task.target) {
                        stage.scissorRect = null;
                        vertexBuffer = this._rttManager.renderToScreenVertexBuffer;
                        context.setVertexBufferAt(0, vertexBuffer, 0, away.stagegl.ContextGLVertexBufferFormat.FLOAT_2);
                        context.setVertexBufferAt(1, vertexBuffer, 2, away.stagegl.ContextGLVertexBufferFormat.FLOAT_2);
                    }

                    context.setTextureAt(0, task.getMainInputTexture(stage));
                    context.setProgram(task.getProgram(stage));
                    context.clear(0.0, 0.0, 0.0, 0.0);

                    task.activate(stage, camera, depthTexture);

                    context.setBlendFactors(away.stagegl.ContextGLBlendFactor.ONE, away.stagegl.ContextGLBlendFactor.ZERO);
                    context.drawTriangles(indexBuffer, 0, 2);

                    task.deactivate(stage);
                }

                context.setTextureAt(0, null);
                context.setVertexBufferAt(0, null);
                context.setVertexBufferAt(1, null);
            };

            Filter3DRenderer.prototype.updateFilterSizes = function () {
                for (var i = 0; i < this._filters.length; ++i) {
                    this._filters[i].textureWidth = this._rttManager.textureWidth;
                    this._filters[i].textureHeight = this._rttManager.textureHeight;
                }

                this._filterSizesInvalid = true;
            };

            Filter3DRenderer.prototype.dispose = function () {
                this._rttManager.removeEventListener(away.events.Event.RESIZE, this._onRTTResizeDelegate);
                this._rttManager = null;
                this._stage = null;
            };
            return Filter3DRenderer;
        })();
        render.Filter3DRenderer = Filter3DRenderer;
    })(away.render || (away.render = {}));
    var render = away.render;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * DependencyCounter keeps track of the number of dependencies for "named registers" used across methods.
        * Named registers are that are not necessarily limited to a single method. They are created by the compiler and
        * passed on to methods. The compiler uses the results to reserve usages through RegisterPool, which can be removed
        * each time a method has been compiled into the shader.
        *
        * @see RegisterPool.addUsage
        */
        var DependencyCounter = (function () {
            /**
            * Creates a new MethodDependencyCounter object.
            */
            function DependencyCounter(profile) {
                this._usesGlobalPosFragment = false;
                this._profile = profile;
            }
            /**
            * Clears dependency counts for all registers. Called when recompiling a pass.
            */
            DependencyCounter.prototype.reset = function () {
                this._projectionDependencies = 0;
                this._normalDependencies = 0;
                this._viewDirDependencies = 0;
                this._uvDependencies = 0;
                this._secondaryUVDependencies = 0;
                this._globalPosDependencies = 0;
                this._tangentDependencies = 0;
                this._usesGlobalPosFragment = false;
            };

            /**
            * Sets the amount of lights that have a position associated with them.
            * @param numPointLights The amount of point lights.
            * @param combinedLightSources The light source types used by the material.
            */
            DependencyCounter.prototype.setLights = function (numPointLights, usesLights, usesLightsForSpecular, usesProbesForSpecular) {
                this._numPointLights = numPointLights;
                this._usesLights = usesLights;
                this._usesSpecular = usesLightsForSpecular || usesProbesForSpecular;
            };

            /**
            * Increases dependency counters for the named registers listed as required by the given DependencyVO.
            * @param dependencyVO the DependencyVO object for which to include dependencies.
            */
            DependencyCounter.prototype.includeDependencyVO = function (dependencyVO) {
                if (dependencyVO.needsProjection)
                    ++this._projectionDependencies;

                if (dependencyVO.needsGlobalVertexPos) {
                    ++this._globalPosDependencies;

                    if (dependencyVO.needsGlobalFragmentPos)
                        this._usesGlobalPosFragment = true;
                } else if (dependencyVO.needsGlobalFragmentPos) {
                    ++this._globalPosDependencies;
                    this._usesGlobalPosFragment = true;
                }

                if (dependencyVO.needsNormals)
                    ++this._normalDependencies;

                if (dependencyVO.needsTangents)
                    ++this._tangentDependencies;

                if (dependencyVO.needsView)
                    ++this._viewDirDependencies;

                if (dependencyVO.needsUV)
                    ++this._uvDependencies;

                if (dependencyVO.needsSecondaryUV)
                    ++this._secondaryUVDependencies;
            };

            Object.defineProperty(DependencyCounter.prototype, "profile", {
                get: function () {
                    return this._profile;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "tangentDependencies", {
                /**
                * The amount of tangent vector dependencies (fragment shader).
                */
                get: function () {
                    return this._tangentDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "usesGlobalPosFragment", {
                /**
                * Indicates whether there are any dependencies on the world-space position vector.
                */
                get: function () {
                    return this._usesGlobalPosFragment;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "projectionDependencies", {
                /**
                * The amount of dependencies on the projected position.
                */
                get: function () {
                    return this._projectionDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "normalDependencies", {
                /**
                * The amount of dependencies on the normal vector.
                */
                get: function () {
                    return this._normalDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "viewDirDependencies", {
                /**
                * The amount of dependencies on the view direction.
                */
                get: function () {
                    return this._viewDirDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "uvDependencies", {
                /**
                * The amount of dependencies on the primary UV coordinates.
                */
                get: function () {
                    return this._uvDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "secondaryUVDependencies", {
                /**
                * The amount of dependencies on the secondary UV coordinates.
                */
                get: function () {
                    return this._secondaryUVDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "globalPosDependencies", {
                /**
                * The amount of dependencies on the global position. This can be 0 while hasGlobalPosDependencies is true when
                * the global position is used as a temporary value (fe to calculate the view direction)
                */
                get: function () {
                    return this._globalPosDependencies;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DependencyCounter.prototype, "usesSpecular", {
                get: function () {
                    return this._usesSpecular;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Adds any external world space dependencies, used to force world space calculations.
            */
            DependencyCounter.prototype.addWorldSpaceDependencies = function (fragmentLights) {
                if (this._viewDirDependencies > 0)
                    ++this._globalPosDependencies;

                if (this._numPointLights > 0 && this._usesLights) {
                    ++this._globalPosDependencies;

                    if (fragmentLights)
                        this._usesGlobalPosFragment = true;
                }
            };
            return DependencyCounter;
        })();
        materials.DependencyCounter = DependencyCounter;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * DependencyVO contains data for a given shader object for the use within a single material.
        * This allows shader methods to be shared across materials while their non-public state differs.
        */
        var DependencyVO = (function () {
            /**
            * Creates a new DependencyVO object.
            */
            function DependencyVO(method) {
                if (typeof method === "undefined") { method = null; }
                this.useMethod = true;
                this.useLightFallOff = true;
                this._method = method;
            }
            Object.defineProperty(DependencyVO.prototype, "method", {
                get: function () {
                    return this._method;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Resets the values of the value object to their "unused" state.
            */
            DependencyVO.prototype.reset = function () {
                this._method.iReset();

                this.texturesIndex = -1;
                this.vertexConstantsIndex = -1;
                this.fragmentConstantsIndex = -1;

                this.useMipmapping = true;
                this.useSmoothTextures = true;
                this.repeatTextures = false;

                this.needsProjection = false;
                this.needsView = false;
                this.needsNormals = false;
                this.needsTangents = false;
                this.needsUV = false;
                this.needsSecondaryUV = false;
                this.needsGlobalVertexPos = false;
                this.needsGlobalFragmentPos = false;

                this.numLights = 0;
                this.useLightFallOff = true;
            };
            return DependencyVO;
        })();
        materials.DependencyVO = DependencyVO;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * RegisterPool is used by the shader compilation process to keep track of which registers of a certain type are
        * currently used and should not be allowed to be written to. Either entire registers can be requested and locked,
        * or single components (x, y, z, w) of a single register.
        * It is used by ShaderRegisterCache to track usages of individual register types.
        *
        * @see away.materials.ShaderRegisterCache
        */
        var RegisterPool = (function () {
            /**
            * Creates a new RegisterPool object.
            * @param regName The base name of the register type ("ft" for fragment temporaries, "vc" for vertex constants, etc)
            * @param regCount The amount of available registers of this type.
            * @param persistent Whether or not registers, once reserved, can be freed again. For example, temporaries are not persistent, but constants are.
            */
            function RegisterPool(regName, regCount, persistent) {
                if (typeof persistent === "undefined") { persistent = true; }
                this._regName = regName;
                this._regCount = regCount;
                this._persistent = persistent;
                this.initRegisters(regName, regCount);
            }
            /**
            * Retrieve an entire vector register that's still available.
            */
            RegisterPool.prototype.requestFreeVectorReg = function () {
                for (var i = 0; i < this._regCount; ++i) {
                    if (!this.isRegisterUsed(i)) {
                        if (this._persistent)
                            this._usedVectorCount[i]++;

                        return this._vectorRegisters[i];
                    }
                }

                throw new Error("Register overflow!");
            };

            /**
            * Retrieve a single vector component that's still available.
            */
            RegisterPool.prototype.requestFreeRegComponent = function () {
                for (var i = 0; i < this._regCount; ++i) {
                    if (this._usedVectorCount[i] > 0)
                        continue;

                    for (var j = 0; j < 4; ++j) {
                        if (this._usedSingleCount[j][i] == 0) {
                            if (this._persistent)
                                this._usedSingleCount[j][i]++;

                            return this._registerComponents[j][i];
                        }
                    }
                }

                throw new Error("Register overflow!");
            };

            /**
            * Marks a register as used, so it cannot be retrieved. The register won't be able to be used until removeUsage
            * has been called usageCount times again.
            * @param register The register to mark as used.
            * @param usageCount The amount of usages to add.
            */
            RegisterPool.prototype.addUsage = function (register, usageCount) {
                if (register._component > -1)
                    this._usedSingleCount[register._component][register.index] += usageCount;
                else
                    this._usedVectorCount[register.index] += usageCount;
            };

            /**
            * Removes a usage from a register. When usages reach 0, the register is freed again.
            * @param register The register for which to remove a usage.
            */
            RegisterPool.prototype.removeUsage = function (register) {
                if (register._component > -1) {
                    if (--this._usedSingleCount[register._component][register.index] < 0)
                        throw new Error("More usages removed than exist!");
                } else {
                    if (--this._usedVectorCount[register.index] < 0)
                        throw new Error("More usages removed than exist!");
                }
            };

            /**
            * Disposes any resources used by the current RegisterPool object.
            */
            RegisterPool.prototype.dispose = function () {
                this._vectorRegisters = null;
                this._registerComponents = null;
                this._usedSingleCount = null;
                this._usedVectorCount = null;
            };

            /**
            * Indicates whether or not any registers are in use.
            */
            RegisterPool.prototype.hasRegisteredRegs = function () {
                for (var i = 0; i < this._regCount; ++i)
                    if (this.isRegisterUsed(i))
                        return true;

                return false;
            };

            /**
            * Initializes all registers.
            */
            RegisterPool.prototype.initRegisters = function (regName, regCount) {
                var hash = RegisterPool._initPool(regName, regCount);

                this._vectorRegisters = RegisterPool._regPool[hash];
                this._registerComponents = RegisterPool._regCompsPool[hash];

                this._usedVectorCount = this._initArray(Array(regCount), 0);

                this._usedSingleCount = new Array(4);
                this._usedSingleCount[0] = this._initArray(new Array(regCount), 0);
                this._usedSingleCount[1] = this._initArray(new Array(regCount), 0);
                this._usedSingleCount[2] = this._initArray(new Array(regCount), 0);
                this._usedSingleCount[3] = this._initArray(new Array(regCount), 0);
            };

            RegisterPool._initPool = function (regName, regCount) {
                var hash = regName + regCount;

                if (RegisterPool._regPool[hash] != undefined)
                    return hash;

                var vectorRegisters = new Array(regCount);
                RegisterPool._regPool[hash] = vectorRegisters;

                var registerComponents = [
                    [],
                    [],
                    [],
                    []
                ];
                RegisterPool._regCompsPool[hash] = registerComponents;

                for (var i = 0; i < regCount; ++i) {
                    vectorRegisters[i] = new materials.ShaderRegisterElement(regName, i);

                    for (var j = 0; j < 4; ++j)
                        registerComponents[j][i] = new materials.ShaderRegisterElement(regName, i, j);
                }

                return hash;
            };

            /**
            * Check if the temp register is either used for single or vector use
            */
            RegisterPool.prototype.isRegisterUsed = function (index) {
                if (this._usedVectorCount[index] > 0)
                    return true;

                for (var i = 0; i < 4; ++i)
                    if (this._usedSingleCount[i][index] > 0)
                        return true;

                return false;
            };

            RegisterPool.prototype._initArray = function (a, val) {
                var l = a.length;

                for (var c = 0; c < l; c++)
                    a[c] = val;

                return a;
            };
            RegisterPool._regPool = new Object();
            RegisterPool._regCompsPool = new Object();
            return RegisterPool;
        })();
        materials.RegisterPool = RegisterPool;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShaderRegister Cache provides the usage management system for all registers during shading compilation.
        */
        var ShaderRegisterCache = (function () {
            /**
            * Create a new ShaderRegisterCache object.
            *
            * @param profile The compatibility profile used by the renderer.
            */
            function ShaderRegisterCache(profile) {
                this._numUsedVertexConstants = 0;
                this._numUsedFragmentConstants = 0;
                this._numUsedStreams = 0;
                this._numUsedTextures = 0;
                this._numUsedVaryings = 0;
                this._profile = profile;
            }
            /**
            * Resets all registers.
            */
            ShaderRegisterCache.prototype.reset = function () {
                this._fragmentTempCache = new materials.RegisterPool("ft", 8, false);
                this._vertexTempCache = new materials.RegisterPool("vt", 8, false);
                this._varyingCache = new materials.RegisterPool("v", 8);
                this._textureCache = new materials.RegisterPool("fs", 8);
                this._vertexAttributesCache = new materials.RegisterPool("va", 8);
                this._fragmentConstantsCache = new materials.RegisterPool("fc", 28);
                this._vertexConstantsCache = new materials.RegisterPool("vc", 128);
                this._fragmentOutputRegister = new materials.ShaderRegisterElement("oc", -1);
                this._vertexOutputRegister = new materials.ShaderRegisterElement("op", -1);
                this._numUsedVertexConstants = 0;
                this._numUsedStreams = 0;
                this._numUsedTextures = 0;
                this._numUsedVaryings = 0;
                this._numUsedFragmentConstants = 0;

                var i;

                for (i = 0; i < this._vertexAttributesOffset; ++i)
                    this.getFreeVertexAttribute();

                for (i = 0; i < this._vertexConstantOffset; ++i)
                    this.getFreeVertexConstant();

                for (i = 0; i < this._varyingsOffset; ++i)
                    this.getFreeVarying();

                for (i = 0; i < this._fragmentConstantOffset; ++i)
                    this.getFreeFragmentConstant();
            };

            /**
            * Disposes all resources used.
            */
            ShaderRegisterCache.prototype.dispose = function () {
                this._fragmentTempCache.dispose();
                this._vertexTempCache.dispose();
                this._varyingCache.dispose();
                this._fragmentConstantsCache.dispose();
                this._vertexAttributesCache.dispose();

                this._fragmentTempCache = null;
                this._vertexTempCache = null;
                this._varyingCache = null;
                this._fragmentConstantsCache = null;
                this._vertexAttributesCache = null;
                this._fragmentOutputRegister = null;
                this._vertexOutputRegister = null;
            };

            /**
            * Marks a fragment temporary register as used, so it cannot be retrieved. The register won't be able to be used until removeUsage
            * has been called usageCount times again.
            * @param register The register to mark as used.
            * @param usageCount The amount of usages to add.
            */
            ShaderRegisterCache.prototype.addFragmentTempUsages = function (register, usageCount) {
                this._fragmentTempCache.addUsage(register, usageCount);
            };

            /**
            * Removes a usage from a fragment temporary register. When usages reach 0, the register is freed again.
            * @param register The register for which to remove a usage.
            */
            ShaderRegisterCache.prototype.removeFragmentTempUsage = function (register) {
                this._fragmentTempCache.removeUsage(register);
            };

            /**
            * Marks a vertex temporary register as used, so it cannot be retrieved. The register won't be able to be used
            * until removeUsage has been called usageCount times again.
            * @param register The register to mark as used.
            * @param usageCount The amount of usages to add.
            */
            ShaderRegisterCache.prototype.addVertexTempUsages = function (register, usageCount) {
                this._vertexTempCache.addUsage(register, usageCount);
            };

            /**
            * Removes a usage from a vertex temporary register. When usages reach 0, the register is freed again.
            * @param register The register for which to remove a usage.
            */
            ShaderRegisterCache.prototype.removeVertexTempUsage = function (register) {
                this._vertexTempCache.removeUsage(register);
            };

            /**
            * Retrieve an entire fragment temporary register that's still available. The register won't be able to be used until removeUsage
            * has been called usageCount times again.
            */
            ShaderRegisterCache.prototype.getFreeFragmentVectorTemp = function () {
                return this._fragmentTempCache.requestFreeVectorReg();
            };

            /**
            * Retrieve a single component from a fragment temporary register that's still available.
            */
            ShaderRegisterCache.prototype.getFreeFragmentSingleTemp = function () {
                return this._fragmentTempCache.requestFreeRegComponent();
            };

            /**
            * Retrieve an available varying register
            */
            ShaderRegisterCache.prototype.getFreeVarying = function () {
                ++this._numUsedVaryings;
                return this._varyingCache.requestFreeVectorReg();
            };

            /**
            * Retrieve an available fragment constant register
            */
            ShaderRegisterCache.prototype.getFreeFragmentConstant = function () {
                ++this._numUsedFragmentConstants;
                return this._fragmentConstantsCache.requestFreeVectorReg();
            };

            /**
            * Retrieve an available vertex constant register
            */
            ShaderRegisterCache.prototype.getFreeVertexConstant = function () {
                ++this._numUsedVertexConstants;
                return this._vertexConstantsCache.requestFreeVectorReg();
            };

            /**
            * Retrieve an entire vertex temporary register that's still available.
            */
            ShaderRegisterCache.prototype.getFreeVertexVectorTemp = function () {
                return this._vertexTempCache.requestFreeVectorReg();
            };

            /**
            * Retrieve a single component from a vertex temporary register that's still available.
            */
            ShaderRegisterCache.prototype.getFreeVertexSingleTemp = function () {
                return this._vertexTempCache.requestFreeRegComponent();
            };

            /**
            * Retrieve an available vertex attribute register
            */
            ShaderRegisterCache.prototype.getFreeVertexAttribute = function () {
                ++this._numUsedStreams;
                return this._vertexAttributesCache.requestFreeVectorReg();
            };

            /**
            * Retrieve an available texture register
            */
            ShaderRegisterCache.prototype.getFreeTextureReg = function () {
                ++this._numUsedTextures;
                return this._textureCache.requestFreeVectorReg();
            };

            Object.defineProperty(ShaderRegisterCache.prototype, "vertexConstantOffset", {
                /**
                * Indicates the start index from which to retrieve vertex constants.
                */
                get: function () {
                    return this._vertexConstantOffset;
                },
                set: function (vertexConstantOffset) {
                    this._vertexConstantOffset = vertexConstantOffset;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderRegisterCache.prototype, "vertexAttributesOffset", {
                /**
                * Indicates the start index from which to retrieve vertex attributes.
                */
                get: function () {
                    return this._vertexAttributesOffset;
                },
                set: function (value) {
                    this._vertexAttributesOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderRegisterCache.prototype, "varyingsOffset", {
                /**
                * Indicates the start index from which to retrieve varying registers.
                */
                get: function () {
                    return this._varyingsOffset;
                },
                set: function (value) {
                    this._varyingsOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderRegisterCache.prototype, "fragmentConstantOffset", {
                /**
                * Indicates the start index from which to retrieve fragment constants.
                */
                get: function () {
                    return this._fragmentConstantOffset;
                },
                set: function (value) {
                    this._fragmentConstantOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderRegisterCache.prototype, "fragmentOutputRegister", {
                /**
                * The fragment output register.
                */
                get: function () {
                    return this._fragmentOutputRegister;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterCache.prototype, "numUsedVertexConstants", {
                /**
                * The amount of used vertex constant registers.
                */
                get: function () {
                    return this._numUsedVertexConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterCache.prototype, "numUsedFragmentConstants", {
                /**
                * The amount of used fragment constant registers.
                */
                get: function () {
                    return this._numUsedFragmentConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterCache.prototype, "numUsedStreams", {
                /**
                * The amount of used vertex streams.
                */
                get: function () {
                    return this._numUsedStreams;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterCache.prototype, "numUsedTextures", {
                /**
                * The amount of used texture slots.
                */
                get: function () {
                    return this._numUsedTextures;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterCache.prototype, "numUsedVaryings", {
                /**
                * The amount of used varying registers.
                */
                get: function () {
                    return this._numUsedVaryings;
                },
                enumerable: true,
                configurable: true
            });
            return ShaderRegisterCache;
        })();
        materials.ShaderRegisterCache = ShaderRegisterCache;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * A single register element (an entire register or a single register's component) used by the RegisterPool.
        */
        var ShaderRegisterElement = (function () {
            /**
            * Creates a new ShaderRegisterElement object.
            *
            * @param regName The name of the register.
            * @param index The index of the register.
            * @param component The register's component, if not the entire register is represented.
            */
            function ShaderRegisterElement(regName, index, component) {
                if (typeof component === "undefined") { component = -1; }
                this._component = component;
                this._regName = regName;
                this._index = index;

                this._toStr = this._regName;

                if (this._index >= 0)
                    this._toStr += this._index;

                if (component > -1)
                    this._toStr += "." + ShaderRegisterElement.COMPONENTS[component];
            }
            /**
            * Converts the register or the components AGAL string representation.
            */
            ShaderRegisterElement.prototype.toString = function () {
                return this._toStr;
            };

            Object.defineProperty(ShaderRegisterElement.prototype, "regName", {
                /**
                * The register's name.
                */
                get: function () {
                    return this._regName;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderRegisterElement.prototype, "index", {
                /**
                * The register's index.
                */
                get: function () {
                    return this._index;
                },
                enumerable: true,
                configurable: true
            });
            ShaderRegisterElement.COMPONENTS = ["x", "y", "z", "w"];
            return ShaderRegisterElement;
        })();
        materials.ShaderRegisterElement = ShaderRegisterElement;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShaderCompilerBase is an abstract base class for shader compilers that use modular shader methods to assemble a
        * material. Concrete subclasses are used by the default materials.
        *
        * @see away.materials.ShadingMethodBase
        */
        var ShaderCompilerBase = (function () {
            /**
            * Creates a new ShaderCompilerBase object.
            * @param profile The compatibility profile of the renderer.
            */
            function ShaderCompilerBase(materialPass, profile) {
                this._preserveAlpha = true;
                this._pVertexCode = '';
                this._pFragmentCode = '';
                this._commonsDataIndex = -1;
                this._uvBufferIndex = -1;
                this._uvTransformIndex = -1;
                this._secondaryUVBufferIndex = -1;
                this._pNormalBufferIndex = -1;
                this._pTangentBufferIndex = -1;
                this._sceneMatrixIndex = -1;
                this._pSceneNormalMatrixIndex = -1;
                this._pCameraPositionIndex = -1;
                this._pMaterialPass = materialPass;
                this._pProfile = profile;

                this._pSharedRegisters = new materials.ShaderRegisterData();
                this._pDependencyCounter = new materials.DependencyCounter(profile);

                this._pRegisterCache = new materials.ShaderRegisterCache(profile);
                this._pRegisterCache.vertexAttributesOffset = 1;
                this._pRegisterCache.reset();
            }
            Object.defineProperty(ShaderCompilerBase.prototype, "needUVAnimation", {
                /**
                * Indicates whether the compiled code needs UV animation.
                */
                get: function () {
                    return this._needUVAnimation;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "UVTarget", {
                /**
                * The target register to place the animated UV coordinate.
                */
                get: function () {
                    return this._UVTarget;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "UVSource", {
                /**
                * The souce register providing the UV coordinate to animate.
                */
                get: function () {
                    return this._UVSource;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "forceSeperateMVP", {
                /**
                * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
                * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
                * projection code.
                */
                get: function () {
                    return this._forceSeperateMVP;
                },
                set: function (value) {
                    this._forceSeperateMVP = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderCompilerBase.prototype, "animateUVs", {
                /**
                * Indicate whether UV coordinates need to be animated using the renderable's transformUV matrix.
                */
                get: function () {
                    return this._animateUVs;
                },
                set: function (value) {
                    this._animateUVs = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShaderCompilerBase.prototype, "preserveAlpha", {
                /**
                * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
                */
                get: function () {
                    return this._preserveAlpha;
                },
                set: function (value) {
                    this._preserveAlpha = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Compiles the code after all setup on the compiler has finished.
            */
            ShaderCompilerBase.prototype.compile = function () {
                this.pInitRegisterIndices();

                this._pAnimatableAttributes = new Array("va0");
                this._pAnimationTargetRegisters = new Array("vt0");
                this._pVertexCode = "";
                this._pFragmentCode = "";

                this._pRegisterCache.addVertexTempUsages(this._pSharedRegisters.localPosition = this._pRegisterCache.getFreeVertexVectorTemp(), 1);

                //create commonly shared constant registers
                this._pSharedRegisters.commons = this._pRegisterCache.getFreeFragmentConstant();
                this._commonsDataIndex = this._pSharedRegisters.commons.index * 4;

                this.pCalculateDependencies();

                for (var i = 0; i < 4; ++i)
                    this._pRegisterCache.getFreeVertexConstant();

                //compile the world-space position if required
                if (this._pDependencyCounter.globalPosDependencies > 0 || this._forceSeperateMVP) {
                    this._pRegisterCache.addVertexTempUsages(this._pSharedRegisters.globalPositionVertex = this._pRegisterCache.getFreeVertexVectorTemp(), this._pDependencyCounter.globalPosDependencies);
                    var positionMatrixReg = this._pRegisterCache.getFreeVertexConstant();
                    this._pRegisterCache.getFreeVertexConstant();
                    this._pRegisterCache.getFreeVertexConstant();
                    this._pRegisterCache.getFreeVertexConstant();
                    this._sceneMatrixIndex = positionMatrixReg.index * 4;

                    this._pVertexCode += "m44 " + this._pSharedRegisters.globalPositionVertex + ", " + this._pSharedRegisters.localPosition + ", " + positionMatrixReg + "\n";

                    if (this._pDependencyCounter.usesGlobalPosFragment) {
                        this._pSharedRegisters.globalPositionVarying = this._pRegisterCache.getFreeVarying();
                        this._pVertexCode += "mov " + this._pSharedRegisters.globalPositionVarying + ", " + this._pSharedRegisters.globalPositionVertex + "\n";
                    }
                }

                //get the projection coordinates
                var pos = (this._pDependencyCounter.globalPosDependencies > 0 || this._forceSeperateMVP) ? this._pSharedRegisters.globalPositionVertex.toString() : this._pAnimationTargetRegisters[0];

                if (this._pDependencyCounter.projectionDependencies > 0) {
                    this._pSharedRegisters.projectionFragment = this._pRegisterCache.getFreeVarying();
                    this._pVertexCode += "m44 vt5, " + pos + ", vc0		\n" + "mov " + this._pSharedRegisters.projectionFragment + ", vt5\n" + "mov op, vt5\n";
                } else {
                    this._pVertexCode += "m44 op, " + pos + ", vc0		\n";
                }

                this.pCompileDependencies();

                //assign the final output color to the output register
                this._pFragmentCode += "mov " + this._pRegisterCache.fragmentOutputRegister + ", " + this._pSharedRegisters.shadedTarget + "\n";
                this._pRegisterCache.removeFragmentTempUsage(this._pSharedRegisters.shadedTarget);
            };

            /**
            * Compile the code for the methods.
            */
            ShaderCompilerBase.prototype.pCompileDependencies = function () {
                //Calculate the (possibly animated) UV coordinates.
                if (this._pDependencyCounter.uvDependencies > 0)
                    this.compileUVCode();

                if (this._pDependencyCounter.secondaryUVDependencies > 0)
                    this.compileSecondaryUVCode();
            };

            /**
            * Calculate the (possibly animated) UV coordinates.
            */
            ShaderCompilerBase.prototype.compileUVCode = function () {
                var uvAttributeReg = this._pRegisterCache.getFreeVertexAttribute();
                this._uvBufferIndex = uvAttributeReg.index;

                var varying = this._pRegisterCache.getFreeVarying();

                this._pSharedRegisters.uvVarying = varying;

                if (this.animateUVs) {
                    // a, b, 0, tx
                    // c, d, 0, ty
                    var uvTransform1 = this._pRegisterCache.getFreeVertexConstant();
                    var uvTransform2 = this._pRegisterCache.getFreeVertexConstant();
                    this._uvTransformIndex = uvTransform1.index * 4;

                    this._pVertexCode += "dp4 " + varying + ".x, " + uvAttributeReg + ", " + uvTransform1 + "\n" + "dp4 " + varying + ".y, " + uvAttributeReg + ", " + uvTransform2 + "\n" + "mov " + varying + ".zw, " + uvAttributeReg + ".zw \n";
                } else {
                    this._uvTransformIndex = -1;
                    this._needUVAnimation = true;
                    this._UVTarget = varying.toString();
                    this._UVSource = uvAttributeReg.toString();
                }
            };

            /**
            * Provide the secondary UV coordinates.
            */
            ShaderCompilerBase.prototype.compileSecondaryUVCode = function () {
                var uvAttributeReg = this._pRegisterCache.getFreeVertexAttribute();
                this._secondaryUVBufferIndex = uvAttributeReg.index;
                this._pSharedRegisters.secondaryUVVarying = this._pRegisterCache.getFreeVarying();
                this._pVertexCode += "mov " + this._pSharedRegisters.secondaryUVVarying + ", " + uvAttributeReg + "\n";
            };

            /**
            * Reset all the indices to "unused".
            */
            ShaderCompilerBase.prototype.pInitRegisterIndices = function () {
                this._commonsDataIndex = -1;
                this._pCameraPositionIndex = -1;
                this._uvBufferIndex = -1;
                this._uvTransformIndex = -1;
                this._secondaryUVBufferIndex = -1;
                this._pNormalBufferIndex = -1;
                this._pTangentBufferIndex = -1;
                this._sceneMatrixIndex = -1;
                this._pSceneNormalMatrixIndex = -1;
            };

            /**
            * Figure out which named registers are required, and how often.
            */
            ShaderCompilerBase.prototype.pCalculateDependencies = function () {
                this._pDependencyCounter.reset();

                this._pMaterialPass._iIncludeDependencies(this._pDependencyCounter);
            };

            Object.defineProperty(ShaderCompilerBase.prototype, "commonsDataIndex", {
                /**
                * The index for the common data register.
                */
                get: function () {
                    return this._commonsDataIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "numUsedVertexConstants", {
                /**
                * The amount of vertex constants used by the material. Any animation code to be added can append its vertex
                * constant data after this.
                */
                get: function () {
                    return this._pRegisterCache.numUsedVertexConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "numUsedFragmentConstants", {
                /**
                * The amount of fragment constants used by the material. Any animation code to be added can append its vertex
                * constant data after this.
                */
                get: function () {
                    return this._pRegisterCache.numUsedFragmentConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "numUsedStreams", {
                /**
                * The amount of vertex attribute streams used by the material. Any animation code to be added can add its
                * streams after this. Also used to automatically disable attribute slots on pass deactivation.
                */
                get: function () {
                    return this._pRegisterCache.numUsedStreams;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "numUsedTextures", {
                /**
                * The amount of textures used by the material. Used to automatically disable texture slots on pass deactivation.
                */
                get: function () {
                    return this._pRegisterCache.numUsedTextures;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "numUsedVaryings", {
                /**
                * Number of used varyings. Any animation code to be added can add its used varyings after this.
                */
                get: function () {
                    return this._pRegisterCache.numUsedVaryings;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Disposes all resources used by the compiler.
            */
            ShaderCompilerBase.prototype.dispose = function () {
                this._pRegisterCache.dispose();
                this._pRegisterCache = null;
                this._pSharedRegisters = null;
            };

            Object.defineProperty(ShaderCompilerBase.prototype, "uvBufferIndex", {
                /**
                * The index for the UV vertex attribute stream.
                */
                get: function () {
                    return this._uvBufferIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "uvTransformIndex", {
                /**
                * The index for the UV transformation matrix vertex constant.
                */
                get: function () {
                    return this._uvTransformIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "secondaryUVBufferIndex", {
                /**
                * The index for the secondary UV vertex attribute stream.
                */
                get: function () {
                    return this._secondaryUVBufferIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "normalBufferIndex", {
                /**
                * The index for the vertex normal attribute stream.
                */
                get: function () {
                    return this._pNormalBufferIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "tangentBufferIndex", {
                /**
                * The index for the vertex tangent attribute stream.
                */
                get: function () {
                    return this._pTangentBufferIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "cameraPositionIndex", {
                /**
                * The index of the vertex constant containing the camera position.
                */
                get: function () {
                    return this._pCameraPositionIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "sceneMatrixIndex", {
                /**
                * The index of the vertex constant containing the scene matrix.
                */
                get: function () {
                    return this._sceneMatrixIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "sceneNormalMatrixIndex", {
                /**
                * The index of the vertex constant containing the uniform scene matrix (the inverse transpose).
                */
                get: function () {
                    return this._pSceneNormalMatrixIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "vertexCode", {
                /**
                * The generated vertex code.
                */
                get: function () {
                    return this._pVertexCode;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "fragmentCode", {
                /**
                * The generated fragment code.
                */
                get: function () {
                    return this._pFragmentCode;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "animatableAttributes", {
                /**
                * The attributes that need to be animated by animators.
                */
                get: function () {
                    return this._pAnimatableAttributes;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderCompilerBase.prototype, "animationTargetRegisters", {
                /**
                * The target registers for animated properties, written to by the animators.
                */
                get: function () {
                    return this._pAnimationTargetRegisters;
                },
                enumerable: true,
                configurable: true
            });
            return ShaderCompilerBase;
        })();
        materials.ShaderCompilerBase = ShaderCompilerBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShaderBasicCompiler is a compiler that generates shaders that perform both lighting and "effects" through methods.
        * This is used by the single-pass materials.
        */
        var ShaderBasicCompiler = (function (_super) {
            __extends(ShaderBasicCompiler, _super);
            /**
            * Creates a new ShaderBasicCompiler object.
            *
            * @param profile The compatibility profile used by the renderer.
            */
            function ShaderBasicCompiler(materialPass, profile) {
                _super.call(this, materialPass, profile);
            }
            ShaderBasicCompiler.prototype.pCompileDependencies = function () {
                _super.prototype.pCompileDependencies.call(this);

                this._pFragmentCode += this._pMaterialPass._iGetPassFragmentCode(this._pRegisterCache, this._pSharedRegisters);
            };
            return ShaderBasicCompiler;
        })(materials.ShaderCompilerBase);
        materials.ShaderBasicCompiler = ShaderBasicCompiler;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShaderCompilerBase is an abstract base class for shader compilers that use modular shader methods to assemble a
        * material. Concrete subclasses are used by the default materials.
        *
        * @see away.materials.ShadingMethodBase
        */
        var ShaderLightingCompiler = (function (_super) {
            __extends(ShaderLightingCompiler, _super);
            /**
            * Creates a new ShaderCompilerBase object.
            * @param profile The compatibility profile of the renderer.
            */
            function ShaderLightingCompiler(materialPass, profile) {
                _super.call(this, materialPass, profile);
                this._pLightFragmentConstantIndex = -1;
                this._pProbeWeightsIndex = -1;

                this._materialLightingPass = materialPass;
            }
            Object.defineProperty(ShaderLightingCompiler.prototype, "enableLightFallOff", {
                /**
                * Whether or not to use fallOff and radius properties for lights. This can be used to improve performance and
                * compatibility for constrained mode.
                */
                get: function () {
                    return this._pEnableLightFallOff;
                },
                set: function (value) {
                    this._pEnableLightFallOff = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Compile the code for the methods.
            */
            ShaderLightingCompiler.prototype.pCompileDependencies = function () {
                _super.prototype.pCompileDependencies.call(this);

                if (this._pDependencyCounter.normalDependencies > 0)
                    this.compileNormalCode();

                if (this._pDependencyCounter.viewDirDependencies > 0)
                    this.compileViewDirCode();

                //compile the lighting code
                if (this._materialLightingPass._iUsesShadows())
                    this.pCompileShadowCode();

                this._pSharedRegisters.shadedTarget = this._pRegisterCache.getFreeFragmentVectorTemp();
                this._pRegisterCache.addFragmentTempUsages(this._pSharedRegisters.shadedTarget, 1);

                this._pVertexCode += this._materialLightingPass._iGetPreLightingVertexCode(this._pRegisterCache, this._pSharedRegisters);
                this._pFragmentCode += this._materialLightingPass._iGetPreLightingFragmentCode(this._pRegisterCache, this._pSharedRegisters);

                if (this._materialLightingPass._iUsesLights()) {
                    this.initLightRegisters();
                    this.compileLightCode();
                }

                if (this._materialLightingPass._iUsesProbes())
                    this.compileLightProbeCode();

                this._pVertexCode += this._materialLightingPass._iGetPostLightingVertexCode(this._pRegisterCache, this._pSharedRegisters);
                this._pFragmentCode += this._materialLightingPass._iGetPostLightingFragmentCode(this._pRegisterCache, this._pSharedRegisters);
            };

            /**
            * Provides the code to provide shadow mapping.
            */
            ShaderLightingCompiler.prototype.pCompileShadowCode = function () {
                if (this._pDependencyCounter.normalDependencies > 0) {
                    this._pSharedRegisters.shadowTarget = this._pSharedRegisters.normalFragment;
                } else {
                    this._pSharedRegisters.shadowTarget = this._pRegisterCache.getFreeFragmentVectorTemp();
                    this._pRegisterCache.addFragmentTempUsages(this._pSharedRegisters.shadowTarget, 1);
                }
            };

            /**
            * Initializes constant registers to contain light data.
            */
            ShaderLightingCompiler.prototype.initLightRegisters = function () {
                // init these first so we're sure they're in sequence
                var i, len;

                if (this._dirLightVertexConstants) {
                    len = this._dirLightVertexConstants.length;

                    for (i = 0; i < len; ++i) {
                        this._dirLightVertexConstants[i] = this._pRegisterCache.getFreeVertexConstant();

                        if (this._lightVertexConstantIndex == -1)
                            this._lightVertexConstantIndex = this._dirLightVertexConstants[i].index * 4;
                    }
                }

                len = this._pointLightVertexConstants.length;
                for (i = 0; i < len; ++i) {
                    this._pointLightVertexConstants[i] = this._pRegisterCache.getFreeVertexConstant();

                    if (this._lightVertexConstantIndex == -1)
                        this._lightVertexConstantIndex = this._pointLightVertexConstants[i].index * 4;
                }

                len = this._dirLightFragmentConstants.length;
                for (i = 0; i < len; ++i) {
                    this._dirLightFragmentConstants[i] = this._pRegisterCache.getFreeFragmentConstant();

                    if (this._pLightFragmentConstantIndex == -1)
                        this._pLightFragmentConstantIndex = this._dirLightFragmentConstants[i].index * 4;
                }

                len = this._pointLightFragmentConstants.length;

                for (i = 0; i < len; ++i) {
                    this._pointLightFragmentConstants[i] = this._pRegisterCache.getFreeFragmentConstant();

                    if (this._pLightFragmentConstantIndex == -1)
                        this._pLightFragmentConstantIndex = this._pointLightFragmentConstants[i].index * 4;
                }
            };

            /**
            * Compiles the shading code for directional and point lights.
            */
            ShaderLightingCompiler.prototype.compileLightCode = function () {
                var diffuseColorReg;
                var specularColorReg;
                var lightPosReg;
                var lightDirReg;
                var vertexRegIndex = 0;
                var fragmentRegIndex = 0;
                var addSpec = this._materialLightingPass._iUsesLightsForSpecular();
                var addDiff = this._materialLightingPass._iUsesLightsForDiffuse();

                for (var i = 0; i < this._pNumDirectionalLights; ++i) {
                    if (this._materialLightingPass._iUsesTangentSpace()) {
                        lightDirReg = this._dirLightVertexConstants[vertexRegIndex++];

                        var lightVarying = this._pRegisterCache.getFreeVarying();

                        this._pVertexCode += "m33 " + lightVarying + ".xyz, " + lightDirReg + ", " + this._pSharedRegisters.animatedTangent + "\n" + "mov " + lightVarying + ".w, " + lightDirReg + ".w\n";

                        lightDirReg = this._pRegisterCache.getFreeFragmentVectorTemp();
                        this._pRegisterCache.addVertexTempUsages(lightDirReg, 1);
                        this._pFragmentCode += "nrm " + lightDirReg + ".xyz, " + lightVarying + "\n";
                        this._pFragmentCode += "mov " + lightDirReg + ".w, " + lightVarying + ".w\n";
                    } else {
                        lightDirReg = this._dirLightFragmentConstants[fragmentRegIndex++];
                    }

                    diffuseColorReg = this._dirLightFragmentConstants[fragmentRegIndex++];
                    specularColorReg = this._dirLightFragmentConstants[fragmentRegIndex++];

                    if (addDiff)
                        this._pFragmentCode += this._materialLightingPass._iGetPerLightDiffuseFragmentCode(lightDirReg, diffuseColorReg, this._pRegisterCache, this._pSharedRegisters);

                    if (addSpec)
                        this._pFragmentCode += this._materialLightingPass._iGetPerLightSpecularFragmentCode(lightDirReg, specularColorReg, this._pRegisterCache, this._pSharedRegisters);

                    if (this._materialLightingPass._iUsesTangentSpace())
                        this._pRegisterCache.removeVertexTempUsage(lightDirReg);
                }

                vertexRegIndex = 0;
                fragmentRegIndex = 0;

                for (var i = 0; i < this._pNumPointLights; ++i) {
                    lightPosReg = this._pointLightVertexConstants[vertexRegIndex++];
                    diffuseColorReg = this._pointLightFragmentConstants[fragmentRegIndex++];
                    specularColorReg = this._pointLightFragmentConstants[fragmentRegIndex++];
                    lightDirReg = this._pRegisterCache.getFreeFragmentVectorTemp();

                    this._pRegisterCache.addFragmentTempUsages(lightDirReg, 1);

                    var lightVarying = this._pRegisterCache.getFreeVarying();

                    if (this._materialLightingPass._iUsesTangentSpace()) {
                        var temp = this._pRegisterCache.getFreeVertexVectorTemp();
                        this._pVertexCode += "sub " + temp + ", " + lightPosReg + ", " + this._pSharedRegisters.localPosition + "\n" + "m33 " + lightVarying + ".xyz, " + temp + ", " + this._pSharedRegisters.animatedTangent + "\n" + "mov " + lightVarying + ".w, " + this._pSharedRegisters.localPosition + ".w\n";
                    } else {
                        this._pVertexCode += "sub " + lightVarying + ", " + lightPosReg + ", " + this._pSharedRegisters.globalPositionVertex + "\n";
                    }

                    if (this._pEnableLightFallOff && this._pProfile != "baselineConstrained") {
                        // calculate attenuation
                        this._pFragmentCode += "dp3 " + lightDirReg + ".w, " + lightVarying + ", " + lightVarying + "\n" + "sub " + lightDirReg + ".w, " + lightDirReg + ".w, " + diffuseColorReg + ".w\n" + "mul " + lightDirReg + ".w, " + lightDirReg + ".w, " + specularColorReg + ".w\n" + "sat " + lightDirReg + ".w, " + lightDirReg + ".w\n" + "sub " + lightDirReg + ".w, " + this._pSharedRegisters.commons + ".w, " + lightDirReg + ".w\n" + "nrm " + lightDirReg + ".xyz, " + lightVarying + "\n";
                    } else {
                        this._pFragmentCode += "nrm " + lightDirReg + ".xyz, " + lightVarying + "\n" + "mov " + lightDirReg + ".w, " + lightVarying + ".w\n";
                    }

                    if (this._pLightFragmentConstantIndex == -1)
                        this._pLightFragmentConstantIndex = lightPosReg.index * 4;

                    if (addDiff)
                        this._pFragmentCode += this._materialLightingPass._iGetPerLightDiffuseFragmentCode(lightDirReg, diffuseColorReg, this._pRegisterCache, this._pSharedRegisters);

                    if (addSpec)
                        this._pFragmentCode += this._materialLightingPass._iGetPerLightSpecularFragmentCode(lightDirReg, specularColorReg, this._pRegisterCache, this._pSharedRegisters);

                    this._pRegisterCache.removeFragmentTempUsage(lightDirReg);
                }
            };

            /**
            * Compiles shading code for light probes.
            */
            ShaderLightingCompiler.prototype.compileLightProbeCode = function () {
                var weightReg;
                var weightComponents = [".x", ".y", ".z", ".w"];
                var weightRegisters = new Array();
                var i;
                var texReg;
                var addSpec = this._materialLightingPass._iUsesProbesForSpecular();
                var addDiff = this._materialLightingPass._iUsesProbesForDiffuse();

                if (addDiff)
                    this._pLightProbeDiffuseIndices = new Array();

                if (addSpec)
                    this._pLightProbeSpecularIndices = new Array();

                for (i = 0; i < this._pNumProbeRegisters; ++i) {
                    weightRegisters[i] = this._pRegisterCache.getFreeFragmentConstant();

                    if (i == 0)
                        this._pProbeWeightsIndex = weightRegisters[i].index * 4;
                }

                for (i = 0; i < this._pNumLightProbes; ++i) {
                    weightReg = weightRegisters[Math.floor(i / 4)].toString() + weightComponents[i % 4];

                    if (addDiff) {
                        texReg = this._pRegisterCache.getFreeTextureReg();
                        this._pLightProbeDiffuseIndices[i] = texReg.index;
                        this._pFragmentCode += this._materialLightingPass._iGetPerProbeDiffuseFragmentCode(texReg, weightReg, this._pRegisterCache, this._pSharedRegisters);
                    }

                    if (addSpec) {
                        texReg = this._pRegisterCache.getFreeTextureReg();
                        this._pLightProbeSpecularIndices[i] = texReg.index;
                        this._pFragmentCode += this._materialLightingPass._iGetPerProbeSpecularFragmentCode(texReg, weightReg, this._pRegisterCache, this._pSharedRegisters);
                    }
                }
            };

            /**
            * Calculate the view direction.
            */
            ShaderLightingCompiler.prototype.compileViewDirCode = function () {
                var cameraPositionReg = this._pRegisterCache.getFreeVertexConstant();
                this._pSharedRegisters.viewDirVarying = this._pRegisterCache.getFreeVarying();
                this._pSharedRegisters.viewDirFragment = this._pRegisterCache.getFreeFragmentVectorTemp();
                this._pRegisterCache.addFragmentTempUsages(this._pSharedRegisters.viewDirFragment, this._pDependencyCounter.viewDirDependencies);

                this._pCameraPositionIndex = cameraPositionReg.index * 4;

                if (this._materialLightingPass._iUsesTangentSpace()) {
                    var temp = this._pRegisterCache.getFreeVertexVectorTemp();
                    this._pVertexCode += "sub " + temp + ", " + cameraPositionReg + ", " + this._pSharedRegisters.localPosition + "\n" + "m33 " + this._pSharedRegisters.viewDirVarying + ".xyz, " + temp + ", " + this._pSharedRegisters.animatedTangent + "\n" + "mov " + this._pSharedRegisters.viewDirVarying + ".w, " + this._pSharedRegisters.localPosition + ".w\n";
                } else {
                    this._pVertexCode += "sub " + this._pSharedRegisters.viewDirVarying + ", " + cameraPositionReg + ", " + this._pSharedRegisters.globalPositionVertex + "\n";
                    this._pRegisterCache.removeVertexTempUsage(this._pSharedRegisters.globalPositionVertex);
                }

                this._pFragmentCode += "nrm " + this._pSharedRegisters.viewDirFragment + ".xyz, " + this._pSharedRegisters.viewDirVarying + "\n" + "mov " + this._pSharedRegisters.viewDirFragment + ".w,   " + this._pSharedRegisters.viewDirVarying + ".w\n";
            };

            /**
            * Calculate the normal.
            */
            ShaderLightingCompiler.prototype.compileNormalCode = function () {
                this._pSharedRegisters.normalFragment = this._pRegisterCache.getFreeFragmentVectorTemp();
                this._pRegisterCache.addFragmentTempUsages(this._pSharedRegisters.normalFragment, this._pDependencyCounter.normalDependencies);

                if (this._materialLightingPass._iUsesTangentSpace()) {
                    // normalize normal + tangent vector and generate (approximated) bitangent
                    this._pVertexCode += "nrm " + this._pSharedRegisters.animatedNormal + ".xyz, " + this._pSharedRegisters.animatedNormal + "\n" + "nrm " + this._pSharedRegisters.animatedTangent + ".xyz, " + this._pSharedRegisters.animatedTangent + "\n";
                    this._pVertexCode += "crs " + this._pSharedRegisters.bitangent + ".xyz, " + this._pSharedRegisters.animatedNormal + ", " + this._pSharedRegisters.animatedTangent + "\n";
                } else {
                    var normalMatrix = new Array(3);
                    normalMatrix[0] = this._pRegisterCache.getFreeVertexConstant();
                    normalMatrix[1] = this._pRegisterCache.getFreeVertexConstant();
                    normalMatrix[2] = this._pRegisterCache.getFreeVertexConstant();

                    this._pRegisterCache.getFreeVertexConstant();

                    this._pSceneNormalMatrixIndex = normalMatrix[0].index * 4;
                    this._pSharedRegisters.normalVarying = this._pRegisterCache.getFreeVarying();

                    // no output, world space is enough
                    this._pVertexCode += "m33 " + this._pSharedRegisters.normalVarying + ".xyz, " + this._pSharedRegisters.animatedNormal + ", " + normalMatrix[0] + "\n" + "mov " + this._pSharedRegisters.normalVarying + ".w, " + this._pSharedRegisters.animatedNormal + ".w\n";

                    this._pFragmentCode += "nrm " + this._pSharedRegisters.normalFragment + ".xyz, " + this._pSharedRegisters.normalVarying + "\n" + "mov " + this._pSharedRegisters.normalFragment + ".w, " + this._pSharedRegisters.normalVarying + ".w\n";
                }

                if (this._pDependencyCounter.tangentDependencies > 0) {
                    this._pSharedRegisters.tangentInput = this._pRegisterCache.getFreeVertexAttribute();
                    this._pTangentBufferIndex = this._pSharedRegisters.tangentInput.index;
                    this._pSharedRegisters.tangentVarying = this._pRegisterCache.getFreeVarying();
                }
            };

            Object.defineProperty(ShaderLightingCompiler.prototype, "lightVertexConstantIndex", {
                /**
                * The starting index if the vertex constant to which light data needs to be uploaded.
                */
                get: function () {
                    return this._lightVertexConstantIndex;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Reset all the indices to "unused".
            */
            ShaderLightingCompiler.prototype.pInitRegisterIndices = function () {
                _super.prototype.pInitRegisterIndices.call(this);

                this._lightVertexConstantIndex = -1;
                this._pLightFragmentConstantIndex = -1;
                this._pProbeWeightsIndex = -1;

                this._pNumLights = this._pNumPointLights + this._pNumDirectionalLights;
                this._pNumProbeRegisters = Math.ceil(this._pNumLightProbes / 4);

                //init light data
                this._pointLightVertexConstants = new Array(this._pNumPointLights);
                this._pointLightFragmentConstants = new Array(this._pNumPointLights * 2);

                if (this._materialLightingPass._iUsesTangentSpace()) {
                    this._dirLightVertexConstants = new Array(this._pNumDirectionalLights);
                    this._dirLightFragmentConstants = new Array(this._pNumDirectionalLights * 2);
                } else {
                    this._dirLightFragmentConstants = new Array(this._pNumDirectionalLights * 3);
                }

                //create normal registers
                if (this._materialLightingPass._iUsesTangentSpace()) {
                    this._pSharedRegisters.animatedTangent = this._pRegisterCache.getFreeVertexVectorTemp();
                    this._pRegisterCache.addVertexTempUsages(this._pSharedRegisters.animatedTangent, 1);
                    this._pSharedRegisters.bitangent = this._pRegisterCache.getFreeVertexVectorTemp();
                    this._pRegisterCache.addVertexTempUsages(this._pSharedRegisters.bitangent, 1);

                    this._pSharedRegisters.tangentInput = this._pRegisterCache.getFreeVertexAttribute();
                    this._pTangentBufferIndex = this._pSharedRegisters.tangentInput.index;

                    this._pAnimatableAttributes.push(this._pSharedRegisters.tangentInput.toString());
                    this._pAnimationTargetRegisters.push(this._pSharedRegisters.animatedTangent.toString());
                }

                this._pSharedRegisters.normalInput = this._pRegisterCache.getFreeVertexAttribute();
                this._pNormalBufferIndex = this._pSharedRegisters.normalInput.index;

                this._pSharedRegisters.animatedNormal = this._pRegisterCache.getFreeVertexVectorTemp();
                this._pRegisterCache.addVertexTempUsages(this._pSharedRegisters.animatedNormal, 1);

                this._pAnimatableAttributes.push(this._pSharedRegisters.normalInput.toString());
                this._pAnimationTargetRegisters.push(this._pSharedRegisters.animatedNormal.toString());
            };

            Object.defineProperty(ShaderLightingCompiler.prototype, "lightFragmentConstantIndex", {
                /**
                * The first index for the fragment constants containing the light data.
                */
                get: function () {
                    return this._pLightFragmentConstantIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "probeWeightsIndex", {
                /**
                * The index of the fragment constant containing the weights for the light probes.
                */
                get: function () {
                    return this._pProbeWeightsIndex;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "fragmentLightCode", {
                /**
                * The code containing the lighting calculations.
                */
                get: function () {
                    return this._fragmentLightCode;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "fragmentPostLightCode", {
                /**
                * The code containing the post-lighting calculations.
                */
                get: function () {
                    return this._fragmentPostLightCode;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "shadedTarget", {
                /**
                * The register name containing the final shaded colour.
                */
                get: function () {
                    return this._pSharedRegisters.shadedTarget.toString();
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "lightProbeDiffuseIndices", {
                /**
                * Indices for the light probe diffuse textures.
                */
                get: function () {
                    return this._pLightProbeDiffuseIndices;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShaderLightingCompiler.prototype, "lightProbeSpecularIndices", {
                /**
                * Indices for the light probe specular textures.
                */
                get: function () {
                    return this._pLightProbeSpecularIndices;
                },
                enumerable: true,
                configurable: true
            });
            return ShaderLightingCompiler;
        })(materials.ShaderCompilerBase);
        materials.ShaderLightingCompiler = ShaderLightingCompiler;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShaderRegisterData contains the "named" registers, generated by the compiler and to be passed on to the methods.
        */
        var ShaderRegisterData = (function () {
            function ShaderRegisterData() {
            }
            return ShaderRegisterData;
        })();
        materials.ShaderRegisterData = ShaderRegisterData;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShadingMethodBase provides an abstract base method for shading methods, used by compiled passes to compile
        * the final shading program.
        */
        var ShadingMethodBase = (function (_super) {
            __extends(ShadingMethodBase, _super);
            /**
            * Create a new ShadingMethodBase object.
            */
            function ShadingMethodBase() {
                _super.call(this);
            }
            ShadingMethodBase.prototype.iIsUsed = function (dependencyCounter) {
                return true;
            };

            /**
            * Initializes the properties for a DependencyVO, including register and texture indices.
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iInitVO = function (vo) {
            };

            /**
            * Initializes unchanging shader constants using the data from a DependencyVO.
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iInitConstants = function (vo) {
            };

            Object.defineProperty(ShadingMethodBase.prototype, "passes", {
                /**
                * Any passes required that render to a texture used by this method.
                */
                get: function () {
                    return this._passes;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Cleans up any resources used by the current object.
            */
            ShadingMethodBase.prototype.dispose = function () {
            };

            /**
            * Resets the compilation state of the method.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iReset = function () {
                this.iCleanCompilationData();
            };

            /**
            * Resets the method's state for compilation.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iCleanCompilationData = function () {
            };

            /**
            * Get the vertex shader code for this method.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iGetVertexCode = function (vo, regCache, sharedRegisters) {
                return "";
            };

            /**
            * @inheritDoc
            */
            ShadingMethodBase.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                return null;
            };

            /**
            * Sets the render state for this method.
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param stage The Stage object currently used for rendering.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iActivate = function (vo, stage) {
            };

            /**
            * Sets the render state for a single renderable.
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param renderable The renderable currently being rendered.
            * @param stage The Stage object currently used for rendering.
            * @param camera The camera from which the scene is currently rendered.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iSetRenderState = function (vo, renderable, stage, camera) {
            };

            /**
            * Clears the render state for this method.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param stage The Stage object currently used for rendering.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iDeactivate = function (vo, stage) {
            };

            /**
            * Marks the shader program as invalid, so it will be recompiled before the next render.
            *
            * @internal
            */
            ShadingMethodBase.prototype.iInvalidateShaderProgram = function () {
                this.dispatchEvent(new away.events.ShadingMethodEvent(away.events.ShadingMethodEvent.SHADER_INVALIDATED));
            };

            /**
            * Copies the state from a ShadingMethodBase object into the current object.
            */
            ShadingMethodBase.prototype.copyFrom = function (method) {
            };
            return ShadingMethodBase;
        })(away.library.NamedAssetBase);
        materials.ShadingMethodBase = ShadingMethodBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * LightingMethodBase provides an abstract base method for shading methods that uses lights.
        * Used for diffuse and specular shaders only.
        */
        var LightingMethodBase = (function (_super) {
            __extends(LightingMethodBase, _super);
            /**
            * Creates a new LightingMethodBase.
            */
            function LightingMethodBase() {
                _super.call(this);
            }
            /**
            * Get the fragment shader code that will be needed before any per-light code is added.
            * @param vo The DependencyVO object containing the method data for the currently compiled material pass.
            * @param regCache The register cache used during the compilation.
            * @private
            */
            LightingMethodBase.prototype.iGetFragmentPreLightingCode = function (vo, regCache, sharedRegisters) {
                return "";
            };

            /**
            * Get the fragment shader code that will generate the code relevant to a single light.
            *
            * @param vo The DependencyVO object containing the method data for the currently compiled material pass.
            * @param lightDirReg The register containing the light direction vector.
            * @param lightColReg The register containing the light colour.
            * @param regCache The register cache used during the compilation.
            */
            LightingMethodBase.prototype.iGetFragmentCodePerLight = function (vo, lightDirReg, lightColReg, regCache, sharedRegisters) {
                return "";
            };

            /**
            * Get the fragment shader code that will generate the code relevant to a single light probe object.
            *
            * @param vo The DependencyVO object containing the method data for the currently compiled material pass.
            * @param cubeMapReg The register containing the cube map for the current probe
            * @param weightRegister A string representation of the register + component containing the current weight
            * @param regCache The register cache providing any necessary registers to the shader
            */
            LightingMethodBase.prototype.iGetFragmentCodePerProbe = function (vo, cubeMapReg, weightRegister, regCache, sharedRegisters) {
                return "";
            };

            /**
            * Get the fragment shader code that should be added after all per-light code. Usually composits everything to the target register.
            *
            * @param vo The DependencyVO object containing the method data for the currently compiled material pass.
            * @param regCache The register cache used during the compilation.
            * @param targetReg The register containing the final shading output.
            * @private
            */
            LightingMethodBase.prototype.iGetFragmentPostLightingCode = function (vo, targetReg, regCache, sharedRegisters) {
                return "";
            };
            return LightingMethodBase;
        })(materials.ShadingMethodBase);
        materials.LightingMethodBase = LightingMethodBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * AmbientBasicMethod provides the default shading method for uniform ambient lighting.
        */
        var AmbientBasicMethod = (function (_super) {
            __extends(AmbientBasicMethod, _super);
            /**
            * Creates a new AmbientBasicMethod object.
            */
            function AmbientBasicMethod() {
                _super.call(this);
                this._useTexture = false;
                this._ambientColor = 0xffffff;
                this._ambientR = 0;
                this._ambientG = 0;
                this._ambientB = 0;
                this._ambient = 1;
                this._iLightAmbientR = 0;
                this._iLightAmbientG = 0;
                this._iLightAmbientB = 0;
            }
            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iInitVO = function (vo) {
                vo.needsUV = this._useTexture;
            };

            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iInitConstants = function (vo) {
                vo.fragmentData[vo.fragmentConstantsIndex + 3] = 1;
            };

            Object.defineProperty(AmbientBasicMethod.prototype, "ambient", {
                /**
                * The strength of the ambient reflection of the surface.
                */
                get: function () {
                    return this._ambient;
                },
                set: function (value) {
                    this._ambient = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(AmbientBasicMethod.prototype, "ambientColor", {
                /**
                * The colour of the ambient reflection of the surface.
                */
                get: function () {
                    return this._ambientColor;
                },
                set: function (value) {
                    this._ambientColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(AmbientBasicMethod.prototype, "texture", {
                /**
                * The bitmapData to use to define the diffuse reflection color per texel.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    var b = (value != null);

                    /* // ORIGINAL conditional
                    if (Boolean(value) != _useTexture ||
                    (value && _texture && (value.hasMipmaps != _texture.hasMipmaps || value.format != _texture.format))) {
                    iInvalidateShaderProgram();
                    }
                    */
                    if (b != this._useTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format))) {
                        this.iInvalidateShaderProgram();
                    }
                    this._useTexture = b; //Boolean(value);
                    this._texture = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.copyFrom = function (method) {
                var m = method;
                var b = m;

                var diff = b;

                this.ambient = diff.ambient;
                this.ambientColor = diff.ambientColor;
            };

            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iCleanCompilationData = function () {
                _super.prototype.iCleanCompilationData.call(this);
                this._pAmbientInputRegister = null;
            };

            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                var code = "";

                if (this._useTexture) {
                    this._pAmbientInputRegister = regCache.getFreeTextureReg();

                    vo.texturesIndex = this._pAmbientInputRegister.index;

                    code += materials.ShaderCompilerHelper.getTex2DSampleCode(vo, targetReg, sharedRegisters, this._pAmbientInputRegister, this._texture) + "div " + targetReg + ".xyz, " + targetReg + ".xyz, " + targetReg + ".w\n"; // apparently, still needs to un-premultiply :s
                } else {
                    this._pAmbientInputRegister = regCache.getFreeFragmentConstant();
                    vo.fragmentConstantsIndex = this._pAmbientInputRegister.index * 4;

                    code += "mov " + targetReg + ", " + this._pAmbientInputRegister + "\n";
                }

                return code;
            };

            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iActivate = function (vo, stage) {
                if (this._useTexture) {
                    stage.context.setSamplerStateAt(vo.texturesIndex, vo.repeatTextures ? away.stagegl.ContextGLWrapMode.REPEAT : away.stagegl.ContextGLWrapMode.CLAMP, vo.useSmoothTextures ? away.stagegl.ContextGLTextureFilter.LINEAR : away.stagegl.ContextGLTextureFilter.NEAREST, vo.useMipmapping ? away.stagegl.ContextGLMipFilter.MIPLINEAR : away.stagegl.ContextGLMipFilter.MIPNONE);
                    stage.context.activateTexture(vo.texturesIndex, this._texture);
                }
            };

            /**
            * Updates the ambient color data used by the render state.
            */
            AmbientBasicMethod.prototype.updateAmbient = function () {
                this._ambientR = ((this._ambientColor >> 16) & 0xff) / 0xff * this._ambient * this._iLightAmbientR;
                this._ambientG = ((this._ambientColor >> 8) & 0xff) / 0xff * this._ambient * this._iLightAmbientG;
                this._ambientB = (this.ambientColor & 0xff) / 0xff * this._ambient * this._iLightAmbientB;
            };

            /**
            * @inheritDoc
            */
            AmbientBasicMethod.prototype.iSetRenderState = function (vo, renderable, stage, camera) {
                this.updateAmbient();

                if (!this._useTexture) {
                    var index = vo.fragmentConstantsIndex;
                    var data = vo.fragmentData;
                    data[index] = this._ambientR;
                    data[index + 1] = this._ambientG;
                    data[index + 2] = this._ambientB;
                }
            };
            return AmbientBasicMethod;
        })(materials.ShadingMethodBase);
        materials.AmbientBasicMethod = AmbientBasicMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var ContextGLMipFilter = away.stagegl.ContextGLMipFilter;
        var ContextGLTextureFilter = away.stagegl.ContextGLTextureFilter;
        var ContextGLWrapMode = away.stagegl.ContextGLWrapMode;

        /**
        * DiffuseBasicMethod provides the default shading method for Lambert (dot3) diffuse lighting.
        */
        var DiffuseBasicMethod = (function (_super) {
            __extends(DiffuseBasicMethod, _super);
            /**
            * Creates a new DiffuseBasicMethod object.
            */
            function DiffuseBasicMethod() {
                _super.call(this);
                this._diffuseColor = 0xffffff;
                this._diffuseR = 1;
                this._diffuseG = 1;
                this._diffuseB = 1;
                this._diffuseA = 1;
                this._alphaThreshold = 0;
            }
            Object.defineProperty(DiffuseBasicMethod.prototype, "iUseAmbientTexture", {
                /**
                * Set internally if the ambient method uses a texture.
                */
                get: function () {
                    return this._useAmbientTexture;
                },
                set: function (value) {
                    if (this._useAmbientTexture == value)
                        return;

                    this._useAmbientTexture = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            DiffuseBasicMethod.prototype.iInitVO = function (vo) {
                vo.needsUV = this._pUseTexture;
                vo.needsNormals = vo.numLights > 0;
            };

            /**
            * Forces the creation of the texture.
            * @param stage The Stage used by the renderer
            */
            DiffuseBasicMethod.prototype.generateMip = function (stage) {
                if (this._pUseTexture)
                    stage.context.activateTexture(0, this._texture);
            };

            Object.defineProperty(DiffuseBasicMethod.prototype, "diffuseAlpha", {
                /**
                * The alpha component of the diffuse reflection.
                */
                get: function () {
                    return this._diffuseA;
                },
                set: function (value) {
                    this._diffuseA = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DiffuseBasicMethod.prototype, "diffuseColor", {
                /**
                * The color of the diffuse reflection when not using a texture.
                */
                get: function () {
                    return this._diffuseColor;
                },
                set: function (diffuseColor) {
                    this._diffuseColor = diffuseColor;
                    this.updateDiffuse();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DiffuseBasicMethod.prototype, "texture", {
                /**
                * The bitmapData to use to define the diffuse reflection color per texel.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    var b = (value != null);

                    if (b != this._pUseTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
                        this.iInvalidateShaderProgram();

                    this._pUseTexture = b;
                    this._texture = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DiffuseBasicMethod.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (value < 0)
                        value = 0;
                    else if (value > 1)
                        value = 1;
                    if (value == this._alphaThreshold)
                        return;

                    if (value == 0 || this._alphaThreshold == 0)
                        this.iInvalidateShaderProgram();

                    this._alphaThreshold = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.dispose = function () {
                this._texture = null;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.copyFrom = function (method) {
                var diff = method;

                this.alphaThreshold = diff.alphaThreshold;
                this.texture = diff.texture;
                this.iUseAmbientTexture = diff.iUseAmbientTexture;
                this.diffuseAlpha = diff.diffuseAlpha;
                this.diffuseColor = diff.diffuseColor;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iCleanCompilationData = function () {
                _super.prototype.iCleanCompilationData.call(this);

                this._pTotalLightColorReg = null;
                this._pDiffuseInputRegister = null;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iGetFragmentPreLightingCode = function (vo, regCache, sharedRegisters) {
                var code = "";

                this._pIsFirstLight = true;

                if (vo.numLights > 0) {
                    this._pTotalLightColorReg = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(this._pTotalLightColorReg, 1);
                }

                return code;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iGetFragmentCodePerLight = function (vo, lightDirReg, lightColReg, regCache, sharedRegisters) {
                var code = "";
                var t;

                // write in temporary if not first light, so we can add to total diffuse colour
                if (this._pIsFirstLight) {
                    t = this._pTotalLightColorReg;
                } else {
                    t = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(t, 1);
                }

                code += "dp3 " + t + ".x, " + lightDirReg + ", " + sharedRegisters.normalFragment + "\n" + "max " + t + ".w, " + t + ".x, " + sharedRegisters.commons + ".y\n";

                if (vo.useLightFallOff)
                    code += "mul " + t + ".w, " + t + ".w, " + lightDirReg + ".w\n";

                if (this._iModulateMethod != null)
                    code += this._iModulateMethod(vo, t, regCache, sharedRegisters);

                code += "mul " + t + ", " + t + ".w, " + lightColReg + "\n";

                if (!this._pIsFirstLight) {
                    code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
                    regCache.removeFragmentTempUsage(t);
                }

                this._pIsFirstLight = false;

                return code;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iGetFragmentCodePerProbe = function (vo, cubeMapReg, weightRegister, regCache, sharedRegisters) {
                var code = "";
                var t;

                // write in temporary if not first light, so we can add to total diffuse colour
                if (this._pIsFirstLight) {
                    t = this._pTotalLightColorReg;
                } else {
                    t = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(t, 1);
                }

                code += "tex " + t + ", " + sharedRegisters.normalFragment + ", " + cubeMapReg + " <cube,linear,miplinear>\n" + "mul " + t + ".xyz, " + t + ".xyz, " + weightRegister + "\n";

                if (this._iModulateMethod != null)
                    code += this._iModulateMethod(vo, t, regCache, sharedRegisters);

                if (!this._pIsFirstLight) {
                    code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
                    regCache.removeFragmentTempUsage(t);
                }

                this._pIsFirstLight = false;

                return code;
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iGetFragmentPostLightingCode = function (vo, targetReg, regCache, sharedRegisters) {
                var code = "";
                var albedo;
                var cutOffReg;

                // incorporate input from ambient
                if (vo.numLights > 0) {
                    if (sharedRegisters.shadowTarget)
                        code += this.pApplyShadow(vo, regCache, sharedRegisters);

                    albedo = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(albedo, 1);
                } else {
                    albedo = targetReg;
                }

                if (this._pUseTexture) {
                    this._pDiffuseInputRegister = regCache.getFreeTextureReg();

                    vo.texturesIndex = this._pDiffuseInputRegister.index;

                    code += materials.ShaderCompilerHelper.getTex2DSampleCode(vo, albedo, sharedRegisters, this._pDiffuseInputRegister, this._texture);

                    if (this._alphaThreshold > 0) {
                        cutOffReg = regCache.getFreeFragmentConstant();
                        vo.fragmentConstantsIndex = cutOffReg.index * 4;

                        code += "sub " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n" + "kil " + albedo + ".w\n" + "add " + albedo + ".w, " + albedo + ".w, " + cutOffReg + ".x\n";
                    }
                } else {
                    this._pDiffuseInputRegister = regCache.getFreeFragmentConstant();

                    vo.fragmentConstantsIndex = this._pDiffuseInputRegister.index * 4;

                    code += "mov " + albedo + ", " + this._pDiffuseInputRegister + "\n";
                }

                if (vo.numLights == 0)
                    return code;

                //TODO: AGAL <> GLSL
                code += "sat " + this._pTotalLightColorReg + ", " + this._pTotalLightColorReg + "\n";

                if (this._useAmbientTexture) {
                    code += "mul " + albedo + ".xyz, " + albedo + ", " + this._pTotalLightColorReg + "\n" + "mul " + this._pTotalLightColorReg + ".xyz, " + targetReg + ", " + this._pTotalLightColorReg + "\n" + "sub " + targetReg + ".xyz, " + targetReg + ", " + this._pTotalLightColorReg + "\n" + "add " + targetReg + ".xyz, " + albedo + ", " + targetReg + "\n";
                } else {
                    code += "add " + targetReg + ".xyz, " + this._pTotalLightColorReg + ", " + targetReg + "\n";

                    if (this._pUseTexture) {
                        code += "mul " + targetReg + ".xyz, " + albedo + ", " + targetReg + "\n" + "mov " + targetReg + ".w, " + albedo + ".w\n";
                    } else {
                        code += "mul " + targetReg + ".xyz, " + this._pDiffuseInputRegister + ", " + targetReg + "\n" + "mov " + targetReg + ".w, " + this._pDiffuseInputRegister + ".w\n";
                    }
                }

                regCache.removeFragmentTempUsage(this._pTotalLightColorReg);
                regCache.removeFragmentTempUsage(albedo);

                return code;
            };

            /**
            * Generate the code that applies the calculated shadow to the diffuse light
            * @param vo The DependencyVO object for which the compilation is currently happening.
            * @param regCache The register cache the compiler is currently using for the register management.
            */
            DiffuseBasicMethod.prototype.pApplyShadow = function (vo, regCache, sharedRegisters) {
                return "mul " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + sharedRegisters.shadowTarget + ".w\n";
            };

            /**
            * @inheritDoc
            */
            DiffuseBasicMethod.prototype.iActivate = function (vo, stage) {
                if (this._pUseTexture) {
                    stage.context.setSamplerStateAt(vo.texturesIndex, vo.repeatTextures ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP, vo.useSmoothTextures ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, vo.useMipmapping ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
                    stage.context.activateTexture(vo.texturesIndex, this._texture);

                    if (this._alphaThreshold > 0)
                        vo.fragmentData[vo.fragmentConstantsIndex] = this._alphaThreshold;
                } else {
                    var index = vo.fragmentConstantsIndex;
                    var data = vo.fragmentData;
                    data[index] = this._diffuseR;
                    data[index + 1] = this._diffuseG;
                    data[index + 2] = this._diffuseB;
                    data[index + 3] = this._diffuseA;
                }
            };

            /**
            * Updates the diffuse color data used by the render state.
            */
            DiffuseBasicMethod.prototype.updateDiffuse = function () {
                this._diffuseR = ((this._diffuseColor >> 16) & 0xff) / 0xff;
                this._diffuseG = ((this._diffuseColor >> 8) & 0xff) / 0xff;
                this._diffuseB = (this._diffuseColor & 0xff) / 0xff;
            };
            return DiffuseBasicMethod;
        })(materials.LightingMethodBase);
        materials.DiffuseBasicMethod = DiffuseBasicMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * EffectMethodBase forms an abstract base class for shader methods that are not dependent on light sources,
        * and are in essence post-process effects on the materials.
        */
        var EffectMethodBase = (function (_super) {
            __extends(EffectMethodBase, _super);
            function EffectMethodBase() {
                _super.call(this);
            }
            Object.defineProperty(EffectMethodBase.prototype, "assetType", {
                /**
                * @inheritDoc
                */
                get: function () {
                    return away.library.AssetType.EFFECTS_METHOD;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Get the fragment shader code that should be added after all per-light code. Usually composits everything to the target register.
            * @param vo The DependencyVO object containing the method data for the currently compiled material pass.
            * @param regCache The register cache used during the compilation.
            * @param targetReg The register that will be containing the method's output.
            * @private
            */
            EffectMethodBase.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                throw new away.errors.AbstractMethodError();
                return "";
            };
            return EffectMethodBase;
        })(materials.ShadingMethodBase);
        materials.EffectMethodBase = EffectMethodBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (materials) {
        /**
        * EffectColorTransformMethod provides a shading method that changes the colour of a material analogous to a
        * ColorTransform object.
        */
        var EffectColorTransformMethod = (function (_super) {
            __extends(EffectColorTransformMethod, _super);
            /**
            * Creates a new EffectColorTransformMethod.
            */
            function EffectColorTransformMethod() {
                _super.call(this);
            }
            Object.defineProperty(EffectColorTransformMethod.prototype, "colorTransform", {
                /**
                * The ColorTransform object to transform the colour of the material with.
                */
                get: function () {
                    return this._colorTransform;
                },
                set: function (value) {
                    this._colorTransform = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            EffectColorTransformMethod.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                var code = "";
                var colorMultReg = regCache.getFreeFragmentConstant();
                var colorOffsReg = regCache.getFreeFragmentConstant();

                vo.fragmentConstantsIndex = colorMultReg.index * 4;

                //TODO: AGAL <> GLSL
                code += "mul " + targetReg + ", " + targetReg + ", " + colorMultReg + "\n" + "add " + targetReg + ", " + targetReg + ", " + colorOffsReg + "\n";

                return code;
            };

            /**
            * @inheritDoc
            */
            EffectColorTransformMethod.prototype.iActivate = function (vo, stage) {
                var inv = 1 / 0xff;
                var index = vo.fragmentConstantsIndex;
                var data = vo.fragmentData;

                data[index] = this._colorTransform.redMultiplier;
                data[index + 1] = this._colorTransform.greenMultiplier;
                data[index + 2] = this._colorTransform.blueMultiplier;
                data[index + 3] = this._colorTransform.alphaMultiplier;
                data[index + 4] = this._colorTransform.redOffset * inv;
                data[index + 5] = this._colorTransform.greenOffset * inv;
                data[index + 6] = this._colorTransform.blueOffset * inv;
                data[index + 7] = this._colorTransform.alphaOffset * inv;
            };
            return EffectColorTransformMethod;
        })(materials.EffectMethodBase);
        materials.EffectColorTransformMethod = EffectColorTransformMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var ContextGLMipFilter = away.stagegl.ContextGLMipFilter;
        var ContextGLTextureFilter = away.stagegl.ContextGLTextureFilter;
        var ContextGLWrapMode = away.stagegl.ContextGLWrapMode;

        /**
        * NormalBasicMethod is the default method for standard tangent-space normal mapping.
        */
        var NormalBasicMethod = (function (_super) {
            __extends(NormalBasicMethod, _super);
            /**
            * Creates a new NormalBasicMethod object.
            */
            function NormalBasicMethod() {
                _super.call(this);
            }
            NormalBasicMethod.prototype.iIsUsed = function (dependencyCounter) {
                if (!this._useTexture || !dependencyCounter.normalDependencies)
                    return false;

                return true;
            };

            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.iInitVO = function (vo) {
                vo.needsUV = this._useTexture;
            };

            Object.defineProperty(NormalBasicMethod.prototype, "iTangentSpace", {
                /**
                * Indicates whether or not this method outputs normals in tangent space. Override for object-space normals.
                */
                get: function () {
                    return true;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.copyFrom = function (method) {
                var s = method;
                var bnm = method;

                if (bnm.normalMap != null)
                    this.normalMap = bnm.normalMap;
            };

            Object.defineProperty(NormalBasicMethod.prototype, "normalMap", {
                /**
                * The texture containing the normals per pixel.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    var b = (value != null);

                    if (b != this._useTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
                        this.iInvalidateShaderProgram();

                    this._useTexture = b;
                    this._texture = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.iCleanCompilationData = function () {
                _super.prototype.iCleanCompilationData.call(this);
                this._pNormalTextureRegister = null;
            };

            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.dispose = function () {
                if (this._texture)
                    this._texture = null;
            };

            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.iActivate = function (vo, stage) {
                if (vo.texturesIndex >= 0) {
                    stage.context.setSamplerStateAt(vo.texturesIndex, vo.repeatTextures ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP, vo.useSmoothTextures ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, vo.useMipmapping ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
                    stage.context.activateTexture(vo.texturesIndex, this._texture);
                }
            };

            /**
            * @inheritDoc
            */
            NormalBasicMethod.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                this._pNormalTextureRegister = regCache.getFreeTextureReg();

                vo.texturesIndex = this._pNormalTextureRegister.index;

                return materials.ShaderCompilerHelper.getTex2DSampleCode(vo, targetReg, sharedRegisters, this._pNormalTextureRegister, this._texture) + "sub " + targetReg + ".xyz, " + targetReg + ".xyz, " + sharedRegisters.commons + ".xxx\n" + "nrm " + targetReg + ".xyz, " + targetReg + "\n";
            };
            return NormalBasicMethod;
        })(materials.ShadingMethodBase);
        materials.NormalBasicMethod = NormalBasicMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShadowMapMethodBase provides an abstract base method for shadow map methods.
        */
        var ShadowMapMethodBase = (function (_super) {
            __extends(ShadowMapMethodBase, _super);
            /**
            * Creates a new ShadowMapMethodBase object.
            * @param castingLight The light used to cast shadows.
            */
            function ShadowMapMethodBase(castingLight) {
                _super.call(this);
                this._pEpsilon = .02;
                this._pAlpha = 1;
                this._pCastingLight = castingLight;
                castingLight.castsShadows = true;
                this._pShadowMapper = castingLight.shadowMapper;
            }
            Object.defineProperty(ShadowMapMethodBase.prototype, "assetType", {
                /**
                * @inheritDoc
                */
                get: function () {
                    return away.library.AssetType.SHADOW_MAP_METHOD;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShadowMapMethodBase.prototype, "alpha", {
                /**
                * The "transparency" of the shadows. This allows making shadows less strong.
                */
                get: function () {
                    return this._pAlpha;
                },
                set: function (value) {
                    this._pAlpha = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ShadowMapMethodBase.prototype, "castingLight", {
                /**
                * The light casting the shadows.
                */
                get: function () {
                    return this._pCastingLight;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ShadowMapMethodBase.prototype, "epsilon", {
                /**
                * A small value to counter floating point precision errors when comparing values in the shadow map with the
                * calculated depth value. Increase this if shadow banding occurs, decrease it if the shadow seems to be too detached.
                */
                get: function () {
                    return this._pEpsilon;
                },
                set: function (value) {
                    this._pEpsilon = value;
                },
                enumerable: true,
                configurable: true
            });

            return ShadowMapMethodBase;
        })(materials.ShadingMethodBase);
        materials.ShadowMapMethodBase = ShadowMapMethodBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var PointLight = away.entities.PointLight;
        var AbstractMethodError = away.errors.AbstractMethodError;

        /**
        * ShadowMethodBase provides an abstract method for simple (non-wrapping) shadow map methods.
        */
        var ShadowMethodBase = (function (_super) {
            __extends(ShadowMethodBase, _super);
            /**
            * Creates a new ShadowMethodBase object.
            * @param castingLight The light used to cast shadows.
            */
            function ShadowMethodBase(castingLight) {
                this._pUsePoint = (castingLight instanceof PointLight);

                _super.call(this, castingLight);
            }
            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iInitVO = function (vo) {
                vo.needsView = true;
                vo.needsGlobalVertexPos = true;
                vo.needsGlobalFragmentPos = this._pUsePoint;
                vo.needsNormals = vo.numLights > 0;
            };

            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iInitConstants = function (vo) {
                var fragmentData = vo.fragmentData;
                var vertexData = vo.vertexData;
                var index = vo.fragmentConstantsIndex;
                fragmentData[index] = 1.0;
                fragmentData[index + 1] = 1 / 255.0;
                fragmentData[index + 2] = 1 / 65025.0;
                fragmentData[index + 3] = 1 / 16581375.0;

                fragmentData[index + 6] = 0;
                fragmentData[index + 7] = 1;

                if (this._pUsePoint) {
                    fragmentData[index + 8] = 0;
                    fragmentData[index + 9] = 0;
                    fragmentData[index + 10] = 0;
                    fragmentData[index + 11] = 1;
                }

                index = vo.vertexConstantsIndex;
                if (index != -1) {
                    vertexData[index] = .5;
                    vertexData[index + 1] = .5;
                    vertexData[index + 2] = 0.0;
                    vertexData[index + 3] = 1.0;
                }
            };

            Object.defineProperty(ShadowMethodBase.prototype, "_iDepthMapCoordReg", {
                /**
                * Wrappers that override the vertex shader need to set this explicitly
                */
                get: function () {
                    return this._pDepthMapCoordReg;
                },
                set: function (value) {
                    this._pDepthMapCoordReg = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iCleanCompilationData = function () {
                _super.prototype.iCleanCompilationData.call(this);

                this._pDepthMapCoordReg = null;
            };

            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iGetVertexCode = function (vo, regCache, sharedRegisters) {
                return this._pUsePoint ? this._pGetPointVertexCode(vo, regCache, sharedRegisters) : this.pGetPlanarVertexCode(vo, regCache, sharedRegisters);
            };

            /**
            * Gets the vertex code for shadow mapping with a point light.
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            */
            ShadowMethodBase.prototype._pGetPointVertexCode = function (vo, regCache, sharedRegisters) {
                vo.vertexConstantsIndex = -1;
                return "";
            };

            /**
            * Gets the vertex code for shadow mapping with a planar shadow map (fe: directional lights).
            *
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            */
            ShadowMethodBase.prototype.pGetPlanarVertexCode = function (vo, regCache, sharedRegisters) {
                var code = "";
                var temp = regCache.getFreeVertexVectorTemp();
                var dataReg = regCache.getFreeVertexConstant();
                var depthMapProj = regCache.getFreeVertexConstant();
                regCache.getFreeVertexConstant();
                regCache.getFreeVertexConstant();
                regCache.getFreeVertexConstant();
                this._pDepthMapCoordReg = regCache.getFreeVarying();
                vo.vertexConstantsIndex = dataReg.index * 4;

                // todo: can epsilon be applied here instead of fragment shader?
                code += "m44 " + temp + ", " + sharedRegisters.globalPositionVertex + ", " + depthMapProj + "\n" + "div " + temp + ", " + temp + ", " + temp + ".w\n" + "mul " + temp + ".xy, " + temp + ".xy, " + dataReg + ".xy\n" + "add " + this._pDepthMapCoordReg + ", " + temp + ", " + dataReg + ".xxwz\n";

                //"sub " + this._pDepthMapCoordReg + ".z, " + this._pDepthMapCoordReg + ".z, " + this._pDepthMapCoordReg + ".w\n";
                return code;
            };

            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iGetFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                var code = this._pUsePoint ? this._pGetPointFragmentCode(vo, targetReg, regCache, sharedRegisters) : this._pGetPlanarFragmentCode(vo, targetReg, regCache, sharedRegisters);
                code += "add " + targetReg + ".w, " + targetReg + ".w, fc" + (vo.fragmentConstantsIndex / 4 + 1) + ".y\n" + "sat " + targetReg + ".w, " + targetReg + ".w\n";
                return code;
            };

            /**
            * Gets the fragment code for shadow mapping with a planar shadow map.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            * @param targetReg The register to contain the shadow coverage
            * @return
            */
            ShadowMethodBase.prototype._pGetPlanarFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                throw new AbstractMethodError();
                return "";
            };

            /**
            * Gets the fragment code for shadow mapping with a point light.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            * @param targetReg The register to contain the shadow coverage
            * @return
            */
            ShadowMethodBase.prototype._pGetPointFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                throw new AbstractMethodError();
                return "";
            };

            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iSetRenderState = function (vo, renderable, stage, camera) {
                if (!this._pUsePoint)
                    this._pShadowMapper.iDepthProjection.copyRawDataTo(vo.vertexData, vo.vertexConstantsIndex + 4, true);
            };

            /**
            * Gets the fragment code for combining this method with a cascaded shadow map method.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param regCache The register cache used during the compilation.
            * @param decodeRegister The register containing the data to decode the shadow map depth value.
            * @param depthTexture The texture containing the shadow map.
            * @param depthProjection The projection of the fragment relative to the light.
            * @param targetRegister The register to contain the shadow coverage
            * @return
            */
            ShadowMethodBase.prototype._iGetCascadeFragmentCode = function (vo, decodeRegister, depthTexture, depthProjection, targetRegister, regCache, sharedRegisters) {
                throw new Error("This shadow method is incompatible with cascade shadows");
            };

            /**
            * @inheritDoc
            */
            ShadowMethodBase.prototype.iActivate = function (vo, stage) {
                var fragmentData = vo.fragmentData;
                var index = vo.fragmentConstantsIndex;

                if (this._pUsePoint)
                    fragmentData[index + 4] = -Math.pow(1 / (this._pCastingLight.fallOff * this._pEpsilon), 2);
                else
                    vo.vertexData[vo.vertexConstantsIndex + 3] = -1 / (this._pShadowMapper.depth * this._pEpsilon);

                fragmentData[index + 5] = 1 - this._pAlpha;

                if (this._pUsePoint) {
                    var pos = this._pCastingLight.scenePosition;
                    fragmentData[index + 8] = pos.x;
                    fragmentData[index + 9] = pos.y;
                    fragmentData[index + 10] = pos.z;

                    // used to decompress distance
                    var f = this._pCastingLight.fallOff;
                    fragmentData[index + 11] = 1 / (2 * f * f);
                }

                if (!this._pUsePoint)
                    stage.context.activateRenderTexture(vo.texturesIndex, this._pCastingLight.shadowMapper.depthMap);
                //else
                //	(<IContextStageGL> stage.context).activateCubeRenderTexture(vo.texturesIndex, <CubeTextureBase> this._pCastingLight.shadowMapper.depthMap);
            };

            /**
            * Sets the method state for cascade shadow mapping.
            */
            ShadowMethodBase.prototype.iActivateForCascade = function (vo, stage) {
                throw new Error("This shadow method is incompatible with cascade shadows");
            };
            return ShadowMethodBase;
        })(materials.ShadowMapMethodBase);
        materials.ShadowMethodBase = ShadowMethodBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * ShadowHardMethod provides the cheapest shadow map method by using a single tap without any filtering.
        */
        var ShadowHardMethod = (function (_super) {
            __extends(ShadowHardMethod, _super);
            /**
            * Creates a new ShadowHardMethod object.
            */
            function ShadowHardMethod(castingLight) {
                _super.call(this, castingLight);
            }
            /**
            * @inheritDoc
            */
            ShadowHardMethod.prototype._pGetPlanarFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                var depthMapRegister = regCache.getFreeTextureReg();
                var decReg = regCache.getFreeFragmentConstant();

                // needs to be reserved anyway. DO NOT REMOVE
                var dataReg = regCache.getFreeFragmentConstant();

                var depthCol = regCache.getFreeFragmentVectorTemp();
                var code = "";

                vo.fragmentConstantsIndex = decReg.index * 4;
                vo.texturesIndex = depthMapRegister.index;

                code += "tex " + depthCol + ", " + this._pDepthMapCoordReg + ", " + depthMapRegister + " <2d, nearest, clamp>\n" + "dp4 " + depthCol + ".z, " + depthCol + ", " + decReg + "\n" + "slt " + targetReg + ".w, " + this._pDepthMapCoordReg + ".z, " + depthCol + ".z\n"; // 0 if in shadow

                return code;
            };

            /**
            * @inheritDoc
            */
            ShadowHardMethod.prototype._pGetPointFragmentCode = function (vo, targetReg, regCache, sharedRegisters) {
                var depthMapRegister = regCache.getFreeTextureReg();
                var decReg = regCache.getFreeFragmentConstant();
                var epsReg = regCache.getFreeFragmentConstant();
                var posReg = regCache.getFreeFragmentConstant();
                var depthSampleCol = regCache.getFreeFragmentVectorTemp();
                regCache.addFragmentTempUsages(depthSampleCol, 1);
                var lightDir = regCache.getFreeFragmentVectorTemp();
                var code = "";

                vo.fragmentConstantsIndex = decReg.index * 4;
                vo.texturesIndex = depthMapRegister.index;

                code += "sub " + lightDir + ", " + sharedRegisters.globalPositionVarying + ", " + posReg + "\n" + "dp3 " + lightDir + ".w, " + lightDir + ".xyz, " + lightDir + ".xyz\n" + "mul " + lightDir + ".w, " + lightDir + ".w, " + posReg + ".w\n" + "nrm " + lightDir + ".xyz, " + lightDir + ".xyz\n" + "tex " + depthSampleCol + ", " + lightDir + ", " + depthMapRegister + " <cube, nearest, clamp>\n" + "dp4 " + depthSampleCol + ".z, " + depthSampleCol + ", " + decReg + "\n" + "add " + targetReg + ".w, " + lightDir + ".w, " + epsReg + ".x\n" + "slt " + targetReg + ".w, " + targetReg + ".w, " + depthSampleCol + ".z\n"; // 0 if in shadow

                regCache.removeFragmentTempUsage(depthSampleCol);

                return code;
            };

            /**
            * @inheritDoc
            */
            ShadowHardMethod.prototype._iGetCascadeFragmentCode = function (vo, decodeRegister, depthTexture, depthProjection, targetRegister, regCache, sharedRegisters) {
                var temp = regCache.getFreeFragmentVectorTemp();
                return "tex " + temp + ", " + depthProjection + ", " + depthTexture + " <2d, nearest, clamp>\n" + "dp4 " + temp + ".z, " + temp + ", " + decodeRegister + "\n" + "slt " + targetRegister + ".w, " + depthProjection + ".z, " + temp + ".z\n";
            };

            /**
            * @inheritDoc
            */
            ShadowHardMethod.prototype.iActivateForCascade = function (vo, stage) {
            };
            return ShadowHardMethod;
        })(materials.ShadowMethodBase);
        materials.ShadowHardMethod = ShadowHardMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * SpecularBasicMethod provides the default shading method for Blinn-Phong specular highlights (an optimized but approximated
        * version of Phong specularity).
        */
        var SpecularBasicMethod = (function (_super) {
            __extends(SpecularBasicMethod, _super);
            /**
            * Creates a new SpecularBasicMethod object.
            */
            function SpecularBasicMethod() {
                _super.call(this);
                this._gloss = 50;
                this._specular = 1;
                this._specularColor = 0xffffff;
                this._iSpecularR = 1;
                this._iSpecularG = 1;
                this._iSpecularB = 1;
            }
            SpecularBasicMethod.prototype.iIsUsed = function (dependencyCounter) {
                if (!dependencyCounter.usesSpecular)
                    return false;

                return true;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iInitVO = function (vo) {
                vo.needsUV = this._pUseTexture;
                vo.needsNormals = vo.numLights > 0;
                vo.needsView = vo.numLights > 0;
            };

            Object.defineProperty(SpecularBasicMethod.prototype, "gloss", {
                /**
                * The sharpness of the specular highlight.
                */
                get: function () {
                    return this._gloss;
                },
                set: function (value) {
                    this._gloss = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(SpecularBasicMethod.prototype, "specular", {
                /**
                * The overall strength of the specular highlights.
                */
                get: function () {
                    return this._specular;
                },
                set: function (value) {
                    if (value == this._specular)
                        return;

                    this._specular = value;
                    this.updateSpecular();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(SpecularBasicMethod.prototype, "specularColor", {
                /**
                * The colour of the specular reflection of the surface.
                */
                get: function () {
                    return this._specularColor;
                },
                set: function (value) {
                    if (this._specularColor == value)
                        return;

                    // specular is now either enabled or disabled
                    if (this._specularColor == 0 || value == 0)
                        this.iInvalidateShaderProgram();

                    this._specularColor = value;
                    this.updateSpecular();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(SpecularBasicMethod.prototype, "texture", {
                /**
                * The bitmapData that encodes the specular highlight strength per texel in the red channel, and the sharpness
                * in the green channel. You can use SpecularBitmapTexture if you want to easily set specular and gloss maps
                * from grayscale images, but prepared images are preferred.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    var b = (value != null);

                    if (b != this._pUseTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
                        this.iInvalidateShaderProgram();

                    this._pUseTexture = b;
                    this._texture = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.copyFrom = function (method) {
                var m = method;
                var bsm = method;

                var spec = bsm;
                this.texture = spec.texture;
                this.specular = spec.specular;
                this.specularColor = spec.specularColor;
                this.gloss = spec.gloss;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iCleanCompilationData = function () {
                _super.prototype.iCleanCompilationData.call(this);
                this._pTotalLightColorReg = null;
                this._pSpecularTextureRegister = null;
                this._pSpecularTexData = null;
                this._pSpecularDataRegister = null;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iGetFragmentPreLightingCode = function (vo, regCache, sharedRegisters) {
                var code = "";

                this._pIsFirstLight = true;

                if (vo.numLights > 0) {
                    this._pSpecularDataRegister = regCache.getFreeFragmentConstant();
                    vo.fragmentConstantsIndex = this._pSpecularDataRegister.index * 4;

                    if (this._pUseTexture) {
                        this._pSpecularTexData = regCache.getFreeFragmentVectorTemp();
                        regCache.addFragmentTempUsages(this._pSpecularTexData, 1);
                        this._pSpecularTextureRegister = regCache.getFreeTextureReg();
                        vo.texturesIndex = this._pSpecularTextureRegister.index;
                        code = materials.ShaderCompilerHelper.getTex2DSampleCode(vo, this._pSpecularTexData, sharedRegisters, this._pSpecularTextureRegister, this._texture);
                    } else {
                        this._pSpecularTextureRegister = null;
                    }

                    this._pTotalLightColorReg = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(this._pTotalLightColorReg, 1);
                }

                return code;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iGetFragmentCodePerLight = function (vo, lightDirReg, lightColReg, regCache, sharedRegisters) {
                var code = "";
                var t;

                if (this._pIsFirstLight) {
                    t = this._pTotalLightColorReg;
                } else {
                    t = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(t, 1);
                }

                var viewDirReg = sharedRegisters.viewDirFragment;
                var normalReg = sharedRegisters.normalFragment;

                // blinn-phong half vector model
                code += "add " + t + ", " + lightDirReg + ", " + viewDirReg + "\n" + "nrm " + t + ".xyz, " + t + "\n" + "dp3 " + t + ".w, " + normalReg + ", " + t + "\n" + "sat " + t + ".w, " + t + ".w\n";

                if (this._pUseTexture) {
                    // apply gloss modulation from texture
                    code += "mul " + this._pSpecularTexData + ".w, " + this._pSpecularTexData + ".y, " + this._pSpecularDataRegister + ".w\n" + "pow " + t + ".w, " + t + ".w, " + this._pSpecularTexData + ".w\n";
                } else {
                    code += "pow " + t + ".w, " + t + ".w, " + this._pSpecularDataRegister + ".w\n";
                }

                // attenuate
                if (vo.useLightFallOff)
                    code += "mul " + t + ".w, " + t + ".w, " + lightDirReg + ".w\n";

                if (this._iModulateMethod != null)
                    code += this._iModulateMethod(vo, t, regCache, sharedRegisters);

                code += "mul " + t + ".xyz, " + lightColReg + ", " + t + ".w\n";

                if (!this._pIsFirstLight) {
                    code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
                    regCache.removeFragmentTempUsage(t);
                }

                this._pIsFirstLight = false;

                return code;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iGetFragmentCodePerProbe = function (vo, cubeMapReg, weightRegister, regCache, sharedRegisters) {
                var code = "";
                var t;

                // write in temporary if not first light, so we can add to total diffuse colour
                if (this._pIsFirstLight) {
                    t = this._pTotalLightColorReg;
                } else {
                    t = regCache.getFreeFragmentVectorTemp();
                    regCache.addFragmentTempUsages(t, 1);
                }

                var normalReg = sharedRegisters.normalFragment;
                var viewDirReg = sharedRegisters.viewDirFragment;

                code += "dp3 " + t + ".w, " + normalReg + ", " + viewDirReg + "\n" + "add " + t + ".w, " + t + ".w, " + t + ".w\n" + "mul " + t + ", " + t + ".w, " + normalReg + "\n" + "sub " + t + ", " + t + ", " + viewDirReg + "\n" + "tex " + t + ", " + t + ", " + cubeMapReg + " <cube," + (vo.useSmoothTextures ? "linear" : "nearest") + ",miplinear>\n" + "mul " + t + ".xyz, " + t + ", " + weightRegister + "\n";

                if (this._iModulateMethod != null)
                    code += this._iModulateMethod(vo, t, regCache, sharedRegisters);

                /*
                if (this._iModulateMethod!= null) {
                code += this._iModulateMethod(vo, t, regCache, this._sharedRegisters);
                }
                */
                if (!this._pIsFirstLight) {
                    code += "add " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + t + "\n";
                    regCache.removeFragmentTempUsage(t);
                }

                this._pIsFirstLight = false;

                return code;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iGetFragmentPostLightingCode = function (vo, targetReg, regCache, sharedRegisters) {
                var code = "";

                if (vo.numLights == 0)
                    return code;

                if (sharedRegisters.shadowTarget)
                    code += "mul " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + sharedRegisters.shadowTarget + ".w\n";

                if (this._pUseTexture) {
                    // apply strength modulation from texture
                    code += "mul " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + this._pSpecularTexData + ".x\n";
                    regCache.removeFragmentTempUsage(this._pSpecularTexData);
                }

                // apply material's specular reflection
                code += "mul " + this._pTotalLightColorReg + ".xyz, " + this._pTotalLightColorReg + ", " + this._pSpecularDataRegister + "\n" + "add " + targetReg + ".xyz, " + targetReg + ", " + this._pTotalLightColorReg + "\n";
                regCache.removeFragmentTempUsage(this._pTotalLightColorReg);

                return code;
            };

            /**
            * @inheritDoc
            */
            SpecularBasicMethod.prototype.iActivate = function (vo, stage) {
                if (vo.numLights == 0)
                    return;

                if (this._pUseTexture) {
                    stage.context.setSamplerStateAt(vo.texturesIndex, vo.repeatTextures ? away.stagegl.ContextGLWrapMode.REPEAT : away.stagegl.ContextGLWrapMode.CLAMP, vo.useSmoothTextures ? away.stagegl.ContextGLTextureFilter.LINEAR : away.stagegl.ContextGLTextureFilter.NEAREST, vo.useMipmapping ? away.stagegl.ContextGLMipFilter.MIPLINEAR : away.stagegl.ContextGLMipFilter.MIPNONE);
                    stage.context.activateTexture(vo.texturesIndex, this._texture);
                }

                var index = vo.fragmentConstantsIndex;
                var data = vo.fragmentData;
                data[index] = this._iSpecularR;
                data[index + 1] = this._iSpecularG;
                data[index + 2] = this._iSpecularB;
                data[index + 3] = this._gloss;
            };

            /**
            * Updates the specular color data used by the render state.
            */
            SpecularBasicMethod.prototype.updateSpecular = function () {
                this._iSpecularR = ((this._specularColor >> 16) & 0xff) / 0xff * this._specular;
                this._iSpecularG = ((this._specularColor >> 8) & 0xff) / 0xff * this._specular;
                this._iSpecularB = (this._specularColor & 0xff) / 0xff * this._specular;
            };
            return SpecularBasicMethod;
        })(materials.LightingMethodBase);
        materials.SpecularBasicMethod = SpecularBasicMethod;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var BlendMode = away.base.BlendMode;

        var AbstractMethodError = away.errors.AbstractMethodError;
        var ArgumentError = away.errors.ArgumentError;
        var Event = away.events.Event;

        var AGALProgramCache = away.managers.AGALProgramCache;

        var ContextGLBlendFactor = away.stagegl.ContextGLBlendFactor;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;
        var ContextGLTriangleFace = away.stagegl.ContextGLTriangleFace;

        /**
        * MaterialPassBase provides an abstract base class for material shader passes. A material pass constitutes at least
        * a render call per required renderable.
        */
        var MaterialPassBase = (function (_super) {
            __extends(MaterialPassBase, _super);
            /**
            * Creates a new MaterialPassBase object.
            */
            function MaterialPassBase() {
                var _this = this;
                _super.call(this);
                this._iPrograms = new Array(8);
                this._iProgramids = new Array(-1, -1, -1, -1, -1, -1, -1, -1);
                this._contextGLs = new Array(8);
                this._pSmooth = true;
                this._pRepeat = false;
                this._pMipmap = true;
                this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
                this._blendFactorSource = ContextGLBlendFactor.ONE;
                this._blendFactorDest = ContextGLBlendFactor.ZERO;
                this._pEnableBlending = false;
                this._pVertexConstantData = new Array();
                this._pFragmentConstantData = new Array();
                // TODO: AGAL conversion
                this._pAnimatableAttributes = new Array("va0");
                // TODO: AGAL conversion
                this._pAnimationTargetRegisters = new Array("vt0");
                // TODO: AGAL conversion
                this._pShadedTarget = "ft0";
                this._defaultCulling = ContextGLTriangleFace.BACK;
                this._pAlphaPremultiplied = false;
                this._writeDepth = true;

                this._onLightsChangeDelegate = function (event) {
                    return _this.onLightsChange(event);
                };

                this._pNumUsedStreams = 1;
                this._pNumUsedVertexConstants = 5;

                this._iUniqueId = MaterialPassBase.MATERIALPASS_ID_COUNT++;
            }
            Object.defineProperty(MaterialPassBase.prototype, "material", {
                /**
                * The material to which this pass belongs.
                */
                get: function () {
                    return this._material;
                },
                set: function (value) {
                    this._material = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "writeDepth", {
                /**
                * Indicate whether this pass should write to the depth buffer or not. Ignored when blending is enabled.
                */
                get: function () {
                    return this._writeDepth;
                },
                set: function (value) {
                    this._writeDepth = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "mipmap", {
                /**
                * Defines whether any used textures should use mipmapping.
                */
                get: function () {
                    return this._pMipmap;
                },
                set: function (value) {
                    if (this._pMipmap == value)
                        return;

                    this._pMipmap = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "smooth", {
                /**
                * Defines whether smoothing should be applied to any used textures.
                */
                get: function () {
                    return this._pSmooth;
                },
                set: function (value) {
                    if (this._pSmooth == value)
                        return;

                    this._pSmooth = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "repeat", {
                /**
                * Defines whether textures should be tiled.
                */
                get: function () {
                    return this._pRepeat;
                },
                set: function (value) {
                    if (this._pRepeat == value)
                        return;

                    this._pRepeat = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "bothSides", {
                /**
                * Defines whether or not the material should perform backface culling.
                */
                get: function () {
                    return this._pBothSides;
                },
                set: function (value) {
                    this._pBothSides = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "depthCompareMode", {
                /**
                * The depth compare mode used to render the renderables using this material.
                *
                * @see away.stagegl.ContextGLCompareMode
                */
                get: function () {
                    return this._depthCompareMode;
                },
                set: function (value) {
                    this._depthCompareMode = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "animationSet", {
                /**
                * Returns the animation data set adding animations to the material.
                */
                get: function () {
                    return this._animationSet;
                },
                set: function (value) {
                    if (this._animationSet == value)
                        return;

                    this._animationSet = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(MaterialPassBase.prototype, "renderToTexture", {
                /**
                * Specifies whether this pass renders to texture
                */
                get: function () {
                    return this._renderToTexture;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "vertexConstantData", {
                /**
                *
                */
                get: function () {
                    return this._pVertexConstantData;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "fragmentConstantData", {
                /**
                * Specifies whether this pass renders to texture
                */
                get: function () {
                    return this._pFragmentConstantData;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Cleans up any resources used by the current object.
            * @param deep Indicates whether other resources should be cleaned up, that could potentially be shared across different instances.
            */
            MaterialPassBase.prototype.dispose = function () {
                if (this._pLightPicker)
                    this._pLightPicker.removeEventListener(Event.CHANGE, this._onLightsChangeDelegate);

                for (var i = 0; i < 8; ++i) {
                    if (this._iPrograms[i]) {
                        away.managers.AGALProgramCache.getInstanceFromIndex(i).freeProgram(this._iProgramids[i]);
                        this._iPrograms[i] = null;
                    }
                }
            };

            Object.defineProperty(MaterialPassBase.prototype, "numUsedStreams", {
                /**
                * The amount of used vertex streams in the vertex code. Used by the animation code generation to know from which index on streams are available.
                */
                get: function () {
                    return this._pNumUsedStreams;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "numUsedVertexConstants", {
                /**
                * The amount of used vertex constants in the vertex code. Used by the animation code generation to know from which index on registers are available.
                */
                get: function () {
                    return this._pNumUsedVertexConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "numUsedVaryings", {
                get: function () {
                    return this._pNumUsedVaryings;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "numUsedFragmentConstants", {
                /**
                * The amount of used fragment constants in the fragment code. Used by the animation code generation to know from which index on registers are available.
                */
                get: function () {
                    return this._pNumUsedFragmentConstants;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "needFragmentAnimation", {
                /**
                * Indicates whether the pass requires any fragment animation code.
                */
                get: function () {
                    return this._pNeedFragmentAnimation;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(MaterialPassBase.prototype, "needUVAnimation", {
                /**
                * Indicates whether the pass requires any UV animation code.
                */
                get: function () {
                    return this._pNeedUVAnimation;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Sets up the animation state. This needs to be called before render()
            *
            * @private
            */
            MaterialPassBase.prototype.iUpdateAnimationState = function (renderable, stage, camera) {
                renderable.materialOwner.animator.setRenderState(stage, renderable, this._pNumUsedVertexConstants, this._pNumUsedStreams, camera);
            };

            /**
            * Renders an object to the current render target.
            *
            * @private
            */
            MaterialPassBase.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                throw new AbstractMethodError();
            };

            /**
            * Returns the vertex AGAL code for the material.
            */
            MaterialPassBase.prototype.iGetVertexCode = function () {
                throw new AbstractMethodError();
            };

            /**
            * Returns the fragment AGAL code for the material.
            */
            MaterialPassBase.prototype.iGetFragmentCode = function (fragmentAnimatorCode) {
                throw new AbstractMethodError();
            };

            /**
            * The blend mode to use when drawing this renderable. The following blend modes are supported:
            * <ul>
            * <li>BlendMode.NORMAL: No blending, unless the material inherently needs it</li>
            * <li>BlendMode.LAYER: Force blending. This will draw the object the same as NORMAL, but without writing depth writes.</li>
            * <li>BlendMode.MULTIPLY</li>
            * <li>BlendMode.ADD</li>
            * <li>BlendMode.ALPHA</li>
            * </ul>
            */
            MaterialPassBase.prototype.setBlendMode = function (value) {
                switch (value) {
                    case BlendMode.NORMAL:
                        this._blendFactorSource = ContextGLBlendFactor.ONE;
                        this._blendFactorDest = ContextGLBlendFactor.ZERO;
                        this._pEnableBlending = false;

                        break;

                    case BlendMode.LAYER:
                        this._blendFactorSource = ContextGLBlendFactor.SOURCE_ALPHA;
                        this._blendFactorDest = ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA;
                        this._pEnableBlending = true;

                        break;

                    case BlendMode.MULTIPLY:
                        this._blendFactorSource = ContextGLBlendFactor.ZERO;
                        this._blendFactorDest = ContextGLBlendFactor.SOURCE_COLOR;
                        this._pEnableBlending = true;

                        break;

                    case BlendMode.ADD:
                        this._blendFactorSource = ContextGLBlendFactor.SOURCE_ALPHA;
                        this._blendFactorDest = ContextGLBlendFactor.ONE;
                        this._pEnableBlending = true;

                        break;

                    case BlendMode.ALPHA:
                        this._blendFactorSource = ContextGLBlendFactor.ZERO;
                        this._blendFactorDest = ContextGLBlendFactor.SOURCE_ALPHA;
                        this._pEnableBlending = true;

                        break;

                    default:
                        throw new ArgumentError("Unsupported blend mode!");
                }
            };

            /**
            * Sets the render state for the pass that is independent of the rendered object. This needs to be called before
            * calling renderPass. Before activating a pass, the previously used pass needs to be deactivated.
            * @param stage The Stage object which is currently used for rendering.
            * @param camera The camera from which the scene is viewed.
            * @private
            */
            MaterialPassBase.prototype.iActivate = function (stage, camera) {
                var stageIndex = stage.stageIndex;
                var context = stage.context;

                context.setDepthTest((this._writeDepth && !this._pEnableBlending), this._depthCompareMode);

                if (this._pEnableBlending)
                    context.setBlendFactors(this._blendFactorSource, this._blendFactorDest);

                if (this._contextGLs[stageIndex] != context || !this._iPrograms[stageIndex]) {
                    this._contextGLs[stageIndex] = context;

                    this.iUpdateProgram(stage);
                    this.dispatchEvent(new Event(Event.CHANGE));
                }

                var prevUsed = MaterialPassBase._previousUsedStreams[stageIndex];
                var i;

                for (i = this._pNumUsedStreams; i < prevUsed; ++i)
                    context.setVertexBufferAt(i, null);

                prevUsed = MaterialPassBase._previousUsedTexs[stageIndex];

                for (i = this._pNumUsedTextures; i < prevUsed; ++i)
                    context.setTextureAt(i, null);

                if (this._animationSet && !this._animationSet.usesCPU)
                    this._animationSet.activate(stage, this);

                context.setProgram(this._iPrograms[stageIndex]);

                context.setCulling(this._pBothSides ? ContextGLTriangleFace.NONE : this._defaultCulling, camera.projection.coordinateSystem);

                if (this._renderToTexture) {
                    this._oldTarget = stage.renderTarget;
                    this._oldSurface = stage.renderSurfaceSelector;
                    this._oldDepthStencil = stage.enableDepthAndStencil;
                    this._oldRect = stage.scissorRect;
                }
            };

            /**
            * Clears the render state for the pass. This needs to be called before activating another pass.
            * @param stage The Stage used for rendering
            *
            * @private
            */
            MaterialPassBase.prototype.iDeactivate = function (stage) {
                var stageIndex = stage.stageIndex;
                MaterialPassBase._previousUsedStreams[stageIndex] = this._pNumUsedStreams;
                MaterialPassBase._previousUsedTexs[stageIndex] = this._pNumUsedTextures;

                if (this._animationSet && !this._animationSet.usesCPU)
                    this._animationSet.deactivate(stage, this);

                if (this._renderToTexture) {
                    // kindly restore state
                    stage.context.setRenderTarget(this._oldTarget, this._oldDepthStencil, this._oldSurface);
                    stage.scissorRect = this._oldRect;
                }

                stage.context.setDepthTest(true, ContextGLCompareMode.LESS_EQUAL); // TODO : imeplement
            };

            /**
            * Marks the shader program as invalid, so it will be recompiled before the next render.
            *
            * @param updateMaterial Indicates whether the invalidation should be performed on the entire material. Should always pass "true" unless it's called from the material itself.
            */
            MaterialPassBase.prototype.iInvalidateShaderProgram = function (updateMaterial) {
                if (typeof updateMaterial === "undefined") { updateMaterial = true; }
                for (var i = 0; i < 8; ++i)
                    this._iPrograms[i] = null;

                if (this._material && updateMaterial)
                    this._material.iInvalidatePasses(this);
            };

            /**
            * Compiles the shader program.
            * @param polyOffsetReg An optional register that contains an amount by which to inflate the model (used in single object depth map rendering).
            */
            MaterialPassBase.prototype.iUpdateProgram = function (stage) {
                var animatorCode = "";
                var UVAnimatorCode = "";
                var fragmentAnimatorCode = "";

                if (this._animationSet && !this._animationSet.usesCPU) {
                    animatorCode = this._animationSet.getAGALVertexCode(this, this._pAnimatableAttributes, this._pAnimationTargetRegisters, stage.profile);

                    if (this._pNeedFragmentAnimation)
                        fragmentAnimatorCode = this._animationSet.getAGALFragmentCode(this, this._pShadedTarget, stage.profile);

                    if (this._pNeedUVAnimation)
                        UVAnimatorCode = this._animationSet.getAGALUVCode(this, this._pUVSource, this._pUVTarget);

                    this._animationSet.doneAGALCode(this);
                } else {
                    var len = this._pAnimatableAttributes.length;

                    for (var i = 0; i < len; ++i)
                        animatorCode += "mov " + this._pAnimationTargetRegisters[i] + ", " + this._pAnimatableAttributes[i] + "\n";

                    if (this._pNeedUVAnimation)
                        UVAnimatorCode = "mov " + this._pUVTarget + "," + this._pUVSource + "\n";
                }

                var vertexCode = animatorCode + UVAnimatorCode + this.iGetVertexCode();

                var fragmentCode = this.iGetFragmentCode(fragmentAnimatorCode);

                if (away.Debug.ENABLE_LOG) {
                    away.Debug.log("Compiling AGAL Code:");
                    away.Debug.log("--------------------");
                    away.Debug.log(vertexCode);
                    away.Debug.log("--------------------");
                    away.Debug.log(fragmentCode);
                }

                AGALProgramCache.getInstance(stage).setProgram(this._iProgramids, this._iPrograms, vertexCode, fragmentCode);
            };

            Object.defineProperty(MaterialPassBase.prototype, "lightPicker", {
                /**
                * The light picker used by the material to provide lights to the material if it supports lighting.
                *
                * @see away.materials.LightPickerBase
                * @see away.materials.StaticLightPicker
                */
                get: function () {
                    return this._pLightPicker;
                },
                set: function (value) {
                    if (this._pLightPicker)
                        this._pLightPicker.removeEventListener(Event.CHANGE, this._onLightsChangeDelegate);

                    this._pLightPicker = value;

                    if (this._pLightPicker)
                        this._pLightPicker.addEventListener(Event.CHANGE, this._onLightsChangeDelegate);

                    this.pUpdateLights();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Called when the light picker's configuration changes.
            */
            MaterialPassBase.prototype.onLightsChange = function (event) {
                this.pUpdateLights();
            };

            /**
            * Implemented by subclasses if the pass uses lights to update the shader.
            */
            MaterialPassBase.prototype.pUpdateLights = function () {
            };

            Object.defineProperty(MaterialPassBase.prototype, "alphaPremultiplied", {
                /**
                * Indicates whether visible textures (or other pixels) used by this material have
                * already been premultiplied. Toggle this if you are seeing black halos around your
                * blended alpha edges.
                */
                get: function () {
                    return this._pAlphaPremultiplied;
                },
                set: function (value) {
                    if (this._pAlphaPremultiplied == value)
                        return;

                    this._pAlphaPremultiplied = value;

                    this.iInvalidateShaderProgram(false);
                },
                enumerable: true,
                configurable: true
            });


            MaterialPassBase.prototype._iIncludeDependencies = function (dependencyCounter) {
            };
            MaterialPassBase.MATERIALPASS_ID_COUNT = 0;

            MaterialPassBase._previousUsedStreams = new Array(0, 0, 0, 0, 0, 0, 0, 0);
            MaterialPassBase._previousUsedTexs = new Array(0, 0, 0, 0, 0, 0, 0, 0);
            return MaterialPassBase;
        })(away.events.EventDispatcher);
        materials.MaterialPassBase = MaterialPassBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        var Matrix3DUtils = away.geom.Matrix3DUtils;

        var ContextGLProgramType = away.stagegl.ContextGLProgramType;
        var ContextGLTextureFormat = away.stagegl.ContextGLTextureFormat;

        /**
        * DepthMapPass is a pass that writes depth values to a depth map as a 32-bit value exploded over the 4 texture channels.
        * This is used to render shadow maps, depth maps, etc.
        */
        var DepthMapPass = (function (_super) {
            __extends(DepthMapPass, _super);
            /**
            * Creates a new DepthMapPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function DepthMapPass(material) {
                _super.call(this);
                this._alphaThreshold = 0;

                this.material = material;

                this._data = new Array(1.0, 255.0, 65025.0, 16581375.0, 1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            }
            Object.defineProperty(DepthMapPass.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (value < 0)
                        value = 0;
                    else if (value > 1)
                        value = 1;

                    if (value == this._alphaThreshold)
                        return;

                    if (value == 0 || this._alphaThreshold == 0)
                        this.iInvalidateShaderProgram();

                    this._alphaThreshold = value;
                    this._data[8] = this._alphaThreshold;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DepthMapPass.prototype, "alphaMask", {
                /**
                * A texture providing alpha data to be able to prevent semi-transparent pixels to write to the alpha mask.
                * Usually the diffuse texture when alphaThreshold is used.
                */
                get: function () {
                    return this._alphaMask;
                },
                set: function (value) {
                    this._alphaMask = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            DepthMapPass.prototype.iGetVertexCode = function () {
                var code = "";

                // project
                //TODO: AGAL <> GLSL conversion
                code = "m44 vt1, vt0, vc0\n" + "mov op, vt1\n";

                if (this._alphaThreshold > 0) {
                    this._pNumUsedTextures = 1;
                    this._pNumUsedStreams = 2;
                    code += "mov v0, vt1\n" + "mov v1, va1\n";
                } else {
                    this._pNumUsedTextures = 0;
                    this._pNumUsedStreams = 1;
                    code += "mov v0, vt1\n";
                }

                return code;
            };

            /**
            * @inheritDoc
            */
            DepthMapPass.prototype.iGetFragmentCode = function (code) {
                var wrap = this._pRepeat ? "wrap" : "clamp";
                var filter;

                if (this._pSmooth)
                    filter = this._pMipmap ? "linear,miplinear" : "linear";
                else
                    filter = this._pMipmap ? "nearest,mipnearest" : "nearest";

                var codeF = "div ft2, v0, v0.w\n" + "mul ft0, fc0, ft2.z\n" + "frc ft0, ft0\n" + "mul ft1, ft0.yzww, fc1\n";

                //codeF += "mov ft1.w, fc1.w	\n" +
                //    "mov ft0.w, fc0.x	\n";
                if (this._alphaThreshold > 0) {
                    var format;

                    switch (this._alphaMask.format) {
                        case ContextGLTextureFormat.COMPRESSED:
                            format = "dxt1,";
                            break;

                        case "compressedAlpha":
                            format = "dxt5,";
                            break;

                        default:
                            format = "";
                    }

                    codeF += "tex ft3, v1, fs0 <2d," + filter + "," + format + wrap + ">\n" + "sub ft3.w, ft3.w, fc2.x\n" + "kil ft3.w\n";
                }

                codeF += "sub oc, ft0, ft1		\n";

                return codeF;
            };

            /**
            * @inheritDoc
            */
            DepthMapPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                var context = stage.context;

                if (this._alphaThreshold > 0)
                    context.activateBuffer(1, renderable.getVertexData(TriangleSubGeometry.UV_DATA), renderable.getVertexOffset(TriangleSubGeometry.UV_DATA), TriangleSubGeometry.UV_FORMAT);

                var matrix = Matrix3DUtils.CALCULATION_MATRIX;

                matrix.copyFrom(renderable.sourceEntity.getRenderSceneTransform(camera));
                matrix.append(viewProjection);
                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, matrix, true);

                context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            DepthMapPass.prototype.iActivate = function (stage, camera) {
                var context = stage.context;

                _super.prototype.iActivate.call(this, stage, camera);

                if (this._alphaThreshold > 0) {
                    context.activateTexture(0, this._alphaMask);
                    context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, this._data, 3);
                } else {
                    context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, this._data, 2);
                }
            };
            return DepthMapPass;
        })(materials.MaterialPassBase);
        materials.DepthMapPass = DepthMapPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
var away;
(function (away) {
    ///<reference path="../../_definitions.ts"/>
    (function (materials) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        var Matrix3DUtils = away.geom.Matrix3DUtils;

        var ContextGLProgramType = away.stagegl.ContextGLProgramType;
        var ContextGLTextureFormat = away.stagegl.ContextGLTextureFormat;

        /**
        * DistanceMapPass is a pass that writes distance values to a depth map as a 32-bit value exploded over the 4 texture channels.
        * This is used to render omnidirectional shadow maps.
        */
        var DistanceMapPass = (function (_super) {
            __extends(DistanceMapPass, _super);
            /**
            * Creates a new DistanceMapPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function DistanceMapPass(material) {
                _super.call(this);

                this.material = material;

                this._fragmentData = new Array(1.0, 255.0, 65025.0, 16581375.0, 1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                this._vertexData = new Array(4);
                this._vertexData[3] = 1;
                this._pNumUsedVertexConstants = 9;
            }
            Object.defineProperty(DistanceMapPass.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (value < 0)
                        value = 0;
                    else if (value > 1)
                        value = 1;

                    if (value == this._alphaThreshold)
                        return;

                    if (value == 0 || this._alphaThreshold == 0)
                        this.iInvalidateShaderProgram();

                    this._alphaThreshold = value;
                    this._fragmentData[8] = this._alphaThreshold;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DistanceMapPass.prototype, "alphaMask", {
                /**
                * A texture providing alpha data to be able to prevent semi-transparent pixels to write to the alpha mask.
                * Usually the diffuse texture when alphaThreshold is used.
                */
                get: function () {
                    return this._alphaMask;
                },
                set: function (value) {
                    this._alphaMask = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            DistanceMapPass.prototype.iGetVertexCode = function () {
                //TODO: AGAL<> GLSL
                var code;
                code = "m44 op, vt0, vc0\n" + "m44 vt1, vt0, vc5\n" + "sub v0, vt1, vc9\n";

                if (this._alphaThreshold > 0) {
                    code += "mov v1, va1\n";

                    this._pNumUsedTextures = 1;
                    this._pNumUsedStreams = 2;
                } else {
                    this._pNumUsedTextures = 0;
                    this._pNumUsedStreams = 1;
                }

                return code;
            };

            /**
            * @inheritDoc
            */
            DistanceMapPass.prototype.iGetFragmentCode = function (animationCode) {
                var code;
                var wrap = this._pRepeat ? "wrap" : "clamp";
                var filter;

                if (this._pSmooth)
                    filter = this._pMipmap ? "linear,miplinear" : "linear";
                else
                    filter = this._pMipmap ? "nearest,mipnearest" : "nearest";

                //TODO: AGAL<> GLSL
                // squared distance to view
                code = "dp3 ft2.z, v0.xyz, v0.xyz\n" + "mul ft0, fc0, ft2.z	\n" + "frc ft0, ft0\n" + "mul ft1, ft0.yzww, fc1\n";

                if (this._alphaThreshold > 0) {
                    var format;

                    switch (this._alphaMask.format) {
                        case ContextGLTextureFormat.COMPRESSED:
                            format = "dxt1,";
                            break;

                        case "compressedAlpha":
                            format = "dxt5,";
                            break;

                        default:
                            format = "";
                    }

                    code += "tex ft3, v1, fs0 <2d," + filter + "," + format + wrap + ">\n" + "sub ft3.w, ft3.w, fc2.x\n" + "kil ft3.w\n";
                }

                code += "sub oc, ft0, ft1		\n";

                return code;
            };

            /**
            * @inheritDoc
            */
            DistanceMapPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                var context = stage.context;
                var pos = camera.scenePosition;

                this._vertexData[0] = pos.x;
                this._vertexData[1] = pos.y;
                this._vertexData[2] = pos.z;
                this._vertexData[3] = 1;

                var sceneTransform = renderable.sourceEntity.getRenderSceneTransform(camera);

                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 5, sceneTransform, true);

                context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 9, this._vertexData, 1);

                if (this._alphaThreshold > 0)
                    context.activateBuffer(1, renderable.getVertexData(TriangleSubGeometry.SECONDARY_UV_DATA), renderable.getVertexOffset(TriangleSubGeometry.SECONDARY_UV_DATA), TriangleSubGeometry.SECONDARY_UV_FORMAT);

                var matrix = Matrix3DUtils.CALCULATION_MATRIX;

                matrix.copyFrom(sceneTransform);
                matrix.append(viewProjection);

                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, matrix, true);

                context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            DistanceMapPass.prototype.iActivate = function (stage, camera) {
                var context = stage.context;
                _super.prototype.iActivate.call(this, stage, camera);

                var f = camera.projection.far;

                f = 1 / (2 * f * f);

                // sqrt(f*f+f*f) is largest possible distance for any frustum, so we need to divide by it. Rarely a tight fit, but with 32 bits precision, it's enough.
                this._fragmentData[0] = 1 * f;
                this._fragmentData[1] = 255.0 * f;
                this._fragmentData[2] = 65025.0 * f;
                this._fragmentData[3] = 16581375.0 * f;

                if (this._alphaThreshold > 0) {
                    context.activateTexture(0, this._alphaMask);
                    context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, this._fragmentData, 3);
                } else {
                    context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, 0, this._fragmentData, 2);
                }
            };
            return DistanceMapPass;
        })(materials.MaterialPassBase);
        materials.DistanceMapPass = DistanceMapPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var LineSubGeometry = away.base.LineSubGeometry;

        var Matrix3D = away.geom.Matrix3D;

        var ContextGLProgramType = away.stagegl.ContextGLProgramType;

        /**
        * LineBasicPass is a material pass that draws wireframe segments.
        */
        var LineBasicPass = (function (_super) {
            __extends(LineBasicPass, _super);
            /**
            * Creates a new SegmentPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function LineBasicPass(material) {
                _super.call(this);
                this._constants = new Array(0, 0, 0, 0);

                this.material = material;

                this._calcMatrix = new Matrix3D();

                this._constants[1] = 1 / 255;
            }
            Object.defineProperty(LineBasicPass.prototype, "thickness", {
                get: function () {
                    return this._thickness;
                },
                set: function (value) {
                    this._thickness = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            LineBasicPass.prototype.iGetVertexCode = function () {
                return "m44 vt0, va0, vc8			\n" + "m44 vt1, va1, vc8			\n" + "sub vt2, vt1, vt0 			\n" + "slt vt5.x, vt0.z, vc7.z			\n" + "sub vt5.y, vc5.x, vt5.x			\n" + "add vt4.x, vt0.z, vc7.z			\n" + "sub vt4.y, vt0.z, vt1.z			\n" + "seq vt4.z, vt4.y vc6.x			\n" + "add vt4.y, vt4.y, vt4.z			\n" + "div vt4.z, vt4.x, vt4.y			\n" + "mul vt4.xyz, vt4.zzz, vt2.xyz	\n" + "add vt3.xyz, vt0.xyz, vt4.xyz	\n" + "mov vt3.w, vc5.x			\n" + "mul vt0, vt0, vt5.yyyy			\n" + "mul vt3, vt3, vt5.xxxx			\n" + "add vt0, vt0, vt3				\n" + "sub vt2, vt1, vt0 			\n" + "nrm vt2.xyz, vt2.xyz			\n" + "nrm vt5.xyz, vt0.xyz			\n" + "mov vt5.w, vc5.x				\n" + "crs vt3.xyz, vt2, vt5			\n" + "nrm vt3.xyz, vt3.xyz			\n" + "mul vt3.xyz, vt3.xyz, va2.xxx	\n" + "mov vt3.w, vc5.x			\n" + "dp3 vt4.x, vt0, vc6			\n" + "mul vt4.x, vt4.x, vc7.x			\n" + "mul vt3.xyz, vt3.xyz, vt4.xxx	\n" + "add vt0.xyz, vt0.xyz, vt3.xyz	\n" + "m44 op, vt0, vc0			\n" + "mov v0, va3				\n";
            };

            /**
            * @inheritDoc
            */
            LineBasicPass.prototype.iGetFragmentCode = function (animationCode) {
                return "mov oc, v0\n";
            };

            /**
            * @inheritDoc
            * todo: keep maps in dictionary per renderable
            */
            LineBasicPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                var context = stage.context;
                this._calcMatrix.copyFrom(renderable.sourceEntity.sceneTransform);
                this._calcMatrix.append(camera.inverseSceneTransform);

                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 8, this._calcMatrix, true);

                context.activateBuffer(0, renderable.getVertexData(LineSubGeometry.START_POSITION_DATA), renderable.getVertexOffset(LineSubGeometry.START_POSITION_DATA), LineSubGeometry.POSITION_FORMAT);
                context.activateBuffer(1, renderable.getVertexData(LineSubGeometry.END_POSITION_DATA), renderable.getVertexOffset(LineSubGeometry.END_POSITION_DATA), LineSubGeometry.POSITION_FORMAT);
                context.activateBuffer(2, renderable.getVertexData(LineSubGeometry.THICKNESS_DATA), renderable.getVertexOffset(LineSubGeometry.THICKNESS_DATA), LineSubGeometry.THICKNESS_FORMAT);
                context.activateBuffer(3, renderable.getVertexData(LineSubGeometry.COLOR_DATA), renderable.getVertexOffset(LineSubGeometry.COLOR_DATA), LineSubGeometry.COLOR_FORMAT);

                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            LineBasicPass.prototype.iActivate = function (stage, camera) {
                var context = stage.context;
                _super.prototype.iActivate.call(this, stage, camera);

                this._constants[0] = this._thickness / ((stage.scissorRect) ? Math.min(stage.scissorRect.width, stage.scissorRect.height) : Math.min(stage.width, stage.height));

                // value to convert distance from camera to model length per pixel width
                this._constants[2] = camera.projection.near;

                context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 5, LineBasicPass.pONE_VECTOR, 1);
                context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 6, LineBasicPass.pFRONT_VECTOR, 1);
                context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 7, this._constants, 1);

                // projection matrix
                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, camera.projection.matrix, true);
            };

            /**
            * @inheritDoc
            */
            LineBasicPass.prototype.pDeactivate = function (stage) {
                var context = stage.context;
                context.setVertexBufferAt(0, null);
                context.setVertexBufferAt(1, null);
                context.setVertexBufferAt(2, null);
                context.setVertexBufferAt(3, null);
            };
            LineBasicPass.pONE_VECTOR = Array(1, 1, 1, 1);
            LineBasicPass.pFRONT_VECTOR = Array(0, 0, -1, 0);
            return LineBasicPass;
        })(materials.MaterialPassBase);
        materials.LineBasicPass = LineBasicPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var TriangleSubGeometry = away.base.TriangleSubGeometry;

        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;
        var ContextGLMipFilter = away.stagegl.ContextGLMipFilter;
        var ContextGLProgramType = away.stagegl.ContextGLProgramType;
        var ContextGLTextureFilter = away.stagegl.ContextGLTextureFilter;

        var ContextGLWrapMode = away.stagegl.ContextGLWrapMode;

        /**
        * SkyboxPass provides a material pass exclusively used to render sky boxes from a cube texture.
        */
        var SkyboxPass = (function (_super) {
            __extends(SkyboxPass, _super);
            /**
            * Creates a new SkyboxPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function SkyboxPass(material) {
                _super.call(this);

                this.material = material;
                this.mipmap = false;

                this._pNumUsedTextures = 1;
                this._vertexData = new Array(0, 0, 0, 0, 1, 1, 1, 1);
            }
            Object.defineProperty(SkyboxPass.prototype, "cubeTexture", {
                /**
                * The cube texture to use as the skybox.
                */
                get: function () {
                    return this._cubeTexture;
                },
                set: function (value) {
                    this._cubeTexture = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            SkyboxPass.prototype.iGetVertexCode = function () {
                return "mul vt0, va0, vc5\n" + "add vt0, vt0, vc4\n" + "m44 op, vt0, vc0\n" + "mov v0, va0\n";
            };

            /**
            * @inheritDoc
            */
            SkyboxPass.prototype.iGetFragmentCode = function (animationCode) {
                var mip = ",mipnone";

                if (this._cubeTexture.hasMipmaps)
                    mip = ",miplinear";

                return "tex ft0, v0, fs0 <cube," + materials.ShaderCompilerHelper.getFormatStringForTexture(this._cubeTexture) + "linear,clamp" + mip + ">\n" + "mov oc, ft0\n";
            };

            /**
            * @inheritDoc
            */
            SkyboxPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                var context = stage.context;
                var pos = camera.scenePosition;
                this._vertexData[0] = pos.x;
                this._vertexData[1] = pos.y;
                this._vertexData[2] = pos.z;
                this._vertexData[4] = this._vertexData[5] = this._vertexData[6] = camera.projection.far / Math.sqrt(3);
                context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, viewProjection, true);
                context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 4, this._vertexData, 2);

                context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            SkyboxPass.prototype.iActivate = function (stage, camera) {
                _super.prototype.iActivate.call(this, stage, camera);
                var context = stage.context;
                context.setSamplerStateAt(0, ContextGLWrapMode.CLAMP, ContextGLTextureFilter.LINEAR, this._cubeTexture.hasMipmaps ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
                context.setDepthTest(false, ContextGLCompareMode.LESS);
                context.activateCubeTexture(0, this._cubeTexture);
            };
            return SkyboxPass;
        })(materials.MaterialPassBase);
        materials.SkyboxPass = SkyboxPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var SubGeometry = away.base.TriangleSubGeometry;

        var Matrix3DUtils = away.geom.Matrix3DUtils;

        var ContextGLMipFilter = away.stagegl.ContextGLMipFilter;
        var ContextGLTextureFilter = away.stagegl.ContextGLTextureFilter;
        var ContextGLWrapMode = away.stagegl.ContextGLWrapMode;

        /**
        * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
        * using material methods to define their appearance.
        */
        var TriangleBasicPass = (function (_super) {
            __extends(TriangleBasicPass, _super);
            /**
            * Creates a new CompiledPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function TriangleBasicPass(material) {
                _super.call(this);
                this._alphaThreshold = 0;
                this._diffuseColor = 0xffffff;
                this._diffuseR = 1;
                this._diffuseG = 1;
                this._diffuseB = 1;
                this._diffuseA = 1;
                this._preserveAlpha = true;
                this._animateUVs = false;
                this._forceSeparateMVP = false;

                this.material = material;

                this._basicDependencyVO = new materials.DependencyVO();
            }
            Object.defineProperty(TriangleBasicPass.prototype, "forceSeparateMVP", {
                /**
                * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
                * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
                * projection code.
                */
                get: function () {
                    return this._forceSeparateMVP;
                },
                set: function (value) {
                    this._forceSeparateMVP = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicPass.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (value < 0)
                        value = 0;
                    else if (value > 1)
                        value = 1;

                    if (value == this._alphaThreshold)
                        return;

                    if (value == 0 || this._alphaThreshold == 0)
                        this.iInvalidateShaderProgram();

                    this._alphaThreshold = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicPass.prototype, "diffuseAlpha", {
                /**
                * The alpha component of the diffuse reflection.
                */
                get: function () {
                    return this._diffuseA;
                },
                set: function (value) {
                    this._diffuseA = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicPass.prototype, "diffuseColor", {
                /**
                * The color of the diffuse reflection when not using a texture.
                */
                get: function () {
                    return this._diffuseColor;
                },
                set: function (diffuseColor) {
                    this._diffuseColor = diffuseColor;

                    this._diffuseR = ((this._diffuseColor >> 16) & 0xff) / 0xff;
                    this._diffuseG = ((this._diffuseColor >> 8) & 0xff) / 0xff;
                    this._diffuseB = (this._diffuseColor & 0xff) / 0xff;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicPass.prototype, "texture", {
                /**
                * The bitmapData to use to define the diffuse reflection color per texel.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    var b = (value != null);

                    if (b != this._pUseTexture || (value && this._texture && (value.hasMipmaps != this._texture.hasMipmaps || value.format != this._texture.format)))
                        this.iInvalidateShaderProgram();

                    this._pUseTexture = b;
                    this._texture = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iUpdateProgram = function (stage) {
                this.reset(stage.profile);
                _super.prototype.iUpdateProgram.call(this, stage);
            };

            /**
            * Resets the compilation state.
            *
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleBasicPass.prototype.reset = function (profile) {
                this.iInitCompiler(profile);

                this.pUpdateShaderProperties();
                this.initConstantData();

                this.pCleanUp();
            };

            /**
            * Updates the amount of used register indices.
            */
            TriangleBasicPass.prototype.updateUsedOffsets = function () {
                this._pNumUsedVertexConstants = this._pCompiler.numUsedVertexConstants;
                this._pNumUsedFragmentConstants = this._pCompiler.numUsedFragmentConstants;
                this._pNumUsedStreams = this._pCompiler.numUsedStreams;
                this._pNumUsedTextures = this._pCompiler.numUsedTextures;
                this._pNumUsedVaryings = this._pCompiler.numUsedVaryings;
                this._pNumUsedFragmentConstants = this._pCompiler.numUsedFragmentConstants;
            };

            /**
            * Initializes the unchanging constant data for this material.
            */
            TriangleBasicPass.prototype.initConstantData = function () {
                this._pVertexConstantData.length = this._pNumUsedVertexConstants * 4;
                this._pFragmentConstantData.length = this._pNumUsedFragmentConstants * 4;

                this.pInitCommonsData();

                if (this._uvTransformIndex >= 0)
                    this.pInitUVTransformData();

                if (this._pCameraPositionIndex >= 0)
                    this._pVertexConstantData[this._pCameraPositionIndex + 3] = 1;
            };

            /**
            * Initializes the compiler for this pass.
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleBasicPass.prototype.iInitCompiler = function (profile) {
                this._pCompiler = this.pCreateCompiler(profile);
                this._pCompiler.forceSeperateMVP = this._forceSeparateMVP;
                this._pCompiler.animateUVs = this._animateUVs;
                this._pCompiler.preserveAlpha = this._preserveAlpha && this._pEnableBlending;
                this._pCompiler.compile();
            };

            /**
            * Factory method to create a concrete compiler object for this pass.
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleBasicPass.prototype.pCreateCompiler = function (profile) {
                return new materials.ShaderBasicCompiler(this, profile);
            };

            /**
            * Copies the shader's properties from the compiler.
            */
            TriangleBasicPass.prototype.pUpdateShaderProperties = function () {
                this._pAnimatableAttributes = this._pCompiler.animatableAttributes;
                this._pAnimationTargetRegisters = this._pCompiler.animationTargetRegisters;
                this._vertexCode = this._pCompiler.vertexCode;
                this._framentPostLightCode = this._pCompiler.fragmentCode;
                this._pNeedUVAnimation = this._pCompiler.needUVAnimation;
                this._pUVSource = this._pCompiler.UVSource;
                this._pUVTarget = this._pCompiler.UVTarget;

                this.pUpdateRegisterIndices();
                this.updateUsedOffsets();
            };

            /**
            * Updates the indices for various registers.
            */
            TriangleBasicPass.prototype.pUpdateRegisterIndices = function () {
                this._uvBufferIndex = this._pCompiler.uvBufferIndex;
                this._uvTransformIndex = this._pCompiler.uvTransformIndex;
                this._secondaryUVBufferIndex = this._pCompiler.secondaryUVBufferIndex;
                this._normalBufferIndex = this._pCompiler.normalBufferIndex;
                this._tangentBufferIndex = this._pCompiler.tangentBufferIndex;
                this._pCameraPositionIndex = this._pCompiler.cameraPositionIndex;
                this._commonsDataIndex = this._pCompiler.commonsDataIndex;
                this._sceneMatrixIndex = this._pCompiler.sceneMatrixIndex;
                this._sceneNormalMatrixIndex = this._pCompiler.sceneNormalMatrixIndex;
            };

            Object.defineProperty(TriangleBasicPass.prototype, "preserveAlpha", {
                /**
                * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
                */
                get: function () {
                    return this._preserveAlpha;
                },
                set: function (value) {
                    if (this._preserveAlpha == value)
                        return;

                    this._preserveAlpha = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicPass.prototype, "animateUVs", {
                /**
                * Indicate whether UV coordinates need to be animated using the renderable's transformUV matrix.
                */
                get: function () {
                    return this._animateUVs;
                },
                set: function (value) {
                    this._animateUVs = value;

                    if ((value && !this._animateUVs) || (!value && this._animateUVs))
                        this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iInvalidateShaderProgram = function (updateMaterial) {
                if (typeof updateMaterial === "undefined") { updateMaterial = true; }
                var oldPasses = this._iPasses;
                this._iPasses = new Array();

                if (!oldPasses || this._iPasses.length != oldPasses.length) {
                    this._iPassesDirty = true;
                    return;
                }

                for (var i = 0; i < this._iPasses.length; ++i) {
                    if (this._iPasses[i] != oldPasses[i]) {
                        this._iPassesDirty = true;
                        return;
                    }
                }

                _super.prototype.iInvalidateShaderProgram.call(this, updateMaterial);
            };

            /**
            * Initializes the default UV transformation matrix.
            */
            TriangleBasicPass.prototype.pInitUVTransformData = function () {
                this._pVertexConstantData[this._uvTransformIndex] = 1;
                this._pVertexConstantData[this._uvTransformIndex + 1] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 2] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 3] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 4] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 5] = 1;
                this._pVertexConstantData[this._uvTransformIndex + 6] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 7] = 0;
            };

            /**
            * Initializes commonly required constant values.
            */
            TriangleBasicPass.prototype.pInitCommonsData = function () {
                this._pFragmentConstantData[this._commonsDataIndex] = .5;
                this._pFragmentConstantData[this._commonsDataIndex + 1] = 0;
                this._pFragmentConstantData[this._commonsDataIndex + 2] = 1 / 255;
                this._pFragmentConstantData[this._commonsDataIndex + 3] = 1;
            };

            /**
            * Cleans up the after compiling.
            */
            TriangleBasicPass.prototype.pCleanUp = function () {
                this._pCompiler.dispose();
                this._pCompiler = null;
            };

            /**
            * Called when any method's shader code is invalidated.
            */
            TriangleBasicPass.prototype.onShaderInvalidated = function (event) {
                this.iInvalidateShaderProgram();
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iGetVertexCode = function () {
                return this._vertexCode;
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iGetFragmentCode = function (animatorCode) {
                return animatorCode + this._framentPostLightCode;
            };

            // RENDER LOOP
            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iActivate = function (stage, camera) {
                _super.prototype.iActivate.call(this, stage, camera);

                if (this._pUseTexture) {
                    stage.context.setSamplerStateAt(this._basicDependencyVO.texturesIndex, this._basicDependencyVO.repeatTextures ? ContextGLWrapMode.REPEAT : ContextGLWrapMode.CLAMP, this._basicDependencyVO.useSmoothTextures ? ContextGLTextureFilter.LINEAR : ContextGLTextureFilter.NEAREST, this._basicDependencyVO.useMipmapping ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
                    stage.context.activateTexture(this._basicDependencyVO.texturesIndex, this._texture);

                    if (this._alphaThreshold > 0)
                        this._basicDependencyVO.fragmentData[this._basicDependencyVO.fragmentConstantsIndex] = this._alphaThreshold;
                } else {
                    var index = this._basicDependencyVO.fragmentConstantsIndex;
                    var data = this._basicDependencyVO.fragmentData;
                    data[index] = this._diffuseR;
                    data[index + 1] = this._diffuseG;
                    data[index + 2] = this._diffuseB;
                    data[index + 3] = this._diffuseA;
                }
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                var i;
                var context = stage.context;

                if (this._uvBufferIndex >= 0)
                    context.activateBuffer(this._uvBufferIndex, renderable.getVertexData(SubGeometry.UV_DATA), renderable.getVertexOffset(SubGeometry.UV_DATA), SubGeometry.UV_FORMAT);

                if (this._secondaryUVBufferIndex >= 0)
                    context.activateBuffer(this._secondaryUVBufferIndex, renderable.getVertexData(SubGeometry.SECONDARY_UV_DATA), renderable.getVertexOffset(SubGeometry.SECONDARY_UV_DATA), SubGeometry.SECONDARY_UV_FORMAT);

                if (this._normalBufferIndex >= 0)
                    context.activateBuffer(this._normalBufferIndex, renderable.getVertexData(SubGeometry.NORMAL_DATA), renderable.getVertexOffset(SubGeometry.NORMAL_DATA), SubGeometry.NORMAL_FORMAT);

                if (this._tangentBufferIndex >= 0)
                    context.activateBuffer(this._tangentBufferIndex, renderable.getVertexData(SubGeometry.TANGENT_DATA), renderable.getVertexOffset(SubGeometry.TANGENT_DATA), SubGeometry.TANGENT_FORMAT);

                if (this._animateUVs) {
                    var uvTransform = renderable.materialOwner.uvTransform.matrix;

                    if (uvTransform) {
                        this._pVertexConstantData[this._uvTransformIndex] = uvTransform.a;
                        this._pVertexConstantData[this._uvTransformIndex + 1] = uvTransform.b;
                        this._pVertexConstantData[this._uvTransformIndex + 3] = uvTransform.tx;
                        this._pVertexConstantData[this._uvTransformIndex + 4] = uvTransform.c;
                        this._pVertexConstantData[this._uvTransformIndex + 5] = uvTransform.d;
                        this._pVertexConstantData[this._uvTransformIndex + 7] = uvTransform.ty;
                    } else {
                        this._pVertexConstantData[this._uvTransformIndex] = 1;
                        this._pVertexConstantData[this._uvTransformIndex + 1] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 3] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 4] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 5] = 1;
                        this._pVertexConstantData[this._uvTransformIndex + 7] = 0;
                    }
                }

                if (this._sceneMatrixIndex >= 0) {
                    renderable.sourceEntity.getRenderSceneTransform(camera).copyRawDataTo(this._pVertexConstantData, this._sceneMatrixIndex, true);
                    viewProjection.copyRawDataTo(this._pVertexConstantData, 0, true);
                } else {
                    var matrix3D = Matrix3DUtils.CALCULATION_MATRIX;

                    matrix3D.copyFrom(renderable.sourceEntity.getRenderSceneTransform(camera));
                    matrix3D.append(viewProjection);

                    matrix3D.copyRawDataTo(this._pVertexConstantData, 0, true);
                }

                if (this._sceneNormalMatrixIndex >= 0)
                    renderable.sourceEntity.inverseSceneTransform.copyRawDataTo(this._pVertexConstantData, this._sceneNormalMatrixIndex, false);

                context.setProgramConstantsFromArray(away.stagegl.ContextGLProgramType.VERTEX, 0, this._pVertexConstantData, this._pNumUsedVertexConstants);
                context.setProgramConstantsFromArray(away.stagegl.ContextGLProgramType.FRAGMENT, 0, this._pFragmentConstantData, this._pNumUsedFragmentConstants);

                context.activateBuffer(0, renderable.getVertexData(SubGeometry.POSITION_DATA), renderable.getVertexOffset(SubGeometry.POSITION_DATA), SubGeometry.POSITION_FORMAT);
                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype.iDeactivate = function (stage) {
                _super.prototype.iDeactivate.call(this, stage);
            };

            /**
            * @inheritDoc
            */
            TriangleBasicPass.prototype._iGetPassFragmentCode = function (regCache, sharedReg) {
                var code = "";
                var targetReg = sharedReg.shadedTarget;
                var diffuseInputReg;

                if (this._pUseTexture) {
                    diffuseInputReg = regCache.getFreeTextureReg();

                    this._basicDependencyVO.texturesIndex = diffuseInputReg.index;

                    code += materials.ShaderCompilerHelper.getTex2DSampleCode(this._basicDependencyVO, targetReg, sharedReg, diffuseInputReg, this._texture);

                    if (this._alphaThreshold > 0) {
                        var cutOffReg = regCache.getFreeFragmentConstant();
                        this._basicDependencyVO.fragmentConstantsIndex = cutOffReg.index * 4;

                        code += "sub " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n" + "kil " + targetReg + ".w\n" + "add " + targetReg + ".w, " + targetReg + ".w, " + cutOffReg + ".x\n";
                    }
                } else {
                    diffuseInputReg = regCache.getFreeFragmentConstant();

                    this._basicDependencyVO.fragmentConstantsIndex = diffuseInputReg.index * 4;

                    code += "mov " + targetReg + ", " + diffuseInputReg + "\n";
                }

                return code;
            };

            TriangleBasicPass.prototype._iIncludeDependencies = function (dependencyCounter) {
                dependencyCounter.includeDependencyVO(this._basicDependencyVO);

                this._basicDependencyVO.reset();

                this._basicDependencyVO.vertexData = this._pVertexConstantData;
                this._basicDependencyVO.fragmentData = this._pFragmentConstantData;
                this._basicDependencyVO.useSmoothTextures = this._pSmooth;
                this._basicDependencyVO.repeatTextures = this._pRepeat;
                this._basicDependencyVO.useMipmapping = this._pMipmap;
            };
            return TriangleBasicPass;
        })(materials.MaterialPassBase);
        materials.TriangleBasicPass = TriangleBasicPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var AbstractMethodError = away.errors.AbstractMethodError;

        /**
        * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
        * using material methods to define their appearance.
        */
        var TriangleLightingPass = (function (_super) {
            __extends(TriangleLightingPass, _super);
            /**
            * Creates a new CompiledPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function TriangleLightingPass() {
                _super.call(this);
            }
            TriangleLightingPass.prototype._iGetPreLightingVertexCode = function (registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPreLightingFragmentCode = function (registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPerLightDiffuseFragmentCode = function (lightDirReg, diffuseColorReg, registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPerLightSpecularFragmentCode = function (lightDirReg, specularColorReg, registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPerProbeDiffuseFragmentCode = function (texReg, weightReg, registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPerProbeSpecularFragmentCode = function (texReg, weightReg, registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPostLightingVertexCode = function (registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            TriangleLightingPass.prototype._iGetPostLightingFragmentCode = function (registerCache, sharedRegisters) {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether or not lighting happens in tangent space. This is only the case if no world-space
            * dependencies exist.
            */
            TriangleLightingPass.prototype._iUsesTangentSpace = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the shader uses any light probes.
            */
            TriangleLightingPass.prototype._iUsesProbes = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the shader uses any lights.
            */
            TriangleLightingPass.prototype._iUsesLights = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the shader uses any shadows.
            */
            TriangleLightingPass.prototype._iUsesShadows = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the lights uses any specular components.
            */
            TriangleLightingPass.prototype._iUsesLightsForSpecular = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the lights uses any diffuse components.
            */
            TriangleLightingPass.prototype._iUsesLightsForDiffuse = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the probes uses any specular components.
            */
            TriangleLightingPass.prototype._iUsesProbesForSpecular = function () {
                throw new AbstractMethodError();
            };

            /**
            * Indicates whether the probes uses any diffuse components.
            */
            TriangleLightingPass.prototype._iUsesProbesForDiffuse = function () {
                throw new AbstractMethodError();
            };
            return TriangleLightingPass;
        })(materials.MaterialPassBase);
        materials.TriangleLightingPass = TriangleLightingPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    *
    */
    (function (materials) {
        var TrianglePassMode = (function () {
            function TrianglePassMode() {
            }
            TrianglePassMode.SUPER_SHADER = "superShader";

            TrianglePassMode.LIGHTING = "lighting";
            return TrianglePassMode;
        })();
        materials.TrianglePassMode = TrianglePassMode;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var SubGeometry = away.base.TriangleSubGeometry;

        var ShadingMethodEvent = away.events.ShadingMethodEvent;

        var Matrix3DUtils = away.geom.Matrix3DUtils;

        /**
        * CompiledPass forms an abstract base class for the default compiled pass materials provided by Away3D,
        * using material methods to define their appearance.
        */
        var TriangleMethodPass = (function (_super) {
            __extends(TriangleMethodPass, _super);
            /**
            * Creates a new CompiledPass object.
            *
            * @param material The material to which this pass belongs.
            */
            function TriangleMethodPass(material, passMode) {
                if (typeof passMode === "undefined") { passMode = "superShader"; }
                var _this = this;
                _super.call(this);
                this._includeCasters = true;
                this._inverseSceneMatrix = new Array();
                this._maxLights = 3;
                this._iDependencyVOs = new Array();
                this._numEffectDependencies = 0;
                this._pSpecularLightSources = 0x01;
                this._pDiffuseLightSources = 0x03;
                this._combinedLightSources = 0x03;
                this._preserveAlpha = true;
                this._animateUVs = false;
                this._pNumPointLights = 0;
                this._pNumDirectionalLights = 0;
                this._pNumLightProbes = 0;
                this._pNumLights = 0;
                this._enableLightFallOff = true;
                this._forceSeparateMVP = false;

                this.material = material;

                this._passMode = passMode;

                this._onShaderInvalidatedDelegate = function (event) {
                    return _this.onShaderInvalidated(event);
                };
            }
            Object.defineProperty(TriangleMethodPass.prototype, "directionalLightsOffset", {
                /**
                * Indicates the offset in the light picker's directional light vector for which to start including lights.
                * This needs to be set before the light picker is assigned.
                */
                get: function () {
                    return this._directionalLightsOffset;
                },
                set: function (value) {
                    this._directionalLightsOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "pointLightsOffset", {
                /**
                * Indicates the offset in the light picker's point light vector for which to start including lights.
                * This needs to be set before the light picker is assigned.
                */
                get: function () {
                    return this._pointLightsOffset;
                },
                set: function (value) {
                    this._pointLightsOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "lightProbesOffset", {
                /**
                * Indicates the offset in the light picker's light probes vector for which to start including lights.
                * This needs to be set before the light picker is assigned.
                */
                get: function () {
                    return this._lightProbesOffset;
                },
                set: function (value) {
                    this._lightProbesOffset = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "passMode", {
                get: function () {
                    return this._passMode;
                },
                set: function (value) {
                    this._passMode = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "enableLightFallOff", {
                /**
                * Whether or not to use fallOff and radius properties for lights. This can be used to improve performance and
                * compatibility for constrained mode.
                */
                get: function () {
                    return this._enableLightFallOff;
                },
                set: function (value) {
                    if (value != this._enableLightFallOff)
                        this.iInvalidateShaderProgram(true);

                    this._enableLightFallOff = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "forceSeparateMVP", {
                /**
                * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
                * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
                * projection code.
                */
                get: function () {
                    return this._forceSeparateMVP;
                },
                set: function (value) {
                    this._forceSeparateMVP = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "iNumPointLights", {
                /**
                * The amount of point lights that need to be supported.
                */
                get: function () {
                    return this._pNumPointLights;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TriangleMethodPass.prototype, "iNumDirectionalLights", {
                /**
                * The amount of directional lights that need to be supported.
                */
                get: function () {
                    return this._pNumDirectionalLights;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TriangleMethodPass.prototype, "iNumLightProbes", {
                /**
                * The amount of light probes that need to be supported.
                */
                get: function () {
                    return this._pNumLightProbes;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iUpdateProgram = function (stage) {
                this.reset(stage.profile);
                _super.prototype.iUpdateProgram.call(this, stage);
            };

            /**
            * Resets the compilation state.
            *
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleMethodPass.prototype.reset = function (profile) {
                this.iInitCompiler(profile);

                this.pUpdateShaderProperties();
                this.initConstantData();

                this.pCleanUp();
            };

            /**
            * Updates the amount of used register indices.
            */
            TriangleMethodPass.prototype.updateUsedOffsets = function () {
                this._pNumUsedVertexConstants = this._pCompiler.numUsedVertexConstants;
                this._pNumUsedFragmentConstants = this._pCompiler.numUsedFragmentConstants;
                this._pNumUsedStreams = this._pCompiler.numUsedStreams;
                this._pNumUsedTextures = this._pCompiler.numUsedTextures;
                this._pNumUsedVaryings = this._pCompiler.numUsedVaryings;
                this._pNumUsedFragmentConstants = this._pCompiler.numUsedFragmentConstants;
            };

            /**
            * Initializes the unchanging constant data for this material.
            */
            TriangleMethodPass.prototype.initConstantData = function () {
                this._pVertexConstantData.length = this._pNumUsedVertexConstants * 4;
                this._pFragmentConstantData.length = this._pNumUsedFragmentConstants * 4;

                this.pInitCommonsData();

                if (this._uvTransformIndex >= 0)
                    this.pInitUVTransformData();

                if (this._pCameraPositionIndex >= 0)
                    this._pVertexConstantData[this._pCameraPositionIndex + 3] = 1;

                this.pUpdateMethodConstants();
            };

            /**
            * Initializes the compiler for this pass.
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleMethodPass.prototype.iInitCompiler = function (profile) {
                this._pCompiler = this.pCreateCompiler(profile);
                this._pCompiler.forceSeperateMVP = this._forceSeparateMVP;
                this._pCompiler.animateUVs = this._animateUVs;
                this._pCompiler.preserveAlpha = this._preserveAlpha && this._pEnableBlending;
                this._pCompiler.enableLightFallOff = this._enableLightFallOff;
                this._pCompiler.compile();
            };

            /**
            * Factory method to create a concrete compiler object for this pass.
            * @param profile The compatibility profile used by the renderer.
            */
            TriangleMethodPass.prototype.pCreateCompiler = function (profile) {
                return new materials.ShaderLightingCompiler(this, profile);
            };

            Object.defineProperty(TriangleMethodPass.prototype, "includeCasters", {
                /**
                * Indicates whether or not shadow casting lights need to be included.
                */
                get: function () {
                    return this._includeCasters;
                },
                set: function (value) {
                    if (this._includeCasters == value)
                        return;

                    this._includeCasters = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "colorTransform", {
                /**
                * The ColorTransform object to transform the colour of the material with. Defaults to null.
                */
                get: function () {
                    return this.colorTransformMethod ? this.colorTransformMethod.colorTransform : null;
                },
                set: function (value) {
                    if (value) {
                        if (this.colorTransformMethod == null)
                            this.colorTransformMethod = new materials.EffectColorTransformMethod();

                        this.colorTransformMethod.colorTransform = value;
                    } else if (!value) {
                        if (this.colorTransformMethod)
                            this.colorTransformMethod = null;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "colorTransformMethod", {
                /**
                * The EffectColorTransformMethod object to transform the colour of the material with. Defaults to null.
                */
                get: function () {
                    return this._iColorTransformDependencyVO ? this._iColorTransformDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iColorTransformDependencyVO && this._iColorTransformDependencyVO.method == value)
                        return;

                    if (this._iColorTransformDependencyVO) {
                        this._removeDependency(this._iColorTransformDependencyVO);
                        this._iColorTransformDependencyVO = null;
                    }

                    if (value) {
                        this._iColorTransformDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iColorTransformDependencyVO);
                    }
                },
                enumerable: true,
                configurable: true
            });


            TriangleMethodPass.prototype._removeDependency = function (dependencyVO) {
                dependencyVO.method.removeEventListener(ShadingMethodEvent.SHADER_INVALIDATED, this._onShaderInvalidatedDelegate);
                this._iDependencyVOs.splice(this._iDependencyVOs.indexOf(dependencyVO), 1);

                this.iInvalidateShaderProgram();
            };

            TriangleMethodPass.prototype._addDependency = function (dependencyVO, effectsDependency, index) {
                if (typeof effectsDependency === "undefined") { effectsDependency = false; }
                if (typeof index === "undefined") { index = -1; }
                dependencyVO.method.addEventListener(ShadingMethodEvent.SHADER_INVALIDATED, this._onShaderInvalidatedDelegate);

                if (effectsDependency) {
                    if (index != -1)
                        this._iDependencyVOs.splice(index + this._iDependencyVOs.length - this._numEffectDependencies, 0, dependencyVO);
                    else
                        this._iDependencyVOs.push(dependencyVO);
                    this._numEffectDependencies++;
                } else {
                    this._iDependencyVOs.splice(this._iDependencyVOs.length - this._numEffectDependencies, 0, dependencyVO);
                }

                this.iInvalidateShaderProgram();
            };

            /**
            * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
            * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
            * methods added prior.
            */
            TriangleMethodPass.prototype.addEffectMethod = function (method) {
                this._addDependency(new materials.DependencyVO(method), true);
            };

            Object.defineProperty(TriangleMethodPass.prototype, "numEffectMethods", {
                /**
                * The number of "effect" methods added to the material.
                */
                get: function () {
                    return this._numEffectDependencies;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Queries whether a given effects method was added to the material.
            *
            * @param method The method to be queried.
            * @return true if the method was added to the material, false otherwise.
            */
            TriangleMethodPass.prototype.hasEffectMethod = function (method) {
                return this.getDependencyForMethod(method) != null;
            };

            /**
            * Returns the method added at the given index.
            * @param index The index of the method to retrieve.
            * @return The method at the given index.
            */
            TriangleMethodPass.prototype.getEffectMethodAt = function (index) {
                if (index < 0 || index > this._numEffectDependencies - 1)
                    return null;

                return this._iDependencyVOs[index + this._iDependencyVOs.length - this._numEffectDependencies].method;
            };

            /**
            * Adds an effect method at the specified index amongst the methods already added to the material. Effect
            * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
            * etc. The method will be applied to the result of the methods with a lower index.
            */
            TriangleMethodPass.prototype.addEffectMethodAt = function (method, index) {
                this._addDependency(new materials.DependencyVO(method), true, index);
            };

            /**
            * Removes an effect method from the material.
            * @param method The method to be removed.
            */
            TriangleMethodPass.prototype.removeEffectMethod = function (method) {
                var dependency = this.getDependencyForMethod(method);

                if (dependency != null)
                    this._removeDependency(dependency);
            };

            TriangleMethodPass.prototype.getDependencyForMethod = function (method) {
                var len = this._iDependencyVOs.length;
                for (var i = 0; i < len; ++i)
                    if (this._iDependencyVOs[i].method == method)
                        return this._iDependencyVOs[i];

                return null;
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.pUpdateLights = function () {
                var numDirectionalLightsOld = this._pNumDirectionalLights;
                var numPointLightsOld = this._pNumPointLights;
                var numLightProbesOld = this._pNumLightProbes;

                if (this._pLightPicker && !this._ignoreLights) {
                    this._pNumDirectionalLights = this.calculateNumDirectionalLights(this._pLightPicker.numDirectionalLights);
                    this._pNumPointLights = this.calculateNumPointLights(this._pLightPicker.numPointLights);
                    this._pNumLightProbes = this.calculateNumProbes(this._pLightPicker.numLightProbes);

                    if (this._includeCasters) {
                        this._pNumDirectionalLights += this._pLightPicker.numCastingDirectionalLights;
                        this._pNumPointLights += this._pLightPicker.numCastingPointLights;
                    }
                } else {
                    this._pNumDirectionalLights = 0;
                    this._pNumPointLights = 0;
                    this._pNumLightProbes = 0;
                }

                this._pNumLights = this._pNumDirectionalLights + this._pNumPointLights;

                if (numDirectionalLightsOld != this._pNumDirectionalLights || numPointLightsOld != this._pNumPointLights || numLightProbesOld != this._pNumLightProbes)
                    this.iInvalidateShaderProgram();
            };

            /**
            * Calculates the amount of directional lights this material will support.
            * @param numDirectionalLights The maximum amount of directional lights to support.
            * @return The amount of directional lights this material will support, bounded by the amount necessary.
            */
            TriangleMethodPass.prototype.calculateNumDirectionalLights = function (numDirectionalLights) {
                return Math.min(numDirectionalLights - this._directionalLightsOffset, this._maxLights);
            };

            /**
            * Calculates the amount of point lights this material will support.
            * @param numDirectionalLights The maximum amount of point lights to support.
            * @return The amount of point lights this material will support, bounded by the amount necessary.
            */
            TriangleMethodPass.prototype.calculateNumPointLights = function (numPointLights) {
                var numFree = this._maxLights - this._pNumDirectionalLights;
                return Math.min(numPointLights - this._pointLightsOffset, numFree);
            };

            /**
            * Calculates the amount of light probes this material will support.
            * @param numDirectionalLights The maximum amount of light probes to support.
            * @return The amount of light probes this material will support, bounded by the amount necessary.
            */
            TriangleMethodPass.prototype.calculateNumProbes = function (numLightProbes) {
                var numChannels = 0;
                if ((this._pSpecularLightSources & materials.LightSources.PROBES) != 0)
                    ++numChannels;

                if ((this._pDiffuseLightSources & materials.LightSources.PROBES) != 0)
                    ++numChannels;

                // 4 channels available
                return Math.min(numLightProbes - this._lightProbesOffset, (4 / numChannels) | 0);
            };

            /**
            * Copies the shader's properties from the compiler.
            */
            TriangleMethodPass.prototype.pUpdateShaderProperties = function () {
                this._pAnimatableAttributes = this._pCompiler.animatableAttributes;
                this._pAnimationTargetRegisters = this._pCompiler.animationTargetRegisters;
                this._vertexCode = this._pCompiler.vertexCode;
                this._fragmentLightCode = this._pCompiler.fragmentLightCode;
                this._framentPostLightCode = this._pCompiler.fragmentPostLightCode;
                this._pShadedTarget = this._pCompiler.shadedTarget;
                this._pNeedUVAnimation = this._pCompiler.needUVAnimation;
                this._pUVSource = this._pCompiler.UVSource;
                this._pUVTarget = this._pCompiler.UVTarget;

                this._tangentSpace = this._iUsesTangentSpace();

                this.pUpdateRegisterIndices();
                this.updateUsedOffsets();
            };

            /**
            * Updates the indices for various registers.
            */
            TriangleMethodPass.prototype.pUpdateRegisterIndices = function () {
                this._uvBufferIndex = this._pCompiler.uvBufferIndex;
                this._uvTransformIndex = this._pCompiler.uvTransformIndex;
                this._secondaryUVBufferIndex = this._pCompiler.secondaryUVBufferIndex;
                this._normalBufferIndex = this._pCompiler.normalBufferIndex;
                this._tangentBufferIndex = this._pCompiler.tangentBufferIndex;
                this._pLightFragmentConstantIndex = this._pCompiler.lightFragmentConstantIndex;
                this._pCameraPositionIndex = this._pCompiler.cameraPositionIndex;
                this._commonsDataIndex = this._pCompiler.commonsDataIndex;
                this._sceneMatrixIndex = this._pCompiler.sceneMatrixIndex;
                this._sceneNormalMatrixIndex = this._pCompiler.sceneNormalMatrixIndex;
                this._pProbeWeightsIndex = this._pCompiler.probeWeightsIndex;
                this._pLightProbeDiffuseIndices = this._pCompiler.lightProbeDiffuseIndices;
                this._pLightProbeSpecularIndices = this._pCompiler.lightProbeSpecularIndices;
                this._lightVertexConstantIndex = this._pCompiler.lightVertexConstantIndex;
            };

            Object.defineProperty(TriangleMethodPass.prototype, "preserveAlpha", {
                /**
                * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
                */
                get: function () {
                    return this._preserveAlpha;
                },
                set: function (value) {
                    if (this._preserveAlpha == value)
                        return;

                    this._preserveAlpha = value;

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "animateUVs", {
                /**
                * Indicate whether UV coordinates need to be animated using the renderable's transformUV matrix.
                */
                get: function () {
                    return this._animateUVs;
                },
                set: function (value) {
                    this._animateUVs = value;

                    if ((value && !this._animateUVs) || (!value && this._animateUVs))
                        this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "normalMethod", {
                /**
                * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
                */
                get: function () {
                    return this._iNormalDependencyVO ? this._iNormalDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iNormalDependencyVO && this._iNormalDependencyVO.method == value)
                        return;

                    if (this._iNormalDependencyVO) {
                        this._removeDependency(this._iNormalDependencyVO);
                        this._iNormalDependencyVO = null;
                    }

                    if (value) {
                        this._iNormalDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iNormalDependencyVO);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "ambientMethod", {
                /**
                * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
                */
                get: function () {
                    return this._iAmbientDependencyVO ? this._iAmbientDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iAmbientDependencyVO && this._iAmbientDependencyVO.method == value)
                        return;

                    if (this._iAmbientDependencyVO) {
                        this._removeDependency(this._iAmbientDependencyVO);
                        this._iAmbientDependencyVO = null;
                    }

                    if (value) {
                        this._iAmbientDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iAmbientDependencyVO);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "shadowMethod", {
                /**
                * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
                */
                get: function () {
                    return this._iShadowDependencyVO ? this._iShadowDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iShadowDependencyVO && this._iShadowDependencyVO.method == value)
                        return;

                    if (this._iShadowDependencyVO) {
                        this._removeDependency(this._iShadowDependencyVO);
                        this._iShadowDependencyVO = null;
                    }

                    if (value) {
                        this._iShadowDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iShadowDependencyVO);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "diffuseMethod", {
                /**
                * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
                */
                get: function () {
                    return this._iDiffuseDependencyVO ? this._iDiffuseDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iDiffuseDependencyVO && this._iDiffuseDependencyVO.method == value)
                        return;

                    if (this._iDiffuseDependencyVO) {
                        this._removeDependency(this._iDiffuseDependencyVO);
                        this._iDiffuseDependencyVO = null;
                    }

                    if (value) {
                        this._iDiffuseDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iDiffuseDependencyVO);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "specularMethod", {
                /**
                * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
                */
                get: function () {
                    return this._iSpecularDependencyVO ? this._iSpecularDependencyVO.method : null;
                },
                set: function (value) {
                    if (this._iSpecularDependencyVO && this._iSpecularDependencyVO.method == value)
                        return;

                    if (this._iSpecularDependencyVO) {
                        this._removeDependency(this._iSpecularDependencyVO);
                        this._iSpecularDependencyVO = null;
                    }

                    if (value) {
                        this._iSpecularDependencyVO = new materials.DependencyVO(value);
                        this._addDependency(this._iSpecularDependencyVO);
                    }

                    this._updateCombinedLightSources();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.dispose = function () {
                _super.prototype.dispose.call(this);

                while (this._iDependencyVOs.length)
                    this._removeDependency(this._iDependencyVOs[0]);

                this._iDependencyVOs = null;
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iInvalidateShaderProgram = function (updateMaterial) {
                if (typeof updateMaterial === "undefined") { updateMaterial = true; }
                var oldPasses = this._iPasses;
                this._iPasses = new Array();

                for (var i = 0; i < this._iDependencyVOs.length; ++i)
                    this.pAddPasses(this._iDependencyVOs[i]);

                if (!oldPasses || this._iPasses.length != oldPasses.length) {
                    this._iPassesDirty = true;
                    return;
                }

                for (var i = 0; i < this._iPasses.length; ++i) {
                    if (this._iPasses[i] != oldPasses[i]) {
                        this._iPassesDirty = true;
                        return;
                    }
                }

                _super.prototype.iInvalidateShaderProgram.call(this, updateMaterial);
            };

            /**
            * Adds internal passes to the material.
            *
            * @param passes The passes to add.
            */
            TriangleMethodPass.prototype.pAddPasses = function (dependency) {
                var passes = dependency.method.passes;

                if (!dependency.useMethod || !passes)
                    return;

                var len = passes.length;
                for (var i = 0; i < len; ++i) {
                    passes[i].material = this.material;
                    passes[i].lightPicker = this._pLightPicker;
                    this._iPasses.push(passes[i]);
                }
            };

            /**
            * Initializes the default UV transformation matrix.
            */
            TriangleMethodPass.prototype.pInitUVTransformData = function () {
                this._pVertexConstantData[this._uvTransformIndex] = 1;
                this._pVertexConstantData[this._uvTransformIndex + 1] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 2] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 3] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 4] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 5] = 1;
                this._pVertexConstantData[this._uvTransformIndex + 6] = 0;
                this._pVertexConstantData[this._uvTransformIndex + 7] = 0;
            };

            /**
            * Initializes commonly required constant values.
            */
            TriangleMethodPass.prototype.pInitCommonsData = function () {
                this._pFragmentConstantData[this._commonsDataIndex] = .5;
                this._pFragmentConstantData[this._commonsDataIndex + 1] = 0;
                this._pFragmentConstantData[this._commonsDataIndex + 2] = 1 / 255;
                this._pFragmentConstantData[this._commonsDataIndex + 3] = 1;
            };

            /**
            * Cleans up the after compiling.
            */
            TriangleMethodPass.prototype.pCleanUp = function () {
                this._pCompiler.dispose();
                this._pCompiler = null;
            };

            /**
            * Updates method constants if they have changed.
            */
            TriangleMethodPass.prototype.pUpdateMethodConstants = function () {
                var len = this._iDependencyVOs.length;
                for (var i = 0; i < len; ++i)
                    this._iDependencyVOs[i].method.iInitConstants(this._iDependencyVOs[i]);
            };

            /**
            * Updates constant data render state used by the lights. This method is optional for subclasses to implement.
            */
            TriangleMethodPass.prototype.pUpdateLightConstants = function () {
                var dirLight;
                var pointLight;
                var i = 0;
                var k = 0;
                var len;
                var dirPos;
                var total = 0;
                var numLightTypes = this._includeCasters ? 2 : 1;
                var l;
                var offset;

                l = this._lightVertexConstantIndex;
                k = this._pLightFragmentConstantIndex;

                var cast = 0;
                var dirLights = this._pLightPicker.directionalLights;
                offset = this._directionalLightsOffset;
                len = this._pLightPicker.directionalLights.length;

                if (offset > len) {
                    cast = 1;
                    offset -= len;
                }

                for (; cast < numLightTypes; ++cast) {
                    if (cast)
                        dirLights = this._pLightPicker.castingDirectionalLights;

                    len = dirLights.length;

                    if (len > this._pNumDirectionalLights)
                        len = this._pNumDirectionalLights;

                    for (i = 0; i < len; ++i) {
                        dirLight = dirLights[offset + i];
                        dirPos = dirLight.sceneDirection;

                        this._pAmbientLightR += dirLight._iAmbientR;
                        this._pAmbientLightG += dirLight._iAmbientG;
                        this._pAmbientLightB += dirLight._iAmbientB;

                        if (this._tangentSpace) {
                            var x = -dirPos.x;
                            var y = -dirPos.y;
                            var z = -dirPos.z;

                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[0] * x + this._inverseSceneMatrix[4] * y + this._inverseSceneMatrix[8] * z;
                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[1] * x + this._inverseSceneMatrix[5] * y + this._inverseSceneMatrix[9] * z;
                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[2] * x + this._inverseSceneMatrix[6] * y + this._inverseSceneMatrix[10] * z;
                            this._pVertexConstantData[l++] = 1;
                        } else {
                            this._pFragmentConstantData[k++] = -dirPos.x;
                            this._pFragmentConstantData[k++] = -dirPos.y;
                            this._pFragmentConstantData[k++] = -dirPos.z;
                            this._pFragmentConstantData[k++] = 1;
                        }

                        this._pFragmentConstantData[k++] = dirLight._iDiffuseR;
                        this._pFragmentConstantData[k++] = dirLight._iDiffuseG;
                        this._pFragmentConstantData[k++] = dirLight._iDiffuseB;
                        this._pFragmentConstantData[k++] = 1;

                        this._pFragmentConstantData[k++] = dirLight._iSpecularR;
                        this._pFragmentConstantData[k++] = dirLight._iSpecularG;
                        this._pFragmentConstantData[k++] = dirLight._iSpecularB;
                        this._pFragmentConstantData[k++] = 1;

                        if (++total == this._pNumDirectionalLights) {
                            // break loop
                            i = len;
                            cast = numLightTypes;
                        }
                    }
                }

                // more directional supported than currently picked, need to clamp all to 0
                if (this._pNumDirectionalLights > total) {
                    i = k + (this._pNumDirectionalLights - total) * 12;

                    while (k < i)
                        this._pFragmentConstantData[k++] = 0;
                }

                total = 0;

                var pointLights = this._pLightPicker.pointLights;
                offset = this._pointLightsOffset;
                len = this._pLightPicker.pointLights.length;

                if (offset > len) {
                    cast = 1;
                    offset -= len;
                } else {
                    cast = 0;
                }

                for (; cast < numLightTypes; ++cast) {
                    if (cast)
                        pointLights = this._pLightPicker.castingPointLights;

                    len = pointLights.length;

                    for (i = 0; i < len; ++i) {
                        pointLight = pointLights[offset + i];
                        dirPos = pointLight.scenePosition;

                        this._pAmbientLightR += pointLight._iAmbientR;
                        this._pAmbientLightG += pointLight._iAmbientG;
                        this._pAmbientLightB += pointLight._iAmbientB;

                        if (this._tangentSpace) {
                            x = dirPos.x;
                            y = dirPos.y;
                            z = dirPos.z;

                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[0] * x + this._inverseSceneMatrix[4] * y + this._inverseSceneMatrix[8] * z + this._inverseSceneMatrix[12];
                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[1] * x + this._inverseSceneMatrix[5] * y + this._inverseSceneMatrix[9] * z + this._inverseSceneMatrix[13];
                            this._pVertexConstantData[l++] = this._inverseSceneMatrix[2] * x + this._inverseSceneMatrix[6] * y + this._inverseSceneMatrix[10] * z + this._inverseSceneMatrix[14];
                        } else {
                            this._pVertexConstantData[l++] = dirPos.x;
                            this._pVertexConstantData[l++] = dirPos.y;
                            this._pVertexConstantData[l++] = dirPos.z;
                        }

                        this._pVertexConstantData[l++] = 1;

                        this._pFragmentConstantData[k++] = pointLight._iDiffuseR;
                        this._pFragmentConstantData[k++] = pointLight._iDiffuseG;
                        this._pFragmentConstantData[k++] = pointLight._iDiffuseB;

                        var radius = pointLight._pRadius;
                        this._pFragmentConstantData[k++] = radius * radius;

                        this._pFragmentConstantData[k++] = pointLight._iSpecularR;
                        this._pFragmentConstantData[k++] = pointLight._iSpecularG;
                        this._pFragmentConstantData[k++] = pointLight._iSpecularB;
                        this._pFragmentConstantData[k++] = pointLight._pFallOffFactor;

                        if (++total == this._pNumPointLights) {
                            // break loop
                            i = len;
                            cast = numLightTypes;
                        }
                    }
                }

                // more directional supported than currently picked, need to clamp all to 0
                if (this._pNumPointLights > total) {
                    i = k + (total - this._pNumPointLights) * 12;

                    for (; k < i; ++k)
                        this._pFragmentConstantData[k] = 0;
                }
            };

            /**
            * Updates constant data render state used by the light probes. This method is optional for subclasses to implement.
            */
            TriangleMethodPass.prototype.pUpdateProbes = function (stage) {
                var probe;
                var lightProbes = this._pLightPicker.lightProbes;
                var weights = this._pLightPicker.lightProbeWeights;
                var len = lightProbes.length - this._lightProbesOffset;
                var addDiff = this._iUsesProbesForDiffuse();
                var addSpec = this._iUsesProbesForSpecular();

                if (!(addDiff || addSpec))
                    return;

                if (len > this._pNumLightProbes)
                    len = this._pNumLightProbes;

                for (var i = 0; i < len; ++i) {
                    probe = lightProbes[this._lightProbesOffset + i];

                    if (addDiff)
                        stage.context.activateCubeTexture(this._pLightProbeDiffuseIndices[i], probe.diffuseMap);

                    if (addSpec)
                        stage.context.activateCubeTexture(this._pLightProbeSpecularIndices[i], probe.specularMap);
                }

                for (i = 0; i < len; ++i)
                    this._pFragmentConstantData[this._pProbeWeightsIndex + i] = weights[this._lightProbesOffset + i];
            };

            /**
            * Called when any method's shader code is invalidated.
            */
            TriangleMethodPass.prototype.onShaderInvalidated = function (event) {
                this.iInvalidateShaderProgram();
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iGetVertexCode = function () {
                return this._vertexCode;
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iGetFragmentCode = function (animatorCode) {
                return this._fragmentLightCode + animatorCode + this._framentPostLightCode;
            };

            // RENDER LOOP
            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iActivate = function (stage, camera) {
                _super.prototype.iActivate.call(this, stage, camera);

                var dependency;
                var len = this._iDependencyVOs.length;
                for (var i = 0; i < len; ++i) {
                    dependency = this._iDependencyVOs[i];
                    if (dependency.useMethod)
                        dependency.method.iActivate(dependency, stage);
                }

                if (!this._tangentSpace && this._pCameraPositionIndex >= 0) {
                    var pos = camera.scenePosition;

                    this._pVertexConstantData[this._pCameraPositionIndex] = pos.x;
                    this._pVertexConstantData[this._pCameraPositionIndex + 1] = pos.y;
                    this._pVertexConstantData[this._pCameraPositionIndex + 2] = pos.z;
                }
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iRender = function (renderable, stage, camera, viewProjection) {
                renderable.sourceEntity.inverseSceneTransform.copyRawDataTo(this._inverseSceneMatrix);

                if (this._tangentSpace && this._pCameraPositionIndex >= 0) {
                    var pos = camera.scenePosition;
                    var x = pos.x;
                    var y = pos.y;
                    var z = pos.z;

                    this._pVertexConstantData[this._pCameraPositionIndex] = this._inverseSceneMatrix[0] * x + this._inverseSceneMatrix[4] * y + this._inverseSceneMatrix[8] * z + this._inverseSceneMatrix[12];
                    this._pVertexConstantData[this._pCameraPositionIndex + 1] = this._inverseSceneMatrix[1] * x + this._inverseSceneMatrix[5] * y + this._inverseSceneMatrix[9] * z + this._inverseSceneMatrix[13];
                    this._pVertexConstantData[this._pCameraPositionIndex + 2] = this._inverseSceneMatrix[2] * x + this._inverseSceneMatrix[6] * y + this._inverseSceneMatrix[10] * z + this._inverseSceneMatrix[14];
                }

                var i;
                var context = stage.context;

                if (this._uvBufferIndex >= 0)
                    context.activateBuffer(this._uvBufferIndex, renderable.getVertexData(SubGeometry.UV_DATA), renderable.getVertexOffset(SubGeometry.UV_DATA), SubGeometry.UV_FORMAT);

                if (this._secondaryUVBufferIndex >= 0)
                    context.activateBuffer(this._secondaryUVBufferIndex, renderable.getVertexData(SubGeometry.SECONDARY_UV_DATA), renderable.getVertexOffset(SubGeometry.SECONDARY_UV_DATA), SubGeometry.SECONDARY_UV_FORMAT);

                if (this._normalBufferIndex >= 0)
                    context.activateBuffer(this._normalBufferIndex, renderable.getVertexData(SubGeometry.NORMAL_DATA), renderable.getVertexOffset(SubGeometry.NORMAL_DATA), SubGeometry.NORMAL_FORMAT);

                if (this._tangentBufferIndex >= 0)
                    context.activateBuffer(this._tangentBufferIndex, renderable.getVertexData(SubGeometry.TANGENT_DATA), renderable.getVertexOffset(SubGeometry.TANGENT_DATA), SubGeometry.TANGENT_FORMAT);

                if (this._animateUVs) {
                    var uvTransform = renderable.materialOwner.uvTransform.matrix;

                    if (uvTransform) {
                        this._pVertexConstantData[this._uvTransformIndex] = uvTransform.a;
                        this._pVertexConstantData[this._uvTransformIndex + 1] = uvTransform.b;
                        this._pVertexConstantData[this._uvTransformIndex + 3] = uvTransform.tx;
                        this._pVertexConstantData[this._uvTransformIndex + 4] = uvTransform.c;
                        this._pVertexConstantData[this._uvTransformIndex + 5] = uvTransform.d;
                        this._pVertexConstantData[this._uvTransformIndex + 7] = uvTransform.ty;
                    } else {
                        this._pVertexConstantData[this._uvTransformIndex] = 1;
                        this._pVertexConstantData[this._uvTransformIndex + 1] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 3] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 4] = 0;
                        this._pVertexConstantData[this._uvTransformIndex + 5] = 1;
                        this._pVertexConstantData[this._uvTransformIndex + 7] = 0;
                    }
                }

                this._pAmbientLightR = this._pAmbientLightG = this._pAmbientLightB = 0;

                if (this._iUsesLights())
                    this.pUpdateLightConstants();

                if (this._iUsesProbes())
                    this.pUpdateProbes(stage);

                if (this._sceneMatrixIndex >= 0) {
                    renderable.sourceEntity.getRenderSceneTransform(camera).copyRawDataTo(this._pVertexConstantData, this._sceneMatrixIndex, true);
                    viewProjection.copyRawDataTo(this._pVertexConstantData, 0, true);
                } else {
                    var matrix3D = Matrix3DUtils.CALCULATION_MATRIX;

                    matrix3D.copyFrom(renderable.sourceEntity.getRenderSceneTransform(camera));
                    matrix3D.append(viewProjection);

                    matrix3D.copyRawDataTo(this._pVertexConstantData, 0, true);
                }

                if (this._sceneNormalMatrixIndex >= 0)
                    renderable.sourceEntity.inverseSceneTransform.copyRawDataTo(this._pVertexConstantData, this._sceneNormalMatrixIndex, false);

                var ambientMethod = this._iAmbientDependencyVO.method;
                ambientMethod._iLightAmbientR = this._pAmbientLightR;
                ambientMethod._iLightAmbientG = this._pAmbientLightG;
                ambientMethod._iLightAmbientB = this._pAmbientLightB;

                var dependency;
                var len = this._iDependencyVOs.length;
                for (var i = 0; i < len; ++i) {
                    dependency = this._iDependencyVOs[i];
                    if (dependency.useMethod)
                        dependency.method.iSetRenderState(dependency, renderable, stage, camera);
                }

                context.setProgramConstantsFromArray(away.stagegl.ContextGLProgramType.VERTEX, 0, this._pVertexConstantData, this._pNumUsedVertexConstants);
                context.setProgramConstantsFromArray(away.stagegl.ContextGLProgramType.FRAGMENT, 0, this._pFragmentConstantData, this._pNumUsedFragmentConstants);

                context.activateBuffer(0, renderable.getVertexData(SubGeometry.POSITION_DATA), renderable.getVertexOffset(SubGeometry.POSITION_DATA), SubGeometry.POSITION_FORMAT);
                context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
            };

            /**
            * @inheritDoc
            */
            TriangleMethodPass.prototype.iDeactivate = function (stage) {
                _super.prototype.iDeactivate.call(this, stage);

                var dependency;
                var len = this._iDependencyVOs.length;
                for (var i = 0; i < len; ++i) {
                    dependency = this._iDependencyVOs[i];
                    if (dependency.useMethod)
                        dependency.method.iDeactivate(dependency, stage);
                }
            };

            Object.defineProperty(TriangleMethodPass.prototype, "specularLightSources", {
                /**
                * Define which light source types to use for specular reflections. This allows choosing between regular lights
                * and/or light probes for specular reflections.
                *
                * @see away3d.materials.LightSources
                */
                get: function () {
                    return this._pSpecularLightSources;
                },
                set: function (value) {
                    this._pSpecularLightSources = value;

                    this._updateCombinedLightSources();

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodPass.prototype, "diffuseLightSources", {
                /**
                * Define which light source types to use for diffuse reflections. This allows choosing between regular lights
                * and/or light probes for diffuse reflections.
                *
                * @see away3d.materials.LightSources
                */
                get: function () {
                    return this._pDiffuseLightSources;
                },
                set: function (value) {
                    this._pDiffuseLightSources = value;

                    this._updateCombinedLightSources();

                    this.iInvalidateShaderProgram();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(TriangleMethodPass.prototype, "iIgnoreLights", {
                get: function () {
                    return this._ignoreLights;
                },
                /**
                * Indicates whether lights should be ignored in this pass. This is used when only effect methods are rendered in
                * a multipass material.
                */
                set: function (ignoreLights) {
                    this._ignoreLights = ignoreLights;
                },
                enumerable: true,
                configurable: true
            });

            TriangleMethodPass.prototype._iIncludeDependencies = function (dependencyCounter) {
                var i;
                var len = this._iDependencyVOs.length;
                for (i = 0; i < len; ++i)
                    this.setupAndCountDependencies(dependencyCounter, this._iDependencyVOs[i]);

                // todo: add spotlights to count check
                dependencyCounter.setLights(this._pNumPointLights, this._iUsesLights(), this._iUsesLightsForSpecular(), this._iUsesProbesForSpecular());

                if (!this._tangentSpace)
                    dependencyCounter.addWorldSpaceDependencies(this._passMode == materials.MaterialPassMode.SUPER_SHADER);

                for (i = 0; i < len; ++i)
                    this._iDependencyVOs[i].useMethod = this._iDependencyVOs[i].method.iIsUsed(dependencyCounter);
            };

            /**
            * Counts the dependencies for a given method.
            * @param method The method to count the dependencies for.
            * @param dependencyVO The method's data for this material.
            */
            TriangleMethodPass.prototype.setupAndCountDependencies = function (dependencyCounter, dependencyVO) {
                dependencyVO.reset();

                dependencyVO.vertexData = this._pVertexConstantData;
                dependencyVO.fragmentData = this._pFragmentConstantData;
                dependencyVO.useSmoothTextures = this._pSmooth;
                dependencyVO.repeatTextures = this._pRepeat;
                dependencyVO.useMipmapping = this._pMipmap;
                dependencyVO.useLightFallOff = this._enableLightFallOff && dependencyCounter.profile != away.stagegl.ContextGLProfile.BASELINE_CONSTRAINED;
                dependencyVO.numLights = this._pNumPointLights + this._pNumDirectionalLights + this._pNumLightProbes;

                dependencyVO.method.iInitVO(dependencyVO);

                dependencyCounter.includeDependencyVO(dependencyVO);
            };

            TriangleMethodPass.prototype._iGetPreLightingVertexCode = function (registerCache, sharedRegisters) {
                var code = "";

                if (this._iUsesShadows())
                    code += this._iShadowDependencyVO.method.iGetVertexCode(this._iShadowDependencyVO, registerCache, sharedRegisters);

                code += this._iDiffuseDependencyVO.method.iGetVertexCode(this._iDiffuseDependencyVO, registerCache, sharedRegisters);

                if (this._iSpecularDependencyVO && this._iSpecularDependencyVO.useMethod)
                    code += this._iSpecularDependencyVO.method.iGetVertexCode(this._iSpecularDependencyVO, registerCache, sharedRegisters);

                return code;
            };

            TriangleMethodPass.prototype._iGetPreLightingFragmentCode = function (registerCache, sharedRegisters) {
                var code = "";

                if (this._iUsesShadows())
                    code += this._iShadowDependencyVO.method.iGetFragmentCode(this._iShadowDependencyVO, sharedRegisters.shadowTarget, registerCache, sharedRegisters);

                code += this._iDiffuseDependencyVO.method.iGetFragmentPreLightingCode(this._iDiffuseDependencyVO, registerCache, sharedRegisters);

                if (this._iSpecularDependencyVO && this._iSpecularDependencyVO.useMethod)
                    code += this._iSpecularDependencyVO.method.iGetFragmentPreLightingCode(this._iSpecularDependencyVO, registerCache, sharedRegisters);

                return code;
            };

            TriangleMethodPass.prototype._iGetPerLightDiffuseFragmentCode = function (lightDirReg, diffuseColorReg, registerCache, sharedRegisters) {
                return this._iDiffuseDependencyVO.method.iGetFragmentCodePerLight(this._iDiffuseDependencyVO, lightDirReg, diffuseColorReg, registerCache, sharedRegisters);
            };

            TriangleMethodPass.prototype._iGetPerLightSpecularFragmentCode = function (lightDirReg, specularColorReg, registerCache, sharedRegisters) {
                return this._iSpecularDependencyVO.method.iGetFragmentCodePerLight(this._iSpecularDependencyVO, lightDirReg, specularColorReg, registerCache, sharedRegisters);
            };

            TriangleMethodPass.prototype._iGetPerProbeDiffuseFragmentCode = function (texReg, weightReg, registerCache, sharedRegisters) {
                return this._iDiffuseDependencyVO.method.iGetFragmentCodePerProbe(this._iDiffuseDependencyVO, texReg, weightReg, registerCache, sharedRegisters);
            };

            TriangleMethodPass.prototype._iGetPerProbeSpecularFragmentCode = function (texReg, weightReg, registerCache, sharedRegisters) {
                return this._iSpecularDependencyVO.method.iGetFragmentCodePerProbe(this._iSpecularDependencyVO, texReg, weightReg, registerCache, sharedRegisters);
            };

            TriangleMethodPass.prototype._iGetPostLightingVertexCode = function (registerCache, sharedRegisters) {
                return this._iAmbientDependencyVO.method.iGetVertexCode(this._iAmbientDependencyVO, registerCache, sharedRegisters);
            };

            TriangleMethodPass.prototype._iGetPostLightingFragmentCode = function (registerCache, sharedRegisters) {
                var code = this._iAmbientDependencyVO.method.iGetFragmentCode(this._iAmbientDependencyVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);

                if (this._iAmbientDependencyVO.needsNormals)
                    registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);

                if (this._iAmbientDependencyVO.needsView)
                    registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);

                code += this._iDiffuseDependencyVO.method.iGetFragmentPostLightingCode(this._iDiffuseDependencyVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);

                if (this._pAlphaPremultiplied && this._pEnableBlending) {
                    code += "add " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.commons + ".z\n" + "div " + sharedRegisters.shadedTarget + ".xyz, " + sharedRegisters.shadedTarget + ", " + sharedRegisters.shadedTarget + ".w\n" + "sub " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.shadedTarget + ".w, " + sharedRegisters.commons + ".z\n" + "sat " + sharedRegisters.shadedTarget + ".xyz, " + sharedRegisters.shadedTarget + "\n";
                }

                // resolve other dependencies as well?
                if (this._iDiffuseDependencyVO.needsNormals)
                    registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);

                if (this._iDiffuseDependencyVO.needsView)
                    registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);

                if (this._iSpecularDependencyVO && this._iSpecularDependencyVO.useMethod) {
                    code += this._iShadowDependencyVO.method.iGetFragmentPostLightingCode(this._iSpecularDependencyVO, sharedRegisters.shadedTarget, registerCache, sharedRegisters);
                    if (this._iSpecularDependencyVO.needsNormals)
                        registerCache.removeFragmentTempUsage(sharedRegisters.normalFragment);
                    if (this._iSpecularDependencyVO.needsView)
                        registerCache.removeFragmentTempUsage(sharedRegisters.viewDirFragment);
                }

                if (this._iShadowDependencyVO)
                    registerCache.removeFragmentTempUsage(sharedRegisters.shadowTarget);

                return code;
            };

            /**
            * Indicates whether or not lighting happens in tangent space. This is only the case if no world-space
            * dependencies exist.
            */
            TriangleMethodPass.prototype._iUsesTangentSpace = function () {
                return this._pNumLightProbes == 0 && this._iNormalDependencyVO && this._iNormalDependencyVO.useMethod && this._iNormalDependencyVO.method.iTangentSpace;
            };

            /**
            * Indicates whether the shader uses any light probes.
            */
            TriangleMethodPass.prototype._iUsesProbes = function () {
                return this._pNumLightProbes > 0 && (this._combinedLightSources & materials.LightSources.PROBES) != 0;
            };

            /**
            * Indicates whether the shader uses any lights.
            */
            TriangleMethodPass.prototype._iUsesLights = function () {
                return this._pNumLights > 0 && (this._combinedLightSources & materials.LightSources.LIGHTS) != 0;
            };

            /**
            * Indicates whether the shader uses any shadows.
            */
            TriangleMethodPass.prototype._iUsesShadows = function () {
                return Boolean(this._iShadowDependencyVO);
            };

            /**
            * Indicates whether the lights uses any specular components.
            */
            TriangleMethodPass.prototype._iUsesLightsForSpecular = function () {
                return this._pNumLights > 0 && this._iSpecularDependencyVO && (this._pSpecularLightSources & materials.LightSources.LIGHTS) != 0;
            };

            /**
            * Indicates whether the lights uses any diffuse components.
            */
            TriangleMethodPass.prototype._iUsesLightsForDiffuse = function () {
                return this._pNumLights > 0 && (this._pDiffuseLightSources & materials.LightSources.LIGHTS) != 0;
            };

            /**
            * Indicates whether the probes uses any specular components.
            */
            TriangleMethodPass.prototype._iUsesProbesForSpecular = function () {
                return this._pNumLightProbes > 0 && this._iSpecularDependencyVO && (this._pSpecularLightSources & materials.LightSources.PROBES) != 0;
            };

            /**
            * Indicates whether the probes uses any diffuse components.
            */
            TriangleMethodPass.prototype._iUsesProbesForDiffuse = function () {
                return this._pNumLightProbes > 0 && (this._pDiffuseLightSources & materials.LightSources.PROBES) != 0;
            };

            TriangleMethodPass.prototype._updateCombinedLightSources = function () {
                this._combinedLightSources = (this._iSpecularDependencyVO) ? this._pSpecularLightSources | this._pDiffuseLightSources : this._pDiffuseLightSources;
            };
            return TriangleMethodPass;
        })(materials.TriangleLightingPass);
        materials.TriangleMethodPass = TriangleMethodPass;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var DepthMapPass = away.materials.DepthMapPass;
        var DistanceMapPass = away.materials.DistanceMapPass;

        /**
        * MaterialBase forms an abstract base class for any material.
        * A material consists of several passes, each of which constitutes at least one render call. Several passes could
        * be used for special effects (render lighting for many lights in several passes, render an outline in a separate
        * pass) or to provide additional render-to-texture passes (rendering diffuse light to texture for texture-space
        * subsurface scattering, or rendering a depth map for specialized self-shadowing).
        *
        * Away3D provides default materials trough SinglePassMaterialBase and TriangleMethodMaterial, which use modular
        * methods to build the shader code. MaterialBase can be extended to build specific and high-performant custom
        * shaders, or entire new material frameworks.
        */
        var DepthMaterialBase = (function (_super) {
            __extends(DepthMaterialBase, _super);
            /**
            * Creates a new MaterialBase object.
            */
            function DepthMaterialBase() {
                _super.call(this);
                this._pHeight = 1;
                this._pWidth = 1;
                this._pRequiresBlending = false;

                this._iBaseScreenPassIndex = 2; //allow for depth pass objects

                this._pDepthPass = new DepthMapPass(this);
                this._pDistancePass = new DistanceMapPass(this);
            }
            DepthMaterialBase.prototype.pAddDepthPasses = function () {
                this.pAddPass(this._pDepthPass);
                this.pAddPass(this._pDistancePass);
            };

            /**
            * Indicates that the depth pass uses transparency testing to discard pixels.
            *
            * @private
            */
            DepthMaterialBase.prototype.iHasDepthAlphaThreshold = function () {
                return this._pDepthPass.alphaThreshold > 0;
            };

            /**
            * Sets the render state for the depth pass that is independent of the rendered object. Used when rendering
            * depth or distances (fe: shadow maps, depth pre-pass).
            *
            * @param stage The Stage used for rendering.
            * @param camera The camera from which the scene is viewed.
            * @param distanceBased Whether or not the depth pass or distance pass should be activated. The distance pass
            * is required for shadow cube maps.
            *
            * @internal
            */
            DepthMaterialBase.prototype.iActivateForDepth = function (stage, camera, distanceBased) {
                if (typeof distanceBased === "undefined") { distanceBased = false; }
                this._distanceBasedDepthRender = distanceBased;

                if (distanceBased)
                    this._pDistancePass.iActivate(stage, camera);
                else
                    this._pDepthPass.iActivate(stage, camera);
            };

            /**
            * Clears the render state for the depth pass.
            *
            * @param stage The Stage used for rendering.
            *
            * @internal
            */
            DepthMaterialBase.prototype.iDeactivateForDepth = function (stage) {
                if (this._distanceBasedDepthRender)
                    this._pDistancePass.iDeactivate(stage);
                else
                    this._pDepthPass.iDeactivate(stage);
            };

            /**
            * Renders a renderable using the depth pass.
            *
            * @param renderable The RenderableBase instance that needs to be rendered.
            * @param stage The Stage used for rendering.
            * @param camera The camera from which the scene is viewed.
            * @param viewProjection The view-projection matrix used to project to the screen. This is not the same as
            * camera.viewProjection as it includes the scaling factors when rendering to textures.
            *
            * @internal
            */
            DepthMaterialBase.prototype.iRenderDepth = function (renderable, stage, camera, viewProjection) {
                if (this._distanceBasedDepthRender) {
                    if (renderable.materialOwner.animator)
                        this._pDistancePass.iUpdateAnimationState(renderable, stage, camera);

                    this._pDistancePass.iRender(renderable, stage, camera, viewProjection);
                } else {
                    if (renderable.materialOwner.animator)
                        this._pDepthPass.iUpdateAnimationState(renderable, stage, camera);

                    this._pDepthPass.iRender(renderable, stage, camera, viewProjection);
                }
            };
            return DepthMaterialBase;
        })(materials.MaterialBase);
        materials.DepthMaterialBase = DepthMaterialBase;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
var away;
(function (away) {
    (function (materials) {
        /**
        * Enumeration class for defining which lighting types affect the specific material
        * lighting component (diffuse and specular). This can be useful if, for example, you
        * want to use light probes for diffuse global lighting, but want specular reflections from
        * traditional light sources without those affecting the diffuse light.
        *
        * @see away.materials.ColorMaterial.diffuseLightSources
        * @see away.materials.ColorMaterial.specularLightSources
        * @see away.materials.TextureMaterial.diffuseLightSources
        * @see away.materials.TextureMaterial.specularLightSources
        */
        var LightSources = (function () {
            function LightSources() {
            }
            LightSources.LIGHTS = 0x01;

            LightSources.PROBES = 0x02;

            LightSources.ALL = 0x03;
            return LightSources;
        })();
        materials.LightSources = LightSources;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * LineMaterial is a material exclusively used to render wireframe objects
        *
        * @see away.entities.Lines
        */
        var LineBasicMaterial = (function (_super) {
            __extends(LineBasicMaterial, _super);
            /**
            * Creates a new LineMaterial object.
            *
            * @param thickness The thickness of the wireframe lines.
            */
            function LineBasicMaterial(thickness) {
                if (typeof thickness === "undefined") { thickness = 1.25; }
                _super.call(this);

                this.bothSides = true;

                this.pAddDepthPasses();

                this.pAddPass(this._screenPass = new materials.LineBasicPass(this));
                this._screenPass.thickness = thickness;
            }
            return LineBasicMaterial;
        })(materials.DepthMaterialBase);
        materials.LineBasicMaterial = LineBasicMaterial;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        /**
        * SkyboxMaterial is a material exclusively used to render skyboxes
        *
        * @see away3d.primitives.Skybox
        */
        var SkyboxMaterial = (function (_super) {
            __extends(SkyboxMaterial, _super);
            /**
            * Creates a new SkyboxMaterial object.
            * @param cubeMap The CubeMap to use as the skybox.
            */
            function SkyboxMaterial(cubeMap, smooth, repeat, mipmap) {
                if (typeof smooth === "undefined") { smooth = true; }
                if (typeof repeat === "undefined") { repeat = false; }
                if (typeof mipmap === "undefined") { mipmap = false; }
                _super.call(this);

                this._cubeMap = cubeMap;
                this.pAddPass(this._skyboxPass = new materials.SkyboxPass(this));
                this._skyboxPass.cubeTexture = this._cubeMap;
            }
            Object.defineProperty(SkyboxMaterial.prototype, "cubeMap", {
                /**
                * The cube texture to use as the skybox.
                */
                get: function () {
                    return this._cubeMap;
                },
                set: function (value) {
                    if (value && this._cubeMap && (value.hasMipmaps != this._cubeMap.hasMipmaps || value.format != this._cubeMap.format))
                        this.iInvalidatePasses(null);

                    this._cubeMap = value;
                    this._skyboxPass.cubeTexture = this._cubeMap;
                },
                enumerable: true,
                configurable: true
            });

            return SkyboxMaterial;
        })(materials.MaterialBase);
        materials.SkyboxMaterial = SkyboxMaterial;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var ContextGLBlendFactor = away.stagegl.ContextGLBlendFactor;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;

        var Texture2DBase = away.textures.Texture2DBase;

        /**
        * TriangleMaterial forms an abstract base class for the default shaded materials provided by Stage,
        * using material methods to define their appearance.
        */
        var TriangleBasicMaterial = (function (_super) {
            __extends(TriangleBasicMaterial, _super);
            function TriangleBasicMaterial(textureColor, smoothAlpha, repeat, mipmap) {
                if (typeof textureColor === "undefined") { textureColor = null; }
                if (typeof smoothAlpha === "undefined") { smoothAlpha = null; }
                if (typeof repeat === "undefined") { repeat = false; }
                if (typeof mipmap === "undefined") { mipmap = false; }
                _super.call(this);
                this._animateUVs = false;
                this._alphaBlending = false;
                this._alpha = 1;
                this._alphaThreshold = 0;
                this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;

                if (textureColor instanceof Texture2DBase) {
                    this.texture = textureColor;

                    this.smooth = (smoothAlpha == null) ? true : false;
                    this.repeat = repeat;
                    this.mipmap = mipmap;
                } else {
                    this.color = textureColor ? Number(textureColor) : 0xCCCCCC;
                    this.alpha = (smoothAlpha == null) ? 1 : Number(smoothAlpha);
                }
            }
            Object.defineProperty(TriangleBasicMaterial.prototype, "animateUVs", {
                /**
                * Specifies whether or not the UV coordinates should be animated using a transformation matrix.
                */
                get: function () {
                    return this._animateUVs;
                },
                set: function (value) {
                    this._animateUVs = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "depthCompareMode", {
                /**
                * The depth compare mode used to render the renderables using this material.
                *
                * @see away.stagegl.ContextGLCompareMode
                */
                get: function () {
                    return this._depthCompareMode;
                },
                set: function (value) {
                    if (this._depthCompareMode == value)
                        return;

                    this._depthCompareMode = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "alpha", {
                /**
                * The alpha of the surface.
                */
                get: function () {
                    return this._alpha;
                },
                set: function (value) {
                    if (value > 1)
                        value = 1;
                    else if (value < 0)
                        value = 0;

                    if (this._alpha == value)
                        return;

                    this._alpha = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "color", {
                /**
                * The diffuse reflectivity color of the surface.
                */
                get: function () {
                    return this._color;
                },
                set: function (value) {
                    if (this._color == value)
                        return;

                    this._color = value;

                    this._pUpdateColor();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "texture", {
                /**
                * The texture object to use for the albedo colour.
                */
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    if (this._texture == value)
                        return;

                    this._texture = value;

                    if (value) {
                        this._pHeight = value.height;
                        this._pWidth = value.width;
                    }

                    this._pUpdateTexture();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (this._alphaThreshold == value)
                        return;

                    this._alphaThreshold = value;

                    this._pUpdateAlphaThreshold();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleBasicMaterial.prototype, "alphaBlending", {
                /**
                * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
                * example when using textures of foliage, consider using alphaThreshold instead.
                */
                get: function () {
                    return this._alphaBlending;
                },
                set: function (value) {
                    if (this._alphaBlending == value)
                        return;

                    this._alphaBlending = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Sets the render state for the depth pass that is independent of the rendered object. Used when rendering
            * depth or distances (fe: shadow maps, depth pre-pass).
            *
            * @param stage The Stage used for rendering.
            * @param camera The camera from which the scene is viewed.
            * @param distanceBased Whether or not the depth pass or distance pass should be activated. The distance pass
            * is required for shadow cube maps.
            *
            * @internal
            */
            TriangleBasicMaterial.prototype.iActivateForDepth = function (stage, camera, distanceBased) {
                if (typeof distanceBased === "undefined") { distanceBased = false; }
                if (distanceBased)
                    this._pDistancePass.alphaMask = this._texture;
                else
                    this._pDepthPass.alphaMask = this._texture;

                _super.prototype.iActivateForDepth.call(this, stage, camera, distanceBased);
            };

            /**
            * @inheritDoc
            */
            TriangleBasicMaterial.prototype.iUpdateMaterial = function () {
                var passesInvalid;

                if (this._pScreenPassesInvalid) {
                    this.pUpdateScreenPasses();
                    passesInvalid = true;
                }

                if (passesInvalid || this.isAnyScreenPassInvalid()) {
                    this.pClearPasses();

                    this.pAddDepthPasses();

                    this.pAddChildPassesFor(this._screenPass);

                    this.addScreenPass(this._screenPass);
                }
            };

            /**
            * Adds a compiled pass that renders to the screen.
            * @param pass The pass to be added.
            */
            TriangleBasicMaterial.prototype.addScreenPass = function (pass) {
                if (pass) {
                    this.pAddPass(pass);
                    pass._iPassesDirty = false;
                }
            };

            /**
            * Tests if any pass that renders to the screen is invalid. This would trigger a new setup of the multiple passes.
            * @return
            */
            TriangleBasicMaterial.prototype.isAnyScreenPassInvalid = function () {
                if (this._screenPass._iPassesDirty)
                    return true;

                return false;
            };

            /**
            * @inheritDoc
            */
            TriangleBasicMaterial.prototype.iActivatePass = function (index, stage, camera) {
                if (index == 0)
                    stage.context.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);

                _super.prototype.iActivatePass.call(this, index, stage, camera);
            };

            /**
            * @inheritDoc
            */
            TriangleBasicMaterial.prototype.iDeactivate = function (stage) {
                _super.prototype.iDeactivate.call(this, stage);

                stage.context.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);
            };

            /**
            * Updates screen passes when they were found to be invalid.
            */
            TriangleBasicMaterial.prototype.pUpdateScreenPasses = function () {
                this.initPasses();

                this.setBlendAndCompareModes();

                this._pScreenPassesInvalid = false;
            };

            TriangleBasicMaterial.prototype._pUpdateColor = function () {
                this._screenPass.diffuseColor = this._color;
            };

            TriangleBasicMaterial.prototype._pUpdateAlphaThreshold = function () {
                this._screenPass.alphaThreshold = this._alphaThreshold;
                this._pDepthPass.alphaThreshold = this._alphaThreshold;
                this._pDistancePass.alphaThreshold = this._alphaThreshold;
            };

            TriangleBasicMaterial.prototype._pUpdateTexture = function () {
                this._screenPass.texture = this._texture;
                this._pDistancePass.alphaMask = this._texture;
                this._pDepthPass.alphaMask = this._texture;
            };

            /**
            * Initializes all the passes and their dependent passes.
            */
            TriangleBasicMaterial.prototype.initPasses = function () {
                //
            };

            /**
            * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
            */
            TriangleBasicMaterial.prototype.setBlendAndCompareModes = function () {
                this._pRequiresBlending = (this._pBlendMode != away.base.BlendMode.NORMAL || this._alphaBlending || this._alpha < 1);
                this._screenPass.depthCompareMode = this._depthCompareMode;
                this._screenPass.preserveAlpha = this._pRequiresBlending;
                this._screenPass.setBlendMode((this._pBlendMode == away.base.BlendMode.NORMAL && this._pRequiresBlending) ? away.base.BlendMode.LAYER : this._pBlendMode);
                this._screenPass.forceSeparateMVP = false;
            };
            return TriangleBasicMaterial;
        })(materials.DepthMaterialBase);
        materials.TriangleBasicMaterial = TriangleBasicMaterial;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    /**
    *
    */
    (function (materials) {
        var TriangleMaterialMode = (function () {
            function TriangleMaterialMode() {
            }
            TriangleMaterialMode.SINGLE_PASS = "singlePass";

            TriangleMaterialMode.MULTI_PASS = "multiPass";
            return TriangleMaterialMode;
        })();
        materials.TriangleMaterialMode = TriangleMaterialMode;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var ColorTransform = away.geom.ColorTransform;
        var ContextGLBlendFactor = away.stagegl.ContextGLBlendFactor;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;

        var Texture2DBase = away.textures.Texture2DBase;

        /**
        * TriangleMethodMaterial forms an abstract base class for the default shaded materials provided by Stage,
        * using material methods to define their appearance.
        */
        var TriangleMethodMaterial = (function (_super) {
            __extends(TriangleMethodMaterial, _super);
            function TriangleMethodMaterial(textureColor, smoothAlpha, repeat, mipmap) {
                if (typeof textureColor === "undefined") { textureColor = null; }
                if (typeof smoothAlpha === "undefined") { smoothAlpha = null; }
                if (typeof repeat === "undefined") { repeat = false; }
                if (typeof mipmap === "undefined") { mipmap = false; }
                _super.call(this);
                this._animateUVs = false;
                this._alphaBlending = false;
                this._alpha = 1;
                this._alphaThreshold = 0;
                this._specularLightSources = 0x01;
                this._diffuseLightSources = 0x03;
                this._ambientMethod = new materials.AmbientBasicMethod();
                this._diffuseMethod = new materials.DiffuseBasicMethod();
                this._normalMethod = new materials.NormalBasicMethod();
                this._specularMethod = new materials.SpecularBasicMethod();
                this._enableLightFallOff = true;
                this._depthCompareMode = ContextGLCompareMode.LESS_EQUAL;

                this._materialMode = materials.TriangleMaterialMode.SINGLE_PASS;

                if (textureColor instanceof Texture2DBase) {
                    this.texture = textureColor;

                    this.smooth = (smoothAlpha == null) ? true : false;
                    this.repeat = repeat;
                    this.mipmap = mipmap;
                } else {
                    this.color = textureColor ? Number(textureColor) : 0xCCCCCC;
                    this.alpha = (smoothAlpha == null) ? 1 : Number(smoothAlpha);
                }
            }
            Object.defineProperty(TriangleMethodMaterial.prototype, "materialMode", {
                get: function () {
                    return this._materialMode;
                },
                set: function (value) {
                    if (this._materialMode == value)
                        return;

                    this._materialMode = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "animateUVs", {
                /**
                * Specifies whether or not the UV coordinates should be animated using a transformation matrix.
                */
                get: function () {
                    return this._animateUVs;
                },
                set: function (value) {
                    this._animateUVs = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "depthCompareMode", {
                /**
                * The depth compare mode used to render the renderables using this material.
                *
                * @see away.stagegl.ContextGLCompareMode
                */
                get: function () {
                    return this._depthCompareMode;
                },
                set: function (value) {
                    if (this._depthCompareMode == value)
                        return;

                    this._depthCompareMode = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "alpha", {
                /**
                * The alpha of the surface.
                */
                get: function () {
                    return this._alpha;
                },
                set: function (value) {
                    if (value > 1)
                        value = 1;
                    else if (value < 0)
                        value = 0;

                    if (this._alpha == value)
                        return;

                    this._alpha = value;

                    if (this._colorTransform == null)
                        this._colorTransform = new ColorTransform();

                    this._colorTransform.alphaMultiplier = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "colorTransform", {
                /**
                * The ColorTransform object to transform the colour of the material with. Defaults to null.
                */
                get: function () {
                    return this._screenPass.colorTransform;
                },
                set: function (value) {
                    this._screenPass.colorTransform = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "color", {
                /**
                * The diffuse reflectivity color of the surface.
                */
                get: function () {
                    return this._diffuseMethod.diffuseColor;
                },
                set: function (value) {
                    this._diffuseMethod.diffuseColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "texture", {
                /**
                * The texture object to use for the albedo colour.
                */
                get: function () {
                    return this._diffuseMethod.texture;
                },
                set: function (value) {
                    this._diffuseMethod.texture = value;

                    if (value) {
                        this._pHeight = value.height;
                        this._pWidth = value.width;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "ambientTexture", {
                /**
                * The texture object to use for the ambient colour.
                */
                get: function () {
                    return this.ambientMethod.texture;
                },
                set: function (value) {
                    this._ambientMethod.texture = value;

                    this._diffuseMethod.iUseAmbientTexture = (value != null);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "enableLightFallOff", {
                /**
                * Whether or not to use fallOff and radius properties for lights. This can be used to improve performance and
                * compatibility for constrained mode.
                */
                get: function () {
                    return this._enableLightFallOff;
                },
                set: function (value) {
                    if (this._enableLightFallOff == value)
                        return;

                    this._enableLightFallOff = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "alphaThreshold", {
                /**
                * The minimum alpha value for which pixels should be drawn. This is used for transparency that is either
                * invisible or entirely opaque, often used with textures for foliage, etc.
                * Recommended values are 0 to disable alpha, or 0.5 to create smooth edges. Default value is 0 (disabled).
                */
                get: function () {
                    return this._alphaThreshold;
                },
                set: function (value) {
                    if (this._alphaThreshold == value)
                        return;

                    this._alphaThreshold = value;

                    this._diffuseMethod.alphaThreshold = value;
                    this._pDepthPass.alphaThreshold = value;
                    this._pDistancePass.alphaThreshold = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "specularLightSources", {
                /**
                * Define which light source types to use for specular reflections. This allows choosing between regular lights
                * and/or light probes for specular reflections.
                *
                * @see away3d.materials.LightSources
                */
                get: function () {
                    return this._specularLightSources;
                },
                set: function (value) {
                    this._specularLightSources = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "diffuseLightSources", {
                /**
                * Define which light source types to use for diffuse reflections. This allows choosing between regular lights
                * and/or light probes for diffuse reflections.
                *
                * @see away3d.materials.LightSources
                */
                get: function () {
                    return this._diffuseLightSources;
                },
                set: function (value) {
                    this._diffuseLightSources = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "ambientMethod", {
                /**
                * The method that provides the ambient lighting contribution. Defaults to AmbientBasicMethod.
                */
                get: function () {
                    return this._ambientMethod;
                },
                set: function (value) {
                    if (this._ambientMethod == value)
                        return;

                    if (value && this._ambientMethod)
                        value.copyFrom(this._ambientMethod);

                    this._ambientMethod = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "shadowMethod", {
                /**
                * The method used to render shadows cast on this surface, or null if no shadows are to be rendered. Defaults to null.
                */
                get: function () {
                    return this._shadowMethod;
                },
                set: function (value) {
                    if (this._shadowMethod == value)
                        return;

                    if (value && this._shadowMethod)
                        value.copyFrom(this._shadowMethod);

                    this._shadowMethod = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "diffuseMethod", {
                /**
                * The method that provides the diffuse lighting contribution. Defaults to DiffuseBasicMethod.
                */
                get: function () {
                    return this._diffuseMethod;
                },
                set: function (value) {
                    if (this._diffuseMethod == value)
                        return;

                    if (value && this._diffuseMethod)
                        value.copyFrom(this._diffuseMethod);

                    this._diffuseMethod = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "specularMethod", {
                /**
                * The method that provides the specular lighting contribution. Defaults to SpecularBasicMethod.
                */
                get: function () {
                    return this._specularMethod;
                },
                set: function (value) {
                    if (this._specularMethod == value)
                        return;

                    if (value && this._specularMethod)
                        value.copyFrom(this._specularMethod);

                    this._specularMethod = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "normalMethod", {
                /**
                * The method used to generate the per-pixel normals. Defaults to NormalBasicMethod.
                */
                get: function () {
                    return this._normalMethod;
                },
                set: function (value) {
                    if (this._normalMethod == value)
                        return;

                    if (value && this._normalMethod)
                        value.copyFrom(this._normalMethod);

                    this._normalMethod = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Appends an "effect" shading method to the shader. Effect methods are those that do not influence the lighting
            * but modulate the shaded colour, used for fog, outlines, etc. The method will be applied to the result of the
            * methods added prior.
            */
            TriangleMethodMaterial.prototype.addEffectMethod = function (method) {
                if (this._screenPass == null)
                    this._screenPass = new materials.TriangleMethodPass(this);

                this._screenPass.addEffectMethod(method);

                this.pInvalidateScreenPasses();
            };

            Object.defineProperty(TriangleMethodMaterial.prototype, "numEffectMethods", {
                /**
                * The number of "effect" methods added to the material.
                */
                get: function () {
                    return this._screenPass ? this._screenPass.numEffectMethods : 0;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Queries whether a given effect method was added to the material.
            *
            * @param method The method to be queried.
            * @return true if the method was added to the material, false otherwise.
            */
            TriangleMethodMaterial.prototype.hasEffectMethod = function (method) {
                return this._screenPass ? this._screenPass.hasEffectMethod(method) : false;
            };

            /**
            * Returns the method added at the given index.
            * @param index The index of the method to retrieve.
            * @return The method at the given index.
            */
            TriangleMethodMaterial.prototype.getEffectMethodAt = function (index) {
                if (this._screenPass == null)
                    return null;

                return this._screenPass.getEffectMethodAt(index);
            };

            /**
            * Adds an effect method at the specified index amongst the methods already added to the material. Effect
            * methods are those that do not influence the lighting but modulate the shaded colour, used for fog, outlines,
            * etc. The method will be applied to the result of the methods with a lower index.
            */
            TriangleMethodMaterial.prototype.addEffectMethodAt = function (method, index) {
                if (this._screenPass == null)
                    this._screenPass = new materials.TriangleMethodPass(this);

                this._screenPass.addEffectMethodAt(method, index);

                this.pInvalidateScreenPasses();
            };

            /**
            * Removes an effect method from the material.
            * @param method The method to be removed.
            */
            TriangleMethodMaterial.prototype.removeEffectMethod = function (method) {
                if (this._screenPass == null)
                    return;

                this._screenPass.removeEffectMethod(method);

                // reconsider
                if (this._screenPass.numEffectMethods == 0)
                    this.pInvalidateScreenPasses();
            };

            Object.defineProperty(TriangleMethodMaterial.prototype, "normalMap", {
                /**
                * The normal map to modulate the direction of the surface for each texel. The default normal method expects
                * tangent-space normal maps, but others could expect object-space maps.
                */
                get: function () {
                    return this._normalMethod.normalMap;
                },
                set: function (value) {
                    this._normalMethod.normalMap = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "specularMap", {
                /**
                * A specular map that defines the strength of specular reflections for each texel in the red channel,
                * and the gloss factor in the green channel. You can use SpecularBitmapTexture if you want to easily set
                * specular and gloss maps from grayscale images, but correctly authored images are preferred.
                */
                get: function () {
                    return this._specularMethod.texture;
                },
                set: function (value) {
                    this._specularMethod.texture = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "gloss", {
                /**
                * The glossiness of the material (sharpness of the specular highlight).
                */
                get: function () {
                    return this._specularMethod.gloss;
                },
                set: function (value) {
                    this._specularMethod.gloss = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "ambient", {
                /**
                * The strength of the ambient reflection.
                */
                get: function () {
                    return this._ambientMethod.ambient;
                },
                set: function (value) {
                    this._ambientMethod.ambient = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "specular", {
                /**
                * The overall strength of the specular reflection.
                */
                get: function () {
                    return this._specularMethod.specular;
                },
                set: function (value) {
                    this._specularMethod.specular = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "ambientColor", {
                /**
                * The colour of the ambient reflection.
                */
                get: function () {
                    return this._ambientMethod.ambientColor;
                },
                set: function (value) {
                    this._ambientMethod.ambientColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "specularColor", {
                /**
                * The colour of the specular reflection.
                */
                get: function () {
                    return this._specularMethod.specularColor;
                },
                set: function (value) {
                    this._specularMethod.specularColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TriangleMethodMaterial.prototype, "alphaBlending", {
                /**
                * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
                * example when using textures of foliage, consider using alphaThreshold instead.
                */
                get: function () {
                    return this._alphaBlending;
                },
                set: function (value) {
                    if (this._alphaBlending == value)
                        return;

                    this._alphaBlending = value;

                    this.pInvalidateScreenPasses();
                },
                enumerable: true,
                configurable: true
            });


            /**
            * @inheritDoc
            */
            TriangleMethodMaterial.prototype.iUpdateMaterial = function () {
                var passesInvalid;

                if (this._pScreenPassesInvalid) {
                    this.pUpdateScreenPasses();
                    passesInvalid = true;
                }

                if (passesInvalid || this.isAnyScreenPassInvalid()) {
                    this.pClearPasses();

                    this.pAddDepthPasses();

                    if (this._materialMode == materials.TriangleMaterialMode.MULTI_PASS) {
                        this.pAddChildPassesFor(this._casterLightPass);

                        if (this._nonCasterLightPasses)
                            for (var i = 0; i < this._nonCasterLightPasses.length; ++i)
                                this.pAddChildPassesFor(this._nonCasterLightPasses[i]);
                    }

                    this.pAddChildPassesFor(this._screenPass);

                    if (this._materialMode == materials.TriangleMaterialMode.MULTI_PASS) {
                        this.addScreenPass(this._casterLightPass);

                        if (this._nonCasterLightPasses)
                            for (i = 0; i < this._nonCasterLightPasses.length; ++i)
                                this.addScreenPass(this._nonCasterLightPasses[i]);
                    }

                    this.addScreenPass(this._screenPass);
                }
            };

            /**
            * Adds a compiled pass that renders to the screen.
            * @param pass The pass to be added.
            */
            TriangleMethodMaterial.prototype.addScreenPass = function (pass) {
                if (pass) {
                    this.pAddPass(pass);
                    pass._iPassesDirty = false;
                }
            };

            /**
            * Tests if any pass that renders to the screen is invalid. This would trigger a new setup of the multiple passes.
            * @return
            */
            TriangleMethodMaterial.prototype.isAnyScreenPassInvalid = function () {
                if ((this._casterLightPass && this._casterLightPass._iPassesDirty) || (this._screenPass && this._screenPass._iPassesDirty))
                    return true;

                if (this._nonCasterLightPasses)
                    for (var i = 0; i < this._nonCasterLightPasses.length; ++i)
                        if (this._nonCasterLightPasses[i]._iPassesDirty)
                            return true;

                return false;
            };

            /**
            * @inheritDoc
            */
            TriangleMethodMaterial.prototype.iActivatePass = function (index, stage, camera) {
                if (index == 0)
                    stage.context.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);

                _super.prototype.iActivatePass.call(this, index, stage, camera);
            };

            /**
            * @inheritDoc
            */
            TriangleMethodMaterial.prototype.iDeactivate = function (stage) {
                _super.prototype.iDeactivate.call(this, stage);

                stage.context.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);
            };

            /**
            * Updates screen passes when they were found to be invalid.
            */
            TriangleMethodMaterial.prototype.pUpdateScreenPasses = function () {
                this.initPasses();

                this.setBlendAndCompareModes();

                this._pScreenPassesInvalid = false;
            };

            /**
            * Initializes all the passes and their dependent passes.
            */
            TriangleMethodMaterial.prototype.initPasses = function () {
                // let the effects pass handle everything if there are no lights, when there are effect methods applied
                // after shading, or when the material mode is single pass.
                if (this.numLights == 0 || this.numEffectMethods > 0 || this._materialMode == materials.TriangleMaterialMode.SINGLE_PASS)
                    this.initEffectPass();
                else if (this._screenPass)
                    this.removeEffectPass();

                // only use a caster light pass if shadows need to be rendered
                if (this._shadowMethod && this._materialMode == materials.TriangleMaterialMode.MULTI_PASS)
                    this.initCasterLightPass();
                else if (this._casterLightPass)
                    this.removeCasterLightPass();

                // only use non caster light passes if there are lights that don't cast
                if (this.numNonCasters > 0 && this._materialMode == materials.TriangleMaterialMode.MULTI_PASS)
                    this.initNonCasterLightPasses();
                else if (this._nonCasterLightPasses)
                    this.removeNonCasterLightPasses();
            };

            /**
            * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
            */
            TriangleMethodMaterial.prototype.setBlendAndCompareModes = function () {
                var forceSeparateMVP = Boolean(this._casterLightPass || this._screenPass);

                // caster light pass is always first if it exists, hence it uses normal blending
                if (this._casterLightPass) {
                    this._casterLightPass.setBlendMode(away.base.BlendMode.NORMAL);
                    this._casterLightPass.depthCompareMode = this._depthCompareMode;
                    this._casterLightPass.forceSeparateMVP = forceSeparateMVP;
                }

                if (this._nonCasterLightPasses) {
                    var firstAdditiveIndex = 0;

                    // if there's no caster light pass, the first non caster light pass will be the first
                    // and should use normal blending
                    if (!this._casterLightPass) {
                        this._nonCasterLightPasses[0].forceSeparateMVP = forceSeparateMVP;
                        this._nonCasterLightPasses[0].setBlendMode(away.base.BlendMode.NORMAL);
                        this._nonCasterLightPasses[0].depthCompareMode = this._depthCompareMode;
                        firstAdditiveIndex = 1;
                    }

                    for (var i = firstAdditiveIndex; i < this._nonCasterLightPasses.length; ++i) {
                        this._nonCasterLightPasses[i].forceSeparateMVP = forceSeparateMVP;
                        this._nonCasterLightPasses[i].setBlendMode(away.base.BlendMode.ADD);
                        this._nonCasterLightPasses[i].depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
                    }
                }

                if (this._casterLightPass || this._nonCasterLightPasses) {
                    //cannot be blended by blendmode property if multipass enabled
                    this._pRequiresBlending = false;

                    // there are light passes, so this should be blended in
                    if (this._screenPass) {
                        this._screenPass.iIgnoreLights = true;
                        this._screenPass.depthCompareMode = ContextGLCompareMode.LESS_EQUAL;
                        this._screenPass.setBlendMode(away.base.BlendMode.LAYER);
                        this._screenPass.forceSeparateMVP = forceSeparateMVP;
                    }
                } else if (this._screenPass) {
                    this._pRequiresBlending = (this._pBlendMode != away.base.BlendMode.NORMAL || this._alphaBlending || (this._colorTransform && this._colorTransform.alphaMultiplier < 1));

                    // effects pass is the only pass, so it should just blend normally
                    this._screenPass.iIgnoreLights = false;
                    this._screenPass.depthCompareMode = this._depthCompareMode;
                    this._screenPass.preserveAlpha = this._pRequiresBlending;
                    this._screenPass.colorTransform = this._colorTransform;
                    this._screenPass.setBlendMode((this._pBlendMode == away.base.BlendMode.NORMAL && this._pRequiresBlending) ? away.base.BlendMode.LAYER : this._pBlendMode);
                    this._screenPass.forceSeparateMVP = false;
                }
            };

            TriangleMethodMaterial.prototype.initCasterLightPass = function () {
                if (this._casterLightPass == null)
                    this._casterLightPass = new materials.TriangleMethodPass(this, materials.MaterialPassMode.LIGHTING);

                this._casterLightPass.enableLightFallOff = this._enableLightFallOff;
                this._casterLightPass.animateUVs = this._animateUVs;
                this._casterLightPass.lightPicker = new materials.StaticLightPicker([this._shadowMethod.castingLight]);
                this._casterLightPass.shadowMethod = this._shadowMethod;
                this._casterLightPass.diffuseMethod = this._diffuseMethod;
                this._casterLightPass.ambientMethod = this._ambientMethod;
                this._casterLightPass.normalMethod = this._normalMethod;
                this._casterLightPass.specularMethod = this._specularMethod;
                this._casterLightPass.diffuseLightSources = this._diffuseLightSources;
                this._casterLightPass.specularLightSources = this._specularLightSources;
            };

            TriangleMethodMaterial.prototype.removeCasterLightPass = function () {
                this._casterLightPass.dispose();
                this.pRemovePass(this._casterLightPass);
                this._casterLightPass = null;
            };

            TriangleMethodMaterial.prototype.initNonCasterLightPasses = function () {
                this.removeNonCasterLightPasses();
                var pass;
                var numDirLights = this._pLightPicker.numDirectionalLights;
                var numPointLights = this._pLightPicker.numPointLights;
                var numLightProbes = this._pLightPicker.numLightProbes;
                var dirLightOffset = 0;
                var pointLightOffset = 0;
                var probeOffset = 0;

                if (!this._casterLightPass) {
                    numDirLights += this._pLightPicker.numCastingDirectionalLights;
                    numPointLights += this._pLightPicker.numCastingPointLights;
                }

                this._nonCasterLightPasses = new Array();

                while (dirLightOffset < numDirLights || pointLightOffset < numPointLights || probeOffset < numLightProbes) {
                    pass = new materials.TriangleMethodPass(this, materials.MaterialPassMode.LIGHTING);
                    pass.enableLightFallOff = this._enableLightFallOff;
                    pass.animateUVs = this._animateUVs;
                    pass.includeCasters = this._shadowMethod == null;
                    pass.directionalLightsOffset = dirLightOffset;
                    pass.pointLightsOffset = pointLightOffset;
                    pass.lightProbesOffset = probeOffset;
                    pass.lightPicker = this._pLightPicker;
                    pass.diffuseMethod = this._diffuseMethod;
                    pass.ambientMethod = this._ambientMethod;
                    pass.normalMethod = this._normalMethod;
                    pass.specularMethod = this._specularMethod;
                    pass.diffuseLightSources = this._diffuseLightSources;
                    pass.specularLightSources = this._specularLightSources;
                    this._nonCasterLightPasses.push(pass);

                    dirLightOffset += pass.iNumDirectionalLights;
                    pointLightOffset += pass.iNumPointLights;
                    probeOffset += pass.iNumLightProbes;
                }
            };

            TriangleMethodMaterial.prototype.removeNonCasterLightPasses = function () {
                if (!this._nonCasterLightPasses)
                    return;

                for (var i = 0; i < this._nonCasterLightPasses.length; ++i) {
                    this.pRemovePass(this._nonCasterLightPasses[i]);
                    this._nonCasterLightPasses[i].dispose();
                }

                this._nonCasterLightPasses = null;
            };

            TriangleMethodMaterial.prototype.removeEffectPass = function () {
                if (this._screenPass.ambientMethod != this._ambientMethod)
                    this._screenPass.ambientMethod.dispose();

                if (this._screenPass.diffuseMethod != this._diffuseMethod)
                    this._screenPass.diffuseMethod.dispose();

                if (this._screenPass.specularMethod != this._specularMethod)
                    this._screenPass.specularMethod.dispose();

                if (this._screenPass.normalMethod != this._normalMethod)
                    this._screenPass.normalMethod.dispose();

                this.pRemovePass(this._screenPass);

                this._screenPass.dispose();
                this._screenPass = null;
            };

            TriangleMethodMaterial.prototype.initEffectPass = function () {
                if (this._screenPass == null)
                    this._screenPass = new materials.TriangleMethodPass(this);

                this._screenPass.enableLightFallOff = this._enableLightFallOff;
                this._screenPass.animateUVs = this._animateUVs;

                if (this._materialMode == materials.TriangleMaterialMode.SINGLE_PASS) {
                    this._screenPass.ambientMethod = this._ambientMethod;
                    this._screenPass.diffuseMethod = this._diffuseMethod;
                    this._screenPass.specularMethod = this._specularMethod;
                    this._screenPass.normalMethod = this._normalMethod;
                    this._screenPass.shadowMethod = this._shadowMethod;
                } else if (this._materialMode == materials.TriangleMaterialMode.MULTI_PASS) {
                    if (this.numLights == 0) {
                        this._screenPass.diffuseMethod = this._diffuseMethod;
                    } else {
                        this._screenPass.diffuseMethod = new materials.DiffuseBasicMethod();
                        this._screenPass.diffuseMethod.diffuseColor = 0x000000;
                        this._screenPass.diffuseMethod.diffuseAlpha = 0;
                    }

                    this._screenPass.preserveAlpha = false;
                    this._screenPass.normalMethod = this._normalMethod;
                }
            };

            Object.defineProperty(TriangleMethodMaterial.prototype, "numLights", {
                /**
                * The maximum total number of lights provided by the light picker.
                */
                get: function () {
                    return this._pLightPicker ? this._pLightPicker.numLightProbes + this._pLightPicker.numDirectionalLights + this._pLightPicker.numPointLights + this._pLightPicker.numCastingDirectionalLights + this._pLightPicker.numCastingPointLights : 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TriangleMethodMaterial.prototype, "numNonCasters", {
                /**
                * The amount of lights that don't cast shadows.
                */
                get: function () {
                    return this._pLightPicker ? this._pLightPicker.numLightProbes + this._pLightPicker.numDirectionalLights + this._pLightPicker.numPointLights : 0;
                },
                enumerable: true,
                configurable: true
            });
            return TriangleMethodMaterial;
        })(materials.DepthMaterialBase);
        materials.TriangleMethodMaterial = TriangleMethodMaterial;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var DefaultMaterialManager = (function () {
            function DefaultMaterialManager() {
            }
            DefaultMaterialManager.getDefaultMaterial = function (materialOwner) {
                if (typeof materialOwner === "undefined") { materialOwner = null; }
                if (materialOwner != null && materialOwner.assetType == away.library.AssetType.LINE_SUB_MESH) {
                    if (!DefaultMaterialManager._defaultLineMaterial)
                        DefaultMaterialManager.createDefaultLineMaterial();

                    return DefaultMaterialManager._defaultLineMaterial;
                } else {
                    if (!DefaultMaterialManager._defaultTriangleMaterial)
                        DefaultMaterialManager.createDefaultTriangleMaterial();

                    return DefaultMaterialManager._defaultTriangleMaterial;
                }
            };

            DefaultMaterialManager.getDefaultTexture = function (materialOwner) {
                if (typeof materialOwner === "undefined") { materialOwner = null; }
                if (!DefaultMaterialManager._defaultTexture)
                    DefaultMaterialManager.createDefaultTexture();

                return DefaultMaterialManager._defaultTexture;
            };

            DefaultMaterialManager.createDefaultTexture = function () {
                DefaultMaterialManager._defaultBitmapData = DefaultMaterialManager.createCheckeredBitmapData();
                DefaultMaterialManager._defaultTexture = new away.textures.BitmapTexture(DefaultMaterialManager._defaultBitmapData, true);
                DefaultMaterialManager._defaultTexture.name = "defaultTexture";
            };

            DefaultMaterialManager.createCheckeredBitmapData = function () {
                var b = new away.base.BitmapData(8, 8, false, 0x000000);

                //create chekerboard
                var i, j;
                for (i = 0; i < 8; i++) {
                    for (j = 0; j < 8; j++) {
                        if ((j & 1) ^ (i & 1)) {
                            b.setPixel(i, j, 0XFFFFFF);
                        }
                    }
                }

                return b;
            };

            DefaultMaterialManager.createDefaultTriangleMaterial = function () {
                if (!DefaultMaterialManager._defaultTexture)
                    DefaultMaterialManager.createDefaultTexture();

                DefaultMaterialManager._defaultTriangleMaterial = new materials.TriangleBasicMaterial(DefaultMaterialManager._defaultTexture);
                DefaultMaterialManager._defaultTriangleMaterial.mipmap = false;
                DefaultMaterialManager._defaultTriangleMaterial.smooth = false;
                DefaultMaterialManager._defaultTriangleMaterial.name = "defaultTriangleMaterial";
            };

            DefaultMaterialManager.createDefaultLineMaterial = function () {
                DefaultMaterialManager._defaultLineMaterial = new materials.LineBasicMaterial();
                DefaultMaterialManager._defaultLineMaterial.name = "defaultSegmentMaterial";
            };
            return DefaultMaterialManager;
        })();
        materials.DefaultMaterialManager = DefaultMaterialManager;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (materials) {
        var ContextGLTextureFormat = away.stagegl.ContextGLTextureFormat;

        var ShaderCompilerHelper = (function () {
            function ShaderCompilerHelper() {
            }
            /**
            * A helper method that generates standard code for sampling from a texture using the normal uv coordinates.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param sharedReg The shared register object for the shader.
            * @param inputReg The texture stream register.
            * @param texture The texture which will be assigned to the given slot.
            * @param uvReg An optional uv register if coordinates different from the primary uv coordinates are to be used.
            * @param forceWrap If true, texture wrapping is enabled regardless of the material setting.
            * @return The fragment code that performs the sampling.
            *
            * @protected
            */
            ShaderCompilerHelper.getTex2DSampleCode = function (vo, targetReg, sharedReg, inputReg, texture, uvReg, forceWrap) {
                if (typeof uvReg === "undefined") { uvReg = null; }
                if (typeof forceWrap === "undefined") { forceWrap = null; }
                var wrap = forceWrap || (vo.repeatTextures ? "wrap" : "clamp");
                var filter;

                var format = ShaderCompilerHelper.getFormatStringForTexture(texture);

                var enableMipMaps = vo.useMipmapping && texture.hasMipmaps;

                if (vo.useSmoothTextures)
                    filter = enableMipMaps ? "linear,miplinear" : "linear";
                else
                    filter = enableMipMaps ? "nearest,mipnearest" : "nearest";

                if (uvReg == null)
                    uvReg = sharedReg.uvVarying;

                return "tex " + targetReg + ", " + uvReg + ", " + inputReg + " <2d," + filter + "," + format + wrap + ">\n";
            };

            /**
            * A helper method that generates standard code for sampling from a cube texture.
            * @param vo The DependencyVO object linking this method with the pass currently being compiled.
            * @param targetReg The register in which to store the sampled colour.
            * @param inputReg The texture stream register.
            * @param texture The cube map which will be assigned to the given slot.
            * @param uvReg The direction vector with which to sample the cube map.
            *
            * @protected
            */
            ShaderCompilerHelper.getTexCubeSampleCode = function (vo, targetReg, inputReg, texture, uvReg) {
                var filter;
                var format = ShaderCompilerHelper.getFormatStringForTexture(texture);
                var enableMipMaps = vo.useMipmapping && texture.hasMipmaps;

                if (vo.useSmoothTextures)
                    filter = enableMipMaps ? "linear,miplinear" : "linear";
                else
                    filter = enableMipMaps ? "nearest,mipnearest" : "nearest";

                return "tex " + targetReg + ", " + uvReg + ", " + inputReg + " <cube," + format + filter + ">\n";
            };

            /**
            * Generates a texture format string for the sample instruction.
            * @param texture The texture for which to get the format string.
            * @return
            *
            * @protected
            */
            ShaderCompilerHelper.getFormatStringForTexture = function (texture) {
                switch (texture.format) {
                    case ContextGLTextureFormat.COMPRESSED:
                        return "dxt1,";
                        break;
                    case ContextGLTextureFormat.COMPRESSED_ALPHA:
                        return "dxt5,";
                        break;
                    default:
                        return "";
                }
            };
            return ShaderCompilerHelper;
        })();
        materials.ShaderCompilerHelper = ShaderCompilerHelper;
    })(away.materials || (away.materials = {}));
    var materials = away.materials;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (animators) {
        var ShaderRegisterElement = away.materials.ShaderRegisterElement;

        /**
        * ...
        */
        var AnimationRegisterCache = (function (_super) {
            __extends(AnimationRegisterCache, _super);
            function AnimationRegisterCache(profile) {
                _super.call(this, profile);
                this.indexDictionary = new Object();
                this.vertexConstantData = new Array();
                this.fragmentConstantData = new Array();
            }
            AnimationRegisterCache.prototype.reset = function () {
                _super.prototype.reset.call(this);

                this.rotationRegisters = new Array();
                this.positionAttribute = this.getRegisterFromString(this.sourceRegisters[0]);
                this.scaleAndRotateTarget = this.getRegisterFromString(this.targetRegisters[0]);
                this.addVertexTempUsages(this.scaleAndRotateTarget, 1);

                for (var i = 1; i < this.targetRegisters.length; i++) {
                    this.rotationRegisters.push(this.getRegisterFromString(this.targetRegisters[i]));
                    this.addVertexTempUsages(this.rotationRegisters[i - 1], 1);
                }

                this.scaleAndRotateTarget = new ShaderRegisterElement(this.scaleAndRotateTarget.regName, this.scaleAndRotateTarget.index); //only use xyz, w is used as vertexLife

                //allot const register
                this.vertexZeroConst = this.getFreeVertexConstant();
                this.vertexZeroConst = new ShaderRegisterElement(this.vertexZeroConst.regName, this.vertexZeroConst.index, 0);
                this.vertexOneConst = new ShaderRegisterElement(this.vertexZeroConst.regName, this.vertexZeroConst.index, 1);
                this.vertexTwoConst = new ShaderRegisterElement(this.vertexZeroConst.regName, this.vertexZeroConst.index, 2);

                //allot temp register
                this.positionTarget = this.getFreeVertexVectorTemp();
                this.addVertexTempUsages(this.positionTarget, 1);
                this.positionTarget = new ShaderRegisterElement(this.positionTarget.regName, this.positionTarget.index);

                if (this.needVelocity) {
                    this.velocityTarget = this.getFreeVertexVectorTemp();
                    this.addVertexTempUsages(this.velocityTarget, 1);
                    this.velocityTarget = new ShaderRegisterElement(this.velocityTarget.regName, this.velocityTarget.index);
                    this.vertexTime = new ShaderRegisterElement(this.velocityTarget.regName, this.velocityTarget.index, 3);
                    this.vertexLife = new ShaderRegisterElement(this.positionTarget.regName, this.positionTarget.index, 3);
                } else {
                    var tempTime = this.getFreeVertexVectorTemp();
                    this.addVertexTempUsages(tempTime, 1);
                    this.vertexTime = new ShaderRegisterElement(tempTime.regName, tempTime.index, 0);
                    this.vertexLife = new ShaderRegisterElement(tempTime.regName, tempTime.index, 1);
                }
            };

            AnimationRegisterCache.prototype.setUVSourceAndTarget = function (UVAttribute, UVVaring) {
                this.uvVar = this.getRegisterFromString(UVVaring);
                this.uvAttribute = this.getRegisterFromString(UVAttribute);

                //uv action is processed after normal actions,so use offsetTarget as uvTarget
                this.uvTarget = new ShaderRegisterElement(this.positionTarget.regName, this.positionTarget.index);
            };

            AnimationRegisterCache.prototype.setRegisterIndex = function (node, parameterIndex /*int*/ , registerIndex /*int*/ ) {
                //8 should be enough for any node.
                var t = this.indexDictionary[node.id];

                if (t == null)
                    t = this.indexDictionary[node.id] = new Array(8);

                t[parameterIndex] = registerIndex;
            };

            AnimationRegisterCache.prototype.getRegisterIndex = function (node, parameterIndex /*int*/ ) {
                return this.indexDictionary[node.id][parameterIndex];
            };

            AnimationRegisterCache.prototype.getInitCode = function () {
                var len = this.sourceRegisters.length;
                var code = "";
                for (var i = 0; i < len; i++)
                    code += "mov " + this.targetRegisters[i] + "," + this.sourceRegisters[i] + "\n";

                code += "mov " + this.positionTarget + ".xyz," + this.vertexZeroConst.toString() + "\n";

                if (this.needVelocity)
                    code += "mov " + this.velocityTarget + ".xyz," + this.vertexZeroConst.toString() + "\n";

                return code;
            };

            AnimationRegisterCache.prototype.getCombinationCode = function () {
                return "add " + this.scaleAndRotateTarget + ".xyz," + this.scaleAndRotateTarget + ".xyz," + this.positionTarget + ".xyz\n";
            };

            AnimationRegisterCache.prototype.initColorRegisters = function () {
                var code = "";
                if (this.hasColorMulNode) {
                    this.colorMulTarget = this.getFreeVertexVectorTemp();
                    this.addVertexTempUsages(this.colorMulTarget, 1);
                    this.colorMulVary = this.getFreeVarying();
                    code += "mov " + this.colorMulTarget + "," + this.vertexOneConst + "\n";
                }
                if (this.hasColorAddNode) {
                    this.colorAddTarget = this.getFreeVertexVectorTemp();
                    this.addVertexTempUsages(this.colorAddTarget, 1);
                    this.colorAddVary = this.getFreeVarying();
                    code += "mov " + this.colorAddTarget + "," + this.vertexZeroConst + "\n";
                }
                return code;
            };

            AnimationRegisterCache.prototype.getColorPassCode = function () {
                var code = "";
                if (this.needFragmentAnimation && (this.hasColorAddNode || this.hasColorMulNode)) {
                    if (this.hasColorMulNode)
                        code += "mov " + this.colorMulVary + "," + this.colorMulTarget + "\n";
                    if (this.hasColorAddNode)
                        code += "mov " + this.colorAddVary + "," + this.colorAddTarget + "\n";
                }
                return code;
            };

            AnimationRegisterCache.prototype.getColorCombinationCode = function (shadedTarget) {
                var code = "";
                if (this.needFragmentAnimation && (this.hasColorAddNode || this.hasColorMulNode)) {
                    var colorTarget = this.getRegisterFromString(shadedTarget);
                    this.addFragmentTempUsages(colorTarget, 1);
                    if (this.hasColorMulNode)
                        code += "mul " + colorTarget + "," + colorTarget + "," + this.colorMulVary + "\n";
                    if (this.hasColorAddNode)
                        code += "add " + colorTarget + "," + colorTarget + "," + this.colorAddVary + "\n";
                }
                return code;
            };

            AnimationRegisterCache.prototype.getRegisterFromString = function (code) {
                var temp = code.split(/(\d+)/);
                return new ShaderRegisterElement(temp[0], parseInt(temp[1]));
            };

            Object.defineProperty(AnimationRegisterCache.prototype, "numVertexConstant", {
                get: function () {
                    return this._numVertexConstant;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimationRegisterCache.prototype, "numFragmentConstant", {
                get: function () {
                    return this._numFragmentConstant;
                },
                enumerable: true,
                configurable: true
            });

            AnimationRegisterCache.prototype.setDataLength = function () {
                this._numVertexConstant = this.numUsedVertexConstants - this.vertexConstantOffset;
                this._numFragmentConstant = this.numUsedFragmentConstants - this.fragmentConstantOffset;
                this.vertexConstantData.length = this._numVertexConstant * 4;
                this.fragmentConstantData.length = this._numFragmentConstant * 4;
            };

            AnimationRegisterCache.prototype.setVertexConst = function (index /*int*/ , x, y, z, w) {
                if (typeof x === "undefined") { x = 0; }
                if (typeof y === "undefined") { y = 0; }
                if (typeof z === "undefined") { z = 0; }
                if (typeof w === "undefined") { w = 0; }
                var _index = (index - this.vertexConstantOffset) * 4;
                this.vertexConstantData[_index++] = x;
                this.vertexConstantData[_index++] = y;
                this.vertexConstantData[_index++] = z;
                this.vertexConstantData[_index] = w;
            };

            AnimationRegisterCache.prototype.setVertexConstFromArray = function (index /*int*/ , data) {
                var _index = (index - this.vertexConstantOffset) * 4;
                for (var i = 0; i < data.length; i++)
                    this.vertexConstantData[_index++] = data[i];
            };

            AnimationRegisterCache.prototype.setVertexConstFromMatrix = function (index /*int*/ , matrix) {
                var rawData = matrix.rawData;
                var _index = (index - this.vertexConstantOffset) * 4;
                this.vertexConstantData[_index++] = rawData[0];
                this.vertexConstantData[_index++] = rawData[4];
                this.vertexConstantData[_index++] = rawData[8];
                this.vertexConstantData[_index++] = rawData[12];
                this.vertexConstantData[_index++] = rawData[1];
                this.vertexConstantData[_index++] = rawData[5];
                this.vertexConstantData[_index++] = rawData[9];
                this.vertexConstantData[_index++] = rawData[13];
                this.vertexConstantData[_index++] = rawData[2];
                this.vertexConstantData[_index++] = rawData[6];
                this.vertexConstantData[_index++] = rawData[10];
                this.vertexConstantData[_index++] = rawData[14];
                this.vertexConstantData[_index++] = rawData[3];
                this.vertexConstantData[_index++] = rawData[7];
                this.vertexConstantData[_index++] = rawData[11];
                this.vertexConstantData[_index] = rawData[15];
            };

            AnimationRegisterCache.prototype.setFragmentConst = function (index /*int*/ , x, y, z, w) {
                if (typeof x === "undefined") { x = 0; }
                if (typeof y === "undefined") { y = 0; }
                if (typeof z === "undefined") { z = 0; }
                if (typeof w === "undefined") { w = 0; }
                var _index = (index - this.fragmentConstantOffset) * 4;
                this.fragmentConstantData[_index++] = x;
                this.fragmentConstantData[_index++] = y;
                this.fragmentConstantData[_index++] = z;
                this.fragmentConstantData[_index] = w;
            };
            return AnimationRegisterCache;
        })(away.materials.ShaderRegisterCache);
        animators.AnimationRegisterCache = AnimationRegisterCache;
    })(away.animators || (away.animators = {}));
    var animators = away.animators;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (animators) {
    })(away.animators || (away.animators = {}));
    var animators = away.animators;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (animators) {
        var AbstractMethodError = away.errors.AbstractMethodError;

        /**
        * Provides an abstract base class for data set classes that hold animation data for use in animator classes.
        *
        * @see away.animators.AnimatorBase
        */
        var AnimationSetBase = (function (_super) {
            __extends(AnimationSetBase, _super);
            function AnimationSetBase() {
                _super.call(this);
                this._animations = new Array();
                this._animationNames = new Array();
                this._animationDictionary = new Object();
            }
            /**
            * Retrieves a temporary GPU register that's still free.
            *
            * @param exclude An array of non-free temporary registers.
            * @param excludeAnother An additional register that's not free.
            * @return A temporary register that can be used.
            */
            AnimationSetBase.prototype._pFindTempReg = function (exclude, excludeAnother) {
                if (typeof excludeAnother === "undefined") { excludeAnother = null; }
                var i = 0;
                var reg;

                while (true) {
                    reg = "vt" + i;
                    if (exclude.indexOf(reg) == -1 && excludeAnother != reg)
                        return reg;
                    ++i;
                }

                // can't be reached
                return null;
            };

            Object.defineProperty(AnimationSetBase.prototype, "usesCPU", {
                /**
                * Indicates whether the properties of the animation data contained within the set combined with
                * the vertex registers already in use on shading materials allows the animation data to utilise
                * GPU calls.
                */
                get: function () {
                    return this._usesCPU;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Called by the material to reset the GPU indicator before testing whether register space in the shader
            * is available for running GPU-based animation code.
            *
            * @private
            */
            AnimationSetBase.prototype.resetGPUCompatibility = function () {
                this._usesCPU = false;
            };

            AnimationSetBase.prototype.cancelGPUCompatibility = function () {
                this._usesCPU = true;
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.getAGALVertexCode = function (pass, sourceRegisters, targetRegisters, profile) {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.activate = function (stage, pass) {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.deactivate = function (stage, pass) {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.getAGALFragmentCode = function (pass, shadedTarget, profile) {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.getAGALUVCode = function (pass, UVSource, UVTarget) {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimationSetBase.prototype.doneAGALCode = function (pass) {
                throw new AbstractMethodError();
            };

            Object.defineProperty(AnimationSetBase.prototype, "assetType", {
                /**
                * @inheritDoc
                */
                get: function () {
                    return away.library.AssetType.ANIMATION_SET;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimationSetBase.prototype, "animations", {
                /**
                * Returns a vector of animation state objects that make up the contents of the animation data set.
                */
                get: function () {
                    return this._animations;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimationSetBase.prototype, "animationNames", {
                /**
                * Returns a vector of animation state objects that make up the contents of the animation data set.
                */
                get: function () {
                    return this._animationNames;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Check to determine whether a state is registered in the animation set under the given name.
            *
            * @param stateName The name of the animation state object to be checked.
            */
            AnimationSetBase.prototype.hasAnimation = function (name) {
                return this._animationDictionary[name] != null;
            };

            /**
            * Retrieves the animation state object registered in the animation data set under the given name.
            *
            * @param stateName The name of the animation state object to be retrieved.
            */
            AnimationSetBase.prototype.getAnimation = function (name) {
                return this._animationDictionary[name];
            };

            /**
            * Adds an animation state object to the aniamtion data set under the given name.
            *
            * @param stateName The name under which the animation state object will be stored.
            * @param animationState The animation state object to be staored in the set.
            */
            AnimationSetBase.prototype.addAnimation = function (node) {
                if (this._animationDictionary[node.name])
                    throw new away.errors.AnimationSetError("root node name '" + node.name + "' already exists in the set");

                this._animationDictionary[node.name] = node;

                this._animations.push(node);

                this._animationNames.push(node.name);
            };

            /**
            * Cleans up any resources used by the current object.
            */
            AnimationSetBase.prototype.dispose = function () {
            };
            return AnimationSetBase;
        })(away.library.NamedAssetBase);
        animators.AnimationSetBase = AnimationSetBase;
    })(away.animators || (away.animators = {}));
    var animators = away.animators;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (animators) {
        var AbstractMethodError = away.errors.AbstractMethodError;
        var AnimatorEvent = away.events.AnimatorEvent;
        var AssetType = away.library.AssetType;

        /**
        * Dispatched when playback of an animation inside the animator object starts.
        *
        * @eventType away3d.events.AnimatorEvent
        */
        //[Event(name="start", type="away3d.events.AnimatorEvent")]
        /**
        * Dispatched when playback of an animation inside the animator object stops.
        *
        * @eventType away3d.events.AnimatorEvent
        */
        //[Event(name="stop", type="away3d.events.AnimatorEvent")]
        /**
        * Dispatched when playback of an animation reaches the end of an animation.
        *
        * @eventType away3d.events.AnimatorEvent
        */
        //[Event(name="cycle_complete", type="away3d.events.AnimatorEvent")]
        /**
        * Provides an abstract base class for animator classes that control animation output from a data set subtype of <code>AnimationSetBase</code>.
        *
        * @see away.animators.AnimationSetBase
        */
        var AnimatorBase = (function (_super) {
            __extends(AnimatorBase, _super);
            /**
            * Creates a new <code>AnimatorBase</code> object.
            *
            * @param animationSet The animation data set to be used by the animator object.
            */
            function AnimatorBase(animationSet) {
                _super.call(this);
                this._autoUpdate = true;
                this._time = 0;
                this._playbackSpeed = 1;
                this._pOwners = new Array();
                this._pAbsoluteTime = 0;
                this._animationStates = new Object();
                /**
                * Enables translation of the animated mesh from data returned per frame via the positionDelta property of the active animation node. Defaults to true.
                *
                * @see away.animators.IAnimationState#positionDelta
                */
                this.updatePosition = true;

                this._pAnimationSet = animationSet;

                this._broadcaster = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            }
            AnimatorBase.prototype.getAnimationState = function (node) {
                var className = node.stateClass;
                var uID = node.id;

                if (this._animationStates[uID] == null)
                    this._animationStates[uID] = new className(this, node);

                return this._animationStates[uID];
            };

            AnimatorBase.prototype.getAnimationStateByName = function (name) {
                return this.getAnimationState(this._pAnimationSet.getAnimation(name));
            };

            Object.defineProperty(AnimatorBase.prototype, "absoluteTime", {
                /**
                * Returns the internal absolute time of the animator, calculated by the current time and the playback speed.
                *
                * @see #time
                * @see #playbackSpeed
                */
                get: function () {
                    return this._pAbsoluteTime;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimatorBase.prototype, "animationSet", {
                /**
                * Returns the animation data set in use by the animator.
                */
                get: function () {
                    return this._pAnimationSet;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimatorBase.prototype, "activeState", {
                /**
                * Returns the current active animation state.
                */
                get: function () {
                    return this._pActiveState;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimatorBase.prototype, "activeAnimation", {
                /**
                * Returns the current active animation node.
                */
                get: function () {
                    return this._pAnimationSet.getAnimation(this._pActiveAnimationName);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimatorBase.prototype, "activeAnimationName", {
                /**
                * Returns the current active animation node.
                */
                get: function () {
                    return this._pActiveAnimationName;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(AnimatorBase.prototype, "autoUpdate", {
                /**
                * Determines whether the animators internal update mechanisms are active. Used in cases
                * where manual updates are required either via the <code>time</code> property or <code>update()</code> method.
                * Defaults to true.
                *
                * @see #time
                * @see #update()
                */
                get: function () {
                    return this._autoUpdate;
                },
                set: function (value) {
                    if (this._autoUpdate == value)
                        return;

                    this._autoUpdate = value;

                    if (this._autoUpdate)
                        this.start();
                    else
                        this.stop();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(AnimatorBase.prototype, "time", {
                /**
                * Gets and sets the internal time clock of the animator.
                */
                get: function () {
                    return this._time;
                },
                set: function (value /*int*/ ) {
                    if (this._time == value)
                        return;

                    this.update(value);
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Sets the animation phase of the current active state's animation clip(s).
            *
            * @param value The phase value to use. 0 represents the beginning of an animation clip, 1 represents the end.
            */
            AnimatorBase.prototype.phase = function (value) {
                this._pActiveState.phase(value);
            };

            Object.defineProperty(AnimatorBase.prototype, "playbackSpeed", {
                /**
                * The amount by which passed time should be scaled. Used to slow down or speed up animations. Defaults to 1.
                */
                get: function () {
                    return this._playbackSpeed;
                },
                set: function (value) {
                    this._playbackSpeed = value;
                },
                enumerable: true,
                configurable: true
            });


            AnimatorBase.prototype.setRenderState = function (stage, renderable, vertexConstantOffset /*int*/ , vertexStreamOffset /*int*/ , camera) {
                throw new away.errors.AbstractMethodError();
            };

            /**
            * Resumes the automatic playback clock controling the active state of the animator.
            */
            AnimatorBase.prototype.start = function () {
                if (this._isPlaying || !this._autoUpdate)
                    return;

                this._time = this._pAbsoluteTime = away.utils.getTimer();

                this._isPlaying = true;

                this._broadcaster.start();

                if (!this.hasEventListener(AnimatorEvent.START))
                    return;

                if (this._startEvent == null)
                    this._startEvent = new AnimatorEvent(AnimatorEvent.START, this);

                this.dispatchEvent(this._startEvent);
            };

            /**
            * Pauses the automatic playback clock of the animator, in case manual updates are required via the
            * <code>time</code> property or <code>update()</code> method.
            *
            * @see #time
            * @see #update()
            */
            AnimatorBase.prototype.stop = function () {
                if (!this._isPlaying)
                    return;

                this._isPlaying = false;

                this._broadcaster.stop();

                if (!this.hasEventListener(AnimatorEvent.STOP))
                    return;

                if (this._stopEvent == null)
                    this._stopEvent = new AnimatorEvent(AnimatorEvent.STOP, this);

                this.dispatchEvent(this._stopEvent);
            };

            /**
            * Provides a way to manually update the active state of the animator when automatic
            * updates are disabled.
            *
            * @see #stop()
            * @see #autoUpdate
            */
            AnimatorBase.prototype.update = function (time /*int*/ ) {
                var dt = (time - this._time) * this.playbackSpeed;

                this._pUpdateDeltaTime(dt);

                this._time = time;
            };

            AnimatorBase.prototype.reset = function (name, offset) {
                if (typeof offset === "undefined") { offset = 0; }
                this.getAnimationState(this._pAnimationSet.getAnimation(name)).offset(offset + this._pAbsoluteTime);
            };

            /**
            * Used by the mesh object to which the animator is applied, registers the owner for internal use.
            *
            * @private
            */
            AnimatorBase.prototype.addOwner = function (mesh) {
                this._pOwners.push(mesh);
            };

            /**
            * Used by the mesh object from which the animator is removed, unregisters the owner for internal use.
            *
            * @private
            */
            AnimatorBase.prototype.removeOwner = function (mesh) {
                this._pOwners.splice(this._pOwners.indexOf(mesh), 1);
            };

            /**
            * Internal abstract method called when the time delta property of the animator's contents requires updating.
            *
            * @private
            */
            AnimatorBase.prototype._pUpdateDeltaTime = function (dt) {
                this._pAbsoluteTime += dt;

                this._pActiveState.update(this._pAbsoluteTime);

                if (this.updatePosition)
                    this.applyPositionDelta();
            };

            /**
            * Enter frame event handler for automatically updating the active state of the animator.
            */
            AnimatorBase.prototype.onEnterFrame = function (event) {
                if (typeof event === "undefined") { event = null; }
                this.update(away.utils.getTimer());
            };

            AnimatorBase.prototype.applyPositionDelta = function () {
                var delta = this._pActiveState.positionDelta;
                var dist = delta.length;
                var len;
                if (dist > 0) {
                    len = this._pOwners.length;
                    for (var i = 0; i < len; ++i)
                        this._pOwners[i].translateLocal(delta, dist);
                }
            };

            /**
            *  for internal use.
            *
            * @private
            */
            AnimatorBase.prototype.dispatchCycleEvent = function () {
                if (this.hasEventListener(AnimatorEvent.CYCLE_COMPLETE)) {
                    if (this._cycleEvent == null)
                        this._cycleEvent = new AnimatorEvent(AnimatorEvent.CYCLE_COMPLETE, this);

                    this.dispatchEvent(this._cycleEvent);
                }
            };

            /**
            * @inheritDoc
            */
            AnimatorBase.prototype.clone = function () {
                throw new AbstractMethodError();
            };

            /**
            * @inheritDoc
            */
            AnimatorBase.prototype.dispose = function () {
            };

            /**
            * @inheritDoc
            */
            AnimatorBase.prototype.testGPUCompatibility = function (pass) {
                throw new AbstractMethodError();
            };

            Object.defineProperty(AnimatorBase.prototype, "assetType", {
                /**
                * @inheritDoc
                */
                get: function () {
                    return AssetType.ANIMATOR;
                },
                enumerable: true,
                configurable: true
            });

            AnimatorBase.prototype.getRenderableSubGeometry = function (renderable, sourceSubGeometry) {
                //nothing to do here
                return sourceSubGeometry;
            };
            return AnimatorBase;
        })(away.library.NamedAssetBase);
        animators.AnimatorBase = AnimatorBase;
    })(away.animators || (away.animators = {}));
    var animators = away.animators;
})(away || (away = {}));
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    (function (filters) {
        var Filter3DTaskBase = (function () {
            function Filter3DTaskBase(requireDepthRender) {
                if (typeof requireDepthRender === "undefined") { requireDepthRender = false; }
                this._scaledTextureWidth = -1;
                this._scaledTextureHeight = -1;
                this._textureWidth = -1;
                this._textureHeight = -1;
                this._textureDimensionsInvalid = true;
                this._program3DInvalid = true;
                this._textureScale = 0;
                this._requireDepthRender = requireDepthRender;
            }
            Object.defineProperty(Filter3DTaskBase.prototype, "textureScale", {
                /**
                * The texture scale for the input of this texture. This will define the output of the previous entry in the chain
                */
                get: function () {
                    return this._textureScale;
                },
                set: function (value) {
                    if (this._textureScale == value) {
                        return;
                    }

                    this._textureScale = value;
                    this._scaledTextureWidth = this._textureWidth >> this._textureScale;
                    this._scaledTextureHeight = this._textureHeight >> this._textureScale;
                    this._textureDimensionsInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Filter3DTaskBase.prototype, "target", {
                get: function () {
                    return this._target;
                },
                set: function (value) {
                    this._target = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Filter3DTaskBase.prototype, "textureWidth", {
                get: function () {
                    return this._textureWidth;
                },
                set: function (value) {
                    if (this._textureWidth == value) {
                        return;
                    }

                    this._textureWidth = value;
                    this._scaledTextureWidth = this._textureWidth >> this._textureScale;
                    this._textureDimensionsInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Filter3DTaskBase.prototype, "textureHeight", {
                get: function () {
                    return this._textureHeight;
                },
                set: function (value) {
                    if (this._textureHeight == value) {
                        return;
                    }

                    this._textureHeight = value;
                    this._scaledTextureHeight = this._textureHeight >> this._textureScale;
                    this._textureDimensionsInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Filter3DTaskBase.prototype.getMainInputTexture = function (stage) {
                if (this._textureDimensionsInvalid) {
                    this.pUpdateTextures(stage);
                }

                return this._mainInputTexture;
            };

            Filter3DTaskBase.prototype.dispose = function () {
                if (this._mainInputTexture) {
                    this._mainInputTexture.dispose();
                }

                if (this._program3D) {
                    this._program3D.dispose();
                }
            };

            Filter3DTaskBase.prototype.pInvalidateProgram = function () {
                this._program3DInvalid = true;
            };

            Filter3DTaskBase.prototype.pUpdateProgram = function (stage) {
                if (this._program3D) {
                    this._program3D.dispose();
                }

                this._program3D = stage.context.createProgram();

                var vertexByteCode = (new aglsl.assembler.AGALMiniAssembler().assemble("part vertex 1\n" + this.pGetVertexCode() + "endpart"))['vertex'].data;
                var fragmentByteCode = (new aglsl.assembler.AGALMiniAssembler().assemble("part fragment 1\n" + this.pGetFragmentCode() + "endpart"))['fragment'].data;
                this._program3D.upload(vertexByteCode, fragmentByteCode);
                this._program3DInvalid = false;
            };

            Filter3DTaskBase.prototype.pGetVertexCode = function () {
                // TODO: imeplement AGAL <> GLSL
                return "mov op, va0\n" + "mov v0, va1\n";
            };

            Filter3DTaskBase.prototype.pGetFragmentCode = function () {
                throw new away.errors.AbstractMethodError();

                return null;
            };

            Filter3DTaskBase.prototype.pUpdateTextures = function (stage) {
                if (this._mainInputTexture) {
                    this._mainInputTexture.dispose();
                }

                this._mainInputTexture = stage.context.createTexture(this._scaledTextureWidth, this._scaledTextureHeight, away.stagegl.ContextGLTextureFormat.BGRA, true);

                this._textureDimensionsInvalid = false;
            };

            Filter3DTaskBase.prototype.getProgram = function (stage) {
                if (this._program3DInvalid) {
                    this.pUpdateProgram(stage);
                }

                return this._program3D;
            };

            Filter3DTaskBase.prototype.activate = function (stage, camera, depthTexture) {
            };

            Filter3DTaskBase.prototype.deactivate = function (stage) {
            };

            Object.defineProperty(Filter3DTaskBase.prototype, "requireDepthRender", {
                get: function () {
                    return this._requireDepthRender;
                },
                enumerable: true,
                configurable: true
            });
            return Filter3DTaskBase;
        })();
        filters.Filter3DTaskBase = Filter3DTaskBase;
    })(away.filters || (away.filters = {}));
    var filters = away.filters;
})(away || (away = {}));
///<reference path="../_definitions.ts"/>
var away;
(function (away) {
    (function (filters) {
        var Filter3DBase = (function () {
            function Filter3DBase() {
                this._tasks = new Array();
            }
            Object.defineProperty(Filter3DBase.prototype, "requireDepthRender", {
                get: function () {
                    return this._requireDepthRender;
                },
                enumerable: true,
                configurable: true
            });

            Filter3DBase.prototype.pAddTask = function (filter) {
                this._tasks.push(filter);

                if (this._requireDepthRender == null) {
                    this._requireDepthRender = filter.requireDepthRender;
                }
            };

            Object.defineProperty(Filter3DBase.prototype, "tasks", {
                get: function () {
                    return this._tasks;
                },
                enumerable: true,
                configurable: true
            });

            Filter3DBase.prototype.getMainInputTexture = function (stage) {
                return this._tasks[0].getMainInputTexture(stage);
            };

            Object.defineProperty(Filter3DBase.prototype, "textureWidth", {
                get: function () {
                    return this._textureWidth;
                },
                set: function (value) {
                    this._textureWidth = value;

                    for (var i = 0; i < this._tasks.length; ++i) {
                        this._tasks[i].textureWidth = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Filter3DBase.prototype, "textureHeight", {
                get: function () {
                    return this._textureHeight;
                },
                set: function (value) {
                    this._textureHeight = value;

                    for (var i = 0; i < this._tasks.length; ++i) {
                        this._tasks[i].textureHeight = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            // link up the filters correctly with the next filter
            Filter3DBase.prototype.setRenderTargets = function (mainTarget, stage) {
                this._tasks[this._tasks.length - 1].target = mainTarget;
            };

            Filter3DBase.prototype.dispose = function () {
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].dispose();
                }
            };

            Filter3DBase.prototype.update = function (stage, camera) {
            };
            return Filter3DBase;
        })();
        filters.Filter3DBase = Filter3DBase;
    })(away.filters || (away.filters = {}));
    var filters = away.filters;
})(away || (away = {}));
/**********************************************************************************************************************************************************************************************************
* This file contains a reference to all the classes used in the project.
********************************************************************************************************************************************************************************************************
*
* The TypeScript compiler exports classes in a non deterministic manner, as the extend functionality copies the prototype chain
* of one object onto another during initialisation and load (to create extensible functionality), the non deterministic nature of the
* compiler can result in an extend operation referencing a class that is undefined and not yet loaded - which throw an JavaScript error.
*
* This file provides the compiler with a strict order in which to export the TypeScript classes to mitigate undefined extend errors
*
* @see https://typescript.codeplex.com/workitem/1356 @see https://typescript.codeplex.com/workitem/913
*
*********************************************************************************************************************************************************************************************************/
///<reference path="../../libs/ref/js.d.ts"/>
///<reference path="../../libs/awayjs-core.next.d.ts"/>
///<reference path="../../libs/swfobject.d.ts"/>
///<reference path="../aglsl/Sampler.ts"/>
///<reference path="../aglsl/Token.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/OpLUT.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/Description.ts"/>
///<reference path="../aglsl/Destination.ts"/>
///<reference path="../aglsl/Mapping.ts"/>
///<reference path="../aglsl/assembler/OpCode.ts"/>
///<reference path="../aglsl/assembler/OpcodeMap.ts"/>
///<reference path="../aglsl/assembler/Part.ts"/>
///<reference path="../aglsl/assembler/RegMap.ts"/>
///<reference path="../aglsl/assembler/SamplerMap.ts"/>
///<reference path="../aglsl/assembler/AGALMiniAssembler.ts"/>
///<reference path="../aglsl/AGALTokenizer.ts"/>
///<reference path="../aglsl/Parser.ts"/>
///<reference path="events/AnimatorEvent.ts"/>
///<reference path="events/ShadingMethodEvent.ts"/>
///<reference path="errors/AnimationSetError.ts"/>
///<reference path="core/pool/RenderableBase.ts" />
///<reference path="core/pool/BillboardRenderable.ts" />
///<reference path="core/pool/IndexData.ts" />
///<reference path="core/pool/IndexDataPool.ts" />
///<reference path="core/pool/LineSubMeshRenderable.ts" />
///<reference path="core/pool/SkyBoxRenderable.ts" />
///<reference path="core/pool/TextureData.ts"/>
///<reference path="core/pool/TextureDataPool.ts"/>
///<reference path="core/pool/TriangleSubMeshRenderable.ts" />
///<reference path="core/pool/VertexData.ts" />
///<reference path="core/pool/VertexDataPool.ts" />
///<reference path="core/stagegl/ContextGLBase.ts"/>
///<reference path="core/stagegl/ContextGLClearMask.ts"/>
///<reference path="core/stagegl/ContextGLTextureFormat.ts"/>
///<reference path="core/stagegl/ContextGLTriangleFace.ts"/>
///<reference path="core/stagegl/ContextGLVertexBufferFormat.ts"/>
///<reference path="core/stagegl/ContextGLProgramType.ts"/>
///<reference path="core/stagegl/ContextGLBlendFactor.ts"/>
///<reference path="core/stagegl/ContextGLCompareMode.ts"/>
///<reference path="core/stagegl/ContextGLMipFilter.ts"/>
///<reference path="core/stagegl/ContextGLProfile.ts"/>
///<reference path="core/stagegl/ContextGLStencilAction.ts"/>
///<reference path="core/stagegl/ContextGLTextureFilter.ts"/>
///<reference path="core/stagegl/ContextGLWrapMode.ts"/>
///<reference path="core/stagegl/ContextStage3D.ts" />
///<reference path="core/stagegl/ContextWebGL.ts" />
///<reference path="core/stagegl/ResourceBaseFlash.ts"/>
///<reference path="core/stagegl/TextureBaseWebGL.ts"/>
///<reference path="core/stagegl/CubeTextureFlash.ts" />
///<reference path="core/stagegl/CubeTextureWebGL.ts" />
///<reference path="core/stagegl/IContextStageGL.ts" />
///<reference path="core/stagegl/ICubeTexture.ts" />
///<reference path="core/stagegl/IIndexBuffer.ts"/>
///<reference path="core/stagegl/IndexBufferFlash.ts"/>
///<reference path="core/stagegl/IndexBufferWebGL.ts"/>
///<reference path="core/stagegl/IProgram.ts"/>
///<reference path="core/stagegl/ITexture.ts" />
///<reference path="core/stagegl/ITextureBase.ts"/>
///<reference path="core/stagegl/IVertexBuffer.ts"/>
///<reference path="core/stagegl/OpCodes.ts"/>
///<reference path="core/stagegl/ProgramFlash.ts"/>
///<reference path="core/stagegl/ProgramWebGL.ts"/>
///<reference path="core/stagegl/SamplerState.ts"/>
///<reference path="core/stagegl/TextureFlash.ts" />
///<reference path="core/stagegl/TextureWebGL.ts" />
///<reference path="core/stagegl/VertexBufferFlash.ts"/>
///<reference path="core/stagegl/VertexBufferWebGL.ts"/>
///<reference path="managers/AGALProgramCache.ts"/>
///<reference path="managers/RTTBufferManager.ts"/>
///<reference path="core/render/RendererBase.ts" />
///<reference path="core/render/DefaultRenderer.ts" />
///<reference path="core/render/DepthRenderer.ts" />
///<reference path="core/render/Filter3DRenderer.ts" />
///<reference path="materials/compilation/ShaderObjectBase.ts"/>
///<reference path="materials/compilation/MethodVO.ts"/>
///<reference path="materials/compilation/RegisterPool.ts"/>
///<reference path="materials/compilation/ShaderRegisterCache.ts"/>
///<reference path="materials/compilation/ShaderRegisterElement.ts"/>
///<reference path="materials/compilation/ShaderCompilerBase.ts"/>
///<reference path="materials/compilation/ShaderBasicCompiler.ts"/>
///<reference path="materials/compilation/ShaderLightingCompiler.ts"/>
///<reference path="materials/compilation/ShaderRegisterCache.ts"/>
///<reference path="materials/compilation/ShaderRegisterData.ts"/>
///<reference path="materials/compilation/ShaderRegisterElement.ts"/>
///<reference path="materials/methods/ShadingMethodBase.ts"/>
///<reference path="materials/methods/LightingMethodBase.ts"/>
///<reference path="materials/methods/AmbientBasicMethod.ts"/>
///<reference path="materials/methods/DiffuseBasicMethod.ts"/>
///<reference path="materials/methods/EffectMethodBase.ts"/>
///<reference path="materials/methods/EffectColorTransformMethod.ts"/>
///<reference path="materials/methods/NormalBasicMethod.ts"/>
///<reference path="materials/methods/ShadowMapMethodBase.ts"/>
///<reference path="materials/methods/ShadowMethodBase.ts"/>
///<reference path="materials/methods/ShadowHardMethod.ts"/>
///<reference path="materials/methods/SpecularBasicMethod.ts"/>
///<reference path="materials/passes/MaterialPassBase.ts"/>
///<reference path="materials/passes/DepthMapPass.ts"/>
///<reference path="materials/passes/DistanceMapPass.ts"/>
///<reference path="materials/passes/LineBasicPass.ts"/>
///<reference path="materials/passes/SkyBoxPass.ts"/>
///<reference path="materials/passes/TriangleBasicPass.ts"/>
///<reference path="materials/passes/TriangleLightingPass.ts"/>
///<reference path="materials/passes/MaterialPassMode.ts"/>
///<reference path="materials/passes/TriangleMethodPass.ts"/>
///<reference path="materials/DepthMaterialBase.ts"/>
///<reference path="materials/LightSources.ts"/>
///<reference path="materials/LineBasicMaterial.ts"/>
///<reference path="materials/SkyBoxMaterial.ts"/>
///<reference path="materials/TriangleBasicMaterial.ts"/>
///<reference path="materials/TriangleMaterialMode.ts"/>
///<reference path="materials/TriangleMethodMaterial.ts"/>
///<reference path="materials/utils/DefaultMaterialManager.ts"/>
///<reference path="materials/utils/ShaderCompilerHelper.ts"/>
///<reference path="animators/data/AnimationRegisterCache.ts" />
///<reference path="animators/states/IAnimationState.ts" />
///<reference path="animators/AnimationSetBase.ts" />
///<reference path="animators/AnimatorBase.ts" />
///<reference path="filters/tasks/Filter3DTaskBase.ts"/>
///<reference path="filters/Filter3DBase.ts"/>
///<reference path="../../_definitions.ts"/>
var away;
(function (away) {
    /**
    * @module away.render
    */
    (function (render) {
        var Matrix3D = away.geom.Matrix3D;

        var Vector3D = away.geom.Vector3D;
        var RTTBufferManager = away.managers.RTTBufferManager;
        var StageManager = away.managers.StageManager;

        var RenderablePool = away.pool.RenderablePool;
        var SkyboxRenderable = away.pool.SkyboxRenderable;
        var ContextGLBlendFactor = away.stagegl.ContextGLBlendFactor;
        var ContextGLCompareMode = away.stagegl.ContextGLCompareMode;
        var ContextGLClearMask = away.stagegl.ContextGLClearMask;

        var RenderTexture = away.textures.RenderTexture;

        /**
        * The DefaultRenderer class provides the default rendering method. It renders the scene graph objects using the
        * materials assigned to them.
        *
        * @class away.render.DefaultRenderer
        */
        var DefaultRenderer = (function (_super) {
            __extends(DefaultRenderer, _super);
            /**
            * Creates a new DefaultRenderer object.
            *
            * @param antiAlias The amount of anti-aliasing to use.
            * @param renderMode The render mode to use.
            */
            function DefaultRenderer(forceSoftware, profile, mode) {
                if (typeof forceSoftware === "undefined") { forceSoftware = false; }
                if (typeof profile === "undefined") { profile = "baseline"; }
                if (typeof mode === "undefined") { mode = "auto"; }
                _super.call(this);
                this._skyboxProjection = new Matrix3D();

                this._skyboxRenderablePool = RenderablePool.getPool(SkyboxRenderable);

                this._pDepthRenderer = new render.DepthRenderer();
                this._pDistanceRenderer = new render.DepthRenderer(false, true);

                if (this._pStage == null)
                    this.stage = StageManager.getInstance().getFreeStage(forceSoftware, profile, mode);

                this._pRttBufferManager = RTTBufferManager.getInstance(this._pStage);

                if (this._width == 0)
                    this.width = window.innerWidth;
                else
                    this._pRttBufferManager.viewWidth = this._width;

                if (this._height == 0)
                    this.height = window.innerHeight;
                else
                    this._pRttBufferManager.viewHeight = this._height;
            }
            Object.defineProperty(DefaultRenderer.prototype, "antiAlias", {
                get: function () {
                    return this._antiAlias;
                },
                set: function (value) {
                    if (this._antiAlias == value)
                        return;

                    this._antiAlias = value;

                    this._pBackBufferInvalid = true;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DefaultRenderer.prototype, "depthPrepass", {
                /**
                *
                */
                get: function () {
                    return this._depthPrepass;
                },
                set: function (value) {
                    this._depthPrepass = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DefaultRenderer.prototype, "filters3d", {
                /**
                *
                * @returns {*}
                */
                get: function () {
                    return this._pFilter3DRenderer ? this._pFilter3DRenderer.filters : null;
                },
                set: function (value) {
                    if (value && value.length == 0)
                        value = null;

                    if (this._pFilter3DRenderer && !value) {
                        this._pFilter3DRenderer.dispose();
                        this._pFilter3DRenderer = null;
                    } else if (!this._pFilter3DRenderer && value) {
                        this._pFilter3DRenderer = new render.Filter3DRenderer(this._pStage);
                        this._pFilter3DRenderer.filters = value;
                    }

                    if (this._pFilter3DRenderer) {
                        this._pFilter3DRenderer.filters = value;
                        this._pRequireDepthRender = this._pFilter3DRenderer.requireDepthRender;
                    } else {
                        this._pRequireDepthRender = false;

                        if (this._pDepthRender) {
                            this._pDepthRender.dispose();
                            this._pDepthRender = null;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });

            DefaultRenderer.prototype.render = function (entityCollector) {
                _super.prototype.render.call(this, entityCollector);

                if (!this._pStage.recoverFromDisposal()) {
                    this._pBackBufferInvalid = true;
                    return;
                }

                if (this._pBackBufferInvalid)
                    this.pUpdateBackBuffer();

                if (this._shareContext && this._pContext)
                    this._pContext.clear(0, 0, 0, 1, 1, 0, ContextGLClearMask.DEPTH);

                if (this._pFilter3DRenderer) {
                    this.textureRatioX = this._pRttBufferManager.textureRatioX;
                    this.textureRatioY = this._pRttBufferManager.textureRatioY;
                } else {
                    this.textureRatioX = 1;
                    this.textureRatioY = 1;
                }

                if (this._pRequireDepthRender)
                    this.pRenderSceneDepthToTexture(entityCollector);

                if (this._depthPrepass)
                    this.pRenderDepthPrepass(entityCollector);

                if (this._pFilter3DRenderer && this._pContext) {
                    //this._iRender(entityCollector, this._pFilter3DRenderer.getMainInputTexture(this._pStage), this._pRttBufferManager.renderToTextureRect);
                    //this._pFilter3DRenderer.render(this._pStage, entityCollector.camera, this._pDepthRender);
                } else {
                    if (this._shareContext)
                        this._iRender(entityCollector, null, this._pScissorRect);
                    else
                        this._iRender(entityCollector);
                }

                _super.prototype.render.call(this, entityCollector);

                if (!this._shareContext && this._pContext)
                    this._pContext.present();

                // register that a view has been rendered
                this._pStage.bufferClear = false;
            };

            DefaultRenderer.prototype.pExecuteRender = function (entityCollector, target, scissorRect, surfaceSelector) {
                if (typeof target === "undefined") { target = null; }
                if (typeof scissorRect === "undefined") { scissorRect = null; }
                if (typeof surfaceSelector === "undefined") { surfaceSelector = 0; }
                this.updateLights(entityCollector);

                // otherwise RTT will interfere with other RTTs
                if (target) {
                    this.pCollectRenderables(entityCollector);

                    this.drawRenderables(this._pOpaqueRenderableHead, entityCollector, DefaultRenderer.RTT_PASSES);
                    this.drawRenderables(this._pBlendedRenderableHead, entityCollector, DefaultRenderer.RTT_PASSES);
                }

                _super.prototype.pExecuteRender.call(this, entityCollector, target, scissorRect, surfaceSelector);
            };

            DefaultRenderer.prototype.updateLights = function (entityCollector) {
                var dirLights = entityCollector.directionalLights;
                var pointLights = entityCollector.pointLights;
                var len, i;
                var light;
                var shadowMapper;

                len = dirLights.length;
                for (i = 0; i < len; ++i) {
                    light = dirLights[i];

                    shadowMapper = light.shadowMapper;

                    if (light.castsShadows && (shadowMapper.autoUpdateShadows || shadowMapper._iShadowsInvalid))
                        shadowMapper.iRenderDepthMap(this._pStage, entityCollector, this._pDepthRenderer);
                }

                len = pointLights.length;
                for (i = 0; i < len; ++i) {
                    light = pointLights[i];

                    shadowMapper = light.shadowMapper;

                    if (light.castsShadows && (shadowMapper.autoUpdateShadows || shadowMapper._iShadowsInvalid))
                        shadowMapper.iRenderDepthMap(this._pStage, entityCollector, this._pDistanceRenderer);
                }
            };

            /**
            * @inheritDoc
            */
            DefaultRenderer.prototype.pDraw = function (entityCollector, target) {
                if (!target)
                    this.pCollectRenderables(entityCollector);

                this._pContext.setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);

                if (entityCollector.skyBox) {
                    if (this._activeMaterial)
                        this._activeMaterial.iDeactivate(this._pStage);

                    this._activeMaterial = null;

                    this._pContext.setDepthTest(false, ContextGLCompareMode.ALWAYS);

                    this.drawSkybox(entityCollector);
                }

                this._pContext.setDepthTest(true, ContextGLCompareMode.LESS_EQUAL);

                var which = target ? DefaultRenderer.SCREEN_PASSES : DefaultRenderer.ALL_PASSES;

                this.drawRenderables(this._pOpaqueRenderableHead, entityCollector, which);
                this.drawRenderables(this._pBlendedRenderableHead, entityCollector, which);

                this._pContext.setDepthTest(false, ContextGLCompareMode.LESS_EQUAL);

                if (this._activeMaterial)
                    this._activeMaterial.iDeactivate(this._pStage);

                this._activeMaterial = null;
            };

            /**
            * Draw the skybox if present.
            *
            * @param entityCollector The EntityCollector containing all potentially visible information.
            */
            DefaultRenderer.prototype.drawSkybox = function (entityCollector) {
                var skyBox = this._skyboxRenderablePool.getItem(entityCollector.skyBox);

                var material = entityCollector.skyBox.material;

                var camera = entityCollector.camera;

                this.updateSkyboxProjection(camera);

                material.iActivatePass(0, this._pStage, camera);
                material.iRenderPass(0, skyBox, this._pStage, entityCollector, this._skyboxProjection);
                material.iDeactivatePass(0, this._pStage);
            };

            DefaultRenderer.prototype.updateSkyboxProjection = function (camera) {
                var near = new Vector3D();

                this._skyboxProjection.copyFrom(this._pRttViewProjectionMatrix);
                this._skyboxProjection.copyRowTo(2, near);

                var camPos = camera.scenePosition;

                var cx = near.x;
                var cy = near.y;
                var cz = near.z;
                var cw = -(near.x * camPos.x + near.y * camPos.y + near.z * camPos.z + Math.sqrt(cx * cx + cy * cy + cz * cz));

                var signX = cx >= 0 ? 1 : -1;
                var signY = cy >= 0 ? 1 : -1;

                var p = new Vector3D(signX, signY, 1, 1);

                var inverse = this._skyboxProjection.clone();
                inverse.invert();

                var q = inverse.transformVector(p);

                this._skyboxProjection.copyRowTo(3, p);

                var a = (q.x * p.x + q.y * p.y + q.z * p.z + q.w * p.w) / (cx * q.x + cy * q.y + cz * q.z + cw * q.w);

                this._skyboxProjection.copyRowFrom(2, new Vector3D(cx * a, cy * a, cz * a, cw * a));
            };

            /**
            * Draw a list of renderables.
            *
            * @param renderables The renderables to draw.
            * @param entityCollector The EntityCollector containing all potentially visible information.
            */
            DefaultRenderer.prototype.drawRenderables = function (renderable, entityCollector, which) {
                var numPasses;
                var j;
                var camera = entityCollector.camera;
                var renderable2;

                while (renderable) {
                    this._activeMaterial = renderable.material;

                    numPasses = this._activeMaterial._iNumPasses;

                    j = this._activeMaterial._iBaseScreenPassIndex; //skip any depth passes

                    do {
                        renderable2 = renderable;

                        var rttMask = this._activeMaterial.iPassRendersToTexture(j) ? 1 : 2;

                        if ((rttMask & which) != 0) {
                            this._activeMaterial.iActivatePass(j, this._pStage, camera);

                            do {
                                this._activeMaterial.iRenderPass(j, renderable2, this._pStage, entityCollector, this._pRttViewProjectionMatrix);

                                renderable2 = renderable2.next;
                            } while(renderable2 && renderable2.material == this._activeMaterial);

                            this._activeMaterial.iDeactivatePass(j, this._pStage);
                        } else {
                            do {
                                renderable2 = renderable2.next;
                            } while(renderable2 && renderable2.material == this._activeMaterial);
                        }
                    } while(++j < numPasses);

                    renderable = renderable2;
                }
            };

            DefaultRenderer.prototype.dispose = function () {
                if (!this._shareContext)
                    this._pStage.dispose();

                this._pDepthRenderer.dispose();
                this._pDistanceRenderer.dispose();
                this._pDepthRenderer = null;
                this._pDistanceRenderer = null;

                this._pDepthRender = null;

                _super.prototype.dispose.call(this);
            };

            /**
            *
            */
            DefaultRenderer.prototype.pRenderDepthPrepass = function (entityCollector) {
                this._pDepthRenderer.disableColor = true;

                if (this._pFilter3DRenderer) {
                    //				this._pDepthRenderer.textureRatioX = this._pRttBufferManager.textureRatioX;
                    //				this._pDepthRenderer.textureRatioY = this._pRttBufferManager.textureRatioY;
                    //				this._pDepthRenderer._iRender(entityCollector, this._pFilter3DRenderer.getMainInputTexture(this._pStage), this._pRttBufferManager.renderToTextureRect);
                } else {
                    this._pDepthRenderer.textureRatioX = 1;
                    this._pDepthRenderer.textureRatioY = 1;
                    this._pDepthRenderer._iRender(entityCollector);
                }

                this._pDepthRenderer.disableColor = false;
            };

            /**
            *
            */
            DefaultRenderer.prototype.pRenderSceneDepthToTexture = function (entityCollector) {
                if (this._pDepthTextureInvalid || !this._pDepthRender)
                    this.initDepthTexture(this._pStage.context);

                this._pDepthRenderer.textureRatioX = this._pRttBufferManager.textureRatioX;
                this._pDepthRenderer.textureRatioY = this._pRttBufferManager.textureRatioY;
                this._pDepthRenderer._iRender(entityCollector, this._pDepthRender);
            };

            /**
            * Updates the backbuffer dimensions.
            */
            DefaultRenderer.prototype.pUpdateBackBuffer = function () {
                // No reason trying to configure back buffer if there is no context available.
                // Doing this anyway (and relying on _stage to cache width/height for
                // context does get available) means usesSoftwareRendering won't be reliable.
                if (this._pStage.context && !this._shareContext) {
                    if (this._width && this._height) {
                        this._pStage.configureBackBuffer(this._width, this._height, this._antiAlias, true);
                        this._pBackBufferInvalid = false;
                    }
                }
            };

            DefaultRenderer.prototype.iSetStage = function (value) {
                _super.prototype.iSetStage.call(this, value);

                this._pDistanceRenderer.iSetStage(value);
                this._pDepthRenderer.iSetStage(value);
            };

            /**
            *
            */
            DefaultRenderer.prototype.initDepthTexture = function (context) {
                this._pDepthTextureInvalid = false;

                if (this._pDepthRender)
                    this._pDepthRender.dispose();

                this._pDepthRender = new RenderTexture(this._pRttBufferManager.textureWidth, this._pRttBufferManager.textureHeight);
            };
            DefaultRenderer.RTT_PASSES = 1;
            DefaultRenderer.SCREEN_PASSES = 2;
            DefaultRenderer.ALL_PASSES = 3;
            return DefaultRenderer;
        })(render.RendererBase);
        render.DefaultRenderer = DefaultRenderer;
    })(away.render || (away.render = {}));
    var render = away.render;
})(away || (away = {}));
//# sourceMappingURL=DefaultRenderer.js.map
