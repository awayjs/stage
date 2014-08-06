///<reference path="../_definitions.ts"/>

module away.materials
{
	import Stage						= away.base.Stage;
	import Camera						= away.entities.Camera;
	import ColorTransform				= away.geom.ColorTransform;
	import ContextGLBlendFactor			= away.stagegl.ContextGLBlendFactor;
	import ContextGLCompareMode			= away.stagegl.ContextGLCompareMode;
	import IContextStageGL				= away.stagegl.IContextStageGL;
	import Texture2DBase				= away.textures.Texture2DBase;

	/**
	 * TriangleMaterial forms an abstract base class for the default shaded materials provided by Stage,
	 * using material methods to define their appearance.
	 */
	export class TriangleBasicMaterial extends DepthMaterialBase
	{
		private _screenPass:TriangleBasicPass;

		private _color:number;
		private _texture:Texture2DBase;
		private _alphaBlending:boolean = false;
		private _alpha:number = 1;

		private _alphaThreshold:number = 0;

		private _depthCompareMode:string = ContextGLCompareMode.LESS_EQUAL;

		/**
		 * Creates a new TriangleMaterial object.
		 *
		 * @param texture The texture used for the material's albedo color.
		 * @param smooth Indicates whether the texture should be filtered when sampled. Defaults to true.
		 * @param repeat Indicates whether the texture should be tiled when sampled. Defaults to false.
		 * @param mipmap Indicates whether or not any used textures should use mipmapping. Defaults to false.
		 */
		constructor(texture?:Texture2DBase, smooth?:boolean, repeat?:boolean, mipmap?:boolean);
		constructor(color?:number, alpha?:number);
		constructor(textureColor:any = null, smoothAlpha:any = null, repeat:boolean = false, mipmap:boolean = false)
		{
			super();

			this._screenPass = new TriangleBasicPass();

			if (textureColor instanceof Texture2DBase) {
				this.texture = <Texture2DBase> textureColor;

				this.smooth = (smoothAlpha == null)? true : false;
				this.repeat = repeat;
				this.mipmap = mipmap;
			} else {
				this.color = textureColor? Number(textureColor) : 0xCCCCCC;
				this.alpha = (smoothAlpha == null)? 1 : Number(smoothAlpha);
			}
		}

		/**
		 * The depth compare mode used to render the renderables using this material.
		 *
		 * @see away.stagegl.ContextGLCompareMode
		 */

		public get depthCompareMode():string
		{
			return this._depthCompareMode;
		}

		public set depthCompareMode(value:string)
		{
			if (this._depthCompareMode == value)
				return;

			this._depthCompareMode = value;

			this.pInvalidateScreenPasses();
		}

		/**
		 * The alpha of the surface.
		 */
		public get alpha():number
		{
			return this._alpha;
		}

		public set alpha(value:number)
		{
			if (value > 1)
				value = 1;
			else if (value < 0)
				value = 0;

			if (this._alpha == value)
				return;

			this._alpha = value;

			this.pInvalidateScreenPasses();
		}

		/**
		 * The diffuse reflectivity color of the surface.
		 */
		public get color():number
		{
			return this._color;
		}

		public set color(value:number)
		{
			if (this._color == value)
				return;

			this._color = value;

			this._pUpdateColor();
		}

		/**
		 * The texture object to use for the albedo colour.
		 */
		public get texture():Texture2DBase
		{
			return this._texture;
		}

		public set texture(value:Texture2DBase)
		{
			if (this._texture == value)
				return;

			this._texture = value;

			if (value) {
				this._pHeight = value.height;
				this._pWidth = value.width;
			}

			this._pUpdateTexture();
		}

		/**
		 * Indicates whether or not the material has transparency. If binary transparency is sufficient, for
		 * example when using textures of foliage, consider using alphaThreshold instead.
		 */
		public get alphaBlending():boolean
		{
			return this._alphaBlending;
		}

