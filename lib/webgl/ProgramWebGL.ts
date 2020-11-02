import { ByteArray } from '@awayjs/core';

import { AGALTokenizer } from '../aglsl/AGALTokenizer';
import { AGLSLParser } from '../aglsl/AGLSLParser';
import { IProgram } from '../base/IProgram';

const TEST_PLACE = /(#define|#version|precision).*\n/gi;

export class ProgramWebGL implements IProgram {
	private static ProgramID = 0;

	private static _tokenizer: AGALTokenizer = new AGALTokenizer();
	private static _aglslParser: AGLSLParser = new AGLSLParser();
	private static _uniformLocationNameDictionary: Array<string> = ['fc', 'fs', 'vc'];

	public name: string;

	// private static _uniformLocationNameDictionary:Array<string> = ["fcarrr", "fs", "vcarrr"];

	private _id: number = ProgramWebGL.ProgramID++;
	private _gl: WebGLRenderingContext;
	private _program: WebGLProgram;
	private _vertexShader: WebGLShader;
	private _fragmentShader: WebGLShader;
	private _uniforms: Array<NumberMap<WebGLUniformLocation>> = [{},{},{}];
	private _nameToIndex: StringMap<number> = {};
	private _attribs: Array<number> = [];
	private _uniformCache: Array<string> = new Array(16);

	constructor(gl: WebGLRenderingContext) {
		this._gl = gl;
		this._program = this._gl.createProgram();
	}

	public upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): void {
		//detect whether highp can be used

		const vertexPrecision = this._gl.getShaderPrecisionFormat(
			this._gl.VERTEX_SHADER,
			this._gl.HIGH_FLOAT).precision;

		const fragmentPrecision = this._gl.getShaderPrecisionFormat(
			this._gl.FRAGMENT_SHADER,
			this._gl.HIGH_FLOAT).precision;

		const vertexString: string = ProgramWebGL._aglslParser.parse(
			ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram),
			vertexPrecision ? 'highp' : 'mediump');

		const fragmentString: string = ProgramWebGL._aglslParser.parse(
			ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram),
			fragmentPrecision ? 'highp' : 'mediump');

		if (!this.name) {
			this.name = 'PROG_AGAL_' + this._id;
		}

		this.uploadRaw(vertexString, fragmentString);
	}

	public uploadRaw(vertexGLSL: string, fragmentGLSL: string) {
		if (!this.name) {
			this.name = 'PROG_GLSL_' + this._id;
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
		this._uniformCache.fill('');
	}

	public getUniformLocation(programType: number, indexOrName: number | string = -1): WebGLUniformLocation {
		const isIndex = typeof indexOrName === 'number';
		const index = isIndex ? <number>indexOrName : this._nameToIndex[<string>indexOrName];

		if (typeof index !== 'undefined' && this._uniforms[programType][index + 1] != null) {
			return this._uniforms[programType][index + 1];
		}

		const name = isIndex
			? ProgramWebGL._getAGALUniformName(programType, <number>indexOrName)
			: <string>indexOrName;

		this._nameToIndex[name] = index + 1;

		return (this._uniforms[programType][index + 1] = this._gl.getUniformLocation(this._program, name));
	}

	private static _getAGALUniformName (type: number, index = -1) {
		return (index === -1)
			? this._uniformLocationNameDictionary[type]
			: this._uniformLocationNameDictionary[type] + index;
	}

	private _needCache(index: number, value: Float32Array | number): string {
		const cached = this._uniformCache[index];
		const hash = value instanceof Float32Array
			? new Uint32Array(value.buffer).join('')
			: '' + value;

		// already uploaded
		return (cached && hash === cached) ? void 0 : hash;
	}

	public uniform1i(type: number, index: number, value: number) {
		const location = this.getUniformLocation(type, index);
		const hash = this._needCache(type * 4 + index + 1, value);

		// return undef hash if not require to uppload;
		if (hash === void 0) {
			return;
		}

		this._uniformCache[type * 4 + index + 1] = hash;
		this._gl.uniform1i(location, value);
	}

	public uniform4fv(type: number, value: Float32Array) {
		const location = this.getUniformLocation(type);
		const hash = this._needCache(type * 4, value);

		// return undef hash if not require to uppload;
		if (hash === void 0) {
			return;
		}

		this._uniformCache[type * 4] = hash;
		this._gl.uniform4fv(location, value);
	}

	public getAttribLocation(index: number): number {
		if (this._attribs[index] != null)
			return this._attribs[index];

		return (this._attribs[index] = this._gl.getAttribLocation(this._program, 'va' + index));
	}

	public dispose(): void {
		this._gl.deleteProgram(this._program);
	}

	public focusProgram(): void {
		this._uniformCache.fill('');
		this._gl.useProgram(this._program);
	}

	public get glProgram(): WebGLProgram {
		return this._program;
	}
}