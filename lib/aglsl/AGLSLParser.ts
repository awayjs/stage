import { Description } from './Description';
import { Mapping } from './Mapping';
import { REGISTER } from './assembler/RegMap';
import { Destination } from './Destination';
import { Settings } from '../Settings';

export class AGLSLParser {
	public static SWIZZLE = ['x', 'y', 'z', 'w'];
	public static SAMPLERS = ['2D', 'Cube', '3D', ''];

	public static maxvertexconstants: number = 128;
	public static maxfragconstants: number = 28;
	public static maxtemp: number = 8;
	public static maxstreams: number = 8;
	public static maxtextures: number = 8;

	private _usedLibs: Record<number, boolean> = {};
	private _usedTemps: Record<string, boolean> = {};
	private _desc: Description;
	private _header: string;
	private _body: string;

	private _linkLib(opcode: number) {
		const libs = this._usedLibs;

		if (!libs[opcode] && Mapping.lib[opcode]) {
			libs[opcode] = true;
			this._header += '\n' + Mapping.lib[opcode] + '\n';
			return true;
		}

		return libs[opcode];
	}

	public parse(desc: Description, precision: string, es300 = false): string {
		es300 = Settings.USE_300_SHADERS_FOR_WEBGL2 && es300;

		this._usedTemps = {};
		this._usedLibs = {};
		this._header = '';
		this._body = '';
		this._header += es300 ? '#version 300 es\n' : '#version 100\n';
		this._header += 'precision ' + precision + ' float;\n';

		const tag = desc.header.type[0]; //TODO
		const constcount = desc.regread[0x1].length;

		if (constcount > 0) {
			this._header += 'uniform vec4 ' + tag + 'c[' + constcount + '];\n';
		}

		/*
		// declare temps
		for (let i = 0; i < desc.regread[REGISTER.TEMP].length || i < desc.regwrite[REGISTER.TEMP].length; i++) {
			// duh, have to check write only also...
			if (desc.regread[REGISTER.TEMP][i] || desc.regwrite[REGISTER.TEMP][i]) {
				this._header += 'vec4 ' + tag + 't' + i + ';\n';
			}
		}*/

		// declare streams
		for (let i = 0; i < desc.regread[REGISTER.ATTR].length; i++) {
			if (desc.regread[REGISTER.ATTR][i]) {
				this._header += (es300 ? 'in' : 'attribute') + ' vec4 va' + i + ';\n';
			}
		}

		// declare interpolated
		for (let i = 0; i < desc.regread[REGISTER.VAR].length || i < desc.regwrite[REGISTER.VAR].length; i++) {
			if (desc.regread[REGISTER.VAR][i] || desc.regwrite[REGISTER.VAR][i]) {
				if (es300) {
					// in ES 300 out of vertex in of fragment
					this._header += (desc.header.type === 'vertex' ? 'out' : 'in') + ' vec4 vi' + i + ';\n';
				} else {
					this._header += 'varying vec4 vi' + i + ';\n';
				}
			}
		}

		// declare samplers
		for (let i = 0; i < desc.samplers.length; i++) {
			if (desc.samplers[i]) {
				this._header += 'uniform sampler' +
						AGLSLParser.SAMPLERS[ desc.samplers[i].dim & 3 ] + ' fs' + i + ';\n';
			}
		}

		// extra gl fluff: setup position and depth adjust temps
		if (desc.header.type == 'vertex') {
			this._header += 'vec4 outpos;\n';
		} else if (es300) {
			// target is es300, emit out color
			this._header += 'out vec4 outColor;\n';
		}

		if (desc.writedepth) {
			this._header += 'vec4 tmp_FragDepth;\n';
		}
		//if ( desc.hasmatrix )
		//    header += "vec4 tmp_matrix;\n";

		let derivatives: boolean = false;

		// start body of code
		this._body += 'void main() {\n';

		for (let i = 0; i < desc.tokens.length; i++) {
			const token = desc.tokens[i];
			const lutentry = Mapping.agal2glsllut[token.opcode];
			const hasLib = this._linkLib(token.opcode);

			if (lutentry.s.indexOf('dFdx') != -1 || lutentry.s.indexOf('dFdy') != -1) derivatives = true;
			if (!lutentry) {
				throw 'Opcode not valid or not implemented yet: ';
				/*+token.opcode;*/
			}

			const sublines = hasLib ? 1 : lutentry.matrixheight || 1;

			for (let sl = 0; sl < sublines; sl++) {
				let line = '  ' + lutentry.s;
				let destregstring = '';
				let destcaststring = 'float';
				let destmaskstring = '';

				if (token.dest) {
					if (lutentry.matrixheight && !hasLib) {
						if (((token.dest.mask >> sl) & 1) != 1) {
							continue;
						}

						destmaskstring = AGLSLParser.SWIZZLE[sl];

						destregstring = this.regtostring(
							token.dest.regtype,
							token.dest.regnum,
							desc,
							tag,
							es300
						);
						destregstring += '.' + destmaskstring;

					} else {
						destregstring = this.regtostring(
							token.dest.regtype,
							token.dest.regnum,
							desc,
							tag,
							es300
						);

						if (token.dest.mask != 0xf) {
							let ndest: number = 0;
							destmaskstring = '';
							if (token.dest.mask & 1) {
								ndest++;
								destmaskstring += 'x';
							}
							if (token.dest.mask & 2) {
								ndest++;
								destmaskstring += 'y';
							}
							if (token.dest.mask & 4) {
								ndest++;
								destmaskstring += 'z';
							}
							if (token.dest.mask & 8) {
								ndest++;
								destmaskstring += 'w';
							}
							destregstring += '.' + destmaskstring;
							switch (ndest) {
								case 1:
									destcaststring = 'float';
									break;
								case 2:
									destcaststring = 'vec2';
									break;
								case 3:
									destcaststring = 'vec3';
									break;
								default:
									throw 'Unexpected destination mask';
							}
						} else {
							destcaststring = 'vec4';
							destmaskstring = 'xyzw';
						}
					}

					if (token.dest.regtype == REGISTER.TEMP &&
						!this._usedTemps[token.dest.regnum]
					) {
						const tmp = tag + 't' + token.dest.regnum;

						if (destcaststring === 'vec4') {
							destregstring = 'vec4 ' + tmp;
						} else {
							line = '    vec4 ' + tmp + ';\n' + line;
						}

						this._usedTemps[token.dest.regnum] = true;
					}

					line = line.replace('%dest', destregstring);
					line = line.replace('%cast', destcaststring);
					line = line.replace('%dm', destmaskstring);
				}

				let dwm: number = 0xf;
				if (!lutentry.ndwm && lutentry.dest && token.dest) {
					dwm = token.dest.mask;
				}

				if (token.a) {
					line = line.replace(
						'%a',
						this.sourcetostring(token.a, 0, dwm, lutentry.scalar, desc, tag, es300)
					);
					line = line.replace('%ia', '' + token.a.regnum);
				}

				if (token.b) {
					line = line.replace(
						'%b',
						this.sourcetostring(token.b, sl, dwm, lutentry.scalar, desc, tag, es300)
					);
					line = line.replace('%ib', '' + token.b.regnum);

					if (token.b.regtype == 0x5) {
						// sampler dim
						const texdim = AGLSLParser.SAMPLERS[token.b.dim];
						const texsize = ['vec2', 'vec3', 'vec3'][token.b.dim];

						// for es 300 not required a texture type
						line = line.replace('%texdim', es300 ? '' : texdim);
						line = line.replace('%texsize', texsize);
						line = line.replace('%lod', '');
					}
				}
				this._body += line;
			}
		}

		// adjust z from opengl range of -1..1 to 0..1 as in d3d, this also enforces a left handed coordinate system
		if (desc.header.type == 'vertex') {
			this._body += '  gl_Position = vec4(outpos.x, outpos.y, outpos.z*2.0 - outpos.w, outpos.w);\n';
		}

		//flag based switch
		if (derivatives && desc.header.type == 'fragment') {
			this._header = '#extension GL_OES_standard_derivatives : enable\n' + this._header;
		}

		// clamp fragment depth
		if (desc.writedepth) {
			this._body += '  gl_FragDepth = clamp(tmp_FragDepth,0.0,1.0);\n';
		}

		// close main
		this._body += '}\n';

		return this._header + this._body;
	}

