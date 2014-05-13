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

var testregistry = [
    {name:"Empty Test", srcuri:"about:blank", disable:false, autostart:false, f:function(){} }
];

var allincludes = [
    {src:"../lib/molehill.js"}
    ,{src:"../lib/molehill_webgl.js"}
    ,{src:"../lib/molehill_flash.js"}
    ,{src:"../lib/agalminiassembler.js"}
    ,{src:"../lib/bytearray.js"}
    ,{src:"../lib/matrix3d.js"}
    ,{src:"../lib/bitmapdata.js"}
    ,{src:"../lib/swfobject.js"}
    ,{src:"basictriangle.js"}
    ,{src:"canvas2d.js"}
    ,{src:"texturedtriangle.js"}
    ,{src:"bytearray.js" }
    ,{src:"cssshaders.js" }
    ,{src:"voronoi.js" }    
    ,{src:"matrix3d.js" }    
    ,{src:"complex.js" }   
    ,{src:"rttfx.js" }  
    ,{src:"multitexturedrectangle.js" }
    ,{src:"stencilbuffer1.js" } 
    ,{src:"stencilbuffer2.js" } 
    ,{src:"stencilbuffer3.js" } 
    ,{src:"stencilbuffer4.js" }  
    ,{src:"perspectivetriangle.js" }  
    ,{src:"zbuffer.js" } 
    ,{src:"scissor.js" } 
    ,{src:"mipmaprectangle.js" }  
    ,{src:"multicontext.js" }  
    ,{src:"cubemap.js" }  
    ,{src:"numberencode.js" } 
    ,{src:"mathfunctests.js" }  
    ,{src:"mathfunclimits.js" }  
    ,{src:"bones.js" }  
    ,{src:"ssg/SSG.js" }  
    ,{src:"bunnyscene.js" }  
];

var includesleft; 
    
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
    allincludes[idx].loaded = includesleft;
    console.log ( "Loaded "+allincludes[idx].src ); 
    if ( includesleft==0 ) 
        mainfunction ( ); 
}

function loadallandrun ( mainfunction ) {
    function shuffle ( arr ) {        
        for ( var i=0; i<arr.length-1; i++ ) {
            var j = ((Math.random()*(arr.length-i-2))>>>0)+i+1;
            var tmp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = tmp;             
        }
    }    
    includesleft = 0;
    shuffle ( allincludes ); // randomize include order to simulate a bit what happens on a network
    allincludes.forEach(function(include,index){             
        if ( !include.ignore ) {
            loadscript ( include.src, function() { includeloaded(index,mainfunction); } );        
            includesleft++; 
        }
    });
}

var testenv = {};

function testindexbyname ( testname ) {    
    var found = 0;
    testregistry.forEach(function(test,index){   
        if ( test.name==testname ) found = index; 
    });
    return found; 
}

var prof; 

function updatefpsgraph ( ) {
    if ( !testenv || !testenv.dt ) return; 
    if ( !prof ) {
        prof = {};
        prof.elem = document.getElementById ( "prof" );
        if ( !prof.elem ) return; 
        prof.canv = prof.elem.getContext("2d");                    
        prof.x = 0;
        prof.w = prof.elem.width; 
        prof.h = prof.elem.height; 
    }
    if ( !prof.canv ) return; 
    
    var y = (testenv.dt * prof.h * 10); 
    
    prof.canv.fillStyle="#10107F";    
    prof.canv.fillRect(prof.x,0,1,prof.h);    
    prof.canv.fillStyle="#20FF20";    
    prof.canv.fillRect(prof.x,prof.h-y,1,prof.h);            
    
    var y2 = (testenv.selfdt * prof.h * 10); 
    prof.canv.fillStyle="#F02F20";    
    prof.canv.fillRect(prof.x,prof.h-y2,1,prof.h);                
    
    prof.x++; 
    prof.canv.fillStyle="#1010FF";    
    prof.canv.fillRect(prof.x,0,1,prof.h);    
    
    prof.canv.fillStyle="#10107F";        
    prof.canv.fillRect(0,0,120,12);    
    prof.canv.fillStyle="#20FF20";
    prof.canv.font="10px Verdana";
    prof.canv.fillText("dT="+((testenv.dt*1000)>>>0)+"ms #"+testenv.framenum,1,10);        
    
    if ( prof.x > prof.w ) prof.x = 0;
}

