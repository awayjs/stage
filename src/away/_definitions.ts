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
///<reference path="../../libs/swfobject.d.ts"/>

///<reference path="../aglsl/Sampler.ts"/>
///<reference path="../aglsl/Token.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/OpLUT.ts"/>
///<reference path="../aglsl/Header.ts"/>
///<reference path="../aglsl/Description.ts"/>
///<reference path="../aglsl/Destination.ts"/>
///<reference path="../aglsl/Mapping.ts"/>
///<reference path="../aglsl/assembler/OpCode.ts"/>
///<reference path="../aglsl/assembler/OpcodeMap.ts"/>
///<reference path="../aglsl/assembler/Part.ts"/>
///<reference path="../aglsl/assembler/RegMap.ts"/>
///<reference path="../aglsl/assembler/SamplerMap.ts"/>
///<reference path="../aglsl/assembler/AGALMiniAssembler.ts"/>
///<reference path="../aglsl/AGALTokenizer.ts"/>
///<reference path="../aglsl/Parser.ts"/>

///<reference path="events/AnimatorEvent.ts"/>
///<reference path="events/ShadingMethodEvent.ts"/>

///<reference path="errors/AnimationSetError.ts"/>

///<reference path="core/pool/RenderableBase.ts" />
///<reference path="core/pool/BillboardRenderable.ts" />
///<reference path="core/pool/IndexData.ts" />
///<reference path="core/pool/IndexDataPool.ts" />
///<reference path="core/pool/LineSubMeshRenderable.ts" />
///<reference path="core/pool/ProgramData.ts"/>
///<reference path="core/pool/ProgramDataPool.ts"/>
///<reference path="core/pool/SkyBoxRenderable.ts" />
///<reference path="core/pool/ShaderObjectData.ts"/>
///<reference path="core/pool/ShaderObjectDataPool.ts"/>
///<reference path="core/pool/TextureData.ts"/>
///<reference path="core/pool/TextureDataPool.ts"/>
///<reference path="core/pool/TriangleSubMeshRenderable.ts" />
///<reference path="core/pool/VertexData.ts" />
///<reference path="core/pool/VertexDataPool.ts" />

///<reference path="core/stagegl/ContextGLBase.ts"/>
///<reference path="core/stagegl/ContextGLClearMask.ts"/>
///<reference path="core/stagegl/ContextGLTextureFormat.ts"/>
///<reference path="core/stagegl/ContextGLTriangleFace.ts"/>
///<reference path="core/stagegl/ContextGLVertexBufferFormat.ts"/>
///<reference path="core/stagegl/ContextGLProgramType.ts"/>
///<reference path="core/stagegl/ContextGLBlendFactor.ts"/>
///<reference path="core/stagegl/ContextGLCompareMode.ts"/>
///<reference path="core/stagegl/ContextGLMipFilter.ts"/>
///<reference path="core/stagegl/ContextGLProfile.ts"/>
///<reference path="core/stagegl/ContextGLStencilAction.ts"/>
///<reference path="core/stagegl/ContextGLTextureFilter.ts"/>
///<reference path="core/stagegl/ContextGLWrapMode.ts"/>
///<reference path="core/stagegl/ContextStage3D.ts" />
///<reference path="core/stagegl/ContextWebGL.ts" />
///<reference path="core/stagegl/ResourceBaseFlash.ts"/>
///<reference path="core/stagegl/TextureBaseWebGL.ts"/>
///<reference path="core/stagegl/CubeTextureFlash.ts" />
///<reference path="core/stagegl/CubeTextureWebGL.ts" />
///<reference path="core/stagegl/IContextStageGL.ts" />
///<reference path="core/stagegl/ICubeTexture.ts" />
///<reference path="core/stagegl/IIndexBuffer.ts"/>
///<reference path="core/stagegl/IndexBufferFlash.ts"/>
///<reference path="core/stagegl/IndexBufferWebGL.ts"/>
///<reference path="core/stagegl/IProgram.ts"/>
///<reference path="core/stagegl/ITexture.ts" />
///<reference path="core/stagegl/ITextureBase.ts"/>
///<reference path="core/stagegl/IVertexBuffer.ts"/>
///<reference path="core/stagegl/OpCodes.ts"/>
///<reference path="core/stagegl/ProgramFlash.ts"/>
///<reference path="core/stagegl/ProgramWebGL.ts"/>
///<reference path="core/stagegl/SamplerState.ts"/>
///<reference path="core/stagegl/TextureFlash.ts" />
///<reference path="core/stagegl/TextureWebGL.ts" />
///<reference path="core/stagegl/VertexBufferFlash.ts"/>
///<reference path="core/stagegl/VertexBufferWebGL.ts"/>

