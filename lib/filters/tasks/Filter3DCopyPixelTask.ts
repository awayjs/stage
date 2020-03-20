import {ProjectionBase, Rectangle, Point} from "@awayjs/core";

import {Filter3DTaskBase} from "./Filter3DTaskBase";
import { Image2D } from '../../image/Image2D';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { IContextGL } from '../../base/IContextGL';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';
import { _Stage_ImageBase } from '../../image/ImageBase';
import { Stage } from '../../Stage';

export class Filter3DCopyPixelTask extends Filter3DTaskBase
{
	private _vertexConstantData:Float32Array;

	public rect:Rectangle = new Rectangle();

	public destPoint:Point = new Point();

	constructor()
	{
		super();

		this._vertexConstantData = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
	}
	
	public get sourceTexture():Image2D
	{
		return this._mainInputTexture;
	}
	
	public set sourceTexture(value:Image2D)
	{
		this._mainInputTexture = value;
	}

	public getVertexCode():string
	{
		var temp1:ShaderRegisterElement = this._registerCache.getFreeVertexVectorTemp();

		var rect:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();

		var position:ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._positionIndex = position.index;
		
		var offset:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();

		var uv:ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._uvIndex = uv.index;
		
		this._uvVarying = this._registerCache.getFreeVarying();
		
		var code:string;
		
		code = "mul " + temp1 + ".xy, " + position + ", " + rect + ".zw\n" +
			"add " + temp1 + ".xy, " + temp1 + ", " + rect + ".xy\n" +
			"mov " + temp1 + ".w, " + position + ".w\n" +
			"mov op, " + temp1 + "\n" + 
			"add " + this._uvVarying + ", " + uv + ", " + offset + ".xy\n";
		
		return code;
	}

	public getFragmentCode():string
	{
		var temp1:ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();

		var inputTexture:ShaderRegisterElement = this._registerCache.getFreeTextureReg();
		this._inputTextureIndex = inputTexture.index;

		var code:string;
	
		code = "tex " + temp1 + ", " + this._uvVarying + ", " + inputTexture + " <2d,linear,clamp>\n" +
			"mov oc, " + temp1 + "\n";
		return code;
	}
	
	public getMainInputTexture(stage:Stage):Image2D
	{
		return this._mainInputTexture;
	}

	public activate(stage:Stage, projection:ProjectionBase, depthTexture:Image2D):void
	{
		var index:number = this._positionIndex;
		this._vertexConstantData[index] = (2*this.destPoint.x + this.rect.width)/this._target.width - 1;
		this._vertexConstantData[index + 1] = (2*this.destPoint.y + this.rect.height)/this._target.height - 1;
		this._vertexConstantData[index + 2] = this.rect.width/this._target.width;
		this._vertexConstantData[index + 3] = this.rect.height/this._target.height;

		this._vertexConstantData[index + 4] = this.rect.x/this._mainInputTexture.width;
		this._vertexConstantData[index + 5] = this.rect.y/this._mainInputTexture.height;

		var context:IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, this._vertexConstantData);
	}
	
	public deactivate(stage:Stage):void
	{
	}
}