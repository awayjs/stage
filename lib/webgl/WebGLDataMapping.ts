export const WEBGL_STRING_MAP = {
	0x8B50: 'FLOAT_VEC2',
	0x8B51: 'FLOAT_VEC3',
	0x8B52: 'FLOAT_VEC4',

	// unused
	/*
	0x8B53: 'INT_VEC2',
	0x8B54: 'INT_VEC3',
	0x8B55: 'INT_VEC4',
	0x8B56: 'BOOL',
	0x8B57: 'BOOL_VEC2',
	0x8B58: 'BOOL_VEC3',
	0x8B59: 'BOOL_VEC4',
	*/
	0x8B5A: 'FLOAT_MAT2',
	0x8B5B: 'FLOAT_MAT3',
	0x8B5C: 'FLOAT_MAT4',
	0x8B5E: 'SAMPLER_2D',
	/*
	0x8B60: 'SAMPLER_CUBE',
	0x1400: 'BYTE',
	0x1401: 'UNSIGNED_BYTE',
	0x1402: 'SHORT',
	0x1403: 'UNSIGNED_SHORT',
	0x1404: 'INT',
	0x1405: 'UNSIGNED_INT',
	*/
	0x1406: 'FLOAT'
};

export const WEBGL_METHOD_MAP: Record<number, {size: number, method: string}> = {
	0x8B50 : {
		size: 2, method: 'uniform2fv'
	},
	0x8B51 : {
		size: 3, method: 'uniform3fv'
	},
	0x8B52 : {
		size: 4, method: 'uniform4fv'
	},

	0x8B5A : {
		size: 4, method: 'uniformMatrix2fv'
	},
	0x8B5B : {
		size: 9, method: 'uniformMatrix3fv'
	},
	0x8B5C : {
		size: 16, method: 'uniformMatrix4fv'
	},
	0x8B5E : {
		size: 1, method: 'uniform1i'
	},
	0x1406: {
		size: 1, method: 'uniform1f'
	},
};