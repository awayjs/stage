export class DepthCompareModeSoftware
{
	public static always(fragDepth:number, currentDepth:number):boolean
	{
		return true;
	}

	public static equal(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth == currentDepth;
	}

	public static greater(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth > currentDepth;
	}

	public static greaterEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth >= currentDepth;
	}

	public static less(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth < currentDepth;
	}

	public static lessEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth <= currentDepth;
	}

	public static never(fragDepth:number, currentDepth:number):boolean
	{
		return false;
	}

	public static notEqual(fragDepth:number, currentDepth:number):boolean
	{
		return fragDepth != currentDepth;
	}
}
