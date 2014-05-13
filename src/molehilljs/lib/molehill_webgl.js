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

Context3DWebGL = { }; 

// 
// ------------------------------------------------ State -----------------------------------------------------
//
Context3DWebGL.setProgram = function ( prog ) {
    this.checkIsValidObject ( prog, "Program" );    
    this.state.prog = prog;
    if (prog) {
        for (var i = 0; i < Context3D.maxtextures; i++) {
            if (prog.priv_desc.samplers[i] && (prog.priv_desc.samplers[i].special & 4) == 0) // ==ignore sampler flag is not set     
                this.state.textures[i].sampler = prog.priv_desc.samplers[i];
        }
    }
}    

Context3DWebGL.setStencilActions = function ( triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail ) {
    if ( triangleFace===Context3DTriangleFace.FRONT || triangleFace===Context3DTriangleFace.FRONT_AND_BACK ) {
        this.state.stencil.actions[0].compare = compareMode?compareMode:Context3DCompareMode.ALWAYS;
        this.state.stencil.actions[0].bothpass = actionOnBothPass?actionOnBothPass:Context3DStencilAction.KEEP;
        this.state.stencil.actions[0].depthfail = actionOnDepthFail?compareMode:Context3DStencilAction.KEEP;
        this.state.stencil.actions[0].depthpass = actionOnDepthPassStencilFail?actionOnDepthPassStencilFail:Context3DStencilAction.KEEP;        
    }
    if ( triangleFace===Context3DTriangleFace.BACK || triangleFace===Context3DTriangleFace.FRONT_AND_BACK ) {
        this.state.stencil.actions[1].compare = compareMode?compareMode:Context3DCompareMode.ALWAYS;
        this.state.stencil.actions[1].bothpass = actionOnBothPass?actionOnBothPass:Context3DStencilAction.KEEP;
        this.state.stencil.actions[1].depthfail = actionOnDepthFail?compareMode:Context3DStencilAction.KEEP;
        this.state.stencil.actions[1].depthpass = actionOnDepthPassStencilFail?actionOnDepthPassStencilFail:Context3DStencilAction.KEEP;                
    }            
}   
    
Context3DWebGL.setStencilReferenceValue = function ( referenceValue, readMask, writeMask ) {
    this.state.stencil.readMask = readMask===undefined?0xff:readMask;
    this.state.stencil.writeMask = readMask===undefined?0xff:writeMask;
    this.state.stencil.referenceValue = referenceValue|0;    
}

Context3DWebGL.setScissorRectangle = function ( rect ) { // rect is [x,y,w,h] array or null to disable 
    // todo, check that rect is valid    
    this.state.scissor = rect||null; 
}

Context3DWebGL.setRenderToTexture = function ( target, depthtarget, aa ) {        
    this.checkIsValidObject ( target, "Texture" );                
    this.state.rtt.target = target; 
    if ( depthtarget ) {
        this.state.rtt.depth = true; 
        if ( depthtarget===true || depthtarget==="auto" ) {
            this.state.rtt.depthTarget = null; 
        } else {
            depthtarget = depthtarget || null; 
            this.checkIsValidObject ( depthtarget, "Texture" ); // todo: check that it's a texture
            this.state.rtt.depthTarget = depthtarget; 
        }
    } else {
        this.state.rtt.depth = false; 
        this.state.rtt.depthTarget = null;             
    }
    this.state.rtt.aa = aa || 0; 
}

Context3DWebGL.setDepthTest = function ( depthWrite, comparisonFunc ) {
    this.checkIsValidEnum(comparisonFunc, Context3DCompareMode);    
    this.state.depthWrite = depthWrite;
    this.state.depthFunc = comparisonFunc;
}

Context3DWebGL.setCulling = function ( cullAway ) {
    this.checkIsValidEnum(cullAway, Context3DTriangleFace);
    this.state.cullFace = cullAway; 
}    

Context3DWebGL.setBlendFactors = function ( srcFactor, destFactor ) {
    this.checkIsValidEnum(srcFactor, Context3DBlendFactor); 
    this.checkIsValidEnum(destFactor, Context3DBlendFactor); 
    this.state.blend.src = srcFactor;
    this.state.blend.dest = destFactor;
}

Context3DWebGL.setColorMask = function ( r,g,b,a ) {
    this.state.colormask.r = r;
    this.state.colormask.g = g; 
    this.state.colormask.b = b; 
    this.state.colormask.a = a; 
}

Context3DWebGL.setVertexBufferAt = function ( streamindex, buffer, offsetinbuffer, datatype ) {
    this.checkIsValidObject(buffer, "Vertex Buffer");
    this.checkIsValidEnumOrNull(datatype, Context3DVertexBufferFormat ); 
    this.state.streams[streamindex].buffer = buffer;
    this.state.streams[streamindex].offset = offsetinbuffer;
    this.state.streams[streamindex].type = datatype;
}

Context3DWebGL.setTextureAt = function ( sampler, texture ) {
    this.checkIsValidObject(texture, "Texture");
    this.state.textures[sampler].texture = texture;    
}

Context3DWebGL.setProgramConstant = function ( target, register, x, y, z, w ) {            
    if ( typeof(x)!=="number" || typeof(y)!=="number" || 
         typeof(y)!=="number" || typeof(z)!=="number" ) 
        throw "Program constant value type is not of Number type.";        
    if ( target===Context3DProgramType.VERTEX ) {           
        if ( !(register >= 0 && register<Context3D.maxvertexconstants ) )
            throw "Register for vertex constant out of range: "+register+" but max is "+Context3D.maxvertexconstants;
        register*=4; 
        this.state.vertexconstants[register+0] = x;
        this.state.vertexconstants[register+1] = y;
        this.state.vertexconstants[register+2] = z;
        this.state.vertexconstants[register+3] = w;
    } else if ( target===Context3DProgramType.FRAGMENT ) {
        if ( !(register >= 0 && register<Context3D.maxfragconstants ) )
            throw "Register for vertex constant out of range: "+register+" but max is "+Context3D.maxfragconstants;        
        register*=4; 
        this.state.fragconstants[register+0] = x;
        this.state.fragconstants[register+1] = y;
        this.state.fragconstants[register+2] = z;
        this.state.fragconstants[register+3] = w;            
    } else throw "Bad target ("+target+") for constant setting."; 
}


// 
// ------------------------------------------------ Program & AGAL -----------------------------------------------------
//
Context3DWebGL.Program = { }

Context3DWebGL.Program.priv_init = function (parent) {
    this.priv_restype = "Program";
    this.priv_glid_prog = null;
    this.priv_glid_vshader = null;
    this.priv_glid_pshader = null;    
    this.priv_desc = {
        vertexconstarr:null,
        vertexconstused:[],   
        fragconstused:[],
        streamused:[],
        samplers:[],
        yflip:null
    };            
    var gl = parent.gl;
    if (!gl)
        throw "Invalid or disposed Context3D parent object";
    this.priv_glid_prog = gl.createProgram();
    parent.priv_addResource(this);                                 
}

Context3DWebGL.Program.priv_freeshaders = function() {
    var gl = this.priv_parent.gl;
    if ( this.priv_glid_vshader ) {
        if ( this.priv_glid_prog )
            gl.detachShader( this.priv_glid_prog, this.priv_glid_vshader );
        gl.deleteShader ( this.priv_glid_vshader );
        this.priv_glid_vshader = null;
    }                
    if ( this.priv_glid_pshader ) {
        if ( this.priv_glid_prog )
            gl.detachShader( this.priv_glid_prog, this.priv_glid_pshader );
        gl.deleteShader ( this.priv_glid_pshader );
        this.priv_glid_pshader = null;
    }                   
}

Context3DWebGL.Program.uploadFromAGALString = function(vssource,fssource) {        
    var vs = AssembleAGAL ( vssource, "vertex", 1 );
    var fs = AssembleAGAL ( fssource, "fragment", 1 );
    return this.uploadFromAGALByteArray(vs.vertex.data,fs.fragment.data); 
}

