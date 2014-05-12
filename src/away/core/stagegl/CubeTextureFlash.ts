///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import ByteArrayBase					= away.utils.ByteArrayBase;

	export class CubeTextureFlash extends ResourceBaseFlash implements ICubeTexture
	{
		private _context:ContextStage3D;
		private _size:number;

		public get size():number
		{
			return this._size;
		}

		constructor(context:ContextStage3D, size:number, format:string, forRTT:boolean, streaming:boolean = false)
		{
			super();

			this._context = context;
			this._size = size;

			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initCubeTexture, (forRTT? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue)) + size + "," + streaming + "," + format + "$");
			this._pId = this._context.execute();
			this._context._iAddResource(this);
		}

		public dispose()
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeCubeTexture) + this._pId.toString() + ",");
			this._context.execute();
			this._context._iRemoveResource(this);

			this._context = null;
		}

		public uploadFromData(bitmapData:away.base.BitmapData, side:number, miplevel?:number);
		public uploadFromData(image:HTMLImageElement, side:number, miplevel?:number);
		public uploadFromData(data:any, side:number, miplevel:number = 0)
		{
			if (data instanceof away.base.BitmapData) {
				data = (<away.base.BitmapData> data).imageData.data;
			} else if (data instanceof HTMLImageElement) {
				var can = document.createElement("canvas");
				var w = data.width;
				var h = data.height;
				can.width = w;
				can.height = h;
				var ctx = can.getContext("2d");
				ctx.drawImage(data, 0, 0);
				data = ctx.getImageData(0, 0, w, h).data;
			}

			var pos = 0;
			var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
				return data[pos++];
			}, null);

			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadBytesCubeTexture) + this._pId + "," + miplevel + "," + side + "," + (this.size >> miplevel) + "," + bytes + "%");
			this._context.execute();
		}

		public uploadCompressedTextureFromByteArray(data:away.utils.ByteArray, byteArrayOffset:number /*uint*/, async:boolean = false)
		{

		}
	}
}