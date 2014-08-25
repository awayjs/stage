///<reference path="../../_definitions.ts"/>

module away.materials
{
	/**
	 * LineBasicPass is a material pass that draws wireframe segments.
	 */
	export class LineBasicPass extends MaterialPassBase
	{
		/**
		 * Creates a new SegmentPass object.
		 *
		 * @param material The material to which this pass belongs.
		 */
		constructor()
		{
			super();
		}

		/**
		 * @inheritDoc
		 */
		public _iGetFragmentCode(shaderObject:ShaderObjectBase, regCache:ShaderRegisterCache, sharedReg:ShaderRegisterData):string
		{
			var targetReg:ShaderRegisterElement = sharedReg.shadedTarget;

			return "mov " + targetReg + ", v0\n";
		}
	}
}