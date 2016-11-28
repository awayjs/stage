import {ByteArray} from "@awayjs/core";

export interface IProgram
{
	upload(vertexProgram:ByteArray, fragmentProgram:ByteArray);

	dispose();
}