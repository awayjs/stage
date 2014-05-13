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

function Test_Bones ( testenv ) {
	var ctx;
	var vertexBuffer;
	var indexBuffer; 
	var shaderProgram;
	var ntris;

	function OnEnterFrame( t ) {			
		ctx.clear(); 
			
		ctx.setDepthTest( true, Context3DCompareMode.LESS );
		ctx.setProgram( shaderProgram );
		ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_3 ); //pos
		ctx.setVertexBufferAt( 1, vertexBuffer, 3, Context3DVertexBufferFormat.FLOAT_3 ); //n
		//setVertexBufferAt( 2, vertexBuffer, 6, Context3DVertexBufferFormat.FLOAT_2 ); //uv
		ctx.setVertexBufferAt( 3, vertexBuffer, 8, Context3DVertexBufferFormat.FLOAT_4 ); //bones

		var a = Math.sin( t / 2 ) * .5 + .5; 
			
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

		// view: the camera
		var viewMatrix = new Matrix3D(); 
		viewMatrix.appendTranslation( 0, 0, -2.0 ); // move back along z axis

		var projectionMatrix = new Matrix3D();			
		projectionMatrix.projection(0.1, 1000.0, 96, testenv.w/testenv.h);	
				
		// mvp: model * view * projection	
		mvpMatrix = new Matrix3D();
		mvpMatrix.append( modelMatrix );
		mvpMatrix.append( viewMatrix );
		mvpMatrix.append( projectionMatrix ); 

		// set to shader (transpose because we use it in 4 dp4 registers)
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, mvpMatrix, true );
			
		// set all bones to shader
		var boneTransform = new Matrix3D();
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,4, boneTransform, true );
		boneTransform.appendRotation( Math.sin( t ) * 60, Vector3D.X_AXIS );
		ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 8, boneTransform, true );
					
		// draw
		ctx.drawTriangles( indexBuffer, 0, ntris ); 
			
		ctx.present();
	}
		
	function makePlaneMesh( evalf, nu, nv ) {
		var i, j, u, v;
			
		// build a plane mesh
		ntris = ( nu - 1 ) * ( nv - 1 ) * 2;
		indexBuffer = ctx.createIndexBuffer ( ntris*3 );
		var buildinds = [];
		for ( v = 0, i = 0, j = 0; v < nv - 1; v++ ) {
			for ( u = 0; u < nu - 1; u++ ) {
				buildinds[ j + 0 ] = i;
				buildinds[ j + 1 ] = i + nu;
				buildinds[ j + 2 ] = i + nu + 1;
				buildinds[ j + 3 ] = i;
				buildinds[ j + 4 ] = i + nu + 1;
				buildinds[ j + 5 ] = i + 1;
				j += 6; 
				i++;
			}
			i++;
		} 
		indexBuffer.uploadFromArray( buildinds, 0, ntris * 3 );
			
		// vertices
		var ndpv = 12; // x,y,z, nx,ny,nz, u,v, idx0, idx1, w0, w1
		vertexBuffer = ctx.createVertexBuffer( nv*nu, ndpv );
		var vertices = [];
		i = 0;

		for ( v = 0; v < nv; v++ ) {
			var vf = v / ( nv - 1 );
			for ( u = 0; u < nu; u++ ) {
				var uf = u / ( nu - 1 );
					
				vertices[ i + 0 ] = uf * 2.0 - 1.0; // x
				vertices[ i + 1 ] = vf * 2.0 - 1.0; // y
				vertices[ i + 2 ] = 0; // z
				vertices[ i + 3 ] = 0; // nx
				vertices[ i + 4 ] = 0; // ny
				vertices[ i + 5 ] = 1; // nz			
				vertices[ i + 6 ] = uf; // u
				vertices[ i + 7 ] = vf; // v
				vertices[ i + 8 ] = 8;  // bone 1
				vertices[ i + 9 ] = 4;  // bone 2
				vertices[ i + 10 ] = uf + vf;
				vertices[ i + 11 ] = 1.0 - vertices[ i + 10 ];					
					
				if ( evalf != null )
					evalf( vertices, i ); 

				i += ndpv;
			}
		}
		vertexBuffer.uploadFromArray( vertices, 0, nu*nv ); 
	}
		
	function OnContext3DCreated( newctx ) {

		ctx = newctx;
			
		// programs		
		var agalbytes = AssembleAGAL(
			"part fragment 1        \n" +
			"mov ft0, v0 			\n" +							
			"mov oc, ft0 			\n" +
			"endpart				\n\n" +
			"part vertex 1			\n" + 
			"dp4 vt0.x, va0, vc[va3.x]		\n" + // bone 1 -> object				
			"dp4 vt0.y, va0, vc[va3.x+1]	\n" +
			"dp4 vt0.z, va0, vc[va3.x+2]	\n" +
			"dp4 vt0.w, va0, vc[va3.x+3]	\n" +
				
			"m44 vt1, va0, vc[va3.y]		\n" + // bone 2 -> object
								
			"mul vt0, vt0, va3.z			\n" + // weight 0
			"mul vt1, vt1, va3.w			\n" + // weight 1
			"add vt0, vt0, vt1				\n" + // sum = object result
								
			"m44 op, vt0, vc0     \n"+  // object -> clip transform
				
			// same for normals
			"dp4 vt2.x, va1, vc[va3.x].xyzw  \n"+ // bone 1 -> object				
			"dp4 vt2.y, va1, vc[va3.x+1]     \n"+
			"dp4 vt2.z, va1, vc[va3.x+2]     \n"+
			"dp4 vt2.w, va1, vc[va3.x+3]     \n"+
				
			"dp4 vt3.x, va1, vc[va3.y]       \n"+ // bone 2 -> object
			"dp4 vt3.y, va1, vc[va3.y+1]     \n"+
			"dp4 vt3.z, va1, vc[va3.y+2]     \n"+
			"dp4 vt3.w, va1, vc[va3.y+3]     \n"+
				
			"mul vt2, vt2, va3.z\n"+      // weight 0
			"mul vt3, vt3, va3.w\n"+      // weight 1
			"add vt2, vt2, vt3\n"+        // sum = object result				
				
			// normal as color
			"mov v0, vt2   \n"+
			"endpart	   \n"
		);	
		

		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );			

		// mesh
		makePlaneMesh( null, 16, 16 ); 			
        
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
testregistry.push ( {name:"Bones", srcuri:"bones.js", f:Test_Bones } ); 
