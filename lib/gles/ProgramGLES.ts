import {ByteArray} from "@awayjs/core";

import {AGALTokenizer} from "../aglsl/AGALTokenizer";
import {AGLSLParser} from "../aglsl/AGLSLParser";
import {IProgram} from "../base/IProgram";
import {OpCodes} from "../flash/OpCodes";

import {ContextGLES} from "./ContextGLES";
import {GLESAssetBase} from "./GLESAssetBase";

import {GLESConnector} from "./GLESConnector";
import {Byte32Array} from "@awayjs/core";
export class ProgramGLES extends GLESAssetBase implements IProgram
{
	private static _tokenizer:AGALTokenizer = new AGALTokenizer();
	private static _aglslParser:AGLSLParser = new AGLSLParser();
	private static _uniformLocationNameDictionary:Array<string> = ["fc", "fs", "vc"];
	// private static _uniformLocationNameDictionary:Array<string> = ["fcarrr", "fs", "vcarrr"];

	private _gl:WebGLRenderingContext;
	private _program:WebGLProgram;
	private _vertexShader:WebGLShader;
	private _fragmentShader:WebGLShader;
	private _uniforms:Array<Array<WebGLUniformLocation>> = [[],[],[]];
	private _attribs:Array<number> = [];

	constructor(context:ContextGLES, gl:WebGLRenderingContext, id:number)
	{
		super(context, id);
		//console.log("awayjs created program with id "+ id);
		// this._gl = gl;
		// this._program = this._gl.createProgram();
	}

	public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray):void
	{
		var vertexString:string = ProgramGLES._aglslParser.parse(ProgramGLES._tokenizer.decribeAGALByteArray(vertexProgram));
		var fragmentString:string = ProgramGLES._aglslParser.parse(ProgramGLES._tokenizer.decribeAGALByteArray(fragmentProgram));
		//(String.fromCharCode(OpCodes.uploadProgram)+""+this.id + "###"+vertexString +  "###" + fragmentString + "#END");

		var newSendbytes=new Byte32Array();
		newSendbytes.writeInt(1);//tells cpp that this is a create-bytes chunk
		newSendbytes.writeInt(OpCodes.uploadProgram);
		newSendbytes.writeInt(this.id);
		newSendbytes.writeUTFBytes(vertexString);
		newSendbytes.writeUTFBytes(fragmentString);
		newSendbytes.bytePosition = 0;
		var localInt32View = new Int32Array(newSendbytes.byteLength/4);
		newSendbytes.readInt32Array(localInt32View);
		GLESConnector.gles.sendGLESCommands(localInt32View.buffer);
		
	}

	public getUniformLocation(programType:number, index:number = -1):WebGLUniformLocation
	{
		// if (this._uniforms[programType][index + 1] != null)
		// 	return this._uniforms[programType][index + 1];
		//
		// var name:string =  (index == -1)? ProgramGLES._uniformLocationNameDictionary[programType] : ProgramGLES._uniformLocationNameDictionary[programType] + index;
		// return (this._uniforms[programType][index + 1] = this._gl.getUniformLocation(this._program, name));
		return null;
	}
	
	//
	// public getUniformLocation(programType:number, index:number):WebGLUniformLocation
	// {
	// 	if (this._uniforms[programType][index] != null)
	// 		return this._uniforms[programType][index];
	//
	// 	return (this._uniforms[programType][index] = this._gl.getUniformLocation(this._program, ProgramGLES._uniformLocationNameDictionary[programType] + index));
	// }


	public getAttribLocation(index:number):number
	{
		// if (this._attribs[index] != null)
		// 	return this._attribs[index];
		//
		// return (this._attribs[index] = this._gl.getAttribLocation(this._program, "va" + index));
		return 0;
	}


	public dispose():void
	{
		//this._context.addStream(String.fromCharCode(OpCodes.disposeProgram)+""+ this.id);
		this._context._createBytes.writeInt(OpCodes.disposeProgram);
		this._context._createBytes.writeInt(this.id);
		//GLESConnector.gles.disposeProgram(this.id);
		// this._gl.deleteProgram(this._program);
	}

	public focusProgram():void
	{
		//GLESConnector.gles.focusProgram(this.id);
		// this._gl.useProgram(this._program);
	}

	public get glProgram():WebGLProgram
	{
		return this._program;
	}
}