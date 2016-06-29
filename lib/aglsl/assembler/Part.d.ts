import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
export declare class Part {
    name: string;
    version: number;
    data: ByteArray;
    constructor(name?: string, version?: number);
}
