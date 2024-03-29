import { ConfigManager } from '@awayjs/core';

export interface IStageSettings {
	PREF_WEBGL_VERSION: 1 | 2;
	USE_300_SHADERS_FOR_WEBGL2: boolean;
	ENABLE_MULTISAMPLE_TEXTURE: boolean;
	ENABLE_ANTIALIAS: boolean;
	PROFILE_CONTEXT_LOST: boolean;

	ENABLE_WEAK_REF: boolean;
	ENABLE_UNLOAD_BITMAP: boolean;
	ENABLE_UNLOAD_TEXTURE: boolean;
	ENABLE_TEXTURE_POOLING: boolean;
	ENABLE_UNLOAD_BUFFER: boolean;
	ENABLE_BUFFER_POOLING: boolean;

	MAX_BUFFER_POOL_SIZE: number;
	MAX_BUFFER_ALIVE_TIME: number;
	MAX_BITMAP_UNLOAD_TASKS: number;
	MAX_BITMAP_UNLOAD_TASKS_ASYNC: number;

	ENABLE_VAO: boolean;
	ENABLE_UNIFORM_CACHE: boolean;
	ENABLE_ASYNC_READ: boolean;

	ENABLE_PARSER_NATIVE_BITMAP: boolean;

	ENABLE_TEXTURE_REF_CLONE: boolean;

	UNSAFE_USE_AUTOINDEXED_SAMPLER: boolean;

	UNSAFE_USE_AUTOINDEXED_ATTRIBUTES: boolean;

	UNSAFE_USE_SHADER_COMPOSER: boolean;

	USE_NON_NATIVE_BLEND: boolean;
}

export const Settings: IStageSettings = ConfigManager.instance.addStore<any>('stage', {
	/**
	 * @description Prefered WEBGL version, can be used for tracking degradation
	 * @default 2
	 */
	PREF_WEBGL_VERSION: 2,

	/**
	 * @description Use 300 es shaders for AGAL output in webgl2 mode
	 */
	USE_300_SHADERS_FOR_WEBGL2: true,

	/**
	 * @description Allow MSAA RenderTarget in Webgl2 mode
	 * @default true
	 */
	ENABLE_MULTISAMPLE_TEXTURE: true,

	/**
	 * @description Allow use Antialiasing on main (canvas) buffer
	 * @default true
	 */
	ENABLE_ANTIALIAS: true,

	/**
	 * @description Enable weak reference for track when adatpee is remove by GC
	 * and trigering a dispose
	 */
	ENABLE_WEAK_REF: true,

	/**
	* @description Insert Context Lost check command after commands that can potentially drop context
	 */
	PROFILE_CONTEXT_LOST: false,

	/**
	 * @description Enable UnloadManager for unloading unused BitmapImage
	 */
	ENABLE_UNLOAD_BITMAP: true,

	/**
	 * @description How many task can be unloaded per run
	 */
	MAX_BITMAP_UNLOAD_TASKS: 10,

	/**
	 * @description How many task can be unloaded per run when fence is supported.
	 * @see ENABLE_ASYNC_READ
	 */
	MAX_BITMAP_UNLOAD_TASKS_ASYNC: 50,

	/**
	 * @description Enable UnloadManager for unloading unused Textures from pool
	 * @see ENABLE_TEXTURE_POOLING
	 */
	ENABLE_UNLOAD_TEXTURE: true,

	/**
	 * @description Enable texture pooling to prevent a recreation
	 */
	ENABLE_TEXTURE_POOLING: false,

	/**
	 * @description Enable UnloadManager for unloading unused buffers from pool
	 * @see ENABLE_BUFFER_POOLING
	 */
	ENABLE_UNLOAD_BUFFER: true,

	/**
	 * @description Max pool size
	 */
	MAX_BUFFER_POOL_SIZE: 300,

	/**
	 * @description Max allive time of buffer that stored in pool
	 */
	MAX_BUFFER_ALIVE_TIME: 5000,

	/**
	 * @description Enable buffer pooling to prevent a recreation
	 * Bug! Chrome 95+ crashing
	 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1272238&q=webgl&can=1
	 */
	ENABLE_BUFFER_POOLING: false,

	/**
	 * @description Allow use VAO if supported
	 */
	ENABLE_VAO: true,
	/**
	 * @description Allow cache a uniforms
	 */
	ENABLE_UNIFORM_CACHE: false,

	/**
	 * @description Allow async read from texture when unload it from GPU,
	 * used a fenceSync on WebGL2
	 * @see ENABLE_UNLOAD_BITMAP
	 */
	ENABLE_ASYNC_READ: true,

	/**
	 * @description Allow parsing via createImageBitmap on supported platforms
	 */
	ENABLE_PARSER_NATIVE_BITMAP: true,

	/**
	 * @description Allow reference clonnig of BitmapImage2D
	 */
	ENABLE_TEXTURE_REF_CLONE: false,

	/**
	 * @description Use sampler index as index of SAMPLER2D location instead of name.
	 * This means that in shader with SAMPLER2D uniforms `uTex, uTex1` will be like `fs0, fs1`
	 * This required for bound texture by id instead of uniform name on AGAL pipeline
	 */
	UNSAFE_USE_AUTOINDEXED_SAMPLER: true,

	/**
	 * @description Use attribut index as index of any attribute location instead of name.
	 * This means that in shader with atrtributes `aPos, aUV` will be like `va0, va1`
	 * This required for bound attrs by index instead of name on AGAL pipeline
	 */
	UNSAFE_USE_AUTOINDEXED_ATTRIBUTES: true,

	/**
	 * @description use shader implemented blendModes in copyPixel filter pass
	 * when blend mode not supported in regular GL operation
	 * Has problems in some games
	 */
	UNSAFE_USE_SHADER_COMPOSER: true,

	/**
	 * @description Enable use of blendmodes that cannot be achived natively in WebGL,
	 * such as Overlay, Hardlight, Invert etc
	 */
	USE_NON_NATIVE_BLEND: false,
});

// console.debug('[Stage settings]', Settings);
