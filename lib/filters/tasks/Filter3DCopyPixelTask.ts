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
		const index = this._positionIndex;
		const vd = this._vertexConstantData;
		const dp = this.destPoint;
		const sr = this.rect;
		const tr = this._target;
		const tex = this._mainInputTexture;

		// mult to vertex
		vd[index + 0] = (2 * dp.x + sr.width) / tr.width - 1;
		vd[index + 1] = (2 * dp.y + sr.height) / tr.height - 1;
		
		// add to vertex
		vd[index + 2] = sr.width / tr.width;
		vd[index + 3] = sr.height / tr.height;

		// add to uv
		vd[index + 4] = sr.x / tex.width;
		vd[index + 5] = sr.y / tex.height;

		var context:IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, vd);
	}
	
	public deactivate(stage:Stage):void
	{
	}
}