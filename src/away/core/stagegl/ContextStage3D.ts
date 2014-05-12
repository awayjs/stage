///<reference path="../../_definitions.ts"/>

module away.stagegl
{

	export class ContextStage3D implements IContext
	{
		private _container:HTMLElement;

		public static contexts:Object = new Object();
		public static maxvertexconstants:number = 128;
		public static maxfragconstants:number = 28;
		public static maxtemp:number = 8;
		public static maxstreams:number = 8;
		public static maxtextures:number = 8;
		public static defaultsampler = new aglsl.Sampler();

		public _iDriverInfo;

		private _cmdStream:string = "";
		private _errorCheckingEnabled:boolean;
		private _resources:Array<ResourceBaseFlash>;
		private _oldCanvas:HTMLCanvasElement;
		private _oldParent:HTMLElement;
		

		public static debug:boolean = false;
		public static logStream:boolean = false;

		public _iCallback:(context:away.stagegl.IContext) => void;

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

			this.addStream(String.fromCharCode(away.stagegl.OpCodes.enableErrorChecking, value? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue));
			this.execute();
		}

		constructor(container:HTMLCanvasElement, callback:(context:away.stagegl.IContext) => void)
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

			swfobject.embedSWF("../libs/molehill_js_flashbridge.swf", container.id, String(container.width), String(container.height), swfVersionStr, "", flashvars, params, attributes, callbackSWFObject);
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
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.setTextureAt) + sampler + "," + texture.id + ",");
			} else {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearTextureAt) + sampler.toString() + ",");
			}

			if (ContextStage3D.debug)
				this.execute();
		}

		public setSamplerStateAt(sampler:number, wrap:string, filter:string, mipfilter:string):void
		{
			//nothing to do here
		}

		public setStencilActions(triangleFace:string = "frontAndBack", compareMode:string = "always", actionOnBothPass:string = "keep", actionOnDepthFail:string = "keep", actionOnDepthPassStencilFail:string = "keep")
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");

			if (ContextStage3D.debug)
				this.execute();
		}

		public setStencilReferenceValue(referenceValue:number, readMask:number = 255, writeMask:number = 255)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setStencilReferenceValue, referenceValue + away.stagegl.OpCodes.intMask, readMask + away.stagegl.OpCodes.intMask, writeMask + away.stagegl.OpCodes.intMask));

			if (ContextStage3D.debug)
				this.execute();
		}

		public setCulling(triangleFaceToCull:string, coordinateSystem:string = "leftHanded")
		{
			//TODO implement coordinateSystem option
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setCulling) + triangleFaceToCull + "$");

			if (ContextStage3D.debug)
				this.execute();
		}

		public drawTriangles(indexBuffer:IndexBufferFlash, firstIndex:number = 0, numTriangles:number = -1)
		{
			firstIndex = firstIndex || 0;
			if (!numTriangles || numTriangles < 0)
				numTriangles = indexBuffer.numIndices/3;

			this.addStream(String.fromCharCode(away.stagegl.OpCodes.drawTriangles, indexBuffer.id + away.stagegl.OpCodes.intMask) + firstIndex + "," + numTriangles + ",");

			if (ContextStage3D.debug)
				this.execute();
		}

		public setProgramConstantsFromMatrix(programType:string, firstRegister:number, matrix:away.geom.Matrix3D, transposedMatrix:boolean = false)
		{
			//this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._currentProgram.glProgram, this._uniformLocationNameDictionary[programType]), !transposedMatrix, new Float32Array(matrix.rawData));

			//TODO remove special case for WebGL matrix calls?
			var d:number[] = matrix.rawData;
			if (transposedMatrix) {
				this.setProgramConstantsFromArray(programType, firstRegister, [ d[0], d[4], d[8], d[12] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 1, [ d[1], d[5], d[9], d[13] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 2, [ d[2], d[6], d[10], d[14] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 3, [ d[3], d[7], d[11], d[15] ], 1);
			} else {
				this.setProgramConstantsFromArray(programType, firstRegister, [ d[0], d[1], d[2], d[3] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 1, [ d[4], d[5], d[6], d[7] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 2, [ d[8], d[9], d[10], d[11] ], 1);
				this.setProgramConstantsFromArray(programType, firstRegister + 3, [ d[12], d[13], d[14], d[15] ], 1);
			}
		}

		public setProgramConstantsFromArray(programType:string, firstRegister:number, data:number[], numRegisters:number = -1)
		{
			var startIndex:number;
			var target:number = (programType == ContextGLProgramType.VERTEX)? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue;
			for (var i:number = 0; i < numRegisters; i++) {
				startIndex = i*4;
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.setProgramConstant, target, (firstRegister + i) + away.stagegl.OpCodes.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");

				if (ContextStage3D.debug)
					this.execute();
			}
		}

		public setProgram(program:ProgramFlash)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setProgram, program.id + away.stagegl.OpCodes.intMask));

			if (ContextStage3D.debug)
				this.execute();
		}

		public present()
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.present));
			this.execute();
		}

		public clear(red:number = 0, green:number = 0, blue:number = 0, alpha:number = 1, depth:number = 1, stencil:number = 0, mask:number = ContextGLClearMask.ALL)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");

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
			//TODO: add Anitalias setting
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.configureBackBuffer) + width + "," + height + ",");
		}

		public drawToBitmapData(destination:away.base.BitmapData)
		{
			//TODO
		}

		public setVertexBufferAt(index:number, buffer:VertexBufferFlash, bufferOffset:number = 0, format:string = null)
		{
			if (buffer) {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.setVertexBufferAt, index + away.stagegl.OpCodes.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
			} else {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearVertexBufferAt, index + away.stagegl.OpCodes.intMask));
			}

			if (ContextStage3D.debug)
				this.execute();
		}

		public setColorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setColorMask, red? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, green? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, blue? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue, alpha? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue));

			if (ContextStage3D.debug)
				this.execute();
		}

		public setBlendFactors(sourceFactor:string, destinationFactor:string)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");

			if (ContextStage3D.debug)
				this.execute();
		}

		public setRenderToTexture(target:ResourceBaseFlash, enableDepthAndStencil:boolean = false, antiAlias:number = 0, surfaceSelector:number = 0)
		{
			if (target === null || target === undefined) {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearRenderToTexture));
			} else {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.setRenderToTexture, enableDepthAndStencil? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue) + target.id + "," + (antiAlias || 0) + ",");
			}

			if (ContextStage3D.debug)
				this.execute();
		}


		public setRenderToBackBuffer()
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearRenderToTexture));

			if (ContextStage3D.debug)
				this.execute();
		}

		public setScissorRectangle(rectangle:away.geom.Rectangle)
		{
			if (rectangle) {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
			} else {
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.clearScissorRect));
			}

			if (ContextStage3D.debug)
				this.execute();
		}

		public setDepthTest(depthMask:boolean, passCompareMode:string)
		{
			this.addStream(String.fromCharCode(away.stagegl.OpCodes.setDepthTest, depthMask? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue) + passCompareMode + "$");

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
				this.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeContext));
				this.execute();
				swfobject.removeSWF(this._oldCanvas.id);
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
}

/**
 * global function for flash callback
 */
function mountain_js_context_available(id, driverInfo)
{
	var ctx:away.stagegl.ContextStage3D = away.stagegl.ContextStage3D.contexts[id];
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
