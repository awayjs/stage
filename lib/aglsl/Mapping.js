"use strict";
var OpLUT_1 = require("../aglsl/OpLUT");
var Mapping = (function () {
    //TODO: get rid of hack that fixes including definition file
    function Mapping(include) {
    }
    Mapping.agal2glsllut = [
        //         s 												flags   dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.OpLUT("%dest = %cast(%a);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(%a + %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(%a - %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(%a * %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(%a / %b);\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(1.0) / %a;\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(min(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(max(%a,%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(fract(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(sqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(inversesqrt(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(pow(abs(%a),%b));\n", 0, true, true, true, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(log2(abs(%a)));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(exp2(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        //         s 												flags  	dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.OpLUT("%dest = %cast(normalize(vec3( %a ) ));\n", 0, true, true, false, null, null, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(sin(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(cos(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(cross(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", 0, true, true, true, null, null, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(abs(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(%a * -1.0);\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(clamp(%a,0.0,1.0));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dot(vec3(%a),vec3(%b)));\n", null, true, true, true, 3, 3, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 4, true, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dot(vec4(%a),vec4(%b)));\n", null, true, true, true, 4, 3, true, null, null, null),
        //s:string, flags:number, dest:boolean, a:boolean, b:boolean, matrixwidth:number, matrixheight:number, ndwm:boolean, scaler:boolean, dm:boolean, lod:boolean
        new OpLUT_1.OpLUT("%dest = %cast(dFdx(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("%dest = %cast(dFdy(%a));\n", 0, true, true, false, null, null, null, null, null, null),
        new OpLUT_1.OpLUT("if (float(%a)==float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.OpLUT("if (float(%a)!=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.OpLUT("if (float(%a)>=float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.OpLUT("if (float(%a)<float(%b)) {;\n", 0, false, true, true, null, null, null, true, null, null), new OpLUT_1.OpLUT("} else {;\n", 0, false, false, false, null, null, null, null, null, null), new OpLUT_1.OpLUT("};\n", 0, false, false, false, null, null, null, null, null, null), new OpLUT_1.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.OpLUT(null, null, null, null, false, null, null, null, null, null, null), new OpLUT_1.OpLUT(null, null, null, null, false, null, null, null, null, null, null),
        //         s 															flags  	dest    a     b 	    mw 	  mh    ndwm  scale dm	  lod
        new OpLUT_1.OpLUT("%dest = %cast(texture%texdimLod(%b,%texsize(%a)).%dm);\n", null, true, true, true, null, null, null, null, true, null), new OpLUT_1.OpLUT("if ( float(%a)<0.0 ) discard;\n", null, false, true, false, null, null, null, true, null, null), new OpLUT_1.OpLUT("%dest = %cast(texture%texdim(%b,%texsize(%a)%lod).%dm);\n", null, true, true, true, null, null, true, null, true, true), new OpLUT_1.OpLUT("%dest = %cast(greaterThanEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.OpLUT("%dest = %cast(lessThan(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.OpLUT("%dest = %cast(sign(%a));\n", 0, true, true, false, null, null, null, null, null, null), new OpLUT_1.OpLUT("%dest = %cast(equal(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null), new OpLUT_1.OpLUT("%dest = %cast(notEqual(%a,%b).%dm);\n", 0, true, true, true, null, null, true, null, true, null)
    ];
    return Mapping;
}());
exports.Mapping = Mapping;
