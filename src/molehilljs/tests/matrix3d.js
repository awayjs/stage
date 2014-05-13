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

function Test_Matrix3D ( testenv, usefloat ) {        
    function assert ( x, msg ) { if ( !x ) throw msg; }
    
    // class unit test, only runs straight up 
    var ma = new Matrix3D ( usefloat ); 
    var mb = new Matrix3D ( usefloat ); 
    
    var mc = new Matrix3D ( usefloat );    
    mc.fromArray ( [ 1,2,3,4,   
                     5,6,7,8,
                     9,10,11,12,
                     13,14,15,16 ] );     
    
    // test constructor sets identity
    mb.identity ( );     
    assert ( ma.isEpsEqual ( mb, 0 ) );
    
    // test id*id = id 
    ma.append ( mb );
    assert ( ma.isEpsEqual ( mb, 0 ) );    
    ma.prepend ( mb );
    assert ( ma.isEpsEqual ( mb, 0 ) );
    
    mb.identity ( ); 
    ma.identity ( );     
    ma.append ( mc );
    assert ( ma.isEpsEqual ( mc, 0 ) );
    mb.prepend ( mc ); 
    assert ( ma.isEpsEqual ( mc, 0 ) );   
    
    // scale + mul perf
    ma.identity();
    mb.identity();
    var t0 = testenv.getTimeS ( ); 
    var n = 50000; 
    for ( var i=0; i<n; i++ ) {
        ma.appendTranslation ( -2,-16,-32 );
        ma.appendTranslation ( 2,16,32 );        
        ma.appendScale ( 2,4,8 );
        ma.appendScale ( 1/2,1/4,1/8 );        
        mb.prependTranslation ( -2,-16,-32 );
        mb.prependTranslation ( 2,16,32 );        
        mb.prependScale ( 2,4,8 );
        mb.prependScale ( 1/2,1/4,1/8 );        
    }    
    var t1 = testenv.getTimeS ( ); 
    assert ( ma.isEpsEqual ( mb, 0 ) );    
    console.log ( "Perf time for "+n+" runs (multiply/copy): "+(((t1-t0)*1000)>>>0)+"ms" );             
    
    // rotation arbitrary vs specific axis
    var r; 
    for ( r = -360; r<360; r++ ) {
        ma.rotation ( r, Matrix3D.X_AXIS );
        mb.rotation ( r, [1,0,0] );
        assert ( ma.isEpsEqual ( mb, 0.01 ) );    
        
        ma.rotation ( r, Matrix3D.Y_AXIS );
        mb.rotation ( r, [0,1,0] );
        assert ( ma.isEpsEqual ( mb, 0.01 ) );    

        ma.rotation ( r, Matrix3D.Z_AXIS );
        mb.rotation ( r, [0,0,1] );        
        assert ( ma.isEpsEqual ( mb, 0.01 ) );    
    }
    
    // to / from 
    ma.copyFrom ( mc ); 
    mb.fromArray ( mc.toArray() );
    assert ( ma.isEpsEqual ( mb, 0 ) );
    console.log ( ma.toString() );
    ma.identity ( );
    ma.copyTo ( mb ); 
    assert ( ma.isEpsEqual ( mb, 0 ) );    
    
    // to string console spam
    r = 10;
    ma.rotation ( r, Matrix3D.X_AXIS );    
    console.log ( ma.toString() );
    ma.rotation ( r, Matrix3D.Z_AXIS );    
    console.log ( ma.toString() );
    ma.rotation ( r, Matrix3D.Y_AXIS );
    console.log ( ma.toString() );        
        
    // check that a*inv(a) == id
    function assertInv ( m ) {
        var t = m.clone ( ); 
        var d = m.determinant ();
        assert ( d != 0 );
        t.invert ( );
        t.prepend  ( m );         
        assert ( t.isEpsEqual ( new Matrix3D(), 0.01 ) );        
    }
    
    ma.identity();
    ma.appendTranslation ( -2,-16,-32 );        
    ma.appendScale ( 2,4,8 );        
    assertInv ( ma );
    
    // also check with rotations about major axis: all of those are invertible
    var r; 
    for ( r = -360; r<360; r++ ) {
        ma.rotation ( r, Matrix3D.X_AXIS );        
        assertInv ( ma );        
        ma.rotation ( r, Matrix3D.Y_AXIS );
        assertInv ( ma );
        ma.rotation ( r, Matrix3D.Z_AXIS );
        assertInv ( ma );
    }    
    
    // inverse timing
    ma.identity();
    mb.identity();
    var t0 = testenv.getTimeS ( ); 
    var n = 50000; 
    ma.identity();
    ma.appendTranslation ( -2,-16,-32 );        
    ma.appendScale ( 2,4,8 );        
    for ( var i=0; i<n; i++ ) {
        ma.invert ( );
        ma.invert ( );                
    }    
    var t1 = testenv.getTimeS ( ); 
    console.log ( "Perf time for "+n+" runs (inverse): "+(((t1-t0)*1000)>>>0)+"ms" );             
    console.log ( ma.toString() );        
    ma.invert ( );
    console.log ( ma.toString() );        
    ma.invert ( );
    console.log ( ma.toString() );        
        
    console.log ( "Matrix3D: All tests run.")
    
    testenv.abortcallback = function( ) {}        
}


// register test
testregistry.push ( {name:"Matrix3D (Float)", srcuri:"matrix3d.js", f:function (testenv) { Test_Matrix3D(testenv,true) } } ); 
testregistry.push ( {name:"Matrix3D (Number)", srcuri:"matrix3d.js", f:function (testenv) { Test_Matrix3D(testenv,false) } } ); 

