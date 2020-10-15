export class GLESConnector {
	private static _gles: any=null;

	public static get gles(): any {
		if (!GLESConnector._gles) throw ('Error: Set GlesConnector.gles before calling methods on ContextGLES!');
		return GLESConnector._gles;
	}

	public static set gles(value: any) {
		GLESConnector._gles = value;
	}
}