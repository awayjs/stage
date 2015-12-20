import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Matrix3DUtils				= require("awayjs-core/lib/geom/Matrix3DUtils");
import Rectangle					= require("awayjs-core/lib/geom/Rectangle");

//import swfobject					= require("awayjs-stagegl/lib/swfobject");
import Sampler						= require("awayjs-stagegl/lib/aglsl/Sampler");
import ContextGLClearMask			= require("awayjs-stagegl/lib/base/ContextGLClearMask");
import ContextGLProgramType			= require("awayjs-stagegl/lib/base/ContextGLProgramType");
import CubeTextureFlash				= require("awayjs-stagegl/lib/base/CubeTextureFlash");
import IContextGL					= require("awayjs-stagegl/lib/base/IContextGL");
import IndexBufferFlash				= require("awayjs-stagegl/lib/base/IndexBufferFlash");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ProgramFlash					= require("awayjs-stagegl/lib/base/ProgramFlash");
import TextureFlash					= require("awayjs-stagegl/lib/base/TextureFlash");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");
import VertexBufferFlash			= require("awayjs-stagegl/lib/base/VertexBufferFlash");

class ContextStage3D implements IContextGL
{
	public static contexts:Object = new Object();
	public static maxvertexconstants:number = 128;
	public static maxfragconstants:number = 28;
	public static maxtemp:number = 8;
	public static maxstreams:number = 8;
	public static maxtextures:number = 8;
	public static defaultsampler = new Sampler();

	public _iDriverInfo;

	private _container:HTMLElement;
	private _width:number;
	private _height:number;
	private _cmdStream:string = "";
	private _errorCheckingEnabled:boolean;
	private _resources:Array<ResourceBaseFlash>;
	private _oldCanvas:HTMLCanvasElement;
	private _oldParent:HTMLElement;


	public static debug:boolean = false;
	public static logStream:boolean = false;

	public _iCallback:(context:IContextGL) => void;

	public get container():HTMLElement
	{
		return this._container;
	}

	public get driverInfo()
	{
		return this._iDriverInfo;
	}

	public get errorCheckingEnabled():boolean
	{
		return this._errorCheckingEnabled;
	}

	public set errorCheckingEnabled(value:boolean)
	{
		if (this._errorCheckingEnabled == value)
			return;

		this._errorCheckingEnabled = value;

		this.addStream(String.fromCharCode(OpCodes.enableErrorChecking, value? OpCodes.trueValue : OpCodes.falseValue));
		this.execute();
	}

	//TODO: get rid of hack that fixes including definition file
	constructor(container:HTMLCanvasElement, callback:(context:IContextGL) => void, include?:Sampler)
	{
		this._resources = new Array<ResourceBaseFlash>();

		var swfVersionStr = "11.0.0";

		// To use express install, set to playerProductInstall.swf, otherwise the empty string.
		var flashvars = {
			id:container.id
		};

		var params = {
			quality:"high",
			bgcolor:"#ffffff",
			allowscriptaccess:"sameDomain",
			allowfullscreen:"true",
			wmode:"direct"
		};

		this._errorCheckingEnabled = false;
		this._iDriverInfo = "Unknown";

		var attributes = {
			salign:"tl",
			id:container.id,
			name:container["name"] //TODO: needed?
		};

		this._oldCanvas = <HTMLCanvasElement> container.cloneNode(); // keep the old one to restore on dispose
		this._oldParent = <HTMLElement> container.parentNode;

		var context3dObj = this;
		ContextStage3D.contexts[container.id] = this;

		function callbackSWFObject(callbackInfo)
		{
			if (!callbackInfo.success)
				return;

			context3dObj._container = callbackInfo.ref;
			context3dObj._iCallback = callback;
		}

		//swfobject.embedSWF("libs/molehill_js_flashbridge.swf", container.id, String(container.width), String(container.height), swfVersionStr, "", flashvars, params, attributes, callbackSWFObject);
	}

	public _iAddResource(resource:ResourceBaseFlash)
	{
		this._resources.push(resource);
	}

	public _iRemoveResource(resource:ResourceBaseFlash)
	{
		this._resources.splice(this._resources.indexOf(resource));
	}

	public createTexture(width:number, height:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):TextureFlash
	{
		//TODO:streaming
		return new TextureFlash(this, width, height, format, optimizeForRenderToTexture);
	}

