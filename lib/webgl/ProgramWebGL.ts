import {ByteArray} from "@awayjs/core";

import {AGALTokenizer} from "../aglsl/AGALTokenizer";
import {AGLSLParser} from "../aglsl/AGLSLParser";
import {IProgram} from "../base/IProgram";

const TEST_PLACE = /(#define|#version|precision).*\n/gi;

export class ProgramWebGL implements IProgram
{
	private static ProgramID = 0;

	private static _tokenizer:AGALTokenizer = new AGALTokenizer();
	private static _aglslParser:AGLSLParser = new AGLSLParser();
	private static _uniformLocationNameDictionary:Array<string> = ["fc", "fs", "vc"];

	public name: string;

	// private static _uniformLocationNameDictionary:Array<string> = ["fcarrr", "fs", "vcarrr"];

	private _id: number = ProgramWebGL.ProgramID ++;
	private _gl:WebGLRenderingContext;
	private _program:WebGLProgram;
	private _vertexShader:WebGLShader;
	private _fragmentShader:WebGLShader;
	private _uniforms:Array<NumberMap<WebGLUniformLocation>> = [{},{},{}];
	private _nameToIndex: StringMap<number> = {};
	private _attribs:Array<number> = [];

	constructor(gl:WebGLRenderingContext)
	{
		this._gl = gl;
		this._program = this._gl.createProgram();
	}

	public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray):void
	{
		//detect whether highp can be used
		var vertexPrecision:string = 
			(this._gl.getShaderPrecisionFormat(this._gl.VERTEX_SHADER, this._gl.HIGH_FLOAT).precision != 0) ? "highp" : "mediump";
		var fragmentPrecision:string = 
			(this._gl.getShaderPrecisionFormat(this._gl.FRAGMENT_SHADER, this._gl.HIGH_FLOAT).precision != 0) ? "highp" : "mediump";

		var vertexString:string = 
			ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram), vertexPrecision);
		var fragmentString:string = 
			ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram), fragmentPrecision);

		if(!this.name) {
			this.name = "PROG_AGAL_" + this._id;
		}

		this.uploadRaw(vertexString, fragmentString);
	}

	public uploadRaw(vertexGLSL: string, fragmentGLSL: string) {
		if(!this.name) {
			this.name = "PROG_GLSL_" + this._id;
		}

		vertexGLSL = this.insertName(vertexGLSL);
		fragmentGLSL = this.insertName(fragmentGLSL);

		this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
		this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);

		this._gl.shaderSource(this._vertexShader, vertexGLSL);
		this._gl.compileShader(this._vertexShader);

		if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS))
			throw new Error(this._gl.getShaderInfoLog(this._vertexShader));

		this._gl.shaderSource(this._fragmentShader, fragmentGLSL);
		this._gl.compileShader(this._fragmentShader);

		if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS))
			throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));

		this._gl.attachShader(this._program, this._vertexShader);
		this._gl.attachShader(this._program, this._fragmentShader);
		this._gl.linkProgram(this._program);

		if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS))
			throw new Error(this._gl.getProgramInfoLog(this._program));
		
		this.reset();
	}

	protected insertName(shader: string): string {
		const mathes = shader.match(TEST_PLACE) || [];
		const last = mathes[mathes.length - 1]; 
		const corret = last ? shader.lastIndexOf(last) + last.length : 0;

		return shader.substr(0, corret) 
			+ `\n#define SHADER_NAME ${this.name}\n\n`
			+ shader.substr(corret);
	}

	protected reset() {

		this._uniforms[0] = {};
		this._uniforms[1] = {};
		this._uniforms[2] = {};
		this._attribs.length = 0;
	}

	public getUniformLocation(programType:number, indexOrName:number | string = -1):WebGLUniformLocation
	{
		const isIndex = typeof indexOrName === 'number';
		const index = isIndex ? <number>indexOrName : this._nameToIndex[<string>indexOrName];

		if (typeof index !=='undefined' && this._uniforms[programType][index + 1] != null) {
			return this._uniforms[programType][index + 1];
		}

		let name = <string>indexOrName;

		if(isIndex) {
			name = (indexOrName === -1) ? 
				ProgramWebGL._uniformLocationNameDictionary[programType] : 
				ProgramWebGL._uniformLocationNameDictionary[programType] + indexOrName;		 
		}

		this._nameToIndex[name] = index + 1;
		
		return (this._uniforms[programType][index + 1] = this._gl.getUniformLocation(this._program, name));
	}
	
	//
	// public getUniformLocation(programType:number, index:number):WebGLUniformLocation
	// {
	// 	if (this._uniforms[programType][index] != null)
	// 		return this._uniforms[programType][index];
	//
	// 	return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, ProgramWebGL._uniformLocationNameDictionary[programType] + index));
	// }


	public getAttribLocation(index:number):number
	{
		if (this._attribs[index] != null)
			return this._attribs[index];

		const atrib = this._gl.getActiveAttrib(this._program, index);

		if(!atrib) {
			return this._attribs[index] = -1;
		}

		return (this._attribs[index] = this._gl.getAttribLocation(this._program, atrib.name));
	}

	public dispose():void
	{
		this._gl.deleteProgram(this._program);
	}

	public focusProgram():void
	{
		this._gl.useProgram(this._program);
	}

	public get glProgram():WebGLProgram
	{
		return this._program;
	}
}