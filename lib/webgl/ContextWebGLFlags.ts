import { Settings } from '../Settings';

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
     * @default 2
     * @deprecated Use Settings.PREF_WEBGL_VERSION
     */

	get PREF_VERSION () {
		return Settings.PREF_WEBGL_VERSION;
	},
	set PREF_VERSION (v: number) {
		Settings.PREF_WEBGL_VERSION = v !== 2 ? 1 : 2;
	},

	/**
     * Preferred  multisample for webgl2 on rendertargets.
     * @deprecated Use Settings.ENABLE_MULTISAMPLE_TEXTURE
     * @default true
     */
	get PREF_MULTISAMPLE() {
		return Settings.ENABLE_MULTISAMPLE_TEXTURE;
	},

	set PREF_MULTISAMPLE(v: boolean) {
		Settings.ENABLE_MULTISAMPLE_TEXTURE = !!v;
	},

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