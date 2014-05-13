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

function SSG( incontext3D ) {
	this.context3D = incontext3D;
	this.rootnode = new SSGNode();
	this.activecamera = null;
		
	this.selectednode;
		
	this.projection = new Matrix3D(); 
	this.view = new Matrix3D();
		
	// light tracking
	this.lightlist = [];
		
	// stats
	this.tricount;	
	return this;
}
		
SSG.prototype.addNode = function( node ) {
	this.rootnode.addNode ( node );
	node.ssgbase = this;
}
				 	
SSG.prototype.render = function() {
	if ( this.activecamera == null ) {
		console.log( "no active camera set, nothing to do." );
		return;
	}
	this.tricount = 0;
			
	// camera update
	this.activecamera.updateWorldSpacePosition();
	// collect lights
	this.prepareAllLightsForRendering ( );
										
	// setup the camera matrix parts, objects still need to set composite matrices (model and mvp)						
	this.view = this.activecamera.getWorldMatrix().clone();
	this.view.invert();
	this.projection = this.activecamera.getProjectionMatrix().clone();
	this.context3D.setCulling ( Context3DTriangleFace.BACK ); 					
			
	this.context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, this.view, true );	
	this.context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 12, this.projection, true );				
			
	// issue the preview style draw calls
	this.rootnode.renderRec ( this );
	// why not..
	this.context3D.present();
}
		
SSG.prototype.setActiveCamera = function( cam ) {
	this.activecamera = cam;
}
		
SSG.prototype.prepareAllLightsForRendering = function( ) {			
	this.lightlist.length = 0;
	this.rootnode.collectThingsToArrayRec ( SSGLight, this.lightlist );	
	// remove disabled or otherwise zero lights
	// update light's worldspace position
	for ( var light in this.lightlist )
		light.updateWorldSpacePosition();
}
		
SSG.prototype.sortLightsForNode = function( node ) {			
	var lightsortfunction = function ( a, b ) {
		if ( a.curlightingdistance < b.curlightingdistance ) return -1;			
		if ( a.curlightingdistance > b.curlightingdistance ) return 1;
		return 0;
	};				
	node.updateWorldSpacePosition();
	for ( var light in lightlist )
		light.ComputeLightingDistanceToNode ( node );			
	//this.lightlist.sort ( lightsortfunction, Array.NUMERIC );
	this.lightlist.sort ( lightsortfunction );
}		
		
SSG.prototype.createPickRayFromScreenCoords = function( x, y ) {
	var pr = new SSGPickRay();
	pr.createRayFromCamera(x,y,this.activecamera);
	return pr; 
}
		
SSG.prototype.pick = function( ray ) {
	ray.resetHit();			
	if ( this.rootnode!=null ) this.rootnode.pickRec ( this, ray );
}

function SSGMaterial() {
	
	// this does some very simple fixed shading model
	// limit to 3 per vertex lights 
	//
	// vertex constants map: 
	// 0: model to world
	// 4: view
	// 8: model to view
	// 12: projection
	// 16: model to clipspace (mvp)
	// 20: channel 0 texture matrix 
	// 24: channel 1 texture matrix 
	//
	// varying mapping	
	// 0: uv 								<- channel 0 coords
	// 1: uv * texture matrix               <- channel 1 coords
	// 2: object space pos * texgen matrix  <- envmap texture coordinates
	// 3: diffuse vertex light
	// 4: specular vertex light	
	//
	// fragment constants map: 
	// 0: const diffuse_color	
	// 1: const specular_color|specular_exponent_mod
	// 2: const emit|opacity	
	// 
	// sampler map:
	// 0: diffuse map
	// 1: specular map	
	// 2: emit|opacity map
	// 3: env cube
	
	// fragment operation:
	// [ compute specular and diffuse pixel lighting ]
	// d = diffuse.rgb * sat(diffuse_pixel_lighting + diffuse_vertex_lighting)
	// s = specular.rgb * (environment + pow (specular_pixel_lighting + specular_vertex_lighting)), specular.a * specularconst.a))
	// color = (d + s) * opacity + emit

	// classic, very simple material
	this.diffuse = new SSGMap(); // alpha ignored
	this.specular = new SSGMap(); // alpha is exponent, rgb is modulation		
	this.emitopacity = new SSGMap(); // alpha is opacity, rgb is emit
	this.environment = new SSGMap(); // cubemap			
				
	this.diffuse.setConstantColor(1,1,1);
	this.specular.setConstantColor(0,0,0,16);
	this.emitopacity.setConstantColor(0,0,0,1);
	this.environment.setConstantColor(0,0,0,0);

	this.twosided;
		
	this.program;
		
	this.ctemp = new Array(4); 
	return this;
}

// need to call when maps change
SSGMaterial.prototype.buildProgram = function( dest ) {
	if  ( !this.program )
		this.program = dest.context3D.createProgram ( );
										
	var source_test_vertex = 
		"mov vt0, va0 \n"+ // position
		"mov vt1, va1 \n"+ // normal
		"mov vt2, va2 \n"+ // uv
		"m44 op, vt0, vc16 \n"+ // model to clip				
		"m33 v0.xyz, vt1, vc0\n" + // normal to world 
		"mov v0.w, va1.w\n" +
		"m44 v1, va2, vc";
				
				
	var source_test_fragment = "mov ft1, v0\n"+                               
							   "mov oc, ft1\n";

	var agalbytes = AssembleAGAL(
		"part fragment 1 			\n"+
		source_test_fragment      +"\n"+
		"endpart                  \n\n"+
        "part vertex 1        		\n"+
        source_test_vertex		  +"\n"+
        "endpart              		\n"    
	); 					
			
	this.program.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data ); 			
}
		
SSGMaterial.prototype.setupForRender = function( dest ) {
	if ( !this.program ) 
		this.buildProgram ( dest );
							
	dest.context3D.setProgram ( this.program );
			
	this.diffuse.setConstant ( dest, Context3DProgramType.FRAGMENT, 0 );
	if ( !this.diffuse.isConstantColor() ) this.diffuse.bind( dest, 0 );
			
	this.specular.setConstant ( dest, Context3DProgramType.FRAGMENT, 1 );			
	if ( !this.specular.isConstantColor() ) this.specular.bind( dest, 1 );
			
	this.emitopacity.setConstant ( dest, Context3DProgramType.FRAGMENT, 2 ); 
	if ( !this.emitopacity.isConstantColor() ) this.emitopacity.bind( dest, 2 );
			
	this.environment.setConstant ( dest, Context3DProgramType.FRAGMENT, 3 );
	if ( !this.environment.isConstantColor() ) this.environment.bind( dest, 23);
			
	dest.context3D.setCulling( this.twosided ? Context3DTriangleFace.NONE : Context3DTriangleFace.BACK );
}

function SSGMesh () { 
	SSGNode.call(this);
			
	this.needupload = true;
	this.indices_mem = [];
	this.vertices_mem = [];
	this.indices_card;
	this.vertices_card;	
			
	this.material = new SSGMaterial();	
	this.picktree = new SSGPickTree();	
						
	this.boundingsphereradius = 0;		
	this.boundingbox = []; // object space axis aligned, min(x,y,z) - max(x,y,z) 				
	this.boundingsphereradius; // object space, centered around origin				
}


SSGMesh.prototype = Object.create(SSGNode.prototype); 
		
SSGMesh.prototype.computeBoundingBoxAndSphere = function( ) {
	if ( this.vertices_mem == null || this.vertices_mem.length < 8 ) {
		this.boundingbox = null;
		return;
	} 
	this.boundingbox = [];
	this.boundingbox[0] = this.vertices_mem[0]; 
	this.boundingbox[1] = this.vertices_mem[1]; 
	this.boundingbox[2] = this.vertices_mem[2];
	this.boundingbox[3] = this.vertices_mem[0]; 
	this.boundingbox[4] = this.vertices_mem[1]; 
	this.boundingbox[5] = this.vertices_mem[2];
	for ( var o = 8; o < this.vertices_mem.length; o+=8 ) {
		if ( this.vertices_mem[o+0] < this.boundingbox[0] ) this.boundingbox[0] = this.vertices_mem[o+0];
		if ( this.vertices_mem[o+1] < this.boundingbox[1] ) this.boundingbox[1] = this.vertices_mem[o+1];
		if ( this.vertices_mem[o+2] < this.boundingbox[2] ) this.boundingbox[2] = this.vertices_mem[o+2];
		if ( this.vertices_mem[o+0] > this.boundingbox[3] ) this.boundingbox[3] = this.vertices_mem[o+0];
		if ( this.vertices_mem[o+1] > this.boundingbox[4] ) this.boundingbox[4] = this.vertices_mem[o+1];
		if ( this.vertices_mem[o+2] > this.boundingbox[5] ) this.boundingbox[5] = this.vertices_mem[o+2];				
	}
	this.boundingsphereradius = 0;
	for ( var i; i<8; i++ ) {
		var x = this.boundingbox[(i&1)==0?0:3];
		var y = this.boundingbox[(i&2)==0?1:4];
		var z = this.boundingbox[(i&4)==0?2:5];				
		var d = x*x + y*y + z*z;
		if ( d > this.boundingsphereradius ) this.boundingsphereradius = d;  
	}			
	this.boundingsphereradius = Math.sqrt(this.boundingsphereradius);
}
		
SSGMesh.prototype.normalizeAllVertexNormals = function( ) {
	// normalize all vertex normals
	for ( var i=0; i<this.vertices_mem.length; i+=8 ) { // zero normals
		var len = this.vertices_mem[i+3]*this.vertices_mem[i+3] + this.vertices_mem[i+4]*this.vertices_mem[i+4] + this.vertices_mem[i+5]*this.vertices_mem[i+5];
		if ( len==0 ) {
			this.vertices_mem[i+3] = 0;
			this.vertices_mem[i+4] = 0;
			this.vertices_mem[i+5] = 1;					
		} else {
			len = 1.0 / Math.sqrt(len);
			this.vertices_mem[i+3] *= len;
			this.vertices_mem[i+4] *= len;
			this.vertices_mem[i+5] *= len;					
		}
	}			
}
		
