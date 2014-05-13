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

"use strict";

// clone of the Matrix3D flash class, including bugs
// implements 4x4 matrices useful for 3d transforms
// uses either typed arrays (usefloat=true) or number arrays

// this should really keep the matrix transposed, but right now this is doing 1:1 what flash does

function Vector3D ( ) {
    this.data = [0,0,0,1];
}
    
Vector3D.X_AXIS = [1,0,0];
Vector3D.Y_AXIS = [0,1,0];
Vector3D.Z_AXIS = [0,0,1];

function Matrix3D ( usefloat ) {
    if ( usefloat && typeof(Float32Array)!=typeof(undefined) ) {
        this.data = new Float32Array(16);                            
        this.isfloat = true; 
    } else {
        this.data = [];            
        this.isfloat = false; 
    }
    this.identity();     
};

Matrix3D.X_AXIS = [1,0,0];
Matrix3D.Y_AXIS = [0,1,0];
Matrix3D.Z_AXIS = [0,0,1];

Matrix3D.DEG2RAD = Math.PI / 180.0;

// shared functions regardless of type of data
Matrix3D.prototype.identity = function() {
    this.data[0] = 1;  this.data[1] = 0;  this.data[2] = 0;  this.data[3] = 0;
    this.data[4] = 0;  this.data[5] = 1;  this.data[6] = 0;  this.data[7] = 0;
    this.data[8] = 0;  this.data[9] = 0;  this.data[10]= 1;  this.data[11]= 0;
    this.data[12]= 0;  this.data[13]= 0;  this.data[14]= 0;  this.data[15]= 1;
}

Matrix3D.prototype.scale = function( sx, sy, sz ) {    
    this.identity ();
    this.data[0] = sx;
    this.data[5] = sy;
    this.data[10] = sz;
    return this; 
}

Matrix3D.prototype.translation = function ( dx, dy, dz ) {    
    this.identity ();
    this.data[12] = dx;
    this.data[13] = dy;
    this.data[14] = dz;
    return this; 
}

// rotate about aligned axis only
Matrix3D.prototype.rotationX = function( angledeg ) {
    var cosa = Math.cos ( -angledeg * Matrix3D.DEG2RAD );
    var sina = Math.sin ( -angledeg * Matrix3D.DEG2RAD );
    this.fromArray ( [ 1,0,0,0, 
                       0, cosa, -sina, 0, 
                       0, sina, cosa, 0,
                       0, 0, 0, 1 ] );
}

Matrix3D.prototype.rotationY = function( angledeg ) {
    var cosa = Math.sin ( -angledeg * Matrix3D.DEG2RAD );
    var sina = Math.cos ( -angledeg * Matrix3D.DEG2RAD );    
    this.fromArray ( [ cosa,0,sina,0, 
                       0, 1, 0, 0,
                       -sina, 0, cosa, 0,
                       0, 0, 0, 1 ] );    
}

Matrix3D.prototype.rotationZ = function( angledeg ) {
    var cosa = Math.cos ( -angledeg * Matrix3D.DEG2RAD );
    var sina = Math.sin ( -angledeg * Matrix3D.DEG2RAD );    
    this.fromArray ( [ cosa, -sina, 0, 0, 
                       sina, cosa, 0, 0, 
                       0,0,1,0,
                       0,0,0,1 ] );
}

// rotate about specified axis
// assumes axis is normalized!
Matrix3D.prototype.rotationXYZ = function( angledeg, ax, ay, az ) {
    var cosa = Math.cos ( -angledeg * Matrix3D.DEG2RAD );
    var sina = Math.sin ( -angledeg * Matrix3D.DEG2RAD );           
    var n11 = ax * ax;
    var n22 = ay * ay;
    var n33 = az * az;
    var nxy = ax * ay;
    var nxz = ax * az;
    var nyz = ay * az;    
    this.fromArray ( [  n11 + (1 - n11 ) * cosa, nxy * (1 - cosa) - az * sina, nxz * (1 - cosa) + ay * sina, 0,
                        nxy * (1 - cosa) + az * sina, n22 + (1 - n22 ) * cosa, nyz * (1 - cosa) - ax * sina, 0,
                        nxz * (1 - cosa) - ay * sina, nyz * (1 - cosa) + ax * sina, n33 + (1 - n33 ) * cosa, 0,
                        0, 0, 0, 1 ] );       
}

