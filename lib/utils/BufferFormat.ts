import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';

export const BUFFER_FORMATS_MAP: Record<number, Array<number>> = {
	[1]: [
		ContextGLVertexBufferFormat.BYTE_1,
		ContextGLVertexBufferFormat.BYTE_2,
		ContextGLVertexBufferFormat.BYTE_3,
		ContextGLVertexBufferFormat.BYTE_4
	],
	[2]: [
		ContextGLVertexBufferFormat.SHORT_1,
		ContextGLVertexBufferFormat.SHORT_2,
		ContextGLVertexBufferFormat.SHORT_3,
		ContextGLVertexBufferFormat.SHORT_4
	],
	[4]: [
		ContextGLVertexBufferFormat.FLOAT_1,
		ContextGLVertexBufferFormat.FLOAT_2,
		ContextGLVertexBufferFormat.FLOAT_3,
		ContextGLVertexBufferFormat.FLOAT_4,
	],
	[5]: [
		ContextGLVertexBufferFormat.UNSIGNED_BYTE_1,
		ContextGLVertexBufferFormat.UNSIGNED_BYTE_2,
		ContextGLVertexBufferFormat.UNSIGNED_BYTE_3,
		ContextGLVertexBufferFormat.UNSIGNED_BYTE_4,
	],
	[6]: [
		ContextGLVertexBufferFormat.UNSIGNED_SHORT_1,
		ContextGLVertexBufferFormat.UNSIGNED_SHORT_2,
		ContextGLVertexBufferFormat.UNSIGNED_SHORT_3,
		ContextGLVertexBufferFormat.UNSIGNED_SHORT_4,
	]
};