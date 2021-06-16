import { _Stage_ImageBase, BlendMode, Image2D } from '../image';
import { Rectangle } from '@awayjs/core';
import { Stage } from '../Stage';
import { FilterManager } from '../managers/FilterManager';
import { ContextGLVertexBufferFormat } from '../base/ContextGLVertexBufferFormat';
import { ContextWebGL } from '../webgl/ContextWebGL';
import { VertexBufferWebGL } from '../webgl/VertexBufferWebGL';
import { VaoWebGL } from '../webgl/VaoWebGL';
import { ProgramWebGL } from '../webgl/ProgramWebGL';
import { ContextGLBlendFactor as BF } from '../base/ContextGLBlendFactor';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLDrawMode } from '../base/ContextGLDrawMode';

export  interface ICopyTask {
	from: Rectangle;
	to: Rectangle;
	source: Image2D;
	samplerID: number;
}

const VERTEX = `
precision highp float;

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position
attribute vec4 va1; // posMatrix
attribute vec4 va2; // uvMatrix
attribute float va3; // SamplerId

varying vec2 vUv;
varying float vId;

void main() {
	vec4 pos = va0;
	
	pos.xy = pos.xy * va1.zw + va1.xy;
	pos.z = pos.z * 2.0 - pos.w;

	vUv = va0.xy * va2.zw + va2.xy;
	vId = va3;
	gl_Position = pos;
}`;

function emitSamplerBlocks (count: number) {

	const blocks: string[] = [];

	for (let i = 0; i < count; i++) {
		if (i === 0) {
			blocks.push(
				`	if (vId < ${(i + 0.5).toFixed(1)})
						gl_FragColor = texture2D(uTex[${i | 0}], vUv);
				`);
		} else {
			blocks.push(
				`	else if (vId < ${(i + 0.5).toFixed(1)})
						gl_FragColor = texture2D(uTex[${i | 0}], vUv);
				`);
		}
	}

	blocks.push('	else gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);');

	return blocks.join('\n');
}

const FRAG = (samplers = 1) => `
precision highp float;
uniform sampler2D uTex[${samplers}];

varying vec2 vUv;
varying float vId;

void main() {
	${emitSamplerBlocks(samplers)}
}`;

const DEFAULT_BLEND_MAP = {
	[''] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.NORMAL] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.LAYER] : [BF.ONE, BF.ONE_MINUS_SOURCE_ALPHA],
	[BlendMode.ERASE] : [BF.ZERO, BF.ONE_MINUS_SOURCE_ALPHA],
};

export class CopyFilterInstanced {
	public static  DATA_COUNT = 9; // 4 - posMatrix, 4 - texMatrix, 1 - texId
	public static SAMPLERS_LIMIT = 16;
	public static TASKS_LIMIT = 100;

	private _samplerIds: number[] = Array.from({ length: CopyFilterInstanced.SAMPLERS_LIMIT }, e => 0);
	private _prog: ProgramWebGL;
	private _instanceBuffer: VertexBufferWebGL;
	private _vertexBuffer: VertexBufferWebGL;
	private _vao: VaoWebGL;

	private _instanceData: Float32Array = new Float32Array(
		CopyFilterInstanced.TASKS_LIMIT * CopyFilterInstanced.DATA_COUNT);

	private _instanceView: Float32Array = this._instanceData;
	private _target: Image2D;
	private _copyTasks: ICopyTask[] = [];
	private _images: Array<Image2D> = [];
	private _stage: Stage;
	private _manager: FilterManager;

	private _blendDst: BF = BF.ONE_MINUS_SOURCE_ALPHA;
	private _blendSrc: BF = BF.ONE;

	public get blendDst() {
		return this._blendDst;
	}

	public get blendSrc() {
		return this._blendSrc;
	}

	private _requireBlend = true;
	public get requireBlend() {
		return this._requireBlend;
	}

	public set requireBlend(v: boolean) {
		if (!this._requireBlend && v) {
			this.blend = '';
		}

		this._requireBlend = v;
	}

	protected _blend: string = '';
	public set blend(v: string) {
		const map = DEFAULT_BLEND_MAP[v];

		this._requireBlend = !!map;

		if (map) {
			this._blendDst = map[1];
			this._blendSrc = map[0];
		} else {
			// go composite by shader
		}
	}

	public get blend() {
		return this._blend;
	}

	private _mustBeFlushed: boolean = false;
	public get mustBeFlushed() {
		return this._mustBeFlushed;
	}

	constructor(manager: FilterManager) {
		this._manager = manager;
		this._stage = manager.stage;
	}

	public get prog() {
		if (!this._prog) {
			this._prog = <ProgramWebGL> this._stage.context.createProgram();
			this._prog.name = 'CopyShaderInstanced:' + CopyFilterInstanced.SAMPLERS_LIMIT;
			this._prog.uploadRaw(VERTEX, FRAG(CopyFilterInstanced.SAMPLERS_LIMIT));
		}

		return this._prog;
	}

	public get length() {
		return this._copyTasks.length;
	}

	public set target (image: Image2D) {
		this._target = image;
	}

	public get target() {
		return this._target;
	}

