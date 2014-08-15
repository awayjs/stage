///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import ByteArray				= away.utils.ByteArray;

	export class ProgramWebGL implements IProgram
	{
		private static _tokenizer:aglsl.AGALTokenizer = new aglsl.AGALTokenizer();
		private static _aglslParser:aglsl.AGLSLParser = new aglsl.AGLSLParser();

		private _gl:WebGLRenderingContext;
		private _program:WebGLProgram;
		private _vertexShader:WebGLShader;
		private _fragmentShader:WebGLShader;

		constructor(gl:WebGLRenderingContext)
		{
			this._gl = gl;
			this._program = this._gl.createProgram();
		}

		public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray)
		{
			var vertexString:string = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(vertexProgram));
			var fragmentString:string = ProgramWebGL._aglslParser.parse(ProgramWebGL._tokenizer.decribeAGALByteArray(fragmentProgram));

			this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
			this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);

			this._gl.shaderSource(this._vertexShader, vertexString);
			this._gl.compileShader(this._vertexShader);

			if (!this._gl.getShaderParameter(this._vertexShader, this._gl.COMPILE_STATUS)) {
				throw new Error(this._gl.getShaderInfoLog(this._vertexShader));
				return;
			}

			this._gl.shaderSource(this._fragmentShader, fragmentString);
			this._gl.compileShader(this._fragmentShader);

			if (!this._gl.getShaderParameter(this._fragmentShader, this._gl.COMPILE_STATUS)) {
				throw new Error(this._gl.getShaderInfoLog(this._fragmentShader));
				return;
			}

			this._gl.attachShader(this._program, this._vertexShader);
			this._gl.attachShader(this._program, this._fragmentShader);
			this._gl.linkProgram(this._program);

			if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
				throw new Error(this._gl.getProgramInfoLog(this._program));
			}
		}

		public dispose()
		{
			this._gl.deleteProgram(this._program);
		}

		public focusProgram()
		{
			this._gl.useProgram(this._program);
		}

		public get glProgram():WebGLProgram
		{
			return this._program;
		}
	}
}