SSGMesh.prototype.computeNormalAndAdd = function( mem, o1 ,o2, o3, normalize ) {
	var dx1 = mem[o2+0] - mem[o1+0];
	var dy1 = mem[o2+1] - mem[o1+1];
	var dz1 = mem[o2+2] - mem[o1+2];
 	var dx2 = mem[o3+0] - mem[o1+0];
	var dy2 = mem[o3+1] - mem[o1+1];
	var dz2 = mem[o3+2] - mem[o1+2];
	// cross
	var nx = dy1*dz2 - dz1*dy2;
	var ny = dz1*dx2 - dx1*dz2;
	var nz = dx1*dy2 - dy1*dx2;
	// normalize
	if ( normalize ) {
		var len = nx*nx + ny*ny + nz*nz; 
		if ( len==0 ) return;
		len = 1.0 / Math.sqrt(len);
		nx *=len; ny *=len; nz *=len;
	}
	// add in
	mem[o1+3] += nx; mem[o1+4] += ny; mem[o1+5] += nz; 
	mem[o2+3] += nx; mem[o2+4] += ny; mem[o2+5] += nz;
	mem[o3+3] += nx; mem[o3+4] += ny; mem[o3+5] += nz;
}
		
SSGMesh.prototype.createVertexNormals = function( normalize ) {
	// assumes everything is set in _mem, except undefined values as normals
	var i;
	for ( i = 0; i<this.vertices_mem.length; i+=8 ) { // zero normals
		this.vertices_mem[i+3] = 0; this.vertices_mem[i+4] = 0; this.vertices_mem[i+5] = 0;
	}
	// compute face normals and add to vertices							
	for ( i=0; i<this.indices_mem.length; i+=3 ) {
		this.computeNormalAndAdd ( this.vertices_mem, this.indices_mem[i]<<3,this.indices_mem[i+1]<<3,this.indices_mem[i+2]<<3, false );				 								
	}
	this.normalizeAllVertexNormals();	
	this.needupload = true;				
}
		
SSGMesh.prototype.setupAllVertexStreamsAndDraw = function( dest ) {			
	if ( this.indices_mem == null || this.vertices_mem == null ) return false;  
	if ( this.needupload ) {				
		if ( this.indices_card==null || this.indices_card_count!=this.indices_mem.length ) {
			this.indices_card = dest.context3D.createIndexBuffer ( this.indices_mem.length );
			this.indices_card_count = this.indices_mem.length;					
		}
		if ( this.vertices_card==null || this.vertices_card_count!=this.vertices_mem.length/8 ) {
			this.vertices_card = dest.context3D.createVertexBuffer ( this.vertices_mem.length/8, 8 );
			this.vertices_card_count = this.vertices_mem.length/8;
		}
		this.indices_card.uploadFromArray( this.indices_mem, 0, this.indices_mem.length );
		this.vertices_card.uploadFromArray( this.vertices_mem, 0, this.vertices_mem.length/8 );
		this.needupload = false;				
	}
			
	dest.context3D.setVertexBufferAt ( 0, this.vertices_card, 0, Context3DVertexBufferFormat.FLOAT_3);
	dest.context3D.setVertexBufferAt ( 1, this.vertices_card, 3, Context3DVertexBufferFormat.FLOAT_3);						
	dest.context3D.setVertexBufferAt ( 2, this.vertices_card, 6, Context3DVertexBufferFormat.FLOAT_2);						
			 
	dest.context3D.drawTriangles ( this.indices_card, 0, this.indices_mem.length/3 );
			
	dest.tricount += this.indices_mem.length/3;				
	return false;
}
		
//aaronc: added async paramter to choose between doing in timer or not, out of timer is way faster
SSGMesh.prototype.generatePickTree = function(async) {
	this.picktree = new SSGPickTree ( );
	if(async)
		this.picktree.createInTimer ( this.vertices_mem, 8, this.indices_mem, 10, 8 );
	else
		this.picktree.create ( this.vertices_mem, 8, this.indices_mem, 10, 8 );
}
				
SSGMesh.prototype.pick = function( dest, ray ) {
	if ( this.indices_mem == null || this.vertices_mem == null ) return;
	if ( this.hidden ) return;			
	ray.updateRayFromObject(this);
			
	if ( this.boundingbox!=null && !ray.intersectBoundingBoxCheckOnly ( this.boundingbox ) ) return;
	if ( this.picktree==null ) {
		for ( var o = 0; o<this.indices_mem.length; o+=3 ) {
			ray.intersectTriangle_HM(this.vertices_mem, this.indices_mem[o]<<3, this.indices_mem[o+1]<<3, this.indices_mem[o+2]<<3, this );
		} 			
	} else {				
		this.picktree.intersect ( ray, this.vertices_mem, this ); 
	}
}						
		
SSGMesh.prototype.isBoundingBoxVisibleInClipspace = function( mvp, bounds ) {
	// just transform 8 vertices to clipspace, then check if they are completly clipped
	// we really should add a native function to matrix3D for this ...
	// Matrix3D.CheckBoundingBoxClipspaceBits ( Vector.<Number>(6) bounds ) : uint
	var rawm = mvp.data;
			
	var outsidebits = (1<<6)-1; 
			 
	for ( var i = 0; i<8; i++ ) {				
		var x = this.boundingbox[(i&1)==0?0:3];
		var y = this.boundingbox[(i&2)==0?1:4];
		var z = this.boundingbox[(i&4)==0?2:5];
		// transform
		var xcs = x * rawm[0] + y * rawm[4] + z * rawm[8] + rawm[12];				
		var ycs = x * rawm[1] + y * rawm[5] + z * rawm[9] + rawm[13];
		var zcs = x * rawm[2] + y * rawm[6] + z * rawm[10] + rawm[14];
		var wcs = x * rawm[3] + y * rawm[7] + z * rawm[11] + rawm[15];
		// check clipping				
		if ( xcs >= -wcs ) outsidebits &= ~(1<<0); // no longer all are outside -x ... clear -x bit.. etc
		if ( xcs <= wcs ) outsidebits &= ~(1<<1); 
		if ( ycs >= -wcs ) outsidebits &= ~(1<<2);
		if ( ycs <= wcs ) outsidebits &= ~(1<<3);	
		if ( zcs >= 0/*-wcs*/ ) outsidebits &= ~(1<<4); // gl style...
		if ( zcs <= wcs ) outsidebits &= ~(1<<5);				
	} 			
	if ( outsidebits!=0 ) return false;  			
	return true;
}
				
SSGMesh.prototype.render = function( dest ) {		
	if ( this.hidden ) return;
			
	// setup matrices
	var model = this.getWorldMatrix().clone();
	this.setDefaultVertexMatrices ( dest, model );
			
	// check bb 
	if ( this.boundingbox && !this.isBoundingBoxVisibleInClipspace ( model, this.boundingbox ) ) return; 
						
	var modeli = this.getWorldMatrix().clone();					
	modeli.invert();								
			
	// progs
	this.material.setupForRender ( dest ); 
			
	// collect lights
	dest.prepareAllLightsForRendering();
			
	dest.context3D.setBlendFactors ( Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO );
	dest.context3D.setDepthTest ( true, Context3DCompareMode.LESS_EQUAL );							 
			
	this.setupAllVertexStreamsAndDraw ( dest );					
}
		
SSGMesh.prototype.isHiddenToActiveCamera = function( dest ) {
	return false;
}

function SSGLight () {
	SSGNode.call(this);
	this.color = new Array();
	this.color[0] = 1; this.color[1] = 1; 
	this.color[2] = 1; this.color[3] = 1;
	this.intensity = 1;
	this.falloffstart = 10;
	this.falloffrange = 1;
	this.curlightingdistance;
} 

SSGLight.prototype = Object.create(SSGNode.prototype);

SSGLight.prototype.computeLightingDistanceToNode = function( node ) {
			
}

function SSGMap( loadimage) {
	this.texturesrc = null;
	this.img;
	this.color = new Array(4); // constant color	
	this.color[0] = 1;
	this.color[1] = 1;
	this.color[2] = 1;
	this.color[3] = 1;	
	this.texture_card;		 
	this.texmatrix = new Matrix3D(); // after channel 		 
	this.texture_mem;
	this.texture_mem_alpha;
	this.texturesrc_alpha;
			
	this.needsupload;
		     		
	// streaming
	this.loadingidx;
	if ( loadimage!=null && loadimage!= "" ) {
		this.loadImage ( loadimage );
	}
	return this;
}
		
SSGMap.prototype.loadImage = function( source, sourcealpha) {
	if ( this.loadingidx ) {
		// still loading? what to do?
		return false;
	}
	this.texturesrc = source;	
	this.loadingidx = 0;				
	this.loadImageFromSources ( );				
	return true;
} 
		
SSGMap.prototype.loadImageFromSources = function( ) {			
	var path = null;
	if ( this.loadingidx==0 ) path = "res/";
	if ( this.loadingidx==1 ) path = "http://localhost/test/res/";
	if ( this.loadingidx==2 ) return; 
			
	if ( path == null ) {
		this.img = null;
		loadingidx = 0;			
		return;
	} 			  
	if ( this.img==null ) {			
		this.img = new Image();			  
   		this.img.onload = this.imageLoadedHandler;
   		this.img.main = this;
   	}     
    this.loadingidx++;
    this.img.src = (path+this.texturesrc);            													
}
		
SSGMap.prototype.imageLoadedHandler = function( e ) {
	console.log ( "Loaded image: "+this.main.texturesrc+" w="+this.width.toString()+" h="+this.height.toString() );
	this.main.texture_mem = BitmapData.fromSize(this.width,this.height);  
    this.main.texture_mem.draw(this, new Matrix());  
    this.main.needsupload = true;			
    this.main.loadingidx = 0;
} 
		
SSGMap.prototype.isConstantColor = function( ) {
	return this.texture_card == null;
}
		
SSGMap.prototype.setConstantColor = function( r, g, b, a ) {
	this.color[0] = r;
	this.color[1] = g;
	this.color[2] = b;
	this.color[3] = a;			
}
		
SSGMap.prototype.bind = function( dest, sampler ) {
	this.upload ( dest );
	if ( this.texture_card==null ) return false;			
	dest.context3D.setTextureAt(sampler, this.texture_card);	
	return true;
}
		
