import { TaskBaseWebGL } from './TaskBaseWebgGL';

const UV_BLOCKS = (count = 1, limits = false) => Array.from({ length: count }, (_, i) => {
	let res = `vUv[${i}] = aPos.xy * uTexMatrix[${i}].zw + uTexMatrix[${i}].xy;`;

	if (limits) {
		// our aPos should be 0 to 1
		// eslint-disable-next-line max-len
		res += `\nvUvLim[${i}] = vec4(uTexMatrix[${i}].xy, uTexMatrix[${i}].zw + uTexMatrix[${i}].xy);`;
	}

	return res;
}).join('\n');

const VERTEX = (uvCount = 1, limits = false) => `
precision highp float;
uniform vec4 uPosMatrix;
uniform vec4 uTexMatrix[${uvCount}];

/* AGAL legacy atribb resolver MUST reolver this as va0 */
attribute vec4 aPos; // position

varying vec2 vUv[${uvCount}];
${ limits ? `varying vec4 vUvLim[${uvCount}];` : '' }

void main() {
	vec4 pos = aPos;

	pos.xy = pos.xy * uPosMatrix.zw + uPosMatrix.xy;
	pos.z = pos.z * 2.0 - pos.w;

    gl_Position = pos;
	${UV_BLOCKS(uvCount, limits)}
}

`;

export class MultipleUVTask extends TaskBaseWebGL {
	private readonly _dataBuffer: Float32Array;
	private readonly _uvMatricesBuffer: Float32Array;

	public readonly posMatrix: Float32Array;
	public readonly uvMatrices: Float32Array[] = [];

	/**
	 * Generate vertex shader with multiple UV input
	 * @param _uvBlocks Count of UVs used in project
	 * @param _limits Generate vUvLim that represent bounds of UV
	 */
	constructor(
		private _uvBlocks = 1,
		private  _limits = false
	) {
		super(false);

		this._dataBuffer = new Float32Array(_uvBlocks * 4 + 4);

		this.posMatrix = this._dataBuffer.subarray(0, 4);

		// replace buffer, legacy
		// this is VIEW, posMatrix and uvMatrix reference to value from one
		this._vertexConstantData = this._dataBuffer.subarray(0, 8);
		// store composit matrix buffer
		this._uvMatricesBuffer = this._dataBuffer.subarray(4, 4 + 4 * _uvBlocks);

		for (let i = 0; i < _uvBlocks; i++) {
			this.uvMatrices[i] = this._uvMatricesBuffer.subarray(
				i * 4,
				(i + 1) * 4
			);
		}
	}

	public getVertexCode() {
		return VERTEX(this._uvBlocks, this._limits);
	}

	public uploadVertexData() {
		this.computeVertexData();
		this._program3D.uploadUniform('uPosMatrix', this.posMatrix);
		this._program3D.uploadUniform('uTexMatrix', this._uvMatricesBuffer);
	}
}