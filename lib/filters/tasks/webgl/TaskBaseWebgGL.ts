import { TaskBase } from '../TaskBase';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';
import { _Stage_Image2D } from '../../../image';

const VERTEX_DEF = `
precision highp float;
uniform vec4 uTexMatrix[2];

/* AGAL legacy atrib resolver require this names */
attribute vec4 va0; // position

varying vec2 vUv;
void main() {
	vec4 pos = va0;

	pos.xy = pos.xy * uTexMatrix[0].zw + uTexMatrix[0].xy;
	pos.z = pos.z * 2.0 - pos.w;

    gl_Position = pos;

	vUv = clamp((va0.xy * uTexMatrix[1].zw) + uTexMatrix[1].xy, 0., 1.);
}

`;

const FRAG_DEF = `
precision highp float;
uniform sampler2D uSampler0;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(uSampler0, vUv);
    gl_FragColor = color;
}

`;

export class TaskBaseWebGL extends TaskBase {
	_program3D: ProgramWebGL;

	public get name() {
		return this.constructor.name;
	}

	public updateProgram(stage: Stage): void {
		if (this._program3D)
			this._program3D.dispose();

		this._program3D = <ProgramWebGL> stage.context.createProgram();
		this._program3D.name = this.name;

		(<ProgramWebGL> this._program3D).uploadRaw(
			this.getVertexCode(),
			this.getFragmentCode());
		this._program3DInvalid = false;
	}

	public activate(_stage: Stage, _projection: any, _depthTexture: any): void {
		this.computeVertexData();

		this._source.getAbstraction<_Stage_Image2D>(_stage).activate(this.sourceSamplerIndex);
		this._program3D.uploadUniform('uTexMatrix', this._vertexConstantData);
	}

	getVertexCode() {
		return VERTEX_DEF;
	}

	getFragmentCode() {
		return FRAG_DEF;
	}
}