SSGMap.prototype.upload = function( dest ) {
	if ( !this.needsupload || this.loadingidx!=0 ) return;			
	if ( this.texture_mem==null ) {
		this.texture_card = null;
		return;
	} 			
	this.texture_card = dest.context3D.createTexture ( this.texture_mem.width, this.texture_mem.height, Context3DTextureFormat.BGRA, false );
	this.texture_card.uploadFromBitmapData(this.texture_mem);
	this.needsupload = false;
}
		
SSGMap.prototype.setConstant = function( dest, target, regnum ) {
	dest.context3D.setProgramConstantsFromArray( target, regnum, this.color, 1 ); 			
}
		
SSGMap.prototype.getConstantColor = function( ) {
	return this.color;
}

function SSGParticles( setcount ) {
	SSGNode.call(this);
			
	this.count = setcount; 
	this.activecount = 0;			
	this.particles = new Array( this.count * 8 ); // pos xyz, velocity xyz, lifetime, energy
	this.vertices_mem = new Array( this.count * 8 * 4); // copy, expanded by 4
			
	this.force_x = 0.0;
	this.force_y = 4.0;
	this.force_z = 0.0; // some fake gravity!	
			
	this.essize = .2;	
	this.fallofftime = 1;		
			
	this.planecount = 0;
	this.planes = new Array(32);
			
	this.bitmap = new SSGMap();
	this.indices_card;
	this.vertices_card;
	this.uvvertices_card;		

	this.prog;
		
	this.source_particles_vertex =
		"m44 vt0, va0, vc0\n"+   // position to worldspace
		//"mul vt2, vc32, va1.x \n" + //pos = constworldspace_extrude_1*u + pos
		//"add vt0, vt0, vt2 \n" +
		//"mul vt2, vc33, va1.y \n" + //pos = constworldspace_extrude_2*v + pos
		//"add vt0, vt0, vt2 \n" +				
		"m44 vt1, vt0, vc4\n"+ 	// position to view		
		"mul vt2, vc34, va1.x \n" +
		"add vt1, vt1, vt2 \n" +
		"mul vt2, vc35, va1.y \n" +
		"add vt1, vt1, vt2 \n" +
		"m44 op, vt1, vc12 \n"+ 	// position to clip 						
		"mov v0, va1\n"+		// uv (just copy)
		"mov vt2, va2\n"+
		"dp3 vt2, vt2, vt2\n"+		
		"mov vt2.xy, va3\n"+
		"mov v1, vt2\n";		// life/energy/velocitysquared
		
	this.source_particles_fragment =					
		//"tex ft0, v0, fs0 <2d> \n"+	
		"mov ft0, fc0.y\n"+
		"mul ft0, v1.x, fc0.x\n"+		
        "mul ft0, ft0, fc1\n"+		
		"mov oc, ft0\n"; 	// output as color	
												
}

SSGParticles.prototype = Object.create(SSGNode.prototype);
				
SSGParticles.prototype.randRange = function( min, max ) {
	return Math.random() * (max-min) + min;
} 
		
SSGParticles.prototype.randDirectionVector = function( dest, offset, len) {
	var x = Math.random()-0.5;
	var y = Math.random()-0.5;
	var z = Math.random()-0.5;
	var veclen = x*x + y*y + z*z;
	veclen = len / Math.sqrt(veclen);
	dest[offset+0] = x*veclen;
	dest[offset+1] = y*veclen;
	dest[offset+2] = z*veclen;  
}
		
SSGParticles.prototype.addPlane = function( xpos, ypos, zpos, xnormal, ynormal, znormal ) {
	this.planes[this.planecount*4] = xnormal;
	this.planes[this.planecount*4+1] = ynormal;
	this.planes[this.planecount*4+2] = znormal;
	this.planes[this.planecount*4+3] = xnormal*xpos + ynormal*ypos + znormal*zpos;
	this.planecount++;			
}
		
SSGParticles.prototype.spawnCircular = function( num, startsubposrange, 
									startvelocity_min, startvelocity_max,
									startlife_min, startlife_max, 
									startenergy_min, startenergy_max,
									x, y, z) {
	if ( num+this.activecount > this.count ) num = this.count - this.activecount;
	var o = this.activecount * 8;
	for ( var i = 0; i<num; i++ ) { 
		this.randDirectionVector ( this.particles, o+3, this.randRange (startvelocity_min,startvelocity_max) );
		var t = this.randRange ( 0, startsubposrange );
		this.particles[o+0] = x + t*this.particles[o+3];
		this.particles[o+1] = y + t*this.particles[o+4];
		this.particles[o+2] = z + t*this.particles[o+5];
		this.particles[o+6] = this.randRange ( startlife_min, startlife_max );
		this.particles[o+7] = this.randRange ( startenergy_min, startenergy_max );							
		o+=8;
	}
	this.activecount += num;
}
		
SSGParticles.prototype.spawnSparks = function( num, srco ) {
	if ( num+this.activecount > this.count ) num = this.count - this.activecount;
	var o = this.activecount * 8;			
	for ( var i = 0; i<num; i++ ) {
		this.randDirectionVector ( this.particles, o+3, this.randRange (1,1) );
				
		this.particles[o+0] = this.particles[srco];
		this.particles[o+1] = this.particles[srco+1];
		this.particles[o+2] = this.particles[srco+2];
		this.particles[o+3] += this.particles[srco+3];
		this.particles[o+4] += this.particles[srco+4];
		this.particles[o+5] += this.particles[srco+5];				
		this.particles[o+6] = this.particles[srco+6]/2;  
		this.particles[o+7] = this.particles[srco+7];							
		o+=8;
	}
	this.activecount += num;
}
		
SSGParticles.prototype.runAnimation = function( dt ) {
	var o = 0;
	for ( var i = 0; i<this.activecount; i++ ) {
		var dead = false;				
		// check for death from time or colission 
		var o2 = 0;
		for ( var j = 0; j<this.planecount; j++ ) {
			var dotpos = this.particles[o+0]*this.planes[o2] + this.particles[o+1]*this.planes[o2+1] + this.particles[o+2]*this.planes[o2+2] - this.planes[o2+3];
			var dotdir = this.particles[o+3]*this.planes[o2] + this.particles[o+4]*this.planes[o2+1] + this.particles[o+4]*this.planes[o2+2];
			var tintersect = -dotpos / dotdir;   					 
			if ( tintersect>=0 && tintersect<=dt ) {
									
				this.particles[o+3] -= this.planes[o2] * dotdir * 2;
				this.particles[o+4] -= this.planes[o2+1] * dotdir * 2;
				this.particles[o+5] -= this.planes[o2+2] * dotdir * 2;	
						
				// spawn some clones						
				this.spawnSparks ( 4, o );					
			}
			o2 +=4;
		}				
		// pos += velocity * dt
		this.particles[o+0] += this.particles[o+3] * dt;
		this.particles[o+1] += this.particles[o+4] * dt;
		this.particles[o+2] += this.particles[o+5] * dt;				
		// velocity += acceleration * dt (acceleration is only gravity here, so constant)  
		this.particles[o+3] += this.force_x * dt;
		this.particles[o+4] += this.force_y * dt;
		this.particles[o+5] += this.force_z * dt;			
		// track time for individual particle (+6 can be used for rendering)
		this.particles[o+6] -= dt;
		this.particles[o+7] = this.particles[o+7]; // ignore / keep energy 
				
		if ( this.particles[o+6] <= 0 ) dead = true;
		if ( dead ) {
			// swap in the last one here, reduce count
			if ( i!=this.activecount-1 ) {
				var osrc = (this.activecount-1)*8;
				this.particles[o+0] = this.particles[osrc+0];
				this.particles[o+1] = this.particles[osrc+1];
				this.particles[o+2] = this.particles[osrc+2];
				this.particles[o+3] = this.particles[osrc+3];					
				this.particles[o+4] = this.particles[osrc+4];
				this.particles[o+5] = this.particles[osrc+5];
				this.particles[o+6] = this.particles[osrc+6];
				this.particles[o+7] = this.particles[osrc+7]; 						
			}
			this.activecount--;
		} else {												
			o+=8;  	
		}							
	}
}
		
SSGParticles.prototype.createIndices = function( dest ) {

	var indices_mem = new Array(this.count*6);
	this.indices_card = dest.context3D.createIndexBuffer ( this.count*6 );
	var desto = 0;
	var so = 0;
	for ( var i=0; i<this.count; i++ ) {
		indices_mem[desto+0] = so;
		indices_mem[desto+1] = so+1;
		indices_mem[desto+2] = so+2;
		indices_mem[desto+3] = so+2;
		indices_mem[desto+4] = so+3;
		indices_mem[desto+5] = so;
		so += 4;
		desto+=6;
	}
	this.indices_card.uploadFromArray ( indices_mem, 0, this.count*6 );					
} 
		
SSGParticles.prototype.createUVVertices = function( dest ) {
	var mem = new Array(this.count*4*2);
	this.uvvertices_card = dest.context3D.createVertexBuffer ( this.count*4, 2 );
	var desto = 0;
	for ( var i=0; i<this.count; i++ ) {
		mem[desto++] = 0;
		mem[desto++] = 0;				
		mem[desto++] = 1;
		mem[desto++] = 0;				
		mem[desto++] = 1;
		mem[desto++] = 1;				
		mem[desto++] = 0;
		mem[desto++] = 1;				
	}
	this.uvvertices_card.uploadFromArray( mem, 0, this.count*4 );
} 		
		
SSGParticles.prototype.uploadVertexData = function( dest ) {
	if ( this.indices_card==null ) this.createIndices ( dest );
	if ( this.uvvertices_card==null ) this.createUVVertices ( dest );			
	if ( this.vertices_card==null ) {
		this.vertices_card = dest.context3D.createVertexBuffer ( this.count*4, 8 );
		if ( this.activecount < this.count ) {
			// upload to make buffer complete	
			this.vertices_card.uploadFromArray( this.vertices_mem, 0, this.count*4 );									
		}
	}
			
	var osrc = 0;			
	var odst = 0;
	// just copy everything, expanding by 4. pretty wasteful :/			
	for ( var i = 0; i<this.activecount; i++ ) {
		for ( var j = 0; j<4; j++ ) {
			this.vertices_mem[odst+0] = this.particles[osrc+0];
			this.vertices_mem[odst+1] = this.particles[osrc+1];
			this.vertices_mem[odst+2] = this.particles[osrc+2];
			this.vertices_mem[odst+3] = this.particles[osrc+3];
			this.vertices_mem[odst+4] = this.particles[osrc+4];
			this.vertices_mem[odst+5] = this.particles[osrc+5];
			this.vertices_mem[odst+6] = this.particles[osrc+6];
			this.vertices_mem[odst+7] = this.particles[osrc+7];
			odst+=8;
		}				
		osrc+=8;				
	}		
	// up
	this.vertices_card.uploadFromArray( this.vertices_mem, 0, this.activecount*4 );
							
}
		
