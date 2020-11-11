import { ContextWebGL } from './ContextWebGL';

export class InstancedContextWebGL {
	public static isSupported(gl: WebGLRenderingContext | WebGL2RenderingContext) {
		if (window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext) {
			return true;
		}

		if (gl.getSupportedExtensions().indexOf('ANGLE_instanced_arrays') > -1) {
			return true;
		}

		return false;
	}

	public readonly drawArraysInstanced: (mode: GLenum, first: number, count: number, primcount: number) => void;
	/* eslint-disable-next-line */
	public readonly drawElementsInstanced: (mode: GLenum, count: number, type: GLenum, offset: number, primcount: number) => void;
	public readonly vertexAttribDivisor: (index: number, divisor: number) => void;

	constructor (context: ContextWebGL) {
		const gl = context._gl;

		if (!InstancedContextWebGL.isSupported(gl)) {
			throw '[InstancedContextWebGL] Instanced not supported!';
		}

		if (window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext) {
			this.drawArraysInstanced = gl.drawArraysInstanced.bind(gl);
			this.drawElementsInstanced = gl.drawElementsInstanced.bind(gl);
			this.vertexAttribDivisor = gl.vertexAttribDivisor.bind(gl);
		} else {
			const ext = gl.getExtension('ANGLE_instanced_arrays');

			this.drawArraysInstanced = ext.drawArraysInstancedANGLE.bind(ext);
			this.drawElementsInstanced = ext.drawElementsInstancedANGLE.bind(ext);
			this.vertexAttribDivisor = ext.vertexAttribDivisorANGLE.bind(ext);
		}
	}

}