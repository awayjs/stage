import { ByteArray } from '@awayjs/core';

export interface IProgram
{
	name?: string;
	upload(vertexProgram: ByteArray, fragmentProgram: ByteArray);

	dispose();
}