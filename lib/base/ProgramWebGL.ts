import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import AGALTokenizer				= require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
import AGLSLParser					= require("awayjs-stagegl/lib/aglsl/AGLSLParser");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");


class ProgramWebGL implements IProgram
{
	private static _tokenizer:AGALTokenizer = new AGALTokenizer();
	private static _aglslParser:AGLSLParser = new AGLSLParser();

	private _gl:WebGLRenderingContext;
	private _program:WebGLProgram;
	private _vertexShader:WebGLShader;
	private _fragmentShader:WebGLShader;
	private _uniforms:Object;

	constructor(gl:WebGLRenderingContext)
	{
		this._gl = gl;
		this._program = this._gl.createProgram();
	}

	public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray)
	{
		var vertexString:string = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram));
		var fragmentString:string = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram));

		this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
		this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);

		this._gl.shaderSource(this._vertexShader, vertexString);
		this._gl.compileShader(this._vertexShader);

		if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS)) {
			throw new Error(this._gl.getShaderInfoLog(this._vertexShader));
			return;
		}

		this._gl.shaderSource(this._fragmentShader, fragmentString);
		this._gl.compileShader(this._fragmentShader);

		if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS)) {
			throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));
			return;
		}

		this._gl.attachShader(this._program, this._vertexShader);
		this._gl.attachShader(this._program, this._fragmentShader);
		this._gl.linkProgram(this._program);

		if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
			throw new Error(this._gl.getProgramInfoLog(this._program));
		}

		this._uniforms = new Object();
	}

	public getUniformLocation(name:string):WebGLUniformLocation
	{
		return this._uniforms[name] || (this._uniforms[name] = this._gl.getUniformLocation(this._program, name));

	}


	public dispose()
	{
		this._gl.deleteProgram(this._program);
	}

	public focusProgram()
	{
		this._gl.useProgram(this._program);
	}

	public get glProgram():WebGLProgram
	{
		return this._program;
	}
}

export = ProgramWebGL;