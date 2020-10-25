import { ProjectionBase, Rectangle, Point, ColorTransform } from '@awayjs/core';
import { ContextGLProgramType } from '../../../base/ContextGLProgramType';
import { IContextGL } from '../../../base/IContextGL';
import { Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

const VERTEX = `
precision highp float;
uniform float yflip;
uniform vec4 vc[2];
vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 

varying vec2 vUv;

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * vc[0].zw + vc[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = (va1.xy + vc[1].xy) * vc[1].zw;

    gl_Position = pos;
}

`;

const FRAG = `
precision highp float;
uniform vec4 fc[2];
varying vec2 vUv;

/* AGAL legacy atrib resolver require this names */
uniform sampler2D fs0;

void main() {
	vec4 color = texture2D(fs0, vUv);
	
	if(color.a <= 0.0001) {
		color *= 0.0;
	} else {
		color.rgb /= color.a;
	}
	
	// mult
	color *= clamp(fc[0], 0.0, 1.0);	
	color = color + fc[1];

	color.rgb *= color.a;

    gl_FragColor = color;
}

`;

export class Filter3DCopyPixelTaskWebGL extends Filter3DTaskBaseWebGL {
	private _vertexConstantData: Float32Array;
	private _fragConstantData: Float32Array;

	public rect: Rectangle = new Rectangle();
	public destPoint: Point = new Point();
	public transform: ColorTransform;

	public _inputTextureIndex = 0;
	public _positionIndex = 0;
	public _uvIndex = 1;

	constructor() {
		super();

		this._vertexConstantData = new Float32Array([
			0.0, 0.0, 0.0, 0.0,
			0.0, 0.0, 0.0, 0.0]
		);
		this._fragConstantData = EMPTY_TRANSFORM.slice();
	}

	public get sourceTexture(): Image2D {
		return this._mainInputTexture;
	}

	public set sourceTexture(value: Image2D) {
		this._mainInputTexture = value;
	}

	public getVertexCode(): string {
		return VERTEX;
	}

	public getFragmentCode(): string {
		return FRAG;
	}

	public getMainInputTexture(stage: Stage): Image2D {
		return this._mainInputTexture;
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		const index = 0;//this._positionIndex;
		const vd = this._vertexConstantData;
		const dp = this.destPoint;
		const sr = this.rect;
		const tr = this._target;
		const tex = this._mainInputTexture;

		// mul to vertex
		vd[index + 0] = (2 * dp.x + sr.width) / tr.width - 1;
		vd[index + 1] = (2 * dp.y + sr.height) / tr.height - 1;

		// add to vertex
		vd[index + 2] = sr.width / tr.width;
		vd[index + 3] = sr.height / tr.height;

		// add to uv
		vd[index + 4] = sr.x / sr.width;
		vd[index + 5] = sr.y / sr.height;

		// mul to uv
		vd[index + 6] = sr.width / tex.width;
		vd[index + 7] = sr.height / tex.height;

		let fd = EMPTY_TRANSFORM;

		if (this.transform) {
			fd = this._fragConstantData;
			fd.set(this.transform._rawData);
			for (let i = 0; i < 4; i++) fd[i + 4] /= 255;

			// disable ALPHA offset, because can't allowed in PMA mode
			fd[7] = 0;
		}

		const context: IContextGL = stage.context;

		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, vd);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, fd);

	}

	public deactivate(stage: Stage): void {
	}
}