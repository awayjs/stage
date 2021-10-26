import { ProjectionBase, ColorTransform } from '@awayjs/core';
import { _Stage_Image2D, Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { MultipleUVTask } from './MultipleUVTask';
import { COMPOSITE_PART, supportComposition } from './CompositionParts';

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

	color.rgb *= clamp(color.a, 0., 1.);
	return color;
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

const FRAG = (mode: '' | 'transform' | 'matrix', composite: string) =>`
precision highp float;
uniform sampler2D fs0;

varying vec2 vUv[2];

${ mode === 'transform'
		? TRANSFORM_PART
		: mode === 'matrix'
			? MATRIX_PART : ''
}

${ composite
		? COMPOSITE_PART(composite)
		: ''
}

void main() {
	vec4 color = texture2D(fs0, vUv[0]);
	color = ${mode ? 'transform(color)' : 'color'};	
    gl_FragColor = ${composite ? 'composite(color)' : 'color'};
}`;

export class ColorMatrixTask extends MultipleUVTask {
	protected _vertexConstantData: Float32Array;

	private _fragData: Float32Array;
	private _dataChanged: boolean = false;
	private _transform: ColorTransform;
	private _matrix: number[];
	private _composite: string = '';

	public back: Image2D;

	private _mode: '' | 'transform' | 'matrix' = '';

	constructor() {
		super(2, false);
	}

	public setCompositeBlend(blend: string): boolean {
		const old = this._composite;

		this._composite = null;
		this.back = null;

		if (supportComposition(blend)) {
			this._composite = blend;
		}

		if (this._composite !== old) {
			this.invalidateProgram();
		}

		return this._composite !== null;
	}

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

			// disable positive ALPHA offset, because can't allowed in PMA mode
			if (this._fragData[7] > 0)
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
					// we should get 4 of 5, because matrix store data as
					// mulR, mulG, mulB, mulA, offsetR
					this._fragData[j + i * 4] = value[j + i * 5];
				}

				// pack offsets to latest vector
				this._fragData[16 + i] = value[4 + i * 5] / 0xff;
			}

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
		return 'CopyFilter:' + this._mode + ',c:' + this._composite;
	}

	public getFragmentCode(): string {
		return FRAG(this._mode, this._composite);
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		const prog = this._program3D;

		// upload only when a transform a REAL changed or after shader rebound
		if (this._mode && (this._dataChanged || prog.focusId !== this._focusId)) {
			prog.uploadUniform('uTransformData', this._fragData);
		}

		this._focusId = prog.focusId;
		this._dataChanged = false;

		this
			.source
			.getAbstraction<_Stage_Image2D>(_stage)
			.activate(0);

		if (this._composite && this.back) {

			const sx = this.inputRect.width / this.back.width;
			const sy = this.inputRect.height / this.back.height;

			this.uvMatrices[1].set([
				0,0,
				sx, sy
			], 0);

			this
				.back
				.getAbstraction<_Stage_Image2D>(_stage)
				.activate(1);
		}

		this.uploadVertexData();
	}
}