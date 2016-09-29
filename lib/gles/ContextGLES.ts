import {BitmapImage2D}				from "@awayjs/core/lib/image/BitmapImage2D";
import {Rectangle}					from "@awayjs/core/lib/geom/Rectangle";
import {ByteArray}						from "@awayjs/core/lib/utils/ByteArray";
import {GLESConnector}					from "./GLESConnector";

import {ContextGLBlendFactor}			from "../base/ContextGLBlendFactor";
import {ContextGLDrawMode}			from "../base/ContextGLDrawMode";
import {ContextGLClearMask}			from "../base/ContextGLClearMask";
import {ContextGLCompareMode}			from "../base/ContextGLCompareMode";
import {ContextGLMipFilter}			from "../base/ContextGLMipFilter";
import {ContextGLProgramType}			from "../base/ContextGLProgramType";
import {ContextGLStencilAction}		from "../base/ContextGLStencilAction";
import {ContextGLTextureFilter}		from "../base/ContextGLTextureFilter";
import {ContextGLTriangleFace}		from "../base/ContextGLTriangleFace";
import {ContextGLVertexBufferFormat}	from "../base/ContextGLVertexBufferFormat";
import {ContextGLWrapMode}			from "../base/ContextGLWrapMode";
import {IContextGL}				    from "../base/IContextGL"
import {SamplerState}					from "../base/SamplerState";

import {CubeTextureGLES}				from "./CubeTextureGLES";
import {IndexBufferGLES}				from "./IndexBufferGLES";
import {ProgramGLES}					from "./ProgramGLES";
import {TextureBaseGLES}				from "./TextureBaseGLES";
import {TextureGLES}					from "./TextureGLES";
import {VertexBufferGLES}			from "./VertexBufferGLES";
import {OpCodes}						from "../flash/OpCodes";

export class ContextGLES implements IContextGL
{
	private static _uniformLocationNameDictionary:Array<string> = ["fc", "fs", "vc"];
	private _blendFactorDictionary:Object = new Object();
	private _drawModeDictionary:Object = new Object();
	private _compareModeDictionary:Object = new Object();
	private stencilTriangleFace:Object = new Object();
	private _stencilActionDictionary:Object = new Object();
	private _textureIndexDictionary:Array<number> = new Array<number>(8);
	private _textureTypeDictionary:Object = new Object();
	private _wrapDictionary:Object = new Object();
	private _filterDictionary:Object = new Object();
	private _mipmapFilterDictionary:Object = new Object();
	private _vertexBufferPropertiesDictionary:Array<VertexBufferProperties> = [];

	public _cmdBytes:ByteArray;
	public _createBytes:ByteArray;
	public sendBytes:ByteArray;
	private _container:HTMLElement;
	private _width:number;
	private _height:number;
	private _drawing:boolean;
	private _blendEnabled:boolean;
	private _blendSourceFactor:number;
	private _blendDestinationFactor:number;

	private _standardDerivatives:boolean;

	private _samplerStates:Array<SamplerState> = new Array<SamplerState>(8);

	public static MAX_SAMPLERS:number = 8;

	//@protected
	public _gl:WebGLRenderingContext;

	//@protected
	public _currentProgram:ProgramGLES;
	private _currentArrayBuffer:VertexBufferGLES;
	private _activeTexture:number;

    private _stencilCompareMode:number;
    private _stencilCompareModeBack:number;
    private _stencilCompareModeFront:number;
    private _stencilReferenceValue : number = 0;
    private _stencilReadMask : number = 0xff;
    private _separateStencil : boolean = false;
	private _textureCnt:number=0;
	private _programCnt:number=0;
	private _cubeTextureCnt:number=0;
	private _indexBufferCnt:number=0;
	private _vertexBufferCnt:number=0;


