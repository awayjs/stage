import Vector3D						from "awayjs-core/lib/geom/Vector3D";

class ProgramVOSoftware
{
	public outputPosition:Vector3D[] = [];
	public outputColor:Vector3D[] = [];
	public outputDepth:number;
	public varying:Vector3D[] = [];
	public derivativeX:Vector3D[] = [];
	public derivativeY:Vector3D[] = [];
	public temp:Vector3D[] = [];
	public attributes:Vector3D[] = [];
	public discard:boolean = false;
}

export default ProgramVOSoftware;