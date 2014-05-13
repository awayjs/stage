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
    
function Context3D () { // do not new this object, use global RequestContext3D    
    // set if failed drawing will throw or be silently ignored    
    // enable error checks is A LOT slower        
    // TODO: make a property
    this.enableErrorChecking = false;    
    this.resources = []; 
    this.driverInfo = "Call getter function instead"; 
} 

// 
// ------------------------------------------------ Constants -----------------------------------------------------
//
Context3D.maxvertexconstants = 128; 
Context3D.maxfragconstants = 28; 
Context3D.maxtemp = 8;
Context3D.maxstreams = 8; 
Context3D.maxtextures = 8;   
Context3D.defaultsampler = { lodbias:0, dim:0, readmode:0, special:0, wrap:0, mipmap:0, filter:0 };

Context3D.makeReverseEnumTable = function ( obj ) {
    var r = { };
    for ( name in obj ) r[obj[name]] = name; 
    return r; 
}

function Context3DVertexBufferFormat ( ) { }; 
Context3DVertexBufferFormat.BYTES_4 = "bytes4";
Context3DVertexBufferFormat.FLOAT_1 = "float1";
Context3DVertexBufferFormat.FLOAT_2 = "float2";
Context3DVertexBufferFormat.FLOAT_3 = "float3";
Context3DVertexBufferFormat.FLOAT_4 = "float4";
Context3DVertexBufferFormat.reverse = Context3D.makeReverseEnumTable ( Context3DVertexBufferFormat ); 

function Context3DProgramType ( ) { };
Context3DProgramType.VERTEX = "vertex";
Context3DProgramType.FRAGMENT = "fragment";
Context3DProgramType.reverse = Context3D.makeReverseEnumTable ( Context3DProgramType ); 
        
function Context3DCompareMode ( ) { };
Context3DCompareMode.ALWAYS = "always";
Context3DCompareMode.NEVER = "never";
Context3DCompareMode.EQUAL = "equal";
Context3DCompareMode.LESS = "less";
Context3DCompareMode.LESS_EQUAL = "lessEqual";
Context3DCompareMode.GREATER = "greater";
Context3DCompareMode.GREATER_EQUAL = "greaterEqual";
Context3DCompareMode.NOT_EQUAL = "notEqual";
Context3DCompareMode.reverse = Context3D.makeReverseEnumTable ( Context3DCompareMode ); 

function Context3DStencilAction ( ) { };
Context3DStencilAction.DECREMENT_SATURATE = "decrementSaturate";
Context3DStencilAction.DECREMENT_WRAP = "decrementWrap";
Context3DStencilAction.INCREMENT_SATURATE = "incrementSaturate";
Context3DStencilAction.INCREMENT_WRAP = "incrementWrap";
Context3DStencilAction.INVERT = "invert";
Context3DStencilAction.KEEP = "keep";
Context3DStencilAction.SET = "set";
Context3DStencilAction.ZERO = "zero";
Context3DStencilAction.reverse = Context3D.makeReverseEnumTable ( Context3DStencilAction ); 

function Context3DTriangleFace ( ) { };
Context3DTriangleFace.FRONT = "front";
Context3DTriangleFace.BACK = "back";
Context3DTriangleFace.NONE = "none";
Context3DTriangleFace.FRONT_AND_BACK = "frontAndBack";
Context3DTriangleFace.reverse = Context3D.makeReverseEnumTable ( Context3DTriangleFace ); 
    
function Context3DTextureFormat ( ) { };
Context3DTextureFormat.BGRA = "bgra"
Context3DTextureFormat.COMPRESSED = "compressed"
Context3DTextureFormat.COMPRESSED_ALPHA = "compressedAlpha"
Context3DTextureFormat.reverse = Context3D.makeReverseEnumTable ( Context3DTextureFormat ); 
        
function Context3DClearMask ( ) { };
Context3DClearMask.COLOR = 1;
Context3DClearMask.DEPTH = 2;
Context3DClearMask.STENCIL = 4;
Context3DClearMask.reverse = Context3D.makeReverseEnumTable ( Context3DClearMask ); 

function Context3DBlendFactor ( ) { };
Context3DBlendFactor.ZERO = "zero";
Context3DBlendFactor.ONE = "one";
Context3DBlendFactor.SOURCE_ALPHA = "sourceAlpha";
Context3DBlendFactor.SOURCE_COLOR = "sourceColor";
Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA = "oneMinusSourceAlpha";
Context3DBlendFactor.ONE_MINUS_SOURCE_COLOR = "oneMinusSourceColor";
Context3DBlendFactor.DESTINATION_ALPHA = "destinationAlpha";
Context3DBlendFactor.DESTINATION_COLOR = "destinationColor";
Context3DBlendFactor.ONE_MINUS_DESTINATION_ALPHA = "oneMinusDestinationAlpha";
Context3DBlendFactor.ONE_MINUS_DESTINATION_COLOR = "oneMinusDestinationColor";
Context3DBlendFactor.reverse = Context3D.makeReverseEnumTable ( Context3DBlendFactor ); 

