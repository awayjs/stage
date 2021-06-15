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

	public parse(desc: Description, precision: string, es300 = false): string {
		es300 = Settings.USE_300_SHADERS_FOR_WEBGL2 && es300;

		let header: string = '';
		let body: string = '';

		header += es300 ? '#version 300 es\n' : '#version 100\n';
		header += 'precision ' + precision + ' float;\n';

		const tag = desc.header.type[0]; //TODO
		const constcount = desc.regread[0x1].length;

		if (constcount > 0) {
			header += 'uniform vec4 ' + tag + 'c[' + constcount + '];\n';
		}

		// declare temps
		for (let i = 0; i < desc.regread[REGISTER.TEMP].length || i < desc.regwrite[REGISTER.TEMP].length; i++) {
			// duh, have to check write only also...
			if (desc.regread[REGISTER.TEMP][i] || desc.regwrite[REGISTER.TEMP][i]) {
				header += 'vec4 ' + tag + 't' + i + ';\n';
			}
		}

		// declare streams
		for (let i = 0; i < desc.regread[REGISTER.ATTR].length; i++) {
			if (desc.regread[REGISTER.ATTR][i]) {
				header += (es300 ? 'in' : 'attribute') + ' vec4 va' + i + ';\n';
			}
		}

		// declare interpolated
		for (let i = 0; i < desc.regread[REGISTER.VAR].length || i < desc.regwrite[REGISTER.VAR].length; i++) {
			if (desc.regread[REGISTER.VAR][i] || desc.regwrite[REGISTER.VAR][i]) {
				if (es300) {
					// in ES 300 out of vertex in of fragment
					header += (desc.header.type === 'vertex' ? 'out' : 'in') + ' vec4 vi' + i + ';\n';
				} else {
					header += 'varying vec4 vi' + i + ';\n';
				}
			}
		}

		// declare samplers
		for (let i = 0; i < desc.samplers.length; i++) {
			if (desc.samplers[i]) {
				header += 'uniform sampler' + AGLSLParser.SAMPLERS[ desc.samplers[i].dim & 3 ] + ' fs' + i + ';\n';
			}
		}

		// extra gl fluff: setup position and depth adjust temps
		if (desc.header.type == 'vertex') {
			header += 'vec4 outpos;\n';
		} else if (es300) {
			// target is es300, emit out color
			header += 'out vec4 outColor;\n';
		}

		if (desc.writedepth) {
			header += 'vec4 tmp_FragDepth;\n';
		}
		//if ( desc.hasmatrix )
		//    header += "vec4 tmp_matrix;\n";

		let derivatives: boolean = false;

		// start body of code
		body += 'void main() {\n';

		for (let i = 0; i < desc.tokens.length; i++) {

			const lutentry = Mapping.agal2glsllut[desc.tokens[i].opcode];

			if (lutentry.s.indexOf('dFdx') != -1 || lutentry.s.indexOf('dFdy') != -1) derivatives = true;
			if (!lutentry) {
				throw 'Opcode not valid or not implemented yet: ';
				/*+token.opcode;*/
			}
			const sublines = lutentry.matrixheight || 1;

			for (let sl = 0; sl < sublines; sl++) {
				let line = '  ' + lutentry.s;
				let destregstring = '';
				let destcaststring = 'float';
				let destmaskstring = '';

				if (desc.tokens[i].dest) {
					if (lutentry.matrixheight) {
						if (((desc.tokens[i].dest.mask >> sl) & 1) != 1) {
							continue;
						}

						destregstring = this.regtostring(
							desc.tokens[i].dest.regtype,
							desc.tokens[i].dest.regnum,
							desc,
							tag,
							es300
						);

						destmaskstring = AGLSLParser.SWIZZLE[sl];
						destregstring += '.' + destmaskstring;

					} else {
						destregstring = this.regtostring(
							desc.tokens[i].dest.regtype,
							desc.tokens[i].dest.regnum,
							desc,
							tag,
							es300
						);

						if (desc.tokens[i].dest.mask != 0xf) {
							let ndest: number = 0;
							destmaskstring = '';
							if (desc.tokens[i].dest.mask & 1) {
								ndest++;
								destmaskstring += 'x';
							}
							if (desc.tokens[i].dest.mask & 2) {
								ndest++;
								destmaskstring += 'y';
							}
							if (desc.tokens[i].dest.mask & 4) {
								ndest++;
								destmaskstring += 'z';
							}
							if (desc.tokens[i].dest.mask & 8) {
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
					line = line.replace('%dest', destregstring);
					line = line.replace('%cast', destcaststring);
					line = line.replace('%dm', destmaskstring);
				}

				let dwm: number = 0xf;
				if (!lutentry.ndwm && lutentry.dest && desc.tokens[i].dest) {
					dwm = desc.tokens[i].dest.mask;
				}

				if (desc.tokens[i].a) {
					line = line.replace(
						'%a',
						this.sourcetostring(desc.tokens[i].a, 0, dwm, lutentry.scalar, desc, tag, es300)
					);
				}

				if (desc.tokens[i].b) {
					line = line.replace(
						'%b',
						this.sourcetostring(desc.tokens[i].b, sl, dwm, lutentry.scalar, desc, tag, es300)
					);

					if (desc.tokens[i].b.regtype == 0x5) {
						// sampler dim
						const texdim = AGLSLParser.SAMPLERS[desc.tokens[i].b.dim];
						const texsize = ['vec2', 'vec3', 'vec3'][desc.tokens[i].b.dim];

						// for es 300 not required a texture type
						line = line.replace('%texdim', es300 ? '' : texdim);
						line = line.replace('%texsize', texsize);
						line = line.replace('%lod', '');
					}
				}
				body += line;
			}
		}

		// adjust z from opengl range of -1..1 to 0..1 as in d3d, this also enforces a left handed coordinate system
		if (desc.header.type == 'vertex') {
			body += '  gl_Position = vec4(outpos.x, outpos.y, outpos.z*2.0 - outpos.w, outpos.w);\n';
		}

		//flag based switch
		if (derivatives && desc.header.type == 'fragment') {
			header = '#extension GL_OES_standard_derivatives : enable\n' + header;
		}

		// clamp fragment depth
		if (desc.writedepth) {
			body += '  gl_FragDepth = clamp(tmp_FragDepth,0.0,1.0);\n';
		}

		// close main
		body += '}\n';

		return header + body;
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
			case REGISTER.TEMP:
				return tag + 't' + regnum;
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

		// samplers never add swizzle
		if (s.regtype == 0x5) {
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