SSGParticles.prototype.render = function( dest ) {							
	var zerovec = new Array(4);
	var tempvec = new Array(4);			
	zerovec[0] = 0; zerovec[1] = 0; zerovec[2] = 0; zerovec[3] = 0;			
							
	// this needs special shaders to do the eye plane (or whatever plane we choose)
	if ( this.prog==null ) {
		this.prog = dest.context3D.createProgram();
		var agalbytes = AssembleAGAL(
			"part fragment 1 		\n"+
			this.source_particles_fragment  +
			"endpart  				\n\n"+
			"part vertex 1 			\n"+
			this.source_particles_vertex    +
			"endpart  				\n"
		);
		this.prog.uploadFromAGALByteArray( agalbytes.vertex.data, agalbytes.fragment.data );				
	}
								
	dest.context3D.setProgram (this.prog);					
	this.setDefaultVertexMatrices ( dest, this.getWorldMatrix().clone() );
			
	tempvec[0] = this.essize; tempvec[1] = 0; tempvec[2] = 0; tempvec[3] = 0;		
	dest.context3D.setProgramConstantsFromArray( Context3DProgramType.VERTEX, 34, tempvec );
	tempvec[0] = 0; tempvec[1] = this.essize; tempvec[2] = 0; tempvec[3] = 0;
	dest.context3D.setProgramConstantsFromArray( Context3DProgramType.VERTEX, 35, tempvec );
			
	dest.context3D.setProgramConstantsFromArray( Context3DProgramType.VERTEX, 32, zerovec );
	dest.context3D.setProgramConstantsFromArray( Context3DProgramType.VERTEX, 33, zerovec );
			
	tempvec[0] = 1/this.fallofftime; tempvec[1] = 1; tempvec[2] = 0; tempvec[3] = 0;			
	dest.context3D.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, tempvec );
			
	dest.context3D.setBlendFactors ( Context3DBlendFactor.SOURCE_ALPHA, Context3DBlendFactor.ONE );								
	dest.context3D.setDepthTest ( false, Context3DCompareMode.LESS_EQUAL );				
    
    dest.context3D.setProgramConstants ( Context3DProgramType.FRAGMENT, 1, 1,0,0,1 );
			
	this.setupAllVertexStreamsAndDraw(dest);			
			
	dest.context3D.setDepthTest ( true, Context3DCompareMode.LESS );
}
		
SSGParticles.prototype.setupAllVertexStreamsAndDraw = function( dest ) {
	if ( this.activecount==0 ) return true;
			
	this.uploadVertexData ( dest );						
	dest.context3D.setVertexBufferAt ( 0, this.vertices_card, 0, Context3DVertexBufferFormat.FLOAT_3);
	dest.context3D.setVertexBufferAt ( 1, this.uvvertices_card, 0, Context3DVertexBufferFormat.FLOAT_2); // the texcoords
	dest.context3D.setVertexBufferAt ( 2, this.vertices_card, 3, Context3DVertexBufferFormat.FLOAT_3); // actually velocity, can take magnitude and map to color
	dest.context3D.setVertexBufferAt ( 3, this.vertices_card, 6, Context3DVertexBufferFormat.FLOAT_2); // lifetime and energy, you can lut those to color also
						
	dest.context3D.drawTriangles ( this.indices_card, 0, this.activecount*2 );			
	dest.tricount += this.activecount*2;
			
	dest.context3D.setVertexBufferAt ( 0, null );
	dest.context3D.setVertexBufferAt ( 1, null );
	dest.context3D.setVertexBufferAt ( 2, null );
	dest.context3D.setVertexBufferAt ( 3, null );						
	return true;
}

function SSGPickRay() {
	this.ox = 0; this.oy = 0; this.oz = 0;
	this.dx = 0; this.dy = 0; this.dz = 1;
	var eps = .0000001;	
	// input (es origin is 000)
	this.esdx, this.esdy, this.esdz;
	this.wsdx, this.wsdy, this.wsdz;
	this.wsox, this.wsoy, this.wsoz;
		
	// object space coords, used in functions to check 
	this.ox, this.oy, this.oz;
	this.dx, this.dy, this.dz;
		
	// output
	this.thit; 
	this.objhit; 
	this.uhit, this.vhit;
	this.hitcount;
	this.tests;

	this.resetHit ( );
	return this;
}
		
SSGPickRay.prototype.resetHit = function( ) {
	this.thit = 1000000; // something reasonably far
	this.objhit = null;
	this.hitcount = 0;
	this.uhit = 0; 
	this.vhit = 0;
	this.tests = 0;
}
		
// x,y are normalize -1..1 window coordinates, creates ray in world space
SSGPickRay.prototype.createRayFromCamera = function( x, y, cam ) {
	// eye space position is 0/0/0
	// eye space direction follows from projection
	this.resetHit ( );
			
	// just use a quick projection matrix trick (only works for centered projections)
	var myrawData = cam.projectionMatrix.data;
	this.esdx = x / myrawData[0];
	this.esdy = -y / myrawData[5];
	this.esdz = myrawData[10];
			
	var len = this.esdx*this.esdx + this.esdy*this.esdy + this.esdz*this.esdz;
	len = 1.0 / Math.sqrt(len);
	this.esdx *= len;
	this.esdy *= len;
	this.esdz *= len;	
			
	cam.updateWorldMatrix();
	var wm = cam.getWorldMatrix();
	// to world space
	var rawm = wm.data;
	this.wsox = rawm[12]; this.wsoy = rawm[13]; this.wsoz = rawm[14];
	this.wsdx = this.esdx * rawm[0] + this.esdy * rawm[4] + this.esdz * rawm[8];
	this.wsdy = this.esdx * rawm[1] + this.esdy * rawm[5] + this.esdz * rawm[9];
	this.wsdz = this.esdx * rawm[2] + this.esdy * rawm[6] + this.esdz * rawm[10];	
			
	//console.log ( "wspos: "+this.wsox.toString()+", "+this.wsoy.toString()+", "+this.wsoz.toString() );
	//console.log ( "wsdir: "+this.wsdx.toString()+", "+this.wsdy.toString()+", "+this.wsdz.toString() );
			
	this.ox = this.wsox; this.oy = this.wsoy; this.oz = this.wsoz;
	this.dx = this.wsdx; this.dy = this.wsdy; this.dz = this.wsdz;								
} 
		
SSGPickRay.prototype.updateRayFromObject = function( obj ) {
	// assumes that the ws parts of the ray are set
	obj.updateWorldMatrix (); 
	var imv = obj.getWorldMatrix().clone();
	imv.invert ( );
	var rawm = imv.data;
	this.ox = this.wsox * rawm[0] + this.wsoy * rawm[4] + this.wsoz * rawm[8] + rawm[12];
	this.oy = this.wsox * rawm[1] + this.wsoy * rawm[5] + this.wsoz * rawm[9] + rawm[13];
	this.oz = this.wsox * rawm[2] + this.wsoy * rawm[6] + this.wsoz * rawm[10] + rawm[14];
			
	this.dx = this.wsdx * rawm[0] + this.wsdy * rawm[4] + this.wsdz * rawm[8];
	this.dy = this.wsdx * rawm[1] + this.wsdy * rawm[5] + this.wsdz * rawm[9];
	this.dz = this.wsdx * rawm[2] + this.wsdy * rawm[6] + this.wsdz * rawm[10];		
			
	//trace ( "ospos: "+ox.toString()+", "+oy.toString()+", "+oz.toString() );
	//trace ( "osdir: "+dx.toString()+", "+dy.toString()+", "+dz.toString() );
}
		
SSGPickRay.prototype.intersectBoundingBoxCheckOnly = function( extents ) {
	var idx = 1.0/this.dx;
	var idy = 1.0/this.dy;
	var idz = 1.0/this.dz;
			
	var temp;
			
	var tmin = (extents[0] - this.ox)*idx;
	var tmax = (extents[3] - this.ox)*idx; 
	if ( tmin > tmax ) { temp = tmin; tmin = tmax; tmax = temp; }

	var tmin2 = (extents[1] - this.oy)*idy;
	var tmax2 = (extents[4] - this.oy)*idy; 
	if ( tmin2 > tmax2 ) { temp = tmin2; tmin2 = tmax2; tmax2 = temp; }			

	if ( tmin2 >= tmax || tmax2 <= tmin ) return false; // intervals do not overlap
	// shrink
	if ( tmin2 > tmin ) tmin = tmin2; 
	if ( tmax2 < tmax ) tmax = tmax2;

	tmin2 = (extents[2] - this.oz)*idz;
	tmax2 = (extents[5] - this.oz)*idz; 
	if ( tmin2 > tmax2 ) { temp = tmin2; tmin2 = tmax2; tmax2 = temp; }
		
	if ( tmin2 >= tmax || tmax2 <= tmin ) return false; // intervals do not overlap
	// shrink
	if ( tmin2 > tmin ) tmin = tmin2; 
	if ( tmax2 < tmax ) tmax = tmax2;

	// check before cam
	if ( tmax < 0 || tmin > this.thit ) return false;
			
	return true;			
}
		
		
		
