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

function Test_MathFuncLimits (testenv) {
	var canvas;
	var displayList;
	var prof;

	var MARGIN = 16;
		
	var VIEW_WIDTH = 640;
	var VIEW_HEIGHT = 480;
	var viewWidth;
	var viewHeight;
		
	var xx = 0;
	var yy = 0;

	var labelInfo;
	var labelCount = 12;
	var addedStrings = false;
	var constants = [
		0.0, 1.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 1.0,
		Infinity,Infinity,Infinity,Infinity,
		-Infinity,-Infinity,-Infinity,-Infinity,
		NaN, NaN, NaN, NaN,
		Math.pow(2,(-126)), Math.pow(2,(-126)), Math.pow(2,(-126)), Math.pow(2,(-126)),
		Math.pow(2,(-126-23)), Math.pow(2,(-126-23)), Math.pow(2,(-126-23)), Math.pow(2,(-126-23)),
		2.0, 2.0, 2.0, 2.0,
		0.5, 0.5, 0.5, 0.5,
	];
		
	var shaderProgram;
	var vertexBuffer;
	var indexBuffer;
	var ctx;
	
	function OnContext3DCreated ( newctx) {
		textBoxes = [];

		ctx = newctx;
		canvas = document.getElementById("thecan");
		prof = document.getElementById("prof");
		displayList	= document.createElement("div");
		document.body.appendChild(displayList);
		displayList.style.width = VIEW_WIDTH;
		displayList.style.height = VIEW_HEIGHT;
		displayList.id = "displayList";
		var pnode = canvas.parentNode;
		pnode.style.position = "relative";
		displayList.style.position = "absolute";
		displayList.style.top = prof.height + 4 + "px";
		displayList.style.left = "8px";

		labelInfo = document.createElement("div");
		labelInfo.style.position = "absolute";
		labelInfo.style.color = "#336699";
		labelInfo.style.fontSize = "16pt";
		labelInfo.style.fontFamily = "Arial";
		labelInfo.style.left = "108px";
		labelInfo.style.top = "240px";
		labelInfo.textContent = "Molehill.js";

		displayList.appendChild(labelInfo);

		ctx.enableErrorChecking = true;		
			
		indexBuffer = ctx.createIndexBuffer( 6 );
		indexBuffer.uploadFromArray( [ 0, 1, 2, 1, 3, 2 ], 0, 6 );  			 			
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

		viewWidth = VIEW_WIDTH;
		viewHeight = VIEW_HEIGHT;

		// anim handling
		OnEnterFrame(0);
        //testenv.startOnEnterFrame ( OnEnterFrame );
	}

		
	function drawRect(desc,program) {
		var vertexbytes =
			"mov vt0, va0\n" +
			"mul vt0.xy, va0.xy, vc0.xy\n" +
			"add vt0.xy, vt0.xy, vc0.zw\n" +
			"mov op, vt0\n" +
			"mov v0, va0\n" +
			"mov v1, va1\n" +
			"mov v2, va2\n";
		var fragmentbytes = program;

		var agalbytes = AssembleAGAL(
			"part fragment 1 			\n"+
			fragmentbytes 			  +"\n"+
			"endpart					\n\n"+
			"part vertex 1 				\n"+
			vertexbytes				  +"\n"+
			"endpart					\n"
		)	

		shaderProgram = ctx.createProgram();
		shaderProgram.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );

		ctx.setProgram ( shaderProgram );
			
		var constantsVertex = [
			1.0/7.0, 
			1.0/7.0, 
			xx/3.2-0.8,
			0.8-yy/3.2,
		];
			
		ctx.setProgramConstantsFromArray(Context3DProgramType.VERTEX, 0, constantsVertex, 1);
			
		ctx.setProgramConstantsFromArray(Context3DProgramType.FRAGMENT, 0, constants, 11);

		ctx.setVertexBufferAt( 0, vertexBuffer,  0, Context3DVertexBufferFormat.FLOAT_2 );
		ctx.setVertexBufferAt( 1, vertexBuffer,  2, Context3DVertexBufferFormat.FLOAT_2 );
		ctx.setVertexBufferAt( 2, vertexBuffer,  4, Context3DVertexBufferFormat.FLOAT_2 );
			
		ctx.drawTriangles( indexBuffer, 0, 2 );
			
		var label = document.createElement("div");
		label.style.position = "absolute";
		label.style.wordWrap = true;
		label.style.color = "#336699";
		label.style.fontSize = "8pt";
		label.wordWrap = true;				
		label.style.fontFamily = "Arial";		
		label.width = ((viewWidth-viewWidth*0.2)/6);
		label.height = ((viewHeight-viewHeight*0.2)/6);
		label.style.left = ((viewWidth-viewWidth*0.05)/6)*xx+viewWidth*0.025+"px";
		label.style.top = ((viewHeight-viewHeight*0.05)/6)*yy+viewHeight*0.05+"px";

		
		displayList.appendChild(label);
		textBoxes.push(label);

		label.textContent = desc;
		//}
		xx++;
		if ( xx>=6 ) {
			xx=0;
			yy++;
		}
	}
		
	function OnEnterFrame( t ) {
		ctx.clear(0,0,0,1); 
		xx = 0;
		yy = 0;
		for(var i = 0; i < textBoxes.length; i++) {
			displayList.removeChild(textBoxes[i]);
		}
		textBoxes = [];
		drawRect(
			"mov oc.y, Inf = 1",
			"mov ft0, fc2\n"+
			"mov ft0.y, fc4.x\n"+
			"mov oc, ft0\n"
		);
			
		drawRect(
			"div y,1,0 = Inf",
			"mov ft0.x, fc3.x\n"+
			"div ft0.x, ft0.x, fc2.x\n"+
			"seq ft1.x, ft0.x, fc4.x\n"+
			"sne ft2.x, ft0.x, fc4.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"div y,1,Inf = Inf",
			"mov ft0.x, fc2.x\n"+
			"div ft0.x, ft0.x, fc4.x\n"+
			"seq ft1.x, ft0.x, fc2.x\n"+
			"sne ft2.x, ft0.x, fc2.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"div y,Inf,0 = Inf",
			"mov ft0.x, fc4.x\n"+
			"div ft0.x, ft0.x, fc2.x\n"+
			"seq ft1.x, ft0.x, fc4.x\n"+
			"sne ft2.x, ft0.x, fc4.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);
			
		drawRect(
			"rcp y,0 = Inf",
			"mov ft0.x, fc2.x\n"+
			"rcp ft0.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc4.x\n"+
			"sne ft2.x, ft0.x, fc4.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"rsq y,0 = Inf",
			"mov ft0.x, fc2.x\n"+
			"rsq ft0.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc4.x\n"+
			"sne ft2.x, ft0.x, fc4.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"log y,0 = -Inf",
			"mov ft0.x, fc2.x\n"+
			"log ft0.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc5.x\n"+
			"sne ft2.x, ft0.x, fc5.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);
			
		drawRect(
			"log y,Inf = Inf",
			"mov ft0.x, fc4.x\n"+
			"log ft0.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc4.x\n"+
			"sne ft2.x, ft0.x, fc4.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"mul y,1,2^(-126) = 2^(-126)",
			"mov ft0.x, fc3.x\n"+
			"mul ft0.x, ft0.x, fc7.x\n"+
			"seq ft1.x, ft0.x, fc7.x\n"+
			"sne ft2.x, ft0.x, fc7.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"mul y,2,2^(-126-23) = 0",
			"mov ft0.x, fc9.x\n"+
			"mul ft0.x, ft0.x, fc8.x\n"+
			"seq ft1.x, ft0.x, fc2.x\n"+
			"sne ft2.x, ft0.x, fc2.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"div y,2^(-126),2 = 0",
			"mov ft0.x, fc9.x\n"+
			"div ft0.x, fc8.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc2.x\n"+
			"sne ft2.x, ft0.x, fc2.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);

		drawRect(
			"mul y,2^(-126),0.5 = 0",
			"mov ft0.x, fc10.x\n"+
			"mul ft0.x, fc8.x, ft0.x\n"+
			"seq ft1.x, ft0.x, fc2.x\n"+
			"sne ft2.x, ft0.x, fc2.x\n"+
			"mul ft1, ft1.xxxx, fc0\n"+
			"mul ft2, ft2.xxxx, fc1\n"+
			"add oc, ft1, ft2\n"
		);
			
		for ( var c=0; c<24; c++) {
			drawRect("","mov oc, v2\n");
		}
		addedStrings = true;
		ctx.present();
	}

	function OnAbortTest ( ) {
        document.body.removeChild(displayList); 
        // automatically removes frame handler    
        if ( ctx ) 
            ctx.dispose();          
        else throw "No WebGL context.";
    }
    
    testenv.abortcallback = OnAbortTest; 
    RequestContext3D ( testenv.canvas, OnContext3DCreated );
}

// register test
testregistry.push ( {name:"MathFuncLimits", srcuri:"mathfunclimits.js", f:Test_MathFuncLimits } ); 