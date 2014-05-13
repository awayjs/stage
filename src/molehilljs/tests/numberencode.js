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

MyObject.callme = function ( ) {
    this.member++;
}

function MyObject ( ) {
    this.member = 23; 
    //this.callme = MyObject.callme; 
    for ( name in MyObject ) 
        this[name] = MyObject[name];
}

function MyObject2 ( ) {
    this.member = 24; 
}

MyObject2.prototype.callme = function ( ) {
    this.member++;
}


function Test_EncodeNumber ( testenv ) {        
    "use strict";
    
    function assert ( x, msg ) { if ( !x ) throw msg; }
    
    function MakeRandomNumbers ( min, max, count ) {
        var r =[];    
        for ( var i=0; i<count; i++ )  
            r[i] = Math.random ( ) * (max-min) + min; 
        return r;
    }    
    
    function toFloatBits(x) {
        // don't handle inf/nan yet
        // special case zero
        if ( x==0 ) return 0; 
        // remove the sign, after this we only deal with positive numbers
        var sign;
        if ( x<0 ) { x=-x; sign=1; } else sign = 0; 
        // a float value is now defined as: x = (1+(mantissa*2^-23))*(2^(exponent-127))            
        var exponent = Math.log(x) / Math.log(2);  // rough exponent        
        exponent = Math.floor(exponent);         
        x = x*Math.pow(2,23-exponent);             // normalize to 24 bits                
        var mantissa = Math.floor(x) - 0x800000;         
        exponent=exponent+127;                        
        return ((((sign<<31)>>>0) | (exponent<<23) | mantissa)>>>0).toString();              
    }        
    
    var nibbletohex = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
    
    var bytetohex = [];
    
    for ( var i=0; i<256; i++ ) 
        bytetohex[i] = nibbletohex[(i>>4)&0xf] + nibbletohex[(i>>0)&0xf];
        
    function toFloatBitsOpt1 (x) {                        
        if ( x==0 ) return "+000000x00";              
        var signstring; 
        if ( x<0 ) {             
            x=-x;
            signstring = "-";  
        } else {
            signstring = "+";  
        }           
        var exponent = Math.log(x) / Math.log(2);  // rough exponent        
        exponent = Math.floor(exponent);         
        x = x*Math.pow(2,23-exponent);             // normalize to 24 bits                
        var mantissa = Math.floor(x);   
        exponent += 127;             
        return signstring 
             + bytetohex[(mantissa>>>0)&0xff]             
             + bytetohex[(mantissa>>>8)&0xff]                      
             + bytetohex[(mantissa>>>16)&0xff]             
             + bytetohex[(exponent>>>0)&0xff];             
    }    
    
    // just time some ways to encode number into a string 
    var n = 1000000; 
    var numbers_a = MakeRandomNumbers ( -10000, 10000, n );
    var numbers_b = MakeRandomNumbers ( -2, 2, n );
    var numbers_c = MakeRandomNumbers ( 0, 1, n );
    var numbers_d = MakeRandomNumbers ( Number.MIN_VALUE, Number.MAX_VALUE, n );
    
    /* function TestFunc ( f, name ) {
        var t0, t1;
        var tall = 0; 
        var countall = 0; 
        var sout = "";         
        console.log ( name );        
        function OneArray ( a, aname ) {
            t0 = testenv.getTimeS ( ); 
            for ( var i=0; i<a.length; i++ ) 
                sout += ", "+f(a[i]);                    
            t1 = testenv.getTimeS ( ); 
            console.log ( "  ..."+sout.substr(sout.length-60) );
            console.log ( "  "+aname+":"+(t1-t0) );
            tall += t1-t0;    
            countall += a.length; 
        }        
        OneArray ( numbers_a, "[-10000..10000]" );
        OneArray ( numbers_b, "[-2..2]        ");
        OneArray ( numbers_c, "[0..1]         ");
        OneArray ( numbers_d, "[min..max]     ");        
        console.log ( "  total ("+countall+"):",tall );                    
    }
    
    TestFunc ( function(x){ return x.toString() }, "Number.toString" );     
    TestFunc ( toFloatBits, "toFloatBits" );     
    TestFunc ( toFloatBitsOpt1, "toFloatBits hex direct to string" );     */
    
    function TestCalling ( obj, name ) {
        var t0, t1;
        var tall = 0; 
        var countall = 0; 
        var sout = "";         
        console.log ( name );        
        
        t0 = testenv.getTimeS ( ); 
        for ( var i=0; i<10000000; i++ ) 
            obj.callme ( i );
        console.log ( obj.member );
        t1 = testenv.getTimeS ( ); 
        tall += t1-t0;    
                
        console.log ( "  total ("+countall+"):",tall );                    
    }    
    
    var a = new MyObject ( );
    var b = new MyObject2 ( );
    
    TestCalling ( a, "Member function" );
    TestCalling ( b, "Proto function" );
        
        
    console.log ( "Encode Number: All tests run.")
    
    testenv.abortcallback = function( ) {}        
}


// register test
testregistry.push ( {name:"Encode Number", srcuri:"numberencode.js", f:Test_EncodeNumber } ); 
