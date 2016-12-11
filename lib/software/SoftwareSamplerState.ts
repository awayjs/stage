import {ContextGLTextureFilter} from "../base/ContextGLTextureFilter";
import {ContextGLMipFilter} from "../base/ContextGLMipFilter";
import {ContextGLWrapMode} from "../base/ContextGLWrapMode";

/**
 * The same as SamplerState, but with strings
 * TODO: replace two similar classes with one
 */
export class SoftwareSamplerState
{
	public type:string;
	public wrap:ContextGLWrapMode = ContextGLWrapMode.REPEAT;
	public filter:ContextGLTextureFilter = ContextGLTextureFilter.LINEAR;
	public mipfilter:ContextGLMipFilter = ContextGLMipFilter.MIPLINEAR;
}
export default SoftwareSamplerState;