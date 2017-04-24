import {Matrix3D, EventDispatcher, ProjectionBase} from "@awayjs/core";

import {IMaterial, TextureBase, Style} from "@awayjs/graphics";

import {AnimationSetBase} from "../../animators/AnimationSetBase";
import {IElementsClassGL} from "../../elements/IElementsClassGL";
import {GL_SamplerBase} from "../../image/GL_SamplerBase";
import {GL_ImageBase} from "../../image/GL_ImageBase";
import {PassEvent} from "../../events/PassEvent";
import {GL_RenderableBase} from "../../renderables/GL_RenderableBase";
import {ShaderBase} from "../../shaders/ShaderBase";
import {ShaderRegisterCache} from "../../shaders/ShaderRegisterCache";
import {ShaderRegisterData} from "../../shaders/ShaderRegisterData";
import {Stage} from "../../Stage";

import {GL_MaterialBase} from "../GL_MaterialBase";
import {MaterialPool} from "../MaterialPool";

import {IPass} from "./IPass";

/**
 * PassBase provides an abstract base class for material shader passes. A material pass constitutes at least
 * a render call per required renderable.
 */
export class PassBase extends EventDispatcher implements IPass
{
	public _material:GL_MaterialBase;
	public _elementsClass:IElementsClassGL;
	public _stage:Stage;
	
	public _shader:ShaderBase;

	private _preserveAlpha:boolean = true;
	private _forceSeparateMVP:boolean = false;

	public get shader():ShaderBase
	{
		return this._shader;
	}

	public get samplers():Array<GL_SamplerBase>
	{
		return this._material.samplers;
	}

	public get images():Array<GL_ImageBase>
	{
		return this._material.images;
	}

	public get style():Style
	{
		return this._material.material.style;
	}

	public get animationSet():AnimationSetBase
	{
		return <AnimationSetBase> this._material.material.animationSet;
	}

	/**
	 * Indicates whether the output alpha value should remain unchanged compared to the material's original alpha.
	 */
	public get preserveAlpha():boolean
	{
		return this._preserveAlpha;
	}

	public set preserveAlpha(value:boolean)
	{
		if (this._preserveAlpha == value)
			return;

		this._preserveAlpha = value;

		this.invalidate();
	}

	/**
	 * Indicates whether the screen projection should be calculated by forcing a separate scene matrix and
	 * view-projection matrix. This is used to prevent rounding errors when using multiple passes with different
	 * projection code.
	 */
	public get forceSeparateMVP():boolean
	{
		return this._forceSeparateMVP;
	}

	public set forceSeparateMVP(value:boolean)
	{
		if (this._forceSeparateMVP == value)
			return;

		this._forceSeparateMVP = value;

		this.invalidate();
	}

	/**
	 * Creates a new PassBase object.
	 */
	constructor(material:GL_MaterialBase, materialPool:MaterialPool)
	{
		super();

		this._material = material;
		this._elementsClass = materialPool.elementsClass;
		this._stage = materialPool.materialGroup.stage;
	}

	public getImageIndex(texture:TextureBase, index:number = 0):number
	{
		return this._material.getImageIndex(texture, index);
	}

	/**
	 * Marks the shader program as invalid, so it will be recompiled before the next render.
	 */
	public invalidate():void
	{
		this._shader.invalidateProgram();

		this.dispatchEvent(new PassEvent(PassEvent.INVALIDATE, this));
	}

	/**
	 * Cleans up any resources used by the current object.
	 * @param deep Indicates whether other resources should be cleaned up, that could potentially be shared across different instances.
	 */
	public dispose():void
	{
		this._material = null;
		this._elementsClass = null;
		this._stage = null;

		if (this._shader) {
			this._shader.dispose();
			this._shader = null;
		}
	}

	/**
	 * Renders the current pass. Before calling pass, activatePass needs to be called with the same index.
	 * @param pass The pass used to render the renderable.
	 * @param renderable The IRenderable object to draw.
	 * @param stage The Stage object used for rendering.
	 * @param entityCollector The EntityCollector object that contains the visible scene data.
	 * @param viewProjection The view-projection matrix used to project to the screen. This is not the same as
	 * camera.viewProjection as it includes the scaling factors when rendering to textures.
	 *
	 * @internal
	 */
	public _setRenderState(renderable:GL_RenderableBase, projection:ProjectionBase):void
	{
		this._shader._setRenderState(renderable, projection);
	}

	/**
	 * Sets the render state for the pass that is independent of the rendered object. This needs to be called before
	 * calling pass. Before activating a pass, the previously used pass needs to be deactivated.
	 * @param stage The Stage object which is currently used for rendering.
	 * @param camera The camera from which the scene is viewed.
	 * @private
	 */
	public _iActivate(projection:ProjectionBase):void
	{
		this._shader._iActivate(projection);
	}

	/**
	 * Clears the render state for the pass. This needs to be called before activating another pass.
	 * @param stage The Stage used for rendering
	 *
	 * @private
	 */
	public _iDeactivate():void
	{
		this._shader._iDeactivate();
	}

	public _iIncludeDependencies(shader:ShaderBase):void
	{
		this._material._iIncludeDependencies(shader);
		
		if (this._forceSeparateMVP)
			shader.globalPosDependencies++;
	}


	public _iInitConstantData(shader:ShaderBase):void
	{

	}

	public _iGetPreLightingVertexCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}

	public _iGetPreLightingFragmentCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}

	public _iGetVertexCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}

	public _iGetFragmentCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}

	public _iGetNormalVertexCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}

	public _iGetNormalFragmentCode(shader:ShaderBase, registerCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		return "";
	}
}