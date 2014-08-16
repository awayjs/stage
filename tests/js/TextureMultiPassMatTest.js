///<reference path="../../build/stagegl-context.next.d.ts" />
var tests;
(function (tests) {
    (function (materials) {
        var View = away.containers.View;

        var PointLight = away.entities.PointLight;
        var Vector3D = away.geom.Vector3D;
        var URLLoader = away.net.URLLoader;
        var URLLoaderDataFormat = away.net.URLLoaderDataFormat;
        var URLRequest = away.net.URLRequest;

        var TriangleMethodMaterial = away.materials.TriangleMethodMaterial;
        var PrimitiveTorusPrefab = away.prefabs.PrimitiveTorusPrefab;
        var DefaultRenderer = away.render.DefaultRenderer;
        var ImageTexture = away.textures.ImageTexture;
        var RequestAnimationFrame = away.utils.RequestAnimationFrame;

        var TextureMultiPassMatTest = (function () {
            function TextureMultiPassMatTest() {
                var _this = this;
                this.counter = 0;
                this.center = new Vector3D();
                var pngURLRequest = new URLRequest('assets/256x256.png');

                this.pngLoader = new URLLoader();
                this.pngLoader.dataFormat = URLLoaderDataFormat.BLOB;
                this.pngLoader.addEventListener(away.events.Event.COMPLETE, function (event) {
                    return _this.pngLoaderComplete(event);
                });
                this.pngLoader.load(pngURLRequest);
            }
            TextureMultiPassMatTest.prototype.pngLoaderComplete = function (event) {
                var _this = this;
                var imageLoader = event.target;
                this.image = away.parsers.ParserUtils.blobToImage(imageLoader.data);
                this.image.onload = function (event) {
                    return _this.onLoadComplete(event);
                };
            };

            TextureMultiPassMatTest.prototype.onLoadComplete = function (event) {
                var _this = this;
                away.Debug.THROW_ERRORS = false;
                away.Debug.LOG_PI_ERRORS = false;

                this.light = new PointLight();
                this.view = new View(new DefaultRenderer());
                this.view.camera.z = -1000;
                this.view.backgroundColor = 0x000000;
                this.torus = new PrimitiveTorusPrefab(50, 10, 32, 32, false);

                var l = 20;
                var radius = 500;

                var ts = new ImageTexture(this.image, false);
                var mat = new TriangleMethodMaterial(ts);

                this.torus.material = mat;

                for (var c = 0; c < l; c++) {
                    var t = Math.PI * 2 * c / l;
                    var m = this.torus.getNewObject();

                    m.x = Math.cos(t) * radius;
                    m.y = 0;
                    m.z = Math.sin(t) * radius;

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

                window.onresize = function (event) {
                    return _this.onResize(event);
                };

                this.raf = new RequestAnimationFrame(this.tick, this);
                this.raf.start();
            };

            TextureMultiPassMatTest.prototype.tick = function (dt) {
                this.counter += 0.005;
                this.view.camera.lookAt(this.center);
                this.view.camera.x = Math.cos(this.counter) * 800;
                this.view.camera.z = Math.sin(this.counter) * 800;

                this.view.render();
            };

            TextureMultiPassMatTest.prototype.onResize = function (event) {
                if (typeof event === "undefined") { event = null; }
                this.view.y = 0;
                this.view.x = 0;
                this.view.width = window.innerWidth;
                this.view.height = window.innerHeight;
            };
            return TextureMultiPassMatTest;
        })();
        materials.TextureMultiPassMatTest = TextureMultiPassMatTest;
    })(tests.materials || (tests.materials = {}));
    var materials = tests.materials;
})(tests || (tests = {}));
//# sourceMappingURL=TextureMultiPassMatTest.js.map