	public get container():HTMLElement
	{
		return this._container;
	}
	public get standardDerivatives():boolean
	{
		return this._standardDerivatives;
	}
	constructor(canvas:HTMLCanvasElement)
	{
		this._container = canvas;
		this._cmdBytes=new ByteArray();
		this._createBytes=new ByteArray();
		this.sendBytes=new ByteArray();

		//this._createBytes=new ByteArray();
		
		// try {
		// 	this._gl = <WebGLRenderingContext> canvas.getContext("experimental-webgl", { premultipliedAlpha:false, alpha:false, stencil:true });
		//
		// 	if (!this._gl)
		// 		this._gl = <WebGLRenderingContext> canvas.getContext("webgl", { premultipliedAlpha:false, alpha:false, stencil:true });
		// } catch (e) {
		// 	//this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
		// }
		//
		// if (this._gl) {
		// 	//this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_SUCCESS ) );
		//
		// 	if(this._gl.getExtension("OES_standard_derivatives"))
		// 	{
		// 		this._standardDerivatives = true;
		// 	}else{
		// 		this._standardDerivatives = false;
		// 	}
		//
		// 	//setup shortcut dictionaries
		this._blendFactorDictionary[ContextGLBlendFactor.ONE] = 1;
		this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_ALPHA] = 0x0304;
		this._blendFactorDictionary[ContextGLBlendFactor.DESTINATION_COLOR] = 0x0306;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_ALPHA] = 0x0305;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_DESTINATION_COLOR] = 0x0307;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_ALPHA] = 0x0303;
		this._blendFactorDictionary[ContextGLBlendFactor.ONE_MINUS_SOURCE_COLOR] = 0x0301;
		this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_ALPHA] = 0x0302;
		this._blendFactorDictionary[ContextGLBlendFactor.SOURCE_COLOR] = 0x0300;
		this._blendFactorDictionary[ContextGLBlendFactor.ZERO] = 0;
		//
		this._drawModeDictionary[ContextGLDrawMode.LINES] = 0x0001;
		this._drawModeDictionary[ContextGLDrawMode.TRIANGLES] = 0x0004;
		//
		this._compareModeDictionary[ContextGLCompareMode.ALWAYS] = 0x0207;
		this._compareModeDictionary[ContextGLCompareMode.EQUAL] = 0x0202;
		this._compareModeDictionary[ContextGLCompareMode.GREATER] = 0x0204;
		this._compareModeDictionary[ContextGLCompareMode.GREATER_EQUAL] = 0x0206;
		this._compareModeDictionary[ContextGLCompareMode.LESS] = 0x0201;
		this._compareModeDictionary[ContextGLCompareMode.LESS_EQUAL] = 0x0203;
		this._compareModeDictionary[ContextGLCompareMode.NEVER] = 0x0200;
		this._compareModeDictionary[ContextGLCompareMode.NOT_EQUAL] = 0x0205;

		this.stencilTriangleFace["frontAndBack"]=0x0408;
		this.stencilTriangleFace["front"]=0x0404;
		this.stencilTriangleFace["back"]=0x0405;
		//
        this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_SATURATE] = 0x1E03;
        this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_WRAP] = 0x8508;
        this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_SATURATE] = 0x1E02;
        this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_WRAP] = 0x8507;
        this._stencilActionDictionary[ContextGLStencilAction.INVERT] = 0x150A;
        this._stencilActionDictionary[ContextGLStencilAction.KEEP] = 0x1E00;
        this._stencilActionDictionary[ContextGLStencilAction.SET] = 0x1E01;
        this._stencilActionDictionary[ContextGLStencilAction.ZERO] = 0;
		//
		// 	this._textureIndexDictionary[0] = this._gl.TEXTURE0;
		// 	this._textureIndexDictionary[1] = this._gl.TEXTURE1;
		// 	this._textureIndexDictionary[2] = this._gl.TEXTURE2;
		// 	this._textureIndexDictionary[3] = this._gl.TEXTURE3;
		// 	this._textureIndexDictionary[4] = this._gl.TEXTURE4;
		// 	this._textureIndexDictionary[5] = this._gl.TEXTURE5;
		// 	this._textureIndexDictionary[6] = this._gl.TEXTURE6;
		// 	this._textureIndexDictionary[7] = this._gl.TEXTURE7;
		//
		// 	this._textureTypeDictionary["texture2d"] = this._gl.TEXTURE_2D;
		// 	this._textureTypeDictionary["textureCube"] = this._gl.TEXTURE_CUBE_MAP;
		//
		 	this._wrapDictionary[ContextGLWrapMode.REPEAT] = 0x2901;
		 	this._wrapDictionary[ContextGLWrapMode.CLAMP] = 0x812F;
		//
		 	this._filterDictionary[ContextGLTextureFilter.LINEAR] = 0x2601;
		 	this._filterDictionary[ContextGLTextureFilter.NEAREST] = 0x2600;
		//
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR] = new Object();
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNEAREST] =0x2701;
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPLINEAR] = 0x2703;
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.LINEAR][ContextGLMipFilter.MIPNONE] = 0x2601;
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST] = new Object();
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNEAREST] = 0x2700;
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPLINEAR] = 0x2702;
		 	this._mipmapFilterDictionary[ContextGLTextureFilter.NEAREST][ContextGLMipFilter.MIPNONE] = 0x2600;

		// } else {
		// 	//this.dispatchEvent( new away.events.AwayEvent( away.events.AwayEvent.INITIALIZE_FAILED, e ) );
		// 	alert("GLES is not available.");
		// }
		//
		// //defaults
		// for (var i:number = 0; i < ContextGLES.MAX_SAMPLERS; ++i) {
		// 	this._samplerStates[i] = new SamplerState();
		// 	this._samplerStates[i].wrap = this._gl.REPEAT;
		// 	this._samplerStates[i].filter = this._gl.LINEAR;
		// 	this._samplerStates[i].mipfilter = this._gl.LINEAR;
		// }
	}

	public enableStencil(){
		this._cmdBytes.ensureWriteableSpace(1);
		this._cmdBytes.writeUnsignedByte(OpCodes.enableStencil);
	}
	public disableStencil(){
		this._cmdBytes.ensureWriteableSpace(1);
		this._cmdBytes.writeUnsignedByte(OpCodes.disableStencil);
	}
	public gl():WebGLRenderingContext
	{
		return this._gl;
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL):void
	{
		//this.addStream(String.fromCharCode(OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + "#END");
		this._cmdBytes.ensureWriteableSpace(29);
		this._cmdBytes.writeUnsignedByte(OpCodes.clear);

		this._cmdBytes.writeFloat(red/255);
		this._cmdBytes.writeFloat(green/255);
		this._cmdBytes.writeFloat(blue/255);
		this._cmdBytes.writeFloat(alpha);
		this._cmdBytes.writeUnsignedInt(depth);
		this._cmdBytes.writeUnsignedInt(stencil);
		this._cmdBytes.writeUnsignedInt(mask);		
	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true):void
	{
		this._width = width;
		this._height = height;
		//this.addStream(String.fromCharCode(OpCodes.configureBackBuffer) + width + "," + height + ","+ antiAlias+","+enableDepthAndStencil + "#END");
		this._cmdBytes.ensureWriteableSpace(10);
		this._cmdBytes.writeUnsignedByte(OpCodes.configureBackBuffer);
		this._cmdBytes.writeFloat(width);
		this._cmdBytes.writeFloat(height);
		this._cmdBytes.writeByte(enableDepthAndStencil?1:0);
		//todo: AA setting not used in opengl yet
	}

	public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):CubeTextureGLES
	{
		// todo: cubetextures not finished / tested for opengl yet
		return new CubeTextureGLES(this, this._gl, size, this._cubeTextureCnt++);
	}

	public createIndexBuffer(numIndices:number):IndexBufferGLES
	{
		// todo: indexBuffer not finished / tested for opengl yet
		return new IndexBufferGLES(this, this._gl, numIndices, this._indexBufferCnt++);
	}

	public createProgram():ProgramGLES
	{
		return new ProgramGLES(this, this._gl, this._programCnt++);
	}

	public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):TextureGLES
	{
		//TODO streaming
		return new TextureGLES(this, this._gl, width, height, this._textureCnt++);
	}

	public createVertexBuffer(numVertices:number, dataPerVertex:number):VertexBufferGLES
	{
		return new VertexBufferGLES(this, this._gl, numVertices, dataPerVertex, this._vertexBufferCnt++);
	}

	public dispose():void
	{
		//this.addStream(String.fromCharCode(OpCodes.disposeContext) + "#END");
		this._cmdBytes.ensureWriteableSpace(1);
		this._cmdBytes.writeUnsignedByte(OpCodes.disposeContext);
		this.execute();
	}

	public drawToBitmapImage2D(destination:BitmapImage2D):void
	{
		//todo (not needed for icycle (?) )
		// var pixels:Uint8ClampedArray = new Uint8ClampedArray(destination.width*destination.height*4);
		//
		// this._gl.readPixels(0, 0, destination.width, destination.height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
		//
		// destination.setPixels(new Rectangle(0, 0, destination.width, destination.height), pixels);
	}

	public drawIndices(mode:string, indexBuffer:IndexBufferGLES, firstIndex:number = 0, numIndices:number = -1):void
	{
		//todo (not needed for icycle)
		//GLESConnector.gles.drawIndices(mode, indexBuffer.id, firstIndex, numIndices);
		// if (!this._drawing)
		// 	throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
		//
		//
		// this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer.glBuffer);
		// this._gl.drawElements(this._drawModeDictionary[mode], (numIndices == -1)? indexBuffer.numIndices : numIndices, this._gl.UNSIGNED_SHORT, firstIndex*2);
	}

	public drawVertices(mode:string, firstVertex:number = 0, numVertices:number = -1):void
	{
		// if (!this._drawing)
		// 	throw "Need to clear before drawing if the buffer has not been cleared since the last present() call.";
		//this.addStream(String.fromCharCode(OpCodes.drawVertices) + this._drawModeDictionary[mode] + "," + firstVertex + ","+ numVertices  + "#END");
		this._cmdBytes.ensureWriteableSpace(10);
		this._cmdBytes.writeUnsignedByte(OpCodes.drawVertices);
		this._cmdBytes.writeUnsignedByte( this._drawModeDictionary[mode]);
		this._cmdBytes.writeUnsignedInt(firstVertex);
		this._cmdBytes.writeUnsignedInt(numVertices);
	}

	public present():void
	{
		this.execute();
	}

	public setBlendFactors(sourceFactor:string, destinationFactor:string):void
	{
		this._blendEnabled = true;		
		this._blendSourceFactor = this._blendFactorDictionary[sourceFactor];		
		this._blendDestinationFactor = this._blendFactorDictionary[destinationFactor];		
		this.updateBlendStatus();
	}

	public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean):void
	{
		//this.addStream(String.fromCharCode(OpCodes.setColorMask, red? OpCodes.trueValue : OpCodes.falseValue, green? OpCodes.trueValue : OpCodes.falseValue, blue? OpCodes.trueValue : OpCodes.falseValue, alpha? OpCodes.trueValue : OpCodes.falseValue) + "#END");
		this._cmdBytes.ensureWriteableSpace(5);
		this._cmdBytes.writeUnsignedByte(OpCodes.setColorMask);
		this._cmdBytes.writeByte(red?1:0);
		this._cmdBytes.writeByte(green?1:0);
		this._cmdBytes.writeByte(blue?1:0);
		this._cmdBytes.writeByte(alpha?1:0);
	}

	public setCulling(triangleFaceToCull:string, coordinateSystem:string = "leftHanded"):void
	{
		if (triangleFaceToCull == ContextGLTriangleFace.NONE) {
			//this.addStream(String.fromCharCode(OpCodes.disableCulling) + "#END");
			this._cmdBytes.ensureWriteableSpace(1);
			this._cmdBytes.writeUnsignedByte(OpCodes.disableCulling);
			return;
		}
		var faceCulling:number  = this.translateTriangleFace(triangleFaceToCull, coordinateSystem);
		//this.addStream(String.fromCharCode(OpCodes.setCulling)+ faceCulling + "#END");
		this._cmdBytes.ensureWriteableSpace(5);
		this._cmdBytes.writeUnsignedByte(OpCodes.setCulling);
		this._cmdBytes.writeUnsignedInt(faceCulling);
	}

	public setDepthTest(depthMask:boolean, passCompareMode:string):void
	{
		//this.addStream(String.fromCharCode(OpCodes.setDepthTest, depthMask? OpCodes.trueValue : OpCodes.falseValue)+","+ this._compareModeDictionary[passCompareMode]+ "#END");
		this._cmdBytes.ensureWriteableSpace(6);
		this._cmdBytes.writeUnsignedByte(OpCodes.setDepthTest);

		this._cmdBytes.writeByte(depthMask?1:0);
		this._cmdBytes.writeUnsignedInt(this._compareModeDictionary[passCompareMode]);
	}

	public setStencilActionsMasks( compareMode:string, referenceValue:number, writeMask:number, actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded")
	{

		var compareModeGL = this._compareModeDictionary[compareMode];
		var fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
		var zFail = this._stencilActionDictionary[actionOnDepthFail];
		var pass = this._stencilActionDictionary[actionOnBothPass];
		this._cmdBytes.ensureWriteableSpace(25);
		this._cmdBytes.writeUnsignedByte(OpCodes.setStencilActionsMasks);
		this._cmdBytes.writeUnsignedInt(compareModeGL);
		this._cmdBytes.writeUnsignedInt(referenceValue);
		this._cmdBytes.writeUnsignedInt(writeMask);
		this._cmdBytes.writeUnsignedInt(fail);
		this._cmdBytes.writeUnsignedInt(zFail);
		this._cmdBytes.writeUnsignedInt(pass);
	}
    public setStencilActions(triangleFace:string = "frontAndBack", compareMode:string = "always", actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded")
    {
		var compareModeGL = this._compareModeDictionary[compareMode];
		var triangleFaceGL = this.stencilTriangleFace[triangleFace];
		var fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
		var zFail = this._stencilActionDictionary[actionOnDepthFail];
		var pass = this._stencilActionDictionary[actionOnBothPass];
		//this.addStream(String.fromCharCode(OpCodes.setStencilActions) + triangleFaceGL + "," + compareModeGL + "," + pass + "," + zFail + "," + fail + "," + "#END");
		this._cmdBytes.ensureWriteableSpace(21);
		this._cmdBytes.writeUnsignedByte(OpCodes.setStencilActions);

		this._cmdBytes.writeUnsignedInt(triangleFaceGL);
		this._cmdBytes.writeUnsignedInt(compareModeGL);
		this._cmdBytes.writeUnsignedInt(fail);
		this._cmdBytes.writeUnsignedInt(zFail);
		this._cmdBytes.writeUnsignedInt(pass);
    }

    public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number)
    {
		//this.addStream(String.fromCharCode(OpCodes.setStencilReferenceValue)+ ","+ referenceValue+ ","+  readMask+ ","+  writeMask + "#END");
		this._cmdBytes.ensureWriteableSpace(13);
		this._cmdBytes.writeUnsignedByte(OpCodes.setStencilReferenceValue);

		this._cmdBytes.writeUnsignedInt(referenceValue);
		this._cmdBytes.writeUnsignedInt(readMask);
		this._cmdBytes.writeUnsignedInt(writeMask);
    }

	public setProgram(program:ProgramGLES):void
	{
		//this.addStream(String.fromCharCode(OpCodes.setProgram)+""+ program.id + "#END");
		this._cmdBytes.ensureWriteableSpace(2);
		this._cmdBytes.writeUnsignedByte(OpCodes.setProgram);
		this._cmdBytes.writeUnsignedByte(program.id);
	}

	public static modulo:number = 0;

	public setProgramConstantsFromArray(programType:number, data:Float32Array):void
	{
		var target_name:string = ContextGLES._uniformLocationNameDictionary[programType];
		this._cmdBytes.ensureWriteableSpace(3+data.length*4);
		this._cmdBytes.writeUnsignedByte(OpCodes.setProgramConstant);
		this._cmdBytes.writeUnsignedByte(programType);
		this._cmdBytes.writeUnsignedByte(data.length);
		this._cmdBytes.writeArrayBuffer(data.buffer);
		//var data_str="";
		// for (var i:number = 0; i < data.length; i++) {
		// 	this._cmdBytes.writeFloat(data[i]);
		// 	//data_str+=data[i]+",";
		// }
		//this.addStream(String.fromCharCode(OpCodes.setProgramConstant)+target_name+"," + data.length + "," + data_str  + "#END");

	}

	public setScissorRectangle(rectangle:Rectangle):void
	{
		if (rectangle) {
			//this.addStream(String.fromCharCode(OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height  + "#END");
			this._cmdBytes.ensureWriteableSpace(17);
			this._cmdBytes.writeUnsignedByte(OpCodes.setScissorRect);
			this._cmdBytes.writeFloat(rectangle.x);
			this._cmdBytes.writeFloat(rectangle.y);
			this._cmdBytes.writeFloat(rectangle.width);
			this._cmdBytes.writeFloat(rectangle.height);
		} else {
			//this.addStream(String.fromCharCode(OpCodes.clearScissorRect) + "#END");
			this._cmdBytes.ensureWriteableSpace(1);
			this._cmdBytes.writeUnsignedByte(OpCodes.clearScissorRect);
		}
	}

	public setTextureAt(sampler:number, texture:TextureBaseGLES):void
	{
		if (texture) {
			//this.addStream(String.fromCharCode(OpCodes.setTextureAt) + sampler + "," + texture.id  + "#END");
			this._cmdBytes.ensureWriteableSpace(3);
			this._cmdBytes.writeUnsignedByte(OpCodes.setTextureAt);
			this._cmdBytes.writeUnsignedByte(sampler);
			this._cmdBytes.writeUnsignedByte(texture.id);
		} else {
			//this.addStream(String.fromCharCode(OpCodes.clearTextureAt) + sampler + "#END");
			this._cmdBytes.ensureWriteableSpace(1);
			this._cmdBytes.writeUnsignedByte(OpCodes.clearTextureAt);
			this._cmdBytes.writeUnsignedByte(sampler);
		}
	}

	public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void
	{
		//this.addStream(String.fromCharCode(OpCodes.setSamplerStateAt) + sampler+","+this._wrapDictionary[wrap] + "," + this._filterDictionary[filter] + ","+ this._mipmapFilterDictionary[filter][mipfilter] + "#END");
		this._cmdBytes.ensureWriteableSpace(14);
		this._cmdBytes.writeUnsignedByte(OpCodes.setSamplerStateAt);

		this._cmdBytes.writeUnsignedByte(sampler);
		this._cmdBytes.writeUnsignedInt(this._wrapDictionary[wrap]);
		this._cmdBytes.writeUnsignedInt(this._filterDictionary[filter]);
		this._cmdBytes.writeUnsignedInt(this._mipmapFilterDictionary[filter][mipfilter]);
	}

	public setVertexBufferAt(index:number, buffer:VertexBufferGLES, bufferOffset:number = 0, format:number = 4):void
	{
		if (buffer) {
			//this.addStream(String.fromCharCode(OpCodes.setVertexBufferAt) +index+"," + buffer.id + ","
			//	+ bufferOffset + "," + format + "," + buffer.dataPerVertex + "," + "#END");
			this._cmdBytes.ensureWriteableSpace(9);
			this._cmdBytes.writeUnsignedByte(OpCodes.setVertexBufferAt);
			this._cmdBytes.writeUnsignedByte(index);
			this._cmdBytes.writeUnsignedByte(buffer.id);
			this._cmdBytes.writeUnsignedInt(bufferOffset);
			this._cmdBytes.writeUnsignedByte(format);
			this._cmdBytes.writeUnsignedByte(buffer.dataPerVertex);
		} else {
			//this.addStream(String.fromCharCode(OpCodes.clearVertexBufferAt)+""+ index + "#END");
			this._cmdBytes.ensureWriteableSpace(2);
			this._cmdBytes.writeUnsignedByte(OpCodes.clearVertexBufferAt);
			this._cmdBytes.writeUnsignedByte(index);
		}
	}

	public setRenderToTexture(target:TextureBaseGLES, enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0):void
	{
		if (target === null || target === undefined) {
			//this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture) + "#END");
			this._cmdBytes.ensureWriteableSpace(1);
			this._cmdBytes.writeUnsignedByte(OpCodes.clearRenderToTexture);
		} else {
			//this.addStream(String.fromCharCode(OpCodes.setRenderToTexture, enableDepthAndStencil? OpCodes.trueValue : OpCodes.falseValue) + target.id + "," + (antiAlias || 0)  + "#END");
			this._cmdBytes.ensureWriteableSpace(3);
			this._cmdBytes.writeUnsignedByte(OpCodes.setRenderToTexture);

			this._cmdBytes.writeByte(enableDepthAndStencil?1:0);
			this._cmdBytes.writeByte(target.id);
		}
		// var texture:TextureGLES = <TextureGLES> target;
		// var frameBuffer:WebGLFramebuffer = texture.frameBuffer;
		// this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);
		//
		// if (enableDepthAndStencil) {
		// 	this._gl.enable(this._gl.STENCIL_TEST);
		// 	this._gl.enable(this._gl.DEPTH_TEST);
		// }
		//
		// this._gl.viewport(0, 0, texture.width, texture.height );
	}

	public setRenderToBackBuffer():void
	{
		//this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture) + "#END");
		this._cmdBytes.ensureWriteableSpace(1);
		this._cmdBytes.writeUnsignedByte(OpCodes.clearRenderToTexture);
		//todo
		// this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
	}

	private updateBlendStatus():void
	{
		if (this._blendEnabled) {
			//this.addStream(String.fromCharCode(OpCodes.setBlendFactors) + this._blendSourceFactor + "," + this._blendDestinationFactor + "#END");
			this._cmdBytes.ensureWriteableSpace(5);
			this._cmdBytes.writeUnsignedByte(OpCodes.setBlendFactors);
			this._cmdBytes.writeUnsignedShort(this._blendSourceFactor);
			this._cmdBytes.writeUnsignedShort(this._blendDestinationFactor);
		} else {
			//this.addStream(String.fromCharCode(OpCodes.disableBlending) + "#END");
			this._cmdBytes.ensureWriteableSpace(1);
			this._cmdBytes.writeUnsignedByte(OpCodes.disableBlending);
		}
	}

	private translateTriangleFace(triangleFace:string, coordinateSystem:string)
	{
		switch (triangleFace) {
			case ContextGLTriangleFace.BACK:
				return (coordinateSystem == "leftHanded")? 0x0404 : 0x0405;
			case ContextGLTriangleFace.FRONT:
				return (coordinateSystem == "leftHanded")? 0x0405 : 0x0404;
			case ContextGLTriangleFace.FRONT_AND_BACK:
				return 0x0408;
			default:
				throw "Unknown ContextGLTriangleFace type."; // TODO error
		}
	}



	public execute():void
	{
		this.sendBytes.length=0;
		this.sendBytes.position=0;
		if(this._createBytes.length>0){
			this.sendBytes.writeUnsignedInt(this._createBytes.length);
			this.sendBytes.writeByteArray(this._createBytes);
			this._createBytes.length=0;
			this._createBytes.position=0;
		}
		else{
			this.sendBytes.writeUnsignedInt(0);
		}
		if(this._cmdBytes.length>0){
			this.sendBytes.writeUnsignedInt(this._cmdBytes.length);
			this.sendBytes.writeByteArray(this._cmdBytes);
			this._cmdBytes.length=0;
			this._cmdBytes.position=0;
		}
		else{
			this.sendBytes.writeUnsignedInt(0);
		}
		var inInt8AView = new Int8Array(this.sendBytes.arraybytes, 0, this.sendBytes.length);
		var localInt8View = new Int8Array(this.sendBytes.length);
		localInt8View.set(inInt8AView);
		GLESConnector.gles.sendGLESCommands(localInt8View.buffer);
	}
}


export class VertexBufferProperties
{
	public size:number;

	public type:number;

	public normalized:boolean;

	constructor(size:number, type:number, normalized:boolean)
	{
		this.size = size;
		this.type = type;
		this.normalized = normalized;
	}
}