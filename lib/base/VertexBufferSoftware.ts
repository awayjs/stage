import IVertexBuffer                = require("awayjs-stagegl/lib/base/IVertexBuffer");

class VertexBufferSoftware implements IVertexBuffer {
    private _numVertices:number;
    private _dataPerVertex:number;
    private _data:Float32Array;
    private _dataOffset:number;

    constructor(numVertices:number, dataPerVertex:number) {
        this._numVertices = numVertices;
        this._dataPerVertex = dataPerVertex;
    }

    public uploadFromArray(vertices:number[], startVertex:number, numVertices:number) {
        this._dataOffset = startVertex * this._dataPerVertex;
        this._data = new Float32Array(vertices);
    }


    public uploadFromByteArray(data:ArrayBuffer, startVertex:number, numVertices:number) {
        this._dataOffset = startVertex * this._dataPerVertex;
        this._data = new Float32Array(data);
    }

    public get numVertices():number {
        return this._numVertices;
    }

    public get dataPerVertex():number {
        return this._dataPerVertex;
    }

    public get attributesPerVertex():number {
        return this._dataPerVertex/4;
    }

    public dispose() {
        this._data.length = 0;
    }

    public get data():Float32Array {
        return this._data;
    }

    public get dataOffset():number {
        return this._dataOffset;
    }
}

export = VertexBufferSoftware;