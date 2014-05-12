///<reference path="../../_definitions.ts"/>

module away.stagegl
{

	export class VertexBufferFlash extends ResourceBaseFlash implements IVertexBuffer
	{
		private _context:ContextStage3D;
		private _numVertices:number;
		private _data32PerVertex:number;

		constructor(context:ContextStage3D, numVertices:number, data32PerVertex:number)
		{
			super();

			this._context = context;
			this._numVertices = numVertices;
			this._data32PerVertex = data32PerVertex;
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initVertexBuffer, data32PerVertex + away.stagegl.OpCodes.intMask) + numVertices.toString() + ",");
			this._pId = this._context.execute();
			this._context._iAddResource(this);
		}

		public uploadFromArray(data:number[], startVertex:number, numVertices:number)
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadArrayVertexBuffer, this._pId + away.stagegl.OpCodes.intMask) + data.join() + "#" + [startVertex, numVertices].join() + ",");
			this._context.execute();
		}

		public get numVertices():number
		{
			return this._numVertices;
		}

		public get data32PerVertex():number
		{
			return this._data32PerVertex;
		}

		public dispose()
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeVertexBuffer, this._pId + away.stagegl.OpCodes.intMask));
			this._context.execute();
			this._context._iRemoveResource(this);

			this._context = null;
		}
	}
}