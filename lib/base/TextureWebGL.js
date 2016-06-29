"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TextureBaseWebGL_1 = require("../base/TextureBaseWebGL");
var TextureWebGL = (function (_super) {
    __extends(TextureWebGL, _super);
    function TextureWebGL(gl, width, height) {
        _super.call(this, gl);
        this.textureType = "texture2d";
        this._width = width;
        this._height = height;
        this._glTexture = this._gl.createTexture();
    }
    TextureWebGL.prototype.dispose = function () {
        this._gl.deleteTexture(this._glTexture);
    };
    Object.defineProperty(TextureWebGL.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureWebGL.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextureWebGL.prototype, "frameBuffer", {
        get: function () {
            if (!this._frameBuffer) {
                this._frameBuffer = this._gl.createFramebuffer();
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._width, this._height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
                var renderBuffer = this._gl.createRenderbuffer();
                this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
                this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_STENCIL, this._width, this._height);
                this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._glTexture, 0);
                this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            }
            return this._frameBuffer;
        },
        enumerable: true,
        configurable: true
    });
    TextureWebGL.prototype.uploadFromData = function (data, miplevel) {
        if (miplevel === void 0) { miplevel = 0; }
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTexture);
        this._gl.texImage2D(this._gl.TEXTURE_2D, miplevel, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    };
    TextureWebGL.prototype.uploadCompressedTextureFromByteArray = function (data, byteArrayOffset /*uint*/, async) {
        if (async === void 0) { async = false; }
        var ext = this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        //this._gl.compressedTexImage2D(this._gl.TEXTURE_2D, 0, this)
    };
    Object.defineProperty(TextureWebGL.prototype, "glTexture", {
        get: function () {
            return this._glTexture;
        },
        enumerable: true,
        configurable: true
    });
    TextureWebGL.prototype.generateMipmaps = function () {
        //TODO: implement generating mipmaps
        //this._gl.bindTexture( this._gl.TEXTURE_2D, this._glTexture );
        //this._gl.generateMipmap(this._gl.TEXTURE_2D);
        //this._gl.bindTexture( this._gl.TEXTURE_2D, null );
    };
    return TextureWebGL;
}(TextureBaseWebGL_1.TextureBaseWebGL));
exports.TextureWebGL = TextureWebGL;
