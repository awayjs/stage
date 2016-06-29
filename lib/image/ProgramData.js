"use strict";
/**
 *
 * @class away.pool.ProgramDataBase
 */
var ProgramData = (function () {
    function ProgramData(pool, context, vertexString, fragmentString) {
        this.usages = 0;
        this._pool = pool;
        this.stage = context;
        this.vertexString = vertexString;
        this.fragmentString = fragmentString;
        this.stage.registerProgram(this);
    }
    /**
     *
     */
    ProgramData.prototype.dispose = function () {
        this.usages--;
        if (!this.usages) {
            this._pool.disposeItem(this.vertexString + this.fragmentString);
            this.stage.unRegisterProgram(this);
            if (this.program) {
                this.program.dispose();
                this.program = null;
            }
        }
    };
    ProgramData.PROGRAMDATA_ID_COUNT = 0;
    return ProgramData;
}());
exports.ProgramData = ProgramData;
