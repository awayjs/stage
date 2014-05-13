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

function Test_BunnyScene (testenv) {
	
	var ctx;
	var canvas;
	var canvas2d;
	var displayList;

	var MARGIN = 16;
	var DEFAULT_WIDTH = 512;
	var DEFAULT_HEIGHT = 512;

	var scene;	
	var donut1;
	var bunny;
	var light1;
	var camera1;
	var hf;
	var groundplane;
	var particleshit;
	var particles1;
		
	var trees = []; 
		
	var myTimer; 
		
	var redrawonmove = false;
	var buttonDown = false;
		
	var t = 0; // global time in seconds
	var prevTime; 
		
	var movespeed = 1/2; 
		
	// this is for geomemtry drawing mode! 
	var mousemode = 0;		
	var overlaygfx;
	var treetrack = []; 
	var treeorg; 

	var mousex;
	var mousey;

	var includesleft;
	var includes = [
	{src:"ssg/SSG.js"}
    ];

	function requestContext3D() {
	    RequestContext3D ( testenv.canvas, OnContext3DCreated, testenv.testmode );
	}
		
	function OnContext3DCreated ( newctx ) {
		ctx = newctx;
		canvas = document.getElementById("can");
		var pnode = canvas.parentNode;
		pnode.style.position = "relative";
		scene = new SSG( ctx );
		console.log("scene: " + scene);		
		//configureBackBuffer();
		scene.context3D.enableErrorChecking = true; 

		displayList = document.createElement("div");
		displayList.id = "displayList";
		displayList.style.position = "absolute";
		displayList.style.top = "52px";
		displayList.style.left = "8px";
		document.body.appendChild(displayList);
			
		// overlay
		canvas2d = document.createElement("canvas"); 
		canvas2d.id = "canvas2d";
		canvas2d.width = canvas.width;
		canvas2d.height = canvas.height;	
			
		displayList.appendChild(canvas2d);

		overlaygfx = document.getElementById("canvas2d").getContext('2d');	
							
		// main spinning donut
		donut1 = new SSGProceduralGeometry();
		donut1.createDonut(64,32,.2,3);			
		donut1.generatePickTree ();
		scene.addNode(donut1);
		console.log("donut: " + donut1);			
						
		// a camera
		camera1 = new SSGCamera();			
		scene.addNode(camera1);
		camera1.move ( 0,0,6 );
		camera1.aspect = DEFAULT_WIDTH/DEFAULT_HEIGHT;
		// need a camera to render from
		scene.setActiveCamera ( camera1 );					
			
		// a light
		light1 = new SSGLight();
		light1.move(13,0,-13);
		scene.addNode(light1);
			
		// a bunny
		bunny = new SSGBunny();
		console.log(bunny.timerCount);
		bunny.loadPLY ( "res/bun_zipper_res2.ply", 8,8,8 );
		scene.addNode(bunny);
		bunny.move(-4,2,0);			
		bunny.eulerRotatePost(180,0,0);		
		var label = document.createElement("div");
		label.id = "loadnotify";
		label.style.position = "absolute";
		label.style.textContent = "Bunny loader";
		displayList.appendChild(label);
		bunny.loadnotify = label;
			
		// a "ground" plane			
		groundplane = new SSGProceduralGeometry();
		groundplane.createPlane(12,12,40,40);
		
		groundplane.move(0,5,0 );
		groundplane.material.diffuse = new SSGMap("Blood.jpg");	
		scene.addNode(groundplane);
			
		// a heightfield!
		hf = new SSGHeightField();
		hf.loadFromFile ( "res/h5.png", 2,2,.3 );		
		hf.move(-1,-5.5,0);	
		hf.material.twosided = true;
		hf.material.diffuse = new SSGMap("mini5.png");			
		scene.addNode(hf);
			
		// some particles
		particles1 = new SSGParticles(5000);
		scene.addNode(particles1);						
		particles1.addPlane( 0,10,0, 0,-1,0 );
		particles1.move(0,-5,0 );
		particles1.bitmap.loadImage("mini5.png");				
			
		// particles to spwan when we hit test 
		particleshit = new SSGParticles(2000);
		scene.addNode(particleshit);
		particleshit.essize = .05;
		particleshit.bitmap.loadImage("mini5.png");
		particleshit.force_x = 0;					 
		particleshit.force_y = 0;
		particleshit.force_z = 0;
		particleshit.fallofftime = .05;	
						
		// timer for animation, 30hz
		if ( !myTimer ) {				
			myTimer = setInterval(myTimerHandler, 1000/30);
		}			
			
		// some keyboard handlers to move the camera around								
		canvas2d.addEventListener('mousemove', myMouseHandler, false);
		canvas2d.addEventListener('mousedown', myMouseDownHandler);
		canvas2d.addEventListener('mouseup', myMouseUpHandler);
		window.onkeydown = myKeyDownHandler;
			
		// optional resizing!		
		//stage.addEventListener(Event.RESIZE, myResizeHandler);			
			
		prevTime = Date.now(); 
			
		// anim handling
        testenv.startOnEnterFrame ( doDraw );
	}
		
	// drawing function, call whenever the Context3D should be updated
	function doDraw ( t ) {
		//if(PerformanceUtils.context3DIsDisposed(scene.context3D))
		//		return;
		scene.context3D.clear(0.3,0.3,0.3,1);
		scene.render();
	}		
		
	// handlers implementations 		
	function myTimerHandler (e) {	
		var currentTime = Date.now();
		var dt = (currentTime - prevTime)/1000.0;		
		prevTime = currentTime;			
		if ( dt<=0 ) return;
			
		particles1.runAnimation(dt);
		particleshit.runAnimation(dt);

		t += dt; 
		donut1.identity();
		donut1.eulerRotate ( t*6,t*17,t*43 );
			
		bunny.eulerRotate (0,dt*-56,0);			
		hf.eulerRotatePost ( 0,dt*56,0 );		
	}

	function getMouse(event, canvasElem){ 
		var mouse = {x:0, y:0}; 
		var isTouch = false; 

		// touch screen events 
		if (event.touches){ 
			isTouch = true; 
			if (event.touches.length){ 
				mouse.x = parseInt(event.touches[0].pageX); 
				mouse.y = parseInt(event.touches[0].pageY); 
			} 
		}else{ 
			// mouse events 
			mouse.x = parseInt(event.clientX); 
			mouse.y = parseInt(event.clientY); 
		}	 

		// accounts for border 
		mouse.x -= canvasElem.clientLeft; 
		mouse.y -= canvasElem.clientLeft; 

		// parent offsets 
		var par = canvasElem; 
		while (par !== null) { 
			if (isTouch){ 
				// touch events offset scrolling with pageX/Y 
				// so scroll offset not needed for them 
				mouse.x -= parseInt(par.offsetLeft); 
				mouse.y -= parseInt(par.offsetTop); 
			}else{ 
				mouse.x += parseInt(par.scrollLeft - par.offsetLeft); 
				mouse.y += parseInt(par.scrollTop - par.offsetTop); 
			} 

			par = par.offsetParent; 
		} 

		return mouse; 
	} 
		
	function myMouseDownHandler (e) {
		buttonDown = true;
		mousex = getMouse(e, canvas2d).x;
		mousey = getMouse(e, canvas2d).y;
		if ( e.ctrlKey ) mousemode = 1; 
		if ( mousemode==1 ) {
			overlaygf.beginPath();
			overlaygfx.lineStyle( 8, 0xffffff );
			overlaygfx.moveTo(mousex,mousey);
			treetrack.length = 0; 				
			treetrack.push(mousex);
			treetrack.push(mousey);				
			var mxnrm = (mousex / canvas.width) * 2.0 - 1.0;
			var mynrm = (mousey / canvas.height) * 2.0 - 1.0;
			treeorg = scene.createPickRayFromScreenCoords ( mxnrm, mynrm );
			scene.pick ( treeorg );											
		}
	}
		
	function myMouseUpHandler (e) {
		buttonDown = false;			
		mousex = getMouse(e, canvas2d).x;
		mousey = getMouse(e, canvas2d).y;
		overlaygfx.clearRect(0, 0, canvas2d.width, canvas2d.height); 
		if ( treetrack.length>=6 && mousemode==1 ) {
			if ( treeorg.objhit!=null ) {
				var hp = treeorg.getWorldSpace();
				var hpes = treeorg.getEyeSpace(camera1); 									
					
				var newtree = new SSGProceduralGeometry();				
				var scale = camera1.xScaleFromZ(hpes.z) * (2.0/canvas2d.width); 
				console.log ( "adding tree, segments="+treetrack.length/2+" scale="+scale+" dist="+hpes.z);
				var tc = new Array(treetrack.length); 
					
				for ( var i=0; i<treetrack.length; i+=2 ) { 
					tc[i] = (treetrack[i] - treetrack[0]) * scale;
					tc[i+1] = (treetrack[i+1] - treetrack[1]) * scale;
				}
				// smooth a bit
				for ( var j=0; j<4; j++ ) // smooth amount
					for (  i=2; i<treetrack.length-2; i++ ) 
						tc[i] = (tc[i]*2 + tc[i-2] + tc[i+2])/4;										
												
				newtree.createTree( treetrack.length/2,4,10*scale,tc );					
									
				newtree.objmatrix = camera1.getWorldMatrix().clone();
				newtree.setPosition ( hp.x, hp.y, hp.z );
				var tmp = treeorg.objhit.getWorldMatrix().clone();
				tmp.invert();
				newtree.objmatrix.append(tmp);
				newtree.dirtyMeAndAllChildren();										
				treeorg.objhit.addNode(newtree);
					
			} else {
				// play "doh" sound					
			} 		
		} 
		treetrack.length = 0;
		mousemode = 0; 
	}		
		
	function myMouseHandler (e) {
		var mxnrm = (getMouse(e, canvas2d).x / canvas2d.width) * 2.0 - 1.0;
		var mynrm = (getMouse(e, canvas2d).y / canvas2d.height) * 2.0 - 1.0;
			
		if ( buttonDown ) {
			var dx = mousex - getMouse(e, canvas2d).x;
			var dy = mousey - getMouse(e, canvas2d).y;
			if ( dx==0 && dy==0 ) return;
			mousex = getMouse(e, canvas2d).x; 
			mousey = getMouse(e, canvas2d).y;
			if ( mousemode==0 ) {
				// middle button forward would be neat
				if ( e.shiftKey ) camera1.interactiveStrafeFirstPerson ( dx/512.0, dy/512.0 ); 
				else camera1.interactiveRotateFirstPerson ( -dx, dy );
			} else {																		
				overlaygfx.lineTo(mousex,mousey );
				treetrack.push(mousex);
				treetrack.push(mousey);
			}				
			if ( redrawonmove ) doDraw();
		} else {
			var picker = scene.createPickRayFromScreenCoords ( mxnrm, mynrm );
			scene.pick ( picker );
			scene.selectednode = null; //picker.objhit;		
			//console.log ( "Total hits: "+picker.hitcount.toString()+" Ray/tri tests: "+picker.tests.toString()  );
			if (picker.objhit != null) {
				// mark hit with particles~! 
				particleshit.spawnCircular(30,0,.5,1, .1,.25, 4,4,  
					picker.getWorldSpaceX(),
					picker.getWorldSpaceY(),
					picker.getWorldSpaceZ() ); 	 					 
			} 						
		}
	}

	function myKeyDownHandler (e) {
		var redraw = false;	
		//buttonDown = true;		
		if ( e.keyCode==38 ) { camera1.interactiveForwardFirstPerson ( movespeed ); redraw = true; }
		if ( e.keyCode==40 ) { camera1.interactiveForwardFirstPerson ( -movespeed ); redraw = true; }
		if ( e.keyCode==37 ) { camera1.interactiveRotateFirstPerson ( -8,0 ); redraw = true; }
		if ( e.keyCode==39 ) { camera1.interactiveRotateFirstPerson (  8,0 ); redraw = true; }
		if ( e.keyCode==32 ) {
			particles1.spawnCircular(100,1/60.0, 1,2, 1,10, 10,10,  0,0,0 ); 				
		}
		if ( e.keyCode==68 ) mousemode^=1; // d							
		if ( redrawonmove && redraw ) doDraw();
		//trace ( " key "+e.keyCode );
		
	}
		
	function myResizeHandler ( e) {
		if ( !scene ) return;
		//configureBackBuffer();
		doDraw();
	}

	function OnAbortTest ( ) {
        // automatically removes frame handler 
        document.body.removeChild(displayList);    
        if ( ctx ) 
            ctx.dispose();          
        else throw "No WebGL context.";
    }

    function loadscript(url, callback) {    
    	console.log ( "Loading: "+url ); 
    	var head = document.getElementsByTagName("head")[0];
    	var script = document.createElement("script");
    	script.type = "text/javascript";
    	script.src = url;
    	script.onload = callback;   
    	head.appendChild(script);
	}

	function includeloaded ( idx, mainfunction ) {
    	includesleft--; 
    	includes[idx].loaded = includesleft;
    	console.log ( "Loaded "+includes[idx].src ); 
    	if ( includesleft==0 ) 
        	mainfunction();
	}
    
    testenv.abortcallback = OnAbortTest; 
    includesleft = 0;
    includes.forEach(function(include,index){             
        loadscript ( include.src, function() { includeloaded(index,requestContext3D); } );        
        includesleft++; 
    });
}		
		
// register test
testregistry.push ( {name:"BunnyScene", srcuri:"bunnyscene.js", f:Test_BunnyScene } ); 
