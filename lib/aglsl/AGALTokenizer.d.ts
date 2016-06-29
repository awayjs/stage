import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { Description } from "../aglsl/Description";
export declare class AGALTokenizer {
    constructor();
    decribeAGALByteArray(bytes: ByteArray): Description;
    readReg(s: any, mh: any, desc: any, bytes: any): void;
}
