import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

interface IProgram
{
	upload(vertexProgram:ByteArray, fragmentProgram:ByteArray);

	dispose();
}

export = IProgram;