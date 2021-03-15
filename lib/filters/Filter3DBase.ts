import { ProjectionBase, Rectangle } from '@awayjs/core';

import { Filter3DTaskBase } from './tasks/Filter3DTaskBase';
import { Stage } from '../Stage';
import { Image2D } from '../image/Image2D';
import { FilterManager } from '../managers/FilterManager';

export class Filter3DBase {
	private _tasks: Array<Filter3DTaskBase> = [];
	private _requireDepthRender: boolean;
	protected _temp: Image2D[] = [];

	public get requireDepthRender(): boolean {
		return this._requireDepthRender;
	}

	public addTask(filter: Filter3DTaskBase): void {
		this._tasks.push(filter);

		if (this._requireDepthRender == null)
			this._requireDepthRender = filter.requireDepthRender;
	}

	public get tasks(): Filter3DTaskBase[] {
		return this._tasks;
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