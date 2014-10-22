import ByteArray				= require("awayjs-core/lib/utils/ByteArray");

class Part
{
	public name:string = "";
	public version:number = 0;
	public data:ByteArray;

	constructor(name:string = null, version:number = null)
	{
		this.name = name;
		this.version = version;
		this.data = new ByteArray();
	}
}

export = Part;