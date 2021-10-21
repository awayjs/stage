console.debug('AwayJS - Stage - 0.11.119');

export { AGALMiniAssembler } from './lib/aglsl/assembler/AGALMiniAssembler';
export { Flags } from './lib/aglsl/assembler/Flags';
export { FS } from './lib/aglsl/assembler/FS';
export { Opcode } from './lib/aglsl/assembler/Opcode';
export { OpcodeMap } from './lib/aglsl/assembler/OpcodeMap';
export { Part } from './lib/aglsl/assembler/Part';
export { RegMap } from './lib/aglsl/assembler/RegMap';
export { Sampler } from './lib/aglsl/assembler/Sampler';
export { SamplerMap } from './lib/aglsl/assembler/SamplerMap';
export { AGALTokenizer } from './lib/aglsl/AGALTokenizer';
export { AGLSLParser } from './lib/aglsl/AGLSLParser';
export { Description } from './lib/aglsl/Description';
export { Destination } from './lib/aglsl/Destination';
export { Header } from './lib/aglsl/Header';
export { Mapping } from './lib/aglsl/Mapping';
export { OpLUT } from './lib/aglsl/OpLUT';
export { Token } from './lib/aglsl/Token';

export { ContextGLBlendFactor, ContextGLBlendEquation } from './lib/base/ContextGLBlendFactor';
export { ContextGLClearMask } from './lib/base/ContextGLClearMask';
export { ContextGLCompareMode } from './lib/base/ContextGLCompareMode';
export { ContextGLDrawMode } from './lib/base/ContextGLDrawMode';
export { ContextGLMipFilter } from './lib/base/ContextGLMipFilter';
export { ContextGLProfile } from './lib/base/ContextGLProfile';
export { ContextGLProgramType } from './lib/base/ContextGLProgramType';
export { ContextGLStencilAction } from './lib/base/ContextGLStencilAction';
export { ContextGLTextureFilter } from './lib/base/ContextGLTextureFilter';
export { ContextGLTextureFormat } from './lib/base/ContextGLTextureFormat';
export { ContextGLTriangleFace } from './lib/base/ContextGLTriangleFace';
export { ContextGLVertexBufferFormat } from './lib/base/ContextGLVertexBufferFormat';
export { ContextGLWrapMode } from './lib/base/ContextGLWrapMode';
export { ContextMode } from './lib/base/ContextMode';
export { IContextGL } from './lib/base/IContextGL';
export { ICubeTexture } from './lib/base/ICubeTexture';
export { IIndexBuffer } from './lib/base/IIndexBuffer';
export { IProgram } from './lib/base/IProgram';
export { IVao } from './lib/base/IVao';

export { ITextureBase } from './lib/base/ITextureBase';
export { IVertexBuffer } from './lib/base/IVertexBuffer';
export { SamplerState } from './lib/base/SamplerState';
export { TouchPoint } from './lib/base/TouchPoint';

export { ImageEvent } from './lib/events/ImageEvent';
export { StageEvent } from './lib/events/StageEvent';
export { RTTEvent } from './lib/events/RTTEvent';

// export named all from subpackage
export * from './lib/image';

//export {VideoSourceImage2D} from "./lib/image/VideoSourceImage2D";

export { IGraphicsFactory } from './lib/factories/IGraphicsFactory';

export { CompositeTask as Filter3DCompositeTask } from './lib/filters/tasks/CompositeTask';
export { FXAATask as Filter3DFXAATask } from './lib/filters/tasks/FXAATask';
export { BlurTask as Filter3DBlurTask } from './lib/filters/tasks/BlurTask';
export { TaskBase as Filter3DTaskBase } from './lib/filters/tasks/TaskBase';
export { BlurFilter as BlurFilter3D } from './lib/filters/BlurFilter';
export { CompositeFilter as CompositeFilter3D } from './lib/filters/CompositeFilter';
export { FilterBase as Filter3DBase } from './lib/filters/FilterBase';
export { FXAAFilter as FXAAFilter3D } from './lib/filters/FXAAFilter';

