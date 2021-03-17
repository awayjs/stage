import { Point, ProjectionBase } from '@awayjs/core';
import { Image2D, _Stage_Image2D } from '../../image/Image2D';
import { Stage } from '../../Stage';
import { FilterUtils } from '../../utils/FilterUtils';
import { TaskBaseWebGL } from './webgl/TaskBaseWebgGL';

const FRAG = ({ compX = 0, compY = 1, mode = 'wrap' }) => `
precision highp float;

// source
uniform sampler2D fs0;
// map
uniform sampler2D fs1;
uniform vec2 uMapPoint;
uniform vec2 uScale;
${mode === 'color' ? 'uniform vec4 uColor;' : ''}

varying vec2 vUv;
void main() {
	vec4 map = texture2D(fs1, vUv - uMapPoint);
	vec2 offset = vec2(map[${compX | 0}] - 0.5, map[${compY | 0}] - 0.5) * uScale; 

	vec2 uv = vUv + offset;

	${!mode || mode === 'wrap' ? 'uv = fract(uv);' : ''}
	${mode === 'clamp' ? 'uv = clamp(uv, 0., 1.);' : ''}
	${mode === 'ignore' ? 'uv = vUv;' : ''}
	${mode === 'color' ? 'float outside = step(0.5, length(uv - vec(0.5)));' : ''}

	${mode === 'color'
		? 'gl_FragColor = mix(texture2D(fs0, uv), uColor, outside);'
		: 'gl_FragColor = texture2D(fs0, uv);'}
}

`;

export class DisplacementTask extends TaskBaseWebGL {
	public mapBitmap: Image2D;
	public mode: 'wrap' | 'clamp' | 'color' | 'ignore' = 'wrap';
	public componentX: 1 | 2 | 4 | 8 = 1;
	public componentY: 1 | 2 | 4 | 8 = 2;
	public mapPoint: Point = new Point(0,0);

	private _uColor = [0,0,0,0];

	private _color: number = 0x0;
	public get color(): number {
		return this._color;
	}

	public set color(value: number) {
		if (this._color === value)
			return;

		this._color = value;
		FilterUtils.colorToArray(
			this._color,
			this._alpha,
			this._uColor
		);
	}

	private _alpha: number = 0x0;
	public get alpha(): number {
		return this._alpha;
	}

	public set alpha(value: number) {
		if (this._alpha === value)
			return;

		this._alpha = value;
		this._uColor[3] = this._alpha;
	}

	public scaleX: number = 1;
	public scaleY: number = 1;

	public get name() {
		return `Displacement:${this.mode}:${this.componentX}:${this.componentY}`;
	}

	public getFragmentCode() {
		return FRAG({
			compX: Math.log2(this.componentX),
			compY: Math.log2(this.componentY),
			mode: this.mode
		});
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();

		const input = this.inputRect;
		const map = this.mapBitmap;

		const p = this._program3D;

		p.uploadUniform('uTexMatrix', this._vertexConstantData);
		p.uploadUniform('uScale', [
			this.scaleX / input.width,
			this.scaleY / input.height
		]);
		p.uploadUniform('uMapPoint', [
			this.mapPoint.x / this.mapBitmap.width,
			this.mapPoint.y / this.mapBitmap.height
		]);

		if (this.mode === 'color') {
			p.uploadUniform('uColor', this._uColor);
		}

		this.mapBitmap.getAbstraction<_Stage_Image2D>(_stage).activate(1);
	}
}