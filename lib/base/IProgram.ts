import ByteArray					from "awayjs-core/lib/utils/ByteArray";

interface IProgram
{
	upload(vertexProgram:ByteArray, fragmentProgram:ByteArray);

	dispose();
}

export default IProgram;