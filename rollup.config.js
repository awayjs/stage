import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
	input: './dist/index.js',
	output: {
		name: 'AwayjsStage',
		globals: {
			'@awayjs/core': 'AwayjsCore'
		},
		sourcemap: true,
		format: 'umd',
		file: './bundle/awayjs-stage.umd.js'
	},
	external: [
		'@awayjs/core'
	],
	plugins: [
		nodeResolve(),
		commonjs(),
		terser(),
	]
};