export { ProgramData } from './lib/image/ProgramData';
export { ProgramDataPool } from './lib/image/ProgramDataPool';

export { StageManager } from './lib/managers/StageManager';
export { RTTBufferManager } from './lib/managers/RTTBufferManager';

export { Image2DParser } from './lib/parsers/Image2DParser';
export { ImageCubeParser } from './lib/parsers/ImageCubeParser';
export { TextureAtlasParser } from './lib/parsers/TextureAtlasParser';

export { RegisterPool } from './lib/shaders/RegisterPool';
export { ShaderRegisterCache } from './lib/shaders/ShaderRegisterCache';
export { ShaderRegisterData } from './lib/shaders/ShaderRegisterData';
export { ShaderRegisterElement } from './lib/shaders/ShaderRegisterElement';

export { ContextWebGL } from './lib/webgl/ContextWebGL';
export { CubeTextureWebGL } from './lib/webgl/CubeTextureWebGL';
export { IndexBufferWebGL } from './lib/webgl/IndexBufferWebGL';
export { ProgramWebGL } from './lib/webgl/ProgramWebGL';
export { TextureBaseWebGL } from './lib/webgl/TextureBaseWebGL';
export { TextureWebGL } from './lib/webgl/TextureWebGL';
export { VertexBufferWebGL } from './lib/webgl/VertexBufferWebGL';

export { BitmapImageUtils } from './lib/utils/BitmapImageUtils';

export { AttributesView } from './lib/attributes/AttributesView';
export { AttributesBuffer, _Stage_AttributesBuffer } from './lib/attributes/AttributesBuffer';
export { Byte4Attributes } from './lib/attributes/Byte4Attributes';
export { Float1Attributes } from './lib/attributes/Float1Attributes';
export { Float2Attributes } from './lib/attributes/Float2Attributes';
export { Float3Attributes } from './lib/attributes/Float3Attributes';
export { Float4Attributes } from './lib/attributes/Float4Attributes';
export { Short2Attributes } from './lib/attributes/Short2Attributes';
export { Short3Attributes } from './lib/attributes/Short3Attributes';
export { ContextWebGLFlags, ContextWebGLPreference } from './lib/webgl/ContextWebGLFlags';
export * from './lib/Settings';

import { Loader } from '@awayjs/core';
import { Stage } from './lib/Stage';
import {
	Image2D, _Stage_Image2D,
	ImageCube, _Stage_ImageCube,
	BitmapImage2D, _Stage_BitmapImage2D,
	BitmapImageCube, _Stage_BitmapImageCube,
	ExternalImage2D, _Stage_ExternalImage2D,
	SpecularImage2D, /* _Stage_BitmapImage2D */
} from './lib/image';

import { GradientAtlas, _Stage_GradientAtlass } from './lib/utils/GradientAtlas';
import { DefaultGraphicsFactory } from './lib/factories/DefaultGraphicsFactory';
import { Image2DParser } from './lib/parsers/Image2DParser';
import { ImageCubeParser } from './lib/parsers/ImageCubeParser';
import { TextureAtlasParser } from './lib/parsers/TextureAtlasParser';
import { ImageUtils } from './lib/utils/ImageUtils';

export { DefaultGraphicsFactory };
export { ImageUtils };
export { Stage };

Loader.enableParser(Image2DParser);
Loader.enableParser(ImageCubeParser);
Loader.enableParser(TextureAtlasParser);

ImageUtils.registerDefaults(
	BitmapImage2D,
	BitmapImageCube,
	DefaultGraphicsFactory
);

Stage.registerAbstraction(_Stage_Image2D, Image2D);
Stage.registerAbstraction(_Stage_ImageCube, ImageCube);
Stage.registerAbstraction(_Stage_BitmapImage2D, BitmapImage2D);
Stage.registerAbstraction(_Stage_BitmapImageCube, BitmapImageCube);
Stage.registerAbstraction(_Stage_ExternalImage2D, ExternalImage2D);
Stage.registerAbstraction(_Stage_BitmapImage2D, SpecularImage2D);
Stage.registerAbstraction(_Stage_GradientAtlass, GradientAtlas);