Context3DWebGL.Program.agal2glsllut = [
    { s:"%dest = %cast(%a);\n", flags:0, dest:true, a:true, b:false }, // mov
    { s:"%dest = %cast(%a + %b);\n", flags:0, dest:true, a:true, b:true }, // add
    { s:"%dest = %cast(%a - %b);\n", flags:0, dest:true, a:true, b:true }, // sub
    { s:"%dest = %cast(%a * %b);\n", flags:0, dest:true, a:true, b:true }, // mul
    { s:"%dest = %cast(%a / %b);\n", flags:0, dest:true, a:true, b:true }, // div
    { s:"%dest = %cast(1.0) / %a;\n", flags:0, dest:true, a:true, b:false }, // rcp
    { s:"%dest = %cast(min(%a,%b));\n", flags:0, dest:true, a:true, b:true }, // min
    { s:"%dest = %cast(max(%a,%b));\n", flags:0, dest:true, a:true, b:true }, // max
    { s:"%dest = %cast(fract(%a));\n", flags:0, dest:true, a:true, b:false }, // frc
    { s:"%dest = %cast(sqrt(abs(%a)));\n", flags:0, dest:true, a:true, b:false }, // sqt
    { s:"%dest = %cast(inversesqrt(abs(%a)));\n", flags:0, dest:true, a:true, b:false }, // rsq
    { s:"%dest = %cast(pow(abs(%a),%b));\n", flags:0, dest:true, a:true, b:true }, // pow
    { s:"%dest = %cast(log2(abs(%a)));\n", flags:0, dest:true, a:true, b:false }, // log
    { s:"%dest = %cast(exp2(%a));\n", flags:0, dest:true, a:true, b:false }, // exp
    { s:"%dest = %cast(normalize(%a));\n", flags:0, dest:true, a:true, b:false, ndwm:true }, // nrm
    { s:"%dest = %cast(sin(%a));\n", flags:0, dest:true, a:true, b:false }, // sin
    { s:"%dest = %cast(cos(%a));\n", flags:0, dest:true, a:true, b:false }, // cos
    { s:"%dest = %cast(cross(vec3(%a),vec3(%b)));\n", flags:0, dest:true, a:true, b:true, ndwm:true }, // crs            
    { s:"%dest = %cast(dot(vec3(%a),vec3(%b)));\n", flags:0, dest:true, a:true, b:true, ndwm:true }, // dp3
    { s:"%dest = %cast(dot(vec4(%a),vec4(%b)));\n", flags:0, dest:true, a:true, b:true, ndwm:true }, // dp4
    { s:"%dest = %cast(abs(%a));\n", flags:0, dest:true, a:true, b:false }, // abs
    { s:"%dest = %cast(%a * -1.0);\n", flags:0, dest:true, a:true, b:false }, // neg
    { s:"%dest = %cast(clamp(%a,0.0,1.0));\n", flags:0, dest:true, a:true, b:false }, // sat
    { s:"%dest = %cast(dot(vec3(%a),vec3(%b)));\n", matrixwidth:3, matrixheight:3, dest:true, a:true, b:true, ndwm:true }, // m33 (uses dp3)
    { s:"%dest = %cast(dot(vec4(%a),vec4(%b)));\n", matrixwidth:4, matrixheight:4, dest:true, a:true, b:true, ndwm:true }, // m44 (uses dp4)
    { s:"%dest = %cast(dot(vec4(%a),vec4(%b)));\n", matrixwidth:4, matrixheight:3, dest:true, a:true, b:true, ndwm:true }, // m43 (uses dp4)
    { s:"%dest = %cast(dFdx(%a));\n", flags:0, dest:true, a:true, b:false }, // dFdx
    { s:"%dest = %cast(dFdy(%a));\n", flags:0, dest:true, a:true, b:false }, // dFdx            
    { s:"if (float(%a)==float(%b)) {;\n", flags:0, dest:false, a:true, b:true, scalar:true }, 
    { s:"if (float(%a)!=float(%b)) {;\n", flags:0, dest:false, a:true, b:true, scalar:true }, 
    { s:"if (float(%a)>=float(%b)) {;\n", flags:0, dest:false, a:true, b:true, scalar:true }, 
    { s:"if (float(%a)<float(%b)) {;\n", flags:0, dest:false, a:true, b:true, scalar:true }, 
    { s:"} else {;\n", flags:0, dest:false, a:false, b:false }, 
    { s:"};\n", flags:0, dest:false, a:false, b:false }, 
    { },
    { },
    { },
    { },
    { s:"%dest = %cast(texture%texdimLod(%b,%texsize(%a)).%dm);\n", dest:true, a:true, b:true, dm:true }, 
    { s:"if ( float(%a)<0.0 ) discard;\n", dest:false, a:true, b:false, scalar:true }, 
    { s:"%dest = %cast(texture%texdim(%b,%texsize(%a)%lod).%dm);\n", dest:true, a:true, b:true, lod:true, dm:true, ndwm:true },                  
    { s:"%dest = %cast(greaterThanEqual(%a,%b).%dm);\n", flags:0, dest:true, a:true, b:true, dm:true, ndwm:true }, 
    { s:"%dest = %cast(lessThan(%a,%b).%dm);\n", flags:0, dest:true, a:true, b:true, dm:true, ndwm:true }, 
    { s:"%dest = %cast(sign(%a));\n", flags:0, dest:true, a:true, b:false }, 
    { s:"%dest = %cast(equal(%a,%b).%dm);\n", flags:0, dest:true, a:true, b:true, dm:true, ndwm:true }, 
    { s:"%dest = %cast(notEqual(%a,%b).%dm);\n", flags:0, dest:true, a:true, b:true, dm:true, ndwm:true }
    // ....
];    

Context3DWebGL.Program.decribeAGALByteArray = function(bytes) {
    // AGAL -> object desc                
    function ReadReg ( s, mh ) {
        s.regnum = bytes.readUnsignedShort();
        s.indexoffset = bytes.readByte(); 
        s.swizzle = bytes.readUnsignedByte(); 
        s.regtype = bytes.readUnsignedByte();                         
        desc.regread[s.regtype][s.regnum] = 0xf; // sould be swizzle to mask? should be |=                                                 
        if ( s.regtype == 0x5 ) { // sampler
            s.lodbiad = s.indexoffset; 
            s.indexoffset = undefined; 
            s.swizzle = undefined;                                  
            // sampler 
            s.readmode = bytes.readUnsignedByte(); 
            s.dim = s.readmode>>4;
            s.readmode &= 0xf; 
            s.special = bytes.readUnsignedByte(); 
            s.wrap = s.special>>4;
            s.special &= 0xf;        
            s.mipmap = bytes.readUnsignedByte(); 
            s.filter = s.mipmap>>4;
            s.mipmap &= 0xf;                           
            desc.samplers[s.regnum] = s; 
        } else {
            s.indexregtype = bytes.readUnsignedByte(); 
            s.indexselect = bytes.readUnsignedByte(); 
            s.indirectflag = bytes.readUnsignedByte();                                              
        }           
        if ( s.indirectflag )
            desc.hasindirect = true; 
        if ( !s.indirectflag && mh ) 
            for ( var mhi=0; mhi<mh; mhi++ ) // wrong, should be |=
                desc.regread[s.regtype][s.regnum+mhi] = desc.regread[s.regtype][s.regnum];
    }                                 
    
    var header = {};
    if ( bytes.readUnsignedByte ( ) != 0xa0 ) throw "Bad AGAL: Missing 0xa0 magic byte.";
    header.version = bytes.readUnsignedInt(); 
    if ( header.version >= 0x10 ) {
        bytes.readUnsignedByte ( );                    
        header.version >>= 1; 
    }
    if ( bytes.readUnsignedByte ( ) != 0xa1 ) throw "Bad AGAL: Missing 0xa1 magic byte.";
    header.progid = bytes.readUnsignedByte ( );
    switch ( header.progid ) {
        case 1:  header.type = "fragment"; break;
        case 0:  header.type = "vertex"; break;
        case 2:  header.type = "cpu"; break;
        default: header.type = ""; break;
    }
    var desc = { regread:[[],[],[],[],[],[],[]], 
                regwrite:[[],[],[],[],[],[],[]], 
                hasindirect:false, 
                writedepth:false, 
                hasmatrix:false, 
                samplers:[] };
    var tokens = []; 
    while ( bytes.position < bytes.length ) {
        var token = { dest:{}, a:{}, b:{} }; 
        token.opcode = bytes.readUnsignedInt();          
        var lutentry = Context3DWebGL.Program.agal2glsllut[token.opcode];
        if ( !lutentry ) throw "Opcode not valid or not implemented yet: "+token.opcode;
        if ( lutentry.matrixheight ) 
            desc.hasmatrix = true;                            
        if ( lutentry.dest ) {
            token.dest.regnum = bytes.readUnsignedShort();
            token.dest.mask = bytes.readUnsignedByte();
            token.dest.regtype = bytes.readUnsignedByte();                        
            desc.regwrite[token.dest.regtype][token.dest.regnum] |= token.dest.mask;
        } else {
            token.dest = null; 
            bytes.readUnsignedInt(); 
        }                    
        if ( lutentry.a ) {
            ReadReg ( token.a,1 );
        } else {
            token.a = null;
            bytes.readUnsignedInt(); 
            bytes.readUnsignedInt();                         
        }
        if ( lutentry.b ) {
            ReadReg ( token.b,lutentry.matrixheight|0 );
        } else {
            token.b = null;
            bytes.readUnsignedInt(); 
            bytes.readUnsignedInt(); 
        }
        tokens.push ( token );                                  
    }               
    desc.header = header;
    desc.tokens = tokens; 
    return desc;
}