function Context3DWrapMode ( ) { }; 	
Context3DWrapMode.CLAMP = "clamp";
Context3DWrapMode.REPEAT = "repeat";
Context3DWrapMode.reverse = Context3D.makeReverseEnumTable ( Context3DWrapMode ); 

function Context3DMipFilter ( ) { };
Context3DMipFilter.MIPLINEAR = "miplinear";
Context3DMipFilter.MIPNEAREST = "mipnearest";
Context3DMipFilter.MIPNONE = "mipnone";
Context3DMipFilter.reverse = Context3D.makeReverseEnumTable ( Context3DMipFilter ); 

function Context3DTextureFilter ( ) { }
Context3DTextureFilter.LINEAR = "linear";
Context3DTextureFilter.NEAREST = "nearest";
Context3DTextureFilter.reverse = Context3D.makeReverseEnumTable ( Context3DTextureFilter ); 

function Context3DMode ( ) { };
Context3DMode.AUTO = "auto";        // whatever works
Context3DMode.WEBGL = "webgl";      // only try webgl, fail if not there
Context3DMode.FLASH = "flash";      // only try flash, fail if not there   
Context3DMode.NATIVE = "native";    // only try native, fail if not there
Context3DMode.reverse = Context3D.makeReverseEnumTable ( Context3DMode ); 

// 
// ------------------------------------------------ Functions -----------------------------------------------------
//
// All of those are overwritten by implementations and here only for documentation/stubbing. 
/*
Context3D.setProgram = function ( prog ) {}    
Context3D.setScissorRectangle = function ( rect ) { }// rect is [x,y,w,h] array or null to disable 
Context3D.setRenderToTexture = function ( target, depthtarget, aa ) { }       
Context3D.setDepthTest = function ( depthWrite, comparisonFunc ) { }
Context3D.setCulling = function ( cullAway ) { }
Context3D.setBlendFactors = function ( srcFactor, destFactor ) { }
Context3D.setColorMask = function ( r,g,b,a ) { }
Context3D.setVertexBufferAt = function ( streamindex, buffer, offsetinbuffer, datatype ) { }
Context3D.setTextureAt = function ( sampler, texture ) { }
Context3D.setStencilActions = function ( triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail ) { }
Context3D.setStencilReferenceValue = function ( referenceValue, readMask, writeMask ) { }
Context3D.setProgramConstant = function ( target, register, x, y, z, w ) { }
*/
// expanded default implementation of type based helpers
Context3D.setProgramConstants = function ( target, firstregister /*...*/ ) {
    for ( var i=2; i<arguments.length-3; i+=4 ) {
        this.setProgramConstant(target, firstregister, arguments[i], arguments[i+1], arguments[i+2], arguments[i+3]);
        firstregister++; 
    }
}

Context3D.setProgramConstantsFromMatrix = function ( target, firstregister, matrix, transpose ) {
    if ( !transpose ) {
        this.setProgramConstant ( target, firstregister, matrix.data[0], matrix.data[1], matrix.data[2], matrix.data[3] );
        this.setProgramConstant ( target, firstregister+1, matrix.data[4], matrix.data[5], matrix.data[6], matrix.data[7] );
        this.setProgramConstant ( target, firstregister+2, matrix.data[8], matrix.data[9], matrix.data[10], matrix.data[11] );
        this.setProgramConstant ( target, firstregister+3, matrix.data[12], matrix.data[13], matrix.data[14], matrix.data[15] );
    } else {
        this.setProgramConstant ( target, firstregister, matrix.data[0], matrix.data[4], matrix.data[8], matrix.data[12] );
        this.setProgramConstant ( target, firstregister+1, matrix.data[1], matrix.data[5], matrix.data[9], matrix.data[13] );
        this.setProgramConstant ( target, firstregister+2, matrix.data[2], matrix.data[6], matrix.data[10], matrix.data[14] );
        this.setProgramConstant ( target, firstregister+3, matrix.data[3], matrix.data[7], matrix.data[11], matrix.data[15] );            
    }
}

Context3D.setProgramConstantsFromArray = function ( target, firstregister, arrayofnumbers, registercount ) {
    registercount=registercount|0;
    if ( registercount===0 ) registercount = arrayofnumbers.length/4; 
    for ( var i=0; i<registercount; i++ ) 
        this.setProgramConstant ( target, firstregister+i, arrayofnumbers[i*4+0], arrayofnumbers[i*4+1], arrayofnumbers[i*4+2], arrayofnumbers[i*4+3] );
}

