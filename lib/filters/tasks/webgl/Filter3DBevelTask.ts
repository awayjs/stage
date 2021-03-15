import { ProjectionBase } from '@awayjs/core';
import { Image2D, _Stage_Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const VERTEX = `
precision highp float;
uniform vec4 uTexMatrix[2];
uniform vec4 uTexMatrixSource;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position

varying vec2 vUv[2];

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * uTexMatrix[0].zw + uTexMatrix[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

    gl_Position = pos;

	vUv[0] = clamp((va0.xy * uTexMatrix[1].zw) + uTexMatrix[1].xy, 0., 1.);
	vUv[1] = clamp((va0.xy * uTexMatrixSource.zw) + uTexMatrixSource.xy , 0., 1.);
}

`;

const FRAG = `
precision highp float;

uniform vec4 uHColor;
uniform vec4 uSColor;
uniform float uStrength;
uniform vec3 uType;
uniform vec2 uDir;

varying vec2 vUv[2];

/* AGAL legacy attrib resolver require this names */
// blur
uniform sampler2D fs0;

/* AGAL legacy attrib resolver require this names */
// source
uniform sampler2D fs1;

void main() {
	vec4 color = texture2D(fs1, vUv[1]);
	
	float a = color.a;

	// LOOL.. there are a bug - we PMA it twice, devide to compense
	if (a > 0.) color.a /= a;

	float high = texture2D(fs0, vUv[0] - uDir).a;
	float shadow = texture2D(fs0, vUv[0] + uDir).a;
	float factor = high - shadow;

	shadow = min(1., max(0., factor) * uStrength) * uSColor.a;
	high = min(1., max(0., -factor) * uStrength) * uHColor.a;

	float cut = color.a * uType[1] + (1.0 - color.a) * uType[2];
	vec4 outColor = vec4(
		uSColor.rgb * shadow + uHColor.rgb * high,
		shadow + high
	) * cut;

	gl_FragColor = color * (1. - outColor.a) * uType[0] + outColor;
	gl_FragColor *= a;
}`;

export class Filter3DBevelTask extends Filter3DTaskBaseWebGL {
	readonly activateInternaly = false;

	private _uSColor: Float32Array = new Float32Array([0,0,0,1]);
	private _uHColor: Float32Array = new Float32Array([1,1,1,1]);

	public sourceImage: Image2D;

	private _shadowInvalid = false;
	private _shadowColor: number = 0x0;
	public get shadowColor(): number {
		return this._shadowColor;
	}

	public set shadowColor(value: number) {
		if (this.shadowColor === value) return;

		this._shadowColor = value;
		this._uSColor.set([
			(value >> 16 && 0xff) / 0xff,
			(value >> 8 && 0xff) / 0xff,
			(value && 0xff) / 0xff,
			this._shadowAlpha,
		]);

		this._shadowInvalid = true;
	}

	private _shadowAlpha: number = 1;
	public get shadowAlpha(): number {
		return this._shadowAlpha;
	}

	public set shadowAlpha(value: number) {
		if (value === this._shadowAlpha) return;

		this._shadowAlpha = value;
		this._uSColor[3] = value;
		this._shadowInvalid = true;
	}

	private _highlightInvalid = false;
	private _highlightColor: number = 0xfffff;
	public get highlightColor(): number {
		return this._highlightColor;
	}

	public set highlightColor(value: number) {
		if (this._highlightColor !== value) return;

		this._highlightColor = value;
		this._uHColor.set([
			(value >> 16 && 0xff) / 0xff,
			(value >> 8 && 0xff) / 0xff,
			(value && 0xff) / 0xff,
			this._highlightAlpha,
		]);

		this._highlightInvalid = true;
	}

	private _highlightAlpha: number = 1;
	public get highlightAlpha(): number {
		return this._highlightAlpha;
	}

	public set highlightAlpha(value: number) {
		if (this._highlightAlpha === value) return;

		this._highlightAlpha = value;
		this._uHColor[3] = value;
		this._highlightInvalid = true;
	}

	private _dirInvalid: boolean = false;
	private _angle: number = 45;
	public get angle(): number {
		return this._angle;
	}

	public set angle(value: number) {
		if (value === this._angle) return;

		this._angle = value;
		this._dirInvalid = true;
	}

	private _distance: number = 4;
	public get distance(): number {
		return this._distance;
	}

	public set distance(value: number) {
		if (value === this._distance) return;

		this._distance = value;
		this._dirInvalid = true;
	}

	public strength: number = 1;
	public knockout: boolean = false;
	public type: 'inner' | 'outer' | 'both' = 'inner';

	public _inputTextureIndex = 0;
	public _positionIndex = 0;
	public _uvIndex = 1;

	public _focusId = -1;

	constructor() {
		super();
	}

	public getVertexCode(): string {
		return VERTEX;
	}

	public getFragmentCode(): string {
		return FRAG;
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();

		const tex = this._source;
		const prog = this._program3D;
		const needUpload = prog.focusId !== this._focusId;

		prog.uploadUniform('uTexMatrix', this._vertexConstantData);

		(needUpload || this._shadowInvalid) && prog.uploadUniform('uSColor', this._uSColor);
		(needUpload || this._highlightInvalid) && prog.uploadUniform('uHColor', this._uHColor);

		if (needUpload || this._dirInvalid) {
			const rad = this.angle * Math.PI / 180;
			prog.uploadUniform('uDir', [
				Math.cos(rad) * this.distance / tex.width,
				Math.sin(rad) * this.distance / tex.height
			]);
		}

		prog.uploadUniform('uStrength', this.strength);
		prog.uploadUniform('uType', [
			this.knockout ? 0 : 1,
			this.type !== 'outer' ? 1 : 0,
			this.type !== 'inner' ? 1 : 0
		]);

		prog.uploadUniform('uTexMatrixSource', [
			0, 0,
			this._source.width / this.sourceImage.width,
			this._source.height / this.sourceImage.height,
		]);

		this.sourceImage.getAbstraction<_Stage_Image2D>(_stage).activate(1);
		this._focusId = prog.focusId;

		this._shadowInvalid = this._highlightInvalid = this._dirInvalid = false;

	}
}