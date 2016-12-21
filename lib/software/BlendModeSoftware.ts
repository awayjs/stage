export class BlendModeSoftware
{
	public static destinationAlpha(result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void {
		result[0] += source[0]*dest[3]/0xFF;
		result[1] += source[1]*dest[3]/0xFF;
		result[2] += source[2]*dest[3]/0xFF;
		result[3] += source[3]*dest[3]/0xFF;
	}


	public static destinationColor(result:Uint8ClampedArray, dest:Uint8ClampedArray, source:Uint8ClampedArray):void {
		result[0] += source[0]*dest[0]/0xFF;
		result[1] += source[1]*dest[1]/0xFF;
		result[2] += source[2]*dest[2]/0xFF;
		result[3] += source[3]*dest[3]/0xFF;
	}

	public static one(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += source[0];
		result[1] += source[1];
		result[2] += source[2];
		result[3] += source[3];
	}

	public static oneMinusDestinationAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += source[0]*(1 - dest[3]/0xFF);
		result[1] += source[1]*(1 - dest[3]/0xFF);
		result[2] += source[2]*(1 - dest[3]/0xFF);
		result[3] += source[3]*(1 - dest[3]/0xFF);
	}

	public static oneMinusDestinationColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += source[0]*(1 - dest[0]/0xFF);
		result[1] += source[1]*(1 - dest[1]/0xFF);
		result[2] += source[2]*(1 - dest[2]/0xFF);
		result[3] += source[3]*(1 - dest[3]/0xFF);
	}

	public static oneMinusSourceAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += dest[0]*(1 - source[3]/0xFF);
		result[1] += dest[1]*(1 - source[3]/0xFF);
		result[2] += dest[2]*(1 - source[3]/0xFF);
		result[3] += dest[3]*(1 - source[3]/0xFF);
	}

	public static oneMinusSourceColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += dest[0]*(1 - source[0]/0xFF);
		result[1] += dest[1]*(1 - source[1]/0xFF);
		result[2] += dest[2]*(1 - source[2]/0xFF);
		result[3] += dest[3]*(1 - source[3]/0xFF);
	}

	public static sourceAlpha(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += dest[0]*source[3]/0xFF;
		result[1] += dest[1]*source[3]/0xFF;
		result[2] += dest[2]*source[3]/0xFF;
		result[3] += 0xFF;
	}

	public static sourceColor(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
		result[0] += dest[0]*source[0]/0xFF;
		result[1] += dest[1]*source[1]/0xFF;
		result[2] += dest[2]*source[2]/0xFF;
		result[3] += dest[3]*source[3]/0xFF;
	}

	public static zero(result: Uint8ClampedArray, dest: Uint8ClampedArray, source: Uint8ClampedArray):void {
	}
}