Context3DWebGL.Program.descToGLSL = function( desc ) {
    var header = "";
    var body = "";
    header += "precision highp float;\n";    
    var tag = desc.header.type[0];
    // declare uniforms
    if ( desc.header.type == "vertex" ) 
        header += "uniform float yflip;\n";                                                        
    if ( !desc.hasindirect ) {
        for ( var i=0; i<desc.regread[0x1].length; i++ ) {
            if ( desc.regread[0x1][i] ) 
                header += "uniform vec4 "+tag+"c"+i+";\n";
        }                    
    } else {
        header += "uniform vec4 "+tag+"carrr["+Context3D.maxvertexconstants+"];\n";                // use max const count instead                
    }                
    // declare temps
    for ( var i=0; i<desc.regread[0x2].length || i<desc.regwrite[0x2].length; i++ ) { 
        if ( desc.regread[0x2][i] || desc.regwrite[0x2][i] ) // duh, have to check write only also... 
            header += "vec4 "+tag+"t"+i+";\n";
    }                    
    // declare streams
    for ( var i=0; i<desc.regread[0x0].length; i++ ) {
        if ( desc.regread[0x0][i] ) 
            header += "attribute vec4 va"+i+";\n";
    }                 
    // declare interpolated
    for ( var i=0; i<desc.regread[0x4].length || i<desc.regwrite[0x4].length; i++ ) {
        if ( desc.regread[0x4][i] || desc.regwrite[0x4][i] ) 
            header += "varying vec4 vi"+i+";\n";
    }                                                 
    // declar samplers
    var samptype = ["2D", "Cube", "3D", ""]; 
    for ( var i=0; i<desc.samplers.length; i++ ) {                    
        if ( desc.samplers[i] ) 
            header += "uniform sampler"+samptype[desc.samplers[i].dim&3]+" fs"+i+";\n";                         
    }
    // extra gl fluff: setup position and depth adjust temps
    if ( desc.header.type == "vertex" ) 
        header += "vec4 outpos;\n";
    if ( desc.writedepth ) 
        header += "vec4 tmp_FragDepth;\n";
    //if ( desc.hasmatrix ) 
    //    header += "vec4 tmp_matrix;\n";
    
    // start body of code
    body += "void main() {\n";
    
    function regtostring(regtype,regnum) {
        switch ( regtype ) {
            case 0x0: return "va"+regnum; 
            case 0x1: 
                if ( desc.hasindirect && desc.header.type == "vertex" ) return "vcarrr["+regnum+"]"; 
                else return tag+"c"+regnum; 
            case 0x2: return tag+"t"+regnum; 
            case 0x3: return desc.header.type == "vertex"?"outpos":"gl_FragColor";
            case 0x4: return "vi"+regnum; 
            case 0x5: return "fs"+regnum; 
            case 0x6: return "tmp_FragDepth"; 
            default: throw "Unknown register type"; 
        }
    }                
    
    function sourcetostring(s,subline,dwm,isscalar) {           
        var swiz = [ "x","y","z","w" ]; 
        var r;
        if ( s.indirectflag ) {                                    
            r = "vcarrr[int("+regtostring(s.indexregtype, s.regnum)+"."+swiz[s.indexselect]+")";
            var realofs = subline+s.indexoffset;            
            if ( realofs<0 ) r+=realofs.toString();
            if ( realofs>0 ) r+="+"+realofs.toString();            
            r += "]";            
        } else {
            r = regtostring(s.regtype, s.regnum+subline);
        }
        // samplers never add swizzle        
        if ( s.regtype==0x5 ) 
            return r;         
        // scalar, first component only
        if ( isscalar ) 
            return r + "." + swiz[(s.swizzle>>0)&3];                             
        // identity
        if ( s.swizzle == 0xe4 && dwm == 0xf ) 
            return r; 
        // with destination write mask folded in
        r += ".";   
        if ( dwm&1 ) r += swiz[(s.swizzle>>0)&3]; 
        if ( dwm&2 ) r += swiz[(s.swizzle>>2)&3]; 
        if ( dwm&4 ) r += swiz[(s.swizzle>>4)&3]; 
        if ( dwm&8 ) r += swiz[(s.swizzle>>6)&3]; 
        return r; 
    }
    
    for ( var i=0; i<desc.tokens.length; i++ ) {        
        var lutentry = Context3DWebGL.Program.agal2glsllut[desc.tokens[i].opcode];             
        if ( !lutentry ) throw "Opcode not valid or not implemented yet: "+token.opcode;
        var sublines = lutentry.matrixheight||1;
        
        for ( var sl=0; sl<sublines; sl++ ) {          
            var line = "  "+lutentry.s;             
            if ( desc.tokens[i].dest ) {
                if ( lutentry.matrixheight ) {                  
                    if ( (desc.tokens[i].dest.mask>>sl)&1!=1 ) continue;                                 
                    var destregstring = regtostring(desc.tokens[i].dest.regtype,desc.tokens[i].dest.regnum);
                    var destcaststring = "float"; 
                    var destmaskstring = ["x","y","z","w"][sl];           
                    destregstring += "."+destmaskstring;   
                } else {                                                        
                    var destregstring = regtostring(desc.tokens[i].dest.regtype,desc.tokens[i].dest.regnum);
                    var destcaststring;                                   
                    var destmaskstring; 
                    if ( desc.tokens[i].dest.mask != 0xf ) {
                        var ndest = 0;                                           
                        destmaskstring = ""; 
                        if ( desc.tokens[i].dest.mask & 1 ) { ndest++; destmaskstring+="x"; }                                 
                        if ( desc.tokens[i].dest.mask & 2 ) { ndest++; destmaskstring+="y"; } 
                        if ( desc.tokens[i].dest.mask & 4 ) { ndest++; destmaskstring+="z"; } 
                        if ( desc.tokens[i].dest.mask & 8 ) { ndest++; destmaskstring+="w"; } 
                        destregstring += "."+destmaskstring;                             
                        switch ( ndest ) {
                            case 1: destcaststring = "float"; break;
                            case 2: destcaststring = "vec2"; break;
                            case 3: destcaststring = "vec3"; break;
                            default: throw "Unexpected destination mask"; 
                        }                                                                            
                    } else {
                        destcaststring = "vec4"; 
                        destmaskstring = "xyzw"; 
                    }
                }
                line = line.replace ( "%dest", destregstring ); 
                line = line.replace ( "%cast", destcaststring );                         
                line = line.replace ( "%dm", destmaskstring );                                   
            }
            var dwm = 0xf;
            if ( !lutentry.ndwm && lutentry.dest && desc.tokens[i].dest )
                dwm = desc.tokens[i].dest.mask; 
            if ( desc.tokens[i].a ) 
                line = line.replace ( "%a", sourcetostring ( desc.tokens[i].a, 0, dwm, lutentry.scalar ) );
            if ( desc.tokens[i].b ) {
                line = line.replace ( "%b", sourcetostring ( desc.tokens[i].b, sl, dwm, lutentry.scalar ) );                                                                                
                if ( desc.tokens[i].b.regtype == 0x5) {
                    // sampler dim
                    var texdim = ["2D","Cube","3D"][desc.tokens[i].b.dim];
                    var texsize = ["vec2","vec3","vec3"][desc.tokens[i].b.dim];
                    line = line.replace ( "%texdim", texdim );        
                    line = line.replace ( "%texsize", texsize );        
                    var texlod = ""; 
                    line = line.replace ( "%lod", texlod );                                
                }
            }
            body += line;
        }                                        
    }
            
    // adjust z from opengl range of -1..1 to 0..1 as in d3d, this also enforces a left handed coordinate system
    if ( desc.header.type == "vertex" ) 		
        body += "  gl_Position = vec4(outpos.x, yflip*outpos.y, outpos.z*2.0 - outpos.w, outpos.w);\n";                
    // clamp fragment depth
    if ( desc.writedepth ) 
        body += "  gl_FragDepth = clamp(tmp_FragDepth,0.0,1.0);\n"; 		
    // close main
    body += "}\n";     
     
    return header + body;                 
}

