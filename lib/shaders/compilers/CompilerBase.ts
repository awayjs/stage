import {IPass} from "../../materials/passes/IPass";
import {IElementsClassGL} from "../../elements/IElementsClassGL";

import {ShaderBase} from "../ShaderBase";
import {ShaderRegisterCache} from "../ShaderRegisterCache";
import {ShaderRegisterData} from "../ShaderRegisterData";
import {ShaderRegisterElement} from "../ShaderRegisterElement";

/**
 * CompilerBase is an abstract base class for shader compilers that use modular shader methods to assemble a
 * material. Concrete subclasses are used by the default materials.
 *
 * @see away.materials.ShadingMethodBase
 */
export class CompilerBase
{
	protected _shader:ShaderBase;
	protected _sharedRegisters:ShaderRegisterData;
	protected _registerCache:ShaderRegisterCache;
	protected _elementsClass:IElementsClassGL;
	protected _renderPass:IPass;

	protected _vertexCode:string = ''; // Changed to emtpy string- AwayTS
	protected _fragmentCode:string = '';// Changed to emtpy string - AwayTS
	protected _postAnimationFragmentCode:string = '';// Changed to emtpy string - AwayTS

	/**
	 * Creates a new CompilerBase object.
	 * @param profile The compatibility profile of the renderer.
	 */
	constructor(elementsClass:IElementsClassGL, pass:IPass, shader:ShaderBase)
	{
		this._elementsClass = elementsClass;
		this._renderPass = pass;
		this._shader = shader;

		this._sharedRegisters = new ShaderRegisterData();

		this._registerCache = new ShaderRegisterCache(shader.profile);
	}

	/**
	 * Compiles the code after all setup on the compiler has finished.
	 */
	public compile():void
	{
		this._shader.reset();

		this._shader._includeDependencies();

		this.pInitRegisterIndices();

		this.pCompileDependencies();

		//compile custom vertex & fragment codes
		this._vertexCode += this._renderPass._getVertexCode(this._registerCache, this._sharedRegisters);
		this._fragmentCode += this._renderPass._getFragmentCode(this._registerCache, this._sharedRegisters);
		this._postAnimationFragmentCode += this._renderPass._getPostAnimationFragmentCode(this._registerCache, this._sharedRegisters);

		//assign the final output color to the output register
		this._postAnimationFragmentCode += "mov " + this._registerCache.fragmentOutputRegister + ", " + this._sharedRegisters.shadedTarget + "\n";
		this._registerCache.removeFragmentTempUsage(this._sharedRegisters.shadedTarget);
	}
	/**
	 * Calculate the transformed colours
	 */
	private compileColorTransformCode():void
	{
		// rm, gm, bm, am - multiplier
		// ro, go, bo, ao - offset
		var ct1:ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();
		var ct2:ShaderRegisterElement = this._registerCache.getFreeFragmentConstant();
		this._shader.colorTransformIndex = ct1.index*4;
		this._postAnimationFragmentCode += "mul " + this._sharedRegisters.shadedTarget + ", " + this._sharedRegisters.shadedTarget + ", " + ct1 + "\n";
		this._postAnimationFragmentCode += "add " + this._sharedRegisters.shadedTarget + ", " + this._sharedRegisters.shadedTarget + ", " + ct2 + "\n";
	}
	/**
	 * Compile the code for the methods.
	 */
	public pCompileDependencies():void
	{
		this._sharedRegisters.shadedTarget = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(this._sharedRegisters.shadedTarget, 1);

		//compile the world-space position if required
		if (this._shader.globalPosDependencies > 0)
			this.compileGlobalPositionCode();

        //compile the local-space position if required
        if (this._shader.usesPositionFragment)
            this.compilePositionCode();

		if (this._shader.usesCurves)
			this.compileCurvesCode();

		if (this._shader.usesColorTransform)
			this.compileColorTransformCode();

		//Calculate the (possibly animated) UV coordinates.
		if (this._shader.uvDependencies > 0)
			this.compileUVCode();

		if (this._shader.secondaryUVDependencies > 0)
			this.compileSecondaryUVCode();

		if (this._shader.normalDependencies > 0)
			this.compileNormalCode();

		if (this._shader.viewDirDependencies > 0)
			this.compileViewDirCode();

		//collect code from material
		this._vertexCode += this._elementsClass._getVertexCode(this._shader, this._registerCache, this._sharedRegisters);
		this._fragmentCode += this._elementsClass._getFragmentCode(this._shader, this._registerCache, this._sharedRegisters);
	}

