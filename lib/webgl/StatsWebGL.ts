export class StatsWebGL  {
	public readonly counter = {
		index: 0,
		vertex: 0,
		vao: 0,
		texture: 0,
		renderTarget: 0,
		program: 0
	}

	public readonly memory = {
		index: 0,
		vertex: 0,
		texture: 0,
		renderTarget: 0,
	}

	public toTableLikeMB() {
		const report = {};

		for (const key in this.counter) {
			report[key] = {
				count: this.counter[key],
				memory: (this.memory[key] || 0) / (1024 * 1024)
			};
		}

		return report;
	}

	public toString() {
		const table = this.toTableLikeMB();
		const records = [
			`\n${'type'.padStart(16, ' ')} | ${'count'.padStart(6)} | ${'mem MB'.padStart(6)}\n`
		];

		for (const key in table) {
			records.push(
				// eslint-disable-next-line max-len
				`${key.padStart(16)} | ${table[key].count.toFixed().padStart(5)} | ${table[key].memory.toFixed(4).padStart(8)}`
			);
		}

		return records.join('\n') + '\n';
	}

	public toTableConsole() {
		console.table(this.toTableLikeMB());
	}
}