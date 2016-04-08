import ContextGLTextureFilter from "awayjs-stagegl/lib/base/ContextGLTextureFilter";
import ContextGLMipFilter from "awayjs-stagegl/lib/base/ContextGLMipFilter";
import ContextGLWrapMode from "awayjs-stagegl/lib/base/ContextGLWrapMode";
/**
 * The same as SamplerState, but with strings
 * TODO: replace two similar classes with one
 */
class SoftwareSamplerState{
    public type:string;
    public wrap:string = ContextGLWrapMode.REPEAT;
    public filter:string = ContextGLTextureFilter.LINEAR;
    public mipfilter:string = ContextGLMipFilter.MIPLINEAR;
}
export default SoftwareSamplerState;