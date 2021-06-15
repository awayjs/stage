
class Reg {

	public code: number;
	public desc: string;

	constructor(code: number, desc: string) {
		this.code = code;
		this.desc = desc;
	}
}

export const enum REGISTER {
	ATTR = 0x0,
	CONST = 0x01,
	TEMP = 0x02,
	OUT = 0x03,
	VAR = 0x04,
	SAMPLER = 0x05,
	NATIVE = 0xf, // custom register
}
export class RegMap {
	private static _map: Record<string, Reg>;
	public static get map(): Record<string, Reg> {

		if (!RegMap._map) {
			RegMap._map = {};
			RegMap._map['va'] = new Reg(REGISTER.ATTR, 'vertex attribute');
			RegMap._map['fc'] = new Reg(REGISTER.CONST, 'fragment constant');
			RegMap._map['vc'] = new Reg(REGISTER.CONST, 'vertex constant');
			RegMap._map['ft'] = new Reg(REGISTER.TEMP, 'fragment temporary');
			RegMap._map['vt'] = new Reg(REGISTER.TEMP, 'vertex temporary');
			RegMap._map['vo'] = new Reg(REGISTER.OUT, 'vertex output');
			RegMap._map['op'] = new Reg(REGISTER.OUT, 'vertex output');
			RegMap._map['fd'] = new Reg(REGISTER.OUT, 'fragment depth output');
			RegMap._map['fo'] = new Reg(REGISTER.OUT, 'fragment output');
			RegMap._map['oc'] = new Reg(REGISTER.OUT, 'fragment output');
			RegMap._map['v'] = new Reg(REGISTER.VAR, 'varying');
			RegMap._map['vi'] = new Reg(REGISTER.VAR, 'varying output');
			RegMap._map['fi'] = new Reg(REGISTER.VAR, 'varying input');
			RegMap._map['fs'] = new Reg(REGISTER.SAMPLER, 'sampler');

			// custom register, vn, fn - vertex native, fragment native
			RegMap._map['vn'] = new Reg(REGISTER.NATIVE, 'native');
			RegMap._map['fn'] = new Reg(REGISTER.NATIVE, 'native');

		}

		return RegMap._map;

	}
}