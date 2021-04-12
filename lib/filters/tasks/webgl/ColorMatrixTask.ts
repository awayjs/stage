import { ProjectionBase, ColorTransform } from '@awayjs/core';
import { Image2D } from '../../../image/Image2D';
import { TaskBaseWebGL } from './TaskBaseWebgGL';
import { Stage } from '../../../Stage';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);
const EMPTY_MATRIX = new Float32Array([
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
	// offsets
	0, 0, 0, 0
]);

const TRANSFORM_PART = `
uniform vec4 uTransformData[2];

vec4 transform(vec4 color) {
	if (color.a > 0.0) {
		color.rgb /= color.a;
	}
	color *= clamp(uTransformData[0], 0.0, 1.0);	
	color += uTransformData[1];

	color.rgb *= color.a;
	retunr color;
}
`;

const MATRIX_PART = `
uniform vec4 uTransformData[5];

vec4 transform(vec4 color) {
	if (color.a > 0.0) {
		color.rgb /= color.a;
	}

	vec4 ret = uTransformData[4];
	ret.r += dot(color, uTransformData[0]);
	ret.g += dot(color, uTransformData[1]);
	ret.b += dot(color, uTransformData[2]);
	ret.a += dot(color, uTransformData[3]);

	ret = clamp(ret, 0., 1.);
	ret.rgb *= ret.a;
	
	return ret;
}
`;

const FRAG = (mode: '' | 'transform' | 'matrix') =>`
precision highp float;
uniform sampler2D fs0;

varying vec2 vUv;

${ mode === 'transform'
		? TRANSFORM_PART
		: mode === 'matrix'
			? MATRIX_PART : ''
}
void main() {
	vec4 color = texture2D(fs0, vUv);

    gl_FragColor = ${ mode ? 'transform(color)' : 'color'};
}`;

export class ColorMatrixTask extends TaskBaseWebGL {
	readonly activateInternaly = false;

	protected _vertexConstantData: Float32Array;

	private _fragData: Float32Array;
	private _dataChanged: boolean = false;
	private _transform: ColorTransform;
	private _matrix: number[];

	private _mode: '' | 'transform' | 'matrix' = '';

	public get transform(): ColorTransform {
		return this._transform;
	}

	public set transform(value: ColorTransform) {
		if (this._transform === value && !value) {
			return;
		}

		this._transform = value;
		this._dataChanged = true;

		if (!this._fragData || this._fragData.length !== 8) {
			this._fragData = new Float32Array(8);
		}

		if (value) {
			this._fragData.set(value._rawData);

			for (let i = 4; i < 8; i++) {
				this._fragData[i] /= 0xff;
			}

			// disable ALPHA offset, because can't allowed in PMA mode
			this._fragData[7] = 0;
		} else {
			this._fragData.set(EMPTY_TRANSFORM);
		}

		const mode = value ? 'transform' : '';

		if (this._mode !== mode) {
			this._mode = mode;
			this.invalidateProgram();
		}
	}

	public set matrix(value: number[] | null) {
		this._matrix = value;

		if (!this._fragData || this._fragData.length !== 20) {
			this._fragData = new Float32Array(20);
		}

		if (value) {
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					this._fragData[i + j * 4] = value[i + i * 4];
				}
			}

			//for (let i = 16; i < 20; i++)
			//	this._fragData[i] = value[i * 4 + 5] / 0xff;

		} else {
			this._fragData.set(EMPTY_MATRIX);
		}

		const mode = value ? 'matrix' : '';

		if (this._mode !== mode) {
			this._mode = mode;
			this.invalidateProgram();
		}
	}

	public get matrix() {
		return this._matrix;
	}

	public _focusId = -1;

	public get name() {
		return 'CopyPixel:' + this._mode;
	}

	public getFragmentCode(): string {
		return FRAG(this._mode);
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();

		const prog = this._program3D;

		prog.uploadUniform('uTexMatrix', this._vertexConstantData);

		// upload only when a transfrom a REAL changed or after shader rebound
		if (this._mode && (this._dataChanged || prog.focusId !== this._focusId)) {
			prog.uploadUniform('uTransformData', this._fragData);
		}

		this._focusId = prog.focusId;
		this._dataChanged = false;
	}
}