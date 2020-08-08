import {ProjectionBase, Rectangle, Point, ColorTransform} from "@awayjs/core";

import {Filter3DTaskBase} from "./Filter3DTaskBase";
import { Image2D } from '../../image/Image2D';
import { ShaderRegisterElement } from '../../shaders/ShaderRegisterElement';
import { IContextGL } from '../../base/IContextGL';
import { ContextGLProgramType } from '../../base/ContextGLProgramType';
import { _Stage_ImageBase } from '../../image/ImageBase';
import { Stage } from '../../Stage';

const EMPTY_TRANSFORM = new Float32Array([1,1,1,1,0,0,0,0]);

export class Filter3DCopyPixelTask extends Filter3DTaskBase
{
	private _vertexConstantData:Float32Array;
	private _fragConstantData: Float32Array;

	public rect:Rectangle = new Rectangle();
	public destPoint:Point = new Point();
	public transform: ColorTransform;

	constructor()
	{
		super();

		this._vertexConstantData = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
		this._fragConstantData = EMPTY_TRANSFORM.slice();
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
		var temp1 = this._registerCache.getFreeVertexVectorTemp();

		var rect = this._registerCache.getFreeVertexConstant();

		var position = this._registerCache.getFreeVertexAttribute();
		this._positionIndex = position.index;
		
		var offset = this._registerCache.getFreeVertexConstant();

		var uv = this._registerCache.getFreeVertexAttribute();
		this._uvIndex = uv.index;
		
		this._uvVarying = this._registerCache.getFreeVarying();
		
		var code:string;
		
		code = "mul " + temp1 + ".xy, " + position + ", " + rect + ".zw\n" +
			"add " + temp1 + ".xy, " + temp1 + ", " + rect + ".xy\n" +
			"mov " + temp1 + ".w, " + position + ".w\n" +
			"mov op, " + temp1 + "\n" + 
			"add " + this._uvVarying + ", " + uv + ", " + offset + ".xy\n" +
			"mul " +  this._uvVarying + ", " + this._uvVarying + ", " + offset + ".zw\n";
		
		return code;
	}

	public getFragmentCode():string
	{
		var temp1:ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(temp1, 1);

		var mulltipler = this._registerCache.getFreeFragmentConstant();
		var add = this._registerCache.getFreeFragmentConstant();

		var inputTexture:ShaderRegisterElement = this._registerCache.getFreeTextureReg();
		this._inputTextureIndex = inputTexture.index;

		var code:string;
	
		code = 
			"tex " + temp1 + ", " + this._uvVarying + ", " + inputTexture + " <2d,linear,clamp>\n" +
			//"div " + temp1 + ", " + temp1 + ", " + temp1 + ".w\n" +
			"mul " + temp1 + ", " + temp1 + ", " + mulltipler + ".xyzw\n" +
			"add " + temp1 + ", " + temp1 + ", " + add + ".xyzw\n" +
			//"mul " + temp1 + ", " + temp1 + ", " + temp1 + ".w\n" +
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

		// mul to vertex
		vd[index + 0] = (2 * dp.x + sr.width) / tr.width - 1;
		vd[index + 1] = (2 * dp.y + sr.height) / tr.height - 1;
		
		// add to vertex
		vd[index + 2] = sr.width / tr.width;
		vd[index + 3] = sr.height / tr.height;

		// add to uv
		vd[index + 4] = 2 * sr.x / tex.width;
		vd[index + 5] = 2 * sr.y / tex.height;

		// mul to uv
		vd[index + 6] = sr.width / tex.width;
		vd[index + 7] = sr.height / tex.height;

		let fd = EMPTY_TRANSFORM;

		if(this.transform) {
			fd = this._fragConstantData;
			fd.set(this.transform._rawData);
			for(let i = 0; i < 4; i ++) fd[i + 4] /= 255;
		}

		var context:IContextGL = stage.context;
		context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, vd);
		context.setProgramConstantsFromArray(ContextGLProgramType.FRAGMENT, fd);
		
	}
	
	public deactivate(stage:Stage):void
	{
	}
}