///<reference path="managers/AGALProgramCache.ts"/>
///<reference path="managers/RTTBufferManager.ts"/>

///<reference path="materials/compilation/ShaderObjectBase.ts"/>
///<reference path="materials/compilation/ShaderLightingObject.ts"/>
///<reference path="materials/compilation/MethodVO.ts"/>
///<reference path="materials/compilation/RegisterPool.ts"/>
///<reference path="materials/compilation/ShaderRegisterCache.ts"/>
///<reference path="materials/compilation/ShaderRegisterElement.ts"/>
///<reference path="materials/compilation/ShaderCompilerBase.ts"/>
///<reference path="materials/compilation/ShaderLightingCompiler.ts"/>
///<reference path="materials/compilation/ShaderRegisterCache.ts"/>
///<reference path="materials/compilation/ShaderRegisterData.ts"/>
///<reference path="materials/compilation/ShaderRegisterElement.ts"/>
///<reference path="materials/methods/ShadingMethodBase.ts"/>
///<reference path="materials/methods/LightingMethodBase.ts"/>
///<reference path="materials/methods/AmbientBasicMethod.ts"/>
///<reference path="materials/methods/DiffuseBasicMethod.ts"/>
///<reference path="materials/methods/EffectMethodBase.ts"/>
///<reference path="materials/methods/EffectColorTransformMethod.ts"/>
///<reference path="materials/methods/NormalBasicMethod.ts"/>
///<reference path="materials/methods/ShadowMapMethodBase.ts"/>
///<reference path="materials/methods/ShadowMethodBase.ts"/>
///<reference path="materials/methods/ShadowHardMethod.ts"/>
///<reference path="materials/methods/SpecularBasicMethod.ts"/>
///<reference path="materials/passes/MaterialPassBase.ts"/>
///<reference path="materials/passes/IMaterialPassStageGL.ts"/>
///<reference path="materials/passes/ILightingPassStageGL.ts"/>
///<reference path="materials/passes/MaterialPassVO.ts"/>
///<reference path="materials/passes/DepthMapPass.ts"/>
///<reference path="materials/passes/DistanceMapPass.ts"/>
///<reference path="materials/passes/LineBasicPass.ts"/>
///<reference path="materials/passes/SkyBoxPass.ts"/>
///<reference path="materials/passes/TrianglePassBase.ts"/>
///<reference path="materials/passes/TriangleBasicPass.ts"/>
///<reference path="materials/passes/MaterialPassMode.ts"/>
///<reference path="materials/passes/TriangleMethodPass.ts"/>
///<reference path="materials/DepthMaterialBase.ts"/>
///<reference path="materials/LineBasicMaterial.ts"/>
///<reference path="materials/SkyBoxMaterial.ts"/>
///<reference path="materials/TriangleBasicMaterial.ts"/>
///<reference path="materials/TriangleMaterialMode.ts"/>
///<reference path="materials/TriangleMethodMaterial.ts"/>
///<reference path="materials/utils/DefaultMaterialManager.ts"/>
///<reference path="materials/utils/ShaderCompilerHelper.ts"/>


///<reference path="core/render/RendererBase.ts" />
///<reference path="core/render/DefaultRenderer.ts" />
///<reference path="core/render/DepthRenderer.ts" />
///<reference path="core/render/Filter3DRenderer.ts" />

///<reference path="animators/data/AnimationRegisterCache.ts" />
///<reference path="animators/states/IAnimationState.ts" />
///<reference path="animators/AnimationSetBase.ts" />
///<reference path="animators/AnimatorBase.ts" />

///<reference path="filters/tasks/Filter3DTaskBase.ts"/>
///<reference path="filters/Filter3DBase.ts"/>