import { ContextWebGL } from './ContextWebGL';
import { PixelBufferWebGL } from './PixelBufferWebGL';

type TPBOTask = (pbo: PixelBufferWebGL) => void;

export class FenceContextWebGL {
	public static isSupported = PixelBufferWebGL.isSuported;

	private _gl: WebGL2RenderingContext;
	private pool: PixelBufferWebGL[] = [];

	private _tasks: Array<{
		task: TPBOTask,
		pbo: PixelBufferWebGL,
		fence: WebGLSync
	}> = [];

	constructor(private _context: ContextWebGL) {
		this._gl = <WebGL2RenderingContext> _context._gl;
	}

	/**
	 * Async read from PBO.
	 * @see http://www.songho.ca/opengl/gl_pbo.html
	 */
	public readPixels(x: number, y: number, width: number, height: number): Promise<PixelBufferWebGL> {

		const pbo = this.pool.pop() || new PixelBufferWebGL(this._context);

		// only for RGBA
		pbo.bind(width * height * 4);

		const gl = this._gl;
		// read to PBO, this is asynce instruction
		gl.readPixels(x, y, width, height,gl.RGBA, gl.UNSIGNED_BYTE, 0);

		const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

		if (!gl.isSync(fence)) {
			console.warn('[FenceContextWebGL] Fence return invalid state, closig task immediate:', fence);
			return Promise.resolve(pbo);
		}

		// return a promise that was used for requesting a data
		const p = new Promise((task: TPBOTask) => {
			this._tasks.push({ task, pbo, fence });
		});

		return p;
	}

	public tick() {
		if (this._tasks.length === 0) return;

		const gl = this._gl;
		const tasks = this._tasks;
		this._tasks = [];

		for (let i = 0; i < tasks.length; i++) {
			const t = tasks[i];

			let closeTask = false;

			if (!gl.isSync(t.fence)) {
				console.warn('[FenceContextWebGL] Task has invalid fence state, closig task immediate:', t.fence);
				closeTask = true;
			}

			if (closeTask || gl.getSyncParameter(t.fence, gl.SYNC_STATUS) === gl.SIGNALED) {
				t.task(t.pbo);
				gl.deleteSync(t.fence);

				tasks[i] = undefined;
			} else {
				this._tasks.push(t);
			}
		}
	}

	public release(pbo: PixelBufferWebGL) {
		// push a PBO back to pool;
		if (pbo.alive) {
			this.pool.push(pbo);
		}
	}

	unboundAll () {
		PixelBufferWebGL.unboundAll();
	}

	dispose() {
		this._tasks = null;
		this.pool.forEach((e) => e.dispose());
		this.pool = [];
		this._gl = null;
	}
}