function launchtest( index ) {    
    if ( testenv.abortcallback ) {
        console.log ( "Aborting previous test." ); 
        try {
            testenv.abortcallback(testenv); 
        } catch ( e ) {
            testenv.fail = e; 
        }        
        testenv.abortcallback = undefined; 
    }        
    if ( testenv.curenttest ) {
        var previdx = testindexbyname ( testenv.curenttest.name ); 
        if ( testenv.fail ) document.getElementById( "testbutton"+previdx ).style.background="#ff0000";       
        else document.getElementById( "testbutton"+previdx ).style.background="#00ff00";       
    }    
    if ( testenv.animid ) {
        window.cancelAnimationFrame ( testenv.animid );        
        testenv.animid = undefined; 
        testenv.enterframe = null; 
    }
    // setup test environment
    testenv.getTimeS = function ( ) {
        if ( Date.now ) return Date.now() / 1000; 
        else return (+(new Date))/1000;         
    }    
    testenv.curenttest = testregistry[index];    
    testenv.canvas = document.getElementById ( "can" );
    testenv.w = testenv.canvas.width; 
    testenv.h = testenv.canvas.height; 
    testenv.fail = undefined;     
    testenv.animid = undefined;
    testenv.enterframe = undefined; 
    testenv.framenum = 0;
    testenv.t = testenv.getTimeS(); 
    testenv.prevt = testenv.t;
    testenv.dt = 0;         
    testenv.mx = 0;
    testenv.my = 0;    
    testenv.orgw = testenv.canvas.width;
    testenv.orgh = testenv.canvas.height;              
    testenv.isfullscreen = false;
    var elsel = document.getElementById("testmode");
    testenv.testmode = elsel.options[elsel.selectedIndex].value;    
    elsel.onchange = function ( ) { launchtest(index);}
    
    window.onkeydown = function ( e ) {
        console.log ( "key:", e.keyCode );
        if ( e.keyCode == 70 ) {
            function onChangeFullscreen ( e ) {
                if ( testenv.isfullscreen ) {
                    testenv.canvas.width = testenv.orgw;
                    testenv.canvas.height = testenv.orgh;
                    testenv.isfullscreen = false;
                } else {                                                          
                    testenv.canvas.width = window.innerWidth;
                    testenv.canvas.height = window.innerHeight;                                            
                    testenv.isfullscreen = true;
                }
                testenv.w = testenv.canvas.width;
                testenv.h = testenv.canvas.height;                                 
            }                                                    
            if ( testenv.canvas.webkitRequestFullScreen ) {             
                testenv.canvas.onwebkitfullscreenchange = onChangeFullscreen;
                testenv.canvas.webkitRequestFullScreen();
            } else if ( testenv.canvas.mozRequestFullScreen ) {
                //testenv.canvas.width = window.innerWidth;
                //testenv.canvas.height = window.innerHeight;                                                            
                testenv.canvas.onmozfullscreenchange = onChangeFullscreen;
                testenv.canvas.mozRequestFullScreen();                
            }
        
        }
    };    
    
    testenv.canvas.onmousemove = function ( e ) {
        testenv.mx = e.clientX;
        testenv.my = e.clientY;        
    }
    
    testenv.framefunc = function ( ) {        
        if ( testenv.enterframe ) {                        
            testenv.prevt = testenv.t;            
            testenv.t = testenv.getTimeS();
            testenv.dt = testenv.t - testenv.prevt;
            testenv.enterframe ( testenv.t );     
            testenv.selfdt = testenv.getTimeS() - testenv.t; 
        }
        updatefpsgraph ( );
        testenv.framenum ++; 
        testenv.animid = window.requestAnimationFrame ( testenv.framefunc );
    }
    testenv.startOnEnterFrame = function ( handler ) {        
        this.enterframe = handler;         
        this.framefunc ( );                
    };
            
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.webkitRequestAnimationFrame;    
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame; 
    
    if ( !window.requestAnimationFrame ) 
        window.requestAnimationFrame = function ( callback ) { return setTimeout ( callback,0 ); }     
    if ( !window.cancelAnimationFrame ) 
        window.cancelAnimationFrame = clearTimeout;            
                
    document.getElementById( "testbutton"+index ).style.background="#ffff00"; 
    
    console.log ( "Launching test "+index+" "+testenv.curenttest.name ); 
    
    if ( console.group ) console.group ( );    
    try {
        testenv.curenttest.f(testenv); 
    } catch ( e ) {   
        console.log ( "Test failed: "+e );
        document.getElementById( "testbutton"+index ).style.background="#ff0000";       
        testenv.fail = e; 
    }    
    if ( console.groupEnd ) console.groupEnd ( );
}

