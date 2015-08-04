import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import AGALTokenizer				= require("awayjs-stagegl/lib/aglsl/AGALTokenizer");
import AGLSLParser					= require("awayjs-stagegl/lib/aglsl/AGLSLParser");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");


class ProgramSoftware implements IProgram
{
    private _vertexShader:Function;
    private _fragmentShader:Function;

    constructor()
    {
    }

    public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray)
    {
    }

    public dispose()
    {
    }
}

export = ProgramSoftware;