	private compileGlobalPositionCode():void
	{
		this._registerCache.addVertexTempUsages(this._sharedRegisters.globalPositionVertex = this._registerCache.getFreeVertexVectorTemp(), this._shader.globalPosDependencies);

		var sceneMatrixReg:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();
		this._registerCache.getFreeVertexConstant();
		this._registerCache.getFreeVertexConstant();
		this._registerCache.getFreeVertexConstant();

		this._shader.sceneMatrixIndex = sceneMatrixReg.index*4;

		this._vertexCode += "m44 " + this._sharedRegisters.globalPositionVertex + ", " + this._sharedRegisters.animatedPosition + ", " + sceneMatrixReg + "\n";

		if (this._shader.usesGlobalPosFragment) {
			this._sharedRegisters.globalPositionVarying = this._registerCache.getFreeVarying();
			this._vertexCode += "mov " + this._sharedRegisters.globalPositionVarying + ", " + this._sharedRegisters.globalPositionVertex + "\n";
		}
	}

    private compilePositionCode()
    {
        this._sharedRegisters.positionVarying = this._registerCache.getFreeVarying();
        this._vertexCode += "mov " + this._sharedRegisters.positionVarying + ", " + this._sharedRegisters.animatedPosition + "\n";
    }


	private compileCurvesCode():void
	{
		this._sharedRegisters.curvesInput = this._registerCache.getFreeVertexAttribute();
		this._shader.curvesIndex = this._sharedRegisters.curvesInput.index;

		this._sharedRegisters.curvesVarying = this._registerCache.getFreeVarying();
		this._vertexCode += "mov " + this._sharedRegisters.curvesVarying + ", " + this._sharedRegisters.curvesInput + "\n";

		var temp:ShaderRegisterElement = this._registerCache.getFreeFragmentSingleTemp();

		this._fragmentCode += "mul " + temp + ", " + this._sharedRegisters.curvesVarying + ".y, " + this._sharedRegisters.curvesVarying + ".y\n" +
							"sub " + temp + ", " + temp + ", " + this._sharedRegisters.curvesVarying + ".z\n" +
							"mul " + temp + ", " + temp + ", " + this._sharedRegisters.curvesVarying + ".x\n" +
							"kil " + temp + "\n";
		
		// var temp:ShaderRegisterElement = this._registerCache.getFreeFragmentVectorTemp();
		//
		// this._postAnimationFragmentCode += "mul " + temp + ".x, " + this._sharedRegisters.curvesVarying + ".y, " + this._sharedRegisters.curvesVarying + ".y\n" +
		// 					"sub " + temp + ".x, " + temp + ".x, " + this._sharedRegisters.curvesVarying + ".z\n" +
		// 					"mul " + temp + ".x, " + temp + ".x, " + this._sharedRegisters.curvesVarying + ".x\n" +
		// 					"ddx " + temp + ".y," + temp + ".x\n" +
		// 					"ddy " + temp + ".z," + temp + ".x\n" +
		// 					"mul " + temp + ".y, " + temp + ".y, " + temp + ".y\n" +
		// 					"mul " + temp + ".z, " + temp + ".z, " + temp + ".z\n" +
		// 					"add " + this._sharedRegisters.shadedTarget + ".w, " + temp + ".y, " + temp + ".z\n" +
		// 					"sqt " + this._sharedRegisters.shadedTarget + ".w, " + this._sharedRegisters.shadedTarget + ".w\n" +
		// 					"div " + this._sharedRegisters.shadedTarget + ".w, " + temp + ".x, " + this._sharedRegisters.shadedTarget + ".w\n" +
		// 					"max " + this._sharedRegisters.shadedTarget + ".w, " + this._sharedRegisters.shadedTarget + ".w, " + this._sharedRegisters.commons + ".y\n" +
		// 					"min " + this._sharedRegisters.shadedTarget + ".w, " + this._sharedRegisters.shadedTarget + ".w, " + this._sharedRegisters.commons + ".w\n";
	}

