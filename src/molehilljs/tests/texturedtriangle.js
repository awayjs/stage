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
function Test_TexturedTriangle ( testenv ) {        
    var ctx;         
    
    var vertexbuffer, indexbuffer, program, texture;    
    
    function OnEnterFrame ( t ) {        
        // frame code
        ctx.clear ( 0,0,t%1,1 ); 
                
        ctx.setProgram( program );
        ctx.setVertexBufferAt( 0, vertexbuffer, 0, Context3DVertexBufferFormat.FLOAT_2 );
        ctx.setVertexBufferAt( 1, vertexbuffer, 2, Context3DVertexBufferFormat.FLOAT_3 );
        ctx.setVertexBufferAt( 2, vertexbuffer, 5, Context3DVertexBufferFormat.FLOAT_2 );
        
        ctx.setTextureAt ( 0, texture ); 
                    
        cosa = Math.cos ( t )
        sina = Math.sin ( t )
        
        ctx.setProgramConstants( "vertex", 0,    cosa, sina, 0, 0 
                                            ,   -sina, cosa, 0, 0  
                                            ,          0, 0, 1, 0  
                                            ,          0, 0, 0, 1  );		
                            
        ctx.drawTriangles ( indexbuffer, 0, 1 )		        
            
        ctx.present ( );      
    }
    
    function OnContext3DCreated ( newctx ) {
        ctx = newctx; 
        
        // init code     
        indexbuffer = ctx.createIndexBuffer ( 3 )	
        indexbuffer.uploadFromArray ( [0,1,2], 0, 3 )		
                
        vertexbuffer = ctx.createVertexBuffer ( 3, 7 ) // vertices, dwords per vertex	
        // x,y, r,g,b, u,v format	
        vertexbuffer.uploadFromArray ( [-1,-1, 0,1,0, 0,0,
                                         0,1,  1,0,0, 1,0,
                                         1,-1, 0,0,1, 0,1  ], 0, 3 )									
        
        program = ctx.createProgram ( )	        
        var agalbytes = AssembleAGAL ( 
            "part fragment 1                    \n"+
            "  mov ft0, vi0                     \n"+
            "  tex ft1, vi1, fs0, <linear>      \n"+
            "  mul fo0, ft0, ft1                \n" +            
            "endpart                            \n\n"+
            "part vertex 1                      \n"+
            "//  m44 vo0, va0, vc0  \n"+
            "  dp4 vo0.x, va0, vc0  \n"+
            "  dp4 vo0.y, va0, vc1  \n"+
            "  dp4 vo0.z, va0, vc2  \n"+
            "  dp4 vo0.w, va0, vc3  \n"+
            "  mov vi1, va2         \n"+
            "  mov vi0, va1.xyzw    \n"+
            "endpart              \n"            
        );                
        program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );
        
        texture = ctx.createTexture ( 256,256, Context3DTextureFormat.BGRA );             
        var imageObj = new Image();
        imageObj.src = "res/stars.png"; 
        //imageObj.src = "res/angry_wet_cat.jpg"; 
        imageObj.crossOrigin = "anonymous";
        imageObj.onload = function ( ) {
            console.log ( "Loaded image ", imageObj.width, imageObj.height );
            try {                
                texture.uploadFromImage ( imageObj, 0 );                        
            } catch ( e ) {
                console.log ( "Upload failed, this is most likely due to CORS.\n"+
                              "Either run python -m http.server from the index.html directory and use localhost:8000/index.html or\n" +
                              "disable CORS for local files in your browser.\n" );                 
                // upload some noise instead
                var imgData = new Uint8Array ( 256*256*4 );
                for ( var i=0; i<256*256*4; i++ ) 
                    imgData[i] = Math.random()*255;                     
                texture.uploadFromUint8Array ( imgData, 0 );                                                        
            }
            // anim handling
            testenv.startOnEnterFrame(OnEnterFrame);
        };
                                        
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
testregistry.push ( {name:"Textured Triangle", srcuri:"texturedtriangle.js", f:Test_TexturedTriangle, timeout:4000 } ); 