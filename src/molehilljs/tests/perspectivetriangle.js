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
function Test_PerspectiveTriangle( testenv ) {

	var ctx;
	var shaderProgram;
	var indexBuffer;
	var vertexBuffer;
	var _modelScale = 1.0;
	var _modelTx = 0.0;
	var _modelTy = 0.0;
	var _modelTz = 0.0;
	var _width;
	var _height;
		
		
	function OnContext3DCreated( newctx ) {
		_width = testenv.w;
		_height = testenv.h;
		ctx = newctx;
			
		// programs
		var agalbytes = AssembleAGAL(
			"part fragment 1        \n" +
			"mov ft0, v0			\n" +							
			"mov oc, ft0			\n" +
			"endpart				\n\n"+
			"part vertex 1			\n" +
			"dp4 op.x, va0, vc0		\n" +	// 4x4 matrix transform from stream 0 to output clipspace
			"dp4 op.y, va0, vc1		\n" +
			"dp4 op.z, va0, vc2		\n" +
			"dp4 op.w, va0, vc3		\n" +
			"mov v0, va1			\n"	+	// copy texcoord from stream 1 to fragment program
			"endpart				\n"
		);			
			
			
		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data);
			
		// buffers
		indexBuffer = ctx.createIndexBuffer( 3 );
		indexBuffer.uploadFromArray( [ 0, 1, 2 ], 0, 3 );
		vertexBuffer = ctx.createVertexBuffer( 3, 7 ); // 3 vertices, 7 floats per vertex
		vertexBuffer.uploadFromArray(
			
				[
					// x,y,z,w  r,g,b format
					-1,-1,0,1,  0,1,0,
					0,1,0,1,   1,0,0,
					1,-1,0,1,  0,0,1
				],
			0, 3
		);

		// anim handling
        testenv.startOnEnterFrame ( OnEnterFrame ); 
	}

	function OnEnterFrame( t ) {
		ctx.clear( 0, 1, 0, Math.sin( t / 2 ) * .5 + .5 );
			
		ctx.setProgram ( shaderProgram );
		ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_4 );// explicitly specify z and w. should not be needed! (FLOAT_2 also works!)
		ctx.setVertexBufferAt( 1, vertexBuffer, 4, Context3DVertexBufferFormat.FLOAT_3 );
			
		var a = Math.sin( t / 2 ) * .5 + .5; 
		//context3D.clear( 0.5 * a, 0.5 * a, 0.5 * a, a );
			
		// this is a test for perspective projection
		// all that is different is that we need to provide a perspective
		// matrix instead of a 2d rotation. 
		// build the matrix in a traditional mvp style. 
		// this could be written much more efficiently, use Matrix3D for now for clarity
		// model: local transformation
		var modelMatrix = new Matrix3D(); 
		modelMatrix.appendRotation( t * 50, Vector3D.Z_AXIS );
		modelMatrix.appendRotation( t * 70, Vector3D.Y_AXIS );
		modelMatrix.appendRotation( t * 30, Vector3D.X_AXIS ); // the classic prime spin
		modelMatrix.appendScale(_modelScale, _modelScale, _modelScale);
		modelMatrix.appendTranslation(_modelTx, _modelTy, _modelTz);

		// view: the camera
		var viewMatrix = new Matrix3D(); 
		viewMatrix.appendTranslation( 0, 0, -2.0 ); // move back along z axis

		var projectionMatrix = new Matrix3D();			
		//projectionMatrix.perspectiveFieldOfViewRH(17, _width/_height, 0.1, 1000.0);	
		projectionMatrix.projection(0.1, 1000.0, 96, _width/_height);	


		// mvp: model * view * projection	
		mvpMatrix = new Matrix3D();
		mvpMatrix.append( modelMatrix );
		mvpMatrix.append( viewMatrix );
		mvpMatrix.append( projectionMatrix ); 

		// set to shader (transpose because we use it in 4 dp4 registers)
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, mvpMatrix, true );

		ctx.drawTriangles( indexBuffer, 0, 1 );
			
		ctx.present();
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
testregistry.push ( {name:"Perspective Triangle", srcuri:"perspectivetriangle.js", f:Test_PerspectiveTriangle, timeout:4000 } ); 