	/**
	 * Calculate the (possibly animated) UV coordinates.
	 */
	private compileUVCode():void
	{
		var uvAttributeReg:ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._shader.uvIndex = uvAttributeReg.index;

		var varying:ShaderRegisterElement = this._sharedRegisters.uvVarying = this._registerCache.getFreeVarying();

		if (this._shader.usesUVTransform) {
			// a, b, 0, tx
			// c, d, 0, ty
			var uvTransform1:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();
			var uvTransform2:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();
			this._shader.uvMatrixIndex = uvTransform1.index*4;

			this._vertexCode += "dp4 " + varying + ".x, " + uvAttributeReg + ", " + uvTransform1 + "\n" +
								 "dp4 " + varying + ".y, " + uvAttributeReg + ", " + uvTransform2 + "\n" +
								 "mov " + varying + ".zw, " + uvAttributeReg + ".zw \n";
		} else {
			this._shader.uvMatrixIndex = -1;
			this._sharedRegisters.uvTarget = varying;
			this._sharedRegisters.uvSource = uvAttributeReg;
		}
	}

	/**
	 * Provide the secondary UV coordinates.
	 */
	private compileSecondaryUVCode():void
	{
		var uvAttributeReg:ShaderRegisterElement = this._registerCache.getFreeVertexAttribute();
		this._shader.secondaryUVIndex = uvAttributeReg.index;
		this._sharedRegisters.secondaryUVVarying = this._registerCache.getFreeVarying();
		this._vertexCode += "mov " + this._sharedRegisters.secondaryUVVarying + ", " + uvAttributeReg + "\n";
	}

	/**
	 * Calculate the view direction.
	 */
	public compileViewDirCode():void
	{
		var cameraPositionReg:ShaderRegisterElement = this._registerCache.getFreeVertexConstant();
		this._sharedRegisters.viewDirVarying = this._registerCache.getFreeVarying();
		this._sharedRegisters.viewDirFragment = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(this._sharedRegisters.viewDirFragment, this._shader.viewDirDependencies);

		this._shader.cameraPositionIndex = cameraPositionReg.index*4;

		if (this._shader.usesTangentSpace) {
			var temp:ShaderRegisterElement = this._registerCache.getFreeVertexVectorTemp();
			this._vertexCode += "sub " + temp + ", " + cameraPositionReg + ", " + this._sharedRegisters.animatedPosition + "\n" +
				"m33 " + this._sharedRegisters.viewDirVarying + ".xyz, " + temp + ", " + this._sharedRegisters.animatedTangent + "\n" +
				"mov " + this._sharedRegisters.viewDirVarying + ".w, " + this._sharedRegisters.animatedPosition + ".w\n";
		} else {
			this._vertexCode += "sub " + this._sharedRegisters.viewDirVarying + ", " + cameraPositionReg + ", " + this._sharedRegisters.globalPositionVertex + "\n";
			this._registerCache.removeVertexTempUsage(this._sharedRegisters.globalPositionVertex);
		}

		//TODO is this required in all cases? (re: distancemappass)
		this._fragmentCode += "nrm " + this._sharedRegisters.viewDirFragment + ".xyz, " + this._sharedRegisters.viewDirVarying + "\n" +
			"mov " + this._sharedRegisters.viewDirFragment + ".w,   " + this._sharedRegisters.viewDirVarying + ".w\n";
	}