Context3DWebGL.Program.uploadFromAGALByteArray = function (vsbytes, fsbytes) {
    var gl = this.priv_parent.gl;
    // AGAL -> GLSL 
    var f_desc = this.decribeAGALByteArray ( fsbytes );
    var v_desc = this.decribeAGALByteArray ( vsbytes );
        
    var vsglsl = this.descToGLSL ( v_desc );
    var fsglsl = this.descToGLSL ( f_desc );         
        
    console.log ( "Vertex shader GLSL: \n"+vsglsl );
    console.log ( "Fragment shader GLSL: \n"+fsglsl );
        
    this.uploadFromGLSLString(vsglsl,fsglsl); 
        
    // set samplers from agal only
    for ( var i=0; i<Context3D.maxtextures; i++ )
        this.priv_desc.samplers[i] = f_desc.samplers[i]; 
}       

// alias for easier porting
Context3DWebGL.Program.upload = Context3DWebGL.Program.uploadFromAGALByteArray; 
          
Context3DWebGL.Program.uploadFromGLSLString = function(vssource,fssource) { 
    if ( this.priv_glid_prog == null ) // is disposed        
        throw "Object is already disposed";          
    var gl = this.priv_parent.gl; 
    
    function makeeshader ( stype,source ) {        
        var glid = gl.createShader(stype); 
        gl.shaderSource (glid,source);
        gl.compileShader ( glid );
        if ( !gl.getShaderParameter ( glid, gl.COMPILE_STATUS ) ) {
            console.log ( "Shader "+stype+" compile failed." );                     
            console.log ( gl.getShaderInfoLog(glid) );
            gl.deleteShader ( glid );             
            return null; 
        }                
        return glid; 
    }    
    
    this.priv_freeshaders();                 
    this.priv_glid_pshader = makeeshader( gl.FRAGMENT_SHADER,fssource );
    this.priv_glid_vshader = makeeshader( gl.VERTEX_SHADER,vssource );                
    if ( !this.priv_glid_pshader || !this.priv_glid_vshader ) {
        throw "Native shader compilation failed";        
    }
    gl.attachShader ( this.priv_glid_prog, this.priv_glid_pshader );
    gl.attachShader ( this.priv_glid_prog, this.priv_glid_vshader );
    this.priv_desc.streamused = []; 
    this.priv_desc.samplers = []; // not set through glsl
    // link 
    gl.linkProgram ( this.priv_glid_prog );         
    if ( !gl.getProgramParameter ( this.priv_glid_prog, gl.LINK_STATUS ) ) {
        console.log ( "Program link failed." );         
        console.log ( gl.getProgramInfoLog(this.priv_glid_prog) );        
        throw "Native shader compilation failed";        
    }                
    // streams
    var na = gl.getProgramParameter(this.priv_glid_prog, gl.ACTIVE_ATTRIBUTES);                                
    var tempa = []; 
    var allaregood = true; 
    this.priv_desc.streamused = []; 
    for (var i = 0; i < na; ++i) {
        var a = gl.getActiveAttrib(this.priv_glid_prog, i);
        tempa[a.name] = true; 
        if ( a.name == "va"+i ) {
            this.priv_desc.streamused[i] = "va"+i;                                                                
        } else allaregood = false;                                                     
    }                
    if ( !allaregood ) {
        console.log("Warning, need re-link for attribute binding.");                     
        // streams...                     
        this.priv_desc.streamused = []; 
        for ( var i=0; i<Context3D.maxstreams; i++ ) {                   
            if ( tempa["va"+i] ) {
                gl.bindAttribLocation( this.priv_glid_prog, i, "va"+i );                                
                this.priv_desc.streamused[i] = "va"+i;        
            } 
        }
        // link again...
        gl.linkProgram ( this.priv_glid_prog );                                
        if ( !gl.getProgramParameter ( this.priv_glid_prog, gl.LINK_STATUS ) ) {
            console.log ( "Program re-link failed." ); 
            console.log ( gl.getProgramInfoLog(this.priv_glid_prog) );
            throw "Native shader compilation failed";            
        }            
    }
    console.log ( "Program compiled & linked fine." ); 
    // describe program from glsl
    this.priv_desc.yflip = gl.getUniformLocation(this.priv_glid_prog, "yflip");                
    this.priv_desc.vertexconstarr = gl.getUniformLocation(this.priv_glid_prog, "vcarrr");                
    this.priv_desc.vertexconstused = []; 
    if  ( !this.priv_desc.vertexconstarr ) {
        for ( var i=0; i<Context3D.maxvertexconstants; i++ ) {
            this.priv_desc.vertexconstused[i] = gl.getUniformLocation(this.priv_glid_prog, "vc"+i);
            if ( this.priv_desc.vertexconstused[i] ) console.log ( "Vertex constant "+i+" used" );
        }
    } else {
        console.log ( "Vertex constant array used." );
    }
    this.priv_desc.fragconstused = []; 
    for ( var i=0; i<Context3D.maxfragconstants; i++ ) {
        this.priv_desc.fragconstused[i] = gl.getUniformLocation(this.priv_glid_prog, "fc"+i);
        if ( this.priv_desc.fragconstused[i] ) console.log ( "Fragment constant "+i+" used" );
    }                                
    gl.useProgram ( this.priv_glid_prog ); 
    for ( var i=0; i<Context3D.maxtextures; i++ ) {     
        var fsi = gl.getUniformLocation(this.priv_glid_prog, "fs"+i);
        if ( fsi ) gl.uniform1i ( fsi, i );                        
    }
    gl.useProgram ( null );                                                   
}       

Context3DWebGL.Program.dispose = function() {        
    if (this.priv_glid_prog != null) {
        this.priv_freeshaders();        
        var gl = this.priv_parent.gl;        
        gl.deleteProgram(this.priv_glid_prog);                
        this.priv_glid_prog = null; 
        this.priv_parent.priv_removeResource ( this );
    }                
}

Context3DWebGL.Program.isDisposed = function() {
    return this.priv_glid_prog == null;
}                                 

Context3DWebGL.createProgram = function ( ) {
    var r = new Context3D.Program ( ); 
    for ( name in Context3DWebGL.Program ) 
        r[name] = Context3DWebGL.Program[name];
    r.priv_init ( this );    
    return r;
}

// 
// ------------------------------------------------ Index Buffer -----------------------------------------------------
//
Context3DWebGL.IndexBuffer = { }

Context3DWebGL.IndexBuffer.priv_init = function (parent, numindices) {
    // allocate gl object
    if ( !(numindices>0 && numindices<=0x80000 ) )
        throw "Bad index buffer index count: "+numindices;     
    this.priv_restype = "Index Buffer";        
    this.numindices = numindices;        
    
    var gl = parent.gl;
    if (!gl)
        throw "Invalid or disposed Context3D parent object";

    this.priv_glid = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.priv_glid);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.numindices * 2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    var e = gl.getError();
    if (e != gl.NO_ERROR) {
        gl.deleteBuffer(this.priv_glid);
        this.priv_glid = null;
        throw "GL error while allocating index buffer: " + parent.glErrorToString(e);
    }

    var e = gl.getError();
    if (e != gl.NO_ERROR) {
        gl.deleteBuffer(this.priv_glid);
        this.priv_glid = null;
        throw "GL error while allocating index buffer: " + parent.glErrorToString(e);
    }
    
    parent.priv_addResource(this);                           
}

Context3DWebGL.IndexBuffer.uploadFromByteArray = function(data,offset,srcoffset,count) {     
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";

    var gl = this.priv_parent.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.priv_glid);
    var u16view;
    if (data.arraybytes && (srcoffset & 1) == 0) {
        u16view = new Uint16Array(data.arraybytes, srcoffset, count);
    } else {
        throw "todo";
    }
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset * 2, u16view)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
    this.priv_parent.glErrorCheckThrow ( "Index buffer upload" );
}

