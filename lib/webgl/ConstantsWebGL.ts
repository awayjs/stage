import { ContextGLDrawMode } from '../base/ContextGLDrawMode';
import { ContextGLBlendEquation, ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { ContextGLCompareMode } from '../base/ContextGLCompareMode';
import { ContextGLMipFilter } from '../base/ContextGLMipFilter';
import { ContextGLStencilAction } from '../base/ContextGLStencilAction';
import { ContextGLTextureFilter } from '../base/ContextGLTextureFilter';
import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';
import { ContextGLWrapMode } from '../base/ContextGLWrapMode';

/**
 * AWAYJS to WebGL constants mapping
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
 */

export const TEXTURE = {
	'texture2d':   0x0DE1,// gl.TEXTURE_2D
	'textureCube': 0x8513 // gl.TEXTURE_CUBE_MAP
};

export const WRAP = {
	[ContextGLWrapMode.REPEAT]: 0x2901,// gl.REPEAT,
	[ContextGLWrapMode.CLAMP]:  0x812F // gl.CLAMP_TO_EDGE
};

export const FILTER = {
	[ContextGLTextureFilter.LINEAR]: 0x2601, // gl.LINEAR,
	[ContextGLTextureFilter.NEAREST]:0x2600, // gl.NEAREST
};

export const MIP_FILTER = {
	[ContextGLTextureFilter.LINEAR]: {
		[ContextGLMipFilter.MIPNEAREST]:0x2701, // gl.LINEAR_MIPMAP_NEAREST,
		[ContextGLMipFilter.MIPLINEAR]: 0x2703, // gl.LINEAR_MIPMAP_LINEAR,
		[ContextGLMipFilter.MIPNONE]: 	0x2601  // gl.LINEAR
	},
	[ContextGLTextureFilter.NEAREST]: {
		[ContextGLMipFilter.MIPNEAREST]:0x2700, // gl.NEAREST_MIPMAP_NEAREST,
		[ContextGLMipFilter.MIPLINEAR]: 0x2702, // gl.NEAREST_MIPMAP_LINEAR,
		[ContextGLMipFilter.MIPNONE]:   0x2600  // gl.NEAREST
	}
};

/* eslint-disable */
//setup shortcut dictionaries
const BF = ContextGLBlendFactor;
const BE = ContextGLBlendEquation;

export const BLEND_OP = {
	[BF.ONE]: 0x1, // gl.ONE,
	[BF.DESTINATION_ALPHA]: 0x0304, // gl.DST_ALPHA,
	[BF.DESTINATION_COLOR]: 0x0306, // gl.DST_COLOR,
	[BF.ONE_MINUS_DESTINATION_ALPHA]: 0x0305, // gl.ONE_MINUS_DST_ALPHA,
	[BF.ONE_MINUS_DESTINATION_COLOR]: 0x0307, // gl.ONE_MINUS_DST_COLOR,
	[BF.ONE_MINUS_SOURCE_ALPHA]: 0x0303, // gl.ONE_MINUS_SRC_ALPHA,
	[BF.ONE_MINUS_SOURCE_COLOR]: 0x0301, // gl.ONE_MINUS_SRC_COLOR,
	[BF.SOURCE_ALPHA]: 0x0302, //gl.SRC_ALPHA,
	[BF.SOURCE_COLOR]: 0x0300, // gl.SRC_COLOR,
	[BF.ZERO]: 0x0 // gl.ZERO
};

export const BLEND_EQ = {
	[BE.ADD]: 0x8006,
	[BE.SUBTRACT]: 0x800A,
	[BE.REVERSE_SUBTRACT]: 0x800B,
	[BE.MIN]: 0x8007,
	[BE.MAX]: 0x8008
}

export const DRAW_MODE = {
	[ContextGLDrawMode.LINES]: 0x0001, // gl.LINES,
	[ContextGLDrawMode.TRIANGLES]: 0x0004, //gl.TRIANGLES
};

const CM = ContextGLCompareMode;
export const COMPARE_OP = {
	[CM.ALWAYS]:        0x0207, // gl.ALWAYS,
	[CM.EQUAL]:         0x0202, // gl.EQUAL,
	[CM.GREATER]:       0x0204, // gl.GREATER,
	[CM.GREATER_EQUAL]: 0x0206, // gl.GEQUAL,
	[CM.LESS]:          0x0201, // gl.LESS,
	[CM.LESS_EQUAL]:    0x0203, // gl.LEQUAL,
	[CM.NEVER]:         0x0200, // gl.NEVER,
	[CM.NOT_EQUAL]:     0x0205, // gl.NOTEQUAL
};

const SA = ContextGLStencilAction;
export const STENCIL_ACTION = {
	[SA.KEEP]:               0x1E00, //gl.KEEP,
	[SA.SET]:                0x1E01, //gl.REPLACE,
	[SA.INCREMENT_SATURATE]: 0x1E02, //gl.INCR,
	[SA.DECREMENT_SATURATE]: 0x1E03, // gl.DECR,
	[SA.INVERT]:             0x150A, // gl.INVERT,
	[SA.INCREMENT_WRAP]:     0x8507, // gl.INCR_WRAP,
	[SA.DECREMENT_WRAP]:     0x8508, // gl.DECR_WRAP,
	[SA.ZERO]:                    0, // gl.ZERO
};


export interface IVertexBufferProperties {
	size: number;
	type: number;
	normalized: boolean;
}

class VPropConstructor implements IVertexBufferProperties {
	constructor(
		public size: number,
		public type: number,
		public normalized: boolean
	) {}
}

const enum DATA_TYPE {
	BYTE =           0x1400, // gl.BYTE
	UNSIGNED_BYTE =  0x1401, // gl.UNSIGNED_BYTE
	SHORT =          0x1402, // gl.SHORT
	UNSIGNED_SHORT = 0x1403, // gl.UNSIGNED_SHORT
	FLOAT =          0x1406, // gl.FLOAT
}

const VBF = ContextGLVertexBufferFormat;

export const VERTEX_BUF_PROPS: Record<number, IVertexBufferProperties> = {
	[VBF.FLOAT_1]: new VPropConstructor(1, DATA_TYPE.FLOAT, false),
	[VBF.FLOAT_2]: new VPropConstructor(2, DATA_TYPE.FLOAT, false),
	[VBF.FLOAT_3]: new VPropConstructor(3, DATA_TYPE.FLOAT, false),
	[VBF.FLOAT_4]: new VPropConstructor(4, DATA_TYPE.FLOAT, false),
	[VBF.BYTE_1]: new VPropConstructor(1, DATA_TYPE.BYTE, true),
	[VBF.BYTE_2]: new VPropConstructor(2, DATA_TYPE.BYTE, true),
	[VBF.BYTE_3]: new VPropConstructor(3, DATA_TYPE.BYTE, true),
	[VBF.BYTE_4]: new VPropConstructor(4, DATA_TYPE.BYTE, true),
	[VBF.UNSIGNED_BYTE_1]: new VPropConstructor(1, DATA_TYPE.UNSIGNED_BYTE, true),
	[VBF.UNSIGNED_BYTE_2]: new VPropConstructor(2, DATA_TYPE.UNSIGNED_BYTE, true),
	[VBF.UNSIGNED_BYTE_3]: new VPropConstructor(3, DATA_TYPE.UNSIGNED_BYTE, true),
	[VBF.UNSIGNED_BYTE_4]: new VPropConstructor(4, DATA_TYPE.UNSIGNED_BYTE, true),
	[VBF.SHORT_1]: new VPropConstructor(1, DATA_TYPE.SHORT, false),
	[VBF.SHORT_2]: new VPropConstructor(2, DATA_TYPE.SHORT, false),
	[VBF.SHORT_3]: new VPropConstructor(3, DATA_TYPE.SHORT, false),
	[VBF.SHORT_4]: new VPropConstructor(4, DATA_TYPE.SHORT, false),
	[VBF.UNSIGNED_SHORT_1]: new VPropConstructor(1, DATA_TYPE.UNSIGNED_SHORT, false),
	[VBF.UNSIGNED_SHORT_2]: new VPropConstructor(2, DATA_TYPE.UNSIGNED_SHORT, false),
	[VBF.UNSIGNED_SHORT_3]: new VPropConstructor(3, DATA_TYPE.UNSIGNED_SHORT, false),
	[VBF.UNSIGNED_SHORT_4]: new VPropConstructor(4, DATA_TYPE.UNSIGNED_SHORT, false)
}
