import { ContextGLES } from './ContextGLES';

export class GLESAssetBase {

	private _id: number;
	public _context: ContextGLES;

	constructor(context: ContextGLES, id: number) {
		this._context = context;
		this._id = id;
	}

	public get id(): number {
		return this._id;
	}

}