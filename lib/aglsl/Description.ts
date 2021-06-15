import { Header } from '../aglsl/Header';
import { Token } from '../aglsl/Token';
import { REGISTER } from './assembler/RegMap';

export class Description {
	public regread: Record<REGISTER, any[]> = {
		[REGISTER.ATTR]: [],
		[REGISTER.CONST]: [],
		[REGISTER.VAR]: [],
		[REGISTER.TEMP]: [],
		[REGISTER.OUT]: [],
		[REGISTER.SAMPLER] : [],
		[REGISTER.NATIVE] : [],
	}

	public regwrite: Record<REGISTER, any[]> = {
		[REGISTER.ATTR]: [],
		[REGISTER.CONST]: [],
		[REGISTER.VAR]: [],
		[REGISTER.TEMP]: [],
		[REGISTER.OUT]: [],
		[REGISTER.SAMPLER] : [],
		[REGISTER.NATIVE] : [],
	}

	public hasindirect: boolean = false;
	public writedepth: boolean = false;
	public hasmatrix: boolean = false;
	public samplers: any[] = [];
	public constants: number = 0;

	// added due to dynamic assignment 3*0xFFFFFFuuuu
	public tokens: Token[] = [];
	public header: Header = new Header();
	// native instructions per register
	public native: Record<number, string> = {};

	constructor() {
	}
}