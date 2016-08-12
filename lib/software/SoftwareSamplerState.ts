import {ContextGLTextureFilter}		from "../base/ContextGLTextureFilter";
import {ContextGLMipFilter}			from "../base/ContextGLMipFilter";
import {ContextGLWrapMode}			from "../base/ContextGLWrapMode";

/**
 * The same as SamplerState, but with strings
 * TODO: replace two similar classes with one
 */
export class SoftwareSamplerState
{
	public type:string;
	public wrap:string = ContextGLWrapMode.REPEAT;
	public filter:string = ContextGLTextureFilter.LINEAR;
	public mipfilter:string = ContextGLMipFilter.MIPLINEAR;
}
export default SoftwareSamplerState;