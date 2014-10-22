import View							= require("awayjs-core/lib/containers/View");
import Vector3D						= require("awayjs-core/lib/core/geom/Vector3D");
import URLLoader					= require("awayjs-core/lib/core/net/URLLoader");
import URLLoaderDataFormat			= require("awayjs-core/lib/core/net/URLLoaderDataFormat");
import URLRequest					= require("awayjs-core/lib/core/net/URLRequest");
import Mesh							= require("awayjs-core/lib/entities/Mesh");
import DirectionalLight				= require("awayjs-core/lib/entities/DirectionalLight");
import AwayEvent					= require("awayjs-core/lib/events/Event");
import StaticLightPicker			= require("awayjs-core/lib/materials/lightpickers/StaticLightPicker");
import ParserUtils					= require("awayjs-core/lib/parsers/ParserUtils");
import PerspectiveProjection		= require("awayjs-core/lib/projections/PerspectiveProjection");
import PrimitiveTorusPrefab			= require("awayjs-core/lib/prefabs/PrimitiveTorusPrefab");
import ImageTexture					= require("awayjs-core/lib/textures/ImageTexture");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");
import Debug						= require("awayjs-core/lib/utils/Debug");

import DefaultRenderer				= require("awayjs-stagegl/lib/core/render/DefaultRenderer");
import TriangleMethodMaterial		= require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");

class TorusLight
{
	private _view:View;
	private _torus:PrimitiveTorusPrefab;
	private _mesh:Mesh;
	private _raf:RequestAnimationFrame;
	private _image:HTMLImageElement;

	constructor()
	{
		Debug.THROW_ERRORS = false;
		Debug.ENABLE_LOG = false;
		Debug.LOG_PI_ERRORS = false;

		this._view = new View(new DefaultRenderer());
		this._view.camera.projection = new PerspectiveProjection(60);
		this._torus = new PrimitiveTorusPrefab(220, 80, 32, 16, false);

		this.loadResources();
	}

	private loadResources()
	{
		var urlRequest:URLRequest = new URLRequest("assets/dots.png");

		var urlLoader:URLLoader = new URLLoader();
		urlLoader.dataFormat = URLLoaderDataFormat.BLOB;
		urlLoader.addEventListener(AwayEvent.COMPLETE, (event:AwayEvent) => this.imageCompleteHandler(event));
		urlLoader.load(urlRequest);
	}

	private imageCompleteHandler(event:AwayEvent)
	{
		var imageLoader:URLLoader = <URLLoader> event.target;

		this._image = ParserUtils.blobToImage(imageLoader.data);
		this._image.onload = (event:Event) => this.onLoadComplete(event);
	}

	private onLoadComplete(event:Event)
	{
		var ts:ImageTexture = new ImageTexture(this._image, false);

		var light:DirectionalLight = new DirectionalLight();
		light.direction = new Vector3D(0, 0, 1);
		light.diffuse = .7;
		light.specular = 1;

		this._view.scene.addChild(light);

		var lightPicker:StaticLightPicker = new StaticLightPicker([light]);

		var matTx:TriangleMethodMaterial = new TriangleMethodMaterial(ts, true, true, false);
		matTx.lightPicker = lightPicker;

		this._torus.material = matTx;

		this._mesh = <Mesh> this._torus.getNewObject();

		this._view.scene.addChild(this._mesh);

		this._raf = new RequestAnimationFrame(this.render , this);
		this._raf.start();

		window.onresize = (event:UIEvent) => this.resize(event);

		this.resize();
	}


	public render(dt:number = null):void
	{
		this._mesh.rotationY += 1;
		this._view.render();
	}


	public resize(event:UIEvent = null)
	{
		this._view.y = 0;
		this._view.x = 0;

		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}