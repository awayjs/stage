
export const enum ContextWebGLVersion {
    WEBGL = 1,
    WEBGL2 = 2
}

export const enum ContextWebGLPreference {
    // not allowed
    NONE = 0,
    // for POT and nPOT textures or on WebGL2
    ALL = 1,
    // only for POT
    POT = 2,
}

export const ContextWebGLFlags = {
    // preferred  WebGL version for rendering
    PREF_VERSION: ContextWebGLVersion.WEBGL2,
    // preferred  multisample for webgl2 on rendertargets. 
    PREF_MULTISAMPLE: true,
    // allow mipmaps for all textures
    PREF_MIPMAP: ContextWebGLPreference.ALL,
    // preferred repeate wrapping for all type of textures, on webg1 will throw a warn for nPOT textures
    // ContextWebGLPreference.POT will allow only for POT textures on WebGL1
    PREF_REPEAT_WRAP: ContextWebGLPreference.ALL
}