/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

"use strict";

function AssembleAGAL ( source, ext_part, ext_version ) {
    if ( !ext_version ) ext_version = 1;
    
    var opcodemap = {
        mov:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x00,  flags:{simple:true} },
        add:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x01,  flags:{simple:true} },
        sub:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x02,  flags:{simple:true} },
        mul:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x03,  flags:{simple:true} },
        div:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x04,  flags:{simple:true} },
        rcp:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x05,  flags:{simple:true} },
        min:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x06,  flags:{simple:true} },
        max:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x07,  flags:{simple:true} },
        frc:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x08,  flags:{simple:true} },        
        sqt:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x09,  flags:{simple:true} },
        rsq:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x0a,  flags:{simple:true} },
        pow:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x0b,  flags:{simple:true} },
        log:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x0c,  flags:{simple:true} },
        exp:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x0d,  flags:{simple:true} },        
        nrm:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x0e,  flags:{simple:true} },
        sin:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x0f,  flags:{simple:true} },
        cos:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x10,  flags:{simple:true} },
        crs:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x11,  flags:{simple:true, horizontal:true} },                
        dp3:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x12,  flags:{simple:true, horizontal:true} },
        dp4:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x13,  flags:{simple:true, horizontal:true} },
        abs:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x14,  flags:{simple:true} },                
        neg:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x15,  flags:{simple:true} },                
        sat:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"none", size:0 },      opcode:0x16,  flags:{simple:true} },                
        
        ted:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"sampler", size:1 },   opcode:0x26,  flags:{simple:true, fragonly:true} },                        
        kil:{ dest:"none",      a:{format:"scalar", size:1 },    b:{format:"none", size:0 },      opcode:0x27,  flags:{simple:true, fragonly:true} },                        
        tex:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"sampler", size:1 },   opcode:0x28,  flags:{simple:true, fragonly:true} },                                
        
        m33:{ dest:"vector",    a:{format:"matrix", size:3 },    b:{format:"vector", size:3 },    opcode:0x17,  flags:{simple:true, matrix:true} },
        m44:{ dest:"vector",    a:{format:"matrix", size:4 },    b:{format:"vector", size:4 },    opcode:0x18,  flags:{simple:true, matrix:true} },
        m43:{ dest:"vector",    a:{format:"matrix", size:3 },    b:{format:"vector", size:4 },    opcode:0x19,  flags:{simple:true, matrix:true} },    
        
        sge:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x29,  flags:{simple:true} },        
        slt:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x2a,  flags:{simple:true} },        
        sgn:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x2b,  flags:{simple:true} },        
        seq:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x2c,  flags:{simple:true} },        
        sne:{ dest:"vector",    a:{format:"vector", size:4 },    b:{format:"vector", size:4 },    opcode:0x2d,  flags:{simple:true} }       
        
        
        // fill in 
    };
    
    var regmap = {        
        va:{ code:0x00, desc:"vertex attribute" },                
        fc:{ code:0x01, desc:"fragment constant" },
        vc:{ code:0x01, desc:"vertex constant" },        
        ft:{ code:0x02, desc:"fragment temporary" },
        vt:{ code:0x02, desc:"vertex temporary" },
        vo:{ code:0x03, desc:"vertex output" },
        op:{ code:0x03, desc:"vertex output" },
        fd:{ code:0x03, desc:"fragment depth output" },
        fo:{ code:0x03, desc:"fragment output" },
        oc:{ code:0x03, desc:"fragment output" },
        v: { code:0x04, desc:"varying" },
        vi:{ code:0x04, desc:"varying output" },
        fi:{ code:0x04, desc:"varying input" },
        fs:{ code:0x05, desc:"sampler" }        
    }; 
    
    var samplermap = {
        // type
        "rgba":{ shift:8, mask:0xf, value:0 }, 
        "rg":{ shift:8, mask:0xf, value:5 }, 
        "r":{ shift:8, mask:0xf, value:4 },         
        "compressed":{ shift:8, mask:0xf, value:1 }, 
        "compressed_alpha":{ shift:8, mask:0xf, value:2 }, 
        "dxt1":{ shift:8, mask:0xf, value:1 }, 
        "dxt5":{ shift:8, mask:0xf, value:2 },         
        
        // dimension
        "2d":{ shift:12, mask:0xf, value:0 }, 
        "cube":{ shift:12, mask:0xf, value:1 }, 
        "3d":{ shift:12, mask:0xf, value:2 }, 
        
        // special
        "centroid":{ shift:16, mask:1, value:1 }, 
        "ignoresampler":{ shift:16, mask:4, value:4 }, 

        // repeat
        "clamp":{ shift:20, mask:0xf, value:0 }, 
        "repeat":{ shift:20, mask:0xf, value:1 }, 
        "wrap":{ shift:20, mask:0xf, value:1 }, 
        
        // mip
        "nomip":{ shift:24, mask:0xf, value:0 }, 
        "mipnone":{ shift:24, mask:0xf, value:0 }, 
        "mipnearest":{ shift:24, mask:0xf, value:1 },         
        "miplinear":{ shift:24, mask:0xf, value:2 }, 
        
        // filter
        "nearest":{ shift:28, mask:0xf, value:0 }, 
        "linear":{ shift:28, mask:0xf, value:1 }        
    };
    
    var r = {};         
    var cur = null; 
    
    function EmitHeader ( pr ) {                            
        pr.data.writeUnsignedByte ( 0xa0 ); 	// tag version
        pr.data.writeUnsignedInt ( pr.version ); 
        if ( pr.version >= 0x10 ) pr.data.writeUnsignedByte ( 0 ); // align, for higher versions
        pr.data.writeUnsignedByte ( 0xa1 );		// tag program id
        switch ( pr.name ) {
            case "fragment" : pr.data.writeUnsignedByte ( 1 ); break;
            case "vertex" : pr.data.writeUnsignedByte ( 0 ); break;
            case "cpu" : pr.data.writeUnsignedByte ( 2 ); break;
            default : pr.data.writeUnsignedByte ( 0xff ); break; // unknown/comment
        }                        
    }    
    
    function EmitOpcode ( pr, opcode ) {
        pr.data.writeUnsignedInt( opcode );
        //console.log ( "Emit opcode: ", opcode ); 
    }            
    
    function EmitZeroDword ( pr ) {
        pr.data.writeUnsignedInt( 0 );
    }

    function EmitZeroQword ( pr ) {
        pr.data.writeUnsignedInt( 0 );
        pr.data.writeUnsignedInt( 0 );
    }        
    
    function EmitDest ( pr, token, opdest ) {
        function StringToMask ( s ) {
            if ( !s ) return 0xf; 
            var r = 0;
            if ( s.indexOf ( "x" ) != -1 ) r|=1;
            if ( s.indexOf ( "y" ) != -1 ) r|=2;
            if ( s.indexOf ( "z" ) != -1 ) r|=4;
            if ( s.indexOf ( "w" ) != -1 ) r|=8;
            return r;
        }            
        var reg = token.match ( /([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i ); // g1: regname, g2:regnum, g3:mask
        if ( !regmap[reg[1]] ) return false;     
        var em = { num:reg[2]?reg[2]:0, code:regmap[reg[1]].code, mask:StringToMask(reg[3]) };
        pr.data.writeUnsignedShort ( em.num );                              
        pr.data.writeUnsignedByte ( em.mask );
        pr.data.writeUnsignedByte ( em.code );  
        //console.log ( "  Emit dest: ", em ); 
        return true; 
    }
    
    function StringToSwizzle ( s ) {
        if ( !s ) return 0xe4; 
        var chartoindex = { x:0, y:1, z:2, w:3 };
        var sw = 0;
        if ( s.charAt(0) != "." ) throw "Missing . for swizzle";
        if ( s.length > 1) sw |= chartoindex[s.charAt(1)];             
        if ( s.length > 2 ) sw |= chartoindex[s.charAt(2)]<<2; 
        else sw |= (sw&3)<<2;
        if ( s.length > 3) sw |= chartoindex[s.charAt(3)]<<4; 
        else sw |= (sw&(3<<2))<<2;
        if ( s.length > 4) sw |= chartoindex[s.charAt(4)]<<6; 
        else sw |= (sw&(3<<4))<<2;
        return sw; 
    }    
    
    function EmitSampler ( pr, token, opsrc, opts ) {                            
        var reg = token.match ( /fs(\d*)/i ); // g1:regnum
        if ( !reg || !reg[1] ) return false; 
        pr.data.writeUnsignedShort ( reg[1] ); 
        pr.data.writeUnsignedByte ( 0 );   // bias
        pr.data.writeUnsignedByte ( 0 );         
        /*
        pr.data.writeUnsignedByte ( 0x5 ); 
        pr.data.writeUnsignedByte ( 0 );   // readmode, dim
        pr.data.writeUnsignedByte ( 0 );   // special, wrap        
        pr.data.writeUnsignedByte ( 0 );   // mip, filter                            
        */
        var samplerbits = 0x5; 
        var sampleroptset = 0; 
        for ( var i=0; i<opts.length; i++ ) {
            var o = samplermap[opts[i].toLowerCase()]; 
            if ( o ) {
                if ( ((sampleroptset>>o.shift)&o.mask)!=0 ) console.log ("Warning, duplicate sampler option");
                sampleroptset |= o.mask<<o.shift;
                samplerbits &= ~(o.mask<<o.shift);
                samplerbits |= o.value<<o.shift;
            } else {
                console.log ("Warning, unknown sampler option: ", opts[i] );
                // todo bias
            }
        }
        pr.data.writeUnsignedInt ( samplerbits );             
        return true;
    }
    
    function EmitSource ( pr, token, opsrc ) {
        var indexed = token.match ( /vc\[(v[tcai])(\d+)\.([xyzw])([\+\-]\d+)?\](\.[xyzw]{1,4})?/i ); // g1: indexregname, g2:indexregnum, g3:select, [g4:offset], [g5:swizzle] 
        var reg;
        if ( indexed ) {
            if ( !regmap[indexed[1]] ) return false;          
            var selindex = { x:0, y:1, z:2, w:3 };
            var em = { num:indexed[2]|0, code:regmap[indexed[1]].code, swizzle:StringToSwizzle(indexed[5]), select:selindex[indexed[3]], offset:indexed[4]|0 };                        
            pr.data.writeUnsignedShort ( em.num );      
            pr.data.writeByte ( em.offset );                     
            pr.data.writeUnsignedByte ( em.swizzle ); 
            pr.data.writeUnsignedByte ( 0x1 ); // constant reg
            pr.data.writeUnsignedByte ( em.code ); 
            pr.data.writeUnsignedByte ( em.select ); 
            pr.data.writeUnsignedByte ( 1<<7 );                         				                                
        } else {
            reg = token.match ( /([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i ); // g1: regname, g2:regnum, g3:swizzle
            if ( !regmap[reg[1]] ) return false;          
            var em = { num:reg[2]|0, code:regmap[reg[1]].code, swizzle:StringToSwizzle(reg[3]) };            
            pr.data.writeUnsignedShort ( em.num );      
            pr.data.writeUnsignedByte ( 0 ); 
            pr.data.writeUnsignedByte ( em.swizzle ); 
            pr.data.writeUnsignedByte ( em.code ); 
            pr.data.writeUnsignedByte ( 0 ); 
            pr.data.writeUnsignedByte ( 0 ); 
            pr.data.writeUnsignedByte ( 0 );                             
            //console.log ( "  Emit source: ", em, pr.data.length );             
        }                    
        return true; 
    }        

    function AddHeader ( partname, version ) {
        if ( !version ) version = 1;
        if ( r[partname] == undefined ) {
            r[partname] = { name:partname, version:version, data:new ByteArray };
            EmitHeader ( r[partname] ); 
        } else if ( r[partname].version != version ) throw "Multiple versions for part "+partname;
        cur = r[partname]; 
    }
    
    if ( ext_part ) 
        AddHeader ( ext_part, ext_version ); 
    var lines = source.replace( /[\f\n\r\v]+/g, "\n" ).split( "\n" ); // handle breaks, then split into lines        
    lines.forEach ( function(line,linenr) {            
        var startcomment = line.search( "//" );  // remove comments
        if ( startcomment != -1 )
            line = line.slice( 0, startcomment );           
        line = line.replace( /^\s+|\s+$/g, "" ); // remove outer space
        if ( !(line.length > 0 ) ) return;             
        var optsi = line.search( /<.*>/g ); // split of options part <*> if there
        var opts = null;
        if ( optsi != -1 ) {
            opts = line.slice( optsi ).match( /([\w\.\-\+]+)/gi );
            line = line.slice( 0, optsi );
        }
        // get opcode/command				            
        var tokens = line.match( /([\w\.\+\[\]]+)/gi ); // get tokens in line
        if ( !tokens || tokens.length<1 ) {
            if ( line.length >= 3 ) console.log ( "Warning: bad line "+linenr+": "+line );
            return;
        }
        //console.log ( linenr, line, cur, tokens ); 
        switch ( tokens[0] ) {
            case "part":
                AddHeader ( tokens[1], Number(tokens[2]) ); 
                break;                
            case "endpart":
                if ( !cur ) throw "Unexpected endpart";  
                cur.data.position = 0;
                cur = null; 
                return; 
            default: 
                if ( !cur ) {
                    console.log ( "Warning: bad line "+linenr+": "+line+" (Outside of any part definition)" );
                    return; 
                }
                if ( cur.name=="comment" ) return; 
                var op = opcodemap[tokens[0]];
                if ( !op ) 
                    throw "Bad opcode "+tokens[0]+" "+linenr+": "+line;                                
                
                EmitOpcode ( cur, op.opcode ); 
                var ti=1; 
                if ( op.dest && op.dest!="none" ) {
                    if ( !EmitDest ( cur, tokens[ti++], op.dest ) ) throw "Bad destination register "+tokens[ti-1]+" "+linenr+": "+line; 
                } else EmitZeroDword ( cur ); 
                if ( op.a && op.a.format!="none" ) {
                    if ( !EmitSource ( cur, tokens[ti++], op.a ) ) throw "Bad source register "+tokens[ti-1]+" "+linenr+": "+line; 
                } else EmitZeroQword ( cur ); 
                if ( op.b && op.b.format!="none" ) {
                    if ( op.b.format == "sampler" ) {
                        if ( !EmitSampler ( cur, tokens[ti++], op.b, opts ) ) throw "Bad sampler register "+tokens[ti-1]+" "+linenr+": "+line; 
                    } else {
                        if ( !EmitSource ( cur, tokens[ti++], op.b ) ) throw "Bad source register "+tokens[ti-1]+" "+linenr+": "+line; 
                    }
                } else EmitZeroQword ( cur ); 
                
                                                                            
                break; 
        }                			                                             
    } );
    //console.log ( r );
    return r;            
}    

console.log ( "Executed AGALMiniAssembler." );