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

// this is the same as the AS3 complexrtt test
// 
// - does use about everything
// - depends on Matrix3D 
//
function Test_ComplexRTT ( testenv ) {   

    // local things
    
    var ctx, scene, mirrordonut, basemirrorplane, ballobjects, maincamera, light;     
    
    var dif_texture;  

    // very basic mesh and camera/light object 
	function SimpleMeshObject () {
        this.objectmatrix = new Matrix3D(); 
        this.vertexdatagpu = null;
        this.indexdatagpu = null;  
        this.color = [ 1,1,1,1 ]; 
    }
    
    SimpleMeshObject.prototype.setupStreamsAndDraw = function ( ctx ) {
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, this.objectmatrix, true );									
        ctx.setVertexBufferAt( 0, this.vertexdatagpu, 0, Context3DVertexBufferFormat.FLOAT_3 ); //pos			
		ctx.setVertexBufferAt( 1, this.vertexdatagpu, 3, Context3DVertexBufferFormat.FLOAT_3 ); //n			
		ctx.setVertexBufferAt( 2, this.vertexdatagpu, 6, Context3DVertexBufferFormat.FLOAT_2 ); //uv
		ctx.drawTriangles  ( this.indexdatagpu );			        
    }
    
    SimpleMeshObject.prototype.makePlaneMesh = function ( ctx, evalf, nu, nv ) {						
		// build a plane mesh
        var numtris = ( nu - 1 ) * ( nv - 1 ) * 2;
        this.indexdatagpu = ctx.createIndexBuffer( numtris * 3 );
        var buildinds = [];
        for ( var v = 0, j = 0, i = 0; v < nv - 1; v++ ) {
            for ( var u = 0; u < nu - 1; u++ ) {
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
        this.indexdatagpu.uploadFromArray( buildinds, 0, numtris * 3 );
    
        // vertices
        var ndpv = 8; // x,y,z, nx,ny,nz, u,v
        this.vertexdatagpu = ctx.createVertexBuffer( nv * nu, ndpv );		
        var vertices = []; 
        i = 0;
        for ( v = 0; v < nv; v++ ) {
            var vf = v / ( nv - 1 );
            for ( u = 0; u < nu; u++ ) {
                var uf = u / ( nu - 1 );			
                vertices[ i + 0 ]	= uf * 2.0 - 1.0; // x
                vertices[ i + 1 ]	= vf * 2.0 - 1.0; // y
                vertices[ i + 2 ]	= 0; // z
                vertices[ i + 3 ]	= 0; // nx
                vertices[ i + 4 ]	= 0; // ny
                vertices[ i + 5 ]	= 1; // nz			
                vertices[ i + 6 ]	= uf; // u
                vertices[ i + 7 ]	= vf; // v									
                if ( evalf != null ) evalf( vertices, i ); 				
                i += ndpv;
            }
        }
        this.vertexdatagpu.uploadFromArray( vertices, 0, nu * nv );
    }
		
    function evalPlane ( vertices, i, w, h ) {
		vertices[ i + 0 ] *= w;
		vertices[ i + 1 ] *= h;		
	}
		
    function evalSphere ( vertices, i, r ) {
        var ur		= vertices[ i + 6 ] * Math.PI;
        var vr		= vertices[ i + 7 ] * Math.PI * 2;			
        vertices[i+3] = Math.sin(ur)*Math.cos(vr);
        vertices[i+4] = Math.sin(ur)*Math.sin(vr);
        vertices[i+5] = Math.cos(ur);
        vertices[i+0] = vertices[i+3]*r;
        vertices[i+1] = vertices[i+4]*r;
        vertices[i+2] = vertices[i+5]*r;
    }
    
    function evalDonut( vertices, i, rOuter, rInner ) {
        var ur		= vertices[ i + 6 ] * Math.PI * 2;
        var vr		= vertices[ i + 7 ] * Math.PI * 2;
        vertices[ i + 0 ]	=( rOuter + rInner * Math.cos( vr ) ) * Math.cos( ur );
        vertices[ i + 1 ]	=( rOuter + rInner * Math.cos( vr ) ) * Math.sin( ur );
        vertices[ i + 2 ]	= rInner * Math.sin( vr );
        vertices[ i + 3 ]	= Math.cos( vr ) * Math.cos( ur );
        vertices[ i + 4 ]	= Math.cos( vr ) * Math.sin( ur );
        vertices[ i + 5 ]	= Math.sin( vr );				
    }
					
	function SimpleCameraOrLight() {
		this.eyematrix = new Matrix3D();
        this.inveyematrix = new Matrix3D();	 		        
        this.projection = new Matrix3D();	 		        
		this.znear = 0.1;
		this.zfar = 1000; 
		this.fov = 60;
		this.aspect = 4/3; 		
        this.color = [ 1,1,1,1 ]; 
        this.shadowmap = null; 
	}
    
    SimpleCameraOrLight.prototype.initProjectionAndInverse = function ( ) {
        this.inveyematrix.copyFrom ( this.eyematrix );
        this.inveyematrix.invert();		           		
        this.projection.projection ( this.znear, this.zfar, this.fov, this.aspect );        
    }
    
	SimpleCameraOrLight.prototype.mirrorFromAtZ = function ( src, z ) {
        this.znear = src.znear;
        this.zfar = src.zfar; 
        this.fov = src.fov; 
        this.aspect = src.aspect;
        this.eyematrix.copyFrom( src.eyematrix ); 			
        this.eyematrix.appendScale(1,1,-1);
        this.eyematrix.appendTranslation(0,0,z*2);
    }
    
    function BuildScene ( ) {        
        scene = []
        
        mirrordonut = new SimpleMeshObject();			 		
        mirrordonut.makePlaneMesh ( ctx, function( vertices, i ) { evalDonut ( vertices,i,2,.4 ) } , 32, 32 );			
        scene.push ( mirrordonut ); 
        
        basemirrorplane = new SimpleMeshObject(); 
        basemirrorplane.makePlaneMesh ( ctx,  function( vertices, i ) { evalPlane ( vertices,i,4,4 ) }, 2, 2 );			
        basemirrorplane.objectmatrix.appendTranslation ( 0,0,-1.4 ); // main reflecting donut should just about touch it
        scene.push ( basemirrorplane ); 
        
        // x,y,z(implicit +r-1.4),r,color
        var balls = [3,0,0,.5,0xff00ff00,
                     3.2,2,0,.4,0xff00ff00,
                     -3.3,0,0,.6,0xff00ff00,
                     0,0,0,1,0xffffff00]; 
        ballobjects = []; 
        for ( var j = 0; j<balls.length; j+=5 ) {
            var ball = new SimpleMeshObject();				
            ball.makePlaneMesh ( ctx, function( vertices, i ) { evalSphere ( vertices,i,balls[j+3] ) } , 16, 16 );
            ball.objectmatrix.appendTranslation ( balls[j+0],balls[j+1],balls[j+2]-1.4+balls[j+3] );
            ball.objectmatrix.prependRotation( j*3, Matrix3D.Z_AXIS );
            ball.objectmatrix.prependRotation( j*87, Matrix3D.Y_AXIS );				            
            scene.push ( ball ); 
            ballobjects.push ( ball ); 
        }
                    
        maincamera = new SimpleCameraOrLight(); 
        maincamera.fov = 45;
        maincamera.aspect = 4/3;
        maincamera.znear = 0.1;
        maincamera.zfar = 1000;
        
        light = new SimpleCameraOrLight();
        light.fov = 60;
        light.znear = 1;
        light.zfar = 12;
        light.aspect = 1; 
        light.shadowmap = ctx.createTexture( 512,512,Context3DTextureFormat.BGRA,true );
        
        
        postfx_object = new SimpleMeshObject();			 		
        postfx_object.makePlaneMesh ( ctx,
            function( vertices, i ) { evalPlane ( vertices,i,1,1 ) } ,
            2, 2 );        
        postfx_texture = ctx.createTexture(512,512,Context3DTextureFormat.BGRA,true );
        
    
    }

    function makeProjectionMatrix ( zNear, 
                                    zFar, 
                                    fovDegrees, 
                                    aspect)
    {  
        var yval = zNear * Math.tan( fovDegrees * (Math.PI / 360.0) );
        var xval = yval * aspect;    
        return makeFrustumMatrix( -xval, xval, -yval, yval, zNear, zFar );
    }               
        
    function makeFrustumMatrix( left, right, top, bottom, zNear, zFar )
    {
        return new Matrix3D(
            [
                (2*zNear)/(right-left),
                0,
                (right+left)/(right-left),
                0,
                        
                0,
                (2*zNear)/(top-bottom),
                (top+bottom)/(top-bottom),
                0,
                        
                0,
                0,
                zFar/(zNear-zFar),
                -1,
                        
                0,
                0,
                (zNear*zFar)/(zNear-zFar),
                0
            ]
        );
    }       
    
    function AnimateScene ( t ) {
        mirrordonut.objectmatrix.identity();
        
        mirrordonut.objectmatrix.appendRotation( t * 50, Matrix3D.Z_AXIS );
        mirrordonut.objectmatrix.appendRotation( t * 70, Matrix3D.Y_AXIS );
        mirrordonut.objectmatrix.appendRotation( t * 30, Matrix3D.Z_AXIS );
        mirrordonut.objectmatrix.appendTranslation ( 0,0,1.4 ); 
                
        maincamera.eyematrix.identity();			
		maincamera.eyematrix.appendTranslation(0,1,8);
		maincamera.eyematrix.appendRotation(-70,Matrix3D.X_AXIS);			
		maincamera.eyematrix.appendRotation(t*10,Matrix3D.Z_AXIS);
        
        maincamera.initProjectionAndInverse ( );	        
        
        light.eyematrix.identity();
        light.eyematrix.appendTranslation ( 0, 0,6 );			
        light.eyematrix.appendRotation( Math.sin( t ) * 60,Matrix3D.X_AXIS);
        light.eyematrix.appendRotation( Math.sin( t*1.45) * 20,Matrix3D.Y_AXIS);						        
        light.initProjectionAndInverse ( );
    }
    
    var prog_normals, prog_spotlight, prog_depth, prog_ambient, prog_glow; 
    
    function BuildShaders ( ) {
        prog_normals = ctx.createProgram ( ); 
        prog_spotlight = ctx.createProgram ( );

        var vertex_bytes = "mov vt0, va0\nmov vt0, va1\nmov vt0, va2\n" + // dummy stream refs
            "m44 vt0, va0, vc0      \n" +       // 4x4 matrix transform position from stream 0 to world space
            "m33 vt3.xyz, va1, vc0      \n" +   // 3x3 matrix transform normal from stream 1 to world space
            "m44 vt1, vt0, vc4      \n" +       // 4x4 matrix transform from world to eye space
            "m44 op, vt1, vc8       \n" +       // 4x4 matrix transform from eye to clip space
                
            "m44 vt2, vt0, vc12     \n" +       // 4x4 matrix transform from world to light space position              
            "m33 vt4.xyz, vt3.xyz, vc12 \n" +   // 3x3 matrix transform normal from world space to light space
            "m44 vt5, vt2, vc16 \n" +           // 4x4 matrix light space position to projected light space position                                                
                
            "mov v0, va2            \n" +       // copy uv to fragment
            "mov v1, vt4.xyz        \n" +       // copy light space normal to fragment
            "mov v2, vt2            \n" +       // copy light space position to fragment
            "mov v3, vt5            \n";        // copy projected light space position to fragment
        var fragment_bytes = "mov ft4, v3\n" +                // project in light space
            "rcp ft4.w, ft4.w \n" +             
            "mul ft4.xyz, ft4, ft4.w \n" +          
                
            "kil ft4.w \n" +
            "mul ft3, ft4, ft4 \n" +
            "add ft3, ft3.xxxx, ft3.yyyy \n" +
            "sub ft3.y, fc0.x, ft3.y,  \n" +
            "kil ft3.y \n" + // clip
                                                                
            "neg ft4.y, ft4.y\n" +
            "mul ft4.xy, ft4.xy, fc0.w \n" +                
            "add ft4.xy, ft4.xy, fc0.w \n" +  // normalize to texture "screen space" x = x/2 + .5 ... should be in vs
                                
            // sample around
            "mov ft5, ft4 \n" +
            "add ft5.x, ft4.x, fc4.y \n" +           // +dx
            "add ft5.y, ft4.y, fc4.y \n" +           // +dy             
            "tex ft6, ft5, fs1, <2d,clamp,nearest,nomip>\n"+                            
            "dp3 ft7.x, ft6, fc3 \n" +              // color decode z
                
            "sub ft5.x, ft4.x, fc4.y \n" +           // -dx
            "add ft5.y, ft4.y, fc4.y \n" +           // +dy
            "tex ft6, ft5, fs1, <2d,clamp,nearest,nomip>\n"+                            
            "dp3 ft7.y, ft6, fc3 \n" +              // color decode z
                
            "add ft5.x, ft4.x, fc4.y \n" +           // +dx
            "sub ft5.y, ft4.y, fc4.y \n" +           // -dy
            "tex ft6, ft5, fs1, <2d,clamp,nearest,nomip>\n"+                            
            "dp3 ft7.z, ft6, fc3 \n" +              // color decode z

            "sub ft5.x, ft4.x, fc4.y \n" +           // -dx
            "sub ft5.y, ft4.y, fc4.y \n" +           // -dy
            "tex ft6, ft5, fs1, <2d,clamp,nearest,nomip>\n"+                            
            "dp3 ft7.w, ft6, fc3 \n" +              // color decode z               
                                
            "slt ft7, ft4.z, ft7 \n" +              // our light z - texture light z                
            "dp4 ft7.x, ft7, fc4.z \n" +            // fc4.z = 1/4              
                
            // center sampler
            "tex ft6, ft4, fs1, <2d,clamp,nearest,nomip>\n"+                                            
            "dp3 ft7.y, ft6, fc3 \n" +              // color decode z, center sample
            "slt ft7.y, ft4.z, ft7.y \n" +              // our light z - texture light z
                
            "dp4 ft7.x, ft7.xxyy, fc4.z \n" +
                                
            // sample base texture and modulate
            "tex ft5, v0, fs0 <2d,clamp,linear,miplinear>\n"+
            "mul ft5, ft5, ft7.x \n" +
            "mul ft5.xyz, ft5, fc1 \n"+   // light color
            "mul ft3.y, ft3.y, fc1.w\n"+   // light falloff
            "sat ft3.y, ft3.y \n"+
            "mul ft5, ft5, ft3.y \n" + // modulate with falloff
                
            // dot lighting
            "mov ft0, v0            \n" +
            "mov ft1, v1            \n" +
            "nrm ft1.xyz, v1        \n" +               
            "nrm ft2.xyz, v2        \n" +
            "neg ft2.xyz, ft2.xyz   \n" +
            "dp3 ft3.x, ft2.xyz, ft1.xyz \n" +
            "sat ft3.x, ft3.x   \n"+  
            "mul ft5, ft5, ft3.x \n" + // modulate              
                                                                                    
            "mov oc, ft5 \n";       
        
        var agalbytes = AssembleAGAL ( 
            // way too many transforms, this is example code only to track what's happening!!!
            "part vertex 1                      \n"+
			"  mov vt0, va0\nmov vt0, va1\nmov vt0, va2\n" + // dummy stream refs
			"  m44 vt0, va0, vc0		\n" +		// 4x4 matrix transform position from stream 0 to world space
			"  m44 vt1, vt0, vc4		\n" +		// 4x4 matrix transform from world to eye space
			"  m44 vo0, vt1, vc8		\n" +		// 4x4 matrix transform from eye to clip space												 													
			"  mov vi0, va1			\n" +  		// copy normal to fragment            
            "endpart                            \n\n"+
            "part fragment 1                    \n"+
            "  mov fo0, vi0         \n" +            
            "endpart              \n"            
        ); 

        var agalbytes2 = AssembleAGAL ( 
            "part vertex 1           \n"+
            vertex_bytes +          "\n" +       // copy normal to fragment            
            "endpart                 \n\n"+
            "part fragment 1         \n"+
            fragment_bytes +        "\n" +            
            "endpart                 \n"            
        );                
        prog_normals.uploadFromAGALByteArray ( agalbytes.vertex.data, agalbytes.fragment.data );                       
        prog_spotlight.uploadFromAGALByteArray ( agalbytes2.vertex.data, agalbytes2.fragment.data );
        

        // -------------------
        var agalbytes3 = AssembleAGAL ( 
            "part vertex 1           \n"+
            // way too many transforms, this is example code only to track what's happening!!!
            "mov vt0, va0\nmov vt0, va1\nmov vt0, va2\n" + // dummy stream refs
            "m44 vt0, va0, vc0      \n" +       // 4x4 matrix transform position from stream 0 to world space
            "m44 vt1, vt0, vc4      \n" +       // 4x4 matrix transform from world to eye space
            "m44 op, vt1, vc8       \n" +       // 4x4 matrix transform from eye to clip space                                                                                                  
            "mov v0, va2            \n" +       // copy uv to fragment
            "endpart                 \n\n"+
            "part fragment 1         \n"+
            "tex ft0, v0, fs0 <2d,clamp,linear,miplinear>\n"+
            "mul ft0, ft0, fc7 \n" +
            "mov oc, ft0             \n" +            
            "endpart                 \n"   
        );
            
        prog_ambient = ctx.createProgram();
        prog_ambient.uploadFromAGALByteArray( agalbytes3.vertex.data, agalbytes3.fragment.data );
                            
            // -------------------
            
        var agalbytes4 = AssembleAGAL (
            "part vertex 1           \n"+
            "mov vt0, va0\nmov vt0, va1\nmov vt0, va2\n" + // dummy stream refs
            "m44 vt0, va0, vc0      \n" +       // 4x4 matrix transform position from stream 0 to world space
            "m44 vt2, vt0, vc12     \n" +       // 4x4 matrix transform from world to light space position
            "m44 vt5, vt2, vc16 \n" +           // 4x4 matrix light space position to projected light space position
            "mov v0, vt2 \n" +                  // light space 
            "mov v1, vt5 \n" +                  // projected lightspace   
            "mov op, vt5 \n" +
             "endpart                 \n\n"+
            "part fragment 1         \n"+
            "mov ft0, v1            \n" +
            "rcp ft0.w, ft0.w       \n" +
            "add ft0.z, ft0.z, fc4.x\n" +   // bias
            "mul ft0, ft0, ft0.w    \n" +                                               
                
            "mul ft0, ft0.zzww, fc2 \n" +        // color encode 24 bit (1/255, 1, 255, 0, 0)               
            "frc ft0, ft0 \n" +                 
            "mul ft1, ft0, fc3 \n" + 
            "sub ft0.xyz, ft0.xyz, ft1.yzw \n" +     // adjust 
            "mov oc, ft0          \n"+               // projected lightspace
            "endpart                 \n" 
        );                 
                
        prog_depth = ctx.createProgram();
        prog_depth.uploadFromAGALByteArray( agalbytes4.vertex.data, agalbytes4.fragment.data );
            
        var agalbytes5 = AssembleAGAL (
            "part vertex 1           \n"+
            "mov vt0, va0\nmov vt0, va1\nmov vt0, va2\n" + // dummy stream refs             
            "mov v0, va2 \n" + // copy uv
            "mov vt0, va0\n" +
            "neg vt0.y, vt0.y\n"+
            "mov op, vt0 \n"+     // pass through 2d
            "endpart                 \n\n"+
            "part fragment 1         \n"+
            "tex ft0, v0, fs0 <2d,clamp,linear,mipnearest,0>\n"+    
            "dp3 ft4, ft0, ft0\n" + // brightness
                
            "mov ft1, v0\n" +
                
            "add ft1.xy, v0.xy, fc1.zz\n" + // +d,+d
            "tex ft2, ft1, fs1 <2d,clamp,linear,mipnearest,2.0>\n"+
            "mov ft3, ft2\n" +
                
            "add ft1.xy, v0.xy, fc1.zw\n" + // +d,-d
            "tex ft2, ft1, fs1 <2d,clamp,linear,mipnearest,2.0>\n"+
            "add ft3, ft3,ft2\n" +
                
            "add ft1.xy, v0.xy, fc1.ww\n" + // -d,-d
            "tex ft2, ft1, fs1 <2d,clamp,linear,mipnearest,2.0>\n"+
            "add ft3, ft3, ft2\n" +
                
            "add ft1.xy, v0.xy, fc1.wz\n" + // +d,-d
            "tex ft2, ft1, fs1 <2d,clamp,linear,mipnearest,2.0>\n"+
            "add ft3, ft3, ft2\n" +
                                
            "mul ft3, ft3, fc0.w\n" + // scale back
            "dp3 ft3, ft3, ft3\n" + // brightness
                
            "sub ft3, ft3, ft4 \n" +
            "mul ft3, ft3, fc0.x \n" + // scale up a bit
            "abs ft3, ft3 \n" +
                                                                                                    
            "mul ft0, ft0, fc0.x\n" + // br/cr adjust
            "add ft0, ft0, fc0.y\n" +
                
            "add ft0, ft3, ft0\n"+ // add in                
                
            "mov oc, ft0 \n" +
            "endpart                 \n" 
        );  
        prog_glow = ctx.createProgram();
        prog_glow.uploadFromAGALByteArray( agalbytes5.vertex.data, agalbytes5.fragment.data );
    }

    function BuildTextures ( ) {                           
        var imageObj = new Image();
        imageObj.src = "res/paper.png";
        imageObj.crossOrigin = "anonymous";
        imageObj.onload = function() {
            console.log ( "Loaded image ", imageObj.width, imageObj.height );
            dif_texture = ctx.createTexture( imageObj.width, imageObj.height, Context3DTextureFormat.BGRA, false );  
            try {                
                dif_texture.uploadFromImage ( imageObj, 0 );                        
            } catch ( e ) {
                console.log ( "Upload failed, this is most likely due to CORS.\n"+
                              "Either run python -m http.server from the index.html directory and use localhost:8000/index.html or\n" +
                              "disable CORS for local files in your browser.\n" );                 
                // upload some noise instead
                var imgData = new Uint8Array ( imageObj.width*imageObj.height*4 );
                for ( var i=0; i<imageObj.width*imageObj.height*4; i++ ) 
                    imgData[i] = Math.random()*255;                     
                dif_texture.uploadFromUint8Array ( imgData, 0 );                                                        
            }
            // anim handling
            testenv.startOnEnterFrame ( OnEnterFrame );   
        }
    }
    
    function RenderSceneInDebugNormals ( cam ) {        
        ctx.setDepthTest(true,Context3DCompareMode.LESS );
        ctx.setCulling(Context3DTriangleFace.FRONT); 
        ctx.setProgram ( prog_normals );         
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, cam.inveyematrix, true );
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 8, cam.projection, true );            
        scene.forEach ( function(meshobj) { meshobj.setupStreamsAndDraw ( ctx ) } );                       
    }

    function RenderSceneInDepth ( cam, excludeobject ) {
        ctx.setProgram (prog_depth);
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 12, cam.inveyematrix, true );
        var promat = makeProjectionMatrix( cam.znear, cam.zfar, cam.fov, cam.aspect );
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 16, promat, true );
                        
        ctx.setTextureAt( 0, null );
        ctx.setTextureAt( 1, null );
        ctx.setDepthTest(true,Context3DCompareMode.LESS );
        ctx.setBlendFactors(Context3DBlendFactor.ONE,Context3DBlendFactor.ZERO); 
            
        RenderScene ( cam, excludeobject );
    }

    function RenderSceneInColor ( cam, excludeobject ) {
        BeginRenderScene ( cam );           
        for ( var i = 0; i<scene.length; i++ ) {
            var sm = scene[i];
            if ( sm != excludeobject ) RenderObjectInColor ( sm );
        }                   
    }

    function RenderObjectInColor ( sm, asmirror ) {
        ctx.setDepthTest(true,Context3DCompareMode.LESS_EQUAL);       
        ctx.setProgram (prog_ambient);
        ctx.setTextureAt( 0, dif_texture );   
        ctx.setTextureAt( 1, null );
        // ambient color, write z
            
        if ( asmirror ) {
            ctx.setBlendFactors(Context3DBlendFactor.ZERO,Context3DBlendFactor.ONE);          
            ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 7, [ 0.5, 0.5, 0.5, 0 ], 1  );
        } else {
            ctx.setBlendFactors(Context3DBlendFactor.ONE,Context3DBlendFactor.ZERO);
            ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 7, [ 0.1, 0.1, 0.2, 0 ], 1  );
        }
                        
        sm.setupStreamsAndDraw ( ctx );
            
        // for all lights... add them!          
        ctx.setDepthTest(true,Context3DCompareMode.EQUAL);            
        ctx.setBlendFactors(Context3DBlendFactor.ONE,Context3DBlendFactor.ONE);
            
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 12, light.inveyematrix, true );
        var lightpromat = makeProjectionMatrix( light.znear, light.zfar, light.fov, light.aspect );
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 16, lightpromat, true );          
        ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 1, [ 1, 1, 1, 100 ], 1  ); // light color and falloff
        ctx.setTextureAt( 1, light.shadowmap );
        ctx.setProgram (prog_spotlight);      
            
        sm.setupStreamsAndDraw ( ctx );
    } 

    function RenderSceneInColorWithMirror ( ) {
        ctx.clear( .04, .2, .23, 0, 1, 0, Context3DClearMask.DEPTH | Context3DClearMask.STENCIL | Context3DClearMask.COLOR );                         
            
        // render the base plate mirror, set stencil to 1 there
        BeginRenderScene ( maincamera );
        ctx.setCulling(Context3DTriangleFace.NONE );
        ctx.setColorMask(false,false,false,false); 
        ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 7, [ 1, 1, 1, 0 ], 1  );
        ctx.setProgram (prog_ambient);
        ctx.setTextureAt(0,dif_texture);
        ctx.setStencilActions ( Context3DTriangleFace.FRONT_AND_BACK, Context3DCompareMode.ALWAYS, Context3DStencilAction.SET, Context3DStencilAction.SET, Context3DStencilAction.SET );
        ctx.setDepthTest(false,Context3DCompareMode.ALWAYS); 
        ctx.setStencilReferenceValue ( 1 );
        basemirrorplane.setupStreamsAndDraw ( ctx );
        ctx.setColorMask(true,true,true,true);
            
        ctx.setStencilActions ( Context3DTriangleFace.FRONT_AND_BACK, Context3DCompareMode.EQUAL, Context3DStencilAction.KEEP, Context3DStencilAction.KEEP, Context3DStencilAction.KEEP );            
        var mirrorcamera = new SimpleCameraOrLight();
        mirrorcamera.mirrorFromAtZ ( maincamera, -260 ); // yeah, i'm that lazy for a test case
        ctx.setCulling(Context3DTriangleFace.BACK );
        RenderSceneInColor ( mirrorcamera, basemirrorplane );       
            
        // render base plane
            
        ctx.setStencilActions ( Context3DTriangleFace.FRONT_AND_BACK, Context3DCompareMode.ALWAYS, Context3DStencilAction.KEEP, Context3DStencilAction.KEEP, Context3DStencilAction.KEEP );
        ctx.setCulling(Context3DTriangleFace.FRONT );
        //context3D.clear( 1, 1, 1, 1, 1, 2, Context3DClearMask.DEPTH );  // enable for state tracking bug!!!
            
        BeginRenderScene ( maincamera );
        RenderObjectInColor ( basemirrorplane, true );                                          
            
        RenderSceneInColor ( maincamera, basemirrorplane );         
    }

    function RenderPostFXTexture ( ) {
        ctx.clear ( 1 );
        ctx.setTextureAt(0,postfx_texture);
        ctx.setTextureAt(1,postfx_texture);           
        ctx.setProgram(prog_glow);            
        ctx.setCulling(Context3DTriangleFace.NONE );
        ctx.setDepthTest(false,Context3DCompareMode.ALWAYS ); 
        ctx.setBlendFactors(Context3DBlendFactor.ONE,Context3DBlendFactor.ZERO );
        ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 
            1.5, -.3, 1, 1/4, 
            2, -1, 1/256, -1/256    
        ], 2  );
            
        postfx_object.setupStreamsAndDraw(ctx);               
    }

    function RenderScene ( cam, excludeobject) {     
        BeginRenderScene ( cam );   
            
        for ( var i= 0; i<scene.length; i++ ) {
            var sm = scene[i];               
            if ( sm!=excludeobject ) {                                  
                sm.setupStreamsAndDraw ( ctx );                   
            }               
        }   
    }

    function BeginRenderScene ( cam ) {
        cam.inveyematrix.copyFrom ( cam.eyematrix );
        cam.inveyematrix.invert();          
        var promat = makeProjectionMatrix( cam.znear, cam.zfar, cam.fov, cam.aspect );
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, cam.inveyematrix, true );
        ctx.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 8, promat, true );
        ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 0, [ 1, 0, 2, 0.5 ], 1  );               
        ctx.setProgramConstantsFromArray( Context3DProgramType.FRAGMENT, 2, 
            [ 1, 1<<8, 1<<16, 0,            // encode  
                1, 1/(1<<8), 1/(1<<16), 0,   // decode = dp3(z*(this vector))                                  
                0.08, 1/128, 1/4, 0           // bias distance to light for write
            ] , 3  );
            
    }
    
    
    function OnEnterFrame ( t ) {                    	    				            
        
        AnimateScene ( t );
	
        // for all lights... 
        
		ctx.setRenderToTexture ( light.shadowmap, true );
		ctx.clear( 1, 1, 1, 1 );
		RenderSceneInDepth ( light );
		ctx.setRenderToBackBuffer ( );						
        
				
		ctx.setRenderToTexture ( postfx_texture, true );
		RenderSceneInColorWithMirror ( );
		ctx.setRenderToBackBuffer ( );
				
		RenderPostFXTexture ( ); 
        
        //ctx.clear( (t%1)/4, 0, 0, 1 );
        //RenderSceneInDebugNormals ( maincamera ); 
									        
        ctx.present ( );      
    }
    
    function OnContext3DCreated ( newctx ) {
        ctx = newctx; 
        
        BuildScene ( ); 
        BuildShaders ( );
        BuildTextures ( ); 

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
testregistry.push ( {name:"Complex", srcuri:"complex.js", f:Test_ComplexRTT, timeout:4000 } ); 