SSGPickRay.prototype.intersectTriangle_W = function( points, o0, o1, o2, obj ) {
	// ingo wald based projection method (http://www.mpi-sb.mpg.de/~wald/PhD)
	// (broken... fixme)
	// calc edges and normal
	this.tests++;
	var e1x = points[o2+0] - points[o0+0];
	var e1y = points[o2+1] - points[o0+1];
	var e1z = points[o2+2] - points[o0+2];
	// e2=p2-p0		
	var e2x = points[o1+0] - points[o0+0];
	var e2y = points[o1+1] - points[o0+1];
	var e2z = points[o1+2] - points[o0+2];
	// n=e1 x e2
	var nx = e1y*e2z - e1z*e2y;
	var ny = e1z*e2x - e1x*e2z;
	var nz = e1x*e2y - e1y*e2x;
	// distance test
	var oan = (this.ox-points[o0+0])*nx + (this.oy-points[o0+1])*ny + (this.oz-points[o0+2])*nz;
	var dn = this.dx*nx + this.dy*ny + this.dz*nz;  
	var t = -oan / dn;
	if ( !(t>this.eps) ) return false;
	if ( nx<0 ) nx=-nx;
	if ( ny<0 ) ny=-ny;
	if ( nz<0 ) nz=-nz;
	var u, v, beta, gamma, ci;
	if ( nx > ny ) {
		if ( nx > nz ) {
			// k=0; u=1, v=2
			u = this.oy + t * dy;
			v = this.oz + t * dz;
			ci = 1.0/(e1y*e2z - e1z*e2y);
			beta = (e1y*v - e1z*u) * ci;
			gamma = (e2z*u - e2y*v) *ci;					
		} else {
			// k=2; u=0, v=1
			u = this.ox + t * dx;
			v = this.oy + t * dy;				
			ci = 1.0/(e1x*e2y - e1y*e2x);
			beta = (e1x*v - e1y*u) * ci;
			gamma = (e2y*u - e2x*v) *ci;	
		}
	}  else {
		if ( ny > nz ) {
			// k=1, u=2, v=0
			u = this.oz + t * this.dz;
			v = this.ox + t * this.dx;
			ci = 1.0/(e1z*e2x - e1x*e2z);
			beta = (e1z*v - e1x*u) * ci;
			gamma = (e2x*u - e2z*v) *ci;											
		} else {
			// k=2, u=0, v=1
			u = this.ox + t * this.dx;
			v = this.oy + t * this.dy;
			ci = 1.0/(e1x*e2y - e1y*e2x);
			beta = (e1x*v - e1y*u) * ci;
			gamma = (e2y*u - e2x*v) *ci;										
		}
	}		
			
	if ( !(beta >= 0) ) return false;
	if ( !(gamma >= 0 && beta+gamma < 1) ) return false;
								
	this.hitcount ++;			
	if ( t<this.thit ) {
		this.thit = t;
		this.objhit = obj;
		this.uhit = beta;
		this.vhit = gamma;
	}				
	return true;							
}		
		
SSGPickRay.prototype.intersectTriangle_HM = function( points, o0, o1, o2, obj ) {
	// barycentric haines/moller test (http://www.ddj.com/184404201?pgno=1)
	// e1=p1-p0
	this.tests++;
	var e1x = points[o1+0] - points[o0+0];
	var e1y = points[o1+1] - points[o0+1];
	var e1z = points[o1+2] - points[o0+2];
	// e2=p2-p0		
	var e2x = points[o2+0] - points[o0+0];
	var e2y = points[o2+1] - points[o0+1];
	var e2z = points[o2+2] - points[o0+2];	
	// r=d x e2
	var rx = this.dy*e2z - this.dz*e2y;
	var ry = this.dz*e2x - this.dx*e2z;
	var rz = this.dx*e2y - this.dy*e2x;
	// a=e1 . r
	var a = e1x*rx + e1y*ry + e1z*rz;
						
	if ( a < this.eps ) return false; // too parallel or backface 				
			
	// s=o-p0
	var sx = this.ox - points[o0+0];
	var sy = this.oy - points[o0+1];
	var sz = this.oz - points[o0+2]; 

	// q = s x e1
	var qx = sy*e1z - sz*e1y;
	var qy = sz*e1x - sx*e1z;
	var qz = sx*e1y - sy*e1x;		
									
	//  f=1/a 	
	var f = 1.0/a;
			
	// u=s . r			
	var u = (sx*rx + sy*ry + sz*rz)*f;
	// v=d . q			
	var v = (this.dx*qx + this.dy*qy + this.dz*qz)*f;
									
	if (u<0.0 || u>1.0) return false;
	if (v<0.0 || u+v>1.0) return false;
			  	
	// t=f * (e2 . q)
	var t = (e2x*qx + e2y*qy + e2z*qz)*f;
	if ( t>0 ) {
		this.hitcount ++;			
		if ( t<this.thit ) {
			this.thit = t;
			this.objhit = obj;
			this.uhit = u;
			this.vhit = v;
		}				
	}
			
	return true; 			
}
		
SSGPickRay.prototype.getWorldSpaceX = function( ) { return this.wsox+this.wsdx*this.thit; }
SSGPickRay.prototype.getWorldSpaceY = function( ) { return this.wsoy+this.wsdy*this.thit; }
SSGPickRay.prototype.getWorldSpaceZ = function( ) { return this.wsoz+this.wsdz*this.thit; }
		
SSGPickRay.prototype.getWorldSpace = function( ) { 
	return new [this.wsox+this.wsdx*this.thit, 
						  this.wsoy+this.wsdy*this.thit, 
						  this.wsoz+this.wsdz*this.thit ]; 
}
			
SSGPickRay.prototype.getObjectSpace = function( ) { 
	var ws = getWorldSpace ( );
	var wsmatrix = this.objhit.getWorldMatrix().clone();
	wsmatrix.invert();
	return wsmatrix.transformVector(ws); 
}
		
SSGPickRay.prototype.getEyeSpace = function( cam  ) { 
	var ws  = this.getWorldSpace ( );			
	var wm  = cam.getWorldMatrix().clone();
	wm.invert();
	return wm.transformVector(ws); 
}

function SSGCamera() {
	SSGNode.call(this);
	this.aspect = 1;
	this.fovDegrees = 70;
	this.zNear = 0.02;
	this.zFar = 40.0;
	this.projectionMatrix = new Matrix3D();		
	this.updateProjectionMatrix( );	
}

SSGCamera.prototype = Object.create(SSGNode.prototype);
		
SSGCamera.prototype.getProjectionMatrix = function() {
	this.updateProjectionMatrix();
	return this.projectionMatrix;
}

SSGCamera.prototype.updateProjectionMatrix = function() {
	var yval = this.zNear * Math.tan(this.fovDegrees * Math.PI / 360.0);
	var xval = yval * this.aspect;	
	this.projectionMatrix = this.makeFrustumMatrix(-xval,xval,-yval,yval,this.zNear, this.zFar);
}	
		
SSGCamera.prototype.xScaleFromZ = function( z ) {					
	return -z*Math.tan(fovDegrees * Math.PI / 360.0) * aspect;					
}
				
SSGCamera.prototype.makeFrustumMatrix = function( left, right, top, bottom, zNear, zFar) {
	var rval = new Matrix3D();
	var myrawData = [];
		
	myrawData[0] = (2*zNear)/(right-left);
	myrawData[1] = 0;
	myrawData[2] = (right+left)/(right-left);
	myrawData[3] = 0;
			
	myrawData[4] = 0;	
	myrawData[5] = (2*zNear)/(top-bottom);		
	myrawData[6] = (top+bottom)/(top-bottom);		
	myrawData[7] = 0;
		
	myrawData[8] = 0;
	myrawData[9] = 0;
	myrawData[10]= zFar/(zNear-zFar);	 
	myrawData[11]= -1;		
			
	myrawData[12]=  0;
	myrawData[13]=  0;
	myrawData[14]=  (zNear*zFar)/(zNear-zFar);	
	myrawData[15]=	0;
				
	rval.data = myrawData;	
	return rval;
}			
		
SSGCamera.prototype.interactiveRotateFirstPerson = function( dx, dy ) {
	if ( dx!=0 ) this.objmatrix.prependRotation(dx,[0,1,0]);
	if ( dy!=0 ) this.objmatrix.prependRotation(dy,[1,0,0]);
	this.matrixdirty = true;
}
		
SSGCamera.prototype.interactiveForwardFirstPerson = function( amount ) {
	this.objmatrix.prependTranslation(0,0,-amount);			
	this.matrixdirty = true;					
} 

SSGCamera.prototype.interactiveStrafeFirstPerson = function( dx, dy ) {
	this.objmatrix.prependTranslation(dx,dy,0);			
	this.matrixdirty = true;
} 

function SSGNode() {
	this.parent = null;
	this.objmatrix = new Matrix3D();
	this.objmatrix.identity();
	this.children = new Array();
	this.matrixdirty = true;
	this.worldpos = new Array();

	this.matrixdirty = false;
	this.ssgbase;
	this.worldmatrix = new Matrix3D();
	//aaronc: added name parameter for ray tracing test
	this.name = "node";
		
	this.hidden = false;
	return this;
}
		
SSGNode.prototype.addNode = function( node ) {			
	this.children.push(node);			
	node.ssgbase = this.ssgbase;
	node.parent = this;
	node.dirtyMeAndAllChildren ( );
}		
		
SSGNode.prototype.setPosition = function ( x, y, z ) {
	this.objmatrix.position = [x,y,z];
	this.dirtyMeAndAllChildren ( );
}
				
SSGNode.prototype.move = function( dx, dy, dz ) {
	this.objmatrix.appendTranslation ( dx, dy, dz );
	this.dirtyMeAndAllChildren ( );
}
		
SSGNode.prototype.identity = function ( ) {
	this.objmatrix.identity();
	this.dirtyMeAndAllChildren ( );
} 
		
SSGNode.prototype.eulerRotate = function( rxDegrees, ryDegrees, rzDegrees ) {			
	this.objmatrix.prependRotation(rxDegrees,[1,0,0]); 
	this.objmatrix.prependRotation(ryDegrees,[0,1,0]); 
	this.objmatrix.prependRotation(rzDegrees,[0,0,1]);
	this.dirtyMeAndAllChildren ( );
}		
		
SSGNode.prototype.eulerRotatePost = function( rxDegrees, ryDegrees, rzDegrees ) {			
	this.objmatrix.appendRotation(rxDegrees,[1,0,0]); 
	this.objmatrix.appendRotation(ryDegrees,[0,1,0]); 
	this.objmatrix.appendRotation(rzDegrees,[0,0,1]);
	this.dirtyMeAndAllChildren ( );
}				
		
SSGNode.prototype.lookAt = function ( target ) {	
	this.dirtyMeAndAllChildren ( );
} 
				
SSGNode.prototype.pickRec = function ( dest, ray ) {
	if ( !this.hidden ) this.pick ( dest, ray );
	for (var i in this.children)
		this.children[i].pickRec ( dest, ray );			
}
				
