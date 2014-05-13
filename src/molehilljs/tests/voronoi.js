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

// this is the same as the AS3 voronoi test
// 
// - does not require texturing, simple shader
// - tests lots of draw calls
// - color channel masking
// - depth buffer
//
function Test_Voronoi ( testenv ) {        
    var ctx;             
    var vertexbuffer, indexbuffer, program;    
    var ntess = 16; // == triangles per point
    
    var allpoints = { red:[], green:[], blue:[] };
    
	function addRandomPoint ( points ) {
        var point = {
            x:Math.random()*2-1, y:Math.random()*2-1, radius:1,
            r:1,g:1,b:1,a:1,
            dx:Math.random()-.5,dy:Math.random()-.5, 
            ddx:0, ddy:0                             
        };
        points.push ( point );
    }
    
	function animatePoints ( points, dt ) {
        dt*=.2;
		for ( var i= 0; i<points.length; i++ ) {
            var p = points[i];
            if ( p.x < -1 || p.x > 1 ) p.dx = -p.dx;
            if ( p.y < -1 || p.y > 1 ) p.dy = -p.dy;
			p.x += p.dx * dt;
            p.y += p.dy * dt;            
		}
    }    
		        
    function renderCircles ( points ) {
        ctx.clear( 1, 1, 1, 1, 0, 0, Context3DClearMask.DEPTH | Context3DClearMask.STENCIL ); // only clear depth and stencil
			
        ctx.setProgram ( program );
        ctx.setVertexBufferAt ( 0, vertexbuffer, 0, "float4" );  					
        ctx.setDepthTest ( true, "greater" );        

        // scale and aspect
        ctx.setProgramConstants ( "vertex", 16,   1, testenv.w/testenv.h, 3/Math.sqrt(points.length), 0 );
        
        for ( var i = 0; i<points.length; i++ ) {
            var p = points[i];            
            ctx.setProgramConstants ( "vertex", 0,  p.x, p.y, 1, p.radius, 
                                                          p.r, p.g, p.b, p.a, 
                                                          p.dx, p.dy, 0, 0,
                                                          p.ddx, p.ddy, 0, 0 ); 
            ctx.drawTriangles( indexbuffer, 0, ntess );
        }
    }
    
    function OnEnterFrame ( t ) {                    	
        ctx.clear( 1, 1, 1, 1, 0, 0, Context3DClearMask.COLOR ); // only clear color	
        
        ctx.setColorMask( true, false, false, false );
        animatePoints ( allpoints.red, testenv.dt );
        renderCircles ( allpoints.red );
                    
        ctx.setColorMask( false, true, false, false );
        animatePoints ( allpoints.green, testenv.dt );
        renderCircles ( allpoints.green );
                
        ctx.setColorMask( false, false, true, false );
        animatePoints ( allpoints.blue, testenv.dt );
        renderCircles ( allpoints.blue );                
					            
        ctx.present ( );      
    }
    
    function OnContext3DCreated ( newctx ) {
        ctx = newctx; 
                      
        // buffer that holds a circle
        var r = 1.0; 
        indexbuffer = ctx.createIndexBuffer ( ntess*3 );
        vertexbuffer = ctx.createVertexBuffer ( ntess+1, 4 ); // 4 floats per vertex xy, r, angle
        // center vertex, first vertex
        var vdata = new ByteArray;         
        vdata.writeFloat ( 0 ); 
        vdata.writeFloat ( 0 ); 
        vdata.writeFloat ( 1 );  
        vdata.writeFloat ( 0 );  
        
        var idata = new ByteArray;                 
        for ( var tess = 0; tess < ntess; tess++ ) {
            var tn = tess/ntess; 									
            vdata.writeFloat ( Math.sin(tn*2*Math.PI)*r ); 
            vdata.writeFloat ( Math.cos(tn*2*Math.PI)*r );
            vdata.writeFloat ( 0 );  
            vdata.writeFloat ( tn );								  				
            idata.writeUnsignedShort( 0 );
            if ( tess!=0 ) {
                idata.writeUnsignedShort( tess );
                idata.writeUnsignedShort( tess+1 );					
            } else {
                idata.writeUnsignedShort( tess+1 );
                idata.writeUnsignedShort( ntess );										
            }				
        }
        indexbuffer.uploadFromByteArray(idata,0,0,ntess*3);
        vertexbuffer.uploadFromByteArray(vdata,0,0,ntess+1); 		        
        
        // program
        program = ctx.createProgram ( )	        
        var agalbytes = AssembleAGAL ( 
            "part fragment 1                    \n"+            
            "  mul ft0, vi0, vi0 	            \n" +		// square color
            "  mov fo0, ft0			            \n" + 		// output                                                          
            "endpart                            \n\n"+
            "part vertex 1                      \n"+
            "  mul vt0.xy, va0.xy, vc16.z		\n" +	   // c0=posx,posy,1,strength  va0 = dx,dy,r,angle
            "  add vt0.xy, vt0.xy, vc0.xy		\n" +	   // 
            "  mul vt0.xy, vt0.xy, vc16.xy      \n" +      // scale by screen aspect
            "  mov vt0.z, va0.z                 \n" +      // z==r 
            "  mov vt0.w, vc0.z                 \n" +      // w==1				
            "  sub vt1.x, vc0.z, va0.z          \n" +      // invert dist
            "  mul vi0, vc1, vt1.x	            \n" +	   // copy color							
            "  mov vo0, vt0                     \n" +                                                                                          
            "endpart                            \n"            
        );                
        program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );        
        
        // some initial random points
        for ( var np = 0; np<256; np++ ) {
            addRandomPoint ( allpoints.red );
            addRandomPoint ( allpoints.green );	
			addRandomPoint ( allpoints.blue );	
        }        
   
        // anim handling
        testenv.startOnEnterFrame ( OnEnterFrame );        
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
testregistry.push ( {name:"Voronoi", srcuri:"voronoi.js", f:Test_Voronoi } ); 