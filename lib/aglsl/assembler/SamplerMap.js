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
                SamplerMap._map['rgba'] = new Sampler_1.Sampler(8, 0xf, 0);
                SamplerMap._map['rg'] = new Sampler_1.Sampler(8, 0xf, 5);
                SamplerMap._map['r'] = new Sampler_1.Sampler(8, 0xf, 4);
                SamplerMap._map['compressed'] = new Sampler_1.Sampler(8, 0xf, 1);
                SamplerMap._map['compressed_alpha'] = new Sampler_1.Sampler(8, 0xf, 2);
                SamplerMap._map['dxt1'] = new Sampler_1.Sampler(8, 0xf, 1);
                SamplerMap._map['dxt5'] = new Sampler_1.Sampler(8, 0xf, 2);
                // dimension
                SamplerMap._map['2d'] = new Sampler_1.Sampler(12, 0xf, 0);
                SamplerMap._map['cube'] = new Sampler_1.Sampler(12, 0xf, 1);
                SamplerMap._map['3d'] = new Sampler_1.Sampler(12, 0xf, 2);
                // special
                SamplerMap._map['centroid'] = new Sampler_1.Sampler(16, 1, 1);
                SamplerMap._map['ignoresampler'] = new Sampler_1.Sampler(16, 4, 4);
                // repeat
                SamplerMap._map['clamp'] = new Sampler_1.Sampler(20, 0xf, 0);
                SamplerMap._map['repeat'] = new Sampler_1.Sampler(20, 0xf, 1);
                SamplerMap._map['wrap'] = new Sampler_1.Sampler(20, 0xf, 1);
                // mip
                SamplerMap._map['nomip'] = new Sampler_1.Sampler(24, 0xf, 0);
                SamplerMap._map['mipnone'] = new Sampler_1.Sampler(24, 0xf, 0);
                SamplerMap._map['mipnearest'] = new Sampler_1.Sampler(24, 0xf, 1);
                SamplerMap._map['miplinear'] = new Sampler_1.Sampler(24, 0xf, 2);
                // filter
                SamplerMap._map['nearest'] = new Sampler_1.Sampler(28, 0xf, 0);
                SamplerMap._map['linear'] = new Sampler_1.Sampler(28, 0xf, 1);
            }
            return SamplerMap._map;
        },
        enumerable: true,
        configurable: true
    });
    return SamplerMap;
}());
exports.SamplerMap = SamplerMap;