	public createCubeTexture(size:number, format:string, optimizeForRenderToTexture:boolean, streamingLevels:number = 0):CubeTextureFlash
	{
		//TODO:streaming
		return new CubeTextureFlash(this, size, format, optimizeForRenderToTexture);
	}


	public setTextureAt(sampler:number, texture:ResourceBaseFlash)
	{
		if (texture) {
			this.addStream(String.fromCharCode(OpCodes.setTextureAt) + sampler + "," + texture.id + ",");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearTextureAt) + sampler.toString() + ",");
		}

		if (ContextStage3D.debug)
			this.execute();
	}

	public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void
	{
		//nothing to do here
	}

	public setStencilActions(triangleFace:string = "frontAndBack", compareMode:string = "always", actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep", coordinateSystem:string = "leftHanded")
	{
		this.addStream(String.fromCharCode(OpCodes.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");

		if (ContextStage3D.debug)
			this.execute();
	}

	public setStencilReferenceValue(referenceValue:number, readMask:number = 255, writeMask:number = 255)
	{
		this.addStream(String.fromCharCode(OpCodes.setStencilReferenceValue, referenceValue + OpCodes.intMask, readMask + OpCodes.intMask, writeMask + OpCodes.intMask));

		if (ContextStage3D.debug)
			this.execute();
	}

	public setCulling(triangleFaceToCull:string, coordinateSystem:string = "leftHanded")
	{
		//TODO implement coordinateSystem option
		this.addStream(String.fromCharCode(OpCodes.setCulling) + triangleFaceToCull + "$");

		if (ContextStage3D.debug)
			this.execute();
	}

	public drawIndices(mode:string, indexBuffer:IndexBufferFlash, firstIndex:number = 0, numIndices:number = -1)
	{
		firstIndex = firstIndex || 0;
		if (!numIndices || numIndices < 0)
			numIndices = indexBuffer.numIndices;

		//assume triangles
		this.addStream(String.fromCharCode(OpCodes.drawTriangles, indexBuffer.id + OpCodes.intMask) + firstIndex + "," + numIndices + ",");

		if (ContextStage3D.debug)
			this.execute();
	}

	public drawVertices(mode:string, firstVertex:number = 0, numVertices:number = -1)
	{
		//can't be done in Stage3D
	}


	public setProgramConstantsFromMatrix(programType:number, firstRegister:number, matrix:Matrix3D, transposedMatrix:boolean = false)
	{
		//this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));

		//TODO remove special case for WebGL matrix calls?
		var d:Float32Array = matrix.rawData;
		if (transposedMatrix) {
			var raw:Float32Array = Matrix3DUtils.RAW_DATA_CONTAINER;
			raw[0] = d[0];
			raw[1] = d[4];
			raw[2] = d[8];
			raw[3] = d[12];
			raw[4] = d[1];
			raw[5] = d[5];
			raw[6] = d[9];
			raw[7] = d[13];
			raw[8] = d[2];
			raw[9] = d[6];
			raw[10] = d[10];
			raw[11] = d[14];
			raw[12] = d[3];
			raw[13] = d[7];
			raw[14] = d[11];
			raw[15] = d[15];

			this.setProgramConstantsFromArray(programType, firstRegister, raw, 4);
		} else {
			this.setProgramConstantsFromArray(programType, firstRegister, d, 4);
		}
	}

	public setProgramConstantsFromArray(programType:number, firstRegister:number, data:Float32Array, numRegisters:number = -1)
	{
		var startIndex:number;
		var target:number = (programType == ContextGLProgramType.VERTEX)? OpCodes.trueValue : OpCodes.falseValue;
		for (var i:number = 0; i < numRegisters; i++) {
			startIndex = i*4;
			this.addStream(String.fromCharCode(OpCodes.setProgramConstant, target, (firstRegister + i) + OpCodes.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");

			if (ContextStage3D.debug)
				this.execute();
		}
	}

	public setProgram(program:ProgramFlash)
	{
		this.addStream(String.fromCharCode(OpCodes.setProgram, program.id + OpCodes.intMask));

		if (ContextStage3D.debug)
			this.execute();
	}

	public present()
	{
		this.addStream(String.fromCharCode(OpCodes.present));
		this.execute();
	}

	public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL)
	{
		this.addStream(String.fromCharCode(OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");

		if (ContextStage3D.debug)
			this.execute();
	}

	public createProgram():ProgramFlash
	{
		return new ProgramFlash(this);
	}

	public createVertexBuffer(numVertices:number, data32PerVertex:number):VertexBufferFlash
	{
		return new VertexBufferFlash(this, numVertices, data32PerVertex);
	}

	public createIndexBuffer(numIndices:number):IndexBufferFlash
	{
		return new IndexBufferFlash(this, numIndices);
	}

	public configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true)
	{
		this._width = width;
		this._height = height;

		//TODO: add Anitalias setting
		this.addStream(String.fromCharCode(OpCodes.configureBackBuffer) + width + "," + height + ",");
	}

	public drawToBitmapImage2D(destination:BitmapImage2D)
	{
		//TODO
	}

	public setVertexBufferAt(index:number, buffer:VertexBufferFlash, bufferOffset:number = 0, format:number = null)
	{
		if (buffer) {
			this.addStream(String.fromCharCode(OpCodes.setVertexBufferAt, index + OpCodes.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearVertexBufferAt, index + OpCodes.intMask));
		}

		if (ContextStage3D.debug)
			this.execute();
	}

	public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean)
	{
		this.addStream(String.fromCharCode(OpCodes.setColorMask, red? OpCodes.trueValue : OpCodes.falseValue, green? OpCodes.trueValue : OpCodes.falseValue, blue? OpCodes.trueValue : OpCodes.falseValue, alpha? OpCodes.trueValue : OpCodes.falseValue));

		if (ContextStage3D.debug)
			this.execute();
	}

	public setBlendFactors(sourceFactor:string, destinationFactor:string)
	{
		this.addStream(String.fromCharCode(OpCodes.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");

		if (ContextStage3D.debug)
			this.execute();
	}

	public setRenderToTexture(target:ResourceBaseFlash, enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0)
	{
		if (target === null || target === undefined) {
			this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture));
		} else {
			this.addStream(String.fromCharCode(OpCodes.setRenderToTexture, enableDepthAndStencil? OpCodes.trueValue : OpCodes.falseValue) + target.id + "," + (antiAlias || 0) + ",");
		}

		if (ContextStage3D.debug)
			this.execute();
	}


	public setRenderToBackBuffer()
	{
		this.addStream(String.fromCharCode(OpCodes.clearRenderToTexture));

		if (ContextStage3D.debug)
			this.execute();
	}

	public setScissorRectangle(rectangle:Rectangle)
	{
		if (rectangle) {
			this.addStream(String.fromCharCode(OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
		} else {
			this.addStream(String.fromCharCode(OpCodes.clearScissorRect));
		}

		if (ContextStage3D.debug)
			this.execute();
	}

	public setDepthTest(depthMask:boolean, passCompareMode:string)
	{
		this.addStream(String.fromCharCode(OpCodes.setDepthTest, depthMask? OpCodes.trueValue : OpCodes.falseValue) + passCompareMode + "$");

		if (ContextStage3D.debug)
			this.execute();
	}

	public dispose()
	{
		if (this._container == null)
			return;

		console.log("Context3D dispose, releasing " + this._resources.length + " resources.");

		while (this._resources.length)
			this._resources[0].dispose();

		if (this._container) {
			// encode command
			this.addStream(String.fromCharCode(OpCodes.disposeContext));
			this.execute();
			//swfobject.removeSWF(this._oldCanvas.id);
			if (this._oldCanvas && this._oldParent) {
				this._oldParent.appendChild(this._oldCanvas);
				this._oldParent = null;
			}
			this._container = null;
		}

		this._oldCanvas = null;
	}

	public addStream(stream:string)
	{
		this._cmdStream += stream;
	}

	public execute():number
	{
		if (ContextStage3D.logStream)
			console.log(this._cmdStream);

		var result:number = this._container["CallFunction"]("<invoke name=\"execStage3dOpStream\" returntype=\"javascript\"><arguments><string>" + this._cmdStream + "</string></arguments></invoke>");

		if (Number(result) <= -3)
			throw "Exec stream failed";

		this._cmdStream = "";

		return Number(result);
	}
}

export = ContextStage3D;

/**
* global function for flash callback
*/
function mountain_js_context_available(id, driverInfo)
{
	var ctx:ContextStage3D = ContextStage3D.contexts[id];
	if (ctx._iCallback) {
		ctx._iDriverInfo = driverInfo;
		// get out of the current JS stack frame and call back from flash player
		var timeOutId = window.setTimeout(function ()
		{
			window.clearTimeout(timeOutId);
			try {
				ctx._iCallback(ctx);
			} catch (e) {
				console.log("Callback failed during flash initialization with '" + e.toString() + "'");
			}
		}, 1);
	}
}
