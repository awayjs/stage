import { Sampler } from './Sampler';
import { Opcode } from './Opcode';
import { OpcodeMap } from './OpcodeMap';
import { Part } from './Part';
import { RegMap } from './RegMap';
import { SamplerMap } from './SamplerMap';

export class AGALMiniAssembler {
	public r: {
		vertex: Part,
		fragment: Part,
	};

	public cur: Part;
	protected nativeInstructionLastRegister = 0xffff - 1;

	constructor() {
		this.r = {
			vertex: null,
			fragment: null,
		};

		this.cur = new Part();
	}

	public assemble(source: string, ext_part = null, ext_version = null): { vertex: Part, fragment: Part } {
		if (!ext_version) {
			ext_version = 1;
		}

		if (ext_part) {
			this.addHeader(ext_part, ext_version);
		}

		const lines = source.replace(/[\f\n\r\v]+/g, '\n').split('\n'); // handle breaks, then split into lines

		for (const i in lines) {
			this.processLine(lines[i], +i);
		}

		return this.r;
	}

	private processLine(line: string, linenr: number): void {
		const startcomment: number = line.search('//');  // remove comments
		if (startcomment != -1) {
			line = line.slice(0, startcomment);
		}
		line = line.replace(/^\s+|\s+$/g, ''); // remove outer space
		if (!(line.length > 0)) {
			return;
		}
		const optsi: number = line.search(/<.*>/g); // split of options part <*> if there
		let opts: string[] = null;
		if (optsi != -1) {
			opts = line.slice(optsi).match(/([\w\.\-\+]+)/gi);
			line = line.slice(0, optsi);
		}

		const natives = {};

		let nativesLen = 0;
		let idx: number;

		while ((idx = line.indexOf('#native')) > 0) {
			const start = idx;
			idx = line.indexOf('native#', idx);
			const end = idx > -1 ? idx + 7  : line.length;

			natives['nat' + nativesLen] = line.substring(start + 7, end - 7);
			// replace native block on to native index in block
			line = line.substring(0, start) + 'nat' + (nativesLen) + line.substring(end);

			nativesLen++;
		}

		// get opcode/command
		const tokens = line.match(/([\w\.\+\[\]]+)/gi); // get tokens in line
		if (!tokens || tokens.length < 1) {
			if (line.length >= 3) {
				console.log('Warning: bad line ' + linenr + ': ' + line);
			}
			return;
		}

		//console.log ( linenr, line, cur, tokens );
		switch (tokens[0]) {
			case 'part':
				this.addHeader(tokens[1], Number(tokens[2]));
				break;
			case 'endpart':
				if (!this.cur) {
					throw 'Unexpected endpart';
				}
				this.cur.data.position = 0;
				this.cur = null;
				return;
			default: {
				if (!this.cur) {
					console.log('Warning: bad line ' + linenr + ': ' + line + ' (Outside of any part definition)');
					return;
				}

				if (this.cur.name == 'comment') {
					return;
				}

				const op: Opcode = <Opcode>OpcodeMap.map[tokens[0]];
				if (!op) {
					throw 'Bad opcode ' + tokens[0] + ' ' + linenr + ': ' + line;
				}
				// console.log( 'AGALMiniAssembler' , 'op' , op );

				this.emitOpcode(this.cur, op.opcode);
				let ti: number = 1;
				if (op.dest && op.dest != 'none') {
					if (!this.emitDest(this.cur, tokens[ti++], op.dest)) {
						throw 'Bad destination register ' + tokens[ti - 1] + ' ' + linenr + ': ' + line;
					}
				} else {
					this.emitZeroDword(this.cur);
				}

				if (op.a && op.a.format != 'none') {
					if (!this.emitSource(this.cur, tokens[ti++], op.a, natives))
						throw 'Bad source register ' + tokens[ti - 1] + ' ' + linenr + ': ' + line;
				} else {
					this.emitZeroQword(this.cur);
				}

				if (op.b && op.b.format != 'none') {
					if (op.b.format == 'sampler') {
						if (!this.emitSampler(this.cur, tokens[ti++], op.b, opts)) {
							throw 'Bad sampler register ' + tokens[ti - 1] + ' ' + linenr + ': ' + line;
						}
					} else {
						if (!this.emitSource(this.cur, tokens[ti++], op.b, natives)) {
							throw 'Bad source register ' + tokens[ti - 1] + ' ' + linenr + ': ' + line;
						}
					}
				} else {
					this.emitZeroQword(this.cur);
				}
				break;
			}
		}
	}

