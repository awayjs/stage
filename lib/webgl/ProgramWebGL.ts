import { ByteArray } from '@awayjs/core';

import { AGALTokenizer } from '../aglsl/AGALTokenizer';
import { AGLSLParser } from '../aglsl/AGLSLParser';
import { IProgram } from '../base/IProgram';
import { Settings } from '../Settings';
import { ContextWebGL } from './ContextWebGL';
import { WEBGL_METHOD_MAP } from './WebGLDataMapping';

const TEST_PLACE = /(#define|#version|precision).*\n/gi;

export interface IUniformMeta {
	location: WebGLUniformLocation;
	type: number;
	size: number;
}

export interface IAttrMeta {
	location: number;
	type: number;
	size: number;
}

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
	private _attribs: Array<number> = [];
	private _uniformCache: Array<string> = new Array(16);

	private _focusId: number = 0;
	/**
	 * @description Changed only after rebound a shader. Can be used for partial upload
	 */
	public get focusId() {
		return this._focusId;
	}

	private _rawUniforms: Record<string, IUniformMeta> = {};

	private _rawAttrs: Record<string, IAttrMeta> = {};

	constructor(private _context: ContextWebGL) {
		this._gl = _context._gl;

		_context.stats.progs++;
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

		this.grabLocationData();
	}

	private grabLocationData() {
		this._rawUniforms = {};
		this._rawAttrs = {};

		const gl = this._gl;
		const p = this._program;
		const ucount = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
		const acount = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);

		let samplersCount = 0;

		for (let i = 0; i < ucount; i++) {
			const info = gl.getActiveUniform(p, i);
			const idx = info.name.indexOf('[');

			const record = {
				type: info.type,
				size: info.size,
				location: gl.getUniformLocation(p, info.name)
			};

			this._rawUniforms [
				idx === -1
					? info.name
					: info.name.substring(0, idx)
			] = record;

			if (info.type === gl.SAMPLER_2D) {

				if (Settings.UNSAFE_USE_AUTOINDEXED_SAMPLER && info.name !== ('fs' + samplersCount)) {
					this._rawUniforms ['fs' + samplersCount] = record;
				}

				samplersCount++;
			}
		}

		for (let i = 0; i < acount; i++) {
			const info = gl.getActiveAttrib(p, i);

			this._rawAttrs[info.name] = {
				type: info.type,
				size: info.size,
				location: gl.getAttribLocation(p, info.name)
			};
		}
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
		this._attribs.length = 0;
		this._uniformCache.fill('');
	}

	public getUniformLocation(
		programType: number,
		indexOrName: number | string = -1
	): WebGLUniformLocation | null  {
		const isIndex = typeof indexOrName === 'number';

		const name = isIndex
			? ProgramWebGL._getAGALUniformName(programType, <number>indexOrName)
			: <string>indexOrName;

		const info = this._rawUniforms[name];

		if (!info)
			return null;

		return info.location;
	}

	public getAttribLocation(index: number): number {
		const info = this._rawAttrs['va' + index];

		if (!info)
			return -1;

		return info.location;
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

	public uploadUniform(name: string, data: number | number[] | Float32Array): boolean {
		const info = this._rawUniforms[name];

		if (!info)
			return false;

		if (!WEBGL_METHOD_MAP[info.type]) {
			throw ('[ProgramWebGL] Unsupported uniform type:' + info.type);
		}

		const {
			size, method
		} = WEBGL_METHOD_MAP[info.type];

		if (size === 1) {
			this._gl[method](info.location, typeof data === 'number' ? data : data[0]);
			return true;
		}

		const arr: ArrayLike<number> = <any> data;

		if (arr.length !== info.size * size) {

			throw (
				`[ProgramWebGL] Invalid data length for ${name}, expected ${info.size * size}, actual ${arr.length}`
			);
		}

		if (info.type === this._gl.FLOAT_MAT2 ||
			info.type === this._gl.FLOAT_MAT3 ||
			info.type === this._gl.FLOAT_MAT4
		) {
			this._gl[method](info.location, false, arr);
		} else {
			this._gl[method](info.location, arr);
		}
	}

	public uniform1i(type: number, index: number, value: number) {
		const location = this.getUniformLocation(type, index);

		if (!location) {
			return;
		}

		if (Settings.ENABLE_UNIFORM_CACHE) {
			const hash = this._needCache(type * 4 + index + 1, value);
			// return undef hash if not require to uppload;
			if (hash === void 0) {
				return;
			}

			this._uniformCache[type * 4 + index + 1] = hash;
		}

		this._gl.uniform1i(location, value);
	}

	public uniform4fv(type: number, value: Float32Array) {
		const location = this.getUniformLocation(type);

		if (!location) {
			return;
		}

		if (Settings.ENABLE_UNIFORM_CACHE) {
			const hash = this._needCache(type * 4, value);

			// return undef hash if not require to uppload;
			if (hash === void 0) {
				return;
			}
			this._uniformCache[type * 4] = hash;
		}

		this._gl.uniform4fv(location, value);
	}

	public dispose(): void {
		this._context.stats.progs--;
		this._gl.deleteProgram(this._program);
	}

	public focusProgram(): void {
		this._focusId++;
		this._uniformCache.fill('');
		this._gl.useProgram(this._program);
	}

	public get glProgram(): WebGLProgram {
		return this._program;
	}
}