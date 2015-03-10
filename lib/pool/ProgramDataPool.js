var ProgramData = require("awayjs-stagegl/lib/pool/ProgramData");
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
        return this._pool[key] || (this._pool[key] = new ProgramData(this, this._stage, vertexString, fragmentString));
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
})();
module.exports = ProgramDataPool;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhUG9vbC50cyJdLCJuYW1lcyI6WyJQcm9ncmFtRGF0YVBvb2wiLCJQcm9ncmFtRGF0YVBvb2wuY29uc3RydWN0b3IiLCJQcm9ncmFtRGF0YVBvb2wuZ2V0SXRlbSIsIlByb2dyYW1EYXRhUG9vbC5kaXNwb3NlSXRlbSJdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBTyxXQUFXLFdBQWUscUNBQXFDLENBQUMsQ0FBQztBQUV4RSxBQUdBOztHQURHO0lBQ0csZUFBZTtJQUtwQkE7Ozs7T0FJR0E7SUFDSEEsU0FWS0EsZUFBZUEsQ0FVUkEsS0FBV0E7UUFSZkMsVUFBS0EsR0FBVUEsSUFBSUEsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFVbkNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVERDs7Ozs7T0FLR0E7SUFDSUEsaUNBQU9BLEdBQWRBLFVBQWVBLFlBQW1CQSxFQUFFQSxjQUFxQkE7UUFFeERFLElBQUlBLEdBQUdBLEdBQVVBLFlBQVlBLEdBQUdBLGNBQWNBLENBQUNBO1FBQy9DQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxZQUFZQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoSEEsQ0FBQ0E7SUFFREY7Ozs7T0FJR0E7SUFDSUEscUNBQVdBLEdBQWxCQSxVQUFtQkEsR0FBVUE7UUFFNUJHLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUNGSCxzQkFBQ0E7QUFBREEsQ0FwQ0EsQUFvQ0NBLElBQUE7QUFFRCxBQUF5QixpQkFBaEIsZUFBZSxDQUFDIiwiZmlsZSI6InBvb2wvUHJvZ3JhbURhdGFQb29sLmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9iYXNlL1N0YWdlXCIpO1xuaW1wb3J0IFByb2dyYW1EYXRhXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9wb29sL1Byb2dyYW1EYXRhXCIpO1xuXG4vKipcbiAqIEBjbGFzcyBhd2F5LnBvb2wuUHJvZ3JhbURhdGFQb29sXG4gKi9cbmNsYXNzIFByb2dyYW1EYXRhUG9vbFxue1xuXHRwcml2YXRlIF9wb29sOk9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfc3RhZ2U6U3RhZ2U7XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gdGV4dHVyZURhdGFDbGFzc1xuXHQgKi9cblx0Y29uc3RydWN0b3Ioc3RhZ2U6U3RhZ2UpXG5cdHtcblx0XHR0aGlzLl9zdGFnZSA9IHN0YWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gbWF0ZXJpYWxPd25lclxuXHQgKiBAcmV0dXJucyBJVGV4dHVyZVxuXHQgKi9cblx0cHVibGljIGdldEl0ZW0odmVydGV4U3RyaW5nOnN0cmluZywgZnJhZ21lbnRTdHJpbmc6c3RyaW5nKTpQcm9ncmFtRGF0YVxuXHR7XG5cdFx0dmFyIGtleTpzdHJpbmcgPSB2ZXJ0ZXhTdHJpbmcgKyBmcmFnbWVudFN0cmluZztcblx0XHRyZXR1cm4gdGhpcy5fcG9vbFtrZXldIHx8ICh0aGlzLl9wb29sW2tleV0gPSBuZXcgUHJvZ3JhbURhdGEodGhpcywgdGhpcy5fc3RhZ2UsIHZlcnRleFN0cmluZywgZnJhZ21lbnRTdHJpbmcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIG1hdGVyaWFsT3duZXJcblx0ICovXG5cdHB1YmxpYyBkaXNwb3NlSXRlbShrZXk6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fcG9vbFtrZXldID0gbnVsbDtcblx0fVxufVxuXG5leHBvcnQgPSBQcm9ncmFtRGF0YVBvb2w7Il19