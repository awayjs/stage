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

// test entry point
//
// new test, test some render to texture effect, the old feedback loop 
function Test_RTTFX ( testenv ) {        
    var ctx;         
    
    // just renders quads
    var vertexbuffer, indexbuffer, program;    
    var texsprite, texbuffers = [];
    var flipbuffers = 0; 
    var sprites;     
    var nsprites = 80; 
    var nkeys = 40; 
        
    function makeRandomSprites ( count ) {
        var dest = [];
        for ( var i=0; i<count; i++ ) {
            dest[i] = {
                x:Math.random()*2-1,
                y:Math.random()*2-1,
                r:Math.random() * 360,                
                s:.01+Math.random() *.1,
                cr:Math.random(),
                cg:Math.random(),
                cb:Math.random()
            };
        }    
        return dest;
    }    
    
    function lerp ( a,b,tf ) { return a+(b-a)*tf; }
    
    function OnEnterFrame ( t ) { 
        // frame code        
        t*= .15;
                
        ctx.setProgram( program );
        ctx.setVertexBufferAt( 0, vertexbuffer, 0, Context3DVertexBufferFormat.FLOAT_2 );
        ctx.setVertexBufferAt( 1, vertexbuffer, 2, Context3DVertexBufferFormat.FLOAT_2 );        
        
        // to texture buffer 1: 
        ctx.setRenderToTexture ( texbuffers[flipbuffers] );
        ctx.clear ( 0,0,0,1 ); 
        
        // render a couple of random sprites
        var aspect = testenv.h / testenv.w;
        var matrix = new Matrix3D();        
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, matrix, true );
        ctx.setTextureAt ( 0, texsprite );        
        ctx.setBlendFactors ( Context3DBlendFactor.ONE, Context3DBlendFactor.ONE );        
        sprites_a = sprites[(t%nkeys)>>>0];
        sprites_b = sprites[((t+1)%nkeys)>>>0];
        var tf = t%1; 
        for ( var i=0; i<nsprites; i++ ) {
            matrix.identity();
            matrix.appendRotation( lerp(sprites_a[i].r,sprites_b[i].r,tf), Matrix3D.Z_AXIS );
            var s = lerp(sprites_a[i].s, sprites_b[i].s,tf);
            matrix.appendScale ( s,s*aspect, 1 ); 
            matrix.appendTranslation ( lerp(sprites_a[i].x,sprites_b[i].x,tf), lerp(sprites_a[i].y,sprites_b[i].y,tf), 0 );            
            ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );                                    
            ctx.setProgramConstants ( Context3DProgramType.FRAGMENT, 0, 
                                     lerp(sprites_a[i].cr,sprites_b[i].cr,tf), 
                                     lerp(sprites_a[i].cg,sprites_b[i].cg,tf), 
                                     lerp(sprites_a[i].cb,sprites_b[i].cb,tf), 
                                     1 );           
            
            ctx.drawTriangles ( indexbuffer );
        }
        
        // render previous texture on top to blend... todo
        ctx.setTextureAt ( 0, texbuffers[flipbuffers^1] );     
        for ( var i = 0; i<4; i++ ) {
            matrix.identity();
            ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, matrix, true );
            var extrude = 1.025;
            var ocm = 1/10; 
            var dx = (testenv.mx / testenv.w)-.5;            
            if ( i&1 ) dx = -dx;
            var dy = (testenv.my / testenv.h)-.5;                                
            if ( i&2 ) dy = -dy;
            matrix.appendTranslation ( dx*ocm, dy*ocm, 0 );
            matrix.scale ( extrude, extrude, 1 );                    
            ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );    
            var dampen = .22;
            ctx.setProgramConstants ( Context3DProgramType.FRAGMENT, 0, dampen, dampen, dampen, 1 );   
            ctx.drawTriangles ( indexbuffer );            
        }
        
        // to back buffer, render at screen size
        ctx.setBlendFactors ( Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO );
        ctx.setRenderToTexture ( null); 
        ctx.setTextureAt ( 0, texbuffers[flipbuffers] );     
        matrix.identity();
        ctx.setProgramConstants ( Context3DProgramType.FRAGMENT, 0, 1, 1, 1, 1 );   
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );    
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, matrix, true );
        ctx.drawTriangles ( indexbuffer );
        
        // done            
        ctx.present ( );      
        
        flipbuffers^=1;
    }
    
    function OnContext3DCreated ( newctx ) {
        ctx = newctx; 
        
        // init code     
        indexbuffer = ctx.createIndexBuffer ( 6 )	
        indexbuffer.uploadFromArray ( [0,1,2, 0,2,3 ] )		
                
        vertexbuffer = ctx.createVertexBuffer ( 4, 4 ); // vertices, dwords per vertex	
        // x,y, u,v, r,g,b format	
        vertexbuffer.uploadFromArray ( [-1,-1, 0,0,
                                         1,-1, 1,0,
                                         1, 1, 1,1,
                                        -1, 1, 0,1 ] )				
                
        program = ctx.createProgram ( )	        
        var agalbytes = AssembleAGAL ( 
            "part fragment 1                        \n"+
            "  tex ft0, vi0, fs0, <linear,nomip>    \n" +
            "  mul ft0, ft0, fc0                    \n" +
            "  mov fo0, ft0                         \n"+
            "endpart                                \n\n"+
            "part vertex 1                          \n"+
            "  m44 vo0, va0, vc0                    \n"+
            "  m44 vi0, va1, vc4                    \n"+
            "endpart                                \n"            
        );                
        program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );
        
        texbuffers[0] = ctx.createTexture ( 512, 256, Context3DTextureFormat.BGRA );
        texbuffers[1] = ctx.createTexture ( 512, 256, Context3DTextureFormat.BGRA );
             
        texsprite = ctx.createTexture ( 32,32, Context3DTextureFormat.BGRA );             
        var imageObj = new Image();
        imageObj.src = "res/blob.jpg"; 
        imageObj.onload = function ( ) { 
            texsprite.uploadFromImage ( imageObj, 0 ); 
            // anim handling
            testenv.startOnEnterFrame ( OnEnterFrame ); 
        } 
            
        sprites = [];
        for ( var i=0; i<nkeys; i++ ) 
            sprites[i] = makeRandomSprites ( nsprites );                           
    }
    
    function OnAbortTest ( ) {
        // automatically removes frame handler       
        if ( ctx ) 
            ctx.dispose();          
        else throw "No WebGL context.";
    }
    
    testenv.abortcallback = OnAbortTest; 
    RequestContext3D ( testenv.canvas, OnContext3DCreated, testenv.testmode );
}


// register test
testregistry.push ( {name:"Feedback", srcuri:"rttfx.js", f:Test_RTTFX, timeout:4000 } ); 