import {ElementsBase} from "@awayjs/graphics";

import {ShaderBase} from "../shaders/ShaderBase";
import {ShaderRegisterCache} from "../shaders/ShaderRegisterCache";
import {ShaderRegisterData} from "../shaders/ShaderRegisterData";
import {Stage} from "../Stage";

import {GL_ElementsBase} from "./GL_ElementsBase";

/**
 * IElementsClassGL is an interface for the constructable class definition IRenderable that is used to
 * create renderable objects in the rendering pipeline to render the contents of a partition
 *
 * @class away.render.IElementsClassGL
 */
export interface IElementsClassGL
{
	/**
	 *
	 */
	new(elements:ElementsBase, stage:Stage):GL_ElementsBase;

	_includeDependencies(shader:ShaderBase);

	_getVertexCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;

	_getFragmentCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string;
}