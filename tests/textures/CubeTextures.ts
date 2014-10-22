import View							= require("awayjs-core/lib/containers/View");
import Vector3D						= require("awayjs-core/lib/core/geom/Vector3D");
import URLRequest					= require("awayjs-core/lib/core/net/URLRequest");
import AssetLibrary					= require("awayjs-core/lib/core/library/AssetLibrary");
import AssetLoader					= require("awayjs-core/lib/core/library/AssetLoader");
import AssetLoaderToken				= require("awayjs-core/lib/core/library/AssetLoaderToken");
import DirectionalLight				= require("awayjs-core/lib/entities/DirectionalLight");
import Mesh							= require("awayjs-core/lib/entities/Mesh");
import Skybox						= require("awayjs-core/lib/entities/Skybox");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import PrimitiveTorusPrefab			= require("awayjs-core/lib/prefabs/PrimitiveTorusPrefab");
import ImageCubeTexture				= require("awayjs-core/lib/textures/ImageCubeTexture");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");
import Debug						= require("awayjs-core/lib/utils/Debug");

import DefaultRenderer				= require("awayjs-stagegl/lib/core/render/DefaultRenderer");
import SkyboxMaterial				= require("awayjs-stagegl/lib/materials/SkyboxMaterial");

class CubeTextures
{
	private _view:View;
	private _timer:RequestAnimationFrame;
	private _skyboxCubeTexture:ImageCubeTexture;
	private _skyboxMaterial:SkyboxMaterial;

	private _skybox:Skybox;

	constructor()
	{
		Debug.LOG_PI_ERRORS    = false;
		Debug.THROW_ERRORS     = false;

		this._view = new View(new DefaultRenderer());
		this._view.camera.z = -500;
		this._view.camera.y	= 250;
		this._view.camera.rotationX = 20;
		this._view.camera.projection.near = 0.5;
		this._view.camera.projection.far = 14000;
		this._view.backgroundColor = 0x2c2c32;

		var token:AssetLoaderToken = AssetLibrary.load( new URLRequest('assets/CubeTextureTest.cube'));
		token.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		window.onresize = (event:UIEvent) => this.onResize(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.render, this);
		this._timer.start();
	}

	public onResourceComplete(event:LoaderEvent)
	{
		var loader:AssetLoader = <AssetLoader> event.target;

		switch(event.url) {
			case 'assets/CubeTextureTest.cube':
				this._skyboxCubeTexture = <ImageCubeTexture> loader.baseDependency.assets[0];
				this._skyboxMaterial = new SkyboxMaterial(this._skyboxCubeTexture);

				this._skybox = new Skybox(this._skyboxMaterial);
				this._view.scene.addChild(this._skybox);

				break;
		}
	}

	private render(dt:number)
	{
		this._view.camera.rotationY += 0.01 * dt;
		this._view.render();
	}

	public onResize(event:UIEvent = null)
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}