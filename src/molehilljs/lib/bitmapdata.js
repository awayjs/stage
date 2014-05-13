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

function BitmapData(canvas){
	this.canvas = canvas;
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.context = this.canvas.getContext("2d"); 
	this.imageData = null;

	// true if the canvas has been drawn into 
	// and the image data has not been updated
	this.dataInvalid = false;

	// true if the image data has changed
	// and the image data has not been updated
	this.canvasInvalid = false;

	this.updateImageData();
}

BitmapData.fromCanvas = function(canvas){
	return new BitmapData(canvas);
};

BitmapData.fromImage = function(image){
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;

	var context = canvas.getContext("2d");
	context.drawImage(image, 0, 0);

	return new BitmapData(canvas);
};

BitmapData.fromSize = function(width, height){
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	return new BitmapData(canvas);
};

BitmapData.prototype.draw = function(source, matrix){
	if (source instanceof BitmapData){
		// make sure source canvas has all
		// data changes drawn into it
		if (source.canvasInvalid){
			source.updateCanvas();
		}
		source = source.canvas;
	}

	// make sure this canvas has all
	// data changes drawn into it
	if (this.canvasInvalid){
		this.updateCanvas();
	}

	if (matrix !== undefined){
		this.context.save();
		this.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		this.context.drawImage(source, 0, 0);
		this.context.restore();
	}else{
		this.context.drawImage(source, 0, 0);
	}

	if (!this.dataInvalid){
		this.dataInvalid = true;
	}
};

BitmapData.prototype.updateImageData = function(){
	if (this.context){
		this.imageData = this.context.getImageData(0, 0, this.width, this.height);
		this.dataInvalid = false;
	}
};

BitmapData.prototype.updateCanvas = function(){
	if (this.context){
		this.context.putImageData(this.imageData, 0, 0);
		this.canvasInvalid = false;
	}
};

BitmapData.prototype.lock = function(){
	// noop
	// locking inherent in the api
	// with update methods needed
	// to apply changes
};

BitmapData.prototype.unlock = function(){
	// noop
};

BitmapData.prototype.getPixel = function(x, y){
	// make sure data has all updates
	// from canvas
	if (this.dataInvalid){
		this.updateImageData();
	}

	var i = 4 * x + 4 * y * this.imageData.width;
	var data = this.imageData.data;
	var r = data[i];
	var g = data[i + 1];
	var b = data[i + 2];
	var a = data[i + 3];

	return (a << 24) | (r << 16) | (g << 8) | b;
};

BitmapData.prototype.setPixel = function(x, y, pixel){
	// make sure data has all updates
	// from canvas
	if (this.dataInvalid){
		this.updateImageData();
	}

	var i = 4 * x + 4 * y * this.imageData.width;

	var a = (pixel >> 24) & 0xFF;
	var r = (pixel >> 16) & 0xFF;
	var g = (pixel >> 8) & 0xFF;
	var b = pixel & 0xFF;

	var data = this.imageData.data;
	data[i] = r;
	data[i + 1] = g;
	data[i + 2] = b;
	data[i + 3] = a;

	if (!this.canvasInvalid){
		this.canvasInvalid = true;
	}
};

BitmapData.prototype.fillRect = function(x, y, w, h, fillColor) {
	this.context.save();
	this.context.fillStyle = fillColor;
	this.context.fillRect(x, y, w, h);
	this.context.restore();
	this.updateImageData();
};

function Matrix(a,b,c,d,tx,ty){
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.tx = tx;
	this.ty = ty;
}