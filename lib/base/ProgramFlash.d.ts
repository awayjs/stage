import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { ContextStage3D } from "../base/ContextStage3D";
import { IProgram } from "../base/IProgram";
import { ResourceBaseFlash } from "../base/ResourceBaseFlash";
export declare class ProgramFlash extends ResourceBaseFlash implements IProgram {
    private _context;
    constructor(context: ContextStage3D);
    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): void;
    dispose(): void;
}
