import { ProjectionBase, Rectangle, Point, ColorTransform } from '@awayjs/core';
import { ContextGLProgramType } from '../../../base/ContextGLProgramType';
import { ContextGLVertexBufferFormat } from '../../../base/ContextGLVertexBufferFormat';
import { IVertexBuffer } from '../../../base/IVertexBuffer';
import { BitmapImage2D } from '../../../image/BitmapImage2D';
import { Image2D } from '../../../image/Image2D';
import { _Stage_ImageBase } from '../../../image/ImageBase';
import { Settings } from '../../../Settings';
import { Stage } from '../../../Stage';
import { ContextWebGL } from '../../../webgl/ContextWebGL';
import { Filter3DTaskBaseWebGL } from './Filter3DTaskBaseWebgGL';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

const VERTEX_INST = (samples = 1) => `
precision highp float;
vec4 vt0;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // uv 
attribute vec4 va2; // position matrix
attribute vec4 va3; // uv matrix
attribute float va4; // samplerId

${ samples > 1 ? 'varying float vSamplerId;' : ''}

varying vec2 vUv;

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * va2.zw + va2.xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = (va1.xy + va3.xy) * va3.zw;

${ samples > 1 ? 'vSamplerId = va4;' : ''}

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

varying vec2 vUv;

void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * vc[0].zw + vc[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = (va1.xy + vc[1].xy) * vc[1].zw;

    gl_Position = pos;
}

`;

function getSamplesU(samples = 1) {
	if (samples === 1) {
		return 'uniform sampler2D fs0;\n';
	}

	return Array.from({ length: samples }, (_, i) => {
		return `uniform sampler2D fs${i};`;
	}).join('\n');
}

function getSamplesS(samples = 1) {
	if (samples === 1) {
		return '\t color = texture2D(fs0, vUv);';
	}

	let s = '';
	for (let i = 0; i < samples; i++) {
		s += `\tif(vSamplerId < ${0.5 + i}) { color = texture2D(fs${i}, vUv); }\n`;
		if (i !== samples - 1) {
			s += ' else ';
		}
	}

	return s;
}

const FRAG = (samples = 1) => `
precision highp float;
uniform vec4 fc[2];
varying vec2 vUv;

${ samples > 1 ? 'varying float vSamplerId;' : ''}

/* AGAL legacy attrib resolver require this names */
${getSamplesU(samples)}

void main() {
	vec4 color;

${getSamplesS(samples)}

	if (color.a > 0.0) {
		color.rgb /= color.a;
	}

	// mult
	color *= clamp(fc[0], 0.0, 1.0);	
	color += fc[1];

	color.rgb *= color.a;

    gl_FragColor = color;
}`;

const MAX_SAMPLERS = ContextWebGL.MAX_SAMPLERS;
const FRAME_SIZE = 9;

export class Filter3DCopyPixelTaskWebGL extends Filter3DTaskBaseWebGL {
	private _instancingData: Float32Array;
	private _vertexConstantData: Float32Array;
	private _fragConstantData: Float32Array;
	private _instancingBuffer: IVertexBuffer;
	private _boundedImages: _Stage_ImageBase[] = [];

	public rect: Rectangle = new Rectangle();
	public destPoint: Point = new Point();
	public transform: ColorTransform;

	public _inputTextureIndex = 0;
	public _positionIndex = 0;
	public _uvIndex = 1;

	private _lastRenderIsInstanced = false;
	private _instancedFrames: number = 0;

	public readonly supportInstancing = Settings.ALLOW_INSTANCED_COPY;

	constructor() {
		super();

		this._vertexConstantData = new Float32Array([
			0.0, 0.0, 0.0, 0.0,
			0.0, 0.0, 0.0, 0.0]
		);
		this._fragConstantData = EMPTY_TRANSFORM.slice();
	}

	public get requireFlush() {
		return this._isInstancedRender
			&& this._boundedImages.length >= MAX_SAMPLERS;
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

		return this._isInstancedRender
			? VERTEX_INST(MAX_SAMPLERS)
			: VERTEX;
	}

	public getFragmentCode(): string {
		return FRAG(this._isInstancedRender ? MAX_SAMPLERS : 1);
	}

	public getMainInputTexture(stage: Stage): Image2D {
		return this._mainInputTexture;
	}

