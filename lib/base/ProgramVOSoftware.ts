import Vector3D                        = require("awayjs-core/lib/geom/Vector3D");

class ProgramVOSoftware {
    public outputPosition:Vector3D[] = [];
    public outputColor:Vector3D[] = [];
    public varying:Vector3D[] = [];
    public temp:Vector3D[] = [];
    public attributes:Vector3D[] = [];
    public discard:boolean = false;
}

export = ProgramVOSoftware;