Context3D.setRenderToBackBuffer = function () {
    this.setRenderToTexture ( null );
}

Context3D.getDriverInfo = function ( ) {    
    return "No driver info. Needs implementation.";     
}
                             
// 
// ------------------------------------------------ Program & AGAL -----------------------------------------------------
//
Context3D.createProgram = function ( ) { }
Context3D.Program = function ( ) { }
/*
Context3D.Program.uploadFromAGALByteArray = function (vsbytes, fsbytes) { }
Context3D.Program.uploadFromGLSLString = function(vssource,fssource) { }
Context3D.Program.dispose = function() { }
Context3D.Program.isDisposed = function() { return true; }
*/
//
// ------------------------------------------------ Index Buffer -----------------------------------------------------
//
Context3D.createIndexBuffer = function ( numindices ) { }
Context3D.IndexBuffer = function ( ) { }       
/*
Context3D.IndexBuffer.uploadFromByteArray = function(data,offset,srcoffset,count) { }
Context3D.IndexBuffer.uploadFromArray = function(data,offset,count) { }
Context3D.IndexBuffer.dispose = function() { }
Context3D.IndexBuffer.isDisposed = function() { return true; };
*/
//
// ------------------------------------------------ Vertex Buffer -----------------------------------------------------
//
Context3D.createVertexBuffer = function ( numvertices, dwordspervertex ) {}
Context3D.VertexBuffer = function ( ) {}
/*
Context3D.VertexBuffer.uploadFromByteArray = function(data,offset,srcoffset,count) { }
Context3D.VertexBuffer.uploadFromArray = function(data,offset,count) { }
Context3D.VertexBuffer.dispose = function() { }
Context3D.VertexBuffer.isDisposed = function() { return true; }
*/
// 
// ------------------------------------------------ Cube Texture -----------------------------------------------------
//
Context3D.createCubeTexture = function ( size, format, forRTT, streaming ) { }
Context3D.CubeTexture = function ( ) { }        
/*
Context3D.CubeTexture.uploadFromImage = function( obj, side, level ) { }
Context3D.CubeTexture.uploadFromUint8Array = function( obj, side, level ) { } 
Context3D.CubeTexture.dispose = function() { }
Context3D.CubeTexture.isDisposed = function() { return true; }
*/
// 
// ------------------------------------------------ 2D Texture -----------------------------------------------------
//
Context3D.createTexture = function ( w, h, format, forRTT, streaming ) { }
Context3D.Texture = function ( ) { }
/*
Context3D.Texture.uploadFromImage = function( obj, level ) {  }
Context3D.Texture.uploadFromUint8Array = function( array, level ) { }
Context3D.Texture.dispose = function() {}      
Context3D.Texture.isDisposed = function() { return true; }
*/  
// 
// ------------------------------------------------ Drawing -----------------------------------------------------
//
/*
Context3D.drawTriangles = function ( indexbuffer, offsetinbuffer, numtriangles ) {}
Context3D.clear = function (r,g,b,a,depth,stencil,mask) { }
Context3D.drawToObject = function ( dest ) { } 

Context3D.present = function ( ) { }
Context3D.dispose = function (removecanvas) { }
Context3D.isDisposed = function ( ) { return true }
*/
// 
// ------------------------------------------------ Private common helpers -----------------------------------------------------
//

Context3D.priv_addResource = function ( r ) {    
    this.resources.push(r);
    r.priv_parent = this;
}

Context3D.priv_removeResource = function ( r ) {
    var idx = this.resources.indexOf ( r ); 
    if ( idx>=0 ) {
        if ( idx<(this.resources.length-1) ) this.resources[idx] = this.resources.pop(); 
        else this.resources.pop();         
    }
    r.priv_parent = null;
}

Context3D.checkIsValidEnumOrNull = function ( obj, enumclass ) {    
    if ( obj && !enumclass.reverse[obj] ) {
        var allenums;
        for ( name in enumclass.reverse ) {
            if ( !allenums ) allenums = "["+name;
            else allenums+=", "+name;
        }
        allenums+="]";        
        throw "Parameter error, the parameter is not a valid enum in "+enumclass.toString()+" "+allenums; 
    }    
}

Context3D.checkIsValidEnum = function ( obj, enumclass ) {    
    if ( !obj ) 
        throw "Parameter error, enum paramater is not a string."; 
    Context3D.checkIsValidEnumOrNull ( obj, enumclass );    
}

