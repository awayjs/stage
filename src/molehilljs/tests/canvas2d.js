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
function Test_Canvas2D ( testenv ) {    
    var c2d; 
        
    c2d = testenv.canvas.getContext("2d");    
    c2d.fillStyle="#FF0000";
    c2d.fillRect(0,0,150,75);
    
    c2d.font="120px Verdana";
    // Create gradient
    var gradient=c2d.createLinearGradient(0,0,400,0);
    gradient.addColorStop("0","yellow");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");
    // Fill with gradient
    c2d.fillStyle=gradient;
    c2d.fillText("2D Canvas",10,90);    
    
    var imageObj = new Image();
    imageObj.onload = function ( ) {
        console.log ( "Loaded image." );
        c2d.drawImage ( imageObj, 10,10 );        
    };    
    imageObj.src = "res/stars.png";     
    
    
    testenv.abortcallback = function( ) {
        var pnode = testenv.canvas.parentNode;        
        var newnode = testenv.canvas.cloneNode();        
        pnode.replaceChild(newnode, testenv.canvas);
        testenv.canvas = newnode;         
    }    
}

// register test
testregistry.push ( {name:"Canvas 2D", srcuri:"canvas2d.js", f:Test_Canvas2D } ); 
