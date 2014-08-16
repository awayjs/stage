///<reference path="../../build/stagegl-context.next.d.ts" />

module tests.materials
{
	import View							= away.containers.View;
	import Mesh							= away.entities.Mesh;
	import PointLight					= away.entities.PointLight;
	import Vector3D						= away.geom.Vector3D;
	import URLLoader					= away.net.URLLoader;
	import URLLoaderDataFormat			= away.net.URLLoaderDataFormat;
	import URLRequest					= away.net.URLRequest;
	import StaticLightPicker			= away.materials.StaticLightPicker;
	import TriangleMethodMaterial		= away.materials.TriangleMethodMaterial;
	import PrimitiveTorusPrefab			= away.prefabs.PrimitiveTorusPrefab;
	import DefaultRenderer				= away.render.DefaultRenderer;
	import ImageTexture					= away.textures.ImageTexture;
	import RequestAnimationFrame		= away.utils.RequestAnimationFrame;

    export class TextureMultiPassMatTest
    {
		private view:View;
		private torus:PrimitiveTorusPrefab;
		private light:PointLight;
		private raf:RequestAnimationFrame;
		private counter:number = 0;
		private center:Vector3D = new Vector3D();
        private pngLoader   : URLLoader;
		private image:HTMLImageElement;

        constructor()
        {
            var pngURLRequest:URLRequest = new URLRequest('assets/256x256.png');

            this.pngLoader = new URLLoader();
			this.pngLoader.dataFormat = URLLoaderDataFormat.BLOB;
            this.pngLoader.addEventListener(away.events.Event.COMPLETE, (event:away.events.Event) => this.pngLoaderComplete(event));
            this.pngLoader.load(pngURLRequest);
        }

        private pngLoaderComplete(event:away.events.Event)
        {
			var imageLoader:URLLoader = <URLLoader> event.target;
			this.image = away.parsers.ParserUtils.blobToImage(imageLoader.data);
			this.image.onload = (event) => this.onLoadComplete(event);
        }

        private onLoadComplete(event)
        {
            away.Debug.THROW_ERRORS     = false;
            away.Debug.LOG_PI_ERRORS    = false;

			this.light = new PointLight();
			this.view = new View(new DefaultRenderer());
			this.view.camera.z = -1000;
			this.view.backgroundColor = 0x000000;
			this.torus = new PrimitiveTorusPrefab(50 , 10, 32 , 32 , false);

            var l:number = 20;
            var radius:number = 500;

            var ts:ImageTexture = new ImageTexture(this.image, false);
			var mat:TriangleMethodMaterial = new TriangleMethodMaterial(ts);

			this.torus.material = mat;

			for (var c:number = 0; c < l ; c++) {
				var t:number = Math.PI*2*c/l;
				var m:Mesh = <Mesh> this.torus.getNewObject();

				m.x = Math.cos(t)*radius;
				m.y = 0;
				m.z = Math.sin(t)*radius;

				this.view.scene.addChild(m);
			}

            this.view.scene.addChild(this.light);

			this.view.y = this.view.x = 0;
			this.view.width = window.innerWidth;
			this.view.height = window.innerHeight;

			console.log("renderer ", this.view.renderer);
			console.log("scene ", this.view.scene);
			console.log("view ", this.view);

			this.view.render();

			window.onresize = (event:UIEvent) => this.onResize(event);

			this.raf = new RequestAnimationFrame(this.tick, this);
			this.raf.start();
        }

        private tick(dt:number)
        {
			this.counter += 0.005;
			this.view.camera.lookAt(this.center);
			this.view.camera.x = Math.cos(this.counter)*800;
			this.view.camera.z = Math.sin(this.counter)*800;

			this.view.render();
		}

		public onResize(event:UIEvent = null)
		{
			this.view.y = 0;
			this.view.x = 0;
			this.view.width = window.innerWidth;
			this.view.height = window.innerHeight;
		}
    }
}