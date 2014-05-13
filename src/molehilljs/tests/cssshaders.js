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
function Test_CSSShaders ( testenv ) {    
    //var c2d;         
    //c2d = testenv.canvas.getContext("2d");    
    
    // put an image on the canvas
    // css shaders custom do not work on canvas!
    //var imageObj = new Image();    
    //imageObj.onload = function() {c2d.drawImage(imageObj, 0, 0);};    
    //imageObj.src = "res/angry_wet_cat.jpg";
        
    // insert the shader to html/css
    var style = document.getElementsByTagName("style")[0];    
    var prevstyle = new String(style.innerHTML); 
    //style.innerHTML = "#thecan { -webkit-filter: grayscale(1); }"    
    //style.innerHTML = "#thecan { -webkit-filter: blur(10px); }"    
    
    style.innerHTML += "#thecan { -webkit-filter: custom(url(res/test.vs) mix(url(res/test.fs) normal source-atop), 8 8, br 2.0, cr 1.75);  }"       
    //style.innerHTML = "#thecan { -webkit-filter: custom(url(http://html.adobe.com/webstandards/csscustomfilters/cssfilterlab/shaders/vertex/crumple.vs) mix(url(http://html.adobe.com/webstandards/csscustomfilters/cssfilterlab/shaders/fragment/crumple.fs) multiply source-atop), 50 50 border-box, transform perspective(1123) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg), amount 0.92, strength 0.27, lightIntensity 1);    }";
    
    // add img
    var imgtag = document.createElement("img");
    imgtag.src = "res/angry_wet_cat.jpg"; 
    imgtag.width = testenv.canvas.width;
    imgtag.height = testenv.canvas.height;
    testenv.canvas.parentNode.insertBefore(imgtag, testenv.canvas);                         
        
    testenv.abortcallback = function( ) {
        // clear and reset css
        var style = document.getElementsByTagName("style")[0];    
        style.innerHTML = prevstyle;
        // clear and reset canvas
        var pnode = testenv.canvas.parentNode;        
        var newnode = testenv.canvas.cloneNode();        
        pnode.replaceChild(newnode, testenv.canvas);
        testenv.canvas = newnode;                 
        // remove img
        pnode.removeChild(imgtag);
    }    
}

// register test
testregistry.push ( {name:"CSS Shaders", srcuri:"cssshaders.js", f:Test_CSSShaders } ); 