	/**
	 * Calculate the normal.
	 */
	public compileNormalCode():void
	{
		this._sharedRegisters.normalFragment = this._registerCache.getFreeFragmentVectorTemp();
		this._registerCache.addFragmentTempUsages(this._sharedRegisters.normalFragment, this._shader.normalDependencies);

		//simple normal aquisition if no tangent space is being used
		if (this._shader.outputsNormals && !this._shader.outputsTangentNormals) {
			this._vertexCode += this._renderPass._getNormalVertexCode(this._registerCache, this._sharedRegisters);
			this._fragmentCode += this._renderPass._getNormalFragmentCode(this._registerCache, this._sharedRegisters);

			return;
		}

		var normalMatrix:Array<ShaderRegisterElement>;

		if (!this._shader.outputsNormals || !this._shader.usesTangentSpace) {
			normalMatrix = new Array<ShaderRegisterElement>(3);
			normalMatrix[0] = this._registerCache.getFreeVertexConstant();
			normalMatrix[1] = this._registerCache.getFreeVertexConstant();
			normalMatrix[2] = this._registerCache.getFreeVertexConstant();

			this._registerCache.getFreeVertexConstant();

			this._shader.sceneNormalMatrixIndex = normalMatrix[0].index*4;

			this._sharedRegisters.normalVarying = this._registerCache.getFreeVarying();
		}

		if (this._shader.outputsNormals) {
			if (this._shader.usesTangentSpace) {
				// normalize normal + tangent vector and generate (approximated) bitangent used in m33 operation for view
				this._vertexCode += "nrm " + this._sharedRegisters.animatedNormal + ".xyz, " + this._sharedRegisters.animatedNormal + "\n" +
					"nrm " + this._sharedRegisters.animatedTangent + ".xyz, " + this._sharedRegisters.animatedTangent + "\n" +
					"crs " + this._sharedRegisters.bitangent + ".xyz, " + this._sharedRegisters.animatedNormal + ", " + this._sharedRegisters.animatedTangent + "\n";

				this._fragmentCode += this._renderPass._getNormalFragmentCode(this._registerCache, this._sharedRegisters);
			} else {
				//Compiles the vertex shader code for tangent-space normal maps.
				this._sharedRegisters.tangentVarying = this._registerCache.getFreeVarying();
				this._sharedRegisters.bitangentVarying = this._registerCache.getFreeVarying();
				var temp:ShaderRegisterElement = this._registerCache.getFreeVertexVectorTemp();

				this._vertexCode += "m33 " + temp + ".xyz, " + this._sharedRegisters.animatedNormal + ", " + normalMatrix[0] + "\n" +
					"nrm " + this._sharedRegisters.animatedNormal + ".xyz, " + temp + "\n" +
					"m33 " + temp + ".xyz, " + this._sharedRegisters.animatedTangent + ", " + normalMatrix[0] + "\n" +
					"nrm " + this._sharedRegisters.animatedTangent + ".xyz, " + temp + "\n" +
					"mov " + this._sharedRegisters.tangentVarying + ".x, " + this._sharedRegisters.animatedTangent + ".x  \n" +
					"mov " + this._sharedRegisters.tangentVarying + ".z, " + this._sharedRegisters.animatedNormal + ".x  \n" +
					"mov " + this._sharedRegisters.tangentVarying + ".w, " + this._sharedRegisters.normalInput + ".w  \n" +
					"mov " + this._sharedRegisters.bitangentVarying + ".x, " + this._sharedRegisters.animatedTangent + ".y  \n" +
					"mov " + this._sharedRegisters.bitangentVarying + ".z, " + this._sharedRegisters.animatedNormal + ".y  \n" +
					"mov " + this._sharedRegisters.bitangentVarying + ".w, " + this._sharedRegisters.normalInput + ".w  \n" +
					"mov " + this._sharedRegisters.normalVarying + ".x, " + this._sharedRegisters.animatedTangent + ".z  \n" +
					"mov " + this._sharedRegisters.normalVarying + ".z, " + this._sharedRegisters.animatedNormal + ".z  \n" +
					"mov " + this._sharedRegisters.normalVarying + ".w, " + this._sharedRegisters.normalInput + ".w  \n" +
					"crs " + temp + ".xyz, " + this._sharedRegisters.animatedNormal + ", " + this._sharedRegisters.animatedTangent + "\n" +
					"mov " + this._sharedRegisters.tangentVarying + ".y, " + temp + ".x    \n" +
					"mov " + this._sharedRegisters.bitangentVarying + ".y, " + temp + ".y  \n" +
					"mov " + this._sharedRegisters.normalVarying + ".y, " + temp + ".z    \n";

				this._registerCache.removeVertexTempUsage(this._sharedRegisters.animatedTangent);

				//Compiles the fragment shader code for tangent-space normal maps.
				var t:ShaderRegisterElement;
				var b:ShaderRegisterElement;
				var n:ShaderRegisterElement;

				t = this._registerCache.getFreeFragmentVectorTemp();
				this._registerCache.addFragmentTempUsages(t, 1);
				b = this._registerCache.getFreeFragmentVectorTemp();
				this._registerCache.addFragmentTempUsages(b, 1);
				n = this._registerCache.getFreeFragmentVectorTemp();
				this._registerCache.addFragmentTempUsages(n, 1);

				this._fragmentCode += "nrm " + t + ".xyz, " + this._sharedRegisters.tangentVarying + "\n" +
					"mov " + t + ".w, " + this._sharedRegisters.tangentVarying + ".w	\n" +
					"nrm " + b + ".xyz, " + this._sharedRegisters.bitangentVarying + "\n" +
					"nrm " + n + ".xyz, " + this._sharedRegisters.normalVarying + "\n";

				//compile custom fragment code for normal calcs
				this._fragmentCode += this._renderPass._getNormalFragmentCode(this._registerCache, this._sharedRegisters) +
					"m33 " + this._sharedRegisters.normalFragment + ".xyz, " + this._sharedRegisters.normalFragment + ", " + t + "\n" +
					"mov " + this._sharedRegisters.normalFragment + ".w, " + this._sharedRegisters.normalVarying + ".w\n";

				this._registerCache.removeFragmentTempUsage(b);
				this._registerCache.removeFragmentTempUsage(t);
				this._registerCache.removeFragmentTempUsage(n);
			}
		} else {
			// no output, world space is enough
			this._vertexCode += "m33 " + this._sharedRegisters.normalVarying + ".xyz, " + this._sharedRegisters.animatedNormal + ", " + normalMatrix[0] + "\n" +
				"mov " + this._sharedRegisters.normalVarying + ".w, " + this._sharedRegisters.animatedNormal + ".w\n";

			this._fragmentCode += "nrm " + this._sharedRegisters.normalFragment + ".xyz, " + this._sharedRegisters.normalVarying + "\n" +
				"mov " + this._sharedRegisters.normalFragment + ".w, " + this._sharedRegisters.normalVarying + ".w\n";

			if (this._shader.tangentDependencies > 0) {
				this._sharedRegisters.tangentVarying = this._registerCache.getFreeVarying();

				this._vertexCode += "m33 " + this._sharedRegisters.tangentVarying + ".xyz, " + this._sharedRegisters.animatedTangent + ", " + normalMatrix[0] + "\n" +
					"mov " + this._sharedRegisters.tangentVarying + ".w, " + this._sharedRegisters.animatedTangent + ".w\n";
			}
		}

		if (!this._shader.usesTangentSpace)
			this._registerCache.removeVertexTempUsage(this._sharedRegisters.animatedNormal);
	}

