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
function Test_MultiTexturedRectangle( testenv ) {

		var ctx;
		var texture;
		var othertexture; 
		var shaderProgram;
		var vertexBuffer;
		var indexBuffer;
		var imgCount = 0;

		function OnEnterFrame ( t ) {
		    ctx.clear(0, 1, 0, Math.sin(t / 2) * .5 + .5);
			
			ctx.setProgram( shaderProgram );
			ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_2 );  
			ctx.setVertexBufferAt( 1, vertexBuffer, 2, Context3DVertexBufferFormat.FLOAT_2 );

			if (imgCount > 1) {
			    ctx.setTextureAt(1, texture);
			    ctx.setTextureAt(2, othertexture);

			    var matrix = new Matrix3D();
			    matrix.appendRotation(t * 20, Vector3D.Z_AXIS);
			    ctx.setProgramConstantsFromMatrix(Context3DProgramType.VERTEX, 0, matrix, true);
			    ctx.setProgramConstants(Context3DProgramType.VERTEX, 4, Math.sin(t / 1.7), Math.sin(t / 3), 0, 0);
			    ctx.drawTriangles(indexBuffer, 0, 2);

			    matrix.appendRotation(t * 50, Vector3D.Z_AXIS);
			    ctx.setProgramConstantsFromMatrix(Context3DProgramType.VERTEX, 0, matrix, true);
			    ctx.setProgramConstants(Context3DProgramType.VERTEX, 4, Math.cos(t / 1.7), Math.sin(t / 3), 0, 0);
			    ctx.drawTriangles(indexBuffer, 0, 2);
			}
			
			ctx.present(); 			
		}
		
		function OnContext3DCreated ( newctx ) {
			ctx = newctx;
			
			// new! textures!
			texture = ctx.createTexture( 256, 256, Context3DTextureFormat.BGRA, false );
			var imageObj1 = new Image();
			imageObj1.src = "res/molepeople.jpg";
			imageObj1.crossOrigin = "anonymous";
			imageObj1.onload = function() {
				console.log ( "Loaded image ", imageObj1.width, imageObj1.height );
				try {
				    texture.uploadFromImage(imageObj1, 0);
				    imgCount++;
				} catch (e) {
					console.log ( "Upload failed, this is most likely due to CORS.\n"+
                              "Either run python -m http.server from the index.html directory and use localhost:8000/index.html or\n" +
                              "disable CORS for local files in your browser.\n" );        
					// upload some noise instead
                var imgData = new Uint8Array ( 256*256*4 );
                for ( var i=0; i<256*256*4; i++ ) 
                    imgData[i] = Math.random()*255;                     
                texture.uploadFromUint8Array ( imgData,0 );   
				}
 			}
			
			othertexture = ctx.createTexture(256, 256, Context3DTextureFormat.BGRA);
			var imageObj2 = new Image();
			imageObj2.src = "res/testpat.png";
			imageObj2.crossOrigin = "anonymous";
			imageObj2.onload = function() {
				console.log ( "Loaded image ", imageObj2.width, imageObj2.height );
				try {
				    othertexture.uploadFromImage(imageObj2, 0);
				    imgCount++;
				} catch (e) {
					console.log ( "Upload failed, this is most likely due to CORS.\n"+
                              "Either run python -m http.server from the index.html directory and use localhost:8000/index.html or\n" +
                              "disable CORS for local files in your browser.\n" );        
					// upload some noise instead
                var imgData = new Uint8Array ( 256*256*4 );
                for ( var i=0; i<256*256*4; i++ ) 
                    imgData[i] = Math.random()*255;                     
                othertexture.uploadFromUint8Array ( imgData,0 );   
				}
 			}

			
			// programs			
			var agalbytes = AssembleAGAL(
				"part fragment 1			    \n"+
				"mov ft0, v0			        \n" +
				"tex ft1, ft0, fs1 <2d,linear>	\n" +	// sample texture 1
				"tex ft2, v2, fs2 <2d,linear>	\n" +	// sample texture 2
				"add ft1, ft1, ft2		        \n" +
				"mov oc, ft1					\n" +
				"endpart						\n\n"+
				"part vertex 1					\n" +
				"dp4 op.x, va0, vc0				\n" +	// 4x4 matrix transform from stream 0 to output clipspace
				"dp4 op.y, va0, vc1				\n" +
				"dp4 op.z, va0, vc2				\n" +
				"mov op.w, vc3.w				\n" +
				"mov v0, va1					\n" +	// copy texcoord from stream 1 to fragment program
				"mul vt0, va1, vc4				\n" +	// scale texcoord2
				"mov v2, vt0					\n" +
				"endpart						\n"
			);			

			shaderProgram = ctx.createProgram();
			shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data);

			// buffers
			indexBuffer = ctx.createIndexBuffer( 6 );
			indexBuffer.uploadFromArray( [ 0, 1, 2, 0, 2, 3 ] , 0, 6 );
			vertexBuffer = ctx.createVertexBuffer( 4, 7 ); // 4 vertices, 7 floats per vertex
			vertexBuffer.uploadFromArray(
					[
						// x,y, u,v, r,g,b format
						-1,-1, 1,0,  1,1,0,
						-1,1,  1,1,  1,0,0,
						1,1,  0,1,  1,0,1,
						1,-1, 0,0,  1,0,1
					],
				0, 4
			);
		    // anim handling
			testenv.startOnEnterFrame(OnEnterFrame);
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
testregistry.push ( {name:"Multitextured Rectangle", srcuri:"multitexturedrectangle.js", f:Test_MultiTexturedRectangle, timeout:4000 } ); 