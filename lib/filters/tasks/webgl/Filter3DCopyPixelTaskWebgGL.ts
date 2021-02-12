import { ProjectionBase, Rectangle, Point, ColorTransform } from '@awayjs/core';
import { Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

const VERTEX = `
precision highp float;
uniform vec4 uTexMatrix[2];
vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 

varying vec2 vUv;

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * uTexMatrix[0].zw + uTexMatrix[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = (va1.xy + uTexMatrix[1].xy) * uTexMatrix[1].zw;

    gl_Position = pos;
}

`;

const FRAG = `
precision highp float;
uniform vec4 uColorTransform[2];
varying vec2 vUv;

/* AGAL legacy attrib resolver require this names */
uniform sampler2D fs0;

void main() {
	vec4 color = texture2D(fs0, vUv);

	if (color.a > 0.0) {
		color.rgb /= color.a;
	}

	// mult
	color *= clamp(uColorTransform[0], 0.0, 1.0);	
	color += uColorTransform[1];

	color.rgb *= color.a;

    gl_FragColor = color;
}`;

export class Filter3DCopyPixelTaskWebGL extends Filter3DTaskBaseWebGL {
	readonly activateInternaly = false;

	private _vertexConstantData: Float32Array;
	private _colorTransformUData: Float32Array;

	public rect: Rectangle = new Rectangle();
	public destPoint: Point = new Point();

	private _transformChanged: boolean = false;
	private _transform: ColorTransform;
	public get transform(): ColorTransform {
		return this._transform;
	}

	public set transform(value: ColorTransform) {
		if (this._transform === value && !value) {
			return;
		}

		this._transform = value;
		this._transformChanged = true;

		if (!value) {
			this._colorTransformUData.set(EMPTY_TRANSFORM);
		} else {
			const fd = this._colorTransformUData;

			fd.set(this.transform._rawData);

			for (let i = 0; i < 4; i++) {
				fd[i + 4] /= 255;
			}

			// disable ALPHA offset, because can't allowed in PMA mode
			fd[7] = 0;
		}
	}

	public _inputTextureIndex = 0;
	public _positionIndex = 0;
	public _uvIndex = 1;

	public _focusId = -1;

	constructor() {
		super();

		this._vertexConstantData = new Float32Array([
			0.0, 0.0, 0.0, 0.0,
			0.0, 0.0, 0.0, 0.0]
		);
		this._colorTransformUData = EMPTY_TRANSFORM.slice();
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

	public getMainInputTexture(_stage: Stage): Image2D {
		return this._mainInputTexture;
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
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

		const p = <ProgramWebGL> this._program3D;
		// const ctx = (<ContextWebGL> _stage.context)._texContext;

		p.uploadUniform('uTexMatrix', vd);

		// upload only when a transfrom a REAL changed or after shader rebound
		if (this._transformChanged || p.focusId !== this._focusId) {
			this._focusId = p.focusId;
			this._transformChanged = false;

			p.uploadUniform('uColorTransform', this._colorTransformUData);
		}

		//p.uploadUniform('uTex', ctx.setTextureAt(0, ))
		/*
		const context: IContextGL = stage.context;

		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, vd);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, fd);
		*/
	}

	public deactivate(stage: Stage): void {
	}
}