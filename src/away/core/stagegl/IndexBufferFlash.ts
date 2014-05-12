///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	export class IndexBufferFlash extends ResourceBaseFlash implements IIndexBuffer
	{
		private _context:ContextStage3D;
		private _numIndices:number;

		constructor(context:ContextStage3D, numIndices:number)
		{
			super();

			this._context = context;
			this._numIndices = numIndices;
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initIndexBuffer, numIndices + away.stagegl.OpCodes.intMask));
			this._pId = this._context.execute();
			this._context._iAddResource(this);
		}

		public uploadFromArray(data:number[], startOffset:number, count:number):void
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadArrayIndexBuffer, this._pId + away.stagegl.OpCodes.intMask) + data.join() + "#" + startOffset + "," + count + ",");
			this._context.execute();
		}

		public dispose():void
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeIndexBuffer, this._pId + away.stagegl.OpCodes.intMask));
			this._context.execute();
			this._context._iRemoveResource(this);

			this._context = null;
		}

		public get numIndices():number
		{
			return this._numIndices;
		}
	}
}