	public activate(stage: Stage, projection: ProjectionBase, depthTexture: Image2D): void {
		const isInstanced = this._isInstancedRender;
		const dp = this.destPoint;
		const sr = this.rect;
		const tr = this._target;
		const tex = this._mainInputTexture;

		let vd = isInstanced
			? this._instancingData
			: this._vertexConstantData;
		const framesCount = this._instancedFrames;
		const dataIndex = isInstanced
			? framesCount * FRAME_SIZE
			: 0;

		if (isInstanced && (!vd || vd.length < dataIndex + FRAME_SIZE)) {
			const newData = new Float32Array(dataIndex + FRAME_SIZE);

			vd && newData.set(vd);
			vd = this._instancingData = newData;
		}

		// mul to vertex
		vd[dataIndex + 0] = (2 * dp.x + sr.width) / tr.width - 1;
		vd[dataIndex + 1] = (2 * dp.y + sr.height) / tr.height - 1;

		// add to vertex
		vd[dataIndex + 2] = sr.width / tr.width;
		vd[dataIndex + 3] = sr.height / tr.height;

		// add to uv
		vd[dataIndex + 4] = sr.x / sr.width;
		vd[dataIndex + 5] = sr.y / sr.height;

		// mul to uv
		vd[dataIndex + 6] = sr.width / tex.width;
		vd[dataIndex + 7] = sr.height / tex.height;

		if (isInstanced) {
			const images = this._boundedImages;
			if (this._mainInputTexture instanceof BitmapImage2D) {
				// otherwith it can drop render
				this._mainInputTexture.unmarkToUnload();
			}

			const image = <_Stage_ImageBase> stage.getAbstraction(this._mainInputTexture);

			let index = images.indexOf(image);

			if (index === -1) {
				index = images.length;
				images.push(image);
			}

			// sampler index
			vd[dataIndex + 8] = index;

			this._instancedFrames++;
			return;
		}

		if (this.transform) {
			const fd = this._fragConstantData;
			fd.set(this.transform._rawData);
			for (let i = 0; i < 4; i++) fd[i + 4] /= 255;

			// disable ALPHA offset, because can't allowed in PMA mode
			fd[7] = 0;
		} else {
			this._fragConstantData.set(EMPTY_TRANSFORM);
		}

		super.activate(stage, projection, depthTexture);
	}

	public _updateBuffersInternal() {
		const needUpdate = this._needUpdateBuffers;

		super._updateBuffersInternal();

		if (!this._isInstancedRender || !needUpdate) {
			return;
		}

		const BPE = Float32Array.BYTES_PER_ELEMENT;

		if (!this._instancingBuffer) {
			this._instancingBuffer = this.context.createVertexBuffer(6, FRAME_SIZE * BPE);
		}

		// need call, otherwise divider willn't applied
		(<ContextWebGL> this.context).beginInstancing(1);

		// matrix position
		this.context.setVertexBufferAt(
			2, this._instancingBuffer, 0, ContextGLVertexBufferFormat.FLOAT_4);

		// matix uv
		this.context.setVertexBufferAt(
			3, this._instancingBuffer,  BPE * 4, ContextGLVertexBufferFormat.FLOAT_4);

		// matix uv
		this.context.setVertexBufferAt(
			4, this._instancingBuffer,  BPE * 8, ContextGLVertexBufferFormat.FLOAT_1);
	}

	public flush(count: number = this._instancedFrames) {
		this._updateBuffersInternal();

		const context = this.context;

		if (!this._isInstancedRender) {
			context.setProgramConstantsFromArray(
				ContextGLProgramType.VERTEX,
				this._vertexConstantData);

		} else {
			(<ContextWebGL> context).beginInstancing(count);

			// bind image late
			for (let i = 0; i < this._boundedImages.length; i++) {
				this._boundedImages[i].activate(i, this._defaultSample);
			}

			this._instancingBuffer.uploadFromArray(this._instancingData, 0, 0);
		}

		this._lastRenderIsInstanced = this._isInstancedRender;
		this._boundedImages.length = 0;
		this._instancedFrames = 0;

		context.setProgramConstantsFromArray(
			ContextGLProgramType.FRAGMENT,
			this._fragConstantData);

		super.flush(count);
	}

	public deactivate(stage: Stage): void {
	}
}