function runall ( testindex ) {
    testindex = testindex|0; 
    if ( testindex >= testregistry.length ) return; 
    launchtest(testindex);        
    window.setTimeout ( function() { runall(testindex+1); }, testregistry[testindex].timeout|0 ); 
}
    
loadallandrun ( function() {
    // code with all includes loaded starts here -----------------------
    console.log ( "All includes loaded, running main." );
            
    var testlistnode = document.getElementById("testlist");
    var test = null;
    var testentry = null;
    testregistry.sort(function (a, b) {
        var x = b.name.charCodeAt(0);
        var y = a.name.charCodeAt(0);
        return y - x;
    });

    testregistry.forEach(function(test,index){    
        var testentry = document.createElement ( "button" ); 
        testentry.appendChild(document.createTextNode(test.name));            
        testentry.id = "testbutton"+index;
        testentry.type = "button";
        testentry.value = test.name;
        testentry.className  = "buttonclass";
        testentry.style.background="#7f7f7f"; 
        testentry.onclick = function(){launchtest(index);};                
        testlistnode.appendChild(testentry);        
    });
    
    var runallbtn = document.createElement ( "button" ); 
    runallbtn.appendChild(document.createTextNode("Autorun All"));    
    runallbtn.id = "runall"; 
    runallbtn.type = "button";    
    runallbtn.value = "Autorun All";
    runallbtn.style.background="#ffffff"; 
    runallbtn.className  = "buttonclass";
    runallbtn.onclick = runall;    
    document.getElementById("testall").appendChild(runallbtn);
    
    // autostart
    //launchtest(testindexbyname("CSS Shaders"));
    //launchtest(testindexbyname("Basic Triangle"));
    //launchtest(testindexbyname("Textured Triangle"));
    //launchtest(testindexbyname("ByteArray"));
    //launchtest(testindexbyname("Matrix3D (Number)"));
    launchtest(testindexbyname("Voronoi"));
    //launchtest(testindexbyname("Feedback"));
    //launchtest(testindexbyname("Multitextured Rectangle"));
    //launchtest(testindexbyname("Perspective Triangle"));
    //launchtest(testindexbyname("Z Buffer"));
    //launchtest(testindexbyname("Scissor"));
    //launchtest(testindexbyname("MipMapRectangle"));
    //launchtest(testindexbyname("Canvas 2D"));
    //launchtest(testindexbyname("CubeMap"));
    //launchtest(testindexbyname("MathFuncTests"));
    //launchtest(testindexbyname("MathFuncLimits"));
    //launchtest(testindexbyname("Complex"));
    //launchtest(testindexbyname("BunnyScene"));
    //launchtest(testindexbyname("StencilBuffer1"));
    //launchtest(testindexbyname("StencilBuffer2"));
    //launchtest(testindexbyname("StencilBuffer3"));
    //launchtest(testindexbyname("StencilBuffer4"));
    
    // done            
} );
    
    



