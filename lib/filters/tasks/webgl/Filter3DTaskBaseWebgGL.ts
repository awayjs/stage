import { Filter3DTaskBase } from '../Filter3DTaskBase';
import { Stage } from '../../../Stage';
import { ProgramWebGL } from '../../../webgl/ProgramWebGL';

export class Filter3DTaskBaseWebGL extends Filter3DTaskBase
{
	public updateProgram(stage:Stage):void
	{
		if (this._program3D)
			this._program3D.dispose();

		this._program3D = stage.context.createProgram();
		this._registerCache.reset();
		
		this._program3D.name = (<any>this.constructor).name;
		(<ProgramWebGL>this._program3D).uploadRaw(
			this.getVertexCode(), 
			this.getFragmentCode());
		this._program3DInvalid = false;
	}
}