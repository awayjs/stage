/**********************************************************************************************************************************************************************************************************
 * This file contains a reference to all the classes used in the project.
 ********************************************************************************************************************************************************************************************************
 *
 * The TypeScript compiler exports classes in a non deterministic manner, as the extend functionality copies the prototype chain
 * of one object onto another during initialisation and load (to create extensible functionality), the non deterministic nature of the
 * compiler can result in an extend operation referencing a class that is undefined and not yet loaded - which throw an JavaScript error.
 *
 * This file provides the compiler with a strict order in which to export the TypeScript classes to mitigate undefined extend errors
 *
 * @see https://typescript.codeplex.com/workitem/1356 @see https://typescript.codeplex.com/workitem/913
 *
 *********************************************************************************************************************************************************************************************************/

///<reference path="../../libs/ref/js.d.ts"/>
///<reference path="../../libs/awayjs-core.next.d.ts"/>

///<reference path="../aglsl/Sampler.ts"/>
///<reference path="../aglsl/Token.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/OpLUT.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/Description.ts"/>
///<reference path="../aglsl/Destination.ts"/>
///<reference path="../aglsl/ContextGL.ts"/>
///<reference path="../aglsl/Mapping.ts"/>
///<reference path="../aglsl/assembler/OpCode.ts"/>
///<reference path="../aglsl/assembler/OpcodeMap.ts"/>
///<reference path="../aglsl/assembler/Part.ts"/>
///<reference path="../aglsl/assembler/RegMap.ts"/>
///<reference path="../aglsl/assembler/SamplerMap.ts"/>
///<reference path="../aglsl/assembler/AGALMiniAssembler.ts"/>
///<reference path="../aglsl/AGALTokenizer.ts"/>
///<reference path="../aglsl/Parser.ts"/>
///<reference path="../aglsl/AGLSLCompiler.ts"/>

///<reference path="core/gl/ContextGLClearMask.ts"/>
///<reference path="core/gl/VertexBuffer.ts"/>
///<reference path="core/gl/IndexBuffer.ts"/>
///<reference path="core/gl/Program.ts"/>
///<reference path="core/gl/SamplerState.ts"/>
///<reference path="core/gl/ContextGLTextureFormat.ts"/>
///<reference path="core/gl/TextureBase.ts"/>
///<reference path="core/gl/Texture.ts" />
///<reference path="core/gl/CubeTexture.ts" />
///<reference path="core/gl/ContextGLTriangleFace.ts"/>
///<reference path="core/gl/ContextGLVertexBufferFormat.ts"/>
///<reference path="core/gl/ContextGLProgramType.ts"/>
///<reference path="core/gl/ContextGLBlendFactor.ts"/>
///<reference path="core/gl/ContextGLCompareMode.ts"/>
///<reference path="core/gl/ContextGLMipFilter.ts"/>
///<reference path="core/gl/ContextGLProfile.ts"/>
///<reference path="core/gl/ContextGLStencilAction.ts"/>
///<reference path="core/gl/ContextGLTextureFilter.ts"/>
///<reference path="core/gl/ContextGLWrapMode.ts"/>
///<reference path="core/gl/ContextGL.ts" />
///<reference path="core/gl/AGLSLContextGL.ts" />

///<reference path="core/base/StageGL.ts" />

///<reference path="core/pool/IndexData.ts" />
///<reference path="core/pool/IndexDataPool.ts" />
///<reference path="core/pool/TextureData.ts"/>
///<reference path="core/pool/TextureDataPool.ts"/>
///<reference path="core/pool/VertexData.ts" />
///<reference path="core/pool/VertexDataPool.ts" />

///<reference path="managers/AGALProgramCache.ts"/>
///<reference path="managers/RTTBufferManager.ts"/>
///<reference path="managers/StageGLManager.ts"/>