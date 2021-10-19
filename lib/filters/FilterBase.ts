import { ProjectionBase, Rectangle } from '@awayjs/core';

import { TaskBase } from './tasks/TaskBase';
import { Stage } from '../Stage';
import { Image2D } from '../image';
import { FilterManager } from '../managers/FilterManager';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';
import { ContextGLTriangleFace } from '../base/ContextGLTriangleFace';
import { ContextGLClearMask } from '../base/ContextGLClearMask';
import { ContextWebGL } from '../webgl/ContextWebGL';

export class FilterBase {
	private _tasks: Array<TaskBase> = [];
	private _requireDepthRender: boolean;
	protected _temp: Image2D[] = [];
	protected _activeTaskIndex: number = -1;

	public get isValid() {
		for (const t of this._tasks) {
			if (!t.isValid) {
				return false;
			}
		}

		return true;
	}

	public imageScale: number;

	public get requireBlend() {
		return false;
	}

	public get blendDst(): ContextGLBlendFactor {
		return ContextGLBlendFactor.ZERO;
	}

	public get blendSrc(): ContextGLBlendFactor {
		return ContextGLBlendFactor.ONE;
	}

	public get requireDepthRender(): boolean {
		return this._requireDepthRender;
	}

	public addTask(filter: TaskBase): void {
		this._tasks.push(filter);

		if (this._requireDepthRender == null)
			this._requireDepthRender = filter.requireDepthRender;
	}

	public removeTask(filter: TaskBase): void {
		const index = this._tasks.indexOf(filter);
		if (index === -1) {
			return;
		}

		this._tasks.slice(index, 1);
	}

	/**
	 * Query next task while this possible, real task-passes can be greater that task count (multipassed blur)
	 */
	public nextTask(): TaskBase | null {
		return this._activeTaskIndex < this._tasks.length
			? this._tasks[++this._activeTaskIndex]
			: null;
	}

	public hasNextTask() {
		return this._tasks.length < this._activeTaskIndex;
	}

	public meashurePad(input: Rectangle, target: Rectangle = input.clone()): Rectangle {
		if (input === target)
			return  target;
		target.copyFrom(input);
		return target;
	}

	public apply(
		source: Image2D,
		target: Image2D,
		sourceRect: Rectangle,
		destRect: Rectangle,
		filterManager: FilterManager,
		clearOutput: boolean = false,
	) {
		const stage = filterManager.stage;
		const context = <ContextWebGL>stage.context;

		this.setRenderState(
			source, target,
			sourceRect, destRect,
			filterManager
		);

		// context will enable blend when it was changed
		context.setBlendFactors(this.blendSrc, this.blendDst);
		context.setBlendState(this.requireBlend);
		context.setCulling(ContextGLTriangleFace.NONE);

		let task: TaskBase;

		// iterate while filter have tasks
		while ((task = this.nextTask())) {
			task.preActivate(filterManager.stage);

			stage.setRenderTarget(task.target, false, 0, 0, true);
			stage.setScissor(task.clipRect);

			// because we use TMP image, need clear it
			// but this is needed only when a blend composer is required, when a copy filter used
			// or when required by filter chain, clear output for end task
			if (source === target && this.requireBlend || task.needClear || clearOutput && !this.hasNextTask()) {
				context.clear(0,0,0,0,0,0, ContextGLClearMask.ALL);
			}

			filterManager.drawTask(task);
		}

		this.clear(filterManager);
	}

	// link up the filters correctly with the next filter
	public setRenderState (
		source: Image2D,
		mainTarget: Image2D,
		sourceRect: Rectangle,
		destRect: Rectangle,
		filterManager: FilterManager
	): void {
		this._activeTaskIndex = -1;
		this._tasks[0].inputRect = sourceRect;
		this._tasks[0].source = source;

		this._tasks[this._tasks.length - 1].destRect = destRect;
		this._tasks[this._tasks.length - 1].target = mainTarget;
	}

	public dispose(): void {
		for (const task of this._tasks) {
			task.dispose();
		}

		this._tasks.length = 0;
	}

	public update(_stage: Stage, _projection: ProjectionBase): void {

	}

	public clear (_manager: FilterManager) {
		for (const image of this._temp) {
			_manager.pushTemp(image);
		}
		this._temp.length = 0;
		this._activeTaskIndex = -1;

		this.imageScale = 1;
	}
}