Context3D.checkIsValidObject = function ( obj, objtype ) {     
    if ( obj ) {
        if ( !obj.priv_restype || !(obj.priv_restype===objtype) ) 
            throw "Parameter error, expected "+objtype;               
        if ( !obj.priv_parent || !(obj.priv_parent===this) ) 
            throw "Parameter error, not valid on this context"; 
        if ( !obj.isDisposed || obj.isDisposed() )
            throw "Parameter error, object was disposed";                     
    } else {
        if ( !(obj===null) ) 
            throw "Parameter error, object must be valid or null"; 
    }
}

Context3D.clipRectangle = function( clippee, clipper ) { // modifies clippee, rectangles are [ x,y,w,h ], static helper
    if ( !(clipper[2]>0 && clipper[3]>=0) ) {
        clipee[2] = 0; clippee[3] = 0; 
        return false; 
    }
    //x
    if ( clippee[0] < clipper[0] ) {
        clippee[2] -= clipper[0]-clippee[0]; 
        clippee[0] = clipper[0];
    }
    if ( clippee[0]+clippee[2] > clipper[0]+clipper[2] ) 
        clippee[2] = (clipper[0]+clipper[2])-clippee[0];
    if ( !(clippee[2]>0) ) return false; 
    //y
    if ( clippee[1] < clipper[1] ) {
        clippee[3] -= clipper[1]-clippee[1]; 
        clippee[1] = clipper[1];
    }
    if ( clippee[1]+clippee[3] > clipper[1]+clipper[3] ) 
        clippee[3] = (clipper[1]+clipper[3])-clippee[1];    
    if ( !(clippee[3]>0) ) return false;         
    return true; 
}

Context3D.isPowerOfTwoInt = function ( x ) { return x && x>0 && (x&(x-1))===0; }

Context3D.extendOrCropImage = function ( srcimg, w, h ) {
    if ( srcimg.width == w && srcimg.height == h ) return srcimg;             
    if ( !(srcimg.width > 0 && srcimg.height > 0 ) )
        throw "Source image width and height are not valid: "+ srcimg.width +"," +srcimg.height;        
    console.log ( "Performance warning: Need to crop image for texture upload from",srcimg.width,srcimg.height,"to",w,h );
    destcanvas = document.createElement("canvas")
    destcanvas.width = w;
    destcanvas.height = h;
    c2d = destcanvas.getContext("2d");                            
    c2d.fillStyle="#000000";
    c2d.fillRect(0,0,w,h);            
    c2d.drawImage ( srcimg, 0,0 );                                
    return destcanvas;             
}


// 
// ------------------------------------------------ Global Init -----------------------------------------------------
//
function RequestContext3D ( acanvas, callback, mode ) {             
    // TODO: 
    // this should be split into optionally two files, and RequestContext3D could include a 
    // loader onload function that loads all the required actual js, so that just including molehill via <script> is basically free.    
    var ctx3Dobj = new Context3D();
    
    // initialize with default empty members
    for ( name in Context3D ) 
        ctx3Dobj[name] = Context3D[name]; 
    
    ctx3Dobj.priv_canvas = acanvas;
    ctx3Dobj.requestmode = mode; 
        
    // init using webgl    
    if ( !mode || mode===Context3DMode.AUTO || mode===Context3DMode.WEBGL ) {        
        if ( !Context3DWebGL ) throw "todo: this should load molehill_webgl.js now"; 
        try {            
            for (var name in Context3DWebGL ) 
                ctx3Dobj[name] = Context3DWebGL[name];
            Object.defineProperty(ctx3Dobj, "driverInfo", { get: ctx3Dobj.getDriverInfo });
            if ( ctx3Dobj.priv_init ( acanvas, callback ) ) 
                return true;         
        } catch(e) {                        
            console.log ( "Failed to get webgl context." + e.toString() );             
        }                             
        if ( mode===Context3DMode.WEBGL ) return false; 
        // fallthrough and try next
    }
    
    // init using flash
    if ( !mode || mode===Context3DMode.AUTO || mode===Context3DMode.FLASH ) {                 
        if ( !Context3DFlash ) throw "todo: this should load mountain_flash.js now"; 
        try {            
            for (var name in Context3DFlash ) 
                ctx3Dobj[name] = Context3DFlash[name];            
            Object.defineProperty(ctx3Dobj, "driverInfo", { get: ctx3Dobj.getDriverInfo });
            Object.defineProperty(ctx3Dobj, "enableErrorChecking", { get: ctx3Dobj.getErrorCheckingEnabled, set: ctx3Dobj.setErrorCheckingEnabled });
            if (ctx3Dobj.priv_init(acanvas, callback))
                return true;                     
        } catch(e) {
            console.log ( "Failed to initialize flash bridge." + e.toString() );             
            if ( mode===Context3DMode.FLASH ) return false; // -- error in callback?  
        }                                     
        // fallthrough and try next
    }    
    // no more modes to try
    console.log("No molehill available.");
    return false;
}
    

