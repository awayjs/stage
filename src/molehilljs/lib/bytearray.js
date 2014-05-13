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

// byte array wrapper, worst case compatibility mode
// there should be a different version with typed arrays

function ByteArray ( ) {
    this.position = 0;
    this.length = 0;
    this.PrivInitBuffer (); 
};

if ( typeof(ArrayBuffer)==typeof(undefined) || typeof(Uint16Array)==typeof(undefined) ) {    
    ByteArray.prototype.PrivInitBuffer = function() {
        this.bytes = [];
    }
    
    ByteArray.prototype.writeByte = function(b) {    
        var bi = ~~b; // ~~ is cast to int in js...        
        this.bytes[this.position++] = bi;     
        if ( this.position > this.length ) this.length = this.position;     
    }
    
    ByteArray.prototype.readByte = function() {     
        if ( this.position >= this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        return this.bytes[this.position++];                
    }    
    
    ByteArray.prototype.writeUnsignedByte = function(b) {    
        var bi = ~~b; // ~~ is cast to int in js...
        this.bytes[this.position++] = bi & 0xff;     
        if ( this.position > this.length ) this.length = this.position;     
    }
    
    ByteArray.prototype.readUnsignedByte = function() {     
        if ( this.position >= this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        return this.bytes[this.position++];                
    }
    
    ByteArray.prototype.writeUnsignedShort = function(b) {        
        var bi = ~~b;   
        this.bytes[this.position++] = bi & 0xff;     
        this.bytes[this.position++] = (bi>>8) & 0xff;     
        if ( this.position > this.length ) this.length = this.position;     
    }
    
    ByteArray.prototype.readUnsignedShort = function() {    
        if ( this.position+2 > this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        var r = this.bytes[this.position] | (this.bytes[this.position+1]<<8);
        this.position += 2;
        return r;                
    }
    
    ByteArray.prototype.writeUnsignedInt = function(b) {   
        var bi = ~~b; 
        this.bytes[this.position++] = bi & 0xff;     
        this.bytes[this.position++] = (bi>>>8) & 0xff;     
        this.bytes[this.position++] = (bi>>>16) & 0xff;     
        this.bytes[this.position++] = (bi>>>24) & 0xff;     
        if ( this.position > this.length ) this.length = this.position;     
    }
    
    ByteArray.prototype.readUnsignedInt = function() {    
        if ( this.position+4 > this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        var r = this.bytes[this.position] | (this.bytes[this.position+1]<<8)
            | (this.bytes[this.position+2]<<16) | (this.bytes[this.position+3]<<24);        
        this.position += 4;
        return r>>>0;                
    }
    
    ByteArray.prototype.writeFloat = function(b) {   
        // this is crazy slow and silly, but as a fallback... 
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
            return ((sign<<31)>>>0) | (exponent<<23) | mantissa;          
        }
        this.writeUnsignedInt(toFloatBits(Number(b)));    
    }
    
    ByteArray.prototype.readFloat = function(b) {   
        function fromFloatBits ( x ) {
            if ( x==0 ) return 0;          
            var exponent = (x>>>23)&0xff;        
            var mantissa = (x&0x7fffff)|0x800000;        
            var y = Math.pow(2,(exponent-127)-23) * mantissa;
            if ( x>>>31!=0 ) y = -y;
            return y;
        }
        
        return fromFloatBits ( this.readUnsignedInt() );
    }
        
    ByteArray.prototype.mode = "Array";
} else {        
    ByteArray.prototype.PrivInitBuffer = function () {
        this.maxlength = 4;
        this.arraybytes = new ArrayBuffer(this.maxlength);                      
        this.unalignedarraybytestemp = new ArrayBuffer(16); 
    }
    
    ByteArray.prototype.EnsureWriteableSpace = function(n) {
        this.EnsureSpace ( n+this.position ); 
    }
    
    ByteArray.prototype.EnsureSpace = function(n) {
        if ( n > this.maxlength ) {
            var newmaxlength = (n+255)&(~255); 
            var newarraybuffer = new ArrayBuffer(newmaxlength);                              
            var view = new Uint8Array(this.arraybytes,0,this.length); 
            var newview = new Uint8Array(newarraybuffer,0,this.length); 
            newview.set(view);      // memcpy                        
            this.arraybytes = newarraybuffer;
            this.maxlength = newmaxlength;                         
        }
    }
    
    ByteArray.prototype.writeByte = function(b) {                    
        this.EnsureWriteableSpace ( 1 );         
        var view = new Int8Array(this.arraybytes); 
        view[this.position++] = (~~b); // ~~ is cast to int in js...
        if ( this.position > this.length ) this.length = this.position;                 
    }    
    
    ByteArray.prototype.readByte = function() {     
        if ( this.position >= this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        var view = new Int8Array(this.arraybytes); 
        return view[this.position++];                
    }        
    
    ByteArray.prototype.writeUnsignedByte = function(b) {                    
        this.EnsureWriteableSpace ( 1 );         
        var view = new Uint8Array(this.arraybytes); 
        view[this.position++] = (~~b) & 0xff; // ~~ is cast to int in js...
        if ( this.position > this.length ) this.length = this.position;                 
    }    
    
    ByteArray.prototype.readUnsignedByte = function() {     
        if ( this.position >= this.length ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length; 
        var view = new Uint8Array(this.arraybytes); 
        return view[this.position++];                
    }    
    
    ByteArray.prototype.writeUnsignedShort = function(b) {       
        this.EnsureWriteableSpace ( 2 );         
        if ( (this.position&1)==0 ) {
            var view = new Uint16Array(this.arraybytes);
            view[this.position>>1] = (~~b) & 0xffff; // ~~ is cast to int in js...
        } else {
            var view = new Uint16Array(this.unalignedarraybytestemp,0,1);
            view[0] = (~~b) & 0xffff;
            var view2 = new Uint8Array(this.arraybytes,this.position,2);                         
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,2); 
            view2.set(view3);               
        }        
        this.position+=2; 
        if ( this.position > this.length ) this.length = this.position;                          
    }    
    
    ByteArray.prototype.readUnsignedShort = function() {     
        if ( this.position > this.length+2 ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length;         
        if ( (this.position&1)==0 ) {
            var view = new Uint16Array(this.arraybytes); 
            var pa = this.position>>1; 
            this.position+=2;
            return view[pa];                
        } else {
            var view = new Uint16Array(this.unalignedarraybytestemp,0,1);
            var view2 = new Uint8Array(this.arraybytes,this.position,2);             
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,2);            
            view3.set(view2);                         
            this.position+=2;
            return view[0];                            
        }
    }        
    
    ByteArray.prototype.writeUnsignedInt = function(b) {                    
        this.EnsureWriteableSpace ( 4 );         
        if ( (this.position&3)==0 ) {
            var view = new Uint32Array(this.arraybytes);
            view[this.position>>2] = (~~b) & 0xffffffff; // ~~ is cast to int in js...            
        } else {
            var view = new Uint32Array(this.unalignedarraybytestemp,0,1);
            view[0] = (~~b) & 0xffffffff; 
            var view2 = new Uint8Array(this.arraybytes,this.position,4);                         
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,4); 
            view2.set(view3);                 
        }        
        this.position+=4; 
        if ( this.position > this.length ) this.length = this.position;                 
    }    
    
    ByteArray.prototype.readUnsignedInt = function() {     
        if ( this.position > this.length+4 ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length;         
        if ( (this.position&3)==0 ) {
            var view = new Uint32Array(this.arraybytes); 
            var pa = this.position>>2;             
            this.position+=4;            
            return view[pa];                
        } else {
            var view = new Uint32Array(this.unalignedarraybytestemp,0,1);
            var view2 = new Uint8Array(this.arraybytes,this.position,4);             
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,4);            
            view3.set(view2);                                     
            this.position+=4;            
            return view[0];                            
        }              
    }            
    
    ByteArray.prototype.writeFloat = function(b) {                    
        this.EnsureWriteableSpace ( 4 );         
        if ( (this.position&3)==0 ) {
            var view = new Float32Array(this.arraybytes);
            view[this.position>>2] = b; 
        } else {
            var view = new Float32Array(this.unalignedarraybytestemp,0,1);
            view[0] = b; 
            var view2 = new Uint8Array(this.arraybytes,this.position,4);                         
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,4); 
            view2.set(view3);                 
        }        
        this.position+=4; 
        if ( this.position > this.length ) this.length = this.position;                      
    }    
    
    ByteArray.prototype.readFloat = function() {     
        if ( this.position > this.length+4 ) 
            throw "Bytearry out of bounds read. Positon="+this.position+", Length="+this.length;         
        if ( (this.position&3)==0 ) {
            var view = new Float32Array(this.arraybytes); 
            var pa = this.position>>2; 
            this.position+=4;
            return view[pa];                
        } else {
            var view = new Float32Array(this.unalignedarraybytestemp,0,1);
            var view2 = new Uint8Array(this.arraybytes,this.position,4);             
            var view3 = new Uint8Array(this.unalignedarraybytestemp,0,4);            
            view3.set(view2);                         
            this.position+=4;
            return view[0];                            
        }                             
    }                
    
    ByteArray.prototype.mode = "Typed array";
}

// shared bytearray helpers on top of read/write functions
ByteArray.prototype.toString = function() {
    return "ByteArray ("+this.mode+") position="+this.position+" length="+this.length; 
}

ByteArray.prototype.compareEqual = function(other,count) {    
    if ( count==undefined || count > this.length - this.position ) 
        count = this.length - this.position;
    if ( count > other.length - other.position )     
        count = other.length - other.position;
    var co0 = count; 
    var r = true; 
    while ( r && count >= 4 ) {
        count-=4; 
        if ( this.readUnsignedInt() != other.readUnsignedInt() ) r = false; 
    }
    while ( r && count >= 1 ) {       
        count--; 
        if ( this.readUnsignedByte() != other.readUnsignedByte() ) r = false; 
    }
    this.position-=(c0-count); 
    other.position-=(c0-count); 
    return r;         
}

ByteArray.prototype.Base64Key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// base 64, useful for using in data uris 
ByteArray.prototype.writeBase64String = function(s) { // s is a base64 string that get appended
    for ( var i=0; i<s.length; i++ ) {
        var v = s.charAt(i); 
    }
}

ByteArray.prototype.dumpToConsole = function() {
    var oldpos = this.position;     
    this.position = 0;
    var nstep = 8;     
    function asHexString ( x, digits ) {
        var lut = [ "0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f" ]; 
        var sh = "";
        for ( var d=0; d<digits; d++ ) 
            sh = lut[(x>>(d<<2))&0xf]+sh; 
        return sh;
    }
    
    for ( var i=0; i<this.length; i+=nstep ) {
        var s = asHexString(i,4)+":"; 
        for ( var j=0; j<nstep && i+j<this.length; j++ )         
            s += " "+asHexString(this.readUnsignedByte(),2);
        console.log ( s );
    }
    this.position = oldpos;
}

ByteArray.prototype.readBase64String = function(count) {
    if (count == undefined || count > this.length - this.position)
        count = this.length - this.position;
    if (!count > 0) return "";

    return internalGetBase64String(count, this.readUnsignedByte, this);
}

function internalGetBase64String(count, getUnsignedByteFunc, self) { // return base64 string of the next count bytes
    var r = "";
    var b0, b1, b2, enc1, enc2, enc3, enc4;
    var base64Key = ByteArray.prototype.Base64Key;
    while ( count>=3 ) {                    
        b0 = getUnsignedByteFunc.apply(self);
        b1 = getUnsignedByteFunc.apply(self);
        b2 = getUnsignedByteFunc.apply(self);
        enc1 = b0 >> 2;
        enc2 = ((b0 & 3) << 4) | (b1 >> 4);
        enc3 = ((b1 & 15) << 2) | (b2 >> 6);
        enc4 = b2 & 63;                
        r += base64Key.charAt(enc1) + base64Key.charAt(enc2) + base64Key.charAt(enc3) + base64Key.charAt(enc4);                            
        count -= 3; 
    }
    // pad
    if ( count==2 ) {        
        b0 = getUnsignedByteFunc.apply(self);
        b1 = getUnsignedByteFunc.apply(self);
        enc1 = b0 >> 2;
        enc2 = ((b0 & 3) << 4) | (b1 >> 4);
        enc3 = ((b1 & 15) << 2);                
        r += base64Key.charAt(enc1) + base64Key.charAt(enc2) + base64Key.charAt(enc3) + "=";                                
    } else if ( count==1 ) {        
        b0 = getUnsignedByteFunc.apply(self);
        enc1 = b0 >> 2;
        enc2 = ((b0 & 3) << 4);        
        r += base64Key.charAt(enc1) + base64Key.charAt(enc2) + "==";                                
    }  
    return r; 
}

