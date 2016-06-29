export declare class TextureBaseWebGL {
    textureType: string;
    _gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext);
    dispose(): void;
    readonly glTexture: WebGLTexture;
}
