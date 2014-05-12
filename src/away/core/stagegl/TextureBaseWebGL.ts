///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	export class TextureBaseWebGL
	{

		public textureType:string = "";
		public _gl:WebGLRenderingContext;

		constructor(gl:WebGLRenderingContext)
		{
			this._gl = gl;
		}

		public dispose():void
		{
			throw "Abstract method must be overridden.";
		}

		public get glTexture():WebGLTexture
		{
			throw new away.errors.AbstractMethodError();
		}
	}
}