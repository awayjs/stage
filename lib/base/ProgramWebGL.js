"use strict";
var AGALTokenizer_1 = require("../aglsl/AGALTokenizer");
var AGLSLParser_1 = require("../aglsl/AGLSLParser");
var ProgramWebGL = (function () {
    function ProgramWebGL(gl) {
        this._uniforms = [[], [], []];
        this._attribs = [];
        this._gl = gl;
        this._program = this._gl.createProgram();
    }
    ProgramWebGL.prototype.upload = function (vertexProgram, fragmentProgram) {
        var vertexString = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram));
        var fragmentString = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram));
        this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._gl.shaderSource(this._vertexShader, vertexString);
        this._gl.compileShader(this._vertexShader);
        if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS))
            throw new Error(this._gl.getShaderInfoLog(this._vertexShader));
        this._gl.shaderSource(this._fragmentShader, fragmentString);
        this._gl.compileShader(this._fragmentShader);
        if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS))
            throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));
        this._gl.attachShader(this._program, this._vertexShader);
        this._gl.attachShader(this._program, this._fragmentShader);
        this._gl.linkProgram(this._program);
        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS))
            throw new Error(this._gl.getProgramInfoLog(this._program));
        this._uniforms[0].length = 0;
        this._uniforms[1].length = 0;
        this._uniforms[2].length = 0;
        this._attribs.length = 0;
    };
    ProgramWebGL.prototype.getUniformLocation = function (programType, index) {
        if (index === void 0) { index = -1; }
        if (this._uniforms[programType][index + 1] != null)
            return this._uniforms[programType][index + 1];
        var name = (index == -1) ? ProgramWebGL._uniformLocationNameDictionary[programType] : ProgramWebGL._uniformLocationNameDictionary[programType] + index;
        return (this._uniforms[programType][index + 1] = this._gl.getUniformLocation(this._program, name));
    };
    //
    // public getUniformLocation(programType:number, index:number):WebGLUniformLocation
    // {
    // 	if (this._uniforms[programType][index] != null)
    // 		return this._uniforms[programType][index];
    //
    // 	return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, ProgramWebGL._uniformLocationNameDictionary[programType] + index));
    // }
    ProgramWebGL.prototype.getAttribLocation = function (index) {
        if (this._attribs[index] != null)
            return this._attribs[index];
        return (this._attribs[index] = this._gl.getAttribLocation(this._program, "va" + index));
    };
    ProgramWebGL.prototype.dispose = function () {
        this._gl.deleteProgram(this._program);
    };
    ProgramWebGL.prototype.focusProgram = function () {
        this._gl.useProgram(this._program);
    };
    Object.defineProperty(ProgramWebGL.prototype, "glProgram", {
        get: function () {
            return this._program;
        },
        enumerable: true,
        configurable: true
    });
    ProgramWebGL._tokenizer = new AGALTokenizer_1.AGALTokenizer();
    ProgramWebGL._aglslParser = new AGLSLParser_1.AGLSLParser();
    ProgramWebGL._uniformLocationNameDictionary = ["fc", "fs", "vc"];
    return ProgramWebGL;
}());
exports.ProgramWebGL = ProgramWebGL;
