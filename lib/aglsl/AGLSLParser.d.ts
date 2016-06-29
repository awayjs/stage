import { Description } from "../aglsl/Description";
export declare class AGLSLParser {
    static maxvertexconstants: number;
    static maxfragconstants: number;
    static maxtemp: number;
    static maxstreams: number;
    static maxtextures: number;
    parse(desc: Description): string;
    regtostring(regtype: number, regnum: number, desc: Description, tag: any): string;
    sourcetostring(s: any, subline: any, dwm: any, isscalar: any, desc: any, tag: any): string;
}