SSGNode.prototype.pick = function( dest, ray ) {
	// implement!
}				
						
SSGNode.prototype.renderRec = function( dest ) {
	if ( !this.hidden ) {
		this.render ( dest );
		for (var i in this.children) {
			this.children[i].renderRec ( dest );
		}
	}
}
		
SSGNode.prototype.render = function( dest ) {
	// implement!			
}		
		
SSGNode.prototype.getWorldMatrix = function( ) {
	this.updateWorldMatrix();
	return this.worldmatrix;
}
				
SSGNode.prototype.updateWorldMatrix = function( ) {
	if ( !this.matrixdirty ) return;			
	if ( this.parent != null ) {
		this.parent.updateWorldMatrix();
		this.worldmatrix = this.parent.worldmatrix.clone();			
	} else {
		this.worldmatrix = new Matrix3D();
		this.worldmatrix.identity();
	}
	this.worldmatrix.prepend ( this.objmatrix );
	this.matrixdirty = false;
}
		
SSGNode.prototype.updateWorldSpacePosition = function( ) {
	this.updateWorldMatrix ( );
	var temp = new Array();
	temp[0] = 0; temp[1] = 0; temp[2] = 0; temp[3] = 1;
	this.worldmatrix.transformVectors ( temp, this.worldpos );
}
		
SSGNode.prototype.dirtyMeAndAllChildren = function( ) {
	if ( this.matrixdirty ) return; // already done
	this.matrixdirty = true;
	for (var i in this.children)
		this.children[i].dirtyMeAndAllChildren();
}
		
SSGNode.prototype.collectThingsToArrayRec = function( type, dest ) {
	if ( typeof(this) == type ) dest.push( this );
	for( var i in this.children )
		this.children[i].collectThingsToArrayRec ( type, dest );
} 
		
SSGNode.prototype.setDefaultVertexMatrices = function( dest, model) {
	dest.context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, model, true );
	model.append ( dest.view );
	dest.context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 8, model, true ); // modelview
	model.append ( dest.projection );
	dest.context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 16, model, true ); // modelviewprojection			
}	

function SSGPickTree() {
	this.root;
	this.createtimer;
	this.timerCount = 0;
	this.totalTimes = 10000;
		
	this.stack = [];
	this.useverts = [];
	this.usemaxdepth;
	this.useminsplit;
			
	return this;
}
		
SSGPickTree.prototype.countNodes = function( leafonly ) {
	if ( this.root==null ) return 0;
	return this.root.countNodes(leafonly);
}
		
SSGPickTree.prototype.create = function( vertices, npv, indices, maxdepth, minsplit ) {
	// blocking version 
	this.createBegin ( vertices, npv, indices, maxdepth, minsplit );
	while ( this.createContinue(1000)!=0 ) { } 
}
		
SSGPickTree.prototype.createInTimer = function( vertices, npv, indices, maxdepth, minsplit) {
	if ( this.createtimer != null ) window.clearInterval(this.createtimer);
	else this.createtimer = setInterval(this.createTimerFunc,10);
	this.createBegin ( vertices, npv, indices, maxdepth, minsplit );			
}
		
SSGPickTree.prototype.createTimerFunc = function( e ) {
	this.timerCount ++;
	if (timerCount >= 10000 || (createContinue(10)==0)) {
		window.clearInterval(this.createtimer);
		createtimer = null;
	}
}
		
SSGPickTree.prototype.createBegin = function( vertices, npv, indices, maxdepth, minsplit) {
	// create one node 				
	this.root = new SSGPickTreeNode();
	this.root.leaf = new Array();
	for ( var i = 0; i<indices.length; i++ ) this.root.leaf.push ( indices[i]*npv );
			
	var maxx = vertices[this.root.leaf[0]+0];
	var minx = maxx;
	var maxy = vertices[this.root.leaf[0]+1]; 
	var miny = maxy;
	var maxz = vertices[this.root.leaf[0]+2]; 
	var minz = maxz;
	for ( i=1; i<this.root.leaf.length; i++ ) {
		if ( vertices[this.root.leaf[i]+0]>maxx ) maxx = vertices[this.root.leaf[i]+0]; if ( vertices[this.root.leaf[i]+0]<minx ) minx = vertices[this.root.leaf[i]+0];
		if ( vertices[this.root.leaf[i]+1]>maxy ) maxy = vertices[this.root.leaf[i]+1]; if ( vertices[this.root.leaf[i]+1]<miny ) miny = vertices[this.root.leaf[i]+1];
		if ( vertices[this.root.leaf[i]+2]>maxz ) maxz = vertices[this.root.leaf[i]+2]; if ( vertices[this.root.leaf[i]+2]<minz ) minz = vertices[this.root.leaf[i]+2]; 
	}			
	// start
	this.useverts = vertices;
	this.usemaxdepth = maxdepth;
	this.useminsplit = minsplit;
					
	this.stack = new Array();			
	this.stack.push(new SSGPickTreeNodeSubdivState(this.root,0,minx, maxx, miny, maxy, minz, maxz) );
}
		
SSGPickTree.prototype.createContinue = function( n ) {
	if ( this.stack==null ) return 0;
	while ( this.stack.length>0 && n>0 ) {
		var state = this.stack.pop();
		state.node.subdivide ( this, this.useverts, state );
				
		n--;
	}
	if ( this.stack.length==0 ) {
		this.stack = null;
		return 0;				
	}
	return this.stack.length;
}
		
SSGPickTree.prototype.intersect = function( ray, vertices, hit ) {
	if ( this.root == null ) return;
	//var startnode = root.FindNode ( ray.ox, ray.oy, ray.oz );			
	this.root.intersect ( ray, vertices, hit, 0, ray.thit ) 
}


function SSGPickTreeNode () {
	this.leaf = [];
	// only for inner 
	this.axis;
	this.d;
	this.left;
	this.right;	

	return this;
}
	
SSGPickTreeNode.prototype.countNodes = function( leafonly ) {
	if ( this.leaf!=null ) return 1;		
	return this.left.countNodes(leafonly) + this.right.countNodes(leafonly) + (leafonly?0:1);			
}
	
SSGPickTreeNode.prototype.intersectAxis = function( oray, dray, ray, vertices, hit, t0, t1) {
	var ps0 = dray * t0 + oray; // the side we start on
	var ps1 = dray * t1 + oray; // the side we end on
	var nearnode = ps0<=this.d?this.left:this.right;
	var farnode = ps1<=this.d?this.left:this.right;
		
	if ( farnode == nearnode ) 
	return farnode.intersect(ray,vertices,hit,t0,t1);		
						
	var tplane = (this.d-oray) / dray; // the intersection of the split plane and the ray
				
	if ( nearnode.intersect ( ray, vertices, hit, t0, tplane ) ) return true;
	return farnode.intersect ( ray, vertices, hit, tplane, t1);								
}
	
SSGPickTreeNode.prototype.intersect = function( ray, vertices, hit, t0, t1 ) {
	if ( !(t0<t1) ) return false;
	if ( this.leaf!=null ) {
		var didhit = false;
		// really only intersect in t0..t1 if we need accurate t results (that is, if we need to gurantee closest t)
		for ( var i = 0; i<this.leaf.length; i+=3 ) {
			if ( ray.intersectTriangle_HM(vertices,this.leaf[i], this.leaf[i+1], this.leaf[i+2], hit ) ) {
				didhit = true;
			}
		}
		return didhit; 
	} else {
		// figure out where to go to first, and if to go there
			
		if ( this.axis==0 ) return this.intersectAxis ( ray.ox, ray.dx, ray, vertices, hit, t0, t1 );
		if ( this.axis==1 ) return this.intersectAxis ( ray.oy, ray.dy, ray, vertices, hit, t0, t1 );
		if ( this.axis==2 ) return this.intersectAxis ( ray.oz, ray.dz, ray, vertices, hit, t0, t1 );
			
		return false;					
	}
}
	
SSGPickTreeNode.prototype.findNode = function( x, y, z) {
	if ( this.leaf!=null ) return this; 
	if ( this.axis==0 ) {
		if ( x <= d ) return this.left.findNode(x,y,z);
		else return this.right.findNode(x,y,z);
	}
	if ( this.axis==1 ) {
		if ( y <= d ) return this.left.findNode(x,y,z);
		else return this.right.findNode(x,y,z);
	}
	if ( this.axis==2 ) {
		if ( z <= d ) return this.left.findNode(x,y,z);
		else return right.FindNode(x,y,z);
	}
	return null;
}
	
SSGPickTreeNode.prototype.subdivide = function( caller, vertices, state ) {		
	if ( caller.usemaxdepth<=state.depth || caller.useminsplit>=this.leaf.length ) return; // done
		// compute bounds ( this should be tracked... :/)
	var i;
		
	var leftx = state.maxx; 
	var lefty = state.maxy; 
	var leftz = state.maxz;
	var rightx = state.minx; 
	var righty = state.miny; 
	var rightz = state.minz;
	// split median along longest axis
	if ( state.maxx - state.minx > state.maxy - state.miny ) {
		if ( state.maxx - state.minx > state.maxz - state.minz ) {
			this.axis = 0;
			this.d = (state.maxx + state.minx)*.5;
			leftx = this.d; rightx = this.d;
		} else {
			this.axis = 2;
			this.d = (state.maxz + state.minz)*.5;
			leftz = this.d; rightz = this.d;
		}
	} else {
		if ( state.maxy - state.miny > state.maxz - state.minz ) {
			this.axis = 1;
			this.d = (state.maxy + state.miny)*.5;
			lefty = this.d; righty = this.d;
		} else {
			this.axis = 2;
			this.d = (state.maxz + state.minz)*.5;
			leftz = this.d; rightz = this.d;
		}			
	}
		
	// assign tris to new leaves
	this.left = new SSGPickTreeNode ( );
	this.left.leaf = new Array();		
	this.right = new SSGPickTreeNode ( );
	this.right.leaf = new Array();				
		
	var nleft = 0;
	var nright = 0;
		
	for ( i=0; i<this.leaf.length; i+=3 ) {
		var goleft = false;
		var goright = false;									
		if ( vertices[this.leaf[i+0]+this.axis] <= this.d ) goleft = true; 
		if ( vertices[this.leaf[i+0]+this.axis] >= this.d ) goright = true;
		if ( vertices[this.leaf[i+1]+this.axis] <= this.d ) goleft = true; 
		if ( vertices[this.leaf[i+1]+this.axis] >= this.d ) goright = true;
		if ( vertices[this.leaf[i+2]+this.axis] <= this.d ) goleft = true; 
		if ( vertices[this.leaf[i+2]+this.axis] >= this.d ) goright = true;			 
		if ( goleft ) { nleft++; this.left.leaf.push(this.leaf[i]); this.left.leaf.push(this.leaf[i+1]); this.left.leaf.push(this.leaf[i+2]); }
		if ( goright ) { nright++; this.right.leaf.push(this.leaf[i]); this.right.leaf.push(this.leaf[i+1]); this.right.leaf.push(this.leaf[i+2]); } 
	}		
	if ( nleft==this.leaf.length/3 && nright==this.leaf.length/3 ) { // bad split
		this.right = null;
		this.left = null;
	} else {
		this.leaf = null;	
		caller.stack.push ( new SSGPickTreeNodeSubdivState(this.left,state.depth+1,state.minx, leftx, state.miny, lefty, state.minz, leftz) );
		caller.stack.push ( new SSGPickTreeNodeSubdivState(this.right,state.depth+1,rightx, state.maxx, righty, state.maxy, rightz, state.maxz) );			
	}					
}
	

