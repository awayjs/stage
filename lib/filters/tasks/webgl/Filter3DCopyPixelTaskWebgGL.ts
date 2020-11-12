import { ProjectionBase, Rectangle, Point, ColorTransform } from '@awayjs/core';
import { ContextGLProgramType } from '../../../base/ContextGLProgramType';
import { ContextGLVertexBufferFormat } from '../../../base/ContextGLVertexBufferFormat';
import { IVertexBuffer } from '../../../base/IVertexBuffer';
import { Image2D } from '../../../image/Image2D';
import { Stage } from '../../../Stage';
import { ContextWebGL } from '../../../webgl/ContextWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

const VERTEX_INST = `
precision highp float;
vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 
attribute vec4 va2; // position matrix
attribute vec4 va3; // uv matrix

varying vec2 vUv;

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * va2.zw + va2.xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = (va1.xy + va3.xy) * va3.zw;

    gl_Position = pos;
}

`;

const VERTEX = `
precision highp float;
uniform vec4 vc[2];
vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 


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

/* AGAL legacy attrib resolver require this names */
uniform sampler2D fs0;

void main() {
	vec4 color = texture2D(fs0, vUv);
	
	if (color.a > 0.0) {
		color.rgb /= color.a;
	}

	// mult
	color *= clamp(fc[0], 0.0, 1.0);	
	color += fc[1];

	color.rgb *= color.a;

    gl_FragColor = color;
}`;

export class Filter3DCopyPixelTaskWebGL extends Filter3DTaskBaseWebGL {
	private _vertexConstantData: Float32Array;
	private _fragConstantData: Float32Array;
	private _instancedBuffer: IVertexBuffer;

	public rect: Rectangle = new Rectangle();
	public destPoint: Point = new Point();
	public transform: ColorTransform;

	public _inputTextureIndex = 0;
	public _positionIndex = 0;
	public _uvIndex = 1;

	private _lastRenderIsInstanced = false;
	private _instancedFrames: Array<{
		buffer: Float32Array, image: Image2D
	}> = [];

	public supportInstancing = true;

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
		if (this._lastRenderIsInstanced !== this._isInstancedRender) {
			this._program3DInvalid = true;
		}

		this.name = this.constructor.name + (this._isInstancedRender  ? '_instanced' : '');

		return this._isInstancedRender ? VERTEX_INST : VERTEX;
	}

	public getFragmentCode(): string {
		return FRAG;
	}

	public getMainInputTexture(stage: Stage): Image2D {
		return this._mainInputTexture;
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		super.activate(stage, projection, depthTexture);

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
		} else {
			this._fragConstantData.set(EMPTY_TRANSFORM);
		}

		if (this._isInstancedRender) {
			this._instancedFrames[this._instancedFrame] = {
				buffer: vd,
				image: this._mainInputTexture
			};

			this._vertexConstantData = new Float32Array(8);
			return;
		}
	}

	public flush(count: number = 1) {
		const context = this.context;

		if (!this._isInstancedRender) {
			context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, this._vertexConstantData);
		} else {
			(<ContextWebGL> context).beginInstancing(count);

			const frames = this._instancedFrames;
			const size = frames.length * frames[0].buffer.length;
			const data = new Float32Array(size);

			for (let i = 0; i < frames.length; i++) {
				data.set(frames[i].buffer, 4 * 2 * i);
			}

			if (!this._instancedBuffer) {
				this._instancedBuffer = context.createVertexBuffer(6, 4 * 2 * Float32Array.BYTES_PER_ELEMENT);
			}

			this.vao && this.vao.bind();

			// SubData not works, good =))
			this._instancedBuffer.uploadFromArray(data, 0, 0);

			// matrix position
			this.context.setVertexBufferAt(
				2, this._instancedBuffer, 0, ContextGLVertexBufferFormat.FLOAT_4);

			// matix uv
			this.context.setVertexBufferAt(
				3, this._instancedBuffer,  Float32Array.BYTES_PER_ELEMENT * 4, ContextGLVertexBufferFormat.FLOAT_4);
		}

		this._lastRenderIsInstanced = this._isInstancedRender;

		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, this._fragConstantData);

		super.flush(count);
	}

	public deactivate(stage: Stage): void {
	}
}