	public addCopyTask (from: Rectangle, to: Rectangle, source: Image2D) {

		let samplerID = this._images.indexOf(source);

		if (samplerID === -1) {
			samplerID = this._images.length;
			this._images.push(source);
		}

		this._copyTasks.push({
			from: from.clone(),
			to: to.clone(),
			source: source,
			samplerID: samplerID
		});

		if (this._images.length === CopyFilterInstanced.SAMPLERS_LIMIT ||
			this._copyTasks.length === CopyFilterInstanced.TASKS_LIMIT) {
			this._mustBeFlushed = true;
			//this.flush();
		}
	}

	private fillInstancesBuffer(offset: number, task: ICopyTask) {
		const data = this._instanceView;
		const dest = task.to;
		const input = task.from;
		const target = this._target;
		const source = task.source;

		if (dest.width * dest.height === 0) {
			dest.width = input.width;
			dest.height = input.height;
		}

		offset *= 9;
		// pos = scale * pos + offset
		// pos in viewport MUST be -1 - 0, for this we multiple at 2 and decrease 1

		// pos offset (-1, 1)
		data[0 + offset] = 2. * dest.x / target.width - 1;
		data[1 + offset] = 2. * dest.y / target.height - 1;

		// pos scale
		data[2 + offset] = 2. * dest.width / target.width;
		data[3 + offset] = 2. * dest.height / target.height;

		// uv already from 0,1, not require remap it
		// uv offset
		data[4 + offset] = input.x / source.width;
		data[5 + offset] = input.y / source.height;

		// uv scale
		data[6 + offset] = input.width / source.width;
		data[7 + offset] = input.height / source.height;

		// sampler
		data[8 + offset] = task.samplerID;
	}

	private activateElements() {
		const context = < ContextWebGL> this._stage.context;

		if (!this._vertexBuffer) {
			this._vertexBuffer = context.createVertexBuffer(6, 8);
			this._vertexBuffer.uploadFromArray(
				new Float32Array([
					0, 0,
					1, 1,
					1, 0,
					0, 0,
					0, 1,
					1, 1
				]), 0, 6);

			this._instanceBuffer = context.createVertexBuffer(
				CopyFilterInstanced.TASKS_LIMIT,
				CopyFilterInstanced.DATA_COUNT * 4
			);

			this._instanceBuffer.initAsDynamic(CopyFilterInstanced.TASKS_LIMIT);
			this._instanceBuffer.instanced = true;
			this._instanceBuffer.dynamic = true;
		}

		if (!this._vao) {
			this._vao = context.hasVao ? context.createVao() : null;
			this._vao && this._vao.bind();

			// pos
			context.setVertexBufferAt(0, this._vertexBuffer, 0, ContextGLVertexBufferFormat.FLOAT_2);
			// instancing
			// posMatrix
			context.setVertexBufferAt(1, this._instanceBuffer, 0, ContextGLVertexBufferFormat.FLOAT_4);
			// uvMatrix
			context.setVertexBufferAt(2, this._instanceBuffer, 4 * 4, ContextGLVertexBufferFormat.FLOAT_4);
			// samplerId
			context.setVertexBufferAt(3, this._instanceBuffer, 4 * 4 * 2, ContextGLVertexBufferFormat.FLOAT_1);

		} else {
			this._vao.bind();
		}

		this._instanceBuffer.uploadFromArray(this._instanceView);
	}

	private deactivateElements() {
		this._vao && this._vao.unbind();
	}

	private prepareTask() {
		const tasks = this._copyTasks;
		const len = tasks.length;

		if (len !== this._instanceView.length / 9) {
			// create new VIEW to fill sub data
			this._instanceView = new Float32Array(this._instanceData.buffer,0, 9 * len);
		}

		// Fill instanced buffer data
		for (let i = 0; i < len; i++) {
			this.fillInstancesBuffer(i, tasks[i]);
		}

		const images = this._images;
		const imLen = images.length;
		// Bind textures to slots
		for (let i = 0; i < imLen; i++) {
			images[i].getAbstraction<_Stage_ImageBase>(this._stage).activate(i);
			this._samplerIds[i] = i;
		}

		this._prog.uploadUniform('uTex', this._samplerIds);
	}

	public flush() {
		if (this._copyTasks.length === 0) {
			return;
		}

		const stage = this._stage;
		const context = <ContextWebGL> stage.context;

		// now we run instanced renderer until `drawVertices`
		context.beginInstancedRender(this._copyTasks.length);
		stage.setRenderTarget(
			this._target,
			false,
			0,
			0,
			true
		);
		context.setBlendFactors(this._blendSrc, this._blendDst);
		context.setBlendState(!!this.requireBlend);
		context.setCulling(ContextGLTriangleFace.NONE);
		//context.disableDepth();
		//context.disableStencil();

		context.setProgram(this.prog);

		this.prepareTask();
		this.activateElements();

		// run instanced
		context.drawVertices(ContextGLDrawMode.TRIANGLES, 0, 6);

		this.deactivateElements();
		this._target = null;
		this._mustBeFlushed = false;
		this._images.length = 0;
		this._copyTasks.length = 0;
	}
}