		public set alphaBlending(value:boolean)
		{
			if (this._alphaBlending == value)
				return;

			this._alphaBlending = value;

			this.pInvalidateScreenPasses();
		}


		/**
		 * Sets the render state for the depth pass that is independent of the rendered object. Used when rendering
		 * depth or distances (fe: shadow maps, depth pre-pass).
		 *
		 * @param stage The Stage used for rendering.
		 * @param camera The camera from which the scene is viewed.
		 * @param distanceBased Whether or not the depth pass or distance pass should be activated. The distance pass
		 * is required for shadow cube maps.
		 *
		 * @internal
		 */
		public iActivateForDepth(stage:Stage, camera:Camera, distanceBased:boolean = false) // ARCANE
		{
			if (distanceBased)
				this._pDistancePass.alphaMask = this._texture;
			else
				this._pDepthPass.alphaMask = this._texture;

			super.iActivateForDepth(stage, camera, distanceBased)
		}

		/**
		 * @inheritDoc
		 */
		public iUpdateMaterial()
		{
			var passesInvalid:boolean;

			if (this._pScreenPassesInvalid) {
				this.pUpdateScreenPasses();
				passesInvalid = true;
			}

			if (passesInvalid || this.isAnyScreenPassInvalid()) {
				this.pClearPasses();

				this.pAddDepthPasses();

				this.pAddChildPassesFor(this._screenPass);

				this.addScreenPass(this._screenPass);
			}
		}

		/**
		 * Adds a compiled pass that renders to the screen.
		 * @param pass The pass to be added.
		 */
		private addScreenPass(pass:TriangleBasicPass)
		{
			if (pass) {
				this.pAddPass(pass);
				pass._iPassesDirty = false;
			}
		}

		/**
		 * Tests if any pass that renders to the screen is invalid. This would trigger a new setup of the multiple passes.
		 * @return
		 */
		private isAnyScreenPassInvalid():boolean
		{
			if (this._screenPass._iPassesDirty)
				return true;

			return false;
		}

		/**
		 * @inheritDoc
		 */
		public iActivatePass(index:number, stage:Stage, camera:Camera)
		{
			if (index == 0)
				(<IContextStageGL> stage.context).setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);

			super.iActivatePass(index, stage, camera);
		}

		/**
		 * @inheritDoc
		 */
		public iDeactivate(stage:Stage)
		{
			super.iDeactivate(stage);

			(<IContextStageGL> stage.context).setBlendFactors(ContextGLBlendFactor.ONE, ContextGLBlendFactor.ZERO);
		}

		/**
		 * Updates screen passes when they were found to be invalid.
		 */
		public pUpdateScreenPasses()
		{
			this.initPasses();

			this.setBlendAndCompareModes();

			this._pScreenPassesInvalid = false;
		}

		public _pUpdateColor()
		{
			this._screenPass.diffuseColor = this._color;
		}

		public _pUpdateTexture()
		{
			this._screenPass.texture = this._texture;
			this._pDistancePass.alphaMask = this._texture;
			this._pDepthPass.alphaMask = this._texture;
		}

		/**
		 * Initializes all the passes and their dependent passes.
		 */
		private initPasses()
		{
			//
		}

		/**
		 * Sets up the various blending modes for all screen passes, based on whether or not there are previous passes.
		 */
		private setBlendAndCompareModes()
		{
			this._pRequiresBlending = (this._pBlendMode != away.base.BlendMode.NORMAL || this._alphaBlending || this._alpha < 1);
			this._screenPass.depthCompareMode = this._depthCompareMode;
			this._screenPass.preserveAlpha = this._pRequiresBlending;
			this._screenPass.setBlendMode((this._pBlendMode == away.base.BlendMode.NORMAL && this._pRequiresBlending)? away.base.BlendMode.LAYER : this._pBlendMode);
			this._screenPass.forceSeparateMVP = false;
		}
	}
}
