export class BlendModeSoftware
{
	public static destinationAlpha(result:Uint8ClampedArray, target:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void {
		result[0] = target[0] * dest[3] / 0xFF;
		result[1] = target[1] * dest[3] / 0xFF;
		result[2] = target[2] * dest[3] / 0xFF;
		result[3] = target[3] * dest[3] / 0xFF;
	}


	public static destinationColor(result:Uint8ClampedArray, target:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void {
		result[0] = target[0] * dest[0] / 0xFF;
		result[1] = target[1] * dest[1] / 0xFF;
		result[2] = target[2] * dest[2] / 0xFF;
		result[3] = target[3] * dest[3] / 0xFF;
	}

	public static one(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0];
		result[1] = target[1];
		result[2] = target[2];
		result[3] = target[3];
	}

	public static oneMinusDestinationAlpha(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * (1 - dest[3] / 0xFF);
		result[1] = target[1] * (1 - dest[3] / 0xFF);
		result[2] = target[2] * (1 - dest[3] / 0xFF);
		result[3] = target[3] * (1 - dest[3] / 0xFF);
	}

	public static oneMinusDestinationColor(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * (1 - dest[0] / 0xFF);
		result[1] = target[1] * (1 - dest[1] / 0xFF);
		result[2] = target[2] * (1 - dest[2] / 0xFF);
		result[3] = target[3] * (1 - dest[3] / 0xFF);
	}

	public static oneMinusSourceAlpha(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * (1 - source[3] / 0xFF);
		result[1] = target[1] * (1 - source[3] / 0xFF);
		result[2] = target[2] * (1 - source[3] / 0xFF);
		result[3] = target[3] * (1 - source[3] / 0xFF);
	}

	public static oneMinusSourceColor(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * (1 - source[0] / 0xFF);
		result[1] = target[1] * (1 - source[1] / 0xFF);
		result[2] = target[2] * (1 - source[2] / 0xFF);
		result[3] = target[3] * (1 - source[3] / 0xFF);
	}

	public static sourceAlpha(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * source[3] / 0xFF;
		result[1] = target[1] * source[3] / 0xFF;
		result[2] = target[2] * source[3] / 0xFF;
		result[3] = target[3] * source[3] / 0xFF;
	}

	public static sourceColor(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] = target[0] * source[0] / 0xFF;
		result[1] = target[1] * source[1] / 0xFF;
		result[2] = target[2] * source[2] / 0xFF;
		result[3] = target[3] * source[3] / 0xFF;
	}

	public static zero(result: Uint8ClampedArray, target:Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
	}
}