Context3DWebGL.IndexBuffer.uploadFromArray = function(data,offset,count) { 
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";

    if (!data || data.length == 0)
        throw "Invalid array specified";

    offset = offset || 0;
    if ( !count || count<0 ) count = data.length;

    var gl = this.priv_parent.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.priv_glid);
    var buffer = new ArrayBuffer(count * 2);
    var u16view = new Uint16Array(buffer);
    for (var i = 0; i < count; i++)
        u16view[i] = data[i];
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset * 2, u16view)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

Context3DWebGL.IndexBuffer.dispose = function() {    
    if (this.priv_glid != null) {        
        var gl = this.priv_parent.gl;
        gl.deleteBuffer(this.priv_glid);        
        this.priv_glid = null; 
        this.priv_parent.priv_removeResource ( this );        
    }
    this.priv_glid = null; 
}

Context3DWebGL.IndexBuffer.isDisposed = function() {
    return this.priv_glid == null;
}             

Context3DWebGL.createIndexBuffer = function ( numindices ) {
    var r = new Context3D.IndexBuffer ( ); 
    for ( name in Context3DWebGL.IndexBuffer ) 
        r[name] = Context3DWebGL.IndexBuffer[name];
    r.priv_init ( this, numindices );    
    return r;
}

// 
// ------------------------------------------------ Vertex Buffer -----------------------------------------------------
//
Context3DWebGL.VertexBuffer = { }

Context3DWebGL.VertexBuffer.priv_init = function ( parent, numvertices, dwordspervertex ) {
    // check that it is not new-ed? how?
    if ( !(dwordspervertex>0 && dwordspervertex<=64 ) ) 
        throw "Bad per-vertex size of "+dwordspervertex+" dwords per vertex.";
    if ( !(numvertices>0 && numvertices<0x10000 ) ) 
        throw "Bad vertex count for new vertex buffer: "+numvertices;     
    this.priv_restype = "Vertex Buffer";    
    this.priv_parent = parent;                 
    this.dwordspervertex = dwordspervertex;
    this.numvertices = numvertices;     
    
    var gl = this.priv_parent.gl;
    if (!gl)
        throw "Invalid or disposed Context3D parent object";
    this.priv_glid = gl.createBuffer();
    gl.bindBuffer ( gl.ARRAY_BUFFER, this.priv_glid ); 
    gl.bufferData ( gl.ARRAY_BUFFER, this.numvertices*this.dwordspervertex*4, gl.STATIC_DRAW );
    gl.bindBuffer ( gl.ARRAY_BUFFER, null );         
    var e = gl.getError ( ); 
    if ( e != gl.NO_ERROR ) { 
        gl.deleteBuffer ( this.priv_glid );            
        this.priv_glid = null;        
        throw "GL error while allocating vertex buffer: "+this.priv_parent.glErrorToString( e );
    }    
    parent.priv_addResource(this);  
}

Context3DWebGL.VertexBuffer.uploadFromByteArray = function(data,offset,srcoffset,count) { 
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";
    var gl = this.priv_parent.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.priv_glid);
    var f32view;
    if (data.arraybytes && (srcoffset & 3) == 0) {
        f32view = new Float32Array(data.arraybytes, srcoffset, count * this.dwordspervertex);
    } else {
        throw "todo";
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, this.dwordspervertex * 4 * offset, f32view)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.priv_parent.glErrorCheckThrow("Vertex buffer upload");
}


Context3DWebGL.VertexBuffer.uploadFromArray = function(data,offset,count) { 
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";

    if (!data || data.length == 0)
        throw "Invalid array specified";

    offset = offset || 0; 
    if (!count || count < 0) count = data.length / this.dwordspervertex;

    var gl = this.priv_parent.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.priv_glid);
    var buffer = new ArrayBuffer(count * this.dwordspervertex * 4);
    var f32view = new Float32Array(buffer);
    for (var i = 0; i < count * this.dwordspervertex; i++)
        f32view[i] = data[i];
    gl.bufferSubData(gl.ARRAY_BUFFER, this.dwordspervertex * 4 * offset, f32view)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.priv_parent.glErrorCheckThrow("Vertex buffer upload");
}

Context3DWebGL.VertexBuffer.dispose = function() {                    
    if (this.priv_glid != null) {
        var gl = this.priv_parent.gl;
        gl.deleteBuffer(this.priv_glid);
        this.priv_glid = null;
        this.priv_parent.priv_removeResource(this);
    }
}

Context3DWebGL.VertexBuffer.isDisposed = function() {
    return this.priv_glid == null;
}                     

Context3DWebGL.createVertexBuffer = function ( numvertices, dwordspervertex ) {    
    var r = new Context3D.VertexBuffer ( ); 
    for ( name in Context3DWebGL.VertexBuffer ) 
        r[name] = Context3DWebGL.VertexBuffer[name];
    r.priv_init ( this, numvertices, dwordspervertex );                 
    return r;        
}

// 
// ------------------------------------------------ Cube Texture -----------------------------------------------------
//

Context3DWebGL.CubeTexture = { }

Context3DWebGL.CubeTexture.priv_init = function ( parent, size, format, forRTT, streaming ) {
    if ( !forRTT ) forRTT = false; 
    if ( !streaming ) streaming = 0; 
    if ( !Context3D.isPowerOfTwoInt(size) ) 
        throw "Cube texture size must be powers of two, but it is "+size;
        
    this.priv_restype = "Texture";
    this.priv_ressubtype = "Cube";         
    this.size = size;
    this.format = format; 
    this.forRTT = forRTT;
    this.streaming = streaming;
    
    var gl = parent.gl;     
    if ( !gl ) 
        throw "Invalid or disposed Context3D parent object";    
    
    this.priv_glid = gl.createTexture();      
    this.priv_gltarget = gl.TEXTURE_CUBE_MAP;
    gl.activeTexture ( gl.TEXTURE0 ); 
    gl.bindTexture ( gl.TEXTURE_CUBE_MAP, this.priv_glid );     
    var ls = size;     
    var level = 0; 
    while ( ls>0 ) {
        for ( var i=0; i<6; i++ ) 
            gl.texImage2D ( parent.cubesidetogl[i], level, gl.RGBA, ls, ls, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );                                
        ls>>=1;
        level++; 
    }
    gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.bindTexture ( gl.TEXTURE_CUBE_MAP, null );    
    
    parent.priv_addResource(this);                           
}
        
Context3DWebGL.CubeTexture.uploadFromImage = function( obj, side, level ) {
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";          
    if ( !obj ) 
        throw "Bad input Image object for texture upload";
    if ( !(side>=0 && side<6) )
        throw "Bad cube map side for texture upload";
    var ls = this.size>>level;            
    if ( !(ls>0) ) 
        throw "Bad level for texture upload";                                
    obj = Context3D.extendOrCropImage(obj, ls, ls);
    
    var gl = this.priv_parent.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.priv_glid);
    gl.texImage2D(this.priv_parent.cubesidetogl[side], level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    this.priv_parent.glErrorCheckThrow("Cube map upload");
}

Context3DWebGL.CubeTexture.uploadFromUint8Array = function( obj, side, level ) {
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";          
    if ( !obj ) 
        throw "Bad input Image object for texture upload";            
    if ( !(side>=0 && side<6) )
        throw "Bad cube map side for texture upload";
    var ls = this.size>>level;         
    if ( !(ls>0) ) 
        throw "Bad level for texture upload";                              
    gl.activeTexture ( gl.TEXTURE0 ); 
    gl.bindTexture ( gl.TEXTURE_CUBE_MAP, this.priv_glid );                  
    var gl = this.priv_parent.gl;                            
    gl.texSubImage2D ( this.priv_parent.cubesidetogl[side], level, 0 , 0, ls, ls, gl.RGBA, gl.UNSIGNED_BYTE, obj );                                                        
    gl.bindTexture ( gl.TEXTURE_CUBE_MAP, null );      
    this.priv_parent.glErrorCheckThrow ( "Cube map upload" );
}

Context3DWebGL.CubeTexture.dispose = function() {           
    if ( this.priv_glid != null ) {
        var gl = this.priv_parent.gl; 
        gl.deleteTexture (this.priv_glid);
        this.priv_glid = null; 
        this.priv_parent.priv_removeResource ( this );        
    }
}

