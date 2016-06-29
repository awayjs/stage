"use strict";
var ProgramData_1 = require("../image/ProgramData");
/**
 * @class away.pool.ProgramDataPool
 */
var ProgramDataPool = (function () {
    /**
     * //TODO
     *
     * @param textureDataClass
     */
    function ProgramDataPool(stage) {
        this._pool = new Object();
        this._stage = stage;
    }
    /**
     * //TODO
     *
     * @param materialOwner
     * @returns ITexture
     */
    ProgramDataPool.prototype.getItem = function (vertexString, fragmentString) {
        var key = vertexString + fragmentString;
        return this._pool[key] || (this._pool[key] = new ProgramData_1.ProgramData(this, this._stage, vertexString, fragmentString));
    };
    /**
     * //TODO
     *
     * @param materialOwner
     */
    ProgramDataPool.prototype.disposeItem = function (key) {
        this._pool[key] = null;
    };
    return ProgramDataPool;
}());
exports.ProgramDataPool = ProgramDataPool;
