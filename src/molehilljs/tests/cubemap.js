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

function Test_CubeMap( testenv ) {
	var ctx;
	var cubeMap; 
	var texture;		    
    var vertexBuffer, indexBuffer, shaderProgram; 
    var imgCount = 0;
    var total_images = 6;

	function OnContext3DCreated( newctx ) {
		ctx = newctx;
        			
		// programs			
		var agalbytes = AssembleAGAL(
			"part fragment 1        \n" +
			"tex ft1, v2, fs0 <cube,linear,clamp,mipnone> \n" + //note: cubemaps MUST emit clamp(todo, enforce in miniasm also!) 
			"mul ft1, ft1, fc0		\n" +
			"tex ft2, v1, fs1 <2d,linear,miplinear> \n" +
			"mul ft2, ft2, fc1		\n" +
			"add ft1, ft1, ft2		\n" +
			"tex ft3, v1, fs2 <cube,linear,clamp,mipnone> \n" +
			"sub ft3.x, ft3.x, fc2.x \n"+
			"kil ft3.x				 \n" +
			//"mov ft3, ft3.w \n" +
			"mov oc, ft1			\n" +
			"endpart				\n\n"+
			"part vertex 1			\n" +
			"m44 op, va0, vc0		\n" + // pos to clipspace				
			//"m34 v2.xyz, va1, vc0	\n" + // transform normal
			"dp3 v2.x, va1, vc0		\n" + // transform normal
			"dp3 v2.y, va1, vc1		\n" + // transform normal
			"dp3 v2.z, va1, vc2		\n" + // transform normal
			"mov v2.w, vc3.w		\n" +
			"mov v0, va1			\n" + // copy normal
			"mov v1, va2			\n" + // copy uv
			"endpart				\n"
			);
			
			
        shaderProgram = ctx.createProgram();
        shaderProgram.uploadFromAGALByteArray(agalbytes.vertex.data, agalbytes.fragment.data);
        
        // mesh
        makePlaneMesh( evalDonut, 64, 32 );
        
        // load cubeMap
        cubeMap = ctx.createCubeTexture( 512, Context3DTextureFormat.BGRA, false );                    
                
        // a real cube map
        var skyBitmaps = [];
        for ( var i=0; i<6; i++ ) {
            skyBitmaps[i] = new Image();
            skyBitmaps[i].src = "res/cubesky_c0"+i+".png";
		    skyBitmaps[i].crossOrigin = "anonymous";            
            skyBitmaps[i].side = i; 
            skyBitmaps[i].onload = function ( ) {
                console.log ( "Loaded side "+this.side+" "+this.src+" w="+this.width+" h="+this.height );
                uploadCubeTextureWithMipmaps(cubeMap, this);
                imgCount++;
                checkEnterFrame();
            }
        }        
        
        // load a texture
        texture = ctx.createTexture( 256, 256, Context3DTextureFormat.BGRA, false );
        var imageObj = new Image();		
        imageObj.src = "res/testpat.png";
        imageObj.crossOrigin = "anonymous";		
        imageObj.onload = function() {		
            uploadTextureWithMipmaps(texture, imageObj);
            imgCount++;
            checkEnterFrame();
        }		     
	}	

	function uploadCubeTextureWithMipmaps(dest, src) {
	    var ws = src.width;
	    var hs = src.height;
	    dest.uploadFromImage(src, src.side, 0);
	    var c2d = document.createElement("canvas");
	    c2d.width = ws;
	    c2d.height = hs;
	    var level = 0;
	    var tmp = c2d.getContext("2d");
	    while (ws > 1 || hs > 1) {
	        level++;
	        ws >>= 1;
	        hs >>= 1;
	        if (ws == 0) ws = 1;
	        if (hs == 0) hs = 1;
	        tmp.drawImage(src, 0, 0, ws, hs);
	        dest.uploadFromImage(tmp.getImageData(0, 0, ws, hs), src.side, level);
	    }
	}

	function uploadTextureWithMipmaps( dest, src ) {		
		var ws = src.width;
		var hs = src.height;
		dest.uploadFromImage(src, 0);
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
			tmp.drawImage( src, 0, 0, ws, hs );
            dest.uploadFromImage( tmp.getImageData ( 0,0,ws,hs), level );                        			
		}
	}

    function checkEnterFrame() {
        if (imgCount > total_images) {
            // anim handling
            testenv.startOnEnterFrame(OnEnterFrame);
        }
    }
		
    function OnEnterFrame( t ) {
        ctx.enableErrorChecking = true;
        
        var a = Math.sin( t / 2 ) * .5 + .5; 
        ctx.clear( 0.5 * a, 0.5 * a, 0.5 * a, a ); 
        
        ctx.setDepthTest( true, Context3DCompareMode.LESS );
        ctx.setProgram( shaderProgram );
        ctx.setVertexBufferAt( 0, vertexBuffer, 0, Context3DVertexBufferFormat.FLOAT_3 ); //pos
        ctx.setVertexBufferAt( 1, vertexBuffer, 3, Context3DVertexBufferFormat.FLOAT_3 ); //n
        ctx.setVertexBufferAt( 2, vertexBuffer, 6, Context3DVertexBufferFormat.FLOAT_2 ); //uv			
        
        var a = Math.sin(t / 2) * .5 + .5;
        //context3D.clear( 0.5 * a, 0.5 * a, 0.5 * a, a );

        // this is a test for perspective projection
        // all that is different is that we need to provide a perspective
        // matrix instead of a 2d rotation. 
        // build the matrix in a traditional mvp style. 
        // this could be written much more efficiently, use Matrix3D for now for clarity
        // model: local transformation
        var modelMatrix = new Matrix3D();
        modelMatrix.appendRotation(t * 50, Vector3D.Z_AXIS);
        modelMatrix.appendRotation(t * 70, Vector3D.Y_AXIS);
        modelMatrix.appendRotation(t * 30, Vector3D.X_AXIS); // the classic prime spin

        // view: the camera
        var viewMatrix = new Matrix3D();
        viewMatrix.appendTranslation(0, 0, -2.0); // move back along z axis

        var projectionMatrix = new Matrix3D();
        projectionMatrix.projection(0.1, 1000.0, 90, testenv.w / testenv.h);

        // mvp: model * view * projection	
        var mvpMatrix = new Matrix3D();
        mvpMatrix.append(modelMatrix);
        mvpMatrix.append(viewMatrix);
        mvpMatrix.append(projectionMatrix);

        // set to shader (transpose because we use it in 4 dp4 registers)
        ctx.setProgramConstantsFromMatrix(Context3DProgramType.VERTEX, 0, mvpMatrix, true);

        // yay, cubeMap!
        ctx.setTextureAt(0, cubeMap);
        ctx.setProgramConstants(Context3DProgramType.FRAGMENT, 0, 2, 2, 2, 1, 1); // modulate cubeMap map

        // diffuse map
        ctx.setTextureAt(1, texture);
        ctx.setProgramConstants(Context3DProgramType.FRAGMENT, 1, 0.25, 0.25, 0.25, 1, 1); // modulate diffuse map

        // cut out cube map
        ctx.setTextureAt(2, cubeMap);
        ctx.setProgramConstants(Context3DProgramType.FRAGMENT, 2, 0.2, 0, 0, 0, 1);

        // draw
        ctx.drawTriangles(indexBuffer, 0);
        ctx.present(); 			
        
        // this is a good way to only take the performace hit on the first frame
        ctx.enableErrorChecking = false;
    }
    
    // ----------------------------------------------------------------------
    
    function evalDonut( vertices, i ) {
        var u		= vertices[ i + 6 ];
        var v		= vertices[ i + 7 ];
        var ur		= u * Math.PI * 2;
        var vr		= v * Math.PI * 2;
        var rOuter	= 1;
        var rInner	= .4;
        vertices[ i + 0 ]	=( rOuter + rInner * Math.cos( vr ) ) * Math.cos( ur );
        vertices[ i + 1 ]	=( rOuter + rInner * Math.cos( vr ) ) * Math.sin( ur );
        vertices[ i + 2 ]	= rInner * Math.sin( vr );
        vertices[ i + 3 ]	= Math.cos( vr ) * Math.cos( ur );
        vertices[ i + 4 ]	= Math.cos( vr ) * Math.sin( ur );
        vertices[ i + 5 ]	= Math.sin( vr );				
    }
    
    function makePlaneMesh( evalf, nu, nv ) {				
        // build a plane mesh
        var ntris = ( nu - 1 ) * ( nv - 1 ) * 2;
        indexBuffer = ctx.createIndexBuffer( ntris * 3 );
        var buildinds = [];
        for ( var v = 0, j = 0, i = 0; v < nv - 1; v++ )
        {
            for ( var u = 0; u < nu - 1; u++ )
            {
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
        var ndpv = 8; // x,y,z, nx,ny,nz, u,v
        vertexBuffer = ctx.createVertexBuffer( nv * nu, ndpv );
        
        var vertices = [];
        i = 0;
        for ( v = 0; v < nv; v++ )
        {
            var vf = v / ( nv - 1 );
            for ( u = 0; u < nu; u++ )
            {
                var uf = u / ( nu - 1 );
                
                vertices[ i + 0 ]	= uf * 2.0 - 1.0; // x
                vertices[ i + 1 ]	= vf * 2.0 - 1.0; // y
                vertices[ i + 2 ]	= 0; // z
                vertices[ i + 3 ]	= 0; // nx
                vertices[ i + 4 ]	= 0; // ny
                vertices[ i + 5 ]	= 1; // nz			
                vertices[ i + 6 ]	= uf; // u
                vertices[ i + 7 ]	= vf; // v					
                
                if ( evalf != null )
                    evalf( vertices, i ); 
                
                i += ndpv;
            }
        }
        vertexBuffer.uploadFromArray( vertices, 0, nu * nv ); 
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
testregistry.push ( {name:"CubeMap", srcuri:"cubemap.js", f:Test_CubeMap, timeout:4000 } ); 