Matrix3D.prototype.rotation = function( angledeg, axis ) {
    this.rotationXYZ ( angledeg, axis[0], axis[1], axis[2] );                
    /*
    if ( axis===Matrix3D.X_AXIS ) {
        this.rotationX ( angledeg );
    } else {
        if ( axis===Matrix3D.Y_AXIS ) {
            this.rotationY ( angledeg );
        } else {
            if ( axis===Matrix3D.Z_AXIS ) {
                this.rotationZ ( angledeg );
            } else {
                this.rotationXYZ ( angledeg, axis[0], axis[1], axis[2] );                
            }
        }
    }*/
}

// static, doeds not need this, (dest,a,b are all Matrix3D)
// dest can alias with a or b
Matrix3D.multiplyInPlace = function ( dest, a, b ) {     
    function dotRowColumn ( ar, bc ) {        
        return  a.data[ar*4  ]*b.data[bc] + 
                a.data[ar*4+1]*b.data[bc+4] + 
                a.data[ar*4+2]*b.data[bc+8] +
                a.data[ar*4+3]*b.data[bc+12];
    }
    // reference    
    var orgdest;
    if ( dest===a || dest===b ) {
        orgdest = dest;
        dest = Matrix3D.tempMul[dest.isfloat]; 
    } 
    for ( var row=0; row<4; row++ ) {
        dest.data[row*4+0] = dotRowColumn ( row, 0 );
        dest.data[row*4+1] = dotRowColumn ( row, 1 );
        dest.data[row*4+2] = dotRowColumn ( row, 2 );
        dest.data[row*4+3] = dotRowColumn ( row, 3 );        
    }        
    if ( orgdest ) orgdest.copyFrom(dest);     
}

Matrix3D.prototype.multiplyLeft = function ( b ) {
    Matrix3D.multiplyInPlace ( this, this, b );
}

Matrix3D.prototype.multiplyRight = function ( a ) {
    Matrix3D.multiplyInPlace ( this, a, this );
}
    
// todo: manual unfurl those, might give some tiny speedup
Matrix3D.prototype.append = Matrix3D.prototype.multiplyLeft;
Matrix3D.prototype.prepend = Matrix3D.prototype.multiplyRight;

Matrix3D.prototype.appendScale = function ( sx, sy, sz ) {
    Matrix3D.temp[this.isfloat].scale(sx,sy,sz);
    Matrix3D.multiplyInPlace ( this, this, Matrix3D.temp[this.isfloat] );
}

Matrix3D.prototype.appendTranslation = function ( dx, dy, dz ) {
    Matrix3D.temp[this.isfloat].translation(dx,dy,dz);
    Matrix3D.multiplyInPlace ( this, this, Matrix3D.temp[this.isfloat] );
}

Matrix3D.prototype.appendRotation = function( angledeg, axis ) {
    Matrix3D.temp[this.isfloat].rotation(angledeg, axis);    
    Matrix3D.multiplyInPlace ( this, this, Matrix3D.temp[this.isfloat] );
}

Matrix3D.prototype.prependScale = function ( sx, sy, sz ) {
    Matrix3D.temp[this.isfloat].scale(sx,sy,sz);
    Matrix3D.multiplyInPlace ( this, Matrix3D.temp[this.isfloat], this );
}

Matrix3D.prototype.prependTranslation = function ( dx, dy, dz ) {
    Matrix3D.temp[this.isfloat].translation(dx,dy,dz);
    Matrix3D.multiplyInPlace ( this, Matrix3D.temp[this.isfloat], this );
}

Matrix3D.prototype.prependRotation = function( angledeg, axis ) {
    Matrix3D.temp[this.isfloat].rotation(angledeg, axis);        
    Matrix3D.multiplyInPlace ( this, Matrix3D.temp[this.isfloat], this );
}

