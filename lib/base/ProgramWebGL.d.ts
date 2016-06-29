import { ByteArray } from "@awayjs/core/lib/utils/ByteArray";
import { IProgram } from "../base/IProgram";
export declare class ProgramWebGL implements IProgram {
    private static _tokenizer;
    private static _aglslParser;
    private static _uniformLocationNameDictionary;
    private _gl;
    private _program;
    private _vertexShader;
    private _fragmentShader;
    private _uniforms;
    private _attribs;
    constructor(gl: WebGLRenderingContext);
    upload(vertexProgram: ByteArray, fragmentProgram: ByteArray): void;
    getUniformLocation(programType: number, index?: number): WebGLUniformLocation;
    getAttribLocation(index: number): number;
    dispose(): void;
    focusProgram(): void;
    readonly glProgram: WebGLProgram;
}
