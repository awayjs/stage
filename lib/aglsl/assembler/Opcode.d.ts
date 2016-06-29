import { Flags } from "../../aglsl/assembler/Flags";
import { FS } from "../../aglsl/assembler/FS";
/**
 *
 */
export declare class Opcode {
    dest: string;
    a: FS;
    b: FS;
    opcode: number;
    flags: Flags;
    constructor(dest: string, aformat: string, asize: number, bformat: string, bsize: number, opcode: number, simple: boolean, horizontal: boolean, fragonly: boolean, matrix: boolean);
}