Matrix3D.prototype.clone = function ( ) {
    var r = new Matrix3D(this.isfloat); 
    r.copyFrom ( this );
    return r; 
}

Matrix3D.prototype.transpose = function ( ) {
    var t; 
    t = this.data[1]; this.data[1] = this.data[4]; this.data[4] = t;
    t = this.data[2]; this.data[2] = this.data[8]; this.data[8] = t;
    t = this.data[6]; this.data[6] = this.data[9]; this.data[9] = t;
    t = this.data[3]; this.data[3] = this.data[12]; this.data[12] = t;
    t = this.data[7]; this.data[7] = this.data[13]; this.data[13] = t;
    t = this.data[11]; this.data[11] = this.data[14]; this.data[14] = t;
}

Matrix3D.prototype.copyFrom = function ( othermatrix ) {    
    if ( this.isfloat && othermatrix.isfloat ) {
        this.data.set ( othermatrix.data ); 
    } else {
        for (var i=0; i<16; i++ ) 
            this.data[i] = othermatrix.data[i];    
    }
}

Matrix3D.prototype.copyTo = function ( othermatrix ) {    
    othermatrix.copyFrom(this);    
}

Matrix3D.prototype.determinant = function() {
	// test if matrix has no shearing, which is often true
    if ( this.data[0*4+3] == 0 && this.data[1*4+3] == 0 && this.data[2*4+3] == 0 ) {
		var a = this.data[2*4+2] * this.data[3*4+3];
		var b = this.data[1*4+2] * this.data[3*4+3];
		var d = this.data[0*4+2] * this.data[3*4+3];
		return this.data[0*4+0] * ( this.data[1*4+1] * a - this.data[2*4+1] * b )
			- this.data[1*4+0] * ( this.data[0*4+1] * a - this.data[2*4+1] * d )
			+ this.data[2*4+0] * ( this.data[0*4+1] * b - this.data[1*4+1] * d );
	} else {
		var a = this.data[2*4+2] * this.data[3*4+3] - this.data[3*4+2] * this.data[2*4+3];
		var b = this.data[1*4+2] * this.data[3*4+3] - this.data[3*4+2] * this.data[1*4+3];
		var c = this.data[1*4+2] * this.data[2*4+3] - this.data[2*4+2] * this.data[1*4+3];
		var d = this.data[0*4+2] * this.data[3*4+3] - this.data[3*4+2] * this.data[0*4+3];
		var e = this.data[0*4+2] * this.data[2*4+3] - this.data[2*4+2] * this.data[0*4+3];
		var f = this.data[0*4+2] * this.data[1*4+3] - this.data[1*4+2] * this.data[0*4+3];
		return this.data[0*4+0] * ( this.data[1*4+1] * a - this.data[2*4+1] * b + this.data[3*4+1] * c )
			- this.data[1*4+0] * ( this.data[0*4+1] * a - this.data[2*4+1] * d + this.data[3*4+1] * e )
			+ this.data[2*4+0] * ( this.data[0*4+1] * b - this.data[1*4+1] * d + this.data[3*4+1] * f )
			- this.data[3*4+0] * ( this.data[0*4+1] * c - this.data[1*4+1] * e + this.data[2*4+1] * f );
	}    
}

