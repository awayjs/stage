export interface IStageSettings {
	ENABLE_WEAK_REF: boolean;
	ENABLE_UNLOAD_BITMAP: boolean;
	ENABLE_UNLOAD_TEXTURE: boolean;
	ENABLE_TEXTURE_POOLING: boolean;
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
	 * @description Enable UnloadManager for unloading unused Textures
	 */
	ENABLE_UNLOAD_TEXTURE: true,

	/**
	 * @description Enable texture pooling to prevent a recreation
	 */
	ENABLE_TEXTURE_POOLING: true,
};