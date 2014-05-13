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
function Test_BasicTriangle ( testenv ) {        
    var ctx;         
    
    var vertexbuffer, indexbuffer, program;    
    
    function OnEnterFrame ( t ) {        
        // frame code
        ctx.clear ( 0,0,t%1,1 ); 
                
        ctx.setProgram( program );
        ctx.setVertexBufferAt( 0, vertexbuffer, 0, Context3DVertexBufferFormat.FLOAT_2 );
        ctx.setVertexBufferAt( 1, vertexbuffer, 2, Context3DVertexBufferFormat.FLOAT_3 );
        
        var matrix = new Matrix3D();
        matrix.appendRotation( t * 20, Matrix3D.Z_AXIS );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );
                                    
        ctx.drawTriangles ( indexbuffer, 0, 1 )		        
            
        ctx.present ( );      
    }
    
    function OnContext3DCreated ( newctx ) {
        ctx = newctx; 
        
        // init code     
        indexbuffer = ctx.createIndexBuffer ( 3 )	
        indexbuffer.uploadFromArray ( [0,1,2], 0, 3 )		
                
        vertexbuffer = ctx.createVertexBuffer ( 3, 5 ) // vertices, dwords per vertex	
        // x,y, r,g,b format	
        vertexbuffer.uploadFromArray ( [-1,-1, 0,1,0,
                                         0,1,  1,0,0,
                                         1,-1, 0,0,1], 0, 3 )				
                
        program = ctx.createProgram ( )	        
        var agalbytes = AssembleAGAL ( 
            "part fragment 1    // jay  \n"+
            "  mov fo0, vi0       \n"+
            "endpart                  \n\n"+
            "part vertex 1        \n"+
            "//  m44 vo0, va0, vc0  \n"+
            "  dp4 vo0.x, va0, vc0  \n"+
            "  dp4 vo0.y, va0, vc1  \n"+
            "  dp4 vo0.z, va0, vc2  \n"+
            "  dp4 vo0.w, va0, vc3  \n"+
            "  mov vi0, va1.xyzw  \n"+
            "endpart              \n"            
        );                
        program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );

                            
        // anim handling
        testenv.startOnEnterFrame ( OnEnterFrame );        
        
        console.log ( ctx.driverInfo );
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
testregistry.push ( {name:"Basic Triangle", srcuri:"basictriangle.js", f:Test_BasicTriangle } ); 