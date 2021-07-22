import { Image2D, _Stage_Image2D } from '../../../image';
import { Stage } from '../../../Stage';
import { FilterUtils } from '../../../utils/FilterUtils';
import { MultipleUVTask } from './MultipleUVTask';

const FRAG_DEF = `
precision highp float;

uniform sampler2D uBlur;
uniform sampler2D uSource;
uniform vec4 uColor;
// strength, inner, not knokout, not hideObject
uniform vec4 uProps;
uniform vec2 uDir;

varying vec2 vUv[2];

void main() {
    vec4 color = uColor;

    float outer = 1. - uProps[1];
    float inner = uProps[1];
	float shadow = texture2D(uBlur, vUv[0] + uDir).a;	

	vec4 main = texture2D(uSource, vUv[1]);

	// mask inner by main
	shadow = outer * shadow + (1. - shadow) * inner * main.a;

	color.a = clamp(color.a * shadow * uProps[0], 0., 1.);
	color.rgb *= color.a;

	if (uProps[3] > 0.0) {
		vec4 composite = main * uProps[2];

		color = 
			outer * (composite + (1. - main.a) * color) + 
			inner * (composite * (1. - color.a) + color);
	}
	
	gl_FragColor = color;
}`;
export class DropShadowTask extends MultipleUVTask {
	public sourceImage: Image2D;
	private _uColor: Float32Array = new Float32Array([0,0,0,0]);
	// strength, inner, knokout, composite
	private _uProps: Float32Array = new Float32Array([1, 0, 1, 1]);
	private _uDir: Float32Array = new Float32Array([0, 0]);

	public set strength(v: number) {
		this._uProps[0] = v;
	}

	public get strength() {
		return this._uProps[0];
	}

	public set inner(v: boolean) {
		this._uProps[1] = v ? 1 : 0;
	}

	public get inner() {
		return !!this._uProps[1];
	}

	public set knockout(v: boolean) {
		// invert for reduce invert in shader
		this._uProps[2] = v ? 0 : 1;
	}

	public get knockout() {
		return !this._uProps[2];
	}

	public set hideObject(v: boolean) {
		this._uProps[3] = v ? 0 : 1;
	}

	public get hideObject() {
		return !this._uProps[3];
	}

	private _color: number = 0x0;
	private _alpha: number = 1;

	public set color(v: number) {
		this._color = v;

		FilterUtils.colorToArray(this._color, this._alpha , this._uColor);
	}

	public get color() {
		return this._color;
	}

	public set alpha(v: number) {
		this._uColor[3] = v;
	}

	public get alpha() {
		return this._uColor[3];
	}

	private _angle: number = 0;
	private _distance: number = 1;

	public set angle(v: number) {
		this._angle = v;
	}

	public get angle() {
		return this._angle;
	}

	public set distance(v: number) {
		this._distance = v;
	}

	public get distance() {
		return this._distance;
	}

	constructor() {
		// blur + source
		super(2);
	}

	get name() {
		return 'DropShadowTask';
	}

	getFragmentCode() {
		return FRAG_DEF;
	}

	public activate(_stage: Stage) {
		const sourceImage = this.sourceImage;
		const inputImage = this._source;

		// UV for source
		this.uvMatrices[1].set([
			0,0,
			this.inputRect.width / sourceImage.width,
			this.inputRect.height / sourceImage.height,
		], 0);

		const rad = Math.PI * this._angle / 180;
		this._uDir[0] = -Math.cos(rad) * this._distance / inputImage.width;
		this._uDir[1] = -Math.sin(rad) * this._distance / inputImage.height;

		inputImage.getAbstraction<_Stage_Image2D>(_stage).activate(0);
		sourceImage.getAbstraction<_Stage_Image2D>(_stage).activate(1);

		// UV for base image should be computed automatically
		// call after compute uvMatrices
		this.uploadVertexData();

		this._program3D.uploadUniform('uColor', this._uColor);
		this._program3D.uploadUniform('uProps', this._uProps);
		this._program3D.uploadUniform('uDir', this._uDir);
	}
}