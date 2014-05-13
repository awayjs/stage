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
function Test_ByteArray ( testenv ) {        
    /*
    example of how ArrayBuffer is broken
    
    var a1 = new ArrayBuffer(256);                      
    var a2 = new ArrayBuffer(256); 
    
    var view_debug_a1 = new Uint8Array(a1); 
    var view_debug_a2 = new Uint8Array(a2); 
    
    var view_aligned_16_a2 = new Uint16Array(a2,0,1); // offset 0, 1 short... (2 shorts don't help either)
    var view_unaligned_8_a1 = new Uint8Array(a1,1); // offset 1, 2 bytes = 1 short
    
    view_aligned_16_a2[0] = 0x1234;                 // write short to a2, offset 0 
    view_unaligned_8_a1.set(view_aligned_16_a2);    // copy view 0 to view 1
    
    console.log ( view_aligned_16_a2[0] );
    console.log ( view_unaligned_8_a1[0],view_unaligned_8_a1[1] );
    console.log ( view_debug_a1[0],view_debug_a1[1],view_debug_a1[2],view_debug_a1[3] );
    console.log ( view_debug_a2[0],view_debug_a2[1],view_debug_a2[2],view_debug_a2[3] );    
    
    var view_aligned_32_a2 = new Uint32Array(a2,0,1); // offset 0, 1 int...
    var view_unaligned_8_a1 = new Uint8Array(a1,1); // offset 1, 4 bytes = 1 int
    
    view_aligned_32_a2[0] = 0x12345678;                 // write short to a2, offset 0 
    view_unaligned_8_a1.set(view_aligned_32_a2);    // copy view 0 to view 1
    
    console.log ( view_aligned_32_a2[0] );
    console.log ( view_unaligned_8_a1[0],view_unaligned_8_a1[1] );
    console.log ( view_debug_a1[0],view_debug_a1[1],view_debug_a1[2],view_debug_a1[3] );
    console.log ( view_debug_a2[0],view_debug_a2[1],view_debug_a2[2],view_debug_a2[3] );    
    */  
    
    function assert ( x, msg ) { if ( !x ) throw msg; }
    
    // basic tests
    var bar1 = new ByteArray(); 
    bar1.writeUnsignedByte(10);
    var bar2 = new ByteArray(); 
    bar2.writeUnsignedByte(20);
    bar2.writeUnsignedByte(30);
    bar2.writeUnsignedByte(0xff);
    bar2.writeUnsignedShort(30000);    
    bar2.writeUnsignedShort(0x1234);
    bar2.writeUnsignedShort(0xffff);  
    bar2.writeUnsignedInt(0x12345678);      
    bar2.writeUnsignedInt(0xffffffff);      
    bar2.writeUnsignedInt(7700000);
    bar2.writeFloat(0.25);
    bar2.writeFloat(-0.25);
    bar2.writeFloat(0);
    bar2.writeUnsignedByte(1);
    bar2.writeUnsignedShort(0x1234);
    bar2.writeUnsignedInt(0x12345678);      
    bar2.writeFloat(4.25);          
    var ni = bar2.length*4;
    for ( var i=0; i<ni; i++ ) bar2.writeUnsignedByte ( 0xfe );
        
    console.log ( bar1.toString ( ) );
    console.log ( bar2.toString ( ) );
    assert ( bar2.length==220, "check length" );
    assert ( bar2.position == bar2.length, "check position and length" );
    
    bar2.position = 0;     
    bar1.position = 0;         
    assert ( bar2.readUnsignedByte()==20, "read byte 20" );
    assert ( bar1.readUnsignedByte()==10, "read byte 10" );
    assert ( bar2.readUnsignedByte()==30, "read byte 30" );
    assert ( bar2.readUnsignedByte()==0xff, "read byte 0xff" );
    assert ( bar2.readUnsignedShort()==30000, "read unsigned short unaligned 30000" );
    assert ( bar2.readUnsignedShort()==0x1234, "read unsigned short unaligned 0x1234 (byte order)" );
    assert ( bar2.readUnsignedShort()==0xffff, "read unsigned short unaligned 0xffff (max range)" );    
    assert ( bar2.readUnsignedInt()==0x12345678, "read unsigned int unaligned 0x12345678 (byte order)" );        
    assert ( bar2.readUnsignedInt()==0xffffffff, "read unsigned int unaligned 0xffffffff (max range)" );    
    assert ( bar2.readUnsignedInt()==7700000, "read unsigned int unaligned 7700000" );    
    assert ( bar2.readFloat()==0.25, "read float unaligned 0.25" );
    bar2.position -= 4; 
    assert ( bar2.readUnsignedInt()==1048576000, "read float as int unaligned 0.25 (binary rep)" );            
    assert ( bar2.readFloat()==-0.25, "read float unaligned -0.25" );        
    bar2.position -= 4; 
    assert ( bar2.readUnsignedInt()==3196059648, "read float as int unaligned -0.25 (binary rep)" );    
    assert ( bar2.readFloat()==0, "read float unaligned 0" );             
    assert ( bar2.readUnsignedByte()==1, "read byte 1" );     
    assert ( bar2.readUnsignedShort()==0x1234, "read unsigned short aligned 0x1234" );     
    assert ( bar2.readUnsignedInt()===0x12345678, "read unsigned int aligned 0x12345678 (byte order)" );
    assert ( bar2.readFloat()==4.25, "read float aligned 4.25" );        
    
    // base 64 tests
    /*
    bar2.position = 0;     
    var s2 = bar2.readBase64String ( 40 );
    assert ( s2=="FB7/MHU0Ev//eFY0Ev////8gfnUAAACAPgAAgL4AAAAAATQSeFY0EgY==" );             
    console.log ( s2 );
    var bar3 = new ByteArray(); 
    bar3.writeBase64String ( s2 ); 
    bar3.position = 0;     
    var s3 = bar3.readBase64String ( 40 );
    assert ( s2==s3 );             
    bar3.position = 0;     
    bar2.position = 0;     
    for ( var i=0; i<40; i++ ) 
        assert ( bar2.readUnsignedByte() == bar3.readUnsignedByte() ); 
    */
    
    // seek back, overwrite a bit, seek, tests
    bar2.position = 7;     
    bar2.writeFloat ( 6.0 );
    bar2.writeUnsignedInt(0x12345678);     
    bar2.writeUnsignedShort(0xffff);  
    bar2.writeUnsignedByte(20);
    
    bar2.position = 64;     
    bar2.writeFloat ( 8.0 );
    bar2.writeUnsignedInt(0x87654321);     
    bar2.writeUnsignedShort(0xffff);  
    bar2.writeUnsignedByte(18);    
    
    bar2.position = 7;     
    assert ( bar2.readFloat()==6.0, "read float unaligned 6.0" );
    assert ( bar2.readUnsignedInt()==0x12345678, "read unsigned short unaligned 0x12345678" );
    assert ( bar2.readUnsignedShort()==0xffff, "read unsigned short unaligned 0xffff" );
    assert ( bar2.readUnsignedByte()==20, "read unsigned short unaligned 20" );        
    
    bar2.position = 64;     
    assert ( bar2.readFloat()==8.0, "read float aligned 8.0" );
    assert ( bar2.readUnsignedInt()==0x87654321, "read unsigned short aligned 0x87654321" );
    assert ( bar2.readUnsignedShort()==0xffff, "read unsigned short aligned 0xffff" );
    assert ( bar2.readUnsignedByte()==18, "read unsigned short aligned 18" );                
    
    console.log ( "ByteArray: All tests run.")
    
    testenv.abortcallback = function( ) {}    
}

// register test
testregistry.push ( {name:"ByteArray", srcuri:"bytearray.js", f:Test_ByteArray } ); 
