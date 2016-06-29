"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ContextStage3D_1 = require("../base/ContextStage3D");
var OpCodes_1 = require("../base/OpCodes");
var ResourceBaseFlash_1 = require("../base/ResourceBaseFlash");
var ProgramFlash = (function (_super) {
    __extends(ProgramFlash, _super);
    function ProgramFlash(context) {
        _super.call(this);
        this._context = context;
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.initProgram));
        this._pId = this._context.execute();
        this._context._iAddResource(this);
    }
    ProgramFlash.prototype.upload = function (vertexProgram, fragmentProgram) {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.uploadAGALBytesProgram, this._pId + OpCodes_1.OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");
        if (ContextStage3D_1.ContextStage3D.debug)
            this._context.execute();
    };
    ProgramFlash.prototype.dispose = function () {
        this._context.addStream(String.fromCharCode(OpCodes_1.OpCodes.disposeProgram, this._pId + OpCodes_1.OpCodes.intMask));
        this._context.execute();
        this._context._iRemoveResource(this);
        this._context = null;
    };
    return ProgramFlash;
}(ResourceBaseFlash_1.ResourceBaseFlash));
exports.ProgramFlash = ProgramFlash;
