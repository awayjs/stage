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

function Test_MipMapRectangle( testenv ) {
		
	var ctx;
	var texture;
	var othertexture;
	var imgCount = 0;

	function OnContext3DCreated( newctx ) {
		ctx = newctx;
		texture = ctx.createTexture( 256, 256, Context3DTextureFormat.BGRA, false );
		var imageObj1 = new Image();
		imageObj1.src = "res/molepeople.jpg";
		imageObj1.crossOrigin = "anonymous";
		imageObj1.onload = function() {
			uploadTextureWithMipmaps( texture, imageObj1 );
			console.log("width: " + imageObj1.width);
			imgCount++;
			checkEnterFrame();
		}
			
			
		othertexture = ctx.createTexture( 256, 256, Context3DTextureFormat.BGRA, false );
		var imageObj2 = new Image();
		imageObj2.src = "res/testpat.png";
		imageObj2.crossOrigin = "anonymous";
		imageObj2.onload = function() {
		    uploadTextureWithMipmaps(othertexture, imageObj2);
		    imgCount++;
		    checkEnterFrame();
		}
			
		// programs
		var agalbytes = AssembleAGAL(
			"part fragment 1			    \n"+
			"tex ft1, v2, fs1 <2d,linear,repeat,miplinear>\n"+ // sample texture 1
			"mov ft1, ft1.xyzw				\n"+
			"mov oc, ft1					\n"+
			"endpart						\n\n"+
			"part vertex 1					\n" +
			"m44 op, va0, vc0				\n" +	// 4x4 matrix transform from stream 0 to output clipspace
			"mov v0, va1.xyzw				\n" +	// copy texcoord from stream 1 to fragment program
			"mul vt0, va1, vc4				\n" +	// scale texcoord2 
			"mov v2, vt0					\n" +
			"endpart						\n"
		);
			

		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );
		
		// buffers
		indexBuffer = ctx.createIndexBuffer( 6 );
		indexBuffer.uploadFromArray([ 0, 1, 2, 0, 2, 3 ], 0, 6 );
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
	}

	function checkEnterFrame() {
		if (imgCount > 1) {
			// anim handling
			testenv.startOnEnterFrame(OnEnterFrame);
		}
	}
		
	function OnEnterFrame( t ) {
		ctx.clear( 0, 1, 0, Math.sin( t / 2 ) * .5 + .5 );
		
		
		ctx.setProgram(shaderProgram);
		ctx.setVertexBufferAt(0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_2);
		ctx.setVertexBufferAt(1, vertexBuffer, 2, Context3DVertexBufferFormat.FLOAT_2);
		ctx.setTextureAt(1, texture);
		ctx.setTextureAt(1, othertexture);
		var myMatrix = new Matrix3D();
		myMatrix.appendRotation(t * 3, Vector3D.Z_AXIS);
		ctx.setProgramConstantsFromMatrix(Context3DProgramType.VERTEX, 0, myMatrix, true);
		var scale = (Math.sin(t) + 1) * 4 + 1;
		ctx.setProgramConstants(Context3DProgramType.VERTEX, 4, scale, scale, 0, 0);
		ctx.drawTriangles(indexBuffer, 0, 2);
		ctx.present();
	}
	
	function uploadTextureWithMipmaps( dest, src ) {		
		var ws = src.width;
		var hs = src.height;
        dest.uploadFromImage( src, 0 );                        
		var c2d = document.createElement("canvas");
        c2d.width = ws;
        c2d.height = hs;                                
		var level = 0;
		var tmp = c2d.getContext("2d");						
		while ( ws > 1 || hs > 1 ) {
			level++;
			ws >>= 1;
			hs >>= 1;                   
            if ( ws==0 ) ws = 1;
            if ( hs==0 ) hs = 1;
			console.log(ws + ", " + hs);
			tmp.drawImage( src, 0, 0, ws, hs );
			dest.uploadFromImage( tmp.getImageData ( 0,0,ws,hs), level );                        
		}
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
testregistry.push ( {name:"MipMapRectangle", srcuri:"mipmaprectangle.js", f:Test_MipMapRectangle, timeout:4000 } ); 