Context3DWebGL.CubeTexture.isDisposed = function() {
    return this.priv_glid == null;
}                                                        
    
Context3DWebGL.createCubeTexture = function ( size, format, forRTT, streaming ) {
    var r = new Context3D.CubeTexture ( ); 
    for ( name in Context3DWebGL.CubeTexture ) 
        r[name] = Context3DWebGL.CubeTexture[name];
    r.priv_init ( this, size, format, forRTT, streaming );                 
    return r;            
}

// 
// ------------------------------------------------ 2D Texture -----------------------------------------------------
//
Context3DWebGL.Texture = { } 

Context3DWebGL.Texture.priv_init = function (parent, w, h, format, forRTT, streaming) {
    if ( !forRTT ) forRTT = false; 
    if ( !streaming ) streaming = 0;     
    if ( !Context3D.isPowerOfTwoInt(w) || !Context3D.isPowerOfTwoInt(h) ) 
        throw "Texture width and height must be powers of two, but they are "+w+", "+h;
    
    this.priv_restype = "Texture";
    this.priv_ressubtype = "2D";        
    this.w = w;
    this.h = h;
    this.format = format; 
    this.forRTT = forRTT;
    this.streaming = streaming;    
    
    var gl = parent.gl;
    if (!gl)
        throw "Invalid or disposed Context3D parent object";

    gl.getError(); // clear error
    this.priv_glid = gl.createTexture();
    if (!this.priv_glid)
        throw "Failed to create a GL texture";
    this.priv_gltarget = gl.TEXTURE_2D;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.priv_glid);
    var lw = this.w;
    var lh = this.h;
    var level = 0;
    while (lw > 0 && lh > 0) {
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, lw > 0 ? lw : 1, lh > 0 ? lh : 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        var e = gl.getError();
        if (e != gl.NO_ERROR) {
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.deleteTexture(this.priv_glid);
            this.priv_glid = null;
            throw "GL error while allocating texture object: " + parent.glErrorToString(e);
        }
        lw >>= 1;
        lh >>= 1;
        level++;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    parent.priv_addResource(this);        
}

Context3DWebGL.Texture.uploadFromImage = function( obj, level ) {    
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";            
    if ( !obj ) // check type better? 
        throw "Bad input Image object for texture upload";
    var lw = this.w>>level;
    var lh = this.h>>level;                               
    obj = Context3D.extendOrCropImage ( obj, lw, lh );
    if ( !(lw > 0 && lh>0 ) )
        throw "Bad level for texture upload";
    var gl = this.priv_parent.gl;
    gl.getError(); // clear error
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.priv_glid);
    try { // to catch CORS violations or type errors
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj);
    } catch (e) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        throw e;
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.priv_parent.glErrorCheckThrow("Texture upload");
}

Context3DWebGL.Texture.uploadFromUint8Array = function( array, level ) {            
    if ( this.priv_glid == null ) // is disposed        
        throw "Object is already disposed";          
    if ( !array ) 
        throw "Bad input Uint8 object for texture upload";            
    var lw = this.w>>level;
    var lh = this.h>>level;                      
    if ( !(lw > 0 && lh>0 ) )
        throw "Bad level for texture upload";
    var gl = this.priv_parent.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.priv_glid);
    gl.texSubImage2D(gl.TEXTURE_2D, level, 0, 0, lw > 0 ? lw : 1, lh > 0 ? lh : 0, gl.RGBA, gl.UNSIGNED_BYTE, array);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.priv_parent.glErrorCheckThrow("Texture upload");
}

Context3DWebGL.Texture.dispose = function() {           
    if (this.priv_glid != null) {
        var gl = this.priv_parent.gl;
        gl.deleteTexture(this.priv_glid);
        this.priv_glid = null;         
        this.priv_parent.priv_removeResource ( this );        
    }
}

Context3DWebGL.Texture.isDisposed = function() {
    return this.priv_glid == null;
}                              

Context3DWebGL.createTexture = function ( w, h, format, forRTT, streaming ) {    
    var r = new Context3D.Texture ( ); 
    for ( name in Context3DWebGL.Texture ) 
        r[name] = Context3DWebGL.Texture[name];
    r.priv_init ( this, w, h, format, forRTT, streaming );                 
    return r;                  
}
  
// 
// ------------------------------------------------ Drawing -----------------------------------------------------
//
Context3DWebGL.priv_setupTarget = function ( ) {
    var gl = this.gl;     
    var state = this.state; 
    
    if ( state.rtt.target ) {
        // enable rtt
        if ( !this.scratchfb ) 
            this.scratchfb = gl.createFramebuffer();                                    
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.scratchfb );             
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, state.rtt.target.priv_gltarget, state.rtt.target.priv_glid, 0 );                        
        this.priv_vp_w = state.rtt.target.w;
        this.priv_vp_h = state.rtt.target.h;        
        //yflip = true; 
    } else {
        // disable rtt
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);     
        this.priv_vp_w = gl.drawingBufferWidth;
        this.priv_vp_h = gl.drawingBufferHeight;            
    }    
    gl.viewport ( 0,0, this.priv_vp_w, this.priv_vp_h);
        
    if ( this.enableErrorChecking ) {
        if ( gl.checkFramebufferStatus(gl.FRAMEBUFFER)!=gl.FRAMEBUFFER_COMPLETE ) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);             
            throw "GL framebuffer failed";                         
        }
        var e = gl.getError ( ); // clear error regardless
        if ( e != gl.NO_ERROR )                                  
            throw "GL error after target setup: "+this.glErrorToString( e );                
    }        
}

Context3DWebGL.priv_checkStencilStateBits = function ( state ) {
    function isStencilOff ( stac ) {
        return stac.compare == Context3DCompareMode.ALWAYS &&
               stac.bothpass == Context3DStencilAction.KEEP && 
               stac.depthfail == Context3DStencilAction.KEEP && 
               stac.depthpass == Context3DStencilAction.KEEP;        
    }        
    // 0 = stencil off
    // 1/2 = use either side 1 or 2
    // 3 = two sided
	//if ( this.state->target.depthstencil==false ) return 0; 
	if ( state.stencil.actions[0].compare == this.state.stencil.actions[1].compare && 
         state.stencil.actions[0].bothpass == this.state.stencil.actions[1].bothpass &&
         state.stencil.actions[0].depthfail == this.state.stencil.actions[1].depthfail &&
         state.stencil.actions[0].depthpass == this.state.stencil.actions[1].depthpass ) { 
		// both the same, set single sided 1
        return isStencilOff ( this.state.stencil.actions[0] )?0:1; 
	} else {
		// both different	        
		if ( state.cullFace == Context3DTriangleFace.BACK ) // only use back			
            return isStencilOff ( this.state.stencil.actions[1] )?0:2; 
		if ( state.cullFace == Context3DTriangleFace.FRONT ) 
            return isStencilOff ( this.state.stencil.actions[0] )?0:1; 		
		// no culling, will set both
        return 3;		
	}	
}


