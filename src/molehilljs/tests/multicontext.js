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
function Test_MultiContext ( testenv ) {        
    
    var instances;
    
    function OnEnterFrame ( t ) {      
        for ( var i=0; i<instances.length; i++ ) {
            var instance = instances[i];
            var ctx = instance.ctx;
            if ( !ctx ) continue; 
            // frame code
            var matrix = new Matrix3D();
            
            switch ( instance.id ) {
                case 0: 
                    ctx.clear ( 0,0,t%1,1 ); 
                    matrix.appendRotation( t * 20, Matrix3D.Z_AXIS );
                    break;
                case 1: 
                    ctx.clear ( 0,t%1,0,1 ); 
                    var s = Math.sin(t)+1.5; 
                    matrix.appendRotation( t * 37, Matrix3D.Z_AXIS );
                    matrix.appendScale( s, s, 1 );
                    break;
                case 2: 
                    ctx.clear ( t%1,0,0,1 ); 
                    var s = Math.cos(t*2)*4; 
                    matrix.appendRotation( -t * 45, Matrix3D.Z_AXIS );
                    matrix.appendScale( s, s, 1 );
                    break;
                default: 
                    ctx.clear ( 0,0,0,1 );
                    matrix.appendRotation( t * 37, Matrix3D.Z_AXIS );
                    break;                    
            }
                    
            ctx.setProgram( instance.program );
            ctx.setVertexBufferAt(0, instance.vertexbuffer, 0, Context3DVertexBufferFormat.FLOAT_2);
            ctx.setVertexBufferAt(1, instance.vertexbuffer, 2, Context3DVertexBufferFormat.FLOAT_3);
            ctx.setVertexBufferAt(2, instance.vertexbuffer, 5, Context3DVertexBufferFormat.FLOAT_2);
            
            ctx.setTextureAt ( 0, instance.texture );                                 
		    ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );            
                                
            ctx.drawTriangles ( instance.indexbuffer )		        
                
            ctx.present ( );      
        }
    }
    
    function OnContext3DCreated(ctx) {
        var instance = getInstance(ctx);
        instance.ctx = ctx;
        
        // init code     
        instance.indexbuffer = ctx.createIndexBuffer ( 6 )	
        instance.indexbuffer.uploadFromArray ( [0,1,2, 0,2,3], 0, 6 )		
                
        instance.vertexbuffer = ctx.createVertexBuffer ( 4, 7 ) // vertices, dwords per vertex	
        // x,y, r,g,b, u,v format	
        instance.vertexbuffer.uploadFromArray ( [-1,-1, 0,1,0, 0,0,
                                         1,-1,  1,0,0, 1,0,
                                         1,1, 0,0,1, 1,1,
                                        -1,1, 1,1,1, 0,1], 0, 4 )									
        
        instance.program = ctx.createProgram ( )	        
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
        instance.program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );
        
        instance.texture = ctx.createTexture(256, 256, Context3DTextureFormat.BGRA);
        var imageObj = new Image();
        imageObj.src = "res/stars.png"; 
        //imageObj.src = "res/angry_wet_cat.jpg"; 
        imageObj.crossOrigin = "anonymous";
        imageObj.onload = function ( ) {
            console.log ( "Loaded image ", imageObj.width, imageObj.height );            
            instance.texture.uploadFromImage(imageObj, 0);
            instsLoaded++;
            checkAllInstancesLoaded();
        };
    }

    function getInstance(ctx) {
        var result = null;
        for (var i = 0; i < instances.length; i++) {
            result = instances[i];
            if (result.canvas.id === ctx.priv_canvas.id)
                return result;
        }
        return result;
    }

    function checkAllInstancesLoaded() {
        if (instsLoaded == TOTAL_INSTS) {
            // anim handling (one for all instances)
            testenv.startOnEnterFrame(OnEnterFrame);
        }
    }
    
    function OnAbortTest ( ) {
        // automatically removes frame handler       
        for ( var i=0; i<instances.length; i++ ) {
            var instance = instances[i];
            if ( instance.ctx ) 
                instance.ctx.dispose(instance.id != 0); // kill canvas
        }        
    }

    instsLoaded = 0;
    TOTAL_INSTS = 4;
    testenv.abortcallback = OnAbortTest; 
    
    instances = [];
    var can = testenv.canvas;
    var pnode = can.parentNode;
    for (var i = 0; i < TOTAL_INSTS; i++) {
        var instance = {};
        instance.testenv = testenv; 
        instance.id = i; 
        if ( i!=0 ) {
            instance.canvas = can.cloneNode();
            instance.canvas.id = can.id + i.toString(); // must have unique ids
            pnode.appendChild ( instance.canvas );             
        } else {
            instance.canvas = can; 
        }
        instances.push ( instance );
        RequestContext3D(instance.canvas, OnContext3DCreated, testenv.testmode);
    }    
}


// register test
testregistry.push ( {name:"Multiple Contexts", srcuri:"multicontext.js", f:Test_MultiContext, timeout:4000 } ); 