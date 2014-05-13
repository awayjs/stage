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

function Test_MathFuncTests (testenv) {
	var canvas;
	var displayList;
	var prof;
	
	var MARGIN = 16;
		
	var refBitmap;
	var reference;

	var VIEW_WIDTH = 640;
	var VIEW_HEIGHT = 480;
		
	var index = 0;
	var count = 13;
	var t;

	var label;
	var labelInfo;

	var constants = [
		1.0/3.0, 0.0, 1.0, 0.0,
		0.25, 0.25, 0.25, 0.25,
		4.0, Math.PI*2, 4.0, 4.0,
		1.5, 1.5, 1.5, 1.5,
	];
		
	var shaderProgram;
	var vertexBuffer;
	var indexBuffer;
	var ctx;
	var testenv = testenv;
			
	function OnContext3DCreated ( newctx ) {
		console.log("onctx");
		ctx = newctx;
		canvas = document.getElementById("thecan");
		prof = document.getElementById("prof");
		displayList = document.createElement("div");
		document.body.appendChild(displayList);
		displayList.style.width = VIEW_WIDTH;
		displayList.style.height = VIEW_HEIGHT;
		displayList.id = "displayList";
		var pnode = canvas.parentNode; 
		pnode.style.position = "relative";              
        displayList.style.position = "absolute";
        displayList.style.top = prof.height + 4 + "px";
        displayList.style.left = "0px";

		
		reference = BitmapData.fromSize(VIEW_WIDTH, VIEW_HEIGHT);

		label = document.createElement("div");
		label.style.position = "absolute";
		label.style.color = "#336699";
		label.style.fontSize = "32pt";
		label.style.fontFamily = "Arial";
		label.style.left = "100px";
		label.style.top = "16px";

		labelInfo = document.createElement("div");
		labelInfo.style.position = "absolute";
		labelInfo.style.color = "#336699";
		labelInfo.style.fontSize = "16pt";
		labelInfo.style.fontFamily = "Arial";
		labelInfo.textContent = "molehill.js";
		labelInfo.style.left = "100px";
		labelInfo.style.top = "240px";


		displayList.appendChild( reference.canvas );
		displayList.appendChild(label);
		displayList.appendChild(labelInfo);
			
		displayList.addEventListener("mousedown",onMouseDown);

		ctx.enableErrorChecking = true;
			
		indexBuffer = ctx.createIndexBuffer( 6 );
		indexBuffer.uploadFromArray([ 0, 1, 2, 1, 3, 2 ], 0, 6 );  			 			
		vertexBuffer = ctx.createVertexBuffer( 4, 6 );
		vertexBuffer.uploadFromArray(
			[
				-1, 1,          0,           0, 0, 1,
				 1, 1, VIEW_WIDTH,           0, 1, 1,
				-1,-1,          0, VIEW_HEIGHT, 0, 0,
				 1,-1, VIEW_WIDTH, VIEW_HEIGHT, 1, 0,
			],
			0, 4
		);	

		// anim handling
		OnEnterFrame(t);
	}

	function onMouseDown(event) {
		console.log("mousedown");
		index ++;
		index %= count;
		OnEnterFrame(t);
	}
		
	function OnEnterFrame ( t ) {
		t = t;

		var viewWidth = VIEW_WIDTH;
		var viewHeight = VIEW_HEIGHT;
			
		vertexbytes = 
			"add op, va0, vc0\n" +
			"mov v0, va0\n" +
			"mov v1, va1\n" +
			"mov v2, va2\n";
			
		switch(index) {
			case	0: {
				label.textContent = "sin y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.y\n" +
					"sin ft0.x, ft0.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyz\n";
			} break;
			case	1: {
				label.textContent = "cos y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.y\n" +
					"cos ft0.x, ft0.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	2: {
				label.textContent = "log y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"log ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	3: {
				label.textContent = "pow y,x,1/3";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"pow ft0.x, ft0.x, fc0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	4: {
				label.textContent = "sqt y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"sqt ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	5: {
				label.textContent = "rsq y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"rsq ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	6: {
				label.textContent = "rcp y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"rcp ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	7: {
				label.textContent = "exp y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"exp ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	8: {
				label.textContent = "div y,1,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"div ft0.x, fc0.z, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	9: {
				label.textContent = "abs y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"abs ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	10: {
				label.textContent = "neg y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"neg ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	11: {
				label.textContent = "sat y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"sat ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
			case	12: {
				label.textContent = "frc y,x";
				fragmentbytes = 
					"mul ft0.x, v0.x, fc2.x\n" +
					"frc ft0.x, ft0.x\n" +
					"mul ft0.x, ft0.x, fc1.x\n" +
					"slt ft0.z, ft0.x, v0.y\n" +
					"mov ft0.xy, fc0.yy\n" +
					"mul ft0.x, v2.y, ft0.z\n" +
					"mov oc, ft0.xyzz\n";
			} break;
		}

		var agalbytes = AssembleAGAL(
			"part fragment 1			    \n"+
			fragmentbytes				 	   +
			"endpart						\n\n"+
			"part vertex 1					\n" +
			vertexbytes 				 		+
			"endpart						\n"
		);

		var c = reference.canvas;
		reference.context.clearRect(0, 0, c.width, c.height);
		reference.updateImageData();

		for (var x = 0; x<viewWidth; x++) {
			switch(index) {
				case	0: {
					var sinX = (x/viewWidth*Math.PI*4)-Math.PI;
					var sinY = Math.sin(sinX)*viewHeight/2+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(sinY),0xFF00FF00);
				} break;
				case	1: {
					var cosX = (x/viewWidth*Math.PI*4)-Math.PI;
					var cosY = Math.cos(cosX)*viewHeight/2+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(cosY),0xFF00FF00);
				} break;
				case	2: {
					var logX = (x/viewWidth*8)-4;
					var logY = -Math.log(Math.abs(logX))*Math.LOG2E*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(logY),0xFF00FF00);
				} break;
				case	3: {
					var powX = (x/viewWidth*8)-4;
					var powY = -Math.pow(Math.abs(powX),1/3)*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(powY),0xFF00FF00);
				} break;
				case	4: {
					var sqrX = (x/viewWidth*8)-4;
					var sqrY = -Math.sqrt(Math.abs(sqrX))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(sqrY),0xFF00FF00);
				} break;
				case	5: {
					var rsqrX = (x/viewWidth*8)-4;
					var rsqrY = -(1.0/Math.sqrt(Math.abs(rsqrX)))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(rsqrY),0xFF00FF00);
				} break;
				case	6: {
					var rcpX = (x/viewWidth*8)-4;
					var rcpY = -(1.0/rcpX)*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(rcpY),0xFF00FF00);
				} break;
				case	7: {
					var expX = (x/viewWidth*8)-4;
					var expY = -(Math.pow(2,expX))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(expY),0xFF00FF00);
				} break;
				case	8: {
					var divX = (x/viewWidth*8)-4;
					var divY = -(1.0/divX)*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(divY),0xFF00FF00);
				} break;
				case	9: {
					var absX = (x/viewWidth*8)-4;
					var absY = -(Math.abs(absX))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(absY),0xFF00FF00);
				} break;
				case	10: {
					var negX = (x/viewWidth*8)-4;
					var negY = -(-negX)*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(negY),0xFF00FF00);
				} break;
				case	11: {
					var nrmX = (x/viewWidth*8)-4;
					var nrmY = -(Math.min(1,Math.max(0.0,nrmX)))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(nrmY),0xFF00FF00);
				} break;
				case	12: {
					var frcX = (x/viewWidth*8)-4;
					var frcY = -(frcX-Math.floor(frcX))*viewHeight/8+viewHeight/2;
					reference.setPixel(Math.floor(x),Math.floor(frcY),0xFF00FF00);
				} break;
			}
		}

		reference.updateCanvas();
	
		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );
		
		ctx.clear(0,0,0,1); 
                
        ctx.setColorMask ( true, true, true, false );

		ctx.setProgram ( shaderProgram );
			
		ctx.setProgramConstantsFromArray(Context3DProgramType.FRAGMENT, 0, constants, 4);
			
		ctx.setVertexBufferAt( 0, vertexBuffer,  0, Context3DVertexBufferFormat.FLOAT_2 );
		ctx.setVertexBufferAt( 1, vertexBuffer,  2, Context3DVertexBufferFormat.FLOAT_2 );
		ctx.setVertexBufferAt( 2, vertexBuffer,  4, Context3DVertexBufferFormat.FLOAT_2 );
			
		ctx.drawTriangles( indexBuffer, 0, 2 );
                
        ctx.setColorMask ( true, true, true, true );
			
		ctx.present();
			
	}	
		
	function OnAbortTest ( ) {
		console.log("aborting mathfunctests");
        // automatically removes frame handler 
        document.body.removeChild(displayList);    
        if ( ctx ) 
            ctx.dispose();          
        else throw "No WebGL context.";
    }
    
    testenv.abortcallback = OnAbortTest; 
    RequestContext3D ( testenv.canvas, OnContext3DCreated, testenv.testmode );	
				
	
}

// register test
testregistry.push ( {name:"MathFuncTests", srcuri:"mathfunctests.js", f:Test_MathFuncTests } ); 