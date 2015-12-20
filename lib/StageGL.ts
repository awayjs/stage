import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");
import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");
import BitmapImageCube				= require("awayjs-core/lib/image/BitmapImageCube");
import Image2D						= require("awayjs-core/lib/image/Image2D");
import ImageCube					= require("awayjs-core/lib/image/ImageCube");
import SpecularImage2D				= require("awayjs-core/lib/image/SpecularImage2D");

import Stage						= require("awayjs-stagegl/lib/base/Stage");
import GL_AttributesBuffer			= require("awayjs-stagegl/lib/attributes/GL_AttributesBuffer");
import GL_BitmapImage2D				= require("awayjs-stagegl/lib/image/GL_BitmapImage2D");
import GL_BitmapImageCube			= require("awayjs-stagegl/lib/image/GL_BitmapImageCube");
import GL_RenderImage2D				= require("awayjs-stagegl/lib/image/GL_RenderImage2D");
import GL_RenderImageCube			= require("awayjs-stagegl/lib/image/GL_RenderImageCube");
import GL_SpecularImage2D			= require("awayjs-stagegl/lib/image/GL_SpecularImage2D");

Stage.registerAbstraction(GL_AttributesBuffer, AttributesBuffer);
Stage.registerAbstraction(GL_RenderImage2D, Image2D);
Stage.registerAbstraction(GL_RenderImageCube, ImageCube);
Stage.registerAbstraction(GL_BitmapImage2D, BitmapImage2D);
Stage.registerAbstraction(GL_BitmapImageCube, BitmapImageCube);
Stage.registerAbstraction(GL_SpecularImage2D, SpecularImage2D);

/**
 *
 * static shim
 */
var stagegl =
{
	Stage:Stage
};

window["stagegl"] = stagegl;

export = stagegl;