export enum ContextGLClearMask
{
	COLOR = 1,
	DEPTH = 2,
	STENCIL = 4,
	ALL = ContextGLClearMask.COLOR | ContextGLClearMask.DEPTH | ContextGLClearMask.STENCIL
}