function SSGPickTreeNodeSubdivState (_node, _depth, _minx, _maxx, _miny, _maxy, _minz, _maxz ) {
	this.minx = _minx; 
	this.maxx = _maxx; 
	this.miny = _miny; 
	this.maxy = _maxy; 
	this.minz = _minz; 
	this.maxz = _maxz;
	this.depth = _depth;
	this.node = _node;
	return this;
} 

function SSGProceduralGeometry() {
	SSGMesh.call(this);
}

SSGProceduralGeometry.prototype = Object.create(SSGMesh.prototype);

SSGProceduralGeometry.prototype.mergeTipVertex = function( uTess, vTess ) {
	var x;
	var os = 0;
	var o = 0;
	for ( var i  = 0; i<2; i++ ) {
		for ( x=0; x<uTess; x++ ) {
			this.vertices_mem[o+0] = this.vertices_mem[os+0];
			this.vertices_mem[o+1] = this.vertices_mem[os+1];
			this.vertices_mem[o+2] = this.vertices_mem[os+2];
			this.vertices_mem[o+3] = this.vertices_mem[os+3];
			this.vertices_mem[o+4] = this.vertices_mem[os+4];
			this.vertices_mem[o+5] = this.vertices_mem[os+5];
			this.vertices_mem[o+6] = this.vertices_mem[os+6];
			this.vertices_mem[o+7] = this.vertices_mem[os+7];
			o += 8;
		}
		o = ((vTess-1)*uTess)*8;
		os = o;
	}
}

SSGProceduralGeometry.prototype.createSuperSphere = function( uTess, vTess, r, n1, n2 ) {
	var me = this;
	var myeval = function( u, v, dest, o) 
		{ me.evalVertexSuperSphere ( r, n1, n2, u, v, me.vertices_mem, o ); };
	this.createUV ( uTess, vTess, true, false, myeval );
	this.mergeTipVertex ( uTess, vTess );
	this.createVertexNormals();
}
		
SSGProceduralGeometry.prototype.createDonut = function( uTess, vTess, rInner, rOuter ) {
	var me = this;
	var myeval = function( u, v, dest, o)  
		{ me.evalVertexTorus ( rInner, rOuter, u, v, me.vertices_mem, o ); };
	this.createUV ( uTess, vTess, true, true, myeval );
}
		
SSGProceduralGeometry.prototype.createPlane = function( uTess, vTess, sizeX, sizeZ) {
	var me = this;
	var myeval = function( u, v, dest, o )  
		{ me.evalVertexPlane ( sizeX, sizeZ, (u-.5)*2, (v-.5)*2, me.vertices_mem, o ); };
	this.createUV ( uTess, vTess, false, false, myeval );
}		
		
SSGProceduralGeometry.prototype.createSphere = function( uTess, vTess, radius ) {
	var me = this;
	var myeval = function( u, v, dest, o  )  
		{ me.evalVertexSphere ( radius, u, v, me.vertices_mem, o ); };
	this.mergeTipVertex ( uTess, vTess );				
	this.createUV ( uTess, vTess, false, false, myeval );			
}
		
SSGProceduralGeometry.prototype.createTube = function( uTess, vTess, radius ) {
	var me = this;
	var myeval = function( u, v, dest, o ) 
		{ me.evalVertexTube ( radius, u, v, me.vertices_mem, o ); };
	this.createUV ( uTess, vTess, false, false, myeval );		
}
		
SSGProceduralGeometry.prototype.createTree = function( uTess, vTess, radius, controls ) { 
	var me = this;
	var myeval = function( u, v, dest, o ) 
		{ me.evalVertexExtruder ( radius, controls, u, v, me.vertices_mem, o ); };
	this.createUV ( uTess, vTess, false, false, myeval );
}
		
SSGProceduralGeometry.prototype.createUV = function( uTess, vTess, closedU, closedV, evalme ) {			
	this.vertices_mem = new Array(uTess*vTess*8);
	this.indices_mem = new Array((uTess-1)*(vTess-1)*6);

	// vertices
	var o = 0;
	var v;
	var u;
	for ( v=0; v<vTess; v++ ) {		
		for ( u=0; u<uTess; u++ ) {		
			var un = u / (uTess-1);
			var vn = v / (vTess-1);									
			evalme ( un, vn, this.vertices_mem, o );
			this.vertices_mem[o+6] = un; // uv
			this.vertices_mem[o+7] = vn;			
			o+=8;
		}
	}
	// indices
	o = 0;
	var os =0;
	for ( v=0; v<vTess-1; v++ ) {
		for ( u=0; u<uTess-1; u++ ) {		
			this.indices_mem[o+0] = os;
			this.indices_mem[o+1] = os+1;			
			this.indices_mem[o+2] = os+uTess;						
			this.indices_mem[o+3] = os+1;
			this.indices_mem[o+4] = os+uTess+1;			
			this.indices_mem[o+5] = os+uTess;									
			o+=6;
			os++;
		}
		if ( closedU ) {					
			this.indices_mem[o-5] -= uTess-1;
			this.indices_mem[o-3] -= uTess-1;			
			this.indices_mem[o-2] -= uTess-1;															
		}
		os++;
	}	
			
	if ( closedV ) {
		o -= (uTess-1)*6;
		for ( u=0; u<uTess-1; u++ ) {
			this.indices_mem[o+2] = u;
			this.indices_mem[o+4] = u+1;			
			this.indices_mem[o+5] = u;		
			o+=6;				
		}
	}
				
	this.computeBoundingBoxAndSphere ( );
	this.needupload = true;
}		
		
SSGProceduralGeometry.prototype.evalVertexTorus = function( rInner, rOuter, u, v, dest, o ) {
	var ur = u * Math.PI*2;
	var vr = v * Math.PI*2;	
	dest[o+0] = ( rOuter + rInner * Math.cos(vr) ) * Math.cos(ur);
	dest[o+1] = ( rOuter + rInner * Math.cos(vr) ) * Math.sin(ur);
	dest[o+2] = rInner * Math.sin(vr);
			
	dest[o+3] = Math.cos(vr) * Math.cos(ur);
	dest[o+4] = Math.cos(vr) * Math.sin(ur);
	dest[o+5] = Math.sin(vr);	
}		
		
SSGProceduralGeometry.prototype.evalVertexExtruder = function( rBase, points, u, v, dest, o ) {
			// points are in x/y plane
	var pidx = int(u*(points.length/2-1))*2;			
	var x,y,dx,dy; 			
	x = points[pidx+0];
	y = points[pidx+1];
	if ( pidx >= 2 ) {
		dx = x - points[pidx-2];
		dy = y - points[pidx-1];
	} else {
		dx = points[pidx+2] - x;
		dy = points[pidx+3] - y; 			
	}
	var l = 1.0/Math.sqrt(dx*dx + dy*dy);
	dx *= l;
	dy *= l; 	
	var vr = v * Math.PI*2;	
	var r = rBase * (1.0-u*u); 
	var dl = Math.sin(vr);
	var dr = Math.cos(vr);
	dest[o+3] = dy * dr; 
	dest[o+4] = -dx * dr;
	dest[o+5] = dl; 
	dest[o+0] = x+dest[o+3]*r;  
	dest[o+1] = y+dest[o+4]*r;
	dest[o+2] = 0+dest[o+5]*r;						
}
		
SSGProceduralGeometry.prototype.evalVertexTube = function( r, u, v, dest, o ) {			
	var vr = v * Math.PI*2;	
	dest[o+0] = r * Math.sin(vr);
	dest[o+1] = -u;
	dest[o+2] = r * Math.cos(vr);
	dest[o+3] = Math.sin(vr);
	dest[o+4] = 0;
	dest[o+5] = Math.cos(vr);	
}		

SSGProceduralGeometry.prototype.evalVertexPlane = function( sizeX, sizeZ, u, v, dest, o ) {	
	dest[o+0] = u * sizeX;
	dest[o+1] = 0;
	dest[o+2] = v * sizeZ;
			
	dest[o+3] = 0;
	dest[o+4] = -1;
	dest[o+5] = 0;	
}
		
SSGProceduralGeometry.prototype.cospow = function( x, n ) {
	var c = Math.cos(x); 			
	if ( c<0 ) return -Math.pow(-c,n);
	else return Math.pow(c,n);;
}
		
SSGProceduralGeometry.prototype.sinpow = function( x, n ) {
	var c = Math.sin(x); 
	var cp = Math.pow(c,n); 
	if ( c<0 ) return -Math.pow(-c,n);
	else return Math.pow(c,n);;
}		
		
