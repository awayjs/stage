import { Part } from "../../aglsl/assembler/Part";
export declare class AGALMiniAssembler {
    r: Object;
    cur: Part;
    constructor();
    assemble(source: string, ext_part?: any, ext_version?: any): Object;
    private processLine(line, linenr);
    emitHeader(pr: Part): void;
    emitOpcode(pr: Part, opcode: any): void;
    emitZeroDword(pr: Part): void;
    emitZeroQword(pr: any): void;
    emitDest(pr: any, token: any, opdest: any): boolean;
    stringToMask(s: string): number;
    stringToSwizzle(s: any): number;
    emitSampler(pr: Part, token: any, opsrc: any, opts: any): boolean;
    emitSource(pr: any, token: any, opsrc: any): boolean;
    addHeader(partname: any, version: any): void;
}
