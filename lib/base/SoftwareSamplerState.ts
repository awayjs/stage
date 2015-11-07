import ContextGLTextureFilter = require("awayjs-stagegl/lib/base/ContextGLTextureFilter");
import ContextGLMipFilter = require("awayjs-stagegl/lib/base/ContextGLMipFilter");
import ContextGLWrapMode = require("awayjs-stagegl/lib/base/ContextGLWrapMode");
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
export = SoftwareSamplerState;