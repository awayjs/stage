import { ProjectionBase } from '@awayjs/core';

import { Filter3DTaskBase } from './tasks/Filter3DTaskBase';
import { RTTBufferManager } from '../managers/RTTBufferManager';
import { Stage } from '../Stage';
import { Image2D } from '../image/Image2D';
import { IContextGL } from '../base/IContextGL';
import { ContextWebGL } from '../webgl/ContextWebGL';

export class Filter3DBase {
	private _tasks: Array<Filter3DTaskBase> = [];
	private _requireDepthRender: boolean;
	private _rttManager: RTTBufferManager;
	private _textureWidth: number;
	private _textureHeight: number;
	private _textureScale: number = 1;

	protected _context: IContextGL;

	public get supportInstancing() {
		const w = <ContextWebGL> this._context;

		if (!w.hasInstansing) {
			return false;
		}

		// supported only for one tasked filters
		return this.tasks.length === 1 && this.tasks[0].supportInstancing;
	}

	public init(context: IContextGL) {
		this._context = context;
	}

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

	public getMainInputTexture(stage: Stage): Image2D {
		return this._tasks[0].getMainInputTexture(stage);
	}

	public get textureWidth(): number {
		return this._textureWidth;
	}

	public set textureWidth(value: number) {
		this._textureWidth = value;

		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].textureWidth = value;
	}

	public get rttManager(): RTTBufferManager {
		return this._rttManager;
	}

	public set rttManager(value: RTTBufferManager) {
		this._rttManager = value;

		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].rttManager = value;
	}

	public get textureHeight(): number {
		return this._textureHeight;
	}

	public set textureHeight(value: number) {
		this._textureHeight = value;

		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].textureHeight = value;
	}

	public get textureScale(): number {
		return this._textureScale;
	}

	public set textureScale(value: number) {
		this._textureScale = value;

		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].textureScale = value;
	}

	// link up the filters correctly with the next filter
	public setRenderTargets(mainTarget: Image2D, stage: Stage): void {
		this._tasks[this._tasks.length - 1].target = mainTarget;
	}

	public dispose(): void {
		for (let i: number = 0; i < this._tasks.length; ++i)
			this._tasks[i].dispose();
	}

	public update(stage: Stage, projection: ProjectionBase): void {

	}

}