	public regtostring(
		regtype: REGISTER,
		regnum: number,
		desc: Description,
		tag: string,
		es300: boolean
	): string {
		switch (regtype) {
			case REGISTER.ATTR:
				return 'va' + regnum;
			case REGISTER.CONST:
				return desc.header.type[0] + 'c[' + regnum + ']';
			// case 0x1:
			// 	if (desc.hasindirect && desc.header.type == "vertex") {
			// 		return "vcarrr[" + regnum + "]";
			// 	} else {
			// 		return tag + "c" + regnum;
			// 	}
			case REGISTER.TEMP: {
				return tag + 't' + regnum;
			}
			case REGISTER.OUT: {
				if (desc.header.type == 'vertex') {
					return 'outpos';
				} else if (es300) {
					return 'outColor';
				}

				return 'gl_FragColor';
			}
			case REGISTER.VAR:
				return 'vi' + regnum;
			case REGISTER.SAMPLER:
				return 'fs' + regnum;
			case REGISTER.NATIVE: {
				if (desc.native[regnum] === undefined) {
					throw 'Native mapping not presented for register:' + regnum;
				}

				return desc.native[regnum];
			}
			default:
				throw 'Unknown register type';
		}
	}

	public sourcetostring(
		s: Destination,
		subline: number,
		dwm: number,
		isscalar: boolean,
		desc: Description,
		tag: string,
		es300: boolean
	): string {

		const swiz = AGLSLParser.SWIZZLE;
		let r;

		if (s.indirectflag) {
			r = 'vcarrr[int(' + this.regtostring(s.indexregtype, s.regnum, desc, tag, es300) + '.' + swiz[s.indexselect] + ')';
			const realofs = subline + s.indexoffset;

			if (realofs < 0) r += realofs.toString();
			if (realofs > 0) r += '+' + realofs.toString();

			r += ']';
		} else {
			r = this.regtostring(s.regtype, s.regnum + subline, desc, tag, es300);
		}

		// samplers and native never add swizzle
		if (s.regtype == REGISTER.SAMPLER || s.regtype == REGISTER.NATIVE) {
			return r;
		}

		// scalar, first component only
		if (isscalar) {
			return r + '.' + swiz[(s.swizzle >> 0) & 3];
		}

		// identity
		if (s.swizzle == 0xe4 && dwm == 0xf) {
			return r;
		}

		// with destination write mask folded in
		r += '.';
		if (dwm & 1) r += swiz[(s.swizzle >> 0) & 3];
		if (dwm & 2) r += swiz[(s.swizzle >> 2) & 3];
		if (dwm & 4) r += swiz[(s.swizzle >> 4) & 3];
		if (dwm & 8) r += swiz[(s.swizzle >> 6) & 3];
		return r;
	}
}