SSGProceduralGeometry.prototype.evalVertexSuperSphere = function( r, n1, n2, u, v, dest, o ) {
	var beta = (u-0.5) * 2.0 * Math.PI;
	var rho = (v-0.5) * Math.PI;
										
	dest[o+0] = r * this.cospow(rho,n1) * this.cospow(beta,n2); 
	dest[o+1] = r * this.cospow(rho,n1) * this.sinpow(beta,n2);
	dest[o+2] = r * this.sinpow(rho,n1);
						
	dest[o+3] = 0; //cospow(rho,2-n1) * cospow(beta,2-n2);
	dest[o+4] = 0; //cospow(rho,2-n1) * sinpow(beta,2-n2);
	dest[o+5] = 0; //sinpow(rho,2-n1);
}				

		
SSGProceduralGeometry.prototype.evalVertexSphere = function( radius, u, v, dest, o ) {
	var ur = u * Math.PI;
	var vr = v * Math.PI*2;
	var x = Math.sin(ur)*Math.cos(vr);
	var y = Math.sin(ur)*Math.sin(vr);
	var z = Math.cos(ur);
	dest[o+0] = x*radius;
	dest[o+1] = y*radius;
	dest[o+2] = z*radius;
	dest[o+3] = x;
	dest[o+4] = y;
	dest[o+5] = z;						 										
}

function SSGBunny () {
	SSGMesh.call(this);
	this.loadscalex, this.loadscaley, this.loadscalez;
	this.loadoffset;
	this.loadlines = [];
	this.loadnotify;
	this.vertexregex;
	this.faceregex;		
}

SSGBunny.prototype = Object.create(SSGMesh.prototype);
		
SSGBunny.prototype.loadPLY = function( source, scalex, scaley, scalez) {
    console.log("loading PLY");
    var request = new XMLHttpRequest();
    request.main = this;
    try {
     	request.open("GET", source, true);
     } catch(e){
     	console.log(e.message);
     }     
     request.onreadystatechange = function () {
     	console.log('onreadystatechange');
     	if (this.readyState === 4) {  
        	// Makes sure the document is ready to parse.
        	if (this.status === 200) {  
             	// Makes sure it's found the file.
             	var s = request.responseText;  
             	this.main.loadHandler(s);
        	}
   		 }
   	}
   	request.send();
	this.loadscalex = scalex;
    this.loadscaley = scaley;
    this.loadscalez = scalez;
}

SSGBunny.prototype.processPLY = function() {
	console.log("processPLY");
	var line;
	var match = [];
	var i;
	for ( i=0; i<this.vertices_mem.length; i++ ) {				
		// read verts x y z
		line = this.loadlines.shift();
		match = this.vertexregex.exec(line);
        if ( match && match.length>3 ) {
            try {
                this.vertices_mem[this.loadoffset+0] = match[1].valueOf() * this.loadscalex;
                this.vertices_mem[this.loadoffset+1] = match[2].valueOf() * this.loadscaley;
                this.vertices_mem[this.loadoffset+2] = match[3].valueOf() * this.loadscalez;
                this.vertices_mem[this.loadoffset+3] = 0;
                this.vertices_mem[this.loadoffset+4] = 0;
                this.vertices_mem[this.loadoffset+5] = 0;
                this.vertices_mem[this.loadoffset+6] = 0;
                this.vertices_mem[this.loadoffset+7] = 0;
                this.loadoffset+=8;	
            } catch(e)	{
                    
            }			
        }
		if ( this.loadoffset >= this.vertices_mem.length ) {
			this.loadoffset = 0;
			break;
		}							
	}		
	if ( this.loadnotify ) this.loadnotify.textContent = ( "background loader vertex stage: "+(this.loadoffset/8).toString()+" of "+(this.vertices_mem.length/8).toString() );				
	for ( i=0; i<this.indices_mem.length; i++ ) {				
		// read faces
		line = this.loadlines.shift();
		match = this.faceregex.exec(line);	
		this.indices_mem[this.loadoffset+0] = match[1].valueOf();
		this.indices_mem[this.loadoffset+1] = match[2].valueOf();
		this.indices_mem[this.loadoffset+2] = match[3].valueOf();
		this.loadoffset+=3;					
		if ( this.loadoffset >= this.indices_mem.length ) {
			break;			
		}							
	}				
	if ( this.loadnotify ) this.loadnotify.textContent = ( "background loader index stage: "+(this.loadoffset/3).toString()+" of "+(this.indices_mem.length/3).toString() );		
	if ( this.loadnotify ) this.loadnotify.textContent = ( "background loader finalizer." );		
	// fix it
	this.createVertexNormals(); // blocks (can split)
	this.computeBoundingBoxAndSphere();// blocks	(can split)
	// begin picking
	this.picktree = new SSGPickTree();
	this.picktree.createBegin(this.vertices_mem,8,this.indices_mem, 8,8 );
	//GeneratePickTree(); //can split or make lazy				
	if ( this.loadnotify ) this.loadnotify.textContent = ( "background loader pick tree creator. Nodes: "+this.picktree.countNodes ( false ).toString() );	
			
	// done!
	this.needupload = true;	
	this.hidden = false;
	if ( this.loadnotify ) {					
		this.loadnotify.textContent = ( "background loader done." );
		document.getElementById("displayList").removeChild(loadnotify);  
		this.loadnotify = null;
	}
	//aaronc: dispatch event if we are listening for load complete
	//if(this.hasEventListener(Event.COMPLETE)) 
	//	this.dispatchEvent(new Event(Event.COMPLETE));
}
		
SSGBunny.prototype.loadHandler = function(s) {
	// one big string, parse it!
	var headerregex = new RegExp ( /ply(?:.|\n|\r)*element vertex (\d+)(?:.|\n|\r)*element face (\d+)(?:.|\n|\r)*end_header/ );	    
	this.vertexregex = new RegExp ( /^([-+]?[\d]*\.?[\d]+[eE]?[-+]?[\d]+)\s([-+]?[\d]*\.?[\d]+[eE]?[-+]?[\d]+)\s([-+]?[\d]*\.?[\d]+[eE]?[-+]?[\d]+)/ );
	this.faceregex = new RegExp (  /^3 (\d+) (\d+) (\d+)/ );		
	var header = headerregex.exec(s.slice ( 0, 1000 ));
	if ( header.length!=3 ) {
		console.log ( "bad ply!" );
		return;						
	}
	var match = [];
	var verts = header[1].valueOf();
	var faces = header[2].valueOf();
	var i;			
	if ( verts==0 || faces==0 ) {
		console.log ( "bad ply!" );
		return;			
	}
	// alloc
	this.vertices_mem = new Array(verts*8);
	this.indices_mem = new Array(faces*3);
			
	this.loadlines = s.slice(headerregex.lastIndex).split('\n');
	this.loadlines.shift();
	this.loadoffset = 0;
			
	this.hidden = true;
			
	this.processPLY();
}

function SSGHeightField () {
	SSGMesh.call(this);

	this.w;
	this.h;
	this.loadedImg;
	this.loadscalex;
	this.loadscaley;
	this.loadscaleh;
}

SSGHeightField.prototype = Object.create(SSGMesh.prototype);
		
SSGHeightField.prototype.loadFromFile = function( url, scalex, scaley, scaleh ) {
	if ( this.loadedImg ) return; // already loading?
				
	this.loadscalex = scalex;
	this.loadscaley = scaley;
	this.loadscaleh = scaleh;

	this.loadedImg = new Image();
	this.loadedImg.onload = this.imageLoadedHandler;
	this.loadedImg.main = this;
	this.loadedImg.src = url;          			
}
				
SSGHeightField.prototype.imageLoadedHandler = function( e ) {
	console.log("w: " + this.main.loadedImg.width + ", h: " +  this.main.loadedImg.height);
	var bmd = BitmapData.fromSize(this.main.loadedImg.width,this.main.loadedImg.height);
	bmd.draw(this.main.loadedImg);					
	this.main.createFromBitmapData ( bmd, this.main.loadscalex,this.main.loadscaley,this.main.loadscaleh );
} 		
		
SSGHeightField.prototype.createFromBitmapData = function( input, scalex, scaley, scaleh ) {
	var reindex = false;
	if ( this.w!=input.width || this.h!=input.height ) {
		this.w = input.width;
		this.h = input.height; 			
		this.vertices_mem = new Array(this.w*this.h*8);			
		this.indices_mem = new Array((this.w-1)*(this.h-1)*6);
		reindex = true;
	}
	var x;
	var y;			
	var o = 0;
	var oi = 0;
	var os = 0;
		
	var scaleu = 1.0 / (this.w-1);
	var scalev = 1.0 / (this.h-1); 
	scalex *= scaleu;
	scaley *= scalev;
	var nz = 255/scaleh;
	scaleh *= 1.0 / 255.0;
								
	for ( y=0; y<this.h; y++ ) {								
		for ( x=0; x<this.w; x++ ) {
			this.vertices_mem[o+0] = x*scalex;
			this.vertices_mem[o+1] = y*scaley;
			this.vertices_mem[o+2] = scaleh * (input.getPixel(x,y) & 0xff);
			// normalize
			var nx = (input.getPixel(x-1,y) & 0xff) 
			nx -= (input.getPixel(x+1,y) & 0xff);
			var ny = (input.getPixel(x,y-1) & 0xff);
			ny -= (input.getPixel(x,y+1) & 0xff);
			nx /= scalex;
			ny /= scaley;
					
			var len = nx*nx + ny*ny + nz*nz; 
			if ( len==0 ) {
				this.vertices_mem[o+3] = 0;
				this.vertices_mem[o+4] = 0;
				this.vertices_mem[o+5] = 1;						
			} else {	
				len = 1.0 / Math.sqrt(len);							
				this.vertices_mem[o+3] = nx * len;
				this.vertices_mem[o+4] = ny * len;
				this.vertices_mem[o+5] = nz * len;
			}									
			this.vertices_mem[o+6] = x*scaleu;
			this.vertices_mem[o+7] = y*scalev;
			o+=8;					
		}
		if ( y!=this.h-1 && reindex ) {					
			for ( x=0; x<this.w-1; x++ ) {													
				this.indices_mem[oi+0] = os;
				this.indices_mem[oi+1] = os+1+this.w;
				this.indices_mem[oi+2] = os+this.w;
				this.indices_mem[oi+3] = os;
				this.indices_mem[oi+4] = os+1;
				this.indices_mem[oi+5] = os+this.w+1;
				oi+=6;
				os++;						
			} 					
			os++;							
		}				
	}
	this.computeBoundingBoxAndSphere();
	this.needupload = true;											
} 		