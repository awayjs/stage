///<reference path="../_definitions.ts"/>

module away.managers
{
	import Stage							= away.base.Stage;
	import StageEvent						= away.events.StageEvent;
	import AGALProgramCache					= away.managers.AGALProgramCache;
	import IContextStageGL					= away.stagegl.IContextStageGL;
	import ByteArray						= away.utils.ByteArray;

	export class AGALProgramCache
	{
		private static _instances:AGALProgramCache[];

		private _stage:Stage;

		private _program3Ds:Object;
		private _ids:Object;
		private _usages:Object;
		private _keys:Object;

		private _onContextGLDisposedDelegate:Function;

		private static _currentId:number = 0;

		constructor(stage:Stage, agalProgramCacheSingletonEnforcer:AGALProgramCacheSingletonEnforcer)
		{
			if (!agalProgramCacheSingletonEnforcer)
				throw new Error("This class is a multiton and cannot be instantiated manually. Use StageManager.getInstance instead.");

			this._stage = stage;

			this._program3Ds = new Object();
			this._ids = new Object();
			this._usages = new Object();
			this._keys = new Object();
		}

		public static getInstance(stage:Stage):away.managers.AGALProgramCache
		{
			var index:number = stage.stageIndex;

			if (AGALProgramCache._instances == null)
				AGALProgramCache._instances = new Array<AGALProgramCache>(8);


			if (!AGALProgramCache._instances[index]) {
				AGALProgramCache._instances[index] = new AGALProgramCache(stage, new AGALProgramCacheSingletonEnforcer());

				stage.addEventListener(StageEvent.CONTEXT_DISPOSED, AGALProgramCache.onContextGLDisposed);
				stage.addEventListener(StageEvent.CONTEXT_CREATED, AGALProgramCache.onContextGLDisposed);
				stage.addEventListener(StageEvent.CONTEXT_RECREATED, AGALProgramCache.onContextGLDisposed);
			}

			return AGALProgramCache._instances[index];

		}

		public static getInstanceFromIndex(index:number):away.managers.AGALProgramCache
		{
			if (!AGALProgramCache._instances[index])
				throw new Error("Instance not created yet!");

			return AGALProgramCache._instances[index];
		}

		private static onContextGLDisposed(event:StageEvent)
		{
			var stage:Stage = <Stage> event.target;

			var index:number = stage.stageIndex;

			AGALProgramCache._instances[index].dispose();
			AGALProgramCache._instances[index] = null;

			stage.removeEventListener(StageEvent.CONTEXT_DISPOSED, AGALProgramCache.onContextGLDisposed);
			stage.removeEventListener(StageEvent.CONTEXT_CREATED, AGALProgramCache.onContextGLDisposed);
			stage.removeEventListener(StageEvent.CONTEXT_RECREATED, AGALProgramCache.onContextGLDisposed);

		}

		public dispose()
		{
			for (var key in this._program3Ds)
				this.destroyProgram(key);

			this._keys = null;
			this._program3Ds = null;
			this._usages = null;
		}

		public setProgram(programIds:Array<number>, programs:Array<away.stagegl.IProgram>, vertexCode:string, fragmentCode:string)
		{
			//TODO move program id arrays into stagegl
			var stageIndex:number = this._stage.stageIndex;
			var program:away.stagegl.IProgram;
			var key:string = this.getKey(vertexCode, fragmentCode);

			if (this._program3Ds[key] == null) {
				this._keys[AGALProgramCache._currentId] = key;
				this._usages[AGALProgramCache._currentId] = 0;
				this._ids[key] = AGALProgramCache._currentId;
				++AGALProgramCache._currentId;

				program = (<IContextStageGL> this._stage.context).createProgram();

				var vertexByteCode:ByteArray = (new aglsl.assembler.AGALMiniAssembler().assemble("part vertex 1\n" + vertexCode + "endpart"))['vertex'].data;
				var fragmentByteCode:ByteArray = (new aglsl.assembler.AGALMiniAssembler().assemble("part fragment 1\n" + fragmentCode + "endpart"))['fragment'].data;
				program.upload(vertexByteCode, fragmentByteCode);

				this._program3Ds[key] = program;
			}

			var oldId:number = programIds[stageIndex];
			var newId:number = this._ids[key];

			if (oldId != newId) {
				if (oldId >= 0)
					this.freeProgram(oldId);

				this._usages[newId]++;
			}

			programIds[stageIndex] = newId;
			programs[stageIndex] = this._program3Ds[key];
		}

		public freeProgram(programId:number)
		{
			this._usages[programId]--;

			if (this._usages[programId] == 0)
				this.destroyProgram(this._keys[programId]);
		}

		private destroyProgram(key:string)
		{
			this._program3Ds[key].dispose();
			this._program3Ds[key] = null;

			delete this._program3Ds[key];

			this._ids[key] = -1;
		}

		private getKey(vertexCode:string, fragmentCode:string):string
		{
			return vertexCode + "---" + fragmentCode;
		}
	}
}

class AGALProgramCacheSingletonEnforcer
{
}