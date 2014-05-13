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
function Test_ZBuffer( testenv ) {
				
	var ctx;
	var indexBuffer;
	var vertexBuffer;
	var shaderProgram;

	function OnContext3DCreated ( newctx ) {
		ctx = newctx;
		// programs			
		var agalbytes = AssembleAGAL(
			"part fragment 1			    \n"+
			"mov oc, fc0 					\n" + 			// just output constant color 0  
			"endpart						\n\n"+
			"part vertex 1					\n" +
			"m44 vt0, va0, vc0  			\n" +  	// 4x4 matrix transform from object to world space
			"m44 vt1, vt0, vc4  			\n" +  	// 4x4 matrix transform from world space to eye space 
			"m44 op, vt1, vc8   			\n" +
			"endpart						\n"
		);  // 4x4 matrix transform from eye space to output clipspace										

		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data);
		
		// buffers, just a unit quad			
		indexBuffer = ctx.createIndexBuffer( 6 ); // quad index buffer
		indexBuffer.uploadFromArray([ 0,1,3, 1,2,3 ], 0, 6 );  			 			
		vertexBuffer = ctx.createVertexBuffer( 4, 4 ); // 4 vertices, 4 floats per vertex
		vertexBuffer.uploadFromArray( // unit quad in x/y plane
				[
					// x,y,z,w  format
					-1,-1,0,1,   
					1,-1,0,1, 
					1,1,0,1,  
					-1,1,0,1, 
				],
			0, 4
		);

		// anim handling
        testenv.startOnEnterFrame ( OnEnterFrame );   
	}
		
	function DrawPlaneAtZ ( z, zNear, zFar, r, g, b,
							objectmatrix) {			
		var cameramatrix;
		var projectionmatrix;
						
		ctx.setProgramConstants( Context3DProgramType.FRAGMENT, 0, r, g, b, 1 ); 
			
		if ( objectmatrix == null ) objectmatrix = new Matrix3D();					
		cameramatrix = new Matrix3D();
		cameramatrix.appendTranslation( 0, 0, z ); // move camera back along z axis	- this means the plane is at -2 in eyespace		
		projectionmatrix = new Matrix3D();
		projectionmatrix.projection( zNear, zFar, 30, 4/3 ); // near clip at 1, far at 4 
			
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, objectmatrix, true );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, cameramatrix, true );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 8, projectionmatrix, true );
			
		ctx.drawTriangles( indexBuffer, 0, 2 ); 			
	} 
			
	function OnEnterFrame ( t ) { 
        ctx.enableErrorChecking = true; 
		ctx.clear( 0.6, 0.1, 0.6, 1, 1.0 );		
			
		// enable depth test
		ctx.setDepthTest( true, Context3DCompareMode.LESS_EQUAL );
		ctx.setCulling( Context3DTriangleFace.BACK );			
			 
		ctx.setProgram ( shaderProgram );
		ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_4 );
		// explicitly specify z and w. should not be needed! (FLOAT_2 also works!)
						
		var objectmatrix;
		var cameramatrix;
		var projectionmatrix;
			
		// first draw plane in front of camera -------------			
						
		// write, but pass all. 
		// this makes a nice little window into depth space
		ctx.setDepthTest ( true, Context3DCompareMode.ALWAYS );
			
		var eps = 1/((1<<16)-1); // epsilon for 16 bit z buffer
			
		var zFar = 4;
		var zNear = 0.125;
						
		DrawPlaneAtZ ( -zNear,  zNear, zFar,  0,1,0 ); // exactly at near plane: should show
		DrawPlaneAtZ ( -zFar,  zNear, zFar, 0,.5,0 ); // exactly at far far plane: should show
			
		// any one of those would overwrite the green with red			
		DrawPlaneAtZ ( -(zNear-eps),  zNear, zFar,  1,0,0 ); // before near, by epsilon: should not show
		DrawPlaneAtZ ( 0,  zNear, zFar,  1,0,0 ); // before near, zero: should not show
		DrawPlaneAtZ ( zFar/2,  zNear, zFar,  1,0,0 ); // before near, positive would be included if back projected: should not show								
		DrawPlaneAtZ ( -(zFar+eps),  zNear, zFar,  1,0,0 ); // far away zfar: should not show
			
		// real depth test on, a huge blue plane at angle 
		ctx.setDepthTest ( true, Context3DCompareMode.LESS );
			
		var myobjmatrix = new Matrix3D();
						
		myobjmatrix.appendScale(zFar,zFar,1);
		myobjmatrix.appendRotation(45, Vector3D.Y_AXIS );												
		DrawPlaneAtZ ( -zFar,  zNear, zFar,  0,0,1,  myobjmatrix ); // before near, by epsilon: should not show
			
		var n = 256;
		for ( var i = 0; i<=n; i++ ) {
			myobjmatrix.identity();
			myobjmatrix.appendScale(zFar,2/n,1);
			myobjmatrix.appendTranslation(0,i/n,(i/n)*zFar); 				
			DrawPlaneAtZ ( -zFar,  zNear, zFar,  Number(i&1),i/n,i/n,  myobjmatrix ); 
		}
						
        ctx.present(); 			
        ctx.enableErrorChecking = false; 
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
testregistry.push ( {name:"Z Buffer", srcuri:"zbuffer.js", f:Test_ZBuffer, timeout:4000 } ); 