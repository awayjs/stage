import { Filter3DTaskBase } from '../Filter3DTaskBase';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';

const VERTEX_DEF = `
precision highp float;
uniform float yflip;
attribute vec4 aPosition;
attribute vec4 aUv;

varying vec4 vUv;

void main() {
	vUv = aUv;
	vec4 pos = aPosition;
	pos.z = pos.z * 2.0 - pos.w;
	gl_Position = pos;
}
`;

const FRAG_DEF = `
precision highp float;
uniform vec4 fc[2];
uniform sampler2D uSampler0;
varying vec4 vUv;

void main() {
    vec4 color = texture2D(uSampler0, vUv.xy);
    gl_FragColor = color;
}

`;

export class Filter3DTaskBaseWebGL extends Filter3DTaskBase {
	public name: string = '';

	public updateProgram(stage: Stage): void {
		if (this._program3D)
			this._program3D.dispose();

		this._program3D = stage.context.createProgram();
		this._registerCache.reset();

		this._program3D.name = this.name || (<any> this.constructor).name;
		(<ProgramWebGL> this._program3D).uploadRaw(
			this.getVertexCode(),
			this.getFragmentCode());
		this._program3DInvalid = false;
	}

	getVertexCode() {
		return VERTEX_DEF;
	}

	getFragmentCode() {
		return FRAG_DEF;
	}
}