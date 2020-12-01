import { PixelBufferWebGL } from './PixelBufferWebGL';

type TPBOTask = (pbo: PixelBufferWebGL) => void;

const TICK_PERIOD = 10;

export class FenceContextWebGL {
	public static isSupported = PixelBufferWebGL.isSuported;

	private pool: PixelBufferWebGL[] = [];
	private _fence: WebGLSync;
	private _tickerId: number = -1;

	private _tasks: Array<{
		task: TPBOTask,
		pbo: PixelBufferWebGL
	}> = [];

	constructor(private _gl: WebGL2RenderingContext) {}

	/**
	 * Async read from PBO.
	 * @see http://www.songho.ca/opengl/gl_pbo.html
	 */
	public readPixels(x: number, y: number, width: number, height: number): Promise<PixelBufferWebGL> {

		const pbo = this.pool.pop() || new PixelBufferWebGL(this._gl);

		// only for RGBA
		pbo.bind(width * height * 4);

		const gl = this._gl;
		// read to PBO, this is asynce instruction
		gl.readPixels(x, y, width, height,gl.RGBA, gl.UNSIGNED_BYTE, 0);

		// return a promise that was used for requesting a data
		const p = new Promise((task: TPBOTask) => {
			this._tasks.push({ task, pbo });
		});

		if (!this._fence) {
			this._fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

			// if we will use sync every time - we will spam GPU,
			// need use something in between
			this._tickerId = setInterval(this.tick.bind(this), TICK_PERIOD);
		}

		return p;
	}

	public tick() {
		if (!this._fence) return;

		const gl = this._gl;
		const status = gl.getSyncParameter(this._fence, gl.SYNC_STATUS);

		if (status !== gl.SIGNALED) {
			return;
		}

		// stop ticker
		clearInterval(this._tickerId);
		this._tickerId = -1;

		// delete fence, it can be used once
		gl.deleteSync(this._fence);
		this._fence = null;

		for (const task of this._tasks) {
			task.task(task.pbo);
		}

		this._tasks.length = 0;
	}

	public release(pbo: PixelBufferWebGL) {
		// push a PBO back to pool;
		if (pbo.alive) {
			this.pool.push(pbo);
		}
	}

	dispose() {
		this._tasks = null;
		this.pool.forEach((e) => e.dispose());

		if (this._fence) {
			this._gl.deleteSync(this._fence);
			this._fence = null;
		}

		this._gl = null;
	}
}