Matrix3D.prototype.invert = function() {        
    var t;
    var m0, m1, m2, m3, s;
        
    var r0 = [], r1 = [], r2 = [], r3 = [];
    
    r0[0] = this.data[0*4+0], r0[1] = this.data[1*4+0],
    r0[2] = this.data[2*4+0], r0[3] = this.data[3*4+0],
    r0[4] = 1.0, r0[5] = r0[6] = r0[7] = 0.0,

    r1[0] = this.data[0*4+1], r1[1] = this.data[1*4+1],
    r1[2] = this.data[2*4+1], r1[3] = this.data[3*4+1],
    r1[5] = 1.0, r1[4] = r1[6] = r1[7] = 0.0,

    r2[0] = this.data[0*4+2], r2[1] = this.data[1*4+2],
    r2[2] = this.data[2*4+2], r2[3] = this.data[3*4+2],
    r2[6] = 1.0, r2[4] = r2[5] = r2[7] = 0.0,

    r3[0] = this.data[0*4+3], r3[1] = this.data[1*4+3],
    r3[2] = this.data[2*4+3], r3[3] = this.data[3*4+3],
    r3[7] = 1.0, r3[4] = r3[5] = r3[6] = 0.0;

    // choose pivot - or die 
    if (Math.abs(r3[0])>Math.abs(r2[0])) { t=r3; r3=r2; r2=t; }  
    if (Math.abs(r2[0])>Math.abs(r1[0])) { t=r2; r2=r1; r1=t; } 
    if (Math.abs(r1[0])>Math.abs(r0[0])) { t=r1; r1=r0; r0=t; } 
    if (0.0 == r0[0])  return false;

    // eliminate first variable     
    m1 = r1[0]/r0[0]; m2 = r2[0]/r0[0]; m3 = r3[0]/r0[0];
    s = r0[1]; r1[1] -= m1 * s; r2[1] -= m2 * s; r3[1] -= m3 * s;
    s = r0[2]; r1[2] -= m1 * s; r2[2] -= m2 * s; r3[2] -= m3 * s;
    s = r0[3]; r1[3] -= m1 * s; r2[3] -= m2 * s; r3[3] -= m3 * s;

    s = r0[4];
    if (s != 0.0) { r1[4] -= m1 * s; r2[4] -= m2 * s; r3[4] -= m3 * s; }
    s = r0[5];
    if (s != 0.0) { r1[5] -= m1 * s; r2[5] -= m2 * s; r3[5] -= m3 * s; }
    s = r0[6];
    if (s != 0.0) { r1[6] -= m1 * s; r2[6] -= m2 * s; r3[6] -= m3 * s; }
    s = r0[7];
    if (s != 0.0) { r1[7] -= m1 * s; r2[7] -= m2 * s; r3[7] -= m3 * s; }

    // choose pivot - or die 
    if (Math.abs(r3[1])>Math.abs(r2[1])) { t=r3; r3=r2; r2=t; } 
    if (Math.abs(r2[1])>Math.abs(r1[1])) { t=r2; r2=r1; r1=t; } 
    if (0.0 == r1[1])  return false;

    // eliminate second variable 
    m2 = r2[1]/r1[1]; m3 = r3[1]/r1[1];
    r2[2] -= m2 * r1[2]; r3[2] -= m3 * r1[2];
    r2[3] -= m2 * r1[3]; r3[3] -= m3 * r1[3];
    s = r1[4]; if (0.0 != s) { r2[4] -= m2 * s; r3[4] -= m3 * s; }
    s = r1[5]; if (0.0 != s) { r2[5] -= m2 * s; r3[5] -= m3 * s; }
    s = r1[6]; if (0.0 != s) { r2[6] -= m2 * s; r3[6] -= m3 * s; }
    s = r1[7]; if (0.0 != s) { r2[7] -= m2 * s; r3[7] -= m3 * s; }

    // choose pivot - or die 
    if (Math.abs(r3[2])>Math.abs(r2[2])) { t=r3; r3=r2; r2=t; } 
    if (0.0 == r2[2])  return false;

    // eliminate third variable 
    m3 = r3[2]/r2[2];
    r3[3] -= m3 * r2[3], r3[4] -= m3 * r2[4],
    r3[5] -= m3 * r2[5], r3[6] -= m3 * r2[6],
    r3[7] -= m3 * r2[7];

    // last check 
    if (0.0 == r3[3]) return false;
    s = 1.0/r3[3];             // now back substitute row 3 
    r3[4] *= s; r3[5] *= s; r3[6] *= s; r3[7] *= s;
    m2 = r2[3];                 // now back substitute row 2 
    s  = 1.0/r2[2]
    r2[4] = s * (r2[4] - r3[4] * m2), r2[5] = s * (r2[5] - r3[5] * m2),
    r2[6] = s * (r2[6] - r3[6] * m2), r2[7] = s * (r2[7] - r3[7] * m2);
    m1 = r1[3];
    r1[4] -= r3[4] * m1, r1[5] -= r3[5] * m1,
    r1[6] -= r3[6] * m1, r1[7] -= r3[7] * m1;
    m0 = r0[3];
    r0[4] -= r3[4] * m0, r0[5] -= r3[5] * m0,
    r0[6] -= r3[6] * m0, r0[7] -= r3[7] * m0;

    m1 = r1[2];                 // now back substitute row 1 
    s  = 1.0/r1[1];
    r1[4] = s * (r1[4] - r2[4] * m1), r1[5] = s * (r1[5] - r2[5] * m1),
    r1[6] = s * (r1[6] - r2[6] * m1), r1[7] = s * (r1[7] - r2[7] * m1);
    m0 = r0[2];
    r0[4] -= r2[4] * m0, r0[5] -= r2[5] * m0,
    r0[6] -= r2[6] * m0, r0[7] -= r2[7] * m0;

    m0 = r0[1];                 // now back substitute row 0 
    s  = 1.0/r0[0];
    r0[4] = s * (r0[4] - r1[4] * m0), r0[5] = s * (r0[5] - r1[5] * m0),
    r0[6] = s * (r0[6] - r1[6] * m0), r0[7] = s * (r0[7] - r1[7] * m0);

    this.data[0*4+0] = r0[4]; this.data[1*4+0] = r0[5],
    this.data[2*4+0] = r0[6]; this.data[3*4+0] = r0[7],
    this.data[0*4+1] = r1[4]; this.data[1*4+1] = r1[5],
    this.data[2*4+1] = r1[6]; this.data[3*4+1] = r1[7],
    this.data[0*4+2] = r2[4]; this.data[1*4+2] = r2[5],
    this.data[2*4+2] = r2[6]; this.data[3*4+2] = r2[7],
    this.data[0*4+3] = r3[4]; this.data[1*4+3] = r3[5],
    this.data[2*4+3] = r3[6]; this.data[3*4+3] = r3[7];
    
    return true;
}

