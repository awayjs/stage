import {BitmapImage2D}				from "@awayjs/core/lib/image/BitmapImage2D";
import {Rectangle}					from "@awayjs/core/lib/geom/Rectangle";
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
	private _stencilActionDictionary:Object = new Object();
	private _textureIndexDictionary:Array<number> = new Array<number>(8);
	private _textureTypeDictionary:Object = new Object();
	private _wrapDictionary:Object = new Object();
	private _filterDictionary:Object = new Object();
	private _mipmapFilterDictionary:Object = new Object();
	private _vertexBufferPropertiesDictionary:Array<VertexBufferProperties> = [];

	private _cmdStream:string = "";
	private _createStream:string = "";
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
		//
         //    this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_SATURATE] = this._gl.DECR;
         //    this._stencilActionDictionary[ContextGLStencilAction.DECREMENT_WRAP] = this._gl.DECR_WRAP;
         //    this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_SATURATE] = this._gl.INCR;
         //    this._stencilActionDictionary[ContextGLStencilAction.INCREMENT_WRAP] = this._gl.INCR_WRAP;
         //    this._stencilActionDictionary[ContextGLStencilAction.INVERT] = this._gl.INVERT;
         //    this._stencilActionDictionary[ContextGLStencilAction.KEEP] = this._gl.KEEP;
         //    this._stencilActionDictionary[ContextGLStencilAction.SET] = this._gl.REPLACE;
         //    this._stencilActionDictionary[ContextGLStencilAction.ZERO] = this._gl.ZERO;
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
		//
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_1] = new VertexBufferProperties(1, this._gl.FLOAT, false);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_2] = new VertexBufferProperties(2, this._gl.FLOAT, false);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_3] = new VertexBufferProperties(3, this._gl.FLOAT, false);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.FLOAT_4] = new VertexBufferProperties(4, this._gl.FLOAT, false);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.BYTE_1] = new VertexBufferProperties(1, this._gl.BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.BYTE_2] = new VertexBufferProperties(2, this._gl.BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.BYTE_3] = new VertexBufferProperties(3, this._gl.BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.BYTE_4] = new VertexBufferProperties(4, this._gl.BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_BYTE_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_BYTE_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_BYTE_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_BYTE_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_BYTE, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.SHORT_1] = new VertexBufferProperties(1, this._gl.SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.SHORT_2] = new VertexBufferProperties(2, this._gl.SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.SHORT_3] = new VertexBufferProperties(3, this._gl.SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.SHORT_4] = new VertexBufferProperties(4, this._gl.SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_SHORT_1] = new VertexBufferProperties(1, this._gl.UNSIGNED_SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_SHORT_2] = new VertexBufferProperties(2, this._gl.UNSIGNED_SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_SHORT_3] = new VertexBufferProperties(3, this._gl.UNSIGNED_SHORT, true);
		// 	this._vertexBufferPropertiesDictionary[ContextGLVertexBufferFormat.UNSIGNED_SHORT_4] = new VertexBufferProperties(4, this._gl.UNSIGNED_SHORT, true);
		//
         //    this._stencilCompareMode = this._gl.ALWAYS;
         //    this._stencilCompareModeBack = this._gl.ALWAYS;
         //    this._stencilCompareModeFront = this._gl.ALWAYS;
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

	public gl():WebGLRenderingContext
	{
		return this._gl;
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL):void
	{
		this.addStream(String.fromCharCode(OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + "#END");
	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true):void
	{
		this._width = width;
		this._height = height;
		this.addStream(String.fromCharCode(OpCodes.configureBackBuffer) + width + "," + height + ","+ antiAlias+","+enableDepthAndStencil + "#END");
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
		this.addStream(String.fromCharCode(OpCodes.disposeContext) + "#END");
		this.execute();
		//GLESConnector.gles.glesDispose();
		// for (var i:number = 0; i < this._samplerStates.length; ++i)
		// 	this._samplerStates[i] = null;
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
		this.addStream(String.fromCharCode(OpCodes.drawVertices) + this._drawModeDictionary[mode] + "," + firstVertex + ","+ numVertices  + "#END");

	}

	public present():void
	{
		// no need to send the present command (?)
		//this.addStream(String.fromCharCode(OpCodes.present) + "#END");
		this.execute();
		// this._drawing = false;
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
		this.addStream(String.fromCharCode(OpCodes.setColorMask, red? OpCodes.trueValue : OpCodes.falseValue, green? OpCodes.trueValue : OpCodes.falseValue, blue? OpCodes.trueValue : OpCodes.falseValue, alpha? OpCodes.trueValue : OpCodes.falseValue) + "#END");
		//GLESConnector.gles.setColorMask(red, green, blue, alpha);
		// this._gl.colorMask(red, green, blue, alpha);
	}

	public setCulling(triangleFaceToCull:string, coordinateSystem:string = "leftHanded"):void
	{
		if (triangleFaceToCull == ContextGLTriangleFace.NONE) {
			this.addStream(String.fromCharCode(OpCodes.disableCulling) + "#END");
			return;
		}
		var faceCulling:number  = this.translateTriangleFace(triangleFaceToCull, coordinateSystem);
		this.addStream(String.fromCharCode(OpCodes.setCulling)+ faceCulling + "#END");

	}

	// TODO ContextGLCompareMode
	public setDepthTest(depthMask:boolean, passCompareMode:string):void
	{
		this.addStream(String.fromCharCode(OpCodes.setDepthTest, depthMask? OpCodes.trueValue : OpCodes.falseValue)+","+ this._compareModeDictionary[passCompareMode]+ "#END");

		//GLESConnector.gles.setDepthTest(depthMask, passCompareMode);
		// this._gl.depthFunc(this._compareModeDictionary[passCompareMode]);
		//
		// this._gl.depthMask(depthMask);
	}

    public setStencilActions(triangleFace:string = "frontAndBack", compareMode:string = "always", actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded")
    {
		this.addStream(String.fromCharCode(OpCodes.setStencilActions) + triangleFace + "," + compareMode + "," + actionOnBothPass + "," + actionOnDepthFail + "," + actionOnDepthPassStencilFail + "," + "#END");

		// this._separateStencil = triangleFace != "frontAndBack";
		//
        // var compareModeGL = this._compareModeDictionary[compareMode];
		//
        // var fail = this._stencilActionDictionary[actionOnDepthPassStencilFail];
        // var zFail = this._stencilActionDictionary[actionOnDepthFail];
        // var pass = this._stencilActionDictionary[actionOnBothPass];
		//
        // if (!this._separateStencil) {
        //     this._stencilCompareMode = compareModeGL;
        //     this._gl.stencilFunc(compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
        //     this._gl.stencilOp(fail, zFail, pass);
        // }
        // else if (triangleFace == "back") {
        //     this._stencilCompareModeBack = compareModeGL;
        //     this._gl.stencilFuncSeparate(this._gl.BACK, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
        //     this._gl.stencilOpSeparate(this._gl.BACK, fail, zFail, pass);
        // }
        // else if (triangleFace == "front") {
        //     this._stencilCompareModeFront = compareModeGL;
        //     this._gl.stencilFuncSeparate(this._gl.FRONT, compareModeGL, this._stencilReferenceValue, this._stencilReadMask);
        //     this._gl.stencilOpSeparate(this._gl.FRONT, fail, zFail, pass);
        // }
    }

    public setStencilReferenceValue(referenceValue:number, readMask:number, writeMask:number)
    {
		this.addStream(String.fromCharCode(OpCodes.setStencilReferenceValue, referenceValue + OpCodes.intMask, readMask + OpCodes.intMask, writeMask + OpCodes.intMask) + "#END");

		//GLESConnector.gles.setStencilReferenceValue(referenceValue, readMask, writeMask);
        // this._stencilReferenceValue = referenceValue;
        // this._stencilReadMask = readMask;
		//
        // if (this._separateStencil) {
        //     this._gl.stencilFuncSeparate(this._gl.FRONT, this._stencilCompareModeFront, referenceValue, readMask);
        //     this._gl.stencilFuncSeparate(this._gl.BACK, this._stencilCompareModeBack, referenceValue, readMask);
        // }
        // else {
        //     this._gl.stencilFunc(this._stencilCompareMode, referenceValue, readMask);
        // }
		//
        // this._gl.stencilMask(writeMask);
    }

	public setProgram(program:ProgramGLES):void
	{
		this.addStream(String.fromCharCode(OpCodes.setProgram, program.id + OpCodes.intMask) + "#END");
	}

	public static modulo:number = 0;

	public setProgramConstantsFromArray(programType:number, data:Float32Array):void
	{
		// this seem to only be used to set vertex and frac attributs, not texture
		// we only ever use one attribute per type (vc / fc) without adding any numbers.
		var target_name:string = ContextGLES._uniformLocationNameDictionary[programType];
		var data_str="";
		for (var i:number = 0; i < data.length; i++) {
			data_str+=data[i]+",";}
		this.addStream(String.fromCharCode(OpCodes.setProgramConstant)+target_name+"," + data.length + "," + data_str  + "#END");

	}

	public setScissorRectangle(rectangle:Rectangle):void
	{
		if (rectangle) {
			this.addStream(String.fromCharCode(OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height  + "#END");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearScissorRect) + "#END");
		}
	}

	public setTextureAt(sampler:number, texture:TextureBaseGLES):void
	{
		if (texture) {
			this.addStream(String.fromCharCode(OpCodes.setTextureAt) + sampler + "," + texture.id  + "#END");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearTextureAt) + sampler + "#END");
		}
	}

	public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void
	{
		this.addStream(String.fromCharCode(OpCodes.setSamplerStateAt) + sampler+","+this._wrapDictionary[wrap] + "," + this._filterDictionary[filter] + ","+ this._mipmapFilterDictionary[filter][mipfilter] + "#END");
	}

	public setVertexBufferAt(index:number, buffer:VertexBufferGLES, bufferOffset:number = 0, format:number = 4):void
	{
		if (buffer) {
			this.addStream(String.fromCharCode(OpCodes.setVertexBufferAt) +index+"," + buffer.id + ","
				+ bufferOffset + "," + format + "," + buffer.dataPerVertex + "," + "#END");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearVertexBufferAt, index + OpCodes.intMask) + "#END");
		}

	}

	public setRenderToTexture(target:TextureBaseGLES, enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0):void
	{
		if (target === null || target === undefined) {
			this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture) + "#END");
		} else {
			this.addStream(String.fromCharCode(OpCodes.setRenderToTexture, enableDepthAndStencil? OpCodes.trueValue : OpCodes.falseValue) + target.id + "," + (antiAlias || 0)  + "#END");
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
		this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture) + "#END");
		//todo
		// this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
	}

	private updateBlendStatus():void
	{
		if (this._blendEnabled) {
			this.addStream(String.fromCharCode(OpCodes.setBlendFactors) + this._blendSourceFactor + "," + this._blendDestinationFactor + "#END");
		} else {
			this.addStream(String.fromCharCode(OpCodes.disableBlending) + "#END");
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

	public addStream(stream:string):void
	{
		this._cmdStream += stream;
	}

	public addCreateStream(stream:string):void
	{
		this._createStream += stream;
	}
	public execute():void
	{
		if(this._createStream.length>0){
			GLESConnector.gles.sendGLESCreateCommands(this._createStream);
			this._createStream="";
		}
		GLESConnector.gles.sendGLESCommands(this._cmdStream);
		this._cmdStream = "";
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