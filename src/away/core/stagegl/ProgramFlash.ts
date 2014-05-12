///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import ByteArray				= away.utils.ByteArray;

	export class ProgramFlash extends ResourceBaseFlash implements IProgram
	{
		private _context:ContextStage3D;

		constructor(context:ContextStage3D)
		{
			super();

			this._context = context;
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initProgram));
			this._pId = this._context.execute();
			this._context._iAddResource(this);
		}

		public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray)
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadAGALBytesProgram, this._pId + away.stagegl.OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");

			if (ContextStage3D.debug)
				this._context.execute();
		}

		public dispose()
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeProgram, this._pId + away.stagegl.OpCodes.intMask));
			this._context.execute();
			this._context._iRemoveResource(this);

			this._context = null;
		}
	}
}