Matrix3D.prototype.fromArray = function ( src ) {
    for (var i=0; i<16; i++ ) this.data[i] = src[i]; 
}

Matrix3D.prototype.toArray = function ( ) {
    var a = []; 
    for (var i=0; i<16; i++ ) a[i] = this.data[i]; 
    return a; 
}

Matrix3D.prototype.toString = function() {    
    return (this.toArray()).toString()+(this.isfloat?" Float":" Number"); 
}

Matrix3D.prototype.isEpsEqual = function ( other, eps ) {    
    function epsEqual ( a, b, eps ) { return a-eps <= b && a+eps >= b; }
    for (var i=0; i<16; i++ ) 
        if ( !epsEqual( other.data[i], this.data[i], eps) ) return false; 
    return true; 
}

Matrix3D.prototype.frustum = function ( left, right, top, bottom, znear, zfar ) {
    this.data[0] = (2*znear)/(right-left);
	this.data[1] = 0;
    this.data[2] = (right+left)/(right-left);
	this.data[3] = 0;
						
    this.data[4] = 0;
    this.data[5] = (2*znear)/(top-bottom);
    this.data[6] = (top+bottom)/(top-bottom);
    this.data[7] = 0;
    
    this.data[8] = 0;
    this.data[9] = 0;
    this.data[10] = zfar/(znear-zfar);
    this.data[11] = -1;
    
    this.data[12] = 0;
    this.data[13] = 0;
    this.data[14] = (znear*zfar)/(znear-zfar);
    this.data[15] = 0;    
}

Matrix3D.prototype.projection = function ( znear, zfar, fovdeg, aspect ) {
    var yval = znear * Math.tan( fovdeg * Matrix3D.DEG2RAD * 0.5 );
    var xval = yval * aspect;	
    this.frustum ( -xval, xval, -yval, yval, znear, zfar );        
}

Matrix3D.prototype.transform3x3transposed = function ( vectorin, vectorout ) {
    vectorout[0] = vectorin[0]*this.data[0] + vectorin[1]*this.data[1] + vectorin[2]*this.data[2]; 
    vectorout[1] = vectorin[0]*this.data[4] + vectorin[1]*this.data[5] + vectorin[2]*this.data[6]; 
    vectorout[2] = vectorin[0]*this.data[8] + vectorin[1]*this.data[9] + vectorin[2]*this.data[10]; 
}