	public emitHeader(pr: Part): void {
		pr.data.writeUnsignedByte(0xa0); 	// tag version
		pr.data.writeUnsignedInt(pr.version);
		if (pr.version >= 0x10) {
			pr.data.writeUnsignedByte(0); // align, for higher versions
		}
		pr.data.writeUnsignedByte(0xa1);		// tag program id
		switch (pr.name) {
			case 'fragment' :
				pr.data.writeUnsignedByte(1);
				break;
			case 'vertex' :
				pr.data.writeUnsignedByte(0);
				break;
			case 'cpu' :
				pr.data.writeUnsignedByte(2);
				break;
			default :
				pr.data.writeUnsignedByte(0xff);
				break; // unknown/comment
		}
	}

	public emitOpcode(pr: Part, opcode): void {
		pr.data.writeUnsignedInt(opcode);
		//console.log ( "Emit opcode: ", opcode );
	}

	public emitZeroDword(pr: Part): void {
		pr.data.writeUnsignedInt(0);
	}

	public emitZeroQword(pr): void {
		pr.data.writeUnsignedInt(0);
		pr.data.writeUnsignedInt(0);
	}

	public emitDest(pr, token, opdest): boolean {

		//console.log( 'AGALMiniAssembler' , 'emitDest' , 'RegMap.map' , RegMap.map);
		const reg = token.match(/([fov]?[tpocidavs])(\d*)(\.[xyzw]{1,4})?/i); // g1: regname, g2:regnum, g3:mask

		// console.log( 'AGALMiniAssembler' , 'emitDest' , 'reg' , reg , reg[1] , RegMap.map[reg[1]] );
		// console.log( 'AGALMiniAssembler' , 'emitDest' , 'RegMap.map[reg[1]]' , RegMap.map[reg[1]] , 'bool' , !RegMap.map[reg[1]] ) ;

		if (!RegMap.map[reg[1]]) return false;
		const em = { num:reg[2] ? reg[2] : 0, code:RegMap.map[reg[1]].code, mask:this.stringToMask(reg[3]) };
		pr.data.writeUnsignedShort(em.num);
		pr.data.writeUnsignedByte(em.mask);
		pr.data.writeUnsignedByte(em.code);
		//console.log ( "  Emit dest: ", em );
		return true;
	}

	public stringToMask(s: string): number {
		if (!s) return 0xf;
		let r: number = 0;
		if (s.indexOf('x') != -1) r |= 1;
		if (s.indexOf('y') != -1) r |= 2;
		if (s.indexOf('z') != -1) r |= 4;
		if (s.indexOf('w') != -1) r |= 8;
		return r;
	}

	public stringToSwizzle(s): number {
		if (!s) {
			return 0xe4;
		}
		const chartoindex = { x:0, y:1, z:2, w:3 };
		let sw: number = 0;

		if (s.charAt(0) != '.') {
			throw 'Missing . for swizzle';
		}

		if (s.length > 1) {
			sw |= chartoindex[s.charAt(1)];
		}

		if (s.length > 2) {
			sw |= chartoindex[s.charAt(2)] << 2;
		} else {
			sw |= (sw & 3) << 2;
		}

		if (s.length > 3) {
			sw |= chartoindex[s.charAt(3)] << 4;
		} else {
			sw |= (sw & (3 << 2)) << 2;
		}

		if (s.length > 4) {
			sw |= chartoindex[s.charAt(4)] << 6;
		} else {
			sw |= (sw & (3 << 4)) << 2;
		}

		return sw;
	}

