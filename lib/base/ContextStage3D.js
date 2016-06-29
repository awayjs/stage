"use strict";
//import {swfobject}					from "../swfobject";
var ContextGLClearMask_1 = require("../base/ContextGLClearMask");
var ContextGLProgramType_1 = require("../base/ContextGLProgramType");
var CubeTextureFlash_1 = require("../base/CubeTextureFlash");
var IndexBufferFlash_1 = require("../base/IndexBufferFlash");
var OpCodes_1 = require("../base/OpCodes");
var ProgramFlash_1 = require("../base/ProgramFlash");
var TextureFlash_1 = require("../base/TextureFlash");
var VertexBufferFlash_1 = require("../base/VertexBufferFlash");
var ContextStage3D = (function () {
    //TODO: get rid of hack that fixes including definition file
    function ContextStage3D(container, callback) {
        this._cmdStream = "";
        this._resources = new Array();
        var swfVersionStr = "11.0.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var flashvars = {
            id: container.id
        };
        var params = {
            quality: "high",
            bgcolor: "#ffffff",
            allowscriptaccess: "sameDomain",
            allowfullscreen: "true",
            wmode: "direct"
        };
        this._errorCheckingEnabled = false;
        this._iDriverInfo = "Unknown";
        var attributes = {
            salign: "tl",
            id: container.id,
            name: container["name"] //TODO: needed?
        };
        this._oldCanvas = container.cloneNode(); // keep the old one to restore on dispose
        this._oldParent = container.parentNode;
        var context3dObj = this;
        ContextStage3D.contexts[container.id] = this;
        function callbackSWFObject(callbackInfo) {
            if (!callbackInfo.success)
                return;
            context3dObj._container = callbackInfo.ref;
            context3dObj._iCallback = callback;
        }
        //swfobject.embedSWF("libs/molehill_js_flashbridge.swf", container.id, String(container.width), String(container.height), swfVersionStr, "", flashvars, params, attributes, callbackSWFObject);
    }
    Object.defineProperty(ContextStage3D.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextStage3D.prototype, "driverInfo", {
        get: function () {
            return this._iDriverInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContextStage3D.prototype, "errorCheckingEnabled", {
        get: function () {
            return this._errorCheckingEnabled;
        },
        set: function (value) {
            if (this._errorCheckingEnabled == value)
                return;
            this._errorCheckingEnabled = value;
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.enableErrorChecking, value ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue));
            this.execute();
        },
        enumerable: true,
        configurable: true
    });
    ContextStage3D.prototype._iAddResource = function (resource) {
        this._resources.push(resource);
    };
    ContextStage3D.prototype._iRemoveResource = function (resource) {
        this._resources.splice(this._resources.indexOf(resource));
    };
    ContextStage3D.prototype.createTexture = function (width, height, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO:streaming
        return new TextureFlash_1.TextureFlash(this, width, height, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.createCubeTexture = function (size, format, optimizeForRenderToTexture, streamingLevels) {
        if (streamingLevels === void 0) { streamingLevels = 0; }
        //TODO:streaming
        return new CubeTextureFlash_1.CubeTextureFlash(this, size, format, optimizeForRenderToTexture);
    };
    ContextStage3D.prototype.setTextureAt = function (sampler, texture) {
        if (texture) {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setTextureAt) + sampler + "," + texture.id + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clearTextureAt) + sampler.toString() + ",");
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setSamplerStateAt = function (sampler, wrap, filter, mipfilter) {
        //nothing to do here
    };
    ContextStage3D.prototype.setStencilActions = function (triangleFace, compareMode, actionOnBothPass, actionOnDepthFail, actionOnDepthPassStencilFail, coordinateSystem) {
        if (triangleFace === void 0) { triangleFace = "frontAndBack"; }
        if (compareMode === void 0) { compareMode = "always"; }
        if (actionOnBothPass === void 0) { actionOnBothPass = "keep"; }
        if (actionOnDepthFail === void 0) { actionOnDepthFail = "keep"; }
        if (actionOnDepthPassStencilFail === void 0) { actionOnDepthPassStencilFail = "keep"; }
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setStencilActions) + triangleFace + "$" + compareMode + "$" + actionOnBothPass + "$" + actionOnDepthFail + "$" + actionOnDepthPassStencilFail + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setStencilReferenceValue = function (referenceValue, readMask, writeMask) {
        if (readMask === void 0) { readMask = 255; }
        if (writeMask === void 0) { writeMask = 255; }
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setStencilReferenceValue, referenceValue + OpCodes_1.OpCodes.intMask, readMask + OpCodes_1.OpCodes.intMask, writeMask + OpCodes_1.OpCodes.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setCulling = function (triangleFaceToCull, coordinateSystem) {
        if (coordinateSystem === void 0) { coordinateSystem = "leftHanded"; }
        //TODO implement coordinateSystem option
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setCulling) + triangleFaceToCull + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.drawIndices = function (mode, indexBuffer, firstIndex, numIndices) {
        if (firstIndex === void 0) { firstIndex = 0; }
        if (numIndices === void 0) { numIndices = -1; }
        firstIndex = firstIndex || 0;
        if (!numIndices || numIndices < 0)
            numIndices = indexBuffer.numIndices;
        //assume triangles
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.drawTriangles, indexBuffer.id + OpCodes_1.OpCodes.intMask) + firstIndex + "," + numIndices + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.drawVertices = function (mode, firstVertex, numVertices) {
        if (firstVertex === void 0) { firstVertex = 0; }
        if (numVertices === void 0) { numVertices = -1; }
        //can't be done in Stage3D
    };
    ContextStage3D.prototype.setProgramConstantsFromArray = function (programType, data) {
        var startIndex;
        var numRegisters = data.length / 4;
        var target = (programType == ContextGLProgramType_1.ContextGLProgramType.VERTEX) ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue;
        for (var i = 0; i < numRegisters; i++) {
            startIndex = i * 4;
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setProgramConstant, target, i + OpCodes_1.OpCodes.intMask) + data[startIndex] + "," + data[startIndex + 1] + "," + data[startIndex + 2] + "," + data[startIndex + 3] + ",");
            if (ContextStage3D.debug)
                this.execute();
        }
    };
    ContextStage3D.prototype.setProgram = function (program) {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setProgram, program.id + OpCodes_1.OpCodes.intMask));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.present = function () {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.present));
        this.execute();
    };
    ContextStage3D.prototype.clear = function (red, green, blue, alpha, depth, stencil, mask) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (depth === void 0) { depth = 1; }
        if (stencil === void 0) { stencil = 0; }
        if (mask === void 0) { mask = ContextGLClearMask_1.ContextGLClearMask.ALL; }
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clear) + red + "," + green + "," + blue + "," + alpha + "," + depth + "," + stencil + "," + mask + ",");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.createProgram = function () {
        return new ProgramFlash_1.ProgramFlash(this);
    };
    ContextStage3D.prototype.createVertexBuffer = function (numVertices, data32PerVertex) {
        return new VertexBufferFlash_1.VertexBufferFlash(this, numVertices, data32PerVertex);
    };
    ContextStage3D.prototype.createIndexBuffer = function (numIndices) {
        return new IndexBufferFlash_1.IndexBufferFlash(this, numIndices);
    };
    ContextStage3D.prototype.configureBackBuffer = function (width, height, antiAlias, enableDepthAndStencil) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = true; }
        this._width = width;
        this._height = height;
        //TODO: add Anitalias setting
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.configureBackBuffer) + width + "," + height + ",");
    };
    ContextStage3D.prototype.drawToBitmapImage2D = function (destination) {
        //TODO
    };
    ContextStage3D.prototype.setVertexBufferAt = function (index, buffer, bufferOffset, format) {
        if (bufferOffset === void 0) { bufferOffset = 0; }
        if (format === void 0) { format = null; }
        if (buffer) {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setVertexBufferAt, index + OpCodes_1.OpCodes.intMask) + buffer.id + "," + bufferOffset + "," + format + "$");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clearVertexBufferAt, index + OpCodes_1.OpCodes.intMask));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setColorMask = function (red, green, blue, alpha) {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setColorMask, red ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue, green ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue, blue ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue, alpha ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setBlendFactors = function (sourceFactor, destinationFactor) {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setBlendFactors) + sourceFactor + "$" + destinationFactor + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToTexture = function (target, enableDepthAndStencil, antiAlias, surfaceSelector) {
        if (enableDepthAndStencil === void 0) { enableDepthAndStencil = false; }
        if (antiAlias === void 0) { antiAlias = 0; }
        if (surfaceSelector === void 0) { surfaceSelector = 0; }
        if (target === null || target === undefined) {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clearRenderToTexture));
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setRenderToTexture, enableDepthAndStencil ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue) + target.id + "," + (antiAlias || 0) + ",");
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setRenderToBackBuffer = function () {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clearRenderToTexture));
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setScissorRectangle = function (rectangle) {
        if (rectangle) {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setScissorRect) + rectangle.x + "," + rectangle.y + "," + rectangle.width + "," + rectangle.height + ",");
        }
        else {
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.clearScissorRect));
        }
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.setDepthTest = function (depthMask, passCompareMode) {
        this.addStream(String.fromCharCode(OpCodes_1.OpCodes.setDepthTest, depthMask ? OpCodes_1.OpCodes.trueValue : OpCodes_1.OpCodes.falseValue) + passCompareMode + "$");
        if (ContextStage3D.debug)
            this.execute();
    };
    ContextStage3D.prototype.dispose = function () {
        if (this._container == null)
            return;
        console.log("Context3D dispose, releasing " + this._resources.length + " resources.");
        while (this._resources.length)
            this._resources[0].dispose();
        if (this._container) {
            // encode command
            this.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeContext));
            this.execute();
            //swfobject.removeSWF(this._oldCanvas.id);
            if (this._oldCanvas && this._oldParent) {
                this._oldParent.appendChild(this._oldCanvas);
                this._oldParent = null;
            }
            this._container = null;
        }
        this._oldCanvas = null;
    };
    ContextStage3D.prototype.addStream = function (stream) {
        this._cmdStream += stream;
    };
    ContextStage3D.prototype.execute = function () {
        if (ContextStage3D.logStream)
            console.log(this._cmdStream);
        var result = this._container["CallFunction"]("<invoke name=\"execStage3dOpStream\" returntype=\"javascript\"><arguments><string>" + this._cmdStream + "</string></arguments></invoke>");
        if (Number(result) <= -3)
            throw "Exec stream failed";
        this._cmdStream = "";
        return Number(result);
    };
    ContextStage3D.contexts = new Object();
    ContextStage3D.debug = false;
    ContextStage3D.logStream = false;
    return ContextStage3D;
}());
exports.ContextStage3D = ContextStage3D;
/**
* global function for flash callback
*/
function mountain_js_context_available(id, driverInfo) {
    var ctx = ContextStage3D.contexts[id];
    if (ctx._iCallback) {
        ctx._iDriverInfo = driverInfo;
        // get out of the current JS stack frame and call back from flash player
        var timeOutId = window.setTimeout(function () {
            window.clearTimeout(timeOutId);
            try {
                ctx._iCallback(ctx);
            }
            catch (e) {
                console.log("Callback failed during flash initialization with '" + e.toString() + "'");
            }
        }, 1);
    }
}
