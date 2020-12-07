export interface IStageSettings {
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
}

export const Settings: IStageSettings = {
	/**
	 * @description Enable weak reference for track when adatpee is remove by GC
	 * and trigering a dispose
	 */
	ENABLE_WEAK_REF: true,

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
	ENABLE_TEXTURE_POOLING: true,

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
	 */
	ENABLE_BUFFER_POOLING: true,

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
};

// console.debug('[Stage settings]', Settings);
