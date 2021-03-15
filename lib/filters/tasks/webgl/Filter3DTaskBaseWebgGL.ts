import { Filter3DTaskBase } from '../Filter3DTaskBase';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';

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

	vUv = clamp(va0.xy * uTexMatrix[1].zw + uTexMatrix[1].xy, 0., 1.);
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
	public updateProgram(stage: Stage): void {
		if (this._program3D)
			this._program3D.dispose();

		this._program3D = stage.context.createProgram();
		this._registerCache.reset();

		this._program3D.name = (<any> this.constructor).name;
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