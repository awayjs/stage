import { Header } from "../aglsl/Header";
import { Token } from "../aglsl/Token";
export declare class Description {
    regread: any[];
    regwrite: any[];
    hasindirect: boolean;
    writedepth: boolean;
    hasmatrix: boolean;
    samplers: any[];
    tokens: Token[];
    header: Header;
    constructor();
}
