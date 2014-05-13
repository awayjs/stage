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

function Test_StencilBuffer4 ( testenv ) {
	
	var ctx;
	var shaderProgram;
	var vertexBuffer;
	var indexBuffer;

	function OnContext3DCreated ( newctx ) {
		ctx = newctx;		 		
			
		// programs			
		var agalbytes = AssembleAGAL(
			"part fragment 1	    \n" +
			"mov oc, fc0 			\n" +
			"endpart				\n\n" +
			"part vertex 1			\n" +
			"dp4 op.x, va0, vc0		\n" + // 4x4 matrix transform from stream 0 to output clipspace
			"dp4 op.y, va0, vc1		\n" +
			"dp4 op.z, va0, vc2		\n" +
			"mov op.w, vc3.w 		\n" +
			"endpart				\n"	
		);			
		
		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );			
			
		// buffers			
		indexBuffer = ctx.createIndexBuffer( 12 );
		indexBuffer.uploadFromArray(
			[
				// once forward, once backwards
				0,1,2,0,2,3,
				2,1,0,3,2,0
			],
			0, 12
		);
			
		vertexBuffer = ctx.createVertexBuffer( 4, 2 ); // 4 vertices, 2 floats per vertex
		vertexBuffer.uploadFromArray(
			[
				// x,y format
				-1,-1,
				-1,1,
				1,1,
				1,-1,
			],
			0, 4
		);

		// anim handling
        testenv.startOnEnterFrame(OnEnterFrame);
	}
		
	function OnEnterFrame( t ) {
		ctx.clear( 0, 1, 0, Math.sin( t / 2 ) * .5 + .5, 1.0, 2 ); // stencil clears to 1
			
		ctx.setProgram( shaderProgram );
		ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_2 );
		var matrix = new Matrix3D();
		matrix.appendRotation( t * 5 , Vector3D.Z_AXIS );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );
			
		// disable depth
		ctx.setDepthTest( false, Context3DCompareMode.ALWAYS );
			
		// --------------------------------------------------
			
		// does stencilling work at all?

		// clear
		ctx.clear( 0, 1, 0, Math.sin( t ) *.5 + .5, 1.0, 27 ); // stencil clears to 27
		//
		// this should draw
		//
		ctx.setStencilActions( Context3DTriangleFace.FRONT_AND_BACK, 
								Context3DCompareMode.EQUAL, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP ); 
		ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 1, 0, 0, 1 ] ); // red
		ctx.setStencilReferenceValue( 27 );
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		// should not draw
		ctx.setStencilActions( Context3DTriangleFace.FRONT_AND_BACK, 
								Context3DCompareMode.LESS, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP ); 
		ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 0, 0, 0.5, 1 ] ); // blue
		matrix.appendTranslation( 0.1, 0, 0 );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, matrix, true );
		ctx.setStencilReferenceValue( 27 );
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		// should draw			
		ctx.setStencilActions( Context3DTriangleFace.FRONT_AND_BACK, 
								Context3DCompareMode.LESS_EQUAL, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP ); 
		ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 0.7, 0.7, 1, 1 ] ); // light blue
		matrix.appendTranslation( 0.1, 0, 0 );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,0, matrix, true );
		ctx.setStencilReferenceValue( 27 );
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		// should not draw
		ctx.setStencilActions( Context3DTriangleFace.FRONT_AND_BACK, 
								Context3DCompareMode.GREATER, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP ); 
		ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 0.5, 0.5, 0, 1 ] ); // dark yellow
		matrix.appendTranslation( 0.1, 0, 0 );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,0, matrix, true );
		ctx.setStencilReferenceValue( 27 );
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		// should draw
		ctx.setStencilActions( Context3DTriangleFace.FRONT_AND_BACK, 
								Context3DCompareMode.GREATER_EQUAL, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP, 
								Context3DStencilAction.KEEP ); 
		ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 1, 1, 0.7, 1 ] ); // light yellow
		matrix.appendTranslation( 0.1, 0, 0 );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,0, matrix, true );
		ctx.setStencilReferenceValue( 27 );
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		// --------------------------------------------------
			
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
testregistry.push ( {name:"StencilBuffer4", srcuri:"stencilbuffer4.js", f:Test_StencilBuffer4 } ); 