	public emitSampler(pr: Part, token, opsrc, opts): boolean {
		const reg: string[] = token.match(/fs(\d*)/i); // g1:regnum
		if (!reg || !reg[1]) {
			return false;
		}
		pr.data.writeUnsignedShort(parseInt(reg[1]));
		pr.data.writeUnsignedByte(0);   // bias
		pr.data.writeUnsignedByte(0);
		/*
		 pr.data.writeUnsignedByte ( 0x5 );
		 pr.data.writeUnsignedByte ( 0 );   // readmode, dim
		 pr.data.writeUnsignedByte ( 0 );   // special, wrap
		 pr.data.writeUnsignedByte ( 0 );   // mip, filter
		 */
		let samplerbits: number = 0x5;
		let sampleroptset: number = 0;
		for (let i: number = 0; i < opts.length; i++) {
			const o: Sampler = <Sampler> SamplerMap.map[ opts[i].toLowerCase() ];

			//console.log( 'AGALMiniAssembler' , 'emitSampler' , 'SampleMap opt:' , o , '<-------- WATCH FOR THIS');

			if (o) {
				if (((sampleroptset >> o.shift) & o.mask) != 0) {
					console.log('Warning, duplicate sampler option');
				}
				sampleroptset |= o.mask << o.shift;
				samplerbits &= ~(o.mask << o.shift);
				samplerbits |= o.value << o.shift;
			} else {
				console.log('Warning, unknown sampler option: ', opts[i]);
				// todo bias
			}
		}
		pr.data.writeUnsignedInt(samplerbits);
		return true;
	}

	public emitSource(pr, token: string, opp, natives: Record<string, string>): boolean {
		// native instruction
		if (natives && (token in natives)) {
			// native call, will be replaced without modification
			this.cur.native[this.nativeInstructionLastRegister] = natives[token];

			token = `${this.cur.name === 'vertex' ? 'vn' : 'fn'}${this.nativeInstructionLastRegister}`;

			this.nativeInstructionLastRegister--;
		}

		let reg;
		// g1: indexregname, g2:indexregnum, g3:select, [g4:offset], [g5:swizzle]
		const indexed = token.match(/vc\[(v[tcai])(\d+)\.([xyzw])([+-]\d+)?\](\.[xyzw]{1,4})?/i);

		if (indexed) {
			if (!RegMap.map[indexed[1]]) {
				return false;
			}
			const selindex = { x:0, y:1, z:2, w:3 };

			pr.data.writeUnsignedShort(+indexed[2] | 0);
			pr.data.writeByte(+indexed[4] | 0);
			pr.data.writeUnsignedByte(this.stringToSwizzle(indexed[5]));
			pr.data.writeUnsignedByte(0x1); // constant reg
			pr.data.writeUnsignedByte(RegMap.map[indexed[1]].code);
			pr.data.writeUnsignedByte(selindex[indexed[3]]);
			pr.data.writeUnsignedByte(1 << 7);
		} else {
			// g1: regname, g2:regnum, g3:swizzle
			reg = token.match(/([fov]?[tpocidavsn])(\d*)(\.[xyzw]{1,4})?/i);

			if (!RegMap.map[reg[1]]) {
				return false;
			}

			pr.data.writeUnsignedShort(reg[2] | 0);
			pr.data.writeUnsignedByte(0);
			pr.data.writeUnsignedByte(this.stringToSwizzle(reg[3]));
			pr.data.writeUnsignedByte(RegMap.map[reg[1]].code);
			pr.data.writeUnsignedByte(0);
			pr.data.writeUnsignedByte(0);
			pr.data.writeUnsignedByte(0);
			//console.log ( "  Emit source: ", em, pr.data.length );
		}
		return true;
	}

	public addHeader(partname: string, version: number = 1): void {
		if (this.r[partname] == undefined) {
			this.r[partname] = new Part(partname, version);
			this.emitHeader(this.r[ partname ]);
		} else if (this.r[partname].version != version) {
			throw 'Multiple versions for part ' + partname;
		}

		this.cur = this.r[partname];
	}
}