Context3DWebGL.drawTriangles = function ( indexbuffer, offsetinbuffer, numtriangles ) {    

    this.checkIsValidObject(indexbuffer, "Index Buffer");
    
    offsetinbuffer = offsetinbuffer || 0;                
    if ( !numtriangles || numtriangles<0 ) numtriangles = indexbuffer.numindices / 3; 
    
    if (this.gl == null)
        throw "Object is already disposed";

    var gl = this.gl;
    var state = this.state;

    if (this.enableErrorChecking) {
        var e = gl.getError(); // clear error regardless
        if (e != gl.NO_ERROR)
            throw "GL error before drawing: " + this.glErrorToString(e);
    }

    var yflip = false;

    this.priv_setupTarget();

    // set prog            
    gl.useProgram(state.prog.priv_glid_prog);
    // set constants
    if (state.prog.priv_desc.vertexconstarr) {            
        gl.uniform4fv ( state.prog.priv_desc.vertexconstarr, state.vertexconstants );                     
    } else {
        state.prog.priv_desc.vertexconstused.forEach(function (glname, index) {
            var i4 = index * 4;
            gl.uniform4f(glname, state.vertexconstants[i4], state.vertexconstants[i4 + 1], state.vertexconstants[i4 + 2], state.vertexconstants[i4 + 3]);
        });
    }
    if (state.prog.priv_desc.yflip)
        gl.uniform1f(state.prog.priv_desc.yflip, yflip ? -1.0 : 1.0);

    state.prog.priv_desc.fragconstused.forEach(function (glname, index) {
        var i4 = index * 4;
        gl.uniform4f(glname, state.fragconstants[i4], state.fragconstants[i4 + 1], state.fragconstants[i4 + 2], state.fragconstants[i4 + 3]);
    });
    // set streams
    for (var i = 0; i < Context3D.maxstreams; i++) {
        if (state.prog.priv_desc.streamused[i]) {
            gl.enableVertexAttribArray(i);
            gl.bindBuffer(gl.ARRAY_BUFFER, state.streams[i].buffer.priv_glid);
            var togl = this.streamtypetogl[state.streams[i].type];
            var stride = state.streams[i].buffer.dwordspervertex * 4;
            gl.vertexAttribPointer(i, togl.size, togl.type, togl.normalized, stride, state.streams[i].offset * 4);
        } else {
            gl.disableVertexAttribArray(i);
        }
    }
    // set textures
    for (var i = 0; i < Context3D.maxtextures; i++) {
        var tn = state.textures[i].glname;
        gl.activeTexture(tn);
        if (state.textures[i].texture) {
            var gltarget = state.textures[i].texture.priv_gltarget;
            gl.bindTexture(gltarget, state.textures[i].texture.priv_glid);
            // sampler from program       
            if (state.textures[i].sampler.wrap == 0) {
                gl.texParameteri(gltarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gltarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            } else {
                gl.texParameteri(gltarget, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gltarget, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            if (state.textures[i].sampler.filter == 0) { // nearest
                gl.texParameteri(gltarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                var p = this.minfilter_linear_togl[state.textures[i].sampler.mipmap];
                gl.texParameteri(gltarget, gl.TEXTURE_MIN_FILTER, p);
            } else { // linear
                gl.texParameteri(gltarget, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                var p = this.minfilter_linear_togl[state.textures[i].sampler.mipmap];
                gl.texParameteri(gltarget, gl.TEXTURE_MIN_FILTER, p);
            }
        } else {
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
    }
    gl.activeTexture(gl.TEXTURE0);

    // set depth
    if (state.depthWrite || state.depthFunc != "always") {
        gl.depthMask(state.depthWrite);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(this.comparetogl[state.depthFunc]);
    } else {
        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);
    }
    // set scissor
    if (state.scissor) {
        gl.enable(gl.SCISSOR_TEST);
        // clip 
        var clipped = [state.scissor[0], this.priv_vp_h - state.scissor[1] - state.scissor[3], state.scissor[2], state.scissor[3]];
        var clipper = [0, 0, this.priv_vp_w, this.priv_vp_h];
        if (!Context3D.clipRectangle(clipped, clipper))
            gl.scissor(0, 0, 0, 0);
        else
            gl.scissor(state.scissor[0], this.priv_vp_h - state.scissor[1] - state.scissor[3], state.scissor[2], state.scissor[3]);

    } else {
        gl.disable(gl.SCISSOR_TEST);
    }

    // set stencil 
    var sbits = this.priv_checkStencilStateBits(state); 
    if ( sbits===0 ) {
        gl.disable(gl.STENCIL_TEST);        
    } else {
        gl.enable(gl.STENCIL_TEST);        
        gl.stencilMask( this.state.stencil.writeMask );        
        if ( sbits==3 ) {
            var sside = yflip?gl.FRONT:gl.BACK;
            gl.stencilFuncSeparate ( sside, this.comparetogl[state.stencil.actions[0].compare], this.state.stencil.referenceValue, this.state.stencil.readMask ); 
            gl.stencilOpSeparate ( sside, this.stenciltogl[state.stencil.actions[0].depthpass], 
                                          this.stenciltogl[state.stencil.actions[0].depthfail],
                                          this.stenciltogl[state.stencil.actions[0].bothpass]);					        
            sside = yflip?gl.BACK:gl.FRONT;
            gl.stencilFuncSeparate ( sside, this.comparetogl[state.stencil.actions[1].compare], this.state.stencil.referenceValue, this.state.stencil.readMask ); 
            gl.stencilOpSeparate ( sside, this.stenciltogl[state.stencil.actions[1].depthpass], 
                                          this.stenciltogl[state.stencil.actions[1].depthfail],
                                          this.stenciltogl[state.stencil.actions[1].bothpass]);            
        } else {			
            sbits--;// convert stencilmode bits to an index selecting either the front or back state (no need to care about yflip here)				
            gl.stencilFunc ( this.comparetogl[state.stencil.actions[sbits].compare], this.state.stencil.referenceValue, this.state.stencil.readMask ); 			
            gl.stencilOp (  this.stenciltogl[state.stencil.actions[sbits].depthpass], 
                            this.stenciltogl[state.stencil.actions[sbits].depthfail],
                            this.stenciltogl[state.stencil.actions[sbits].bothpass]);		
        }
    }    

    // set blending
    if (state.blend.src === Context3DBlendFactor.ONE && state.blend.dest === Context3DBlendFactor.ZERO) {
        gl.disable(gl.BLEND);
    } else {
        gl.blendFunc(this.blendtogl[state.blend.src], this.blendtogl[state.blend.dest]);
        gl.enable(gl.BLEND);
    }

    // mask
    gl.colorMask(state.colormask.r, state.colormask.g, state.colormask.b, state.colormask.a);

    // set culling
    if (state.cullFace == "none") {
        gl.disable(gl.CULL_FACE);
    } else {
        if (!yflip) gl.cullFace(this.cullingtoglflipped[state.cullFace]);
        else gl.cullFace(this.cullingtogl[state.cullFace]);
        gl.enable(gl.CULL_FACE);
    }

    // draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexbuffer.priv_glid);
    gl.drawElements(gl.TRIANGLES, numtriangles * 3, gl.UNSIGNED_SHORT, offsetinbuffer * 2);

    if (this.enableErrorChecking) {
        var e = gl.getError();
        if (e != gl.NO_ERROR)
            throw "GL error after drawing: " + this.glErrorToString(e);
    }
}

Context3DWebGL.clear = function (r,g,b,a,depth,stencil,mask) {           
    mask = typeof mask !== typeof undefined ? mask : (Context3DClearMask.COLOR | Context3DClearMask.STENCIL | Context3DClearMask.DEPTH);
    stencil = stencil || 0;
    depth = typeof depth !== typeof undefined ? depth : 1.0;           
    r = r || 0;
    g = g || 0;
    b = b || 0;
    a = typeof a !== typeof undefined ? a : 1.0;    
    if (this.gl == null)
        throw "Object is already disposed";
    var gl = this.gl;
    this.priv_setupTarget();
    gl.disable(gl.SCISSOR_TEST);
    gl.clearStencil(stencil);
    gl.clearDepth(depth);
    gl.clearColor(r, g, b, a);
    gl.colorMask(true, true, true, true);
    gl.depthMask(true);
    gl.stencilMask(0xff);
    var glmask = 0;
    if (mask & Context3DClearMask.COLOR) glmask |= gl.COLOR_BUFFER_BIT;
    if (mask & Context3DClearMask.STENCIL) glmask |= gl.STENCIL_BUFFER_BIT;
    if (mask & Context3DClearMask.DEPTH) glmask |= gl.DEPTH_BUFFER_BIT;
    gl.clear(glmask);
}

Context3DWebGL.drawToObject = function ( dest ) {
    if (this.gl == null)
        throw "Object is already disposed";
    var gl = this.gl;
    this.priv_setupTarget();    
    gl.readPixels(0, 0, this.priv_vp_w,this.priv_vp_h, gl.RGBA, gl.UNSIGNED_BYTE, dest );    
}

// present 
Context3DWebGL.present = function ( ) {
}

Context3DWebGL.getDriverInfo = function ( ) {
    var gl = this.gl; 
    if ( gl ) {
        return "WebGL\n"+
               "  Version="+gl.getParameter ( gl.VERSION )+"\n"+
               "  Renderer="+gl.getParameter ( gl.RENDERER )+"\n"+
               "  Vendor="+gl.getParameter ( gl.VENDOR );    
    } else {
        return "Disposed";
    }    
}
    
// dispose 
Context3DWebGL.dispose = function (removecanvas) {
    if ( this.isDisposed() ) return;
    console.log("Context3D dispose, releasing " + this.resources.length + " resources.");
    var gl = this.gl; 
    if ( gl ) {
        if ( this.scratchfb ) {        
            gl.bindFramebuffer( gl.FRAMEBUFFER, null); 
            gl.deleteFramebuffer ( this.scratchfb ); 
            this.scratchfb = null; 
        }
    }

    while (this.resources.length) {
        this.resources[this.resources.length - 1].dispose();
    }

    if (gl) {
        //what to do? seems like the only way to kill it is to remove the canvas and rebuild it
        var pnode = this.priv_canvas.parentNode;
        if (removecanvas) {
            pnode.removeChild(this.priv_canvas);
        } else {
            var newnode = this.priv_canvas.cloneNode();
            pnode.replaceChild(newnode, this.priv_canvas);
        }
    }
    this.priv_canvas = null;       
    this.gl = null;     
}

Context3DWebGL.isDisposed = function ( ) {
    return this.gl==null && this.fp==null; 
}

Context3DWebGL.priv_addResource = function ( r ) {    
    this.resources.push(r);
    r.priv_parent = this;
}

Context3DWebGL.priv_removeResource = function ( r ) {
    var idx = this.resources.indexOf ( r ); 
    if ( idx>=0 ) {
        if ( idx<(this.resources.length-1) ) this.resources[idx] = this.resources.pop(); 
        else this.resources.pop();         
    }
    r.priv_parent = null;
}
        
Context3DWebGL.resetState = function ( ) {        
    this.state = { };
    this.state.colormask = { r:true,g:true,b:true,a:true };
    this.state.depthWrite = false;
    this.state.depthFunc = Context3DCompareMode.ALWAYS; 
    this.state.blend = { src:Context3DBlendFactor.ONE, dest:Context3DBlendFactor.ZERO };
    this.state.cullFace = Context3DTriangleFace.NONE;         
    this.state.rtt = { target:null, depth:false, depthtarget:null, aa:0 };
    this.state.scissor = null; 
    
    this.state.stencil = { };
    this.state.stencil.actions = [];
    for ( var i=0; i<2; i++ ) {
        this.state.stencil.actions[i] = { };
        this.state.stencil.actions[i].compare = Context3DCompareMode.ALWAYS;
        this.state.stencil.actions[i].bothpass = Context3DStencilAction.KEEP;
        this.state.stencil.actions[i].depthfail = Context3DStencilAction.KEEP;
        this.state.stencil.actions[i].depthpass = Context3DStencilAction.KEEP;                
    }            
    this.state.stencil.readMask = 0xff;;
    this.state.stencil.writeMask = 0xff;
    this.state.stencil.referenceValue = 0;  
        
    this.state.prog = 0; 
    this.state.streams = [];

    for ( var i=0; i<Context3D.maxstreams; i++ ) 
        this.state.streams[i] = {buffer:null,offset:0,type:Context3DVertexBufferFormat.FLOAT_4};
    this.state.vertexconstants = [];
    for ( var i=0; i<Context3D.maxvertexconstants*4; i++ ) 
        this.state.vertexconstants[i] = 0;
    this.state.fragconstants = [];
    for ( var i=0; i<Context3D.maxfragconstants*4; i++ ) 
        this.state.fragconstants[i] = 0;                    
    this.state.textures = [];                 
    this.state.textures[0] = { glname:this.gl.TEXTURE0, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[1] = { glname:this.gl.TEXTURE1, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[2] = { glname:this.gl.TEXTURE2, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[3] = { glname:this.gl.TEXTURE3, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[4] = { glname:this.gl.TEXTURE4, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[5] = { glname:this.gl.TEXTURE5, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[6] = { glname:this.gl.TEXTURE6, texture: null, sampler:Context3D.defaultsampler }; 
    this.state.textures[7] = { glname:this.gl.TEXTURE7, texture: null, sampler:Context3D.defaultsampler };        
}

Context3DWebGL.glErrorCheckThrow = function ( msg ) {
    if ( this.enableErrorChecking ) {
        var e = this.gl.getError ( );
        if ( e != this.gl.NO_ERROR ) {
            throw msg+" raised a GL error: "+this.glErrorToString ( e ); 
        }
    }
}

Context3DWebGL.glErrorToString = function ( e ) {
    if ( this.glerrortostring[e] ) return this.glerrortostring[e];
    else return "Unknown GL error: "+e.toString(); 
}

Context3DWebGL.priv_init = function ( acanvas, callback ) {
    var gl = null;
    try {
        var attribs = { alpha:true, depth:true, stencil:true, antialias:false, premultipliedAlpha:true, preserveDrawingBuffer:false };
        gl = acanvas.getContext("webgl", attribs) || acanvas.getContext("experimental-webgl", attribs);                    
    } catch(e) {
        return false;
    }
    if ( !gl ) return false; 
    
    // init all the gl based tables    
    console.log ( "WebGL extensions:", gl.getSupportedExtensions() );    
    
    this.texformattogl = {
        "bgra":{ifmt:gl.RGBA, type:gl.UNSIGNED_BYTE, efmt:gl.RGBA}            
    };
    
    this.cullingtogl = {
        "back":gl.BACK,
        "front":gl.FRONT,
        "frontAndBack":gl.FRONT_AND_BACK,
    };
    
    this.cullingtoglflipped = {
        "back":gl.FRONT,
        "front":gl.BACK,
        "frontAndBack":gl.FRONT_AND_BACK,
    };        

    this.streamtypetogl = {
        "bytes4":{size:4,type:gl.BYTE,normalized:true},
        "float1":{size:1,type:gl.FLOAT,normalized:false},
        "float2":{size:2,type:gl.FLOAT,normalized:false},
        "float3":{size:3,type:gl.FLOAT,normalized:false},
        "float4":{size:4,type:gl.FLOAT,normalized:false}            
    };         
    
    this.blendtogl = {
        "zero":gl.ZERO,
        "one":gl.ONE,
        "sourceAlpha":gl.SRC_ALPHA,
        "sourceColor":gl.SRC_COLOR,
        "oneMinusSourceAlpha":gl.ONE_MINUS_SRC_ALPHA,
        "oneMinusSourceColor":gl.ONE_MINUS_SRC_COLOR,
        "destinationAlpha":gl.DST_ALPHA,
        "destinationColor":gl.DST_COLOR,
        "oneMinusDestination_alpha":gl.ONE_MINUS_DST_ALPHA,
        "oneMinusDestination_color":gl.ONE_MINUS_DST_COLOR
    };
    
    this.comparetogl = {
        "always":gl.ALWAYS,
        "never":gl.NEVER,
        "equal":gl.EQUAL,
        "less":gl.LESS,
        "lessEqual":gl.LEQUAL,                        
        "greater":gl.GREATER,
        "greaterEqual":gl.GEQUAL,            
        "notEqual":gl.NOTEQUAL
    };
    
    this.cubesidetogl = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,        
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,        
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,        
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z                
    ];
        
    this.stenciltogl = {        
        "decrementSaturate":gl.DECR,
        "decrementWrap":gl.DECR_WRAP,
        "incrementSaturate":gl.INCR,
        "incrementWrap":gl.INCR_WRAP,
        "invert":gl.INVERT, 
        "keep":gl.KEEP,
        "set":gl.REPLACE,
        "zero":gl.ZERO
    };
    
    this.minfilter_nearest_togl = [gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR];
    this.minfilter_linear_togl = [gl.LINEAR, gl.LINEAR_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_LINEAR];    
    
    this.glerrortostring = { };
    this.glerrortostring[gl.OUT_OF_MEMORY] = "Out of memory";
    this.glerrortostring[gl.INVALID_ENUM] = "Invalid enum";
    this.glerrortostring[gl.INVALID_OPERATION] = "Invalid operation";
    this.glerrortostring[gl.INVALID_FRAMEBUFFER_OPERATION] = "Invalid framebuffer operation";
    this.glerrortostring[gl.INVALID_VALUE] = "Invalid value";
    this.glerrortostring[gl.NO_ERROR] = "No error";
    this.glerrortostring[gl.CONTEXT_LOST_WEBGL] = "Context lost";
    
    this.gl = gl;
    this.resetState ( );         
        
    try {
        callback(this);
    }
    catch (e) {
        console.log("Callback failed during WebGL initialization with '" + e.toString() + "'");
        return false;
    }
    return true; 
}