Matrix3D.prototype.transform4x4transposed = function ( vectorin, vectorout ) {
    vectorout[0] = vectorin[0]*this.data[0] + vectorin[1]*this.data[1] + vectorin[2]*this.data[2] + vectorin[3]*this.data[3]; 
    vectorout[1] = vectorin[0]*this.data[4] + vectorin[1]*this.data[5] + vectorin[2]*this.data[6] + vectorin[3]*this.data[7]; 
    vectorout[2] = vectorin[0]*this.data[8] + vectorin[1]*this.data[9] + vectorin[2]*this.data[10] + vectorin[3]*this.data[11]; 
    vectorout[3] = vectorin[0]*this.data[12] + vectorin[1]*this.data[13] + vectorin[2]*this.data[14] + vectorin[3]*this.data[15];   
}

Matrix3D.prototype.transform3x3 = function ( vectorin, vectorout ) {
    vectorout[0] = vectorin[0]*this.data[0] + vectorin[1]*this.data[4] + vectorin[2]*this.data[8]; 
    vectorout[1] = vectorin[0]*this.data[1] + vectorin[1]*this.data[5] + vectorin[2]*this.data[9]; 
    vectorout[2] = vectorin[0]*this.data[2] + vectorin[1]*this.data[6] + vectorin[2]*this.data[10]; 
}

// same as Flash transformVector
Matrix3D.prototype.transform3x4 = function ( vectorin, vectorout ) {
    vectorout[0] = vectorin[0]*this.data[0] + vectorin[1]*this.data[4] + vectorin[2]*this.data[8] + this.data[12]; 
    vectorout[1] = vectorin[0]*this.data[1] + vectorin[1]*this.data[5] + vectorin[2]*this.data[9] + this.data[13]; 
    vectorout[2] = vectorin[0]*this.data[2] + vectorin[1]*this.data[6] + vectorin[2]*this.data[10]  + this.data[14]; 
}

Matrix3D.prototype.transformVector = Matrix3D.prototype.transform3x4; 

Matrix3D.prototype.transform4x4 = function ( vectorin, vectorout ) {
    vectorout[0] = vectorin[0]*this.data[0] + vectorin[1]*this.data[4] + vectorin[2]*this.data[8] + vectorin[3]*this.data[12]; 
    vectorout[1] = vectorin[0]*this.data[1] + vectorin[1]*this.data[5] + vectorin[2]*this.data[9] + vectorin[3]*this.data[13]; 
    vectorout[2] = vectorin[0]*this.data[2] + vectorin[1]*this.data[6] + vectorin[2]*this.data[10] + vectorin[3]*this.data[14]; 
    vectorout[3] = vectorin[0]*this.data[3] + vectorin[1]*this.data[7] + vectorin[2]*this.data[11] + vectorin[3]*this.data[15];   
}

// same as Flash function, 3x4, non transposed
Matrix3D.prototype.transformVectors = function ( numbersarrayin, numbersarrayout ) {
    for ( var i = 0; i<numbersarrayin.length-2; i+=3 ) {
        var x = numbersarrayin[i];
        var y = numbersarrayin[i+1];
        var z = numbersarrayin[i+2];
        numbersarrayout[i] = x*this.data[0] + y*this.data[4] + z*this.data[8] + this.data[12]; // implicit w=1
        numbersarrayout[i+1] = x*this.data[1] + y*this.data[5] + z*this.data[9] + this.data[13]; // implicit w=1
        numbersarrayout[i+2] = x*this.data[2] + y*this.data[6] + z*this.data[10] + this.data[14]; // implicit w=1                    
    }
}

// static cache, do not use outside
Matrix3D.temp = []; 
Matrix3D.temp[true] = new Matrix3D ( true ); 
Matrix3D.temp[false] = new Matrix3D ( false ); 
Matrix3D.tempMul = []; 
Matrix3D.tempMul[true] = new Matrix3D ( true ); 
Matrix3D.tempMul[false] = new Matrix3D ( false ); 