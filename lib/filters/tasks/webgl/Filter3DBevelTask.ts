import { ProjectionBase, Rectangle, Point } from '@awayjs/core';
import { Image2D, _Stage_Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const VERTEX = `
precision highp float;

uniform vec4 uTexMatrix[2];
uniform vec2 uDir;

vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 

varying vec2 vUv[3];

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * uTexMatrix[0].zw + uTexMatrix[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv[0] = (va1.xy + uTexMatrix[1].xy) * uTexMatrix[1].zw;
	vUv[1] = vUv[0] - uDir;//, 0., 1.);
	vUv[2] = vUv[0] + uDir;//, 0., 1.);

    gl_Position = pos;
}

`;

const FRAG = `
precision highp float;

uniform vec4 uHColor;
uniform vec4 uSColor;
uniform float uStrength;
uniform vec3 uType;

varying vec2 vUv[3];

/* AGAL legacy attrib resolver require this names */
// blur
uniform sampler2D fs0;

/* AGAL legacy attrib resolver require this names */
// source
uniform sampler2D fs1;

void main() {
	vec4 color = texture2D(fs1, vUv[0]);
	
	float a = color.a;

	// LOOL.. there are a bug - we PMA it twice, devide to compense
	if (a > 0.) color.a /= a;

	float high = texture2D(fs0, vUv[1]).a;
	float shadow = texture2D(fs0, vUv[2]).a;
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

	private _uMatrix: Float32Array = new Float32Array([0,0,0,0,0,0,0,0]);
	private _uSColor: Float32Array = new Float32Array([0,0,0,1]);
	private _uHColor: Float32Array = new Float32Array([1,1,1,1]);

	public rect: Rectangle = new Rectangle();
	public destPoint: Point = new Point();

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
		const index = 0;//this._positionIndex;
		const vd = this._uMatrix;
		const dp = this.destPoint;
		const sr = this.rect;
		const tr = this._target;
		const tex = this._mainInputTexture;

		// add to vertex
		vd[index + 0] = 0;//(2 * dp.x + sr.width) / tr.width - 1;
		vd[index + 1] = 0;//(2 * dp.y + sr.height) / tr.height - 1;

		// mull to vertex
		vd[index + 2] = 1;//sr.width / tr.width;
		vd[index + 3] = 1;//sr.height / tr.height;

		// add to uv
		vd[index + 4] = 0;//sr.x / sr.width;
		vd[index + 5] = 0;//sr.y / sr.height;

		// mul to uv
		vd[index + 6] = 1;//sr.width / tex.width;
		vd[index + 7] = 1;//sr.height / tex.height;

		const p = <ProgramWebGL> this._program3D;

		const needUpload = p.focusId !== this._focusId;

		p.uploadUniform('uTexMatrix', vd);

		(needUpload || this._shadowInvalid) && p.uploadUniform('uSColor', this._uSColor);
		(needUpload || this._highlightInvalid) && p.uploadUniform('uHColor', this._uHColor);

		if (needUpload || this._dirInvalid) {
			const rad = this.angle * Math.PI / 180;
			p.uploadUniform('uDir', [
				Math.cos(rad) * this.distance / tex.width,
				Math.sin(rad) * this.distance / tex.height
			]);
		}

		p.uploadUniform('uStrength', this.strength);
		p.uploadUniform('uType', [
			this.knockout ? 0 : 1,
			this.type !== 'outer' ? 1 : 0,
			this.type !== 'inner' ? 1 : 0
		]);

		this.sourceImage.getAbstraction<_Stage_Image2D>(_stage).activate(1);
		this._focusId = p.focusId;

		this._shadowInvalid = this._highlightInvalid = this._dirInvalid = false;

	}

	public deactivate(stage: Stage): void {
	}
}