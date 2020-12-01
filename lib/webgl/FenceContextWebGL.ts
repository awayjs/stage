import { PixelBufferWebGL } from './PixelBufferWebGL';

type TPBOTask = (pbo: PixelBufferWebGL) => void;

const TICK_PERIOD = 10;

export class FenceContextWebGL {
	public static isSupported = PixelBufferWebGL.isSuported;

	private pool: PixelBufferWebGL[] = [];
	private _tickerId: number = -1;

	private _tasks: Array<{
		task: TPBOTask,
		pbo: PixelBufferWebGL,
		fence: WebGLSync
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

		const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

		// return a promise that was used for requesting a data
		const p = new Promise((task: TPBOTask) => {
			this._tasks.push({ task, pbo, fence });
		});

		if (this._tickerId === -1) {
			// if we will use sync every time - we will spam GPU,
			// need use something in between
			this._tickerId = setInterval(this.tick.bind(this), TICK_PERIOD);
		}

		return p;
	}

	public tick() {
		if (this._tasks.length === 0) return;

		const gl = this._gl;
		const tasks = this._tasks;

		for (let i = 0; i < this._tasks.length; i++) {
			const t = tasks[i];

			if (gl.getSyncParameter(t.fence, gl.SYNC_STATUS) === gl.SIGNALED) {
				t.task(t.pbo);
				gl.deleteSync(t.fence);

				tasks[i] = undefined;
			}
		}

		this._tasks = tasks.filter(e => !!e);

		if (this._tasks.length === 0) {
			// stop ticker
			clearInterval(this._tickerId);
			this._tickerId = -1;
		}
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
		this._gl = null;
	}
}