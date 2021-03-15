import { ProjectionBase, ColorTransform } from '@awayjs/core';
import { Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

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

	protected _vertexConstantData: Float32Array;
	private _colorTransformUData: Float32Array;

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
		this._colorTransformUData = EMPTY_TRANSFORM.slice();
	}

	public get sourceTexture(): Image2D {
		return this._mainInputTexture;
	}

	public set sourceTexture(value: Image2D) {
		this._mainInputTexture = value;
	}

	public getFragmentCode(): string {
		return FRAG;
	}

	public getMainInputTexture(_stage: Stage): Image2D {
		return this._mainInputTexture;
	}

	public activate(_stage: Stage, _projection: ProjectionBase, _depthTexture: Image2D): void {
		super.computeVertexData();

		const p = <ProgramWebGL> this._program3D;
		// const ctx = (<ContextWebGL> _stage.context)._texContext;

		p.uploadUniform('uTexMatrix', this._vertexConstantData);

		// upload only when a transfrom a REAL changed or after shader rebound
		if (this._transformChanged || p.focusId !== this._focusId) {
			this._focusId = p.focusId;
			this._transformChanged = false;

			p.uploadUniform('uColorTransform', this._colorTransformUData);
		}
	}

	public deactivate(stage: Stage): void {
	}
}