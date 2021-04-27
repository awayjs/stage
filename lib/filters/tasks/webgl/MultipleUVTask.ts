import { TaskBaseWebGL } from './TaskBaseWebgGL';

const UV_BLOCKS = (count = 1) => Array.from({ length: count }, (_, i) => {
	return `vUv[${i}] = clamp((aPos.xy * uTexMatrix[${i}].zw) + uTexMatrix[${i}].xy, 0., 1.);`;
}).join('\n');

const VERTEX = (uvCount = 1) => `
precision highp float;
uniform vec4 uPosMatrix;
uniform vec4 uTexMatrix[${uvCount}];

/* AGAL legacy atribb resolver MUST reolver this as va0 */
attribute vec4 aPos; // position

varying vec2 vUv[${uvCount}];

void main() {
	vec4 pos = aPos;

	pos.xy = pos.xy * uPosMatrix.zw + uPosMatrix.xy;
	pos.z = pos.z * 2.0 - pos.w;

    gl_Position = pos;
	${UV_BLOCKS(uvCount)}
}

`;

export class MultipleUVTask extends TaskBaseWebGL {
	private readonly _dataBuffer: Float32Array;
	private readonly _uvMatricesBuffer: Float32Array;

	public readonly posMatrix: Float32Array;
	public readonly uvMatrices: Float32Array[] = [];

	constructor(private _uvBlocks = 1) {
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
		return VERTEX(this._uvBlocks);
	}

	public uploadVertexData() {
		this.computeVertexData();
		this._program3D.uploadUniform('uPosMatrix', this.posMatrix);
		this._program3D.uploadUniform('uTexMatrix', this._uvMatricesBuffer);
	}
}