	/**
	 * Reset all the indices to "unused".
	 */
	public pInitRegisterIndices():void
	{
		this._shader.pInitRegisterIndices();

		this._sharedRegisters.animatedPosition = this._registerCache.getFreeVertexVectorTemp();
		this._registerCache.addVertexTempUsages(this._sharedRegisters.animatedPosition, 1);

		this._sharedRegisters.animatableAttributes.push(this._registerCache.getFreeVertexAttribute());
		this._sharedRegisters.animationTargetRegisters.push(this._sharedRegisters.animatedPosition);
		this._vertexCode = "";
		this._fragmentCode = "";
		this._postAnimationFragmentCode = "";


		//create commonly shared constant registers
		if (this._shader.usesCommonData || this._shader.normalDependencies > 0) {
			this._sharedRegisters.commons = this._registerCache.getFreeFragmentConstant();
			this._shader.commonsDataIndex = this._sharedRegisters.commons.index*4;
		}

		//Creates the registers to contain the tangent data.
		//Needs to be created FIRST and in this order (for when using tangent space)
		if (this._shader.tangentDependencies > 0 || this._shader.outputsNormals) {
			this._sharedRegisters.tangentInput = this._registerCache.getFreeVertexAttribute();
			this._shader.tangentIndex = this._sharedRegisters.tangentInput.index;

			this._sharedRegisters.animatedTangent = this._registerCache.getFreeVertexVectorTemp();
			this._registerCache.addVertexTempUsages(this._sharedRegisters.animatedTangent, 1);

			if (this._shader.usesTangentSpace) {
				this._sharedRegisters.bitangent = this._registerCache.getFreeVertexVectorTemp();
				this._registerCache.addVertexTempUsages(this._sharedRegisters.bitangent, 1);
			}

			this._sharedRegisters.animatableAttributes.push(this._sharedRegisters.tangentInput);
			this._sharedRegisters.animationTargetRegisters.push(this._sharedRegisters.animatedTangent);
		}

		if (this._shader.normalDependencies > 0) {
			this._sharedRegisters.normalInput = this._registerCache.getFreeVertexAttribute();
			this._shader.normalIndex = this._sharedRegisters.normalInput.index;

			this._sharedRegisters.animatedNormal = this._registerCache.getFreeVertexVectorTemp();
			this._registerCache.addVertexTempUsages(this._sharedRegisters.animatedNormal, 1);

			this._sharedRegisters.animatableAttributes.push(this._sharedRegisters.normalInput);
			this._sharedRegisters.animationTargetRegisters.push(this._sharedRegisters.animatedNormal);
		}

		if (this._shader.colorDependencies > 0) {
			this._sharedRegisters.colorInput = this._registerCache.getFreeVertexAttribute();
			this._shader.colorBufferIndex = this._sharedRegisters.colorInput.index;

			this._sharedRegisters.colorVarying = this._registerCache.getFreeVarying();
			this._vertexCode += "mov " + this._sharedRegisters.colorVarying + ", " + this._sharedRegisters.colorInput + "\n";
		}
	}

	/**
	 * Disposes all resources used by the compiler.
	 */
	public dispose():void
	{
		this._registerCache.dispose();
		this._registerCache = null;
		this._sharedRegisters = null;
	}

	/**
	 * The generated vertex code.
	 */
	public get vertexCode():string
	{
		return this._vertexCode;
	}

	/**
	 * The generated fragment code.
	 */
	public get fragmentCode():string
	{
		return this._fragmentCode;
	}

	/**
	 * The generated fragment code.
	 */
	public get postAnimationFragmentCode():string
	{
		return this._postAnimationFragmentCode;
	}

	/**
	 * The shared registers.
	 */
	public get sharedRegisters():ShaderRegisterData
	{
		return this._sharedRegisters;
	}

	/**
	 * The shared registers.
	 */
	public get registerCache():ShaderRegisterCache
	{
		return this._registerCache;
	}
}