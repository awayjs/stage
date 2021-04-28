import { ProjectionBase, Rectangle } from '@awayjs/core';

import { TaskBase } from './tasks/TaskBase';
import { Stage } from '../Stage';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';
import { ContextGLBlendFactor } from '../base/ContextGLBlendFactor';

export class FilterBase {
	private _tasks: Array<TaskBase> = [];
	private _requireDepthRender: boolean;
	protected _temp: Image2D[] = [];

	public imageScale: number = 1;

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

	public get tasks(): TaskBase[] {
		return this._tasks;
	}

	public meashurePad(input: Rectangle, target: Rectangle = input.clone()): Rectangle {
		target.copyFrom(input);
		return target;
	}

	// link up the filters correctly with the next filter
	public setRenderState (
		source: Image2D,
		mainTarget: Image2D,
		sourceRect: Rectangle,
		destRect: Rectangle,
		filterManage: FilterManager
	): void {
		this._tasks[0].inputRect = sourceRect;
		this._tasks[0].source = source;

		this._tasks[this._tasks.length - 1].destRect = destRect;
		this._tasks[this._tasks.length - 1].target = mainTarget;
	}

	public dispose(): void {
		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].dispose();
	}

	public update(stage: Stage, projection: ProjectionBase): void {

	}

	public clear (_manage: FilterManager) {
		this._temp.forEach((e) =>  _manage.pushTemp(e));
		this._temp.length = 0;
	}
}