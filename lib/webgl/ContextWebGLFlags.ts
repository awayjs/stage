
export const enum ContextWebGLVersion {
	WEBGL = 1,
	WEBGL2 = 2
}

export const enum ContextWebGLPreference {
	/**
     * Not allowed
     */
	NONE = 0,
	/**
     * For POT and nPOT textures
     */
	ALL_TEXTURES = 1,
	/**
     * Only for POT textures or WebGl2
    */
	POT_TEXTURES = 2,
}

export const ContextWebGLFlags = {
	/**
     * Preferred  WebGL version for rendering
     * @default WEBGL2
     */
	PREF_VERSION: ContextWebGLVersion.WEBGL2,
	/**
     * Preferred  multisample for webgl2 on rendertargets.
     * @default true
     */
	PREF_MULTISAMPLE: true,
	/**
     * Preferred mipmaps for textures
     * @default ALL
     */
	PREF_MIPMAP: ContextWebGLPreference.ALL_TEXTURES,
	/**
     * Preferred repeate wrapping for all type of textures, on webg1 will throw a warn for nPOT textures
     * ContextWebGLPreference.POT_TEXTURES will allow only for POT textures on WebGL1
     * @default ALL_TEXTURES
     */
	PREF_REPEAT_WRAP: ContextWebGLPreference.ALL_TEXTURES
};